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
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1]">
      <div className="hidden md:flex">
        <Sidebar user={user} />
        <main className="flex-1 ml-[220px] min-h-screen">
          <div className="max-w-[1100px] mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
      <div className="md:hidden">
        <main className="pb-14 min-h-screen">
          <div className="p-4">{children}</div>
        </main>
        <BottomNav user={user} />
      </div>
    </div>
  );
}
