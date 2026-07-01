'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Machine } from '../../../shared/types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  raktaron: { label: 'Raktáron', color: 'bg-green-500/20 text-green-400' },
  epitkezesen: { label: 'Építkezésen', color: 'bg-blue-500/20 text-blue-400' },
  szervizben: { label: 'Szervizben', color: 'bg-yellow-500/20 text-yellow-400' },
  atadasalatt: { label: 'Átadás alatt', color: 'bg-purple-500/20 text-purple-400' },
};

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch(`/api/machines?q=${encodeURIComponent(search)}`)
        .then((r) => r.json())
        .then((d) => setMachines(d.data || []))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Gépek</h1>
        <Link href="/machines/new" className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors">
          <span>+</span> Új gép
        </Link>
      </div>

      <input
        type="search"
        placeholder="Keresés típus, kód alapján..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full h-12 px-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : machines.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">Nincs találat</p>
          <Link href="/machines/new" className="text-orange-400 hover:text-orange-300 text-sm">Új gép hozzáadása →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {machines.map((m: Machine & { site_name?: string }) => (
            <Link key={m.id} href={`/machines/${m.id}`}
              className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-colors">
              <div>
                <p className="font-semibold text-white">{m.type}</p>
                <p className="text-sm text-gray-400">{m.machineCode ?? (m as unknown as Record<string,string>).machine_code} {m.manufacturer ? `• ${m.manufacturer}` : ''}</p>
                {(m as unknown as Record<string,string>).site_name && (
                  <p className="text-xs text-gray-500 mt-0.5">{(m as unknown as Record<string,string>).site_name}</p>
                )}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_LABELS[m.status]?.color}`}>
                {STATUS_LABELS[m.status]?.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
