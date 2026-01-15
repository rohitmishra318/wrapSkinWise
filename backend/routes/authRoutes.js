
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authLimiter } = require('../middleware/ratelimiter');

router.post('/register',  userController.registerUser);
router.post('/login',  userController.loginUser);

module.exports = router;