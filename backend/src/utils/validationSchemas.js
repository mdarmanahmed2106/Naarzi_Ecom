const { z } = require('zod');

// Authentication Schemas
const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please provide a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email'),
    password: z.string().min(1, 'Password is required')
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
  images: z.array(z.string().url('Images must be valid URLs')).min(1, 'At least one image is required'),
  sizes: z.array(sizeStockSchema).min(1, 'At least one size stock must be specified')
});

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price cannot be negative'),
    discountedPrice: z.number().min(0, 'Discounted price cannot be negative').optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    occasion: z.array(z.string()).default([]),
    colors: z.array(colorVariantSchemaInput).min(1, 'At least one color variant must be provided'),
    tags: z.array(z.string()).default([]),
    isFeatured: z.boolean().default(false),
    isBestSeller: z.boolean().default(false)
  })
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    price: z.number().min(0, 'Price cannot be negative').optional(),
    discountedPrice: z.number().min(0, 'Discounted price cannot be negative').optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').optional(),
    occasion: z.array(z.string()).optional(),
    colors: z.array(colorVariantSchemaInput).min(1, 'At least one color variant must be provided').optional(),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional()
  })
});

// Order Schemas
const orderItemInputSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  size: z.string().min(1, 'Size is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1')
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
    items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
    shippingAddress: addressInputSchema
  })
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(['processing', 'shipped', 'delivered', 'cancelled'])
  })
});

// Review Schemas
const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
    comment: z.string().min(3, 'Comment must be at least 3 characters')
  })
});

module.exports = {
  signupSchema,
  loginSchema,
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createReviewSchema
};
