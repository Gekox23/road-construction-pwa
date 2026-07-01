'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  machines: number;
  activeSites: number;
  openWorkorders: number;
  openIssues: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => setStats(d.data));
  }, []);

  const cards = [
    { label: 'Gép', value: stats?.machines, href: '/machines', color: 'text-blue-400' },
    { label: 'Aktív építkezés', value: stats?.activeSites, href: '/sites', color: 'text-green-400' },
    { label: 'Nyitott munkalap', value: stats?.openWorkorders, href: '/workorders', color: 'text-yellow-400' },
    { label: 'Nyitott hiba', value: stats?.openIssues, href: '/issues', color: 'text-red-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Főoldal</h1>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:bg-gray-800 transition-colors">
            <p className={`text-3xl font-bold ${c.color}`}>
              {stats ? (c.value ?? 0) : <span className="inline-block w-10 h-8 bg-gray-700 rounded animate-pulse" />}
            </p>
            <p className="text-sm text-gray-400 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/schedule" className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 hover:bg-orange-500/20 transition-colors">
          <p className="text-white font-semibold">Heti vezénylés</p>
          <p className="text-gray-400 text-sm mt-1">Aktíuális beütemezés</p>
        </Link>
        <Link href="/shelf" className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:bg-gray-800 transition-colors">
          <p className="text-white font-semibold">Polcrendszer</p>
          <p className="text-gray-400 text-sm mt-1">QR szkennelés</p>
        </Link>
      </div>
    </div>
  );
}
