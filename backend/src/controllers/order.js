const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const { getAllowedNextStatuses } = require('../utils/orderStatusTransitions');

const { issueRefund } = require('../utils/refunds');

// Put one line's quantity back on its variant. Products with colours keep stock per colour and
// size; older products without colours keep it per size only. The total `stock` is only bumped
// when the variant still exists, so stock for a deleted colour/size isn't resurrected as phantom
// inventory.
const restoreLineStock = async ({ product, color, size, quantity }) => {
  const byColor = await Product.updateOne(
    { _id: product, colors: { $elemMatch: { name: color, 'sizes.size': size } } },
    { $inc: { 'colors.$[colorElem].sizes.$[sizeElem].stock': quantity, stock: quantity } },
    { arrayFilters: [{ 'colorElem.name': color }, { 'sizeElem.size': size }] }
  );
  if (byColor.matchedCount > 0) return;
  await Product.updateOne(
    { _id: product, 'sizes.size': size },
    { $inc: { 'sizes.$[sizeElem].stock': quantity, stock: quantity } },
    { arrayFilters: [{ 'sizeElem.size': size }] }
  );
};

// Return an order's reserved stock: at most once per order. The `stockReleased` flag is
// claimed atomically first, so concurrent or repeated callers (customer cancel, admin cancel,
// abandoned-order job, payment.failed webhook, double clicks) can't add the stock back twice.
// Returns true if this call released the stock.
const releaseOrderStock = async (order) => {
  const claim = await Order.updateOne(
    { _id: order._id, stockReleased: { $ne: true } },
    { $set: { stockReleased: true } }
  );
  order.stockReleased = true;
  if (claim.modifiedCount === 0) {
    return false; // already released by someone else
  }

  for (const item of order.items) {
    try {
      await restoreLineStock(item);
    } catch (error) {
      console.error(`Failed to release stock for order ${order._id}, product ${item.product}:`, error);
    }
  }
  return true;
};
exports.releaseOrderStock = releaseOrderStock;

// Put back stock taken by createOrder before it failed part-way
const rollbackDecrements = async (decrements) => {
  for (const d of decrements) {
    try {
      await restoreLineStock(d);
    } catch (error) {
      console.error(`Failed to roll back stock for product ${d.product}:`, error);
    }
  }
};

// Generous enough for a customer who edits their cart between payment attempts (each edit starts
// a fresh order; the old one waits for the abandoned-order job)
const MAX_OPEN_UNPAID_ORDERS = 5;

