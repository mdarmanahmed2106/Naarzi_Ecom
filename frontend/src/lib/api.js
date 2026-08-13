const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Base fetch wrapper to interact with the backend API
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set credentials to 'include' to ensure HTTP cookies are sent and stored
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  // If body is object, stringify it
  if (defaultOptions.body && typeof defaultOptions.body === 'object') {
    defaultOptions.body = JSON.stringify(defaultOptions.body);
  }

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong with the API request');
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// Authentication API
export const authApi = {
  signup: (userData) => fetchApi('/auth/signup', { method: 'POST', body: userData }),
  login: (credentials) => fetchApi('/auth/login', { method: 'POST', body: credentials }),
  logout: () => fetchApi('/auth/logout', { method: 'POST' }),
  getMe: () => fetchApi('/auth/me'),
};

// Categories API
export const categoriesApi = {
  getAll: () => fetchApi('/categories'),
  getOne: (idOrSlug) => fetchApi(`/categories/${idOrSlug}`),
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
  getBySlug: (slug) => fetchApi(`/products/${slug}`),
  getFeatured: () => fetchApi('/products/featured'),
  getBestSellers: () => fetchApi('/products/best-sellers'),
  getNewArrivals: () => fetchApi('/products/new-arrivals'),
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
};

export const paymentApi = {
  createRazorpayOrder: (orderId) => fetchApi('/payment/create-order', { method: 'POST', body: { orderId } }),
  verifyPayment: (paymentDetails) => fetchApi('/payment/verify', { method: 'POST', body: paymentDetails }),
};
