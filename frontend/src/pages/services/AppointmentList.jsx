import { useEffect, useState } from 'react';
import { appointmentsApi, medicalApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';

const APPT_BADGE = { scheduled: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };
const APPT_LABEL = { scheduled: '📅 Programada', completed: '✅ Completada', cancelled: '❌ Cancelada' };

export default function AppointmentList() {
  const { user }    = useAuth();
  const [appts, setA] = useState([]);
  const [loading, setL] = useState(true);
  const [filter, setF]  = useState('scheduled');
  const [medModal, setMedModal] = useState(null);
  const [medForm, setMedForm]   = useState({ diagnosis: '', treatment: '', notes: '' });
  const [msg, setMsg] = useState('');

  const load = async () => {
    setL(true);
    try { const r = await appointmentsApi.getAll(filter ? { status: filter } : {}); setA(r.data.appointments); } catch {}
    setL(false);
  };
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    try { await appointmentsApi.updateStatus(id, { status }); load(); } catch {}
  };

  const addRecord = async () => {
    setMsg('');
    try {
      await medicalApi.create({ pet_id: medModal.pet_id, appointment_id: medModal.id, ...medForm });
      setMsg('✅ Registro médico añadido.');
      await updateStatus(medModal.id, 'completed');
      setTimeout(() => { setMedModal(null); setMsg(''); }, 1500);
    } catch (e) { setMsg(e.response?.data?.error || 'Error al guardar registro.'); }
  };

  const isVet   = user?.role === 'veterinario';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>📅 {isVet ? 'Mi Agenda' : isAdmin ? 'Todas las citas' : 'Mis citas'}</h1>
          <p className="text-muted">{appts.length} {appts.length === 1 ? 'cita' : 'citas'}</p>
        </div>
      </div>

      <div className="filters-bar">
        {['', 'scheduled', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setF(s)}>
            {s === '' ? 'Todas' : APPT_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : appts.length === 0 ? (
        <div className="empty-state card"><div className="empty-icon">📅</div><h3>No hay citas</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {appts.map(a => (
            <div key={a.id} className="card">
              <div className="appt-card">
                <div className="appt-time">
                  <div className="hour">{new Date(a.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="date">{new Date(a.scheduled_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex-between mb-1">
                    <h3>{a.service?.name || 'Servicio'}</h3>
                    <span className={`badge ${APPT_BADGE[a.status]}`}>{APPT_LABEL[a.status]}</span>
                  </div>
                  <div style={{ fontSize: '.8rem', color: 'var(--color-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {a.user   && <span>👤 {a.user.full_name}</span>}
                    {a.vet    && <span>🩺 Dr. {a.vet.full_name}</span>}
                    {a.pet    && <span>🐾 {a.pet.name}</span>}
                    <span style={{ color: a.discount_percent > 0 ? 'var(--color-primary)' : 'inherit' }}>
                      💰 €{Number(a.price_paid).toFixed(2)}
                      {a.discount_percent > 0 && <span className="badge badge-green" style={{ marginLeft: '.35rem', fontSize: '.7rem' }}>−{a.discount_percent}%</span>}
                    </span>
                  </div>
                  {a.notes && <p className="mt-1" style={{ fontSize: '.8rem' }}>{a.notes}</p>}
                </div>
                {(isVet || isAdmin) && a.status === 'scheduled' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                    {isVet && a.pet_id && (
                      <button className="btn btn-accent btn-sm" onClick={() => { setMedModal(a); setMedForm({ diagnosis:'', treatment:'', notes:'' }); }}>📋 Añadir diagnóstico</button>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a.id, 'completed')}>✅ Completar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a.id, 'cancelled')}>❌ Cancelar</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {medModal && (
        <Modal title="Añadir registro médico" onClose={() => setMedModal(null)}
          footer={<><button className="btn btn-ghost" onClick={() => setMedModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={addRecord}>Guardar y completar</button></>}
        >
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <p className="mb-2 text-muted">Mascota: <strong style={{ color: 'var(--color-text)' }}>{medModal.pet?.name}</strong></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Diagnóstico *</label>
              <textarea className="form-textarea" rows={3} value={medForm.diagnosis} onChange={e => setMedForm(p => ({...p, diagnosis: e.target.value}))} placeholder="Descripción del diagnóstico..." />
            </div>
            <div className="form-group">
              <label className="form-label">Tratamiento</label>
              <textarea className="form-textarea" rows={2} value={medForm.treatment} onChange={e => setMedForm(p => ({...p, treatment: e.target.value}))} placeholder="Medicación, dosis, duración..." />
            </div>
            <div className="form-group">
              <label className="form-label">Notas adicionales</label>
              <textarea className="form-textarea" rows={2} value={medForm.notes} onChange={e => setMedForm(p => ({...p, notes: e.target.value}))} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
