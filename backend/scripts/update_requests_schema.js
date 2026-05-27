const { query } = require('../db');

async function updateSchema() {
  try {
    await query(`ALTER TABLE update_requests ADD COLUMN IF NOT EXISTS verified_by_incharge BOOLEAN DEFAULT false`);
    await query(`ALTER TABLE update_requests ADD COLUMN IF NOT EXISTS verified_by INT REFERENCES users(id)`);
    await query(`ALTER TABLE update_requests ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP`);
    console.log('Update Requests table updated successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateSchema();
