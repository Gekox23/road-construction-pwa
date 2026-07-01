'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Hibás bejelentkezés');
      else router.push('/dashboard');
    } catch {
      setError('Kapcsolódási hiba.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] bg-[#0a0a0a] border-r border-[#1e1e1e] flex-col p-10 relative overflow-hidden flex-shrink-0">
        {/* Subtle grid bg */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        {/* Red glow */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10 flex items-center gap-2.5 mb-auto">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-white font-semibold text-[15px]">Vezénylő</span>
        </div>

        <div className="relative z-10 mb-10">
          <h2 className="text-3xl font-bold text-white mb-3 leading-snug">Útépítés &amp; Mélyépítés<br />Irányító Rendszer</h2>
          <p className="text-[#666] text-sm leading-relaxed">Gépek, heti vezénylés, munkalapok, hiba&shy;bejelentések és raktarkészlet — egy helyen kezelve.</p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {['Géppark kezelés', 'Heti vezénylés', 'Munkalapok', 'Polcrendszer', 'Hiba&shy;bejelentés', 'Megrendelések'].map(f => (
            <span key={f} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] text-xs" dangerouslySetInnerHTML={{__html: f}} />
          ))}
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-white font-semibold">Vezénylő</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Bejelentkezés</h1>
          <p className="text-[#666] text-sm mb-7">Add meg az adataidat a folytatáshoz</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Email cím</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" required
                className="input"
                placeholder="nev@ceg.hu"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#888] mb-1.5">Jelszó</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" required
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2.5">
                <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-300 text-xs">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full h-10 mt-1">
              {loading
                ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Belépés...</>
                : 'Belépés'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
