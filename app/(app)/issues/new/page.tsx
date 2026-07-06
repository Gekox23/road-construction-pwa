'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function NewIssueForm() {
  const router = useRouter();
  const params = useSearchParams();
  const today = new Date().toISOString().split('T')[0];
  const [machines, setMachines] = useState<{ id: string; type: string; machine_code: string }[]>([]);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    machineId: params.get('machineId') || '',
    siteId: params.get('siteId') || '',
    description: '',
    eventDate: today,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/machines').then(r => r.json()),
      fetch('/api/sites').then(r => r.json()),
    ]).then(([m, s]) => {
      setMachines(m.data || []);
      setSites(s.data || []);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) { setError('Leírás kötelező'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba');
      router.push(`/issues/${data.data.id}`);
    } catch (err: unknown) { setError((err as Error).message); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold text-white">Hiba bejelentés</h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Gép (opcionális)</label>
          <select value={form.machineId} onChange={e => setForm(p => ({ ...p, machineId: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">-</option>
            {machines.map(m => <option key={m.id} value={m.id}>{m.machine_code} - {m.type}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Építkezés (opcionális)</label>
          <select value={form.siteId} onChange={e => setForm(p => ({ ...p, siteId: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">-</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Hiba leírása *</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} required
            placeholder="Írj le részletesen a problémát..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Dátum</label>
          <input type="date" value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full h-12 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
          {loading ? 'Beküldés...' : 'Hiba bejelentése'}
        </button>
      </form>
    </div>
  );
}

export default function NewIssuePage() {
  return <Suspense><NewIssueForm /></Suspense>;
}
