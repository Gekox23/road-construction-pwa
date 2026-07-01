'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SessionUser } from '../../shared/types';
import BottomNav from '../../components/BottomNav';
import Sidebar from '../../components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); else router.push('/login'); })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 16, height: 16, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return null;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Desktop */}
      <div className="hidden md:flex">
        <Sidebar user={user} />
        <main style={{ marginLeft: 232, flex: 1, minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 28px', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
      {/* Mobile */}
      <div className="md:hidden">
        <main style={{ paddingBottom: 56, minHeight: '100dvh' }}>
          <div style={{ padding: '16px' }}>{children}</div>
        </main>
        <BottomNav user={user} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
