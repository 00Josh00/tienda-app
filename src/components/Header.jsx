import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { prefetch } from '../utils/prefetch';
import { getCarrito, getCategorias } from '../api/client';

const womenCatNames = ['Blusas y Polos', 'Vestidos y Enterizos', 'Jeans y Pantalones', 'Chompas y Casacas', 'Faldas y Shorts', 'Accesorios'];
const menCatNames = ['Camisas y Polos', 'Casacas y Chompas', 'Pantalones', 'Shorts', 'Accesorios Hombre'];

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const cartCount = useCartCount();
  const location = useLocation();
  const overlayRef = useRef(null);

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function closeMenu() { setMenuOpen(false); }

  const womenCats = categorias.filter(c => womenCatNames.includes(c.nombre));
  const menCats = categorias.filter(c => menCatNames.includes(c.nombre));

  function isActive(catId) {
    return location.search === `?categoria=${catId}`;
  }

  const preloadProductos = () => prefetch(() => import('../pages/Productos'));
  const preloadCarrito = () => prefetch(() => import('../pages/Carrito'));
  const preloadLogin = () => prefetch(() => import('../pages/Login'));

  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Menú">
            <span /><span /><span />
          </button>
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-icon">J</span>
            Josh Store
          </Link>
          <nav className="nav-desktop">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
            {womenCats.length > 0 && (
              <div className="nav-dropdown">
                <span className="nav-link nav-dropdown-trigger">Mujeres</span>
                <div className="nav-dropdown-content">
                  {womenCats.map(cat => (
                    <Link key={cat.id} to={`/productos?categoria=${cat.id}`}>
                      {cat.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {menCats.length > 0 && (
              <div className="nav-dropdown">
                <span className="nav-link nav-dropdown-trigger">Hombres</span>
                <div className="nav-dropdown-content">
                  {menCats.map(cat => (
                    <Link key={cat.id} to={`/productos?categoria=${cat.id}`}>
                      {cat.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>
          <div className="nav-right">
            <Link to="/carrito" className="nav-icon" onMouseEnter={preloadCarrito}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>
            {!usuario && (
              <Link to="/login" className="nav-icon" onMouseEnter={preloadLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            )}
            {usuario && (
              <div className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}>
                <span className="nav-user" onClick={() => setDropdownOpen(!dropdownOpen)}>{usuario.nombre}</span>
                <div className="nav-dropdown-content" style={{ right: 0, left: 'auto' }}>
                  {usuario.rol === 'admin' && <Link to="/admin">Panel Admin</Link>}
                  <button onClick={() => { logout(); }}>Cerrar sesión</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`} ref={overlayRef} onClick={closeMenu} />
      <div className={`nav-mobile ${menuOpen ? 'open' : ''}`}>
        <div className="nav-mobile-header">
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-icon">J</span>
            Josh Store
          </Link>
          <button className="nav-mobile-close" onClick={closeMenu} aria-label="Cerrar">&times;</button>
        </div>

        <div className="nav-mobile-section">Mujeres</div>
        {womenCats.map(cat => (
          <Link
            key={cat.id}
            to={`/productos?categoria=${cat.id}`}
            className={`${isActive(cat.id) ? 'active' : ''}`}
            onClick={closeMenu}
          >
            {cat.nombre}
          </Link>
        ))}

        <div className="nav-mobile-section">Hombres</div>
        {menCats.map(cat => (
          <Link
            key={cat.id}
            to={`/productos?categoria=${cat.id}`}
            className={`${isActive(cat.id) ? 'active' : ''}`}
            onClick={closeMenu}
          >
            {cat.nombre}
          </Link>
        ))}

        <div className="nav-mobile-section">Productos</div>
        <Link to="/productos" onClick={closeMenu}>Todos los productos</Link>

        <div className="nav-mobile-section">Cuenta</div>
        {usuario ? (
          <>
            <span style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {usuario.email}
            </span>
            {usuario.rol === 'admin' && (
              <Link to="/admin" onClick={closeMenu}>Panel Admin</Link>
            )}
            <button className="nav-mobile-link" onClick={() => { logout(); closeMenu(); }}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu} onMouseEnter={preloadLogin}>Iniciar sesión</Link>
            <Link to="/registro" onClick={closeMenu}>Registrarse</Link>
          </>
        )}

        <div className="nav-mobile-footer">
          <Link to="/carrito" className="nav-mobile-link" onClick={closeMenu}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Carrito {cartCount > 0 && `(${cartCount})`}
          </Link>
        </div>
      </div>
    </header>
  );
}
