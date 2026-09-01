const express = require('express');
const router = express.Router();
const { getCart, addItem, removeItem, clearCart, syncCart } = require('../controllers/cart');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth); // All cart routes require auth

router.route('/')
  .get(getCart)
  .post(addItem)
  .delete(clearCart);

router.post('/sync', syncCart);
router.delete('/item', removeItem); // Using DELETE with request body for item removal

module.exports = router;
