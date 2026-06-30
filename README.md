# Josh Store 🛒

E-commerce peruano construido con **React + Vite** (frontend) desplegado en **Cloudflare Pages** y **Node.js + Express + Oracle ATP** (backend) alojado en un **VM de Oracle Cloud Infrastructure**.

## Características

- **Catálogo de productos** con categorías, búsqueda y filtros
- **Carrito de compras** sin necesidad de registro (localStorage)
- **Registro e inicio de sesión** con JWT
- **Pedidos como invitado** — sin cuenta, solo DNI y datos de contacto
- **Boleta electrónica** — formato peruano con RUC, DNI, IGV 18%, imprimible
- **Panel administrador** — CRUD de productos, categorías, gestión de pedidos
- **Protección anti-ataques** — rate limiting, idempotency key, Cloudflare DDoS
- **Diseño responsive** — desktop y mobile

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, Vite 8, React Router |
| Backend | Node.js, Express 5 |
| Base de datos | Oracle Autonomous Transaction Processing (ATP) |
| ORM | oracledb (Thin mode, sin Instant Client) |
| Auth | JWT + bcryptjs |
| Edge | Cloudflare Pages + Pages Functions (proxy API) |
| Tunnel | Cloudflare Tunnel (cloudflared) |
| Server | OCI Ubuntu VM + PM2 + systemd |
| Paquete | pnpm |

## Arquitectura

```
Cliente → josh-store.pages.dev (Cloudflare Pages)
                ↓
        Pages Function (/api/*)
                ↓
    Cloudflare Tunnel (cloudflared)
                ↓
    OCI VM:8080 → Express API → Oracle ATP
```

El frontend React se sirve desde Cloudflare Pages. Las rutas `/api/*` son interceptadas por una Pages Function que reenvía las peticiones al backend a través de un túnel Cloudflare, eliminando problemas de mixed content.

## Instalación y desarrollo local

### Prerrequisitos

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Backend

```bash
git clone https://github.com/00Josh00/tienda-app.git
cd tienda-app

# El backend se despliega por separado en el VM
# Consulta la sección de despliegue para más detalles
```

### Frontend

```bash
pnpm install
pnpm run dev
```

El frontend se levantará en `http://localhost:5173` y proxy las llamadas API a `http://localhost:3001` (definido en `vite.config.js`).

## Variables de Entorno

### Backend (`~/.profile` en el VM)

| Variable | Descripción |
|----------|-------------|
| `DB_USER` | Usuario de Oracle DB |
| `DB_PASSWORD` | Contraseña de Oracle DB |
| `DB_CONNECTION_STRING` | TNS o connection string de Oracle ATP |
| `PORT` | Puerto del servidor (default: 3001) |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `CORS_ORIGIN` | Origen(es) permitidos para CORS |
| `BACKEND_URL` | URL pública del backend (túnel) |

### Frontend (Cloudflare Pages env vars)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | `/api` (relativo, se resuelve en el edge) |
| `BACKEND_URL` | URL del túnel Cloudflare (para proxy) |

## API Endpoints

### Públicos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Listar productos (opcional `?categoria=ID`) |
| GET | `/api/productos/:id` | Detalle de producto |
| GET | `/api/categorias` | Listar categorías |
| GET | `/api/categorias/:id` | Detalle de categoría |
| POST | `/api/pedidos` | Crear pedido como invitado (guest) |
| GET | `/api/pedidos/:id/boleta` | Obtener boleta HTML |

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/registro` | Registrar usuario (nombre, email, password, telefono) |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/perfil` | Perfil del usuario (requiere token) |

### Carrito (requiere token)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/carrito` | Obtener carrito |
| POST | `/api/carrito` | Agregar producto |
| PUT | `/api/carrito/:productoId` | Actualizar cantidad |
| DELETE | `/api/carrito/:productoId` | Eliminar producto |
| POST | `/api/pedidos/checkout` | Finalizar compra (carrito → pedido) |

### Admin (requiere token + rol admin)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/admin/productos` | CRUD productos |
| PUT/DELETE | `/api/admin/productos/:id` | CRUD productos |
| GET/POST | `/api/admin/categorias` | CRUD categorías |
| PUT/DELETE | `/api/admin/categorias/:id` | CRUD categorías |
| GET | `/api/admin/pedidos` | Listar pedidos |
| GET | `/api/admin/pedidos/:id` | Detalle de pedido |
| PUT | `/api/admin/pedidos/:id/estado` | Cambiar estado |

### Base de Datos (Oracle)

```sql
-- Tablas principales
CATEGORIAS (id, nombre, descripcion, imagen_url)
PRODUCTOS (id, nombre, descripcion, precio, stock, imagen_url, id_categoria, activo, creado_en)
USUARIOS (id, nombre, email, password_hash, rol, telefono)
PEDIDOS (id, id_usuario, total, estado, direccion_envio, creado_en,
         guest_nombre, guest_email, guest_dni, guest_telefono, idempotency_key)
DETALLE_PEDIDO (id, id_pedido, id_producto, cantidad, precio_unitario)
```

Estados de pedido: `pendiente → confirmado → enviado → entregado` (o `cancelado` en cualquier paso).

## Flujo de compra

1. **Invitado**: navega productos → agrega al carrito (localStorage) → checkout → llena nombre, email, DNI, teléfono → "Hacer pedido"
2. **Registrado**: navega productos → agrega al carrito (DB) → checkout → "Hacer pedido"
3. **Admin**: recibe el pedido → contacta al cliente (Yape/transferencia) → confirma estado en el panel
4. **Cliente**: recibe boleta electrónica con RUC, IGV, total

## Despliegue

### Frontend (Cloudflare Pages)

Conectado vía GitHub — cada push a `main` despliega automáticamente:

```bash
git add -A && git commit -m "mensaje" && git push
```

Build command: `pnpm run build`  
Output dir: `dist`

### Backend (OCI VM)

```bash
ssh -i ssh-key -p 62820 ubuntu@<ip>
source ~/.profile
cd ~/api-tienda
git pull   # o editar archivos directamente
pm2 restart api-tienda
```

El backend corre con PM2 como servicio systemd para auto-reinicio.

### Túnel Cloudflare

```bash
cloudflared tunnel --url http://localhost:3001
```

Se ejecuta como servicio systemd (`cloudflared-api`) con auto-reinicio.
Un cronjob actualiza la variable `BACKEND_URL` cada 5 minutos si la URL del túnel cambia.

## Licencia

MIT
