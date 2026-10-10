/**
 * DREAM CART BD — MODERN CART PAGE (CartPage.js)
 * Implements user requirements:
 * - Interactive Product Size & Color variant selectors right in the cart
 * - Smooth tactile quantity controls (+ / -) & direct quantity input
 * - Strict stock limit enforcement (cannot order more than available stock)
 * - Harmonious high-contrast background and text colors for Light & Dark modes
 * - Responsive layout: Desktop table & Mobile card layout
 * - Delivery area selector with real-time fee calculation
 * - Free shipping progress bar (৳2,000 threshold)
 * - Modern Order Summary with prominent Checkout CTA button
 */

import { cartStore } from '../../store/cartStore.js';
import { formatCurrency } from '../../utils/format.js';

// Safe toast helper that works in all environments
function showNotification(opts) {
  if (typeof window !== 'undefined' && window.toast && window.toast.show) {
    window.toast.show(opts);
  } else if (typeof document !== 'undefined') {
    import('../../components/Toast.js').then(({ toast }) => {
      if (toast && toast.show) toast.show(opts);
    }).catch(() => {});
  }
}

// Attach global helpers for interactive variant changes & quantity management
if (typeof window !== 'undefined') {
  /**
   * Change quantity with strict stock limit enforcement
   */
  window.changeCartQty = function(productId, color, size, delta) {
    const item = cartStore.items.find(i => 
      String(i.product_id) === String(productId) && 
      (i.color || '') === (color || '') && 
      (i.size || '') === (size || '')
    );
    if (!item) return;

    const maxStock = Number(item.stock !== undefined ? item.stock : 25);
    const currentQty = Number(item.quantity) || 1;
    const newQty = currentQty + delta;

    if (delta > 0 && currentQty >= maxStock) {
      showNotification({
        type: "warning",
        title: "স্টক সীমাবদ্ধতা",
        message: `এই পণ্যের সর্বোচ্চ ${maxStock} পিস স্টকে মজুদ রয়েছে। এর বেশি অর্ডার করা সম্ভব নয়।`,
        duration: 3500
      });
      return;
    }

    if (newQty <= 0) {
      cartStore.removeItem(productId, { color, size });
    } else {
      cartStore.updateQuantity(productId, Math.min(maxStock, newQty), { color, size });
    }

    if (window.router) window.router.resolve();
  };

  /**
   * Set quantity directly via number input
   */
  window.setCartQtyDirect = function(productId, color, size, inputEl) {
    const item = cartStore.items.find(i => 
      String(i.product_id) === String(productId) && 
      (i.color || '') === (color || '') && 
      (i.size || '') === (size || '')
    );
    if (!item) return;

    const maxStock = Number(item.stock !== undefined ? item.stock : 25);
    let val = parseInt(inputEl.value, 10);
    if (isNaN(val) || val < 1) val = 1;

    if (val > maxStock) {
      val = maxStock;
      inputEl.value = maxStock;
      showNotification({
        type: "warning",
        title: "স্টক সীমাবদ্ধতা",
        message: `স্টকে সর্বোচ্চ ${maxStock} পিস রয়েছে। পরিমাণ সংশোধন করা হয়েছে।`,
        duration: 3500
      });
    }

    cartStore.updateQuantity(productId, val, { color, size });
    if (window.router) window.router.resolve();
  };

  /**
   * Update Product Size or Color variant directly in Cart
   */
  window.updateCartItemVariant = function(productId, oldColor, oldSize, newColor, newSize) {
    const idx = cartStore.items.findIndex(i => 
      String(i.product_id) === String(productId) && 
      (i.color || '') === (oldColor || '') && 
      (i.size || '') === (oldSize || '')
    );
    if (idx === -1) return;

    const item = cartStore.items[idx];
    const finalColor = newColor !== undefined ? newColor : (item.color || '');
    const finalSize = newSize !== undefined ? newSize : (item.size || '');

    // Check if another cart item already has this exact variant
    const duplicateIdx = cartStore.items.findIndex((i, iIdx) => 
      iIdx !== idx && 
      String(i.product_id) === String(productId) && 
      (i.color || '') === finalColor && 
      (i.size || '') === finalSize
    );

    const maxStock = Number(item.stock !== undefined ? item.stock : 25);

    if (duplicateIdx > -1) {
      const existing = cartStore.items[duplicateIdx];
      existing.quantity = Math.min(maxStock, Number(existing.quantity) + Number(item.quantity));
      cartStore.items.splice(idx, 1);
    } else {
      item.color = finalColor;
      item.size = finalSize;
    }

    cartStore.saveToStorage();

    showNotification({
      type: "success",
      title: "ভেরিয়েন্ট আপডেট",
      message: "পণ্যের সাইজ/কালার সফলভাবে পরিবর্তন করা হয়েছে।",
      duration: 2500
    });

    if (window.router) window.router.resolve();
  };
}

