/**
 * DREAM CART BD — DYNAMIC MODERN 3D CAMPAIGN LANDING PAGE (LandingPage.js)
 * Implements user requirements:
 * - Exports `renderLandingPage(params = {})` returning an HTML string (100% compatible with `src/router.js`).
 * - Instant 0ms Page Render & 0ms Order Submit (even on slow 2G/3G internet): uses instant local cache first + non-blocking background sync.
 * - Free Delivery on Orders >= ৳2,000 (`freeDeliveryThreshold: 2000`) with a live animated Free Delivery progress bar.
 * - 5% Instant Discount on Online Payment (`BKASH`, `NAGAD`, `ROCKET`, `BANK`) with 1-click Copy Payment Number & TrxID field.
 * - 3D Style Product Cards & Checkout Package Cards with perspective tilt, 3D bottom bevels, floating product pedestals, and glass shimmer animations.
 * - Clicking "🛒 অর্ডার করুন" / "🛒 অর্ডার কনফার্ম করুন" smoothly scrolls to "🛍️ ক্যাম্পেইনের পণ্যসমূহ" (`#lp-products-section`) on the SAME landing page.
 * - ONLY clicking "🛍️ মূল ওয়েবসাইটে যান" navigates to the main website's `/products` page.
 * - 10 Authentic Luxury Color Themes synced with Admin Panel Landing Page Builder.
 */

import { apiClient, getGlobalDeliveryMethods, getGlobalPaymentMethods, getGlobalSiteSettings } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../components/Toast.js';

/**
 * Deduplicates landing pages by id and slug (keeping the most recently updated entry)
 * so the Admin Panel and Storefront never show duplicate landing pages.
 */
function deduplicateLandingPagesList(list) {
  if (!Array.isArray(list)) return [];
  const seenIds = new Map();
  const seenSlugs = new Map();

  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const rawId = String(item.id || item.ID || '').trim();
    const rawSlug = String(item.slug || item.Slug || '').trim().toLowerCase();
    const key = rawSlug || rawId || JSON.stringify(item);

    const existing = (rawSlug && seenSlugs.get(rawSlug)) || (rawId && seenIds.get(rawId));
    if (existing) {
      const existingTime = new Date(existing.updated_at || existing.created_at || 0).getTime() || 0;
      const newTime = new Date(item.updated_at || item.created_at || 0).getTime() || 0;
      if (newTime >= existingTime) {
        const merged = { ...existing, ...item };
        if (rawSlug) seenSlugs.set(rawSlug, merged);
        if (rawId) seenIds.set(rawId, merged);
      }
    } else {
      if (rawSlug) seenSlugs.set(rawSlug, item);
      if (rawId) seenIds.set(rawId, item);
      if (!rawSlug && !rawId) seenSlugs.set(key, item);
    }
  }

  const unique = [];
  const addedRefs = new Set();
  for (const val of [...seenSlugs.values(), ...seenIds.values()]) {
    const refKey = String(val.slug || '').trim().toLowerCase() || String(val.id || '').trim();
    if (!addedRefs.has(refKey)) {
      addedRefs.add(refKey);
      unique.push(val);
    }
  }
  return unique;
}

/**
 * 10 Authentic Luxury Color Themes for Landing Pages
 */
export const LP_AUTHENTIC_THEMES = {
  emerald: {
    key: 'emerald',
    label: '🟢 রয়্যাল এমেরাল্ড (Royal Emerald — Default)',
    primary: '#059669',
    primaryDark: '#064e3b',
    bevelDark: '#047857',
    primaryLight: '#ecfdf5',
    accent: '#f59e0b',
    accentDark: '#d97706',
    heroGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 52%, #059669 100%)',
    cardBorder: '#a7f3d0',
    badgeBg: 'rgba(16, 185, 129, 0.22)',
    badgeText: '#6ee7b7',
    glow: 'rgba(5, 150, 105, 0.30)'
  },
  midnight_gold: {
    key: 'midnight_gold',
    label: '👑 মিডনাইট নেভি ও গোল্ড (Midnight Navy & Luxury Gold)',
    primary: '#b45309',
    primaryDark: '#0f172a',
    bevelDark: '#92400e',
    primaryLight: '#fffbeb',
    accent: '#f59e0b',
    accentDark: '#d97706',
    heroGradient: 'linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e293b 100%)',
    cardBorder: '#fde68a',
    badgeBg: 'rgba(245, 158, 11, 0.22)',
    badgeText: '#fcd34d',
    glow: 'rgba(217, 119, 6, 0.30)'
  },
  rose: {
    key: 'rose',
    label: '🌹 ভেলভেট রোজ ও বেরি (Velvet Rose & Berry — Fashion/Beauty)',
    primary: '#e11d48',
    primaryDark: '#881337',
    bevelDark: '#be123c',
    primaryLight: '#fff1f2',
    accent: '#fb7185',
    accentDark: '#be123c',
    heroGradient: 'linear-gradient(135deg, #4c0519 0%, #881337 52%, #e11d48 100%)',
    cardBorder: '#fecdd3',
    badgeBg: 'rgba(244, 63, 94, 0.24)',
    badgeText: '#fda4af',
    glow: 'rgba(225, 29, 72, 0.30)'
  },
  indigo: {
    key: 'indigo',
    label: '💎 ইম্পেরিয়াল ইন্ডিগো (Imperial Indigo — Tech & Gadgets)',
    primary: '#4f46e5',
    primaryDark: '#1e1b4b',
    bevelDark: '#3730a3',
    primaryLight: '#eef2ff',
    accent: '#38bdf8',
    accentDark: '#0284c7',
    heroGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 52%, #4338ca 100%)',
    cardBorder: '#c7d2fe',
    badgeBg: 'rgba(99, 102, 241, 0.25)',
    badgeText: '#a5b4fc',
    glow: 'rgba(79, 70, 229, 0.30)'
  },
  amber: {
    key: 'amber',
    label: '🍯 অ্যারাবিয়ান অ্যাম্বার ও স্যাফরন (Arabian Amber — Sunnah/Organic)',
    primary: '#d97706',
    primaryDark: '#451a03',
    bevelDark: '#b45309',
    primaryLight: '#fffbeb',
    accent: '#fbbf24',
    accentDark: '#b45309',
    heroGradient: 'linear-gradient(135deg, #271001 0%, #78350f 52%, #d97706 100%)',
    cardBorder: '#fde68a',
    badgeBg: 'rgba(245, 158, 11, 0.24)',
    badgeText: '#fde68a',
    glow: 'rgba(217, 119, 6, 0.30)'
  },
  ocean_teal: {
    key: 'ocean_teal',
    label: '🌊 ওশান টিল ও সাফায়ার (Ocean Teal & Sapphire)',
    primary: '#0d9488',
    primaryDark: '#042f2e',
    bevelDark: '#0f766e',
    primaryLight: '#f0fdfa',
    accent: '#2dd4bf',
    accentDark: '#0f766e',
    heroGradient: 'linear-gradient(135deg, #042f2e 0%, #115e59 52%, #0284c7 100%)',
    cardBorder: '#99f6e4',
    badgeBg: 'rgba(45, 212, 191, 0.22)',
    badgeText: '#5eead4',
    glow: 'rgba(13, 148, 136, 0.30)'
  },
  crimson_flame: {
    key: 'crimson_flame',
    label: '🔥 ফ্ল্যাশ ক্রিমসন ও অরেঞ্জ (Flash Deal Crimson)',
    primary: '#dc2626',
    primaryDark: '#450a0a',
    bevelDark: '#b91c1c',
    primaryLight: '#fef2f2',
    accent: '#f97316',
    accentDark: '#ea580c',
    heroGradient: 'linear-gradient(135deg, #450a0a 0%, #991b1b 52%, #ea580c 100%)',
    cardBorder: '#fecaca',
    badgeBg: 'rgba(249, 115, 22, 0.25)',
    badgeText: '#fdba74',
    glow: 'rgba(220, 38, 38, 0.30)'
  },
  royal_plum: {
    key: 'royal_plum',
    label: '🔮 রয়্যাল প্লাম ও ভায়োলেট (Royal Plum Luxury)',
    primary: '#7c3aed',
    primaryDark: '#2e1065',
    bevelDark: '#6d28d9',
    primaryLight: '#f5f3ff',
    accent: '#e879f9',
    accentDark: '#c026d3',
    heroGradient: 'linear-gradient(135deg, #1e0936 0%, #4c1d95 52%, #7c3aed 100%)',
    cardBorder: '#ddd6fe',
    badgeBg: 'rgba(167, 139, 250, 0.24)',
    badgeText: '#c4b5fd',
    glow: 'rgba(124, 58, 237, 0.30)'
  },
  espresso_bronze: {
    key: 'espresso_bronze',
    label: '☕ এসপ্রেসো ব্রোঞ্জ ও কফি (Espresso Bronze — Leather/Watch/Perfume)',
    primary: '#78350f',
    primaryDark: '#1c1917',
    bevelDark: '#572408',
    primaryLight: '#fafaf9',
    accent: '#d97706',
    accentDark: '#92400e',
    heroGradient: 'linear-gradient(135deg, #0c0a09 0%, #292524 52%, #78350f 100%)',
    cardBorder: '#e7e5e4',
    badgeBg: 'rgba(217, 119, 6, 0.22)',
    badgeText: '#fcd34d',
    glow: 'rgba(120, 53, 15, 0.30)'
  },
  obsidian_black: {
    key: 'obsidian_black',
    label: '🖤 অবসিডিয়ান ব্ল্যাক ও প্লাটিনাম (Obsidian VIP Edition)',
    primary: '#18181b',
    primaryDark: '#09090b',
    bevelDark: '#27272a',
    primaryLight: '#f4f4f5',
    accent: '#10b981',
    accentDark: '#059669',
    heroGradient: 'linear-gradient(135deg, #000000 0%, #18181b 55%, #27272a 100%)',
    cardBorder: '#d4d4d8',
    badgeBg: 'rgba(16, 185, 129, 0.22)',
    badgeText: '#6ee7b7',
    glow: 'rgba(24, 24, 27, 0.32)'
  }
};

function injectAdminThemeOptions() {
  if (typeof document === 'undefined') return;
  const selectEl = document.getElementById('adm-lp-theme');
  if (!selectEl || selectEl.dataset.themesUpgraded === 'true') return;
  const currentVal = selectEl.value || 'emerald';
  selectEl.innerHTML = Object.values(LP_AUTHENTIC_THEMES)
    .map(t => `<option value="${t.key}">${t.label}</option>`)
    .join('');
  if (LP_AUTHENTIC_THEMES[currentVal]) {
    selectEl.value = currentVal;
  }
  selectEl.dataset.themesUpgraded = 'true';
}

function installLandingPageDeduplicator() {
  if (typeof window === 'undefined' || window.__dcbdLpDeduplicatorInstalled) return;
  window.__dcbdLpDeduplicatorInstalled = true;

  try {
    const raw = localStorage.getItem('dcbd_landing_pages');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const deduped = deduplicateLandingPagesList(parsed);
        if (deduped.length !== parsed.length) {
          localStorage.setItem('dcbd_landing_pages', JSON.stringify(deduped));
        }
      }
    }
  } catch (e) {}

  if (apiClient && typeof apiClient.request === 'function' && !apiClient.__lpDedupWrapped) {
    const origRequest = apiClient.request.bind(apiClient);
    apiClient.request = async function(endpoint, payload = {}, method = 'GET') {
      const res = await origRequest(endpoint, payload, method);
      if (endpoint === 'landing_pages/list' && res && Array.isArray(res.data)) {
        res.data = deduplicateLandingPagesList(res.data);
      }
      return res;
    };
    apiClient.__lpDedupWrapped = true;
  }

  let _adminLpGetter = window.getAdminLandingPages;
  Object.defineProperty(window, 'getAdminLandingPages', {
    configurable: true,
    enumerable: true,
    get() {
      return function(...args) {
        if (typeof _adminLpGetter === 'function') {
          const list = _adminLpGetter.apply(this, args);
          return deduplicateLandingPagesList(list);
        }
        return [];
      };
    },
    set(fn) {
      _adminLpGetter = function(...args) {
        const list = fn.apply(this, args);
        const deduped = deduplicateLandingPagesList(list);
        try {
          if (window.__adminState && Array.isArray(window.__adminState.landingPages)) {
            window.__adminState.landingPages = deduped;
          }
          localStorage.setItem('dcbd_landing_pages', JSON.stringify(deduped));
        } catch (e) {}
        return deduped;
      };
    }
  });

  if (typeof MutationObserver !== 'undefined' && document.body) {
    const observer = new MutationObserver(() => {
      injectAdminThemeOptions();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(injectAdminThemeOptions, 150);
  }
}

if (typeof window !== 'undefined') {
  installLandingPageDeduplicator();
  window.__lpSelectedPackage = 0;
  window.__lpSelectedColor = '';
  window.__lpSelectedSize = '';
  window.__lpSelectedPayment = 'COD';
  window.__lpQuantity = 1;
  window.__lpActiveConfig = null;
  window.__lpPackages = [];
  window.__lpCountdownTimer = null;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseListField(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(s => String(s || '').trim()).filter(Boolean);
  const str = String(raw).trim();
  if (!str) return [];
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.map(s => String(s || '').trim()).filter(Boolean);
    } catch (e) {}
  }
  return str.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
}

