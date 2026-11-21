<?php
/**
 * DREAM CART BD — MASTER PHP BOOTSTRAP & 0ms LIVE MULTI-BROWSER SSR ENGINE (includes/bootstrap.php)
 * Write Once, Reuse Everywhere across all 110+ PHP routes & standalone pages:
 * - Gzip / Brotli High-Speed Output Compression
 * - HTTP/2 Asset Preload & Security Headers
 * - Instant Server-Side Preloaded Cache (`window.__DCBD_SSR_CACHE__`) with live cross-browser invalidation
 * - Dynamic Server-Side SEO, OpenGraph, Product Catalog Meta & Omni-Channel Ad Pixels
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/cache_engine.php';
require_once __DIR__ . '/pixel_tracker.php';
require_once __DIR__ . '/seo_renderer.php';

/**
 * Reusable HTTP response & Gzip initializer (Supports both list($s, $h, $b) and associative keys!)
 */
function dcbd_init_html_headers(): array {
    if (!headers_sent()) {
        if (extension_loaded('zlib') && !ini_get('zlib.output_compression')) {
            @ob_start('ob_gzhandler');
        } else {
            @ob_start();
        }
        header('Content-Type: text/html; charset=UTF-8');
        header('X-Powered-By: DreamCartBD-Turbo-PHP-Python/' . DCBD_VERSION);
        header('X-Content-Type-Options: nosniff');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    }
    $settings  = DcbdCacheEngine::getSiteSettings();
    $pixelHead = DcbdPixelTracker::renderHeadScripts($settings);
    $pixelBody = DcbdPixelTracker::renderBodyNoscript($settings);
    return [
        0            => $settings,
        1            => $pixelHead,
        2            => $pixelBody,
        'settings'   => $settings,
        'pixel_head' => $pixelHead,
        'pixel_body' => $pixelBody,
    ];
}

