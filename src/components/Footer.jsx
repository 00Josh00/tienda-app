import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Josh Store</h3>
            <p>Tu tienda online de confianza. Los mejores productos con envíos a todo el Perú.</p>
          </div>
          <div className="footer-col">
            <h4>Tienda</h4>
            <Link to="/productos">Todos los productos</Link>
            <Link to="/productos">Ofertas</Link>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <a href="#">ventas@joshstore.pe</a>
            <span style={{ fontSize: '0.85rem', display: 'block', padding: '0.25rem 0', color: 'var(--text-muted)' }}>Lima, Perú</span>
            <span style={{ fontSize: '0.85rem', display: 'block', padding: '0.25rem 0', color: 'var(--text-muted)' }}>Yape: 999-999-999</span>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Josh Store. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
