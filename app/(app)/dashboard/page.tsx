'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  machines: number;
  activeSites: number;
  openWorkorders: number;
  openIssues: number;
}

const STAT_CARDS: { key: keyof Stats; label: string; href: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
  {
    key: 'machines',
    label: 'Gépek',
    href: '/machines',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    key: 'activeSites',
    label: 'Aktív építkezés',
    href: '/sites',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    key: 'openWorkorders',
    label: 'Nyitott munkalap',
    href: '/workorders',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    key: 'openIssues',
    label: 'Nyitott hiba',
    href: '/issues',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
];

const QUICK_LINKS = [
  { href: '/schedule', label: 'Heti vezénylés', desc: 'Aktuális beütemezés megtekintése', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, accent: true },
  { href: '/shelf', label: 'Polcrendszer', desc: 'QR szkennelés, eszköz ki/be', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, accent: false },
  { href: '/orders', label: 'Megrendelések', desc: 'Anyagrendelések kezelése', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>, accent: false },
  { href: '/workorders', label: 'Új munkalap', desc: 'Szerviz és karbantartás rögzítése', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" /></svg>, accent: false },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => setStats(d.data));
  }, []);

  const today = new Date().toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">{today}</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Áttekintés</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((c) => (
          <Link
            key={c.key}
            href={c.href}
            className="group relative bg-[#111111] border border-[#222222] rounded-2xl p-5 hover:border-[#333333] hover:bg-[#161616] transition-all duration-200 overflow-hidden"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.bg} border ${c.border} mb-4`}>
              <span className={c.color}>{c.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${c.color} mb-1`}>
              {stats ? (stats[c.key] ?? 0) : <span className="inline-block w-12 h-8 bg-[#222] rounded-lg animate-pulse" />}
            </p>
            <p className="text-sm text-gray-500">{c.label}</p>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5 -translate-y-4 translate-x-4">
              <span className={c.color}>{c.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">Gyors elérés</p>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                q.accent
                  ? 'bg-red-600/10 border-red-600/25 hover:bg-red-600/15 hover:border-red-600/40'
                  : 'bg-[#111111] border-[#222222] hover:bg-[#1A1A1A] hover:border-[#333333]'
              }`}
            >
              <span className={`mt-0.5 flex-shrink-0 ${q.accent ? 'text-red-400' : 'text-gray-500'}`}>{q.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${q.accent ? 'text-red-300' : 'text-white'}`}>{q.label}</p>
                <p className="text-xs text-gray-600 mt-0.5">{q.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
