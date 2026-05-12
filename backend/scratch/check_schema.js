const { query } = require('../db');
async function run() {
  const res = await query("SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('families', 'members', 'users') ORDER BY table_name, column_name");
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}
run();
