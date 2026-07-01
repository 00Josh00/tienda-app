const oracledb = require("oracledb");
const fs = require("fs");

(async () => {
  const sql = fs.readFileSync("/tmp/packages.sql", "utf8");
  // Split on lines that contain only "/" (with optional whitespace)
  const lines = sql.split("\n");
  const statements = [];
  let current = [];

  for (const line of lines) {
    if (line.trim() === "/") {
      if (current.length > 0) {
        statements.push(current.join("\n").trim());
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) statements.push(current.join("\n").trim());

  console.log("Found " + statements.length + " statements to execute\n");

  const conn = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_CONNECTION_STRING
  });

  let ok = 0, fail = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;

    // Skip pure comment blocks
    if (stmt.replace(/^--.*$/gm, "").trim().length === 0) continue;

    try {
      await conn.execute(stmt);
      const preview = stmt.split("\n")[0].substring(0, 90);
      console.log("OK: " + preview + "...");
      ok++;
    } catch (err) {
      if (err.errorNum === 955 || err.errorNum === 4082) {
        console.log("OK (exists): " + stmt.split("\n")[0].substring(0, 80) + "...");
        ok++;
      } else {
        console.log("FAIL: " + stmt.split("\n")[0].substring(0, 80) + "...");
        console.log("  " + err.message.substring(0, 150));
        fail++;
      }
    }
  }

  console.log("\n=== RESULTADO: " + ok + " OK, " + fail + " FAIL ===");

  // Verify
  const verify = await conn.execute(
    "SELECT object_name, object_type, status FROM user_objects " +
    "WHERE (object_name LIKE 'PKG_%' OR object_name LIKE 'TRG_%' OR object_name = 'PEDIDOS_AUDIT') " +
    "ORDER BY object_type, object_name"
  );
  console.log("\n=== OBJETOS INSTALADOS ===");
  if (verify.rows.length === 0) {
    console.log("  (ninguno)");
  } else {
    for (const x of verify.rows) console.log("  " + x[1] + " " + x[0] + " - " + x[2]);
  }

  await conn.close();
})().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
