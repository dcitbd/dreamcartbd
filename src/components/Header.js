/**
 * DREAM CART BD — HEADER COMPONENT
 * Luxury brand header with official store logo, announcement bar, live search, categories menu, cart counter.
 */

import { cartStore } from '../store/cartStore.js';
import { authStore } from '../store/authStore.js';

export function renderHeader() {
  const cartCount = cartStore.getCount();
  const user = authStore.user;

  return `
    <!-- Top Announcement Bar with Notice & Offers -->
    <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white text-xs py-2 px-4 shadow-sm">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div class="flex items-center gap-2 font-medium text-center sm:text-left text-[11px] sm:text-xs">
          <span class="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase shadow-xs">অফার</span>
          <span class="font-medium">
            ৳২,০০০ বা তার বেশি অর্ডারে <strong class="text-amber-300 font-bold">ফ্রি শিপিং!</strong> | অনলাইনে পেমেন্ট করলে <strong class="text-emerald-300 font-bold">৫% ডিসকাউন্ট</strong> | ক্যাশ অন ডেলিভারি (COD)
          </span>
        </div>
        <div class="flex items-center gap-3 text-[11px] sm:text-xs text-emerald-100 flex-shrink-0">
          <a href="https://wa.me/8801581703822" target="_blank" class="hover:text-white transition flex items-center gap-1 font-semibold text-emerald-200">
            <span>💬</span> 01581703822 (WhatsApp)
          </a>
          <span>|</span>
          <a href="#/offers" class="hover:text-white transition flex items-center gap-1">
            <span>🎁</span> অফারসমূহ
          </a>
          <span>|</span>
          <a href="#/contact" class="hover:text-white transition flex items-center gap-1">
            <span>📍</span> যোগাযোগ
          </a>
        </div>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <header class="sticky top-0 z-50 glass-nav transition-all border-b border-slate-200/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        <!-- Logo & Store Name -->
        <a href="#/" class="flex items-center gap-2.5 group flex-shrink-0">
          <div class="w-11 h-11 rounded-xl bg-white p-1 border border-slate-200 shadow-md group-hover:shadow-emerald-500/20 group-hover:scale-105 transition flex items-center justify-center overflow-hidden">
            <img 
              src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
              alt="Dream Cart BD Logo" 
              class="w-full h-full object-contain rounded-lg"
              onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
            />
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-1.5">
              <span class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition">Dream Cart <span class="text-emerald-600">BD</span></span>
            </div>
            <span class="text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">Smart Digital Commerce</span>
          </div>
        </a>

        <!-- Search Bar -->
        <div class="hidden md:flex flex-1 max-w-xl relative">
          <input 
            type="text" 
            id="global-search-input"
            placeholder="স্মার্টওয়াচ, অর্গানিক পাউডার, এলইডি লাইট বা পণ্য সার্চ করুন..." 
            class="w-full pl-11 pr-24 py-2.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white rounded-full border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-xs sm:text-sm outline-none transition"
          />
          <svg class="w-5 h-5 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <button id="global-search-btn" class="absolute right-1.5 top-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-sm">
            Search
          </button>
        </div>

        <!-- Action Items -->
        <div class="flex items-center gap-2.5 sm:gap-3">
          
          <!-- Fraud Check Tool button for quick demo/access -->
          <button id="btn-open-fraud-tool" class="hidden lg:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-semibold transition" title="Check Customer Courier Success Rate">
            <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Fraud Checker
          </button>

          <!-- Contact Link -->
          <a href="#/contact" class="hidden sm:flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold transition">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            Contact
          </a>

          <!-- Admin Portal Link -->
          <a href="#/admin" class="hidden sm:flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold transition">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Admin
          </a>

          <!-- Cart Trigger Button -->
          <button id="btn-open-cart" class="relative p-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition flex items-center justify-center" title="View Cart">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <span id="header-cart-badge" class="absolute -top-1 -right-1 bg-emerald-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              ${cartCount}
            </span>
          </button>

        </div>
      </div>

      <!-- Categories & Navigation Sub-header -->
      <nav class="border-t border-slate-100 bg-white/70 hidden sm:block">
        <div class="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto py-2 text-xs font-semibold text-slate-700">
          <a href="#/shop" class="hover:text-emerald-600 flex items-center gap-1 transition text-emerald-700 font-bold">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            All Products
          </a>
          <a href="#/shop?cat=CAT-SMARTWATCH" class="hover:text-emerald-600 transition">Smartwatches</a>
          <a href="#/shop?cat=CAT-ORGANIC" class="hover:text-emerald-600 transition">Organic & Health</a>
          <a href="#/shop?cat=CAT-ELECTRONICS" class="hover:text-emerald-600 transition">Tools & LED Lights</a>
          <a href="#/offers" class="hover:text-emerald-600 text-amber-600 font-bold transition flex items-center gap-1">
            <span>🔥</span> Offers & Deals
          </a>
          <a href="#/partner" class="hover:text-emerald-600 text-indigo-700 font-bold transition">Partner Hub (Seller / Reseller)</a>
          <a href="#/contact" class="hover:text-emerald-600 transition">Store Address & Contact</a>
          <a href="#/track" class="hover:text-emerald-600 transition ml-auto flex items-center gap-1 text-slate-500">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Order Tracking
          </a>
        </div>
      </nav>
    </header>
  `;
}
