'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  machines: number;
  activeSites: number;
  openWorkorders: number;
  openIssues: number;
}

type StatCard = { key: keyof Stats; label: string; href: string; sub: string; icon: React.ReactNode; valueColor: string; };

const STAT_CARDS: StatCard[] = [
  { key: 'machines', label: 'Gépek', href: '/machines', sub: 'aktív a nyilvtártarban', valueColor: 'text-white',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { key: 'activeSites', label: 'Aktív építkezés', href: '/sites', sub: 'futó projekt', valueColor: 'text-white',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  { key: 'openWorkorders', label: 'Nyitott munkalap', href: '/workorders', sub: 'befejezésre vár', valueColor: 'text-amber-400',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { key: 'openIssues', label: 'Nyitott hiba', href: '/issues', sub: 'megoldásra vár', valueColor: 'text-red-400',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
];

const QUICK: { href: string; label: string; desc: string; primary?: boolean }[] = [
  { href: '/schedule', label: 'Heti vezénylés', desc: 'Aktuális beütemezés', primary: true },
  { href: '/workorders', label: 'Munkalapok', desc: 'Szerviz & karbantartás' },
  { href: '/shelf', label: 'Polcrendszer', desc: 'QR szkennelés' },
  { href: '/orders', label: 'Megrendelések', desc: 'Anyagés eszközrendelés' },
  { href: '/issues', label: 'Hibabejelentés', desc: 'Géphibák rögzítése' },
  { href: '/sites', label: 'Építkezések', desc: 'Projektek áttekintése' },
];

function Skeleton() {
  return <span className="inline-block w-10 h-6 bg-[#222] rounded animate-pulse" />;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats').then(r => r.json()).then(d => setStats(d.data));
  }, []);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Áttekintés</h1>
        <p className="text-[13px] text-[#555] mt-0.5">
          {new Date().toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STAT_CARDS.map(c => (
          <Link key={c.key} href={c.href} className="card-hover p-4 block">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#444]">{c.icon}</span>
              <svg className="w-3.5 h-3.5 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className={`text-2xl font-bold mb-0.5 ${c.valueColor}`}>
              {stats ? stats[c.key] : <Skeleton />}
            </p>
            <p className="text-[12px] text-[#555] font-medium">{c.label}</p>
            <p className="text-[11px] text-[#3a3a3a]">{c.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick access */}
      <div className="mb-2">
        <p className="section-label mb-3">Gyors elérés</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {QUICK.map(q => (
            <Link
              key={q.href}
              href={q.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all duration-150 ${
                q.primary
                  ? 'bg-red-600/10 border-red-600/20 hover:bg-red-600/15 hover:border-red-600/30'
                  : 'bg-[#171717] border-[#252525] hover:bg-[#1c1c1c] hover:border-[#333]'
              }`}
            >
              <div className="min-w-0">
                <p className={`text-[13px] font-semibold ${ q.primary ? 'text-red-300' : 'text-[#ddd]' }`}>{q.label}</p>
                <p className="text-[11px] text-[#555]">{q.desc}</p>
              </div>
              <svg className={`w-3.5 h-3.5 ml-auto flex-shrink-0 ${q.primary ? 'text-red-600' : 'text-[#333]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
