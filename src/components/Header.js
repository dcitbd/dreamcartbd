/**
 * ============================================================================
 * DREAM CART BD — GLOBAL LUXURY HEADER (Header.js)
 * ============================================================================
 */

import { store } from "../js/store.js";
import { ProductAPI } from "../api/products.js";

export const Header = {
  render: () => {
    const user = store.state.user;
    const cartCount = store.state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

    return `
    <!-- Top Announcement Bar -->
    <div class="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
      <div class="max-w-7xl mx-auto flex justify-between items-center font-bengali">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5 text-amber-400 font-medium">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা
          </span>
          <span class="hidden md:inline text-slate-400">|</span>
          <span class="hidden md:flex items-center gap-1 text-slate-400">
            <i data-lucide="phone-call" class="w-3.5 h-3.5"></i> হেল্পলাইন: 01700-000000
          </span>
        </div>
        <div class="flex items-center gap-4">
          <a href="/track-order" class="hover:text-white transition-colors flex items-center gap-1">
            <i data-lucide="truck" class="w-3.5 h-3.5"></i> অর্ডার ট্র্যাক করুন
          </a>
          ${user ? `
            <a href="${user.role.includes('admin') ? '/admin/dashboard' : '/customer/account'}" class="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
              <i data-lucide="user-check" class="w-3.5 h-3.5"></i> ${user.name}
            </a>
          ` : `
            <a href="/login" class="hover:text-white transition-colors flex items-center gap-1">
              <i data-lucide="log-in" class="w-3.5 h-3.5"></i> লগইন / রেজিস্টার
            </a>
          `}
        </div>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="sticky top-0 z-40 w-full glass-panel shadow-sm transition-all duration-300 border-b border-slate-200/80 dark:border-slate-800/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20 gap-4">
          
          <!-- Logo & Mobile Drawer Toggle -->
          <div class="flex items-center gap-3">
            <button id="mobile-menu-toggle" class="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <i data-lucide="menu" class="w-6 h-6"></i>
            </button>
            <a href="/" class="flex items-center gap-2.5 group">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <i data-lucide="shopping-bag" class="w-6 h-6"></i>
              </div>
              <div class="flex flex-col">
                <span class="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-brand-600 dark:from-white dark:via-slate-200 dark:to-brand-400 bg-clip-text text-transparent">
                  Dream Cart BD
                </span>
                <span class="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 -mt-1">
                  Smart Digital Commerce
                </span>
              </div>
            </a>
          </div>

          <!-- Live Search Bar with Instant Results Dropdown -->
          <div class="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <div class="relative w-full">
              <input 
                type="text" 
                id="global-search-input" 
                placeholder="প্রোডাক্টের নাম, ক্যাটাগরি বা SKU দিয়ে খুঁজুন..." 
                class="w-full pl-11 pr-24 py-2.5 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-bengali"
              />
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="search" class="w-4 h-4"></i>
              </div>
              <button id="search-btn" class="absolute inset-y-1 right-1 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors font-bengali">
                সার্চ
              </button>
            </div>
            <!-- Search Results Dropdown -->
            <div id="search-results-dropdown" class="hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 max-h-96 overflow-y-auto"></div>
          </div>

          <!-- Action Icons (Theme Toggle, Wishlist, Cart) -->
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Two-Way Sync Status Indicator -->
            <button onclick="window.SyncEngine.forceSync()" title="গুগল শীট সিঙ্ক করুন" class="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center">
              <i data-lucide="refresh-cw" class="w-5 h-5"></i>
            </button>

            <!-- Dark / Light Theme Toggle -->
            <button id="theme-toggle-btn" class="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <i data-lucide="${store.state.theme === 'dark' ? 'sun' : 'moon'}" class="w-5 h-5"></i>
            </button>

            <!-- Cart Drawer Trigger Button -->
            <button id="cart-drawer-toggle" class="relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/60 hover:bg-brand-100 transition-all">
              <i data-lucide="shopping-cart" class="w-5 h-5"></i>
              <span class="hidden sm:inline font-semibold text-sm font-bengali">কার্ট</span>
              <span id="header-cart-badge" class="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-brand-600 text-white rounded-full">
                ${cartCount}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
    `;
  },

  initEvents: () => {
    // থিম টগল হ্যান্ডলার
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => store.toggleTheme());
    }

    // কার্ট ড্রয়ার টগল
    const cartBtn = document.getElementById("cart-drawer-toggle");
    if (cartBtn) {
      cartBtn.addEventListener("click", () => {
        store.emit("toggle_cart_drawer", true);
      });
    }

    // লাইভ সার্চ ইঞ্জিন
    const searchInput = document.getElementById("global-search-input");
    const dropdown = document.getElementById("search-results-dropdown");
    let debounceTimer;

    if (searchInput && dropdown) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 2) {
          dropdown.classList.add("hidden");
          dropdown.innerHTML = "";
          return;
        }

        debounceTimer = setTimeout(async () => {
          try {
            const result = await ProductAPI.getAll();
            const products = result.items || result || [];
            const matches = products.filter(p => 
              (p.product_name && p.product_name.toLowerCase().includes(query)) ||
              (p.sku && p.sku.toLowerCase().includes(query))
            ).slice(0, 5);

            if (matches.length === 0) {
              dropdown.innerHTML = `<div class="p-4 text-center text-sm text-slate-500 font-bengali">কোনো প্রোডাক্ট পাওয়া যায়নি।</div>`;
            } else {
              dropdown.innerHTML = matches.map(p => `
                <a href="/product/${p.product_id}" class="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                  <img src="${p.thumbnail || 'https://placehold.co/80x80'}" class="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-slate-900 dark:text-white truncate">${p.product_name}</h4>
                    <p class="text-xs text-brand-600 dark:text-brand-400 font-bold">৳${p.selling_price || p.regular_price}</p>
                  </div>
                  <span class="badge-success text-[10px]">ইন স্টক</span>
                </a>
              `).join("");
            }
            dropdown.classList.remove("hidden");
          } catch (err) {
            console.error("Search failed:", err);
          }
        }, 300);
      });

      // বাইরে ক্লিক করলে সার্চ ড্রপডাউন বন্ধ হওয়া
      document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.classList.add("hidden");
        }
      });
    }
  }
};
