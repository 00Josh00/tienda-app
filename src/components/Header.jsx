import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { prefetch } from '../utils/prefetch';
import { getCarrito, getCategorias } from '../api/client';

const fashionCats = ['Blusas y Polos', 'Vestidos y Enterizos', 'Jeans y Pantalones', 'Chompas y Casacas', 'Faldas y Shorts', 'Accesorios'];
const otrosCats = ['Electrónica', 'Hogar', 'Deportes', 'Libros', 'Ropa'];

function useCartCount() {
  const { usuario } = useAuth();
  const [count, setCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (usuario) {
      getCarrito()
        .then(c => setCount(c.items?.length || 0))
        .catch(() => setCount(0));
    } else {
      try {
        const cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
        setCount(cart.reduce((s, i) => s + i.cantidad, 0));
      } catch { setCount(0); }
    }
  }, [usuario, location.pathname]);

  useEffect(() => {
    function handleCartChange() {
      if (!usuario) {
        try {
          const cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
          setCount(cart.reduce((s, i) => s + i.cantidad, 0));
        } catch { setCount(0); }
      }
    }
    window.addEventListener('cart-change', handleCartChange);
    return () => window.removeEventListener('cart-change', handleCartChange);
  }, [usuario]);

  return count;
}

export default function Header() {
  const { usuario, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const cartCount = useCartCount();
  const location = useLocation();

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
  }, []);

  const fashion = categorias.filter(c => fashionCats.includes(c.nombre));
  const otros = categorias.filter(c => otrosCats.includes(c.nombre));

  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-icon">J</span>
            Josh Store
          </Link>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
            <span /><span /><span />
          </button>
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Inicio</Link>
            {fashion.map(cat => (
              <Link
                key={cat.id}
                to={`/productos?categoria=${cat.id}`}
                className={`nav-link ${location.search === `?categoria=${cat.id}` ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {cat.nombre}
              </Link>
            ))}
            {otros.length > 0 && (
              <div className="nav-dropdown">
                <Link to="/productos" className={`nav-link ${location.pathname === '/productos' && !location.search ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                  Otros
                </Link>
                <div className="nav-dropdown-content">
                  {otros.map(cat => (
                    <Link key={cat.id} to={`/productos?categoria=${cat.id}`} onClick={() => setMenuOpen(false)}>
                      {cat.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="nav-right">
              <Link to="/carrito" className="nav-icon" onClick={() => setMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
              </Link>
              {!usuario && (
                <Link to="/login" className="nav-icon" onClick={() => setMenuOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </Link>
              )}
              {usuario && (
                <div className="nav-dropdown">
                  <span className="nav-user" style={{ cursor: 'pointer' }}>{usuario.nombre}</span>
                  <div className="nav-dropdown-content" style={{ right: 0, left: 'auto' }}>
                    {usuario.rol === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Panel Admin</Link>}
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, borderRadius: 'var(--radius)', fontFamily: 'inherit', width: '100%', textAlign: 'left' }}
                      onMouseEnter={e => e.target.style.background = 'var(--border-light)'}
                      onMouseLeave={e => e.target.style.background = 'none'}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
