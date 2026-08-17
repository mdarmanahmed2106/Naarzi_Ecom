'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { productsApi, categoriesApi, ordersApi, uploadApi, adminApi, promoBannersApi, couponsApi } from '@/lib/api';

function AdminHeader({ user, logout }) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-outline-variant/30 py-4 px-6 md:px-10 lg:px-16 shadow-sm">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex flex-col items-start justify-center hover:opacity-85 transition-opacity">
            <span className="font-display-lg text-xl md:text-2xl tracking-widest text-primary font-bold leading-none">
              NAARZI
            </span>
            <span className="font-label-caps text-[6px] md:text-[8px] tracking-[0.4em] text-[#C5A059] font-bold mt-1 uppercase">
              OWN THE MOMENT
            </span>
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
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'inventory' | 'orders' | 'banners' | 'coupons' | 'marketing'
  
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
  const [isOnSale, setIsOnSale] = useState(false);
  const [category, setCategory] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  
  // Category Form Field States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState('add'); // 'add' | 'edit'
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [categoryUploading, setCategoryUploading] = useState(false);
  const [occasionsText, setOccasionsText] = useState('');
  const [tagsText, setTagsText] = useState('');
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
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState('percentage');
  const [couponDiscountValue, setCouponDiscountValue] = useState(0);
  const [couponMinOrder, setCouponMinOrder] = useState(0);
  const [couponMaxUses, setCouponMaxUses] = useState(100);
  
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

  const router = useRouter();
  const [user, setUser] = useState(null);

  // Load products, categories, and orders on authorized mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (response.ok && data.user && data.user.role === 'admin') {
          setUser(data.user);
          loadData();
        } else {
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
    } catch (err) {
      console.error('Failed to load admin stats:', err);
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

  // Pre-fill form fields for Editing Product
  const openEditModal = (product) => {
    setModalMode('edit');
    setCurrentProductId(product._id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setDiscountedPrice(product.discountedPrice !== undefined && product.discountedPrice !== null ? product.discountedPrice : '');
    setIsOnSale(product.isOnSale || false);
    setCategory(product.category?._id || product.category || '');
    setImagesText(product.images.join('\n'));
    setUploadedImages(product.images ? product.images.map((url, idx) => ({ id: `existing-${idx}-${Date.now()}`, url, status: 'success' })) : []);
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
    setIsOnSale(false);
    setCategory(categories[0]?._id || '');
    setImagesText('');
    setUploadedImages([]);
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

  const handleFileUpload = async (files) => {
    const filesArray = Array.from(files);
    const newItems = filesArray.map(file => {
      const id = `upload-${Date.now()}-${Math.random()}`;
      return {
        id,
        file,
        name: file.name,
        status: 'uploading'
      };
    });
    
    setUploadedImages(prev => [...prev, ...newItems]);

    newItems.forEach(async (item) => {
      const formData = new FormData();
      formData.append('image', item.file);

      try {
        const response = await uploadApi.uploadImage(formData);
        if (response.success && response.url) {
          setUploadedImages(prev => prev.map(img => 
            img.id === item.id 
              ? { ...img, url: response.url, status: 'success' }
              : img
          ));
        } else {
          throw new Error(response.message || 'Upload failed');
        }
      } catch (err) {
        console.error('File Upload Failed:', err);
        setUploadedImages(prev => prev.map(img => 
          img.id === item.id 
            ? { ...img, status: 'failed', error: err.message || 'Upload failed' }
            : img
        ));
      }
    });
  };

  const handleRetryUpload = async (item) => {
    setUploadedImages(prev => prev.map(img => 
      img.id === item.id 
        ? { ...img, status: 'uploading', error: null }
        : img
    ));

    const formData = new FormData();
    formData.append('image', item.file);

    try {
      const response = await uploadApi.uploadImage(formData);
      if (response.success && response.url) {
        setUploadedImages(prev => prev.map(img => 
          img.id === item.id 
            ? { ...img, url: response.url, status: 'success' }
            : img
        ));
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('File Retry Upload Failed:', err);
      setUploadedImages(prev => prev.map(img => 
        img.id === item.id 
          ? { ...img, status: 'failed', error: err.message || 'Upload failed' }
          : img
      ));
    }
  };

  const handleRemoveImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleAddPasteUrl = () => {
    if (pasteUrl.trim()) {
      setUploadedImages(prev => [
        ...prev,
        { id: `paste-${Date.now()}-${Math.random()}`, url: pasteUrl.trim(), status: 'success' }
      ]);
      setPasteUrl('');
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

    const imageUrls = uploadedImages
      .filter(img => img.status === 'success')
      .map(img => img.url);
    if (imageUrls.length === 0) {
      setErrorMsg('At least one valid image is required (upload or paste a URL)');
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
      isOnSale,
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

  const handleCategoryFileUpload = async (file) => {
    if (!file) return;
    setCategoryUploading(true);
    const formData = new FormData();
    formData.append('image', file);
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
    setCouponCode('');
    setCouponDiscountType('percentage');
    setCouponDiscountValue(0);
    setCouponMinOrder(0);
    setCouponMaxUses(100);
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
      const response = await couponsApi.create({
        code: couponCode.toUpperCase(),
        discountType: couponDiscountType,
        discountValue: Number(couponDiscountValue),
        minOrderValue: Number(couponMinOrder),
        maxUses: Number(couponMaxUses),
        isActive: true
      });
      if (response.success) {
        setSuccessMsg('Coupon created successfully');
        setIsCouponModalOpen(false);
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create coupon');
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

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'admin' }),
        credentials: 'include'
      });
      router.push('/login');
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  };

  // 1. Loading User Check
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <div className="flex-1 flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col">
      <AdminHeader user={user} logout={logout} />

      <div className="flex flex-1 w-full relative">
        {/* Sidebar Navigation */}
        <aside className="w-64 shrink-0 border-r border-outline-variant/30 hidden md:block pt-10 pr-6 pl-6 lg:pl-10 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          <div className="pb-10">
            <h2 className="text-[10px] font-label-caps text-on-surface-variant tracking-wider font-bold mb-4 px-4">ADMIN MENU</h2>
            <nav className="flex flex-col gap-1 text-sm font-label-caps font-bold">
              <button 
                onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-left ${
                  activeTab === 'products' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                PRODUCTS
              </button>
              <button 
                onClick={() => { setActiveTab('inventory'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-left ${
                  activeTab === 'inventory' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">inventory</span>
                INVENTORY
              </button>
              <button 
                onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-left ${
                  activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                ORDERS
              </button>
              <button 
                onClick={() => { setActiveTab('categories'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-left ${
                  activeTab === 'categories' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">category</span>
                CATEGORIES
              </button>
              <button 
                onClick={() => { setActiveTab('banners'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-left ${
                  activeTab === 'banners' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">campaign</span>
                PROMO BANNERS
              </button>
              <button 
                onClick={() => { setActiveTab('coupons'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-left ${
                  activeTab === 'coupons' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">local_offer</span>
                COUPONS
              </button>
              <button 
                onClick={() => { setActiveTab('reviews'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-left ${
                  activeTab === 'reviews' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">reviews</span>
                REVIEWS
              </button>
              <button 
                onClick={() => { setActiveTab('customers'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-left ${
                  activeTab === 'customers' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                CUSTOMERS
              </button>
              <button 
                onClick={() => { setActiveTab('marketing'); setSearchTerm(''); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full text-left ${
                  activeTab === 'marketing' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">insights</span>
                MARKETING
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 px-6 md:pl-8 md:pr-10 lg:pr-16 w-full pt-10 pb-24 overflow-x-hidden">
        
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
          
          {(activeTab === 'products' || activeTab === 'inventory') ? (
            <button 
              onClick={openAddModal}
              className="px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-md flex items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              ADD NEW PRODUCT
            </button>
          ) : activeTab === 'categories' ? (
            <button 
              onClick={openCategoryAddModal}
              className="px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-md flex items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              ADD NEW CATEGORY
            </button>
          ) : activeTab === 'banners' ? (
            <button 
              onClick={openBannerAddModal}
              className="px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-md flex items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              ADD NEW BANNER
            </button>
          ) : activeTab === 'coupons' ? (
            <button 
              onClick={openCouponAddModal}
              className="px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-md flex items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              ADD NEW COUPON
            </button>
          ) : null}
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

        {/* Stats Grid - 5 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-gutter mb-12">
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
          {/* Card 5 */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block">TOTAL REVENUE</span>
              <span className="font-display-lg text-2xl font-bold text-primary">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRevenue)}
              </span>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs (Hidden on Desktop) */}
        <div className="md:hidden flex overflow-x-auto gap-4 pb-4 mb-6 border-b border-outline-variant/30 scrollbar-hide">
          <button 
            onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'products' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            PRODUCTS
          </button>
          <button 
            onClick={() => { setActiveTab('inventory'); setSearchTerm(''); }}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'inventory' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            INVENTORY
          </button>
          <button 
            onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            ORDERS
          </button>
          <button 
            onClick={() => { setActiveTab('categories'); setSearchTerm(''); }}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'categories' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            CATEGORIES
          </button>
          <button 
            onClick={() => { setActiveTab('reviews'); setSearchTerm(''); }}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'reviews' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            REVIEWS
          </button>
          <button 
            onClick={() => { setActiveTab('customers'); setSearchTerm(''); }}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'customers' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            CUSTOMERS
          </button>
        </div>

        {/* Dashboard Controls (Search & Filters) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="font-display-lg text-2xl font-bold text-primary hidden md:block">
            {activeTab === 'products' && 'Products Directory'}
            {activeTab === 'inventory' && 'Inventory Management'}
            {activeTab === 'orders' && 'Orders Management'}
            {activeTab === 'categories' && 'Categories'}
            {activeTab === 'reviews' && 'Reviews Moderation'}
            {activeTab === 'customers' && 'Customers Directory'}
          </h2>

          {/* Quick Search & Rating Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto ml-auto">
            {activeTab === 'reviews' && (
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-outline-variant/40 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            )}

            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
                search
              </span>
              <input 
                type="text" 
                placeholder={
                  activeTab === 'orders' 
                    ? "Search by Order ID or User..." 
                    : activeTab === 'customers'
                    ? "Search by Name or Email..."
                    : activeTab === 'reviews'
                    ? "Search reviews..."
                    : "Search directory..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant/40 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="font-body-md text-sm text-on-surface-variant">Syncing directory...</p>
          </div>
        ) : (
          (activeTab === 'orders' && filteredOrders.length === 0) ||
          ((activeTab === 'products' || activeTab === 'inventory') && filteredProducts.length === 0) ||
          (activeTab === 'categories' && filteredCategories.length === 0) ||
          (activeTab === 'reviews' && filteredReviews.length === 0) ||
          (activeTab === 'customers' && filteredCustomers.length === 0)
        ) ? (
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
        ) : activeTab === 'orders' ? (
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
        ) : activeTab === 'categories' ? (
          /* Categories Management Tab Table */
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Category Name</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6 text-center">Products Count</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md">
                  {filteredCategories.map((cat) => {
                    const prodCount = products.filter(p => (p.category?._id || p.category) === cat._id).length;
                    return (
                      <tr key={cat._id} className="hover:bg-surface-container/10 transition-colors">
                        <td className="py-4 px-6">
                          <img 
                            src={cat.image || 'https://placehold.co/100x100?text=No+Image'} 
                            alt={cat.name} 
                            className="w-12 h-12 object-cover rounded-lg bg-surface-container border border-outline-variant/25 shadow-sm"
                          />
                        </td>
                        <td className="py-4 px-6 font-semibold text-on-surface font-sans">
                          {cat.name}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">
                          {cat.slug}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-primary font-sans">
                          {prodCount}
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button 
                            onClick={() => openCategoryEditModal(cat)}
                            className="px-3 py-1.5 bg-transparent border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary text-[10px] font-label-caps tracking-widest rounded-lg transition-colors cursor-pointer font-bold inline-block"
                          >
                            EDIT
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                            className="px-3 py-1.5 bg-transparent border border-error/30 hover:bg-error hover:text-white text-error text-[10px] font-label-caps tracking-widest rounded-lg transition-colors cursor-pointer font-bold inline-block"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'reviews' ? (
          /* Reviews Moderation Tab Table */
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Reviewer</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6">Comment</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md">
                  {filteredReviews.map((rev) => (
                    <tr key={rev._id} className="hover:bg-surface-container/10 transition-colors">
                      <td className="py-4 px-6 font-semibold text-primary font-sans">
                        {rev.product ? (
                          <Link href={`/products/${rev.product.slug}`} className="hover:underline">
                            {rev.product.name}
                          </Link>
                        ) : (
                          '[Deleted Product]'
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-on-surface block leading-tight">{rev.user?.name || 'Anonymous'}</span>
                        <span className="text-[10px] text-on-surface-variant block mt-0.5 font-light">{rev.user?.email || ''}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-0.5 text-secondary">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={`material-symbols-outlined text-sm ${rev.rating >= star ? 'fill-1' : 'opacity-25'}`}
                              style={{ fontVariationSettings: rev.rating >= star ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant max-w-xs truncate" title={rev.comment}>
                        {rev.comment}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant text-xs font-sans">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleDeleteReview(rev._id)}
                          className="px-3.5 py-1.5 bg-transparent border border-error/30 hover:bg-error hover:text-white text-error text-[10px] font-label-caps tracking-widest rounded-lg transition-colors cursor-pointer font-bold inline-block"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'customers' ? (
          /* Customers Directory Tab Table */
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                    <th className="py-4 px-6">Customer Name</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Signup Date</th>
                    <th className="py-4 px-6 text-center font-sans">Orders Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust._id} className="hover:bg-surface-container/10 transition-colors">
                      <td className="py-4 px-6 font-semibold text-on-surface font-sans">
                        {cust.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">
                        {cust.email}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant text-xs font-sans">
                        {new Date(cust.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-primary font-sans">
                        {cust.orderCount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'banners' ? (
          /* Banners Tab Table */
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                    <th className="py-4 px-6">Message</th>
                    <th className="py-4 px-6">Link</th>
                    <th className="py-4 px-6">Order</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md">
                  {promoBanners.map((b) => (
                    <tr key={b._id} className="hover:bg-surface-container/10 transition-colors">
                      <td className="py-4 px-6 font-semibold text-on-surface font-sans">{b.message}</td>
                      <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">{b.link || '-'}</td>
                      <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">{b.order}</td>
                      <td className="py-4 px-6 font-mono text-xs">
                        <button 
                          onClick={() => handleToggleBanner(b)}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {b.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => handleDeleteBanner(b._id)} className="px-3 text-error text-[10px] font-bold">DELETE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'coupons' ? (
          /* Coupons Tab Table */
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                    <th className="py-4 px-6">Code</th>
                    <th className="py-4 px-6">Discount</th>
                    <th className="py-4 px-6">Uses</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-surface-container/10 transition-colors">
                      <td className="py-4 px-6 font-semibold text-on-surface font-sans">{c.code}</td>
                      <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : `INR ${c.discountValue}`}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">
                        {c.usedCount} / {c.maxUses || '∞'}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        <button 
                          onClick={() => handleToggleCoupon(c)}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => handleDeleteCoupon(c._id)} className="px-3 text-error text-[10px] font-bold">DELETE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'marketing' ? (
          <div className="space-y-12 animate-fade-in">
            {/* Abandoned Carts Section */}
            <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-display-md text-on-surface font-bold">Abandoned Carts</h3>
                  <p className="text-on-surface-variant text-sm mt-1">Carts left without checkout.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-label-caps font-bold text-on-surface-variant">Threshold:</label>
                  <select
                    value={abandonedThreshold}
                    onChange={(e) => setAbandonedThreshold(Number(e.target.value))}
                    className="border border-outline-variant rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value={1}>1 Hour+</option>
                    <option value={2}>2 Hours+</option>
                    <option value={6}>6 Hours+</option>
                    <option value={24}>24 Hours+</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-[10px] font-label-caps text-on-surface-variant tracking-wider font-bold">
                      <th className="pb-4 pl-4 font-bold">CUSTOMER</th>
                      <th className="pb-4 font-bold">ITEMS</th>
                      <th className="pb-4 font-bold">VALUE</th>
                      <th className="pb-4 font-bold">LAST UPDATED</th>
                      <th className="pb-4 font-bold text-right pr-4">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abandonedCarts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-on-surface-variant">No abandoned carts found for this threshold.</td>
                      </tr>
                    ) : (
                      abandonedCarts.map((cart) => (
                        <tr key={cart._id} className="border-b border-outline-variant/10 hover:bg-surface-container/30 transition-colors">
                          <td className="py-4 pl-4">
                            <div className="font-bold">{cart.user?.name || 'Unknown'}</div>
                            <div className="text-sm text-on-surface-variant">{cart.user?.email}</div>
                          </td>
                          <td className="py-4">
                            <div className="flex -space-x-2 overflow-hidden">
                              {cart.items.slice(0, 3).map((item, idx) => (
                                <img key={idx} src={item.product?.images[0]} alt="Product" className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" />
                              ))}
                              {cart.items.length > 3 && (
                                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-surface-container text-xs font-bold">
                                  +{cart.items.length - 3}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-on-surface-variant mt-1">{cart.items.length} items</div>
                          </td>
                          <td className="py-4 font-bold text-primary">
                            INR {cart.cartValue?.toFixed(2) || '0.00'}
                          </td>
                          <td className="py-4 text-sm text-on-surface-variant">
                            {new Date(cart.updatedAt).toLocaleString()}
                          </td>
                          <td className="py-4 pr-4 text-right">
                            {cart.user?.email && (
                              <button 
                                onClick={() => navigator.clipboard.writeText(cart.user.email)}
                                className="text-xs font-label-caps font-bold px-3 py-1.5 border border-primary/20 text-primary rounded hover:bg-primary/5 transition-colors"
                              >
                                COPY EMAIL
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Wishlist Insights Section */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Top Products */}
              <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-display-md text-on-surface font-bold mb-6">Most Wishlisted Products</h3>
                <div className="space-y-4">
                  {wishlistInsights.length === 0 ? (
                    <div className="text-on-surface-variant">No wishlist data available.</div>
                  ) : (
                    wishlistInsights.slice(0, 5).map((insight, idx) => (
                      <div key={insight._id} className="flex items-center gap-4">
                        <span className="font-display-md text-xl text-on-surface-variant font-bold w-4">{idx + 1}</span>
                        <img src={insight.images[0]} alt={insight.name} className="w-12 h-12 rounded object-cover" />
                        <div className="flex-1 overflow-hidden">
                          <div className="font-bold text-sm truncate">{insight.name}</div>
                          <div className="text-xs text-on-surface-variant">INR {insight.discountedPrice || insight.price}</div>
                        </div>
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold font-label-caps flex-shrink-0">
                          {insight.count} LIKES
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Wishlist Customers */}
              <div className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-display-md text-on-surface font-bold mb-6">Customers with Wishlists</h3>
                <div className="space-y-4">
                  {wishlistCustomers.length === 0 ? (
                    <div className="text-on-surface-variant">No customers with wishlists.</div>
                  ) : (
                    wishlistCustomers.slice(0, 5).map((customer, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-outline-variant/10 pb-4 last:border-0 last:pb-0">
                        <div>
                          <div className="font-bold text-sm">{customer.user?.name || 'Unknown'}</div>
                          <div className="text-xs text-on-surface-variant">{customer.user?.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{customer.itemCount} items</div>
                          <button 
                            onClick={() => navigator.clipboard.writeText(customer.user?.email || '')}
                            className="text-[10px] text-primary hover:underline font-label-caps font-bold mt-1"
                          >
                            COPY EMAIL
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

      </main>
    </div>

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

              {/* Product Images Upload / Management */}
              <div className="space-y-3">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">PRODUCT IMAGES *</label>
                
                {/* Drag and Drop Zone */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-outline-variant/60 bg-surface hover:bg-surface-container/20'
                  }`}
                  onClick={() => document.getElementById('file-upload-input').click()}
                >
                  <input 
                    id="file-upload-input" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-2">cloud_upload</span>
                  <p className="text-xs font-semibold text-on-surface">Drag & drop your product images here, or click to browse</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Supports PNG, JPG, JPEG (max 5MB per file)</p>
                </div>

                {/* Thumbnails Grid Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    {uploadedImages.map((img) => (
                      <div key={img.id} className="relative aspect-[3/4] bg-surface-container rounded-xl overflow-hidden border border-outline-variant/30 flex items-center justify-center p-1 group">
                        {img.status === 'success' && (
                          <>
                            <img src={img.url} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(img.id);
                              }}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                          </>
                        )}

                        {img.status === 'uploading' && (
                          <div className="flex flex-col items-center justify-center p-2 text-center space-y-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
                            <span className="text-[9px] font-label-caps text-on-surface-variant tracking-wider block font-bold">UPLOADING...</span>
                          </div>
                        )}

                        {img.status === 'failed' && (
                          <div className="flex flex-col items-center justify-center p-2 text-center space-y-2 bg-error-container/20 w-full h-full rounded-lg">
                            <span className="material-symbols-outlined text-xl text-error">warning</span>
                            <span className="text-[9px] text-error font-semibold leading-tight line-clamp-2">{img.error || 'Failed'}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRetryUpload(img);
                              }}
                              className="px-2 py-1 bg-primary text-white text-[9px] font-label-caps tracking-wider rounded hover:bg-primary-container font-bold cursor-pointer"
                            >
                              RETRY
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(img.id);
                              }}
                              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-primary cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[10px]">close</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Paste Fallback Option */}
                <div className="flex gap-2 items-center pt-2">
                  <input 
                    type="text" 
                    placeholder="Or paste direct image URL here..." 
                    value={pasteUrl}
                    onChange={(e) => setPasteUrl(e.target.value)}
                    className="flex-1 px-4 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:border-primary focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddPasteUrl}
                    className="px-4 py-2 bg-primary text-white text-[10px] font-label-caps tracking-widest rounded-xl hover:bg-primary-container transition-colors font-bold cursor-pointer shrink-0"
                  >
                    ADD URL
                  </button>
                </div>
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
              <div className="flex flex-wrap gap-8 border-t border-outline-variant/10 pt-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="chk-onsale"
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-outline-variant/50 rounded cursor-pointer"
                  />
                  <label htmlFor="chk-onsale" className="text-xs font-label-caps tracking-wider text-on-surface-variant font-bold cursor-pointer">
                    ON SALE
                  </label>
                </div>
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

      {/* Category Add / Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white border border-outline-variant/30 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-slide-in text-sm text-on-surface">
            {/* Title */}
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
              <h2 className="font-display-lg text-xl text-primary font-bold">
                {categoryModalMode === 'add' ? 'Add New Category' : 'Edit Category'}
              </h2>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="material-symbols-outlined text-on-surface-variant/70 hover:text-primary cursor-pointer text-xl bg-transparent border-none"
              >
                close
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">CATEGORY NAME *</label>
                <input 
                  type="text" 
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Apparel, Accessories"
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Category Image upload widget */}
              <div className="space-y-2">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">CATEGORY IMAGE *</label>
                
                {/* Image upload area */}
                <div 
                  className="border-2 border-dashed border-outline-variant/60 rounded-xl p-4 text-center cursor-pointer hover:bg-surface-container/20 transition-colors"
                  onClick={() => document.getElementById('category-file-input').click()}
                >
                  <input 
                    id="category-file-input" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files && handleCategoryFileUpload(e.target.files[0])}
                  />
                  {categoryUploading ? (
                    <div className="flex flex-col items-center py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary mb-2"></div>
                      <span className="text-[9px] font-label-caps text-on-surface-variant tracking-wider font-bold">UPLOADING...</span>
                    </div>
                  ) : categoryImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={categoryImage} alt="Category preview" className="w-16 h-16 object-cover rounded-lg border border-outline-variant/25" />
                      <span className="text-[10px] text-primary font-semibold underline">Change Image</span>
                    </div>
                  ) : (
                    <div className="py-2">
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant/50 mb-1">cloud_upload</span>
                      <p className="text-xs text-on-surface font-semibold">Click to upload category image</p>
                    </div>
                  )}
                </div>

                {/* Paste URL Option */}
                <input 
                  type="text" 
                  placeholder="Or paste image URL here..." 
                  value={categoryImage}
                  onChange={(e) => setCategoryImage(e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 border-t border-outline-variant/20 pt-6 mt-6">
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors font-bold cursor-pointer"
                >
                  {categoryModalMode === 'add' ? 'CREATE' : 'SAVE'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-3 bg-transparent border border-outline-variant/50 text-on-surface-variant font-label-caps text-xs tracking-widest rounded-xl hover:bg-surface-container transition-colors font-bold cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Add Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white border border-outline-variant/30 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-slide-in text-sm text-on-surface">
            {/* Title */}
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
              <h2 className="font-display-lg text-xl text-primary font-bold">Add New Banner</h2>
              <button 
                onClick={() => setIsBannerModalOpen(false)}
                className="material-symbols-outlined text-on-surface-variant/70 hover:text-primary cursor-pointer text-xl bg-transparent border-none"
              >
                close
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitBanner} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">BANNER MESSAGE *</label>
                <input 
                  type="text" 
                  required
                  value={bannerMessage}
                  onChange={(e) => setBannerMessage(e.target.value)}
                  placeholder="e.g. SUMMER SALE: 50% OFF"
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">LINK (OPTIONAL)</label>
                <input 
                  type="text" 
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  placeholder="e.g. /sale"
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">ORDER (DISPLAY SEQUENCE) *</label>
                <input 
                  type="number" 
                  required
                  value={bannerOrder}
                  onChange={(e) => setBannerOrder(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 border-t border-outline-variant/20 pt-6 mt-6">
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors font-bold cursor-pointer"
                >
                  CREATE
                </button>
                <button 
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="flex-1 py-3 bg-transparent border border-outline-variant/50 text-on-surface-variant font-label-caps text-xs tracking-widest rounded-xl hover:bg-surface-container transition-colors font-bold cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Add Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white border border-outline-variant/30 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-slide-in text-sm text-on-surface">
            {/* Title */}
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
              <h2 className="font-display-lg text-xl text-primary font-bold">Add New Coupon</h2>
              <button 
                onClick={() => setIsCouponModalOpen(false)}
                className="material-symbols-outlined text-on-surface-variant/70 hover:text-primary cursor-pointer text-xl bg-transparent border-none"
              >
                close
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitCoupon} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">COUPON CODE *</label>
                <input 
                  type="text" 
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">DISCOUNT TYPE *</label>
                  <select 
                    value={couponDiscountType}
                    onChange={(e) => setCouponDiscountType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (INR)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">DISCOUNT VALUE *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={couponDiscountValue}
                    onChange={(e) => setCouponDiscountValue(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">MIN ORDER VALUE</label>
                  <input 
                    type="number" 
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">MAX USES</label>
                  <input 
                    type="number" 
                    value={couponMaxUses}
                    onChange={(e) => setCouponMaxUses(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 border-t border-outline-variant/20 pt-6 mt-6">
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors font-bold cursor-pointer"
                >
                  CREATE
                </button>
                <button 
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-3 bg-transparent border border-outline-variant/50 text-on-surface-variant font-label-caps text-xs tracking-widest rounded-xl hover:bg-surface-container transition-colors font-bold cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
