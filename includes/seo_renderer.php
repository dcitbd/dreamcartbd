<?php
/**
 * DREAM CART BD — SERVER-SIDE SEO, OPENGRAPH, PRODUCT MICRODATA & JSON-LD ENGINE (includes/seo_renderer.php)
 * Ensures 100% Instant Server-Side Rendering (SSR) of Meta Tags, OpenGraph Cards, Product Catalog Tags,
 * and Schema.org Structured Data with Top-4 Priority Sitelinks:
 *   1. প্রোডাক্ট’স পেজ (/products)
 *   2. কন্টাক্ট পেজ (/contact)
 *   3. ট্রেকিং পেজ (/track)
 *   4. হোম পেজ (/)
 * Supports lowercase ("dream cart bd", "dreamcartbd"), uppercase ("DREAM CART BD", "Dream Cart BD"),
 * and Bengali ("ড্রিম কার্ট বিডি", "ড্রিমকার্ট বিডি", "প্রোডাক্ট’স পেজ", "কন্টাক্ট পেজ", "ট্রেকিং পেজ", "হোম পেজ") queries.
 */

require_once __DIR__ . '/cache_engine.php';

class DcbdSeoRenderer
{
    /**
     * Dream Cart BD Brand Aliases
     */
    public static function getBrandAliases(): array
    {
        return [
            // English Brand Names
            'Dream Cart BD',
            'Dream Cart Bangladesh',
            'Dream Cart',
            'DreamCart BD',
            'DreamCart Bangladesh',
            'DreamCart',
            'Dream Cart Online Shop',
            'Dream Cart Online Shopping',
            'Dream Cart Store',
            'Dream Cart Shop',
            'Dream Cart Official',
            'Dream Cart BD Official',
            'Dream Cart E-commerce',
            'Dream Cart E-commerce Bangladesh',
            'Dream Cart Online Store',
            'Dream Cart BD Shop',
            'Dream Cart BD Online',
            'Dream Cart BD Website',

            // Lowercase Variations
            'dream cart bd',
            'dream cart bangladesh',
            'dream cart',
            'dreamcart bd',
            'dreamcart bangladesh',
            'dreamcart',
            'dreamcartbd',
            'dreamcartbd.com',
            'dreamcartbd.com.bd',
            'dreamcartbd online',
            'dreamcartbd shop',
            'dreamcartbd store',
            'dreamcartbd official',
            'dreamcart bd online shop',

            // Uppercase Variations
            'DREAM CART BD',
            'DREAM CART BANGLADESH',
            'DREAM CART',
            'DREAMCARTBD',
            'DREAMCART',
            'DREAMCART BD',

            // Short Brand Names
            'DCBD',
            'DCBD Shop',
            'DCBD Store',
            'DCBD Online Shop',
            'DCBD Bangladesh',
            'DCBD Official',
            'DCBD Online',

            // Bangla Brand Names
            'ড্রিম কার্ট বিডি',
            'ড্রিম কার্ট বি.ডি',
            'ড্রিমকার্ট বিডি',
            'ড্রিমকার্ট বি.ডি',
            'ড্রিম কার্ট বাংলাদেশ',
            'ড্রিমকার্ট বাংলাদেশ',
            'ড্রিম কার্ট',
            'ড্রিমকার্ট',
            'ড্রিম কার্ট অনলাইন শপ',
            'ড্রিম কার্ট অনলাইন স্টোর',
            'ড্রিম কার্ট বিডি শপ',
            'ড্রিম কার্ট বিডি অনলাইন',
            'ড্রিম কার্ট অফিসিয়াল',
            'ড্রিম কার্ট বিডি অফিসিয়াল',
            'ডিসিবিডি',
            'ডিসি বিডি',
            'ড্রিম কার্ট ওয়েবসাইট',
            'ড্রিম কার্ট অনলাইন কেনাকাটা',

            // Mixed Variations
            'Dream Cart ড্রিম কার্ট',
            'Dream Cart BD ড্রিম কার্ট বিডি',
            'DCBD ড্রিম কার্ট',
            'DreamCart বাংলাদেশ',
            'ড্রিম কার্ট Dream Cart BD',
        ];
    }

