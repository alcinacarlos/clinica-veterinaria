import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ROLE_LINKS = {
  admin: [
    { section: 'General', links: [
      { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
      { to: '/pets',      icon: '🐾', label: 'Mascotas' },
      { to: '/services',  icon: '💊', label: 'Servicios' },
      { to: '/store',     icon: '🛒', label: 'Tienda' },
    ]},
    { section: 'Administración', links: [
      { to: '/admin/users',     icon: '👥', label: 'Usuarios' },
      { to: '/admin/adoptions', icon: '❤️',  label: 'Adopciones' },
      { to: '/admin/inventory', icon: '📦', label: 'Inventario' },
      { to: '/appointments',    icon: '📅', label: 'Citas' },
    ]},
  ],
  clientela: [
    { section: 'Mi cuenta', links: [
      { to: '/dashboard',   icon: '🏠', label: 'Dashboard' },
      { to: '/pets',        icon: '🐾', label: 'Adopciones' },
      { to: '/store',       icon: '🛒', label: 'Tienda' },
      { to: '/my-orders',   icon: '📦', label: 'Mis órdenes' },
      { to: '/services',    icon: '💊', label: 'Servicios' },
      { to: '/appointments',icon: '📅', label: 'Mis citas' },
    ]},
  ],
  veterinario: [
    { section: 'Veterinario', links: [
      { to: '/dashboard',    icon: '🏠', label: 'Dashboard' },
      { to: '/appointments', icon: '📅', label: 'Mi agenda' },
      { to: '/pets',         icon: '🐾', label: 'Mascotas' },
    ]},
  ],
  ventas: [
    { section: 'Ventas', links: [
      { to: '/dashboard',       icon: '🏠', label: 'Dashboard' },
      { to: '/admin/inventory', icon: '📦', label: 'Inventario' },
      { to: '/my-orders',       icon: '🧾', label: 'Órdenes' },
    ]},
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { count }        = useCart();
  const navigate         = useNavigate();
  if (!user) return null;

  const sections = ROLE_LINKS[user.role] || ROLE_LINKS.clientela;
  const initials = user.full_name?.split(' ').map(w => w[0]).slice(0,2).join('') || user.email[0].toUpperCase();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">🐾 VetClinic</div>
        <div className="logo-sub">Plataforma Veterinaria</div>
      </div>

      {sections.map(sec => (
        <div key={sec.section}>
          <div className="sidebar-section">{sec.section}</div>
          {sec.links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="link-icon">{link.icon}</span>
              {link.label}
              {link.to === '/store' && count > 0 && (
                <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: '.7rem', padding: '.1rem .45rem' }}>{count}</span>
              )}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        {user.is_adopter && (
          <div className="badge badge-green mb-2" style={{ width: '100%', justifyContent: 'center' }}>
            ⭐ Adoptante — Descuentos activos
          </div>
        )}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="name">{user.full_name || user.email}</div>
            <div className="role">{user.role}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-full btn-sm" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
