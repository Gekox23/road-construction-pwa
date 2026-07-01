'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SitesPage() {
  const [sites, setSites] = useState<Record<string,string>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sites')
      .then(r => r.json())
      .then(d => setSites(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Építkezések</h1>
        <Link href="/sites/new" className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center">
          + Új
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : sites.length === 0 ? (
        <p className="text-center py-16 text-gray-500">Nincs építkezés rögzítve.</p>
      ) : (
        <div className="space-y-2">
          {sites.map(s => (
            <Link key={s.id} href={`/sites/${s.id}`}
              className="block bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-colors">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{s.name}</p>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  s.status === 'aktiv' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>{s.status === 'aktiv' ? 'Aktív' : 'Lezárva'}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{s.location || 'Helyszín nincs megadva'}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Vez.: {s.leader_name || '-'} • {s.machine_count || 0} gép
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
