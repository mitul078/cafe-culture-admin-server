const express = require('express');
const { signinController, signupController } = require('./auth.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/role.middleware');

const router = express.Router();

// POST /signin
router.post('/signin', signinController);

// POST /signup - only SUPER_ADMIN can create new admins
router.post('/signup', authenticate, authorize('SUPER_ADMIN'), signupController);

module.exports = router;
