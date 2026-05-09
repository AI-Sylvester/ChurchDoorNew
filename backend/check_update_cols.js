const db = require('./db');
async function run() {
  const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'update_requests'");
  console.log(res.rows);
  process.exit();
}
run();
