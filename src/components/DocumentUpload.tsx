'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileImage, FileBadge, Loader2, Sparkles, ZoomIn } from 'lucide-react';

export interface UploadedDoc {
    url: string;
    path: string;
    name: string;
    type: string;
}

interface Props {
    petId: string;
    /** 'consultation' enables the AI OCR button */
    mode: 'vaccination' | 'consultation' | 'other';
    existingDocs?: UploadedDoc[];
    onDone: (docs: UploadedDoc[]) => void;
    /** Called when AI extracted data from a prescription */
    onAiExtract?: (data: PrescriptionData) => void;
}

export interface PrescriptionData {
    vet_name?: string;
    clinic?: string;
    reason?: string;
    diagnosis?: string;
    prescription?: string;
    follow_up_date?: string;
    notes?: string;
}

const MAX_FILES = 5;

function isImage(type: string) {
    return type.startsWith('image/');
}

export default function DocumentUpload({ petId, mode, existingDocs = [], onDone, onAiExtract }: Props) {
    const [docs, setDocs] = useState<UploadedDoc[]>(existingDocs);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState<string | null>(null); // url being analyzed
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const uploadFiles = useCallback(async (files: FileList | File[]) => {
        const toUpload = Array.from(files).slice(0, MAX_FILES - docs.length);
        if (toUpload.length === 0) return;
        setError('');
        setUploading(true);

        const results: UploadedDoc[] = [];
        for (const file of toUpload) {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('pet_id', petId);

            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const json = await res.json();

            if (!res.ok) {
                setError(json.error || 'Erro no upload');
                break;
            }
            results.push(json as UploadedDoc);
        }

        const updated = [...docs, ...results];
        setDocs(updated);
        onDone(updated);
        setUploading(false);
    }, [docs, petId, onDone]);

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
    }

    function remove(url: string) {
        const updated = docs.filter((d) => d.url !== url);
        setDocs(updated);
        onDone(updated);
    }

    async function analyzeWithAI(doc: UploadedDoc) {
        if (!onAiExtract) return;
        setAnalyzing(doc.url);
        setError('');

        try {
            const res = await fetch('/api/ocr/prescription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: doc.url }),
            });
            const json = await res.json();

            if (!res.ok || json.error) {
                setError(json.error || 'Erro ao analisar imagem');
            } else {
                onAiExtract(json as PrescriptionData);
            }
        } catch {
            setError('Erro ao conectar com a IA');
        }
        setAnalyzing(null);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {/* Drop zone */}
            {docs.length < MAX_FILES && (
                <div
                    className={`upload-zone ${dragOver ? 'upload-zone-active' : ''}`}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                >
                    {uploading ? (
                        <><Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-teal)' }} />
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Enviando...</span></>
                    ) : (
                        <><Upload size={22} style={{ color: 'var(--color-teal)' }} />
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                                Clique ou arraste fotos/PDF aqui
                            </span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                JPG, PNG, WEBP, PDF — máx. 10 MB por arquivo
                            </span></>
                    )}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ''; }}
                    />
                </div>
            )}

            {error && (
                <div className="alert alert-error" style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '0.85rem' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Uploaded files list */}
            {docs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {docs.map((doc) => (
                        <div key={doc.url} className="doc-row">
                            {/* Thumbnail or icon */}
                            <div className="doc-thumbnail" onClick={() => isImage(doc.type) && setPreview(doc.url)} style={{ cursor: isImage(doc.type) ? 'zoom-in' : 'default' }}>
                                {isImage(doc.type)
                                    ? <img src={doc.url} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                                    : <FileBadge size={20} style={{ color: 'var(--color-text-muted)' }} />
                                }
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{doc.type}</div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                {/* AI Analyze button — only for consultation mode and image files */}
                                {mode === 'consultation' && isImage(doc.type) && onAiExtract && (
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        style={{ fontSize: '0.75rem', gap: 4 }}
                                        onClick={() => analyzeWithAI(doc)}
                                        disabled={analyzing === doc.url}
                                        title="Analisar receita com IA"
                                    >
                                        {analyzing === doc.url
                                            ? <Loader2 size={12} className="animate-spin" />
                                            : <Sparkles size={12} />}
                                        {analyzing === doc.url ? 'Analisando...' : 'Preencher com IA'}
                                    </button>
                                )}

                                {/* Preview */}
                                {isImage(doc.type) && (
                                    <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setPreview(doc.url)} title="Ampliar">
                                        <ZoomIn size={14} />
                                    </button>
                                )}

                                {/* Remove */}
                                <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => remove(doc.url)} title="Remover">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox preview */}
            {preview && (
                <div className="lightbox" onClick={() => setPreview(null)}>
                    <img src={preview} alt="Documento" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
                    <button className="lightbox-close" onClick={() => setPreview(null)}><X size={20} /></button>
                </div>
            )}

            <style>{`
        .upload-zone {
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
          transition: all var(--transition-fast);
          background: var(--color-bg-tertiary);
          text-align: center;
        }
        .upload-zone:hover, .upload-zone-active {
          border-color: var(--color-teal);
          background: rgba(13,148,136,0.05);
        }
        .doc-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        .doc-thumbnail {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
        }
        .lightbox-img {
          max-width: 92vw;
          max-height: 88vh;
          border-radius: var(--radius-lg);
          cursor: default;
          box-shadow: 0 0 40px rgba(0,0,0,0.6);
        }
        .lightbox-close {
          position: fixed;
          top: 20px;
          right: 24px;
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lightbox-close:hover { background: rgba(255,255,255,0.25); }
      `}</style>
        </div>
    );
}
