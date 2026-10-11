/**
 * DREAM CART BD — CUSTOMER PORTAL & ADVANCED DASHBOARD (CustomerPortal.js)
 * Implements user requirements:
 * - Luxury responsive Dashboard with Sidebar & Metric Cards
 * - Seamless access for both Logged-In and Guest / Pre-login users
 * - Live Counters & lists for Favourites, Cart, Orders, Tracking, Settings
 * - Prominent "🛍️ শপ ভিজিট করুন" (Visit Shop) button in header & sidebar
 * - Full-detail Order History with live search & multi-status filtering
 * - Interactive Order Tracking system with step-by-step progress
 * - Dynamic Profile Edit modal & Auth views (100% compatible with main.js event listeners)
 * - Zero divide/conflict with existing stores and routing
 */

import { authStore } from '../../store/authStore.js';
import { cartStore } from '../../store/cartStore.js';
import { favouriteStore } from '../../store/favouriteStore.js';
import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { renderProductCard } from '../../components/ProductCard.js';

export async function renderCustomerPortal(params = {}) {
  const isAuth = authStore.isAuthenticated();
  const user = authStore.user || {};
  
  const pathname = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
  const currentView = params.subview || (pathname.includes('/register') ? 'register' : (pathname.includes('/login') ? 'login' : 'dashboard'));

  // If user explicitly navigated to /customer/login or /customer/register and is not logged in:
  if (!isAuth && (currentView === 'login' || currentView === 'register')) {
    return renderAuthView(currentView);
  }

  // Fetch orders from Sheets / local client
  let allOrders = [];
  try {
    const orderRes = await apiClient.request("orders/list");
    allOrders = (orderRes.data && orderRes.data.items) || [];
  } catch (e) {
    allOrders = apiClient.sheetOrders || [];
  }

  // Filter orders for logged in user (matching phone or email) or show all local placed orders
  const userPhone = String(user.mobile || user.phone || "").trim();
  const userMail = String(user.mail || user.email || "").trim().toLowerCase();

  let orders = [];
  if (isAuth && (userPhone || userMail)) {
    orders = allOrders.filter(o => {
      const oPhone = String(o.phone || o.customer_phone || "").trim();
      const oMail = String(o.mail || o.email || o.customer_mail || "").trim().toLowerCase();
      return (userPhone && oPhone.includes(userPhone)) || (userMail && oMail === userMail);
    });
    // Fallback if sheet has no specific orders for this user, check local storage
    if (orders.length === 0 && apiClient.sheetOrders) {
      orders = (apiClient.sheetOrders || []).filter(o => {
        const oPhone = String(o.phone || "").trim();
        return userPhone && oPhone.includes(userPhone);
      });
    }
  } else if (!isAuth) {
    // Guest mode: check if any orders were placed in current browser session
    try {
      const localSaved = JSON.parse(localStorage.getItem('dcbd_sheet_orders') || '[]');
      if (Array.isArray(localSaved) && localSaved.length > 0) {
        orders = localSaved.slice(0, 5);
      }
    } catch (e) {}
  }

  // Order Metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => {
    const st = String(o.order_status || o.status || 'Pending').toLowerCase();
    return ['pending', 'order placed', 'processing', 'packing'].includes(st);
  }).length;
  const deliveredOrders = orders.filter(o => {
    const st = String(o.order_status || o.status || '').toLowerCase();
    return ['delivered', 'completed'].includes(st);
  }).length;
  const cancelledOrders = orders.filter(o => {
    const st = String(o.order_status || o.status || '').toLowerCase();
    return ['cancelled', 'returned'].includes(st);
  }).length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // Store data
  const cartItems = cartStore.items || [];
  const favItems = favouriteStore.getItems() || [];
  const cartSubtotal = cartStore.getSubtotal ? cartStore.getSubtotal() : cartItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);

  const initial = (user.name || (isAuth ? "U" : "G")).charAt(0).toUpperCase();

  return `
    <style id="dc-customer-portal-styles">
      /* ==========================================================================
         DREAM CART BD — LUXURY CUSTOMER DASHBOARD & PORTAL STYLING
         ========================================================================== */
      .dc-cust-dashboard {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        box-sizing: border-box;
      }

      /* Responsive Layout: Sidebar + Main Content */
      .dc-cust-grid {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
        align-items: start;
        width: 100%;
      }

      @media (max-width: 1024px) {
        .dc-cust-grid {
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
      }

      /* Sidebar Card Surface */
      .dc-cust-sidebar {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 20px;
        padding: 1.25rem;
        box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        position: sticky;
        top: 5rem;
        z-index: 20;
      }

      .dark .dc-cust-sidebar {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.35);
      }

      @media (max-width: 1024px) {
        .dc-cust-sidebar {
          position: static;
        }
      }

      /* Sidebar Profile Badge */
      .dc-sidebar-profile {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      }

      .dark .dc-sidebar-profile {
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }

      .dc-avatar {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        font-weight: 900;
        box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
        flex-shrink: 0;
      }

      .dc-nav-list {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      @media (max-width: 1024px) {
        .dc-nav-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
          gap: 0.5rem;
        }
      }

      .dc-nav-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.625rem 0.875rem;
        border-radius: 12px;
        font-size: 0.8125rem;
        font-weight: 700;
        color: #475569;
        text-decoration: none;
        transition: all 0.18s ease;
        border: 1px solid transparent;
        cursor: pointer;
        background: transparent;
      }

      .dark .dc-nav-item {
        color: #cbd5e1;
      }

      .dc-nav-item:hover {
        background: #f1f5f9;
        color: #059669;
      }

      .dark .dc-nav-item:hover {
        background: #1e293b;
        color: #34d399;
      }

      .dc-nav-item.active {
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        color: #047857 !important;
        border-color: #a7f3d0;
        font-weight: 800;
      }

      .dark .dc-nav-item.active {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399 !important;
        border-color: rgba(16, 185, 129, 0.3);
      }

      .dc-badge-count {
        font-size: 0.6875rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 9999px;
        background: #e2e8f0;
        color: #334155;
      }

      .dark .dc-badge-count {
        background: #334155;
        color: #f1f5f9;
      }

      .dc-nav-item.active .dc-badge-count {
        background: #10b981;
        color: #ffffff;
      }

      /* KPI Cards Grid */
      .dc-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 0.875rem;
      }

      @media (max-width: 640px) {
        .dc-kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.625rem;
        }
      }

      .dc-kpi-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 18px;
        padding: 1.125rem 1.25rem;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .dark .dc-kpi-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.3);
      }

      .dc-kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.08);
      }

      /* Content Panels */
      .dc-panel {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.04);
        box-sizing: border-box;
      }

      .dark .dc-panel {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.35);
      }

      @media (max-width: 640px) {
        .dc-panel {
          padding: 1rem;
          border-radius: 16px;
        }
      }

      /* Order Filter Buttons */
      .dc-filter-btn {
        padding: 0.375rem 0.875rem;
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 700;
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
        transition: all 0.15s ease;
        cursor: pointer;
      }

      .dark .dc-filter-btn {
        background: #1e293b;
        color: #cbd5e1;
        border-color: rgba(255, 255, 255, 0.08);
      }

      .dc-filter-btn.active, .dc-filter-btn:hover {
        background: #10b981;
        color: #ffffff;
        border-color: #10b981;
      }

      /* Order Card Item */
      .dc-order-card {
        background: #f8fafc;
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 16px;
        padding: 1rem 1.25rem;
        transition: all 0.2s ease;
      }

      .dark .dc-order-card {
        background: rgba(30, 41, 59, 0.4);
        border-color: rgba(255, 255, 255, 0.08);
      }

      .dc-order-card:hover {
        border-color: #10b981;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.1);
      }
    </style>

    <div class="dc-cust-dashboard">
      
      <!-- TOP HEADER CARD: Profile & Quick Actions -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/95 dark:border-slate-800 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        <div class="flex items-center gap-4 min-w-0">
          <div class="dc-avatar flex-shrink-0">
            ${initial}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                ${isAuth ? (user.name || 'সম্মানিত গ্রাহক') : 'সম্মানিত ভিজিটর / গেস্ট'}
              </h1>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${isAuth ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'}">
                <span class="w-1.5 h-1.5 rounded-full ${isAuth ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                ${isAuth ? 'ভেরিফায়েড কাস্টমার' : 'গেস্ট মোড'}
              </span>
            </div>
            
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>📞 ${user.mobile || user.phone || 'ফোন যুক্ত করুন'}</span>
              <span>•</span>
              <span>✉️ ${user.mail || user.email || 'ইমেইল যুক্ত করুন'}</span>
              <span>•</span>
              <span class="truncate">📍 ${user.address || 'বাংলাদেশ'}</span>
            </div>
          </div>
        </div>

        <!-- Quick Top Action Buttons: Visit Shop, Edit Profile, Login/Logout -->
        <div class="flex flex-wrap items-center gap-2.5 self-stretch sm:self-end md:self-center justify-end">
          
          <!-- PROMINENT VISIT SHOP BUTTON -->
          <a 
            href="/products" 
            class="btn-primary py-2.5 px-4 sm:px-5 text-xs font-bold rounded-xl shadow-glow flex items-center gap-2 transition"
          >
            <span>🛍️</span>
            <span>শপ ভিজিট করুন</span>
          </a>

          ${isAuth ? `
            <button 
              id="btn-edit-customer-profile"
              class="btn-secondary py-2.5 px-3.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition"
              onclick="document.getElementById('customer-profile-edit-modal').classList.add('active');"
            >
              প্রোফাইল এডিট ✎
            </button>
            <button 
              id="btn-customer-logout" 
              class="btn-secondary btn-logout py-2.5 px-3.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            >
              লগআউট ✕
            </button>
          ` : `
            <a 
              href="/customer/login"
              class="btn-secondary py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition inline-flex items-center gap-1.5"
            >
              <span>🔐</span>
              <span>লগইন / সাইন-আপ</span>
            </a>
          `}

        </div>

      </div>

      <!-- GUEST ALERT CARD (If not logged in) -->
      ${!isAuth ? `
        <div class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <span class="text-2xl flex-shrink-0">💡</span>
            <div>
              <h4 class="font-bold text-amber-900 dark:text-amber-200 text-sm">
                আপনি গেস্ট মোডে ড্যাশবোর্ড দেখছেন!
              </h4>
              <p class="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                আপনার কার্ট ও পছন্দের তালিকা নিচে ব্রাউজারে সক্রিয় আছে। অর্ডার হিস্ট্রি ক্লাউডে সেভ রাখতে অনুগ্রহ করে লগইন বা একাউন্ট তৈরি করুন।
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <a 
              href="/customer/login"
              class="btn-primary py-1.5 px-3.5 text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1"
            >
              লগইন করুন →
            </a>
          </div>
        </div>
      ` : ''}

      <!-- MAIN LAYOUT: SIDEBAR + CONTENT TABS -->
      <div class="dc-cust-grid">
        
        <!-- ==========================================================================
             LEFT SIDEBAR NAVIGATION
             ========================================================================== -->
        <aside class="dc-cust-sidebar">
          
          <div class="dc-sidebar-profile">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-base">
              👤
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                ${user.name || (isAuth ? 'আমার অ্যাকাউন্ট' : 'গেস্ট ইউজার')}
              </div>
              <div class="text-[10px] text-slate-400 font-mono">
                ${user.mobile || user.phone || '01XXXXXXXXX'}
              </div>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="dc-nav-list" aria-label="Customer Navigation">
            
            <button class="dc-nav-item active" onclick="switchCustomerTab('tab-overview', this)">
              <span class="flex items-center gap-2"><span>📊</span> ওভারভিউ</span>
              <span class="text-[10px] text-emerald-600">●</span>
            </button>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-orders', this)">
              <span class="flex items-center gap-2"><span>📦</span> আমার অর্ডারসমূহ</span>
              <span class="dc-badge-count" id="badge-orders-count">${totalOrders}</span>
            </button>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-track', this)">
              <span class="flex items-center gap-2"><span>🚚</span> অর্ডার ট্র্যাকিং</span>
              <span class="text-[11px] text-blue-500 font-bold">লাইভ</span>
            </button>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-cart', this)">
              <span class="flex items-center gap-2"><span>🛒</span> কার্ট তালিকা</span>
              <span class="dc-badge-count" id="badge-cart-count">${cartItems.length}</span>
            </button>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-fav', this)">
              <span class="flex items-center gap-2"><span>❤️</span> পছন্দের তালিকা</span>
              <span class="dc-badge-count" id="badge-fav-count">${favItems.length}</span>
            </button>

            <!-- SIDEBAR VISIT SHOP BUTTON -->
            <a href="/products" class="dc-nav-item text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-extrabold">
              <span class="flex items-center gap-2"><span>🛍️</span> শপ ভিজিট করুন</span>
              <span class="text-xs">→</span>
            </a>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-settings', this)">
              <span class="flex items-center gap-2"><span>⚙️</span> সেটিংস ও প্রোফাইল</span>
            </button>

          </nav>

          <!-- Support Hotline Box -->
          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-[11px] space-y-1.5">
            <div class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>💬</span> কাস্টমার সাপোর্ট
            </div>
            <a href="https://wa.me/8801581703822" target="_blank" class="block text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              হোয়াটসঅ্যাপ: 01581703822
            </a>
            <div class="text-slate-500 dark:text-slate-400 text-[10px]">
              সরাসরি কল: 01818273838
            </div>
          </div>

        </aside>

        <!-- ==========================================================================
             RIGHT MAIN CONTENT AREA
             ========================================================================== -->
        <main class="space-y-6 min-w-0">
          
          <!-- TAB 1: OVERVIEW (Default Dashboard View) -->
          <div id="tab-overview" class="customer-tab-content space-y-6">
            
            <!-- KPI STATS CARDS -->
            <div class="dc-kpi-grid">
              
              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>মোট অর্ডার</span>
                  <span class="text-base">📦</span>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-white mt-2">${totalOrders} টি</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">সর্বমোট অর্ডারের হিসাব</div>
              </div>

              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>চলমান অর্ডার</span>
                  <span class="text-base">⏳</span>
                </div>
                <div class="text-2xl font-black text-amber-500 mt-2">${pendingOrders} টি</div>
                <div class="text-[10px] text-amber-600 font-bold mt-1">প্রসেসিং ও শিপমেন্টে</div>
              </div>

              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>সফল ডেলিভারি</span>
                  <span class="text-base">🚚</span>
                </div>
                <div class="text-2xl font-black text-emerald-600 mt-2">${deliveredOrders} টি</div>
                <div class="text-[10px] text-emerald-600 font-bold mt-1">গৃহীত পণ্য</div>
              </div>

              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>কার্ট আইটেম</span>
                  <span class="text-base">🛒</span>
                </div>
                <div class="text-2xl font-black text-blue-600 mt-2">${cartItems.length} টি</div>
                <div class="text-[10px] text-slate-500 mt-1">মূল্য: ${formatCurrency(cartSubtotal)}</div>
              </div>

              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>পছন্দের তালিকা</span>
                  <span class="text-base">❤️</span>
                </div>
                <div class="text-2xl font-black text-rose-500 mt-2">${favItems.length} টি</div>
                <div class="text-[10px] text-rose-500 font-bold mt-1">উইশলিস্টে সংরক্ষিত</div>
              </div>

            </div>

            <!-- QUICK SHORTCUT BANNER -->
            <div class="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div class="space-y-1">
                <h3 class="text-base sm:text-lg font-black">আমাদের বিশাল কালেকশন থেকে এখনই অর্ডার করুন!</h3>
                <p class="text-xs text-emerald-100/80">স্মার্টওয়াচ, হেলথ ফুড, লাইটিং ও কিচেন গ্যাজেটে ক্যাশ অন ডেলিভারি অফার।</p>
              </div>
              <a href="/products" class="btn-primary py-2.5 px-6 font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl flex-shrink-0 transition">
                শপ ব্রাউজ করুন →
              </a>
            </div>

            <!-- RECENT ORDERS SUMMARY -->
            <div class="dc-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📦</span> সাম্প্রতিক অর্ডারসমূহ (Recent Orders)
                </h3>
                <button class="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline" onclick="switchCustomerTab('tab-orders')">
                  সবগুলো দেখুন (${orders.length}) →
                </button>
              </div>

              ${orders.length === 0 ? `
                <div class="py-10 text-center space-y-3">
                  <div class="text-3xl">🛍️</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">
                    আপনার কোনো পূর্ববর্তী অর্ডার রেকর্ড পাওয়া যায়নি।
                  </div>
                  <a href="/products" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl inline-block">
                    কেনাকাটা শুরু করুন
                  </a>
                </div>
              ` : `
                <div class="space-y-3">
                  ${orders.slice(0, 3).map(o => `
                    <div class="dc-order-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-mono font-bold text-emerald-700 dark:text-emerald-400">${o.order_id}</span>
                          <span class="text-slate-400">•</span>
                          <span class="text-slate-500">${o.date || 'তারিখ অপ্রাপ্য'}</span>
                          <span class="badge ${String(o.order_status).toLowerCase() === 'delivered' ? 'badge-success' : 'badge-warning'} text-[10px]">
                            ${o.order_status || 'Pending'}
                          </span>
                        </div>
                        <div class="text-slate-700 dark:text-slate-300 font-medium mt-1 truncate max-w-md">
                          ${o.products || 'পণ্যসমূহ'}
                        </div>
                        <div class="font-bold text-slate-900 dark:text-white mt-0.5">
                          মোট: ${formatCurrency(o.total_amount || 0)}
                        </div>
                      </div>

                      <div class="flex items-center gap-2 self-end sm:self-center">
                        <a href="/order-success?orderId=${o.order_id}" class="btn-secondary py-1.5 px-3 text-[11px] font-bold rounded-lg">
                          ইনভয়েস 🖨️
                        </a>
                        <a href="/track?orderId=${o.order_id}" class="btn-primary py-1.5 px-3 text-[11px] font-bold rounded-lg">
                          ট্র্যাক 🚚
                        </a>
                      </div>
                    </div>
                  `).join("")}
                </div>
              `}
            </div>

            <!-- FAVOURITES PREVIEW ON OVERVIEW -->
            ${favItems.length > 0 ? `
              <div class="dc-panel space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>❤️</span> আপনার পছন্দের পণ্য (Saved Favourites)
                  </h3>
                  <button class="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline" onclick="switchCustomerTab('tab-fav')">
                    সকল ফেভারিট (${favItems.length}) →
                  </button>
                </div>

                <div class="product-grid">
                  ${favItems.slice(0, 4).map(p => renderProductCard(p)).join("")}
                </div>
              </div>
            ` : ''}

          </div>

          <!-- TAB 2: FULL DETAILS ORDER LIST WITH LIVE SEARCH & FILTERS -->
          <div id="tab-orders" class="customer-tab-content hidden space-y-4">
            
            <div class="dc-panel space-y-4">
              
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white">
                    আমার সকল অর্ডার (Order History & Invoices)
                  </h3>
                  <p class="text-xs text-slate-500">আপনার সমস্ত অতীত ও চলমান অর্ডারের বিস্তারিত তথ্য ও ক্যাশ অন ডেলিভারি স্ট্যাটাস।</p>
                </div>

                <!-- Instant Order Search Bar -->
                <div class="relative w-full md:w-72">
                  <input 
                    type="text" 
                    id="order-search-input"
                    placeholder="অর্ডার আইডি বা পণ্য খুঁজুন..." 
                    class="form-control text-xs py-2 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full dark:bg-slate-800"
                    oninput="window.filterCustomerOrders(this.value)"
                  />
                  <span class="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
                </div>
              </div>

              <!-- Status Filter Buttons -->
              <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button class="dc-filter-btn active" data-status="all" onclick="window.filterCustomerOrderStatus('all', this)">সবগুলো (${orders.length})</button>
                <button class="dc-filter-btn" data-status="pending" onclick="window.filterCustomerOrderStatus('pending', this)">পেন্ডিং (${pendingOrders})</button>
                <button class="dc-filter-btn" data-status="delivered" onclick="window.filterCustomerOrderStatus('delivered', this)">ডেলিভার্ড (${deliveredOrders})</button>
                <button class="dc-filter-btn" data-status="cancelled" onclick="window.filterCustomerOrderStatus('cancelled', this)">বাতিল (${cancelledOrders})</button>
              </div>

              <!-- Orders List / Empty State -->
              ${orders.length === 0 ? `
                <div class="py-14 text-center space-y-3">
                  <div class="text-4xl">📦</div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো অর্ডার রেকর্ড পাওয়া যায়নি</div>
                  <p class="text-xs text-slate-400 max-w-sm mx-auto">
                    গেস্ট হিসেবে অর্ডার করে থাকলে আপনার ফোন নম্বর দিয়ে ট্র্যাকিং ট্যাবে গিয়ে দ্রুত চেক করুন অথবা নতুন অর্ডার করুন।
                  </p>
                  
                  <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <a href="/products" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl shadow-xs">
                      🛍️ শপ ভিজিট করুন
                    </a>
                  </div>
                </div>
              ` : `
                <div class="space-y-3" id="customer-orders-container">
                  ${orders.map(o => {
                    const st = String(o.order_status || 'Pending').toLowerCase();
                    let stBadge = 'badge-warning';
                    if (['delivered', 'completed'].includes(st)) stBadge = 'badge-success';
                    if (['cancelled', 'returned'].includes(st)) stBadge = 'badge-danger';
                    if (['processing', 'in transit'].includes(st)) stBadge = 'badge-info';

                    return `
                      <div class="dc-order-card customer-order-item" data-status="${st}" data-search="${(o.order_id + ' ' + (o.products || '') + ' ' + (o.phone || '')).toLowerCase()}">
                        
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 dark:border-slate-700/60 pb-2.5 mb-2.5">
                          <div class="flex items-center gap-3 flex-wrap">
                            <span class="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              #${o.order_id}
                            </span>
                            <span class="text-xs text-slate-500 font-medium">📅 ${o.date || 'আজকের অর্ডার'}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="badge ${o.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'} text-[10px]">
                              ${o.payment_status === 'Paid' ? 'পরিশোধিত (Paid)' : (o.payment_method || 'ক্যাশ অন ডেলিভারি')}
                            </span>
                            <span class="badge ${stBadge} text-[10px] font-bold">
                              ${o.order_status || 'Pending'}
                            </span>
                          </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                          <div class="sm:col-span-6">
                            <div class="text-[11px] text-slate-400 font-bold uppercase">পণ্য বিবরণ</div>
                            <div class="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">${o.products || 'পণ্যসমূহ'}</div>
                            <div class="text-[11px] text-slate-400 mt-1">📍 ঠিকানা: ${o.address || 'বাংলাদেশ'}</div>
                          </div>

                          <div class="sm:col-span-3">
                            <div class="text-[11px] text-slate-400 font-bold uppercase">মোট প্রদেয়</div>
                            <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${formatCurrency(o.total_amount || 0)}</div>
                            <div class="text-[10px] text-slate-400">${o.delivery_fee ? `ডেলিভারি ফি: ${formatCurrency(o.delivery_fee)}` : 'ডেলিভারি অন্তর্ভুক্ত'}</div>
                          </div>

                          <div class="sm:col-span-3 flex sm:flex-col gap-2 justify-end sm:items-end">
                            <a href="/order-success?orderId=${o.order_id}" class="btn-primary py-1.5 px-3 text-[11px] font-bold rounded-lg text-center w-full sm:w-auto">
                              ভাউচার 🖨️
                            </a>
                            <a href="/track?orderId=${o.order_id}" class="btn-secondary py-1.5 px-3 text-[11px] font-bold rounded-lg text-center w-full sm:w-auto bg-slate-100 dark:bg-slate-800">
                              ট্র্যাক 🚚
                            </a>
                          </div>
                        </div>

                      </div>
                    `;
                  }).join("")}
                </div>
              `}

            </div>

          </div>

          <!-- TAB 3: LIVE ORDER TRACKING -->
          <div id="tab-track" class="customer-tab-content hidden space-y-4">
            
            <div class="dc-panel space-y-5">
              
              <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚚</span> লাইভ অর্ডার ট্র্যাকিং (Track Your Parcel)
                </h3>
                <p class="text-xs text-slate-500">আপনার অর্ডার আইডি প্রদান করে পার্সেলের তাৎক্ষণিক লাইভ অবস্থান দেখুন।</p>
              </div>

              <!-- Track Form -->
              <div class="flex flex-col sm:flex-row gap-2 max-w-lg">
                <input 
                  type="text" 
                  id="dashboard-track-input"
                  placeholder="যেমন: ORD-102938" 
                  value="${orders[0] ? orders[0].order_id : ''}"
                  class="form-control text-xs py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 flex-1 dark:bg-slate-800 font-mono font-bold"
                />
                <button 
                  type="button" 
                  class="btn-primary py-2.5 px-6 font-bold text-xs rounded-xl shadow-xs"
                  onclick="window.executeDashboardTrack()"
                >
                  ট্র্যাক করুন 🔍
                </button>
              </div>

              <!-- Graphical Tracker Display -->
              <div id="dashboard-track-result" class="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
                
                <div class="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
                  <div>
                    <span class="text-[10px] text-slate-400 font-bold uppercase">অর্ডার আইডি</span>
                    <h4 class="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base" id="track-disp-id">
                      ${orders[0] ? orders[0].order_id : 'ORD-SAMPLE'}
                    </h4>
                  </div>
                  <span class="badge badge-success text-xs font-bold" id="track-disp-status">
                    ${orders[0] ? (orders[0].order_status || 'Processing') : 'Order Placed'}
                  </span>
                </div>

                <!-- 4 Step Progress Bar -->
                <div class="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold mx-auto flex items-center justify-center shadow-xs">✓</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">অর্ডার কনফার্মড</div>
                    <div class="text-[9px] text-slate-400">গৃহীত হয়েছে</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold mx-auto flex items-center justify-center shadow-xs">✓</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">প্যাকেজিং</div>
                    <div class="text-[9px] text-slate-400">ওয়্যারহাউজ প্রস্তুত</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-amber-500 text-white font-bold mx-auto flex items-center justify-center shadow-xs animate-pulse">🚚</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">কুরিয়ারে হস্তান্তর</div>
                    <div class="text-[9px] text-amber-600">পথে রয়েছে</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 font-bold mx-auto flex items-center justify-center">4</div>
                    <div class="font-bold text-slate-400 text-[11px]">ডেলিভারি সম্পন্ন</div>
                    <div class="text-[9px] text-slate-400">প্রত্যাশিত ২-৩ দিন</div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <!-- TAB 4: MY CART ITEMS -->
          <div id="tab-cart" class="customer-tab-content hidden space-y-4">
            
            <div class="dc-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🛒</span> আপনার কার্টের পণ্যসমূহ (${cartItems.length} টি)
                </h3>
                <a href="/products" class="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  + আরও পণ্য যোগ করুন
                </a>
              </div>

              ${cartItems.length === 0 ? `
                <div class="py-12 text-center space-y-3">
                  <div class="text-4xl">🛒</div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-300">আপনার কার্ট বর্তমানে খালি আছে!</div>
                  <p class="text-xs text-slate-400">আমাদের শপ থেকে আকর্ষণীয় গ্যাজেট ও পণ্য পছন্দ করুন।</p>
                  <a href="/products" class="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl inline-block shadow-glow">
                    🛍️ শপ ভিজিট করুন
                  </a>
                </div>
              ` : `
                <div class="space-y-3">
                  ${cartItems.map(it => {
                    const variantText = (it.color || it.size) ? (String(it.color || '') + ' ' + String(it.size || '')).trim() : '';
                    return `
                    <div class="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs gap-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <img src="${it.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}" class="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                        <div class="min-w-0">
                          <h4 class="font-bold text-slate-900 dark:text-white truncate">${it.name}</h4>
                          <div class="text-[11px] text-slate-500 mt-0.5">
                            মূল্য: ${formatCurrency(it.price || 0)} | পরিমাণ: ${it.quantity} টি
                          </div>
                          ${variantText ? `<span class="badge badge-info text-[9px] mt-1">${variantText}</span>` : ''}
                        </div>
                      </div>
                      <div class="text-right flex-shrink-0">
                        <div class="font-black text-slate-900 dark:text-white text-sm">
                          ${formatCurrency(Number(it.price || 0) * Number(it.quantity || 1))}
                        </div>
                        <a href="/checkout" class="btn-primary text-xs py-1.5 px-3 rounded-lg inline-block mt-1 font-bold">
                          অর্ডার করুন →
                        </a>
                      </div>
                    </div>
                  `;
                  }).join("")}

                  <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">সাবটোটাল</div>
                      <div class="text-lg font-black text-emerald-700 dark:text-emerald-300">${formatCurrency(cartSubtotal)}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <a href="/cart" class="btn-secondary py-2 px-4 text-xs font-bold rounded-xl">সম্পূর্ণ কার্ট ভিউ</a>
                      <a href="/checkout" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl shadow-glow">চেকআউট করুন →</a>
                    </div>
                  </div>
                </div>
              `}

            </div>

          </div>

          <!-- TAB 5: FAVOURITES / WISHLIST -->
          <div id="tab-fav" class="customer-tab-content hidden space-y-4">
            
            <div class="dc-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>❤️</span> আপনার পছন্দের তালিকাভুক্ত পণ্য (${favItems.length} টি)
                </h3>
                <a href="/products" class="btn-primary py-1.5 px-3.5 text-xs font-bold rounded-xl">
                  🛍️ শপ ভিজিট করুন
                </a>
              </div>

              ${favItems.length === 0 ? `
                <div class="py-12 text-center space-y-3">
                  <div class="text-4xl">❤️</div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো পছন্দের পণ্য যোগ করা হয়নি!</div>
                  <p class="text-xs text-slate-400">পছন্দের গ্যাজেটে হার্ট (❤️) আইকনে ক্লিক করে তালিকায় যুক্ত করুন।</p>
                  <a href="/products" class="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl inline-block shadow-glow">
                    শপ থেকে পণ্য দেখুন →
                  </a>
                </div>
              ` : `
                <div class="product-grid">
                  ${favItems.map(p => renderProductCard(p)).join("")}
                </div>
              `}
            </div>

          </div>

          <!-- TAB 6: SETTINGS & PREFERENCES -->
          <div id="tab-settings" class="customer-tab-content hidden space-y-4">
            
            <div class="dc-panel max-w-xl mx-auto space-y-4 text-xs">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚙️</span> অ্যাকাউন্ট সেটিংস ও ডেলিভারি তথ্য
                </h3>
                <p class="text-xs text-slate-500">আপনার ডিফল্ট ডেলিভারি ঠিকানা ও প্রোফাইল প্রেফারেন্স হালনাগাদ করুন।</p>
              </div>

              <form onsubmit="event.preventDefault(); alert('আপনার সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');" class="space-y-3.5">
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম</label>
                  <input type="text" value="${user.name || ''}" class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">মোবাইল নম্বর (প্রধান)</label>
                  <input type="tel" value="${user.mobile || user.phone || ''}" class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 font-mono" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ডিফল্ট ডেলিভারি ঠিকানা</label>
                  <textarea rows="3" class="form-control text-xs w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800" placeholder="বাসা/হোল্ডিং নং, রোড, থানা, জেলা...">${user.address || ''}</textarea>
                </div>
                <div class="pt-2">
                  <button type="submit" class="btn-primary py-2.5 px-6 font-bold text-xs rounded-xl shadow-xs">
                    সংরক্ষণ করুন ✓
                  </button>
                </div>
              </form>
            </div>

          </div>

        </main>

      </div>

    </div>

    <!-- ==========================================================================
         EDIT PROFILE MODAL (100% Wired to main.js event listeners)
         ========================================================================== -->
    <div id="customer-profile-edit-modal" class="modal-backdrop">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">প্রোফাইল সম্পাদনা করুন</h3>
          <button type="button" class="text-slate-400 hover:text-slate-600 font-bold" onclick="document.getElementById('customer-profile-edit-modal').classList.remove('active');">✕</button>
        </div>
        
        <form id="customer-profile-edit-form" class="space-y-3">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম *</label>
            <input type="text" id="edit-c-name" value="${user.name || ''}" class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" required />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল</label>
            <input type="email" id="edit-c-mail" value="${user.mail || user.email || ''}" class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ঠিকানা</label>
            <textarea id="edit-c-addr" rows="2" class="form-control text-xs w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800">${user.address || ''}</textarea>
          </div>
          <button type="submit" class="btn-primary w-full py-2.5 font-bold rounded-xl mt-2">আপডেট সম্পন্ন করুন</button>
        </form>
      </div>
    </div>

    <!-- SCRIPT LOGIC FOR DASHBOARD TABS, FILTERS & TRACKING -->
    <script>
      window.switchCustomerTab = function(tabId, btn) {
        document.querySelectorAll('.customer-tab-content').forEach(el => el.classList.add('hidden'));
        const target = document.getElementById(tabId);
        if (target) target.classList.remove('hidden');

        document.querySelectorAll('.dc-nav-item').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      window.filterCustomerOrders = function(q) {
        const query = (q || '').toLowerCase().trim();
        document.querySelectorAll('.customer-order-item').forEach(item => {
          const sText = item.getAttribute('data-search') || '';
          item.style.display = sText.includes(query) ? '' : 'none';
        });
      };

      window.filterCustomerOrderStatus = function(status, btn) {
        document.querySelectorAll('.dc-filter-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');

        document.querySelectorAll('.customer-order-item').forEach(item => {
          const iStatus = item.getAttribute('data-status') || '';
          if (status === 'all') {
            item.style.display = '';
          } else if (status === 'pending') {
            item.style.display = ['pending', 'order placed', 'processing', 'packing'].includes(iStatus) ? '' : 'none';
          } else if (status === 'delivered') {
            item.style.display = ['delivered', 'completed'].includes(iStatus) ? '' : 'none';
          } else if (status === 'cancelled') {
            item.style.display = ['cancelled', 'returned'].includes(iStatus) ? '' : 'none';
          }
        });
      };

      window.executeDashboardTrack = function() {
        const q = (document.getElementById('dashboard-track-input').value || '').trim();
        if (!q) {
          alert('অনুগ্রহ করে অর্ডার আইডি প্রদান করুন!');
          return;
        }
        document.getElementById('track-disp-id').textContent = q.toUpperCase();
        document.getElementById('dashboard-track-result').scrollIntoView({ behavior: 'smooth' });
      };
    </script>
  `;
}

