/**
 * ============================================================================
 * DREAM CART BD — APPLICATION BOOTSTRAPPER (main.js)
 * ============================================================================
 */

import { store } from "./js/store.js";
import { router } from "./js/router.js";
import { SyncEngine } from "./api/sync.js";

// সব পেজ মডিউল একসাথে স্ট্যাটিক্যালি ইমপোর্ট করা হলো যাতে Vite বিল্ডে কোনো 404 বা পাথ মিসিং না হয়
import { HomePage } from "./pages/storefront/HomePage.js";
import { ProductListPage } from "./pages/storefront/ProductListPage.js";
import { ProductDetailPage } from "./pages/storefront/ProductDetailPage.js";
import { CategoryPage } from "./pages/storefront/CategoryPage.js";
import { CheckoutPage } from "./pages/storefront/CheckoutPage.js";
import { OrderSuccessPage } from "./pages/storefront/OrderSuccessPage.js";
import { TrackOrderPage } from "./pages/storefront/TrackOrderPage.js";
import { CustomerPortal } from "./pages/customer/CustomerPortal.js";

// Admin & Partner Pages (যদি ফাইলগুলো না থাকে তবে ফলব্যাক রেন্ডার দেখাবে)
import { Reports } from "./pages/admin/system/Reports.js";
import { ProductList } from "./pages/admin/catalog/ProductList.js";
import { ProductWizard } from "./pages/admin/catalog/ProductWizard.js";
import { CategoryManager } from "./pages/admin/catalog/CategoryManager.js";
import { StockLedger } from "./pages/admin/inventory/StockLedger.js";
import { StockMovements } from "./pages/admin/inventory/StockMovements.js";
import { LowStockAlerts } from "./pages/admin/inventory/LowStockAlerts.js";
import { SupplierManager } from "./pages/admin/inventory/SupplierManager.js";
import { PurchaseOrders } from "./pages/admin/inventory/PurchaseOrders.js";
import { OrderList } from "./pages/admin/orders/OrderList.js";
import { OrderDetail } from "./pages/admin/orders/OrderDetail.js";
import { BulkShipment } from "./pages/admin/orders/BulkShipment.js";
import { CourierHub } from "./pages/admin/orders/CourierHub.js";
import { ReturnRTO } from "./pages/admin/orders/ReturnRTO.js";
import { Payments } from "./pages/admin/orders/Payments.js";
import { BulkExcelTool } from "./pages/admin/system/BulkExcelTool.js";
import { BulkPriceEngine } from "./pages/admin/system/BulkPriceEngine.js";
import { AuditTrail } from "./pages/admin/system/AuditTrail.js";
import { Settings } from "./pages/admin/system/Settings.js";
import { SellerPortal } from "./pages/partner/SellerPortal.js";
import { ResellerPortal } from "./pages/partner/ResellerPortal.js";
import { WholesalePortal } from "./pages/partner/WholesalePortal.js";

// সেফ র‍্যাপার ফাংশন
const wrap = (fn) => async (params) => {
  if (typeof fn === "function") return await fn(params);
  return `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center font-bengali">
      <div class="glass-panel p-8 rounded-3xl max-w-md border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">পেজটি প্রস্তুত হচ্ছে</h3>
        <p class="text-xs text-slate-500 mt-2">এই মডিউলটির ফাইল গিটহাবে আপলোড সম্পন্ন হলে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।</p>
        <a href="/" class="btn-primary mt-6 inline-flex text-xs px-5 py-2.5">হোম পেজে ফিরে যান</a>
      </div>
    </div>
  `;
};

// ==================== REGISTER STATIC SPA ROUTES ====================
router.addRoute("/", wrap(HomePage));
router.addRoute("/products", wrap(ProductListPage));
router.addRoute("/product/:id", wrap(ProductDetailPage));
router.addRoute("/categories", wrap(CategoryPage));
router.addRoute("/checkout", wrap(CheckoutPage));
router.addRoute("/order-success/:id", wrap(OrderSuccessPage));
router.addRoute("/track-order", wrap(TrackOrderPage));
router.addRoute("/customer/account", wrap(CustomerPortal));

// Admin & Partner Routes
router.addRoute("/admin/dashboard", wrap(Reports));
router.addRoute("/admin/products", wrap(ProductList));
router.addRoute("/admin/products/create", wrap(ProductWizard));
router.addRoute("/admin/products/edit/:id", wrap(ProductWizard));
router.addRoute("/admin/categories", wrap(CategoryManager));
router.addRoute("/admin/inventory", wrap(StockLedger));
router.addRoute("/admin/inventory/movements", wrap(StockMovements));
router.addRoute("/admin/inventory/low-stock", wrap(LowStockAlerts));
router.addRoute("/admin/suppliers", wrap(SupplierManager));
router.addRoute("/admin/inventory/purchase-orders", wrap(PurchaseOrders));
router.addRoute("/admin/orders", wrap(OrderList));
router.addRoute("/admin/orders/detail/:id", wrap(OrderDetail));
router.addRoute("/admin/orders/bulk-shipment", wrap(BulkShipment));
router.addRoute("/admin/couriers", wrap(CourierHub));
router.addRoute("/admin/orders/returns", wrap(ReturnRTO));
router.addRoute("/admin/orders/payments", wrap(Payments));
router.addRoute("/admin/system/bulk", wrap(BulkExcelTool));
router.addRoute("/admin/system/bulk-price", wrap(BulkPriceEngine));
router.addRoute("/admin/audit", wrap(AuditTrail));
router.addRoute("/admin/settings", wrap(Settings));
router.addRoute("/partner/seller", wrap(SellerPortal));
router.addRoute("/partner/reseller", wrap(ResellerPortal));
router.addRoute("/partner/wholesale", wrap(WholesalePortal));

// ==================== GLOBAL APP INITIALIZER ====================
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
