<?php
/**
 * DREAM CART BD — MASTER PHP BOOTSTRAP & 0ms SSR HYDRATION ENGINE (includes/bootstrap.php)
 * Powers all 108+ PHP routes with:
 * - Gzip / Brotli High-Speed Output Compression
 * - HTTP/2 Asset Preload & Security Headers
 * - Instant Server-Side Preloaded Cache (`window.__DCBD_SSR_CACHE__`) so pages open in 0ms
 * - Dynamic Server-Side SEO, OpenGraph, Product Catalog Meta & Omni-Channel Ad Pixels
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/cache_engine.php';
require_once __DIR__ . '/pixel_tracker.php';
require_once __DIR__ . '/seo_renderer.php';

function dcbd_render_app_page(string $forcedRoute = '') {
    // 1. Enable high-speed Gzip output compression if supported
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
        header('Cache-Control: public, max-age=0, must-revalidate');
        // HTTP/2 Link Preload for critical CSS & JS
        header('Link: </src/styles/main.css>; rel=preload; as=style, </src/boot.js>; rel=preload; as=script, </src/main.js>; rel=modulepreload', false);
    }

    $seoHead  = DcbdSeoRenderer::renderSeoHead($forcedRoute, $_GET ?? []);
    $settings = DcbdCacheEngine::getSiteSettings();
    $noscript = DcbdPixelTracker::renderBodyNoscript($settings);
    $ssrCache = json_encode(DcbdCacheEngine::getPreloadedSsrState(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    echo <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
{$seoHead}
  <!-- Instant 0ms Server-Side Preloaded State (PHP + Python Turbo Cache) -->
  <script>
    window.__DCBD_SSR_CACHE__ = {$ssrCache};
    window.__DCBD_PHP_API_URL__ = (window.__APP_BASE__ || '') + '/api/index.php';
    try {
      if (window.__DCBD_SSR_CACHE__) {
        var _c = window.__DCBD_SSR_CACHE__;
        if (_c.products && _c.products.length > 0 && !localStorage.getItem('dcbd_sheet_products')) {
          localStorage.setItem('dcbd_sheet_products', JSON.stringify(_c.products));
        }
        if (_c.categories && _c.categories.length > 0 && !localStorage.getItem('dcbd_sheet_categories')) {
          localStorage.setItem('dcbd_sheet_categories', JSON.stringify(_c.categories));
        }
        if (_c.brands && _c.brands.length > 0 && !localStorage.getItem('dcbd_sheet_brands')) {
          localStorage.setItem('dcbd_sheet_brands', JSON.stringify(_c.brands));
        }
        if (_c.banners && _c.banners.length > 0 && !localStorage.getItem('dcbd_sheet_banners')) {
          localStorage.setItem('dcbd_sheet_banners', JSON.stringify(_c.banners));
        }
        if (_c.settings && !localStorage.getItem('dcbd_site_settings')) {
          localStorage.setItem('dcbd_site_settings', JSON.stringify(_c.settings));
        }
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
