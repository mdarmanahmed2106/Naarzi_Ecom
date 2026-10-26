'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { productsApi, categoriesApi, ordersApi, uploadApi, adminApi, promoBannersApi, couponsApi, notificationsApi, settingsApi, adminToken, authHeaders } from '@/lib/api';
import { exportRowsAsCsv } from '@/lib/csv';
import { compressImage, runWithLimit } from '@/lib/compressImage';

const AdminContext = createContext(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>');
  return ctx;
}

// Data, form state and actions shared by every admin section (moved from the old single-page
// dashboard). Lives in the dashboard layout, so it survives navigating between sections.
export default function AdminProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [wishlistInsights, setWishlistInsights] = useState([]);
  const [wishlistCustomers, setWishlistCustomers] = useState([]);
  const [abandonedThreshold, setAbandonedThreshold] = useState(2);
  const [loading, setLoading] = useState(true);
  // The section comes from the URL (/products, /orders/<id>, ...) so refresh, Back and links work
  const pathname = usePathname();
  const activeTab = pathname.split('/')[1] || 'products';
  const isOrderDetail = /^\/orders\/[^/]+/.test(pathname);
  // /products/new and /products/<id> show the product form
  const isProductForm = /^\/products\/[^/]+/.test(pathname);

  // Store Settings State
  const [settingsForm, setSettingsForm] = useState({ freeShippingThreshold: 0, shippingCost: 0, lowStockThreshold: 3 });
  // The saved threshold (not the form's unsaved value) drives low-stock alerts
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  // Each section starts with an empty search, as switching tabs used to
  // (reset during render when the section changes, rather than in an effect)
  const [searchTab, setSearchTab] = useState(activeTab);
  if (searchTab !== activeTab) {
    setSearchTab(activeTab);
    setSearchTerm('');
  }

  // Modals & Forms State
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentProductId, setCurrentProductId] = useState(null);

  // Dedicated Stock Edit Modal State
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockEditProduct, setStockEditProduct] = useState(null);
  const [stockEditColors, setStockEditColors] = useState([]);
  
  // Product Form Field States
  const standardSizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'One Size'];
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [isOnSale, setIsOnSale] = useState(false);
  const [category, setCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [colors, setColors] = useState([
    {
      id: Date.now().toString(),
      name: 'Standard',
      hexCode: '#000000',
      uploadedImages: [],
      dragActive: false,
      pasteUrl: '',
      sizesStock: standardSizesList.reduce((acc, size) => ({ ...acc, [size]: { enabled: false, stock: 0 } }), {})
    }
  ]);
  
  // Category Form Field States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState('add'); // 'add' | 'edit'
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [categoryUploading, setCategoryUploading] = useState(false);
  const [occasionsText, setOccasionsText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [detailsText, setDetailsText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Reviews & Customers States
  const [allReviews, setAllReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('all');

  // Banner Modal States
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerOrder, setBannerOrder] = useState(0);

  // Coupon Modal States
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponModalMode, setCouponModalMode] = useState('add'); // 'add' | 'edit'
  const [currentCouponId, setCurrentCouponId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDescription, setCouponDescription] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState('percentage');
  const [couponDiscountValue, setCouponDiscountValue] = useState(10);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState('');
  const [couponMinOrder, setCouponMinOrder] = useState(0);
  const [couponMaxUses, setCouponMaxUses] = useState(100);
  const [couponMaxUsesPerUser, setCouponMaxUsesPerUser] = useState(1);
  const [couponFirstOrderOnly, setCouponFirstOrderOnly] = useState(false);
  const [couponApplicableCategories, setCouponApplicableCategories] = useState([]);
  
  // Sizes stocks in Form
  // (Moved up)

  // Inline Stock Editing State for Inventory Tab
  const [editingStockId, setEditingStockId] = useState(null); // ID of product currently editing stock levels inline
  const [tempStocks, setTempStocks] = useState({}); // Size-stock mapping for inline editing

  // Order Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundingId, setRefundingId] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const router = useRouter();
  const [user, setUser] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getAll();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Load products, categories, and orders on authorized mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
          credentials: 'include',
          headers: authHeaders()
        });
        const data = await response.json();
        if (response.ok && data.user && data.user.role === 'admin') {
          setUser(data.user);
          loadData();
        } else {
          adminToken.clear();
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      }
    }
    checkAuth();
  }, [router]);

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

      const reviewResponse = await adminApi.getReviews();
      if (reviewResponse.success) {
        setAllReviews(reviewResponse.data);
      }

      const customerResponse = await adminApi.getCustomers();
      if (customerResponse.success) {
        setCustomers(customerResponse.data);
      }

      const bannersResponse = await promoBannersApi.getAll(true);
      if (bannersResponse.success) {
        setPromoBanners(bannersResponse.data);
      }

      const couponsResponse = await couponsApi.getAll();
      if (couponsResponse.success) {
        setCoupons(couponsResponse.data);
      }

      const abResponse = await adminApi.getAbandonedCarts(abandonedThreshold);
      if (abResponse.success) setAbandonedCarts(abResponse.data);

      const wiResponse = await adminApi.getWishlistInsights();
      if (wiResponse.success) setWishlistInsights(wiResponse.data);

      const wcResponse = await adminApi.getWishlistCustomers();
      if (wcResponse.success) setWishlistCustomers(wcResponse.data);

      const settingsResponse = await settingsApi.get();
      if (settingsResponse.success) {
        setSettingsForm({
          freeShippingThreshold: settingsResponse.data.freeShippingThreshold ?? 0,
          shippingCost: settingsResponse.data.shippingCost ?? 0,
          lowStockThreshold: settingsResponse.data.lowStockThreshold ?? 3
        });
        setLowStockThreshold(settingsResponse.data.lowStockThreshold ?? 3);
      }

      await fetchNotifications();
    } catch (err) {
      console.error("Error loading admin data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && user.role === 'admin') {
      adminApi.getAbandonedCarts(abandonedThreshold).then(res => {
        if (res.success) setAbandonedCarts(res.data);
      });
    }
  }, [abandonedThreshold, user]);

  // Stock Edit Modal Handlers
  const openStockEditModal = (product) => {
    setStockEditProduct(product);
    if (product.colors && product.colors.length > 0) {
      setStockEditColors(JSON.parse(JSON.stringify(product.colors))); // deep copy
    } else {
      setStockEditColors([]);
    }
    setIsStockModalOpen(true);
  };

  const closeStockEditModal = () => {
    setIsStockModalOpen(false);
    setStockEditProduct(null);
    setStockEditColors([]);
  };

  const handleSaveStock = async () => {
    if (!stockEditProduct) return;
    try {
      const response = await productsApi.update(stockEditProduct._id, { colors: stockEditColors });
      if (response.success) {
        closeStockEditModal();
        loadData(); // refresh products list
      } else {
        alert('Failed to update stock: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving stock:', error);
      alert('Failed to update stock');
    }
  };

  // Pre-fill the product form for editing (used by /products/<id>)
  const loadProductIntoForm = (product) => {
    setModalMode('edit');
    setCurrentProductId(product._id);
    setName(product.name);
    setDescription(product.description);
    setDetailsText(product.details && product.details.length > 0 ? product.details.join('\n') : '');
    setPrice(product.price);
    setDiscountedPrice(product.discountedPrice !== undefined && product.discountedPrice !== null ? product.discountedPrice : '');
    setIsOnSale(product.isOnSale || false);
    setCategory(product.category?._id || product.category || '');
    
    if (product.colors && product.colors.length > 0) {
      setColors(product.colors.map((c, i) => {
        const sz = standardSizesList.reduce((acc, size) => ({ ...acc, [size]: { enabled: false, stock: 0 } }), {});
        c.sizes.forEach(s => {
          if (standardSizesList.includes(s.size)) {
            sz[s.size] = { enabled: true, stock: s.stock };
          }
        });
        return {
          id: `edit-${i}-${Date.now()}`,
          name: c.name || 'Standard',
          hexCode: c.hexCode || '#000000',
          uploadedImages: c.images ? c.images.map((url, idx) => ({ id: `img-${idx}-${Date.now()}`, url, status: 'success' })) : [],
          dragActive: false,
          pasteUrl: '',
          sizesStock: sz
        };
      }));
    } else {
      // Fallback for old products
      const sz = standardSizesList.reduce((acc, size) => ({ ...acc, [size]: { enabled: false, stock: 0 } }), {});
      if (product.sizes) {
        product.sizes.forEach(s => {
          if (standardSizesList.includes(s.size)) sz[s.size] = { enabled: true, stock: s.stock };
        });
      }
      setColors([{
        id: Date.now().toString(),
        name: 'Standard',
        hexCode: '#000000',
        uploadedImages: product.images ? product.images.map((url, idx) => ({ id: `img-${idx}-${Date.now()}`, url, status: 'success' })) : [],
        dragActive: false,
        pasteUrl: '',
        sizesStock: sz
      }]);
    }

    setOccasionsText(product.occasion ? product.occasion.join(', ') : '');
    setTagsText(product.tags ? product.tags.join(', ') : '');
    setIsFeatured(product.isFeatured || false);
    setIsBestSeller(product.isBestSeller || false);
    
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Blank product form with sensible defaults (used by /products/new)
  const resetProductForm = () => {
    setModalMode('add');
    setCurrentProductId(null);
    setName('');
    setDescription('');
    setDetailsText('');
    setPrice(0);
    setDiscountedPrice('');
    setIsOnSale(false);
    setCategory(categories[0]?._id || '');
    setColors([{
      id: Date.now().toString(),
      name: 'Standard',
      hexCode: '#000000',
      uploadedImages: [],
      dragActive: false,
      pasteUrl: '',
      sizesStock: standardSizesList.reduce((acc, size) => ({ 
        ...acc, 
        [size]: { enabled: size === 'S' || size === 'M' || size === 'L', stock: 10 } 
      }), {})
    }]);
    setOccasionsText('');
    setTagsText('');
    setIsFeatured(false);
    setIsBestSeller(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Color Handlers
  const handleColorChange = (index, field, value) => {
    const updated = [...colors];
    updated[index][field] = value;
    setColors(updated);
  };
  
  const handleAddColor = () => {
    setColors([...colors, {
      id: Date.now().toString(),
      name: 'New Color',
      hexCode: '#000000',
      uploadedImages: [],
      dragActive: false,
      pasteUrl: '',
      sizesStock: standardSizesList.reduce((acc, size) => ({ ...acc, [size]: { enabled: false, stock: 0 } }), {})
    }]);
  };
  
  const handleRemoveColor = (index) => {
    if (colors.length <= 1) {
      setErrorMsg("You must have at least one color variant.");
      return;
    }
    const updated = [...colors];
    updated.splice(index, 1);
    setColors(updated);
  };

  // Same limit as the API (backend/src/routes/upload.js). Photos are shrunk in the browser first
  // (lib/compressImage), so this only catches the rare file still too big after that.
  const MAX_IMAGE_MB = 10;
  const handleFileUpload = async (colorIndex, files) => {
    const newItems = Array.from(files).map(file => ({
      id: `upload-${Date.now()}-${Math.random()}`, file, name: file.name, status: 'uploading'
    }));

    const updated = [...colors];
    updated[colorIndex].uploadedImages = [...updated[colorIndex].uploadedImages, ...newItems];
    setColors(updated);

    const setItem = (id, patch) => setColors(prev => {
      const arr = [...prev];
      arr[colorIndex].uploadedImages = arr[colorIndex].uploadedImages.map(img => img.id === id ? { ...img, ...patch } : img);
      return arr;
    });

    // Two at a time: each large photo needs a lot of memory while it's being shrunk
    await runWithLimit(newItems, 2, async (item) => {
      try {
        const ready = await compressImage(item.file);
        if (ready.size > MAX_IMAGE_MB * 1024 * 1024) {
          const reason = `Larger than ${MAX_IMAGE_MB}MB even after optimising (${(ready.size / 1024 / 1024).toFixed(1)}MB)`;
          setErrorMsg(`"${item.name}" didn't upload: ${reason}`);
          setItem(item.id, { status: 'failed', error: reason });
          return;
        }
        const formData = new FormData();
        formData.append('image', ready);
        const response = await uploadApi.uploadImage(formData);
        setItem(item.id, response.success && response.url ? { url: response.url, status: 'success' } : { status: 'failed', error: 'Upload failed' });
      } catch (err) {
        // Keep the server's reason (too large, storage not set up, keys rejected...) so it can be shown
        const reason = err.message || 'Upload failed';
        setErrorMsg(`"${item.name}" didn't upload: ${reason}`);
        setItem(item.id, { status: 'failed', error: reason });
      }
    });
  };

  const handleRemoveImage = (colorIndex, id) => {
    const updated = [...colors];
    updated[colorIndex].uploadedImages = updated[colorIndex].uploadedImages.filter(img => img.id !== id);
    setColors(updated);
  };

  const handleDrag = (colorIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = [...colors];
    if (e.type === "dragenter" || e.type === "dragover") updated[colorIndex].dragActive = true;
    else if (e.type === "dragleave") updated[colorIndex].dragActive = false;
    setColors(updated);
  };

  const handleDrop = (colorIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = [...colors];
    updated[colorIndex].dragActive = false;
    setColors(updated);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(colorIndex, e.dataTransfer.files);
  };

  const handleAddPasteUrl = (colorIndex) => {
    const updated = [...colors];
    if (updated[colorIndex].pasteUrl.trim()) {
      updated[colorIndex].uploadedImages.push({ id: `paste-${Date.now()}-${Math.random()}`, url: updated[colorIndex].pasteUrl.trim(), status: 'success' });
      updated[colorIndex].pasteUrl = '';
      setColors(updated);
    }
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

    const formattedColors = [];
    for (const c of colors) {
      if (!c.name.trim()) {
        setErrorMsg('All color variants must have a name');
        return;
      }
      const imageUrls = c.uploadedImages.filter(img => img.status === 'success').map(img => img.url);
      if (imageUrls.length === 0) {
        setErrorMsg(`At least one image is required for color variant "${c.name}"`);
        return;
      }
      const formattedSizes = Object.entries(c.sizesStock)
        .filter(([_, sizeObj]) => sizeObj.enabled)
        .map(([sizeName, sizeObj]) => ({
          size: sizeName,
          stock: parseInt(sizeObj.stock) || 0
        }));
      if (formattedSizes.length === 0) {
        setErrorMsg(`At least one size must be selected with stock for color variant "${c.name}"`);
        return;
      }
      formattedColors.push({
        name: c.name.trim(),
        hexCode: c.hexCode,
        images: imageUrls,
        sizes: formattedSizes
      });
    }

    const payload = {
      name,
      description,
      details: detailsText ? detailsText.split('\n').map(s => s.trim()).filter(s => s !== '') : [],
      price: Number(price),
      discountedPrice: discountedPrice !== '' ? Number(discountedPrice) : undefined,
      isOnSale,
      category,
      colors: formattedColors,
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
          router.push('/products');
          loadData();
        }
      } else {
        response = await productsApi.update(currentProductId, payload);
        if (response.success) {
          setSuccessMsg('Product updated successfully!');
          router.push('/products');
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

        // Sync the full order back (not just orderStatus) so statusHistory stays accurate
        setOrders(prevOrders =>
          prevOrders.map(o => o._id === orderId ? { ...o, ...response.order } : o)
        );

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, ...response.order }));
        }
      }
    } catch (err) {
      setErrorMsg(`Failed to update order status: ${err.message}`);
    }
  };

  // Save tracking number / carrier / estimated delivery without changing fulfillment status
  // Retry a refund that failed when the order was cancelled
  const handleRetryRefund = async (orderId) => {
    setErrorMsg('');
    setSuccessMsg('');
    setRefundingId(orderId);
    try {
      const response = await ordersApi.refund(orderId);
      setSuccessMsg(response.message || 'Refund processed');
      setOrders(prevOrders => prevOrders.map(o => o._id === orderId ? { ...o, ...response.order } : o));
      setSelectedOrder(prev => (prev && prev._id === orderId ? { ...prev, ...response.order } : prev));
    } catch (err) {
      setErrorMsg(`Refund failed: ${err.message}`);
    } finally {
      setRefundingId(null);
    }
  };

  const handleSaveTracking = async (orderId) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await ordersApi.updateStatus(orderId, selectedOrder.orderStatus, {
        trackingNumber: selectedOrder.trackingNumber || '',
        carrier: selectedOrder.carrier || '',
        estimatedDelivery: selectedOrder.estimatedDelivery
          ? new Date(selectedOrder.estimatedDelivery).toISOString().slice(0, 10)
          : ''
      });
      if (response.success) {
        setSuccessMsg('Tracking details saved');
        setOrders(prevOrders =>
          prevOrders.map(o => o._id === orderId ? { ...o, ...response.order } : o)
        );
        setSelectedOrder(prev => ({ ...prev, ...response.order }));
      }
    } catch (err) {
      setErrorMsg(`Failed to save tracking details: ${err.message}`);
    }
  };

  // Load one order for /orders/<id>: show the copy from the list straight away, then the full
  // details from the API (items populated)
  const openOrderDetails = async (orderId) => {
    setSelectedOrder(orders.find((o) => o._id === orderId) || null);
    try {
      const response = await ordersApi.getDetails(orderId);
      if (response.success) {
        setSelectedOrder(response.order);
      }
    } catch (err) {
      console.error('Failed to load full order details:', err);
    }
  };

  const handleCategoryFileUpload = async (file) => {
    if (!file) return;
    setCategoryUploading(true);
    const formData = new FormData();
    formData.append('image', await compressImage(file));
    try {
      const response = await uploadApi.uploadImage(formData);
      if (response.success && response.url) {
        setCategoryImage(response.url);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Category file upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setCategoryUploading(false);
    }
  };

  const openCategoryAddModal = () => {
    setCategoryModalMode('add');
    setCurrentCategoryId(null);
    setCategoryName('');
    setCategoryImage('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsCategoryModalOpen(true);
  };

  const openCategoryEditModal = (cat) => {
    setCategoryModalMode('edit');
    setCurrentCategoryId(cat._id);
    setCategoryName(cat.name);
    setCategoryImage(cat.image || '');
    setErrorMsg('');
    setSuccessMsg('');
    setIsCategoryModalOpen(true);
  };

  const openBannerAddModal = () => {
    setBannerMessage('');
    setBannerLink('');
    setBannerOrder(promoBanners.length + 1);
    setIsBannerModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const openCouponAddModal = () => {
    setCouponModalMode('add');
    setCurrentCouponId(null);
    setCouponCode('');
    setCouponDescription('');
    setCouponDiscountType('percentage');
    setCouponDiscountValue(10);
    setCouponMaxDiscount('');
    setCouponMinOrder(0);
    setCouponMaxUses(100);
    setCouponMaxUsesPerUser(1);
    setCouponFirstOrderOnly(false);
    setCouponApplicableCategories([]);
    setIsCouponModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const openCouponEditModal = (c) => {
    setCouponModalMode('edit');
    setCurrentCouponId(c._id);
    setCouponCode(c.code || '');
    setCouponDescription(c.description || '');
    setCouponDiscountType(c.discountType || 'percentage');
    setCouponDiscountValue(c.discountValue || 0);
    setCouponMaxDiscount(c.maxDiscountAmount !== null && c.maxDiscountAmount !== undefined ? c.maxDiscountAmount : '');
    setCouponMinOrder(c.minOrderValue || 0);
    setCouponMaxUses(c.maxUses !== null && c.maxUses !== undefined ? c.maxUses : '');
    setCouponMaxUsesPerUser(c.maxUsesPerUser || 1);
    setCouponFirstOrderOnly(Boolean(c.firstOrderOnly));
    setCouponApplicableCategories(c.applicableCategories ? c.applicableCategories.map(cat => cat._id || cat) : []);
    setIsCouponModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!categoryName || categoryName.trim().length < 2) {
      setErrorMsg('Category name must be at least 2 characters');
      return;
    }
    if (!categoryImage) {
      setErrorMsg('Category image is required');
      return;
    }

    const payload = {
      name: categoryName.trim(),
      image: categoryImage
    };

    try {
      let response;
      if (categoryModalMode === 'add') {
        response = await categoriesApi.create(payload);
        if (response.success) {
          setSuccessMsg('Category created successfully!');
          setIsCategoryModalOpen(false);
          loadData();
        }
      } else {
        response = await categoriesApi.update(currentCategoryId, payload);
        if (response.success) {
          setSuccessMsg('Category updated successfully!');
          setIsCategoryModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed.');
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    // Check if category has products assigned
    const count = products.filter(p => {
      const pCatId = p.category?._id || p.category;
      return pCatId === catId;
    }).length;

    if (count > 0) {
      setErrorMsg(`Reassign ${count} products before deleting this category`);
      window.alert(`Reassign ${count} products before deleting this category`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      try {
        const response = await categoriesApi.delete(catId);
        if (response.success) {
          setSuccessMsg(`Deleted category: ${catName}`);
          loadData();
        }
      } catch (err) {
        setErrorMsg(`Failed to delete category: ${err.message}`);
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await adminApi.deleteReview(reviewId);
        if (response.success) {
          setSuccessMsg('Review deleted successfully');
          setAllReviews(prev => prev.filter(r => r._id !== reviewId));
        }
      } catch (err) {
        setErrorMsg(`Failed to delete review: ${err.message}`);
      }
    }
  };

  const handleToggleBanner = async (banner) => {
    try {
      const response = await promoBannersApi.update(banner._id, { isActive: !banner.isActive });
      if (response.success) {
        loadData();
      }
    } catch (err) {
      setErrorMsg(`Failed to toggle banner: ${err.message}`);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm('Delete this banner?')) {
      try {
        await promoBannersApi.delete(id);
        loadData();
      } catch (err) {
        setErrorMsg(`Failed to delete banner: ${err.message}`);
      }
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setErrorMsg('');
    try {
      const response = await settingsApi.update({
        freeShippingThreshold: Number(settingsForm.freeShippingThreshold) || 0,
        shippingCost: Number(settingsForm.shippingCost) || 0,
        lowStockThreshold: Math.max(0, Math.round(Number(settingsForm.lowStockThreshold) || 0))
      });
      if (response.success) {
        setLowStockThreshold(response.data.lowStockThreshold ?? 3);
        setSuccessMsg('Settings saved.');
      }
    } catch (err) {
      setErrorMsg(`Failed to save settings: ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      const response = await couponsApi.update(coupon._id, { isActive: !coupon.isActive });
      if (response.success) {
        loadData();
      }
    } catch (err) {
      setErrorMsg(`Failed to toggle coupon: ${err.message}`);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        await couponsApi.delete(id);
        loadData();
      } catch (err) {
        setErrorMsg(`Failed to delete coupon: ${err.message}`);
      }
    }
  };

  const handleSubmitBanner = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const response = await promoBannersApi.create({
        message: bannerMessage,
        link: bannerLink,
        order: bannerOrder,
        isActive: true
      });
      if (response.success) {
        setSuccessMsg('Banner created successfully');
        setIsBannerModalOpen(false);
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create banner');
    }
  };

  const handleSubmitCoupon = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        code: couponCode.toUpperCase().trim(),
        description: couponDescription.trim(),
        discountType: couponDiscountType,
        discountValue: Number(couponDiscountValue),
        maxDiscountAmount: couponMaxDiscount ? Number(couponMaxDiscount) : null,
        minOrderValue: Number(couponMinOrder) || 0,
        maxUses: couponMaxUses ? Number(couponMaxUses) : null,
        maxUsesPerUser: Number(couponMaxUsesPerUser) || 1,
        firstOrderOnly: Boolean(couponFirstOrderOnly),
        applicableCategories: couponApplicableCategories,
      };

      let response;
      if (couponModalMode === 'add') {
        payload.isActive = true;
        response = await couponsApi.create(payload);
      } else {
        response = await couponsApi.update(currentCouponId, payload);
      }

      if (response.success) {
        setSuccessMsg(couponModalMode === 'add' ? 'Coupon created successfully' : 'Coupon updated successfully');
        setIsCouponModalOpen(false);
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save coupon');
    }
  };

  // Stats summaries
  const totalProducts = products.length;
  const lowStockAlertCount = products.reduce((count, p) => {
    let lowCount = 0;
    if (p.colors && p.colors.length > 0) {
      p.colors.forEach(c => {
        lowCount += c.sizes.filter(s => s.stock <= lowStockThreshold).length;
      });
    } else if (p.sizes) {
      lowCount += p.sizes.filter(s => s.stock <= lowStockThreshold).length;
    }
    return count + lowCount;
  }, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'processing').length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = allReviews.filter((r) => {
    const matchesSearch = 
      (r.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || r.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CSV_EXPORT_CONFIG = {
    products: {
      filename: 'products',
      rows: () => filteredProducts,
      columns: [
        { label: 'Name', value: (p) => p.name },
        { label: 'Category', value: (p) => p.category?.name || '' },
        { label: 'Price', value: (p) => p.price },
        { label: 'Discounted Price', value: (p) => p.discountedPrice ?? '' },
        { label: 'Stock', value: (p) => p.stock ?? 0 },
        { label: 'Featured', value: (p) => (p.isFeatured ? 'Yes' : 'No') },
        { label: 'Best Seller', value: (p) => (p.isBestSeller ? 'Yes' : 'No') },
        { label: 'On Sale', value: (p) => (p.isOnSale ? 'Yes' : 'No') },
        { label: 'Created At', value: (p) => new Date(p.createdAt).toLocaleDateString() },
      ],
    },
    inventory: {
      filename: 'products',
      rows: () => filteredProducts,
      columns: [
        { label: 'Name', value: (p) => p.name },
        { label: 'Category', value: (p) => p.category?.name || '' },
        { label: 'Price', value: (p) => p.price },
        { label: 'Discounted Price', value: (p) => p.discountedPrice ?? '' },
        { label: 'Stock', value: (p) => p.stock ?? 0 },
        { label: 'Featured', value: (p) => (p.isFeatured ? 'Yes' : 'No') },
        { label: 'Best Seller', value: (p) => (p.isBestSeller ? 'Yes' : 'No') },
        { label: 'On Sale', value: (p) => (p.isOnSale ? 'Yes' : 'No') },
        { label: 'Created At', value: (p) => new Date(p.createdAt).toLocaleDateString() },
      ],
    },
    orders: {
      filename: 'orders',
      rows: () => filteredOrders,
      columns: [
        { label: 'Order ID', value: (o) => o._id },
        { label: 'Customer Name', value: (o) => o.user?.name || 'Guest User' },
        { label: 'Customer Email', value: (o) => o.user?.email || '' },
        { label: 'Date', value: (o) => new Date(o.createdAt).toLocaleDateString() },
        { label: 'Total Amount', value: (o) => o.totalAmount },
        { label: 'Discount Amount', value: (o) => o.discountAmount ?? 0 },
        { label: 'Shipping Cost', value: (o) => o.shippingCost ?? 0 },
        { label: 'Coupon Code', value: (o) => o.couponCode || '' },
        { label: 'Payment Status', value: (o) => o.paymentStatus },
        { label: 'Order Status', value: (o) => o.orderStatus },
        { label: 'Refund Status', value: (o) => o.refundStatus || '' },
        { label: 'Street', value: (o) => o.shippingAddress?.street || '' },
        { label: 'City', value: (o) => o.shippingAddress?.city || '' },
        { label: 'State', value: (o) => o.shippingAddress?.state || '' },
        { label: 'Postal Code', value: (o) => o.shippingAddress?.postalCode || '' },
        { label: 'Country', value: (o) => o.shippingAddress?.country || '' },
        { label: 'Phone', value: (o) => o.shippingAddress?.phone || '' },
      ],
    },
    customers: {
      filename: 'customers',
      rows: () => filteredCustomers,
      columns: [
        { label: 'Name', value: (c) => c.name },
        { label: 'Email', value: (c) => c.email },
        { label: 'Signup Date', value: (c) => new Date(c.createdAt).toLocaleDateString() },
        { label: 'Order Count', value: (c) => c.orderCount || 0 },
      ],
    },
  };

  const handleExportCsv = () => {
    const config = CSV_EXPORT_CONFIG[activeTab];
    if (!config) return;
    const rows = config.rows();
    const dateStamp = new Date().toISOString().slice(0, 10);
    exportRowsAsCsv(`${config.filename}-${dateStamp}.csv`, config.columns, rows);
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ source: 'admin' }),
        credentials: 'include'
      });
    } catch (err) {
      console.error(err);
    } finally {
      adminToken.clear();
      router.push('/login');
    }
  };

  const value = {
    activeTab,
    isOrderDetail,
    isProductForm,
    pathname,
    products,
    setProducts,
    categories,
    setCategories,
    orders,
    setOrders,
    promoBanners,
    setPromoBanners,
    coupons,
    setCoupons,
    abandonedCarts,
    setAbandonedCarts,
    wishlistInsights,
    setWishlistInsights,
    wishlistCustomers,
    setWishlistCustomers,
    abandonedThreshold,
    setAbandonedThreshold,
    loading,
    setLoading,
    settingsForm,
    setSettingsForm,
    savingSettings,
    setSavingSettings,
    searchTerm,
    setSearchTerm,
    modalMode,
    setModalMode,
    currentProductId,
    setCurrentProductId,
    isStockModalOpen,
    setIsStockModalOpen,
    stockEditProduct,
    setStockEditProduct,
    stockEditColors,
    setStockEditColors,
    standardSizesList,
    name,
    setName,
    description,
    setDescription,
    price,
    setPrice,
    discountedPrice,
    setDiscountedPrice,
    isOnSale,
    setIsOnSale,
    category,
    setCategory,
    isCategoryDropdownOpen,
    setIsCategoryDropdownOpen,
    colors,
    setColors,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    categoryModalMode,
    setCategoryModalMode,
    currentCategoryId,
    setCurrentCategoryId,
    categoryName,
    setCategoryName,
    categoryImage,
    setCategoryImage,
    categoryUploading,
    setCategoryUploading,
    occasionsText,
    setOccasionsText,
    tagsText,
    setTagsText,
    detailsText,
    setDetailsText,
    isFeatured,
    setIsFeatured,
    isBestSeller,
    setIsBestSeller,
    allReviews,
    setAllReviews,
    customers,
    setCustomers,
    ratingFilter,
    setRatingFilter,
    isBannerModalOpen,
    setIsBannerModalOpen,
    bannerMessage,
    setBannerMessage,
    bannerLink,
    setBannerLink,
    bannerOrder,
    setBannerOrder,
    isCouponModalOpen,
    setIsCouponModalOpen,
    couponModalMode,
    setCouponModalMode,
    currentCouponId,
    setCurrentCouponId,
    couponCode,
    setCouponCode,
    couponDescription,
    setCouponDescription,
    couponDiscountType,
    setCouponDiscountType,
    couponDiscountValue,
    setCouponDiscountValue,
    couponMaxDiscount,
    setCouponMaxDiscount,
    couponMinOrder,
    setCouponMinOrder,
    couponMaxUses,
    setCouponMaxUses,
    couponMaxUsesPerUser,
    setCouponMaxUsesPerUser,
    couponFirstOrderOnly,
    setCouponFirstOrderOnly,
    couponApplicableCategories,
    setCouponApplicableCategories,
    editingStockId,
    setEditingStockId,
    tempStocks,
    setTempStocks,
    selectedOrder,
    setSelectedOrder,
    refundingId,
    setRefundingId,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    router,
    user,
    setUser,
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadData,
    openStockEditModal,
    closeStockEditModal,
    handleSaveStock,
    loadProductIntoForm,
    resetProductForm,
    handleColorChange,
    handleAddColor,
    handleRemoveColor,
    handleFileUpload,
    handleRemoveImage,
    handleDrag,
    handleDrop,
    handleAddPasteUrl,
    handleSubmitProduct,
    handleDeleteProduct,
    startInlineEdit,
    saveInlineStock,
    handleUpdateOrderStatus,
    handleRetryRefund,
    handleSaveTracking,
    openOrderDetails,
    handleCategoryFileUpload,
    openCategoryAddModal,
    openCategoryEditModal,
    openBannerAddModal,
    openCouponAddModal,
    openCouponEditModal,
    handleSubmitCategory,
    handleDeleteCategory,
    handleDeleteReview,
    handleToggleBanner,
    handleDeleteBanner,
    handleSaveSettings,
    lowStockThreshold,
    handleToggleCoupon,
    handleDeleteCoupon,
    handleSubmitBanner,
    handleSubmitCoupon,
    totalProducts,
    lowStockAlertCount,
    totalOrdersCount,
    pendingOrdersCount,
    totalRevenue,
    filteredProducts,
    filteredOrders,
    filteredCategories,
    filteredReviews,
    filteredCustomers,
    CSV_EXPORT_CONFIG,
    handleExportCsv,
    logout,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
