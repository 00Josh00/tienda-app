import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">Mi Tienda</Link>
        <nav className="nav">
          <Link to="/productos">Productos</Link>
          <Link to="/carrito" className="cart-link">
            Carrito
            {usuario && <span className="cart-badge">0</span>}
          </Link>
          {usuario ? (
            <>
              <span className="nav-user">{usuario.nombre}</span>
              {usuario.rol === 'admin' && <Link to="/admin" className="btn btn-outline btn-sm">Admin</Link>}
              <button className="btn btn-outline btn-sm" onClick={logout}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
