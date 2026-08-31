/**
 * ============================================================================
 * DREAM CART BD — APPLICATION BOOTSTRAPPER (main.js)
 * Clean, Fast & Lazy-Loaded SPA Routing
 * ============================================================================
 */

import { store } from "./js/store.js";
import { router } from "./js/router.js";
import { SyncEngine } from "./api/sync.js";

// ==================== DYNAMIC LAZY ROUTES ====================

// Storefront & Customer Pages
router.addRoute("/", async () => (await import("./pages/storefront/HomePage.js")).HomePage);
router.addRoute("/products", async () => (await import("./pages/storefront/ProductListPage.js")).ProductListPage);
router.addRoute("/product/:id", async () => (await import("./pages/storefront/ProductDetailPage.js")).ProductDetailPage);
router.addRoute("/categories", async () => (await import("./pages/storefront/CategoryPage.js")).CategoryPage);
router.addRoute("/checkout", async () => (await import("./pages/storefront/CheckoutPage.js")).CheckoutPage);
router.addRoute("/order-success/:id", async () => (await import("./pages/storefront/OrderSuccessPage.js")).OrderSuccessPage);
router.addRoute("/track-order", async () => (await import("./pages/storefront/TrackOrderPage.js")).TrackOrderPage);
router.addRoute("/customer/account", async () => (await import("./pages/customer/CustomerPortal.js")).CustomerPortal);

// Admin Catalog Routes
router.addRoute("/admin/dashboard", async () => (await import("./pages/admin/system/Reports.js")).Reports);
router.addRoute("/admin/products", async () => (await import("./pages/admin/catalog/ProductList.js")).ProductList);
router.addRoute("/admin/products/create", async () => (await import("./pages/admin/catalog/ProductWizard.js")).ProductWizard);
router.addRoute("/admin/products/edit/:id", async () => (await import("./pages/admin/catalog/ProductWizard.js")).ProductWizard);
router.addRoute("/admin/categories", async () => (await import("./pages/admin/catalog/CategoryManager.js")).CategoryManager);

// Admin Inventory Routes
router.addRoute("/admin/inventory", async () => (await import("./pages/admin/inventory/StockLedger.js")).StockLedger);
router.addRoute("/admin/inventory/movements", async () => (await import("./pages/admin/inventory/StockMovements.js")).StockMovements);
router.addRoute("/admin/inventory/low-stock", async () => (await import("./pages/admin/inventory/LowStockAlerts.js")).LowStockAlerts);
router.addRoute("/admin/suppliers", async () => (await import("./pages/admin/inventory/SupplierManager.js")).SupplierManager);
router.addRoute("/admin/inventory/purchase-orders", async () => (await import("./pages/admin/inventory/PurchaseOrders.js")).PurchaseOrders);

// Admin Order & Courier Routes
router.addRoute("/admin/orders", async () => (await import("./pages/admin/orders/OrderList.js")).OrderList);
router.addRoute("/admin/orders/detail/:id", async () => (await import("./pages/admin/orders/OrderDetail.js")).OrderDetail);
router.addRoute("/admin/orders/bulk-shipment", async () => (await import("./pages/admin/orders/BulkShipment.js")).BulkShipment);
router.addRoute("/admin/couriers", async () => (await import("./pages/admin/orders/CourierHub.js")).CourierHub);
router.addRoute("/admin/orders/returns", async () => (await import("./pages/admin/orders/ReturnRTO.js")).ReturnRTO);
router.addRoute("/admin/orders/payments", async () => (await import("./pages/admin/orders/Payments.js")).Payments);

// Admin System & Bulk Routes
router.addRoute("/admin/system/bulk", async () => (await import("./pages/admin/system/BulkExcelTool.js")).BulkExcelTool);
router.addRoute("/admin/system/bulk-price", async () => (await import("./pages/admin/system/BulkPriceEngine.js")).BulkPriceEngine);
router.addRoute("/admin/audit", async () => (await import("./pages/admin/system/AuditTrail.js")).AuditTrail);
router.addRoute("/admin/settings", async () => (await import("./pages/admin/system/Settings.js")).Settings);

// Partner Routes
router.addRoute("/partner/seller", async () => (await import("./pages/partner/SellerPortal.js")).SellerPortal);
router.addRoute("/partner/reseller", async () => (await import("./pages/partner/ResellerPortal.js")).ResellerPortal);
router.addRoute("/partner/wholesale", async () => (await import("./pages/partner/WholesalePortal.js")).WholesalePortal);

// ==================== GLOBAL APP INITIALIZER ====================
document.addEventListener("DOMContentLoaded", () => {
  // ১. টু-ওয়ে সিঙ্ক পোলিং চালু
  SyncEngine.startPolling(10000);
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

  // ৩. ইনিশিয়াল পেজ রেন্ডার
  router.handleRoute();

  // ৪. গ্লোবাল লোডার রিমুভ
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.add("opacity-0");
    setTimeout(() => loader.remove(), 300);
  }
});
