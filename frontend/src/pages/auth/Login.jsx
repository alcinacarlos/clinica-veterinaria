import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export default function Login() {
  const { login }       = useAuth();
  const navigate        = useNavigate();
  const [form, setF]    = useState({ email: '', password: '' });
  const [error, setE]   = useState('');
  const [loading, setL] = useState(false);
  const [oauthLoading, setOL] = useState(false);

  // ── Login con email/password ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); setE(''); setL(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin/users' : '/dashboard');
    } catch (err) {
      setE(err.response?.data?.error || 'Credenciales incorrectas.');
    } finally { setL(false); }
  };

  // ── Login con GitHub OAuth ───────────────────────────────
  const handleGitHub = async () => {
    setE(''); setOL(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/oauth/callback`,
          scopes: 'read:user user:email',
        },
      });
      if (error) {
        setE(error.message);
        setOL(false);
      }
      // Si no hay error, el navegador redirige → no hace falta setOL(false)
    } catch (err) {
      setE('Error al conectar con GitHub.');
      setOL(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <div className="auth-logo">
          <div className="logo-icon">🐾</div>
          <h1>VetClinic</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ── Botón GitHub OAuth ── */}
        <button
          className="btn btn-ghost btn-full"
          onClick={handleGitHub}
          disabled={oauthLoading || loading}
          style={{ marginBottom: '1.25rem', gap: '.75rem', fontSize: '.9rem', padding: '.75rem' }}
        >
          {oauthLoading ? (
            '⏳ Redirigiendo a GitHub...'
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Continuar con GitHub
            </>
          )}
        </button>

        {/* ── Divider ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ color: 'var(--color-muted)', fontSize: '.8rem', whiteSpace: 'nowrap' }}>o con email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        {/* ── Formulario email/password ── */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" placeholder="tu@email.com" required
              value={form.email} onChange={e => setF(p => ({...p, email: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" placeholder="••••••••" required
              value={form.password} onChange={e => setF(p => ({...p, password: e.target.value}))} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading || oauthLoading}>
            {loading ? '⏳ Entrando...' : '→ Iniciar sesión'}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </div>
      </div>
    </div>
  );
}

