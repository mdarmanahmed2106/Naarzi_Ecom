const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { new: true, upsert: true }
  );
  return cart;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await getOrCreateCart(req.user.id);
    cart = await cart.populate('items.product');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or update item in cart
// @route   POST /api/cart
// @access  Private
exports.addItem = async (req, res, next) => {
  try {
    const { product, size, quantity } = req.body;
    
    if (!product || !size || !quantity) {
      return res.status(400).json({ success: false, message: 'Please provide product, size, and quantity' });
    }

    let cart = await getOrCreateCart(req.user.id);

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === product && item.size === size
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Add new item
      cart.items.push({ product, size, quantity });
    }

    await cart.save();
    
    // Return populated cart
    cart = await cart.populate('items.product');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/item
// @access  Private
exports.removeItem = async (req, res, next) => {
  try {
    const { product, size } = req.body; // Using request body for DELETE to easily pass size and product ID together

    if (!product || !size) {
      return res.status(400).json({ success: false, message: 'Please provide product and size' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => !(item.product.toString() === product && item.size === size)
    );

    await cart.save();
    await cart.populate('items.product');
    
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sync local cart with server cart (merges arrays)
// @route   POST /api/cart/sync
// @access  Private
exports.syncCart = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { product, size, quantity }
    
    let cart = await getOrCreateCart(req.user.id);

    if (items && Array.isArray(items) && items.length > 0) {
      for (const localItem of items) {
        const productId = typeof localItem.product === 'object' ? localItem.product._id : localItem.product;
        
        const existingItemIndex = cart.items.findIndex(
          item => item.product.toString() === productId && item.size === localItem.size
        );

        if (existingItemIndex > -1) {
          // Merge quantities by taking the max or summing them. The prompt says "sum quantities for duplicate product+size combos"
          cart.items[existingItemIndex].quantity += localItem.quantity;
        } else {
          cart.items.push({ 
            product: productId, 
            size: localItem.size, 
            quantity: localItem.quantity 
          });
        }
      }
      await cart.save();
    }

    cart = await cart.populate('items.product');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
