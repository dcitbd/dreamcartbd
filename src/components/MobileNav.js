/**
 * DREAM CART BD — APP-STYLE BOTTOM NAVIGATION COMPONENT (MobileNav.js)
 * Implements user requirements:
 * - Native Mobile App Bar with 5 core tabs:
 *   1. Home (🏠 হোম)
 *   2. Products (🛍️ পণ্যসমূহ)
 *   3. Cart with live badge (🛒 কার্ট)
 *   4. Wishlist with live badge (❤️ পছন্দ)
 *   5. Menu Toggle (☰ মেন্যু)
 * - Tapping 'মেন্যু' opens the App Navigation Bottom Sheet / Drawer with full categorized links
 * - Clean close button (✕) and tap outside to close
 */

import { cartStore } from '../store/cartStore.js';
import { favouriteStore } from '../store/favouriteStore.js';
import { authStore } from '../store/authStore.js';

export function renderMobileNav() {
  const cartCount = cartStore.getCount();
  const favCount = favouriteStore.getCount();
  const isAuth = authStore.isAuthenticated();
  const accountLink = isAuth 
    ? (authStore.isAdmin() ? '/admin/dashboard' : (authStore.isReseller() ? '/reseller/dashboard' : (authStore.isWholesaler() ? '/wholesaler/dashboard' : '/customer/dashboard'))) 
    : '/customer/login';

  return `
    <!-- Native App-Style Bottom Navigation Bar (Mobile Screens Only) -->
    <nav class="mobile-nav-bar fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden" aria-label="Mobile Bottom Navigation">
      
      <!-- 1. Home -->
      <a href="/" class="flex flex-col items-center justify-center flex-1 h-full text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition" title="হোম">
        <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <span class="text-[10px] font-bold mt-1">হোম</span>
      </a>

      <!-- 2. Products -->
      <a href="/products" class="flex flex-col items-center justify-center flex-1 h-full text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition" title="পণ্যসমূহ">
        <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
        </svg>
        <span class="text-[10px] font-bold mt-1">পণ্যসমূহ</span>
      </a>

      <!-- 3. Cart with live badge -->
      <button id="mobile-cart-btn" class="flex flex-col items-center justify-center flex-1 h-full text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition relative cursor-pointer" title="কার্ট">
        <div class="relative">
          <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <span class="absolute -top-1.5 -right-2 bg-emerald-600 text-white font-black text-[9px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 shadow-xs">
            ${cartCount}
          </span>
        </div>
        <span class="text-[10px] font-bold mt-1">কার্ট</span>
      </button>

      <!-- 4. Wishlist with live badge -->
      <a href="/favourite" class="flex flex-col items-center justify-center flex-1 h-full text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 active:scale-95 transition relative" title="পছন্দ">
        <div class="relative">
          <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          ${favCount > 0 ? `
            <span class="absolute -top-1.5 -right-2 bg-rose-500 text-white font-black text-[9px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 shadow-xs">
              ${favCount}
            </span>
          ` : ""}
        </div>
        <span class="text-[10px] font-bold mt-1">পছন্দ</span>
      </a>

      <!-- 5. Menu Toggle (Opens App Navigation Menu List) -->
      <button id="btn-bottom-menu-toggle" class="flex flex-col items-center justify-center flex-1 h-full text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 active:scale-95 transition cursor-pointer" title="মেন্যু তালিকা">
        <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <span class="text-[10px] font-bold mt-1">মেন্যু</span>
      </button>

    </nav>

    <!-- App-Style Bottom Navigation Drawer / List (Opens when clicking bottom 'মেন্যু' button) -->
    <div id="bottom-menu-overlay" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity duration-300 md:hidden"></div>

    <div id="bottom-menu-panel" class="hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-50 border-t border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 md:hidden animate-slideUp">
      
      <!-- Drawer Drag Handle & Header -->
      <div class="pt-3 pb-2 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">📋 মেন্যু ও সেবা তালিকা</span>
        </div>
        <button id="btn-bottom-menu-close" class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer">
          ✕
        </button>
      </div>

      <!-- User Profile / Auth Banner -->
      <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        ${isAuth ? `
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                ${(authStore.getUserDisplayName() || 'U').charAt(0).toUpperCase()}
              </span>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-900 dark:text-white">${authStore.getUserDisplayName()}</span>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize font-medium">${authStore.getAccountType()}</span>
              </div>
            </div>
            <a href="${accountLink}" class="bottom-menu-link text-[11px] font-bold px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">ড্যাশবোর্ড</a>
          </div>
        ` : `
          <div class="flex items-center justify-between gap-2">
            <a href="/customer/login" class="bottom-menu-link flex-1 text-center py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs">
              👤 লগইন করুন
            </a>
            <a href="/customer/register" class="bottom-menu-link flex-1 text-center py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold">
              📝 নতুন অ্যাকাউন্ট
            </a>
          </div>
        `}
      </div>

      <!-- Navigation Links List -->
      <div class="overflow-y-auto p-4 space-y-1 text-xs">
        <a href="/" class="bottom-menu-link flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
          <span class="flex items-center gap-2.5"><span>🏠</span> হোমপেজ (Home)</span>
          <span class="text-slate-400 text-xs">→</span>
        </a>
        <a href="/products" class="bottom-menu-link flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
          <span class="flex items-center gap-2.5"><span>🛍️</span> সকল পণ্য (All Products)</span>
          <span class="text-slate-400 text-xs">→</span>
        </a>
        <a href="/categories" class="bottom-menu-link flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
          <span class="flex items-center gap-2.5"><span>📂</span> ক্যাটাগরি সমূহ (Categories)</span>
          <span class="text-slate-400 text-xs">→</span>
        </a>
        <a href="/brands" class="bottom-menu-link flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
          <span class="flex items-center gap-2.5"><span>🏷️</span> ব্র্যান্ড সমূহ (Brands)</span>
          <span class="text-slate-400 text-xs">→</span>
        </a>
        <a href="/offers" class="bottom-menu-link flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
          <span class="flex items-center gap-2.5"><span>🎁</span> স্পেশাল অফার (Special Offers)</span>
          <span class="text-slate-400 text-xs">→</span>
        </a>
        <a href="/track" class="bottom-menu-link flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
          <span class="flex items-center gap-2.5"><span>🚚</span> অর্ডার ট্র্যাকিং (Track Order)</span>
          <span class="text-slate-400 text-xs">→</span>
        </a>
        <a href="/chat" class="bottom-menu-link flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-700 dark:text-slate-200 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 transition">
          <span class="flex items-center gap-2.5"><span>💬</span> লাইভ সাপোর্ট চ্যাট (Live Support)</span>
          <span class="text-slate-400 text-xs">→</span>
        </a>
        
        <div class="border-t border-slate-100 dark:border-slate-800 my-2 pt-1"></div>

        <a href="/reseller/login" class="bottom-menu-link flex items-center justify-between py-2 px-3 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 transition">
          <span class="flex items-center gap-2.5"><span>💼</span> রিসেলার হাব (Reseller Portal)</span>
          <span class="text-slate-400 text-xs">→</span>
        </a>
        <a href="/wholesaler/login" class="bottom-menu-link flex items-center justify-between py-2 px-3 rounded-xl text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-slate-800 transition">
          <span class="flex items-center gap-2.5"><span>📦</span> পাইকারি হাব (Wholesale Portal)</span>
          <span class="text-slate-400 text-xs">→</span>
        </a>

        <div class="border-t border-slate-100 dark:border-slate-800 my-2 pt-1"></div>

        <!-- Hotline Quick Contacts in Menu -->
        <div class="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 space-y-1.5">
          <div class="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">📞 কাস্টমার হেল্পলাইন</div>
          <div class="flex items-center justify-between text-xs">
            <a href="tel:01581703822" class="text-slate-800 dark:text-white font-bold flex items-center gap-1.5">
              <span>📞</span> 01581703822
            </a>
            <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="text-emerald-600 font-bold flex items-center gap-1">
              <span>💬 WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  `;
}
