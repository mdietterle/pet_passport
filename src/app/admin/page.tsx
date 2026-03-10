import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Users, PawPrint, CreditCard, ShieldCheck } from 'lucide-react';

export default async function AdminDashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Totals
    const [{ count: userCount }, { count: petCount }, { data: plansData }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('pets').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('plans').select('id, display_name, name').order('sort_order'),
    ]);

    const plans = plansData as any[] | null;

    // Users per plan
    const planCounts: Record<string, number> = {};
    if (plans) {
        for (const plan of plans) {
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('plan_id', plan.id);
            planCounts[plan.id] = count ?? 0;
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <ShieldCheck size={24} style={{ color: '#ef4444' }} />
                    <h1 className="page-title">Painel Administrativo</h1>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="stat-card">
                    <div className="stat-icon"><Users size={20} /></div>
                    <div className="stat-value">{userCount ?? 0}</div>
                    <div className="stat-label">Usuários</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><PawPrint size={20} /></div>
                    <div className="stat-value">{petCount ?? 0}</div>
                    <div className="stat-label">Pets ativos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><CreditCard size={20} /></div>
                    <div className="stat-value">{plans?.length ?? 0}</div>
                    <div className="stat-label">Planos</div>
                </div>
            </div>

            {/* Distribuição de planos */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Distribuição por Plano</h2>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Plano</th>
                                <th>Usuários</th>
                                <th>% do total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(plans ?? []).map((plan) => {
                                const count = planCounts[plan.id] ?? 0;
                                const pct = userCount ? Math.round((count / userCount) * 100) : 0;
                                return (
                                    <tr key={plan.id}>
                                        <td style={{ fontWeight: 600 }}>{plan.display_name}</td>
                                        <td>{count}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                <div className="progress-bar" style={{ flex: 1, maxWidth: 120 }}>
                                                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
