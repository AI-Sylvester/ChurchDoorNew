const express = require('express');
const router = express.Router();
const { query } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get all users
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await query('SELECT id, username, email, mobile, anbiyam, is_approved, is_admin FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Approve user
router.put('/approve/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query('UPDATE users SET is_approved = TRUE WHERE id = $1', [id]);
    res.json({ message: 'User approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving user' });
  }
});

// Restrict user (Unapprove)
router.put('/restrict/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query('UPDATE users SET is_approved = FALSE WHERE id = $1', [id]);
    res.json({ message: 'User restricted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error restricting user' });
  }
});

// Toggle Admin status
router.put('/toggle-admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;
  try {
    await query('UPDATE users SET is_admin = $1 WHERE id = $2', [isAdmin, id]);
    res.json({ message: `Admin status ${isAdmin ? 'granted' : 'revoked'}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating admin status' });
  }
});

// Delete user
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;
