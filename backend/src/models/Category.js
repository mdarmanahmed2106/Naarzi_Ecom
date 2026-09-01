const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  image: {
    type: String,
    required: [true, 'Category image is required']
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  }
}, {
  timestamps: true
});

// Generate slug before saving
categorySchema.pre('save', function () {
  if (!this.isModified('name')) {
    return;
  }
  this.slug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
});

module.exports = mongoose.model('Category', categorySchema);
