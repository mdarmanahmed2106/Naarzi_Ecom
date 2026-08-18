const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const products = await Product.find({ 'images': { $regex: 'aida/' } });
  for (let p of products) {
    p.images = p.images.map(img => img.replace('/aida/', '/aida-public/'));
    await p.save();
  }
  const categories = await Category.find({ 'image': { $regex: 'aida/' } });
  for (let c of categories) {
    c.image = c.image.replace('/aida/', '/aida-public/');
    await c.save();
  }
  console.log('Fixed broken images');
  process.exit(0);
});
