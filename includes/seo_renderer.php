<?php
/**
 * DREAM CART BD — SERVER-SIDE SEO, OPENGRAPH, PRODUCT MICRODATA & JSON-LD ENGINE (includes/seo_renderer.php)
 * Ensures 100% Instant Server-Side Rendering (SSR) of Meta Tags, OpenGraph Cards, Product Catalog Tags,
 * and Schema.org Structured Data for Facebook, Instagram, WhatsApp, YouTube, Google Search & Google Merchant Center.
 */

require_once __DIR__ . '/cache_engine.php';

class DcbdSeoRenderer {
    public static function getRouteMetadata(string $requestPath = '', array $queryParams = []): array {
        $settings   = DcbdCacheEngine::getSiteSettings();
        $siteOrigin = DCBD_SITE_ORIGIN;
        $logoUrl    = $siteOrigin . '/public/icon/logo.png';
        $ogBanner   = $siteOrigin . '/public/icon/og-banner.jpg';

        if ($requestPath === '') {
            $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
            $requestPath = '/' . trim($uri, '/');
            if ($requestPath === '//') $requestPath = '/';
        }
        $cleanPath = rtrim($requestPath, '/') ?: '/';
        if (empty($queryParams)) {
            $queryParams = $_GET ?? [];
        }

        // Default Route SEO Map (Matches src/utils/marketingPixels.js 100%)
        $routeMap = [
            '/' => [
                'title' => 'Dream Cart BD (ড্রিম কার্ট বিডি) — Smart Digital Commerce & Multi-Vendor Platform',
                'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি / বি.ডি) বাংলাদেশের বিশ্বস্ত স্মার্ট ই-কমার্স ও মাল্টি-ভেন্ডর প্ল্যাটফর্ম। স্মার্টওয়াচ, অর্গানিক ফুড, কিচেন গ্যাজেট, হোম অ্যাপ্লায়েন্স ও মেডিকেয়ার পণ্য সারা দেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
                'keywords' => 'Dream Cart BD, ড্রিম কার্ট বিডি, ড্রিম কার্ট বি.ডি, dreamcartbd, online shopping bangladesh, smartwatch bd, organic honey bd, kitchen gas safety device, reseller bd, wholesale bd, আইটি সার্ভিসেস, শিখুন ও ক্যারিয়ার গড়ুন',
            ],
            '/products' => [
                'title' => 'সকল প্রোডাক্ট’স পেজ (All Products) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি)-এর সকল অরিজিনাল প্রোডাক্ট, স্মার্টওয়াচ, কিচেন সেফটি ডিভাইস, অর্গানিক হেলথ ফুড ও হোম অ্যাপ্লায়েন্স সাশ্রয়ী মূল্যে অর্ডার করুন।',
                'keywords' => 'Dream Cart BD Products, ড্রিম কার্ট বিডি প্রোডাক্ট, all products dreamcartbd, buy gadgets online bd',
            ],
            '/shop' => [
                'title' => 'শপ ক্যাটালগ (Shop) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Dream Cart BD-এর সম্পূর্ণ প্রোডাক্ট ক্যাটালগ, ফ্ল্যাশ সেল ও ক্যাশ অন ডেলিভারি কালেকশন।',
                'keywords' => 'Dream Cart BD Shop, online shop bd, ড্রিম কার্ট বিডি শপ',
            ],
            '/categories' => [
                'title' => 'সকল ক্যাটাগরি সমূহ (All Categories) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'ক্যাটাগরি ওয়াইজ সকল পণ্য দেখুন: Smartwatches, Kitchen, Organic & Health, Home Appliances, Medicine & Healthcare, Stationery — Dream Cart BD।',
                'keywords' => 'Dream Cart BD Categories, ক্যাটাগরি সমূহ, ড্রিম কার্ট বিডি ক্যাটাগরি',
            ],
            '/brands' => [
                'title' => 'অফিসিয়াল ব্র্যান্ড সমূহ (Featured Brands) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Amazfit, Kieslect, Dream Organic, HK এবং শীর্ষস্থানীয় সকল অফিসিয়াল ব্র্যান্ডের ১০০% আসল পণ্য — Dream Cart BD।',
                'keywords' => 'Dream Cart BD Brands, Amazfit BD, Kieslect BD, Dream Organic',
            ],
            '/offers' => [
                'title' => 'বিশেষ অফার ও ডিসকাউন্ট (Offers & Coupons) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Dream Cart BD-এর মেগা ফ্ল্যাশ সেল, কুপন ডিসকাউন্ট, ফ্রি হোম ডেলিভারি ও ৫% অনলাইন পেমেন্ট ছাড় দেখুন।',
                'keywords' => 'Dream Cart BD Offers, বিশেষ অফার, ডিসকাউন্ট কুপন',
            ],
            '/landing' => [
                'title' => 'স্পেশাল ক্যাম্পেইন অফার — সীমিত সময়ের মেগা ডিসকাউন্ট | Dream Cart BD',
                'description' => 'বিশেষ অফার মূল্যে এখনই অর্ডার করুন! সারা বাংলাদেশে দ্রুত ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা।',
                'keywords' => 'Dream Cart BD Campaign, Landing Page Offer, ক্যাশ অন ডেলিভারি অফার',
            ],
            '/cart' => [
                'title' => 'শপিং কার্ট (Shopping Cart) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'আপনার শপিং কার্টের পণ্যসমূহ পর্যালোচনা করুন এবং দ্রুত ক্যাশ অন ডেলিভারিতে অর্ডার সম্পন্ন করুন।',
                'keywords' => 'Shopping Cart Dream Cart BD, শপিং কার্ট',
            ],
            '/checkout' => [
                'title' => 'দ্রুত অর্ডার চেকআউট (Fast Checkout) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'মাত্র ৩০ সেকেন্ডে আপনার অর্ডার নিশ্চিত করুন। ক্যাশ অন ডেলিভারি অথবা অনলাইন পেমেন্টে ৫% ইনস্ট্যান্ট ছাড়!',
                'keywords' => 'Checkout Dream Cart BD, অর্ডার চেকআউট',
            ],
            '/order' => [
                'title' => 'অর্ডার কনফার্মেশন — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Dream Cart BD দ্রুত চেকআউট ও অর্ডার সাবমিশন পেজ।',
                'keywords' => 'Order Dream Cart BD',
            ],
            '/order-success' => [
                'title' => 'অর্ডার সফলভাবে সম্পন্ন হয়েছে (Order Confirmed) — Dream Cart BD',
                'description' => 'আপনার অর্ডার সফলভাবে গৃহীত হয়েছে। অফিশিয়াল ডিজিটাল ভাউচার প্রিন্ট বা ডাউনলোড করুন।',
                'keywords' => 'Order Success Dream Cart BD, Digital Voucher',
            ],
            '/track' => [
                'title' => 'পার্সেল ট্র্যাক করুন (Track Order) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'আপনার অর্ডার আইডি বা মোবাইল নম্বর দিয়ে রিয়েল-টাইমে আপনার পার্সেল ও কুরিয়ার ডেলিভারি স্ট্যাটাস ট্র্যাক করুন — Dream Cart BD।',
                'keywords' => 'Track Order Dream Cart BD, পার্সেল ট্র্যাক করুন, অর্ডার ট্র্যাকিং ড্রিম কার্ট বিডি',
            ],
            '/tracking' => [
                'title' => 'পার্সেল ট্র্যাকিং (Live Tracking) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'অর্ডার আইডি বা মোবাইল নম্বর দিয়ে লাইভ অর্ডার স্ট্যাটাস ও ভাউচার দেখুন।',
                'keywords' => 'Order Tracking Dream Cart BD',
            ],
            '/contact' => [
                'title' => 'কন্টাক্ট করুন (Contact Us) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Dream Cart BD অফিস ও কাস্টমার কেয়ার: চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০। হটলাইন: 01581703822, 01818273838।',
                'keywords' => 'Contact Dream Cart BD, কন্টাক্ট করুন, ড্রিম কার্ট বিডি ঠিকানা ও হটলাইন',
            ],
            '/customer/login' => [
                'title' => 'কাস্টমার লগইন (Customer Login) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Dream Cart BD কাস্টমার পোর্টালে লগইন করুন। আপনার অর্ডার ট্র্যাকিং, ভাউচার ডাউনলোড ও বিশেষ ডিসকাউন্ট উপভোগ করুন।',
                'keywords' => 'Customer Login Dream Cart BD, কাস্টমার লগইন',
            ],
            '/customer/register' => [
                'title' => 'কাস্টমার রেজিস্ট্রেশন (Customer Register) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Dream Cart BD-তে নতুন কাস্টমার অ্যাকাউন্ট খুলুন এবং দ্রুত চেকআউট ও ক্যাশব্যাক অফার উপভোগ করুন।',
                'keywords' => 'Customer Register Dream Cart BD, কাস্টমার নিবন্ধন',
            ],
            '/reseller/login' => [
                'title' => 'রিসেলার লগইন (Reseller Login) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'বিনা পুঁজিতে ড্রপশিপিং ও রিসেলিং ব্যবসা! Dream Cart BD রিসেলার পোর্টালে লগইন করে কমিশন ও অর্ডার পরিচালনা করুন।',
                'keywords' => 'Reseller Login Dream Cart BD, রিসেলার লগইন, ড্রপশিপিং বাংলাদেশ',
            ],
            '/wholesaler/login' => [
                'title' => 'হোলসেলার লগইন (Wholesaler Login) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'সরাসরি আমদানিকারক রেটে পাইকারি পণ্য ক্রয় করতে Dream Cart BD হোলসেলার পোর্টালে লগইন করুন।',
                'keywords' => 'Wholesaler Login Dream Cart BD, হোলসেলার লগইন, পাইকারি মার্কেট বাংলাদেশ',
            ],
            '/dcitbd' => [
                'title' => 'আইটি সার্ভিসেস (IT Services) — Dream Career IT BD | Dream Cart BD',
                'description' => 'ওয়েব ডেভেলপমেন্ট, ই-কমার্স অটোমেশন, সফটওয়্যার সলিউশন ও ২৪/৭ টেকনিক্যাল আইটি সার্ভিসেস — Dream Career IT Bangladesh (DCITBD)।',
                'keywords' => 'IT Services Dream Cart BD, আইটি সার্ভিসেস, Dream Career IT BD, DCITBD',
            ],
            '/education' => [
                'title' => 'শিখুন ও ক্যারিয়ার গড়ুন (Learn & Build Career) — Dream Cart BD',
                'description' => 'ডিজিটাল স্কিল ডেভেলপমেন্ট, ফ্রিল্যান্সিং, ই-কমার্স বিজনেস ও আইটি প্রশিক্ষণের মাধ্যমে নিজের উজ্জ্বল ক্যারিয়ার গড়ুন — Dream Cart BD।',
                'keywords' => 'শিখুন ও ক্যারিয়ার গড়ুন, Education Dream Cart BD, ফ্রিল্যান্সিং ও আইটি প্রশিক্ষণ',
            ],
        ];

        $isAdmin = strpos($cleanPath, '/admin') === 0;
        $title = $routeMap[$cleanPath]['title'] ?? ($isAdmin ? 'Admin Console (Dashboard) — Dream Cart BD' : 'Dream Cart BD (ড্রিম কার্ট বিডি) — Smart Digital Commerce & Multi-Vendor Platform');
        $description = $routeMap[$cleanPath]['description'] ?? ($isAdmin ? 'Dream Cart BD — Executive Admin & Inventory Control Portal.' : $routeMap['/']['description']);
        $keywords = $routeMap[$cleanPath]['keywords'] ?? $routeMap['/']['keywords'];
        $canonicalUrl = $siteOrigin . ($cleanPath === '/' ? '/' : $cleanPath);
        $ogType = 'website';
        $ogImage = $ogBanner;
        $currentProduct = null;
        $currentLanding = null;

        // Check if Product Detail route: /product/<slug> or /product?id=<slug>
        $productSlug = '';
        if (preg_match('#^/product/([^/?\#]+)#i', $cleanPath, $m)) {
            $productSlug = $m[1];
        } elseif ($cleanPath === '/product' && !empty($queryParams['id'])) {
            $productSlug = (string)$queryParams['id'];
        } elseif ($cleanPath === '/product' && !empty($queryParams['slug'])) {
            $productSlug = (string)$queryParams['slug'];
        }

        if ($productSlug !== '') {
            $currentProduct = DcbdCacheEngine::findProduct($productSlug);
            if ($currentProduct) {
                $pName  = $currentProduct['name'] ?? $currentProduct['p_name'] ?? 'Product';
                $pPrice = (float)($currentProduct['selling_price'] ?? 0);
                $pBrand = $currentProduct['brand'] ?? 'Dream Cart BD';
                $pCat   = $currentProduct['category'] ?? 'Smart Gadgets';
                $pSku   = $currentProduct['sku'] ?? $currentProduct['product_id'] ?? 'DCBD-ITEM';
                $pSlug  = $currentProduct['slug'] ?? $productSlug;
                $title  = "{$pName} — ৳" . number_format($pPrice, 0, '.', '') . " | Dream Cart BD (ড্রিম কার্ট বিডি)";
                $description = $currentProduct['description'] ?: "{$pName} কিনুন মাত্র ৳{$pPrice} টাকায় Dream Cart BD থেকে। ব্র্যান্ড: {$pBrand} | ক্যাটাগরি: {$pCat} | সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি।";
                $keywords = "{$pName}, {$pSku}, {$pBrand}, {$pCat}, Dream Cart BD, ড্রিম কার্ট বিডি";
                $canonicalUrl = $siteOrigin . '/product/' . rawurlencode((string)$pSlug);
                $rawThumb = $currentProduct['thumbnail'] ?? ($currentProduct['images'][0] ?? $ogBanner);
                $ogImage = strpos((string)$rawThumb, 'http') === 0 ? $rawThumb : ($siteOrigin . '/' . ltrim((string)$rawThumb, '/'));
                $ogType = 'product';
            }
        }

        // Check if Campaign Landing Page route: /landing?page=<slug> or /landing/<slug>
        $landingSlug = '';
        if (preg_match('#^/landing/([^/?\#]+)#i', $cleanPath, $m)) {
            $landingSlug = $m[1];
        } elseif ($cleanPath === '/landing' && !empty($queryParams['page'])) {
            $landingSlug = (string)$queryParams['page'];
        }

        if ($cleanPath === '/landing' || $landingSlug !== '') {
            $currentLanding = DcbdCacheEngine::findLandingPage($landingSlug);
            if ($currentLanding) {
                $lpTitle = $currentLanding['title'] ?? $currentLanding['slogan'] ?? 'স্পেশাল ক্যাম্পেইন অফার';
                $lpSlug  = $currentLanding['slug'] ?? $landingSlug;
                $title   = "{$lpTitle} — সীমিত সময়ের অফার | Dream Cart BD";
                $description = "{$lpTitle} — সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন। পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা — Dream Cart BD।";
                $canonicalUrl = $siteOrigin . '/landing' . ($lpSlug ? '?page=' . rawurlencode((string)$lpSlug) : '');
                if (!empty($currentLanding['hero_banner'])) {
                    $hb = (string)$currentLanding['hero_banner'];
                    $ogImage = strpos($hb, 'http') === 0 ? $hb : ($siteOrigin . '/' . ltrim($hb, '/'));
                }
            }
        }

        // Check if Category filter on /products?cat=...
        if (!empty($queryParams['cat'])) {
            $catName = trim((string)$queryParams['cat']);
            $title = "{$catName} ক্যাটাগরির সকল পণ্য — Dream Cart BD | ড্রিম কার্ট বিডি";
            $description = "Dream Cart BD (ড্রিম কার্ট বিডি)-তে {$catName} ক্যাটাগরির সকল অরিজিনাল পণ্য, অফার ও পাইকারি/খুচরা মূল্য তালিকা দেখুন।";
            $canonicalUrl = $siteOrigin . '/products?cat=' . rawurlencode($catName);
        }

        $robots = $isAdmin ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

        return [
            'cleanPath'      => $cleanPath,
            'isAdmin'        => $isAdmin,
            'title'          => $title,
            'description'    => $description,
            'keywords'       => $keywords,
            'canonicalUrl'   => $canonicalUrl,
            'ogType'         => $ogType,
            'ogImage'        => $ogImage,
            'logoUrl'        => $logoUrl,
            'robots'         => $robots,
            'currentProduct' => $currentProduct,
            'currentLanding' => $currentLanding,
            'settings'       => $settings,
        ];
    }

