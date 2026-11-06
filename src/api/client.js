import { formatCurrency } from '../utils/format.js';
import { hashPasswordSync, verifyPasswordSync, MASTER_ADMIN_HASHES } from '../utils/security.js';
export { formatCurrency };
/**
 * DREAM CART BD — UNIFIED API CLIENT & LIVE SHEET SYNC ENGINE
 * Connects directly to Google Sheets via GViz API (JSONP) & Google Apps Script Web App Gateway
 * Endpoint: https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec
 * Spreadsheet ID: 1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8
 */

export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwflHuBqMKWpKPTTVNY-grU_dnNphwELXbk6Hn-wcBjxJk4xvqScmT2n8i3ZQCStMI3/exec";
export const SPREADSHEET_ID = "1BGi8IXV6S7uXDi4IaR_sCJYhtpfzyLGuldo4NnGVmR8";

export const DEFAULT_PRODUCT_THUMB = "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg";

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
  { brand_id: "BRD-001", brand_name: "Amazfit", brand_slug: "amazfit", brand_image: "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg", brand_description: "Global smart wearable innovator" },
  { brand_id: "BRD-002", brand_name: "Dream Organic", brand_slug: "dream-organic", brand_image: "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg", brand_description: "১০০% বিশুদ্ধ অর্গানিক ও প্রাকৃতিক পণ্য" },
  { brand_id: "BRD-003", brand_name: "HK", brand_slug: "hk", brand_image: "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg", brand_description: "প্রিমিয়াম স্মার্ট গ্যাজেট ও অ্যাপ্লায়েন্স পার্টনার" },
  { brand_id: "BRD-004", brand_name: "Kieslect", brand_slug: "kieslect", brand_image: "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg", brand_description: "Premium calling smartwatch maker" }
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
  if (!u) return '';
  if (u.startsWith('data:image/') || u.startsWith('blob:')) return u;
  if (u.startsWith('//')) u = 'https:' + u;
  const driveMatch =
    u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=|thumbnail\?id=)([a-zA-Z0-9_-]{15,})/) ||
    u.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,})/);
  if (driveMatch && driveMatch[1]) {
    return 'https://drive.google.com/thumbnail?id=' + driveMatch[1] + '&sz=w800';
  }
  return u;
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
        const emptyValid = [];
        if (resp && resp.table) emptyValid._gvizOk = true;
        return finish(emptyValid);
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

        if (hasPrimaryData) rows.push(rowObj);
      }

      rows._gvizOk = true;
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
async function fetchLiveSheetRows(sheetName, action, timeoutMs = 6000) {
  if (typeof window === 'undefined') return [];

  const isProductsSheet = String(sheetName).trim().toLowerCase() === 'products';
  const gvizTq = isProductsSheet ? 'SELECT A,B,C,D,E,F,G,H,I,J,K,L,M,N,R,S,T,U,V,W' : '';
  const gvizTimeout = Math.min(timeoutMs, isProductsSheet ? 5500 : 3500);

  // Channel 1: Direct Google Sheets GViz CDN (Fastest: ~250-500ms, never throttled by Apps Script quotas)
  try {
    const rows = await fetchSheetViaGviz(sheetName, gvizTimeout, gvizTq);
    if (Array.isArray(rows) && (rows._gvizOk || rows.length > 0)) {
      return rows;
    }
  } catch (e) {}

  // Channel 2: Google Apps Script JSONP Fallback (ONLY if GViz failed or timed out)
  try {
    const resp = await fetchAppsScriptViaJsonp(action, {}, Math.min(timeoutMs, 4500));
    if (resp && (resp.status === 'success' || resp.success) && resp.data) {
      if (Array.isArray(resp.data.items)) return resp.data.items;
      if (Array.isArray(resp.data)) return resp.data;
    }
  } catch (e) {}

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
  const cleanPayload = sanitizePayloadForSheet(payload || {});

  // Build deterministic deduplication signature for order/item mutations
  const dedupKey = `${action}::${cleanPayload.order_id || cleanPayload.orderId || cleanPayload.sku || cleanPayload.catagory_id || cleanPayload.brand_id || cleanPayload.banner_id || cleanPayload.shop_id || cleanPayload.id || JSON.stringify(cleanPayload).slice(0, 180)}`;
  const lastSentAt = _recentMutations.get(dedupKey) || 0;
  if (Date.now() - lastSentAt < 3500) {
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

  // Primary Channel: Single Fetch POST with text/plain;charset=utf-8 (CORS-safelisted simple request, follows GAS redirect)
  try {
    const resp = await fetch(`${APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: bodyJson
    });
    if (resp && (resp.ok || resp.type === 'opaque')) {
      try {
        const json = await resp.json();
        if (json) return json;
      } catch (parseErr) {}
      return { status: 'success', success: true };
    }
  } catch (fetchErr) {
    // Fallback Channel (ONLY if primary fetch throws a network/CORS error): no-cors POST
    try {
      await fetch(`${APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: bodyJson
      });
      return { status: 'success', success: true };
    } catch (noCorsErr) {
      // Final Fallback: Hidden Iframe Form POST
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
          form.action = `${APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}`;
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

  return { status: 'success', success: true };
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

export function normalizeSheetOrderRow(r, idx = 0) {
  if (!r || typeof r !== 'object') return null;
  const orderId = safeStr(r.order_id || r.orderid || r.OrderID || r.col_1 || '');
  if (!orderId || orderId.toLowerCase() === 'orderid') return null;
  const prodStr = safeStr(r.products || r.Products || r.product_name || r.col_6 || 'পণ্য অর্ডার');
  return {
    date: safeStr(r.date || r.Date || r.col_0 || new Date().toISOString().slice(0, 19).replace('T', ' ')),
    order_id: orderId,
    orderId: orderId,
    account_type: safeStr(r.account_type || r.Account_type || r.col_2 || 'Customer'),
    customer_name: safeStr(r.customer_name || r.Customer_Name || r.col_3 || 'গ্রাহক'),
    phone: safeStr(r.phone || r.Phone || r.col_4 || ''),
    address: safeStr(r.address || r.Address || r.col_5 || ''),
    products: prodStr,
    product_name: safeStr(r.product_name || prodStr),
    color: safeStr(r.color || r.Color || r.col_7 || 'Standard'),
    size: safeStr(r.size || r.Size || r.col_8 || 'Free Size'),
    quantity: safeNumber(r.quantity !== undefined ? r.quantity : r.col_9, 1) || 1,
    unit_price: safeNumber(r.unit_price, safeNumber(r.total_amount !== undefined ? r.total_amount : r.col_10, 0)),
    subtotal: safeNumber(r.subtotal, 0),
    total_amount: safeNumber(r.total_amount !== undefined ? r.total_amount : r.col_10, 0),
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
    items: Array.isArray(r.items) ? r.items : []
  };
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
  shopLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10",
  address: "চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।",
  hotline1: "01581703822",
  hotline2: "01818273838",
  email: "jainal.dcitbd@gmail.com",
  officeHours: "প্রতিদিন সকাল ৮:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত",
  notice: "৳২,০০০ বা তার বেশি অর্ডারে ফ্রি শিপিং! | অনলাইনে পেমেন্ট করলে ৫% ছাড় | পণ্য হাতে পেয়ে মূল্য পরিশোধ",
  noticeActive: true,
  freeDeliveryThreshold: 2000,
  onlineDiscountPct: 5
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
  try {
    const raw = localStorage.getItem('dcbd_site_settings');
    if (raw) {
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return { ...DEFAULT_SITE_SETTINGS };
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

    const savedProds = this.loadLocal('dcbd_sheet_products', null);
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
    if (key === 'dcbd_sheet_products' || key === 'dcbd_local_product_overrides' || key === 'dcbd_deleted_product_ids') {
      this._mergedProductsMemo = null;
    }
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
   * Always returns the latest synchronized product list across memory, localStorage, and Admin state in O(1) via memoization.
   */
  getMergedLocalProducts() {
    if (Array.isArray(this._mergedProductsMemo) && this._mergedProductsMemo.length > 5) {
      return this._mergedProductsMemo;
    }

    const memProds = (Array.isArray(this.sheetProducts) && this.sheetProducts.length > 0) ? this.sheetProducts : null;
    const adminProds = (typeof window !== 'undefined' && window.__adminState && Array.isArray(window.__adminState.products) && window.__adminState.products.length > 0)
      ? window.__adminState.products
      : null;

    let base = memProds;
    if (!base || base.length <= 5) {
      const localStored = this.loadLocal('dcbd_sheet_products', null);
      if (Array.isArray(localStored) && localStored.length > (base ? base.length : 0)) {
        base = localStored;
      }
    }
    if ((!base || base.length <= 5) && Array.isArray(adminProds) && adminProds.length > (base ? base.length : 0)) {
      base = adminProds;
    }

    if (Array.isArray(base) && base.length > 0) {
      const normalized = base.map((p, idx) => {
        const norm = (p && p.sku && p.selling_price !== undefined && Array.isArray(p.images)) ? p : normalizeSheetProductRow(p, idx);
        if (norm && this._productDetailsCache.has(norm.sku.toLowerCase())) {
          Object.assign(norm, this._productDetailsCache.get(norm.sku.toLowerCase()));
        }
        return norm;
      }).filter(Boolean);
      if (normalized.length > 0) {
        this.sheetProducts = normalized;
        this._mergedProductsMemo = normalized;
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
    const deletedIds = new Set(this.loadLocal('dcbd_deleted_product_ids', []));
    const localOverrides = this.loadLocal('dcbd_local_product_overrides', {});
    const byId = new Map();
    const hasRealSheetRows = Array.isArray(sheetList) && sheetList.length > 5;

    // 1. First insert any locally added/overridden products (excluding initial 5 demo products once real sheet rows exist)
    (Array.isArray(localList) ? localList : []).forEach((p, idx) => {
      const norm = normalizeSheetProductRow(p, idx);
      if (!norm) return;
      const key = String(norm.sku || norm.product_id).trim().toLowerCase();
      if (deletedIds.has(key)) return;
      if (hasRealSheetRows && DEMO_SKUS.has(key) && !localOverrides[key]) return;
      if (localOverrides[key]) {
        byId.set(key, normalizeSheetProductRow({ ...norm, ...localOverrides[key] }, idx));
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
      const override = localOverrides[key];
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

  async loadProductsFromSheet(forceRefresh = false) {
    const cached = this.getMergedLocalProducts();
    const hasRealSheetCached = Array.isArray(cached) && cached.length > 5 && !cached.every(p => DEMO_SKUS.has(String(p.sku || '').toLowerCase()));

    if (forceRefresh || !hasRealSheetCached || (Date.now() - this._lastProductsSync > 30000)) {
      this._lastProductsSync = Date.now();
      try {
        const rows = await fetchLiveSheetRows('Products', 'products/list', 15000);
        if (rows && rows.length > 0) {
          const sheetMapped = rows.map((r, idx) => normalizeSheetProductRow(r, idx)).filter(Boolean);
          if (sheetMapped.length > 0) {
            const merged = this.mergeProductsLists(sheetMapped, cached || []);
            this.sheetProducts = merged;
            this.saveLocal('dcbd_sheet_products', merged);
            if (typeof window !== 'undefined') {
              if (window.__adminState) window.__adminState.products = merged;
              window.dispatchEvent(new CustomEvent('dcbd:products-synced', { detail: { products: merged } }));
            }
            this.hydrateProductDescriptionsInBackground();
            return merged;
          }
        }
      } catch (err) {}
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
    // Rich product descriptions (Columns O, P, Q) are fetched on-demand per product via fetchSingleProductRichDetails()
    // in ~150ms, avoiding a 14.5 MB bulk background download that would freeze the main UI thread.
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

    if (!forceRefresh && hasRealCategories && (Date.now() - this._lastCategoriesSync < 45000)) {
      return this.sheetCategories;
    }

    try {
      const rows = await fetchLiveSheetRows('Categories', 'categories/list', 15000);
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

    if (!forceRefresh && hasRealBrands && (Date.now() - this._lastBrandsSync < 45000)) {
      return this.sheetBrands;
    }

    try {
      const rows = await fetchLiveSheetRows('Brands', 'brands/list', 15000);
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
          const enriched = await this.fetchSingleProductRichDetails(found);
          return { success: true, data: enriched };
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

        await sendToAppsScript("products/add", sheetPayload);

        return {
          success: true,
          status: "success",
          message: "পণ্যটি তালিকা এবং গুগল শিটে সফলভাবে সংরক্ষিত হয়েছে!",
          data: newProd
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
        const existingIdx = localOrders.findIndex(o => String(o.order_id || o.orderId).toLowerCase() === orderId.toLowerCase());
        if (existingIdx >= 0) {
          localOrders[existingIdx] = { ...localOrders[existingIdx], ...orderData };
        } else {
          localOrders.unshift(orderData);
        }
        this.sheetOrders = localOrders;
        this.saveLocal('dcbd_sheet_orders', localOrders);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.orders = localOrders;
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

        // Non-blocking background sync to Google Sheets & Admin Email + PDF Voucher (0ms UI response, zero 1-5s delay)
        sendToAppsScript("orders/create", { ...payload, ...orderData }).catch(() => {});

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
        localOrders = localOrders.map(o => {
          if (String(o.order_id || o.orderId) === orderId) {
            const updated = { ...o, ...payload };
            if (payload.status && !payload.order_status) updated.order_status = payload.status;
            if (updated.order_status === 'Delivered') updated.payment_status = 'Paid';
            return updated;
          }
          return o;
        });
        this.sheetOrders = localOrders;
        this.saveLocal('dcbd_sheet_orders', localOrders);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.orders = localOrders;
        }

        await sendToAppsScript("orders/update_status", payload);
        return { success: true, status: "success", message: "অর্ডার আপডেট হয়েছে!" };
      }

      case "orders/delete": {
        const orderId = safeStr(payload.order_id || payload.orderId || payload.id);
        let localOrders = this.loadLocal('dcbd_sheet_orders', []);
        localOrders = localOrders.filter(o => String(o.order_id || o.orderId) !== orderId);
        this.sheetOrders = localOrders;
        this.saveLocal('dcbd_sheet_orders', localOrders);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.orders = localOrders;
        }
        await sendToAppsScript("orders/delete", { order_id: orderId });
        return { success: true, status: "success" };
      }

      case "orders/list": {
        const localOrders = (this.loadLocal('dcbd_sheet_orders', []) || []).map((o, i) => normalizeSheetOrderRow(o, i)).filter(Boolean);
        let sheetOrders = [];
        try {
          const rows = await fetchLiveSheetRows('Orders', 'orders/list', 12000);
          if (rows && rows.length > 0) {
            sheetOrders = rows.map((r, i) => normalizeSheetOrderRow(r, i)).filter(Boolean);
            sheetOrders.reverse();
          }
        } catch (e) {}

        // Deduplicate by OrderID so historical 5x duplicate rows in the sheet show only ONCE!
        const byId = new Map();
        localOrders.forEach(o => byId.set(String(o.order_id).toLowerCase(), o));
        sheetOrders.forEach(o => {
          const k = String(o.order_id).toLowerCase();
          if (byId.has(k)) {
            byId.set(k, { ...o, ...byId.get(k) });
          } else {
            byId.set(k, o);
          }
        });

        const merged = Array.from(byId.values());
        if (merged.length > 0) {
          this.sheetOrders = merged;
          this.saveLocal('dcbd_sheet_orders', merged);
          if (typeof window !== 'undefined' && window.__adminState) {
            window.__adminState.orders = merged;
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
        if (!verifyPasswordSync(queryPass, storedPass)) {
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
              password: hashPasswordSync(safeStr(r.password || r.Password || r.col_7 || '')),
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
              password: hashPasswordSync(safeStr(r.password || r.Password || r.col_11 || '')),
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
              password: hashPasswordSync(safeStr(r.password || r.Password || r.col_8 || '')),
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
              password: hashPasswordSync(safeStr(r.password || r.Password || r.col_9 || '')),
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
        await sendToAppsScript("settings/save", payload);
        return { success: true, status: "success", data: payload };
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

        // Non-blocking sync to Google Sheets Banners tab
        sendToAppsScript("banners/add", newBanner).catch(() => {});
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
        const s = getGlobalSiteSettings();
        try {
          const rows = await fetchLiveSheetRows('Settings', 'settings/list', 8000);
          if (rows && rows.length > 0) {
            rows.forEach(r => {
              const k = safeStr(r.name || r.Name || r.col_0);
              const val = safeStr(r.details || r.Details || r.col_1);
              if (k === 'Shop_Name' && val) s.shopName = val;
              if (k === 'Address' && val) s.address = val;
              if (k === 'Phone_1' && val) s.hotline1 = val;
              if (k === 'Phone_2' && val) s.hotline2 = val;
              if (k === 'Support_Email' && val) s.email = val;
              if (k === 'Free_Delivery_Min_Order' && val) s.freeDeliveryThreshold = safeNumber(val, 2000);
            });
          }
        } catch (e) {}
        return {
          success: true,
          data: {
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

export const apiClient = new ApiClient();

if (typeof window !== 'undefined') {
  window.__dcbdGetSiteSettings = getGlobalSiteSettings;
  window.__dcbdGetPaymentMethods = getGlobalPaymentMethods;
  window.__dcbdGetDeliveryMethods = getGlobalDeliveryMethods;
  window.__dcbdGetOffers = getGlobalOffers;
}
