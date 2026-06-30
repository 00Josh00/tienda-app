import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductos, getCategorias } from '../api/client';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Productos() {
  const [searchParams] = useSearchParams();
  const categoriaId = searchParams.get('categoria');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProductos(categoriaId), getCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods);
        setCategorias(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoriaId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container section">
      <h1>Productos</h1>
      <div className="categorias-filter">
        <a href="/productos" className={`tag ${!categoriaId ? 'active' : ''}`}>Todos</a>
        {categorias.map(cat => (
          <a
            key={cat.id}
            href={`/productos?categoria=${cat.id}`}
            className={`tag ${categoriaId === String(cat.id) ? 'active' : ''}`}
          >
            {cat.nombre}
          </a>
        ))}
      </div>
      {productos.length === 0 ? (
        <p className="empty">No hay productos disponibles.</p>
      ) : (
        <div className="productos-grid">
          {productos.map(p => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
