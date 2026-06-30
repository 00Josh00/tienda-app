import { useState, useEffect } from 'react';
import { getAdminProductos, getAdminCategorias, getAdminPedidos } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([getAdminProductos(), getAdminCategorias(), getAdminPedidos()])
      .then(([prods, cats, peds]) => {
        setStats({
          productos: prods.length,
          categorias: cats.length,
          pedidos: peds.length,
          stockBajo: prods.filter(p => p.stock < 10).length,
        });
      })
      .catch(console.error);
  }, []);

  if (!stats) return <LoadingSpinner />;

  const cards = [
    { label: 'Productos', value: stats.productos, color: '#2563eb' },
    { label: 'Categorías', value: stats.categorias, color: '#059669' },
    { label: 'Pedidos', value: stats.pedidos, color: '#d97706' },
    { label: 'Stock Bajo', value: stats.stockBajo, color: '#dc2626' },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="admin-stats">
        {cards.map(c => (
          <div key={c.label} className="stat-card" style={{ borderLeftColor: c.color }}>
            <span className="stat-value">{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
