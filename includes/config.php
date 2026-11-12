<?php
/**
 * DREAM CART BD — MASTER PHP CONFIGURATION & CONSTANTS (includes/config.php)
 * Ultra-High-Speed PHP + Python Hybrid Engine (1000x Speed Acceleration)
 * Preserves 100% of existing Google Sheets, Apps Script, UI, Design, Sections & Work Procedure.
 */

if (!defined('DCBD_INIT')) {
    define('DCBD_INIT', true);
}

// Timezone: Asia/Dhaka (Bangladesh Standard Time)
date_default_timezone_set('Asia/Dhaka');

// Root paths
define('DCBD_ROOT', dirname(__DIR__));
define('DCBD_INCLUDES_DIR', DCBD_ROOT . '/includes');
define('DCBD_STORAGE_DIR', DCBD_ROOT . '/storage');
define('DCBD_CACHE_DIR', DCBD_STORAGE_DIR . '/cache');
define('DCBD_LOGS_DIR', DCBD_STORAGE_DIR . '/logs');
define('DCBD_SQLITE_PATH', DCBD_STORAGE_DIR . '/dreamcartbd.sqlite');

// Ensure storage directories exist
foreach ([DCBD_STORAGE_DIR, DCBD_CACHE_DIR, DCBD_LOGS_DIR] as $_dir) {
    if (!is_dir($_dir)) {
        @mkdir($_dir, 0775, true);
    }
}

// Connected Live Google Spreadsheet & Apps Script Gateway (100% Identical to Existing System)
define('DCBD_SPREADSHEET_ID', '1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8');
define('DCBD_APPS_SCRIPT_URL', 'https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec');
define('DCBD_SITE_ORIGIN', 'https://dreamcartbd.com');
define('DCBD_VERSION', '4.0.0-PHP-PY-TURBO');

// Cache TTL Settings (in seconds) for 0.5ms Local Read + Non-blocking Background Sync
define('DCBD_CACHE_TTL_PRODUCTS', 60);      // 60s fresh local read, instant mutation invalidation
define('DCBD_CACHE_TTL_CATEGORIES', 120);
define('DCBD_CACHE_TTL_BRANDS', 120);
define('DCBD_CACHE_TTL_BANNERS', 120);
define('DCBD_CACHE_TTL_SETTINGS', 120);
define('DCBD_CACHE_TTL_DEFAULT', 60);

// Exact 20+ Google Sheet Names Mapping
$GLOBALS['DCBD_SHEET_MAP'] = [
    'products'          => 'Products',
    'categories'        => 'Categories',
    'brands'            => 'Brands',
    'orders'            => 'Orders',
    'incomplete_orders' => 'Incomplete_Orders',
    'viewers'           => 'Viewers',
    'customers'         => 'Customers',
    'resellers'         => 'Resellers',
    'wholesalers'       => 'Wholesalers',
    'buying'            => 'Buying',
    'costs'             => 'Costs',
    'invest'            => 'Invest',
    'markets'           => 'Others_Market',
    'others_market'     => 'Others_Market',
    'admin_worker'      => 'Admin/Worker',
    'admins'            => 'Admin/Worker',
    'workers'           => 'Admin/Worker',
    'settings'          => 'Settings',
    'banners'           => 'Banners',
    'reviews'           => 'Reviews',
    'payments'          => 'Payments',
    'landing_pages'     => 'Landing-Pages',
    'worker_logs'       => 'Worker-Logs',
    'attributes'        => 'Attributes',
    'variants'          => 'Attributes',
    'sellers'           => 'Sellers',
    'payment_method'    => 'Payment_Method',
    'delivery_area'     => 'Delivery_Area',
    'offer_or_coupon'   => 'Offer_or_Coupon',
];

