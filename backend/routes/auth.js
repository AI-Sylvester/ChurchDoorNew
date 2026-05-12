const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query }  = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // username here can be mobile or actual username
  console.log('Login attempt:', username);
  try {
    // Search by username OR mobile
    const userRes = await query('SELECT * FROM users WHERE username = $1 OR mobile = $1', [username]);
    
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
    console.log('Login successful for:', user.username);
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

    // Check if user already exists (Username, Mobile, or Email)
    const userCheck = await query('SELECT * FROM users WHERE username = $1 OR mobile = $2 OR email = $3', [username, mobile, email]);
    if (userCheck.rows.length > 0) {
      const existing = userCheck.rows[0];
      if (existing.mobile === mobile) return res.status(400).json({ message: 'Mobile number already registered' });
      if (existing.username === username) return res.status(400).json({ message: 'Username already exists' });
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into DB
    await query(
      'INSERT INTO users (username, password, email, mobile, anbiyam, role, family_id, is_approved, is_admin, verification_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [username, hashedPassword, email, mobile, anbiyam, targetRole, family_id, false, false, 'pending_incharge']
    );

    res.status(201).json({ message: 'Registration successful! Please wait for Incharge verification and Admin approval.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;