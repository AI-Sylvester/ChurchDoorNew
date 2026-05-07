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
    // If it's the user's own family, we allow seeing it even if inactive/pending
    const isOwnFamily = user.family_id === familyId;
    const activeCondition = (activeOnly && !isOwnFamily) ? "AND active = true" : "";
    
    let queryStr = `SELECT * FROM families WHERE family_id = $1 ${activeCondition}`;
    const values = [familyId];

    // Restrict by anbiyam for non-admins, unless it's their own family
    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam && !isOwnFamily) {
      queryStr += " AND anbiyam = $2";
      values.push(user.anbiyam);
    }

    const result = await db.query(queryStr, values);
    return result.rows[0];
  }

  static async updateFamily(familyId, updateData, hasNewPic) {
    // ... update logic (no changes needed for visibility restriction, 
    // but usually you'd check if user has permission to update this specific family)
    // For now, let's assume the frontend only allows editing visible families.
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
      old_card_number = $17,
      verification_status = $18
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
      updateData.verification_status || 'approved'
    ];

    if (hasNewPic) {
      setClause += ', family_pic = $19';
      values.push(updateData.family_pic);
      values.push(familyId); // $20
    } else {
      values.push(familyId); // $19
    }

    const familyIdPlaceholder = hasNewPic ? '$20' : '$19';

    const query = `
      UPDATE families SET
      ${setClause}
      WHERE family_id = ${familyIdPlaceholder}
      RETURNING *
    `;

    const result = await db.query(query, values);
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
