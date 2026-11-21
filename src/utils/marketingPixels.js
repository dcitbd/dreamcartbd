/**
 * DREAM CART BD — DYNAMIC SEO, GOOGLE SITELINKS SCHEMA, BENGALI/CASE-INSENSITIVE SEARCH & AD PIXELS ENGINE (src/utils/marketingPixels.js)
 * Implements:
 * 1. Top-4 Priority Google Search Sitelinks & Site Search Options:
 *    - ১. প্রোডাক্ট’স পেজ (Products Page — /products)
 *    - ২. কন্টাক্ট পেজ (Contact Page — /contact)
 *    - ৩. ট্রেকিং পেজ (Tracking Page — /track)
 *    - ৪. হোম পেজ (Home Page — /)
 * 2. 100% Case-Insensitive (ছোট হাতের অক্ষর a-z ও বড় হাতের অক্ষর A-Z) + Bengali (বাংলা) + Banglish Search Engine:
 *    - Works for lowercase ("dream cart bd", "dreamcartbd", "products", "contact", "track", "home", "watch", "honey"),
 *      uppercase ("DREAM CART BD", "PRODUCTS", "WATCH"), and Bengali ("ড্রিম কার্ট বিডি", "প্রোডাক্ট’স পেজ", "কন্টাক্ট পেজ", "ট্রেকিং পেজ", "হোম পেজ", "ঘড়ি", "মধু", "চিয়া", "গ্যাস")
 *    - Automatically injects the 4 Priority Pages at the top of the Site Search Bar (#global-search-input & #mobile-search-input)
 * 3. Full-Funnel Omni-Channel E-Commerce Ad Pixels & Server-Side Conversions API (CAPI)
 */

import { SearchService, CONCEPT_SYNONYMS, BRAND_TRANSLATIONS } from '../services/SearchService.js';

const SITE_ORIGIN = 'https://dreamcartbd.com';
const OFFICIAL_LOGO_URL = `${SITE_ORIGIN}/public/icon/logo.png`;
const OFFICIAL_OG_BANNER = `${SITE_ORIGIN}/public/icon/og-banner.jpg`;


// Dream Cart BD - Expanded Brand Search Aliases
export const BRAND_SEARCH_ALIASES = [
  // Official Brand Names
  'Dream Cart BD',
  'Dream Cart Bangladesh',
  'DreamCart BD',
  'DreamCart Bangladesh',
  'Dream Cart',
  'DreamCart',
  'Dream Cart Online Shop',
  'Dream Cart Online Shopping',
  'Dream Cart E-commerce',
  'Dream Cart Store',
  'Dream Cart Shop',
  'Dream Cart Official',
  'Dream Cart BD Official',
  'Dream Cart Online Store',

  // Lowercase Variations
  'dream cart bd',
  'dream cart bangladesh',
  'dreamcart bd',
  'dreamcart bangladesh',
  'dreamcartbd',
  'dreamcartbd.com',
  'dream cart',
  'dreamcart',
  'dream cart online',
  'dream cart shop',
  'dream cart store',
  'dream cart official',
  'dream cart bd shop',
  'dream cart bd online shop',
  'dream cart bd website',

  // Uppercase Variations
  'DREAM CART BD',
  'DREAM CART BANGLADESH',
  'DREAMCARTBD',
  'DREAMCART BD',
  'DREAM CART',
  'DREAMCART',
  'DREAM CART ONLINE SHOP',
  'DREAM CART OFFICIAL',

  // Mixed Case Variations
  'DreamCartBd',
  'DreamcartBD',
  'DreamCartbd',
  'DreamcartBd.com',
  'DreamCartBD.com',
  'Dream-Cart-BD',
  'Dream-Cart-Bangladesh',
  'Dream_Cart_BD',
  'DreamCart-BD',

  // Domain Variations
  'dreamcartbd.com',
  'www.dreamcartbd.com',
  'https://dreamcartbd.com',
  'https://www.dreamcartbd.com',
  'dreamcartbd online',
  'dreamcartbd shop',
  'dreamcartbd store',

  // Bengali Official Names
  'ড্রিম কার্ট বিডি',
  'ড্রিম কার্ট বাংলাদেশ',
  'ড্রিমকার্ট বিডি',
  'ড্রিমকার্ট বাংলাদেশ',
  'ড্রিম কার্ট বি.ডি',
  'ড্রিমকার্ট বি.ডি',
  'ড্রিম কার্ট',
  'ড্রিমকার্ট',
  'ড্রিম কার্ট অনলাইন শপ',
  'ড্রিম কার্ট অনলাইন শপিং',
  'ড্রিম কার্ট অনলাইন স্টোর',
  'ড্রিম কার্ট অফিসিয়াল',
  'ড্রিম কার্ট ওয়েবসাইট',
  'ড্রিম কার্ট বিডি শপ',
  'ড্রিম কার্ট বিডি অনলাইন শপ',

  // Bengali Alternative Spellings
  'ড্রিমকার্ট',
  'ড্রিম কার্ট বিডি ডট কম',
  'ড্রিমকার্টবিডি',
  'ড্রিমকার্ট বাংলাদেশ',
  'ড্রিম কার্ট বিডি অনলাইন',
  'ড্রিম কার্টের দোকান',
  'ড্রিম কার্ট শপ',

  // Banglish Variations
  'Dream Cart B D',
  'Dream Cart B.D.',
  'Dream Cart Bd Com',
  'Dreamcart B D',
  'Dreamcartbd Online',
  'Dream Cart Bangla',
  'Dream Cart Bangladesh Shop',
  'Dream Cart BD Online Shopping',
  'Dream Cart BD Ecommerce',
  'Dream Cart BD E-commerce',
  'Dream Cart BD Store',

  // Brand + Shopping Intent
  'Shop at Dream Cart BD',
  'Buy from Dream Cart BD',
  'Dream Cart BD Products',
  'Dream Cart BD Online Products',
  'Dream Cart BD Best Price',
  'Dream Cart BD Affordable Shopping',
  'Dream Cart BD Home Delivery',
  'Dream Cart BD Cash on Delivery',
  'Dream Cart BD Trusted Online Shop',
  'Dream Cart BD Product Collection',
  'Dream Cart BD New Arrivals',

  // Bengali Brand + Shopping Intent
  'ড্রিম কার্ট বিডি থেকে কেনাকাটা',
  'ড্রিম কার্ট বিডি অনলাইন কেনাকাটা',
  'ড্রিম কার্ট বিডি পণ্য',
  'ড্রিম কার্ট বিডি প্রোডাক্ট',
  'ড্রিম কার্ট বিডি থেকে অর্ডার',
  'ড্রিম কার্ট বিডি হোম ডেলিভারি',
  'ড্রিম কার্ট বিডি ক্যাশ অন ডেলিভারি',
  'ড্রিম কার্ট বিডি সেরা দাম',
  'ড্রিম কার্ট বিডি অনলাইন শপিং',
  'ড্রিম কার্ট বিডি বিশ্বস্ত অনলাইন শপ'
];


// Top-4 Priority Pages that MUST ALWAYS appear first in Search Options & Google Sitelinks
export const PRIORITY_SITE_PAGES = [
  {
    key: 'products',
    name: 'প্রোডাক্ট’স পেজ (Products Page)',
    shortTitle: 'প্রোডাক্ট’স পেজ',
    subtitle: 'সকল অরিজিনাল পণ্য, ক্যাটাগরি ও অফার দেখুন',
    url: `${SITE_ORIGIN}/products`,
    path: '/products',
    icon: '🛍️',
    keywords: [
      'product', 'products', 'products page', 'all products', 'shop', 'store', 'catalog', 'item', 'items',
      'প্রোডাক্ট', 'প্রোডাক্টস', 'প্রোডাক্ট’স', 'প্রোডাক্ট’স পেজ', 'প্রোডাক্টস পেজ', 'প্রোডাক্ট পেজ',
      'পণ্য', 'সকল পণ্য', 'শপ', 'ক্যাটালগ', 'কেনাকাটা', 'dream cart bd products', 'ড্রিম কার্ট বিডি প্রোডাক্ট'
    ]
  },
  {
    key: 'contact',
    name: 'কন্টাক্ট পেজ (Contact Page)',
    shortTitle: 'কন্টাক্ট পেজ',
    subtitle: 'অফিস ঠিকানা, হটলাইন (01581703822) ও হোয়াটসঅ্যাপ সাপোর্ট',
    url: `${SITE_ORIGIN}/contact`,
    path: '/contact',
    icon: '📞',
    keywords: [
      'contact', 'contact us', 'contact page', 'support', 'help', 'phone', 'hotline', 'address', 'location', 'call',
      'কন্টাক্ট', 'কন্টাক্ট পেজ', 'কন্টাক্ট করুন', 'যোগাযোগ', 'যোগাযোগ পেজ', 'ঠিকানা', 'হটলাইন', 'ফোন নাম্বার', 'কাস্টমার কেয়ার'
    ]
  },
  {
    key: 'track',
    name: 'ট্রেকিং পেজ (Tracking Page)',
    shortTitle: 'ট্রেকিং পেজ',
    subtitle: 'অর্ডার আইডি বা মোবাইল নম্বর দিয়ে পার্সেল ট্র্যাক করুন',
    url: `${SITE_ORIGIN}/track`,
    path: '/track',
    icon: '🚚',
    keywords: [
      'track', 'tracking', 'tracking page', 'track order', 'parcel track', 'order status', 'courier', 'delivery status',
      'ট্রেকিং', 'ট্রেকিং পেজ', 'ট্র্যাকিং', 'ট্র্যাকিং পেজ', 'ট্র্যাক', 'পার্সেল ট্র্যাক', 'অর্ডার ট্র্যাক', 'অর্ডার ট্র্যাকিং', 'ডেলিভারি ট্র্যাক'
    ]
  },
  {
    key: 'home',
    name: 'হোম পেজ (Home Page)',
    shortTitle: 'হোম পেজ',
    subtitle: 'Dream Cart BD (ড্রিম কার্ট বিডি) — মূল হোমপেজ',
    url: `${SITE_ORIGIN}/`,
    path: '/',
    icon: '🏠',
    keywords: [
      'home', 'homepage', 'home page', 'main page', 'index',
      'হোম', 'হোম পেজ', 'হোমপেজ', 'মূল পাতা', 'প্রথম পাতা'
    ]
  }
];

