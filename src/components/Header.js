/**
 * DREAM CART BD — MAIN NAVIGATION BAR (Header.js)
 * High-performance, pixel-perfect header component:
 * - Desktop: Notice bar, compact crisp logo (42px), wide predictive search bar, nav actions, auth menu, dark mode.
 * - Mobile: Sleek native app bar with compact logo (36px) & dedicated search bar. Zero menu clutter on top.
 */

import { cartStore } from '../store/cartStore.js';
import { favouriteStore } from '../store/favouriteStore.js';
import { authStore } from '../store/authStore.js';

export function renderHeader() {
  const cartCount = cartStore.getCount();
  const favCount = favouriteStore.getCount();
  const isAuthenticated = authStore.isAuthenticated();
  const isDark = document.documentElement.classList.contains('dark');

  return `
    <!-- Top Notice Bar (Desktop only) -->
    <div class="notice-bar hidden sm:block bg-slate-900 dark:bg-slate-950 text-white text-xs py-2 px-4 border-b border-emerald-800/40 relative z-50">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <div class="flex items-center gap-2 text-center md:text-left text-[11px] sm:text-xs">
          <span class="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase shadow-xs">নোটিশ</span>
          <span class="font-medium text-slate-100">
            ৳২,০০০ বা তার বেশি অর্ডারে <strong class="text-amber-300 font-bold">ফ্রি শিপিং!</strong> | অনলাইনে পেমেন্ট করলে <strong class="text-emerald-300 font-bold">৫% ছাড়</strong> | পণ্য হাতে পেয়ে মূল্য পরিশোধ
          </span>
        </div>
        <div class="flex items-center gap-3 text-[11px] sm:text-xs text-emerald-200 flex-shrink-0">
          <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="hover:text-white transition flex items-center gap-1 font-bold">
            <span>💬</span> 01581703822
          </a>
          <span class="text-emerald-500">|</span>
          <a href="tel:01818273838" class="hover:text-white transition flex items-center gap-1">
            <span>📞</span> 01818273838
          </a>
          <span class="text-emerald-500">|</span>
          <a href="/track" class="hover:text-white transition flex items-center gap-1">
            <span>🚚</span> ট্র্যাকিং
          </a>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <header class="site-header">
      <div class="header-inner">
        
        <!-- Brand Logo & Shop Name -->
        <a href="/" class="header-brand" title="Dream Cart BD Home">
          <div class="header-logo-box">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10" 
              alt="Dream Cart BD Logo" 
              class="header-logo-img"
              onerror="this.onerror=null; this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';"
            />
          </div>
          <div class="header-brand-text">
            <span class="header-brand-title">
              Dream Cart <span class="accent">BD</span>
            </span>
            <span class="header-brand-sub">
              Smart Digital Commerce
            </span>
          </div>
        </a>

        <!-- Desktop Predictive Search Bar -->
        <div class="desktop-search-container search-container">
          <div class="header-search-bar">
            <svg class="header-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              id="global-search-input"
              placeholder="পণ্য, ব্র্যান্ড বা মডেল লিখে খুঁজুন..." 
              autocomplete="off"
              class="header-search-input"
            />
            <button 
              id="global-search-clear-btn" 
              class="header-search-clear hidden" 
              type="button" 
              title="ক্লিয়ার করুন"
            >✕</button>
            <button 
              id="global-search-btn" 
              type="button"
              class="header-search-submit"
            >
              <span>সার্চ</span>
              <span style="font-size: 11px;">🔍</span>
            </button>
          </div>

          <!-- Predictive Preview Popup -->
          <div id="search-preview-popup" class="hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"></div>
        </div>

        <!-- Desktop Navigation Controls (Hidden on Mobile) -->
        <div class="desktop-nav-controls">
          
          <!-- Products Link -->
          <a href="/products" class="nav-action-btn">
            <span>🛍️</span> Products
          </a>

          <!-- Cart Button -->
          <button id="btn-open-cart" class="nav-action-btn" title="কার্ট দেখুন">
            <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span>Cart</span>
            <span id="nav-cart-badge" class="nav-badge-count">
              ${cartCount}
            </span>
          </button>

          <!-- Favourite (Wishlist) Icon -->
          <a href="/favourite" class="nav-action-btn" title="পছন্দের তালিকা">
            <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <span>Favourite</span>
            <span id="nav-fav-badge" class="nav-badge-count nav-badge-rose">
              ${favCount}
            </span>
          </a>

          <!-- User Login / Account Dropdown -->
          <div class="relative auth-dropdown-container">
            ${isAuthenticated ? `
              <button id="btn-user-menu" class="nav-action-btn" style="background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);">
                <span style="width: 22px; height: 22px; border-radius: 9999px; background: #059669; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 11px;">
                  ${(authStore.getUserDisplayName() || "U").charAt(0).toUpperCase()}
                </span>
                <span style="max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${authStore.getUserDisplayName()}</span>
                <span style="font-size: 10px;">▼</span>
              </button>
            ` : `
              <a href="/customer/login" class="nav-action-btn" style="background: #f1f5f9; border: 1px solid #e2e8f0;">
                <svg style="width: 16px; height: 16px; color: #059669;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span>লগইন</span>
              </a>
            `}

            <!-- Dropdown Menu -->
            <div id="auth-dropdown-panel" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs">
              ${isAuthenticated ? `
                <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div class="font-bold text-slate-900 dark:text-white truncate">${authStore.getUserDisplayName()}</div>
                  <div class="text-[10px] text-slate-400 capitalize">${authStore.getAccountType()}</div>
                </div>
                ${authStore.isAdmin() ? `<a href="/admin/dashboard" class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-emerald-600">Admin Dashboard</a>` : ""}
                ${authStore.isReseller() ? `<a href="/reseller/dashboard" class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-indigo-600">Reseller Portal</a>` : ""}
                ${authStore.isWholesaler() ? `<a href="/wholesaler/dashboard" class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-amber-600">Wholesale Portal</a>` : ""}
                <a href="/customer/dashboard" class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">My Orders & Profile</a>
                <a href="/customer/settings" class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Settings</a>
                <button id="btn-logout" class="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-bold border-t border-slate-100 dark:border-slate-800 cursor-pointer">লগআউট</button>
              ` : `
                <a href="/customer/login" class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">Customer Login</a>
                <a href="/customer/register" class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">Customer Register</a>
                <a href="/reseller/login" class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">Reseller Hub</a>
                <a href="/wholesaler/login" class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">Wholesale Portal</a>
                <div class="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                <a href="/admin/login" class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-semibold">Admin / Worker Login</a>
              `}
            </div>
          </div>

          <!-- Darkmode Toggle Icon -->
          <button 
            id="btn-toggle-darkmode" 
            class="nav-action-btn"
            title="${isDark ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}"
            aria-label="Toggle Dark Mode"
          >
            <span class="dark-hidden text-base">🌙</span>
            <span class="dark-inline text-base">☀️</span>
          </button>

        </div>

      </div>

      <!-- Mobile Search Row (Only on mobile screens, directly under Logo) -->
      <div class="mobile-search-row relative">
        <div class="header-search-bar" style="border-radius: 9999px; padding: 2px 4px 2px 12px;">
          <svg class="header-search-icon" style="width: 16px; height: 16px; margin-right: 6px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            id="mobile-search-input"
            placeholder="পণ্য বা মডেল সার্চ করুন..." 
            autocomplete="off"
            class="header-search-input"
            style="font-size: 12px; padding: 5px 65px 5px 0;"
          />
          <button 
            id="mobile-search-clear-btn" 
            class="header-search-clear hidden" 
            type="button" 
            title="ক্লিয়ার করুন"
            style="right: 68px;"
          >✕</button>
          <button 
            id="mobile-search-btn" 
            type="button"
            class="header-search-submit"
            style="padding: 0 12px; font-size: 11px;"
          >
            <span>সার্চ</span>
          </button>
        </div>
        <div id="mobile-search-preview-popup" class="hidden absolute top-full left-4 right-4 mt-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto"></div>
      </div>

    </header>
  `;
}
