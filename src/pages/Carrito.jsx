import { Link } from 'react-router-dom';

export default function Carrito() {
  const items = [];

  return (
    <div className="container section">
      <h1>Carrito de Compras</h1>
      {items.length === 0 ? (
        <div className="empty">
          <p>Tu carrito está vacío.</p>
          <Link to="/productos" className="btn btn-primary">Ir a comprar</Link>
        </div>
      ) : (
        <p>Implementación próxima</p>
      )}
    </div>
  );
}