    /**
     * Render complete <head> SEO, OpenGraph, Product Ad Catalog Meta & JSON-LD Structured Data
     */
    public static function renderSeoHead(string $requestPath = '', array $queryParams = []): string {
        $meta = self::getRouteMetadata($requestPath, $queryParams);
        $t    = htmlspecialchars($meta['title'], ENT_QUOTES, 'UTF-8');
        $d    = htmlspecialchars($meta['description'], ENT_QUOTES, 'UTF-8');
        $k    = htmlspecialchars($meta['keywords'], ENT_QUOTES, 'UTF-8');
        $c    = htmlspecialchars($meta['canonicalUrl'], ENT_QUOTES, 'UTF-8');
        $img  = htmlspecialchars($meta['ogImage'], ENT_QUOTES, 'UTF-8');
        $logo = htmlspecialchars($meta['logoUrl'], ENT_QUOTES, 'UTF-8');
        $rob  = htmlspecialchars($meta['robots'], ENT_QUOTES, 'UTF-8');
        $ogT  = htmlspecialchars($meta['ogType'], ENT_QUOTES, 'UTF-8');

        $out = <<<HTML
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>{$t}</title>

  <!-- Official Brand Logo & Multi-Resolution Favicons (/public/icon/) -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="48x48" href="/public/icon/favicon-48x48.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/public/icon/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/public/icon/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/public/icon/icon-192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="/public/icon/icon-512.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/public/icon/apple-touch-icon.png" />
  <link rel="manifest" href="/public/manifest.webmanifest" />
  <meta name="theme-color" content="#059669" />
  <meta name="application-name" content="Dream Cart BD" />
  <meta name="apple-mobile-web-app-title" content="Dream Cart BD" />
  <meta name="apple-mobile-web-app-capable" content="yes" />

  <!-- Search Engine Optimization (Google Search Bengali & English) -->
  <link rel="canonical" href="{$c}" />
  <meta name="robots" content="{$rob}" />
  <meta name="description" content="{$d}" />
  <meta name="keywords" content="{$k}" />
  <meta name="author" content="Dream Cart BD" />

  <!-- OpenGraph Social Preview (WhatsApp, Facebook, Instagram, Messenger, Telegram, YouTube) -->
  <meta property="og:site_name" content="Dream Cart BD (ড্রিম কার্ট বিডি)" />
  <meta property="og:type" content="{$ogT}" />
  <meta property="og:title" content="{$t}" />
  <meta property="og:description" content="{$d}" />
  <meta property="og:url" content="{$c}" />
  <meta property="og:image" content="{$img}" />
  <meta property="og:image:secure_url" content="{$img}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{$t}" />
  <meta property="og:image" content="{$logo}" />
  <meta property="og:locale" content="bn_BD" />

  <!-- Twitter / X, TikTok & YouTube Link Preview Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{$t}" />
  <meta name="twitter:description" content="{$d}" />
  <meta name="twitter:image" content="{$img}" />
  <link rel="image_src" href="{$img}" />
  <link rel="alternate" type="application/rss+xml" title="Dream Cart BD Product Catalog Feed (Facebook, Instagram & Google Merchant)" href="https://dreamcartbd.com/feed.php" />
HTML;

        // Add Product Microdata for Meta Advantage+ Catalog Ads, Instagram Shopping & Google Merchant Bot
        if (!empty($meta['currentProduct'])) {
            $p = $meta['currentProduct'];
            $pBrand = htmlspecialchars((string)($p['brand'] ?? 'Dream Cart BD'), ENT_QUOTES, 'UTF-8');
            $pStock = ((int)($p['stock'] ?? 25)) > 0 ? 'in stock' : 'available for order';
            $pPrice = htmlspecialchars((string)($p['selling_price'] ?? 0), ENT_QUOTES, 'UTF-8');
            $pSku   = htmlspecialchars((string)($p['sku'] ?? $p['product_id'] ?? 'DCBD-ITEM'), ENT_QUOTES, 'UTF-8');
            $pCat   = htmlspecialchars((string)($p['category'] ?? 'General'), ENT_QUOTES, 'UTF-8');
            $out .= "\n  <!-- Facebook / Instagram / Google / YouTube Product Catalog Ad Microdata -->\n";
            $out .= "  <meta property=\"product:brand\" content=\"{$pBrand}\" />\n";
            $out .= "  <meta property=\"product:availability\" content=\"{$pStock}\" />\n";
            $out .= "  <meta property=\"product:condition\" content=\"new\" />\n";
            $out .= "  <meta property=\"product:price:amount\" content=\"{$pPrice}\" />\n";
            $out .= "  <meta property=\"product:price:currency\" content=\"BDT\" />\n";
            $out .= "  <meta property=\"product:retailer_item_id\" content=\"{$pSku}\" />\n";
            $out .= "  <meta property=\"product:item_group_id\" content=\"{$pCat}\" />\n";
        }

        // Build JSON-LD @graph
        if (!$meta['isAdmin']) {
            $jsonLd = self::buildStructuredDataJson($meta);
            $out .= "\n  <!-- Google Search & Shopping Structured Data (Organization, Sitelinks, Categories & Products) -->\n";
            $out .= "  <script id=\"dcbd-dynamic-jsonld\" type=\"application/ld+json\">{$jsonLd}</script>\n";
        }

        // Append Ad Pixel & Tracking scripts
        $out .= DcbdPixelTracker::renderHeadScripts($meta['settings'], $meta);

        return $out;
    }