function parseFaqField(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map(item => ({
        q: String(item?.q || item?.question || '').trim(),
        a: String(item?.a || item?.answer || '').trim()
      }))
      .filter(item => item.q && item.a);
  }
  const str = String(raw).trim();
  if (!str) return [];
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed
          .map(item => ({
            q: String(item?.q || item?.question || '').trim(),
            a: String(item?.a || item?.answer || '').trim()
          }))
          .filter(item => item.q && item.a);
      }
    } catch (e) {}
  }
  return str
    .split(/\r?\n/)
    .map(line => {
      const parts = line.split('|');
      if (parts.length >= 2) {
        return { q: parts[0].trim(), a: parts.slice(1).join('|').trim() };
      }
      return null;
    })
    .filter(Boolean);
}

function toYouTubeEmbed(url) {
  if (!url) return '';
  const str = String(url).trim();
  if (!str) return '';
  const ytMatch = str.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,15})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
  }
  return str;
}

function resolveThemePalette(themeKey) {
  const key = String(themeKey || 'emerald').trim().toLowerCase();
  return LP_AUTHENTIC_THEMES[key] || LP_AUTHENTIC_THEMES.emerald;
}

function extractRequestedSlug(params = {}) {
  if (params && typeof params === 'object') {
    if (params.slug) return String(params.slug).trim();
    if (params.id) return String(params.id).trim();
  }
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const s = urlParams.get('slug') || urlParams.get('lp') || urlParams.get('campaign') || urlParams.get('id');
    if (s) return s.trim();
    const hash = window.location.hash || '';
    if (hash.includes('?')) {
      const hashQuery = new URLSearchParams(hash.split('?')[1]);
      const hs = hashQuery.get('slug') || hashQuery.get('lp') || hashQuery.get('id');
      if (hs) return hs.trim();
    }
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && (pathParts[0] === 'landing' || pathParts[0] === 'lp')) {
      return decodeURIComponent(pathParts[1]).trim();
    }
  }
  return '';
}

function getInstantCachedLandingPages() {
  let allPages = [];
  try {
    if (typeof window !== 'undefined' && window.__adminState && Array.isArray(window.__adminState.landingPages)) {
      allPages.push(...window.__adminState.landingPages);
    }
  } catch (e) {}
  try {
    const raw = localStorage.getItem('dcbd_landing_pages');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) allPages.push(...parsed);
    }
  } catch (e) {}
  try {
    const legacy = localStorage.getItem('dcbd_landing_config');
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (parsedLegacy && typeof parsedLegacy === 'object') {
        allPages.push(parsedLegacy);
      }
    }
  } catch (e) {}
  return deduplicateLandingPagesList(allPages);
}

