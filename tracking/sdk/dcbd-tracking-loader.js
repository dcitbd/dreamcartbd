/**
 * Dream Cart BD — Isolated Async Tracking Loader (tracking/sdk/dcbd-tracking-loader.js)
 * Ultra-light (<1.5 KB), non-blocking, zero global CSS/JS conflicts.
 * Fails silently on ad-blockers, offline mode, or static-only hosts without API backend.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || window.__DCBD_TRK_LOADER_INIT__) return;
  window.__DCBD_TRK_LOADER_INIT__ = true;

  // Skip loading storefront SDK inside the dedicated /admin/tracking/ dashboard
  if (window.location && /^\/admin\/tracking(\/|$)/i.test(window.location.pathname || '')) return;

  function bootSdk() {
    try {
      var base = (typeof window.__DCBD_TRACKING_BASE__ === 'string' && window.__DCBD_TRACKING_BASE__)
        ? window.__DCBD_TRACKING_BASE__.replace(/\/$/, '')
        : ((window.__APP_BASE__ || '').replace(/\/$/, ''));
      var s = document.createElement('script');
      s.src = base + '/tracking/sdk/dcbd-tracking.js?v=1.0.0';
      s.async = true;
      s.defer = true;
      s.onerror = function () { /* fail silently */ };
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(bootSdk, { timeout: 1500 });
  } else {
    setTimeout(bootSdk, 300);
  }
})();
