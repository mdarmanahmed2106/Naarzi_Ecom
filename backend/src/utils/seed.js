const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const categories = [
  {
    name: 'Apparel',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtork6ssYpfQA6W2NqJINuPD0xbj3bVehnkTeT1a_rv3XitDFkP5ck_BWnraji_Tz_00N2py3RAmNNvgzkjG3-N4umFmrGWZj8a3o7zG8Z5Ps7rjVa0OZ_o-ulIDdncS5yjJHOT5VGPe8eeisqt24GL34-MGtBhORVp4x3CgoSRrNFf0G2o-_DlzrxDwRRs18MHSR33VmxdpXo1CdtC9lF4vyvxAm9uVilAhMNPsgjOASSxzubt55dIuaxy'
  },
  {
    name: 'Accessories',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvQZoQMvvK9ENazXEmtiy12HK2M0WhnRBvXdLEaAiNdff3SGyDdIrc5sOhTiLuh5SW3Sht-Cv4fUlZ3_coK_OGtF2xJx5xwRPUBjBBsZFMZ4j38k12_IdBzRXzIiUxQOJPbolYn4HSCJ5Jiu1bK3pgnpags2xpsrBd2svT2L7vvv-1X0kEhDIVApMOk-k_jJSCOPUJyBrHFr8mYmn_06B0CcRcHAx6vofauWpeqFBnBQ7fCAZCC6-LEz-4'
  },
  {
    name: 'Resort',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLue8q7KBq8NRPdoVsB-Ss2K9mtkUh2W48y_oRra9g-28X3rBJUX9nYZVBgrNuftBmURFLGAxoWBDiHBtGKU_CQe5se06BdixWuKGd49AFd57SmE0ErJOYEyA8muHMaz4R7jZvrTaAMQhjBwli7O67zfycy9LcCqE8yzdB27X504m5RqJ8CuY3Zv-9RjPEwqkzHYKpAQamYiD9C4OoMwgfm2fOV1RD2goAyNz0dK-hZTHu8RApy-eagWqTbH'
  }
];

