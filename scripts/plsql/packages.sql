-- ============================================================
-- JOSH STORE - PL/SQL Packages & Triggers
-- ============================================================
-- Migrates business logic from Node.js to Oracle ATP
-- to reduce VM CPU/memory load
-- ============================================================

-- ============================================================
-- 1. PKG_PRODUCTOS - Products & Categories CRUD
-- ============================================================

CREATE OR REPLACE PACKAGE pkg_productos AS

  -- List active products with optional filters
  FUNCTION listar(
    p_categoria_id NUMBER DEFAULT NULL,
    p_genero VARCHAR2 DEFAULT NULL
  ) RETURN SYS_REFCURSOR;

  -- Get single product by ID
  FUNCTION obtener(p_id NUMBER) RETURN SYS_REFCURSOR;

  -- Create product, returns new ID
  FUNCTION crear(
    p_nombre VARCHAR2,
    p_descripcion CLOB DEFAULT NULL,
    p_precio NUMBER,
    p_stock NUMBER DEFAULT 0,
    p_imagen_url VARCHAR2 DEFAULT NULL,
    p_id_categoria NUMBER,
    p_genero VARCHAR2 DEFAULT NULL
  ) RETURN NUMBER;

  -- Update product
  PROCEDURE actualizar(
    p_id NUMBER,
    p_nombre VARCHAR2 DEFAULT NULL,
    p_descripcion CLOB DEFAULT NULL,
    p_precio NUMBER DEFAULT NULL,
    p_stock NUMBER DEFAULT NULL,
    p_imagen_url VARCHAR2 DEFAULT NULL,
    p_id_categoria NUMBER DEFAULT NULL,
    p_activo NUMBER DEFAULT NULL,
    p_genero VARCHAR2 DEFAULT NULL
  );

  -- Soft delete (deactivate)
  PROCEDURE eliminar(p_id NUMBER);

  -- === CATEGORIAS ===

  FUNCTION listar_categorias RETURN SYS_REFCURSOR;

  FUNCTION obtener_categoria(p_id NUMBER) RETURN SYS_REFCURSOR;

  FUNCTION crear_categoria(
    p_nombre VARCHAR2,
    p_descripcion CLOB DEFAULT NULL,
    p_imagen_url VARCHAR2 DEFAULT NULL
  ) RETURN NUMBER;

  PROCEDURE actualizar_categoria(
    p_id NUMBER,
    p_nombre VARCHAR2 DEFAULT NULL,
    p_descripcion CLOB DEFAULT NULL,
    p_imagen_url VARCHAR2 DEFAULT NULL
  );

  PROCEDURE eliminar_categoria(p_id NUMBER);

END pkg_productos;
/

