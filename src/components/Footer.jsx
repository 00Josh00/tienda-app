import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>
              <span style={{ color: '#3b82f6' }}>Josh</span> Store
            </h3>
            <p>Tu tienda online de confianza. Los mejores productos con envíos a todo el Perú.</p>
          </div>
          <div className="footer-col">
            <h4>Tienda</h4>
            <Link to="/productos">Productos</Link>
            <Link to="/productos">Ofertas</Link>
          </div>
          <div className="footer-col">
            <h4>Cuenta</h4>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro">Registrarse</Link>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <a href="#">ventas@joshstore.pe</a>
            <a href="#">Lima, Perú</a>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Josh Store. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
