import { Router } from 'express';
import bcrypt from 'bcryptjs';
import oracledb from 'oracledb';
import pool from '../db.js';
import { generarToken, verificarToken } from '../middleware/auth.js';

const router = Router();

router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    const conn = await pool.getConnection();

    const checkResult = await conn.execute(
      `BEGIN :cnt := pkg_auth.email_existe(:em); END;`,
      {
        cnt: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        em: email
      }
    );
    if (checkResult.outBinds.cnt > 0) {
      await conn.close();
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await conn.execute(
      `BEGIN :cur := pkg_auth.registrar(:nom, :em, :pw, :tel); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        nom: nombre,
        em: email,
        pw: password_hash,
        tel: telefono || null
      }
    );

    const rs = result.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    await conn.close();

    const r = rows[0];
    const token = generarToken({ id: r[0], nombre: r[1], email: r[2], rol: r[3] });
    res.status(201).json({ token, usuario: { id: r[0], nombre: r[1], email: r[2], rol: r[3], telefono: r[4] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    const conn = await pool.getConnection();

    const result = await conn.execute(
      `BEGIN :cur := pkg_auth.login(:em); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        em: email
      }
    );

    const rs = result.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    await conn.close();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const r = rows[0];
    const valido = await bcrypt.compare(password, r[3]);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generarToken({ id: r[0], nombre: r[1], email: r[2], rol: r[4] });
    res.json({ token, usuario: { id: r[0], nombre: r[1], email: r[2], rol: r[4], telefono: r[5] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/perfil', verificarToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :cur := pkg_auth.obtener_usuario(:uid); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        uid: req.usuario.id
      }
    );
    const rs = result.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    const r = rows[0];
    res.json({ id: r[0], nombre: r[1], email: r[2], rol: r[3], telefono: r[4] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

export default router;
