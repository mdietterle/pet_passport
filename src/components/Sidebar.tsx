'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  PawPrint,
  LayoutDashboard,
  Heart,
  CreditCard,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/pets', label: 'Meus Pets', icon: PawPrint },
  { href: '/dashboard/plans', label: 'Planos', icon: CreditCard },
  { href: '/dashboard/profile', label: 'Perfil', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await (supabase.from('profiles') as any)
          .select('is_admin')
          .eq('id', user.id)
          .single();
        if (data?.is_admin) setIsAdmin(true);
      }
    }
    checkAdmin();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <PawPrint size={20} />
          </div>
          <span className="sidebar-logo-text">Pet Passport</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className="sidebar-nav-arrow" />}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={`sidebar-nav-item ${isActive('/admin') ? 'active' : ''}`}
            style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}
          >
            <ShieldCheck size={18} />
            <span>Administração</span>
            {isActive('/admin') && <ChevronRight size={14} className="sidebar-nav-arrow" />}
          </Link>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