// Default Shop & Marketing Pixel Settings
$GLOBALS['DCBD_DEFAULT_SETTINGS'] = [
    'shopName'              => 'Dream Cart BD',
    'shop_name'             => 'Dream Cart BD',
    'tagline'               => 'Smart Digital Commerce',
    'shopTagline'           => 'Smart Digital Commerce',
    'shopLogo'              => '/public/icon/logo.png',
    'shop_logo'             => '/public/icon/logo.png',
    'ogBanner'              => '/public/icon/og-banner.jpg',
    'address'               => 'চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।',
    'hotline1'              => '01581703822',
    'hotline2'              => '01818273838',
    'email'                 => 'jainal.dcitbd@gmail.com',
    'officeHours'           => 'প্রতিদিন সকাল ৮:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত',
    'facebookUrl'           => 'https://www.facebook.com/dreamcartbd',
    'notice'                => '৳২,০০০ বা তার বেশি অর্ডারে ফ্রি শিপিং! | অনলাইনে পেমেন্ট করলে ৫% ছাড় | পণ্য হাতে পেয়ে মূল্য পরিশোধ',
    'noticeActive'          => true,
    'freeDeliveryThreshold' => 2000,
    'freeShippingMin'       => 2000,
    'onlineDiscountPct'     => 5,
    // Marketing & Ad Pixels (Facebook, Instagram, YouTube, Google Ads, GA4, GTM, TikTok)
    'fbPixelId'             => '',
    'fbCapiToken'           => '',
    'fbTestEventCode'       => '',
    'gtagId'                => '',
    'googleAdsId'           => '',
    'googleConversionLabel' => '',
    'gtmId'                 => '',
    'ytTrackingId'          => '',
    'tiktokPixelId'         => '',
    'enableServerCapi'      => true,
    'enableEnhancedConv'    => true,
];

