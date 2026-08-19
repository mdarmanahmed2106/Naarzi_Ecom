const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const releaseOrderStock = async (order) => {
  try {
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { _id: item.product },
        {
          $inc: {
            'colors.$[colorElem].sizes.$[sizeElem].stock': item.quantity
          }
        },
        { arrayFilters: [{ 'colorElem.name': item.color }, { 'sizeElem.size': item.size }] }
      );
      // We also update the root product stock by triggering save or manual inc
      // Note: Since we are using findOneAndUpdate, the pre('save') hook won't fire for root stock.
      // So we inc the root stock directly:
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
    }
  } catch (error) {
    console.error(`Failed to release stock for order ${order._id}:`, error);
  }
};
exports.releaseOrderStock = releaseOrderStock;

// @desc    Create new order (with stock verification and decrement)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    const orderedItems = [];
    let totalAmount = 0;
    const succeededDecrements = [];

    // 1. Validate stock and atomically decrement
    for (const item of items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          colors: { 
            $elemMatch: { 
              name: item.color, 
              sizes: { $elemMatch: { size: item.size, stock: { $gte: item.quantity } } } 
            } 
          }
        },
        {
          $inc: { 'colors.$[colorElem].sizes.$[sizeElem].stock': -item.quantity, 'stock': -item.quantity }
        },
        {
          arrayFilters: [{ 'colorElem.name': item.color }, { 'sizeElem.size': item.size }],
          new: true
        }
      );

      if (!updatedProduct) {
        // Rollback successful decrements
        for (const successful of succeededDecrements) {
          await Product.findOneAndUpdate(
            { _id: successful.product },
            {
              $inc: { 'colors.$[colorElem].sizes.$[sizeElem].stock': successful.quantity, 'stock': successful.quantity }
            },
            { arrayFilters: [{ 'colorElem.name': successful.color }, { 'sizeElem.size': successful.size }] }
          );
        }

        // Fetch product to give precise error
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${item.product} not found`
          });
        }
        const colorObj = product.colors.find((c) => c.name === item.color);
        const sizeObj = colorObj ? colorObj.sizes.find((s) => s.size === item.size) : null;
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${product.name}" in color "${item.color}" and size "${item.size}". Only ${sizeObj ? sizeObj.stock : 0} items left.`
        });
      }

      succeededDecrements.push({
        product: item.product,
        color: item.color,
        size: item.size,
        quantity: item.quantity
      });

      const price = updatedProduct.discountedPrice !== undefined && updatedProduct.discountedPrice !== null
        ? updatedProduct.discountedPrice
        : updatedProduct.price;

      totalAmount += price * item.quantity;

      orderedItems.push({
        product: updatedProduct._id,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        priceAtPurchase: price
      });
    }

    let discountAmount = 0;
    let appliedCouponCode = null;

    if (req.body.couponCode) {
      const coupon = await Coupon.findOne({ code: req.body.couponCode.toUpperCase() });
      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ success: false, message: 'Invalid coupon code' });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
      }
      if (coupon.minOrderValue && totalAmount < coupon.minOrderValue) {
        return res.status(400).json({ success: false, message: `Cart total must be at least ${coupon.minOrderValue} to use this coupon` });
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = (totalAmount * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }
      
      discountAmount = Math.round(Math.min(discountAmount, totalAmount));
      totalAmount -= discountAmount;
      appliedCouponCode = coupon.code;
    }

    // 3. Create pending order in DB
    const order = await Order.create({
      user: req.user._id,
      items: orderedItems,
      totalAmount,
      couponCode: appliedCouponCode,
      discountAmount,
      shippingAddress,
      paymentStatus: 'pending',
      orderStatus: 'processing' // Default status
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Pending payment.',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name slug images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order detail
// @route   GET /api/orders/:id
// @access  Private (Owner or Admin)
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name slug images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check ownership or admin role
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name slug')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If order is cancelled, release stock (if not already cancelled or failed)
    if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled' && order.paymentStatus !== 'failed') {
      await releaseOrderStock(order);
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Export helper for use in payment controller
exports.releaseOrderStock = releaseOrderStock;
