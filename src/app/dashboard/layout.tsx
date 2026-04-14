import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import RenewalBanner from '@/components/layout/RenewalBanner';
import BottomNav from '@/components/BottomNav';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Ensure profile exists (fallback if auth trigger didn't fire)
    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        const { data: freePlan } = await (supabase.from('plans') as any).select('id').eq('name', 'free').single();
        await (supabase.from('profiles') as any).upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || null,
            plan_id: freePlan?.id || null,
        }, { onConflict: 'id' });
        const { data: retryProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = retryProfile;
    }

    const userProfile = profile as any;

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <TopBar />
                <RenewalBanner 
                    paymentMethod={userProfile?.payment_method || null} 
                    planExpiresAt={userProfile?.plan_expires_at || null} 
                    subscriptionStatus={userProfile?.subscription_status || null}
                />
                {children}
            </main>
            <BottomNav />
        </div>
    );

}
