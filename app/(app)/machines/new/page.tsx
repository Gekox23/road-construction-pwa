'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewMachinePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    machineCode: '',
    type: '',
    manufacturer: '',
    model: '',
    year: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.machineCode.trim() || !form.type.trim()) {
      setError('Gépkód és típus kötelező');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, year: form.year ? parseInt(form.year) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Hiba');
      router.push(`/machines/${data.data.id}`);
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
        <h1 className="text-xl font-bold text-white">Új gép hozzáadása</h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {[
          { name: 'machineCode', label: 'Gépkód *', placeholder: 'pl. CAT-001', required: true },
          { name: 'type', label: 'Típus *', placeholder: 'pl. Homlokrakodó', required: true },
          { name: 'manufacturer', label: 'Gyártó', placeholder: 'pl. Caterpillar' },
          { name: 'model', label: 'Modell', placeholder: 'pl. 966K' },
          { name: 'year', label: 'Évjárat', placeholder: 'pl. 2018', type: 'number' },
        ].map(field => (
          <div key={field.name}>
            <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
            <input
              name={field.name}
              type={field.type || 'text'}
              value={form[field.name as keyof typeof form]}
              onChange={handle}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full h-11 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm text-gray-400 mb-1">Megjegyzés</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handle}
            rows={3}
            placeholder="..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors">
          {loading ? 'Mentés...' : 'Gép létrehozása'}
        </button>
      </form>
    </div>
  );
}
