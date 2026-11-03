/**
 * DREAM CART BD — ULTRA-FAST 3D MODERN CAMPAIGN LANDING PAGE (LandingPage.js)
 * Implements all user requirements:
 * - Exports `renderLandingPage(params = {})` returning an HTML string (100% compatible with `src/router.js`).
 * - Instant 0ms Page Open & 0ms Order Submit (even on weak 2G/3G internet): synchronous local cache read + non-blocking background sync.
 * - Multi-Product Campaign Architecture: Removes standalone product-less prices from Section 1 of both the Admin Create Landing Page Form and the Public Hero Section.
 * - Dynamic Delivery Areas & Payment Methods: Admin can select which Admin Panel Delivery Areas (`getGlobalDeliveryMethods`) and Payment Methods (`getGlobalPaymentMethods`) apply to each Landing Page inside the Create Landing Page Form; only those selected options appear on the Public Landing Page and drive live calculations.
 * - Free Delivery (`৳০`) automatically unlocked when Order Subtotal >= ৳2,000 (with live animated progress bar) or when campaign `free_shipping` is enabled.
 * - 5% Instant Discount (`৫% ছাড়`) automatically calculated when any Online Payment method (`BKASH`, `NAGAD`, `ROCKET`, `BANK`, or custom online method) is selected, with 1-click Copy Number, Gateway Link, Bank info & TrxID input.
 * - 3D Style Product Cards, Floating Image Pedestals, Glass Shimmer Sweep, and Tactile 3D Buttons.
 * - Shop Logo (`shopLogo`) displayed in Sticky Navbar, Hero Badge, Checkout Header, and Support Footer.
 * - Automatic deduplication of Admin Landing Pages (`dcbd_landing_pages` & `landing_pages/list`).
 * - Clicking "🛒 অর্ডার করুন" / "🛒 অর্ডার কনফার্ম করুন" smoothly scrolls to "🛍️ ক্যাম্পেইনের পণ্যসমূহ" (`#lp-products-section`) on the SAME landing page.
 * - ONLY clicking "🛍️ মূল ওয়েবসাইটে যান" navigates to the main website's `/products` page.
 */
import { apiClient, getGlobalDeliveryMethods, getGlobalPaymentMethods, getGlobalSiteSettings } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../components/Toast.js';

/**
 * 10 Authentic E-Commerce Campaign Color Themes (with 3D bevel accents)
 */
export const LP_AUTHENTIC_THEMES = {
  emerald: {
    label: '🌿 Royal Emerald (রয়্যাল গ্রিন)',
    primary: '#047857',
    primaryDark: '#064e3b',
    bevel: '#022c22',
    accent: '#f59e0b',
    pageBg: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 45%, #f1f5f9 100%)',
    topBarBg: 'linear-gradient(90deg, #064e3b 0%, #047857 50%, #059669 100%)',
    heroBg: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
    light: '#ecfdf5',
    border: '#6ee7b7',
    glow: 'rgba(4, 120, 87, 0.28)',
    badgeBg: '#065f46',
    badgeText: '#ecfdf5'
  },
  midnight: {
    label: '🌌 Midnight Navy & Gold (নেভি ও গোল্ড)',
    primary: '#1e3a8a',
    primaryDark: '#0f172a',
    bevel: '#020617',
    accent: '#d97706',
    pageBg: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 45%, #f1f5f9 100%)',
    topBarBg: 'linear-gradient(90deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)',
    heroBg: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
    light: '#eff6ff',
    border: '#93c5fd',
    glow: 'rgba(30, 58, 138, 0.28)',
    badgeBg: '#1e3a8a',
    badgeText: '#fef3c7'
  },
  rose: {
    label: '🌹 Velvet Burgundy & Rose (বার্গান্ডি রোজ)',
    primary: '#be123c',
    primaryDark: '#881337',
    bevel: '#4c0519',
    accent: '#f43f5e',
    pageBg: 'linear-gradient(180deg, #fff1f2 0%, #f8fafc 45%, #f1f5f9 100%)',
    topBarBg: 'linear-gradient(90deg, #4c0519 0%, #881337 50%, #be123c 100%)',
    heroBg: 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)',
    light: '#fff1f2',
    border: '#fda4af',
    glow: 'rgba(190, 18, 60, 0.28)',
    badgeBg: '#9f1239',
    badgeText: '#ffe4e6'
  },
  indigo: {
    label: '👑 Imperial Royal Indigo (রয়্যাল ইন্ডিগো)',
    primary: '#4338ca',
    primaryDark: '#312e81',
    bevel: '#1e1b4b',
    accent: '#8b5cf6',
    pageBg: 'linear-gradient(180deg, #eef2ff 0%, #f8fafc 45%, #f1f5f9 100%)',
    topBarBg: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    heroBg: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)',
    light: '#eef2ff',
    border: '#a5b4fc',
    glow: 'rgba(67, 56, 202, 0.28)',
    badgeBg: '#3730a3',
    badgeText: '#e0e7ff'
  },
  amber: {
    label: '✨ Arabian Amber & Gold (অ্যারাবিয়ান গোল্ড)',
    primary: '#b45309',
    primaryDark: '#78350f',
    bevel: '#451a03',
    accent: '#d97706',
    pageBg: 'linear-gradient(180deg, #fffbeb 0%, #f8fafc 45%, #f1f5f9 100%)',
    topBarBg: 'linear-gradient(90deg, #451a03 0%, #78350f 50%, #b45309 100%)',
    heroBg: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
    light: '#fffbeb',
    border: '#fcd34d',
    glow: 'rgba(180, 83, 9, 0.28)',
    badgeBg: '#92400e',
    badgeText: '#fef3c7'
  },
  teal: {
    label: '🌊 Ocean Teal & Cyan (ওশান টিল)',
    primary: '#0f766e',
    primaryDark: '#134e4a',
    bevel: '#042f2e',
    accent: '#0d9488',
    pageBg: 'linear-gradient(180deg, #f0fdfa 0%, #f8fafc 45%, #f1f5f9 100%)',
    topBarBg: 'linear-gradient(90deg, #042f2e 0%, #134e4a 50%, #0f766e 100%)',
    heroBg: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
    light: '#f0fdfa',
    border: '#5eead4',
    glow: 'rgba(15, 118, 110, 0.28)',
    badgeBg: '#115e59',
    badgeText: '#ccfbf1'
  },
  crimson: {
    label: '🔥 Flash Sale Crimson Red (ফ্ল্যাশ সেল রেড)',
    primary: '#dc2626',
    primaryDark: '#7f1d1d',
    bevel: '#450a0a',
    accent: '#ea580c',
    pageBg: 'linear-gradient(180deg, #fef2f2 0%, #f8fafc 45%, #f1f5f9 100%)',
    topBarBg: 'linear-gradient(90deg, #450a0a 0%, #991b1b 50%, #dc2626 100%)',
    heroBg: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
    light: '#fef2f2',
    border: '#fca5a5',
    glow: 'rgba(220, 38, 38, 0.28)',
    badgeBg: '#991b1b',
    badgeText: '#fee2e2'
  },
  plum: {
    label: '🍇 Royal Plum & Magenta (রয়্যাল প্লাম)',
    primary: '#86198f',
    primaryDark: '#4a044e',
    bevel: '#2e1065',
    accent: '#c026d3',
    pageBg: 'linear-gradient(180deg, #fdf4ff 0%, #f8fafc 45%, #f1f5f9 100%)',
    topBarBg: 'linear-gradient(90deg, #2e1065 0%, #581c87 50%, #86198f 100%)',
    heroBg: 'linear-gradient(135deg, #ffffff 0%, #fdf4ff 100%)',
    light: '#fdf4ff',
    border: '#f0abfc',
    glow: 'rgba(134, 25, 143, 0.28)',
    badgeBg: '#701a75',
    badgeText: '#fae8ff'
  },
  chocolate: {
    label: '🍫 Espresso Mocha & Bronze (এসপ্রেসো ব্রোঞ্জ)',
    primary: '#7c2d12',
    primaryDark: '#431407',
    bevel: '#271206',
    accent: '#c2410c',
    pageBg: 'linear-gradient(180deg, #fff7ed 0%, #f8fafc 45%, #f1f5f9 100%)',
    topBarBg: 'linear-gradient(90deg, #271206 0%, #431407 50%, #7c2d12 100%)',
    heroBg: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
    light: '#fff7ed',
    border: '#fdba74',
    glow: 'rgba(124, 45, 18, 0.28)',
    badgeBg: '#7c2d12',
    badgeText: '#ffedd5'
  },
  obsidian: {
    label: '🖤 Obsidian Luxury Black (প্রিমিয়াম ব্ল্যাক)',
    primary: '#18181b',
    primaryDark: '#09090b',
    bevel: '#000000',
    accent: '#10b981',
    pageBg: 'linear-gradient(180deg, #f4f4f5 0%, #f8fafc 45%, #f1f5f9 100%)',
    topBarBg: 'linear-gradient(90deg, #09090b 0%, #18181b 55%, #27272a 100%)',
    heroBg: 'linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%)',
    light: '#f4f4f5',
    border: '#a1a1aa',
    glow: 'rgba(24, 24, 27, 0.28)',
    badgeBg: '#18181b',
    badgeText: '#f4f4f5'
  }
};

// Also support aliases from older theme keys
LP_AUTHENTIC_THEMES.midnight_gold = LP_AUTHENTIC_THEMES.midnight;
LP_AUTHENTIC_THEMES.ocean_teal = LP_AUTHENTIC_THEMES.teal;
LP_AUTHENTIC_THEMES.crimson_flame = LP_AUTHENTIC_THEMES.crimson;
LP_AUTHENTIC_THEMES.royal_plum = LP_AUTHENTIC_THEMES.plum;
LP_AUTHENTIC_THEMES.espresso_bronze = LP_AUTHENTIC_THEMES.chocolate;
LP_AUTHENTIC_THEMES.obsidian_black = LP_AUTHENTIC_THEMES.obsidian;

/**
 * Helper: Detect if a Payment Method object represents Cash on Delivery (COD)
 */
export function isCodPaymentMethod(raw) {
  if (!raw || typeof raw !== 'object') return false;
  const codeStr = String(raw.code || '').toUpperCase().trim();
  const idStr = String(raw.id || '').toUpperCase().trim();
  const typeStr = String(raw.type || raw.accountType || '').toUpperCase().trim();
  const nameStr = String(raw.name || raw.title || raw.method_name || '').toLowerCase().trim();
  const numStr = String(raw.number || raw.account_number || '').toUpperCase().trim();

  return (
    codeStr === 'COD' ||
    idStr === 'COD' ||
    typeStr === 'COD' ||
    numStr === 'COD' ||
    nameStr.includes('ক্যাশ অন ডেলিভারি') ||
    nameStr.includes('cash on delivery') ||
    (nameStr.includes('cod') && !nameStr.includes('code'))
  );
}

/**
 * Normalizes any Delivery Method from Admin Panel (`dcbd_delivery_methods` / `getGlobalDeliveryMethods`)
 */
export function normalizeLpDeliveryMethod(raw, idx = 0) {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `DLV-${idx + 1}`,
      code: `zone_${idx + 1}`,
      name: 'ডেলিভারি এরিয়া',
      zone: 'ডেলিভারি এরিয়া',
      charge: 80,
      eta: '২৪-৭২ ঘণ্টা',
      free_threshold: 2000,
      status: 'Active'
    };
  }
  const id = String(raw.id || raw.code || `DLV-${idx + 1}`).trim();
  const code = String(raw.code || raw.id || `zone_${idx + 1}`).trim();
  const name = String(raw.name || raw.zone || raw.title || 'ডেলিভারি এরিয়া').trim();
  const charge = Number(raw.charge ?? raw.cost ?? raw.fee ?? 0);
  const eta = String(raw.eta || raw.time || '২৪-৭২ ঘণ্টায় ডেলিভারি').trim();
  const freeThreshold = Number(raw.free_threshold !== undefined ? raw.free_threshold : 2000);
  const status = String(raw.status || 'Active').trim();

  return {
    ...raw,
    id,
    code,
    name,
    zone: name,
    charge: Number.isFinite(charge) ? charge : 0,
    eta,
    free_threshold: Number.isFinite(freeThreshold) && freeThreshold > 0 ? freeThreshold : 2000,
    status
  };
}

/**
 * Normalizes any Payment Method from Admin Panel (`dcbd_payment_methods` / `getGlobalPaymentMethods`)
 */
export function normalizeLpPaymentMethod(raw, idx = 0) {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 'COD',
      code: 'COD',
      name: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
      title: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
      type: 'COD',
      isCod: true,
      isOnline: false,
      number: '',
      link: '',
      discount_pct: 0,
      instructions: 'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।',
      icon: '🚚',
      status: 'Active'
    };
  }

  const isCod = isCodPaymentMethod(raw);
  const id = String(raw.id || raw.code || (isCod ? 'COD' : `PM-${idx + 1}`)).trim();
  const code = String(raw.code || raw.id || (isCod ? 'COD' : `PM_${idx + 1}`)).trim();
  const name = String(raw.name || raw.title || raw.method_name || (isCod ? 'ক্যাশ অন ডেলিভারি (COD)' : 'অনলাইন পেমেন্ট')).trim();
  const rawNum = String(raw.number || raw.account_number || '').trim();
  const number = rawNum.toUpperCase() === 'COD' ? '' : rawNum;
  const rawLink = String(raw.link || raw.gatewayUrl || '').trim();
  const link = rawLink || (number.startsWith('http://') || number.startsWith('https://') ? number : '');
  const displayNumber = (number.startsWith('http://') || number.startsWith('https://')) ? '' : number;
  const type = String(raw.type || raw.accountType || (isCod ? 'COD' : 'অনলাইন পেমেন্ট')).trim();
  const instructions = String(
    raw.instructions ||
    raw.details ||
    raw.instruction ||
    (isCod
      ? 'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।'
      : `নিচের ${name} নাম্বারে পেমেন্ট সম্পন্ন করে ট্রানজেকশন আইডি (TrxID) অথবা প্রেরক নাম্বারটি লিখুন।`)
  ).trim();
  const discountPct = isCod ? 0 : (Number(raw.discount_pct ?? raw.discount ?? 5) || 5);

  const lowerKey = `${name} ${code} ${type}`.toLowerCase();
  let icon = raw.icon || '';
  if (!icon) {
    if (isCod) icon = '🚚';
    else if (lowerKey.includes('bkash') || lowerKey.includes('বিকাশ')) icon = '💗';
    else if (lowerKey.includes('nagad') || lowerKey.includes('নগদ')) icon = '🧡';
    else if (lowerKey.includes('rocket') || lowerKey.includes('রকেট')) icon = '💜';
    else if (lowerKey.includes('upay') || lowerKey.includes('উপায়')) icon = '💛';
    else if (lowerKey.includes('bank') || lowerKey.includes('ব্যাংক') || lowerKey.includes('ibbl') || lowerKey.includes('ইসলামী')) icon = '🏦';
    else icon = '💳';
  }

  return {
    ...raw,
    id,
    code,
    name,
    title: name,
    type,
    accountType: type,
    isCod,
    isOnline: !isCod,
    number: displayNumber,
    link,
    gatewayUrl: link,
    discount_pct: discountPct,
    instructions,
    details: instructions,
    icon,
    status: String(raw.status || 'Active').trim()
  };
}

/**
 * Resolves the Delivery Methods configured in Admin Panel and selected for a specific Landing Page
 */
