const oracledb = require("oracledb");
(async () => {
  const conn = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_CONNECTION_STRING
  });
  // Check current user and privileges
  var r = await conn.execute("SELECT USER FROM dual");
  console.log("User: " + r.rows[0][0]);
  r = await conn.execute("SELECT * FROM session_privs");
  console.log("Privileges:");
  for (const x of r.rows) console.log("  " + x[0]);
  await conn.close();
})().catch(e => { console.error(e.message); process.exit(1); });
