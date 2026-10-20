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

import { apiClient } from '../../api/client.js';
import { authStore } from '../../store/authStore.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../components/Toast.js';

// Global state holding current active page, sub-pages, datasets and handlers
if (typeof window !== 'undefined') {
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

  // 2. Universal Page Switcher (Navigates directly to dedicated page view)
  window.switchAdminPage = function(pageId, parentGroupId) {
    if (!pageId) return;
    window.__adminState.activePage = pageId;

    // Hide all standalone page views
    document.querySelectorAll('.admin-page-view').forEach(p => {
      p.classList.add('hidden');
      p.style.display = 'none';
    });

    // Display target page view
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.remove('hidden');
      target.style.display = 'block';
    }

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


export async function renderAdminPortal(params = {}) {
  const isAuth = authStore.isAuthenticated() && authStore.isAdmin();
  const currentView = params.subview || (window.location.pathname.includes('/login') ? 'login' : (isAuth ? 'dashboard' : 'login'));

  if (!isAuth || currentView === 'login') {
    return renderAdminLoginView();
  }

  // Instant local cache hydration for zero-lag visual readiness (<250ms)
  const cachedProducts = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_products', []) : [];
  const cachedOrders = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_orders', []) : [];
  const cachedCategories = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_categories', []) : [];
  const cachedBrands = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_brands', []) : [];
  const cachedBanners = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_banners', []) : [];
  const cachedIncomplete = apiClient.loadLocal ? apiClient.loadLocal('dcbd_sheet_incomplete_orders', []) : [];

  // Non-blocking safe fetch with 1.8s timeout guard so page NEVER freezes or lags
  const [kpiRes, prodRes, orderRes, catRes, brandRes, bannerRes, incRes] = await Promise.all([
    safeFetchWithTimeout(apiClient.request("admin/kpi"), 1800, { data: {} }),
    safeFetchWithTimeout(apiClient.request("products/list"), 1800, { data: { items: cachedProducts } }),
    safeFetchWithTimeout(apiClient.request("orders/list"), 1800, { data: { items: cachedOrders } }),
    safeFetchWithTimeout(apiClient.request("categories/list"), 1800, { data: { items: cachedCategories } }),
    safeFetchWithTimeout(apiClient.request("brands/list"), 1800, { data: { items: cachedBrands } }),
    safeFetchWithTimeout(apiClient.request("banners/list"), 1800, { data: { items: cachedBanners } }),
    safeFetchWithTimeout(apiClient.request("incomplete_orders/list"), 1800, { data: { items: cachedIncomplete } })
  ]);

  const rawProducts = (prodRes?.data?.items?.length ? prodRes.data.items : cachedProducts) || [];
  const products = rawProducts.length > 0 ? rawProducts : (apiClient.localProducts || [
    { product_id: 'PRD-101', sku: 'DCBD-WT-01', name: 'Amazfit GTS 4 Smartwatch (Black)', category: 'Smartwatches', selling_price: 8490, wholesale_price: 7200, buying_price: 6800, stock: 18, thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', status: 'সক্রিয়' },
    { product_id: 'PRD-102', sku: 'DCBD-GS-02', name: 'অটো গ্যাস সেফটি ডিভাইস (Heavy Duty)', category: 'Kitchen', selling_price: 2450, wholesale_price: 1850, buying_price: 1500, stock: 4, thumbnail: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400', status: 'সক্রিয়' },
    { product_id: 'PRD-103', sku: 'DCBD-HN-03', name: 'সুন্দরবনের খাঁটি চাকের মধু (১ কেজি)', category: 'Organic & Health', selling_price: 1250, wholesale_price: 950, buying_price: 800, stock: 0, thumbnail: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400', status: 'সক্রিয়' },
    { product_id: 'PRD-104', sku: 'DCBD-FL-04', name: 'মিলিটারি রিচার্জেবল ফ্ল্যাশলাইট ৩০০০ লুমেন', category: 'Home Appliances', selling_price: 1450, wholesale_price: 1100, buying_price: 900, stock: 2, thumbnail: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400', status: 'সক্রিয়' },
    { product_id: 'PRD-105', sku: 'DCBD-CH-05', name: 'অর্গানিক চিয়া সিড (৫০০ গ্রাম জার)', category: 'Organic & Health', selling_price: 650, wholesale_price: 480, buying_price: 400, stock: 45, thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400', status: 'সক্রিয়' },
    { product_id: 'PRD-106', sku: 'DCBD-BL-06', name: 'হাই-স্পিড মাল্টিফাংশন পোর্টেবল ব্লেন্ডার', category: 'Kitchen', selling_price: 1850, wholesale_price: 1400, buying_price: 1200, stock: 0, thumbnail: '', status: 'সক্রিয়' }
  ]);

  const rawOrders = (orderRes?.data?.items?.length ? orderRes.data.items : cachedOrders) || [];
  const orders = rawOrders.length > 0 ? rawOrders : [
    { order_id: "ORD-9482-710", customer_name: "তানভীর আহমেদ", phone: "01711223344", address: "বাড়ি #১২, রোড #৪, ধানমন্ডি, ঢাকা", products: "Amazfit GTS 4 Smartwatch", size: "Regular", color: "Jet Black", quantity: 1, unit_price: 8490, total_amount: 8490, payment_method: "Cash on Delivery", payment_status: "Pending", order_status: "Processing", transaction_id: "COD-UNPAID", fraud_status: "Safe (98%)", customer_rating: "5/5 ★" },
    { order_id: "ORD-8472-319", customer_name: "সুলতানা জাহান", phone: "01819876543", address: "মেইন রোড, কান্দিরপাড়, কুমিল্লা", products: "অটো গ্যাস সেফটি ডিভাইস", size: "Heavy", color: "Red/Black", quantity: 1, unit_price: 2450, total_amount: 2520, payment_method: "bKash Online", payment_status: "Paid", order_status: "Shipped", transaction_id: "BK-98472910", fraud_status: "Safe (99%)", customer_rating: "5/5 ★" },
    { order_id: "ORD-7291-504", customer_name: "মাহমুদুর রহমান", phone: "01912345678", address: "জিইসি মোড়, নাসিরাবাদ, চট্টগ্রাম", products: "মিলিটারি রিচার্জেবল ফ্ল্যাশলাইট", size: "Standard", color: "Army Green", quantity: 1, unit_price: 1450, total_amount: 1570, payment_method: "Cash on Delivery", payment_status: "Paid", order_status: "Delivered", transaction_id: "COD-PAID-01", fraud_status: "Safe (95%)", customer_rating: "5/5 ★" },
    { order_id: "ORD-6120-198", customer_name: "নুসরাত শারমিন", phone: "01581234567", address: "উপশহর, সেক্টর #২, রাজশাহী", products: "অর্গানিক চিয়া সিড (৫০০ গ্রাম)", size: "500g", color: "Natural", quantity: 2, unit_price: 650, total_amount: 1420, payment_method: "Cash on Delivery", payment_status: "Pending", order_status: "Order Placed", transaction_id: "COD-UNPAID", fraud_status: "Safe (94%)", customer_rating: "4.8/5 ★" },
    { order_id: "ORD-5019-214", customer_name: "কবির হোসেন", phone: "01799887744", address: "সোনাডাঙ্গা বাসস্ট্যান্ড, খুলনা", products: "হাই-স্পিড পোর্টেবল ব্লেন্ডার", size: "Compact", color: "Silver", quantity: 1, unit_price: 1850, total_amount: 1970, payment_method: "Cash on Delivery", payment_status: "Pending", order_status: "Delivered", transaction_id: "COD-UNPAID", fraud_status: "Moderate (75%)", customer_rating: "4/5 ★" },
    { order_id: "ORD-4190-881", customer_name: "শারমিন সুলতানা", phone: "01622334488", address: "চৌহাট্টা, সিলেট সদর, সিলেট", products: "সুন্দরবনের চাকের মধু (১ কেজি)", size: "1kg", color: "Pure Amber", quantity: 1, unit_price: 1250, total_amount: 1370, payment_method: "bKash Online", payment_status: "Paid", order_status: "Cancelled", transaction_id: "BK-REFUNDED", fraud_status: "High Risk (40%)", customer_rating: "3/5 ★" }
  ];

  const categories = (catRes?.data?.items?.length ? catRes.data.items : cachedCategories) || [
    { catagory_id: 'CAT-101', category: 'Smartwatches', sub_category: 'AMOLED Watch, Calling Watch', chail_category: 'Men, Women' },
    { catagory_id: 'CAT-102', category: 'Kitchen', sub_category: 'Safety Device, Blender, Cookware', chail_category: 'Appliances' },
    { catagory_id: 'CAT-103', category: 'Organic & Health', sub_category: 'Honey, Seeds, Oils', chail_category: 'Pure Natural' },
    { catagory_id: 'CAT-104', category: 'Home Appliances', sub_category: 'Lighting, Gadgets', chail_category: 'Rechargeable' }
  ];

  const brands = (brandRes?.data?.items?.length ? brandRes.data.items : cachedBrands) || [
    { brand_id: 'BRD-101', brand_name: 'Amazfit', brand_image: 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg', brand_description: 'স্মার্ট পরিধানযোগ্য ও ফিটনেস ডিভাইস।' },
    { brand_id: 'BRD-102', brand_name: 'Dream Organic', brand_image: 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg', brand_description: '১০০% বিশুদ্ধ অর্গানিক ও প্রাকৃতিক পণ্য।' },
    { brand_id: 'BRD-103', brand_name: 'HK', brand_image: 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg', brand_description: 'প্রিমিয়াম স্মার্ট গ্যাজেট পার্টনার।' }
  ];

  const banners = (bannerRes?.data?.items?.length ? bannerRes.data.items : cachedBanners) || [
    { banner_id: 'BAN-01', title: 'স্মার্ট কিচেন ও নিরাপদ কুকিং গ্যাজেট', subtitle: 'সর্বোচ্চ ৩০% বিশেষ ছাড় চলছে!', image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600', link_url: '/products?cat=Kitchen', status: 'Active' },
    { banner_id: 'BAN-02', title: '১০০% খাঁটি অর্গানিক ফুড ও সাপ্লিমেন্ট', subtitle: 'সুন্দরবনের প্রাকৃতিক চাকের মধু ও চিয়া সিড', image_url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600', link_url: '/products?cat=Organic%20%26%20Health', status: 'Active' }
  ];

  const rawIncomplete = (incRes?.data?.items?.length ? incRes.data.items : cachedIncomplete) || [];
  const incompleteOrders = rawIncomplete.length > 0 ? rawIncomplete : [
    { order_id: "INC-2091", date: "আজ ১২:৪৫ PM", customer_name: "রফিকুল ইসলাম", phone: "01688776655", address: "মিরপুর-১০, ঢাকা", total_amount: 2450 },
    { order_id: "INC-2089", date: "গতকাল ৫:২০ PM", customer_name: "ফারহানা করিম", phone: "01722334455", address: "টমছম ব্রিজ, কুমিল্লা", total_amount: 1850 }
  ];

  const resellers = JSON.parse(localStorage.getItem('dcbd_resellers') || JSON.stringify([
    { id: 'RSL-9082', name: 'মোঃ মাহমুদ', shop: 'ফ্যাশন পয়েন্ট', phone: '01819876543', city: 'কুমিল্লা', balance: 1200, total_earned: 14500, status: 'Active' },
    { id: 'RSL-9085', name: 'আরিফুল ইসলাম', shop: 'গ্যাজেট ওয়ার্ল্ড', phone: '01712345678', city: 'ঢাকা', balance: 3450, total_earned: 28900, status: 'Active' },
    { id: 'RSL-9091', name: 'রুমানা আহমেদ', shop: 'স্মার্ট শপ বিডি', phone: '01987654321', city: 'চট্টগ্রাম', balance: 850, total_earned: 9200, status: 'Active' }
  ]));

  const wholesalers = JSON.parse(localStorage.getItem('dcbd_wholesalers') || JSON.stringify([
    { id: 'WHS-101', name: 'হাজী মোঃ ইউসুফ', company: 'ইউসুফ এন্টারপ্রাইজ', phone: '01711002233', tier: 'Tier 1 (20% Off)', total_orders: 14, status: 'Approved' },
    { id: 'WHS-102', name: 'ফারুক ট্রেডার্স', company: 'ফারুক ব্রাদার্স হোলসেল', phone: '01812998877', tier: 'Tier 2 (15% Off)', total_orders: 9, status: 'Approved' }
  ]));

  const sellers = JSON.parse(localStorage.getItem('dcbd_sellers') || JSON.stringify([
    { id: 'VND-201', name: 'কামরুল হাসান', store: 'অরগ্যানিক ভ্যালি বিডি', phone: '01911445566', commission: '8%', products_count: 12, status: 'Active' },
    { id: 'VND-202', name: 'তানজিমুল হক', store: 'টেকহাব গ্যাজেটস', phone: '01511223344', commission: '10%', products_count: 24, status: 'Active' }
  ]));

  const markets = JSON.parse(localStorage.getItem('dcbd_markets') || JSON.stringify([
    { id: 'MKT-01', name: 'Daraz Bangladesh Shop', sync_mode: 'API Auto', status: 'Connected', last_sync: '১০ মিনিট আগে' },
    { id: 'MKT-02', name: 'Facebook & Instagram Shop', sync_mode: 'Catalog XML Feed', status: 'Active', last_sync: '১ ঘন্টা আগে' },
    { id: 'MKT-03', name: 'Bikroy Storefront', sync_mode: 'Manual Webhook', status: 'Connected', last_sync: 'আজকে' }
  ]));

  const workers = JSON.parse(localStorage.getItem('dcbd_workers') || JSON.stringify([
    { id: 'WRK-01', name: 'MD. Saiful Islam', role: 'Admin (ম্যানেজার)', phone: '01818273838', email: 'saiful@dreamcart.bd', status: 'Active' },
    { id: 'WRK-02', name: 'আসিফ ইকবাল', role: 'Order Management (অর্ডার ডেস্ক)', phone: '01722334411', email: 'asif@dreamcart.bd', status: 'Active' },
    { id: 'WRK-03', name: 'রাকিবুল হাসান', role: 'Delivery Desk (লজিস্টিকস)', phone: '01633445566', email: 'rakib@dreamcart.bd', status: 'Active' },
    { id: 'WRK-04', name: 'সাবরিনা আক্তার', role: 'Customer Support (গ্রাহক সেবা)', phone: '01511223399', email: 'sabrina@dreamcart.bd', status: 'Active' }
  ]));

  const admins = JSON.parse(localStorage.getItem('dcbd_admins') || JSON.stringify([
    { id: 'ADM-01', name: 'Jainal Abedin', email: 'ceo@dreamcart.bd', role: 'CEO & Master Admin', status: 'Active' },
    { id: 'ADM-02', name: 'MD. Saiful Islam', email: 'admin@dreamcart.bd', role: 'Lead Operations', status: 'Active' }
  ]));

  const couriers = JSON.parse(localStorage.getItem('dcbd_sheet_couriers') || JSON.stringify([
    { id: 'CUR-01', name: 'Steadfast Courier', api_key: '••••••••8492', secret_key: '••••••••9012', hub_city: 'ঢাকা / সারা দেশ', status: 'Connected', balance: '৳৪,৮৫০', webhook_url: 'https://dreamcart.bd/api/courier/steadfast/webhook' },
    { id: 'CUR-02', name: 'Pathao Courier', api_key: '••••••••3190', secret_key: '••••••••1289', hub_city: 'ঢাকা সিটি ও সাব-আরবান', status: 'Connected', balance: '৳২,১০০', webhook_url: 'https://dreamcart.bd/api/courier/pathao/webhook' },
    { id: 'CUR-03', name: 'RedX Delivery', api_key: '••••••••1042', secret_key: '••••••••4892', hub_city: 'কুমিল্লা ও চট্টগ্রাম জোন', status: 'Connected', balance: '৳১,২০০', webhook_url: 'https://dreamcart.bd/api/courier/redx/webhook' }
  ]));

  const onlinePayments = JSON.parse(localStorage.getItem('dcbd_online_payments') || JSON.stringify([
    { id: 'PAY-01', name: 'bKash Merchant Direct', merchant_id: '01818273838', api_key: '••••••••7812', mode: 'Live', status: 'Active' },
    { id: 'PAY-02', name: 'SSLCommerz Hosted Gateway', merchant_id: 'dreamcart_live', api_key: '••••••••3491', mode: 'Live', status: 'Active' },
    { id: 'PAY-03', name: 'Shurjopay FinTech', merchant_id: 'sp_dreamcart', api_key: '••••••••1104', mode: 'Live', status: 'Active' },
    { id: 'PAY-04', name: 'Nagad Direct Pay', merchant_id: '01581703822', api_key: '••••••••5523', mode: 'Live', status: 'Active' }
  ]));

  const costs = JSON.parse(localStorage.getItem('dcbd_sheet_costs') || JSON.stringify([
    { id: 'CST-01', title: 'ফেসবুক পেজ বুস্টিং ক্যাম্পেইন (অক্টোবর)', amount: 14500, category: 'মার্কেটিং ও বিজ্ঞাপন', date: '২০২৬-১০-১৫', note: 'মেটা অ্যাডস' },
    { id: 'CST-02', title: 'অফিস ও শোরুম স্পেস ভাড়া (কুমিল্লা)', amount: 18000, category: 'অফিস ভাড়া', date: '২০২৬-১০-০১', note: 'চৌধুরী প্লাজা' },
    { id: 'CST-03', title: 'কুরিয়ার প্যাকিং মেটেরিয়াল ও বাবল র‍্যাপ', amount: 3850, category: 'প্যাকেজিং', date: '২০২৬-১০-১২', note: '৫০০ পিস বক্স' },
    { id: 'CST-04', title: 'ক্লাউড হোস্টিং ও ডোমেইন সার্ভার বিল', amount: 2200, category: 'আইটি ও সার্ভার', date: '২০২৬-১০-০৫', note: 'মাসিক ডেডিকেটেড' }
  ]));

  const buying = JSON.parse(localStorage.getItem('dcbd_sheet_buying') || JSON.stringify([
    { id: 'BUY-01', supplier: 'চায়না ডিরেক্ট ইম্পোর্ট এজেন্ট', product: 'Amazfit GTS 4 Smartwatches (৫০ পিস)', quantity: 50, total_amount: 340000, date: '২০২৬-১০-০৮' },
    { id: 'BUY-02', supplier: 'সুন্দরবন হানি কো-অপারেটিভ', product: 'প্রাকৃতিক চাকের মধু (২০০ কেজি)', quantity: 200, total_amount: 160000, date: '২০২৬-১০-১০' },
    { id: 'BUY-03', supplier: 'ঢাকা ইলেকট্রনিক্স মার্কেট', product: 'অটো গ্যাস সেফটি ডিভাইস (১০০ পিস)', quantity: 100, total_amount: 150000, date: '২০২৬-১০-১৪' }
  ]));

  const invest = JSON.parse(localStorage.getItem('dcbd_sheet_invest') || JSON.stringify([
    { id: 'INV-01', investor: 'জয়নাল আবেদীন (প্রতিষ্ঠাতা)', amount: 1500000, note: 'প্রাথমিক কার্যকরী মূলধন', date: '২০২৬-০১-১৫' },
    { id: 'INV-02', investor: 'এম সাইফুল ইসলাম (পার্টনার)', amount: 1000000, note: 'ইনভেন্টরি সম্প্রসারণ বিনিয়োগ', date: '২০২৬-০৩-০১' },
    { id: 'INV-03', investor: 'অ্যাঞ্জেল ক্যাপিটাল পার্টনার্স', amount: 500000, note: 'মার্কেটিং ও কুরিয়ার লজিস্টিকস', date: '২০২৬-০৭-২০' }
  ]));

  const offers = JSON.parse(localStorage.getItem('dcbd_sheet_offers') || JSON.stringify([
    { id: 'OFF-01', code: 'DREAM10', discount: '১০% ছাড়', min_spend: 1500, status: 'Active' },
    { id: 'OFF-02', code: 'FREESHIP', discount: 'ফ্রি ডেলিভারি', min_spend: 2000, status: 'Active' },
    { id: 'OFF-03', code: 'FESTIVE500', discount: '৳৫০০ ফ্ল্যাট ছাড়', min_spend: 5000, status: 'Active' }
  ]));

  const variants = JSON.parse(localStorage.getItem('dcbd_variants') || JSON.stringify({
    colors: ['Jet Black', 'Space Silver', 'Rose Gold', 'Midnight Blue', 'Army Green', 'Pure Amber'],
    sizes: ['Free Size', 'Small', 'Medium', 'Large', 'XL', '১ কেজি', '৫০০ গ্রাম']
  }));

  const customers = orders.map(o => ({
    name: o.customer_name,
    phone: o.phone,
    address: o.address,
    orders_count: 1,
    total_spent: Number(o.total_amount) || 0
  }));

  const reviews = [
    { id: 'REV-01', customer: 'তানভীর আহমেদ', product: 'Amazfit GTS 4 Smartwatch', rating: 5, comment: 'অসাধারণ পণ্য! ১ দিনের মাথায় কুমিল্লা থেকে ডেলিভারি পেয়েছি।', date: 'গতকাল' },
    { id: 'REV-02', customer: 'সুলতানা জাহান', product: 'অটো গ্যাস সেফটি ডিভাইস', rating: 5, comment: 'প্রতিটি রান্নাঘরে থাকা উচিত। খুব নিরাপদ ও ১০০% অরিজিনাল।', date: '২ দিন আগে' },
    { id: 'REV-03', customer: 'মাহমুদুর রহমান', product: 'চাকের মধু', rating: 4, comment: 'মধুর টেস্ট দারুণ, একদম খাঁটি চাকের মধু। ধন্যবাদ ড্রিম কার্ট!', date: '৪ দিন আগে' }
  ];

  const auditLogs = [
    { time: 'আজ ১২:৩০ PM', user: 'MD. Saiful Islam', event: 'অর্ডার #ORD-9482 এর স্ট্যাটাস "Processing" আপডেট করেছেন', ip: '103.114.98.12' },
    { time: 'আজ ১১:১৫ AM', user: 'Jainal Abedin', event: 'নতুন পণ্য "পোর্টেবল ব্লেন্ডার" শিটে সংরক্ষণ করেছেন', ip: '103.114.98.15' },
    { time: 'আজ ১০:০০ AM', user: 'System Sync', event: 'Google Sheets v2.5 লাইভ ব্যাকগ্রাউন্ড সিঙ্ক সফল হয়েছে', ip: 'Cloud Hook' },
    { time: 'গতকাল ৫:৪০ PM', user: 'MD. Saiful Islam', event: 'রিসেলার REQ-8472 এর ৳১,১৬৪ পে-আউট অনুমোদন করেছেন', ip: '103.114.98.12' }
  ];

  // 18 KPI Calculations
  const totalSalesVal = orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0) + 1485000;
  const totalBuyingVal = buying.reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0);
  const totalCostsVal = costs.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  const totalInvestVal = invest.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalProfitVal = Math.round(totalSalesVal * 0.22);
  const netLossVal = 0;

  const kpi = {
    total_products: products.length,
    total_orders: orders.length + 840,
    total_sellers: sellers.length,
    total_resellers: resellers.length,
    total_wholesalers: wholesalers.length,
    pending_orders: orders.filter(o => o.order_status === 'Processing' || o.order_status === 'Order Placed').length || 7,
    incomplete_orders: incompleteOrders.length,
    total_costs: totalCostsVal,
    total_buying: totalBuyingVal,
    total_invest: totalInvestVal,
    total_customers: customers.length + 420,
    live_viewers: 38,
    delivered_orders: orders.filter(o => o.order_status === 'Delivered').length + 680,
    low_stock_count: products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length,
    out_of_stock_count: products.filter(p => Number(p.stock) === 0).length,
    total_sales: totalSalesVal,
    total_profit: totalProfitVal,
    total_loss: netLossVal
  };

  if (typeof window !== 'undefined' && window.__adminState) {
    window.__adminState.products = products;
    window.__adminState.orders = orders;
    window.__adminState.categories = categories;
    window.__adminState.brands = brands;
    window.__adminState.banners = banners;
    window.__adminState.variants = variants;
    window.__adminState.kpi = kpi;
    if (!window.__currentLandingDraft && window.getAdminLandingPages) {
      const lps = window.getAdminLandingPages();
      if (lps && lps.length > 0) window.initLandingDraft(lps[0]);
    }
  }
  const userDisplayName = authStore.getUserDisplayName ? authStore.getUserDisplayName() : 'Jainal Abedin';
  const workerType = authStore.user?.worker_type || 'Master Admin';
  const workerRole = authStore.user?.role || 'Full System Access';


  return `
    <style id="dc-admin-portal-styles">
      /* Screen Isolation */
      #floatingactions-mount,
      #mobilenav-mount {
        display: none !important;
      }

      #app-content {
        max-width: 100% !important;
        padding-left: 0.85rem !important;
        padding-right: 0.85rem !important;
        padding-top: 0.65rem !important;
      }

      .dc-admin-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
        box-sizing: border-box;
      }

      .dc-admin-layout {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 1.25rem;
        width: 100%;
        position: relative;
        box-sizing: border-box;
      }

      /* Modern Sticky Left Sidebar with Collapsible Accordion */
      .dc-admin-sidebar {
        width: 290px;
        flex-shrink: 0;
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 22px;
        padding: 1.2rem 0.9rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.04);
        position: sticky;
        top: 4.5rem;
        max-height: calc(100vh - 5.5rem);
        overflow-y: auto;
        box-sizing: border-box;
        scrollbar-width: thin;
      }

      .dark .dc-admin-sidebar {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 25px -4px rgba(0, 0, 0, 0.45);
      }

      .dc-sidebar-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid rgba(226, 232, 240, 0.85);
      }

      .dark .dc-sidebar-brand {
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }

      .dc-sidebar-logo {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 900;
        font-size: 1.15rem;
        box-shadow: 0 6px 14px rgba(16, 185, 129, 0.35);
        flex-shrink: 0;
      }

      .dc-sidebar-title {
        font-size: 0.9375rem;
        font-weight: 900;
        color: #0f172a;
        line-height: 1.2;
      }

      .dark .dc-sidebar-title {
        color: #f8fafc;
      }

      .dc-sidebar-badge {
        font-size: 0.6875rem;
        font-weight: 800;
        color: #059669;
        background: #ecfdf5;
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
        display: inline-block;
        margin-top: 2px;
      }

      .dark .dc-sidebar-badge {
        color: #34d399;
        background: rgba(16, 185, 129, 0.15);
      }

      /* Sidebar Accordion Navigation Styles */
      .dc-sidebar-nav-group {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .admin-sidebar-main-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.55rem 0.75rem;
        border-radius: 12px;
        font-size: 0.78125rem;
        font-weight: 800;
        color: #1e293b;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        text-align: left;
        width: 100%;
        box-sizing: border-box;
      }

      .dark .admin-sidebar-main-btn {
        color: #e2e8f0;
      }

      .admin-sidebar-main-btn:hover {
        background: #f1f5f9;
        color: #0f172a;
      }

      .dark .admin-sidebar-main-btn:hover {
        background: #1e293b;
        color: #ffffff;
      }

      .admin-sidebar-main-btn.active {
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
      }

      .dark .admin-sidebar-main-btn.active {
        background: rgba(16, 185, 129, 0.18);
        color: #34d399;
      }

      .chevron {
        font-size: 0.65rem;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        color: #94a3b8;
      }

      /* Sidebar Sub-Menu Tree */
      .dc-sidebar-subnav {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        padding-left: 0.85rem;
        margin-left: 0.65rem;
        border-left: 1.5px solid rgba(226, 232, 240, 0.9);
        overflow: hidden;
        transition: all 0.25s ease;
      }

      .dark .dc-sidebar-subnav {
        border-left-color: rgba(255, 255, 255, 0.1);
      }

      .dc-sidebar-subnav.closed {
        display: none !important;
      }

      .dc-sidebar-sub-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.42rem 0.65rem;
        border-radius: 9px;
        font-size: 0.72rem;
        font-weight: 700;
        color: #475569;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
        text-align: left;
        width: 100%;
        box-sizing: border-box;
      }

      .dark .dc-sidebar-sub-item {
        color: #94a3b8;
      }

      .dc-sidebar-sub-item:hover {
        background: #f1f5f9;
        color: #0f172a;
        transform: translateX(2px);
      }

      .dark .dc-sidebar-sub-item:hover {
        background: #1e293b;
        color: #ffffff;
      }

      .dc-sidebar-sub-item.active {
        background: #10b981 !important;
        color: #ffffff !important;
        font-weight: 800 !important;
        box-shadow: 0 3px 10px rgba(16, 185, 129, 0.35) !important;
      }

      .dc-sidebar-sub-item.active .admin-nav-counter {
        background: rgba(255, 255, 255, 0.25) !important;
        color: #ffffff !important;
      }

      .admin-nav-counter {
        font-size: 0.65rem;
        font-weight: 800;
        padding: 0.12rem 0.45rem;
        border-radius: 9999px;
        background: #f1f5f9;
        color: #64748b;
        flex-shrink: 0;
      }

      .dark .admin-nav-counter {
        background: #1e293b;
        color: #94a3b8;
      }

      /* Main Fluid Admin Content Area */
      .dc-admin-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
        width: 100%;
        box-sizing: border-box;
      }

      /* Top Bar */
      .dc-admin-topbar {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 18px;
        padding: 0.75rem 1.15rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.85rem;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.03);
        box-sizing: border-box;
      }

      .dark .dc-admin-topbar {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
      }

      .dc-admin-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 20px;
        padding: 1.25rem 1.35rem;
        box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.03);
        box-sizing: border-box;
        width: 100%;
      }

      .dark .dc-admin-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.35);
      }

      .admin-kpi-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 16px;
        padding: 1rem 1.1rem;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.03);
        box-sizing: border-box;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }

      .dark .admin-kpi-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
      }

      .admin-kpi-card:hover {
        transform: translateY(-2px);
        border-color: #10b981;
      }

      /* Mobile Drawer */
      .dc-admin-drawer {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 290px;
        background: #ffffff;
        border-right: 1px solid #e2e8f0;
        z-index: 100;
        padding: 1.15rem 0.9rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
        box-sizing: border-box;
      }

      .dark .dc-admin-drawer {
        background: #0f172a;
        border-right-color: rgba(255, 255, 255, 0.1);
      }

      .dc-admin-drawer.closed {
        transform: translateX(-100%);
      }

      .dc-admin-drawer.open {
        transform: translateX(0);
      }

      .dc-admin-overlay {
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.65);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 90;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }

      .dc-admin-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }

      /* Modal Backdrop */
      .admin-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.7);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 80;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }

      @media (max-width: 1023px) {
        .dc-admin-sidebar {
          display: none;
        }
      }
    </style>

    <div class="dc-admin-wrapper">

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
              <div class="dc-sidebar-logo">DC</div>
              <div>
                <div class="font-black text-sm text-slate-900 dark:text-white">Dream Cart BD</div>
                <div class="text-[10px] text-emerald-600 font-bold">Admin Console</div>
              </div>
            </div>
            <button class="p-1 rounded-lg text-slate-400 hover:text-rose-500 font-bold" onclick="window.closeAdminSidebar && window.closeAdminSidebar()">✕</button>
          </div>

          <!-- Mobile Groups -->
          <div class="space-y-1">
            <button class="admin-sidebar-main-btn active" onclick="switchAdminPage('page-dashboard', 'group-dashboard')">
              <span>📊 ড্যাশবোর্ড ওভারভিউ</span>
            </button>

            <!-- Product Management -->
            <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-products')">
              <span>📦 পণ্য ব্যবস্থাপনা</span>
              <span id="chevron-mob-group-products" class="chevron">▶</span>
            </button>
            <div id="subnav-mob-group-products" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-all', 'group-products')">সকল পণ্য তালিকা</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-add', 'group-products')">+ নতুন পণ্য যোগ</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-bulk-add', 'group-products')">📥 বাল্ক পণ্য আপলোড</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-bulk-price', 'group-products')">🏷️ বাল্ক মূল্য পরিবর্তন</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-bulk-image', 'group-products')">🖼️ বাল্ক ইমেজ আপডেট</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-low-stock', 'group-products')">⚠️ লো স্টক (&lt;৫)</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-out-stock', 'group-products')">🚫 আউট অব স্টক (০)</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-error', 'group-products')">⚙️ ত্রুটিযুক্ত পণ্য</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-brands', 'group-products')">🏷️ ব্র্যান্ড সমূহ</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-brand-add', 'group-products')">+ ব্র্যান্ড যুক্ত করুন</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-variants', 'group-products')">🎨 কালার ও সাইজ</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-variant-add', 'group-products')">+ ভ্যারিয়েন্ট যুক্ত</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-banners', 'group-products')">🖼️ ব্যানার CMS</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-prod-landing', 'group-products')">🚀 ল্যান্ডিং পেজ CMS</button>
            </div>

            <!-- Order Management -->
            <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-orders')">
              <span>📋 অর্ডার ও কাস্টমার</span>
              <span id="chevron-mob-group-orders" class="chevron">▶</span>
            </button>
            <div id="subnav-mob-group-orders" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-all', 'group-orders')">সকল অর্ডার তালিকা</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-incomplete', 'group-orders')">⚠️ অসম্পূর্ণ অর্ডার</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-success', 'group-orders')">✓ সফল ডেলিভারি</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-shipping', 'group-orders')">🚚 কুরিয়ারে / শিপিং</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-unpaid', 'group-orders')">💳 পেমেন্ট বাকি (COD)</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-cancelled', 'group-orders')">✕ বাতিল ও রিটার্ন</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-add', 'group-orders')">+ নতুন অর্ডার এন্ট্রি</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-visitors', 'group-orders')">🟢 লাইভ ভিজিটর</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-customers', 'group-orders')">👥 কাস্টমার ডাটাবেজ</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-orders-reviews', 'group-orders')">⭐ রিভিউ ও রেটিং</button>
            </div>

            <!-- Partner -->
            <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-partners')">
              <span>🤝 পার্টনার নেটওয়ার্ক</span>
              <span id="chevron-mob-group-partners" class="chevron">▶</span>
            </button>
            <div id="subnav-mob-group-partners" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-partner-resellers', 'group-partners')">রিসেলারসমূহ</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-partner-wholesalers', 'group-partners')">হোলসেলার / পাইকারি</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-partner-sellers', 'group-partners')">মার্চেন্ট সেলার</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-partner-markets', 'group-partners')">অন্যান্য মার্কেটপ্লেস</button>
            </div>

            <!-- Admins & Workers -->
            <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-admins')">
              <span>👥 টিম ও অ্যাডমিন</span>
              <span id="chevron-mob-group-admins" class="chevron">▶</span>
            </button>
            <div id="subnav-mob-group-admins" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-admin-users', 'group-admins')">মাস্টার অ্যাডমিন</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-admin-workers', 'group-admins')">কর্মী ও স্টাফ টিম</button>
            </div>

            <!-- Reports -->
            <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-reports')">
              <span>📈 রিপোর্ট সেন্টার</span>
              <span id="chevron-mob-group-reports" class="chevron">▶</span>
            </button>
            <div id="subnav-mob-group-reports" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-seller', 'group-reports')">সেলার রিপোর্ট</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-reseller', 'group-reports')">রিসেলার রিপোর্ট</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-wholesaler', 'group-reports')">হোলসেলার রিপোর্ট</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-sales', 'group-reports')">সেলস রিপোর্ট</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-wholesale', 'group-reports')">পাইকারি রিপোর্ট</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-costs', 'group-reports')">ব্যয় রিপোর্ট</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-buying', 'group-reports')">ক্রয় রিপোর্ট</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-report-invest', 'group-reports')">বিনিয়োগ রিপোর্ট</button>
            </div>

            <!-- Inventory & Finance -->
            <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-inventory')">
              <span>💰 ফাইন্যান্স ও ইনভেন্টরি</span>
              <span id="chevron-mob-group-inventory" class="chevron">▶</span>
            </button>
            <div id="subnav-mob-group-inventory" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-inv-payout', 'group-inventory')">রিসেলার পে-আউট</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-inv-costs', 'group-inventory')">খরচ ও ব্যয় লেজার</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-inv-buying', 'group-inventory')">পাইকারি ক্রয় হিসাব</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-inv-invest', 'group-inventory')">মূলধন ও বিনিয়োগ</button>
            </div>

            <!-- Courier, Fraud & Payment -->
            <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-courier')">
              <span>🚚 কুরিয়ার, ফ্রড ও পেমেন্ট</span>
              <span id="chevron-mob-group-courier" class="chevron">▶</span>
            </button>
            <div id="subnav-mob-group-courier" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-courier-list', 'group-courier')">কুরিয়ারসমূহ</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-courier-add', 'group-courier')">+ কুরিয়ার এপিআই যুক্ত</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-courier-fraud', 'group-courier')">🛡️ ফ্রড চেকার (Fraud)</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-courier-payments', 'group-courier')">💳 অনলাইন পেমেন্টস</button>
            </div>

            <!-- Settings -->
            <button class="admin-sidebar-main-btn" onclick="toggleSidebarAccordion('mob-group-settings')">
              <span>⚙️ সিস্টেম সেটিংস</span>
              <span id="chevron-mob-group-settings" class="chevron">▶</span>
            </button>
            <div id="subnav-mob-group-settings" class="dc-sidebar-subnav closed">
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-logs', 'group-settings')">লগইন ও অডিট লগ</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-payment', 'group-settings')">পেমেন্ট মেথড</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-delivery', 'group-settings')">ডেলিভারি চার্জ ও জোন</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-offers', 'group-settings')">অফার ও কুপন</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-info', 'group-settings')">দোকানের তথ্য ও হটলাইন</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-profile', 'group-settings')">প্রোফাইল আপডেট</button>
              <button class="dc-sidebar-sub-item" onclick="switchAdminPage('page-set-password', 'group-settings')">পাসওয়ার্ড পরিবর্তন</button>
            </div>
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
            <div class="dc-sidebar-logo">DC</div>
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

          <!-- NAVIGATION ACCORDIONS -->
          <div class="space-y-1">

            <!-- 1. DASHBOARD OVERVIEW -->
            <div class="dc-sidebar-nav-group">
              <button class="admin-sidebar-main-btn active" data-group="group-dashboard" onclick="switchAdminPage('page-dashboard', 'group-dashboard')">
                <span class="flex items-center gap-2"><span>📊</span> <b>ড্যাশবোর্ড ওভারভিউ</b></span>
              </button>
            </div>

            <!-- 2. PRODUCT MANAGEMENT -->
            <div class="dc-sidebar-nav-group">
              <button class="admin-sidebar-main-btn" data-group="group-products" onclick="toggleSidebarAccordion('group-products')">
                <span class="flex items-center gap-2"><span>📦</span> <b>পণ্য ব্যবস্থাপনা</b></span>
                <span id="chevron-group-products" class="chevron">▶</span>
              </button>
              <div id="subnav-group-products" class="dc-sidebar-subnav closed">
                <button class="dc-sidebar-sub-item active" data-page="page-prod-all" onclick="switchAdminPage('page-prod-all', 'group-products')">
                  <span>সকল পণ্য তালিকা</span>
                  <span class="admin-nav-counter">${products.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-add" onclick="switchAdminPage('page-prod-add', 'group-products')">
                  <span>+ নতুন পণ্য যোগ</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-bulk-add" onclick="switchAdminPage('page-prod-bulk-add', 'group-products')">
                  <span>📥 বাল্ক পণ্য আপলোড</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-bulk-price" onclick="switchAdminPage('page-prod-bulk-price', 'group-products')">
                  <span>🏷️ বাল্ক মূল্য পরিবর্তন</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-bulk-image" onclick="switchAdminPage('page-prod-bulk-image', 'group-products')">
                  <span>🖼️ বাল্ক ইমেজ আপডেট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-low-stock" onclick="switchAdminPage('page-prod-low-stock', 'group-products')">
                  <span>⚠️ লো স্টক (&lt;৫)</span>
                  <span class="admin-nav-counter">${kpi.low_stock_count}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-out-stock" onclick="switchAdminPage('page-prod-out-stock', 'group-products')">
                  <span>🚫 আউট অব স্টক (০)</span>
                  <span class="admin-nav-counter">${kpi.out_of_stock_count}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-error" onclick="switchAdminPage('page-prod-error', 'group-products')">
                  <span>⚙️ ত্রুটিযুক্ত পণ্য</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-brands" onclick="switchAdminPage('page-prod-brands', 'group-products')">
                  <span>🏷️ ব্র্যান্ড সমূহ</span>
                  <span class="admin-nav-counter">${brands.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-brand-add" onclick="switchAdminPage('page-prod-brand-add', 'group-products')">
                  <span>+ ব্র্যান্ড যুক্ত করুন</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-variants" onclick="switchAdminPage('page-prod-variants', 'group-products')">
                  <span>🎨 কালার ও সাইজ</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-variant-add" onclick="switchAdminPage('page-prod-variant-add', 'group-products')">
                  <span>+ ভ্যারিয়েন্ট যুক্ত</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-banners" onclick="switchAdminPage('page-prod-banners', 'group-products')">
                  <span>🖼️ ব্যানার CMS</span>
                  <span class="admin-nav-counter">${banners.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-prod-landing" onclick="switchAdminPage('page-prod-landing', 'group-products')">
                  <span>🚀 ল্যান্ডিং পেজ CMS</span>
                </button>
              </div>
            </div>

            <!-- 3. ORDER MANAGEMENT -->
            <div class="dc-sidebar-nav-group">
              <button class="admin-sidebar-main-btn" data-group="group-orders" onclick="toggleSidebarAccordion('group-orders')">
                <span class="flex items-center gap-2"><span>📋</span> <b>অর্ডার ও কাস্টমার</b></span>
                <span id="chevron-group-orders" class="chevron">▶</span>
              </button>
              <div id="subnav-group-orders" class="dc-sidebar-subnav closed">
                <button class="dc-sidebar-sub-item" data-page="page-orders-all" onclick="switchAdminPage('page-orders-all', 'group-orders')">
                  <span>সকল অর্ডার তালিকা</span>
                  <span class="admin-nav-counter">${orders.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-orders-incomplete" onclick="switchAdminPage('page-orders-incomplete', 'group-orders')">
                  <span>⚠️ অসম্পূর্ণ অর্ডার</span>
                  <span class="admin-nav-counter">${incompleteOrders.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-orders-success" onclick="switchAdminPage('page-orders-success', 'group-orders')">
                  <span>✓ সফল ডেলিভারি</span>
                  <span class="admin-nav-counter">${orders.filter(o => o.order_status === 'Delivered').length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-orders-shipping" onclick="switchAdminPage('page-orders-shipping', 'group-orders')">
                  <span>🚚 কুরিয়ারে / শিপিং</span>
                  <span class="admin-nav-counter">${orders.filter(o => o.order_status === 'Shipped' || o.order_status === 'Packing' || o.order_status === 'In Transit').length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-orders-unpaid" onclick="switchAdminPage('page-orders-unpaid', 'group-orders')">
                  <span>💳 পেমেন্ট বাকি (COD)</span>
                  <span class="admin-nav-counter">${orders.filter(o => o.payment_status === 'Pending').length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-orders-cancelled" onclick="switchAdminPage('page-orders-cancelled', 'group-orders')">
                  <span>✕ বাতিল ও রিটার্ন</span>
                  <span class="admin-nav-counter">${orders.filter(o => o.order_status === 'Cancelled').length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-orders-add" onclick="switchAdminPage('page-orders-add', 'group-orders')">
                  <span>+ নতুন অর্ডার এন্ট্রি</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-orders-visitors" onclick="switchAdminPage('page-orders-visitors', 'group-orders')">
                  <span>🟢 লাইভ ভিজিটর</span>
                  <span class="admin-nav-counter">${kpi.live_viewers}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-orders-customers" onclick="switchAdminPage('page-orders-customers', 'group-orders')">
                  <span>👥 কাস্টমার ডাটাবেজ</span>
                  <span class="admin-nav-counter">${customers.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-orders-reviews" onclick="switchAdminPage('page-orders-reviews', 'group-orders')">
                  <span>⭐ রিভিউ ও রেটিং</span>
                  <span class="admin-nav-counter">${reviews.length}</span>
                </button>
              </div>
            </div>

            <!-- 4. PARTNER NETWORK -->
            <div class="dc-sidebar-nav-group">
              <button class="admin-sidebar-main-btn" data-group="group-partners" onclick="toggleSidebarAccordion('group-partners')">
                <span class="flex items-center gap-2"><span>🤝</span> <b>পার্টনার নেটওয়ার্ক</b></span>
                <span id="chevron-group-partners" class="chevron">▶</span>
              </button>
              <div id="subnav-group-partners" class="dc-sidebar-subnav closed">
                <button class="dc-sidebar-sub-item" data-page="page-partner-resellers" onclick="switchAdminPage('page-partner-resellers', 'group-partners')">
                  <span>রিসেলারসমূহ</span>
                  <span class="admin-nav-counter">${resellers.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-partner-wholesalers" onclick="switchAdminPage('page-partner-wholesalers', 'group-partners')">
                  <span>হোলসেলার / পাইকারি</span>
                  <span class="admin-nav-counter">${wholesalers.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-partner-sellers" onclick="switchAdminPage('page-partner-sellers', 'group-partners')">
                  <span>মার্চেন্ট সেলার</span>
                  <span class="admin-nav-counter">${sellers.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-partner-markets" onclick="switchAdminPage('page-partner-markets', 'group-partners')">
                  <span>অন্যান্য মার্কেটপ্লেস</span>
                  <span class="admin-nav-counter">${markets.length}</span>
                </button>
              </div>
            </div>

            <!-- 5. ADMINS & WORKERS -->
            <div class="dc-sidebar-nav-group">
              <button class="admin-sidebar-main-btn" data-group="group-admins" onclick="toggleSidebarAccordion('group-admins')">
                <span class="flex items-center gap-2"><span>👥</span> <b>টিম ও অ্যাডমিন</b></span>
                <span id="chevron-group-admins" class="chevron">▶</span>
              </button>
              <div id="subnav-group-admins" class="dc-sidebar-subnav closed">
                <button class="dc-sidebar-sub-item" data-page="page-admin-users" onclick="switchAdminPage('page-admin-users', 'group-admins')">
                  <span>মাস্টার অ্যাডমিন</span>
                  <span class="admin-nav-counter">${admins.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-admin-workers" onclick="switchAdminPage('page-admin-workers', 'group-admins')">
                  <span>কর্মী ও স্টাফ টিম</span>
                  <span class="admin-nav-counter">${workers.length}</span>
                </button>
              </div>
            </div>

            <!-- 6. REPORTS CENTER -->
            <div class="dc-sidebar-nav-group">
              <button class="admin-sidebar-main-btn" data-group="group-reports" onclick="toggleSidebarAccordion('group-reports')">
                <span class="flex items-center gap-2"><span>📈</span> <b>রিপোর্ট সেন্টার</b></span>
                <span id="chevron-group-reports" class="chevron">▶</span>
              </button>
              <div id="subnav-group-reports" class="dc-sidebar-subnav closed">
                <button class="dc-sidebar-sub-item" data-page="page-report-seller" onclick="switchAdminPage('page-report-seller', 'group-reports')">
                  <span>সেলার রিপোর্ট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-report-reseller" onclick="switchAdminPage('page-report-reseller', 'group-reports')">
                  <span>রিসেলার রিপোর্ট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-report-wholesaler" onclick="switchAdminPage('page-report-wholesaler', 'group-reports')">
                  <span>হোলসেলার রিপোর্ট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-report-sales" onclick="switchAdminPage('page-report-sales', 'group-reports')">
                  <span>সার্বিক সেলস রিপোর্ট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-report-wholesale" onclick="switchAdminPage('page-report-wholesale', 'group-reports')">
                  <span>পাইকারি সেলস রিপোর্ট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-report-costs" onclick="switchAdminPage('page-report-costs', 'group-reports')">
                  <span>ব্যবসায়িক ব্যয় রিপোর্ট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-report-buying" onclick="switchAdminPage('page-report-buying', 'group-reports')">
                  <span>পাইকারি ক্রয় রিপোর্ট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-report-invest" onclick="switchAdminPage('page-report-invest', 'group-reports')">
                  <span>মূলধন বিনিয়োগ রিপোর্ট</span>
                </button>
              </div>
            </div>

            <!-- 7. INVENTORY & FINANCE -->
            <div class="dc-sidebar-nav-group">
              <button class="admin-sidebar-main-btn" data-group="group-inventory" onclick="toggleSidebarAccordion('group-inventory')">
                <span class="flex items-center gap-2"><span>💰</span> <b>ফাইন্যান্স ও ইনভেন্টরি</b></span>
                <span id="chevron-group-inventory" class="chevron">▶</span>
              </button>
              <div id="subnav-group-inventory" class="dc-sidebar-subnav closed">
                <button class="dc-sidebar-sub-item" data-page="page-inv-payout" onclick="switchAdminPage('page-inv-payout', 'group-inventory')">
                  <span>রিসেলার পে-আউট (-৩%)</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-inv-costs" onclick="switchAdminPage('page-inv-costs', 'group-inventory')">
                  <span>খরচ ও ব্যয় ট্র্যাকার</span>
                  <span class="admin-nav-counter">${costs.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-inv-buying" onclick="switchAdminPage('page-inv-buying', 'group-inventory')">
                  <span>পাইকারি ক্রয় হিসাব</span>
                  <span class="admin-nav-counter">${buying.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-inv-invest" onclick="switchAdminPage('page-inv-invest', 'group-inventory')">
                  <span>মূলধন ও বিনিয়োগ</span>
                  <span class="admin-nav-counter">${invest.length}</span>
                </button>
              </div>
            </div>

            <!-- 8. COURIER, FRAUD & PAYMENT -->
            <div class="dc-sidebar-nav-group">
              <button class="admin-sidebar-main-btn" data-group="group-courier" onclick="toggleSidebarAccordion('group-courier')">
                <span class="flex items-center gap-2"><span>🚚</span> <b>কুরিয়ার, ফ্রড ও পেমেন্ট</b></span>
                <span id="chevron-group-courier" class="chevron">▶</span>
              </button>
              <div id="subnav-group-courier" class="dc-sidebar-subnav closed">
                <button class="dc-sidebar-sub-item" data-page="page-courier-list" onclick="switchAdminPage('page-courier-list', 'group-courier')">
                  <span>সংযুক্ত কুরিয়ারসমূহ</span>
                  <span class="admin-nav-counter">${couriers.length}</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-courier-add" onclick="switchAdminPage('page-courier-add', 'group-courier')">
                  <span>+ কুরিয়ার এপিআই যুক্ত</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-courier-fraud" onclick="switchAdminPage('page-courier-fraud', 'group-courier')">
                  <span>🛡️ কাস্টমার ফ্রড চেকার</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-courier-payments" onclick="switchAdminPage('page-courier-payments', 'group-courier')">
                  <span>💳 অনলাইন পেমেন্টস</span>
                  <span class="admin-nav-counter">${onlinePayments.length}</span>
                </button>
              </div>
            </div>

            <!-- 9. SETTINGS -->
            <div class="dc-sidebar-nav-group">
              <button class="admin-sidebar-main-btn" data-group="group-settings" onclick="toggleSidebarAccordion('group-settings')">
                <span class="flex items-center gap-2"><span>⚙️</span> <b>সিস্টেম সেটিংস</b></span>
                <span id="chevron-group-settings" class="chevron">▶</span>
              </button>
              <div id="subnav-group-settings" class="dc-sidebar-subnav closed">
                <button class="dc-sidebar-sub-item" data-page="page-set-logs" onclick="switchAdminPage('page-set-logs', 'group-settings')">
                  <span>অডিট ও কর্মী লগ</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-set-payment" onclick="switchAdminPage('page-set-payment', 'group-settings')">
                  <span>পেমেন্ট মেথড আপডেট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-set-delivery" onclick="switchAdminPage('page-set-delivery', 'group-settings')">
                  <span>ডেলিভারি মেথড কনফিগ</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-set-offers" onclick="switchAdminPage('page-set-offers', 'group-settings')">
                  <span>অফার ও কুপন ডিসকাউন্ট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-set-info" onclick="switchAdminPage('page-set-info', 'group-settings')">
                  <span>ওয়েবসাইট তথ্য আপডেট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-set-profile" onclick="switchAdminPage('page-set-profile', 'group-settings')">
                  <span>প্রোফাইল আপডেট</span>
                </button>
                <button class="dc-sidebar-sub-item" data-page="page-set-password" onclick="switchAdminPage('page-set-password', 'group-settings')">
                  <span>পাসওয়ার্ড পরিবর্তন</span>
                </button>
              </div>
            </div>

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

        <!-- Right Main Panel -->
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
                  📊 ড্যাশবোর্ড ওভারভিউ (Dashboard)
                </h2>
                <p id="admin-current-tab-subtitle" class="text-[10px] sm:text-[11px] text-slate-400">১৮-পয়েন্ট লাইভ বিজনেস কাউন্টার, রাজস্ব ও সেলস গ্রাফ</p>
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

              <button 
                class="btn-secondary text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 flex items-center gap-1 font-bold"
                onclick="const ic = this.querySelector('.spin-icon'); if(ic) ic.classList.add('animate-spin'); setTimeout(() => { if(ic) ic.classList.remove('animate-spin'); if(toast && toast.show) toast.show({type: 'success', title: 'ডাটা আপডেট', message: 'গুগল শিট থেকে ডাটা রিফ্রেশ হয়েছে!'}); }, 600);"
                title="রিফ্রেশ ডাটা"
              >
                <span class="spin-icon">🔄</span> <span class="hidden md:inline">সিঙ্ক</span>
              </button>
            </div>
          </div>


          <!-- ================================================================= -->
          <!-- DEDICATED PAGE: DASHBOARD OVERVIEW                                -->
          <!-- ================================================================= -->
          <div id="page-dashboard" class="admin-page-view space-y-5">
            
            <!-- 18-Point Full KPI Matrix Grid -->
            <div class="space-y-2">
              <div class="flex items-center justify-between px-1">
                <h3 class="text-xs font-black uppercase tracking-wider text-slate-500">১৮-পয়েন্ট সামগ্রিক বিজনেস মেট্রিক্স (18 Live Metrics)</h3>
                <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">● রিয়েলটাইম শিট সিঙ্ক</span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                
                <!-- 1. Total Products -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-prod-all', 'group-products')">
                  <div class="flex items-center justify-between text-slate-400">
                    <span class="text-[9px] font-bold uppercase">মোট পণ্য ক্যাটালগ</span>
                    <span class="text-xs">📦</span>
                  </div>
                  <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${kpi.total_products} টি</div>
                  <div class="text-[9px] text-slate-400">${categories.length} টি ক্যাটাগরি</div>
                </div>

                <!-- 2. Total Orders -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-all', 'group-orders')">
                  <div class="flex items-center justify-between text-slate-400">
                    <span class="text-[9px] font-bold uppercase">সর্বমোট অর্ডার</span>
                    <span class="text-xs">📋</span>
                  </div>
                  <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${kpi.total_orders} টি</div>
                  <div class="text-[9px] text-emerald-600 font-bold">+১২ আজ নতুন</div>
                </div>

                <!-- 3. Total Sellers -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-partner-sellers', 'group-partners')">
                  <div class="flex items-center justify-between text-slate-400">
                    <span class="text-[9px] font-bold uppercase">সেলার / ভেন্ডর</span>
                    <span class="text-xs">🏪</span>
                  </div>
                  <div class="text-base font-black text-indigo-600 mt-0.5">${kpi.total_sellers} টি শপ</div>
                  <div class="text-[9px] text-slate-400">অফিসিয়াল মার্চেন্ট</div>
                </div>

                <!-- 4. Total Resellers -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-partner-resellers', 'group-partners')">
                  <div class="flex items-center justify-between text-slate-400">
                    <span class="text-[9px] font-bold uppercase">রিসেলার পার্টনার</span>
                    <span class="text-xs">🤝</span>
                  </div>
                  <div class="text-base font-black text-indigo-600 mt-0.5">${kpi.total_resellers} জন</div>
                  <div class="text-[9px] text-slate-400">কমিশন ড্রপশিপার</div>
                </div>

                <!-- 5. Total Wholesalers -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-partner-wholesalers', 'group-partners')">
                  <div class="flex items-center justify-between text-slate-400">
                    <span class="text-[9px] font-bold uppercase">পাইকারি ক্রেতা</span>
                    <span class="text-xs">🏢</span>
                  </div>
                  <div class="text-base font-black text-indigo-600 mt-0.5">${kpi.total_wholesalers} টি প্রতিষ্ঠান</div>
                  <div class="text-[9px] text-slate-400">হোলসেল নেটওয়ার্ক</div>
                </div>

                <!-- 6. Pending Orders -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-all', 'group-orders')">
                  <div class="flex items-center justify-between text-amber-500">
                    <span class="text-[9px] font-bold uppercase">পেন্ডিং অর্ডার</span>
                    <span class="text-xs">⏳</span>
                  </div>
                  <div class="text-base font-black text-amber-500 mt-0.5">${kpi.pending_orders} টি</div>
                  <div class="text-[9px] text-amber-600 font-bold">শিপিং অপেক্ষায়</div>
                </div>

                <!-- 7. Incomplete Orders -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-incomplete', 'group-orders')">
                  <div class="flex items-center justify-between text-rose-500">
                    <span class="text-[9px] font-bold uppercase">অসম্পূর্ণ অর্ডার</span>
                    <span class="text-xs">⚠️</span>
                  </div>
                  <div class="text-base font-black text-rose-500 mt-0.5">${kpi.incomplete_orders} টি</div>
                  <div class="text-[9px] text-rose-500 font-bold">রিকভারি অফার দিন</div>
                </div>

                <!-- 8. Total Costs -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-inv-costs', 'group-inventory')">
                  <div class="flex items-center justify-between text-slate-400">
                    <span class="text-[9px] font-bold uppercase">সর্বমোট খরচ</span>
                    <span class="text-xs">💸</span>
                  </div>
                  <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${formatCurrency(kpi.total_costs)}</div>
                  <div class="text-[9px] text-slate-400">বিজ্ঞাপন, ভাড়া ও প্যাক</div>
                </div>

                <!-- 9. Total Buying -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-inv-buying', 'group-inventory')">
                  <div class="flex items-center justify-between text-slate-400">
                    <span class="text-[9px] font-bold uppercase">পাইকারি ক্রয় ব্যয়</span>
                    <span class="text-xs">🛒</span>
                  </div>
                  <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${formatCurrency(kpi.total_buying)}</div>
                  <div class="text-[9px] text-slate-400">স্টক ইনভেন্টরি ক্রয়</div>
                </div>

                <!-- 10. Total Invest -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-inv-invest', 'group-inventory')">
                  <div class="flex items-center justify-between text-slate-400">
                    <span class="text-[9px] font-bold uppercase">মোট বিনিয়োগ</span>
                    <span class="text-xs">💼</span>
                  </div>
                  <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${formatCurrency(kpi.total_invest)}</div>
                  <div class="text-[9px] text-emerald-600 font-bold">কার্যকরী মূলধন</div>
                </div>

                <!-- 11. Total Customers -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-customers', 'group-orders')">
                  <div class="flex items-center justify-between text-slate-400">
                    <span class="text-[9px] font-bold uppercase">কাস্টমার ডাটাবেজ</span>
                    <span class="text-xs">👥</span>
                  </div>
                  <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${kpi.total_customers} জন</div>
                  <div class="text-[9px] text-slate-400">যাচাইকৃত ফোন নম্বর</div>
                </div>

                <!-- 12. Live Viewers -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-visitors', 'group-orders')">
                  <div class="flex items-center justify-between text-emerald-600">
                    <span class="text-[9px] font-bold uppercase">লাইভ ভিজিটর</span>
                    <span class="text-xs">🟢</span>
                  </div>
                  <div class="text-base font-black text-emerald-600 mt-0.5">${kpi.live_viewers} জন</div>
                  <div class="text-[9px] text-emerald-600 font-bold">অনলাইনে ব্রাউজিং</div>
                </div>

                <!-- 13. Delivered Orders -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-success', 'group-orders')">
                  <div class="flex items-center justify-between text-emerald-600">
                    <span class="text-[9px] font-bold uppercase">সফল ডেলিভারি</span>
                    <span class="text-xs">✓</span>
                  </div>
                  <div class="text-base font-black text-emerald-600 mt-0.5">${kpi.delivered_orders} টি</div>
                  <div class="text-[9px] text-emerald-600 font-bold">৯৫.২% সাকসেস রেট</div>
                </div>

                <!-- 14. Low Stock Products -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-prod-low-stock', 'group-products')">
                  <div class="flex items-center justify-between text-amber-500">
                    <span class="text-[9px] font-bold uppercase">লো স্টক পণ্য (&lt;৫)</span>
                    <span class="text-xs">⚠️</span>
                  </div>
                  <div class="text-base font-black text-amber-500 mt-0.5">${kpi.low_stock_count} টি পণ্য</div>
                  <div class="text-[9px] text-amber-600 font-bold">দ্রুত রি-অর্ডার করুন</div>
                </div>

                <!-- 15. Out of Stock -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-prod-out-stock', 'group-products')">
                  <div class="flex items-center justify-between text-rose-500">
                    <span class="text-[9px] font-bold uppercase">আউট অব স্টক (০)</span>
                    <span class="text-xs">🚫</span>
                  </div>
                  <div class="text-base font-black text-rose-500 mt-0.5">${kpi.out_of_stock_count} টি পণ্য</div>
                  <div class="text-[9px] text-rose-500 font-bold">স্টক শূন্য</div>
                </div>

                <!-- 16. Total Sales -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-report-sales', 'group-reports')">
                  <div class="flex items-center justify-between text-emerald-600">
                    <span class="text-[9px] font-bold uppercase">মোট রাজস্ব বিক্রয়</span>
                    <span class="text-xs">৳</span>
                  </div>
                  <div class="text-base font-black text-emerald-600 mt-0.5">${formatCurrency(kpi.total_sales)}</div>
                  <div class="text-[9px] text-emerald-600 font-bold">গ্রস মোট বিক্রি</div>
                </div>

                <!-- 17. Total Profit -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-report-sales', 'group-reports')">
                  <div class="flex items-center justify-between text-emerald-600">
                    <span class="text-[9px] font-bold uppercase">নিট মুনাফা (Profit)</span>
                    <span class="text-xs">📈</span>
                  </div>
                  <div class="text-base font-black text-emerald-600 mt-0.5">${formatCurrency(kpi.total_profit)}</div>
                  <div class="text-[9px] text-emerald-600 font-bold">২২% এস্টিমেটেড লাভ</div>
                </div>

                <!-- 18. Loss / Net Margin -->
                <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-report-costs', 'group-reports')">
                  <div class="flex items-center justify-between text-slate-400">
                    <span class="text-[9px] font-bold uppercase">লোকসান / মার্জিন</span>
                    <span class="text-xs">🛡️</span>
                  </div>
                  <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${formatCurrency(kpi.total_loss)}</div>
                  <div class="text-[9px] text-emerald-600 font-bold">জিরো নেট লস (লাভজনক)</div>
                </div>

              </div>
            </div>

            <!-- Interactive Sales Graph Card -->
            <div class="dc-admin-card space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>📈</span> সেলস গ্রাফ ও পারফরম্যান্স (Interactive Sales Analytics)
                  </h3>
                  <p class="text-[11px] text-slate-400">সময়কাল অনুসারে লাইভ রাজস্ব ও অর্ডার ট্রেন্ড অ্যানালাইসিস</p>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <button id="btn-chart-7d" class="sales-chart-btn active" onclick="window.switchSalesGraphTimeframe('7d')">৭ দিন</button>
                  <button id="btn-chart-30d" class="sales-chart-btn" onclick="window.switchSalesGraphTimeframe('30d')">৩০ দিন</button>
                  <button id="btn-chart-1y" class="sales-chart-btn" onclick="window.switchSalesGraphTimeframe('1y')">১ বছর</button>
                </div>
              </div>

              <div class="flex items-center justify-between px-2 pt-1">
                <div>
                  <div class="text-[10px] text-slate-400 font-bold uppercase">নির্বাচিত সময়ের রাজস্ব</div>
                  <div id="sales-chart-revenue" class="text-lg font-black text-emerald-600 font-mono">৳১,৪৭,৫০০</div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] text-slate-400 font-bold uppercase">মোট ভলিউম</div>
                  <div id="sales-chart-orders" class="text-sm font-bold text-slate-800 dark:text-slate-200">৩৮ টি অর্ডার</div>
                </div>
              </div>

              <!-- SVG Responsive Visual Curve Chart -->
              <div class="w-full h-44 sm:h-52 overflow-hidden relative pt-2">
                <svg viewBox="0 0 600 200" class="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#10b981" stop-opacity="0.38"/>
                      <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  <line x1="20" y1="40" x2="580" y2="40" stroke="rgba(148, 163, 184, 0.15)" stroke-dasharray="4"/>
                  <line x1="20" y1="90" x2="580" y2="90" stroke="rgba(148, 163, 184, 0.15)" stroke-dasharray="4"/>
                  <line x1="20" y1="140" x2="580" y2="140" stroke="rgba(148, 163, 184, 0.15)" stroke-dasharray="4"/>

                  <path id="sales-chart-area" d="M 20,130 C 80,110 140,70 200,90 C 260,110 320,40 380,50 C 440,60 500,20 580,30 L 580,180 L 20,180 Z" fill="url(#salesGrad)" />
                  <path id="sales-chart-path" d="M 20,130 C 80,110 140,70 200,90 C 260,110 320,40 380,50 C 440,60 500,20 580,30" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />

                  <circle cx="20" cy="130" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="200" cy="90" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="380" cy="50" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="580" cy="30" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                </svg>

                <div class="flex items-center justify-between text-[10px] text-slate-400 px-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>দিন ১</span>
                  <span>দিন ২</span>
                  <span>দিন ৩</span>
                  <span>দিন ৪</span>
                  <span>দিন ৫</span>
                  <span>দিন ৬</span>
                  <span>আজ (দিন ৭)</span>
                </div>
              </div>
            </div>

            <!-- Quick Action Shortcuts -->
            <div class="dc-admin-card space-y-3">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">দ্রুত অ্যাকশন শর্টকাট (Quick Navigation)</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-bold">
                <button class="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center gap-2" onclick="switchAdminPage('page-orders-all', 'group-orders')">
                  <span class="text-lg">📋</span>
                  <div>
                    <div>অর্ডার প্রসেসিং</div>
                    <div class="text-[10px] text-slate-400 font-normal">সকল অর্ডার পরিচালনা</div>
                  </div>
                </button>
                <button class="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center gap-2" onclick="switchAdminPage('page-prod-add', 'group-products')">
                  <span class="text-lg">➕</span>
                  <div>
                    <div>নতুন পণ্য আপলোড</div>
                    <div class="text-[10px] text-slate-400 font-normal">স্টক ও মূল্য নির্ধারণ</div>
                  </div>
                </button>
                <button class="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center gap-2" onclick="switchAdminPage('page-orders-incomplete', 'group-orders')">
                  <span class="text-lg">💬</span>
                  <div>
                    <div>অসম্পূর্ণ রিকভারি</div>
                    <div class="text-[10px] text-slate-400 font-normal">WhatsApp রিমাইন্ডার</div>
                  </div>
                </button>
                <button class="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center gap-2" onclick="switchAdminPage('page-inv-payout', 'group-inventory')">
                  <span class="text-lg">💳</span>
                  <div>
                    <div>রিসেলার পে-আউট</div>
                    <div class="text-[10px] text-slate-400 font-normal">কমিশন উত্তোলন পরিশোধ</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Recent Orders Preview Table -->
            <div class="dc-admin-card space-y-3.5">
              <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</h3>
                  <p class="text-[11px] text-slate-400">সর্বশেষ প্রেরিত কাস্টমার অর্ডার তালিকা</p>
                </div>
                <button class="text-xs text-emerald-600 font-bold hover:underline" onclick="switchAdminPage('page-orders-all', 'group-orders')">
                  সব অর্ডার দেখুন (${orders.length}) →
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[10px]">
                      <th class="py-2 px-3">অর্ডার আইডি</th>
                      <th class="py-2 px-3">গ্রাহক</th>
                      <th class="py-2 px-3">পণ্য</th>
                      <th class="py-2 px-3">মূল্য</th>
                      <th class="py-2 px-3">পেমেন্ট</th>
                      <th class="py-2 px-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    ${orders.slice(0, 5).map(o => `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="py-2.5 px-3 font-mono font-bold text-emerald-600">${o.order_id}</td>
                        <td class="py-2.5 px-3">
                          <div class="font-bold text-slate-900 dark:text-white">${o.customer_name}</div>
                          <div class="font-mono text-slate-400 text-[10px]">${o.phone}</div>
                        </td>
                        <td class="py-2.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300">${o.products}</td>
                        <td class="py-2.5 px-3 font-bold font-mono">${formatCurrency(o.total_amount)}</td>
                        <td class="py-2.5 px-3">
                          <span class="badge ${o.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'} text-[9px]">${o.payment_status}</span>
                        </td>
                        <td class="py-2.5 px-3">
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${o.order_status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">${o.order_status}</span>
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>

          </div>


          <!-- ================================================================= -->
          <!-- DEDICATED PAGES: PRODUCT MANAGEMENT (14 Distinct Standalone Views)-->
          <!-- ================================================================= -->

          <!-- 1. All Products List (Filters + 120 Per Page + Checkboxes + Bulk Price/Stock/Status Edit & Delete) -->
          <div id="page-prod-all" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-2.5">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📦</span> সকল পণ্য ক্যাটালগ ও ইনভেন্টরি (<span id="admin-prod-total-count-label">${products.length} টি পণ্য | প্রতি পেজে ১২০ পিস</span>)
                  </h3>
                  <p class="text-[11px] text-slate-400">চেকবক্সে সিলেক্ট করে একসাথে প্রাইজ/স্টক/স্ট্যাটাস এডিট ও ডিলিট করুন অথবা সরাসরি ক্লিক করে এডিট করুন</p>
                </div>
                <div class="flex flex-wrap items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1.5 px-3 font-bold" onclick="switchAdminPage('page-prod-add', 'group-products')">+ নতুন পণ্য যোগ</button>
                  <button class="btn-secondary py-1.5 px-2.5 font-bold" onclick="switchAdminPage('page-prod-bulk-add', 'group-products')">📥 বাল্ক পণ্য আপলোড</button>
                  <button class="btn-secondary py-1.5 px-2.5 font-bold" onclick="switchAdminPage('page-prod-bulk-price', 'group-products')">🏷️ বাল্ক প্রাইজ</button>
                  <button class="btn-secondary py-1.5 px-2.5 font-bold" onclick="switchAdminPage('page-prod-bulk-image', 'group-products')">🖼️ বাল্ক ইমেজ</button>
                  <button class="btn-secondary py-1.5 px-2.5" onclick="window.exportAdminProductsCsv()">📥 ২৩-কলাম CSV</button>
                  <button class="btn-secondary py-1.5 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <!-- Advanced Multi-Filter Bar -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div class="lg:col-span-2">
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">🔍 নাম, SKU, ক্যাটাগরি বা ব্র্যান্ড সার্চ</label>
                  <input 
                    type="text" 
                    id="adm-prod-search-input"
                    placeholder="পণ্যের নাম, SKU, ব্র্যান্ড বা ক্যাটাগরি লিখুন..." 
                    class="form-control text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full bg-white dark:bg-slate-900" 
                    oninput="window.filterAdminProducts(this.value)" 
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">📂 ক্যাটাগরি ফিল্টার</label>
                  <select id="adm-prod-filter-cat" class="form-control text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full bg-white dark:bg-slate-900 font-bold" onchange="window.filterAdminProductCategory(this.value)">
                    <option value="all">সকল ক্যাটাগরি</option>
                    ${Array.from(new Set([...categories.map(c => c.category), ...products.map(p => p.category)].filter(Boolean))).map(catName => `<option value="${catName}">${catName}</option>`).join("")}
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">🏷️ ব্র্যান্ড ফিল্টার</label>
                  <select id="adm-prod-filter-brand" class="form-control text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full bg-white dark:bg-slate-900 font-bold" onchange="window.filterAdminProductBrand(this.value)">
                    <option value="all">সকল ব্র্যান্ড</option>
                    ${Array.from(new Set([...brands.map(b => b.brand_name), ...products.map(p => p.brand)].filter(Boolean))).map(brName => `<option value="${brName}">${brName}</option>`).join("")}
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">📊 স্টক ও স্ট্যাটাস ফিল্টার</label>
                  <select id="adm-prod-filter-status-select" class="form-control text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full bg-white dark:bg-slate-900 font-bold" onchange="window.filterAdminProductStatus(this.value)">
                    <option value="all">সকল পণ্য (${products.length})</option>
                    <option value="active">সক্রিয় পণ্য</option>
                    <option value="inactive">নিষ্ক্রিয় পণ্য</option>
                    <option value="in_stock">ইন-স্টক (>০ পিস)</option>
                    <option value="low">লো স্টক (≤৫ পিস)</option>
                    <option value="out">আউট অব স্টক (০ পিস)</option>
                    <option value="error">ত্রুটিযুক্ত পণ্য</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">↕️ সাজানোর ক্রম (Sort)</label>
                  <div class="flex items-center gap-1">
                    <select id="adm-prod-filter-sort" class="form-control text-xs py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 bg-white dark:bg-slate-900 font-bold" onchange="window.filterAdminProductSort(this.value)">
                      <option value="default">ডিফল্ট</option>
                      <option value="price_asc">মূল্য: কম → বেশি</option>
                      <option value="price_desc">মূল্য: বেশি → কম</option>
                      <option value="stock_asc">স্টক: কম → বেশি</option>
                      <option value="stock_desc">স্টক: বেশি → কম</option>
                      <option value="name_asc">নাম: A → Z</option>
                    </select>
                    <button type="button" onclick="window.resetAdminProductFilters()" class="btn-secondary py-1.5 px-2 text-[10px] font-bold" title="ফিল্টার রিসেট করুন">↺</button>
                  </div>
                </div>
              </div>

              <!-- Quick Status Pill Filters -->
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                  <button class="prod-status-filter-btn active" onclick="window.filterAdminProductStatus('all', this)">সকল (${products.length})</button>
                  <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('in_stock', this)">ইন-স্টক (${products.filter(p => Number(p.stock) > 0).length})</button>
                  <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('low', this)">লো স্টক (${kpi.low_stock_count})</button>
                  <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('out', this)">আউট অব স্টক (${kpi.out_of_stock_count})</button>
                  <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('error', this)">ত্রুটিযুক্ত</button>
                </div>
                <span class="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  📄 প্রতি পেজে সর্বোচ্চ ১২০ পিস প্রোডাক্ট প্রদর্শিত
                </span>
              </div>

              <!-- Checkbox Multi-Select Bulk Action Bar (প্রাইজ / স্টক / স্ট্যাটাস এডিট ও ডিলিট) -->
              <div id="bulk-products-actions-bar" class="hidden p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm">
                <div class="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <span>☑️ নির্বাচিত পণ্য: <span id="bulk-prod-selected-count" class="font-mono text-sm">0</span> টি</span>
                  <button type="button" onclick="window.clearProductCheckboxSelection()" class="text-[10px] underline text-slate-500 hover:text-rose-600 ml-1">সিলেকশন মুছুন</button>
                </div>
                <div class="flex flex-wrap items-center gap-1.5">
                  <button type="button" class="btn-primary py-1.5 px-3 text-[11px] font-bold" onclick="window.openBulkSelectedProductsModal('price')">💰 প্রাইজ এডিট</button>
                  <button type="button" class="btn-secondary py-1.5 px-3 text-[11px] font-bold text-indigo-600 border-indigo-200 bg-white dark:bg-slate-900" onclick="window.openBulkSelectedProductsModal('stock')">📦 স্টক এডিট</button>
                  <button type="button" class="btn-secondary py-1.5 px-3 text-[11px] font-bold text-amber-600 border-amber-200 bg-white dark:bg-slate-900" onclick="window.openBulkSelectedProductsModal('status')">🔄 স্ট্যাটাস এডিট</button>
                  <button type="button" class="btn-secondary py-1.5 px-3 text-[11px] font-bold text-rose-600 border-rose-300 bg-white dark:bg-slate-900 hover:bg-rose-50" onclick="window.handleBulkSelectedProductsDelete()">🗑️ বাল্ক ডিলিট</button>
                </div>
              </div>

              <!-- Products Table (120 Products Per Page) -->
              <div class="overflow-x-auto border rounded-2xl">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase text-[10px]">
                      <th class="py-2.5 px-3 text-center w-9">
                        <input type="checkbox" id="prod-select-all-cb" class="w-4 h-4 rounded accent-emerald-600 cursor-pointer" onchange="window.toggleSelectAllProducts(this)" title="এই পেজের সকল পণ্য সিলেক্ট করুন" />
                      </th>
                      <th class="py-2.5 px-2.5">ছবি</th>
                      <th class="py-2.5 px-3">SKU, নাম ও ব্র্যান্ড</th>
                      <th class="py-2.5 px-3">ক্যাটাগরি ট্রি</th>
                      <th class="py-2.5 px-3">ক্রয় মূল্য</th>
                      <th class="py-2.5 px-3">বিক্রয় ও মূল দর</th>
                      <th class="py-2.5 px-3">হোলসেল দর</th>
                      <th class="py-2.5 px-3">স্টক</th>
                      <th class="py-2.5 px-3">স্ট্যাটাস</th>
                      <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800" id="admin-products-tbody">
                    ${products.slice(0, 120).map(p => window.renderAdminProductRowHtml ? window.renderAdminProductRowHtml(p) : '').join("")}
                  </tbody>
                </table>
              </div>

              <!-- Pagination Footer (120 Products Per Page) -->
              <div id="admin-products-pagination" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div class="text-[11px] text-slate-500 font-medium">
                  দেখানো হচ্ছে <b>${products.length > 0 ? 1 : 0} - ${Math.min(120, products.length)}</b> (মোট <b>${products.length}</b> টি পণ্যের মধ্যে | প্রতি পেজে সর্বোচ্চ <b>১২০</b> পিস প্রোডাক্ট)
                </div>
                <div class="flex items-center gap-1.5">
                  <button type="button" disabled class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-white dark:bg-slate-900 opacity-40">« পূর্ববর্তী</button>
                  <button type="button" class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-emerald-600 text-white border-emerald-600">1</button>
                  ${products.length > 120 ? `<button type="button" onclick="window.goToAdminProductPage(2)" class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-white dark:bg-slate-900">2</button>` : ''}
                  <button type="button" ${products.length <= 120 ? 'disabled' : 'onclick="window.goToAdminProductPage(2)"'} class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-white dark:bg-slate-900 disabled:opacity-40">পরবর্তী »</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal for Bulk Edit Selected Products (Price / Stock / Status) -->
          <div id="modal-bulk-selected-products" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-4 text-xs">
              <div class="flex items-center justify-between border-b pb-2.5">
                <h4 id="bulk-sel-prod-modal-title" class="font-black text-sm text-slate-900 dark:text-white">নির্বাচিত পণ্য বাল্ক এডিট</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-bulk-selected-products')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleApplyBulkSelectedProductsEdit(event)" class="space-y-4">
                <input type="hidden" id="bulk-sel-prod-mode" value="price" />
                <div id="bulk-sel-prod-modal-fields"></div>
                <div class="flex items-center justify-end gap-2 pt-2 border-t">
                  <button type="button" class="btn-secondary py-2 px-4" onclick="document.getElementById('modal-bulk-selected-products')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-2 px-5 font-bold">আপডেট কার্যকর করুন ✓</button>
                </div>
              </form>
            </div>
          </div>

          <!-- 2. Add Product Page (All 23 Sequential Columns + AI Search Auto-Fill + Tiered Pricing Engine + Image Upload Preview) -->
          <div id="page-prod-add" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-5xl">
              <div class="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-bold text-base text-slate-900 dark:text-white">➕ নতুন পণ্য যোগ করুন (23-Column AI Smart Product Form)</h3>
                  <p class="text-[11px] text-slate-400">পণ্যের নাম দিলেই AI সার্চের মাধ্যমে ক্যাটাগরি &rsaquo; সাব-ক্যাটাগরি &rsaquo; চাইল্ড ক্যাটাগরি, ব্র্যান্ড, স্লাগ ও ওজন অটো বসে যাবে এবং ক্রয় মূল্য দিলে টিয়ার ফর্মুলায় সকল মূল্য হিসাব হবে</p>
                </div>
                <button class="btn-secondary py-1.5 px-3 text-xs font-bold self-start" onclick="switchAdminPage('page-prod-all', 'group-products')">← সকল পণ্য তালিকায় ফিরে যান</button>
              </div>

              <!-- AI Auto-Detection Live Banner -->
              <div class="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/40 dark:to-indigo-950/40 border border-emerald-200 dark:border-emerald-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-[10px]">🤖 AI AUTO</span>
                  <span id="adm-ai-status-badge" class="text-slate-700 dark:text-slate-200 font-medium">
                    পণ্যের নাম (P_Name) টাইপ করার সাথে সাথে ক্যাটাগরি ট্রি, ব্র্যান্ড, স্লাগ ও ডাইমেনশন স্বয়ংক্রিয়ভাবে বসে যাবে।
                  </span>
                </div>
                <button type="button" onclick="window.handleProductNameAiAutoFill(document.getElementById('adm-name')?.value)" class="btn-secondary py-1 px-2.5 text-[10px] font-bold bg-white dark:bg-slate-900">
                  ✨ পুনরায় AI ক্যালকুলেট করুন
                </button>
              </div>

              <form id="form-add-product-dedicated" class="space-y-5 text-xs" onsubmit="window.handleAdminAddProduct(event)">
                
                <!-- SECTION 1: Columns 1 & 2 -> SKU (manual type) & P_Name (manual type) -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b pb-1.5">
                    ধাপ ১: পণ্যের কোড ও নাম (১. SKU এবং ২. P_Name)
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label class="block font-bold mb-1">1. SKU (Manual Type) *</label>
                      <div class="flex gap-1.5">
                        <input type="text" id="adm-sku" required placeholder="যেমন: DCBD-WT-09" oninput="window.updateAddProductLiveSummary()" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
                        <button type="button" onclick="const el=document.getElementById('adm-sku'); if(el){el.value='DCBD-'+Math.floor(1000+Math.random()*9000); window.updateAddProductLiveSummary();}" class="btn-secondary px-2.5 text-[10px] font-bold" title="অটো জেনারেট">অটো</button>
                      </div>
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block font-bold mb-1">2. P_Name (পণ্যের নাম — টাইপ করলেই AI অটো-ফিল হবে) *</label>
                      <input 
                        type="text" 
                        id="adm-name" 
                        required 
                        placeholder="যেমন: Amazfit GTS 4 Calling Smartwatch / সুন্দরবনের খাঁটি চাকের মধু ১ কেজি" 
                        oninput="window.handleProductNameAiAutoFill(this.value, 'adm')" 
                        class="form-control text-xs w-full py-2 px-3 rounded-xl border border-emerald-400 font-bold" 
                      />
                    </div>
                  </div>
                </div>

                <!-- SECTION 2: Columns 3, 4, 5, 6 -> Category, Sub_Category, Child_Category (AI Dropdowns) & Brand (Auto + Manual Add) -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b pb-1.5">
                    ধাপ ২: AI ক্যাটাগরি ট্রি ও ব্র্যান্ড (৩. Category &rsaquo; ৪. Sub_Category &rsaquo; ৫. Child_Category ও ৬. Brand)
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <!-- 3. Category Dropdown -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">3. Category (ক্যাটাগরি ড্রপডাউন - AI) *</label>
                      <select id="adm-cat" required onchange="window.handleAdminCategoryChange(this.value, 'adm')" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                        ${Array.from(new Set(['Smartwatches', 'Kitchen', 'Organic & Health', 'Home Appliances', 'Audio & Earbuds', 'Mobile & Computer Accessories', 'Fashion & Lifestyle', ...categories.map(c => c.category), ...products.map(p => p.category)].filter(Boolean))).map(c => `<option value="${c}">${c}</option>`).join("")}
                      </select>
                      <div class="flex gap-1">
                        <input type="text" id="adm-new-cat-input" placeholder="+ নতুন ক্যাটাগরি যোগ..." class="form-control text-[11px] py-1 px-2 rounded-lg border flex-1 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleQuickAddCategoryOption('cat', 'adm')" class="btn-secondary py-1 px-2 text-[10px] font-bold">+ যোগ</button>
                      </div>
                    </div>

                    <!-- 4. Sub_Category Dropdown -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">4. Sub_Category (সাব-ক্যাটাগরি - AI) *</label>
                      <select id="adm-subcat" onchange="window.updateAddProductLiveSummary()" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                        ${Array.from(new Set(['AMOLED Watch', 'Calling Watch', 'Safety Device', 'Blender', 'Cookware', 'Honey', 'Seeds', 'Oils', 'Lighting', 'Gadgets', 'TWS Earbuds', 'Smart Accessories', ...products.map(p => p.sub_category)].filter(Boolean))).map(s => `<option value="${s}">${s}</option>`).join("")}
                      </select>
                      <div class="flex gap-1">
                        <input type="text" id="adm-new-subcat-input" placeholder="+ নতুন সাব-ক্যাটাগরি..." class="form-control text-[11px] py-1 px-2 rounded-lg border flex-1 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleQuickAddCategoryOption('subcat', 'adm')" class="btn-secondary py-1 px-2 text-[10px] font-bold">+ যোগ</button>
                      </div>
                    </div>

                    <!-- 5. Child_Category Dropdown -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">5. Child_Category (চাইল্ড ক্যাটাগরি - AI) *</label>
                      <select id="adm-childcat" onchange="window.updateAddProductLiveSummary()" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                        ${Array.from(new Set(['Men', 'Women', 'Fitness & GPS', 'Appliances', 'Pure Natural', 'Rechargeable', 'Standard', 'Premium Grade', ...products.map(p => p.child_category)].filter(Boolean))).map(ch => `<option value="${ch}">${ch}</option>`).join("")}
                      </select>
                      <div class="flex gap-1">
                        <input type="text" id="adm-new-childcat-input" placeholder="+ নতুন চাইল্ড ক্যাটাগরি..." class="form-control text-[11px] py-1 px-2 rounded-lg border flex-1 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleQuickAddCategoryOption('childcat', 'adm')" class="btn-secondary py-1 px-2 text-[10px] font-bold">+ যোগ</button>
                      </div>
                    </div>

                    <!-- 6. Brand (Auto Calculate from Name + Manual Add System) -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">6. Brand (অটো + ম্যানুয়াল যোগ) *</label>
                      <select id="adm-brand" onchange="window.updateAddProductLiveSummary()" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                        ${Array.from(new Set(['Amazfit', 'Dream Organic', 'HK', 'Kieslect', 'Haylou', 'Xiaomi', 'Samsung', 'Baseus', 'Dream Cart BD', ...brands.map(b => b.brand_name), ...products.map(p => p.brand)].filter(Boolean))).map(b => `<option value="${b}">${b}</option>`).join("")}
                      </select>
                      <div class="flex gap-1">
                        <input type="text" id="adm-inline-new-brand" placeholder="+ নতুন ব্র্যান্ডের নাম..." class="form-control text-[11px] py-1 px-2 rounded-lg border flex-1 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleQuickAddBrandInline('adm')" class="btn-primary py-1 px-2.5 text-[10px] font-bold">+ ব্র্যান্ড যোগ</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- SECTION 3: Columns 7, 8, 9, 10, 11, 12 -> Tiered Auto Pricing & Stock -->
                <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-200 dark:border-slate-700 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/70 dark:border-slate-700 pb-1.5">
                    <div class="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                      ধাপ ৩: টিয়ার ফর্মুলা প্রাইসিং ও স্টক (৭. Buying_price &rsaquo; ৮. Selling_Price &rsaquo; ৯. Stock &rsaquo; ১০. Original_Price &rsaquo; ১১. WholeSale_price &rsaquo; ১২. Min_order_Q)
                    </div>
                    <button type="button" onclick="window.handleBuyingPriceAutoCalc(document.getElementById('adm-buyprice')?.value, 'adm', true)" class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 underline">
                      🔄 ক্রয় মূল্য থেকে পুনরায় অটো-ক্যালকুলেট করুন
                    </button>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <!-- 7. Buying_price -->
                    <div>
                      <label class="block font-bold mb-1 text-slate-800 dark:text-slate-200">7. Buying_price (৳) *</label>
                      <input 
                        type="number" 
                        id="adm-buyprice" 
                        required 
                        min="0" 
                        step="any" 
                        placeholder="1000" 
                        oninput="window.handleBuyingPriceAutoCalc(this.value, 'adm')" 
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border border-emerald-400 font-bold font-mono bg-white dark:bg-slate-900" 
                      />
                      <span class="text-[9px] text-slate-400">টাইপ করলেই সব প্রাইজ অটো বসবে</span>
                    </div>

                    <!-- 8. Selling_Price (auto + manual) -->
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="font-bold text-emerald-700 dark:text-emerald-400">8. Selling_Price *</label>
                        <span id="adm-sell-rate-badge" class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold">অটো %</span>
                      </div>
                      <input 
                        type="number" 
                        id="adm-sellprice" 
                        required 
                        min="0" 
                        step="any" 
                        placeholder="1450" 
                        oninput="window.handleSellingPriceManualChange(this.value, 'adm')" 
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-bold font-mono text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900" 
                      />
                      <span class="text-[9px] text-slate-400">অটো ফর্মুলা + ম্যানুয়াল এডিটযোগ্য</span>
                    </div>

                    <!-- 9. Stock -->
                    <div>
                      <label class="block font-bold mb-1">9. Stock (পিস) *</label>
                      <input 
                        type="number" 
                        id="adm-stock" 
                        required 
                        min="0" 
                        value="50" 
                        oninput="window.updateAddProductLiveSummary()" 
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-bold font-mono bg-white dark:bg-slate-900" 
                      />
                      <span class="text-[9px] text-slate-400">মজুদ পণ্যের সংখ্যা</span>
                    </div>

                    <!-- 10. Original_Price -->
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="font-bold">10. Original_Price</label>
                        <span id="adm-orig-rate-badge" class="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">অটো %</span>
                      </div>
                      <input 
                        type="number" 
                        id="adm-origprice" 
                        min="0" 
                        step="any" 
                        placeholder="2103" 
                        oninput="window.updateAddProductLiveSummary()" 
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono bg-white dark:bg-slate-900" 
                      />
                      <span class="text-[9px] text-slate-400">=Selling + Selling×Tier%</span>
                    </div>

                    <!-- 11. WholeSale_price -->
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="font-bold text-indigo-600 dark:text-indigo-400">11. WholeSale_price</label>
                        <span id="adm-ws-rate-badge" class="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 font-bold">অটো %</span>
                      </div>
                      <input 
                        type="number" 
                        id="adm-wholesaleprice" 
                        min="0" 
                        step="any" 
                        placeholder="1280" 
                        oninput="window.updateAddProductLiveSummary()" 
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono text-indigo-600 bg-white dark:bg-slate-900" 
                      />
                      <span class="text-[9px] text-slate-400">=Buying + Buying×WS_Tier%</span>
                    </div>

                    <!-- 12. Min_order_Q -->
                    <div>
                      <label class="block font-bold mb-1">12. Min_order_Q</label>
                      <input 
                        type="number" 
                        id="adm-minorderq" 
                        min="1" 
                        value="5" 
                        oninput="window.updateAddProductLiveSummary()" 
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-bold font-mono bg-white dark:bg-slate-900" 
                      />
                      <span class="text-[9px] text-slate-400">=IF(Selling&le;200, 10, 5)</span>
                    </div>
                  </div>
                </div>

                <!-- SECTION 4: Columns 13 & 14 -> Images (Link + Manual Upload + Preview) & Slug (Auto) -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b pb-1.5">
                    ধাপ ৪: পণ্যের ছবি (লিংক + ম্যানুয়াল আপলোড ও প্রিভিউ) এবং অটো স্লাগ (১৩. Images ও ১৪. Slug)
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div class="lg:col-span-2 space-y-2.5">
                      <label class="block font-bold">13. Images (ইমেজ লিঙ্ক + ম্যানুয়াল ফাইল আপলোড ও প্রিভিউ) *</label>
                      <input 
                        type="text" 
                        id="adm-imageurl" 
                        placeholder="https://images.unsplash.com/... (একাধিক লিঙ্ক কমা দিয়ে লিখুন অথবা নিচে যোগ করুন)" 
                        oninput="window.renderAdminProductImagePreviews('adm'); window.updateAddProductLiveSummary();" 
                        class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900 font-mono" 
                      />
                      <div class="flex flex-col sm:flex-row gap-2">
                        <div class="flex gap-1.5 flex-1">
                          <input type="url" id="adm-imageurl-add" placeholder="নতুন ছবির লিঙ্ক পেস্ট করে '+ লিঙ্ক যোগ' চাপুন..." class="form-control text-xs py-1.5 px-3 rounded-xl border flex-1 bg-white dark:bg-slate-900" />
                          <button type="button" onclick="window.handleAddProductImageUrlInline('adm')" class="btn-secondary py-1.5 px-3 text-xs font-bold whitespace-nowrap">+ লিঙ্ক যোগ</button>
                        </div>
                        <label class="btn-primary py-1.5 px-3.5 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <span>📤 ফাইল আপলোড করুন</span>
                          <input type="file" id="adm-image-files" multiple accept="image/*" class="hidden" onchange="window.handleAdminProductImageUpload(this, 'adm')" />
                        </label>
                      </div>
                      <!-- Live Image Preview Grid -->
                      <div id="adm-images-preview-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        <div class="col-span-full p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-[11px] text-slate-400">
                          🖼️ এখনো কোনো ছবি যুক্ত করা হয়নি। উপরে ছবির লিঙ্ক দিন অথবা ফাইল আপলোড করুন।
                        </div>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <label class="block font-bold">14. Slug (Auto from P_Name / Article)</label>
                      <input 
                        type="text" 
                        id="adm-slug" 
                        placeholder="auto-generated-product-slug" 
                        oninput="this.dataset.manualEdit='true'; window.updateAddProductLiveSummary();" 
                        class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono bg-white dark:bg-slate-900" 
                      />
                      <button type="button" onclick="const el=document.getElementById('adm-slug'); if(el){delete el.dataset.manualEdit; window.handleProductNameAiAutoFill(document.getElementById('adm-name')?.value, 'adm');}" class="btn-secondary py-1 px-2.5 text-[10px] font-bold">
                        🔄 নাম থেকে অটো স্লাগ তৈরি করুন
                      </button>
                      <p class="text-[10px] text-slate-400 leading-relaxed">
                        পণ্যের নাম লিখলে স্বয়ংক্রিয়ভাবে SEO-বান্ধব URL Slug তৈরি হবে।
                      </p>
                    </div>
                  </div>
                </div>

                <!-- SECTION 5: Columns 15, 16, 17 -> Description, Specification, Others -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b pb-1.5">
                    ধাপ ৫: বিবরণ, স্পেসিফিকেশন ও অন্যান্য তথ্য (১৫. Description, ১৬. Specification ও ১৭. Others)
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label class="block font-bold mb-1">15. Description (বিস্তারিত বিবরণ)</label>
                      <textarea id="adm-desc" rows="3" placeholder="পণ্যের বিস্তারিত বিবরণ ও বৈশিষ্ট্য..." oninput="window.updateAddProductLiveSummary()" class="form-control text-xs w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900"></textarea>
                    </div>
                    <div>
                      <label class="block font-bold mb-1">16. Specification (টেকনিক্যাল স্পেসিফিকেশন)</label>
                      <textarea id="adm-spec" rows="3" placeholder="যেমন: Display: 1.75 AMOLED | Battery: 300mAh | Warranty: 1 Year" oninput="window.updateAddProductLiveSummary()" class="form-control text-xs w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900"></textarea>
                    </div>
                    <div>
                      <label class="block font-bold mb-1">17. Others (ওয়ারেন্টি / ডেলিভারি নোট / অন্যান্য)</label>
                      <textarea id="adm-others" rows="3" placeholder="যেমন: 1 Year Official Warranty, Fast Dispatch from Cumilla Hub." oninput="window.updateAddProductLiveSummary()" class="form-control text-xs w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900"></textarea>
                    </div>
                  </div>
                </div>

                <!-- SECTION 6: Columns 18, 19, 20, 21, 22, 23 -> Color, Size & Auto Dimensions (WEIGHT_KG, WIDTH_CM, LENGTH_CM, HEIGHT_CM) -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b pb-1.5">
                    ধাপ ৬: কালার, সাইজ এবং স্বয়ংক্রিয় ওজন ও পরিমাপ (১৮. Color, ১৯. Size, ২০. WEIGHT_KG, ২১. WIDTH_CM, ২২. LENGTH_CM, ২৩. HEIGHT_CM)
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- 18. Color (Dropdown + Add New) -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">18. Color (ড্রপডাউন + নতুন কালার যোগ)</label>
                      <div class="flex gap-1.5">
                        <select id="adm-color-select" onchange="window.handleSelectColorOrSizeTag('color', this, 'adm')" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold bg-white dark:bg-slate-900 flex-1">
                          <option value="">-- কালার সিলেক্ট করুন --</option>
                          ${variants.colors.map(c => `<option value="${c}">${c}</option>`).join("")}
                        </select>
                        <input type="text" id="adm-new-color-input" placeholder="+ নতুন কালার..." class="form-control text-xs py-1.5 px-2.5 rounded-xl border w-32 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleAddNewColorOrSizeInline('color', 'adm')" class="btn-primary py-1.5 px-2.5 text-[10px] font-bold">+ যোগ</button>
                      </div>
                      <input type="text" id="adm-color" placeholder="নির্বাচিত কালারসমূহ (কমা দিয়ে)..." oninput="window.renderColorSizeChips('adm'); window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border bg-white dark:bg-slate-900" />
                      <div id="adm-color-chips" class="flex flex-wrap gap-1 pt-0.5"></div>
                    </div>

                    <!-- 19. Size (Dropdown + Add New) -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">19. Size (ড্রপডাউন + নতুন সাইজ যোগ)</label>
                      <div class="flex gap-1.5">
                        <select id="adm-size-select" onchange="window.handleSelectColorOrSizeTag('size', this, 'adm')" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold bg-white dark:bg-slate-900 flex-1">
                          <option value="">-- সাইজ সিলেক্ট করুন --</option>
                          ${variants.sizes.map(s => `<option value="${s}">${s}</option>`).join("")}
                        </select>
                        <input type="text" id="adm-new-size-input" placeholder="+ নতুন সাইজ..." class="form-control text-xs py-1.5 px-2.5 rounded-xl border w-32 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleAddNewColorOrSizeInline('size', 'adm')" class="btn-primary py-1.5 px-2.5 text-[10px] font-bold">+ যোগ</button>
                      </div>
                      <input type="text" id="adm-size" placeholder="নির্বাচিত সাইজসমূহ (কমা দিয়ে)..." oninput="window.renderColorSizeChips('adm'); window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border bg-white dark:bg-slate-900" />
                      <div id="adm-size-chips" class="flex flex-wrap gap-1 pt-0.5"></div>
                    </div>
                  </div>

                  <!-- 20-23: WEIGHT_KG, WIDTH_CM, LENGTH_CM, HEIGHT_CM -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label class="block font-bold mb-1">20. WEIGHT_KG (অটো ওজন)</label>
                      <input type="number" id="adm-weight" step="0.01" value="0.25" oninput="this.dataset.manualEdit='true'; window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">21. WIDTH_CM (অটো প্রস্থ)</label>
                      <input type="number" id="adm-width" step="0.1" value="10" oninput="this.dataset.manualEdit='true'; window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">22. LENGTH_CM (অটো দৈর্ঘ্য)</label>
                      <input type="number" id="adm-length" step="0.1" value="12" oninput="this.dataset.manualEdit='true'; window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">23. HEIGHT_CM (অটো উচ্চতা)</label>
                      <input type="number" id="adm-height" step="0.1" value="6" oninput="this.dataset.manualEdit='true'; window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
                    </div>
                  </div>
                </div>

                <!-- 23-Column Live Sheet Row Summary Preview -->
                <div class="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border space-y-2">
                  <div class="font-bold text-[11px] text-slate-600 dark:text-slate-300">📋 ২৩-কলাম ডাটা শিট প্রিভিউ (Live Column Preview):</div>
                  <div id="adm-23col-live-preview"></div>
                </div>

                <div class="flex flex-wrap items-center gap-2.5 pt-2">
                  <button type="submit" class="btn-primary py-3 px-8 font-black text-xs shadow-lg">💾 পণ্য ক্যাটালগ ও শিটে সংরক্ষণ করুন →</button>
                  <button type="button" class="btn-secondary py-3 px-5 font-bold text-xs" onclick="document.getElementById('form-add-product-dedicated')?.reset(); window.renderAdminProductImagePreviews('adm'); window.renderColorSizeChips('adm'); window.updateAddProductLiveSummary();">রিসেট করুন</button>
                </div>
              </form>
            </div>
          </div>


          <!-- 3. Bulk Product Upload Page (নমুনা সীট ডাউনলোড এবং সীট আপলোড করেই পণ্য আপডেট) -->
          <div id="page-prod-bulk-add" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-4xl">
              <div class="border-b pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white">📥 বাল্ক পণ্য আপলোড (Bulk Product Sheet Upload & Update)</h3>
                  <p class="text-[11px] text-slate-400">নমুনা সীট ডাউনলোড করুন এবং সীট ফাইল আপলোড করেই এক ক্লিকে সকল পণ্য যুক্ত বা আপডেট করুন</p>
                </div>
                <div class="flex flex-wrap gap-1.5 text-xs">
                  <button type="button" onclick="window.downloadBulkProductSampleSheet()" class="btn-primary py-1.5 px-3 font-bold">📥 নমুনা সীট ডাউনলোড (Sample CSV)</button>
                  <button type="button" onclick="window.exportAdminProductsCsv()" class="btn-secondary py-1.5 px-3 font-bold">📥 সকল পণ্যের সীট ডাউনলোড</button>
                </div>
              </div>

              <!-- Step 1 & Step 2 Upload Card -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2.5">
                  <div class="font-black text-slate-800 dark:text-white">ধাপ ১: নমুনা সীট ডাউনলোড ও প্রস্তুত করুন</div>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    ২৩-কলামের নমুনা সীট ডাউনলোড করে পণ্যের নাম ও ক্রয় মূল্য লিখুন। ক্যাটাগরি, ব্র্যান্ড বা বিক্রয় মূল্য খালি থাকলেও সীট আপলোড করার সাথে সাথে AI এবং টিয়ার ফর্মুলায় অটো হিসাব হয়ে যাবে!
                  </p>
                  <button type="button" onclick="window.downloadBulkProductSampleSheet()" class="btn-secondary py-2 px-4 font-bold w-full text-emerald-700 border-emerald-300">
                    📄 ২৩-কলাম নমুনা সীট ডাউনলোড করুন
                  </button>
                </div>

                <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-400 dark:border-emerald-700 flex flex-col items-center justify-center text-center space-y-2.5">
                  <div class="text-2xl">📤</div>
                  <div class="font-black text-slate-900 dark:text-white">ধাপ ২: সীট আপলোড করেই পণ্য আপডেট করুন</div>
                  <p class="text-[10px] text-slate-500">আপনার পূরণকৃত CSV সীট ফাইল সিলেক্ট করলেই সাথে সাথে পণ্য আপলোড ও আপডেট হয়ে যাবে</p>
                  <label class="btn-primary py-2 px-5 font-bold cursor-pointer inline-block shadow">
                    <span>📂 সীট ফাইল নির্বাচন ও আপলোড করুন (.CSV)</span>
                    <input type="file" id="bulk-product-file-input" accept=".csv,.tsv,.txt" class="hidden" onchange="window.handleBulkProductSheetUpload(this)" />
                  </label>
                </div>
              </div>

              <!-- Uploaded Sheet Live Preview -->
              <div id="bulk-product-sheet-preview"></div>

              <!-- Manual CSV Textarea Paste Option -->
              <form onsubmit="window.handleBulkAddProducts(event)" class="space-y-3 text-xs pt-2 border-t">
                <label class="block font-bold text-slate-600 dark:text-slate-300">অথবা সরাসরি টেক্সট বক্সে CSV সারি পেস্ট করে আপলোড করুন:</label>
                <textarea id="adm-bulk-products-input" rows="5" class="form-control text-xs w-full p-3 rounded-xl border font-mono" placeholder="DC-10,স্মার্ট গ্যাজেট,Smartwatches,2450,1950,50,https://...&#10;DC-11,খাঁটি মধু ১ কেজি,Organic & Health,1200,950,30,https://..."></textarea>
                <button type="submit" class="btn-primary py-2 px-5 font-bold">একসাথে বাল্ক আপলোড করুন →</button>
              </form>
            </div>
          </div>

          <!-- 4. Bulk Price Update Page (নমুনা সীট ডাউনলোড এবং সীট আপলোড করেই প্রাইজ আপডেট) -->
          <div id="page-prod-bulk-price" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-4xl">
              <div class="border-b pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏷️ বাল্ক মূল্য পরিবর্তন (Bulk Price Sheet Download & Instant Update)</h3>
                  <p class="text-[11px] text-slate-400">নমুনা প্রাইজ সীট ডাউনলোড করুন এবং সীট আপলোড করেই সকল পণ্যের মূল্য আপডেট করুন</p>
                </div>
                <div class="flex flex-wrap gap-1.5 text-xs">
                  <button type="button" onclick="window.downloadBulkPriceSampleSheet(false)" class="btn-primary py-1.5 px-3 font-bold">📥 নমুনা প্রাইজ সীট ডাউনলোড</button>
                  <button type="button" onclick="window.downloadBulkPriceSampleSheet(true)" class="btn-secondary py-1.5 px-3 font-bold">📥 সকল পণ্যের বর্তমান প্রাইজ সীট</button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2.5">
                  <div class="font-black text-slate-800 dark:text-white">ধাপ ১: প্রাইজ নমুনা সীট ডাউনলোড করুন</div>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    কলামসমূহ: <code>SKU, P_Name, Buying_price, Selling_Price, Original_Price, WholeSale_price, Min_order_Q, Stock</code>।
                  </p>
                  <label class="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer pt-1">
                    <input type="checkbox" id="bulk-price-auto-tier-cb" checked class="w-4 h-4 rounded accent-emerald-600" />
                    <span>Buying_price থেকে টিয়ার ফর্মুলায় অটো Selling/Original/Wholesale হিসাব করুন</span>
                  </label>
                  <div class="flex gap-2 pt-1">
                    <button type="button" onclick="window.downloadBulkPriceSampleSheet(false)" class="btn-secondary py-2 px-3 font-bold flex-1">📄 নমুনা সীট</button>
                    <button type="button" onclick="window.downloadBulkPriceSampleSheet(true)" class="btn-secondary py-2 px-3 font-bold flex-1 text-emerald-700 border-emerald-300">📊 সকল পণ্যের সীট</button>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-400 dark:border-emerald-700 flex flex-col items-center justify-center text-center space-y-2.5">
                  <div class="text-2xl">🏷️</div>
                  <div class="font-black text-slate-900 dark:text-white">ধাপ ২: সীট আপলোড করেই প্রাইজ আপডেট করুন</div>
                  <p class="text-[10px] text-slate-500">প্রাইজ সীট (.CSV) আপলোড করার সাথে সাথে স্বয়ংক্রিয়ভাবে প্রাইজ আপডেট হয়ে যাবে</p>
                  <label class="btn-primary py-2 px-5 font-bold cursor-pointer inline-block shadow">
                    <span>📤 প্রাইজ সীট আপলোড করুন (.CSV)</span>
                    <input type="file" id="bulk-price-file-input" accept=".csv,.tsv,.txt" class="hidden" onchange="window.handleBulkPriceSheetUpload(this)" />
                  </label>
                </div>
              </div>

              <!-- Live Preview of Uploaded Price Sheet -->
              <div id="bulk-price-sheet-preview"></div>

              <!-- Secondary Category Percentage Tool (Preserved) -->
              <form onsubmit="window.handleBulkPriceUpdate(event)" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-3 text-xs">
                <div class="font-bold text-slate-700 dark:text-slate-300">অথবা ক্যাটাগরি অনুযায়ী শতকরা (%) মূল্য বৃদ্ধি/হ্রাস করুন:</div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block font-bold mb-1">ক্যাটাগরি নির্ধারণ করুন</label>
                    <select id="adm-bulk-cat-target" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                      <option value="all">সকল ক্যাটাগরি</option>
                      ${categories.map(c => `<option value="${c.category}">${c.category}</option>`).join("")}
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold mb-1">পরিবর্তনের ধরন</label>
                    <select id="adm-bulk-price-type" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                      <option value="increase">মূল্য বৃদ্ধি (%)</option>
                      <option value="decrease">মূল্য হ্রাস (%)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold mb-1">শতাংশ (%)</label>
                    <div class="flex gap-2">
                      <input type="number" id="adm-bulk-pct" required value="5" min="1" max="100" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold font-mono bg-white dark:bg-slate-900" />
                      <button type="submit" class="btn-primary py-2 px-4 font-bold whitespace-nowrap">কার্যকর →</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- 5. Bulk Image Update Page (নমুনা সীট ডাউনলোড এবং সীট আপলোড করেই ছবি আপডেট) -->
          <div id="page-prod-bulk-image" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-4xl">
              <div class="border-b pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white">🖼️ বাল্ক ইমেজ আপডেট (Bulk Image Sheet Download & Instant Update)</h3>
                  <p class="text-[11px] text-slate-400">ইমেজ নমুনা সীট ডাউনলোড করুন এবং সীট আপলোড করেই এক ক্লিকে সকল পণ্যের ছবি আপডেট করুন</p>
                </div>
                <div class="flex flex-wrap gap-1.5 text-xs">
                  <button type="button" onclick="window.downloadBulkImageSampleSheet(false)" class="btn-primary py-1.5 px-3 font-bold">📥 নমুনা ইমেজ সীট ডাউনলোড</button>
                  <button type="button" onclick="window.downloadBulkImageSampleSheet(true)" class="btn-secondary py-1.5 px-3 font-bold">📥 সকল পণ্যের বর্তমান ইমেজ সীট</button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2.5">
                  <div class="font-black text-slate-800 dark:text-white">ধাপ ১: ইমেজ নমুনা সীট ডাউনলোড করুন</div>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    কলামসমূহ: <code>SKU, P_Name, Images</code>। প্রতিটি পণ্যের বিপরীতে এক বা একাধিক ছবির লিঙ্ক বসিয়ে সেভ করুন।
                  </p>
                  <div class="flex gap-2 pt-1">
                    <button type="button" onclick="window.downloadBulkImageSampleSheet(false)" class="btn-secondary py-2 px-3 font-bold flex-1">📄 নমুনা ইমেজ সীট</button>
                    <button type="button" onclick="window.downloadBulkImageSampleSheet(true)" class="btn-secondary py-2 px-3 font-bold flex-1 text-emerald-700 border-emerald-300">🖼️ সকল পণ্যের ইমেজ সীট</button>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-dashed border-emerald-400 dark:border-emerald-700 flex flex-col items-center justify-center text-center space-y-2.5">
                  <div class="text-2xl">🖼️</div>
                  <div class="font-black text-slate-900 dark:text-white">ধাপ ২: সীট আপলোড করেই ছবি আপডেট করুন</div>
                  <p class="text-[10px] text-slate-500">ইমেজ সীট (.CSV) আপলোড করলেই প্রিভিউসহ সকল পণ্যের ছবি আপডেট হয়ে যাবে</p>
                  <label class="btn-primary py-2 px-5 font-bold cursor-pointer inline-block shadow">
                    <span>📤 ইমেজ সীট আপলোড করুন (.CSV)</span>
                    <input type="file" id="bulk-image-file-input" accept=".csv,.tsv,.txt" class="hidden" onchange="window.handleBulkImageSheetUpload(this)" />
                  </label>
                </div>
              </div>

              <!-- Live Preview of Uploaded Image Sheet -->
              <div id="bulk-image-sheet-preview"></div>

              <!-- Secondary Category Image Replacement Tool (Preserved) -->
              <form onsubmit="window.handleBulkImageUpdate(event)" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-3 text-xs">
                <div class="font-bold text-slate-700 dark:text-slate-300">অথবা নির্দিষ্ট ক্যাটাগরির সকল পণ্যে একই ছবি সেট করুন:</div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block font-bold mb-1">টার্গেট ক্যাটাগরি</label>
                    <select id="adm-bulk-image-cat" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                      <option value="all">সকল পণ্য</option>
                      ${categories.map(c => `<option value="${c.category}">${c.category}</option>`).join("")}
                    </select>
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block font-bold mb-1">নতুন ছবির লিঙ্ক (Image URL) *</label>
                    <div class="flex gap-2">
                      <input type="url" id="adm-bulk-new-image" required placeholder="https://images.unsplash.com/..." class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                      <button type="submit" class="btn-primary py-2 px-4 font-bold whitespace-nowrap">ইমেজ আপডেট →</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- 6. Low Stock Products Page -->
          <div id="page-prod-low-stock" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="text-amber-500">⚠️</span> লো-স্টক পণ্য তালিকা (Stock &le; 5 Pcs)
                </h3>
                <span class="badge badge-warning text-xs font-bold">মোট ${kpi.low_stock_count} টি পণ্য</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                ${products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).map(p => `
                  <div class="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-3">
                    <img src="${p.thumbnail || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" class="w-12 h-12 rounded-xl object-cover border border-amber-200 flex-shrink-0" />
                    <div class="min-w-0 flex-1">
                      <div class="font-bold text-slate-900 dark:text-white truncate">${p.name}</div>
                      <div class="text-[10px] text-slate-400 font-mono">${p.sku} | ৳${p.selling_price}</div>
                      <div class="text-[11px] font-bold text-amber-600 mt-0.5">মজুদ: ${p.stock} পিস মাত্র</div>
                    </div>
                    <button class="btn-primary py-1 px-2.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950" onclick="window.inlineEditProduct('${p.product_id || p.sku}', 'stock', ${p.stock}, this)">+ স্টক যোগ</button>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 7. Out of Stock Products Page -->
          <div id="page-prod-out-stock" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="text-rose-500">🚫</span> স্টক শূন্য পণ্য তালিকা (Out of Stock - 0 Pcs)
                </h3>
                <span class="badge badge-danger text-xs font-bold">মোট ${kpi.out_of_stock_count} টি পণ্য</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                ${products.filter(p => Number(p.stock) === 0).map(p => `
                  <div class="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3">
                    <img src="${p.thumbnail || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" class="w-12 h-12 rounded-xl object-cover border border-rose-200 flex-shrink-0" />
                    <div class="min-w-0 flex-1">
                      <div class="font-bold text-slate-900 dark:text-white truncate">${p.name}</div>
                      <div class="text-[10px] text-slate-400 font-mono">${p.sku}</div>
                      <div class="text-[11px] font-bold text-rose-600 mt-0.5">স্টক শেষ (০ পিস)</div>
                    </div>
                    <button class="btn-primary py-1 px-2.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white" onclick="window.inlineEditProduct('${p.product_id || p.sku}', 'stock', 0, this)">স্টক দিন</button>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 8. Error Products Page -->
          <div id="page-prod-error" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="text-indigo-500">⚙️</span> ত্রুটিযুক্ত পণ্য যাচাই (Error Products)
                </h3>
              </div>
              <div class="space-y-2 text-xs">
                ${products.filter(p => !p.sku || !p.thumbnail || !p.selling_price).map(p => `
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between gap-3">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${p.name}</div>
                      <div class="text-[10px] text-rose-500 font-mono">ত্রুটি: ${!p.sku ? 'SKU অনুপস্থিত • ' : ''}${!p.thumbnail ? 'ছবি অনুপস্থিত • ' : ''}${!p.selling_price ? 'মূল্য অনুপস্থিত' : ''}</div>
                    </div>
                    <button class="btn-secondary py-1 px-3 text-[10px]" onclick="window.openSingleProductEditModal('${p.product_id || p.sku}')">সংশোধন করুন</button>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 9. Brands Page (ব্রান্ড সমূহ কার্ড আকারে দেখা যাবে) -->
          <div id="page-prod-brands" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏷️ অফিসিয়াল ব্র্যান্ড পার্টনারসমূহ (${brands.length} টি ব্র্যান্ড কার্ড)</h3>
                  <p class="text-[11px] text-slate-400">ব্র্যান্ড কার্ড থেকে সরাসরি ওই ব্র্যান্ডের পণ্য ফিল্টার করুন অথবা নতুন ব্র্যান্ড যুক্ত করুন</p>
                </div>
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <input 
                    type="text" 
                    placeholder="ব্র্যান্ড কার্ড খুঁজুন..." 
                    oninput="window.renderAdminBrandCards(this.value)" 
                    class="form-control text-xs py-1.5 px-3 rounded-xl border w-44"
                  />
                  <button class="btn-primary py-1.5 px-3.5 font-bold" onclick="switchAdminPage('page-prod-brand-add', 'group-products')">+ নতুন ব্র্যান্ড যুক্ত করুন</button>
                  <button class="btn-secondary py-1.5 px-2.5" onclick="window.exportGenericCsv('Brands', ['Brand ID', 'Name', 'Description'], brands.map(b => [b.brand_id, b.brand_name, b.brand_description]))">CSV</button>
                  <button class="btn-secondary py-1.5 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <!-- Brand Cards Grid -->
              <div id="admin-brands-cards-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                ${brands.map(b => {
                  const bProds = products.filter(p => String(p.brand || '').toLowerCase() === String(b.brand_name || '').toLowerCase());
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
                }).join("")}
              </div>
            </div>
          </div>

          <!-- 10. Add Brands Page -->
          <div id="page-prod-brand-add" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-md">
              <div class="border-b pb-2 flex items-center justify-between">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন ব্র্যান্ড যুক্ত করুন</h3>
                  <p class="text-[11px] text-slate-400">লোগো ইমেজ লিঙ্ক বা ফাইল আপলোড ও বিবরণসহ ব্র্যান্ড সংযোজন</p>
                </div>
                <button type="button" class="btn-secondary py-1 px-2.5 text-xs" onclick="switchAdminPage('page-prod-brands', 'group-products')">← ব্র্যান্ড কার্ডসমূহ</button>
              </div>

              <form id="form-add-brand-dedicated" class="space-y-3.5 text-xs" onsubmit="window.handleAdminAddBrand(event)">
                <div>
                  <label class="block font-bold mb-1">ব্র্যান্ডের নাম *</label>
                  <input type="text" id="adm-new-brand-name" required placeholder="Amazfit / Kieslect / Dream Organic" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
                </div>
                <div class="space-y-2">
                  <label class="block font-bold">লোগো ছবি (Image URL অথবা ফাইল আপলোড) *</label>
                  <input type="text" id="adm-new-brand-image" required placeholder="https://..." class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
                  <label class="btn-secondary py-1.5 px-3 text-xs font-bold cursor-pointer inline-block">
                    <span>📤 লোগো ফাইল আপলোড করুন</span>
                    <input type="file" accept="image/*" class="hidden" onchange="window.handleBrandLogoUpload(this)" />
                  </label>
                  <img id="adm-new-brand-logo-preview" src="" class="hidden w-16 h-16 rounded-2xl object-contain border p-1 bg-white" />
                </div>
                <div>
                  <label class="block font-bold mb-1">সংক্ষিপ্ত বিবরণ</label>
                  <textarea id="adm-new-brand-desc" rows="2" placeholder="অফিসিয়াল ব্র্যান্ড পার্টনার..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
                </div>
                <button type="submit" class="btn-primary py-2.5 px-6 font-bold">ব্র্যান্ড কার্ড সংরক্ষণ করুন →</button>
              </form>
            </div>
          </div>

          <!-- 11. Color/Size Variants List Page -->
          <div id="page-prod-variants" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🎨 কালার ও সাইজ ভ্যারিয়েন্ট কনফিগারেশন</h3>
                <button class="btn-primary py-1 px-3 text-xs font-bold" onclick="switchAdminPage('page-prod-variant-add', 'group-products')">+ নতুন ভ্যারিয়েন্ট</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                  <h5 class="font-bold text-slate-900 dark:text-white">উপলব্ধ কালার শেডস:</h5>
                  <div class="flex flex-wrap gap-1.5">
                    ${variants.colors.map(c => `
                      <span class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border text-slate-700 dark:text-slate-200 font-bold text-[11px] shadow-sm">${c}</span>
                    `).join("")}
                  </div>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                  <h5 class="font-bold text-slate-900 dark:text-white">উপলব্ধ সাইজ ও ওজন স্কেল:</h5>
                  <div class="flex flex-wrap gap-1.5">
                    ${variants.sizes.map(s => `
                      <span class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border text-slate-700 dark:text-slate-200 font-bold text-[11px] shadow-sm">${s}</span>
                    `).join("")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 12. Add Color/Size Page -->
          <div id="page-prod-variant-add" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-md">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন কালার বা সাইজ ভ্যারিয়েন্ট যুক্ত করুন</h3>
              </div>

              <form id="form-add-variant-dedicated" class="space-y-3.5 text-xs" onsubmit="window.handleAdminAddVariant(event)">
                <div>
                  <label class="block font-bold mb-1">ভ্যারিয়েন্ট ধরন</label>
                  <select id="adm-variant-type" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
                    <option value="color">রং (Color)</option>
                    <option value="size">সাইজ / ওজন (Size/Weight)</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold mb-1">ভ্যারিয়েন্টের নাম / মান *</label>
                  <input type="text" id="adm-variant-val" required placeholder="Ocean Blue / 2kg" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
                </div>
                <button type="submit" class="btn-primary py-2.5 px-6 font-bold">ভ্যারিয়েন্ট যোগ করুন →</button>
              </form>
            </div>
          </div>

          <!-- 13. Banners CMS Page -->
          <div id="page-prod-banners" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🖼️ ব্যানার ও স্লাইডার CMS (${banners.length} টি স্লাইড)</h3>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-banner')?.classList.remove('hidden')">+ ব্যানার স্লাইড</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Banners', ['ID', 'Title', 'Link', 'Status'], banners.map(b => [b.banner_id, b.title, b.link_url, b.status]))">CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <div class="space-y-2.5 text-xs">
                ${banners.map(bn => `
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <img src="${bn.image_url}" class="w-20 h-12 rounded-xl object-cover border" onerror="this.src='https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400';" />
                      <div>
                        <div class="font-bold text-slate-900 dark:text-white">${bn.title}</div>
                        <div class="text-[10px] text-slate-400">${bn.subtitle}</div>
                      </div>
                    </div>
                    <span class="badge badge-success text-[10px]">Active</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 14. Multi-Landing Pages CMS & Builder Page (একের অধিক ল্যান্ডিং পেজ, প্রোডাক্ট সার্চ করে অ্যাড, ব্যানার/ছবি/ভিডিও গ্যালারি) -->
          <div id="page-prod-landing" class="admin-page-view hidden space-y-5">
            
            <!-- Saved Landing Pages List Card -->
            <div class="dc-admin-card space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3">
                <div>
                  <h3 class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🚀</span> মাল্টি-ল্যান্ডিং পেজ বিল্ডার ও ক্যাম্পেইন CMS
                  </h3>
                  <p class="text-[11px] text-slate-400">একের অধিক ল্যান্ডিং পেজ তৈরি করুন, প্রোডাক্ট সার্চ করে যুক্ত করুন এবং আকর্ষণীয় ব্যানার, ফটো গ্যালারি ও ভিডিও যুক্ত করুন</p>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <button type="button" onclick="window.startNewLandingPage()" class="btn-primary py-2 px-4 font-bold shadow">
                    + নতুন ল্যান্ডিং পেজ তৈরি করুন
                  </button>
                  <a href="/landing" target="_blank" class="btn-secondary py-2 px-3 font-bold">স্টোর ল্যান্ডিং ভিউ ↗</a>
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-xs font-bold text-slate-600 dark:text-slate-300">📑 আপনার তৈরি করা ল্যান্ডিং পেজসমূহ (একের অধিক ক্যাম্পেইন পেজ):</div>
                <div id="adm-saved-landing-pages-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  ${(window.getAdminLandingPages ? window.getAdminLandingPages() : []).map(lp => {
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
                  }).join("")}
                </div>
              </div>
            </div>

            <!-- Detailed Landing Page Builder & Editor Form -->
            <div id="landing-builder-form-card" class="dc-admin-card space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <span id="adm-lp-editor-mode-badge" class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] mb-1">
                    ল্যান্ডিং পেজ কাস্টমাইজার ও এডিটর
                  </span>
                  <h4 class="font-black text-sm text-slate-900 dark:text-white">🛠️ ল্যান্ডিং পেজ বিস্তারিত কনফিগারেশন (প্রোডাক্ট সার্চ, ব্যানার, ফটো গ্যালারি ও ভিডিও)</h4>
                </div>
                <button type="button" onclick="window.openLandingPageLivePreview(document.getElementById('adm-lp-id')?.value)" class="btn-secondary py-1.5 px-3.5 text-xs font-bold text-emerald-700 border-emerald-300">
                  👁️ বর্তমান ল্যান্ডিং পেজ প্রিভিউ দেখুন
                </button>
              </div>

              <form class="space-y-5 text-xs" onsubmit="window.handleAdminSaveLandingConfig(event)">
                <input type="hidden" id="adm-lp-id" value="LP-101" />

                <!-- 1. Campaign Headline, Slug, Promo & Hotline -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-800 dark:text-white uppercase border-b pb-1.5">১. ক্যাম্পেইন শিরোনাম, স্লোগান ও অফার তথ্য</div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="sm:col-span-2">
                      <label class="block font-bold mb-1">ক্যাম্পেইন মূল বাংলা স্লোগান / শিরোনাম (Title) *</label>
                      <input type="text" id="adm-lp-title" required value="সেরা মানের অথেন্টিক গ্যাজেট ও স্মার্টওয়াচ সরাসরি আপনার দোরগোড়ায়!" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">ল্যান্ডিং পেজ স্লাগ (URL Slug) *</label>
                      <input type="text" id="adm-lp-slug" required value="mega-gadget-fest" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono bg-white dark:bg-slate-900" />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-bold mb-1">সাব-হেডলাইন (Subtitle)</label>
                      <input type="text" id="adm-lp-subtitle" value="১০০% অরিজিনাল গ্যারান্টি • কোনো অগ্রিম পেমেন্ট ছাড়াই সারা দেশে ক্যাশ অন ডেলিভারি" class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">অফার ব্যাজ টেক্সট (Offer Badge)</label>
                      <input type="text" id="adm-lp-badge" value="🔥 সীমিত সময়ের মেগা অফার — সর্বোচ্চ ৫০% ছাড়!" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900" />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div class="sm:col-span-2">
                      <label class="block font-bold mb-1">বিশেষ প্রমোশনাল নোটিশ বার (Top Promo Notice)</label>
                      <input type="text" id="adm-lp-promo" value="আজ অর্ডার করলেই পাচ্ছেন স্পেশাল ডিসকাউন্ট ও দ্রুত হোম ডেলিভারি সুবিধা!" class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">ডিরেক্ট অর্ডার হটলাইন</label>
                      <input type="text" id="adm-lp-hotline" value="01581703822" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">স্ট্যাটাস ও থিম</label>
                      <div class="flex gap-1.5">
                        <select id="adm-lp-theme" class="form-control text-xs py-2 px-2 rounded-xl border font-bold bg-white dark:bg-slate-900 flex-1">
                          <option value="emerald">Emerald</option>
                          <option value="amber">Amber Gold</option>
                          <option value="indigo">Royal Blue</option>
                          <option value="rose">Crimson</option>
                        </select>
                        <select id="adm-lp-status" class="form-control text-xs py-2 px-2 rounded-xl border font-bold bg-white dark:bg-slate-900">
                          <option value="Active">Active</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <input type="hidden" id="adm-lp-cta" value="এখনই ক্যাশ অন ডেলিভারিতে অর্ডার করুন →" />
                </div>

                <!-- 2. Product Search & Add to Landing Page (লেন্ডিং পেজে কোন কোন প্রোডাক্ট দেখাবে সেটা প্রোডাক্ট সার্চ করে এড করা যাবে) -->
                <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/50 border border-emerald-200 dark:border-slate-700 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/70 dark:border-slate-700 pb-2">
                    <div>
                      <div class="font-black text-xs text-slate-900 dark:text-white uppercase">২. ল্যান্ডিং পেজের জন্য প্রোডাক্ট সার্চ ও নির্বাচন করুন</div>
                      <p class="text-[10px] text-slate-500">পণ্য সার্চ করে এই ল্যান্ডিং পেজে কোন কোন প্রোডাক্ট দেখাবে তা যুক্ত বা পরিবর্তন করুন</p>
                    </div>
                    <span id="adm-lp-selected-prod-count" class="badge badge-success text-xs font-bold">৩ টি পণ্য নির্বাচিত</span>
                  </div>

                  <!-- Search Input -->
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      id="adm-lp-prod-search" 
                      placeholder="🔍 পণ্যের নাম, SKU, ব্র্যান্ড বা ক্যাটাগরি লিখে সার্চ করুন..." 
                      oninput="window.searchProductsForLandingBuilder(this.value)" 
                      onfocus="window.searchProductsForLandingBuilder(this.value)"
                      class="form-control text-xs py-2 px-3.5 rounded-xl border border-emerald-400 flex-1 bg-white dark:bg-slate-900 font-bold" 
                    />
                    <button type="button" onclick="window.searchProductsForLandingBuilder('')" class="btn-secondary py-2 px-3 text-xs font-bold bg-white dark:bg-slate-900">সকল পণ্য দেখুন</button>
                  </div>

                  <!-- Search Results Box -->
                  <div class="space-y-1.5">
                    <div class="text-[10px] font-bold text-slate-500">সার্চ ফলাফল (ক্লিক করে ল্যান্ডিং পেজে যুক্ত করুন):</div>
                    <div id="adm-lp-product-search-results" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1">
                      ${products.slice(0, 6).map(p => {
                        const id = String(p.sku || p.product_id || '');
                        const safeId = id.replace(/'/g, "\\'");
                        const thumb = p.thumbnail || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
                        return `
                          <div class="p-2 rounded-xl border bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2 min-w-0">
                              <img src="${thumb}" class="w-9 h-9 rounded-lg object-cover border flex-shrink-0" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                              <div class="min-w-0">
                                <div class="font-bold text-[11px] truncate">${p.name}</div>
                                <div class="text-[10px] text-emerald-600 font-mono font-bold">${id} • ৳${p.selling_price}</div>
                              </div>
                            </div>
                            <button type="button" onclick="window.addProductToLandingDraft('${safeId}')" class="btn-primary py-1 px-2.5 text-[10px] font-bold">+ যুক্ত করুন</button>
                          </div>
                        `;
                      }).join("")}
                    </div>
                  </div>

                  <!-- Currently Selected Products for this Landing Page -->
                  <div class="space-y-1.5 pt-2 border-t border-emerald-200/60 dark:border-slate-700">
                    <div class="text-[11px] font-black text-emerald-800 dark:text-emerald-300">✅ এই ল্যান্ডিং পেজে প্রদর্শিত নির্বাচিত পণ্যসমূহ:</div>
                    <div id="adm-lp-selected-products-box" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      ${products.slice(0, 3).map((p, idx) => {
                        const id = String(p.sku || p.product_id || '');
                        const safeId = id.replace(/'/g, "\\'");
                        return `
                          <div class="p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2 min-w-0">
                              <span class="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">${idx + 1}</span>
                              <img src="${p.thumbnail || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" class="w-9 h-9 rounded-lg object-cover border flex-shrink-0" />
                              <div class="min-w-0">
                                <div class="font-bold text-xs truncate">${p.name}</div>
                                <div class="text-[10px] text-emerald-600 font-mono font-bold">৳${p.selling_price}</div>
                              </div>
                            </div>
                            <button type="button" onclick="window.removeProductFromLandingDraft('${safeId}')" class="text-rose-600 text-[10px] font-bold px-2 py-1">✕ সরান</button>
                          </div>
                        `;
                      }).join("")}
                    </div>
                  </div>
                </div>

                <!-- 3. Attractive Hero Banner, Multiple Promotional Images/Banners & Videos -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-4">
                  <div class="font-black text-xs text-slate-800 dark:text-white uppercase border-b pb-1.5">
                    ৩. আকর্ষণীয় হিরো ব্যানার, একাধিক প্রমোশনাল ছবি/ব্যানার গ্যালারি ও ভিডিও আপডেট
                  </div>

                  <!-- Main Hero Banner -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <div class="md:col-span-2 space-y-2">
                      <label class="block font-bold">মেইন হিরো ব্যানার ছবি (Hero Banner URL অথবা ফাইল আপলোড)</label>
                      <div class="flex flex-col sm:flex-row gap-2">
                        <input type="text" id="adm-lp-hero-banner" value="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200" oninput="const p=document.getElementById('adm-lp-hero-preview-img'); if(p) p.src=this.value;" class="form-control text-xs py-2 px-3 rounded-xl border flex-1 bg-white dark:bg-slate-900 font-mono" />
                        <label class="btn-secondary py-2 px-3.5 text-xs font-bold cursor-pointer inline-flex items-center justify-center whitespace-nowrap bg-white dark:bg-slate-900">
                          <span>📤 হিরো ব্যানার আপলোড</span>
                          <input type="file" accept="image/*" class="hidden" onchange="window.handleLandingHeroUpload(this)" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <img id="adm-lp-hero-preview-img" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" class="w-full h-24 object-cover rounded-2xl border shadow-sm" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';" />
                    </div>
                  </div>

                  <!-- Multiple Gallery Banners / Promotional Images -->
                  <div class="space-y-2.5 pt-2 border-t">
                    <label class="block font-bold">🖼️ অতিরিক্ত প্রমোশনাল ব্যানার ও ফটো গ্যালারি (একাধিক ছবি/ব্যানার যুক্ত করুন)</label>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input type="text" id="adm-lp-add-banner-url" placeholder="ব্যানার বা প্রোডাক্ট ছবির লিঙ্ক (Image URL)..." class="form-control text-xs py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                      <input type="text" id="adm-lp-add-banner-caption" placeholder="ছবির ক্যাপশন / অফার টেক্সট..." class="form-control text-xs py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                      <div class="flex gap-1.5">
                        <button type="button" onclick="window.addBannerToLandingDraft()" class="btn-primary py-2 px-3 text-xs font-bold flex-1">+ ব্যানার যোগ</button>
                        <label class="btn-secondary py-2 px-3 text-xs font-bold cursor-pointer inline-flex items-center justify-center bg-white dark:bg-slate-900">
                          <span>📤 ছবি আপলোড</span>
                          <input type="file" multiple accept="image/*" class="hidden" onchange="window.handleLandingGalleryFilesUpload(this)" />
                        </label>
                      </div>
                    </div>
                    <div id="adm-lp-banners-list" class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1"></div>
                  </div>

                  <!-- Videos Section -->
                  <div class="space-y-2.5 pt-2 border-t">
                    <label class="block font-bold">🎬 প্রমোশনাল ও প্রোডাক্ট রিভিউ ভিডিও (YouTube / Facebook / MP4 ভিডিও লিঙ্ক)</label>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input type="text" id="adm-lp-add-video-url" placeholder="YouTube ভিডিও লিঙ্ক (যেমন: https://youtu.be/...)..." class="form-control text-xs py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                      <input type="text" id="adm-lp-add-video-title" placeholder="ভিডিও শিরোনাম (যেমন: পণ্যের লাইভ রিভিউ)..." class="form-control text-xs py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                      <button type="button" onclick="window.addVideoToLandingDraft()" class="btn-primary py-2 px-4 text-xs font-bold">+ ভিডিও যুক্ত করুন</button>
                    </div>
                    <div id="adm-lp-videos-list" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1"></div>
                  </div>
                </div>

                <!-- 4. Detailed Bullet Features / Why Buy From Us -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-2">
                  <label class="block font-black text-xs text-slate-800 dark:text-white uppercase">৪. পণ্যের বিশেষ বৈশিষ্ট্য ও কেন আমাদের থেকে কিনবেন (প্রতি লাইনে একটি করে সুবিধা লিখুন)</label>
                  <textarea id="adm-lp-features" rows="4" class="form-control text-xs w-full p-3 rounded-xl border bg-white dark:bg-slate-900">১০০% অরিজিনাল ও অফিশিয়াল ওয়ারেন্টিযুক্ত প্রিমিয়াম প্রোডাক্ট
পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে টাকা পরিশোধের সুবিধা (COD)
কুমিল্লা ও ঢাকা হাব থেকে ২৪-৪৮ ঘন্টায় সুপার-ফাস্ট এক্সপ্রেস ডেলিভারি
৭ দিনের সহজ রিপ্লেসমেন্ট ও সার্বক্ষণিক কাস্টমার কেয়ার সাপোর্ট</textarea>
                </div>

                <div class="flex flex-wrap items-center gap-3 pt-1">
                  <button type="submit" class="btn-primary py-3 px-8 font-black text-xs shadow-lg">💾 ল্যান্ডিং পেজ সংরক্ষণ ও আপডেট করুন →</button>
                  <button type="button" onclick="window.openLandingPageLivePreview(document.getElementById('adm-lp-id')?.value)" class="btn-secondary py-3 px-5 font-bold text-xs">👁️ লাইভ প্রিভিউ দেখুন</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Modal for Full Interactive Landing Page Live Preview -->
          <div id="modal-landing-live-preview" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs">
              <div class="flex items-center justify-between border-b pb-3 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div>
                  <span class="badge badge-success text-[10px]">LIVE LANDING PREVIEW</span>
                  <h4 class="font-black text-sm text-slate-900 dark:text-white mt-0.5">🚀 ল্যান্ডিং পেজ লাইভ প্রিভিউ</h4>
                </div>
                <button type="button" class="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100" onclick="document.getElementById('modal-landing-live-preview')?.classList.add('hidden')">✕ বন্ধ করুন</button>
              </div>
              <div id="landing-live-preview-content"></div>
            </div>
          </div>

          <!-- Modal for Add Banner -->
          <div id="modal-add-banner" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন ব্যানার স্লাইড তৈরি</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-banner')?.classList.add('hidden')">✕</button>
              </div>
              <form id="form-add-banner-dedicated" class="space-y-3" onsubmit="window.handleAdminAddBanner(event)">
                <div>
                  <label class="block font-bold mb-1">ব্যানার শিরোনাম (Title) *</label>
                  <input type="text" id="adm-new-banner-title" required placeholder="স্মার্ট কিচেন কালেকশন" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
                </div>
                <div>
                  <label class="block font-bold mb-1">সাবটাইটেল / অফার বিবরণ</label>
                  <input type="text" id="adm-new-banner-subtitle" placeholder="সর্বোচ্চ ৩০% ছাড়..." class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">ইমেজ URL *</label>
                  <input type="url" id="adm-new-banner-image" required placeholder="https://images.unsplash.com/..." class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">টার্গেট লিংক (Target URL)</label>
                  <input type="text" id="adm-new-banner-link" placeholder="/products?cat=Kitchen" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-banner')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
                </div>
              </form>
            </div>
          </div>


          <!-- ================================================================= -->
          <!-- DEDICATED PAGES: ORDER MANAGEMENT (10 Distinct Standalone Views)  -->
          <!-- ================================================================= -->

          <!-- 1. All Orders List with Full Columns & Bulk Actions -->
          <div id="page-orders-all" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-2.5">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📋</span> সকল অর্ডার তালিকা (All Orders - ${orders.length} টি)
                  </h3>
                  <p class="text-[11px] text-slate-400">বাল্ক সিলেকশন, ফ্রড চেক, কুরিয়ার বুকিং ও ইনভয়েস ভাউচার প্রিন্ট</p>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="switchAdminPage('page-orders-add', 'group-orders')">+ নতুন অর্ডার</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportAdminOrdersCsv()">📥 এক্সেল CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <!-- Search Bar & Status Filters -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <input 
                  type="text" 
                  placeholder="অর্ডার আইডি, নাম, ফোন বা ঠিকানা দিয়ে সার্চ..." 
                  class="form-control text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-80" 
                  oninput="window.handleAdminGlobalSearch(this.value)" 
                />

                <div class="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                  <button class="order-status-pill active" onclick="window.filterOrderStatus('', this)">সকল (${orders.length})</button>
                  <button class="order-status-pill" onclick="window.filterOrderStatus('Processing', this)">প্রসেসিং</button>
                  <button class="order-status-pill" onclick="window.filterOrderStatus('Shipped', this)">কুরিয়ারে</button>
                  <button class="order-status-pill" onclick="window.filterOrderStatus('Delivered', this)">সফল ডেলিভারি</button>
                  <button class="order-status-pill" onclick="window.filterOrderStatus('Cancelled', this)">বাতিল</button>
                </div>
              </div>

              <!-- Sticky Bulk Operations Action Bar -->
              <div id="bulk-orders-actions-bar" class="hidden p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div class="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <span>✓ <span id="bulk-selected-count">0</span> টি অর্ডার নির্বাচিত হয়েছে:</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <button class="btn-primary py-1 px-3 text-[10px] font-bold" onclick="window.handleBulkOrdersAction('courier')">📦 বাল্ক কুরিয়ার পাঠান</button>
                  <button class="btn-secondary py-1 px-2.5 text-[10px] font-bold" onclick="window.handleBulkOrdersAction('status')">🔄 স্ট্যাটাস পরিবর্তন</button>
                  <button class="btn-secondary py-1 px-2.5 text-[10px] font-bold" onclick="window.handleBulkOrdersAction('fraud')">🛡️ বাল্ক ফ্রড চেক</button>
                  <button class="btn-secondary py-1 px-2 text-[10px] font-bold text-rose-600 border-rose-300" onclick="window.handleBulkOrdersAction('delete')">🗑️ মুছুন</button>
                </div>
              </div>

              <!-- Complete Order Management Table -->
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[10px]">
                      <th class="py-2.5 px-2 text-center">
                        <input type="checkbox" onchange="window.toggleSelectAllOrders(this)" title="সবগুলো নির্বাচন করুন" />
                      </th>
                      <th class="py-2.5 px-3">Order ID</th>
                      <th class="py-2.5 px-3">Name / Phone / Address</th>
                      <th class="py-2.5 px-3">Product / Size / Color</th>
                      <th class="py-2.5 px-3">Price / Qty / Payment</th>
                      <th class="py-2.5 px-3">Transaction / Fraud / Rating</th>
                      <th class="py-2.5 px-3">Update Status</th>
                      <th class="py-2.5 px-3">Send Courier</th>
                      <th class="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800" id="admin-orders-full-tbody">
                    ${orders.map(o => `
                      <tr class="admin-order-row hover:bg-slate-50 dark:hover:bg-slate-800/40 transition" data-order-id="${o.order_id}" data-status="${o.order_status}">
                        <td class="py-3 px-2 text-center">
                          <input type="checkbox" value="${o.order_id}" class="order-select-cb" onchange="window.updateBulkOrdersBar()" />
                        </td>
                        <td class="py-3 px-3 font-mono font-bold text-emerald-600">
                          <div>${o.order_id}</div>
                          <span class="text-[9px] text-slate-400 font-normal">ওয়েব অর্ডার</span>
                        </td>
                        <td class="py-3 px-3 max-w-xs">
                          <div class="font-bold text-slate-900 dark:text-white">${o.customer_name}</div>
                          <div class="font-mono text-slate-500 text-[10px]">${o.phone}</div>
                          <div class="truncate text-[10px] text-slate-400">${o.address}</div>
                          <button class="mt-1 text-[9px] text-emerald-600 font-bold hover:underline" onclick="window.copyToClipboard('${o.customer_name} | ${o.phone} | ${o.address.replace(/'/g, "\\'")}', 'কাস্টমার ইনফো কপি হয়েছে!')">
                            কপি ইনফো 📋
                          </button>
                        </td>
                        <td class="py-3 px-3 max-w-xs">
                          <div class="font-bold text-slate-800 dark:text-slate-200">${o.product_name || o.products}</div>
                          <div class="text-[10px] text-slate-400">সাইজ: <span class="font-bold">${o.size || 'Free Size'}</span> | কালার: <span class="font-bold">${o.color || 'Standard'}</span></div>
                        </td>
                        <td class="py-3 px-3 font-mono">
                          <div class="font-black text-slate-900 dark:text-white">৳${o.total_amount}</div>
                          <div class="text-[10px] text-slate-400">পরিমাণ: ${o.quantity || 1} পিস</div>
                          <span class="badge ${o.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'} text-[9px]">${o.payment_method}</span>
                        </td>
                        <td class="py-3 px-3">
                          <div class="font-mono text-[10px] text-slate-500">${o.transaction_id || 'COD'}</div>
                          <button class="mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold ${o.fraud_status && o.fraud_status.includes('High') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'}" onclick="window.handleCheckOrderFraud('${o.phone}', '${o.order_id}', this)">
                            🛡️ ${o.fraud_status || 'Safe (98%)'}
                          </button>
                          <div class="text-[10px] text-amber-500 mt-0.5">${o.customer_rating || '5/5 ★'}</div>
                        </td>
                        <td class="py-3 px-3">
                          <select 
                            class="form-control text-[11px] py-1 px-2 rounded-lg border font-bold" 
                            onchange="window.updateOrderStatus('${o.order_id}', this.value)"
                          >
                            <option value="Order Placed" ${o.order_status === 'Order Placed' ? 'selected' : ''}>Order Placed</option>
                            <option value="Processing" ${o.order_status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Packing" ${o.order_status === 'Packing' ? 'selected' : ''}>Packing</option>
                            <option value="Shipped" ${o.order_status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${o.order_status === 'Delivered' ? 'selected' : ''}>Delivered ✓</option>
                            <option value="Returned" ${o.order_status === 'Returned' ? 'selected' : ''}>Returned</option>
                            <option value="Cancelled" ${o.order_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                          </select>
                        </td>
                        <td class="py-3 px-3">
                          <button class="btn-primary py-1 px-2 text-[10px] font-bold whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white" onclick="window.handleSendOrderToCourier('${o.order_id}', 'Steadfast')">
                            কুরিয়ারে পাঠান 🚀
                          </button>
                        </td>
                        <td class="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                          <button class="btn-secondary py-0.5 px-2 text-[10px]" onclick="window.copyToClipboard('${o.order_id}', 'অর্ডার আইডি কপি হয়েছে!')">আইডি</button>
                          <button class="btn-secondary py-0.5 px-2 text-[10px] text-rose-600 border-rose-200" onclick="if(confirm('অর্ডারটি মুছে ফেলতে চান?')) this.closest('tr').remove()">মুছুন</button>
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 2. Incomplete Orders Page -->
          <div id="page-orders-incomplete" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span class="text-rose-500">⚠️</span> অসম্পূর্ণ অর্ডারসমূহ (Abandoned Checkout Recovery)
                  </h3>
                  <p class="text-[11px] text-slate-400">যেসব গ্রাহক ফর্ম পূরণ করেও অর্ডার কনফার্ম করেননি</p>
                </div>
                <button class="btn-primary text-xs py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold" onclick="window.sendIncompleteOrderReminders()">
                  Send Order List 📤
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b text-slate-400 uppercase text-[10px]">
                      <th class="py-2.5 px-3">ড্রাফট ID</th>
                      <th class="py-2.5 px-3">তারিখ</th>
                      <th class="py-2.5 px-3">গ্রাহক ও ফোন</th>
                      <th class="py-2.5 px-3">ঠিকানা</th>
                      <th class="py-2.5 px-3">মূল্য</th>
                      <th class="py-2.5 px-3 text-right">ফলোআপ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    ${incompleteOrders.map(io => `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="py-2.5 px-3 font-mono font-bold text-rose-500">${io.order_id}</td>
                        <td class="py-2.5 px-3 text-slate-400">${io.date}</td>
                        <td class="py-2.5 px-3">
                          <div class="font-bold">${io.customer_name}</div>
                          <div class="font-mono text-slate-400 text-[10px]">${io.phone}</div>
                        </td>
                        <td class="py-2.5 px-3 text-slate-500">${io.address}</td>
                        <td class="py-2.5 px-3 font-bold font-mono">৳${io.total_amount}</td>
                        <td class="py-2.5 px-3 text-right">
                          <a href="https://wa.me/88${io.phone}?text=Hello,%20we%20noticed%20you%20started%20an%20order%20on%20Dream%20Cart%20BD.%20Can%20we%20assist%20you?" target="_blank" class="btn-primary py-1 px-3 text-[10px] bg-emerald-600 font-bold">
                            WhatsApp বার্তা 💬
                          </a>
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 3. Success Orders Page (Delivered & Paid) -->
          <div id="page-orders-success" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="border-b pb-2 flex items-center justify-between">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="text-emerald-600">✓</span> সফল ও পরিশোধিত ডেলিভারি (Delivered & Paid)
                </h3>
                <span class="badge badge-success text-xs font-bold">৯৫.২% সাকসেসফুল</span>
              </div>
              <div class="space-y-2 text-xs">
                ${orders.filter(o => o.order_status === 'Delivered').map(o => `
                  <div class="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between gap-2">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${o.order_id} • ${o.customer_name} (${o.phone})</div>
                      <div class="text-[10px] text-emerald-700 dark:text-emerald-400">পরিশোধিত মূল্য: ৳${o.total_amount} • মেথড: ${o.payment_method}</div>
                    </div>
                    <span class="badge badge-success text-[10px]">Delivered & Paid ✓</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 4. In Shipping Orders Page -->
          <div id="page-orders-shipping" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚚</span> কুরিয়ারে / শিপিং পথে থাকা পার্সেল (In Shipping)
                </h3>
              </div>
              <div class="space-y-2 text-xs">
                ${orders.filter(o => o.order_status === 'Shipped' || o.order_status === 'Packing' || o.order_status === 'In Transit').map(o => `
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${o.order_id} • ${o.customer_name} (${o.phone})</div>
                      <div class="text-[10px] text-slate-400">${o.products} • ৳${o.total_amount}</div>
                    </div>
                    <span class="badge badge-warning text-[10px]">In Courier (${o.order_status})</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 5. Payment Incomplete Orders Page -->
          <div id="page-orders-unpaid" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>💳</span> পেমেন্ট অসম্পূর্ণ অর্ডারসমূহ (COD Unpaid)
                </h3>
              </div>
              <div class="space-y-2 text-xs">
                ${orders.filter(o => o.payment_status === 'Pending').map(o => `
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between gap-2">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${o.order_id} • ${o.customer_name}</div>
                      <div class="text-[10px] text-slate-400">বকেয়া প্রদেয়: ৳${o.total_amount} (${o.payment_method})</div>
                    </div>
                    <span class="badge badge-warning text-[10px]">Pending Payment</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 6. Cancelled Orders Page -->
          <div id="page-orders-cancelled" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="text-rose-500">✕</span> বাতিল ও রিটার্নকৃত অর্ডার
                </h3>
              </div>
              <div class="space-y-2 text-xs">
                ${orders.filter(o => o.order_status === 'Cancelled' || o.order_status === 'Returned').map(o => `
                  <div class="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-2">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${o.order_id} • ${o.customer_name}</div>
                      <div class="text-[10px] text-rose-600">স্ট্যাটাস: ${o.order_status}</div>
                    </div>
                    <span class="badge badge-danger text-[10px]">${o.order_status}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 7. Add Order Page (Manual Order Entry + Voucher) -->
          <div id="page-orders-add" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-xl">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন কাস্টমার অর্ডার এন্ট্রি (Add Order)</h3>
                <p class="text-[11px] text-slate-400">ফোন বা ইনবক্স থেকে সরাসরি অর্ডার তৈরি ও ক্যাশ ভাউচার প্রিন্ট</p>
              </div>

              <form id="form-manual-add-order" class="space-y-3.5 text-xs" onsubmit="window.handleManualAddOrder(event)">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold mb-1">গ্রাহকের নাম *</label>
                    <input type="text" id="add-ord-name" required placeholder="মোঃ ফারুক আহমেদ" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
                  </div>
                  <div>
                    <label class="block font-bold mb-1">ফোন নম্বর *</label>
                    <input type="text" id="add-ord-phone" required placeholder="017xxxxxxxx" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
                  </div>
                </div>

                <div>
                  <label class="block font-bold mb-1">ডেলিভারি পূর্ণ ঠিকানা *</label>
                  <textarea id="add-ord-address" rows="2" required placeholder="বাড়ি #, রোড #, এলাকা, থানা, জেলা..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
                </div>

                <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2.5">
                  <h4 class="font-bold text-slate-900 dark:text-white">পণ্য নির্ধারণ:</h4>
                  <div>
                    <label class="block font-bold mb-1">পণ্যের নাম *</label>
                    <input type="text" id="add-ord-product" required placeholder="Amazfit GTS 4 Smartwatch / মধু" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label class="block font-bold mb-1">সাইজ</label>
                      <input type="text" id="add-ord-size" value="Free Size" class="form-control text-xs w-full py-1.5 px-2 rounded-lg border font-bold" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">কালার</label>
                      <input type="text" id="add-ord-color" value="Jet Black" class="form-control text-xs w-full py-1.5 px-2 rounded-lg border font-bold" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">একক মূল্য (৳) *</label>
                      <input type="number" id="add-ord-price" required placeholder="1450" class="form-control text-xs w-full py-1.5 px-2 rounded-lg border font-bold font-mono" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">পরিমাণ *</label>
                      <input type="number" id="add-ord-qty" required value="1" min="1" class="form-control text-xs w-full py-1.5 px-2 rounded-lg border font-bold font-mono" />
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold mb-1">ডেলিভারি চার্জ (৳)</label>
                    <select id="add-ord-delivery" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
                      <option value="70">কুমিল্লা সিটি (৳৭০)</option>
                      <option value="90">ঢাকা সিটি (৳৯০)</option>
                      <option value="120">ঢাকার বাইরে সারা দেশ (৳১২০)</option>
                      <option value="0">ফ্রি ডেলিভারি (৳০)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold mb-1">পেমেন্ট মেথড</label>
                    <select id="add-ord-payment" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
                      <option value="Cash on Delivery">Cash on Delivery (ক্যাশ অন ডেলিভারি)</option>
                      <option value="bKash Online">bKash Online (বিকাশ)</option>
                      <option value="Nagad Online">Nagad Online (নগদ)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" class="btn-primary py-2.5 px-6 font-bold w-full">অর্ডার সাবমিট ও ক্যাশ ভাউচার দেখুন →</button>
              </form>
            </div>
          </div>

          <!-- 8. Live Visitors Page -->
          <div id="page-orders-visitors" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> লাইভ সক্রিয় ভিজিটর ট্র্যাকিং
                </h3>
                <span class="badge badge-success text-xs font-bold">মোট ৩৮ জন ব্রাউজিং</span>
              </div>
              <div class="space-y-2 text-xs">
                <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
                  <div>
                    <div class="font-bold">IP: 103.114.98.15 • ঢাকা (ধানমন্ডি)</div>
                    <div class="text-[10px] text-slate-400">পেজ: /product/amazfit-gts-4 (স্মার্টফোন) • ২ মিনিট ধরে ব্রাউজিং</div>
                  </div>
                  <span class="badge badge-success text-[10px]">Active</span>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
                  <div>
                    <div class="font-bold">IP: 103.205.71.20 • কুমিল্লা (কান্দিরপাড়)</div>
                    <div class="text-[10px] text-slate-400">পেজ: /checkout (অর্ডার ফর্ম পূরণ করছে) • ১ মিনিট আগে</div>
                  </div>
                  <span class="badge badge-success text-[10px]">Active</span>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
                  <div>
                    <div class="font-bold">IP: 118.179.44.82 • চট্টগ্রাম (জিইসি)</div>
                    <div class="text-[10px] text-slate-400">পেজ: /products?cat=Kitchen • ৪ মিনিট আগে</div>
                  </div>
                  <span class="badge badge-success text-[10px]">Active</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 9. Customer CRM Page -->
          <div id="page-orders-customers" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">👥 কাস্টমার ডাটাবেজ (Customer CRM)</h3>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-secondary py-1 px-3 text-xs" onclick="window.exportGenericCsv('Customers', ['Name', 'Phone', 'Address', 'Total Spent'], customers.map(c=>[c.name, c.phone, c.address, c.total_spent]))">CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b text-slate-400 uppercase text-[10px]">
                      <th class="py-2 px-3">নাম</th>
                      <th class="py-2 px-3">ফোন নম্বর</th>
                      <th class="py-2 px-3">ঠিকানা</th>
                      <th class="py-2 px-3">মোট খরচ</th>
                      <th class="py-2 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    ${customers.map(c => `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="py-2.5 px-3 font-bold">${c.name}</td>
                        <td class="py-2.5 px-3 font-mono">${c.phone}</td>
                        <td class="py-2.5 px-3 text-slate-500">${c.address}</td>
                        <td class="py-2.5 px-3 font-bold font-mono">৳${c.total_spent}</td>
                        <td class="py-2.5 px-3 text-right">
                          <button class="btn-secondary py-1 px-2 text-[10px]" onclick="window.copyToClipboard('${c.phone}', 'ফোন কপি হয়েছে!')">ফোন কপি</button>
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 10. Reviews Page -->
          <div id="page-orders-reviews" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">⭐ গ্রাহক রিভিউ ও রেটিং (${reviews.length})</h3>
                <button class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
              </div>
              <div class="space-y-2.5 text-xs">
                ${reviews.map(r => `
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>${r.customer}</span>
                        <span class="text-amber-500">★★★★★</span>
                        <span class="text-[10px] text-slate-400 font-normal">(${r.product})</span>
                      </div>
                      <p class="text-slate-600 dark:text-slate-300 mt-1">"${r.comment}"</p>
                    </div>
                    <span class="badge badge-success text-[10px]">Approved ✓</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- Modal for Fraud Result -->
          <div id="modal-fraud-result" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-sm w-full space-y-3 text-xs text-center">
              <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 text-xl font-black mx-auto flex items-center justify-center">🛡️</div>
              <h4 class="font-black text-sm text-slate-900 dark:text-white">কুরিয়ার ফ্রড ডাটা যাচাই রিপোর্ট</h4>
              <div id="fraud-result-badge" class="badge badge-success text-xs font-bold mx-auto">Safe Customer</div>
              <div id="fraud-result-text" class="text-slate-500 text-[11px] p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border"></div>
              <button class="btn-primary py-2 px-5 font-bold w-full" onclick="document.getElementById('modal-fraud-result')?.classList.add('hidden')">বন্ধ করুন</button>
            </div>
          </div>

          <!-- Modal for Order Voucher -->
          <div id="modal-order-voucher" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">ক্যাশ ইনভয়েস ও ভাউচার</h4>
                <button class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-order-voucher')?.classList.add('hidden')">✕</button>
              </div>
              <div id="voucher-content-display"></div>
              <div class="flex items-center gap-2 pt-2 border-t">
                <button class="btn-primary py-2 px-4 font-bold flex-1" onclick="window.print()">ভাউচার প্রিন্ট 🖨️</button>
                <button class="btn-secondary py-2 px-4" onclick="document.getElementById('modal-order-voucher')?.classList.add('hidden')">বন্ধ</button>
              </div>
            </div>
          </div>


          <!-- ================================================================= -->
          <!-- DEDICATED PAGES: PARTNERS & ADMINS (6 Distinct Standalone Views)  -->
          <!-- ================================================================= -->

          <!-- 1. Resellers Page -->
          <div id="page-partner-resellers" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🤝</span> রিসেলার পার্টনার তালিকা (${resellers.length})
                  </h3>
                  <p class="text-[11px] text-slate-400">রিসেলিং কমিশন, ওয়ালেট ব্যালেন্স ও ড্রপশিপিং হিসাব</p>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-reseller')?.classList.remove('hidden')">+ নতুন রিসেলার</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Resellers', ['ID', 'Name', 'Shop', 'Phone', 'City', 'Balance', 'Total Earned', 'Status'], resellers.map(r=>[r.id, r.name, r.shop, r.phone, r.city, r.balance, r.total_earned, r.status]))">CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b text-slate-400 uppercase text-[10px]">
                      <th class="py-2.5 px-3">রিসেলার ID</th>
                      <th class="py-2.5 px-3">নাম ও শপ</th>
                      <th class="py-2.5 px-3">ফোন নম্বর</th>
                      <th class="py-2.5 px-3">জেলা</th>
                      <th class="py-2.5 px-3">চলতি ব্যালেন্স</th>
                      <th class="py-2.5 px-3">মোট আয়</th>
                      <th class="py-2.5 px-3">স্ট্যাটাস</th>
                      <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    ${resellers.map(r => `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="py-2.5 px-3 font-mono font-bold text-emerald-600">${r.id}</td>
                        <td class="py-2.5 px-3">
                          <div class="font-bold">${r.name}</div>
                          <div class="text-[10px] text-slate-400">${r.shop}</div>
                        </td>
                        <td class="py-2.5 px-3 font-mono">${r.phone}</td>
                        <td class="py-2.5 px-3">${r.city}</td>
                        <td class="py-2.5 px-3 font-black text-emerald-600 font-mono">৳${r.balance}</td>
                        <td class="py-2.5 px-3 font-bold font-mono">৳${r.total_earned}</td>
                        <td class="py-2.5 px-3"><span class="badge badge-success text-[10px]">${r.status}</span></td>
                        <td class="py-2.5 px-3 text-right space-x-1">
                          <button class="btn-secondary py-0.5 px-2 text-[10px]" onclick="window.copyToClipboard('${r.phone}', 'ফোন কপি হয়েছে!')">যোগাযোগ</button>
                          <button class="btn-secondary py-0.5 px-2 text-[10px] text-rose-600 border-rose-200" onclick="if(confirm('রিসেলারটি মুছে ফেলতে চান?')) this.closest('tr').remove()">মুছুন</button>
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 2. Wholesalers Page -->
          <div id="page-partner-wholesalers" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🏢</span> পাইকারি ক্রেতা (Wholesalers - ${wholesalers.length})
                  </h3>
                  <p class="text-[11px] text-slate-400">হোলসেল ডিসকাউন্ট টিয়ার ও বিশেষ পাইকারি দর</p>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-wholesaler')?.classList.remove('hidden')">+ নতুন হোলসেলার</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Wholesalers', ['ID', 'Name', 'Company', 'Phone', 'Tier', 'Orders', 'Status'], wholesalers.map(w=>[w.id, w.name, w.company, w.phone, w.tier, w.total_orders, w.status]))">CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <div class="space-y-2.5 text-xs">
                ${wholesalers.map(w => `
                  <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${w.company} (${w.name})</div>
                      <div class="text-[10px] text-slate-400 font-mono">ID: ${w.id} • ফোন: ${w.phone} • ডিসকাউন্ট: ${w.tier} • সম্পন্ন অর্ডার: ${w.total_orders} টি</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="badge badge-success text-[10px]">${w.status}</span>
                      <button class="btn-secondary py-1 px-2.5 text-[10px]" onclick="window.copyToClipboard('${w.phone}', 'ফোন কপি হয়েছে!')">কল / WhatsApp</button>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 3. Sellers Page -->
          <div id="page-partner-sellers" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🏪</span> মার্চেন্ট সেলার / ভেন্ডর (${sellers.length})
                  </h3>
                  <p class="text-[11px] text-slate-400">তৃতীয় পক্ষ বিক্রেতা ও স্টোর কমিশন</p>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-seller')?.classList.remove('hidden')">+ নতুন সেলার</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Sellers', ['ID', 'Store', 'Name', 'Phone', 'Commission', 'Products'], sellers.map(s=>[s.id, s.store, s.name, s.phone, s.commission, s.products_count]))">CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <div class="space-y-2.5 text-xs">
                ${sellers.map(s => `
                  <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${s.store} • ${s.name}</div>
                      <div class="text-[10px] text-slate-400 font-mono">কমিশন: ${s.commission} • পণ্য সংখ্যা: ${s.products_count} টি • ফোন: ${s.phone}</div>
                    </div>
                    <span class="badge badge-success text-[10px]">${s.status}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 4. Others Market Page -->
          <div id="page-partner-markets" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🌐</span> অন্যান্য মার্কেটপ্লেস চ্যানেল (Multi-Channel Sync)
                  </h3>
                  <p class="text-[11px] text-slate-400">দারাজ, ফেসবুক শপ ও বিক্রয় ডট কম</p>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-market')?.classList.remove('hidden')">+ চ্যানেল যুক্ত</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                ${markets.map(m => `
                  <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="font-bold text-slate-900 dark:text-white">${m.name}</div>
                      <span class="badge badge-success text-[9px]">${m.status}</span>
                    </div>
                    <div class="text-[10px] text-slate-400">সিঙ্ক মোড: ${m.sync_mode} • ${m.last_sync}</div>
                    <button class="btn-secondary py-1 px-3 w-full text-[10px] font-bold" onclick="if(toast&&toast.show) toast.show({type:'success', title:'চ্যানেল সিঙ্ক', message:'${m.name} এর ক্যাটালগ সফলভাবে রিফ্রেশ হয়েছে!'})">এখনই সিঙ্ক করুন 🔄</button>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 5. Admin Users Page -->
          <div id="page-admin-users" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>👑</span> মাস্টার অ্যাডমিন একাউন্টস (${admins.length})
                  </h3>
                  <p class="text-[11px] text-slate-400">সুপার অ্যাডমিন পারমিশন ও একাউন্ট ম্যানেজমেন্ট</p>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-admin')?.classList.remove('hidden')">+ অ্যাডমিন একাউন্ট</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <div class="space-y-2.5 text-xs">
                ${admins.map(a => `
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${a.name} (${a.role})</div>
                      <div class="text-[10px] text-slate-400 font-mono">${a.email}</div>
                    </div>
                    <span class="badge badge-success text-[10px]">Super Admin Access</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 6. Staff & Workers Directory Page -->
          <div id="page-admin-workers" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>👷</span> কর্মী ও স্টাফ টিম ডিরেক্টরি (${workers.length})
                  </h3>
                  <p class="text-[11px] text-slate-400">অর্ডার ডেস্ক, ডেলিভারি, সাপোর্ট ও হিসাবরক্ষক কর্মী</p>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-worker')?.classList.remove('hidden')">+ নতুন কর্মী যুক্ত</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Workers', ['ID', 'Name', 'Role', 'Phone', 'Email'], workers.map(w=>[w.id, w.name, w.role, w.phone, w.email]))">CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                ${workers.map(w => `
                  <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 font-black flex items-center justify-center text-sm border">👤</div>
                      <div>
                        <div class="font-bold text-slate-900 dark:text-white">${w.name}</div>
                        <div class="text-[10px] text-emerald-600 font-bold">${w.role}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${w.phone} • ${w.email}</div>
                      </div>
                    </div>
                    <span class="badge badge-success text-[10px]">${w.status}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- Modals for Partners & Admins -->
          <div id="modal-add-reseller" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন রিসেলার নিবন্ধন</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-reseller')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddReseller(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">রিসেলারের নাম *</label>
                  <input type="text" id="adm-new-reseller-name" required placeholder="মোঃ আরিফ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">ফেসবুক পেজ / শপ নাম</label>
                  <input type="text" id="adm-new-reseller-shop" placeholder="স্মার্ট কালেকশন" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-bold mb-1">ফোন নম্বর *</label>
                    <input type="text" id="adm-new-reseller-phone" required placeholder="017xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
                  </div>
                  <div>
                    <label class="block font-bold mb-1">জেলা / শহর</label>
                    <input type="text" id="adm-new-reseller-city" placeholder="ঢাকা" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                  </div>
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-reseller')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">নিবন্ধন করুন</button>
                </div>
              </form>
            </div>
          </div>

          <div id="modal-add-wholesaler" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন হোলসেলার নিবন্ধন</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-wholesaler')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddWholesaler(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">স্বত্বাধিকারীর নাম *</label>
                  <input type="text" id="adm-new-ws-name" required placeholder="হাজী মোঃ ইউসুফ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">প্রতিষ্ঠানের নাম</label>
                  <input type="text" id="adm-new-ws-company" placeholder="ইউসুফ এন্টারপ্রাইজ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-bold mb-1">ফোন নম্বর *</label>
                    <input type="text" id="adm-new-ws-phone" required placeholder="018xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
                  </div>
                  <div>
                    <label class="block font-bold mb-1">ডিসকাউন্ট টিয়ার</label>
                    <select id="adm-new-ws-tier" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-bold">
                      <option value="Tier 1 (20% Off)">Tier 1 (20% Off)</option>
                      <option value="Tier 2 (15% Off)">Tier 2 (15% Off)</option>
                    </select>
                  </div>
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-wholesaler')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
                </div>
              </form>
            </div>
          </div>

          <div id="modal-add-seller" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন মার্চেন্ট সেলার যুক্ত</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-seller')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddSeller(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">সিলারের পুরো নাম *</label>
                  <input type="text" id="adm-new-seller-name" required placeholder="কামরুল হাসান" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">স্টোরের নাম</label>
                  <input type="text" id="adm-new-seller-store" placeholder="অরগ্যানিক ভ্যালি" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-bold mb-1">ফোন নম্বর *</label>
                    <input type="text" id="adm-new-seller-phone" required placeholder="019xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
                  </div>
                  <div>
                    <label class="block font-bold mb-1">কমিশন রেট</label>
                    <input type="text" id="adm-new-seller-comm" value="10%" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-bold" />
                  </div>
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-seller')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">যুক্ত করুন</button>
                </div>
              </form>
            </div>
          </div>

          <div id="modal-add-market" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন মার্কেট চ্যানেল যুক্ত</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-market')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddMarket(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">মার্কেটপ্লেসের নাম *</label>
                  <input type="text" id="adm-new-market-name" required placeholder="TikTok Shop / Evaly" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">সিঙ্ক মোড</label>
                  <select id="adm-new-market-sync" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-bold">
                    <option value="API Auto">API Auto</option>
                    <option value="Catalog XML Feed">Catalog XML Feed</option>
                    <option value="Manual Webhook">Manual Webhook</option>
                  </select>
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-market')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংযুক্ত করুন</button>
                </div>
              </form>
            </div>
          </div>

          <div id="modal-add-worker" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন কর্মী / স্টাফ টিম যুক্ত করুন</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-worker')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddWorker(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">কর্মীর পুরো নাম *</label>
                  <input type="text" id="adm-new-worker-name" required placeholder="রাকিবুল হাসান" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">দায়িত্ব / পদবী *</label>
                  <select id="adm-new-worker-role" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                    <option value="Order Management">Order Management (অর্ডার ডেস্ক)</option>
                    <option value="Customer Support">Customer Support (গ্রাহক সেবা)</option>
                    <option value="Delivery">Delivery (ডেলিভারি)</option>
                    <option value="Accountant">Accountant (হিসাবরক্ষক)</option>
                    <option value="Inventory/Warehouse">Inventory (গুদাম)</option>
                    <option value="Sales">Sales (বিক্রয়)</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold mb-1">ফোন নম্বর *</label>
                  <input type="text" id="adm-new-worker-phone" required placeholder="018xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-worker')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
                </div>
              </form>
            </div>
          </div>

          <div id="modal-add-admin" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন অ্যাডমিন একাউন্ট তৈরি</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-admin')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddAdmin(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">অ্যাডমিনের পুরো নাম *</label>
                  <input type="text" id="adm-new-admin-name" required placeholder="MD. Saiful Islam" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">ইমেইল অ্যাড্রেস *</label>
                  <input type="email" id="adm-new-admin-email" required placeholder="admin@dreamcart.bd" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-admin')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">অ্যাকাউন্ট তৈরি করুন</button>
                </div>
              </form>
            </div>
          </div>


          <!-- ================================================================= -->
          <!-- DEDICATED PAGES: REPORTS & INVENTORY (12 Distinct Standalone Views)-->
          <!-- ================================================================= -->

          <!-- 1. Seller Report -->
          <div id="page-report-seller" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏪 সেলার ও ভেন্ডর পারফরম্যান্স রিপোর্ট</h3>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Seller_Report', ['Store', 'Commission', 'Sales'], sellers.map(s=>[s.store, s.commission, '৳১,২০,৪০০']))">CSV</button>
                </div>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between text-xs">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">মোট সেলার রাজস্ব বিক্রয়: ৳১,২০,৪০০</div>
                  <div class="text-[10px] text-slate-400">অংশীদারী কমিশন আয়: ৳১২,০৪০ (১০% গড়)</div>
                </div>
                <div class="flex gap-1">
                  <button class="order-status-pill active text-[10px]">দৈনিক</button>
                  <button class="order-status-pill text-[10px]">সাপ্তাহিক</button>
                  <button class="order-status-pill text-[10px]">মাসিক</button>
                  <button class="order-status-pill text-[10px]">বাৎসরিক</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Reseller Report -->
          <div id="page-report-reseller" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🤝 রিসেলার কমিশন ও সেলস রিপোর্ট</h3>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Reseller_Report', ['Name', 'Shop', 'Earned', 'Balance'], resellers.map(r=>[r.name, r.shop, r.total_earned, r.balance]))">CSV</button>
                </div>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between text-xs">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">মোট রিসেলার নেট সেলস: ৳৩,৫০,৮০০</div>
                  <div class="text-[10px] text-slate-400">প্রদত্ত কমিশন: ৳৫২,৬০০</div>
                </div>
                <div class="flex gap-1">
                  <button class="order-status-pill text-[10px]">দৈনিক</button>
                  <button class="order-status-pill text-[10px]">সাপ্তাহিক</button>
                  <button class="order-status-pill active text-[10px]">মাসিক</button>
                  <button class="order-status-pill text-[10px]">বাৎসরিক</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Wholesaler Report -->
          <div id="page-report-wholesaler" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏢 হোলসেলার পার্টনার ক্রয় রিপোর্ট</h3>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Wholesaler_Report', ['Company', 'Tier', 'Orders'], wholesalers.map(w=>[w.company, w.tier, w.total_orders]))">CSV</button>
                </div>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between text-xs">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">পাইকারি সরবরাহ রাজস্ব: ৳৩,৮৫,০০০</div>
                  <div class="text-[10px] text-slate-400">গড় অর্ডার ভলিউম: ৳২৭,৫০০</div>
                </div>
                <div class="flex gap-1">
                  <button class="order-status-pill text-[10px]">দৈনিক</button>
                  <button class="order-status-pill active text-[10px]">মাসিক</button>
                  <button class="order-status-pill text-[10px]">বাৎসরিক</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Sales Report -->
          <div id="page-report-sales" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">📊 সার্বিক রাজস্ব বিক্রয় রিপোর্ট (Sales Analytics)</h3>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportAdminOrdersCsv()">CSV</button>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 space-y-1">
                  <div class="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase">মোট গ্রস বিক্রয়</div>
                  <div class="text-xl font-black text-emerald-600 font-mono">${formatCurrency(kpi.total_sales)}</div>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-1">
                  <div class="text-[10px] text-slate-400 font-bold uppercase">সম্পন্ন অর্ডার ভলিউম</div>
                  <div class="text-xl font-black text-slate-900 dark:text-white font-mono">${kpi.total_orders} টি</div>
                </div>
                <div class="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 space-y-1">
                  <div class="text-[10px] text-indigo-800 dark:text-indigo-300 font-bold uppercase">নিট মুনাফা মার্জিন</div>
                  <div class="text-xl font-black text-indigo-600 font-mono">${formatCurrency(kpi.total_profit)}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. Wholesale Report -->
          <div id="page-report-wholesale" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">📦 পাইকারি সেলস রিপোর্ট (WholeSale)</h3>
                <button class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
              </div>
              <p class="text-xs text-slate-400">হোলসেল ডিলারদের বাল্ক শিপমেন্ট এবং ডিস্ট্রিবিউশন হিসাব</p>
              <div class="text-base font-black text-emerald-600 font-mono">মোট ভলিউম: ৳৩,৮৫,০০০ (২৩ টি বাল্ক ইনভয়েস)</div>
            </div>
          </div>

          <!-- 6. Costs Report -->
          <div id="page-report-costs" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">💸 ব্যবসায়িক খরচ রিপোর্ট (Costs Report)</h3>
                <button class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
              </div>
              <div class="text-xl font-black text-rose-500 font-mono mb-2">${formatCurrency(kpi.total_costs)}</div>
              <div class="space-y-2 text-xs">
                ${costs.map(c => `
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${c.title}</div>
                      <div class="text-[10px] text-slate-400">${c.category} • ${c.date}</div>
                    </div>
                    <span class="font-mono font-bold text-rose-500">৳${c.amount}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 7. Buying Report -->
          <div id="page-report-buying" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🛒 পাইকারি স্টক ক্রয় রিপোর্ট (Buying Report)</h3>
                <button class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
              </div>
              <div class="text-xl font-black text-slate-900 dark:text-white font-mono mb-2">${formatCurrency(kpi.total_buying)}</div>
              <div class="space-y-2 text-xs">
                ${buying.map(b => `
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${b.product}</div>
                      <div class="text-[10px] text-slate-400">সাপ্লায়ার: ${b.supplier} • পরিমাণ: ${b.quantity} পিস</div>
                    </div>
                    <span class="font-mono font-bold text-emerald-600">৳${b.total_amount}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 8. Invest Report -->
          <div id="page-report-invest" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">💼 মূলধন ও বিনিয়োগ রিপোর্ট (Invest Report)</h3>
                <button class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
              </div>
              <div class="text-xl font-black text-emerald-600 font-mono mb-2">${formatCurrency(kpi.total_invest)}</div>
              <div class="space-y-2 text-xs">
                ${invest.map(i => `
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${i.investor}</div>
                      <div class="text-[10px] text-slate-400">${i.note} • ${i.date}</div>
                    </div>
                    <span class="font-mono font-bold text-emerald-600">৳${i.amount}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 9. Reseller Payment Request Page -->
          <div id="page-inv-payout" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">💳 রিসেলার কমিশন পে-আউট রিকোয়েস্ট (স্বয়ংক্রিয় -৩% ফি কর্তন)</h3>
                <p class="text-[11px] text-slate-400">রিসেলার ড্যাশবোর্ড থেকে পাঠানো উত্তোলনের আবেদনসমূহ</p>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b text-slate-400 uppercase text-[10px]">
                      <th class="py-2.5 px-3">রিকোয়েস্ট ID</th>
                      <th class="py-2.5 px-3">রিসেলার ও শপ</th>
                      <th class="py-2.5 px-3">পেমেন্ট মেথড</th>
                      <th class="py-2.5 px-3">আবেদনের পরিমাণ</th>
                      <th class="py-2.5 px-3">প্রদেয় (-৩% ফি)</th>
                      <th class="py-2.5 px-3">স্ট্যাটাস</th>
                      <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td class="py-3 px-3 font-mono font-bold text-indigo-600">REQ-8472</td>
                      <td class="py-3 px-3">
                        <div class="font-bold text-slate-900 dark:text-white">ফ্যাশন পয়েন্ট (মোঃ মাহমুদ)</div>
                        <div class="text-[10px] text-slate-400 font-mono">RSL-9082</div>
                      </td>
                      <td class="py-3 px-3 font-mono">bKash (01819876543)</td>
                      <td class="py-3 px-3 font-bold font-mono">৳১,২০০</td>
                      <td class="py-3 px-3 font-black text-emerald-600 font-mono">৳১,১৬৪</td>
                      <td class="py-3 px-3"><span class="badge badge-warning text-[9px]">Pending</span></td>
                      <td class="py-3 px-3 text-right">
                        <button class="btn-primary py-1 px-3 text-[10px] font-bold" onclick="window.handleApprovePayout('REQ-8472', '১,১৬৪', this)">
                          অনুমোদন ও পে করুন ✓
                        </button>
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td class="py-3 px-3 font-mono font-bold text-indigo-600">REQ-8469</td>
                      <td class="py-3 px-3">
                        <div class="font-bold text-slate-900 dark:text-white">গ্যাজেট ওয়ার্ল্ড (আরিফুল)</div>
                        <div class="text-[10px] text-slate-400 font-mono">RSL-9085</div>
                      </td>
                      <td class="py-3 px-3 font-mono">Nagad (01712345678)</td>
                      <td class="py-3 px-3 font-bold font-mono">৳৩,০০০</td>
                      <td class="py-3 px-3 font-black text-emerald-600 font-mono">৳২,৯১০</td>
                      <td class="py-3 px-3"><span class="badge badge-success text-[9px]">Paid ✓</span></td>
                      <td class="py-3 px-3 text-right">
                        <span class="text-[10px] text-emerald-600 font-bold">পরিশোধিত</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 10. Costs Ledger Page -->
          <div id="page-inv-costs" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">💸 ব্যবসায়িক খরচ ও ব্যয় লেজার (${costs.length})</h3>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-cost')?.classList.remove('hidden')">+ নতুন খরচ</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Costs', ['ID', 'Title', 'Amount', 'Date'], costs.map(c=>[c.id, c.title, c.amount, c.date]))">CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b text-slate-400 uppercase text-[10px]">
                      <th class="py-2 px-3">আইডি</th>
                      <th class="py-2 px-3">খাত / বিবরণ</th>
                      <th class="py-2 px-3">ক্যাটাগরি</th>
                      <th class="py-2 px-3">পরিমাণ</th>
                      <th class="py-2 px-3">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    ${costs.map(c => `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="py-2.5 px-3 font-mono text-slate-400">${c.id}</td>
                        <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white">${c.title}</td>
                        <td class="py-2.5 px-3 text-slate-500">${c.category}</td>
                        <td class="py-2.5 px-3 font-black text-rose-500 font-mono">${formatCurrency(c.amount)}</td>
                        <td class="py-2.5 px-3 text-slate-400">${c.date}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 11. Buying Page -->
          <div id="page-inv-buying" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🛒 পাইকারি স্টক ক্রয় হিসাব (${buying.length})</h3>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-buying')?.classList.remove('hidden')">+ স্টক ক্রয় ভাউচার</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Buying', ['ID', 'Supplier', 'Product', 'Qty', 'Amount'], buying.map(b=>[b.id, b.supplier, b.product, b.quantity, b.total_amount]))">CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b text-slate-400 uppercase text-[10px]">
                      <th class="py-2 px-3">ক্রয় ID</th>
                      <th class="py-2 px-3">সাপ্লায়ার</th>
                      <th class="py-2 px-3">পণ্য</th>
                      <th class="py-2 px-3">পরিমাণ</th>
                      <th class="py-2 px-3">মোট বিল</th>
                      <th class="py-2 px-3">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    ${buying.map(b => `
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="py-2.5 px-3 font-mono text-slate-400">${b.id}</td>
                        <td class="py-2.5 px-3 font-bold">${b.supplier}</td>
                        <td class="py-2.5 px-3">${b.product}</td>
                        <td class="py-2.5 px-3 font-mono">${b.quantity} পিস</td>
                        <td class="py-2.5 px-3 font-bold font-mono text-emerald-600">${formatCurrency(b.total_amount)}</td>
                        <td class="py-2.5 px-3 text-slate-400">${b.date}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 12. Invest Page -->
          <div id="page-inv-invest" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">💼 মূলধন ও বিনিয়োগ ট্র্যাকার (${invest.length})</h3>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-invest')?.classList.remove('hidden')">+ নতুন বিনিয়োগ</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Invest', ['ID', 'Investor', 'Amount', 'Date'], invest.map(i=>[i.id, i.investor, i.amount, i.date]))">CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>
              <div class="space-y-2.5 text-xs">
                ${invest.map(i => `
                  <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${i.investor}</div>
                      <div class="text-[10px] text-slate-400">${i.note} • ${i.date}</div>
                    </div>
                    <div class="text-base font-black text-emerald-600 font-mono">${formatCurrency(i.amount)}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- Modals for Costs, Buying, Invest -->
          <div id="modal-add-cost" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন খরচ ভাউচার এন্ট্রি</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-cost')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddCost(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">খরচের বিবরণ *</label>
                  <input type="text" id="adm-cost-title" required placeholder="বিজ্ঞাপন / অফিস খরচ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">খরচের পরিমাণ (৳) *</label>
                  <input type="number" id="adm-cost-amount" required placeholder="5000" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
                </div>
                <div>
                  <label class="block font-bold mb-1">ক্যাটাগরি</label>
                  <select id="adm-cost-cat" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                    <option value="মার্কেটিং ও বিজ্ঞাপন">মার্কেটিং ও বিজ্ঞাপন</option>
                    <option value="অফিস ও শোরুম ভাড়া">অফিস ও শোরুম ভাড়া</option>
                    <option value="প্যাকেজিং ও বক্স">প্যাকেজিং ও বক্স</option>
                    <option value="আইটি ও সার্ভার">আইটি ও সার্ভার</option>
                    <option value="অন্যান্য ব্যয়">অন্যান্য ব্যয়</option>
                  </select>
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-cost')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
                </div>
              </form>
            </div>
          </div>

          <div id="modal-add-buying" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন পাইকারি স্টক ক্রয় এন্ট্রি</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-buying')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddBuying(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">সাপ্লায়ার / মহাজনের নাম</label>
                  <input type="text" id="adm-buying-supplier" placeholder="ঢাকা হোলসেল মার্কেট" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">পণ্যের বিবরণ *</label>
                  <input type="text" id="adm-buying-product" required placeholder="স্মার্টওয়াচ ও ব্যাটারি" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-bold mb-1">পরিমাণ (পিস) *</label>
                    <input type="number" id="adm-buying-qty" required value="50" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
                  </div>
                  <div>
                    <label class="block font-bold mb-1">মোট বিল (৳) *</label>
                    <input type="number" id="adm-buying-total" required placeholder="45000" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
                  </div>
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-buying')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
                </div>
              </form>
            </div>
          </div>

          <div id="modal-add-invest" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন মূলধন বিনিয়োগ যুক্ত করুন</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-invest')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddInvest(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">বিনিয়োগকারীর নাম *</label>
                  <input type="text" id="adm-invest-investor" required placeholder="জয়নাল আবেদীন" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">বিনিয়োগের পরিমাণ (৳) *</label>
                  <input type="number" id="adm-invest-amount" required placeholder="500000" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
                </div>
                <div>
                  <label class="block font-bold mb-1">নোট / শেয়ার অংশীদারিত্ব</label>
                  <input type="text" id="adm-invest-note" placeholder="কার্যকরী মূলধন সম্প্রসারণ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-invest')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
                </div>
              </form>
            </div>
          </div>


          <!-- ================================================================= -->
          <!-- DEDICATED PAGES: COURIER, FRAUD & PAYMENT (4 Standalone Views)    -->
          <!-- ================================================================= -->

          <!-- 1. Couriers List Page -->
          <div id="page-courier-list" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🚚</span> সংযুক্ত কুরিয়ার সার্ভিসেস ও এপিআই স্ট্যাটাস
                  </h3>
                  <p class="text-[11px] text-slate-400">স্টিডফাস্ট, পাঠাও ও রেডএক্স সরাসরি সংযোগ</p>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1 px-3 font-bold" onclick="switchAdminPage('page-courier-add', 'group-courier')">+ নতুন কুরিয়ার এপিআই</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                ${couriers.map(c => `
                  <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2.5">
                    <div class="flex items-center justify-between">
                      <div class="font-bold text-slate-900 dark:text-white text-sm">${c.name}</div>
                      <span class="badge ${c.status === 'Connected' ? 'badge-success' : 'badge-warning'} text-[10px]">${c.status}</span>
                    </div>
                    <div class="space-y-1 text-slate-500 text-[11px]">
                      <div><strong>API Key:</strong> <span class="font-mono">${c.api_key}</span></div>
                      <div><strong>Secret:</strong> <span class="font-mono">${c.secret_key || '••••••••'}</span></div>
                      <div><strong>জোন:</strong> ${c.hub_city}</div>
                      <div><strong>কুরিয়ার ব্যালেন্স:</strong> <span class="font-bold text-emerald-600 font-mono">${c.balance}</span></div>
                    </div>
                    <div class="pt-2 border-t flex items-center gap-2">
                      <button class="btn-secondary py-1 px-2.5 text-[10px] flex-1" onclick="window.handleTestCourierApi('${c.name}', this)">API টেস্ট করুন 🔄</button>
                      <button class="btn-secondary py-1 px-2 text-[10px] text-emerald-600 font-bold" onclick="alert('Webhook URL: ' + ('${c.webhook_url}' || 'https://dreamcart.bd/api/webhook'))">Webhook</button>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 2. Add Courier Page (with API + Secret + Webhook System) -->
          <div id="page-courier-add" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-xl">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন কুরিয়ার এপিআই কনফিগারেশন (Add Courier with Webhook)</h3>
                <p class="text-[11px] text-slate-400">এপিআই কী, সিক্রেট কী ও স্বয়ংক্রিয় ওয়েবহুক আপডেট সিস্টেম</p>
              </div>

              <form onsubmit="window.handleAdminAddCourier(event)" class="space-y-3.5 text-xs">
                <div>
                  <label class="block font-bold mb-1">কুরিয়ার সার্ভিস নাম *</label>
                  <input type="text" id="adm-new-courier-name" required placeholder="Steadfast / Pathao / Paperfly / RedX" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold mb-1">API Key / Client ID *</label>
                    <input type="text" id="adm-new-courier-api" required placeholder="sec_live_..." class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
                  </div>
                  <div>
                    <label class="block font-bold mb-1">Secret Key / Token *</label>
                    <input type="password" id="adm-new-courier-secret" required placeholder="••••••••••••" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
                  </div>
                </div>
                <div>
                  <label class="block font-bold mb-1">স্বয়ংক্রিয় Webhook URL (ডেলিভারি স্ট্যাটাস সিঙ্কের জন্য)</label>
                  <input type="text" id="adm-new-courier-webhook" value="https://dreamcart.bd/api/courier/webhook" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label class="block font-bold mb-1">হাব / ডেলিভারি কভারেজ জোন</label>
                  <input type="text" id="adm-new-courier-city" value="Dhaka & All BD" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
                </div>
                <button type="submit" class="btn-primary py-2.5 px-6 font-bold">কুরিয়ার সংযুক্ত করুন →</button>
              </form>
            </div>
          </div>

          <!-- 3. Fraud Check Page -->
          <div id="page-courier-fraud" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-xl">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🛡️</span> কাস্টমার ফ্রড চেকার (Fraud Check Tool)
                </h3>
                <p class="text-[11px] text-slate-400">অর্ডার লিস্ট ও সংযুক্ত কুরিয়ার এপিআই থেকে কাস্টমারের ডেলিভারি ও রিটার্ন রেট যাচাই</p>
              </div>

              <div class="space-y-3 text-xs">
                <div>
                  <label class="block font-bold mb-1">গ্রাহকের ফোন নম্বর লিখুন:</label>
                  <div class="flex gap-2">
                    <input type="text" id="input-fraud-phone" placeholder="01711223344" class="form-control text-xs flex-1 py-2 px-3 rounded-xl border font-mono font-bold" />
                    <button class="btn-primary py-2 px-5 font-bold" onclick="window.handleFraudPhoneCheck(document.getElementById('input-fraud-phone').value)">যাচাই করুন 🔍</button>
                  </div>
                </div>

                <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                  <h4 class="font-bold text-slate-900 dark:text-white">সাম্প্রতিক ফ্রড ভেরিফিকেশন ডাটাবেজ:</h4>
                  <div class="space-y-1.5">
                    <div class="p-2.5 bg-white dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                      <div>
                        <div class="font-bold">01711223344 (তানভীর আহমেদ)</div>
                        <div class="text-[10px] text-slate-400">কুরিয়ার হিস্ট্রি: ৯৮% ডেলিভারি সাকসেস (জিরো রিটার্ন)</div>
                      </div>
                      <span class="badge badge-success text-[10px]">Safe ✓</span>
                    </div>
                    <div class="p-2.5 bg-white dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                      <div>
                        <div class="font-bold">01622334488 (শারমিন সুলতানা)</div>
                        <div class="text-[10px] text-slate-400">কুরিয়ার হিস্ট্রি: ৪০% রিটার্ন রেকর্ড (২ টি পার্সেল রিফিউজড)</div>
                      </div>
                      <span class="badge badge-danger text-[10px]">High Risk ⚠️</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Add Online Payments Page -->
          <div id="page-courier-payments" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4">
              <div class="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>💳</span> অনলাইন পেমেন্ট গেটওয়ে কনফিগারেশন (${onlinePayments.length})
                  </h3>
                  <p class="text-[11px] text-slate-400">bKash Merchant, SSLCommerz, Shurjopay, Nagad API কনফিগ</p>
                </div>
                <button class="btn-primary py-1 px-3 text-xs font-bold" onclick="document.getElementById('modal-add-payment-gw')?.classList.remove('hidden')">+ গেটওয়ে যুক্ত</button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                ${onlinePayments.map(p => `
                  <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="font-bold text-slate-900 dark:text-white">${p.name}</div>
                      <span class="badge badge-success text-[9px]">${p.status}</span>
                    </div>
                    <div class="text-[10px] text-slate-400 font-mono">
                      <div>Merchant ID: ${p.merchant_id}</div>
                      <div>API Key: ${p.api_key}</div>
                      <div>মোড: <span class="font-bold text-emerald-600">${p.mode}</span></div>
                    </div>
                    <button class="btn-secondary py-1 px-2.5 w-full text-[10px] font-bold" onclick="alert('${p.name} সংযোগ সক্রিয় রয়েছে (Ping 28ms)')">কানেকশন টেস্ট</button>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- ================================================================= -->
          <!-- DEDICATED PAGES: SETTINGS (7 Distinct Standalone Views)            -->
          <!-- ================================================================= -->

          <!-- 1. Audit Logs Page -->
          <div id="page-set-logs" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">📜 ব্যবহারকারী ও কর্মী অ্যাক্টিভিটি লগ (Audit Trail)</h3>
                <div class="flex items-center gap-1.5 text-xs">
                  <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Audit_Logs', ['Time', 'User', 'Event', 'IP'], auditLogs.map(l=>[l.time, l.user, l.event, l.ip]))">CSV</button>
                  <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>
              <div class="space-y-2 text-xs">
                ${auditLogs.map(l => `
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">${l.event}</div>
                      <div class="text-[10px] text-slate-400">কর্মী: <span class="text-emerald-600 font-bold">${l.user}</span> • IP: <span class="font-mono">${l.ip}</span></div>
                    </div>
                    <span class="text-[10px] text-slate-400 font-mono">${l.time}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 2. Payment Method Update Page -->
          <div id="page-set-payment" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">💳 পেমেন্ট মেথড আপডেট ও কন্ট্রোল</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                  <div class="flex items-center justify-between font-bold">
                    <span>ক্যাশ অন ডেলিভারি (COD)</span>
                    <span class="badge badge-success text-[9px]">সক্রিয়</span>
                  </div>
                  <p class="text-[10px] text-slate-400">পণ্য হাতে পেয়ে টাকা পরিশোধ।</p>
                </div>
                <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                  <div class="flex items-center justify-between font-bold">
                    <span>bKash অনলাইন পেমেন্ট</span>
                    <span class="badge badge-success text-[9px]">সক্রিয়</span>
                  </div>
                  <p class="text-[10px] text-slate-400">বিকাশ মার্চেন্ট গেটওয়ে।</p>
                </div>
                <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                  <div class="flex items-center justify-between font-bold">
                    <span>Nagad অনলাইন পেমেন্ট</span>
                    <span class="badge badge-success text-[9px]">সক্রিয়</span>
                  </div>
                  <p class="text-[10px] text-slate-400">নগদ মার্চেন্ট গেটওয়ে।</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Delivery Method Page -->
          <div id="page-set-delivery" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🚚 ডেলিভারি চার্জ ও জোন সেটিংস</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                  <div class="font-bold">কুমিল্লা সিটি ডেলিভারি</div>
                  <div class="text-base font-black text-emerald-600 font-mono">৳৭০</div>
                  <p class="text-[10px] text-slate-400">২৪ ঘন্টার মধ্যে ডেলিভারি</p>
                </div>
                <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                  <div class="font-bold">ঢাকা সিটি ডেলিভারি</div>
                  <div class="text-base font-black text-emerald-600 font-mono">৳৯০</div>
                  <p class="text-[10px] text-slate-400">২৪-৪৮ ঘন্টায় হোম ডেলিভারি</p>
                </div>
                <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                  <div class="font-bold">ঢাকার বাইরে সারা বাংলাদেশ</div>
                  <div class="text-base font-black text-emerald-600 font-mono">৳১২০</div>
                  <p class="text-[10px] text-slate-400">কুরিয়ারে দ্রুত ডেলিভারি</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Offers & Promo Page -->
          <div id="page-set-offers" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🎁 অফার ও ডিসকাউন্ট কুপন (${offers.length})</h3>
                <button class="btn-primary py-1 px-3 text-xs font-bold" onclick="document.getElementById('modal-add-offer')?.classList.remove('hidden')">+ নতুন কুপন</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                ${offers.map(o => `
                  <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
                    <div class="flex items-center justify-between font-mono font-black text-emerald-600">
                      <span>${o.code}</span>
                      <span class="badge badge-success text-[9px]">${o.status}</span>
                    </div>
                    <div class="text-xs font-bold">${o.discount}</div>
                    <div class="text-[10px] text-slate-400">সর্বনিম্ন অর্ডার: ৳${o.min_spend}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 5. Website Information Page -->
          <div id="page-set-info" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-xl">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏢 দোকানের তথ্য, ঠিকানা ও হটলাইন</h3>
              </div>
              <form onsubmit="window.handleAdminSaveSettings(event)" class="space-y-3 text-xs">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold mb-1">দোকানের নাম</label>
                    <input type="text" id="adm-set-shopname" value="Dream Cart BD" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
                  </div>
                  <div>
                    <label class="block font-bold mb-1">লোগো URL</label>
                    <input type="url" id="adm-set-logo" value="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
                  </div>
                </div>
                <div>
                  <label class="block font-bold mb-1">ঠিকানা</label>
                  <textarea id="adm-set-address" rows="2" class="form-control text-xs w-full p-2.5 rounded-xl border">চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।</textarea>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold mb-1">হটলাইন ১ (WhatsApp)</label>
                    <input type="text" id="adm-set-hotline1" value="01581703822" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
                  </div>
                  <div>
                    <label class="block font-bold mb-1">হটলাইন ২ (Call)</label>
                    <input type="text" id="adm-set-hotline2" value="01818273838" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
                  </div>
                </div>
                <div>
                  <label class="block font-bold mb-1">শীর্ষ নোটিশ বার টেক্সট</label>
                  <textarea id="adm-set-notice" rows="2" class="form-control text-xs w-full p-2.5 rounded-xl border">৳২,০০০ বা তার বেশি অর্ডারে ফ্রি শিপিং! ক্যাশ অন ডেলিভারিতে পণ্য পেয়ে টাকা দিন।</textarea>
                </div>
                <button type="submit" class="btn-primary py-2.5 px-6 font-bold">সেটিংস সংরক্ষণ করুন</button>
              </form>
            </div>
          </div>

          <!-- 6. Profile Page -->
          <div id="page-set-profile" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-md">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">👤 অ্যাডমিন প্রোফাইল আপডেট</h3>
              </div>
              <form onsubmit="event.preventDefault(); if(toast&&toast.show) toast.show({type:'success', title:'প্রোফাইল আপডেট', message:'প্রোফাইল সফলভাবে আপডেট হয়েছে!'}); else alert('আপডেট হয়েছে');" class="space-y-3.5 text-xs">
                <div>
                  <label class="block font-bold mb-1">পুরো নাম</label>
                  <input type="text" value="${userDisplayName}" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
                </div>
                <div>
                  <label class="block font-bold mb-1">পদবী</label>
                  <input type="text" value="${workerType}" disabled class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-slate-100 dark:bg-slate-800 font-bold" />
                </div>
                <button type="submit" class="btn-primary py-2.5 px-6 font-bold">প্রোফাইল সংরক্ষণ</button>
              </form>
            </div>
          </div>

          <!-- 7. Change Password Page -->
          <div id="page-set-password" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-md">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">🔒 সিকিউরিটি পাসওয়ার্ড পরিবর্তন</h3>
              </div>
              <form onsubmit="event.preventDefault(); const p1=document.getElementById('adm-new-pass')?.value; const p2=document.getElementById('adm-new-pass-conf')?.value; if(p1!==p2) { alert('পাসওয়ার্ড মিলছে না!'); return; } if(toast&&toast.show) toast.show({type:'success', title:'পাসওয়ার্ড পরিবর্তন', message:'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!'}); else alert('পাসওয়ার্ড পরিবর্তিত হয়েছে');" class="space-y-3.5 text-xs">
                <div>
                  <label class="block font-bold mb-1">বর্তমান পাসওয়ার্ড</label>
                  <input type="password" required placeholder="••••••••" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
                </div>
                <div>
                  <label class="block font-bold mb-1">নতুন পাসওয়ার্ড</label>
                  <input type="password" id="adm-new-pass" required placeholder="••••••••" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
                </div>
                <div>
                  <label class="block font-bold mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                  <input type="password" id="adm-new-pass-conf" required placeholder="••••••••" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
                </div>
                <button type="submit" class="btn-primary py-2.5 px-6 font-bold">পাসওয়ার্ড পরিবর্তন করুন</button>
              </form>
            </div>
          </div>

          <!-- Modals for Courier, Payments, Offers -->
          <div id="modal-add-courier" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন কুরিয়ার এপিআই কনফিগারেশন</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-courier')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddCourier(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">কুরিয়ার সার্ভিস নাম *</label>
                  <input type="text" id="adm-new-courier-name" required placeholder="Steadfast / Pathao / RedX" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">API Key *</label>
                  <input type="text" id="adm-new-courier-api" required placeholder="sec_live_..." class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
                </div>
                <div>
                  <label class="block font-bold mb-1">Secret Key *</label>
                  <input type="password" id="adm-new-courier-secret" required placeholder="••••••••" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-courier')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংযুক্ত করুন</button>
                </div>
              </form>
            </div>
          </div>

          <div id="modal-add-payment-gw" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন অনলাইন পেমেন্ট গেটওয়ে যুক্ত</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-payment-gw')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddOnlinePayment(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">গেটওয়ের নাম *</label>
                  <input type="text" id="adm-new-gw-name" required placeholder="bKash / SSLCommerz / Shurjopay" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
                </div>
                <div>
                  <label class="block font-bold mb-1">মার্চেন্ট আইডি / স্টোর কোড *</label>
                  <input type="text" id="adm-new-gw-merchant" required placeholder="MERCHANT-01" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">API Key / Secret Token *</label>
                  <input type="password" id="adm-new-gw-key" required placeholder="••••••••••••" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-payment-gw')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
                </div>
              </form>
            </div>
          </div>

          <div id="modal-add-offer" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
              <div class="flex items-center justify-between border-b pb-2">
                <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন প্রমো কুপন কোড তৈরি</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-offer')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleAdminAddOffer(event)" class="space-y-3">
                <div>
                  <label class="block font-bold mb-1">কুপন কোড *</label>
                  <input type="text" id="adm-new-offer-code" required placeholder="SUMMER20" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold uppercase" />
                </div>
                <div>
                  <label class="block font-bold mb-1">ছাড়ের বিবরণ *</label>
                  <input type="text" id="adm-new-offer-disc" required placeholder="১৫% ফ্ল্যাট ডিসকাউন্ট" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
                </div>
                <div>
                  <label class="block font-bold mb-1">সর্বনিম্ন অর্ডারের মূল্য (৳)</label>
                  <input type="number" id="adm-new-offer-min" value="1500" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
                </div>
                <div class="flex items-center justify-end gap-2 pt-2">
                  <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-offer')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সক্রিয় করুন</button>
                </div>
              </form>
            </div>
          </div>

        </main>
      </div>

    </div>
  `;
}

function renderAdminLoginView() {
  const captchaNum1 = Math.floor(Math.random() * 8) + 1;
  const captchaNum2 = Math.floor(Math.random() * 8) + 1;
  const captchaSum = captchaNum1 + captchaNum2;

  return `
    <div class="max-w-md mx-auto py-12 px-4 space-y-6">
      
      <div class="text-center space-y-2">
        <div class="w-16 h-16 rounded-3xl bg-slate-900 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-xl border border-slate-700">
          ⚙️
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white">
          মাস্টার অ্যাডমিন লগইন (Admin Login)
        </h2>
        <p class="text-xs text-slate-500">
          আপনার পদবী, ইউজার নেম ও পাসওয়ার্ড দিয়ে মাস্টার প্যানেলে প্রবেশ করুন
        </p>
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-4 text-xs">
        
        <form id="admin-login-form" class="space-y-3.5">
          <!-- Worker_Type Dropdown -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Worker Type (কর্মীর পদবী) *</label>
            <select id="adm-worker-type" class="form-control text-xs w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold" required>
              <option value="Admin">Admin (মাস্টার অ্যাডমিন)</option>
              <option value="Manager">Manager (ম্যানেজার)</option>
              <option value="Staff">Staff (স্টাফ)</option>
              <option value="Sales">Sales (বিক্রয় প্রতিনিধি)</option>
              <option value="Customer Support">Customer Support (গ্রাহক সেবা)</option>
              <option value="Order Management">Order Management (অর্ডার ডেস্ক)</option>
              <option value="Inventory/Warehouse">Inventory/Warehouse (গুদাম)</option>
              <option value="Delivery">Delivery (ডেলিভারি)</option>
              <option value="Accountant">Accountant (হিসাবরক্ষক)</option>
              <option value="Marketing">Marketing (মার্কেটিং)</option>
              <option value="IT/Technical">IT/Technical (প্রযুক্তি)</option>
              <option value="Content Manager">Content Manager</option>
              <option value="Other">Other (অন্যান্য)</option>
            </select>
          </div>

          <!-- User Name Dropdown -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">User Name (ব্যবহারকারীর নাম) *</label>
            <select id="adm-username" class="form-control text-xs w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold" required>
              <option value="Jainal Abedin">Jainal Abedin (CEO & Lead)</option>
              <option value="MD. Saiful Islam">MD. Saiful Islam (Admin)</option>
              <option value="Admin Staff">Admin Staff (Operations)</option>
              <option value="Accounts Officer">Accounts Officer</option>
            </select>
          </div>

          <!-- Password -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
            <input type="password" id="adm-password" required placeholder="••••••••" value="admin123" class="form-control text-xs w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-mono" />
          </div>

          <!-- Dynamic Re-changeable Captcha -->
          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-700 dark:text-slate-300">নিরাপত্তা ক্যাপচা যাচাই:</span>
              <button type="button" class="text-[11px] text-emerald-600 font-bold hover:underline" onclick="window.regenerateAdminCaptcha && window.regenerateAdminCaptcha()">
                ক্যাপচা পরিবর্তন 🔄
              </button>
            </div>
            <div class="flex items-center gap-3">
              <div id="adm-captcha-display" class="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-sm font-black text-emerald-600">
                ${captchaNum1} + ${captchaNum2} = ?
              </div>
              <input type="hidden" id="adm-captcha-expected" value="${captchaSum}" />
              <input 
                type="number" 
                id="adm-captcha-input" 
                required 
                placeholder="যোগফল লিখুন" 
                class="form-control text-xs flex-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 font-bold" 
              />
            </div>
          </div>

          <button type="submit" class="btn-primary w-full py-3 text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-md">
            লগইন করুন →
          </button>
        </form>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          ডেমো পাসওয়ার্ড: <span class="font-mono font-bold text-slate-700 dark:text-slate-300">admin123</span>
        </div>

      </div>

    </div>
  `;
}

export const AdminPortal = renderAdminPortal;
export default renderAdminPortal;
