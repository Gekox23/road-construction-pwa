'use client';
import { useEffect, useState } from 'react';

const ALL_PERMISSIONS: { key: string; label: string; group: string }[] = [
  { key: 'schedule.view',    label: 'Vezénylés megtekintés',   group: 'Vezénylés' },
  { key: 'schedule.edit',    label: 'Vezénylés szerkesztés',   group: 'Vezénylés' },
  { key: 'machine.view',     label: 'Gépek megtekintés',       group: 'Gépek' },
  { key: 'machine.create',   label: 'Gép hozzáadás',           group: 'Gépek' },
  { key: 'machine.edit',     label: 'Gép szerkesztés',         group: 'Gépek' },
  { key: 'machine.hour_log', label: 'Óranapló rögzítés',       group: 'Gépek' },
  { key: 'machine.fuel_log', label: 'Üzemanyag rögzítés',      group: 'Gépek' },
  { key: 'site.view',        label: 'Építkezések megtekintés', group: 'Építkezések' },
  { key: 'site.view_own',    label: 'Saját építkezés',         group: 'Építkezések' },
  { key: 'site.create',      label: 'Építkezés létrehozás',    group: 'Építkezések' },
  { key: 'site.edit',        label: 'Építkezés szerkesztés',   group: 'Építkezések' },
  { key: 'workorder.view',   label: 'Munkalapok megtekintés',  group: 'Munkalapok' },
  { key: 'workorder.create', label: 'Munkalap létrehozás',     group: 'Munkalapok' },
  { key: 'workorder.edit',   label: 'Munkalap szerkesztés',    group: 'Munkalapok' },
  { key: 'issue.view',       label: 'Hibák megtekintés',       group: 'Hibák' },
  { key: 'issue.create',     label: 'Hiba bejelentés',         group: 'Hibák' },
  { key: 'issue.resolve',    label: 'Hiba megoldás',           group: 'Hibák' },
  { key: 'order.view',       label: 'Rendelések megtekintés',  group: 'Rendelések' },
  { key: 'order.create',     label: 'Rendelés létrehozás',     group: 'Rendelések' },
  { key: 'order.approve',    label: 'Rendelés jóváhagyás',     group: 'Rendelések' },
  { key: 'shelf.view',       label: 'Polc megtekintés',        group: 'Polcrendszer' },
  { key: 'shelf.scan_out',   label: 'Kivétel',                 group: 'Polcrendszer' },
  { key: 'shelf.scan_in',    label: 'Bevétel',                 group: 'Polcrendszer' },
  { key: 'shelf.manage',     label: 'Polc kezelés',            group: 'Polcrendszer' },
  { key: 'finance.view',     label: 'Pénzügy megtekintés',     group: 'Admin' },
  { key: 'user.view',        label: 'Felhasználók megtekintés',group: 'Admin' },
  { key: 'user.create',      label: 'Felhasználó létrehozás',  group: 'Admin' },
  { key: 'user.edit',        label: 'Felhasználó szerkesztés', group: 'Admin' },
  { key: 'user.permission_grant', label: 'Jogosultság kezelés', group: 'Admin' },
];

const TEMPLATES: { name: string; permissions: string[] }[] = [
  { name: 'Teljes hozzáférés', permissions: ALL_PERMISSIONS.map(p => p.key) },
  { name: 'Építésvezető', permissions: ['schedule.view','schedule.edit','machine.view','machine.hour_log','machine.fuel_log','site.view','site.view_own','workorder.view','workorder.create','issue.view','issue.create','order.view','order.create','shelf.view','shelf.scan_out','shelf.scan_in'] },
  { name: 'Logisztikus', permissions: ['machine.view','machine.hour_log','machine.fuel_log','site.view','order.view','order.create','order.approve','shelf.view','shelf.scan_out','shelf.scan_in','shelf.manage'] },
  { name: 'Szervizes', permissions: ['machine.view','machine.edit','machine.hour_log','machine.fuel_log','workorder.view','workorder.create','workorder.edit','issue.view','issue.create','issue.resolve'] },
  { name: 'Gazdasági', permissions: ['finance.view','order.view','order.approve','site.view','machine.view'] },
];

interface UserRow {
  id: string;
  email: string;
  name: string;
  active: boolean;
  last_login_at: string | null;
  permissions: string[] | null;
}

