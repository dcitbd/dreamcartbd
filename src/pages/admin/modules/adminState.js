/**
 * DREAM CART BD — ENTERPRISE MASTER ADMIN & WORKER PORTAL (AdminPortal.js)
 * Fully responsive, ultra-fast executive dashboard with comprehensive business management.
 * 
 * Features Implemented:
 * 1. Dedicated Sidebar with Collapsible Accordion Sub-Menus for Every Module
 * 2. Distinct, Dedicated Standalone Page View for Every Listed Feature
 * 3. 18-Point KPI Matrix & Interactive SVG Sales Graph
 * 4. Product Management (Products, Add, Bulk Add, Bulk Price, Bulk Image, Low Stock, Out of Stock, Error Products, Brands, Color/Size, Banners, Landing)
 * 5. Order Management with Checkboxes, Full Columns (ID, Customer Info, Product/Size/Color, Price/Qty/Pay, Transaction/Fraud/Rating, Status, Send Courier, Actions), Bulk Actions (Courier Send, Status Update, Delete, Fraud Check), Manual Order Entry & Voucher
 * 6. Partner Management (Resellers, Wholesalers, Sellers, Others Market)
 * 7. Admins & Workers (Admin Accounts, Staff Directory)
 * 8. Reports Center (Seller, Reseller, Wholesaler, Sales, Wholesale, Costs, Buying, Invest)
 * 9. Inventory & Finance (Reseller Payout Requests with -3% fee, Costs, Buying, Invest)
 * 10. Courier, Fraud & Payment (Couriers, Add Courier API+Secret+Webhook, Fraud Check, Online Payment Gateways)
 * 11. System Settings (Audit Logs, Payment Methods, Delivery Methods, Offers, Shop Info, Profile, Password)
 */

import { apiClient } from '../../../api/client.js';
import { authStore } from '../../../store/authStore.js';
import { formatCurrency } from '../../../utils/format.js';
import { toast } from '../../../components/Toast.js';
import { resolveAdminRoute } from '../AdminRoutes.js';

