'use client';

import { useRef } from 'react';
import { Printer, Download } from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';

interface Doc { file_url: string; file_name: string; file_type: string; reference_id: string | null; reference_type: string; }
interface Vaccination { id: string; vaccine_name: string; date: string; next_due_date?: string; vet_name?: string; clinic?: string; batch?: string; manufacturer?: string; notes?: string; }
interface Consultation { id: string; date: string; reason: string; vet_name?: string; clinic?: string; diagnosis?: string; prescription?: string; cost_brl?: number; follow_up_date?: string; notes?: string; }
interface Occurrence { id: string; type: string; date: string; description?: string; notes?: string; cost_brl?: number; }
interface Pet { name: string; species: string; breed?: string; birth_date?: string; sex?: string; weight_kg?: number; color?: string; microchip?: string; notes?: string; }

interface Props {
    pet: Pet;
    ownerName: string;
    vaccinations: Vaccination[];
    consultations: Consultation[];
    occurrences: Occurrence[];
    documents: Doc[];
    generatedAt: string;
}

const SPECIES_LABEL: Record<string, string> = { dog: 'Cão', cat: 'Gato', bird: 'Ave', rabbit: 'Coelho', fish: 'Peixe', reptile: 'Réptil', other: 'Outro' };
const SEX_LABEL: Record<string, string> = { male: 'Macho', female: 'Fêmea', unknown: 'Não informado' };
const OCCURRENCE_LABELS: Record<string, string> = { grooming: 'Banho/Tosa', injury: 'Lesão', surgery: 'Cirurgia', hospitalization: 'Internação', medication: 'Medicação', other: 'Outro' };

function docsFor(documents: Doc[], refId: string) {
    return documents.filter((d) => d.reference_id === refId && d.file_type?.startsWith('image/'));
}

