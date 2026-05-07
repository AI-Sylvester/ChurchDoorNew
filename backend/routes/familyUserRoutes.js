const express = require('express');
const router = express.Router();
const familyUserController = require('../controllers/familyUserController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/my-family', roleMiddleware(['family', 'admin']), familyUserController.getMyFamily);
router.get('/check-registration', familyUserController.checkRegistration);
router.post('/update-request', roleMiddleware(['family']), familyUserController.raiseUpdateRequest);
router.get('/anbiyam-summary', roleMiddleware(['family', 'incharge', 'admin']), familyUserController.getAnbiyamSummary);
router.post('/payment', roleMiddleware(['family']), familyUserController.makePayment);

module.exports = router;
