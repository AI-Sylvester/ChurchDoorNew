const { query } = require('../db');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await query('UPDATE users SET password = $1 WHERE username = $2', [hashedPassword, 'admin']);
    console.log('Password for user "admin" has been reset to: admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPassword();
