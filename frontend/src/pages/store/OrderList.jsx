import { useEffect, useState } from 'react';
import { ordersApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const ORDER_STATUSES = ['pending','processing','shipped','delivered','cancelled'];
const STATUS_BADGE = { pending: 'badge-yellow', processing: 'badge-blue', shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red' };
const STATUS_LABEL = { pending: 'Pendiente', processing: 'Procesando', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };

export default function OrderList() {
  const { user }       = useAuth();
  const [orders, setO] = useState([]);
  const [loading, setL]= useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setL(true);
    try { const r = await ordersApi.getAll(); setO(r.data.orders); } catch {}
    setL(false);
  };
  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    setUpdatingId(id);
    try { await ordersApi.updateStatus(id, { status }); load(); } catch {}
    setUpdatingId(null);
  };

  const canManage = ['admin', 'ventas'].includes(user?.role);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>📦 {canManage ? 'Gestión de Órdenes' : 'Mis Pedidos'}</h1><p className="text-muted">{orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}</p></div>
      </div>

      {loading ? <div className="loading-page"><div className="spinner" /></div> : orders.length === 0 ? (
        <div className="empty-state card"><div className="empty-icon">📦</div><h3>No tienes pedidos aún</h3><p>Visita la tienda para hacer tu primer pedido.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(o => (
            <div key={o.id} className="card">
              <div className="flex-between" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.875rem' }}>#{o.id.slice(0,8).toUpperCase()}</div>
                    <div className="text-muted" style={{ fontSize: '.75rem' }}>{new Date(o.created_at).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</div>
                  </div>
                  {canManage && o.user && <div className="text-muted" style={{ fontSize: '.8rem' }}>{o.user.full_name}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {o.discount_percent > 0 && <span className="badge badge-green">🏷️ −{o.discount_percent}%</span>}
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.05rem' }}>€{Number(o.total).toFixed(2)}</span>
                  <span className={`badge ${STATUS_BADGE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{expanded === o.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === o.id && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', marginBottom: '1rem' }}>
                    {o.order_items?.map(item => (
                      <div key={item.id || item.product_id} className="flex-between" style={{ fontSize: '.875rem' }}>
                        <span>{item.product?.name || 'Producto'} × {item.quantity}</span>
                        <span>€{Number(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {o.discount_amount > 0 && (
                      <div className="flex-between" style={{ fontSize: '.875rem', color: 'var(--color-primary)' }}>
                        <span>🏷️ Descuento adoptante</span><span>−€{Number(o.discount_amount).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  {canManage && o.status !== 'cancelled' && o.status !== 'delivered' && (
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                      <span className="text-muted" style={{ alignSelf: 'center', fontSize: '.8rem' }}>Cambiar estado:</span>
                      {ORDER_STATUSES.filter(s => s !== o.status).map(s => (
                        <button key={s} className="btn btn-ghost btn-sm" disabled={updatingId === o.id} onClick={() => changeStatus(o.id, s)}>
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
