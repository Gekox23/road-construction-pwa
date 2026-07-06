'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  nyitott: { label: 'Nyitott', color: 'bg-red-500/20 text-red-400' },
  folyamatban: { label: 'Folyamatban', color: 'bg-yellow-500/20 text-yellow-400' },
  megoldott: { label: 'Megoldott', color: 'bg-green-500/20 text-green-400' },
};

interface IssueRow {
  id: string;
  description: string;
  event_date: string;
  status: string;
  machine_type?: string;
  site_name?: string;
}

export default function IssuesPage() {
  const [items, setItems] = useState<IssueRow[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = status ? `?status=${status}` : '';
    fetch(`/api/issues${q}`).then(r => r.json()).then(d => setItems(d.data || [])).finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Hibabejelentések</h1>
        <Link href="/issues/new" className="h-10 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors">
          + Hiba bejelentés
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {([['', 'Összes'], ['nyitott', 'Nyitott'], ['folyamatban', 'Folyamatban'], ['megoldott', 'Megoldott']] as [string, string][]).map(([val, lbl]) => (
          <button key={val} onClick={() => setStatus(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === val ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>{lbl}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-2">Nincs hiba bejelentés</p>
          <Link href="/issues/new" className="text-red-400 hover:text-red-300 text-sm">Bejelentés →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(iss => (
            <Link key={iss.id} href={`/issues/${iss.id}`}
              className="flex items-start justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-colors">
              <div className="flex-1 mr-3">
                <p className="font-semibold text-white line-clamp-2">{iss.description}</p>
                <p className="text-xs text-gray-400 mt-1">{String(iss.event_date).split('T')[0]}
                  {iss.machine_type ? ` | ${iss.machine_type}` : ''}
                  {iss.site_name ? ` | ${iss.site_name}` : ''}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_LABELS[iss.status]?.color}`}>
                {STATUS_LABELS[iss.status]?.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
