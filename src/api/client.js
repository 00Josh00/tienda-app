const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
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
