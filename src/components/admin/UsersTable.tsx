'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Check, X } from 'lucide-react';
import type { Plan } from '@/lib/supabase/types';

interface Props {
    users: Array<{
        id: string;
        full_name: string | null;
        subscription_status: string | null;
        is_admin: boolean | null;
        created_at: string;
        email: string;
        plans: Pick<Plan, 'id' | 'display_name'> | null;
    }>;
    plans: Pick<Plan, 'id' | 'display_name'>[];
}

export default function UsersTable({ users: initUsers, plans }: Props) {
    const supabase = createClient();
    const [users, setUsers] = useState(initUsers);
    const [saving, setSaving] = useState<string | null>(null);

    async function changePlan(userId: string, planId: string) {
        setSaving(userId);
        const { error } = await (supabase.from('profiles') as any)
            .update({ plan_id: planId })
            .eq('id', userId);
        if (!error) {
            const plan = plans.find((p) => p.id === planId) ?? null;
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, plans: plan } : u))
            );
        }
        setSaving(null);
    }

    async function toggleAdmin(userId: string, current: boolean) {
        setSaving(userId + '_admin');
        await (supabase.from('profiles') as any).update({ is_admin: !current }).eq('id', userId);
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, is_admin: !current } : u))
        );
        setSaving(null);
    }

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Plano</th>
                        <th>Admin</th>
                        <th>Status</th>
                        <th>Membro desde</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td style={{ fontWeight: 600 }}>{u.full_name || '—'}</td>
                            <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                            <td>
                                <select
                                    className="form-select"
                                    style={{ padding: '4px 8px', fontSize: '0.85rem', minWidth: 110 }}
                                    value={u.plans?.id ?? ''}
                                    onChange={(e) => changePlan(u.id, e.target.value)}
                                    disabled={saving === u.id}
                                >
                                    {plans.map((p) => (
                                        <option key={p.id} value={p.id}>{p.display_name}</option>
                                    ))}
                                </select>
                                {saving === u.id && <Loader2 size={14} className="animate-spin" style={{ marginLeft: 6 }} />}
                            </td>
                            <td>
                                <button
                                    className={`btn btn-icon btn-sm ${u.is_admin ? 'btn-primary' : 'btn-ghost'}`}
                                    title={u.is_admin ? 'Remover admin' : 'Tornar admin'}
                                    onClick={() => toggleAdmin(u.id, !!u.is_admin)}
                                    disabled={saving === u.id + '_admin'}
                                >
                                    {saving === u.id + '_admin'
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : u.is_admin ? <Check size={14} /> : <X size={14} />}
                                </button>
                            </td>
                            <td>
                                <span className={`badge ${u.subscription_status === 'active' ? 'badge-teal' : 'badge-amber'}`}>
                                    {u.subscription_status || 'free'}
                                </span>
                            </td>
                            <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                {new Date(u.created_at).toLocaleDateString('pt-BR')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
