const oracledb = require("oracledb");

const passwords = [
  "Admin123!",
  "Admin123",
  "Welcome1",
  "welcome1",
  "oracle",
  "Oracle123",
  "Oracle123!",
  "2o2o$$lJloseph",
  "admin",
  "Admin_123",
];

(async () => {
  for (const pwd of passwords) {
    try {
      const c = await oracledb.getConnection({
        user: "ADMIN",
        password: pwd,
        connectionString: process.env.DB_CONNECTION_STRING,
      });
      console.log("CONNECTED AS ADMIN with password: " + pwd);
      var r = await c.execute("SELECT 1 FROM dual");
      console.log("  Query OK: " + JSON.stringify(r.rows));
      await c.close();
      process.exit(0);
    } catch (e) {
      console.log("FAIL: '" + pwd + "' - " + e.message.substring(0, 60));
    }
  }
  console.log("Ninguna contraseña funciono");
})();
