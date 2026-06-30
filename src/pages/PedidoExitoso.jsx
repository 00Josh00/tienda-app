import { useParams, Link } from 'react-router-dom';

export default function PedidoExitoso() {
  const { id } = useParams();

  return (
    <div className="container section" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
      <div style={{
        width: 64, height: 64,
        background: '#16a34a', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem', fontSize: '2rem', color: 'white', fontWeight: 'bold'
      }}>
        &#10003;
      </div>
      <h1>¡Pedido confirmado!</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
        Gracias por tu compra. Tu pedido <strong>#{id}</strong> ha sido registrado.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href={`/api/pedidos/${id}/boleta`}
          target="_blank"
          className="btn btn-accent btn-lg"
          rel="noreferrer"
        >
          Ver boleta
        </a>
        <Link to="/productos" className="btn btn-primary btn-lg">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
