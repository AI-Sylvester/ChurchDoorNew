const db = require('../db');

class FamilyService {
  static async getActiveFamilyIds() {
    const result = await db.query('SELECT family_id FROM families WHERE active = true');
    return result.rows.map(row => row.family_id);
  }

  static async getNextFamilyId() {
    const idRes = await db.query(`SELECT nextval('family_id_seq') AS next_id`);
    const nextId = idRes.rows[0].next_id;
    return `FAM${String(nextId).padStart(7, '0')}`;
  }

  static async createFamily(familyData) {
    const {
      newFamilyId, createdBy, head_name, address_line1, address_line2, city,
      pincode, mobile_number, mobile_number2, cemetery, native,
      resident_from, house_type, subscription, active, location,
      anbiyam, family_pic_filename, cemetery_number, old_card_number
    } = familyData;

    const verification_status = familyData.role === 'admin' ? 'approved' : 'pending_incharge';

    const result = await db.query(`
      INSERT INTO families (
        family_id, created_by, head_name, address_line1, address_line2, city,
        pincode, mobile_number, mobile_number2, cemetery, native,
        resident_from, house_type, subscription, active, location,
        anbiyam, family_pic, cemetery_number, old_card_number, verification_status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21
      ) RETURNING *`,
      [
        newFamilyId, createdBy, head_name, address_line1, address_line2, city,
        pincode, mobile_number, mobile_number2, cemetery, native,
        resident_from, house_type, subscription, active, location,
        anbiyam, family_pic_filename, cemetery_number, old_card_number, verification_status
      ]
    );

    // If the creator is a 'family' user, link them to this family automatically
    if (familyData.role === 'family') {
      await db.query('UPDATE users SET family_id = $1 WHERE id = $2', [newFamilyId, createdBy]);
    }

    return result.rows[0];
  }

