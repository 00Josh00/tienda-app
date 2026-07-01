import { Router } from 'express';
import oracledb from 'oracledb';
import pool from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

router.use(verificarToken);

router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [itemsResult, totalResult] = await Promise.all([
      conn.execute(
        `BEGIN :cur := pkg_carrito.listar(:uid); END;`,
        {
          cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          uid: req.usuario.id
        }
      ),
      conn.execute(
        `BEGIN :tot := pkg_carrito.get_total(:uid); END;`,
        {
          tot: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          uid: req.usuario.id
        }
      )
    ]);

    const rs = itemsResult.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();

    res.json({
      items: rows.map(r => ({
        id: r[0], producto_id: r[1], cantidad: r[2],
        precio_unitario: Number(r[3]), nombre: r[4], imagen_url: r[5], stock: r[6]
      })),
      total: Number(totalResult.outBinds.tot)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.post('/', async (req, res) => {
  let conn;
  try {
    const { producto_id, cantidad } = req.body;
    conn = await pool.getConnection();
    const addResult = await conn.execute(
      `BEGIN :err := pkg_carrito.agregar(:uid, :pid, :cant); END;`,
      {
        err: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        uid: req.usuario.id,
        pid: producto_id,
        cant: cantidad || 1
      }
    );
    const error = addResult.outBinds.err;
    if (error) return res.status(400).json({ error });

    const [itemsResult, totalResult] = await Promise.all([
      conn.execute(
        `BEGIN :cur := pkg_carrito.listar(:uid); END;`,
        {
          cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          uid: req.usuario.id
        }
      ),
      conn.execute(
        `BEGIN :tot := pkg_carrito.get_total(:uid); END;`,
        {
          tot: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          uid: req.usuario.id
        }
      )
    ]);

    const rs = itemsResult.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();

    res.json({
      items: rows.map(r => ({
        id: r[0], producto_id: r[1], cantidad: r[2],
        precio_unitario: Number(r[3]), nombre: r[4], imagen_url: r[5], stock: r[6]
      })),
      total: Number(totalResult.outBinds.tot)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.put('/:productoId', async (req, res) => {
  let conn;
  try {
    const { cantidad } = req.body;
    conn = await pool.getConnection();
    const updResult = await conn.execute(
      `BEGIN :err := pkg_carrito.actualizar_cantidad(:uid, :pid, :cant); END;`,
      {
        err: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        uid: req.usuario.id,
        pid: parseInt(req.params.productoId),
        cant: cantidad
      }
    );
    const error = updResult.outBinds.err;
    if (error) return res.status(400).json({ error });

    const [itemsResult, totalResult] = await Promise.all([
      conn.execute(
        `BEGIN :cur := pkg_carrito.listar(:uid); END;`,
        {
          cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          uid: req.usuario.id
        }
      ),
      conn.execute(
        `BEGIN :tot := pkg_carrito.get_total(:uid); END;`,
        {
          tot: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          uid: req.usuario.id
        }
      )
    ]);

    const rs = itemsResult.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();

    res.json({
      items: rows.map(r => ({
        id: r[0], producto_id: r[1], cantidad: r[2],
        precio_unitario: Number(r[3]), nombre: r[4], imagen_url: r[5], stock: r[6]
      })),
      total: Number(totalResult.outBinds.tot)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.delete('/:productoId', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.execute(
      `BEGIN pkg_carrito.eliminar_item(:uid, :pid); END;`,
      { uid: req.usuario.id, pid: parseInt(req.params.productoId) }
    );

    const [itemsResult, totalResult] = await Promise.all([
      conn.execute(
        `BEGIN :cur := pkg_carrito.listar(:uid); END;`,
        {
          cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          uid: req.usuario.id
        }
      ),
      conn.execute(
        `BEGIN :tot := pkg_carrito.get_total(:uid); END;`,
        {
          tot: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          uid: req.usuario.id
        }
      )
    ]);

    const rs = itemsResult.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();

    res.json({
      items: rows.map(r => ({
        id: r[0], producto_id: r[1], cantidad: r[2],
        precio_unitario: Number(r[3]), nombre: r[4], imagen_url: r[5], stock: r[6]
      })),
      total: Number(totalResult.outBinds.tot)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

export default router;
