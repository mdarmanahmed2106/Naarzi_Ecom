const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a product (verified purchasers only)
// @route   POST /api/products/:productId/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // 1. Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // 2. Verify user has purchased this product (Option B: Verified Purchaser)
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      paymentStatus: 'paid',
      'items.product': productId
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message: 'Review access denied: You can only review products you have purchased and paid for.'
      });
    }

    // 3. Verify user hasn't already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product.'
      });
    }

    // 4. Create review
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment
    });

    // Populate user name for response
    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};
