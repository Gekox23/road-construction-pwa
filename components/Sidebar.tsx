'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SessionUser } from '../shared/types';
import { hasPermission } from '../shared/utils/permissions';

type NavItem = { href: string; label: string; permission: string | null; badge?: string; icon: React.ReactNode };
type NavGroup = { group: string; items: NavItem[] };

const NAV: NavGroup[] = [
  { group: 'Áttekintés', items: [
    { href: '/dashboard', label: 'Főoldal', permission: null, icon: icon('M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6') },
    { href: '/schedule', label: 'Heti vezénylés', permission: 'schedule.view', icon: icon('M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z') },
  ]},
  { group: 'Eszközök', items: [
    { href: '/machines', label: 'Gépek', permission: 'machine.view', icon: iconD('M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z') },
    { href: '/shelf', label: 'Polcrendszer', permission: 'shelf.view', icon: icon('M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4') },
  ]},
  { group: 'Munka', items: [
    { href: '/sites', label: 'Építkezések', permission: 'site.view', icon: icon('M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z') },
    { href: '/workorders', label: 'Munkalapok', permission: 'workorder.view', icon: icon('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2') },
    { href: '/issues', label: 'Hibakövetés', permission: 'issue.view', icon: icon('M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z') },
    { href: '/orders', label: 'Megrendelések', permission: 'order.view', icon: icon('M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z') },
  ]},
  { group: 'Admin', items: [
    { href: '/finance', label: 'Pénzügy', permission: 'finance.view', icon: icon('M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z') },
    { href: '/admin/users', label: 'Felhasználók', permission: 'user.view', icon: icon('M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z') },
  ]},
];

function icon(d: string) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
function iconD(d: string) {
  const parts = d.split(' M');
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {parts.map((p, i) => <path key={i} d={i === 0 ? p : 'M' + p} />)}
    </svg>
  );
}

export default function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside style={{
      width: 232,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', height: 52, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, background: 'var(--primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', letterSpacing: '-0.01em' }}>Vezénylő</div>
          <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>Mélyépítés</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV.map(group => {
          const visible = group.items.filter(i =>
            i.permission === null || hasPermission(user, i.permission as Parameters<typeof hasPermission>[1])
          );
          if (!visible.length) return null;
          return (
            <div key={group.group} style={{ marginBottom: 18 }}>
              <div className="label" style={{ padding: '8px 10px 5px' }}>{group.group}</div>
              {visible.map(item => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${active ? ' active' : ''}`}
                    style={{ marginBottom: 1 }}
                  >
                    {item.icon}
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>{item.badge}</span>
                    )}
                    {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: '10px 8px 12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8 }}>
          <div className="avatar" style={{ width: 28, height: 28, background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid var(--primary-border)', fontSize: 11, flexShrink: 0 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="nav-item"
          style={{ marginTop: 2 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Kijelentkezés
        </button>
      </div>
    </aside>
  );
}
