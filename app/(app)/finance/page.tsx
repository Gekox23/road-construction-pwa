'use client';
import { useEffect, useState } from 'react';

export default function FinancePage() {
  const [data, setData] = useState<Record<string,unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/finance/summary')
      .then(r => r.json())
      .then(d => setData(d.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Pénzügy és riportok</h1>
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total üzemanyag felhasználás</p>
            <p className="text-3xl font-bold text-orange-400">{data?.totalFuelLiters ?? 0} L</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-sm font-medium text-white mb-3">Gépenkénti üzemidő</p>
            {((data?.machines as Record<string,string>[]) || []).map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm">{m.type}</p>
                  <p className="text-xs text-gray-500">{m.machine_code}</p>
                </div>
                <p className="text-orange-400 font-medium">{m.hours_spent ? `${m.hours_spent} óra` : '-'}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-sm font-medium text-white mb-3">Elvégzett munkák</p>
            {((data?.workorders as Record<string,string>[]) || []).map((w, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm">{w.work_type || 'Szerviz'}</p>
                  <p className="text-xs text-gray-500">{w.worker} • {w.event_date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
