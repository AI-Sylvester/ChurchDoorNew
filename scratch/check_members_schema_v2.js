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

async function checkMembersSchema() {
  try {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'members'
    `);
    cols.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkMembersSchema();
