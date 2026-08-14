const Review = require('../models/Review');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all reviews across all products (Admin only)
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name slug')
      .populate('user', 'name email')
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

// @desc    Delete a review (Admin only)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customer accounts with order counts (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('name email createdAt')
      .sort('-createdAt');

    const customersWithOrderCounts = await Promise.all(
      customers.map(async (cust) => {
        const orderCount = await Order.countDocuments({ user: cust._id });
        return {
          _id: cust._id,
          name: cust.name,
          email: cust.email,
          createdAt: cust.createdAt,
          orderCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: customersWithOrderCounts.length,
      data: customersWithOrderCounts
    });
  } catch (error) {
    next(error);
  }
};
