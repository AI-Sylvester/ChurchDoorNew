const db = require('../db');
const AppError = require('../utils/AppError');

exports.getPendingUsers = async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT id, username, email, mobile, anbiyam, role, family_id FROM users WHERE is_approved = false AND role != 'admin' ORDER BY id DESC"
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
    const result = await db.query(
      "SELECT * FROM families WHERE active = false AND (verification_status = 'recommended' OR verification_status = 'pending_incharge') ORDER BY verification_status ASC, head_name ASC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch pending families', 500));
  }
};
