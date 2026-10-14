'use client';

import React from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/shared';
import { useAdmin } from '@/components/admin/AdminProvider';

// Chrome shared by every admin section; the section itself renders as children
export default function AdminShell({ children }) {
  const {
    activeTab,
    isOrderDetail,
    products,
    categories,
    orders,
    coupons,
    loading,
    searchTerm,
    setSearchTerm,
    isFormModalOpen,
    setIsFormModalOpen,
    modalMode,
    isStockModalOpen,
    stockEditProduct,
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
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    categoryModalMode,
    categoryName,
    setCategoryName,
    categoryImage,
    setCategoryImage,
    categoryUploading,
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
    customers,
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
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    user,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    closeStockEditModal,
    handleSaveStock,
    openAddModal,
    handleColorChange,
    handleAddColor,
    handleRemoveColor,
    handleFileUpload,
    handleRemoveImage,
    handleDrag,
    handleDrop,
    handleAddPasteUrl,
    handleSubmitProduct,
    handleCategoryFileUpload,
    openCategoryAddModal,
    openBannerAddModal,
    openCouponAddModal,
    handleSubmitCategory,
    handleSubmitBanner,
    handleSubmitCoupon,
    totalProducts,
    lowStockAlertCount,
    totalOrdersCount,
    pendingOrdersCount,
    totalRevenue,
    handleExportCsv,
    logout,
  } = useAdmin();

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
      <AdminHeader 
        user={user} 
        logout={logout} 
        notifications={notifications} 
        unreadCount={unreadCount} 
        markAsRead={markAsRead} 
        markAllAsRead={markAllAsRead} 
      />

      <div className="flex flex-1 w-full relative">
        {/* Sidebar Navigation */}
        <aside className="w-64 shrink-0 border-r border-outline-variant/30 hidden md:block pt-10 pr-6 pl-6 lg:pl-10 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          <div className="pb-10">
            <h2 className="text-[10px] font-label-caps text-on-surface-variant tracking-wider font-bold mb-4 px-4">ADMIN MENU</h2>
            <nav className="flex flex-col gap-1 text-sm font-label-caps font-bold">
              <Link
                href="/products"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                  activeTab === 'products' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                PRODUCTS
              </Link>
              <Link
                href="/inventory"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                  activeTab === 'inventory' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">inventory</span>
                INVENTORY
              </Link>
              <Link
                href="/orders"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                  activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                ORDERS
              </Link>
              <Link
                href="/categories"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                  activeTab === 'categories' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">category</span>
                CATEGORIES
              </Link>
              <Link
                href="/banners"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                  activeTab === 'banners' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">campaign</span>
                PROMO BANNERS
              </Link>
              <Link
                href="/coupons"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                  activeTab === 'coupons' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">local_offer</span>
                COUPONS
              </Link>
              <Link
                href="/reviews"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                  activeTab === 'reviews' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">reviews</span>
                REVIEWS
              </Link>
              <Link
                href="/customers"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                  activeTab === 'customers' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                CUSTOMERS
              </Link>
              <Link
                href="/marketing"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                  activeTab === 'marketing' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">insights</span>
                MARKETING
              </Link>
              <Link
                href="/settings"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                  activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                SETTINGS
              </Link>
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
          
          <div className="flex items-center gap-3">
          {!isOrderDetail && (activeTab === 'products' || activeTab === 'inventory' || activeTab === 'orders' || activeTab === 'customers') && (
            <button
              onClick={handleExportCsv}
              className="px-6 py-3.5 bg-transparent border border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary font-label-caps text-xs tracking-widest rounded-xl transition-colors flex items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              EXPORT CSV
            </button>
          )}
          {(activeTab === 'products' || activeTab === 'inventory') ? (
            <button
              onClick={openAddModal}
              className="px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              ADD NEW PRODUCT
            </button>
          ) : activeTab === 'categories' ? (
            <button
              onClick={openCategoryAddModal}
              className="px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              ADD NEW CATEGORY
            </button>
          ) : activeTab === 'banners' ? (
            <button 
              onClick={openBannerAddModal}
              className="px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              ADD NEW BANNER
            </button>
          ) : activeTab === 'coupons' ? (
            <button 
              onClick={openCouponAddModal}
              className="px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              ADD NEW COUPON
            </button>
          ) : null}
          </div>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="mb-8 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {successMsg}
            </div>
            <button onClick={() => setSuccessMsg('')} className="material-symbols-outlined text-base cursor-pointer opacity-60 hover:opacity-100">close</button>
          </div>
        )}
        {errorMsg && (
          <div className="mb-8 p-4 bg-error-container text-error text-sm rounded-xl border border-error/20 flex justify-between items-center">
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
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block">TOTAL PRODUCTS</span>
              <span className="font-display-lg text-3xl font-bold text-primary">{totalProducts}</span>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">apparel</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className={`border rounded-2xl p-6 flex items-center justify-between transition-all ${
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
          <div className={`border rounded-2xl p-6 flex items-center justify-between transition-all ${
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
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block">TOTAL ORDERS</span>
              <span className="font-display-lg text-3xl font-bold text-primary">{totalOrdersCount}</span>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">local_mall</span>
            </div>
          </div>
          {/* Card 5 */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 flex items-center justify-between">
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
          <Link
            href="/products"
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'products' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            PRODUCTS
          </Link>
          <Link
            href="/inventory"
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'inventory' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            INVENTORY
          </Link>
          <Link
            href="/orders"
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            ORDERS
          </Link>
          <Link
            href="/categories"
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'categories' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            CATEGORIES
          </Link>
          <Link
            href="/reviews"
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'reviews' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            REVIEWS
          </Link>
          <Link
            href="/customers"
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-label-caps font-bold transition-colors ${
              activeTab === 'customers' ? 'bg-primary/10 text-primary' : 'bg-surface-container/50 text-on-surface-variant'
            }`}
          >
            CUSTOMERS
          </Link>
        </div>

        {/* Dashboard Controls (Search & Filters) — hidden on a single order */}
        {!isOrderDetail && (
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
        )}

        {/* Section content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="font-body-md text-sm text-on-surface-variant">Syncing directory...</p>
          </div>
        ) : children}

      </main>
    </div>

      {/* Stock Edit Modal */}
      {isStockModalOpen && stockEditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 sticky top-0 bg-surface z-10">
              <h2 className="font-display-lg text-2xl font-bold text-on-surface">Edit Stock: {stockEditProduct.name}</h2>
              <button onClick={closeStockEditModal} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-surface-container/20">
              {stockEditColors.length > 0 ? stockEditColors.map((color, cIdx) => (
                <div key={cIdx} className="bg-white p-5 rounded-xl border border-outline-variant/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: color.hexCode }}></div>
                    <h3 className="font-bold text-on-surface text-base">{color.name}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {color.sizes.map((sz, sIdx) => (
                      <div key={sIdx} className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-label-caps text-on-surface-variant font-bold tracking-widest">{sz.size}</label>
                        <input
                          type="number"
                          min="0"
                          value={sz.stock}
                          onChange={(e) => {
                            const newColors = [...stockEditColors];
                            newColors[cIdx].sizes[sIdx].stock = parseInt(e.target.value) || 0;
                            setStockEditColors(newColors);
                          }}
                          className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-center p-8 text-on-surface-variant">No color variants found for this product. Please use the full product edit modal to configure colors and sizes first.</div>
              )}
            </div>

            <div className="p-6 border-t border-outline-variant/30 sticky bottom-0 bg-surface flex justify-end gap-3 z-10">
              <button
                type="button"
                onClick={closeStockEditModal}
                className="px-6 py-2.5 rounded-full border border-outline-variant/50 text-sm font-label-caps tracking-widest font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveStock}
                className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-label-caps tracking-widest font-bold hover:bg-primary/90 transition-colors"
              >
                SAVE STOCK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-outline-variant/30 rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto my-8 animate-slide-in">
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
                  <div className="relative">
                    <div 
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors cursor-pointer flex justify-between items-center"
                    >
                      <span className={category ? 'text-on-surface' : 'text-on-surface-variant/70 text-sm'}>
                        {category ? categories.find(c => c._id === category)?.name : 'Select Category'}
                      </span>
                      <span className="material-symbols-outlined text-xl text-on-surface-variant">expand_more</span>
                    </div>
                    
                    {isCategoryDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                        ></div>
                        <div className="absolute z-50 w-full mt-2 bg-surface border border-outline-variant/40 rounded-xl max-h-60 overflow-y-auto">
                          {categories.map((c) => (
                            <div 
                              key={c._id}
                              onClick={() => {
                                setCategory(c._id);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className="px-4 py-3 hover:bg-surface-container-low cursor-pointer text-sm text-on-surface transition-colors"
                            >
                              {c.name}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
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

              {/* Details */}
              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">DETAILS (ONE PER LINE — SHOWN AS PDP BULLET LIST)</label>
                <textarea
                  rows={4}
                  value={detailsText}
                  onChange={(e) => setDetailsText(e.target.value)}
                  placeholder={'100% Organic Cotton\nConcealed side zipper\nDry clean only\nMade in India'}
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors text-xs leading-relaxed"
                />
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">PRICE (₹) *</label>
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
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">DISCOUNTED PRICE (₹ - OPTIONAL)</label>
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

              {/* Color Variants Management */}
              <div className="space-y-6 mt-8">
                <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                  <h3 className="font-display-lg text-lg text-primary font-bold">Color Variants *</h3>
                  <button type="button" onClick={handleAddColor} className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-bold rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">add</span> ADD COLOR
                  </button>
                </div>

                {colors.map((color, colorIdx) => (
                  <div key={color.id} className="p-4 border border-outline-variant/30 rounded-xl bg-surface-container/10 space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center flex-1">
                        <div className="flex-1 space-y-1">
                          <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">COLOR NAME</label>
                          <input type="text" value={color.name} onChange={(e) => handleColorChange(colorIdx, 'name', e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant/40 rounded-lg text-sm focus:border-primary focus:outline-none transition-colors" placeholder="e.g. Midnight Blue" required />
                        </div>
                        <div className="w-20 space-y-1">
                          <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">HEX</label>
                          <input type="color" value={color.hexCode} onChange={(e) => handleColorChange(colorIdx, 'hexCode', e.target.value)} className="w-full h-[38px] bg-surface border border-outline-variant/40 rounded-lg cursor-pointer" />
                        </div>
                      </div>
                      <button type="button" onClick={() => handleRemoveColor(colorIdx)} className="ml-4 p-2 text-error hover:bg-error/10 rounded-lg transition-colors mt-5">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">IMAGES FOR {color.name.toUpperCase()} *</label>
                      <div onDragEnter={(e) => handleDrag(colorIdx, e)} onDragOver={(e) => handleDrag(colorIdx, e)} onDragLeave={(e) => handleDrag(colorIdx, e)} onDrop={(e) => handleDrop(colorIdx, e)} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${color.dragActive ? 'border-primary bg-primary/5' : 'border-outline-variant/60 bg-surface hover:bg-surface-container/20'}`} onClick={() => document.getElementById(`file-upload-${colorIdx}`).click()}>
                        <input id={`file-upload-${colorIdx}`} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFileUpload(colorIdx, e.target.files)} />
                        <span className="material-symbols-outlined text-2xl text-on-surface-variant/50 mb-1">cloud_upload</span>
                        <p className="text-xs text-on-surface">Click or drag images</p>
                      </div>
                      {color.uploadedImages.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                          {color.uploadedImages.map((img) => (
                            <div key={img.id} className="relative aspect-[3/4] bg-surface-container rounded-lg overflow-hidden border border-outline-variant/30 group">
                              {img.status === 'success' && (
                                <>
                                  <img src={img.url} className="w-full h-full object-cover" alt="Preview" />
                                  <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveImage(colorIdx, img.id); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"><span className="material-symbols-outlined text-[10px]">close</span></button>
                                </>
                              )}
                              {img.status === 'uploading' && <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div></div>}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 items-center">
                        <input type="text" placeholder="Or paste image URL..." value={color.pasteUrl} onChange={(e) => handleColorChange(colorIdx, 'pasteUrl', e.target.value)} className="flex-1 px-3 py-1.5 bg-surface border border-outline-variant/40 rounded-lg text-xs" />
                        <button type="button" onClick={() => handleAddPasteUrl(colorIdx)} className="px-3 py-1.5 bg-primary text-white text-[10px] rounded-lg">ADD URL</button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">SIZES & INVENTORY FOR {color.name.toUpperCase()} *</label>
                      <div className="grid grid-cols-2 gap-2 border border-outline-variant/20 p-3 rounded-lg bg-surface">
                        {standardSizesList.map((size) => {
                          const isEnabled = color.sizesStock[size]?.enabled;
                          return (
                            <div key={size} className="flex items-center gap-2">
                              <input type="checkbox" checked={isEnabled} onChange={(e) => {
                                const st = { ...color.sizesStock };
                                st[size].enabled = e.target.checked;
                                handleColorChange(colorIdx, 'sizesStock', st);
                              }} className="w-3.5 h-3.5 text-primary" />
                              <span className="text-xs font-semibold w-12">{size}</span>
                              {isEnabled && (
                                <input type="number" min="0" value={color.sizesStock[size].stock} onChange={(e) => {
                                  const st = { ...color.sizesStock };
                                  st[size].stock = parseInt(e.target.value) || 0;
                                  handleColorChange(colorIdx, 'sizesStock', st);
                                }} className="w-16 px-2 py-1 text-xs bg-surface border rounded" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
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

      {/* Category Add / Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white border border-outline-variant/30 rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-slide-in text-sm text-on-surface">
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
          <div className="relative w-full max-w-md bg-white border border-outline-variant/30 rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-slide-in text-sm text-on-surface">
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
          <div className="relative w-full max-w-lg bg-white border border-outline-variant/30 rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-slide-in text-sm text-on-surface">
            {/* Title */}
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
              <div>
                <h2 className="font-display-lg text-xl text-primary font-bold">
                  {couponModalMode === 'add' ? 'Create New Coupon' : `Edit Coupon: ${couponCode}`}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Configure discount terms, customer eligibility, and profit safeguards.
                </p>
              </div>
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
                  placeholder="e.g. FESTIVE15"
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors uppercase font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">OFFER DESCRIPTION / TAGLINE</label>
                <input 
                  type="text" 
                  value={couponDescription}
                  onChange={(e) => setCouponDescription(e.target.value)}
                  placeholder="e.g. Flat 15% off on our signature capsule"
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors text-xs"
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
                    <option value="flat">Flat Amount (₹)</option>
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

              {/* Safeguards: Max Discount Cap & Min Order Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">
                    MAX DISCOUNT CAP (₹)
                  </label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1500 (optional)"
                    value={couponMaxDiscount}
                    onChange={(e) => setCouponMaxDiscount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors text-xs"
                  />
                  <span className="text-[10px] text-on-surface-variant/70 block">Protects against large carts</span>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">
                    MIN ORDER VALUE (₹)
                  </label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors text-xs"
                  />
                  <span className="text-[10px] text-on-surface-variant/70 block">0 = no minimum required</span>
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">
                    MAX TOTAL USES
                  </label>
                  <input 
                    type="number" 
                    placeholder="Leave empty for unlimited"
                    value={couponMaxUses}
                    onChange={(e) => setCouponMaxUses(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">
                    MAX USES PER USER
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={couponMaxUsesPerUser}
                    onChange={(e) => setCouponMaxUsesPerUser(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/40 rounded-xl focus:border-primary focus:outline-none transition-colors text-xs"
                  />
                </div>
              </div>

              {/* Applicable Categories Scope */}
              <div className="space-y-1 pt-1">
                <label className="block text-[10px] font-label-caps tracking-wider text-on-surface-variant font-bold">
                  APPLICABLE CATEGORIES / COLLECTIONS
                </label>
                <div className="p-3 bg-surface border border-outline-variant/40 rounded-xl space-y-2 max-h-36 overflow-y-auto">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-on-surface">
                    <input 
                      type="checkbox"
                      checked={couponApplicableCategories.length === 0}
                      onChange={() => setCouponApplicableCategories([])}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span>All Collections (Storewide)</span>
                  </label>
                  <div className="border-t border-outline-variant/30 pt-1.5 space-y-1.5">
                    {categories.map((cat) => {
                      const isChecked = couponApplicableCategories.includes(cat._id);
                      return (
                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant hover:text-on-surface">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCouponApplicableCategories(prev => [...prev, cat._id]);
                              } else {
                                setCouponApplicableCategories(prev => prev.filter(id => id !== cat._id));
                              }
                            }}
                            className="rounded text-primary focus:ring-primary"
                          />
                          <span>{cat.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <span className="text-[10px] text-on-surface-variant/70 block">
                  Leave on "All Collections" to apply across the entire store, or select specific categories.
                </span>
              </div>

              {/* First Order Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 bg-surface-container/20 cursor-pointer hover:bg-surface-container/40 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={couponFirstOrderOnly}
                    onChange={(e) => setCouponFirstOrderOnly(e.target.checked)}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <div>
                    <p className="text-xs font-bold text-on-surface">First-Time Customer Only</p>
                    <p className="text-[11px] text-on-surface-variant">Only accounts with zero previous paid orders can redeem this code.</p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 border-t border-outline-variant/20 pt-6 mt-6">
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors font-bold cursor-pointer"
                >
                  {couponModalMode === 'add' ? 'CREATE COUPON' : 'SAVE CHANGES'}
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
