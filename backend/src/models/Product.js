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
    required: [true, 'Product description is required']
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  occasion: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    required: [true, 'At least one product image is required'],
    validate: {
      validator: function (val) {
        return val.length > 0;
      },
      message: 'At least one image URL must be provided'
    }
  },
  sizes: {
    type: [sizeSchema],
    required: [true, 'Product sizes are required'],
    validate: {
      validator: function (val) {
        return val.length > 0;
      },
      message: 'At least one size stock must be specified'
    }
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

  // Update total stock based on sizes
  if (this.isModified('sizes')) {
    this.stock = this.sizes.reduce((total, s) => total + s.stock, 0);
  }
});

module.exports = mongoose.model('Product', productSchema);
