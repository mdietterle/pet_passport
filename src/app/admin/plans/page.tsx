import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PlansEditor from '@/components/admin/PlansEditor';

export default async function AdminPlansPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: plans } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Planos</h1>
                <p className="page-subtitle">Edite os planos do sistema. Campos vazios nos limites significam sem restrição.</p>
            </div>
            <PlansEditor plans={plans ?? []} />
        </div>
    );
}
