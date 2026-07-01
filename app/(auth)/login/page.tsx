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
      if (!res.ok) setError(data.error || 'Hibás email vagy jelszó');
      else router.push('/dashboard');
    } catch {
      setError('Hálózati hiba. Próbáld újra.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex' }}>

      {/* ── Left branding panel (desktop only) ── */}
      <div style={{
        display: 'none',
        width: '400px',
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        flexDirection: 'column',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
      }} className="lg-panel">
        {/* subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: 'linear-gradient(var(--text) 1px,transparent 1px),linear-gradient(90deg,var(--text) 1px,transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
        {/* glow */}
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', background: 'rgba(220,38,38,0.08)', borderRadius: '50%', filter: 'blur(80px)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'auto' }}>
          <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Vezénylő</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Irányító rendszer</div>
          </div>
        </div>

        {/* Copy */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: 10 }}>
            Útépítés &amp; Mélyépítés<br />Vezénylő Rendszer
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Gépek, heti vezénylés, munkalapok, hiba&shy;bejelentések és raktarkészlet — egy helyen.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Géppark', 'Heti vezénylés', 'Munkalapok', 'Polcrendszer', 'Hibakövetés', 'Megrendelések'].map(f => (
            <span key={f} style={{ display: 'inline-block', padding: '4px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 999, fontSize: 11.5, color: 'var(--text-muted)' }}>{f}</span>
          ))}
        </div>
      </div>

      {/* ── Right: login form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Mobile logo — plain text + tiny icon, NO giant SVG */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{ width: 28, height: 28, background: 'var(--primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Vezénylő</span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.03em' }}>
            Bejelentkezés
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
            Add meg az adataidat a folytatáshoz
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                Email cím
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="input"
                placeholder="nev@ceg.hu"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                Jelszó
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--error-bg)', border: '1px solid rgba(224,82,82,0.25)',
                borderRadius: 8, padding: '9px 12px',
              }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--error)" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span style={{ fontSize: 12.5, color: 'var(--error)' }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ height: 40, marginTop: 2, fontSize: 14 }}
            >
              {loading ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Belépés...
                </>
              ) : 'Belépés'}
            </button>
          </form>
        </div>
      </div>

      {/* Desktop panel CSS + spinner */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
