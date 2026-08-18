const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
require('dotenv').config();

const PLACEHOLDER_IMG = 'https://placehold.co/400x600/F5F5F5/111111?text=Product';

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (err) {
    return false;
  }
}

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const products = await Product.find({});
  let productsUpdated = 0;

  for (let p of products) {
    let changed = false;
    let newImages = [];
    for (let img of p.images) {
      if (img.startsWith('http')) {
        const isOk = await checkUrl(img);
        if (!isOk) {
          newImages.push(PLACEHOLDER_IMG);
          changed = true;
        } else {
          newImages.push(img);
        }
      } else {
        newImages.push(img); // local path
      }
    }
    if (changed) {
      p.images = newImages;
      await p.save();
      productsUpdated++;
    }
  }

  const categories = await Category.find({});
  let categoriesUpdated = 0;

  for (let c of categories) {
    if (c.image && c.image.startsWith('http')) {
      const isOk = await checkUrl(c.image);
      if (!isOk) {
        c.image = PLACEHOLDER_IMG;
        await c.save();
        categoriesUpdated++;
      }
    }
  }

  console.log(`Fixed ${productsUpdated} products and ${categoriesUpdated} categories.`);
  process.exit(0);
});
