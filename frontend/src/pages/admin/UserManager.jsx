import { useEffect, useState } from 'react';
import { usersApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';

const ROLES = ['admin', 'clientela', 'veterinario', 'ventas'];
const ROLE_BADGE = { admin: 'badge-purple', clientela: 'badge-blue', veterinario: 'badge-green', ventas: 'badge-yellow' };

export default function UserManager() {
  const [users, setU]   = useState([]);
  const [loading, setL] = useState(true);
  const [search, setS]  = useState('');
  const [modal, setModal] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [msg, setMsg]   = useState('');

  const load = async () => {
    setL(true);
    try { const r = await usersApi.getAll(); setU(r.data.users); } catch {}
    setL(false);
  };
  useEffect(() => { load(); }, []);

  const saveRole = async () => {
    setMsg('');
    try {
      await usersApi.updateRole(modal.id, newRole);
      setMsg('✅ Rol actualizado.'); load();
      setTimeout(() => { setModal(null); setMsg(''); }, 1200);
    } catch (e) { setMsg(e.response?.data?.error || 'Error.'); }
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>👥 Gestión de Usuarios</h1><p className="text-muted">{users.length} usuarios registrados</p></div>
      </div>
      <div className="filters-bar">
        <input className="form-input" placeholder="🔍 Buscar por nombre o email..." value={search} onChange={e => setS(e.target.value)} style={{ maxWidth: 320 }} />
      </div>
      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="card table-wrapper">
          <table className="table">
            <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Adoptante</th><th>Registro</th><th>Acción</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.full_name || '—'}</td>
                  <td className="text-muted" style={{ fontSize: '.8rem' }}>{u.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                  <td>{u.is_adopter ? <span className="badge badge-green">⭐ Sí</span> : <span className="text-muted">—</span>}</td>
                  <td className="text-muted" style={{ fontSize: '.8rem' }}>{new Date(u.created_at).toLocaleDateString('es-ES')}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setModal(u); setNewRole(u.role); setMsg(''); }}>
                      ✏️ Cambiar rol
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={`Cambiar rol — ${modal.full_name || modal.email}`} onClose={() => setModal(null)}
          footer={<><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={saveRole}>Guardar</button></>}
        >
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <div className="form-group">
            <label className="form-label">Nuevo rol</label>
            <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
