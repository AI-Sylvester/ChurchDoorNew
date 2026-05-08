const MemberService = require('../services/memberService');
const AppError = require('../utils/AppError');

exports.addMember = async (req, res, next) => {
  try {
    const newMember = await MemberService.addMember(req.body, req.user);
    res.status(201).json(newMember);
  } catch (error) {
    if (error.message === 'Family not found') {
      return next(new AppError('Family not found', 404));
    }
    next(new AppError('Failed to add member', 500));
  }
};

exports.getAllMembers = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await MemberService.getAllMembers(page, limit, search, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(new AppError('Failed to fetch members', 500));
  }
};

exports.getMembersByFamilyId = async (req, res, next) => {
  try {
    const { familyId } = req.params;
    const members = await MemberService.getMembersByFamilyId(familyId, req.user);
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    
    // Permission check: ensure user can only update visible members
    const members = await MemberService.getAllMembers(1, 1, memberId, req.user);
    if (members.totalCount === 0) {
      return next(new AppError('Unauthorized or Member not found', 403));
    }

    const updatedMember = await MemberService.updateMember(memberId, req.body);
    if (!updatedMember) {
        return next(new AppError('Member not found', 404));
    }
    res.status(200).json(updatedMember);
  } catch (error) {
    next(new AppError('Failed to update member: ' + error.message, 500));
  }
};

exports.getMemberStats = async (req, res, next) => {
  try {
    const count = await MemberService.getMemberStats(req.user);
    res.status(200).json({ count });
  } catch (error) {
    next(new AppError('Failed to fetch member count', 500));
  }
};

exports.getMembersByAnbiyam = async (req, res, next) => {
  try {
    const { anbiyam } = req.params;
    if (!anbiyam) {
      return next(new AppError('Anbiyam name is required in path.', 400));
    }

    if (!req.user.isAdmin && req.user.anbiyam !== anbiyam) {
      return next(new AppError('Access denied to this Anbiyam', 403));
    }

    const members = await MemberService.getMembersByAnbiyam(anbiyam);
    res.status(200).json(members);
  } catch (error) {
    next(new AppError('Failed to fetch members by Anbiyam', 500));
  }
};

exports.getGenderStats = async (req, res, next) => {
  try {
    const stats = await MemberService.getGenderStats(req.user);
    res.status(200).json(stats);
  } catch (error) {
    next(new AppError('Failed to fetch gender stats', 500));
  }
};

exports.getAgeGroupStats = async (req, res, next) => {
  try {
    const stats = await MemberService.getAgeGroupStats(req.user);
    res.status(200).json(stats);
  } catch (error) {
    next(new AppError('Failed to fetch age group stats', 500));
  }
};

exports.getBirthdayReminders = async (req, res, next) => {
  try {
    const reminders = await MemberService.getBirthdayReminders(req.user);
    res.status(200).json(reminders);
  } catch (error) {
    next(new AppError('Failed to fetch birthday reminders', 500));
  }
};

exports.getWeddingReminders = async (req, res, next) => {
  try {
    const reminders = await MemberService.getWeddingReminders(req.user);
    res.status(200).json(reminders);
  } catch (error) {
    next(new AppError('Failed to fetch wedding reminders', 500));
  }
};