CREATE OR REPLACE PACKAGE BODY pkg_productos AS

  FUNCTION listar(
    p_categoria_id NUMBER DEFAULT NULL,
    p_genero VARCHAR2 DEFAULT NULL
  ) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
    v_sql VARCHAR2(2000);
  BEGIN
    v_sql := 'SELECT p.id, p.nombre, TO_CHAR(p.descripcion) AS descripcion,
                     p.precio, p.stock, p.imagen_url, p.genero,
                     c.id AS categoria_id, c.nombre AS categoria_nombre
              FROM productos p, categorias c
              WHERE p.id_categoria = c.id AND p.activo = 1';

    IF p_categoria_id IS NOT NULL THEN
      v_sql := v_sql || ' AND p.id_categoria = :cat';
    END IF;
    IF p_genero IS NOT NULL THEN
      v_sql := v_sql || ' AND p.genero = :gen';
    END IF;
    v_sql := v_sql || ' ORDER BY p.creado_en DESC';

    IF p_categoria_id IS NOT NULL AND p_genero IS NOT NULL THEN
      OPEN c FOR v_sql USING p_categoria_id, p_genero;
    ELSIF p_categoria_id IS NOT NULL THEN
      OPEN c FOR v_sql USING p_categoria_id;
    ELSIF p_genero IS NOT NULL THEN
      OPEN c FOR v_sql USING p_genero;
    ELSE
      OPEN c FOR v_sql;
    END IF;
    RETURN c;
  END listar;

  FUNCTION obtener(p_id NUMBER) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR
      SELECT p.id, p.nombre, TO_CHAR(p.descripcion) AS descripcion,
             p.precio, p.stock, p.imagen_url, p.genero,
             c.id AS categoria_id, c.nombre AS categoria_nombre
      FROM productos p, categorias c
      WHERE p.id_categoria = c.id AND p.id = p_id AND p.activo = 1;
    RETURN c;
  END obtener;

  FUNCTION crear(
    p_nombre VARCHAR2,
    p_descripcion CLOB DEFAULT NULL,
    p_precio NUMBER,
    p_stock NUMBER DEFAULT 0,
    p_imagen_url VARCHAR2 DEFAULT NULL,
    p_id_categoria NUMBER,
    p_genero VARCHAR2 DEFAULT NULL
  ) RETURN NUMBER IS
    v_new_id NUMBER;
  BEGIN
    INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, id_categoria, genero)
    VALUES (p_nombre, p_descripcion, p_precio, p_stock, p_imagen_url, p_id_categoria, p_genero)
    RETURNING id INTO v_new_id;
    COMMIT;
    RETURN v_new_id;
  END crear;

  PROCEDURE actualizar(
    p_id NUMBER,
    p_nombre VARCHAR2 DEFAULT NULL,
    p_descripcion CLOB DEFAULT NULL,
    p_precio NUMBER DEFAULT NULL,
    p_stock NUMBER DEFAULT NULL,
    p_imagen_url VARCHAR2 DEFAULT NULL,
    p_id_categoria NUMBER DEFAULT NULL,
    p_activo NUMBER DEFAULT NULL,
    p_genero VARCHAR2 DEFAULT NULL
  ) IS
  BEGIN
    UPDATE productos SET
      nombre = NVL(p_nombre, nombre),
      descripcion = NVL(p_descripcion, descripcion),
      precio = NVL(p_precio, precio),
      stock = NVL(p_stock, stock),
      imagen_url = NVL(p_imagen_url, imagen_url),
      id_categoria = NVL(p_id_categoria, id_categoria),
      activo = NVL(p_activo, activo),
      genero = NVL(p_genero, genero)
    WHERE id = p_id;
    COMMIT;
  END actualizar;

  PROCEDURE eliminar(p_id NUMBER) IS
  BEGIN
    UPDATE productos SET activo = 0 WHERE id = p_id;
    COMMIT;
  END eliminar;

  -- === CATEGORIAS ===

  FUNCTION listar_categorias RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR SELECT id, nombre, TO_CHAR(descripcion) AS descripcion, imagen_url
               FROM categorias ORDER BY nombre;
    RETURN c;
  END listar_categorias;

  FUNCTION obtener_categoria(p_id NUMBER) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR SELECT id, nombre, TO_CHAR(descripcion) AS descripcion, imagen_url
               FROM categorias WHERE id = p_id;
    RETURN c;
  END obtener_categoria;

  FUNCTION crear_categoria(
    p_nombre VARCHAR2,
    p_descripcion CLOB DEFAULT NULL,
    p_imagen_url VARCHAR2 DEFAULT NULL
  ) RETURN NUMBER IS
    v_new_id NUMBER;
  BEGIN
    INSERT INTO categorias (nombre, descripcion, imagen_url)
    VALUES (p_nombre, p_descripcion, p_imagen_url)
    RETURNING id INTO v_new_id;
    COMMIT;
    RETURN v_new_id;
  END crear_categoria;

  PROCEDURE actualizar_categoria(
    p_id NUMBER,
    p_nombre VARCHAR2 DEFAULT NULL,
    p_descripcion CLOB DEFAULT NULL,
    p_imagen_url VARCHAR2 DEFAULT NULL
  ) IS
  BEGIN
    UPDATE categorias SET
      nombre = NVL(p_nombre, nombre),
      descripcion = NVL(p_descripcion, descripcion),
      imagen_url = NVL(p_imagen_url, imagen_url)
    WHERE id = p_id;
    COMMIT;
  END actualizar_categoria;

  PROCEDURE eliminar_categoria(p_id NUMBER) IS
  BEGIN
    DELETE FROM categorias WHERE id = p_id;
    COMMIT;
  END eliminar_categoria;

