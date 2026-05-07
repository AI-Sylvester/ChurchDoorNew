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
    
    // Check if approved
    if (!user.is_approved) {
      return res.status(403).json({ message: 'Your account is pending admin approval' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        isAdmin: user.is_admin,
        anbiyam: user.anbiyam,
        familyId: user.family_id
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    console.log('Login successful for:', username);
    res.json({ 
      token, 
      role: user.role,
      isAdmin: user.is_admin, 
      username: user.username,
      anbiyam: user.anbiyam,
      familyId: user.family_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Register route
router.post('/register', async (req, res) => {
  const { username, password, email, mobile, anbiyam, role, family_id } = req.body;

  try {
    // Basic validation for role to prevent arbitrary 'admin' registration
    const targetRole = (role === 'incharge' || role === 'family') ? role : 'family';

    // Check if user already exists
    const userCheck = await query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into DB
    await query(
      'INSERT INTO users (username, password, email, mobile, anbiyam, role, family_id, is_approved, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [username, hashedPassword, email, mobile, anbiyam, targetRole, family_id, false, false]
    );

    res.status(201).json({ message: 'Registration successful! Please wait for admin approval.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;