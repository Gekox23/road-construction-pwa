'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewSitePage() {
  const router = useRouter();
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ name: '', location: '', leaderId: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetch('/api/users').then(r => r.json()).then(d => setUsers(d.data || [])); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Név kötelező'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/sites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba');
      router.push(`/sites/${data.data.id}`);
    } catch (err: unknown) { setError((err as Error).message); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold text-white">Új építkezés</h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Név *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="pl. M7-es bevézető"
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Cím / Helyszín</label>
          <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="pl. Budapest, X. ker."
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Vezérő (opcionális)</label>
          <select value={form.leaderId} onChange={e => setForm(p => ({ ...p, leaderId: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">-</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Megjegyzés</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
          {loading ? 'Mentés...' : 'Építkezés létrehozása'}
        </button>
      </form>
    </div>
  );
}
