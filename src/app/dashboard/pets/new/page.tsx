'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SPECIES_LABELS, SEX_LABELS } from '@/lib/planLimits';

export default function NewPetPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        species: 'dog',
        breed: '',
        birth_date: '',
        sex: 'unknown',
        weight_kg: '',
        microchip: '',
        color: '',
        notes: '',
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }

        const { data, error: err } = await (supabase.from('pets') as any).insert({
            owner_id: user.id,
            name: form.name,
            species: form.species as any,
            breed: form.breed || null,
            birth_date: form.birth_date || null,
            sex: form.sex as any,
            weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
            microchip: form.microchip || null,
            color: form.color || null,
            notes: form.notes || null,
        }).select().single();

        if (err) {
            setError('Erro ao cadastrar pet. Tente novamente.');
            setLoading(false);
        } else {
            router.push(`/dashboard/pets/${data.id}`);
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <Link href="/dashboard/pets" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-3)' }}>
                    <ArrowLeft size={16} /> Voltar
                </Link>
                <h1 className="page-title">Cadastrar Novo Pet</h1>
                <p className="page-subtitle">Preencha as informações básicas do seu pet</p>
            </div>

            <div className="card" style={{ maxWidth: 640 }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span><span>{error}</span>
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group form-full">
                            <label className="form-label" htmlFor="name">Nome do pet *</label>
                            <input id="name" name="name" className="form-input" placeholder="Ex: Rex, Mimi..." value={form.name} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="species">Espécie *</label>
                            <select id="species" name="species" className="form-select" value={form.species} onChange={handleChange} required>
                                {Object.entries(SPECIES_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="breed">Raça</label>
                            <input id="breed" name="breed" className="form-input" placeholder="Ex: Labrador, Siamês..." value={form.breed} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="birth_date">Data de nascimento</label>
                            <input id="birth_date" name="birth_date" type="date" className="form-input" value={form.birth_date} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="sex">Sexo</label>
                            <select id="sex" name="sex" className="form-select" value={form.sex} onChange={handleChange}>
                                {Object.entries(SEX_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="weight_kg">Peso (kg)</label>
                            <input id="weight_kg" name="weight_kg" type="number" step="0.1" min="0" className="form-input" placeholder="Ex: 4.5" value={form.weight_kg} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="color">Cor / pelagem</label>
                            <input id="color" name="color" className="form-input" placeholder="Ex: Caramelo, Preto e branco..." value={form.color} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="microchip">Microchip</label>
                            <input id="microchip" name="microchip" className="form-input" placeholder="Número do microchip" value={form.microchip} onChange={handleChange} />
                        </div>

                        <div className="form-group form-full">
                            <label className="form-label" htmlFor="notes">Observações</label>
                            <textarea id="notes" name="notes" className="form-textarea" placeholder="Informações adicionais sobre o pet..." value={form.notes} onChange={handleChange} rows={3} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                        <Link href="/dashboard/pets" className="btn btn-secondary">Cancelar</Link>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : 'Cadastrar Pet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
