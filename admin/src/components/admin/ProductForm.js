'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/components/admin/AdminProvider';

// Product create / edit form, shown on /products/new and /products/<id>. Field state and the
// submit handler live in AdminProvider; the page decides which product to load into it.
export default function ProductForm() {
  const {
    categories,
    modalMode,
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
    errorMsg,
    handleColorChange,
    handleAddColor,
    handleRemoveColor,
    handleFileUpload,
    handleRemoveImage,
    handleDrag,
    handleDrop,
    handleAddPasteUrl,
    handleSubmitProduct,
  } = useAdmin();

  // The form is long and Save is at the bottom, so bring a new error into view
  const errorRef = useRef(null);
  useEffect(() => {
    if (errorMsg) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [errorMsg]);

  return (
    <div className="max-w-3xl bg-white border border-outline-variant/30 rounded-2xl p-6 md:p-8">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
          <h2 className="font-display-lg text-2xl text-primary font-bold">
            Product details
          </h2>
          <Link
            href="/products"
            className="text-[10px] font-label-caps tracking-widest font-bold text-on-surface-variant hover:text-primary flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            ALL PRODUCTS
          </Link>
        </div>

        {/* Form Error */}
        {errorMsg && (
          <div ref={errorRef} className="mb-6 p-4 bg-error-container text-error text-xs rounded-xl border border-error/20 flex items-center gap-2">
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
            <Link
              href="/products"
              className="flex-1 py-4 bg-transparent border border-outline-variant/50 text-on-surface-variant font-label-caps text-xs tracking-widest rounded-xl hover:bg-surface-container transition-colors font-bold text-center"
            >
              CANCEL
            </Link>
          </div>

        </form>
    </div>
  );
}
