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
 * সেফ ডাইনামিক পেজ লোডার (Vite Build Fail-Safe Resolver)
 */
const loadPage = (modulePath, exportName) => {
  return async (params) => {
    try {
      const mod = await import(/* @vite-ignore */ modulePath);
      return mod[exportName] ? await mod[exportName](params) : mod.default(params);
    } catch (err) {
      console.warn(`[Module Loader] Loading ${modulePath}:`, err.message);
      return `
        <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center font-bengali">
          <div class="glass-panel p-8 rounded-3xl max-w-md border border-slate-200 dark:border-slate-800 shadow-xl">
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
router.addRoute("/", loadPage("./pages/storefront/HomePage.js", "HomePage"));
router.addRoute("/products", loadPage("./pages/storefront/ProductListPage.js", "ProductListPage"));
router.addRoute("/product/:id", loadPage("./pages/storefront/ProductDetailPage.js", "ProductDetailPage"));
router.addRoute("/categories", loadPage("./pages/storefront/CategoryPage.js", "CategoryPage"));
router.addRoute("/checkout", loadPage("./pages/storefront/CheckoutPage.js", "CheckoutPage"));
router.addRoute("/order-success/:id", loadPage("./pages/storefront/OrderSuccessPage.js", "OrderSuccessPage"));
router.addRoute("/track-order", loadPage("./pages/storefront/TrackOrderPage.js", "TrackOrderPage"));
router.addRoute("/customer/account", loadPage("./pages/customer/CustomerPortal.js", "CustomerPortal"));

// Admin Catalog Routes
router.addRoute("/admin/dashboard", loadPage("./pages/admin/system/Reports.js", "Reports"));
router.addRoute("/admin/products", loadPage("./pages/admin/catalog/ProductList.js", "ProductList"));
router.addRoute("/admin/products/create", loadPage("./pages/admin/catalog/ProductWizard.js", "ProductWizard"));
router.addRoute("/admin/products/edit/:id", loadPage("./pages/admin/catalog/ProductWizard.js", "ProductWizard"));
router.addRoute("/admin/categories", loadPage("./pages/admin/catalog/CategoryManager.js", "CategoryManager"));

// Admin Inventory Routes
router.addRoute("/admin/inventory", loadPage("./pages/admin/inventory/StockLedger.js", "StockLedger"));
router.addRoute("/admin/inventory/movements", loadPage("./pages/admin/inventory/StockMovements.js", "StockMovements"));
router.addRoute("/admin/inventory/low-stock", loadPage("./pages/admin/inventory/LowStockAlerts.js", "LowStockAlerts"));
router.addRoute("/admin/suppliers", loadPage("./pages/admin/inventory/SupplierManager.js", "SupplierManager"));
router.addRoute("/admin/inventory/purchase-orders", loadPage("./pages/admin/inventory/PurchaseOrders.js", "PurchaseOrders"));

// Admin Order & Courier Routes
router.addRoute("/admin/orders", loadPage("./pages/admin/orders/OrderList.js", "OrderList"));
router.addRoute("/admin/orders/detail/:id", loadPage("./pages/admin/orders/OrderDetail.js", "OrderDetail"));
router.addRoute("/admin/orders/bulk-shipment", loadPage("./pages/admin/orders/BulkShipment.js", "BulkShipment"));
router.addRoute("/admin/couriers", loadPage("./pages/admin/orders/CourierHub.js", "CourierHub"));
router.addRoute("/admin/orders/returns", loadPage("./pages/admin/orders/ReturnRTO.js", "ReturnRTO"));
router.addRoute("/admin/orders/payments", loadPage("./pages/admin/orders/Payments.js", "Payments"));

// Admin System & Bulk Routes
router.addRoute("/admin/system/bulk", loadPage("./pages/admin/system/BulkExcelTool.js", "BulkExcelTool"));
router.addRoute("/admin/system/bulk-price", loadPage("./pages/admin/system/BulkPriceEngine.js", "BulkPriceEngine"));
router.addRoute("/admin/audit", loadPage("./pages/admin/system/AuditTrail.js", "AuditTrail"));
router.addRoute("/admin/settings", loadPage("./pages/admin/system/Settings.js", "Settings"));

// Partner Routes
router.addRoute("/partner/seller", loadPage("./pages/partner/SellerPortal.js", "SellerPortal"));
router.addRoute("/partner/reseller", loadPage("./pages/partner/ResellerPortal.js", "ResellerPortal"));
router.addRoute("/partner/wholesale", loadPage("./pages/partner/WholesalePortal.js", "WholesalePortal"));

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
    // ৪. গ্লোবাল লোডার রিমুভ (নিরাপদ উপায়)
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.classList.add("opacity-0");
      setTimeout(() => loader.remove(), 300);
    } else {
      // যদি id="global-loader" না থাকে, তবে স্ক্রিনের যেকোনো লোডিং এলিমেন্ট রিমুভ করে দেবো
      document.querySelectorAll(".global-loading, #loading-screen").forEach(el => el.remove());
    }
  }
});
