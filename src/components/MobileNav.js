/**
 * DREAM CART BD — MOBILE BOTTOM NAVIGATION
 */

import { cartStore } from '../store/cartStore.js';

export function renderMobileNav() {
  const count = cartStore.getCount();
  return `
    <nav class="mobile-nav-bar">
      <a href="#/" class="flex flex-col items-center justify-center text-slate-600 hover:text-emerald-600 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        <span class="text-[10px] font-medium mt-0.5">Home</span>
      </a>
      <a href="#/shop" class="flex flex-col items-center justify-center text-slate-600 hover:text-emerald-600 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        <span class="text-[10px] font-medium mt-0.5">Shop</span>
      </a>
      <button id="mobile-cart-btn" class="flex flex-col items-center justify-center text-emerald-600 transition relative">
        <div class="relative">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          <span class="absolute -top-1.5 -right-2 bg-emerald-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
            ${count}
          </span>
        </div>
        <span class="text-[10px] font-bold mt-0.5">Cart</span>
      </button>
      <a href="#/track" class="flex flex-col items-center justify-center text-slate-600 hover:text-emerald-600 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
        <span class="text-[10px] font-medium mt-0.5">Track</span>
      </a>
      <a href="#/admin" class="flex flex-col items-center justify-center text-slate-600 hover:text-emerald-600 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        <span class="text-[10px] font-medium mt-0.5">Admin</span>
      </a>
    </nav>
  `;
}
