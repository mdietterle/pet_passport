'use client';

import { useEffect } from 'react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Dashboard Error]', error);
    }, [error]);

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h2 style={{ color: 'red', marginBottom: '1rem' }}>Erro no Dashboard</h2>
            <pre style={{
                background: '#f8f8f8',
                border: '1px solid #ccc',
                padding: '1rem',
                borderRadius: '8px',
                overflowX: 'auto',
                fontSize: '0.85rem',
            }}>
                {error.message}
                {'\n\n'}
                {error.stack}
            </pre>
            <button
                onClick={reset}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
                Tentar novamente
            </button>
        </div>
    );
}
