import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductos, getCategorias } from '../api/client';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const womenCatNames = ['Blusas y Polos', 'Vestidos y Enterizos', 'Jeans y Pantalones', 'Chompas y Casacas', 'Faldas y Shorts', 'Accesorios'];
const menCatNames = ['Camisas y Polos', 'Casacas y Chompas', 'Pantalones', 'Shorts', 'Accesorios Hombre'];

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

  const womenCats = categorias.filter(c => womenCatNames.includes(c.nombre));
  const menCats = categorias.filter(c => menCatNames.includes(c.nombre));
  const womenIds = womenCats.map(c => c.id);
  const menIds = menCats.map(c => c.id);

  const womenProducts = productos.filter(p => p.categoria && womenIds.includes(p.categoria.id)).slice(0, 8);
  const menProducts = productos.filter(p => p.categoria && menIds.includes(p.categoria.id)).slice(0, 8);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Nueva temporada</h1>
          <p>Descubre las últimas tendencias en moda. Estilo y calidad para hombres y mujeres.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {womenCats.map(cat => (
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
          <h2 className="section-title">Mujeres</h2>
          <p className="section-subtitle">Descubre nuestra colección femenina</p>
          <div className="categorias-grid">
            {womenCats.map(cat => (
              <Link key={cat.id} to={`/productos?categoria=${cat.id}`} className="categoria-card">
                <h3>{cat.nombre}</h3>
                <p>Ver colección</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
            {womenProducts.map(p => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      <section className="section">
        <div className="container">
          <h2 className="section-title">Hombres</h2>
          <p className="section-subtitle">Explora nuestra colección masculina</p>
          <div className="categorias-grid">
            {menCats.map(cat => (
              <Link key={cat.id} to={`/productos?categoria=${cat.id}`} className="categoria-card">
                <h3>{cat.nombre}</h3>
                <p>Ver colección</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="otros-header">
            <div>
              <h2 className="section-title" style={{ margin: 0 }}>Nuevos Ingresos</h2>
              <p className="section-subtitle" style={{ margin: '0.25rem 0 0' }}>Moda masculina recién llegada</p>
            </div>
            <Link to="/productos" className="btn btn-outline btn-sm">Ver más</Link>
          </div>
          <div className="productos-grid">
            {menProducts.map(p => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
