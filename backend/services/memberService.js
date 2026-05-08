const db = require('../db');
const moment = require('moment');

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

// Helper: sanitize dates to 'YYYY-MM-DD' or null
const sanitizeDate = (val) => {
  if (!val) return null;
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    const year = d.getUTCFullYear();
    if (year > 2100 || year < 1900) return null;
    return d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  } catch (err) {
    return null;
  }
};

class MemberService {
  static async addMember(memberData, user = {}) {
    const familyRes = await db.query(
      'SELECT id, head_name, mobile_number FROM families WHERE family_id = $1',
      [memberData.family_id]
    );

    if (familyRes.rows.length === 0) {
      throw new Error('Family not found');
    }

    const familyDbId = familyRes.rows[0].id;
    const countRes = await db.query('SELECT COUNT(*) FROM members WHERE family_id = $1', [familyDbId]);
    const memberCount = parseInt(countRes.rows[0].count) + 1;
    const memberSuffix = memberCount.toString().padStart(2, '0');
    const memberId = `${memberData.family_id}-${memberSuffix}`;

    const age = calculateAge(memberData.dob);
    const verification_status = (user.role === 'admin' || user.isAdmin) ? 'approved' : 'pending_incharge';

    const result = await db.query(
      `INSERT INTO members (
        family_id, member_id, name, age, dob, marital_status, relationship,
        qualification, profession, residing_here, church_group, active,
        baptism_date, baptism_place, holy_communion_date, holy_communion_place,
        confirmation_date, confirmation_place, marriage_date, marriage_place,
        sex, mobile, verification_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19, $20,
        $21, $22, $23
      ) RETURNING *`,
      [
        familyDbId, memberId, memberData.name, age, memberData.dob || null,
        memberData.marital_status || null, memberData.relationship || null,
        memberData.qualification || null, memberData.profession || null,
        memberData.residing_here !== undefined ? memberData.residing_here : true,
        memberData.church_group || null, memberData.active !== undefined ? memberData.active : true,
        memberData.baptism_date || null, memberData.baptism_place || null,
        memberData.holy_communion_date || null, memberData.holy_communion_place || null,
        memberData.confirmation_date || null, memberData.confirmation_place || null,
        memberData.marriage_date || null, memberData.marriage_place || null,
        memberData.sex || null, memberData.mobile || null,
        verification_status
      ]
    );

    return result.rows[0];
  }

  static async getAllMembers(page = 1, limit = 50, search = '', user = {}) {
    const offset = (page - 1) * limit;
    const values = [user.isAdmin || false, user.role || '', user.userId || null];
    let queryStr = `
       SELECT m.*, f.head_name as family_head_name, f.address_line2
       FROM members m
       JOIN families f ON (f.family_id = SPLIT_PART(m.member_id, '-', 1))
       WHERE (f.active = true OR $1 = true OR $2 = 'incharge')
         AND (m.verification_status = 'approved' OR $1 = true OR $2 = 'incharge' OR f.created_by = $3)`;

    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam) {
      queryStr += " AND f.anbiyam = $" + (values.length + 1);
      values.push(user.anbiyam);
    }

    if (search) {
      queryStr += ` AND (m.name ILIKE $${values.length + 1} OR m.member_id ILIKE $${values.length + 1} OR m.mobile ILIKE $${values.length + 1})`;
      values.push(`%${search}%`);
    }

