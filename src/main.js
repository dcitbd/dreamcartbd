/**
 * ============================================================================
 * DREAM CART BD — APPLICATION BOOTSTRAPPER (main.js)
 * High-Performance Resilient SPA Engine with Dynamic Route Resolution
 * ============================================================================
 */

import { store } from "./js/store.js";
import { router } from "./js/router.js";
import { SyncEngine } from "./api/sync.js";

/**
 * সেফ ডাইনামিক পেজ লোডার (Vite Build Fail-Safe Resolver for GitHub Pages)
 */
const loadPage = (importFn) => {
  return async (params) => {
    try {
      const mod = await importFn();
      const renderFn = mod.HomePage || mod.ProductListPage || mod.ProductDetailPage || mod.CategoryPage || mod.CheckoutPage || mod.OrderSuccessPage || mod.TrackOrderPage || mod.CustomerPortal || mod.Reports || mod.ProductList || mod.ProductWizard || mod.CategoryManager || mod.StockLedger || mod.StockMovements || mod.LowStockAlerts || mod.SupplierManager || mod.PurchaseOrders || mod.OrderList || mod.OrderDetail || mod.BulkShipment || mod.CourierHub || mod.ReturnRTO || mod.Payments || mod.BulkExcelTool || mod.BulkPriceEngine || mod.AuditTrail || mod.Settings || mod.SellerPortal || mod.ResellerPortal || mod.WholesalePortal || mod.default;

      if (typeof renderFn === "function") {
        return await renderFn(params);
      }
      throw new Error("Valid export function not found in module");
    } catch (err) {
      console.warn(`[Module Loader Error]:`, err.message);
      return `
        <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center font-bengali">
          <div class="glass-panel p-8 rounded-3xl max-w-md border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
            <div class="w-12 h-12 bg-brand-50 dark:bg-slate-800 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i data-lucide="package-search" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">পেজটি প্রস্তুত হচ্ছে</h3>
            <p class="text-xs text-slate-500 mt-2">এই মডিউলটির ফাইল গিটহাবে আপলোড সম্পন্ন হলে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।</p>
            <a href="/" class="btn-primary mt-6 inline-flex text-xs px-5 py-2.5">হোম পেজে ফিরে যান</a>
          </div>
        </div>
      `;
    }
  };
};

// ==================== REGISTER DYNAMIC SPA ROUTES ====================

// Storefront & Customer Pages
router.addRoute("/", loadPage(() => import("./pages/storefront/HomePage.js")));
router.addRoute("/products", loadPage(() => import("./pages/storefront/ProductListPage.js")));
router.addRoute("/product/:id", loadPage(() => import("./pages/storefront/ProductDetailPage.js")));
router.addRoute("/categories", loadPage(() => import("./pages/storefront/CategoryPage.js")));
router.addRoute("/checkout", loadPage(() => import("./pages/storefront/CheckoutPage.js")));
router.addRoute("/order-success/:id", loadPage(() => import("./pages/storefront/OrderSuccessPage.js")));
router.addRoute("/track-order", loadPage(() => import("./pages/storefront/TrackOrderPage.js")));
router.addRoute("/customer/account", loadPage(() => import("./pages/customer/CustomerPortal.js")));

// Admin Catalog Routes
router.addRoute("/admin/dashboard", loadPage(() => import("./pages/admin/system/Reports.js")));
router.addRoute("/admin/products", loadPage(() => import("./pages/admin/catalog/ProductList.js")));
router.addRoute("/admin/products/create", loadPage(() => import("./pages/admin/catalog/ProductWizard.js")));
router.addRoute("/admin/products/edit/:id", loadPage(() => import("./pages/admin/catalog/ProductWizard.js")));
router.addRoute("/admin/categories", loadPage(() => import("./pages/admin/catalog/CategoryManager.js")));

// Admin Inventory Routes
router.addRoute("/admin/inventory", loadPage(() => import("./pages/admin/inventory/StockLedger.js")));
router.addRoute("/admin/inventory/movements", loadPage(() => import("./pages/admin/inventory/StockMovements.js")));
router.addRoute("/admin/inventory/low-stock", loadPage(() => import("./pages/admin/inventory/LowStockAlerts.js")));
router.addRoute("/admin/suppliers", loadPage(() => import("./pages/admin/inventory/SupplierManager.js")));
router.addRoute("/admin/inventory/purchase-orders", loadPage(() => import("./pages/admin/inventory/PurchaseOrders.js")));

// Admin Order & Courier Routes
router.addRoute("/admin/orders", loadPage(() => import("./pages/admin/orders/OrderList.js")));
router.addRoute("/admin/orders/detail/:id", loadPage(() => import("./pages/admin/orders/OrderDetail.js")));
router.addRoute("/admin/orders/bulk-shipment", loadPage(() => import("./pages/admin/orders/BulkShipment.js")));
router.addRoute("/admin/couriers", loadPage(() => import("./pages/admin/orders/CourierHub.js")));
router.addRoute("/admin/orders/returns", loadPage(() => import("./pages/admin/orders/ReturnRTO.js")));
router.addRoute("/admin/orders/payments", loadPage(() => import("./pages/admin/orders/Payments.js")));

// Admin System & Bulk Routes
router.addRoute("/admin/system/bulk", loadPage(() => import("./pages/admin/system/BulkExcelTool.js")));
router.addRoute("/admin/system/bulk-price", loadPage(() => import("./pages/admin/system/BulkPriceEngine.js")));
router.addRoute("/admin/audit", loadPage(() => import("./pages/admin/system/AuditTrail.js")));
router.addRoute("/admin/settings", loadPage(() => import("./pages/admin/system/Settings.js")));

// Partner Routes
router.addRoute("/partner/seller", loadPage(() => import("./pages/partner/SellerPortal.js")));
router.addRoute("/partner/reseller", loadPage(() => import("./pages/partner/ResellerPortal.js")));
router.addRoute("/partner/wholesale", loadPage(() => import("./pages/partner/WholesalePortal.js")));

// ==================== GLOBAL APP INITIALIZER ====================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // ১. গুগল শীট টু-ওয়ে সিঙ্ক পোলিং চালু
    if (typeof SyncEngine !== "undefined" && SyncEngine.startPolling) {
      SyncEngine.startPolling(10000);
    }
    window.SyncEngine = SyncEngine;
    window.store = store;
    window.router = router;

    // ২. গ্লোবাল লিঙ্ক ইন্টারসেপ্টর
    document.body.addEventListener("click", (e) => {
      const anchor = e.target.closest("a");
      if (anchor && anchor.getAttribute("href") && anchor.getAttribute("href").startsWith("/")) {
        e.preventDefault();
        router.navigate(anchor.getAttribute("href"));
      }
    });

    // ৩. ইনিশিয়াল পেজ রেন্ডার
    if (router && typeof router.handleRoute === "function") {
      await router.handleRoute();
    }
  } catch (err) {
    console.error("[App Init Error]:", err);
  } finally {
    // ৪. গ্লোবাল লোডার রিমুভ (নিরাপদ উপায়)
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.classList.add("opacity-0");
      setTimeout(() => loader.remove(), 300);
    } else {
      document.querySelectorAll(".global-loading, #loading-screen").forEach(el => el.remove());
    }
  }
});