export default function PetReport({ pet, ownerName, vaccinations, consultations, occurrences, documents, generatedAt }: Props) {
    const reportRef = useRef<HTMLDivElement>(null);

    function handlePrint() {
        window.print();
    }

    return (
        <>
            {/* Toolbar — hidden when printing */}
            <div className="report-toolbar no-print">
                <button className="btn btn-primary" onClick={handlePrint}>
                    <Printer size={16} /> Imprimir / Salvar PDF
                </button>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    O navegador vai abrir o diálogo de impressão. Escolha "Salvar como PDF" para exportar.
                </span>
            </div>

            {/* ═══ REPORT ═══ */}
            <div ref={reportRef} className="report-page">

                {/* Header */}
                <div className="rpt-header">
                    <div className="rpt-header-left">
                        <div className="rpt-logo">🐾</div>
                        <div>
                            <div className="rpt-title">Passaporte de Saúde Animal</div>
                            <div className="rpt-subtitle">Documento de saúde para apresentação em serviços veterinários e hotelaria pet</div>
                        </div>
                    </div>
                    <div className="rpt-date">Emitido em {generatedAt}</div>
                </div>

                {/* Pet Info */}
                <section className="rpt-section">
                    <h2 className="rpt-section-title">🐶 Identificação do Animal</h2>
                    <div className="rpt-info-grid">
                        <div className="rpt-info-item"><span className="rpt-label">Nome</span><span className="rpt-value">{pet.name}</span></div>
                        <div className="rpt-info-item"><span className="rpt-label">Espécie</span><span className="rpt-value">{SPECIES_LABEL[pet.species] || pet.species}</span></div>
                        {pet.breed && <div className="rpt-info-item"><span className="rpt-label">Raça</span><span className="rpt-value">{pet.breed}</span></div>}
                        {pet.sex && <div className="rpt-info-item"><span className="rpt-label">Sexo</span><span className="rpt-value">{SEX_LABEL[pet.sex] || pet.sex}</span></div>}
                        {pet.birth_date && <div className="rpt-info-item"><span className="rpt-label">Data de Nascimento</span><span className="rpt-value">{formatDate(pet.birth_date)}</span></div>}
                        {pet.weight_kg && <div className="rpt-info-item"><span className="rpt-label">Peso</span><span className="rpt-value">{pet.weight_kg} kg</span></div>}
                        {pet.color && <div className="rpt-info-item"><span className="rpt-label">Pelagem / Cor</span><span className="rpt-value">{pet.color}</span></div>}
                        {pet.microchip && <div className="rpt-info-item"><span className="rpt-label">Microchip</span><span className="rpt-value rpt-mono">{pet.microchip}</span></div>}
                        <div className="rpt-info-item"><span className="rpt-label">Tutor</span><span className="rpt-value">{ownerName}</span></div>
                    </div>
                    {pet.notes && <p className="rpt-notes">Obs: {pet.notes}</p>}
                </section>

                {/* Vaccinations */}
                <section className="rpt-section">
                    <h2 className="rpt-section-title">💉 Carteira de Vacinação</h2>
                    {vaccinations.length === 0 ? (
                        <p className="rpt-empty">Nenhuma vacina registrada.</p>
                    ) : (
                        vaccinations.map((v) => {
                            const imgs = docsFor(documents, v.id);
                            return (
                                <div key={v.id} className="rpt-record-block">
                                    <div className="rpt-record-header">
                                        <span className="rpt-record-title">{v.vaccine_name}</span>
                                        <span className="rpt-record-date">{formatDate(v.date)}</span>
                                    </div>
                                    <div className="rpt-info-grid rpt-info-grid-sm">
                                        {v.vet_name && <div className="rpt-info-item"><span className="rpt-label">Veterinário</span><span className="rpt-value">{v.vet_name}</span></div>}
                                        {v.clinic && <div className="rpt-info-item"><span className="rpt-label">Clínica</span><span className="rpt-value">{v.clinic}</span></div>}
                                        {v.batch && <div className="rpt-info-item"><span className="rpt-label">Lote</span><span className="rpt-value rpt-mono">{v.batch}</span></div>}
                                        {v.manufacturer && <div className="rpt-info-item"><span className="rpt-label">Fabricante</span><span className="rpt-value">{v.manufacturer}</span></div>}
                                        {v.next_due_date && <div className="rpt-info-item"><span className="rpt-label">Próxima Dose</span><span className="rpt-value rpt-next-dose">📅 {formatDate(v.next_due_date)}</span></div>}
                                    </div>
                                    {v.notes && <p className="rpt-notes">Obs: {v.notes}</p>}
                                    {imgs.length > 0 && (
                                        <div className="rpt-img-row">
                                            {imgs.map((img, i) => (
                                                <img key={i} src={img.file_url} alt={img.file_name} className="rpt-img" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </section>

                {/* Consultations */}
                <section className="rpt-section">
                    <h2 className="rpt-section-title">🩺 Consultas Veterinárias</h2>
                    {consultations.length === 0 ? (
                        <p className="rpt-empty">Nenhuma consulta registrada.</p>
                    ) : (
                        consultations.map((c) => {
                            const imgs = docsFor(documents, c.id);
                            return (
                                <div key={c.id} className="rpt-record-block">
                                    <div className="rpt-record-header">
                                        <span className="rpt-record-title">{c.reason}</span>
                                        <span className="rpt-record-date">{formatDate(c.date)}</span>
                                    </div>
                                    <div className="rpt-info-grid rpt-info-grid-sm">
                                        {c.vet_name && <div className="rpt-info-item"><span className="rpt-label">Veterinário</span><span className="rpt-value">{c.vet_name}</span></div>}
                                        {c.clinic && <div className="rpt-info-item"><span className="rpt-label">Clínica</span><span className="rpt-value">{c.clinic}</span></div>}
                                        {c.follow_up_date && <div className="rpt-info-item"><span className="rpt-label">Retorno</span><span className="rpt-value">{formatDate(c.follow_up_date)}</span></div>}
                                    </div>
                                    {c.diagnosis && (
                                        <div className="rpt-text-block">
                                            <span className="rpt-label">Diagnóstico</span>
                                            <p>{c.diagnosis}</p>
                                        </div>
                                    )}
                                    {c.prescription && (
                                        <div className="rpt-text-block rpt-prescription">
                                            <span className="rpt-label">💊 Prescrição / Medicamentos</span>
                                            <p>{c.prescription}</p>
                                        </div>
                                    )}
                                    {c.notes && <p className="rpt-notes">Obs: {c.notes}</p>}
                                    {imgs.length > 0 && (
                                        <div className="rpt-img-row">
                                            {imgs.map((img, i) => (
                                                <img key={i} src={img.file_url} alt={img.file_name} className="rpt-img" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </section>

                {/* Active medications summary extracted from consultations */}
                {consultations.some((c) => c.prescription) && (
                    <section className="rpt-section rpt-meds-section">
                        <h2 className="rpt-section-title">💊 Resumo de Medicamentos Prescritos</h2>
                        <table className="rpt-table">
                            <thead>
                                <tr><th>Data</th><th>Motivo</th><th>Medicamentos</th><th>Veterinário</th></tr>
                            </thead>
                            <tbody>
                                {consultations.filter((c) => c.prescription).map((c) => (
                                    <tr key={c.id}>
                                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(c.date)}</td>
                                        <td>{c.reason}</td>
                                        <td>{c.prescription}</td>
                                        <td>{c.vet_name || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* Occurrences */}
                {occurrences.length > 0 && (
                    <section className="rpt-section">
                        <h2 className="rpt-section-title">📋 Ocorrências e Procedimentos</h2>
                        <table className="rpt-table">
                            <thead>
                                <tr><th>Data</th><th>Tipo</th><th>Descrição</th></tr>
                            </thead>
                            <tbody>
                                {occurrences.map((o) => (
                                    <tr key={o.id}>
                                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(o.date)}</td>
                                        <td>{OCCURRENCE_LABELS[o.type] || o.type}</td>
                                        <td>{o.description || o.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* Footer */}
                <div className="rpt-footer">
                    <p>Este documento foi gerado automaticamente pelo sistema <strong>Pet Passport</strong> em {generatedAt}.</p>
                    <p>As informações aqui contidas são de responsabilidade do tutor do animal.</p>
                </div>
            </div>

            <style>{`
                /* ── Screen ── */
                .report-toolbar {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    padding: var(--space-4) var(--space-8);
                    background: var(--color-bg-secondary);
                    border-bottom: 1px solid var(--color-border);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .report-page {
                    max-width: 800px;
                    margin: var(--space-8) auto;
                    padding: var(--space-8);
                    background: #fff;
                    color: #1a1a2e;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    line-height: 1.6;
                }

                /* ── Header ── */
                .rpt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding-bottom: 16px;
                    border-bottom: 3px solid #0D9488;
                    margin-bottom: 24px;
                }
                .rpt-header-left { display: flex; align-items: center; gap: 14px; }
                .rpt-logo { font-size: 2.5rem; }
                .rpt-title { font-size: 1.4rem; font-weight: 800; color: #0D9488; }
                .rpt-subtitle { font-size: 0.78rem; color: #666; margin-top: 2px; }
                .rpt-date { font-size: 0.78rem; color: #888; white-space: nowrap; }

                /* ── Sections ── */
                .rpt-section { margin-bottom: 28px; }
                .rpt-section-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0D9488;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 6px;
                    margin-bottom: 14px;
                }
                .rpt-empty { color: #999; font-style: italic; font-size: 0.85rem; }

                /* ── Info grid ── */
                .rpt-info-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px 16px;
                    margin-bottom: 8px;
                }
                .rpt-info-grid-sm { grid-template-columns: repeat(3, 1fr); }
                .rpt-info-item { display: flex; flex-direction: column; }
                .rpt-label { font-size: 0.7rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
                .rpt-value { font-weight: 500; color: #1a1a2e; }
                .rpt-mono { font-family: monospace; }
                .rpt-next-dose { color: #D97706; font-weight: 600; }
                .rpt-notes { font-style: italic; color: #666; font-size: 0.85rem; margin-top: 6px; }

                /* ── Record blocks ── */
                .rpt-record-block {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 14px 16px;
                    margin-bottom: 14px;
                    background: #fafafa;
                    page-break-inside: avoid;
                }
                .rpt-record-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .rpt-record-title { font-weight: 700; font-size: 0.95rem; color: #1a1a2e; }
                .rpt-record-date { font-size: 0.82rem; color: #0D9488; font-weight: 600; white-space: nowrap; }

                /* ── Text blocks ── */
                .rpt-text-block { margin: 8px 0; }
                .rpt-text-block p { margin-top: 3px; color: #333; white-space: pre-wrap; }
                .rpt-prescription {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 6px;
                    padding: 8px 12px;
                }
                .rpt-prescription .rpt-label { color: #15803d; }

                /* ── Images ── */
                .rpt-img-row {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 12px;
                }
                .rpt-img {
                    width: 120px;
                    height: 90px;
                    object-fit: cover;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                }

                /* ── Table ── */
                .rpt-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.82rem;
                }
                .rpt-table th {
                    background: #f3f4f6;
                    padding: 7px 10px;
                    text-align: left;
                    font-weight: 600;
                    color: #555;
                    border-bottom: 2px solid #e5e7eb;
                }
                .rpt-table td {
                    padding: 7px 10px;
                    border-bottom: 1px solid #e5e7eb;
                    color: #333;
                    vertical-align: top;
                }
                .rpt-meds-section .rpt-section-title { color: #15803d; }

                /* ── Footer ── */
                .rpt-footer {
                    border-top: 1px solid #e5e7eb;
                    padding-top: 14px;
                    margin-top: 24px;
                    font-size: 0.75rem;
                    color: #999;
                    text-align: center;
                }

                /* ── Print ── */
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .report-page {
                        margin: 0;
                        box-shadow: none;
                        border-radius: 0;
                        max-width: 100%;
                    }
                    .rpt-record-block { page-break-inside: avoid; }
                    .rpt-img { max-width: 110px; }
                    @page { margin: 1.5cm; }
                }
            `}</style>
        </>
    );
}
