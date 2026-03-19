const express = require('express');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/role.middleware');
const { signupController } = require('./signup.controller');

const router = express.Router();

// POST /signup - only SUPER_ADMIN can create new admins
router.post('/client/signup', authenticate, authorize('SUPER_ADMIN'), signupController);

module.exports = router;