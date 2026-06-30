import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAdminPedido, updateAdminPedidoEstado } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const estados = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];

export default function AdminPedidoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  function cargar() {
    setLoading(true);
    getAdminPedido(id)
      .then(setPedido)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, [id]);

  async function handleEstado(estado) {
    await updateAdminPedidoEstado(id, estado);
    cargar();
  }

  if (loading) return <LoadingSpinner />;
  if (!pedido) return <p>No encontrado</p>;

  const idxActual = estados.indexOf(pedido.estado);

  return (
    <div>
      <Link to="/admin/pedidos" className="back-link">&larr; Volver a pedidos</Link>
      <h1>Pedido #{pedido.id}</h1>

      <div className="pedido-info">
        <p><strong>Cliente:</strong> {pedido.usuario} ({pedido.email})</p>
        <p><strong>Fecha:</strong> {new Date(pedido.creado_en).toLocaleString()}</p>
        <p><strong>Total:</strong> ${Number(pedido.total).toFixed(2)}</p>
      </div>

      <div className="estado-flow">
        {estados.map((est, i) => (
          <button
            key={est}
            className={`estado-step ${i <= idxActual ? 'active' : ''}`}
            onClick={() => handleEstado(est)}
            disabled={i < idxActual - 1 || i > idxActual + 1}
          >
            {est.charAt(0).toUpperCase() + est.slice(1)}
          </button>
        ))}
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((item, i) => (
            <tr key={i}>
              <td>{item.nombre}</td>
              <td>${item.precio_unitario.toFixed(2)}</td>
              <td>{item.cantidad}</td>
              <td>${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