// Initial Fallback Products (Matches src/api/client.js 100%)
$GLOBALS['DCBD_INITIAL_PRODUCTS'] = [
    [
        'sku' => 'DCBD-WT-01',
        'product_id' => 'DCBD-WT-01',
        'name' => 'Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & Dual GPS',
        'p_name' => 'Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & Dual GPS',
        'category' => 'Smartwatches',
        'sub_category' => 'AMOLED Watch',
        'child_category' => 'Fitness & GPS',
        'brand' => 'Amazfit',
        'buying_price' => 6800,
        'selling_price' => 8490,
        'original_price' => 11462,
        'wholesale_price' => 7200,
        'reseller_price' => 7640,
        'min_order_qty' => 5,
        'min_order_q' => 5,
        'stock' => 28,
        'images' => ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'],
        'thumbnail' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
        'slug' => 'amazfit-gts-4-smartwatch',
        'description' => 'The Amazfit GTS 4 features a 1.75" AMOLED display, dual-band GPS, 150+ sports modes, Bluetooth calling.',
        'specification' => 'Display: 1.75" AMOLED | Battery: 300 mAh | Water Resistance: 5 ATM.',
        'others' => '1 Year Official Warranty, Fast Dispatch from Cumilla Hub.',
        'color' => 'Jet Black, Space Silver, Rose Gold',
        'size' => 'Standard, 42mm, 44mm',
        'weight_kg' => 0.25,
        'width_cm' => 10,
        'length_cm' => 12,
        'height_cm' => 6,
        'status' => 'সক্রিয়',
        'is_active' => true
    ],
    [
        'sku' => 'DCBD-GS-02',
        'product_id' => 'DCBD-GS-02',
        'name' => 'অটো গ্যাস সেফটি ডিভাইস ও লিকেজ প্রোটেক্টর (Heavy Duty)',
        'p_name' => 'অটো গ্যাস সেফটি ডিভাইস ও লিকেজ প্রোটেক্টর (Heavy Duty)',
        'category' => 'Kitchen',
        'sub_category' => 'Safety Device',
        'child_category' => 'Appliances',
        'brand' => 'HK',
        'buying_price' => 1500,
        'selling_price' => 2450,
        'original_price' => 3504,
        'wholesale_price' => 1850,
        'reseller_price' => 2150,
        'min_order_qty' => 5,
        'min_order_q' => 5,
        'stock' => 35,
        'images' => ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'],
        'thumbnail' => 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
        'slug' => 'auto-gas-safety-device-heavy-duty',
        'description' => 'সিলিন্ডার ও লাইনের গ্যাস লিকেজ স্বয়ংক্রিয়ভাবে বন্ধ করে রান্নাঘরকে রাখে ১০০% নিরাপদ।',
        'specification' => 'Material: Brass & Alloy | Gauge: Live Pressure Meter | Warranty: 2 Years',
        'others' => 'সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা।',
        'color' => 'Red/Black, Silver, Gold',
        'size' => '22mm Standard, 20mm',
        'weight_kg' => 0.45,
        'width_cm' => 10,
        'length_cm' => 12,
        'height_cm' => 8,
        'status' => 'সক্রিয়',
        'is_active' => true
    ],
    [
        'sku' => 'DCBD-HN-03',
        'product_id' => 'DCBD-HN-03',
        'name' => 'সুন্দরবনের প্রাকৃতিক খাঁটি চাকের মধু (১ কেজি জার)',
        'p_name' => 'সুন্দরবনের প্রাকৃতিক খাঁটি চাকের মধু (১ কেজি জার)',
        'category' => 'Organic & Health',
        'sub_category' => 'Honey',
        'child_category' => 'Pure Natural',
        'brand' => 'Dream Organic',
        'buying_price' => 800,
        'selling_price' => 1250,
        'original_price' => 1813,
        'wholesale_price' => 950,
        'reseller_price' => 1100,
        'min_order_qty' => 5,
        'min_order_q' => 5,
        'stock' => 42,
        'images' => ['https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&auto=format&fit=crop&q=80'],
        'thumbnail' => 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&auto=format&fit=crop&q=80',
        'slug' => 'sundarban-natural-raw-honey-1kg',
        'description' => 'সরাসরি বাওয়ালিদের মাধ্যমে সংগৃহীত ১০০% ভেজালমুক্ত সুন্দরবনের খলিশা ফুলের প্রাকৃতিক চাকের মধু।',
        'specification' => 'ওজন: ১ কেজি | গ্রেড: অর্গানিক র-হানি',
        'others' => 'ল্যাব টেস্টেড বিশুদ্ধতা গ্যারান্টি।',
        'color' => 'Pure Amber, Golden',
        'size' => '১ কেজি, ৫০০ গ্রাম',
        'weight_kg' => 1.0,
        'width_cm' => 12,
        'length_cm' => 12,
        'height_cm' => 18,
        'status' => 'সক্রিয়',
        'is_active' => true
    ],
    [
        'sku' => 'DCBD-FL-04',
        'product_id' => 'DCBD-FL-04',
        'name' => 'মিলিটারি রিচার্জেবল জুম ফ্ল্যাশলাইট ৩০০০ লুমেন',
        'p_name' => 'মিলিটারি রিচার্জেবল জুম ফ্ল্যাশলাইট ৩০০০ লুমেন',
        'category' => 'Home Appliances',
        'sub_category' => 'Lighting',
        'child_category' => 'Rechargeable',
        'brand' => 'HK',
        'buying_price' => 900,
        'selling_price' => 1450,
        'original_price' => 2103,
        'wholesale_price' => 1100,
        'reseller_price' => 1280,
        'min_order_qty' => 5,
        'min_order_q' => 5,
        'stock' => 25,
        'images' => ['https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80'],
        'thumbnail' => 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
        'slug' => 'military-rechargeable-flashlight-3000lm',
        'description' => 'অ্যালুমিনিয়াম অ্যালয় বডি, লং-রেঞ্জ জুম বিম এবং টাইপ-সি ফাস্ট চার্জিং সুবিধাযুক্ত ট্যাকটিক্যাল টর্চ।',
        'specification' => 'Brightness: 3000 Lumens | Battery: 5000mAh Lithium',
        'others' => 'ওয়াটারপ্রুফ ও শকপ্রুফ ডিজাইন।',
        'color' => 'Matte Black, Army Green',
        'size' => 'Standard, Large',
        'weight_kg' => 0.35,
        'width_cm' => 8,
        'length_cm' => 18,
        'height_cm' => 6,
        'status' => 'সক্রিয়',
        'is_active' => true
    ],
    [
        'sku' => 'DCBD-CH-05',
        'product_id' => 'DCBD-CH-05',
        'name' => 'প্রিমিয়াম অর্গানিক চিয়া সিড (৫০০ গ্রাম এয়ারটাইট জার)',
        'p_name' => 'প্রিমিয়াম অর্গানিক চিয়া সিড (৫০০ গ্রাম এয়ারটাইট জার)',
        'category' => 'Organic & Health',
        'sub_category' => 'Seeds',
        'child_category' => 'Pure Natural',
        'brand' => 'Dream Organic',
        'buying_price' => 400,
        'selling_price' => 650,
        'original_price' => 956,
        'wholesale_price' => 480,
        'reseller_price' => 560,
        'min_order_qty' => 5,
        'min_order_q' => 5,
        'stock' => 45,
        'images' => ['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'],
        'thumbnail' => 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
        'slug' => 'premium-organic-chia-seed-500g',
        'description' => 'ওমেগা-৩, ফাইবার ও অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ বাছাইকৃত প্রিমিয়াম চিয়া সিড।',
        'specification' => 'ওজন: ৫০০ গ্রাম | প্যাকেজিং: ফুড গ্রেড জার',
        'others' => 'ডায়েট ও ওজন নিয়ন্ত্রণে অত্যন্ত কার্যকর।',
        'color' => 'Natural Black/White',
        'size' => '৫০০ গ্রাম, ১ কেজি',
        'weight_kg' => 0.5,
        'width_cm' => 10,
        'length_cm' => 10,
        'height_cm' => 14,
        'status' => 'সক্রিয়',
        'is_active' => true
    ]
];

