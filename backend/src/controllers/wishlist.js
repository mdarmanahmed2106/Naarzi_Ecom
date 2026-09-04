const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    // Atomic find-or-create: a plain findOne-then-create has a race window where
    // two concurrent requests for a brand-new user (e.g. React double-invoking the
    // load effect) can both see "no wishlist" and both try to create one, hitting
    // the unique index on `user` with an E11000 duplicate key error. Upserting in
    // one op lets MongoDB resolve the race instead of the application code.
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id, products: [] } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('products');

    res.status(200).json({
      success: true,
      count: wishlist.products.length,
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res, next) => {
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

    const existing = await Wishlist.findOne({ user: req.user._id, products: productId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Upsert + $addToSet: same atomic find-or-create as getWishlist, and $addToSet
    // is idempotent so two concurrent "add" clicks for the same product can never
    // insert it twice even if both raced past the "already in wishlist" check above.
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { products: productId }, $setOnInsert: { user: req.user._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('products');

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlistDoc = await Wishlist.findOne({ user: req.user._id });

    if (!wishlistDoc) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Check if product is in wishlist
    if (!wishlistDoc.products.some((id) => id.toString() === productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    // Atomic $pull instead of read-modify-save: two concurrent removals of
    // *different* products would otherwise race on the same document and the
    // second .save() would silently overwrite (undo) the first's removal.
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { products: productId } },
      { new: true }
    ).populate('products');

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};
