/**
 * DREAM CART BD — CLEAN PATH SPA CLIENT ROUTER (router.js)
 * Implements clean path routing: domain/products, domain/cart, domain/admin (ZERO hash '#' URLs)
 * Supports GitHub Pages, Cloudflare Pages, C-Panel Apache (.htaccess), and local preview.
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
import { renderAdminPortal } from './pages/admin/AdminPortal.js';

export function getAppBase() {
  const meta = document.querySelector('meta[name="app-base"]');
  if (meta && meta.content) {
    return meta.content.replace(/\/$/, '');
  }
  if (window.__APP_BASE__) {
    return window.__APP_BASE__.replace(/\/$/, '');
  }

  // If on github.io with a project path: https://<user>.github.io/<repo>/
  if (window.location.hostname.includes('github.io')) {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const knownTopRoutes = [
      'products', 'shop', 'search', 'product', 'cart', 'favourite', 'wishlist',
      'checkout', 'order-success', 'track', 'contact', 'offers',
      'categories', 'brands', 'others-market', 'chat', 'live-chat',
      'landing', 'terms', 'privacy', 'login', 'register', 'customer', 'reseller', 'wholesaler', 'admin'
    ];
    if (parts.length > 0 && !knownTopRoutes.includes(parts[0].toLowerCase())) {
      return '/' + parts[0];
    }
  }

  return '';
}

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

    // Admin / Worker Portal (Multi-Page Route Architecture)
    '/admin': renderAdminPortal,
    '/admin/login': (params) => renderAdminPortal({ ...params, subview: 'login' }),
    '/admin/dashboard': (params) => renderAdminPortal({ ...params, subview: 'dashboard' }),
    '/admin/products': (params) => renderAdminPortal({ ...params, subview: 'products' }),
    '/admin/addproduct': (params) => renderAdminPortal({ ...params, subview: 'addproduct' }),
    '/admin/add-product': (params) => renderAdminPortal({ ...params, subview: 'addproduct' }),
    '/admin/categroy': (params) => renderAdminPortal({ ...params, subview: 'categroy' }),
    '/admin/category': (params) => renderAdminPortal({ ...params, subview: 'category' }),
    '/admin/categories': (params) => renderAdminPortal({ ...params, subview: 'categories' }),
    '/admin/brands': (params) => renderAdminPortal({ ...params, subview: 'brands' }),
    '/admin/addbrand': (params) => renderAdminPortal({ ...params, subview: 'addbrand' }),
    '/admin/variants': (params) => renderAdminPortal({ ...params, subview: 'variants' }),
    '/admin/addvariant': (params) => renderAdminPortal({ ...params, subview: 'addvariant' }),
    '/admin/banners': (params) => renderAdminPortal({ ...params, subview: 'banners' }),
    '/admin/bulk-upload': (params) => renderAdminPortal({ ...params, subview: 'bulk-upload' }),
    '/admin/bulk-price': (params) => renderAdminPortal({ ...params, subview: 'bulk-price' }),
    '/admin/bulk-image': (params) => renderAdminPortal({ ...params, subview: 'bulk-image' }),
    '/admin/low-stock': (params) => renderAdminPortal({ ...params, subview: 'low-stock' }),
    '/admin/out-stock': (params) => renderAdminPortal({ ...params, subview: 'out-stock' }),
    '/admin/error-products': (params) => renderAdminPortal({ ...params, subview: 'error-products' }),
    '/admin/landing': (params) => renderAdminPortal({ ...params, subview: 'landing' }),
    '/admin/orders': (params) => renderAdminPortal({ ...params, subview: 'orders' }),
    '/admin/addorder': (params) => renderAdminPortal({ ...params, subview: 'addorder' }),
    '/admin/incomplete-orders': (params) => renderAdminPortal({ ...params, subview: 'incomplete-orders' }),
    '/admin/delivered-orders': (params) => renderAdminPortal({ ...params, subview: 'delivered-orders' }),
    '/admin/shipping-orders': (params) => renderAdminPortal({ ...params, subview: 'shipping-orders' }),
    '/admin/unpaid-orders': (params) => renderAdminPortal({ ...params, subview: 'unpaid-orders' }),
    '/admin/cancelled-orders': (params) => renderAdminPortal({ ...params, subview: 'cancelled-orders' }),
    '/admin/visitors': (params) => renderAdminPortal({ ...params, subview: 'visitors' }),
    '/admin/customers': (params) => renderAdminPortal({ ...params, subview: 'customers' }),
    '/admin/reviews': (params) => renderAdminPortal({ ...params, subview: 'reviews' }),
    '/admin/resellers': (params) => renderAdminPortal({ ...params, subview: 'resellers' }),
    '/admin/wholesalers': (params) => renderAdminPortal({ ...params, subview: 'wholesalers' }),
    '/admin/sellers': (params) => renderAdminPortal({ ...params, subview: 'sellers' }),
    '/admin/markets': (params) => renderAdminPortal({ ...params, subview: 'markets' }),
    '/admin/admins': (params) => renderAdminPortal({ ...params, subview: 'admins' }),
    '/admin/workers': (params) => renderAdminPortal({ ...params, subview: 'workers' }),
    '/admin/reports': (params) => renderAdminPortal({ ...params, subview: 'reports' }),
    '/admin/payouts': (params) => renderAdminPortal({ ...params, subview: 'payouts' }),
    '/admin/finance': (params) => renderAdminPortal({ ...params, subview: 'finance' }),
    '/admin/costs': (params) => renderAdminPortal({ ...params, subview: 'costs' }),
    '/admin/buying': (params) => renderAdminPortal({ ...params, subview: 'buying' }),
    '/admin/invest': (params) => renderAdminPortal({ ...params, subview: 'invest' }),
    '/admin/couriers': (params) => renderAdminPortal({ ...params, subview: 'couriers' }),
    '/admin/addcourier': (params) => renderAdminPortal({ ...params, subview: 'addcourier' }),
    '/admin/fraud': (params) => renderAdminPortal({ ...params, subview: 'fraud' }),
    '/admin/payments': (params) => renderAdminPortal({ ...params, subview: 'payments' }),
    '/admin/settings': (params) => renderAdminPortal({ ...params, subview: 'settings' }),
    '/admin/logs': (params) => renderAdminPortal({ ...params, subview: 'logs' }),
    '/admin/payment-methods': (params) => renderAdminPortal({ ...params, subview: 'payment-methods' }),
    '/admin/delivery': (params) => renderAdminPortal({ ...params, subview: 'delivery' }),
    '/admin/offers': (params) => renderAdminPortal({ ...params, subview: 'offers' }),
    '/admin/profile': (params) => renderAdminPortal({ ...params, subview: 'profile' }),
    '/admin/password': (params) => renderAdminPortal({ ...params, subview: 'password' }),
    '/admin/others': (params) => renderAdminPortal({ ...params, subview: 'others' })
  },

  getCleanPath() {
    const base = getAppBase();
    let fullPath = window.location.pathname;

    // Handle GitHub Pages redirect stored in sessionStorage
    const redirectPath = sessionStorage.getItem('dcbd_spa_redirect');
    if (redirectPath) {
      sessionStorage.removeItem('dcbd_spa_redirect');
      window.history.replaceState(null, '', redirectPath);
      fullPath = redirectPath;
    }

    // Strip base if present
    if (base && fullPath.startsWith(base)) {
      fullPath = fullPath.slice(base.length);
    }

    // Backward compatibility: If old URL with '#' is entered, automatically strip '#' and replaceState
    if (window.location.hash) {
      const hashContent = window.location.hash.replace(/^#\/?/, '/');
      if (hashContent && hashContent !== '/') {
        const cleanDestination = (base || '') + hashContent;
        window.history.replaceState(null, '', cleanDestination);
        fullPath = hashContent.split('?')[0];
      }
    }

    if (!fullPath || fullPath === '') fullPath = '/';

    // Strip trailing slash unless root
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
    
    // Strip hash if given
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

    // Branded Shop & Page Loader (Skipped on fast intra-admin page transitions)
    const isIntraAdmin = path.startsWith('/admin') && !!appContainer.querySelector('.dc-admin-wrapper');
    if (!isIntraAdmin) appContainer.innerHTML = `
      <div class="py-16 sm:py-24 flex flex-col items-center justify-center max-w-7xl mx-auto space-y-6 px-4">
        <!-- Center Logo Loader with Glow & Pulse -->
        <div class="relative flex items-center justify-center">
          <div class="absolute w-24 h-24 rounded-3xl bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping"></div>
          <div class="relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/60 p-2 shadow-2xl shadow-emerald-500/20 flex items-center justify-center overflow-hidden">
            <img 
              src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
              alt="Dream Cart BD Logo" 
              class="w-full h-full object-contain rounded-xl"
              onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
            />
          </div>
        </div>

        <!-- Animated Progress / Loading Text -->
        <div class="text-center space-y-1.5">
          <div class="text-sm font-extrabold text-slate-800 dark:text-white flex items-center justify-center gap-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>পণ্য লোড হচ্ছে...</span>
          </div>
          <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Dream Cart BD • লাইভ ক্যাটালগ সিঙ্ক হচ্ছে</p>
        </div>

        <!-- Product Grid Skeletons -->
        <div class="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
          <div class="h-64 skeleton rounded-2xl"></div>
          <div class="h-64 skeleton rounded-2xl"></div>
          <div class="h-64 skeleton rounded-2xl hidden sm:block"></div>
          <div class="h-64 skeleton rounded-2xl hidden lg:block"></div>
        </div>
      </div>
    `;

    try {
      let viewHtml = "";

      // Dynamic Product Detail routing: /product/<slug>
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
      } else if (path === '/track') {
        viewHtml = await renderTrackOrderPage(params.orderId || params.phone || '');
      } else if (this.routes[path]) {
        viewHtml = await this.routes[path](params);
      } else if (path === '/admin' || path.startsWith('/admin/')) {
        const subview = path.replace(/^\/admin\/?/, '') || 'dashboard';
        viewHtml = await renderAdminPortal({ ...params, subview });
      } else {
        // 404 Fallback
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
