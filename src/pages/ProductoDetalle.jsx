import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProducto, addToCarrito } from '../api/client';
import { useAuth } from '../context/AuthContext';
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
    if (!usuario) { navigate('/login'); return; }
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

  return (
    <div className="container section">
      <Link to="/productos" className="back-link">&larr; Volver a productos</Link>
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
          <p className="product-price">${Number(precio).toFixed(2)}</p>
          <p className="product-stock">
            {stock > 0 ? `Stock: ${stock} unidades` : 'Sin stock'}
          </p>
          <p className="product-description">{descripcion || 'Sin descripción disponible.'}</p>
          <button
            className="btn btn-primary btn-lg"
            disabled={stock === 0 || adding}
            onClick={handleAdd}
          >
            {adding ? 'Agregando...' : stock > 0 ? 'Agregar al carrito' : 'Agotado'}
          </button>
        </div>
      </div>
    </div>
  );
}
