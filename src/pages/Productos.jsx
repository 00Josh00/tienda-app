import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProductos, getCategorias } from '../api/client';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const womenCatNames = ['Blusas y Polos', 'Vestidos y Enterizos', 'Jeans y Pantalones', 'Chompas y Casacas', 'Faldas y Shorts', 'Accesorios'];
const menCatNames = ['Camisas y Polos', 'Casacas y Chompas', 'Pantalones', 'Shorts', 'Accesorios Hombre'];
const allCatNames = [...new Set([...womenCatNames, ...menCatNames])];

export default function Productos() {
  const [searchParams] = useSearchParams();
  const categoriaId = searchParams.get('categoria');
  const genero = searchParams.get('genero');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProductos(categoriaId, genero), getCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods);
        setCategorias(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoriaId, genero]);

  let activeCats;
  if (genero === 'mujer') {
    activeCats = categorias.filter(c => womenCatNames.includes(c.nombre));
  } else if (genero === 'hombre') {
    activeCats = categorias.filter(c => menCatNames.includes(c.nombre));
  } else {
    activeCats = categorias.filter(c => allCatNames.includes(c.nombre));
  }

  let title = 'Todos los productos';
  if (genero === 'mujer') title = 'Mujeres';
  else if (genero === 'hombre') title = 'Hombres';

  const selectedCat = categoriaId ? categorias.find(c => c.id === Number(categoriaId)) : null;
  const selectedGenero = genero || 'todos';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container section">
      <h1>{selectedCat ? selectedCat.nombre : title}</h1>

      <div className="gender-tabs">
        <Link to="/productos" className={`gender-tab ${selectedGenero === 'todos' ? 'active' : ''}`}>Todos</Link>
        <Link to="/productos?genero=mujer" className={`gender-tab ${selectedGenero === 'mujer' ? 'active' : ''}`}>Mujeres</Link>
        <Link to="/productos?genero=hombre" className={`gender-tab ${selectedGenero === 'hombre' ? 'active' : ''}`}>Hombres</Link>
      </div>

      <div className="categorias-filter">
        {genero && (
          <Link to={`/productos?genero=${genero}`} className={`tag ${!categoriaId ? 'active' : ''}`}>Todo</Link>
        )}
        {!genero && (
          <Link to="/productos" className={`tag ${!categoriaId ? 'active' : ''}`}>Todo</Link>
        )}
        {activeCats.map(cat => (
          <Link
            key={cat.id}
            to={`/productos?${genero ? `genero=${genero}&` : ''}categoria=${cat.id}`}
            className={`tag ${categoriaId === String(cat.id) ? 'active' : ''}`}
          >
            {cat.nombre}
          </Link>
        ))}
      </div>

      {productos.length === 0 ? (
        <p className="empty">No hay productos disponibles.</p>
      ) : (
        <div className="productos-grid">
          {productos.map(p => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
