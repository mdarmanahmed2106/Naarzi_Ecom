'use client';

import React from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/shared';
import { useAdmin } from '@/components/admin/AdminProvider';

// Where "Storefront" in the breadcrumb goes
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || 'https://naarzi.com';

// Every admin section: sidebar label, page title and one-line description
const SECTIONS = {
  products: { title: 'Products', icon: 'grid_view', desc: 'Your catalogue: prices, colour variants and visibility.' },
  inventory: { title: 'Inventory', icon: 'inventory_2', desc: 'Stock levels for every colour and size.' },
  categories: { title: 'Categories', icon: 'category', desc: 'How products are grouped in the store.' },
  orders: { title: 'Orders', icon: 'receipt_long', desc: 'Fulfilment, tracking and refunds.' },
  customers: { title: 'Customers', icon: 'group', desc: 'Everyone with a Naarzi account.' },
  reviews: { title: 'Reviews', icon: 'reviews', desc: 'Moderate what customers say about products.' },
  banners: { title: 'Promo banners', icon: 'campaign', desc: 'Messages in the announcement bar across the store.' },
  coupons: { title: 'Coupons', icon: 'local_offer', desc: 'Discount codes and the rules that guard them.' },
  marketing: { title: 'Marketing', icon: 'insights', desc: 'Abandoned carts and what customers are wishing for.' },
  settings: { title: 'Settings', icon: 'settings', desc: 'Shipping charges and store-wide options.' },
};

const NAV_GROUPS = [
  { label: 'Catalogue', items: ['products', 'inventory', 'categories'] },
  { label: 'Sales', items: ['orders', 'customers', 'reviews'] },
  { label: 'Marketing', items: ['banners', 'coupons', 'marketing'] },
  { label: 'Store', items: ['settings'] },
];

// Sections whose list the search box (and rating filter) actually filters
const SEARCHABLE = ['products', 'inventory', 'orders', 'categories', 'reviews', 'customers'];

