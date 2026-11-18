import { formatCurrency } from '../utils/format.js';
import { getProtectedGatewayConfig, signApiRequestPayload, checkApiMutationRateLimit } from '../utils/security.js';
export { formatCurrency };
/**
 * DREAM CART BD — UNIFIED API CLIENT & LIVE SHEET SYNC ENGINE
 * Connects directly to Google Sheets via GViz API (JSONP) & Google Apps Script Web App Gateway
 * Endpoint: https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec
 * Spreadsheet ID: 1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8
 */

const _gwCfg = getProtectedGatewayConfig();
export const APPS_SCRIPT_URL = _gwCfg.endpoint;
export const SPREADSHEET_ID = _gwCfg.spreadsheetId;

export const DEFAULT_PRODUCT_THUMB = "/icon/logo.png";

const DEMO_SKUS = new Set(["dcbd-wt-01", "dcbd-gs-02", "dcbd-hn-03", "dcbd-fl-04", "dcbd-ch-05"]);

export const INITIAL_PRODUCTS = [
  {
    sku: "DCBD-WT-01",
    product_id: "DCBD-WT-01",
    name: "Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & Dual GPS",
    p_name: "Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & Dual GPS",
    category: "Smartwatches",
    sub_category: "AMOLED Watch",
    child_category: "Fitness & GPS",
    brand: "Amazfit",
    buying_price: 6800,
    selling_price: 8490,
    original_price: 11462,
    wholesale_price: 7200,
    reseller_price: 7640,
    min_order_qty: 5,
    min_order_q: 5,
    stock: 28,
    images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
    slug: "amazfit-gts-4-smartwatch",
    description: "The Amazfit GTS 4 features a 1.75\" AMOLED display, dual-band GPS, 150+ sports modes, Bluetooth calling.",
    specification: "Display: 1.75\" AMOLED | Battery: 300 mAh | Water Resistance: 5 ATM.",
    others: "1 Year Official Warranty, Fast Dispatch from Cumilla Hub.",
    color: "Jet Black, Space Silver, Rose Gold",
    size: "Standard, 42mm, 44mm",
    weight_kg: 0.25,
    width_cm: 10,
    length_cm: 12,
    height_cm: 6,
    status: "সক্রিয়",
    is_active: true
  },
  {
    sku: "DCBD-GS-02",
    product_id: "DCBD-GS-02",
    name: "অটো গ্যাস সেফটি ডিভাইস ও লিকেজ প্রোটেক্টর (Heavy Duty)",
    p_name: "অটো গ্যাস সেফটি ডিভাইস ও লিকেজ প্রোটেক্টর (Heavy Duty)",
    category: "Kitchen",
    sub_category: "Safety Device",
    child_category: "Appliances",
    brand: "HK",
    buying_price: 1500,
    selling_price: 2450,
    original_price: 3504,
    wholesale_price: 1850,
    reseller_price: 2150,
    min_order_qty: 5,
    min_order_q: 5,
    stock: 35,
    images: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
    slug: "auto-gas-safety-device-heavy-duty",
    description: "সিলিন্ডার ও লাইনের গ্যাস লিকেজ স্বয়ংক্রিয়ভাবে বন্ধ করে রান্নাঘরকে রাখে ১০০% নিরাপদ।",
    specification: "Material: Brass & Alloy | Gauge: Live Pressure Meter | Warranty: 2 Years",
    others: "সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা।",
    color: "Red/Black, Silver, Gold",
    size: "22mm Standard, 20mm",
    weight_kg: 0.45,
    width_cm: 10,
    length_cm: 12,
    height_cm: 8,
    status: "সক্রিয়",
    is_active: true
  },
  {
    sku: "DCBD-HN-03",
    product_id: "DCBD-HN-03",
    name: "সুন্দরবনের প্রাকৃতিক খাঁটি চাকের মধু (১ কেজি জার)",
    p_name: "সুন্দরবনের প্রাকৃতিক খাঁটি চাকের মধু (১ কেজি জার)",
    category: "Organic & Health",
    sub_category: "Honey",
    child_category: "Pure Natural",
    brand: "Dream Organic",
    buying_price: 800,
    selling_price: 1250,
    original_price: 1813,
    wholesale_price: 950,
    reseller_price: 1100,
    min_order_qty: 5,
    min_order_q: 5,
    stock: 42,
    images: ["https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&auto=format&fit=crop&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&auto=format&fit=crop&q=80",
    slug: "sundarban-natural-raw-honey-1kg",
    description: "সরাসরি বাওয়ালিদের মাধ্যমে সংগৃহীত ১০০% ভেজালমুক্ত সুন্দরবনের খলিশা ফুলের প্রাকৃতিক চাকের মধু।",
    specification: "ওজন: ১ কেজি | গ্রেড: অর্গানিক র-হানি",
    others: "ল্যাব টেস্টেড বিশুদ্ধতা গ্যারান্টি।",
    color: "Pure Amber, Golden",
    size: "১ কেজি, ৫০০ গ্রাম",
    weight_kg: 1.0,
    width_cm: 12,
    length_cm: 12,
    height_cm: 18,
    status: "সক্রিয়",
    is_active: true
  },
  {
    sku: "DCBD-FL-04",
    product_id: "DCBD-FL-04",
    name: "মিলিটারি রিচার্জেবল জুম ফ্ল্যাশলাইট ৩০০০ লুমেন",
    p_name: "মিলিটারি রিচার্জেবল জুম ফ্ল্যাশলাইট ৩০০০ লুমেন",
    category: "Home Appliances",
    sub_category: "Lighting",
    child_category: "Rechargeable",
    brand: "HK",
    buying_price: 900,
    selling_price: 1450,
    original_price: 2103,
    wholesale_price: 1100,
    reseller_price: 1280,
    min_order_qty: 5,
    min_order_q: 5,
    stock: 25,
    images: ["https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80",
    slug: "military-rechargeable-flashlight-3000lm",
    description: "অ্যালুমিনিয়াম অ্যালয় বডি, লং-রেঞ্জ জুম বিম এবং টাইপ-সি ফাস্ট চার্জিং সুবিধাযুক্ত ট্যাকটিক্যাল টর্চ।",
    specification: "Brightness: 3000 Lumens | Battery: 5000mAh Lithium",
    others: "ওয়াটারপ্রুফ ও শকপ্রুফ ডিজাইন।",
    color: "Matte Black, Army Green",
    size: "Standard, Large",
    weight_kg: 0.35,
    width_cm: 8,
    length_cm: 18,
    height_cm: 6,
    status: "সক্রিয়",
    is_active: true
  },
  {
    sku: "DCBD-CH-05",
    product_id: "DCBD-CH-05",
    name: "প্রিমিয়াম অর্গানিক চিয়া সিড (৫০০ গ্রাম এয়ারটাইট জার)",
    p_name: "প্রিমিয়াম অর্গানিক চিয়া সিড (৫০০ গ্রাম এয়ারটাইট জার)",
    category: "Organic & Health",
    sub_category: "Seeds",
    child_category: "Pure Natural",
    brand: "Dream Organic",
    buying_price: 400,
    selling_price: 650,
    original_price: 956,
    wholesale_price: 480,
    reseller_price: 560,
    min_order_qty: 5,
    min_order_q: 5,
    stock: 45,
    images: ["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"],
    thumbnail: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
    slug: "premium-organic-chia-seed-500g",
    description: "ওমেগা-৩, ফাইবার ও অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ বাছাইকৃত প্রিমিয়াম চিয়া সিড।",
    specification: "ওজন: ৫০০ গ্রাম | প্যাকেজিং: ফুড গ্রেড জার",
    others: "ডায়েট ও ওজন নিয়ন্ত্রণে অত্যন্ত কার্যকর।",
    color: "Natural Black/White",
    size: "৫০০ গ্রাম, ১ কেজি",
    weight_kg: 0.5,
    width_cm: 10,
    length_cm: 10,
    height_cm: 14,
    status: "সক্রিয়",
    is_active: true
  }
];

export const INITIAL_CATEGORIES = [
  { catagory_id: "CAT-001", catagory_slug: "smartwatches", category_image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80", category: "Smartwatches", sub_category: "Calling Watch, AMOLED Watch", chail_category: "Men, Women, Fitness & GPS" },
  { catagory_id: "CAT-002", catagory_slug: "kitchen", category_image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80", category: "Kitchen", sub_category: "Safety Device, Blender, Cookware", chail_category: "Appliances, Standard" },
  { catagory_id: "CAT-003", catagory_slug: "organic-health", category_image: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400&q=80", category: "Organic & Health", sub_category: "Honey, Seeds, Oils", chail_category: "Pure Natural, Premium Grade" },
  { catagory_id: "CAT-004", catagory_slug: "home-appliances", category_image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80", category: "Home Appliances", sub_category: "Lighting, Gadgets", chail_category: "Rechargeable, Smart Home" }
];

export const INITIAL_BRANDS = [
  { brand_id: "BRD-001", brand_name: "Amazfit", brand_slug: "amazfit", brand_image: "/icon/logo.png", brand_description: "Global smart wearable innovator" },
  { brand_id: "BRD-002", brand_name: "Dream Organic", brand_slug: "dream-organic", brand_image: "/icon/logo.png", brand_description: "১০০% বিশুদ্ধ অর্গানিক ও প্রাকৃতিক পণ্য" },
  { brand_id: "BRD-003", brand_name: "HK", brand_slug: "hk", brand_image: "/icon/logo.png", brand_description: "প্রিমিয়াম স্মার্ট গ্যাজেট ও অ্যাপ্লায়েন্স পার্টনার" },
  { brand_id: "BRD-004", brand_name: "Kieslect", brand_slug: "kieslect", brand_image: "/icon/logo.png", brand_description: "Premium calling smartwatch maker" }
];

/**
 * Safely parse image URLs or data:image/...;base64,... strings without splitting at the comma inside data:image!
 */
export function parseImageUrlsList(rawInput) {
  if (!rawInput) return [];
  if (Array.isArray(rawInput)) {
    return rawInput.map(u => normalizeSingleImageUrl(u)).filter(Boolean);
  }
  const str = String(rawInput).trim();
  if (!str) return [];

  const protectedStr = str.replace(/(data:image\/[a-zA-Z0-9.+_-]+;base64),/gi, '$1__DCBD_B64_COMMA__');
  const parts = protectedStr
    .split(/\s*\|\s*|\r?\n|,(?=\s*(?:https?:\/\/|data:image\/|\/))/i)
    .flatMap(chunk => {
      if (!chunk.trim().startsWith('data:image/') && chunk.includes(',')) {
        const sub = chunk.split(',').map(s => s.trim()).filter(Boolean);
        if (sub.length > 1 && sub.every(s => /^(https?:\/\/|\/|data:)/i.test(s))) {
          return sub;
        }
      }
      return [chunk];
    });

  return parts
    .map(p => p.replace(/__DCBD_B64_COMMA__/g, ',').trim())
    .map(u => normalizeSingleImageUrl(u))
    .filter(Boolean);
}

export function normalizeSingleImageUrl(rawUrl) {
  if (!rawUrl) return '';
  let u = String(rawUrl).trim().replace(/^["']+|["']+$/g, '');
  if (!u || u === 'null' || u === 'undefined') return '';
  if (u.startsWith('data:image/') || u.startsWith('blob:')) return u;
  if (u.startsWith('//')) u = 'https:' + u;
  if (u === '/icon/logo.png' || u === 'public/icon/logo.png' || u === './public/icon/logo.png' || u === '/icon/logo.png' || u === 'icon/logo.png' || u === 'logo.png') {
    return (typeof window !== 'undefined' && window.getDcbdLogoUrl) ? window.getDcbdLogoUrl() : '/icon/logo.png';
  }
  const driveMatch =
    u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=|thumbnail\?id=)([a-zA-Z0-9_-]{15,})/) ||
    u.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,})/);
  if (driveMatch && driveMatch[1]) {
    return 'https://drive.google.com/thumbnail?id=' + driveMatch[1] + '&sz=w800';
  }
  return u;
}

export function resolveOfficialLogoUrl(rawLogo) {
  const fallback = (typeof window !== 'undefined' && window.getDcbdLogoUrl) ? window.getDcbdLogoUrl() : '/icon/logo.png';
  if (!rawLogo || typeof rawLogo !== 'string') return fallback;
  const cleaned = normalizeSingleImageUrl(rawLogo);
  if (!cleaned || cleaned.includes('encrypted-tbn') || cleaned.includes('jijistatic')) return fallback;
  if (!cleaned.startsWith('http') && !cleaned.startsWith('/') && !cleaned.startsWith('data:image/') && !cleaned.startsWith('blob:')) {
    return fallback;
  }
  return (typeof window !== 'undefined' && window.getDcbdLogoUrl) ? window.getDcbdLogoUrl(cleaned) : cleaned;
}

export function safeNumber(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const cleaned = String(val)
    .replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d))
    .replace(/[^0-9.\-]/g, '');
  const n = Number(cleaned);
  return isNaN(n) ? fallback : n;
}

export function safeStr(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  return String(val).trim();
}

/**
 * Convert GViz column letter ID ('A'..'Z', 'AA'..'AZ') to 0-based sheet column index.
 */
function gvizColIdToIndex(colId, fallbackIdx = 0) {
  if (!colId || typeof colId !== 'string') return fallbackIdx;
  const clean = colId.trim().toUpperCase();
  if (!/^[A-Z]+$/.test(clean)) return fallbackIdx;
  let idx = 0;
  for (let i = 0; i < clean.length; i++) {
    idx = idx * 26 + (clean.charCodeAt(i) - 64);
  }
  return idx - 1;
}

// In-flight deduplication map for GViz requests
const _inflightGviz = new Map();

export function fetchSheetViaGviz(sheetName, timeoutMs = 15000, customTq = '') {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve([]);
  }

  const cacheKey = `${String(sheetName).trim().toLowerCase()}::${String(customTq || '').trim().toLowerCase()}`;
  if (_inflightGviz.has(cacheKey)) {
    return _inflightGviz.get(cacheKey);
  }

  const p = new Promise((resolve) => {
    const cbName = 'gviz_cb_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    const script = document.createElement('script');
    let url = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=responseHandler:' + cbName + '&sheet=' + encodeURIComponent(sheetName) + '&headers=1';
    if (customTq) {
      url += '&tq=' + encodeURIComponent(customTq);
    }

    let settled = false;
    function finish(result) {
      if (settled) return;
      settled = true;
      _inflightGviz.delete(cacheKey);
      cleanup();
      resolve(result);
    }

    let timer = setTimeout(() => {
      finish([]);
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      window[cbName] = function() {
        try { delete window[cbName]; } catch (e) {}
      };
      setTimeout(() => {
        try { delete window[cbName]; } catch (e) {}
      }, 10000);
    }

    window[cbName] = function(resp) {
      if (!resp || !resp.table || !resp.table.rows) {
        const emptyOk = [];
        emptyOk.__gvizOk = Boolean(resp && resp.table);
        return finish(emptyOk);
      }

      const rawCols = resp.table.cols || [];
      let cols = rawCols.map(c => (c && c.label ? String(c.label).trim() : ''));
      const colSheetIndices = rawCols.map((c, idx) => gvizColIdToIndex(c && c.id, idx));
      const rawRows = resp.table.rows || [];

      let startRowIdx = 0;
      const nonEmptyLabels = cols.filter(Boolean).length;
      if (nonEmptyLabels === 0 && rawRows.length > 0 && rawRows[0] && Array.isArray(rawRows[0].c)) {
        const firstRowVals = rawRows[0].c.map(cell => (cell && cell.v !== undefined && cell.v !== null ? String(cell.v).trim() : ''));
        const headerKeywords = ['sku', 'p_name', 'category', 'catagory_id', 'brand_id', 'orderid', 'user_id', 'customer_id', 'shop_id', 'date', 'name', 'slug', 'banner_id', 'request_id', 'review_id'];
        if (firstRowVals.some(v => headerKeywords.includes(v.toLowerCase()))) {
          cols = firstRowVals;
          startRowIdx = 1;
        }
      }

      const rows = [];
      for (let rIdx = startRowIdx; rIdx < rawRows.length; rIdx++) {
        const r = rawRows[rIdx];
        if (!r || !r.c) continue;
        const rowObj = {};
        let hasPrimaryData = false;

        r.c.forEach((cell, idx) => {
          const sheetColIdx = colSheetIndices[idx] !== undefined ? colSheetIndices[idx] : idx;
          const colName = cols[idx] || `col_${sheetColIdx}`;
          const key = colName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

          let val = '';
          if (cell) {
            if (typeof cell.v === 'number') {
              val = cell.v;
            } else if (typeof cell.v === 'boolean') {
              val = cell.v;
            } else if (cell.f !== undefined && cell.f !== null && String(cell.f).trim() !== '') {
              val = String(cell.f).trim();
            } else if (cell.v !== undefined && cell.v !== null) {
              val = String(cell.v).trim();
            }
          }
          rowObj[key] = val;
          rowObj[colName] = val;
          rowObj["col_" + sheetColIdx] = val;

          // Ignore rows where only a checkbox column is false and primary columns are empty
          if (val !== '' && val !== false) {
            hasPrimaryData = true;
          }
        });

        const col0Lower = String(rowObj.col_0 || '').trim().toLowerCase();
        const col1Lower = String(rowObj.col_1 || '').trim().toLowerCase();
        if (col0Lower === 'sku' && col1Lower === 'p_name') continue;
        if (col0Lower === 'catagory_id' || col0Lower === 'brand_id' || col0Lower === 'banner_id') continue;
        if (col0Lower === 'date' && (col1Lower === 'orderid' || col1Lower === 'who buy' || col1Lower === 'who paid' || col1Lower === 'invest type' || col1Lower === 'type')) continue;
        if (col0Lower === 'shop_id' && (col1Lower === 'shop_logo' || col1Lower === 'market_logo')) continue;
        if (col0Lower === 'customer_id' || col0Lower === 'user_id' || col0Lower === 'request_id' || col0Lower === 'review_id') continue;

        if (hasPrimaryData) {
          rowObj._sheet_row_idx = (rIdx - startRowIdx) + 2;
          rows.push(rowObj);
        }
      }

      rows.__gvizOk = true;
      finish(rows);
    };

    script.onerror = function() {
      finish([]);
    };

    script.src = url;
    document.head.appendChild(script);
  });

  _inflightGviz.set(cacheKey, p);
  return p;
}

function fetchAppsScriptViaJsonp(action, params = {}, timeoutMs = 10000) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(null);
    }

    const cbName = 'as_cb_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    const script = document.createElement('script');
    const qParams = new URLSearchParams({
      action: action,
      callback: cbName,
      ...params
    });
    const url = `${APPS_SCRIPT_URL}?${qParams.toString()}`;

    let timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      window[cbName] = function() {
        try { delete window[cbName]; } catch (e) {}
      };
      setTimeout(() => {
        try { delete window[cbName]; } catch (e) {}
      }, 10000);
    }

    window[cbName] = function(resp) {
      cleanup();
      resolve(resp);
    };

    script.onerror = function() {
      cleanup();
      resolve(null);
    };

    script.src = url;
    document.head.appendChild(script);
  });
}

/**
 * Fast, Reliable Live Google Sheets Reader:
 * - For `Products`, uses a lightweight GViz projection (`SELECT A..N,R..W`) that skips the 14.5MB essay columns O,P,Q,
 *   downloading all 1,336 products in ~590 KB (< 0.6s) instead of timing out at 15.2 MB!
 * - Resolves as soon as either GViz or Apps Script JSONP returns non-empty rows.
 */
export async function fetchFromLocalServerApi(action, payload = {}, method = 'GET', timeoutMs = 3000) {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return null;
  if (window.__DCBD_PHP_UNAVAILABLE__ || window.location.hostname.includes('github.io')) return null;
  try {
    const baseApi = window.__DCBD_PHP_API_URL__ || ((window.__APP_BASE__ || '') + '/api/index.php');
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    let url = `${baseApi}?action=${encodeURIComponent(action)}&_t=${Date.now()}`;
    const opts = {
      method,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      cache: 'no-store'
    };
    if (controller) opts.signal = controller.signal;
    if (method === 'POST') {
      opts.body = JSON.stringify({ action, payload, data: payload });
    } else if (payload && typeof payload === 'object') {
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null && typeof v !== 'object') {
          url += `&${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`;
        }
      });
    }
    const resp = await fetch(url, opts);
    if (timer) clearTimeout(timer);
    if (!resp || !resp.ok) {
      if (resp && (resp.status === 404 || resp.status === 405)) {
        window.__DCBD_PHP_UNAVAILABLE__ = true;
      }
      return null;
    }
    const rawText = await resp.text();
    const trimmed = (rawText || '').trim();
    if (!trimmed || trimmed.startsWith('<?php') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      window.__DCBD_PHP_UNAVAILABLE__ = true;
      return null;
    }
    return JSON.parse(trimmed);
  } catch (e) {}
  return null;
}

function normalizeOrderSheetRowIndices(rows, gvizRefRows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  if (rows.every(r => r && r._sheet_row_idx !== undefined && Number(r._sheet_row_idx) > 0)) return rows;

  // Determine if rows are in top-to-bottom sheet order (Row 2 first = oldest) or reversed (Row N first = newest)
  let isReversed = false;
  if (rows.length >= 2) {
    const firstId = String(rows[0]?.orderid || rows[0]?.OrderID || rows[0]?.order_id || rows[0]?.col_1 || '').trim().toLowerCase();
    const lastId = String(rows[rows.length - 1]?.orderid || rows[rows.length - 1]?.OrderID || rows[rows.length - 1]?.order_id || rows[rows.length - 1]?.col_1 || '').trim().toLowerCase();
    if (Array.isArray(gvizRefRows) && gvizRefRows.length >= 2) {
      const gvizFirstId = String(gvizRefRows[0]?.orderid || gvizRefRows[0]?.OrderID || gvizRefRows[0]?.order_id || gvizRefRows[0]?.col_1 || '').trim().toLowerCase();
      const gvizLastId = String(gvizRefRows[gvizRefRows.length - 1]?.orderid || gvizRefRows[gvizRefRows.length - 1]?.OrderID || gvizRefRows[gvizRefRows.length - 1]?.order_id || gvizRefRows[gvizRefRows.length - 1]?.col_1 || '').trim().toLowerCase();
      if (firstId && firstId === gvizLastId && firstId !== gvizFirstId) {
        isReversed = true;
      }
    } else {
      const dFirst = parseOrderDateStringMs(rows[0]?.date || rows[0]?.Date || rows[0]?.col_0 || '');
      const dLast = parseOrderDateStringMs(rows[rows.length - 1]?.date || rows[rows.length - 1]?.Date || rows[rows.length - 1]?.col_0 || '');
      if (dFirst > 0 && dLast > 0 && dFirst > dLast) {
        isReversed = true;
      }
    }
  }

  const total = rows.length;
  return rows.map((r, idx) => ({
    ...r,
    _sheet_row_idx: (r._sheet_row_idx !== undefined && Number(r._sheet_row_idx) > 0)
      ? Number(r._sheet_row_idx)
      : (isReversed ? (total + 1 - idx) : (idx + 2)),
    _sheet_total_rows: total
  }));
}

async function fetchLiveSheetRows(sheetName, action, timeoutMs = 4500) {
  if (typeof window === 'undefined') return [];

  const lowerSheet = String(sheetName).trim().toLowerCase();
  const isProductsSheet = lowerSheet === 'products';
  const isOrdersSheet = lowerSheet === 'orders' || lowerSheet === 'incomplete_orders';
  const gvizTq = isProductsSheet ? 'SELECT A,B,C,D,E,F,G,H,I,J,K,L,M,N,R,S,T,U,V,W' : '';

  // Channel 0: Query Local PHP/Python Live Server Cache (ultra-fast < 15ms on cPanel)
  const serverPromise = action
    ? fetchFromLocalServerApi(action, {}, 'GET', 1500).then(res => {
        if (res && (res.status === 'success' || res.success) && res.data) {
          if (Array.isArray(res.data.items)) return res.data.items;
          if (Array.isArray(res.data)) return res.data;
        }
        return [];
      }).catch(() => [])
    : Promise.resolve([]);

  // For Products (1,336 rows), merge Live Server Cache ON TOP OF GViz projection so cross-browser edits are never lost
  if (isProductsSheet) {
    try {
      const [serverRows, gvizRows] = await Promise.all([
        serverPromise,
        fetchSheetViaGviz(sheetName, Math.min(timeoutMs, 3800), gvizTq).catch(() => [])
      ]);
      const srvArr = Array.isArray(serverRows) ? serverRows : [];
      const gvzArr = Array.isArray(gvizRows) ? gvizRows : [];
      if (srvArr.length > 0 && gvzArr.length > 0) {
        const bySku = new Map();
        gvzArr.forEach(r => {
          const k = String(r.sku || r.SKU || r.product_id || r.col_0 || '').trim().toLowerCase();
          if (k) bySku.set(k, r);
        });
        srvArr.forEach(r => {
          const k = String(r.sku || r.SKU || r.product_id || r.col_0 || '').trim().toLowerCase();
          if (!k) return;
          if (gvzArr.length > 5 && DEMO_SKUS.has(k) && !bySku.has(k)) return;
          bySku.set(k, { ...(bySku.get(k) || {}), ...r });
        });
        const merged = Array.from(bySku.values());
        if (srvArr.length <= 5 && merged.length > 5) {
          fetchFromLocalServerApi('system/cache_sync', { collection: 'products', items: merged }, 'POST', 3500).catch(() => {});
        }
        return merged;
      }
      if (gvzArr.length > 0) {
        if (srvArr.length <= 5 && gvzArr.length > 5) {
          fetchFromLocalServerApi('system/cache_sync', { collection: 'products', items: gvzArr }, 'POST', 3500).catch(() => {});
        }
        return gvzArr;
      }
      if (srvArr.length > 0) return srvArr;
    } catch (e) {}
  } else {
    // Fast Path: Query Local PHP/SQLite Server + Google GViz in parallel (< 300ms) WITHOUT waiting 6.5s on Apps Script JSONP!
    try {
      const [serverRows, gvizRows] = await Promise.all([
        serverPromise,
        fetchSheetViaGviz(sheetName, Math.min(timeoutMs, 3200), gvizTq).catch(() => [])
      ]);

      const srvArr = Array.isArray(serverRows) ? serverRows : [];
      const gvzArr = Array.isArray(gvizRows) ? gvizRows : [];

      if (isOrdersSheet) {
        const normGviz = normalizeOrderSheetRowIndices(gvzArr, gvzArr);
        const normSrv = normalizeOrderSheetRowIndices(srvArr, normGviz);
        const combined = [...normSrv, ...normGviz];
        if (normSrv.length === 0 && normGviz.length > 0) {
          fetchFromLocalServerApi('system/cache_sync', { collection: lowerSheet, items: normGviz }, 'POST', 3000).catch(() => {});
        }
        if (combined.length > 0) return combined;
      } else {
        if (srvArr.length > 0 && gvzArr.length > 0) {
          return [...srvArr, ...gvzArr];
        }
        if (srvArr.length > 0) return srvArr;
        if (gvzArr.length > 0) return gvzArr;
      }

      // Fallback ONLY when both Local Server and GViz return empty
      if (action) {
        const asResp = await fetchAppsScriptViaJsonp(action, {}, Math.min(timeoutMs, 3500)).catch(() => null);
        if (asResp && (asResp.status === 'success' || asResp.success) && asResp.data) {
          const asRows = Array.isArray(asResp.data.items) ? asResp.data.items : (Array.isArray(asResp.data) ? asResp.data : []);
          if (asRows.length > 0) {
            return isOrdersSheet ? normalizeOrderSheetRowIndices(asRows, []) : asRows;
          }
        }
      }
    } catch (e) {}
  }

  return [];
}

