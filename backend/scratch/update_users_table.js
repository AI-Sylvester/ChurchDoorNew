const { query } = require('../db');

async function updateSchema() {
  try {
    console.log('Updating users table...');
    
    // Add columns if they don't exist
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS mobile VARCHAR(20),
      ADD COLUMN IF NOT EXISTS anbiyam VARCHAR(100),
      ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
    `);

    // Ensure at least one admin exists (optional, but good for testing)
    // You might want to manually set a user as admin later
    
    console.log('✅ Schema updated successfully');
  } catch (err) {
    console.error('❌ Schema update failed:', err);
  } finally {
    process.exit();
  }
}

updateSchema();
