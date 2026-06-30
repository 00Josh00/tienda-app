import { useParams, Link } from 'react-router-dom';

export default function PedidoExitoso() {
  const { id } = useParams();

  return (
    <div className="order-success">
      <div className="container" style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="order-success-icon">&#10003;</div>
        <h1>¡Pedido confirmado!</h1>
        <p>
          Gracias por tu compra. Tu pedido <strong>#{id}</strong> ha sido registrado.
          Te contactaremos pronto para coordinar el pago y envío.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href={`/api/pedidos/${id}/boleta`}
            target="_blank"
            className="btn btn-accent btn-lg btn-block"
            rel="noreferrer"
            style={{ maxWidth: 320 }}
          >
            Ver boleta
          </a>
          <Link to="/productos" className="btn btn-primary btn-lg btn-block" style={{ maxWidth: 320 }}>
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
