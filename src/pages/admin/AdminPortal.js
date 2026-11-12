/**
 * DREAM CART BD — MODULAR ROUTE-BASED ADMIN PORTAL (src/pages/admin/AdminPortal.js)
 * Clean, lightweight route-based controller importing dedicated page modules:
 * - adminState.js           -> Global state, safe local storage, data hydration & route definitions
 * - adminSidebar.js         -> Sidebar navigation & responsive topbar
 * - adminDashboard.js       -> Dashboard metrics & interactive sales graph
 * - adminProducts.js        -> Product catalog, add product, categories, brands, bulk tools & landing CMS
 * - adminOrders.js          -> Orders management, WhatsApp recovery, manual orders & CRM
 * - adminPartners.js        -> Resellers, wholesalers, merchant sellers & staff
 * - adminReports.js         -> Sales, performance & financial reports across all 8 sectors
 * - adminInventory.js       -> Finance & inventory ledger (reseller payouts, costs, buying, invest)
 * - adminCouriersSettings.js -> Couriers, fraud checker, online payments, shop settings & login
 */

import { authStore } from '../../store/authStore.js';
import { installSafeLocalStorage } from '../../utils/security.js';
import {
  initAdminGlobalState,
  resolveAdminRoute,
  hydrateAdminDataIfNeeded
} from './modules/adminState.js';
import { renderSidebarAndTopbar } from './modules/adminSidebar.js';
import { renderDashboardModule } from './modules/adminDashboard.js';
import {
  renderProductCatalogModule,
  renderAddProductModule,
  renderCategoryBrandModule,
  renderBulkToolsModule,
  renderLandingCmsModule,
  renderOthersModule,
  renderProductsModule
} from './modules/adminProducts.js';
import { renderOrdersModule } from './modules/adminOrders.js';
import { renderPartnersModule } from './modules/adminPartners.js';
import { renderReportsModule } from './modules/adminReports.js';
import { renderInventoryModule } from './modules/adminInventory.js';
import { renderCouriersSettingsModule, renderAdminLoginView } from './modules/adminCouriersSettings.js';

initAdminGlobalState();

installSafeLocalStorage();

function injectHarmonizedAdminStyles() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('dc-admin-google-fonts')) {
    const fontLink = document.createElement('link');
    fontLink.id = 'dc-admin-google-fonts';
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap';
    document.head.appendChild(fontLink);
  }
}

export async function renderAdminPortal(params = {}) {
  injectHarmonizedAdminStyles();

  const isAuth = authStore.isAuthenticated() && authStore.isAdmin();
  const pathSub = (typeof window !== 'undefined' ? window.location.pathname : '')
    .toLowerCase()
    .replace(/^.*\/admin\/?/, '')
    .replace(/^\/+|\/+$/g, '');
  const rawSubview = params.subview || pathSub || (isAuth ? 'dashboard' : 'login');

  if (!isAuth || rawSubview === 'login') {
    return renderAdminLoginView();
  }

  const data = await hydrateAdminDataIfNeeded();
  const activeRoute = resolveAdminRoute(rawSubview);
  window.__adminState.activePage = activeRoute.pageId;
  window.__adminState.activeGroup = activeRoute.groupId;

  const userDisplayName = authStore.getUserDisplayName ? authStore.getUserDisplayName() : 'Jainal Abedin';
  const workerType = authStore.user?.worker_type || 'Master Admin';
  const workerRole = authStore.user?.role || 'Full System Access';

  // Render all modules into the admin DOM container so every button, link, and tab switches views instantly (0ms latency!)
  const allModules = [
    renderDashboardModule(data),
    renderProductCatalogModule(data),
    renderAddProductModule(data),
    renderCategoryBrandModule(data),
    renderBulkToolsModule(data),
    renderLandingCmsModule(data),
    renderOrdersModule(data),
    renderPartnersModule(data),
    renderReportsModule(data),
    renderInventoryModule(data),
    renderCouriersSettingsModule({ ...data, userDisplayName, workerType }),
    renderOthersModule(data)
  ];

  let combinedModulesHtml = allModules.join('\n');

  // Unhide the exact target page view immediately in HTML string
  const targetMarker = `id="${activeRoute.pageId}" class="admin-page-view hidden`;
  if (combinedModulesHtml.includes(targetMarker)) {
    combinedModulesHtml = combinedModulesHtml.replace(targetMarker, `id="${activeRoute.pageId}" class="admin-page-view`);
  }

  // Sync sidebar active item & accordion group after mount
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      document.querySelectorAll('.dc-sidebar-sub-item').forEach(btn => {
        if (btn.getAttribute('data-page') === activeRoute.pageId) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      document.querySelectorAll('.admin-sidebar-main-btn').forEach(btn => {
        if (btn.getAttribute('data-group') === activeRoute.groupId) btn.classList.add('active');
        else btn.classList.remove('active');
      });
      const subnav = document.getElementById('subnav-' + activeRoute.groupId);
      const chevron = document.getElementById('chevron-' + activeRoute.groupId);
      if (subnav) {
        subnav.classList.remove('closed');
        subnav.style.display = 'block';
      }
      if (chevron) chevron.style.transform = 'rotate(90deg)';
      
      // Run view lifecycle hooks ONLY for the active page immediately (0ms dashboard paint); defer hidden tabs to idle
      const pid = activeRoute.pageId;
      if (pid === 'page-prod-all' && window.renderAdminProductsTable) window.renderAdminProductsTable();
      else if (pid === 'page-prod-add' && window.updateAddProductLiveSummary) window.updateAddProductLiveSummary();
      else if (pid === 'page-prod-categories' && window.renderInteractiveCategoryTree) window.renderInteractiveCategoryTree();
      else if (pid === 'page-prod-banners' && window.renderAdminBannersList) window.renderAdminBannersList();
      else if (pid === 'page-prod-variants' && window.renderAdminVariantsList) window.renderAdminVariantsList();
      else if (pid === 'page-prod-landing' && window.renderSavedLandingPagesList) window.renderSavedLandingPagesList();
      else if (pid === 'page-set-logs' && window.renderAdminSetLogsDOM) window.renderAdminSetLogsDOM();
      else if (pid === 'page-set-payment' && window.renderAdminPaymentMethodsDOM) window.renderAdminPaymentMethodsDOM();
      else if (pid === 'page-set-delivery' && window.renderAdminDeliveryMethodsDOM) window.renderAdminDeliveryMethodsDOM();
      else if (pid === 'page-set-offers' && window.renderAdminOffersDOM) window.renderAdminOffersDOM();

      setTimeout(() => {
        if (pid !== 'page-set-logs' && window.renderAdminSetLogsDOM) window.renderAdminSetLogsDOM();
        if (pid !== 'page-set-payment' && window.renderAdminPaymentMethodsDOM) window.renderAdminPaymentMethodsDOM();
        if (pid !== 'page-set-delivery' && window.renderAdminDeliveryMethodsDOM) window.renderAdminDeliveryMethodsDOM();
        if (pid !== 'page-set-offers' && window.renderAdminOffersDOM) window.renderAdminOffersDOM();
      }, 350);
    }, 0);
  }

  return `
    <div class="dc-admin-wrapper">
      ${renderSidebarAndTopbar({ ...data, userDisplayName, workerType, workerRole, activeRoute })}
          ${combinedModulesHtml}
        </main>
      </div>
    </div>
  `;
}

export const AdminPortal = renderAdminPortal;
export default renderAdminPortal;
