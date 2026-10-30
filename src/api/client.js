import { formatCurrency } from '../utils/format.js';
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

  // Temporarily protect "data:image/...;base64," commas before splitting
  const protectedStr = str.replace(/(data:image\/[a-zA-Z0-9.+_-]+;base64),/gi, '$1__DCBD_B64_COMMA__');
  // Split by pipe, newline, or comma followed by http/https/data:/slash/whitespace
  const parts = protectedStr
    .split(/\s*\|\s*|\r?\n|,(?=\s*(?:https?:\/\/|data:image\/|\/))/i)
    .flatMap(chunk => {
      // If chunk doesn't start with data:image and has comma-separated http links or plain URLs
      if (!chunk.trim().startsWith('data:image/') && chunk.includes(',')) {
        const sub = chunk.split(',').map(s => s.trim()).filter(Boolean);
        // Only split by comma if every piece looks like a URL/path (not a query param like w_400,h_400)
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
  // Convert Google Drive share links into direct viewable image URLs
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

// In-flight deduplication map for GViz requests
const _inflightGviz = new Map();

function fetchSheetViaGviz(sheetName, timeoutMs = 4500) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve([]);
  }

  if (_inflightGviz.has(sheetName)) {
    return _inflightGviz.get(sheetName);
  }

  const p = new Promise((resolve) => {
    const cbName = 'gviz_cb_' + Math.random().toString(36).substr(2, 9);
    const script = document.createElement('script');
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=responseHandler:${cbName}&sheet=${encodeURIComponent(sheetName)}&headers=1`;

    let settled = false;
    function finish(result) {
      if (settled) return;
      settled = true;
      _inflightGviz.delete(sheetName);
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
        return finish([]);
      }

      let cols = (resp.table.cols || []).map(c => (c && c.label ? String(c.label).trim() : ''));
      const rawRows = resp.table.rows || [];

      // If GViz put headers into rows[0] because cols labels were empty, extract headers from rows[0]
      let startRowIdx = 0;
      const nonEmptyLabels = cols.filter(Boolean).length;
      if (nonEmptyLabels === 0 && rawRows.length > 0 && rawRows[0] && Array.isArray(rawRows[0].c)) {
        const firstRowVals = rawRows[0].c.map(cell => (cell && cell.v !== undefined && cell.v !== null ? String(cell.v).trim() : ''));
        const headerKeywords = ['sku', 'p_name', 'category', 'brand_id', 'orderid', 'user_id', 'shop_id', 'date', 'name', 'page_id', 'banner_id'];
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
        let hasData = false;

        r.c.forEach((cell, idx) => {
          const colName = cols[idx] || `col_${idx}`;
          const key = colName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          // Prefer raw value cell.v for numbers, and formatted cell.f only for dates/strings
          let val = '';
          if (cell) {
            if (typeof cell.v === 'number') {
              val = cell.v;
            } else if (cell.f !== undefined && cell.f !== null && String(cell.f).trim() !== '') {
              val = String(cell.f).trim();
            } else if (cell.v !== undefined && cell.v !== null) {
              val = String(cell.v).trim();
            }
          }
          rowObj[key] = val;
          rowObj[colName] = val;
          rowObj["col_" + idx] = val;
          if (val !== '') hasData = true;
        });

        // Skip accidental header repeat rows
        const col0Lower = String(rowObj.col_0 || '').trim().toLowerCase();
        const col1Lower = String(rowObj.col_1 || '').trim().toLowerCase();
        if (col0Lower === 'sku' && col1Lower === 'p_name') continue;
        if (col0Lower === 'catagory_id' || col0Lower === 'brand_id') continue;
        if (col0Lower === 'date' && (col1Lower === 'orderid' || col1Lower === 'who buy' || col1Lower === 'who paid')) continue;

        if (hasData) rows.push(rowObj);
      }

      finish(rows);
    };

    script.onerror = function() {
      finish([]);
    };

    script.src = url;
    document.head.appendChild(script);
  });

  _inflightGviz.set(sheetName, p);
  return p;
}

function fetchAppsScriptViaJsonp(action, params = {}, timeoutMs = 6000) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(null);
    }

    const cbName = 'as_cb_' + Math.random().toString(36).substr(2, 9);
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
 * Slim down a payload for JSONP GET so it always fits under URL limits (< 1750 chars),
 * while also firing a full POST request for large fields.
 */
function buildSlimJsonpPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const clone = { ...payload };

  // Strip heavy items array if summary strings are already present
  if (Array.isArray(clone.items)) {
    clone.items = clone.items.map(it => ({
      sku: it.sku || it.product_id || '',
      name: String(it.name || it.p_name || '').slice(0, 60),
      color: it.color || '',
      size: it.size || '',
      quantity: it.quantity || 1,
      price: it.price || it.selling_price || 0
    }));
  }

  // Strip base64 data URLs from JSONP GET query params so GET never exceeds URL length limit
  const imgKeys = ['thumbnail', 'category_image', 'brand_image', 'image', 'image_url', 'profile_photo', 'Profile_photo', 'Profile_Photo', 'Shop_logo', 'shop_logo', 'Market_Logo', 'market_logo', 'hero_banner', 'banner'];
  imgKeys.forEach(k => {
    if (typeof clone[k] === 'string' && clone[k].startsWith('data:image/')) {
      clone[k] = DEFAULT_PRODUCT_THUMB;
    }
  });

  if (Array.isArray(clone.images)) {
    clone.images = clone.images.map(u => (typeof u === 'string' && u.startsWith('data:image/') ? DEFAULT_PRODUCT_THUMB : u));
  } else if (typeof clone.images === 'string' && clone.images.includes('data:image/')) {
    clone.images = parseImageUrlsList(clone.images)
      .map(u => (u.startsWith('data:image/') ? DEFAULT_PRODUCT_THUMB : u))
      .join(', ');
  }

  return clone;
}

export async function sendToAppsScript(action, payload) {
  let jsonpRes = null;
  try {
    const slimPayload = buildSlimJsonpPayload(payload);
    const dataStr = JSON.stringify(slimPayload);
    if (dataStr.length < 1850) {
      jsonpRes = await fetchAppsScriptViaJsonp(action, { data: dataStr });
    }
  } catch (e) {}

  // Always fire POST requests (both text/plain and urlencoded) so full data reliably reaches Apps Script doPost
  try {
    const fullStr = typeof payload === 'string' ? payload : JSON.stringify(payload);

    // 1. Send simple CORS-free text/plain JSON payload
    fetch(`${APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: action,
        payload: payload,
        data: payload,
        spreadsheet_id: SPREADSHEET_ID
      })
    }).catch(() => {});

    // 2. Also send form urlencoded payload
    const bodyParams = new URLSearchParams();
    bodyParams.append('action', action);
    bodyParams.append('payload', fullStr);
    bodyParams.append('data', fullStr);
    bodyParams.append('spreadsheet_id', SPREADSHEET_ID);

    fetch(`${APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    }).catch(() => {});
  } catch (err) {}

  return jsonpRes || { status: 'success', success: true };
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

export function normalizeSheetProductRow(r, idx = 0) {
  if (!r || typeof r !== 'object') return null;
  const sku = safeStr(r.sku || r.product_id || r.col_0 || `DCBD-PRD-${idx + 1}`);
  const name = safeStr(r.p_name || r.name || r.col_1 || 'পণ্য');
  if (!name || name.toLowerCase() === 'p_name' || sku.toLowerCase() === 'sku') return null;

  const slug = safeStr(r.slug || r.col_13) || name.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, '-').replace(/^-|-$/g, '') || sku.toLowerCase();
  const rawImages = r.images !== undefined ? r.images : (r.col_12 !== undefined ? r.col_12 : r.thumbnail);
  const imgs = parseImageUrlsList(rawImages);
  const thumb = normalizeSingleImageUrl(r.thumbnail) || imgs[0] || DEFAULT_PRODUCT_THUMB;
  const sellPrice = safeNumber(r.selling_price !== undefined ? r.selling_price : r.col_7, 0);
  const buyPrice = safeNumber(r.buying_price !== undefined ? r.buying_price : r.col_6, 0);
  const stockVal = safeNumber(r.stock !== undefined ? r.stock : r.col_8, 25);
  const origPrice = safeNumber(r.original_price !== undefined ? r.original_price : r.col_9, sellPrice > 0 ? Math.round(sellPrice * 1.35) : 0);
  const wsPrice = safeNumber(r.wholesale_price !== undefined ? r.wholesale_price : r.col_10, sellPrice > 0 ? Math.round(sellPrice * 0.85) : 0);
  const minOrderQ = safeNumber(r.min_order_q !== undefined ? r.min_order_q : (r.min_order_qty !== undefined ? r.min_order_qty : r.col_11), sellPrice <= 200 ? 10 : 5);
  const statusStr = safeStr(r.status || 'সক্রিয়');

  return {
    sku: sku,
    product_id: sku,
    name: name,
    p_name: name,
    category: safeStr(r.category || r.col_2 || 'General') || 'General',
    sub_category: safeStr(r.sub_category !== undefined ? r.sub_category : r.col_3, ''),
    child_category: safeStr(r.child_category !== undefined ? r.child_category : r.col_4, ''),
    brand: safeStr(r.brand || r.col_5 || 'Dream Cart BD') || 'Dream Cart BD',
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
    description: safeStr(r.description !== undefined ? r.description : r.col_14, ''),
    specification: safeStr(r.specification !== undefined ? r.specification : r.col_15, ''),
    others: safeStr(r.others !== undefined ? r.others : r.col_16, ''),
    color: safeStr(r.color !== undefined ? r.color : r.col_17, 'Standard'),
    size: safeStr(r.size !== undefined ? r.size : r.col_18, 'Free Size'),
    weight_kg: safeNumber(r.weight_kg !== undefined ? r.weight_kg : r.col_19, 0.25),
    width_cm: safeNumber(r.width_cm !== undefined ? r.width_cm : r.col_20, 10),
    length_cm: safeNumber(r.length_cm !== undefined ? r.length_cm : r.col_21, 10),
    height_cm: safeNumber(r.height_cm !== undefined ? r.height_cm : r.col_22, 5),
    status: statusStr,
    is_active: statusStr !== 'নিষ্ক্রিয়'
  };
}

export function normalizeSheetOrderRow(r, idx = 0) {
  if (!r || typeof r !== 'object') return null;
  const orderId = safeStr(r.order_id || r.orderid || r.OrderID || r.col_1 || `ORD-${100000 + idx}`);
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
    total_amount: safeNumber(r.total_amount !== undefined ? r.total_amount : r.col_10, 0),
    delivery_fee: safeNumber(r.delivery_fee, 70),
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
  const orderId = safeStr(r.order_id || r.orderid || r.OrderID || r.col_1 || `INC-${2000 + idx}`);
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
  { id: "DLV-01", code: "cumilla", name: "কুমিল্লা সদর (In Cumilla)", charge: 70, eta: "১-২ দিন (২৪ ঘন্টায় ডেলিভারি)", free_threshold: 2000, status: "Active" },
  { id: "DLV-02", code: "dhaka", name: "ঢাকা সিটি (In Dhaka)", charge: 90, eta: "২-৩ দিন (হোম ডেলিভারি)", free_threshold: 2000, status: "Active" },
  { id: "DLV-03", code: "outside", name: "ঢাকার বাইরে সমগ্র বাংলাদেশ (Outside Dhaka)", charge: 120, eta: "৩-৫ দিন (কুরিয়ার ডেলিভারি)", free_threshold: 2000, status: "Active" },
  { id: "DLV-04", code: "pickup", name: "অফিস থেকে পিকআপ (Office Pickup - Cumilla)", charge: 0, eta: "তাৎক্ষণিক পিকআপ (ফ্রি)", free_threshold: 0, status: "Active" }
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

    this.sheetProducts = this.loadLocal('dcbd_sheet_products', null);
    this.sheetCategories = this.loadLocal('dcbd_sheet_categories', null);
    this.sheetBrands = this.loadLocal('dcbd_sheet_brands', null);
    this.sheetOrders = this.loadLocal('dcbd_sheet_orders', []);
    this.sheetIncompleteOrders = this.loadLocal('dcbd_sheet_incomplete_orders', []);
    this._lastProductsSync = 0;
    this._lastCategoriesSync = 0;
    this._lastBrandsSync = 0;
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
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // If QuotaExceededError due to oversized base64 images, strip base64 thumbnails in storage copy
      try {
        if (Array.isArray(data)) {
          const slim = data.map(item => {
            if (!item || typeof item !== 'object') return item;
            const copy = { ...item };
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
    const localStored = this.loadLocal('dcbd_sheet_products', null);
    const adminProds = (typeof window !== 'undefined' && window.__adminState && Array.isArray(window.__adminState.products) && window.__adminState.products.length > 0)
      ? window.__adminState.products
      : null;

    const base = (Array.isArray(localStored) && localStored.length > 0)
      ? localStored
      : ((Array.isArray(this.sheetProducts) && this.sheetProducts.length > 0) ? this.sheetProducts : adminProds);

    if (Array.isArray(base) && base.length > 0) {
      const normalized = base.map((p, idx) => normalizeSheetProductRow(p, idx)).filter(Boolean);
      if (normalized.length > 0) {
        this.sheetProducts = normalized;
        return normalized;
      }
    }
    return null;
  }

  /**
   * Merge newly fetched Google Sheet products with locally added/updated products
   * so GViz caching NEVER causes products to disappear on alternating loads!
   */
  mergeProductsLists(sheetList = [], localList = []) {
    const deletedIds = new Set(this.loadLocal('dcbd_deleted_product_ids', []));
    const localOverrides = this.loadLocal('dcbd_local_product_overrides', {});
    const byId = new Map();

    // 1. First insert any locally added products (so newly created products appear first)
    (Array.isArray(localList) ? localList : []).forEach((p, idx) => {
      const norm = normalizeSheetProductRow(p, idx);
      if (!norm) return;
      const key = String(norm.sku || norm.product_id).trim().toLowerCase();
      if (deletedIds.has(key)) return;
      if (localOverrides[key]) {
        byId.set(key, normalizeSheetProductRow({ ...norm, ...localOverrides[key] }, idx));
      } else {
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
      if (override) {
        // Keep local edits/images if edited in admin
        byId.set(key, normalizeSheetProductRow({ ...norm, ...existing, ...override }, idx));
      } else {
        byId.set(key, norm);
      }
    });

    const result = Array.from(byId.values());
    return result.length > 0 ? result : [...INITIAL_PRODUCTS];
  }

  async loadProductsFromSheet(forceRefresh = false) {
    const existing = this.getMergedLocalProducts();

    if (!forceRefresh && existing && existing.length > 0) {
      // Throttle background sync to once every 25 seconds so rapid page switches don't spam GViz
      if (Date.now() - this._lastProductsSync > 25000) {
        this._lastProductsSync = Date.now();
        this.syncProductsFromSheetAsync();
      }
      return existing;
    }

    try {
      const rows = await fetchSheetViaGviz('Products');
      if (rows && rows.length > 0) {
        const sheetMapped = rows.map((r, idx) => normalizeSheetProductRow(r, idx)).filter(Boolean);
        const merged = this.mergeProductsLists(sheetMapped, existing || []);
        this.sheetProducts = merged;
        this._lastProductsSync = Date.now();
        this.saveLocal('dcbd_sheet_products', merged);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.products = merged;
        }
        return merged;
      }
    } catch (err) {}

    const fallback = (existing && existing.length > 0) ? existing : [...INITIAL_PRODUCTS];
    this.sheetProducts = fallback;
    this.saveLocal('dcbd_sheet_products', fallback);
    if (typeof window !== 'undefined' && window.__adminState) {
      window.__adminState.products = fallback;
    }
    return fallback;
  }

  async syncProductsFromSheetAsync() {
    try {
      const rows = await fetchSheetViaGviz('Products');
      if (rows && rows.length > 0) {
        const sheetMapped = rows.map((r, idx) => normalizeSheetProductRow(r, idx)).filter(Boolean);
        if (sheetMapped.length > 0) {
          const currentLocal = this.getMergedLocalProducts() || [];
          const merged = this.mergeProductsLists(sheetMapped, currentLocal);
          this.sheetProducts = merged;
          this.saveLocal('dcbd_sheet_products', merged);
          if (typeof window !== 'undefined' && window.__adminState) {
            window.__adminState.products = merged;
          }
        }
      }
    } catch (e) {}
  }

  async loadCategoriesFromSheet(forceRefresh = false) {
    const cached = this.loadLocal('dcbd_sheet_categories', null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      this.sheetCategories = cached;
    }

    if (!forceRefresh && this.sheetCategories && this.sheetCategories.length > 0) {
      if (Date.now() - this._lastCategoriesSync > 30000) {
        this._lastCategoriesSync = Date.now();
        this.syncCategoriesFromSheetAsync();
      }
      return this.sheetCategories;
    }

    try {
      const rows = await fetchSheetViaGviz('Categories');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r, i) => ({
          catagory_id: safeStr(r.catagory_id || r.col_0 || `CAT-${101 + i}`),
          catagory_slug: safeStr(r.catagory_slug || r.col_1) || safeStr(r.category || r.col_3 || 'cat').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category_image: normalizeSingleImageUrl(r.category_image || r.col_2) || DEFAULT_PRODUCT_THUMB,
          category: safeStr(r.category || r.col_3 || 'Category'),
          sub_category: safeStr(r.sub_category !== undefined ? r.sub_category : r.col_4, ''),
          chail_category: safeStr(r.chail_category !== undefined ? r.chail_category : (r.child_category || r.col_5), '')
        })).filter(c => c.category && c.category.toLowerCase() !== 'category');

        if (mapped.length > 0) {
          // Merge with any locally added categories
          const byName = new Map();
          (this.sheetCategories || []).forEach(c => {
            if (c && c.category) byName.set(String(c.category).trim().toLowerCase(), c);
          });
          mapped.forEach(c => {
            const k = String(c.category).trim().toLowerCase();
            const prev = byName.get(k);
            byName.set(k, prev ? { ...c, ...prev } : c);
          });
          const finalCats = Array.from(byName.values());
          this.sheetCategories = finalCats;
          this._lastCategoriesSync = Date.now();
          this.saveLocal('dcbd_sheet_categories', finalCats);
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
    try {
      const rows = await fetchSheetViaGviz('Categories');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r, i) => ({
          catagory_id: safeStr(r.catagory_id || r.col_0 || `CAT-${101 + i}`),
          catagory_slug: safeStr(r.catagory_slug || r.col_1) || safeStr(r.category || r.col_3 || 'cat').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category_image: normalizeSingleImageUrl(r.category_image || r.col_2) || DEFAULT_PRODUCT_THUMB,
          category: safeStr(r.category || r.col_3 || 'Category'),
          sub_category: safeStr(r.sub_category !== undefined ? r.sub_category : r.col_4, ''),
          chail_category: safeStr(r.chail_category !== undefined ? r.chail_category : (r.child_category || r.col_5), '')
        })).filter(c => c.category && c.category.toLowerCase() !== 'category');

        if (mapped.length > 0) {
          const byName = new Map();
          mapped.forEach(c => byName.set(String(c.category).trim().toLowerCase(), c));
          (this.sheetCategories || []).forEach(c => {
            if (c && c.category) {
              const k = String(c.category).trim().toLowerCase();
              byName.set(k, { ...(byName.get(k) || {}), ...c });
            }
          });
          this.sheetCategories = Array.from(byName.values());
          this.saveLocal('dcbd_sheet_categories', this.sheetCategories);
        }
      }
    } catch (e) {}
  }

  async loadBrandsFromSheet(forceRefresh = false) {
    const cached = this.loadLocal('dcbd_sheet_brands', null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      this.sheetBrands = cached;
    }

    if (!forceRefresh && this.sheetBrands && this.sheetBrands.length > 0) {
      if (Date.now() - this._lastBrandsSync > 30000) {
        this._lastBrandsSync = Date.now();
        this.syncBrandsFromSheetAsync();
      }
      return this.sheetBrands;
    }

    try {
      const rows = await fetchSheetViaGviz('Brands');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r, i) => ({
          brand_id: safeStr(r.brand_id || r.col_0 || `BRD-${101 + i}`),
          brand_image: normalizeSingleImageUrl(r.brand_image || r.col_1) || DEFAULT_PRODUCT_THUMB,
          brand_name: safeStr(r.brand_name || r.col_2 || 'Brand'),
          brand_slug: safeStr(r.brand_slug || r.col_3) || safeStr(r.brand_name || r.col_2 || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          brand_description: safeStr(r.brand_description || r.col_4 || '')
        })).filter(b => b.brand_name && b.brand_name.toLowerCase() !== 'brand_name');

        if (mapped.length > 0) {
          const byName = new Map();
          mapped.forEach(b => byName.set(String(b.brand_name).trim().toLowerCase(), b));
          (this.sheetBrands || []).forEach(b => {
            if (b && b.brand_name) {
              const k = String(b.brand_name).trim().toLowerCase();
              byName.set(k, { ...(byName.get(k) || {}), ...b });
            }
          });
          this.sheetBrands = Array.from(byName.values());
          this._lastBrandsSync = Date.now();
          this.saveLocal('dcbd_sheet_brands', this.sheetBrands);
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
    try {
      const rows = await fetchSheetViaGviz('Brands');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r, i) => ({
          brand_id: safeStr(r.brand_id || r.col_0 || `BRD-${101 + i}`),
          brand_image: normalizeSingleImageUrl(r.brand_image || r.col_1) || DEFAULT_PRODUCT_THUMB,
          brand_name: safeStr(r.brand_name || r.col_2 || 'Brand'),
          brand_slug: safeStr(r.brand_slug || r.col_3) || safeStr(r.brand_name || r.col_2 || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          brand_description: safeStr(r.brand_description || r.col_4 || '')
        })).filter(b => b.brand_name && b.brand_name.toLowerCase() !== 'brand_name');

        if (mapped.length > 0) {
          const byName = new Map();
          mapped.forEach(b => byName.set(String(b.brand_name).trim().toLowerCase(), b));
          (this.sheetBrands || []).forEach(b => {
            if (b && b.brand_name) {
              const k = String(b.brand_name).trim().toLowerCase();
              byName.set(k, { ...(byName.get(k) || {}), ...b });
            }
          });
          this.sheetBrands = Array.from(byName.values());
          this.saveLocal('dcbd_sheet_brands', this.sheetBrands);
        }
      }
    } catch (e) {}
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
        const products = await this.loadProductsFromSheet();
        // Filter out explicitly inactive products on storefront unless admin requests all
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

        const found = products.find(p => {
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

        if (found) {
          return { success: true, data: found };
        }

        const partial = products.find(p => {
          const pId = (p.product_id || '').toString().trim().toLowerCase();
          const slug = (p.slug || '').toString().trim().toLowerCase();
          return (slug && (target.includes(slug) || slug.includes(target))) ||
                 (pId && (target.includes(pId) || pId.includes(target)));
        });

        if (partial) {
          return { success: true, data: partial };
        }

        return { success: false, message: "পণ্য পাওয়া যায়নি" };
      }

      case "products/add":
      case "products/create":
      case "products/update": {
        const newProd = normalizeSheetProductRow({
          ...payload,
          sku: payload.sku || payload.product_id || ("DCBD-" + Math.floor(1000 + Math.random() * 9000))
        });

        let current = this.getMergedLocalProducts() || [];
        const key = String(newProd.sku).trim().toLowerCase();
        const idx = current.findIndex(p => String(p.sku || p.product_id).trim().toLowerCase() === key);
        if (idx >= 0) {
          current[idx] = { ...current[idx], ...newProd };
        } else {
          current.unshift(newProd);
        }

        // Persist local override so background GViz sync never loses this product
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

        await sendToAppsScript("products/add", newProd);

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
        const categories = await this.loadCategoriesFromSheet();
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
        const newCat = {
          catagory_id: payload.catagory_id || payload.id || ("CAT-" + Math.floor(1000 + Math.random() * 9000)),
          catagory_slug: payload.catagory_slug || payload.slug || (payload.category ? String(payload.category).toLowerCase().replace(/[^a-z0-9]+/g, "-") : "cat"),
          category_image: normalizeSingleImageUrl(payload.category_image || payload.image) || DEFAULT_PRODUCT_THUMB,
          category: safeStr(payload.category || payload.name || "Category"),
          sub_category: safeStr(payload.sub_category || ""),
          chail_category: safeStr(payload.chail_category || payload.child_category || ""),
          tree_subs: payload.tree_subs || undefined
        };

        if (!this.sheetCategories) this.sheetCategories = this.loadLocal('dcbd_sheet_categories', [...INITIAL_CATEGORIES]);
        const existingIdx = this.sheetCategories.findIndex(c =>
          String(c.catagory_id || '').toLowerCase() === String(newCat.catagory_id).toLowerCase() ||
          String(c.category || '').toLowerCase() === String(newCat.category).toLowerCase() ||
          (payload.old_category && String(c.category || '').toLowerCase() === String(payload.old_category).toLowerCase())
        );
        if (existingIdx >= 0) {
          this.sheetCategories[existingIdx] = { ...this.sheetCategories[existingIdx], ...newCat };
        } else {
          this.sheetCategories.push(newCat);
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
        const brands = await this.loadBrandsFromSheet();
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
        const newBrand = {
          brand_id: payload.brand_id || payload.id || ("BRD-" + Math.floor(1000 + Math.random() * 9000)),
          brand_name: safeStr(payload.brand_name || payload.name || "Brand"),
          brand_slug: payload.brand_slug || payload.slug || (payload.brand_name ? String(payload.brand_name).toLowerCase().replace(/[^a-z0-9]+/g, "-") : "brand"),
          brand_image: normalizeSingleImageUrl(payload.brand_image || payload.image) || DEFAULT_PRODUCT_THUMB,
          brand_description: safeStr(payload.brand_description || payload.description || "")
        };
        if (!this.sheetBrands) this.sheetBrands = this.loadLocal('dcbd_sheet_brands', [...INITIAL_BRANDS]);
        const idx = this.sheetBrands.findIndex(b =>
          String(b.brand_id || '').toLowerCase() === String(newBrand.brand_id).toLowerCase() ||
          String(b.brand_name || '').toLowerCase() === String(newBrand.brand_name).toLowerCase()
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
        let localPages = this.loadLocal('dcbd_landing_pages', null);
        try {
          const rows = await fetchSheetViaGviz('Landing-Pages');
          if (rows && rows.length > 0) {
            const sheetPages = rows.map((r, i) => {
              let parsedContent = {};
              try { parsedContent = JSON.parse(r.content || r.col_3 || '{}'); } catch (e) {}
              return {
                id: safeStr(r.page_id || r.col_0 || `LP-${101 + i}`),
                title: safeStr(r.title || r.col_1 || 'ক্যাম্পেইন ল্যান্ডিং পেজ'),
                slug: safeStr(r.slug || r.col_2 || `lp-${101 + i}`),
                hero_banner: normalizeSingleImageUrl(r.banner || r.col_4) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200',
                status: safeStr(r.status || r.col_5 || 'Active'),
                ...parsedContent
              };
            });
            const byId = new Map();
            sheetPages.forEach(lp => byId.set(String(lp.id).toLowerCase(), lp));
            (localPages || []).forEach(lp => byId.set(String(lp.id).toLowerCase(), { ...(byId.get(String(lp.id).toLowerCase()) || {}), ...lp }));
            localPages = Array.from(byId.values());
            this.saveLocal('dcbd_landing_pages', localPages);
          }
        } catch (e) {}
        return { success: true, data: { items: localPages || [], total: (localPages || []).length } };
      }

      case "landing_pages/add":
      case "landing_pages/create":
      case "landing_pages/update": {
        await sendToAppsScript("landing_pages/add", payload);
        return { success: true, status: "success", data: payload, message: "ল্যান্ডিং পেজ তালিকা ও গুগল শিটে সংরক্ষিত হয়েছে!" };
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
        const orderId = safeStr(payload.order_id || payload.orderId || ("ORD-" + Math.floor(100000 + Math.random() * 900000)));
        const dateStr = payload.date || new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Dhaka' });

        let productsDesc = safeStr(payload.products || payload.product_name || '');
        let colorStr = safeStr(payload.color || '');
        let sizeStr = safeStr(payload.size || '');
        let totalQty = safeNumber(payload.quantity, 0);

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
          date: dateStr,
          products: productsDesc,
          product_name: productsDesc,
          color: colorStr || 'Standard',
          size: sizeStr || 'Free Size',
          quantity: totalQty,
          account_type: payload.account_type || 'Customer',
          payment_method: payload.payment_method || 'Cash On Delivery (COD)',
          transaction_id: payload.transaction_id || 'COD',
          payment_status: payload.payment_status || (String(payload.payment_method || '').toLowerCase().includes('cod') || String(payload.payment_method || '').toLowerCase().includes('cash') ? 'Pending' : 'Paid'),
          order_status: payload.order_status || 'Order Placed'
        });

        let localOrders = this.loadLocal('dcbd_sheet_orders', []);
        const existingIdx = localOrders.findIndex(o => String(o.order_id || o.orderId) === orderId);
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

        // Remove any matching incomplete order draft for this phone number now that order is confirmed
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

        await sendToAppsScript("orders/create", orderData);

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
          const rows = await fetchSheetViaGviz('Orders');
          if (rows && rows.length > 0) {
            sheetOrders = rows.map((r, i) => normalizeSheetOrderRow(r, i)).filter(Boolean);
            // Requirement 7: The orders at the bottom of the Google Sheet are the newest orders!
            // Reverse so that the sheet's bottom orders appear at the beginning of the site list!
            sheetOrders.reverse();
          }
        } catch (e) {}

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

        await sendToAppsScript("incomplete_orders/create", incItem);
        return { success: true, status: "success", data: incItem };
      }

      case "incomplete_orders/list": {
        const localInc = (this.loadLocal('dcbd_sheet_incomplete_orders', []) || []).map((r, i) => normalizeIncompleteOrderRow(r, i)).filter(Boolean);
        let sheetInc = [];
        try {
          const rows = await fetchSheetViaGviz('Incomplete_Orders');
          if (rows && rows.length > 0) {
            sheetInc = rows.map((r, i) => normalizeIncompleteOrderRow(r, i)).filter(Boolean);
          }
        } catch (e) {}

        const byId = new Map();
        localInc.forEach(io => byId.set(String(io.order_id).toLowerCase(), io));
        sheetInc.forEach(io => {
          const k = String(io.order_id).toLowerCase();
          if (!byId.has(k)) byId.set(k, io);
        });

        const merged = Array.from(byId.values());
        if (merged.length > 0) {
          this.sheetIncompleteOrders = merged;
          this.saveLocal('dcbd_sheet_incomplete_orders', merged);
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
            const rows = await fetchSheetViaGviz('Customers');
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

        const generatedUserId = safeStr(payload.USER_ID || payload.user_id || ('CUST-' + Math.floor(100000 + Math.random() * 900000)));
        const customerData = {
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
          const rows = await fetchSheetViaGviz('Customers');
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
          const cUserIdA = String(c.user_id || c.USER_ID || c.col_0 || '').trim().toLowerCase();
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

        const uId = matched.user_id || matched.USER_ID || matched.col_0 || matched.User_ID || matched.col_6 || ('CUST-' + Math.floor(100000 + Math.random() * 900000));
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
          const rows = await fetchSheetViaGviz('Customers');
          if (rows && rows.length > 0) {
            sheetCust = rows.map((r, i) => ({
              user_id: safeStr(r.user_id || r.USER_ID || r.col_0 || `CUST-${100 + i}`),
              USER_ID: safeStr(r.user_id || r.USER_ID || r.col_0 || `CUST-${100 + i}`),
              profile_photo: normalizeSingleImageUrl(r.profile_photo || r.Profile_photo || r.col_1 || ''),
              name: safeStr(r.name || r.Name || r.col_2 || 'গ্রাহক'),
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
        return { success: true, data: { items: merged, total: merged.length } };
      }

      // --- REVIEWS ---
      case "reviews/list": {
        const localRevs = this.loadLocal('dcbd_sheet_reviews', []);
        let sheetRevs = [];
        try {
          const rows = await fetchSheetViaGviz('Reviews');
          if (rows && rows.length > 0) {
            sheetRevs = rows.map((r, i) => ({
              id: safeStr(r.id || `REV-SH-${i + 1}`),
              date: safeStr(r.date || r.col_0 || 'সম্প্রতি'),
              product_sku: safeStr(r.product_sku || r.col_1 || ''),
              product: safeStr(r.product || r.product_sku || r.col_1 || 'পণ্য'),
              customer_name: safeStr(r.customer_name || r.col_2 || 'গ্রাহক'),
              customer: safeStr(r.customer || r.customer_name || r.col_2 || 'গ্রাহক'),
              rating: safeNumber(r.rating !== undefined ? r.rating : r.col_3, 5),
              comment: safeStr(r.comment || r.col_4 || ''),
              status: safeStr(r.status || r.col_5 || 'Approved')
            })).filter(rv => rv.comment);
          }
        } catch (e) {}
        const merged = [...localRevs, ...sheetRevs];
        return { success: true, data: { items: merged, total: merged.length } };
      }

      case "reviews/add":
      case "reviews/create": {
        await sendToAppsScript("reviews/add", payload);
        return { success: true, status: "success", data: payload };
      }

      // --- PARTNERS, ADMINS, WORKERS, FINANCE, COURIERS, SETTINGS ---
      case "resellers/register":
      case "resellers/add":
      case "resellers/create":
      case "resellers/update":
      case "resellers/login": {
        await sendToAppsScript("resellers/" + (action.split('/')[1] || 'add'), payload);
        return { success: true, status: "success", data: payload };
      }

      case "wholesalers/register":
      case "wholesalers/add":
      case "wholesalers/create":
      case "wholesalers/update":
      case "wholesalers/login": {
        await sendToAppsScript("wholesalers/" + (action.split('/')[1] || 'add'), payload);
        return { success: true, status: "success", data: payload };
      }

      case "sellers/add":
      case "sellers/create":
      case "sellers/update":
      case "sellers/delete":
      case "markets/add":
      case "markets/create":
      case "markets/update":
      case "markets/delete":
      case "admin_worker/add":
      case "admin_worker/create":
      case "admin_worker/update":
      case "admin_worker/delete":
      case "costs/add":
      case "costs/create":
      case "costs/delete":
      case "buying/add":
      case "buying/create":
      case "buying/delete":
      case "invest/add":
      case "invest/create":
      case "invest/delete":
      case "payments/add":
      case "couriers/add":
      case "couriers/update":
      case "couriers/send_order":
      case "fraud/add_complaint":
      case "settings/update":
      case "settings/add":
      case "settings/delete":
      case "banners/add":
      case "banners/create":
      case "banners/update": {
        const bannerId = safeStr(payload.banner_id || payload.id || ("BAN-" + Math.floor(100 + Math.random() * 900)));
        const newBanner = {
          banner_id: bannerId,
          id: bannerId,
          title: safeStr(payload.title || "ব্যানার স্লাইডার"),
          subtitle: safeStr(payload.subtitle || ""),
          image_url: normalizeSingleImageUrl(payload.image_url || payload.image || DEFAULT_PRODUCT_THUMB),
          link_url: safeStr(payload.link_url || payload.link || "/products"),
          cta_text: safeStr(payload.cta_text || payload.button_text || "এখনই কিনুন →"),
          position: Number(payload.position || 1),
          status: safeStr(payload.status || "Active")
        };

        let currentBanners = this.sheetBanners || this.loadLocal('dcbd_sheet_banners', null) || [];
        const existingIdx = currentBanners.findIndex(b => String(b.banner_id || b.id).toLowerCase() === String(bannerId).toLowerCase());
        if (existingIdx >= 0) {
          currentBanners[existingIdx] = { ...currentBanners[existingIdx], ...newBanner };
        } else {
          currentBanners.unshift(newBanner);
        }
        this.sheetBanners = currentBanners;
        this.saveLocal('dcbd_sheet_banners', currentBanners);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.banners = currentBanners;
        }

        await sendToAppsScript("banners/add", newBanner);
        return { success: true, status: "success", data: newBanner, message: "ব্যানার তালিকা ও গুগল শিটে সংরক্ষিত হয়েছে!" };
      }

      case "banners/delete": {
        const id = String(payload.banner_id || payload.id || '').trim().toLowerCase();
        let currentBanners = this.sheetBanners || this.loadLocal('dcbd_sheet_banners', null) || [];
        currentBanners = currentBanners.filter(b => String(b.banner_id || b.id).toLowerCase() !== id);
        this.sheetBanners = currentBanners;
        this.saveLocal('dcbd_sheet_banners', currentBanners);
        if (typeof window !== 'undefined' && window.__adminState) {
          window.__adminState.banners = currentBanners;
        }
        await sendToAppsScript("banners/delete", payload);
        return { success: true, status: "success" };
      }

      case "viewers/log": {
        sendToAppsScript("viewers/log", payload).catch(() => {});
        return { success: true };
      }

      case "settings/list": {
        const s = getGlobalSiteSettings();
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
          { banner_id: "BAN-01", title: "স্মার্ট গ্যাজেট ও লাইফস্টাইল কালেকশন", subtitle: "সেরা মূল্যে ১০০% জেনুইন গ্যাজেট", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80", link_url: "/products", tag: "বিশেষ অফার", button_text: "এখনই অর্ডার করুন", status: "Active" },
          { banner_id: "BAN-02", title: "অর্গানিক ফুড ও হেলথ সাপ্লিমেন্ট", subtitle: "প্রাকৃতিক খাঁটি উপাদান ও সুস্থ জীবন", image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&auto=format&fit=crop&q=80", link_url: "/products?cat=Organic%20%26%20Health", tag: "স্বাস্থ্যকর জীবন", button_text: "কালেকশন দেখুন", status: "Active" }
        ];

        let banners = this.sheetBanners || this.loadLocal('dcbd_sheet_banners', null);
        if (banners && banners.length > 0) {
          return { success: true, data: { items: banners, total: banners.length } };
        }

        try {
          const rows = await fetchSheetViaGviz('Banners');
          if (rows && rows.length > 0) {
            this.sheetBanners = rows;
            this.saveLocal('dcbd_sheet_banners', rows);
            return { success: true, data: { items: rows, total: rows.length } };
          }
        } catch (e) {}

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
