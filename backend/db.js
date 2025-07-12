// db.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.CONNECTION_STRING;

if (!connectionString) {
  console.error('❌ CONNECTION_STRING is missing');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Neon
});

pool.on('error', (err) => {
  console.error('❌ DB error:', err.message);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
