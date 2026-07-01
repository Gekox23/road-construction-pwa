'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { SessionUser } from '../../shared/types';
import BottomNav from '../../components/BottomNav';
import Sidebar from '../../components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
        else router.push('/login');
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="hidden md:flex">
        <Sidebar user={user} />
        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
      <div className="md:hidden">
        <main className="pb-20 p-4">{children}</main>
        <BottomNav user={user} />
      </div>
    </div>
  );
}