function genPassword(len = 10) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const GROUPS = ['Vezénylés','Gépek','Építkezések','Munkalapok','Hibák','Rendelések','Polcrendszer','Admin'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Form state
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPassword, setFPassword] = useState(() => genPassword());
  const [fPerms, setFPerms] = useState<string[]>([]);
  const [fActive, setFActive] = useState(true);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/users');
    const d = await r.json();
    setUsers(d.users || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setFName(''); setFEmail(''); setFPassword(genPassword()); setFPerms([]); setFActive(true);
    setEditing(null); setModal('create');
  }

  function openEdit(u: UserRow) {
    setFName(u.name); setFEmail(u.email); setFPassword(''); setFPerms(u.permissions || []); setFActive(u.active);
    setEditing(u); setModal('edit');
  }

  function togglePerm(key: string) {
    setFPerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  }

  function applyTemplate(name: string) {
    const t = TEMPLATES.find(t => t.name === name);
    if (t) setFPerms(t.permissions);
  }

  async function saveCreate() {
    setSaving(true);
    const r = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fEmail, name: fName, password: fPassword, permissions: fPerms }),
    });
    setSaving(false);
    if (r.ok) { setModal(null); load(); showToast('Felhasználó létrehozva!'); }
    else { const d = await r.json(); showToast(d.error || 'Hiba történt'); }
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    await fetch(`/api/admin/users/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fName, permissions: fPerms, active: fActive }),
    });
    setSaving(false);
    setModal(null); load(); showToast('Mentve!');
  }

  async function toggleActive(u: UserRow) {
    await fetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !u.active }),
    });
    load();
    showToast(u.active ? 'Felhasználó deaktiválva' : 'Felhasználó aktiválva');
  }

  const permsGrouped = GROUPS.map(g => ({
    group: g,
    items: ALL_PERMISSIONS.filter(p => p.group === g),
  }));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
        <div>
          <div className="label" style={{ marginBottom: 3 }}>Admin</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>Felhasználók</h1>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Új felhasználó
        </button>
      </div>

      {/* User table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: 'var(--text-faint)' }}>
          <div style={{ width: 20, height: 20, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Név</th>
                  <th>Email</th>
                  <th>Jogosultságok</th>
                  <th>Utolsó belépés</th>
                  <th>Státusz</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="td-main">{u.name}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{u.email}</td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {(u.permissions?.length || 0)} jog
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td>
                      <span className={u.active ? 'badge badge-green' : 'badge badge-gray'}>
                        {u.active ? 'Aktív' : 'Inaktív'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn-ghost btn-sm" onClick={() => openEdit(u)}>Szerkesztés</button>
                        <button
                          className="btn-ghost btn-sm"
                          onClick={() => toggleActive(u)}
                          style={{ color: u.active ? 'var(--error)' : 'var(--success)' }}
                        >
                          {u.active ? 'Letiltás' : 'Aktiválás'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '90dvh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {/* Modal header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                {modal === 'create' ? 'Új felhasználó' : `Szerkesztés — ${editing?.name}`}
              </span>
              <button className="btn-icon" onClick={() => setModal(null)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: 5 }}>Teljes név</label>
                  <input className="input" value={fName} onChange={e => setFName(e.target.value)} placeholder="Pl. Kovács János" />
                </div>
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: 5 }}>Email</label>
                  <input className="input" type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="nev@ceg.hu" disabled={modal === 'edit'} style={{ opacity: modal === 'edit' ? 0.5 : 1 }} />
                </div>
              </div>

              {modal === 'create' && (
                <div style={{ marginBottom: 16 }}>
                  <label className="label" style={{ display: 'block', marginBottom: 5 }}>Jelszó</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" value={fPassword} onChange={e => setFPassword(e.target.value)} style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }} />
                    <button className="btn-ghost" onClick={() => setFPassword(genPassword())} title="Új generálás" style={{ flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>Mentsd el ezt a jelszót, mielőtt megosztod a felhasználóval.</div>
                </div>
              )}

              {/* Template picker */}
              <div style={{ marginBottom: 14 }}>
                <label className="label" style={{ display: 'block', marginBottom: 6 }}>Sablon alkalmazása</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {TEMPLATES.map(t => (
                    <button key={t.name} className="btn-ghost btn-sm" onClick={() => applyTemplate(t.name)}
                      style={{ fontSize: 11.5, borderColor: fPerms.length === t.permissions.length && t.permissions.every(p => fPerms.includes(p)) ? 'var(--primary)' : undefined }}>
                      {t.name}
                    </button>
                  ))}
                  <button className="btn-ghost btn-sm" onClick={() => setFPerms([])} style={{ fontSize: 11.5 }}>Törlés</button>
                </div>
              </div>

              {/* Permission checkboxes */}
              <label className="label" style={{ display: 'block', marginBottom: 10 }}>Jogosultságok ({fPerms.length}/{ALL_PERMISSIONS.length})</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {permsGrouped.map(g => (
                  <div key={g.group}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{g.group}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {g.items.map(p => (
                        <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: fPerms.includes(p.key) ? 'var(--primary-bg)' : 'transparent', border: `1px solid ${fPerms.includes(p.key) ? 'var(--primary-border)' : 'transparent'}`, transition: 'all 0.15s' }}>
                          <input type="checkbox" checked={fPerms.includes(p.key)} onChange={() => togglePerm(p.key)} style={{ accentColor: 'var(--primary)', width: 13, height: 13, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: fPerms.includes(p.key) ? 'var(--text)' : 'var(--text-muted)', fontWeight: fPerms.includes(p.key) ? 600 : 400 }}>{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0, background: 'var(--surface)' }}>
              <button className="btn-ghost" onClick={() => setModal(null)}>Mégse</button>
              <button className="btn-primary" onClick={modal === 'create' ? saveCreate : saveEdit} disabled={saving}>
                {saving ? 'Mentés...' : (modal === 'create' ? 'Létrehozás' : 'Mentés')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 999, padding: '9px 18px',
          fontSize: 13, fontWeight: 600, color: 'var(--text)',
          boxShadow: 'var(--shadow-md)', zIndex: 200,
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(6px); } }
      `}</style>
    </div>
  );
}
