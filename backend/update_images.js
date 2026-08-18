const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
require('dotenv').config();

const IMAGES = {
  'Apparel': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop',
  'Accessories': 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600&auto=format&fit=crop',
  'Resort': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
  'Test Category': 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop'
};

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1515347619253-089908064a30?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=600&auto=format&fit=crop'
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const categories = await Category.find({});
  for (let c of categories) {
    if (IMAGES[c.name]) {
      c.image = IMAGES[c.name];
      await c.save();
    }
  }
  
  const products = await Product.find({ 'images': { $regex: 'placehold.co' } });
  let idx = 0;
  for (let p of products) {
    p.images = [PRODUCT_IMAGES[idx % PRODUCT_IMAGES.length]];
    await p.save();
    idx++;
  }
  
  console.log('Updated placeholder images with aesthetic unsplash photos');
  process.exit(0);
});
