const express = require('express');
const { signup, login, logout, me, phoneAuth } = require('../controllers/auth');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../utils/validationSchemas');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/phone', authLimiter, phoneAuth);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;
