import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersApi, appointmentsApi, adoptionsApi, usersApi, petsApi } from '../api/endpoints';

const fmt = (n) => `€${Number(n).toFixed(2)}`;

export default function Dashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (user.role === 'admin') {
          const [users, pets, adoptions, orders] = await Promise.all([
            usersApi.getAll(), petsApi.getAll(), adoptionsApi.getAll(), ordersApi.getAll(),
          ]);
          const pendingAdopt = adoptions.data.adoptions.filter(a => a.status === 'pending').length;
          const revenue      = orders.data.orders.reduce((s, o) => s + Number(o.total), 0);
          setStats({
            users: users.data.users.length,
            pets:  pets.data.pets.filter(p => p.status === 'available').length,
            pendingAdopt,
            revenue,
          });
        } else if (user.role === 'clientela') {
          const [orders, appts] = await Promise.all([
            ordersApi.getAll(), appointmentsApi.getAll(),
          ]);
          setStats({
            orders:  orders.data.orders.length,
            appts:   appts.data.appointments.filter(a => a.status === 'scheduled').length,
            spent:   orders.data.orders.reduce((s, o) => s + Number(o.total), 0),
          });
        } else if (user.role === 'veterinario') {
          const appts = await appointmentsApi.getAll({ status: 'scheduled' });
          setStats({ pending: appts.data.appointments.length });
        } else if (user.role === 'ventas') {
          const orders = await ordersApi.getAll();
          const pending = orders.data.orders.filter(o => o.status === 'pending').length;
          setStats({ orders: orders.data.orders.length, pending });
        }
      } catch {}
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Bienvenido, {user.full_name?.split(' ')[0] || 'Usuario'} 👋</h1>
          <p className="text-muted">Panel principal · {user.role}</p>
        </div>
        {user.is_adopter && (
          <span className="badge badge-green" style={{ fontSize: '.85rem', padding: '.35rem .9rem' }}>
            ⭐ Adoptante — Descuentos activos
          </span>
        )}
      </div>

      {user.role === 'admin' && (
        <>
          <div className="stat-grid">
            {[
              { icon: '👥', label: 'Usuarios', value: stats.users, action: () => navigate('/admin/users') },
              { icon: '🐾', label: 'Mascotas disponibles', value: stats.pets, action: () => navigate('/pets') },
              { icon: '❤️',  label: 'Adopciones pendientes', value: stats.pendingAdopt, action: () => navigate('/admin/adoptions') },
              { icon: '💰', label: 'Ingresos totales', value: fmt(stats.revenue || 0), action: () => navigate('/my-orders') },
            ].map(s => (
              <div key={s.label} className="card stat-card" style={{ cursor: 'pointer' }} onClick={s.action}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value text-primary">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="mb-2">Acciones rápidas</h3>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/admin/adoptions')}>❤️ Gestionar adopciones</button>
              <button className="btn btn-ghost" onClick={() => navigate('/pets')}>🐾 Añadir mascota</button>
              <button className="btn btn-ghost" onClick={() => navigate('/admin/inventory')}>📦 Inventario</button>
              <button className="btn btn-ghost" onClick={() => navigate('/appointments')}>📅 Ver citas</button>
            </div>
          </div>
        </>
      )}

      {user.role === 'clientela' && (
        <>
          {user.is_adopter && (
            <div className="adopter-banner">
              <span className="banner-icon">🎉</span>
              <div className="banner-text">
                <h3>¡Eres un adoptante!</h3>
                <p>Tienes un descuento exclusivo en tienda y servicios veterinarios.</p>
              </div>
            </div>
          )}
          <div className="stat-grid">
            {[
              { icon: '📦', label: 'Mis órdenes', value: stats.orders },
              { icon: '📅', label: 'Citas pendientes', value: stats.appts },
              { icon: '💸', label: 'Total gastado', value: fmt(stats.spent || 0) },
            ].map(s => (
              <div key={s.label} className="card stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value text-primary">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="mb-2">Acciones rápidas</h3>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/pets')}>🐾 Explorar mascotas</button>
              <button className="btn btn-ghost"   onClick={() => navigate('/store')}>🛒 Ir a la tienda</button>
              <button className="btn btn-ghost"   onClick={() => navigate('/services')}>💊 Reservar cita</button>
              <button className="btn btn-ghost"   onClick={() => navigate('/appointments')}>📅 Mis citas</button>
            </div>
          </div>
        </>
      )}

      {user.role === 'veterinario' && (
        <>
          <div className="stat-grid">
            <div className="card stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-value text-primary">{stats.pending}</div>
              <div className="stat-label">Citas pendientes hoy</div>
            </div>
          </div>
          <div className="card">
            <h3 className="mb-2">Acciones rápidas</h3>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/appointments')}>📅 Ver mi agenda</button>
            </div>
          </div>
        </>
      )}

      {user.role === 'ventas' && (
        <>
          <div className="stat-grid">
            {[
              { icon: '🧾', label: 'Total órdenes',     value: stats.orders },
              { icon: '⏳', label: 'Órdenes pendientes', value: stats.pending },
            ].map(s => (
              <div key={s.label} className="card stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value text-primary">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="mb-2">Acciones rápidas</h3>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/my-orders')}>🧾 Gestionar órdenes</button>
              <button className="btn btn-ghost"   onClick={() => navigate('/admin/inventory')}>📦 Inventario</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
