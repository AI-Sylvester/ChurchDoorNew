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

async function checkFamilies() {
  try {
    const fams = await pool.query('SELECT family_id, head_name, created_by, verification_status FROM families ORDER BY id DESC');
    console.table(fams.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkFamilies();
