const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/', authController.googleUserAuth);

module.exports = router;