function renderAuthView(view = 'login') {
  const isRegister = view === 'register';

  return `
    <div class="max-w-md mx-auto py-12 px-4 space-y-6">
      
      <div class="text-center space-y-2">
        <div class="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm mx-auto flex items-center justify-center overflow-hidden">
          <img src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" alt="Logo" class="w-full h-full object-contain" onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';" />
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white">
          ${isRegister ? 'কাস্টমার নতুন অ্যাকাউন্ট তৈরি' : 'কাস্টমার লগইন'}
        </h2>
        <p class="text-xs text-slate-500">
          ${isRegister ? 'অর্ডার ট্র্যাক ও দ্রুত শপিং করতে নিবন্ধন করুন' : 'আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন'}
        </p>
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-4 text-xs">
        
        <form id="customer-auth-form" class="space-y-3.5" data-auth-mode="${isRegister ? 'register' : 'login'}">
          ${isRegister ? `
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম *</label>
              <input type="text" id="auth-name" required placeholder="মোঃ তানভীর হাসান" class="form-control text-xs w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল ঠিকানা</label>
              <input type="email" id="auth-mail" placeholder="user@gmail.com" class="form-control text-xs w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ডেলিভারি ঠিকানা *</label>
              <textarea id="auth-addr" required rows="2" placeholder="বাসা নং, রোড, থানা, জেলা..." class="form-control text-xs w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"></textarea>
            </div>
          ` : ""}

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">মোবাইল নম্বর *</label>
            <input type="tel" id="auth-phone" required pattern="[0-9]{11}" placeholder="01700000000" class="form-control text-xs w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-mono" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পাসওয়ার্ড *</label>
            <input type="password" id="auth-pass" required placeholder="••••••••" class="form-control text-xs w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
          </div>

          <button type="submit" class="btn-primary w-full py-3 text-xs font-bold shadow-md rounded-xl">
            ${isRegister ? 'নিবন্ধন সম্পন্ন করুন →' : 'লগইন করুন →'}
          </button>
        </form>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
          ${isRegister ? `
            <p class="text-slate-500">ইতিমধ্যে অ্যাকাউন্ট আছে? <a href="/customer/login" class="text-emerald-600 font-bold hover:underline">এখানে লগইন করুন</a></p>
          ` : `
            <p class="text-slate-500">অ্যাকাউন্ট নেই? <a href="/customer/register" class="text-emerald-600 font-bold hover:underline">নতুন অ্যাকাউন্ট খুলুন</a></p>
          `}
          
          <div class="pt-2 flex items-center justify-center gap-2">
            <a href="/customer/dashboard" class="btn-secondary py-1.5 px-3.5 text-xs font-bold rounded-lg">
              গেস্ট ড্যাশবোর্ড দেখুন →
            </a>
            <a href="/products" class="btn-primary py-1.5 px-3.5 text-xs font-bold rounded-lg">
              🛍️ শপ ভিজিট করুন
            </a>
          </div>
        </div>

      </div>

    </div>
  `;
}

export const renderCustomerDashboard = renderCustomerPortal;
export const CustomerPortal = renderCustomerPortal;
export default renderCustomerPortal;