export const ROUTE_SEO_MAP = {
  '/': {
    title: 'Dream Cart BD (ড্রিম কার্ট বিডি) — প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ ও হোম পেজ | dreamcartbd',
    description: 'Dream Cart BD (ড্রিম কার্ট বিডি / dreamcartbd / dream cart bd) বাংলাদেশের বিশ্বস্ত স্মার্ট ই-কমার্স প্ল্যাটফর্ম। প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ ও হোম পেজ থেকে স্মার্টওয়াচ, অর্গানিক ফুড, কিচেন গ্যাজেট ও হোম অ্যাপ্লায়েন্স সারা দেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।',
    keywords: 'dream cart bd, DREAM CART BD, Dream Cart BD, dreamcartbd, dreamcart bd, ড্রিম কার্ট বিডি, ড্রিমকার্ট বিডি, ড্রিম কার্ট বি.ডি, ড্রিম কার্ট, প্রোডাক্ট’স পেজ, প্রোডাক্টস পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ, ট্র্যাকিং পেজ, হোম পেজ, products page, contact page, tracking page, home page, online shopping bangladesh, smartwatch bd, মধু, ঘড়ি, গ্যাস সেফটি ডিভাইস'
  },
  '/products': {
    title: 'প্রোডাক্ট’স পেজ (All Products) — Dream Cart BD | ড্রিম কার্ট বিডি (dreamcartbd)',
    description: 'Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd)-এর প্রোডাক্ট’স পেজ: সকল অরিজিনাল প্রোডাক্ট, স্মার্টওয়াচ, কিচেন সেফটি ডিভাইস, অর্গানিক মধু ও হোম অ্যাপ্লায়েন্স সাশ্রয়ী মূল্যে অর্ডার করুন।',
    keywords: 'প্রোডাক্ট’স পেজ, প্রোডাক্টস পেজ, প্রোডাক্ট পেজ, সকল পণ্য, products page, all products, dream cart bd products, dreamcartbd products, ড্রিম কার্ট বিডি প্রোডাক্ট'
  },
  '/contact': {
    title: 'কন্টাক্ট পেজ (Contact Us) — Dream Cart BD | ড্রিম কার্ট বিডি (dreamcartbd)',
    description: 'Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd) কন্টাক্ট পেজ ও কাস্টমার কেয়ার: চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০। হটলাইন: 01581703822, 01818273838।',
    keywords: 'কন্টাক্ট পেজ, কন্টাক্ট করুন, যোগাযোগ পেজ, contact page, contact us, dream cart bd contact, dreamcartbd contact, ড্রিম কার্ট বিডি ঠিকানা ও হটলাইন'
  },
  '/track': {
    title: 'ট্রেকিং পেজ (Track Order) — Dream Cart BD | ড্রিম কার্ট বিডি (dreamcartbd)',
    description: 'Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd) ট্রেকিং পেজ: আপনার অর্ডার আইডি বা মোবাইল নম্বর দিয়ে রিয়েল-টাইমে আপনার পার্সেল ও কুরিয়ার ডেলিভারি স্ট্যাটাস ট্র্যাক করুন।',
    keywords: 'ট্রেকিং পেজ, ট্র্যাকিং পেজ, পার্সেল ট্র্যাক করুন, অর্ডার ট্র্যাকিং, tracking page, track order, dream cart bd track, dreamcartbd tracking, ড্রিম কার্ট বিডি ট্র্যাকিং'
  },
  '/tracking': {
    title: 'ট্রেকিং পেজ (Live Order Tracking) — Dream Cart BD | ড্রিম কার্ট বিডি',
    description: 'অর্ডার আইডি বা মোবাইল নম্বর দিয়ে লাইভ অর্ডার স্ট্যাটাস ও ডিজিটাল ভাউচার দেখুন — Dream Cart BD।',
    keywords: 'ট্রেকিং পেজ, ট্র্যাকিং পেজ, Order Tracking Dream Cart BD, dreamcartbd track'
  },
  '/categories': {
    title: 'সকল ক্যাটাগরি সমূহ (All Categories) — Dream Cart BD | ড্রিম কার্ট বিডি',
    description: 'ক্যাটাগরি ওয়াইজ সকল পণ্য দেখুন: Smartwatches, Kitchen, Organic & Health, Home Appliances, Medicine & Healthcare, Stationery — Dream Cart BD।',
    keywords: 'Dream Cart BD Categories, ক্যাটাগরি সমূহ, ড্রিম কার্ট বিডি ক্যাটাগরি, dreamcartbd categories'
  },
  '/brands': {
    title: 'অফিসিয়াল ব্র্যান্ড সমূহ (Featured Brands) — Dream Cart BD | ড্রিম কার্ট বিডি',
    description: 'Amazfit, Kieslect, Dream Organic, HK এবং শীর্ষস্থানীয় সকল অফিসিয়াল ব্র্যান্ডের ১০০% আসল পণ্য — Dream Cart BD।',
    keywords: 'Dream Cart BD Brands, Amazfit BD, Kieslect BD, Dream Organic, ব্র্যান্ড সমূহ'
  },
  '/customer/login': {
    title: 'কাস্টমার লগইন (Customer Login) — Dream Cart BD | ড্রিম কার্ট বিডি',
    description: 'Dream Cart BD কাস্টমার পোর্টালে লগইন করুন। আপনার অর্ডার ট্র্যাকিং, ভাউচার ডাউনলোড ও বিশেষ ডিসকাউন্ট উপভোগ করুন।',
    keywords: 'Customer Login Dream Cart BD, কাস্টমার লগইন, ড্রিম কার্ট বিডি লগইন'
  },
  '/customer/register': {
    title: 'কাস্টমার রেজিস্ট্রেশন (Customer Register) — Dream Cart BD | ড্রিম কার্ট বিডি',
    description: 'Dream Cart BD-তে নতুন কাস্টমার অ্যাকাউন্ট খুলুন এবং দ্রুত চেকআউট ও ক্যাশব্যাক অফার উপভোগ করুন।',
    keywords: 'Customer Register Dream Cart BD, কাস্টমার নিবন্ধন'
  },
  '/reseller/login': {
    title: 'রিসেলার লগইন (Reseller Login) — Dream Cart BD | ড্রিম কার্ট বিডি',
    description: 'বিনা পুঁজিতে ড্রপশিপিং ও রিসেলিং ব্যবসা! Dream Cart BD রিসেলার পোর্টালে লগইন করে কমিশন ও অর্ডার পরিচালনা করুন।',
    keywords: 'Reseller Login Dream Cart BD, রিসেলার লগইন, ড্রপশিপিং বাংলাদেশ, ড্রিম কার্ট বিডি রিসেলার'
  },
  '/wholesaler/login': {
    title: 'হোলসেলার লগইন (Wholesaler Login) — Dream Cart BD | ড্রিম কার্ট বিডি',
    description: 'সরাসরি আমদানিকারক রেটে পাইকারি পণ্য ক্রয় করতে Dream Cart BD হোলসেলার পোর্টালে লগইন করুন।',
    keywords: 'Wholesaler Login Dream Cart BD, হোলসেলার লগইন, পাইকারি মার্কেট বাংলাদেশ, ড্রিম কার্ট বিডি হোলসেল'
  },
  '/offers': {
    title: 'বিশেষ অফার ও ডিসকাউন্ট (Offers & Coupons) — Dream Cart BD | ড্রিম কার্ট বিডি',
    description: 'Dream Cart BD-এর মেগা ফ্ল্যাশ সেল, কুপন ডিসকাউন্ট, ফ্রি হোম ডেলিভারি ও ৫% অনলাইন পেমেন্ট ছাড় দেখুন।',
    keywords: 'Dream Cart BD Offers, বিশেষ অফার, ডিসকাউন্ট কুপন'
  },
  '/landing': {
    title: 'স্পেশাল ক্যাম্পেইন অফার — সীমিত সময়ের মেগা ডিসকাউন্ট | Dream Cart BD',
    description: 'বিশেষ অফার মূল্যে এখনই অর্ডার করুন! সারা বাংলাদেশে দ্রুত ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা।',
    keywords: 'Dream Cart BD Campaign, Landing Page Offer, ক্যাশ অন ডেলিভারি অফার'
  },
  '/dcitbd': {
    title: 'আইটি সার্ভিসেস (IT Services) — Dream Career IT BD | Dream Cart BD',
    description: 'ওয়েব ডেভেলপমেন্ট, ই-কমার্স অটোমেশন, সফটওয়্যার সলিউশন ও ২৪/৭ টেকনিক্যাল আইটি সার্ভিসেস — Dream Career IT Bangladesh (DCITBD)।',
    keywords: 'IT Services Dream Cart BD, আইটি সার্ভিসেস, Dream Career IT BD, DCITBD'
  },
  '/education': {
    title: 'শিখুন ও ক্যারিয়ার গড়ুন (Learn & Build Career) — Dream Cart BD',
    description: 'ডিজিটাল স্কিল ডেভেলপমেন্ট, ফ্রিল্যান্সিং, ই-কমার্স বিজনেস ও আইটি প্রশিক্ষণের মাধ্যমে নিজের উজ্জ্বল ক্যারিয়ার গড়ুন — Dream Cart BD।',
    keywords: 'শিখুন ও ক্যারিয়ার গড়ুন, Education Dream Cart BD, ফ্রিল্যান্সিং ও আইটি প্রশিক্ষণ'
  }
};

