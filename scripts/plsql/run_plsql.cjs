const oracledb = require("oracledb");
const fs = require("fs");

(async () => {
  const sql = fs.readFileSync("/tmp/packages.sql", "utf8");
  const statements = sql.split(/\n\/\s*\n/);

  const conn = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_CONNECTION_STRING
  });

  let ok = 0, fail = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt || stmt.startsWith("--") || stmt.startsWith("Run this")) continue;

    try {
      await conn.execute(stmt);
      console.log("OK: Stmt " + (i + 1) + " - " + stmt.substring(0, 80).replace(/\n/g, " ") + "...");
      ok++;
    } catch (err) {
      if (err.errorNum === 955 || err.errorNum === 4082) {
        console.log("OK: Stmt " + (i + 1) + " (exists, skipped)");
        ok++;
      } else if (err.errorNum === 942) {
        console.log("WARN: Stmt " + (i + 1) + " - " + err.message.substring(0, 100));
        fail++;
      } else {
        console.log("FAIL: Stmt " + (i + 1) + " - " + err.message.substring(0, 200));
        fail++;
      }
    }
  }

  console.log("\n=== RESULTADO: " + ok + " OK, " + fail + " FAIL ===");

  // Verify objects
  const verify = await conn.execute(
    "SELECT object_name, object_type, status FROM user_objects " +
    "WHERE (object_name LIKE 'PKG_%' OR object_name LIKE 'TRG_%' OR object_name = 'PEDIDOS_AUDIT') " +
    "ORDER BY object_type, object_name"
  );
  console.log("\n=== OBJETOS INSTALADOS ===");
  if (verify.rows.length === 0) {
    console.log("  (ninguno encontrado)");
  } else {
    for (const x of verify.rows) console.log("  " + x[1] + " " + x[0] + " - " + x[2]);
  }

  await conn.close();
})().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
