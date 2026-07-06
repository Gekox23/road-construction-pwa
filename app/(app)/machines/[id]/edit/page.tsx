'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MachineEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    type: '', machineCode: '', brand: '', yearOfManufacture: '', licensePlate: '', currentSiteId: '', operatorId: '', status: 'aktiv',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/machines/${id}`).then(r => r.json()),
      fetch('/api/sites').then(r => r.json()),
      fetch('/api/users').then(r => r.json()),
    ]).then(([m, s, u]) => {
      const d = m.data || {};
      setForm({
        type: d.type || '',
        machineCode: d.machine_code || '',
        brand: d.brand || '',
        yearOfManufacture: d.year_of_manufacture ? String(d.year_of_manufacture) : '',
        licensePlate: d.license_plate || '',
        currentSiteId: d.current_site_id || '',
        operatorId: d.operator_id || '',
        status: d.status || 'aktiv',
      });
      setSites(s.data || []);
      setUsers(u.data || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/machines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba');
      router.push(`/machines/${id}`);
    } catch (err: unknown) { setError((err as Error).message); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold text-white">Gép szerkesztése</h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {[['type', 'Típus *'], ['machineCode', 'Gépazonosító *'], ['brand', 'Márka'], ['licensePlate', 'Rendszám']].map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            <input value={form[field as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
              className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        ))}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Gyártási év</label>
          <input type="number" value={form.yearOfManufacture} onChange={e => setForm(p => ({ ...p, yearOfManufacture: e.target.value }))}
            min="1980" max="2030"
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Státusz</label>
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="aktiv">Aktív</option>
            <option value="szervizen">Szervizen</option>
            <option value="inaktiv">Inaktív</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Jelenlegi helyszín</label>
          <select value={form.currentSiteId} onChange={e => setForm(p => ({ ...p, currentSiteId: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">-</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Operátor</label>
          <select value={form.operatorId} onChange={e => setForm(p => ({ ...p, operatorId: e.target.value }))}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="">-</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={saving}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
          {saving ? 'Mentés...' : 'Változtatások mentése'}
        </button>
      </form>
    </div>
  );
}
