const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notification');

const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All notification routes require admin access
router.use(requireAuth);
router.use(requireAdmin);

router.route('/')
  .get(getNotifications);

router.route('/read-all')
  .put(markAllAsRead);

router.route('/:id/read')
  .put(markAsRead);

module.exports = router;
