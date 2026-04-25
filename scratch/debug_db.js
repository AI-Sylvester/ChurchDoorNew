const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually parse .env from backend folder
const envPath = path.join(__dirname, '..', 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const connectionStringLine = envContent.split('\n').find(line => line.startsWith('CONNECTION_STRING='));
const connectionString = connectionStringLine.split('=')[1].trim();

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log('--- USERS ---');
    const users = await pool.query('SELECT username, is_admin, anbiyam, is_approved FROM users');
    console.table(users.rows);

    console.log('--- ANBIYAMS ---');
    const anbiyams = await pool.query('SELECT name FROM anbiyam');
    console.table(anbiyams.rows);

    console.log('--- FAMILY COUNTS BY ANBIYAM ---');
    const famStats = await pool.query('SELECT anbiyam, COUNT(*) FROM families GROUP BY anbiyam');
    console.table(famStats.rows);

    console.log('--- TOTAL COUNTS ---');
    const totals = await pool.query('SELECT (SELECT COUNT(*) FROM families) as fam_count, (SELECT COUNT(*) FROM members) as mem_count');
    console.table(totals.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
