/**
 * DREAM CART BD — CLEAN PATH SPA CLIENT ROUTER (router.js)
 * Implements clean path routing: domain/products, domain/cart, domain/admin (ZERO hash '#' URLs)
 * - Strictly decouples Admin Panel code & styles from Customer Storefront pages (lazy-loaded only on /admin/*)
 * - Branded Dream Cart BD Logo Loader on all page transitions
 */

import { renderHomePage } from './pages/storefront/HomePage.js';
import { renderShopPage } from './pages/storefront/ShopPage.js';
import { renderProductDetailPage } from './pages/storefront/ProductDetailPage.js';
import { renderCartPage } from './pages/storefront/CartPage.js';
import { renderWishlistPage } from './pages/storefront/WishlistPage.js';
import { renderCheckoutPage } from './pages/storefront/CheckoutPage.js';
import { renderOrderSuccessPage } from './pages/storefront/OrderSuccessPage.js';
import { renderTrackOrderPage } from './pages/storefront/TrackOrderPage.js';
import { renderContactPage } from './pages/storefront/ContactPage.js';
import { renderOffersPage } from './pages/storefront/OffersPage.js';
import { renderCategoryPage } from './pages/storefront/CategoryPage.js';
import { renderBrandPage } from './pages/storefront/BrandPage.js';
import { renderOthersMarketPage } from './pages/storefront/OthersMarketPage.js';
import { renderLiveChatPage } from './pages/storefront/LiveChatPage.js';
import { renderLandingPage } from './pages/storefront/LandingPage.js';
import { renderTermsPage } from './pages/storefront/TermsPage.js';
import { renderPrivacyPage } from './pages/storefront/PrivacyPage.js';
import { renderCustomerPortal } from './pages/customer/CustomerPortal.js';
import { renderResellerPortal } from './pages/partner/ResellerPortal.js';
import { renderWholesalePortal } from './pages/partner/WholesalePortal.js';
import { renderLoadingSkeleton, renderLogoLoader } from './components/LoadingSkeleton.js';

// On-demand lazy loader for Admin Portal so customer pages NEVER load or execute Admin code
async function loadAndRenderAdmin(params = {}) {
  const mod = await import('./pages/admin/AdminPortal.js');
  return mod.renderAdminPortal(params);
}

// Restore customer storefront layout and remove any Admin-only styles when on non-admin routes
function ensureStorefrontLayoutIsolation() {
  if (typeof document === 'undefined') return;
  const admStyle = document.getElementById('dc-admin-harmonized-css');
  if (admStyle && admStyle.parentNode) {
    admStyle.parentNode.removeChild(admStyle);
  }
  ['header-mount', 'footer-mount', 'floatingactions-mount', 'mobilenav-mount'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.style.display === 'none') {
      el.style.display = '';
    }
  });
  const appContent = document.getElementById('app-content');
  if (appContent && !appContent.className.includes('max-w-7xl')) {
    appContent.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20';
  }
}

export function getAppBase() {
  const meta = document.querySelector('meta[name="app-base"]');
  if (meta && meta.content) {
    return meta.content.replace(/\/$/, '');
  }
  if (window.__APP_BASE__) {
    return window.__APP_BASE__.replace(/\/$/, '');
  }

  if (window.location.hostname.includes('github.io')) {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const knownTopRoutes = [
      'products', 'shop', 'search', 'product', 'cart', 'favourite', 'wishlist',
      'checkout', 'order', 'order-success', 'track', 'tracking', 'contact', 'offers',
      'categories', 'brands', 'others-market', 'chat', 'live-chat',
      'landing', 'terms', 'privacy', 'login', 'register', 'customer', 'reseller', 'wholesaler', 'admin'
    ];
    if (parts.length > 0 && !knownTopRoutes.includes(parts[0].toLowerCase())) {
      return '/' + parts[0];
    }
  }

  return '';
}