END pkg_productos;
/

-- ============================================================
-- 2. PKG_CARRITO - Shopping Cart Logic
-- ============================================================

CREATE OR REPLACE PACKAGE pkg_carrito AS

  -- Get or create a cart (pedido with estado='carrito') for user
  FUNCTION obtener_o_crear(p_usuario_id NUMBER) RETURN NUMBER;

  -- List cart items
  FUNCTION listar(p_usuario_id NUMBER) RETURN SYS_REFCURSOR;

  -- Get cart total
  FUNCTION get_total(p_usuario_id NUMBER) RETURN NUMBER;

  -- Add item to cart (returns null on success, error msg on failure)
  FUNCTION agregar(
    p_usuario_id NUMBER,
    p_producto_id NUMBER,
    p_cantidad NUMBER
  ) RETURN VARCHAR2;

  -- Update item quantity
  FUNCTION actualizar_cantidad(
    p_usuario_id NUMBER,
    p_producto_id NUMBER,
    p_cantidad NUMBER
  ) RETURN VARCHAR2;

  -- Remove item from cart
  PROCEDURE eliminar_item(p_usuario_id NUMBER, p_producto_id NUMBER);

END pkg_carrito;
/

CREATE OR REPLACE PACKAGE BODY pkg_carrito AS

  FUNCTION obtener_o_crear(p_usuario_id NUMBER) RETURN NUMBER IS
    v_carrito_id NUMBER;
  BEGIN
    BEGIN
      SELECT id INTO v_carrito_id
      FROM pedidos
      WHERE id_usuario = p_usuario_id AND estado = 'carrito'
      FETCH FIRST 1 ROWS ONLY;
    EXCEPTION WHEN NO_DATA_FOUND THEN
      INSERT INTO pedidos (id_usuario, total, estado, creado_en)
      VALUES (p_usuario_id, 0, 'carrito', CURRENT_TIMESTAMP)
      RETURNING id INTO v_carrito_id;
      COMMIT;
    END;
    RETURN v_carrito_id;
  END obtener_o_crear;

  FUNCTION listar(p_usuario_id NUMBER) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
    v_carrito_id NUMBER;
  BEGIN
    v_carrito_id := obtener_o_crear(p_usuario_id);
    OPEN c FOR
      SELECT d.id, d.id_producto, d.cantidad, d.precio_unitario,
             p.nombre, p.imagen_url, p.stock
      FROM detalle_pedido d, productos p
      WHERE d.id_producto = p.id AND d.id_pedido = v_carrito_id;
    RETURN c;
  END listar;

  FUNCTION get_total(p_usuario_id NUMBER) RETURN NUMBER IS
    v_total NUMBER;
    v_carrito_id NUMBER;
  BEGIN
    v_carrito_id := obtener_o_crear(p_usuario_id);
    SELECT COALESCE(SUM(d.cantidad * d.precio_unitario), 0)
    INTO v_total
    FROM detalle_pedido d
    WHERE d.id_pedido = v_carrito_id;
    RETURN v_total;
  END get_total;

  FUNCTION agregar(
    p_usuario_id NUMBER,
    p_producto_id NUMBER,
    p_cantidad NUMBER
  ) RETURN VARCHAR2 IS
    v_carrito_id NUMBER;
    v_precio NUMBER;
    v_stock NUMBER;
    v_existente_id NUMBER;
    v_cant_actual NUMBER;
  BEGIN
    -- Validate product
    BEGIN
      SELECT precio, stock INTO v_precio, v_stock
      FROM productos WHERE id = p_producto_id AND activo = 1
      FETCH FIRST 1 ROWS ONLY;
    EXCEPTION WHEN NO_DATA_FOUND THEN
      RETURN 'Producto no encontrado';
    END;

    v_carrito_id := obtener_o_crear(p_usuario_id);

    -- Check if already in cart
    BEGIN
      SELECT id, cantidad INTO v_existente_id, v_cant_actual
      FROM detalle_pedido
      WHERE id_pedido = v_carrito_id AND id_producto = p_producto_id
      FETCH FIRST 1 ROWS ONLY;

      -- Update quantity
      IF v_cant_actual + p_cantidad > v_stock THEN
        RETURN 'Stock insuficiente';
      END IF;
      UPDATE detalle_pedido
      SET cantidad = v_cant_actual + p_cantidad
      WHERE id = v_existente_id;

    EXCEPTION WHEN NO_DATA_FOUND THEN
      -- New item
      IF p_cantidad > v_stock THEN
        RETURN 'Stock insuficiente';
      END IF;
      INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
      VALUES (v_carrito_id, p_producto_id, p_cantidad, v_precio);
    END;

    COMMIT;
    RETURN NULL; -- success
  END agregar;

  FUNCTION actualizar_cantidad(
    p_usuario_id NUMBER,
    p_producto_id NUMBER,
    p_cantidad NUMBER
  ) RETURN VARCHAR2 IS
    v_carrito_id NUMBER;
    v_stock NUMBER;
  BEGIN
    SELECT stock INTO v_stock
    FROM productos WHERE id = p_producto_id AND activo = 1
    FETCH FIRST 1 ROWS ONLY;

    IF p_cantidad > v_stock THEN
      RETURN 'Stock insuficiente';
    END IF;

    v_carrito_id := obtener_o_crear(p_usuario_id);
    UPDATE detalle_pedido SET cantidad = p_cantidad
    WHERE id_pedido = v_carrito_id AND id_producto = p_producto_id;
    COMMIT;
    RETURN NULL;
  END actualizar_cantidad;

  PROCEDURE eliminar_item(p_usuario_id NUMBER, p_producto_id NUMBER) IS
    v_carrito_id NUMBER;
  BEGIN
    v_carrito_id := obtener_o_crear(p_usuario_id);
    DELETE FROM detalle_pedido
    WHERE id_pedido = v_carrito_id AND id_producto = p_producto_id;
    COMMIT;
  END eliminar_item;

