const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/Product');

async function testUpdate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const product = await Product.findOne({});
  console.log('Before update:', product.isOnSale);

  product.set({ isOnSale: true });
  await product.save();

  const updatedProduct = await Product.findById(product._id);
  console.log('After update:', updatedProduct.isOnSale);

  await mongoose.disconnect();
}

testUpdate().catch(console.error);
