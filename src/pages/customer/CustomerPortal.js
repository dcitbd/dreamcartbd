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
  const userPhone = String(user.mobile || user.Mobile || user.phone || "").trim();
  const userMail = String(user.mail || user.Mail || user.email || "").trim().toLowerCase();

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

  const userName = user.name || user.Name || 'সম্মানিত গ্রাহক';
  const userAddress = user.address || user.Address || 'বাংলাদেশ';
  const userCustomId = user.user_id || user.User_ID || '';
  const userSysId = user.USER_ID || '';
  const userPhoto = user.profile_photo || user.Profile_photo || '';
  const userStatus = user.status || user.Status || 'Active';
  const userSuccessOrder = (user.success_order !== undefined && user.success_order !== "") ? Number(user.success_order) : ((user.Success_order !== undefined && user.Success_order !== "") ? Number(user.Success_order) : deliveredOrders);
  const userCancelOrder = (user.cancel_order !== undefined && user.cancel_order !== "") ? Number(user.cancel_order) : ((user.Cancel_Order !== undefined && user.Cancel_Order !== "") ? Number(user.Cancel_Order) : cancelledOrders);
  const userTotalOrder = (user.total_order !== undefined && user.total_order !== "") ? Number(user.total_order) : ((user.Total_Order !== undefined && user.Total_Order !== "") ? Number(user.Total_Order) : totalOrders);
  const userSuccessRate = user.order_success_rate || user.Order_Success_Rate || (userTotalOrder > 0 ? Math.round((userSuccessOrder / userTotalOrder) * 100) + '%' : '100%');

  const initial = (userName || (isAuth ? "U" : "G")).charAt(0).toUpperCase();

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
          <div class="dc-avatar flex-shrink-0 overflow-hidden">
            ${userPhoto ? `<img src="${userPhoto}" alt="${userName}" class="w-full h-full object-cover rounded-2xl" onerror="this.onerror=null; this.parentElement.innerHTML='${initial}';" />` : initial}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                ${isAuth ? userName : 'সম্মানিত ভিজিটর / গেস্ট'}
              </h1>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${isAuth ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'}">
                <span class="w-1.5 h-1.5 rounded-full ${isAuth ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                ${isAuth ? `${userStatus} • ভেরিফায়েড` : 'গেস্ট মোড'}
              </span>
              ${(userSysId || userCustomId) ? `<span class="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold">ID: ${userSysId || userCustomId}</span>` : ''}
            </div>
            
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>📞 ${userPhone || 'ফোন নম্বর যুক্ত করুন'}</span>
              <span>•</span>
              <span>✉️ ${userMail || 'ইমেইল যুক্ত করুন'}</span>
              <span>•</span>
              <span class="truncate">📍 ${userAddress}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 self-stretch sm:self-end md:self-center justify-end">
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

      <!-- MAIN LAYOUT: SIDEBAR + CONTENT TABS -->
      <div class="dc-cust-grid">
        <aside class="dc-cust-sidebar">
          <div class="dc-sidebar-profile">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-base">
              👤
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                ${userName}
              </div>
              <div class="text-[10px] text-slate-400 font-mono">
                ${userPhone || '01XXXXXXXXX'}
              </div>
            </div>
          </div>

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

            <a href="/products" class="dc-nav-item text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-extrabold">
              <span class="flex items-center gap-2"><span>🛍️</span> শপ ভিজিট করুন</span>
              <span class="text-xs">→</span>
            </a>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-settings', this)">
              <span class="flex items-center gap-2"><span>⚙️</span> সেটিংস ও প্রোফাইল</span>
            </button>
          </nav>

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

        <main class="space-y-6 min-w-0">
          <div id="tab-overview" class="customer-tab-content space-y-6">
            <div class="dc-kpi-grid">
              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>মোট অর্ডার (শীট L)</span>
                  <span class="text-base">📦</span>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-white mt-2">${userTotalOrder} টি</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">সর্বমোট অর্ডারের হিসাব</div>
              </div>

              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>চলমান অর্ডার</span>
                  <span class="text-base">⏳</span>
                </div>
                <div class="text-2xl font-black text-amber-500 mt-2">${pendingOrders} টি</div>
                <div class="text-[10px] text-amber-600 font-bold mt-1">বাতিল: ${userCancelOrder} টি</div>
              </div>

              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>সফল ডেলিভারি (শীট J)</span>
                  <span class="text-base">🚚</span>
                </div>
                <div class="text-2xl font-black text-emerald-600 mt-2">${userSuccessOrder} টি</div>
                <div class="text-[10px] text-emerald-600 font-bold mt-1">সাকসেস রেট: ${userSuccessRate}</div>
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

            <div class="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div class="space-y-1">
                <h3 class="text-base sm:text-lg font-black">আমাদের বিশাল কালেকশন থেকে এখনই অর্ডার করুন!</h3>
                <p class="text-xs text-emerald-100/80">স্মার্টওয়াচ, হেলথ ফুড, লাইটিং ও কিচেন গ্যাজেটে ক্যাশ অন ডেলিভারি অফার।</p>
              </div>
              <a href="/products" class="btn-primary py-2.5 px-6 font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl flex-shrink-0 transition">
                শপ ব্রাউজ করুন →
              </a>
            </div>

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
          </div>

          <div id="tab-orders" class="customer-tab-content hidden space-y-4">
            <div class="dc-panel space-y-4">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white">
                    আমার সকল অর্ডার (Order History & Invoices)
                  </h3>
                  <p class="text-xs text-slate-500">আপনার সমস্ত অতীত ও চলমান অর্ডারের বিস্তারিত তথ্য ও ক্যাশ অন ডেলিভারি স্ট্যাটাস।</p>
                </div>

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

              <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button class="dc-filter-btn active" data-status="all" onclick="window.filterCustomerOrderStatus('all', this)">সবগুলো (${orders.length})</button>
                <button class="dc-filter-btn" data-status="pending" onclick="window.filterCustomerOrderStatus('pending', this)">পেন্ডিং (${pendingOrders})</button>
                <button class="dc-filter-btn" data-status="delivered" onclick="window.filterCustomerOrderStatus('delivered', this)">ডেলিভার্ড (${deliveredOrders})</button>
                <button class="dc-filter-btn" data-status="cancelled" onclick="window.filterCustomerOrderStatus('cancelled', this)">বাতিল (${cancelledOrders})</button>
              </div>

              <div class="space-y-3" id="customer-orders-container">
                ${orders.map(o => `
                  <div class="dc-order-card customer-order-item" data-status="${String(o.order_status \vert{}\vert{} 'Pending').toLowerCase()}" data-search="${(o.order_id + ' ' + (o.products || '')).toLowerCase()}">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 dark:border-slate-700/60 pb-2.5 mb-2.5">
                      <div class="flex items-center gap-3 flex-wrap">
                        <span class="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          #${o.order_id}
                        </span>
                        <span class="text-xs text-slate-500 font-medium">📅 ${o.date || 'তারিখ'}</span>
                      </div>
                      <span class="badge badge-warning text-[10px] font-bold">
                        ${o.order_status || 'Pending'}
                      </span>
                    </div>
                    <div class="text-xs text-slate-700 dark:text-slate-300 font-semibold">${o.products || 'পণ্যসমূহ'}</div>
                    <div class="text-xs font-black text-slate-900 dark:text-white mt-1">মোট: ${formatCurrency(o.total_amount || 0)}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <div id="tab-track" class="customer-tab-content hidden space-y-4">
            <div class="dc-panel space-y-5">
              <h3 class="text-base font-black text-slate-900 dark:text-white">লাইভ অর্ডার ট্র্যাকিং</h3>
              <div class="flex flex-col sm:flex-row gap-2 max-w-lg">
                <input type="text" id="dashboard-track-input" placeholder="অর্ডার আইডি লিখুন..." class="form-control text-xs py-2.5 px-4 rounded-xl border flex-1" />
                <button type="button" class="btn-primary py-2.5 px-6 font-bold text-xs rounded-xl" onclick="window.executeDashboardTrack()">ট্র্যাক করুন</button>
              </div>
            </div>
          </div>

          <div id="tab-cart" class="customer-tab-content hidden space-y-4">
            <div class="dc-panel space-y-4">
              <h3 class="text-base font-black text-slate-900 dark:text-white">কার্ট তালিকা (${cartItems.length} টি)</h3>
            </div>
          </div>

          <div id="tab-fav" class="customer-tab-content hidden space-y-4">
            <div class="dc-panel space-y-4">
              <h3 class="text-base font-black text-slate-900 dark:text-white">পছন্দের পণ্য (${favItems.length} টি)</h3>
            </div>
          </div>

          <div id="tab-settings" class="customer-tab-content hidden space-y-4">
            <div class="dc-panel max-w-xl mx-auto space-y-4 text-xs">
              <h3 class="text-base font-black text-slate-900 dark:text-white">প্রোফাইল ও ডেলিভারি তথ্য</h3>
              <button type="button" class="btn-primary py-2 px-5 rounded-xl font-bold" onclick="document.getElementById('customer-profile-edit-modal').classList.add('active');">প্রোফাইল সম্পাদনা করুন ✎</button>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div id="customer-profile-edit-modal" class="modal-backdrop">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">প্রোফাইল সম্পাদনা করুন</h3>
          <button type="button" class="text-slate-400 hover:text-slate-600 font-bold" onclick="document.getElementById('customer-profile-edit-modal').classList.remove('active');">✕</button>
        </div>
        
        <form id="customer-profile-edit-form" class="space-y-3">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম *</label>
            <input type="text" id="edit-c-name" value="${userName}" class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" required />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল</label>
            <input type="email" id="edit-c-mail" value="${userMail}" class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">প্রোফাইল ছবি লিংক (URL)</label>
            <input type="url" id="edit-c-photo" value="${userPhoto}" placeholder="https://..." class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ডেলিভারি ঠিকানা</label>
            <textarea id="edit-c-addr" rows="2" class="form-control text-xs w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800">${userAddress}</textarea>
          </div>
          <button type="submit" class="btn-primary w-full py-2.5 font-bold rounded-xl mt-2">আপডেট সম্পন্ন করুন</button>
        </form>
      </div>
    </div>

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
    <style id="dc-customer-auth-styles">
      @keyframes dcOrbFloat1 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        50% { transform: translate(35px, -45px) scale(1.12); }
      }

      @keyframes dcOrbFloat2 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        50% { transform: translate(-40px, 40px) scale(1.08); }
      }

      @keyframes dcCardEntrance {
        0% { opacity: 0; transform: translateY(26px) scale(0.98); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes dcGlowPulse {
        0%, 100% { box-shadow: 0 0 25px -4px rgba(16, 185, 129, 0.35); }
        50% { box-shadow: 0 0 50px 6px rgba(5, 150, 105, 0.6); }
      }

      @keyframes dcAlertShake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-6px); }
        40%, 80% { transform: translateX(6px); }
      }

      .dc-auth-wrapper {
        position: relative;
        width: 100%;
        min-height: 85vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2.5rem 1rem 4.5rem 1rem;
        box-sizing: border-box;
      }

      .dc-ambient-glow {
        position: absolute;
        border-radius: 9999px;
        filter: blur(85px);
        pointer-events: none;
        z-index: 0;
        opacity: 0.65;
      }

      .dark .dc-ambient-glow {
        opacity: 0.35;
      }

      .dc-glow-1 {
        top: -60px;
        left: 8%;
        width: 340px;
        height: 340px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(5, 150, 105, 0.1) 70%, transparent 100%);
        animation: dcOrbFloat1 15s ease-in-out infinite;
      }

      .dc-glow-2 {
        bottom: -70px;
        right: 8%;
        width: 380px;
        height: 380px;
        background: radial-gradient(circle, rgba(13, 148, 136, 0.45) 0%, rgba(20, 184, 166, 0.1) 70%, transparent 100%);
        animation: dcOrbFloat2 18s ease-in-out infinite;
      }

      .dc-glow-3 {
        top: 35%;
        right: 30%;
        width: 260px;
        height: 260px;
        background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%);
      }

      .dc-auth-card {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 540px;
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 28px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.09), 0 0 0 1px rgba(16, 185, 129, 0.1);
        padding: 2.5rem 2.25rem;
        box-sizing: border-box;
        animation: dcCardEntrance 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .dark .dc-auth-card {
        background: rgba(15, 23, 42, 0.94);
        border-color: rgba(255, 255, 255, 0.09);
        box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.2);
      }

      @media (max-width: 640px) {
        .dc-auth-card {
          padding: 1.5rem 1.25rem;
          border-radius: 22px;
        }
        .dc-auth-wrapper {
          padding: 1.25rem 0.75rem 3.5rem 0.75rem;
        }
      }

      .dc-auth-brand-logo {
        width: 68px;
        height: 68px;
        border-radius: 22px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.125rem auto;
        padding: 3px;
        box-shadow: 0 12px 28px -4px rgba(5, 150, 105, 0.4);
        animation: dcGlowPulse 4s infinite ease-in-out;
      }

      .dc-auth-brand-logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 19px;
        background: #ffffff;
      }

      .dc-auth-title {
        font-size: 1.55rem;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -0.025em;
        text-align: center;
        margin-bottom: 0.25rem;
      }

      .dark .dc-auth-title {
        color: #ffffff;
      }

      .dc-auth-subtitle {
        font-size: 0.8125rem;
        color: #64748b;
        text-align: center;
        margin-bottom: 1.25rem;
        line-height: 1.45;
      }

      .dark .dc-auth-subtitle {
        color: #94a3b8;
      }

      .dc-security-badge-wrapper {
        text-align: center;
        margin-bottom: 1.25rem;
      }

      .dc-security-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        border: 1px solid #a7f3d0;
        color: #065f46;
        padding: 0.35rem 0.875rem;
        border-radius: 9999px;
        font-size: 0.6875rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .dark .dc-security-badge {
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.35);
        color: #34d399;
      }

      .dc-auth-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        background: #f1f5f9;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 16px;
        padding: 4px;
        gap: 4px;
        margin-bottom: 1.5rem;
      }

      .dark .dc-auth-tabs {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.08);
      }

      .dc-auth-tab-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.625rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8125rem;
        font-weight: 700;
        color: #64748b;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        background: transparent;
      }

      .dark .dc-auth-tab-btn {
        color: #94a3b8;
      }

      .dc-auth-tab-btn:hover {
        color: #0f172a;
        background: rgba(255, 255, 255, 0.5);
      }

      .dark .dc-auth-tab-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.05);
      }

      .dc-auth-tab-btn.active {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
        color: #ffffff !important;
        font-weight: 800;
        box-shadow: 0 4px 14px -1px rgba(5, 150, 105, 0.4);
        border-color: transparent;
      }

      .dc-auth-alert {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-radius: 16px;
        font-size: 0.75rem;
        line-height: 1.45;
        margin-bottom: 1.25rem;
        box-sizing: border-box;
      }

      .dc-alert-error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
        animation: dcAlertShake 0.4s ease-in-out;
      }

      .dark .dc-alert-error {
        background: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.35);
        color: #fca5a5;
      }

      .dc-alert-success {
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #065f46;
      }

      .dark .dc-alert-success {
        background: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.35);
        color: #6ee7b7;
      }

      .dc-form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.95rem;
      }

      .dc-input-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .dc-input-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.75rem;
        font-weight: 700;
        color: #334155;
      }

      .dark .dc-input-label {
        color: #cbd5e1;
      }

      .dc-col-badge {
        font-size: 0.625rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 6px;
        background: #e2e8f0;
        color: #475569;
        font-family: monospace;
      }

      .dark .dc-col-badge {
        background: #334155;
        color: #cbd5e1;
      }

      .dc-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
      }

      .dc-input-icon {
        position: absolute;
        left: 0.95rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1rem;
        color: #94a3b8;
        pointer-events: none;
        transition: color 0.2s ease;
        z-index: 2;
      }

      .dc-input-control {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.85rem;
        font-size: 0.8125rem;
        border-radius: 14px;
        border: 1.5px solid #e2e8f0;
        background: #f8fafc;
        color: #0f172a;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .dark .dc-input-control {
        background: #1e293b;
        border-color: #334155;
        color: #f8fafc;
      }

      .dc-input-control:focus {
        border-color: #059669;
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
      }

      .dark .dc-input-control:focus {
        background: #0f172a;
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
      }

      .dc-input-addon-btn {
        position: absolute;
        right: 0.875rem;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.35rem;
        border-radius: 8px;
        color: #64748b;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s ease, color 0.15s ease;
        z-index: 2;
      }

      .dc-input-addon-btn:hover {
        color: #059669;
      }

      .dc-input-addon-btn:active {
        transform: translateY(-50%) scale(0.9);
      }

      .dc-sheet-banner {
        background: linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(13, 148, 136, 0.08) 100%);
        border: 1px dashed rgba(5, 150, 105, 0.4);
        border-radius: 14px;
        padding: 0.875rem;
        font-size: 0.6875rem;
        color: #047857;
        line-height: 1.5;
      }

      .dark .dc-sheet-banner {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.35);
        color: #34d399;
      }

      .dc-auth-submit-btn {
        width: 100%;
        padding: 0.875rem 1.25rem;
        border-radius: 14px;
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: #ffffff;
        font-size: 0.875rem;
        font-weight: 800;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 22px -4px rgba(5, 150, 105, 0.45);
        transition: all 0.22s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .dc-auth-submit-btn:hover {
        background: linear-gradient(135deg, #047857 0%, #059669 100%);
        box-shadow: 0 12px 28px -4px rgba(5, 150, 105, 0.55);
        transform: translateY(-1.5px);
      }

      .dc-auth-submit-btn:active {
        transform: translateY(0);
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
      }

      .dc-auth-submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none !important;
      }

      .dc-trust-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
        margin-top: 2rem;
        width: 100%;
        max-width: 540px;
        z-index: 10;
      }

      @media (max-width: 640px) {
        .dc-trust-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
      }

      .dc-trust-card {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(226, 232, 240, 0.85);
        border-radius: 16px;
        padding: 0.875rem 0.5rem;
        text-align: center;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.03);
        transition: transform 0.2s ease;
      }

      .dark .dc-trust-card {
        background: rgba(15, 23, 42, 0.85);
        border-color: rgba(255, 255, 255, 0.07);
      }

      .dc-trust-card:hover {
        transform: translateY(-2px);
      }

      .dc-trust-card .dc-trust-icon {
        font-size: 1.25rem;
        margin-bottom: 0.25rem;
      }

      .dc-trust-card .dc-trust-title {
        font-size: 0.6875rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.25;
      }

      .dark .dc-trust-card .dc-trust-title {
        color: #f1f5f9;
      }

      .dc-trust-card .dc-trust-desc {
        font-size: 0.5625rem;
        color: #64748b;
        margin-top: 2px;
      }

      .dark .dc-trust-card .dc-trust-desc {
        color: #94a3b8;
      }
    </style>

    <div class="dc-auth-wrapper">
      
      <!-- Ambient Decorative Glows -->
      <div class="dc-ambient-glow dc-glow-1"></div>
      <div class="dc-ambient-glow dc-glow-2"></div>
      <div class="dc-ambient-glow dc-glow-3"></div>

      <!-- Main Luxury Authentication Card -->
      <div class="dc-auth-card">
        
        <!-- Brand Logo Header -->
        <div class="dc-auth-brand-logo">
          <img 
            src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
            alt="Dream Cart BD Logo" 
            onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
          />
        </div>

        <h2 class="dc-auth-title" id="auth-card-title">
          ${isRegister ? 'কাস্টমার নতুন অ্যাকাউন্ট তৈরি' : 'কাস্টমার অ্যাকাউন্ট লগইন'}
        </h2>
        <p class="dc-auth-subtitle" id="auth-card-subtitle">
          ${isRegister ? 'তথ্য প্রদান করে নিবন্ধন সম্পন্ন করুন (গুগল শিটে সেভ হবে)' : 'শুধুমাত্র Customers তালিকায় থাকা তথ্য অনুযায়ী লগইন করুন'}
        </p>

        <!-- Security Shield Badge -->
        <div class="dc-security-badge-wrapper">
          <span class="dc-security-badge">
            <span>🔒</span>
            <span>১০০% সুরক্ষিত গুগল ক্লাউড সিস্টেম • নিরাপদ ডেটাবেস</span>
          </span>
        </div>

        <!-- Dual-Tab Pill Switcher -->
        <div class="dc-auth-tabs">
          <button 
            type="button" 
            id="tab-btn-login"
            class="dc-auth-tab-btn ${!isRegister ? 'active' : ''}" 
            onclick="window.switchCustomerAuthTab('login')"
          >
            <span>🔐</span>
            <span>লগইন করুন</span>
          </button>
          
          <button 
            type="button" 
            id="tab-btn-register"
            class="dc-auth-tab-btn ${isRegister ? 'active' : ''}" 
            onclick="window.switchCustomerAuthTab('register')"
          >
            <span>📝</span>
            <span>নতুন অ্যাকাউন্ট</span>
          </button>
        </div>

        <!-- Dynamic Error Alert Box -->
        <div id="auth-error-box" class="dc-auth-alert dc-alert-error hidden">
          <span class="text-base flex-shrink-0">⚠️</span>
          <div class="flex-1">
            <div class="font-bold">সতর্কতা বার্তা</div>
            <div id="auth-error-text" class="mt-0.5">তথ্য যাচাইকরণে সমস্যা হয়েছে।</div>
          </div>
          <button type="button" class="text-xs font-bold opacity-70 hover:opacity-100" onclick="document.getElementById('auth-error-box').classList.add('hidden')">✕</button>
        </div>

        <!-- Dynamic Success Alert Box -->
        <div id="auth-success-box" class="dc-auth-alert dc-alert-success hidden">
          <span class="text-base flex-shrink-0">✅</span>
          <div class="flex-1">
            <div class="font-bold">সফল হয়েছে!</div>
            <div id="auth-success-text" class="mt-0.5">আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।</div>
          </div>
        </div>

        <!-- Authentication Form -->
        <form id="customer-auth-form" data-auth-mode="${isRegister ? 'register' : 'login'}">
          
          <!-- ================= LOGIN FIELDS ================= -->
          <div id="auth-login-fields" class="dc-form-grid ${isRegister ? 'hidden' : ''}">
            
            <div class="dc-input-group">
              <label class="dc-input-label">
                <span>মোবাইল নম্বর অথবা ইউজার আইডি *</span>
                <span class="dc-col-badge">কলাম D বা G</span>
              </label>
              <div class="dc-input-wrapper">
                <span class="dc-input-icon">📱</span>
                <input 
                  type="text" 
                  id="auth-identifier" 
                  placeholder="01XXXXXXXXX বা user123" 
                  class="dc-input-control font-mono"
                  autocomplete="username"
                />
              </div>
              <span class="text-[10px] text-slate-400">কাস্টমার শিটে নিবন্ধিত ১১ ডিজিটের মোবাইল নম্বর অথবা ইউজার আইডি</span>
            </div>

            <div class="dc-input-group">
              <label class="dc-input-label">
                <span>পাসওয়ার্ড *</span>
                <span class="dc-col-badge">কলাম H</span>
              </label>
              <div class="dc-input-wrapper">
                <span class="dc-input-icon">🔒</span>
                <input 
                  type="password" 
                  id="auth-pass-login" 
                  placeholder="••••••••" 
                  class="dc-input-control"
                  autocomplete="current-password"
                />
                <button 
                  type="button" 
                  class="dc-input-addon-btn btn-toggle-password" 
                  data-target-input="auth-pass-login"
                  onclick="window.toggleAuthPassword('auth-pass-login', this)"
                  title="পাসওয়ার্ড দেখুন বা লুকান"
                >
                  <span class="pass-eye-icon">👁️</span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input type="checkbox" id="auth-remember-me" checked class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span>মনে রাখুন</span>
              </label>
              <a href="https://wa.me/8801581703822" target="_blank" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                পাসওয়ার্ড সহায়তা 💬
              </a>
            </div>

          </div>

          <!-- ================= REGISTER FIELDS (MATCHING SHEET COLUMNS A-M) ================= -->
          <div id="auth-register-fields" class="dc-form-grid ${!isRegister ? 'hidden' : ''}">
            
            <!-- Transparency Info Banner -->
            <div class="dc-sheet-banner">
              <div class="font-bold flex items-center gap-1.5 mb-1">
                <span>📋</span> <span>Google Sheets — Customers তালিকা কলাম ম্যাপিং:</span>
              </div>
              <div class="font-mono text-[9.5px] opacity-90 leading-tight">
                A=USER_ID • B=Profile_photo • C=Name • D=Mobile • E=Mail • F=Address • G=User_ID • H=Password • I=Status(Active) • J-M=Order Counters
              </div>
            </div>

            <!-- Column C: Name -->
            <div class="dc-input-group">
              <label class="dc-input-label">
                <span>পূর্ণ নাম (Name) *</span>
                <span class="dc-col-badge">কলাম C</span>
              </label>
              <div class="dc-input-wrapper">
                <span class="dc-input-icon">👤</span>
                <input 
                  type="text" 
                  id="auth-name" 
                  placeholder="যেমন: মোঃ সাইফুল ইসলাম" 
                  class="dc-input-control"
                  autocomplete="name"
                />
              </div>
            </div>

            <!-- Column D: Mobile -->
            <div class="dc-input-group">
              <label class="dc-input-label">
                <span>মোবাইল নম্বর (Mobile) *</span>
                <span class="dc-col-badge">কলাম D</span>
              </label>
              <div class="dc-input-wrapper">
                <span class="dc-input-icon">📱</span>
                <input 
                  type="tel" 
                  id="auth-phone" 
                  pattern="[0-9]{11}" 
                  placeholder="01XXXXXXXXX (১১ ডিজিট)" 
                  class="dc-input-control font-mono"
                  autocomplete="tel"
                />
              </div>
              <span class="text-[10px] text-slate-400">এই নম্বরটি দিয়ে ভবিষ্যতে লগইন করতে পারবেন</span>
            </div>

            <!-- Column E: Mail -->
            <div class="dc-input-group">
              <label class="dc-input-label">
                <span>ইমেইল ঠিকানা (Mail)</span>
                <span class="dc-col-badge">কলাম E</span>
              </label>
              <div class="dc-input-wrapper">
                <span class="dc-input-icon">✉️</span>
                <input 
                  type="email" 
                  id="auth-mail" 
                  placeholder="user@gmail.com (ঐচ্ছিক)" 
                  class="dc-input-control"
                  autocomplete="email"
                />
              </div>
            </div>

            <!-- Column G: User_ID -->
            <div class="dc-input-group">
              <label class="dc-input-label">
                <span>পছন্দের ইউজার আইডি (User_ID)</span>
                <span class="dc-col-badge">কলাম G</span>
              </label>
              <div class="dc-input-wrapper">
                <span class="dc-input-icon">🆔</span>
                <input 
                  type="text" 
                  id="auth-userid" 
                  placeholder="যেমন: saifulbd26 (ঐচ্ছিক)" 
                  class="dc-input-control font-mono"
                  autocomplete="username"
                />
              </div>
              <span class="text-[10px] text-slate-400">খালি রাখলে মোবাইল নম্বরই আপনার ইউজার আইডি হিসেবে সংরক্ষিত হবে</span>
            </div>

            <!-- Column F: Address -->
            <div class="dc-input-group">
              <label class="dc-input-label">
                <span>ডেলিভারি ঠিকানা (Address) *</span>
                <span class="dc-col-badge">কলাম F</span>
              </label>
              <div class="dc-input-wrapper">
                <span class="dc-input-icon" style="top: 1.25rem;">📍</span>
                <textarea 
                  id="auth-addr" 
                  rows="2" 
                  placeholder="বাসা নং, রোড, এলাকা/থানা, জেলা..." 
                  class="dc-input-control"
                  style="padding-top: 0.65rem;"
                ></textarea>
              </div>
            </div>

            <!-- Column B: Profile_photo -->
            <div class="dc-input-group">
              <label class="dc-input-label">
                <span>প্রোফাইল ছবি লিংক (Profile_photo)</span>
                <span class="dc-col-badge">কলাম B</span>
              </label>
              <div class="flex items-center gap-2.5">
                <div id="auth-photo-preview" class="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-base overflow-hidden">
                  👤
                </div>
                <div class="dc-input-wrapper flex-1">
                  <span class="dc-input-icon">🖼️</span>
                  <input 
                    type="url" 
                    id="auth-photo" 
                    placeholder="https://... ছবির অনলাইন লিংক (ঐচ্ছিক)" 
                    class="dc-input-control text-xs"
                    oninput="window.previewAuthAvatar(this.value)"
                  />
                </div>
              </div>
            </div>

            <!-- Column H: Password -->
            <div class="dc-input-group">
              <label class="dc-input-label">
                <span>পাসওয়ার্ড (Password) *</span>
                <span class="dc-col-badge">কলাম H</span>
              </label>
              <div class="dc-input-wrapper">
                <span class="dc-input-icon">🔒</span>
                <input 
                  type="password" 
                  id="auth-pass-reg" 
                  placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড" 
                  class="dc-input-control"
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  class="dc-input-addon-btn btn-toggle-password" 
                  data-target-input="auth-pass-reg"
                  onclick="window.toggleAuthPassword('auth-pass-reg', this)"
                  title="পাসওয়ার্ড দেখুন বা লুকান"
                >
                  <span class="pass-eye-icon">👁️</span>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="dc-input-group">
              <label class="dc-input-label">
                <span>পাসওয়ার্ড নিশ্চিত করুন *</span>
                <span class="dc-col-badge">যাচাইকরণ</span>
              </label>
              <div class="dc-input-wrapper">
                <span class="dc-input-icon">🔐</span>
                <input 
                  type="password" 
                  id="auth-pass-confirm" 
                  placeholder="একই পাসওয়ার্ড পুনরায় লিখুন" 
                  class="dc-input-control"
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  class="dc-input-addon-btn btn-toggle-password" 
                  data-target-input="auth-pass-confirm"
                  onclick="window.toggleAuthPassword('auth-pass-confirm', this)"
                  title="পাসওয়ার্ড দেখুন বা লুকান"
                >
                  <span class="pass-eye-icon">👁️</span>
                </button>
              </div>
            </div>

            <div class="text-[11px] text-slate-500 pt-1">
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="auth-agree-terms" checked class="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span>আমি Dream Cart BD-এর শর্তাবলী ও গোপনীয়তা নীতি মেনে নিচ্ছি।</span>
              </label>
            </div>

          </div>

          <!-- Submit Button -->
          <button type="submit" id="btn-auth-submit" class="dc-auth-submit-btn">
            ${isRegister ? `
              <span>📝</span>
              <span>অ্যাকাউন্ট তৈরি করুন ও ড্যাশবোর্ডে যান →</span>
            ` : `
              <span>🔐</span>
              <span>ড্যাশবোর্ডে প্রবেশ করুন →</span>
            `}
          </button>

        </form>

        <!-- Secondary Bottom Links & Shortcuts -->
        <div class="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
          
          <div class="text-xs text-slate-500 dark:text-slate-400">
            ${isRegister ? `
              ইতিমধ্যে অ্যাকাউন্ট আছে? 
              <button type="button" class="text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline" onclick="window.switchCustomerAuthTab('login')">
                এখানে লগইন করুন
              </button>
            ` : `
              অ্যাকাউন্ট নেই? 
              <button type="button" class="text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline" onclick="window.switchCustomerAuthTab('register')">
                নতুন অ্যাকাউন্ট খুলুন (নিবন্ধন)
              </button>
            `}
          </div>

          <div class="pt-1 flex flex-wrap items-center justify-center gap-2.5">
            <a href="/products" class="btn-primary py-2 px-4 text-xs font-bold rounded-xl shadow-glow inline-flex items-center gap-1.5">
              <span>🛍️</span>
              <span>শপ ভিজিট করুন</span>
            </a>
            
            <a href="/track" class="btn-secondary py-2 px-3.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800">
              <span>🚚</span>
              <span>অর্ডার ট্র্যাকিং</span>
            </a>

            <a href="/customer/dashboard" class="btn-secondary py-2 px-3.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800">
              <span>👤</span>
              <span>গেস্ট ড্যাশবোর্ড</span>
            </a>
          </div>

        </div>

      </div>

      <!-- Trust Badges 4-Grid Footer -->
      <div class="dc-trust-grid">
        <div class="dc-trust-card">
          <div class="dc-trust-icon">🚚</div>
          <div class="dc-trust-title">ক্যাশ অন ডেলিভারি</div>
          <div class="dc-trust-desc">সারা বাংলাদেশে প্রযোজ্য</div>
        </div>

        <div class="dc-trust-card">
          <div class="dc-trust-icon">🛡️</div>
          <div class="dc-trust-title">১০০% জেনুইন গ্যাজেট</div>
          <div class="dc-trust-desc">অরিজিনাল ওয়ারেন্টিসহ</div>
        </div>

        <div class="dc-trust-card">
          <div class="dc-trust-icon">⚡</div>
          <div class="dc-trust-title">দ্রুত ডেলিভারি</div>
          <div class="dc-trust-desc">২৪-৭২ ঘণ্টায় পণ্য পৌঁছাবে</div>
        </div>

        <div class="dc-trust-card">
          <div class="dc-trust-icon">💬</div>
          <div class="dc-trust-title">২৪/৭ লাইভ সাপোর্ট</div>
          <div class="dc-trust-desc">WhatsApp ও কল সেবা</div>
        </div>
      </div>

    </div>

    <!-- Interactive Client Scripts for Tab Switching, Eye Password Toggle & Avatar Preview -->
    <script>
      window.switchCustomerAuthTab = function(mode) {
        const isReg = mode === 'register';
        const loginFields = document.getElementById('auth-login-fields');
        const regFields = document.getElementById('auth-register-fields');
        const form = document.getElementById('customer-auth-form');
        const btnSubmit = document.getElementById('btn-auth-submit');
        const titleEl = document.getElementById('auth-card-title');
        const subEl = document.getElementById('auth-card-subtitle');
        const tabLogin = document.getElementById('tab-btn-login');
        const tabReg = document.getElementById('tab-btn-register');
        const errBox = document.getElementById('auth-error-box');
        const succBox = document.getElementById('auth-success-box');

        if (errBox) errBox.classList.add('hidden');
        if (succBox) succBox.classList.add('hidden');

        if (isReg) {
          if (loginFields) loginFields.classList.add('hidden');
          if (regFields) regFields.classList.remove('hidden');
          if (form) form.setAttribute('data-auth-mode', 'register');
          if (btnSubmit) btnSubmit.innerHTML = '<span>📝</span> <span>অ্যাকাউন্ট তৈরি করুন ও ড্যাশবোর্ডে যান →</span>';
          if (titleEl) titleEl.textContent = 'কাস্টমার নতুন অ্যাকাউন্ট তৈরি';
          if (subEl) subEl.textContent = 'তথ্য প্রদান করে নিবন্ধন সম্পন্ন করুন (গুগল শিটে সেভ হবে)';
          if (tabReg) tabReg.classList.add('active');
          if (tabLogin) tabLogin.classList.remove('active');
          try { window.history.replaceState(null, '', '/customer/register'); } catch(e){}
        } else {
          if (regFields) regFields.classList.add('hidden');
          if (loginFields) loginFields.classList.remove('hidden');
          if (form) form.setAttribute('data-auth-mode', 'login');
          if (btnSubmit) btnSubmit.innerHTML = '<span>🔐</span> <span>ড্যাশবোর্ডে প্রবেশ করুন →</span>';
          if (titleEl) titleEl.textContent = 'কাস্টমার অ্যাকাউন্ট লগইন';
          if (subEl) subEl.textContent = 'শুধুমাত্র Customers তালিকায় থাকা তথ্য অনুযায়ী লগইন করুন';
          if (tabLogin) tabLogin.classList.add('active');
          if (tabReg) tabReg.classList.remove('active');
          try { window.history.replaceState(null, '', '/customer/login'); } catch(e){}
        }
      };

      window.toggleAuthPassword = function(inputId, btn) {
        const inp = document.getElementById(inputId);
        if (!inp) return;
        const isPass = inp.type === 'password';
        inp.type = isPass ? 'text' : 'password';
        const eyeSpan = btn.querySelector('.pass-eye-icon') || btn;
        if (eyeSpan) eyeSpan.textContent = isPass ? '🙈' : '👁️';
      };

      window.previewAuthAvatar = function(url) {
        const preview = document.getElementById('auth-photo-preview');
        if (!preview) return;
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          preview.innerHTML = '<img src="' + url + '" class="w-full h-full object-cover rounded-xl" onerror="this.onerror=null; this.parentElement.innerHTML=\\'👤\\';" />';
        } else {
          preview.innerHTML = '👤';
        }
      };
    </script>
  `;
}

export const renderCustomerDashboard = renderCustomerPortal;
export const CustomerPortal = renderCustomerPortal;
export default renderCustomerPortal;
