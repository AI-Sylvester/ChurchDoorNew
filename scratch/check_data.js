const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const connectionStringLine = envContent.split('\n').find(line => line.startsWith('CONNECTION_STRING='));
const connectionString = connectionStringLine.split('=')[1].trim();

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function checkData() {
  try {
    console.log('--- RECENT FAMILIES ---');
    const fams = await pool.query('SELECT family_id, head_name, created_by, anbiyam, active FROM families ORDER BY id DESC LIMIT 5');
    console.table(fams.rows);

    console.log('--- USERS ---');
    const users = await pool.query('SELECT id, username, role, family_id FROM users ORDER BY id DESC LIMIT 5');
    console.table(users.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkData();
