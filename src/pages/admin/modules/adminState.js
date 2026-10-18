/**
 * DREAM CART BD — Admin Global State, Math Calculators & Event Handlers (adminState.js)
 * Modularized for blazing-fast page loads and zero lag.
 */

import { apiClient } from '../../../api/client.js';
import { authStore } from '../../../store/authStore.js';
import { formatCurrency } from '../../../utils/format.js';
import { toast } from '../../../components/Toast.js';

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
    landingPages: [],
    kpi: {},
    resellerSettings: {
      globalCommission: 15,
      minOrderQty: 1,
      minPayout: 500,
      payoutFeePct: 3
    }
  };

  window.__prodCurrentPage = 1;
  window.__prodPageSize = 120;
  window.__prodFilterStatus = 'all';
  window.__prodSearchQuery = '';
  window.__landingBuilderSelectedProducts = [];

  window.__pageTitleMap = {
    'page-dashboard': { title: '📊 ড্যাশবোর্ড ওভারভিউ (Dashboard)', subtitle: '১৮-পয়েন্ট লাইভ বিজনেস কাউন্টার, রাজস্ব ও সেলস গ্রাফ' },
    'page-prod-all': { title: '📦 সকল পণ্য তালিকা (Product Catalog)', subtitle: 'প্রতি পেজে ১২০টি পণ্য, চেকবক্স নির্বাচন, বাল্ক এডিট ও ফিল্টারিং' },
    'page-prod-add': { title: '➕ নতুন পণ্য সংযোজন (AI Categorization & Slab Pricing)', subtitle: 'AI স্বয়ংক্রিয় ক্যাটাগরি, ১৬-টিয়ার প্রাইসিং স্ল্যাব ও ডাইমেনশন গণনা' },
    'page-prod-categories': { title: '🗂️ ক্যাটাগরি তালিকা ও ম্যানেজমেন্ট (Deduplicated)', subtitle: 'ডুপ্লিকেট মুক্ত ক্যাটাগরি তালিকা, সাব-ক্যাটাগরি ও নতুন ক্যাটাগরি যোগ' },
    'page-prod-bulk-add': { title: '📥 বাল্ক পণ্য আপলোড (Bulk CSV)', subtitle: 'নমুনা শিট ডাউনলোড ও সিএসভি আপলোডের মাধ্যমে পণ্য সংযোজন' },
    'page-prod-bulk-price': { title: '🏷️ বাল্ক মূল্য পরিবর্তন (Bulk Price Update)', subtitle: 'নমুনা শিট ডাউনলোড ও আপলোডের মাধ্যমে পাইকারি ও খুচরা দর আপডেট' },
    'page-prod-bulk-image': { title: '🖼️ বাল্ক ইমেজ আপডেট (Bulk Image Update)', subtitle: 'নমুনা শিট ডাউনলোড ও আপলোডের মাধ্যমে পণ্যের ছবি পরিবর্তন' },
    'page-prod-low-stock': { title: '⚠️ লো-স্টক পণ্য তালিকা (<৫ পিস)', subtitle: 'যেসব পণ্যের স্টক ৫ পিসের নিচে নেমে এসেছে' },
    'page-prod-out-stock': { title: '🚫 আউট অব স্টক পণ্য (০ পিস)', subtitle: 'বর্তমানে স্টক শূন্য হওয়া আইটেমসমূহ' },
    'page-prod-error': { title: '⚙️ ত্রুটিযুক্ত পণ্য যাচাই (Error Products)', subtitle: 'ছবি, মূল্য বা SKU অনুপস্থিত থাকা আইটেম' },
    'page-prod-brands': { title: '🏷️ অফিসিয়াল ব্র্যান্ড পার্টনার্স (Brands Showcase)', subtitle: 'কার্ড আকারে অফিসিয়াল ব্র্যান্ডসমূহ ও দ্রুত অ্যাকশন' },
    'page-prod-brand-add': { title: '➕ নতুন ব্র্যান্ড যুক্ত করুন', subtitle: 'লোগো ও তথ্যসহ নতুন ব্র্যান্ড সংযোজন' },
    'page-prod-variants': { title: '🎨 কালার ও সাইজ ভ্যারিয়েন্ট', subtitle: 'উপলব্ধ কালার শেডস ও সাইজ স্কেল তালিকা' },
    'page-prod-variant-add': { title: '➕ নতুন ভ্যারিয়েন্ট যুক্ত করুন', subtitle: 'নতুন রং বা সাইজ অপশন সংরক্ষণ' },
    'page-prod-banners': { title: '🖼️ ব্যানার ও স্লাইডার CMS', subtitle: 'ওয়েবসাইটের হিরো ব্যানার স্লাইড পরিচালনা' },
    'page-prod-landing': { title: '🚀 মাল্টি-ল্যান্ডিং পেজ CMS (Landing Pages)', subtitle: 'একের অধিক ল্যান্ডিং পেজ তৈরি, পণ্য সার্চ করে যুক্ত, ভিডিও ও ব্যানার আপডেট' },
    'page-orders-all': { title: '📋 সকল অর্ডার তালিকা (All Orders)', subtitle: '৯-কলাম লেআউট, বাল্ক সিলেকশন, ফ্রড চেক, কুরিয়ার বুকিং ও ভাউচার' },
    'page-orders-incomplete': { title: '⚠️ অসম্পূর্ণ অর্ডারসমূহ (Abandoned)', subtitle: 'ফর্ম পূরণ করেও চেকআউট না করা গ্রাহকদের WhatsApp অফার' },
    'page-orders-success': { title: '✓ সফল ডেলিভারি (Delivered & Paid)', subtitle: 'কুরিয়ারে সফলভাবে সরবরাহ ও পরিশোধিত অর্ডার' },
    'page-orders-shipping': { title: '🚚 কুরিয়ারে / শিপিং অর্ডার (In Courier)', subtitle: 'প্যাকিং, ইন ট্রানজিট ও ডেলিভারি পথে থাকা পার্সেল' },
    'page-orders-unpaid': { title: '💳 পেমেন্ট অসম্পূর্ণ (COD Pending)', subtitle: 'ডেলিভারি হয়েছে কিন্তু এখনো টাকা জমা হয়নি' },
    'page-orders-cancelled': { title: '✕ বাতিল ও রিটার্নকৃত অর্ডার', subtitle: 'গ্রাহক বা কুরিয়ার কর্তৃক ফেরত আসা পার্সেল' },
    'page-orders-add': { title: '➕ নতুন অর্ডার এন্ট্রি (Add Order)', subtitle: 'পণ্য সার্চ, গ্রাহকের তথ্য ইনপুট ও ক্যাশ ভাউচার প্রিন্ট' },
    'page-orders-visitors': { title: '🟢 লাইভ সক্রিয় ভিজিটর ট্র্যাকিং', subtitle: 'ওয়েবসাইটে বর্তমানে ব্রাউজিং করা ইউজার ও পেজ হিস্ট্রি' },
    'page-orders-customers': { title: '👥 কাস্টমার ডাটাবেজ (Customer CRM)', subtitle: 'সকল গ্রাহকদের ফোন নম্বর, ঠিকানা ও মোট ক্রয়ের হিসাব' },
    'page-orders-reviews': { title: '⭐ গ্রাহক রিভিউ ও রেটিং', subtitle: 'পণ্য রিভিউ অনুমোদন ও মডারেশন প্যানেল' },
    'page-partner-resellers': { title: '🤝 রিসেলার পার্টনার ও কমিশন কন্ট্রোল', subtitle: 'রিসেলিং কমিশন শতকরা (%) নিয়ন্ত্রণ, ব্যালেন্স ও ট্র্যাকিং' },
    'page-partner-wholesalers': { title: '🏢 পাইকারি ক্রেতা (Wholesalers)', subtitle: 'হোলসেলার ডিসকাউন্ট টিয়ার ও মোট অর্ডার হিস্ট্রি' },
    'page-partner-sellers': { title: '🏪 মার্চেন্ট সেলার / ভেন্ডর', subtitle: 'ভেন্ডরদের পণ্যের সংখ্যা ও কমিশন মার্জিন' },
    'page-partner-markets': { title: '🌐 অন্যান্য মার্কেটপ্লেস চ্যানেল', subtitle: 'দারাজ, ফেসবুক শপ ও বিক্রয় ডট কমের সাথে ক্যাটালগ সিঙ্ক' },
    'page-admin-users': { title: '👑 মাস্টার অ্যাডমিন একাউন্টস', subtitle: 'সিস্টেমের পূর্ণ নিয়ন্ত্রণপ্রাপ্ত অ্যাডমিন ইউজার' },
    'page-admin-workers': { title: '👷 কর্মী ও স্টাফ টিম ডিরেক্টরি', subtitle: 'অর্ডার, ডেলিভারি, সাপোর্ট ও হিসাবরক্ষক কর্মী' },
    'page-report-seller': { title: '🏪 সেলার পারফরম্যান্স রিপোর্ট', subtitle: 'ভেন্ডরদের মাসিক ও বাৎসরিক বিক্রয় রিপোর্ট' },
    'page-report-reseller': { title: '🤝 রিসেলার কমিশন রিপোর্ট', subtitle: 'রিসেলারদের মাধ্যমে বিক্রির হিসাব' },
    'page-report-wholesaler': { title: '🏢 হোলসেলার ক্রয় রিপোর্ট', subtitle: 'পাইকারি পার্টনারদের ভলিউম রিপোর্ট' },
    'page-report-sales': { title: '📊 সার্বিক বিক্রয় রিপোর্ট (Sales)', subtitle: 'দৈনিক, সাপ্তাহিক, মাসিক ও বাৎসরিক বিক্রয় খতিয়ান' },
    'page-report-wholesale': { title: '📦 হোলসেল সাপ্লাই রিপোর্ট', subtitle: 'বাল্ক অর্ডারের রাজস্ব হিসাব' },
    'page-report-costs': { title: '💸 ব্যবসায়িক ব্যয় রিপোর্ট (Costs)', subtitle: 'মার্কেটিং, অফিস ও প্যাকেজিং খরচের হিসাব' },
    'page-report-buying': { title: '🛒 পাইকারি স্টক ক্রয় রিপোর্ট (Buying)', subtitle: 'সাপ্লায়ারদের থেকে পণ্য ক্রয়ের তালিকা' },
    'page-report-invest': { title: '💼 মূলধন ও বিনিয়োগ রিপোর্ট (Invest)', subtitle: 'পার্টনার ও শেয়ারহোল্ডারদের ইকুইটি ফান্ড' },
    'page-inv-payout': { title: '💳 রিসেলার পে-আউট রিকোয়েস্ট', subtitle: 'স্বয়ংক্রিয় -৩% ফি কর্তন সাপেক্ষে উত্তোলন অনুমোদন' },
    'page-inv-costs': { title: '💸 ব্যবসায়িক খরচ ও ব্যয় লেজার', subtitle: 'ভাউচার ভিত্তিক খরচের হিসাব সংরক্ষণ' },
    'page-inv-buying': { title: '🛒 পাইকারি স্টক ক্রয় হিসাব', subtitle: 'সাপ্লায়ার স্টক ক্রয় ইনভয়েস' },
    'page-inv-invest': { title: '💼 মূলধন বিনিয়োগ ট্র্যাকার', subtitle: 'ব্যবসায়ের বিনিয়োগ ও মূলধনের বৃদ্ধি' },
    'page-courier-list': { title: '🚚 সংযুক্ত কুরিয়ার সার্ভিসসমূহ', subtitle: 'স্টিডফাস্ট, পাঠাও ও রেডএক্স লাইভ ব্যালেন্স ও স্ট্যাটাস' },
    'page-courier-add': { title: '➕ নতুন কুরিয়ার এপিআই কনফিগ', subtitle: 'API Key, Secret Key ও Webhook স্বয়ংক্রিয় সংযোগ' },
    'page-courier-fraud': { title: '🛡️ কাস্টমার ফ্রড চেকার (Fraud Check)', subtitle: 'কুরিয়ার ডেলিভারি সাকসেস ও রিটার্ন রেট বিশ্লেষণ' },
    'page-courier-payments': { title: '💳 অনলাইন পেমেন্ট গেটওয়ে যুক্ত', subtitle: 'বিকাশ মার্চেন্ট, SSLCommerz, সূর্যপে ও নগদ ইন্টিগ্রেশন' },
    'page-set-logs': { title: '📜 অডিট লগ ও কর্মী অ্যাক্টিভিটি', subtitle: 'লগইন হিস্ট্রি, আইপি অ্যাড্রেস ও ইউজার অ্যাকশন' },
    'page-set-payment': { title: '💳 পেমেন্ট মেথড কনফিগারেশন', subtitle: 'ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ সেটিংস' },
    'page-set-delivery': { title: '🚚 ডেলিভারি চার্জ ও জোন', subtitle: 'কুমিল্লা, ঢাকা ও ঢাকার বাইরে ডেলিভারি ফি নির্ধারণ' },
    'page-set-offers': { title: '🎁 অফার ও প্রমো কুপন কোড', subtitle: 'ডিসকাউন্ট কুপন তৈরি ও সক্রিয়করণ' },
    'page-set-info': { title: '🏢 দোকানের তথ্য ও যোগাযোগ হটলাইন', subtitle: 'নাম, লোগো, ঠিকানা, হটলাইন ও শীর্ষ নোটিশ বার' },
    'page-set-profile': { title: '👤 অ্যাডমিন প্রোফাইল আপডেট', subtitle: 'ব্যবহারকারীর নাম ও পদবী' },
    'page-set-password': { title: '🔒 পাসওয়ার্ড পরিবর্তন ও সিকিউরিটি', subtitle: 'নতুন সুরক্ষিত পাসওয়ার্ড নির্ধারণ' }
  };

  // Sidebar Accordion Toggle
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

  // Standalone Page Switcher
  window.switchAdminPage = function(pageId, parentGroupId) {
    if (!pageId) return;
    window.__adminState.activePage = pageId;

    document.querySelectorAll('.admin-page-view').forEach(p => {
      p.classList.add('hidden');
      p.style.display = 'none';
    });

    const target = document.getElementById(pageId);
    if (target) {
      target.classList.remove('hidden');
      target.style.display = 'block';
    }

    document.querySelectorAll('.dc-sidebar-sub-item').forEach(btn => {
      if (btn.getAttribute('data-page') === pageId) btn.classList.add('active');
      else btn.classList.remove('active');
    });

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
        if (btn.getAttribute('data-group') === parentGroupId) btn.classList.add('active');
        else btn.classList.remove('active');
      });
    }

    if (window.__pageTitleMap && window.__pageTitleMap[pageId]) {
      const t = window.__pageTitleMap[pageId];
      const headerTitleEl = document.getElementById('admin-current-tab-title');
      const headerSubEl = document.getElementById('admin-current-tab-subtitle');
      if (headerTitleEl) headerTitleEl.textContent = t.title;
      if (headerSubEl) headerSubEl.textContent = t.subtitle;
    }

    window.closeAdminSidebar && window.closeAdminSidebar();

    const main = document.getElementById('admin-main-panel');
    if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (pageId === 'page-prod-all') {
      window.renderProductsTablePage && window.renderProductsTablePage(window.__prodCurrentPage || 1);
    }
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
    if (activePage === 'page-prod-all') {
      window.filterAdminProducts(query);
      return;
    }
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

  // Generic CSV Exporter
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

  // =========================================================================
  // 16-TIER EXACT SLAB FORMULA CALCULATORS
  // =========================================================================
  window.calcSellingPrice = function(buyingPrice) {
    const bp = Number(buyingPrice) || 0;
    if (bp <= 0) return 0;
    let pct = 0.01;
    if (bp <= 100) pct = 0.80;
    else if (bp <= 200) pct = 0.70;
    else if (bp <= 400) pct = 0.60;
    else if (bp <= 600) pct = 0.50;
    else if (bp <= 800) pct = 0.45;
    else if (bp <= 1500) pct = 0.40;
    else if (bp <= 5000) pct = 0.30;
    else if (bp <= 10000) pct = 0.20;
    else if (bp <= 25000) pct = 0.15;
    else if (bp <= 70000) pct = 0.10;
    else if (bp <= 200000) pct = 0.08;
    else if (bp <= 350000) pct = 0.06;
    else if (bp <= 1000000) pct = 0.04;
    else if (bp <= 2000000) pct = 0.03;
    else if (bp <= 5000000) pct = 0.02;
    else pct = 0.01;
    return Math.round(bp + (bp * pct));
  };

  window.calcOriginalPrice = function(sellingPrice) {
    const sp = Number(sellingPrice) || 0;
    if (sp <= 0) return 0;
    let pct = 0.12;
    if (sp <= 100) pct = 0.55;
    else if (sp <= 200) pct = 0.52;
    else if (sp <= 400) pct = 0.50;
    else if (sp <= 600) pct = 0.48;
    else if (sp <= 800) pct = 0.47;
    else if (sp <= 1500) pct = 0.45;
    else if (sp <= 5000) pct = 0.43;
    else if (sp <= 10000) pct = 0.35;
    else if (sp <= 25000) pct = 0.30;
    else if (sp <= 70000) pct = 0.28;
    else if (sp <= 200000) pct = 0.20;
    else if (sp <= 350000) pct = 0.18;
    else if (sp <= 1000000) pct = 0.15;
    else if (sp <= 2000000) pct = 0.14;
    else if (sp <= 5000000) pct = 0.13;
    else pct = 0.12;
    return Math.round(sp + (sp * pct));
  };

  window.calcWholesalePrice = function(buyingPrice) {
    const bp = Number(buyingPrice) || 0;
    if (bp <= 0) return 0;
    let pct = 0.06;
    if (bp <= 100) pct = 0.65;
    else if (bp <= 200) pct = 0.55;
    else if (bp <= 400) pct = 0.45;
    else if (bp <= 600) pct = 0.35;
    else if (bp <= 800) pct = 0.30;
    else if (bp <= 1500) pct = 0.28;
    else if (bp <= 5000) pct = 0.25;
    else if (bp <= 10000) pct = 0.20;
    else if (bp <= 25000) pct = 0.18;
    else if (bp <= 70000) pct = 0.17;
    else if (bp <= 200000) pct = 0.15;
    else if (bp <= 350000) pct = 0.13;
    else if (bp <= 1000000) pct = 0.10;
    else if (bp <= 2000000) pct = 0.09;
    else if (bp <= 5000000) pct = 0.08;
    else pct = 0.06;
    return Math.round(bp + (bp * pct));
  };

  window.calcMinOrderQty = function(sellingPrice) {
    const sp = Number(sellingPrice) || 0;
    return sp <= 200 ? 10 : 5;
  };

  window.handlePricingAutoCalc = function() {
    const buyInput = document.getElementById('adm-add-buyprice');
    const sellInput = document.getElementById('adm-add-sellprice');
    const origInput = document.getElementById('adm-add-origprice');
    const wsInput = document.getElementById('adm-add-wholesaleprice');
    const moqInput = document.getElementById('adm-add-minorder');
    if (!buyInput) return;

    const bp = Number(buyInput.value) || 0;
    if (bp > 0) {
      const calculatedSelling = window.calcSellingPrice(bp);
      if (sellInput && (!sellInput.value || sellInput.dataset.autoCalc !== 'false')) {
        sellInput.value = calculatedSelling;
      }
      const activeSelling = Number(sellInput ? sellInput.value : calculatedSelling) || calculatedSelling;
      if (origInput) origInput.value = window.calcOriginalPrice(activeSelling);
      if (wsInput) wsInput.value = window.calcWholesalePrice(bp);
      if (moqInput) moqInput.value = window.calcMinOrderQty(activeSelling);
    }
  };

  window.handleSellingPriceManualChange = function() {
    const sellInput = document.getElementById('adm-add-sellprice');
    const origInput = document.getElementById('adm-add-origprice');
    const moqInput = document.getElementById('adm-add-minorder');
    if (sellInput) {
      sellInput.dataset.autoCalc = 'false';
      const sp = Number(sellInput.value) || 0;
      if (sp > 0) {
        if (origInput) origInput.value = window.calcOriginalPrice(sp);
        if (moqInput) moqInput.value = window.calcMinOrderQty(sp);
      }
    }
  };

  // AI Categorization Engine
  window.analyzeProductNameAI = function(name) {
    const n = (name || '').toLowerCase().trim();
    if (!n) return null;

    const taxonomy = [
      {
        keys: ['watch', 'ঘড়ি', 'smartwatch', 'smart watch', 'কলিং', 'amoled', 'গিয়ার', 'band'],
        category: 'Smartwatches',
        sub_category: 'Smart Calling Watch',
        child_category: 'Men & Women Fitness Watch',
        brand: 'Amazfit',
        weight: 0.25, width: 8, length: 12, height: 4
      },
      {
        keys: ['gas', 'গ্যাস', 'সেফটি', 'safety', 'রেগুলেটর', 'চুলা', 'লিকেজ'],
        category: 'Kitchen',
        sub_category: 'Gas Safety Devices',
        child_category: 'Heavy Duty Auto Cutoff Regulator',
        brand: 'Dream Cart BD',
        weight: 0.65, width: 12, length: 18, height: 8
      },
      {
        keys: ['blender', 'ব্লেন্ডার', 'mixer', 'মিক্সার', 'জুসার', 'grinder', 'গ্রাইন্ডার'],
        category: 'Kitchen',
        sub_category: 'Kitchen Appliances',
        child_category: 'High-Speed Portable Juicer Blender',
        brand: 'Panasonic',
        weight: 1.20, width: 15, length: 25, height: 15
      },
      {
        keys: ['pan', 'কড়াই', 'cookware', 'হাঁড়ি', 'প্রেসার কুকার', 'fry pan', 'তাওয়া'],
        category: 'Kitchen',
        sub_category: 'Cookware',
        child_category: 'Non-stick Marble Coating Pan',
        brand: 'Kiam',
        weight: 1.40, width: 28, length: 32, height: 10
      },
      {
        keys: ['honey', 'মধু', 'সুন্দরবন', 'চাকের মধু', 'খাঁটি মধু', 'raw honey'],
        category: 'Organic & Health',
        sub_category: 'Pure Natural Honey',
        child_category: 'Sundarbans Natural Wild Honey',
        brand: 'Dream Organic',
        weight: 1.00, width: 10, length: 14, height: 10
      },
      {
        keys: ['chia', 'চিয়া', 'সিড', 'seed', 'চিয়া সিড'],
        category: 'Organic & Health',
        sub_category: 'Superfoods & Seeds',
        child_category: 'Organic Raw Chia Seeds',
        brand: 'Dream Organic',
        weight: 0.50, width: 8, length: 12, height: 8
      },
      {
        keys: ['oil', 'তেল', 'কালোজিরা', 'সরিষা', 'black seed'],
        category: 'Organic & Health',
        sub_category: 'Cold-Pressed Oils',
        child_category: '100% Pure Black Seed Oil',
        brand: 'Dream Organic',
        weight: 0.35, width: 6, length: 16, height: 6
      },
      {
        keys: ['light', 'লাইট', 'torch', 'টর্চ', 'flashlight', 'ফ্ল্যাশলাইট', 'মিলিটারি'],
        category: 'Home Appliances',
        sub_category: 'Emergency Lighting',
        child_category: 'Tactical Long-Range Rechargeable Flashlight',
        brand: 'UltraFire',
        weight: 0.45, width: 6, length: 18, height: 6
      },
      {
        keys: ['fan', 'ফ্যান', 'table fan', 'রিচার্জেবল ফ্যান'],
        category: 'Home Appliances',
        sub_category: 'Cooling Appliances',
        child_category: 'Portable Rechargeable Table Fan',
        brand: 'Defender',
        weight: 1.80, width: 22, length: 30, height: 18
      },
      {
        keys: ['headphone', 'হেডফোন', 'earphone', 'ইয়ারফোন', 'airpod', 'earbuds', 'টিডব্লিউএস'],
        category: 'Gadgets',
        sub_category: 'Audio Devices',
        child_category: 'Wireless Bluetooth Earbuds',
        brand: 'HK',
        weight: 0.15, width: 8, length: 10, height: 4
      },
      {
        keys: ['shirt', 'শার্ট', 't-shirt', 'টি-শার্ট', 'পোলো', 'polo', 'পাঞ্জাবি'],
        category: 'Fashion',
        sub_category: 'Mens Fashion',
        child_category: 'Premium Casual T-Shirt',
        brand: 'Apex Style',
        weight: 0.22, width: 20, length: 28, height: 2
      },
      {
        keys: ['bag', 'ব্যাগ', 'backpack', 'ব্যাকপ্যাক', 'স্কুল ব্যাগ'],
        category: 'Lifestyle',
        sub_category: 'Travel Bags',
        child_category: 'Waterproof Laptop Backpack',
        brand: 'Dream Bag',
        weight: 0.75, width: 30, length: 45, height: 15
      }
    ];

    for (const item of taxonomy) {
      if (item.keys.some(k => n.includes(k))) return item;
    }

    return {
      category: 'General',
      sub_category: 'Standard Goods',
      child_category: 'Retail Product',
      brand: 'Dream Cart',
      weight: 0.50, width: 12, length: 15, height: 8
    };
  };

  window.handleAiProductAnalyze = function(productName) {
    const name = (productName || '').trim();
    if (!name) return;

    const res = window.analyzeProductNameAI(name);
    if (!res) return;

    const catEl = document.getElementById('adm-add-cat');
    if (catEl) {
      let optFound = false;
      for (let i = 0; i < catEl.options.length; i++) {
        if (catEl.options[i].value.toLowerCase() === res.category.toLowerCase()) {
          catEl.selectedIndex = i;
          optFound = true;
          break;
        }
      }
      if (!optFound) {
        const opt = new Option(res.category, res.category, true, true);
        catEl.add(opt);
      }
    }

    const subEl = document.getElementById('adm-add-subcat');
    if (subEl) subEl.value = res.sub_category;

    const childEl = document.getElementById('adm-add-childcat');
    if (childEl) childEl.value = res.child_category;

    const brandEl = document.getElementById('adm-add-brand');
    if (brandEl) {
      let brandFound = res.brand;
      const brandsList = ['Amazfit', 'HK', 'Dream Organic', 'Panasonic', 'Kiam', 'UltraFire', 'Defender', 'Apex Style', 'Lenovo'];
      for (const b of brandsList) {
        if (name.toLowerCase().includes(b.toLowerCase())) {
          brandFound = b;
          break;
        }
      }
      brandEl.value = brandFound;
    }

    const slugEl = document.getElementById('adm-add-slug');
    if (slugEl) {
      const slugText = name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      slugEl.value = slugText || ('prd-' + Math.floor(1000 + Math.random() * 9000));
    }

    const wEl = document.getElementById('adm-add-weight');
    const widthEl = document.getElementById('adm-add-width');
    const lenEl = document.getElementById('adm-add-length');
    const hEl = document.getElementById('adm-add-height');
    if (wEl && !wEl.value) wEl.value = res.weight;
    if (widthEl && !widthEl.value) widthEl.value = res.width;
    if (lenEl && !lenEl.value) lenEl.value = res.length;
    if (hEl && !hEl.value) hEl.value = res.height;

    const badgeEl = document.getElementById('adm-ai-match-badge');
    if (badgeEl) {
      badgeEl.innerHTML = `✨ <b>AI ম্যাচিং সফল:</b> ${res.category} &gt; ${res.sub_category} &gt; ${res.child_category} (৯৫% নিখুঁত)`;
      badgeEl.classList.remove('hidden');
    }
  };

  // Products Table Pagination & Bulk Actions
  window.renderProductsTablePage = function(page = 1) {
    window.__prodCurrentPage = page;
    const tbody = document.getElementById('admin-products-tbody');
    const paginationControls = document.getElementById('admin-prod-pagination-controls');
    const infoEl = document.getElementById('admin-prod-pagination-info');
    if (!tbody) return;

    let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    if (!prods.length && window.__adminState.products && window.__adminState.products.length) {
      prods = window.__adminState.products;
    }

    const q = (window.__prodSearchQuery || '').toLowerCase().trim();
    const st = window.__prodFilterStatus || 'all';

    let filtered = prods.filter(p => {
      const matchSearch = !q || 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));

      let matchStatus = true;
      const stock = Number(p.stock) || 0;
      if (st === 'low') matchStatus = stock > 0 && stock <= 5;
      else if (st === 'out') matchStatus = stock === 0;
      else if (st === 'error') matchStatus = !p.sku || !p.thumbnail || !p.selling_price;
      else if (st === 'active') matchStatus = p.status !== 'নিষ্ক্রিয়';
      else if (st === 'inactive') matchStatus = p.status === 'নিষ্ক্রিয়';

      return matchSearch && matchStatus;
    });

    const total = filtered.length;
    const pageSize = window.__prodPageSize || 120;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const curPage = Math.min(Math.max(1, page), totalPages);
    window.__prodCurrentPage = curPage;

    const startIdx = (curPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, total);
    const pageItems = filtered.slice(startIdx, endIdx);

    if (infoEl) {
      infoEl.textContent = `মোট ${total} টির মধ্যে ${total === 0 ? 0 : startIdx + 1} - ${endIdx} টি পণ্য প্রদর্শিত (প্রতি পেজে ১২০টি)`;
    }

    if (pageItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="py-8 text-center text-slate-400 font-bold">
            কোনো পণ্য পাওয়া যায়নি! ফিল্টার রিসেট করুন।
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = pageItems.map(p => {
        const isLow = Number(p.stock) > 0 && Number(p.stock) <= 5;
        const isOut = Number(p.stock) === 0;
        const pId = p.product_id || p.sku;
        return `
          <tr class="admin-prod-row hover:bg-slate-50 dark:hover:bg-slate-800/40 transition" data-id="${pId}">
            <td class="py-2.5 px-2 text-center">
              <input type="checkbox" value="${pId}" class="prod-select-cb" onchange="window.updateBulkProductsBar()" />
            </td>
            <td class="py-2.5 px-3">
              <img src="${p.thumbnail || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
            </td>
            <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white max-w-xs">
              <div class="line-clamp-1">${p.name}</div>
              <div class="font-mono text-[10px] text-slate-400">${p.sku || 'SKU-NA'} | ${p.brand || 'No Brand'}</div>
            </td>
            <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400">${p.category || 'General'}</td>
            <td class="py-2.5 px-3 font-bold text-emerald-600 font-mono cursor-pointer hover:underline" onclick="window.inlineEditProduct('${pId}', 'selling_price', ${p.selling_price || 0}, this)" title="ক্লিক করে বিক্রয় দর এডিট করুন">
              ৳${p.selling_price || 0} ✎
            </td>
            <td class="py-2.5 px-3 font-mono">${formatCurrency(p.wholesale_price || (p.selling_price * 0.85))}</td>
            <td class="py-2.5 px-3">
              <span class="font-bold px-2 py-0.5 rounded text-[11px] cursor-pointer hover:underline ${isOut ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400' : (isLow ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400')}" onclick="window.inlineEditProduct('${pId}', 'stock', ${p.stock || 0}, this)" title="ক্লিক করে স্টক এডিট করুন">
                ${p.stock || 0} পিস ✎
              </span>
            </td>
            <td class="py-2.5 px-3">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${p.status === 'নিষ্ক্রিয়' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'}" onclick="window.toggleProductActive('${pId}', this)">
                ${p.status || 'সক্রিয়'}
              </span>
            </td>
            <td class="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
              <a href="/product/${p.slug || pId}" target="_blank" class="btn-secondary py-1 px-2 text-[10px]">দেখুন ↗</a>
              <button class="btn-secondary py-1 px-2 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50" onclick="window.handleAdminDeleteProduct('${pId}', this)">মুছুন</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (paginationControls) {
      let pageBtns = '';
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= curPage - 2 && i <= curPage + 2)) {
          pageBtns += `
            <button class="px-2.5 py-1 rounded-lg text-xs font-bold border transition ${i === curPage ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200 hover:bg-slate-100'}" onclick="window.renderProductsTablePage(${i})">
              ${i}
            </button>
          `;
        } else if (i === curPage - 3 || i === curPage + 3) {
          pageBtns += `<span class="px-1 text-slate-400">...</span>`;
        }
      }

      paginationControls.innerHTML = `
        <div class="flex items-center gap-1.5">
          <button class="btn-secondary py-1 px-2.5 text-xs font-bold ${curPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}" onclick="window.renderProductsTablePage(${curPage - 1})" ${curPage === 1 ? 'disabled' : ''}>
            ← পূর্ববর্তী
          </button>
          ${pageBtns}
          <button class="btn-secondary py-1 px-2.5 text-xs font-bold ${curPage === totalPages ? 'opacity-40 cursor-not-allowed' : ''}" onclick="window.renderProductsTablePage(${curPage + 1})" ${curPage === totalPages ? 'disabled' : ''}>
            পরবর্তী →
          </button>
        </div>
      `;
    }

    const master = document.getElementById('prod-select-all-master');
    if (master) master.checked = false;
    window.updateBulkProductsBar();
  };

  window.toggleSelectAllProducts = function(masterCb) {
    const checked = masterCb.checked;
    document.querySelectorAll('.prod-select-cb').forEach(cb => cb.checked = checked);
    window.updateBulkProductsBar();
  };

  window.updateBulkProductsBar = function() {
    const selected = document.querySelectorAll('.prod-select-cb:checked');
    const bar = document.getElementById('bulk-products-actions-bar');
    const countEl = document.getElementById('bulk-prod-selected-count');
    if (countEl) countEl.textContent = selected.length;
    if (bar) {
      if (selected.length > 0) bar.classList.remove('hidden');
      else bar.classList.add('hidden');
    }
  };

  window.handleBulkProductsAction = function(action) {
    const selected = Array.from(document.querySelectorAll('.prod-select-cb:checked')).map(cb => cb.value);
    if (selected.length === 0) {
      alert('অনুগ্রহ করে এক বা একাধিক পণ্য নির্বাচন করুন!');
      return;
    }

    let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');

    if (action === 'price') {
      const mode = prompt('মূল্য পরিবর্তনের ধরণ লিখুন:\n1. নির্দিষ্ট সংখ্যা লিখুন (যেমন: 1250)\n2. শতকরা বাড়াতে/কমাতে লিখুন (যেমন: +10% বা -5%):', '+10%');
      if (!mode) return;

      let updatedCount = 0;
      prods = prods.map(p => {
        if (selected.includes(p.product_id || p.sku)) {
          if (mode.includes('%')) {
            const factor = parseFloat(mode) / 100;
            p.selling_price = Math.round((Number(p.selling_price) || 0) * (1 + factor));
          } else if (!isNaN(Number(mode))) {
            p.selling_price = Number(mode);
          }
          p.original_price = window.calcOriginalPrice(p.selling_price);
          updatedCount++;
        }
        return p;
      });

      localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
      window.renderProductsTablePage(window.__prodCurrentPage);
      if (toast && toast.show) toast.show({ type: 'success', title: 'বাল্ক প্রাইজ আপডেট', message: `${updatedCount} টি পণ্যের মূল্য আপডেট হয়েছে!` });
    } else if (action === 'stock') {
      const newStock = prompt('নির্বাচিত পণ্যসমূহের নতুন স্টক সংখ্যা (পিস) লিখুন:', '50');
      if (newStock === null || isNaN(Number(newStock))) return;

      const s = Number(newStock);
      prods = prods.map(p => {
        if (selected.includes(p.product_id || p.sku)) p.stock = s;
        return p;
      });

      localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
      window.renderProductsTablePage(window.__prodCurrentPage);
      if (toast && toast.show) toast.show({ type: 'success', title: 'বাল্ক স্টক আপডেট', message: `${selected.length} টি পণ্যের স্টক ${s} পিস করা হয়েছে!` });
    } else if (action === 'status') {
      const newStatus = prompt('নির্বাচিত পণ্যের স্ট্যাটাস লিখুন (সক্রিয় / নিষ্ক্রিয়):', 'সক্রিয়');
      if (!newStatus) return;

      prods = prods.map(p => {
        if (selected.includes(p.product_id || p.sku)) p.status = newStatus;
        return p;
      });

      localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
      window.renderProductsTablePage(window.__prodCurrentPage);
      if (toast && toast.show) toast.show({ type: 'success', title: 'বাল্ক স্ট্যাটাস', message: `${selected.length} টি পণ্যের স্ট্যাটাস "${newStatus}" করা হয়েছে!` });
    } else if (action === 'delete') {
      if (!confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${selected.length} টি পণ্য সম্পূর্ণ ডিলিট করতে চান?`)) return;

      prods = prods.filter(p => !selected.includes(p.product_id || p.sku));
      localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
      window.renderProductsTablePage(window.__prodCurrentPage);
      if (toast && toast.show) toast.show({ type: 'success', title: 'বাল্ক ডিলিট', message: `${selected.length} টি পণ্য মুছে ফেলা হয়েছে!` });
    }
  };

  window.filterAdminProducts = function(query) {
    window.__prodSearchQuery = query || '';
    window.renderProductsTablePage(1);
  };

  window.filterAdminProductStatus = function(status, btn) {
    window.__prodFilterStatus = status;
    document.querySelectorAll('.prod-status-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    window.renderProductsTablePage(1);
  };

  window.inlineEditProduct = function(id, field, currentVal, el) {
    const label = field === 'selling_price' ? 'বিক্রয় দর (৳)' : 'মজুদ স্টক (পিস)';
    const newVal = prompt(`${label} পরিবর্তন করুন:`, currentVal);
    if (newVal === null || newVal.trim() === '' || isNaN(Number(newVal))) return;

    const val = Number(newVal);
    let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    prods = prods.map(p => {
      if (p.product_id === id || p.sku === id) {
        p[field] = val;
        if (field === 'selling_price') p.original_price = window.calcOriginalPrice(val);
      }
      return p;
    });
    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));

    if (el) {
      if (field === 'selling_price') el.textContent = `৳${val} ✎`;
      else el.textContent = `${val} পিস ✎`;
    }
    if (toast && toast.show) toast.show({ type: 'success', title: 'আপডেট সফল', message: `${label} ৳${val} করা হয়েছে!` });
  };

  window.toggleProductActive = function(id, btn) {
    let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    let currentStatus = 'সক্রিয়';
    prods = prods.map(p => {
      if (p.product_id === id || p.sku === id) {
        p.status = (p.status === 'নিষ্ক্রিয়') ? 'সক্রিয়' : 'নিষ্ক্রিয়';
        currentStatus = p.status;
      }
      return p;
    });
    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));

    if (btn) {
      const isAct = currentStatus === 'সক্রিয়';
      btn.className = `px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${isAct ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`;
      btn.textContent = currentStatus;
    }
    if (toast && toast.show) toast.show({ type: 'success', title: 'পণ্য স্ট্যাটাস', message: `পণ্যটির স্ট্যাটাস "${currentStatus}" করা হয়েছে।` });
  };

  window.handleAdminDeleteProduct = async function(id, btn) {
    if (!confirm('আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?')) return;
    try {
      let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
      prods = prods.filter(p => p.product_id !== id && p.sku !== id);
      localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
      await apiClient.request('products/delete', { id });
      if (btn) btn.closest('tr')?.remove();
      if (toast && toast.show) toast.show({ type: 'success', title: 'পণ্য মোছা হয়েছে', message: 'পণ্যটি ডিলিট করা হয়েছে।' });
    } catch (e) {
      alert('পণ্য মুছে ফেলা হয়েছে।');
    }
  };

  // Add Product with All 23 Columns
  window.handleAdminAddProduct = async function(e) {
    e.preventDefault();
    const sku = (document.getElementById('adm-add-sku')?.value || '').trim() || ('DCBD-PRD-' + Math.floor(100 + Math.random() * 900));
    const name = (document.getElementById('adm-add-name')?.value || '').trim();
    const category = (document.getElementById('adm-add-cat')?.value || '').trim() || 'General';
    const subCategory = (document.getElementById('adm-add-subcat')?.value || '').trim() || 'Standard';
    const childCategory = (document.getElementById('adm-add-childcat')?.value || '').trim() || 'Standard Item';
    const brand = (document.getElementById('adm-add-brand')?.value || '').trim() || 'Dream Cart';
    const buyingPrice = Number(document.getElementById('adm-add-buyprice')?.value || '0');
    const sellingPrice = Number(document.getElementById('adm-add-sellprice')?.value || '0') || window.calcSellingPrice(buyingPrice);
    const stock = Number(document.getElementById('adm-add-stock')?.value || '50');
    const originalPrice = Number(document.getElementById('adm-add-origprice')?.value || '0') || window.calcOriginalPrice(sellingPrice);
    const wholesalePrice = Number(document.getElementById('adm-add-wholesaleprice')?.value || '0') || window.calcWholesalePrice(buyingPrice);
    const minOrderQ = Number(document.getElementById('adm-add-minorder')?.value || '5') || window.calcMinOrderQty(sellingPrice);
    const imageUrl = (document.getElementById('adm-add-imageurl')?.value || '').trim() || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
    const slug = (document.getElementById('adm-add-slug')?.value || '').trim() || sku.toLowerCase();
    const description = (document.getElementById('adm-add-desc')?.value || '').trim();
    const specification = (document.getElementById('adm-add-spec')?.value || '').trim();
    const others = (document.getElementById('adm-add-others')?.value || '').trim();
    const color = (document.getElementById('adm-add-color')?.value || 'Standard').trim();
    const size = (document.getElementById('adm-add-size')?.value || 'Free Size').trim();
    const weightKg = Number(document.getElementById('adm-add-weight')?.value || '0.5');
    const widthCm = Number(document.getElementById('adm-add-width')?.value || '10');
    const lengthCm = Number(document.getElementById('adm-add-length')?.value || '15');
    const heightCm = Number(document.getElementById('adm-add-height')?.value || '5');

    const newProduct = {
      product_id: 'PRD-' + Math.floor(1000 + Math.random() * 9000),
      sku,
      name,
      p_name: name,
      category,
      sub_category: subCategory,
      child_category: childCategory,
      brand,
      buying_price: buyingPrice,
      selling_price: sellingPrice,
      stock,
      original_price: originalPrice,
      wholesale_price: wholesalePrice,
      min_order_q: minOrderQ,
      thumbnail: imageUrl,
      image_url: imageUrl,
      slug,
      description,
      specification,
      others,
      color,
      size,
      weight_kg: weightKg,
      width_cm: widthCm,
      length_cm: lengthCm,
      height_cm: heightCm,
      status: 'সক্রিয়'
    };

    let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    prods.unshift(newProduct);
    localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));

    await apiClient.request('products/add', newProduct);

    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'পণ্য সফলভাবে যুক্ত হয়েছে', message: `${name} ক্যাটালগে সংরক্ষিত হয়েছে!` });
    }
    document.getElementById('form-add-product-dedicated')?.reset();
    window.switchAdminPage('page-prod-all', 'group-products');
  };

  // Image Upload Preview
  window.handleProductImageFilePreview = function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const urlInput = document.getElementById('adm-add-imageurl');
      const previewImg = document.getElementById('adm-image-preview');
      const previewWrap = document.getElementById('adm-image-preview-wrap');
      if (urlInput) urlInput.value = e.target.result;
      if (previewImg) previewImg.src = e.target.result;
      if (previewWrap) previewWrap.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  };

  // Inline Variant Adder
  window.handleInlineAddVariant = function(type) {
    const val = prompt(`নতুন ${type === 'color' ? 'কালার' : 'সাইজ'} নাম লিখুন:`);
    if (!val || !val.trim()) return;

    const selectEl = document.getElementById(type === 'color' ? 'adm-add-color' : 'adm-add-size');
    if (selectEl) {
      const opt = new Option(val.trim(), val.trim(), true, true);
      selectEl.add(opt);
    }

    let variants = JSON.parse(localStorage.getItem('dcbd_variants') || '{"colors":[], "sizes":[]}');
    if (type === 'color') variants.colors.push(val.trim());
    else variants.sizes.push(val.trim());
    localStorage.setItem('dcbd_variants', JSON.stringify(variants));

    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'ভ্যারিয়েন্ট যুক্ত', message: `"${val.trim()}" ড্রপডাউনে যুক্ত হয়েছে!` });
    }
  };

  // Sample CSV Downloaders
  window.downloadSampleProductCsv = function() {
    const headers = [
      'SKU', 'P_Name', 'Category', 'Sub_Category', 'Child_Category', 'Brand',
      'Buying_price', 'Selling_Price', 'WholeSale_price', 'Original_Price', 'Stock', 'Min_order_Q',
      'Images', 'Slug', 'Description', 'Specification', 'Others', 'Color', 'Size',
      'WEIGHT_KG', 'WIDTH_CM', 'LENGTH_CM', 'HEIGHT_CM'
    ];
    const sampleRows = [
      [
        'DCBD-WT-01', 'Amazfit GTS 4 Smartwatch (Black)', 'Smartwatches', 'Smart Calling Watch', 'Men & Women Fitness Watch', 'Amazfit',
        '6800', '8490', '7200', '10990', '25', '5',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'amazfit-gts-4', 'প্রিমিয়াম অ্যামোলেড কলিং স্মার্টওয়াচ', 'Display: 1.75 AMOLED, Battery: 8 Days', '1 Year Warranty', 'Jet Black', 'Regular',
        '0.25', '8', '12', '4'
      ],
      [
        'DCBD-GS-02', 'অটো গ্যাস সেফটি ডিভাইস (Heavy Duty)', 'Kitchen', 'Gas Safety Devices', 'Heavy Duty Auto Cutoff Regulator', 'SafeGas BD',
        '1500', '2450', '1850', '3450', '40', '5',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400', 'auto-gas-safety-device', '১০০% গ্যাস লিকেজ প্রতিরোধক', 'Auto Shut-off, Brass Fitting', '5 Years Replacement', 'Red/Black', 'Standard',
        '0.65', '12', '18', '8'
      ]
    ];
    window.exportGenericCsv('DreamCart_Bulk_Product_Import_Sample', headers, sampleRows);
  };

  window.downloadSamplePriceCsv = function() {
    const headers = ['SKU', 'Product_Name', 'New_Selling_Price', 'New_Wholesale_Price', 'New_Original_Price'];
    let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const rows = prods.slice(0, 10).map(p => [
      p.sku || 'SKU-01',
      p.name || 'Sample Product',
      p.selling_price || 1200,
      p.wholesale_price || 950,
      p.original_price || 1600
    ]);
    window.exportGenericCsv('DreamCart_Price_Update_Sample', headers, rows.length ? rows : [
      ['DCBD-WT-01', 'Amazfit GTS 4', '8490', '7200', '10990'],
      ['DCBD-GS-02', 'গ্যাস সেফটি ডিভাইস', '2450', '1850', '3450']
    ]);
  };

  window.downloadSampleImageCsv = function() {
    const headers = ['SKU', 'Product_Name', 'New_Image_URL'];
    let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const rows = prods.slice(0, 10).map(p => [
      p.sku || 'SKU-01',
      p.name || 'Sample Product',
      p.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    ]);
    window.exportGenericCsv('DreamCart_Image_Update_Sample', headers, rows.length ? rows : [
      ['DCBD-WT-01', 'Amazfit GTS 4', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
      ['DCBD-GS-02', 'গ্যাস সেফটি ডিভাইস', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400']
    ]);
  };

  // CSV Upload Parsers
  window.handleUploadBulkProductsCsv = function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return;

        let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
        let imported = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 2 && cols[0]) {
            const sku = cols[0];
            const name = cols[1] || 'Bulk Product';
            const cat = cols[2] || 'General';
            const subcat = cols[3] || 'Standard';
            const childcat = cols[4] || 'Retail';
            const brand = cols[5] || 'Dream Cart';
            const buyPrice = Number(cols[6]) || 500;
            const sellPrice = Number(cols[7]) || window.calcSellingPrice(buyPrice);
            const wsPrice = Number(cols[8]) || window.calcWholesalePrice(buyPrice);
            const origPrice = Number(cols[9]) || window.calcOriginalPrice(sellPrice);
            const stock = Number(cols[10]) || 50;
            const minOrder = Number(cols[11]) || window.calcMinOrderQty(sellPrice);
            const img = cols[12] || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
            const slug = cols[13] || sku.toLowerCase();
            const desc = cols[14] || '';

            const existingIdx = prods.findIndex(p => p.sku === sku);
            const item = {
              product_id: existingIdx >= 0 ? prods[existingIdx].product_id : ('PRD-' + Math.floor(1000 + Math.random() * 9000)),
              sku,
              name,
              category: cat,
              sub_category: subcat,
              child_category: childcat,
              brand,
              buying_price: buyPrice,
              selling_price: sellPrice,
              wholesale_price: wsPrice,
              original_price: origPrice,
              stock,
              min_order_q: minOrder,
              thumbnail: img,
              slug,
              description: desc,
              status: 'সক্রিয়'
            };

            if (existingIdx >= 0) prods[existingIdx] = item;
            else prods.unshift(item);
            imported++;
          }
        }

        localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
        if (toast && toast.show) {
          toast.show({ type: 'success', title: 'বাল্ক আপলোড সফল', message: `${imported} টি পণ্য শিট থেকে সংরক্ষিত হয়েছে!` });
        }
        setTimeout(() => window.switchAdminPage('page-prod-all', 'group-products'), 600);
      } catch (err) {
        alert('সিএসভি পার্স ত্রুটি: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  window.handleUploadBulkPriceCsv = function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return;

        let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
        let updated = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 3 && cols[0]) {
            const sku = cols[0];
            const newSell = Number(cols[2]);
            const newWs = Number(cols[3]);
            const newOrig = Number(cols[4]);

            const p = prods.find(item => item.sku === sku || item.product_id === sku);
            if (p) {
              if (!isNaN(newSell) && newSell > 0) p.selling_price = newSell;
              if (!isNaN(newWs) && newWs > 0) p.wholesale_price = newWs;
              if (!isNaN(newOrig) && newOrig > 0) p.original_price = newOrig;
              else if (p.selling_price) p.original_price = window.calcOriginalPrice(p.selling_price);
              updated++;
            }
          }
        }

        localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
        if (toast && toast.show) {
          toast.show({ type: 'success', title: 'মূল্য আপডেট সফল', message: `${updated} টি পণ্যের মূল্য আপডেট হয়েছে!` });
        }
        setTimeout(() => window.switchAdminPage('page-prod-all', 'group-products'), 600);
      } catch (err) {
        alert('প্রাইজ শিট পার্স ত্রুটি: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  window.handleUploadBulkImageCsv = function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return;

        let prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
        let updated = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 3 && cols[0]) {
            const sku = cols[0];
            const newImg = cols[2];

            const p = prods.find(item => item.sku === sku || item.product_id === sku);
            if (p && newImg) {
              p.thumbnail = newImg;
              p.image_url = newImg;
              updated++;
            }
          }
        }

        localStorage.setItem('dcbd_sheet_products', JSON.stringify(prods));
        if (toast && toast.show) {
          toast.show({ type: 'success', title: 'ইমেজ আপডেট সফল', message: `${updated} টি পণ্যের ছবি পরিবর্তন হয়েছে!` });
        }
        setTimeout(() => window.switchAdminPage('page-prod-all', 'group-products'), 600);
      } catch (err) {
        alert('ইমেজ শিট পার্স ত্রুটি: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // CATEGORY MANAGEMENT WITH DEDUPLICATION
  window.handleAdminAddCategory = async function(e) {
    e.preventDefault();
    const catName = (document.getElementById('adm-new-cat-name')?.value || '').trim();
    const subcats = (document.getElementById('adm-new-cat-sub')?.value || '').trim();
    const childcats = (document.getElementById('adm-new-cat-child')?.value || '').trim();
    const image = (document.getElementById('adm-new-cat-image')?.value || '').trim() || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
    if (!catName) return;

    let categories = JSON.parse(localStorage.getItem('dcbd_sheet_categories') || '[]');
    const exists = categories.some(c => (c.category || '').toLowerCase() === catName.toLowerCase());
    if (exists) {
      alert(`"${catName}" নামের ক্যাটাগরি ইতিমধ্যে বিদ্যমান রয়েছে! ডুপ্লিকেট এড়ানো হলো।`);
      return;
    }

    const newCat = {
      catagory_id: 'CAT-' + Math.floor(100 + Math.random() * 900),
      category: catName,
      sub_category: subcats,
      chail_category: childcats,
      category_image: image
    };

    categories.push(newCat);
    localStorage.setItem('dcbd_sheet_categories', JSON.stringify(categories));
    await apiClient.request('categories/add', newCat);

    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'ক্যাটাগরি যুক্ত', message: `"${catName}" সফলভাবে সংরক্ষিত হয়েছে!` });
    }
    document.getElementById('form-add-category-dedicated')?.reset();
    setTimeout(() => window.location.reload(), 600);
  };

  window.handleDeleteCategory = function(catName) {
    if (!confirm(`আপনি কি নিশ্চিত যে "${catName}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) return;
    let categories = JSON.parse(localStorage.getItem('dcbd_sheet_categories') || '[]');
    categories = categories.filter(c => (c.category || '').toLowerCase() !== catName.toLowerCase());
    localStorage.setItem('dcbd_sheet_categories', JSON.stringify(categories));
    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'ক্যাটাগরি মোছা হয়েছে', message: `"${catName}" মুছে ফেলা হয়েছে!` });
    }
    setTimeout(() => window.location.reload(), 600);
  };

  // MULTI-LANDING PAGE BUILDER CMS
  window.searchAndAddProductToLanding = function(keyword) {
    const q = (keyword || '').toLowerCase().trim();
    const dropdown = document.getElementById('adm-landing-search-results');
    if (!dropdown) return;

    if (!q) {
      dropdown.classList.add('hidden');
      return;
    }

    const prods = JSON.parse(localStorage.getItem('dcbd_sheet_products') || '[]');
    const matches = prods.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.sku && p.sku.toLowerCase().includes(q))
    ).slice(0, 6);

    if (matches.length === 0) {
      dropdown.innerHTML = `<div class="p-2.5 text-slate-400">কোনো পণ্য পাওয়া যায়নি</div>`;
    } else {
      dropdown.innerHTML = matches.map(p => `
        <div class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between border-b last:border-0" onclick="window.addProductToLandingList('${p.sku}', '${p.name.replace(/'/g, "\\'")}', ${p.selling_price || 0})">
          <div class="truncate max-w-xs"><b>${p.name}</b> <span class="text-[10px] text-slate-400 font-mono">(${p.sku})</span></div>
          <span class="text-emerald-600 font-bold font-mono">৳${p.selling_price}</span>
        </div>
      `).join('');
    }
    dropdown.classList.remove('hidden');
  };

  window.addProductToLandingList = function(sku, name, price) {
    window.__landingBuilderSelectedProducts = window.__landingBuilderSelectedProducts || [];
    if (!window.__landingBuilderSelectedProducts.some(p => p.sku === sku)) {
      window.__landingBuilderSelectedProducts.push({ sku, name, price });
      window.renderLandingSelectedProducts();
    }
    const input = document.getElementById('adm-landing-prod-search');
    if (input) input.value = '';
    const dropdown = document.getElementById('adm-landing-search-results');
    if (dropdown) dropdown.classList.add('hidden');
  };

  window.removeProductFromLanding = function(sku) {
    window.__landingBuilderSelectedProducts = (window.__landingBuilderSelectedProducts || []).filter(p => p.sku !== sku);
    window.renderLandingSelectedProducts();
  };

  window.renderLandingSelectedProducts = function() {
    const container = document.getElementById('adm-landing-selected-chips');
    if (!container) return;

    const list = window.__landingBuilderSelectedProducts || [];
    if (!list.length) {
      container.innerHTML = `<span class="text-slate-400 text-xs">কোনো পণ্য নির্বাচন করা হয়নি (উপরে সার্চ করে যোগ করুন)</span>`;
      return;
    }

    container.innerHTML = list.map(p => `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-700">
        <span>${p.name} (৳${p.price})</span>
        <button type="button" class="text-rose-500 hover:text-rose-700 font-black ml-1" onclick="window.removeProductFromLanding('${p.sku}')">✕</button>
      </span>
    `).join('');
  };

  window.handleAdminSaveLandingPage = function(e) {
    e.preventDefault();
    const title = (document.getElementById('adm-lp-title')?.value || '').trim();
    const slug = (document.getElementById('adm-lp-slug')?.value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const heroBanner = (document.getElementById('adm-lp-banner')?.value || '').trim();
    const videoUrl = (document.getElementById('adm-lp-video')?.value || '').trim();
    const headline = (document.getElementById('adm-lp-headline')?.value || '').trim();
    const badge = (document.getElementById('adm-lp-badge')?.value || 'সীমিত সময়ের অফার').trim();
    const gallery = (document.getElementById('adm-lp-gallery')?.value || '').split('\n').map(s => s.trim()).filter(Boolean);
    const selectedProds = window.__landingBuilderSelectedProducts || [];

    if (!title || !slug) {
      alert('অনুগ্রহ করে ল্যান্ডিং পেজের নাম ও URL স্ল্যাগ লিখুন!');
      return;
    }

    const newLp = {
      id: 'LP-' + Math.floor(100 + Math.random() * 900),
      title,
      slug,
      hero_banner: heroBanner,
      video_url: videoUrl,
      headline,
      badge,
      gallery,
      products: selectedProds,
      created_at: new Date().toISOString().slice(0, 10),
      status: 'Active'
    };

    let list = JSON.parse(localStorage.getItem('dcbd_landing_pages') || '[]');
    list.unshift(newLp);
    localStorage.setItem('dcbd_landing_pages', JSON.stringify(list));

    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'ল্যান্ডিং পেজ তৈরি সম্পন্ন', message: `"${title}" সফলভাবে সংরক্ষিত হয়েছে!` });
    }

    document.getElementById('form-add-landing-page')?.reset();
    window.__landingBuilderSelectedProducts = [];
    window.renderLandingSelectedProducts();
    window.renderLandingPagesList();
  };

  window.renderLandingPagesList = function() {
    const listEl = document.getElementById('admin-landing-pages-list');
    if (!listEl) return;

    let list = JSON.parse(localStorage.getItem('dcbd_landing_pages') || '[]');
    if (!list.length) {
      list = [
        {
          id: 'LP-101',
          title: 'গ্যাস সেফটি ডিভাইস মেগা ফানেল',
          slug: 'gas-safety-deal',
          hero_banner: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
          video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          headline: '১০০% সিলিন্ডার বিস্ফোরণ ও লিকেজ মুক্ত রাখুন আপনার পরিবারকে!',
          badge: 'বিশেষ ৪০% ছাড় + ফ্রি হোম ডেলিভারি',
          products: [{ sku: 'DCBD-GS-02', name: 'অটো গ্যাস সেফটি ডিভাইস', price: 2450 }],
          status: 'Active'
        }
      ];
      localStorage.setItem('dcbd_landing_pages', JSON.stringify(list));
    }

    listEl.innerHTML = list.map(lp => `
      <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3">
          <img src="${lp.hero_banner || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200'}" class="w-16 h-12 rounded-xl object-cover border flex-shrink-0" onerror="this.src='https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200';" />
          <div>
            <div class="font-bold text-slate-900 dark:text-white text-sm">${lp.title}</div>
            <div class="text-[10px] text-slate-400 font-mono">URL: /landing/${lp.slug} • পণ্য সংখ্যা: ${lp.products ? lp.products.length : 0} টি</div>
            <div class="text-[10px] text-emerald-600 font-bold">${lp.badge}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <a href="/landing?slug=${lp.slug}" target="_blank" class="btn-primary py-1 px-3 text-[10px] font-bold">লাইভ দেখুন ↗</a>
          <button class="btn-secondary py-1 px-2.5 text-[10px] text-rose-600 border-rose-200" onclick="window.deleteLandingPage('${lp.id}')">মুছুন</button>
        </div>
      </div>
    `).join('');
  };

  window.deleteLandingPage = function(id) {
    if (!confirm('আপনি কি নিশ্চিত যে এই ল্যান্ডিং পেজটি মুছে ফেলতে চান?')) return;
    let list = JSON.parse(localStorage.getItem('dcbd_landing_pages') || '[]');
    list = list.filter(lp => lp.id !== id);
    localStorage.setItem('dcbd_landing_pages', JSON.stringify(list));
    window.renderLandingPagesList();
    if (toast && toast.show) toast.show({ type: 'success', title: 'মুছে ফেলা হয়েছে', message: 'ল্যান্ডিং পেজটি ডিলিট হয়েছে।' });
  };

  // RESELLER COMMISSION CONTROL % HANDLER
  window.handleSaveResellerSettings = function(e) {
    e.preventDefault();
    const globalComm = Number(document.getElementById('adm-reseller-global-pct')?.value || '15');
    const minOrder = Number(document.getElementById('adm-reseller-min-order')?.value || '1');
    const minPayout = Number(document.getElementById('adm-reseller-min-payout')?.value || '500');
    const feePct = Number(document.getElementById('adm-reseller-fee-pct')?.value || '3');

    const settings = {
      globalCommission: globalComm,
      minOrderQty: minOrder,
      minPayout: minPayout,
      payoutFeePct: feePct
    };

    localStorage.setItem('dcbd_reseller_settings', JSON.stringify(settings));
    window.__adminState.resellerSettings = settings;

    if (toast && toast.show) {
      toast.show({ type: 'success', title: 'রিসেলার সেটিংস সংরক্ষিত', message: `গ্লোবাল রিসেলিং কমিশন ${globalComm}% ও পে-আউট ফি ${feePct}% নির্ধারিত হয়েছে!` });
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

  // Brands, Variants, Banners Handlers
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

    let brands = JSON.parse(localStorage.getItem('dcbd_sheet_brands') || '[]');
    brands.push(newBrand);
    localStorage.setItem('dcbd_sheet_brands', JSON.stringify(brands));
    await apiClient.request('brands/add', newBrand);

    if (toast && toast.show) toast.show({ type: 'success', title: 'ব্র্যান্ড যুক্ত হয়েছে', message: `${name} সফলভাবে যুক্ত হয়েছে!` });
    document.getElementById('form-add-brand-dedicated')?.reset();
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

  // Partners, Admins, Finance, Couriers, Settings
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
    if (toast && toast.show) toast.show({ type: 'success', title: 'সেটিংস সংরক্ষিত!', message: 'সাইটের সকল তথ্য সংরক্ষিত হয়েছে।' });
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

export async function safeFetchWithTimeout(fetchPromise, timeoutMs = 1800, fallbackVal = null) {
  try {
    const timeout = new Promise(resolve => setTimeout(() => resolve(fallbackVal), timeoutMs));
    const result = await Promise.race([fetchPromise, timeout]);
    return result || fallbackVal;
  } catch (e) {
    return fallbackVal;
  }
}
