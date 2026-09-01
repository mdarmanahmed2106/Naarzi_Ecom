const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

/**
 * Base fetch wrapper to interact with the backend API
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Set credentials to 'include' to ensure HTTP cookies are sent and stored
  const headers = { ...options.headers };
  const isFormData = options.body && options.body instanceof FormData;

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Fallback to Bearer token if cookie is blocked by cross-site policies on localhost
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const defaultOptions = {
    credentials: 'include',
    cache: 'no-store', // Prevent Next.js from caching GET requests aggressively
    ...options,
    headers,
  };

  // If body is object (and not FormData), stringify it
  if (defaultOptions.body && typeof defaultOptions.body === 'object' && !isFormData) {
    defaultOptions.body = JSON.stringify(defaultOptions.body);
  }

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong with the API request');
    }

    // Save token if provided (fallback for cross-site cookie blocking on localhost)
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
    }

    return data;
  } catch (error) {
    if (endpoint !== '/auth/me') {
      console.error(`API Fetch Error [${endpoint}]:`, error.message);
    }
    throw error;
  }
}

// Authentication API
export const authApi = {
  signup: (userData) => fetchApi('/auth/signup', { method: 'POST', body: userData }),
  login: (credentials) => fetchApi('/auth/login', { method: 'POST', body: credentials }),
  phoneAuth: (idToken) => fetchApi('/auth/phone', { method: 'POST', body: { idToken } }),
  completeProfile: (data) => fetchApi('/auth/complete-profile', { method: 'PUT', body: data }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    return fetchApi('/auth/logout', { method: 'POST' });
  },
  getMe: () => fetchApi('/auth/me'),
  updateProfile: (profileData) => fetchApi('/auth/me', { method: 'PUT', body: profileData }),
  addAddress: (addressData) => fetchApi('/auth/me/addresses', { method: 'POST', body: addressData }),
  deleteAddress: (id) => fetchApi(`/auth/me/addresses/${id}`, { method: 'DELETE' }),
};

// Categories API
export const categoriesApi = {
  getAll: () => fetchApi('/categories'),
  getOne: (idOrSlug) => fetchApi(`/categories/${idOrSlug}`),
  create: (categoryData) => fetchApi('/categories', { method: 'POST', body: categoryData }),
  update: (id, categoryData) => fetchApi(`/categories/${id}`, { method: 'PUT', body: categoryData }),
  delete: (id) => fetchApi(`/categories/${id}`, { method: 'DELETE' }),
};

// Products API
export const productsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return fetchApi(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getSuggestions: (query) => fetchApi(`/products/search-suggestions?q=${encodeURIComponent(query)}`),
  getBySlug: (slug) => fetchApi(`/products/${slug}`),
  getFeatured: () => fetchApi('/products/featured'),
  getBestSellers: () => fetchApi('/products/best-sellers'),
  getNewArrivals: () => fetchApi('/products/new-arrivals'),
  getFilters: () => fetchApi('/products/filters'),
  create: (productData) => fetchApi('/products', { method: 'POST', body: productData }),
  update: (id, productData) => fetchApi(`/products/${id}`, { method: 'PUT', body: productData }),
  delete: (id) => fetchApi(`/products/${id}`, { method: 'DELETE' }),
};

// Wishlist API
export const wishlistApi = {
  get: () => fetchApi('/wishlist'),
  add: (productId) => fetchApi(`/wishlist/${productId}`, { method: 'POST' }),
  remove: (productId) => fetchApi(`/wishlist/${productId}`, { method: 'DELETE' }),
};

// Upload API
export const uploadApi = {
  uploadImage: (formData) => fetchApi('/upload', { method: 'POST', body: formData }),
};

// Reviews API
export const reviewsApi = {
  getByProduct: (productId) => fetchApi(`/products/${productId}/reviews`),
  create: (productId, reviewData) => fetchApi(`/products/${productId}/reviews`, { method: 'POST', body: reviewData }),
};

// Order & Payment API
export const ordersApi = {
  create: (orderData) => fetchApi('/orders', { method: 'POST', body: orderData }),
  getMyOrders: () => fetchApi('/orders/my-orders'),
  getDetails: (id) => fetchApi(`/orders/${id}`),
  getAll: () => fetchApi('/orders'),
  updateStatus: (id, status) => fetchApi(`/orders/${id}/status`, { method: 'PUT', body: { orderStatus: status } }),
  cancelOrder: (orderId) => fetchApi(`/orders/${orderId}/cancel`, { method: 'POST' }),
};

export const paymentApi = {
  createRazorpayOrder: (orderId) => fetchApi('/payment/create-order', { method: 'POST', body: { orderId } }),
  verifyPayment: (paymentDetails) => fetchApi('/payment/verify', { method: 'POST', body: paymentDetails }),
};

export const adminApi = {
  getReviews: () => fetchApi('/admin/reviews'),
  deleteReview: (id) => fetchApi(`/admin/reviews/${id}`, { method: 'DELETE' }),
  getCustomers: () => fetchApi('/admin/users'),
  getAbandonedCarts: (olderThanHours = 2, sortBy = 'date') => fetchApi(`/admin/abandoned-carts?olderThanHours=${olderThanHours}&sortBy=${sortBy}`),
  getWishlistInsights: () => fetchApi('/admin/wishlist-insights'),
  getWishlistCustomers: () => fetchApi('/admin/wishlist-insights/customers'),
};

export const promoBannersApi = {
  getAll: (all = false) => fetchApi(`/promo-banners${all ? '?all=true' : ''}`),
  create: (data) => fetchApi('/promo-banners', { method: 'POST', body: data }),
  update: (id, data) => fetchApi(`/promo-banners/${id}`, { method: 'PUT', body: data }),
  delete: (id) => fetchApi(`/promo-banners/${id}`, { method: 'DELETE' }),
};

export const couponsApi = {
  validate: (code, cartTotal) => fetchApi('/coupons/validate', { method: 'POST', body: { code, cartTotal } }),
  getAll: () => fetchApi('/coupons'),
  create: (data) => fetchApi('/coupons', { method: 'POST', body: data }),
  update: (id, data) => fetchApi(`/coupons/${id}`, { method: 'PUT', body: data }),
  delete: (id) => fetchApi(`/coupons/${id}`, { method: 'DELETE' }),
};

export const cartApi = {
  get: () => fetchApi('/cart'),
  add: (data) => fetchApi('/cart', { method: 'POST', body: data }),
  remove: (data) => fetchApi('/cart/item', { method: 'DELETE', body: data }), // product and size in body
  clear: () => fetchApi('/cart', { method: 'DELETE' }),
  sync: (items) => fetchApi('/cart/sync', { method: 'POST', body: { items } }),
};
