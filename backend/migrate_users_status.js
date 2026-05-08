const { query } = require('./db');

async function migrate() {
  try {
    console.log('Adding verification_status to users table...');
    await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status character varying DEFAULT 'pending_incharge'");
    
    console.log('Syncing verification_status with is_approved...');
    await query("UPDATE users SET verification_status = 'approved' WHERE is_approved = true");
    
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
