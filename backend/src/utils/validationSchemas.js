const { z } = require('zod');

// Authentication Schemas
const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email'),
    password: z.string().min(1, 'Password is required')
  })
});

const emailCodeSendSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please enter a valid email address')
  })
});

const emailCodeVerifySchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please enter a valid email address'),
    code: z.string().trim().regex(/^\d{6}$/, 'The code is 6 digits')
  })
});

const completeProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Please provide a valid email').optional()
  })
});

// Category Schemas
const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    image: z.string().url('Category image must be a valid URL'),
    parentCategory: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID').optional().nullable()
  })
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').optional(),
    image: z.string().url('Category image must be a valid URL').optional(),
    parentCategory: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID').optional().nullable()
  })
});

// Product Schemas
const sizeStockSchema = z.object({
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'One Size']),
  stock: z.number().int().min(0, 'Stock cannot be negative')
});
const colorVariantSchemaInput = z.object({
  name: z.string().min(1, 'Color name is required'),
  hexCode: z.string().optional(),
  // Photos and sizes can be added later; the shop hides the product until they're there
  images: z.array(z.string().url('Images must be valid URLs')).default([]),
  sizes: z.array(sizeStockSchema).default([])
});

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().refine((d) => d === '' || d.length >= 10, 'Description must be at least 10 characters').default(''),
    details: z.array(z.string()).default([]),
    careInstructions: z.string().max(1000, 'Care instructions must be 1000 characters or fewer').optional(),
    price: z.number().min(0, 'Price cannot be negative'),
    discountedPrice: z.number().positive('Discounted price must be more than 0').nullable().optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').nullable().optional(),
    occasion: z.array(z.string()).default([]),
    colors: z.array(colorVariantSchemaInput).default([]),
    tags: z.array(z.string()).default([]),
    isOnSale: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    isBestSeller: z.boolean().default(false)
  })
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
    description: z.string().refine((d) => d === '' || d.length >= 10, 'Description must be at least 10 characters').optional(),
    details: z.array(z.string()).optional(),
    careInstructions: z.string().max(1000, 'Care instructions must be 1000 characters or fewer').optional(),
    price: z.number().min(0, 'Price cannot be negative').optional(),
    discountedPrice: z.number().positive('Discounted price must be more than 0').nullable().optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').nullable().optional(),
    occasion: z.array(z.string()).optional(),
    colors: z.array(colorVariantSchemaInput).optional(),
    tags: z.array(z.string()).optional(),
    isOnSale: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional()
  })
});

// Order Schemas
const orderItemInputSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  size: z.string().min(1, 'Size is required'),
  // The colour the customer picked. Optional only for older carts saved before colours existed;
  // the server then falls back to the product's first colour.
  color: z.string().trim().min(1).max(100).optional(),
  // Capped so a single order can't reserve a whole size's stock (matches MAX_QTY_PER_LINE in the
  // storefront's AppContext)
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'You can order at most 10 of an item')
});

const addressInputSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required').default('India'),
  phone: z.string().optional()
});

const createOrderSchema = z.object({
  body: z.object({
    items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item').max(30, 'An order can contain at most 30 items'),
    // Without this, Zod strips the code and the order is charged without the discount
    couponCode: z.string().trim().max(50).nullable().optional(),
    shippingAddress: addressInputSchema
  })
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(['processing', 'shipped', 'delivered', 'cancelled']),
    trackingNumber: z.string().trim().max(100).optional(),
    carrier: z.string().trim().max(100).optional(),
    estimatedDelivery: z.string().optional()
  })
});

// Review Schemas
const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
    comment: z.string().min(3, 'Comment must be at least 3 characters')
  })
});

// Settings Schema
const updateSettingsSchema = z.object({
  body: z.object({
    freeShippingThreshold: z.number().min(0, 'Free shipping threshold cannot be negative').optional(),
    shippingCost: z.number().min(0, 'Shipping cost cannot be negative').optional(),
    lowStockThreshold: z.number().int('Low stock threshold must be a whole number').min(0, 'Low stock threshold cannot be negative').max(1000, 'Low stock threshold is too high').optional()
  })
});

module.exports = {
  signupSchema,
  loginSchema,
  completeProfileSchema,
  emailCodeSendSchema,
  emailCodeVerifySchema,
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createReviewSchema,
  updateSettingsSchema
};
