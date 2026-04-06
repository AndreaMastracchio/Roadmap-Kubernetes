const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');

router.post('/purchase', userController.purchaseCourse);
router.post('/complete-module', userController.completeModule);
router.post('/current-module', userController.updateCourseStatus);
router.patch('/profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.post('/upload-avatar', upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
