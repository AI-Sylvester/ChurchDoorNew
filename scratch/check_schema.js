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

async function checkSchema() {
  try {
    console.log('--- FAMILIES COLUMNS ---');
    const famCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'families'
    `);
    console.table(famCols.rows);

    console.log('--- MEMBERS COLUMNS ---');
    const memCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'members'
    `);
    console.table(memCols.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSchema();
