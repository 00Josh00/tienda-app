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
