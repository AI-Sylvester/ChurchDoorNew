const db = require('./db');
async function run() {
  const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
  console.log(res.rows);
  process.exit();
}
run();
