import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProductos, getCategorias } from '../api/client';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaId = searchParams.get('categoria');
  const genero = searchParams.get('genero');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getProductos(categoriaId, genero), getCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods);
        setCategorias(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoriaId, genero]);

  function toggleGenero(val) {
    const params = new URLSearchParams(searchParams);
    if (genero === val) {
      params.delete('genero');
    } else {
      params.set('genero', val);
    }
    setSearchParams(params);
  }

  const selectedCat = categoriaId ? categorias.find(c => c.id === Number(categoriaId)) : null;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container section">
      <h1>{selectedCat ? selectedCat.nombre : 'Todos los productos'}</h1>

      <div className="gender-tabs">
        <button
          className={`gender-tab ${!genero ? 'active' : ''}`}
          onClick={() => { const p = new URLSearchParams(); setSearchParams(p); }}
        >
          Todos
        </button>
        <button
          className={`gender-tab ${genero === 'mujer' ? 'active' : ''}`}
          onClick={() => toggleGenero('mujer')}
        >
          Mujeres
        </button>
        <button
          className={`gender-tab ${genero === 'hombre' ? 'active' : ''}`}
          onClick={() => toggleGenero('hombre')}
        >
          Hombres
        </button>
      </div>

      <div className="categorias-filter">
        <Link
          to={genero ? `/productos?genero=${genero}` : '/productos'}
          className={`tag ${!categoriaId ? 'active' : ''}`}
        >
          Todo
        </Link>
        {categorias.map(cat => (
          <Link
            key={cat.id}
            to={genero ? `/productos?genero=${genero}&categoria=${cat.id}` : `/productos?categoria=${cat.id}`}
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
