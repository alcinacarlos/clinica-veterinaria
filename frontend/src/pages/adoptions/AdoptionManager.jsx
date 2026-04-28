import { useEffect, useState } from 'react';
import { adoptionsApi, petsApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';

const STATUS_BADGE = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red' };
const STATUS_LABEL = { pending: '⏳ Pendiente', approved: '✅ Aprobada', rejected: '❌ Rechazada' };

export default function AdoptionManager() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setL] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [adminNotes, setNotes] = useState('');
  const [err, setErr] = useState('');
  // Formulario nueva mascota
  const [petModal, setPetModal] = useState(false);
  const [petForm, setPetForm] = useState({ name: '', species: '', breed: '', age_years: '', description: '' });
  const [petMsg, setPetMsg] = useState('');

  const load = async () => {
    setL(true);
    try {
      const r = await adoptionsApi.getAll(filter ? { status: filter } : {});
      setAdoptions(r.data.adoptions);
    } catch {}
    setL(false);
  };

  useEffect(() => { load(); }, [filter]);

  const processAdoption = async (status) => {
    setErr('');
    try {
      await adoptionsApi.updateStatus(selected.id, { status, admin_notes: adminNotes });
      setSelected(null); setNotes(''); load();
    } catch (e) { setErr(e.response?.data?.error || 'Error al procesar.'); }
  };

  const createPet = async () => {
    setPetMsg('');
    try {
      await petsApi.create({ ...petForm, age_years: Number(petForm.age_years) || null });
      setPetMsg('✅ Mascota creada correctamente.'); setPetForm({ name: '', species: '', breed: '', age_years: '', description: '' });
      setTimeout(() => { setPetModal(false); setPetMsg(''); }, 1500);
    } catch (e) { setPetMsg(e.response?.data?.error || 'Error al crear.'); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>❤️ Gestión de Adopciones</h1><p className="text-muted">Aprueba o rechaza solicitudes</p></div>
        <button className="btn btn-primary" onClick={() => setPetModal(true)}>+ Añadir mascota</button>
      </div>

      <div className="filters-bar">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(s)}>
            {s === '' ? 'Todas' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="card table-wrapper">
          <table className="table">
            <thead><tr>
              <th>Solicitante</th><th>Mascota</th><th>Especie</th><th>Fecha</th><th>Estado</th><th>Acción</th>
            </tr></thead>
            <tbody>
              {adoptions.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>No hay solicitudes</td></tr>
              ) : adoptions.map(a => (
                <tr key={a.id}>
                  <td><div style={{ fontWeight: 600 }}>{a.user?.full_name}</div><div className="text-muted" style={{ fontSize: '.75rem' }}>{a.user?.email}</div></td>
                  <td style={{ fontWeight: 500 }}>{a.pet?.name}</td>
                  <td>{a.pet?.species}</td>
                  <td className="text-muted" style={{ fontSize: '.8rem' }}>{new Date(a.created_at).toLocaleDateString('es-ES')}</td>
                  <td><span className={`badge ${STATUS_BADGE[a.status]}`}>{STATUS_LABEL[a.status]}</span></td>
                  <td>
                    {a.status === 'pending' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(a); setNotes(''); }}>Revisar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal title={`Solicitud de adopción — ${selected.pet?.name}`} onClose={() => setSelected(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cancelar</button>
            <button className="btn btn-danger btn-sm" onClick={() => processAdoption('rejected')}>❌ Rechazar</button>
            <button className="btn btn-primary" onClick={() => processAdoption('approved')}>✅ Aprobar</button>
          </>}
        >
          {err && <div className="alert alert-error mb-2">{err}</div>}
          <p className="mb-2"><strong>Solicitante:</strong> {selected.user?.full_name} ({selected.user?.email})</p>
          {selected.notes && <p className="mb-2"><strong>Motivo:</strong> {selected.notes}</p>}
          <div className="form-group">
            <label className="form-label">Notas internas (opcional)</label>
            <textarea className="form-textarea" rows={3} value={adminNotes} onChange={e => setNotes(e.target.value)} placeholder="Notas para el registro interno..." />
          </div>
        </Modal>
      )}

      {petModal && (
        <Modal title="Añadir nueva mascota" onClose={() => setPetModal(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setPetModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={createPet}>Guardar</button></>}
        >
          {petMsg && <div className={`alert ${petMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{petMsg}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={petForm.name} onChange={e => setPetForm(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Especie *</label>
              <select className="form-select" value={petForm.species} onChange={e => setPetForm(p => ({...p, species: e.target.value}))}>
                <option value="">Seleccionar</option>
                {['perro','gato','conejo','ave','reptil'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Raza</label>
              <input className="form-input" value={petForm.breed} onChange={e => setPetForm(p => ({...p, breed: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Edad (años)</label>
              <input className="form-input" type="number" step="0.5" value={petForm.age_years} onChange={e => setPetForm(p => ({...p, age_years: e.target.value}))} />
            </div>
          </div>
          <div className="form-group mt-2">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" rows={3} value={petForm.description} onChange={e => setPetForm(p => ({...p, description: e.target.value}))} />
          </div>
        </Modal>
      )}
    </div>
  );
}
