import { Router } from "express";
import oracledb from "oracledb";
import pool from "../db.js";
import { verificarToken } from "../middleware/auth.js";

const router = Router();

router.post("/", async (req, res) => {
  let conn;
  try {
    const { items, nombre, email, dni, telefono, idempotency_key } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Se requiere al menos un producto" });
    }
    if (!nombre || !email || !dni) {
      return res.status(400).json({ error: "Nombre, email y DNI son requeridos" });
    }
    if (!idempotency_key) {
      return res.status(400).json({ error: "idempotency_key requerido" });
    }

    const itemsJson = JSON.stringify(items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad })));

    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :pid := pkg_pedidos.crear_guest(:json, :nom, :email, :dni, :tel, :ikey); END;`,
      {
        pid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        json: itemsJson,
        nom: nombre,
        email: email,
        dni: dni,
        tel: telefono || null,
        ikey: idempotency_key
      }
    );
    const pedidoId = result.outBinds.pid;

    const pedidoResult = await conn.execute(
      `BEGIN :cur := pkg_pedidos.obtener(:pid); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        pid: pedidoId
      }
    );
    const rs = pedidoResult.outBinds.cur;
    const rows = await rs.getRows();
    await rs.close();
    const r = rows[0];

    const itemsResult = await conn.execute(
      `BEGIN :cur := pkg_pedidos.obtener_items(:pid); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        pid: pedidoId
      }
    );
    const itemsRs = itemsResult.outBinds.cur;
    const itemRows = await itemsRs.getRows();
    await itemsRs.close();

    res.status(201).json({
      id: r[0],
      total: Number(r[6]),
      estado: r[7],
      guest_nombre: r[2],
      guest_dni: r[5],
      items: itemRows.map(d => ({
        producto_id: d[0], cantidad: d[1], precio_unitario: Number(d[2])
      }))
    });
  } catch (err) {
    if (err.errorNum === 20006) {
      return res.status(409).json({ error: "Pedido ya procesado" });
    }
    if (conn) try { await conn.rollback(); } catch {}
    const msg = err.message || '';
    if (msg.includes('20001')) return res.status(400).json({ error: 'Nombre, email y DNI son requeridos' });
    if (msg.includes('20002')) return res.status(400).json({ error: 'DNI debe tener 8 digitos' });
    if (msg.includes('20004')) return res.status(400).json({ error: 'Stock insuficiente' });
    if (msg.includes('20005')) return res.status(400).json({ error: 'Producto no encontrado' });
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.post("/checkout", verificarToken, async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(
      `BEGIN :pid := pkg_pedidos.checkout(:uid); END;`,
      {
        pid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        uid: req.usuario.id
      }
    );
    const pedidoId = result.outBinds.pid;
    const pedidoResult = await conn.execute(
      `BEGIN :cur := pkg_pedidos.obtener(:pid); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        pid: pedidoId
      }
    );
    const rs = pedidoResult.outBinds.cur;
    const pRows = await rs.getRows();
    await rs.close();
    const r = pRows[0];
    res.json({ id: r[0], total: Number(r[6]), estado: r[7] });
  } catch (err) {
    if (conn) try { await conn.rollback(); } catch {}
    if (err.errorNum === 20010) return res.status(400).json({ error: 'Carrito vac\u00edo' });
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

router.get("/:id/boleta", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const pedidoResult = await conn.execute(
      `BEGIN :cur := pkg_pedidos.obtener(:pid); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        pid: parseInt(req.params.id)
      }
    );
    const pedidoRs = pedidoResult.outBinds.cur;
    const pedidoRows = await pedidoRs.getRows();
    await pedidoRs.close();

    if (pedidoRows.length === 0) return res.status(404).json({ error: "No encontrado" });

    const r = pedidoRows[0];
    const buyerName = r[2] || "Cliente";
    const buyerEmail = r[3] || "";
    const buyerDni = r[5] || "-";
    const buyerPhone = r[4] || "-";

    const itemsResult = await conn.execute(
      `BEGIN :cur := pkg_pedidos.obtener_items(:pid); END;`,
      {
        cur: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        pid: parseInt(req.params.id)
      }
    );
    const itemsRs = itemsResult.outBinds.cur;
    const itemRows = await itemsRs.getRows();
    await itemsRs.close();

    const items = itemRows.map(d => ({
      nombre: d[3], cantidad: d[1], precio: Number(d[2]), subtotal: d[1] * Number(d[2])
    }));

    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const igv = subtotal * 0.18;
    const total = subtotal;

    const fecha = new Date(r[8]).toLocaleDateString("es-PE", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    const itemsHtml = items.map(i => `
      <tr>
        <td>${i.nombre}</td>
        <td class="center">${i.cantidad}</td>
        <td class="right">S/ ${i.precio.toFixed(2)}</td>
        <td class="right">S/ ${i.subtotal.toFixed(2)}</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Boleta - Josh Store</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 13px; color: #000; padding: 30px; }
    .boleta { max-width: 320px; margin: 0 auto; border: 2px dashed #333; padding: 20px; }
    h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
    .subtitle { text-align: center; font-size: 11px; color: #555; margin-bottom: 15px; }
    .header-info { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #999; font-size: 11px; }
    .header-info p { margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; }
    th { border-bottom: 1px solid #000; padding: 4px 2px; text-align: left; font-size: 10px; }
    td { padding: 3px 2px; }
    .right { text-align: right; }
    .center { text-align: center; }
    .totals { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #999; }
    .totals p { display: flex; justify-content: space-between; font-size: 11px; margin: 2px 0; }
    .totals .total { font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
    .footer { text-align: center; margin-top: 15px; font-size: 10px; color: #888; }
    @media print { body { padding: 0; } .boleta { border: none; padding: 10px; } }
  </style>
</head>
<body>
  <div class="boleta">
    <h1>JOSH STORE</h1>
    <p class="subtitle">RUC: 10764537756<br>Tienda Virtual</p>

    <div class="header-info">
      <p><strong>BOLETA N\u00b0</strong> ${String(r[0]).padStart(6, "0")}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Cliente:</strong> ${buyerName}</p>
      <p><strong>DNI:</strong> ${buyerDni}</p>
      <p><strong>Tel\u00e9fono:</strong> ${buyerPhone}</p>
      <p><strong>Email:</strong> ${buyerEmail}</p>
    </div>

    <table>
      <thead>
        <tr><th>Producto</th><th class="center">Cant</th><th class="right">P.U.</th><th class="right">Total</th></tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <p><span>Subtotal</span><span>S/ ${subtotal.toFixed(2)}</span></p>
      <p><span>IGV (18%)</span><span>S/ ${igv.toFixed(2)}</span></p>
      <p class="total"><span>TOTAL</span><span>S/ ${total.toFixed(2)}</span></p>
    </div>

    <p class="footer">Gracias por tu compra</p>
  </div>
  <p style="text-align:center;margin-top:10px">
    <button onclick="window.print()" style="padding:8px 20px;font-size:14px;cursor:pointer">Imprimir</button>
  </p>
</body>
</html>`;

    res.type("html").send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) try { await conn.close(); } catch {}
  }
});

export default router;
