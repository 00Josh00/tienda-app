import { useState, useEffect } from 'react';
import { getAdminProductos, deleteAdminProducto, getAdminCategorias } from '../../api/client';
import { formatPrice } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductoForm from './ProductoForm';

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  function cargar() {
    setLoading(true);
    Promise.all([getAdminProductos(), getAdminCategorias()])
      .then(([p, c]) => { setProductos(p); setCategorias(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, []);

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar producto?')) return;
    await deleteAdminProducto(id);
    cargar();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="admin-header">
        <h1>Productos</h1>
        <button className="btn btn-primary" onClick={() => { setEditando(null); setFormOpen(true); }}>Nuevo Producto</button>
      </div>

      {formOpen && (
        <ProductoForm
          producto={editando}
          categorias={categorias}
          onClose={() => { setFormOpen(false); setEditando(null); cargar(); }}
        />
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id} className={!p.activo ? 'inactive' : ''}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{formatPrice(p.precio)}</td>
              <td>{p.stock}</td>
              <td>{p.id_categoria}</td>
              <td>{p.activo ? '✓' : '✗'}</td>
              <td className="actions">
                <button className="btn btn-sm btn-outline" onClick={() => { setEditando(p); setFormOpen(true); }}>Editar</button>
                <button className="btn btn-sm btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={() => handleEliminar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
