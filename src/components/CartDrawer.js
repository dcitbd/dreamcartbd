/**
 * ============================================================================
 * DREAM CART BD — SMART CART DRAWER (CartDrawer.js)
 * ============================================================================
 */

import { store } from "../js/store.js";
import { router } from "../js/router.js";

export const CartDrawer = {
  render: () => {
    const cart = store.state.cart;
    const items = cart.items || [];

    return `
    <div id="cart-drawer-backdrop" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity duration-300 hidden opacity-0">
      <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div id="cart-drawer-panel" class="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col font-bengali transform translate-x-full transition-transform duration-300">
          
          <!-- Header -->
          <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <i data-lucide="shopping-bag" class="w-5 h-5"></i>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">আপনার শপিং কার্ট (${items.length})</h3>
            </div>
            <button id="close-cart-drawer" class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Items List -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            ${items.length === 0 ? `
              <div class="text-center py-16">
                <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <i data-lucide="shopping-cart" class="w-8 h-8"></i>
                </div>
                <h4 class="text-base font-bold text-slate-800 dark:text-slate-200">কার্ট খালি আছে!</h4>
                <p class="text-xs text-slate-500 mt-1">পছন্দের পণ্য কার্টে যুক্ত করুন।</p>
              </div>
            ` : items.map(item => `
              <div class="flex gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <img src="${item.image || 'https://placehold.co/80x80'}" class="w-16 h-16 rounded-xl object-cover bg-white" />
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-slate-900 dark:text-white truncate">${item.name}</h4>
                  ${item.variantName ? `<p class="text-xs text-slate-400">${item.variantName}</p>` : ''}
                  <p class="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">৳${item.unitPrice}</p>
                  
                  <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                      <button onclick="window.store.updateCartQty('${item.cartItemId}', ${item.quantity - 1})" class="px-2 py-0.5 text-slate-500 hover:text-brand-600">-</button>
                      <span class="px-2 text-xs font-bold">${item.quantity}</span>
                      <button onclick="window.store.updateCartQty('${item.cartItemId}', ${item.quantity + 1})" class="px-2 py-0.5 text-slate-500 hover:text-brand-600">+</button>
                    </div>
                    <button onclick="window.store.removeFromCart('${item.cartItemId}')" class="text-rose-500 hover:text-rose-600 text-xs flex items-center gap-1">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> মুছুন
                    </button>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>

          <!-- Bottom Checkout Summary -->
          ${items.length > 0 ? `
            <div class="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <div class="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>সাব-টোটাল:</span>
                <span class="font-bold text-slate-900 dark:text-white">৳${cart.subtotal}</span>
              </div>
              <div class="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>সর্বমোট:</span>
                <span class="text-brand-600 dark:text-brand-400">৳${cart.total}</span>
              </div>
              <button id="drawer-checkout-btn" class="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2">
                <span>অর্ডার কনফার্ম করুন (চেকআউট)</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>
          ` : ''}

        </div>
      </div>
    </div>
    `;
  },

  initEvents: () => {
    const backdrop = document.getElementById("cart-drawer-backdrop");
    const panel = document.getElementById("cart-drawer-panel");
    const closeBtn = document.getElementById("close-cart-drawer");
    const checkoutBtn = document.getElementById("drawer-checkout-btn");

    const openDrawer = () => {
      if (backdrop && panel) {
        backdrop.classList.remove("hidden");
        requestAnimationFrame(() => {
          backdrop.classList.remove("opacity-0");
          panel.classList.remove("translate-x-full");
        });
      }
    };

    const closeDrawer = () => {
      if (backdrop && panel) {
        backdrop.classList.add("opacity-0");
        panel.classList.add("translate-x-full");
        setTimeout(() => backdrop.classList.add("hidden"), 300);
      }
    };

    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeDrawer();
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        closeDrawer();
        router.navigate("/checkout");
      });
    }

    store.on("toggle_cart_drawer", (open) => {
      if (open) openDrawer(); else closeDrawer();
    });

    store.on("cart_updated", () => {
      const drawerContainer = document.getElementById("cart-drawer-root");
      if (drawerContainer) {
        drawerContainer.innerHTML = CartDrawer.render();
        CartDrawer.initEvents();
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
};
