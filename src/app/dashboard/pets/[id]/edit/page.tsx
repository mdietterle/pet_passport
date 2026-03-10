'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Loader2, Trash2, Camera, X } from 'lucide-react';
import { SPECIES_LABELS, SEX_LABELS } from '@/lib/planLimits';

export default function EditPetPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({
        name: '', species: 'dog', breed: '', birth_date: '', sex: 'unknown',
        weight_kg: '', microchip: '', color: '', notes: '',
    });

    useEffect(() => {
        supabase.from('pets').select('*').eq('id', params.id).single().then(({ data: rawData }) => {
            const data = rawData as any;
            if (data) {
                setForm({
                    name: data.name,
                    species: data.species,
                    breed: data.breed || '',
                    birth_date: data.birth_date || '',
                    sex: data.sex || 'unknown',
                    weight_kg: data.weight_kg?.toString() || '',
                    microchip: data.microchip || '',
                    color: data.color || '',
                    notes: data.notes || '',
                });
                setPhotoUrl(data.photo_url || null);
            }
            setFetching(false);
        });
    }, [params.id]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
        if (!allowed.includes(file.type)) {
            setError('Formato não suportado. Use JPG, PNG ou WEBP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Foto muito grande (máx. 5 MB).');
            return;
        }

        setPhotoUploading(true);
        setError('');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('pet_id', params.id);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (res.ok) {
            const json = await res.json();
            setPhotoUrl(json.url);
            // Persist immediately
            await (supabase.from('pets') as any).update({ photo_url: json.url }).eq('id', params.id);
        } else {
            setError('Erro ao enviar foto. Tente novamente.');
        }
        setPhotoUploading(false);
    }

    async function handleRemovePhoto() {
        setPhotoUrl(null);
        await (supabase.from('pets') as any).update({ photo_url: null }).eq('id', params.id);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error: err } = await (supabase.from('pets') as any).update({
            name: form.name, species: form.species as any, breed: form.breed || null,
            birth_date: form.birth_date || null, sex: form.sex as any,
            weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
            microchip: form.microchip || null, color: form.color || null, notes: form.notes || null,
        }).eq('id', params.id);
        if (err) { setError('Erro ao salvar. Tente novamente.'); setLoading(false); }
        else router.push(`/dashboard/pets/${params.id}`);
    }

    async function handleDelete() {
        if (!confirm('Tem certeza que deseja remover este pet? Esta ação não pode ser desfeita.')) return;
        await (supabase.from('pets') as any).update({ is_active: false }).eq('id', params.id);
        router.push('/dashboard/pets');
    }

    if (fetching) return <div className="page-container"><div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} /></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <Link href={`/dashboard/pets/${params.id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-3)' }}>
                    <ArrowLeft size={16} /> Voltar
                </Link>
                <h1 className="page-title">Editar Pet</h1>
            </div>
            <div className="card" style={{ maxWidth: 640 }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {error && <div className="alert alert-error"><span>⚠️</span><span>{error}</span></div>}

                    {/* Photo upload */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div className="pet-photo-upload-wrap">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Foto do pet" className="pet-photo-upload-img" />
                            ) : (
                                <div className="pet-photo-upload-placeholder">
                                    <Camera size={32} style={{ color: 'var(--color-text-muted)' }} />
                                </div>
                            )}
                            {photoUploading && (
                                <div className="pet-photo-upload-overlay">
                                    <Loader2 size={24} className="animate-spin" />
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                                <Camera size={14} /> {photoUrl ? 'Trocar foto' : 'Adicionar foto'}
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/heic"
                                    style={{ display: 'none' }}
                                    onChange={handlePhotoChange}
                                    disabled={photoUploading}
                                />
                            </label>
                            {photoUrl && (
                                <button type="button" className="btn btn-ghost btn-sm" onClick={handleRemovePhoto} disabled={photoUploading}>
                                    <X size={14} /> Remover
                                </button>
                            )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            JPG, PNG ou WEBP · máx. 5 MB
                        </span>
                    </div>

                    <div className="form-grid">
                        <div className="form-group form-full">
                            <label className="form-label">Nome *</label>
                            <input name="name" className="form-input" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Espécie *</label>
                            <select name="species" className="form-select" value={form.species} onChange={handleChange}>
                                {Object.entries(SPECIES_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Raça</label>
                            <input name="breed" className="form-input" value={form.breed} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Data de nascimento</label>
                            <input name="birth_date" type="date" className="form-input" value={form.birth_date} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sexo</label>
                            <select name="sex" className="form-select" value={form.sex} onChange={handleChange}>
                                {Object.entries(SEX_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Peso (kg)</label>
                            <input name="weight_kg" type="number" step="0.1" min="0" className="form-input" value={form.weight_kg} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cor / pelagem</label>
                            <input name="color" className="form-input" value={form.color} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Microchip</label>
                            <input name="microchip" className="form-input" value={form.microchip} onChange={handleChange} />
                        </div>
                        <div className="form-group form-full">
                            <label className="form-label">Observações</label>
                            <textarea name="notes" className="form-textarea" rows={3} value={form.notes} onChange={handleChange} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
                            <Trash2 size={14} /> Remover pet
                        </button>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <Link href={`/dashboard/pets/${params.id}`} className="btn btn-secondary">Cancelar</Link>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : 'Salvar alterações'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <style>{`
                .pet-photo-upload-wrap {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 3px solid var(--color-border);
                    background: var(--color-bg-tertiary);
                    flex-shrink: 0;
                }
                .pet-photo-upload-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .pet-photo-upload-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pet-photo-upload-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.45);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
            `}</style>
        </div>
    );
}
