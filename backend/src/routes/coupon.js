const express = require('express');
const {
  validateCoupon,
  getActiveCoupons,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/coupon');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/validate', optionalAuth, validateCoupon);
router.get('/active', getActiveCoupons);

// Admin-only CRUD
router.use(requireAuth);
router.use(requireAdmin);

router.route('/')
  .get(getCoupons)
  .post(createCoupon);

router.route('/:id')
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