  static async getActiveFamilies(page = 1, limit = 50, search = '', user = {}) {
    const offset = (page - 1) * limit;
    const isAdminOrIncharge = user.isAdmin || user.role === 'admin' || user.role === 'incharge';
    let queryStr = "SELECT * FROM families WHERE active = true";
    if (!isAdminOrIncharge) {
      queryStr += " AND verification_status = 'approved'";
    }
    const values = [];

    if (!isAdminOrIncharge && user.anbiyam) {
      queryStr += " AND anbiyam = $" + (values.length + 1);
      values.push(user.anbiyam);
    }

    if (search) {
      queryStr += ` AND (head_name ILIKE $${values.length + 1} OR city ILIKE $${values.length + 1} OR mobile_number ILIKE $${values.length + 1} OR family_id ILIKE $${values.length + 1})`;
      values.push(`%${search}%`);
    }

    queryStr += ` ORDER BY LOWER(head_name) ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    console.log('Executing query:', queryStr, values);
    values.push(limit, offset);

    const result = await db.query(queryStr, values);

    let countQuery = "SELECT COUNT(*) FROM families WHERE active = true";
    if (!isAdminOrIncharge) {
      countQuery += " AND verification_status = 'approved'";
    }
    const countValues = [];
    if (!isAdminOrIncharge && user.anbiyam) {
      countQuery += " AND anbiyam = $1";
      countValues.push(user.anbiyam);
    }
    if (search) {
      countQuery += ` AND (head_name ILIKE $${countValues.length + 1} OR city ILIKE $${countValues.length + 1} OR mobile_number ILIKE $${countValues.length + 1} OR family_id ILIKE $${countValues.length + 1})`;
      countValues.push(`%${search}%`);
    }
    const countResult = await db.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      families: result.rows,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page, 10)
    };
  }

  static async getInactiveFamilies(page = 1, limit = 50, search = '', user = {}) {
    const offset = (page - 1) * limit;
    const isAdminOrIncharge = user.isAdmin || user.role === 'admin' || user.role === 'incharge';
    
    // Inactive list should show:
    // 1. Approved but inactive (active=false)
    // 2. Recommended (vetted by incharge)
    // 3. Pending Incharge (newly registered)
    let queryStr = "SELECT * FROM families WHERE (active = false OR verification_status != 'approved')";
    const values = [];

    if (!isAdminOrIncharge && user.anbiyam) {
      // Regular users shouldn't really see inactive list unless it's their own, 
      // but if they do, restrict by anbiyam
      queryStr += " AND anbiyam = $" + (values.length + 1);
      values.push(user.anbiyam);
    } else if (user.role === 'incharge' && user.anbiyam) {
      // Incharge only see their own anbiyam's pending/vetted
      queryStr += " AND anbiyam = $" + (values.length + 1);
      values.push(user.anbiyam);
    }

    if (search) {
      queryStr += ` AND (head_name ILIKE $${values.length + 1} OR city ILIKE $${values.length + 1} OR mobile_number ILIKE $${values.length + 1} OR family_id ILIKE $${values.length + 1})`;
      values.push(`%${search}%`);
    }

    queryStr += ` ORDER BY LOWER(head_name) ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await db.query(queryStr, values);

    let countQuery = "SELECT COUNT(*) FROM families WHERE (active = false OR verification_status != 'approved')";
    const countValues = [];
    if (user.role === 'incharge' && user.anbiyam) {
      countQuery += " AND anbiyam = $1";
      countValues.push(user.anbiyam);
    }
    if (search) {
      countQuery += ` AND (head_name ILIKE $${countValues.length + 1} OR city ILIKE $${countValues.length + 1} OR mobile_number ILIKE $${countValues.length + 1} OR family_id ILIKE $${countValues.length + 1})`;
      countValues.push(`%${search}%`);
    }
    const countResult = await db.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      families: result.rows,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page, 10)
    };
  }

  static async getFamilyById(familyId, activeOnly = true, user = {}) {
    // We allow seeing the family if:
    // 1. It matches the familyId in the user's token
    // 2. The user is the one who created this family record (handles stale tokens)
    const isOwnFamily = user.familyId === familyId;
    
    let queryStr = `
      SELECT f.*, 
             f.head_name,
             f.mobile_number,
             COALESCE(f.address_line1, 'NO_ADDR') as address_line1,
             COALESCE(f.city, 'NO_CITY') as city,
             u.username as registered_by
      FROM families f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE f.family_id = $1`;
    const values = [familyId];
    const result = await db.query(queryStr, values);
    
    if (result.rows.length === 0) return null;
    const family = result.rows[0];

    const isCreator = user.userId === family.created_by;
    const canSeeInactive = isOwnFamily || isCreator || user.isAdmin || user.role === 'incharge' || user.role === 'admin';

    if (activeOnly && !family.active && !canSeeInactive) {
      return null;
    }

    // Restrict by anbiyam for non-admins, unless it's their own/created family
    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam && !isOwnFamily && !isCreator) {
      if (family.anbiyam !== user.anbiyam) return null;
    }

    return family;
  }

  static async updateFamily(familyId, updateData, hasNewPic) {
    const fields = [
      'head_name', 'address_line1', 'address_line2', 'city', 'pincode',
      'mobile_number', 'mobile_number2', 'cemetery', 'native',
      'resident_from', 'house_type', 'subscription', 'active', 'location',
      'anbiyam', 'cemetery_number', 'old_card_number', 'verification_status', 'card_number',
      'approved_by', 'approved_at'
    ];

    // Approval Audit & Card Number Generation
    if (updateData.active === true && updateData.verification_status === 'approved') {
      updateData.approved_at = new Date();
      // approved_by should be passed from the controller in updateData
      
      const currentFamilyRes = await db.query('SELECT anbiyam, card_number FROM families WHERE family_id = $1', [familyId]);
      const currentFamily = currentFamilyRes.rows[0];

      if (currentFamily && !currentFamily.card_number && !updateData.card_number) {
        const anbiyam = updateData.anbiyam || currentFamily.anbiyam;
        if (anbiyam) {
          const seqRes = await db.query(
            "SELECT card_number FROM families WHERE anbiyam = $1 AND card_number LIKE $2",
            [anbiyam, `${anbiyam} - %`]
          );

          let maxSeq = 0;
          seqRes.rows.forEach(row => {
            const parts = row.card_number.split(' - ');
            if (parts.length === 2) {
              const seq = parseInt(parts[1], 10);
              if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
            }
          });

          updateData.card_number = `${anbiyam} - ${maxSeq + 1}`;
        }
      }
    }

    const filteredFields = fields.filter(field => updateData[field] !== undefined);
    
    if (filteredFields.length === 0 && !hasNewPic) {
        throw new Error('No valid fields provided for update');
    }

    let updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);
    let values = filteredFields.map(field => updateData[field]);

    if (hasNewPic) {
      updates.push(`family_pic = $${values.length + 2}`);
      values.push(updateData.family_pic);
    }

    const query = `UPDATE families SET ${updates.join(', ')} WHERE family_id = $1 RETURNING *`;
    const result = await db.query(query, [familyId, ...values]);

    return result.rows[0];
  }

  static async getFamiliesByAnbiyam(anbiyam) {
    const result = await db.query(
      `SELECT * FROM families WHERE anbiyam = $1 ORDER BY LOWER(head_name) ASC`,
      [anbiyam]
    );
    return result.rows;
  }

  static async getActiveFamilyCount(user = {}) {
    let queryStr = 'SELECT COUNT(*) FROM families WHERE active = true';
    const values = [];

    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam) {
      queryStr += " AND anbiyam = $1";
      values.push(user.anbiyam);
    }

    const result = await db.query(queryStr, values);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = FamilyService;