END pkg_carrito;
/

-- ============================================================
-- 3. PKG_PEDIDOS - Order Placement & Management
-- ============================================================

CREATE OR REPLACE PACKAGE pkg_pedidos AS

  -- Create guest order
  FUNCTION crear_guest(
    p_items_json CLOB,
    p_nombre VARCHAR2,
    p_email VARCHAR2,
    p_dni VARCHAR2,
    p_telefono VARCHAR2 DEFAULT NULL,
    p_idempotency_key VARCHAR2
  ) RETURN NUMBER;

  -- Checkout from authenticated user's cart
  FUNCTION checkout(p_usuario_id NUMBER) RETURN NUMBER;

  -- Get order by ID
  FUNCTION obtener(p_id NUMBER) RETURN SYS_REFCURSOR;

  -- Get order items
  FUNCTION obtener_items(p_id NUMBER) RETURN SYS_REFCURSOR;

  -- List user's orders
  FUNCTION listar_por_usuario(p_usuario_id NUMBER) RETURN SYS_REFCURSOR;

  -- Validate DNI format (8 digits)
  FUNCTION validar_dni(p_dni VARCHAR2) RETURN BOOLEAN;

END pkg_pedidos;
/

CREATE OR REPLACE PACKAGE BODY pkg_pedidos AS

  FUNCTION validar_dni(p_dni VARCHAR2) RETURN BOOLEAN IS
  BEGIN
    IF p_dni IS NULL OR LENGTH(p_dni) != 8 THEN
      RETURN FALSE;
    END IF;
    FOR i IN 1..8 LOOP
      IF SUBSTR(p_dni, i, 1) NOT BETWEEN '0' AND '9' THEN
        RETURN FALSE;
      END IF;
    END LOOP;
    RETURN TRUE;
  END validar_dni;

  FUNCTION crear_guest(
    p_items_json CLOB,
    p_nombre VARCHAR2,
    p_email VARCHAR2,
    p_dni VARCHAR2,
    p_telefono VARCHAR2 DEFAULT NULL,
    p_idempotency_key VARCHAR2
  ) RETURN NUMBER IS
    v_pedido_id NUMBER;
    v_total NUMBER := 0;
    v_producto_id NUMBER;
    v_cantidad NUMBER;
    v_precio NUMBER;
    v_stock NUMBER;
    v_error_msg VARCHAR2(4000);
  BEGIN
    -- Validate required fields
    IF p_nombre IS NULL OR p_email IS NULL OR p_dni IS NULL THEN
      RAISE_APPLICATION_ERROR(-20001, 'Nombre, email y DNI son requeridos');
    END IF;
    IF NOT validar_dni(p_dni) THEN
      RAISE_APPLICATION_ERROR(-20002, 'DNI debe tener 8 digitos');
    END IF;
    IF p_idempotency_key IS NULL THEN
      RAISE_APPLICATION_ERROR(-20003, 'idempotency_key requerido');
    END IF;

    -- Check idempotency
    BEGIN
      SELECT id INTO v_pedido_id
      FROM pedidos WHERE idempotency_key = p_idempotency_key
      FETCH FIRST 1 ROWS ONLY;
      RAISE_APPLICATION_ERROR(-20006, 'Pedido ya procesado');
    EXCEPTION WHEN NO_DATA_FOUND THEN NULL;
    END;

    -- Parse JSON items and validate
    FOR item IN (
      SELECT * FROM JSON_TABLE(p_items_json, '$[*]' COLUMNS (
        producto_id NUMBER PATH '$.producto_id',
        cantidad NUMBER PATH '$.cantidad'
      ))
    ) LOOP
      BEGIN
        SELECT precio, stock INTO v_precio, v_stock
        FROM productos WHERE id = item.producto_id AND activo = 1
        FETCH FIRST 1 ROWS ONLY;

        IF item.cantidad > v_stock THEN
          RAISE_APPLICATION_ERROR(-20004,
            'Stock insuficiente para producto ID ' || item.producto_id);
        END IF;

        v_total := v_total + (v_precio * item.cantidad);
      EXCEPTION WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20005,
          'Producto ID ' || item.producto_id || ' no encontrado');
      END;
    END LOOP;

    -- Create pedido
    INSERT INTO pedidos (
      id_usuario, total, estado,
      guest_nombre, guest_email, guest_dni, guest_telefono,
      idempotency_key, creado_en
    ) VALUES (
      NULL, v_total, 'pendiente',
      p_nombre, p_email, p_dni, p_telefono,
      p_idempotency_key, CURRENT_TIMESTAMP
    ) RETURNING id INTO v_pedido_id;

    -- Insert details and reduce stock
    FOR item IN (
      SELECT * FROM JSON_TABLE(p_items_json, '$[*]' COLUMNS (
        producto_id NUMBER PATH '$.producto_id',
        cantidad NUMBER PATH '$.cantidad'
      ))
    ) LOOP
      SELECT precio INTO v_precio
      FROM productos WHERE id = item.producto_id;

      INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
      VALUES (v_pedido_id, item.producto_id, item.cantidad, v_precio);

      UPDATE productos SET stock = stock - item.cantidad
      WHERE id = item.producto_id;
    END LOOP;

    COMMIT;
    RETURN v_pedido_id;

  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END crear_guest;

  FUNCTION checkout(p_usuario_id NUMBER) RETURN NUMBER IS
    v_carrito_id NUMBER;
    v_total NUMBER := 0;
    v_item_count NUMBER;
  BEGIN
    -- Get user's cart
    BEGIN
      SELECT id INTO v_carrito_id
      FROM pedidos
      WHERE id_usuario = p_usuario_id AND estado = 'carrito'
      FETCH FIRST 1 ROWS ONLY;
    EXCEPTION WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20010, 'Carrito vacio');
    END;

    -- Check cart has items
    SELECT COUNT(*) INTO v_item_count
    FROM detalle_pedido WHERE id_pedido = v_carrito_id;

    IF v_item_count = 0 THEN
      RAISE_APPLICATION_ERROR(-20010, 'Carrito vacio');
    END IF;

    -- Calculate total
    SELECT COALESCE(SUM(d.cantidad * d.precio_unitario), 0)
    INTO v_total
    FROM detalle_pedido d
    WHERE d.id_pedido = v_carrito_id;

    -- Update cart to order
    UPDATE pedidos SET estado = 'pendiente', total = v_total
    WHERE id = v_carrito_id;

    -- Reduce stock for each item
    FOR item IN (
      SELECT d.id_producto, d.cantidad
      FROM detalle_pedido d
      WHERE d.id_pedido = v_carrito_id
    ) LOOP
      UPDATE productos SET stock = stock - item.cantidad
      WHERE id = item.id_producto;
    END LOOP;

    COMMIT;
    RETURN v_carrito_id;

  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END checkout;

  FUNCTION obtener(p_id NUMBER) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR
      SELECT p.id, p.id_usuario,
             COALESCE(u.nombre, p.guest_nombre) AS nombre,
             COALESCE(u.email, p.guest_email) AS email,
             COALESCE(u.telefono, p.guest_telefono) AS telefono,
             p.guest_dni, p.total, p.estado, p.creado_en
      FROM pedidos p, usuarios u
      WHERE p.id_usuario = u.id(+) AND p.id = p_id;
    RETURN c;
  END obtener;

  FUNCTION obtener_items(p_id NUMBER) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR
      SELECT d.id_producto, d.cantidad, d.precio_unitario,
             p.nombre, p.imagen_url
      FROM detalle_pedido d, productos p
      WHERE d.id_producto = p.id AND d.id_pedido = p_id;
    RETURN c;
  END obtener_items;

  FUNCTION listar_por_usuario(p_usuario_id NUMBER) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR
      SELECT p.id, p.total, p.estado, p.creado_en
      FROM pedidos p
      WHERE p.id_usuario = p_usuario_id AND p.estado != 'carrito'
      ORDER BY p.creado_en DESC;
    RETURN c;
  END listar_por_usuario;

