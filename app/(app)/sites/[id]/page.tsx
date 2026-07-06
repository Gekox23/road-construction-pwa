'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  aktiv: { label: 'Aktív', color: 'bg-green-500/20 text-green-400' },
  lezart: { label: 'Lezárt', color: 'bg-red-500/20 text-red-400' },
  archivalt: { label: 'Archivált', color: 'bg-gray-500/20 text-gray-400' },
};

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [site, setSite] = useState<Record<string, unknown> | null>(null);
  const [machines, setMachines] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/sites/${id}`).then(r => r.json()),
      fetch(`/api/machines?siteId=${id}`).then(r => r.json()),
    ]).then(([s, m]) => {
      setSite(s.data);
      setMachines(m.data || []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!site) return <div className="text-center py-20 text-gray-400">Építkezés nem található</div>;

  const statusInfo = STATUS_LABELS[site.status as string];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{site.name as string}</h1>
          {site.location && <p className="text-sm text-gray-400">{site.location as string}</p>}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
        <Link href={`/sites/${id}/edit`} className="h-9 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-xl flex items-center transition-colors">Szerk.</Link>
      </div>

      {site.leader_name && (
        <div className="bg-gray-900 rounded-xl px-4 py-3 mb-4 flex justify-between">
          <span className="text-gray-400 text-sm">Vezérő</span>
          <span className="text-white text-sm font-medium">{site.leader_name as string}</span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Gépek az építkezésen ({machines.length})</h2>
        </div>
        {machines.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">Nincs hozzárendelt gép</p>
        ) : (
          <div className="space-y-2">
            {machines.map(m => (
              <Link key={m.id as string} href={`/machines/${m.id}`}
                className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-3 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{m.type as string}</p>
                  <p className="text-xs text-gray-500">{m.machine_code as string}</p>
                </div>
                <span className="text-xs text-gray-400">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link href={`/issues/new?siteId=${id}`}
          className="flex-1 h-11 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-colors">
          Hiba bejelentés
        </Link>
        <Link href={`/orders/new?siteId=${id}`}
          className="flex-1 h-11 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-medium transition-colors">
          Megrendelés
        </Link>
      </div>
    </div>
  );
}
