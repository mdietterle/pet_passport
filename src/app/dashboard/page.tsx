import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';
import { PawPrint, Syringe, AlertCircle, Plus, ArrowRight, Wallet, Activity, ShieldPlus, Pill, Bell, Lock } from 'lucide-react';
import { parseLocalDate, formatDate, formatCurrency } from '@/lib/dateUtils';
import { generatePetAlerts } from '@/lib/petAlerts';
import { canSeeAlerts } from '@/lib/planFeatures';

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch profile with plan
    const { data: profileData } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', user.id)
        .single();
    const profile = profileData as any;

    // Fetch pets
    const { data: petsData } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    const pets = petsData as any[] | null;

    // Fetch upcoming vaccinations (next 30 days)
    const today = new Date().toISOString().split('T')[0];
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const petIds = (pets || []).map((p) => p.id);

    let upcomingVaccinations: any[] = [];
    let upcomingParasites: any[] = [];
    let activeMedications: any[] = [];
    let recentOccurrences: any[] = [];
    let allVetConsultations: any[] = [];
    let allOccurrences: any[] = [];

    if (petIds.length > 0) {
        const { data: vaccData } = await supabase
            .from('vaccinations')
            .select('*, pets(name)')
            .in('pet_id', petIds)
            .gte('next_due_date', today)
            .lte('next_due_date', in30Days)
            .order('next_due_date', { ascending: true })
            .limit(5);
        upcomingVaccinations = vaccData as any[] || [];

        const { data: paraData } = await supabase
            .from('parasite_controls')
            .select('*, pets(name)')
            .in('pet_id', petIds)
            .gte('next_due_date', today)
            .lte('next_due_date', in30Days)
            .order('next_due_date', { ascending: true })
            .limit(5);
        upcomingParasites = paraData as any[] || [];

        const { data: medsData } = await supabase
            .from('medications')
            .select('*, pets(name)')
            .in('pet_id', petIds)
            .eq('active', true)
            .order('start_date', { ascending: false })
            .limit(5);
        activeMedications = medsData as any[] || [];

        // Para os cards recentes
        const { data: occData } = await supabase
            .from('occurrences')
            .select('*, pets(name)')
            .in('pet_id', petIds)
            .order('date', { ascending: false })
            .limit(5);

        const occ = occData as any[];

        const { data: vetCardsData } = await supabase
            .from('vet_consultations')
            .select('*, pets(name)')
            .in('pet_id', petIds)
            .order('date', { ascending: false })
            .limit(5);

        const vetCards = vetCardsData as any[];

        const combinedRecent = [
            ...(occ || []).map((o: any) => ({ ...o, itemType: o.type, itemDesc: o.description })),
            ...(vetCards || []).map((v: any) => ({ ...v, itemType: 'vet_consultation', itemDesc: v.clinic_name || v.veterinarian_name || 'Consulta Veterinária' }))
        ];

        recentOccurrences = combinedRecent
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        // Buscando TODAS as despesas para agregar (Consultas)
        const { data: vetConsData } = await supabase
            .from('vet_consultations')
            .select('id, pet_id, cost_brl')
            .in('pet_id', petIds)
            .gt('cost_brl', 0);
        allVetConsultations = vetConsData as any[] || [];

        // Buscando TODAS as despesas para agregar (Ocorrencias)
        const { data: occursData } = await supabase
            .from('occurrences')
            .select('id, pet_id, type, cost_brl')
            .in('pet_id', petIds)
            .gt('cost_brl', 0);
        allOccurrences = occursData as any[] || [];
    }

    // ─── Smart Alerts (Basic+ only) ───────────────────────────────────────────
    const plan = (profile as any)?.plans;
    let smartAlerts: any[] = [];
    if (canSeeAlerts(plan) && (pets || []).length > 0) {
        // Fetch all vaccinations and weights for each pet (for alert engine)
        const [{ data: allVaccsRaw }, { data: allWeightsRaw }] = await Promise.all([
            (supabase.from('vaccinations') as any).select('pet_id, date').in('pet_id', petIds),
            (supabase.from('pet_weights') as any).select('pet_id, date').in('pet_id', petIds),
        ]);
        const allVaccs: any[] = allVaccsRaw || [];
        const allWeights: any[] = allWeightsRaw || [];

        for (const pet of (pets || [])) {
            const petVaccs = allVaccs.filter(v => v.pet_id === pet.id);
            const petWeights = allWeights.filter(w => w.pet_id === pet.id);
            const alerts = generatePetAlerts(pet, petVaccs, petWeights);
            smartAlerts.push(...alerts);
        }
        // Deduplicate by message and cap at 5
        const seen = new Set<string>();
        smartAlerts = smartAlerts
            .filter(a => { const key = `${a.petId}-${a.message}`; if (seen.has(key)) return false; seen.add(key); return true; })
            .slice(0, 5);
    }

    // --- AGREGANDO DESPESAS ---
    // Agregação por Pet
    const expensesByPet: Record<string, { petName: string; total: number; avatar: string }> = {};
    (pets || []).forEach(pet => {
        expensesByPet[pet.id] = { petName: pet.name, total: 0, avatar: pet.species };
    });

    allVetConsultations.forEach(vc => {
        if (vc.cost_brl && expensesByPet[vc.pet_id]) {
            expensesByPet[vc.pet_id].total += vc.cost_brl;
        }
    });
    allOccurrences.forEach(occ => {
        if (occ.cost_brl && expensesByPet[occ.pet_id]) {
            expensesByPet[occ.pet_id].total += occ.cost_brl;
        }
    });

    // Agregação por Tipo
    const expensesByType: Record<string, { label: string; total: number; color: string }> = {
        vet: { label: 'Consulta Vet.', total: 0, color: 'var(--color-teal)' },
        food_purchase: { label: 'Alimentação', total: 0, color: 'var(--color-amber)' },
        grooming: { label: 'Tosa', total: 0, color: 'var(--color-purple)' },
        bath: { label: 'Banho', total: 0, color: 'var(--color-teal-light)' },
        medication: { label: 'Medicamento', total: 0, color: 'var(--color-red)' },
        other: { label: 'Outros', total: 0, color: 'var(--color-text-muted)' },
    };

    allVetConsultations.forEach(vc => {
        if (vc.cost_brl) expensesByType.vet.total += vc.cost_brl;
    });
    allOccurrences.forEach(occ => {
        if (occ.cost_brl) {
            const key = expensesByType[occ.type] ? occ.type : 'other';
            expensesByType[key].total += occ.cost_brl;
        }
    });

    const totalExpenses = Object.values(expensesByType).reduce((acc, curr) => acc + curr.total, 0);

    // Formata o array de pets ordenando pelos gastos maiores
    const petExpensesList = Object.values(expensesByPet)
        .filter(p => p.total > 0)
        .sort((a, b) => b.total - a.total);

    // Formata o array de tipos ordenando pelos gastos maiores
    const typeExpensesList = Object.values(expensesByType)
        .filter(t => t.total > 0)
        .sort((a, b) => b.total - a.total);

    const petCount = pets?.length || 0;

    const SPECIES_EMOJI: Record<string, string> = {
        dog: '🐶', cat: '🐱', bird: '🐦', rabbit: '🐰', fish: '🐟', reptile: '🦎', other: '🐾',
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    Olá, {profile?.full_name?.split(' ')[0] || 'Tutor'} 👋
                </h1>
                <p className="page-subtitle">
                    Aqui está um resumo da saúde dos seus pets
                </p>
            </div>

            {/* Plan Banner */}
            {plan && (
                <div className="plan-banner">
                    <div className="plan-banner-info">
                        <span className={`badge badge-${plan.name === 'free' ? 'gray' : plan.name === 'basic' ? 'teal' : plan.name === 'pro' ? 'amber' : 'purple'}`}>
                            {plan.display_name}
                        </span>
                        <span className="plan-banner-text">
                            {plan.max_pets
                                ? `${petCount} de ${plan.max_pets} pets cadastrados`
                                : `${petCount} pets cadastrados`}
                        </span>
                    </div>
                    {plan.name !== 'premium' && (
                        <Link href="/dashboard/plans" className="btn btn-secondary btn-sm">
                            Fazer upgrade
                        </Link>
                    )}
                </div>
            )}

            {/* Smart Alerts — Basic+ */}
            {canSeeAlerts(plan) && smartAlerts.length > 0 && (
                <div className="alerts-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                        <Bell size={16} style={{ color: 'var(--color-amber-light)' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Alertas de Saúde</span>
                    </div>
                    {smartAlerts.map((alert, i) => (
                        <div key={i} className={`alert-card alert-${alert.severity}`}>
                            <div className="alert-icon">{alert.icon}</div>
                            <div className="alert-body">
                                <div className="alert-message">{alert.message}</div>
                                <div className="alert-tip">{alert.tip}</div>
                            </div>
                            <Link href={`/dashboard/pets/${alert.petId}`} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>Ver pet</Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Teaser for Free plan users */}
            {!canSeeAlerts(plan) && (pets || []).length > 0 && (
                <div className="alert-card alert-info" style={{ marginBottom: 'var(--space-5)', alignItems: 'center' }}>
                    <div className="alert-icon"><Lock size={18} /></div>
                    <div className="alert-body">
                        <div className="alert-message">Alertas Inteligentes disponíveis no plano Basic ou superior</div>
                        <div className="alert-tip">Receba dicas personalizadas sobre saúde baseadas na espécie, raça e idade dos seus pets.</div>
                    </div>
                    <Link href="/dashboard/plans" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Upgrade</Link>
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-teal">
                        <PawPrint size={22} />
                    </div>
                    <div>
                        <div className="stat-value">{petCount}</div>
                        <div className="stat-label">Pets cadastrados</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon-amber">
                        <Syringe size={22} />
                    </div>
                    <div>
                        <div className="stat-value">{upcomingVaccinations.length}</div>
                        <div className="stat-label">Vacinas nos próximos 30 dias</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon-purple">
                        <AlertCircle size={22} />
                    </div>
                    <div>
                        <div className="stat-value">{recentOccurrences.length}</div>
                        <div className="stat-label">Ocorrências recentes</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Pets */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Meus Pets</h2>
                        <Link href="/dashboard/pets" className="btn btn-ghost btn-sm">
                            Ver todos <ArrowRight size={14} />
                        </Link>
                    </div>
                    {petCount === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                            <div className="empty-state-icon">🐾</div>
                            <p className="empty-state-title">Nenhum pet cadastrado</p>
                            <p className="empty-state-text">Adicione seu primeiro pet!</p>
                            <Link href="/dashboard/pets/new" className="btn btn-primary btn-sm">
                                <Plus size={14} /> Adicionar pet
                            </Link>
                        </div>
                    ) : (
                        <div className="pets-mini-grid">
                            {(pets || []).slice(0, 4).map((pet) => (
                                <Link key={pet.id} href={`/dashboard/pets/${pet.id}`} className="pet-mini-card">
                                    <div className="pet-mini-avatar">
                                        {SPECIES_EMOJI[pet.species] || '🐾'}
                                    </div>
                                    <div className="pet-mini-info">
                                        <div className="pet-mini-name">{pet.name}</div>
                                        <div className="pet-mini-species">{pet.breed || pet.species}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Vaccinations */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Vacinas Próximas</h2>
                        <Syringe size={18} style={{ color: 'var(--color-amber-light)' }} />
                    </div>
                    {upcomingVaccinations.length === 0 && upcomingParasites.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
                            <div className="empty-state-icon">✅</div>
                            <p className="empty-state-title">Tudo em dia!</p>
                            <p className="empty-state-text">Nenhuma vacina ou controle nos próximos 30 dias.</p>
                        </div>
                    ) : (
                        <div className="vacc-list">
                            {/* VACCINES */}
                            {upcomingVaccinations.map((v) => {
                                const due = parseLocalDate(v.next_due_date);
                                const now = new Date();
                                const daysLeft = due ? Math.ceil((due.getTime() - now.setHours(0, 0, 0, 0)) / 86400000) : 0;
                                return (
                                    <div key={v.id} className="vacc-item">
                                        <div>
                                            <div className="vacc-name">{v.vaccine_name}</div>
                                            <div className="vacc-pet">{(v.pets as any)?.name}</div>
                                        </div>
                                        <span className={`badge ${daysLeft <= 7 ? 'badge-red' : 'badge-amber'}`}>
                                            {daysLeft === 0 ? 'Hoje' : `${daysLeft}d`}
                                        </span>
                                    </div>
                                );
                            })}

                            {/* PARASITES */}
                            {upcomingParasites.map((p) => {
                                const due = parseLocalDate(p.next_due_date);
                                const now = new Date();
                                const daysLeft = due ? Math.ceil((due.getTime() - now.setHours(0, 0, 0, 0)) / 86400000) : 0;
                                return (
                                    <div key={`para-${p.id}`} className="vacc-item">
                                        <div>
                                            <div className="vacc-name">
                                                <ShieldPlus size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4, color: 'var(--color-text-secondary)' }} />
                                                {p.type === 'flea_tick' ? 'Antipulgas' : 'Vermífugo'}
                                            </div>
                                            <div className="vacc-pet">{(p.pets as any)?.name} - {p.medication_name}</div>
                                        </div>
                                        <span className={`badge ${daysLeft <= 7 ? 'badge-red' : 'badge-amber'}`}>
                                            {daysLeft === 0 ? 'Hoje' : `${daysLeft}d`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Rotinas Medicas Ativas (Aparece se houver) */}
                {activeMedications.length > 0 && (
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header">
                            <h2 className="card-title">Tratamentos Ativos</h2>
                            <Pill size={18} style={{ color: 'var(--color-teal)' }} />
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Pet</th>
                                        <th>Remédio</th>
                                        <th>Dosagem / Frequência</th>
                                        <th>Início</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeMedications.map((m) => (
                                        <tr key={m.id}>
                                            <td>{(m.pets as any)?.name}</td>
                                            <td style={{ fontWeight: 600 }}>{m.medication_name}</td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>
                                                {m.dosage} {m.frequency ? `(${m.frequency})` : ''}
                                            </td>
                                            <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                                {formatDate(m.start_date)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header">
                        <h2 className="card-title">Ocorrências Recentes</h2>
                        <Link href="/dashboard/pets" className="btn btn-ghost btn-sm">
                            Ver pets <ArrowRight size={14} />
                        </Link>
                    </div>
                    {recentOccurrences.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
                            <div className="empty-state-icon">📋</div>
                            <p className="empty-state-title">Nenhuma ocorrência registrada</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Pet</th>
                                        <th>Tipo</th>
                                        <th>Descrição</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOccurrences.map((o, idx) => (
                                        <tr key={`${o.id}-${idx}`}>
                                            <td>{(o.pets as any)?.name}</td>
                                            <td style={{ textTransform: 'capitalize' }}>
                                                {o.itemType === 'vet_consultation' ? 'Consulta Veterinária' : (o.itemType ? o.itemType.replace('_', ' ') : 'Indefinido')}
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{o.itemDesc || '—'}</td>
                                            <td style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                                {formatDate(o.date)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Gastos Totais */}
                {totalExpenses > 0 && (
                    <div className="expenses-section" style={{ gridColumn: '1 / -1', marginTop: 'var(--space-4)' }}>
                        <h2 className="page-title" style={{ fontSize: '1.2rem', marginBottom: 'var(--space-4)' }}>
                            <Wallet size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                            Controle de Gastos
                        </h2>
                        <div className="dashboard-grid">

                            {/* Gastos por Pet */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title" style={{ fontSize: '1rem' }}>Gastos por Pet</h3>
                                    <span className="badge badge-gray">{formatCurrency(totalExpenses)} total</span>
                                </div>
                                <div className="expense-bars">
                                    {petExpensesList.map((item, idx) => {
                                        const percent = Math.max(5, Math.round((item.total / totalExpenses) * 100));
                                        return (
                                            <div key={idx} className="expense-item">
                                                <div className="expense-info">
                                                    <span className="expense-label">
                                                        {SPECIES_EMOJI[item.avatar] || '🐾'} {item.petName}
                                                    </span>
                                                    <span className="expense-value">{formatCurrency(item.total)}</span>
                                                </div>
                                                <div className="progress-bg">
                                                    <div className="progress-fill" style={{ width: `${percent}%`, background: 'var(--color-teal)' }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Gastos por Categoria */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title" style={{ fontSize: '1rem' }}>Gastos por Categoria</h3>
                                    <Activity size={18} style={{ color: 'var(--color-teal)' }} />
                                </div>
                                <div className="expense-bars">
                                    {typeExpensesList.map((item, idx) => {
                                        const percent = Math.max(5, Math.round((item.total / totalExpenses) * 100));
                                        return (
                                            <div key={idx} className="expense-item">
                                                <div className="expense-info">
                                                    <span className="expense-label">{item.label}</span>
                                                    <span className="expense-value">{formatCurrency(item.total)}</span>
                                                </div>
                                                <div className="progress-bg">
                                                    <div className="progress-fill" style={{ width: `${percent}%`, background: item.color }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .plan-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-5);
          margin-bottom: var(--space-6);
        }
        .plan-banner-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .plan-banner-text {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-5);
        }
        .pets-mini-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
        }
        .pet-mini-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          transition: all var(--transition-fast);
        }
        .pet-mini-card:hover {
          border-color: var(--color-teal);
          background: rgba(13, 148, 136, 0.08);
        }
        .pet-mini-avatar {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }
        .pet-mini-name {
          font-size: 0.9rem;
          font-weight: 600;
        }
        .pet-mini-species {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: capitalize;
        }
        .vacc-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .vacc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }
        .vacc-name {
          font-size: 0.9rem;
          font-weight: 500;
        }
        .vacc-pet {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
        .expense-bars {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          margin-top: var(--space-2);
        }
        .expense-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .expense-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .expense-value {
          color: var(--color-text-secondary);
        }
        .progress-bg {
          width: 100%;
          height: 8px;
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.5s ease-out;
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
          .dashboard-grid { grid-template-columns: 1fr; }
          .pets-mini-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
}
