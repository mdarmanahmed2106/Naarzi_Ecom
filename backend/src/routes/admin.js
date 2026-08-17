const express = require('express');
const { getReviews, deleteReview, getCustomers, getAbandonedCarts, getWishlistInsights, getWishlistCustomers } = require('../controllers/admin');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin guards to all endpoints
router.use(requireAuth, requireAdmin);

router.route('/reviews')
  .get(getReviews);

router.route('/reviews/:id')
  .delete(deleteReview);

router.route('/users')
  .get(getCustomers);

router.get('/abandoned-carts', getAbandonedCarts);
router.get('/wishlist-insights', getWishlistInsights);
router.get('/wishlist-insights/customers', getWishlistCustomers);

module.exports = router;
