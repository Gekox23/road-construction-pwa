'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  fuggoben: { label: 'Függőben', color: 'bg-yellow-500/20 text-yellow-400' },
  jovahagyva: { label: 'Jóváhagyva', color: 'bg-green-500/20 text-green-400' },
  elutasitva: { label: 'Elutasítva', color: 'bg-red-500/20 text-red-400' },
  teljesitve: { label: 'Teljesítve', color: 'bg-blue-500/20 text-blue-400' },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(d => {
      setOrder(d.data);
      setItems(d.items || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const setStatus = async (newStatus: string) => {
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (res.ok) setOrder(data.data);
    setUpdating(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-400">Megrendelés nem található</div>;

  const statusInfo = STATUS_LABELS[order.status as string];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Megrendelés</h1>
          <p className="text-sm text-gray-400">{String(order.event_date).split('T')[0]}{order.creator_name ? ` | ${order.creator_name}` : ''}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
      </div>

      <div className="space-y-2 mb-6">
        {items.map(item => (
          <div key={item.id as string} className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3">
            <p className="text-white">{item.item_name as string}</p>
            <p className="text-gray-400 text-sm">{item.quantity as number} {item.unit as string || 'db'}</p>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="bg-gray-900 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm text-gray-400 mb-1">Megjegyzés</p>
          <p className="text-white text-sm">{order.notes as string}</p>
        </div>
      )}

      {order.status === 'fuggoben' && (
        <div className="flex gap-2">
          <button onClick={() => setStatus('jovahagyva')} disabled={updating}
            className="flex-1 h-11 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
            Jóváhagyás ✓
          </button>
          <button onClick={() => setStatus('elutasitva')} disabled={updating}
            className="flex-1 h-11 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
            Elutasítás ✕
          </button>
        </div>
      )}
      {order.status === 'jovahagyva' && (
        <button onClick={() => setStatus('teljesitve')} disabled={updating}
          className="w-full h-11 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
          Teljesítve jelölés ✓
        </button>
      )}
    </div>
  );
}
