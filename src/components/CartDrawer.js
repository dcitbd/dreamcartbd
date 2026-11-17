/**
 * DREAM CART BD — MODERN SLIDING CART DRAWER (CartDrawer.js)
 * High-converting, responsive shopping cart sidebar with:
 * - Harmonious high-contrast color scheme for both Light & Dark modes
 * - Premium UI with zero overflow/cut-off bugs
 * - Free shipping progress bar (৳2,000 threshold) with clear contrast
 * - Refined item cards with Color & Size badges
 * - Modern tactile quantity controller buttons (+ / -) & sleek trash button
 * - Prominent, high-converting gradient checkout CTA button with total pill
 * - Empty cart illustration and call-to-action
 */

import { cartStore } from '../store/cartStore.js';
import { formatCurrency } from '../utils/format.js';

export function renderCartDrawer() {
  const items = cartStore.items;
  const count = cartStore.getCount();
  const subtotal = cartStore.getSubtotal();
  const delivery = cartStore.getDeliveryCharge();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const couponDiscount = cartStore.getCouponDiscount();
  const grandTotal = cartStore.getGrandTotal();

  const freeDeliveryThreshold = 2000;
  const amountNeeded = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  // Preserve drawer open state across store updates (e.g. quantity changes)
  const isCurrentlyOpen = typeof document !== 'undefined' && 
    document.getElementById('cart-drawer-overlay') && 
    !document.getElementById('cart-drawer-overlay').classList.contains('hidden');

  return `
    <!-- Scoped Styles for Pixel-Perfect Cart Drawer Across Themes -->
    <style id="cart-drawer-custom-styles">
      #cart-drawer-overlay {
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        background-color: rgba(2, 6, 23, 0.72) !important;
      }
      
      #cart-drawer-panel {
        max-width: 440px !important;
        width: 100% !important;
        background-color: #ffffff !important;
        box-shadow: -12px 0 40px rgba(0, 0, 0, 0.28) !important;
        border-left: 1px solid #e2e8f0 !important;
        overflow-x: hidden !important;
        display: flex !important;
        flex-direction: column !important;
      }
      .dark #cart-drawer-panel {
        background-color: #0f172a !important;
        border-left: 1px solid #1e293b !important;
      }

      /* Header */
      .cd-header {
        background: #ffffff !important;
        border-bottom: 1px solid #e2e8f0 !important;
        padding: 16px 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
      }
      .dark .cd-header {
        background: #111827 !important;
        border-bottom: 1px solid #1f2937 !important;
      }
      .cd-title-wrap {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
      }
      .cd-icon-badge {
        width: 38px !important;
        height: 38px !important;
        border-radius: 12px !important;
        background: #ecfdf5 !important;
        color: #059669 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 18px !important;
        border: 1px solid #a7f3d0 !important;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.12) !important;
      }
      .dark .cd-icon-badge {
        background: rgba(16, 185, 129, 0.15) !important;
        color: #34d399 !important;
        border: 1px solid rgba(16, 185, 129, 0.3) !important;
      }
      .cd-title {
        color: #0f172a !important;
        font-size: 16px !important;
        font-weight: 800 !important;
        margin: 0 !important;
        line-height: 1.25 !important;
      }
      .dark .cd-title {
        color: #f8fafc !important;
      }
      .cd-count-pill {
        display: inline-block !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        color: #64748b !important;
        margin-top: 2px !important;
      }
      .dark .cd-count-pill {
        color: #94a3b8 !important;
      }
      .cd-count-num {
        color: #059669 !important;
        font-weight: 800 !important;
      }
      .dark .cd-count-num {
        color: #34d399 !important;
      }

      .cd-close-btn {
        width: 34px !important;
        height: 34px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: #f1f5f9 !important;
        color: #475569 !important;
        border: 1px solid #e2e8f0 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      .cd-close-btn:hover {
        background: #e2e8f0 !important;
        color: #0f172a !important;
        transform: rotate(90deg) scale(1.05) !important;
      }
      .dark .cd-close-btn {
        background: #1e293b !important;
        color: #94a3b8 !important;
        border: 1px solid #334155 !important;
      }
      .dark .cd-close-btn:hover {
        background: #334155 !important;
        color: #ffffff !important;
      }

      /* Free Shipping Banner */
      .cd-shipping-banner {
        padding: 12px 20px !important;
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
        border-bottom: 1px solid #bbf7d0 !important;
      }
      .dark .cd-shipping-banner {
        background: linear-gradient(135deg, #064e3b 0%, #022c22 100%) !important;
        border-bottom: 1px solid rgba(16, 185, 129, 0.35) !important;
      }
      .cd-shipping-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        font-size: 11.5px !important;
        margin-bottom: 7px !important;
      }
      .cd-shipping-text {
        color: #065f46 !important;
        font-weight: 700 !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }
      .dark .cd-shipping-text {
        color: #ecfdf5 !important;
      }
      .cd-shipping-highlight {
        color: #047857 !important;
        font-weight: 800 !important;
      }
      .dark .cd-shipping-highlight {
        color: #6ee7b7 !important;
      }
      .cd-shipping-percent {
        color: #047857 !important;
        font-weight: 800 !important;
        font-size: 11px !important;
      }
      .dark .cd-shipping-percent {
        color: #34d399 !important;
      }
      .cd-progress-track {
        width: 100% !important;
        height: 7px !important;
        background: rgba(5, 150, 105, 0.16) !important;
        border-radius: 999px !important;
        overflow: hidden !important;
      }
      .dark .cd-progress-track {
        background: rgba(255, 255, 255, 0.12) !important;
      }
      .cd-progress-bar {
        height: 100% !important;
        border-radius: 999px !important;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%) !important;
        transition: width 0.4s ease !important;
      }
      .dark .cd-progress-bar {
        background: linear-gradient(90deg, #34d399 0%, #10b981 100%) !important;
        box-shadow: 0 0 10px rgba(52, 211, 153, 0.5) !important;
      }

      /* Items Container */
      .cd-items-stream {
        flex: 1 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        padding: 16px !important;
        scrollbar-width: thin !important;
        scrollbar-color: #cbd5e1 transparent !important;
      }
      .dark .cd-items-stream {
        scrollbar-color: #334155 transparent !important;
      }

      /* Item Card */
      .cd-item-card {
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 16px !important;
        padding: 12px 14px !important;
        margin-bottom: 12px !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03) !important;
        box-sizing: border-box !important;
        width: 100% !important;
      }
      .cd-item-card:hover {
        border-color: #10b981 !important;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.08) !important;
      }
      .dark .cd-item-card {
        background: #1e293b !important;
        border: 1px solid #334155 !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
      }
      .dark .cd-item-card:hover {
        border-color: #10b981 !important;
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2) !important;
      }

      .cd-item-img {
        width: 58px !important;
        height: 58px !important;
        border-radius: 12px !important;
        object-fit: cover !important;
        border: 1px solid #e2e8f0 !important;
        background: #ffffff !important;
        flex-shrink: 0 !important;
      }
      .dark .cd-item-img {
        border: 1px solid #475569 !important;
        background: #0f172a !important;
      }

      .cd-item-info {
        flex: 1 !important;
        min-width: 0 !important;
      }
      .cd-item-name {
        font-size: 13px !important;
        font-weight: 700 !important;
        color: #0f172a !important;
        line-height: 1.35 !important;
        margin: 0 0 4px 0 !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 2 !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
      }
      .dark .cd-item-name {
        color: #f8fafc !important;
      }

      .cd-variant-row {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        flex-wrap: wrap !important;
        margin-bottom: 4px !important;
      }
      .cd-variant-pill {
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
        background: #f1f5f9 !important;
        color: #334155 !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
        padding: 1px 6px !important;
        font-size: 10px !important;
        font-weight: 600 !important;
      }
      .dark .cd-variant-pill {
        background: #0f172a !important;
        color: #cbd5e1 !important;
        border: 1px solid #475569 !important;
      }
      .cd-color-dot {
        width: 8px !important;
        height: 8px !important;
        border-radius: 50% !important;
        display: inline-block !important;
        border: 1px solid rgba(0,0,0,0.15) !important;
      }

      .cd-item-price {
        font-size: 13.5px !important;
        font-weight: 800 !important;
        color: #059669 !important;
        font-family: monospace, system-ui !important;
      }
      .dark .cd-item-price {
        color: #34d399 !important;
      }
      .cd-item-price-sub {
        font-size: 11px !important;
        font-weight: 500 !important;
        color: #64748b !important;
        margin-left: 2px !important;
      }
      .dark .cd-item-price-sub {
        color: #94a3b8 !important;
      }

      .cd-item-actions {
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-end !important;
        justify-content: space-between !important;
        flex-shrink: 0 !important;
        gap: 8px !important;
      }

      .cd-remove-btn {
        width: 26px !important;
        height: 26px !important;
        border-radius: 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: #94a3b8 !important;
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        padding: 0 !important;
      }
      .cd-remove-btn:hover {
        color: #ef4444 !important;
        background: #fee2e2 !important;
        transform: scale(1.1) !important;
      }
      .dark .cd-remove-btn {
        color: #64748b !important;
      }
      .dark .cd-remove-btn:hover {
        color: #f87171 !important;
        background: rgba(239, 68, 68, 0.2) !important;
        transform: scale(1.1) !important;
      }

      /* Quantity Controller Pill */
      .cd-qty-pill {
        display: inline-flex !important;
        align-items: center !important;
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 10px !important;
        overflow: hidden !important;
        box-shadow: 0 1px 2px rgba(0,0,0,0.04) !important;
      }
      .dark .cd-qty-pill {
        background: #0f172a !important;
        border: 1px solid #475569 !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important;
      }
      .cd-qty-btn {
        width: 26px !important;
        height: 26px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border: none !important;
        background: transparent !important;
        color: #1e293b !important;
        font-size: 13px !important;
        font-weight: 800 !important;
        cursor: pointer !important;
        transition: background 0.15s ease !important;
        user-select: none !important;
      }
      .cd-qty-btn:hover {
        background: #e2e8f0 !important;
      }
      .cd-qty-btn:active {
        background: #cbd5e1 !important;
      }
      .dark .cd-qty-btn {
        color: #f8fafc !important;
      }
      .dark .cd-qty-btn:hover {
        background: #1e293b !important;
      }
      .dark .cd-qty-btn:active {
        background: #334155 !important;
      }
      .cd-qty-val {
        min-width: 24px !important;
        text-align: center !important;
        font-size: 12px !important;
        font-weight: 800 !important;
        color: #0f172a !important;
        padding: 0 2px !important;
        user-select: none !important;
      }
      .dark .cd-qty-val {
        color: #ffffff !important;
      }

      /* Footer */
      .cd-footer {
        padding: 16px 20px !important;
        background: #ffffff !important;
        border-top: 1px solid #e2e8f0 !important;
        box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.05) !important;
        box-sizing: border-box !important;
      }
      .dark .cd-footer {
        background: #111827 !important;
        border-top: 1px solid #1f2937 !important;
        box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.3) !important;
      }
      .cd-summary-row {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        font-size: 12.5px !important;
        color: #475569 !important;
        margin-bottom: 6px !important;
      }
      .dark .cd-summary-row {
        color: #94a3b8 !important;
      }
      .cd-summary-val {
        font-weight: 700 !important;
        color: #0f172a !important;
      }
      .dark .cd-summary-val {
        color: #f8fafc !important;
      }
      .cd-free-badge {
        color: #059669 !important;
        font-weight: 800 !important;
      }
      .dark .cd-free-badge {
        color: #34d399 !important;
      }
      .cd-discount-row {
        color: #059669 !important;
        font-weight: 700 !important;
      }
      .dark .cd-discount-row {
        color: #34d399 !important;
      }
      .cd-coupon-row {
        color: #4f46e5 !important;
        font-weight: 700 !important;
      }
      .dark .cd-coupon-row {
        color: #818cf8 !important;
      }
      .cd-total-row {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding-top: 10px !important;
        margin-top: 8px !important;
        border-top: 1px dashed #e2e8f0 !important;
      }
      .dark .cd-total-row {
        border-top: 1px dashed #334155 !important;
      }
      .cd-total-label {
        font-size: 14px !important;
        font-weight: 800 !important;
        color: #0f172a !important;
      }
      .dark .cd-total-label {
        color: #ffffff !important;
      }
      .cd-total-val {
        font-size: 20px !important;
        font-weight: 900 !important;
        color: #059669 !important;
        font-family: monospace, system-ui !important;
      }
      .dark .cd-total-val {
        color: #34d399 !important;
      }

      /* Primary Checkout Button */
      .cd-btn-checkout {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        width: 100% !important;
        padding: 13px 18px !important;
        margin-top: 14px !important;
        background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #047857 100%) !important;
        color: #ffffff !important;
        border-radius: 14px !important;
        font-size: 13.5px !important;
        font-weight: 800 !important;
        text-decoration: none !important;
        border: none !important;
        cursor: pointer !important;
        box-shadow: 0 8px 20px -4px rgba(5, 150, 105, 0.45) !important;
        transition: all 0.2s ease !important;
        box-sizing: border-box !important;
      }
      .cd-btn-checkout:hover {
        background: linear-gradient(135deg, #047857 0%, #0f766e 50%, #065f46 100%) !important;
        box-shadow: 0 10px 24px -4px rgba(5, 150, 105, 0.6) !important;
        transform: translateY(-1px) !important;
        color: #ffffff !important;
      }
      .cd-btn-checkout:active {
        transform: scale(0.99) !important;
      }
      .cd-btn-checkout-badge {
        background: rgba(255, 255, 255, 0.22) !important;
        padding: 4px 10px !important;
        border-radius: 8px !important;
        font-family: monospace, system-ui !important;
        font-size: 12.5px !important;
        font-weight: 800 !important;
        letter-spacing: 0.02em !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        color: #ffffff !important;
      }

      /* Secondary Links */
      .cd-footer-sub {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        font-size: 11.5px !important;
        color: #64748b !important;
        margin-top: 10px !important;
      }
      .dark .cd-footer-sub {
        color: #94a3b8 !important;
      }
      .cd-cart-link {
        color: #059669 !important;
        font-weight: 700 !important;
        text-decoration: underline !important;
        transition: color 0.15s ease !important;
      }
      .cd-cart-link:hover {
        color: #047857 !important;
      }
      .dark .cd-cart-link {
        color: #34d399 !important;
      }
      .dark .cd-cart-link:hover {
        color: #6ee7b7 !important;
      }
      .cd-trust-badge {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
      }

      /* Empty State */
      .cd-empty-state {
        padding: 60px 24px !important;
        text-align: center !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .cd-empty-icon-wrap {
        width: 72px !important;
        height: 72px !important;
        border-radius: 50% !important;
        background: #ecfdf5 !important;
        border: 1px solid #a7f3d0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 32px !important;
        margin-bottom: 16px !important;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.12) !important;
      }
      .dark .cd-empty-icon-wrap {
        background: rgba(16, 185, 129, 0.12) !important;
        border: 1px solid rgba(16, 185, 129, 0.3) !important;
      }
      .cd-empty-title {
        font-size: 15px !important;
        font-weight: 800 !important;
        color: #0f172a !important;
        margin-bottom: 6px !important;
      }
      .dark .cd-empty-title {
        color: #f8fafc !important;
      }
      .cd-empty-desc {
        font-size: 12px !important;
        color: #64748b !important;
        max-width: 240px !important;
        margin-bottom: 20px !important;
        line-height: 1.4 !important;
      }
      .dark .cd-empty-desc {
        color: #94a3b8 !important;
      }
      .cd-btn-shop-now {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        background: linear-gradient(135deg, #059669 0%, #0d9488 100%) !important;
        color: #ffffff !important;
        padding: 10px 22px !important;
        border-radius: 12px !important;
        font-size: 12.5px !important;
        font-weight: 700 !important;
        text-decoration: none !important;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3) !important;
        transition: all 0.2s ease !important;
      }
      .cd-btn-shop-now:hover {
        background: linear-gradient(135deg, #047857 0%, #0f766e 100%) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4) !important;
        color: #ffffff !important;
      }
    </style>

    <div id="cart-drawer-overlay" class="fixed inset-0 z-50 ${isCurrentlyOpen ? '' : 'hidden'} transition-opacity duration-300">
      
      <div id="cart-drawer-panel" class="fixed inset-y-0 right-0 z-50 transform ${isCurrentlyOpen ? '' : 'translate-x-full'} transition-transform duration-300 ease-in-out">
        
        <!-- Drawer Header -->
        <div class="cd-header">
          <div class="cd-title-wrap">
            <div class="cd-icon-badge">
              🛒
            </div>
            <div>
              <h3 class="cd-title">শপিং কার্ট</h3>
              <span class="cd-count-pill">
                মোট <strong class="cd-count-num">${count}</strong> টি আইটেম
              </span>
            </div>
          </div>
          <button 
            id="btn-close-cart" 
            class="cd-close-btn" 
            aria-label="Close Cart"
            title="বন্ধ করুন"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Free Delivery Progress Bar (৳2,000 threshold) -->
        <div class="cd-shipping-banner">
          <div class="cd-shipping-header">
            <span class="cd-shipping-text">
              <span>${amountNeeded === 0 ? "🎉" : "🚚"}</span>
              <span>
                ${amountNeeded > 0 
                  ? `আর মাত্র <strong class="cd-shipping-highlight">${formatCurrency(amountNeeded)}</strong> যোগ করলেই ডেলিভারি ফ্রি!` 
                  : `অভিনন্দন! আপনি <strong class="cd-shipping-highlight">ফ্রি ডেলিভারি</strong> পাচ্ছেন!`}
              </span>
            </span>
            <span class="cd-shipping-percent">${progressPercent}%</span>
          </div>
          <div class="cd-progress-track">
            <div class="cd-progress-bar" style="width: ${progressPercent}%;"></div>
          </div>
        </div>

        <!-- Cart Items Stream -->
        <div class="cd-items-stream">
          ${items.length === 0 ? `
            <div class="cd-empty-state">
              <div class="cd-empty-icon-wrap">
                🛍️
              </div>
              <h4 class="cd-empty-title">আপনার কার্ট বর্তমানে খালি আছে</h4>
              <p class="cd-empty-desc">আপনার পছন্দের পণ্যগুলো কার্টে যোগ করে সহজে অর্ডার করুন।</p>
              <a 
                href="/products" 
                class="cd-btn-shop-now" 
                onclick="document.getElementById('cart-drawer-overlay').classList.add('hidden'); document.getElementById('cart-drawer-panel').classList.add('translate-x-full');"
              >
                <span>কেনাকাটা শুরু করুন</span>
                <span>→</span>
              </a>
            </div>
          ` : items.map(it => `
            <div class="cd-item-card">
              
              <img 
                src="${it.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}" 
                alt="${it.name}" 
                class="cd-item-img"
                loading="lazy"
              />

              <div class="cd-item-info">
                <h4 class="cd-item-name" title="${it.name}">
                  ${it.name}
                </h4>

                <!-- Color & Size Variant Chips -->
                ${(it.color || it.size) ? `
                  <div class="cd-variant-row">
                    ${it.color ? `
                      <span class="cd-variant-pill">
                        <span class="cd-color-dot" style="background-color: ${it.color.toLowerCase() === 'white' ? '#e2e8f0' : it.color.toLowerCase()};"></span>
                        ${it.color}
                      </span>
                    ` : ''}
                    ${it.size ? `
                      <span class="cd-variant-pill">
                        <span>📏</span>
                        ${it.size}
                      </span>
                    ` : ''}
                  </div>
                ` : ''}

                <!-- Unit & Line Price -->
                <div class="cd-item-price">
                  ${formatCurrency(it.price)}${it.quantity > 1 ? `<span class="cd-item-price-sub">× ${it.quantity} = ${formatCurrency(Number(it.price) * Number(it.quantity))}</span>` : ''}
                </div>
              </div>

              <!-- Quantity Controls & Delete -->
              <div class="cd-item-actions">
                <button 
                  class="btn-cart-remove cd-remove-btn"
                  data-product-id="${it.product_id}"
                  data-color="${it.color || ''}"
                  data-size="${it.size || ''}"
                  title="মুছে ফেলুন"
                  aria-label="Remove item"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>

                <div class="cd-qty-pill">
                  <button 
                    class="btn-cart-minus cd-qty-btn"
                    data-product-id="${it.product_id}"
                    data-color="${it.color || ''}"
                    data-size="${it.size || ''}"
                    title="কমান"
                    aria-label="Decrease quantity"
                  >−</button>
                  <span class="cd-qty-val">
                    ${it.quantity}
                  </span>
                  <button 
                    class="btn-cart-plus cd-qty-btn"
                    data-product-id="${it.product_id}"
                    data-color="${it.color || ''}"
                    data-size="${it.size || ''}"
                    title="বাড়ান"
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              </div>

            </div>
          `).join("")}
        </div>

        <!-- Drawer Footer: Calculations & Checkout Action -->
        ${items.length > 0 ? `
          <div class="cd-footer">
            
            <!-- Price Summary -->
            <div class="cd-summary-row">
              <span>পণ্যের মোট মূল্য:</span>
              <span class="cd-summary-val">${formatCurrency(subtotal)}</span>
            </div>

            <div class="cd-summary-row">
              <span>আনুমানিক ডেলিভারি:</span>
              <span class="cd-summary-val">
                ${delivery === 0 ? '<span class="cd-free-badge">ফ্রি (৳০)</span>' : formatCurrency(delivery)}
              </span>
            </div>

            ${onlineDiscount > 0 ? `
              <div class="cd-summary-row cd-discount-row">
                <span>অনলাইন পেমেন্ট ৫% ছাড়:</span>
                <span>-${formatCurrency(onlineDiscount)}</span>
              </div>
            ` : ""}

            ${couponDiscount > 0 ? `
              <div class="cd-summary-row cd-coupon-row">
                <span>কুপন ছাড়:</span>
                <span>-${formatCurrency(couponDiscount)}</span>
              </div>
            ` : ""}

            <div class="cd-total-row">
              <span class="cd-total-label">সর্বমোট প্রদেয়:</span>
              <span class="cd-total-val">${formatCurrency(grandTotal)}</span>
            </div>

            <!-- High-Converting Checkout Button -->
            <a 
              href="/checkout" 
              id="btn-drawer-checkout" 
              class="cd-btn-checkout"
              onclick="document.getElementById('cart-drawer-overlay').classList.add('hidden'); document.getElementById('cart-drawer-panel').classList.add('translate-x-full');"
            >
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <span>অর্ডার সম্পন্ন করুন (Checkout)</span>
              </span>
              <span class="cd-btn-checkout-badge">
                <span>${formatCurrency(grandTotal)}</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </span>
            </a>

            <div class="cd-footer-sub">
              <a 
                href="/cart" 
                class="cd-cart-link" 
                onclick="document.getElementById('cart-drawer-overlay').classList.add('hidden'); document.getElementById('cart-drawer-panel').classList.add('translate-x-full');"
              >
                সম্পূর্ণ কার্ট পেজ দেখুন ↗
              </a>
              <span class="cd-trust-badge">
                <span>🔒</span> ক্যাশ অন ডেলিভারি
              </span>
            </div>

          </div>
        ` : ""}

      </div>
    </div>
  `;
}