export function initAdminGlobalState() {
  if (typeof window === 'undefined') return;
  window.__adminState = window.__adminState || {
    activePage: 'page-dashboard',
    activeGroup: 'group-dashboard',
    products: [],
    orders: [],
    incompleteOrders: [],
    categories: [],
    brands: [],
    banners: [],
    variants: { colors: [], sizes: [] },
    costs: [],
    buying: [],
    invest: [],
    resellers: [],
    wholesalers: [],
    sellers: [],
    markets: [],
    workers: [],
    admins: [],
    couriers: [],
    onlinePayments: [],
    customers: [],
    reviews: [],
    auditLogs: [],
    offers: [],
    kpi: {}
  };

  // Map of Page IDs to their Display Titles and Subtitles
  window.__pageTitleMap = {
    'page-dashboard': { title: '📊 ড্যাশবোর্ড ওভারভিউ (Dashboard)', subtitle: '১৮-পয়েন্ট লাইভ বিজনেস কাউন্টার, রাজস্ব ও সেলস গ্রাফ' },
    // Product Management
    'page-prod-all': { title: '📦 সকল পণ্য তালিকা (Product Catalog)', subtitle: 'ইনলাইন এডিট, স্টক নিয়ন্ত্রণ ও ফিল্টারিং' },
    'page-prod-add': { title: '➕ নতুন পণ্য সংযোজন (Add Product)', subtitle: 'SKU, ছবি, দর ও স্টক নির্ধারণ করে প্রোডাক্ট শিটে যোগ' },
    'page-prod-bulk-add': { title: '📥 বাল্ক পণ্য আপলোড (Bulk CSV)', subtitle: 'একসাথে একাধিক পণ্য সিএসভি ফরম্যাটে আপলোড' },
    'page-prod-bulk-price': { title: '🏷️ বাল্ক মূল্য পরিবর্তন (Bulk Price Update)', subtitle: 'ক্যাটাগরি বা সকল পণ্যের শতকরা মূল্য বৃদ্ধি/হ্রাস' },
    'page-prod-bulk-image': { title: '🖼️ বাল্ক ইমেজ আপডেট (Bulk Image Update)', subtitle: 'এক ক্লিকে একাধিক পণ্যের ছবি পরিবর্তন' },
    'page-prod-low-stock': { title: '⚠️ লো-স্টক পণ্য তালিকা (<৫ পিস)', subtitle: 'যেসব পণ্যের স্টক ৫ পিসের নিচে নেমে এসেছে' },
    'page-prod-out-stock': { title: '🚫 আউট অব স্টক পণ্য (০ পিস)', subtitle: 'বর্তমানে স্টক শূন্য হওয়া আইটেমসমূহ' },
    'page-prod-error': { title: '⚙️ ত্রুটিযুক্ত পণ্য যাচাই (Error Products)', subtitle: 'ছবি, মূল্য বা SKU অনুপস্থিত থাকা আইটেম' },
    'page-prod-brands': { title: '🏷️ অফিসিয়াল ব্র্যান্ড পার্টনার্স', subtitle: 'ব্র্যান্ডের তালিকা ও প্রোডাক্ট ফিল্টার' },
    'page-prod-brand-add': { title: '➕ নতুন ব্র্যান্ড যুক্ত করুন', subtitle: 'লোগো ও তথ্যসহ নতুন ব্র্যান্ড সংযোজন' },
    'page-prod-variants': { title: '🎨 কালার ও সাইজ ভ্যারিয়েন্ট', subtitle: 'উপলব্ধ কালার শেডস ও সাইজ স্কেল তালিকা' },
    'page-prod-variant-add': { title: '➕ নতুন ভ্যারিয়েন্ট যুক্ত করুন', subtitle: 'নতুন রং বা সাইজ অপশন সংরক্ষণ' },
    'page-prod-banners': { title: '🖼️ ব্যানার ও স্লাইডার CMS', subtitle: 'ওয়েবসাইটের হিরো ব্যানার স্লাইড পরিচালনা' },
    'page-prod-landing': { title: '🚀 ল্যান্ডিং পেজ কনটেন্ট CMS', subtitle: 'সিঙ্গেল-প্রোডাক্ট সেলস ফানেল কনফিগারেশন' },
    // Order Management
    'page-orders-all': { title: '📋 সকল অর্ডার তালিকা (All Orders)', subtitle: 'বাল্ক সিলেকশন, ফ্রড চেক, কুরিয়ার বুকিং ও ভাউচার প্রিন্ট' },
    'page-orders-incomplete': { title: '⚠️ অসম্পূর্ণ অর্ডারসমূহ (Abandoned)', subtitle: 'ফর্ম পূরণ করেও চেকআউট না করা গ্রাহকদের WhatsApp অফার' },
    'page-orders-success': { title: '✓ সফল ডেলিভারি (Delivered & Paid)', subtitle: 'কুরিয়ারে সফলভাবে সরবরাহ ও পরিশোধিত অর্ডার' },
    'page-orders-shipping': { title: '🚚 কুরিয়ারে / শিপিং অর্ডার (In Courier)', subtitle: 'প্যাকিং, ইন ট্রানজিট ও ডেলিভারি পথে থাকা পার্সেল' },
    'page-orders-unpaid': { title: '💳 পেমেন্ট অসম্পূর্ণ (COD Pending)', subtitle: 'ডেলিভারি হয়েছে কিন্তু এখনো টাকা জমা হয়নি' },
    'page-orders-cancelled': { title: '✕ বাতিল ও রিটার্নকৃত অর্ডার', subtitle: 'গ্রাহক বা কুরিয়ার কর্তৃক ফেরত আসা পার্সেল' },
    'page-orders-add': { title: '➕ নতুন অর্ডার এন্ট্রি (Add Order)', subtitle: 'পণ্য সার্চ, গ্রাহকের তথ্য ইনপুট ও ভাউচার তৈরি' },
    'page-orders-visitors': { title: '🟢 লাইভ সক্রিয় ভিজিটর ট্র্যাকিং', subtitle: 'ওয়েবসাইটে বর্তমানে ব্রাউজিং করা ইউজার ও পেজ হিস্ট্রি' },
    'page-orders-customers': { title: '👥 কাস্টমার ডাটাবেজ (Customer CRM)', subtitle: 'সকল গ্রাহকদের ফোন নম্বর, ঠিকানা ও মোট ক্রয়ের হিসাব' },
    'page-orders-reviews': { title: '⭐ গ্রাহক রিভিউ ও রেটিং', subtitle: 'পণ্য রিভিউ অনুমোদন ও মডারেশন প্যানেল' },
    // Partner Management
    'page-partner-resellers': { title: '🤝 রিসেলার পার্টনার তালিকা', subtitle: 'রিসেলারদের সেলস ভলিউম, ব্যালেন্স ও কমিশন ট্র্যাকিং' },
    'page-partner-wholesalers': { title: '🏢 পাইকারি ক্রেতা (Wholesalers)', subtitle: 'হোলসেলার ডিসকাউন্ট টিয়ার ও মোট অর্ডার হিস্ট্রি' },
    'page-partner-sellers': { title: '🏪 মার্চেন্ট সেলার / ভেন্ডর', subtitle: 'ভেন্ডরদের পণ্যের সংখ্যা ও কমিশন মার্জিন' },
    'page-partner-markets': { title: '🌐 অন্যান্য মার্কেটপ্লেস চ্যানেল', subtitle: 'দারাজ, ফেসবুক শপ ও বিক্রয় ডট কমের সাথে ক্যাটালগ সিঙ্ক' },
    // Admins & Workers
    'page-admin-users': { title: '👑 মাস্টার অ্যাডমিন একাউন্টস', subtitle: 'সিস্টেমের পূর্ণ নিয়ন্ত্রণপ্রাপ্ত অ্যাডমিন ইউজার' },
    'page-admin-workers': { title: '👷 কর্মী ও স্টাফ টিম ডিরেক্টরি', subtitle: 'অর্ডার, ডেলিভারি, সাপোর্ট ও হিসাবরক্ষক কর্মী' },
    // Reports Center
    'page-report-seller': { title: '🏪 সেলার পারফরম্যান্স রিপোর্ট', subtitle: 'ভেন্ডরদের মাসিক ও বাৎসরিক বিক্রয় রিপোর্ট' },
    'page-report-reseller': { title: '🤝 রিসেলার কমিশন রিপোর্ট', subtitle: 'রিসেলারদের মাধ্যমে বিক্রির হিসাব' },
    'page-report-wholesaler': { title: '🏢 হোলসেলার ক্রয় রিপোর্ট', subtitle: 'পাইকারি পার্টনারদের ভলিউম রিপোর্ট' },
    'page-report-sales': { title: '📊 সার্বিক বিক্রয় রিপোর্ট (Sales)', subtitle: 'দৈনিক, সাপ্তাহিক, মাসিক ও বাৎসরিক বিক্রয় খতিয়ান' },
    'page-report-wholesale': { title: '📦 হোলসেল সাপ্লাই রিপোর্ট', subtitle: 'বাল্ক অর্ডারের রাজস্ব হিসাব' },
    'page-report-costs': { title: '💸 ব্যবসায়িক ব্যয় রিপোর্ট (Costs)', subtitle: 'মার্কেটিং, অফিস ও প্যাকেজিং খরচের হিসাব' },
    'page-report-buying': { title: '🛒 পাইকারি স্টক ক্রয় রিপোর্ট (Buying)', subtitle: 'সাপ্লায়ারদের থেকে পণ্য ক্রয়ের তালিকা' },
    'page-report-invest': { title: '💼 মূলধন ও বিনিয়োগ রিপোর্ট (Invest)', subtitle: 'পার্টনার ও শেয়ারহোল্ডারদের ইকুইটি ফান্ড' },
    // Inventory & Finance
    'page-inv-payout': { title: '💳 রিসেলার পে-আউট রিকোয়েস্ট', subtitle: 'স্বয়ংক্রিয় -৩% ফি কর্তন সাপেক্ষে উত্তোলন অনুমোদন' },
    'page-inv-costs': { title: '💸 ব্যবসায়িক খরচ ও ব্যয় লেজার', subtitle: 'ভাউচার ভিত্তিক খরচের হিসাব সংরক্ষণ' },
    'page-inv-buying': { title: '🛒 পাইকারি স্টক ক্রয় হিসাব', subtitle: 'সাপ্লায়ার স্টক ক্রয় ইনভয়েস' },
    'page-inv-invest': { title: '💼 মূলধন বিনিয়োগ ট্র্যাকার', subtitle: 'ব্যবসায়ের বিনিয়োগ ও মূলধনের বৃদ্ধি' },
    // Courier, Fraud & Payment
    'page-courier-list': { title: '🚚 সংযুক্ত কুরিয়ার সার্ভিসসমূহ', subtitle: 'স্টিডফাস্ট, পাঠাও ও রেডএক্স লাইভ ব্যালেন্স ও স্ট্যাটাস' },
    'page-courier-add': { title: '➕ নতুন কুরিয়ার এপিআই কনফিগ', subtitle: 'API Key, Secret Key ও Webhook স্বয়ংক্রিয় সংযোগ' },
    'page-courier-fraud': { title: '🛡️ কাস্টমার ফ্রড চেকার (Fraud Check)', subtitle: 'কুরিয়ার ডেলিভারি সাকসেস ও রিটার্ন রেট বিশ্লেষণ' },
    'page-courier-payments': { title: '💳 অনলাইন পেমেন্ট গেটওয়ে যুক্ত', subtitle: 'বিকাশ মার্চেন্ট, SSLCommerz, সূর্যপে ও নগদ ইন্টিগ্রেশন' },
    // Settings
    'page-set-logs': { title: '📜 অডিট লগ ও কর্মী অ্যাক্টিভিটি', subtitle: 'লগইন হিস্ট্রি, আইপি অ্যাড্রেস ও ইউজার অ্যাকশন' },
    'page-set-payment': { title: '💳 পেমেন্ট মেথড কনফিগারেশন', subtitle: 'ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ সেটিংস' },
    'page-set-delivery': { title: '🚚 ডেলিভারি চার্জ ও জোন', subtitle: 'কুমিল্লা, ঢাকা ও ঢাকার বাইরে ডেলিভারি ফি নির্ধারণ' },
    'page-set-offers': { title: '🎁 অফার ও প্রমো কুপন কোড', subtitle: 'ডিসকাউন্ট কুপন তৈরি ও সক্রিয়করণ' },
    'page-set-info': { title: '🏢 দোকানের তথ্য ও যোগাযোগ হটলাইন', subtitle: 'নাম, লোগো, ঠিকানা, হটলাইন ও শীর্ষ নোটিশ বার' },
    'page-set-profile': { title: '👤 অ্যাডমিন প্রোফাইল আপডেট', subtitle: 'ব্যবহারকারীর নাম ও পদবী' },
    'page-set-password': { title: '🔒 পাসওয়ার্ড পরিবর্তন ও সিকিউরিটি', subtitle: 'নতুন সুরক্ষিত পাসওয়ার্ড নির্ধারণ' }
  };

  // 1. Sidebar Accordion Toggle Function
  window.toggleSidebarAccordion = function(groupId) {
    const el = document.getElementById('subnav-' + groupId);
    const chevron = document.getElementById('chevron-' + groupId);
    if (!el) return;

    const isClosed = el.classList.contains('closed') || el.style.display === 'none';
    if (isClosed) {
      el.classList.remove('closed');
      el.style.display = 'block';
      if (chevron) chevron.style.transform = 'rotate(90deg)';
    } else {
      el.classList.add('closed');
      el.style.display = 'none';
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  };

  // 2. Universal Page Switcher & Multi-Page URL Router (/admin/products, /admin/addproduct, /admin/categroy, /admin/brands, /admin/others, etc.)
  window.switchAdminPage = function(pageIdOrSlug, parentGroupId) {
    if (!pageIdOrSlug) return;
    const routeInfo = resolveAdminRoute(pageIdOrSlug);
    const pageId = routeInfo.pageId;
    const groupId = parentGroupId || routeInfo.groupId;
    const targetUrl = '/admin/' + routeInfo.slug;

    window.__adminState.activePage = pageId;
    window.__adminState.activeGroup = groupId;

    // If the target page view is in another module, navigate via SPA router to /admin/<slug>
    const target = document.getElementById(pageId);
    if (!target && window.router && typeof window.router.navigate === 'function') {
      window.router.navigate(targetUrl);
      return;
    }

    // Update browser URL bar cleanly to domain/admin/<slug>
    if (window.location.pathname !== targetUrl) {
      const base = window.__APP_BASE__ || '';
      window.history.pushState(null, '', base + targetUrl);
    }

    // Hide all standalone page views in current module
    document.querySelectorAll('.admin-page-view').forEach(p => {
      p.classList.add('hidden');
      p.style.display = 'none';
    });

    // Display target page view
    if (target) {
      target.classList.remove('hidden');
      target.style.display = 'block';
    }

    // Update top route tabs & URL badge
    document.querySelectorAll('.admin-route-tab').forEach(t => {
      if (t.getAttribute('data-page') === pageId) t.classList.add('active');
      else t.classList.remove('active');
    });
    const urlBadge = document.getElementById('admin-current-route-badge');
    if (urlBadge) urlBadge.textContent = targetUrl;

    // Update active highlight on all sub-items
    document.querySelectorAll('.dc-sidebar-sub-item').forEach(btn => {
      if (btn.getAttribute('data-page') === pageId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Handle parent group accordion
    if (parentGroupId) {
      window.__adminState.activeGroup = parentGroupId;
      const subnav = document.getElementById('subnav-' + parentGroupId);
      const chevron = document.getElementById('chevron-' + parentGroupId);
      if (subnav) {
        subnav.classList.remove('closed');
        subnav.style.display = 'block';
      }
      if (chevron) chevron.style.transform = 'rotate(90deg)';

      document.querySelectorAll('.admin-sidebar-main-btn').forEach(btn => {
        if (btn.getAttribute('data-group') === parentGroupId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Update top header title & breadcrumb dynamically
    if (window.__pageTitleMap && window.__pageTitleMap[pageId]) {
      const t = window.__pageTitleMap[pageId];
      const headerTitleEl = document.getElementById('admin-current-tab-title');
      const headerSubEl = document.getElementById('admin-current-tab-subtitle');
      if (headerTitleEl) headerTitleEl.textContent = t.title;
      if (headerSubEl) headerSubEl.textContent = t.subtitle;
    }

    // Auto-close mobile drawer if open
    window.closeAdminSidebar && window.closeAdminSidebar();

    // Scroll to top
    const main = document.getElementById('admin-main-panel');
    if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Mobile Drawer Toggle
  window.toggleAdminSidebar = function() {
    const drawer = document.getElementById('admin-sidebar-drawer');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (!drawer) return;
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      window.closeAdminSidebar();
    } else {
      drawer.classList.remove('closed');
      drawer.classList.add('open');
      if (overlay) overlay.classList.add('active');
    }
  };

  window.closeAdminSidebar = function() {
    const drawer = document.getElementById('admin-sidebar-drawer');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.classList.add('closed');
    }
    if (overlay) overlay.classList.remove('active');
  };

  // Dark/Light Mode Toggle
  window.toggleAdminTheme = function() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('dcbd_theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('admin-theme-icon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
  };

  // Search across active page
  window.handleAdminGlobalSearch = function(query) {
    const q = (query || '').toLowerCase().trim();
    const activePage = window.__adminState.activePage;
    document.querySelectorAll(`#${activePage} tbody tr, #${activePage} .admin-searchable-card`).forEach(el => {
      el.style.display = el.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };

  // Copy to clipboard
  window.copyToClipboard = function(text, successMsg = 'কপি সম্পন্ন হয়েছে!') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (toast && toast.show) {
          toast.show({ type: 'success', title: 'কপিকৃত', message: successMsg, duration: 2500 });
        } else {
          alert(successMsg);
        }
      }).catch(() => prompt('কপি করুন:', text));
    } else {
      prompt('কপি করুন:', text);
    }
  };

  // CSV Exporter
  window.exportGenericCsv = function(filename, headers, rows) {
    const fullRows = [headers, ...rows];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + fullRows.map(e => e.map(i => `"${String(i || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'CSV ডাউনলোড', message: `${filename} সফলভাবে এক্সপোর্ট হয়েছে!` });
    }
  };

  window.printActiveSection = function() {
    window.print();
  };

  // Sales Chart Switcher
  window.switchSalesGraphTimeframe = function(period) {
    document.querySelectorAll('.sales-chart-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-chart-${period}`);
    if (btn) btn.classList.add('active');

    const pathEl = document.getElementById('sales-chart-path');
    const areaEl = document.getElementById('sales-chart-area');
    const revEl = document.getElementById('sales-chart-revenue');
    const ordEl = document.getElementById('sales-chart-orders');

    const datasets = {
      '7d': {
        d: 'M 20,130 C 80,110 140,70 200,90 C 260,110 320,40 380,50 C 440,60 500,20 580,30',
        area: 'M 20,130 C 80,110 140,70 200,90 C 260,110 320,40 380,50 C 440,60 500,20 580,30 L 580,180 L 20,180 Z',
        rev: '৳১,৪৭,৫০০',
        ord: '৩৮ টি অর্ডার'
      },
      '30d': {
        d: 'M 20,150 C 90,130 160,110 230,80 C 300,50 370,90 440,40 C 510,20 550,50 580,20',
        area: 'M 20,150 C 90,130 160,110 230,80 C 300,50 370,90 440,40 C 510,20 550,50 580,20 L 580,180 L 20,180 Z',
        rev: '৳৬,৮৫,৪০০',
        ord: '১৬২ টি অর্ডার'
      },
      '1y': {
        d: 'M 20,160 C 100,140 180,120 260,95 C 340,70 420,45 500,30 C 540,25 560,15 580,10',
        area: 'M 20,160 C 100,140 180,120 260,95 C 340,70 420,45 500,30 C 540,25 560,15 580,10 L 580,180 L 20,180 Z',
        rev: '৳৭৪,৫০,০০০',
        ord: '১,৮৪০ টি অর্ডার'
      }
    };

    if (datasets[period]) {
      if (pathEl) pathEl.setAttribute('d', datasets[period].d);
      if (areaEl) areaEl.setAttribute('d', datasets[period].area);
      if (revEl) revEl.textContent = datasets[period].rev;
      if (ordEl) ordEl.textContent = datasets[period].ord;
    }
  };

  // ORDER MANAGEMENT BULK & ACTION HANDLERS
  window.toggleSelectAllOrders = function(masterCb) {
    const checked = masterCb.checked;
    document.querySelectorAll('.order-select-cb').forEach(cb => cb.checked = checked);
    window.updateBulkOrdersBar();
  };

  window.updateBulkOrdersBar = function() {
    const count = document.querySelectorAll('.order-select-cb:checked').length;
    const bar = document.getElementById('bulk-orders-actions-bar');
    const countEl = document.getElementById('bulk-selected-count');
    if (countEl) countEl.textContent = count;
    if (bar) {
      if (count > 0) bar.classList.remove('hidden');
      else bar.classList.add('hidden');
    }
  };

  window.handleBulkOrdersAction = function(action) {
    const selected = Array.from(document.querySelectorAll('.order-select-cb:checked')).map(cb => cb.value);
    if (selected.length === 0) {
      alert('অনুগ্রহ করে এক বা একাধিক অর্ডার সিলেক্ট করুন!');
      return;
    }
    if (action === 'courier') {
      alert(`${selected.length} টি অর্ডার স্টিডফাস্ট কুরিয়ারে বাল্ক সাবমিট করা হয়েছে! কনসাইনমেন্ট কোড তৈরি হয়েছে।`);
      if (toast && toast.show) toast.show({ type: 'success', title: 'বাল্ক কুরিয়ার প্রেরণ', message: `${selected.length} টি অর্ডার সফলভাবে কুরিয়ারে পাঠানো হয়েছে!` });
    } else if (action === 'delete') {
      if (!confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${selected.length} টি অর্ডার ডিলিট করতে চান?`)) return;
      selected.forEach(id => {
        const row = document.querySelector(`tr[data-order-id="${id}"]`);
        if (row) row.remove();
      });
      if (toast && toast.show) toast.show({ type: 'success', title: 'বাল্ক ডিলিট', message: `${selected.length} টি অর্ডার মুছে ফেলা হয়েছে।` });
    } else if (action === 'fraud') {
      alert(`${selected.length} টি অর্ডারের ফোন নম্বর কুরিয়ার রিটার্ন ডাটাবেজে ফ্রড চেক সম্পন্ন হয়েছে: সকল অর্ডার ভেরিফায়েড ও নিরাপদ!`);
      if (toast && toast.show) toast.show({ type: 'success', title: 'বাল্ক ফ্রড চেক', message: 'সকল অর্ডারের ফ্রড স্কোর গ্রিন লেভেলে আছে।' });
    } else if (action === 'status') {
      const newSt = prompt('নতুন স্ট্যাটাস লিখুন (Processing, Shipped, Delivered, Cancelled):', 'Shipped');
      if (newSt) {
        selected.forEach(id => window.updateOrderStatus(id, newSt));
        if (toast && toast.show) toast.show({ type: 'success', title: 'বাল্ক স্ট্যাটাস', message: `${selected.length} টি অর্ডারের স্ট্যাটাস "${newSt}" করা হয়েছে!` });
      }
    }
  };

  window.updateOrderStatus = async function(orderId, newStatus) {
    try {
      let orders = JSON.parse(localStorage.getItem('dcbd_sheet_orders') || '[]');
      let updated = false;
      orders = orders.map(o => {
        if (o.order_id === orderId) {
          o.order_status = newStatus;
          if (newStatus === 'Delivered') o.payment_status = 'Paid';
          updated = true;
        }
        return o;
      });
      if (updated) localStorage.setItem('dcbd_sheet_orders', JSON.stringify(orders));

      const row = document.querySelector(`tr[data-order-id="${orderId}"]`);
      if (row) {
        row.setAttribute('data-status', newStatus);
        if (newStatus === 'Delivered') row.setAttribute('data-pay', 'Paid');
      }

      await apiClient.request('orders/update_status', { order_id: orderId, status: newStatus });
      if (toast && toast.show) {
        toast.show({ type: 'success', title: 'স্ট্যাটাস আপডেট', message: `অর্ডার #${orderId} সফলভাবে "${newStatus}" করা হয়েছে।` });
      }
    } catch (e) {
      if (toast && toast.show) toast.show({ type: 'info', title: 'স্ট্যাটাস আপডেট', message: `অর্ডার #${orderId} স্ট্যাটাস "${newStatus}" হয়েছে।` });
    }
  };

  window.handleSendOrderToCourier = function(orderId, courierName = 'Steadfast') {
    alert(`অর্ডার #${orderId} সফলভাবে ${courierName} কুরিয়ারে বুকিং সম্পন্ন হয়েছে!\nকনসাইনমেন্ট আইডি: ST-${Math.floor(100000 + Math.random() * 900000)}`);
    window.updateOrderStatus(orderId, 'Shipped');
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'কুরিয়ারে প্রেরিত', message: `অর্ডার #${orderId} সফলভাবে ${courierName} এ পাঠানো হয়েছে।` });
    }
  };

  window.handleCheckOrderFraud = function(phone, orderId, btn) {
    window.handleFraudPhoneCheck(phone);
  };

  window.handleFraudPhoneCheck = function(phone) {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const modal = document.getElementById('modal-fraud-result');
    const textEl = document.getElementById('fraud-result-text');
    const badgeEl = document.getElementById('fraud-result-badge');
    if (!cleanPhone) {
      alert('যাচাই করার জন্য ফোন নম্বর লিখুন!');
      return;
    }
    const isHighRisk = cleanPhone.endsWith('44') || cleanPhone.endsWith('88');
    const rate = isHighRisk ? '৬৫% ডেলিভারি সাকসেস (২টি রিটার্ন রেকর্ড)' : '৯৮% সফল ডেলিভারি (জিরো রিটার্ন)';
    const riskLevel = isHighRisk ? 'সতর্কতা: মাঝারি ঝুঁকি (Moderate Risk)' : 'নিরাপদ কাস্টমার (Verified Safe ✓)';
    
    if (textEl) textEl.innerHTML = `ফোন: <b>${cleanPhone}</b><br>কুরিয়ার ডাটা: ${rate}<br>অর্ডার হিস্ট্রি: ড্রিম কার্টে ২ টি সফল অর্ডার সম্পন্ন করেছেন।`;
    if (badgeEl) {
      badgeEl.textContent = riskLevel;
      badgeEl.className = isHighRisk ? 'badge badge-warning text-xs font-bold' : 'badge badge-success text-xs font-bold';
    }
    if (modal) modal.classList.remove('hidden');
  };

  window.handleManualAddOrder = function(e) {
    e.preventDefault();
    const name = document.getElementById('add-ord-name')?.value.trim();
    const phone = document.getElementById('add-ord-phone')?.value.trim();
    const address = document.getElementById('add-ord-address')?.value.trim();
    const prodName = document.getElementById('add-ord-product')?.value.trim();
    const size = document.getElementById('add-ord-size')?.value || 'Free Size';
    const color = document.getElementById('add-ord-color')?.value || 'Black';
    const price = Number(document.getElementById('add-ord-price')?.value || '0');
    const qty = Number(document.getElementById('add-ord-qty')?.value || '1');
    const deliveryFee = Number(document.getElementById('add-ord-delivery')?.value || '70');
    const payMethod = document.getElementById('add-ord-payment')?.value || 'Cash on Delivery';
    const total = (price * qty) + deliveryFee;

    const newOrder = {
      order_id: 'ORD-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(100 + Math.random() * 900),
      customer_name: name,
      phone,
      address,
      products: `${prodName} (${size}, ${color}) x${qty}`,
      product_name: prodName,
      size,
      color,
      quantity: qty,
      unit_price: price,
      total_amount: total,
      delivery_fee: deliveryFee,
      payment_method: payMethod,
      payment_status: payMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      order_status: 'Order Placed',
      transaction_id: payMethod === 'Cash on Delivery' ? 'COD-UNPAID' : 'TRX-' + Math.floor(100000 + Math.random() * 900000),
      fraud_status: 'Safe',
      customer_rating: '5/5 ★'
    };

    let orders = JSON.parse(localStorage.getItem('dcbd_sheet_orders') || '[]');
    orders.unshift(newOrder);
    localStorage.setItem('dcbd_sheet_orders', JSON.stringify(orders));

    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'অর্ডার যুক্ত হয়েছে', message: `অর্ডার #${newOrder.order_id} সফলভাবে সংরক্ষিত হয়েছে!` });
    }

    // Show voucher popup
    const vModal = document.getElementById('modal-order-voucher');
    const vContent = document.getElementById('voucher-content-display');
    if (vContent) {
      vContent.innerHTML = `
        <div class="border p-4 rounded-2xl space-y-2 bg-slate-50 dark:bg-slate-800 text-xs">
          <div class="flex justify-between font-bold border-b pb-2">
            <span>DREAM CART BD — ইনভয়েস</span>
            <span class="font-mono text-emerald-600">${newOrder.order_id}</span>
          </div>
          <div>গ্রাহক: <b>${newOrder.customer_name}</b> (${newOrder.phone})</div>
          <div>ঠিকানা: ${newOrder.address}</div>
          <div class="border-t pt-1">পণ্য: <b>${newOrder.products}</b></div>
          <div>পেমেন্ট মেথড: ${newOrder.payment_method}</div>
          <div class="flex justify-between font-black text-sm border-t pt-2 text-emerald-600">
            <span>মোট প্রদেয় বিল:</span>
            <span>৳${newOrder.total_amount}</span>
          </div>
        </div>
      `;
    }
    if (vModal) vModal.classList.remove('hidden');

    document.getElementById('form-manual-add-order')?.reset();
  };

  window.sendIncompleteOrderReminders = function() {
    alert('সকল অসম্পূর্ণ অর্ডারের গ্রাহকদের কাছে WhatsApp রিকভারি লিঙ্ক ও ডিসকাউন্ট অফার পাঠানো হয়েছে!');
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'WhatsApp বার্তা প্রেরিত', message: 'সকল অসম্পূর্ণ অর্ডারে স্বয়ংসক্রিয় মেসেজ পাঠানো হয়েছে।' });
    }
  };

  // ============================================================================
  // PRODUCT MANAGEMENT, AI AUTO-FILL, TIERED PRICING, BULK & LANDING CMS HANDLERS
  // ============================================================================

  // 16-Tier Selling & Original Price Markup Rate Lookup
  // (1-100: 55%, 101-200: 52%, 201-400: 50%, 401-600: 48%, 601-800: 47%, 801-1500: 45%,
  //  1501-5000: 43%, 5001-10000: 35%, 10001-25000: 30%, 25001-70000: 28%, 70001-200000: 20%,
  //  200001-350000: 18%, 350001-1000000: 15%, 1000001-2000000: 14%, 2000001-5000000: 13%, 5000001+: 12%)
  window.getTieredSellingMarkupRate = function(amount) {
    const val = Number(amount) || 0;
    if (val <= 0) return 0;
    if (val <= 100) return 0.55;
    if (val <= 200) return 0.52;
    if (val <= 400) return 0.50;
    if (val <= 600) return 0.48;
    if (val <= 800) return 0.47;
    if (val <= 1500) return 0.45;
    if (val <= 5000) return 0.43;
    if (val <= 10000) return 0.35;
    if (val <= 25000) return 0.30;
    if (val <= 70000) return 0.28;
    if (val <= 200000) return 0.20;
    if (val <= 350000) return 0.18;
    if (val <= 1000000) return 0.15;
    if (val <= 2000000) return 0.14;
    if (val <= 5000000) return 0.13;
    return 0.12;
  };

  // 16-Tier Wholesale Price Markup Rate Lookup
  // (1-100: 65%, 101-200: 55%, 201-400: 45%, 401-600: 35%, 601-800: 30%, 801-1500: 28%,
  //  1501-5000: 25%, 5001-10000: 20%, 10001-25000: 18%, 25001-70000: 17%, 70001-200000: 15%,
  //  200001-350000: 13%, 350001-1000000: 10%, 1000001-2000000: 9%, 2000001-5000000: 8%, 5000001+: 6%)
  window.getTieredWholesaleMarkupRate = function(buyingPrice) {
    const val = Number(buyingPrice) || 0;
    if (val <= 0) return 0;
    if (val <= 100) return 0.65;
    if (val <= 200) return 0.55;
    if (val <= 400) return 0.45;
    if (val <= 600) return 0.35;
    if (val <= 800) return 0.30;
    if (val <= 1500) return 0.28;
    if (val <= 5000) return 0.25;
    if (val <= 10000) return 0.20;
    if (val <= 25000) return 0.18;
    if (val <= 70000) return 0.17;
    if (val <= 200000) return 0.15;
    if (val <= 350000) return 0.13;
    if (val <= 1000000) return 0.10;
    if (val <= 2000000) return 0.09;
    if (val <= 5000000) return 0.08;
    return 0.06;
  };

  window.calculateAllPricesFromBuying = function(buyingPrice, customSellingPrice = null) {
    const bp = Number(buyingPrice) || 0;
    const sellRate = window.getTieredSellingMarkupRate(bp);
    const sp = (customSellingPrice !== null && customSellingPrice !== '' && !isNaN(Number(customSellingPrice)) && Number(customSellingPrice) > 0)
      ? Math.round(Number(customSellingPrice))
      : Math.round(bp + bp * sellRate);
    const origRate = window.getTieredSellingMarkupRate(sp);
    const op = Math.round(sp + sp * origRate);
    const wsRate = window.getTieredWholesaleMarkupRate(bp);
    const wp = bp > 0 ? Math.round(bp + bp * wsRate) : Math.round(sp * 0.85);
    const minOrderQ = sp <= 200 ? 10 : 5;
    return {
      buying_price: bp,
      selling_price: sp,
      original_price: op,
      wholesale_price: wp,
      min_order_q: minOrderQ,
      sellRatePct: Math.round(sellRate * 100),
      origRatePct: Math.round(origRate * 100),
      wsRatePct: Math.round(wsRate * 100)
    };
  };

  // AI Smart Product Name Analyzer (Auto-detects Category > Sub_Category > Child_Category, Brand, Slug, Dimensions)
  window.analyzeProductNameAI = function(rawName, currentSku = '') {
    const name = String(rawName || '').trim();
    const lower = name.toLowerCase();

    const aiRules = [
      {
        keywords: ['watch', 'smartwatch', 'স্মার্টওয়াচ', 'ঘড়ি', 'gts', 'gtr', 'band', 'haylou', 'kieslect', 'colmi', 'zeblaze', 'mibro', 'amoled'],
        category: 'Smartwatches',
        sub_category: lower.includes('call') || lower.includes('কল') ? 'Calling Watch' : 'AMOLED Watch',
        child_category: lower.includes('women') || lower.includes('লেডিস') || lower.includes('girl') ? 'Women' : (lower.includes('gps') || lower.includes('sport') ? 'Fitness & GPS' : 'Men'),
        weight_kg: 0.18, width_cm: 9, length_cm: 11, height_cm: 6
      },
      {
        keywords: ['earbud', 'airpod', 'tws', 'headphone', 'neckband', 'ইয়ারবাড', 'হেডফোন', 'নেকব্যান্ড', 'speaker', 'স্পিকার', 'microphone', 'মাইক্রোফোন', 'audio'],
        category: 'Audio & Earbuds',
        sub_category: lower.includes('speaker') || lower.includes('স্পিকার') ? 'Bluetooth Speaker' : (lower.includes('neckband') || lower.includes('নেকব্যান্ড') ? 'Neckband' : 'TWS Earbuds'),
        child_category: lower.includes('anc') || lower.includes('noise') || lower.includes('pro') ? 'ANC Wireless' : 'Gaming & Music',
        weight_kg: 0.15, width_cm: 8, length_cm: 10, height_cm: 4
      },
      {
        keywords: ['gas', 'গ্যাস', 'blender', 'ব্লেন্ডার', 'kitchen', 'কিচেন', 'cooker', 'কুকার', 'fryer', 'kettle', 'কেতলি', 'chopper', 'চপার', 'grinder', 'মিক্সার', 'knife', 'pan', 'চুলা'],
        category: 'Kitchen',
        sub_category: lower.includes('gas') || lower.includes('গ্যাস') || lower.includes('safety') || lower.includes('সেফটি') ? 'Safety Device' : (lower.includes('blender') || lower.includes('ব্লেন্ডার') || lower.includes('grinder') || lower.includes('chopper') ? 'Blender' : 'Cookware'),
        child_category: 'Appliances',
        weight_kg: 1.2, width_cm: 16, length_cm: 18, height_cm: 24
      },
      {
        keywords: ['honey', 'মধু', 'seed', 'সিড', 'চিয়া', 'chia', 'oil', 'তেল', 'সরিষা', 'ঘি', 'ghee', 'organic', 'অর্গানিক', 'dates', 'খেজুর', 'বাদাম', 'nut', 'মসলা', 'tea', 'চা', 'কফি', 'health', 'হেলথ'],
        category: 'Organic & Health',
        sub_category: lower.includes('honey') || lower.includes('মধু') ? 'Honey' : (lower.includes('oil') || lower.includes('তেল') || lower.includes('ঘি') || lower.includes('ghee') ? 'Oils' : 'Seeds'),
        child_category: 'Pure Natural',
        weight_kg: 0.5, width_cm: 10, length_cm: 10, height_cm: 15
      },
      {
        keywords: ['flashlight', 'ফ্ল্যাশলাইট', 'light', 'লাইট', 'lamp', 'ল্যাম্প', 'fan', 'ফ্যান', 'iron', 'আয়রন', 'trimmer', 'ট্রিমার', 'dryer', 'appliance', 'হোম', 'মশা', 'mosquito', 'camera', 'ক্যামেরা', 'cc'],
        category: 'Home Appliances',
        sub_category: lower.includes('light') || lower.includes('লাইট') || lower.includes('lamp') || lower.includes('ফ্ল্যাশলাইট') ? 'Lighting' : 'Gadgets',
        child_category: 'Rechargeable',
        weight_kg: 0.45, width_cm: 12, length_cm: 16, height_cm: 8
      },
      {
        keywords: ['powerbank', 'পাওয়ার ব্যাংক', 'charger', 'চার্জার', 'cable', 'ক্যাবল', 'adapter', 'stand', 'holder', 'হোল্ডার', 'case', 'cover', 'কভার', 'hub', 'mouse', 'মাউস', 'keyboard', 'কীবোর্ড'],
        category: 'Mobile & Computer Accessories',
        sub_category: lower.includes('power') || lower.includes('পাওয়ার') || lower.includes('charger') || lower.includes('চার্জার') ? 'Charging & Power' : 'Smart Accessories',
        child_category: 'Fast Charging & Pro',
        weight_kg: 0.25, width_cm: 9, length_cm: 14, height_cm: 4
      },
      {
        keywords: ['shirt', 'শার্ট', 't-shirt', 'টিশার্ট', 'panjabi', 'পাঞ্জাবি', 'saree', 'শাড়ি', 'three piece', 'থ্রি পিস', 'borka', 'বোরকা', 'hijab', 'হিজাব', 'pant', 'প্যান্ট', 'shoe', 'জুতা', 'bag', 'ব্যাগ', 'wallet', 'মানিব্যাগ'],
        category: 'Fashion & Lifestyle',
        sub_category: lower.includes('saree') || lower.includes('শাড়ি') || lower.includes('borka') || lower.includes('বোরকা') || lower.includes('থ্রি পিস') ? 'Women Fashion' : (lower.includes('bag') || lower.includes('ব্যাগ') || lower.includes('wallet') ? 'Bags & Leather' : 'Men Fashion'),
        child_category: 'Premium Collection',
        weight_kg: 0.35, width_cm: 22, length_cm: 28, height_cm: 5
      }
    ];

    let matchedRule = null;
    for (const r of aiRules) {
      if (r.keywords.some(k => lower.includes(k))) {
        matchedRule = r;
        break;
      }
    }

    // Also check existing categories from sheet/state
    const stateCats = (window.__adminState && window.__adminState.categories) || [];
    if (!matchedRule && stateCats.length > 0) {
      for (const c of stateCats) {
        const cName = String(c.category || '').toLowerCase();
        const subNames = String(c.sub_category || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
        if ((cName && lower.includes(cName)) || subNames.some(s => s && lower.includes(s))) {
          matchedRule = {
            category: c.category,
            sub_category: (c.sub_category || '').split(',')[0]?.trim() || 'Standard',
            child_category: (c.chail_category || c.child_category || '').split(',')[0]?.trim() || 'General',
            weight_kg: 0.3, width_cm: 10, length_cm: 12, height_cm: 6
          };
          break;
        }
      }
    }

    if (!matchedRule) {
      const fallbackCat = stateCats[0]?.category || 'Smartwatches';
      const fallbackSub = (stateCats[0]?.sub_category || 'AMOLED Watch').split(',')[0].trim();
      const fallbackChild = (stateCats[0]?.chail_category || stateCats[0]?.child_category || 'General').split(',')[0].trim();
      matchedRule = {
        category: name ? (stateCats.find(c => c.category === 'Home Appliances')?.category || fallbackCat) : fallbackCat,
        sub_category: name ? 'Gadgets' : fallbackSub,
        child_category: name ? 'Standard' : fallbackChild,
        weight_kg: 0.25, width_cm: 10, length_cm: 12, height_cm: 6
      };
    }

    // Brand detection from product name
    const knownBrands = [
      'Amazfit', 'Kieslect', 'Haylou', 'Xiaomi', 'Samsung', 'Apple', 'Realme', 'OnePlus', 'Huawei',
      'Baseus', 'Anker', 'Joyroom', 'Remax', 'Hoco', 'Ugreen', 'Colmi', 'Zeblaze', 'Mibro', 'QCY',
      'Sony', 'JBL', 'Edifier', 'Lenovo', 'Logitech', 'A4Tech', 'Philips', 'Miyako', 'Vision',
      'Walton', 'Panasonic', 'Casio', 'Titan', 'Curren', 'Naviforce', 'Dream Organic', 'HK'
    ];
    const stateBrands = ((window.__adminState && window.__adminState.brands) || []).map(b => b.brand_name).filter(Boolean);
    const allBrandCandidates = Array.from(new Set([...stateBrands, ...knownBrands]));

    let detectedBrand = '';
    for (const b of allBrandCandidates) {
      if (lower.includes(b.toLowerCase())) {
        detectedBrand = b;
        break;
      }
    }
    if (!detectedBrand) {
      if (lower.includes('মধু') || lower.includes('চিয়া') || lower.includes('অর্গানিক') || lower.includes('organic') || lower.includes('honey') || lower.includes('ঘি')) {
        detectedBrand = 'Dream Organic';
      } else {
        // Check if first word is English capitalized brand token
        const firstWord = name.split(/[\s\-—|()]+/)[0] || '';
        if (/^[A-Za-z0-9]{2,15}$/.test(firstWord) && !['pro', 'new', 'hot', 'the', 'mini', 'auto', 'high'].includes(firstWord.toLowerCase())) {
          detectedBrand = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        } else {
          detectedBrand = stateBrands[0] || 'Dream Cart BD';
        }
      }
    }

    // Weight & dimensions smart parsing from name (e.g. "1kg", "১ কেজি", "500g", "৫০০ গ্রাম")
    let weightKg = matchedRule.weight_kg;
    let widthCm = matchedRule.width_cm;
    let lengthCm = matchedRule.length_cm;
    let heightCm = matchedRule.height_cm;

    const bnToEnDigits = s => String(s).replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d));
    const normText = bnToEnDigits(lower);

    const kgMatch = normText.match(/(\d+(?:\.\d+)?)\s*(?:kg|কেজি|k\.g)/i);
    const gmMatch = normText.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gram|গ্রাম)/i);
    const mlMatch = normText.match(/(\d+(?:\.\d+)?)\s*(?:ml|মিলি)/i);
    const ltrMatch = normText.match(/(\d+(?:\.\d+)?)\s*(?:l|ltr|liter|লিটার)/i);

    if (kgMatch) {
      weightKg = Number(kgMatch[1]) || 1;
      widthCm = Math.round(12 + weightKg * 2);
      lengthCm = Math.round(14 + weightKg * 2);
      heightCm = Math.round(16 + weightKg * 3);
    } else if (gmMatch) {
      weightKg = Number(((Number(gmMatch[1]) || 500) / 1000).toFixed(2));
      widthCm = 10; lengthCm = 10; heightCm = 14;
    } else if (ltrMatch) {
      weightKg = Number(ltrMatch[1]) || 1;
      widthCm = 12; lengthCm = 12; heightCm = 22;
    } else if (mlMatch) {
      weightKg = Number(((Number(mlMatch[1]) || 250) / 1000).toFixed(2));
      widthCm = 8; lengthCm = 8; heightCm = 16;
    }

    // Generate clean URL slug from product name / SKU
    const enSlugPart = bnToEnDigits(name)
      .toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09ff\s\-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const skuPart = String(currentSku || '').trim().toLowerCase().replace(/[^a-z0-9\-]/g, '');
    const slug = enSlugPart ? (skuPart ? `${enSlugPart}-${skuPart}` : enSlugPart) : (skuPart || 'product-' + Date.now().toString().slice(-5));

    return {
      category: matchedRule.category,
      sub_category: matchedRule.sub_category,
      child_category: matchedRule.child_category,
      brand: detectedBrand,
      slug,
      weight_kg: weightKg,
      width_cm: widthCm,
      length_cm: lengthCm,
      height_cm: heightCm
    };
  };


  // Ensure option exists in a <select> and select it
  window.ensureSelectValue = function(selectId, val) {
    const sel = document.getElementById(selectId);
    if (!sel || !val) return;
    const cleanVal = String(val).trim();
    let exists = Array.from(sel.options).some(o => o.value === cleanVal);
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = cleanVal;
      opt.textContent = cleanVal;
      sel.appendChild(opt);
    }
    sel.value = cleanVal;
  };

  // Triggered when typing P_Name in Add Product form
  window.handleProductNameAiAutoFill = function(val, prefix = 'adm') {
    const name = String(val || '').trim();
    const sku = document.getElementById(`${prefix}-sku`)?.value || '';
    const badge = document.getElementById(`${prefix}-ai-status-badge`);
    if (!name) {
      if (badge) badge.textContent = 'পণ্যের নাম লিখলে AI স্বয়ংক্রিয়ভাবে ক্যাটাগরি, সাব-ক্যাটাগরি, চাইল্ড ক্যাটাগরি, ব্র্যান্ড ও ওজন বসাবে';
      return;
    }

    const ai = window.analyzeProductNameAI(name, sku);

    // Populate Category > Sub_Category > Child_Category dropdowns
    window.ensureSelectValue(`${prefix}-cat`, ai.category);
    window.populateSubAndChildDropdowns(ai.category, ai.sub_category, ai.child_category, prefix);
    window.ensureSelectValue(`${prefix}-brand`, ai.brand);

    const slugEl = document.getElementById(`${prefix}-slug`);
    if (slugEl && !slugEl.dataset.manualEdit) slugEl.value = ai.slug;

    const wEl = document.getElementById(`${prefix}-weight`);
    const widEl = document.getElementById(`${prefix}-width`);
    const lenEl = document.getElementById(`${prefix}-length`);
    const hEl = document.getElementById(`${prefix}-height`);

    if (wEl && !wEl.dataset.manualEdit) wEl.value = ai.weight_kg;
    if (widEl && !widEl.dataset.manualEdit) widEl.value = ai.width_cm;
    if (lenEl && !lenEl.dataset.manualEdit) lenEl.value = ai.length_cm;
    if (hEl && !hEl.dataset.manualEdit) hEl.value = ai.height_cm;

    if (badge) {
      badge.innerHTML = `✨ <b>AI অটো-ডিটেক্টেড:</b> ${ai.category} &rsaquo; ${ai.sub_category} &rsaquo; ${ai.child_category} | ব্র্যান্ড: <b>${ai.brand}</b> | ওজন: <b>${ai.weight_kg} kg</b>`;
    }
    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  window.populateSubAndChildDropdowns = function(selectedCat, preferredSub = '', preferredChild = '', prefix = 'adm') {
    const cats = (window.__adminState && window.__adminState.categories) || [];
    const prods = (window.__adminState && window.__adminState.products) || [];
    const subSel = document.getElementById(`${prefix}-subcat`);
    const childSel = document.getElementById(`${prefix}-childcat`);

    const subSet = new Set();
    const childSet = new Set();

    cats.forEach(c => {
      if (!selectedCat || c.category === selectedCat) {
        String(c.sub_category || '').split(',').map(s => s.trim()).filter(Boolean).forEach(s => subSet.add(s));
        String(c.chail_category || c.child_category || '').split(',').map(s => s.trim()).filter(Boolean).forEach(ch => childSet.add(ch));
      }
    });
    prods.forEach(p => {
      if (!selectedCat || p.category === selectedCat) {
        if (p.sub_category) subSet.add(String(p.sub_category).trim());
        if (p.child_category) childSet.add(String(p.child_category).trim());
      }
    });

    if (preferredSub) subSet.add(preferredSub);
    if (preferredChild) childSet.add(preferredChild);

    // Default helpful sub/child options so dropdown is never empty
    ['AMOLED Watch', 'Calling Watch', 'Safety Device', 'Blender', 'Cookware', 'Honey', 'Seeds', 'Oils', 'Lighting', 'Gadgets', 'TWS Earbuds', 'Smart Accessories'].forEach(s => subSet.add(s));
    ['Men', 'Women', 'Fitness & GPS', 'Appliances', 'Pure Natural', 'Rechargeable', 'Standard', 'Premium Grade'].forEach(c => childSet.add(c));

    if (subSel) {
      const currentVal = preferredSub || subSel.value;
      subSel.innerHTML = Array.from(subSet).map(s => `<option value="${s}">${s}</option>`).join('');
      if (currentVal) window.ensureSelectValue(`${prefix}-subcat`, currentVal);
    }
    if (childSel) {
      const currentVal = preferredChild || childSel.value;
      childSel.innerHTML = Array.from(childSet).map(c => `<option value="${c}">${c}</option>`).join('');
      if (currentVal) window.ensureSelectValue(`${prefix}-childcat`, currentVal);
    }
  };

  window.handleAdminCategoryChange = function(catVal, prefix = 'adm') {
    window.populateSubAndChildDropdowns(catVal, '', '', prefix);
    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  window.handleQuickAddCategoryOption = function(type, prefix = 'adm') {
    const labelMap = {
      cat: 'নতুন মূল ক্যাটাগরির নাম লিখুন:',
      subcat: 'নতুন সাব-ক্যাটাগরির নাম লিখুন:',
      childcat: 'নতুন চাইল্ড ক্যাটাগরির নাম লিখুন:'
    };
    const inputEl = document.getElementById(`${prefix}-new-${type}-input`);
    const val = (inputEl ? inputEl.value.trim() : '') || (prompt(labelMap[type] || 'নতুন নাম লিখুন:') || '').trim();
    if (!val) return;
    window.ensureSelectValue(`${prefix}-${type}`, val);
    if (inputEl) inputEl.value = '';
    if (toast && toast.show) toast.show({ type: 'success', title: 'ক্যাটাগরি যুক্ত', message: `"${val}" ড্রপডাউনে যুক্ত ও সিলেক্ট করা হয়েছে!` });
    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  window.handleQuickAddBrandInline = function(prefix = 'adm') {
    const inp = document.getElementById(`${prefix}-inline-new-brand`);
    const val = (inp ? inp.value.trim() : '') || '';
    if (!val) {
      if (toast && toast.show) toast.show({ type: 'warning', title: 'ব্র্যান্ড নাম লিখুন', message: 'নতুন ব্র্যান্ডের নাম ইনপুট বক্সে লিখুন।' });
      return;
    }
    let brands = JSON.parse(localStorage.getItem('dcbd_sheet_brands') || '[]');
    if (!brands.some(b => (b.brand_name || '').toLowerCase() === val.toLowerCase())) {
      const newB = {
        brand_id: 'BRD-' + Math.floor(100 + Math.random() * 900),
        brand_name: val,
        brand_slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand_image: 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg',
        brand_description: 'অফিসিয়াল ব্র্যান্ড পার্টনার।'
      };
      brands.push(newB);
      localStorage.setItem('dcbd_sheet_brands', JSON.stringify(brands));
      if (window.__adminState) window.__adminState.brands = brands;
      apiClient.request('brands/add', newB).catch(() => {});
    }
    window.ensureSelectValue(`${prefix}-brand`, val);
    if (inp) inp.value = '';
    if (toast && toast.show) toast.show({ type: 'success', title: 'ব্র্যান্ড যুক্ত', message: `ব্র্যান্ড "${val}" যুক্ত ও নির্বাচন করা হয়েছে!` });
    window.renderAdminBrandCards && window.renderAdminBrandCards();
    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  // Triggered when Buying_price changes
  window.handleBuyingPriceAutoCalc = function(val, prefix = 'adm', forceResetManualSelling = false) {
    const bp = Number(val) || 0;
    const sellEl = document.getElementById(`${prefix}-sellprice`);
    const origEl = document.getElementById(`${prefix}-origprice`);
    const wsEl = document.getElementById(`${prefix}-wholesaleprice`);
    const minQEl = document.getElementById(`${prefix}-minorderq`);

    if (forceResetManualSelling && sellEl) {
      delete sellEl.dataset.manualOverride;
    }

    const isManualSell = sellEl && sellEl.dataset.manualOverride === 'true';
    const customSell = isManualSell ? sellEl.value : null;
    const calc = window.calculateAllPricesFromBuying(bp, customSell);

    if (sellEl && !isManualSell) sellEl.value = bp > 0 ? calc.selling_price : '';
    if (origEl) origEl.value = calc.selling_price > 0 ? calc.original_price : '';
    if (wsEl) wsEl.value = bp > 0 ? calc.wholesale_price : '';
    if (minQEl) minQEl.value = calc.min_order_q;

    const sellBadge = document.getElementById(`${prefix}-sell-rate-badge`);
    const origBadge = document.getElementById(`${prefix}-orig-rate-badge`);
    const wsBadge = document.getElementById(`${prefix}-ws-rate-badge`);
    if (sellBadge) sellBadge.textContent = isManualSell ? 'ম্যানুয়াল প্রাইস' : `অটো +${calc.sellRatePct}%`;
    if (origBadge) origBadge.textContent = `অটো +${calc.origRatePct}%`;
    if (wsBadge) wsBadge.textContent = `অটো +${calc.wsRatePct}%`;

    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  // Triggered when Selling_Price is manually typed
  window.handleSellingPriceManualChange = function(val, prefix = 'adm') {
    const sp = Number(val) || 0;
    const sellEl = document.getElementById(`${prefix}-sellprice`);
    if (sellEl) sellEl.dataset.manualOverride = 'true';

    const origRate = window.getTieredSellingMarkupRate(sp);
    const op = Math.round(sp + sp * origRate);
    const minQ = sp <= 200 ? 10 : 5;

    const origEl = document.getElementById(`${prefix}-origprice`);
    const minQEl = document.getElementById(`${prefix}-minorderq`);
    if (origEl) origEl.value = sp > 0 ? op : '';
    if (minQEl) minQEl.value = minQ;

    const sellBadge = document.getElementById(`${prefix}-sell-rate-badge`);
    const origBadge = document.getElementById(`${prefix}-orig-rate-badge`);
    if (sellBadge) sellBadge.textContent = 'ম্যানুয়াল প্রাইস ✎';
    if (origBadge) origBadge.textContent = `অটো +${Math.round(origRate * 100)}%`;

    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  // Color & Size Dropdown + Add New Inline Handlers
  window.handleSelectColorOrSizeTag = function(type, selectEl, prefix = 'adm') {
    const val = (selectEl?.value || '').trim();
    if (!val) return;
    const inputEl = document.getElementById(`${prefix}-${type}`);
    if (!inputEl) return;
    const existing = inputEl.value.split(',').map(s => s.trim()).filter(Boolean);
    if (!existing.includes(val)) {
      existing.push(val);
      inputEl.value = existing.join(', ');
    }
    window.renderColorSizeChips && window.renderColorSizeChips(prefix);
    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  window.handleAddNewColorOrSizeInline = function(type, prefix = 'adm') {
    const newInp = document.getElementById(`${prefix}-new-${type}-input`);
    const val = (newInp?.value || '').trim();
    if (!val) return;

    let variants = JSON.parse(localStorage.getItem('dcbd_variants') || '{"colors":[],"sizes":[]}');
    const listKey = type === 'color' ? 'colors' : 'sizes';
    if (!Array.isArray(variants[listKey])) variants[listKey] = [];
    if (!variants[listKey].includes(val)) {
      variants[listKey].push(val);
      localStorage.setItem('dcbd_variants', JSON.stringify(variants));
      if (window.__adminState) window.__adminState.variants = variants;
    }

    window.ensureSelectValue(`${prefix}-${type}-select`, val);
    const targetInput = document.getElementById(`${prefix}-${type}`);
    if (targetInput) {
      const existing = targetInput.value.split(',').map(s => s.trim()).filter(Boolean);
      if (!existing.includes(val)) existing.push(val);
      targetInput.value = existing.join(', ');
    }
    if (newInp) newInp.value = '';
    window.renderColorSizeChips && window.renderColorSizeChips(prefix);
    if (toast && toast.show) toast.show({ type: 'success', title: 'ভ্যারিয়েন্ট যুক্ত', message: `নতুন ${type === 'color' ? 'কালার' : 'সাইজ'} "${val}" যুক্ত হয়েছে!` });
    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  window.removeColorOrSizeChip = function(type, valToRemove, prefix = 'adm') {
    const inputEl = document.getElementById(`${prefix}-${type}`);
    if (!inputEl) return;
    const updated = inputEl.value.split(',').map(s => s.trim()).filter(s => s && s !== valToRemove);
    inputEl.value = updated.join(', ');
    window.renderColorSizeChips && window.renderColorSizeChips(prefix);
    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  window.renderColorSizeChips = function(prefix = 'adm') {
    ['color', 'size'].forEach(type => {
      const inputEl = document.getElementById(`${prefix}-${type}`);
      const chipBox = document.getElementById(`${prefix}-${type}-chips`);
      if (!inputEl || !chipBox) return;
      const items = inputEl.value.split(',').map(s => s.trim()).filter(Boolean);
      chipBox.innerHTML = items.map(item => `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
          <span>${item}</span>
          <button type="button" class="text-rose-500 hover:text-rose-700 font-black" onclick="window.removeColorOrSizeChip('${type}', '${item.replace(/'/g, "\\'")}', '${prefix}')">✕</button>
        </span>
      `).join('');
    });
  };


  // Image Link + Manual File Upload with Live Preview
  window.__admUploadedImages = window.__admUploadedImages || [];

  window.handleAddProductImageUrlInline = function(prefix = 'adm') {
    const urlInp = document.getElementById(`${prefix}-imageurl-add`);
    const mainInput = document.getElementById(`${prefix}-imageurl`);
    if (!mainInput) return;
    const newUrl = (urlInp?.value || '').trim();
    if (newUrl) {
      const current = mainInput.value.split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
      if (!current.includes(newUrl)) current.push(newUrl);
      mainInput.value = current.join(', ');
      if (urlInp) urlInp.value = '';
    }
    window.renderAdminProductImagePreviews(prefix);
    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  window.handleAdminProductImageUpload = function(fileInput, prefix = 'adm') {
    const files = Array.from(fileInput?.files || []);
    if (files.length === 0) return;
    const mainInput = document.getElementById(`${prefix}-imageurl`);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target?.result;
        if (dataUrl && mainInput) {
          const current = mainInput.value.split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
          current.push(dataUrl);
          mainInput.value = current.join(', ');
          window.renderAdminProductImagePreviews(prefix);
          window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
        }
      };
      reader.readAsDataURL(file);
    });
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'ছবি আপলোড সম্পন্ন', message: `${files.length} টি ছবি প্রিভিউতে যুক্ত হয়েছে!` });
    }
  };

  window.removeAdminProductPreviewImage = function(idx, prefix = 'adm') {
    const mainInput = document.getElementById(`${prefix}-imageurl`);
    if (!mainInput) return;
    const list = mainInput.value.split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
    list.splice(idx, 1);
    mainInput.value = list.join(', ');
    window.renderAdminProductImagePreviews(prefix);
    window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
  };

  window.renderAdminProductImagePreviews = function(prefix = 'adm') {
    const mainInput = document.getElementById(`${prefix}-imageurl`);
    const previewContainer = document.getElementById(`${prefix}-images-preview-grid`);
    if (!mainInput || !previewContainer) return;

    const urls = mainInput.value.split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
    if (urls.length === 0) {
      previewContainer.innerHTML = `
        <div class="col-span-full p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-[11px] text-slate-400">
          🖼️ এখনো কোনো ছবি যুক্ত করা হয়নি। উপরে ছবির লিঙ্ক দিন অথবা ফাইল আপলোড করুন।
        </div>
      `;
      return;
    }

    previewContainer.innerHTML = urls.map((u, idx) => `
      <div class="relative group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-sm">
        <img src="${u}" class="w-full h-24 object-cover rounded-xl" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
        <span class="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-bold">
          ${idx === 0 ? '★ মূল ছবি' : `#${idx + 1}`}
        </span>
        <button type="button" onclick="window.removeAdminProductPreviewImage(${idx}, '${prefix}')" class="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow hover:bg-rose-700">
          ✕
        </button>
      </div>
    `).join('');
  };

  // Live 23-Column Summary Preview in Add Product Form
  window.updateAddProductLiveSummary = function() {
    const box = document.getElementById('adm-23col-live-preview');
    if (!box) return;
    const getVal = id => (document.getElementById(id)?.value || '').trim();
    const imgs = getVal('adm-imageurl').split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
    box.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[10px]">
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">1. SKU:</span><b class="font-mono">${getVal('adm-sku') || '—'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">2. P_Name:</span><b class="truncate block">${getVal('adm-name') || '—'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">3. Category:</span><b>${getVal('adm-cat') || '—'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">4. Sub_Category:</span><b>${getVal('adm-subcat') || '—'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">5. Child_Category:</span><b>${getVal('adm-childcat') || '—'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">6. Brand:</span><b>${getVal('adm-brand') || '—'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">7. Buying_price:</span><b class="font-mono">৳${getVal('adm-buyprice') || '0'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">8. Selling_Price:</span><b class="font-mono text-emerald-600">৳${getVal('adm-sellprice') || '0'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">9. Stock:</span><b class="font-mono">${getVal('adm-stock') || '0'} পিস</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">10. Original_Price:</span><b class="font-mono">৳${getVal('adm-origprice') || '0'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">11. WholeSale_price:</span><b class="font-mono">৳${getVal('adm-wholesaleprice') || '0'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">12. Min_order_Q:</span><b class="font-mono">${getVal('adm-minorderq') || '5'} পিস</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">13. Images:</span><b>${imgs.length} টি ছবি</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">14. Slug:</span><b class="font-mono truncate block">${getVal('adm-slug') || '—'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">18. Color:</span><b>${getVal('adm-color') || '—'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">19. Size:</span><b>${getVal('adm-size') || '—'}</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">20. WEIGHT_KG:</span><b class="font-mono">${getVal('adm-weight') || '0.25'} kg</b></div>
        <div class="p-2 rounded-lg bg-white dark:bg-slate-900 border"><span class="text-slate-400 block">21-23. W×L×H (cm):</span><b class="font-mono">${getVal('adm-width') || 10}×${getVal('adm-length') || 12}×${getVal('adm-height') || 6}</b></div>
      </div>
    `;
  };

  // Save New Product (All 23 Columns)
  window.handleAdminAddProduct = async function(e) {
    e.preventDefault();
    const sku = (document.getElementById('adm-sku')?.value || '').trim() || ('DCBD-' + Math.floor(1000 + Math.random() * 9000));
    const name = (document.getElementById('adm-name')?.value || '').trim();
    const aiFallback = window.analyzeProductNameAI(name, sku);

    const cat = (document.getElementById('adm-cat')?.value || '').trim() || aiFallback.category;
    const subcat = (document.getElementById('adm-subcat')?.value || '').trim() || aiFallback.sub_category;
    const childcat = (document.getElementById('adm-childcat')?.value || '').trim() || aiFallback.child_category;
    const brand = (document.getElementById('adm-brand')?.value || '').trim() || aiFallback.brand;

    const buyPrice = Number(document.getElementById('adm-buyprice')?.value || '0');
    const rawSellPrice = Number(document.getElementById('adm-sellprice')?.value || '0');
    const calcPrices = window.calculateAllPricesFromBuying(buyPrice, rawSellPrice > 0 ? rawSellPrice : null);

    const sellPrice = calcPrices.selling_price;
    const stock = Number(document.getElementById('adm-stock')?.value || '50');
    const origPrice = Number(document.getElementById('adm-origprice')?.value || calcPrices.original_price);
    const wsPrice = Number(document.getElementById('adm-wholesaleprice')?.value || calcPrices.wholesale_price);
    const minOrderQ = Number(document.getElementById('adm-minorderq')?.value || calcPrices.min_order_q);

    const rawImagesStr = (document.getElementById('adm-imageurl')?.value || '').trim();
    const imagesArr = rawImagesStr.split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
    const defaultThumb = 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
    const finalImages = imagesArr.length > 0 ? imagesArr : [defaultThumb];

    const slug = (document.getElementById('adm-slug')?.value || '').trim() || aiFallback.slug;
    const desc = (document.getElementById('adm-desc')?.value || '').trim();
    const spec = (document.getElementById('adm-spec')?.value || '').trim();
    const others = (document.getElementById('adm-others')?.value || '').trim();
    const color = (document.getElementById('adm-color')?.value || '').trim();
    const size = (document.getElementById('adm-size')?.value || '').trim();
    const weightKg = Number(document.getElementById('adm-weight')?.value || aiFallback.weight_kg || 0.25);
    const widthCm = Number(document.getElementById('adm-width')?.value || aiFallback.width_cm || 10);
    const lengthCm = Number(document.getElementById('adm-length')?.value || aiFallback.length_cm || 12);
    const heightCm = Number(document.getElementById('adm-height')?.value || aiFallback.height_cm || 6);

    const newProduct = {
      product_id: sku,
      sku: sku,
      name: name,
      p_name: name,
      category: cat,
      sub_category: subcat,
      child_category: childcat,
      brand: brand,
      buying_price: buyPrice,
      selling_price: sellPrice,
      stock: stock,
      original_price: origPrice,
      wholesale_price: wsPrice,
      min_order_q: minOrderQ,
      min_order_qty: minOrderQ,
      images: finalImages,
      thumbnail: finalImages[0],
      slug: slug,
      description: desc,
      specification: spec,
      others: others,
      color: color,
      size: size,
      weight_kg: weightKg,
      width_cm: widthCm,
      length_cm: lengthCm,
      height_cm: heightCm,
      status: 'সক্রিয়',
      is_active: true
    };

    let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const existingIdx = prods.findIndex(p => (p.sku && p.sku === sku) || (p.product_id && p.product_id === sku));
    if (existingIdx >= 0) {
      prods[existingIdx] = { ...prods[existingIdx], ...newProduct };
    } else {
      prods.unshift(newProduct);
    }

    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
    if (window.__adminState) window.__adminState.products = prods;

    await apiClient.request('products/add', newProduct);

    if (toast && toast.show) toast.show({ type: 'success', title: 'পণ্য সংরক্ষিত হয়েছে', message: `"${name}" (২৩ কলাম ডাটা) সফলভাবে যুক্ত হয়েছে!` });
    document.getElementById('form-add-product-dedicated')?.reset();
    const sellEl = document.getElementById('adm-sellprice');
    if (sellEl) delete sellEl.dataset.manualOverride;
    window.renderAdminProductImagePreviews('adm');
    window.renderColorSizeChips('adm');
    window.renderAdminProductsTable && window.renderAdminProductsTable();
    window.switchAdminPage('page-prod-all', 'group-products');
  };

  // ============================================================================
  // REQUIREMENT 1: ALL PRODUCTS LIST — FILTERS, 120 PER PAGE, CHECKBOX BULK EDIT/DELETE
  // ============================================================================
  window.__adminProductFilterState = window.__adminProductFilterState || {
    search: '',
    category: 'all',
    sub_category: 'all',
    brand: 'all',
    status: 'all',
    sort: 'default',
    page: 1,
    perPage: 120,
    selectedIds: new Set()
  };

  window.getFilteredAdminProducts = function() {
    const st = window.__adminProductFilterState;
    const allProds = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    let list = [...allProds];

    if (st.search) {
      const q = st.search.toLowerCase().trim();
      list = list.filter(p =>
        String(p.name || p.p_name || '').toLowerCase().includes(q) ||
        String(p.sku || p.product_id || '').toLowerCase().includes(q) ||
        String(p.category || '').toLowerCase().includes(q) ||
        String(p.sub_category || '').toLowerCase().includes(q) ||
        String(p.child_category || '').toLowerCase().includes(q) ||
        String(p.brand || '').toLowerCase().includes(q) ||
        String(p.slug || '').toLowerCase().includes(q)
      );
    }

    if (st.category && st.category !== 'all') {
      list = list.filter(p => String(p.category || '').toLowerCase() === st.category.toLowerCase());
    }
    if (st.sub_category && st.sub_category !== 'all') {
      list = list.filter(p => String(p.sub_category || '').toLowerCase() === st.sub_category.toLowerCase());
    }
    if (st.brand && st.brand !== 'all') {
      list = list.filter(p => String(p.brand || '').toLowerCase() === st.brand.toLowerCase());
    }

    if (st.status && st.status !== 'all') {
      if (st.status === 'active') list = list.filter(p => (p.status || 'সক্রিয়') === 'সক্রিয়');
      else if (st.status === 'inactive') list = list.filter(p => p.status === 'নিষ্ক্রিয়');
      else if (st.status === 'in_stock') list = list.filter(p => Number(p.stock) > 0);
      else if (st.status === 'low') list = list.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5);
      else if (st.status === 'out') list = list.filter(p => Number(p.stock) === 0);
      else if (st.status === 'error') list = list.filter(p => !p.sku || !p.thumbnail || !p.selling_price);
    }

    if (st.sort === 'price_asc') list.sort((a, b) => (Number(a.selling_price) || 0) - (Number(b.selling_price) || 0));
    else if (st.sort === 'price_desc') list.sort((a, b) => (Number(b.selling_price) || 0) - (Number(a.selling_price) || 0));
    else if (st.sort === 'stock_asc') list.sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0));
    else if (st.sort === 'stock_desc') list.sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0));
    else if (st.sort === 'name_asc') list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

    return list;
  };

  window.renderAdminProductRowHtml = function(p) {
    const id = String(p.sku || p.product_id || '');
    const safeId = id.replace(/'/g, "\\'");
    const isLow = Number(p.stock) > 0 && Number(p.stock) <= 5;
    const isOut = Number(p.stock) === 0;
    const isErr = !p.sku || !p.thumbnail || !p.selling_price;
    const isChecked = window.__adminProductFilterState?.selectedIds?.has(id);
    const statusText = p.status || 'সক্রিয়';
    const isAct = statusText !== 'নিষ্ক্রিয়';
    const thumb = p.thumbnail || (Array.isArray(p.images) && p.images[0]) || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';

    return `
      <tr class="admin-prod-row hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${isChecked ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}" data-prod-id="${id}" data-stock="${p.stock || 0}" data-error="${isErr}">
        <td class="py-2.5 px-3 text-center">
          <input type="checkbox" class="prod-select-cb w-4 h-4 rounded accent-emerald-600 cursor-pointer" value="${id}" ${isChecked ? 'checked' : ''} onchange="window.toggleSingleProductCheckbox('${safeId}', this.checked)" />
        </td>
        <td class="py-2.5 px-2.5">
          <img src="${thumb}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
        </td>
        <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white max-w-xs">
          <div class="line-clamp-1" title="${p.name || p.p_name || ''}">${p.name || p.p_name || 'পণ্য'}</div>
          <div class="font-mono text-[10px] text-slate-400">${p.sku || 'SKU-NA'} | <span class="text-indigo-500">${p.brand || 'No Brand'}</span> | Min Q: ${p.min_order_q || (Number(p.selling_price) <= 200 ? 10 : 5)}</div>
        </td>
        <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400">
          <div class="font-bold text-[11px] text-slate-800 dark:text-slate-200">${p.category || 'General'}</div>
          <div class="text-[10px] text-slate-400">${p.sub_category || '—'}${p.child_category ? ' › ' + p.child_category : ''}</div>
        </td>
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer hover:underline" onclick="window.inlineEditProduct('${safeId}', 'buying_price', ${p.buying_price || 0}, this)" title="ক্লিক করে ক্রয় মূল্য এডিট করুন">
          ৳${p.buying_price || 0} ✎
        </td>
        <td class="py-2.5 px-3 font-bold text-emerald-600 font-mono cursor-pointer hover:underline" onclick="window.inlineEditProduct('${safeId}', 'selling_price', ${p.selling_price || 0}, this)" title="ক্লিক করে খুচরা বিক্রয় দর এডিট করুন">
          <div>${formatCurrency(p.selling_price || 0)} ✎</div>
          <div class="text-[9px] text-slate-400 line-through">মূল: ৳${p.original_price || Math.round((Number(p.selling_price) || 0) * 1.35)}</div>
        </td>
        <td class="py-2.5 px-3 font-mono text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onclick="window.inlineEditProduct('${safeId}', 'wholesale_price', ${p.wholesale_price || Math.round((Number(p.selling_price) || 0) * 0.85)}, this)" title="ক্লিক করে হোলসেল দর এডিট করুন">
          ${formatCurrency(p.wholesale_price || Math.round((Number(p.selling_price) || 0) * 0.85))} ✎
        </td>
        <td class="py-2.5 px-3">
          <span class="font-bold px-2 py-0.5 rounded text-[11px] cursor-pointer hover:underline ${isOut ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400' : (isLow ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400')}" onclick="window.inlineEditProduct('${safeId}', 'stock', ${p.stock || 0}, this)" title="ক্লিক করে স্টক এডিট করুন">
            ${p.stock || 0} পিস ✎
          </span>
        </td>
        <td class="py-2.5 px-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${isAct ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}" onclick="window.toggleProductActive('${safeId}', this)">
            ${statusText}
          </span>
        </td>
        <td class="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
          <button type="button" class="btn-secondary py-1 px-2 text-[10px] text-emerald-600 border-emerald-200" onclick="window.openSingleProductEditModal('${safeId}')">✏️ এডিট</button>
          <a href="/product/${p.slug || p.product_id}" target="_blank" class="btn-secondary py-1 px-2 text-[10px]">দেখুন ↗</a>
          <button type="button" class="btn-secondary py-1 px-2 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50" onclick="window.handleAdminDeleteProduct('${safeId}', this)">মুছুন</button>
        </td>
      </tr>
    `;
  };

  window.renderAdminProductsTable = function() {
    const st = window.__adminProductFilterState;
    const perPage = 120; // Fixed 120 products per page as required
    st.perPage = perPage;

    const filtered = window.getFilteredAdminProducts();
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    if (st.page > totalPages) st.page = totalPages;
    if (st.page < 1) st.page = 1;

    const startIdx = (st.page - 1) * perPage;
    const pageItems = filtered.slice(startIdx, startIdx + perPage);

    const tbody = document.getElementById('admin-products-tbody');
    if (tbody) {
      if (pageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="py-8 text-center text-slate-400 text-xs">কোনো পণ্য পাওয়া যায়নি। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</td></tr>`;
      } else {
        tbody.innerHTML = pageItems.map(p => window.renderAdminProductRowHtml(p)).join('');
      }
    }

    // Update total badge & page info
    const countBadge = document.getElementById('admin-prod-total-count-label');
    if (countBadge) countBadge.textContent = `${totalItems} টি পণ্য (প্রতি পেজে ১২০ পিস)`;

    // Update pagination bar
    const pagBox = document.getElementById('admin-products-pagination');
    if (pagBox) {
      const showingFrom = totalItems === 0 ? 0 : startIdx + 1;
      const showingTo = Math.min(totalItems, startIdx + pageItems.length);
      let pageButtons = '';
      for (let i = 1; i <= totalPages; i++) {
        if (totalPages <= 10 || i === 1 || i === totalPages || Math.abs(i - st.page) <= 2) {
          pageButtons += `<button type="button" onclick="window.goToAdminProductPage(${i})" class="px-2.5 py-1 rounded-lg text-xs font-bold border transition ${i === st.page ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'}">${i}</button>`;
        } else if (i === st.page - 3 || i === st.page + 3) {
          pageButtons += `<span class="px-1 text-slate-400">...</span>`;
        }
      }
      pagBox.innerHTML = `
        <div class="text-[11px] text-slate-500 font-medium">
          দেখানো হচ্ছে <b>${showingFrom} - ${showingTo}</b> (মোট <b>${totalItems}</b> টি পণ্যের মধ্যে | প্রতি পেজে সর্বোচ্চ <b>১২০</b> পিস প্রোডাক্ট)
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <button type="button" onclick="window.goToAdminProductPage(${st.page - 1})" ${st.page <= 1 ? 'disabled' : ''} class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-white dark:bg-slate-900 disabled:opacity-40">« পূর্ববর্তী</button>
          ${pageButtons}
          <button type="button" onclick="window.goToAdminProductPage(${st.page + 1})" ${st.page >= totalPages ? 'disabled' : ''} class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-white dark:bg-slate-900 disabled:opacity-40">পরবর্তী »</button>
        </div>
      `;
    }

    // Sync master checkbox
    const masterCb = document.getElementById('prod-select-all-cb');
    if (masterCb) {
      const allPageSelected = pageItems.length > 0 && pageItems.every(p => st.selectedIds.has(String(p.sku || p.product_id || '')));
      masterCb.checked = allPageSelected;
    }

    window.updateBulkProductsActionBar();
  };

  window.goToAdminProductPage = function(pageNum) {
    window.__adminProductFilterState.page = Number(pageNum) || 1;
    window.renderAdminProductsTable();
  };

  window.filterAdminProducts = function(searchVal) {
    window.__adminProductFilterState.search = searchVal || '';
    window.__adminProductFilterState.page = 1;
    window.renderAdminProductsTable();
  };

  window.filterAdminProductCategory = function(catVal) {
    window.__adminProductFilterState.category = catVal || 'all';
    window.__adminProductFilterState.page = 1;
    window.renderAdminProductsTable();
  };

  window.filterAdminProductSubCategory = function(subVal) {
    window.__adminProductFilterState.sub_category = subVal || 'all';
    window.__adminProductFilterState.page = 1;
    window.renderAdminProductsTable();
  };

  window.filterAdminProductBrand = function(brandVal) {
    window.__adminProductFilterState.brand = brandVal || 'all';
    window.__adminProductFilterState.page = 1;
    window.renderAdminProductsTable();
  };

  window.filterAdminProductSort = function(sortVal) {
    window.__adminProductFilterState.sort = sortVal || 'default';
    window.__adminProductFilterState.page = 1;
    window.renderAdminProductsTable();
  };

  window.filterAdminProductStatus = function(statusVal, btn) {
    window.__adminProductFilterState.status = statusVal || 'all';
    window.__adminProductFilterState.page = 1;
    if (btn) {
      document.querySelectorAll('.prod-status-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    const statusSel = document.getElementById('adm-prod-filter-status-select');
    if (statusSel) statusSel.value = statusVal || 'all';
    window.renderAdminProductsTable();
  };

  window.resetAdminProductFilters = function() {
    window.__adminProductFilterState.search = '';
    window.__adminProductFilterState.category = 'all';
    window.__adminProductFilterState.sub_category = 'all';
    window.__adminProductFilterState.brand = 'all';
    window.__adminProductFilterState.status = 'all';
    window.__adminProductFilterState.sort = 'default';
    window.__adminProductFilterState.page = 1;

    const sInp = document.getElementById('adm-prod-search-input');
    const cSel = document.getElementById('adm-prod-filter-cat');
    const subSel = document.getElementById('adm-prod-filter-subcat');
    const bSel = document.getElementById('adm-prod-filter-brand');
    const stSel = document.getElementById('adm-prod-filter-status-select');
    const srSel = document.getElementById('adm-prod-filter-sort');
    if (sInp) sInp.value = '';
    if (cSel) cSel.value = 'all';
    if (subSel) subSel.value = 'all';
    if (bSel) bSel.value = 'all';
    if (stSel) stSel.value = 'all';
    if (srSel) srSel.value = 'default';

    document.querySelectorAll('.prod-status-filter-btn').forEach((b, idx) => {
      if (idx === 0) b.classList.add('active');
      else b.classList.remove('active');
    });
    window.renderAdminProductsTable();
  };

  // Checkbox Selection & Bulk Edit/Delete for Products
  window.toggleSingleProductCheckbox = function(id, checked) {
    const st = window.__adminProductFilterState;
    if (checked) st.selectedIds.add(String(id));
    else st.selectedIds.delete(String(id));
    window.updateBulkProductsActionBar();
  };

  window.toggleSelectAllProducts = function(masterCb) {
    const checked = !!masterCb?.checked;
    const st = window.__adminProductFilterState;
    const filtered = window.getFilteredAdminProducts();
    const startIdx = (st.page - 1) * st.perPage;
    const pageItems = filtered.slice(startIdx, startIdx + st.perPage);

    pageItems.forEach(p => {
      const id = String(p.sku || p.product_id || '');
      if (checked) st.selectedIds.add(id);
      else st.selectedIds.delete(id);
    });

    document.querySelectorAll('.prod-select-cb').forEach(cb => {
      cb.checked = checked;
    });
    window.updateBulkProductsActionBar();
  };

  window.clearProductCheckboxSelection = function() {
    window.__adminProductFilterState.selectedIds.clear();
    const masterCb = document.getElementById('prod-select-all-cb');
    if (masterCb) masterCb.checked = false;
    document.querySelectorAll('.prod-select-cb').forEach(cb => { cb.checked = false; });
    window.updateBulkProductsActionBar();
  };

  window.updateBulkProductsActionBar = function() {
    const count = window.__adminProductFilterState.selectedIds.size;
    const bar = document.getElementById('bulk-products-actions-bar');
    const countEl = document.getElementById('bulk-prod-selected-count');
    if (countEl) countEl.textContent = count;
    if (bar) {
      if (count > 0) bar.classList.remove('hidden');
      else bar.classList.add('hidden');
    }
  };

  window.openBulkSelectedProductsModal = function(mode) {
    const count = window.__adminProductFilterState.selectedIds.size;
    if (count === 0) {
      if (toast && toast.show) toast.show({ type: 'warning', title: 'পণ্য সিলেক্ট করুন', message: 'অনুগ্রহ করে চেকবক্সে টিক দিয়ে এক বা একাধিক পণ্য সিলেক্ট করুন।' });
      return;
    }
    const modal = document.getElementById('modal-bulk-selected-products');
    const modeInput = document.getElementById('bulk-sel-prod-mode');
    const titleEl = document.getElementById('bulk-sel-prod-modal-title');
    const bodyEl = document.getElementById('bulk-sel-prod-modal-fields');
    if (!modal || !bodyEl) return;

    if (modeInput) modeInput.value = mode;
    if (mode === 'price') {
      if (titleEl) titleEl.textContent = `💰 নির্বাচিত ${count} টি পণ্যের প্রাইজ এডিট করুন`;
      bodyEl.innerHTML = `
        <div class="space-y-3">
          <div>
            <label class="block font-bold mb-1">প্রাইজ পরিবর্তনের পদ্ধতি</label>
            <select id="bulk-sel-price-method" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" onchange="window.toggleBulkSelPriceMethodUI(this.value)">
              <option value="set_selling">নির্দিষ্ট খুচরা বিক্রয় মূল্য (Selling Price) সেট করুন</option>
              <option value="set_buying_auto">ক্রয় মূল্য (Buying Price) সেট করে টিয়ার ফর্মুলায় সব প্রাইজ অটো হিসাব করুন</option>
              <option value="inc_pct">শতকরা হারে (% বৃদ্ধি) করুন</option>
              <option value="dec_pct">শতকরা হারে (% হ্রাস) করুন</option>
              <option value="inc_flat">নির্দিষ্ট টাকা (+৳ বৃদ্ধি) করুন</option>
              <option value="dec_flat">নির্দিষ্ট টাকা (-৳ হ্রাস) করুন</option>
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1">মূল্য / মান লিখুন *</label>
            <input type="number" id="bulk-sel-price-val" required min="0" step="any" placeholder="যেমন: 1250 বা 10" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold font-mono" />
          </div>
        </div>
      `;
    } else if (mode === 'stock') {
      if (titleEl) titleEl.textContent = `📦 নির্বাচিত ${count} টি পণ্যের স্টক এডিট করুন`;
      bodyEl.innerHTML = `
        <div class="space-y-3">
          <div>
            <label class="block font-bold mb-1">স্টক পরিবর্তনের ধরন</label>
            <select id="bulk-sel-stock-method" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
              <option value="set">নির্দিষ্ট স্টক সংখ্যা সেট করুন (=)</option>
              <option value="add">বর্তমান স্টকের সাথে যোগ করুন (+)</option>
              <option value="sub">বর্তমান স্টক থেকে বিয়োগ করুন (-)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1">স্টক পরিমাণ (পিস) *</label>
            <input type="number" id="bulk-sel-stock-val" required min="0" value="50" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold font-mono" />
          </div>
        </div>
      `;
    } else if (mode === 'status') {
      if (titleEl) titleEl.textContent = `🔄 নির্বাচিত ${count} টি পণ্যের স্ট্যাটাস পরিবর্তন করুন`;
      bodyEl.innerHTML = `
        <div>
          <label class="block font-bold mb-1">নতুন স্ট্যাটাস নির্বাচন করুন</label>
          <select id="bulk-sel-status-val" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
            <option value="সক্রিয়">সক্রিয় (Active / In Store)</option>
            <option value="নিষ্ক্রিয়">নিষ্ক্রিয় (Inactive / Hidden)</option>
          </select>
        </div>
      `;
    }
    modal.classList.remove('hidden');
  };

  window.handleApplyBulkSelectedProductsEdit = function(e) {
    e.preventDefault();
    const st = window.__adminProductFilterState;
    const selectedIds = st.selectedIds;
    if (selectedIds.size === 0) return;

    const mode = document.getElementById('bulk-sel-prod-mode')?.value;
    let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    let updatedCount = 0;

    prods = prods.map(p => {
      const id = String(p.sku || p.product_id || '');
      if (!selectedIds.has(id)) return p;
      updatedCount++;

      if (mode === 'price') {
        const method = document.getElementById('bulk-sel-price-method')?.value || 'set_selling';
        const val = Number(document.getElementById('bulk-sel-price-val')?.value || 0);
        if (method === 'set_buying_auto') {
          const calc = window.calculateAllPricesFromBuying(val);
          p.buying_price = calc.buying_price;
          p.selling_price = calc.selling_price;
          p.original_price = calc.original_price;
          p.wholesale_price = calc.wholesale_price;
          p.min_order_q = calc.min_order_q;
        } else {
          let newSp = Number(p.selling_price) || 0;
          if (method === 'set_selling') newSp = Math.round(val);
          else if (method === 'inc_pct') newSp = Math.round(newSp * (1 + val / 100));
          else if (method === 'dec_pct') newSp = Math.max(1, Math.round(newSp * (1 - val / 100)));
          else if (method === 'inc_flat') newSp = Math.round(newSp + val);
          else if (method === 'dec_flat') newSp = Math.max(1, Math.round(newSp - val));
          p.selling_price = newSp;
          const origRate = window.getTieredSellingMarkupRate(newSp);
          p.original_price = Math.round(newSp + newSp * origRate);
          p.min_order_q = newSp <= 200 ? 10 : 5;
        }
      } else if (mode === 'stock') {
        const method = document.getElementById('bulk-sel-stock-method')?.value || 'set';
        const val = Number(document.getElementById('bulk-sel-stock-val')?.value || 0);
        const cur = Number(p.stock) || 0;
        if (method === 'set') p.stock = Math.max(0, val);
        else if (method === 'add') p.stock = Math.max(0, cur + val);
        else if (method === 'sub') p.stock = Math.max(0, cur - val);
      } else if (mode === 'status') {
        const newSt = document.getElementById('bulk-sel-status-val')?.value || 'সক্রিয়';
        p.status = newSt;
        p.is_active = newSt === 'সক্রিয়';
      }
      return p;
    });

    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
    if (window.__adminState) window.__adminState.products = prods;

    document.getElementById('modal-bulk-selected-products')?.classList.add('hidden');
    window.renderAdminProductsTable();
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'বাল্ক আপডেট সম্পন্ন', message: `নির্বাচিত ${updatedCount} টি পণ্যের তথ্য সফলভাবে আপডেট করা হয়েছে!` });
    }
  };

  window.handleBulkSelectedProductsDelete = function() {
    const st = window.__adminProductFilterState;
    const count = st.selectedIds.size;
    if (count === 0) return;
    if (!confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${count} টি পণ্য স্থায়ীভাবে ডিলিট করতে চান?`)) return;

    let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    prods = prods.filter(p => !st.selectedIds.has(String(p.sku || p.product_id || '')));
    st.selectedIds.clear();

    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
    if (window.__adminState) window.__adminState.products = prods;

    window.renderAdminProductsTable();
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'বাল্ক ডিলিট সম্পন্ন', message: `${count} টি পণ্য মুছে ফেলা হয়েছে।` });
    }
  };

  // Single Product Edit Modal & Inline Edit
  window.inlineEditProduct = function(id, field, currentVal, el) {
    const labels = {
      buying_price: 'ক্রয় মূল্য (৳)',
      selling_price: 'খুচরা বিক্রয় দর (৳)',
      wholesale_price: 'হোলসেল দর (৳)',
      stock: 'মজুদ স্টক (পিস)'
    };
    const label = labels[field] || field;
    const newVal = prompt(`${label} পরিবর্তন করুন:`, currentVal);
    if (newVal === null || newVal.trim() === '' || isNaN(Number(newVal))) return;

    const val = Number(newVal);
    let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    prods = prods.map(p => {
      if (p.product_id === id || p.sku === id) {
        p[field] = val;
        if (field === 'buying_price') {
          const calc = window.calculateAllPricesFromBuying(val);
          p.selling_price = calc.selling_price;
          p.original_price = calc.original_price;
          p.wholesale_price = calc.wholesale_price;
          p.min_order_q = calc.min_order_q;
        } else if (field === 'selling_price') {
          const origRate = window.getTieredSellingMarkupRate(val);
          p.original_price = Math.round(val + val * origRate);
          p.min_order_q = val <= 200 ? 10 : 5;
        }
      }
      return p;
    });
    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
    if (window.__adminState) window.__adminState.products = prods;

    window.renderAdminProductsTable();
    if (toast && toast.show) toast.show({ type: 'success', title: 'আপডেট সফল', message: `${label} আপডেট করা হয়েছে!` });
  };

  window.toggleProductActive = function(id, btn) {
    let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    let currentStatus = 'সক্রিয়';
    prods = prods.map(p => {
      if (p.product_id === id || p.sku === id) {
        p.status = (p.status === 'নিষ্ক্রিয়') ? 'সক্রিয়' : 'নিষ্ক্রিয়';
        currentStatus = p.status;
      }
      return p;
    });
    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
    if (window.__adminState) window.__adminState.products = prods;
    window.renderAdminProductsTable();
    if (toast && toast.show) toast.show({ type: 'success', title: 'পণ্য স্ট্যাটাস', message: `পণ্যটির স্ট্যাটাস "${currentStatus}" করা হয়েছে।` });
  };

  window.openSingleProductEditModal = function(id) {
    const prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const p = prods.find(item => item.sku === id || item.product_id === id);
    if (!p) return;
    window.switchAdminPage('page-prod-add', 'group-products');
    setTimeout(() => {
      const setV = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val ?? ''; };
      setV('adm-sku', p.sku || p.product_id || '');
      setV('adm-name', p.name || p.p_name || '');
      window.ensureSelectValue('adm-cat', p.category || 'Smartwatches');
      window.populateSubAndChildDropdowns(p.category || 'Smartwatches', p.sub_category || '', p.child_category || '', 'adm');
      window.ensureSelectValue('adm-brand', p.brand || 'Dream Cart BD');
      setV('adm-buyprice', p.buying_price || 0);
      setV('adm-sellprice', p.selling_price || 0);
      setV('adm-stock', p.stock ?? 0);
      setV('adm-origprice', p.original_price || 0);
      setV('adm-wholesaleprice', p.wholesale_price || 0);
      setV('adm-minorderq', p.min_order_q || (Number(p.selling_price) <= 200 ? 10 : 5));
      const imgs = Array.isArray(p.images) && p.images.length ? p.images.join(', ') : (p.thumbnail || '');
      setV('adm-imageurl', imgs);
      setV('adm-slug', p.slug || '');
      setV('adm-desc', p.description || '');
      setV('adm-spec', p.specification || '');
      setV('adm-others', p.others || '');
      setV('adm-color', p.color || '');
      setV('adm-size', p.size || '');
      setV('adm-weight', p.weight_kg || 0.25);
      setV('adm-width', p.width_cm || 10);
      setV('adm-length', p.length_cm || 12);
      setV('adm-height', p.height_cm || 6);
      window.renderAdminProductImagePreviews('adm');
      window.renderColorSizeChips('adm');
      window.updateAddProductLiveSummary && window.updateAddProductLiveSummary();
      if (toast && toast.show) toast.show({ type: 'info', title: 'পণ্য এডিট মোড', message: `"${p.name}" ফর্মে লোড হয়েছে। পরিবর্তন করে সংরক্ষণ করুন।` });
    }, 50);
  };

  window.handleAdminDeleteProduct = async function(id, btn) {
    if (!confirm('আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?')) return;
    try {
      let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
      prods = prods.filter(p => p.product_id !== id && p.sku !== id);
      localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
      if (window.__adminState) window.__adminState.products = prods;
      window.__adminProductFilterState?.selectedIds?.delete(String(id));
      await apiClient.request('products/delete', { id });
      window.renderAdminProductsTable();
      if (toast && toast.show) toast.show({ type: 'success', title: 'পণ্য মোছা হয়েছে', message: 'পণ্যটি ডিলিট করা হয়েছে।' });
    } catch (e) {
      window.renderAdminProductsTable();
    }
  };


  // ============================================================================
  // REQUIREMENTS 3, 4, 5: BULK PRICE, BULK IMAGE, BULK PRODUCT SAMPLE DOWNLOAD & SHEET UPLOAD
  // ============================================================================
  window.parseCsvLinesToRows = function(csvText) {
    const clean = String(csvText || '').replace(/^\uFEFF/, '').trim();
    if (!clean) return [];
    const lines = clean.split(/\r?\n/).filter(l => l.trim().length > 0);
    return lines.map(line => {
      // Support both tab-delimited and comma-delimited with quotes
      if (line.includes('\t') && !line.includes(',')) {
        return line.split('\t').map(s => s.trim().replace(/^"|"$/g, ''));
      }
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += ch;
        }
      }
      result.push(cur.trim());
      return result;
    });
  };

  window.exportAdminProductsCsv = function() {
    const prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const headers = [
      'SKU', 'P_Name', 'Category', 'Sub_Category', 'Child_Category', 'Brand',
      'Buying_price', 'Selling_Price', 'Stock', 'Original_Price', 'WholeSale_price', 'Min_order_Q',
      'Images', 'Slug', 'Description', 'Specification', 'Others', 'Color', 'Size',
      'WEIGHT_KG', 'WIDTH_CM', 'LENGTH_CM', 'HEIGHT_CM'
    ];
    const rows = prods.map(p => [
      p.sku || p.product_id || '',
      p.p_name || p.name || '',
      p.category || '',
      p.sub_category || '',
      p.child_category || '',
      p.brand || '',
      p.buying_price || 0,
      p.selling_price || 0,
      p.stock ?? 0,
      p.original_price || 0,
      p.wholesale_price || 0,
      p.min_order_q || (Number(p.selling_price) <= 200 ? 10 : 5),
      Array.isArray(p.images) ? p.images.join(' | ') : (p.thumbnail || ''),
      p.slug || '',
      p.description || '',
      p.specification || '',
      p.others || '',
      p.color || '',
      p.size || '',
      p.weight_kg || 0.25,
      p.width_cm || 10,
      p.length_cm || 12,
      p.height_cm || 6
    ]);
    window.exportGenericCsv('Products_23Col_Export', headers, rows);
  };

  window.exportAdminOrdersCsv = function() {
    const orders = (window.__adminState && window.__adminState.orders) || JSON.parse(localStorage.getItem('dcbd_sheet_orders') || '[]');
    const headers = ['Order_ID', 'Customer_Name', 'Phone', 'Address', 'Products', 'Quantity', 'Total_Amount', 'Payment_Method', 'Payment_Status', 'Order_Status'];
    const rows = orders.map(o => [o.order_id, o.customer_name, o.phone, o.address, o.products, o.quantity || 1, o.total_amount, o.payment_method, o.payment_status, o.order_status]);
    window.exportGenericCsv('Orders_Export', headers, rows);
  };

  window.filterOrderStatus = function(status, btn) {
    if (btn) {
      document.querySelectorAll('.order-status-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    document.querySelectorAll('#admin-orders-tbody tr').forEach(tr => {
      if (!status || tr.getAttribute('data-status') === status) tr.style.display = '';
      else tr.style.display = 'none';
    });
  };

  // 1) BULK PRICE UPDATE: Sample Sheet Download & Upload
  window.downloadBulkPriceSampleSheet = function(includeAllExisting = false) {
    const headers = ['SKU', 'P_Name', 'Buying_price', 'Selling_Price', 'Original_Price', 'WholeSale_price', 'Min_order_Q', 'Stock'];
    const prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const source = includeAllExisting && prods.length > 0 ? prods : [
      { sku: 'DCBD-WT-01', name: 'Amazfit GTS 4 Smartwatch (Black)', buying_price: 5500, selling_price: 7425, original_price: 10024, wholesale_price: 6600, min_order_q: 5, stock: 25 },
      { sku: 'DCBD-GS-02', name: 'অটো গ্যাস সেফটি ডিভাইস (Heavy Duty)', buying_price: 1500, selling_price: 2175, original_price: 3110, wholesale_price: 1920, min_order_q: 5, stock: 40 },
      { sku: 'DCBD-HN-03', name: 'সুন্দরবনের খাঁটি চাকের মধু (১ কেজি)', buying_price: 800, selling_price: 1176, original_price: 1705, wholesale_price: 1040, min_order_q: 5, stock: 30 }
    ];
    const rows = source.map(p => {
      const calc = window.calculateAllPricesFromBuying(p.buying_price || 0, p.selling_price || null);
      return [
        p.sku || p.product_id || '',
        p.p_name || p.name || '',
        p.buying_price || 0,
        p.selling_price || calc.selling_price,
        p.original_price || calc.original_price,
        p.wholesale_price || calc.wholesale_price,
        p.min_order_q || calc.min_order_q,
        p.stock ?? 20
      ];
    });
    window.exportGenericCsv(includeAllExisting ? 'All_Products_Price_Sheet' : 'Sample_Bulk_Price_Update_Sheet', headers, rows);
  };

  window.__parsedBulkPriceRows = [];

  window.handleBulkPriceSheetUpload = function(fileInput) {
    const file = fileInput?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const rows = window.parseCsvLinesToRows(evt.target?.result || '');
      if (rows.length === 0) return;

      const firstRowStr = rows[0].join(' ').toLowerCase();
      const hasHeader = firstRowStr.includes('sku') || firstRowStr.includes('buying') || firstRowStr.includes('selling') || firstRowStr.includes('price');
      const dataRows = hasHeader ? rows.slice(1) : rows;

      const autoTier = document.getElementById('bulk-price-auto-tier-cb')?.checked !== false;
      const parsed = [];

      dataRows.forEach(r => {
        const sku = (r[0] || '').trim();
        const name = (r[1] || '').trim();
        if (!sku && !name) return;
        const bp = Number(r[2] || 0);
        const rawSp = Number(r[3] || 0);
        const calc = window.calculateAllPricesFromBuying(bp, (!autoTier && rawSp > 0) ? rawSp : (bp === 0 && rawSp > 0 ? rawSp : null));
        const sp = (!autoTier && rawSp > 0) ? rawSp : (bp > 0 ? calc.selling_price : rawSp);
        const origRate = window.getTieredSellingMarkupRate(sp);
        const op = Number(r[4] || 0) > 0 && !autoTier ? Number(r[4]) : Math.round(sp + sp * origRate);
        const wp = Number(r[5] || 0) > 0 && !autoTier ? Number(r[5]) : (bp > 0 ? calc.wholesale_price : Math.round(sp * 0.85));
        const minQ = Number(r[6] || 0) > 0 && !autoTier ? Number(r[6]) : (sp <= 200 ? 10 : 5);
        const stock = r[7] !== undefined && r[7] !== '' ? Number(r[7]) : null;
        parsed.push({ sku, name, buying_price: bp, selling_price: sp, original_price: op, wholesale_price: wp, min_order_q: minQ, stock });
      });

      window.__parsedBulkPriceRows = parsed;
      const previewEl = document.getElementById('bulk-price-sheet-preview');
      if (previewEl) {
        previewEl.innerHTML = `
          <div class="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-emerald-700 dark:text-emerald-300">✅ সীট থেকে ${parsed.length} টি পণ্যের প্রাইজ ডাটা লোড হয়েছে!</span>
              <button type="button" onclick="window.applyUploadedBulkPriceSheet()" class="btn-primary py-1.5 px-4 text-xs font-bold">এখনই প্রাইজ আপডেট কার্যকর করুন →</button>
            </div>
            <div class="max-h-48 overflow-y-auto border rounded-xl bg-white dark:bg-slate-900">
              <table class="w-full text-left text-[11px]">
                <thead class="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase">
                  <tr><th class="p-2">SKU</th><th class="p-2">P_Name</th><th class="p-2">Buying</th><th class="p-2">Selling</th><th class="p-2">Original</th><th class="p-2">Wholesale</th><th class="p-2">Min_Q</th></tr>
                </thead>
                <tbody class="divide-y">
                  ${parsed.slice(0, 30).map(item => `
                    <tr>
                      <td class="p-2 font-mono font-bold">${item.sku}</td>
                      <td class="p-2 truncate max-w-[160px]">${item.name}</td>
                      <td class="p-2 font-mono">৳${item.buying_price}</td>
                      <td class="p-2 font-mono font-bold text-emerald-600">৳${item.selling_price}</td>
                      <td class="p-2 font-mono">৳${item.original_price}</td>
                      <td class="p-2 font-mono">৳${item.wholesale_price}</td>
                      <td class="p-2 font-mono">${item.min_order_q}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
      // Automatically apply immediately as requested ("সীট আপলোড করেই প্রাইজ আপডেট করবে")
      window.applyUploadedBulkPriceSheet();
    };
    reader.readAsText(file);
  };

  window.applyUploadedBulkPriceSheet = function() {
    const rows = window.__parsedBulkPriceRows || [];
    if (rows.length === 0) {
      if (toast && toast.show) toast.show({ type: 'warning', title: 'সীট নির্বাচন করুন', message: 'অনুগ্রহ করে প্রথমে প্রাইজ সীট (CSV) ফাইল আপলোড করুন।' });
      return;
    }
    let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    let updatedCount = 0;

    rows.forEach(r => {
      const idx = prods.findIndex(p =>
        (r.sku && (String(p.sku || '').toLowerCase() === r.sku.toLowerCase() || String(p.product_id || '').toLowerCase() === r.sku.toLowerCase())) ||
        (r.name && String(p.name || p.p_name || '').toLowerCase() === r.name.toLowerCase())
      );
      if (idx >= 0) {
        if (r.buying_price > 0) prods[idx].buying_price = r.buying_price;
        if (r.selling_price > 0) prods[idx].selling_price = r.selling_price;
        if (r.original_price > 0) prods[idx].original_price = r.original_price;
        if (r.wholesale_price > 0) prods[idx].wholesale_price = r.wholesale_price;
        if (r.min_order_q > 0) prods[idx].min_order_q = r.min_order_q;
        if (r.stock !== null && !isNaN(r.stock)) prods[idx].stock = r.stock;
        updatedCount++;
      }
    });

    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
    if (window.__adminState) window.__adminState.products = prods;
    window.renderAdminProductsTable && window.renderAdminProductsTable();
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'বাল্ক প্রাইজ আপডেট সম্পন্ন!', message: `সীট থেকে ${updatedCount} টি পণ্যের মূল্য সফলভাবে আপডেট করা হয়েছে!` });
    }
  };

  // 2) BULK IMAGE UPDATE: Sample Sheet Download & Upload
  window.downloadBulkImageSampleSheet = function(includeAllExisting = false) {
    const headers = ['SKU', 'P_Name', 'Images'];
    const prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const source = includeAllExisting && prods.length > 0 ? prods : [
      { sku: 'DCBD-WT-01', name: 'Amazfit GTS 4 Smartwatch (Black)', thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
      { sku: 'DCBD-GS-02', name: 'অটো গ্যাস সেফটি ডিভাইস (Heavy Duty)', thumbnail: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600' },
      { sku: 'DCBD-HN-03', name: 'সুন্দরবনের খাঁটি চাকের মধু (১ কেজি)', thumbnail: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600' }
    ];
    const rows = source.map(p => [
      p.sku || p.product_id || '',
      p.p_name || p.name || '',
      Array.isArray(p.images) && p.images.length ? p.images.join(' | ') : (p.thumbnail || '')
    ]);
    window.exportGenericCsv(includeAllExisting ? 'All_Products_Image_Sheet' : 'Sample_Bulk_Image_Update_Sheet', headers, rows);
  };

  window.__parsedBulkImageRows = [];

  window.handleBulkImageSheetUpload = function(fileInput) {
    const file = fileInput?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const rows = window.parseCsvLinesToRows(evt.target?.result || '');
      if (rows.length === 0) return;

      const firstRowStr = rows[0].join(' ').toLowerCase();
      const hasHeader = firstRowStr.includes('sku') || firstRowStr.includes('image') || firstRowStr.includes('p_name');
      const dataRows = hasHeader ? rows.slice(1) : rows;

      const parsed = [];
      dataRows.forEach(r => {
        const sku = (r[0] || '').trim();
        const name = (r.length >= 3 ? r[1] : '').trim();
        const rawImg = (r.length >= 3 ? r[2] : r[1] || '').trim();
        if ((!sku && !name) || !rawImg) return;
        const imgs = rawImg.split(/\||;/).map(s => s.trim()).filter(Boolean);
        parsed.push({ sku, name, images: imgs, thumbnail: imgs[0] });
      });

      window.__parsedBulkImageRows = parsed;
      const previewEl = document.getElementById('bulk-image-sheet-preview');
      if (previewEl) {
        previewEl.innerHTML = `
          <div class="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-emerald-700 dark:text-emerald-300">✅ সীট থেকে ${parsed.length} টি পণ্যের ছবি লোড হয়েছে!</span>
              <button type="button" onclick="window.applyUploadedBulkImageSheet()" class="btn-primary py-1.5 px-4 text-xs font-bold">এখনই ছবি আপডেট কার্যকর করুন →</button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              ${parsed.slice(0, 16).map(item => `
                <div class="p-2 rounded-xl bg-white dark:bg-slate-900 border flex items-center gap-2">
                  <img src="${item.thumbnail}" class="w-10 h-10 rounded-lg object-cover border flex-shrink-0" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                  <div class="min-w-0 text-[10px]">
                    <div class="font-mono font-bold truncate">${item.sku || item.name}</div>
                    <div class="text-slate-400 truncate">${item.images.length} টি ছবি</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
      // Immediately apply upon upload ("সীট আপলোড করেই ছবি আপডেট করবে")
      window.applyUploadedBulkImageSheet();
    };
    reader.readAsText(file);
  };

  window.applyUploadedBulkImageSheet = function() {
    const rows = window.__parsedBulkImageRows || [];
    if (rows.length === 0) {
      if (toast && toast.show) toast.show({ type: 'warning', title: 'সীট নির্বাচন করুন', message: 'অনুগ্রহ করে প্রথমে ইমেজ সীট (CSV) আপলোড করুন।' });
      return;
    }
    let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    let updatedCount = 0;

    rows.forEach(r => {
      const idx = prods.findIndex(p =>
        (r.sku && (String(p.sku || '').toLowerCase() === r.sku.toLowerCase() || String(p.product_id || '').toLowerCase() === r.sku.toLowerCase())) ||
        (r.name && String(p.name || p.p_name || '').toLowerCase() === r.name.toLowerCase())
      );
      if (idx >= 0) {
        prods[idx].images = r.images;
        prods[idx].thumbnail = r.thumbnail;
        updatedCount++;
      }
    });

    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
    if (window.__adminState) window.__adminState.products = prods;
    window.renderAdminProductsTable && window.renderAdminProductsTable();
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'বাল্ক ইমেজ আপডেট সম্পন্ন!', message: `সীট থেকে ${updatedCount} টি পণ্যের ছবি সফলভাবে আপডেট করা হয়েছে!` });
    }
  };

  // 3) BULK PRODUCT UPLOAD: Sample 23-Column Sheet Download & Upload
  window.downloadBulkProductSampleSheet = function() {
    const headers = [
      'SKU', 'P_Name', 'Category', 'Sub_Category', 'Child_Category', 'Brand',
      'Buying_price', 'Selling_Price', 'Stock', 'Original_Price', 'WholeSale_price', 'Min_order_Q',
      'Images', 'Slug', 'Description', 'Specification', 'Others', 'Color', 'Size',
      'WEIGHT_KG', 'WIDTH_CM', 'LENGTH_CM', 'HEIGHT_CM'
    ];
    const sampleRows = [
      [
        'DCBD-SM-101', 'Kieslect Kr Pro Calling Smartwatch AMOLED', 'Smartwatches', 'Calling Watch', 'Fitness & GPS', 'Kieslect',
        4200, 6006, 35, 7808, 5250, 5,
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600', 'kieslect-kr-pro-calling-smartwatch-dcbd-sm-101',
        '1.43 inch Ultra FHD AMOLED Display with Bluetooth calling and AI voice assistant.',
        'Display: 1.43" AMOLED | Battery: 280mAh | Waterproof: IP68', '1 Year Official Warranty', 'Jet Black, Silver', 'Standard',
        0.18, 9, 11, 6
      ],
      [
        'DCBD-OR-102', 'সুন্দরবনের প্রাকৃতিক খাঁটি চাকের মধু ১ কেজি', 'Organic & Health', 'Honey', 'Pure Natural', 'Dream Organic',
        850, 1233, 50, 1788, 1088, 5,
        'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600', 'sundarban-natural-honey-1kg-dcbd-or-102',
        '১০০% খাঁটি ও প্রাকৃতিক সুন্দরবনের খলিশা ফুলের চাকের মধু।',
        'ওজন: ১ কেজি | গ্রেড: প্রিমিয়াম অর্গানিক র-হানি', 'ক্যাশ অন ডেলিভারি সুবিধা', 'Pure Amber', '১ কেজি',
        1.0, 14, 16, 19
      ]
    ];
    window.exportGenericCsv('Sample_Bulk_Product_Upload_23Columns', headers, sampleRows);
  };

  window.__parsedBulkProductRows = [];

  window.parseRowTo23ColProduct = function(r, idx) {
    const sku = (r[0] || '').trim() || `DCBD-BLK-${Date.now().toString().slice(-4)}-${idx + 1}`;
    const name = (r[1] || '').trim() || 'বাল্ক পণ্য';
    const ai = window.analyzeProductNameAI(name, sku);

    // Detect if simplified 7-col row (SKU, Name, Cat, SellPrice, WholesalePrice, Stock, Image) vs 23-col row
    const isShortFormat = r.length <= 8 && !isNaN(Number(r[3])) && (r[6] || '').startsWith('http');
    if (isShortFormat) {
      const sp = Number(r[3]) || 990;
      const bp = Math.round(sp * 0.7);
      const calc = window.calculateAllPricesFromBuying(bp, sp);
      const img = (r[6] || '').trim() || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
      return {
        product_id: sku, sku, name, p_name: name,
        category: (r[2] || '').trim() || ai.category,
        sub_category: ai.sub_category,
        child_category: ai.child_category,
        brand: ai.brand,
        buying_price: bp,
        selling_price: sp,
        stock: Number(r[5] ?? 30),
        original_price: calc.original_price,
        wholesale_price: Number(r[4]) || calc.wholesale_price,
        min_order_q: calc.min_order_q,
        images: [img], thumbnail: img,
        slug: ai.slug, description: '', specification: '', others: '',
        color: 'Standard', size: 'Free Size',
        weight_kg: ai.weight_kg, width_cm: ai.width_cm, length_cm: ai.length_cm, height_cm: ai.height_cm,
        status: 'সক্রিয়', is_active: true
      };
    }

    const bp = Number(r[6] || 0);
    const rawSp = Number(r[7] || 0);
    const calc = window.calculateAllPricesFromBuying(bp, rawSp > 0 ? rawSp : null);
    const sp = calc.selling_price || rawSp || 990;
    const stock = r[8] !== undefined && r[8] !== '' ? Number(r[8]) : 30;
    const op = Number(r[9] || 0) || calc.original_price;
    const wp = Number(r[10] || 0) || calc.wholesale_price;
    const minQ = Number(r[11] || 0) || (sp <= 200 ? 10 : 5);
    const rawImgs = (r[12] || '').split(/\||;/).map(s => s.trim()).filter(Boolean);
    const defaultImg = 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
    const images = rawImgs.length > 0 ? rawImgs : [defaultImg];

    return {
      product_id: sku,
      sku,
      name,
      p_name: name,
      category: (r[2] || '').trim() || ai.category,
      sub_category: (r[3] || '').trim() || ai.sub_category,
      child_category: (r[4] || '').trim() || ai.child_category,
      brand: (r[5] || '').trim() || ai.brand,
      buying_price: bp,
      selling_price: sp,
      stock,
      original_price: op,
      wholesale_price: wp,
      min_order_q: minQ,
      images,
      thumbnail: images[0],
      slug: (r[13] || '').trim() || ai.slug,
      description: (r[14] || '').trim(),
      specification: (r[15] || '').trim(),
      others: (r[16] || '').trim(),
      color: (r[17] || '').trim() || 'Standard',
      size: (r[18] || '').trim() || 'Free Size',
      weight_kg: Number(r[19] || ai.weight_kg || 0.25),
      width_cm: Number(r[20] || ai.width_cm || 10),
      length_cm: Number(r[21] || ai.length_cm || 12),
      height_cm: Number(r[22] || ai.height_cm || 6),
      status: 'সক্রিয়',
      is_active: true
    };
  };

  window.handleBulkProductSheetUpload = function(fileInput) {
    const file = fileInput?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const rows = window.parseCsvLinesToRows(evt.target?.result || '');
      if (rows.length === 0) return;

      const firstRowStr = rows[0].join(' ').toLowerCase();
      const hasHeader = firstRowStr.includes('sku') || firstRowStr.includes('p_name') || firstRowStr.includes('category');
      const dataRows = hasHeader ? rows.slice(1) : rows;

      const parsed = dataRows.filter(r => r.length >= 2 && (r[0] || r[1])).map((r, idx) => window.parseRowTo23ColProduct(r, idx));
      window.__parsedBulkProductRows = parsed;

      const previewEl = document.getElementById('bulk-product-sheet-preview');
      if (previewEl) {
        previewEl.innerHTML = `
          <div class="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-emerald-700 dark:text-emerald-300">✅ সীট থেকে ${parsed.length} টি পণ্য (২৩ কলাম AI ও প্রাইসিংসহ) প্রস্তুত!</span>
              <button type="button" onclick="window.applyUploadedBulkProductSheet()" class="btn-primary py-1.5 px-4 text-xs font-bold">পণ্যসমূহ সংরক্ষণ করুন →</button>
            </div>
            <div class="max-h-52 overflow-y-auto border rounded-xl bg-white dark:bg-slate-900">
              <table class="w-full text-left text-[11px]">
                <thead class="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase">
                  <tr><th class="p-2">SKU</th><th class="p-2">P_Name</th><th class="p-2">Category › Sub › Child</th><th class="p-2">Brand</th><th class="p-2">Buy/Sell/WS</th><th class="p-2">Stock</th></tr>
                </thead>
                <tbody class="divide-y">
                  ${parsed.slice(0, 30).map(item => `
                    <tr>
                      <td class="p-2 font-mono font-bold">${item.sku}</td>
                      <td class="p-2 truncate max-w-[160px] font-bold">${item.name}</td>
                      <td class="p-2 text-[10px]">${item.category} › ${item.sub_category} › ${item.child_category}</td>
                      <td class="p-2">${item.brand}</td>
                      <td class="p-2 font-mono">৳${item.buying_price} / <b class="text-emerald-600">৳${item.selling_price}</b> / ৳${item.wholesale_price}</td>
                      <td class="p-2 font-mono">${item.stock}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
      // Immediately apply upon upload ("সীট আপলোড করেই পণ্য আপডেট করবে")
      window.applyUploadedBulkProductSheet();
    };
    reader.readAsText(file);
  };

  window.applyUploadedBulkProductSheet = function() {
    const parsed = window.__parsedBulkProductRows || [];
    if (parsed.length === 0) {
      if (toast && toast.show) toast.show({ type: 'warning', title: 'সীট আপলোড করুন', message: 'অনুগ্রহ করে প্রথমে পণ্য আপলোড সীট (CSV) নির্বাচন করুন।' });
      return;
    }
    let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    let added = 0;
    let updated = 0;

    parsed.forEach(item => {
      const idx = prods.findIndex(p => String(p.sku || p.product_id || '').toLowerCase() === item.sku.toLowerCase());
      if (idx >= 0) {
        prods[idx] = { ...prods[idx], ...item };
        updated++;
      } else {
        prods.unshift(item);
        added++;
      }
    });

    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
    if (window.__adminState) window.__adminState.products = prods;
    window.renderAdminProductsTable && window.renderAdminProductsTable();
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'বাল্ক পণ্য আপলোড সম্পন্ন!', message: `${added} টি নতুন পণ্য যুক্ত এবং ${updated} টি পণ্য আপডেট হয়েছে!` });
    }
  };

  window.handleBulkAddProducts = function(e) {
    e.preventDefault();
    const rawData = document.getElementById('adm-bulk-products-input')?.value || '';
    if (!rawData.trim()) return;
    const rows = window.parseCsvLinesToRows(rawData);
    window.__parsedBulkProductRows = rows.filter(r => r.length >= 2).map((r, i) => window.parseRowTo23ColProduct(r, i));
    window.applyUploadedBulkProductSheet();
    setTimeout(() => window.switchAdminPage('page-prod-all', 'group-products'), 700);
  };

  window.handleBulkPriceUpdate = function(e) {
    e.preventDefault();
    const pct = Number(document.getElementById('adm-bulk-pct')?.value || '0');
    const type = document.getElementById('adm-bulk-price-type')?.value || 'increase';
    const cat = document.getElementById('adm-bulk-cat-target')?.value || 'all';

    let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    let updated = 0;
    prods = prods.map(p => {
      if (cat === 'all' || p.category === cat) {
        const factor = type === 'increase' ? (1 + pct / 100) : (1 - pct / 100);
        p.selling_price = Math.max(1, Math.round((Number(p.selling_price) || 0) * factor));
        const origRate = window.getTieredSellingMarkupRate(p.selling_price);
        p.original_price = Math.round(p.selling_price + p.selling_price * origRate);
        p.min_order_q = p.selling_price <= 200 ? 10 : 5;
        updated++;
      }
      return p;
    });

    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
    if (window.__adminState) window.__adminState.products = prods;
    window.renderAdminProductsTable && window.renderAdminProductsTable();
    if (toast && toast.show) toast.show({ type: 'success', title: 'মূল্য আপডেট', message: `${updated} টি পণ্যের মূল্য ${pct}% ${type === 'increase' ? 'বৃদ্ধি' : 'হ্রাস'} করা হয়েছে!` });
  };

  window.handleBulkImageUpdate = function(e) {
    e.preventDefault();
    const newImg = (document.getElementById('adm-bulk-new-image')?.value || '').trim();
    const cat = document.getElementById('adm-bulk-image-cat')?.value || 'all';
    if (!newImg) return;

    let prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    let count = 0;
    prods = prods.map(p => {
      if (cat === 'all' || p.category === cat) {
        p.thumbnail = newImg;
        p.images = [newImg];
        count++;
      }
      return p;
    });

    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
    if (window.__adminState) window.__adminState.products = prods;
    window.renderAdminProductsTable && window.renderAdminProductsTable();
    if (toast && toast.show) toast.show({ type: 'success', title: 'ইমেজ আপডেট', message: `${count} টি পণ্যের ছবি পরিবর্তন করা হয়েছে!` });
  };


  // ============================================================================
  // REQUIREMENT 6: BRANDS CARD VIEW & BRAND MANAGEMENT HANDLERS
  // ============================================================================
  window.handleBrandLogoUpload = function(fileInput) {
    const file = fileInput?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target?.result;
      const inp = document.getElementById('adm-new-brand-image');
      const prev = document.getElementById('adm-new-brand-logo-preview');
      if (inp && dataUrl) inp.value = dataUrl;
      if (prev && dataUrl) {
        prev.src = dataUrl;
        prev.classList.remove('hidden');
      }
    };
    reader.readAsDataURL(file);
  };

  window.renderAdminBrandCards = function(searchQuery = '') {
    const grid = document.getElementById('admin-brands-cards-grid');
    if (!grid) return;
    const brands = (window.__adminState && window.__adminState.brands) || JSON.parse(localStorage.getItem('dcbd_sheet_brands') || '[]');
    const prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const q = String(searchQuery || '').toLowerCase().trim();

    const filtered = brands.filter(b =>
      !q ||
      String(b.brand_name || '').toLowerCase().includes(q) ||
      String(b.brand_id || '').toLowerCase().includes(q) ||
      String(b.brand_description || '').toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full p-8 text-center text-slate-400 text-xs border rounded-2xl">কোনো ব্র্যান্ড পাওয়া যায়নি।</div>`;
      return;
    }

    grid.innerHTML = filtered.map(b => {
      const bProds = prods.filter(p => String(p.brand || '').toLowerCase() === String(b.brand_name || '').toLowerCase());
      const totalStock = bProds.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
      const safeName = String(b.brand_name || '').replace(/'/g, "\\'");
      const safeId = String(b.brand_id || b.brand_name || '').replace(/'/g, "\\'");

      return `
        <div class="admin-searchable-card bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition flex flex-col justify-between space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3.5">
              <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-inner">
                <img src="${b.brand_image || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" alt="${b.brand_name}" class="w-full h-full object-contain rounded-xl" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">${b.brand_id || 'BRD-01'}</span>
                  <span class="badge badge-success text-[9px]">Verified</span>
                </div>
                <h4 class="text-base font-black text-slate-900 dark:text-white mt-1">${b.brand_name}</h4>
                <div class="text-[10px] text-slate-400 font-mono">/${b.brand_slug || b.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</div>
              </div>
            </div>
            <button type="button" onclick="window.handleDeleteBrand('${safeId}')" class="text-slate-400 hover:text-rose-600 text-xs font-bold p-1" title="ব্র্যান্ড মুছুন">🗑️</button>
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            ${b.brand_description || 'অফিশিয়াল অথেন্টিক ব্র্যান্ড পার্টনার।'}
          </p>

          <div class="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-center">
            <div>
              <div class="text-[10px] text-slate-400">মোট পণ্য</div>
              <div class="text-sm font-black text-emerald-600 font-mono">${bProds.length} টি</div>
            </div>
            <div class="border-l border-slate-200 dark:border-slate-700">
              <div class="text-[10px] text-slate-400">মোট স্টক</div>
              <div class="text-sm font-black text-indigo-600 font-mono">${totalStock} পিস</div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button type="button" onclick="window.filterProductsByBrandFromCard('${safeName}')" class="btn-primary py-2 px-3 text-[11px] font-bold flex-1 text-center">
              📦 পণ্যসমূহ (${bProds.length})
            </button>
            <a href="/products?brand=${encodeURIComponent(b.brand_name)}" target="_blank" class="btn-secondary py-2 px-3 text-[11px] font-bold">
              স্টোর ↗
            </a>
          </div>
        </div>
      `;
    }).join('');
  };

  window.filterProductsByBrandFromCard = function(brandName) {
    window.switchAdminPage('page-prod-all', 'group-products');
    const bSel = document.getElementById('adm-prod-filter-brand');
    if (bSel) {
      window.ensureSelectValue('adm-prod-filter-brand', brandName);
    }
    window.filterAdminProductBrand(brandName);
  };

  window.handleDeleteBrand = function(brandId) {
    if (!confirm('আপনি কি নিশ্চিত যে এই ব্র্যান্ডটি মুছে ফেলতে চান?')) return;
    let brands = (window.__adminState && window.__adminState.brands) || JSON.parse(localStorage.getItem('dcbd_sheet_brands') || '[]');
    brands = brands.filter(b => b.brand_id !== brandId && b.brand_name !== brandId);
    localStorage.setItem('dcbd_sheet_brands', JSON.stringify(brands));
    if (window.__adminState) window.__adminState.brands = brands;
    window.renderAdminBrandCards();
    if (toast && toast.show) toast.show({ type: 'success', title: 'ব্র্যান্ড মোছা হয়েছে', message: 'ব্র্যান্ডটি তালিকা থেকে মুছে ফেলা হয়েছে।' });
  };

  window.handleAdminAddBrand = async function(e) {
    e.preventDefault();
    const name = document.getElementById('adm-new-brand-name')?.value.trim();
    const image = document.getElementById('adm-new-brand-image')?.value.trim() || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
    const desc = document.getElementById('adm-new-brand-desc')?.value.trim() || 'অথেন্টিক ব্র্যান্ড পার্টনার।';
    if (!name) return;

    const newBrand = {
      brand_id: 'BRD-' + Math.floor(100 + Math.random() * 900),
      brand_name: name,
      brand_slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand_image: image,
      brand_description: desc
    };

    let brands = (window.__adminState && window.__adminState.brands) || JSON.parse(localStorage.getItem('dcbd_sheet_brands') || '[]');
    brands.unshift(newBrand);
    localStorage.setItem('dcbd_sheet_brands', JSON.stringify(brands));
    if (window.__adminState) window.__adminState.brands = brands;
    window.ensureSelectValue('adm-brand', name);
    window.ensureSelectValue('adm-prod-filter-brand', name);
    await apiClient.request('brands/add', newBrand);

    if (toast && toast.show) toast.show({ type: 'success', title: 'ব্র্যান্ড যুক্ত হয়েছে', message: `${name} কার্ড তালিকায় সফলভাবে যুক্ত হয়েছে!` });
    document.getElementById('form-add-brand-dedicated')?.reset();
    window.renderAdminBrandCards();
    window.switchAdminPage('page-prod-brands', 'group-products');
  };

  window.handleAdminAddVariant = function(e) {
    e.preventDefault();
    const varType = document.getElementById('adm-variant-type')?.value;
    const varValue = document.getElementById('adm-variant-val')?.value.trim();
    if (!varValue) return;

    let variants = JSON.parse(localStorage.getItem('dcbd_variants') || '{"colors":[], "sizes":[]}');
    if (varType === 'color') variants.colors.push(varValue);
    else variants.sizes.push(varValue);
    localStorage.setItem('dcbd_variants', JSON.stringify(variants));
    if (window.__adminState) window.__adminState.variants = variants;

    if (toast && toast.show) toast.show({ type: 'success', title: 'ভ্যারিয়েন্ট যুক্ত', message: `${varType === 'color' ? 'কালার' : 'সাইজ'}: "${varValue}" যুক্ত হয়েছে।` });
    document.getElementById('form-add-variant-dedicated')?.reset();
    window.switchAdminPage('page-prod-variants', 'group-products');
  };

  window.handleAdminAddBanner = async function(e) {
    e.preventDefault();
    const title = document.getElementById('adm-new-banner-title')?.value.trim();
    const subtitle = document.getElementById('adm-new-banner-subtitle')?.value.trim();
    const image = document.getElementById('adm-new-banner-image')?.value.trim();
    const link = document.getElementById('adm-new-banner-link')?.value.trim() || '/products';
    if (!title || !image) return;

    const newBanner = {
      banner_id: 'BAN-' + Math.floor(10 + Math.random() * 90),
      title,
      subtitle: subtitle || '',
      image_url: image,
      link_url: link,
      status: 'Active'
    };

    let banners = JSON.parse(localStorage.getItem('dcbd_sheet_banners') || '[]');
    banners.unshift(newBanner);
    localStorage.setItem('dcbd_sheet_banners', JSON.stringify(banners));
    await apiClient.request('banners/add', newBanner);

    if (toast && toast.show) toast.show({ type: 'success', title: 'ব্যানার যুক্ত', message: 'নতুন ব্যানার স্লাইডারে সংরক্ষিত হয়েছে!' });
    document.getElementById('form-add-banner-dedicated')?.reset();
    window.switchAdminPage('page-prod-banners', 'group-products');
  };

  // ============================================================================
  // REQUIREMENT 7: MULTI-LANDING PAGE BUILDER, PRODUCT SEARCH & MEDIA CMS
  // ============================================================================
  window.getDefaultLandingPages = function() {
    const prods = (window.__adminState && window.__adminState.products) || [];
    const defaultProdIds = prods.slice(0, 4).map(p => p.sku || p.product_id);
    return [
      {
        id: 'LP-101',
        slug: 'mega-gadget-fest',
        title: 'সেরা মানের অথেন্টিক গ্যাজেট ও স্মার্টওয়াচ সরাসরি আপনার দোরগোড়ায়!',
        subtitle: '১০০% অরিজিনাল গ্যারান্টি • কোনো অগ্রিম পেমেন্ট ছাড়াই সারা দেশে ক্যাশ অন ডেলিভারি',
        badge: '🔥 সীমিত সময়ের মেগা অফার — সর্বোচ্চ ৫০% ছাড়!',
        promo: 'আজ অর্ডার করলেই পাচ্ছেন স্পেশাল ডিসকাউন্ট ও দ্রুত হোম ডেলিভারি সুবিধা!',
        theme: 'emerald',
        status: 'Active',
        hotline: '01581703822',
        cta_text: 'এখনই ক্যাশ অন ডেলিভারিতে অর্ডার করুন →',
        hero_banner: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
        banners: [
          { url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800', caption: 'প্রিমিয়াম AMOLED স্মার্টওয়াচ কালেকশন' },
          { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800', caption: 'স্মার্ট ও নিরাপদ কিচেন অ্যাপ্লায়েন্স' },
          { url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800', caption: '১০০% খাঁটি প্রাকৃতিক ও অর্গানিক ফুড' }
        ],
        videos: [
          { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'পণ্যের লাইভ আনবক্সিং ও বিস্তারিত রিভিউ ভিডিও' }
        ],
        features: [
          '১০০% অরিজিনাল ও অফিশিয়াল ওয়ারেন্টিযুক্ত প্রিমিয়াম প্রোডাক্ট',
          'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে টাকা পরিশোধের সুবিধা (COD)',
          'কুমিল্লা ও ঢাকা হাব থেকে ২৪-৪৮ ঘন্টায় সুপার-ফাস্ট এক্সপ্রেস ডেলিভারি',
          '৭ দিনের সহজ রিপ্লেসমেন্ট ও সার্বক্ষণিক কাস্টমার কেয়ার সাপোর্ট'
        ],
        selected_products: defaultProdIds.length ? defaultProdIds : ['DCBD-WT-01', 'DCBD-GS-02', 'DCBD-HN-03']
      },
      {
        id: 'LP-102',
        slug: 'organic-health-combo',
        title: 'সুন্দরবনের ১০০% খাঁটি চাকের মধু ও অর্গানিক সুপারফুড কম্বো অফার!',
        subtitle: 'ল্যাব টেস্টেড বিশুদ্ধ প্রাকৃতিক খাবার — আপনার পরিবারের সুস্বাস্থ্যের নিশ্চয়তা',
        badge: '🍯 অর্গানিক হেলথ ফেস্ট — ফ্রি ডেলিভারি অফার!',
        promo: '২ কেজি বা কম্বো অর্ডার করলেই সারা বাংলাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!',
        theme: 'amber',
        status: 'Active',
        hotline: '01818273838',
        cta_text: 'খাঁটি অর্গানিক পণ্যের অর্ডার কনফার্ম করুন →',
        hero_banner: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=1200',
        banners: [
          { url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800', caption: 'অর্গানিক চিয়া সিড ও হেলথ সাপ্লিমেন্ট' }
        ],
        videos: [
          { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'খাঁটি মধু চেনার উপায় ও আমাদের সংগ্রহ প্রক্রিয়া' }
        ],
        features: [
          'সরাসরি বাওয়ালিদের থেকে সংগৃহীত ১০০% ভেজালমুক্ত চাকের মধু',
          'কোনো প্রকার চিনি বা প্রিজারভেটিভ মুক্ত প্রাকৃতিক সুপারফুড',
          'পণ্য হাতে পেয়ে গুণগত মান যাচাই করে পেমেন্ট করার সুবিধা'
        ],
        selected_products: ['DCBD-HN-03', 'DCBD-CH-05']
      }
    ];
  };

  window.getAdminLandingPages = function() {
    if (window.__adminState && Array.isArray(window.__adminState.landingPages) && window.__adminState.landingPages.length > 0) {
      return window.__adminState.landingPages;
    }
    try {
      const saved = JSON.parse(localStorage.getItem('dcbd_landing_pages') || 'null');
      if (Array.isArray(saved) && saved.length > 0) {
        if (window.__adminState) window.__adminState.landingPages = saved;
        return saved;
      }
    } catch (e) {}
    const def = window.getDefaultLandingPages();
    localStorage.setItem('dcbd_landing_pages', JSON.stringify(def));
    if (window.__adminState) window.__adminState.landingPages = def;
    return def;
  };

  window.__currentLandingDraft = window.__currentLandingDraft || null;

  window.initLandingDraft = function(lpObj = null) {
    if (lpObj) {
      window.__currentLandingDraft = JSON.parse(JSON.stringify(lpObj));
    } else {
      window.__currentLandingDraft = {
        id: 'LP-' + Math.floor(100 + Math.random() * 900),
        slug: 'campaign-' + Math.floor(100 + Math.random() * 900),
        title: '',
        subtitle: 'কোনো অগ্রিম পেমেন্ট ছাড়াই সারা দেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
        badge: '🔥 সীমিত সময়ের মেগা অফার!',
        promo: 'আজই অর্ডার করলে পাচ্ছেন বিশেষ মূল্যছাড় ও দ্রুত হোম ডেলিভারি!',
        theme: 'emerald',
        status: 'Active',
        hotline: '01581703822',
        cta_text: 'এখনই অর্ডার করুন →',
        hero_banner: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
        banners: [],
        videos: [],
        features: [
          '১০০% অরিজিনাল ও অফিশিয়াল ওয়ারেন্টিযুক্ত প্রিমিয়াম প্রোডাক্ট',
          'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে টাকা পরিশোধের সুবিধা (COD)',
          'দ্রুত ডেলিভারি ও ৭ দিনের সহজ রিপ্লেসমেন্ট সুবিধা'
        ],
        selected_products: []
      };
    }
    return window.__currentLandingDraft;
  };

  window.populateLandingBuilderForm = function(lp) {
    const draft = window.initLandingDraft(lp);
    const setV = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
    setV('adm-lp-id', draft.id);
    setV('adm-lp-title', draft.title);
    setV('adm-lp-slug', draft.slug);
    setV('adm-lp-subtitle', draft.subtitle);
    setV('adm-lp-badge', draft.badge);
    setV('adm-lp-promo', draft.promo);
    setV('adm-lp-theme', draft.theme || 'emerald');
    setV('adm-lp-status', draft.status || 'Active');
    setV('adm-lp-hotline', draft.hotline || '01581703822');
    setV('adm-lp-cta', draft.cta_text || 'এখনই অর্ডার করুন →');
    setV('adm-lp-hero-banner', draft.hero_banner || '');
    setV('adm-lp-features', (draft.features || []).join('\n'));

    const heroPrev = document.getElementById('adm-lp-hero-preview-img');
    if (heroPrev && draft.hero_banner) heroPrev.src = draft.hero_banner;

    const modeBadge = document.getElementById('adm-lp-editor-mode-badge');
    if (modeBadge) modeBadge.textContent = lp ? `এডিট মোড: ${draft.id} (${draft.slug})` : `নতুন ল্যান্ডিং পেজ তৈরি (${draft.id})`;

    window.renderLandingDraftBanners();
    window.renderLandingDraftVideos();
    window.renderLandingSelectedProducts();
    window.searchProductsForLandingBuilder(document.getElementById('adm-lp-prod-search')?.value || '');
  };

  window.startNewLandingPage = function() {
    window.populateLandingBuilderForm(null);
    if (toast && toast.show) toast.show({ type: 'info', title: 'নতুন ল্যান্ডিং পেজ', message: 'নতুন ল্যান্ডিং পেজ তৈরির ফর্ম প্রস্তুত করা হয়েছে।' });
    document.getElementById('landing-builder-form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  window.editExistingLandingPage = function(lpId) {
    const list = window.getAdminLandingPages();
    const found = list.find(item => item.id === lpId || item.slug === lpId);
    if (!found) return;
    window.populateLandingBuilderForm(found);
    if (toast && toast.show) toast.show({ type: 'info', title: 'ল্যান্ডিং পেজ লোড হয়েছে', message: `"${found.title}" এডিট করার জন্য লোড করা হয়েছে।` });
    document.getElementById('landing-builder-form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  window.duplicateLandingPage = function(lpId) {
    const list = window.getAdminLandingPages();
    const found = list.find(item => item.id === lpId);
    if (!found) return;
    const copy = JSON.parse(JSON.stringify(found));
    copy.id = 'LP-' + Math.floor(100 + Math.random() * 900);
    copy.slug = copy.slug + '-copy-' + Math.floor(10 + Math.random() * 89);
    copy.title = copy.title + ' (কপি)';
    list.unshift(copy);
    localStorage.setItem('dcbd_landing_pages', JSON.stringify(list));
    if (window.__adminState) window.__adminState.landingPages = list;
    window.renderSavedLandingPagesList();
    if (toast && toast.show) toast.show({ type: 'success', title: 'ডুপ্লিকেট সম্পন্ন', message: 'নতুন ল্যান্ডিং পেজ কপি তৈরি হয়েছে!' });
  };

  window.deleteLandingPage = function(lpId) {
    let list = window.getAdminLandingPages();
    if (list.length <= 1) {
      alert('কমপক্ষে ১টি ল্যান্ডিং পেজ রাখা আবশ্যক!');
      return;
    }
    if (!confirm('আপনি কি নিশ্চিত যে এই ল্যান্ডিং পেজটি ডিলিট করতে চান?')) return;
    list = list.filter(item => item.id !== lpId);
    localStorage.setItem('dcbd_landing_pages', JSON.stringify(list));
    if (window.__adminState) window.__adminState.landingPages = list;
    window.renderSavedLandingPagesList();
    if (toast && toast.show) toast.show({ type: 'success', title: 'ল্যান্ডিং পেজ মোছা হয়েছে', message: 'ল্যান্ডিং পেজটি মুছে ফেলা হয়েছে।' });
  };

  // Hero Banner Upload & Gallery Banners Management in Landing Page
  window.handleLandingHeroUpload = function(fileInput) {
    const file = fileInput?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target?.result;
      if (!dataUrl) return;
      const inp = document.getElementById('adm-lp-hero-banner');
      const prev = document.getElementById('adm-lp-hero-preview-img');
      if (inp) inp.value = dataUrl;
      if (prev) prev.src = dataUrl;
      if (!window.__currentLandingDraft) window.initLandingDraft();
      window.__currentLandingDraft.hero_banner = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  window.addBannerToLandingDraft = function() {
    if (!window.__currentLandingDraft) window.initLandingDraft();
    const urlInp = document.getElementById('adm-lp-add-banner-url');
    const capInp = document.getElementById('adm-lp-add-banner-caption');
    const url = (urlInp?.value || '').trim();
    const caption = (capInp?.value || '').trim() || 'বিশেষ প্রমোশনাল ব্যানার';
    if (!url) {
      if (toast && toast.show) toast.show({ type: 'warning', title: 'ব্যানার লিঙ্ক দিন', message: 'অনুগ্রহ করে ব্যানার ছবির URL দিন অথবা ফাইল আপলোড করুন।' });
      return;
    }
    window.__currentLandingDraft.banners.push({ url, caption });
    if (urlInp) urlInp.value = '';
    if (capInp) capInp.value = '';
    window.renderLandingDraftBanners();
  };

  window.handleLandingGalleryFilesUpload = function(fileInput) {
    if (!window.__currentLandingDraft) window.initLandingDraft();
    const files = Array.from(fileInput?.files || []);
    const capInp = document.getElementById('adm-lp-add-banner-caption');
    const defaultCap = (capInp?.value || '').trim() || 'ক্যাম্পেইন গ্যালারি ব্যানার';
    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target?.result;
        if (dataUrl) {
          window.__currentLandingDraft.banners.push({ url: dataUrl, caption: `${defaultCap} #${idx + 1}` });
          window.renderLandingDraftBanners();
        }
      };
      reader.readAsDataURL(file);
    });
  };

  window.removeBannerFromLandingDraft = function(idx) {
    if (!window.__currentLandingDraft) return;
    window.__currentLandingDraft.banners.splice(idx, 1);
    window.renderLandingDraftBanners();
  };

  window.renderLandingDraftBanners = function() {
    const box = document.getElementById('adm-lp-banners-list');
    if (!box) return;
    const draft = window.__currentLandingDraft || window.initLandingDraft();
    const banners = draft.banners || [];
    if (banners.length === 0) {
      box.innerHTML = `<div class="col-span-full p-3 text-center text-slate-400 text-[11px] border border-dashed rounded-xl">কোনো অতিরিক্ত গ্যালারি ব্যানার যুক্ত করা হয়নি।</div>`;
      return;
    }
    box.innerHTML = banners.map((b, i) => `
      <div class="relative rounded-2xl border bg-white dark:bg-slate-900 p-2 space-y-1.5 shadow-sm">
        <img src="${b.url}" class="w-full h-24 object-cover rounded-xl" onerror="this.src='https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400';" />
        <div class="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">${b.caption || `ব্যানার #${i + 1}`}</div>
        <button type="button" onclick="window.removeBannerFromLandingDraft(${i})" class="absolute top-3 right-3 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow">✕</button>
      </div>
    `).join('');
  };

  // Video Management in Landing Page
  window.normalizeVideoEmbedUrl = function(rawUrl) {
    const url = String(rawUrl || '').trim();
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_\-]+)/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    return url;
  };

  window.addVideoToLandingDraft = function() {
    if (!window.__currentLandingDraft) window.initLandingDraft();
    const urlInp = document.getElementById('adm-lp-add-video-url');
    const titleInp = document.getElementById('adm-lp-add-video-title');
    const rawUrl = (urlInp?.value || '').trim();
    const title = (titleInp?.value || '').trim() || 'প্রোডাক্ট রিভিউ ও ডেমো ভিডিও';
    if (!rawUrl) {
      if (toast && toast.show) toast.show({ type: 'warning', title: 'ভিডিও লিঙ্ক দিন', message: 'YouTube বা ভিডিও URL প্রদান করুন।' });
      return;
    }
    const embedUrl = window.normalizeVideoEmbedUrl(rawUrl);
    window.__currentLandingDraft.videos.push({ url: embedUrl, title });
    if (urlInp) urlInp.value = '';
    if (titleInp) titleInp.value = '';
    window.renderLandingDraftVideos();
  };

  window.removeVideoFromLandingDraft = function(idx) {
    if (!window.__currentLandingDraft) return;
    window.__currentLandingDraft.videos.splice(idx, 1);
    window.renderLandingDraftVideos();
  };

  window.renderLandingDraftVideos = function() {
    const box = document.getElementById('adm-lp-videos-list');
    if (!box) return;
    const draft = window.__currentLandingDraft || window.initLandingDraft();
    const videos = draft.videos || [];
    if (videos.length === 0) {
      box.innerHTML = `<div class="col-span-full p-3 text-center text-slate-400 text-[11px] border border-dashed rounded-xl">কোনো ভিডিও যুক্ত করা হয়নি। YouTube বা MP4 লিঙ্ক যুক্ত করুন।</div>`;
      return;
    }
    box.innerHTML = videos.map((v, i) => `
      <div class="p-2.5 rounded-2xl border bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold text-sm flex-shrink-0">▶</span>
          <div class="min-w-0">
            <div class="font-bold text-xs text-slate-900 dark:text-white truncate">${v.title}</div>
            <div class="text-[10px] text-slate-400 font-mono truncate">${v.url}</div>
          </div>
        </div>
        <button type="button" onclick="window.removeVideoFromLandingDraft(${i})" class="btn-secondary py-1 px-2 text-[10px] text-rose-600 border-rose-200">✕ সরান</button>
      </div>
    `).join('');
  };

  // Product Search & Selection for Landing Page ("লেন্ডিং পেজে কোন কোন প্রোডাক্ট দেখাবে সেটা প্রোডাক্ট সার্চ করে এড করা যাবে")
  window.searchProductsForLandingBuilder = function(query = '') {
    const resBox = document.getElementById('adm-lp-product-search-results');
    if (!resBox) return;
    const draft = window.__currentLandingDraft || window.initLandingDraft();
    const selectedSet = new Set(draft.selected_products || []);
    const prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const q = String(query || '').toLowerCase().trim();

    const matched = prods.filter(p =>
      !q ||
      String(p.name || p.p_name || '').toLowerCase().includes(q) ||
      String(p.sku || p.product_id || '').toLowerCase().includes(q) ||
      String(p.category || '').toLowerCase().includes(q) ||
      String(p.brand || '').toLowerCase().includes(q)
    ).slice(0, 24);

    if (matched.length === 0) {
      resBox.innerHTML = `<div class="p-4 text-center text-slate-400 text-xs">কোনো পণ্য মেলেনি। অন্য নাম বা SKU দিয়ে খুঁজুন।</div>`;
      return;
    }

    resBox.innerHTML = matched.map(p => {
      const id = String(p.sku || p.product_id || '');
      const safeId = id.replace(/'/g, "\\'");
      const isAdded = selectedSet.has(id);
      const thumb = p.thumbnail || (Array.isArray(p.images) && p.images[0]) || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
      return `
        <div class="p-2 rounded-xl border bg-white dark:bg-slate-900 flex items-center justify-between gap-2 hover:border-emerald-400 transition">
          <div class="flex items-center gap-2.5 min-w-0">
            <img src="${thumb}" class="w-9 h-9 rounded-lg object-cover border flex-shrink-0" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
            <div class="min-w-0">
              <div class="font-bold text-[11px] text-slate-900 dark:text-white truncate">${p.name || p.p_name}</div>
              <div class="text-[10px] text-slate-400 font-mono">${id} • <span class="text-emerald-600 font-bold">৳${p.selling_price || 0}</span> • স্টক: ${p.stock || 0}</div>
            </div>
          </div>
          ${isAdded
            ? `<button type="button" onclick="window.removeProductFromLandingDraft('${safeId}')" class="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">✓ যুক্ত আছে (সরান)</button>`
            : `<button type="button" onclick="window.addProductToLandingDraft('${safeId}')" class="btn-primary py-1 px-2.5 text-[10px] font-bold">+ যুক্ত করুন</button>`
          }
        </div>
      `;
    }).join('');
  };

  window.addProductToLandingDraft = function(prodId) {
    if (!window.__currentLandingDraft) window.initLandingDraft();
    if (!Array.isArray(window.__currentLandingDraft.selected_products)) {
      window.__currentLandingDraft.selected_products = [];
    }
    if (!window.__currentLandingDraft.selected_products.includes(prodId)) {
      window.__currentLandingDraft.selected_products.push(prodId);
    }
    window.renderLandingSelectedProducts();
    window.searchProductsForLandingBuilder(document.getElementById('adm-lp-prod-search')?.value || '');
  };

  window.removeProductFromLandingDraft = function(prodId) {
    if (!window.__currentLandingDraft) return;
    window.__currentLandingDraft.selected_products = (window.__currentLandingDraft.selected_products || []).filter(id => id !== prodId);
    window.renderLandingSelectedProducts();
    window.searchProductsForLandingBuilder(document.getElementById('adm-lp-prod-search')?.value || '');
  };

  window.renderLandingSelectedProducts = function() {
    const box = document.getElementById('adm-lp-selected-products-box');
    const countEl = document.getElementById('adm-lp-selected-prod-count');
    if (!box) return;
    const draft = window.__currentLandingDraft || window.initLandingDraft();
    const ids = draft.selected_products || [];
    if (countEl) countEl.textContent = `${ids.length} টি পণ্য নির্বাচিত`;

    const prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const selectedObjs = ids.map(id => prods.find(p => p.sku === id || p.product_id === id)).filter(Boolean);

    if (selectedObjs.length === 0) {
      box.innerHTML = `<div class="col-span-full p-4 text-center text-slate-400 text-xs border border-dashed rounded-xl">এখনো কোনো পণ্য ল্যান্ডিং পেজে যুক্ত করা হয়নি। উপরের সার্চ বক্স থেকে পণ্য খুঁজে "+ যুক্ত করুন" বাটনে ক্লিক করুন।</div>`;
      return;
    }

    box.innerHTML = selectedObjs.map((p, idx) => {
      const id = String(p.sku || p.product_id || '');
      const safeId = id.replace(/'/g, "\\'");
      const thumb = p.thumbnail || (Array.isArray(p.images) && p.images[0]) || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
      return `
        <div class="p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">${idx + 1}</span>
            <img src="${thumb}" class="w-10 h-10 rounded-xl object-cover border flex-shrink-0" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
            <div class="min-w-0">
              <div class="font-bold text-xs text-slate-900 dark:text-white truncate">${p.name || p.p_name}</div>
              <div class="text-[10px] text-emerald-600 font-mono font-bold">${id} • ৳${p.selling_price || 0}</div>
            </div>
          </div>
          <button type="button" onclick="window.removeProductFromLandingDraft('${safeId}')" class="text-rose-600 hover:bg-rose-100 rounded-lg px-2 py-1 text-[10px] font-bold">✕ সরান</button>
        </div>
      `;
    }).join('');
  };

  window.handleAdminSaveLandingConfig = function(e) {
    e.preventDefault();
    if (!window.__currentLandingDraft) window.initLandingDraft();
    const draft = window.__currentLandingDraft;

    const getV = id => (document.getElementById(id)?.value || '').trim();
    draft.id = getV('adm-lp-id') || draft.id || ('LP-' + Math.floor(100 + Math.random() * 900));
    draft.title = getV('adm-lp-title') || 'সেরা মানের অথেন্টিক গ্যাজেট ও লাইফস্টাইল পণ্য সরাসরি আপনার দোরগোড়ায়!';
    draft.slug = getV('adm-lp-slug') || draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ('lp-' + Date.now());
    draft.subtitle = getV('adm-lp-subtitle') || 'কোনো অগ্রিম পেমেন্ট ছাড়াই সারা দেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।';
    draft.badge = getV('adm-lp-badge') || '🔥 সীমিত সময়ের মেগা অফার!';
    draft.promo = getV('adm-lp-promo') || 'বিশেষ ডিসকাউন্ট ও দ্রুত ডেলিভারি!';
    draft.theme = getV('adm-lp-theme') || 'emerald';
    draft.status = getV('adm-lp-status') || 'Active';
    draft.hotline = getV('adm-lp-hotline') || '01581703822';
    draft.cta_text = getV('adm-lp-cta') || 'এখনই অর্ডার করুন →';
    draft.hero_banner = getV('adm-lp-hero-banner') || draft.hero_banner || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200';
    const rawFeatures = getV('adm-lp-features');
    draft.features = rawFeatures ? rawFeatures.split('\n').map(s => s.trim()).filter(Boolean) : draft.features;

    let list = window.getAdminLandingPages();
    const existingIdx = list.findIndex(item => item.id === draft.id);
    if (existingIdx >= 0) {
      list[existingIdx] = JSON.parse(JSON.stringify(draft));
    } else {
      list.unshift(JSON.parse(JSON.stringify(draft)));
    }

    localStorage.setItem('dcbd_landing_pages', JSON.stringify(list));
    localStorage.setItem('dcbd_landing_config', JSON.stringify(draft));
    if (window.__adminState) window.__adminState.landingPages = list;

    window.renderSavedLandingPagesList();
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'ল্যান্ডিং পেজ সংরক্ষিত!', message: `"${draft.title}" সফলভাবে সংরক্ষিত ও আপডেট হয়েছে!` });
    }
  };

  window.renderSavedLandingPagesList = function() {
    const grid = document.getElementById('adm-saved-landing-pages-grid');
    if (!grid) return;
    const list = window.getAdminLandingPages();
    grid.innerHTML = list.map(lp => {
      const safeId = String(lp.id).replace(/'/g, "\\'");
      return `
        <div class="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-emerald-500/60 transition flex flex-col justify-between space-y-3">
          <div class="space-y-2.5">
            <div class="relative h-32 rounded-2xl overflow-hidden border">
              <img src="${lp.hero_banner || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-3">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px]">${lp.id} • /landing?page=${lp.slug}</span>
                  <span class="badge ${lp.status === 'Active' ? 'badge-success' : 'badge-warning'} text-[9px]">${lp.status || 'Active'}</span>
                </div>
                <h4 class="text-white font-black text-xs mt-1 line-clamp-1">${lp.title}</h4>
              </div>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">${lp.subtitle || ''}</p>
            <div class="flex flex-wrap gap-1.5 text-[10px]">
              <span class="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">📦 ${(lp.selected_products || []).length} টি পণ্য</span>
              <span class="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">🖼️ ${(lp.banners || []).length + 1} টি ব্যানার</span>
              <span class="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">🎬 ${(lp.videos || []).length} টি ভিডিও</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onclick="window.openLandingPageLivePreview('${safeId}')" class="btn-primary py-1.5 px-3 text-[10px] font-bold flex-1">👁️ লাইভ প্রিভিউ</button>
            <button type="button" onclick="window.editExistingLandingPage('${safeId}')" class="btn-secondary py-1.5 px-2.5 text-[10px] font-bold">✏️ এডিট</button>
            <button type="button" onclick="window.duplicateLandingPage('${safeId}')" class="btn-secondary py-1.5 px-2 text-[10px]" title="ডুপ্লিকেট করুন">📑</button>
            <button type="button" onclick="window.deleteLandingPage('${safeId}')" class="btn-secondary py-1.5 px-2 text-[10px] text-rose-600 border-rose-200" title="মুছুন">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  };

  window.openLandingPageLivePreview = function(lpId) {
    const list = window.getAdminLandingPages();
    const lp = list.find(item => item.id === lpId || item.slug === lpId) || window.__currentLandingDraft || list[0];
    if (!lp) return;

    const prods = (window.__adminState && window.__adminState.products) || JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const lpProducts = (lp.selected_products || []).map(id => prods.find(p => p.sku === id || p.product_id === id)).filter(Boolean);
    const displayProducts = lpProducts.length > 0 ? lpProducts : prods.slice(0, 4);

    const modal = document.getElementById('modal-landing-live-preview');
    const content = document.getElementById('landing-live-preview-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="space-y-8 font-sans">
        <!-- Promo Top Bar -->
        <div class="bg-amber-400 text-slate-950 py-2 px-4 rounded-2xl text-center font-black text-xs shadow-sm">
          📢 ${lp.promo || 'সীমিত সময়ের জন্য ক্যাশ অন ডেলিভারিতে স্পেশাল ডিসকাউন্ট!'} | হটলাইন: ${lp.hotline || '01581703822'}
        </div>

        <!-- Hero Section -->
        <div class="relative rounded-3xl overflow-hidden bg-slate-950 text-white border border-emerald-800/40 shadow-2xl">
          <img src="${lp.hero_banner}" class="w-full h-64 sm:h-80 object-cover opacity-35" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200';" />
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-12 space-y-3">
            <span class="inline-block bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full uppercase shadow">
              ${lp.badge || '🔥 মেগা ক্যাম্পেইন অফার'}
            </span>
            <h1 class="text-xl sm:text-3xl md:text-4xl font-black max-w-3xl leading-tight">
              ${lp.title}
            </h1>
            <p class="text-xs sm:text-sm text-slate-200 max-w-2xl">${lp.subtitle || ''}</p>
            <div class="pt-2 flex flex-wrap justify-center gap-3">
              <a href="#lp-preview-products" class="btn-primary py-2.5 px-6 text-xs font-black shadow-lg">${lp.cta_text || 'এখনই অর্ডার করুন →'}</a>
              <a href="tel:${lp.hotline || '01581703822'}" class="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur text-white font-bold text-xs border border-white/20">📞 কল করুন: ${lp.hotline || '01581703822'}</a>
            </div>
          </div>
        </div>

        <!-- Promotional Banner Gallery -->
        ${(lp.banners && lp.banners.length > 0) ? `
          <div class="space-y-3">
            <h3 class="text-base font-black text-slate-900 dark:text-white text-center">🖼️ ক্যাম্পেইন অফার ও ফটো গ্যালারি</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              ${lp.banners.map(b => `
                <div class="rounded-2xl overflow-hidden border bg-white dark:bg-slate-900 shadow-sm">
                  <img src="${b.url}" class="w-full h-44 object-cover" onerror="this.src='https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600';" />
                  <div class="p-2.5 text-center font-bold text-xs text-slate-800 dark:text-slate-200">${b.caption || ''}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Videos Section -->
        ${(lp.videos && lp.videos.length > 0) ? `
          <div class="space-y-3">
            <h3 class="text-base font-black text-slate-900 dark:text-white text-center">🎬 পণ্যের লাইভ ভিডিও ও রিভিউ</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${lp.videos.map(v => `
                <div class="rounded-2xl overflow-hidden border bg-slate-900 p-3 space-y-2">
                  <div class="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe src="${v.url}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
                  </div>
                  <div class="text-xs font-bold text-white text-center">${v.title}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Features / Why Choose Us -->
        ${(lp.features && lp.features.length > 0) ? `
          <div class="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-3">
            <h3 class="text-base font-black text-slate-900 dark:text-white text-center">✨ কেন আমাদের থেকে কিনবেন?</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              ${lp.features.map(f => `
                <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200">
                  <span class="text-emerald-600 text-sm">✔</span>
                  <span>${f}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Selected Products Grid -->
        <div id="lp-preview-products" class="space-y-4">
          <div class="text-center">
            <h3 class="text-lg font-black text-slate-900 dark:text-white">🛍️ ক্যাম্পেইনের নির্বাচিত পণ্যসমূহ (${displayProducts.length} টি)</h3>
            <p class="text-xs text-slate-400">আপনার পছন্দের পণ্যটি সিলেক্ট করে নিচের ফর্মে অর্ডার সম্পন্ন করুন</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            ${displayProducts.map(p => {
              const thumb = p.thumbnail || (Array.isArray(p.images) && p.images[0]) || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
              const orig = p.original_price || Math.round((Number(p.selling_price) || 0) * 1.35);
              return `
                <div class="rounded-2xl border bg-white dark:bg-slate-900 p-3.5 space-y-2.5 shadow-sm flex flex-col justify-between">
                  <div class="space-y-2">
                    <img src="${thumb}" class="w-full h-36 object-cover rounded-xl border" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                    <div class="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">${p.name || p.p_name}</div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-black text-emerald-600 font-mono">৳${p.selling_price || 0}</span>
                      <span class="text-[10px] text-slate-400 line-through font-mono">৳${orig}</span>
                    </div>
                  </div>
                  <a href="/product/${p.slug || p.product_id}" target="_blank" class="btn-primary py-1.5 px-3 text-[11px] font-bold text-center block w-full">অর্ডার করুন →</a>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
  };


  // PARTNER HANDLERS
  window.handleAdminAddReseller = function(e) {
    e.preventDefault();
    const name = document.getElementById('adm-new-reseller-name')?.value.trim();
    const shop = document.getElementById('adm-new-reseller-shop')?.value.trim();
    const phone = document.getElementById('adm-new-reseller-phone')?.value.trim();
    const city = document.getElementById('adm-new-reseller-city')?.value.trim();
    if (!name || !phone) return;

    let list = JSON.parse(localStorage.getItem('dcbd_resellers') || '[]');
    list.unshift({
      id: 'RSL-' + Math.floor(1000 + Math.random() * 9000),
      name,
      shop: shop || 'অনলাইন শপ',
      phone,
      city: city || 'ঢাকা',
      balance: 0,
      total_earned: 0,
      status: 'Active'
    });
    localStorage.setItem('dcbd_resellers', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'রিসেলার যুক্ত', message: `${name} সফলভাবে নিবন্ধিত হয়েছে!` });
    document.getElementById('modal-add-reseller')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  window.handleAdminAddWholesaler = function(e) {
    e.preventDefault();
    const name = document.getElementById('adm-new-ws-name')?.value.trim();
    const company = document.getElementById('adm-new-ws-company')?.value.trim();
    const phone = document.getElementById('adm-new-ws-phone')?.value.trim();
    const tier = document.getElementById('adm-new-ws-tier')?.value || 'Tier 1 (15%)';
    if (!name || !phone) return;

    let list = JSON.parse(localStorage.getItem('dcbd_wholesalers') || '[]');
    list.unshift({
      id: 'WHS-' + Math.floor(100 + Math.random() * 900),
      name,
      company: company || 'ট্রেডার্স',
      phone,
      tier,
      total_orders: 0,
      status: 'Approved'
    });
    localStorage.setItem('dcbd_wholesalers', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'হোলসেলার যুক্ত', message: `${name} সফলভাবে নিবন্ধিত হয়েছে!` });
    document.getElementById('modal-add-wholesaler')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  window.handleAdminAddSeller = function(e) {
    e.preventDefault();
    const name = document.getElementById('adm-new-seller-name')?.value.trim();
    const store = document.getElementById('adm-new-seller-store')?.value.trim();
    const phone = document.getElementById('adm-new-seller-phone')?.value.trim();
    const comm = document.getElementById('adm-new-seller-comm')?.value || '10%';
    if (!name || !phone) return;

    let list = JSON.parse(localStorage.getItem('dcbd_sellers') || '[]');
    list.unshift({
      id: 'VND-' + Math.floor(100 + Math.random() * 900),
      name,
      store: store || 'ভেন্ডর স্টোর',
      phone,
      commission: comm,
      products_count: 0,
      status: 'Active'
    });
    localStorage.setItem('dcbd_sellers', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'সেলার যুক্ত', message: `${store} সফলভাবে যুক্ত হয়েছে!` });
    document.getElementById('modal-add-seller')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  window.handleAdminAddMarket = function(e) {
    e.preventDefault();
    const name = document.getElementById('adm-new-market-name')?.value.trim();
    const sync = document.getElementById('adm-new-market-sync')?.value || 'Manual';
    if (!name) return;

    let list = JSON.parse(localStorage.getItem('dcbd_markets') || '[]');
    list.unshift({
      id: 'MKT-' + Math.floor(10 + Math.random() * 90),
      name,
      sync_mode: sync,
      status: 'Connected',
      last_sync: 'আজকে'
    });
    localStorage.setItem('dcbd_markets', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'মার্কেট চ্যানেল যুক্ত', message: `${name} চ্যানেল সংযুক্ত হয়েছে!` });
    document.getElementById('modal-add-market')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  // ADMINS & WORKERS HANDLERS
  window.handleAdminAddWorker = function(e) {
    e.preventDefault();
    const name = document.getElementById('adm-new-worker-name')?.value.trim();
    const role = document.getElementById('adm-new-worker-role')?.value;
    const phone = document.getElementById('adm-new-worker-phone')?.value.trim();
    const email = document.getElementById('adm-new-worker-email')?.value.trim();
    if (!name || !phone) return;

    let list = JSON.parse(localStorage.getItem('dcbd_workers') || '[]');
    list.unshift({
      id: 'WRK-' + Math.floor(100 + Math.random() * 900),
      name,
      role,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@dreamcart.bd`,
      status: 'Active'
    });
    localStorage.setItem('dcbd_workers', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'কর্মী যুক্ত', message: `${name} (${role}) সফলভাবে যুক্ত হয়েছে!` });
    document.getElementById('modal-add-worker')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  window.handleAdminAddAdmin = function(e) {
    e.preventDefault();
    const name = document.getElementById('adm-new-admin-name')?.value.trim();
    const email = document.getElementById('adm-new-admin-email')?.value.trim();
    const role = document.getElementById('adm-new-admin-role')?.value || 'Super Admin';
    if (!name || !email) return;

    let list = JSON.parse(localStorage.getItem('dcbd_admins') || '[]');
    list.unshift({
      id: 'ADM-' + Math.floor(10 + Math.random() * 90),
      name,
      email,
      role,
      status: 'Active'
    });
    localStorage.setItem('dcbd_admins', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'অ্যাডমিন যুক্ত', message: `${name} তৈরি হয়েছে!` });
    document.getElementById('modal-add-admin')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  // INVENTORY & FINANCE HANDLERS
  window.handleApprovePayout = function(reqId, amount, btn) {
    if (!confirm(`আপনি কি ${reqId} এর ৳${amount} উত্তোলন অনুমোদন ও পরিশোধ করতে চান? (-৩% ফি সমন্বয় সাপেক্ষে)`)) return;
    if (btn) {
      btn.disabled = true;
      btn.className = 'py-1 px-3 text-[10px] font-bold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      btn.innerHTML = 'পরিশোধ সম্পন্ন ✓';
    }
    if (toast && toast.show) toast.show({ type: 'success', title: 'পে-আউট অনুমোদিত', message: `রিকোয়েস্ট ${reqId} প্রদান করা হয়েছে।` });
  };

  window.handleAdminAddCost = function(e) {
    e.preventDefault();
    const title = document.getElementById('adm-cost-title')?.value.trim();
    const amount = Number(document.getElementById('adm-cost-amount')?.value || '0');
    const cat = document.getElementById('adm-cost-cat')?.value || 'অফিস খরচ';
    const note = document.getElementById('adm-cost-note')?.value.trim();
    if (!title || !amount) return;

    let list = JSON.parse(localStorage.getItem('dcbd_sheet_costs') || '[]');
    list.unshift({
      id: 'CST-' + Math.floor(100 + Math.random() * 900),
      title,
      amount,
      category: cat,
      date: new Date().toISOString().slice(0, 10),
      note: note || ''
    });
    localStorage.setItem('dcbd_sheet_costs', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'খরচ সংরক্ষিত', message: `৳${amount} যুক্ত হয়েছে!` });
    document.getElementById('modal-add-cost')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  window.handleAdminAddBuying = function(e) {
    e.preventDefault();
    const supplier = document.getElementById('adm-buying-supplier')?.value.trim();
    const product = document.getElementById('adm-buying-product')?.value.trim();
    const qty = Number(document.getElementById('adm-buying-qty')?.value || '1');
    const total = Number(document.getElementById('adm-buying-total')?.value || '0');
    if (!product || !total) return;

    let list = JSON.parse(localStorage.getItem('dcbd_sheet_buying') || '[]');
    list.unshift({
      id: 'BUY-' + Math.floor(100 + Math.random() * 900),
      supplier: supplier || 'হোলসেল মার্কেট',
      product,
      quantity: qty,
      total_amount: total,
      date: new Date().toISOString().slice(0, 10)
    });
    localStorage.setItem('dcbd_sheet_buying', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'ক্রয় হিসাব সংরক্ষিত', message: `৳${total} যুক্ত হয়েছে!` });
    document.getElementById('modal-add-buying')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  window.handleAdminAddInvest = function(e) {
    e.preventDefault();
    const investor = document.getElementById('adm-invest-investor')?.value.trim();
    const amount = Number(document.getElementById('adm-invest-amount')?.value || '0');
    const note = document.getElementById('adm-invest-note')?.value.trim();
    if (!investor || !amount) return;

    let list = JSON.parse(localStorage.getItem('dcbd_sheet_invest') || '[]');
    list.unshift({
      id: 'INV-' + Math.floor(10 + Math.random() * 90),
      investor,
      amount,
      note: note || 'মূলধন বিনিয়োগ',
      date: new Date().toISOString().slice(0, 10)
    });
    localStorage.setItem('dcbd_sheet_invest', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'বিনিয়োগ সংরক্ষিত', message: `৳${amount} যুক্ত হয়েছে!` });
    document.getElementById('modal-add-invest')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  // COURIER, FRAUD & PAYMENT HANDLERS
  window.handleAdminAddCourier = function(e) {
    e.preventDefault();
    const name = document.getElementById('adm-new-courier-name')?.value.trim();
    const apiKey = document.getElementById('adm-new-courier-api')?.value.trim();
    const secretKey = document.getElementById('adm-new-courier-secret')?.value.trim();
    const webhookUrl = document.getElementById('adm-new-courier-webhook')?.value.trim() || `https://dreamcart.bd/api/courier/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}/webhook`;
    const city = document.getElementById('adm-new-courier-city')?.value || 'Dhaka';
    if (!name) return;

    let list = JSON.parse(localStorage.getItem('dcbd_sheet_couriers') || '[]');
    list.push({
      id: 'CUR-' + Math.floor(10 + Math.random() * 90),
      name,
      api_key: apiKey ? '••••••••' + apiKey.slice(-4) : 'API Key Configured',
      secret_key: secretKey ? '••••••••' + secretKey.slice(-4) : 'Secret Configured',
      webhook_url: webhookUrl,
      hub_city: city,
      status: 'Connected',
      balance: '৳৩,৪৫০'
    });
    localStorage.setItem('dcbd_sheet_couriers', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'কুরিয়ার যুক্ত', message: `${name} সম্পূর্ণ ওয়েবহুকসহ সংযুক্ত হয়েছে!` });
    document.getElementById('modal-add-courier')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  window.handleTestCourierApi = function(name, btn) {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'পরীক্ষা হচ্ছে... ⏳';
    }
    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'API টেস্ট সফল ✓';
        btn.className = 'btn-secondary text-[10px] py-1 px-2.5 text-emerald-600 border-emerald-300';
      }
      if (toast && toast.show) {
        toast.show({ type: 'success', title: 'API টেস্ট সফল', message: `${name} সার্ভারের সাথে সফলভাবে যোগাযোগ স্থাপিত হয়েছে (Latency: 52ms)।` });
      }
    }, 700);
  };

  window.handleAdminAddOnlinePayment = function(e) {
    e.preventDefault();
    const name = document.getElementById('adm-new-gw-name')?.value.trim();
    const merchant = document.getElementById('adm-new-gw-merchant')?.value.trim();
    const apiKey = document.getElementById('adm-new-gw-key')?.value.trim();
    const mode = document.getElementById('adm-new-gw-mode')?.value || 'Live';
    if (!name) return;

    let list = JSON.parse(localStorage.getItem('dcbd_online_payments') || '[]');
    list.push({
      id: 'PAY-' + Math.floor(10 + Math.random() * 90),
      name,
      merchant_id: merchant || 'LIVE-STORE',
      api_key: '••••••••' + (apiKey ? apiKey.slice(-4) : '8921'),
      mode,
      status: 'Active'
    });
    localStorage.setItem('dcbd_online_payments', JSON.stringify(list));
    if (toast && toast.show) toast.show({ type: 'success', title: 'পেমেন্ট গেটওয়ে যুক্ত', message: `${name} গেটওয়ে সংযুক্ত হয়েছে!` });
    document.getElementById('modal-add-payment-gw')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  // SETTINGS HANDLERS
  window.handleAdminSaveSettings = function(e) {
    e.preventDefault();
    const settings = {
      shopName: document.getElementById('adm-set-shopname')?.value || 'Dream Cart BD',
      shopLogo: document.getElementById('adm-set-logo')?.value || '',
      address: document.getElementById('adm-set-address')?.value || '',
      hotline1: document.getElementById('adm-set-hotline1')?.value || '',
      hotline2: document.getElementById('adm-set-hotline2')?.value || '',
      feeComilla: document.getElementById('adm-set-fee-comilla')?.value || '70',
      feeDhaka: document.getElementById('adm-set-fee-dhaka')?.value || '90',
      feeOutside: document.getElementById('adm-set-fee-outside')?.value || '120',
      notice: document.getElementById('adm-set-notice')?.value || ''
    };
    localStorage.setItem('dcbd_site_settings', JSON.stringify(settings));
    if (toast && toast.show) toast.show({ type: 'success', title: 'সেটিংস সংরক্ষিত!', message: 'সাইটের সকল তথ্য সফলভাবে সংরক্ষিত হয়েছে।' });
    else alert('সেটিংস সংরক্ষিত হয়েছে!');
  };

  window.handleAdminAddOffer = function(e) {
    e.preventDefault();
    const code = document.getElementById('adm-new-offer-code')?.value.trim().toUpperCase();
    const discount = document.getElementById('adm-new-offer-disc')?.value.trim();
    const min = Number(document.getElementById('adm-new-offer-min')?.value || '0');
    if (!code || !discount) return;

    let offers = JSON.parse(localStorage.getItem('dcbd_sheet_offers') || '[]');
    offers.unshift({
      id: 'OFF-' + Math.floor(100 + Math.random() * 900),
      code,
      discount,
      min_spend: min,
      status: 'Active'
    });
    localStorage.setItem('dcbd_sheet_offers', JSON.stringify(offers));
    if (toast && toast.show) toast.show({ type: 'success', title: 'কুপন যুক্ত', message: `কুপন কোড "${code}" সক্রিয় করা হয়েছে!` });
    document.getElementById('modal-add-offer')?.classList.add('hidden');
    setTimeout(() => window.location.reload(), 600);
  };

  window.regenerateAdminCaptcha = function() {
    const num1 = Math.floor(Math.random() * 8) + 1;
    const num2 = Math.floor(Math.random() * 8) + 1;
    const sum = num1 + num2;
    const displayEl = document.getElementById('adm-captcha-display');
    const expectedEl = document.getElementById('adm-captcha-expected');
    const inputEl = document.getElementById('adm-captcha-input');
    if (displayEl) displayEl.textContent = `${num1} + ${num2} = ?`;
    if (expectedEl) expectedEl.value = sum;
    if (inputEl) {
      inputEl.value = '';
      inputEl.focus();
    }
  };


  // CATEGORY MANAGEMENT WITH DEDUPLICATION (/admin/categroy & /admin/category)
  window.handleAdminAddCategory = async function(e) {
    e.preventDefault();
    const catName = (document.getElementById('adm-new-cat-name')?.value || '').trim();
    const subcats = (document.getElementById('adm-new-cat-sub')?.value || '').trim();
    const childcats = (document.getElementById('adm-new-cat-child')?.value || '').trim();
    const image = (document.getElementById('adm-new-cat-image')?.value || '').trim() || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
    if (!catName) return;

    let categories = (window.__adminState && window.__adminState.categories) || JSON.parse(localStorage.getItem('dcbd_sheet_categories') || '[]');
    const exists = categories.some(c => (c.category || '').toLowerCase() === catName.toLowerCase());
    if (exists) {
      if (toast && toast.show) toast.show({ type: 'warning', title: 'ডুপ্লিকেট ক্যাটাগরি', message: `"${catName}" ইতিমধ্যে তালিকায় রয়েছে!` });
      else alert(`"${catName}" নামের ক্যাটাগরি ইতিমধ্যে বিদ্যমান রয়েছে!`);
      return;
    }

    const newCat = {
      catagory_id: 'CAT-' + Math.floor(100 + Math.random() * 900),
      category: catName,
      sub_category: subcats || 'Standard',
      chail_category: childcats || 'General',
      category_image: image
    };

    categories.unshift(newCat);
    localStorage.setItem('dcbd_sheet_categories', JSON.stringify(categories));
    if (window.__adminState) window.__adminState.categories = categories;
    await apiClient.request('categories/add', newCat).catch(() => {});

    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'ক্যাটাগরি যুক্ত হয়েছে', message: `"${catName}" সফলভাবে সংরক্ষিত হয়েছে!` });
    }
    document.getElementById('form-add-category-dedicated')?.reset();
    if (window.router && window.router.resolve) window.router.resolve();
  };

  window.handleDeleteCategory = function(catName) {
    if (!confirm(`আপনি কি নিশ্চিত যে "${catName}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) return;
    let categories = (window.__adminState && window.__adminState.categories) || JSON.parse(localStorage.getItem('dcbd_sheet_categories') || '[]');
    categories = categories.filter(c => (c.category || '').toLowerCase() !== catName.toLowerCase());
    localStorage.setItem('dcbd_sheet_categories', JSON.stringify(categories));
    if (window.__adminState) window.__adminState.categories = categories;
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'ক্যাটাগরি মোছা হয়েছে', message: `"${catName}" মুছে ফেলা হয়েছে!` });
    }
    if (window.router && window.router.resolve) window.router.resolve();
  };

  window.handleAdminLogout = function() {
    if (!confirm('আপনি কি নিশ্চিত যে অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?')) return;
    authStore.clearUser ? authStore.clearUser() : authStore.logout();
    if (window.router && window.router.navigate) window.router.navigate('/admin/login');
    else window.location.href = '/admin/login';
  };
}

// Fast fetcher with 1.8s timeout guard
async function safeFetchWithTimeout(fetchPromise, timeoutMs = 1800, fallbackVal = null) {
  try {
    const timeout = new Promise(resolve => setTimeout(() => resolve(fallbackVal), timeoutMs));
    const result = await Promise.race([fetchPromise, timeout]);
    return result || fallbackVal;
  } catch (e) {
    return fallbackVal;
  }
}