// @desc    Create new order (with stock verification and decrement)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  // Stock taken so far: rolled back if anything fails before the order is saved
  const succeededDecrements = [];
  let orderSaved = false;

  try {
    const { items, shippingAddress } = req.body;

    // Unpaid orders hold stock until they're paid or the abandoned-order job frees them, so cap
    // how many one account can have open; otherwise a single user could reserve the whole catalogue.
    const openUnpaidOrders = await Order.countDocuments({
      user: req.user._id,
      paymentStatus: 'pending',
      orderStatus: 'processing'
    });
    if (openUnpaidOrders >= MAX_OPEN_UNPAID_ORDERS) {
      return res.status(429).json({
        success: false,
        message: 'You have unpaid orders waiting. Please complete or cancel them before placing a new one.'
      });
    }

    // 1. Validate every line BEFORE touching stock: product exists, colour and size exist.
    //    Prices come from the database, never the client.
    const lines = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      const isLegacy = !product.colors || product.colors.length === 0;
      let color = null;
      if (isLegacy) {
        if (!product.sizes || !product.sizes.some((s) => s.size === item.size)) {
          return res.status(400).json({ success: false, message: `Size "${item.size}" is not available for "${product.name}".` });
        }
      } else {
        // Older carts may not carry a colour: fall back to the first variant
        color = item.color || product.colors[0].name;
        const colorObj = product.colors.find((c) => c.name === color);
        if (!colorObj) {
          return res.status(400).json({ success: false, message: `Colour "${color}" is no longer available for "${product.name}".` });
        }
        if (!colorObj.sizes.some((s) => s.size === item.size)) {
          return res.status(400).json({ success: false, message: `Size "${item.size}" is not available for "${product.name}" in ${color}.` });
        }
      }

      const price = product.discountedPrice !== undefined && product.discountedPrice !== null
        ? product.discountedPrice
        : product.price;

      lines.push({ item, product, isLegacy, color, price });
    }

    const itemsSubtotal = lines.reduce((sum, l) => sum + l.price * l.item.quantity, 0);

    // 2. Validate the coupon (still before touching stock)
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (req.body.couponCode) {
      const coupon = await Coupon.findOne({ code: String(req.body.couponCode).toUpperCase() });
      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ success: false, message: 'Invalid coupon code' });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      }
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
      }
      // Check firstOrderOnly rule
      if (coupon.firstOrderOnly) {
        const previousPaidOrders = await Order.countDocuments({
          user: req.user._id,
          paymentStatus: 'paid'
        });
        if (previousPaidOrders > 0) {
          return res.status(400).json({
            success: false,
            message: 'This coupon is valid only on your first purchase'
          });
        }
      }

      // Check per-user limit rule (cancelled orders don't count as a redemption)
      if (coupon.maxUsesPerUser) {
        const userRedemptions = await Order.countDocuments({
          user: req.user._id,
          couponCode: coupon.code,
          paymentStatus: { $in: ['paid', 'pending'] },
          orderStatus: { $ne: 'cancelled' }
        });
        if (userRedemptions >= coupon.maxUsesPerUser) {
          return res.status(400).json({
            success: false,
            message: `You have already redeemed coupon ${coupon.code}`
          });
        }
      }

      // Check category-specific restrictions
      let calculationBase = itemsSubtotal;
      if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
        const applicableCatSet = new Set(coupon.applicableCategories.map((c) => c.toString()));
        const qualifyingTotal = lines
          .filter((l) => l.product.category && applicableCatSet.has(l.product.category.toString()))
          .reduce((sum, l) => sum + l.price * l.item.quantity, 0);

        if (qualifyingTotal === 0) {
          return res.status(400).json({ success: false, message: 'Coupon is not applicable to any items in your cart' });
        }
        if (coupon.minOrderValue && qualifyingTotal < coupon.minOrderValue) {
          return res.status(400).json({ success: false, message: `Cart must contain at least ₹${coupon.minOrderValue} of eligible items` });
        }
        calculationBase = qualifyingTotal;
      } else if (coupon.minOrderValue && itemsSubtotal < coupon.minOrderValue) {
        return res.status(400).json({ success: false, message: `Cart total must be at least ₹${coupon.minOrderValue} to use this coupon` });
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = (calculationBase * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount > 0) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else {
        discountAmount = Math.min(coupon.discountValue, calculationBase);
      }

      discountAmount = Math.round(Math.min(discountAmount, itemsSubtotal));
      appliedCouponCode = coupon.code;
    }

    // Shipping cost: free once the (pre-discount) items subtotal clears the configured threshold
    const settings = await Settings.getSingleton();
    const freeShippingThreshold = settings.freeShippingThreshold || 0;
    const qualifiesForFreeShipping = freeShippingThreshold <= 0 || itemsSubtotal >= freeShippingThreshold;
    const shippingCost = qualifiesForFreeShipping ? 0 : (settings.shippingCost || 0);
    const totalAmount = itemsSubtotal - discountAmount + shippingCost;

    // 3. Everything is valid: now reserve stock atomically, line by line
    const orderedItems = [];
    for (const { item, product, isLegacy, color, price } of lines) {
      const updatedProduct = isLegacy
        ? await Product.findOneAndUpdate(
            { _id: item.product, sizes: { $elemMatch: { size: item.size, stock: { $gte: item.quantity } } } },
            { $inc: { 'sizes.$[sizeElem].stock': -item.quantity, stock: -item.quantity } },
            { arrayFilters: [{ 'sizeElem.size': item.size }], new: true }
          )
        : await Product.findOneAndUpdate(
            {
              _id: item.product,
              colors: { $elemMatch: { name: color, sizes: { $elemMatch: { size: item.size, stock: { $gte: item.quantity } } } } }
            },
            { $inc: { 'colors.$[colorElem].sizes.$[sizeElem].stock': -item.quantity, stock: -item.quantity } },
            { arrayFilters: [{ 'colorElem.name': color }, { 'sizeElem.size': item.size }], new: true }
          );

      if (!updatedProduct) {
        // Not enough stock: put back what this order already took and report precisely
        await rollbackDecrements(succeededDecrements);
        succeededDecrements.length = 0;
        const fresh = await Product.findById(item.product);
        const sizeObj = isLegacy
          ? fresh?.sizes?.find((s) => s.size === item.size)
          : fresh?.colors?.find((c) => c.name === color)?.sizes.find((s) => s.size === item.size);
        return res.status(400).json({
          success: false,
          message: isLegacy
            ? `Insufficient stock for product "${product.name}" in size "${item.size}". Only ${sizeObj ? sizeObj.stock : 0} items left.`
            : `Insufficient stock for product "${product.name}" in color "${color}" and size "${item.size}". Only ${sizeObj ? sizeObj.stock : 0} items left.`
        });
      }

      succeededDecrements.push({ product: item.product, color, size: item.size, quantity: item.quantity });
      orderedItems.push({
        product: product._id,
        color: color || 'Default',
        size: item.size,
        quantity: item.quantity,
        priceAtPurchase: price
      });
    }

    // 4. Create pending order in DB
    const order = await Order.create({
      user: req.user._id,
      items: orderedItems,
      totalAmount,
      couponCode: appliedCouponCode,
      discountAmount,
      shippingCost,
      shippingAddress,
      paymentStatus: 'pending',
      orderStatus: 'processing', // Default status
      statusHistory: [{ status: 'processing', changedAt: new Date() }]
    });
    orderSaved = true;

    // Create Notification (non-critical: never undo the order because of it)
    try {
      await Notification.create({
        title: 'New Order Received',
        message: `Order #${order._id.toString().substring(0, 8)} placed for ₹${totalAmount}.`,
        type: 'NEW_ORDER',
        referenceId: order._id,
        referenceModel: 'Order'
      });
    } catch (notifyErr) {
      console.error('Failed to create new-order notification:', notifyErr);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Pending payment.',
      order
    });
  } catch (error) {
    // Anything that failed after stock was reserved but before the order existed
    if (!orderSaved && succeededDecrements.length > 0) {
      await rollbackDecrements(succeededDecrements);
    }
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const MAX_LIMIT = 100;
    const parsedLimit = Math.min(parseInt(limit, 10) || 20, MAX_LIMIT);
    
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const skipNum = (pageNum - 1) * parsedLimit;

    const totalOrders = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name slug images')
      .sort('-createdAt')
      .skip(skipNum)
      .limit(parsedLimit);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        currentPage: pageNum,
        limit: parsedLimit,
        totalPages: Math.ceil(totalOrders / parsedLimit),
        totalOrders
      },
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
    const { page = 1, limit = 20 } = req.query;
    const MAX_LIMIT = 200;
    const parsedLimit = Math.min(parseInt(limit, 10) || 20, MAX_LIMIT);
    
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const skipNum = (pageNum - 1) * parsedLimit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name slug')
      .sort('-createdAt')
      .skip(skipNum)
      .limit(parsedLimit);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        currentPage: pageNum,
        limit: parsedLimit,
        totalPages: Math.ceil(totalOrders / parsedLimit),
        totalOrders
      },
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
    const { orderStatus, trackingNumber, carrier, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Enforce the order state machine. Only checked when the status actually changes, so
    // re-saving tracking details on an unchanged status still works. This is what stops e.g.
    // delivered → cancelled, which would add stock back for items already with the customer.
    if (orderStatus !== order.orderStatus) {
      const allowedNext = getAllowedNextStatuses(order.orderStatus);
      if (!allowedNext.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change order status from "${order.orderStatus}" to "${orderStatus}". Allowed next steps: ${allowedNext.length ? allowedNext.join(', ') : 'none, this order is in a final state'}.`
        });
      }
    }

    const isCancelling = orderStatus === 'cancelled' && order.orderStatus !== 'cancelled';

    // Return stock on cancel. A failed order's stock was already returned by the abandoned-order
    // job or payment.failed webhook; releaseOrderStock also guards against double releases.
    if (isCancelling && order.paymentStatus !== 'failed') {
      await releaseOrderStock(order);
    }
    // An unpaid order that's cancelled can never be paid afterwards
    if (isCancelling && order.paymentStatus === 'pending') {
      order.paymentStatus = 'failed';
    }

    // Only append a timeline entry when the status is actually changing, so
    // resaving tracking details on an unchanged status doesn't duplicate it.
    if (order.orderStatus !== orderStatus) {
      order.statusHistory.push({ status: orderStatus, changedAt: new Date() });
    }
    order.orderStatus = orderStatus;

    // Tracking fields are optional and independent of the status transition -
    // empty string clears the field, undefined leaves it untouched.
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber || null;
    if (carrier !== undefined) order.carrier = carrier || null;
    if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery || null;

    await order.save();

    // Cancelling a paid order refunds it through Razorpay
    let refund = null;
    if (isCancelling && order.paymentStatus === 'paid') {
      refund = await issueRefund(order);
    }

    res.status(200).json({
      success: true,
      message: refund
        ? `Order cancelled. ${refund.message}`
        : `Order status updated to ${orderStatus}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// Export helper for use in payment controller
exports.releaseOrderStock = releaseOrderStock;

// @desc    Cancel order (Customer facing)
// @route   POST /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ownership check: a customer can only cancel their own order, never someone else's by guessing an ID
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this order' });
    }

    // Status window check: only cancellable while still processing, not once shipped/delivered
    if (order.orderStatus !== 'processing') {
      return res.status(400).json({
        success: false,
        message: `This order can no longer be cancelled (current status: ${order.orderStatus}).`
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This order is already cancelled.' });
    }

    // Return stock: unless the order already failed payment (its stock was returned then).
    // releaseOrderStock is also atomic, so a double click can't return it twice.
    if (order.paymentStatus !== 'failed') {
      await releaseOrderStock(order);
    }

    const wasAlreadyPaid = order.paymentStatus === 'paid';

    order.orderStatus = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', changedAt: new Date() });
    // An unpaid order that's cancelled can never be paid afterwards, and must not be picked up
    // again by the abandoned-order job
    if (order.paymentStatus === 'pending') {
      order.paymentStatus = 'failed';
    }
    await order.save();

    // Paid orders are refunded through Razorpay straight away
    let refund = null;
    if (wasAlreadyPaid) {
      refund = await issueRefund(order);
    }

    // Create Notifications
    await Notification.create({
      title: 'Order Cancelled',
      message: `Order #${order._id.toString().substring(0, 8)} was cancelled by the customer.`,
      type: 'ORDER_CANCELLED',
      referenceId: order._id,
      referenceModel: 'Order'
    });

    // A failed refund already raises its own "Refund Failed" notification for the admin
    let customerMessage = 'Order cancelled successfully.';
    if (refund) {
      customerMessage = refund.status === 'completed'
        ? `Order cancelled. Your refund of ₹${order.totalAmount} has been processed to your original payment method.`
        : refund.ok
          ? `Order cancelled. Your refund of ₹${order.totalAmount} has been initiated and usually reaches your account in 5–7 working days.`
          : 'Order cancelled. We could not start your refund automatically. Our team has been notified and will process it shortly.';
    }

    res.status(200).json({
      success: true,
      message: customerMessage,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refund a cancelled, paid order (admin retry after a failed automatic refund)
// @route   POST /api/orders/:id/refund
// @access  Private/Admin
exports.refundOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.orderStatus !== 'cancelled') {
      return res.status(400).json({ success: false, message: 'Only cancelled orders can be refunded. Cancel the order first.' });
    }

    const result = await issueRefund(order);
    res.status(result.ok ? 200 : 400).json({ success: result.ok, message: result.message, order });
  } catch (error) {
    next(error);
  }
};
