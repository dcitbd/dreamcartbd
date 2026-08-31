/**
 * ============================================================================
 * DREAM CART BD — APPLICATION BOOTSTRAPPER (main.js)
 * ============================================================================
 */

import { store } from "./js/store.js";
import { router } from "./js/router.js";
import { SyncEngine } from "./api/sync.js";

// Pages Import
import { HomePage } from "./pages/storefront/HomePage.js";
import { ProductDetailPage } from "./pages/storefront/ProductDetailPage.js";
import { ProductListPage } from "./pages/storefront/ProductListPage.js";
import { CategoryPage } from "./pages/storefront/CategoryPage.js";
import { CheckoutPage } from "./pages/storefront/CheckoutPage.js";
import { OrderSuccessPage } from "./pages/storefront/OrderSuccessPage.js";
import { TrackOrderPage } from "./pages/storefront/TrackOrderPage.js";
import { CustomerPortal } from "./pages/customer/CustomerPortal.js";

// Admin Pages
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
import { CourierHub } from "./pages/admin/orders/CourierHub.js";
import { BulkShipment } from "./pages/admin/orders/BulkShipment.js";
import { ReturnRTO } from "./pages/admin/orders/ReturnRTO.js";
import { Payments } from "./pages/admin/orders/Payments.js";
import { BulkExcelTool } from "./pages/admin/system/BulkExcelTool.js";
import { BulkPriceEngine } from "./pages/admin/system/BulkPriceEngine.js";
import { Reports } from "./pages/admin/system/Reports.js";
import { AuditTrail } from "./pages/admin/system/AuditTrail.js";
import { BackupCenter } from "./pages/admin/system/BackupCenter.js";
import { Settings } from "./pages/admin/system/Settings.js";

// Partner Pages
import { SellerPortal } from "./pages/partner/SellerPortal.js";
import { ResellerPortal } from "./pages/partner/ResellerPortal.js";
import { WholesalePortal } from "./pages/partner/WholesalePortal.js";

// ==================== REGISTER SPA ROUTES ====================
router.addRoute("/", HomePage);
router.addRoute("/products", ProductListPage);
router.addRoute("/product/:id", ProductDetailPage);
router.addRoute("/categories", CategoryPage);
router.addRoute("/checkout", CheckoutPage);
router.addRoute("/order-success/:id", OrderSuccessPage);
router.addRoute("/track-order", TrackOrderPage);
router.addRoute("/customer/account", CustomerPortal);

// Admin Routes
router.addRoute("/admin/dashboard", Reports);
router.addRoute("/admin/products", ProductList);
router.addRoute("/admin/products/create", ProductWizard);
router.addRoute("/admin/products/edit/:id", ProductWizard);
router.addRoute("/admin/categories", CategoryManager);
router.addRoute("/admin/inventory", StockLedger);
router.addRoute("/admin/inventory/movements", StockMovements);
router.addRoute("/admin/inventory/low-stock", LowStockAlerts);
router.addRoute("/admin/suppliers", SupplierManager);
router.addRoute("/admin/inventory/purchase-orders", PurchaseOrders);
router.addRoute("/admin/orders", OrderList);
router.addRoute("/admin/orders/detail/:id", OrderDetail);
router.addRoute("/admin/orders/bulk-shipment", BulkShipment);
router.addRoute("/admin/couriers", CourierHub);
router.addRoute("/admin/orders/returns", ReturnRTO);
router.addRoute("/admin/orders/payments", Payments);
router.addRoute("/admin/system/bulk", BulkExcelTool);
router.addRoute("/admin/system/bulk-price", BulkPriceEngine);
router.addRoute("/admin/audit", AuditTrail);
router.addRoute("/admin/settings", Settings);

// Partner Routes
router.addRoute("/partner/seller", SellerPortal);
router.addRoute("/partner/reseller", ResellerPortal);
router.addRoute("/partner/wholesale", WholesalePortal);

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
