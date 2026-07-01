import { Router } from 'express';
import oracledb from 'oracledb';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :cur := pkg_productos.listar(:cat, :gen); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        cat: req.query.categoria ? parseInt(req.query.categoria) : null,
        gen: req.query.genero || null
      }
    );
    const rs = result.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    res.json(rows.map(r => ({
      id: r[0], nombre: r[1], descripcion: r[2],
      precio: Number(r[3]), stock: r[4], imagen_url: r[5],
      ind_h: r[6], ind_m: r[7],
      categoria: { id: r[8], nombre: r[9] }
    })));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error interno' });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.get('/:id', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :cur := pkg_productos.obtener(:p_id); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        p_id: parseInt(req.params.id)
      }
    );
    const rs = result.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    const r = rows[0];
    res.json({
      id: r[0], nombre: r[1], descripcion: r[2],
      precio: Number(r[3]), stock: r[4], imagen_url: r[5],
      ind_h: r[6], ind_m: r[7],
      categoria: { id: r[8], nombre: r[9] }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error interno' });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

export default router;