    queryStr += ` ORDER BY m.member_id LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await db.query(queryStr, values);

    let countQuery = `
       SELECT COUNT(*) 
       FROM members m
       JOIN families f ON m.family_id = f.id
       WHERE (f.active = true OR $1 = true OR $2 = 'incharge')`;
    const countValues = [user.isAdmin || false, user.role || ''];
    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam) {
      countQuery += " AND f.anbiyam = $3";
      countValues.push(user.anbiyam);
    }
    if (search) {
      countQuery += ` AND (m.name ILIKE $${countValues.length + 1} OR m.member_id ILIKE $${countValues.length + 1} OR m.mobile ILIKE $${countValues.length + 1})`;
      countValues.push(`%${search}%`);
    }
    const countResult = await db.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      members: result.rows,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page, 10)
    };
  }

  static async getMembersByFamilyId(familyId, user = {}) {
    const values = [familyId, user.isAdmin || false, user.role || '', user.userId || null];
    let queryStr = `
       SELECT m.*
       FROM members m
       JOIN families f ON (f.family_id = SPLIT_PART(m.member_id, '-', 1))
       WHERE f.family_id = $1 
         AND (f.active = true OR $2 = true OR $3 = 'incharge' OR $3 = 'admin' OR f.created_by = $4)
         AND (m.verification_status = 'approved' OR $2 = true OR $3 = 'incharge' OR $3 = 'admin' OR f.created_by = $4)`;

    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam) {
      values.push(user.anbiyam);
      queryStr += ` AND f.anbiyam = $${values.length}`;
    }

    queryStr += " ORDER BY m.member_id";
    const result = await db.query(queryStr, values);
    return result.rows;
  }

  static async updateMember(memberId, updateData) {
    // Permission check usually happens in controller
    const fields = [
      'name', 'age', 'dob', 'marital_status', 'relationship',
      'qualification', 'profession', 'residing_here', 'church_group', 'active',
      'baptism_date', 'baptism_place', 'holy_communion_date', 'holy_communion_place',
      'confirmation_date', 'confirmation_place', 'marriage_date', 'marriage_place',
      'sex', 'mobile', 'verification_status'
    ];

    const filteredFields = fields.filter(field => updateData[field] !== undefined);
    
    if (filteredFields.length === 0) {
        throw new Error('No valid fields provided for update');
    }

    const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);
    const values = filteredFields.map(field => {
      const value = updateData[field];
      if (field.endsWith('_date') || field === 'dob') {
        return sanitizeDate(value);
      }
      return value;
    });

    const query = `UPDATE members SET ${updates.join(', ')} WHERE member_id = $1 RETURNING *`;
    const result = await db.query(query, [memberId, ...values]);

    return result.rows[0];
  }

  static async getMemberStats(user = {}) {
    let queryStr = `
      SELECT COUNT(*) FROM members
      WHERE family_id IN (SELECT id FROM families WHERE active = true`;
    const values = [];

    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam) {
      queryStr += " AND anbiyam = $1";
      values.push(user.anbiyam);
    }
    queryStr += ")";

    const result = await db.query(queryStr, values);
    return parseInt(result.rows[0].count, 10);
  }

  static async getMembersByAnbiyam(anbiyam) {
    const result = await db.query(
      `SELECT m.*
       FROM members m
       JOIN families f ON m.family_id = f.id
       WHERE f.anbiyam = $1 AND f.active = true
       ORDER BY m.member_id`,
      [anbiyam]
    );
    return result.rows;
  }

  static async getGenderStats(user = {}) {
    let queryStr = `
      SELECT
        COUNT(*) FILTER (WHERE sex = 'Male') AS male_count,
        COUNT(*) FILTER (WHERE sex = 'Female') AS female_count
      FROM members
      WHERE family_id IN (SELECT id FROM families WHERE active = true`;
    const values = [];

    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam) {
      queryStr += " AND anbiyam = $1";
      values.push(user.anbiyam);
    }
    queryStr += ")";

    const result = await db.query(queryStr, values);
    return result.rows[0];
  }

  static async getAgeGroupStats(user = {}) {
    let queryStr = `
      SELECT
        COUNT(*) FILTER (WHERE age < 16) AS child_count,
        COUNT(*) FILTER (WHERE age >= 16 AND age < 28 AND marital_status = 'Single') AS youth_count,
        COUNT(*) FILTER (WHERE age >= 55) AS senior_citizen_count
      FROM members
      WHERE family_id IN (SELECT id FROM families WHERE active = true`;
    const values = [];

    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam) {
      queryStr += " AND anbiyam = $1";
      values.push(user.anbiyam);
    }
    queryStr += ")";

    const result = await db.query(queryStr, values);
    return result.rows[0];
  }

  static async getBirthdayReminders(user = {}) {
    let queryStr = `
      SELECT 
        m.member_id, m.name, m.dob, m.mobile, m.relationship,
        f.head_name, f.anbiyam
      FROM members m
      JOIN families f ON m.family_id = f.id
      WHERE f.active = true
        AND m.dob IS NOT NULL`;
    const values = [];

    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam) {
      queryStr += " AND f.anbiyam = $1";
      values.push(user.anbiyam);
    }

    const result = await db.query(queryStr, values);

    const today = moment().format('MM-DD');
    const startOfWeek = moment().startOf('week').format('MM-DD');
    const endOfWeek = moment().endOf('week').format('MM-DD');
    const currentMonth = moment().format('MM');

    const todayList = [];
    const thisWeekList = [];
    const thisMonthList = [];

    result.rows.forEach(member => {
      const dob = moment(member.dob);
      if (!dob.isValid()) return;

      const dobMonthDay = dob.format('MM-DD');
      const dobMonth = dob.format('MM');

      if (dobMonthDay === today) {
        todayList.push(member);
      }

      if (
        moment(dobMonthDay, 'MM-DD').isBetween(
          moment(startOfWeek, 'MM-DD').subtract(1, 'day'),
          moment(endOfWeek, 'MM-DD').add(1, 'day')
        )
      ) {
        thisWeekList.push(member);
      }

      if (dobMonth === currentMonth) {
        thisMonthList.push(member);
      }
    });

    return {
      today: todayList,
      thisWeek: thisWeekList,
      thisMonth: thisMonthList,
    };
  }

  static async getWeddingReminders(user = {}) {
    let queryStr = `
      SELECT 
        m.member_id, m.name, m.marriage_date, m.mobile, m.relationship,
        f.head_name, f.anbiyam
      FROM members m
      JOIN families f ON m.family_id = f.id
      WHERE f.active = true
        AND m.marriage_date IS NOT NULL`;
    const values = [];

    if (!user.isAdmin && user.role !== 'admin' && user.anbiyam) {
      queryStr += " AND f.anbiyam = $1";
      values.push(user.anbiyam);
    }

    const result = await db.query(queryStr, values);

    const today = moment().format('MM-DD');
    const startOfWeek = moment().startOf('week').format('MM-DD');
    const endOfWeek = moment().endOf('week').format('MM-DD');
    const currentMonth = moment().format('MM');

    const todayList = [];
    const thisWeekList = [];
    const thisMonthList = [];

    result.rows.forEach(member => {
      const marriageDate = moment(member.marriage_date);
      if (!marriageDate.isValid()) return;

      const marriageMonthDay = marriageDate.format('MM-DD');
      const marriageMonth = marriageDate.format('MM');

      if (marriageMonthDay === today) {
        todayList.push(member);
      }

      if (
        moment(marriageMonthDay, 'MM-DD').isBetween(
          moment(startOfWeek, 'MM-DD').subtract(1, 'day'),
          moment(endOfWeek, 'MM-DD').add(1, 'day')
        )
      ) {
        thisWeekList.push(member);
      }

      if (marriageMonth === currentMonth) {
        thisMonthList.push(member);
      }
    });

    return {
      today: todayList,
      thisWeek: thisWeekList,
      thisMonth: thisMonthList,
    };
  }
}

module.exports = MemberService;
