/**
 * DREAM CART BD — APP-STYLE BOTTOM NAVIGATION COMPONENT (MobileNav.js)
 * Implements:
 * - 5 equal-width tabs (20% each) with guaranteed spacing:
 *   1. 🏠 হোম (Home)
 *   2. 🛍️ পণ্য (Products)
 *   3. 🛒 কার্ট (Cart with live bounce badge)
 *   4. ❤️ পছন্দ (Wishlist with live badge)
 *   5. ☰ মেন্যু (Menu Drawer toggle)
 * - Slide-up Bottom Sheet (Drawer) containing the complete organized navigation list.
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
    <!-- Native App-Style Bottom Navigation Bar (Mobile Only) -->
    <nav class="mobile-nav-bar md:hidden" aria-label="Mobile Bottom Navigation">
      
      <!-- 1. Home Tab -->
      <a href="/" class="mobile-nav-tab" title="হোম">
        <div class="mobile-nav-icon-container">
          <svg class="mobile-nav-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </div>
        <span class="mobile-nav-title">হোম</span>
      </a>

      <!-- 2. Products Tab -->
      <a href="/products" class="mobile-nav-tab" title="পণ্যসমূহ">
        <div class="mobile-nav-icon-container">
          <svg class="mobile-nav-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
        </div>
        <span class="mobile-nav-title">পণ্যসমূহ</span>
      </a>

      <!-- 3. Cart Tab with Live Badge -->
      <button id="mobile-cart-btn" class="mobile-nav-tab" title="কার্ট">
        <div class="mobile-nav-icon-container">
          <svg class="mobile-nav-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <span class="mobile-nav-pill-badge">
            ${cartCount}
          </span>
        </div>
        <span class="mobile-nav-title">কার্ট</span>
      </button>

      <!-- 4. Wishlist Tab with Live Badge -->
      <a href="/favourite" class="mobile-nav-tab" title="পছন্দ">
        <div class="mobile-nav-icon-container">
          <svg class="mobile-nav-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          ${favCount > 0 ? `
            <span class="mobile-nav-pill-badge badge-rose">
              ${favCount}
            </span>
          ` : ""}
        </div>
        <span class="mobile-nav-title">পছন্দ</span>
      </a>

      <!-- 5. Menu Drawer Toggle Tab -->
      <button id="btn-bottom-menu-toggle" class="mobile-nav-tab" style="color: #059669;" title="মেন্যু তালিকা">
        <div class="mobile-nav-icon-container">
          <svg class="mobile-nav-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </div>
        <span class="mobile-nav-title" style="color: #059669; font-weight: 800;">মেন্যু</span>
      </button>

    </nav>

    <!-- App-Style Bottom Navigation Drawer / Sheet (Opens when clicking bottom 'মেন্যু' button) -->
    <div id="bottom-menu-overlay" class="hidden md:hidden"></div>

    <div id="bottom-menu-panel" class="hidden md:hidden">
      
      <!-- Drawer Drag Handle & Header -->
      <div style="padding: 12px 18px 8px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 10px; height: 10px; border-radius: 9999px; background: #059669;"></div>
          <span style="font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a;" class="dark:text-white">মেন্যু ও সেবা তালিকা</span>
        </div>
        <button id="btn-bottom-menu-close" style="width: 28px; height: 28px; border-radius: 9999px; background: #f1f5f9; color: #475569; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; cursor: pointer; border: none;">
          ✕
        </button>
      </div>

      <!-- User Profile / Auth Banner -->
      <div style="padding: 12px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;" class="dark:bg-slate-800/60 dark:border-slate-800">
        ${isAuth ? `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="width: 36px; height: 36px; border-radius: 9999px; background: #059669; color: #fff; font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                ${(authStore.getUserDisplayName() || 'U').charAt(0).toUpperCase()}
              </span>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 13px; font-weight: 800; color: #0f172a;" class="dark:text-white">${authStore.getUserDisplayName()}</span>
                <span style="font-size: 11px; color: #059669; font-weight: 600; text-transform: capitalize;">${authStore.getAccountType()}</span>
              </div>
            </div>
            <a href="${accountLink}" class="bottom-menu-link" style="font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 10px; background: #ecfdf5; color: #059669; text-decoration: none;">ড্যাশবোর্ড</a>
          </div>
        ` : `
          <div style="display: flex; gap: 8px;">
            <a href="/customer/login" class="bottom-menu-link" style="flex: 1; text-align: center; padding: 8px; border-radius: 12px; background: #059669; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none;">
              👤 লগইন করুন
            </a>
            <a href="/customer/register" class="bottom-menu-link" style="flex: 1; text-align: center; padding: 8px; border-radius: 12px; background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b; font-size: 12px; font-weight: 700; text-decoration: none;" class="dark:bg-slate-800 dark:text-white dark:border-slate-700">
              📝 নতুন অ্যাকাউন্ট
            </a>
          </div>
        `}
      </div>

      <!-- Navigation Links List -->
      <div style="overflow-y: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 4px; font-size: 13px;">
        <a href="/" class="bottom-menu-link" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; font-weight: 700; color: #334155; text-decoration: none; transition: background 0.15s;" class="dark:text-slate-200">
          <span style="display: flex; align-items: center; gap: 10px;"><span>🏠</span> হোমপেজ (Home)</span>
          <span style="color: #94a3b8;">→</span>
        </a>
        <a href="/products" class="bottom-menu-link" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; font-weight: 700; color: #334155; text-decoration: none; transition: background 0.15s;" class="dark:text-slate-200">
          <span style="display: flex; align-items: center; gap: 10px;"><span>🛍️</span> সকল পণ্য (All Products)</span>
          <span style="color: #94a3b8;">→</span>
        </a>
        <a href="/categories" class="bottom-menu-link" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; font-weight: 700; color: #334155; text-decoration: none; transition: background 0.15s;" class="dark:text-slate-200">
          <span style="display: flex; align-items: center; gap: 10px;"><span>📂</span> ক্যাটাগরি সমূহ (Categories)</span>
          <span style="color: #94a3b8;">→</span>
        </a>
        <a href="/brands" class="bottom-menu-link" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; font-weight: 700; color: #334155; text-decoration: none; transition: background 0.15s;" class="dark:text-slate-200">
          <span style="display: flex; align-items: center; gap: 10px;"><span>🏷️</span> ব্র্যান্ড সমূহ (Brands)</span>
          <span style="color: #94a3b8;">→</span>
        </a>
        <a href="/offers" class="bottom-menu-link" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; font-weight: 700; color: #334155; text-decoration: none; transition: background 0.15s;" class="dark:text-slate-200">
          <span style="display: flex; align-items: center; gap: 10px;"><span>🎁</span> স্পেশাল অফার (Special Offers)</span>
          <span style="color: #94a3b8;">→</span>
        </a>
        <a href="/track" class="bottom-menu-link" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; font-weight: 700; color: #334155; text-decoration: none; transition: background 0.15s;" class="dark:text-slate-200">
          <span style="display: flex; align-items: center; gap: 10px;"><span>🚚</span> অর্ডার ট্র্যাকিং (Track Order)</span>
          <span style="color: #94a3b8;">→</span>
        </a>
        <a href="/chat" class="bottom-menu-link" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; font-weight: 700; color: #334155; text-decoration: none; transition: background 0.15s;" class="dark:text-slate-200">
          <span style="display: flex; align-items: center; gap: 10px;"><span>💬</span> লাইভ সাপোর্ট চ্যাট (Live Support)</span>
          <span style="color: #94a3b8;">→</span>
        </a>
        
        <div style="border-top: 1px solid #e2e8f0; margin: 6px 0;" class="dark:border-slate-800"></div>

        <a href="/reseller/login" class="bottom-menu-link" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; font-weight: 700; color: #4f46e5; text-decoration: none;">
          <span style="display: flex; align-items: center; gap: 10px;"><span>💼</span> রিসেলার হাব (Reseller Portal)</span>
          <span style="color: #94a3b8;">→</span>
        </a>
        <a href="/wholesaler/login" class="bottom-menu-link" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; font-weight: 700; color: #d97706; text-decoration: none;">
          <span style="display: flex; align-items: center; gap: 10px;"><span>📦</span> পাইকারি হাব (Wholesale Portal)</span>
          <span style="color: #94a3b8;">→</span>
        </a>

        <div style="border-top: 1px solid #e2e8f0; margin: 6px 0;" class="dark:border-slate-800"></div>

        <!-- Hotline Quick Contacts in Menu -->
        <div style="padding: 10px 12px; border-radius: 14px; background: #ecfdf5; border: 1px solid rgba(16, 185, 129, 0.2);" class="dark:bg-slate-800/70 dark:border-slate-700">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #059669; margin-bottom: 6px;">📞 কাস্টমার হেল্পলাইন</div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
            <a href="tel:01581703822" style="color: #0f172a; font-weight: 800; display: flex; align-items: center; gap: 6px; text-decoration: none;" class="dark:text-white">
              <span>📞</span> 01581703822
            </a>
            <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 800; display: flex; align-items: center; gap: 4px; text-decoration: none;">
              <span>💬 WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  `;
}
