import { Router } from "express";
import oracledb from "oracledb";
import pool from "../db.js";
import { verificarToken } from "../middleware/auth.js";
import { verificarAdmin } from "../middleware/admin.js";

const router = Router();

router.use(verificarToken, verificarAdmin);

// ========== PRODUCTOS ==========

router.get("/productos", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :cur := pkg_productos.listar(NULL, NULL); END;`,
      { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const rs = result.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    res.json(rows.map(r => ({
      id: r[0], nombre: r[1], descripcion: r[2],
      precio: Number(r[3]), stock: r[4], imagen_url: r[5], genero: r[6],
      id_categoria: r[7], categoria_nombre: r[8]
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.post("/productos", async (req, res) => {
  let conn;
  try {
    const { nombre, descripcion, precio, stock, imagen_url, id_categoria, genero } = req.body;
    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :newid := pkg_productos.crear(:nom, :desc, :pre, :sto, :img, :cat, :gen); END;`,
      {
        newid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        nom: nombre,
        desc: descripcion || null,
        pre: precio,
        sto: stock || 0,
        img: imagen_url || null,
        cat: id_categoria,
        gen: genero || null
      }
    );
    res.status(201).json({ id: result.outBinds.newid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.put("/productos/:id", async (req, res) => {
  let conn;
  try {
    const { nombre, descripcion, precio, stock, imagen_url, id_categoria, activo, genero } = req.body;
    conn = await pool.getConnection();
    await conn.execute(
      `BEGIN pkg_productos.actualizar(:pid, :nom, :desc, :pre, :sto, :img, :cat, :act, :gen); END;`,
      {
        pid: parseInt(req.params.id),
        nom: nombre || null,
        desc: descripcion || null,
        pre: precio || null,
        sto: stock != null ? stock : null,
        img: imagen_url || null,
        cat: id_categoria || null,
        act: activo != null ? (activo ? 1 : 0) : null,
        gen: genero || null
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.delete("/productos/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.execute(
      `BEGIN pkg_productos.eliminar(:pid); END;`,
      { pid: parseInt(req.params.id) }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

// ========== CATEGORIAS ==========

router.get("/categorias", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :cur := pkg_productos.listar_categorias(); END;`,
      { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const rs = result.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    res.json(rows.map(r => ({ id: r[0], nombre: r[1], descripcion: r[2], imagen_url: r[3] })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.post("/categorias", async (req, res) => {
  let conn;
  try {
    const { nombre, descripcion, imagen_url } = req.body;
    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :newid := pkg_productos.crear_categoria(:nom, :desc, :img); END;`,
      {
        newid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        nom: nombre,
        desc: descripcion || null,
        img: imagen_url || null
      }
    );
    res.status(201).json({ id: result.outBinds.newid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.put("/categorias/:id", async (req, res) => {
  let conn;
  try {
    const { nombre, descripcion, imagen_url } = req.body;
    conn = await pool.getConnection();
    await conn.execute(
      `BEGIN pkg_productos.actualizar_categoria(:pid, :nom, :desc, :img); END;`,
      {
        pid: parseInt(req.params.id),
        nom: nombre || null,
        desc: descripcion || null,
        img: imagen_url || null
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.delete("/categorias/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.execute(
      `BEGIN pkg_productos.eliminar_categoria(:pid); END;`,
      { pid: parseInt(req.params.id) }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

// ========== PEDIDOS ==========

router.get("/pedidos", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :cur := pkg_admin.listar_pedidos(); END;`,
      { cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const rs = result.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    res.json(rows.map(r => ({
      id: r[0], id_usuario: r[1], usuario: r[2], email: r[3],
      telefono: r[4], total: Number(r[5]), estado: r[6], creado_en: r[7]
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.get("/pedidos/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :cur := pkg_admin.obtener_pedido(:pid); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        pid: parseInt(req.params.id)
      }
    );
    const rs = result.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    if (rows.length === 0) return res.status(404).json({ error: "No encontrado" });
    const r = rows[0];
    const itemsResult = await conn.execute(
      `BEGIN :cur := pkg_pedidos.obtener_items(:pid); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        pid: parseInt(req.params.id)
      }
    );
    const itemsRs = itemsResult.outBinds.cur;
    const itemsRows = await itemsRs.getRows();
    await itemsRs.close();
    res.json({
      id: r[0], id_usuario: r[1], usuario: r[2], email: r[3],
      telefono: r[4], guest_dni: r[5], total: Number(r[6]), estado: r[7],
      creado_en: r[8],
      items: itemsRows.map(item => ({
        nombre: item[3], precio_unitario: Number(item[2]), cantidad: item[1]
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.put("/pedidos/:id/estado", async (req, res) => {
  let conn;
  try {
    const { estado } = req.body;
    conn = await pool.getConnection();
    await conn.execute(
      `BEGIN pkg_admin.actualizar_estado(:pid, :est); END;`,
      { pid: parseInt(req.params.id), est: estado }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.delete("/pedidos/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.execute(
      `BEGIN pkg_admin.eliminar_pedido(:pid); END;`,
      { pid: parseInt(req.params.id) }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

export default router;
