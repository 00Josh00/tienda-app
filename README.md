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
 | Lógica de negocio | PL/SQL Packages (Oracle) |
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
    OCI VM:8080 → Express API → Oracle ATP (PL/SQL)
```

El frontend React se sirve desde Cloudflare Pages. Las rutas `/api/*` son interceptadas por una Pages Function que reenvía las peticiones al backend a través de un túnel Cloudflare, eliminando problemas de mixed content.

La lógica de negocio (validaciones, cálculos, transacciones) se ejecuta dentro de Oracle ATP mediante **PL/SQL Packages**, reduciendo la carga de CPU/memoria en la VM. Cada operación de la API se traduce a 1 sola llamada PL/SQL en lugar de 3-5 queries separadas.

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
| GET | `/api/productos` | Listar productos (`?categoria=ID`, `?genero=mujer\|hombre`) |
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
| DELETE | `/api/admin/pedidos/:id` | Eliminar pedido |

### Base de Datos (Oracle ATP)

```sql
-- Tablas principales
CATEGORIAS (id, nombre, descripcion, imagen_url, creado_en)
PRODUCTOS  (id, nombre, descripcion, precio, stock, imagen_url,
            id_categoria, activo, creado_en, genero)
USUARIOS   (id, nombre, email, password_hash, rol, telefono, creado_en)
PEDIDOS    (id, id_usuario, total, estado, creado_en,
            guest_nombre, guest_email, guest_dni, guest_telefono, idempotency_key)
DETALLE_PEDIDO (id, id_pedido, id_producto, cantidad, precio_unitario)
PEDIDOS_AUDIT  (id, pedido_id, estado_anterior, estado_nuevo, cambiado_por, creado_en)
```

Estados de pedido: `pendiente → confirmado → enviado → entregado` (o `cancelado` en cualquier paso).

### PL/SQL Packages

La lógica de negocio se implementa en packages Oracle dentro del ATP, minimizando los round-trips entre Node.js y la base de datos.

| Package | Funcionalidad |
|---------|---------------|
| `pkg_productos` | CRUD de productos y categorías, listado con filtros (`?categoria=`, `?genero=`) |
| `pkg_carrito` | Carrito de compras: obtener/crear, agregar items, actualizar cantidad, eliminar |
| `kg_pedidos` | Creación de pedidos (guest con JSON items + validación DNI + idempotency key), checkout desde carrito, consulta de pedidos |
| `pkg_auth` | Registro de usuarios, login, perfil, verificación de email duplicado |
| `pkg_admin` | Listado/detalle de pedidos, cambio de estado, eliminación, estadísticas del dashboard |

### Triggers

| Trigger | Propósito |
|---------|-----------|
| `trg_productos_stock_check` | Evita stock negativo al actualizar productos |
| `trg_productos_genero` | Auto-asigna `genero` (`mujer`/`hombre`) según el `id_categoria` |
| `trg_pedidos_guest_validate` | Valida formato DNI (8 dígitos) al insertar pedidos guest |
| `trg_pedidos_creado_en` | Auto-asigna `CURRENT_TIMESTAMP` si no se provee `creado_en` |
| `trg_pedidos_estado_audit` | Registra cambios de estado en `pedidos_audit` |
| `trg_categorias_delete_check` | Evita eliminar categorías con productos activos |

### Esquema de llamadas PL/SQL desde Node.js

Cada ruta de la API ejecuta un bloque anónimo PL/SQL con binds nombrados:

```javascript
// Ejemplo: listar productos con filtro de género
const result = await conn.execute(
  `BEGIN :cur := pkg_productos.listar(:cat, :gen); END;`,
  {
    cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    cat: req.query.categoria || null,
    gen: req.query.genero || null
  }
);
const rs = result.outBinds.cur;
const rows = await rs.getRows();
await rs.close();
```

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
ssh -i ssh-key ubuntu@<ip>
source ~/.profile
cd ~/api-tienda
git pull   # o editar archivos directamente
pm2 restart api-tienda
```

El backend corre con PM2 como servicio systemd para auto-reinicio.

### PL/SQL Packages

Los packages y triggers se despliegan directamente en Oracle ATP:

```bash
# Desde la máquina local
scp scripts/plsql/packages.sql ubuntu@<vm-ip>:/tmp/packages.sql
ssh ubuntu@<vm-ip>

# En el VM
source ~/.profile
cd ~/api-tienda
node scripts/plsql/run_plsql.cjs   # Ejecuta packages.sql contra el ATP
```

Requiere que el usuario `APP_TIENDA` tenga privilegios `CREATE PROCEDURE`, `CREATE TRIGGER` y `CREATE TYPE` (otorgados por `ADMIN`).

### Túnel Cloudflare

```bash
cloudflared tunnel --url http://localhost:3001
```

Se ejecuta como servicio systemd (`cloudflared-api`) con auto-reinicio.
Un cronjob actualiza la variable `BACKEND_URL` cada 5 minutos si la URL del túnel cambia.

## Licencia

MIT
