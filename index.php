<?php
/**
 * DREAM CART BD — ROOT SSR & CLEAN ROUTE ENTRY POINT (index.php)
 * Routes all storefront & product URLs (e.g. /product/R-SOO-00148) through
 * the Server-Side SEO, OpenGraph & Preloaded Cache Engine with HTTP 200.
 */

require_once __DIR__ . '/includes/bootstrap.php';
dcbd_render_app_page();
