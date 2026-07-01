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
        setProductos(prods);
        setCategorias(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const womenProducts = productos.filter(p => p.ind_m === 'S').slice(0, 8);
  const menProducts = productos.filter(p => p.ind_h === 'S').slice(0, 8);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1>Nueva temporada</h1>
          <p>Descubre las últimas tendencias en moda. Estilo y calidad para hombres y mujeres.</p>
          <div className="hero-links">
            <Link to="/productos?genero=mujer" className="btn btn-primary">Mujeres</Link>
            <Link to="/productos?genero=hombre" className="btn btn-outline">Hombres</Link>
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
          <div className="gender-header">
            <h2 className="section-title">Mujeres</h2>
            <Link to="/productos?genero=mujer" className="btn btn-outline btn-sm">Ver todo</Link>
          </div>
          <p className="section-subtitle">Descubre nuestra colección femenina</p>
          <div className="categorias-grid">
            {categorias.map(cat => (
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
          <div className="gender-header">
            <h2 className="section-title">Novedades Mujer</h2>
            <Link to="/productos?genero=mujer" className="btn btn-outline btn-sm">Ver más</Link>
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
          <div className="gender-header">
            <h2 className="section-title">Hombres</h2>
            <Link to="/productos?genero=hombre" className="btn btn-outline btn-sm">Ver todo</Link>
          </div>
          <p className="section-subtitle">Explora nuestra colección masculina</p>
          <div className="categorias-grid">
            {categorias.map(cat => (
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
          <div className="gender-header">
            <h2 className="section-title">Novedades Hombre</h2>
            <Link to="/productos?genero=hombre" className="btn btn-outline btn-sm">Ver más</Link>
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
