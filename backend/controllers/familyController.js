const FamilyService = require('../services/familyService');
const AppError = require('../utils/AppError');

exports.getIds = async (req, res, next) => {
  try {
    const familyIds = await FamilyService.getActiveFamilyIds();
    res.status(200).json(familyIds);
  } catch (error) {
    next(new AppError('Failed to fetch family IDs', 500));
  }
};

exports.createFamily = async (req, res, next) => {
  try {
    const {
      head_name, address_line1, address_line2, city, pincode,
      mobile_number, mobile_number2, cemetery, native,
      resident_from, house_type, subscription, active, location,
      anbiyam, cemetery_number, old_card_number
    } = req.body;

    const createdBy = req.user.userId;
    const newFamilyId = await FamilyService.getNextFamilyId();

    let family_pic_filename = '';
    if (req.file && req.file.path) {
      family_pic_filename = req.file.path;
    }

    const familyData = {
      newFamilyId, createdBy, role: req.user.role, head_name, address_line1, address_line2, city,
      pincode, mobile_number, mobile_number2, cemetery, native,
      resident_from, house_type, subscription, active: active === 'true', location,
      anbiyam, family_pic_filename, cemetery_number, old_card_number
    };

    const newFamily = await FamilyService.createFamily(familyData);
    res.status(201).json(newFamily);
  } catch (error) {
    next(new AppError('Failed to create family: ' + error.message, 500));
  }
};

exports.getList = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await FamilyService.getActiveFamilies(page, limit, search, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(new AppError('Failed to fetch families', 500));
  }
};

exports.getListInactive = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await FamilyService.getInactiveFamilies(page, limit, search, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(new AppError('Failed to fetch inactive families', 500));
  }
};

exports.getFamilyById = async (req, res, next) => {
  try {
    const activeOnly = !req.user.isAdmin && req.user.role !== 'incharge';
    const family = await FamilyService.getFamilyById(req.params.familyId, activeOnly, req.user);
    if (!family) {
      return next(new AppError('Family not found', 404));
    }
    res.status(200).json(family);
  } catch (error) {
    next(new AppError('Failed to fetch family details', 500));
  }
};

exports.updateFamily = async (req, res, next) => {
  try {
    const { familyId } = req.params;
    
    // Safety check: ensure user can only update visible families
    // For ADMINS, allow updating inactive families (for approval flow)
    const activeOnly = !req.user.isAdmin;
    const existing = await FamilyService.getFamilyById(familyId, activeOnly, req.user);
    if (!existing) {
      return next(new AppError('Unauthorized or Family not found', 403));
    }

    const updateData = req.body;
    let hasNewPic = false;

    if (req.file) {
      updateData.family_pic = req.file.path;
      hasNewPic = true;
    }

    const updatedFamily = await FamilyService.updateFamily(familyId, updateData, hasNewPic);
    
    if (!updatedFamily) {
      return next(new AppError('Family not found', 404));
    }

    res.status(200).json(updatedFamily);
  } catch (error) {
    next(new AppError('Failed to update family', 500));
  }
};

exports.getFamiliesByAnbiyam = async (req, res, next) => {
  try {
    const { anbiyam } = req.params;
    if (!anbiyam) {
      return next(new AppError('Anbiyam name is required', 400));
    }

    // Admins can see any Anbiyam. Users can only see their own.
    if (!req.user.isAdmin && req.user.anbiyam !== anbiyam) {
      return next(new AppError('Access denied to this Anbiyam', 403));
    }

    const families = await FamilyService.getFamiliesByAnbiyam(anbiyam);
    res.status(200).json(families);
  } catch (error) {
    next(new AppError('Failed to fetch families by Anbiyam', 500));
  }
};

exports.getByFamilyId = async (req, res, next) => {
  try {
    const family = await FamilyService.getFamilyById(req.params.familyId, true, req.user);
    if (!family) {
      return next(new AppError('Active family not found', 404));
    }
    res.status(200).json(family);
  } catch (error) {
    next(new AppError('Failed to fetch family', 500));
  }
};

exports.getInactiveByFamilyId = async (req, res, next) => {
  try {
    const family = await FamilyService.getFamilyById(req.params.familyId, false, req.user);
    if (!family) {
      return next(new AppError('Inactive family not found', 404));
    }
    res.status(200).json(family);
  } catch (error) {
    next(new AppError('Failed to fetch inactive family', 500));
  }
};

exports.getFamilyStats = async (req, res, next) => {
  try {
    const count = await FamilyService.getActiveFamilyCount(req.user);
    res.status(200).json({ count });
  } catch (error) {
    next(new AppError('Failed to fetch family count', 500));
  }
};
