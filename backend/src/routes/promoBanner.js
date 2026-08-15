const express = require('express');
const { getBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/promoBanner');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Allow public to get banners (the controller handles filtering active vs all based on token)
// Wait, our auth middleware throws if no token. We need a "soft" protect for GET if we want to read req.user.
// For simplicity:
// GET /api/promo-banners (Public, returns active only)
// GET /api/promo-banners/admin (Private/Admin, returns all)

// Let's rewrite the routes cleanly:
router.route('/')
  .get(getBanners)
  .post(requireAuth, requireAdmin, createBanner);

router.route('/:id')
  .put(requireAuth, requireAdmin, updateBanner)
  .delete(requireAuth, requireAdmin, deleteBanner);

module.exports = router;
