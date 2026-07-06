'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  aktiv: { label: 'Aktív', color: 'bg-green-500/20 text-green-400' },
  lezart: { label: 'Lezárt', color: 'bg-red-500/20 text-red-400' },
  archivalt: { label: 'Archivált', color: 'bg-gray-500/20 text-gray-400' },
};

export default function SitesPage() {
  const [sites, setSites] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sites').then(r => r.json()).then(d => setSites(d.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Építkezések</h1>
        <Link href="/sites/new" className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors">
          + Új
        </Link>
      </div>
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : sites.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-2">Nincs építkezés</p>
          <Link href="/sites/new" className="text-orange-400 hover:text-orange-300 text-sm">Új létrehozása →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sites.map(s => (
            <Link key={s.id as string} href={`/sites/${s.id}`}
              className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-colors">
              <div>
                <p className="font-semibold text-white">{s.name as string}</p>
                {s.location && <p className="text-sm text-gray-400">{s.location as string}</p>}
                {s.leader_name && <p className="text-xs text-gray-500 mt-0.5">Vezető: {s.leader_name as string}</p>}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_LABELS[s.status as string]?.color}`}>
                {STATUS_LABELS[s.status as string]?.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
