'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  uj: 'bg-blue-500/20 text-blue-400',
  folyamatban: 'bg-yellow-500/20 text-yellow-400',
  befejezve: 'bg-green-500/20 text-green-400',
  lezarva: 'bg-gray-500/20 text-gray-400',
};
const STATUS_LABELS: Record<string, string> = {
  uj: 'Új', folyamatban: 'Folyamatban', befejezve: 'Befejezve', lezarva: 'Lezárva'
};

export default function WorkordersPage() {
  const [items, setItems] = useState<Record<string,string>[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = status ? `?status=${status}` : '';
    fetch(`/api/workorders${q}`)
      .then(r => r.json())
      .then(d => setItems(d.data || []))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Munkalapok</h1>
        <Link href="/workorders/new" className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors">
          + Új
        </Link>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[['', 'Mind'], ['uj', 'Új'], ['folyamatban', 'Folyamatban'], ['befejezve', 'Befejezve'], ['lezarva', 'Lezárva']].map(([val, label]) => (
          <button key={val} onClick={() => setStatus(val)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${status === val ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Nincs munkalap.</div>
      ) : (
        <div className="space-y-2">
          {items.map(w => (
            <Link key={w.id} href={`/workorders/${w.id}`}
              className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-colors">
              <div>
                <p className="font-medium text-white">{w.work_type || 'Szerviz'}</p>
                <p className="text-sm text-gray-400">{w.machine_type} • {w.event_date}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[w.status]}`}>
                {STATUS_LABELS[w.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
