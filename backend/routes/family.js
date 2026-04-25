const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('../utils/Cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const familyController = require('../controllers/familyController');
const validate = require('../middleware/validate');
const { createFamilySchema } = require('../validations/familyValidation');

// Setup multer for image upload with temporary filename
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'families', // Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => 'temp-' + Date.now(),
  },
});
const upload = multer({ storage });

router.get('/ids', authMiddleware, familyController.getIds);
router.post('/create', authMiddleware, upload.single('family_pic'), validate(createFamilySchema), familyController.createFamily);

router.get('/list', authMiddleware, familyController.getList);
router.get('/list-inactive', authMiddleware, familyController.getListInactive);
router.get('/anbiyamfam/:anbiyam', authMiddleware, familyController.getFamiliesByAnbiyam);
router.get('/byFamilyId/:familyId', authMiddleware, familyController.getByFamilyId);
router.get('/stats/families', authMiddleware, familyController.getFamilyStats);

// Parameterized routes (keep at the bottom to prevent conflict with /list, /ids etc)
router.get('/:familyId', authMiddleware, familyController.getFamilyById);
router.put('/:familyId', authMiddleware, upload.single('family_pic'), familyController.updateFamily);
// Wait, there was a /list-inactive/:familyId
router.get('/list-inactive/:familyId', authMiddleware, familyController.getInactiveByFamilyId);

module.exports = router;
