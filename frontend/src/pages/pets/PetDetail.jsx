import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petsApi, adoptionsApi, medicalApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/ui/Modal';

const PET_EMOJIS = { perro: '🐕', gato: '🐈', conejo: '🐇', ave: '🦜', reptil: '🦎' };

export default function PetDetail() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const [pet, setPet]  = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setL]= useState(true);
  const [modal, setM]  = useState(false);
  const [notes, setNotes] = useState('');
  const [msg, setMsg]  = useState('');
  const [err, setErr]  = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await petsApi.getById(id);
        setPet(r.data.pet);
        // Cargar historial médico si es vet o clientela adoptante
        if (user && ['veterinario', 'clientela'].includes(user.role)) {
          try {
            const rec = await medicalApi.getByPet(id);
            setRecords(rec.data.medical_records);
          } catch {}
        }
      } catch { navigate('/pets'); }
      setL(false);
    })();
  }, [id]);

  const adopt = async () => {
    setErr(''); setMsg('');
    try {
      await adoptionsApi.create({ pet_id: id, notes });
      setMsg('✅ Solicitud enviada. ¡Te avisaremos pronto!');
      setM(false); setNotes('');
    } catch (e) { setErr(e.response?.data?.error || 'Error al enviar solicitud.'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!pet)    return null;

  const canAdopt = user?.role === 'clientela' && pet.status === 'available';
  const isAdmin  = user?.role === 'admin';

  return (
    <div className="fade-in">
      <button className="btn btn-ghost btn-sm mb-2" onClick={() => navigate('/pets')}>← Volver</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ height: 320, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}>
            {pet.image_url
              ? <img src={pet.image_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (PET_EMOJIS[pet.species] || '🐾')
            }
          </div>
        </div>

        <div className="card">
          <div className="flex-between mb-2">
            <h1>{pet.name}</h1>
            <span className={`badge ${pet.status === 'available' ? 'badge-green' : pet.status === 'adopted' ? 'badge-purple' : 'badge-gray'}`}>
              {pet.status === 'available' ? 'Disponible' : pet.status === 'adopted' ? 'Adoptado' : 'No disponible'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1.5rem' }}>
            {[
              ['🐾 Especie',  pet.species],
              ['🏷️ Raza',    pet.breed || 'Sin especificar'],
              ['🎂 Edad',    pet.age_years ? `${pet.age_years} años` : 'Desconocida'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', gap: '.5rem', fontSize: '.875rem' }}>
                <span style={{ color: 'var(--color-muted)', minWidth: 100 }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
          {pet.description && <p className="mb-2">{pet.description}</p>}

          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-error">{err}</div>}

          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            {canAdopt && (
              <button className="btn btn-primary" onClick={() => setM(true)}>❤️ Solicitar adopción</button>
            )}
            {isAdmin && (
              <button className="btn btn-ghost" onClick={() => navigate(`/pets`)}>✏️ Editar (desde panel)</button>
            )}
          </div>
        </div>
      </div>

      {records.length > 0 && (
        <div className="card mt-3">
          <h3 className="mb-2">📋 Historial médico</h3>
          <div className="timeline">
            {records.map(r => (
              <div key={r.id} className="timeline-item">
                <div className="timeline-dot">🩺</div>
                <div className="timeline-content">
                  <div className="timeline-date">{new Date(r.recorded_at).toLocaleDateString('es-ES', { dateStyle: 'long' })} · Dr. {r.vet?.full_name}</div>
                  <div className="card" style={{ padding: '.85rem 1rem', marginTop: '.35rem' }}>
                    <strong>Diagnóstico:</strong> {r.diagnosis}<br />
                    {r.treatment && <><strong>Tratamiento:</strong> {r.treatment}<br /></>}
                    {r.notes && <span className="text-muted">{r.notes}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <Modal title="Solicitar adopción" onClose={() => setM(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setM(false)}>Cancelar</button><button className="btn btn-primary" onClick={adopt}>Enviar solicitud</button></>}
        >
          <p className="mb-2">¿Por qué quieres adoptar a <strong>{pet.name}</strong>?</p>
          <textarea className="form-textarea" placeholder="Cuéntanos sobre tu hogar, experiencia con mascotas..." rows={4} value={notes} onChange={e => setNotes(e.target.value)} />
        </Modal>
      )}
    </div>
  );
}