export function resolveLandingPageDeliveryMethods(activePage) {
  const rawGlobal = typeof getGlobalDeliveryMethods === 'function' ? getGlobalDeliveryMethods(false) : [];
  const allGlobal = (Array.isArray(rawGlobal) ? rawGlobal : []).map((d, i) => normalizeLpDeliveryMethod(d, i));
  const activeGlobal = allGlobal.filter(d => String(d.status || 'Active').toLowerCase() !== 'inactive');

  if (!activePage || typeof activePage !== 'object') {
    return activeGlobal.length > 0 ? activeGlobal : allGlobal;
  }

  const snapshotList = Array.isArray(activePage.delivery_methods_snapshot)
    ? activePage.delivery_methods_snapshot.map((d, i) => normalizeLpDeliveryMethod(d, i))
    : [];

  let selectedIds = activePage.selected_delivery_methods;
  if (typeof selectedIds === 'string' && selectedIds.trim()) {
    try {
      selectedIds = JSON.parse(selectedIds);
    } catch (e) {
      selectedIds = selectedIds.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    const resolved = [];
    selectedIds.forEach((item, idx) => {
      const targetId = typeof item === 'object'
        ? String(item.id || item.code || item.name || '').trim().toLowerCase()
        : String(item || '').trim().toLowerCase();
      if (!targetId) return;

      const fromGlobal = allGlobal.find(
        g =>
          g.id.toLowerCase() === targetId ||
          g.code.toLowerCase() === targetId ||
          g.name.toLowerCase() === targetId
      );
      if (fromGlobal) {
        resolved.push(fromGlobal);
        return;
      }

      const fromSnap = snapshotList.find(
        s =>
          s.id.toLowerCase() === targetId ||
          s.code.toLowerCase() === targetId ||
          s.name.toLowerCase() === targetId
      );
      if (fromSnap) {
        resolved.push(fromSnap);
        return;
      }

      if (typeof item === 'object' && (item.name || item.zone)) {
        resolved.push(normalizeLpDeliveryMethod(item, idx));
      }
    });

    if (resolved.length > 0) return resolved;
  }

  if (snapshotList.length > 0) return snapshotList;
  return activeGlobal.length > 0 ? activeGlobal : allGlobal;
}

/**
 * Resolves the Payment Methods configured in Admin Panel and selected for a specific Landing Page
 */
export function resolveLandingPagePaymentMethods(activePage) {
  const rawGlobal = typeof getGlobalPaymentMethods === 'function' ? getGlobalPaymentMethods(false) : [];
  const allGlobal = (Array.isArray(rawGlobal) ? rawGlobal : []).map((m, i) => normalizeLpPaymentMethod(m, i));
  const activeGlobal = allGlobal.filter(m => String(m.status || 'Active').toLowerCase() !== 'inactive');

  if (!activePage || typeof activePage !== 'object') {
    return activeGlobal.length > 0 ? activeGlobal : allGlobal;
  }

  const snapshotList = Array.isArray(activePage.payment_methods_snapshot)
    ? activePage.payment_methods_snapshot.map((m, i) => normalizeLpPaymentMethod(m, i))
    : [];

  let selectedIds = activePage.selected_payment_methods;
  if (typeof selectedIds === 'string' && selectedIds.trim()) {
    try {
      selectedIds = JSON.parse(selectedIds);
    } catch (e) {
      selectedIds = selectedIds.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    const resolved = [];
    selectedIds.forEach((item, idx) => {
      const targetId = typeof item === 'object'
        ? String(item.id || item.code || item.name || '').trim().toLowerCase()
        : String(item || '').trim().toLowerCase();
      if (!targetId) return;

      const fromGlobal = allGlobal.find(
        g =>
          g.id.toLowerCase() === targetId ||
          g.code.toLowerCase() === targetId ||
          g.name.toLowerCase() === targetId
      );
      if (fromGlobal) {
        resolved.push(fromGlobal);
        return;
      }

      const fromSnap = snapshotList.find(
        s =>
          s.id.toLowerCase() === targetId ||
          s.code.toLowerCase() === targetId ||
          s.name.toLowerCase() === targetId
      );
      if (fromSnap) {
        resolved.push(fromSnap);
        return;
      }

      if (typeof item === 'object' && (item.name || item.title)) {
        resolved.push(normalizeLpPaymentMethod(item, idx));
      }
    });

    if (resolved.length > 0) return resolved;
  }

  if (snapshotList.length > 0) return snapshotList;
  return activeGlobal.length > 0 ? activeGlobal : allGlobal;
}

/**
 * Deduplicates landing pages by ID, Slug, and Title so that merging Sheet rows and LocalStorage
 * never creates duplicate cards in the Admin Panel (`adm-saved-landing-pages-grid`).
 * Preserves selected_delivery_methods and selected_payment_methods.
 */
export function deduplicateLandingPagesList(rawList) {
  if (!Array.isArray(rawList)) return [];
  const result = [];
  const seenIds = new Map();
  const seenSlugs = new Map();
  const seenTitles = new Map();

  rawList.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;
    let extraMeta = {};
    const rawMetaStr = item.Social_Icons || item.social_icons || item.content || '';
    if (typeof rawMetaStr === 'string' && rawMetaStr.trim().startsWith('{')) {
      try {
        extraMeta = JSON.parse(rawMetaStr);
      } catch (e) {}
    }

    const mergedSource = { ...extraMeta, ...item };
    const rawTitle = String(mergedSource.title || mergedSource.slogan || mergedSource.Slogan || mergedSource.headline || '').trim();
    const rawId = String(mergedSource.id || mergedSource.page_id || '').trim();
    let rawSlug = String(mergedSource.slug || mergedSource.Slug || '').trim();
    if (!rawSlug || rawSlug === '-' || rawSlug.toLowerCase() === 'slug') {
      rawSlug = (rawId ? rawId.toLowerCase() : `lp-${101 + idx}`);
    }
    const normId = rawId.toLowerCase();
    const normSlug = rawSlug.toLowerCase();
    const normTitle = rawTitle.toLowerCase();

    if (!rawTitle && (!mergedSource.selected_products || mergedSource.selected_products.length === 0) && !mergedSource.hero_banner && !mergedSource.banner) {
      return;
    }

    let matchIdx = -1;
    if (normSlug && seenSlugs.has(normSlug)) {
      matchIdx = seenSlugs.get(normSlug);
    } else if (normId && seenIds.has(normId)) {
      matchIdx = seenIds.get(normId);
    } else if (normTitle && seenTitles.has(normTitle)) {
      matchIdx = seenTitles.get(normTitle);
    }

    const normalizedItem = {
      ...mergedSource,
      id: rawId || `LP-${101 + result.length}`,
      page_id: rawId || `LP-${101 + result.length}`,
      slug: rawSlug,
      title: rawTitle || 'ক্যাম্পেইন ল্যান্ডিং পেজ',
      regular_price: 0,
      offer_price: 0
    };

    if (matchIdx >= 0) {
      const prev = result[matchIdx];
      const merged = {
        ...prev,
        ...normalizedItem,
        id: normalizedItem.id.startsWith('LP-') ? normalizedItem.id : (prev.id || normalizedItem.id),
        page_id: normalizedItem.id.startsWith('LP-') ? normalizedItem.id : (prev.page_id || normalizedItem.page_id),
        slug: (normalizedItem.slug && normalizedItem.slug !== '-') ? normalizedItem.slug : prev.slug,
        title: normalizedItem.title || prev.title,
        subtitle: normalizedItem.subtitle || prev.subtitle || '',
        badge: normalizedItem.badge || prev.badge || '',
        promo: normalizedItem.promo || prev.promo || '',
        theme: normalizedItem.theme || prev.theme || 'emerald',
        hero_banner: normalizedItem.hero_banner || normalizedItem.banner || prev.hero_banner || prev.banner || '',
        regular_price: 0,
        offer_price: 0,
        selected_products: (Array.isArray(normalizedItem.selected_products) && normalizedItem.selected_products.length > 0)
          ? normalizedItem.selected_products
          : (prev.selected_products || []),
        selected_delivery_methods: (Array.isArray(normalizedItem.selected_delivery_methods) && normalizedItem.selected_delivery_methods.length > 0)
          ? normalizedItem.selected_delivery_methods
          : (prev.selected_delivery_methods || []),
        delivery_methods_snapshot: (Array.isArray(normalizedItem.delivery_methods_snapshot) && normalizedItem.delivery_methods_snapshot.length > 0)
          ? normalizedItem.delivery_methods_snapshot
          : (prev.delivery_methods_snapshot || []),
        selected_payment_methods: (Array.isArray(normalizedItem.selected_payment_methods) && normalizedItem.selected_payment_methods.length > 0)
          ? normalizedItem.selected_payment_methods
          : (prev.selected_payment_methods || []),
        payment_methods_snapshot: (Array.isArray(normalizedItem.payment_methods_snapshot) && normalizedItem.payment_methods_snapshot.length > 0)
          ? normalizedItem.payment_methods_snapshot
          : (prev.payment_methods_snapshot || []),
        banners: (Array.isArray(normalizedItem.banners) && normalizedItem.banners.length > 0)
          ? normalizedItem.banners
          : (prev.banners || []),
        videos: (Array.isArray(normalizedItem.videos) && normalizedItem.videos.length > 0)
          ? normalizedItem.videos
          : (prev.videos || []),
        features: (Array.isArray(normalizedItem.features) && normalizedItem.features.length > 0)
          ? normalizedItem.features
          : (prev.features || [])
      };
      result[matchIdx] = merged;
    } else {
      const newIndex = result.length;
      result.push(normalizedItem);
      if (normId) seenIds.set(normId, newIndex);
      if (normSlug) seenSlugs.set(normSlug, newIndex);
      if (normTitle) seenTitles.set(normTitle, newIndex);
    }
  });

  return result;
}

/**
 * Look up shipping cost for the currently selected delivery method ID/code
 */
function getZoneShippingCost(selectedAreaId, deliveryConfs) {
  const confs = Array.isArray(deliveryConfs) ? deliveryConfs : [];
  if (confs.length === 0) return 80;
  const target = String(selectedAreaId || '').trim().toLowerCase();
  const found =
    confs.find(c => String(c.id || '').trim().toLowerCase() === target || String(c.code || '').trim().toLowerCase() === target) ||
    confs[0];
  return found ? Number(found.charge ?? found.cost ?? found.fee ?? 0) : 0;
}

