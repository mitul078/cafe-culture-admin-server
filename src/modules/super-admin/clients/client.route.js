const express = require('express');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/role.middleware');
const { createClientController } = require('./client.controller');


const router = express.Router();


router.post("/create", authenticate, authorize(["SUPER_ADMIN"]), createClientController)

module.exports = router;
