import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCarrito, updateCarrito, removeFromCarrito, addToCarrito, checkoutCart, createGuestOrder } from '../api/client';
import { formatPrice } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getGuestCart() {
  try { return JSON.parse(localStorage.getItem('guest_cart') || '[]'); } catch { return []; }
}

function setGuestCart(items) {
  localStorage.setItem('guest_cart', JSON.stringify(items));
}

export default function Carrito() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestCart, setGuestCartState] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', dni: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const guestItems = guestCart.filter(i => i.cantidad > 0);
  const guestTotal = guestItems.reduce((s, i) => s + Number(i.precio) * i.cantidad, 0);

  function cargarCarrito() {
    if (!usuario) { setLoading(false); return; }
    setLoading(true);
    getCarrito()
      .then(setCarrito)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (usuario) {
      cargarCarrito();
    } else {
      setGuestCartState(getGuestCart());
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario) setGuestCartState(getGuestCart());
  }, [usuario]);

  async function handleCantidad(productoId, delta) {
    if (usuario) {
      const item = carrito.items.find(i => i.producto_id === productoId);
      const nueva = Math.max(1, item.cantidad + delta);
      if (nueva > item.stock) return;
      try {
        const actualizado = await updateCarrito(productoId, nueva);
        setCarrito(actualizado);
      } catch (err) {
        alert(err.message);
      }
    } else {
      const items = getGuestCart();
      const idx = items.findIndex(i => i.producto_id === productoId);
      if (idx === -1) return;
      const nueva = Math.max(1, items[idx].cantidad + delta);
      if (nueva > items[idx].stock) return;
      items[idx].cantidad = nueva;
      setGuestCart(items);
      setGuestCartState([...items]);
      window.dispatchEvent(new Event('cart-change'));
    }
  }

  async function handleEliminar(productoId) {
    if (usuario) {
      try {
        const actualizado = await removeFromCarrito(productoId);
        setCarrito(actualizado);
      } catch (err) {
        alert(err.message);
      }
    } else {
      const items = getGuestCart().filter(i => i.producto_id !== productoId);
      setGuestCart(items);
      setGuestCartState(items);
      window.dispatchEvent(new Event('cart-change'));
    }
  }

  async function handleAddFromGuest(productoId) {
    if (!usuario) { navigate('/login'); return; }
    const item = guestItems.find(i => i.producto_id === productoId);
    if (!item) return;
    try {
      await addToCarrito(productoId, item.cantidad);
      const items = getGuestCart().filter(i => i.producto_id !== productoId);
      setGuestCart(items);
      setGuestCartState(items);
      window.dispatchEvent(new Event('cart-change'));
      cargarCarrito();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleGuestOrder(e) {
    e.preventDefault();
    setError('');

    if (!/^\d{8}$/.test(form.dni)) {
      setError('El DNI debe tener 8 dígitos');
      return;
    }

    setSubmitting(true);
    const idempotencyKey = uuid();
    try {
      const items = guestItems.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad }));
      const result = await createGuestOrder(items, form.nombre, form.email, form.dni, idempotencyKey);

      localStorage.removeItem('guest_cart');
      window.dispatchEvent(new Event('cart-change'));
      navigate(`/pedido-exitoso/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckout() {
    setSubmitting(true);
    try {
      const result = await checkoutCart();
      navigate(`/pedido-exitoso/${result.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function renderGuestCart() {
    if (guestItems.length === 0) {
      return (
        <div className="empty">
          <p>Tu carrito está vacío.</p>
          <Link to="/productos" className="btn btn-primary">Ir a comprar</Link>
        </div>
      );
    }

    return (
      <>
        <div className="cart-items">
          {guestItems.map(item => (
            <div key={item.producto_id} className="cart-item">
              <img src={item.imagen_url} alt={item.nombre} className="cart-item-image" />
              <div className="cart-item-info">
                <h3>{item.nombre}</h3>
                <p className="cart-item-price">{formatPrice(item.precio)}</p>
              </div>
              <div className="cart-item-qty">
                <button onClick={() => handleCantidad(item.producto_id, -1)} disabled={item.cantidad <= 1}>-</button>
                <span>{item.cantidad}</span>
                <button onClick={() => handleCantidad(item.producto_id, 1)} disabled={item.cantidad >= item.stock}>+</button>
              </div>
              <p className="cart-item-subtotal">{formatPrice(item.cantidad * Number(item.precio))}</p>
              <button className="btn btn-outline btn-sm" onClick={() => handleEliminar(item.producto_id)}>Eliminar</button>
            </div>
          ))}
        </div>

        <div className="cart-total">
          <h2>Total: {formatPrice(guestTotal)}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {usuario && (
              <button className="btn btn-outline btn-sm" onClick={() => handleAddFromGuest(guestItems[0]?.producto_id)}>
                Mover a mi cuenta
              </button>
            )}
            <button className="btn btn-accent btn-lg" onClick={() => setShowCheckout(true)}>
              Hacer pedido
            </button>
          </div>
        </div>

        {showCheckout && (
          <div className="section" style={{ maxWidth: 500, margin: '2rem auto' }}>
            <h2>Datos para la boleta</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleGuestOrder}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>DNI (8 dígitos)</label>
                <input value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value.replace(/\D/g, '').slice(0, 8) })} placeholder="12345678" required />
              </div>
              <button className="btn btn-accent btn-lg btn-block" disabled={submitting}>
                {submitting ? 'Procesando...' :                `Hacer pedido - ${formatPrice(guestTotal)}`}
              </button>
            </form>
          </div>
        )}
      </>
    );
  }

  function renderAuthCart() {
    if (!usuario) return null;
    if (loading) return <LoadingSpinner />;

    const items = carrito?.items || [];
    const total = carrito?.total || 0;

    if (items.length === 0) {
      return (
        <div className="empty">
          <p>Tu carrito está vacío.</p>
          <Link to="/productos" className="btn btn-primary">Ir a comprar</Link>
        </div>
      );
    }

    return (
      <>
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.imagen_url} alt={item.nombre} className="cart-item-image" />
              <div className="cart-item-info">
                <h3>{item.nombre}</h3>
                <p className="cart-item-price">{formatPrice(item.precio_unitario)}</p>
              </div>
              <div className="cart-item-qty">
                <button onClick={() => handleCantidad(item.producto_id, -1)} disabled={item.cantidad <= 1}>-</button>
                <span>{item.cantidad}</span>
                <button onClick={() => handleCantidad(item.producto_id, 1)} disabled={item.cantidad >= item.stock}>+</button>
              </div>
              <p className="cart-item-subtotal">{formatPrice(item.cantidad * Number(item.precio_unitario))}</p>
              <button className="btn btn-outline btn-sm" onClick={() => handleEliminar(item.producto_id)}>Eliminar</button>
            </div>
          ))}
        </div>
        <div className="cart-total">
          <h2>Total: {formatPrice(total)}</h2>
          <button className="btn btn-accent btn-lg" disabled={submitting} onClick={handleCheckout}>
            {submitting ? 'Procesando...' : 'Hacer pedido'}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="container section">
      <h1>Carrito de Compras</h1>
      {usuario ? renderAuthCart() : renderGuestCart()}
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        {usuario ? (
          <>
            <Link to="/productos" className="btn btn-outline">Seguir comprando</Link>
          </>
        ) : (
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Inicia sesión</Link> para guardar tu carrito.
          </p>
        )}
      </div>
    </div>
  );
}
