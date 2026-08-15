const express = require('express');
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/coupon');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public route for checking coupon validity at checkout
router.post('/validate', validateCoupon);

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
