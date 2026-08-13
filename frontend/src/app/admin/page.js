'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
import { useApp } from '@/context/AppContext';
import { productsApi, categoriesApi, ordersApi } from '@/lib/api';

function AdminHeader() {
  const { user, logout } = useApp();
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-outline-variant/30 py-4 px-6 md:px-margin-desktop shadow-sm">
      <div className="max-w-container-max mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display-lg text-xl font-bold tracking-widest text-primary hover:opacity-85 transition-opacity">
            NAARZI
          </Link>
          <span className="h-4 w-px bg-outline-variant/60"></span>
          <span className="text-[9px] font-label-caps text-on-surface-variant tracking-wider font-bold">ADMIN PORTAL</span>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] font-label-caps font-bold">
          <Link href="/" className="text-on-surface hover:text-primary transition-colors tracking-widest">
            STOREFRONT
          </Link>
          {user && (
            <button 
              onClick={logout}
              className="text-on-surface hover:text-error transition-colors tracking-widest cursor-pointer bg-transparent border-none font-bold"
            >
              LOG OUT
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AdminDashboardPage() {
  const { user, authLoading, setIsAuthOpen, setAuthModalTab } = useApp();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'inventory' | 'orders'
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Forms State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentProductId, setCurrentProductId] = useState(null);
  
  // Product Form Field States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [occasionsText, setOccasionsText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  
  // Sizes stocks in Form
  const standardSizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'One Size'];
  const [sizesStock, setSizesStock] = useState(
    standardSizesList.reduce((acc, size) => ({ ...acc, [size]: { enabled: false, stock: 0 } }), {})
  );

  // Inline Stock Editing State for Inventory Tab
  const [editingStockId, setEditingStockId] = useState(null); // ID of product currently editing stock levels inline
  const [tempStocks, setTempStocks] = useState({}); // Size-stock mapping for inline editing

  // Order Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load products, categories, and orders on authorized mount
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const prodResponse = await productsApi.getAll({ limit: 100 });
      if (prodResponse.success) {
        setProducts(prodResponse.data);
      }
      
      const catResponse = await categoriesApi.getAll();
      if (catResponse.success) {
        setCategories(catResponse.data);
      }

      const orderResponse = await ordersApi.getAll();
      if (orderResponse.success) {
        setOrders(orderResponse.orders || []);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }

  // Pre-fill form fields for Editing Product
  const openEditModal = (product) => {
    setModalMode('edit');
    setCurrentProductId(product._id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setDiscountedPrice(product.discountedPrice !== undefined && product.discountedPrice !== null ? product.discountedPrice : '');
    setCategory(product.category?._id || product.category || '');
    setImagesText(product.images.join('\n'));
    setOccasionsText(product.occasion ? product.occasion.join(', ') : '');
    setTagsText(product.tags ? product.tags.join(', ') : '');
    setIsFeatured(product.isFeatured || false);
    setIsBestSeller(product.isBestSeller || false);

    // Populate sizes stock
    const updatedSizes = standardSizesList.reduce((acc, size) => ({
      ...acc,
      [size]: { enabled: false, stock: 0 }
    }), {});

    product.sizes.forEach((s) => {
      if (standardSizesList.includes(s.size)) {
        updatedSizes[s.size] = { enabled: true, stock: s.stock };
      }
    });
    setSizesStock(updatedSizes);
    
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormModalOpen(true);
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentProductId(null);
    setName('');
    setDescription('');
    setPrice(0);
    setDiscountedPrice('');
    setCategory(categories[0]?._id || '');
    setImagesText('');
    setOccasionsText('');
    setTagsText('');
    setIsFeatured(false);
    setIsBestSeller(false);
    // Reset sizes stock
    setSizesStock(
      standardSizesList.reduce((acc, size) => ({
        ...acc,
        [size]: { enabled: size === 'S' || size === 'M' || size === 'L', stock: 10 }
      }), {})
    );
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormModalOpen(true);
  };

  // Submit Product Form (Create / Update)
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!name || name.trim().length < 2) {
      setErrorMsg('Product name must be at least 2 characters');
      return;
    }
    if (!description || description.trim().length < 10) {
      setErrorMsg('Description must be at least 10 characters');
      return;
    }
    if (price <= 0) {
      setErrorMsg('Price must be greater than 0');
      return;
    }
    if (discountedPrice !== '' && Number(discountedPrice) > Number(price)) {
      setErrorMsg('Discounted price must be less than or equal to original price');
      return;
    }
    if (!category) {
      setErrorMsg('Category is required');
      return;
    }

    const imageUrls = imagesText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');
    if (imageUrls.length === 0) {
      setErrorMsg('At least one valid image URL is required');
      return;
    }

    // Format sizes
    const formattedSizes = Object.entries(sizesStock)
      .filter(([_, sizeObj]) => sizeObj.enabled)
      .map(([sizeName, sizeObj]) => ({
        size: sizeName,
        stock: parseInt(sizeObj.stock) || 0
      }));

    if (formattedSizes.length === 0) {
      setErrorMsg('At least one size must be selected with stock');
      return;
    }

    const payload = {
      name,
      description,
      price: Number(price),
      discountedPrice: discountedPrice !== '' ? Number(discountedPrice) : undefined,
      category,
      images: imageUrls,
      sizes: formattedSizes,
      occasion: occasionsText ? occasionsText.split(',').map(s => s.trim()).filter(s => s !== '') : [],
      tags: tagsText ? tagsText.split(',').map(s => s.trim()).filter(s => s !== '') : [],
      isFeatured,
      isBestSeller
    };

    try {
      let response;
      if (modalMode === 'add') {
        response = await productsApi.create(payload);
        if (response.success) {
          setSuccessMsg('Product created successfully!');
          setIsFormModalOpen(false);
          loadData();
        }
      } else {
        response = await productsApi.update(currentProductId, payload);
        if (response.success) {
          setSuccessMsg('Product updated successfully!');
          setIsFormModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed. Ensure all data follows validation rules.');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, prodName) => {
    if (window.confirm(`Are you sure you want to delete "${prodName}"?`)) {
      try {
        const response = await productsApi.delete(id);
        if (response.success) {
          setSuccessMsg(`Deleted product: ${prodName}`);
          loadData();
        }
      } catch (err) {
        setErrorMsg(`Failed to delete product: ${err.message}`);
      }
    }
  };

  // Start Inline Stock Edit for a product row
  const startInlineEdit = (product) => {
    setEditingStockId(product._id);
    const stockMap = standardSizesList.reduce((acc, size) => {
      const matched = product.sizes.find(s => s.size === size);
      return {
        ...acc,
        [size]: matched ? matched.stock : 0
      };
    }, {});
    setTempStocks(stockMap);
  };

  // Save Inline Stock Levels
  const saveInlineStock = async (product) => {
    setErrorMsg('');
    
    // Format payload for PUT
    const formattedSizes = Object.entries(tempStocks)
      .map(([sizeName, stockVal]) => ({
        size: sizeName,
        stock: Math.max(0, parseInt(stockVal) || 0)
      }))
      // Keep only sizes originally supported or edited (non-zero or existing)
      .filter(sObj => {
        const existsOriginally = product.sizes.some(s => s.size === sObj.size);
        return existsOriginally || sObj.stock > 0;
      });

    const payload = {
      sizes: formattedSizes
    };

    try {
      const response = await productsApi.update(product._id, payload);
      if (response.success) {
        setSuccessMsg(`Stock updated for ${product.name}`);
        setEditingStockId(null);
        loadData();
      }
    } catch (err) {
      setErrorMsg(`Failed to update stock: ${err.message}`);
    }
  };

  // Update Order Fulfillment Status
  const handleUpdateOrderStatus = async (orderId, status) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await ordersApi.updateStatus(orderId, status);
      if (response.success) {
        setSuccessMsg(`Order status updated to ${status}`);
        
        // Update local state to reflect change immediately
        setOrders(prevOrders => 
          prevOrders.map(o => o._id === orderId ? { ...o, orderStatus: status } : o)
        );

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, orderStatus: status }));
        }
      }
    } catch (err) {
      setErrorMsg(`Failed to update order status: ${err.message}`);
    }
  };

  // Open Order details viewer modal
  const openOrderDetails = async (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
    // Refresh details from API to make sure items are fully populated
    try {
      const response = await ordersApi.getDetails(order._id);
      if (response.success) {
        setSelectedOrder(response.order);
      }
    } catch (err) {
      console.error('Failed to load full order details:', err);
    }
  };

  // Stats summaries
  const totalProducts = products.length;
  const lowStockAlertCount = products.reduce((count, p) => {
    const lowSizes = p.sizes.filter(s => s.stock <= 3);
    return count + lowSizes.length;
  }, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'processing').length;

  // Filter products or orders by search term
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.shippingAddress?.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 1. Loading User Check
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <AdminHeader />
        <div className="flex-1 flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // 2. Access Restriction check
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col min-h-screen bg-surface text-on-surface">
        <AdminHeader />
        <div className="flex-1 flex items-center justify-center py-32 px-6">
          <div className="max-w-md w-full bg-white border border-outline-variant/30 rounded-2xl p-10 text-center shadow-lg transition-slow hover:shadow-[0_12px_40px_rgba(107,34,51,0.04)]">
            <span className="material-symbols-outlined text-5xl text-primary mb-6 animate-pulse">
              lock
            </span>
            <h1 className="font-display-lg text-3xl mb-4 text-primary font-bold">Access Denied</h1>
            <p className="font-body-md text-on-surface-variant text-sm mb-10 leading-relaxed">
              This space is reserved for Naarzi administrators. If you hold an admin account, please sign in below.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthOpen(true);
                }}
                className="flex-1 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors font-bold cursor-pointer"
              >
                SIGN IN
              </button>
              <Link 
                href="/"
                className="flex-1 py-4 bg-transparent border border-outline-variant/60 text-on-surface-variant font-label-caps text-xs tracking-widest rounded-xl hover:bg-surface-container transition-colors block text-center font-bold"
              >
                STOREFRONT
              </Link>
            </div>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <AdminHeader />

      <main className="flex-1 max-w-container-max mx-auto px-6 md:px-margin-desktop w-full pt-10 pb-24">
        
        {/* Breadcrumb / Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <nav className="text-[10px] font-label-caps text-on-surface-variant mb-2">
              <Link href="/" className="hover:text-primary transition-colors">STOREFRONT</Link>
              <span> / </span>
              <span className="text-on-surface">ADMIN PANEL</span>
            </nav>
            <h1 className="font-display-lg text-4xl text-primary font-bold">Dashboard</h1>
          </div>
          
          <button 
            onClick={openAddModal}
            className="px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-md flex items-center gap-2 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            ADD NEW PRODUCT
          </button>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="mb-8 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-200 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {successMsg}
            </div>
            <button onClick={() => setSuccessMsg('')} className="material-symbols-outlined text-base cursor-pointer opacity-60 hover:opacity-100">close</button>
          </div>
        )}
        {errorMsg && (
          <div className="mb-8 p-4 bg-error-container text-error text-sm rounded-xl border border-error/20 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {errorMsg}
            </div>
            <button onClick={() => setErrorMsg('')} className="material-symbols-outlined text-base cursor-pointer opacity-60 hover:opacity-100">close</button>
          </div>
        )}

        {/* Stats Grid - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-12">
          {/* Card 1 */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block">TOTAL PRODUCTS</span>
              <span className="font-display-lg text-3xl font-bold text-primary">{totalProducts}</span>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">apparel</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className={`border rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all ${
            lowStockAlertCount > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-outline-variant/30'
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block">LOW STOCK ALERTS</span>
              <span className={`font-display-lg text-3xl font-bold ${lowStockAlertCount > 0 ? 'text-error' : 'text-primary'}`}>
                {lowStockAlertCount}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              lowStockAlertCount > 0 ? 'bg-red-100 text-error' : 'bg-primary/5 text-primary'
            }`}>
              <span className="material-symbols-outlined">warning</span>
            </div>
          </div>
          {/* Card 3 */}
          <div className={`border rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all ${
            pendingOrdersCount > 0 ? 'bg-amber-50/50 border-amber-200 font-bold' : 'bg-white border-outline-variant/30'
          }`}>
            <div className="space-y-1">
              <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block">PENDING FULFILLMENT</span>
              <span className={`font-display-lg text-3xl font-bold ${pendingOrdersCount > 0 ? 'text-amber-700' : 'text-primary'}`}>
                {pendingOrdersCount}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              pendingOrdersCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-primary/5 text-primary'
            }`}>
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block">TOTAL ORDERS</span>
              <span className="font-display-lg text-3xl font-bold text-primary">{totalOrdersCount}</span>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">local_mall</span>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant/30 pb-4 mb-8 gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-label-caps">
            <button 
              onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
              className={`pb-4 relative font-bold cursor-pointer transition-colors ${
                activeTab === 'products' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              PRODUCTS DIRECTORY
              {activeTab === 'products' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-slide-in"></span>
              )}
            </button>
            <button 
              onClick={() => { setActiveTab('inventory'); setSearchTerm(''); }}
              className={`pb-4 relative font-bold cursor-pointer transition-colors ${
                activeTab === 'inventory' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              INVENTORY MANAGEMENT
              {activeTab === 'inventory' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-slide-in"></span>
              )}
            </button>
            <button 
              onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
              className={`pb-4 relative font-bold cursor-pointer transition-colors ${
                activeTab === 'orders' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              ORDERS MANAGEMENT
              {activeTab === 'orders' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-slide-in"></span>
              )}
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
              search
            </span>
            <input 
              type="text" 
              placeholder={activeTab === 'orders' ? "Search by Order ID or User..." : "Search directory..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant/40 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="font-body-md text-sm text-on-surface-variant">Syncing directory...</p>
          </div>
        ) : (activeTab === 'orders' ? filteredOrders.length === 0 : filteredProducts.length === 0) ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-outline-variant/30 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">inventory_2</span>
            <p className="font-body-md text-on-surface-variant text-sm">No items match your search or filter settings.</p>
          </div>
        ) : activeTab === 'products' ? (
          /* Products Tab Table */
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Featured</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md">
                  {filteredProducts.map((p) => {
                    const hasDisc = p.discountedPrice !== undefined && p.discountedPrice !== null;
                    return (
                      <tr key={p._id} className="hover:bg-surface-container/10 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-4 min-w-[280px]">
                          <img 
                            src={p.images[0]} 
                            alt={p.name} 
                            className="w-12 h-14 object-cover rounded-lg bg-surface-container shadow-sm border border-outline-variant/25"
                          />
                          <div>
                            <span className="font-semibold text-on-surface block leading-tight">{p.name}</span>
                            <span className="text-[10px] text-on-surface-variant block mt-1 uppercase tracking-wider font-label-caps">
                              {p.sizes.length} SIZES CONFIGURED
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant">
                          {p.category?.name || 'APPAREL'}
                        </td>
                        <td className="py-4 px-6">
                          {hasDisc ? (
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-medium">INR {p.discountedPrice}</span>
                              <span className="text-xs text-on-surface-variant line-through opacity-70">INR {p.price}</span>
                            </div>
                          ) : (
                            <span className="text-on-surface font-medium">INR {p.price}</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {p.isFeatured ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-label-caps text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/20 tracking-wider font-bold">
                              FEATURED
                            </span>
                          ) : (
                            <span className="text-xs text-on-surface-variant/40">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => openEditModal(p)}
                              className="w-9 h-9 rounded-lg border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors cursor-pointer bg-transparent"
                              title="Edit product"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              className="w-9 h-9 rounded-lg border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error transition-colors cursor-pointer bg-transparent"
                              title="Delete product"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'inventory' ? (
          /* Inventory Management Tab Table */
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                    <th className="py-4 px-6 min-w-[240px]">Product</th>
                    {standardSizesList.map(size => (
                      <th key={size} className="py-4 px-3 text-center">{size}</th>
                    ))}
                    <th className="py-4 px-6 text-right">Stock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md">
                  {filteredProducts.map((p) => {
                    const isEditing = editingStockId === p._id;
                    return (
                      <tr key={p._id} className="hover:bg-surface-container/10 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-semibold text-on-surface block leading-tight">{p.name}</span>
                          <span className="text-[10px] text-on-surface-variant block mt-1 uppercase tracking-wider font-label-caps">
                            {p.category?.name || 'APPAREL'}
                          </span>
                        </td>
                        
                        {standardSizesList.map((size) => {
                          const sizeObj = p.sizes.find(s => s.size === size);
                          const isConfigured = !!sizeObj;
                          const currentStock = sizeObj ? sizeObj.stock : 0;
                          
                          return (
                            <td key={size} className="py-4 px-3 text-center">
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  min="0"
                                  value={tempStocks[size] ?? 0}
                                  onChange={(e) => setTempStocks({
                                    ...tempStocks,
                                    [size]: Math.max(0, parseInt(e.target.value) || 0)
                                  })}
                                  className="w-14 text-center px-1.5 py-1 border border-outline/35 rounded-lg text-xs bg-surface"
                                />
                              ) : isConfigured ? (
                                <span className={`inline-block font-semibold px-2 py-0.5 rounded text-xs ${
                                  currentStock <= 0 
                                    ? 'bg-red-50 text-red-700 border border-red-100 line-through'
                                    : currentStock <= 3
                                    ? 'bg-amber-50 text-amber-700 border border-amber-100 font-bold'
                                    : 'text-on-surface'
                                }`}>
                                  {currentStock}
                                </span>
                              ) : (
                                <span className="text-[10px] text-on-surface-variant/30 font-light">—</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="py-4 px-6 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => saveInlineStock(p)}
                                className="px-3 py-1.5 bg-primary text-white text-[10px] font-label-caps tracking-widest rounded-lg hover:bg-primary-container transition-colors cursor-pointer font-bold"
                              >
                                SAVE
                              </button>
                              <button 
                                onClick={() => setEditingStockId(null)}
                                className="px-3 py-1.5 bg-transparent border border-outline-variant/50 text-on-surface-variant text-[10px] font-label-caps tracking-widest rounded-lg hover:bg-surface-container transition-colors cursor-pointer font-bold"
                              >
                                CANCEL
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startInlineEdit(p)}
                              className="px-3.5 py-1.5 bg-transparent border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary text-[10px] font-label-caps tracking-widest rounded-lg transition-colors cursor-pointer font-bold"
                            >
                              EDIT STOCK
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Orders Management Tab Table */
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6">Fulfillment Status</th>
                    <th className="py-4 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md">
                  {filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-surface-container/10 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-primary font-semibold">
                        #{o._id.substring(o._id.length - 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-on-surface block leading-tight">{o.user?.name || 'Guest User'}</span>
                        <span className="text-[10px] text-on-surface-variant block mt-0.5 font-light">
                          {o.user?.email || o.shippingAddress?.phone || 'No contact email'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-semibold text-on-surface">
                        INR {o.totalAmount}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block text-[9px] font-label-caps px-2 py-1 rounded border tracking-wider font-bold uppercase ${
                          o.paymentStatus === 'paid'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : o.paymentStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select 
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                          className={`px-2 py-1.5 border rounded-lg text-xs font-semibold focus:outline-none cursor-pointer ${
                            o.orderStatus === 'delivered'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : o.orderStatus === 'shipped'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : o.orderStatus === 'processing'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="processing" className="text-on-surface bg-white">processing</option>
                          <option value="shipped" className="text-on-surface bg-white">shipped</option>
                          <option value="delivered" className="text-on-surface bg-white">delivered</option>
                          <option value="cancelled" className="text-on-surface bg-white">cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => openOrderDetails(o)}
                          className="px-3.5 py-1.5 bg-transparent border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary text-[10px] font-label-caps tracking-widest rounded-lg transition-colors cursor-pointer font-bold"
                        >
                          VIEW
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Product Add / Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-outline-variant/30 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto my-8 animate-slide-in">
            {/* Title */}
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
              <h2 className="font-display-lg text-2xl text-primary font-bold">
                {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="material-symbols-outlined text-on-surface-variant/70 hover:text-primary cursor-pointer text-2xl"
              >
                close
              </button>
            </div>

            {/* Modal Error */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-error-container text-error text-xs rounded-xl border border-error/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitProduct} className="space-y-6 text-sm font-body-md">
              {/* Row 1: Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">PRODUCT NAME *</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Linen Midi Dress"
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">CATEGORY *</label>
                  <select 
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">DESCRIPTION (MIN 10 CHARS) *</label>
                <textarea 
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Consciously crafted from premium organic linen, this dress features..."
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors text-xs leading-relaxed"
                />
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">PRICE (INR) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">DISCOUNTED PRICE (INR - OPTIONAL)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="No discount"
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Image URLs */}
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">IMAGE URLS (ONE URL PER LINE) *</label>
                <textarea 
                  required
                  rows={3}
                  value={imagesText}
                  onChange={(e) => setImagesText(e.target.value)}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors text-xs leading-relaxed"
                />
              </div>

              {/* Size and Stock configuration */}
              <div className="space-y-2">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">SIZES & INVENTORY LEVELS *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border border-outline-variant/20 p-4 rounded-xl bg-surface-container/20">
                  {standardSizesList.map((size) => {
                    const isEnabled = sizesStock[size]?.enabled;
                    const stockVal = sizesStock[size]?.stock;
                    
                    return (
                      <div key={size} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id={`size-chk-${size}`}
                          checked={isEnabled}
                          onChange={(e) => setSizesStock({
                            ...sizesStock,
                            [size]: { ...sizesStock[size], enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-primary focus:ring-primary border-outline-variant/50 rounded cursor-pointer"
                        />
                        <label 
                          htmlFor={`size-chk-${size}`}
                          className="text-xs font-semibold text-on-surface w-14 cursor-pointer"
                        >
                          {size}
                        </label>
                        {isEnabled && (
                          <input 
                            type="number" 
                            min="0"
                            value={stockVal}
                            onChange={(e) => setSizesStock({
                              ...sizesStock,
                              [size]: { ...sizesStock[size], stock: Math.max(0, parseInt(e.target.value) || 0) }
                            })}
                            className="w-16 px-1.5 py-1 border border-outline-variant/40 rounded-lg text-xs bg-white text-center"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Occasions & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">OCCASION (COMMA SEPARATED)</label>
                  <input 
                    type="text" 
                    value={occasionsText}
                    onChange={(e) => setOccasionsText(e.target.value)}
                    placeholder="e.g. Resort, Beach Wear, Casual"
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">TAGS (COMMA SEPARATED)</label>
                  <input 
                    type="text" 
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="e.g. new arrival, trending, featured"
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Highlight Toggles */}
              <div className="flex gap-8 border-t border-outline-variant/10 pt-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="chk-featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-outline-variant/50 rounded cursor-pointer"
                  />
                  <label htmlFor="chk-featured" className="text-xs font-label-caps tracking-wider text-on-surface-variant font-bold cursor-pointer">
                    FEATURED EDITORIAL ITEM
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="chk-bestseller"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-outline-variant/50 rounded cursor-pointer"
                  />
                  <label htmlFor="chk-bestseller" className="text-xs font-label-caps tracking-wider text-on-surface-variant font-bold cursor-pointer">
                    BEST SELLER CATALOGUE ITEM
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 border-t border-outline-variant/20 pt-6 mt-8">
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors font-bold cursor-pointer"
                >
                  {modalMode === 'add' ? 'CREATE PRODUCT' : 'SAVE CHANGES'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 py-4 bg-transparent border border-outline-variant/50 text-on-surface-variant font-label-caps text-xs tracking-widest rounded-xl hover:bg-surface-container transition-colors font-bold cursor-pointer"
                >
                  CANCEL
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-outline-variant/30 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto my-8 animate-slide-in text-sm font-body-md text-on-surface">
            {/* Title */}
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
              <div>
                <h2 className="font-display-lg text-2xl text-primary font-bold">
                  Order Details
                </h2>
                <span className="font-mono text-xs text-on-surface-variant">ID: {selectedOrder._id}</span>
              </div>
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="material-symbols-outlined text-on-surface-variant/70 hover:text-primary cursor-pointer text-2xl bg-transparent border-none"
              >
                close
              </button>
            </div>

            {/* Quick Status Control */}
            <div className="bg-surface-container/40 border border-outline-variant/20 p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block font-bold">ORDER STATUS</span>
                <span className="text-xs text-on-surface font-semibold block mt-1 uppercase">
                  {selectedOrder.orderStatus}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant font-semibold">Change Fulfillment:</span>
                <select 
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                  className={`px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none cursor-pointer ${
                    selectedOrder.orderStatus === 'delivered'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : selectedOrder.orderStatus === 'shipped'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : selectedOrder.orderStatus === 'processing'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <option value="processing">processing</option>
                  <option value="shipped">shipped</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* Shipping Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-label-caps text-primary tracking-wider font-bold border-b border-outline-variant/10 pb-1 uppercase">
                  Shipping Information
                </h3>
                <div className="space-y-2 text-on-surface-variant leading-relaxed">
                  <p className="font-semibold text-on-surface">{selectedOrder.user?.name || 'Guest Customer'}</p>
                  <p className="text-xs">{selectedOrder.user?.email || 'No email associated'}</p>
                  <p className="text-xs font-mono">{selectedOrder.shippingAddress?.phone || 'No phone number'}</p>
                  <div className="text-xs pt-1 border-t border-outline-variant/5 mt-2">
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                    <p>{selectedOrder.shippingAddress?.postalCode}</p>
                    <p className="font-medium text-on-surface">{selectedOrder.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-label-caps text-primary tracking-wider font-bold border-b border-outline-variant/10 pb-1 uppercase">
                  Payment Summary
                </h3>
                <div className="space-y-2 text-on-surface-variant text-xs">
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className="font-semibold uppercase text-on-surface">{selectedOrder.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span className="font-medium text-on-surface">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedOrder.razorpayOrderId && (
                    <div className="flex justify-between font-mono text-[10px] mt-1 pt-1 border-t border-outline-variant/5">
                      <span>Gateway Order ID:</span>
                      <span>{selectedOrder.razorpayOrderId}</span>
                    </div>
                  )}
                  {selectedOrder.razorpayPaymentId && (
                    <div className="flex justify-between font-mono text-[10px]">
                      <span>Transaction ID:</span>
                      <span>{selectedOrder.razorpayPaymentId}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm font-bold text-primary pt-3 border-t border-outline-variant/20">
                    <span>Total Amount Paid:</span>
                    <span>INR {selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-label-caps text-primary tracking-wider font-bold border-b border-outline-variant/10 pb-1 uppercase">
                Items Configured ({selectedOrder.items?.length || 0})
              </h3>
              <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant/20 bg-surface-container/20 font-label-caps text-[9px] text-on-surface-variant tracking-wider uppercase">
                      <th className="py-2.5 px-4">Item Name</th>
                      <th className="py-2.5 px-4 text-center">Size</th>
                      <th className="py-2.5 px-4 text-center">Quantity</th>
                      <th className="py-2.5 px-4 text-right">Price per unit</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-surface-container/5">
                        <td className="py-2.5 px-4 font-semibold text-on-surface">
                          {item.product?.name || 'Deleted Product'}
                        </td>
                        <td className="py-2.5 px-4 text-center text-on-surface-variant font-medium">
                          {item.size}
                        </td>
                        <td className="py-2.5 px-4 text-center text-on-surface-variant">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-4 text-right text-on-surface-variant font-mono">
                          INR {item.priceAtPurchase}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-primary">
                          INR {item.priceAtPurchase * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 border-t border-outline-variant/20 pt-6 mt-8 justify-end">
              <button 
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors font-bold cursor-pointer"
              >
                CLOSE VIEWER
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Overlays */}
      <AuthModal />
    </div>
  );
}
