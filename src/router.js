/**
 * DREAM CART BD — SPA CLIENT ROUTER
 * Lightweight hash-based router with built-in fault tolerance.
 */

import { renderHomePage } from './pages/storefront/HomePage.js';
import { renderShopPage } from './pages/storefront/ShopPage.js';
import { renderProductDetailPage } from './pages/storefront/ProductDetailPage.js';
import { renderCheckoutPage } from './pages/storefront/CheckoutPage.js';
import { renderOrderSuccessPage } from './pages/storefront/OrderSuccessPage.js';
import { renderTrackOrderPage } from './pages/storefront/TrackOrderPage.js';
import { renderContactPage } from './pages/storefront/ContactPage.js';
import { renderOffersPage } from './pages/storefront/OffersPage.js';
import { renderAdminPortal } from './pages/admin/AdminPortal.js';
import { renderPartnerPortal } from './pages/partner/PartnerPortal.js';

export const router = {
  routes: {
    '/': renderHomePage,
    '/shop': renderShopPage,
    '/product': renderProductDetailPage,
    '/checkout': renderCheckoutPage,
    '/order-success': renderOrderSuccessPage,
    '/track': renderTrackOrderPage,
    '/contact': renderContactPage,
    '/offers': renderOffersPage,
    '/admin': renderAdminPortal,
    '/partner': renderPartnerPortal
  },

  async navigate() {
    const rawHash = window.location.hash.slice(1) || '/';
    const [pathPart, queryPart] = rawHash.split('?');
    const path = pathPart.toLowerCase() || '/';

    const params = {};
    if (queryPart) {
      new URLSearchParams(queryPart).forEach((val, key) => {
        params[key] = val;
      });
    }

    const appContainer = document.getElementById('app-content');
    if (!appContainer) return;

    // Fast loading state
    appContainer.innerHTML = `
      <div class="py-12 space-y-6 max-w-7xl mx-auto">
        <div class="h-48 skeleton rounded-3xl"></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="h-64 skeleton rounded-2xl"></div>
          <div class="h-64 skeleton rounded-2xl"></div>
          <div class="h-64 skeleton rounded-2xl"></div>
        </div>
      </div>
    `;

    try {
      let viewHtml = "";
      if (path.startsWith('/product/')) {
        const slug = path.replace('/product/', '');
        viewHtml = await renderProductDetailPage(slug);
      } else if (path === '/shop') {
        viewHtml = await renderShopPage(params);
      } else if (path === '/order-success') {
        viewHtml = await renderOrderSuccessPage(params.orderId || 'ORD-2609-1001');
      } else if (path === '/track') {
        viewHtml = await renderTrackOrderPage(params.orderId || '');
      } else if (this.routes[path]) {
        viewHtml = await this.routes[path](params);
      } else {
        viewHtml = `
          <div class="py-24 text-center">
            <h1 class="text-6xl font-black text-emerald-600">404</h1>
            <h2 class="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
            <p class="text-xs text-slate-500 mt-1 mb-6">The page "${path}" does not exist or has moved.</p>
            <a href="#/" class="btn-primary text-xs py-2 px-5">Return to Home</a>
          </div>
        `;
      }

      appContainer.innerHTML = viewHtml;
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error("Router navigation error:", err);
      appContainer.innerHTML = `
        <div class="p-8 bg-white border border-slate-200 shadow-sm rounded-3xl text-center max-w-lg mx-auto mt-12">
          <div class="text-3xl mb-2">⚠️</div>
          <h3 class="text-slate-800 font-bold text-base">Unable to load page</h3>
          <p class="text-xs text-slate-500 mt-1">${err.message || err.toString()}</p>
          <a href="#/" class="btn-primary mt-4 text-xs py-2 px-4 inline-flex">Return to Home</a>
        </div>
      `;
    }
  }
};
