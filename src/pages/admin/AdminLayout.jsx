import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/pedidos', label: 'Pedidos' },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <nav>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-content">
        {/* Mobile admin nav tabs */}
        <div className="admin-mobile-nav">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`admin-mobile-tab ${location.pathname === l.to || (l.to !== '/admin' && location.pathname.startsWith(l.to)) ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
