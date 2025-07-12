const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query }  = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);
  try {
    const userRes = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (userRes.rows.length === 0) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '15m' });
    console.log('Login successful for:', username);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Register route
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if user already exists
    const userCheck = await query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into DB
    await db.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)',
      [username, hashedPassword, email]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;