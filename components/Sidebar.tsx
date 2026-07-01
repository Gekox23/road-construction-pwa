'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SessionUser } from '../shared/types';
import { hasPermission } from '../shared/utils/permissions';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Főoldal', permission: null },
  { href: '/schedule', label: 'Heti vezénylés', permission: 'schedule.view' as const },
  { href: '/machines', label: 'Gépek', permission: 'machine.view' as const },
  { href: '/sites', label: 'Építkezések', permission: 'site.view' as const },
  { href: '/sites/own', label: 'Saját építkezéseim', permission: 'site.view_own' as const },
  { href: '/workorders', label: 'Munkalapok', permission: 'workorder.view' as const },
  { href: '/issues', label: 'Hibabejel.', permission: 'issue.view' as const },
  { href: '/orders', label: 'Megrendelések', permission: 'order.view' as const },
  { href: '/shelf', label: 'Polcrendszer', permission: 'shelf.view' as const },
  { href: '/finance', label: 'Pénzügy', permission: 'finance.view' as const },
  { href: '/admin/users', label: 'Felhasználók', permission: 'user.view' as const },
];

export default function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const visible = NAV_ITEMS.filter((i) => i.permission === null || hasPermission(user, i.permission));

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-50">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{user.name}</p>
            <p className="text-gray-400 text-xs">{user.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {visible.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-5 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-orange-500/10 text-orange-400 border-r-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full h-10 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          Kijelentkezés
        </button>
      </div>
    </aside>
  );
}
