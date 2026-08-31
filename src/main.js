/**
 * ============================================================================
 * DREAM CART BD — APPLICATION BOOTSTRAPPER (main.js)
 * High-Performance Resilient SPA Engine with Dynamic Route Resolution
 * ============================================================================
 */

import { store } from "./js/store.js";
import { router } from "./js/router.js";
import { SyncEngine } from "./api/sync.js";

// ==================== STOREFRONT PAGES ====================
import { HomePage } from "./pages/storefront/HomePage.js";
import { ProductListPage } from "./pages/storefront/ProductListPage.js";
import { ProductDetailPage } from "./pages/storefront/ProductDetailPage.js";
import { CategoryPage } from "./pages/storefront/CategoryPage.js";
import { CheckoutPage } from "./pages/storefront/CheckoutPage.js";
import { OrderSuccessPage } from "./pages/storefront/OrderSuccessPage.js";
import { TrackOrderPage } from "./pages/storefront/TrackOrderPage.js";
import { CustomerPortal } from "./pages/customer/CustomerPortal.js";

// ==================== PARTNER PORTALS ====================
import SellerPortal from "./pages/partner/SellerPortal.js";
import ResellerPortal from "./pages/partner/ResallerPortal.js";
import WholesalePortal from "./pages/partner/WholeSalePortal.js";

// ==================== ADMIN CATALOG & INVENTORY ====================
import ProductList from "./admin/Catalog/ProductList.js";
import ProductWizard from "./admin/Catalog/VariantGenerator.js";
import CategoryManager from "./admin/Catalog/CatagoryManager.js";
import StockLedger from "./admin/inventory/StockLedger.js";
import StockMovements from "./admin/inventory/StockMovements.js";
import LowStockAlerts from "./admin/inventory/LowStockAlarts.js";
import SupplierManager from "./admin/inventory/SupplierManager.js";
import PurchaseOrders from "./admin/inventory/PurchaseOrders.js";

// ==================== ADMIN ORDERS & SYSTEM ====================
import OrderList from "./admin/orders/OrderList.js";
import OrderDetail from "./admin/orders/OrderDetails.js";
import BulkShipment from "./admin/orders/BulkShipment.js";
import CourierHub from "./admin/orders/CourierHub.js";
import ReturnRTO from "./admin/orders/ReturnRTO.js";
import Payments from "./admin/orders/Payments.js";
import BulkExcelTool from "./admin/system/BulkExcelTool.js";
import AuditTrail from "./admin/system/AuditTrail.js";
import Settings from "./admin/system/Settings.js";
import Reports from "./admin/system/Reports.js";

/**
 * সেফ র‍্যাপার ফাংশন (যাতে কোনো মডিউল লোড না হলে অ্যাপ ক্র্যাশ না করে)
 */
const wrap = (fn) => async (params) => {
  try {
    if (typeof fn === "function") return await fn(params);
    if (fn && typeof fn.default === "function") return await fn.default(params);
    throw new Error("Render function not found");
  } catch (err) {
    console.warn(`[Module Loader Warning]:`, err.message);
    return `
      <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center font-bengali">
        <div class="glass-panel p-8 rounded-3xl max-w-md border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
          <div class="w-12 h-12 bg-brand-50 dark:bg-slate-800 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i data-lucide="package-search" class="w-6 h-6"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">পেজটি প্রস্তুত হচ্ছে</h3>
          <p class="text-xs text-slate-500 mt-2">এই মডিউলটির ফাইল লোড হতে সমস্যা হয়েছে বা তৈরি করা হচ্ছে।</p>
          <a href="/" class="btn-primary mt-6 inline-flex text-xs px-5 py-2.5">হোম পেজে ফিরে যান</a>
        </div>
      </div>
    `;
  }
};

// ==================== REGISTER CORRECT SPA ROUTES ====================

// Storefront & Customer Routes
router.addRoute("/", wrap(HomePage));
router.addRoute("/products", wrap(ProductListPage));
router.addRoute("/product/:id", wrap(ProductDetailPage));
router.addRoute("/categories", wrap(CategoryPage));
router.addRoute("/checkout", wrap(CheckoutPage));
router.addRoute("/order-success/:id", wrap(OrderSuccessPage));
router.addRoute("/track-order", wrap(TrackOrderPage));
router.addRoute("/customer/account", wrap(CustomerPortal));

// Partner Routes
router.addRoute("/partner/seller", wrap(SellerPortal));
router.addRoute("/partner/reseller", wrap(ResellerPortal));
router.addRoute("/partner/wholesale", wrap(WholesalePortal));

// Admin Catalog Routes
router.addRoute("/admin/dashboard", wrap(Reports));
router.addRoute("/admin/products", wrap(ProductList));
router.addRoute("/admin/products/create", wrap(ProductWizard));
router.addRoute("/admin/products/edit/:id", wrap(ProductWizard));
router.addRoute("/admin/categories", wrap(CategoryManager));

// Admin Inventory Routes
router.addRoute("/admin/inventory", wrap(StockLedger));
router.addRoute("/admin/inventory/movements", wrap(StockMovements));
router.addRoute("/admin/inventory/low-stock", wrap(LowStockAlerts));
router.addRoute("/admin/suppliers", wrap(SupplierManager));
router.addRoute("/admin/inventory/purchase-orders", wrap(PurchaseOrders));

// Admin Order & Courier Routes
router.addRoute("/admin/orders", wrap(OrderList));
router.addRoute("/admin/orders/detail/:id", wrap(OrderDetail));
router.addRoute("/admin/orders/bulk-shipment", wrap(BulkShipment));
router.addRoute("/admin/couriers", wrap(CourierHub));
router.addRoute("/admin/orders/returns", wrap(ReturnRTO));
router.addRoute("/admin/orders/payments", wrap(Payments));

// Admin System Routes
router.addRoute("/admin/system/bulk", wrap(BulkExcelTool));
router.addRoute("/admin/audit", wrap(AuditTrail));
router.addRoute("/admin/settings", wrap(Settings));

// ==================== GLOBAL APP INITIALIZER ====================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (typeof SyncEngine !== "undefined" && SyncEngine.startPolling) {
      SyncEngine.startPolling(10000);
    }
    window.SyncEngine = SyncEngine;
    window.store = store;
    window.router = router;

    // গ্লোবাল লিঙ্ক ইন্টারসেপ্টর
    document.body.addEventListener("click", (e) => {
      const anchor = e.target.closest("a");
      if (anchor && anchor.getAttribute("href") && anchor.getAttribute("href").startsWith("/")) {
        e.preventDefault();
        router.navigate(anchor.getAttribute("href"));
      }
    });

    // ইনিশিয়াল পেজ রেন্ডার
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
