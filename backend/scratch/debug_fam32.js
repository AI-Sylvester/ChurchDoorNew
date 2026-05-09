const db = require('../db');

async function debug() {
  try {
    const fam = await db.query('SELECT * FROM families WHERE family_id = $1', ['FAM0000032']);
    console.log('Family Data:', fam.rows);
    
    const users = await db.query('SELECT id, full_name, mobile FROM users WHERE id = $1', [fam.rows[0]?.created_by]);
    console.log('Creator User:', users.rows);
    
    const members = await db.query('SELECT * FROM members WHERE family_id = $1', [fam.rows[0]?.id]);
    console.log('Members count:', members.rows.length);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

debug();
