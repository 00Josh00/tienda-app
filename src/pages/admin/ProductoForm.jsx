import { useState } from 'react';
import { createAdminProducto, updateAdminProducto } from '../../api/client';

export default function ProductoForm({ producto, categorias, onClose }) {
  const isEdit = !!producto;
  const [form, setForm] = useState({
    nombre: producto?.nombre || '',
    descripcion: producto?.descripcion || '',
    precio: producto?.precio || '',
    stock: producto?.stock || '',
    imagen_url: producto?.imagen_url || '',
    id_categoria: producto?.id_categoria || '',
    activo: producto?.activo ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateAdminProducto(producto.id, form);
      } else {
        await createAdminProducto(form);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Precio</label>
              <input type="number" step="0.01" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select value={form.id_categoria} onChange={e => setForm({ ...form, id_categoria: e.target.value })} required>
              <option value="">Seleccionar...</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Imagen URL</label>
            <input value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })} />
          </div>
          {isEdit && (
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
                Activo
              </label>
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
