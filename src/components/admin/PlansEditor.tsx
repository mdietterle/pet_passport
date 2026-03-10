'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Save, Plus, Trash2, X } from 'lucide-react';
import type { Plan } from '@/lib/supabase/types';

interface EditablePlan extends Plan {
    _editing?: boolean;
}

export default function PlansEditor({ plans: initPlans }: { plans: Plan[] }) {
    const supabase = createClient();
    const [plans, setPlans] = useState<EditablePlan[]>(initPlans);
    const [saving, setSaving] = useState<string | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [newPlan, setNewPlan] = useState({
        name: '', display_name: '', price_brl: '0',
        max_pets: '', max_vaccinations_per_pet: '', max_consultations_per_pet: '', max_occurrences_per_pet: '',
        features: '',
    });

    function updateLocal(id: string, field: keyof Plan, value: any) {
        setPlans((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
    }

    async function savePlan(plan: EditablePlan) {
        setSaving(plan.id);
        await (supabase.from('plans') as any).update({
            display_name: plan.display_name,
            price_brl: plan.price_brl,
            max_pets: plan.max_pets,
            max_vaccinations_per_pet: plan.max_vaccinations_per_pet,
            max_consultations_per_pet: plan.max_consultations_per_pet,
            max_occurrences_per_pet: plan.max_occurrences_per_pet,
            stripe_price_id: plan.stripe_price_id,
            features: plan.features,
        }).eq('id', plan.id);
        setSaving(null);
    }

    async function deletePlan(id: string) {
        if (!confirm('Remover este plano? Usuários no plano serão afetados.')) return;
        setSaving(id + '_del');
        await (supabase.from('plans') as any).delete().eq('id', id);
        setPlans((prev) => prev.filter((p) => p.id !== id));
        setSaving(null);
    }

    async function createPlan() {
        setSaving('new');
        const featuresArr = newPlan.features.split('\n').map((f) => f.trim()).filter(Boolean);
        const { data } = await (supabase.from('plans') as any).insert({
            name: newPlan.name,
            display_name: newPlan.display_name,
            price_brl: parseFloat(newPlan.price_brl) || 0,
            max_pets: newPlan.max_pets ? parseInt(newPlan.max_pets) : null,
            max_vaccinations_per_pet: newPlan.max_vaccinations_per_pet ? parseInt(newPlan.max_vaccinations_per_pet) : null,
            max_consultations_per_pet: newPlan.max_consultations_per_pet ? parseInt(newPlan.max_consultations_per_pet) : null,
            max_occurrences_per_pet: newPlan.max_occurrences_per_pet ? parseInt(newPlan.max_occurrences_per_pet) : null,
            features: featuresArr,
            sort_order: plans.length,
        }).select().single();
        if (data) setPlans((prev) => [...prev, data as Plan]);
        setShowNew(false);
        setNewPlan({ name: '', display_name: '', price_brl: '0', max_pets: '', max_vaccinations_per_pet: '', max_consultations_per_pet: '', max_occurrences_per_pet: '', features: '' });
        setSaving(null);
    }

    const nullLabel = '∞ (ilimitado)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {plans.map((plan) => (
                <div className="card" key={plan.id}>
                    <div className="card-header" style={{ justifyContent: 'space-between' }}>
                        <h3 className="card-title" style={{ fontSize: '1rem' }}>
                            {plan.display_name} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>({plan.name})</span>
                        </h3>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => savePlan(plan)} disabled={saving === plan.id}>
                                {saving === plan.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar
                            </button>
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => deletePlan(plan.id)} disabled={saving === plan.id + '_del'}>
                                {saving === plan.id + '_del' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Nome de exibição</label>
                            <input className="form-input" value={plan.display_name} onChange={(e) => updateLocal(plan.id, 'display_name', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Preço (R$)</label>
                            <input type="number" step="0.01" min="0" className="form-input" value={plan.price_brl} onChange={(e) => updateLocal(plan.id, 'price_brl', parseFloat(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Stripe Price ID</label>
                            <input className="form-input" placeholder="price_xxx" value={plan.stripe_price_id ?? ''} onChange={(e) => updateLocal(plan.id, 'stripe_price_id', e.target.value || null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Máx. pets <span style={{ color: 'var(--color-text-muted)' }}>(vazio={nullLabel})</span></label>
                            <input type="number" min="1" className="form-input" value={plan.max_pets ?? ''} onChange={(e) => updateLocal(plan.id, 'max_pets', e.target.value ? parseInt(e.target.value) : null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Máx. vacinas/pet</label>
                            <input type="number" min="1" className="form-input" value={plan.max_vaccinations_per_pet ?? ''} onChange={(e) => updateLocal(plan.id, 'max_vaccinations_per_pet', e.target.value ? parseInt(e.target.value) : null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Máx. consultas/pet</label>
                            <input type="number" min="1" className="form-input" value={plan.max_consultations_per_pet ?? ''} onChange={(e) => updateLocal(plan.id, 'max_consultations_per_pet', e.target.value ? parseInt(e.target.value) : null)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Máx. ocorrências/pet</label>
                            <input type="number" min="1" className="form-input" value={plan.max_occurrences_per_pet ?? ''} onChange={(e) => updateLocal(plan.id, 'max_occurrences_per_pet', e.target.value ? parseInt(e.target.value) : null)} />
                        </div>
                        <div className="form-group form-full">
                            <label className="form-label">Features (JSON array ou texto por linha)</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                value={Array.isArray(plan.features) ? (plan.features as string[]).join('\n') : ''}
                                onChange={(e) => updateLocal(plan.id, 'features', e.target.value.split('\n').map((f) => f.trim()).filter(Boolean))}
                            />
                        </div>
                    </div>
                </div>
            ))}

            {/* New plan form */}
            {showNew ? (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title" style={{ fontSize: '1rem' }}>Novo Plano</h3>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowNew(false)}><X size={16} /></button>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Slug (único) *</label>
                            <input className="form-input" placeholder="ex: enterprise" value={newPlan.name} onChange={(e) => setNewPlan((p) => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nome de exibição *</label>
                            <input className="form-input" placeholder="ex: Enterprise" value={newPlan.display_name} onChange={(e) => setNewPlan((p) => ({ ...p, display_name: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Preço (R$)</label>
                            <input type="number" step="0.01" min="0" className="form-input" value={newPlan.price_brl} onChange={(e) => setNewPlan((p) => ({ ...p, price_brl: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Máx. pets (vazio=ilimitado)</label>
                            <input type="number" min="1" className="form-input" value={newPlan.max_pets} onChange={(e) => setNewPlan((p) => ({ ...p, max_pets: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Máx. vacinas/pet</label>
                            <input type="number" min="1" className="form-input" value={newPlan.max_vaccinations_per_pet} onChange={(e) => setNewPlan((p) => ({ ...p, max_vaccinations_per_pet: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Máx. consultas/pet</label>
                            <input type="number" min="1" className="form-input" value={newPlan.max_consultations_per_pet} onChange={(e) => setNewPlan((p) => ({ ...p, max_consultations_per_pet: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Máx. ocorrências/pet</label>
                            <input type="number" min="1" className="form-input" value={newPlan.max_occurrences_per_pet} onChange={(e) => setNewPlan((p) => ({ ...p, max_occurrences_per_pet: e.target.value }))} />
                        </div>
                        <div className="form-group form-full">
                            <label className="form-label">Features (uma por linha)</label>
                            <textarea className="form-textarea" rows={3} value={newPlan.features} onChange={(e) => setNewPlan((p) => ({ ...p, features: e.target.value }))} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                        <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancelar</button>
                        <button className="btn btn-primary" onClick={createPlan} disabled={saving === 'new' || !newPlan.name || !newPlan.display_name}>
                            {saving === 'new' ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Criar plano
                        </button>
                    </div>
                </div>
            ) : (
                <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => setShowNew(true)}>
                    <Plus size={16} /> Novo plano
                </button>
            )}
        </div>
    );
}
