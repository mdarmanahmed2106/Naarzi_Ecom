'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'

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

  // Cart actions
  const addToCart = (product, size, quantity = 1) => {
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
  };

  const removeFromCart = (productId, size) => {
    const updatedCart = cartItems.filter(
      (item) => !(item.product._id === productId && item.size === size)
    );
    saveCart(updatedCart);
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
  };

  const clearCart = () => {
    saveCart([]);
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