function sanitizePayloadForSheet(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  function sanitizeValue(val, depth = 0) {
    if (depth > 6) return val;
    if (typeof val === 'string') {
      // Only replace oversized base64 data URLs (> 45KB) so Google Sheets cell limit (50,000 chars) is never exceeded
      if ((val.startsWith('data:image/') || val.includes(';base64,')) && val.length > 45000) {
        return DEFAULT_PRODUCT_THUMB;
      }
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(item => sanitizeValue(item, depth + 1));
    }
    if (val && typeof val === 'object') {
      const res = {};
      for (const k of Object.keys(val)) {
        res[k] = sanitizeValue(val[k], depth + 1);
      }
      return res;
    }
    return val;
  }

  return sanitizeValue(payload);
}

// Track recently sent mutations to prevent duplicate submissions within 4 seconds
const _recentMutations = new Map();

/**
 * Single-Execution Reliable Mutation Sender to Google Apps Script:
 * - Sends ONE request (never 5 parallel requests!) so orders and items NEVER duplicate 5 times in the Sheet.
 * - Uses CORS-safelisted `text/plain;charset=utf-8` POST first, and falls back to hidden iframe POST only if fetch fails.
 */
export async function sendToAppsScript(action, payload = {}) {
  if (!checkApiMutationRateLimit(500)) {
    return { status: 'error', success: false, message: 'Rate limit exceeded' };
  }
  const cleanPayload = signApiRequestPayload(action, sanitizePayloadForSheet(payload || {}));

  // Build deterministic deduplication signature for order/item mutations
  const dedupKey = `${action}::${cleanPayload.order_id || cleanPayload.orderId || cleanPayload.sku || cleanPayload.catagory_id || cleanPayload.brand_id || cleanPayload.banner_id || cleanPayload.shop_id || cleanPayload.id || JSON.stringify(cleanPayload).slice(0, 180)}`;
  const lastSentAt = _recentMutations.get(dedupKey) || 0;
  if (Date.now() - lastSentAt < 2500) {
    return { status: 'success', success: true, deduplicated: true };
  }
  _recentMutations.set(dedupKey, Date.now());

  const reqId = cleanPayload._req_id || ('REQ_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
  const bodyObj = {
    action: action,
    _req_id: reqId,
    spreadsheet_id: SPREADSHEET_ID,
    payload: { ...cleanPayload, _req_id: reqId, spreadsheet_id: SPREADSHEET_ID },
    data: { ...cleanPayload, _req_id: reqId, spreadsheet_id: SPREADSHEET_ID }
  };
  const bodyJson = JSON.stringify(bodyObj);

  const canKeepalive = bodyJson.length < 60000;

  // Turbo Channel 0: Sync with local PHP/Python High-Speed Gateway (/api/index.php) for immediate multi-browser persistence
  let phpSyncPromise = Promise.resolve(null);
  try {
    if (typeof window !== 'undefined' && !window.__DCBD_PHP_UNAVAILABLE__ && !window.location.hostname.includes('github.io')) {
      const localPhpApi = window.__DCBD_PHP_API_URL__ || ((window.__APP_BASE__ || '') + '/api/index.php');
      phpSyncPromise = fetch(`${localPhpApi}?action=${encodeURIComponent(action)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: bodyJson,
        keepalive: canKeepalive
      }).then(async r => {
        if (!r || !r.ok) return null;
        const js = await r.json().catch(() => null);
        if (js && js.sync_meta) {
          try {
            const locMeta = JSON.parse(localStorage.getItem('dcbd_server_sync_meta') || '{}') || {};
            locMeta._global = Number(js.sync_meta.updated_at || js.sync_meta.version_ts || Date.now());
            if (js.sync_meta.collections) Object.assign(locMeta, js.sync_meta.collections);
            localStorage.setItem('dcbd_server_sync_meta', JSON.stringify(locMeta));
          } catch (e) {}
        }
        return js;
      }).catch(() => null);
    }
  } catch (e) {}

  // Primary Channel: Fetch POST to Google Apps Script (with _req_id deduplication in Code.js)
  let gasConfirmed = false;
  try {
    const resp = await fetch(`${APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}&_req_id=${encodeURIComponent(reqId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: bodyJson,
      keepalive: canKeepalive
    });
    if (resp && resp.ok) {
      const json = await resp.json().catch(() => null);
      if (json && json.success !== false) {
        gasConfirmed = true;
        await phpSyncPromise.catch(() => null);
        return json;
      }
    }
  } catch (fetchErr) {}

  // Fallback Channels when browser CORS / 302 redirect blocks reading the POST response:
  // 1) Compact JSONP GET to Apps Script doGet (100% immune to POST->GET 302 body loss; deduplicated by _req_id in Code.js)
  if (!gasConfirmed) {
    try {
      const slimCopy = { ...cleanPayload, _req_id: reqId, spreadsheet_id: SPREADSHEET_ID };
      delete slimCopy.items;
      delete slimCopy.description;
      delete slimCopy.Description;
      delete slimCopy.specification;
      delete slimCopy.Specification;
      delete slimCopy.others;
      delete slimCopy.Others;
      const slimGetStr = JSON.stringify(slimCopy);
      if (slimGetStr.length < 1800) {
        fetchAppsScriptViaJsonp(action, { _req_id: reqId, data: slimGetStr }, 5500).catch(() => null);
      }
    } catch (jsonpErr) {}

    // 2) Fire no-cors POST or hidden iframe form POST for larger payloads (deduplicated by _req_id in Code.js)
    try {
      await fetch(`${APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}&_req_id=${encodeURIComponent(reqId)}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: bodyJson,
        keepalive: canKeepalive
      });
    } catch (noCorsErr) {
      try {
        if (typeof document !== 'undefined' && document.body) {
          const iframeName = 'as_post_frame_' + Math.random().toString(36).substr(2, 9);
          const iframe = document.createElement('iframe');
          iframe.name = iframeName;
          iframe.style.cssText = 'position:absolute;width:1px;height:1px;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
          document.body.appendChild(iframe);

          const form = document.createElement('form');
          form.target = iframeName;
          form.method = 'POST';
          form.action = `${APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}&_req_id=${encodeURIComponent(reqId)}`;
          form.style.display = 'none';

          const dataStr = JSON.stringify({ ...cleanPayload, _req_id: reqId, spreadsheet_id: SPREADSHEET_ID });
          const fields = { action, payload: dataStr, data: dataStr, spreadsheet_id: SPREADSHEET_ID, _req_id: reqId };
          for (const [k, v] of Object.entries(fields)) {
            const inp = document.createElement('input');
            inp.type = 'hidden';
            inp.name = k;
            inp.value = String(v);
            form.appendChild(inp);
          }
          document.body.appendChild(form);
          form.submit();
          setTimeout(() => {
            try { if (form.parentNode) form.parentNode.removeChild(form); } catch (e) {}
            try { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); } catch (e) {}
          }, 6000);
        }
      } catch (iframeErr) {}
    }
  }

  const phpRes = await phpSyncPromise.catch(() => null);
  return phpRes || { status: 'success', success: true };
}

export function normalizeBDPhone(phone) {
  if (!phone) return '';
  let str = String(phone)
    .trim()
    .replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d))
    .replace(/[\s\-\(\)]/g, '');
  if (str.startsWith('+88')) str = str.slice(3);
  else if (str.startsWith('88')) str = str.slice(2);
  if (str.length === 10 && str.startsWith('1')) str = '0' + str;
  return str;
}

/**
 * Calculate fallback retail, original & wholesale prices from buying_price using Dream Cart BD Profit-Calculator rules.
 */
export function calculatePricesFromBuyingTier(buyPrice, explicitSellPrice = 0) {
  const b = safeNumber(buyPrice, 0);
  let sell = safeNumber(explicitSellPrice, 0);
  let marginPct = 0.25;
  let discPct = 0.30;
  let wsMarginPct = 0.12;
  let moq = 5;

  if (b > 0) {
    if (b <= 200) { marginPct = 0.40; discPct = 0.35; wsMarginPct = 0.18; moq = 10; }
    else if (b <= 500) { marginPct = 0.32; discPct = 0.32; wsMarginPct = 0.15; moq = 8; }
    else if (b <= 1000) { marginPct = 0.27; discPct = 0.30; wsMarginPct = 0.12; moq = 5; }
    else if (b <= 2000) { marginPct = 0.22; discPct = 0.28; wsMarginPct = 0.10; moq = 5; }
    else if (b <= 5000) { marginPct = 0.17; discPct = 0.25; wsMarginPct = 0.08; moq = 3; }
    else { marginPct = 0.12; discPct = 0.20; wsMarginPct = 0.06; moq = 2; }

    if (sell <= 0) {
      sell = Math.round(b * (1 + marginPct));
    }
  }

  const orig = sell > 0 ? Math.round(sell * (1 + discPct)) : 0;
  const ws = b > 0 ? Math.round(b * (1 + wsMarginPct)) : (sell > 0 ? Math.round(sell * 0.85) : 0);
  return { selling_price: sell, original_price: orig, wholesale_price: ws, min_order_q: moq };
}

export function normalizeSheetProductRow(r, idx = 0) {
  if (!r || typeof r !== 'object') return null;
  const sku = safeStr(r.sku || r.SKU || r.product_id || r.col_0 || `DCBD-PRD-${idx + 1}`);
  const name = safeStr(r.p_name || r.P_Name || r.name || r.col_1 || '');
  if (!name || name.toLowerCase() === 'p_name' || sku.toLowerCase() === 'sku') return null;

  const slug = safeStr(r.slug || r.Slug || r.col_13) || name.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, '-').replace(/^-|-$/g, '') || sku.toLowerCase();
  const rawImages = r.images !== undefined ? r.images : (r.Images !== undefined ? r.Images : (r.col_12 !== undefined ? r.col_12 : r.thumbnail));
  const imgs = parseImageUrlsList(rawImages);
  const thumb = normalizeSingleImageUrl(r.thumbnail) || imgs[0] || DEFAULT_PRODUCT_THUMB;

  const buyPrice = safeNumber(r.buying_price !== undefined ? r.buying_price : (r.Buying_price !== undefined ? r.Buying_price : r.col_6), 0);
  const rawSellPrice = safeNumber(r.selling_price !== undefined ? r.selling_price : (r.Selling_Price !== undefined ? r.Selling_Price : r.col_7), 0);
  const tierCalc = calculatePricesFromBuyingTier(buyPrice, rawSellPrice);

  const sellPrice = rawSellPrice > 0 ? rawSellPrice : tierCalc.selling_price;
  const stockVal = safeNumber(r.stock !== undefined ? r.stock : (r.Stock !== undefined ? r.Stock : r.col_8), 25);
  const rawOrig = safeNumber(r.original_price !== undefined ? r.original_price : (r.Original_Price !== undefined ? r.Original_Price : r.col_9), 0);
  const origPrice = rawOrig > 0 ? rawOrig : tierCalc.original_price;
  const rawWs = safeNumber(r.wholesale_price !== undefined ? r.wholesale_price : (r.WholeSale_price !== undefined ? r.WholeSale_price : r.col_10), 0);
  const wsPrice = rawWs > 0 ? rawWs : tierCalc.wholesale_price;
  const rawMoq = safeNumber(r.min_order_q !== undefined ? r.min_order_q : (r.Min_order_Q !== undefined ? r.Min_order_Q : (r.min_order_qty !== undefined ? r.min_order_qty : r.col_11)), 0);
  const minOrderQ = rawMoq > 0 ? rawMoq : tierCalc.min_order_q;
  const statusStr = safeStr(r.status || 'সক্রিয়');

  return {
    sku: sku,
    product_id: sku,
    name: name,
    p_name: name,
    category: safeStr(r.category || r.Category || r.col_2 || 'General') || 'General',
    sub_category: safeStr(r.sub_category !== undefined ? r.sub_category : (r.Sub_Category !== undefined ? r.Sub_Category : r.col_3), ''),
    child_category: safeStr(r.child_category !== undefined ? r.child_category : (r.Child_Category !== undefined ? r.Child_Category : r.col_4), ''),
    brand: safeStr(r.brand || r.Brand || r.col_5 || 'Dream Cart BD') || 'Dream Cart BD',
    buying_price: buyPrice,
    selling_price: sellPrice,
    stock: stockVal,
    original_price: origPrice,
    wholesale_price: wsPrice,
    reseller_price: safeNumber(r.reseller_price, Math.round(sellPrice * 0.90)),
    min_order_q: minOrderQ,
    min_order_qty: minOrderQ,
    images: imgs.length > 0 ? imgs : [thumb],
    thumbnail: thumb,
    slug: slug,
    description: safeStr(r.description !== undefined ? r.description : (r.Description !== undefined ? r.Description : r.col_14), ''),
    specification: safeStr(r.specification !== undefined ? r.specification : (r.Specification !== undefined ? r.Specification : r.col_15), ''),
    others: safeStr(r.others !== undefined ? r.others : (r.Others !== undefined ? r.Others : r.col_16), ''),
    color: safeStr(r.color !== undefined ? r.color : (r.Color !== undefined ? r.Color : r.col_17), 'Standard') || 'Standard',
    size: safeStr(r.size !== undefined ? r.size : (r.Size !== undefined ? r.Size : r.col_18), 'Free Size') || 'Free Size',
    weight_kg: safeNumber(r.weight_kg !== undefined ? r.weight_kg : (r.WEIGHT_KG !== undefined ? r.WEIGHT_KG : r.col_19), 0.25),
    width_cm: safeNumber(r.width_cm !== undefined ? r.width_cm : (r.WIDTH_CM !== undefined ? r.WIDTH_CM : r.col_20), 10),
    length_cm: safeNumber(r.length_cm !== undefined ? r.length_cm : (r.LENGTH_CM !== undefined ? r.LENGTH_CM : r.col_21), 10),
    height_cm: safeNumber(r.height_cm !== undefined ? r.height_cm : (r.HEIGHT_CM !== undefined ? r.HEIGHT_CM : r.col_22), 5),
    status: statusStr,
    is_active: statusStr !== 'নিষ্ক্রিয়'
  };
}

export function parseOrderDateStringMs(rawDate) {
  if (!rawDate) return 0;
  let s = String(rawDate)
    .replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d))
    .trim();
  if (!s) return 0;

  const nowMs = Date.now();
  const lower = s.toLowerCase();
  if (lower === 'আজ' || lower === 'আজকে' || lower === 'today' || lower === 'এখনই' || lower === 'just now') {
    return nowMs;
  }

  // 1. GViz Date(YYYY, M, D, h, m, s) where M is 0-indexed
  let m = s.match(/^Date\(\s*(\d{4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})(?:\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2}))?\s*\)$/i);
  if (m) {
    const yr = Number(m[1]);
    const mo = Number(m[2]) + 1;
    const dy = Number(m[3]);
    const hr = m[4] !== undefined ? Number(m[4]) : 0;
    const mn = m[5] !== undefined ? Number(m[5]) : 0;
    const sc = m[6] !== undefined ? Number(m[6]) : 0;
    const iso = `${yr}-${String(mo).padStart(2, '0')}-${String(dy).padStart(2, '0')}T${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}:${String(sc).padStart(2, '0')}+06:00`;
    const ts = Date.parse(iso);
    if (!isNaN(ts) && ts > 946684800000) return Math.min(ts, nowMs);
  }

  // 2. ISO / SQL YYYY-MM-DD or YYYY/MM/DD [HH:MM[:SS]] [AM/PM] [Z]
  m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.\d+)?\s*(AM|PM)?)?(Z|[+-]\d{2}:?\d{2})?$/i);
  if (m) {
    const yr = Number(m[1]);
    const mo = Number(m[2]);
    const dy = Number(m[3]);
    const hasTime = m[4] !== undefined;
    let hr = hasTime ? Number(m[4]) : 23;
    const mn = m[5] !== undefined ? Number(m[5]) : (hasTime ? 0 : 59);
    const sc = m[6] !== undefined ? Number(m[6]) : 0;
    const ampm = (m[7] || '').toUpperCase();
    const tz = (m[8] || '').toUpperCase();
    if (ampm === 'PM' && hr < 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;

    // Interpret wall-clock dates in Asia/Dhaka (+06:00). If Apps Script serialized a Sheet Date cell with 'Z'
    // in a US timezone, clamp any resulting future timestamp to nowMs so it never blocks new orders.
    const tzSuffix = (tz && tz !== 'Z') ? tz : '+06:00';
    const iso = `${yr}-${String(mo).padStart(2, '0')}-${String(dy).padStart(2, '0')}T${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}:${String(sc).padStart(2, '0')}${tzSuffix}`;
    let ts = Date.parse(iso);
    if (tz === 'Z') {
      const utcTs = Date.parse(s);
      if (!isNaN(utcTs) && utcTs <= nowMs + 60000) {
        ts = utcTs;
      }
    }
    if (!isNaN(ts) && ts > 946684800000) return Math.min(ts, nowMs);
  }

  // 3. Bangladesh DD/MM/YYYY or DD-MM-YYYY (with automatic MM/DD/YYYY fallback if p2 > 12 or DD/MM is in the future)
  m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})(?:[T,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?)?$/i);
  if (m) {
    const p1 = Number(m[1]);
    const p2 = Number(m[2]);
    let yr = Number(m[3]);
    if (yr < 100) yr += 2000;
    const hasTime = m[4] !== undefined;
    let hr = hasTime ? Number(m[4]) : 23;
    const mn = m[5] !== undefined ? Number(m[5]) : (hasTime ? 0 : 59);
    const sc = m[6] !== undefined ? Number(m[6]) : 0;
    const ampm = (m[7] || '').toUpperCase();
    if (ampm === 'PM' && hr < 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;

    let dy = p1;
    let mo = p2;
    if (p1 <= 12 && p2 > 12) {
      mo = p1;
      dy = p2;
    } else if (p1 <= 12 && p2 <= 12) {
      const dmyIso = `${yr}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}T${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}:${String(sc).padStart(2, '0')}+06:00`;
      const mdyIso = `${yr}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}T${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}:${String(sc).padStart(2, '0')}+06:00`;
      const tsDmy = Date.parse(dmyIso);
      const tsMdy = Date.parse(mdyIso);
      if (!isNaN(tsDmy) && tsDmy > nowMs + 86400000 && !isNaN(tsMdy) && tsMdy <= nowMs + 86400000) {
        mo = p1;
        dy = p2;
      }
    }
    if (mo >= 1 && mo <= 12 && dy >= 1 && dy <= 31) {
      const iso = `${yr}-${String(mo).padStart(2, '0')}-${String(dy).padStart(2, '0')}T${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}:${String(sc).padStart(2, '0')}+06:00`;
      const ts = Date.parse(iso);
      if (!isNaN(ts) && ts > 946684800000) return Math.min(ts, nowMs);
    }
  }

  const fallback = Date.parse(s.includes(' ') && !s.includes('T') ? s.replace(' ', 'T') : s) || Date.parse(s);
  if (!isNaN(fallback) && fallback > 946684800000) {
    return Math.min(fallback, nowMs);
  }
  return 0;
}

export function parseOrderSortTimestamp(r, idx = 0) {
  if (!r || typeof r !== 'object') return 0;

  const nowMs = Date.now();
  let localCreated = Number(r._local_created_ts || 0);
  if (localCreated > 0 && localCreated < 1e11) localCreated *= 1000;
  if (localCreated > nowMs + 60000) localCreated = nowMs;

  const primaryDateStr = safeStr(r.date || r.Date || r.col_0 || r.created_at || '');
  const parsedDateMs = parseOrderDateStringMs(primaryDateStr);

  // Only consult _sort_ts if neither _local_created_ts nor a parseable date exists,
  // and ALWAYS floor to the second so repeated sorting NEVER inflates _sort_ts by +999ms!
  let explicitSort = 0;
  if (localCreated <= 0 && parsedDateMs <= 0) {
    explicitSort = Number(r._sort_ts || 0);
    if (explicitSort > 0 && explicitSort < 1e11) explicitSort *= 1000;
    if (explicitSort > 8000000000000) explicitSort -= 8000000000000;
    else if (explicitSort > 5000000000000) explicitSort = 0;
    if (explicitSort > nowMs + 60000) explicitSort = nowMs;
    if (explicitSort > 0) explicitSort = Math.floor(explicitSort / 1000) * 1000;
  }

  const sheetRowIdx = (r._sheet_row_idx !== undefined && r._sheet_row_idx !== null && !isNaN(Number(r._sheet_row_idx)))
    ? Number(r._sheet_row_idx)
    : 0;

  let baseMs = Math.max(localCreated, parsedDateMs, explicitSort);
  if (baseMs > 946684800000) {
    baseMs = Math.floor(baseMs / 1000) * 1000;
  } else {
    baseMs = 1700000000000 + (sheetRowIdx > 0 ? sheetRowIdx * 1000 : Math.max(0, 500000 - idx * 100));
  }

  // Deterministic tie-breaker (0..999ms): higher sheet row index or earlier array position wins when two orders share the same second
  const tieBreaker = sheetRowIdx > 0
    ? Math.min(999, Math.max(0, sheetRowIdx))
    : Math.max(0, 999 - Math.min(999, idx));

  return baseMs + tieBreaker;
}

export function normalizeSheetOrderRow(r, idx = 0) {
  if (!r || typeof r !== 'object') return null;
  const orderId = safeStr(r.order_id || r.orderid || r.OrderID || r.orderId || r.col_1 || '');
  if (!orderId || orderId.toLowerCase() === 'orderid' || orderId.toLowerCase() === 'order_id') return null;
  const prodStr = safeStr(r.products || r.Products || r.product_name || r.col_6 || 'পণ্য অর্ডার');
  const dateStr = safeStr(r.date || r.Date || r.col_0 || new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Dhaka' }));
  const totalAmt = safeNumber(r.total_amount !== undefined ? r.total_amount : (r.Total_Amount !== undefined ? r.Total_Amount : r.col_10), 0);
  const qty = safeNumber(r.quantity !== undefined ? r.quantity : (r.Quantity !== undefined ? r.Quantity : r.col_9), 1) || 1;
  const sortTs = parseOrderSortTimestamp({ ...r, date: dateStr }, idx);

  return {
    date: dateStr,
    Date: dateStr,
    order_id: orderId,
    orderId: orderId,
    OrderID: orderId,
    account_type: safeStr(r.account_type || r.Account_type || r.col_2 || 'Customer'),
    customer_name: safeStr(r.customer_name || r.Customer_Name || r.col_3 || 'গ্রাহক'),
    phone: safeStr(r.phone || r.Phone || r.col_4 || ''),
    address: safeStr(r.address || r.Address || r.col_5 || ''),
    products: prodStr,
    product_name: safeStr(r.product_name || prodStr),
    color: safeStr(r.color || r.Color || r.col_7 || 'Standard'),
    size: safeStr(r.size || r.Size || r.col_8 || 'Free Size'),
    quantity: qty,
    unit_price: safeNumber(r.unit_price, totalAmt > 0 ? Math.round(totalAmt / qty) : 0),
    subtotal: safeNumber(r.subtotal, totalAmt),
    total_amount: totalAmt,
    delivery_fee: r.delivery_fee !== undefined ? safeNumber(r.delivery_fee, 0) : (r.delivery_charge !== undefined ? safeNumber(r.delivery_charge, 0) : undefined),
    discount: safeNumber(r.discount, 0),
    customer_note: safeStr(r.customer_note || r.note || ''),
    payment_method: safeStr(r.payment_method || r.Payment_method || r.col_11 || 'Cash On Delivery (COD)'),
    transaction_id: safeStr(r.transaction_id || r.Transaction_ID || r.col_12 || 'COD'),
    payment_status: safeStr(r.payment_status || r.Payment_Status || r.col_13 || 'Pending'),
    order_status: safeStr(r.order_status || r.Order_Status || r.col_14 || 'Order Placed'),
    reseller_commission: safeNumber(r.reseller_commission !== undefined ? r.reseller_commission : r.col_15, 0),
    commission_status: safeStr(r.commission_status || r.Commission_Status || r.col_16 || 'Pending'),
    fraud_status: safeStr(r.fraud_status || 'Safe (98%)'),
    customer_rating: safeStr(r.customer_rating || '5/5 ★'),
    courier_name: safeStr(r.courier_name || ''),
    consignment_id: safeStr(r.consignment_id || ''),
    items: Array.isArray(r.items) ? r.items : [],
    _sheet_row_idx: r._sheet_row_idx !== undefined ? Number(r._sheet_row_idx) : undefined,
    _local_created_ts: r._local_created_ts !== undefined ? Number(r._local_created_ts) : undefined,
    _updated_ts: r._updated_ts !== undefined ? Number(r._updated_ts) : undefined,
    _sort_ts: sortTs
  };
}

/**
 * Deduplicates orders by OrderID and sorts them strictly Newest-First (_sort_ts DESC)
 * so new customer orders ALWAYS appear at index 0 (top of Admin Panel & Dashboard).
 */
export function deduplicateAndSortOrdersNewestFirst(ordersArray = [], deletedIdsSet = null) {
  const delSet = deletedIdsSet instanceof Set
    ? deletedIdsSet
    : new Set(
        (() => {
          try {
            return JSON.parse(localStorage.getItem('dcbd_deleted_order_ids') || '[]').map(x => String(x || '').toLowerCase());
          } catch (e) {
            return [];
          }
        })()
      );

  const byId = new Map();
  (Array.isArray(ordersArray) ? ordersArray : []).forEach((raw, idx) => {
    const norm = normalizeSheetOrderRow(raw, idx);
    if (!norm || !norm.order_id) return;
    const key = String(norm.order_id).trim().toLowerCase();
    if (delSet.has(key)) return;
    if (!byId.has(key)) {
      byId.set(key, norm);
    } else {
      const prev = byId.get(key);
      const prevUpd = Number(prev._updated_ts || 0);
      const normUpd = Number(norm._updated_ts || 0);
      const winner = normUpd > prevUpd ? norm : prev;
      const loser = normUpd > prevUpd ? prev : norm;
      const mergedLocalCreated = Math.max(Number(prev._local_created_ts || 0), Number(norm._local_created_ts || 0)) || undefined;
      const mergedSheetIdx = Math.max(Number(prev._sheet_row_idx || 0), Number(norm._sheet_row_idx || 0)) || undefined;
      const mergedRow = {
        ...loser,
        ...winner,
        order_status: winner.order_status || loser.order_status,
        payment_status: winner.payment_status || loser.payment_status,
        courier_name: winner.courier_name || loser.courier_name,
        consignment_id: winner.consignment_id || loser.consignment_id,
        items: (Array.isArray(winner.items) && winner.items.length > 0) ? winner.items : loser.items,
        _local_created_ts: mergedLocalCreated,
        _sheet_row_idx: mergedSheetIdx,
        _updated_ts: Math.max(prevUpd, normUpd) || undefined
      };
      mergedRow._sort_ts = parseOrderSortTimestamp(mergedRow, idx);
      byId.set(key, mergedRow);
    }
  });

  const sorted = Array.from(byId.values());
  sorted.sort((a, b) => {
    const tsA = Number(a._sort_ts || 0);
    const tsB = Number(b._sort_ts || 0);
    if (tsB !== tsA) return tsB - tsA;
    const rowA = Number(a._sheet_row_idx || 0);
    const rowB = Number(b._sheet_row_idx || 0);
    if (rowB !== rowA) return rowB - rowA;
    return String(b.order_id || '').localeCompare(String(a.order_id || ''));
  });
  return sorted;
}

export function normalizeIncompleteOrderRow(r, idx = 0) {
  if (!r || typeof r !== 'object') return null;
  const orderId = safeStr(r.order_id || r.orderid || r.OrderID || r.col_1 || '');
  if (!orderId || orderId.toLowerCase() === 'orderid') return null;
  return {
    date: safeStr(r.date || r.Date || r.col_0 || 'আজ'),
    order_id: orderId,
    account_type: safeStr(r.account_type || r.Account_type || r.col_2 || 'Customer'),
    customer_name: safeStr(r.customer_name || r.Customer_Name || r.col_3 || 'গ্রাহক'),
    phone: safeStr(r.phone || r.Phone || r.col_4 || ''),
    address: safeStr(r.address || r.Address || r.col_5 || ''),
    products: safeStr(r.products || r.Products || r.col_6 || 'চেকআউট পণ্য'),
    total_amount: safeNumber(r.total_amount !== undefined ? r.total_amount : r.col_7, 0),
    status: safeStr(r.status || r.Status || r.col_8 || 'Draft/Incomplete')
  };
}

/**
 * Aggregate raw Category rows from the Google Sheet (where each row is a Category -> Sub_Category -> Chail_Category tuple)
 * into deduplicated category objects with full `sub_category`, `chail_category`, and `tree_subs`.
 */
export function aggregateCategoryRows(rawRows = [], existingCats = []) {
  const catMap = new Map();

  function addEntry(catName, catId, catSlug, catImg, subStr, childStr, treeSubs) {
    const cleanCat = safeStr(catName);
    if (!cleanCat || cleanCat.toLowerCase() === 'category' || cleanCat.toLowerCase() === 'test id') return;
    const key = cleanCat.toLowerCase();

    if (!catMap.has(key)) {
      catMap.set(key, {
        catagory_id: safeStr(catId) || `CAT-${101 + catMap.size}`,
        catagory_slug: safeStr(catSlug) || cleanCat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category_image: normalizeSingleImageUrl(catImg) || DEFAULT_PRODUCT_THUMB,
        category: cleanCat,
        subMap: new Map()
      });
    }

    const entry = catMap.get(key);
    if (catId && entry.catagory_id.startsWith('CAT-') && !String(catId).startsWith('CAT-10')) {
      entry.catagory_id = safeStr(catId);
    }
    if (catImg && (!entry.category_image || entry.category_image === DEFAULT_PRODUCT_THUMB)) {
      const normImg = normalizeSingleImageUrl(catImg);
      if (normImg) entry.category_image = normImg;
    }

    if (Array.isArray(treeSubs) && treeSubs.length > 0) {
      treeSubs.forEach(ts => {
        const sName = safeStr(ts && ts.name);
        if (!sName) return;
        const sKey = sName.toLowerCase();
        if (!entry.subMap.has(sKey)) entry.subMap.set(sKey, { name: sName, children: new Set() });
        const sObj = entry.subMap.get(sKey);
        (Array.isArray(ts.children) ? ts.children : []).forEach(ch => {
          const cName = safeStr(ch);
          if (cName) sObj.children.add(cName);
        });
      });
      return;
    }

    const subs = String(subStr || '').split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
    const childs = String(childStr || '').split(/[,|\n]/).map(s => s.trim()).filter(Boolean);

    if (subs.length > 0) {
      subs.forEach(sName => {
        const sKey = sName.toLowerCase();
        if (!entry.subMap.has(sKey)) entry.subMap.set(sKey, { name: sName, children: new Set() });
        const sObj = entry.subMap.get(sKey);
        childs.forEach(cName => sObj.children.add(cName));
      });
    }
  }

  rawRows.forEach((r, i) => {
    if (!r) return;
    addEntry(
      r.category || r.Category || r.col_3,
      r.catagory_id || r.Catagory_ID || r.col_0 || `CAT-${101 + i}`,
      r.catagory_slug || r.Catagory_Slug || r.col_1,
      r.category_image || r.Category_Image || r.col_2,
      r.sub_category !== undefined ? r.sub_category : (r.Sub_Category !== undefined ? r.Sub_Category : r.col_4),
      r.chail_category !== undefined ? r.chail_category : (r.Chail_Category !== undefined ? r.Chail_Category : (r.child_category || r.col_5)),
      r.tree_subs
    );
  });

  existingCats.forEach((c, i) => {
    if (!c) return;
    // Skip demo categories if we already loaded real categories from the sheet
    if (rawRows.length > 10 && ['CAT-001', 'CAT-002', 'CAT-003', 'CAT-004'].includes(c.catagory_id)) return;
    addEntry(
      c.category || c.Category,
      c.catagory_id || c.Catagory_ID || `CAT-${500 + i}`,
      c.catagory_slug || c.Catagory_Slug,
      c.category_image || c.Category_Image,
      c.sub_category,
      c.chail_category || c.child_category,
      c.tree_subs
    );
  });

  return Array.from(catMap.values()).map(entry => {
    const treeSubs = Array.from(entry.subMap.values()).map(s => ({
      name: s.name,
      children: Array.from(s.children)
    }));
    return {
      catagory_id: entry.catagory_id,
      catagory_slug: entry.catagory_slug,
      category_image: entry.category_image,
      category: entry.category,
      sub_category: treeSubs.map(s => s.name).join(', '),
      chail_category: Array.from(new Set(treeSubs.flatMap(s => s.children))).join(', '),
      tree_subs: treeSubs
    };
  });
}

// ============================================================================
// DYNAMIC WEBSITE SETTINGS, PAYMENT METHODS, DELIVERY ZONES & OFFERS HELPERS
// ============================================================================
export const DEFAULT_SITE_SETTINGS = {
  shopName: "Dream Cart BD",
  tagline: "Smart Digital Commerce",
  shopLogo: "/icon/logo.png",
  address: "চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।",
  hotline1: "01581703822",
  hotline2: "01818273838",
  email: "jainal.dcitbd@gmail.com",
  officeHours: "প্রতিদিন সকাল ৮:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত",
  notice: "৳২,০০০ বা তার বেশি অর্ডারে ফ্রি শিপিং! | অনলাইনে পেমেন্ট করলে ৫% ছাড় | পণ্য হাতে পেয়ে মূল্য পরিশোধ",
  noticeActive: true,
  freeDeliveryThreshold: 2000,
  onlineDiscountPct: 5,
  fbPixelId: "",
  fbCapiToken: "",
  fbTestEventCode: "",
  gtagId: "",
  googleAdsId: "",
  googleConversionLabel: "",
  gtmId: "",
  ytTrackingId: "",
  tiktokPixelId: "",
  enableServerCapi: true,
  enableEnhancedConv: true
};

export const DEFAULT_PAYMENT_METHODS = [
  { id: "PM-01", code: "COD", name: "ক্যাশ অন ডেলিভারি (Cash on Delivery)", type: "COD", number: "", link: "", discount_pct: 0, details: "পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।", status: "Active" },
  { id: "PM-02", code: "BKASH_PERSONAL", name: "বিকাশ পার্সোনাল (Send Money)", type: "Mobile Banking", number: "01879653143, 01818273838", link: "", discount_pct: 5, details: "বিকাশ অ্যাপ বা *247# ডায়াল করে Send Money করুন এবং TrxID নিচের বক্সে লিখুন।", status: "Active" },
  { id: "PM-03", code: "BKASH_PAYMENT", name: "বিকাশ অনলাইন পেমেন্ট লিংক (Gateway)", type: "Payment Link", number: "01581703822", link: "https://shop.bkash.com/j-a-sagor-computer01581703822/paymentlink", discount_pct: 5, details: "বিকাশ অনলাইন পেমেন্ট লিংকে পেমেন্ট সম্পন্ন করে প্রাপ্ত TrxID নিচের বক্সে লিখুন।", status: "Active" },
  { id: "PM-04", code: "NAGAD_PERSONAL", name: "নগদ পার্সোনাল (Send Money)", type: "Mobile Banking", number: "01879653143, 01818273838", link: "", discount_pct: 5, details: "নগদ অ্যাপ বা *167# ডায়াল করে Send Money করুন এবং TrxID নিচের বক্সে লিখুন।", status: "Active" },
  { id: "PM-05", code: "ROCKET_PERSONAL", name: "রকেট পার্সোনাল (Send Money)", type: "Mobile Banking", number: "01581703822-7", link: "", discount_pct: 5, details: "রকেট অ্যাপ বা *322# ডায়াল করে ১২ ডিজিটের নম্বরে Send Money করে TrxID লিখুন।", status: "Active" },
  { id: "PM-06", code: "BANK", name: "ইসলামী ব্যাংক ট্রান্সফার (IBBL)", type: "Bank Account", number: "20508070200030208", link: "", bank_name: "Islami Bank Bangladesh PLC (IBBLBDDH)", account_name: "Jainal Abedin", branch: "Maheshkhali Sub branch", routing: "125260525", discount_pct: 5, details: "CellFin, i-Banking বা শাখা থেকে টাকা পাঠিয়ে TrxID লিখুন।", status: "Active" }
];

export const DEFAULT_DELIVERY_METHODS = [
  { id: "DLV-01", code: "cumilla", zone: "কুমিল্লা সদর (In Cumilla)", name: "কুমিল্লা সদর (In Cumilla)", charge: 70, time: "১-২ দিন", eta: "১-২ দিন (২৪ ঘন্টায় ডেলিভারি)", free_threshold: 2000, status: "Active" },
  { id: "DLV-02", code: "dhaka", zone: "ঢাকা সিটি (In Dhaka)", name: "ঢাকা সিটি (In Dhaka)", charge: 90, time: "২-৩ দিন", eta: "২-৩ দিন (হোম ডেলিভারি)", free_threshold: 2000, status: "Active" },
  { id: "DLV-03", code: "outside", zone: "ঢাকার বাইরে সমগ্র বাংলাদেশ (Outside Dhaka)", name: "ঢাকার বাইরে সমগ্র বাংলাদেশ (Outside Dhaka)", charge: 120, time: "৩-৫ দিন", eta: "৩-৫ দিন (কুরিয়ার ডেলিভারি)", free_threshold: 2000, status: "Active" },
  { id: "DLV-04", code: "pickup", zone: "অফিস থেকে পিকআপ (Office Pickup - Cumilla)", name: "অফিস থেকে পিকআপ (Office Pickup - Cumilla)", charge: 0, time: "তাৎক্ষণিক", eta: "তাৎক্ষণিক পিকআপ (ফ্রি)", free_threshold: 0, status: "Active" }
];

export const DEFAULT_OFFERS = [
  { id: "OFF-01", code: "DREAM10", title: "স্পেশাল ১০% ডিসকাউন্ট কুপন", discount: "১০% ছাড়", discount_type: "percent", discount_value: 10, min_spend: 1500, status: "Active" },
  { id: "OFF-02", code: "FREESHIP", title: "ফ্রি হোম ডেলিভারি কুপন", discount: "ফ্রি ডেলিভারি", discount_type: "free_shipping", discount_value: 100, min_spend: 2000, status: "Active" },
  { id: "OFF-03", code: "FESTIVE500", title: "ফেস্টিভ মেগা অফার ৳৫০০ ছাড়", discount: "৳৫০০ ফ্ল্যাট ছাড়", discount_type: "flat", discount_value: 500, min_spend: 5000, status: "Active" }
];

export function getGlobalSiteSettings() {
  let merged = { ...DEFAULT_SITE_SETTINGS };
  try {
    const raw = localStorage.getItem('dcbd_site_settings');
    if (raw) {
      merged = { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {}
  const resolvedLogo = resolveOfficialLogoUrl(merged.shopLogo || merged.shop_logo || merged.logo_url || merged.site_logo);
  merged.shopLogo = resolvedLogo;
  merged.shop_logo = resolvedLogo;
  merged.logo_url = resolvedLogo;
  merged.site_logo = resolvedLogo;
  merged.shopName = merged.shopName || merged.shop_name || "Dream Cart BD";
  merged.shop_name = merged.shopName;
  merged.tagline = merged.tagline || merged.shopTagline || "Smart Digital Commerce";
  return merged;
}

export function getGlobalPaymentMethods(onlyActive = false) {
  let list = DEFAULT_PAYMENT_METHODS;
  try {
    const raw = localStorage.getItem('dcbd_payment_methods');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
    }
  } catch (e) {}
  return onlyActive ? list.filter(m => (m.status || 'Active') === 'Active') : list;
}

export function getGlobalDeliveryMethods(onlyActive = false) {
  let list = DEFAULT_DELIVERY_METHODS;
  try {
    const raw = localStorage.getItem('dcbd_delivery_methods');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
    }
  } catch (e) {}
  return onlyActive ? list.filter(d => (d.status || 'Active') === 'Active') : list;
}

export function getGlobalOffers(onlyActive = false) {
  let list = DEFAULT_OFFERS;
  try {
    const raw = localStorage.getItem('dcbd_sheet_offers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
    }
  } catch (e) {}
  return onlyActive ? list.filter(o => (o.status || 'Active') === 'Active') : list;
}

class ApiClient {
  get products() {
    const list = this.getMergedLocalProducts();
    if (list && list.length > 0) return list;
    return INITIAL_PRODUCTS;
  }

  constructor() {
    this.endpoint = APPS_SCRIPT_URL;
    this.spreadsheetId = SPREADSHEET_ID;

    const ssrCache = (typeof window !== 'undefined' && window.__DCBD_SSR_CACHE__) ? window.__DCBD_SSR_CACHE__ : null;
    const savedProds = this.loadLocal('dcbd_sheet_products', null) || (ssrCache && Array.isArray(ssrCache.products) ? ssrCache.products : null);
    this.sheetProducts = (Array.isArray(savedProds) && savedProds.length > 0) ? savedProds : [];

    const savedCats = this.loadLocal('dcbd_sheet_categories', null);
    this.sheetCategories = (Array.isArray(savedCats) && savedCats.length > 0) ? savedCats : [];

    const savedBrands = this.loadLocal('dcbd_sheet_brands', null);
    this.sheetBrands = (Array.isArray(savedBrands) && savedBrands.length > 0) ? savedBrands : [];

    this.sheetOrders = this.loadLocal('dcbd_sheet_orders', []);
    this.sheetIncompleteOrders = this.loadLocal('dcbd_sheet_incomplete_orders', []);
    this.sheetBanners = this.loadLocal('dcbd_sheet_banners', []);
    this.sheetSellers = this.loadLocal('dcbd_sellers', []);
    this._productDetailsCache = new Map();
    this._lastProductsSync = 0;
    this._lastCategoriesSync = 0;
    this._lastBrandsSync = 0;
    this._hydratingDescriptions = false;
  }

  loadLocal(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  saveLocal(key, data) {
    try {
      // For dcbd_sheet_products (1,336+ rows), store compact catalog fields in localStorage so it never exceeds 5MB quota
      if (key === 'dcbd_sheet_products' && Array.isArray(data) && data.length > 50) {
        const compactList = data.map(p => {
          if (!p || typeof p !== 'object') return p;
          const copy = { ...p };
          if (copy.description && copy.description.length > 240) copy.description = copy.description.slice(0, 240);
          if (copy.specification && copy.specification.length > 240) copy.specification = copy.specification.slice(0, 240);
          if (copy.others && copy.others.length > 180) copy.others = copy.others.slice(0, 180);
          return copy;
        });
        localStorage.setItem(key, JSON.stringify(compactList));
        return;
      }
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      try {
        if (Array.isArray(data)) {
          const slim = data.map(item => {
            if (!item || typeof item !== 'object') return item;
            const copy = { ...item };
            delete copy.description;
            delete copy.specification;
            delete copy.others;
            if (typeof copy.thumbnail === 'string' && copy.thumbnail.length > 40000) {
              copy.thumbnail = DEFAULT_PRODUCT_THUMB;
            }
            if (Array.isArray(copy.images)) {
              copy.images = copy.images.map(u => (typeof u === 'string' && u.length > 40000 ? DEFAULT_PRODUCT_THUMB : u));
            }
            return copy;
          });
          localStorage.setItem(key, JSON.stringify(slim));
        }
      } catch (e2) {}
    }
  }

  /**
   * Always returns the latest synchronized product list across memory, localStorage, and Admin state.
   */
  getMergedLocalProducts() {
    if (Array.isArray(this.sheetProducts) && this.sheetProducts.length > 5 && this.sheetProducts.__normalized) {
      return this.sheetProducts;
    }

    const memProds = (Array.isArray(this.sheetProducts) && this.sheetProducts.length > 0) ? this.sheetProducts : null;
    const localStored = (!memProds || memProds.length <= 5) ? this.loadLocal('dcbd_sheet_products', null) : null;
    const adminProds = (typeof window !== 'undefined' && window.__adminState && Array.isArray(window.__adminState.products) && window.__adminState.products.length > 0)
      ? window.__adminState.products
      : null;

    let base = memProds;
    if ((!base || base.length <= 5) && Array.isArray(localStored) && localStored.length > (base ? base.length : 0)) {
      base = localStored;
    }
    if ((!base || base.length <= 5) && Array.isArray(adminProds) && adminProds.length > (base ? base.length : 0)) {
      base = adminProds;
    }

    if (Array.isArray(base) && base.length > 0) {
      if (base.__normalized) {
        this.sheetProducts = base;
        return base;
      }
      const normalized = base.map((p, idx) => {
        const norm = (p && p.sku && p.selling_price !== undefined && Array.isArray(p.images)) ? p : normalizeSheetProductRow(p, idx);
        if (norm && this._productDetailsCache.has(String(norm.sku).toLowerCase())) {
          Object.assign(norm, this._productDetailsCache.get(String(norm.sku).toLowerCase()));
        }
        return norm;
      }).filter(Boolean);
      if (normalized.length > 0) {
        Object.defineProperty(normalized, '__normalized', { value: true, enumerable: false });
        this.sheetProducts = normalized;
        return normalized;
      }
    }
    return [];
  }

  /**
   * Merge newly fetched Google Sheet products with locally added/updated products
   * so GViz caching NEVER causes products to disappear on alternating loads!
   */
  mergeProductsLists(sheetList = [], localList = []) {
    const deletedIds = new Set((this.loadLocal('dcbd_deleted_product_ids', []) || []).map(x => String(x || '').toLowerCase()));
    const localOverrides = this.loadLocal('dcbd_local_product_overrides', {}) || {};
    const livePatches = this.loadLocal('dcbd_live_product_patches', { updated: {}, deleted: [] }) || { updated: {}, deleted: [] };
    if (Array.isArray(livePatches.deleted)) {
      livePatches.deleted.forEach(k => deletedIds.add(String(k || '').toLowerCase()));
    }
    const patchUpdated = (livePatches && typeof livePatches.updated === 'object' && livePatches.updated) ? livePatches.updated : {};
    const allOverrides = { ...localOverrides, ...patchUpdated };

    const byId = new Map();
    const hasRealSheetRows = Array.isArray(sheetList) && sheetList.length > 5;

    // 1. First insert any cross-browser patched or locally overridden products
    Object.entries(allOverrides).forEach(([kLower, ov], idx) => {
      if (!ov || typeof ov !== 'object') return;
      const key = String(ov.sku || ov.product_id || kLower).trim().toLowerCase();
      if (!key || deletedIds.has(key)) return;
      const norm = normalizeSheetProductRow(ov, idx);
      if (norm) byId.set(key, norm);
    });

    (Array.isArray(localList) ? localList : []).forEach((p, idx) => {
      const norm = normalizeSheetProductRow(p, idx);
      if (!norm) return;
      const key = String(norm.sku || norm.product_id).trim().toLowerCase();
      if (deletedIds.has(key)) return;
      if (hasRealSheetRows && DEMO_SKUS.has(key) && !allOverrides[key]) return;
      if (allOverrides[key]) {
        byId.set(key, normalizeSheetProductRow({ ...norm, ...allOverrides[key] }, idx));
      } else if (!hasRealSheetRows) {
        byId.set(key, norm);
      }
    });

    // 2. Merge live sheet products
    (Array.isArray(sheetList) ? sheetList : []).forEach((p, idx) => {
      const norm = normalizeSheetProductRow(p, idx);
      if (!norm) return;
      const key = String(norm.sku || norm.product_id).trim().toLowerCase();
      if (deletedIds.has(key)) return;
      const existing = byId.get(key);
      const override = allOverrides[key];
      const cachedDetails = this._productDetailsCache.get(key);
      if (override) {
        byId.set(key, normalizeSheetProductRow({ ...norm, ...existing, ...override, ...(cachedDetails || {}) }, idx));
      } else if (existing || cachedDetails) {
        byId.set(key, {
          ...norm,
          description: norm.description || existing?.description || cachedDetails?.description || '',
          specification: norm.specification || existing?.specification || cachedDetails?.specification || '',
          others: norm.others || existing?.others || cachedDetails?.others || ''
        });
      } else {
        byId.set(key, norm);
      }
    });

    const result = Array.from(byId.values());
    return result.length > 0 ? result : [...INITIAL_PRODUCTS];
  }

  _syncProductPatchesToSettingsSheet(updatedMap = {}, deletedArr = []) {
    try {
      const currentPatch = this.loadLocal('dcbd_live_product_patches', { updated: {}, deleted: [] }) || { updated: {}, deleted: [] };
      const mergedUpdated = { ...(currentPatch.updated || {}), ...updatedMap };
      const mergedDeleted = Array.from(new Set([...(currentPatch.deleted || []), ...deletedArr].map(x => String(x || '').toLowerCase()).filter(Boolean)));
      mergedDeleted.forEach(delKey => { delete mergedUpdated[delKey]; });
      // Keep the 40 most recent product patches so the JSON stays compact (< 25KB) for Google Sheets Settings cell
      const entries = Object.entries(mergedUpdated).slice(-40);
      const compactUpdated = {};
      entries.forEach(([k, v]) => {
        if (!v || typeof v !== 'object') return;
        const copy = { ...v };
        if (copy.description && copy.description.length > 220) copy.description = copy.description.slice(0, 220);
        if (copy.specification && copy.specification.length > 220) copy.specification = copy.specification.slice(0, 220);
        if (copy.others && copy.others.length > 160) copy.others = copy.others.slice(0, 160);
        compactUpdated[k] = copy;
      });
      const nextPatch = { updated: compactUpdated, deleted: mergedDeleted.slice(-80), ts: Date.now() };
      this.saveLocal('dcbd_live_product_patches', nextPatch);
      sendToAppsScript('settings/save', {
        name: 'DCBD_LIVE_PRODUCT_PATCHES_JSON',
        details: JSON.stringify(nextPatch),
        activation: 'TRUE'
      }).catch(() => {});
    } catch (e) {}
  }

  _syncOrderPatchesToSettingsSheet(ordersList = [], deletedIdsArr = []) {
    try {
      const slimOrders = (Array.isArray(ordersList) ? ordersList : []).slice(0, 35).map(o => ({
        order_id: o.order_id,
        date: o.date,
        account_type: o.account_type,
        customer_name: o.customer_name,
        phone: o.phone,
        address: o.address,
        products: o.products,
        color: o.color,
        size: o.size,
        quantity: o.quantity,
        total_amount: o.total_amount,
        payment_method: o.payment_method,
        transaction_id: o.transaction_id,
        payment_status: o.payment_status,
        order_status: o.order_status,
        courier_name: o.courier_name,
        consignment_id: o.consignment_id,
        _local_created_ts: o._local_created_ts || o._sort_ts || Date.now(),
        _sort_ts: o._sort_ts || Date.now()
      }));
      const nextPatch = {
        orders: slimOrders,
        deleted: Array.from(new Set(deletedIdsArr.map(x => String(x || '').toLowerCase()).filter(Boolean))).slice(-60),
        ts: Date.now()
      };
      this.saveLocal('dcbd_live_order_patches', nextPatch);
      sendToAppsScript('settings/save', {
        name: 'DCBD_LIVE_ORDER_PATCHES_JSON',
        details: JSON.stringify(nextPatch),
        activation: 'TRUE'
      }).catch(() => {});
    } catch (e) {}
  }

  async _fetchAndMergeProductsLive(cached = []) {
    if (this._productsSyncPromise) return this._productsSyncPromise;
    this._lastProductsSync = Date.now();
    this._productsSyncPromise = (async () => {
      try {
        const rows = await fetchLiveSheetRows('Products', 'products/list', 6000);
        if (rows && rows.length > 0) {
          const sheetMapped = rows.map((r, idx) => normalizeSheetProductRow(r, idx)).filter(Boolean);
          if (sheetMapped.length > 0) {
            const prevSig = (Array.isArray(cached) ? cached : []).slice(0, 40).map(p => `${p.sku}:${p.selling_price}:${p.stock}:${p.status}:${p.name}`).join('|') + `::${(cached || []).length}`;
            const merged = this.mergeProductsLists(sheetMapped, cached || []);
            Object.defineProperty(merged, '__normalized', { value: true, enumerable: false });
            this.sheetProducts = merged;
            this.saveLocal('dcbd_sheet_products', merged);
            if (typeof window !== 'undefined') {
              if (window.__adminState) window.__adminState.products = merged;
              const nextSig = merged.slice(0, 40).map(p => `${p.sku}:${p.selling_price}:${p.stock}:${p.status}:${p.name}`).join('|') + `::${merged.length}`;
              if (prevSig !== nextSig) {
                window.dispatchEvent(new CustomEvent('dcbd:products-synced', { detail: { products: merged } }));
              }
            }
            return merged;
          }
        }
      } catch (err) {} finally {
        this._productsSyncPromise = null;
      }
      return cached;
    })();
    return this._productsSyncPromise;
  }

  async loadProductsFromSheet(forceRefresh = false) {
    const cached = this.getMergedLocalProducts();
    const hasRealSheetCached = Array.isArray(cached) && cached.length > 5 && !cached.every(p => DEMO_SKUS.has(String(p.sku || '').toLowerCase()));

    // INSTANT 0ms RETURN when cache is warm (e.g. after Admin login or repeat page view), syncing in background if stale!
    if (!forceRefresh && hasRealSheetCached) {
      if (Date.now() - this._lastProductsSync > 45000) {
        this._fetchAndMergeProductsLive(cached).catch(() => {});
      }
      return cached;
    }

    // Even when only initial/partial cache exists, bound network wait to 750ms so UI renders fast and updates via 'dcbd:products-synced'
    if (forceRefresh || !hasRealSheetCached) {
      const livePromise = this._fetchAndMergeProductsLive(cached);
      if (!forceRefresh) {
        const fastResult = await Promise.race([
          livePromise,
          new Promise(r => setTimeout(() => r(null), 750))
        ]);
        if (Array.isArray(fastResult) && fastResult.length > 0) return fastResult;
        if (Array.isArray(cached) && cached.length > 0) return cached;
      }
      const res = await livePromise;
      if (Array.isArray(res) && res.length > 0) return res;
    }

    return (Array.isArray(this.sheetProducts) && this.sheetProducts.length > 0)
      ? this.sheetProducts
      : (cached && cached.length > 0 ? cached : [...INITIAL_PRODUCTS]);
  }

  async syncProductsFromSheetAsync() {
    return this.loadProductsFromSheet(true);
  }

  /**
   * Fetch rich Description, Specification & Others (Columns O, P, Q) for a single product on demand (~150ms),
   * and also hydrate in background when needed.
   */
  async fetchSingleProductRichDetails(product) {
    if (!product || !product.sku) return product;
    const key = String(product.sku).trim().toLowerCase();
    if (this._productDetailsCache.has(key)) {
      return Object.assign(product, this._productDetailsCache.get(key));
    }
    if (product.description && product.description.length > 240) {
      return product;
    }

    try {
      const safeSku = String(product.sku).replace(/'/g, "\\'");
      const tq = `SELECT A,O,P,Q WHERE lower(A) = '${safeSku.toLowerCase()}' LIMIT 1`;
      const rows = await fetchSheetViaGviz('Products', 8000, tq);
      if (Array.isArray(rows) && rows.length > 0) {
        const r = rows[0];
        const details = {
          description: safeStr(r.description || r.Description || r.col_14 || product.description || ''),
          specification: safeStr(r.specification || r.Specification || r.col_15 || product.specification || ''),
          others: safeStr(r.others || r.Others || r.col_16 || product.others || '')
        };
        this._productDetailsCache.set(key, details);
        Object.assign(product, details);
      }
    } catch (e) {}
    return product;
  }

  hydrateProductDescriptionsInBackground() {
    // Rich descriptions (Columns O, P, Q) are fetched on-demand per product via fetchSingleProductRichDetails() in ~150ms.
    // Skipping the 14.5MB full-sheet background dump prevents main-thread freezes on Homepage and Admin Dashboard.
    this._hydratingDescriptions = true;
  }

  async loadCategoriesFromSheet(forceRefresh = false) {
    const cached = this.loadLocal('dcbd_sheet_categories', null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      this.sheetCategories = cached;
    }

    const hasRealCategories = Array.isArray(this.sheetCategories) &&
      this.sheetCategories.length > 4 &&
      !this.sheetCategories.every(c => ['CAT-001', 'CAT-002', 'CAT-003', 'CAT-004'].includes(c.catagory_id));

    if (!forceRefresh && Array.isArray(this.sheetCategories) && this.sheetCategories.length > 0) {
      if (!hasRealCategories || (Date.now() - this._lastCategoriesSync >= 60000)) {
        this._lastCategoriesSync = Date.now();
        fetchLiveSheetRows('Categories', 'categories/list', 6000).then(rows => {
          if (rows && rows.length > 0) {
            const finalCats = aggregateCategoryRows(rows, this.sheetCategories || []);
            if (finalCats.length > 0) {
              this.sheetCategories = finalCats;
              this.saveLocal('dcbd_sheet_categories', finalCats);
              if (typeof window !== 'undefined' && window.__adminState) window.__adminState.categories = finalCats;
            }
          }
        }).catch(() => {});
      }
      return this.sheetCategories;
    }

    try {
      const rows = await fetchLiveSheetRows('Categories', 'categories/list', 5000);
      if (rows && rows.length > 0) {
        const finalCats = aggregateCategoryRows(rows, this.sheetCategories || []);
        if (finalCats.length > 0) {
          this.sheetCategories = finalCats;
          this._lastCategoriesSync = Date.now();
          this.saveLocal('dcbd_sheet_categories', finalCats);
          if (typeof window !== 'undefined' && window.__adminState) {
            window.__adminState.categories = finalCats;
          }
          return finalCats;
        }
      }
    } catch (e) {}

    if (!this.sheetCategories || this.sheetCategories.length === 0) {
      this.sheetCategories = [...INITIAL_CATEGORIES];
      this.saveLocal('dcbd_sheet_categories', this.sheetCategories);
    }
    return this.sheetCategories;
  }

  async syncCategoriesFromSheetAsync() {
    return this.loadCategoriesFromSheet(true);
  }

  async loadBrandsFromSheet(forceRefresh = false) {
    const cached = this.loadLocal('dcbd_sheet_brands', null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      this.sheetBrands = cached;
    }

    const hasRealBrands = Array.isArray(this.sheetBrands) &&
      this.sheetBrands.length > 4 &&
      !this.sheetBrands.every(b => ['BRD-001', 'BRD-002', 'BRD-003', 'BRD-004'].includes(b.brand_id));

    if (!forceRefresh && Array.isArray(this.sheetBrands) && this.sheetBrands.length > 0) {
      if (!hasRealBrands || (Date.now() - this._lastBrandsSync >= 60000)) {
        this._lastBrandsSync = Date.now();
        fetchLiveSheetRows('Brands', 'brands/list', 6000).then(rows => {
          if (rows && rows.length > 0) {
            const mapped = rows.map((r, i) => ({
              brand_id: safeStr(r.brand_id || r.Brand_ID || r.col_0 || `BRD-${101 + i}`),
              brand_image: normalizeSingleImageUrl(r.brand_image || r.Brand_Image || r.col_1) || DEFAULT_PRODUCT_THUMB,
              brand_name: safeStr(r.brand_name || r.Brand_Name || r.col_2 || ''),
              brand_slug: safeStr(r.brand_slug || r.Brand_Slug || r.col_3) || safeStr(r.brand_name || r.Brand_Name || r.col_2 || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              brand_description: safeStr(r.brand_description || r.Brand_Description || r.col_4 || '')
            })).filter(b => b.brand_name && b.brand_name.toLowerCase() !== 'brand_name');
            if (mapped.length > 0) {
              this.sheetBrands = mapped;
              this.saveLocal('dcbd_sheet_brands', mapped);
              if (typeof window !== 'undefined' && window.__adminState) window.__adminState.brands = mapped;
            }
          }
        }).catch(() => {});
      }
      return this.sheetBrands;
    }

    try {
      const rows = await fetchLiveSheetRows('Brands', 'brands/list', 5000);
      if (rows && rows.length > 0) {
        const mapped = rows.map((r, i) => ({
          brand_id: safeStr(r.brand_id || r.Brand_ID || r.col_0 || `BRD-${101 + i}`),
          brand_image: normalizeSingleImageUrl(r.brand_image || r.Brand_Image || r.col_1) || DEFAULT_PRODUCT_THUMB,
          brand_name: safeStr(r.brand_name || r.Brand_Name || r.col_2 || ''),
          brand_slug: safeStr(r.brand_slug || r.Brand_Slug || r.col_3) || safeStr(r.brand_name || r.Brand_Name || r.col_2 || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          brand_description: safeStr(r.brand_description || r.Brand_Description || r.col_4 || '')
        })).filter(b => b.brand_name && b.brand_name.toLowerCase() !== 'brand_name');

        if (mapped.length > 0) {
          const byName = new Map();
          mapped.forEach(b => byName.set(String(b.brand_name).trim().toLowerCase(), b));
          (this.sheetBrands || []).forEach(b => {
            if (!b || !b.brand_name) return;
            if (mapped.length > 4 && ['BRD-001', 'BRD-002', 'BRD-003', 'BRD-004'].includes(b.brand_id)) return;
            const k = String(b.brand_name).trim().toLowerCase();
            byName.set(k, { ...(byName.get(k) || {}), ...b });
          });
          this.sheetBrands = Array.from(byName.values());
          this._lastBrandsSync = Date.now();
          this.saveLocal('dcbd_sheet_brands', this.sheetBrands);
          if (typeof window !== 'undefined' && window.__adminState) {
            window.__adminState.brands = this.sheetBrands;
          }
          return this.sheetBrands;
        }
      }
    } catch (e) {}

    if (!this.sheetBrands || this.sheetBrands.length === 0) {
      this.sheetBrands = [...INITIAL_BRANDS];
      this.saveLocal('dcbd_sheet_brands', this.sheetBrands);
    }
    return this.sheetBrands;
  }

  async syncBrandsFromSheetAsync() {
    return this.loadBrandsFromSheet(true);
  }

  async request(action, payloadOrMethod = {}, maybePayload = undefined) {
    let payload = payloadOrMethod;
    if (maybePayload !== undefined) {
      payload = maybePayload;
    } else if (typeof payloadOrMethod === 'string' && (payloadOrMethod === 'POST' || payloadOrMethod === 'GET')) {
      payload = {};
    }
    if (!payload || typeof payload !== 'object') {
      payload = {};
    }

    const cleanAction = String(action || '').trim().replace(/^[\-_\/]+|[\-_\/]+$/g, '');
    let normAction = cleanAction.replace('landing-pages', 'landing_pages');
    if (normAction === 'settings/save') normAction = 'settings/update';
    if (normAction === 'landing_pages/save') normAction = 'landing_pages/add';
    if (normAction.startsWith('others_market/')) normAction = normAction.replace('others_market/', 'markets/');

    switch (normAction) {
      case "products/list": {
        const products = await this.loadProductsFromSheet(Boolean(payload.force));
        let items = payload.include_inactive
          ? [...products]
          : products.filter(p => p.status !== 'নিষ্ক্রিয়' && p.is_active !== false);

        if (payload.category) {
          const catLower = String(payload.category).toLowerCase().trim();
          items = items.filter(p =>
            (p.category && String(p.category).toLowerCase() === catLower) ||
            (p.sub_category && String(p.sub_category).toLowerCase() === catLower) ||
            (p.child_category && String(p.child_category).toLowerCase() === catLower)
          );
        }
        if (payload.brand) {
          const brandLower = String(payload.brand).toLowerCase().trim();
          items = items.filter(p => p.brand && String(p.brand).toLowerCase() === brandLower);
        }
        if (payload.in_stock) {
          items = items.filter(p => Number(p.stock) > 0);
        }
        if (payload.search) {
          const q = String(payload.search).toLowerCase().trim();
          items = items.filter(p =>
            String(p.name || '').toLowerCase().includes(q) ||
            String(p.sku || '').toLowerCase().includes(q) ||
            String(p.brand || '').toLowerCase().includes(q) ||
            String(p.category || '').toLowerCase().includes(q)
          );
        }
        if (payload.sort === "low_high") {
          items.sort((a, b) => a.selling_price - b.selling_price);
        } else if (payload.sort === "high_low") {
          items.sort((a, b) => b.selling_price - a.selling_price);
        } else if (payload.sort === "name_asc") {
          items.sort((a, b) => String(a.name).localeCompare(String(b.name)));
        }

        return {
          success: true,
          data: {
            items: items,
            total: items.length
          }
        };
      }

      case "products/details": {
        const products = await this.loadProductsFromSheet();
        const rawTarget = (payload.id || payload.slug || payload.sku || '').toString().trim();
        const target = rawTarget.toLowerCase();
        let decodedTarget = target;
        try { decodedTarget = decodeURIComponent(target); } catch (e) {}

        let found = products.find(p => {
          const pId = (p.product_id || '').toString().trim().toLowerCase();
          const sku = (p.sku || '').toString().trim().toLowerCase();
          const slug = (p.slug || '').toString().trim().toLowerCase();
          const name = (p.name || p.p_name || '').toString().trim().toLowerCase();
          const normName = name.replace(/[^a-z0-9]+/g, '-');

          return pId === target || pId === decodedTarget ||
                 sku === target || sku === decodedTarget ||
                 slug === target || slug === decodedTarget ||
                 name === target || name === decodedTarget ||
                 normName === target || normName === decodedTarget;
        });

        if (!found) {
          found = products.find(p => {
            const pId = (p.product_id || '').toString().trim().toLowerCase();
            const slug = (p.slug || '').toString().trim().toLowerCase();
            return (slug && (target.includes(slug) || slug.includes(target))) ||
                   (pId && (target.includes(pId) || pId.includes(target)));
          });
        }

        if (found) {
          const key = String(found.sku || found.product_id || '').trim().toLowerCase();
          if (key && this._productDetailsCache.has(key)) {
            Object.assign(found, this._productDetailsCache.get(key));
          } else {
            // Hydrate essay columns O,P,Q in background without blocking "Order Now", "Add to Cart", or page render!
            this.fetchSingleProductRichDetails(found).then(enriched => {
              if (typeof document !== 'undefined' && enriched) {
                const descEl = document.getElementById('pd-live-desc');
                if (descEl && enriched.description) descEl.innerHTML = enriched.description;
                const specBox = document.getElementById('pd-live-spec-box');
                const specEl = document.getElementById('pd-live-spec-content');
                if (specEl && enriched.specification) {
                  specEl.innerHTML = enriched.specification;
                  if (specBox) specBox.style.display = '';
                }
                const othBox = document.getElementById('pd-live-others-box');
                const othEl = document.getElementById('pd-live-others-content');
                if (othEl && enriched.others) {
                  othEl.innerHTML = enriched.others;
                  if (othBox) othBox.style.display = '';
                }
              }
            }).catch(() => {});
          }
          return { success: true, data: found };
        }

        return { success: false, message: "পণ্য পাওয়া যায়নি" };
      }

      case "products/add":
      case "products/create":
      case "products/update": {
        const newProd = normalizeSheetProductRow({
          ...payload,
          sku: payload.sku || payload.SKU || payload.product_id || ("DCBD-" + Math.floor(1000 + Math.random() * 9000))
        });

        let current = this.getMergedLocalProducts() || [];
        const key = String(newProd.sku).trim().toLowerCase();
        const idx = current.findIndex(p => String(p.sku || p.product_id).trim().toLowerCase() === key);
        if (idx >= 0) {
          current[idx] = { ...current[idx], ...newProd };
        } else {
          current.unshift(newProd);
        }

        this._productDetailsCache.set(key, {
          description: newProd.description || '',
          specification: newProd.specification || '',
          others: newProd.others || ''
        });

        const overrides = this.loadLocal('dcbd_local_product_overrides', {});
        overrides[key] = newProd;
        this.saveLocal('dcbd_local_product_overrides', overrides);

        const deletedIds = new Set(this.loadLocal('dcbd_deleted_product_ids', []));
        if (deletedIds.has(key)) {
          deletedIds.delete(key);
          this.saveLocal('dcbd_deleted_product_ids', Array.from(deletedIds));
        }

        this.sheetProducts = current;
        this.saveLocal('dcbd_sheet_products', current);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.products = current;
        }

        const sheetPayload = {
          ...newProd,
          SKU: newProd.sku,
          P_Name: newProd.name,
          Category: newProd.category,
          Sub_Category: newProd.sub_category,
          Child_Category: newProd.child_category,
          Brand: newProd.brand,
          Buying_price: newProd.buying_price,
          Selling_Price: newProd.selling_price,
          Stock: newProd.stock,
          Original_Price: newProd.original_price,
          WholeSale_price: newProd.wholesale_price,
          Min_order_Q: newProd.min_order_q,
          Images: Array.isArray(newProd.images) ? newProd.images.join(', ') : String(newProd.images || newProd.thumbnail || ''),
          Slug: newProd.slug,
          Description: newProd.description,
          Specification: newProd.specification,
          Others: newProd.others,
          Color: newProd.color,
          Size: newProd.size,
          WEIGHT_KG: newProd.weight_kg,
          WIDTH_CM: newProd.width_cm,
          LENGTH_CM: newProd.length_cm,
          HEIGHT_CM: newProd.height_cm
        };

        this._syncProductPatchesToSettingsSheet({ [key]: newProd }, []);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dcbd:products-synced', { detail: { products: current } }));
        }
        await sendToAppsScript("products/add", sheetPayload);

        return {
          success: true,
          status: "success",
          message: "পণ্যটি তালিকা এবং গুগল শিটে সফলভাবে সংরক্ষিত হয়েছে!",
          data: newProd
        };
      }

      case "products/bulk_upsert":
      case "products/bulk_update":
      case "products/bulk_add": {
        const incoming = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.products) ? payload.products : []);
        if (incoming.length === 0) {
          return { success: false, message: "No products provided" };
        }
        let current = this.getMergedLocalProducts() || [];
        const bySku = new Map();
        current.forEach(p => {
          const k = String(p.sku || p.product_id || '').trim().toLowerCase();
          if (k) bySku.set(k, p);
        });
        const overrides = this.loadLocal('dcbd_local_product_overrides', {}) || {};
        const patchMap = {};
        const normalizedBatch = [];

        incoming.forEach((raw, idx) => {
          const sku = safeStr(raw.sku || raw.SKU || raw.product_id || `DCBD-BLK-${Date.now()}-${idx + 1}`);
          const k = sku.toLowerCase();
          const existing = bySku.get(k) || {};
          const norm = normalizeSheetProductRow({ ...existing, ...raw, sku, product_id: sku }, idx);
          if (norm) {
            bySku.set(k, norm);
            overrides[k] = norm;
            patchMap[k] = norm;
            normalizedBatch.push(norm);
          }
        });

        const nextList = Array.from(bySku.values());
        this.saveLocal('dcbd_local_product_overrides', overrides);
        this.sheetProducts = nextList;
        this.saveLocal('dcbd_sheet_products', nextList);
        if (typeof window !== 'undefined') {
          if (window.__adminState) window.__adminState.products = nextList;
          window.dispatchEvent(new CustomEvent('dcbd:products-synced', { detail: { products: nextList } }));
        }
        this._syncProductPatchesToSettingsSheet(patchMap, []);
        await sendToAppsScript("products/bulk_upsert", { items: normalizedBatch });
        return {
          success: true,
          status: "success",
          updated_count: normalizedBatch.length,
          data: { items: nextList, total: nextList.length }
        };
      }

      case "products/delete": {
        const idToDelete = String(payload.id || payload.sku || payload.slug || '').trim();
        const keyLower = idToDelete.toLowerCase();

        const deletedIds = new Set(this.loadLocal('dcbd_deleted_product_ids', []));
        deletedIds.add(keyLower);
        this.saveLocal('dcbd_deleted_product_ids', Array.from(deletedIds));

        const overrides = this.loadLocal('dcbd_local_product_overrides', {});
        delete overrides[keyLower];
        this.saveLocal('dcbd_local_product_overrides', overrides);

        let current = this.getMergedLocalProducts() || [];
        current = current.filter(p =>
          String(p.product_id || '').toLowerCase() !== keyLower &&
          String(p.sku || '').toLowerCase() !== keyLower &&
          String(p.slug || '').toLowerCase() !== keyLower
        );
        this.sheetProducts = current;
        this.saveLocal('dcbd_sheet_products', current);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.products = current;
        }

        this._syncProductPatchesToSettingsSheet({}, Array.from(deletedIds));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dcbd:products-synced', { detail: { products: current } }));
        }
        await sendToAppsScript("products/delete", payload);
        return { success: true, message: "পণ্যটি শিট ও তালিকা থেকে সরানো হয়েছে।" };
      }

      case "categories/list": {
        const categories = await this.loadCategoriesFromSheet(Boolean(payload.force));
        return {
          success: true,
          data: {
            items: categories,
            total: categories.length
          }
        };
      }

      case "categories/add":
      case "categories/create":
      case "categories/update": {
        const catId = safeStr(payload.catagory_id || payload.Catagory_ID || payload.id || ("CAT-" + Math.floor(1000 + Math.random() * 9000)));
        const catName = safeStr(payload.category || payload.Category || payload.name || "Category");
        const catSlug = safeStr(payload.catagory_slug || payload.Catagory_Slug || payload.slug || catName.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        const catImg = normalizeSingleImageUrl(payload.category_image || payload.Category_Image || payload.image) || DEFAULT_PRODUCT_THUMB;
        const subCat = safeStr(payload.sub_category || payload.Sub_Category || "General");
        const childCat = safeStr(payload.chail_category || payload.Chail_Category || payload.child_category || "Standard");

        const newCat = {
          catagory_id: catId,
          Catagory_ID: catId,
          catagory_slug: catSlug,
          Catagory_Slug: catSlug,
          category_image: catImg,
          Category_Image: catImg,
          category: catName,
          Category: catName,
          sub_category: subCat,
          Sub_Category: subCat,
          chail_category: childCat,
          Chail_Category: childCat,
          tree_subs: payload.tree_subs || undefined
        };

        if (!this.sheetCategories || this.sheetCategories.length === 0) {
          this.sheetCategories = this.loadLocal('dcbd_sheet_categories', []);
        }
        const existingIdx = this.sheetCategories.findIndex(c =>
          String(c.catagory_id || '').toLowerCase() === catId.toLowerCase() ||
          String(c.category || '').toLowerCase() === catName.toLowerCase() ||
          (payload.old_category && String(c.category || '').toLowerCase() === String(payload.old_category).toLowerCase())
        );
        if (existingIdx >= 0) {
          this.sheetCategories[existingIdx] = { ...this.sheetCategories[existingIdx], ...newCat };
        } else {
          this.sheetCategories.unshift(newCat);
        }
        this.saveLocal('dcbd_sheet_categories', this.sheetCategories);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.categories = this.sheetCategories;
        }

        await sendToAppsScript("categories/add", { ...newCat, old_category: payload.old_category });
        return { success: true, status: "success", message: "ক্যাটাগরি তালিকা ও গুগল শিটে যুক্ত হয়েছে!", data: newCat };
      }

      case "categories/delete": {
        const id = String(payload.id || payload.catagory_id || payload.category || '').trim().toLowerCase();
        if (this.sheetCategories) {
          this.sheetCategories = this.sheetCategories.filter(c =>
            String(c.catagory_id || '').toLowerCase() !== id &&
            String(c.category || '').toLowerCase() !== id
          );
          this.saveLocal('dcbd_sheet_categories', this.sheetCategories);
          if (typeof window !== 'undefined' && window.__adminState) {
            window.__adminState.categories = this.sheetCategories;
          }
        }
        await sendToAppsScript("categories/delete", payload);
        return { success: true, message: "ক্যাটাগরি মুছে ফেলা হয়েছে।" };
      }

      case "brands/list": {
        const brands = await this.loadBrandsFromSheet(Boolean(payload.force));
        return {
          success: true,
          data: {
            items: brands,
            total: brands.length
          }
        };
      }

      case "brands/add":
      case "brands/create":
      case "brands/update": {
        const bId = safeStr(payload.brand_id || payload.Brand_ID || payload.id || ("BRD-" + Math.floor(1000 + Math.random() * 9000)));
        const bName = safeStr(payload.brand_name || payload.Brand_Name || payload.name || "Brand");
        const bSlug = safeStr(payload.brand_slug || payload.Brand_Slug || payload.slug || bName.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        const bImg = normalizeSingleImageUrl(payload.brand_image || payload.Brand_Image || payload.image) || DEFAULT_PRODUCT_THUMB;
        const bDesc = safeStr(payload.brand_description || payload.Brand_Description || payload.description || "");

        const newBrand = {
          brand_id: bId,
          Brand_ID: bId,
          brand_name: bName,
          Brand_Name: bName,
          brand_slug: bSlug,
          Brand_Slug: bSlug,
          brand_image: bImg,
          Brand_Image: bImg,
          brand_description: bDesc,
          Brand_Description: bDesc
        };

        if (!this.sheetBrands || this.sheetBrands.length === 0) {
          this.sheetBrands = this.loadLocal('dcbd_sheet_brands', []);
        }
        const idx = this.sheetBrands.findIndex(b =>
          String(b.brand_id || '').toLowerCase() === bId.toLowerCase() ||
          String(b.brand_name || '').toLowerCase() === bName.toLowerCase()
        );
        if (idx >= 0) {
          this.sheetBrands[idx] = { ...this.sheetBrands[idx], ...newBrand };
        } else {
          this.sheetBrands.unshift(newBrand);
        }
        this.saveLocal('dcbd_sheet_brands', this.sheetBrands);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.brands = this.sheetBrands;
        }
        await sendToAppsScript("brands/add", newBrand);
        return { success: true, status: "success", message: "ব্র্যান্ড তালিকা ও শিটে যুক্ত হয়েছে!", data: newBrand };
      }

      case "brands/delete": {
        const id = String(payload.id || payload.brand_id || payload.brand_name || '').trim().toLowerCase();
        if (this.sheetBrands) {
          this.sheetBrands = this.sheetBrands.filter(b =>
            String(b.brand_id || '').toLowerCase() !== id &&
            String(b.brand_name || '').toLowerCase() !== id
          );
          this.saveLocal('dcbd_sheet_brands', this.sheetBrands);
          if (typeof window !== 'undefined' && window.__adminState) {
            window.__adminState.brands = this.sheetBrands;
          }
        }
        await sendToAppsScript("brands/delete", payload);
        return { success: true, message: "ব্র্যান্ড মুছে ফেলা হয়েছে।" };
      }

      // --- LANDING PAGES ---
      case "landing_pages/list": {
        let localPages = this.loadLocal('dcbd_landing_pages', null) || [];
        try {
          const rows = await fetchLiveSheetRows('Landing-Pages', 'landing_pages/list', 10000);
          if (rows && rows.length > 0) {
            const sheetPages = rows.map((r, i) => {
              let parsedMeta = {};
              const rawJson = r.social_icons || r.Social_Icons || r.content || r.col_9 || r.col_3 || '';
              if (typeof rawJson === 'string' && rawJson.trim().startsWith('{')) {
                try { parsedMeta = JSON.parse(rawJson); } catch (e) {}
              }
              const slugVal = safeStr(r.slug || r.Slug || r.col_0 || parsedMeta.slug || `lp-${101 + i}`);
              const titleVal = safeStr(r.slogan || r.Slogan || r.title || r.col_1 || parsedMeta.title || 'ক্যাম্পেইন ল্যান্ডিং পেজ');
              const prodImgs = parseImageUrlsList(r.product_images || r.Product_Images || r.banner || r.col_4 || parsedMeta.hero_banner);
              const prodList = r.products || r.Products || r.col_3 || parsedMeta.selected_products || '';
              const selectedProducts = Array.isArray(prodList)
                ? prodList
                : String(prodList).split(',').map(s => s.trim()).filter(Boolean);

              return {
                id: safeStr(parsedMeta.id || parsedMeta.page_id || r.page_id || `LP-${101 + i}`),
                page_id: safeStr(parsedMeta.id || parsedMeta.page_id || r.page_id || `LP-${101 + i}`),
                title: titleVal,
                slug: slugVal,
                main_link: safeStr(r.main_link || r.Main_Link || r.col_2 || `/landing?page=${slugVal}`),
                hero_banner: prodImgs[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
                selected_products: selectedProducts,
                hotline: safeStr(r.contact_call || r.Contact_Call || r.col_6 || parsedMeta.hotline || '01581703822'),
                whatsapp: safeStr(r.contact_whatsapp || r.Contact_Whatsapp || r.col_7 || '01581703822'),
                email: safeStr(r.contact_mail || r.Contact_Mail || r.col_8 || 'jainal.dcitbd@gmail.com'),
                status: safeStr(r.status || r.Status || r.col_10 || r.col_5 || 'Active'),
                ...parsedMeta
              };
            }).filter(lp => lp.slug && lp.slug.toLowerCase() !== 'slug');

            const bySlug = new Map();
            sheetPages.forEach(lp => bySlug.set(String(lp.slug || lp.id).toLowerCase(), lp));
            (localPages || []).forEach(lp => {
              const k = String(lp.slug || lp.id).toLowerCase();
              bySlug.set(k, { ...(bySlug.get(k) || {}), ...lp });
            });
            localPages = Array.from(bySlug.values());
            this.saveLocal('dcbd_landing_pages', localPages);
            if (typeof window !== 'undefined' && window.__adminState) {
              window.__adminState.landingPages = localPages;
            }
          }
        } catch (e) {}
        return { success: true, data: { items: localPages || [], total: (localPages || []).length } };
      }

      case "landing_pages/add":
      case "landing_pages/create":
      case "landing_pages/update": {
        const pageId = safeStr(payload.page_id || payload.id || ("LP-" + Math.floor(100 + Math.random() * 900)));
        const title = safeStr(payload.title || payload.slogan || payload.Slogan || "ক্যাম্পেইন ল্যান্ডিং পেজ");
        const slug = safeStr(payload.slug || payload.Slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        const selectedSkus = payload.selected_products || payload.selected_skus || [];
        const heroBanner = normalizeSingleImageUrl(payload.hero_banner || payload.banner || '');

        const sheetPayload = {
          ...payload,
          id: pageId,
          page_id: pageId,
          Slug: slug,
          slug: slug,
          Slogan: title,
          title: title,
          Main_Link: `/landing?page=${slug}`,
          Products: Array.isArray(selectedSkus) ? selectedSkus.join(', ') : String(selectedSkus || ''),
          Product_Images: heroBanner,
          Review_Images: Array.isArray(payload.videos) ? payload.videos.map(v => typeof v === 'string' ? v : v.url).filter(Boolean).join(' | ') : '',
          Contact_Call: safeStr(payload.hotline || '01581703822'),
          Contact_Whatsapp: safeStr(payload.hotline || '01581703822'),
          Contact_Mail: 'jainal.dcitbd@gmail.com',
          Status: safeStr(payload.status || 'Active')
        };

        await sendToAppsScript("landing_pages/add", sheetPayload);
        return { success: true, status: "success", data: sheetPayload, message: "ল্যান্ডিং পেজ তালিকা ও গুগল শিটে সংরক্ষিত হয়েছে!" };
      }

      case "landing_pages/delete": {
        await sendToAppsScript("landing_pages/delete", payload);
        return { success: true, status: "success" };
      }

      // --- ORDERS ---
      case "orders/get":
      case "orders/details": {
        const queryId = (payload.orderId || payload.order_id || payload.id || payload.phone || '').toString().trim().toLowerCase();
        const listRes = await this.request("orders/list");
        const orders = listRes?.data?.items || [];

        const matched = orders.find(o => {
          const oId = (o.order_id || o.orderId || '').toString().trim().toLowerCase();
          const oPhone = normalizeBDPhone(o.phone || '');
          const qPhone = normalizeBDPhone(queryId);
          return (queryId && (oId === queryId || (qPhone && oPhone === qPhone)));
        });

        if (matched) {
          return { success: true, data: matched };
        }
        return { success: false, message: "অর্ডার পাওয়া যায়নি" };
      }

      case "orders/create":
      case "orders/add": {
        const orderId = safeStr(payload.order_id || payload.orderId || payload.OrderID || ("ORD-" + Math.floor(100000 + Math.random() * 900000)));
        const dateStr = payload.date || payload.Date || new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Dhaka' });

        let productsDesc = safeStr(payload.products || payload.Products || payload.product_name || '');
        let colorStr = safeStr(payload.color || payload.Color || '');
        let sizeStr = safeStr(payload.size || payload.Size || '');
        let totalQty = safeNumber(payload.quantity || payload.Quantity, 0);

        if (Array.isArray(payload.items) && payload.items.length > 0) {
          if (!productsDesc) {
            productsDesc = payload.items.map(it => {
              const v = [it.size ? `Size: ${it.size}` : '', it.color ? `Color: ${it.color}` : ''].filter(Boolean).join(', ');
              return `${it.name || it.p_name || 'পণ্য'}${v ? ` (${v})` : ''} x${it.quantity || 1}`;
            }).join(' | ');
          }
          if (!colorStr) {
            colorStr = payload.items.map(it => it.color || 'Standard').join(', ');
          }
          if (!sizeStr) {
            sizeStr = payload.items.map(it => it.size || 'Free Size').join(', ');
          }
          if (!totalQty) {
            totalQty = payload.items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
          }
        }
        if (!productsDesc) productsDesc = 'পণ্য অর্ডার';
        if (!totalQty) totalQty = 1;

        const orderData = normalizeSheetOrderRow({
          ...payload,
          order_id: orderId,
          OrderID: orderId,
          date: dateStr,
          Date: dateStr,
          products: productsDesc,
          Products: productsDesc,
          product_name: productsDesc,
          color: colorStr || 'Standard',
          Color: colorStr || 'Standard',
          size: sizeStr || 'Free Size',
          Size: sizeStr || 'Free Size',
          quantity: totalQty,
          Quantity: totalQty,
          account_type: payload.account_type || 'Customer',
          Account_type: payload.account_type || 'Customer',
          payment_method: payload.payment_method || 'Cash On Delivery (COD)',
          Payment_method: payload.payment_method || 'Cash On Delivery (COD)',
          transaction_id: payload.transaction_id || 'COD',
          Transaction_ID: payload.transaction_id || 'COD',
          payment_status: payload.payment_status || (String(payload.payment_method || '').toLowerCase().includes('cod') || String(payload.payment_method || '').toLowerCase().includes('cash') ? 'Pending' : 'Paid'),
          order_status: payload.order_status || 'Order Placed'
        });

        let localOrders = this.loadLocal('dcbd_sheet_orders', []);
        let maxSheetRow = 1;
        (Array.isArray(localOrders) ? localOrders : []).forEach(o => {
          const rIdx = Number(o && o._sheet_row_idx ? o._sheet_row_idx : 0);
          if (rIdx > maxSheetRow) maxSheetRow = rIdx;
        });

        const createdMs = Date.now();
        orderData._local_created_ts = createdMs;
        orderData._updated_ts = createdMs;
        orderData._sheet_row_idx = maxSheetRow + 1;
        orderData._sort_ts = parseOrderSortTimestamp(orderData, 0);

        let delArr = [];
        try {
          const delSet = new Set(this.loadLocal('dcbd_deleted_order_ids', []));
          delSet.delete(orderId.toLowerCase());
          delArr = Array.from(delSet);
          this.saveLocal('dcbd_deleted_order_ids', delArr);
        } catch (e) {}

        localOrders = deduplicateAndSortOrdersNewestFirst([orderData, ...(Array.isArray(localOrders) ? localOrders : [])]);
        this.sheetOrders = localOrders;
        this.saveLocal('dcbd_sheet_orders', localOrders);
        try {
          localStorage.setItem('dcbd_last_order', JSON.stringify(orderData));
        } catch (e) {}
        if (typeof window !== 'undefined') {
          if (window.__adminState) window.__adminState.orders = localOrders;
          if (window.refreshAdminOrdersTableDOM) window.refreshAdminOrdersTableDOM();
          window.dispatchEvent(new CustomEvent('dcbd:orders-synced', { detail: { orders: localOrders } }));
        }

        if (orderData.phone) {
          const normP = normalizeBDPhone(orderData.phone);
          let incList = this.loadLocal('dcbd_sheet_incomplete_orders', []);
          incList = incList.filter(io => normalizeBDPhone(io.phone) !== normP);
          this.sheetIncompleteOrders = incList;
          this.saveLocal('dcbd_sheet_incomplete_orders', incList);
          if (typeof window !== 'undefined' && window.__adminState) {
            window.__adminState.incompleteOrders = incList;
          }
        }

        // Slim items array for fast, reliable <60KB network sync (supports fetch keepalive)
        const slimItems = Array.isArray(payload.items)
          ? payload.items.map(it => ({
              product_id: it.product_id || it.sku || '',
              sku: it.sku || it.product_id || '',
              name: it.name || it.p_name || it.title || 'পণ্য',
              price: Number(it.price || it.selling_price || 0),
              quantity: Number(it.quantity || it.qty || 1),
              color: it.color || 'Standard',
              size: it.size || 'Free Size',
              subtotal: Number(it.subtotal || (Number(it.price || 0) * Number(it.quantity || 1)))
            }))
          : [];
        const syncPayload = { ...payload, ...orderData, items: slimItems };

        // Non-blocking background sync with keepalive:true so order placement finishes in 0ms!
        sendToAppsScript("orders/create", syncPayload).catch(() => {});
        setTimeout(() => {
          try {
            this._syncOrderPatchesToSettingsSheet(localOrders, delArr);
          } catch (e) {}
        }, 0);

        return {
          success: true,
          status: "success",
          data: orderData,
          message: "অর্ডার সফলভাবে তালিকা ও গুগল শিটে জমা হয়েছে!"
        };
      }

      case "orders/update":
      case "orders/update_status": {
        const orderId = safeStr(payload.order_id || payload.orderId || payload.id);
        let localOrders = this.loadLocal('dcbd_sheet_orders', []);
        const updTs = Date.now();
        localOrders = localOrders.map(o => {
          if (String(o.order_id || o.orderId).toLowerCase() === orderId.toLowerCase()) {
            const updated = { ...o, ...payload, _updated_ts: updTs };
            if (payload.status && !payload.order_status) updated.order_status = payload.status;
            if (updated.order_status === 'Delivered' || updated.order_status === 'Success') updated.payment_status = 'Paid';
            return updated;
          }
          return o;
        });
        localOrders = deduplicateAndSortOrdersNewestFirst(localOrders);
        this.sheetOrders = localOrders;
        this.saveLocal('dcbd_sheet_orders', localOrders);
        if (typeof window !== 'undefined') {
          if (window.__adminState) window.__adminState.orders = localOrders;
          if (window.refreshAdminOrdersTableDOM) window.refreshAdminOrdersTableDOM();
        }

        this._syncOrderPatchesToSettingsSheet(localOrders, this.loadLocal('dcbd_deleted_order_ids', []) || []);
        sendToAppsScript("orders/update_status", payload).catch(() => {});
        return { success: true, status: "success", message: "অর্ডার আপডেট হয়েছে!" };
      }

      case "orders/delete": {
        const orderId = safeStr(payload.order_id || payload.orderId || payload.id);
        let delArr = [];
        try {
          const delSet = new Set(this.loadLocal('dcbd_deleted_order_ids', []));
          if (orderId) delSet.add(orderId.toLowerCase());
          delArr = Array.from(delSet);
          this.saveLocal('dcbd_deleted_order_ids', delArr);
        } catch (e) {}
        let localOrders = this.loadLocal('dcbd_sheet_orders', []);
        localOrders = localOrders.filter(o => String(o.order_id || o.orderId).toLowerCase() !== orderId.toLowerCase());
        this.sheetOrders = localOrders;
        this.saveLocal('dcbd_sheet_orders', localOrders);
        if (typeof window !== 'undefined') {
          if (window.__adminState) window.__adminState.orders = localOrders;
          if (window.refreshAdminOrdersTableDOM) window.refreshAdminOrdersTableDOM();
        }
        this._syncOrderPatchesToSettingsSheet(localOrders, delArr);
        await sendToAppsScript("orders/delete", { order_id: orderId });
        return { success: true, status: "success" };
      }

      case "orders/list": {
        const liveOrdPatch = this.loadLocal('dcbd_live_order_patches', { orders: [], deleted: [] }) || { orders: [], deleted: [] };
        const delSet = new Set([
          ...(this.loadLocal('dcbd_deleted_order_ids', []) || []),
          ...(Array.isArray(liveOrdPatch.deleted) ? liveOrdPatch.deleted : [])
        ].map(x => String(x || '').toLowerCase()));
        const patchOrders = (Array.isArray(liveOrdPatch.orders) ? liveOrdPatch.orders : []).map((o, i) => normalizeSheetOrderRow(o, i)).filter(Boolean);
        const localOrders = (this.loadLocal('dcbd_sheet_orders', []) || []).map((o, i) => normalizeSheetOrderRow(o, i)).filter(Boolean);
        let remoteOrders = [];
        try {
          const rows = await fetchLiveSheetRows('Orders', 'orders/list', 4500);
          if (rows && rows.length > 0) {
            const normRows = normalizeOrderSheetRowIndices(rows, []);
            remoteOrders = normRows.map((r, i) => normalizeSheetOrderRow(r, i)).filter(Boolean);
          }
        } catch (e) {}

        // Merge live cross-browser patched orders + local + remote (PHP/Python server + Google Sheet Orders) and sort Newest-First!
        const merged = deduplicateAndSortOrdersNewestFirst([...patchOrders, ...localOrders, ...remoteOrders], delSet);
        if (merged.length > 0) {
          this.sheetOrders = merged;
          this.saveLocal('dcbd_sheet_orders', merged);
          if (typeof window !== 'undefined') {
            if (window.__adminState) window.__adminState.orders = merged;
            if (window.refreshAdminOrdersTableDOM) window.refreshAdminOrdersTableDOM();
            window.dispatchEvent(new CustomEvent('dcbd:orders-synced', { detail: { orders: merged } }));
          }
        }
        return { success: true, data: { items: merged, total: merged.length } };
      }

      // --- INCOMPLETE ORDERS ---
      case "incomplete_orders/create":
      case "incomplete_orders/add": {
        const phone = safeStr(payload.phone || '');
        const normP = normalizeBDPhone(phone);
        let incList = (this.loadLocal('dcbd_sheet_incomplete_orders', []) || []).map((r, i) => normalizeIncompleteOrderRow(r, i)).filter(Boolean);

        const existingIdx = normP ? incList.findIndex(io => normalizeBDPhone(io.phone) === normP) : -1;
        const incId = existingIdx >= 0
          ? incList[existingIdx].order_id
          : safeStr(payload.order_id || ("INC-" + Math.floor(100000 + Math.random() * 900000)));

        const incItem = normalizeIncompleteOrderRow({
          date: payload.date || new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Dhaka' }),
          order_id: incId,
          account_type: payload.account_type || 'Customer',
          customer_name: payload.customer_name || 'সম্ভাব্য গ্রাহক',
          phone: phone,
          address: payload.address || '',
          products: payload.products || 'চেকআউট ফর্ম পূরণরত',
          total_amount: safeNumber(payload.total_amount, 0),
          status: payload.status || 'Draft/Incomplete'
        });

        if (existingIdx >= 0) {
          incList[existingIdx] = incItem;
        } else {
          incList.unshift(incItem);
        }

        this.sheetIncompleteOrders = incList;
        this.saveLocal('dcbd_sheet_incomplete_orders', incList);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.incompleteOrders = incList;
        }

        sendToAppsScript("incomplete_orders/create", incItem).catch(() => {});
        return { success: true, status: "success", data: incItem };
      }

      case "incomplete_orders/list": {
        const localInc = (this.loadLocal('dcbd_sheet_incomplete_orders', []) || []).map((r, i) => normalizeIncompleteOrderRow(r, i)).filter(Boolean);
        let sheetInc = [];
        try {
          const rows = await fetchLiveSheetRows('Incomplete_Orders', 'incomplete_orders/list', 10000);
          if (rows && rows.length > 0) {
            sheetInc = rows.map((r, i) => normalizeIncompleteOrderRow(r, i)).filter(Boolean);
            sheetInc.reverse();
          }
        } catch (e) {}

        // Deduplicate by phone or order_id
        const byKey = new Map();
        localInc.forEach(io => {
          const k = normalizeBDPhone(io.phone) || String(io.order_id).toLowerCase();
          if (k) byKey.set(k, io);
        });
        sheetInc.forEach(io => {
          const k = normalizeBDPhone(io.phone) || String(io.order_id).toLowerCase();
          if (k && !byKey.has(k)) byKey.set(k, io);
        });

        const merged = Array.from(byKey.values());
        if (merged.length > 0) {
          this.sheetIncompleteOrders = merged;
          this.saveLocal('dcbd_sheet_incomplete_orders', merged);
          if (typeof window !== 'undefined' && window.__adminState) {
            window.__adminState.incompleteOrders = merged;
          }
        }
        return { success: true, data: { items: merged, total: merged.length } };
      }

      case "incomplete_orders/delete": {
        const id = safeStr(payload.order_id || payload.id || '');
        let incList = this.loadLocal('dcbd_sheet_incomplete_orders', []);
        incList = incList.filter(io => String(io.order_id) !== id);
        this.sheetIncompleteOrders = incList;
        this.saveLocal('dcbd_sheet_incomplete_orders', incList);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.incompleteOrders = incList;
        }
        await sendToAppsScript("incomplete_orders/delete", { order_id: id });
        return { success: true };
      }

      // --- CUSTOMERS ---
      case "customers/register":
      case "customers/create":
      case "customers/add":
      case "customers/update": {
        const phone = normalizeBDPhone(payload.Mobile || payload.mobile || payload.phone || '');
        const email = String(payload.Mail || payload.mail || payload.email || '').trim().toLowerCase();
        const name = String(payload.Name || payload.name || '').trim();
        const password = String(payload.Password || payload.password || '123456').trim();
        const address = String(payload.Address || payload.address || '').trim();
        const profilePhoto = normalizeSingleImageUrl(payload.Profile_photo || payload.profile_photo || '');
        const isManualAdmin = !!payload.is_admin_manual || !!payload.allow_update;

        if (!name) {
          return { success: false, status: 'error', message: 'অনুগ্রহ করে পূর্ণ নাম প্রদান করুন।' };
        }
        if (!phone || phone.length < 11) {
          return { success: false, status: 'error', message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।' };
        }
        if (!isManualAdmin && (!password || password.length < 4)) {
          return { success: false, status: 'error', message: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
        }
        if (!isManualAdmin && !address) {
          return { success: false, status: 'error', message: 'অনুগ্রহ করে ডেলিভারি ও যোগাযোগের সম্পূর্ণ ঠিকানা প্রদান করুন।' };
        }

        let existingList = this.sheetCustomers || this.loadLocal('dcbd_sheet_customers', []) || [];
        if (!isManualAdmin) {
          try {
            const rows = await fetchSheetViaGviz('Customers', 8000);
            if (Array.isArray(rows) && rows.length > 0) existingList = rows;
          } catch (e) {}

          const isDuplicate = existingList.some(c => {
            const cPhone = normalizeBDPhone(c.mobile || c.Mobile || c.phone || c.col_3 || '');
            const cMail = String(c.mail || c.Mail || c.email || c.col_4 || '').trim().toLowerCase();
            return (phone && cPhone === phone) || (email && cMail && cMail === email);
          });

          if (isDuplicate) {
            return {
              success: false,
              status: 'error',
              message: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগইন করুন।'
            };
          }
        }

        const generatedUserId = safeStr(payload.Customer_ID || payload.USER_ID || payload.user_id || ('CUST-' + Math.floor(100000 + Math.random() * 900000)));
        const customerData = {
          Customer_ID: generatedUserId,
          USER_ID: generatedUserId,
          user_id: generatedUserId,
          Profile_photo: profilePhoto,
          profile_photo: profilePhoto,
          Name: name,
          name: name,
          Mobile: phone,
          mobile: phone,
          phone: phone,
          Mail: email,
          mail: email,
          email: email,
          Address: address || 'বাংলাদেশ',
          address: address || 'বাংলাদেশ',
          User_ID: generatedUserId,
          Password: password,
          password: password,
          Status: payload.Status || payload.status || 'Active',
          status: payload.Status || payload.status || 'Active',
          Success_order: safeNumber(payload.success_order, 0),
          success_order: safeNumber(payload.success_order, 0),
          Cancel_Order: safeNumber(payload.cancel_order, 0),
          cancel_order: safeNumber(payload.cancel_order, 0),
          Total_Order: safeNumber(payload.total_order, 0),
          total_order: safeNumber(payload.total_order, 0),
          total_spent: safeNumber(payload.total_spent, 0),
          Order_Success_Rate: payload.order_success_rate || '100%',
          order_success_rate: payload.order_success_rate || '100%',
          account_type: 'CUSTOMER',
          role: 'Customer',
          is_admin_manual: isManualAdmin
        };

        if (!this.sheetCustomers) this.sheetCustomers = this.loadLocal('dcbd_sheet_customers', []);
        const idx = this.sheetCustomers.findIndex(c =>
          normalizeBDPhone(c.mobile || c.Mobile || c.phone || c.col_3 || '') === phone ||
          String(c.user_id || c.USER_ID || c.col_0 || '') === generatedUserId
        );
        if (idx >= 0) {
          this.sheetCustomers[idx] = { ...this.sheetCustomers[idx], ...customerData };
        } else {
          this.sheetCustomers.unshift(customerData);
        }
        this.saveLocal('dcbd_sheet_customers', this.sheetCustomers);

        const local = this.loadLocal('dcbd_customers', []);
        const lIdx = local.findIndex(c => normalizeBDPhone(c.mobile || c.phone || '') === phone);
        if (lIdx >= 0) local[lIdx] = { ...local[lIdx], ...customerData };
        else local.unshift(customerData);
        this.saveLocal('dcbd_customers', local);

        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.customers = this.sheetCustomers;
        }

        await sendToAppsScript('customers/register', customerData);

        return {
          success: true,
          status: 'success',
          data: customerData,
          message: 'কাস্টমার তথ্য সফলভাবে তালিকা এবং গুগল শিটে সংরক্ষিত হয়েছে!'
        };
      }

      case "customers/login": {
        const queryId = String(payload.phone || payload.mobile || payload.identifier || payload.mail || payload.email || payload.username || '').trim();
        const queryPass = String(payload.password || '').trim();
        const normPhone = normalizeBDPhone(queryId);
        const normMail = queryId.toLowerCase();

        if (!queryId || !queryPass) {
          return {
            success: false,
            status: 'error',
            message: 'মোবাইল নম্বর/ইমেইল এবং পাসওয়ার্ড উভয়ই প্রদান করুন।'
          };
        }

        let customers = [];
        try {
          const rows = await fetchSheetViaGviz('Customers', 10000);
          if (Array.isArray(rows) && rows.length > 0) {
            customers = rows;
            this.sheetCustomers = rows;
            this.saveLocal('dcbd_sheet_customers', rows);
          }
        } catch (e) {}

        if (!customers || customers.length === 0) {
          customers = this.sheetCustomers || this.loadLocal('dcbd_sheet_customers', []) || [];
        }
        const localRegistered = this.loadLocal('dcbd_customers', []) || [];
        const allCandidates = [...localRegistered, ...customers];

        let matched = allCandidates.find(c => {
          const cMobile = normalizeBDPhone(c.mobile || c.Mobile || c.phone || c.Phone || c.col_3 || '');
          const cMail = String(c.mail || c.Mail || c.email || c.Email || c.col_4 || '').trim().toLowerCase();
          const cUserIdA = String(c.customer_id || c.Customer_ID || c.user_id || c.USER_ID || c.col_0 || '').trim().toLowerCase();
          const cUserIdG = String(c.User_ID || c.col_6 || '').trim().toLowerCase();

          return (normPhone && cMobile === normPhone) ||
                 (normMail && cMail === normMail) ||
                 (cUserIdA && cUserIdA === queryId.toLowerCase()) ||
                 (cUserIdG && cUserIdG === queryId.toLowerCase());
        });

        if (!matched) {
          try {
            const asResp = await sendToAppsScript('customers/login', payload);
            if (asResp && (asResp.status === 'success' || asResp.success) && asResp.data) {
              return {
                success: true,
                status: 'success',
                data: asResp.data,
                message: asResp.message || 'লগইন সফল হয়েছে!'
              };
            }
          } catch (e) {}
        }

        if (!matched) {
          return {
            success: false,
            status: 'error',
            message: 'মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। Customers তালিকায় আপনার তথ্য পাওয়া যায়নি।'
          };
        }

        const storedPass = String(matched.password || matched.Password || matched.col_7 || '').trim();
        if (storedPass !== queryPass) {
          return {
            success: false,
            status: 'error',
            message: 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড প্রদান করুন।'
          };
        }

        const statusVal = String(matched.status || matched.Status || matched.col_8 || 'Active').trim();
        if (statusVal.toLowerCase() === 'blocked' || statusVal.toLowerCase() === 'inactive' || statusVal.toLowerCase() === 'suspended') {
          return {
            success: false,
            status: 'error',
            message: 'আপনার অ্যাকাউন্টটি স্থগিত বা ব্লক করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।'
          };
        }

        const uId = matched.customer_id || matched.Customer_ID || matched.user_id || matched.USER_ID || matched.col_0 || matched.User_ID || matched.col_6 || ('CUST-' + Math.floor(100000 + Math.random() * 900000));
        const customerProfile = {
          user_id: uId,
          USER_ID: uId,
          profile_photo: matched.profile_photo || matched.Profile_photo || matched.col_1 || '',
          name: matched.name || matched.Name || matched.col_2 || 'সম্মানিত গ্রাহক',
          mobile: matched.mobile || matched.Mobile || matched.phone || matched.Phone || matched.col_3 || queryId,
          phone: matched.mobile || matched.Mobile || matched.phone || matched.Phone || matched.col_3 || queryId,
          mail: matched.mail || matched.Mail || matched.email || matched.col_4 || '',
          email: matched.mail || matched.Mail || matched.email || matched.col_4 || '',
          address: matched.address || matched.Address || matched.col_5 || '',
          status: statusVal,
          success_order: Number(matched.success_order || matched.Success_order || matched.col_9 || 0),
          cancel_order: Number(matched.cancel_order || matched.Cancel_Order || matched.col_10 || 0),
          total_order: Number(matched.total_order || matched.Total_Order || matched.col_11 || 0),
          order_success_rate: String(matched.order_success_rate || matched.Order_Success_Rate || matched.col_12 || '100%'),
          account_type: 'CUSTOMER',
          role: 'Customer'
        };

        return {
          success: true,
          status: 'success',
          data: customerProfile,
          message: 'লগইন সফল হয়েছে!'
        };
      }

      case "customers/list": {
        const localCust = this.loadLocal('dcbd_sheet_customers', []) || this.loadLocal('dcbd_customers', []) || [];
        let sheetCust = [];
        try {
          const rows = await fetchLiveSheetRows('Customers', 'customers/list', 10000);
          if (rows && rows.length > 0) {
            sheetCust = rows.map((r, i) => ({
              user_id: safeStr(r.customer_id || r.Customer_ID || r.user_id || r.USER_ID || r.col_0 || `CUST-${100 + i}`),
              USER_ID: safeStr(r.customer_id || r.Customer_ID || r.user_id || r.USER_ID || r.col_0 || `CUST-${100 + i}`),
              profile_photo: normalizeSingleImageUrl(r.profile_photo || r.Profile_photo || r.col_1 || ''),
              name: safeStr(r.name || r.Name || r.col_2 || ''),
              phone: safeStr(r.mobile || r.Mobile || r.phone || r.col_3 || ''),
              mobile: safeStr(r.mobile || r.Mobile || r.phone || r.col_3 || ''),
              mail: safeStr(r.mail || r.Mail || r.email || r.col_4 || ''),
              email: safeStr(r.mail || r.Mail || r.email || r.col_4 || ''),
              address: safeStr(r.address || r.Address || r.col_5 || ''),
              password: safeStr(r.password || r.Password || r.col_7 || ''),
              status: safeStr(r.status || r.Status || r.col_8 || 'Active'),
              success_order: safeNumber(r.success_order !== undefined ? r.success_order : r.col_9, 0),
              cancel_order: safeNumber(r.cancel_order !== undefined ? r.cancel_order : r.col_10, 0),
              total_order: safeNumber(r.total_order !== undefined ? r.total_order : r.col_11, 0),
              order_success_rate: safeStr(r.order_success_rate || r.col_12 || '100%'),
              total_spent: safeNumber(r.total_spent, 0)
            })).filter(c => c.name && c.name.toLowerCase() !== 'name');
          }
        } catch (e) {}

        const byPhone = new Map();
        localCust.forEach(c => {
          const k = normalizeBDPhone(c.phone || c.mobile || c.Mobile || '') || String(c.user_id || c.USER_ID || Math.random());
          byPhone.set(k, c);
        });
        sheetCust.forEach(c => {
          const k = normalizeBDPhone(c.phone || c.mobile || '') || String(c.user_id || Math.random());
          if (!byPhone.has(k)) byPhone.set(k, c);
        });

        const merged = Array.from(byPhone.values());
        this.sheetCustomers = merged;
        this.saveLocal('dcbd_sheet_customers', merged);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.customers = merged;
        }
        return { success: true, data: { items: merged, total: merged.length } };
      }

      // --- REVIEWS ---
      case "reviews/list": {
        const localRevs = this.loadLocal('dcbd_sheet_reviews', []);
        let sheetRevs = [];
        try {
          const rows = await fetchLiveSheetRows('Reviews', 'reviews/list', 10000);
          if (rows && rows.length > 0) {
            // Exact headers in Excel: ['Review_ID', 'Product_SKU', 'Customer_Name', 'Rating', 'Comment', 'Image', 'Status', 'Date']
            sheetRevs = rows.map((r, i) => ({
              id: safeStr(r.review_id || r.Review_ID || r.col_0 || `REV-SH-${i + 1}`),
              review_id: safeStr(r.review_id || r.Review_ID || r.col_0 || `REV-SH-${i + 1}`),
              product_sku: safeStr(r.product_sku || r.Product_SKU || r.col_1 || ''),
              product: safeStr(r.product || r.product_sku || r.Product_SKU || r.col_1 || 'পণ্য'),
              customer_name: safeStr(r.customer_name || r.Customer_Name || r.col_2 || 'গ্রাহক'),
              customer: safeStr(r.customer || r.customer_name || r.Customer_Name || r.col_2 || 'গ্রাহক'),
              rating: safeNumber(r.rating !== undefined ? r.rating : (r.Rating !== undefined ? r.Rating : r.col_3), 5),
              comment: safeStr(r.comment || r.Comment || r.col_4 || ''),
              image: normalizeSingleImageUrl(r.image || r.Image || r.col_5 || ''),
              status: safeStr(r.status || r.Status || r.col_6 || 'Approved'),
              date: safeStr(r.date || r.Date || r.col_7 || 'সম্প্রতি')
            })).filter(rv => rv.comment && rv.id.toLowerCase() !== 'review_id');
          }
        } catch (e) {}
        const byId = new Map();
        sheetRevs.forEach(rv => byId.set(String(rv.id).toLowerCase(), rv));
        localRevs.forEach(rv => byId.set(String(rv.id || Math.random()).toLowerCase(), rv));
        const merged = Array.from(byId.values());
        this.saveLocal('dcbd_sheet_reviews', merged);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.reviews = merged;
        }
        return { success: true, data: { items: merged, total: merged.length } };
      }

      case "reviews/add":
      case "reviews/create": {
        await sendToAppsScript("reviews/add", payload);
        return { success: true, status: "success", data: payload };
      }

      // --- RESELLERS ---
      case "resellers/list": {
        let localRes = this.loadLocal('dcbd_resellers', []) || [];
        try {
          const rows = await fetchLiveSheetRows('Resellers', 'resellers/list', 10000);
          if (rows && rows.length > 0) {
            const mapped = rows.map((r, i) => ({
              id: safeStr(r.shop_id || r.Shop_ID || r.col_0 || `RSL-${101 + i}`),
              shop_id: safeStr(r.shop_id || r.Shop_ID || r.col_0 || `RSL-${101 + i}`),
              Shop_ID: safeStr(r.shop_id || r.Shop_ID || r.col_0 || `RSL-${101 + i}`),
              shop_logo: normalizeSingleImageUrl(r.shop_logo || r.Shop_logo || r.col_1 || ''),
              name: safeStr(r.name || r.Name || r.col_2 || ''),
              mobile: safeStr(r.mobile || r.Mobile || r.col_3 || ''),
              phone: safeStr(r.mobile || r.Mobile || r.col_3 || ''),
              mail: safeStr(r.mail || r.Mail || r.col_4 || ''),
              address: safeStr(r.address || r.Address || r.col_5 || 'ঢাকা'),
              city: safeStr(r.address || r.Address || r.col_5 || 'ঢাকা'),
              shop_name: safeStr(r.shop_name || r.Shop_Name || r.col_6 || 'রিসেলার শপ'),
              shop: safeStr(r.shop_name || r.Shop_Name || r.col_6 || 'রিসেলার শপ'),
              nid_number: safeStr(r.nid_number || r.NID_Number || r.col_7 || ''),
              date_of_birth: safeStr(r.date_of_birth || r.Date_of_birth || r.col_8 || ''),
              trade_licence_no: safeStr(r.trade_licence_no || r.Trade_Licence_No || r.col_9 || ''),
              user_id: safeStr(r.user_id || r.User_ID || r.col_10 || r.col_3 || ''),
              password: safeStr(r.password || r.Password || r.col_11 || ''),
              status: safeStr(r.status || r.Status || r.col_12 || 'Active'),
              commission: safeStr(r.commission || '15%'),
              balance: safeNumber(r.balance, 0)
            })).filter(r => r.name && r.name.toLowerCase() !== 'name');

            const byId = new Map();
            mapped.forEach(r => byId.set(String(r.shop_id).toLowerCase(), r));
            localRes.forEach(r => {
              const k = String(r.shop_id || r.id || '').toLowerCase();
              if (k) byId.set(k, { ...(byId.get(k) || {}), ...r });
            });
            localRes = Array.from(byId.values());
            this.saveLocal('dcbd_resellers', localRes);
            if (typeof window !== 'undefined' && window.__adminState) {
              window.__adminState.resellers = localRes;
            }
          }
        } catch (e) {}
        return { success: true, data: { items: localRes, total: localRes.length } };
      }

      case "resellers/register":
      case "resellers/add":
      case "resellers/create":
      case "resellers/update": {
        const shopId = safeStr(payload.shop_id || payload.Shop_ID || payload.id || ("RSL-" + Math.floor(1000 + Math.random() * 9000)));
        const mobile = safeStr(payload.mobile || payload.Mobile || payload.phone || '');
        const entry = {
          ...payload,
          id: shopId,
          shop_id: shopId,
          Shop_ID: shopId,
          Shop_logo: safeStr(payload.shop_logo || payload.Shop_logo || ''),
          Name: safeStr(payload.name || payload.Name || ''),
          Mobile: mobile,
          mobile: mobile,
          phone: mobile,
          Mail: safeStr(payload.mail || payload.Mail || payload.email || ''),
          Address: safeStr(payload.address || payload.Address || payload.city || 'ঢাকা'),
          Shop_Name: safeStr(payload.shop_name || payload.Shop_Name || payload.shop || 'রিসেলার শপ'),
          NID_Number: safeStr(payload.nid_number || payload.NID_Number || ''),
          Date_of_birth: safeStr(payload.date_of_birth || payload.Date_of_birth || ''),
          Trade_Licence_No: safeStr(payload.trade_licence_no || payload.Trade_Licence_No || ''),
          User_ID: safeStr(payload.user_id || payload.User_ID || mobile || shopId),
          Password: safeStr(payload.password || payload.Password || '123456'),
          Status: safeStr(payload.status || payload.Status || 'Active')
        };

        let list = this.loadLocal('dcbd_resellers', []);
        const idx = list.findIndex(r => String(r.shop_id || r.id).toLowerCase() === shopId.toLowerCase());
        if (idx >= 0) list[idx] = { ...list[idx], ...entry };
        else list.unshift(entry);
        this.saveLocal('dcbd_resellers', list);
        if (typeof window !== 'undefined' && window.__adminState) window.__adminState.resellers = list;

        await sendToAppsScript("resellers/register", entry);
        return { success: true, status: "success", data: entry, message: "রিসেলার সফলভাবে তালিকা ও গুগল শিটে সংরক্ষিত হয়েছে!" };
      }

      case "resellers/login": {
        await sendToAppsScript("resellers/login", payload);
        return { success: true, status: "success", data: payload };
      }

      case "resellers/delete": {
        const sId = safeStr(payload.shop_id || payload.id || '');
        let list = this.loadLocal('dcbd_resellers', []);
        list = list.filter(r => String(r.shop_id || r.id).toLowerCase() !== sId.toLowerCase());
        this.saveLocal('dcbd_resellers', list);
        if (typeof window !== 'undefined' && window.__adminState) window.__adminState.resellers = list;
        await sendToAppsScript("resellers/delete", payload);
        return { success: true, status: "success" };
      }

      // --- WHOLESALERS ---
      case "wholesalers/list": {
        let localWhs = this.loadLocal('dcbd_wholesalers', []) || [];
        try {
          const rows = await fetchLiveSheetRows('Wholesalers', 'wholesalers/list', 10000);
          if (rows && rows.length > 0) {
            const mapped = rows.map((r, i) => ({
              id: safeStr(r.shop_id || r.Shop_ID || r.col_0 || `WHS-${101 + i}`),
              shop_id: safeStr(r.shop_id || r.Shop_ID || r.col_0 || `WHS-${101 + i}`),
              Shop_ID: safeStr(r.shop_id || r.Shop_ID || r.col_0 || `WHS-${101 + i}`),
              shop_logo: normalizeSingleImageUrl(r.shop_logo || r.Shop_logo || r.col_1 || ''),
              name: safeStr(r.name || r.Name || r.col_2 || ''),
              mobile: safeStr(r.mobile || r.Mobile || r.col_3 || ''),
              phone: safeStr(r.mobile || r.Mobile || r.col_3 || ''),
              mail: safeStr(r.mail || r.Mail || r.col_4 || ''),
              address: safeStr(r.address || r.Address || r.col_5 || 'ঢাকা'),
              shop_name: safeStr(r.shop_name || r.Shop_Name || r.col_6 || 'পাইকারি প্রতিষ্ঠান'),
              company: safeStr(r.shop_name || r.Shop_Name || r.col_6 || 'পাইকারি প্রতিষ্ঠান'),
              user_id: safeStr(r.user_id || r.User_ID || r.col_7 || r.col_3 || ''),
              password: safeStr(r.password || r.Password || r.col_8 || ''),
              status: safeStr(r.status || r.Status || r.col_9 || 'Approved'),
              moq: safeNumber(r.moq, 5),
              discount_pct: safeStr(r.discount_pct || '15%'),
              tier: safeStr(r.tier || 'MOQ 5 • 15% Off')
            })).filter(w => w.name && w.name.toLowerCase() !== 'name');

            const byId = new Map();
            mapped.forEach(w => byId.set(String(w.shop_id).toLowerCase(), w));
            localWhs.forEach(w => {
              const k = String(w.shop_id || w.id || '').toLowerCase();
              if (k) byId.set(k, { ...(byId.get(k) || {}), ...w });
            });
            localWhs = Array.from(byId.values());
            this.saveLocal('dcbd_wholesalers', localWhs);
            if (typeof window !== 'undefined' && window.__adminState) {
              window.__adminState.wholesalers = localWhs;
            }
          }
        } catch (e) {}
        return { success: true, data: { items: localWhs, total: localWhs.length } };
      }

      case "wholesalers/register":
      case "wholesalers/add":
      case "wholesalers/create":
      case "wholesalers/update": {
        const shopId = safeStr(payload.shop_id || payload.Shop_ID || payload.id || ("WHS-" + Math.floor(1000 + Math.random() * 9000)));
        const mobile = safeStr(payload.mobile || payload.Mobile || payload.phone || '');
        const entry = {
          ...payload,
          id: shopId,
          shop_id: shopId,
          Shop_ID: shopId,
          Shop_logo: safeStr(payload.shop_logo || payload.Shop_logo || ''),
          Name: safeStr(payload.name || payload.Name || ''),
          Mobile: mobile,
          mobile: mobile,
          phone: mobile,
          Mail: safeStr(payload.mail || payload.Mail || payload.email || ''),
          Address: safeStr(payload.address || payload.Address || 'ঢাকা'),
          Shop_Name: safeStr(payload.shop_name || payload.Shop_Name || payload.company || 'ট্রেডার্স'),
          company: safeStr(payload.shop_name || payload.Shop_Name || payload.company || 'ট্রেডার্স'),
          User_ID: safeStr(payload.user_id || payload.User_ID || mobile || shopId),
          Password: safeStr(payload.password || payload.Password || '123456'),
          Status: safeStr(payload.status || payload.Status || 'Approved')
        };

        let list = this.loadLocal('dcbd_wholesalers', []);
        const idx = list.findIndex(w => String(w.shop_id || w.id).toLowerCase() === shopId.toLowerCase());
        if (idx >= 0) list[idx] = { ...list[idx], ...entry };
        else list.unshift(entry);
        this.saveLocal('dcbd_wholesalers', list);
        if (typeof window !== 'undefined' && window.__adminState) window.__adminState.wholesalers = list;

        await sendToAppsScript("wholesalers/register", entry);
        return { success: true, status: "success", data: entry, message: "হোলসেলার সফলভাবে তালিকা ও গুগল শিটে সংরক্ষিত হয়েছে!" };
      }

      case "wholesalers/login": {
        await sendToAppsScript("wholesalers/login", payload);
        return { success: true, status: "success", data: payload };
      }

      case "wholesalers/delete": {
        const sId = safeStr(payload.shop_id || payload.id || '');
        let list = this.loadLocal('dcbd_wholesalers', []);
        list = list.filter(w => String(w.shop_id || w.id).toLowerCase() !== sId.toLowerCase());
        this.saveLocal('dcbd_wholesalers', list);
        if (typeof window !== 'undefined' && window.__adminState) window.__adminState.wholesalers = list;
        await sendToAppsScript("wholesalers/delete", payload);
        return { success: true, status: "success" };
      }

      // --- ATTRIBUTES & VARIANTS (COLOR & SIZE) ---
      case "attributes/list":
      case "variants/list": {
        let v = (typeof window !== 'undefined' && window.getAdminVariants) ? window.getAdminVariants() : (this.loadLocal('dcbd_variants', { colors: [], sizes: [] }));
        try {
          const rows = await fetchLiveSheetRows('Attributes', 'attributes/list', 10000);
          if (rows && rows.length > 0) {
            rows.forEach(r => {
              const type = String(r.type || r.Type || r.col_1 || '').trim().toLowerCase();
              const val = String(r.name_value || r.Name_Value || r.col_2 || '').trim();
              if (val && val.toLowerCase() !== 'name_value') {
                if (type === 'color' && !v.colors.includes(val)) v.colors.push(val);
                else if (type === 'size' && !v.sizes.includes(val)) v.sizes.push(val);
              }
            });
            this.saveLocal('dcbd_variants', v);
            if (typeof window !== 'undefined' && window.__adminState) window.__adminState.variants = v;
          }
        } catch (e) {}
        return { success: true, data: v };
      }

      case "attributes/add":
      case "attributes/create":
      case "attributes/update":
      case "variants/add":
      case "variants/create":
      case "variants/update": {
        const type = String(payload.type || payload.Type || (payload.color ? 'Color' : 'Size')).trim();
        const val = String(payload.name_value || payload.Name_Value || payload.val || payload.name || payload.color || payload.size || '').trim();
        if (type && val) {
          const v = this.loadLocal('dcbd_variants', { colors: ['Black', 'White', 'Navy Blue', 'Silver'], sizes: ['Free Size', 'M', 'L', 'XL'] });
          if (type.toLowerCase() === 'color' && !v.colors.includes(val)) v.colors.unshift(val);
          else if (type.toLowerCase() === 'size' && !v.sizes.includes(val)) v.sizes.unshift(val);
          this.saveLocal('dcbd_variants', v);
          if (typeof window !== 'undefined' && window.__adminState) window.__adminState.variants = v;
        }
        const sheetPayload = {
          ...payload,
          Date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Dhaka' }),
          Type: type,
          type: type,
          Name_Value: val,
          name_value: val,
          Status: payload.status || 'Active'
        };
        await sendToAppsScript("attributes/add", sheetPayload);
        return { success: true, status: "success", data: sheetPayload, message: "অ্যাট্রিবিউট তালিকা ও গুগল শিটে সংরক্ষিত হয়েছে!" };
      }

      case "attributes/delete":
      case "variants/delete": {
        const type = String(payload.type || '').trim().toLowerCase();
        const val = String(payload.name_value || payload.val || payload.name || payload.color || payload.size || '').trim().toLowerCase();
        if (type && val) {
          const v = this.loadLocal('dcbd_variants', { colors: [], sizes: [] });
          if (type === 'color') v.colors = v.colors.filter(c => c.toLowerCase() !== val);
          else v.sizes = v.sizes.filter(s => s.toLowerCase() !== val);
          this.saveLocal('dcbd_variants', v);
          if (typeof window !== 'undefined' && window.__adminState) window.__adminState.variants = v;
        }
        await sendToAppsScript("attributes/delete", payload);
        return { success: true, status: "success" };
      }

      // --- SELLERS / VENDORS ---
      case "sellers/list": {
        let localSellers = (this.loadLocal('dcbd_sellers', []) || []);
        try {
          const rows = await fetchLiveSheetRows('Sellers', 'sellers/list', 10000);
          if (rows && rows.length > 0) {
            const mapped = rows.map((r, i) => ({
              shop_id: safeStr(r.shop_id || r.Shop_ID || r.col_0 || `VND-${101 + i}`),
              id: safeStr(r.shop_id || r.Shop_ID || r.col_0 || `VND-${101 + i}`),
              shop_logo: normalizeSingleImageUrl(r.shop_logo || r.Shop_logo || r.col_1 || ''),
              shop_name: safeStr(r.shop_name || r.Shop_Name || r.col_2 || 'Store'),
              store: safeStr(r.shop_name || r.Shop_Name || r.col_2 || 'Store'),
              name: safeStr(r.name || r.Name || r.col_3 || 'Merchant'),
              mobile: safeStr(r.mobile || r.Mobile || r.col_4 || ''),
              phone: safeStr(r.mobile || r.Mobile || r.col_4 || ''),
              mail: safeStr(r.mail || r.Mail || r.col_5 || ''),
              address: safeStr(r.address || r.Address || r.col_6 || 'ঢাকা'),
              commission_rate: safeStr(r.commission_rate || r.Commission_Rate || r.col_7 || '10%'),
              commission: safeStr(r.commission_rate || r.Commission_Rate || r.col_7 || '10%'),
              status: safeStr(r.status || r.Status || r.col_8 || 'Active')
            })).filter(s => s.name && s.name.toLowerCase() !== 'name');
            const byId = new Map();
            mapped.forEach(s => byId.set(String(s.shop_id).toLowerCase(), s));
            (localSellers || []).forEach(s => byId.set(String(s.shop_id || s.id).toLowerCase(), { ...(byId.get(String(s.shop_id || s.id).toLowerCase()) || {}), ...s }));
            localSellers = Array.from(byId.values());
            this.saveLocal('dcbd_sellers', localSellers);
            if (typeof window !== 'undefined' && window.__adminState) window.__adminState.sellers = localSellers;
          }
        } catch (e) {}
        return { success: true, data: { items: localSellers, total: localSellers.length } };
      }

      case "sellers/add":
      case "sellers/create":
      case "sellers/update": {
        const shopId = safeStr(payload.shop_id || payload.Shop_ID || payload.id || ("VND-" + Math.floor(100 + Math.random() * 900)));
        const shopName = safeStr(payload.shop_name || payload.Shop_Name || payload.store || 'Merchant Store');
        const ownerName = safeStr(payload.name || payload.Name || payload.owner || 'Merchant');
        const mobile = safeStr(payload.mobile || payload.Mobile || payload.phone || '');
        const comm = safeStr(payload.commission_rate || payload.Commission_Rate || payload.commission || '10%');

        const entry = {
          shop_id: shopId,
          Shop_ID: shopId,
          id: shopId,
          shop_logo: safeStr(payload.shop_logo || payload.Shop_logo || payload.logo || ''),
          Shop_logo: safeStr(payload.shop_logo || payload.Shop_logo || payload.logo || ''),
          shop_name: shopName,
          Shop_Name: shopName,
          store: shopName,
          name: ownerName,
          Name: ownerName,
          mobile: mobile,
          Mobile: mobile,
          phone: mobile,
          mail: safeStr(payload.mail || payload.Mail || payload.email || ''),
          Mail: safeStr(payload.mail || payload.Mail || payload.email || ''),
          address: safeStr(payload.address || payload.Address || 'ঢাকা'),
          Address: safeStr(payload.address || payload.Address || 'ঢাকা'),
          commission_rate: comm,
          Commission_Rate: comm,
          commission: comm,
          status: safeStr(payload.status || payload.Status || 'Active'),
          Status: safeStr(payload.status || payload.Status || 'Active')
        };

        let sellers = this.loadLocal('dcbd_sellers', []);
        const exIdx = sellers.findIndex(s => String(s.shop_id || s.id).toLowerCase() === shopId.toLowerCase());
        if (exIdx >= 0) sellers[exIdx] = { ...sellers[exIdx], ...entry };
        else sellers.unshift(entry);
        this.saveLocal('dcbd_sellers', sellers);
        if (typeof window !== 'undefined' && window.__adminState) window.__adminState.sellers = sellers;

        await sendToAppsScript("sellers/add", entry);
        return { success: true, status: "success", data: entry, message: "মার্চেন্ট সেলার তালিকা ও গুগল শিটে সংরক্ষিত হয়েছে!" };
      }

      case "sellers/delete": {
        const sId = safeStr(payload.shop_id || payload.id || payload.seller_id);
        let sellers = this.loadLocal('dcbd_sellers', []);
        sellers = sellers.filter(s => String(s.shop_id || s.id).toLowerCase() !== sId.toLowerCase());
        this.saveLocal('dcbd_sellers', sellers);
        if (typeof window !== 'undefined' && window.__adminState) window.__adminState.sellers = sellers;
        await sendToAppsScript("sellers/delete", payload);
        return { success: true, status: "success" };
      }

      // --- OTHERS MARKETPLACE ---
      case "markets/list":
      case "others_market/list": {
        let localMarkets = this.loadLocal('dcbd_markets', []) || [];
        try {
          const rows = await fetchLiveSheetRows('Others_Market', 'markets/list', 10000);
          if (rows && rows.length > 0) {
            const mapped = rows.map((r, i) => {
              const rawStatus = r.status !== undefined ? r.status : (r.Status !== undefined ? r.Status : r.col_5);
              // In Dream Cart BD-Site.xlsx -> Others_Market, Status column has unchecked checkboxes (false) for active rows!
              const statusStr = (rawStatus === false || rawStatus === 'FALSE' || rawStatus === 'false' || !rawStatus)
                ? 'Active'
                : String(rawStatus).trim();
              return {
                id: safeStr(r.shop_id || r.Shop_ID || r.col_0 || `MKT-${101 + i}`),
                shop_id: safeStr(r.shop_id || r.Shop_ID || r.col_0 || `MKT-${101 + i}`),
                market_logo: normalizeSingleImageUrl(r.market_logo || r.Market_Logo || r.col_1 || '') || 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Daraz_Logo.png',
                market_name: safeStr(r.market_name || r.Market_Name || r.col_2 || ''),
                name: safeStr(r.market_name || r.Market_Name || r.col_2 || ''),
                shop_name: safeStr(r.shop_name || r.Shop_Name || r.col_3 || 'Dream Cart BD'),
                shop_link: safeStr(r.shop_link || r.Shop_Link || r.col_4 || '#'),
                status: statusStr
              };
            }).filter(m => m.market_name && m.market_name.toLowerCase() !== 'market_name');

            if (mapped.length > 0) {
              const byId = new Map();
              mapped.forEach(m => byId.set(String(m.shop_id).toLowerCase(), m));
              localMarkets.forEach(m => {
                const k = String(m.shop_id || m.id || '').toLowerCase();
                if (k && !['mkt-01', 'mkt-02', 'mkt-03'].includes(k)) {
                  byId.set(k, { ...(byId.get(k) || {}), ...m });
                }
              });
              localMarkets = Array.from(byId.values());
              this.saveLocal('dcbd_markets', localMarkets);
              if (typeof window !== 'undefined' && window.__adminState) {
                window.__adminState.markets = localMarkets;
              }
            }
          }
        } catch (e) {}
        return { success: true, data: { items: localMarkets, total: localMarkets.length } };
      }

      case "markets/add":
      case "markets/create":
      case "markets/update": {
        await sendToAppsScript("markets/add", payload);
        return { success: true, status: "success", data: payload };
      }

      case "markets/delete": {
        await sendToAppsScript("markets/delete", payload);
        return { success: true, status: "success" };
      }

      // --- ADMINS & WORKERS ---
      case "admin_worker/list":
      case "admins/list":
      case "workers/list": {
        let localWorkers = this.loadLocal('dcbd_workers', []) || [];
        let localAdmins = this.loadLocal('dcbd_admins', []) || [];
        try {
          const rows = await fetchLiveSheetRows('AdminWorker', 'admin_worker/list', 10000);
          if (rows && rows.length > 0) {
            const mapped = rows.map((r, i) => ({
              id: safeStr(r.user_id || r.USER_ID || r.col_0 || `USR-${101 + i}`),
              user_id: safeStr(r.user_id || r.USER_ID || r.col_0 || `USR-${101 + i}`),
              profile_photo: normalizeSingleImageUrl(r.profile_photo || r.Profile_Photo || r.col_1 || ''),
              name: safeStr(r.name || r.Name || r.col_2 || ''),
              mobile: safeStr(r.mobile || r.Mobile || r.col_3 || ''),
              phone: safeStr(r.mobile || r.Mobile || r.col_3 || ''),
              mail: safeStr(r.mail || r.Mail || r.col_4 || ''),
              email: safeStr(r.mail || r.Mail || r.col_4 || ''),
              address: safeStr(r.address || r.Address || r.col_5 || ''),
              worker_type: safeStr(r.worker_type || r.Worker_Type || r.col_6 || 'Admin'),
              role: safeStr(r.role || r.Role || r.col_7 || 'Full Access'),
              user_name: safeStr(r.user_name || r.User_Name || r.col_8 || ''),
              password: safeStr(r.password || r.Password || r.col_9 || ''),
              status: 'Active'
            })).filter(u => u.name && u.name.toLowerCase() !== 'name');

            if (mapped.length > 0) {
              const sheetAdmins = mapped.filter(u => String(u.worker_type).toLowerCase().includes('admin'));
              const sheetWorkers = mapped.filter(u => !String(u.worker_type).toLowerCase().includes('admin'));
              if (sheetAdmins.length > 0) {
                localAdmins = sheetAdmins;
                this.saveLocal('dcbd_admins', localAdmins);
              }
              if (sheetWorkers.length > 0) {
                localWorkers = sheetWorkers;
                this.saveLocal('dcbd_workers', localWorkers);
              }
              if (typeof window !== 'undefined' && window.__adminState) {
                window.__adminState.admins = localAdmins;
                window.__adminState.workers = localWorkers;
              }
            }
          }
        } catch (e) {}
        return { success: true, data: { items: [...localAdmins, ...localWorkers], admins: localAdmins, workers: localWorkers } };
      }

      case "admin_worker/add":
      case "admin_worker/create":
      case "admin_worker/update":
      case "admins/add":
      case "workers/add": {
        await sendToAppsScript("admin_worker/add", payload);
        return { success: true, status: "success", data: payload };
      }

      case "admin_worker/delete":
      case "admins/delete":
      case "workers/delete": {
        await sendToAppsScript("admin_worker/delete", payload);
        return { success: true, status: "success" };
      }

      // --- FINANCE: COSTS, BUYING, INVEST, PAYMENTS ---
      case "costs/list": {
        let localCosts = this.loadLocal('dcbd_sheet_costs', []) || [];
        try {
          const rows = await fetchLiveSheetRows('Costs', 'costs/list', 10000);
          if (rows && rows.length > 0) {
            const mapped = rows.map((r, i) => ({
              id: `CST-${101 + i}`,
              date: safeStr(r.date || r.Date || r.col_0 || ''),
              who_paid: safeStr(r.who_paid || r['Who Paid'] || r.col_1 || 'Admin'),
              title: safeStr(r.purpose || r.Purpose || r.col_2 || ''),
              purpose: safeStr(r.purpose || r.Purpose || r.col_2 || ''),
              amount: safeNumber(r.amount !== undefined ? r.amount : (r.Amount !== undefined ? r.Amount : r.col_3), 0),
              note: safeStr(r.note || r.Note || r.col_4 || ''),
              category: safeStr(r.note || r.Note || r.col_4 || 'অপারেশন')
            })).filter(c => c.title && c.title.toLowerCase() !== 'purpose');
            if (mapped.length > 0) {
              localCosts = mapped;
              this.saveLocal('dcbd_sheet_costs', localCosts);
              if (typeof window !== 'undefined' && window.__adminState) window.__adminState.costs = localCosts;
            }
          }
        } catch (e) {}
        return { success: true, data: { items: localCosts, total: localCosts.length } };
      }

      case "costs/add":
      case "costs/create": {
        await sendToAppsScript("costs/add", payload);
        return { success: true, status: "success", data: payload };
      }

      case "costs/delete": {
        await sendToAppsScript("costs/delete", payload);
        return { success: true, status: "success" };
      }

      case "buying/list": {
        let localBuying = this.loadLocal('dcbd_sheet_buying', []) || [];
        try {
          const rows = await fetchLiveSheetRows('Buying', 'buying/list', 10000);
          if (rows && rows.length > 0) {
            const mapped = rows.map((r, i) => ({
              id: `BUY-${101 + i}`,
              date: safeStr(r.date || r.Date || r.col_0 || ''),
              who_buy: safeStr(r.who_buy || r['Who Buy'] || r.col_1 || 'Admin'),
              product: safeStr(r.product_name || r['Product Name'] || r.col_2 || ''),
              product_name: safeStr(r.product_name || r['Product Name'] || r.col_2 || ''),
              buying_price: safeNumber(r.buying_price !== undefined ? r.buying_price : r.col_3, 0),
              quantity: safeNumber(r.quantity !== undefined ? r.quantity : r.col_4, 1),
              total_amount: safeNumber(r.total_buying__calculated_ !== undefined ? r.total_buying__calculated_ : r.col_5, 0),
              supplier: safeStr(r.supplier || r.Supplier || r.col_6 || ''),
              location: safeStr(r.location || r.Location || r.col_7 || '')
            })).filter(b => b.product && b.product.toLowerCase() !== 'product name');
            if (mapped.length > 0) {
              localBuying = mapped;
              this.saveLocal('dcbd_sheet_buying', localBuying);
              if (typeof window !== 'undefined' && window.__adminState) window.__adminState.buying = localBuying;
            }
          }
        } catch (e) {}
        return { success: true, data: { items: localBuying, total: localBuying.length } };
      }

      case "buying/add":
      case "buying/create": {
        await sendToAppsScript("buying/add", payload);
        return { success: true, status: "success", data: payload };
      }

      case "buying/delete": {
        await sendToAppsScript("buying/delete", payload);
        return { success: true, status: "success" };
      }

      case "invest/list": {
        let localInvest = this.loadLocal('dcbd_sheet_invest', []) || [];
        try {
          const rows = await fetchLiveSheetRows('Invest', 'invest/list', 10000);
          if (rows && rows.length > 0) {
            const mapped = rows.map((r, i) => ({
              id: `INV-${101 + i}`,
              date: safeStr(r.date || r.Date || r.col_0 || ''),
              invest_type: safeStr(r.invest_type || r['Invest type'] || r.col_1 || 'Working Capital'),
              investor: safeStr(r.name_of_investor || r['Name of investor'] || r.col_2 || ''),
              amount: safeNumber(r.amount !== undefined ? r.amount : r.col_3, 0),
              note: safeStr(r.note || r.Note || r.col_4 || '')
            })).filter(inv => inv.investor && inv.investor.toLowerCase() !== 'name of investor');
            if (mapped.length > 0) {
              localInvest = mapped;
              this.saveLocal('dcbd_sheet_invest', localInvest);
              if (typeof window !== 'undefined' && window.__adminState) window.__adminState.invest = localInvest;
            }
          }
        } catch (e) {}
        return { success: true, data: { items: localInvest, total: localInvest.length } };
      }

      case "invest/add":
      case "invest/create": {
        await sendToAppsScript("invest/add", payload);
        return { success: true, status: "success", data: payload };
      }

      case "invest/delete": {
        await sendToAppsScript("invest/delete", payload);
        return { success: true, status: "success" };
      }

      case "payments/list": {
        let localPayments = this.loadLocal('dcbd_sheet_payments', []) || [];
        try {
          const rows = await fetchLiveSheetRows('Payments', 'payments/list', 10000);
          if (rows && rows.length > 0) {
            const mapped = rows.map((r, i) => ({
              request_id: safeStr(r.request_id || r.Request_ID || r.col_0 || `REQ-${101 + i}`),
              reseller_id: safeStr(r.reseller_id || r.Reseller_ID || r.col_1 || ''),
              reseller_name: safeStr(r.reseller_name || r.Reseller_Name || r.col_2 || ''),
              payment_method: safeStr(r.payment_method || r.Payment_Method || r.col_3 || 'bKash'),
              account_details: safeStr(r.account_details || r.Account_Details || r.col_4 || ''),
              amount: safeNumber(r.amount !== undefined ? r.amount : r.col_5, 0),
              net_amount: safeNumber(r.net_amount_less_3percent !== undefined ? r.net_amount_less_3percent : r.col_6, 0),
              status: safeStr(r.status || r.Status || r.col_7 || 'Pending'),
              date: safeStr(r.date || r.Date || r.col_8 || ''),
              transaction_id: safeStr(r.transaction_id || r.Transaction_ID || r.col_9 || '')
            })).filter(p => p.request_id && p.request_id.toLowerCase() !== 'request_id');
            if (mapped.length > 0) {
              localPayments = mapped;
              this.saveLocal('dcbd_sheet_payments', localPayments);
            }
          }
        } catch (e) {}
        return { success: true, data: { items: localPayments, total: localPayments.length } };
      }

      case "payments/add":
      case "payments/create": {
        await sendToAppsScript("payments/add", payload);
        return { success: true, status: "success", data: payload };
      }

      case "payments/delete": {
        await sendToAppsScript("payments/delete", payload);
        return { success: true, status: "success" };
      }

      case "couriers/add":
      case "couriers/update":
      case "couriers/send_order":
      case "fraud/add_complaint": {
        await sendToAppsScript(action, payload);
        return { success: true, status: "success", data: payload };
      }

      case "settings/update":
      case "settings/save":
      case "settings/add": {
        const cur = getGlobalSiteSettings();
        const mergedSettings = { ...cur, ...payload };
        if (payload.name && payload.details !== undefined) {
          mergedSettings[payload.name] = payload.details;
        }
        try {
          localStorage.setItem('dcbd_site_settings', JSON.stringify(mergedSettings));
        } catch (e) {}
        if (typeof window !== 'undefined' && window.__dcbdInitMarketingAdPixels) {
          window.__dcbdInitMarketingAdPixels(true);
        }
        const sheetkv = (!payload.name && payload.shopName) ? {
          ...payload,
          Shop_Name: mergedSettings.shopName,
          Shop_Tagline: mergedSettings.shopTagline || mergedSettings.tagline,
          Shop_Logo: mergedSettings.shopLogo,
          Address: mergedSettings.address,
          Phone_1: mergedSettings.hotline1,
          Phone_2: mergedSettings.hotline2,
          Support_Email: mergedSettings.email,
          Facebook_URL: mergedSettings.facebookUrl,
          Office_Hours: mergedSettings.officeHours,
          Top_Notice: mergedSettings.notice,
          Free_Delivery_Min_Order: mergedSettings.freeShippingMin || mergedSettings.freeDeliveryThreshold || 2000,
          Online_Discount_Pct: mergedSettings.onlineDiscountPct || 5,
          FB_Pixel_ID: mergedSettings.fbPixelId || '',
          FB_CAPI_Token: mergedSettings.fbCapiToken || '',
          FB_Test_Event_Code: mergedSettings.fbTestEventCode || '',
          GA4_Measurement_ID: mergedSettings.gtagId || '',
          Google_Ads_ID: mergedSettings.googleAdsId || '',
          Google_Conversion_Label: mergedSettings.googleConversionLabel || '',
          GTM_Container_ID: mergedSettings.gtmId || '',
          YouTube_Tracking_ID: mergedSettings.ytTrackingId || '',
          TikTok_Pixel_ID: mergedSettings.tiktokPixelId || '',
          Site_Info_Items_JSON: JSON.stringify(mergedSettings.infoItems || [])
        } : payload;
        await sendToAppsScript("settings/save", sheetkv);
        return { success: true, status: "success", data: mergedSettings };
      }

      case "settings/delete": {
        await sendToAppsScript("settings/delete", payload);
        return { success: true, status: "success" };
      }

      // --- BANNERS ---
      case "banners/add":
      case "banners/create":
      case "banners/update": {
        const bannerId = safeStr(payload.banner_id || payload.Banner_ID || payload.id || ("BAN-" + Math.floor(100 + Math.random() * 900)));
        const title = safeStr(payload.title || payload.Title || "ব্যানার স্লাইডার");
        const subTitle = safeStr(payload.subtitle || payload.Subtitle || "");
        const imgUrl = normalizeSingleImageUrl(payload.image_url || payload.Image_URL || payload.image || DEFAULT_PRODUCT_THUMB);
        const linkUrl = safeStr(payload.link_url || payload.Link || payload.link || "/products");
        const ctaText = safeStr(payload.cta_text || payload.button_text || "এখনই কিনুন →");
        const pos = Number(payload.position || payload.Sort_Order || 1);
        const status = safeStr(payload.status || payload.Status || "Active");
        const createdAt = safeStr(payload.Created_At || payload.created_at || new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Dhaka' }));

        const newBanner = {
          banner_id: bannerId,
          Banner_ID: bannerId,
          id: bannerId,
          title: title,
          Title: title,
          subtitle: subTitle,
          Subtitle: subTitle,
          image_url: imgUrl,
          Image_URL: imgUrl,
          link_url: linkUrl,
          Link: linkUrl,
          cta_text: ctaText,
          button_text: ctaText,
          position: pos,
          Sort_Order: pos,
          status: status,
          Status: status,
          Created_At: createdAt,
          created_at: createdAt
        };

        const storedBanners = this.loadLocal('dcbd_sheet_banners', []);
        let currentBanners = (Array.isArray(storedBanners) && storedBanners.length > 0)
          ? storedBanners
          : (Array.isArray(this.sheetBanners) ? this.sheetBanners : []);

        // Remove deleted ID from deleted set if re-added
        try {
          const delSet = new Set(this.loadLocal('dcbd_deleted_banners', []));
          delSet.delete(String(bannerId).toLowerCase());
          this.saveLocal('dcbd_deleted_banners', Array.from(delSet));
        } catch (e) {}

        const existingIdx = currentBanners.findIndex(b => String(b.banner_id || b.id).toLowerCase() === String(bannerId).toLowerCase());
        if (existingIdx >= 0) {
          currentBanners[existingIdx] = { ...currentBanners[existingIdx], ...newBanner };
        } else {
          currentBanners.unshift(newBanner);
        }
        this.sheetBanners = currentBanners;
        this.saveLocal('dcbd_sheet_banners', currentBanners);
        if (typeof window !== 'undefined') {
          if (window.__adminState) window.__adminState.banners = currentBanners;
          window.dispatchEvent(new CustomEvent('dcbd:banners-synced', { detail: { banners: currentBanners } }));
        }

        // Non-blocking sync to Google Sheets Banners tab + Settings live patch
        sendToAppsScript("banners/add", newBanner).catch(() => {});
        sendToAppsScript("settings/save", {
          name: "DCBD_LIVE_BANNERS_JSON",
          details: JSON.stringify({ banners: currentBanners, deleted: this.loadLocal('dcbd_deleted_banners', []) || [], ts: Date.now() }),
          activation: "TRUE"
        }).catch(() => {});
        return { success: true, status: "success", data: newBanner, message: "ব্যানার তালিকা ও গুগল শিটে সংরক্ষিত হয়েছে!" };
      }

      case "banners/delete": {
        const id = String(payload.banner_id || payload.id || '').trim().toLowerCase();
        try {
          const delSet = new Set(this.loadLocal('dcbd_deleted_banners', []));
          if (id) delSet.add(id);
          this.saveLocal('dcbd_deleted_banners', Array.from(delSet));
        } catch (e) {}

        const storedBanners = this.loadLocal('dcbd_sheet_banners', []);
        let currentBanners = (Array.isArray(storedBanners) && storedBanners.length > 0)
          ? storedBanners
          : (Array.isArray(this.sheetBanners) ? this.sheetBanners : []);
        currentBanners = currentBanners.filter(b => String(b.banner_id || b.id).toLowerCase() !== id);
        this.sheetBanners = currentBanners;
        this.saveLocal('dcbd_sheet_banners', currentBanners);
        if (typeof window !== 'undefined') {
          if (window.__adminState) window.__adminState.banners = currentBanners;
          window.dispatchEvent(new CustomEvent('dcbd:banners-synced', { detail: { banners: currentBanners } }));
        }
        sendToAppsScript("banners/delete", payload).catch(() => {});
        sendToAppsScript("settings/save", {
          name: "DCBD_LIVE_BANNERS_JSON",
          details: JSON.stringify({ banners: currentBanners, deleted: this.loadLocal('dcbd_deleted_banners', []) || [], ts: Date.now() }),
          activation: "TRUE"
        }).catch(() => {});
        return { success: true, status: "success" };
      }

      case "viewers/log": {
        // Log visit once per browser session so Viewers sheet stays clean
        if (typeof window !== 'undefined' && window.__dcbdViewerLoggedSession) {
          return { success: true };
        }
        if (typeof window !== 'undefined') window.__dcbdViewerLoggedSession = true;
        sendToAppsScript("viewers/log", payload).catch(() => {});
        return { success: true };
      }

      case "settings/list": {
        let s = getGlobalSiteSettings();
        try {
          const [srvRes, rows] = await Promise.all([
            fetchFromLocalServerApi('settings/list', {}, 'GET', 3000),
            fetchLiveSheetRows('Settings', 'settings/list', 8000)
          ]);
          if (srvRes && srvRes.data && typeof srvRes.data === 'object' && !Array.isArray(srvRes.data)) {
            s = { ...s, ...srvRes.data };
          }
          if (rows && Array.isArray(rows) && rows.length > 0) {
            const keyMap = {
              Shop_Name: 'shopName', shopName: 'shopName',
              Shop_Tagline: 'shopTagline', shopTagline: 'shopTagline', tagline: 'tagline',
              Shop_Logo: 'shopLogo', shopLogo: 'shopLogo',
              Address: 'address', address: 'address',
              Phone_1: 'hotline1', hotline1: 'hotline1',
              Phone_2: 'hotline2', hotline2: 'hotline2',
              Support_Email: 'email', email: 'email',
              Facebook_URL: 'facebookUrl', facebookUrl: 'facebookUrl',
              Office_Hours: 'officeHours', officeHours: 'officeHours',
              Top_Notice: 'notice', notice: 'notice',
              Free_Delivery_Min_Order: 'freeDeliveryThreshold', freeDeliveryThreshold: 'freeDeliveryThreshold', freeShippingMin: 'freeShippingMin',
              Online_Discount_Pct: 'onlineDiscountPct', onlineDiscountPct: 'onlineDiscountPct',
              FB_Pixel_ID: 'fbPixelId', fbPixelId: 'fbPixelId',
              FB_CAPI_Token: 'fbCapiToken', fbCapiToken: 'fbCapiToken',
              FB_Test_Event_Code: 'fbTestEventCode', fbTestEventCode: 'fbTestEventCode',
              GA4_Measurement_ID: 'gtagId', gtagId: 'gtagId',
              Google_Ads_ID: 'googleAdsId', googleAdsId: 'googleAdsId',
              Google_Conversion_Label: 'googleConversionLabel', googleConversionLabel: 'googleConversionLabel',
              GTM_Container_ID: 'gtmId', gtmId: 'gtmId',
              YouTube_Tracking_ID: 'ytTrackingId', ytTrackingId: 'ytTrackingId',
              TikTok_Pixel_ID: 'tiktokPixelId', tiktokPixelId: 'tiktokPixelId'
            };
            rows.forEach(r => {
              const k = safeStr(r.name || r.Name || r.col_0);
              const val = safeStr(r.details || r.Details || r.col_1);
              if (!k || val === '') return;
              if (keyMap[k]) {
                const targetKey = keyMap[k];
                s[targetKey] = (targetKey === 'freeDeliveryThreshold' || targetKey === 'freeShippingMin' || targetKey === 'onlineDiscountPct')
                  ? safeNumber(val, s[targetKey])
                  : val;
              } else if (k === 'Site_Info_Items_JSON' || k === 'infoItems') {
                try {
                  const parsed = JSON.parse(val);
                  if (Array.isArray(parsed)) s.infoItems = parsed;
                } catch (e) {}
              } else if (k === 'Payment_Method' || k === 'payment_methods') {
                try {
                  const parsedPm = JSON.parse(val);
                  if (Array.isArray(parsedPm) && parsedPm.length > 0) {
                    localStorage.setItem('dcbd_payment_methods', JSON.stringify(parsedPm));
                  }
                } catch (e) {}
              } else if (k === 'Delivery_Area' || k === 'delivery_methods') {
                try {
                  const parsedDa = JSON.parse(val);
                  if (Array.isArray(parsedDa) && parsedDa.length > 0) {
                    localStorage.setItem('dcbd_delivery_methods', JSON.stringify(parsedDa));
                  }
                } catch (e) {}
              } else if (k === 'Offer_or_Coupon' || k === 'offers_json') {
                try {
                  const parsedOc = JSON.parse(val);
                  if (Array.isArray(parsedOc) && parsedOc.length > 0) {
                    localStorage.setItem('dcbd_sheet_offers', JSON.stringify(parsedOc));
                    if (typeof window !== 'undefined' && window.__adminState) window.__adminState.offers = parsedOc;
                  }
                } catch (e) {}
              } else if (k === 'couriers_json') {
                try {
                  const parsedCr = JSON.parse(val);
                  if (Array.isArray(parsedCr) && parsedCr.length > 0) {
                    localStorage.setItem('dcbd_sheet_couriers', JSON.stringify(parsedCr));
                    if (typeof window !== 'undefined' && window.__adminState) window.__adminState.couriers = parsedCr;
                  }
                } catch (e) {}
              } else if (k === 'DCBD_LIVE_PRODUCT_PATCHES_JSON') {
                try {
                  const prodPatch = JSON.parse(val);
                  if (prodPatch && typeof prodPatch === 'object') {
                    this.saveLocal('dcbd_live_product_patches', prodPatch);
                    if (Array.isArray(prodPatch.deleted) && prodPatch.deleted.length > 0) {
                      const delSet = new Set([
                        ...(this.loadLocal('dcbd_deleted_product_ids', []) || []),
                        ...prodPatch.deleted
                      ].map(x => String(x || '').toLowerCase()));
                      this.saveLocal('dcbd_deleted_product_ids', Array.from(delSet));
                    }
                    const curProds = this.getMergedLocalProducts() || [];
                    const nextProds = this.mergeProductsLists(curProds, []);
                    this.sheetProducts = nextProds;
                    this.saveLocal('dcbd_sheet_products', nextProds);
                    if (typeof window !== 'undefined') {
                      if (window.__adminState) window.__adminState.products = nextProds;
                      window.dispatchEvent(new CustomEvent('dcbd:products-synced', { detail: { products: nextProds } }));
                    }
                  }
                } catch (e) {}
              } else if (k === 'DCBD_LIVE_ORDER_PATCHES_JSON') {
                try {
                  const ordPatch = JSON.parse(val);
                  if (ordPatch && typeof ordPatch === 'object') {
                    this.saveLocal('dcbd_live_order_patches', ordPatch);
                    const delSet = new Set([
                      ...(this.loadLocal('dcbd_deleted_order_ids', []) || []),
                      ...(Array.isArray(ordPatch.deleted) ? ordPatch.deleted : [])
                    ].map(x => String(x || '').toLowerCase()));
                    this.saveLocal('dcbd_deleted_order_ids', Array.from(delSet));
                    const patchOrders = Array.isArray(ordPatch.orders) ? ordPatch.orders : [];
                    const curOrders = this.loadLocal('dcbd_sheet_orders', []) || [];
                    const mergedOrders = deduplicateAndSortOrdersNewestFirst([...patchOrders, ...curOrders], delSet);
                    if (mergedOrders.length > 0) {
                      this.sheetOrders = mergedOrders;
                      this.saveLocal('dcbd_sheet_orders', mergedOrders);
                      if (typeof window !== 'undefined') {
                        if (window.__adminState) window.__adminState.orders = mergedOrders;
                        if (window.refreshAdminOrdersTableDOM) window.refreshAdminOrdersTableDOM();
                        window.dispatchEvent(new CustomEvent('dcbd:orders-synced', { detail: { orders: mergedOrders } }));
                      }
                    }
                  }
                } catch (e) {}
              } else if (k === 'DCBD_LIVE_BANNERS_JSON') {
                try {
                  const banPatch = JSON.parse(val);
                  if (banPatch && Array.isArray(banPatch.banners) && banPatch.banners.length > 0) {
                    if (Array.isArray(banPatch.deleted)) {
                      this.saveLocal('dcbd_deleted_banners', banPatch.deleted);
                    }
                    this.sheetBanners = banPatch.banners;
                    this.saveLocal('dcbd_sheet_banners', banPatch.banners);
                    if (typeof window !== 'undefined') {
                      if (window.__adminState) window.__adminState.banners = banPatch.banners;
                      window.dispatchEvent(new CustomEvent('dcbd:banners-synced', { detail: { banners: banPatch.banners } }));
                    }
                  }
                } catch (e) {}
              }
            });
          }
          localStorage.setItem('dcbd_site_settings', JSON.stringify(s));
          if (typeof window !== 'undefined') {
            if (window.__dcbdInitMarketingAdPixels) window.__dcbdInitMarketingAdPixels(true);
            if (window.refreshGlobalSiteChrome) window.refreshGlobalSiteChrome();
            if (window.hydrateWebsiteSettingsFormDOM) window.hydrateWebsiteSettingsFormDOM(s);
          }
        } catch (e) {}
        return {
          success: true,
          data: {
            ...s,
            shop_name: s.shopName,
            owners: "Jainal Abedin, MD. Saiful Islam",
            address: s.address,
            phone_1: s.hotline1,
            phone_2: s.hotline2,
            bkash_personal: "01879653143",
            bkash_merchant: s.hotline1,
            free_delivery_threshold: Number(s.freeDeliveryThreshold || 2000),
            online_discount: Number(s.onlineDiscountPct || 5)
          }
        };
      }

      case "banners/list": {
        const defaultBanners = [
          { banner_id: "BAN-01", title: "স্মার্ট কিচেন ও নিরাপদ কুকিং গ্যাজেট কালেকশন", subtitle: "সর্বোচ্চ ৩০% বিশেষ ছাড় চলছে!", image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80", link_url: "/products?cat=Kitchen", tag: "🔥 কিচেন স্পেশাল", cta_text: "এখনই কিনুন →", button_text: "কিচেন আইটেম দেখুন", position: 1, status: "Active" },
          { banner_id: "BAN-02", title: "১০০% খাঁটি অর্গানিক ফুড ও ন্যাচারাল হেলথ সাপ্লিমেন্ট", subtitle: "সুন্দরবনের প্রাকৃতিক চাকের মধু ও চিয়া সিড", image_url: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=1600&auto=format&fit=crop&q=80", link_url: "/products?cat=Organic%20%26%20Health", tag: "🌿 অর্গানিক ও ন্যাচারাল", cta_text: "অর্ডার করুন →", button_text: "অর্গানিক ফুড দেখুন", position: 2, status: "Active" }
        ];

        const deletedSet = new Set(this.loadLocal('dcbd_deleted_banners', []));
        const storedLocal = this.loadLocal('dcbd_sheet_banners', null);
        let localBanners = (Array.isArray(storedLocal) && storedLocal.length > 0)
          ? storedLocal
          : (Array.isArray(this.sheetBanners) && this.sheetBanners.length > 0 ? this.sheetBanners : []);
        localBanners = localBanners.filter(b => !deletedSet.has(String(b.banner_id || b.id || '').toLowerCase()));

        const mergeSheetAndLocalBanners = (rows) => {
          if (!Array.isArray(rows) || rows.length === 0) return null;
          const sheetBanners = rows.map((r, i) => {
            const rawTitleCell = safeStr(r.title || r.Title || r.col_1 || 'ব্যানার স্লাইডার');
            const titleParts = rawTitleCell.split(/\s*\|\|\s*/);
            const mainTitle = titleParts[0] || 'ব্যানার স্লাইডার';
            const subFromTitle = titleParts[1] || '';

            const rawLinkCell = safeStr(r.link || r.Link || r.link_url || r.col_3 || '/products');
            const linkParts = rawLinkCell.split(/\s*\|\|\s*/);
            const mainLink = linkParts[0] || '/products';
            const ctaFromLink = linkParts[1] || '';

            const bId = safeStr(r.banner_id || r.Banner_ID || r.col_0 || `BAN-${101 + i}`);
            return {
              banner_id: bId,
              id: bId,
              title: mainTitle,
              subtitle: safeStr(r.subtitle || r.Subtitle || subFromTitle || 'সেরা মানের শতভাগ অরিজিনাল পণ্যের সমাহার'),
              image_url: normalizeSingleImageUrl(r.image_url || r.Image_URL || r.col_2 || DEFAULT_PRODUCT_THUMB),
              link_url: mainLink,
              cta_text: safeStr(r.cta_text || r.button_text || ctaFromLink || 'এখনই কিনুন →'),
              button_text: safeStr(r.button_text || r.cta_text || ctaFromLink || 'এখনই দেখুন'),
              position: safeNumber(r.sort_order !== undefined ? r.sort_order : (r.Sort_Order !== undefined ? r.Sort_Order : r.col_4), i + 1),
              status: safeStr(r.status || r.Status || r.col_5 || 'Active'),
              created_at: safeStr(r.created_at || r.Created_At || r.col_6 || '')
            };
          }).filter(b => b.banner_id && b.banner_id.toLowerCase() !== 'banner_id' && !deletedSet.has(b.banner_id.toLowerCase()));

          if (sheetBanners.length === 0) return null;

          const byId = new Map();
          // Put local custom banners first so newly added banners appear at the top immediately
          localBanners.forEach(b => {
            const k = String(b.banner_id || b.id || '').toLowerCase();
            if (k && !['ban-01', 'ban-02'].includes(k)) {
              byId.set(k, b);
            }
          });
          sheetBanners.forEach(b => {
            const k = String(b.banner_id || b.id || '').toLowerCase();
            if (!k) return;
            if (byId.has(k)) {
              const loc = byId.get(k);
              byId.set(k, {
                ...b,
                ...loc,
                subtitle: loc.subtitle || b.subtitle,
                cta_text: loc.cta_text || b.cta_text,
                button_text: loc.button_text || loc.cta_text || b.button_text
              });
            } else {
              byId.set(k, b);
            }
          });
          localBanners.forEach(b => {
            const k = String(b.banner_id || b.id || '').toLowerCase();
            if (k && ['ban-01', 'ban-02'].includes(k) && !byId.has(k)) {
              byId.set(k, b);
            }
          });

          const merged = Array.from(byId.values()).sort((a, b) => Number(a.position || 99) - Number(b.position || 99));
          this.sheetBanners = merged;
          this.saveLocal('dcbd_sheet_banners', merged);
          if (typeof window !== 'undefined' && window.__adminState) {
            window.__adminState.banners = merged;
          }
          return merged;
        };

        // Fast instant return if localBanners already exist, while syncing from Google Sheet in background!
        if (localBanners && localBanners.length > 0 && !payload.force) {
          this.sheetBanners = localBanners;
          fetchLiveSheetRows('Banners', 'banners/list', 8000)
            .then(rows => {
              const prevJson = JSON.stringify(localBanners.map(b => b.banner_id + ':' + b.status + ':' + b.image_url));
              const merged = mergeSheetAndLocalBanners(rows);
              if (merged && typeof window !== 'undefined') {
                const nextJson = JSON.stringify(merged.map(b => b.banner_id + ':' + b.status + ':' + b.image_url));
                if (prevJson !== nextJson) {
                  window.dispatchEvent(new CustomEvent('dcbd:banners-synced', { detail: { banners: merged } }));
                }
              }
            })
            .catch(() => {});
          return { success: true, data: { items: localBanners, total: localBanners.length } };
        }

        try {
          const rows = await fetchLiveSheetRows('Banners', 'banners/list', 8000);
          const merged = mergeSheetAndLocalBanners(rows);
          if (merged && merged.length > 0) {
            return { success: true, data: { items: merged, total: merged.length } };
          }
        } catch (e) {}

        if (localBanners && localBanners.length > 0) {
          return { success: true, data: { items: localBanners, total: localBanners.length } };
        }

        this.sheetBanners = defaultBanners;
        this.saveLocal('dcbd_sheet_banners', defaultBanners);
        return { success: true, data: { items: defaultBanners, total: defaultBanners.length } };
      }

      case "admin/kpi": {
        const prods = await this.loadProductsFromSheet();
        const orders = this.sheetOrders || [];
        return {
          success: true,
          data: {
            total_sales: orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0) || 185000,
            total_orders: orders.length || 24,
            total_products: prods.length,
            low_stock_count: prods.filter(p => Number(p.stock) <= 5).length
          }
        };
      }

      default:
        await sendToAppsScript(action, payload);
        return { success: true, message: `Action ${action} handled` };
    }
  }
}

ApiClient.prototype.syncLiveServerState = async function(force = false) {
  if (typeof window === 'undefined') return null;
  if (this._serverStateSyncInflight) return this._serverStateSyncInflight;
  this._serverStateSyncInflight = (async () => {
    try {
      let localMeta = {};
      try {
        localMeta = JSON.parse(localStorage.getItem('dcbd_server_sync_meta') || '{}') || {};
      } catch (e) {}
      const sinceTs = force ? 0 : Number(this._lastServerSyncTs || localMeta._global || 0);
      const res = await fetchFromLocalServerApi('system/state', { since: sinceTs, full: force ? 1 : 0 }, 'GET', 3500);
      if (!res || !res.data) {
        // Fallback / Dual-Sync for GitHub Pages & Cross-Browser Google Sheet state
        const p = (window.location.pathname || '').toLowerCase();
        const isOrderView = p.includes('/admin') || p.includes('/track') || p.includes('/order') || p.includes('/customer');
        await Promise.all([
          this.request('settings/list').catch(() => null),
          this._fetchAndMergeProductsLive(this.sheetProducts || []).catch(() => null),
          this.loadCategoriesFromSheet(true).catch(() => null),
          this.loadBrandsFromSheet(true).catch(() => null),
          this.request('banners/list', { force: true }).catch(() => null),
          isOrderView ? this.request('orders/list', { force: true }).catch(() => null) : Promise.resolve(null)
        ]);
        return { status: 'success', success: true, engine: 'google_sheets_live_sync' };
      }
      if (!res.changed && !force) {
        // Even if local server cache hasn't changed, sync live Google Sheets Settings & Orders if on Admin
        this.request('settings/list').catch(() => null);
        if ((window.location.pathname || '').toLowerCase().includes('/admin')) {
          this.request('orders/list').catch(() => null);
        }
        return res;
      }

      const d = res.data;
      const srvMeta = (res.sync_meta && res.sync_meta.collections) || {};
      const rawGlobalUpdated = Number((res.sync_meta && (res.sync_meta.updated_at || res.sync_meta.version_ts)) || Date.now());
      const globalUpdated = (rawGlobalUpdated > 0 && rawGlobalUpdated < 1e11) ? rawGlobalUpdated * 1000 : rawGlobalUpdated;
      this._lastServerSyncTs = globalUpdated;
      localMeta._global = globalUpdated;

      let chromeNeedsRefresh = false;
      let ordersNeedsRefresh = false;

      if (d.settings && typeof d.settings === 'object') {
        const curSettings = getGlobalSiteSettings();
        const nextSettings = { ...curSettings, ...d.settings };
        localStorage.setItem('dcbd_site_settings', JSON.stringify(nextSettings));
        localMeta.settings = Number(srvMeta.settings || globalUpdated);
        chromeNeedsRefresh = true;
        if (window.__dcbdInitMarketingAdPixels) window.__dcbdInitMarketingAdPixels(true);
        if (window.hydrateWebsiteSettingsFormDOM) window.hydrateWebsiteSettingsFormDOM(nextSettings);
      }

      if (d.product_overrides && typeof d.product_overrides === 'object') {
        const curOv = this.loadLocal('dcbd_local_product_overrides', {}) || {};
        this.saveLocal('dcbd_local_product_overrides', { ...curOv, ...d.product_overrides });
      }
      if (Array.isArray(d.deleted_products) && d.deleted_products.length > 0) {
        const curDel = new Set([...(this.loadLocal('dcbd_deleted_product_ids', []) || []), ...d.deleted_products].map(x => String(x || '').toLowerCase()));
        this.saveLocal('dcbd_deleted_product_ids', Array.from(curDel));
      }
      if (Array.isArray(d.deleted_orders) && d.deleted_orders.length > 0) {
        const curDelOrd = new Set([...(this.loadLocal('dcbd_deleted_order_ids', []) || []), ...d.deleted_orders].map(x => String(x || '').toLowerCase()));
        this.saveLocal('dcbd_deleted_order_ids', Array.from(curDelOrd));
      }

      if (Array.isArray(d.orders)) {
        const delSet = new Set((this.loadLocal('dcbd_deleted_order_ids', []) || []).map(x => String(x || '').toLowerCase()));
        const localOrders = this.loadLocal('dcbd_sheet_orders', []);
        const mergedOrders = deduplicateAndSortOrdersNewestFirst([...d.orders, ...(Array.isArray(localOrders) ? localOrders : [])], delSet);
        if (mergedOrders.length > 0 || d.orders.length === 0) {
          this.sheetOrders = mergedOrders;
          this.saveLocal('dcbd_sheet_orders', mergedOrders);
          if (window.__adminState) window.__adminState.orders = mergedOrders;
          localMeta.orders = Number(srvMeta.orders || globalUpdated);
          ordersNeedsRefresh = true;
        }
      }

      if (Array.isArray(d.incomplete_orders) && d.incomplete_orders.length > 0) {
        this.sheetIncompleteOrders = d.incomplete_orders;
        this.saveLocal('dcbd_sheet_incomplete_orders', d.incomplete_orders);
        if (window.__adminState) window.__adminState.incompleteOrders = d.incomplete_orders;
        ordersNeedsRefresh = true;
      }

      if (Array.isArray(d.products) && d.products.length > 0) {
        const mergedProds = this.mergeProductsLists(d.products, this.sheetProducts || []);
        this.sheetProducts = mergedProds;
        this.saveLocal('dcbd_sheet_products', mergedProds);
        if (window.__adminState) window.__adminState.products = mergedProds;
        localMeta.products = Number(srvMeta.products || globalUpdated);
        window.dispatchEvent(new CustomEvent('dcbd:products-synced', { detail: { products: mergedProds } }));
      }

      if (Array.isArray(d.categories) && d.categories.length > 0) {
        const finalCats = aggregateCategoryRows(d.categories, this.sheetCategories || []);
        if (finalCats.length > 0) {
          this.sheetCategories = finalCats;
          this.saveLocal('dcbd_sheet_categories', finalCats);
          if (window.__adminState) window.__adminState.categories = finalCats;
          localMeta.categories = Number(srvMeta.categories || globalUpdated);
        }
      }

      if (Array.isArray(d.brands) && d.brands.length > 0) {
        this.sheetBrands = d.brands;
        this.saveLocal('dcbd_sheet_brands', d.brands);
        if (window.__adminState) window.__adminState.brands = d.brands;
        localMeta.brands = Number(srvMeta.brands || globalUpdated);
      }

      if (Array.isArray(d.banners) && d.banners.length > 0) {
        this.sheetBanners = d.banners;
        this.saveLocal('dcbd_sheet_banners', d.banners);
        if (window.__adminState) window.__adminState.banners = d.banners;
        localMeta.banners = Number(srvMeta.banners || globalUpdated);
      }

      if (Array.isArray(d.payment_methods) && d.payment_methods.length > 0) {
        localStorage.setItem('dcbd_payment_methods', JSON.stringify(d.payment_methods));
        localMeta.payment_method = Number(srvMeta.payment_method || globalUpdated);
      }

      if (Array.isArray(d.delivery_methods) && d.delivery_methods.length > 0) {
        localStorage.setItem('dcbd_delivery_methods', JSON.stringify(d.delivery_methods));
        localMeta.delivery_area = Number(srvMeta.delivery_area || globalUpdated);
      }

      if (Array.isArray(d.offers) && d.offers.length > 0) {
        localStorage.setItem('dcbd_sheet_offers', JSON.stringify(d.offers));
        if (window.__adminState) window.__adminState.offers = d.offers;
        localMeta.offer_or_coupon = Number(srvMeta.offer_or_coupon || globalUpdated);
      }

      if (Array.isArray(d.landing_pages) && d.landing_pages.length > 0) {
        this.saveLocal('dcbd_landing_pages', d.landing_pages);
        if (window.__adminState) window.__adminState.landingPages = d.landing_pages;
        localMeta.landing_pages = Number(srvMeta.landing_pages || globalUpdated);
      }

      if (Array.isArray(d.customers) && d.customers.length > 0) {
        this.sheetCustomers = d.customers;
        this.saveLocal('dcbd_sheet_customers', d.customers);
        if (window.__adminState) window.__adminState.customers = d.customers;
      }

      if (Array.isArray(d.reviews) && d.reviews.length > 0) {
        this.saveLocal('dcbd_sheet_reviews', d.reviews);
        if (window.__adminState) window.__adminState.reviews = d.reviews;
      }

      if (Array.isArray(d.resellers) && d.resellers.length > 0) {
        this.saveLocal('dcbd_resellers', d.resellers);
        if (window.__adminState) window.__adminState.resellers = d.resellers;
      }

      if (Array.isArray(d.wholesalers) && d.wholesalers.length > 0) {
        this.saveLocal('dcbd_wholesalers', d.wholesalers);
        if (window.__adminState) window.__adminState.wholesalers = d.wholesalers;
      }

      if (Array.isArray(d.sellers) && d.sellers.length > 0) {
        this.saveLocal('dcbd_sellers', d.sellers);
        if (window.__adminState) window.__adminState.sellers = d.sellers;
      }

      if (Array.isArray(d.markets) && d.markets.length > 0) {
        this.saveLocal('dcbd_markets', d.markets);
        if (window.__adminState) window.__adminState.markets = d.markets;
      }

      localStorage.setItem('dcbd_server_sync_meta', JSON.stringify(localMeta));

      if (chromeNeedsRefresh && window.refreshGlobalSiteChrome) {
        window.refreshGlobalSiteChrome();
      }
      if (ordersNeedsRefresh && window.refreshAdminOrdersTableDOM) {
        window.refreshAdminOrdersTableDOM();
      }
      if (ordersNeedsRefresh && window.renderIncompleteOrdersTableDOM) {
        window.renderIncompleteOrdersTableDOM();
      }
      return res;
    } catch (err) {
      return null;
    } finally {
      this._serverStateSyncInflight = null;
    }
  })();
  return this._serverStateSyncInflight;
};

export const apiClient = new ApiClient();

if (typeof window !== 'undefined') {
  window.__dcbdGetSiteSettings = getGlobalSiteSettings;
  window.__dcbdGetPaymentMethods = getGlobalPaymentMethods;
  window.__dcbdGetDeliveryMethods = getGlobalDeliveryMethods;
  window.__dcbdGetOffers = getGlobalOffers;
  window.deduplicateAndSortOrdersNewestFirst = deduplicateAndSortOrdersNewestFirst;
}
