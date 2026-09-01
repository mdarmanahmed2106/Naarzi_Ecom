const express = require('express');
const { signup, login, logout, me, phoneAuth, addAddress, deleteAddress, updateProfile, completeProfile } = require('../controllers/auth');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { signupSchema, loginSchema, completeProfileSchema } = require('../utils/validationSchemas');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/phone', authLimiter, phoneAuth);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.put('/complete-profile', requireAuth, validate(completeProfileSchema), completeProfile);
router.put('/me', requireAuth, updateProfile);
router.post('/me/addresses', requireAuth, addAddress);
router.delete('/me/addresses/:id', requireAuth, deleteAddress);

module.exports = router;
