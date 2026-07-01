'use client';
import { useEffect, useState } from 'react';
import { getWeekStart, getNextWeekStart, formatDate } from '../../../shared/utils/date';

const DAYS = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

export default function SchedulePage() {
  const [tab, setTab] = useState<'current' | 'next'>('current');
  const [entries, setEntries] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = tab === 'current'
    ? getWeekStart().toISOString().split('T')[0]
    : getNextWeekStart().toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/schedule?week=${weekStart}`)
      .then((r) => r.json())
      .then((d) => setEntries(d.data || []))
      .finally(() => setLoading(false));
  }, [weekStart]);

  const bySite = entries.reduce((acc: Record<string, unknown[]>, entry: unknown) => {
    const e = entry as Record<string, string>;
    const key = e.site_name || 'Nincs építkezés';
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Heti vezénylés</h1>
      <div className="flex gap-2 mb-4">
        {(['current', 'next'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            {t === 'current' ? 'Ez a hét' : 'Következő hét'}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500 self-center">
          {formatDate(weekStart)} től
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : Object.keys(bySite).length === 0 ? (
        <div className="text-center py-16 text-gray-500">Erre a hétre nincs vezénylés rögzítve.</div>
      ) : (
        Object.entries(bySite).map(([siteName, siteEntries]) => (
          <div key={siteName} className="mb-4 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="font-semibold text-white">{siteName}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-2 text-left text-gray-400 font-medium">Gép</th>
                    <th className="px-4 py-2 text-left text-gray-400 font-medium">Kezélő</th>
                    {DAYS.map((d) => <th key={d} className="px-3 py-2 text-gray-400 font-medium">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(siteEntries as Record<string,string>[]).map((e) => (
                    <tr key={e.id} className="border-b border-gray-800/50 last:border-0">
                      <td className="px-4 py-2 text-white">{e.machine_type} <span className="text-gray-500 text-xs">{e.machine_code}</span></td>
                      <td className="px-4 py-2 text-gray-300">{e.operator_name || '-'}</td>
                      {DAYS.map((_, di) => (
                        <td key={di} className="px-3 py-2 text-center">
                          {parseInt(e.day_of_week) === di + 1 ? (
                            <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
                          ) : <span className="inline-block w-2 h-2" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
