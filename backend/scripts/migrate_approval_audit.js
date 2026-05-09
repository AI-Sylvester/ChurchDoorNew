const { query } = require('../db');

async function migrate() {
  try {
    console.log('Adding verification and approval audit columns to families, members, and users tables...');
    
    const tables = ['families', 'members', 'users'];
    for (const table of tables) {
      await query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id)`);
      await query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP`);
      await query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id)`);
      await query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP`);
    }
    
    console.log('Audit columns added successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