if (typeof window !== 'undefined') {
  window.__lpSelectedPackage = 0;
  window.__lpSelectedColor = '';
  window.__lpSelectedSize = '';
  window.__lpSelectedPayment = 'COD';
  window.__lpSelectedDeliveryId = '';
  window.__lpQuantity = 1;
  window.__lpProductsList = [];
  window.__lpDeliveryConfs = [];
  window.__lpPaymentMethods = [];
  window.__lpFreeThreshold = 2000;
  window.__lpOnlineDiscountPct = 5;

  // 1. Immediately deduplicate localStorage `dcbd_landing_pages` & `window.__adminState.landingPages`
  const syncAndDeduplicateAdminLandingPages = function() {
    try {
      const rawSaved = localStorage.getItem('dcbd_landing_pages');
      if (rawSaved) {
        const parsed = JSON.parse(rawSaved);
        if (Array.isArray(parsed)) {
          const deduped = deduplicateLandingPagesList(parsed);
          localStorage.setItem('dcbd_landing_pages', JSON.stringify(deduped));
          if (window.__adminState && Array.isArray(window.__adminState.landingPages)) {
            window.__adminState.landingPages = deduplicateLandingPagesList(window.__adminState.landingPages);
          }
        }
      }
    } catch (e) {}
  };
  syncAndDeduplicateAdminLandingPages();

  /**
   * 2. Renders Delivery Area & Payment Method selection checkboxes inside the Admin Panel's
   * "Create Landing Page Form" (`#landing-builder-form-card`), directly synced with
   * Admin System Settings (`getGlobalDeliveryMethods` & `getGlobalPaymentMethods`).
   */
  window.renderLpAdminDeliveryAndPaymentCheckboxes = function(draftObj = null) {
    if (typeof document === 'undefined') return;
    const delBox = document.getElementById('adm-lp-delivery-methods-box');
    const payBox = document.getElementById('adm-lp-payment-methods-box');
    if (!delBox || !payBox) return;

    const draft = draftObj || window.__currentLandingDraft || {};
    const allDel = (typeof getGlobalDeliveryMethods === 'function' ? getGlobalDeliveryMethods(false) : []).map((d, i) =>
      normalizeLpDeliveryMethod(d, i)
    );
    const allPay = (typeof getGlobalPaymentMethods === 'function' ? getGlobalPaymentMethods(false) : []).map((m, i) =>
      normalizeLpPaymentMethod(m, i)
    );

    const hasSavedDel = Array.isArray(draft.selected_delivery_methods) && draft.selected_delivery_methods.length > 0;
    const selectedDelSet = new Set(
      hasSavedDel
        ? draft.selected_delivery_methods.map(x => String(typeof x === 'object' ? (x.id || x.code) : x).toLowerCase())
        : allDel.filter(d => String(d.status || 'Active').toLowerCase() !== 'inactive').map(d => d.id.toLowerCase())
    );
    if (selectedDelSet.size === 0 && allDel.length > 0) {
      allDel.forEach(d => selectedDelSet.add(d.id.toLowerCase()));
    }

    const hasSavedPay = Array.isArray(draft.selected_payment_methods) && draft.selected_payment_methods.length > 0;
    const selectedPaySet = new Set(
      hasSavedPay
        ? draft.selected_payment_methods.map(x => String(typeof x === 'object' ? (x.id || x.code) : x).toLowerCase())
        : allPay.filter(m => String(m.status || 'Active').toLowerCase() !== 'inactive').map(m => m.id.toLowerCase())
    );
    if (selectedPaySet.size === 0 && allPay.length > 0) {
      allPay.forEach(m => selectedPaySet.add(m.id.toLowerCase()));
    }

    delBox.innerHTML = allDel
      .map(d => {
        const isChecked = selectedDelSet.has(d.id.toLowerCase()) || selectedDelSet.has(d.code.toLowerCase());
        const chargeTxt = d.charge === 0 ? 'ফ্রি (৳০)' : `৳${d.charge}`;
        return `
          <label class="flex items-start gap-2.5 p-2.5 rounded-xl border ${
            isChecked
              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
          } cursor-pointer transition hover:border-emerald-400">
            <input
              type="checkbox"
              class="adm-lp-del-chk w-4 h-4 mt-0.5 accent-emerald-600 rounded"
              value="${d.id}"
              ${isChecked ? 'checked' : ''}
              onchange="window.syncLpAdminDeliveryPaymentSelection()"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1.5 flex-wrap">
                <span class="font-bold text-xs text-slate-900 dark:text-white">${d.name}</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px]">${chargeTxt}</span>
              </div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                ⏱️ ${d.eta} • <span class="text-emerald-600 font-semibold">২,০০০+ অর্ডারে ফ্রি</span>
              </div>
            </div>
          </label>
        `;
      })
      .join('');

    payBox.innerHTML = allPay
      .map(m => {
        const isChecked = selectedPaySet.has(m.id.toLowerCase()) || selectedPaySet.has(m.code.toLowerCase());
        return `
          <label class="flex items-start gap-2.5 p-2.5 rounded-xl border ${
            isChecked
              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
          } cursor-pointer transition hover:border-emerald-400">
            <input
              type="checkbox"
              class="adm-lp-pay-chk w-4 h-4 mt-0.5 accent-emerald-600 rounded"
              value="${m.id}"
              ${isChecked ? 'checked' : ''}
              onchange="window.syncLpAdminDeliveryPaymentSelection()"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1.5 flex-wrap">
                <span class="font-bold text-xs text-slate-900 dark:text-white">${m.icon} ${m.name}</span>
                ${
                  m.isCod
                    ? `<span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">COD</span>`
                    : `<span class="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[10px]">৫% ছাড়</span>`
                }
              </div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                ${m.isCod ? 'পণ্য হাতে পেয়ে পেমেন্ট' : `নম্বর/লিংক: ${m.number || m.link || 'অনলাইন গেটওয়ে'} (${m.type})`}
              </div>
            </div>
          </label>
        `;
      })
      .join('');

    window.syncLpAdminDeliveryPaymentSelection();
  };

  window.syncLpAdminDeliveryPaymentSelection = function() {
    if (typeof document === 'undefined') return;
    const delChks = Array.from(document.querySelectorAll('.adm-lp-del-chk'));
    const payChks = Array.from(document.querySelectorAll('.adm-lp-pay-chk'));
    if (delChks.length === 0 && payChks.length === 0) return;

    const allDel = (typeof getGlobalDeliveryMethods === 'function' ? getGlobalDeliveryMethods(false) : []).map((d, i) =>
      normalizeLpDeliveryMethod(d, i)
    );
    const allPay = (typeof getGlobalPaymentMethods === 'function' ? getGlobalPaymentMethods(false) : []).map((m, i) =>
      normalizeLpPaymentMethod(m, i)
    );

    const selectedDelIds = delChks.filter(c => c.checked).map(c => c.value);
    const selectedPayIds = payChks.filter(c => c.checked).map(c => c.value);

    // Update visual border highlight on label cards
    delChks.forEach(c => {
      const lbl = c.closest('label');
      if (!lbl) return;
      if (c.checked) {
        lbl.classList.add('border-emerald-500', 'bg-emerald-50/60');
        lbl.classList.remove('border-slate-200', 'bg-white');
      } else {
        lbl.classList.remove('border-emerald-500', 'bg-emerald-50/60');
        lbl.classList.add('border-slate-200', 'bg-white');
      }
    });

    payChks.forEach(c => {
      const lbl = c.closest('label');
      if (!lbl) return;
      if (c.checked) {
        lbl.classList.add('border-emerald-500', 'bg-emerald-50/60');
        lbl.classList.remove('border-slate-200', 'bg-white');
      } else {
        lbl.classList.remove('border-emerald-500', 'bg-emerald-50/60');
        lbl.classList.add('border-slate-200', 'bg-white');
      }
    });

    const delCountBadge = document.getElementById('adm-lp-del-selected-count');
    const payCountBadge = document.getElementById('adm-lp-pay-selected-count');
    if (delCountBadge) delCountBadge.textContent = `${selectedDelIds.length}টি নির্বাচিত`;
    if (payCountBadge) payCountBadge.textContent = `${selectedPayIds.length}টি নির্বাচিত`;

    if (window.__currentLandingDraft && typeof window.__currentLandingDraft === 'object') {
      window.__currentLandingDraft.selected_delivery_methods = selectedDelIds;
      window.__currentLandingDraft.delivery_methods_snapshot = allDel.filter(d => selectedDelIds.includes(d.id));
      window.__currentLandingDraft.selected_payment_methods = selectedPayIds;
      window.__currentLandingDraft.payment_methods_snapshot = allPay.filter(m => selectedPayIds.includes(m.id));
      window.__currentLandingDraft.regular_price = 0;
      window.__currentLandingDraft.offer_price = 0;
    }
  };

  window.toggleAllLpAdminDelivery = function(checkAll = true) {
    document.querySelectorAll('.adm-lp-del-chk').forEach(c => {
      c.checked = Boolean(checkAll);
    });
    window.syncLpAdminDeliveryPaymentSelection();
  };

  window.toggleAllLpAdminPayment = function(checkAll = true) {
    document.querySelectorAll('.adm-lp-pay-chk').forEach(c => {
      c.checked = Boolean(checkAll);
    });
    window.syncLpAdminDeliveryPaymentSelection();
  };

  /**
   * 3. Automatically upgrades the Admin Panel Create Landing Page Form (`#landing-builder-form-card`):
   * - Removes standalone product-less prices (`#adm-lp-regular-price` & `#adm-lp-offer-price`) from Section 1.
   * - Upgrades `#adm-lp-theme` with all 10 Authentic Color Themes.
   * - Injects Delivery Area & Payment Method selector panel synced with Admin Settings.
   */
  const upgradeAdminLandingBuilderForm = function() {
    if (typeof document === 'undefined') return;

    // A. Upgrade Theme Select Dropdown
    const themeSel = document.getElementById('adm-lp-theme');
    if (themeSel && !themeSel.getAttribute('data-authentic-upgraded')) {
      const currentVal = themeSel.value || 'emerald';
      const primaryTenKeys = ['emerald', 'midnight', 'rose', 'indigo', 'amber', 'teal', 'crimson', 'plum', 'chocolate', 'obsidian'];
      themeSel.innerHTML = primaryTenKeys
        .map(key => `<option value="${key}">${LP_AUTHENTIC_THEMES[key].label}</option>`)
        .join('');
      themeSel.value = LP_AUTHENTIC_THEMES[currentVal] ? currentVal : 'emerald';
      themeSel.setAttribute('data-authentic-upgraded', 'true');
    }

    // B. Remove standalone product-less prices from Section 1 of Create Landing Page Form
    const regPriceInp = document.getElementById('adm-lp-regular-price');
    const offPriceInp = document.getElementById('adm-lp-offer-price');
    if (regPriceInp && !regPriceInp.getAttribute('data-lp-price-removed')) {
      regPriceInp.value = '';
      regPriceInp.setAttribute('data-lp-price-removed', 'true');
      const regWrap = regPriceInp.closest('div');
      if (regWrap) regWrap.style.display = 'none';
    }
    if (offPriceInp && !offPriceInp.getAttribute('data-lp-price-removed')) {
      offPriceInp.value = '';
      offPriceInp.setAttribute('data-lp-price-removed', 'true');
      const offWrap = offPriceInp.closest('div');
      if (offWrap) offWrap.style.display = 'none';
      const parentGrid = offPriceInp.closest('.grid');
      if (parentGrid) {
        parentGrid.classList.remove('sm:grid-cols-4');
        parentGrid.classList.add('sm:grid-cols-2');
      }
    }

    // Update Section 1 title in Admin Form so it doesn't mention standalone price
    const formCard = document.getElementById('landing-builder-form-card');
    if (formCard && !formCard.getAttribute('data-lp-sec1-cleaned')) {
      formCard.querySelectorAll('div, h4').forEach(el => {
        if (el.children.length === 0 && el.textContent) {
          if (el.textContent.includes('১. ক্যাম্পেইন শিরোনাম, স্লাগ, মূল্য ও অফার তথ্য')) {
            el.textContent = '১. ক্যাম্পেইন শিরোনাম, স্লাগ ও অফার তথ্য (একাধিক পণ্যের ক্যাম্পেইন)';
          } else if (el.textContent.includes('শিরোনাম, মূল্য, বিবরণ')) {
            el.textContent = el.textContent.replace('শিরোনাম, মূল্য, বিবরণ', 'শিরোনাম, পণ্য, ডেলিভারি, পেমেন্ট, বিবরণ');
          }
        }
      });
      formCard.setAttribute('data-lp-sec1-cleaned', 'true');
    }

    // C. Inject Delivery Areas & Payment Options selector panel into Create Landing Page Form
    const prodSearchBox = document.getElementById('adm-lp-selected-products-box');
    const prodSectionCard = prodSearchBox ? prodSearchBox.closest('.p-4.rounded-2xl') : null;
    if (prodSectionCard && !document.getElementById('adm-lp-delivery-payment-config-section')) {
      const sectionEl = document.createElement('div');
      sectionEl.id = 'adm-lp-delivery-payment-config-section';
      sectionEl.className = 'p-4 rounded-2xl bg-indigo-50/40 dark:bg-slate-800/50 border border-indigo-200 dark:border-slate-700 space-y-3.5';
      sectionEl.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200/70 dark:border-slate-700 pb-2.5">
          <div>
            <div class="font-black text-xs text-slate-900 dark:text-white uppercase">
              ২.৫ ডেলিভারি এরিয়া ও পেমেন্ট মেথড নির্বাচন (অ্যাডমিন প্যানেল থেকে সিঙ্ককৃত)
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              অ্যাডমিন প্যানেলে যুক্ত করা যে ডেলিভারি এরিয়া ও পেমেন্ট অপশনগুলো এখানে সিলেক্ট করবেন, শুধুমাত্র সেগুলোই পাবলিক ল্যান্ডিং পেজে দেখাবে ও সেই অনুযায়ী বিল হিসাব হবে।
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[10px]">
              🚚 ২,০০০+ টাকায় ফ্রি ডেলিভারি
            </span>
            <span class="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[10px]">
              💳 অনলাইন পেমেন্টে ৫% ছাড়
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Delivery Areas Selection Box -->
          <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div class="flex items-center justify-between gap-2 flex-wrap border-b pb-2">
              <div class="flex items-center gap-2">
                <span class="font-black text-xs text-slate-800 dark:text-white">📍 ডেলিভারি এরিয়া / জোনসমূহ</span>
                <span id="adm-lp-del-selected-count" class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">০টি নির্বাচিত</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button type="button" onclick="window.toggleAllLpAdminDelivery(true)" class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">সব সিলেক্ট</button>
                <button type="button" onclick="window.openDeliveryMethodModal && window.openDeliveryMethodModal('')" class="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold">+ নতুন এরিয়া যোগ</button>
              </div>
            </div>
            <div id="adm-lp-delivery-methods-box" class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1"></div>
          </div>

          <!-- Payment Methods Selection Box -->
          <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div class="flex items-center justify-between gap-2 flex-wrap border-b pb-2">
              <div class="flex items-center gap-2">
                <span class="font-black text-xs text-slate-800 dark:text-white">💳 পেমেন্ট মেথডসমূহ</span>
                <span id="adm-lp-pay-selected-count" class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">০টি নির্বাচিত</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button type="button" onclick="window.toggleAllLpAdminPayment(true)" class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">সব সিলেক্ট</button>
                <button type="button" onclick="window.openPaymentMethodModal && window.openPaymentMethodModal('')" class="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold">+ নতুন পেমেন্ট যোগ</button>
              </div>
            </div>
            <div id="adm-lp-payment-methods-box" class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1"></div>
          </div>
        </div>
      `;
      prodSectionCard.insertAdjacentElement('afterend', sectionEl);
      window.renderLpAdminDeliveryAndPaymentCheckboxes(window.__currentLandingDraft);
    }
  };

  if (typeof document !== 'undefined') {
    setTimeout(upgradeAdminLandingBuilderForm, 100);
    setTimeout(upgradeAdminLandingBuilderForm, 600);
    document.addEventListener('click', () => {
      setTimeout(upgradeAdminLandingBuilderForm, 40);
    });
  }

  // 4. Hook `window.populateLandingBuilderForm` & `window.handleAdminSaveLandingConfig` & Admin Payment/Delivery save handlers
  const installAdminHooks = function() {
    if (typeof window === 'undefined') return;

    // Hook populateLandingBuilderForm
    const wrapPopulate = function(fn) {
      if (typeof fn !== 'function' || fn.__lpUpgraded) return fn;
      const wrapped = function(lp) {
        const res = fn.apply(this, arguments);
        upgradeAdminLandingBuilderForm();
        window.renderLpAdminDeliveryAndPaymentCheckboxes(window.__currentLandingDraft || lp);
        return res;
      };
      wrapped.__lpUpgraded = true;
      return wrapped;
    };
    let _popFn = wrapPopulate(window.populateLandingBuilderForm);
    try {
      Object.defineProperty(window, 'populateLandingBuilderForm', {
        configurable: true,
        enumerable: true,
        get() { return _popFn; },
        set(newFn) { _popFn = wrapPopulate(newFn); }
      });
    } catch (e) {
      window.populateLandingBuilderForm = _popFn;
    }

    // Hook handleAdminSaveLandingConfig so selected_delivery_methods & selected_payment_methods are saved before persisting
    const wrapSaveLp = function(fn) {
      if (typeof fn !== 'function' || fn.__lpUpgraded) return fn;
      const wrapped = function(e) {
        if (!window.__currentLandingDraft && typeof window.initLandingDraft === 'function') {
          window.initLandingDraft();
        }
        window.syncLpAdminDeliveryPaymentSelection();
        const regEl = document.getElementById('adm-lp-regular-price');
        const offEl = document.getElementById('adm-lp-offer-price');
        if (regEl) regEl.value = '';
        if (offEl) offEl.value = '';
        return fn.apply(this, arguments);
      };
      wrapped.__lpUpgraded = true;
      return wrapped;
    };
    let _saveLpFn = wrapSaveLp(window.handleAdminSaveLandingConfig);
    try {
      Object.defineProperty(window, 'handleAdminSaveLandingConfig', {
        configurable: true,
        enumerable: true,
        get() { return _saveLpFn; },
        set(newFn) { _saveLpFn = wrapSaveLp(newFn); }
      });
    } catch (e) {
      window.handleAdminSaveLandingConfig = _saveLpFn;
    }

    // Hook Admin Delivery/Payment mutations so checkboxes in Landing Page Builder refresh automatically
    ['renderAdminPaymentMethodsDOM', 'renderAdminDeliveryMethodsDOM'].forEach(fnName => {
      const wrapRender = function(fn) {
        if (typeof fn !== 'function' || fn.__lpUpgraded) return fn;
        const wrapped = function() {
          const res = fn.apply(this, arguments);
          if (typeof window.renderLpAdminDeliveryAndPaymentCheckboxes === 'function') {
            window.renderLpAdminDeliveryAndPaymentCheckboxes(window.__currentLandingDraft);
          }
          return res;
        };
        wrapped.__lpUpgraded = true;
        return wrapped;
      };
      let _fn = wrapRender(window[fnName]);
      try {
        Object.defineProperty(window, fnName, {
          configurable: true,
          enumerable: true,
          get() { return _fn; },
          set(newFn) { _fn = wrapRender(newFn); }
        });
      } catch (e) {
        window[fnName] = _fn;
      }
    });
  };
  installAdminHooks();

  // 5. Wrap `apiClient.request` so `landing_pages/list` is deduplicated AND `landing-pages/save` persists delivery/payment selections
  if (apiClient && typeof apiClient.request === 'function' && !apiClient.__lpDedupPatched) {
    const origRequest = apiClient.request.bind(apiClient);
    apiClient.request = async function(action, payloadOrMethod = {}, maybePayload = undefined) {
      const act = String(action || '').toLowerCase();

      // Ensure saving a landing page embeds full metadata JSON (including selected_delivery_methods & selected_payment_methods)
      if (act.includes('landing_pages/save') || act.includes('landing-pages/save') || act.includes('landing_pages/add') || act.includes('landing-pages/add')) {
        const targetPayload = (typeof payloadOrMethod === 'string' && maybePayload && typeof maybePayload === 'object')
          ? maybePayload
          : (payloadOrMethod && typeof payloadOrMethod === 'object' ? payloadOrMethod : null);
        if (targetPayload) {
          targetPayload.regular_price = 0;
          targetPayload.offer_price = 0;
          try {
            targetPayload.Social_Icons = JSON.stringify(targetPayload);
            targetPayload.social_icons = targetPayload.Social_Icons;
          } catch (e) {}
        }
      }

      const res = await origRequest(action, payloadOrMethod, maybePayload);
      if (act.includes('landing_pages/list') || act.includes('landing-pages/list')) {
        const listData = Array.isArray(res?.data?.items)
          ? res.data.items
          : (Array.isArray(res?.data) ? res.data : null);
        if (listData) {
          const cleanItems = deduplicateLandingPagesList(listData);
          if (Array.isArray(res.data?.items)) {
            res.data.items = cleanItems;
            res.data.total = cleanItems.length;
          } else if (Array.isArray(res.data)) {
            res.data = cleanItems;
          }
          try {
            localStorage.setItem('dcbd_landing_pages', JSON.stringify(cleanItems));
          } catch (e) {}
          if (window.__adminState) {
            window.__adminState.landingPages = cleanItems;
          }
        }
      }
      return res;
    };
    apiClient.__lpDedupPatched = true;
  }

  // 6. Intercept `window.getAdminLandingPages` via defineProperty so AdminPortal never renders duplicate cards
  const wrapAdminLpGetter = function(fn) {
    if (typeof fn !== 'function') return fn;
    if (fn.__dedupWrapped) return fn;
    const wrapped = function() {
      const list = fn.apply(this, arguments);
      const clean = deduplicateLandingPagesList(list);
      if (window.__adminState) window.__adminState.landingPages = clean;
      try {
        localStorage.setItem('dcbd_landing_pages', JSON.stringify(clean));
      } catch (e) {}
      return clean;
    };
    wrapped.__dedupWrapped = true;
    return wrapped;
  };
  let _adminLpGetter = wrapAdminLpGetter(window.getAdminLandingPages);
  try {
    Object.defineProperty(window, 'getAdminLandingPages', {
      configurable: true,
      enumerable: true,
      get() {
        return _adminLpGetter;
      },
      set(newFn) {
        _adminLpGetter = wrapAdminLpGetter(newFn);
      }
    });
  } catch (e) {
    window.getAdminLandingPages = _adminLpGetter;
  }

  /**
   * Smoothly scrolls within the SAME Landing Page without changing the URL or triggering SPA router navigation.
   */
  window.scrollToLpSection = function(targetId, event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const targetEl =
      document.getElementById(targetId) ||
      document.getElementById('lp-products-section') ||
      document.getElementById('lp-checkout-section');
    if (targetEl) {
      const stickyOffset = 78;
      const y = targetEl.getBoundingClientRect().top + window.pageYOffset - stickyOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  // Interactive Product / Package Selection on Customer Landing Page
  window.selectLpProduct = function(idx, scrollToCheckout) {
    const list = window.__lpProductsList || [];
    const prod = list[idx];
    if (!prod) return;

    window.__lpSelectedPackage = idx;
    window.__lpPackagePrice = Number(prod.offer_price || prod.selling_price || prod.price || 0);
    window.__lpPackageRegularPrice = Number(prod.regular_price || prod.original_price || 0);
    window.__lpPackageTitle = prod.name || prod.p_name || '';
    window.__lpPackageSku = prod.sku || prod.product_id || prod.id || '';
    window.__lpPackageImage =
      prod.image_url || prod.thumbnail || (Array.isArray(prod.images) && prod.images[0]) || prod.image || '';

    // Highlight selected card inside checkout form
    document.querySelectorAll('.lp-pkg-card').forEach((card, i) => {
      const radioDot = card.querySelector('.lp-pkg-radio-dot');
      const statusBadge = card.querySelector('.lp-pkg-active-pill');
      if (i === idx) {
        card.classList.add('is-selected');
        if (radioDot) radioDot.style.transform = 'scale(1)';
        if (statusBadge) statusBadge.style.display = 'inline-flex';
      } else {
        card.classList.remove('is-selected');
        if (radioDot) radioDot.style.transform = 'scale(0)';
        if (statusBadge) statusBadge.style.display = 'none';
      }
    });

    // Highlight selected card in the top 3D Showcase Grid ("🛍️ ক্যাম্পেইনের পণ্যসমূহ")
    document.querySelectorAll('.lp-showcase-card').forEach((card, i) => {
      const badge = card.querySelector('.lp-showcase-selected-pill');
      const btn = card.querySelector('.lp-showcase-select-btn');
      if (i === idx) {
        card.classList.add('is-selected');
        if (badge) badge.style.display = 'inline-flex';
        if (btn) btn.innerHTML = '✓ নির্বাচিত পণ্য — নিচে অর্ডার ফর্ম পূরণ করুন ↓';
      } else {
        card.classList.remove('is-selected');
        if (badge) badge.style.display = 'none';
        if (btn) btn.innerHTML = '🛒 এটি সিলেক্ট করে অর্ডার করুন';
      }
    });

    // Dynamically refresh Color & Size pills for the selected product
    const colors = Array.isArray(prod.colors) && prod.colors.length > 0 ? prod.colors : (window.__lpDefaultColors || []);
    const sizes = Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes : (window.__lpDefaultSizes || []);

    const colorWrap = document.getElementById('lp-color-selector-wrap');
    const colorContainer = document.getElementById('lp-color-pills');
    if (colorWrap && colorContainer) {
      if (colors.length > 0) {
        colorWrap.style.display = 'block';
        window.__lpSelectedColor = colors[0];
        colorContainer.innerHTML = colors
          .map(
            (c, ci) => `
          <button type="button" onclick="window.selectLpColor('${String(c).replace(/'/g, "\\'")}', this)"
            class="lp-color-btn ${ci === 0 ? 'is-active' : ''}">
            ${c}
          </button>
        `
          )
          .join('');
      } else {
        colorWrap.style.display = 'none';
        window.__lpSelectedColor = '';
      }
    }

    const sizeWrap = document.getElementById('lp-size-selector-wrap');
    const sizeContainer = document.getElementById('lp-size-pills');
    if (sizeWrap && sizeContainer) {
      if (sizes.length > 0) {
        sizeWrap.style.display = 'block';
        window.__lpSelectedSize = sizes[0];
        sizeContainer.innerHTML = sizes
          .map(
            (s, si) => `
          <button type="button" onclick="window.selectLpSize('${String(s).replace(/'/g, "\\'")}', this)"
            class="lp-size-btn ${si === 0 ? 'is-active' : ''}">
            ${s}
          </button>
        `
          )
          .join('');
      } else {
        sizeWrap.style.display = 'none';
        window.__lpSelectedSize = '';
      }
    }

    if (typeof window.updateLpOrderCalculation === 'function') {
      window.updateLpOrderCalculation();
    }
    if (scrollToCheckout) {
      window.scrollToLpSection('lp-checkout-section');
    }
  };

  window.selectLpColor = function(color, btnEl) {
    window.__lpSelectedColor = color;
    document.querySelectorAll('.lp-color-btn').forEach(btn => btn.classList.remove('is-active'));
    if (btnEl) btnEl.classList.add('is-active');
    if (typeof window.updateLpOrderCalculation === 'function') {
      window.updateLpOrderCalculation();
    }
  };

  window.selectLpSize = function(size, btnEl) {
    window.__lpSelectedSize = size;
    document.querySelectorAll('.lp-size-btn').forEach(btn => btn.classList.remove('is-active'));
    if (btnEl) btnEl.classList.add('is-active');
    if (typeof window.updateLpOrderCalculation === 'function') {
      window.updateLpOrderCalculation();
    }
  };

  window.selectLpAreaZone = function(zoneId) {
    window.__lpSelectedDeliveryId = zoneId;
    const sel = document.getElementById('lp-delivery-area');
    if (sel) sel.value = zoneId;
    document.querySelectorAll('.lp-zone-chip').forEach(btn => {
      if (btn.getAttribute('data-zone') === zoneId) btn.classList.add('is-active');
      else btn.classList.remove('is-active');
    });
    if (typeof window.updateLpOrderCalculation === 'function') {
      window.updateLpOrderCalculation();
    }
  };

  window.selectLpPaymentMethod = function(payId) {
    const methods = window.__lpPaymentMethods || [];
    const target = String(payId || '').trim();
    const selectedMethod =
      methods.find(
        m =>
          String(m.id || '').toLowerCase() === target.toLowerCase() ||
          String(m.code || '').toLowerCase() === target.toLowerCase()
      ) ||
      methods[0] ||
      normalizeLpPaymentMethod({ id: 'COD', code: 'COD', name: 'ক্যাশ অন ডেলিভারি (COD)', type: 'COD' });

    const activeId = selectedMethod.id;
    window.__lpSelectedPayment = activeId;
    const hiddenInput = document.getElementById('lp-payment-method-input');
    if (hiddenInput) hiddenInput.value = activeId;

    const existingTrxVal = document.getElementById('lp-trx-id-input')?.value || '';

    document.querySelectorAll('.lp-pay-option-card').forEach(card => {
      const cid = String(card.getAttribute('data-pay-id') || '');
      const dot = card.querySelector('.lp-pay-radio-dot');
      if (cid.toLowerCase() === activeId.toLowerCase()) {
        card.classList.add('is-active');
        if (dot) dot.style.transform = 'scale(1)';
      } else {
        card.classList.remove('is-active');
        if (dot) dot.style.transform = 'scale(0)';
      }
    });

    const detailsBox = document.getElementById('lp-payment-details-panel');
    if (detailsBox) {
      if (selectedMethod.isCod) {
        detailsBox.innerHTML = `
          <div class="lp-cod-box">
            <span style="font-size:24px;flex-shrink:0;">🤝</span>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:900;color:#065f46;font-size:13.5px;margin-bottom:2px;">${selectedMethod.name}</div>
              <div style="font-size:12px;color:#047857;font-weight:700;line-height:1.45;">
                ${selectedMethod.instructions || 'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে টাকা পরিশোধ করবেন।'}
              </div>
              <div style="margin-top:6px;padding:5px 10px;border-radius:8px;background:#ffffff;border:1px dashed #6ee7b7;font-size:11.5px;color:#be123c;font-weight:800;">
                💡 টিপস: উপরের যেকোনো <strong>অনলাইন পেমেন্ট</strong> সিলেক্ট করলেই পাচ্ছেন সাথে সাথে <strong>৫% ইনস্ট্যান্ট ডিসকাউন্ট (সাশ্রয় <span id="lp-cod-switch-save-hint">৳০</span>)</strong>!
              </div>
            </div>
          </div>
        `;
      } else {
        const discPct = Number(selectedMethod.discount_pct || window.__lpOnlineDiscountPct || 5) || 5;
        const rawNumbers = String(selectedMethod.number || '')
          .split(/[,|/]/)
          .map(s => s.trim())
          .filter(Boolean);
        const gwUrl = String(selectedMethod.link || selectedMethod.gatewayUrl || '').trim();
        const hasBankInfo = Boolean(selectedMethod.bank_name || selectedMethod.account_name || selectedMethod.branch || selectedMethod.routing);

        detailsBox.innerHTML = `
          <div class="lp-online-pay-box">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
              <span style="font-size:13px;font-weight:900;color:#be123c;">
                🎁 অভিনন্দন! ${selectedMethod.name}-এ ${discPct}% ইনস্ট্যান্ট ডিসকাউন্ট (-<span id="lp-online-pay-save-amount">৳০</span>) চালু হয়েছে!
              </span>
              <span style="background:#e11d48;color:#fff;font-size:10.5px;font-weight:900;padding:3px 9px;border-radius:999px;">
                ${discPct}% OFF
              </span>
            </div>

            <div style="padding:8px 12px;border-radius:10px;background:#ffffff;border:1.5px solid #fda4af;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
              <span style="font-size:12px;font-weight:800;color:#334155;">৫% ডিসকাউন্ট বাদে পরিশোধযোগ্য নিট বিল:</span>
              <span id="lp-online-pay-net-amount" style="font-size:16px;font-weight:900;color:#be123c;">৳০</span>
            </div>

            <div style="font-size:12px;color:#334155;font-weight:700;margin-bottom:10px;line-height:1.5;">
              ${selectedMethod.instructions}
            </div>

            ${
              rawNumbers.length > 0
                ? `<div style="display:flex;flex-direction:column;gap:7px;margin-bottom:10px;">
                    ${rawNumbers
                      .map(
                        (accNumber, nIdx) => `
                      <div class="lp-pay-number-bar">
                        <div>
                          <div style="font-size:10.5px;color:#64748b;font-weight:800;">
                            ${selectedMethod.name} নম্বর ${rawNumbers.length > 1 ? nIdx + 1 : ''} (${selectedMethod.type}):
                          </div>
                          <div style="font-size:15.5px;font-weight:900;color:#0f172a;letter-spacing:0.03em;">${accNumber}</div>
                        </div>
                        <button type="button" onclick="window.copyLpPayNumber('${accNumber.replace(/[^0-9+]/g, '') || accNumber}')" class="lp-copy-num-btn">
                          📋 নাম্বার কপি করুন
                        </button>
                      </div>
                    `
                      )
                      .join('')}
                  </div>`
                : ''
            }

            ${
              hasBankInfo
                ? `<div style="background:#ffffff;border:1px solid #fecdd3;border-radius:11px;padding:9px 12px;margin-bottom:10px;font-size:11.5px;color:#334155;line-height:1.6;">
                    ${selectedMethod.bank_name ? `<div><strong>ব্যাংক:</strong> ${selectedMethod.bank_name}</div>` : ''}
                    ${selectedMethod.account_name ? `<div><strong>একাউন্ট নাম:</strong> ${selectedMethod.account_name}</div>` : ''}
                    ${selectedMethod.branch ? `<div><strong>শাখা (Branch):</strong> ${selectedMethod.branch}</div>` : ''}
                    ${selectedMethod.routing ? `<div><strong>রাউটিং (Routing):</strong> ${selectedMethod.routing}</div>` : ''}
                  </div>`
                : ''
            }

            ${
              gwUrl
                ? `<div style="margin-bottom:10px;">
                    <a href="${gwUrl}" target="_blank" rel="noopener noreferrer" class="lp-gw-link-btn" style="display:inline-flex;align-items:center;justify-content:center;width:100%;padding:10px 14px;font-size:12.5px;border-radius:11px;">
                      ⚡ অনলাইন পেমেন্ট গেটওয়ে লিংকে পেমেন্ট করুন (${selectedMethod.name}) ↗
                    </a>
                  </div>`
                : ''
            }

            <div style="margin-top:8px;">
              <label class="lp-field-label" style="color:#881337;margin-bottom:4px;">
                🔢 ট্রানজেকশন আইডি (TrxID) / প্রেরক মোবাইল নাম্বার <span style="color:#e11d48;">*</span>
              </label>
              <input
                type="text"
                id="lp-trx-id-input"
                name="transaction_id"
                value="${existingTrxVal.replace(/"/g, '&quot;')}"
                placeholder="যেমন: 9K2840FJA2 অথবা যে নাম্বার থেকে টাকা পাঠিয়েছেন"
                class="lp-input"
                style="border-color:#fda4af;background:#ffffff;"
              >
            </div>
          </div>
        `;
      }
    }

    if (typeof window.updateLpOrderCalculation === 'function') {
      window.updateLpOrderCalculation();
    }
  };

  window.copyLpPayNumber = function(num) {
    if (!num) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(String(num))
        .then(() => toast.success(`নাম্বার কপি হয়েছে: ${num}`))
        .catch(() => toast.success(`নাম্বার: ${num}`));
    } else {
      toast.success(`নাম্বার: ${num}`);
    }
  };

  window.changeLpQty = function(delta) {
    const next = Math.max(1, Math.min(50, (window.__lpQuantity || 1) + delta));
    window.__lpQuantity = next;
    const qtyEl = document.getElementById('lp-qty-display');
    const sumQtyEl = document.getElementById('lp-summary-qty');
    if (qtyEl) qtyEl.textContent = String(next);
    if (sumQtyEl) sumQtyEl.textContent = `× ${next} টি`;
    if (typeof window.updateLpOrderCalculation === 'function') {
      window.updateLpOrderCalculation();
    }
  };

  /**
   * Live Order Calculation:
   * 1. Free Delivery (`৳০`) when Subtotal >= ৳2,000 (or if campaign free_shipping is true or zone charge === 0)
   * 2. 5% Instant Discount (`Math.round(subtotal * 0.05)`) when any Online Payment method is selected
   * 3. Uses exact Delivery Areas & Payment Options selected for this Landing Page from Admin Panel
   */
  window.updateLpOrderCalculation = function() {
    const unitPrice = Number(window.__lpPackagePrice || 0);
    const regUnitPrice = Number(window.__lpPackageRegularPrice || unitPrice);
    const qty = Number(window.__lpQuantity || 1);
    const subtotal = unitPrice * qty;
    const regTotal = regUnitPrice * qty;
    const productSavings = Math.max(0, regTotal - subtotal);

    const deliveryConfs = Array.isArray(window.__lpDeliveryConfs) ? window.__lpDeliveryConfs : [];
    const areaSelect = document.getElementById('lp-delivery-area');
    const selectedAreaId = areaSelect
      ? areaSelect.value
      : (window.__lpSelectedDeliveryId || deliveryConfs[0]?.id || 'dhaka');
    window.__lpSelectedDeliveryId = selectedAreaId;

    const selectedZoneObj =
      deliveryConfs.find(
        d =>
          String(d.id || '').toLowerCase() === String(selectedAreaId).toLowerCase() ||
          String(d.code || '').toLowerCase() === String(selectedAreaId).toLowerCase()
      ) || deliveryConfs[0];

    const campaignFreeShipping = Boolean(window.__lpFreeShipping);
    const freeThreshold = Number(window.__lpFreeThreshold || 2000);
    const baseShippingCost = getZoneShippingCost(selectedAreaId, deliveryConfs);
    const qualifiesFreeDelivery = campaignFreeShipping || subtotal >= freeThreshold || baseShippingCost === 0;
    const shippingCost = qualifiesFreeDelivery ? 0 : baseShippingCost;

    // 1. Update Delivery Zone Chips & Select Dropdown Options dynamically
    document.querySelectorAll('.lp-zone-chip').forEach(btn => {
      const zId = btn.getAttribute('data-zone');
      if (String(zId).toLowerCase() === String(selectedAreaId).toLowerCase()) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }

      const feeSpan = btn.querySelector('.lp-zone-fee-text');
      if (feeSpan) {
        const rawFee = getZoneShippingCost(zId, deliveryConfs);
        if (qualifiesFreeDelivery) {
          feeSpan.innerHTML =
            rawFee > 0
              ? `<del style="opacity:0.65;margin-right:3px;">৳${rawFee}</del> <strong style="color:#059669;">ফ্রি (৳০)</strong>`
              : `<strong style="color:#059669;">ফ্রি (৳০)</strong>`;
        } else {
          feeSpan.textContent = rawFee === 0 ? 'ফ্রি (৳০)' : `৳${rawFee}`;
        }
      }
    });

    if (areaSelect && areaSelect.options) {
      Array.from(areaSelect.options).forEach(opt => {
        const zId = opt.value;
        const zObj = deliveryConfs.find(d => String(d.id) === String(zId));
        if (zObj) {
          const rawFee = Number(zObj.charge || 0);
          if (qualifiesFreeDelivery) {
            opt.textContent = `${zObj.name} — ফ্রি ডেলিভারি (৳০) [${zObj.eta}]`;
          } else {
            opt.textContent = `${zObj.name} — ${rawFee === 0 ? 'ফ্রি (৳০)' : '৳' + rawFee} (${zObj.eta}) [২,০০০+ অর্ডারে ফ্রি]`;
          }
        }
      });
    }

    // 2. Update Free Delivery Animated Progress Bar
    const freeBarWrap = document.getElementById('lp-free-delivery-progress-box');
    if (freeBarWrap) {
      const pct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
      const remaining = Math.max(0, freeThreshold - subtotal);
      if (qualifiesFreeDelivery) {
        freeBarWrap.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;font-weight:900;color:#065f46;">
            <span>🎉 অভিনন্দন! ২,০০০+ টাকার অর্ডারে আপনি পাচ্ছেন <strong> সম্পূর্ণ ফ্রি ডেলিভারি (৳০)</strong>!</span>
            <span style="background:#059669;color:#ffffff;padding:2px 9px;border-radius:999px;font-size:10.5px;">FREE DELIVERY (৳০)</span>
          </div>
          <div class="lp-free-progress-track">
            <div class="lp-free-progress-fill" style="width:100%;"></div>
          </div>
        `;
      } else {
        freeBarWrap.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px;font-weight:800;color:#1e293b;">
            <span>🚚 ২,০০০+ টাকার অর্ডারে ডেলিভারি ফ্রি! আর মাত্র <strong style="color:#e11d48;">${formatCurrency(remaining)}</strong> টাকার পণ্য যোগ করলেই <strong>ডেলিভারি চার্জ সম্পূর্ণ ফ্রি (৳০)!</strong></span>
            <button type="button" onclick="window.changeLpQty(1)" style="padding:3px 9px;border-radius:999px;background:#059669;color:#ffffff;border:none;font-size:10.5px;font-weight:900;cursor:pointer;">+ পরিমাণ বাড়ান (${pct}%)</button>
          </div>
          <div class="lp-free-progress-track">
            <div class="lp-free-progress-fill" style="width:${pct}%;"></div>
          </div>
        `;
      }
    }

    // 3. Calculate Online Payment 5% Discount
    const paymentMethods = Array.isArray(window.__lpPaymentMethods) ? window.__lpPaymentMethods : [];
    const selectedPaymentId = String(window.__lpSelectedPayment || 'COD');
    const selectedMethodObj =
      paymentMethods.find(
        m =>
          String(m.id || '').toLowerCase() === selectedPaymentId.toLowerCase() ||
          String(m.code || '').toLowerCase() === selectedPaymentId.toLowerCase()
      ) || paymentMethods[0];

    const isOnlinePayment = selectedMethodObj ? !selectedMethodObj.isCod : selectedPaymentId.toUpperCase() !== 'COD';
    const onlineDiscountPct = isOnlinePayment
      ? Number(selectedMethodObj?.discount_pct || window.__lpOnlineDiscountPct || 5) || 5
      : 0;
    const onlineDiscount = isOnlinePayment ? Math.round((subtotal * onlineDiscountPct) / 100) : 0;
    const potentialOnlineSavings = Math.round((subtotal * (Number(window.__lpOnlineDiscountPct || 5) || 5)) / 100);

    // Update 5% discount badges on each payment card with live savings amount
    document.querySelectorAll('.lp-pay-5pct-tag').forEach(badge => {
      badge.textContent = potentialOnlineSavings > 0 ? `৫% ছাড় (-৳${potentialOnlineSavings})` : '৫% ছাড়';
    });

    const total = Math.max(0, subtotal - onlineDiscount + shippingCost);
    const totalSavings = productSavings + onlineDiscount + (qualifiesFreeDelivery ? baseShippingCost : 0);

    // Update live values inside the active payment details panel
    const netAmtEl = document.getElementById('lp-online-pay-net-amount');
    const saveAmtEl = document.getElementById('lp-online-pay-save-amount');
    const codSwitchHintEl = document.getElementById('lp-cod-switch-save-hint');
    if (netAmtEl) netAmtEl.textContent = formatCurrency(total);
    if (saveAmtEl) saveAmtEl.textContent = formatCurrency(onlineDiscount);
    if (codSwitchHintEl) codSwitchHintEl.textContent = formatCurrency(potentialOnlineSavings);

    // 4. Update Order Summary DOM
    const subEl = document.getElementById('lp-summary-subtotal');
    const shipEl = document.getElementById('lp-summary-shipping');
    const zoneLblEl = document.getElementById('lp-summary-zone-label');
    const discRowEl = document.getElementById('lp-summary-discount-row');
    const discValEl = document.getElementById('lp-summary-discount-val');
    const saveRowEl = document.getElementById('lp-summary-savings-row');
    const saveValEl = document.getElementById('lp-summary-savings-val');
    const totalEl = document.getElementById('lp-summary-total');
    const titleEl = document.getElementById('lp-summary-title');
    const metaEl = document.getElementById('lp-summary-meta');
    const btnTotalEl = document.getElementById('lp-submit-btn-price');
    const thumbEl = document.getElementById('lp-summary-thumb');

    if (subEl) subEl.textContent = formatCurrency(subtotal);
    if (zoneLblEl && selectedZoneObj) {
      zoneLblEl.textContent = `ডেলিভারি চার্জ (${selectedZoneObj.name}):`;
    }
    if (shipEl) {
      if (qualifiesFreeDelivery) {
        shipEl.innerHTML =
          baseShippingCost > 0
            ? `<del style="color:#94a3b8;font-size:11.5px;margin-right:5px;">${formatCurrency(baseShippingCost)}</del><span style="color:#34d399;font-weight:900;">ফ্রি ডেলিভারি (৳০)</span>`
            : `<span style="color:#34d399;font-weight:900;">ফ্রি ডেলিভারি (৳০)</span>`;
      } else {
        shipEl.textContent = formatCurrency(shippingCost);
        shipEl.style.color = '#f8fafc';
      }
    }
    if (discRowEl && discValEl) {
      if (onlineDiscount > 0) {
        discRowEl.style.display = 'flex';
        discValEl.textContent = `- ${formatCurrency(onlineDiscount)}`;
      } else {
        discRowEl.style.display = 'none';
      }
    }
    if (saveRowEl && saveValEl) {
      if (totalSavings > 0) {
        saveRowEl.style.display = 'flex';
        saveValEl.textContent = formatCurrency(totalSavings);
      } else {
        saveRowEl.style.display = 'none';
      }
    }
    if (totalEl) totalEl.textContent = formatCurrency(total);
    if (btnTotalEl) btnTotalEl.textContent = formatCurrency(total);
    if (titleEl && window.__lpPackageTitle) {
      titleEl.textContent = window.__lpPackageTitle;
    }
    if (thumbEl && window.__lpPackageImage) {
      thumbEl.src = window.__lpPackageImage;
      thumbEl.style.display = 'block';
    }
    if (metaEl) {
      const parts = [];
      if (window.__lpSelectedColor) parts.push(`কালার: ${window.__lpSelectedColor}`);
      if (window.__lpSelectedSize) parts.push(`সাইজ: ${window.__lpSelectedSize}`);
      metaEl.textContent = parts.join(' | ');
      metaEl.style.display = parts.length > 0 ? 'block' : 'none';
    }
  };

  /**
   * 0ms Instant Order Submit — Works seamlessly even on weak 2G/3G internet!
   * Saves immediately to localStorage and dispatches backend sync non-blockingly.
   */
  window.submitLpDirectOrder = async function(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = document.getElementById('lp-submit-btn');
    const name = form.customer_name?.value?.trim();
    const phone = form.customer_phone?.value?.trim();
    const address = form.customer_address?.value?.trim();
    const areaId = form.delivery_area?.value || window.__lpSelectedDeliveryId || 'dhaka';
    const note = form.order_note?.value?.trim() || '';
    const trxInput = document.getElementById('lp-trx-id-input');
    const trxId = trxInput ? trxInput.value.trim() : '';

    if (!name || !phone || !address) {
      toast.error('অনুগ্রহ করে আপনার নাম, মোবাইল নাম্বার এবং সম্পূর্ণ ঠিকানা লিখুন।');
      return;
    }

    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      toast.error('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)');
      return;
    }

    const paymentMethods = Array.isArray(window.__lpPaymentMethods) ? window.__lpPaymentMethods : [];
    const selectedPaymentId = String(window.__lpSelectedPayment || 'COD');
    const matchedMethod =
      paymentMethods.find(
        m =>
          String(m.id || '').toLowerCase() === selectedPaymentId.toLowerCase() ||
          String(m.code || '').toLowerCase() === selectedPaymentId.toLowerCase()
      ) || paymentMethods[0];

    const isOnlinePayment = matchedMethod ? !matchedMethod.isCod : selectedPaymentId.toUpperCase() !== 'COD';
    if (isOnlinePayment && !trxId) {
      toast.error('অনলাইন পেমেন্টে ৫% ছাড় পেতে অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) অথবা প্রেরক নাম্বারটি লিখুন।');
      if (trxInput) trxInput.focus();
      return;
    }

    const unitPrice = Number(window.__lpPackagePrice || 0);
    const qty = Number(window.__lpQuantity || 1);
    const subtotal = unitPrice * qty;
    const freeThreshold = Number(window.__lpFreeThreshold || 2000);
    const onlineDiscountPct = isOnlinePayment
      ? Number(matchedMethod?.discount_pct || window.__lpOnlineDiscountPct || 5) || 5
      : 0;

    const deliveryConfs = Array.isArray(window.__lpDeliveryConfs) ? window.__lpDeliveryConfs : [];
    const matchedZone =
      deliveryConfs.find(
        d =>
          String(d.id || '').toLowerCase() === String(areaId).toLowerCase() ||
          String(d.code || '').toLowerCase() === String(areaId).toLowerCase()
      ) || deliveryConfs[0];

    const baseShippingCost = getZoneShippingCost(areaId, deliveryConfs);
    const qualifiesFreeDelivery = Boolean(window.__lpFreeShipping) || subtotal >= freeThreshold || baseShippingCost === 0;
    const shippingCost = qualifiesFreeDelivery ? 0 : baseShippingCost;
    const deliveryAreaLabel = matchedZone ? matchedZone.name : String(areaId);

    const discountAmount = isOnlinePayment ? Math.round((subtotal * onlineDiscountPct) / 100) : 0;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost);

    const paymentLabel = isOnlinePayment
      ? `${matchedMethod ? matchedMethod.name : selectedPaymentId} (${onlineDiscountPct}% অনলাইন ছাড় - TrxID: ${trxId})`
      : (matchedMethod ? matchedMethod.name : 'ক্যাশ অন ডেলিভারি (COD)');

    const variantDetails = [
      window.__lpSelectedColor ? `কালার: ${window.__lpSelectedColor}` : '',
      window.__lpSelectedSize ? `সাইজ: ${window.__lpSelectedSize}` : ''
    ]
      .filter(Boolean)
      .join(', ');

    const itemTitle = `${window.__lpPackageTitle || 'ক্যাম্পেইন পণ্য'}${variantDetails ? ` (${variantDetails})` : ''}`;
    const generatedOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const orderPayload = {
      order_id: generatedOrderId,
      orderId: generatedOrderId,
      id: generatedOrderId,
      customer_name: name,
      customerName: name,
      customer_phone: phone,
      customerPhone: phone,
      phone: phone,
      customer_email: '',
      address: `${address} [ডেলিভারি এরিয়া: ${deliveryAreaLabel}]`,
      customer_address: address,
      customerAddress: address,
      shipping_address: address,
      city: deliveryAreaLabel,
      delivery_area: deliveryAreaLabel,
      deliveryZone: deliveryAreaLabel,
      products: `${itemTitle} x${qty}`,
      product_name: itemTitle,
      color: window.__lpSelectedColor || 'Standard',
      size: window.__lpSelectedSize || 'Free Size',
      quantity: qty,
      unit_price: unitPrice,
      subtotal: subtotal,
      delivery_fee: shippingCost,
      deliveryFee: shippingCost,
      delivery_charge: shippingCost,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      discount: discountAmount,
      total_amount: totalAmount,
      total: totalAmount,
      payable_amount: totalAmount,
      payment_method: paymentLabel,
      paymentMethod: matchedMethod ? (matchedMethod.code || matchedMethod.id) : selectedPaymentId,
      transaction_id: trxId,
      transactionId: trxId,
      payment_status: isOnlinePayment ? 'Paid (Verify TrxID)' : 'Pending',
      order_status: 'Order Placed',
      status: 'PENDING',
      account_type: 'Landing Page Campaign',
      notes: [
        '[Landing Page Order]',
        variantDetails,
        `ডেলিভারি এরিয়া: ${deliveryAreaLabel}`,
        qualifiesFreeDelivery ? 'ফ্রি ডেলিভারি (২০০০+ টাকা অর্ডার)' : '',
        isOnlinePayment ? `${onlineDiscountPct}% অনলাইন পেমেন্ট ছাড় (-৳${discountAmount}), TrxID: ${trxId}` : '',
        note
      ]
        .filter(Boolean)
        .join(' | '),
      created_at: new Date().toISOString(),
      items: [
        {
          product_id: window.__lpPackageSku || 'LP-ITEM',
          sku: window.__lpPackageSku || 'LP-ITEM',
          name: itemTitle,
          title: itemTitle,
          product_name: itemTitle,
          price: unitPrice,
          quantity: qty,
          color: window.__lpSelectedColor || 'Standard',
          size: window.__lpSelectedSize || 'Free Size',
          image_url: window.__lpPackageImage || '',
          subtotal: subtotal
        }
      ]
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span style="display:inline-block;animation:lpSpin 0.8s linear infinite;margin-right:8px;">⏳</span> অর্ডার কনফার্ম হচ্ছে...`;
    }

    // 1. Instant 0ms Local Save so OrderSuccessPage & Admin Orders show it immediately
    try {
      localStorage.setItem('dcbd_last_order', JSON.stringify(orderPayload));
      const existingOrders = JSON.parse(localStorage.getItem('dcbd_sheet_orders') || '[]');
      existingOrders.unshift(orderPayload);
      localStorage.setItem('dcbd_sheet_orders', JSON.stringify(existingOrders.slice(0, 200)));
    } catch (e) {}

    // 2. Non-blocking API dispatch (waits at most 180ms so slow internet never freezes the user!)
    const requestPromise = apiClient
      .request('orders/create', orderPayload)
      .then(res => {
        if (res && res.data) {
          const updated = { ...orderPayload, ...res.data };
          try {
            localStorage.setItem('dcbd_last_order', JSON.stringify(updated));
          } catch (e) {}
        }
        return res;
      })
      .catch(err => {
        console.warn('Background order sync queued:', err);
        return null;
      });

    await Promise.race([
      requestPromise,
      new Promise(resolve => setTimeout(resolve, 180))
    ]);

    toast.success(`ধন্যবাদ ${name}! আপনার অর্ডার (#${generatedOrderId}) সফলভাবে সম্পন্ন হয়েছে।`);
    const targetId = orderPayload.order_id || generatedOrderId;
    if (window.router && typeof window.router.navigate === 'function') {
      window.router.navigate(`/order-success?orderId=${encodeURIComponent(targetId)}`);
    } else if (typeof window.navigateTo === 'function') {
      window.navigateTo(`/order-success?orderId=${encodeURIComponent(targetId)}`);
    } else {
      window.history.pushState({}, '', `/order-success?orderId=${encodeURIComponent(targetId)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
}

function parseJsonSafe(raw, fallback) {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function normalizeSpecs(rawSpecs) {
  if (!rawSpecs) return [];
  if (Array.isArray(rawSpecs)) {
    return rawSpecs.filter(r => r && (r.label || r.key || r.value));
  }
  if (typeof rawSpecs === 'string') {
    const trimmed = rawSpecs.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const parsed = parseJsonSafe(trimmed, null);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed).map(([k, v]) => ({ label: k, value: String(v) }));
      }
    }
    return trimmed
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const idx = line.indexOf(':');
        if (idx > -1) {
          return {
            label: line.slice(0, idx).trim(),
            value: line.slice(idx + 1).trim()
          };
        }
        return { label: '', value: line };
      });
  }
  return [];
}

function normalizeFeatures(rawFeatures) {
  if (!rawFeatures) return [];
  if (Array.isArray(rawFeatures)) {
    return rawFeatures.map(f => String(f || '').trim()).filter(Boolean);
  }
  if (typeof rawFeatures === 'string') {
    const trimmed = rawFeatures.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      const parsed = parseJsonSafe(trimmed, []);
      if (Array.isArray(parsed)) return parsed.map(f => String(f || '').trim()).filter(Boolean);
    }
    return trimmed.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeStringList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map(x => String(x || '').trim())
      .filter(x => x && x.toLowerCase() !== 'standard' && x.toLowerCase() !== 'free size');
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      const parsed = parseJsonSafe(trimmed, []);
      if (Array.isArray(parsed)) {
        return parsed
          .map(x => String(x || '').trim())
          .filter(x => x && x.toLowerCase() !== 'standard' && x.toLowerCase() !== 'free size');
      }
    }
    return trimmed
      .split(',')
      .map(s => s.trim())
      .filter(x => x && x.toLowerCase() !== 'standard' && x.toLowerCase() !== 'free size');
  }
  return [];
}

/**
 * Synchronous 0ms local cache reader so LandingPage opens instantly without waiting for slow network!
 */
function readInstantLocalPagesAndProducts() {
  let cachedPages = [];
  try {
    if (typeof window !== 'undefined' && window.__adminState && Array.isArray(window.__adminState.landingPages)) {
      cachedPages.push(...window.__adminState.landingPages);
    }
  } catch (e) {}
  try {
    const rawSaved = localStorage.getItem('dcbd_landing_pages');
    if (rawSaved) {
      const parsed = JSON.parse(rawSaved);
      if (Array.isArray(parsed)) cachedPages.push(...parsed);
    }
  } catch (e) {}
  try {
    if (apiClient && typeof apiClient.loadLocal === 'function') {
      const localList = apiClient.loadLocal('dcbd_landing_pages', []);
      if (Array.isArray(localList)) cachedPages.push(...localList);
    }
  } catch (e) {}

  let cachedProducts = [];
  if (Array.isArray(apiClient?.products) && apiClient.products.length > 0) {
    cachedProducts = apiClient.products;
  } else {
    try {
      const rawProds = localStorage.getItem('dcbd_products_cache') || localStorage.getItem('dcbd_products') || localStorage.getItem('dcbd_sheet_products');
      if (rawProds) {
        const parsedProds = JSON.parse(rawProds);
        if (Array.isArray(parsedProds)) cachedProducts = parsedProds;
      }
    } catch (e) {}
  }

  return {
    pages: deduplicateLandingPagesList(cachedPages),
    products: cachedProducts
  };
}

/**
 * Main Landing Page Renderer called by `src/router.js` (`viewHtml = await renderLandingPage(...)`).
 * Opens in 0ms from local cache and refreshes silently in the background!
 */
export async function renderLandingPage(params = {}) {
  // Hide global storefront chrome so Landing Page has its own clean dedicated header
  if (typeof document !== 'undefined') {
    const headerMount = document.getElementById('header-mount');
    const footerMount = document.getElementById('footer-mount');
    const mobileNavMount = document.getElementById('mobilenav-mount');
    const floatingActionsMount = document.getElementById('floatingactions-mount');
    const appContainer = document.getElementById('app-content');
    if (headerMount) headerMount.style.display = 'none';
    if (footerMount) footerMount.style.display = 'none';
    if (mobileNavMount) mobileNavMount.style.display = 'none';
    if (floatingActionsMount) floatingActionsMount.style.display = 'none';
    if (appContainer) appContainer.className = 'w-full min-h-screen p-0 m-0';
  }

  try {
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const requestedSlug = String(
      params.slug ||
      params.page ||
      searchParams.get('page') ||
      searchParams.get('slug') ||
      searchParams.get('campaign') ||
      searchParams.get('id') ||
      ''
    ).trim();

    // 1. Read synchronously in 0ms from local cache
    let { pages: allPages, products: allProducts } = readInstantLocalPagesAndProducts();

    // 2. Fire non-blocking background sync to keep cache fresh
    const backgroundNetworkSync = (async () => {
      try {
        const [lpRes, prodRes] = await Promise.all([
          apiClient.request('landing_pages/list').catch(() => null),
          apiClient.request('products/list').catch(() => null)
        ]);
        const netPages = Array.isArray(lpRes?.data?.items)
          ? lpRes.data.items
          : (Array.isArray(lpRes?.data) ? lpRes.data : []);
        if (netPages.length > 0) {
          allPages = deduplicateLandingPagesList([...netPages, ...allPages]);
          try {
            localStorage.setItem('dcbd_landing_pages', JSON.stringify(allPages));
          } catch (e) {}
        }
        const netProds = Array.isArray(prodRes?.data?.items)
          ? prodRes.data.items
          : (Array.isArray(prodRes?.data) ? prodRes.data : []);
        if (netProds.length > 0) {
          allProducts = netProds;
          try {
            localStorage.setItem('dcbd_products_cache', JSON.stringify(netProds.slice(0, 150)));
          } catch (e) {}
        }
      } catch (e) {}
    })();

    // Only wait a tiny 320ms if local cache is completely empty on first-ever visit
    if (allPages.length === 0 || allProducts.length === 0) {
      await Promise.race([
        backgroundNetworkSync,
        new Promise(resolve => setTimeout(resolve, 320))
      ]);
      if (allPages.length === 0 || allProducts.length === 0) {
        const refreshed = readInstantLocalPagesAndProducts();
        if (allPages.length === 0) allPages = refreshed.pages;
        if (allProducts.length === 0) allProducts = refreshed.products;
      }
    }

    const siteSettings = typeof getGlobalSiteSettings === 'function' ? getGlobalSiteSettings() : {};

    // Pick matching landing page by slug or id, or fallback to latest active page
    let activePage = null;
    if (requestedSlug && allPages.length > 0) {
      const q = requestedSlug.toLowerCase();
      activePage = allPages.find(p => {
        const s = String(p.slug || '').trim().toLowerCase();
        const id = String(p.id || p.page_id || '').trim().toLowerCase();
        return s === q || id === q || (s && q && s.includes(q));
      });
    }
    if (!activePage && allPages.length > 0) {
      const activeList = allPages.filter(p => String(p.status || 'Active').toLowerCase() === 'active');
      activePage = activeList.length > 0 ? activeList[0] : allPages[0];
    }

    // Also check `dcbd_landing_config` if admin just saved a draft
    if (!activePage && typeof localStorage !== 'undefined') {
      try {
        const draftCfg = JSON.parse(localStorage.getItem('dcbd_landing_config') || 'null');
        if (draftCfg && typeof draftCfg === 'object' && (draftCfg.title || draftCfg.hero_banner)) {
          activePage = draftCfg;
        }
      } catch (e) {}
    }

    const shopName = siteSettings.site_name || siteSettings.shop_name || siteSettings.storeName || 'Dream Cart BD';
    const shopLogo =
      siteSettings.logo_url ||
      siteSettings.site_logo ||
      'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';

    // Empty state if no landing page exists
    if (!activePage) {
      return `
        <div style="min-height:85vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#f8fafc;font-family:'Hind Siliguri',system-ui,sans-serif;">
          <div style="max-width:480px;width:100%;background:#ffffff;border-radius:24px;padding:36px 28px;box-shadow:0 20px 45px -15px rgba(15,23,42,0.08);border:1px solid #e2e8f0;text-align:center;">
            <img src="${shopLogo}" alt="${shopName}" style="width:68px;height:68px;margin:0 auto 16px;border-radius:18px;object-fit:cover;border:2px solid #10b981;">
            <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin:0 0 10px;">এখনো কোনো ল্যান্ডিং পেজ তৈরি করা হয়নি</h1>
            <p style="font-size:14px;color:#64748b;line-height:1.6;margin:0 0 24px;">
              অ্যাডমিন প্যানেল থেকে নতুন ল্যান্ডিং পেজ তৈরি করলে সেটি এখানে সাথে সাথে প্রদর্শিত হবে।
            </p>
            <a href="/products" style="display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border-radius:14px;background:#059669;color:#ffffff;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 10px 20px -5px rgba(5,150,105,0.4);">
              🛍️ মূল ওয়েবসাইটে যান
            </a>
          </div>
        </div>
      `;
    }

    // Resolve Delivery Areas & Payment Options specifically selected for this Landing Page from Admin Panel
    const deliveryConfs = resolveLandingPageDeliveryMethods(activePage);
    const paymentMethods = resolveLandingPagePaymentMethods(activePage);

    if (typeof window !== 'undefined') {
      window.__lpDeliveryConfs = deliveryConfs;
      window.__lpPaymentMethods = paymentMethods;
      window.__lpSelectedDeliveryId = deliveryConfs[0]?.id || 'dhaka';
      window.__lpSelectedPayment = paymentMethods[0]?.id || 'COD';
      window.__lpFreeThreshold = Number(siteSettings?.freeDeliveryThreshold || 2000);
      window.__lpOnlineDiscountPct = Number(siteSettings?.onlineDiscountPct || 5);
    }

    // Extract fields supporting AdminPortal (`subtitle`, `badge`, `promo`, `selected_products`, `theme`)
    const pageTitle = String(activePage.title || activePage.Slogan || activePage.slogan || '').trim();
    const heroHeadline = String(activePage.headline || pageTitle).trim();
    const heroSubheadline = String(activePage.subtitle || activePage.subheadline || '').trim();
    const badgeText = String(activePage.badge || activePage.badge_text || '').trim();
    const ctaText = String(activePage.cta_text || 'অর্ডার কনফার্ম করুন').trim().replace(/\s*→\s*$/, '');
    const heroBanner = String(activePage.hero_banner || activePage.banner || '').trim();
    const giftNote = String(activePage.gift_note || activePage.promo || '').trim();
    const pageDescription = String(activePage.description || '').trim();
    const freeShipping = Boolean(activePage.free_shipping === true || activePage.free_shipping === 'true');
    const countdownHours = Number(activePage.countdown_hours ?? 12);
    const themeColor = String(activePage.theme || activePage.theme_color || 'emerald').toLowerCase();

    if (typeof window !== 'undefined') {
      window.__lpFreeShipping = freeShipping;
    }

    const palette = LP_AUTHENTIC_THEMES[themeColor] || LP_AUTHENTIC_THEMES.emerald;

    // Resolve products selected in Admin Landing Page Builder (`selected_products`, `selected_skus`, or `products`)
    const rawSelectedProds = parseJsonSafe(
      activePage.selected_products || activePage.selected_skus || activePage.products || activePage.Products,
      []
    );
    const selectedList = Array.isArray(rawSelectedProds)
      ? rawSelectedProds
      : String(rawSelectedProds || '').split(',').map(s => s.trim()).filter(Boolean);

    const resolvedProducts = [];
    selectedList.forEach(item => {
      if (!item) return;
      const itemId =
        typeof item === 'object'
          ? String(item.sku || item.product_id || item.id || '').trim()
          : String(item).trim();
      const matched = allProducts.find(p => {
        const pSku = String(p.sku || p.product_id || p.id || '').trim().toLowerCase();
        return pSku && pSku === itemId.toLowerCase();
      });
      if (matched) {
        const imgUrl =
          matched.thumbnail ||
          (Array.isArray(matched.images) && matched.images[0]) ||
          matched.image_url ||
          matched.image ||
          heroBanner ||
          '';
        const sellP = Number(
          (typeof item === 'object' && item.offer_price) ||
            matched.selling_price ||
            matched.offer_price ||
            matched.price ||
            0
        );
        const origP = Number(
          (typeof item === 'object' && item.regular_price) ||
            matched.original_price ||
            matched.regular_price ||
            0
        );
        resolvedProducts.push({
          ...matched,
          image_url: imgUrl,
          offer_price: sellP,
          regular_price: origP,
          colors: normalizeStringList(matched.colors || matched.color),
          sizes: normalizeStringList(matched.sizes || matched.size)
        });
      } else if (typeof item === 'object' && (item.name || item.p_name)) {
        resolvedProducts.push({
          ...item,
          image_url: item.image_url || item.thumbnail || item.image || heroBanner || '',
          offer_price: Number(item.offer_price || item.selling_price || item.price || 0),
          regular_price: Number(item.regular_price || item.original_price || 0),
          colors: normalizeStringList(item.colors || item.color),
          sizes: normalizeStringList(item.sizes || item.size)
        });
      }
    });

    // If no specific products were attached to this campaign yet, show top store products so campaign always has real products
    if (resolvedProducts.length === 0 && allProducts.length > 0) {
      allProducts.slice(0, 6).forEach(matched => {
        const imgUrl =
          matched.thumbnail ||
          (Array.isArray(matched.images) && matched.images[0]) ||
          matched.image_url ||
          matched.image ||
          heroBanner ||
          '';
        resolvedProducts.push({
          ...matched,
          image_url: imgUrl,
          offer_price: Number(matched.selling_price || matched.offer_price || matched.price || 0),
          regular_price: Number(matched.original_price || matched.regular_price || 0),
          colors: normalizeStringList(matched.colors || matched.color),
          sizes: normalizeStringList(matched.sizes || matched.size)
        });
      });
    }

    const firstProd = resolvedProducts[0] || {};
    const firstPrice = Number(firstProd.offer_price || firstProd.selling_price || firstProd.price || 0);
    const firstRegPrice = Number(firstProd.regular_price || firstProd.original_price || 0);
    const firstTitle = firstProd.name || firstProd.p_name || pageTitle || heroHeadline || 'ক্যাম্পেইন পণ্য';
    const firstSku = firstProd.sku || firstProd.product_id || firstProd.id || 'LP-ITEM';
    const firstImg = firstProd.image_url || firstProd.thumbnail || heroBanner || '';

    // Features, Specs, Colors, Sizes, Banners, Videos
    const featuresList = normalizeFeatures(activePage.features || activePage.bullets);
    const specRows = normalizeSpecs(activePage.specifications || firstProd.specification || firstProd.specifications);
    const defaultColors = normalizeStringList(activePage.colors || firstProd.colors || firstProd.color);
    const defaultSizes = normalizeStringList(activePage.sizes || firstProd.sizes || firstProd.size);

    if (typeof window !== 'undefined') {
      window.__lpProductsList = resolvedProducts;
      window.__lpSelectedPackage = 0;
      window.__lpPackagePrice = firstPrice;
      window.__lpPackageRegularPrice = firstRegPrice;
      window.__lpPackageTitle = firstTitle;
      window.__lpPackageSku = firstSku;
      window.__lpPackageImage = firstImg;
      window.__lpQuantity = 1;
      window.__lpDefaultColors = defaultColors;
      window.__lpDefaultSizes = defaultSizes;
      window.__lpSelectedColor = defaultColors[0] || '';
      window.__lpSelectedSize = defaultSizes[0] || '';
    }

    // Normalize Banners
    const rawBanners = parseJsonSafe(activePage.banners, []);
    const banners = (Array.isArray(rawBanners) ? rawBanners : [])
      .map(b => {
        if (!b) return null;
        if (typeof b === 'string') return { image_url: b.trim(), caption: '' };
        const u = String(b.url || b.image_url || '').trim();
        return u ? { image_url: u, caption: String(b.caption || b.title || '').trim() } : null;
      })
      .filter(Boolean);

    // Normalize Videos
    const rawVideos = parseJsonSafe(activePage.videos, []);
    const videos = (Array.isArray(rawVideos) ? rawVideos : [])
      .map(v => {
        if (!v) return null;
        if (typeof v === 'string') return { video_url: v.trim(), title: '' };
        const u = String(v.url || v.video_url || '').trim();
        return u ? { video_url: u, title: String(v.title || v.caption || '').trim() } : null;
      })
      .filter(Boolean);

    const finalDescription = pageDescription || String(firstProd.description || firstProd.short_description || '').trim();
    const contactPhone = activePage.hotline || siteSettings.hotline1 || siteSettings.contact_phone || siteSettings.supportPhone || '01581703822';
    const cleanPhone = String(contactPhone).replace(/[^0-9+]/g, '');

    const heroDisplayImg = heroBanner || firstImg || '';
    const prodGridClass =
      resolvedProducts.length === 1
        ? 'lp-products-grid is-single'
        : resolvedProducts.length === 2
        ? 'lp-products-grid is-double'
        : 'lp-products-grid';

    const firstZone = deliveryConfs[0] || { id: 'dhaka', name: 'ঢাকা সিটি', charge: 80, eta: '২-৩ দিন' };
    const firstZoneFee = Number(firstZone.charge || 0);
    const initFree = freeShipping || firstPrice >= 2000 || firstZoneFee === 0;
    const initShipping = initFree ? 0 : firstZoneFee;
    const initOnlineSavings = Math.round((firstPrice * 5) / 100);

    // Start countdown timer and live calculation after router mounts HTML
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (typeof window.selectLpPaymentMethod === 'function') {
          window.selectLpPaymentMethod(paymentMethods[0]?.id || 'COD');
        }
        if (typeof window.updateLpOrderCalculation === 'function') {
          window.updateLpOrderCalculation();
        }
        if (window.__lpActiveTimer) clearInterval(window.__lpActiveTimer);
        if (countdownHours > 0) {
          let remainingSeconds = Math.floor(countdownHours * 3600) + 45 * 60 + 19;
          window.__lpActiveTimer = setInterval(() => {
            const hEl = document.getElementById('lp-cd-h');
            const mEl = document.getElementById('lp-cd-m');
            const sEl = document.getElementById('lp-cd-s');
            if (!hEl || !mEl || !sEl) {
              clearInterval(window.__lpActiveTimer);
              return;
            }
            remainingSeconds = remainingSeconds <= 0 ? 3600 : remainingSeconds - 1;
            const hrs = Math.floor(remainingSeconds / 3600);
            const mins = Math.floor((remainingSeconds % 3600) / 60);
            const secs = remainingSeconds % 60;
            hEl.textContent = String(hrs).padStart(2, '0');
            mEl.textContent = String(mins).padStart(2, '0');
            sEl.textContent = String(secs).padStart(2, '0');
          }, 1000);
        }
      }, 25);
    }

    return `
      <div class="lp-page-root">
        <style id="dcbd-lp-modern-styles">
          @keyframes lpSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes lpPulseGlow {
            0%, 100% { box-shadow: 0 12px 26px -5px ${palette.glow}, 0 5px 0 ${palette.bevel}; transform: translateY(0); }
            50% { box-shadow: 0 18px 34px -4px ${palette.glow}, 0 5px 0 ${palette.bevel}; transform: translateY(-2px); }
          }
          @keyframes lpFloat3D {
            0%, 100% { transform: translateY(0px) rotateX(0deg); }
            50% { transform: translateY(-7px) rotateX(2deg); }
          }
          @keyframes lpShimmerSweep {
            0% { transform: translateX(-150%) skewX(-22deg); }
            100% { transform: translateX(250%) skewX(-22deg); }
          }
          .lp-page-root, .lp-page-root * { box-sizing: border-box; font-family: 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
          .lp-page-root { min-height: 100vh; background: ${palette.pageBg}; color: #0f172a; padding-bottom: 56px; overflow-x: hidden; width: 100%; }
          .lp-wrap { max-width: 1160px; margin: 0 auto; padding: 0 16px; width: 100%; }

          /* Top Announcement Bar */
          .lp-top-bar { background: ${palette.topBarBg}; color: #ffffff; padding: 10px 0; box-shadow: 0 2px 12px rgba(15, 23, 42, 0.12); }
          .lp-top-bar-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
          .lp-top-badge { font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
          .lp-countdown-wrap { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; }
          .lp-timer-group { display: flex; align-items: center; gap: 5px; }
          .lp-timer-box { background: rgba(15, 23, 42, 0.45); border: 1px solid rgba(255, 255, 255, 0.28); border-bottom: 3px solid rgba(255, 255, 255, 0.45); color: #ffffff; border-radius: 8px; padding: 3px 8px; min-width: 44px; text-align: center; font-weight: 900; font-size: 12px; }

          /* Sticky Header Navigation with 3D Logo Frame */
          .lp-navbar { position: sticky; top: 0; z-index: 45; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(226, 232, 240, 0.9); box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.06); }
          .lp-navbar-inner { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 0; }
          .lp-brand-link { display: flex; align-items: center; gap: 11px; text-decoration: none; min-width: 0; cursor: pointer; user-select: none; }
          .lp-brand-logo { height: 44px; width: 44px; object-fit: cover; border-radius: 12px; border: 2px solid ${palette.border}; box-shadow: 0 4px 10px ${palette.glow}; flex-shrink: 0; background: #fff; }
          .lp-brand-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 18px; background: ${palette.primary}; flex-shrink: 0; }
          .lp-brand-name { font-size: 16.5px; font-weight: 900; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .lp-brand-sub { font-size: 11px; color: #64748b; font-weight: 700; display: flex; align-items: center; gap: 4px; }
          .lp-nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
          .lp-nav-phone { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; background: #f1f5f9; color: #1e293b; font-weight: 800; font-size: 12px; text-decoration: none; border-bottom: 3px solid #cbd5e1; transition: all 0.2s; }
          .lp-nav-phone:hover { background: #e2e8f0; transform: translateY(-1px); }
          .lp-nav-store-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 15px; border-radius: 999px; background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; border-bottom: 3.5px solid #94a3b8; font-weight: 800; font-size: 12.5px; text-decoration: none; transition: all 0.2s; }
          .lp-nav-store-btn:hover { border-color: ${palette.primary}; color: ${palette.primary}; background: ${palette.light}; transform: translateY(-1px); }
          .lp-nav-order-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 999px; background: linear-gradient(135deg, ${palette.primary}, ${palette.primaryDark}); color: #ffffff; font-weight: 800; font-size: 12.5px; text-decoration: none; border: none; border-bottom: 3.5px solid ${palette.bevel}; cursor: pointer; box-shadow: 0 6px 16px ${palette.glow}; transition: transform 0.2s; }
          .lp-nav-order-btn:hover { transform: translateY(-2px); }

          /* 3D Surface Cards */
          .lp-surface-card { background: #ffffff; border-radius: 26px; border: 1.5px solid rgba(226, 232, 240, 0.95); border-bottom: 6px solid #cbd5e1; box-shadow: 0 14px 36px -8px rgba(15, 23, 42, 0.06); padding: 28px; margin-bottom: 26px; overflow: hidden; scroll-margin-top: 84px; }
          .lp-section-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 22px; padding-bottom: 14px; border-bottom: 1.5px solid #f1f5f9; }
          .lp-section-title { font-size: 21px; font-weight: 900; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
          .lp-section-sub { font-size: 12.5px; font-weight: 800; color: ${palette.primary}; background: ${palette.light}; padding: 6px 14px; border-radius: 999px; border: 1.5px solid ${palette.border}; box-shadow: 0 3px 0 ${palette.border}; }

          /* 3D Hero Showcase Card (Multi-Product Campaign Header — NO standalone product-less price) */
          .lp-hero-card { background: ${palette.heroBg}; border-radius: 28px; border: 2px solid ${palette.border}; border-bottom: 8px solid ${palette.primary}; box-shadow: 0 22px 48px -12px rgba(15, 23, 42, 0.10); margin-top: 20px; margin-bottom: 28px; overflow: hidden; perspective: 1200px; }
          .lp-hero-grid { display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr); align-items: center; }
          .lp-hero-grid.is-single { grid-template-columns: minmax(0, 1fr); text-align: center; max-width: 800px; margin: 0 auto; }
          .lp-hero-content { padding: 36px 34px; min-width: 0; }
          .lp-hero-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 15px; border-radius: 999px; font-size: 12.5px; font-weight: 800; background: ${palette.badgeBg}; color: ${palette.badgeText}; margin-bottom: 14px; box-shadow: 0 4px 12px ${palette.glow}; }
          .lp-hero-title { font-size: 31px; font-weight: 900; color: #0f172a; line-height: 1.3; margin: 0 0 12px; word-break: break-word; }
          .lp-hero-subtitle { font-size: 15.5px; color: #475569; line-height: 1.65; font-weight: 500; margin: 0 0 20px; word-break: break-word; }
          .lp-promo-strip { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
          .lp-promo-tag { display: inline-flex; align-items: center; gap: 5px; padding: 7px 13px; border-radius: 11px; font-size: 12.5px; font-weight: 800; background: #ecfdf5; color: #065f46; border: 1.5px solid #6ee7b7; border-bottom: 3px solid #10b981; }
          .lp-promo-tag.is-online { background: #fff1f2; color: #be123c; border-color: #fda4af; border-bottom-color: #e11d48; }
          .lp-promo-tag.is-count { background: ${palette.light}; color: ${palette.primary}; border-color: ${palette.border}; border-bottom-color: ${palette.primary}; }
          .lp-gift-banner { padding: 12px 16px; border-radius: 14px; background: #fffbeb; border: 1.5px solid #fde68a; border-bottom: 4px solid #f59e0b; color: #92400e; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
          .lp-hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
          .lp-btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; border-radius: 16px; font-weight: 900; font-size: 15.5px; color: #ffffff; background: linear-gradient(135deg, ${palette.primary}, ${palette.primaryDark}); text-decoration: none; border: none; border-bottom: 5px solid ${palette.bevel}; cursor: pointer; animation: lpPulseGlow 2.6s infinite; transition: all 0.2s ease; }
          .lp-btn-primary:hover { transform: translateY(-3px) scale(1.02); }
          .lp-btn-primary:active { transform: translateY(2px); border-bottom-width: 2px; }
          .lp-btn-secondary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 22px; border-radius: 16px; font-weight: 800; font-size: 14px; color: #0f172a; background: #ffffff; border: 1.5px solid #cbd5e1; border-bottom: 4px solid #94a3b8; text-decoration: none; transition: all 0.2s ease; }
          .lp-btn-secondary:hover { border-color: ${palette.primary}; color: ${palette.primary}; background: ${palette.light}; transform: translateY(-2px); }
          .lp-hero-micro-trust { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 16px; font-size: 12px; font-weight: 700; color: #475569; }
          .lp-hero-media { padding: 28px; display: flex; align-items: center; justify-content: center; height: 100%; min-height: 300px; perspective: 1200px; }
          .lp-hero-img-box { position: relative; width: 100%; max-width: 420px; height: 320px; background: #ffffff; border-radius: 24px; padding: 14px; border: 2px solid #e2e8f0; border-bottom: 7px solid #cbd5e1; box-shadow: 0 22px 42px -12px rgba(15, 23, 42, 0.16); display: flex; align-items: center; justify-content: center; overflow: hidden; animation: lpFloat3D 5s ease-in-out infinite; }
          .lp-hero-img-box img { width: 100%; height: 100%; object-fit: contain; border-radius: 14px; filter: drop-shadow(0 12px 18px rgba(15, 23, 42, 0.12)); }

          /* 3D Campaign Products Showcase Grid (Luxury 3D Product Cards) */
          .lp-products-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; align-items: stretch; perspective: 1400px; }
          .lp-products-grid.is-single { grid-template-columns: minmax(0, 420px); justify-content: center; }
          .lp-products-grid.is-double { grid-template-columns: repeat(2, minmax(0, 390px)); justify-content: center; }
          .lp-showcase-card {
            position: relative;
            display: flex;
            flex-direction: column;
            background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid #e2e8f0;
            border-bottom: 7px solid #cbd5e1;
            border-radius: 22px;
            padding: 15px;
            transform-style: preserve-3d;
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease;
            cursor: pointer;
            min-width: 0;
            overflow: hidden;
            box-shadow: 0 12px 26px -8px rgba(15, 23, 42, 0.08);
          }
          .lp-showcase-card::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 45%;
            height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%);
            transform: translateX(-160%) skewX(-22deg);
            pointer-events: none;
            z-index: 3;
          }
          .lp-showcase-card:hover {
            transform: translateY(-9px) rotateX(2.5deg) scale(1.015);
            border-color: ${palette.primary};
            border-bottom-color: ${palette.bevel};
            box-shadow: 0 26px 46px -12px ${palette.glow}, 0 10px 20px -6px rgba(15, 23, 42, 0.12);
          }
          .lp-showcase-card:hover::after {
            animation: lpShimmerSweep 0.85s ease-in-out;
          }
          .lp-showcase-card.is-selected {
            border-color: ${palette.primary};
            border-bottom: 7px solid ${palette.bevel};
            background: linear-gradient(180deg, #ffffff 0%, ${palette.light} 100%);
            box-shadow: 0 20px 38px -10px ${palette.glow}, 0 0 0 3px ${palette.border};
          }
          .lp-showcase-img-wrap {
            position: relative;
            width: 100%;
            height: 220px;
            border-radius: 16px;
            background: radial-gradient(circle at 50% 60%, #ffffff 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14px;
            padding: 12px;
          }
          .lp-showcase-img-wrap::before {
            content: "";
            position: absolute;
            bottom: 8px;
            width: 60%;
            height: 13px;
            background: radial-gradient(ellipse at center, rgba(15, 23, 42, 0.18) 0%, rgba(15, 23, 42, 0) 75%);
            border-radius: 50%;
            pointer-events: none;
            transition: transform 0.35s ease;
          }
          .lp-showcase-img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
            filter: drop-shadow(0 10px 14px rgba(15, 23, 42, 0.12));
            position: relative;
            z-index: 1;
          }
          .lp-showcase-card:hover .lp-showcase-img-wrap img {
            transform: translateY(-6px) scale(1.07);
            filter: drop-shadow(0 18px 22px rgba(15, 23, 42, 0.18));
          }
          .lp-showcase-discount-pill { position: absolute; top: 10px; left: 10px; padding: 4px 11px; border-radius: 999px; background: linear-gradient(135deg, #e11d48, #be123c); color: #ffffff; font-size: 11px; font-weight: 900; box-shadow: 0 3px 0 #881337, 0 6px 12px rgba(225, 29, 72, 0.25); z-index: 2; }
          .lp-showcase-selected-pill { position: absolute; top: 10px; right: 10px; padding: 4px 11px; border-radius: 999px; background: ${palette.primary}; color: #ffffff; font-size: 11px; font-weight: 900; box-shadow: 0 3px 0 ${palette.bevel}, 0 6px 12px ${palette.glow}; z-index: 2; }
          .lp-showcase-stock-tag { position: absolute; bottom: 8px; left: 10px; padding: 3px 9px; border-radius: 6px; background: rgba(15, 23, 42, 0.78); backdrop-filter: blur(4px); color: #34d399; font-size: 10px; font-weight: 800; z-index: 2; }
          .lp-showcase-body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
          .lp-showcase-meta { font-size: 10.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
          .lp-showcase-title { font-size: 15.5px; font-weight: 800; color: #0f172a; line-height: 1.4; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; min-height: 42px; }
          .lp-showcase-price-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 8px; border-top: 1px dashed #e2e8f0; margin-bottom: 12px; }
          .lp-showcase-offer { font-size: 20px; font-weight: 900; color: ${palette.primary}; }
          .lp-showcase-reg { font-size: 13px; color: #94a3b8; text-decoration: line-through; font-weight: 700; }
          .lp-showcase-select-btn { width: 100%; padding: 11px 14px; border-radius: 13px; font-size: 13px; font-weight: 800; border: 1.5px solid ${palette.primary}; border-bottom: 4px solid ${palette.primaryDark}; background: #ffffff; color: ${palette.primary}; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; }
          .lp-showcase-card.is-selected .lp-showcase-select-btn, .lp-showcase-select-btn:hover { background: linear-gradient(135deg, ${palette.primary}, ${palette.primaryDark}); color: #ffffff; border-bottom-color: ${palette.bevel}; box-shadow: 0 8px 18px -4px ${palette.glow}; }

          /* Features, Specs & Media Grids */
          .lp-features-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
          .lp-feature-item { display: flex; align-items: flex-start; gap: 12px; padding: 15px 16px; border-radius: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-bottom: 4px solid #cbd5e1; transition: transform 0.2s ease; }
          .lp-feature-item:hover { transform: translateY(-3px); border-color: ${palette.border}; }
          .lp-feature-icon { width: 28px; height: 28px; border-radius: 9px; background: ${palette.primary}; color: #ffffff; font-size: 13px; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 3px 0 ${palette.bevel}; }
          .lp-feature-text { font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.5; word-break: break-word; }
          .lp-info-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: 22px; margin-bottom: 26px; }
          .lp-info-grid.is-single { grid-template-columns: minmax(0, 1fr); }
          .lp-spec-table { width: 100%; border-collapse: collapse; }
          .lp-spec-row { display: grid; grid-template-columns: 40% 60%; gap: 10px; padding: 11px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; border-radius: 8px; }
          .lp-spec-row:nth-child(odd) { background: #f8fafc; }
          .lp-spec-row.is-full { grid-template-columns: 1fr; }
          .lp-spec-row:last-child { border-bottom: none; }
          .lp-spec-label { font-weight: 700; color: #475569; word-break: break-word; }
          .lp-spec-val { font-weight: 800; color: #0f172a; word-break: break-word; }
          .lp-gallery-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
          .lp-gallery-card { border-radius: 18px; overflow: hidden; border: 2px solid #e2e8f0; border-bottom: 5px solid #cbd5e1; background: #f8fafc; transition: transform 0.25s ease; }
          .lp-gallery-card:hover { transform: translateY(-4px); }
          .lp-gallery-card img { width: 100%; height: 240px; object-fit: cover; display: block; }
          .lp-video-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
          .lp-video-grid.is-single { grid-template-columns: minmax(0, 720px); justify-content: center; }

          /* Checkout Form Section — 3D Luxury Design & Zero Overflow */
          .lp-checkout-shell { background: #ffffff; border-radius: 28px; border: 2px solid ${palette.border}; border-bottom: 8px solid ${palette.primary}; box-shadow: 0 25px 55px -12px rgba(15, 23, 42, 0.12); overflow: hidden; margin-top: 12px; scroll-margin-top: 84px; }
          .lp-checkout-banner { background: ${palette.topBarBg}; padding: 24px 20px; text-align: center; color: #ffffff; }
          .lp-checkout-banner h2 { font-size: 23px; font-weight: 900; margin: 0 0 6px; line-height: 1.35; }
          .lp-checkout-banner p { font-size: 13.5px; margin: 0; opacity: 0.95; font-weight: 700; }
          .lp-checkout-body { padding: 26px; }
          .lp-checkout-grid { display: grid; grid-template-columns: minmax(0, 1.04fr) minmax(0, 0.96fr); gap: 26px; align-items: start; }
          .lp-checkout-col { min-width: 0; width: 100%; }
          .lp-step-heading { font-size: 15.5px; font-weight: 900; color: #0f172a; margin: 0 0 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
          .lp-step-count-badge { font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px; background: ${palette.light}; color: ${palette.primary}; border: 1px solid ${palette.border}; }

          /* Free Delivery Animated Progress Bar */
          .lp-free-delivery-box { padding: 13px 15px; border-radius: 16px; background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 1.5px solid #6ee7b7; border-bottom: 4px solid #10b981; margin-bottom: 18px; }
          .lp-free-progress-track { width: 100%; height: 8px; border-radius: 999px; background: #d1fae5; overflow: hidden; margin-top: 7px; }
          .lp-free-progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #10b981 0%, #059669 100%); transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1); }

          /* 3D Product Selector List inside Checkout */
          .lp-pkg-list-scroll { display: flex; flex-direction: column; gap: 11px; max-height: 370px; overflow-y: auto; padding: 2px 4px 6px 2px; margin-bottom: 16px; }
          .lp-pkg-list-scroll::-webkit-scrollbar { width: 5px; }
          .lp-pkg-list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
          .lp-pkg-card { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 16px; border: 2px solid #e2e8f0; border-bottom: 5px solid #cbd5e1; background: #ffffff; cursor: pointer; transition: all 0.22s ease; width: 100%; min-width: 0; overflow: hidden; }
          .lp-pkg-card:hover { border-color: ${palette.primary}; background: #f8fafc; transform: translateY(-2px); }
          .lp-pkg-card.is-selected { border-color: ${palette.primary}; border-bottom-color: ${palette.bevel}; background: ${palette.light}; box-shadow: 0 8px 20px -6px ${palette.glow}; }
          .lp-pkg-radio { width: 20px; height: 20px; border-radius: 999px; border: 2px solid #94a3b8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #ffffff; }
          .lp-pkg-card.is-selected .lp-pkg-radio { border-color: ${palette.primary}; }
          .lp-pkg-radio-dot { width: 10px; height: 10px; border-radius: 999px; background: ${palette.primary}; transition: transform 0.2s ease; }
          .lp-pkg-thumb { width: 60px; height: 60px; border-radius: 12px; object-fit: contain; background: #ffffff; border: 1px solid #e2e8f0; padding: 3px; flex-shrink: 0; box-shadow: 0 3px 8px rgba(15, 23, 42, 0.06); }
          .lp-pkg-info { flex: 1 1 0%; min-width: 0; overflow: hidden; }
          .lp-pkg-title { font-size: 13.5px; font-weight: 800; color: #0f172a; line-height: 1.35; margin: 0 0 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: normal !important; word-break: break-word; overflow-wrap: anywhere; }
          .lp-pkg-price-wrap { display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
          .lp-pkg-price-left { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
          .lp-pkg-offer { font-size: 15.5px; font-weight: 900; color: ${palette.primary}; }
          .lp-pkg-reg { font-size: 11.5px; color: #94a3b8; text-decoration: line-through; font-weight: 700; }
          .lp-pkg-disc-badge { font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 999px; background: #ffe4e6; color: #e11d48; }
          .lp-pkg-active-pill { font-size: 10.5px; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: ${palette.primary}; color: #ffffff; align-items: center; gap: 3px; }

          /* Variant, Quantity & Summary Controls */
          .lp-variant-box { padding: 14px; border-radius: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; margin-bottom: 12px; }
          .lp-variant-label { display: block; font-size: 12.5px; font-weight: 800; color: #334155; margin-bottom: 8px; }
          .lp-pill-list { display: flex; flex-wrap: wrap; gap: 8px; }
          .lp-color-btn, .lp-size-btn { padding: 7px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 800; border: 1.5px solid #cbd5e1; border-bottom: 3.5px solid #94a3b8; background: #ffffff; color: #334155; cursor: pointer; transition: all 0.15s ease; }
          .lp-color-btn.is-active, .lp-size-btn.is-active { border-color: ${palette.primary}; border-bottom-color: ${palette.bevel}; background: ${palette.primary}; color: #ffffff; }
          .lp-qty-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-radius: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-bottom: 4px solid #cbd5e1; margin-bottom: 14px; }
          .lp-qty-controls { display: flex; align-items: center; gap: 10px; }
          .lp-qty-btn { width: 34px; height: 34px; border-radius: 10px; background: #ffffff; border: 1.5px solid #cbd5e1; border-bottom: 3px solid #94a3b8; font-weight: 900; font-size: 16px; color: #0f172a; cursor: pointer; display: flex; align-items: center; justify-content: center; }
          .lp-qty-btn:hover { background: #f1f5f9; }
          .lp-qty-num { min-width: 28px; text-align: center; font-size: 16px; font-weight: 900; color: #0f172a; }

          /* Live 3D Order Summary Box */
          .lp-summary-box { padding: 18px; border-radius: 20px; background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%); border-bottom: 6px solid #020617; color: #ffffff; box-shadow: 0 16px 32px -8px rgba(15, 23, 42, 0.3); }
          .lp-summary-head { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
          .lp-summary-prod-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
          .lp-summary-thumb { width: 46px; height: 46px; border-radius: 10px; object-fit: contain; background: #ffffff; padding: 2px; flex-shrink: 0; }
          .lp-summary-prod-title { font-size: 13px; font-weight: 700; color: #f1f5f9; line-height: 1.35; flex: 1; min-width: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
          .lp-summary-qty-badge { font-size: 12px; font-weight: 900; color: #34d399; background: rgba(52, 211, 153, 0.14); padding: 4px 9px; border-radius: 8px; white-space: nowrap; flex-shrink: 0; }
          .lp-summary-line { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #cbd5e1; padding: 4px 0; gap: 8px; }
          .lp-summary-total-line { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; margin-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.14); font-size: 16px; font-weight: 900; }

          /* Right Column Shipping & Payment Card */
          .lp-shipping-card { background: #f8fafc; border: 1.5px solid #e2e8f0; border-bottom: 6px solid #cbd5e1; border-radius: 22px; padding: 20px; }
          .lp-field-group { margin-bottom: 14px; }
          .lp-field-label { display: block; font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 6px; }
          .lp-input { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #ffffff; font-size: 14px; font-weight: 600; color: #0f172a; transition: all 0.2s ease; }
          .lp-input:focus { outline: none; border-color: ${palette.primary}; box-shadow: 0 0 0 3px ${palette.glow}; }
          .lp-zone-chips { display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 8px; margin-bottom: 8px; }
          .lp-zone-chip { padding: 10px 8px; border-radius: 12px; border: 1.5px solid #cbd5e1; border-bottom: 4px solid #94a3b8; background: #ffffff; color: #334155; font-size: 11.5px; font-weight: 800; text-align: center; cursor: pointer; transition: all 0.18s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; }
          .lp-zone-chip.is-active { border-color: ${palette.primary}; border-bottom-color: ${palette.bevel}; background: ${palette.light}; color: ${palette.primary}; box-shadow: 0 6px 14px -4px ${palette.glow}; }

          /* 3D Payment Option Cards (COD + Online Payment 5% OFF) */
          .lp-pay-options-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-bottom: 10px; }
          .lp-pay-option-card { position: relative; display: flex; align-items: center; gap: 8px; padding: 11px 11px; border-radius: 14px; border: 2px solid #cbd5e1; border-bottom: 4px solid #94a3b8; background: #ffffff; cursor: pointer; transition: all 0.18s ease; }
          .lp-pay-option-card:hover { border-color: ${palette.primary}; transform: translateY(-2px); }
          .lp-pay-option-card.is-active { border-color: ${palette.primary}; border-bottom-color: ${palette.bevel}; background: ${palette.light}; box-shadow: 0 8px 18px -5px ${palette.glow}; }
          .lp-pay-radio { width: 18px; height: 18px; border-radius: 999px; border: 2px solid #94a3b8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #ffffff; }
          .lp-pay-option-card.is-active .lp-pay-radio { border-color: ${palette.primary}; }
          .lp-pay-radio-dot { width: 9px; height: 9px; border-radius: 999px; background: ${palette.primary}; transition: transform 0.2s ease; }
          .lp-pay-5pct-tag { position: absolute; top: -8px; right: 8px; background: linear-gradient(135deg, #e11d48, #be123c); color: #ffffff; font-size: 9.5px; font-weight: 900; padding: 2px 7px; border-radius: 999px; box-shadow: 0 2px 6px rgba(225, 29, 72, 0.3); }

          .lp-cod-box { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 14px; background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #065f46; font-size: 12.5px; font-weight: 800; margin-bottom: 14px; }
          .lp-online-pay-box { padding: 14px; border-radius: 16px; background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 2px solid #fda4af; border-bottom: 5px solid #e11d48; margin-bottom: 14px; }
          .lp-pay-number-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; background: #ffffff; padding: 9px 12px; border-radius: 12px; border: 1.5px solid #fecdd3; }
          .lp-copy-num-btn { padding: 6px 11px; border-radius: 9px; border: 1.5px solid #e11d48; background: #fff1f2; color: #be123c; font-size: 11.5px; font-weight: 800; cursor: pointer; }
          .lp-gw-link-btn { padding: 6px 11px; border-radius: 9px; background: #e11d48; color: #ffffff; font-size: 11.5px; font-weight: 800; text-decoration: none; }

          .lp-submit-btn { width: 100%; padding: 15px 20px; border-radius: 16px; border: none; border-bottom: 5px solid ${palette.bevel}; background: linear-gradient(135deg, ${palette.primary}, ${palette.primaryDark}); color: #ffffff; font-size: 16.5px; font-weight: 900; cursor: pointer; box-shadow: 0 12px 26px -5px ${palette.glow}; transition: all 0.2s ease; }
          .lp-submit-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
          .lp-submit-btn:active { transform: translateY(2px); border-bottom-width: 2px; }

          .lp-trust-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 24px 0; }
          .lp-trust-card { background: #ffffff; border: 1.5px solid #e2e8f0; border-bottom: 5px solid #cbd5e1; border-radius: 18px; padding: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04); transition: transform 0.2s ease; }
          .lp-trust-card:hover { transform: translateY(-3px); }
          .lp-trust-icon { width: 44px; height: 44px; border-radius: 12px; background: ${palette.light}; color: ${palette.primary}; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; border: 1px solid ${palette.border}; }

          /* Responsive Breakpoints */
          @media (max-width: 960px) {
            .lp-hero-grid, .lp-info-grid, .lp-checkout-grid, .lp-trust-grid { grid-template-columns: minmax(0, 1fr); }
            .lp-hero-media { border-top: 1px solid rgba(226, 232, 240, 0.7); padding: 20px; }
            .lp-checkout-grid { gap: 20px; }
            .lp-products-grid, .lp-gallery-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }
          @media (max-width: 640px) {
            .lp-wrap { padding: 0 12px; }
            .lp-top-bar-inner { justify-content: center; text-align: center; }
            .lp-nav-phone { display: none; }
            .lp-nav-store-btn, .lp-nav-order-btn { padding: 7px 11px; font-size: 11.5px; }
            .lp-surface-card { padding: 18px 14px; border-radius: 20px; }
            .lp-hero-content { padding: 22px 16px; }
            .lp-hero-title { font-size: 22px; }
            .lp-hero-img-box { height: 240px; }
            .lp-products-grid, .lp-products-grid.is-double { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
            .lp-showcase-card { padding: 10px; border-radius: 16px; }
            .lp-showcase-img-wrap { height: 145px; padding: 6px; margin-bottom: 8px; }
            .lp-showcase-title { font-size: 13px; min-height: 36px; }
            .lp-showcase-offer { font-size: 15px; }
            .lp-showcase-reg { font-size: 11px; }
            .lp-showcase-select-btn { padding: 8px 10px; font-size: 11.5px; border-radius: 10px; }
            .lp-features-grid, .lp-gallery-grid, .lp-video-grid { grid-template-columns: minmax(0, 1fr); }
            .lp-checkout-body, .lp-shipping-card { padding: 16px 12px; }
            .lp-pkg-thumb { width: 52px; height: 52px; }
            .lp-pkg-title { font-size: 12.5px; }
            .lp-zone-chips { grid-template-columns: 1fr; }
            .lp-pay-options-grid { grid-template-columns: 1fr; }
          }
        </style>

        <!-- Top Urgency / Campaign Bar -->
        ${(badgeText || countdownHours > 0) ? `
          <div class="lp-top-bar">
            <div class="lp-wrap lp-top-bar-inner">
              <div class="lp-top-badge">
                <span>🔥</span>
                <span>${badgeText || 'স্পেশাল ক্যাম্পেইন অফার চলছে!'}</span>
                <span style="background:rgba(255,255,255,0.2);padding:2px 9px;border-radius:999px;font-size:11.5px;">🚚 ২,০০০+ টাকায় ফ্রি ডেলিভারি • 💳 অনলাইন পেমেন্টে ৫% ছাড়</span>
              </div>
              ${countdownHours > 0 ? `
                <div class="lp-countdown-wrap">
                  <span>⏰ অফার শেষ হতে বাকি:</span>
                  <div class="lp-timer-group">
                    <div class="lp-timer-box"><span id="lp-cd-h">${String(countdownHours).padStart(2, '0')}</span>ঘঃ</div>
                    <div class="lp-timer-box"><span id="lp-cd-m">45</span>মিঃ</div>
                    <div class="lp-timer-box"><span id="lp-cd-s">19</span>সেঃ</div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Sticky Header with Shop Logo, "মূল ওয়েবসাইটে যান" (/products) & "অর্ডার করুন" (#lp-products-section) -->
        <header class="lp-navbar">
          <div class="lp-wrap lp-navbar-inner">
            <div onclick="window.scrollTo({top:0,behavior:'smooth'})" class="lp-brand-link" title="পেজের শুরুতে যান">
              <img src="${shopLogo}" alt="${shopName}" class="lp-brand-logo" onerror="this.style.display='none'">
              <div style="min-width:0;">
                <div class="lp-brand-name">${shopName}</div>
                <div class="lp-brand-sub"><span style="color:#10b981;">●</span> ভেরিফাইড অফিসিয়াল ক্যাম্পেইন স্টোর</div>
              </div>
            </div>
            <div class="lp-nav-actions">
              <a href="tel:${cleanPhone}" class="lp-nav-phone">
                📞 ${contactPhone}
              </a>
              <a href="/products" class="lp-nav-store-btn">
                🛍️ মূল ওয়েবসাইটে যান
              </a>
              <button type="button" onclick="window.scrollToLpSection('lp-products-section', event)" class="lp-nav-order-btn">
                🛒 অর্ডার করুন
              </button>
            </div>
          </div>
        </header>

        <main class="lp-wrap">
          <!-- 1. 3D Hero Section (Multi-Product Campaign Header — NO standalone product-less price) -->
          ${(heroHeadline || heroSubheadline || heroDisplayImg) ? `
            <section class="lp-hero-card">
              <div class="lp-hero-grid ${heroDisplayImg ? '' : 'is-single'}">
                <div class="lp-hero-content">
                  <div class="lp-hero-pill">
                    <img src="${shopLogo}" alt="" style="width:20px;height:20px;border-radius:50%;object-fit:cover;border:1px solid #fff;" onerror="this.style.display='none'">
                    <span>✨ ${badgeText || shopName + ' এক্সক্লুসিভ ক্যাম্পেইন'}</span>
                  </div>
                  ${heroHeadline ? `
                    <h1 class="lp-hero-title">${heroHeadline}</h1>
                  ` : ''}
                  ${heroSubheadline ? `
                    <p class="lp-hero-subtitle">${heroSubheadline}</p>
                  ` : ''}

                  <div class="lp-promo-strip" style="${heroDisplayImg ? '' : 'justify-content:center;'}">
                    <span class="lp-promo-tag">🚚 ২,০০০ টাকার বেশি অর্ডারে ডেলিভারি চার্জ ফ্রি!</span>
                    <span class="lp-promo-tag is-online">💳 অনলাইন পেমেন্ট করলে সাথে সাথে ৫% ডিসকাউন্ট!</span>
                    ${resolvedProducts.length > 0 ? `
                      <span class="lp-promo-tag is-count">🛍️ ${resolvedProducts.length}টি ক্যাম্পেইন পণ্য</span>
                    ` : ''}
                  </div>

                  ${giftNote ? `
                    <div class="lp-gift-banner">
                      <span>🎁</span>
                      <span>${giftNote}</span>
                    </div>
                  ` : ''}
                  <div class="lp-hero-actions" style="${heroDisplayImg ? '' : 'justify-content:center;'}">
                    <button type="button" onclick="window.scrollToLpSection('lp-products-section', event)" class="lp-btn-primary">
                      🛒 ${ctaText}
                    </button>
                    <a href="/products" class="lp-btn-secondary">
                      🛍️ মূল ওয়েবসাইটে যান
                    </a>
                  </div>
                  <div class="lp-hero-micro-trust" style="${heroDisplayImg ? '' : 'justify-content:center;'}">
                    <span>✅ ১০০% অরিজিনাল গ্যারান্টি</span>
                    <span>•</span>
                    <span>🚚 ক্যাশ অন ডেলিভারি ও অনলাইন পেমেন্ট</span>
                    ${freeShipping ? `<span>•</span><span style="color:${palette.primary};">🎉 ২০০০ টাকা বা তার বেশি শপিং করলে সম্পূর্ণ ফ্রি ডেলিভারি</span>` : ''}
                  </div>
                </div>
                ${heroDisplayImg ? `
                  <div class="lp-hero-media">
                    <div class="lp-hero-img-box">
                      <img src="${heroDisplayImg}" alt="${heroHeadline || pageTitle}" fetchpriority="high" decoding="async" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'">
                    </div>
                  </div>
                ` : ''}
              </div>
            </section>
          ` : ''}

          <!-- 2. 3D Campaign Products Showcase Section ("🛍️ ক্যাম্পেইনের পণ্যসমূহ") -->
          ${resolvedProducts.length > 0 ? `
            <section id="lp-products-section" class="lp-surface-card">
              <div class="lp-section-header">
                <h2 class="lp-section-title">
                  <span>🛍️</span>
                  <span>ক্যাম্পেইনের পণ্যসমূহ (${resolvedProducts.length}টি)</span>
                </h2>
                <span class="lp-section-sub">👇 পছন্দের প্রোডাক্ট কার্ডে ক্লিক করলেই নিচের অর্ডার ফর্মে সিলেক্ট হয়ে যাবে</span>
              </div>
              <div class="${prodGridClass}">
                ${resolvedProducts.map((p, idx) => {
                  const pPrice = Number(p.offer_price || p.selling_price || p.price || 0);
                  const pReg = Number(p.regular_price || p.original_price || 0);
                  const pDisc = (pReg > pPrice && pPrice > 0) ? Math.round(((pReg - pPrice) / pReg) * 100) : 0;
                  const pImg = p.image_url || p.thumbnail || (Array.isArray(p.images) && p.images[0]) || p.image || heroDisplayImg || '';
                  const pTitle = p.name || p.p_name || 'পণ্য';
                  const pMeta = p.brand || p.category || '';
                  return `
                    <div onclick="window.selectLpProduct(${idx}, true)"
                      class="lp-showcase-card ${idx === 0 ? 'is-selected' : ''}">
                      <div class="lp-showcase-img-wrap">
                        ${pImg ? `
                          <img src="${pImg}" alt="${pTitle}" loading="lazy" decoding="async" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'">
                        ` : `
                          <div style="font-size:36px;">🛍️</div>
                        `}
                        ${pDisc > 0 ? `
                          <span class="lp-showcase-discount-pill">-${pDisc}% ছাড়</span>
                        ` : ''}
                        <span class="lp-showcase-selected-pill" style="display:${idx === 0 ? 'inline-flex' : 'none'};">✓ নির্বাচিত</span>
                        <span class="lp-showcase-stock-tag">● স্টকে আছে</span>
                      </div>
                      <div class="lp-showcase-body">
                        ${pMeta ? `<div class="lp-showcase-meta">${pMeta}</div>` : ''}
                        <h3 class="lp-showcase-title">${pTitle}</h3>
                        <div class="lp-showcase-price-row">
                          <span class="lp-showcase-offer">${formatCurrency(pPrice)}</span>
                          ${pReg > pPrice ? `
                            <span class="lp-showcase-reg">${formatCurrency(pReg)}</span>
                          ` : ''}
                        </div>
                        <button type="button" class="lp-showcase-select-btn">
                          ${idx === 0 ? '✓ নির্বাচিত পণ্য — নিচে অর্ডার ফর্ম পূরণ করুন ↓' : '🛒 অর্ডার করুন'}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </section>
          ` : ''}

          <!-- Features / Highlights Section -->
          ${featuresList.length > 0 ? `
            <section class="lp-surface-card">
              <div class="lp-section-header">
                <h2 class="lp-section-title">
                  <span>🌟</span>
                  <span>কেন এই পণ্যটি আপনার জন্য সেরা?</span>
                </h2>
              </div>
              <div class="lp-features-grid">
                ${featuresList.map(ft => `
                  <div class="lp-feature-item">
                    <span class="lp-feature-icon">✓</span>
                    <span class="lp-feature-text">${ft}</span>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          <!-- Description & Specifications Grid -->
          ${(finalDescription || specRows.length > 0) ? `
            <div class="lp-info-grid ${(finalDescription && specRows.length > 0) ? '' : 'is-single'}">
              ${finalDescription ? `
                <div class="lp-surface-card" style="margin-bottom:0;">
                  <div class="lp-section-header">
                    <h2 class="lp-section-title">📝 বিস্তারিত বিবরণ</h2>
                  </div>
                  <div style="font-size:14.5px;color:#334155;line-height:1.8;white-space:pre-line;word-break:break-word;">${finalDescription}</div>
                </div>
              ` : ''}
              ${specRows.length > 0 ? `
                <div class="lp-surface-card" style="margin-bottom:0;">
                  <div class="lp-section-header">
                    <h2 class="lp-section-title">📋 পণ্যের স্পেসিফিকেশন</h2>
                  </div>
                  <div class="lp-spec-table">
                    ${specRows.map(r => {
                      const hasLbl = Boolean(r.label || r.key);
                      return hasLbl ? `
                        <div class="lp-spec-row">
                          <span class="lp-spec-label">${r.label || r.key}</span>
                          <span class="lp-spec-val">${r.value || ''}</span>
                        </div>
                      ` : `
                        <div class="lp-spec-row is-full">
                          <span class="lp-spec-val">✦ ${r.value || ''}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Additional Promotional Banners -->
          ${banners.length > 0 ? `
            <section class="lp-surface-card">
              <div class="lp-section-header">
                <h2 class="lp-section-title">📸 পণ্যের গ্যালারি ও অফার ব্যানার</h2>
              </div>
              <div class="lp-gallery-grid">
                ${banners.map(b => `
                  <div class="lp-gallery-card">
                    <img src="${b.image_url}" alt="${b.caption || pageTitle}" loading="lazy" decoding="async">
                    ${b.caption ? `<div style="padding:12px;text-align:center;font-weight:800;font-size:13px;color:#1e293b;">${b.caption}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}

          <!-- Campaign Videos -->
          ${videos.length > 0 ? `
            <section class="lp-surface-card">
              <div class="lp-section-header">
                <h2 class="lp-section-title">🎬 পণ্যের ভিডিও রিভিউ</h2>
              </div>
              <div class="lp-video-grid ${videos.length === 1 ? 'is-single' : ''}">
                ${videos.map(v => {
                  const rawUrl = String(v.video_url || '').trim();
                  let embedHtml = '';
                  if (rawUrl.includes('youtube.com/watch?v=')) {
                    const vid = rawUrl.split('v=')[1]?.split('&')[0];
                    embedHtml = `<iframe style="width:100%;aspect-ratio:16/9;border:none;border-radius:14px;" src="https://www.youtube.com/embed/${vid}" loading="lazy" allowfullscreen></iframe>`;
                  } else if (rawUrl.includes('youtu.be/')) {
                    const vid = rawUrl.split('youtu.be/')[1]?.split('?')[0];
                    embedHtml = `<iframe style="width:100%;aspect-ratio:16/9;border:none;border-radius:14px;" src="https://www.youtube.com/embed/${vid}" loading="lazy" allowfullscreen></iframe>`;
                  } else if (rawUrl.includes('youtube.com/embed/')) {
                    embedHtml = `<iframe style="width:100%;aspect-ratio:16/9;border:none;border-radius:14px;" src="${rawUrl}" loading="lazy" allowfullscreen></iframe>`;
                  } else {
                    embedHtml = `<video controls style="width:100%;aspect-ratio:16/9;border-radius:14px;background:#000;" src="${rawUrl}"></video>`;
                  }
                  return `
                    <div style="background:#0f172a;padding:10px;border-radius:18px;">
                      ${embedHtml}
                      ${v.title ? `<div style="font-size:13px;font-weight:700;color:#ffffff;text-align:center;padding-top:8px;">${v.title}</div>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </section>
          ` : ''}

          <!-- Trust Badges -->
          <div class="lp-trust-grid">
            <div class="lp-trust-card">
              <div class="lp-trust-icon">🚚</div>
              <div>
                <div style="font-size:14px;font-weight:900;color:#0f172a;">২,০০০+ টাকায় ফ্রি ডেলিভারি</div>
                <div style="font-size:12px;color:#64748b;font-weight:600;">২,০০০ টাকার বেশি অর্ডার করলেই ডেলিভারি চার্জ ৳০</div>
              </div>
            </div>
            <div class="lp-trust-card">
              <div class="lp-trust-icon">💳</div>
              <div>
                <div style="font-size:14px;font-weight:900;color:#0f172a;">অনলাইন পেমেন্টে ৫% ছাড়</div>
                <div style="font-size:12px;color:#64748b;font-weight:600;">বিকাশ, নগদ, রকেট বা ব্যাংক পেমেন্টে তাৎক্ষণিক ৫% ছাড়</div>
              </div>
            </div>
            <div class="lp-trust-card">
              <div class="lp-trust-icon">🛡️</div>
              <div>
                <div style="font-size:14px;font-weight:900;color:#0f172a;">১০০% অরিজিনাল পণ্য</div>
                <div style="font-size:12px;color:#64748b;font-weight:600;">পণ্য হাতে পেয়ে দেখে পরিশোধের সুবিধা</div>
              </div>
            </div>
          </div>

          <!-- =========================================================
               CHECKOUT SECTION (SYNCED ADMIN DELIVERY & PAYMENT + FREE DELIVERY >= 2000 & 5% ONLINE DISCOUNT)
               ========================================================= -->
          <section id="lp-checkout-section" class="lp-checkout-shell">
            <div class="lp-checkout-banner">
              <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.16);padding:4px 14px;border-radius:999px;font-size:12px;font-weight:800;margin-bottom:8px;">
                <img src="${shopLogo}" alt="" style="width:18px;height:18px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'">
                <span>${shopName} — এক্সপ্রেস অর্ডার ফর্ম</span>
              </div>
              <h2>অর্ডার কনফার্ম করতে নিচের ফর্মটি পূরণ করুন</h2>
              <p>🚚 ২,০০০ টাকার বেশি অর্ডার করলে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি (৳০) এবং 💳 অনলাইন পেমেন্ট করলে সাথে সাথে ৫% ডিসকাউন্ট!</p>
            </div>

            <form onsubmit="window.submitLpDirectOrder(event)" class="lp-checkout-body">
              <!-- Live Animated Free Delivery Progress Bar -->
              <div id="lp-free-delivery-progress-box" class="lp-free-delivery-box"></div>

              <div class="lp-checkout-grid">
                <!-- Left Column: Product Selection, Variants, Quantity & Live Order Summary -->
                <div class="lp-checkout-col">
                  ${resolvedProducts.length > 0 ? `
                    <div>
                      <div class="lp-step-heading">
                        <span>১. আপনার পছন্দের পণ্যটি সিলেক্ট করুন:</span>
                        <span class="lp-step-count-badge">${resolvedProducts.length}টি পণ্য</span>
                      </div>
                      <div class="lp-pkg-list-scroll">
                        ${resolvedProducts.map((p, idx) => {
                          const pPrice = Number(p.offer_price || p.selling_price || p.price || 0);
                          const pReg = Number(p.regular_price || p.original_price || 0);
                          const pDisc = (pReg > pPrice && pPrice > 0) ? Math.round(((pReg - pPrice) / pReg) * 100) : 0;
                          const pImg = p.image_url || p.thumbnail || (Array.isArray(p.images) && p.images[0]) || p.image || heroDisplayImg || '';
                          const pTitle = p.name || p.p_name || 'পণ্য';
                          return `
                            <div onclick="window.selectLpProduct(${idx}, false)"
                              class="lp-pkg-card ${idx === 0 ? 'is-selected' : ''}">
                              <div class="lp-pkg-radio">
                                <div class="lp-pkg-radio-dot" style="transform:scale(${idx === 0 ? '1' : '0'});"></div>
                              </div>
                              ${pImg ? `<img src="${pImg}" class="lp-pkg-thumb" alt="${pTitle}" loading="lazy" decoding="async" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'">` : ''}
                              <div class="lp-pkg-info">
                                <div class="lp-pkg-title">${pTitle}</div>
                                <div class="lp-pkg-price-wrap">
                                  <div class="lp-pkg-price-left">
                                    <span class="lp-pkg-offer">${formatCurrency(pPrice)}</span>
                                    ${pReg > pPrice ? `<span class="lp-pkg-reg">${formatCurrency(pReg)}</span>` : ''}
                                    ${pDisc > 0 ? `<span class="lp-pkg-disc-badge">${pDisc}% ছাড়</span>` : ''}
                                  </div>
                                  <span class="lp-pkg-active-pill" style="display:${idx === 0 ? 'inline-flex' : 'none'};">✓ নির্বাচিত</span>
                                </div>
                              </div>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  ` : ''}

                  <!-- Color Selector -->
                  <div id="lp-color-selector-wrap" class="lp-variant-box" style="display:${defaultColors.length > 0 ? 'block' : 'none'};">
                    <label class="lp-variant-label">🎨 কালার সিলেক্ট করুন:</label>
                    <div id="lp-color-pills" class="lp-pill-list">
                      ${defaultColors.map((c, ci) => `
                        <button type="button" onclick="window.selectLpColor('${String(c).replace(/'/g, "\\'")}', this)"
                          class="lp-color-btn ${ci === 0 ? 'is-active' : ''}">
                          ${c}
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Size Selector -->
                  <div id="lp-size-selector-wrap" class="lp-variant-box" style="display:${defaultSizes.length > 0 ? 'block' : 'none'};">
                    <label class="lp-variant-label">📏 সাইজ সিলেক্ট করুন:</label>
                    <div id="lp-size-pills" class="lp-pill-list">
                      ${defaultSizes.map((s, si) => `
                        <button type="button" onclick="window.selectLpSize('${String(s).replace(/'/g, "\\'")}', this)"
                          class="lp-size-btn ${si === 0 ? 'is-active' : ''}">
                          ${s}
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Quantity Stepper -->
                  <div class="lp-qty-bar">
                    <div>
                      <div style="font-size:13.5px;font-weight:800;color:#1e293b;">📦 পণ্যের পরিমাণ (Quantity):</div>
                      <div style="font-size:11px;color:#059669;font-weight:700;">২,০০০+ টাকার অর্ডারে ডেলিভারি চার্জ ফ্রি!</div>
                    </div>
                    <div class="lp-qty-controls">
                      <button type="button" onclick="window.changeLpQty(-1)" class="lp-qty-btn">−</button>
                      <span id="lp-qty-display" class="lp-qty-num">1</span>
                      <button type="button" onclick="window.changeLpQty(1)" class="lp-qty-btn">+</button>
                    </div>
                  </div>

                  <!-- Live Order Summary Box -->
                  <div class="lp-summary-box">
                    <div class="lp-summary-head">
                      <span>অর্ডার সামারি ও বিল হিসাব (Live Calculation)</span>
                      <span style="color:#34d399;">● লাইভ আপডেট</span>
                    </div>
                    <div class="lp-summary-prod-row">
                      <img id="lp-summary-thumb" src="${firstImg}" alt="" class="lp-summary-thumb" style="display:${firstImg ? 'block' : 'none'};">
                      <span id="lp-summary-title" class="lp-summary-prod-title">${firstTitle}</span>
                      <span id="lp-summary-qty" class="lp-summary-qty-badge">× 1 টি</span>
                    </div>
                    <div id="lp-summary-meta" style="font-size:12px;color:#34d399;font-weight:700;margin-bottom:8px;display:none;"></div>
                    <div class="lp-summary-line">
                      <span>পণ্যের মোট মূল্য (Subtotal):</span>
                      <span id="lp-summary-subtotal" style="font-weight:800;color:#ffffff;">${formatCurrency(firstPrice)}</span>
                    </div>
                    <div id="lp-summary-discount-row" class="lp-summary-line" style="display:none;color:#fda4af;font-weight:800;">
                      <span>🎁 অনলাইন পেমেন্ট ডিসকাউন্ট (৫% ছাড়):</span>
                      <span id="lp-summary-discount-val" style="color:#fb7185;font-weight:900;">- ৳০</span>
                    </div>
                    <div class="lp-summary-line">
                      <span id="lp-summary-zone-label">ডেলিভারি চার্জ (${firstZone.name}):</span>
                      <span id="lp-summary-shipping" style="font-weight:800;">${initFree ? 'ফ্রি ডেলিভারি (৳০)' : formatCurrency(initShipping)}</span>
                    </div>
                    <div id="lp-summary-savings-row" class="lp-summary-line" style="display:none;color:#6ee7b7;font-weight:800;">
                      <span>🎉 আপনার মোট সাশ্রয়:</span>
                      <span id="lp-summary-savings-val" style="color:#34d399;font-weight:900;">৳০</span>
                    </div>
                    <div class="lp-summary-total-line">
                      <span>সর্বমোট প্রদেয় বিল:</span>
                      <span id="lp-summary-total" style="font-size:21px;color:#34d399;">${formatCurrency(firstPrice + initShipping)}</span>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Customer Delivery Details, Admin-Synced Delivery Areas & Admin-Synced Payment Options -->
                <div class="lp-checkout-col">
                  <div class="lp-shipping-card">
                    <div class="lp-step-heading" style="margin-bottom:16px;">
                      <span>২. ডেলিভারি ঠিকানা ও পেমেন্ট অপশন:</span>
                    </div>

                    <div class="lp-field-group">
                      <label class="lp-field-label">👤 আপনার সম্পূর্ণ নাম <span style="color:#e11d48;">*</span></label>
                      <input type="text" id="landing-name" name="customer_name" required placeholder="আপনার নাম লিখুন" class="lp-input">
                    </div>

                    <div class="lp-field-group">
                      <label class="lp-field-label">📞 মোবাইল নাম্বার (১১ ডিজিট) <span style="color:#e11d48;">*</span></label>
                      <input type="tel" id="landing-phone" name="customer_phone" required placeholder="017XXXXXXXX" class="lp-input">
                    </div>

                    <!-- Admin-Configured & Selected Delivery Areas -->
                    <div class="lp-field-group">
                      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
                        <label class="lp-field-label" style="margin-bottom:0;">📍 ডেলিভারি এরিয়া সিলেক্ট করুন <span style="color:#e11d48;">*</span></label>
                        <span style="font-size:10.5px;font-weight:900;color:#065f46;background:#d1fae5;padding:2px 9px;border-radius:999px;">
                          🚚 ২,০০০+ টাকার অর্ডারে ডেলিভারি ফ্রি!
                        </span>
                      </div>
                      <div class="lp-zone-chips">
                        ${deliveryConfs.map((dm, dIdx) => {
                          const dmFee = Number(dm.charge || 0);
                          const dmFree = initFree || dmFee === 0;
                          return `
                            <button
                              type="button"
                              data-zone="${dm.id}"
                              onclick="window.selectLpAreaZone('${String(dm.id).replace(/'/g, "\\'")}')"
                              class="lp-zone-chip ${dIdx === 0 ? 'is-active' : ''}">
                              <span style="line-height:1.25;">${dm.name}</span>
                              <span class="lp-zone-fee-text" style="font-size:11px;">
                                ${dmFree ? (dmFee > 0 ? `<del style="opacity:0.65;margin-right:3px;">৳${dmFee}</del> <strong style="color:#059669;">ফ্রি (৳০)</strong>` : '<strong style="color:#059669;">ফ্রি (৳০)</strong>') : '৳' + dmFee}
                              </span>
                            </button>
                          `;
                        }).join('')}
                      </div>
                      <select id="lp-delivery-area" name="delivery_area" onchange="window.selectLpAreaZone(this.value)" class="lp-input">
                        ${deliveryConfs.map((dm, dIdx) => {
                          const dmFee = Number(dm.charge || 0);
                          return `
                            <option value="${dm.id}" ${dIdx === 0 ? 'selected' : ''}>
                              ${dm.name} — ${initFree ? 'ফ্রি ডেলিভারি (৳০)' : (dmFee === 0 ? 'ফ্রি (৳০)' : '৳' + dmFee)} (${dm.eta})
                            </option>
                          `;
                        }).join('')}
                      </select>
                    </div>

                    <div class="lp-field-group">
                      <label class="lp-field-label">🏠 সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা নং, রোড, থানা, জেলা) <span style="color:#e11d48;">*</span></label>
                      <textarea id="landing-address" name="customer_address" rows="2" required placeholder="আপনার সম্পূর্ণ ঠিকানা বিস্তারিত লিখুন..." class="lp-input" style="resize:vertical;"></textarea>
                    </div>

                    <!-- Admin-Configured & Selected Payment Methods (COD + Online Payment 5% OFF) -->
                    <div class="lp-field-group">
                      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                        <label class="lp-field-label" style="margin-bottom:0;">💳 পেমেন্ট অপশন সিলেক্ট করুন <span style="color:#e11d48;">*</span></label>
                        <span style="font-size:11px;font-weight:900;color:#be123c;background:#ffe4e6;padding:2px 9px;border-radius:999px;">
                          🔥 অনলাইন পেমেন্টে ৫% ইনস্ট্যান্ট ছাড়!
                        </span>
                      </div>
                      <input type="hidden" id="lp-payment-method-input" name="payment_method_id" value="${paymentMethods[0]?.id || 'COD'}">
                      <div class="lp-pay-options-grid">
                        ${paymentMethods.map((pm, pIdx) => {
                          const isOnline = !pm.isCod;
                          const discPct = Number(pm.discount_pct || 5) || 5;
                          return `
                            <div
                              data-pay-id="${pm.id}"
                              onclick="window.selectLpPaymentMethod('${String(pm.id).replace(/'/g, "\\'")}')"
                              class="lp-pay-option-card ${pIdx === 0 ? 'is-active' : ''}">
                              ${isOnline ? `<span class="lp-pay-5pct-tag">${discPct}% ছাড়${initOnlineSavings > 0 ? ` (-৳${initOnlineSavings})` : ''}</span>` : ''}
                              <div class="lp-pay-radio">
                                <div class="lp-pay-radio-dot" style="transform:scale(${pIdx === 0 ? '1' : '0'});"></div>
                              </div>
                              <span style="font-size:18px;flex-shrink:0;">${pm.icon}</span>
                              <div style="min-width:0;">
                                <div style="font-size:12.5px;font-weight:900;color:#0f172a;line-height:1.25;">${pm.name}</div>
                                <div style="font-size:10.5px;color:#64748b;font-weight:700;">
                                  ${isOnline ? `সাথে সাথে ${discPct}% ছাড় পাবেন` : 'পণ্য হাতে পেয়ে পেমেন্ট'}
                                </div>
                              </div>
                            </div>
                          `;
                        }).join('')}
                      </div>

                      <!-- Dynamic Payment Instructions / TrxID Panel -->
                      <div id="lp-payment-details-panel"></div>
                    </div>

                    <div class="lp-field-group">
                      <label class="lp-field-label">📝 অর্ডার নোট (ঐচ্ছিক)</label>
                      <input type="text" name="order_note" placeholder="স্পেশাল কোনো নির্দেশনা থাকলে লিখুন..." class="lp-input">
                    </div>

                    <button id="lp-submit-btn" type="submit" class="lp-submit-btn">
                      ✅ ${ctaText} (<span id="lp-submit-btn-price">${formatCurrency(firstPrice + initShipping)}</span>)
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </section>

          <!-- Bottom Support & Main Website Navigation Footer with Shop Logo -->
          <div style="margin-top:32px;text-align:center;">
            <div style="display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px;padding:18px 24px;border-radius:22px;background:#ffffff;border:1.5px solid #e2e8f0;border-bottom:5px solid #cbd5e1;box-shadow:0 10px 24px -6px rgba(15,23,42,0.06);">
              <img src="${shopLogo}" alt="${shopName}" style="width:48px;height:48px;border-radius:14px;object-fit:cover;border:2px solid ${palette.border};" onerror="this.style.display='none'">
              <div style="text-align:left;">
                <div style="font-size:12px;color:#64748b;font-weight:700;">${shopName} — যেকোনো প্রয়োজনে সরাসরি কল করুন:</div>
                <div style="font-size:18px;font-weight:900;color:#0f172a;">${contactPhone}</div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:10px;">
                <a href="tel:${cleanPhone}" style="padding:10px 18px;border-radius:12px;background:#0f172a;color:#ffffff;font-weight:800;font-size:13px;text-decoration:none;border-bottom:3px solid #000;">
                  📞 কল করুন
                </a>
                <a href="/products" style="padding:10px 18px;border-radius:12px;background:${palette.light};color:${palette.primary};border:1.5px solid ${palette.border};border-bottom:3px solid ${palette.primary};font-weight:800;font-size:13px;text-decoration:none;">
                  🛍️ মূল ওয়েবসাইটে যান
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  } catch (error) {
    console.error('LandingPage render error:', error);
    return `
      <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:'Hind Siliguri',system-ui,sans-serif;">
        <p style="color:#e11d48;font-weight:800;margin-bottom:14px;">ল্যান্ডিং পেজ লোড করতে সমস্যা হয়েছে।</p>
        <a href="/products" style="padding:12px 22px;border-radius:12px;background:#059669;color:#ffffff;font-weight:800;font-size:14px;text-decoration:none;">
          🛍️ মূল ওয়েবসাইটে যান
        </a>
      </div>
    `;
  }
}

export const LandingPage = renderLandingPage;
export default renderLandingPage;
