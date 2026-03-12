import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import RenewalBanner from '@/components/layout/RenewalBanner';

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

    const { data: profile } = await supabase
        .from('profiles')
        .select('payment_method, plan_expires_at, subscription_status')
        .eq('id', user.id)
        .single();

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
        </div>
    );
}
