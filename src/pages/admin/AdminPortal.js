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

// Safe LocalStorage Protection: Intercepts setItem to prevent QuotaExceededError
(function installSafeLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (window.__safeStoragePatchInstalled) return;
  window.__safeStoragePatchInstalled = true;

  const originalSet = window.localStorage.setItem.bind(window.localStorage);
  const originalGet = window.localStorage.getItem.bind(window.localStorage);
  const memoryFallback = new Map();

  window.localStorage.getItem = function(key) {
    try {
      const val = originalGet(key);
      if (val !== null && val !== undefined) return val;
    } catch (e) {}
    if (memoryFallback.has(key)) return memoryFallback.get(key);
    return null;
  };

  window.localStorage.setItem = function(key, value) {
    try {
      originalSet(key, value);
    } catch (err) {
      if (err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014 || err.number === -2147024882)) {
        console.warn(`[SafeStorage] QuotaExceededError for "${key}". Cleaning oversized base64 images and transient caches...`);
        try {
          if (typeof value === 'string' && value.includes('data:image/')) {
            const stripped = value.replace(/data:image\/[a-zA-Z0-9.+_-]+;base64,[A-Za-z0-9+/=]+/g, 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg');
            originalSet(key, stripped);
            return;
          }
        } catch (e1) {}

        const transientKeys = ['dcbd_worker_logs', 'dcbd_audit_trail', 'dcbd_viewers_log', 'dcbd_landing_config', 'dcbd_backup_data'];
        transientKeys.forEach(k => {
          if (k !== key) {
            try { window.localStorage.removeItem(k); } catch (e2) {}
          }
        });

        try {
          let cleanedVal = typeof value === 'string' ? value.replace(/data:image\/[a-zA-Z0-9.+_-]+;base64,[A-Za-z0-9+/=]+/g, 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg') : value;
          originalSet(key, cleanedVal);
          return;
        } catch (e3) {
          memoryFallback.set(key, value);
          console.warn(`[SafeStorage] Stored "${key}" in memory fallback to maintain unbroken UI.`);
        }
      } else {
        throw err;
      }
    }
  };
})();

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

  // Reset lazy-rendered page tracker on full portal mount & hydrate only the active page in 0ms
  if (typeof window !== 'undefined') {
    window.__renderedAdminPages = new Set();
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

      // Hydrate only the currently active page view (0ms instant load!)
      if (window.ensureAdminPageViewRendered) {
        window.ensureAdminPageViewRendered(activeRoute.pageId, true);
      }
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
