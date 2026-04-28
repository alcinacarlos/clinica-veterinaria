import { useEffect, useState } from 'react';
import { servicesApi, appointmentsApi, petsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';

export default function ServiceList() {
  const { user }          = useAuth();
  const [services, setS]  = useState([]);
  const [pets, setPets]   = useState([]);
  const [loading, setL]   = useState(true);
  const [modal, setModal] = useState(false);
  const [svcModal, setSvcModal] = useState(false);
  const [selected, setSel]= useState(null);
  const [form, setForm]   = useState({ scheduled_at: '', pet_id: '', notes: '' });
  const [svcForm, setSvcForm] = useState({ name: '', description: '', price: '', duration_minutes: '' });
  const [msg, setMsg]     = useState('');
  const DISCOUNT = Number(import.meta.env.VITE_ADOPTER_DISCOUNT ?? 15);

  useEffect(() => {
    (async () => {
      try {
        const r = await servicesApi.getAll();
        setS(r.data.services);
        if (user?.role === 'clientela') {
          const pr = await petsApi.getAll({ status: 'adopted' });
          setPets(pr.data.pets);
        }
      } catch {}
      setL(false);
    })();
  }, []);

  const openBook = (svc) => { setSel(svc); setForm({ scheduled_at: '', pet_id: '', notes: '' }); setMsg(''); setModal(true); };

  const book = async () => {
    setMsg('');
    try {
      await appointmentsApi.create({ service_id: selected.id, scheduled_at: form.scheduled_at, pet_id: form.pet_id || undefined, notes: form.notes || undefined });
      setMsg('✅ ¡Cita agendada correctamente!');
      setTimeout(() => { setModal(false); setMsg(''); }, 1800);
    } catch (e) { setMsg(e.response?.data?.error || 'Error al agendar.'); }
  };

  const createService = async () => {
    setMsg('');
    try {
      await servicesApi.create({ ...svcForm, price: Number(svcForm.price), duration_minutes: Number(svcForm.duration_minutes) || null });
      setMsg('✅ Servicio creado.');
      const r = await servicesApi.getAll(); setS(r.data.services);
      setTimeout(() => { setSvcModal(false); setMsg(''); }, 1200);
    } catch (e) { setMsg(e.response?.data?.error || 'Error.'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>💊 Servicios Veterinarios</h1><p className="text-muted">Catálogo de servicios clínicos</p></div>
        {user?.role === 'admin' && <button className="btn btn-primary" onClick={() => { setSvcForm({ name:'',description:'',price:'',duration_minutes:'' }); setMsg(''); setSvcModal(true); }}>+ Nuevo servicio</button>}
      </div>

      {user?.is_adopter && (
        <div className="adopter-banner">
          <span className="banner-icon">💊</span>
          <div className="banner-text">
            <h3>Descuento de adoptante en servicios</h3>
            <p>Como adoptante, tienes un {DISCOUNT}% de descuento en todas las citas.</p>
          </div>
        </div>
      )}

      <div className="card-grid">
        {services.map(svc => {
          const finalPrice = user?.is_adopter ? svc.price * (1 - DISCOUNT / 100) : svc.price;
          return (
            <div key={svc.id} className="card">
              <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>🩺</div>
              <h3 style={{ marginBottom: '.35rem' }}>{svc.name}</h3>
              {svc.description && <p className="mb-2" style={{ fontSize: '.875rem' }}>{svc.description}</p>}
              {svc.duration_minutes && <div className="text-muted" style={{ fontSize: '.8rem', marginBottom: '.75rem' }}>⏱ {svc.duration_minutes} min</div>}
              <div className="flex-between">
                <div>
                  {user?.is_adopter ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: 'var(--color-muted)', fontSize: '.875rem', marginRight: '.5rem' }}>€{Number(svc.price).toFixed(2)}</span>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.1rem' }}>€{finalPrice.toFixed(2)}</span>
                      <span className="badge badge-green" style={{ marginLeft: '.4rem', fontSize: '.7rem' }}>−{DISCOUNT}%</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.1rem' }}>€{Number(svc.price).toFixed(2)}</span>
                  )}
                </div>
                {user?.role === 'clientela' && (
                  <button className="btn btn-primary btn-sm" onClick={() => openBook(svc)}>📅 Agendar</button>
                )}
              </div>
            </div>
          );
        })}
        {services.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="empty-icon">🩺</div><h3>No hay servicios disponibles</h3></div>}
      </div>

      {modal && selected && (
        <Modal title={`Agendar — ${selected.name}`} onClose={() => setModal(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={book}>Confirmar cita</button></>}
        >
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Fecha y hora *</label>
              <input className="form-input" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({...p, scheduled_at: e.target.value}))} />
            </div>
            {pets.length > 0 && (
              <div className="form-group">
                <label className="form-label">Mascota (opcional)</label>
                <select className="form-select" value={form.pet_id} onChange={e => setForm(p => ({...p, pet_id: e.target.value}))}>
                  <option value="">Sin especificar</option>
                  {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Notas</label>
              <textarea className="form-textarea" rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Síntomas, consulta previa..." />
            </div>
          </div>
        </Modal>
      )}

      {svcModal && (
        <Modal title="Nuevo servicio" onClose={() => setSvcModal(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setSvcModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={createService}>Guardar</button></>}
        >
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={svcForm.name} onChange={e => setSvcForm(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Precio (€) *</label>
              <input className="form-input" type="number" step="0.01" value={svcForm.price} onChange={e => setSvcForm(p => ({...p, price: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Duración (min)</label>
              <input className="form-input" type="number" value={svcForm.duration_minutes} onChange={e => setSvcForm(p => ({...p, duration_minutes: e.target.value}))} />
            </div>
          </div>
          <div className="form-group mt-2">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" rows={2} value={svcForm.description} onChange={e => setSvcForm(p => ({...p, description: e.target.value}))} />
          </div>
        </Modal>
      )}
    </div>
  );
}
