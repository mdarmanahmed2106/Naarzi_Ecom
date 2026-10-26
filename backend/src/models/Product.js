const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'One Size'] // Standard sizes or custom
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  }
}, { _id: false });

const colorVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Color name is required'],
    trim: true
  },
  hexCode: {
    type: String,
    trim: true,
    default: '#000000'
  },
  // Images and sizes may be empty while a product is still being prepared; such a product
  // stays hidden from the shop (see isListed below). The admin form still requires them.
  images: {
    type: [String],
    default: []
  },
  sizes: {
    type: [sizeSchema],
    default: []
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  details: {
    type: [String], // Bullet points: material, fit, origin, etc.
    default: []
  },
  // Washing / care guidance, shown in its own section on the product page
  careInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Care instructions must be 1000 characters or fewer'],
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative'],
    validate: {
      validator: function (value) {
        // If discountedPrice exists, it must be less than price
        if (value !== undefined && value !== null) {
          return value <= this.price;
        }
        return true;
      },
      message: 'Discounted price must be less than or equal to original price'
    }
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  occasion: {
    type: [String],
    default: []
  },
  colors: {
    type: [colorVariantSchema],
    default: []
  },
  stock: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String], // "trending", "new arrival", "limited stock", etc.
    default: []
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create index for search and sorting
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ occasion: 1 });

// Slugify and sum stock before saving
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Update total stock based on sizes in colors
  if (this.isModified('colors')) {
    this.stock = this.colors.reduce((totalStock, colorVariant) => {
      return totalStock + colorVariant.sizes.reduce((sum, size) => sum + size.stock, 0);
    }, 0);
  }
});

// A product is shown in the shop only once it's complete: a description, a category, and at
// least one colour where every colour has a photo and a size. Incomplete products (e.g. added
// from a price list before photos exist) are visible to admins only.
const LISTED_FILTER = {
  description: { $nin: [null, ''] },
  category: { $ne: null },
  'colors.0': { $exists: true },
  colors: { $not: { $elemMatch: { $or: [{ 'images.0': { $exists: false } }, { 'sizes.0': { $exists: false } }] } } }
};
const isListed = (p) => Boolean(
  p && p.description && p.category && p.colors && p.colors.length > 0 &&
  p.colors.every((c) => c.images && c.images.length > 0 && c.sizes && c.sizes.length > 0)
);

const Product = mongoose.model('Product', productSchema);
Product.LISTED_FILTER = LISTED_FILTER;
Product.isListed = isListed;
module.exports = Product;