function getInstantCachedProducts() {
  if (Array.isArray(apiClient?.products) && apiClient.products.length > 0) {
    return apiClient.products;
  }
  try {
    const raw = localStorage.getItem('dcbd_cached_products_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [];
}

/**
 * Instant 0ms local lookup + non-blocking background refresh so the Landing Page
 * opens immediately even on weak 2G/3G mobile data.
 */
async function resolveLandingPageConfig(requestedSlug) {
  let allPages = getInstantCachedLandingPages();
  let allProducts = getInstantCachedProducts();

  // Trigger non-blocking background sync to keep data fresh
  const backgroundSyncPromise = (async () => {
    try {
      const [lpRes, prodRes] = await Promise.all([
        apiClient.request('landing_pages/list').catch(() => ({ data: [] })),
        apiClient.request('products/list').catch(() => ({ data: [] }))
      ]);
      if (Array.isArray(lpRes?.data) && lpRes.data.length > 0) {
        const merged = deduplicateLandingPagesList([...lpRes.data, ...allPages]);
        try {
          localStorage.setItem('dcbd_landing_pages', JSON.stringify(merged));
        } catch (e) {}
        allPages = merged;
      }
      if (Array.isArray(prodRes?.data) && prodRes.data.length > 0) {
        allProducts = prodRes.data;
        try {
          localStorage.setItem('dcbd_cached_products_v1', JSON.stringify(prodRes.data.slice(0, 120)));
        } catch (e) {}
      }
    } catch (e) {}
  })();

  // Only wait up to 380ms if both local caches are completely empty on first-ever visit
  if (allPages.length === 0 || allProducts.length === 0) {
    await Promise.race([
      backgroundSyncPromise,
      new Promise(resolve => setTimeout(resolve, 380))
    ]);
    if (allPages.length === 0) allPages = getInstantCachedLandingPages();
    if (allProducts.length === 0) allProducts = getInstantCachedProducts();
  }

  let matched = null;
  if (requestedSlug) {
    const target = requestedSlug.toLowerCase();
    matched = allPages.find(
      p =>
        String(p.slug || '').trim().toLowerCase() === target ||
        String(p.id || '').trim().toLowerCase() === target
    );
  }
  if (!matched && allPages.length > 0) {
    matched = allPages.find(p => String(p.status || 'PUBLISHED').toUpperCase() !== 'DRAFT') || allPages[0];
  }

  return { config: matched || null, allProducts };
}

function buildPackagesFromConfig(config, allProducts) {
  if (!config) return [];

  let productIds = [];
  if (Array.isArray(config.product_ids)) {
    productIds = config.product_ids.map(id => String(id).trim()).filter(Boolean);
  } else if (typeof config.product_ids === 'string' && config.product_ids.trim()) {
    const raw = config.product_ids.trim();
    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) productIds = parsed.map(id => String(id).trim()).filter(Boolean);
      } catch (e) {}
    } else {
      productIds = raw.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (config.product_id && !productIds.includes(String(config.product_id).trim())) {
    productIds.unshift(String(config.product_id).trim());
  }

  const matchedProducts = productIds
    .map(pid =>
      allProducts.find(
        p =>
          String(p.id || p.ID || '').trim() === pid ||
          String(p.slug || '').trim() === pid
      )
    )
    .filter(Boolean);

  const packages = [];
  matchedProducts.forEach((prod, idx) => {
    const baseRegular = Number(prod.regular_price || prod.price || 0);
    const baseSale = Number(prod.sale_price || prod.price || baseRegular || 0);
    const price = idx === 0 && Number(config.offer_price) > 0 ? Number(config.offer_price) : baseSale;
    const comparePrice =
      idx === 0 && Number(config.compare_price) > 0
        ? Number(config.compare_price)
        : Math.max(baseRegular, price);

    packages.push({
      index: idx,
      product_id: String(prod.id || prod.ID || `LP-PROD-${idx + 1}`),
      title: String(prod.title || prod.name || '').trim(),
      subtitle: String(prod.category || prod.short_description || '').trim(),
      price: price,
      compare_price: comparePrice,
      image_url: String(prod.image_url || prod.image || config.hero_image || '').trim(),
      colors: parseListField(prod.colors || config.colors),
      sizes: parseListField(prod.sizes || config.sizes),
      badge: idx === 0 && config.badge_text ? String(config.badge_text).trim() : '',
      stock_status: prod.stock_quantity !== undefined && Number(prod.stock_quantity) <= 0 ? 'Out of Stock' : 'In Stock'
    });
  });

  if (packages.length === 0 && (config.title || config.headline)) {
    const offerPrice = Number(config.offer_price || config.price || 0);
    const comparePrice = Number(config.compare_price || config.regular_price || offerPrice);
    if (offerPrice > 0 || config.hero_image || config.title) {
      packages.push({
        index: 0,
        product_id: String(config.product_id || config.id || 'LP-CAMPAIGN-ITEM'),
        title: String(config.title || config.headline || '').trim(),
        subtitle: String(config.subheadline || '').trim(),
        price: offerPrice,
        compare_price: Math.max(comparePrice, offerPrice),
        image_url: String(config.hero_image || '').trim(),
        colors: parseListField(config.colors),
        sizes: parseListField(config.sizes),
        badge: String(config.badge_text || '').trim(),
        stock_status: 'In Stock'
      });
    }
  }

  return packages;
}

/**
 * 100% Self-Contained Scoped CSS with 3D Product Cards, Floating Pedestals,
 * Glass Shimmer Sweeps, Free Delivery Progress Bar, and Online Payment Selector.
 */
function buildLandingStyles(palette) {
  return `
    <style id="dcbd-landing-scoped-styles">
      :root {
        --lp-primary: ${palette.primary};
        --lp-primary-dark: ${palette.primaryDark};
        --lp-bevel-dark: ${palette.bevelDark || palette.primaryDark};
        --lp-primary-light: ${palette.primaryLight};
        --lp-accent: ${palette.accent};
        --lp-accent-dark: ${palette.accentDark};
        --lp-card-border: ${palette.cardBorder};
        --lp-glow: ${palette.glow};
      }
      .lp-wrapper {
        font-family: 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        background: linear-gradient(180deg, #f8fafc 0%, #ffffff 35%, #f1f5f9 100%);
        color: #0f172a;
        min-height: 100vh;
        overflow-x: hidden;
      }
      .lp-wrapper *, .lp-wrapper *::before, .lp-wrapper *::after {
        box-sizing: border-box;
      }
      .lp-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
      }
      @keyframes lpPulseGlow {
        0%, 100% { transform: scale(1); box-shadow: 0 12px 28px -6px var(--lp-glow), 0 5px 0 var(--lp-bevel-dark); }
        50% { transform: scale(1.02); box-shadow: 0 18px 36px -4px var(--lp-glow), 0 5px 0 var(--lp-bevel-dark); }
      }
      @keyframes lpFloat3D {
        0%, 100% { transform: translateY(0px) rotateX(0deg); }
        50% { transform: translateY(-7px) rotateX(2deg); }
      }
      @keyframes lpShimmerSweep {
        0% { transform: translateX(-140%) skewX(-22deg); }
        100% { transform: translateX(240%) skewX(-22deg); }
      }
      .lp-cta-btn {
        background: linear-gradient(135deg, var(--lp-primary) 0%, var(--lp-primary-dark) 100%);
        color: #ffffff !important;
        animation: lpPulseGlow 2.8s infinite ease-in-out;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        border: none;
        border-bottom: 5px solid var(--lp-bevel-dark);
        cursor: pointer;
        text-decoration: none !important;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .lp-cta-btn:hover {
        transform: translateY(-3px) scale(1.015);
        filter: brightness(1.06);
      }
      .lp-cta-btn:active {
        transform: translateY(2px);
        border-bottom-width: 2px;
      }
      .lp-float-img {
        animation: lpFloat3D 5s ease-in-out infinite;
      }

      /* Top Navigation Bar */
      .lp-topbar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(255, 255, 255, 0.94);
        backdrop-filter: blur(16px);
        border-bottom: 1px solid #e2e8f0;
        box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05);
      }
      .lp-topbar-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 0;
        flex-wrap: wrap;
      }
      .lp-brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: #0f172a;
      }
      .lp-brand-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 900;
        font-size: 18px;
        background: ${palette.heroGradient};
        box-shadow: 0 4px 0 var(--lp-bevel-dark), 0 8px 16px -4px var(--lp-glow);
        flex-shrink: 0;
      }
      .lp-topbar-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .lp-btn-outline {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 14px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 700;
        color: #334155;
        background: #f8fafc;
        border: 1.5px solid #cbd5e1;
        border-bottom: 3.5px solid #94a3b8;
        text-decoration: none;
        transition: all 0.2s ease;
        cursor: pointer;
      }
      .lp-btn-outline:hover {
        background: #f1f5f9;
        color: #0f172a;
        border-color: #94a3b8;
        transform: translateY(-2px);
      }

      /* Hero Banner Section */
      .lp-hero {
        position: relative;
        overflow: hidden;
        padding: 44px 0 56px;
        background: ${palette.heroGradient};
        color: #ffffff;
      }
      .lp-hero-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 32px;
        align-items: center;
      }
      @media (min-width: 992px) {
        .lp-hero {
          padding: 68px 0 80px;
        }
        .lp-hero-grid.has-media {
          grid-template-columns: 7fr 5fr;
          gap: 44px;
        }
      }
      .lp-hero-title {
        font-size: clamp(26px, 4.5vw, 48px);
        font-weight: 900;
        line-height: 1.22;
        margin: 0 0 16px;
        color: #ffffff;
        text-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
      }
      .lp-hero-sub {
        font-size: clamp(15px, 2vw, 19px);
        line-height: 1.65;
        color: rgba(255, 255, 255, 0.9);
        margin: 0 0 24px;
        max-width: 680px;
      }
      .lp-hero-price-box {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px;
        padding: 16px 22px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.11);
        border: 1.5px solid rgba(255, 255, 255, 0.24);
        box-shadow: 0 18px 38px -10px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(12px);
        margin-bottom: 24px;
      }
      .lp-hero-img-card {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.24);
        border-bottom: 7px solid rgba(255, 255, 255, 0.35);
        border-radius: 28px;
        padding: 16px;
        backdrop-filter: blur(12px);
        box-shadow: 0 28px 55px -12px rgba(0, 0, 0, 0.48);
        max-width: 480px;
        margin: 0 auto;
        perspective: 1200px;
      }
      .lp-hero-img-card img {
        width: 100%;
        max-height: 400px;
        object-fit: contain;
        border-radius: 20px;
        background: #ffffff;
        display: block;
        box-shadow: 0 14px 28px -8px rgba(15, 23, 42, 0.25);
      }

      /* Section Headings */
      .lp-section {
        padding: 48px 0;
      }
      .lp-section-header {
        text-align: center;
        max-width: 720px;
        margin: 0 auto 36px;
      }
      .lp-section-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 18px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        background: var(--lp-primary-light);
        color: var(--lp-primary);
        border: 1.5px solid var(--lp-card-border);
        box-shadow: 0 3px 0 var(--lp-card-border);
        margin-bottom: 12px;
      }
      .lp-section-title {
        font-size: clamp(22px, 3.5vw, 34px);
        font-weight: 900;
        color: #0f172a;
        margin: 0 0 8px;
        line-height: 1.25;
      }
      .lp-section-desc {
        font-size: 14.5px;
        color: #64748b;
        margin: 0;
      }

      /* 3D LUXURY PRODUCT SHOWCASE GRID */
      .lp-products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(265px, 1fr));
        gap: 26px;
        align-items: stretch;
        perspective: 1400px;
      }
      .lp-showcase-card {
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 24px;
        border: 2px solid #e2e8f0;
        border-bottom: 7px solid #cbd5e1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        transform-style: preserve-3d;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease;
        box-shadow: 0 14px 30px -10px rgba(15, 23, 42, 0.10), 0 4px 10px -2px rgba(15, 23, 42, 0.04);
        cursor: pointer;
      }
      .lp-showcase-card::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 45%;
        height: 100%;
        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%);
        transform: translateX(-160%) skewX(-22deg);
        pointer-events: none;
        z-index: 3;
      }
      .lp-showcase-card:hover {
        transform: translateY(-9px) rotateX(2.5deg) scale(1.015);
        border-color: var(--lp-primary);
        border-bottom-color: var(--lp-bevel-dark);
        box-shadow: 0 26px 48px -12px var(--lp-glow), 0 10px 20px -6px rgba(15, 23, 42, 0.12);
      }
      .lp-showcase-card:hover::after {
        animation: lpShimmerSweep 0.85s ease-in-out;
      }
      .lp-showcase-card.is-selected {
        border-color: var(--lp-primary);
        border-bottom: 7px solid var(--lp-bevel-dark);
        background: linear-gradient(180deg, #ffffff 0%, var(--lp-primary-light) 100%);
        box-shadow: 0 22px 44px -10px var(--lp-glow), 0 0 0 3px var(--lp-card-border);
      }
      .lp-showcase-media {
        position: relative;
        width: 100%;
        height: 235px;
        background: radial-gradient(circle at 50% 60%, #ffffff 0%, #f1f5f9 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
        border-bottom: 1px solid #f1f5f9;
        overflow: hidden;
      }
      /* 3D Floating Pedestal Shadow under Product Image */
      .lp-showcase-media::before {
        content: "";
        position: absolute;
        bottom: 10px;
        width: 62%;
        height: 14px;
        background: radial-gradient(ellipse at center, rgba(15, 23, 42, 0.18) 0%, rgba(15, 23, 42, 0) 75%);
        border-radius: 50%;
        pointer-events: none;
        transition: transform 0.35s ease, opacity 0.35s ease;
      }
      .lp-showcase-card:hover .lp-showcase-media::before {
        transform: scale(0.88);
        opacity: 0.85;
      }
      .lp-showcase-media img {
        max-width: 100%;
        max-height: 198px;
        width: auto;
        height: auto;
        object-fit: contain;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        filter: drop-shadow(0 10px 16px rgba(15, 23, 42, 0.12));
        position: relative;
        z-index: 1;
      }
      .lp-showcase-card:hover .lp-showcase-media img {
        transform: translateY(-6px) scale(1.06);
        filter: drop-shadow(0 18px 22px rgba(15, 23, 42, 0.18));
      }
      .lp-showcase-badge-left {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 800;
        color: #ffffff;
        background: var(--lp-primary);
        box-shadow: 0 3px 0 var(--lp-bevel-dark), 0 6px 12px rgba(0, 0, 0, 0.15);
        z-index: 2;
      }
      .lp-showcase-badge-right {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 5px 11px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 900;
        color: #ffffff;
        background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
        box-shadow: 0 3px 0 #881337, 0 6px 12px rgba(225, 29, 72, 0.25);
        z-index: 2;
      }
      .lp-showcase-body {
        padding: 18px 18px 20px;
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: space-between;
        gap: 12px;
      }
      .lp-showcase-title {
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.4;
        margin: 0 0 4px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-break: break-word;
      }
      .lp-showcase-sub {
        font-size: 12.5px;
        color: #64748b;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .lp-showcase-price-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
        padding-top: 10px;
        border-top: 1px dashed #e2e8f0;
      }
      .lp-showcase-price {
        font-size: 23px;
        font-weight: 900;
        color: var(--lp-primary);
      }
      .lp-showcase-old-price {
        font-size: 13px;
        color: #94a3b8;
        text-decoration: line-through;
        font-weight: 600;
      }
      .lp-showcase-btn {
        width: 100%;
        padding: 11px 14px;
        border-radius: 14px;
        font-size: 13.5px;
        font-weight: 800;
        border: 1.5px solid var(--lp-card-border);
        border-bottom: 4px solid var(--lp-card-border);
        background: var(--lp-primary-light);
        color: var(--lp-primary);
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .lp-showcase-card:hover .lp-showcase-btn,
      .lp-showcase-card.is-selected .lp-showcase-btn {
        background: linear-gradient(135deg, var(--lp-primary) 0%, var(--lp-primary-dark) 100%);
        color: #ffffff;
        border-color: var(--lp-primary);
        border-bottom: 4px solid var(--lp-bevel-dark);
        box-shadow: 0 8px 18px -4px var(--lp-glow);
      }

      /* Features & Why Choose Us Cards */
      .lp-features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
      }
      .lp-feature-item {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 18px 20px;
        border-radius: 18px;
        background: #ffffff;
        border: 1.5px solid #e2e8f0;
        border-bottom: 5px solid #cbd5e1;
        box-shadow: 0 6px 20px -6px rgba(15, 23, 42, 0.05);
        transition: transform 0.25s ease, border-color 0.25s ease;
      }
      .lp-feature-item:hover {
        transform: translateY(-4px);
        border-color: var(--lp-primary);
        border-bottom-color: var(--lp-bevel-dark);
      }
      .lp-feature-icon {
        width: 36px;
        height: 36px;
        border-radius: 11px;
        background: var(--lp-primary);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 15px;
        flex-shrink: 0;
        box-shadow: 0 3px 0 var(--lp-bevel-dark);
      }

      /* Checkout Container & 2-Column Layout */
      .lp-checkout-card {
        background: #ffffff;
        border-radius: 28px;
        border: 2px solid var(--lp-card-border);
        border-bottom: 8px solid var(--lp-primary);
        box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.12);
        overflow: hidden;
      }
      .lp-checkout-header {
        background: ${palette.heroGradient};
        padding: 28px 24px;
        text-align: center;
        color: #ffffff;
      }
      .lp-checkout-body {
        padding: 24px 18px 32px;
      }
      @media (min-width: 768px) {
        .lp-checkout-body {
          padding: 36px 36px 42px;
        }
      }
      .lp-checkout-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 28px;
        align-items: start;
      }
      @media (min-width: 992px) {
        .lp-checkout-grid {
          grid-template-columns: 7fr 5fr;
          gap: 36px;
        }
      }

      /* 3D Checkout Product Selector Cards (Step 1) */
      .lp-pkg-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
      }
      @media (min-width: 640px) {
        .lp-pkg-grid.multi-pkg {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .lp-pkg-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 13px 14px;
        border-radius: 18px;
        border: 2px solid #e2e8f0;
        border-bottom: 5px solid #cbd5e1;
        background: #ffffff;
        cursor: pointer;
        transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        min-width: 0;
      }
      .lp-pkg-card:hover {
        border-color: var(--lp-primary);
        border-bottom-color: var(--lp-bevel-dark);
        background: #f8fafc;
        transform: translateY(-3px);
      }
      .lp-pkg-card.is-selected {
        border-color: var(--lp-primary);
        border-bottom: 5px solid var(--lp-bevel-dark);
        background: var(--lp-primary-light);
        box-shadow: 0 12px 26px -6px var(--lp-glow);
      }
      .lp-pkg-radio {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid #cbd5e1;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 12px;
        font-weight: 900;
        color: transparent;
        transition: all 0.2s ease;
      }
      .lp-pkg-card.is-selected .lp-pkg-radio {
        border-color: var(--lp-primary);
        background: var(--lp-primary);
        color: #ffffff;
      }
      .lp-pkg-thumb {
        width: 60px;
        height: 60px;
        border-radius: 13px;
        object-fit: contain;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        padding: 3px;
        flex-shrink: 0;
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
      }
      .lp-pkg-info {
        flex: 1;
        min-width: 0;
      }
      .lp-pkg-title {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.35;
        margin: 0 0 3px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-break: break-word;
      }
      .lp-pkg-sub {
        font-size: 11.5px;
        color: #64748b;
        margin: 0 0 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .lp-pkg-price-wrap {
        display: flex;
        align-items: baseline;
        gap: 6px;
        flex-wrap: wrap;
      }
      .lp-pkg-price {
        font-size: 16.5px;
        font-weight: 900;
        color: var(--lp-primary);
      }
      .lp-pkg-old-price {
        font-size: 11.5px;
        color: #94a3b8;
        text-decoration: line-through;
      }

      /* Form Controls & Variant Pills */
      .lp-input {
        width: 100%;
        padding: 13px 16px;
        border-radius: 14px;
        border: 1.5px solid #cbd5e1;
        background: #f8fafc;
        font-size: 14.5px;
        font-weight: 600;
        color: #0f172a;
        transition: all 0.2s ease;
        font-family: inherit;
      }
      .lp-input:focus {
        outline: none;
        background: #ffffff;
        border-color: var(--lp-primary);
        box-shadow: 0 0 0 4px var(--lp-primary-light);
      }
      .lp-label {
        display: block;
        font-size: 13.5px;
        font-weight: 800;
        color: #334155;
        margin-bottom: 6px;
      }
      .lp-pill-btn {
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 800;
        border: 2px solid #e2e8f0;
        border-bottom: 4px solid #cbd5e1;
        background: #ffffff;
        color: #334155;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      .lp-pill-btn:hover {
        border-color: var(--lp-primary);
      }
      .lp-pill-btn.is-active {
        border-color: var(--lp-primary);
        border-bottom-color: var(--lp-bevel-dark);
        background: var(--lp-primary);
        color: #ffffff;
        box-shadow: 0 6px 14px -3px var(--lp-glow);
      }
      .lp-delivery-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        border-radius: 14px;
        border: 2px solid #e2e8f0;
        border-bottom: 4px solid #cbd5e1;
        background: #ffffff;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 8px;
      }
      .lp-delivery-label:hover {
        border-color: var(--lp-primary);
      }
      .lp-delivery-label.is-selected {
        border-color: var(--lp-primary);
        border-bottom-color: var(--lp-bevel-dark);
        background: var(--lp-primary-light);
      }

      /* Payment Method Cards (COD + 5% Online Payment Discount) */
      .lp-pay-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 10px;
      }
      .lp-pay-card {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 11px 12px;
        border-radius: 14px;
        border: 2px solid #e2e8f0;
        border-bottom: 4px solid #cbd5e1;
        background: #ffffff;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      }
      .lp-pay-card:hover {
        border-color: var(--lp-primary);
        transform: translateY(-2px);
      }
      .lp-pay-card.is-selected {
        border-color: var(--lp-primary);
        border-bottom-color: var(--lp-bevel-dark);
        background: var(--lp-primary-light);
        box-shadow: 0 8px 18px -4px var(--lp-glow);
      }
      .lp-pay-badge-5pct {
        position: absolute;
        top: -8px;
        right: 8px;
        background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
        color: #ffffff;
        font-size: 10px;
        font-weight: 900;
        padding: 2px 7px;
        border-radius: 999px;
        box-shadow: 0 2px 6px rgba(225, 29, 72, 0.3);
      }

      /* Free Delivery Animated Progress Box */
      .lp-free-deliv-banner {
        border-radius: 16px;
        padding: 12px 15px;
        margin-bottom: 16px;
        border: 1.5px solid #a7f3d0;
        background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
        transition: all 0.3s ease;
      }
      .lp-free-deliv-bar-bg {
        width: 100%;
        height: 8px;
        background: #d1fae5;
        border-radius: 999px;
        overflow: hidden;
        margin-top: 7px;
      }
      .lp-free-deliv-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        border-radius: 999px;
        transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Order Summary Receipt Box */
      .lp-summary-card {
        background: #f8fafc;
        border-radius: 22px;
        padding: 22px;
        border: 2px solid #e2e8f0;
        border-bottom: 6px solid #cbd5e1;
      }
      @media (min-width: 992px) {
        .lp-summary-sticky {
          position: sticky;
          top: 88px;
        }
      }

      /* Sticky Mobile Bottom Bar */
      .lp-mobile-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 45;
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(14px);
        border-top: 1px solid #e2e8f0;
        padding: 10px 14px;
        box-shadow: 0 -8px 25px rgba(15, 23, 42, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      @media (min-width: 768px) {
        .lp-mobile-bar {
          display: none;
        }
      }
    </style>
  `;
}

function startCountdownTimer(endTimeStr) {
  if (typeof window === 'undefined') return;
  if (window.__lpCountdownTimer) {
    clearInterval(window.__lpCountdownTimer);
    window.__lpCountdownTimer = null;
  }
  if (!endTimeStr) return;

  const targetTime = new Date(endTimeStr).getTime();
  if (isNaN(targetTime)) return;

  const updateTick = () => {
    const now = Date.now();
    const diff = targetTime - now;
    const daysEl = document.getElementById('lp-cd-days');
    const hoursEl = document.getElementById('lp-cd-hours');
    const minsEl = document.getElementById('lp-cd-mins');
    const secsEl = document.getElementById('lp-cd-secs');
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      clearInterval(window.__lpCountdownTimer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  };

  setTimeout(updateTick, 30);
  window.__lpCountdownTimer = setInterval(updateTick, 1000);
}

/**
 * Recalculates Live Order Summary including:
 * - Free Delivery when Subtotal >= ৳2,000 (or when `free_shipping` is enabled)
 * - 5% Instant Discount when an Online Payment method (`BKASH`, `NAGAD`, `ROCKET`, `BANK`) is selected
 */
function recalculateLpSummary() {
  if (typeof document === 'undefined') return;
  const pkgs = window.__lpPackages || [];
  const selectedIdx = Number(window.__lpSelectedPackage || 0);
  const pkg = pkgs[selectedIdx] || pkgs[0];
  if (!pkg) return;

  const qty = Math.max(1, Number(window.__lpQuantity || 1));
  const config = window.__lpActiveConfig || {};
  const siteSettings = getGlobalSiteSettings ? getGlobalSiteSettings() : {};
  const freeThreshold = Number(siteSettings?.freeDeliveryThreshold || 2000);
  const onlineDiscountPct = Number(siteSettings?.onlineDiscountPct || 5);

  const isFreeShippingAlways = config.free_shipping === true || String(config.free_shipping).toUpperCase() === 'TRUE';

  let baseDeliveryFee = 0;
  let selectedDeliveryLabel = '';
  const selectedRadio = document.querySelector('input[name="lp-delivery-zone"]:checked');
  if (selectedRadio) {
    baseDeliveryFee = Number(selectedRadio.getAttribute('data-fee') || 0);
    selectedDeliveryLabel = String(selectedRadio.value || '');
  }

  document.querySelectorAll('.lp-delivery-label').forEach(lbl => {
    const inp = lbl.querySelector('input[name="lp-delivery-zone"]');
    if (inp && inp.checked) {
      lbl.classList.add('is-selected');
    } else {
      lbl.classList.remove('is-selected');
    }
  });

  const unitPrice = Number(pkg.price || 0);
  const compareUnitPrice = Number(pkg.compare_price || unitPrice);
  const subtotal = unitPrice * qty;
  const compareTotal = compareUnitPrice * qty;
  const productSavings = Math.max(0, compareTotal - subtotal);

  // Free Delivery check: Subtotal >= 2000 OR campaign free_shipping
  const qualifiesFreeDelivery = isFreeShippingAlways || subtotal >= freeThreshold;
  const finalDeliveryFee = qualifiesFreeDelivery ? 0 : baseDeliveryFee;

  // Update Free Delivery Progress Banner
  const freeBannerEl = document.getElementById('lp-free-delivery-banner');
  if (freeBannerEl) {
    const pct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
    const remaining = Math.max(0, freeThreshold - subtotal);
    if (qualifiesFreeDelivery) {
      freeBannerEl.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:800;color:#065f46;">
          <span>🎉 অভিনন্দন! ২,০০০+ টাকার অর্ডারে আপনি পাচ্ছেন সম্পূর্ণ <strong>ফ্রি ডেলিভারি (৳০)</strong>!</span>
          <span style="background:#059669;color:#fff;padding:2px 9px;border-radius:999px;font-size:11px;">FREE</span>
        </div>
        <div class="lp-free-deliv-bar-bg">
          <div class="lp-free-deliv-bar-fill" style="width:100%;"></div>
        </div>
      `;
    } else {
      freeBannerEl.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:800;color:#0f172a;">
          <span>🚚 আর মাত্র <strong style="color:var(--lp-primary);">${formatCurrency(remaining)}</strong> টাকার পণ্য যোগ করলেই <strong>ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</strong></span>
          <span style="font-size:11.5px;color:#059669;font-weight:900;">${pct}%</span>
        </div>
        <div class="lp-free-deliv-bar-bg">
          <div class="lp-free-deliv-bar-fill" style="width:${pct}%;"></div>
        </div>
      `;
    }
  }

  // Update delivery zone fee badges dynamically when Free Delivery unlocks
  document.querySelectorAll('.lp-delivery-fee-badge').forEach(badge => {
    const rawFee = Number(badge.getAttribute('data-raw-fee') || 0);
    if (qualifiesFreeDelivery) {
      badge.innerHTML = `<span style="text-decoration:line-through;color:#94a3b8;font-size:12px;margin-right:5px;">${formatCurrency(rawFee)}</span><span style="color:#059669;font-weight:900;">ফ্রি (৳০)</span>`;
    } else {
      badge.textContent = formatCurrency(rawFee);
    }
  });

  // Online Payment 5% Discount calculation
  const selectedPaymentId = String(window.__lpSelectedPayment || 'COD').toUpperCase();
  const isOnlinePayment = selectedPaymentId !== 'COD';
  const onlineDiscountAmount = isOnlinePayment ? Math.round((subtotal * onlineDiscountPct) / 100) : 0;

  const grandTotal = Math.max(0, subtotal - onlineDiscountAmount + finalDeliveryFee);

  const titleEl = document.getElementById('lp-sum-title');
  const thumbEl = document.getElementById('lp-sum-thumb');
  const variantEl = document.getElementById('lp-sum-variant');
  const qtyEl = document.getElementById('lp-sum-qty');
  const qtyInputEl = document.getElementById('lp-qty-display');
  const subtotalEl = document.getElementById('lp-sum-subtotal');
  const deliveryEl = document.getElementById('lp-sum-delivery');
  const onlineDiscRowEl = document.getElementById('lp-sum-online-disc-row');
  const onlineDiscValEl = document.getElementById('lp-sum-online-disc-val');
  const savingsRowEl = document.getElementById('lp-sum-savings-row');
  const savingsValEl = document.getElementById('lp-sum-savings');
  const totalEl = document.getElementById('lp-sum-total');
  const btnTotalEl = document.getElementById('lp-submit-btn-total');
  const stickyPriceEl = document.getElementById('lp-sticky-bar-price');

  if (titleEl) titleEl.textContent = pkg.title;
  if (thumbEl && pkg.image_url) thumbEl.src = pkg.image_url;

  if (variantEl) {
    const parts = [];
    if (window.__lpSelectedColor) parts.push(`কালার: ${window.__lpSelectedColor}`);
    if (window.__lpSelectedSize) parts.push(`সাইজ: ${window.__lpSelectedSize}`);
    variantEl.textContent = parts.join(' • ');
    variantEl.style.display = parts.length > 0 ? 'block' : 'none';
  }

  if (qtyEl) qtyEl.textContent = `${qty} টি`;
  if (qtyInputEl) qtyInputEl.textContent = String(qty);
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);

  if (deliveryEl) {
    if (qualifiesFreeDelivery) {
      deliveryEl.innerHTML = `<span style="color:#059669;font-weight:900;">ফ্রি ডেলিভারি (৳০)</span>`;
    } else {
      deliveryEl.textContent = `${formatCurrency(finalDeliveryFee)}${selectedDeliveryLabel ? ` (${selectedDeliveryLabel})` : ''}`;
    }
  }

  if (onlineDiscRowEl && onlineDiscValEl) {
    if (onlineDiscountAmount > 0) {
      onlineDiscRowEl.style.display = 'flex';
      onlineDiscValEl.textContent = `- ${formatCurrency(onlineDiscountAmount)}`;
    } else {
      onlineDiscRowEl.style.display = 'none';
    }
  }

  const totalSavings = productSavings + onlineDiscountAmount + (qualifiesFreeDelivery ? baseDeliveryFee : 0);
  if (savingsRowEl && savingsValEl) {
    if (totalSavings > 0) {
      savingsRowEl.style.display = 'flex';
      savingsValEl.textContent = `- ${formatCurrency(totalSavings)}`;
    } else {
      savingsRowEl.style.display = 'none';
    }
  }

  if (totalEl) totalEl.textContent = formatCurrency(grandTotal);
  if (btnTotalEl) btnTotalEl.textContent = formatCurrency(grandTotal);
  if (stickyPriceEl) stickyPriceEl.textContent = formatCurrency(grandTotal);
}

function renderDynamicVariantSelectors(pkg) {
  const container = document.getElementById('lp-dynamic-variants-box');
  if (!container || !pkg) return;

  const colors = Array.isArray(pkg.colors) ? pkg.colors : [];
  const sizes = Array.isArray(pkg.sizes) ? pkg.sizes : [];

  if (colors.length > 0 && !colors.includes(window.__lpSelectedColor)) {
    window.__lpSelectedColor = colors[0];
  } else if (colors.length === 0) {
    window.__lpSelectedColor = '';
  }

  if (sizes.length > 0 && !sizes.includes(window.__lpSelectedSize)) {
    window.__lpSelectedSize = sizes[0];
  } else if (sizes.length === 0) {
    window.__lpSelectedSize = '';
  }

  if (colors.length === 0 && sizes.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  let html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding-top:8px;">';

  if (colors.length > 0) {
    html += `
      <div>
        <label class="lp-label">🎨 কালার নির্বাচন করুন <span style="color:#ef4444">*</span></label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${colors
            .map(c => {
              const active = window.__lpSelectedColor === c;
              return `<button type="button" onclick="window.selectLpColor('${escapeHtml(c)}')" class="lp-pill-btn ${active ? 'is-active' : ''}">${escapeHtml(c)}</button>`;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  if (sizes.length > 0) {
    html += `
      <div>
        <label class="lp-label">📏 সাইজ নির্বাচন করুন <span style="color:#ef4444">*</span></label>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${sizes
            .map(s => {
              const active = window.__lpSelectedSize === s;
              return `<button type="button" onclick="window.selectLpSize('${escapeHtml(s)}')" class="lp-pill-btn ${active ? 'is-active' : ''}">${escapeHtml(s)}</button>`;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  html += '</div>';
  container.innerHTML = html;
}

function renderPaymentMethodDetails() {
  if (typeof document === 'undefined') return;
  const selectedId = String(window.__lpSelectedPayment || 'COD').toUpperCase();
  const paymentMethods = getGlobalPaymentMethods ? getGlobalPaymentMethods(true) : [];
  const method = paymentMethods.find(m => String(m.id || '').toUpperCase() === selectedId) || paymentMethods[0];

  document.querySelectorAll('.lp-pay-card').forEach(card => {
    const id = String(card.getAttribute('data-pay-id') || '').toUpperCase();
    if (id === selectedId) {
      card.classList.add('is-selected');
    } else {
      card.classList.remove('is-selected');
    }
  });

  const infoBox = document.getElementById('lp-payment-instructions-box');
  if (!infoBox) return;

  if (!method || selectedId === 'COD') {
    infoBox.innerHTML = `
      <div style="margin-top:10px;padding:12px 14px;border-radius:14px;background:#f8fafc;border:1.5px dashed #cbd5e1;font-size:13px;color:#475569;font-weight:600;display:flex;align-items:center;gap:8px;">
        <span style="font-size:18px;">🚚</span>
        <span>পণ্য হাতে পেয়ে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করবেন। <strong>অনলাইন পেমেন্ট (বিকাশ/নগদ/রকেট) সিলেক্ট করলে সাথে সাথে ৫% ডিসকাউন্ট পাবেন!</strong></span>
      </div>
    `;
    return;
  }

  const accNum = String(method.number || '01577319660').trim();
  const gwUrl = String(method.gatewayUrl || '').trim();

  infoBox.innerHTML = `
    <div style="margin-top:12px;padding:15px 16px;border-radius:16px;background:linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%);border:2px solid #fecdd3;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
        <span style="font-size:13.5px;font-weight:900;color:#be123c;">🎁 অনলাইন পেমেন্টে ৫% ডিসকাউন্ট প্রযোজ্য হয়েছে!</span>
        <span style="background:#e11d48;color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:999px;">5% OFF</span>
      </div>
      <p style="font-size:13px;color:#334155;font-weight:600;margin:0 0 10px;line-height:1.5;">
        ${escapeHtml(method.instructions || `${method.title}-এ পেমেন্ট সম্পন্ন করে নিচে ট্রানজেকশন আইডি (TrxID) লিখুন।`)}
      </p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:#ffffff;padding:10px 14px;border-radius:12px;border:1.5px solid #fda4af;margin-bottom:12px;">
        <div>
          <div style="font-size:11px;color:#64748b;font-weight:700;">${escapeHtml(method.title)} নাম্বার (${escapeHtml(method.accountType || 'Personal / Send Money')}):</div>
          <div style="font-size:17px;font-weight:900;color:#0f172a;letter-spacing:0.03em;">${escapeHtml(accNum)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <button type="button" onclick="window.copyLpPaymentNumber('${escapeHtml(accNum)}')" style="padding:8px 13px;border-radius:10px;border:1.5px solid #e11d48;background:#fff1f2;color:#be123c;font-size:12.5px;font-weight:800;cursor:pointer;">
            📋 নাম্বার কপি করুন
          </button>
          ${
            gwUrl
              ? `<a href="${escapeHtml(gwUrl)}" target="_blank" rel="noopener noreferrer" style="padding:8px 13px;border-radius:10px;background:#e11d48;color:#ffffff;font-size:12.5px;font-weight:800;text-decoration:none;">⚡ সরাসরি পেমেন্ট লিংক</a>`
              : ''
          }
        </div>
      </div>
      <div>
        <label class="lp-label" style="color:#881337;">🔢 ট্রানজেকশন আইডি (TrxID) / প্রেরক নাম্বার <span style="color:#e11d48">*</span></label>
        <input type="text" id="lp-cust-trxid" class="lp-input" placeholder="যেমন: BGH789XYZ অথবা যে নাম্বার থেকে পাঠিয়েছেন" style="background:#ffffff;border-color:#fda4af;" />
      </div>
    </div>
  `;
}

function bindWindowHandlers() {
  if (typeof window === 'undefined') return;

  window.scrollToLpSection = function(sectionId) {
    const targetId = sectionId || 'lp-products-section';
    const el = document.getElementById(targetId) || document.getElementById('lp-checkout-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  window.selectLpPackage = function(index, scrollToCheckout = false) {
    const pkgs = window.__lpPackages || [];
    const idx = Number(index);
    if (isNaN(idx) || idx < 0 || idx >= pkgs.length) return;
    window.__lpSelectedPackage = idx;

    document.querySelectorAll('.lp-pkg-card').forEach(card => {
      const cardIdx = Number(card.getAttribute('data-pkg-idx'));
      if (cardIdx === idx) {
        card.classList.add('is-selected');
      } else {
        card.classList.remove('is-selected');
      }
    });

    document.querySelectorAll('.lp-showcase-card').forEach(card => {
      const cardIdx = Number(card.getAttribute('data-showcase-idx'));
      const btn = card.querySelector('.lp-showcase-btn');
      if (cardIdx === idx) {
        card.classList.add('is-selected');
        if (btn) btn.innerHTML = '✓ নির্বাচিত — নিচে অর্ডার সম্পন্ন করুন';
      } else {
        card.classList.remove('is-selected');
        if (btn) btn.innerHTML = '🛒 এই পণ্যটি অর্ডার করুন';
      }
    });

    renderDynamicVariantSelectors(pkgs[idx]);
    recalculateLpSummary();

    if (scrollToCheckout) {
      const formEl = document.getElementById('lp-checkout-section');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  window.selectLpColor = function(color) {
    window.__lpSelectedColor = color;
    const pkgs = window.__lpPackages || [];
    renderDynamicVariantSelectors(pkgs[window.__lpSelectedPackage || 0]);
    recalculateLpSummary();
  };

  window.selectLpSize = function(size) {
    window.__lpSelectedSize = size;
    const pkgs = window.__lpPackages || [];
    renderDynamicVariantSelectors(pkgs[window.__lpSelectedPackage || 0]);
    recalculateLpSummary();
  };

  window.selectLpPaymentMethod = function(payId) {
    window.__lpSelectedPayment = String(payId || 'COD').toUpperCase();
    renderPaymentMethodDetails();
    recalculateLpSummary();
  };

  window.copyLpPaymentNumber = function(num) {
    if (!num) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(String(num)).then(() => {
        toast.success(`নাম্বার কপি হয়েছে: ${num}`);
      }).catch(() => {
        toast.success(`নাম্বার: ${num}`);
      });
    } else {
      toast.success(`নাম্বার: ${num}`);
    }
  };

  window.updateLpQty = function(delta) {
    const next = Math.max(1, Math.min(50, Number(window.__lpQuantity || 1) + Number(delta)));
    window.__lpQuantity = next;
    recalculateLpSummary();
  };

  window.onLpDeliveryChange = function() {
    recalculateLpSummary();
  };

  window.toggleLpFaq = function(idx) {
    const body = document.getElementById(`lp-faq-body-${idx}`);
    const icon = document.getElementById(`lp-faq-icon-${idx}`);
    if (!body) return;
    const isHidden = body.style.display === 'none' || !body.style.display;
    body.style.display = isHidden ? 'block' : 'none';
    if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  };

  /**
   * 0ms Instant Order Submit (Works seamlessly even on slow 2G/3G connections)
   */
  window.submitLpDirectOrder = async function(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    const nameEl = document.getElementById('lp-cust-name');
    const phoneEl = document.getElementById('lp-cust-phone');
    const addressEl = document.getElementById('lp-cust-address');
    const noteEl = document.getElementById('lp-cust-note');
    const trxEl = document.getElementById('lp-cust-trxid');
    const submitBtn = document.getElementById('lp-submit-order-btn');

    const name = String(nameEl?.value || '').trim();
    const phone = String(phoneEl?.value || '').trim();
    const address = String(addressEl?.value || '').trim();
    const note = String(noteEl?.value || '').trim();
    const trxId = String(trxEl?.value || '').trim();

    if (!name) {
      toast.error('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      nameEl?.focus();
      return;
    }
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^(\+?880|0)1[3-9]\d{8}$/.test(cleanPhone)) {
      toast.error('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)।');
      phoneEl?.focus();
      return;
    }
    if (!address || address.length < 4) {
      toast.error('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      addressEl?.focus();
      return;
    }

    const selectedPaymentId = String(window.__lpSelectedPayment || 'COD').toUpperCase();
    if (selectedPaymentId !== 'COD' && !trxId) {
      toast.error('অনলাইন পেমেন্টের ক্ষেত্রে অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) অথবা প্রেরক নাম্বার লিখুন।');
      trxEl?.focus();
      return;
    }

    const pkgs = window.__lpPackages || [];
    const pkg = pkgs[window.__lpSelectedPackage || 0] || pkgs[0];
    if (!pkg) {
      toast.error('কোনো পণ্য নির্বাচন করা হয়নি।');
      return;
    }

    const qty = Math.max(1, Number(window.__lpQuantity || 1));
    const config = window.__lpActiveConfig || {};
    const siteSettings = getGlobalSiteSettings ? getGlobalSiteSettings() : {};
    const freeThreshold = Number(siteSettings?.freeDeliveryThreshold || 2000);
    const onlineDiscountPct = Number(siteSettings?.onlineDiscountPct || 5);

    const isFreeShippingAlways = config.free_shipping === true || String(config.free_shipping).toUpperCase() === 'TRUE';

    let deliveryZone = 'ঢাকার ভেতরে';
    let baseDeliveryFee = 0;
    const selectedRadio = document.querySelector('input[name="lp-delivery-zone"]:checked');
    if (selectedRadio) {
      deliveryZone = selectedRadio.value || deliveryZone;
      baseDeliveryFee = Number(selectedRadio.getAttribute('data-fee') || 0);
    }

    const subtotal = Number(pkg.price || 0) * qty;
    const qualifiesFreeDelivery = isFreeShippingAlways || subtotal >= freeThreshold;
    const deliveryFee = qualifiesFreeDelivery ? 0 : baseDeliveryFee;

    const isOnlinePayment = selectedPaymentId !== 'COD';
    const discountAmount = isOnlinePayment ? Math.round((subtotal * onlineDiscountPct) / 100) : 0;
    const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

    const variantParts = [];
    if (window.__lpSelectedColor) variantParts.push(`Color: ${window.__lpSelectedColor}`);
    if (window.__lpSelectedSize) variantParts.push(`Size: ${window.__lpSelectedSize}`);
    const variantSummary = variantParts.join(', ');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>⏳ অর্ডার কনফার্ম হচ্ছে...</span>`;
    }

    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    const orderPayload = {
      orderId,
      id: orderId,
      customerName: name,
      customer_name: name,
      customerPhone: cleanPhone,
      customer_phone: cleanPhone,
      customerEmail: '',
      customerAddress: address,
      customer_address: address,
      deliveryZone,
      delivery_zone: deliveryZone,
      deliveryFee,
      delivery_fee: deliveryFee,
      paymentMethod: selectedPaymentId,
      payment_method: selectedPaymentId,
      transactionId: trxId,
      transaction_id: trxId,
      paymentStatus: isOnlinePayment ? 'PAID_PENDING_VERIFY' : 'UNPAID',
      subtotal,
      discount: discountAmount,
      discount_amount: discountAmount,
      total: grandTotal,
      total_amount: grandTotal,
      notes: [
        note,
        variantSummary ? `[${variantSummary}]` : '',
        qualifiesFreeDelivery ? '[Free Delivery Applied]' : '',
        isOnlinePayment ? `[5% Online Payment Discount: -৳${discountAmount}, TrxID: ${trxId}]` : '',
        config?.slug ? `[Landing Page: ${config.slug}]` : '[Landing Page Order]'
      ]
        .filter(Boolean)
        .join(' | '),
      source: 'LANDING_PAGE',
      landing_slug: config?.slug || '',
      items: [
        {
          id: pkg.product_id,
          product_id: pkg.product_id,
          title: pkg.title + (variantSummary ? ` (${variantSummary})` : ''),
          name: pkg.title + (variantSummary ? ` (${variantSummary})` : ''),
          price: Number(pkg.price || 0),
          quantity: qty,
          image_url: pkg.image_url || '',
          selectedColor: window.__lpSelectedColor || '',
          selectedSize: window.__lpSelectedSize || ''
        }
      ],
      created_at: new Date().toISOString(),
      status: 'PENDING'
    };

    // 1. Save immediately in 0ms to localStorage so OrderSuccessPage & Admin Portal have it right away
    try {
      localStorage.setItem('dcbd_last_order', JSON.stringify(orderPayload));
      const existingOrders = JSON.parse(localStorage.getItem('dcbd_sheet_orders') || '[]');
      existingOrders.unshift(orderPayload);
      localStorage.setItem('dcbd_sheet_orders', JSON.stringify(existingOrders.slice(0, 200)));
    } catch (e) {}

    // 2. Dispatch API request in background; wait at most 180ms so slow internet NEVER blocks navigation
    const syncTask = apiClient.request('orders/create', orderPayload, 'POST').catch(() => null);
    await Promise.race([
      syncTask,
      new Promise(resolve => setTimeout(resolve, 180))
    ]);

    toast.success('আলহামদুলিল্লাহ! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।');
    const targetUrl = `/order-success?orderId=${encodeURIComponent(orderId)}`;
    if (typeof window.navigateTo === 'function') {
      window.navigateTo(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  };
}

/**
 * Primary Landing Page Renderer (100% compatible with `src/router.js`)
 * Returns HTML string in 0ms when cached!
 */
export async function renderLandingPage(params = {}) {
  bindWindowHandlers();
  installLandingPageDeduplicator();

  const requestedSlug = extractRequestedSlug(params);
  const { config, allProducts } = await resolveLandingPageConfig(requestedSlug);
  const siteSettings = getGlobalSiteSettings ? getGlobalSiteSettings() : {};
  const deliveryMethods = getGlobalDeliveryMethods ? getGlobalDeliveryMethods(true) : [
    { id: 'dhaka_inside', title: 'ঢাকার ভেতরে (Inside Dhaka)', fee: 70, estimatedDays: '১-২ দিন' },
    { id: 'dhaka_suburb', title: 'ঢাকার পার্শ্ববর্তী এলাকা (Suburbs)', fee: 100, estimatedDays: '২-৩ দিন' },
    { id: 'dhaka_outside', title: 'ঢাকার বাইরে (Outside Dhaka)', fee: 130, estimatedDays: '২-৪ দিন' }
  ];
  const paymentMethods = getGlobalPaymentMethods ? getGlobalPaymentMethods(true) : [
    { id: 'COD', title: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)', type: 'COD', icon: '🚚' },
    { id: 'BKASH', title: 'বিকাশ (bKash)', type: 'MOBILE_BANKING', number: '01577319660', icon: '💗' },
    { id: 'NAGAD', title: 'নগদ (Nagad)', type: 'MOBILE_BANKING', number: '01577319660', icon: '🧡' },
    { id: 'ROCKET', title: 'রকেট (Rocket)', type: 'MOBILE_BANKING', number: '01577319660', icon: '💜' }
  ];

  const storeName = String(siteSettings?.storeName || siteSettings?.site_name || 'ড্রিম কার্ট বিডি').trim();
  const hotline = String(siteSettings?.supportPhone || siteSettings?.phone || '').trim();
  const whatsapp = String(siteSettings?.whatsappNumber || hotline || '').replace(/[^\d+]/g, '');

  if (!config) {
    const emptyPalette = resolveThemePalette('emerald');
    return `
      ${buildLandingStyles(emptyPalette)}
      <div class="lp-wrapper" style="display:flex;flex-direction:column;min-height:100vh;">
        <header class="lp-topbar">
          <div class="lp-container lp-topbar-inner">
            <a href="/" data-link class="lp-brand">
              <div class="lp-brand-icon">DC</div>
              <span style="font-weight:900;font-size:18px;">${escapeHtml(storeName)}</span>
            </a>
            <a href="/products" data-link class="lp-cta-btn" style="padding:10px 20px;border-radius:12px;font-size:14px;font-weight:800;">
              🛍️ মূল ওয়েবসাইটে যান
            </a>
          </div>
        </header>
        <main style="flex:1;display:flex;align-items:center;justify-content:center;padding:32px 16px;">
          <div style="max-width:480px;width:100%;background:#ffffff;border-radius:28px;padding:36px 28px;text-align:center;border:1px solid #e2e8f0;box-shadow:0 20px 50px -15px rgba(15,23,42,0.08);">
            <div style="width:72px;height:72px;margin:0 auto 20px;border-radius:20px;background:#ecfdf5;color:#059669;display:flex;align-items:center;justify-content:center;font-size:34px;">✨</div>
            <h1 style="font-size:24px;font-weight:900;color:#0f172a;margin:0 0 10px;">ক্যাম্পেইন পেজ প্রস্তুত হচ্ছে</h1>
            <p style="font-size:14.5px;color:#64748b;line-height:1.6;margin:0 0 24px;">
              অ্যাডমিন প্যানেল থেকে নতুন ল্যান্ডিং পেজ তৈরি ও পাবলিশ করলে সেটি এখানে লাইভ দেখা যাবে। আমাদের সকল পণ্য দেখতে মূল ওয়েবসাইটে ভিজিট করুন।
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
              <a href="/products" data-link class="lp-cta-btn" style="padding:13px 24px;border-radius:14px;font-weight:800;font-size:14.5px;">
                🛍️ মূল ওয়েবসাইটে যান
              </a>
              <a href="/admin" data-link class="lp-btn-outline" style="padding:13px 20px;border-radius:14px;">
                ⚙️ অ্যাডমিন প্যানেল
              </a>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  const palette = resolveThemePalette(config.theme_color || config.theme);
  const packages = buildPackagesFromConfig(config, allProducts);

  window.__lpActiveConfig = config;
  window.__lpPackages = packages;
  window.__lpSelectedPackage = 0;
  window.__lpSelectedPayment = 'COD';
  window.__lpQuantity = 1;
  window.__lpSelectedColor = packages[0]?.colors?.[0] || '';
  window.__lpSelectedSize = packages[0]?.sizes?.[0] || '';

  const headline = String(config.headline || config.title || '').trim();
  const subheadline = String(config.subheadline || '').trim();
  const badgeText = String(config.badge_text || '').trim();
  const heroImage = String(config.hero_image || packages[0]?.image_url || '').trim();
  const videoEmbedUrl = toYouTubeEmbed(config.video_url);
  const ctaText = String(config.cta_text || 'অর্ডার কনফার্ম করুন').trim();
  const urgencyText = String(config.urgency_text || '').trim();
  const countdownEnd = String(config.countdown_end || '').trim();
  const isFreeShipping = config.free_shipping === true || String(config.free_shipping).toUpperCase() === 'TRUE';

  const features = parseListField(config.features);
  const whyBuy = parseListField(config.why_buy);
  const galleryImages = parseListField(config.gallery_images);
  const faqs = parseFaqField(config.faqs);

  const guaranteeTitle = String(config.guarantee_title || '').trim();
  const guaranteeText = String(config.guarantee_text || '').trim();
  const socialProofText = String(config.social_proof_text || '').trim();

  const primaryPkg = packages[0] || null;
  const heroOfferPrice = Number(config.offer_price || primaryPkg?.price || 0);
  const heroComparePrice = Number(config.compare_price || primaryPkg?.compare_price || 0);
  const heroDiscountPct =
    heroComparePrice > heroOfferPrice && heroOfferPrice > 0
      ? Math.round(((heroComparePrice - heroOfferPrice) / heroComparePrice) * 100)
      : 0;

  if (countdownEnd) {
    setTimeout(() => startCountdownTimer(countdownEnd), 80);
  }

  // Primary section target when user clicks "অর্ডার করুন"
  const orderScrollTarget = packages.length > 0 ? 'lp-products-section' : 'lp-checkout-section';

  return `
    ${buildLandingStyles(palette)}
    <div class="lp-wrapper">

      <!-- TOP ANNOUNCEMENT BAR (Only rendered if Admin entered urgency_text or badge_text) -->
      ${
        urgencyText || badgeText
          ? `
        <div style="background:var(--lp-primary-dark);color:#ffffff;padding:9px 16px;text-align:center;font-size:13.5px;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.12);">
          <div class="lp-container" style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">
            ${badgeText ? `<span style="background:var(--lp-accent);color:#0f172a;padding:2px 10px;border-radius:999px;font-size:11.5px;font-weight:900;">${escapeHtml(badgeText)}</span>` : ''}
            ${urgencyText ? `<span>${escapeHtml(urgencyText)}</span>` : ''}
          </div>
        </div>
      `
          : ''
      }

      <!-- STICKY HEADER WITH PROMINENT "মূল ওয়েবসাইটে যান" BUTTON -->
      <header class="lp-topbar">
        <div class="lp-container lp-topbar-inner">
          <a href="/" data-link class="lp-brand">
            <div class="lp-brand-icon">DC</div>
            <div>
              <div style="font-size:16px;font-weight:900;color:#0f172a;line-height:1.2;">${escapeHtml(storeName)}</div>
              ${config.title ? `<div style="font-size:11.5px;font-weight:700;color:#64748b;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(config.title)}</div>` : ''}
            </div>
          </a>

          <div class="lp-topbar-actions">
            ${
              hotline
                ? `
              <a href="tel:${escapeHtml(hotline)}" class="lp-btn-outline">
                📞 <span>${escapeHtml(hotline)}</span>
              </a>
            `
                : ''
            }
            <!-- ONLY THIS BUTTON NAVIGATES TO THE MAIN WEBSITE (/products) -->
            <a href="/products" data-link class="lp-btn-outline" style="color:var(--lp-primary);border-color:var(--lp-card-border);background:var(--lp-primary-light);">
              🛍️ <span>মূল ওয়েবসাইটে যান</span>
            </a>
            <!-- THIS BUTTON SCROLLS DIRECTLY TO CAMPAIGN PRODUCTS ON THIS LANDING PAGE -->
            <button type="button" onclick="window.scrollToLpSection('${orderScrollTarget}')" class="lp-cta-btn" style="padding:9px 18px;border-radius:12px;font-size:13.5px;font-weight:800;">
              🛒 <span>অর্ডার করুন</span>
            </button>
          </div>
        </div>
      </header>

      <!-- HERO SECTION -->
      <section class="lp-hero">
        <div class="lp-container">
          <div class="lp-hero-grid ${heroImage ? 'has-media' : ''}">
            <div>
              ${
                badgeText
                  ? `
                <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;font-size:12.5px;font-weight:800;margin-bottom:18px;background:${palette.badgeBg};color:${palette.badgeText};border:1px solid rgba(255,255,255,0.2);">
                  ✨ <span>${escapeHtml(badgeText)}</span>
                </div>
              `
                  : ''
              }

              ${
                headline
                  ? `<h1 class="lp-hero-title">${escapeHtml(headline)}</h1>`
                  : ''
              }

              ${
                subheadline
                  ? `<p class="lp-hero-sub">${escapeHtml(subheadline)}</p>`
                  : ''
              }

              ${
                heroOfferPrice > 0
                  ? `
                <div class="lp-hero-price-box">
                  <div>
                    <div style="font-size:11.5px;font-weight:700;color:rgba(255,255,255,0.75);text-transform:uppercase;">অফার মূল্য</div>
                    <div style="font-size:32px;font-weight:900;color:#fbbf24;line-height:1.1;">${formatCurrency(heroOfferPrice)}</div>
                  </div>
                  ${
                    heroComparePrice > heroOfferPrice
                      ? `
                    <div style="border-left:1px solid rgba(255,255,255,0.2);padding-left:16px;">
                      <div style="font-size:11.5px;color:rgba(255,255,255,0.7);font-weight:600;">রেগুলার মূল্য</div>
                      <div style="font-size:18px;font-weight:700;color:rgba(255,255,255,0.6);text-decoration:line-through;">${formatCurrency(heroComparePrice)}</div>
                    </div>
                    <span style="background:#f43f5e;color:#ffffff;padding:6px 12px;border-radius:10px;font-size:12.5px;font-weight:900;">
                      ${heroDiscountPct}% ছাড়
                    </span>
                  `
                      : ''
                  }
                  <span style="background:rgba(16,185,129,0.25);color:#a7f3d0;border:1px solid rgba(167,243,208,0.4);padding:6px 12px;border-radius:10px;font-size:12.5px;font-weight:800;">
                    🚚 ${isFreeShipping ? 'ফ্রি ডেলিভারি' : '২,০০০+ টাকায় ফ্রি ডেলিভারি'} • 💳 অনলাইন পেমেন্টে ৫% ছাড়
                  </span>
                </div>
              `
                  : ''
              }

              <!-- COUNTDOWN TIMER -->
              ${
                countdownEnd
                  ? `
                <div style="margin-bottom:26px;">
                  <div style="font-size:12.5px;font-weight:800;color:#fcd34d;text-transform:uppercase;margin-bottom:8px;">⏰ অফার শেষ হতে বাকি:</div>
                  <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <div style="background:rgba(15,23,42,0.55);border:1px solid rgba(255,255,255,0.2);border-radius:14px;padding:10px 14px;min-width:68px;text-align:center;">
                      <div id="lp-cd-days" style="font-size:22px;font-weight:900;color:#ffffff;">00</div>
                      <div style="font-size:11px;color:rgba(255,255,255,0.75);font-weight:700;">দিন</div>
                    </div>
                    <div style="background:rgba(15,23,42,0.55);border:1px solid rgba(255,255,255,0.2);border-radius:14px;padding:10px 14px;min-width:68px;text-align:center;">
                      <div id="lp-cd-hours" style="font-size:22px;font-weight:900;color:#ffffff;">00</div>
                      <div style="font-size:11px;color:rgba(255,255,255,0.75);font-weight:700;">ঘণ্টা</div>
                    </div>
                    <div style="background:rgba(15,23,42,0.55);border:1px solid rgba(255,255,255,0.2);border-radius:14px;padding:10px 14px;min-width:68px;text-align:center;">
                      <div id="lp-cd-mins" style="font-size:22px;font-weight:900;color:#ffffff;">00</div>
                      <div style="font-size:11px;color:rgba(255,255,255,0.75);font-weight:700;">মিনিট</div>
                    </div>
                    <div style="background:rgba(15,23,42,0.55);border:1px solid rgba(255,255,255,0.2);border-radius:14px;padding:10px 14px;min-width:68px;text-align:center;">
                      <div id="lp-cd-secs" style="font-size:22px;font-weight:900;color:#fbbf24;">00</div>
                      <div style="font-size:11px;color:rgba(255,255,255,0.75);font-weight:700;">সেকেন্ড</div>
                    </div>
                  </div>
                </div>
              `
                  : ''
              }

              <div style="display:flex;flex-wrap:wrap;gap:14px;align-items:center;">
                <!-- SCROLLS DIRECTLY TO CAMPAIGN PRODUCTS ON THIS LANDING PAGE -->
                <button type="button" onclick="window.scrollToLpSection('${orderScrollTarget}')" style="padding:16px 32px;border-radius:16px;background:linear-gradient(135deg,#fbbf24 0%,#d97706 100%);color:#0f172a;font-size:17px;font-weight:900;border:none;border-bottom:5px solid #92400e;cursor:pointer;box-shadow:0 18px 38px -6px rgba(245,158,11,0.55);display:inline-flex;align-items:center;gap:10px;">
                  🛒 <span>${escapeHtml(ctaText)}</span>
                </button>
                <!-- ONLY THIS BUTTON GOES TO MAIN WEBSITE -->
                <a href="/products" data-link style="padding:15px 24px;border-radius:16px;background:rgba(255,255,255,0.12);color:#ffffff;font-size:15px;font-weight:800;border:1.5px solid rgba(255,255,255,0.28);text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
                  🛍️ <span>মূল ওয়েবসাইটে যান</span>
                </a>
              </div>
            </div>

            ${
              heroImage
                ? `
              <div>
                <div class="lp-hero-img-card lp-float-img">
                  <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(headline)}" loading="eager" fetchpriority="high" />
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      </section>

      <!-- VIDEO SHOWCASE (Only rendered if Admin provided video_url) -->
      ${
        videoEmbedUrl
          ? `
        <section class="lp-section">
          <div class="lp-container" style="max-width:900px;">
            <div style="background:#ffffff;border-radius:24px;padding:14px;border:2px solid #e2e8f0;border-bottom:6px solid #cbd5e1;box-shadow:0 20px 45px -15px rgba(15,23,42,0.08);">
              <div style="position:relative;width:100%;padding-top:56.25%;border-radius:18px;overflow:hidden;background:#0f172a;">
                <iframe
                  src="${escapeHtml(videoEmbedUrl)}"
                  title="${escapeHtml(headline || 'Campaign Video')}"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  loading="lazy">
                </iframe>
              </div>
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- 3D LUXURY CAMPAIGN PRODUCTS SHOWCASE -->
      ${
        packages.length > 0
          ? `
        <section id="lp-products-section" class="lp-section">
          <div class="lp-container">
            <div class="lp-section-header">
              <div class="lp-section-badge">🛍️ ক্যাম্পেইনের পণ্যসমূহ</div>
              <h2 class="lp-section-title">আপনার পছন্দের পণ্যটি বেছে নিন</h2>
              <p class="lp-section-desc">যেকোনো পণ্যে ক্লিক করলে সেটি নিচের অর্ডার ফর্মে অটোমেটিক সিলেক্ট হয়ে যাবে (২,০০০+ টাকায় ফ্রি ডেলিভারি ও অনলাইন পেমেন্টে ৫% ছাড়!)</p>
            </div>

            <div class="lp-products-grid">
              ${packages
                .map((pkg, idx) => {
                  const disc =
                    pkg.compare_price > pkg.price && pkg.price > 0
                      ? Math.round(((pkg.compare_price - pkg.price) / pkg.compare_price) * 100)
                      : 0;
                  const isSelected = idx === 0;
                  return `
                  <div
                    class="lp-showcase-card ${isSelected ? 'is-selected' : ''}"
                    data-showcase-idx="${idx}"
                    onclick="window.selectLpPackage(${idx}, true)">
                    <div>
                      <div class="lp-showcase-media">
                        ${pkg.badge ? `<span class="lp-showcase-badge-left">${escapeHtml(pkg.badge)}</span>` : ''}
                        ${disc > 0 ? `<span class="lp-showcase-badge-right">-${disc}% OFF</span>` : ''}
                        ${
                          pkg.image_url
                            ? `<img src="${escapeHtml(pkg.image_url)}" alt="${escapeHtml(pkg.title)}" loading="lazy" />`
                            : `<div style="font-size:42px;">🛍️</div>`
                        }
                      </div>
                      <div class="lp-showcase-body">
                        <div>
                          <h3 class="lp-showcase-title">${escapeHtml(pkg.title)}</h3>
                          ${pkg.subtitle ? `<p class="lp-showcase-sub">${escapeHtml(pkg.subtitle)}</p>` : ''}
                        </div>
                        <div>
                          <div class="lp-showcase-price-row">
                            <span class="lp-showcase-price">${formatCurrency(pkg.price)}</span>
                            ${
                              pkg.compare_price > pkg.price
                                ? `<span class="lp-showcase-old-price">${formatCurrency(pkg.compare_price)}</span>`
                                : ''
                            }
                          </div>
                          <div style="margin-top:12px;">
                            <button type="button" class="lp-showcase-btn">
                              ${isSelected ? '✓ নির্বাচিত — নিচে অর্ডার সম্পন্ন করুন' : '🛒 এই পণ্যটি অর্ডার করুন'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- FEATURES & WHY BUY SECTION (Only rendered if Admin filled features or why_buy) -->
      ${
        features.length > 0 || whyBuy.length > 0
          ? `
        <section class="lp-section" style="padding-top:16px;">
          <div class="lp-container">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:28px;">
              ${
                features.length > 0
                  ? `
                <div style="background:#ffffff;border-radius:24px;padding:28px 24px;border:2px solid #e2e8f0;border-bottom:6px solid #cbd5e1;box-shadow:0 12px 32px -10px rgba(15,23,42,0.05);">
                  <div class="lp-section-badge">✨ পণ্যের বিশেষত্ব</div>
                  <div class="lp-features-grid" style="grid-template-columns:1fr;margin-top:12px;">
                    ${features
                      .map(
                        item => `
                      <div class="lp-feature-item">
                        <div class="lp-feature-icon">✓</div>
                        <div style="font-size:15px;font-weight:700;color:#1e293b;line-height:1.5;">${escapeHtml(item)}</div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>
              `
                  : ''
              }

              ${
                whyBuy.length > 0
                  ? `
                <div style="background:#ffffff;border-radius:24px;padding:28px 24px;border:2px solid #e2e8f0;border-bottom:6px solid #cbd5e1;box-shadow:0 12px 32px -10px rgba(15,23,42,0.05);">
                  <div class="lp-section-badge" style="background:#fffbeb;color:#b45309;border-color:#fde68a;">🏆 কেন আমাদের থেকে নিবেন?</div>
                  <div class="lp-features-grid" style="grid-template-columns:1fr;margin-top:12px;">
                    ${whyBuy
                      .map(
                        item => `
                      <div class="lp-feature-item" style="background:#fffbeb;border-color:#fde68a;border-bottom-color:#f59e0b;">
                        <div class="lp-feature-icon" style="background:#d97706;box-shadow:0 3px 0 #92400e;">★</div>
                        <div style="font-size:15px;font-weight:700;color:#1e293b;line-height:1.5;">${escapeHtml(item)}</div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>
              `
                  : ''
              }
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- GALLERY IMAGES (Only rendered if Admin provided gallery_images) -->
      ${
        galleryImages.length > 0
          ? `
        <section class="lp-section">
          <div class="lp-container">
            <div class="lp-products-grid">
              ${galleryImages
                .map(
                  imgUrl => `
                <div class="lp-showcase-card" style="padding:12px;">
                  <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(headline)}" style="width:100%;height:260px;object-fit:contain;border-radius:16px;background:#f8fafc;" loading="lazy" />
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- GUARANTEE / SOCIAL PROOF BANNER (Only rendered if Admin provided guarantee or social proof) -->
      ${
        guaranteeTitle || guaranteeText || socialProofText
          ? `
        <section style="padding:16px 0 36px;">
          <div class="lp-container" style="max-width:920px;">
            <div style="border-radius:26px;padding:32px 24px;text-align:center;color:#ffffff;background:${palette.heroGradient};box-shadow:0 20px 45px -12px rgba(15,23,42,0.25);">
              ${
                socialProofText
                  ? `<div style="display:inline-block;padding:6px 16px;border-radius:999px;background:rgba(255,255,255,0.14);font-size:13px;font-weight:800;color:#fde68a;margin-bottom:12px;">🔥 ${escapeHtml(socialProofText)}</div>`
                  : ''
              }
              ${
                guaranteeTitle
                  ? `<h3 style="font-size:24px;font-weight:900;margin:0 0 8px;">🛡️ ${escapeHtml(guaranteeTitle)}</h3>`
                  : ''
              }
              ${
                guaranteeText
                  ? `<p style="font-size:15.5px;color:rgba(255,255,255,0.9);max-width:680px;margin:0 auto;line-height:1.6;">${escapeHtml(guaranteeText)}</p>`
                  : ''
              }
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- FAQ ACCORDION (Only rendered if Admin provided faqs) -->
      ${
        faqs.length > 0
          ? `
        <section class="lp-section" style="padding-top:12px;">
          <div class="lp-container" style="max-width:820px;">
            <div class="lp-section-header">
              <div class="lp-section-badge">❓ সাধারণ জিজ্ঞাসা (FAQ)</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              ${faqs
                .map(
                  (f, i) => `
                <div style="background:#ffffff;border-radius:18px;border:2px solid #e2e8f0;border-bottom:5px solid #cbd5e1;overflow:hidden;">
                  <button
                    type="button"
                    onclick="window.toggleLpFaq(${i})"
                    style="width:100%;padding:16px 20px;background:transparent;border:none;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;cursor:pointer;font-size:15.5px;font-weight:800;color:#0f172a;font-family:inherit;">
                    <span>${escapeHtml(f.q)}</span>
                    <span id="lp-faq-icon-${i}" style="width:28px;height:28px;border-radius:50%;background:#f1f5f9;display:inline-flex;align-items:center;justify-content:center;font-size:12px;transition:transform 0.2s ease;flex-shrink:0;">▼</span>
                  </button>
                  <div id="lp-faq-body-${i}" style="display:${i === 0 ? 'block' : 'none'};padding:0 20px 18px;font-size:14.5px;color:#475569;line-height:1.6;border-top:1px solid #f1f5f9;">
                    ${escapeHtml(f.a)}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- DIRECT CHECKOUT SECTION -->
      ${
        packages.length > 0
          ? `
        <section id="lp-checkout-section" class="lp-section">
          <div class="lp-container" style="max-width:1080px;">
            <div class="lp-checkout-card">

              <div class="lp-checkout-header">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:999px;background:rgba(255,255,255,0.15);font-size:12px;font-weight:800;color:#fde68a;margin-bottom:8px;">
                  🔒 ১০০% নিরাপদ ও দ্রুত অর্ডার ফর্ম
                </div>
                <h2 style="font-size:clamp(22px,3.5vw,32px);font-weight:900;margin:0;">${escapeHtml(ctaText)}</h2>
                <p style="font-size:13.5px;color:rgba(255,255,255,0.88);margin:6px 0 0;">
                  🚚 ২,০০০+ টাকার অর্ডারে <strong>ফ্রি ডেলিভারি</strong> এবং 💳 বিকাশ/নগদ/রকেট অনলাইন পেমেন্টে সাথে সাথে <strong>৫% ডিসকাউন্ট!</strong>
                </p>
              </div>

              <form onsubmit="window.submitLpDirectOrder(event)" class="lp-checkout-body">

                <!-- STEP 1: COMPACT RESPONSIVE 3D PRODUCT / PACKAGE SELECTOR -->
                <div style="margin-bottom:28px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                    <label style="font-size:16px;font-weight:900;color:#0f172a;display:flex;align-items:center;gap:8px;">
                      <span style="width:26px;height:26px;border-radius:50%;background:var(--lp-primary);color:#ffffff;font-size:13px;display:inline-flex;align-items:center;justify-content:center;">১</span>
                      <span>পণ্য / প্যাকেজ নির্বাচন করুন</span>
                    </label>
                    <span style="font-size:12px;font-weight:700;color:#64748b;">পছন্দের কার্ডে ক্লিক করুন</span>
                  </div>

                  <div class="lp-pkg-grid ${packages.length > 1 ? 'multi-pkg' : ''}">
                    ${packages
                      .map((pkg, idx) => {
                        const selected = idx === 0;
                        const disc =
                          pkg.compare_price > pkg.price && pkg.price > 0
                            ? Math.round(((pkg.compare_price - pkg.price) / pkg.compare_price) * 100)
                            : 0;
                        return `
                        <div
                          data-pkg-idx="${idx}"
                          onclick="window.selectLpPackage(${idx}, false)"
                          class="lp-pkg-card ${selected ? 'is-selected' : ''}">
                          <div class="lp-pkg-radio">✓</div>
                          ${
                            pkg.image_url
                              ? `<img src="${escapeHtml(pkg.image_url)}" alt="${escapeHtml(pkg.title)}" class="lp-pkg-thumb" loading="lazy" />`
                              : ''
                          }
                          <div class="lp-pkg-info">
                            <h4 class="lp-pkg-title">${escapeHtml(pkg.title)}</h4>
                            ${pkg.subtitle ? `<p class="lp-pkg-sub">${escapeHtml(pkg.subtitle)}</p>` : ''}
                            <div class="lp-pkg-price-wrap">
                              <span class="lp-pkg-price">${formatCurrency(pkg.price)}</span>
                              ${
                                pkg.compare_price > pkg.price
                                  ? `<span class="lp-pkg-old-price">${formatCurrency(pkg.compare_price)}</span>`
                                  : ''
                              }
                              ${
                                disc > 0
                                  ? `<span style="background:#ffe4e6;color:#e11d48;font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:999px;">-${disc}%</span>`
                                  : ''
                              }
                            </div>
                          </div>
                        </div>
                      `;
                      })
                      .join('')}
                  </div>

                  <!-- Dynamic Color & Size Selector -->
                  <div id="lp-dynamic-variants-box" style="margin-top:14px;"></div>
                </div>

                <!-- STEP 2 & 3: CUSTOMER DETAILS + ORDER SUMMARY -->
                <div class="lp-checkout-grid">

                  <!-- LEFT COLUMN: BILLING, DELIVERY ZONE & PAYMENT METHOD -->
                  <div>
                    <div style="font-size:16px;font-weight:900;color:#0f172a;display:flex;align-items:center;gap:8px;margin-bottom:16px;">
                      <span style="width:26px;height:26px;border-radius:50%;background:var(--lp-primary);color:#ffffff;font-size:13px;display:inline-flex;align-items:center;justify-content:center;">২</span>
                      <span>আপনার ডেলিভারি ও পেমেন্ট তথ্য দিন</span>
                    </div>

                    <div style="margin-bottom:14px;">
                      <label for="lp-cust-name" class="lp-label">আপনার পূর্ণ নাম <span style="color:#ef4444">*</span></label>
                      <input type="text" id="lp-cust-name" required class="lp-input" placeholder="এখানে আপনার নাম লিখুন" />
                    </div>

                    <div style="margin-bottom:14px;">
                      <label for="lp-cust-phone" class="lp-label">মোবাইল নাম্বার (১১ ডিজিট) <span style="color:#ef4444">*</span></label>
                      <input type="tel" id="lp-cust-phone" required class="lp-input" placeholder="017XXXXXXXX" />
                    </div>

                    <div style="margin-bottom:16px;">
                      <label for="lp-cust-address" class="lp-label">সম্পূর্ণ ডেলিভারি ঠিকানা <span style="color:#ef4444">*</span></label>
                      <textarea id="lp-cust-address" rows="2" required class="lp-input" placeholder="বাসা/রোড নং, এলাকা, থানা ও জেলা লিখুন"></textarea>
                    </div>

                    <!-- Delivery Area Radio Buttons -->
                    <div style="margin-bottom:18px;">
                      <label class="lp-label">🚚 ডেলিভারি এরিয়া নির্বাচন করুন <span style="color:#ef4444">*</span></label>
                      <div>
                        ${deliveryMethods
                          .map(
                            (m, idx) => `
                          <label class="lp-delivery-label ${idx === 0 ? 'is-selected' : ''}">
                            <div style="display:flex;align-items:center;gap:10px;">
                              <input
                                type="radio"
                                name="lp-delivery-zone"
                                value="${escapeHtml(m.title)}"
                                data-fee="${Number(m.fee || 0)}"
                                ${idx === 0 ? 'checked' : ''}
                                onchange="window.onLpDeliveryChange()"
                                style="width:17px;height:17px;accent-color:var(--lp-primary);" />
                              <div>
                                <div style="font-size:13.5px;font-weight:800;color:#0f172a;">${escapeHtml(m.title)}</div>
                                ${m.estimatedDays ? `<div style="font-size:11.5px;color:#64748b;">সম্ভাব্য সময়: ${escapeHtml(m.estimatedDays)}</div>` : ''}
                              </div>
                            </div>
                            <span class="lp-delivery-fee-badge" data-raw-fee="${Number(m.fee || 0)}" style="font-size:14px;font-weight:900;color:#0f172a;">
                              ${formatCurrency(m.fee || 0)}
                            </span>
                          </label>
                        `
                          )
                          .join('')}
                      </div>
                    </div>

                    <!-- Payment Method Selector (COD vs Online Payment 5% OFF) -->
                    <div style="margin-bottom:16px;">
                      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                        <label class="lp-label" style="margin-bottom:0;">💳 পেমেন্ট মেথড নির্বাচন করুন <span style="color:#ef4444">*</span></label>
                        <span style="font-size:11.5px;font-weight:900;color:#e11d48;background:#ffe4e6;padding:3px 9px;border-radius:999px;">🔥 অনলাইন পেমেন্টে ৫% ছাড়!</span>
                      </div>

                      <div class="lp-pay-grid">
                        ${paymentMethods
                          .map((pm, idx) => {
                            const pmId = String(pm.id || 'COD').toUpperCase();
                            const isOnline = pmId !== 'COD';
                            const selected = idx === 0;
                            return `
                            <div
                              class="lp-pay-card ${selected ? 'is-selected' : ''}"
                              data-pay-id="${escapeHtml(pmId)}"
                              onclick="window.selectLpPaymentMethod('${escapeHtml(pmId)}')">
                              ${isOnline ? `<span class="lp-pay-badge-5pct">5% ছাড়</span>` : ''}
                              <span style="font-size:20px;flex-shrink:0;">${pm.icon || (isOnline ? '💳' : '🚚')}</span>
                              <div style="min-width:0;">
                                <div style="font-size:12.5px;font-weight:900;color:#0f172a;line-height:1.25;">${escapeHtml(pm.title)}</div>
                                <div style="font-size:10.5px;color:#64748b;font-weight:700;">${isOnline ? '৫% ইনস্ট্যান্ট ডিসকাউন্ট' : 'পণ্য হাতে পেয়ে পেমেন্ট'}</div>
                              </div>
                            </div>
                          `;
                          })
                          .join('')}
                      </div>

                      <!-- Dynamic Payment Instructions & TrxID Box -->
                      <div id="lp-payment-instructions-box"></div>
                    </div>

                    <div>
                      <label for="lp-cust-note" class="lp-label">স্পেশাল নোট (ঐচ্ছিক)</label>
                      <input type="text" id="lp-cust-note" class="lp-input" placeholder="ডেলিভারি সংক্রান্ত কোনো নির্দেশনা থাকলে লিখুন..." />
                    </div>
                  </div>

                  <!-- RIGHT COLUMN: LIVE ORDER SUMMARY -->
                  <div class="lp-summary-card lp-summary-sticky">
                    <div style="font-size:16px;font-weight:900;color:#0f172a;display:flex;align-items:center;gap:8px;padding-bottom:14px;border-bottom:1px solid #e2e8f0;margin-bottom:14px;">
                      <span style="width:26px;height:26px;border-radius:50%;background:var(--lp-primary);color:#ffffff;font-size:13px;display:inline-flex;align-items:center;justify-content:center;">৩</span>
                      <span>অর্ডার সামারি</span>
                    </div>

                    <!-- Live Free Delivery Progress Bar -->
                    <div id="lp-free-delivery-banner" class="lp-free-deliv-banner"></div>

                    <!-- Selected Product Preview -->
                    <div style="display:flex;align-items:center;gap:12px;background:#ffffff;padding:12px;border-radius:16px;border:1.5px solid #e2e8f0;margin-bottom:14px;">
                      ${
                        primaryPkg?.image_url
                          ? `<img id="lp-sum-thumb" src="${escapeHtml(primaryPkg.image_url)}" alt="${escapeHtml(primaryPkg.title)}" style="width:58px;height:58px;border-radius:12px;object-fit:contain;background:#f8fafc;border:1px solid #f1f5f9;padding:3px;flex-shrink:0;" />`
                          : ''
                      }
                      <div style="flex:1;min-width:0;">
                        <h4 id="lp-sum-title" style="font-size:14px;font-weight:800;color:#0f172a;margin:0 0 3px;line-height:1.35;word-break:break-word;">${escapeHtml(primaryPkg?.title || '')}</h4>
                        <p id="lp-sum-variant" style="font-size:12px;font-weight:700;color:var(--lp-primary);margin:0;display:none;"></p>
                      </div>
                    </div>

                    <!-- Quantity Stepper -->
                    <div style="display:flex;align-items:center;justify-content:space-between;background:#ffffff;padding:10px 14px;border-radius:14px;border:1.5px solid #e2e8f0;margin-bottom:16px;">
                      <span style="font-size:13.5px;font-weight:800;color:#334155;">পরিমাণ (Quantity)</span>
                      <div style="display:flex;align-items:center;gap:10px;">
                        <button type="button" onclick="window.updateLpQty(-1)" style="width:32px;height:32px;border-radius:9px;border:1px solid #cbd5e1;background:#f8fafc;font-weight:900;font-size:16px;cursor:pointer;">−</button>
                        <span id="lp-qty-display" style="font-size:15px;font-weight:900;min-width:24px;text-align:center;">1</span>
                        <button type="button" onclick="window.updateLpQty(1)" style="width:32px;height:32px;border-radius:9px;border:1px solid #cbd5e1;background:#f8fafc;font-weight:900;font-size:16px;cursor:pointer;">+</button>
                      </div>
                    </div>

                    <!-- Price Breakdown -->
                    <div style="display:flex;flex-direction:column;gap:10px;font-size:14px;padding-bottom:14px;border-bottom:1px dashed #cbd5e1;margin-bottom:14px;">
                      <div style="display:flex;justify-content:space-between;color:#475569;font-weight:600;">
                        <span>পণ্যের পরিমাণ</span>
                        <span id="lp-sum-qty" style="font-weight:800;color:#0f172a;">1 টি</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;color:#475569;font-weight:600;">
                        <span>সাবটোটাল</span>
                        <span id="lp-sum-subtotal" style="font-weight:800;color:#0f172a;">${formatCurrency(primaryPkg?.price || 0)}</span>
                      </div>
                      <div id="lp-sum-online-disc-row" style="display:none;justify-content:space-between;color:#e11d48;font-weight:800;">
                        <span>🎁 অনলাইন পেমেন্ট ছাড় (৫%)</span>
                        <span id="lp-sum-online-disc-val">- ৳০</span>
                      </div>
                      <div style="display:flex;justify-content:space-between;color:#475569;font-weight:600;">
                        <span>ডেলিভারি চার্জ</span>
                        <span id="lp-sum-delivery" style="font-weight:800;color:#0f172a;">${isFreeShipping ? 'ফ্রি ডেলিভারি (৳০)' : formatCurrency(deliveryMethods[0]?.fee || 0)}</span>
                      </div>
                      <div id="lp-sum-savings-row" style="display:none;justify-content:space-between;color:#059669;font-weight:800;">
                        <span>🎉 সর্বমোট সাশ্রয়</span>
                        <span id="lp-sum-savings">- ৳০</span>
                      </div>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
                      <span style="font-size:16px;font-weight:900;color:#0f172a;">সর্বমোট প্রদেয়</span>
                      <span id="lp-sum-total" style="font-size:26px;font-weight:900;color:var(--lp-primary);">
                        ${formatCurrency((primaryPkg?.price || 0) + (isFreeShipping ? 0 : Number(deliveryMethods[0]?.fee || 0)))}
                      </span>
                    </div>

                    <button
                      type="submit"
                      id="lp-submit-order-btn"
                      class="lp-cta-btn"
                      style="width:100%;padding:16px 20px;border-radius:16px;font-size:16.5px;font-weight:900;">
                      <span>🛒 ${escapeHtml(ctaText)}</span>
                      <span>—</span>
                      <span id="lp-submit-btn-total">${formatCurrency((primaryPkg?.price || 0) + (isFreeShipping ? 0 : Number(deliveryMethods[0]?.fee || 0)))}</span>
                    </button>

                    <div style="margin-top:12px;text-align:center;font-size:12px;font-weight:700;color:#64748b;">
                      ✅ ক্যাশ অন ডেলিভারি ও ৫% ছাড়ে অনলাইন পেমেন্ট সুবিধা
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- FOOTER WITH MAIN WEBSITE LINK -->
      <footer style="background:#0f172a;color:#94a3b8;padding:36px 0 96px;border-top:1px solid #1e293b;">
        <div class="lp-container" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
          <div>
            <div style="color:#ffffff;font-weight:900;font-size:17px;">${escapeHtml(storeName)}</div>
            <div style="font-size:12.5px;margin-top:2px;">© ${new Date().getFullYear()} সর্বস্বত্ব সংরক্ষিত।</div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <a href="/products" data-link style="padding:9px 16px;border-radius:12px;background:#1e293b;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;">
              🛍️ মূল ওয়েবসাইটে যান
            </a>
            ${
              whatsapp
                ? `<a href="https://wa.me/${escapeHtml(whatsapp)}" target="_blank" rel="noopener noreferrer" style="padding:9px 16px;border-radius:12px;background:#059669;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;">💬 WhatsApp সাপোর্ট</a>`
                : ''
            }
          </div>
        </div>
      </footer>

      <!-- MOBILE STICKY BOTTOM BAR -->
      ${
        packages.length > 0
          ? `
        <div class="lp-mobile-bar">
          <div>
            <div style="font-size:10.5px;font-weight:700;color:#64748b;">সর্বমোট মূল্য</div>
            <div id="lp-sticky-bar-price" style="font-size:18px;font-weight:900;color:var(--lp-primary);">${formatCurrency(primaryPkg?.price || 0)}</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <a href="/products" data-link style="padding:10px 12px;border-radius:12px;background:#f1f5f9;color:#334155;font-size:12px;font-weight:800;text-decoration:none;">
              🛍️ মূল সাইট
            </a>
            <button type="button" onclick="window.scrollToLpSection('${orderScrollTarget}')" class="lp-cta-btn" style="padding:10px 16px;border-radius:12px;font-size:13px;font-weight:900;">
              🛒 অর্ডার করুন
            </button>
          </div>
        </div>
      `
          : ''
      }

      <img
        src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        alt=""
        style="display:none;"
        onload="(function(){ if(window.__lpPackages && window.__lpPackages.length){ window.selectLpPackage(window.__lpSelectedPackage || 0, false); } if(window.selectLpPaymentMethod){ window.selectLpPaymentMethod(window.__lpSelectedPayment || 'COD'); } })()" />
    </div>
  `;
}

export const LandingPage = renderLandingPage;
export default renderLandingPage;
