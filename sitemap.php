<?php
/**
 * DREAM CART BD — DYNAMIC GOOGLE SEARCH XML SITEMAP GENERATOR (sitemap.php)
 * Automatically indexes all Storefront Routes, Categories, Campaign Landing Pages & Products.
 */

require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/cache_engine.php';

if (!headers_sent()) {
    header('Content-Type: application/xml; charset=UTF-8');
    header('Cache-Control: public, max-age=600');
}

$siteOrigin = DCBD_SITE_ORIGIN;
$today      = date('Y-m-d');
$products   = DcbdCacheEngine::getProducts();
$categories = DcbdCacheEngine::getCategories();

$coreRoutes = [
    ['loc' => '/', 'priority' => '1.0', 'changefreq' => 'hourly'],
    ['loc' => '/products', 'priority' => '0.9', 'changefreq' => 'hourly'],
    ['loc' => '/shop', 'priority' => '0.9', 'changefreq' => 'daily'],
    ['loc' => '/categories', 'priority' => '0.8', 'changefreq' => 'daily'],
    ['loc' => '/brands', 'priority' => '0.8', 'changefreq' => 'daily'],
    ['loc' => '/offers', 'priority' => '0.9', 'changefreq' => 'daily'],
    ['loc' => '/landing', 'priority' => '0.9', 'changefreq' => 'daily'],
    ['loc' => '/track', 'priority' => '0.7', 'changefreq' => 'weekly'],
    ['loc' => '/contact', 'priority' => '0.7', 'changefreq' => 'monthly'],
    ['loc' => '/customer/login', 'priority' => '0.6', 'changefreq' => 'monthly'],
    ['loc' => '/reseller/login', 'priority' => '0.6', 'changefreq' => 'monthly'],
    ['loc' => '/wholesaler/login', 'priority' => '0.6', 'changefreq' => 'monthly'],
    ['loc' => '/dcitbd', 'priority' => '0.7', 'changefreq' => 'weekly'],
    ['loc' => '/education', 'priority' => '0.7', 'changefreq' => 'weekly'],
    ['loc' => '/terms', 'priority' => '0.5', 'changefreq' => 'monthly'],
    ['loc' => '/privacy', 'priority' => '0.5', 'changefreq' => 'monthly'],
];

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($coreRoutes as $r): ?>
  <url>
    <loc><?= htmlspecialchars($siteOrigin . $r['loc'], ENT_XML1, 'UTF-8') ?></loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq><?= $r['changefreq'] ?></changefreq>
    <priority><?= $r['priority'] ?></priority>
  </url>
<?php endforeach; ?>
<?php foreach ($categories as $c):
    $cName = (string)($c['category'] ?? $c['Category'] ?? '');
    if ($cName === '') continue;
?>
  <url>
    <loc><?= htmlspecialchars($siteOrigin . '/products?cat=' . rawurlencode($cName), ENT_XML1, 'UTF-8') ?></loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
<?php endforeach; ?>
<?php foreach ($products as $p):
    $slug = (string)($p['slug'] ?? $p['sku'] ?? '');
    if ($slug === '') continue;
?>
  <url>
    <loc><?= htmlspecialchars($siteOrigin . '/product/' . rawurlencode($slug), ENT_XML1, 'UTF-8') ?></loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>
<?php endforeach; ?>
</urlset>