const ADMIN_SLUGS = [
  'login', 'dashboard', 'products', 'addproduct', 'add-product', 'categroy', 'category', 'categories',
  'brands', 'addbrand', 'add-brand', 'variants', 'addvariant', 'banners', 'bulk-upload', 'bulkupload',
  'bulk-price', 'bulkprice', 'bulk-image', 'bulkimage', 'low-stock', 'out-stock', 'error-products',
  'landing', 'orders', 'addorder', 'add-order', 'incomplete-orders', 'delivered-orders', 'shipping-orders',
  'unpaid-orders', 'cancelled-orders', 'visitors', 'customers', 'reviews', 'resellers', 'wholesalers',
  'sellers', 'markets', 'admins', 'workers', 'team', 'reports', 'report-sales', 'report-seller',
  'report-reseller', 'report-wholesaler', 'report-wholesale', 'report-costs', 'report-buying',
  'report-invest', 'payouts', 'finance', 'costs', 'buying', 'invest', 'couriers', 'addcourier',
  'fraud', 'payments', 'settings', 'shop-info', 'logs', 'payment-methods', 'delivery', 'offers',
  'profile', 'password', 'others'
];

const adminRouteEntries = {
  '/admin': (params) => loadAndRenderAdmin(params)
};
ADMIN_SLUGS.forEach(slug => {
  adminRouteEntries['/admin/' + slug] = (params) => loadAndRenderAdmin({ ...params, subview: slug });
});