// Chrome shared by every admin section; the section itself renders as children
export default function AdminShell({ children }) {
  const {
    activeTab,
    isOrderDetail,
    isProductForm,
    pathname,
    products,
    categories,
    orders,
    coupons,
    loading,
    searchTerm,
    setSearchTerm,
    isStockModalOpen,
    stockEditProduct,
    stockEditColors,
    setStockEditColors,
    name,
    category,
    colors,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    categoryModalMode,
    categoryName,
    setCategoryName,
    categoryImage,
    setCategoryImage,
    categoryUploading,
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

  const section = SECTIONS[activeTab] || SECTIONS.products;
  const isDetail = isOrderDetail || isProductForm;
  // Detail pages are titled after what they show (order number, new / edit product)
  const pageTitle = isOrderDetail
    ? `Order #${pathname.split('/')[2].slice(-8).toUpperCase()}`
    : isProductForm
    ? (pathname.endsWith('/new') ? 'New product' : 'Edit product')
    : section.title;
  const showSearch = !isDetail && SEARCHABLE.includes(activeTab);
  const navBadge = { orders: pendingOrdersCount, inventory: lowStockAlertCount };
  const stats = [
    { label: 'Products', value: totalProducts },
    { label: 'Low stock', value: lowStockAlertCount, alert: lowStockAlertCount > 0, tone: 'text-error' },
    { label: 'To fulfil', value: pendingOrdersCount, alert: pendingOrdersCount > 0, tone: 'text-amber-700' },
    { label: 'Orders', value: totalOrdersCount },
    { label: 'Revenue', value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRevenue) },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
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
        <aside className="w-60 shrink-0 border-r border-outline-variant/50 hidden md:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="py-8 px-4 space-y-7" aria-label="Admin sections">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-2 font-label-caps text-[10px] tracking-[0.3em] uppercase text-on-surface-variant/70">{group.label}</p>
                <ul className="space-y-0.5">
                  {group.items.map((key) => {
                    const item = SECTIONS[key];
                    const active = activeTab === key;
                    return (
                      <li key={key}>
                        <Link
                          href={`/${key}`}
                          aria-current={active ? 'page' : undefined}
                          className={`relative flex items-center gap-3 px-3 py-2 text-[13px] transition-colors ${
                            active
                              ? 'bg-primary/[0.07] text-primary font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-primary'
                              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                          <span className="flex-1">{item.title}</span>
                          {navBadge[key] > 0 && (
                            <span className={`min-w-5 h-5 px-1.5 inline-flex items-center justify-center text-[10px] font-medium tabular-nums ${
                              key === 'inventory' ? 'bg-error-container text-error' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {navBadge[key]}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 px-5 md:px-10 pt-8 md:pt-10 pb-24">

        {/* Mobile section switcher (sidebar is hidden on small screens) */}
        <nav className="md:hidden flex overflow-x-auto gap-2 -mx-5 px-5 pb-4 mb-6 border-b border-outline-variant/50 scrollbar-hide" aria-label="Admin sections">
          {NAV_GROUPS.flatMap((g) => g.items).map((key) => (
            <Link
              key={key}
              href={`/${key}`}
              className={`whitespace-nowrap px-3.5 py-2 text-xs border transition-colors ${
                activeTab === key ? 'border-primary text-primary bg-primary/[0.06]' : 'border-outline-variant/60 text-on-surface-variant'
              }`}
            >
              {SECTIONS[key].title}
            </Link>
          ))}
        </nav>

        {/* Breadcrumb / Title */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 mb-8 pb-6 border-b border-outline-variant/50">
          <div className="min-w-0">
            <nav className="font-label-caps text-[10px] tracking-[0.25em] uppercase text-on-surface-variant mb-3 flex items-center gap-2" aria-label="Breadcrumb">
              <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Storefront</a>
              <span className="text-outline-variant">/</span>
              {isDetail ? (
                <Link href={`/${activeTab}`} className="hover:text-primary transition-colors">{section.title}</Link>
              ) : (
                <span className="text-on-surface">{section.title}</span>
              )}
              {isDetail && (
                <>
                  <span className="text-outline-variant">/</span>
                  <span className="text-on-surface">{isOrderDetail ? 'Order' : pathname.endsWith('/new') ? 'New' : 'Edit'}</span>
                </>
              )}
            </nav>
            <h1 className="font-display-lg text-[2.25rem] md:text-[2.75rem] leading-[1.05] text-on-surface">{pageTitle}</h1>
            {!isDetail && <p className="text-sm text-on-surface-variant mt-2">{section.desc}</p>}
          </div>

          <div className="flex items-center gap-3 shrink-0">
          {!isDetail && (activeTab === 'products' || activeTab === 'inventory' || activeTab === 'orders' || activeTab === 'customers') && (
            <button
              onClick={handleExportCsv}
              className="h-11 px-5 border border-outline-variant text-on-surface-variant hover:border-on-surface hover:text-on-surface font-label-caps text-[11px] tracking-[0.2em] uppercase transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export CSV
            </button>
          )}
          {isProductForm ? null : (activeTab === 'products' || activeTab === 'inventory') ? (
            <Link
              href="/products/new"
              className="h-11 px-5 bg-primary text-white font-label-caps text-[11px] tracking-[0.2em] uppercase hover:bg-primary-container transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add product
            </Link>
          ) : activeTab === 'categories' ? (
            <button
              onClick={openCategoryAddModal}
              className="h-11 px-5 bg-primary text-white font-label-caps text-[11px] tracking-[0.2em] uppercase hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add category
            </button>
          ) : activeTab === 'banners' ? (
            <button
              onClick={openBannerAddModal}
              className="h-11 px-5 bg-primary text-white font-label-caps text-[11px] tracking-[0.2em] uppercase hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add banner
            </button>
          ) : activeTab === 'coupons' ? (
            <button
              onClick={openCouponAddModal}
              className="h-11 px-5 bg-primary text-white font-label-caps text-[11px] tracking-[0.2em] uppercase hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add coupon
            </button>
          ) : null}
          </div>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div role="status" className="mb-6 px-4 py-3 bg-green-50/70 text-green-800 text-sm border-l-2 border-green-700 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {successMsg}
            </div>
            <button onClick={() => setSuccessMsg('')} aria-label="Dismiss" className="material-symbols-outlined text-base cursor-pointer opacity-60 hover:opacity-100">close</button>
          </div>
        )}
        {/* The product form shows its own error next to the fields */}
        {errorMsg && !isProductForm && (
          <div role="alert" className="mb-6 px-4 py-3 bg-error-container/60 text-error text-sm border-l-2 border-error flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMsg}
            </div>
            <button onClick={() => setErrorMsg('')} aria-label="Dismiss" className="material-symbols-outlined text-base cursor-pointer opacity-60 hover:opacity-100">close</button>
          </div>
        )}

        {/* Store summary — list pages only, so a single order or product gets the full width */}
        {!isDetail && (
          // Hairline dividers come from the 1px gaps over an outline-coloured background
          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-outline-variant/50 border border-outline-variant/50 mb-8">
            {/* The last tile fills the row's leftover space on 2- and 3-column layouts */}
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`bg-surface-container-lowest px-5 py-4 ${i === stats.length - 1 ? 'col-span-2 sm:col-span-1 sm:max-lg:col-span-2 lg:col-span-1' : ''}`}
              >
                <dt className="font-label-caps text-[10px] tracking-[0.25em] uppercase text-on-surface-variant flex items-center gap-1.5">
                  {s.alert && <span className={`w-1.5 h-1.5 rounded-full bg-current ${s.tone}`} aria-hidden="true" />}
                  {s.label}
                </dt>
                <dd className={`font-display-lg text-[1.75rem] leading-tight mt-1 tabular-nums ${s.alert ? s.tone : 'text-on-surface'}`}>{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Search & filters — only where they filter the list */}
        {showSearch && (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-5">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder={
                  activeTab === 'orders'
                    ? 'Search by order ID, name or phone'
                    : activeTab === 'customers'
                    ? 'Search by name or email'
                    : activeTab === 'reviews'
                    ? 'Search reviews'
                    : `Search ${section.title.toLowerCase()}`
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-surface-container-lowest border border-outline-variant text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            {activeTab === 'reviews' && (
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="h-10 px-3 bg-surface-container-lowest border border-outline-variant text-sm focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            )}
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
