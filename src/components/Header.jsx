import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">Mi Tienda</Link>
        <nav className="nav">
          <Link to="/">Inicio</Link>
          <Link to="/productos">Productos</Link>
          <Link to="/carrito" className="cart-link">
            Carrito
            <span className="cart-badge">0</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