END pkg_pedidos;
/

-- ============================================================
-- 4. PKG_AUTH - User Registration, Login & Profile
-- ============================================================

CREATE OR REPLACE PACKAGE pkg_auth AS

  -- Register new user (password hashing still done in Node with bcrypt)
  FUNCTION registrar(
    p_nombre VARCHAR2,
    p_email VARCHAR2,
    p_password_hash VARCHAR2,
    p_telefono VARCHAR2 DEFAULT NULL
  ) RETURN SYS_REFCURSOR;

  -- Get user by email for login
  FUNCTION login(p_email VARCHAR2) RETURN SYS_REFCURSOR;

  -- Get user profile by ID
  FUNCTION obtener_usuario(p_id NUMBER) RETURN SYS_REFCURSOR;

  -- Check if email exists
  FUNCTION email_existe(p_email VARCHAR2) RETURN NUMBER;

END pkg_auth;
/

CREATE OR REPLACE PACKAGE BODY pkg_auth AS

  FUNCTION registrar(
    p_nombre VARCHAR2,
    p_email VARCHAR2,
    p_password_hash VARCHAR2,
    p_telefono VARCHAR2 DEFAULT NULL
  ) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
    v_id NUMBER;
  BEGIN
    INSERT INTO usuarios (nombre, email, password_hash, rol, telefono)
    VALUES (p_nombre, p_email, p_password_hash, 'cliente', p_telefono)
    RETURNING id INTO v_id;
    COMMIT;

    OPEN c FOR
      SELECT id, nombre, email, rol, telefono
      FROM usuarios WHERE id = v_id;
    RETURN c;
  END registrar;

  FUNCTION login(p_email VARCHAR2) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR
      SELECT id, nombre, email, password_hash, rol, telefono
      FROM usuarios WHERE email = p_email;
    RETURN c;
  END login;

  FUNCTION obtener_usuario(p_id NUMBER) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR
      SELECT id, nombre, email, rol, telefono
      FROM usuarios WHERE id = p_id;
    RETURN c;
  END obtener_usuario;

  FUNCTION email_existe(p_email VARCHAR2) RETURN NUMBER IS
    v_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count FROM usuarios WHERE email = p_email;
    RETURN v_count;
  END email_existe;

