const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

// @desc    Get all products (with pagination, filters, sorting)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category, occasion, minPrice, maxPrice, sort, page = 1, limit = 10, search, inStock, size, color, tag } = req.query;

    const MAX_LIMIT = 100;
    const parsedLimit = Math.min(parseInt(limit, 10) || 10, MAX_LIMIT);

    const query = {};

    // 0. Availability Filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      query.stock = 0;
    }

    // 0.5 Size Filter
    if (size) {
      const sizesArray = Array.isArray(size) ? size : size.split(',');
      query['colors.sizes'] = {
        $elemMatch: {
          size: { $in: sizesArray },
          stock: { $gt: 0 }
        }
      };
    }

    // 0.75 Color Filter
    if (color) {
      const colorsArray = Array.isArray(color) ? color : color.split(',');
      query['colors.name'] = { $in: colorsArray };
    }

    // 0.85 Tag Filter
    if (tag) {
      const tagsArray = Array.isArray(tag) ? tag : tag.split(',');
      if (tagsArray.includes('sale')) {
        query.isOnSale = true;
        // Remove 'sale' from array to check other tags
        const otherTags = tagsArray.filter(t => t !== 'sale');
        if (otherTags.length > 0) {
          query.tags = { $in: otherTags };
        }
      } else {
        query.tags = { $in: tagsArray };
      }
    }

    // 1. Category Filter (can be category ID or slug)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        // Find category by slug first
        const foundCategory = await Category.findOne({ slug: category });
        if (foundCategory) {
          query.category = foundCategory._id;
        } else {
          // If category slug not found, return empty results
          return res.status(200).json({
            success: true,
            count: 0,
            pagination: { page: Number(page), limit: parsedLimit, totalPages: 0, totalProducts: 0 },
            data: []
          });
        }
      }
    }

    // 2. Occasion Filter (shop by occasion)
    if (occasion) {
      // Handles single string or array of occasion strings
      query.occasion = Array.isArray(occasion) ? { $in: occasion } : occasion;
    }

    // 3. Price Filter (handles original price and discountedPrice)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const min = Number(minPrice) || 0;
      const max = Number(maxPrice) || Infinity;

      query.$or = [
        {
          discountedPrice: { $exists: true, $ne: null },
          $expr: {
            $and: [
              { $gte: ['$discountedPrice', min] },
              { $lte: ['$discountedPrice', max] }
            ]
          }
        },
        {
          $or: [
            { discountedPrice: { $exists: false } },
            { discountedPrice: null }
          ],
          price: { $gte: min, $lte: max }
        }
      ];
    }

    // 4. Text Search Filter (name/description indexes)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 5. Sorting
    let sortBy = '-createdAt'; // Default sort
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortBy = 'price';
          break;
        case 'price-desc':
          sortBy = '-price';
          break;
        case 'newest':
          sortBy = '-createdAt';
          break;
        default:
          sortBy = sort;
      }
    }

    // 6. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parsedLimit);
    const skipNum = (pageNum - 1) * limitNum;

    // Execute query
    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip(skipNum)
      .limit(limitNum);

    const totalPages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        currentPage: pageNum,
        limit: limitNum,
        totalPages,
        totalProducts
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available filters (colors, sizes)
// @route   GET /api/products/filters
// @access  Public
exports.getFilters = async (req, res, next) => {
  try {
    const products = await Product.find().select('colors');
    
    const colorMap = new Map();
    const sizeSet = new Set();

    products.forEach(product => {
      product.colors.forEach(color => {
        if (color.name && color.hexCode) {
          colorMap.set(color.name, color.hexCode);
        }
        color.sizes.forEach(size => {
          if (size.stock > 0) {
            sizeSet.add(size.size);
          }
        });
      });
    });

    const colors = Array.from(colorMap.entries()).map(([name, hexCode]) => ({ name, hexCode }));
    // Define a standard size order to sort sizes
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'One Size'];
    const sizes = Array.from(sizeSet).sort((a, b) => {
      const idxA = sizeOrder.indexOf(a);
      const idxB = sizeOrder.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    res.status(200).json({
      success: true,
      data: {
        colors,
        sizes
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug (with populated category and reviews)
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug }).populate('category', 'name slug parentCategory');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Fetch reviews for this product
    const reviews = await Review.find({ product: product._id })
      .populate('user', 'name')
      .sort('-createdAt');

    // Combine reviews into the response
    const productData = product.toObject();
    productData.reviews = reviews;

    res.status(200).json({
      success: true,
      data: productData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name slug')
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
exports.getBestSellers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ isBestSeller: true })
      .populate('category', 'name slug')
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find()
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    console.log('Incoming product payload:', JSON.stringify(req.body, null, 2));
    
    // Check if category exists
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Category does not exist.'
      });
    }

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check category if provided
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Category does not exist.'
        });
      }
    }

    // Update fields using .set() to ensure Mongoose tracks changes to subdocuments correctly
    product.set(req.body);

    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    // Also delete associated reviews
    await Review.deleteMany({ product: id });

    res.status(200).json({
      success: true,
      message: 'Product and associated reviews deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get search word suggestions
// @route   GET /api/products/search-suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const regex = new RegExp('^' + q, 'i');
    
    // Find tags that match
    const products = await Product.find({
      $or: [
        { tags: regex },
        { name: { $regex: q, $options: 'i' } } 
      ]
    }, 'name tags').limit(50);

    const words = new Set();
    
    products.forEach(p => {
      p.tags.forEach(t => {
        if (regex.test(t)) words.add(t.toLowerCase());
      });
      p.name.split(/\s+/).forEach(w => {
        if (regex.test(w)) words.add(w.toLowerCase().replace(/[^a-z0-9]/g, ''));
      });
    });

    const suggestions = Array.from(words).filter(w => w.length > 1).slice(0, 5);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};
