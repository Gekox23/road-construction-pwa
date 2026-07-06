'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  fuggoben: { label: 'Függőben', color: 'bg-yellow-500/20 text-yellow-400' },
  jovahagyva: { label: 'Jóváhagyva', color: 'bg-green-500/20 text-green-400' },
  elutasitva: { label: 'Elutasítva', color: 'bg-red-500/20 text-red-400' },
  teljesitve: { label: 'Teljesítve', color: 'bg-blue-500/20 text-blue-400' },
};

export default function OrdersPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = status ? `?status=${status}` : '';
    fetch(`/api/orders${q}`).then(r => r.json()).then(d => setItems(d.data || [])).finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Megrendelések</h1>
        <Link href="/orders/new" className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors">
          + Új megrendelés
        </Link>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[['', 'Összes'], ['fuggoben', 'Függőben'], ['jovahagyva', 'Jóváhagyva'], ['teljesitve', 'Teljesítve']].map(([val, lbl]) => (
          <button key={val} onClick={() => setStatus(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              status === val ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>{lbl}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="mb-2">Nincs megrendelés</p>
          <Link href="/orders/new" className="text-orange-400 hover:text-orange-300 text-sm">Új megrendelés →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(o => (
            <Link key={o.id as string} href={`/orders/${o.id}`}
              className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-colors">
              <div>
                <p className="font-semibold text-white">
                  {(o.item_count as number) || 0} tétel
                  {o.creator_name ? ` | ${o.creator_name}` : ''}
                </p>
                <p className="text-sm text-gray-400">{String(o.event_date).split('T')[0]}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_LABELS[o.status as string]?.color}`}>
                {STATUS_LABELS[o.status as string]?.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
