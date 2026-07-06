'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Site { id: string; name: string; location?: string; }
interface User { id: string; name: string; }
interface MachineData {
  machine_code?: string;
  type?: string;
  current_site_id?: string;
  site_name?: string;
}

export default function MachineTransferPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [machine, setMachine] = useState<MachineData | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ targetSiteId: '', operatorId: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/machines/${id}`).then(r => r.json()),
      fetch('/api/sites').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
    ]).then(([m, s, u]) => {
      setMachine(m.data);
      setSites(s.data || []);
      setUsers(u.data || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/machines/${id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba');
      router.push(`/machines/${id}`);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <div>
          <h1 className="text-xl font-bold text-white">Gép átadása</h1>
          <p className="text-sm text-gray-400">{machine?.machine_code} | {machine?.type}</p>
        </div>
      </div>

      {!!machine?.current_site_id && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4 text-sm text-yellow-300">
          Jelenlegi helyszín: <strong>{machine?.site_name || 'Építkezés'}</strong>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Célépítkezés (elhagyva = raktárra kerül)</label>
          <select value={form.targetSiteId} onChange={e => setForm(p => ({ ...p, targetSiteId: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">Raktár / nincs</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}{s.location ? ` (${s.location})` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Operátor (opcionális)</label>
          <select value={form.operatorId} onChange={e => setForm(p => ({ ...p, operatorId: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">-</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Megjegyzés</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
            placeholder="Átadás megjegyzése..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-none focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={saving}
          className="w-full h-12 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
          {saving ? 'Mentés...' : 'Átadás rögzítése'}
        </button>
      </form>
    </div>
  );
}
