'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Camera, Trash2, ZoomIn } from 'lucide-react';
import type { PetPhoto } from '@/lib/supabase/types';

const MAX_PHOTOS = 10;

interface Props {
    petId: string;
    initialPhotos: PetPhoto[];
    readOnly?: boolean;
}

export default function PetPhotoGallery({ petId, initialPhotos, readOnly = false }: Props) {
    const [photos, setPhotos] = useState<PetPhoto[]>(initialPhotos);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const remaining = MAX_PHOTOS - photos.length;

    async function handleUpload(files: FileList | null) {
        if (!files || files.length === 0) return;
        setError('');

        const toUpload = Array.from(files).slice(0, remaining);
        if (toUpload.length === 0) {
            setError(`Limite de ${MAX_PHOTOS} fotos atingido`);
            return;
        }

        setUploading(true);
        try {
            for (const file of toUpload) {
                const fd = new FormData();
                fd.append('file', file);
                fd.append('pet_id', petId);

                const res = await fetch('/api/pets/photos', { method: 'POST', body: fd });
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Erro ao enviar foto');
                    break;
                }

                setPhotos(prev => [...prev, data]);
            }
        } catch {
            setError('Erro ao enviar foto');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    async function handleDelete(photoId: string) {
        setDeleting(photoId);
        setError('');
        try {
            const res = await fetch('/api/pets/photos', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photoId }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Erro ao excluir foto');
                return;
            }

            setPhotos(prev => prev.filter(p => p.id !== photoId));
        } catch {
            setError('Erro ao excluir foto');
        } finally {
            setDeleting(null);
        }
    }

    return (
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div className="card-title"><Camera size={18} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> Galeria de Fotos</div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {photos.length}/{MAX_PHOTOS} fotos
                </span>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-3)', fontSize: '0.85rem' }}>
                    {error}
                </div>
            )}

            {/* Photo grid */}
            <div className="photo-grid">
                {photos.map(photo => (
                    <div key={photo.id} className="photo-item">
                        <img
                            src={photo.file_url}
                            alt={photo.file_name}
                            className="photo-img"
                            onClick={() => setPreview(photo.file_url)}
                        />
                        <button
                            className="photo-zoom"
                            onClick={() => setPreview(photo.file_url)}
                            title="Ampliar"
                        >
                            <ZoomIn size={14} />
                        </button>
                        {!readOnly && (
                            <button
                                className="photo-delete"
                                onClick={() => handleDelete(photo.id)}
                                disabled={deleting === photo.id}
                                title="Excluir foto"
                            >
                                {deleting === photo.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                            </button>
                        )}
                    </div>
                ))}

                {/* Upload button */}
                {!readOnly && remaining > 0 && (
                    <label className="photo-upload-btn">
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/heic"
                            multiple
                            style={{ display: 'none' }}
                            onChange={e => handleUpload(e.target.files)}
                            disabled={uploading}
                        />
                        {uploading ? (
                            <Loader2 size={24} className="spin" />
                        ) : (
                            <>
                                <Upload size={24} />
                                <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>Adicionar</span>
                            </>
                        )}
                    </label>
                )}
            </div>

            {photos.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 'var(--space-3)' }}>
                    Nenhuma foto adicionada ainda. Adicione até {MAX_PHOTOS} fotos do seu pet.
                </p>
            )}

            {/* Lightbox preview */}
            {preview && (
                <div className="photo-lightbox" onClick={() => setPreview(null)}>
                    <button className="photo-lightbox-close" onClick={() => setPreview(null)}>
                        <X size={24} />
                    </button>
                    <img src={preview} alt="Preview" className="photo-lightbox-img" onClick={e => e.stopPropagation()} />
                </div>
            )}

            <style>{`
                .photo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: var(--space-3);
                }
                .photo-item {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    border: 1px solid var(--color-border);
                    background: var(--color-bg-tertiary);
                }
                .photo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .photo-img:hover {
                    transform: scale(1.05);
                }
                .photo-zoom {
                    position: absolute;
                    bottom: 6px;
                    left: 6px;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    border: none;
                    border-radius: var(--radius-sm);
                    padding: 4px;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .photo-item:hover .photo-zoom {
                    opacity: 1;
                }
                .photo-delete {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    background: rgba(239, 68, 68, 0.85);
                    color: white;
                    border: none;
                    border-radius: var(--radius-sm);
                    padding: 4px;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .photo-item:hover .photo-delete {
                    opacity: 1;
                }
                .photo-delete:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .photo-upload-btn {
                    aspect-ratio: 1;
                    border: 2px dashed var(--color-border);
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--color-text-muted);
                    transition: all 0.2s;
                }
                .photo-upload-btn:hover {
                    border-color: var(--color-orange);
                    color: var(--color-orange);
                    background: rgba(249, 115, 22, 0.05);
                }
                .photo-lightbox {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: var(--space-6);
                }
                .photo-lightbox-close {
                    position: absolute;
                    top: var(--space-4);
                    right: var(--space-4);
                    background: rgba(255,255,255,0.15);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .photo-lightbox-img {
                    max-width: 90vw;
                    max-height: 85vh;
                    object-fit: contain;
                    border-radius: var(--radius-lg);
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 600px) {
                    .photo-grid {
                        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
                    }
                }
            `}</style>
        </div>
    );
}
