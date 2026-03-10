'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';
import { Plus, Trash2, Edit, Loader2, Syringe, Stethoscope, AlertCircle, X, Check, Paperclip, Sparkles } from 'lucide-react';
import type { Pet, Vaccination, VetConsultation, Occurrence, Plan, PetWeight, ParasiteControl, Medication, ExamAttachment } from '@/lib/supabase/types';
import { OCCURRENCE_TYPE_LABELS, checkPlanLimits } from '@/lib/planLimits';
import { canUploadExams } from '@/lib/planFeatures';
import { formatDate } from '@/lib/dateUtils';
import DocumentUpload, { type UploadedDoc, type PrescriptionData } from '@/components/DocumentUpload';

interface Props {
    pet: Pet;
    vaccinations: Vaccination[];
    consultations: VetConsultation[];
    occurrences: Occurrence[];
    weights: PetWeight[];
    parasites: ParasiteControl[];
    medications: Medication[];
    examAttachments: ExamAttachment[];
    plan: Plan | null;
}

type TabId = 'vaccinations' | 'consultations' | 'occurrences' | 'weights' | 'parasites' | 'medications';

export default function PetTabs({ pet, vaccinations: initVacc, consultations: initConsult, occurrences: initOccur, weights: initWeights, parasites: initParasites, medications: initMeds, examAttachments: initExamAttachments, plan }: Props) {
    const router = useRouter();
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<TabId>('vaccinations');
    const [vaccinations, setVaccinations] = useState(initVacc);
    const [consultations, setConsultations] = useState(initConsult);
    const [occurrences, setOccurrences] = useState(initOccur);
    const [weights, setWeights] = useState(initWeights);
    const [parasites, setParasites] = useState(initParasites);
    const [medications, setMedications] = useState(initMeds);
    const [examAttachments, setExamAttachments] = useState<ExamAttachment[]>(initExamAttachments);
    const [examUploading, setExamUploading] = useState(false);
    const [examConsultId, setExamConsultId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<TabId | null>(null);
    const [editItem, setEditItem] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    // Uploaded docs per modal: reset when modal opens
    const [vaccDocs, setVaccDocs] = useState<UploadedDoc[]>([]);
    const [consultDocs, setConsultDocs] = useState<UploadedDoc[]>([]);
    // Track URLs that are already saved in DB (don't re-insert on save)
    const [existingVaccDocUrls, setExistingVaccDocUrls] = useState<Set<string>>(new Set());
    const [existingConsultDocUrls, setExistingConsultDocUrls] = useState<Set<string>>(new Set());

    const limits = plan ? checkPlanLimits(plan, 0, vaccinations.length, consultations.length, occurrences.length) : null;

    // ─── Vaccination Form ───────────────────────────────────────────────
    const [vaccForm, setVaccForm] = useState({ vaccine_name: '', date: '', next_due_date: '', vet_name: '', clinic: '', batch: '', manufacturer: '', notes: '' });

    async function saveVaccination() {
        console.log('[saveVaccination] vaccDocs at save time:', vaccDocs, 'existingUrls:', Array.from(existingVaccDocUrls));
        setLoading(true);
        const data = { pet_id: pet.id, vaccine_name: vaccForm.vaccine_name, date: vaccForm.date, next_due_date: vaccForm.next_due_date || null, vet_name: vaccForm.vet_name || null, clinic: vaccForm.clinic || null, batch: vaccForm.batch || null, manufacturer: vaccForm.manufacturer || null, notes: vaccForm.notes || null };
        let savedId: string | null = null;
        if (editItem) {
            const { data: updated } = await (supabase.from('vaccinations') as any).update(data).eq('id', editItem.id).select().single();
            if (updated) { setVaccinations((prev) => prev.map((v) => v.id === updated.id ? updated : v)); savedId = updated.id; }
        } else {
            const { data: created } = await (supabase.from('vaccinations') as any).insert(data).select().single();
            if (created) { setVaccinations((prev) => [created, ...prev]); savedId = created.id; }
        }
        // Only insert NET-NEW documents (not ones already in the DB)
        const newDocs = vaccDocs.filter((d) => !existingVaccDocUrls.has(d.url));
        if (savedId && newDocs.length > 0) {
            const { error: docErr } = await (supabase.from('documents') as any).insert(newDocs.map((d) => ({
                pet_id: pet.id, reference_type: 'vaccination', reference_id: savedId,
                file_url: d.url, file_name: d.name, file_type: d.type,
            })));
            if (docErr) console.error('[saveVaccination] document insert error:', docErr);
        }
        setLoading(false);
        closeModal();
    }

    // ─── Consultation Form ──────────────────────────────────────────────
    const [consultForm, setConsultForm] = useState({ date: '', vet_name: '', clinic: '', reason: '', diagnosis: '', prescription: '', cost_brl: '', follow_up_date: '', notes: '' });

    async function saveConsultation() {
        setLoading(true);
        const data = { pet_id: pet.id, date: consultForm.date, vet_name: consultForm.vet_name || null, clinic: consultForm.clinic || null, reason: consultForm.reason, diagnosis: consultForm.diagnosis || null, prescription: consultForm.prescription || null, cost_brl: consultForm.cost_brl ? parseFloat(consultForm.cost_brl) : null, follow_up_date: consultForm.follow_up_date || null, notes: consultForm.notes || null };
        let savedId: string | null = null;
        if (editItem) {
            const { data: updated } = await (supabase.from('vet_consultations') as any).update(data).eq('id', editItem.id).select().single();
            if (updated) { setConsultations((prev) => prev.map((c) => c.id === updated.id ? updated : c)); savedId = updated.id; }
        } else {
            const { data: created } = await (supabase.from('vet_consultations') as any).insert(data).select().single();
            if (created) { setConsultations((prev) => [created, ...prev]); savedId = created.id; }
        }
        if (savedId && consultDocs.length > 0) {
            const newDocs = consultDocs.filter((d) => !existingConsultDocUrls.has(d.url));
            if (newDocs.length > 0) {
                const { error: docErr } = await (supabase.from('documents') as any).insert(newDocs.map((d) => ({
                    pet_id: pet.id, reference_type: 'consultation', reference_id: savedId,
                    file_url: d.url, file_name: d.name, file_type: d.type,
                })));
                if (docErr) console.error('[saveConsultation] document insert error:', docErr);
            }
        }
        setLoading(false);
        closeModal();
    }

    function handleAiExtract(data: PrescriptionData) {
        setConsultForm((prev) => ({
            ...prev,
            vet_name: data.vet_name || prev.vet_name,
            clinic: data.clinic || prev.clinic,
            reason: data.reason || prev.reason,
            diagnosis: data.diagnosis || prev.diagnosis,
            prescription: data.prescription || prev.prescription,
            follow_up_date: data.follow_up_date || prev.follow_up_date,
            notes: data.notes || prev.notes,
        }));
    }

    // ─── Occurrence Form ────────────────────────────────────────────────
    const [occurForm, setOccurForm] = useState({ type: 'other', date: '', description: '', cost_brl: '', notes: '' });

    async function saveOccurrence() {
        setLoading(true);
        const data = { pet_id: pet.id, type: occurForm.type as any, date: occurForm.date, description: occurForm.description || null, cost_brl: occurForm.cost_brl ? parseFloat(occurForm.cost_brl) : null, notes: occurForm.notes || null };
        if (editItem) {
            const { data: updated } = await (supabase.from('occurrences') as any).update(data).eq('id', editItem.id).select().single();
            if (updated) setOccurrences((prev) => prev.map((o) => o.id === updated.id ? updated : o));
        } else {
            const { data: created } = await (supabase.from('occurrences') as any).insert(data).select().single();
            if (created) setOccurrences((prev) => [created, ...prev]);
        }
        setLoading(false);
        closeModal();
    }

    // ─── Weight Form ────────────────────────────────────────────────────
    const [weightForm, setWeightForm] = useState({ date: new Date().toISOString().split('T')[0], weight_kg: '', notes: '' });

    async function saveWeight() {
        setLoading(true);
        const data = { pet_id: pet.id, date: weightForm.date, weight_kg: parseFloat(weightForm.weight_kg), notes: weightForm.notes || null };
        if (editItem) {
            const { data: updated } = await (supabase.from('pet_weights') as any).update(data).eq('id', editItem.id).select().single();
            if (updated) setWeights((prev) => prev.map((w) => w.id === updated.id ? updated : w));
        } else {
            const { data: created } = await (supabase.from('pet_weights') as any).insert(data).select().single();
            if (created) setWeights((prev) => [created, ...prev]);
        }
        setLoading(false);
        closeModal();
    }

    // ─── Parasite Control Form ──────────────────────────────────────────
    const [parasiteForm, setParasiteForm] = useState({ type: 'flea_tick', date: new Date().toISOString().split('T')[0], next_due_date: '', medication_name: '', weight_at_time_kg: '', notes: '' });

    async function saveParasite() {
        setLoading(true);
        const data = {
            pet_id: pet.id,
            type: parasiteForm.type as any,
            date: parasiteForm.date,
            next_due_date: parasiteForm.next_due_date || null,
            medication_name: parasiteForm.medication_name,
            weight_at_time_kg: parasiteForm.weight_at_time_kg ? parseFloat(parasiteForm.weight_at_time_kg) : null,
            notes: parasiteForm.notes || null
        };
        if (editItem) {
            const { data: updated } = await (supabase.from('parasite_controls') as any).update(data).eq('id', editItem.id).select().single();
            if (updated) setParasites((prev) => prev.map((p) => p.id === updated.id ? updated : p));
        } else {
            const { data: created } = await (supabase.from('parasite_controls') as any).insert(data).select().single();
            if (created) setParasites((prev) => [created, ...prev]);
        }
        setLoading(false);
        closeModal();
    }

    // ─── Medications Form ───────────────────────────────────────────────
    const [medForm, setMedForm] = useState({ medication_name: '', dosage: '', frequency: '', start_date: new Date().toISOString().split('T')[0], end_date: '', active: true, notes: '' });

    async function saveMedication() {
        setLoading(true);
        const data = {
            pet_id: pet.id,
            medication_name: medForm.medication_name,
            dosage: medForm.dosage,
            frequency: medForm.frequency || null,
            start_date: medForm.start_date,
            end_date: medForm.end_date || null,
            active: medForm.active,
            notes: medForm.notes || null
        };
        if (editItem) {
            const { data: updated } = await (supabase.from('medications') as any).update(data).eq('id', editItem.id).select().single();
            if (updated) setMedications((prev) => prev.map((m) => m.id === updated.id ? updated : m));
        } else {
            const { data: created } = await (supabase.from('medications') as any).insert(data).select().single();
            if (created) setMedications((prev) => [created, ...prev]);
        }
        setLoading(false);
        closeModal();
    }

    // ─── Delete ─────────────────────────────────────────────────────────
    async function handleDelete(tab: TabId, id: string) {
        setDeleteId(id);
        const table = tab === 'vaccinations' ? 'vaccinations' : tab === 'consultations' ? 'vet_consultations' : tab === 'occurrences' ? 'occurrences' : tab === 'weights' ? 'pet_weights' : tab === 'parasites' ? 'parasite_controls' : 'medications';
        await (supabase.from(table) as any).delete().eq('id', id);
        if (tab === 'vaccinations') setVaccinations((prev) => prev.filter((v) => v.id !== id));
        if (tab === 'consultations') setConsultations((prev) => prev.filter((c) => c.id !== id));
        if (tab === 'occurrences') setOccurrences((prev) => prev.filter((o) => o.id !== id));
        if (tab === 'weights') setWeights((prev) => prev.filter((w) => w.id !== id));
        if (tab === 'parasites') setParasites((prev) => prev.filter((p) => p.id !== id));
        if (tab === 'medications') setMedications((prev) => prev.filter((m) => m.id !== id));
        setDeleteId(null);
    }

    async function openEdit(tab: TabId, item: any) {
        setEditItem(item);
        if (tab === 'vaccinations') setVaccForm({ vaccine_name: item.vaccine_name, date: item.date, next_due_date: item.next_due_date || '', vet_name: item.vet_name || '', clinic: item.clinic || '', batch: item.batch || '', manufacturer: item.manufacturer || '', notes: item.notes || '' });
        if (tab === 'consultations') setConsultForm({ date: item.date, vet_name: item.vet_name || '', clinic: item.clinic || '', reason: item.reason, diagnosis: item.diagnosis || '', prescription: item.prescription || '', cost_brl: item.cost_brl?.toString() || '', follow_up_date: item.follow_up_date || '', notes: item.notes || '' });
        if (tab === 'occurrences') setOccurForm({ type: item.type, date: item.date, description: item.description || '', cost_brl: item.cost_brl?.toString() || '', notes: item.notes || '' });
        if (tab === 'weights') setWeightForm({ date: item.date, weight_kg: item.weight_kg?.toString() || '', notes: item.notes || '' });
        if (tab === 'parasites') setParasiteForm({ type: item.type, date: item.date, next_due_date: item.next_due_date || '', medication_name: item.medication_name || '', weight_at_time_kg: item.weight_at_time_kg?.toString() || '', notes: item.notes || '' });

        // Fetch existing documents for this record (no alias — PostgREST doesn't support AS)
        const { data: docs, error: docsError } = await supabase
            .from('documents')
            .select('file_url, file_name, file_type')
            .eq('reference_id', item.id);

        if (docsError) console.error('[openEdit] documents query error:', docsError);
        console.log('[openEdit] docs fetched for', item.id, docs);

        const mapped = (docs || []).map((d: any) => ({
            url: d.file_url,
            path: d.file_url,
            name: d.file_name,
            type: d.file_type || 'image/jpeg',
        }));

        const urlSet = new Set(mapped.map((d) => d.url));
        if (tab === 'vaccinations') { setVaccDocs(mapped); setExistingVaccDocUrls(urlSet); }
        if (tab === 'consultations') { setConsultDocs(mapped); setExistingConsultDocUrls(urlSet); }

        setShowModal(tab);
    }


    function closeModal() {
        setShowModal(null);
        setEditItem(null);
        setVaccDocs([]);
        setConsultDocs([]);
        setExistingVaccDocUrls(new Set());
        setExistingConsultDocUrls(new Set());
        setVaccForm({ vaccine_name: '', date: '', next_due_date: '', vet_name: '', clinic: '', batch: '', manufacturer: '', notes: '' });
        setConsultForm({ date: '', vet_name: '', clinic: '', reason: '', diagnosis: '', prescription: '', cost_brl: '', follow_up_date: '', notes: '' });
        setOccurForm({ type: 'other', date: '', description: '', cost_brl: '', notes: '' });
        setWeightForm({ date: new Date().toISOString().split('T')[0], weight_kg: '', notes: '' });
        setParasiteForm({ type: 'flea_tick', date: new Date().toISOString().split('T')[0], next_due_date: '', medication_name: '', weight_at_time_kg: '', notes: '' });
        setMedForm({ medication_name: '', dosage: '', frequency: '', start_date: new Date().toISOString().split('T')[0], end_date: '', active: true, notes: '' });
    }

    return (
        <>
            {/* Tabs */}
            <div className="tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px' }}>
                <button className={`tab ${activeTab === 'vaccinations' ? 'active' : ''}`} onClick={() => setActiveTab('vaccinations')}>
                    <Syringe size={16} /> Vacinas ({vaccinations.length})
                </button>
                <button className={`tab ${activeTab === 'consultations' ? 'active' : ''}`} onClick={() => setActiveTab('consultations')}>
                    <Stethoscope size={16} /> Consultas ({consultations.length})
                </button>
                <button className={`tab ${activeTab === 'occurrences' ? 'active' : ''}`} onClick={() => setActiveTab('occurrences')}>
                    <AlertCircle size={16} /> Ocorrências ({occurrences.length})
                </button>
                <button className={`tab ${activeTab === 'weights' ? 'active' : ''}`} onClick={() => setActiveTab('weights')}>
                    Peso ({weights.length})
                </button>
                <button className={`tab ${activeTab === 'parasites' ? 'active' : ''}`} onClick={() => setActiveTab('parasites')}>
                    Parasitas ({parasites.length})
                </button>
                <button className={`tab ${activeTab === 'medications' ? 'active' : ''}`} onClick={() => setActiveTab('medications')}>
                    Medicamentos ({medications.length})
                </button>
            </div>

            {/* ─── VACCINATIONS ─── */}
            {activeTab === 'vaccinations' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
                        {limits && !limits.canAddVaccination ? (
                            <div className="alert alert-warning" style={{ flex: 1 }}>
                                ⚠️ Limite de vacinas atingido no seu plano. <a href="/dashboard/plans" style={{ color: 'var(--color-amber-light)', fontWeight: 600 }}>Fazer upgrade</a>
                            </div>
                        ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setVaccForm({ vaccine_name: '', date: '', next_due_date: '', vet_name: '', clinic: '', batch: '', manufacturer: '', notes: '' }); setShowModal('vaccinations'); }}>
                                <Plus size={16} /> Adicionar Vacina
                            </button>
                        )}
                    </div>
                    {vaccinations.length === 0 ? (
                        <div className="empty-state card"><div className="empty-state-icon">💉</div><p className="empty-state-title">Nenhuma vacina registrada</p></div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Vacina</th><th>Data</th><th>Próxima dose</th><th>Veterinário</th><th>Lote</th><th></th></tr></thead>
                                <tbody>
                                    {vaccinations.map((v) => (
                                        <tr key={v.id}>
                                            <td style={{ fontWeight: 600 }}>{v.vaccine_name}</td>
                                            <td>{formatDate(v.date)}</td>
                                            <td>{v.next_due_date ? <span className="badge badge-amber">{formatDate(v.next_due_date)}</span> : '—'}</td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{v.vet_name || '—'}</td>
                                            <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{v.batch || '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit('vaccinations', v)}><Edit size={14} /></button>
                                                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete('vaccinations', v.id)} disabled={deleteId === v.id}>{deleteId === v.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ─── CONSULTATIONS ─── */}
            {activeTab === 'consultations' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
                        {limits && !limits.canAddConsultation ? (
                            <div className="alert alert-warning" style={{ flex: 1 }}>
                                ⚠️ Limite de consultas atingido. <a href="/dashboard/plans" style={{ color: 'var(--color-amber-light)', fontWeight: 600 }}>Fazer upgrade</a>
                            </div>
                        ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setConsultForm({ date: '', vet_name: '', clinic: '', reason: '', diagnosis: '', prescription: '', cost_brl: '', follow_up_date: '', notes: '' }); setShowModal('consultations'); }}>
                                <Plus size={16} /> Adicionar Consulta
                            </button>
                        )}
                    </div>
                    {consultations.length === 0 ? (
                        <div className="empty-state card"><div className="empty-state-icon">🩺</div><p className="empty-state-title">Nenhuma consulta registrada</p></div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Data</th><th>Motivo</th><th>Veterinário</th><th>Clínica</th><th>Custo</th><th></th></tr></thead>
                                <tbody>
                                    {consultations.map((c) => (
                                        <tr key={c.id}>
                                            <td style={{ whiteSpace: 'nowrap' }}>{formatDate(c.date)}</td>
                                            <td style={{ fontWeight: 600 }}>{c.reason}</td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{c.vet_name || '—'}</td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{c.clinic || '—'}</td>
                                            <td>{c.cost_brl ? `R$ ${c.cost_brl.toFixed(2)}` : '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit('consultations', c)}><Edit size={14} /></button>
                                                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete('consultations', c.id)} disabled={deleteId === c.id}>{deleteId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Exam Gallery */}
                    {consultations.length > 0 && (
                        <div style={{ marginTop: 'var(--space-6)' }}>
                            <div className="card-header" style={{ marginBottom: 'var(--space-3)' }}>
                                <h3 className="card-title" style={{ fontSize: '1rem' }}>📎 Galeria de Exames</h3>
                            </div>
                            {consultations.map(c => {
                                const attachs = examAttachments.filter(a => a.consultation_id === c.id);
                                return (
                                    <div key={c.id} className="exam-section">
                                        <div className="exam-section-header">
                                            <span className="exam-consult-label">{formatDate(c.date)} — {c.reason}</span>
                                            {canUploadExams(plan) ? (
                                                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                                                    {examUploading && examConsultId === c.id
                                                        ? <><Loader2 size={13} className="animate-spin" /> Enviando...</>
                                                        : <><Paperclip size={13} /> Anexar</>}
                                                    <input type="file" style={{ display: 'none' }} accept="image/*,.pdf"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            setExamUploading(true); setExamConsultId(c.id);
                                                            const fd = new FormData();
                                                            fd.append('file', file); fd.append('pet_id', pet.id); fd.append('consultation_id', c.id);
                                                            const res = await fetch('/api/upload', { method: 'POST', body: fd });
                                                            if (res.ok) {
                                                                const json = await res.json();
                                                                setExamAttachments(prev => [{ id: Date.now().toString(), pet_id: pet.id, consultation_id: c.id, name: json.name, file_url: json.url, file_type: json.type, uploaded_at: new Date().toISOString() }, ...prev]);
                                                            }
                                                            setExamUploading(false); setExamConsultId(null);
                                                        }}
                                                    />
                                                </label>
                                            ) : (
                                                <a href="/dashboard/plans" className="btn btn-warning btn-sm" style={{ fontSize: '0.75rem' }}>
                                                    🔒 Upgrade para Basic
                                                </a>
                                            )}
                                        </div>
                                        {attachs.length > 0 ? (
                                            <div className="exam-grid">
                                                {attachs.map(a => (
                                                    <a key={a.id} href={a.file_url} target="_blank" rel="noopener noreferrer" className="exam-item">
                                                        {a.file_type === 'application/pdf'
                                                            ? <div className="exam-thumb-pdf">PDF</div>
                                                            : <img src={a.file_url} alt={a.name} className="exam-thumb" />}
                                                        <span className="exam-name">{a.name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="exam-empty">Nenhum exame anexado.</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'occurrences' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
                        {limits && !limits.canAddOccurrence ? (
                            <div className="alert alert-warning" style={{ flex: 1 }}>
                                ⚠️ Limite de ocorrências atingido. <a href="/dashboard/plans" style={{ color: 'var(--color-amber-light)', fontWeight: 600 }}>Fazer upgrade</a>
                            </div>
                        ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setOccurForm({ type: 'other', date: '', description: '', cost_brl: '', notes: '' }); setShowModal('occurrences'); }}>
                                <Plus size={16} /> Adicionar Ocorrência
                            </button>
                        )}
                    </div>
                    {occurrences.length === 0 ? (
                        <div className="empty-state card"><div className="empty-state-icon">📋</div><p className="empty-state-title">Nenhuma ocorrência registrada</p></div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Tipo</th><th>Data</th><th>Descrição</th><th>Custo</th><th></th></tr></thead>
                                <tbody>
                                    {occurrences.map((o) => (
                                        <tr key={o.id}>
                                            <td><span className="badge badge-teal">{OCCURRENCE_TYPE_LABELS[o.type] || o.type}</span></td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{formatDate(o.date)}</td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{o.description || '—'}</td>
                                            <td>{o.cost_brl ? `R$ ${o.cost_brl.toFixed(2)}` : '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit('occurrences', o)}><Edit size={14} /></button>
                                                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete('occurrences', o.id)} disabled={deleteId === o.id}>{deleteId === o.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ─── WEIGHTS ─── */}
            {activeTab === 'weights' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setWeightForm({ date: new Date().toISOString().split('T')[0], weight_kg: '', notes: '' }); setShowModal('weights'); }}>
                            <Plus size={16} /> Registrar Peso
                        </button>
                    </div>
                    {weights.length === 0 ? (
                        <div className="empty-state card">
                            <div className="empty-state-icon">⚖️</div>
                            <p className="empty-state-title">Nenhum peso registrado</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Data</th><th>Peso (kg)</th><th>Observações</th><th></th></tr></thead>
                                <tbody>
                                    {weights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((w) => (
                                        <tr key={w.id}>
                                            <td style={{ whiteSpace: 'nowrap' }}>{formatDate(w.date)}</td>
                                            <td style={{ fontWeight: 600 }}>{w.weight_kg} kg</td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{w.notes || '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit('weights', w)}><Edit size={14} /></button>
                                                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete('weights', w.id)} disabled={deleteId === w.id}>{deleteId === w.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ─── PARASITE CONTROLS ─── */}
            {activeTab === 'parasites' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setParasiteForm({ type: 'flea_tick', date: new Date().toISOString().split('T')[0], next_due_date: '', medication_name: '', weight_at_time_kg: '', notes: '' }); setShowModal('parasites'); }}>
                            <Plus size={16} /> Registrar Controle
                        </button>
                    </div>
                    {parasites.length === 0 ? (
                        <div className="empty-state card">
                            <div className="empty-state-icon">🛡️</div>
                            <p className="empty-state-title">Nenhum controle registrado</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Tipo</th><th>Remédio</th><th>Aplicado em</th><th>Próxima dose</th><th></th></tr></thead>
                                <tbody>
                                    {parasites.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((p) => {
                                        const isDue = p.next_due_date && new Date(p.next_due_date) < new Date();
                                        return (
                                            <tr key={p.id}>
                                                <td>
                                                    {p.type === 'flea_tick' ? 'Antipulgas' : 'Vermífugo'}
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{p.medication_name}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.date)}</td>
                                                <td>
                                                    {p.next_due_date ? (
                                                        <span className={`badge ${isDue ? 'badge-amber' : 'badge-teal'}`}>
                                                            {formatDate(p.next_due_date)}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit('parasites', p)}><Edit size={14} /></button>
                                                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete('parasites', p.id)} disabled={deleteId === p.id}>{deleteId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ─── MEDICATIONS ─── */}
            {activeTab === 'medications' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setMedForm({ medication_name: '', dosage: '', frequency: '', start_date: new Date().toISOString().split('T')[0], end_date: '', active: true, notes: '' }); setShowModal('medications'); }}>
                            <Plus size={16} /> Adicionar Remédio
                        </button>
                    </div>
                    {medications.length === 0 ? (
                        <div className="empty-state card">
                            <div className="empty-state-icon">💊</div>
                            <p className="empty-state-title">Nenhum remédio registrado</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Remédio</th><th>Dosagem</th><th>Frequência</th><th>Período</th><th>Status</th><th></th></tr></thead>
                                <tbody>
                                    {medications.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).map((m) => (
                                        <tr key={m.id}>
                                            <td style={{ fontWeight: 600 }}>{m.medication_name}</td>
                                            <td>{m.dosage}</td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{m.frequency || '—'}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {formatDate(m.start_date)} até {m.end_date ? formatDate(m.end_date) : 'Contínuo'}
                                            </td>
                                            <td>
                                                <span className={`badge ${m.active ? 'badge-teal' : 'badge-gray'}`}>
                                                    {m.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit('medications', m)}><Edit size={14} /></button>
                                                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete('medications', m.id)} disabled={deleteId === m.id}>{deleteId === m.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ─── MODALS ─── */}
            {showModal === 'vaccinations' && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">{editItem ? 'Editar Vacina' : 'Nova Vacina'}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(null)}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div className="form-grid">
                                <div className="form-group form-full">
                                    <label className="form-label">Nome da vacina *</label>
                                    <input className="form-input" placeholder="Ex: V10, Antirrábica..." value={vaccForm.vaccine_name} onChange={(e) => setVaccForm((p) => ({ ...p, vaccine_name: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Data de aplicação *</label>
                                    <input type="date" className="form-input" value={vaccForm.date} onChange={(e) => setVaccForm((p) => ({ ...p, date: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Próxima dose</label>
                                    <input type="date" className="form-input" value={vaccForm.next_due_date} onChange={(e) => setVaccForm((p) => ({ ...p, next_due_date: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Veterinário</label>
                                    <input className="form-input" placeholder="Nome do veterinário" value={vaccForm.vet_name} onChange={(e) => setVaccForm((p) => ({ ...p, vet_name: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Clínica</label>
                                    <input className="form-input" placeholder="Nome da clínica" value={vaccForm.clinic} onChange={(e) => setVaccForm((p) => ({ ...p, clinic: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Lote</label>
                                    <input className="form-input" placeholder="Número do lote" value={vaccForm.batch} onChange={(e) => setVaccForm((p) => ({ ...p, batch: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Fabricante</label>
                                    <input className="form-input" placeholder="Fabricante" value={vaccForm.manufacturer} onChange={(e) => setVaccForm((p) => ({ ...p, manufacturer: e.target.value }))} />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Observações</label>
                                    <textarea className="form-textarea" rows={2} value={vaccForm.notes} onChange={(e) => setVaccForm((p) => ({ ...p, notes: e.target.value }))} />
                                </div>
                            </div>
                            {/* Document upload */}
                            <div>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-2)' }}>
                                    <Paperclip size={14} /> Fotos do selo / carteirinha
                                </label>
                                <DocumentUpload petId={pet.id} mode="vaccination" existingDocs={vaccDocs} onDone={setVaccDocs} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={saveVaccination} disabled={loading || !vaccForm.vaccine_name || !vaccForm.date}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal === 'consultations' && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">{editItem ? 'Editar Consulta' : 'Nova Consulta'}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(null)}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {/* AI upload tip */}
                            <div className="alert alert-info" style={{ fontSize: '0.82rem', padding: 'var(--space-2) var(--space-3)' }}>
                                <Sparkles size={14} style={{ color: 'var(--color-teal)', flexShrink: 0 }} />
                                <span>Faça upload de uma receita veterinária e clique em <strong>Preencher com IA</strong> para preencher os campos automaticamente.</span>
                            </div>
                            {/* Document upload with AI */}
                            <div>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-2)' }}>
                                    <Paperclip size={14} /> Receitas / documentos
                                </label>
                                <DocumentUpload petId={pet.id} mode="consultation" existingDocs={consultDocs} onDone={setConsultDocs} onAiExtract={handleAiExtract} />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Data *</label>
                                    <input type="date" className="form-input" value={consultForm.date} onChange={(e) => setConsultForm((p) => ({ ...p, date: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Custo (R$)</label>
                                    <input type="number" step="0.01" min="0" className="form-input" placeholder="0,00" value={consultForm.cost_brl} onChange={(e) => setConsultForm((p) => ({ ...p, cost_brl: e.target.value }))} />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Motivo da consulta *</label>
                                    <input className="form-input" placeholder="Ex: Check-up anual, Vômito persistente..." value={consultForm.reason} onChange={(e) => setConsultForm((p) => ({ ...p, reason: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Veterinário</label>
                                    <input className="form-input" value={consultForm.vet_name} onChange={(e) => setConsultForm((p) => ({ ...p, vet_name: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Clínica</label>
                                    <input className="form-input" value={consultForm.clinic} onChange={(e) => setConsultForm((p) => ({ ...p, clinic: e.target.value }))} />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Diagnóstico</label>
                                    <textarea className="form-textarea" rows={2} value={consultForm.diagnosis} onChange={(e) => setConsultForm((p) => ({ ...p, diagnosis: e.target.value }))} />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Prescrição / Medicamentos</label>
                                    <textarea className="form-textarea" rows={2} value={consultForm.prescription} onChange={(e) => setConsultForm((p) => ({ ...p, prescription: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Retorno</label>
                                    <input type="date" className="form-input" value={consultForm.follow_up_date} onChange={(e) => setConsultForm((p) => ({ ...p, follow_up_date: e.target.value }))} />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Observações</label>
                                    <textarea className="form-textarea" rows={2} value={consultForm.notes} onChange={(e) => setConsultForm((p) => ({ ...p, notes: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                            <button className="btn btn-primary" onClick={saveConsultation} disabled={loading || !consultForm.date || !consultForm.reason}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal === 'occurrences' && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">{editItem ? 'Editar Ocorrência' : 'Nova Ocorrência'}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(null)}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Tipo *</label>
                                    <select className="form-select" value={occurForm.type} onChange={(e) => setOccurForm((p) => ({ ...p, type: e.target.value }))}>
                                        {Object.entries(OCCURRENCE_TYPE_LABELS).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Data *</label>
                                    <input type="date" className="form-input" value={occurForm.date} onChange={(e) => setOccurForm((p) => ({ ...p, date: e.target.value }))} required />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Descrição</label>
                                    <input className="form-input" placeholder="Descreva o ocorrido..." value={occurForm.description} onChange={(e) => setOccurForm((p) => ({ ...p, description: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Custo (R$)</label>
                                    <input type="number" step="0.01" min="0" className="form-input" placeholder="0,00" value={occurForm.cost_brl} onChange={(e) => setOccurForm((p) => ({ ...p, cost_brl: e.target.value }))} />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Observações</label>
                                    <textarea className="form-textarea" rows={2} value={occurForm.notes} onChange={(e) => setOccurForm((p) => ({ ...p, notes: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={saveOccurrence} disabled={loading || !occurForm.date}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal === 'weights' && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">{editItem ? 'Editar Peso' : 'Registrar Peso'}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(null)}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Data *</label>
                                    <input type="date" className="form-input" value={weightForm.date} onChange={(e) => setWeightForm((p) => ({ ...p, date: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Peso (kg) *</label>
                                    <input type="number" step="0.01" min="0" className="form-input" placeholder="0.00" value={weightForm.weight_kg} onChange={(e) => setWeightForm((p) => ({ ...p, weight_kg: e.target.value }))} required />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Observações</label>
                                    <textarea className="form-textarea" rows={2} value={weightForm.notes} onChange={(e) => setWeightForm((p) => ({ ...p, notes: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={saveWeight} disabled={loading || !weightForm.date || !weightForm.weight_kg}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal === 'parasites' && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">{editItem ? 'Editar Controle' : 'Registrar Controle de Parasitas'}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(null)}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div className="form-grid">
                                <div className="form-group form-full">
                                    <label className="form-label">Tipo *</label>
                                    <select className="form-select" value={parasiteForm.type} onChange={(e) => setParasiteForm((p) => ({ ...p, type: e.target.value }))}>
                                        <option value="flea_tick">Antipulgas / Carrapatos</option>
                                        <option value="deworming">Vermífugo</option>
                                    </select>
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Nome do Remédio *</label>
                                    <input className="form-input" placeholder="Ex: Bravecto, Nexgard, Drontal..." value={parasiteForm.medication_name} onChange={(e) => setParasiteForm((p) => ({ ...p, medication_name: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Data de Aplicação *</label>
                                    <input type="date" className="form-input" value={parasiteForm.date} onChange={(e) => setParasiteForm((p) => ({ ...p, date: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Próxima Dose Em</label>
                                    <input type="date" className="form-input" value={parasiteForm.next_due_date} onChange={(e) => setParasiteForm((p) => ({ ...p, next_due_date: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Peso na hora (kg)</label>
                                    <input type="number" step="0.01" min="0" className="form-input" placeholder="Peso serviu de base..." value={parasiteForm.weight_at_time_kg} onChange={(e) => setParasiteForm((p) => ({ ...p, weight_at_time_kg: e.target.value }))} />
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Observações</label>
                                    <textarea className="form-textarea" rows={2} value={parasiteForm.notes} onChange={(e) => setParasiteForm((p) => ({ ...p, notes: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={saveParasite} disabled={loading || !parasiteForm.date || !parasiteForm.medication_name}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal === 'medications' && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">{editItem ? 'Editar Remédio' : 'Adicionar Remédio de Rotina'}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(null)}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div className="form-grid">
                                <div className="form-group form-full">
                                    <label className="form-label">Nome do Remédio *</label>
                                    <input className="form-input" placeholder="Ex: Apoquel, Insulina..." value={medForm.medication_name} onChange={(e) => setMedForm((p) => ({ ...p, medication_name: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dosagem *</label>
                                    <input className="form-input" placeholder="Ex: 5mg, 1/2 comprimido..." value={medForm.dosage} onChange={(e) => setMedForm((p) => ({ ...p, dosage: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Frequência</label>
                                    <input className="form-input" placeholder="Ex: A cada 12h, 1x ao dia..." value={medForm.frequency} onChange={(e) => setMedForm((p) => ({ ...p, frequency: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Data de Início *</label>
                                    <input type="date" className="form-input" value={medForm.start_date} onChange={(e) => setMedForm((p) => ({ ...p, start_date: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Data de Término</label>
                                    <input type="date" className="form-input" value={medForm.end_date} onChange={(e) => setMedForm((p) => ({ ...p, end_date: e.target.value }))} />
                                </div>
                                <div className="form-group form-full" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <input type="checkbox" id="med-active-chk" checked={medForm.active} onChange={(e) => setMedForm((p) => ({ ...p, active: e.target.checked }))} />
                                    <label htmlFor="med-active-chk" style={{ cursor: 'pointer', margin: 0 }}>Tratamento está ativo atualmente</label>
                                </div>
                                <div className="form-group form-full">
                                    <label className="form-label">Observações</label>
                                    <textarea className="form-textarea" rows={2} value={medForm.notes} onChange={(e) => setMedForm((p) => ({ ...p, notes: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={saveMedication} disabled={loading || !medForm.start_date || !medForm.medication_name || !medForm.dosage}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
