'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem { itemName: string; quantity: string; unit: string; }

function NewOrderForm() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [eventDate, setEventDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ itemName: '', quantity: '1', unit: 'db' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addItem = () => setItems(prev => [...prev, { itemName: '', quantity: '1', unit: 'db' }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof OrderItem, val: string) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = items.filter(it => it.itemName.trim());
    if (!valid.length) { setError('Minimum 1 tétel szükséges'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate, notes, items: valid.map(it => ({ ...it, quantity: parseFloat(it.quantity) || 1 })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba');
      router.push(`/orders/${data.data.id}`);
    } catch (err: unknown) { setError((err as Error).message); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold text-white">Új megrendelés</h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Dátum</label>
          <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Tételek</label>
            <button type="button" onClick={addItem} className="text-sm text-orange-400 hover:text-orange-300">+ Tétel</button>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input value={item.itemName} onChange={e => updateItem(i, 'itemName', e.target.value)}
                  placeholder="Anyag neve"
                  className="flex-1 h-10 px-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                  type="number" min="0.1" step="0.1" placeholder="db"
                  className="w-16 h-10 px-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                  placeholder="egys"
                  className="w-16 h-10 px-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500" />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)}
                    className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-300">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Megjegyzés</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
          {loading ? 'Beküldés...' : 'Megrendelés beküldése'}
        </button>
      </form>
    </div>
  );
}

export default function NewOrderPage() {
  return <Suspense><NewOrderForm /></Suspense>;
}
