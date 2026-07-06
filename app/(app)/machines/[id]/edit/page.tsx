'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: 'raktaron', label: 'Raktáron' },
  { value: 'epitkezesen', label: 'Építkezésen' },
  { value: 'szervizben', label: 'Szervizben' },
  { value: 'atadasalatt', label: 'Átadás alatt' },
  { value: 'archivalt', label: 'Archivált' },
];

export default function EditMachinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ type: '', manufacturer: '', model: '', year: '', notes: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/machines/${id}`).then(r => r.json()).then(d => {
      const m = d.data;
      if (m) setForm({ type: m.type || '', manufacturer: m.manufacturer || '', model: m.model || '', year: m.year ? String(m.year) : '', notes: m.notes || '', status: m.status || 'raktaron' });
    }).finally(() => setLoading(false));
  }, [id]);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/machines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, year: form.year ? parseInt(form.year) : null }),
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
        <h1 className="text-xl font-bold text-white">Gép szerkesztése</h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {[
          { name: 'type', label: 'Típus *', required: true },
          { name: 'manufacturer', label: 'Gyártó' },
          { name: 'model', label: 'Modell' },
          { name: 'year', label: 'Évjárat', type: 'number' },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-sm text-gray-400 mb-1">{f.label}</label>
            <input name={f.name} type={f.type || 'text'} value={form[f.name as keyof typeof form]} onChange={handle} required={f.required}
              className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        ))}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Státusz</label>
          <select name="status" value={form.status} onChange={handle}
            className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Megjegyzés</label>
          <textarea name="notes" value={form.notes} onChange={handle} rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={saving}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
          {saving ? 'Mentés...' : 'Mentés'}
        </button>
      </form>
    </div>
  );
}
