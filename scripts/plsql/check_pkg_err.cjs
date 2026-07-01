const oracledb = require("oracledb");
(async () => {
  const conn = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_CONNECTION_STRING
  });
  var r = await conn.execute(
    "SELECT line, text FROM user_errors WHERE name = 'PKG_PRODUCTOS' AND type = 'PACKAGE BODY' ORDER BY line"
  );
  for (const x of r.rows) console.log("Line " + x[0] + ": " + x[1]);
  await conn.close();
})().catch(e => console.error(e.message));
