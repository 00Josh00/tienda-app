const oracledb = require("oracledb");
(async () => {
  const conn = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_CONNECTION_STRING
  });
  var r = await conn.execute(
    "SELECT name, type, line, text FROM user_errors WHERE name LIKE 'PKG_%' ORDER BY name, line"
  );
  console.log("=== COMPILATION ERRORS ===");
  if (r.rows.length === 0) {
    console.log("(ninguno)");
  } else {
    for (const x of r.rows) console.log(x[0] + " " + x[1] + ":" + x[2] + " " + x[3]);
  }
  // Also check what objects exist
  r = await conn.execute(
    "SELECT object_name, object_type, status FROM user_objects " +
    "WHERE (object_name LIKE 'PKG_%' OR object_name LIKE 'TRG_%' OR object_name = 'PEDIDOS_AUDIT') " +
    "ORDER BY object_type, object_name"
  );
  console.log("\n=== ALL OBJECTS ===");
  for (const x of r.rows) console.log(x[1] + " " + x[0] + " - " + x[2]);
  await conn.close();
})().catch(e => { console.error(e.message); process.exit(1); });