    /**
     * General Website SEO Keywords - English
     */
    public static function getEnglishKeywords(): array
    {
        return [
            'online shopping Bangladesh',
            'online shopping in Bangladesh',
            'best online shopping site Bangladesh',
            'online shopping website Bangladesh',
            'trusted online shop Bangladesh',
            'reliable online shopping Bangladesh',
            'ecommerce website Bangladesh',
            'ecommerce store Bangladesh',
            'online marketplace Bangladesh',
            'online store Bangladesh',
            'shopping website BD',
            'online shop BD',
            'best online shop BD',
            'buy online Bangladesh',
            'buy products online Bangladesh',
            'shop online Bangladesh',
            'online product shopping',
            'affordable online shopping',
            'budget friendly shopping',
            'low price online shopping',
            'best price products Bangladesh',
            'quality products online',
            'daily essentials online',
            'home delivery Bangladesh',
            'cash on delivery Bangladesh',
            'COD shopping Bangladesh',
            'nationwide delivery Bangladesh',
            'online shopping with home delivery',
            'electronics online Bangladesh',
            'home appliances Bangladesh',
            'kitchen products online',
            'kitchen accessories Bangladesh',
            'home decor online Bangladesh',
            'beauty products online Bangladesh',
            'health and beauty products',
            'fashion products online Bangladesh',
            'baby products online Bangladesh',
            'mother and baby products',
            'mobile accessories online Bangladesh',
            'computer accessories Bangladesh',
            'office equipment online',
            'travel accessories Bangladesh',
            'outdoor products online',
            'cleaning products Bangladesh',
            'household products online',
            'smart gadgets Bangladesh',
            'gift items online Bangladesh',
            'personal care products online',
            'lifestyle products Bangladesh',
            'wholesale products Bangladesh',
            'reseller products Bangladesh',
            'online wholesale shopping',
            'Dream Cart BD products',
            'Dream Cart BD online shop',
            'Dream Cart BD Bangladesh',
            'Dream Cart BD official website',
            'Dream Cart BD online shopping',
            'Dream Cart BD product collection',
            'Dream Cart BD home delivery',
            'Dream Cart BD best price',
            'Dream Cart BD trusted shop',
            'DCBD online shopping',
        ];
    }

    /**
     * General Website SEO Keywords - Bangla
     */
    public static function getBanglaKeywords(): array
    {
        return [
            'অনলাইন শপিং বাংলাদেশ',
            'বাংলাদেশের অনলাইন শপ',
            'বাংলাদেশ অনলাইন শপিং',
            'অনলাইন কেনাকাটা',
            'অনলাইনে কেনাকাটা',
            'বিশ্বস্ত অনলাইন শপ',
            'বিশ্বস্ত অনলাইন শপ বাংলাদেশ',
            'সেরা অনলাইন শপ',
            'বাংলাদেশের সেরা অনলাইন শপ',
            'অনলাইন কেনাকাটার ওয়েবসাইট',
            'অনলাইন পণ্য কেনাকাটা',
            'অনলাইনে পণ্য কিনুন',
            'অনলাইনে কেনাকাটার সাইট',
            'কম দামে অনলাইন শপিং',
            'সাশ্রয়ী মূল্যে কেনাকাটা',
            'সুলভ মূল্যে পণ্য',
            'কম দামে ভালো পণ্য',
            'মানসম্মত পণ্য',
            'সেরা দামে পণ্য',
            'ঘরে বসে কেনাকাটা',
            'ঘরে বসে অনলাইন শপিং',
            'হোম ডেলিভারি বাংলাদেশ',
            'সারা বাংলাদেশে হোম ডেলিভারি',
            'ক্যাশ অন ডেলিভারি',
            'ক্যাশ অন ডেলিভারি বাংলাদেশ',
            'অনলাইন মার্কেটপ্লেস',
            'অনলাইন পণ্য বিক্রয়',
            'অনলাইন কেনাবেচা',
            'ই-কমার্স বাংলাদেশ',
            'ই-কমার্স ওয়েবসাইট',
            'ইলেকট্রনিক পণ্য',
            'ইলেকট্রনিক্স অনলাইন শপ',
            'হোম অ্যাপ্লায়েন্স',
            'ঘরের প্রয়োজনীয় পণ্য',
            'রান্নাঘরের প্রয়োজনীয় পণ্য',
            'কিচেন এক্সেসরিজ',
            'কিচেন ও হোম ডেকোর',
            'ঘর সাজানোর পণ্য',
            'হোম ডেকোর পণ্য',
            'বিউটি ও পার্সোনাল কেয়ার',
            'স্বাস্থ্য ও সৌন্দর্য পণ্য',
            'রূপচর্চার সামগ্রী',
            'ফ্যাশন ও লাইফস্টাইল পণ্য',
            'মা ও শিশুর পণ্য',
            'বেবি কেয়ার পণ্য',
            'মোবাইল এক্সেসরিজ',
            'কম্পিউটার এক্সেসরিজ',
            'অফিস সরঞ্জাম',
            'ট্রাভেল এক্সেসরিজ',
            'ভ্রমণের প্রয়োজনীয় পণ্য',
            'আউটডোর ও ট্যুর পণ্য',
            'পরিষ্কার পরিচ্ছন্নতার পণ্য',
            'ঘর পরিষ্কারের সামগ্রী',
            'স্মার্ট গ্যাজেট',
            'গ্যাজেট ও এক্সেসরিজ',
            'উপহার সামগ্রী',
            'ব্যক্তিগত যত্নের পণ্য',
            'দৈনন্দিন প্রয়োজনীয় পণ্য',
            'পাইকারি পণ্য',
            'পাইকারি অনলাইন শপ',
            'রিসেলার পণ্য',
            'অনলাইন রিসেলার ব্যবসা',
            'ড্রিম কার্ট বিডি',
            'ড্রিম কার্ট বাংলাদেশ',
            'ড্রিম কার্ট অনলাইন শপ',
            'ড্রিম কার্ট বিডি ওয়েবসাইট',
            'ড্রিম কার্ট বিডি পণ্য',
            'ড্রিম কার্ট বিডি অনলাইন কেনাকাটা',
            'ড্রিম কার্ট বিডি হোম ডেলিভারি',
            'ড্রিম কার্ট বিডি সেরা পণ্য',
            'ড্রিম কার্ট বিডি বিশ্বস্ত অনলাইন শপ',
            'ডিসিবিডি অনলাইন শপ',
        ];
    }

