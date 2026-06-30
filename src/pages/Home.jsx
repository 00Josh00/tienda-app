import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductos, getCategorias } from '../api/client';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const fashionCatNames = ['Blusas y Polos', 'Vestidos y Enterizos', 'Jeans y Pantalones', 'Chompas y Casacas', 'Faldas y Shorts', 'Accesorios'];
const otrosCatNames = ['Electrónica', 'Hogar', 'Deportes', 'Libros'];

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProductos(), getCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods);
        setCategorias(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const fashionCats = categorias.filter(c => fashionCatNames.includes(c.nombre));
  const otrosCats = categorias.filter(c => otrosCatNames.includes(c.nombre));
  const fashionIds = fashionCats.map(c => c.id);

  const fashionProducts = productos.filter(p => p.categoria && fashionIds.includes(p.categoria.id)).slice(0, 8);
  const otrosProductos = productos.filter(p => !p.categoria || !fashionIds.includes(p.categoria.id)).slice(0, 4);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Nueva temporada</h1>
          <p>Descubre las últimas tendencias en moda femenina. Estilo y calidad para cada ocasión.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {fashionCats.map(cat => (
              <Link key={cat.id} to={`/productos?categoria=${cat.id}`} className="btn btn-outline btn-sm">
                {cat.nombre}
              </Link>
            ))}
          </div>
          <div className="hero-badges">
            <span className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Delivery gratis desde S/250
            </span>
            <span className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Pago seguro
            </span>
            <span className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
              Envíos a todo Perú
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Categorías</h2>
          <p className="section-subtitle">Encuentra tu estilo</p>
          <div className="categorias-grid">
            {fashionCats.map(cat => (
              <Link key={cat.id} to={`/productos?categoria=${cat.id}`} className="categoria-card">
                <h3>{cat.nombre}</h3>
                <p>Ver colección</p>
              </Link>
            ))}
          </div>

          {otrosCats.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <div className="otros-header">
                <div>
                  <h2 className="section-title" style={{ margin: 0 }}>Otros productos</h2>
                  <p className="section-subtitle" style={{ margin: '0.25rem 0 0' }}>Electrónica, hogar, deportes y más</p>
                </div>
                <Link to="/productos" className="btn btn-outline btn-sm">Ver todo</Link>
              </div>
              <div className="categorias-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {otrosCats.map(cat => (
                  <Link key={cat.id} to={`/productos?categoria=${cat.id}`} className="categoria-card" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.95rem' }}>{cat.nombre}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <hr className="section-divider" />

      <section className="section">
        <div className="container">
          <div className="otros-header">
            <div>
              <h2 className="section-title" style={{ margin: 0 }}>Novedades</h2>
              <p className="section-subtitle" style={{ margin: '0.25rem 0 0' }}>Lo último en moda femenina</p>
            </div>
            <Link to="/productos" className="btn btn-outline btn-sm">Ver más</Link>
          </div>
          <div className="productos-grid">
            {fashionProducts.map(p => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>

          {otrosProductos.length > 0 && (
            <>
              <hr className="section-divider" style={{ margin: '2rem 0' }} />
              <div className="otros-header">
                <div>
                  <h2 className="section-title" style={{ margin: 0 }}>También te puede interesar</h2>
                  <p className="section-subtitle" style={{ margin: '0.25rem 0 0' }}>Otras categorías</p>
                </div>
              </div>
              <div className="productos-grid">
                {otrosProductos.map(p => (
                  <ProductCard key={p.id} producto={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
