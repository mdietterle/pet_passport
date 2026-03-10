import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Check, Zap } from 'lucide-react';
import { PLAN_COLORS, PLAN_ICONS } from '@/lib/planUtils';


export default async function PlansPage({ searchParams }: { searchParams: { success?: string, canceled?: string, abacate_success?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, plans(*)')
    .eq('id', user.id)
    .single();

  const { data: plansRaw } = await supabase
    .from('plans')
    .select('*')
    .order('sort_order', { ascending: true });

  const plans = plansRaw as any[] | null;

  const currentPlan = (profile as any)?.plans;
  const userProfile = profile as any;

  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Escolha seu Plano</h1>
        <p className="page-subtitle">
          Plano atual: <strong style={{ color: 'var(--color-teal-light)' }}>{currentPlan?.display_name || 'Gratuito'}</strong>
        </p>
        
        {searchParams.abacate_success === 'true' && (
          <div style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid #4ade80' }}>
            🥑 Pagamento PIX iniciado. Assim que confirmado, seu plano será atualizado!
          </div>
        )}
      </div>

      <div className="plans-grid">
        {(plans || []).map((plan) => {
          const isCurrent = currentPlan?.id === plan.id;
          const color = PLAN_COLORS[plan.name] || 'gray';
          const features = Array.isArray(plan.features) ? plan.features : [];

          return (
            <div key={plan.id} className={`plan-card ${isCurrent ? 'plan-card-current' : ''} ${plan.name === 'pro' ? 'plan-card-featured' : ''}`}>
              {plan.name === 'pro' && (
                <div className="plan-badge-popular">
                  <Zap size={12} /> Mais popular
                </div>
              )}
              {isCurrent && (
                <div className="plan-badge-current">Plano atual</div>
              )}

              <div className="plan-icon">{PLAN_ICONS[plan.name]}</div>
              <h2 className="plan-name">{plan.display_name}</h2>

              <div className="plan-price">
                {plan.price_brl === 0 ? (
                  <span className="plan-price-value">Grátis</span>
                ) : (
                  <>
                    <span className="plan-price-currency">R$</span>
                    <span className="plan-price-value">{plan.price_brl.toFixed(2).replace('.', ',')}</span>
                    <span className="plan-price-period">/mês</span>
                  </>
                )}
              </div>

              <ul className="plan-features">
                {features.map((feature: string, i: number) => (
                  <li key={i} className="plan-feature">
                    <Check size={14} className="plan-feature-check" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="plan-cta">
                {isCurrent ? (
                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} disabled>
                    Plano atual
                  </button>
                ) : plan.price_brl === 0 ? (
                  <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} disabled>
                    Plano gratuito
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>

                    {/* Abacate Pay Checkout */}
                    {(!userProfile?.tax_id || !userProfile?.cellphone) ? (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center', color: '#b45309' }}>
                        Para pagar com PIX, preencha seu <strong>CPF e Celular</strong> em <Link href="/dashboard/profile" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>Meu Perfil</Link>.
                      </div>
                    ) : (
                      <form action="/api/abacatepay/checkout" method="POST" style={{ width: '100%' }}>
                        <input type="hidden" name="planId" value={plan.id} />
                        <button
                          type="submit"
                          className="btn btn-secondary"
                          style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--color-teal)', color: 'var(--color-teal)' }}
                        >
                          ✨ PIX (Abacate Pay)
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="plans-note">
        <p>✨ Pagamentos processados instantaneamente via PIX (Abacate Pay).</p>
      </div>

      <style>{`
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-5);
          margin-bottom: var(--space-8);
        }
        .plan-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          position: relative;
          transition: all var(--transition-base);
        }
        .plan-card:hover {
          border-color: var(--color-border-hover);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .plan-card-current {
          border-color: var(--color-teal);
          box-shadow: 0 0 24px var(--color-teal-glow);
        }
        .plan-card-featured {
          border-color: var(--color-amber);
          background: linear-gradient(180deg, rgba(245,158,11,0.05) 0%, var(--color-bg-secondary) 100%);
        }
        .plan-badge-popular {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, var(--color-amber-dark), var(--color-amber));
          color: #000;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }
        .plan-badge-current {
          position: absolute;
          top: -12px;
          right: var(--space-4);
          background: var(--color-teal);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }
        .plan-icon {
          font-size: 2rem;
          text-align: center;
        }
        .plan-name {
          font-size: 1.2rem;
          font-weight: 700;
          text-align: center;
        }
        .plan-price {
          text-align: center;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 2px;
        }
        .plan-price-currency {
          font-size: 1rem;
          color: var(--color-text-secondary);
        }
        .plan-price-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-text);
        }
        .plan-price-period {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
        .plan-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
        }
        .plan-feature {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .plan-feature-check {
          color: var(--color-teal-light);
          flex-shrink: 0;
        }
        .plan-cta { margin-top: auto; }
        .plans-note {
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
