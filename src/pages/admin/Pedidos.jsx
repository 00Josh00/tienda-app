import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sileo } from 'sileo';
import { getAdminPedidos, deleteAdminPedido } from '../../api/client';
import { formatPrice } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';

const estados = {
  pendiente: { label: 'Pendiente', color: '#d97706' },
  confirmado: { label: 'Confirmado', color: '#2563eb' },
  enviado: { label: 'Enviado', color: '#059669' },
  entregado: { label: 'Entregado', color: '#16a34a' },
  cancelado: { label: 'Cancelado', color: '#dc2626' },
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminPedidos()
      .then(setPedidos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id, nombre) {
    sileo.action({
      title: `¿Eliminar pedido #${id}${nombre ? ' de ' + nombre : ''}?`,
      button: { onClick: async () => {
        try {
          await deleteAdminPedido(id);
          setPedidos(pedidos.filter(p => p.id !== id));
        } catch (err) {
          sileo.error({ title: err.message });
        }
      } }
    });
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Pedidos</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.usuario}</td>
              <td>{p.email}</td>
              <td>{p.telefono || '-'}</td>
              <td>{formatPrice(p.total)}</td>
              <td>
                <span className="estado-badge" style={{ background: (estados[p.estado] || {}).color || '#64748b' }}>
                  {estados[p.estado]?.label || p.estado}
                </span>
              </td>
              <td>{p.creado_en ? new Date(p.creado_en).toLocaleDateString() : '-'}</td>
              <td>
                <Link to={`/admin/pedidos/${p.id}`} className="btn btn-sm btn-outline">Ver</Link>
                <button className="btn btn-sm btn-danger" style={{ marginLeft: '0.5rem' }} onClick={() => handleDelete(p.id, p.usuario)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {pedidos.length === 0 && (
            <tr><td colSpan={8} className="empty">No hay pedidos</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
