const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/order');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOrderSchema, updateOrderStatusSchema } = require('../utils/validationSchemas');

const router = express.Router();

router.use(requireAuth);

router.route('/')
  .post(validate(createOrderSchema), createOrder)
  .get(requireAdmin, getAllOrders);

// Static routes must be registered before dynamic parameter routes
router.get('/my-orders', getMyOrders);

router.route('/:id')
  .get(getOrder);

router.put('/:id/status', requireAdmin, validate(updateOrderStatusSchema), updateOrderStatus);

module.exports = router;