export const router = {
  routes: {
    '/': renderHomePage,
    '/home': renderHomePage,
    '/products': renderShopPage,
    '/shop': renderShopPage,
    '/search': renderShopPage,
    '/cart': renderCartPage,
    '/favourite': renderWishlistPage,
    '/wishlist': renderWishlistPage,
    '/checkout': renderCheckoutPage,
    '/order': renderCheckoutPage,
    '/order-success': renderOrderSuccessPage,
    '/track': renderTrackOrderPage,
    '/tracking': renderTrackOrderPage,
    '/contact': renderContactPage,
    '/offers': renderOffersPage,
    '/categories': renderCategoryPage,
    '/brands': renderBrandPage,
    '/others-market': renderOthersMarketPage,
    '/chat': renderLiveChatPage,
    '/live-chat': renderLiveChatPage,
    '/landing': renderLandingPage,
    '/terms': renderTermsPage,
    '/privacy': renderPrivacyPage,
    '/login': (params) => renderCustomerPortal({ ...params, subview: 'login' }),
    '/register': (params) => renderCustomerPortal({ ...params, subview: 'register' }),

    // Customer Portal
    '/customer': renderCustomerPortal,
    '/customer/login': (params) => renderCustomerPortal({ ...params, subview: 'login' }),
    '/customer/register': (params) => renderCustomerPortal({ ...params, subview: 'register' }),
    '/customer/dashboard': (params) => renderCustomerPortal({ ...params, subview: 'dashboard' }),
    '/customer/settings': (params) => renderCustomerPortal({ ...params, subview: 'settings' }),

    // Reseller Portal
    '/reseller': renderResellerPortal,
    '/reseller/login': (params) => renderResellerPortal({ ...params, subview: 'login' }),
    '/reseller/register': (params) => renderResellerPortal({ ...params, subview: 'register' }),
    '/reseller/dashboard': (params) => renderResellerPortal({ ...params, subview: 'dashboard' }),

    // Wholesaler Portal
    '/wholesaler': renderWholesalePortal,
    '/wholesaler/login': (params) => renderWholesalePortal({ ...params, subview: 'login' }),
    '/wholesaler/register': (params) => renderWholesalePortal({ ...params, subview: 'register' }),
    '/wholesaler/dashboard': (params) => renderWholesalePortal({ ...params, subview: 'dashboard' }),

    // Admin / Worker Portal (Dedicated Multi-Page Route Architecture)
    ...adminRouteEntries
  },

  getCleanPath() {
    const base = getAppBase();
    let fullPath = window.location.pathname;

    const redirectPath = sessionStorage.getItem('dcbd_spa_redirect');
    if (redirectPath) {
      sessionStorage.removeItem('dcbd_spa_redirect');
      window.history.replaceState(null, '', redirectPath);
      fullPath = redirectPath.split('?')[0];
    }

    if (base && fullPath.startsWith(base)) {
      fullPath = fullPath.slice(base.length);
    }

    if (window.location.hash) {
      const hashContent = window.location.hash.replace(/^#\/?/, '/');
      if (hashContent && hashContent !== '/') {
        const cleanDestination = (base || '') + hashContent;
        window.history.replaceState(null, '', cleanDestination);
        fullPath = hashContent.split('?')[0];
      }
    }

    if (!fullPath || fullPath === '') fullPath = '/';

    if (fullPath.length > 1 && fullPath.endsWith('/')) {
      fullPath = fullPath.slice(0, -1);
    }

    return fullPath.toLowerCase();
  },

  getQueryParams() {
    const params = {};
    const searchStr = window.location.search;
    if (searchStr) {
      new URLSearchParams(searchStr).forEach((val, key) => {
        params[key] = val;
      });
    }
    return params;
  },

  navigate(targetUrl, replace = false) {
    const base = getAppBase();
    let cleanTarget = targetUrl;

    cleanTarget = cleanTarget.replace(/^#\/?/, '/');
    if (!cleanTarget.startsWith('/')) cleanTarget = '/' + cleanTarget;

    const fullUrl = (base || '') + cleanTarget;

    if (replace) {
      window.history.replaceState(null, '', fullUrl);
    } else {
      window.history.pushState(null, '', fullUrl);
    }

    this.resolve();
  },

  async resolve() {
    const path = this.getCleanPath();
    const params = this.getQueryParams();

    const appContainer = document.getElementById('app-content');
    if (!appContainer) return;

    const isAdminRoute = path === '/admin' || path.startsWith('/admin/');
    if (!isAdminRoute) {
      ensureStorefrontLayoutIsolation();
    }

    // Branded Logo Loader on route resolution (skipped only when already inside mounted admin shell for instant 0ms tab swap)
    const isIntraAdmin = isAdminRoute && !!appContainer.querySelector('.dc-admin-wrapper');
    if (!isIntraAdmin) {
      appContainer.innerHTML = isAdminRoute
        ? renderLogoLoader('অ্যাডমিন প্যানেল লোড হচ্ছে...', 'Dream Cart BD • মাস্টার কন্ট্রোল প্যানেল')
        : renderLoadingSkeleton();
    }

    try {
      let viewHtml = "";

      if (path.startsWith('/product/')) {
        const rawSlug = path.replace('/product/', '');
        let slug = rawSlug;
        try { slug = decodeURIComponent(rawSlug); } catch (e) {}
        viewHtml = await renderProductDetailPage(slug);
      } else if (path === '/product') {
        const rawSlug = params.slug || params.id || params.sku || 'amazfit-gts-4-smartwatch';
        let slug = rawSlug;
        try { slug = decodeURIComponent(rawSlug); } catch (e) {}
        viewHtml = await renderProductDetailPage(slug);
      } else if ((path === '/products' || path === '/shop') && (params.id || params.slug)) {
        const rawSlug = params.slug || params.id;
        let slug = rawSlug;
        try { slug = decodeURIComponent(rawSlug); } catch (e) {}
        viewHtml = await renderProductDetailPage(slug);
      } else if (path === '/order-success') {
        viewHtml = await renderOrderSuccessPage(params.orderId || params.order_id || 'ORD-2609-8472');
      } else if (path === '/track' || path === '/tracking') {
        viewHtml = await renderTrackOrderPage(params.orderId || params.phone || '');
      } else if (isAdminRoute) {
        const subview = path.replace(/^\/admin\/?/, '') || 'dashboard';
        viewHtml = await loadAndRenderAdmin({ ...params, subview });
      } else if (this.routes[path]) {
        viewHtml = await this.routes[path](params);
      } else {
        viewHtml = `
          <div class="py-24 text-center max-w-lg mx-auto space-y-3">
            <h1 class="text-6xl font-black text-emerald-600">404</h1>
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h2>
            <p class="text-xs text-slate-500">অনুরোধকৃত লিঙ্ক "${path}" বিদ্যমান নেই বা সরানো হয়েছে।</p>
            <div class="pt-2">
              <a href="/" class="btn-primary text-xs py-2.5 px-6 shadow-sm">মূল পাতায় ফিরে যান</a>
            </div>
          </div>
        `;
      }

      appContainer.innerHTML = viewHtml;
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error("Router resolution error:", err);
      appContainer.innerHTML = `
        <div class="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl text-center max-w-lg mx-auto mt-12 space-y-3">
          <div class="text-4xl">⚠️</div>
          <h3 class="text-slate-800 dark:text-white font-bold text-base">পৃষ্ঠাটি লোড করা সম্ভব হয়নি</h3>
          <p class="text-xs text-slate-500">${err.message || err.toString()}</p>
          <a href="/" class="btn-primary mt-2 text-xs py-2 px-5 inline-flex">মূল পাতায় ফিরুন</a>
        </div>
      `;
    }
  }
};
