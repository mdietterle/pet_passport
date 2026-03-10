import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single() as { data: { is_admin: boolean } | null };

    if (!profile?.is_admin) redirect('/dashboard');

    return (
        <div className="layout">
            <AdminSidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
