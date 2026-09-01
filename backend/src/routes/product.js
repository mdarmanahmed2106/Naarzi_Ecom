const express = require('express');
const {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  getFilters,
  createProduct,
  updateProduct,
  deleteProduct,
  getSearchSuggestions
} = require('../controllers/product');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProductSchema, updateProductSchema } = require('../utils/validationSchemas');
const reviewRouter = require('./review');

const router = express.Router();

// General product query
router.route('/')
  .get(getProducts)
  .post(requireAuth, requireAdmin, validate(createProductSchema), createProduct);

// Specific lists - must be defined BEFORE :slug route
router.get('/search-suggestions', getSearchSuggestions);
router.get('/filters', getFilters);
router.get('/featured', getFeaturedProducts);
router.get('/best-sellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);

// Single product by slug
router.get('/:slug', getProductBySlug);

// Admin modification by id
router.route('/:id')
  .put(requireAuth, requireAdmin, validate(updateProductSchema), updateProduct)
  .delete(requireAuth, requireAdmin, deleteProduct);

// Re-route into other resource routers
router.use('/:productId/reviews', reviewRouter);

module.exports = router;
