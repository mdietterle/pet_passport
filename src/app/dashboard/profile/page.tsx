import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CreditCard } from 'lucide-react';
import ProfileEditor from '@/components/ProfileEditor';

export default async function ProfilePage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profileRaw } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', user.id)
        .single();

    const profile = profileRaw as any;
    const plan = profile?.plans;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Meu Perfil</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 560 }}>
                {/* Personal info card — now includes avatar + name editing */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Informações pessoais</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <ProfileEditor
                            userId={user.id}
                            initialName={profile?.full_name ?? null}
                            initialAvatarUrl={profile?.avatar_url ?? null}
                            initialCellphone={profile?.cellphone ?? null}
                            initialTaxId={profile?.tax_id ?? null}
                            email={user.email ?? ''}
                        />

                        <div>
                            <div className="form-label">Email</div>
                            <div style={{ marginTop: 4, color: 'var(--color-text)' }}>{user.email}</div>
                        </div>
                        <div>
                            <div className="form-label">Membro desde</div>
                            <div style={{ marginTop: 4, color: 'var(--color-text-secondary)' }}>
                                {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plan card */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title"><CreditCard size={18} /> Plano atual</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{plan?.display_name || 'Gratuito'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                {plan?.price_brl === 0 ? 'Sem cobrança' : `R$ ${plan?.price_brl?.toFixed(2).replace('.', ',')}/mês`}
                            </div>
                        </div>
                        {plan?.name !== 'premium' && (
                            <Link href="/dashboard/plans" className="btn btn-primary btn-sm">
                                Fazer upgrade
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
