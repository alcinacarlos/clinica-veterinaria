import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { petsApi } from '../../api/endpoints';

const SPECIES = ['Todos', 'perro', 'gato', 'conejo', 'ave', 'reptil'];
const STATUS  = [
  { value: '',           label: 'Todos' },
  { value: 'available',  label: 'Disponible' },
  { value: 'adopted',    label: 'Adoptado' },
  { value: 'unavailable',label: 'No disponible' },
];
const PET_EMOJIS = { perro: '🐕', gato: '🐈', conejo: '🐇', ave: '🦜', reptil: '🦎' };
const STATUS_BADGE = {
  available:   'badge-green',
  adopted:     'badge-purple',
  unavailable: 'badge-gray',
};
const STATUS_LABEL = { available: 'Disponible', adopted: 'Adoptado', unavailable: 'No disponible' };

export default function PetList() {
  const navigate          = useNavigate();
  const [pets, setPets]   = useState([]);
  const [loading, setL]   = useState(true);
  const [search, setS]    = useState('');
  const [species, setSp]  = useState('');
  const [status, setSt]   = useState('available');

  const load = async () => {
    setL(true);
    try {
      const params = {};
      if (species && species !== 'Todos') params.species = species;
      if (status)  params.status = status;
      const r = await petsApi.getAll(params);
      setPets(r.data.pets);
    } catch {}
    setL(false);
  };

  useEffect(() => { load(); }, [species, status]);

  const filtered = pets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.breed?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>🐾 Mascotas en adopción</h1>
          <p className="text-muted">Encuentra a tu nuevo compañero</p>
        </div>
      </div>

      <div className="filters-bar">
        <input className="form-input" placeholder="🔍 Buscar por nombre o raza..."
          value={search} onChange={e => setS(e.target.value)} style={{ maxWidth: 260 }} />
        <select className="form-select" value={species} onChange={e => setSp(e.target.value)}>
          {SPECIES.map(s => <option key={s} value={s === 'Todos' ? '' : s}>{s}</option>)}
        </select>
        <select className="form-select" value={status} onChange={e => setSt(e.target.value)}>
          {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <h3>No se encontraron mascotas</h3>
          <p>Prueba con otros filtros</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(pet => (
            <div key={pet.id} className="card pet-card" onClick={() => navigate(`/pets/${pet.id}`)}>
              <div className="pet-card-img">
                {pet.image_url
                  ? <img src={pet.image_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (PET_EMOJIS[pet.species] || '🐾')
                }
              </div>
              <div className="pet-card-body">
                <div className="flex-between mb-1">
                  <div className="pet-card-name">{pet.name}</div>
                  <span className={`badge ${STATUS_BADGE[pet.status]}`}>{STATUS_LABEL[pet.status]}</span>
                </div>
                <div className="pet-card-meta">
                  {pet.species} {pet.breed ? `· ${pet.breed}` : ''} {pet.age_years ? `· ${pet.age_years} años` : ''}
                </div>
                {pet.description && (
                  <p className="text-muted mt-1" style={{ fontSize: '.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {pet.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
