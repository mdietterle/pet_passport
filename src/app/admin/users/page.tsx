import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UsersTable from '@/components/admin/UsersTable';

export default async function AdminUsersPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch all profiles with a join to plans and auth.users email via view
    // We use a raw query via rpc or select from profiles + join plans
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, subscription_status, is_admin, created_at, plan_id, plans(id, display_name)')
        .order('created_at', { ascending: false });

    // Fetch emails from auth — requires service role; we'll use the anon key info from profiles only
    // and show a note that emails require service role
    const { data: plans } = await supabase
        .from('plans')
        .select('id, display_name')
        .order('sort_order');

    // Map profiles to include email placeholder
    const users = (profiles ?? []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        email: '(email via service role)',
        subscription_status: p.subscription_status,
        is_admin: p.is_admin,
        created_at: p.created_at,
        plans: p.plans ?? null,
    }));

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Usuários</h1>
                <p className="page-subtitle">{users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="card">
                <UsersTable users={users} plans={plans ?? []} />
            </div>
        </div>
    );
}
