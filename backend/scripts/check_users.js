const { query } = require('../db');

async function checkUsers() {
  try {
    const res = await query('SELECT id, username, role, is_admin, is_approved FROM users');
    console.log('Current Users:');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
