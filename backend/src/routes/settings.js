const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settings');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateSettingsSchema } = require('../utils/validationSchemas');

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(requireAuth, requireAdmin, validate(updateSettingsSchema), updateSettings);

module.exports = router;
