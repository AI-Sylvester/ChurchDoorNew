const db = require('../db');
const AppError = require('../utils/AppError');

exports.getMyFamily = async (req, res, next) => {
  try {
    const { familyId } = req.user;
    if (!familyId) {
      return next(new AppError('No family associated with this user', 404));
    }

    const familyResult = await db.query('SELECT * FROM families WHERE family_id = $1', [familyId]);
    if (familyResult.rows.length === 0) {
      return next(new AppError('Family not found', 404));
    }

    const membersResult = await db.query('SELECT * FROM members WHERE family_id = $1', [familyId]);
    
    res.status(200).json({
      family: familyResult.rows[0],
      members: membersResult.rows
    });
  } catch (error) {
    next(new AppError('Failed to fetch your family details', 500));
  }
};

exports.raiseUpdateRequest = async (req, res, next) => {
  try {
    const { familyId } = req.user;
    const { requested_data } = req.body;

    if (!familyId) {
      return next(new AppError('No family associated with this user', 403));
    }

    const result = await db.query(
      'INSERT INTO update_requests (family_id, requested_data, status) VALUES ($1, $2, $3) RETURNING *',
      [familyId, JSON.stringify(requested_data), 'pending']
    );

    res.status(201).json({
      message: 'Update request submitted successfully. Waiting for admin approval.',
      request: result.rows[0]
    });
  } catch (error) {
    next(new AppError('Failed to submit update request', 500));
  }
};

exports.getAnbiyamSummary = async (req, res, next) => {
  try {
    const { anbiyam } = req.user;
    if (!anbiyam) {
      return next(new AppError('No Anbiyam associated with this user', 404));
    }

    // Short view: only head name and family id
    const result = await db.query(
      'SELECT family_id, head_name, city FROM families WHERE anbiyam = $1 AND active = true ORDER BY head_name ASC',
      [anbiyam]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    next(new AppError('Failed to fetch Anbiyam summary', 500));
  }
};

exports.makePayment = async (req, res, next) => {
  try {
    const { familyId } = req.user;
    const { amount, type, transaction_id } = req.body;

    if (!familyId) {
      return next(new AppError('No family associated with this user', 403));
    }

    const result = await db.query(
      'INSERT INTO payments (family_id, amount, type, transaction_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [familyId, amount, type, transaction_id, 'pending'] // Assuming admin will verify later
    );

    res.status(201).json({
      message: 'Payment recorded. Waiting for verification.',
      payment: result.rows[0]
    });
  } catch (error) {
    next(new AppError('Failed to record payment', 500));
  }
};

exports.checkRegistration = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await db.query('SELECT family_id FROM families WHERE created_by = $1', [userId]);
    res.status(200).json({ hasFamily: result.rows.length > 0 });
  } catch (error) {
    next(new AppError('Failed to check registration status', 500));
  }
};
