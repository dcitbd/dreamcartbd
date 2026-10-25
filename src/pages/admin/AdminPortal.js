/**
 * DREAM CART BD — MODULAR MULTI-PAGE ADMIN PORTAL CONTROLLER (src/pages/admin/AdminPortal.js)
 * - Every Admin section is a separate, dedicated page module in ./pages/*.js
 * - Completely decoupled from customer storefront pages (loaded on-demand only on /admin/* routes)
 * - Renders ONLY the active section's dedicated page inside #admin-page-content
 */

import { authStore } from '../../store/authStore.js';
import { resolveAdminRoute } from './AdminRoutes.js';
import { injectHarmonizedAdminStyles, activateAdminShellLayout } from './AdminStyles.js';
import { renderSidebarAndTopbar } from './AdminSidebar.js';
import { initAdminGlobalState, hydrateAdminDataIfNeeded } from './AdminState.js';
import { ADMIN_PAGE_RENDERERS, renderLoginPage, renderDashboardPage } from './pages/index.js';

function syncAdminSidebarAndTopbarUI(activeRoute) {
  if (typeof document === 'undefined') return;

  // Update topbar title & subtitle
  const headerTitleEl = document.getElementById('admin-current-tab-title');
  const headerSubEl = document.getElementById('admin-current-tab-subtitle');
  if (headerTitleEl) headerTitleEl.textContent = activeRoute.title;
  if (headerSubEl) headerSubEl.textContent = activeRoute.subtitle;

  // Update top route tabs & URL badge
  document.querySelectorAll('.admin-route-tab').forEach(t => {
    if (t.getAttribute('data-page') === activeRoute.pageId) t.classList.add('active');
    else t.classList.remove('active');
  });
  const urlBadge = document.getElementById('admin-current-route-badge');
  if (urlBadge) {
    urlBadge.textContent = '🔗 /admin/' + activeRoute.slug;
    urlBadge.setAttribute('onclick', `window.copyToClipboard(window.location.origin + '/admin/${activeRoute.slug}', 'পেজ লিঙ্ক কপি হয়েছে!')`);
  }

  // Update active highlight on all sidebar sub-items
  document.querySelectorAll('.dc-sidebar-sub-item').forEach(btn => {
    if (btn.getAttribute('data-page') === activeRoute.pageId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Update active group & open accordion
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

  // Run page-specific post-mount initializers
  if (activeRoute.pageId === 'page-prod-add' && window.updateAddProductLiveSummary) {
    window.updateAddProductLiveSummary();
  }
  if (activeRoute.pageId === 'page-prod-categories' && window.renderInteractiveCategoryTree) {
    window.renderInteractiveCategoryTree();
  }
  if (activeRoute.pageId === 'page-prod-banners' && window.renderAdminBannersList) {
    window.renderAdminBannersList();
  }
  if (activeRoute.pageId === 'page-prod-landing') {
    if (window.renderLandingDraftBanners) window.renderLandingDraftBanners();
    if (window.renderLandingDraftVideos) window.renderLandingDraftVideos();
    if (window.renderLandingSelectedProducts) window.renderLandingSelectedProducts();
  }

  // Auto-close mobile drawer if open
  if (window.closeAdminSidebar) window.closeAdminSidebar();
}

export async function renderAdminPortal(params = {}) {
  // Initialize Admin state & styles ONLY when visiting /admin/*
  if (!window.__adminGlobalStateInitialized) {
    initAdminGlobalState();
    window.__adminGlobalStateInitialized = true;
  }
  injectHarmonizedAdminStyles();
  activateAdminShellLayout();

  const isAuth = authStore.isAuthenticated() && authStore.isAdmin();
  const pathSub = (typeof window !== 'undefined' ? window.location.pathname : '')
    .toLowerCase()
    .replace(/^.*\/admin\/?/, '')
    .replace(/^\/+|\/+$/g, '');
  const rawSubview = params.subview || pathSub || (isAuth ? 'dashboard' : 'login');

  if (!isAuth || rawSubview === 'login') {
    return renderLoginPage();
  }

  const data = await hydrateAdminDataIfNeeded();
  const activeRoute = resolveAdminRoute(rawSubview);
  window.__adminState.activePage = activeRoute.pageId;
  window.__adminState.activeGroup = activeRoute.groupId;

  const userDisplayName = authStore.getUserDisplayName ? authStore.getUserDisplayName() : 'Jainal Abedin';
  const workerType = authStore.user?.worker_type || 'Master Admin';
  const workerRole = authStore.user?.role || 'Full System Access';

  const pageProps = { ...data, userDisplayName, workerType, workerRole, activeRoute };

  // Attach fast in-place dedicated page renderer for sidebar/tab clicks
  if (typeof window !== 'undefined') {
    window.__renderDedicatedAdminPage = function(routeObj) {
      const mount = document.getElementById('admin-page-content');
      if (!mount) return;
      const stData = window.__adminState || data;
      const fn = ADMIN_PAGE_RENDERERS[routeObj.pageId] || renderDashboardPage;
      mount.innerHTML = fn({ ...stData, userDisplayName, workerType, workerRole, activeRoute: routeObj });
      syncAdminSidebarAndTopbarUI(routeObj);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  const renderPageFn = ADMIN_PAGE_RENDERERS[activeRoute.pageId] || renderDashboardPage;
  const activePageHtml = renderPageFn(pageProps);

  if (typeof window !== 'undefined') {
    setTimeout(() => syncAdminSidebarAndTopbarUI(activeRoute), 0);
  }

  return `
    <div class="dc-admin-wrapper">
      ${renderSidebarAndTopbar(pageProps)}
          <div id="admin-page-content">
            ${activePageHtml}
          </div>
        </main>
      </div>
    </div>
  `;
}

export const AdminPortal = renderAdminPortal;
export default renderAdminPortal;
