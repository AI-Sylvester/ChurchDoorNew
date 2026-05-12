const db = require('../db');
const AppError = require('../utils/AppError');

exports.getMyGroupFamilies = async (req, res, next) => {
  try {
    const { anbiyam } = req.user;
    if (!anbiyam) {
      return next(new AppError('No Anbiyam assigned to this incharge', 404));
    }

    const result = await db.query(
      'SELECT * FROM families WHERE anbiyam = $1 AND active = true ORDER BY head_name ASC',
      [anbiyam]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch group families', 500));
  }
};

exports.submitReport = async (req, res, next) => {
  try {
    const { anbiyam, userId } = req.user;
    const { event_name, event_date, description } = req.body;

    if (!anbiyam) {
      return next(new AppError('No Anbiyam assigned to this incharge', 403));
    }

    const result = await db.query(
      'INSERT INTO event_reports (anbiyam, event_name, event_date, description, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [anbiyam, event_name, event_date, description, userId]
    );

    res.status(201).json({
      message: 'Event report submitted successfully',
      report: result.rows[0]
    });
  } catch (error) {
    next(new AppError('Failed to submit event report', 500));
  }
};

exports.recommendApproval = async (req, res, next) => {
  try {
    const { familyId } = req.params;
    const { anbiyam } = req.user;

    // Verify the family belongs to the incharge's anbiyam
    const check = await db.query('SELECT anbiyam FROM families WHERE family_id = $1', [familyId]);
    if (check.rows.length === 0 || check.rows[0].anbiyam !== anbiyam) {
      return next(new AppError('Unauthorized: Family not in your group', 403));
    }

    // Mark as "recommended" for Admin approval
    await db.query(
      'UPDATE families SET verification_status = \'recommended\', verified_by = $2, verified_at = CURRENT_TIMESTAMP WHERE family_id = $1',
      [familyId, req.user.userId]
    );

    res.status(200).json({ message: 'Family details verified and recommended to Admin for approval' });
  } catch (error) {
    next(new AppError('Failed to recommend approval', 500));
  }
};

exports.getPendingVerifications = async (req, res, next) => {
  try {
    const { anbiyam } = req.user;
    const result = await db.query(
      `SELECT f.*, u.username as creator_name, f.created_at as entry_date
       FROM families f 
       LEFT JOIN users u ON f.created_by = u.id
       WHERE f.anbiyam = $1 AND f.verification_status = 'pending_incharge' AND f.active = false 
       ORDER BY f.head_name ASC`,
      [anbiyam]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch pending verifications', 500));
  }
};

exports.recommendMemberApproval = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const { anbiyam, userId } = req.user;

    // Verify the member belongs to a family in the incharge's anbiyam
    const check = await db.query(
      "SELECT f.anbiyam FROM members m JOIN families f ON f.id = m.family_id WHERE m.member_id = $1",
      [memberId]
    );
    if (check.rows.length === 0 || check.rows[0].anbiyam !== anbiyam) {
      return next(new AppError('Unauthorized: Member not in your group', 403));
    }

    // Mark as "recommended" for Admin approval
    await db.query(
      "UPDATE members SET verification_status = 'recommended', verified_by = $2, verified_at = CURRENT_TIMESTAMP WHERE member_id = $1",
      [memberId, userId]
    );

    res.status(200).json({ message: 'Member verified and recommended to Admin for approval' });
  } catch (error) {
    next(new AppError('Failed to recommend member approval', 500));
  }
};

exports.getPendingMemberVerifications = async (req, res, next) => {
  try {
    const { anbiyam } = req.user;
    const result = await db.query(
      `SELECT m.*, 
               f.head_name as family_head, 
               COALESCE(f.address_line1, 'NO_ADDR') as address_line1, 
               COALESCE(f.address_line2, '') as address_line2, 
               COALESCE(f.city, 'NO_CITY') as city,
               u.username as creator_name,
               m.created_at as entry_date
        FROM members m 
        JOIN families f ON f.id = m.family_id 
        LEFT JOIN users u ON m.created_by = u.id
        WHERE f.anbiyam = $1 AND m.verification_status = 'pending_incharge' 
        ORDER BY m.name ASC`,
      [anbiyam]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch pending member verifications', 500));
  }
};

exports.getGroupUpdateRequests = async (req, res, next) => {
  try {
    const { anbiyam } = req.user;
    const result = await db.query(
      "SELECT ur.*, f.head_name FROM update_requests ur JOIN families f ON ur.family_id = f.family_id WHERE f.anbiyam = $1 AND ur.status = 'pending' AND ur.verified_by_incharge = false ORDER BY ur.created_at DESC",
      [anbiyam]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch group update requests', 500));
  }
};

exports.verifyUpdateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { anbiyam, userId } = req.user;

    // Check if the request belongs to a family in this incharge's group
    const check = await db.query(
      "SELECT f.anbiyam FROM update_requests ur JOIN families f ON ur.family_id = f.family_id WHERE ur.id = $1",
      [id]
    );

    if (check.rows.length === 0 || check.rows[0].anbiyam !== anbiyam) {
      return next(new AppError('Unauthorized: Request not in your group', 403));
    }

    await db.query("UPDATE update_requests SET verified_by_incharge = true, verified_by = $2, verified_at = CURRENT_TIMESTAMP WHERE id = $1", [id, userId]);
    res.status(200).json({ message: 'Update request verified and forwarded to Admin' });
  } catch (error) {
    next(new AppError('Failed to verify update request', 500));
  }
};

exports.getPendingUserVerifications = async (req, res, next) => {
  try {
    const { anbiyam } = req.user;
    const result = await db.query(
      "SELECT u.id, u.username, u.email, u.mobile, u.role, u.family_id, u.verification_status, f.head_name as family_head, f.address_line1, f.address_line2, f.city FROM users u LEFT JOIN families f ON u.family_id = f.family_id WHERE u.anbiyam = $1 AND u.verification_status = 'pending_incharge' AND u.is_approved = false ORDER BY u.username ASC",
      [anbiyam]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch pending user verifications', 500));
  }
};

exports.recommendUserApproval = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { anbiyam } = req.user;

    // Verify the user belongs to the incharge's anbiyam
    const check = await db.query('SELECT anbiyam FROM users WHERE id = $1', [userId]);
    if (check.rows.length === 0 || check.rows[0].anbiyam !== anbiyam) {
      return next(new AppError('Unauthorized: User not in your group', 403));
    }

    await db.query(
      "UPDATE users SET verification_status = 'recommended', verified_by = $2, verified_at = CURRENT_TIMESTAMP WHERE id = $1",
      [userId, req.user.userId]
    );

    res.status(200).json({ message: 'User registration verified and recommended to Admin' });
  } catch (error) {
    next(new AppError('Failed to verify user registration', 500));
  }
};

