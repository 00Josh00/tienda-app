import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { prefetch } from '../utils/prefetch';
import { getCarrito } from '../api/client';

const preloadProductos = () => prefetch(() => import('../pages/Productos'));
const preloadCarrito = () => prefetch(() => import('../pages/Carrito'));
const preloadLogin = () => prefetch(() => import('../pages/Login'));
const preloadRegister = () => prefetch(() => import('../pages/Register'));

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
  const cartCount = useCartCount();

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">J</span>
          Josh Store
        </Link>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
          <span /><span /><span />
        </button>
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/productos" onMouseEnter={preloadProductos} onClick={() => setMenuOpen(false)}>Productos</Link>
          <Link to="/carrito" className="cart-link" onMouseEnter={preloadCarrito} onClick={() => setMenuOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </Link>
          {usuario ? (
            <>
              <span className="nav-user">{usuario.nombre}</span>
              {usuario.rol === 'admin' && <Link to="/admin" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); setMenuOpen(false); }}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" onMouseEnter={preloadLogin} onClick={() => setMenuOpen(false)}>Entrar</Link>
              <Link to="/registro" className="btn btn-primary btn-sm" onMouseEnter={preloadRegister} onClick={() => setMenuOpen(false)}>Registrarse</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
