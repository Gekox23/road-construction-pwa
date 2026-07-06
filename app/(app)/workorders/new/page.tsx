'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const WORK_TYPES = ['Karbantartás', 'Javítás', 'Gumijavitás', 'Kenysékeloszlás', 'Elektromos hiba', 'Hidraulika hiba', 'Motor hiba', 'Karosszéria', 'Egyéb'];

function NewWorkorderForm() {
  const router = useRouter();
  const params = useSearchParams();
  const today = new Date().toISOString().split('T')[0];
  const [machines, setMachines] = useState<{ id: string; type: string; machine_code: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    machineId: params.get('machineId') || '',
    workType: '',
    description: '',
    eventDate: today,
    assignedTo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/machines').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
    ]).then(([m, u]) => {
      setMachines(m.data || []);
      setUsers(u.data || []);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/workorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba');
      router.push(`/workorders/${data.data.id}`);
    } catch (err: unknown) { setError((err as Error).message); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold text-white">Új munkalap</h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Gép</label>
          <select value={form.machineId} onChange={e => setForm(p => ({ ...p, machineId: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">-</option>
            {machines.map(m => <option key={m.id} value={m.id}>{m.machine_code} - {m.type}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Munka típusa</label>
          <select value={form.workType} onChange={e => setForm(p => ({ ...p, workType: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">- Válassz -</option>
            {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Leírás</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
            placeholder="Munka részletes leírása..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Dátum</label>
          <input type="date" value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Hozzárendelt szervizes</label>
          <select value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">-</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
          {loading ? 'Mentés...' : 'Munkalap létrehozása'}
        </button>
      </form>
    </div>
  );
}

export default function NewWorkorderPage() {
  return <Suspense><NewWorkorderForm /></Suspense>;
}
