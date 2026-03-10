'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, PawPrint, ArrowLeft, ShieldCheck } from 'lucide-react';

const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'Usuários', icon: Users },
    { href: '/admin/plans', label: 'Planos', icon: CreditCard },
    { href: '/admin/species', label: 'Espécies', icon: PawPrint },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, var(--color-teal), var(--color-teal-dark))' }}>
                    <ShieldCheck size={18} />
                </div>
                <span className="sidebar-logo-text">Admin</span>
            </div>

            <nav className="sidebar-nav">
                {links.map(({ href, label, icon: Icon, exact }) => {
                    const active = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link key={href} href={href} className={`sidebar-link ${active ? 'active' : ''}`}>
                            <Icon size={18} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <Link href="/dashboard" className="sidebar-link">
                    <ArrowLeft size={18} />
                    <span>Voltar ao app</span>
                </Link>
            </div>
        </aside>
    );
}
