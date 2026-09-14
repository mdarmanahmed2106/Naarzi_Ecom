# Store Settings — Roadmap / Future Additions

Scope: follow-on to the `Settings` model + admin screen already built (`backend/src/models/Settings.js`, admin "Settings" tab). Currently live: `freeShippingThreshold`, `shippingCost`. This file is a holding pen for additional fields discussed but **not yet implemented** — review and prioritize before building.

---

## 1. GST / tax — do NOT build a generic "tax rate" field

Indian GST for apparel isn't a single flat rate that a store-wide `taxRate` setting could correctly represent:

- **5%** on items priced ≤ ₹1000, **12%** above ₹1000 — varies per line item, not per order.
- Split into **CGST + SGST** for intra-state orders, or **IGST** for inter-state — depends on the shipping address's state vs. the registered business state.
- A single number in Settings would be wrong for most orders, not a simplification of anything real.

**Recommendation:** since product prices already appear MRP/GST-inclusive (no separate tax line exists anywhere in checkout today), don't build tax *computation*. Instead add two purely-informational fields for legal disclosure / invoice text:

- `gstin` (string) — the business's GST registration number, shown on invoices/order confirmations.
- `pricesIncludeGst` (boolean, default `true`) — drives an "Inclusive of all taxes" label near price displays.

If itemized tax computation is ever actually needed (e.g. feeding a GST filing/accounting system), that requires a **per-product tax rate/HSN code on the `Product` model**, not a store-wide setting — it touches order line-item calculation in `createOrder`, not just Settings. Treat that as a separate, materially bigger feature if/when it comes up.

## 2. Legal / business info (Consumer Protection E-Commerce Rules, 2020)

India's e-commerce rules require certain disclosures. None of this exists in the codebase today (no invoice generation, no policy pages):

- `gstin` (see above — dual purpose)
- `businessName` / `registeredAddress` — legal entity name + address, needed the moment real invoices are generated instead of the current no-invoice flow.
- `returnWindowDays` — return/exchange policy window. Currently the PDP's "Shipping/Returns" accordion shows static hardcoded copy (per `UI_SUGGESTIONS.md` §0.5) with no real policy backing it.

**Caveat:** the return window number alone is meaningless without an actual returns flow (customer-initiated return request, admin approval, refund tie-in with the existing `refundStatus` gap in `ADMIN_GAPS.md` §1.1). Storing the number is cheap; treat the returns *workflow* as a separate, bigger feature.

## 3. COD (Cash on Delivery)

Still a major payment mode for Indian e-commerce, and relevant here because checkout currently has **no payment-method selection at all** (`UI_SUGGESTIONS.md` §0.8 — jumps straight from address to a mocked Razorpay success).

- `codEnabled` (boolean)
- `codCharge` (number) — extra fee for COD orders, common practice
- `codMaxOrderValue` (number, optional) — many Indian stores cap COD eligibility above a certain order value to limit fraud/return risk

**Caveat:** this isn't a settings-only change. It needs an actual payment-method step in checkout, a `paymentMethod` field on the `Order` model, and COD-specific order handling (no Razorpay order created, different fulfillment/notification path). Bigger scope than #1/#2 — worth scoping as its own feature alongside finally building the missing payment-method UI.

## 4. Low-stock threshold

Not India-specific, but cheap and already flagged as a real gap:

- `lowStockThreshold` (number, default matching the current hardcoded `3`)

Admin's dashboard "Low Stock Alerts" count and the low-stock badge logic are currently hardcoded to `≤ 3` units (`ADMIN_GAPS.md` §4) with no way to configure it per store. This is a pure storage + one-line read change — same shape as the shipping fields already built, no new workflow required.

---

## Suggested build order, if/when picked up

1. **Cheap, storage-only (same shape as what already exists):** `gstin`, `pricesIncludeGst`, `lowStockThreshold` — could be added to the existing Settings tab in an afternoon.
2. **Cheap storage, but only meaningful once its workflow exists:** `returnWindowDays` (needs a returns flow), `businessName`/`registeredAddress` (needs real invoice generation).
3. **Bigger feature, not just a settings field:** COD (`codEnabled`, `codCharge`, `codMaxOrderValue`) — requires an actual payment-method step in checkout and `Order` model changes.
4. **Explicitly not recommended as a Settings field:** a generic GST/tax rate — belongs on `Product` (per-item, with HSN codes) if ever built, not on the store-wide Settings singleton.

---

*Written for later review — nothing in this file has been implemented. Cross-reference `ADMIN_GAPS.md` and `UI_SUGGESTIONS.md` for the related gaps these items would close.*
