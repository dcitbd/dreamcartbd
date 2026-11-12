<?php
/**
 * DREAM CART BD — LIVE DYNAMIC XML PRODUCT CATALOG FEED (feed.php)
 * Compatible with:
 * 1. Facebook & Instagram Commerce Manager (Advantage+ Catalog Ads)
 * 2. Google Merchant Center & YouTube Shopping Ads
 * 3. TikTok Catalog Manager
 * URL: https://dreamcartbd.com/feed.php (or /public/catalog-feed.xml)
 */

require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/cache_engine.php';

if (!headers_sent()) {
    header('Content-Type: application/xml; charset=UTF-8');
    header('Cache-Control: public, max-age=300');
}

$products   = DcbdCacheEngine::getProducts();
$siteOrigin = DCBD_SITE_ORIGIN;
$nowRfc     = date(DATE_RFC2822);

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dream Cart BD (ড্রিম কার্ট বিডি) — Official Product Catalog Feed</title>
    <link><?= htmlspecialchars($siteOrigin, ENT_XML1, 'UTF-8') ?>/</link>
    <description>Official Live Product Feed for Facebook, Instagram, Google Merchant Center, YouTube Shopping &amp; TikTok Ads — Dream Cart BD.</description>
    <lastBuildDate><?= htmlspecialchars($nowRfc, ENT_XML1, 'UTF-8') ?></lastBuildDate>
    <atom:link href="<?= htmlspecialchars($siteOrigin, ENT_XML1, 'UTF-8') ?>/feed.php" rel="self" type="application/rss+xml" />
<?php foreach ($products as $idx => $p):
    if (!is_array($p)) continue;
    $status = (string)($p['status'] ?? 'সক্রিয়');
    if ($status === 'নিষ্ক্রিয়' || (isset($p['is_active']) && $p['is_active'] === false)) continue;

    $sku   = (string)($p['sku'] ?? $p['product_id'] ?? ('DCBD-' . ($idx + 1)));
    $name  = (string)($p['name'] ?? $p['p_name'] ?? 'Product');
    $slug  = (string)($p['slug'] ?? strtolower(preg_replace('/[^a-zA-Z0-9\-]+/', '-', $sku)));
    $desc  = (string)($p['description'] ?? ($name . ' — Order online from Dream Cart BD with fast Cash on Delivery across Bangladesh.'));
    $brand = (string)($p['brand'] ?? 'Dream Cart BD');
    $cat   = (string)($p['category'] ?? 'General');
    $sell  = (float)($p['selling_price'] ?? 0);
    $orig  = (float)($p['original_price'] ?? $sell);
    if ($orig < $sell) $orig = $sell;
    $stock = ((int)($p['stock'] ?? 25)) > 0 ? 'in stock' : 'preorder';
    $thumb = (string)($p['thumbnail'] ?? ($p['images'][0] ?? '/public/icon/logo.png'));
    if (strpos($thumb, 'http') !== 0) {
        $thumb = $siteOrigin . '/' . ltrim($thumb, '/');
    }
    $link  = $siteOrigin . '/product/' . rawurlencode($slug);
?>
    <item>
      <g:id><?= htmlspecialchars($sku, ENT_XML1, 'UTF-8') ?></g:id>
      <g:title><?= htmlspecialchars($name, ENT_XML1, 'UTF-8') ?></g:title>
      <g:description><?= htmlspecialchars($desc, ENT_XML1, 'UTF-8') ?></g:description>
      <g:link><?= htmlspecialchars($link, ENT_XML1, 'UTF-8') ?></g:link>
      <g:image_link><?= htmlspecialchars($thumb, ENT_XML1, 'UTF-8') ?></g:image_link>
      <g:brand><?= htmlspecialchars($brand, ENT_XML1, 'UTF-8') ?></g:brand>
      <g:condition>new</g:condition>
      <g:availability><?= htmlspecialchars($stock, ENT_XML1, 'UTF-8') ?></g:availability>
      <g:price><?= number_format($orig, 2, '.', '') ?> BDT</g:price>
      <g:sale_price><?= number_format($sell, 2, '.', '') ?> BDT</g:sale_price>
      <g:product_type><?= htmlspecialchars($cat, ENT_XML1, 'UTF-8') ?></g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:custom_label_0>Dream Cart BD Official</g:custom_label_0>
    </item>
<?php endforeach; ?>
  </channel>
</rss>
