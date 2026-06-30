import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProducto, addToCarrito } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductoDetalle() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getProducto(id)
      .then(setProducto)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAdd() {
    if (!usuario) {
      const cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
      const idx = cart.findIndex(i => i.producto_id === parseInt(id));
      if (idx >= 0) {
        if (cart[idx].cantidad >= producto.stock) return;
        cart[idx].cantidad += 1;
      } else {
        cart.push({
          producto_id: parseInt(id),
          nombre: producto.nombre,
          precio: producto.precio,
          imagen_url: producto.imagen_url,
          stock: producto.stock,
          cantidad: 1,
        });
      }
      localStorage.setItem('guest_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-change'));
      alert('Producto agregado al carrito');
      return;
    }
    setAdding(true);
    try {
      await addToCarrito(parseInt(id), 1);
      alert('Producto agregado al carrito');
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="container section">
      <p className="empty">Producto no encontrado.</p>
      <Link to="/productos" className="btn btn-primary">Volver a productos</Link>
    </div>
  );
  if (!producto) return null;

  const { nombre, descripcion, precio, stock, imagen_url, categoria } = producto;
  const agotado = stock === 0;

  return (
    <div className="container section" style={{ paddingBottom: agotado ? '2rem' : '5rem' }}>
      <Link to="/productos" className="back-link">&larr; Volver</Link>
      <div className="producto-detalle">
        <div className="producto-detalle-image">
          <img
            src={imagen_url || 'https://placehold.co/500x500/e2e8f0/64748b?text=Producto'}
            alt={nombre}
          />
        </div>
        <div className="producto-detalle-body">
          {categoria && <span className="product-category">{categoria.nombre}</span>}
          <h1>{nombre}</h1>
          <p className="product-price">{formatPrice(precio)}</p>
          <p className={`product-stock ${stock > 0 ? 'in-stock' : ''}`}>
            {stock > 0 ? `Stock: ${stock} unidades` : 'Agotado'}
          </p>
          <p className="product-description">{descripcion || 'Sin descripción disponible.'}</p>
          <div className="desktop-cart-btn">
            <button
              className="btn btn-accent btn-lg btn-block"
              disabled={agotado || adding}
              onClick={handleAdd}
            >
              {adding ? 'Agregando...' : agotado ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky bottom add to cart on mobile */}
      {!agotado && (
        <div className="sticky-bottom">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{nombre}</span>
            <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{formatPrice(precio)}</span>
          </div>
          <button
            className="btn btn-accent btn-lg"
            disabled={adding}
            onClick={handleAdd}
          >
            {adding ? 'Agregando...' : 'Agregar al carrito'}
          </button>
        </div>
      )}
    </div>
  );
}
