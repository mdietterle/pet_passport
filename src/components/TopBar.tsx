'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getInitials } from '@/lib/userUtils';
import { PLAN_COLORS, PLAN_ICONS } from '@/lib/planUtils';
import { generatePetAlerts, type PetAlert } from '@/lib/petAlerts';
import {
    Bell,
    User,
    CreditCard,
    LogOut,
    ChevronDown,
    AlertTriangle,
    CheckCircle,
    X,
    Zap,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileData {
    full_name: string | null;
    avatar_url: string | null;
    plans: {
        name: string;
        display_name: string;
        price_brl: number;
    } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function notifIconFor(severity: PetAlert['severity']) {
    if (severity === 'urgent' || severity === 'warning') return <AlertTriangle size={15} />;
    return <Bell size={15} />;
}

function notifClassFor(severity: PetAlert['severity']) {
    if (severity === 'urgent') return 'topbar-notif-warning'; // re-use amber style
    if (severity === 'warning') return 'topbar-notif-warning';
    return 'topbar-notif-info';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TopBar() {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [alerts, setAlerts] = useState<PetAlert[]>([]);
    const [bellOpen, setBellOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [readCount, setReadCount] = useState(0);

    const bellRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
            if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        async function load() {
            const { data: { user: u } } = await supabase.auth.getUser();
            if (!u) return;
            setUser(u);

            const { data: prof } = await (supabase.from('profiles') as any)
                .select('full_name, avatar_url, plans(name, display_name, price_brl)')
                .eq('id', u.id)
                .single();
            if (prof) setProfile(prof as ProfileData);

            // Load pets with their vaccinations and weights for alert generation
            const { data: pets } = await (supabase.from('pets') as any)
                .select('id, name, species, breed, birth_date, weight_kg')
                .eq('owner_id', u.id);

            if (!pets || pets.length === 0) return;

            const generatedAlerts: PetAlert[] = [];

            for (const pet of pets as any[]) {
                const { data: vaccinations } = await (supabase.from('vaccinations') as any)
                    .select('date')
                    .eq('pet_id', pet.id);

                const { data: weights } = await (supabase.from('pet_weights') as any)
                    .select('date')
                    .eq('pet_id', pet.id);

                const petAlerts = generatePetAlerts(
                    pet,
                    vaccinations || [],
                    weights || []
                );
                generatedAlerts.push(...petAlerts);
            }

            setAlerts(generatedAlerts.slice(0, 5));
        }
        load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const unreadCount = Math.max(0, alerts.length - readCount);
    const initials = getInitials(profile?.full_name, user?.email);
    const planName = profile?.plans?.name || 'free';
    const planDisplay = profile?.plans?.display_name || 'Gratuito';

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    function handleBellOpen() {
        setBellOpen((v) => !v);
        setAvatarOpen(false);
        if (!bellOpen) setReadCount(alerts.length);
    }

    function handleAvatarOpen() {
        setAvatarOpen((v) => !v);
        setBellOpen(false);
    }

    return (
        <header className="topbar">
            <div className="topbar-left" />

            <div className="topbar-right">
                {/* ── Bell ── */}
                <div className="topbar-dropdown-wrap" ref={bellRef}>
                    <button
                        className="topbar-icon-btn"
                        onClick={handleBellOpen}
                        aria-label="Notificações"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="topbar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                    </button>

                    {bellOpen && (
                        <div className="topbar-dropdown topbar-dropdown-bell">
                            <div className="topbar-dropdown-header">
                                <span className="topbar-dropdown-title">
                                    <Bell size={14} /> Notificações
                                </span>
                                <button
                                    className="topbar-dropdown-close"
                                    onClick={() => setBellOpen(false)}
                                    aria-label="Fechar"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {alerts.length === 0 ? (
                                <div className="topbar-notif-empty">
                                    <CheckCircle size={28} style={{ color: 'var(--color-green)' }} />
                                    <span>Nenhuma notificação</span>
                                </div>
                            ) : (
                                <ul className="topbar-notif-list">
                                    {alerts.map((a, i) => (
                                        <li key={`${a.petId}-${i}`} className={`topbar-notif-item ${notifClassFor(a.severity)}`}>
                                            <div className="topbar-notif-icon">
                                                {notifIconFor(a.severity)}
                                            </div>
                                            <div className="topbar-notif-body">
                                                <div className="topbar-notif-title">{a.icon} {a.petName}</div>
                                                <div className="topbar-notif-msg">{a.message}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Avatar ── */}
                <div className="topbar-dropdown-wrap" ref={avatarRef}>
                    <button
                        className="topbar-avatar-btn"
                        onClick={handleAvatarOpen}
                        aria-label="Menu do usuário"
                    >
                        <div className="topbar-avatar">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt={initials} className="topbar-avatar-img" />
                            ) : (
                                <span className="topbar-avatar-initials">{initials}</span>
                            )}
                        </div>
                        <ChevronDown size={14} className={`topbar-avatar-chevron ${avatarOpen ? 'open' : ''}`} />
                    </button>

                    {avatarOpen && (
                        <div className="topbar-dropdown topbar-dropdown-avatar">
                            {/* User info */}
                            <div className="topbar-user-info">
                                <div className="topbar-avatar topbar-avatar-lg">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt={initials} className="topbar-avatar-img" />
                                    ) : (
                                        <span className="topbar-avatar-initials">{initials}</span>
                                    )}
                                </div>
                                <div className="topbar-user-details">
                                    <div className="topbar-user-name">{profile?.full_name || 'Usuário'}</div>
                                    <div className="topbar-user-email">{user?.email}</div>
                                </div>
                            </div>

                            {/* Plan */}
                            <div className="topbar-plan-row">
                                <span className="topbar-plan-icon">{PLAN_ICONS[planName] ?? '🐾'}</span>
                                <div className="topbar-plan-info">
                                    <div className="topbar-plan-label">Plano atual</div>
                                    <div
                                        className="topbar-plan-name"
                                        style={{ color: PLAN_COLORS[planName] ?? 'var(--color-gray)' }}
                                    >
                                        {planDisplay}
                                    </div>
                                </div>
                                {planName !== 'premium' && (
                                    <Link
                                        href="/dashboard/plans"
                                        className="topbar-plan-upgrade"
                                        onClick={() => setAvatarOpen(false)}
                                    >
                                        <Zap size={11} /> Upgrade
                                    </Link>
                                )}
                            </div>

                            <div className="topbar-dropdown-divider" />

                            <Link
                                href="/dashboard/profile"
                                className="topbar-menu-item"
                                onClick={() => setAvatarOpen(false)}
                            >
                                <User size={15} />
                                <span>Editar Perfil</span>
                            </Link>

                            <Link
                                href="/dashboard/plans"
                                className="topbar-menu-item"
                                onClick={() => setAvatarOpen(false)}
                            >
                                <CreditCard size={15} />
                                <span>Planos e Assinatura</span>
                            </Link>

                            <div className="topbar-dropdown-divider" />

                            <button className="topbar-menu-item topbar-menu-logout" onClick={handleLogout}>
                                <LogOut size={15} />
                                <span>Sair</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
