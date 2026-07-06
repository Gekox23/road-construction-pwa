'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  raktaron: { label: 'Raktáron', color: 'bg-green-500/20 text-green-400' },
  epitkezesen: { label: 'Építkezésen', color: 'bg-blue-500/20 text-blue-400' },
  szervizben: { label: 'Szervizben', color: 'bg-yellow-500/20 text-yellow-400' },
  atadasalatt: { label: 'Átadás alatt', color: 'bg-purple-500/20 text-purple-400' },
  archivalt: { label: 'Archivált', color: 'bg-gray-500/20 text-gray-400' },
};

type Tab = 'adatok' | 'oralo' | 'uzemanyag' | 'munkalapok' | 'dokumentumok';

export default function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [machine, setMachine] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<{ hourLogs: unknown[]; fuelLogs: unknown[]; workorders: unknown[] } | null>(null);
  const [tab, setTab] = useState<Tab>('adatok');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/machines/${id}`).then(r => r.json()),
      fetch(`/api/machines/${id}/history`).then(r => r.json()),
    ]).then(([mRes, hRes]) => {
      setMachine(mRes.data || null);
      setHistory(hRes.data || null);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!machine) return <div className="text-center py-20 text-gray-400">Gép nem található</div>;

  const statusInfo = STATUS_LABELS[machine.status as string] || { label: machine.status as string, color: 'bg-gray-500/20 text-gray-400' };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">←</button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{machine.type as string}</h1>
          <p className="text-sm text-gray-400">{machine.machine_code as string}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
        <Link href={`/machines/${id}/edit`} className="h-9 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-xl flex items-center transition-colors">
          Szerkesztés
        </Link>
      </div>

      {machine.site_name && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4 text-sm text-blue-300">
          📍 Jelenlegi építkezés: <strong>{machine.site_name as string}</strong>
          {machine.operator_name && <span className="ml-2">| Operatőr: {machine.operator_name as string}</span>}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-900 rounded-xl p-1 overflow-x-auto">
        {(['adatok','oralo','uzemanyag','munkalapok','dokumentumok'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 min-w-max px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {t === 'adatok' ? 'Adatok' : t === 'oralo' ? 'Óraló' : t === 'uzemanyag' ? 'Üzemanyag' : t === 'munkalapok' ? 'Munkalapok' : 'Dok.'}
          </button>
        ))}
      </div>

      {tab === 'adatok' && (
        <div className="space-y-3">
          {[
            ['Gyártó', machine.manufacturer],
            ['Modell', machine.model],
            ['Évjárat', machine.year],
            ['Státusz', statusInfo.label],
            ['Megjegyzés', machine.notes],
          ].map(([label, value]) => value ? (
            <div key={label as string} className="flex justify-between bg-gray-900 rounded-xl px-4 py-3">
              <span className="text-gray-400 text-sm">{label as string}</span>
              <span className="text-white text-sm font-medium">{value as string}</span>
            </div>
          ) : null)}
          {/* Átadás gomb */}
          <Link href={`/machines/${id}/transfer`}
            className="w-full flex items-center justify-center gap-2 h-11 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-xl text-sm font-medium transition-colors mt-4">
            🔄 Gép átadása / helyszín váltás
          </Link>
          <div className="flex gap-2">
            <Link href={`/machines/${id}/hour-log`}
              className="flex-1 flex items-center justify-center gap-1 h-11 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-sm font-medium transition-colors">
              ⏱ Órastand rögzítés
            </Link>
            <Link href={`/machines/${id}/fuel-log`}
              className="flex-1 flex items-center justify-center gap-1 h-11 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-sm font-medium transition-colors">
              ⛽ Töltés rögzítés
            </Link>
          </div>
        </div>
      )}

      {tab === 'oralo' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Órastand napló</h3>
            <Link href={`/machines/${id}/hour-log`} className="text-sm text-orange-400 hover:text-orange-300">+ Bejegyzés</Link>
          </div>
          {!history?.hourLogs?.length ? (
            <p className="text-center text-gray-500 py-8">Nincs rögzített órastand</p>
          ) : history.hourLogs.map((log: unknown) => {
            const l = log as Record<string, unknown>;
            return (
              <div key={l.id as string} className="flex justify-between bg-gray-900 rounded-xl px-4 py-3">
                <div>
                  <p className="text-white font-semibold">{String(l.hour_value)} óra</p>
                  <p className="text-xs text-gray-500">{String(l.event_date).split('T')[0]}</p>
                  {l.notes && <p className="text-xs text-gray-400 mt-0.5">{l.notes as string}</p>}
                </div>
                {l.photo_url && <a href={l.photo_url as string} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline self-center">Fotó</a>}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'uzemanyag' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Üzemanyag napló</h3>
            <Link href={`/machines/${id}/fuel-log`} className="text-sm text-orange-400 hover:text-orange-300">+ Bejegyzés</Link>
          </div>
          {!history?.fuelLogs?.length ? (
            <p className="text-center text-gray-500 py-8">Nincs rögzített töltés</p>
          ) : history.fuelLogs.map((log: unknown) => {
            const l = log as Record<string, unknown>;
            return (
              <div key={l.id as string} className="flex justify-between bg-gray-900 rounded-xl px-4 py-3">
                <div>
                  <p className="text-white font-semibold">{String(l.liters)} liter</p>
                  <p className="text-xs text-gray-500">{String(l.event_date).split('T')[0]}{l.location ? ` | ${l.location}` : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'munkalapok' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Munkalapok</h3>
            <Link href={`/workorders/new?machineId=${id}`} className="text-sm text-orange-400 hover:text-orange-300">+ Új munkalap</Link>
          </div>
          {!history?.workorders?.length ? (
            <p className="text-center text-gray-500 py-8">Nincs munkalap</p>
          ) : history.workorders.map((wo: unknown) => {
            const w = wo as Record<string, unknown>;
            return (
              <Link key={w.id as string} href={`/workorders/${w.id}`}
                className="flex justify-between bg-gray-900 hover:bg-gray-800 rounded-xl px-4 py-3 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{w.work_type as string || 'Javitás'}</p>
                  <p className="text-xs text-gray-500">{String(w.event_date).split('T')[0]}</p>
                </div>
                <span className="text-xs text-gray-400 self-center">{w.status as string}</span>
              </Link>
            );
          })}
        </div>
      )}

      {tab === 'dokumentumok' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Dokumentumok / Fotók</h3>
            <Link href={`/machines/${id}/documents/upload`} className="text-sm text-orange-400 hover:text-orange-300">+ Fotó feltöltés</Link>
          </div>
          <p className="text-center text-gray-500 py-8 text-sm">Dokumentációk betöltése...</p>
        </div>
      )}
    </div>
  );
}
