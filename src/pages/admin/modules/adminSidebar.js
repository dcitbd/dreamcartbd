/**
 * DREAM CART BD — Admin Sidebar & Topbar Module (adminSidebar.js)
 * Refactored to define the 9 navigation groups and ~55 sub-items ONCE and render both:
 * - Mobile Off-Canvas Drawer with Responsive Touch Triggers
 * - Desktop Left Sticky Sidebar with Collapsible Accordion Navigation & Live Counters
 * - Topbar with Dynamic Title, Subtitle, Global Search, Theme Switcher, and Sheet Sync
 */

import { formatCurrency } from '../../../utils/format.js';
import { toast } from '../../../components/Toast.js';

function getAdminNavSchema({
  products = [],
  orders = [],
  uniqueCatCount = 0,
  brands = [],
  banners = [],
  incompleteOrders = [],
  resellers = [],
  wholesalers = [],
  sellers = [],
  markets = [],
  admins = [],
  workers = [],
  costs = [],
  buying = [],
  invest = [],
  couriers = [],
  onlinePayments = [],
  customers = [],
  reviews = [],
  kpi = {}
}) {
  return [
    {
      groupId: 'group-dashboard',
      icon: '📊',
      title: 'ড্যাশবোর্ড ওভারভিউ',
      directPageId: 'page-dashboard'
    },
    {
      groupId: 'group-products',
      icon: '📦',
      title: 'পণ্য ব্যবস্থাপনা',
      items: [
        { pageId: 'page-prod-all', label: 'সকল পণ্য তালিকা', count: products.length, defaultActive: true },
        { pageId: 'page-prod-add', label: '+ নতুন পণ্য যোগ' },
        { pageId: 'page-prod-categories', label: '🗂️ ক্যাটাগরি তালিকা', count: uniqueCatCount },
        { pageId: 'page-prod-bulk-add', label: '📥 বাল্ক পণ্য আপলোড' },
        { pageId: 'page-prod-bulk-price', label: '🏷️ বাল্ক মূল্য পরিবর্তন' },
        { pageId: 'page-prod-bulk-image', label: '🖼️ বাল্ক ইমেজ আপডেট' },
        { pageId: 'page-prod-low-stock', label: '⚠️ লো স্টক (&lt;৫)', count: kpi.low_stock_count },
        { pageId: 'page-prod-out-stock', label: '🚫 আউট অব স্টক (০)', count: kpi.out_of_stock_count },
        { pageId: 'page-prod-error', label: '⚙️ ত্রুটিযুক্ত পণ্য' },
        { pageId: 'page-prod-brands', label: '🏷️ ব্র্যান্ড সমূহ', count: brands.length },
        { pageId: 'page-prod-brand-add', label: '+ ব্র্যান্ড যুক্ত করুন' },
        { pageId: 'page-prod-variants', label: '🎨 কালার ও সাইজ' },
        { pageId: 'page-prod-variant-add', label: '+ ভ্যারিয়েন্ট যুক্ত' },
        { pageId: 'page-prod-banners', label: '🖼️ ব্যানার CMS', count: banners.length },
        { pageId: 'page-prod-landing', label: '🚀 ল্যান্ডিং পেজ CMS' }
      ]
    },
    {
      groupId: 'group-orders',
      icon: '📋',
      title: 'অর্ডার ও কাস্টমার',
      items: [
        { pageId: 'page-orders-all', label: 'সকল অর্ডার তালিকা', count: orders.length },
        { pageId: 'page-orders-incomplete', label: '⚠️ অসম্পূর্ণ অর্ডার', count: incompleteOrders.length },
        { pageId: 'page-orders-success', label: '✓ সফল ডেলিভারি', count: orders.filter(o => o.order_status === 'Delivered').length },
        { pageId: 'page-orders-shipping', label: '🚚 কুরিয়ারে / শিপিং', count: orders.filter(o => o.order_status === 'Shipped' || o.order_status === 'Packing' || o.order_status === 'In Transit').length },
        { pageId: 'page-orders-unpaid', label: '💳 পেমেন্ট বাকি (COD)', count: orders.filter(o => o.payment_status === 'Pending').length },
        { pageId: 'page-orders-cancelled', label: '✕ বাতিল ও রিটার্ন', count: orders.filter(o => o.order_status === 'Cancelled').length },
        { pageId: 'page-orders-add', label: '+ নতুন অর্ডার এন্ট্রি' },
        { pageId: 'page-orders-visitors', label: '🟢 লাইভ ভিজিটর', count: kpi.live_viewers },
        { pageId: 'page-orders-customers', label: '👥 কাস্টমার ডাটাবেজ', count: customers.length },
        { pageId: 'page-orders-reviews', label: '⭐ রিভিউ ও রেটিং', count: reviews.length }
      ]
    },
    {
      groupId: 'group-partners',
      icon: '🤝',
      title: 'পার্টনার নেটওয়ার্ক',
      items: [
        { pageId: 'page-partner-resellers', label: 'রিসেলারসমূহ', count: resellers.length },
        { pageId: 'page-partner-wholesalers', label: 'হোলসেলার / পাইকারি', count: wholesalers.length },
        { pageId: 'page-partner-sellers', label: 'মার্চেন্ট সেলার', count: sellers.length },
        { pageId: 'page-partner-markets', label: 'অন্যান্য মার্কেটপ্লেস', count: markets.length }
      ]
    },
    {
      groupId: 'group-admins',
      icon: '👥',
      title: 'টিম ও অ্যাডমিন',
      items: [
        { pageId: 'page-admin-users', label: 'মাস্টার অ্যাডমিন', count: admins.length },
        { pageId: 'page-admin-workers', label: 'কর্মী ও স্টাফ টিম', count: workers.length }
      ]
    },
    {
      groupId: 'group-reports',
      icon: '📈',
      title: 'রিপোর্ট সেন্টার',
      items: [
        { pageId: 'page-report-seller', label: 'সেলার রিপোর্ট' },
        { pageId: 'page-report-reseller', label: 'রিসেলার রিপোর্ট' },
        { pageId: 'page-report-wholesaler', label: 'হোলসেলার রিপোর্ট' },
        { pageId: 'page-report-sales', label: 'সেলস রিপোর্ট' },
        { pageId: 'page-report-wholesale', label: 'পাইকারি রিপোর্ট' },
        { pageId: 'page-report-costs', label: 'ব্যয় রিপোর্ট' },
        { pageId: 'page-report-buying', label: 'ক্রয় রিপোর্ট' },
        { pageId: 'page-report-invest', label: 'বিনিয়োগ রিপোর্ট' }
      ]
    },
    {
      groupId: 'group-inventory',
      icon: '💰',
      title: 'ফাইন্যান্স ও ইনভেন্টরি',
      items: [
        { pageId: 'page-inv-payout', label: 'রিসেলার পে-আউট', count: '1' },
        { pageId: 'page-inv-costs', label: 'খরচ ও ব্যয় লেজার', count: costs.length },
        { pageId: 'page-inv-buying', label: 'পাইকারি ক্রয় হিসাব', count: buying.length },
        { pageId: 'page-inv-invest', label: 'মূলধন ও বিনিয়োগ', count: invest.length }
      ]
    },
    {
      groupId: 'group-courier',
      icon: '🚚',
      title: 'কুরিয়ার, ফ্রড ও পেমেন্ট',
      items: [
        { pageId: 'page-courier-list', label: 'কুরিয়ারসমূহ', count: couriers.length },
        { pageId: 'page-courier-add', label: '+ কুরিয়ার এপিআই যুক্ত' },
        { pageId: 'page-courier-fraud', label: '🛡️ ফ্রড চেকার (Fraud)' },
        { pageId: 'page-courier-payments', label: '💳 অনলাইন পেমেন্টস', count: onlinePayments.length }
      ]
    },
    {
      groupId: 'group-others',
      icon: '🧩',
      title: 'অন্যান্য',
      mobileTitle: 'অন্যান্য মডিউল',
      directPageId: 'page-others-hub'
    },
    {
      groupId: 'group-settings',
      icon: '⚙️',
      title: 'সিস্টেম সেটিংস',
      items: [
        { pageId: 'page-set-logs', label: 'অডিট ও কর্মী লগ' },
        { pageId: 'page-set-payment', label: 'পেমেন্ট মেথড আপডেট' },
        { pageId: 'page-set-delivery', label: 'ডেলিভারি মেথড কনফিগ' },
        { pageId: 'page-set-offers', label: 'অফার ও কুপন ডিসকাউন্ট' },
        { pageId: 'page-set-info', label: 'ওয়েবসাইট তথ্য আপডেট', mobileLabel: 'দোকানের তথ্য ও হটলাইন' },
        { pageId: 'page-set-profile', label: 'প্রোফাইল আপডেট' },
        { pageId: 'page-set-password', label: 'পাসওয়ার্ড পরিবর্তন' }
      ]
    }
  ];
}

