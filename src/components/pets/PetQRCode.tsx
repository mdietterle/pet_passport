'use client';

import { useRef, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { QrCode, Download, Copy, Check, Eye, EyeOff } from 'lucide-react';

interface PetQRCodeProps {
    petId: string;
    qrToken: string;
    petName: string;
    publicEnabled: boolean;
}

export default function PetQRCode({ petId, qrToken, petName, publicEnabled }: PetQRCodeProps) {
    const [enabled, setEnabled] = useState(publicEnabled);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    const publicUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/pet/${qrToken}`
        : `/pet/${qrToken}`;

    async function togglePublic() {
        setLoading(true);
        try {
            const res = await fetch('/api/pets/toggle-public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ petId, enabled: !enabled }),
            });
            if (res.ok) setEnabled(!enabled);
        } finally {
            setLoading(false);
        }
    }

    async function downloadQR() {
        const canvas = canvasRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-${petName.toLowerCase().replace(/\s/g, '-')}.png`;
        a.click();
    }

    async function copyLink() {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="qr-card">
            <div className="qr-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <QrCode size={20} style={{ color: 'var(--color-teal)' }} />
                    <span className="card-title">QR Code & Perfil Público</span>
                </div>
                <button
                    className={`btn btn-sm ${enabled ? 'btn-danger' : 'btn-primary'}`}
                    onClick={togglePublic}
                    disabled={loading}
                >
                    {enabled ? <><EyeOff size={14} /> Desativar</> : <><Eye size={14} /> Ativar</>}
                </button>
            </div>

            {!enabled ? (
                <div className="qr-disabled">
                    <QrCode size={48} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                        O perfil público está <strong>desativado</strong>.<br />
                        Ative para gerar o QR Code e compartilhar o perfil.
                    </p>
                </div>
            ) : (
                <div className="qr-active">
                    <div className="qr-code-wrap" ref={canvasRef}>
                        <QRCodeCanvas
                            value={publicUrl}
                            size={180}
                            bgColor="#ffffff"
                            fgColor="#2C3E50"
                            level="M"
                            includeMargin={true}
                        />
                    </div>

                    <div className="qr-actions">
                        <p className="qr-url">{publicUrl}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button className="btn btn-secondary btn-sm" onClick={copyLink}>
                                {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar link</>}
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={downloadQR}>
                                <Download size={14} /> Baixar QR
                            </button>
                        </div>
                    </div>

                    <div className="qr-hint">
                        💡 Grave este QR Code na coleira do {petName}. Se ele fugir, quem encontrar pode escanear e ver o perfil público com suas informações de emergência.
                    </div>
                </div>
            )}
        </div>
    );
}
