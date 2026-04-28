import { useEffect, useState } from 'react';
import { productsApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';

export default function InventoryManager() {
  const [products, setP] = useState([]);
  const [loading, setL]  = useState(true);
  const [modal, setModal]= useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]  = useState({ name: '', description: '', price: '', stock: '', category: '', image_url: '', is_active: true });
  const [msg, setMsg]    = useState('');
  const [search, setS]   = useState('');

  const load = async () => {
    setL(true);
    // Hack: fetch all including inactive via admin — the backend returns all for sales/admin
    try { const r = await productsApi.getAll(); setP(r.data.products); } catch {}
    setL(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm({ name:'',description:'',price:'',stock:'',category:'',image_url:'',is_active:true }); setMsg(''); setModal(true); };
  const openEdit   = (p) => { setEditItem(p); setForm({ name:p.name, description:p.description||'', price:p.price, stock:p.stock, category:p.category||'', image_url:p.image_url||'', is_active:p.is_active }); setMsg(''); setModal(true); };

  const save = async () => {
    setMsg('');
    const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editItem) await productsApi.update(editItem.id, data);
      else           await productsApi.create(data);
      setMsg('✅ Guardado.'); load();
      setTimeout(() => { setModal(false); setMsg(''); }, 1200);
    } catch (e) { setMsg(e.response?.data?.error || 'Error.'); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>📦 Inventario</h1><p className="text-muted">{products.length} productos</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo producto</button>
      </div>
      <div className="filters-bar">
        <input className="form-input" placeholder="🔍 Buscar..." value={search} onChange={e => setS(e.target.value)} style={{ maxWidth: 280 }} />
      </div>
      {loading ? <div className="loading-page"><div className="spinner" /></div> : (
        <div className="card table-wrapper">
          <table className="table">
            <thead><tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="text-muted">{p.category || '—'}</td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>€{Number(p.price).toFixed(2)}</td>
                  <td>
                    <span style={{ color: p.stock <= 5 ? 'var(--color-danger)' : 'inherit', fontWeight: p.stock <= 5 ? 700 : 400 }}>
                      {p.stock} {p.stock <= 5 && p.stock > 0 ? '⚠️' : p.stock === 0 ? '🔴' : ''}
                    </span>
                  </td>
                  <td>{p.is_active ? <span className="badge badge-green">Activo</span> : <span className="badge badge-gray">Inactivo</span>}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          {editItem && (
            <div className="form-group mt-2" style={{ flexDirection: 'row', alignItems: 'center', gap: '.75rem' }}>
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(p => ({...p, is_active: e.target.checked}))} />
              <label htmlFor="is_active" className="form-label" style={{ cursor: 'pointer', margin: 0 }}>Producto activo</label>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
