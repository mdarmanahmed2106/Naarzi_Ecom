const express = require('express');
const { getProductReviews, createReview } = require('../controllers/review');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewSchema } = require('../utils/validationSchemas');

// mergeParams: true allows us to access productId from parent router
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getProductReviews)
  .post(requireAuth, validate(createReviewSchema), createReview);

module.exports = router;
