const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const util = require('util');
const renameFile = util.promisify(fs.rename);
const cloudinary = require('../utils/Cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// Setup multer for image upload with temporary filename
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'families', // Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => 'temp-' + Date.now(),
  },
});
const upload = multer({ storage });
// Utility to generate unique Family ID
const generateFamilyId = (num) => 'FAM' + num.toString().padStart(7, '0');
router.get('/ids', authMiddleware, async (req, res) => {
  try {
    console.log('GET /ids');
    console.log('Authenticated User ID:', req.user?.userId);

    // Fetch only active family IDs
    const result = await db.query(
      'SELECT family_id FROM families WHERE active = true'
    );

    const familyIds = result.rows.map(row => row.family_id);

    res.status(200).json(familyIds);
  } catch (error) {
    console.error('Failed to fetch family IDs:', error.message);
    res.status(500).json({
      message: 'Failed to fetch family IDs',
      error: error.message
    });
  }
});
router.post('/create', authMiddleware, upload.single('family_pic'), async (req, res) => {
  const {
    head_name, address_line1, address_line2, city, pincode,
    mobile_number, mobile_number2, cemetery, native,
    resident_from, house_type, subscription, active, location,
    anbiyam, cemetery_number, old_card_number
  } = req.body;

  const createdBy = req.user.userId;

  try {
    // ✅ 1. Get next family ID from the sequence
    const idRes = await db.query(`SELECT nextval('family_id_seq') AS next_id`);
    const nextId = idRes.rows[0].next_id;
    const newFamilyId = `FAM${String(nextId).padStart(7, '0')}`;  // FAM0000001 format

    // ✅ 2. If image uploaded, rename file
let family_pic_filename = '';
if (req.file && req.file.path) {
  family_pic_filename = req.file.path; // Cloudinary auto generates a URL
}


    // ✅ 3. Insert new family record
    const result = await db.query(`
      INSERT INTO families (
        family_id, created_by, head_name, address_line1, address_line2, city,
        pincode, mobile_number, mobile_number2, cemetery, native,
        resident_from, house_type, subscription, active, location,
        anbiyam, family_pic, cemetery_number, old_card_number
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20
      ) RETURNING *`,
      [
        newFamilyId, createdBy, head_name, address_line1, address_line2, city,
        pincode, mobile_number, mobile_number2, cemetery, native,
        resident_from, house_type, subscription, active === 'true', location,
        anbiyam, family_pic_filename, cemetery_number, old_card_number
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Family creation error:', error.message);
    res.status(500).json({ message: 'Failed to create family' });
  }
});

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM families WHERE active = true ORDER BY family_id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch families' });
  }
});
router.get('/list-inactive', authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM families WHERE active = false ORDER BY family_id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch inactive families' });
  }
});

router.get('/:familyId', authMiddleware, async (req, res) => {
  const { familyId } = req.params;

  try {
   const result = await db.query(
  `SELECT 
    family_id,
     head_name,
     address_line1,
     address_line2,
     city,
     pincode,
     mobile_number,
     mobile_number2,
     cemetery,
     native,
     resident_from,
     house_type,
     subscription,
     anbiyam,
     family_pic,
     cemetery_number,
     old_card_number,
     active,
     location
   FROM families WHERE family_id = $1 AND active = true`,
  [familyId]
);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Family not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching family:', err);
    res.status(500).json({ message: 'Failed to fetch family details' });
  }
});
router.put('/:familyId', authMiddleware, upload.single('family_pic'), async (req, res) => {
  const { familyId } = req.params;
  const updateData = req.body;
if (req.file) {
  updateData.family_pic = req.file.path; // Cloudinary provides full URL
}

  try {
    // Base update fields without family_pic
    let setClause = `
      head_name = $1,
      address_line1 = $2,
      address_line2 = $3,
      city = $4,
      pincode = $5,
      mobile_number = $6,
      mobile_number2 = $7,
      cemetery = $8,
      native = $9,
      resident_from = $10,
      house_type = $11,
      subscription = $12,
      active = $13,
      location = $14,
      anbiyam = $15,
      cemetery_number = $16,
      old_card_number = $17
    `;

    const values = [
      updateData.head_name,
      updateData.address_line1,
      updateData.address_line2,
      updateData.city,
      updateData.pincode,
      updateData.mobile_number,
      updateData.mobile_number2,
      updateData.cemetery,
      updateData.native,
      updateData.resident_from,
      updateData.house_type,
      updateData.subscription,
      updateData.active,
      updateData.location,
      updateData.anbiyam,
      updateData.cemetery_number,
      updateData.old_card_number,
    ];

   if (req.file) {
  setClause += ', family_pic = $18';
  values.push(updateData.family_pic);  // Cloudinary image URL
  values.push(familyId);               // $19
} else {
  values.push(familyId);               // $18
}
    const familyIdPlaceholder = req.file ? '$19' : '$18';

    const query = `
      UPDATE families SET
      ${setClause}
      WHERE family_id = ${familyIdPlaceholder}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Family not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update family' });
  }
});
// GET families filtered by anbiyam
router.get('/anbiyamfam/:anbiyam', authMiddleware, async (req, res) => {
  const { anbiyam } = req.params;

  if (!anbiyam) {
    return res.status(400).json({ error: 'Anbiyam name is required in path.' });
  }

  try {
    const result = await db.query(
      `SELECT * FROM families WHERE anbiyam = $1`,
      [anbiyam]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching families by Anbiyam:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/byFamilyId/:familyId', authMiddleware, async (req, res) => {
  const { familyId } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM families WHERE family_id = $1 AND active = true`,
      [familyId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Active family not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching family by family_id:', error);
    res.status(500).json({ message: 'Failed to fetch family' });
  }
});
router.get('/list-inactive/:familyId', authMiddleware, async (req, res) => {
  const { familyId } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM families WHERE family_id = $1 AND active = false`,
      [familyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inactive family not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching inactive family:', error);
    res.status(500).json({ message: 'Failed to fetch inactive family' });
  }
});

// GET /api/family/stats/families
router.get('/stats/families', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) FROM families WHERE active = true');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch family count' });
  }
});

module.exports = router;
