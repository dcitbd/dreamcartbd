/**
 * DREAM CART BD — SLIDING CART DRAWER COMPONENT
 * Real-time calculation, free delivery progress (threshold ৳2,000), coupon codes, checkout button.
 */

import { cartStore } from '../store/cartStore.js';
import { formatCurrency } from '../utils/format.js';

export function renderCartDrawer() {
  const items = cartStore.items;
  const subtotal = cartStore.getSubtotal();
  const delivery = cartStore.getDeliveryCharge();
  const couponDiscount = cartStore.getCouponDiscount();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const grandTotal = cartStore.getGrandTotal();

  const freeDeliveryThreshold = 2000;
  const amountNeeded = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return `
    <div id="cart-drawer-overlay" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden transition-opacity duration-300">
      
      <div id="cart-drawer-panel" class="fixed inset-y-0 right-0 max-w-full w-full sm:max-w-md bg-white shadow-2xl flex flex-col z-50 transform translate-x-full transition-transform duration-300 ease-in-out">
        
        <!-- Drawer Header -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div class="flex items-center gap-2">
            <span class="text-xl">🛒</span>
            <h3 class="font-black text-slate-900 text-base">Your Shopping Cart</h3>
            <span class="badge badge-info text-xs">${cartStore.getCount()} items</span>
          </div>
          <button id="btn-close-cart" class="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Free Delivery Progress Bar (৳2,000 threshold) -->
        <div class="p-3.5 bg-emerald-50/70 border-b border-emerald-100 text-xs">
          <div class="flex justify-between items-center text-emerald-800 font-semibold mb-1.5">
            <span>${amountNeeded > 0 ? `৳${amountNeeded} আরও যোগ করলে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!` : "🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন!"}</span>
            <span>${progressPercent}%</span>
          </div>
          <div class="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
            <div class="bg-emerald-600 h-full rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
          </div>
          <div class="text-[11px] text-emerald-700 mt-1 flex justify-between">
            <span>২০০০ টাকার বেশি শপিং করলে ডেলিভারি চার্জ ফ্রি</span>
            <span class="font-bold">টার্গেট: ৳২,০০০</span>
          </div>
        </div>

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100 space-y-4">
          ${items.length === 0 ? `
            <div class="py-16 text-center text-slate-400 space-y-3">
              <div class="text-5xl">🛍️</div>
              <p class="text-sm font-semibold text-slate-600">Your cart is currently empty</p>
              <p class="text-xs">Explore our premium smartwatches, organic supplements, and gadgets!</p>
              <a href="#/shop" class="btn-primary inline-flex text-xs py-2 px-5 mt-2">
                Start Shopping →
              </a>
            </div>
          ` : items.map(item => `
            <div class="pt-4 first:pt-0 flex gap-3.5 items-start">
              <img src="${item.thumbnail}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                  <h4 class="text-xs font-bold text-slate-800 truncate pr-2">${item.name}</h4>
                  <button class="btn-cart-remove text-slate-300 hover:text-rose-500 transition text-sm" data-product-id="${item.product_id}" data-variant-id="${item.variant_id}">×</button>
                </div>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[11px] text-slate-400">Dream Cart BD Official</span>
                </div>
                <div class="flex items-center justify-between mt-3">
                  <span class="text-xs font-extrabold text-emerald-700">${formatCurrency(item.price)}</span>
                  <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button class="btn-cart-qty px-2 py-0.5 text-slate-500 hover:bg-slate-100 text-xs" data-delta="-1" data-product-id="${item.product_id}" data-variant-id="${item.variant_id}">-</button>
                    <span class="px-2.5 text-xs font-bold text-slate-700">${item.quantity}</span>
                    <button class="btn-cart-qty px-2 py-0.5 text-slate-500 hover:bg-slate-100 text-xs" data-delta="1" data-product-id="${item.product_id}" data-variant-id="${item.variant_id}">+</button>
                  </div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Drawer Footer Summary -->
        ${items.length > 0 ? `
          <div class="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
            
            <!-- Quick Voucher Input -->
            <div class="flex gap-2">
              <input 
                type="text" 
                id="cart-coupon-input" 
                placeholder="Promo code (e.g. DREAM10)" 
                class="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-emerald-500 uppercase"
              />
              <button id="btn-apply-coupon" class="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap">
                Apply
              </button>
            </div>

            <!-- Calculation Rows -->
            <div class="space-y-1.5 text-xs text-slate-600">
              <div class="flex justify-between">
                <span>Subtotal:</span>
                <span class="font-bold text-slate-800">${formatCurrency(subtotal)}</span>
              </div>
              <div class="flex justify-between">
                <span>Estimated Delivery:</span>
                <span class="font-bold ${delivery === 0 ? 'text-emerald-600' : 'text-slate-800'}">
                  ${delivery === 0 ? '<span class="text-emerald-600 font-bold">ফ্রি (৳০)</span>' : formatCurrency(delivery)}
                </span>
              </div>
              ${couponDiscount > 0 ? `
                <div class="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-${formatCurrency(couponDiscount)}</span>
                </div>
              ` : ""}
              ${onlineDiscount > 0 ? `
                <div class="flex justify-between text-emerald-600 font-bold">
                  <span>Online Prepayment (5% OFF):</span>
                  <span>-${formatCurrency(onlineDiscount)}</span>
                </div>
              ` : ""}
              <div class="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total:</span>
                <span class="text-emerald-700">${formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <!-- Checkout CTA Button -->
            <a href="#/checkout" id="btn-drawer-checkout" class="btn-primary w-full py-3.5 text-center text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2">
              <span>Proceed to Checkout</span>
              <span>(${formatCurrency(grandTotal)}) →</span>
            </a>
            
            <p class="text-[10px] text-center text-slate-400">
              🔒 100% Cash On Delivery & Online Payment Available Nationwide.
            </p>
          </div>
        ` : ""}

      </div>
    </div>
  `;
}