    /**
     * Product Category SEO Synonyms
     */
    public static function getCategoryKeywords(): array
    {
        return [
            'Kitchen & Dining' => [
                'kitchen accessories',
                'kitchen tools',
                'cooking accessories',
                'kitchen gadgets',
                'রান্নাঘরের সামগ্রী',
                'রান্নার সরঞ্জাম',
                'কিচেন এক্সেসরিজ',
                'কিচেন গ্যাজেট',
            ],

            'Home Appliances' => [
                'home appliances',
                'household appliances',
                'home electronics',
                'ঘরোয়া ইলেকট্রনিক্স',
                'গৃহস্থালি যন্ত্রপাতি',
                'বাসার প্রয়োজনীয় যন্ত্রপাতি',
            ],

            'Health & Beauty' => [
                'beauty accessories',
                'skincare products',
                'personal care',
                'beauty tools',
                'স্বাস্থ্য ও সৌন্দর্য',
                'রূপচর্চার সামগ্রী',
                'ত্বকের যত্ন',
                'ব্যক্তিগত যত্ন',
            ],

            'Mother & Baby' => [
                'baby care products',
                'mother care products',
                'baby accessories',
                'newborn essentials',
                'শিশুর যত্ন',
                'মা ও শিশুর পণ্য',
                'বেবি কেয়ার',
                'শিশুর প্রয়োজনীয় সামগ্রী',
            ],

            'Mobile Accessories' => [
                'mobile accessories',
                'smartphone accessories',
                'phone gadgets',
                'মোবাইল এক্সেসরিজ',
                'মোবাইল সামগ্রী',
                'স্মার্টফোনের আনুষঙ্গিক পণ্য',
            ],

            'Office Equipment' => [
                'office supplies',
                'office accessories',
                'stationery products',
                'অফিস সরঞ্জাম',
                'অফিস সামগ্রী',
                'স্টেশনারি পণ্য',
            ],

            'Outdoor & Tour' => [
                'travel accessories',
                'outdoor equipment',
                'camping accessories',
                'tour accessories',
                'ভ্রমণের সামগ্রী',
                'ট্রাভেল এক্সেসরিজ',
                'ক্যাম্পিং সরঞ্জাম',
            ],

            'Men Care & Fashion' => [
                'mens fashion',
                'mens grooming',
                'mens accessories',
                'men personal care',
                'পুরুষদের ফ্যাশন',
                'ছেলেদের ফ্যাশন',
                'পুরুষদের গ্রুমিং',
                'পুরুষদের ব্যবহার্য সামগ্রী',
            ],

            'Toys & Games' => [
                'kids toys',
                'educational toys',
                'children games',
                'শিশুদের খেলনা',
                'বাচ্চাদের খেলনা',
                'শিক্ষামূলক খেলনা',
                'শিশুদের খেলার সামগ্রী',
            ],

            'Furniture & Decor' => [
                'home decor',
                'home decoration',
                'decorative accessories',
                'ঘর সাজানোর পণ্য',
                'ঘর সাজানোর সামগ্রী',
                'হোম ডেকোর',
                'ডেকোরেশন আইটেম',
            ],

            'Laundry & Cleaning' => [
                'cleaning supplies',
                'laundry accessories',
                'house cleaning products',
                'পরিষ্কার পরিচ্ছন্নতার সামগ্রী',
                'কাপড় পরিষ্কারের পণ্য',
                'ঘর পরিষ্কারের সামগ্রী',
            ],

            'Computers & Laptops' => [
                'computer accessories',
                'laptop accessories',
                'PC accessories',
                'কম্পিউটার এক্সেসরিজ',
                'ল্যাপটপ এক্সেসরিজ',
                'কম্পিউটার সামগ্রী',
            ],
        ];
    }

