'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  nyitott: { label: 'Nyitott', color: 'bg-red-500/20 text-red-400' },
  folyamatban: { label: 'Folyamatban', color: 'bg-yellow-500/20 text-yellow-400' },
  megoldott: { label: 'Megoldott', color: 'bg-green-500/20 text-green-400' },
};

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [issue, setIssue] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/issues/${id}`).then(r => r.json()).then(d => setIssue(d.data)).finally(() => setLoading(false));
  }, [id]);

  const resolve = async () => {
    setUpdating(true);
    const res = await fetch(`/api/issues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'megoldott' }),
    });
    const data = await res.json();
    if (res.ok) setIssue(data.data);
    setUpdating(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!issue) return <div className="text-center py-20 text-gray-400">Bejelentés nem található</div>;

  const statusInfo = STATUS_LABELS[issue.status as string];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Hibabejelentés</h1>
          <p className="text-sm text-gray-400">{String(issue.event_date).split('T')[0]}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
      </div>

      <div className="bg-gray-900 rounded-xl px-4 py-4 mb-4">
        <p className="text-white">{issue.description as string}</p>
      </div>

      <div className="space-y-2 mb-6">
        {issue.machine_type && (
          <div className="flex justify-between bg-gray-900 rounded-xl px-4 py-3">
            <span className="text-gray-400 text-sm">Gép</span>
            <Link href={`/machines/${issue.machine_id}`} className="text-blue-400 text-sm hover:underline">
              {issue.machine_type as string}
            </Link>
          </div>
        )}
        {issue.site_name && (
          <div className="flex justify-between bg-gray-900 rounded-xl px-4 py-3">
            <span className="text-gray-400 text-sm">Építkezés</span>
            <span className="text-white text-sm">{issue.site_name as string}</span>
          </div>
        )}
        {issue.reporter_name && (
          <div className="flex justify-between bg-gray-900 rounded-xl px-4 py-3">
            <span className="text-gray-400 text-sm">Bejelentő</span>
            <span className="text-white text-sm">{issue.reporter_name as string}</span>
          </div>
        )}
      </div>

      {(issue.photo_urls as string[])?.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Fotók</p>
          <div className="flex gap-2 flex-wrap">
            {(issue.photo_urls as string[]).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer">
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-700" />
              </a>
            ))}
          </div>
        </div>
      )}

      {issue.status !== 'megoldott' && (
        <div className="space-y-2">
          <Link href={`/workorders/new?issueId=${id}&machineId=${issue.machine_id || ''}`}
            className="w-full flex items-center justify-center h-11 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-xl text-sm font-medium transition-colors">
            Munkalap nyitása
          </Link>
          <button onClick={resolve} disabled={updating}
            className="w-full h-11 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
            Megoldottnak jelölés ✓
          </button>
        </div>
      )}
    </div>
  );
}
