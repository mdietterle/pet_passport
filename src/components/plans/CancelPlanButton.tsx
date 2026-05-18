'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CancelPlanButtonProps {
    planName: string;
}

export default function CancelPlanButton({ planName }: CancelPlanButtonProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleCancel() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/stripe/cancel-subscription', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Erro ao cancelar. Tente novamente.');
                setLoading(false);
                return;
            }
            router.push('/dashboard/plans?plan_canceled=true');
            router.refresh();
        } catch {
            setError('Erro de conexão. Tente novamente.');
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setShowDialog(true)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.8rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: '0',
                }}
            >
                Cancelar plano {planName}
            </button>

            {showDialog && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                }}>
                    <div style={{
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-8)',
                        maxWidth: '420px',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-4)',
                    }}>
                        <div style={{ fontSize: '2rem', textAlign: 'center' }}>⚠️</div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', margin: 0 }}>
                            Cancelar assinatura?
                        </h2>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
                            Ao cancelar, você perderá imediatamente o acesso aos recursos do plano <strong>{planName}</strong> e será movido para o plano <strong>Gratuito</strong>. Seus dados de pets serão mantidos.
                        </p>

                        {error && (
                            <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                                {error}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                            <button
                                onClick={() => { setShowDialog(false); setError(null); }}
                                disabled={loading}
                                className="btn btn-secondary"
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                Manter plano
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid #ef4444',
                                    background: 'rgba(239,68,68,0.1)',
                                    color: '#ef4444',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    fontSize: '0.9rem',
                                }}
                            >
                                {loading ? 'Cancelando...' : 'Sim, cancelar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
