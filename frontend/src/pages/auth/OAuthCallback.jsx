import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/endpoints';

/**
 * Página de callback OAuth.
 * Supabase redirige aquí tras el login con GitHub con el token en la URL.
 * Extrae la sesión, la guarda en localStorage y carga el perfil del backend.
 */
export default function OAuthCallback() {
  const navigate      = useNavigate();
  const { login: _ } = useAuth(); // No usamos login() aquí, lo hacemos manualmente
  const [status, setStatus] = useState('Procesando autenticación...');
  const [error,  setError]  = useState('');

  useEffect(() => {
    const handle = async () => {
      try {
        // Supabase detecta automáticamente el token del hash de la URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // Intentar una vez más con onAuthStateChange
          await new Promise((resolve) => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
              async (event, sess) => {
                if (sess) {
                  subscription.unsubscribe();
                  resolve(sess);
                }
              }
            );
            // Timeout de seguridad
            setTimeout(() => resolve(null), 5000);
          });

          const { data: { session: sess2 } } = await supabase.auth.getSession();
          if (!sess2) {
            setError('No se pudo obtener la sesión de GitHub. Intenta de nuevo.');
            return;
          }
        }

        const finalSession = session || (await supabase.auth.getSession()).data.session;
        if (!finalSession) {
          setError('Sesión no encontrada. Por favor, inicia sesión de nuevo.');
          return;
        }

        // Guardar token en localStorage (para el interceptor de axios)
        const accessToken = finalSession.access_token;
        localStorage.setItem('vc_token', accessToken);

        setStatus('Cargando tu perfil...');

        // Llamar al backend para obtener/crear el perfil
        // El middleware authenticate auto-crea el perfil si es primer login
        const { data } = await authApi.me();
        localStorage.setItem('vc_user', JSON.stringify(data.user));

        setStatus('¡Bienvenido! Redirigiendo...');

        // Forzar recarga del AuthContext
        setTimeout(() => navigate('/dashboard', { replace: true }), 800);

      } catch (err) {
        console.error('[OAuthCallback] Error:', err);
        setError(err.response?.data?.error || 'Error durante la autenticación con GitHub.');
      }
    };

    handle();
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
          {error ? '❌' : '🐾'}
        </div>

        {error ? (
          <>
            <h2 style={{ marginBottom: '.75rem' }}>Error de autenticación</h2>
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              ← Volver al login
            </button>
          </>
        ) : (
          <>
            <div className="spinner" style={{ margin: '0 auto 1.5rem' }} />
            <h2>{status}</h2>
            <p className="text-muted mt-1">Conectando con GitHub...</p>
          </>
        )}
      </div>
    </div>
  );
}
