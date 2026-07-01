'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Record<string,string>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => setUsers(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Felhasználók</h1>
        <Link href="/admin/users/new" className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center">
          + Új felhasználó
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <Link key={u.id} href={`/admin/users/${u.id}`}
              className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-colors">
              <div>
                <p className="font-medium text-white">{u.name}</p>
                <p className="text-sm text-gray-400">{u.email}</p>
                <p className="text-xs text-gray-500">{u.last_login_at ? `Utoljára: ${new Date(u.last_login_at).toLocaleDateString('hu-HU')}` : 'Még nem lépett be'}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                u.active === 'true' || u.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>{u.active ? 'Aktív' : 'Inaktív'}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
