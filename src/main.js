/**
 * ============================================================================
 * DREAM CART BD — APPLICATION BOOTSTRAPPER (main.js)
 * ============================================================================
 */

import { store } from "./js/store.js";
import { router } from "./js/router.js";
import { SyncEngine } from "./api/sync.js";

// ==================== STOREFRONT & CUSTOMER PAGES ====================
import { HomePage } from "./pages/storefront/HomePage.js";
import { ProductListPage } from "./pages/storefront/ProductListPage.js";
import { ProductDetailPage } from "./pages/storefront/ProductDetailPage.js";
import { CategoryPage } from "./pages/storefront/CategoryPage.js";
import { CheckoutPage } from "./pages/storefront/CheckoutPage.js";
import { OrderSuccessPage } from "./pages/storefront/OrderSuccessPage.js";
import { TrackOrderPage } from "./pages/storefront/TrackOrderPage.js";
import { CustomerPortal } from "./pages/customer/CustomerPortal.js";

/**
 * সেফ মডিউল র‍্যাপার
 */
const wrap = (fn) => async (params) => {
  try {
    if (typeof fn === "function") return await fn(params);
    if (fn && typeof fn.default === "function") return await fn.default(params);
    throw new Error("Render function not found");
  } catch (err) {
    return `
      <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center font-bengali">
        <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-md">
          <h3 class="text-lg font-bold mb-2">পেজটি প্রস্তুত হচ্ছে</h3>
          <p class="text-xs text-slate-500 mb-4">এই মডিউলটির ফাইল লোড হতে সমস্যা হয়েছে বা তৈরি করা হচ্ছে।</p>
          <a href="/" class="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl inline-block">হোম পেজে ফিরে যান</a>
        </div>
      </div>
    `;
  }
};

// ==================== REGISTER ROUTES ====================
router.addRoute("/", wrap(HomePage));
router.addRoute("/products", wrap(ProductListPage));
router.addRoute("/product/:id", wrap(ProductDetailPage));
router.addRoute("/categories", wrap(CategoryPage));
router.addRoute("/checkout", wrap(CheckoutPage));
router.addRoute("/order-success/:id", wrap(OrderSuccessPage));
router.addRoute("/track-order", wrap(TrackOrderPage));
router.addRoute("/customer/account", wrap(CustomerPortal));

// সাময়িকভাবে পার্টনার ও অ্যাডমিন পেজগুলোর জন্য ফলব্যাক রাউট
const portalFallback = wrap(() => `
  <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center font-bengali">
    <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-md">
      <h3 class="text-lg font-bold mb-2">পোর্টালটি আপডেট হচ্ছে</h3>
      <p class="text-xs text-slate-500 mb-4">এই সেকশনের মডিউলগুলো শিঘ্রই যুক্ত করা হবে।</p>
      <a href="/" class="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl inline-block">হোম পেজে ফিরে যান</a>
    </div>
  </div>
`);

router.addRoute("/partner/seller", portalFallback);
router.addRoute("/partner/reseller", portalFallback);
router.addRoute("/partner/wholesale", portalFallback);
router.addRoute("/admin/dashboard", portalFallback);
router.addRoute("/admin/products", portalFallback);
router.addRoute("/admin/categories", portalFallback);
router.addRoute("/admin/inventory", portalFallback);
router.addRoute("/admin/orders", portalFallback);

// ==================== INITIALIZE ====================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (typeof SyncEngine !== "undefined" && SyncEngine.startPolling) {
      SyncEngine.startPolling(10000);
    }
    window.SyncEngine = SyncEngine;
    window.store = store;
    window.router = router;

    document.body.addEventListener("click", (e) => {
      const anchor = e.target.closest("a");
      if (anchor && anchor.getAttribute("href") && anchor.getAttribute("href").startsWith("/")) {
        e.preventDefault();
        router.navigate(anchor.getAttribute("href"));
      }
    });

    if (router && typeof router.handleRoute === "function") {
      await router.handleRoute();
    }
  } catch (err) {
    console.error("[App Init Error]:", err);
  } finally {
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.classList.add("opacity-0");
      setTimeout(() => loader.remove(), 300);
    } else {
      document.querySelectorAll(".global-loading, #loading-screen").forEach(el => el.remove());
    }
  }
});
