const express = require('express');
const { signinController } = require('./auth.controller');


const router = express.Router();

// POST /signin
router.post('/auth/signin', signinController);

module.exports = router;
