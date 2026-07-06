'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  uj: { label: 'Új', color: 'bg-blue-500/20 text-blue-400' },
  folyamatban: { label: 'Folyamatban', color: 'bg-yellow-500/20 text-yellow-400' },
  befejezve: { label: 'Befejezve', color: 'bg-green-500/20 text-green-400' },
  lezarva: { label: 'Lezárva', color: 'bg-gray-500/20 text-gray-400' },
};

interface WorkOrderData {
  status?: string;
  work_type?: string;
  event_date?: string;
  machine_type?: string;
  machine_code?: string;
  description?: string;
  assigned_name?: string;
}

export default function WorkorderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [wo, setWo] = useState<WorkOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/workorders/${id}`).then(r => r.json()).then(d => setWo(d.data)).finally(() => setLoading(false));
  }, [id]);

  const changeStatus = async (newStatus: string) => {
    setUpdating(true);
    const res = await fetch(`/api/workorders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (res.ok) setWo(data.data);
    setUpdating(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!wo) return <div className="text-center py-20 text-gray-400">Munkalap nem található</div>;

  const statusInfo = STATUS_LABELS[wo.status ?? ''];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{wo.work_type || 'Munkalap'}</h1>
          <p className="text-sm text-gray-400">{String(wo.event_date ?? '').split('T')[0]}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo?.color}`}>{statusInfo?.label}</span>
      </div>

      <div className="space-y-3 mb-6">
        {!!wo.machine_type && (
          <div className="flex justify-between bg-gray-900 rounded-xl px-4 py-3">
            <span className="text-gray-400 text-sm">Gép</span>
            <span className="text-white text-sm">{wo.machine_type} ({wo.machine_code})</span>
          </div>
        )}
        {!!wo.description && (
          <div className="bg-gray-900 rounded-xl px-4 py-3">
            <p className="text-gray-400 text-sm mb-1">Leírás</p>
            <p className="text-white text-sm">{wo.description}</p>
          </div>
        )}
        {!!wo.assigned_name && (
          <div className="flex justify-between bg-gray-900 rounded-xl px-4 py-3">
            <span className="text-gray-400 text-sm">Szervizes</span>
            <span className="text-white text-sm">{wo.assigned_name}</span>
          </div>
        )}
      </div>

      {wo.status !== 'lezarva' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400 mb-2">Státusz váltás:</p>
          {wo.status === 'uj' && (
            <button onClick={() => changeStatus('folyamatban')} disabled={updating}
              className="w-full h-11 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              Munka megkezdése →
            </button>
          )}
          {wo.status === 'folyamatban' && (
            <button onClick={() => changeStatus('befejezve')} disabled={updating}
              className="w-full h-11 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              Munka befejezése ✓
            </button>
          )}
          {wo.status === 'befejezve' && (
            <button onClick={() => changeStatus('lezarva')} disabled={updating}
              className="w-full h-11 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              Munkalap lezárása
            </button>
          )}
        </div>
      )}
    </div>
  );
}
