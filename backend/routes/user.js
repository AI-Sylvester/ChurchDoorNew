const express = require('express');
const router = express.Router();
const { query } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get all users
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, u.username, u.email, u.mobile, u.anbiyam, u.role, u.is_approved, u.is_admin, u.family_id,
        f.head_name
      FROM users u
      LEFT JOIN families f ON u.family_id = f.family_id
      ORDER BY u.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Approve user
router.put('/approve/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query("UPDATE users SET is_approved = TRUE, verification_status = 'approved' WHERE id = $1", [id]);
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

// Update Role
router.put('/update-role/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    res.json({ message: `User role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user role' });
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
