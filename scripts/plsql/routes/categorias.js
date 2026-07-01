import { Router } from 'express';
import oracledb from 'oracledb';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
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
    res.json(rows.map(r => ({
      id: r[0], nombre: r[1], descripcion: r[2], imagen_url: r[3]
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
      `BEGIN :cur := pkg_productos.obtener_categoria(:p_id); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        p_id: parseInt(req.params.id)
      }
    );
    const rs = result.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
    const r = rows[0];
    res.json({ id: r[0], nombre: r[1], descripcion: r[2], imagen_url: r[3] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error interno' });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

export default router;