    /**
     * Website Search Synonyms
     */
    public static function getSearchSynonyms(): array
    {
        return [
            'buy' => ['purchase', 'order', 'কিনুন', 'অর্ডার করুন', 'ক্রয় করুন'],
            'shop' => ['store', 'online shop', 'দোকান', 'শপ'],
            'price' => ['cost', 'rate', 'দাম', 'মূল্য', 'দর'],
            'cheap' => ['affordable', 'low price', 'কম দাম', 'সাশ্রয়ী'],
            'delivery' => ['home delivery', 'shipping', 'হোম ডেলিভারি', 'ডেলিভারি'],
            'product' => ['item', 'goods', 'পণ্য', 'সামগ্রী'],
            'kitchen' => ['cooking', 'রান্নাঘর', 'কিচেন'],
            'beauty' => ['skincare', 'personal care', 'রূপচর্চা', 'সৌন্দর্য'],
            'baby' => ['infant', 'child', 'শিশু', 'বাচ্চা'],
            'mobile' => ['phone', 'smartphone', 'মোবাইল', 'ফোন'],
            'cleaning' => ['washing', 'housekeeping', 'পরিষ্কার', 'পরিচ্ছন্নতা'],
            'travel' => ['tour', 'camping', 'ভ্রমণ', 'ট্যুর'],
            'fashion' => ['clothing', 'style', 'ফ্যাশন', 'পোশাক'],
            'wholesale' => ['bulk', 'পাইকারি', 'বাল্ক'],
            'reseller' => ['retailer', 'পুনর্বিক্রেতা', 'রিসেলার'],
        ];
    }

