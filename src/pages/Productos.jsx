import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProductos, getCategorias } from '../api/client';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const activeCatNames = [
  'Blusas y Polos', 'Vestidos y Enterizos', 'Jeans y Pantalones', 'Chompas y Casacas', 'Faldas y Shorts', 'Accesorios',
  'Camisas y Polos', 'Casacas y Chompas', 'Pantalones', 'Shorts', 'Accesorios Hombre'
];

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

  const activeCats = categorias.filter(c => activeCatNames.includes(c.nombre));
  const selectedCat = categoriaId ? categorias.find(c => c.id === Number(categoriaId)) : null;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container section">
      <h1>{selectedCat ? selectedCat.nombre : 'Todos los productos'}</h1>
      <div className="categorias-filter">
        <Link to="/productos" className={`tag ${!categoriaId ? 'active' : ''}`}>Todos</Link>
        {activeCats.map(cat => (
          <Link
            key={cat.id}
            to={`/productos?categoria=${cat.id}`}
            className={`tag ${categoriaId === String(cat.id) ? 'active' : ''}`}
          >
            {cat.nombre}
          </Link>
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
