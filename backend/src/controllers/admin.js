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

const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

// @desc    Get abandoned carts (Admin only)
// @route   GET /api/admin/abandoned-carts
// @access  Private/Admin
exports.getAbandonedCarts = async (req, res, next) => {
  try {
    const olderThanHours = parseInt(req.query.olderThanHours) || 2;
    const thresholdDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    
    // Find carts modified before the threshold date that are NOT empty
    const carts = await Cart.find({ 
      updatedAt: { $lt: thresholdDate },
      'items.0': { $exists: true }
    })
    .populate('user', 'name email')
    .populate('items.product', 'name price discountedPrice images');

    // Compute cart value and format
    let formattedCarts = carts.map(cart => {
      const cartValue = cart.items.reduce((total, item) => {
        const price = item.product.discountedPrice || item.product.price;
        return total + (price * item.quantity);
      }, 0);

      return {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        updatedAt: cart.updatedAt,
        cartValue
      };
    });

    // Default sort is by most recently abandoned (updatedAt desc)
    // Support sorting by value
    if (req.query.sortBy === 'value') {
      formattedCarts.sort((a, b) => b.cartValue - a.cartValue);
    } else {
      formattedCarts.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    res.status(200).json({
      success: true,
      count: formattedCarts.length,
      data: formattedCarts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated wishlist insights (Admin only)
// @route   GET /api/admin/wishlist-insights
// @access  Private/Admin
exports.getWishlistInsights = async (req, res, next) => {
  try {
    // Aggregate across all wishlists to find most wishlisted products
    const insights = await Wishlist.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 1,
          count: 1,
          name: "$productDetails.name",
          images: "$productDetails.images",
          price: "$productDetails.price",
          discountedPrice: "$productDetails.discountedPrice"
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customers with active wishlists (Admin only)
// @route   GET /api/admin/wishlist-insights/customers
// @access  Private/Admin
exports.getWishlistCustomers = async (req, res, next) => {
  try {
    const wishlists = await Wishlist.find({ 'products.0': { $exists: true } })
      .populate('user', 'name email')
      .populate('products', 'name images price discountedPrice');
    
    // Format response
    const data = wishlists.map(w => ({
      user: w.user,
      itemCount: w.products.length,
      products: w.products,
      updatedAt: w.updatedAt
    })).sort((a, b) => b.updatedAt - a.updatedAt);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};
