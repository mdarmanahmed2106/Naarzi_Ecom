const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/wishlist');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.route('/')
  .get(getWishlist);

router.route('/:productId')
  .post(addToWishlist)
  .delete(removeFromWishlist);

module.exports = router;