function renderNavGroupsHtml(navGroups, isMobile = false) {
  return navGroups.map(g => {
    const accId = isMobile ? `mob-${g.groupId}` : g.groupId;
    const isDash = g.groupId === 'group-dashboard';
    const dataGroupAttr = isMobile ? '' : ` data-group="${g.groupId}"`;
    const titleHtml = isMobile
      ? `<span>${g.icon} ${g.mobileTitle || g.title}</span>`
      : `<span class="flex items-center gap-2"><span>${g.icon}</span> <b>${g.title}</b></span>`;

    if (g.directPageId) {
      const btnHtml = `
        <button class="admin-sidebar-main-btn${isDash ? ' active' : ''}"${dataGroupAttr} onclick="switchAdminPage('${g.directPageId}', '${g.groupId}')">
          ${titleHtml}
        </button>`;
      return isMobile ? btnHtml : `<div class="dc-sidebar-nav-group">${btnHtml}</div>`;
    }

    const itemsHtml = (g.items || []).map(item => {
      const label = isMobile ? (item.mobileLabel || item.label) : item.label;
      if (isMobile) {
        return `<button class="dc-sidebar-sub-item" onclick="switchAdminPage('${item.pageId}', '${g.groupId}')">${label}</button>`;
      }
      const activeCls = item.defaultActive ? ' active' : '';
      const counterHtml = item.count !== undefined ? `<span class="admin-nav-counter">${item.count}</span>` : '';
      return `
        <button class="dc-sidebar-sub-item${activeCls}" data-page="${item.pageId}" onclick="switchAdminPage('${item.pageId}', '${g.groupId}')">
          <span>${label}</span>
          ${counterHtml}
        </button>`;
    }).join('\n');

    const groupBlock = `
      <button class="admin-sidebar-main-btn"${dataGroupAttr} onclick="toggleSidebarAccordion('${accId}')">
        ${titleHtml}
        <span id="chevron-${accId}" class="chevron">▶</span>
      </button>
      <div id="subnav-${accId}" class="dc-sidebar-subnav closed">
        ${itemsHtml}
      </div>`;

    return isMobile ? groupBlock : `<div class="dc-sidebar-nav-group">${groupBlock}</div>`;
  }).join('\n');
}

