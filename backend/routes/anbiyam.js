const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your db
const authMiddleware = require('../middleware/authMiddleware');

// GET all anbiyams
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, serial_no FROM anbiyam ORDER BY serial_no');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching anbiyam list:', err);
    res.status(500).json({ message: 'Failed to fetch anbiyam list' });
  }
});

// POST create new anbiyam
router.post('/', authMiddleware, async (req, res) => {
  const { name, serial_no } = req.body;

  if (!name || serial_no == null) {
    return res.status(400).json({ message: 'Name and serial_no are required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO anbiyam (name, serial_no) VALUES ($1, $2) RETURNING *',
      [name, serial_no]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating anbiyam:', err);
    res.status(500).json({ message: 'Failed to create anbiyam' });
  }
});

// PUT update anbiyam
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, serial_no } = req.body;

  try {
    const result = await db.query(
      'UPDATE anbiyam SET name = $1, serial_no = $2 WHERE id = $3 RETURNING *',
      [name, serial_no, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Anbiyam not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating anbiyam:', err);
    res.status(500).json({ message: 'Failed to update anbiyam' });
  }
});

// DELETE anbiyam
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM anbiyam WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Anbiyam not found' });
    }

    res.json({ message: 'Anbiyam deleted successfully' });
  } catch (err) {
    console.error('Error deleting anbiyam:', err);
    res.status(500).json({ message: 'Failed to delete anbiyam' });
  }
});

// GET: Total Anbiyam count
router.get('/stats/count', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) FROM anbiyam');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Error fetching anbiyam count:', err);
    res.status(500).json({ message: 'Failed to fetch anbiyam count' });
  }
});
module.exports = router;