    /**
     * All Website SEO Keywords
     */
    public static function getAllSeoKeywords(): array
    {
        return array_values(array_unique(array_merge(
            self::getBrandAliases(),
            self::getEnglishKeywords(),
            self::getBanglaKeywords()
        )));
    }
}


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
                'title' => 'Dream Cart BD (ড্রিম কার্ট বিডি) — প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ ও হোম পেজ | dreamcartbd',
                'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি / dreamcartbd / dream cart bd) বাংলাদেশের বিশ্বস্ত স্মার্ট ই-কমার্স ও মাল্টি-ভেন্ডর প্ল্যাটফর্ম। প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ ও হোম পেজ থেকে স্মার্টওয়াচ, অর্গানিক ফুড, কিচেন গ্যাজেট ও হোম অ্যাপ্লায়েন্স সারা দেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
                'keywords' => 'dream cart bd, DREAM CART BD, Dream Cart BD, dreamcartbd, dreamcart bd, ড্রিম কার্ট বিডি, ড্রিমকার্ট বিডি, ড্রিম কার্ট বি.ডি, ড্রিম কার্ট, প্রোডাক্ট’স পেজ, প্রোডাক্টস পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ, ট্র্যাকিং পেজ, হোম পেজ, products page, contact page, tracking page, home page, online shopping bangladesh, smartwatch bd, organic honey bd, kitchen gas safety device, reseller bd, wholesale bd',
            ],
            '/products' => [
                'title' => 'প্রোডাক্ট’স পেজ (All Products) — Dream Cart BD | ড্রিম কার্ট বিডি (dreamcartbd)',
                'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd)-এর প্রোডাক্ট’স পেজ: সকল অরিজিনাল প্রোডাক্ট, স্মার্টওয়াচ, কিচেন সেফটি ডিভাইস, অর্গানিক হেলথ ফুড ও হোম অ্যাপ্লায়েন্স সাশ্রয়ী মূল্যে অর্ডার করুন।',
                'keywords' => 'প্রোডাক্ট’স পেজ, প্রোডাক্টস পেজ, প্রোডাক্ট পেজ, সকল পণ্য, products page, all products, dream cart bd products, dreamcartbd products, ড্রিম কার্ট বিডি প্রোডাক্ট, buy gadgets online bd',
            ],
            '/shop' => [
                'title' => 'প্রোডাক্ট’স ও শপ ক্যাটালগ (Shop) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd)-এর সম্পূর্ণ প্রোডাক্ট ক্যাটালগ, ফ্ল্যাশ সেল ও ক্যাশ অন ডেলিভারি কালেকশন।',
                'keywords' => 'Dream Cart BD Shop, dream cart bd shop, online shop bd, ড্রিম কার্ট বিডি শপ, প্রোডাক্ট’স পেজ',
            ],
            '/contact' => [
                'title' => 'কন্টাক্ট পেজ (Contact Us) — Dream Cart BD | ড্রিম কার্ট বিডি (dreamcartbd)',
                'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd) কন্টাক্ট পেজ ও কাস্টমার কেয়ার: চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০। হটলাইন: 01581703822, 01818273838।',
                'keywords' => 'কন্টাক্ট পেজ, কন্টাক্ট করুন, যোগাযোগ পেজ, contact page, contact us, dream cart bd contact, dreamcartbd contact, ড্রিম কার্ট বিডি ঠিকানা ও হটলাইন',
            ],
            '/track' => [
                'title' => 'ট্রেকিং পেজ (Track Order) — Dream Cart BD | ড্রিম কার্ট বিডি (dreamcartbd)',
                'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd) ট্রেকিং পেজ: আপনার অর্ডার আইডি বা মোবাইল নম্বর দিয়ে রিয়েল-টাইমে আপনার পার্সেল ও কুরিয়ার ডেলিভারি স্ট্যাটাস ট্র্যাক করুন।',
                'keywords' => 'ট্রেকিং পেজ, ট্র্যাকিং পেজ, পার্সেল ট্র্যাক করুন, অর্ডার ট্র্যাকিং, tracking page, track order, dream cart bd track, dreamcartbd tracking, ড্রিম কার্ট বিডি ট্র্যাকিং',
            ],
            '/tracking' => [
                'title' => 'ট্রেকিং পেজ (Live Tracking) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'অর্ডার আইডি বা মোবাইল নম্বর দিয়ে লাইভ অর্ডার স্ট্যাটাস ও ভাউচার দেখুন — Dream Cart BD।',
                'keywords' => 'ট্রেকিং পেজ, ট্র্যাকিং পেজ, Order Tracking Dream Cart BD, dream cart bd tracking',
            ],
            '/categories' => [
                'title' => 'সকল ক্যাটাগরি সমূহ (All Categories) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'ক্যাটাগরি ওয়াইজ সকল পণ্য দেখুন: Smartwatches, Kitchen, Organic & Health, Home Appliances, Medicine & Healthcare, Stationery — Dream Cart BD।',
                'keywords' => 'Dream Cart BD Categories, dream cart bd categories, ক্যাটাগরি সমূহ, ড্রিম কার্ট বিডি ক্যাটাগরি',
            ],
            '/brands' => [
                'title' => 'অফিসিয়াল ব্র্যান্ড সমূহ (Featured Brands) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Amazfit, Kieslect, Dream Organic, HK এবং শীর্ষস্থানীয় সকল অফিসিয়াল ব্র্যান্ডের ১০০% আসল পণ্য — Dream Cart BD।',
                'keywords' => 'Dream Cart BD Brands, dream cart bd brands, Amazfit BD, Kieslect BD, Dream Organic',
            ],
            '/offers' => [
                'title' => 'বিশেষ অফার ও ডিসকাউন্ট (Offers & Coupons) — Dream Cart BD | ড্রিম কার্ট বিডি',
                'description' => 'Dream Cart BD-এর মেগা ফ্ল্যাশ সেল, কুপন ডিসকাউন্ট, ফ্রি হোম ডেলিভারি ও ৫% অনলাইন পেমেন্ট ছাড় দেখুন।',
                'keywords' => 'Dream Cart BD Offers, dream cart bd offers, বিশেষ অফার, ডিসকাউন্ট কুপন',
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
        $title = $routeMap[$cleanPath]['title'] ?? ($isAdmin ? 'Admin Console (Dashboard) — Dream Cart BD' : $routeMap['/']['title']);
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
                $pName  = trim((string)($currentProduct['name'] ?? $currentProduct['p_name'] ?? 'Product'));
                $pPrice = (float)($currentProduct['selling_price'] ?? 0);
                $pBrand = trim((string)($currentProduct['brand'] ?? 'Dream Cart BD')) ?: 'Dream Cart BD';
                $pCat   = trim((string)($currentProduct['category'] ?? 'Smart Gadgets')) ?: 'Smart Gadgets';
                $pSku   = trim((string)($currentProduct['sku'] ?? $currentProduct['product_id'] ?? $productSlug));
                $pSlug  = trim((string)($currentProduct['slug'] ?? ''));
                if ($pSlug === '') {
                    $pSlug = $pSku !== '' ? $pSku : $productSlug;
                }

                $priceLabel = $pPrice > 0 ? (' — ৳' . number_format($pPrice, 0, '.', '')) : '';
                $title  = "{$pName}{$priceLabel} | Dream Cart BD";

                $rawDesc = trim(preg_replace('/\s+/u', ' ', strip_tags((string)($currentProduct['description'] ?? ''))));
                if ($rawDesc !== '') {
                    $description = mb_strlen($rawDesc, 'UTF-8') > 200
                        ? (mb_substr($rawDesc, 0, 197, 'UTF-8') . '...')
                        : $rawDesc;
                } else {
                    $priceText = $pPrice > 0 ? ('মাত্র ৳' . number_format($pPrice, 0, '.', '') . ' টাকায় ') : '';
                    $description = "{$pName} কিনুন {$priceText}Dream Cart BD থেকে। ব্র্যান্ড: {$pBrand} | ক্যাটাগরি: {$pCat} | সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি।";
                }

                $keywords = "{$pName}, " . mb_strtolower($pName, 'UTF-8') . ", {$pSku}, " . strtolower($pSku) . ", {$pBrand}, {$pCat}, dream cart bd, Dream Cart BD, ড্রিম কার্ট বিডি, প্রোডাক্ট’স পেজ";
                $canonicalUrl = $siteOrigin . '/product/' . rawurlencode($pSlug);

                // Resolve primary product image safely (supports thumbnail, array images, or comma/newline-separated string)
                $rawThumb = trim((string)($currentProduct['thumbnail'] ?? ($currentProduct['image'] ?? ($currentProduct['img'] ?? ''))));
                if ($rawThumb === '' && !empty($currentProduct['images'])) {
                    if (is_array($currentProduct['images'])) {
                        foreach ($currentProduct['images'] as $imgItem) {
                            $candidate = trim((string)$imgItem);
                            if ($candidate !== '') {
                                $rawThumb = $candidate;
                                break;
                            }
                        }
                    } elseif (is_string($currentProduct['images'])) {
                        $parts = preg_split('/[\r\n,]+/', $currentProduct['images']);
                        foreach ($parts as $imgItem) {
                            $candidate = trim((string)$imgItem);
                            if ($candidate !== '') {
                                $rawThumb = $candidate;
                                break;
                            }
                        }
                    }
                }
                if ($rawThumb === '') {
                    $rawThumb = $ogBanner;
                }
                if (stripos($rawThumb, 'http://') === 0) {
                    $rawThumb = 'https://' . substr($rawThumb, 7);
                } elseif (stripos($rawThumb, '//') === 0) {
                    $rawThumb = 'https:' . $rawThumb;
                } elseif (stripos($rawThumb, 'https://') !== 0) {
                    $rawThumb = $siteOrigin . '/' . ltrim($rawThumb, '/');
                }
                $ogImage = $rawThumb;
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
            $title = "{$catName} ক্যাটাগরির সকল পণ্য — প্রোডাক্ট’স পেজ | Dream Cart BD (ড্রিম কার্ট বিডি)";
            $description = "Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd)-তে {$catName} ক্যাটাগরির সকল অরিজিনাল পণ্য, অফার ও পাইকারি/খুচরা মূল্য তালিকা দেখুন।";
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

        // Detect image MIME type dynamically from URL extension
        $imgPath = strtolower((string)(parse_url($meta['ogImage'], PHP_URL_PATH) ?? ''));
        $imgType = 'image/jpeg';
        if (preg_match('/\.png$/', $imgPath)) {
            $imgType = 'image/png';
        } elseif (preg_match('/\.webp$/', $imgPath)) {
            $imgType = 'image/webp';
        } elseif (preg_match('/\.gif$/', $imgPath)) {
            $imgType = 'image/gif';
        } elseif (preg_match('/\.avif$/', $imgPath)) {
            $imgType = 'image/avif';
        }
        $extraLogoOg = ($meta['ogType'] === 'product') ? '' : ("\n  <meta property=\"og:image\" content=\"{$logo}\" />");

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
  <meta name="application-name" content="Dream Cart BD (ড্রিম কার্ট বিডি)" />
  <meta name="apple-mobile-web-app-title" content="Dream Cart BD" />
  <meta name="apple-mobile-web-app-capable" content="yes" />

  <!-- Search Engine Optimization (Google Search Bengali, Lowercase & Uppercase English) -->
  <link rel="canonical" href="{$c}" />
  <meta name="robots" content="{$rob}" />
  <meta name="description" content="{$d}" />
  <meta name="keywords" content="{$k}" />
  <meta name="author" content="Dream Cart BD (ড্রিম কার্ট বিডি)" />

  <!-- Top-4 Priority Sitelink Hints for Search Crawlers -->
  <link rel="prerender" href="https://dreamcartbd.com/products" />
  <link rel="prefetch" href="https://dreamcartbd.com/products" />
  <link rel="prefetch" href="https://dreamcartbd.com/contact" />
  <link rel="prefetch" href="https://dreamcartbd.com/track" />

  <!-- OpenGraph Social Preview (WhatsApp, Facebook, Instagram, Messenger, Telegram, LinkedIn) -->
  <meta property="og:site_name" content="Dream Cart BD" />
  <meta property="og:type" content="{$ogT}" />
  <meta property="og:title" content="{$t}" />
  <meta property="og:description" content="{$d}" />
  <meta property="og:url" content="{$c}" />
  <meta property="og:image" content="{$img}" />
  <meta property="og:image:secure_url" content="{$img}" />
  <meta property="og:image:type" content="{$imgType}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="{$t}" />{$extraLogoOg}
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
            $out .= "\n  <!-- Google Search & Shopping Structured Data (Organization, Top-4 Sitelinks, Categories & Products) -->\n";
            $out .= "  <script id=\"dcbd-dynamic-jsonld\" type=\"application/ld+json\">{$jsonLd}</script>\n";
        }

        // Append Ad Pixel & Tracking scripts
        $out .= DcbdPixelTracker::renderHeadScripts($meta['settings'], $meta);

        return $out;
    }

    public static function buildStructuredDataJson(array $meta): string {
        $siteOrigin   = DCBD_SITE_ORIGIN;
        $products     = DcbdCacheEngine::getProducts();
        $categories   = DcbdCacheEngine::getCategories();
        $brandAliases = self::getBrandAliases();

        // Top 4 Priority Sitelinks MUST be: 1. প্রোডাক্ট’স পেজ, 2. কন্টাক্ট পেজ, 3. ট্রেকিং পেজ, 4. হোম পেজ
        $sitelinks = [
            ['@type' => 'SiteNavigationElement', 'position' => 1, 'name' => 'প্রোডাক্ট’স পেজ (Products Page)', 'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি)-এর সকল অরিজিনাল প্রোডাক্ট ও অফার পেজ।', 'url' => "{$siteOrigin}/products"],
            ['@type' => 'SiteNavigationElement', 'position' => 2, 'name' => 'কন্টাক্ট পেজ (Contact Page)', 'description' => 'Dream Cart BD অফিস ঠিকানা ও ২৪/৭ হটলাইন (01581703822, 01818273838)।', 'url' => "{$siteOrigin}/contact"],
            ['@type' => 'SiteNavigationElement', 'position' => 3, 'name' => 'ট্রেকিং পেজ (Tracking Page)', 'description' => 'অর্ডার আইডি বা মোবাইল নম্বর দিয়ে পার্সেল ও ডেলিভারি লাইভ ট্র্যাক করুন।', 'url' => "{$siteOrigin}/track"],
            ['@type' => 'SiteNavigationElement', 'position' => 4, 'name' => 'হোম পেজ (Home Page)', 'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি) অফিসিয়াল হোম পেজ।', 'url' => "{$siteOrigin}/"],
            ['@type' => 'SiteNavigationElement', 'position' => 5, 'name' => 'ক্যাটাগরি সমূহ (All Categories)', 'url' => "{$siteOrigin}/categories"],
            ['@type' => 'SiteNavigationElement', 'position' => 6, 'name' => 'বিশেষ অফার (Offers & Coupons)', 'url' => "{$siteOrigin}/offers"],
            ['@type' => 'SiteNavigationElement', 'position' => 7, 'name' => 'কাস্টমার লগইন (Customer Login)', 'url' => "{$siteOrigin}/customer/login"],
            ['@type' => 'SiteNavigationElement', 'position' => 8, 'name' => 'রিসেলার লগইন (Reseller Login)', 'url' => "{$siteOrigin}/reseller/login"],
            ['@type' => 'SiteNavigationElement', 'position' => 9, 'name' => 'হোলসেলার লগইন (Wholesaler Login)', 'url' => "{$siteOrigin}/wholesaler/login"],
            ['@type' => 'SiteNavigationElement', 'position' => 10, 'name' => 'আইটি সার্ভিসেস (IT Services)', 'url' => "{$siteOrigin}/dcitbd"],
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
                'alternateName' => $brandAliases,
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
                'description' => 'Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd / dreamcartbd) বাংলাদেশের বিশ্বস্ত স্মার্ট ডিজিটাল ই-কমার্স ও মাল্টি-ভেন্ডর প্ল্যাটফর্ম। প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ ও হোম পেজ।',
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
                'name' => 'Dream Cart BD — ড্রিম কার্ট বিডি (dream cart bd)',
                'alternateName' => $brandAliases,
                'publisher' => ['@id' => "{$siteOrigin}/#organization"],
                'inLanguage' => ['bn-BD', 'en-US'],
                'hasPart' => [
                    ['@type' => 'CollectionPage', '@id' => "{$siteOrigin}/products#webpage", 'name' => 'প্রোডাক্ট’স পেজ (Products Page)', 'url' => "{$siteOrigin}/products"],
                    ['@type' => 'ContactPage', '@id' => "{$siteOrigin}/contact#webpage", 'name' => 'কন্টাক্ট পেজ (Contact Page)', 'url' => "{$siteOrigin}/contact"],
                    ['@type' => 'WebPage', '@id' => "{$siteOrigin}/track#webpage", 'name' => 'ট্রেকিং পেজ (Tracking Page)', 'url' => "{$siteOrigin}/track"],
                    ['@type' => 'WebPage', '@id' => "{$siteOrigin}/#webpage", 'name' => 'হোম পেজ (Home Page)', 'url' => "{$siteOrigin}/"],
                ],
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
                'name' => 'Dream Cart BD Official Sitelinks (প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ, হোম পেজ)',
                'itemListElement' => $sitelinks
            ],
            [
                '@type' => 'BreadcrumbList',
                '@id' => "{$siteOrigin}/#priority-breadcrumbs",
                'name' => 'Dream Cart BD Priority Pages',
                'itemListElement' => [
                    ['@type' => 'ListItem', 'position' => 1, 'name' => 'প্রোডাক্ট’স পেজ (Products)', 'item' => "{$siteOrigin}/products"],
                    ['@type' => 'ListItem', 'position' => 2, 'name' => 'কন্টাক্ট পেজ (Contact)', 'item' => "{$siteOrigin}/contact"],
                    ['@type' => 'ListItem', 'position' => 3, 'name' => 'ট্রেকিং পেজ (Tracking)', 'item' => "{$siteOrigin}/track"],
                    ['@type' => 'ListItem', 'position' => 4, 'name' => 'হোম পেজ (Home)', 'item' => "{$siteOrigin}/"],
                ]
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
