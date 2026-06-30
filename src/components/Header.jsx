import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { prefetch } from '../utils/prefetch';

const preloadProductos = () => prefetch(() => import('../pages/Productos'));
const preloadCarrito = () => prefetch(() => import('../pages/Carrito'));
const preloadLogin = () => prefetch(() => import('../pages/Login'));
const preloadRegister = () => prefetch(() => import('../pages/Register'));

export default function Header() {
  const { usuario, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">Mi Tienda</Link>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
          <span /><span /><span />
        </button>
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/productos" onMouseEnter={preloadProductos} onClick={() => setMenuOpen(false)}>Productos</Link>
          <Link to="/carrito" className="cart-link" onMouseEnter={preloadCarrito} onClick={() => setMenuOpen(false)}>
            Carrito
            {usuario && <span className="cart-badge">0</span>}
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
