'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Save, Loader2 } from 'lucide-react';

// Species are stored as a constant in the app. This page lets admins
// see the current list and a guide on how to update them.
// Since species are currently a TypeScript constant, we manage them via
// a Supabase-backed config table "app_config" (key/value).

const DEFAULT_SPECIES = [
    { value: 'dog', label: 'Cachorro' },
    { value: 'cat', label: 'Gato' },
    { value: 'bird', label: 'Pássaro' },
    { value: 'rabbit', label: 'Coelho' },
    { value: 'fish', label: 'Peixe' },
    { value: 'reptile', label: 'Réptil' },
    { value: 'other', label: 'Outro' },
];

export default function SpeciesEditor({
    initial,
}: {
    initial: Array<{ value: string; label: string }>;
}) {
    const supabase = createClient();
    const [items, setItems] = useState(initial.length > 0 ? initial : DEFAULT_SPECIES);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    function addItem() {
        setItems((prev) => [...prev, { value: '', label: '' }]);
    }

    function removeItem(idx: number) {
        setItems((prev) => prev.filter((_, i) => i !== idx));
    }

    function updateItem(idx: number, field: 'value' | 'label', val: string) {
        setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    }

    async function saveAll() {
        setSaving(true);
        setSaved(false);
        const filtered = items.filter((i) => i.value.trim() && i.label.trim());
        // Upsert a config row storing species as JSON
        await (supabase.from('app_config') as any).upsert({
            key: 'species',
            value: JSON.stringify(filtered),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-header">
                <h2 className="card-title">Espécies cadastradas</h2>
                <button className="btn btn-primary btn-sm" onClick={saveAll} disabled={saving}>
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saved ? 'Salvo!' : 'Salvar'}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        <input
                            className="form-input"
                            placeholder="Chave (ex: hamster)"
                            value={item.value}
                            onChange={(e) => updateItem(idx, 'value', e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <input
                            className="form-input"
                            placeholder="Rótulo (ex: Hamster)"
                            value={item.label}
                            onChange={(e) => updateItem(idx, 'label', e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => removeItem(idx)}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <button className="btn btn-secondary btn-sm" onClick={addItem}>
                <Plus size={14} /> Adicionar espécie
            </button>

            <div className="alert alert-warning" style={{ marginTop: 'var(--space-4)' }}>
                ⚠️ Após salvar, reinicie o servidor para que as novas espécies apareçam nos formulários de pet. As alterações são salvas na tabela <code>app_config</code> do Supabase.
            </div>
        </div>
    );
}
