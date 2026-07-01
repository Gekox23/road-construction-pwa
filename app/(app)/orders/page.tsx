'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_STYLES: Record<string,string> = {
  fuggoben: 'bg-yellow-500/20 text-yellow-400',
  jovahagyva: 'bg-green-500/20 text-green-400',
  elutasitva: 'bg-red-500/20 text-red-400',
  teljesitve: 'bg-gray-500/20 text-gray-400',
};
const STATUS_LABELS: Record<string,string> = {
  fuggoben: 'Függőben', jovahagyva: 'Jóváhagyva', elutasitva: 'Elutasítva', teljesitve: 'Teljesítve'
};

export default function OrdersPage() {
  const [items, setItems] = useState<Record<string,string>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => setItems(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Megrendelések</h1>
        <Link href="/orders/new" className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors">
          + Új
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-center py-16 text-gray-500">Nincs megrendelés.</p>
      ) : (
        <div className="space-y-2">
          {items.map(o => (
            <Link key={o.id} href={`/orders/${o.id}`}
              className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-colors">
              <div>
                <p className="font-medium text-white">{o.creator_name}</p>
                <p className="text-sm text-gray-400">{o.event_date} • {o.notes || '-'}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[o.status]}`}>
                {STATUS_LABELS[o.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
