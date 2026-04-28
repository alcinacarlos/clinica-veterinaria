import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api/endpoints';

const DISCOUNT = Number(import.meta.env.VITE_ADOPTER_DISCOUNT ?? 15);

export default function Cart({ open, onClose }) {
  const { user }                           = useAuth();
  const { items, removeItem, changeQty, clear, total, count } = useCart();
  const [loading, setL]  = useState(false);
  const [msg, setMsg]    = useState('');
  const [err, setErr]    = useState('');

  const discountAmount = user?.is_adopter ? (total * DISCOUNT) / 100 : 0;
  const finalTotal     = total - discountAmount;

  const checkout = async () => {
    if (items.length === 0) return;
    setErr(''); setMsg(''); setL(true);
    try {
      await ordersApi.create({
        items: items.map(i => ({ product_id: i.id, quantity: i.qty })),
      });
      setMsg('✅ ¡Orden creada! Redirigiendo...');
      clear();
      setTimeout(() => { setMsg(''); onClose(); }, 2000);
    } catch (e) { setErr(e.response?.data?.error || 'Error al crear la orden.'); }
    setL(false);
  };

  return (
    <>
      {open && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 199 }} onClick={onClose} />}
      <div className={`cart-panel ${open ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>🛒 Tu carrito {count > 0 && <span className="badge badge-green">{count}</span>}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <div className="empty-icon">🛍️</div>
              <p>Tu carrito está vacío</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">€{Number(item.price).toFixed(2)} c/u</div>
              </div>
              <div className="cart-qty">
                <button onClick={() => changeQty(item.id, -1)}>−</button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                <button onClick={() => changeQty(item.id, +1)}>+</button>
              </div>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>🗑</button>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-error">{err}</div>}
          <div className="cart-summary">
            <div className="cart-summary-row"><span>Subtotal</span><span>€{total.toFixed(2)}</span></div>
            {user?.is_adopter && discountAmount > 0 && (
              <div className="cart-summary-row discount">
                <span>🏷️ Descuento adoptante ({DISCOUNT}%)</span>
                <span>−€{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="cart-summary-row total"><span>Total</span><span>€{finalTotal.toFixed(2)}</span></div>
          </div>
          <button className="btn btn-primary btn-full" onClick={checkout} disabled={loading || items.length === 0}>
            {loading ? '⏳ Procesando...' : '✓ Confirmar pedido'}
          </button>
        </div>
      </div>
    </>
  );
}
