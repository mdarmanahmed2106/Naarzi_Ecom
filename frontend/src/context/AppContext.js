'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authApi, wishlistApi, cartApi } from '@/lib/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const quantityDebounceRef = useRef(null);

  // Load user profile on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await authApi.getMe();
        if (response.success) {
          setUser(response.user);
        }
      } catch (err) {
        console.log('No active session / user not logged in.');
      } finally {
        setAuthLoading(false);
      }
    }
    loadUser();
  }, []);

  // Sync local cart to server when user logs in
  useEffect(() => {
    async function syncCartWithServer() {
      if (!user) return;
      
      const localCart = localStorage.getItem('naarzi_cart');
      let itemsToSync = [];
      if (localCart) {
        try {
          itemsToSync = JSON.parse(localCart);
        } catch (e) {}
      }

      try {
        const response = await cartApi.sync(itemsToSync);
        if (response.success && response.data) {
          saveCart(response.data.items || []);
        }
      } catch (err) {
        console.error('Failed to sync cart:', err);
      }
    }
    syncCartWithServer();
  }, [user]);

  // Load wishlist on user changes
  useEffect(() => {
    async function loadWishlist() {
      if (!user) {
        setWishlistItems([]);
        setWishlistLoading(false);
        return;
      }
      setWishlistLoading(true);
      try {
        const response = await wishlistApi.get();
        if (response.success && response.data) {
          setWishlistItems(response.data.products || []);
        }
      } catch (err) {
        console.error('Failed to load wishlist in AppContext:', err);
      } finally {
        setWishlistLoading(false);
      }
    }
    loadWishlist();
  }, [user]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('naarzi_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart from local storage:', err);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('naarzi_cart', JSON.stringify(items));
  };

  // Auth actions
  const login = async (credentials) => {
    setAuthLoading(true);
    try {
      const response = await authApi.login(credentials);
      if (response.success) {
        setUser(response.user);
        setIsAuthOpen(false);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (userData) => {
    setAuthLoading(true);
    try {
      const response = await authApi.signup(userData);
      if (response.success) {
        setUser(response.user);
        setIsAuthOpen(false);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  // Wishlist actions
  const addToWishlist = async (productId) => {
    try {
      const response = await wishlistApi.add(productId);
      if (response.success && response.data) {
        setWishlistItems(response.data.products || []);
        return { success: true };
      }
      return { success: false, message: response.message || 'Failed to add to wishlist' };
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      return { success: false, message: error.message };
    }
  };

  const removeFromWishlist = async (productId) => {
    // Optimistic Update
    const previousWishlist = [...wishlistItems];
    setWishlistItems(wishlistItems.filter(item => item._id !== productId));

    try {
      const response = await wishlistApi.remove(productId);
      if (response.success && response.data) {
        setWishlistItems(response.data.products || []);
        return { success: true };
      }
      // Revert on error/non-success
      setWishlistItems(previousWishlist);
      return { success: false, message: response.message || 'Failed to remove from wishlist' };
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      setWishlistItems(previousWishlist);
      return { success: false, message: error.message };
    }
  };

  // Cart actions
  const addToCart = async (product, size, quantity = 1) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.product._id === product._id && item.size === size
    );

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart = [...cartItems, { product, size, quantity }];
    }
    saveCart(updatedCart);
    setIsCartOpen(true); // Open cart drawer on add

    // Background sync
    if (user) {
      try {
        const newQuantity = existingIndex > -1 ? updatedCart[existingIndex].quantity : quantity;
        await cartApi.add({ product: product._id, size, quantity: newQuantity });
      } catch (err) {
        console.error('Failed to add item to server cart:', err);
      }
    }
  };

  const removeFromCart = async (productId, size) => {
    const updatedCart = cartItems.filter(
      (item) => !(item.product._id === productId && item.size === size)
    );
    saveCart(updatedCart);

    // Background sync
    if (user) {
      try {
        await cartApi.remove({ product: productId, size });
      } catch (err) {
        console.error('Failed to remove item from server cart:', err);
      }
    }
  };

  const updateCartQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    const updatedCart = cartItems.map((item) =>
      item.product._id === productId && item.size === size
        ? { ...item, quantity }
        : item
    );
    saveCart(updatedCart);

    // Debounced Background sync
    if (user) {
      if (quantityDebounceRef.current) {
        clearTimeout(quantityDebounceRef.current);
      }
      quantityDebounceRef.current = setTimeout(async () => {
        try {
          await cartApi.add({ product: productId, size, quantity });
        } catch (err) {
          console.error('Failed to update cart quantity on server:', err);
        }
      }, 500);
    }
  };

  const clearCart = async () => {
    saveCart([]);
    if (user) {
      try {
        await cartApi.clear();
      } catch (err) {
        console.error('Failed to clear server cart:', err);
      }
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (acc, item) =>
      acc +
      (item.product.discountedPrice !== undefined && item.product.discountedPrice !== null
        ? item.product.discountedPrice
        : item.product.price) *
        item.quantity,
    0
  );

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        login,
        signup,
        logout,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        isAuthOpen,
        setIsAuthOpen,
        authModalTab,
        setAuthModalTab,
        wishlistItems,
        wishlistLoading,
        addToWishlist,
        removeFromWishlist,
        appliedCoupon,
        setAppliedCoupon,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
