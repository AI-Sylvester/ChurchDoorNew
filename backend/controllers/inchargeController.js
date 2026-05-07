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
      'UPDATE families SET verification_status = \'recommended\' WHERE family_id = $1',
      [familyId]
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
      'SELECT * FROM families WHERE anbiyam = $1 AND verification_status = \'pending_incharge\' AND active = false ORDER BY head_name ASC',
      [anbiyam]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch pending verifications', 500));
  }
};
