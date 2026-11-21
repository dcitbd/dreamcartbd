/**
 * DREAM CART BD — BILINGUAL INTELLIGENT E-COMMERCE SEARCH SERVICE
 * File: src/services/SearchService.js
 *
 * Features:
 * - Case-insensitive English search
 * - Bengali Unicode normalization and Bengali digit normalization
 * - Bangla, English and Banglish synonym expansion
 * - Brand translations and brand/site alias recognition
 * - SKU / product ID matching
 * - Product name, brand, category, slug, description, color and size matching
 * - Prefix matching for autocomplete
 * - Related product recommendations
 * - Configurable result limits and stock preference
 *
 * IMPORTANT:
 * This is an INTERNAL WEBSITE SEARCH SERVICE. It does not directly improve
 * Google rankings. Use the SEO metadata, indexable pages, sitemap and schema
 * separately for search-engine SEO.
 */

// -----------------------------------------------------------------------------
// 1. BRAND & SITE ALIASES
// -----------------------------------------------------------------------------

export const BRAND_SEARCH_ALIASES = [
  'Dream Cart BD',
  'Dream Cart Bangladesh',
  'DreamCart BD',
  'DreamCart Bangladesh',
  'Dream Cart',
  'DreamCart',
  'Dream Cart Online Shop',
  'Dream Cart Online Shopping',
  'Dream Cart Official',
  'Dream Cart BD Official',
  'Dream Cart Store',
  'Dream Cart Shop',
  'Dream Cart Website',
  'Dream Cart Products',
  'Dream Cart BD Products',
  'Dream Cart BD Online Store',
  'Dream Cart BD Online Shopping',
  'Dream-Cart-BD',
  'Dream_Cart_BD',
  'dreamcartbd',
  'dreamcartbd.com',
  'www.dreamcartbd.com',
  'dream cart bd',
  'dream cart bangladesh',
  'dream cart online',
  'dream cart shop',
  'dream cart store',
  'dreamcart bd',
  'dreamcart bangladesh',
  'DREAM CART BD',
  'DREAM CART BANGLADESH',
  'DREAMCARTBD',
  'DREAMCART BD',
  'DREAM CART',
  'DREAMCART',
  'ড্রিম কার্ট বিডি',
  'ড্রিম কার্ট বাংলাদেশ',
  'ড্রিমকার্ট বিডি',
  'ড্রিমকার্ট বাংলাদেশ',
  'ড্রিম কার্ট বি.ডি',
  'ড্রিমকার্ট বি.ডি',
  'ড্রিম কার্ট',
  'ড্রিমকার্ট',
  'ড্রিমকার্টবিডি',
  'ড্রিম কার্ট বিডি ডট কম',
  'ড্রিম কার্ট অনলাইন শপ',
  'ড্রিম কার্ট অনলাইন শপিং',
  'ড্রিম কার্ট অফিসিয়াল',
  'ড্রিম কার্ট ওয়েবসাইট',
  'ড্রিম কার্ট বিডি শপ',
  'ড্রিম কার্ট থেকে কেনাকাটা',
  'ড্রিম কার্ট বিডি থেকে অর্ডার',
  'ড্রিম কার্ট বিডি পণ্য',
  'ড্রিম কার্ট বিডি প্রোডাক্ট',
  'ড্রিম কার্ট বিডি অনলাইন শপিং',
  'Dream Cart B D',
  'Dream Cart B.D.',
  'Dream Cart BD Com',
  'Dreamcart B D',
  'Dream Cart Bangla',
  'Dream Cart Bangladesh Shop',
  'DCBD'
];

// -----------------------------------------------------------------------------
// 2. SITE PAGE ALIASES
// -----------------------------------------------------------------------------

export const SITE_PAGE_ALIASES = {
  products: [
    'products', 'product', 'all products', 'all product', 'shop', 'shopping',
    'catalog', 'catalogue', 'product list', 'product page', 'products page',
    'প্রোডাক্ট', 'প্রোডাক্টস', 'সকল প্রোডাক্ট', 'সব প্রোডাক্ট',
    'পণ্য', 'সকল পণ্য', 'সব পণ্য', 'পণ্যের তালিকা', 'পণ্যসমূহ',
    'প্রোডাক্টস পেজ', 'শপ', 'কেনাকাটা'
  ],
  contact: [
    'contact', 'contact us', 'customer care', 'support', 'help',
    'যোগাযোগ', 'যোগাযোগ করুন', 'কাস্টমার কেয়ার', 'সাপোর্ট', 'সাহায্য'
  ],
  tracking: [
    'track', 'tracking', 'order tracking', 'track order', 'parcel tracking',
    'অর্ডার ট্র্যাক', 'ট্র্যাকিং', 'অর্ডার ট্র্যাকিং', 'পার্সেল ট্র্যাক'
  ],
  home: [
    'home', 'homepage', 'home page', 'main page', 'হোম', 'হোম পেজ',
    'প্রথম পাতা', 'মূল পাতা'
  ]
};

// -----------------------------------------------------------------------------
// 3. CATEGORY & CONCEPT SYNONYMS
// -----------------------------------------------------------------------------

