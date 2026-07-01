'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  nyitott: 'bg-red-500/20 text-red-400',
  folyamatban: 'bg-yellow-500/20 text-yellow-400',
  megoldott: 'bg-green-500/20 text-green-400',
};
const STATUS_LABELS: Record<string, string> = {
  nyitott: 'Nyitott', folyamatban: 'Folyamatban', megoldott: 'Megoldott'
};

export default function IssuesPage() {
  const [items, setItems] = useState<Record<string,string>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/issues')
      .then(r => r.json())
      .then(d => setItems(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Hibabejeléntések</h1>
        <Link href="/issues/new" className="h-10 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors">
          + Bejelént
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Nincs nyitott hibabejeléntés.</div>
      ) : (
        <div className="space-y-2">
          {items.map(issue => (
            <Link key={issue.id} href={`/issues/${issue.id}`}
              className="flex items-start justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-colors gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{issue.description}</p>
                <p className="text-sm text-gray-400 mt-0.5">{issue.machine_type || 'Nincs gép'} • {issue.event_date}</p>
                <p className="text-xs text-gray-500">{issue.reporter_name}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLES[issue.status]}`}>
                {STATUS_LABELS[issue.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
