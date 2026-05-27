const { query } = require('../db');

async function migrate() {
  try {
    console.log('Starting migration...');

    // 1. Update users table
    console.log('Updating users table...');
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'family',
      ADD COLUMN IF NOT EXISTS family_id VARCHAR(20);
    `);

    // Update existing users: if is_admin is true, set role to 'admin'
    await query(`
      UPDATE users SET role = 'admin' WHERE is_admin = true;
    `);

    // 2. Create update_requests table
    console.log('Creating update_requests table...');
    await query(`
      CREATE TABLE IF NOT EXISTS update_requests (
        id SERIAL PRIMARY KEY,
        family_id VARCHAR(20) NOT NULL,
        requested_data JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        verified_by_incharge BOOLEAN DEFAULT false,
        verified_by INT REFERENCES users(id),
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create event_reports table
    console.log('Creating event_reports table...');
    await query(`
      CREATE TABLE IF NOT EXISTS event_reports (
        id SERIAL PRIMARY KEY,
        anbiyam VARCHAR(100) NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        description TEXT,
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create payments table
    console.log('Creating payments table...');
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        family_id VARCHAR(20) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'subscription', 'donation'
        payment_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'pending',
        transaction_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
