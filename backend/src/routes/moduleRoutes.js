const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

router.get('/:courseId/:moduleId', moduleController.getModuleContent);
router.get('/:courseId/:moduleId/data', moduleController.getModuleData);

module.exports = router;
