'use client';

import React from 'react';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function SettingsPage() {
  const {
    settingsForm,
    setSettingsForm,
    savingSettings,
    handleSaveSettings,
  } = useAdmin();

  return (
      <div className="animate-fade-in max-w-2xl">
        <form onSubmit={handleSaveSettings} className="bg-white border border-outline-variant/30 rounded-3xl p-8 space-y-8">
          <div>
            <h3 className="text-xl font-display-md text-on-surface font-bold">Shipping</h3>
            <p className="text-on-surface-variant text-sm mt-1">Controls the free-shipping threshold shown in the storefront cart.</p>
            <div className="grid sm:grid-cols-2 gap-6 mt-5">
              <div>
                <label className="block text-[10px] font-label-caps text-on-surface-variant tracking-wider font-bold mb-2">
                  FREE SHIPPING THRESHOLD (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settingsForm.freeShippingThreshold}
                  onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: e.target.value })}
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-label-caps text-on-surface-variant tracking-wider font-bold mb-2">
                  STANDARD SHIPPING COST (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={settingsForm.shippingCost}
                  onChange={(e) => setSettingsForm({ ...settingsForm, shippingCost: e.target.value })}
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-outline-variant/20">
            <h3 className="text-xl font-display-md text-on-surface font-bold">Inventory</h3>
            <p className="text-on-surface-variant text-sm mt-1">A size is flagged as low stock (dashboard alert, amber in Inventory) at or below this many units.</p>
            <div className="grid sm:grid-cols-2 gap-6 mt-5">
              <div>
                <label htmlFor="lowStockThreshold" className="block text-[10px] font-label-caps text-on-surface-variant tracking-wider font-bold mb-2">
                  LOW STOCK THRESHOLD (UNITS)
                </label>
                <input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={settingsForm.lowStockThreshold}
                  onChange={(e) => setSettingsForm({ ...settingsForm, lowStockThreshold: e.target.value })}
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-outline-variant/20">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer font-bold disabled:opacity-50"
            >
              {savingSettings ? 'SAVING...' : 'SAVE SETTINGS'}
            </button>
          </div>
        </form>
      </div>
  );
}
