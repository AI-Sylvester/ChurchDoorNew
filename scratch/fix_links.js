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

async function fixLinks() {
  try {
    console.log('Fixing user -> family links...');
    const result = await pool.query(`
      UPDATE users u
      SET family_id = f.family_id
      FROM families f
      WHERE f.created_by = u.id
      AND u.family_id IS NULL
    `);
    console.log(`Updated ${result.rowCount} users.`);

    // Also fix any members who might have wrong family_id (integer vs string)
    // Actually the schema has family_id as integer, so that's fine as long as we use the right ID in queries.

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

fixLinks();
