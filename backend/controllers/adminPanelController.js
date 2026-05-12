const db = require('../db');
const AppError = require('../utils/AppError');

exports.getPendingUsers = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.email, u.mobile, u.anbiyam, u.role, u.family_id, u.verification_status, 
              f.head_name as family_head_name, 
              COALESCE(f.address_line1, 'NO_ADDR') as address_line1, 
              COALESCE(f.address_line2, '') as address_line2, 
              COALESCE(f.city, 'NO_CITY') as city 
       FROM users u 
       LEFT JOIN families f ON u.family_id = f.family_id 
       WHERE u.is_approved = false AND u.role != 'admin' 
       ORDER BY u.id DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch pending users', 500));
  }
};

exports.getUpdateRequests = async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT ur.*, f.head_name FROM update_requests ur JOIN families f ON ur.family_id = f.family_id WHERE ur.status = 'pending' AND ur.verified_by_incharge = true ORDER BY ur.created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch update requests', 500));
  }
};

exports.handleUpdateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (status === 'approved') {
      const requestRes = await db.query('SELECT * FROM update_requests WHERE id = $1', [id]);
      if (requestRes.rows.length === 0) return next(new AppError('Request not found', 404));
      
      const { family_id, requested_data } = requestRes.rows[0];
      const data = requested_data;

      // Update family table with new data
      // This part is complex because we need to map JSON keys to columns.
      // For simplicity, let's assume requested_data contains valid columns.
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      
      await db.query(`UPDATE families SET ${setClause} WHERE family_id = $${keys.length + 1}`, [...values, family_id]);
    }

    await db.query('UPDATE update_requests SET status = $1 WHERE id = $2', [status, id]);
    res.status(200).json({ message: `Update request ${status}` });
  } catch (error) {
    next(new AppError('Failed to handle update request', 500));
  }
};

exports.getEventReports = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT er.*, u.username as incharge_name FROM event_reports er JOIN users u ON er.created_by = u.id ORDER BY er.event_date DESC'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch event reports', 500));
  }
};

exports.getPendingFamilies = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT f.*, u.username as creator_name, v.username as verified_by_name 
      FROM families f 
      LEFT JOIN users u ON f.created_by = u.id 
      LEFT JOIN users v ON f.verified_by = v.id 
      WHERE f.active = false AND (f.verification_status = 'recommended' OR f.verification_status = 'pending_incharge') 
      ORDER BY f.verification_status DESC, f.head_name ASC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch pending families', 500));
  }
};

exports.getPendingMembers = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT m.*, 
              COALESCE(f.family_id, SPLIT_PART(m.member_id, '-', 1)) as family_string_id, 
              f.head_name as family_head_name, 
              COALESCE(f.anbiyam, u_fam.anbiyam, 'NO_ANB') as family_anbiyam, 
              COALESCE(f.address_line1, 'NO_ADDR') as family_address1, 
              COALESCE(f.address_line2, '') as family_address2, 
              COALESCE(f.city, 'NO_CITY') as family_city,
              COALESCE(f.mobile_number, u_fam.mobile, 'NO_MOBILE') as family_mobile,
              u_creator.username as creator_username,
              u_vettor.username as verified_by_name,
              m.created_at as entry_date,
              m.verified_at as verification_date
       FROM members m 
       LEFT JOIN families f ON f.id = m.family_id
       LEFT JOIN users u_creator ON m.created_by = u_creator.id
       LEFT JOIN users u_vettor ON m.verified_by = u_vettor.id
       LEFT JOIN LATERAL (
         SELECT username, anbiyam, mobile FROM users 
         WHERE family_id = SPLIT_PART(m.member_id, '-', 1) 
         LIMIT 1
       ) u_fam ON TRUE
       WHERE m.verification_status = 'pending_incharge' OR m.verification_status = 'recommended' 
       ORDER BY m.id DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch pending members', 500));
  }
};
