import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductos, getCategorias } from '../api/client';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProductos(), getCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods.slice(0, 8));
        setCategorias(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Bienvenido a Mi Tienda</h1>
          <p>Los mejores productos al mejor precio</p>
          <Link to="/productos" className="btn btn-primary btn-lg">Ver productos</Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Categorías</h2>
          <div className="categorias-grid">
            {categorias.map(cat => (
              <Link key={cat.id} to={`/productos?categoria=${cat.id}`} className="categoria-card">
                <h3>{cat.nombre}</h3>
                {cat.descripcion && <p>{cat.descripcion}</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Productos Destacados</h2>
          <div className="productos-grid">
            {productos.map(p => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link to="/productos" className="btn btn-outline">Ver todos los productos</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
