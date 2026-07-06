'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  aktiv: { label: 'Aktív', color: 'bg-green-500/20 text-green-400' },
  szervizen: { label: 'Szervizen', color: 'bg-yellow-500/20 text-yellow-400' },
  inaktiv: { label: 'Inaktív', color: 'bg-gray-500/20 text-gray-400' },
};

export default function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [machine, setMachine] = useState<Record<string, unknown> | null>(null);
  const [workorders, setWorkorders] = useState<Record<string, unknown>[]>([]);
  const [openIssues, setOpenIssues] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/machines/${id}`).then(r => r.json()),
      fetch(`/api/workorders?machineId=${id}&limit=5`).then(r => r.json()),
      fetch(`/api/issues?machineId=${id}&status=nyitott`).then(r => r.json()),
    ]).then(([m, w, iss]) => {
      setMachine(m.data);
      setWorkorders(w.data || []);
      setOpenIssues(iss.data || []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!machine) return <div className="text-center py-20 text-gray-400">Gép nem található</div>;

  const statusInfo = STATUS_LABELS[machine.status as string];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{machine.type as string}</h1>
          <p className="text-sm text-gray-400">{machine.machine_code as string}{machine.brand ? ` | ${machine.brand}` : ''}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
        <Link href={`/machines/${id}/edit`} className="h-9 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-xl flex items-center transition-colors">Szerk.</Link>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {machine.year_of_manufacture && (
          <div className="bg-gray-900 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500">Gyártási év</p>
            <p className="text-white font-semibold">{machine.year_of_manufacture as number}</p>
          </div>
        )}
        {machine.license_plate && (
          <div className="bg-gray-900 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500">Rendszám</p>
            <p className="text-white font-semibold">{machine.license_plate as string}</p>
          </div>
        )}
        {machine.site_name && (
          <div className="bg-gray-900 rounded-xl px-4 py-3 col-span-2">
            <p className="text-xs text-gray-500">Jelenlegi helyszín</p>
            <p className="text-white font-semibold">{machine.site_name as string}</p>
          </div>
        )}
      </div>

      {openIssues.length > 0 && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm font-medium mb-2">⚠ Nyitott hibák ({openIssues.length})</p>
          {openIssues.map(iss => (
            <Link key={iss.id as string} href={`/issues/${iss.id}`} className="block text-xs text-red-300 hover:text-red-200 mb-1">
              • {String(iss.description).substring(0, 60)}...
            </Link>
          ))}
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Utolsó munkalapok</h2>
          <Link href={`/workorders/new?machineId=${id}`} className="text-xs text-orange-400">+ Új →</Link>
        </div>
        {workorders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Nincs munkalap</p>
        ) : (
          <div className="space-y-2">
            {workorders.map(w => (
              <Link key={w.id as string} href={`/workorders/${w.id}`}
                className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-3 transition-colors">
                <div>
                  <p className="text-white text-sm">{w.work_type as string || 'Karbantartás'}</p>
                  <p className="text-xs text-gray-500">{String(w.event_date).split('T')[0]}</p>
                </div>
                <span className="text-xs text-gray-400">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link href={`/issues/new?machineId=${id}`}
          className="flex-1 h-11 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-colors">
          Hiba bejelentés
        </Link>
        <Link href={`/workorders/new?machineId=${id}`}
          className="flex-1 h-11 flex items-center justify-center bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-xl text-sm font-medium transition-colors">
          Munkalap
        </Link>
      </div>
    </div>
  );
}
