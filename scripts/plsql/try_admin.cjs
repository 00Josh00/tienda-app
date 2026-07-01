const oracledb = require("oracledb");

const oracledb = require("oracledb");

(async () => {
  const pwd = process.env.DB_ADMIN_PASSWORD;
  if (!pwd) {
    console.log("Define DB_ADMIN_PASSWORD en ~/.profile");
    process.exit(1);
  }
  try {
    const c = await oracledb.getConnection({
      user: "ADMIN",
      password: pwd,
      connectionString: process.env.DB_CONNECTION_STRING,
    });
    console.log("CONNECTED AS ADMIN");
    var r = await c.execute("SELECT 1 FROM dual");
    console.log("  Query OK: " + JSON.stringify(r.rows));
    await c.close();
  } catch (e) {
    console.log("FAIL: " + e.message.substring(0, 60));
  }
})();
