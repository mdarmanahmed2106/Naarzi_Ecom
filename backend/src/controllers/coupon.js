const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public/Auth
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal, cartItems } = req.body;
    const userId = req.user?._id;

    if (!code || cartTotal === undefined) {
      return res.status(400).json({ success: false, message: 'Coupon code and cart total are required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() }).populate('applicableCategories', 'name');

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is no longer active' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
    }

    // Check firstOrderOnly rule
    if (coupon.firstOrderOnly && userId) {
      const previousPaidOrders = await Order.countDocuments({
        user: userId,
        paymentStatus: 'paid'
      });
      if (previousPaidOrders > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'This coupon is valid only on your first purchase' 
        });
      }
    }

    // Check per-user limit rule
    if (coupon.maxUsesPerUser && userId) {
      const userRedemptions = await Order.countDocuments({
        user: userId,
        couponCode: coupon.code,
        paymentStatus: { $in: ['paid', 'pending'] }
      });
      if (userRedemptions >= coupon.maxUsesPerUser) {
        return res.status(400).json({ 
          success: false, 
          message: `You have already redeemed coupon ${coupon.code}` 
        });
      }
    }

    // Check category-scoped restrictions
    let calculationBase = cartTotal;
    const isCategoryScoped = coupon.applicableCategories && coupon.applicableCategories.length > 0;

    if (isCategoryScoped) {
      if (Array.isArray(cartItems) && cartItems.length > 0) {
        const productIds = cartItems
          .map(item => item.productId || item.product?._id || item.product)
          .filter(Boolean);

        const dbProducts = await Product.find({ _id: { $in: productIds } }).select('_id category price discountedPrice');
        const applicableCatSet = new Set(coupon.applicableCategories.map(c => c._id ? c._id.toString() : c.toString()));

        let qualifyingSubtotal = 0;
        for (const item of cartItems) {
          const pId = (item.productId || item.product?._id || item.product)?.toString();
          const prod = dbProducts.find(p => p._id.toString() === pId);
          if (prod && prod.category && applicableCatSet.has(prod.category.toString())) {
            const itemPrice = prod.discountedPrice !== undefined && prod.discountedPrice !== null ? prod.discountedPrice : prod.price;
            qualifyingSubtotal += itemPrice * (item.quantity || 1);
          }
        }

        if (qualifyingSubtotal === 0) {
          const catNames = coupon.applicableCategories.map(c => c.name || 'selected categories').join(', ');
          return res.status(400).json({
            success: false,
            message: `This coupon is exclusively valid on: ${catNames}`
          });
        }

        calculationBase = qualifyingSubtotal;
      }

      // Check minOrderValue against category qualifying total
      if (coupon.minOrderValue && calculationBase < coupon.minOrderValue) {
        const remaining = coupon.minOrderValue - calculationBase;
        return res.status(400).json({ 
          success: false, 
          message: `Add INR ${remaining} more of qualifying items to use code ${coupon.code}`,
          minOrderValue: coupon.minOrderValue
        });
      }
    } else {
      // Storewide minOrderValue check
      if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
        const remaining = coupon.minOrderValue - cartTotal;
        return res.status(400).json({ 
          success: false, 
          message: `Add INR ${remaining} more to your cart to use code ${coupon.code}`,
          minOrderValue: coupon.minOrderValue
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (calculationBase * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else if (coupon.discountType === 'flat') {
      discountAmount = Math.min(coupon.discountValue, calculationBase);
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    res.status(200).json({
      success: true,
      discountAmount: Math.round(discountAmount),
      couponCode: coupon.code,
      description: coupon.description || undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active public coupons
// @route   GET /api/coupons/active
// @access  Public
exports.getActiveCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    })
    .populate('applicableCategories', 'name')
    .select('code discountType discountValue minOrderValue maxDiscountAmount description firstOrderOnly applicableCategories');

    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().populate('applicableCategories', 'name').sort('-createdAt');
    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  try {
    req.body.code = req.body.code.toUpperCase();
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }
    next(error);
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res, next) => {
  try {
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }
    
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }
    next(error);
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
