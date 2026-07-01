import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

export default function ProductCard({ producto }) {
  const { id, nombre, precio, imagen_url, categoria, genero } = producto;

  return (
    <div className="product-card">
      <div className="product-card-image">
        <img
          src={imagen_url || 'https://placehold.co/300x300/e2e8f0/64748b?text=Producto'}
          alt={nombre}
          loading="lazy"
        />
        {genero && <span className={`product-gender product-gender--${genero}`}>{genero === 'mujer' ? 'Mujer' : 'Hombre'}</span>}
      </div>
      <div className="product-card-body">
        {categoria && <span className="product-category">{categoria.nombre}</span>}
        <h3>{nombre}</h3>
        <p className="product-price">{formatPrice(precio)}</p>
        <Link to={`/productos/${id}`} className="btn btn-primary btn-sm">Ver detalle</Link>
      </div>
    </div>
  );
}
