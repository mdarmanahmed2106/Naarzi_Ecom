/**
 * One-off migration to the NAARZI brand-doc catalogue structure.
 *  - Creates the five brand categories (skips any that already exist)
 *  - Moves products into them
 *  - Adds shop-by-occasion tags (workwear / festive / everyday)
 *
 * Dry run (default, writes nothing):  node scripts/migrateBrandCategories.js
 * Apply:                               node scripts/migrateBrandCategories.js --apply
 * Old categories (Tops, Kurti, Bottoms, Accessories) are left untouched.
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');

const APPLY = process.argv.includes('--apply');
const SHOP_URL = 'https://naarzi-shop.vercel.app';

const productImage = (p) => p?.colors?.[0]?.images?.[0] || p?.images?.[0] || null;

// Category -> image source. `fromProduct` uses that product's first photo.
const CATEGORIES = [
  { name: 'Shirts', fromProduct: 'celestial-bloom' },
  { name: 'Kurtis & Tunics', fromProduct: 'white-cotton-kurti' },
  { name: 'Co-ord Sets', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Suit Sets', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Skirts', image: `${SHOP_URL}/hero_image.png` }, // placeholder until a skirt photo exists
];

// product slug -> { category: new category slug (optional), occasion: tags to add }
const PRODUCTS = {
  'celestial-bloom': { category: 'shirts', occasion: ['workwear'] },
  'white-cotton-kurti': { category: 'kurtis-tunics', occasion: ['everyday'] },
  'ethenic-kurti': { category: 'kurtis-tunics', occasion: ['everyday', 'festive'] },
  'cotton-trousers': { occasion: ['workwear', 'everyday'] },
  'oxidised-jhumkas': { occasion: ['festive'] },
};

(async () => {
  // Same Windows SRV-lookup workaround as src/config/db.js
  try {
    require('dns').setServers(['8.8.8.8', '1.1.1.1']);
  } catch (_) {}
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(APPLY ? '=== APPLYING CHANGES ===' : '=== DRY RUN (nothing will be written) ===');

  const products = await Product.find({ slug: { $in: Object.keys(PRODUCTS) } }).populate('category', 'slug name');
  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
  for (const slug of Object.keys(PRODUCTS)) if (!bySlug[slug]) console.log(`! product not found: ${slug}`);

  // 1. Categories
  const catBySlug = {};
  console.log('\nCategories:');
  for (const def of CATEGORIES) {
    const existing = await Category.findOne({ name: def.name });
    if (existing) {
      catBySlug[existing.slug] = existing;
      console.log(`  = ${def.name} already exists (${existing.slug}) — unchanged`);
      continue;
    }
    const image = def.fromProduct ? productImage(bySlug[def.fromProduct]) : def.image;
    if (!image) throw new Error(`No image for ${def.name}`);
    if (APPLY) {
      const created = await Category.create({ name: def.name, image });
      catBySlug[created.slug] = created;
      console.log(`  + created ${def.name} (${created.slug})`);
    } else {
      console.log(`  + would create ${def.name}  image: ${image.slice(0, 70)}${image.length > 70 ? '…' : ''}`);
    }
  }

  // 2. Products
  console.log('\nProducts:');
  for (const [slug, plan] of Object.entries(PRODUCTS)) {
    const p = bySlug[slug];
    if (!p) continue;
    const update = {};
    const notes = [];
    if (plan.category) {
      const target = catBySlug[plan.category];
      notes.push(`category ${p.category?.name || '?'} → ${target?.name || plan.category}`);
      if (target) update.$set = { category: target._id };
    }
    const newTags = plan.occasion.filter((o) => !(p.occasion || []).map((x) => x.toLowerCase()).includes(o));
    if (newTags.length) {
      notes.push(`occasion + ${newTags.join(', ')}`);
      update.$addToSet = { occasion: { $each: newTags } };
    }
    console.log(`  ${APPLY ? '✓' : '~'} ${p.name}: ${notes.join(' | ') || 'nothing to change'}`);
    if (APPLY && Object.keys(update).length) await Product.updateOne({ _id: p._id }, update);
  }

  await mongoose.disconnect();
  console.log(APPLY ? '\nDone.' : '\nDry run complete. Re-run with --apply to write these changes.');
})().catch(async (err) => {
  console.error('Migration failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
