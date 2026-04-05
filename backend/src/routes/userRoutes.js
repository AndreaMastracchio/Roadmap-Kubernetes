const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/purchase', userController.purchaseCourse);
router.post('/complete-module', userController.completeModule);
router.patch('/profile', userController.updateProfile);

module.exports = router;