export function renderSidebarAndTopbar({
  products = [],
  orders = [],
  categories = [],
  brands = [],
  banners = [],
  incompleteOrders = [],
  resellers = [],
  wholesalers = [],
  sellers = [],
  markets = [],
  workers = [],
  admins = [],
  couriers = [],
  onlinePayments = [],
  kpi = {},
  userDisplayName = 'Jainal Abedin',
  workerType = 'Master Admin',
  workerRole = 'Full System Access',
  customers = [],
  reviews = [],
  costs = [],
  buying = [],
  invest = [],
  activeRoute = { pageId: 'page-dashboard', groupId: 'group-dashboard', slug: 'dashboard', title: '📊 ড্যাশবোর্ড ওভারভিউ', subtitle: '১৮-পয়েন্ট লাইভ বিজনেস কাউন্টার, রাজস্ব ও সেলস গ্রাফ' }
} = {}) {
  const uniqueCatMap = new Map();
  categories.forEach(c => {
    const raw = (c.category || '').trim();
    if (raw) uniqueCatMap.set(raw.toLowerCase(), true);
  });
  const uniqueCatCount = uniqueCatMap.size || categories.length;

  const navGroups = getAdminNavSchema({
    products, orders, uniqueCatCount, brands, banners, incompleteOrders,
    resellers, wholesalers, sellers, markets, admins, workers,
    costs, buying, invest, couriers, onlinePayments, customers, reviews, kpi
  });

  const quickTabs = [
    { href: '/admin/dashboard', pageId: 'page-dashboard', groupId: 'group-dashboard', label: '📊 ড্যাশবোর্ড' },
    { href: '/admin/products', pageId: 'page-prod-all', groupId: 'group-products', label: '📦 প্রোডাক্টস' },
    { href: '/admin/addproduct', pageId: 'page-prod-add', groupId: 'group-products', label: '➕ প্রোডাক্ট যোগ' },
    { href: '/admin/categroy', pageId: 'page-prod-categories', groupId: 'group-products', label: '🗂️ ক্যাটাগরি' },
    { href: '/admin/brands', pageId: 'page-prod-brands', groupId: 'group-products', label: '🏷️ ব্র্যান্ডসমূহ' },
    { href: '/admin/orders', pageId: 'page-orders-all', groupId: 'group-orders', label: '📋 অর্ডারসমূহ' },
    { href: '/admin/landing', pageId: 'page-prod-landing', groupId: 'group-products', label: '🚀 ল্যান্ডিং পেজ' },
    { href: '/admin/others', pageId: 'page-others-hub', groupId: 'group-others', label: '🧩 অন্যান্য' }
  ];

  return `
    <!-- Mobile Off-Canvas Sidebar Overlay Backdrop -->
    <div
      id="admin-sidebar-overlay"
      class="dc-admin-overlay"
      onclick="window.closeAdminSidebar && window.closeAdminSidebar()"
    ></div>

    <!-- Mobile Drawer with Accordion Navigation -->
    <div id="admin-sidebar-drawer" class="dc-admin-drawer closed">
      <div class="space-y-3 overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="dc-sidebar-logo" style="background:#ffffff;padding:2px;overflow:hidden;border:1px solid #10b981;"><img src="${(typeof window !== 'undefined' && window.getDcbdLogoUrl) ? window.getDcbdLogoUrl() : '/public/icon/logo.png'}" alt="Dream Cart BD" style="width:100%;height:100%;object-fit:contain;border-radius:8px;" onerror="window.handleDcbdLogoError ? window.handleDcbdLogoError(this) : (this.src='/icon/logo.png');" /></div>
            <div>
              <div class="font-black text-sm text-slate-900 dark:text-white">Dream Cart BD</div>
              <div class="text-[10px] text-emerald-600 font-bold">Admin Console</div>
            </div>
          </div>
          <button class="p-1 rounded-lg text-slate-400 hover:text-rose-500 font-bold" onclick="window.closeAdminSidebar && window.closeAdminSidebar()">✕</button>
        </div>

        <!-- Mobile Groups (Rendered from Unified Schema) -->
        <div class="space-y-1">
          ${renderNavGroupsHtml(navGroups, true)}
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
        <button class="btn-secondary w-full py-1.5 text-xs text-rose-600 border-rose-200" onclick="window.handleAdminLogout && window.handleAdminLogout()">
          লগআউট ✕
        </button>
      </div>
    </div>

    <!-- Main Desktop Layout: Sidebar with Accordion + Fluid Panel -->
    <div class="dc-admin-layout">

      <!-- Desktop Left Sticky Sidebar (সাইড বার) -->
      <aside class="dc-admin-sidebar">

        <!-- Brand Badge Header -->
        <div class="dc-sidebar-brand">
          <div class="dc-sidebar-logo" style="background:#ffffff;padding:2px;overflow:hidden;border:1px solid #10b981;"><img src="${(typeof window !== 'undefined' && window.getDcbdLogoUrl) ? window.getDcbdLogoUrl() : '/public/icon/logo.png'}" alt="Dream Cart BD" style="width:100%;height:100%;object-fit:contain;border-radius:8px;" onerror="window.handleDcbdLogoError ? window.handleDcbdLogoError(this) : (this.src='/icon/logo.png');" /></div>
          <div>
            <div class="dc-sidebar-title">Dream Cart BD</div>
            <span class="dc-sidebar-badge">মাস্টার অ্যাডমিন পোর্টাল</span>
          </div>
        </div>

        <!-- Logged-in Worker Profile Card -->
        <div class="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-xs flex-shrink-0 border border-emerald-500/20">
            👤
          </div>
          <div class="min-w-0">
            <div class="font-black text-xs text-slate-900 dark:text-white truncate">${userDisplayName}</div>
            <div class="text-[9px] text-slate-400 font-medium">${workerType} • ${workerRole}</div>
          </div>
        </div>

        <!-- NAVIGATION ACCORDIONS (Rendered from Unified Schema) -->
        <div class="space-y-1">
          ${renderNavGroupsHtml(navGroups, false)}
        </div>

        <!-- Sidebar Footer -->
        <div class="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 mt-auto text-xs">
          <div class="flex items-center justify-between px-1 text-[10px] text-slate-400">
            <span class="flex items-center gap-1.5 font-bold text-emerald-600">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Google Sheets
            </span>
            <span class="font-mono text-[9px] text-slate-400">v3.5 Live</span>
          </div>

          <div class="flex items-center gap-1.5 pt-0.5">
            <a href="/products" target="_blank" class="btn-secondary py-1 px-2.5 text-[10px] font-bold flex-1 text-center bg-slate-100 dark:bg-slate-800">
              শপ ভিউ ↗
            </a>
            <button class="btn-secondary py-1 px-2 text-[10px] font-bold text-rose-600 border-rose-200 hover:bg-rose-50" onclick="window.handleAdminLogout && window.handleAdminLogout()" title="লগআউট">
              ✕
            </button>
          </div>
        </div>

      </aside>

      <!-- Right Main Panel Header -->
      <main id="admin-main-panel" class="dc-admin-main">

        <!-- Top Bar -->
        <div class="dc-admin-topbar">
          <div class="flex items-center gap-2.5">
            <button
              class="lg:hidden p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-emerald-50 transition"
              onclick="window.toggleAdminSidebar && window.toggleAdminSidebar()"
              aria-label="Toggle Menu"
            >
              ☰ মেনু
            </button>
            <div>
              <h2 id="admin-current-tab-title" class="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                ${activeRoute.title}
              </h2>
              <p id="admin-current-tab-subtitle" class="text-[10px] sm:text-[11px] text-slate-400">${activeRoute.subtitle}</p>
            </div>
          </div>

          <!-- Global Search & Actions -->
          <div class="flex items-center gap-1.5">
            <div class="relative hidden sm:block">
              <input
                type="text"
                placeholder="বর্তমান পেজে সার্চ..."
                class="form-control text-xs py-1.5 pl-7 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 w-36 md:w-52"
                oninput="window.handleAdminGlobalSearch(this.value)"
              />
              <span class="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>

            <button
              id="admin-theme-toggle"
              class="btn-secondary text-xs py-1.5 px-2 bg-slate-50 dark:bg-slate-800 font-bold"
              onclick="window.toggleAdminTheme && window.toggleAdminTheme()"
              title="থিম পরিবর্তন"
            >
              <span id="admin-theme-icon">🌙</span>
            </button>

            <a href="/" onclick="if(window.router){event.preventDefault();window.router.navigate('/');}" class="btn-secondary text-xs py-1.5 px-3 font-bold" title="হোম পেজে যান">
              🏠 হোম পেজ ↗
            </a>

            <button
              class="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1 font-bold"
              onclick="const ic = this.querySelector('.spin-icon'); if(ic) ic.classList.add('animate-spin'); setTimeout(() => { if(ic) ic.classList.remove('animate-spin'); if(toast && toast.show) toast.show({type: 'success', title: 'ডাটা আপডেট', message: 'গুগল শিট থেকে ডাটা রিফ্রেশ হয়েছে!'}); }, 600);"
              title="রিফ্রেশ ডাটা"
            >
              <span class="spin-icon">🔄</span> <span class="hidden md:inline">সিঙ্ক</span>
            </button>
          </div>

          <!-- Quick Page Route Navigation Bar (domain/admin/...) -->
          <div class="w-full pt-2.5 mt-1 border-t flex items-center justify-between gap-2 overflow-x-auto">
            <div class="flex items-center gap-1.5 text-xs">
              ${quickTabs.map(t => `<a href="${t.href}" onclick="event.preventDefault(); switchAdminPage('${t.pageId}', '${t.groupId}')" data-page="${t.pageId}" class="admin-route-tab ${activeRoute.pageId === t.pageId ? 'active' : ''}">${t.label}</a>`).join('\n              ')}
            </div>
            <span
              id="admin-current-route-badge"
              onclick="window.copyToClipboard(window.location.origin + '/admin/${activeRoute.slug}', 'পেজ লিঙ্ক কপি হয়েছে!')"
              class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-bold cursor-pointer"
              title="ক্লিক করে পেজ URL কপি করুন"
            >
              🔗 /admin/${activeRoute.slug}
            </span>
          </div>
        </div>
  `;
}
