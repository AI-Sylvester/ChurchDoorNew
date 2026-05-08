const express = require('express');
const router = express.Router();
const inchargeController = require('../controllers/inchargeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['incharge', 'admin']));

router.get('/my-group', inchargeController.getMyGroupFamilies);
router.get('/pending-verifications', inchargeController.getPendingVerifications);
router.get('/update-requests', inchargeController.getGroupUpdateRequests);
router.post('/verify-update/:id', inchargeController.verifyUpdateRequest);
router.post('/report', inchargeController.submitReport);
router.post('/recommend-approval/:familyId', inchargeController.recommendApproval);
router.get('/pending-member-verifications', inchargeController.getPendingMemberVerifications);
router.post('/recommend-member-approval/:memberId', inchargeController.recommendMemberApproval);
router.get('/pending-user-verifications', inchargeController.getPendingUserVerifications);
router.post('/recommend-user-approval/:userId', inchargeController.recommendUserApproval);

module.exports = router;