$GLOBALS['DCBD_INITIAL_CATEGORIES'] = [
    ['catagory_id' => 'CAT-001', 'catagory_slug' => 'smartwatches', 'category_image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80', 'category' => 'Smartwatches', 'sub_category' => 'Calling Watch, AMOLED Watch', 'chail_category' => 'Men, Women, Fitness & GPS'],
    ['catagory_id' => 'CAT-002', 'catagory_slug' => 'kitchen', 'category_image' => 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80', 'category' => 'Kitchen', 'sub_category' => 'Safety Device, Blender, Cookware', 'chail_category' => 'Appliances, Standard'],
    ['catagory_id' => 'CAT-003', 'catagory_slug' => 'organic-health', 'category_image' => 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400&q=80', 'category' => 'Organic & Health', 'sub_category' => 'Honey, Seeds, Oils', 'chail_category' => 'Pure Natural, Premium Grade'],
    ['catagory_id' => 'CAT-004', 'catagory_slug' => 'home-appliances', 'category_image' => 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80', 'category' => 'Home Appliances', 'sub_category' => 'Lighting, Gadgets', 'chail_category' => 'Rechargeable, Smart Home']
];

$GLOBALS['DCBD_INITIAL_BRANDS'] = [
    ['brand_id' => 'BRD-001', 'brand_name' => 'Amazfit', 'brand_slug' => 'amazfit', 'brand_image' => '/public/icon/logo.png', 'brand_description' => 'Global smart wearable innovator'],
    ['brand_id' => 'BRD-002', 'brand_name' => 'Dream Organic', 'brand_slug' => 'dream-organic', 'brand_image' => '/public/icon/logo.png', 'brand_description' => '১০০% বিশুদ্ধ অর্গানিক ও প্রাকৃতিক পণ্য'],
    ['brand_id' => 'BRD-003', 'brand_name' => 'HK', 'brand_slug' => 'hk', 'brand_image' => '/public/icon/logo.png', 'brand_description' => 'প্রিমিয়াম স্মার্ট গ্যাজেট ও অ্যাপ্লায়েন্স পার্টনার'],
    ['brand_id' => 'BRD-004', 'brand_name' => 'Kieslect', 'brand_slug' => 'kieslect', 'brand_image' => '/public/icon/logo.png', 'brand_description' => 'Premium calling smartwatch maker']
];

$GLOBALS['DCBD_INITIAL_BANNERS'] = [
    ['banner_id' => 'BAN-01', 'id' => 'BAN-01', 'title' => 'স্মার্ট কিচেন ও নিরাপদ কুকিং গ্যাজেট কালেকশন', 'subtitle' => 'সর্বোচ্চ ৩০% বিশেষ ছাড় চলছে!', 'image_url' => 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80', 'link_url' => '/products?cat=Kitchen', 'tag' => '🔥 কিচেন স্পেশাল', 'cta_text' => 'এখনই কিনুন →', 'button_text' => 'কিচেন আইটেম দেখুন', 'position' => 1, 'status' => 'Active'],
    ['banner_id' => 'BAN-02', 'id' => 'BAN-02', 'title' => '১০০% খাঁটি অর্গানিক ফুড ও ন্যাচারাল হেলথ সাপ্লিমেন্ট', 'subtitle' => 'সুন্দরবনের প্রাকৃতিক চাকের মধু ও চিয়া সিড', 'image_url' => 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=1600&auto=format&fit=crop&q=80', 'link_url' => '/products?cat=Organic%20%26%20Health', 'tag' => '🌿 অর্গানিক ও ন্যাচারাল', 'cta_text' => 'অর্ডার করুন →', 'button_text' => 'অর্গানিক ফুড দেখুন', 'position' => 2, 'status' => 'Active']
];
