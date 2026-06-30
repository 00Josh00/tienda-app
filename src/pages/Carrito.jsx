import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCarrito, updateCarrito, removeFromCarrito } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Carrito() {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);

  function cargarCarrito() {
    if (!usuario) { setLoading(false); return; }
    setLoading(true);
    getCarrito()
      .then(setCarrito)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargarCarrito(); }, [usuario]);

  async function handleCantidad(productoId, delta) {
    const item = carrito.items.find(i => i.producto_id === productoId);
    const nueva = Math.max(1, item.cantidad + delta);
    if (nueva > item.stock) return;
    try {
      const actualizado = await updateCarrito(productoId, nueva);
      setCarrito(actualizado);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleEliminar(productoId) {
    try {
      const actualizado = await removeFromCarrito(productoId);
      setCarrito(actualizado);
    } catch (err) {
      alert(err.message);
    }
  }

  if (!usuario) {
    return (
      <div className="container section">
        <h1>Carrito de Compras</h1>
        <div className="empty">
          <p>Inicia sesión para ver tu carrito.</p>
          <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  const items = carrito?.items || [];
  const total = carrito?.total || 0;

  return (
    <div className="container section">
      <h1>Carrito de Compras</h1>
      {items.length === 0 ? (
        <div className="empty">
          <p>Tu carrito está vacío.</p>
          <Link to="/productos" className="btn btn-primary">Ir a comprar</Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.imagen_url} alt={item.nombre} className="cart-item-image" />
                <div className="cart-item-info">
                  <h3>{item.nombre}</h3>
                  <p className="cart-item-price">${Number(item.precio_unitario).toFixed(2)}</p>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => handleCantidad(item.producto_id, -1)} disabled={item.cantidad <= 1}>-</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => handleCantidad(item.producto_id, 1)} disabled={item.cantidad >= item.stock}>+</button>
                </div>
                <p className="cart-item-subtotal">${(item.cantidad * Number(item.precio_unitario)).toFixed(2)}</p>
                <button className="btn btn-outline btn-sm" onClick={() => handleEliminar(item.producto_id)}>Eliminar</button>
              </div>
            ))}
          </div>
          <div className="cart-total">
            <h2>Total: ${total.toFixed(2)}</h2>
            <button className="btn btn-primary btn-lg">Proceder al pago</button>
          </div>
        </>
      )}
    </div>
  );
}
