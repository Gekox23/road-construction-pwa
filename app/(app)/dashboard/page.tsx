'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  machines: number;
  activeSites: number;
  openWorkorders: number;
  openIssues: number;
}

type StatCard = {
  key: keyof Stats;
  label: string;
  sub: string;
  href: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  icon: React.ReactNode;
};

const STAT_CARDS: StatCard[] = [
  {
    key: 'machines', label: 'Gépek', sub: 'nyilvántartott', href: '/machines',
    iconBg: 'var(--blue-bg)', iconColor: 'var(--blue)', valueColor: 'var(--text)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'activeSites', label: 'Aktív építkezés', sub: 'futó projekt', href: '/sites',
    iconBg: 'var(--success-bg)', iconColor: 'var(--success)', valueColor: 'var(--success)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    key: 'openWorkorders', label: 'Nyitott munkalap', sub: 'befejezésre vár', href: '/workorders',
    iconBg: 'var(--warning-bg)', iconColor: 'var(--warning)', valueColor: 'var(--warning)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    key: 'openIssues', label: 'Nyitott hiba', sub: 'megoldásra vár', href: '/issues',
    iconBg: 'var(--error-bg)', iconColor: 'var(--error)', valueColor: 'var(--error)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
];

const QUICK: { href: string; label: string; desc: string; primary?: boolean }[] = [
  { href: '/schedule', label: 'Heti vezénylés', desc: 'Aktuális beütemezés', primary: true },
  { href: '/workorders', label: 'Munkalapok', desc: 'Szerviz & karbantartás' },
  { href: '/shelf', label: 'Polcrendszer', desc: 'QR szkennelés' },
  { href: '/orders', label: 'Megrendelések', desc: 'Anyag & eszköz' },
  { href: '/issues', label: 'Hibabejelentés', desc: 'Géphiba rögzítése' },
  { href: '/sites', label: 'Építkezések', desc: 'Projektek áttekintése' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats').then(r => r.json()).then(d => setStats(d.data));
  }, []);

  const today = new Date().toLocaleDateString('hu-HU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="label" style={{ marginBottom: 4 }}>{today}</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>Áttekintés</h1>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }} className="lg-4col">
        {STAT_CARDS.map(c => (
          <Link key={c.key} href={c.href} className="card-hover" style={{ display: 'block', padding: '18px 20px', textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: c.iconBg, color: c.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              {c.icon}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: c.valueColor, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {stats ? stats[c.key] : <span style={{ display: 'inline-block', width: 40, height: 28, background: 'var(--surface-off)', borderRadius: 6, animation: 'pulse 1.4s ease-in-out infinite' }} />}
              </span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{c.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick access */}
      <div className="label" style={{ marginBottom: 10 }}>Gyors elérés</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }} className="lg-3col">
        {QUICK.map(q => (
          <Link
            key={q.href}
            href={q.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 10,
              border: q.primary ? '1px solid var(--primary-border)' : '1px solid var(--border)',
              background: q.primary ? 'var(--primary-bg)' : 'var(--surface)',
              textDecoration: 'none',
              transition: 'all var(--t)',
            }}
            className="quick-link"
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: q.primary ? 'var(--primary)' : 'var(--text)', marginBottom: 1 }}>{q.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{q.desc}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={q.primary ? 'var(--primary)' : 'var(--text-faint)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-4col { grid-template-columns: repeat(4, 1fr) !important; }
          .lg-3col { grid-template-columns: repeat(3, 1fr) !important; }
        }
        .quick-link:hover { border-color: rgba(255,255,255,0.12) !important; background: var(--surface-2) !important; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
