const { query } = require('../db');

async function makeAdmin() {
  const username = 'admin'; // Change this to your desired admin username
  try {
    await query('UPDATE users SET is_admin = TRUE, is_approved = TRUE WHERE username = $1', [username]);
    console.log(`✅ User ${username} is now an Admin and Approved`);
  } catch (err) {
    console.error('❌ Failed to update user:', err);
  } finally {
    process.exit();
  }
}

makeAdmin();