const products = (categoryIds) => [
  {
    name: 'Ethereal Linen Midi Dress',
    description: 'Consciously crafted from premium organic linen, the Ethereal Linen Midi Dress features a relaxed silhouette, sun-drenched warm tones, a delicate button-down front, and lightweight side pockets. Perfect for coastal getaways and warm summer afternoons.',
    price: 8900,
    discountedPrice: 7900,
    category: categoryIds['Apparel'],
    occasion: ['Coastal', 'Summer Wear', 'Resort'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPVJ6QNLPZlv9RsCQciX9Ocir9Ds-obAX59drtVNrw7wYctIkuWe_e1pqr4JpIlTtsE5_w6XfnFP7RAl61FC6TVjEJTC1fx2UbKWiKzUP8mT6jmTczzELWbVwcex5Wyu09h_fLFllHCYl7fInxLRLfJ4tZ68A_C52gHj1H8SKWjDwpbdJTBN_bGt69rYOMVZDLFJmpO8HFsXHafbmNGZmudRnukwFJzoLxUghCXTmvMLQbm3dUyOlvGw',
      'https://lh3.googleusercontent.com/aida/AP1WRLtork6ssYpfQA6W2NqJINuPD0xbj3bVehnkTeT1a_rv3XitDFkP5ck_BWnraji_Tz_00N2py3RAmNNvgzkjG3-N4umFmrGWZj8a3o7zG8Z5Ps7rjVa0OZ_o-ulIDdncS5yjJHOT5VGPe8eeisqt24GL34-MGtBhORVp4x3CgoSRrNFf0G2o-_DlzrxDwRRs18MHSR33VmxdpXo1CdtC9lF4vyvxAm9uVilAhMNPsgjOASSxzubt55dIuaxy'
    ],
    sizes: [
      { size: 'XS', stock: 10 },
      { size: 'S', stock: 15 },
      { size: 'M', stock: 20 },
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 8 }
    ],
    tags: ['new arrival', 'trending', 'featured'],
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Silk Camisole in Deep Wine',
    description: 'A luxurious silk camisole in our signature Deep Wine colorway. Drapes fluidly over the body, featuring delicate adjustable spaghetti straps, a soft cowl neck, and fine double-stitched margins. Ideal as a layering luxury block or a stand-alone resort top.',
    price: 4900,
    category: categoryIds['Apparel'],
    occasion: ['Evening Wear', 'Resort', 'Layering'],
    images: [
      'https://lh3.googleusercontent.com/aida/AP1WRLuwbVtOXdrb3zdk3EkZNAYsYDMcjI2Uvg1gu0lmnIiVbCsJ1bPWsmB5lKQBX6yGZcratFfqfDaMiNBw4a3Oi_oBUGkzFJr7bXZIfG1d5Q324u_YsRt5ROKVe7C6amQF15jezlafwLwmfOftrQSejvgG3VxXAxoxwA8LhKSasDUvrk28pLa6Wp2bRRRJmAVGDmtgiccat1cYRCf8MSzUZvnEOYhctK22eXsBy3jDH1EYJeBwMmx3jM4bN7a1'
    ],
    sizes: [
      { size: 'S', stock: 8 },
      { size: 'M', stock: 12 },
      { size: 'L', stock: 10 }
    ],
    tags: ['trending', 'new arrival'],
    isFeatured: true,
    isBestSeller: false
  },
  {
    name: 'Wide-Leg Linen Trousers',
    description: 'Relaxed and breathable wide-leg trousers crafted from premium sun-bleached linen. Built with a supportive elasticated waistband, drawstring adjusters, and deep-slitted pockets. Perfect for relaxing beach strolls.',
    price: 6500,
    category: categoryIds['Resort'],
    occasion: ['Resort', 'Beach Wear'],
    images: [
      'https://lh3.googleusercontent.com/aida/AP1WRLue8q7KBq8NRPdoVsB-Ss2K9mtkUh2W48y_oRra9g-28X3rBJUX9nYZVBgrNuftBmURFLGAxoWBDiHBtGKU_CQe5se06BdixWuKGd49AFd57SmE0ErJOYEyA8muHMaz4R7jZvrTaAMQhjBwli7O67zfycy9LcCqE8yzdB27X504m5RqJ8CuY3Zv-9RjPEwqkzHYKpAQamYiD9C4OoMwgfm2fOV1RD2goAyNz0dK-hZTHu8RApy-eagWqTbH'
    ],
    sizes: [
      { size: 'S', stock: 10 },
      { size: 'M', stock: 15 },
      { size: 'L', stock: 15 },
      { size: 'XL', stock: 5 }
    ],
    tags: ['featured'],
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Delicate Pearl Pendant Necklace',
    description: 'An elegant antique gold chain necklace featuring a single hand-selected freshwater pearl. Adds a touch of quiet sophistication to any resort ensemble.',
    price: 3200,
    category: categoryIds['Accessories'],
    occasion: ['Accessories', 'Gifts'],
    images: [
      'https://lh3.googleusercontent.com/aida/AP1WRLvQZoQMvvK9ENazXEmtiy12HK2M0WhnRBvXdLEaAiNdff3SGyDdIrc5sOhTiLuh5SW3Sht-Cv4fUlZ3_coK_OGtF2xJx5xwRPUBjBBsZFMZ4j38k12_IdBzRXzIiUxQOJPbolYn4HSCJ5Jiu1bK3pgnpags2xpsrBd2svT2L7vvv-1X0kEhDIVApMOk-k_jJSCOPUJyBrHFr8mYmn_06B0CcRcHAx6vofauWpeqFBnBQ7fCAZCC6-LEz-4'
    ],
    sizes: [
      { size: 'One Size', stock: 50 }
    ],
    tags: ['new arrival'],
    isFeatured: false,
    isBestSeller: false
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing DB entries
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('Cleared existing products and categories.');

    // Add Categories
    const createdCategories = [];
    for (const cat of categories) {
      const c = await Category.create(cat);
      createdCategories.push(c);
    }
    console.log(`Inserted ${createdCategories.length} categories.`);

    // Map Category IDs
    const categoryIds = {};
    createdCategories.forEach((c) => {
      categoryIds[c.name] = c._id;
    });

    // Add Products
    const productsToInsert = products(categoryIds);
    const createdProducts = [];
    for (const prod of productsToInsert) {
      const p = await Product.create(prod);
      createdProducts.push(p);
    }
    console.log(`Inserted ${createdProducts.length} products.`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