END pkg_auth;
/

-- ============================================================
-- 5. PKG_ADMIN - Admin Operations
-- ============================================================

CREATE OR REPLACE PACKAGE pkg_admin AS

  -- List all orders (non-cart)
  FUNCTION listar_pedidos RETURN SYS_REFCURSOR;

  -- Get full order detail
  FUNCTION obtener_pedido(p_id NUMBER) RETURN SYS_REFCURSOR;

  -- Update order status
  PROCEDURE actualizar_estado(p_id NUMBER, p_estado VARCHAR2);

  -- Delete order (cascade)
  PROCEDURE eliminar_pedido(p_id NUMBER);

  -- Dashboard stats
  FUNCTION contar_pedidos_pendientes RETURN NUMBER;
  FUNCTION total_ventas_hoy RETURN NUMBER;
  FUNCTION productos_bajo_stock(p_limite NUMBER DEFAULT 5) RETURN SYS_REFCURSOR;

END pkg_admin;
/

CREATE OR REPLACE PACKAGE BODY pkg_admin AS

  FUNCTION listar_pedidos RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR
      SELECT p.id, p.id_usuario,
             COALESCE(u.nombre, p.guest_nombre) AS nombre,
             COALESCE(u.email, p.guest_email) AS email,
             COALESCE(u.telefono, p.guest_telefono) AS telefono,
             p.total, p.estado, p.creado_en
      FROM pedidos p, usuarios u
      WHERE p.id_usuario = u.id(+) AND p.estado != 'carrito'
      ORDER BY p.creado_en DESC;
    RETURN c;
  END listar_pedidos;

  FUNCTION obtener_pedido(p_id NUMBER) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR
      SELECT p.id, p.id_usuario,
             COALESCE(u.nombre, p.guest_nombre) AS nombre,
             COALESCE(u.email, p.guest_email) AS email,
             COALESCE(u.telefono, p.guest_telefono) AS telefono,
             p.guest_dni, p.total, p.estado, p.creado_en,
             -- Items as nested cursor (JSON-compatible)
             CURSOR(SELECT d.id_producto, d.cantidad, d.precio_unitario,
                           pr.nombre, pr.imagen_url
                    FROM detalle_pedido d, productos pr
                    WHERE d.id_producto = pr.id AND d.id_pedido = p.id
                   ) AS items
      FROM pedidos p, usuarios u
      WHERE p.id_usuario = u.id(+) AND p.id = p_id;
    RETURN c;
  END obtener_pedido;

  PROCEDURE actualizar_estado(p_id NUMBER, p_estado VARCHAR2) IS
  BEGIN
    UPDATE pedidos SET estado = p_estado WHERE id = p_id;
    COMMIT;
  END actualizar_estado;

  PROCEDURE eliminar_pedido(p_id NUMBER) IS
  BEGIN
    DELETE FROM detalle_pedido WHERE id_pedido = p_id;
    DELETE FROM pedidos WHERE id = p_id;
    COMMIT;
  END eliminar_pedido;

  FUNCTION contar_pedidos_pendientes RETURN NUMBER IS
    v_count NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pedidos WHERE estado = 'pendiente';
    RETURN v_count;
  END contar_pedidos_pendientes;

  FUNCTION total_ventas_hoy RETURN NUMBER IS
    v_total NUMBER;
  BEGIN
    SELECT COALESCE(SUM(total), 0) INTO v_total
    FROM pedidos
    WHERE estado != 'carrito'
      AND TRUNC(creado_en) = TRUNC(CURRENT_TIMESTAMP);
    RETURN v_total;
  END total_ventas_hoy;

  FUNCTION productos_bajo_stock(p_limite NUMBER DEFAULT 5) RETURN SYS_REFCURSOR IS
    c SYS_REFCURSOR;
  BEGIN
    OPEN c FOR
      SELECT id, nombre, stock
      FROM productos
      WHERE activo = 1 AND stock <= p_limite
      ORDER BY stock;
    RETURN c;
  END productos_bajo_stock;

