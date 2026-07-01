'use client';
import { useState, useEffect } from 'react';

export default function ShelfPage() {
  const [items, setItems] = useState<Record<string,unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanMode, setScanMode] = useState<null | 'out' | 'in'>(null);
  const [qrInput, setQrInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`/api/shelf?q=${encodeURIComponent(search)}`)
        .then(r => r.json())
        .then(d => setItems(d.data || []))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleScan() {
    if (!qrInput || !scanMode) return;
    const endpoint = scanMode === 'out' ? '/api/shelf/scan-out' : '/api/shelf/scan-in';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrCode: qrInput }),
    });
    const d = await res.json();
    if (res.ok) {
      setFeedback({ type: 'success', msg: scanMode === 'out' ? 'Kivett eszköz rögzítve' : 'Visszatett eszköz rögzítve' });
      setQrInput('');
      setScanMode(null);
    } else {
      setFeedback({ type: 'error', msg: d.error });
    }
    setTimeout(() => setFeedback(null), 3000);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Polcrendszer</h1>

      {feedback && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          feedback.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>{feedback.msg}</div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setScanMode(scanMode === 'out' ? null : 'out')}
          className={`flex-1 h-12 rounded-xl font-medium text-sm transition-colors ${scanMode === 'out' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
          📤 Kivétel
        </button>
        <button onClick={() => setScanMode(scanMode === 'in' ? null : 'in')}
          className={`flex-1 h-12 rounded-xl font-medium text-sm transition-colors ${scanMode === 'in' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
          📥 Visszaadás
        </button>
      </div>

      {scanMode && (
        <div className="mb-4 bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-2">QR kód beolvasása vagy begelépése:</p>
          <div className="flex gap-2">
            <input
              autoFocus
              value={qrInput}
              onChange={e => setQrInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="QR kód..."
              className="flex-1 h-12 px-4 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button onClick={handleScan}
              className="h-12 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors">
              OK
            </button>
          </div>
        </div>
      )}

      <input
        type="search"
        placeholder="Keresés..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full h-12 px-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
      />

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const i = item as Record<string, string>;
            return (
              <div key={i.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div>
                  <p className="font-medium text-white">{i.name}</p>
                  <p className="text-xs text-gray-500">{i.qr_code}</p>
                  {i.holder_name && <p className="text-sm text-orange-400">Nála: {i.holder_name}</p>}
                </div>
                <div className="text-right">
                  {i.item_type === 'foyoeszkoz' && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${i.quantity_percent || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{i.quantity_percent || 0}%</span>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                    i.status === 'polcon' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>{i.status === 'polcon' ? 'Polcon' : 'Kivett'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
