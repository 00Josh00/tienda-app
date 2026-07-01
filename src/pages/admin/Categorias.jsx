import { useState, useEffect } from 'react';
import { sileo } from 'sileo';
import { getAdminCategorias, createAdminCategoria, updateAdminCategoria, deleteAdminCategoria } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');

  function cargar() {
    setLoading(true);
    getAdminCategorias()
      .then(setCategorias)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, []);

  function resetForm() {
    setEditando(null);
    setNombre('');
    setDescripcion('');
    setImagen('');
  }

  function editar(c) {
    setEditando(c);
    setNombre(c.nombre);
    setDescripcion(c.descripcion || '');
    setImagen(c.imagen_url || '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = { nombre, descripcion, imagen_url: imagen };
    try {
      if (editando) {
        await updateAdminCategoria(editando.id, data);
      } else {
        await createAdminCategoria(data);
      }
      resetForm();
      cargar();
    } catch (err) {
      sileo.error({ title: err.message });
    }
  }

  async function handleEliminar(id) {
    sileo.action({
      title: 'Eliminar categoría',
      description: '¿Estás seguro? Esta acción no se puede deshacer.',
      duration: null,
      autopilot: false,
      fill: '#dc2626',
      styles: { badge: 'sileo-action-danger', title: 'sileo-danger-text', description: 'sileo-danger-text' },
      button: {
        title: 'Eliminar',
        onClick: async () => {
          try {
            await deleteAdminCategoria(id);
            sileo.info({ title: 'Categoría eliminada' });
            cargar();
          } catch (err) {
            sileo.error({ title: err.message || 'Error al eliminar' });
          }
        }
      }
    });
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="admin-header">
        <h1>Categorías</h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-inline-form">
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        <input placeholder="URL imagen" value={imagen} onChange={e => setImagen(e.target.value)} />
        <button className="btn btn-primary">{editando ? 'Actualizar' : 'Agregar'}</button>
        {editando && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancelar</button>}
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre}</td>
              <td>{c.descripcion}</td>
              <td className="actions">
                <button className="btn btn-sm btn-outline" onClick={() => editar(c)}>Editar</button>
                <button className="btn btn-sm btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={() => handleEliminar(c.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
