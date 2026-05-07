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
        resident_from, house_type, subscription, active, location,
        anbiyam, family_pic_filename, cemetery_number, old_card_number
      ]
    );
    return result.rows[0];
  }

  static async getActiveFamilies(page = 1, limit = 50, search = '', user = {}) {
    const offset = (page - 1) * limit;
    let queryStr = "SELECT * FROM families WHERE active = true";
    const values = [];

    if (!user.isAdmin && user.anbiyam) {
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
    const countValues = [];
    if (!user.isAdmin && user.anbiyam) {
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
    let queryStr = "SELECT * FROM families WHERE active = false";
    const values = [];

    if (!user.isAdmin && user.anbiyam) {
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

    let countQuery = "SELECT COUNT(*) FROM families WHERE active = false";
    const countValues = [];
    if (!user.isAdmin && user.anbiyam) {
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
    const activeCondition = activeOnly ? "AND active = true" : "";
    let queryStr = `SELECT * FROM families WHERE family_id = $1 ${activeCondition}`;
    const values = [familyId];

    if (!user.isAdmin && user.anbiyam) {
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

    if (hasNewPic) {
      setClause += ', family_pic = $18';
      values.push(updateData.family_pic);
      values.push(familyId); // $19
    } else {
      values.push(familyId); // $18
    }

    const familyIdPlaceholder = hasNewPic ? '$19' : '$18';

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

    if (!user.isAdmin && user.anbiyam) {
      queryStr += " AND anbiyam = $1";
      values.push(user.anbiyam);
    }

    const result = await db.query(queryStr, values);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = FamilyService;