END pkg_admin;
/

-- ============================================================
-- 6. TRIGGERS - Data Integrity & Audit
-- ============================================================

-- Trigger: Prevent stock from going negative
CREATE OR REPLACE TRIGGER trg_productos_stock_check
  BEFORE UPDATE OF stock ON productos
  FOR EACH ROW
BEGIN
  IF :NEW.stock < 0 THEN
    RAISE_APPLICATION_ERROR(-20100,
      'Stock no puede ser negativo para el producto "' || :NEW.nombre || '"');
  END IF;
END;
/

-- Trigger: Auto-set genero based on category on INSERT/UPDATE of productos
CREATE OR REPLACE TRIGGER trg_productos_genero
  BEFORE INSERT OR UPDATE OF id_categoria ON productos
  FOR EACH ROW
BEGIN
  IF :NEW.id_categoria BETWEEN 12 AND 17 THEN
    :NEW.genero := 'mujer';
  ELSIF :NEW.id_categoria BETWEEN 18 AND 22 THEN
    :NEW.genero := 'hombre';
  END IF;
END;
/

-- Trigger: Validate DNI format on guest orders (pedidos)
CREATE OR REPLACE TRIGGER trg_pedidos_guest_validate
  BEFORE INSERT ON pedidos
  FOR EACH ROW
