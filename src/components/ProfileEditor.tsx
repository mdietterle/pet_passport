'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getInitials } from '@/lib/userUtils';
import { Camera, Check, Loader2, Pencil, X } from 'lucide-react';

interface Props {
    userId: string;
    initialName: string | null;
    initialAvatarUrl: string | null;
    initialCellphone: string | null;
    initialTaxId: string | null;
    email: string;
}


export default function ProfileEditor({ userId, initialName, initialAvatarUrl, initialCellphone, initialTaxId, email }: Props) {
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(initialName || '');
    const [cellphone, setCellphone] = useState(initialCellphone || '');
    const [taxId, setTaxId] = useState(initialTaxId || '');
    
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');
    const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl || '');
    
    const [editingName, setEditingName] = useState(false);
    const [editingCellphone, setEditingCellphone] = useState(false);
    const [editingTaxId, setEditingTaxId] = useState(false);
    
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [savingName, setSavingName] = useState(false);
    const [savingCellphone, setSavingCellphone] = useState(false);
    const [savingTaxId, setSavingTaxId] = useState(false);
    
    const [avatarError, setAvatarError] = useState('');
    const [nameError, setNameError] = useState('');
    const [cellphoneError, setCellphoneError] = useState('');
    const [taxIdError, setTaxIdError] = useState('');
    
    const [nameSuccess, setNameSuccess] = useState(false);
    const [cellphoneSuccess, setCellphoneSuccess] = useState(false);
    const [taxIdSuccess, setTaxIdSuccess] = useState(false);

    const initials = getInitials(name || initialName, email);

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Immediate local preview
        const objectUrl = URL.createObjectURL(file);
        setAvatarPreview(objectUrl);
        setAvatarError('');
        setUploadingAvatar(true);

        const fd = new FormData();
        fd.append('file', file);

        try {
            const res = await fetch('/api/avatar', { method: 'POST', body: fd });
            const json = await res.json();
            if (!res.ok) {
                setAvatarError(json.error || 'Erro ao enviar imagem.');
                setAvatarPreview(avatarUrl); // revert preview
            } else {
                setAvatarUrl(json.url);
                setAvatarPreview(json.url);
                router.refresh(); // update TopBar
            }
        } catch {
            setAvatarError('Erro de rede ao enviar imagem.');
            setAvatarPreview(avatarUrl);
        } finally {
            setUploadingAvatar(false);
            // Reset file input so re-selecting same file triggers onChange
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    async function handleSaveName() {
        if (!name.trim()) { setNameError('O nome não pode estar vazio.'); return; }
        setSavingName(true);
        setNameError('');
        const { error } = await (supabase.from('profiles') as any)
            .update({ full_name: name.trim() })
            .eq('id', userId);
        setSavingName(false);
        if (error) {
            setNameError('Erro ao salvar. Tente novamente.');
        } else {
            setEditingName(false);
            setNameSuccess(true);
            setTimeout(() => setNameSuccess(false), 3000);
            router.refresh();
        }
    }

    async function handleSaveCellphone() {
        const cleanPhone = cellphone.replace(/\D/g, '');
        if (cleanPhone.length < 10) { setCellphoneError('Insira um telefone válido com DDD.'); return; }
        setSavingCellphone(true);
        setCellphoneError('');
        const { error } = await (supabase.from('profiles') as any)
            .update({ cellphone: cleanPhone })
            .eq('id', userId);
        setSavingCellphone(false);
        if (error) {
            setCellphoneError('Erro ao salvar. Tente novamente.');
        } else {
            setEditingCellphone(false);
            setCellphoneSuccess(true);
            setTimeout(() => setCellphoneSuccess(false), 3000);
            router.refresh();
        }
    }

    async function handleSaveTaxId() {
        const cleanTaxId = taxId.replace(/\D/g, '');
        if (cleanTaxId.length !== 11 && cleanTaxId.length !== 14) { setTaxIdError('Insira um CPF ou CNPJ válido.'); return; }
        setSavingTaxId(true);
        setTaxIdError('');
        const { error } = await (supabase.from('profiles') as any)
            .update({ tax_id: cleanTaxId })
            .eq('id', userId);
        setSavingTaxId(false);
        if (error) {
            setTaxIdError('Erro ao salvar. Tente novamente.');
        } else {
            setEditingTaxId(false);
            setTaxIdSuccess(true);
            setTimeout(() => setTaxIdSuccess(false), 3000);
            router.refresh();
        }
    }

    return (
        <div className="profile-editor-wrap">
            {/* Avatar */}
            <div className="profile-avatar-section">
                <div className="profile-avatar-wrap">
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt={name || email}
                            className="profile-avatar-img"
                        />
                    ) : (
                        <span className="profile-avatar-initials">{initials}</span>
                    )}

                    {uploadingAvatar ? (
                        <div className="profile-avatar-overlay">
                            <Loader2 size={22} className="animate-spin" style={{ color: 'white' }} />
                        </div>
                    ) : (
                        <button
                            className="profile-avatar-overlay profile-avatar-change-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Alterar foto"
                            type="button"
                        >
                            <Camera size={20} style={{ color: 'white' }} />
                        </button>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                />

                <div className="profile-avatar-meta">
                    <p className="profile-avatar-hint">JPG, PNG ou WEBP · máx. 5 MB</p>
                    {avatarError && <p className="profile-avatar-error">{avatarError}</p>}
                </div>
            </div>

            {/* Name field */}
            <div className="profile-field-row">
                <div className="profile-field-label">Nome</div>
                {editingName ? (
                    <div className="profile-field-edit">
                        <input
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                            autoFocus
                            placeholder="Seu nome completo"
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSaveName}
                            disabled={savingName}
                        >
                            {savingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Salvar
                        </button>
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => { setEditingName(false); setName(initialName || ''); setNameError(''); }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="profile-field-value">
                        <span>{name || '—'}</span>
                        {nameSuccess && (
                            <span className="profile-success-tag">
                                <Check size={12} /> Salvo
                            </span>
                        )}
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => setEditingName(true)}
                            title="Editar nome"
                        >
                            <Pencil size={14} />
                        </button>
                    </div>
                )}
                {nameError && <p className="profile-avatar-error" style={{ marginTop: 4 }}>{nameError}</p>}
            </div>

            {/* Cellphone field */}
            <div className="profile-field-row">
                <div className="profile-field-label">Celular (com DDD)</div>
                {editingCellphone ? (
                    <div className="profile-field-edit">
                        <input
                            className="form-input"
                            value={cellphone}
                            onChange={(e) => setCellphone(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCellphone(); if (e.key === 'Escape') setEditingCellphone(false); }}
                            autoFocus
                            placeholder="Ex: 11999999999"
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSaveCellphone}
                            disabled={savingCellphone}
                        >
                            {savingCellphone ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Salvar
                        </button>
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => { setEditingCellphone(false); setCellphone(initialCellphone || ''); setCellphoneError(''); }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="profile-field-value">
                        <span>{cellphone || 'Não informado'}</span>
                        {cellphoneSuccess && (
                            <span className="profile-success-tag">
                                <Check size={12} /> Salvo
                            </span>
                        )}
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => setEditingCellphone(true)}
                            title="Editar celular"
                        >
                            <Pencil size={14} />
                        </button>
                    </div>
                )}
                {cellphoneError && <p className="profile-avatar-error" style={{ marginTop: 4 }}>{cellphoneError}</p>}
            </div>

            {/* Tax ID field */}
            <div className="profile-field-row">
                <div className="profile-field-label">CPF ou CNPJ</div>
                {editingTaxId ? (
                    <div className="profile-field-edit">
                        <input
                            className="form-input"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTaxId(); if (e.key === 'Escape') setEditingTaxId(false); }}
                            autoFocus
                            placeholder="Apenas números"
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSaveTaxId}
                            disabled={savingTaxId}
                        >
                            {savingTaxId ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Salvar
                        </button>
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => { setEditingTaxId(false); setTaxId(initialTaxId || ''); setTaxIdError(''); }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="profile-field-value">
                        <span>{taxId || 'Não informado'}</span>
                        {taxIdSuccess && (
                            <span className="profile-success-tag">
                                <Check size={12} /> Salvo
                            </span>
                        )}
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => setEditingTaxId(true)}
                            title="Editar CPF/CNPJ"
                        >
                            <Pencil size={14} />
                        </button>
                    </div>
                )}
                {taxIdError && <p className="profile-avatar-error" style={{ marginTop: 4 }}>{taxIdError}</p>}
            </div>

            <style>{`
                .profile-editor-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-5);
                }
                .profile-avatar-section {
                    display: flex;
                    align-items: center;
                    gap: var(--space-5);
                }
                .profile-avatar-wrap {
                    position: relative;
                    width: 88px;
                    height: 88px;
                    border-radius: var(--radius-full);
                    flex-shrink: 0;
                    background: linear-gradient(135deg, var(--color-teal), var(--color-teal-dark));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border: 3px solid var(--color-border);
                    box-shadow: var(--shadow-sm);
                }
                .profile-avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: var(--radius-full);
                }
                .profile-avatar-initials {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: white;
                    line-height: 1;
                    user-select: none;
                }
                .profile-avatar-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.45);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-full);
                    opacity: 0;
                    transition: opacity var(--transition-fast);
                }
                .profile-avatar-wrap:hover .profile-avatar-overlay {
                    opacity: 1;
                }
                .profile-avatar-change-btn {
                    border: none;
                    cursor: pointer;
                    width: 100%;
                    height: 100%;
                    padding: 0;
                }
                .profile-avatar-meta {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }
                .profile-avatar-hint {
                    font-size: 0.8rem;
                    color: var(--color-text-muted);
                }
                .profile-avatar-error {
                    font-size: 0.8rem;
                    color: var(--color-red);
                }
                .profile-field-row {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }
                .profile-field-label {
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: var(--color-text-secondary);
                }
                .profile-field-value {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-size: 0.95rem;
                    color: var(--color-text);
                }
                .profile-field-edit {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }
                .profile-success-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    font-size: 0.75rem;
                    color: #065f46;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: var(--radius-full);
                    padding: 2px 8px;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
