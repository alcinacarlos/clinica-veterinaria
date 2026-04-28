import { useEffect, useState } from 'react';
import { productsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Modal from '../../components/ui/Modal';
import Cart from './Cart';

export default function ProductList() {
  const { user }         = useAuth();
  const { addItem, count }= useCart();
  const [products, setP] = useState([]);
  const [loading, setL]  = useState(true);
  const [search, setS]   = useState('');
  const [cartOpen, setCO]= useState(false);
  const [modal, setModal]= useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]  = useState({ name: '', description: '', price: '', stock: '', category: '', image_url: '' });
  const [msg, setMsg]    = useState('');

  const load = async () => {
    setL(true);
    try { const r = await productsApi.getAll(); setP(r.data.products); } catch {}
    setL(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm({ name:'',description:'',price:'',stock:'',category:'',image_url:'' }); setMsg(''); setModal(true); };
  const openEdit   = (p) => { setEditItem(p); setForm({ name: p.name, description: p.description||'', price: p.price, stock: p.stock, category: p.category||'', image_url: p.image_url||'' }); setMsg(''); setModal(true); };

  const save = async () => {
    setMsg('');
    const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editItem) await productsApi.update(editItem.id, data);
      else           await productsApi.create(data);
      setMsg('✅ Guardado correctamente.'); load();
      setTimeout(() => { setModal(false); setMsg(''); }, 1200);
    } catch (e) { setMsg(e.response?.data?.error || 'Error al guardar.'); }
  };

  const canManage = user && ['admin', 'ventas'].includes(user.role);
  const isClient  = user?.role === 'clientela';

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>🛒 Tienda</h1><p className="text-muted">Productos para tu mascota</p></div>
        <div style={{ display: 'flex', gap: '.75rem' }}>
          {canManage && <button className="btn btn-ghost" onClick={openCreate}>+ Nuevo producto</button>}
          {isClient  && (
            <button className="btn btn-primary" onClick={() => setCO(true)}>
              🛒 Carrito {count > 0 && <span className="badge badge-green" style={{ padding: '.1rem .45rem' }}>{count}</span>}
            </button>
          )}
        </div>
      </div>

      {user?.is_adopter && (
        <div className="adopter-banner">
          <span className="banner-icon">🏷️</span>
          <div className="banner-text">
            <h3>Descuento de adoptante activo</h3>
            <p>El descuento se aplica automáticamente al finalizar tu compra.</p>
          </div>
        </div>
      )}

      <div className="filters-bar">
        <input className="form-input" placeholder="🔍 Buscar productos o categoría..." value={search} onChange={e => setS(e.target.value)} style={{ maxWidth: 300 }} />
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="card-grid">
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.35rem' }}>{p.category || 'General'}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '.25rem' }}>{p.name}</div>
              {p.description && <p style={{ fontSize: '.8rem', marginBottom: '.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>}
              <div className="flex-between mt-2">
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>€{Number(p.price).toFixed(2)}</div>
                  <div style={{ fontSize: '.75rem', color: p.stock > 0 ? 'var(--color-muted)' : 'var(--color-danger)' }}>
                    {p.stock > 0 ? `Stock: ${p.stock}` : 'Sin stock'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  {canManage && <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️</button>}
                  {isClient  && <button className="btn btn-primary btn-sm" disabled={p.stock === 0} onClick={() => addItem(p)}>+ Añadir</button>}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="empty-icon">🛍️</div><h3>No hay productos</h3></div>}
        </div>
      )}

      <Cart open={cartOpen} onClose={() => setCO(false)} />

      {modal && (
        <Modal title={editItem ? 'Editar producto' : 'Nuevo producto'} onClose={() => setModal(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save}>Guardar</button></>}
        >
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <input className="form-input" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Precio (€) *</label>
              <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input className="form-input" type="number" value={form.stock} onChange={e => setForm(p => ({...p, stock: e.target.value}))} />
            </div>
          </div>
          <div className="form-group mt-2">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
          </div>
        </Modal>
      )}
    </div>
  );
}
