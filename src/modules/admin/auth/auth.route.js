const express = require('express');
const { signinController, getMe, signoutController } = require('./auth.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/role.middleware');


const router = express.Router();

// POST /signin
router.post('/auth/signin', signinController);
router.get("/auth/getMe", authenticate, authorize("ADMIN"), getMe)
router.post("/auth/signout", authenticate, authorize("ADMIN"), signoutController)

module.exports = router;