BEGIN
  IF :NEW.guest_dni IS NOT NULL THEN
    IF LENGTH(:NEW.guest_dni) != 8 THEN
      RAISE_APPLICATION_ERROR(-20101, 'DNI debe tener 8 digitos');
    END IF;
    FOR i IN 1..8 LOOP
      IF SUBSTR(:NEW.guest_dni, i, 1) NOT BETWEEN '0' AND '9' THEN
        RAISE_APPLICATION_ERROR(-20101, 'DNI debe contener solo numeros');
      END IF;
    END LOOP;
  END IF;
  -- Ensure new pedidos get a timestamp
  IF :NEW.creado_en IS NULL THEN
    :NEW.creado_en := CURRENT_TIMESTAMP;
  END IF;
END;
/

-- Trigger: Auto-set creado_en on INSERT if not provided
CREATE OR REPLACE TRIGGER trg_pedidos_creado_en
  BEFORE INSERT ON pedidos
  FOR EACH ROW
BEGIN
  IF :NEW.creado_en IS NULL THEN
    :NEW.creado_en := CURRENT_TIMESTAMP;
  END IF;
END;
/

-- Trigger: Log order status changes to a history table
-- First create the audit table
CREATE TABLE pedidos_audit (
  id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
  pedido_id NUMBER NOT NULL,
  estado_anterior VARCHAR2(50),
  estado_nuevo VARCHAR2(50) NOT NULL,
  cambiado_por VARCHAR2(100),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
/

CREATE OR REPLACE TRIGGER trg_pedidos_estado_audit
  AFTER UPDATE OF estado ON pedidos
  FOR EACH ROW
BEGIN
  IF :OLD.estado != :NEW.estado THEN
    INSERT INTO pedidos_audit (pedido_id, estado_anterior, estado_nuevo, cambiado_por)
    VALUES (:NEW.id, :OLD.estado, :NEW.estado, USER);
  END IF;
END;
/

-- Trigger: Prevent deleting a category that has active products
CREATE OR REPLACE TRIGGER trg_categorias_delete_check
  BEFORE DELETE ON categorias
  FOR EACH ROW
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM productos WHERE id_categoria = :OLD.id AND activo = 1;
  IF v_count > 0 THEN
    RAISE_APPLICATION_ERROR(-20102,
      'No se puede eliminar la categoria "' || :OLD.nombre ||
      '" porque tiene ' || v_count || ' productos activos');
  END IF;
END;
/

-- ============================================================
-- VERIFY INSTALLATION
-- ============================================================

-- Run this to verify:
-- SELECT object_name, object_type, status FROM user_objects
-- WHERE object_type IN ('PACKAGE','PACKAGE BODY','TRIGGER','TABLE')
--   AND object_name LIKE 'PKG_%' OR object_name LIKE 'TRG_%'
--   OR object_name = 'PEDIDOS_AUDIT'
-- ORDER BY object_type, object_name;