export const CONCEPT_SYNONYMS = {
  // Watches & Wearables
  'ঘড়ি': ['watch', 'watches', 'smartwatch', 'smart watch', 'clock', 'ঘড়ি', 'ওয়াচ', 'ওয়াচ', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ', 'হাতঘড়ি', 'হাতঘড়ি'],
  'ঘড়ি': ['watch', 'watches', 'smartwatch', 'smart watch', 'clock', 'ঘড়ি', 'ওয়াচ', 'ওয়াচ', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ'],
  'ওয়াচ': ['watch', 'smartwatch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ'],
  'ওয়াচ': ['watch', 'smartwatch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ'],
  'স্মার্টওয়াচ': ['smartwatch', 'smart watch', 'watch', 'ঘড়ি', 'ঘড়ি', 'ওয়াচ', 'ওয়াচ'],
  'স্মার্টওয়াচ': ['smartwatch', 'smart watch', 'watch', 'ঘড়ি', 'ঘড়ি', 'ওয়াচ', 'ওয়াচ'],
  'watch': ['watches', 'smartwatch', 'smart watch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ'],
  'watches': ['watch', 'smartwatch', 'ঘড়ি', 'ঘড়ি'],
  'smartwatch': ['smart watch', 'watch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ'],
  'ghori': ['watch', 'smartwatch', 'ঘড়ি', 'ঘড়ি'],
  'gori': ['watch', 'smartwatch', 'ঘড়ি', 'ঘড়ি'],

  // Organic, Honey & Food
  'মধু': ['honey', 'modhu', 'raw honey', 'sundarban honey', 'সুন্দরবন', 'সুন্দরবনের মধু'],
  'honey': ['মধু', 'modhu', 'sundarban', 'সুন্দরবন'],
  'modhu': ['মধু', 'honey', 'sundarban'],
  'সুন্দরবন': ['sundarban', 'honey', 'মধু'],
  'sundarban': ['সুন্দরবন', 'honey', 'মধু'],
  'চিয়া': ['chia', 'chia seeds', 'চিয়া', 'চিয়া সিড', 'সিড'],
  'চিয়া': ['chia', 'chia seeds', 'চিয়া', 'চিয়া সিড', 'সিড'],
  'chia': ['চিয়া', 'চিয়া', 'chia seeds', 'seed', 'seeds'],
  'সিড': ['seed', 'seeds', 'chia', 'চিয়া', 'চিয়া'],
  'বীজ': ['seed', 'seeds', 'chia seeds', 'চিয়া'],
  'অর্গানিক': ['organic', 'জৈব', 'প্রাকৃতিক'],
  'organic': ['অর্গানিক', 'জৈব', 'প্রাকৃতিক'],
  'মসলা': ['spice', 'spices', 'মশলা', 'মসলা গুঁড়া'],
  'মশলা': ['spice', 'spices', 'মসলা'],
  'spice': ['মসলা', 'মশলা', 'spices'],
  'coffee': ['কফি', 'কফি বিন', 'কফি পাউডার'],
  'কফি': ['coffee', 'coffee powder', 'coffee bean'],
  'চা': ['tea', 'চা পাতা'],
  'tea': ['চা', 'tea leaves'],

  // Lighting & Torches
  'লাইট': ['light', 'lamp', 'torch', 'flashlight', 'lantern', 'ল্যাম্প', 'টর্চ', 'ফ্ল্যাশলাইট'],
  'টর্চ': ['torch', 'flashlight', 'light', 'লাইট', 'ফ্ল্যাশলাইট'],
  'ফ্ল্যাশলাইট': ['flashlight', 'torch', 'light', 'লাইট', 'টর্চ'],
  'torch': ['টর্চ', 'লাইট', 'ফ্ল্যাশলাইট', 'flashlight', 'light'],
  'light': ['লাইট', 'টর্চ', 'ফ্ল্যাশলাইট', 'torch', 'flashlight', 'lamp', 'ল্যাম্প'],
  'flashlight': ['টর্চ', 'লাইট', 'ফ্ল্যাশলাইট', 'torch', 'light'],
  'লণ্ঠন': ['lantern', 'solar lantern', 'লাইট'],
  'lantern': ['লণ্ঠন', 'solar lantern', 'light'],
  'ল্যাম্প': ['lamp', 'light', 'লাইট'],
  'lamp': ['ল্যাম্প', 'light', 'লাইট'],
  'সোলার': ['solar', 'solar light', 'সৌর বিদ্যুৎ'],
  'solar': ['সোলার', 'solar light'],

  // Kitchen & Dining
  'কিচেন': ['kitchen', 'kitchenware', 'রান্নাঘর', 'রান্নার সামগ্রী'],
  'kitchen': ['কিচেন', 'রান্নাঘর', 'kitchenware'],
  'রান্নাঘর': ['kitchen', 'kitchenware', 'কিচেন'],
  'রান্না': ['cooking', 'cookware', 'kitchen'],
  'রান্নার': ['cooking', 'cookware', 'kitchen'],
  'কুকওয়্যার': ['cookware', 'cooking utensils'],
  'cookware': ['কুকওয়্যার', 'রান্নার সামগ্রী', 'kitchenware'],
  'বাসন': ['utensils', 'cookware', 'dishes'],
  'বাসনপত্র': ['utensils', 'cookware', 'kitchen utensils'],
  'পাত্র': ['container', 'pot', 'bowl'],
  'কন্টেইনার': ['container', 'storage box', 'food container'],
  'container': ['কন্টেইনার', 'পাত্র', 'storage box'],
  'গ্রাইন্ডার': ['grinder', 'spice grinder', 'coffee grinder'],
  'grinder': ['গ্রাইন্ডার', 'spice grinder', 'coffee grinder'],
  'চপার': ['chopper', 'food chopper', 'vegetable cutter'],
  'chopper': ['চপার', 'food chopper', 'vegetable cutter'],
  'ব্লেন্ডার': ['blender', 'mixer'],
  'blender': ['ব্লেন্ডার', 'mixer'],
  'মিক্সার': ['mixer', 'blender'],
  'mixer': ['মিক্সার', 'blender'],
  'ফ্রোথার': ['frother', 'milk frother', 'coffee frother'],
  'frother': ['ফ্রোথার', 'milk frother'],
  'স্প্রে': ['spray', 'sprayer', 'spray bottle'],
  'স্প্রেয়ার': ['sprayer', 'spray bottle'],
  'sprayer': ['স্প্রেয়ার', 'স্প্রে বোতল'],
  'তেল': ['oil', 'cooking oil'],
  'oil': ['তেল', 'cooking oil'],
  'বোতল': ['bottle', 'flask', 'water bottle'],
  'bottle': ['বোতল', 'flask', 'water bottle'],
  'কাপ': ['cup', 'mug'],
  'cup': ['কাপ', 'mug'],
  'মগ': ['mug', 'cup'],
  'mug': ['মগ', 'cup'],

  // Home, Furniture & Decor
  'ঘর': ['home', 'house', 'household'],
  'হোম': ['home', 'household'],
  'home': ['হোম', 'ঘর', 'household'],
  'ডেকোর': ['decor', 'decoration', 'home decor'],
  'ডেকোরেশন': ['decoration', 'decor', 'home decor'],
  'decor': ['ডেকোর', 'সাজসজ্জা', 'decoration'],
  'decoration': ['ডেকোরেশন', 'সাজসজ্জা', 'decor'],
  'আসবাব': ['furniture', 'ফার্নিচার'],
  'ফার্নিচার': ['furniture', 'আসবাবপত্র'],
  'furniture': ['ফার্নিচার', 'আসবাবপত্র'],
  'বালিশ': ['pillow', 'cushion'],
  'pillow': ['বালিশ', 'cushion'],
  'তোশক': ['mattress', 'গদি'],
  'mattress': ['তোশক', 'গদি'],
  'পর্দা': ['curtain', 'drape'],
  'curtain': ['পর্দা', 'drape'],
  'স্টোরেজ': ['storage', 'organizer', 'রাখার বক্স'],
  'organizer': ['অর্গানাইজার', 'গোছানোর সামগ্রী', 'storage'],
  'storage': ['স্টোরেজ', 'organizer'],

  // Cleaning & Laundry
  'পরিষ্কার': ['cleaning', 'cleaner', 'clean'],
  'ক্লিনিং': ['cleaning', 'পরিষ্কার'],
  'ক্লিনার': ['cleaner', 'cleaning product'],
  'cleaner': ['ক্লিনার', 'পরিষ্কারক'],
  'cleaning': ['পরিষ্কার', 'ক্লিনিং'],
  'ব্রাশ': ['brush', 'cleaning brush'],
  'brush': ['ব্রাশ', 'cleaning brush'],
  'মপ': ['mop', 'floor cleaner'],
  'mop': ['মপ', 'floor cleaner'],
  'ঝাড়ু': ['broom', 'ঝাড়ু'],
  'ঝাড়ু': ['broom', 'ঝাড়ু'],
  'broom': ['ঝাড়ু', 'ঝাড়ু'],
  'লন্ড্রি': ['laundry', 'washing'],
  'laundry': ['লন্ড্রি', 'কাপড় ধোয়া'],
  'ডিটারজেন্ট': ['detergent', 'washing powder'],
  'detergent': ['ডিটারজেন্ট', 'washing powder'],
  'তোয়ালে': ['towel', 'hand towel'],
  'তোয়ালে': ['towel', 'hand towel'],
  'towel': ['তোয়ালে', 'তোয়ালে'],

  // Mobile & Electronics
  'মোবাইল': ['mobile', 'phone', 'smartphone', 'মুঠোফোন'],
  'mobile': ['মোবাইল', 'phone', 'smartphone'],
  'ফোন': ['phone', 'mobile', 'smartphone'],
  'phone': ['ফোন', 'মোবাইল', 'smartphone'],
  'স্মার্টফোন': ['smartphone', 'mobile phone', 'মোবাইল'],
  'smartphone': ['স্মার্টফোন', 'mobile phone', 'মোবাইল'],
  'চার্জার': ['charger', 'charging adapter'],
  'charger': ['চার্জার', 'charging adapter'],
  'চার্জিং': ['charging', 'charger'],
  'charging': ['চার্জিং', 'চার্জার'],
  'কেবল': ['cable', 'usb cable', 'data cable'],
  'ক্যাবল': ['cable', 'usb cable', 'data cable'],
  'cable': ['কেবল', 'ক্যাবল', 'data cable'],
  'হেডফোন': ['headphone', 'headset'],
  'headphone': ['হেডফোন', 'headset'],
  'ইয়ারফোন': ['earphone', 'earbuds'],
  'earphone': ['ইয়ারফোন', 'earbuds'],
  'স্পিকার': ['speaker', 'bluetooth speaker'],
  'speaker': ['স্পিকার', 'bluetooth speaker'],
  'ফ্যান': ['fan', 'cooling fan'],
  'fan': ['ফ্যান', 'cooling fan'],
  'ক্যামেরা': ['camera', 'webcam'],
  'camera': ['ক্যামেরা', 'webcam'],
  'গ্যাজেট': ['gadget', 'gadgets', 'smart device'],
  'gadget': ['গ্যাজেট', 'gadgets'],
  'ইলেকট্রনিক্স': ['electronics', 'electronic device'],
  'electronics': ['ইলেকট্রনিক্স', 'electronic device'],

  // Beauty, Health & Personal Care
  'সৌন্দর্য': ['beauty', 'cosmetics'],
  'বিউটি': ['beauty', 'cosmetics'],
  'beauty': ['বিউটি', 'সৌন্দর্য', 'cosmetics'],
  'কসমেটিকস': ['cosmetics', 'makeup'],
  'cosmetics': ['কসমেটিকস', 'makeup'],
  'মেকআপ': ['makeup', 'cosmetics'],
  'makeup': ['মেকআপ', 'cosmetics'],
  'ত্বক': ['skin', 'skincare'],
  'স্কিন': ['skin', 'skincare'],
  'skin': ['ত্বক', 'skincare'],
  'স্কিনকেয়ার': ['skincare', 'skin care'],
  'skincare': ['স্কিনকেয়ার', 'skin care'],
  'চুল': ['hair', 'haircare'],
  'hair': ['চুল', 'haircare'],
  'হেয়ার': ['hair', 'haircare'],
  'হেয়ার ড্রায়ার': ['hair dryer', 'dryer'],
  'hair dryer': ['হেয়ার ড্রায়ার', 'চুল শুকানোর যন্ত্র'],
  'ম্যাসাজ': ['massage', 'massager'],
  'ম্যাসাজার': ['massager', 'massage device'],
  'massage': ['ম্যাসাজ', 'massager'],
  'massager': ['ম্যাসাজার', 'massage device'],
  'ফেস': ['face', 'facial'],
  'মুখ': ['face', 'facial'],
  'face': ['মুখ', 'ফেস', 'facial'],
  'দাঁত': ['tooth', 'teeth', 'dental'],
  'tooth': ['দাঁত', 'dental'],
  'স্বাস্থ্য': ['health', 'wellness'],
  'health': ['স্বাস্থ্য', 'wellness'],
  'পার্সোনাল কেয়ার': ['personal care', 'grooming'],
  'personal care': ['পার্সোনাল কেয়ার', 'grooming'],

  // Mother, Baby, Toys
  'শিশু': ['baby', 'child', 'infant', 'kids'],
  'বাচ্চা': ['baby', 'child', 'kids'],
  'বেবি': ['baby', 'শিশু'],
  'baby': ['শিশু', 'বাচ্চা', 'বেবি', 'infant'],
  'শিশুদের': ['kids', 'children', 'baby'],
  'খেলনা': ['toy', 'toys', 'games'],
  'toy': ['খেলনা', 'toys'],
  'toys': ['খেলনা', 'games'],
  'গেম': ['game', 'games'],
  'games': ['গেম', 'খেলা'],
  'শিক্ষামূলক': ['educational', 'learning toy'],
  'educational': ['শিক্ষামূলক', 'learning'],

  // Fashion & Accessories
  'ফ্যাশন': ['fashion', 'style'],
  'fashion': ['ফ্যাশন', 'style'],
  'পোশাক': ['clothing', 'apparel', 'dress'],
  'clothing': ['পোশাক', 'apparel'],
  'জুতা': ['shoes', 'footwear'],
  'shoes': ['জুতা', 'footwear'],
  'ব্যাগ': ['bag', 'handbag', 'backpack'],
  'bag': ['ব্যাগ', 'handbag', 'backpack'],
  'পারফিউম': ['perfume', 'fragrance'],
  'perfume': ['পারফিউম', 'fragrance'],
  'ঘ্রাণ': ['fragrance', 'perfume'],
  'গয়না': ['jewelry', 'ornament'],
  'গহনা': ['jewelry', 'ornament'],
  'jewelry': ['গয়না', 'গহনা', 'ornament'],

  // Office & Stationery
  'অফিস': ['office', 'workplace'],
  'office': ['অফিস', 'workplace'],
  'স্টেশনারি': ['stationery', 'office supplies'],
  'stationery': ['স্টেশনারি', 'office supplies'],
  'কলম': ['pen', 'ballpoint pen'],
  'pen': ['কলম', 'ballpoint pen'],
  'খাতা': ['notebook', 'exercise book'],
  'নোটবুক': ['notebook', 'খাতা'],
  'notebook': ['নোটবুক', 'খাতা'],
  'কাগজ': ['paper', 'পেপার'],
  'paper': ['কাগজ', 'পেপার'],

  // Travel & Outdoor
  'ভ্রমণ': ['travel', 'tour', 'trip'],
  'ট্রাভেল': ['travel', 'ভ্রমণ'],
  'travel': ['ভ্রমণ', 'ট্রাভেল', 'tour'],
  'ক্যাম্পিং': ['camping', 'outdoor'],
  'camping': ['ক্যাম্পিং', 'outdoor'],
  'আউটডোর': ['outdoor', 'outdoors'],
  'outdoor': ['আউটডোর', 'camping'],
  'টর্চলাইট': ['torchlight', 'flashlight', 'torch'],

  // Gas & Safety
  'গ্যাস': ['gas', 'gas regulator', 'gas safety'],
  'gas': ['গ্যাস', 'gas regulator'],
  'সেফটি': ['safety', 'নিরাপত্তা'],
  'safety': ['সেফটি', 'নিরাপত্তা'],
  'রেগুলেটর': ['regulator', 'gas regulator'],
  'regulator': ['রেগুলেটর', 'gas regulator'],
  'পাইপ': ['pipe', 'hose'],
  'pipe': ['পাইপ', 'hose'],
  'হোস': ['hose', 'pipe'],
  'hose': ['হোস', 'পাইপ'],

  // Common shopping terms
  'দাম': ['price', 'cost', 'মূল্য'],
  'price': ['দাম', 'মূল্য', 'cost'],
  'মূল্য': ['price', 'cost', 'দাম'],
  'নতুন': ['new', 'latest', 'new arrival'],
  'new': ['নতুন', 'latest'],
  'অফার': ['offer', 'deal', 'discount'],
  'offer': ['অফার', 'deal', 'discount'],
  'ডিসকাউন্ট': ['discount', 'ছাড়', 'offer'],
  'discount': ['ডিসকাউন্ট', 'ছাড়', 'offer'],
  'ছাড়': ['discount', 'ছাড়', 'offer'],
  'পাইকারি': ['wholesale', 'bulk'],
  'wholesale': ['পাইকারি', 'bulk'],
  'রিসেলার': ['reseller', 'reselling'],
  'reseller': ['রিসেলার', 'reselling']
};

// -----------------------------------------------------------------------------
// 4. BRAND TRANSLATIONS
// Add only brands/products that are actually present in your catalog.
// -----------------------------------------------------------------------------

export const BRAND_TRANSLATIONS = {
  'amazfit': ['অ্যামাজফিট', 'আমাজফিট'],
  'অ্যামাজফিট': ['amazfit'],
  'আমাজফিট': ['amazfit'],
  'kieslect': ['কিসলেক্ট'],
  'কিসলেক্ট': ['kieslect'],
  'hk9': ['এইচকে৯', 'hk'],
  'এইচকে৯': ['hk9', 'hk'],
  'hk': ['এইচকে', 'hk9'],
  'a4tech': ['এ৪টেক', 'এ ফোর টেক'],
  'এ৪টেক': ['a4tech'],
  'apple bear': ['অ্যাপল বিয়ার', 'applebear'],
  'applebear': ['apple bear', 'অ্যাপল বিয়ার'],
  'sokany': ['সোকানি'],
  'সোকানি': ['sokany'],
  'prestige': ['প্রেস্টিজ'],
  'প্রেস্টিজ': ['prestige'],
  'kdk': ['কে ডি কে'],
  'bioaqua': ['বায়োএকুয়া', 'বায়ো অ্যাকুয়া'],
  'বায়োএকুয়া': ['bioaqua']
};

// -----------------------------------------------------------------------------
// 5. STOP WORDS
// Do not add brand identifiers such as "dcbd" here.
// -----------------------------------------------------------------------------

export const STOP_WORDS = new Set([
  'এর', 'টি', 'টা', 'একটি', 'একটা', 'দাম', 'কত', 'দেখান', 'দেখাও',
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with',
  'is', 'are', 'of', 'by', 'from', 'this', 'that'
]);

// -----------------------------------------------------------------------------
// 6. TEXT NORMALIZATION
// -----------------------------------------------------------------------------

export function normalizeSearchText(text) {
  if (text === null || text === undefined) return '';

  let s = String(text);

  try {
    if (typeof s.normalize === 'function') s = s.normalize('NFC');
  } catch (_) {
    // Continue with the original string if Unicode normalization is unavailable.
  }

  return s
    .toLowerCase()
    // Bengali alternate Unicode spellings
    .replace(/\u09A1\u09BC/g, 'ড়')
    .replace(/\u09DC/g, 'ড়')
    .replace(/\u09A2\u09BC/g, 'ঢ়')
    .replace(/\u09DD/g, 'ঢ়')
    .replace(/\u09AF\u09BC/g, 'য়')
    .replace(/\u09DF/g, 'য়')
    // Bengali digits to English digits
    .replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))
    // Normalize punctuation and whitespace
    .replace(/['’‘`]/g, '')
    .replace(/[,\-_—–/\\()|:;!?.+\[\]"{}<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeQuery(text, options = {}) {
  const normalized = normalizeSearchText(text);
  if (!normalized) return [];

  const tokens = normalized.split(' ').filter(Boolean);
  const filtered = options.removeStopWords === false
    ? tokens
    : tokens.filter(token => !STOP_WORDS.has(token));

  return filtered.length ? filtered : tokens;
}

export function cleanSku(sku) {
  return String(sku || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function containsWord(text, word) {
  const normalizedText = normalizeSearchText(text);
  const normalizedWord = normalizeSearchText(word);
  return Boolean(normalizedText && normalizedWord && normalizedText.includes(normalizedWord));
}

// -----------------------------------------------------------------------------
// 7. ALIAS / SITE QUERY RECOGNITION
// -----------------------------------------------------------------------------

function compactText(text) {
  return normalizeSearchText(text).replace(/\s+/g, '');
}

export function isBrandQuery(query) {
  const normalized = normalizeSearchText(query);
  const compact = compactText(query);
  if (!normalized) return false;

  return BRAND_SEARCH_ALIASES.some(alias => {
    const aliasNorm = normalizeSearchText(alias);
    const aliasCompact = compactText(alias);
    return normalized === aliasNorm || compact === aliasCompact;
  });
}

export function getSitePageFromQuery(query) {
  const normalized = normalizeSearchText(query);
  const compact = compactText(query);
  if (!normalized) return null;

  for (const [page, aliases] of Object.entries(SITE_PAGE_ALIASES)) {
    const found = aliases.some(alias => {
      const aliasNorm = normalizeSearchText(alias);
      return normalized === aliasNorm || compact === compactText(alias);
    });
    if (found) return page;
  }

  return null;
}

export function isStoreOrAllProductsQuery(query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return false;

  if (isBrandQuery(normalized)) return true;

  const productsAliases = SITE_PAGE_ALIASES.products;
  return productsAliases.some(alias => {
    const aliasNorm = normalizeSearchText(alias);
    return normalized === aliasNorm || compactText(normalized) === compactText(alias);
  });
}

// -----------------------------------------------------------------------------
// 8. SYNONYM EXPANSION
// -----------------------------------------------------------------------------

export function expandSearchTerms(query, options = {}) {
  const tokens = tokenizeQuery(query, { removeStopWords: options.removeStopWords });
  const expanded = new Set(tokens);
  const maxTerms = Number.isFinite(options.maxTerms) ? options.maxTerms : 80;

  tokens.forEach(token => {
    const synonyms = CONCEPT_SYNONYMS[token] || [];
    synonyms.forEach(synonym => expanded.add(normalizeSearchText(synonym)));

    const brandSynonyms = BRAND_TRANSLATIONS[token] || [];
    brandSynonyms.forEach(synonym => expanded.add(normalizeSearchText(synonym)));

    // Prefix support is intentionally limited to tokens with at least 2 chars.
    if (options.prefix !== false && token.length >= 2) {
      Object.keys(CONCEPT_SYNONYMS).forEach(key => {
        if (key.startsWith(token) || token.startsWith(key)) {
          expanded.add(normalizeSearchText(key));
          (CONCEPT_SYNONYMS[key] || []).forEach(s => {
            expanded.add(normalizeSearchText(s));
          });
        }
      });
    }
  });

  return [...expanded].filter(Boolean).slice(0, maxTerms);
}

// -----------------------------------------------------------------------------
// 9. PRODUCT FIELD HELPERS
// -----------------------------------------------------------------------------

function getProductText(product, fields) {
  return fields
    .map(field => product?.[field])
    .filter(value => value !== null && value !== undefined && value !== '')
    .join(' ');
}

function getProductId(product) {
  return String(
    product?.sku ||
    product?.product_id ||
    product?.id ||
    product?.slug ||
    ''
  ).toLowerCase();
}

function getProductStock(product) {
  const stock = product?.stock ?? product?.quantity;
  if (stock === null || stock === undefined || stock === '') return null;
  const number = Number(stock);
  return Number.isFinite(number) ? number : null;
}

// -----------------------------------------------------------------------------
// 10. PRODUCT RELEVANCE SCORING
// -----------------------------------------------------------------------------

export function calculateProductRelevance(product, query, options = {}) {
  if (!product || !query) return 0;

  const qNorm = normalizeSearchText(query);
  const qCompact = compactText(query);
  const qSku = cleanSku(query);
  const tokens = tokenizeQuery(query);

  if (!qNorm && !qSku) return 0;

  if (isStoreOrAllProductsQuery(query)) return 650;

  const pSku = cleanSku(product.sku || product.product_id || product.id);
  const pName = normalizeSearchText(product.name || product.p_name || product.title);
  const pBrand = normalizeSearchText(product.brand);
  const pCategory = normalizeSearchText(product.category);
  const pSubCategory = normalizeSearchText(product.sub_category || product.subCategory);
  const pChildCategory = normalizeSearchText(product.child_category || product.childCategory);
  const pSlug = normalizeSearchText(product.slug);

  const pDescription = normalizeSearchText(getProductText(product, [
    'description', 'short_description', 'long_description',
    'specification', 'specifications', 'others', 'color',
    'size', 'model', 'tags', 'keywords'
  ]));

  const fullText = [
    pName, pBrand, pCategory, pSubCategory, pChildCategory,
    pSlug, pSku, pDescription
  ].join(' ');

  let score = 0;

  // Exact SKU / model matching has the highest priority.
  if (pSku && qSku && qSku.length >= 2) {
    if (pSku === qSku) score += 1600;
    else if (pSku.startsWith(qSku)) score += 1000;
    else if (pSku.includes(qSku)) score += 650;
  }

  // Product name matching
  if (pName) {
    if (pName === qNorm) score += 1200;
    else if (pName.startsWith(qNorm)) score += 850;
    else if (pName.includes(qNorm)) score += 650;
    else if (qCompact.length >= 2 && compactText(pName).includes(qCompact)) score += 520;
  }

  // Brand matching
  if (pBrand) {
    if (pBrand === qNorm) score += 500;
    else if (pBrand.includes(qNorm) || qNorm.includes(pBrand)) score += 320;
  }

  // Category matching
  if (pCategory) {
    if (pCategory === qNorm) score += 420;
    else if (pCategory.includes(qNorm) || qNorm.includes(pCategory)) score += 250;
  }

  if (pSubCategory) {
    if (pSubCategory === qNorm) score += 340;
    else if (pSubCategory.includes(qNorm) || qNorm.includes(pSubCategory)) score += 210;
  }

  if (pChildCategory && pChildCategory.includes(qNorm)) score += 160;

  // Slug matching
  if (pSlug && pSlug.includes(qNorm.replace(/\s+/g, '-'))) score += 220;

  // Token and synonym matching
  let matchedNameTokens = 0;
  let matchedTokens = 0;
  const expandedTerms = expandSearchTerms(query, { maxTerms: 80 });

  tokens.forEach(token => {
    let tokenMatched = false;

    if (pName.includes(token)) {
      matchedNameTokens++;
      tokenMatched = true;
      score += token.length >= 3 ? 125 : 75;
    }
    if (pBrand.includes(token)) {
      score += 100;
      tokenMatched = true;
    }
    if (pCategory.includes(token)) {
      score += 85;
      tokenMatched = true;
    }
    if (pSubCategory.includes(token)) {
      score += 70;
      tokenMatched = true;
    }
    if (pChildCategory.includes(token)) {
      score += 55;
      tokenMatched = true;
    }

    const tokenSku = cleanSku(token);
    if (tokenSku.length >= 2 && pSku.includes(tokenSku)) {
      score += 110;
      tokenMatched = true;
    }

    if (pDescription.includes(token)) {
      score += 30;
      tokenMatched = true;
    }

    const translations = BRAND_TRANSLATIONS[token] || [];
    translations.forEach(translation => {
      const translated = normalizeSearchText(translation);
      if (translated && (pName.includes(translated) || pBrand.includes(translated))) {
        score += 115;
        tokenMatched = true;
      }
    });

    const synonyms = CONCEPT_SYNONYMS[token] || [];
    synonyms.forEach(synonym => {
      const syn = normalizeSearchText(synonym);
      if (!syn) return;

      if (pName.includes(syn)) {
        score += 100;
        tokenMatched = true;
      } else if (pCategory.includes(syn) || pSubCategory.includes(syn) || pBrand.includes(syn)) {
        score += 70;
        tokenMatched = true;
      } else if (fullText.includes(syn)) {
        score += 35;
        tokenMatched = true;
      }
    });

    if (tokenMatched) matchedTokens++;
  });

  // Reward complete multi-word matches.
  if (tokens.length > 1) {
    if (matchedNameTokens === tokens.length) score += 300;
    else if (matchedTokens === tokens.length) score += 190;
    else if (matchedTokens > 0) score += Math.round(40 * matchedTokens / tokens.length);
  }

  // Compact matching supports queries without spaces.
  if (qCompact.length >= 2) {
    if (compactText(pName).includes(qCompact)) score += 170;
    if (compactText(pCategory).includes(qCompact)) score += 90;
    if (compactText(pBrand).includes(qCompact)) score += 80;
  }

  // Optional exact color / size / model relevance.
  if (options.boostExactAttributes) {
    const attributes = normalizeSearchText([
      product.color, product.size, product.model
    ].filter(Boolean).join(' '));
    if (attributes.includes(qNorm)) score += 80;
  }

  return score;
}

// -----------------------------------------------------------------------------
// 11. RELATED PRODUCT DISCOVERY
// -----------------------------------------------------------------------------

function findRelatedProducts(list, directMatches, query, options = {}) {
  const directIds = new Set(directMatches.map(getProductId));
  const targetCategories = new Set();
  const targetSubCategories = new Set();
  const targetBrands = new Set();

  directMatches.forEach(product => {
    if (product.category) targetCategories.add(normalizeSearchText(product.category));
    if (product.sub_category) targetSubCategories.add(normalizeSearchText(product.sub_category));
    if (product.brand) targetBrands.add(normalizeSearchText(product.brand));
  });

  // Use query terms and synonyms to discover relevant catalog categories.
  const queryTerms = expandSearchTerms(query, { maxTerms: 80 });

  queryTerms.forEach(term => {
    if (!term) return;

    list.forEach(product => {
      const category = normalizeSearchText(product.category);
      const subCategory = normalizeSearchText(product.sub_category);

      if (category && category.includes(term)) targetCategories.add(category);
      if (subCategory && subCategory.includes(term)) targetSubCategories.add(subCategory);
    });
  });

  const related = [];

  list.forEach(product => {
    const id = getProductId(product);
    if (id && directIds.has(id)) return;

    const category = normalizeSearchText(product.category);
    const subCategory = normalizeSearchText(product.sub_category);
    const brand = normalizeSearchText(product.brand);

    let relevance = 0;

    if (subCategory && targetSubCategories.has(subCategory)) relevance += 60;
    if (category && targetCategories.has(category)) relevance += 40;
    if (brand && targetBrands.has(brand)) relevance += 25;

    if (relevance <= 0) return;

    const stock = getProductStock(product);
    if (stock !== null && stock > 0) relevance += 8;
    if (stock === 0) relevance -= options.excludeOutOfStock ? 1000 : 5;

    related.push({
      ...product,
      _relatedScore: relevance,
      _isDirectMatch: false
    });
  });

  return related
    .filter(product => product._relatedScore > 0)
    .sort((a, b) => b._relatedScore - a._relatedScore);
}

// -----------------------------------------------------------------------------
// 12. MAIN SEARCH FUNCTION
// -----------------------------------------------------------------------------

export function searchProducts(allProducts = [], query = '', options = {}) {
  const q = String(query || '').trim();
  const list = Array.isArray(allProducts) ? allProducts : [];

  const limit = Number.isFinite(options.limit) && options.limit > 0
    ? Math.floor(options.limit)
    : null;

  if (!q) {
    const results = options.excludeOutOfStock
      ? list.filter(product => getProductStock(product) !== 0)
      : list;

    return {
      directMatches: results,
      relatedProducts: [],
      allResults: limit ? results.slice(0, limit) : results,
      query: '',
      totalCount: results.length,
      page: 'products'
    };
  }

  const page = getSitePageFromQuery(q);

  // Brand and all-product queries return the catalog.
  if (isStoreOrAllProductsQuery(q)) {
    const results = options.excludeOutOfStock
      ? list.filter(product => getProductStock(product) !== 0)
      : list;

    return {
      directMatches: results.map(product => ({
        ...product,
        _searchScore: 650,
        _isDirectMatch: true
      })),
      relatedProducts: [],
      allResults: limit
        ? results.slice(0, limit).map(product => ({
            ...product, _searchScore: 650, _isDirectMatch: true
          }))
        : results.map(product => ({
            ...product, _searchScore: 650, _isDirectMatch: true
          })),
      query: q,
      totalCount: results.length,
      page: page || 'products',
      isBrandQuery: isBrandQuery(q)
    };
  }

  const scored = list.map(product => ({
    product,
    score: calculateProductRelevance(product, q, options)
  }));

  const directMatches = scored
    .filter(item => item.score > 0)
    .sort((a, b) => {
      // Optional in-stock preference is a tie-breaker, not a replacement for relevance.
      if (options.preferInStock) {
        const aStock = getProductStock(a.product);
        const bStock = getProductStock(b.product);
        if ((aStock > 0) !== (bStock > 0)) return (bStock > 0) - (aStock > 0);
      }
      return b.score - a.score;
    })
    .map(item => ({
      ...item.product,
      _searchScore: item.score,
      _isDirectMatch: true
    }))
    .filter(product => !options.excludeOutOfStock || getProductStock(product) !== 0);

  const relatedProducts = options.includeRelated === false
    ? []
    : findRelatedProducts(list, directMatches, q, options)
        .filter(product => !options.excludeOutOfStock || getProductStock(product) !== 0);

  const allResults = [...directMatches, ...relatedProducts];

  return {
    directMatches: limit ? directMatches.slice(0, limit) : directMatches,
    relatedProducts: limit ? relatedProducts.slice(0, limit) : relatedProducts,
    allResults: limit ? allResults.slice(0, limit) : allResults,
    query: q,
    totalCount: allResults.length,
    page
  };
}

// -----------------------------------------------------------------------------
// 13. AUTOCOMPLETE / SUGGESTIONS
// -----------------------------------------------------------------------------

export function getSearchSuggestions(allProducts = [], query = '', options = {}) {
  const q = String(query || '').trim();
  if (!q) return [];

  const limit = Number.isFinite(options.limit) ? options.limit : 8;
  const normalizedQuery = normalizeSearchText(q);

  const suggestions = new Set();

  BRAND_SEARCH_ALIASES.forEach(alias => {
    if (normalizeSearchText(alias).includes(normalizedQuery)) suggestions.add(alias);
  });

  Object.keys(CONCEPT_SYNONYMS).forEach(term => {
    if (normalizeSearchText(term).startsWith(normalizedQuery)) suggestions.add(term);
  });

  const result = searchProducts(allProducts, q, {
    includeRelated: false,
    limit: limit * 2
  });

  result.directMatches.forEach(product => {
    const name = product.name || product.p_name || product.title;
    if (name) suggestions.add(String(name));
  });

  return [...suggestions].slice(0, limit);
}

// -----------------------------------------------------------------------------
// 14. SERVICE WRAPPER
// -----------------------------------------------------------------------------

export const SearchService = {
  name: 'SearchService',
  search: searchProducts,
  calculateRelevance: calculateProductRelevance,
  tokenize: tokenizeQuery,
  normalize: normalizeSearchText,
  cleanSku,
  containsWord,
  expandTerms: expandSearchTerms,
  isBrandQuery,
  isStoreOrAllProductsQuery,
  getSitePageFromQuery,
  getSuggestions: getSearchSuggestions,

  handle(action, payload = {}) {
    if (action === 'search') {
      return {
        success: true,
        service: 'SearchService',
        data: searchProducts(
          payload.products || [],
          payload.query || '',
          payload.options || {}
        )
      };
    }

    if (action === 'suggestions') {
      return {
        success: true,
        service: 'SearchService',
        data: getSearchSuggestions(
          payload.products || [],
          payload.query || '',
          payload.options || {}
        )
      };
    }

    if (action === 'normalize') {
      return {
        success: true,
        service: 'SearchService',
        data: normalizeSearchText(payload.text || '')
      };
    }

    if (action === 'expand') {
      return {
        success: true,
        service: 'SearchService',
        data: expandSearchTerms(payload.query || '', payload.options || {})
      };
    }

    return {
      success: true,
      service: 'SearchService',
      action,
      payload
    };
  }
};

export default SearchService;
