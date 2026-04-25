const db = require('../backend/db');
async function test() {
  const res = await db.query(`SELECT name, relationship FROM members LIMIT 5`);
  console.log(res.rows);
  process.exit(0);
}
test();