function setOrCreateMeta(attrName, attrVal, contentVal) {
  if (typeof document === 'undefined' || !contentVal) return;
  let el = document.head.querySelector(`meta[${attrName}="${attrVal}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(contentVal));
}

function setOrCreateLink(relVal, hrefVal, extraAttrs = {}) {
  if (typeof document === 'undefined' || !hrefVal) return;
  const selector = extraAttrs.sizes
    ? `link[rel="${relVal}"][sizes="${extraAttrs.sizes}"]`
    : `link[rel="${relVal}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', relVal);
    document.head.appendChild(el);
  }
  el.setAttribute('href', hrefVal);
  Object.entries(extraAttrs).forEach(([k, v]) => el.setAttribute(k, v));
}

/**
 * Enforces official /public/icon/logo.png and crisp multi-size favicons in <head>
 */
export function ensureOfficialBrandIconsInHead() {
  if (typeof document === 'undefined') return;
  const b = (typeof window !== 'undefined' && window.__APP_BASE__) ? window.__APP_BASE__ : '';
  setOrCreateLink('icon', `${b}/favicon.ico`, { type: 'image/x-icon' });
  setOrCreateLink('shortcut icon', `${b}/favicon.ico`, { type: 'image/x-icon' });
  setOrCreateLink('icon', `${b}/public/icon/favicon-48x48.png`, { type: 'image/png', sizes: '48x48' });
  setOrCreateLink('icon', `${b}/public/icon/favicon-32x32.png`, { type: 'image/png', sizes: '32x32' });
  setOrCreateLink('icon', `${b}/public/icon/favicon-16x16.png`, { type: 'image/png', sizes: '16x16' });
  setOrCreateLink('icon', `${b}/public/icon/icon-192.png`, { type: 'image/png', sizes: '192x192' });
  setOrCreateLink('apple-touch-icon', `${b}/public/icon/apple-touch-icon.png`, { sizes: '180x180' });
  setOrCreateLink('manifest', `${b}/public/manifest.webmanifest`);
}

/**
 * Builds the comprehensive JSON-LD @graph for Google Search Sitelinks:
 * Strictly places ১. প্রোডাক্ট’স পেজ, ২. কন্টাক্ট পেজ, ৩. ট্রেকিং পেজ, ৪. হোম পেজ FIRST!
 */
export function buildMasterStructuredDataGraph(products = [], categories = [], currentProduct = null, currentCategory = null) {
  // Top 4 Priority Pages MUST be Positions 1, 2, 3, 4 for Google Search Sitelinks
  const sitelinks = [
    { name: 'প্রোডাক্ট’স পেজ (Products Page)', url: `${SITE_ORIGIN}/products`, description: 'Dream Cart BD (ড্রিম কার্ট বিডি)-এর সকল অরিজিনাল প্রোডাক্ট ও অফার পেজ।' },
    { name: 'কন্টাক্ট পেজ (Contact Page)', url: `${SITE_ORIGIN}/contact`, description: 'Dream Cart BD অফিস ঠিকানা ও ২৪/৭ হটলাইন (01581703822, 01818273838)।' },
    { name: 'ট্রেকিং পেজ (Tracking Page)', url: `${SITE_ORIGIN}/track`, description: 'অর্ডার আইডি বা মোবাইল নম্বর দিয়ে পার্সেল ও ডেলিভারি লাইভ ট্র্যাক করুন।' },
    { name: 'হোম পেজ (Home Page)', url: `${SITE_ORIGIN}/`, description: 'Dream Cart BD (ড্রিম কার্ট বিডি) অফিসিয়াল হোম পেজ।' },
    { name: 'সকল ক্যাটাগরি (All Categories)', url: `${SITE_ORIGIN}/categories`, description: 'ক্যাটাগরি ওয়াইজ সকল পণ্য ব্রাউজ করুন।' },
    { name: 'বিশেষ অফার (Offers & Coupons)', url: `${SITE_ORIGIN}/offers`, description: 'ডিসকাউন্ট কুপন ও ফ্ল্যাশ সেল অফার।' },
    { name: 'কাস্টমার লগইন (Customer Login)', url: `${SITE_ORIGIN}/customer/login`, description: 'কাস্টমার ড্যাশবোর্ড ও অর্ডার হিস্ট্রি।' },
    { name: 'রিসেলার লগইন (Reseller Login)', url: `${SITE_ORIGIN}/reseller/login`, description: 'রিসেলার ও ড্রপশিপিং পোর্টাল।' },
    { name: 'হোলসেলার লগইন (Wholesaler Login)', url: `${SITE_ORIGIN}/wholesaler/login`, description: 'পাইকারি ক্রয় ও হোলসেল পোর্টাল।' },
    { name: 'আইটি সার্ভিসেস (IT Services)', url: `${SITE_ORIGIN}/dcitbd`, description: 'Dream Career IT BD টেকনিক্যাল সার্ভিসেস।' }
  ];

  const defaultCats = [
    { category: 'Smartwatches', category_image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80' },
    { category: 'Kitchen', category_image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80' },
    { category: 'Organic & Health', category_image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&q=80' },
    { category: 'Home Appliances', category_image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80' },
    { category: 'Medicine & Healthcare', category_image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80' },
    { category: 'Stationery', category_image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80' }
  ];

  const catSource = (Array.isArray(categories) && categories.length > 0) ? categories : defaultCats;
  const seenCatNames = new Set();
  const categoryListItems = [];
  catSource.forEach((c) => {
    const cName = String(c.category || c.Category || c.name || '').trim();
    if (!cName || seenCatNames.has(cName.toLowerCase())) return;
    seenCatNames.add(cName.toLowerCase());
    const cImg = c.category_image || c.image || OFFICIAL_LOGO_URL;
    const absImg = cImg.startsWith('http') ? cImg : `${SITE_ORIGIN}${cImg.startsWith('/') ? '' : '/'}${cImg}`;
    categoryListItems.push({
      '@type': 'ListItem',
      position: categoryListItems.length + 1,
      item: {
        '@type': 'CollectionPage',
        name: `${cName} — Dream Cart BD`,
        url: `${SITE_ORIGIN}/products?cat=${encodeURIComponent(cName)}`,
        image: absImg,
        description: `Dream Cart BD (ড্রিম কার্ট বিডি) থেকে সেরা মানের ${cName} ক্যাটাগরির সকল পণ্য দেখুন ও অর্ডার করুন।`
      }
    });
  });

  const graph = [
    {
      '@type': ['Organization', 'OnlineStore'],
      '@id': `${SITE_ORIGIN}/#organization`,
      name: 'Dream Cart BD',
      alternateName: BRAND_SEARCH_ALIASES,
      url: `${SITE_ORIGIN}/`,
      logo: {
        '@type': 'ImageObject',
        '@id': `${SITE_ORIGIN}/#logo`,
        url: OFFICIAL_LOGO_URL,
        contentUrl: OFFICIAL_LOGO_URL,
        width: 832,
        height: 832,
        caption: 'Dream Cart BD Official Logo'
      },
      image: [OFFICIAL_LOGO_URL, OFFICIAL_OG_BANNER],
      description: 'Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd / dreamcartbd) বাংলাদেশের অন্যতম বিশ্বস্ত স্মার্ট ডিজিটাল ই-কমার্স, রিসেলার ও হোলসেল মার্কেটপ্লেস। প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ ও হোম পেজ।',
      telephone: '+8801581703822',
      email: 'jainal.dcitbd@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ',
        addressLocality: 'কুমিল্লা',
        postalCode: '3500',
        addressCountry: 'BD'
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+8801581703822',
          contactType: 'customer service',
          url: `${SITE_ORIGIN}/contact`,
          areaServed: 'BD',
          availableLanguage: ['Bengali', 'English']
        },
        {
          '@type': 'ContactPoint',
          telephone: '+8801818273838',
          contactType: 'sales',
          url: `${SITE_ORIGIN}/contact`,
          areaServed: 'BD',
          availableLanguage: ['Bengali', 'English']
        }
      ],
      sameAs: [
        'https://www.facebook.com/dreamcartbd',
        'https://dcitbd.github.io/dcitbd/'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: 'Dream Cart BD — ড্রিম কার্ট বিডি (dream cart bd)',
      alternateName: BRAND_SEARCH_ALIASES,
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      inLanguage: ['bn-BD', 'en-US'],
      hasPart: [
        { '@type': 'CollectionPage', '@id': `${SITE_ORIGIN}/products#webpage`, name: 'প্রোডাক্ট’স পেজ (Products Page)', url: `${SITE_ORIGIN}/products` },
        { '@type': 'ContactPage', '@id': `${SITE_ORIGIN}/contact#webpage`, name: 'কন্টাক্ট পেজ (Contact Page)', url: `${SITE_ORIGIN}/contact` },
        { '@type': 'WebPage', '@id': `${SITE_ORIGIN}/track#webpage`, name: 'ট্রেকিং পেজ (Tracking Page)', url: `${SITE_ORIGIN}/track` },
        { '@type': 'WebPage', '@id': `${SITE_ORIGIN}/#webpage`, name: 'হোম পেজ (Home Page)', url: `${SITE_ORIGIN}/` }
      ],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_ORIGIN}/products?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE_ORIGIN}/#sitelinks`,
      name: 'Dream Cart BD Main Navigation Sitelinks (প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ, হোম পেজ)',
      itemListElement: sitelinks.map((s, idx) => ({
        '@type': 'SiteNavigationElement',
        position: idx + 1,
        name: s.name,
        description: s.description,
        url: s.url
      }))
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE_ORIGIN}/#priority-breadcrumbs`,
      name: 'Dream Cart BD Priority Pages',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'প্রোডাক্ট’স পেজ (Products)', item: `${SITE_ORIGIN}/products` },
        { '@type': 'ListItem', position: 2, name: 'কন্টাক্ট পেজ (Contact)', item: `${SITE_ORIGIN}/contact` },
        { '@type': 'ListItem', position: 3, name: 'ট্রেকিং পেজ (Tracking)', item: `${SITE_ORIGIN}/track` },
        { '@type': 'ListItem', position: 4, name: 'হোম পেজ (Home)', item: `${SITE_ORIGIN}/` }
      ]
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE_ORIGIN}/#categories`,
      name: 'Dream Cart BD Product Categories (ক্যাটাগরি সমূহ)',
      itemListElement: categoryListItems
    }
  ];

  if (currentProduct && (currentProduct.name || currentProduct.p_name)) {
    const pName = currentProduct.name || currentProduct.p_name;
    const pSlug = currentProduct.slug || currentProduct.sku || currentProduct.product_id || '';
    const pPrice = Number(currentProduct.selling_price || currentProduct.price || 0);
    const pStock = Number(currentProduct.stock !== undefined ? currentProduct.stock : 25);
    const pThumb = currentProduct.thumbnail || (Array.isArray(currentProduct.images) && currentProduct.images[0]) || OFFICIAL_OG_BANNER;
    const absThumb = pThumb.startsWith('http') ? pThumb : `${SITE_ORIGIN}${pThumb.startsWith('/') ? '' : '/'}${pThumb}`;

    graph.push({
      '@type': 'Product',
      '@id': `${SITE_ORIGIN}/product/${encodeURIComponent(pSlug)}#product`,
      name: pName,
      sku: String(currentProduct.sku || currentProduct.product_id || 'DCBD-ITEM'),
      mpn: String(currentProduct.sku || currentProduct.product_id || 'DCBD-ITEM'),
      image: Array.isArray(currentProduct.images) && currentProduct.images.length > 0 ? currentProduct.images : [absThumb],
      description: currentProduct.description || `${pName} — এখনই অর্ডার করুন Dream Cart BD (ড্রিম কার্ট বিডি) থেকে। সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি।`,
      category: currentProduct.category || 'General',
      brand: {
        '@type': 'Brand',
        name: currentProduct.brand || 'Dream Cart BD'
      },
      offers: {
        '@type': 'Offer',
        url: `${SITE_ORIGIN}/product/${encodeURIComponent(pSlug)}`,
        priceCurrency: 'BDT',
        price: String(pPrice),
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: pStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
        seller: {
          '@type': 'Organization',
          name: 'Dream Cart BD'
        }
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(currentProduct.rating || '4.9'),
        reviewCount: String(currentProduct.reviews_count || '28')
      }
    });
  } else if (Array.isArray(products) && products.length > 0) {
    const catalogSample = products.slice(0, 60);
    graph.push({
      '@type': 'ItemList',
      '@id': `${SITE_ORIGIN}/#catalog-products`,
      name: currentCategory ? `${currentCategory} Products — Dream Cart BD` : 'Dream Cart BD Featured Products Catalog',
      itemListElement: catalogSample.map((p, idx) => {
        const pName = p.name || p.p_name || 'Product';
        const pSlug = p.slug || p.sku || p.product_id || `item-${idx + 1}`;
        const pPrice = Number(p.selling_price || 0);
        const pStock = Number(p.stock !== undefined ? p.stock : 20);
        const pThumb = p.thumbnail || (Array.isArray(p.images) && p.images[0]) || OFFICIAL_OG_BANNER;
        const absThumb = pThumb.startsWith('http') ? pThumb : `${SITE_ORIGIN}${pThumb.startsWith('/') ? '' : '/'}${pThumb}`;
        return {
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Product',
            name: pName,
            sku: String(p.sku || p.product_id || `DCBD-${idx + 1}`),
            url: `${SITE_ORIGIN}/product/${encodeURIComponent(pSlug)}`,
            image: absThumb,
            description: p.description || `${pName} — Dream Cart BD (ড্রিম কার্ট বিডি) থেকে সাশ্রয়ী মূল্যে কিনুন।`,
            brand: { '@type': 'Brand', name: p.brand || 'Dream Cart BD' },
            offers: {
              '@type': 'Offer',
              url: `${SITE_ORIGIN}/product/${encodeURIComponent(pSlug)}`,
              priceCurrency: 'BDT',
              price: String(pPrice),
              availability: pStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition'
            }
          }
        };
      })
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

/**
 * Dynamically updates <head> Title, Meta tags, OpenGraph tags, Product Ad Microdata & JSON-LD Schema
 */
export function updateDynamicPageSeoAndSchema({
  path = '/',
  params = {},
  product = null,
  products = [],
  categories = []
} = {}) {
  if (typeof document === 'undefined') return;
  ensureOfficialBrandIconsInHead();
  installUniversalBilingualSearchEngine();

  const cleanPath = String(path || '/').replace(/\/+$/, '') || '/';
  const canonicalUrl = `${SITE_ORIGIN}${cleanPath === '/' ? '/' : cleanPath}${params.cat ? `?cat=${encodeURIComponent(params.cat)}` : ''}`;

  let pageTitle = ROUTE_SEO_MAP[cleanPath]?.title || 'Dream Cart BD (ড্রিম কার্ট বিডি) — প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ ও হোম পেজ';
  let pageDesc = ROUTE_SEO_MAP[cleanPath]?.description || ROUTE_SEO_MAP['/'].description;
  let pageKeywords = ROUTE_SEO_MAP[cleanPath]?.keywords || ROUTE_SEO_MAP['/'].keywords;
  let ogImage = OFFICIAL_OG_BANNER;
  let ogType = 'website';

  if (product && (product.name || product.p_name)) {
    const pName = product.name || product.p_name;
    const pPrice = Number(product.selling_price || 0);
    const pBrand = product.brand || 'Dream Cart BD';
    const pCat = product.category || 'Smart Gadgets';
    const pSku = product.sku || product.product_id || 'DCBD-ITEM';
    const pStock = Number(product.stock !== undefined ? product.stock : 25);

    pageTitle = `${pName} — ৳${pPrice.toLocaleString('bn-BD')} | Dream Cart BD (ড্রিম কার্ট বিডি)`;
    pageDesc = `${pName} কিনুন মাত্র ৳${pPrice} টাকায় Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd) থেকে। ব্র্যান্ড: ${pBrand} | ক্যাটাগরি: ${pCat} | সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি।`;
    pageKeywords = `${pName}, ${String(pName).toLowerCase()}, ${pSku}, ${String(pSku).toLowerCase()}, ${pBrand}, ${pCat}, dream cart bd, Dream Cart BD, ড্রিম কার্ট বিডি, প্রোডাক্ট’স পেজ`;
    const rawImg = product.thumbnail || (Array.isArray(product.images) && product.images[0]) || OFFICIAL_OG_BANNER;
    ogImage = rawImg.startsWith('http') ? rawImg : `${SITE_ORIGIN}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
    ogType = 'product';

    setOrCreateMeta('property', 'product:brand', pBrand);
    setOrCreateMeta('property', 'product:availability', pStock > 0 ? 'in stock' : 'available for order');
    setOrCreateMeta('property', 'product:condition', 'new');
    setOrCreateMeta('property', 'product:price:amount', String(pPrice));
    setOrCreateMeta('property', 'product:price:currency', 'BDT');
    setOrCreateMeta('property', 'product:retailer_item_id', String(pSku));
    setOrCreateMeta('property', 'product:item_group_id', String(pCat));
  } else if (params.cat) {
    const catName = String(params.cat).trim();
    pageTitle = `${catName} ক্যাটাগরির সকল পণ্য — প্রোডাক্ট’স পেজ | Dream Cart BD (ড্রিম কার্ট বিডি)`;
    pageDesc = `Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd)-তে ${catName} ক্যাটাগরির সকল অরিজিনাল পণ্য, অফার ও পাইকারি/খুচরা মূল্য তালিকা দেখুন।`;
    pageKeywords = `${catName}, ${catName.toLowerCase()}, ${catName} price in bd, dream cart bd ${catName.toLowerCase()}, ড্রিম কার্ট বিডি, প্রোডাক্ট’স পেজ`;
    const matchedCat = (categories || []).find(c => String(c.category || '').toLowerCase() === catName.toLowerCase());
    if (matchedCat && matchedCat.category_image) {
      ogImage = matchedCat.category_image.startsWith('http')
        ? matchedCat.category_image
        : `${SITE_ORIGIN}${matchedCat.category_image.startsWith('/') ? '' : '/'}${matchedCat.category_image}`;
    }
  } else if (params.search) {
    const q = String(params.search).trim();
    pageTitle = `"${q}" সার্চ ফলাফল — প্রোডাক্ট’স পেজ | Dream Cart BD (ড্রিম কার্ট বিডি)`;
    pageDesc = `Dream Cart BD (ড্রিম কার্ট বিডি / dream cart bd)-তে "${q}" এর সকল প্রোডাক্ট, কন্টাক্ট পেজ ও ট্রেকিং পেজ দেখুন।`;
  }

  document.title = pageTitle;
  setOrCreateLink('canonical', canonicalUrl);
  setOrCreateMeta('name', 'description', pageDesc);
  setOrCreateMeta('name', 'keywords', pageKeywords);
  setOrCreateMeta('name', 'robots', cleanPath.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');

  // OpenGraph (WhatsApp, Facebook, Instagram, Messenger)
  setOrCreateMeta('property', 'og:site_name', 'Dream Cart BD (ড্রিম কার্ট বিডি)');
  setOrCreateMeta('property', 'og:type', ogType);
  setOrCreateMeta('property', 'og:title', pageTitle);
  setOrCreateMeta('property', 'og:description', pageDesc);
  setOrCreateMeta('property', 'og:url', canonicalUrl);
  setOrCreateMeta('property', 'og:image', ogImage);
  setOrCreateMeta('property', 'og:image:secure_url', ogImage);
  setOrCreateMeta('property', 'og:image:width', '1200');
  setOrCreateMeta('property', 'og:image:height', '630');
  setOrCreateMeta('property', 'og:image:alt', pageTitle);
  setOrCreateMeta('property', 'og:locale', 'bn_BD');

  // Twitter / X & TikTok Cards
  setOrCreateMeta('name', 'twitter:card', 'summary_large_image');
  setOrCreateMeta('name', 'twitter:title', pageTitle);
  setOrCreateMeta('name', 'twitter:description', pageDesc);
  setOrCreateMeta('name', 'twitter:image', ogImage);

  // Inject / Update JSON-LD Structured Data
  let ldScript = document.getElementById('dcbd-dynamic-jsonld');
  if (!ldScript) {
    ldScript = document.createElement('script');
    ldScript.id = 'dcbd-dynamic-jsonld';
    ldScript.type = 'application/ld+json';
    document.head.appendChild(ldScript);
  }
  const graphObj = buildMasterStructuredDataGraph(products, categories, product, params.cat || null);
  ldScript.textContent = JSON.stringify(graphObj);
}

// ============================================================================
// UNIVERSAL CASE-INSENSITIVE (LOWERCASE & UPPERCASE) + BENGALI SEARCH ENGINE
// & TOP-4 PRIORITY PAGES IN SITE SEARCH BAR (#global-search-input & #mobile-search-input)
// ============================================================================

const BILINGUAL_EXPANDED_DICTIONARY = {
  // Watches & Smartwatches
  'watch': ['smartwatch', 'smart watch', 'clock', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ', 'ওয়াচ', 'ওয়াচ', 'amazfit', 'kieslect', 'gts', 'kr'],
  'watches': ['watch', 'smartwatch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ'],
  'smartwatch': ['watch', 'smart watch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ', 'amazfit', 'kieslect'],
  'ghori': ['watch', 'smartwatch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ'],
  'gori': ['watch', 'smartwatch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ'],
  'ঘড়ি': ['watch', 'smartwatch', 'clock', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ', 'ওয়াচ', 'ওয়াচ', 'amazfit', 'kieslect'],
  'ঘড়ি': ['watch', 'smartwatch', 'clock', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ', 'ওয়াচ', 'ওয়াচ', 'amazfit', 'kieslect'],
  'স্মার্টওয়াচ': ['smartwatch', 'watch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'amazfit', 'kieslect'],
  'স্মার্টওয়াচ': ['smartwatch', 'watch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'amazfit', 'kieslect'],
  'ওয়াচ': ['watch', 'smartwatch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ'],
  'ওয়াচ': ['watch', 'smartwatch', 'ঘড়ি', 'ঘড়ি', 'স্মার্টওয়াচ', 'স্মার্টওয়াচ'],
  'amazfit': ['অ্যামাজফিট', 'আমাজফিট', 'gts', 'gts 4', 'smartwatch', 'ঘড়ি', 'ঘড়ি'],
  'অ্যামাজফিট': ['amazfit', 'gts', 'smartwatch'],
  'আমাজফিট': ['amazfit', 'gts', 'smartwatch'],
  'kieslect': ['কিসলেক্ট', 'ks pro', 'kr pro', 'smartwatch', 'ঘড়ি', 'ঘড়ি'],
  'কিসলেক্ট': ['kieslect', 'smartwatch'],

  // Organic, Honey & Chia Seeds
  'honey': ['মধু', 'modhu', 'sundarban', 'সুন্দরবন', 'organic', 'অর্গানিক'],
  'modhu': ['মধু', 'honey', 'সুন্দরবন', 'organic'],
  'মধু': ['honey', 'modhu', 'সুন্দরবন', 'sundarban', 'organic', 'অর্গানিক', 'খাঁটি মধু', 'চাকের মধু'],
  'সুন্দরবন': ['sundarban', 'honey', 'মধু'],
  'sundarban': ['সুন্দরবন', 'honey', 'মধু'],
  'chia': ['চিয়া', 'চিয়া', 'সিড', 'seed', 'seeds', 'organic', 'অর্গানিক'],
  'seed': ['chia', 'seeds', 'চিয়া', 'চিয়া', 'সিড', 'বীজ'],
  'seeds': ['chia', 'seed', 'চিয়া', 'চিয়া', 'সিড', 'বীজ'],
  'চিয়া': ['chia', 'চিয়া', 'seed', 'seeds', 'সিড', 'অর্গানিক'],
  'চিয়া': ['chia', 'চিয়া', 'seed', 'seeds', 'সিড', 'অর্গানিক'],
  'সিড': ['seed', 'seeds', 'chia', 'চিয়া', 'চিয়া'],
  'অর্গানিক': ['organic', 'মধু', 'honey', 'চিয়া', 'chia', 'health'],
  'organic': ['অর্গানিক', 'মধু', 'honey', 'চিয়া', 'chia', 'health'],

  // Kitchen & Gas Safety
  'gas': ['গ্যাস', 'সেফটি', 'রেগুলেটর', 'safety', 'regulator', 'device', 'kitchen', 'কিচেন'],
  'গ্যাস': ['gas', 'safety', 'regulator', 'সেফটি', 'রেগুলেটর', 'ডিভাইস', 'লিকেজ', 'কিচেন', 'kitchen'],
  'সেফটি': ['safety', 'gas', 'গ্যাস', 'ডিভাইস', 'device'],
  'safety': ['সেফটি', 'gas', 'গ্যাস', 'device', 'ডিভাইস'],
  'রেগুলেটর': ['regulator', 'gas', 'গ্যাস', 'সেফটি'],
  'regulator': ['রেগুলেটর', 'gas', 'গ্যাস', 'safety'],
  'কিচেন': ['kitchen', 'gas', 'গ্যাস', 'রান্নাঘর'],
  'kitchen': ['কিচেন', 'gas', 'গ্যাস', 'রান্নাঘর'],

  // Flashlight, Torch & Home Appliances
  'light': ['লাইট', 'টর্চ', 'ফ্ল্যাশলাইট', 'torch', 'flashlight', 'led', 'লণ্ঠন', 'মিলিটারি'],
  'torch': ['টর্চ', 'লাইট', 'ফ্ল্যাশলাইট', 'flashlight', 'light', 'মিলিটারি'],
  'flashlight': ['ফ্ল্যাশলাইট', 'টর্চ', 'লাইট', 'torch', 'light', 'মিলিটারি'],
  'লাইট': ['light', 'torch', 'flashlight', 'টর্চ', 'ফ্ল্যাশলাইট', 'লণ্ঠন', 'মিলিটারি'],
  'টর্চ': ['torch', 'flashlight', 'light', 'লাইট', 'ফ্ল্যাশলাইট', 'মিলিটারি'],
  'ফ্ল্যাশলাইট': ['flashlight', 'torch', 'light', 'লাইট', 'টর্চ', 'মিলিটারি'],
  'মিলিটারি': ['military', 'flashlight', 'torch', 'ফ্ল্যাশলাইট', 'টর্চ', 'লাইট']
};

/**
 * Normalizes any English (lowercase/uppercase) or Bengali text into a uniform comparable string
 */
export function normalizeBilingualText(input) {
  if (!input) return '';
  let s = String(input);
  try {
    if (typeof s.normalize === 'function') s = s.normalize('NFC');
  } catch (e) {}
  return s
    .toLowerCase()
    // Normalize Bengali nukta & variant characters so ড়/ড়, ঢ়/ঢ়, য়/য়, ৎ/ত always match
    .replace(/\u09A1\u09BC/g, 'ড়')
    .replace(/\u09DC/g, 'ড়')
    .replace(/\u09A2\u09BC/g, 'ঢ়')
    .replace(/\u09DD/g, 'ঢ়')
    .replace(/\u09AF\u09BC/g, 'য়')
    .replace(/\u09DF/g, 'য়')
    // Convert Bengali digits ০-৯ to 0-9
    .replace(/[০-৯]/g, d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
    // Strip apostrophes/quotes inside words (e.g. প্রোডাক্ট’স -> প্রোডাক্টস)
    .replace(/['’‘`]/g, '')
    .replace(/[,\-_—–/\\()|:;!?.+\[\]"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matches the user query against the Top-4 Priority Site Pages (প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ, হোম পেজ)
 * Always returns all 4 pages, sorted with the best-matching page(s) first!
 */
export function getPrioritizedSitePagesForQuery(rawQuery = '') {
  const qNorm = normalizeBilingualText(rawQuery);
  const qNoSpace = qNorm.replace(/\s+/g, '');

  const scoredPages = PRIORITY_SITE_PAGES.map((page, index) => {
    let score = 100 - index * 5; // Default priority order: 1. Products, 2. Contact, 3. Tracking, 4. Home
    if (qNorm && !isBrandOrAllProductsQuery(qNorm) || ["product","products","products page","প্রোডাক্ট","প্রোডাক্টস","প্রোডাক্টস পেজ","পণ্য","সকল পণ্য","contact","contact page","contact us","কন্টাক্ট","কন্টাক্ট পেজ","যোগাযোগ","যোগাযোগ পেজ","track","tracking","tracking page","track order","ট্রেকিং","ট্রেকিং পেজ","ট্র্যাকিং","ট্র্যাকিং পেজ","অর্ডার ট্র্যাক","home","home page","homepage","হোম","হোম পেজ","হোমপেজ","মূল পাতা"].includes(qNorm)) {
      const titleNorm = normalizeBilingualText(page.name + ' ' + page.shortTitle + ' ' + page.subtitle);
      if (titleNorm.includes(qNorm)) {
        score += 500;
      }
      for (const kw of page.keywords) {
        const kwNorm = normalizeBilingualText(kw);
        const kwNoSpace = kwNorm.replace(/\s+/g, '');
        if (kwNorm === qNorm || kwNoSpace === qNoSpace) {
          score += 1000;
          break;
        } else if (kwNorm.startsWith(qNorm) || qNorm.includes(kwNorm) || kwNorm.includes(qNorm)) {
          score += 400;
        }
      }
    }
    return { ...page, _pageScore: score, _isMatched: score >= 200 };
  });

  scoredPages.sort((a, b) => b._pageScore - a._pageScore);
  return scoredPages;
}

/**
 * Checks if a query is a general brand/site/all-products query (e.g. "dream cart bd", "ড্রিম কার্ট বিডি", "products", "প্রোডাক্ট")
 */
export function isBrandOrAllProductsQuery(rawQuery = '') {
  const qNorm = normalizeBilingualText(rawQuery);
  if (!qNorm) return false;
  const qNoSpace = qNorm.replace(/\s+/g, '');
  const brandNorms = [
    'dream cart bd', 'dreamcartbd', 'dream cart', 'dreamcart', 'dcbd',
    'ড্রিম কার্ট বিডি', 'ড্রিমকার্ট বিডি', 'ড্রিম কার্ট বি ডি', 'ড্রিম কার্ট', 'ড্রিমকার্ট',
    'product', 'products', 'products page', 'all products', 'shop', 'প্রোডাক্ট', 'প্রোডাক্টস', 'প্রোডাক্টস পেজ', 'পণ্য', 'সকল পণ্য',
    'contact', 'contact page', 'contact us', 'কন্টাক্ট', 'কন্টাক্ট পেজ', 'যোগাযোগ', 'যোগাযোগ পেজ',
    'track', 'tracking', 'tracking page', 'track order', 'ট্রেকিং', 'ট্রেকিং পেজ', 'ট্র্যাকিং', 'ট্র্যাকিং পেজ', 'অর্ডার ট্র্যাক',
    'home', 'home page', 'homepage', 'হোম', 'হোম পেজ', 'হোমপেজ', 'মূল পাতা'
  ];
  return brandNorms.some(b => {
    const bNorm = normalizeBilingualText(b);
    const bNoSpace = bNorm.replace(/\s+/g, '');
    return qNorm === bNorm || qNoSpace === bNoSpace || (qNoSpace.length >= 4 && bNoSpace.includes(qNoSpace));
  });
}

export function installUniversalBilingualSearchEngine() {
  if (typeof window === 'undefined') return;
  if (window.__dcbdUniversalBilingualSearchInstalled) return;
  window.__dcbdUniversalBilingualSearchInstalled = true;

  // 1. Upgrade SearchService so lowercase, uppercase, Bengali & Banglish queries ALWAYS match products!
  if (SearchService) {
    SearchService.normalize = normalizeBilingualText;

    SearchService.calculateRelevance = function(product, query) {
      if (!product || !query) return 0;
      const qNorm = normalizeBilingualText(query);
      if (!qNorm) return 0;
      const qNoSpace = qNorm.replace(/\s+/g, '');
      const qSku = String(query).toLowerCase().replace(/[^a-z0-9]/g, '');

      const pSkuRaw = String(product.sku || product.product_id || '').toLowerCase();
      const pSkuClean = pSkuRaw.replace(/[^a-z0-9]/g, '');
      const pName = normalizeBilingualText(product.name || product.p_name || '');
      const pBrand = normalizeBilingualText(product.brand || '');
      const pCat = normalizeBilingualText(product.category || '');
      const pSub = normalizeBilingualText(product.sub_category || '');
      const pChild = normalizeBilingualText(product.child_category || '');
      const pSlug = normalizeBilingualText(product.slug || '');
      const pDesc = normalizeBilingualText(
        (product.description || '') + ' ' + (product.specification || '') + ' ' + (product.others || '') + ' ' + (product.color || '') + ' ' + (product.size || '')
      );
      const fullHaystack = `${pName} ${pBrand} ${pCat} ${pSub} ${pChild} ${pSlug} ${pSkuRaw} ${pDesc}`;
      const fullNoSpace = fullHaystack.replace(/\s+/g, '');

      // If the user searches for the site/brand name ("dream cart bd", "ড্রিম কার্ট বিডি", "dcbd", "প্রোডাক্ট"), match all active products!
      if (isBrandOrAllProductsQuery(qNorm)) {
        return 650;
      }

      let score = 0;

      // Exact or partial SKU match (works for both "dcbd-wt-01" lowercase and "DCBD-WT-01" uppercase)
      if (pSkuClean && qSku && qSku.length >= 2) {
        if (pSkuClean === qSku || pSkuRaw === qNorm) score += 1500;
        else if (pSkuClean.startsWith(qSku) || pSkuClean.endsWith(qSku)) score += 900;
        else if (pSkuClean.includes(qSku)) score += 550;
      }

      // Direct Name match (case-insensitive & Bengali normalized)
      if (pName) {
        if (pName === qNorm) score += 1200;
        else if (pName.startsWith(qNorm)) score += 850;
        else if (pName.includes(qNorm)) score += 650;
        else if (qNoSpace.length >= 2 && pName.replace(/\s+/g, '').includes(qNoSpace)) score += 550;
      }

      // Brand, Category, Sub-Category, Child-Category, Slug match
      if (pBrand && (pBrand === qNorm || pBrand.includes(qNorm) || qNorm.includes(pBrand))) score += 450;
      if (pCat && (pCat === qNorm || pCat.includes(qNorm) || qNorm.includes(pCat))) score += 400;
      if (pSub && (pSub === qNorm || pSub.includes(qNorm) || qNorm.includes(pSub))) score += 320;
      if (pChild && (pChild === qNorm || pChild.includes(qNorm))) score += 260;
      if (pSlug && pSlug.includes(qNorm.replace(/\s+/g, '-'))) score += 250;
      if (pDesc && pDesc.includes(qNorm)) score += 140;

      // Token-by-token + Bilingual Synonym Expansion (works even for 1, 2, or 3 character lowercase or Bengali words!)
      const tokens = qNorm.split(' ').filter(Boolean);
      let matchedTokens = 0;

      tokens.forEach(tok => {
        let tokMatched = false;
        if (pName.includes(tok)) {
          score += tok.length >= 3 ? 140 : 90;
          tokMatched = true;
        }
        if (pBrand.includes(tok)) {
          score += 110;
          tokMatched = true;
        }
        if (pCat.includes(tok) || pSub.includes(tok) || pChild.includes(tok)) {
          score += 95;
          tokMatched = true;
        }
        if (pSkuClean.includes(tok.replace(/[^a-z0-9]/g, '')) && tok.replace(/[^a-z0-9]/g, '').length >= 2) {
          score += 120;
          tokMatched = true;
        }
        if (pDesc.includes(tok)) {
          score += 40;
          tokMatched = true;
        }

        // Check Bilingual / Banglish dictionary (both exact key and prefix key for live typing!)
        const expansions = new Set([...(BILINGUAL_EXPANDED_DICTIONARY[tok] || []), ...(CONCEPT_SYNONYMS?.[tok] || []), ...(BRAND_TRANSLATIONS?.[tok] || [])]);
        if (tok.length >= 2) {
          Object.keys(BILINGUAL_EXPANDED_DICTIONARY).forEach(dictKey => {
            if (dictKey.startsWith(tok) || tok.startsWith(dictKey)) {
              expansions.add(dictKey);
              (BILINGUAL_EXPANDED_DICTIONARY[dictKey] || []).forEach(e => expansions.add(e));
            }
          });
        }

        expansions.forEach(syn => {
          const synNorm = normalizeBilingualText(syn);
          if (!synNorm) return;
          if (pName.includes(synNorm)) {
            score += 130;
            tokMatched = true;
          } else if (pCat.includes(synNorm) || pSub.includes(synNorm) || pBrand.includes(synNorm)) {
            score += 90;
            tokMatched = true;
          } else if (fullHaystack.includes(synNorm)) {
            score += 45;
            tokMatched = true;
          }
        });

        if (tokMatched) matchedTokens++;
      });

      if (tokens.length > 1 && matchedTokens === tokens.length) {
        score += 300;
      } else if (score === 0 && qNoSpace.length >= 2 && fullNoSpace.includes(qNoSpace)) {
        score += 220;
      }

      return score;
    };

    SearchService.search = function(allProducts = [], query = '', options = {}) {
      const qTrim = String(query || '').trim();
      const list = Array.isArray(allProducts) ? allProducts : [];

      // Keep Visual Image Search support intact
      const activeReport = window.__dcbdActiveVisualReport;
      if (
        activeReport &&
        qTrim &&
        activeReport.matchedQuery &&
        qTrim.toLowerCase() === activeReport.matchedQuery.toLowerCase() &&
        list.length > 0
      ) {
        const directMatches = (activeReport.directMatches || []).map((vp, idx) => ({
          ...vp,
          _searchScore: 1500 - idx * 50,
          _isDirectMatch: true
        }));
        const relatedProducts = (activeReport.relatedProducts || []).map((vp, idx) => ({
          ...vp,
          _relatedScore: 500 - idx * 10,
          _isDirectMatch: false
        }));
        if (directMatches.length > 0) {
          return {
            directMatches,
            relatedProducts,
            allResults: [...directMatches, ...relatedProducts],
            priorityPages: getPrioritizedSitePagesForQuery(qTrim),
            query: qTrim,
            totalCount: directMatches.length + relatedProducts.length
          };
        }
      }

      if (!qTrim) {
        return {
          directMatches: list,
          relatedProducts: [],
          allResults: list,
          priorityPages: getPrioritizedSitePagesForQuery(''),
          query: '',
          totalCount: list.length
        };
      }

      const scored = list.map(p => ({
        product: p,
        score: SearchService.calculateRelevance(p, qTrim)
      }));

      const directMatches = scored
        .filter(it => it.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(it => ({
          ...it.product,
          _searchScore: it.score,
          _isDirectMatch: true
        }));

      const directIds = new Set(
        directMatches.map(p => String(p.sku || p.product_id || p.slug || '').toLowerCase())
      );

      const targetCats = new Set();
      const targetSubs = new Set();
      const targetBrands = new Set();
      directMatches.forEach(p => {
        if (p.category) targetCats.add(normalizeBilingualText(p.category));
        if (p.sub_category) targetSubs.add(normalizeBilingualText(p.sub_category));
        if (p.brand) targetBrands.add(normalizeBilingualText(p.brand));
      });

      const relatedProducts = [];
      list.forEach(p => {
        const id = String(p.sku || p.product_id || p.slug || '').toLowerCase();
        if (directIds.has(id)) return;
        const c = normalizeBilingualText(p.category || '');
        const s = normalizeBilingualText(p.sub_category || '');
        const b = normalizeBilingualText(p.brand || '');
        let relScore = 0;
        if (s && targetSubs.has(s)) relScore += 60;
        if (c && targetCats.has(c)) relScore += 40;
        if (b && targetBrands.has(b)) relScore += 25;
        if (relScore > 0) {
          relatedProducts.push({
            ...p,
            _relatedScore: relScore,
            _isDirectMatch: false
          });
        }
      });

      const allResults = [...directMatches, ...relatedProducts];
      return {
        directMatches,
        relatedProducts,
        allResults,
        priorityPages: getPrioritizedSitePagesForQuery(qTrim),
        query: qTrim,
        totalCount: allResults.length
      };
    };
  }

  // 2. Enhance Site Search Bar Popup (#search-preview-popup & #mobile-search-preview-popup)
  // so the Top-4 Priority Pages (প্রোডাক্ট’স পেজ, কন্টাক্ট পেজ, ট্রেকিং পেজ, হোম পেজ) ALWAYS appear at the very top!
  function buildPriorityPagesHeaderHtml(rawQuery = '') {
    const pages = getPrioritizedSitePagesForQuery(rawQuery);
    return `
      <div class="dcbd-priority-pages-block px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800">
        <div class="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>⚡ কুইক পেজ নেভিগেশন (Dream Cart BD)</span>
          <span class="text-[9px] text-slate-400 font-semibold">সরাসরি পেজে যান</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          ${pages.map(pg => `
            <a
              href="${pg.path}"
              data-priority-nav="${pg.path}"
              class="dcbd-priority-page-link flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${pg._isMatched ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-slate-800/90 border-slate-700/80 text-slate-200 hover:border-emerald-500/60 hover:text-emerald-300'} transition text-[11px] font-bold truncate"
              title="${pg.name} — ${pg.subtitle}"
            >
              <span>${pg.icon}</span>
              <span class="truncate">${pg.shortTitle}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderEnhancedSearchPopup(inputEl, popupEl, clearBtn) {
    if (!inputEl || !popupEl) return;
    const rawQuery = String(inputEl.value || '').trim();

    if (clearBtn) {
      if (rawQuery.length > 0) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }

    // Even when focused with empty query, show the 4 priority pages so user can jump immediately
    if (!rawQuery) {
      popupEl.innerHTML = buildPriorityPagesHeaderHtml('');
      popupEl.classList.remove('hidden');
      return;
    }

    const apiCli = window.apiClient;
    let allProds = [];
    if (apiCli) {
      if (Array.isArray(apiCli.products) && apiCli.products.length > 0) {
        allProds = apiCli.products;
      } else if (Array.isArray(apiCli.sheetProducts) && apiCli.sheetProducts.length > 0) {
        allProds = apiCli.sheetProducts;
      } else if (typeof apiCli.loadLocal === 'function') {
        allProds = apiCli.loadLocal('dcbd_sheet_products', []) || [];
      }
      if (allProds.length <= 5 && typeof apiCli.loadProductsFromSheet === 'function' && !window.__dcbdSearchWarmupTriggered) {
        window.__dcbdSearchWarmupTriggered = true;
        apiCli.loadProductsFromSheet(false).then(() => {
          renderEnhancedSearchPopup(inputEl, popupEl, clearBtn);
        }).catch(() => {});
      }
    }

    const searchRes = SearchService.search(allProds, rawQuery);
    const directMatches = searchRes.directMatches || [];
    const relatedProducts = searchRes.relatedProducts || [];
    const matches = [...directMatches, ...relatedProducts].slice(0, 8);
    const pagesHtml = buildPriorityPagesHeaderHtml(rawQuery);

    if (matches.length === 0) {
      popupEl.innerHTML = `
        <div class="divide-y divide-slate-800">
          ${pagesHtml}
          <div class="p-4 text-center text-xs text-slate-400 space-y-2">
            <div>🔍 "${rawQuery}" এর সাথে মিলে এমন পেজ উপরে দেখুন অথবা সকল পণ্য ব্রাউজ করুন।</div>
            <a href="/products" class="btn-primary text-[11px] py-1.5 px-3.5 inline-flex font-bold">সকল প্রোডাক্ট’স পেজ দেখুন →</a>
          </div>
        </div>
      `;
      popupEl.classList.remove('hidden');
      return;
    }

    popupEl.innerHTML = `
      <div class="divide-y divide-slate-800">
        ${pagesHtml}
        <div class="px-4 py-2 bg-slate-900/80 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>🔍 ${directMatches.length > 0 ? `সেরা পণ্য ফলাফল (${directMatches.length} টি ম্যাচ)` : `সম্ভাব্য পণ্য ফলাফল (${matches.length} টি)`}</span>
          <span class="text-[9px] text-emerald-400 font-bold">ক্লিক করে বিস্তারিত দেখুন</span>
        </div>
        ${matches.map(p => {
          const pName = p.name || p.p_name || 'পণ্য';
          const pStock = Number(p.stock !== undefined && p.stock !== null && p.stock !== '' ? p.stock : 25);
          const isPreOrder = pStock <= 0;
          const pPrice = isPreOrder ? Math.round(Number(p.selling_price || 0) * 1.15) : Number(p.selling_price || 0);
          const pThumb = p.thumbnail || (Array.isArray(p.images) && p.images[0]) || '/icon/logo.png';
          const pSlug = p.slug || p.product_id || p.sku || '';
          return `
            <div
              class="search-preview-item flex items-center gap-3 p-3 hover:bg-slate-800/90 transition cursor-pointer"
              data-slug="${pSlug}"
            >
              <img
                src="${pThumb}"
                alt="${pName}"
                class="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0 bg-white"
                onerror="this.src='/icon/logo.png'"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-white truncate leading-snug">${pName}</span>
                  ${p._isDirectMatch === false ? `<span class="bg-amber-950/80 text-amber-300 px-1 py-0.2 rounded text-[8px] font-bold flex-shrink-0">সম্পর্কিত</span>` : ''}
                </div>
                <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-1 flex-wrap">
                  <span class="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-slate-300">${p.sku || ''}</span>
                  <span class="text-emerald-400 font-black">৳${pPrice.toLocaleString('bn-BD')}</span>
                  ${p.category ? `<span class="bg-emerald-950/70 text-emerald-300 px-1.5 py-0.5 rounded text-[9px] font-bold">${p.category}</span>` : ''}
                </div>
              </div>
              <span class="text-emerald-400 text-xs flex-shrink-0 font-bold">→</span>
            </div>
          `;
        }).join('')}
        <div class="p-3 text-center bg-slate-900 border-t border-slate-800">
          <a href="/products?search=${encodeURIComponent(rawQuery)}" class="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1.5">
            <span>"${rawQuery}" এর সকল সার্চ রেজাল্ট দেখুন (${searchRes.totalCount} টি) →</span>
          </a>
        </div>
      </div>
    `;
    popupEl.classList.remove('hidden');
  }

  // Capture-phase listeners so lowercase, uppercase & Bengali typing in the search bar ALWAYS triggers our enhanced popup!
  document.addEventListener('focusin', (e) => {
    const t = e && e.target;
    if (!t) return;
    if (t.id === 'global-search-input') {
      renderEnhancedSearchPopup(
        t,
        document.getElementById('search-preview-popup'),
        document.getElementById('global-search-clear-btn')
      );
    } else if (t.id === 'mobile-search-input') {
      renderEnhancedSearchPopup(
        t,
        document.getElementById('mobile-search-preview-popup'),
        document.getElementById('mobile-search-clear-btn')
      );
    }
  }, true);

  document.addEventListener('input', (e) => {
    const t = e && e.target;
    if (!t) return;
    if (t.id === 'global-search-input') {
      e.stopImmediatePropagation();
      renderEnhancedSearchPopup(
        t,
        document.getElementById('search-preview-popup'),
        document.getElementById('global-search-clear-btn')
      );
    } else if (t.id === 'mobile-search-input') {
      e.stopImmediatePropagation();
      renderEnhancedSearchPopup(
        t,
        document.getElementById('mobile-search-preview-popup'),
        document.getElementById('mobile-search-clear-btn')
      );
    }
  }, true);

  document.addEventListener('click', (e) => {
    const navLink = e.target.closest && e.target.closest('a[data-priority-nav]');
    if (navLink) {
      e.preventDefault();
      const targetPath = navLink.getAttribute('data-priority-nav') || '/products';
      const p1 = document.getElementById('search-preview-popup');
      const p2 = document.getElementById('mobile-search-preview-popup');
      if (p1) p1.classList.add('hidden');
      if (p2) p2.classList.add('hidden');
      if (window.router && typeof window.router.navigate === 'function') {
        window.router.navigate(targetPath);
      } else {
        window.location.href = targetPath;
      }
      return;
    }

    // Close search popup when clicking outside search containers
    if (e.target && e.target.closest && !e.target.closest('.search-container') && !e.target.closest('.mobile-search-row')) {
      const p1 = document.getElementById('search-preview-popup');
      const p2 = document.getElementById('mobile-search-preview-popup');
      if (p1) p1.classList.add('hidden');
      if (p2) p2.classList.add('hidden');
    }
  });
}

// ============================================================================
// AD ATTRIBUTION CAPTURE (fbclid, gclid, wbraid, gbraid, ttclid, UTM params)
// ============================================================================
export function captureAndGetAdAttribution() {
  if (typeof window === 'undefined') return {};
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem('dcbd_ad_attribution') || '{}') || {};
  } catch (e) {}

  if (window.__DCBD_AD_ATTRIBUTION__ && typeof window.__DCBD_AD_ATTRIBUTION__ === 'object') {
    stored = { ...stored, ...window.__DCBD_AD_ATTRIBUTION__ };
  }

  try {
    const urlParams = new URLSearchParams(window.location.search || '');
    const keys = ['fbclid', 'gclid', 'wbraid', 'gbraid', 'ttclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    let updated = false;
    keys.forEach(k => {
      const val = urlParams.get(k);
      if (val) {
        stored[k] = val;
        updated = true;
      }
    });
    if (urlParams.get('fbclid') && !stored.fbc) {
      stored.fbc = `fb.1.${Date.now()}.${urlParams.get('fbclid')}`;
      updated = true;
    }
    if (!stored.fbp) {
      const fbpCookie = (document.cookie || '').split('; ').find(r => r.startsWith('_fbp='));
      if (fbpCookie) {
        stored.fbp = fbpCookie.split('=')[1];
      } else {
        stored.fbp = `fb.1.${Date.now()}.${Math.floor(100000000 + Math.random() * 900000000)}`;
        updated = true;
      }
    }
    if (updated || Object.keys(stored).length > 0) {
      localStorage.setItem('dcbd_ad_attribution', JSON.stringify(stored));
    }
  } catch (e) {}

  return stored;
}

function getActivePixelSettings() {
  let s = (typeof window !== 'undefined' && window.__DCBD_PIXEL_CONFIG__) ? { ...window.__DCBD_PIXEL_CONFIG__ } : {};
  try {
    const ssr = (typeof window !== 'undefined' && window.__DCBD_SSR_CACHE__ && window.__DCBD_SSR_CACHE__.settings)
      ? window.__DCBD_SSR_CACHE__.settings
      : {};
    s = { ...s, ...ssr };
  } catch (e) {}
  try {
    const rawSettings = localStorage.getItem('dcbd_site_settings');
    if (rawSettings) {
      s = { ...s, ...JSON.parse(rawSettings) };
    }
  } catch (e) {}
  return s;
}

// ============================================================================
// UNIFIED AD PIXELS ENGINE (Facebook/Instagram Meta Pixel, TikTok Pixel, YouTube/Google Tag & Server CAPI)
// ============================================================================
export function initMarketingAdPixels(forceReinit = false) {
  if (typeof window === 'undefined') return;
  installUniversalBilingualSearchEngine();
  captureAndGetAdAttribution();

  window.__dcbdConfiguredPixelIds = window.__dcbdConfiguredPixelIds || new Set();

  // 1. Initialize Meta Pixel queue (Facebook & Instagram Advantage+ Catalog Ads)
  if (!window.fbq) {
    const n = window.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
  }

  // 2. Initialize TikTok Pixel queue (TikTok Dynamic Showcase Ads)
  if (!window.ttq) {
    window.ttq = {
      _queue: [],
      track: function(ev, data) { this._queue.push(['track', ev, data]); },
      page: function() { this._queue.push(['page']); },
      identify: function(data) { this._queue.push(['identify', data]); }
    };
  }

  // 3. Initialize Google Tag / YouTube Shopping Ads dataLayer
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function() { window.dataLayer.push(arguments); };
  }

  if (forceReinit) {
    window.__dcbdConfiguredPixelIds.clear();
  }

  try {
    const s = getActivePixelSettings();
    window.__DCBD_PIXEL_CONFIG__ = {
      ...(window.__DCBD_PIXEL_CONFIG__ || {}),
      fbPixelId: String(s.fbPixelId || s.FB_Pixel_ID || '').trim(),
      fbTestEventCode: String(s.fbTestEventCode || s.FB_Test_Event_Code || '').trim(),
      gtagId: String(s.gtagId || s.GA4_Measurement_ID || '').trim(),
      googleAdsId: String(s.googleAdsId || s.Google_Ads_ID || '').trim(),
      googleConversionLabel: String(s.googleConversionLabel || s.Google_Conversion_Label || '').trim(),
      gtmId: String(s.gtmId || s.GTM_Container_ID || '').trim(),
      ytTrackingId: String(s.ytTrackingId || s.YouTube_Tracking_ID || '').trim(),
      tiktokPixelId: String(s.tiktokPixelId || s.TikTok_Pixel_ID || '').trim(),
      enableServerCapi: s.enableServerCapi !== false,
      enableEnhancedConv: s.enableEnhancedConv !== false
    };

    const cfg = window.__DCBD_PIXEL_CONFIG__;
    const configuredSet = window.__dcbdConfiguredPixelIds;

    // A. Inject Facebook/Instagram Meta Pixel SDK if configured
    if (cfg.fbPixelId && !configuredSet.has(`fb:${cfg.fbPixelId}`)) {
      configuredSet.add(`fb:${cfg.fbPixelId}`);
      if (!document.querySelector('script[src*="connect.facebook.net"]')) {
        const fbScript = document.createElement('script');
        fbScript.async = true;
        fbScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(fbScript);
      }
      window.fbq('init', cfg.fbPixelId, { country: 'bd' });
      if (!window.__dcbdInitialPageViewFired) {
        window.fbq('track', 'PageView');
        window.__dcbdInitialPageViewFired = true;
      }
    }

    // B. Inject Google Tag Manager (GTM) if configured
    if (cfg.gtmId && !configuredSet.has(`gtm:${cfg.gtmId}`)) {
      configuredSet.add(`gtm:${cfg.gtmId}`);
      if (!document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
        window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        const gtmScript = document.createElement('script');
        gtmScript.async = true;
        gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(cfg.gtmId)}`;
        document.head.appendChild(gtmScript);
      }
    }

    // C. Inject Google Tag (gtag.js) for Google Ads, YouTube Shopping/Video Ads & GA4
    const primaryGtag = cfg.gtagId || cfg.googleAdsId || cfg.ytTrackingId;
    if (primaryGtag) {
      if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
        const gtScript = document.createElement('script');
        gtScript.async = true;
        gtScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryGtag)}`;
        document.head.appendChild(gtScript);
        window.gtag('js', new Date());
      }
      if (cfg.gtagId && !configuredSet.has(`gtag:${cfg.gtagId}`)) {
        configuredSet.add(`gtag:${cfg.gtagId}`);
        window.gtag('config', cfg.gtagId, { allow_enhanced_conversions: true, currency: 'BDT' });
      }
      if (cfg.googleAdsId && !configuredSet.has(`gads:${cfg.googleAdsId}`)) {
        configuredSet.add(`gads:${cfg.googleAdsId}`);
        window.gtag('config', cfg.googleAdsId, { allow_enhanced_conversions: true });
      }
      if (cfg.ytTrackingId && !configuredSet.has(`yt:${cfg.ytTrackingId}`)) {
        configuredSet.add(`yt:${cfg.ytTrackingId}`);
        window.gtag('config', cfg.ytTrackingId, { allow_enhanced_conversions: true });
      }
    }

    // D. Inject TikTok Pixel SDK if configured
    if (cfg.tiktokPixelId && !configuredSet.has(`ttq:${cfg.tiktokPixelId}`)) {
      configuredSet.add(`ttq:${cfg.tiktokPixelId}`);
      if (!document.querySelector('script[src*="analytics.tiktok.com"]')) {
        const ttScript = document.createElement('script');
        ttScript.async = true;
        ttScript.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(cfg.tiktokPixelId)}&lib=ttq`;
        document.head.appendChild(ttScript);
      }
      if (typeof window.ttq.load === 'function') {
        window.ttq.load(cfg.tiktokPixelId);
      }
      window.ttq.page && window.ttq.page();
    }
  } catch (e) {}
}

/**
 * Non-blocking Server-Side Conversions API (CAPI) & Enhanced Conversion Relay to PHP/Python Gateway
 */
function sendServerCapiEvent(eventName, eventId, customData = {}, userData = {}) {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
  try {
    const apiUrl = window.__DCBD_PHP_API_URL__ || ((window.__APP_BASE__ || '') + '/api/index.php');
    const attr = captureAndGetAdAttribution();
    const s = getActivePixelSettings();
    const payload = {
      action: 'pixels/track',
      event_name: eventName,
      event_id: eventId,
      event_source_url: window.location.href,
      fbc: attr.fbc || '',
      fbp: attr.fbp || '',
      test_event_code: String(s.fbTestEventCode || s.FB_Test_Event_Code || '').trim(),
      custom_data: customData,
      user_data: userData
    };
    fetch(`${apiUrl}?action=pixels/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  } catch (e) {}
}

const _firedPurchaseOrders = new Set();

export function trackAdEvent(eventName, payload = {}) {
  if (typeof window === 'undefined') return;
  initMarketingAdPixels(false);

  const eventId = payload.event_id || `EVT_${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  try {
    switch (eventName) {
      case 'PageView': {
        if (window.__dcbdInitialPageViewFired && !window.__dcbdSpaFirstPageViewHandled) {
          window.__dcbdSpaFirstPageViewHandled = true;
        } else {
          window.fbq && window.fbq('track', 'PageView', {}, { eventID: eventId });
          window.ttq && window.ttq.page && window.ttq.page();
        }
        window.gtag && window.gtag('event', 'page_view', {
          page_location: window.location.href,
          page_title: document.title
        });
        window.dataLayer && window.dataLayer.push({
          event: 'page_view',
          page_location: window.location.href,
          page_title: document.title
        });
        sendServerCapiEvent('PageView', eventId, {
          page_location: window.location.href,
          page_title: document.title
        });
        break;
      }

      case 'ViewContent': {
        const sku = String(payload.sku || payload.product_id || 'DCBD-ITEM');
        const name = String(payload.name || payload.p_name || 'Product');
        const price = Number(payload.selling_price || payload.price || 0);
        const cat = String(payload.category || 'General');
        const adData = {
          content_ids: [sku],
          content_id: sku,
          content_name: name,
          content_type: 'product',
          content_category: cat,
          value: price,
          currency: 'BDT',
          contents: [{ id: sku, quantity: 1, item_price: price }]
        };
        const gaItems = [{ item_id: sku, item_name: name, item_category: cat, price: price, quantity: 1 }];
        window.fbq && window.fbq('track', 'ViewContent', adData, { eventID: eventId });
        window.ttq && window.ttq.track('ViewContent', adData);
        window.gtag && window.gtag('event', 'view_item', {
          currency: 'BDT',
          value: price,
          items: gaItems
        });
        window.dataLayer && window.dataLayer.push({
          event: 'view_item',
          ecommerce: { currency: 'BDT', value: price, items: gaItems }
        });
        sendServerCapiEvent('ViewContent', eventId, adData);
        break;
      }

      case 'AddToCart': {
        const sku = String(payload.sku || payload.product_id || 'DCBD-ITEM');
        const name = String(payload.name || payload.p_name || 'Product');
        const price = Number(payload.selling_price || payload.price || 0);
        const qty = Number(payload.quantity || 1);
        const adData = {
          content_ids: [sku],
          content_id: sku,
          content_name: name,
          content_type: 'product',
          value: price * qty,
          currency: 'BDT',
          contents: [{ id: sku, quantity: qty, item_price: price }]
        };
        const gaItems = [{ item_id: sku, item_name: name, price: price, quantity: qty }];
        window.fbq && window.fbq('track', 'AddToCart', adData, { eventID: eventId });
        window.ttq && window.ttq.track('AddToCart', adData);
        window.gtag && window.gtag('event', 'add_to_cart', {
          currency: 'BDT',
          value: price * qty,
          items: gaItems
        });
        window.dataLayer && window.dataLayer.push({
          event: 'add_to_cart',
          ecommerce: { currency: 'BDT', value: price * qty, items: gaItems }
        });
        sendServerCapiEvent('AddToCart', eventId, adData);
        break;
      }

      case 'AddToWishlist': {
        const sku = String(payload.sku || payload.product_id || 'DCBD-ITEM');
        const name = String(payload.name || payload.p_name || 'Product');
        const price = Number(payload.selling_price || payload.price || 0);
        const adData = {
          content_ids: [sku],
          content_name: name,
          content_type: 'product',
          value: price,
          currency: 'BDT'
        };
        window.fbq && window.fbq('track', 'AddToWishlist', adData, { eventID: eventId });
        window.ttq && window.ttq.track('AddToWishlist', adData);
        window.gtag && window.gtag('event', 'add_to_wishlist', {
          currency: 'BDT',
          value: price,
          items: [{ item_id: sku, item_name: name, price: price, quantity: 1 }]
        });
        break;
      }

      case 'InitiateCheckout': {
        const total = Number(payload.value || payload.total || payload.total_amount || 0);
        const items = Array.isArray(payload.items) ? payload.items : [];
        const ids = items.map(i => String(i.sku || i.product_id || 'ITEM'));
        const adData = {
          content_ids: ids.length ? ids : ['DCBD-CHECKOUT'],
          content_type: 'product',
          value: total,
          currency: 'BDT',
          num_items: items.length || 1
        };
        const gaItems = items.map(i => ({
          item_id: String(i.sku || i.product_id || 'ITEM'),
          item_name: String(i.name || i.p_name || 'Product'),
          price: Number(i.price || i.selling_price || 0),
          quantity: Number(i.quantity || 1)
        }));
        window.fbq && window.fbq('track', 'InitiateCheckout', adData, { eventID: eventId });
        window.ttq && window.ttq.track('InitiateCheckout', adData);
        window.gtag && window.gtag('event', 'begin_checkout', {
          currency: 'BDT',
          value: total,
          items: gaItems
        });
        window.dataLayer && window.dataLayer.push({
          event: 'begin_checkout',
          ecommerce: { currency: 'BDT', value: total, items: gaItems }
        });
        sendServerCapiEvent('InitiateCheckout', eventId, adData);
        break;
      }

      case 'Lead': {
        const total = Number(payload.total_amount || payload.value || 0);
        const adData = {
          content_name: String(payload.products || 'Checkout Draft Lead'),
          value: total,
          currency: 'BDT'
        };
        const userData = {
          phone: String(payload.phone || ''),
          name: String(payload.customer_name || '')
        };
        window.fbq && window.fbq('track', 'Lead', adData, { eventID: eventId });
        window.ttq && window.ttq.track('SubmitForm', adData);
        window.gtag && window.gtag('event', 'generate_lead', {
          currency: 'BDT',
          value: total
        });
        window.dataLayer && window.dataLayer.push({
          event: 'generate_lead',
          value: total,
          currency: 'BDT'
        });
        sendServerCapiEvent('Lead', eventId, adData, userData);
        break;
      }

      case 'Purchase': {
        const orderId = String(payload.order_id || payload.orderId || payload.OrderID || ('ORD-' + Date.now()));
        if (!payload.force_test && _firedPurchaseOrders.has(orderId.toLowerCase())) {
          return;
        }
        _firedPurchaseOrders.add(orderId.toLowerCase());

        const dedupEventId = `PUR_${orderId}`;
        const total = Number(payload.total_amount || payload.value || 0);
        const items = Array.isArray(payload.items) ? payload.items : [];
        const ids = items.map(i => String(i.sku || i.product_id || 'ITEM'));
        const adData = {
          content_ids: ids.length ? ids : [orderId],
          content_type: 'product',
          content_name: String(payload.products || payload.product_name || 'Order'),
          value: total,
          currency: 'BDT',
          order_id: orderId,
          num_items: items.length || Number(payload.quantity || 1)
        };
        const userData = {
          phone: String(payload.phone || ''),
          name: String(payload.customer_name || ''),
          address: String(payload.address || '')
        };
        const gaItems = items.map(i => ({
          item_id: String(i.sku || i.product_id || 'ITEM'),
          item_name: String(i.name || i.p_name || 'Product'),
          price: Number(i.price || i.selling_price || 0),
          quantity: Number(i.quantity || 1)
        }));

        window.fbq && window.fbq('track', 'Purchase', adData, { eventID: dedupEventId });
        window.ttq && window.ttq.track('CompletePayment', adData);

        window.dataLayer && window.dataLayer.push({
          event: 'purchase',
          ecommerce: {
            transaction_id: orderId,
            value: total,
            currency: 'BDT',
            items: gaItems
          }
        });

        if (window.gtag) {
          if (userData.phone) {
            const cleanPh = userData.phone.replace(/[^0-9]/g, '');
            const intlPh = cleanPh.length === 11 && cleanPh.startsWith('01') ? `+88${cleanPh}` : `+${cleanPh}`;
            window.gtag('set', 'user_data', {
              phone_number: intlPh,
              address: { first_name: userData.name, street: userData.address, country: 'BD' }
            });
          }
          window.gtag('event', 'purchase', {
            transaction_id: orderId,
            currency: 'BDT',
            value: total,
            items: gaItems
          });

          try {
            const s = getActivePixelSettings();
            const gAdsId = String(s.googleAdsId || s.Google_Ads_ID || '').trim();
            const gConvLbl = String(s.googleConversionLabel || s.Google_Conversion_Label || '').trim();
            if (gAdsId && gConvLbl) {
              window.gtag('event', 'conversion', {
                send_to: `${gAdsId}/${gConvLbl}`,
                value: total,
                currency: 'BDT',
                transaction_id: orderId
              });
            }
          } catch (e) {}
        }

        sendServerCapiEvent('Purchase', dedupEventId, adData, userData);
        break;
      }

      case 'Search': {
        const q = String(payload.search_string || payload.query || '');
        if (!q) break;
        window.fbq && window.fbq('track', 'Search', { search_string: q }, { eventID: eventId });
        window.ttq && window.ttq.track('Search', { query: q });
        window.gtag && window.gtag('event', 'search', { search_term: q });
        sendServerCapiEvent('Search', eventId, { search_string: q });
        break;
      }

      case 'Contact': {
        const method = String(payload.method || 'WhatsApp/Call');
        window.fbq && window.fbq('track', 'Contact', { content_name: method }, { eventID: eventId });
        window.ttq && window.ttq.track('Contact', { content_name: method });
        window.gtag && window.gtag('event', 'contact', { method: method });
        sendServerCapiEvent('Contact', eventId, { content_name: method });
        break;
      }
    }
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  installUniversalBilingualSearchEngine();
  window.__dcbdInitMarketingAdPixels = initMarketingAdPixels;
  window.__dcbdTrackAdEvent = trackAdEvent;
  window.__dcbdUpdateDynamicSeo = updateDynamicPageSeoAndSchema;
  window.__dcbdGetAdAttribution = captureAndGetAdAttribution;
}
