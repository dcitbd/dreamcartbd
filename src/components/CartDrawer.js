/**
 * DREAM CART BD — SLIDING CART DRAWER COMPONENT (CartDrawer.js)
 * Implements user requirements:
 * - Beautiful, modern e-commerce cart sidebar with harmonious color palette
 * - Color & Size badges displayed on each item
 * - Clean path routing (/checkout, /cart), real-time calculations
 * - Free shipping threshold progress bar (৳2,000)
 * - Online 5% prepayment discount
 * - Smooth quantity controls & delete action
 * - Darkmode support
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

  return `
    <div id="cart-drawer-overlay" class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 hidden transition-opacity duration-300">
      
      <div id="cart-drawer-panel" class="fixed inset-y-0 right-0 max-w-full w-full sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-50 transform translate-x-full transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-800">
        
        <!-- Drawer Header -->
        <div class="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-850">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shadow-xs">
              🛒
            </div>
            <div>
              <h3 class="font-black text-slate-900 dark:text-white text-base leading-tight">শপিং কার্ট</h3>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                মোট <strong class="text-emerald-600 dark:text-emerald-400">${count}</strong> টি আইটেম
              </span>
            </div>
          </div>
          <button 
            id="btn-close-cart" 
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition cursor-pointer" 
            aria-label="Close Cart"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Free Delivery Progress Bar (৳2,000 threshold) -->
        <div class="px-5 py-3 bg-emerald-50/90 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50 text-xs">
          <div class="flex justify-between items-center text-emerald-900 dark:text-emerald-200 font-bold mb-1.5 text-[11px]">
            <span class="flex items-center gap-1.5">
              <span>${amountNeeded === 0 ? "🎉" : "🚚"}</span>
              <span>${amountNeeded > 0 ? `আর মাত্র ৳${amountNeeded} যোগ করলেই ডেলিভারি ফ্রি!` : "অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন!"}</span>
            </span>
            <span class="text-emerald-700 dark:text-emerald-400">${progressPercent}%</span>
          </div>
          <div class="w-full bg-emerald-200/80 dark:bg-emerald-900/80 h-2 rounded-full overflow-hidden shadow-inner">
            <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <!-- Cart Items Stream -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          ${items.length === 0 ? `
            <div class="py-20 text-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 text-3xl flex items-center justify-center mx-auto shadow-inner">
                🛍️
              </div>
              <div class="space-y-1">
                <p class="text-sm font-bold text-slate-700 dark:text-slate-300">আপনার কার্ট বর্তমানে খালি আছে</p>
                <p class="text-xs text-slate-400">আপনার পছন্দের পণ্যগুলো কার্টে যোগ করুন</p>
              </div>
              <a 
                href="/products" 
                class="btn-primary text-xs py-2.5 px-5 inline-flex shadow-sm cursor-pointer" 
                onclick="document.getElementById('cart-drawer-overlay').classList.add('hidden'); document.getElementById('cart-drawer-panel').classList.add('translate-x-full');"
              >
                কেনাকাটা শুরু করুন →
              </a>
            </div>
          ` : items.map(it => `
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3 text-xs shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition">
              
              <img 
                src="${it.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}" 
                alt="${it.name}" 
                class="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white"
              />

              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-slate-900 dark:text-white truncate text-xs leading-snug">
                  ${it.name}
                </h4>

                <!-- Color & Size Variant Chips -->
                <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                  ${it.color ? `
                    <span class="inline-flex items-center gap-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                      ${it.color}
                    </span>
                  ` : ''}
                  ${it.size ? `
                    <span class="inline-flex items-center gap-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <span>📏</span>
                      ${it.size}
                    </span>
                  ` : ''}
                </div>

                <!-- Unit & Line Price -->
                <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold font-mono mt-1">
                  ${formatCurrency(it.price)} ${it.quantity > 1 ? `<span class="text-slate-400 font-normal">× ${it.quantity} = ${formatCurrency(Number(it.price) * Number(it.quantity))}</span>` : ''}
                </div>
              </div>

              <!-- Quantity Controls & Delete -->
              <div class="flex flex-col items-end gap-2 flex-shrink-0">
                <button 
                  class="btn-cart-remove text-slate-400 hover:text-rose-600 p-1 rounded-md transition hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  data-product-id="${it.product_id}"
                  data-color="${it.color || ''}"
                  data-size="${it.size || ''}"
                  title="মুছুন"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>

                <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                  <button 
                    class="btn-cart-minus px-2 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
                    data-product-id="${it.product_id}"
                    data-color="${it.color || ''}"
                    data-size="${it.size || ''}"
                  >-</button>
                  <span class="w-6 text-center font-bold text-xs text-slate-900 dark:text-white">
                    ${it.quantity}
                  </span>
                  <button 
                    class="btn-cart-plus px-2 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
                    data-product-id="${it.product_id}"
                    data-color="${it.color || ''}"
                    data-size="${it.size || ''}"
                  >+</button>
                </div>
              </div>

            </div>
          `).join("")}
        </div>

        <!-- Drawer Footer: Calculations & Checkout Action -->
        ${items.length > 0 ? `
          <div class="p-5 border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5 shadow-lg">
            
            <!-- Price Summary -->
            <div class="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div class="flex justify-between">
                <span>পণ্যের মোট মূল্য:</span>
                <span class="font-bold text-slate-900 dark:text-white">${formatCurrency(subtotal)}</span>
              </div>
              <div class="flex justify-between">
                <span>আনুমানিক ডেলিভারি:</span>
                <span class="font-bold ${delivery === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}">
                  ${delivery === 0 ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold">ফ্রি (৳০)</span>' : formatCurrency(delivery)}
                </span>
              </div>
              ${onlineDiscount > 0 ? `
                <div class="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>অনলাইন পেমেন্ট ৫% ছাড়:</span>
                  <span>-${formatCurrency(onlineDiscount)}</span>
                </div>
              ` : ""}
              ${couponDiscount > 0 ? `
                <div class="flex justify-between text-indigo-600 dark:text-indigo-400 font-bold">
                  <span>কুপন ছাড়:</span>
                  <span>-${formatCurrency(couponDiscount)}</span>
                </div>
              ` : ""}
              <div class="flex justify-between items-baseline text-sm font-black text-slate-900 dark:text-white pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <span>সর্বমোট প্রদেয়:</span>
                <span class="text-emerald-600 dark:text-emerald-400 font-black text-lg font-mono">${formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <!-- Checkout CTA Button -->
            <a 
              href="/checkout" 
              id="btn-drawer-checkout" 
              class="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-center text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
              onclick="document.getElementById('cart-drawer-overlay').classList.add('hidden'); document.getElementById('cart-drawer-panel').classList.add('translate-x-full');"
            >
              <span>অর্ডার সম্পন্ন করুন (Checkout)</span>
              <span class="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-mono">${formatCurrency(grandTotal)}</span>
              <span>→</span>
            </a>

            <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <a href="/cart" class="hover:text-emerald-600 font-bold underline" onclick="document.getElementById('cart-drawer-overlay').classList.add('hidden'); document.getElementById('cart-drawer-panel').classList.add('translate-x-full');">
                সম্পূর্ণ কার্ট পেজ দেখুন ↗
              </a>
              <span class="flex items-center gap-1">
                <span>🔒</span> ক্যাশ অন ডেলিভারি
              </span>
            </div>

          </div>
        ` : ""}

      </div>
    </div>
  `;
}
