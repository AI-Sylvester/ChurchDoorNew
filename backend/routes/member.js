const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Utility to calculate age from DOB
const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

router.post('/add', authMiddleware, async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const familyRes = await db.query(
      'SELECT id, head_name, mobile_number FROM families WHERE family_id = $1',
      [req.body.family_id]
    );
    if (familyRes.rows.length === 0) {
      console.log('Family not found:', req.body.family_id);
      return res.status(404).json({ message: 'Family not found' });
    }

    const familyDbId = familyRes.rows[0].id;

    const countRes = await db.query('SELECT COUNT(*) FROM members WHERE family_id = $1', [familyDbId]);
    const memberCount = parseInt(countRes.rows[0].count) + 1;
    const memberSuffix = memberCount.toString().padStart(2, '0');
    const memberId = `${req.body.family_id}-${memberSuffix}`;

    // Calculate age from dob if dob provided
    const age = calculateAge(req.body.dob);

  const result = await db.query(
  `INSERT INTO members (
    family_id, member_id, name, age, dob, marital_status, relationship,
    qualification, profession, residing_here, church_group, active,
    baptism_date, baptism_place, holy_communion_date, holy_communion_place,
    confirmation_date, confirmation_place, marriage_date, marriage_place,
    sex, mobile
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7,
    $8, $9, $10, $11, $12,
    $13, $14, $15, $16,
    $17, $18, $19, $20,
    $21, $22
  ) RETURNING *`,
  [
    familyDbId,
    memberId,
    req.body.name,
    age,
    req.body.dob || null,
    req.body.marital_status || null,
    req.body.relationship || null,
    req.body.qualification || null,
    req.body.profession || null,
    req.body.residing_here !== undefined ? req.body.residing_here : true,
    req.body.church_group || null,
    req.body.active !== undefined ? req.body.active : true,
    req.body.baptism_date || null,
    req.body.baptism_place || null,          // <-- added here
    req.body.holy_communion_date || null,
    req.body.holy_communion_place || null,
    req.body.confirmation_date || null,
    req.body.confirmation_place || null,
    req.body.marriage_date || null,
    req.body.marriage_place || null,
    req.body.sex || null,
      req.body.mobile || null
  ]
);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Failed to add member' });
  }
});

router.get('/all', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*
       FROM members m
       JOIN families f ON m.family_id = f.id
       WHERE f.active = true
       ORDER BY m.member_id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all members error:', error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
});
router.get('/byFamily/:familyId', authMiddleware, async (req, res) => {
  const { familyId } = req.params;

  try {
    const membersRes = await db.query(
      `SELECT m.*
       FROM members m
       JOIN families f ON m.family_id = f.id
       WHERE f.family_id = $1
       ORDER BY m.member_id`,
      [familyId]
    );
    res.json(membersRes.rows);
  } catch (error) {
    console.error('Failed to get members:', error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
});
router.put('/:memberId', authMiddleware, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Define allowed fields
    const fields = [
      'name', 'age', 'dob', 'marital_status', 'relationship',
      'qualification', 'profession', 'residing_here', 'church_group', 'active',
      'baptism_date', 'baptism_place', 'holy_communion_date', 'holy_communion_place',
      'confirmation_date', 'confirmation_place', 'marriage_date', 'marriage_place',
      'sex', 'mobile'
    ];

    // Helper: sanitize dates to 'YYYY-MM-DD' or null
    const sanitizeDate = (val) => {
      if (!val) return null;
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return null;
        // Prevent out-of-range years (e.g. year > 2100 or < 1900)
        const year = d.getUTCFullYear();
        if (year > 2100 || year < 1900) return null;
        return d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      } catch (err) {
        return null;
      }
    };

    // Filter valid fields from req.body
    const filteredFields = fields.filter(field => req.body[field] !== undefined);

    const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

    const values = filteredFields.map(field => {
      const value = req.body[field];
      if (field.endsWith('_date') || field === 'dob') {
        return sanitizeDate(value);
      }
      return value;
    });

    // Log what's actually being updated
    console.log('>>> Updating member_id:', memberId);
    console.log('>>> Fields:', filteredFields);
    console.log('>>> Values:', values);

    const query = `UPDATE members SET ${updates.join(', ')} WHERE member_id = $1 RETURNING *`;
    const result = await db.query(query, [memberId, ...values]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ message: 'Failed to update member' });
  }
});
// GET /api/member/stats/members
router.get('/stats/members', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT COUNT(*) FROM members
      WHERE family_id IN (SELECT id FROM families WHERE active = true)
    `);
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch member count' });
  }
});

// GET /members/by-anbiyam/:anbiyam
router.get('/members/by-anbiyam/:anbiyam', authMiddleware, async (req, res) => {
  const { anbiyam } = req.params;

  if (!anbiyam) {
    return res.status(400).json({ error: 'Anbiyam name is required in path.' });
  }

  try {
    const result = await db.query(
      `SELECT m.*
       FROM members m
       JOIN families f ON m.family_id = f.id
       WHERE f.anbiyam = $1 AND f.active = true
       ORDER BY m.member_id`,
      [anbiyam]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching members by Anbiyam:', error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
});

module.exports = router;