export function renderCartPage() {
  const items = cartStore.items;
  const count = cartStore.getCount();
  const subtotal = cartStore.getSubtotal();
  const deliveryFee = cartStore.getDeliveryCharge();
  const isFreeDelivery = cartStore.isFreeDelivery();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const couponDiscount = cartStore.getCouponDiscount();
  const grandTotal = cartStore.getGrandTotal();
  const currentZone = cartStore.deliveryZone;

  // Helper to parse comma/slash separated options
  const parseOptions = (val, defaults) => {
    if (!val) return defaults;
    if (Array.isArray(val)) return val.filter(Boolean);
    const s = String(val).trim();
    if (!s) return defaults;
    const parts = s.split(/[,|\/]+/).map(p => p.trim()).filter(Boolean);
    return parts.length > 0 ? parts : defaults;
  };

  // Helper to get cached product data if available
  const getProductInfo = (productId) => {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('dcbd_sheet_products');
        if (cached) {
          const list = JSON.parse(cached);
          const found = list.find(p => String(p.product_id || p.sku) === String(productId));
          if (found) return found;
        }
      }
    } catch (e) {}
    return null;
  };

  if (items.length === 0) {
    return `
      <style id="cart-page-empty-styles">
        .cp-empty-wrap {
          padding: 80px 20px;
          text-align: center;
          max-width: 520px;
          margin: 0 auto;
        }
        .cp-empty-icon {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #059669;
          font-size: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
        }
        .dark .cp-empty-icon {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
        }
        .cp-empty-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .dark .cp-empty-title {
          color: #f8fafc;
        }
        .cp-empty-desc {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .dark .cp-empty-desc {
          color: #94a3b8;
        }
        .cp-btn-start-shop {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
          color: #ffffff !important;
          padding: 12px 28px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(5, 150, 105, 0.35);
          transition: all 0.2s ease;
        }
        .cp-btn-start-shop:hover {
          background: linear-gradient(135deg, #047857 0%, #0f766e 100%);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.45);
        }
      </style>

      <div class="cp-empty-wrap">
        <div class="cp-empty-icon">
          🛒
        </div>
        <h2 class="cp-empty-title">আপনার শপিং কার্ট খালি</h2>
        <p class="cp-empty-desc">
          আপনার কার্টে বর্তমানে কোনো পণ্য যুক্ত করা হয়নি। আমাদের সেরা কালেকশন দেখুন এবং পছন্দের পণ্য কার্টে যোগ করুন।
        </p>
        <a href="/products" class="cp-btn-start-shop">
          <span>শপিং শুরু করুন</span>
          <span>→</span>
        </a>
      </div>
    `;
  }

  return `
    <!-- Scoped Styles for Robust, High-Contrast Cart Page Across Themes -->
    <style id="cart-page-custom-styles">
      /* Header & Breadcrumb */
      .cp-breadcrumb {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 6px;
      }
      .cp-breadcrumb a {
        color: #64748b;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .cp-breadcrumb a:hover {
        color: #059669;
      }
      .dark .cp-breadcrumb a {
        color: #94a3b8;
      }
      .dark .cp-breadcrumb a:hover {
        color: #34d399;
      }
      .cp-breadcrumb-current {
        color: #0f172a;
        font-weight: 700;
      }
      .dark .cp-breadcrumb-current {
        color: #f8fafc;
      }

      .cp-header-title {
        font-size: 26px;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -0.02em;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .dark .cp-header-title {
        color: #ffffff;
      }
      .cp-count-badge {
        font-size: 12px;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 9999px;
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #a7f3d0;
      }
      .dark .cp-count-badge {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.35);
      }

      /* Main Grid Layout */
      .cp-main-grid {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 28px;
        align-items: start;
        margin-top: 24px;
        margin-bottom: 60px;
      }
      @media (max-width: 1080px) {
        .cp-main-grid {
          grid-template-columns: 1fr;
          gap: 24px;
        }
      }

      /* Cart Card Container (Left Column) */
      .cp-card-box {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        overflow: hidden;
      }
      .dark .cp-card-box {
        background: #1e293b;
        border: 1px solid #334155;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
      }

      /* Table Header (Desktop Only) */
      .cp-table-header {
        display: grid;
        grid-template-columns: minmax(280px, 1fr) 110px 170px 110px 50px;
        gap: 16px;
        align-items: center;
        padding: 14px 24px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        font-size: 12px;
        font-weight: 700;
        color: #475569;
      }
      .dark .cp-table-header {
        background: #0f172a;
        border-bottom: 1px solid #334155;
        color: #94a3b8;
      }
      @media (max-width: 880px) {
        .cp-table-header {
          display: none;
        }
      }

      /* Table Item Row */
      .cp-item-row {
        display: grid;
        grid-template-columns: minmax(280px, 1fr) 110px 170px 110px 50px;
        gap: 16px;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #f1f5f9;
        transition: background 0.15s ease;
      }
      .cp-item-row:last-child {
        border-bottom: none;
      }
      .cp-item-row:hover {
        background: #fbfcfe;
      }
      .dark .cp-item-row {
        border-bottom: 1px solid #334155;
      }
      .dark .cp-item-row:hover {
        background: #243248;
      }

      /* Responsive Item Row on Mobile (<880px) */
      @media (max-width: 880px) {
        .cp-item-row {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 14px;
          padding: 16px;
        }
      }

      /* Product Details Cell */
      .cp-prod-details {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        min-width: 0;
      }
      .cp-prod-thumb {
        width: 76px;
        height: 76px;
        border-radius: 16px;
        object-fit: cover;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        flex-shrink: 0;
      }
      .dark .cp-prod-thumb {
        border: 1px solid #475569;
        background: #0f172a;
      }
      .cp-prod-info {
        min-width: 0;
        flex: 1;
      }
      .cp-prod-name {
        font-size: 14px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.4;
        margin: 0 0 6px 0;
        word-break: break-word;
      }
      .cp-prod-name a {
        color: inherit;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .cp-prod-name a:hover {
        color: #059669;
      }
      .dark .cp-prod-name {
        color: #f8fafc;
      }
      .dark .cp-prod-name a:hover {
        color: #34d399;
      }

      /* Variant Selectors Row (Interactive Color & Size) */
      .cp-variants-ctrl-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 6px;
      }
      .cp-variant-group {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 2px 6px;
      }
      .dark .cp-variant-group {
        background: #0f172a;
        border: 1px solid #475569;
      }
      .cp-variant-label {
        font-size: 10px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
      }
      .dark .cp-variant-label {
        color: #94a3b8;
      }
      .cp-variant-select {
        border: none;
        background: transparent;
        color: #0f172a;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        outline: none;
        padding: 2px 2px;
      }
      .dark .cp-variant-select {
        color: #f8fafc;
      }
      .dark .cp-variant-select option {
        background: #1e293b;
        color: #ffffff;
      }

      /* Mobile Price Row */
      .cp-mobile-price-row {
        display: none;
        font-size: 12px;
        color: #64748b;
        margin-top: 6px;
      }
      .dark .cp-mobile-price-row {
        color: #94a3b8;
      }
      @media (max-width: 880px) {
        .cp-mobile-price-row {
          display: block;
        }
      }

      /* Unit Price Cell (Desktop) */
      .cp-unit-price {
        font-size: 13.5px;
        font-weight: 700;
        color: #334155;
        font-family: monospace, system-ui;
      }
      .dark .cp-unit-price {
        color: #cbd5e1;
      }
      @media (max-width: 880px) {
        .cp-unit-price {
          display: none;
        }
      }

      /* Quantity & Stock Column */
      .cp-qty-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .cp-stock-status {
        font-size: 10.5px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .cp-stock-status.normal-stock {
        color: #059669;
      }
      .dark .cp-stock-status.normal-stock {
        color: #34d399;
      }
      .cp-stock-status.low-stock {
        color: #d97706;
      }
      .dark .cp-stock-status.low-stock {
        color: #fbbf24;
      }
      .cp-stock-max-badge {
        font-size: 9.5px;
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #fca5a5;
        padding: 1px 5px;
        border-radius: 6px;
        font-weight: 800;
      }
      .dark .cp-stock-max-badge {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border-color: rgba(239, 68, 68, 0.4);
      }

      .cp-qty-box {
        display: inline-flex;
        align-items: center;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      }
      .dark .cp-qty-box {
        background: #0f172a;
        border: 1px solid #475569;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      .cp-qty-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        color: #1e293b;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.15s ease;
        user-select: none;
      }
      .cp-qty-btn:hover:not(:disabled) {
        background: #e2e8f0;
      }
      .cp-qty-btn:active:not(:disabled) {
        background: #cbd5e1;
      }
      .cp-qty-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed !important;
      }
      .dark .cp-qty-btn {
        color: #f8fafc;
      }
      .dark .cp-qty-btn:hover:not(:disabled) {
        background: #1e293b;
      }
      .dark .cp-qty-btn:active:not(:disabled) {
        background: #334155;
      }
      .cp-qty-input {
        width: 38px;
        height: 32px;
        text-align: center;
        font-size: 13px;
        font-weight: 800;
        color: #0f172a;
        border: none;
        background: transparent;
        outline: none;
        -moz-appearance: textfield;
      }
      .cp-qty-input::-webkit-outer-spin-button,
      .cp-qty-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .dark .cp-qty-input {
        color: #ffffff;
      }

      /* Total Price Cell */
      .cp-total-price {
        font-size: 15px;
        font-weight: 900;
        color: #059669;
        font-family: monospace, system-ui;
      }
      .dark .cp-total-price {
        color: #34d399;
      }

      /* Action / Remove Cell */
      .cp-action-cell {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cp-remove-btn {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
      }
      .cp-remove-btn:hover {
        color: #ef4444;
        background: #fee2e2;
        transform: scale(1.1);
      }
      .dark .cp-remove-btn {
        color: #64748b;
      }
      .dark .cp-remove-btn:hover {
        color: #f87171;
        background: rgba(239, 68, 68, 0.2);
        transform: scale(1.1);
      }

      /* Mobile Controls Bar (Stepper, Total & Remove grouped) */
      .cp-mobile-controls-row {
        display: none;
        align-items: center;
        justify-content: space-between;
        padding-top: 10px;
        border-top: 1px dashed #e2e8f0;
      }
      .dark .cp-mobile-controls-row {
        border-top: 1px dashed #334155;
      }
      @media (max-width: 880px) {
        .cp-mobile-controls-row {
          display: flex;
        }
      }

      /* Table Bottom Navigation */
      .cp-card-footer {
        padding: 16px 24px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
      }
      .dark .cp-card-footer {
        background: #0f172a;
        border-top: 1px solid #334155;
      }
      .cp-btn-continue {
        color: #059669;
        font-weight: 700;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: color 0.15s ease;
      }
      .cp-btn-continue:hover {
        color: #047857;
        text-decoration: underline;
      }
      .dark .cp-btn-continue {
        color: #34d399;
      }
      .dark .cp-btn-continue:hover {
        color: #6ee7b7;
      }
      .cp-btn-clear {
        color: #ef4444;
        background: transparent;
        border: none;
        cursor: pointer;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 6px;
        transition: all 0.15s ease;
      }
      .cp-btn-clear:hover {
        background: #fee2e2;
        color: #dc2626;
      }
      .dark .cp-btn-clear {
        color: #f87171;
      }
      .dark .cp-btn-clear:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
      }

      /* Right Column: Order Summary Card */
      .cp-summary-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        position: sticky;
        top: 90px;
      }
      .dark .cp-summary-card {
        background: #1e293b;
        border: 1px solid #334155;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
      }
      .cp-summary-title {
        font-size: 17px;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 16px 0;
        padding-bottom: 12px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .dark .cp-summary-title {
        color: #ffffff;
        border-bottom: 1px solid #334155;
      }

      /* Delivery Zone Select Box */
      .cp-zone-wrap {
        margin-bottom: 16px;
      }
      .cp-zone-label {
        display: block;
        font-size: 12px;
        font-weight: 700;
        color: #334155;
        margin-bottom: 6px;
      }
      .dark .cp-zone-label {
        color: #cbd5e1;
      }
      .cp-zone-select {
        width: 100%;
        height: 42px;
        padding: 0 14px;
        font-size: 12.5px;
        font-weight: 600;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        color: #0f172a;
        outline: none;
        transition: border 0.15s ease;
        cursor: pointer;
        box-sizing: border-box;
      }
      .cp-zone-select:focus {
        border-color: #059669;
        box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
      }
      .dark .cp-zone-select {
        background: #0f172a;
        border: 1px solid #475569;
        color: #f8fafc;
      }
      .dark .cp-zone-select:focus {
        border-color: #10b981;
      }

      /* Free Shipping Card */
      .cp-shipping-box {
        padding: 12px 16px;
        border-radius: 14px;
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border: 1px solid #bbf7d0;
        margin-bottom: 18px;
      }
      .dark .cp-shipping-box {
        background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
        border: 1px solid rgba(16, 185, 129, 0.35);
      }
      .cp-shipping-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 700;
        color: #065f46;
        margin-bottom: 7px;
      }
      .dark .cp-shipping-row {
        color: #ecfdf5;
      }
      .cp-shipping-notice-val {
        color: #047857;
        font-weight: 800;
      }
      .dark .cp-shipping-notice-val {
        color: #6ee7b7;
      }
      .cp-shipping-track {
        width: 100%;
        height: 7px;
        border-radius: 999px;
        background: rgba(5, 150, 105, 0.18);
        overflow: hidden;
      }
      .dark .cp-shipping-track {
        background: rgba(255, 255, 255, 0.15);
      }
      .cp-shipping-bar {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        transition: width 0.4s ease;
      }
      .dark .cp-shipping-bar {
        background: linear-gradient(90deg, #34d399 0%, #10b981 100%);
        box-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
      }

      /* Price Breakdown */
      .cp-breakdown-list {
        margin-bottom: 18px;
      }
      .cp-breakdown-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #475569;
        margin-bottom: 8px;
      }
      .dark .cp-breakdown-row {
        color: #94a3b8;
      }
      .cp-breakdown-val {
        font-weight: 700;
        color: #0f172a;
      }
      .dark .cp-breakdown-val {
        color: #f8fafc;
      }
      .cp-discount-row {
        color: #059669;
        font-weight: 700;
      }
      .dark .cp-discount-row {
        color: #34d399;
      }
      .cp-coupon-row {
        color: #4f46e5;
        font-weight: 700;
      }
      .dark .cp-coupon-row {
        color: #818cf8;
      }

      .cp-total-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding-top: 12px;
        margin-top: 10px;
        border-top: 1px dashed #e2e8f0;
      }
      .dark .cp-total-row {
        border-top: 1px dashed #334155;
      }
      .cp-total-label {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
      }
      .dark .cp-total-label {
        color: #ffffff;
      }
      .cp-total-val {
        font-size: 22px;
        font-weight: 900;
        color: #059669;
        font-family: monospace, system-ui;
      }
      .dark .cp-total-val {
        color: #34d399;
      }

      /* Checkout CTA Button */
      .cp-btn-checkout {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 14px 20px;
        background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #047857 100%);
        color: #ffffff !important;
        border-radius: 14px;
        font-size: 14.5px;
        font-weight: 800;
        text-decoration: none;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 22px -4px rgba(5, 150, 105, 0.45);
        transition: all 0.2s ease;
        box-sizing: border-box;
      }
      .cp-btn-checkout:hover {
        background: linear-gradient(135deg, #047857 0%, #0f766e 50%, #065f46 100%);
        box-shadow: 0 10px 26px -4px rgba(5, 150, 105, 0.6);
        transform: translateY(-1px);
        color: #ffffff !important;
      }
      .cp-btn-checkout:active {
        transform: scale(0.99);
      }

      /* Trust Features */
      .cp-trust-list {
        margin-top: 16px;
        padding-top: 14px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .dark .cp-trust-list {
        border-top: 1px solid #334155;
      }
      .cp-trust-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11.5px;
        color: #64748b;
      }
      .dark .cp-trust-item {
        color: #94a3b8;
      }
    </style>

    <div class="space-y-4 pb-20">
      
      <!-- Page Header & Breadcrumb -->
      <div class="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div class="cp-breadcrumb">
          <a href="/">হোম</a>
          <span>/</span>
          <span class="cp-breadcrumb-current">শপিং কার্ট</span>
        </div>
        <h1 class="cp-header-title">
          <span>শপিং কার্ট</span>
          <span class="cp-count-badge">${count} টি আইটেম</span>
        </h1>
      </div>

      <!-- Main Layout Grid: Items Table (Left) + Order Summary (Right) -->
      <div class="cp-main-grid">
        
        <!-- Left Column: Cart Items Container -->
        <div>
          <div class="cp-card-box">
            
            <!-- Table Column Headers (Desktop) -->
            <div class="cp-table-header">
              <div>পণ্য ও ভেরিয়েন্ট বিবরণ</div>
              <div>একক মূল্য</div>
              <div class="text-center">পরিমাণ ও স্টক</div>
              <div class="text-right">মোট মূল্য</div>
              <div class="text-center">মুছুন</div>
            </div>

            <!-- Items List -->
            <div>
              ${items.map(it => {
                const prod = getProductInfo(it.product_id);
                const stock = Number(it.stock !== undefined ? it.stock : (prod?.stock !== undefined ? prod.stock : 25));
                const isMaxReached = Number(it.quantity) >= stock;
                
                // Color & Size Options
                const availableColors = [...new Set(parseOptions(prod?.color || prod?.colors || it.color, it.color ? [it.color, 'Black', 'Silver', 'Navy Blue', 'Gold'] : ['Black', 'Silver', 'Navy Blue', 'Gold']))];
                const availableSizes = [...new Set(parseOptions(prod?.size || prod?.sizes || it.size, it.size ? [it.size, 'Standard (ফ্রি সাইজ)', 'Medium (M)', 'Large (L)', 'XL'] : ['Standard (ফ্রি সাইজ)', 'Medium (M)', 'Large (L)', 'XL']))];

                return `
                  <div class="cp-item-row">
                    
                    <!-- 1. Product Image, Title & Interactive Variants -->
                    <div class="cp-prod-details">
                      <img 
                        src="${it.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}" 
                        alt="${it.name}" 
                        class="cp-prod-thumb"
                        loading="lazy"
                      />
                      <div class="cp-prod-info">
                        <h4 class="cp-prod-name" title="${it.name}">
                          <a href="/product/${it.slug || it.product_id}">
                            ${it.name}
                          </a>
                        </h4>
                        
                        <!-- Interactive Variant Selectors (Color & Size) -->
                        <div class="cp-variants-ctrl-row">
                          
                          <!-- Color Selector -->
                          <div class="cp-variant-group" title="কালার পরিবর্তন করুন">
                            <span class="cp-variant-label">কালার:</span>
                            <select 
                              class="cp-variant-select"
                              onchange="window.updateCartItemVariant('${it.product_id}', '${it.color || ''}', '${it.size \vert{}\vert{} ''}', this.value, '${it.size || ''}')"
                            >
                              ${availableColors.map(c => `
                                <option value="${c}" ${c === it.color ? 'selected' : ''}>🎨 ${c}</option>
                              `).join("")}
                            </select>
                          </div>

                          <!-- Size Selector -->
                          <div class="cp-variant-group" title="সাইজ পরিবর্তন করুন">
                            <span class="cp-variant-label">সাইজ:</span>
                            <select 
                              class="cp-variant-select"
                              onchange="window.updateCartItemVariant('${it.product_id}', '${it.color || ''}', '${it.size \vert{}\vert{} ''}', '${it.color || ''}', this.value)"
                            >
                              ${availableSizes.map(s => `
                                <option value="${s}" ${s === it.size ? 'selected' : ''}>📏 ${s}</option>
                              `).join("")}
                            </select>
                          </div>

                        </div>

                        <!-- Mobile Unit Price Info -->
                        <div class="cp-mobile-price-row">
                          একক মূল্য: <strong class="font-bold text-slate-800 dark:text-slate-200">${formatCurrency(it.price)}</strong>
                        </div>
                      </div>
                    </div>

                    <!-- 2. Unit Price (Desktop) -->
                    <div class="cp-unit-price">
                      ${formatCurrency(it.price)}
                    </div>

                    <!-- 3. Quantity Stepper & Stock Limit (Desktop) -->
                    <div class="cp-qty-col hidden sm:flex">
                      
                      <!-- Stock status badge -->
                      <div class="cp-stock-status ${stock <= 5 ? 'low-stock' : 'normal-stock'}">
                        <span>📦 স্টক: ${stock}</span>${isMaxReached ? `<span class="cp-stock-max-badge">সর্বোচ্চ সীমা</span>` : ''}
                      </div>

                      <div class="cp-qty-box">
                        <button 
                          type="button"
                          class="cp-qty-btn"
                          onclick="window.changeCartQty('${it.product_id}', '${it.color \vert{}\vert{} ''}', '${it.size || ''}', -1)"
                          title="পরিমাণ কমান"
                          aria-label="Decrease quantity"
                        >−</button>

                        <input 
                          type="number"
                          class="cp-qty-input"
                          value="${it.quantity}"
                          min="1"
                          max="${stock}"
                          onchange="window.setCartQtyDirect('${it.product_id}', '${it.color \vert{}\vert{} ''}', '${it.size || ''}', this)"
                          title="সরাসরি পরিমাণ লিখুন (সর্বোচ্চ ${stock})"
                        />

                        <button 
                          type="button"
                          class="cp-qty-btn ${isMaxReached ? 'disabled' : ''}"
                          ${isMaxReached ? 'disabled' : ''}
                          onclick="window.changeCartQty('${it.product_id}', '${it.color \vert{}\vert{} ''}', '${it.size || ''}', 1)"
                          title="${isMaxReached ? `স্টকে আর বেশি পণ্য নেই (সর্বোচ্চ ${stock} পিস)` : 'পরিমাণ বাড়ান'}"
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                    </div>

                    <!-- 4. Line Total (Desktop) -->
                    <div class="cp-total-price text-right hidden sm:block">
                      ${formatCurrency(Number(it.price) * Number(it.quantity))}
                    </div>

                    <!-- 5. Remove Button (Desktop) -->
                    <div class="cp-action-cell hidden sm:flex">
                      <button 
                        type="button"
                        class="btn-cart-remove cp-remove-btn"
                        data-product-id="${it.product_id}"
                        data-color="${it.color || ''}"
                        data-size="${it.size || ''}"
                        title="আইটেমটি মুছুন"
                        aria-label="Remove item"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>

                    <!-- Mobile Controls Bar (Stepper + Total + Remove grouped) -->
                    <div class="cp-mobile-controls-row">
                      
                      <div class="flex flex-col gap-1">
                        <div class="cp-stock-status ${stock <= 5 ? 'low-stock' : 'normal-stock'}">
                          <span>📦 স্টক: ${stock}</span>${isMaxReached ? `<span class="cp-stock-max-badge">সর্বোচ্চ</span>` : ''}
                        </div>
                        <div class="cp-qty-box">
                          <button 
                            type="button"
                            class="cp-qty-btn"
                            onclick="window.changeCartQty('${it.product_id}', '${it.color \vert{}\vert{} ''}', '${it.size || ''}', -1)"
                            title="পরিমাণ কমান"
                          >−</button>
                          <input 
                            type="number"
                            class="cp-qty-input"
                            value="${it.quantity}"
                            min="1"
                            max="${stock}"
                            onchange="window.setCartQtyDirect('${it.product_id}', '${it.color \vert{}\vert{} ''}', '${it.size || ''}', this)"
                          />
                          <button 
                            type="button"
                            class="cp-qty-btn ${isMaxReached ? 'disabled' : ''}"
                            ${isMaxReached ? 'disabled' : ''}
                            onclick="window.changeCartQty('${it.product_id}', '${it.color \vert{}\vert{} ''}', '${it.size || ''}', 1)"
                            title="${isMaxReached ? `সর্বোচ্চ ${stock} পিস` : 'পরিমাণ বাড়ান'}"
                          >+</button>
                        </div>
                      </div>

                      <div class="cp-total-price">
                        ${formatCurrency(Number(it.price) * Number(it.quantity))}
                      </div>

                      <button 
                        type="button"
                        class="btn-cart-remove cp-remove-btn"
                        data-product-id="${it.product_id}"
                        data-color="${it.color || ''}"
                        data-size="${it.size || ''}"
                        title="আইটেমটি মুছুন"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>

                  </div>
                `;
              }).join("")}
            </div>

            <!-- Table Footer Actions -->
            <div class="cp-card-footer">
              <a href="/products" class="cp-btn-continue">
                <span>←</span>
                <span>আরও পণ্য যোগ করুন</span>
              </a>
              <button id="btn-clear-cart" class="cp-btn-clear" title="কার্ট খালি করুন">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                <span>সম্পূর্ণ কার্ট খালি করুন</span>
              </button>
            </div>

          </div>
        </div>

        <!-- Right Column: Order Summary Card -->
        <div>
          <div class="cp-summary-card">
            
            <h3 class="cp-summary-title">
              <span>📋</span>
              <span>অর্ডার সারাংশ (Order Summary)</span>
            </h3>

            <!-- Delivery Zone Selector -->
            <div class="cp-zone-wrap">
              <label for="cart-zone-select" class="cp-zone-label">
                ডেলিভারি এলাকা নির্বাচন করুন:
              </label>
              <select 
                id="cart-zone-select"
                class="cp-zone-select"
              >
                <option value="cumilla" ${currentZone === 'cumilla' ? 'selected' : ''}>কুমিল্লা সদর (৳৭০)</option>
                <option value="dhaka" ${currentZone === 'dhaka' ? 'selected' : ''}>ঢাকার ভেতরে (৳৯০)</option>
                <option value="outside" ${currentZone === 'outside' ? 'selected' : ''}>ঢাকার বাইরে সমগ্র বাংলাদেশ (৳১২০)</option>
                <option value="pickup" ${currentZone === 'pickup' ? 'selected' : ''}>অফিস থেকে পিকআপ - পদুয়ার বাজার (৳০)</option>
              </select>
            </div>

            <!-- Free Shipping Progress Indicator -->
            <div class="cp-shipping-box">
              <div class="cp-shipping-row">
                <span>৳২,০০০ শপিংয়ে ফ্রি ডেলিভারি!</span>
                <span id="cart-free-shipping-notice" class="cp-shipping-notice-val">
                  ${subtotal >= 2000 ? '✓ অর্জিত!' : `আরও ৳${2000 - subtotal}`}
                </span>
              </div>
              <div class="cp-shipping-track">
                <div 
                  id="cart-progress-bar" 
                  class="cp-shipping-bar" 
                  style="width: ${Math.min(100, (subtotal / 2000) * 100)}%"
                ></div>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="cp-breakdown-list">
              <div class="cp-breakdown-row">
                <span>পণ্যের মোট মূল্য:</span>
                <span id="cart-subtotal" class="cp-breakdown-val">${formatCurrency(subtotal)}</span>
              </div>

              <div class="cp-breakdown-row">
                <span>ডেলিভারি চার্জ:</span>
                <span id="cart-delivery-charge" class="cp-breakdown-val" style="color: ${isFreeDelivery ? '#059669' : 'inherit'};">
                  ${isFreeDelivery ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold">ফ্রি (৳০)</span>' : formatCurrency(deliveryFee)}
                </span>
              </div>

              <div id="cart-online-discount-row" class="cp-breakdown-row cp-discount-row ${onlineDiscount > 0 ? '' : 'hidden'}">
                <span>অনলাইন পেমেন্ট ৫% ছাড়:</span>
                <span id="cart-online-discount-amount">-${formatCurrency(onlineDiscount)}</span>
              </div>

              ${couponDiscount > 0 ? `
                <div class="cp-breakdown-row cp-coupon-row">
                  <span>কুপন ছাড়:</span>
                  <span>-${formatCurrency(couponDiscount)}</span>
                </div>
              ` : ""}

              <div class="cp-total-row">
                <span class="cp-total-label">সর্বমোট প্রদেয়:</span>
                <span id="cart-grand-total" class="cp-total-val">${formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <!-- Checkout CTA Button -->
            <a 
              href="/checkout" 
              class="cp-btn-checkout"
            >
              <span>অর্ডার সম্পন্ন করুন (Checkout)</span>
              <span>→</span>
            </a>

            <!-- Trust Features -->
            <div class="cp-trust-list">
              <div class="cp-trust-item">
                <span>🔒</span>
                <span>নিরাপদ পেমেন্ট ও ১০০% আসল পণ্য</span>
              </div>
              <div class="cp-trust-item">
                <span>🚚</span>
                <span>ক্যাশ অন ডেলিভারি ও দ্রুততম হোম ডেলিভারি</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  `;
}
