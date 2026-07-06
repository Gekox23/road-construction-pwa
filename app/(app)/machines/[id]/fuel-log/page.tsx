'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function FuelLogPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ eventDate: today, liters: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.liters) { setError('Literérték szükséges'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/machines/${id}/fuel-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, liters: parseFloat(form.liters) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba');
      router.push(`/machines/${id}`);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold text-white">Üzemanyag töltés rögzítés</h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Dátum</label>
          <input type="date" value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Liter *</label>
          <input type="number" step="0.5" value={form.liters} onChange={e => setForm(p => ({ ...p, liters: e.target.value }))}
            placeholder="pl. 80.5"
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Helyszín (opcionális)</label>
          <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            placeholder="pl. M7-es autópálya 32 km"
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
          {loading ? 'Mentés...' : 'Rögzítés'}
        </button>
      </form>
    </div>
  );
}
