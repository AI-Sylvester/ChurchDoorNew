const { query } = require('../db');

async function updateSchema() {
  try {
    await query(`ALTER TABLE families ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending_incharge'`);
    // Also update existing active families to 'approved'
    await query(`UPDATE families SET verification_status = 'approved' WHERE active = true`);
    console.log('Schema updated successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateSchema();
