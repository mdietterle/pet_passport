'use client';

import { useState, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface Props {
    pet: any;
    vaccinations: any[];
    consultations: any[];
    parasites: any[];
    medications: any[];
}

const SPECIES_LABEL: Record<string, string> = {
    dog: 'Cachorro', cat: 'Gato', bird: 'Pássaro', rabbit: 'Coelho',
    fish: 'Peixe', reptile: 'Réptil', other: 'Outro',
};

function formatDate(str: string | null | undefined) {
    if (!str) return '—';
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
}

export default function PetPassportPrint({ pet, vaccinations, consultations, parasites, medications }: Props) {
    const [loading, setLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    async function handleExport() {
        if (!printRef.current) return;
        setLoading(true);

        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');

            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            if (pdfHeight <= 297) {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            } else {
                // Multi-page: slice in 297mm chunks
                const pageHeightPx = (297 * canvas.width) / pdfWidth;
                let yOffset = 0;
                while (yOffset < canvas.height) {
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvas.width;
                    pageCanvas.height = Math.min(pageHeightPx, canvas.height - yOffset);
                    const ctx = pageCanvas.getContext('2d')!;
                    ctx.drawImage(canvas, 0, -yOffset);
                    const pageImg = pageCanvas.toDataURL('image/png');
                    if (yOffset > 0) pdf.addPage();
                    pdf.addImage(pageImg, 'PNG', 0, 0, pdfWidth, (pageCanvas.height * pdfWidth) / canvas.width);
                    yOffset += pageHeightPx;
                }
            }

            pdf.save(`passaporte-${pet.name.toLowerCase().replace(/\s/g, '-')}.pdf`);
        } finally {
            setLoading(false);
        }
    }

    const activeVaccinations = vaccinations.filter(v =>
        !v.next_due_date || new Date(v.next_due_date) >= new Date()
    );

    return (
        <>
            <button
                className="btn btn-primary"
                onClick={handleExport}
                disabled={loading}
                style={{ gap: '6px' }}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {loading ? 'Gerando PDF...' : 'Exportar Passaporte (PDF)'}
            </button>

            {/* Hidden print template */}
            <div ref={printRef} style={{
                position: 'fixed', left: '-9999px', top: 0,
                width: '794px',
                background: '#ffffff',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                color: '#2C3E50',
                padding: '48px',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '20px', borderBottom: '3px solid #FF9300', marginBottom: '28px',
                }}>
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                            🐾 Pet Passport
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{pet.name}</div>
                        <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
                            {SPECIES_LABEL[pet.species] || pet.species}{pet.breed ? ` — ${pet.breed}` : ''}
                        </div>
                    </div>
                    {pet.photo_url && (
                        <img
                            src={pet.photo_url}
                            alt={pet.name}
                            crossOrigin="anonymous"
                            style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: '50%', border: '3px solid #FF9300' }}
                        />
                    )}
                </div>

                {/* Basic Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    {[
                        { label: 'Data Nasc.', value: formatDate(pet.birth_date) },
                        { label: 'Sexo', value: pet.sex === 'male' ? 'Macho' : pet.sex === 'female' ? 'Fêmea' : 'N/A' },
                        { label: 'Microchip', value: pet.microchip || '—' },
                        { label: 'Cor / Pelagem', value: pet.color || '—' },
                        { label: 'Peso', value: pet.weight_kg ? `${pet.weight_kg} kg` : '—' },
                    ].map((item, i) => (
                        <div key={i} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px 14px' }}>
                            <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                {/* Vaccinations */}
                {activeVaccinations.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', marginBottom: '12px' }}>
                            💉 Vacinas em Dia
                        </h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#F1F5F9' }}>
                                    {['Vacina', 'Data', 'Próxima Dose', 'Lote', 'Fabricante', 'Veterinário'].map(h => (
                                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {activeVaccinations.map((v, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{v.vaccine_name}</td>
                                        <td style={{ padding: '8px 12px' }}>{formatDate(v.date)}</td>
                                        <td style={{ padding: '8px 12px' }}>{formatDate(v.next_due_date)}</td>
                                        <td style={{ padding: '8px 12px', color: '#64748B', fontSize: '0.9em' }}>{v.batch || '—'}</td>
                                        <td style={{ padding: '8px 12px', color: '#64748B', fontSize: '0.9em' }}>{v.manufacturer || '—'}</td>
                                        <td style={{ padding: '8px 12px', color: '#64748B' }}>{v.vet_name || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Active Medications */}
                {medications.filter(m => m.active).length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', marginBottom: '12px' }}>
                            💊 Medicações em Uso
                        </h2>
                        {medications.filter(m => m.active).map((m, i) => (
                            <div key={i} style={{ display: 'flex', gap: '16px', padding: '8px 12px', background: i % 2 === 0 ? '#F8FAFC' : 'white', borderRadius: '6px', fontSize: '13px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600, flex: 1 }}>{m.medication_name}</span>
                                <span style={{ color: '#64748B' }}>{m.dosage}</span>
                                {m.frequency && <span style={{ color: '#94A3B8' }}>{m.frequency}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Notes */}
                {pet.notes && (
                    <div style={{ background: '#FFF8F0', border: '1px solid #FFD580', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#CC7600', marginBottom: '6px' }}>
                            ⚕️ Observações Médicas
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6 }}>{pet.notes}</div>
                    </div>
                )}

                {/* Footer */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginTop: '16px', fontSize: '11px', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>🐾 Pet Passport — Gerado em {new Date().toLocaleDateString('pt-BR')}</span>
                    <span>Documento informativo. Não substitui laudos veterinários.</span>
                </div>
            </div>
        </>
    );
}
