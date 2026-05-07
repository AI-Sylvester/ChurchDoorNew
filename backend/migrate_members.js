const db = require('./db');

async function migrate() {
    try {
        console.log('Starting member verification migration...');
        
        // Add verification_status to members table
        // We'll default it to 'approved' for existing members to avoid breaking current data
        await db.query(`
            ALTER TABLE members 
            ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'approved'
        `);
        
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
