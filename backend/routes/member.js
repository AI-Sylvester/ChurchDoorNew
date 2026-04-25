const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const memberController = require('../controllers/memberController');
const validate = require('../middleware/validate');
const { addMemberSchema } = require('../validations/memberValidation');

router.post('/add', authMiddleware, validate(addMemberSchema), memberController.addMember);
router.get('/all', authMiddleware, memberController.getAllMembers);
router.get('/byFamily/:familyId', authMiddleware, memberController.getMembersByFamilyId);
router.get('/stats/members', authMiddleware, memberController.getMemberStats);
router.get('/by-anbiyam/:anbiyam', authMiddleware, memberController.getMembersByAnbiyam);
router.get('/stats/gender', authMiddleware, memberController.getGenderStats);
router.get('/stats/age-groups', authMiddleware, memberController.getAgeGroupStats);
router.get('/birthdays', authMiddleware, memberController.getBirthdayReminders);
router.get('/weddings', authMiddleware, memberController.getWeddingReminders);

// Parameterized routes at the bottom
router.put('/:memberId', authMiddleware, memberController.updateMember);

module.exports = router;
