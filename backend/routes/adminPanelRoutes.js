const express = require('express');
const router = express.Router();
const adminPanelController = require('../controllers/adminPanelController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/pending-users', adminPanelController.getPendingUsers);
router.get('/pending-families', adminPanelController.getPendingFamilies);
router.get('/pending-members', adminPanelController.getPendingMembers);
router.get('/update-requests', adminPanelController.getUpdateRequests);
router.put('/update-requests/:id', adminPanelController.handleUpdateRequest);
router.get('/event-reports', adminPanelController.getEventReports);

module.exports = router;