function dcbd_render_app_page(string $forcedRoute = ''): void {
    $ctx = dcbd_init_html_headers();
    if (!headers_sent()) {
        header('Link: </src/styles/main.css>; rel=preload; as=style, </src/boot.js>; rel=preload; as=script, </src/main.js>; rel=modulepreload', false);
    }

    $seoHead  = DcbdSeoRenderer::renderSeoHead($forcedRoute, $_GET ?? []);
    $noscript = $ctx['pixel_body'];
    $ssrCache = json_encode(DcbdCacheEngine::getPreloadedSsrState(false), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    echo <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
{$seoHead}
  <!-- Instant 0ms Server-Side Preloaded State + Live Cross-Browser Sync Engine -->
  <script>
    window.__DCBD_SSR_CACHE__ = {$ssrCache};
    window.__DCBD_PHP_API_URL__ = (window.__APP_BASE__ || '') + '/api/index.php';
    try {
      if (window.__DCBD_SSR_CACHE__) {
        var _c = window.__DCBD_SSR_CACHE__;
        var _prevMeta = {};
        try { _prevMeta = JSON.parse(localStorage.getItem('dcbd_server_sync_meta') || '{}') || {}; } catch (e) {}
        var _srvCols = _c.collections_meta || {};
        var _globalTs = Number(_c.version_ts || _c.sync_updated_at || 0);

        var _shouldUpdate = function(colKey, storageKey) {
          if (!localStorage.getItem(storageKey)) return true;
          var srvColTs = Number(_srvCols[colKey] || 0);
          var locColTs = Number(_prevMeta[colKey] || 0);
          if (srvColTs > 0 && srvColTs > locColTs) return true;
          return false;
        };

        if (_c.product_overrides && typeof _c.product_overrides === 'object' && Object.keys(_c.product_overrides).length > 0) {
          var _locOv = {};
          try { _locOv = JSON.parse(localStorage.getItem('dcbd_local_product_overrides') || '{}') || {}; } catch (e) {}
          localStorage.setItem('dcbd_local_product_overrides', JSON.stringify(Object.assign({}, _locOv, _c.product_overrides)));
        }
        if (Array.isArray(_c.deleted_products) && _c.deleted_products.length > 0) {
          localStorage.setItem('dcbd_deleted_product_ids', JSON.stringify(_c.deleted_products));
        }
        if (Array.isArray(_c.deleted_orders) && _c.deleted_orders.length > 0) {
          localStorage.setItem('dcbd_deleted_order_ids', JSON.stringify(_c.deleted_orders));
        }

        if (Array.isArray(_c.products) && (_c.products.length > 0 || _srvCols.products) && _shouldUpdate('products', 'dcbd_sheet_products')) {
          localStorage.setItem('dcbd_sheet_products', JSON.stringify(_c.products));
        }
        if (Array.isArray(_c.categories) && (_c.categories.length > 0 || _srvCols.categories) && _shouldUpdate('categories', 'dcbd_sheet_categories')) {
          localStorage.setItem('dcbd_sheet_categories', JSON.stringify(_c.categories));
        }
        if (Array.isArray(_c.brands) && (_c.brands.length > 0 || _srvCols.brands) && _shouldUpdate('brands', 'dcbd_sheet_brands')) {
          localStorage.setItem('dcbd_sheet_brands', JSON.stringify(_c.brands));
        }
        if (Array.isArray(_c.banners) && (_c.banners.length > 0 || _srvCols.banners) && _shouldUpdate('banners', 'dcbd_sheet_banners')) {
          localStorage.setItem('dcbd_sheet_banners', JSON.stringify(_c.banners));
        }
        if (_c.settings && typeof _c.settings === 'object' && _shouldUpdate('settings', 'dcbd_site_settings')) {
          localStorage.setItem('dcbd_site_settings', JSON.stringify(_c.settings));
        }
        if (Array.isArray(_c.payment_methods) && (_c.payment_methods.length > 0 || _srvCols.payment_method) && _shouldUpdate('payment_method', 'dcbd_payment_methods')) {
          localStorage.setItem('dcbd_payment_methods', JSON.stringify(_c.payment_methods));
        }
        if (Array.isArray(_c.delivery_methods) && (_c.delivery_methods.length > 0 || _srvCols.delivery_area) && _shouldUpdate('delivery_area', 'dcbd_delivery_methods')) {
          localStorage.setItem('dcbd_delivery_methods', JSON.stringify(_c.delivery_methods));
        }
        if (Array.isArray(_c.offers) && (_c.offers.length > 0 || _srvCols.offer_or_coupon) && _shouldUpdate('offer_or_coupon', 'dcbd_sheet_offers')) {
          localStorage.setItem('dcbd_sheet_offers', JSON.stringify(_c.offers));
        }
        if (Array.isArray(_c.landing_pages) && (_c.landing_pages.length > 0 || _srvCols.landing_pages) && _shouldUpdate('landing_pages', 'dcbd_landing_pages')) {
          localStorage.setItem('dcbd_landing_pages', JSON.stringify(_c.landing_pages));
        }
        if (Array.isArray(_c.orders) && (_c.orders.length > 0 || _srvCols.orders) && _shouldUpdate('orders', 'dcbd_sheet_orders')) {
          localStorage.setItem('dcbd_sheet_orders', JSON.stringify(_c.orders));
        }
        if (Array.isArray(_c.incomplete_orders) && (_c.incomplete_orders.length > 0 || _srvCols.incomplete_orders) && _shouldUpdate('incomplete_orders', 'dcbd_sheet_incomplete_orders')) {
          localStorage.setItem('dcbd_sheet_incomplete_orders', JSON.stringify(_c.incomplete_orders));
        }
        var _nextMeta = Object.assign({}, _prevMeta, _srvCols, { _global: _globalTs });
        localStorage.setItem('dcbd_server_sync_meta', JSON.stringify(_nextMeta));
      }
    } catch (e) {}
  </script>

  <!-- Unified Pre-Boot Security Shield, Base Path & Orbital Loader Engine -->
  <script src="/src/boot.js"></script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

  <!-- Standalone High-Performance Production CSS -->
  <link rel="stylesheet" href="/src/styles/main.css" />
  <link rel="stylesheet" href="/src/styles/admin.css" />
  <link rel="stylesheet" href="/src/styles/responsive.css" />
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-emerald-500 selection:text-white">
  {$noscript}
  <!-- Main App Root Mount Point with Unified Single-Instance Orbital Particle & Center Logo Loader -->
  <div id="app-root"></div>
  <script>if (window.mountUnifiedBootLoader) window.mountUnifiedBootLoader();</script>

  <!-- Main ES Module Bootstrapper -->
  <script type="module" src="/src/main.js"></script>
</body>
</html>
HTML;
}
