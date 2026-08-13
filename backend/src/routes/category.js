const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../utils/validationSchemas');

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(requireAuth, requireAdmin, validate(createCategorySchema), createCategory);

router.route('/:idOrSlug')
  .get(getCategory);

router.route('/:id')
  .put(requireAuth, requireAdmin, validate(updateCategorySchema), updateCategory)
  .delete(requireAuth, requireAdmin, deleteCategory);

module.exports = router;
