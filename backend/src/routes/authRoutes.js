const express = require('express');
const router = express.Router();
const { register, login, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidators');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
