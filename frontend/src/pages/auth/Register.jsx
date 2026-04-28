import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/endpoints';

export default function Register() {
  const navigate = useNavigate();
  const [form, setF]  = useState({ full_name: '', email: '', password: '', phone: '' });
  const [error, setE] = useState('');
  const [ok, setOk]   = useState(false);
  const [loading, setL] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setE(''); setL(true);
    try {
      await authApi.register(form);
      setOk(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setE(err.response?.data?.error || 'Error al registrarse.');
    } finally { setL(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <div className="auth-logo">
          <div className="logo-icon">🐾</div>
          <h1>VetClinic</h1>
          <p>Crea tu cuenta</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {ok    && <div className="alert alert-success">✅ Cuenta creada. Redirigiendo...</div>}
        <form className="auth-form" onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input className="form-input" placeholder="Ana García" required
              value={form.full_name} onChange={e => setF(p => ({...p, full_name: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" placeholder="tu@email.com" required
              value={form.email} onChange={e => setF(p => ({...p, email: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono (opcional)</label>
            <input className="form-input" placeholder="+34 600 000 000"
              value={form.phone} onChange={e => setF(p => ({...p, phone: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" placeholder="Mínimo 6 caracteres" required minLength={6}
              value={form.password} onChange={e => setF(p => ({...p, password: e.target.value}))} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading || ok}>
            {loading ? '⏳ Registrando...' : '✓ Crear cuenta'}
          </button>
        </form>
        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
