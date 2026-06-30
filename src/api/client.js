const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function tokenHeader() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request(path, opts = {}) {
  const headers = { ...tokenHeader(), ...opts.headers };
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export function getProductos(categoriaId) {
  const params = categoriaId ? `?categoria=${categoriaId}` : '';
  return request(`/productos${params}`);
}

export function getProducto(id) {
  return request(`/productos/${id}`);
}

export function getCategorias() {
  return request('/categorias');
}

export function authLogin(email, password) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function authRegistro(nombre, email, password) {
  return request('/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  });
}

export function authPerfil() {
  return request('/auth/perfil');
}

export function getCarrito() {
  return request('/carrito');
}

export function addToCarrito(producto_id, cantidad) {
  return request('/carrito', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ producto_id, cantidad }),
  });
}

export function updateCarrito(producto_id, cantidad) {
  return request(`/carrito/${producto_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad }),
  });
}

export function removeFromCarrito(producto_id) {
  return request(`/carrito/${producto_id}`, { method: 'DELETE' });
}

// Guest order (no auth)
export function createGuestOrder(items, nombre, email, dni, idempotencyKey) {
  return request('/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, nombre, email, dni, idempotency_key: idempotencyKey }),
  });
}

// Authenticated checkout (from cart)
export function checkoutCart() {
  return request('/pedidos/checkout', { method: 'POST' });
}

export function getBoletaUrl(id) {
  return `${API_URL}/pedidos/${id}/boleta`;
}

// Admin
export function getAdminProductos() {
  return request('/admin/productos');
}

export function createAdminProducto(data) {
  return request('/admin/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateAdminProducto(id, data) {
  return request(`/admin/productos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteAdminProducto(id) {
  return request(`/admin/productos/${id}`, { method: 'DELETE' });
}

export function getAdminCategorias() {
  return request('/admin/categorias');
}

export function createAdminCategoria(data) {
  return request('/admin/categorias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateAdminCategoria(id, data) {
  return request(`/admin/categorias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteAdminCategoria(id) {
  return request(`/admin/categorias/${id}`, { method: 'DELETE' });
}

export function getAdminPedidos() {
  return request('/admin/pedidos');
}

export function getAdminPedido(id) {
  return request(`/admin/pedidos/${id}`);
}

export function updateAdminPedidoEstado(id, estado) {
  return request(`/admin/pedidos/${id}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
}