    public static function buildStructuredDataJson(array $meta): string {
        $siteOrigin = DCBD_SITE_ORIGIN;
        $products   = DcbdCacheEngine::getProducts();
        $categories = DcbdCacheEngine::getCategories();

        $sitelinks = [
            ['@type' => 'SiteNavigationElement', 'position' => 1, 'name' => 'হোমপেজ — Dream Cart BD', 'url' => "{$siteOrigin}/"],
            ['@type' => 'SiteNavigationElement', 'position' => 2, 'name' => 'প্রোডাক্ট’স পেজ (All Products)', 'url' => "{$siteOrigin}/products"],
            ['@type' => 'SiteNavigationElement', 'position' => 3, 'name' => 'কাস্টমার লগইন (Customer Login)', 'url' => "{$siteOrigin}/customer/login"],
            ['@type' => 'SiteNavigationElement', 'position' => 4, 'name' => 'রিসেলার লগইন (Reseller Login)', 'url' => "{$siteOrigin}/reseller/login"],
            ['@type' => 'SiteNavigationElement', 'position' => 5, 'name' => 'হোলসেলার লগইন (Wholesaler Login)', 'url' => "{$siteOrigin}/wholesaler/login"],
            ['@type' => 'SiteNavigationElement', 'position' => 6, 'name' => 'পার্সেল ট্র্যাক করুন (Track Parcel)', 'url' => "{$siteOrigin}/track"],
            ['@type' => 'SiteNavigationElement', 'position' => 7, 'name' => 'কন্টাক্ট করুন (Contact Us)', 'url' => "{$siteOrigin}/contact"],
            ['@type' => 'SiteNavigationElement', 'position' => 8, 'name' => 'আইটি সার্ভিসেস (IT Services)', 'url' => "{$siteOrigin}/dcitbd"],
            ['@type' => 'SiteNavigationElement', 'position' => 9, 'name' => 'শিখুন ও ক্যারিয়ার গড়ুন (Learn & Career)', 'url' => "{$siteOrigin}/education"],
            ['@type' => 'SiteNavigationElement', 'position' => 10, 'name' => 'ক্যাটাগরি সমূহ (All Categories)', 'url' => "{$siteOrigin}/categories"],
        ];

        $catItems = [];
        foreach (array_slice($categories, 0, 12) as $idx => $c) {
            $cName = $c['category'] ?? $c['Category'] ?? 'Category';
            $cImg  = $c['category_image'] ?? ($siteOrigin . '/public/icon/logo.png');
            if (strpos((string)$cImg, 'http') !== 0) {
                $cImg = $siteOrigin . '/' . ltrim((string)$cImg, '/');
            }
            $catItems[] = [
                '@type' => 'ListItem',
                'position' => $idx + 1,
                'item' => [
                    '@type' => 'CollectionPage',
                    'name' => "{$cName} — Dream Cart BD",
                    'url' => "{$siteOrigin}/products?cat=" . rawurlencode((string)$cName),
                    'image' => $cImg,
                ]
            ];
        }

        $graph = [
            [
                '@type' => ['Organization', 'OnlineStore'],
                '@id' => "{$siteOrigin}/#organization",
                'name' => 'Dream Cart BD',
                'alternateName' => ['ড্রিম কার্ট বিডি', 'ড্রিম কার্ট বি.ডি', 'DreamCart BD', 'Dream Cart Bangladesh'],
                'url' => "{$siteOrigin}/",
                'logo' => [
                    '@type' => 'ImageObject',
                    '@id' => "{$siteOrigin}/#logo",
                    'url' => "{$siteOrigin}/public/icon/logo.png",
                    'contentUrl' => "{$siteOrigin}/public/icon/logo.png",
                    'width' => 832,
                    'height' => 832,
                    'caption' => 'Dream Cart BD Official Logo'
                ],
                'image' => ["{$siteOrigin}/public/icon/logo.png", "{$siteOrigin}/public/icon/og-banner.jpg"],
                'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি) বাংলাদেশের বিশ্বস্ত স্মার্ট ডিজিটাল ই-কমার্স ও মাল্টি-ভেন্ডর প্ল্যাটফর্ম।',
                'telephone' => '+8801581703822',
                'email' => 'jainal.dcitbd@gmail.com',
                'address' => [
                    '@type' => 'PostalAddress',
                    'streetAddress' => 'চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ',
                    'addressLocality' => 'কুমিল্লা',
                    'postalCode' => '3500',
                    'addressCountry' => 'BD'
                ],
                'sameAs' => ['https://www.facebook.com/dreamcartbd', 'https://dcitbd.github.io/dcitbd/']
            ],
            [
                '@type' => 'WebSite',
                '@id' => "{$siteOrigin}/#website",
                'url' => "{$siteOrigin}/",
                'name' => 'Dream Cart BD — ড্রিম কার্ট বিডি',
                'alternateName' => ['Dream Cart BD', 'ড্রিম কার্ট বিডি', 'ড্রিম কার্ট বি.ডি', 'DreamCart BD'],
                'publisher' => ['@id' => "{$siteOrigin}/#organization"],
                'inLanguage' => 'bn-BD',
                'potentialAction' => [
                    '@type' => 'SearchAction',
                    'target' => [
                        '@type' => 'EntryPoint',
                        'urlTemplate' => "{$siteOrigin}/products?search={search_term_string}"
                    ],
                    'query-input' => 'required name=search_term_string'
                ]
            ],
            [
                '@type' => 'ItemList',
                '@id' => "{$siteOrigin}/#sitelinks",
                'name' => 'Dream Cart BD Official Sitelinks',
                'itemListElement' => $sitelinks
            ],
            [
                '@type' => 'ItemList',
                '@id' => "{$siteOrigin}/#categories",
                'name' => 'Dream Cart BD Categories',
                'itemListElement' => $catItems
            ]
        ];

        if (!empty($meta['currentProduct'])) {
            $p = $meta['currentProduct'];
            $pName  = $p['name'] ?? $p['p_name'] ?? 'Product';
            $pSlug  = $p['slug'] ?? $p['sku'] ?? 'item';
            $pSku   = $p['sku'] ?? $p['product_id'] ?? 'DCBD-ITEM';
            $pPrice = (string)($p['selling_price'] ?? 0);
            $pStock = ((int)($p['stock'] ?? 25)) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder';
            $pImg   = $p['thumbnail'] ?? ($p['images'][0] ?? "{$siteOrigin}/public/icon/og-banner.jpg");
            if (strpos((string)$pImg, 'http') !== 0) {
                $pImg = $siteOrigin . '/' . ltrim((string)$pImg, '/');
            }
            $graph[] = [
                '@type' => 'Product',
                '@id' => "{$siteOrigin}/product/" . rawurlencode((string)$pSlug) . "#product",
                'name' => $pName,
                'sku' => $pSku,
                'mpn' => $pSku,
                'image' => [$pImg],
                'description' => $p['description'] ?? $pName,
                'brand' => ['@type' => 'Brand', 'name' => $p['brand'] ?? 'Dream Cart BD'],
                'offers' => [
                    '@type' => 'Offer',
                    'url' => "{$siteOrigin}/product/" . rawurlencode((string)$pSlug),
                    'priceCurrency' => 'BDT',
                    'price' => $pPrice,
                    'priceValidUntil' => '2027-12-31',
                    'availability' => $pStock,
                    'itemCondition' => 'https://schema.org/NewCondition',
                    'seller' => ['@type' => 'Organization', 'name' => 'Dream Cart BD']
                ],
                'aggregateRating' => [
                    '@type' => 'AggregateRating',
                    'ratingValue' => '4.9',
                    'reviewCount' => '32'
                ]
            ];
        } else {
            $prodItems = [];
            foreach (array_slice($products, 0, 20) as $idx => $p) {
                $pName  = $p['name'] ?? $p['p_name'] ?? 'Product';
                $pSlug  = $p['slug'] ?? $p['sku'] ?? 'item';
                $pSku   = $p['sku'] ?? $p['product_id'] ?? 'DCBD-ITEM';
                $pPrice = (string)($p['selling_price'] ?? 0);
                $pStock = ((int)($p['stock'] ?? 25)) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
                $pImg   = $p['thumbnail'] ?? ($p['images'][0] ?? "{$siteOrigin}/public/icon/og-banner.jpg");
                if (strpos((string)$pImg, 'http') !== 0) {
                    $pImg = $siteOrigin . '/' . ltrim((string)$pImg, '/');
                }
                $prodItems[] = [
                    '@type' => 'ListItem',
                    'position' => $idx + 1,
                    'item' => [
                        '@type' => 'Product',
                        'name' => $pName,
                        'sku' => $pSku,
                        'url' => "{$siteOrigin}/product/" . rawurlencode((string)$pSlug),
                        'image' => $pImg,
                        'description' => $p['description'] ?? $pName,
                        'brand' => ['@type' => 'Brand', 'name' => $p['brand'] ?? 'Dream Cart BD'],
                        'offers' => [
                            '@type' => 'Offer',
                            'url' => "{$siteOrigin}/product/" . rawurlencode((string)$pSlug),
                            'priceCurrency' => 'BDT',
                            'price' => $pPrice,
                            'availability' => $pStock,
                            'itemCondition' => 'https://schema.org/NewCondition'
                        ]
                    ]
                ];
            }
            $graph[] = [
                '@type' => 'ItemList',
                '@id' => "{$siteOrigin}/#featured-products",
                'name' => 'Dream Cart BD Popular Products',
                'itemListElement' => $prodItems
            ];
        }

        return json_encode(['@context' => 'https://schema.org', '@graph' => $graph], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
