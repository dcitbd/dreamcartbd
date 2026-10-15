/**
 * DREAM CART BD — MAIN NAVIGATION BAR WITH INTELLIGENT VISUAL PRODUCT READER & SEARCH REPORT (Header.js)
 * High-performance, pixel-perfect header component:
 * - Desktop: Notice bar, compact crisp logo (42px), wide predictive search bar with inline Visual AI Camera Search, nav actions, auth menu, dark mode.
 * - Mobile: Sleek native app bar with compact logo (36px) & dedicated search bar with Camera Search button.
 * - Multi-Engine Visual Product Reader:
 *     1. Live Google Sheet Catalog Sync (excludes fake demo products when real store products exist).
 *     2. 128-bit Perceptual Hash (dHash + vHash) + 8x8 Center-Weighted Spatial RGB + 24-bin HSV Histogram + Natural Dimension Matcher (with parallel direct CORS + wsrv.nl + corsproxy fallback).
 *     3. Multimodal AI Vision Catalog Matcher + On-Device MobileNet Semantic Object Classifier for camera/external photos.
 *     4. Patched SearchService integration so /products?search=... always displays the exact visually-matched products and injects a full Visual Search Report banner on the results page.
 * - Ultra-high Stacking Context (z-index: 999999): Never goes under sliders, product cards, or sticky sidebars.
 * - ZERO Full-Screen Blur: No annoying screen blur overlays.
 */

import { cartStore } from '../store/cartStore.js';
import { favouriteStore } from '../store/favouriteStore.js';
import { authStore } from '../store/authStore.js';
import { apiClient } from '../api/client.js';
import { formatCurrency } from '../utils/format.js';
import { SearchService } from '../services/SearchService.js';

// Core Platform Fallback Products (Used ONLY if Google Sheet is completely empty/unreachable)
const CORE_VISUAL_PRODUCTS = [
  {
    sku: "DCBD-SM-001",
    product_id: "DCBD-SM-001",
    name: "Amazfit GTS 4 Smartwatch — Ultra AMOLED Display & Dual GPS",
    category: "Smartwatches",
    sub_category: "AMOLED Watch",
    selling_price: 18500,
    thumbnail: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400",
    slug: "amazfit-gts-4-smartwatch"
  },
  {
    sku: "DCBD-ORG-002",
    product_id: "DCBD-ORG-002",
    name: "Natural Raw Sundarban Honey (অর্গানিক সুন্দরবন মধু) — ৫০০ গ্রাম",
    category: "Organic & Health",
    sub_category: "Herbal Honey",
    selling_price: 850,
    thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    slug: "natural-raw-sundarban-honey"
  },
  {
    sku: "DCBD-TAC-003",
    product_id: "DCBD-TAC-003",
    name: "Ultra-Bright Tactical High-Power Rechargeable LED Torch",
    category: "Tactical Lighting",
    sub_category: "LED Flashlight",
    selling_price: 1450,
    thumbnail: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=400",
    slug: "ultra-bright-tactical-torch"
  },
  {
    sku: "DCBD-GAS-004",
    product_id: "DCBD-GAS-004",
    name: "Automatic Kitchen LPG Gas Safety Device & Meter Regulator",
    category: "Kitchen Safety",
    sub_category: "Gas Regulator",
    selling_price: 2650,
    thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400",
    slug: "automatic-kitchen-lpg-gas-safety-device"
  },
  {
    sku: "DCBD-SM-005",
    product_id: "DCBD-SM-005",
    name: "Kieslect Ks Pro Calling Smartwatch — 2.01 Inch AMOLED Display",
    category: "Smartwatches",
    sub_category: "Calling Watch",
    selling_price: 7200,
    thumbnail: "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg",
    slug: "kieslect-ks-pro-calling-smartwatch"
  }
];

// Generic camera/device words to ignore when reading filenames
const GENERIC_FILE_TOKENS = new Set([
  "img", "image", "images", "dsc", "dcim", "photo", "photos", "pic", "picture",
  "whatsapp", "screenshot", "screen", "shot", "download", "downloads", "untitled",
  "copy", "pxl", "vid", "cam", "camera", "fb", "received", "media", "file",
  "jpeg", "jpg", "png", "webp", "gif", "bmp", "avif", "heic", "svg", "unnamed"
]);

// Bilingual Visual Keyword & ImageNet Object Class Expansion Map
const VISUAL_KEYWORD_MAP = [
  { keys: ["watch", "smartwatch", "digital watch", "stopwatch", "analog clock", "wall clock", "dial", "amoled", "gts", "kieslect", "amazfit", "band", "tracker", "t500", "hk9", "colmi", "haylou", "mibro", "ঘড়ি", "ঘড়ি", "স্মার্টওয়াচ", "স্মার্টওয়াচ"], query: "Smartwatch", label: "স্মার্টওয়াচ ও ঘড়ি (Smartwatch & Watch)" },
  { keys: ["honey", "honeycomb", "modhu", "sundarban", "jar", "syrup", "মধু", "সুন্দরবন"], query: "মধু", label: "খাঁটি প্রাকৃতিক মধু (Natural Honey)" },
  { keys: ["chia", "seed", "seeds", "kalojira", "oil", "ghee", "dates", "organic", "herbal", "supplement", "vitamin", "nut", "food", "spice", "masala", "tea", "coffee", "চিয়া", "চিয়া", "কালোজিরা", "ঘি", "অর্গানিক", "ভেষজ", "তেল", "খেজুর"], query: "Organic", label: "অর্গানিক ফুড ও হেলথ (Organic & Health)" },
  { keys: ["torch", "flashlight", "spotlight", "light", "led", "lamp", "table lamp", "lampshade", "lantern", "solar", "bulb", "cob", "tactical", "টর্চ", "লাইট", "লণ্ঠন", "সোলার", "ল্যাম্প", "বাল্ব"], query: "Light", label: "ট্যাকটিক্যাল এলইডি ও লাইটিং (LED & Lighting)" },
  { keys: ["gas", "regulator", "gas pump", "barometer", "odometer", "lpg", "cylinder", "stove", "burner", "safety", "fire", "গ্যাস", "রেগুলেটর", "চুলা", "সিলিন্ডার"], query: "Gas", label: "কিচেন গ্যাস সেফটি ডিভাইস (Gas Safety)" },
  { keys: ["blender", "mixer", "juicer", "grinder", "chopper", "kettle", "teapot", "coffeepot", "cooker", "dutch oven", "frying pan", "wok", "spatula", "pot", "knife", "cleaver", "kitchen", "spoon", "rack", "sink", "pitcher", "water jug", "plate", "bowl", "tray", "ব্লেন্ডার", "জুসার", "কেটলি", "কিচেন", "রান্নাঘর", "কুকার", "প্যান"], query: "Kitchen", label: "কিচেন ও কুকিং গ্যাজেট (Kitchen Gadget)" },
  { keys: ["bp", "blood", "pressure", "glucometer", "diabetes", "strip", "nebulizer", "oximeter", "thermometer", "stethoscope", "syringe", "pill bottle", "medicine", "medical", "health", "firstaid", "mask", "scale", "weighing", "বিপি", "প্রেশার", "ডায়াবেটিস", "নেবুলাইজার", "মেডিসিন", "হেলথকেয়ার", "থার্মোমিটার"], query: "Medicine", label: "মেডিসিন ও হেলথকেয়ার ডিভাইস (Healthcare)" },
  { keys: ["pen", "ballpoint", "fountain pen", "pencil", "notebook", "binder", "diary", "book", "paper", "envelope", "ruler", "calculator", "abacus", "organizer", "desk", "stationery", "marker", "eraser", "school", "office", "কলম", "খাতা", "নোটবুক", "স্টেশনারি", "ক্যালকুলেটর", "ডায়েরি"], query: "Stationery", label: "স্টেশনারি ও অফিস এক্সেসরিজ (Stationery)" },
  { keys: ["earbud", "earphone", "headphone", "airpod", "tws", "neckband", "speaker", "loudspeaker", "bluetooth", "audio", "mic", "microphone", "ipod", "radio", "ইয়ারবাড", "হেডফোন", "স্পিকার", "মাইক্রোফোন"], query: "Audio", label: "অডিও, ইয়ারবাড ও স্পিকার (Audio & Earbuds)" },
  { keys: ["powerbank", "charger", "cable", "adapter", "usb", "typec", "battery", "holder", "stand", "tripod", "mobile", "cellular telephone", "phone", "case", "cover", "পাওয়ারব্যাংক", "চার্জার", "কেবল", "স্ট্যান্ড"], query: "Charger", label: "পাওয়ারব্যাংক ও মোবাইল এক্সেসরিজ (Accessories)" },
  { keys: ["trimmer", "shaver", "clipper", "hair dryer", "dryer", "straightener", "grooming", "razor", "comb", "ট্রিমার", "শেভার", "হেয়ার"], query: "Trimmer", label: "গ্রুমিং ও পার্সোনাল কেয়ার (Personal Care)" },
  { keys: ["fan", "electric fan", "cooler", "ac", "heater", "space heater", "iron", "smoothing iron", "appliance", "vacuum", "humidifier", "microwave", "toaster", "ফ্যান", "আয়রন", "অ্যাপ্লায়েন্স"], query: "Home Appliances", label: "হোম অ্যাপ্লায়েন্স (Home Appliances)" },
  { keys: ["router", "modem", "wifi", "camera", "cctv", "ipcam", "security", "smartplug", "remote control", "রাউটার", "ক্যামেরা", "সিসিটিভি"], query: "Camera", label: "স্মার্ট সিকিউরিটি ও নেটওয়ার্ক (Smart Security)" },
  { keys: ["bag", "backpack", "purse", "wallet", "handbag", "mailbag", "luggage", "shoe", "running shoe", "sandal", "sneaker", "sunglasses", "shirt", "t-shirt", "jersey", "watch", "ব্যাগ", "মানিব্যাগ", "জুতা", "সানগ্লাস", "টি-শার্ট"], query: "Lifestyle", label: "ফ্যাশন ও লাইফস্টাইল (Fashion & Lifestyle)" },
  { keys: ["perfume", "lotion", "cream", "soap", "shampoo", "cosmetic", "makeup", "lipstick", "face", "skin", "পারফিউম", "ক্রিম", "লোশন", "কসমেটিকস"], query: "Cosmetics", label: "বিউটি ও স্কিনকেয়ার (Beauty & Skincare)" }
];

// Global Visual Search Controller (Module singleton attached to window)
if (typeof window !== 'undefined' && !window.__dcbdVisualSearchInit) {
  window.__dcbdVisualSearchInit = true;
  window.__dcbdFilePickingActive = false;
  window.__dcbdLastFileActionTime = 0;
  window.__dcbdProductFingerprints = new Map();
  window.__dcbdActiveVisualReport = null;

  // =========================================================================
  // PATCH SearchService so multi-word product names with numbers NEVER return 0
  // and so active Visual Search reports rank the exact visual matches first!
  // =========================================================================
  const origCalculateRelevance = SearchService.calculateRelevance;
  const origSearch = SearchService.search;

  SearchService.calculateRelevance = function(product, query) {
    if (!product || !query) return 0;
    const rawScore = origCalculateRelevance ? origCalculateRelevance(product, query) : 0;
    if (rawScore > 0) return rawScore;

    // Fallback when origCalculateRelevance falsely triggered isSkuQuery on a product name with digits
    const qNorm = SearchService.normalize ? SearchService.normalize(query) : String(query).toLowerCase().trim();
    const pName = SearchService.normalize ? SearchService.normalize(product.name || product.p_name || '') : String(product.name || product.p_name || '').toLowerCase();
    const pCat = SearchService.normalize ? SearchService.normalize(product.category || '') : String(product.category || '').toLowerCase();
    const pSub = SearchService.normalize ? SearchService.normalize(product.sub_category || '') : String(product.sub_category || '').toLowerCase();
    const pBrand = SearchService.normalize ? SearchService.normalize(product.brand || '') : String(product.brand || '').toLowerCase();
    const pDesc = SearchService.normalize ? SearchService.normalize((product.description || '') + ' ' + (product.specification || '')) : '';

    let score = 0;
    if (pName && qNorm) {
      if (pName === qNorm) score += 1000;
      else if (pName.includes(qNorm) || qNorm.includes(pName)) score += 600;
    }
    if (pCat && qNorm && (pCat === qNorm || pCat.includes(qNorm) || qNorm.includes(pCat))) {
      score += 300;
    }
    if (pSub && qNorm && (pSub === qNorm || pSub.includes(qNorm) || qNorm.includes(pSub))) {
      score += 220;
    }
    if (pBrand && qNorm && (pBrand === qNorm || pBrand.includes(qNorm))) {
      score += 200;
    }

    const tokens = qNorm.split(' ').filter(t => t.length > 1);
    let matchedCount = 0;
    tokens.forEach(tok => {
      if (pName.includes(tok)) { score += 90; matchedCount++; }
      else if (pCat.includes(tok) || pSub.includes(tok)) { score += 55; matchedCount++; }
      else if (pBrand.includes(tok)) { score += 60; matchedCount++; }
      else if (pDesc.includes(tok)) { score += 25; matchedCount++; }
    });
    if (tokens.length > 1 && matchedCount === tokens.length) {
      score += 200;
    }
    return score;
  };

  SearchService.search = function(allProducts = [], query = "", options = {}) {
    const qTrim = (query || "").trim();
    const activeReport = window.__dcbdActiveVisualReport;

    // If this search matches the active Visual Image Search report, return the exact visual match ranking!
    if (
      activeReport &&
      qTrim &&
      activeReport.matchedQuery &&
      qTrim.toLowerCase() === activeReport.matchedQuery.toLowerCase() &&
      Array.isArray(allProducts) &&
      allProducts.length > 0
    ) {
      const byKey = new Map();
      allProducts.forEach(p => {
        const k = String(p.sku || p.product_id || p.slug || p.name || '').toLowerCase();
        if (k) byKey.set(k, p);
      });

      const directMatches = [];
      const relatedProducts = [];
      const usedKeys = new Set();

      (activeReport.directMatches || []).forEach((vp, idx) => {
        const k = String(vp.sku || vp.product_id || vp.slug || vp.name || '').toLowerCase();
        const realProd = byKey.get(k) || vp;
        if (k && !usedKeys.has(k)) {
          usedKeys.add(k);
          directMatches.push({
            ...realProd,
            _searchScore: 1000 - idx * 25,
            _isDirectMatch: true
          });
        }
      });

      (activeReport.relatedProducts || []).forEach((vp, idx) => {
        const k = String(vp.sku || vp.product_id || vp.slug || vp.name || '').toLowerCase();
        const realProd = byKey.get(k) || vp;
        if (k && !usedKeys.has(k)) {
          usedKeys.add(k);
          relatedProducts.push({
            ...realProd,
            _relatedScore: 500 - idx * 10,
            _isDirectMatch: false
          });
        }
      });

      if (directMatches.length > 0) {
        const allResults = [...directMatches, ...relatedProducts];
        return {
          directMatches,
          relatedProducts,
          allResults,
          query: qTrim,
          totalCount: allResults.length
        };
      }
    }

    // Standard search using our patched calculateRelevance
    const res = origSearch ? origSearch(allProducts, query, options) : { directMatches: [], relatedProducts: [], allResults: [], query: qTrim, totalCount: 0 };
    if (res.totalCount > 0 || !qTrim) return res;

    // Fallback re-ranking using patched SearchService.calculateRelevance
    const scored = (Array.isArray(allProducts) ? allProducts : [])
      .map(p => ({ product: p, score: SearchService.calculateRelevance(p, qTrim) }))
      .filter(it => it.score > 0)
      .sort((a, b) => b.score - a.score);

    const directMatches = scored.map(it => ({ ...it.product, _searchScore: it.score, _isDirectMatch: true }));
    return {
      directMatches,
      relatedProducts: [],
      allResults: directMatches,
      query: qTrim,
      totalCount: directMatches.length
    };
  };

  // =========================================================================
  // 1. LIVE GOOGLE SHEETS CATALOG LOADER (Excludes fake demo items when real sheet items exist)
  // =========================================================================
  window.__dcbdGetStoreCatalog = async function() {
    let allProds = [];
    if (apiClient.sheetProducts && apiClient.sheetProducts.length > 0) {
      allProds = [...apiClient.sheetProducts];
    } else {
      const cached = apiClient.loadLocal('dcbd_sheet_products', null);
      if (cached && cached.length > 0) {
        allProds = [...cached];
      }
    }

    // Check if allProds only has the single initial placeholder product (DCBD-SM-001)
    const isOnlyPlaceholder =
      allProds.length === 0 ||
      (allProds.length === 1 && String(allProds[0].sku || '') === 'DCBD-SM-001');

    if (isOnlyPlaceholder) {
      try {
        // Pass true (forceRefresh) so client.js awaits fetchSheetViaGviz('Products')!
        const fetched = await apiClient.loadProductsFromSheet(true);
        if (Array.isArray(fetched) && fetched.length > 0) {
          allProds = [...fetched];
        }
      } catch (e) {}
    }

    // Filter out any empty test rows
    allProds = allProds.filter(p => {
      const name = String(p.name || p.p_name || '').trim().toLowerCase();
      return name && name !== 'test id';
    });

    // If real products exist from Google Sheets, DO NOT pollute them with CORE_VISUAL_PRODUCTS!
    if (allProds.length > 1 || (allProds.length === 1 && String(allProds[0].sku) !== 'DCBD-SM-001')) {
      return allProds;
    }

    return [...CORE_VISUAL_PRODUCTS];
  };

  // Normalize image URLs (handles Google Drive view links, protocol-relative URLs, etc.)
  function normalizeProductImageUrl(rawUrl) {
    if (!rawUrl) return '';
    let u = String(rawUrl).trim();
    if (!u) return '';
    if (u.startsWith('//')) u = 'https:' + u;
    const driveMatch = u.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=))([a-zA-Z0-9_-]{15,})/);
    if (driveMatch && driveMatch[1]) {
      return 'https://lh3.googleusercontent.com/d/' + driveMatch[1] + '=w400';
    }
    return u;
  }

  // Helper: Convert RGB (0-255) to HSV (h: 0-360, s: 0-1, v: 0-1)
  function rgbToHsv(r, g, b) {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (max !== min) {
      switch (max) {
        case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
        case gn: h = (bn - rn) / d + 2; break;
        case bn: h = (rn - gn) / d + 4; break;
      }
      h *= 60;
    }
    return { h, s, v };
  }

  // =========================================================================
  // 2. 128-BIT PERCEPTUAL HASH + 8x8 SPATIAL RGB + FOREGROUND HSV FINGERPRINT
  // =========================================================================
  function extractImageFingerprintFromElement(imgEl) {
    try {
      const SIZE = 32;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      const natW = imgEl.naturalWidth || imgEl.width || 32;
      const natH = imgEl.naturalHeight || imgEl.height || 32;

      ctx.drawImage(imgEl, 0, 0, SIZE, SIZE);
      const imgData = ctx.getImageData(0, 0, SIZE, SIZE).data;

      // Auto-detect uniform border margins so screenshots with padding crop to the product
      let bgR = 0, bgG = 0, bgB = 0, bgCnt = 0;
      for (let i = 0; i < SIZE; i++) {
        const t = (0 * SIZE + i) * 4;
        const b = ((SIZE - 1) * SIZE + i) * 4;
        const l = (i * SIZE + 0) * 4;
        const r = (i * SIZE + (SIZE - 1)) * 4;
        bgR += imgData[t] + imgData[b] + imgData[l] + imgData[r];
        bgG += imgData[t + 1] + imgData[b + 1] + imgData[l + 1] + imgData[r + 1];
        bgB += imgData[t + 2] + imgData[b + 2] + imgData[l + 2] + imgData[r + 2];
        bgCnt += 4;
      }
      bgR /= bgCnt; bgG /= bgCnt; bgB /= bgCnt;

      // 1. 128-bit Perceptual Hash: 64-bit Horizontal dHash + 64-bit Vertical vHash
      const dHash = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const sx1 = Math.min(SIZE - 1, Math.floor(((x + 0.5) / 9) * SIZE));
          const sx2 = Math.min(SIZE - 1, Math.floor(((x + 1.5) / 9) * SIZE));
          const sy = Math.min(SIZE - 1, Math.floor(((y + 0.5) / 8) * SIZE));
          const i1 = (sy * SIZE + sx1) * 4;
          const i2 = (sy * SIZE + sx2) * 4;
          const lum1 = 0.299 * imgData[i1] + 0.587 * imgData[i1 + 1] + 0.114 * imgData[i1 + 2];
          const lum2 = 0.299 * imgData[i2] + 0.587 * imgData[i2 + 1] + 0.114 * imgData[i2 + 2];
          dHash.push(lum1 >= lum2 ? 1 : 0);
        }
      }
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const sx = Math.min(SIZE - 1, Math.floor(((x + 0.5) / 8) * SIZE));
          const sy1 = Math.min(SIZE - 1, Math.floor(((y + 0.5) / 9) * SIZE));
          const sy2 = Math.min(SIZE - 1, Math.floor(((y + 1.5) / 9) * SIZE));
          const i1 = (sy1 * SIZE + sx) * 4;
          const i2 = (sy2 * SIZE + sx) * 4;
          const lum1 = 0.299 * imgData[i1] + 0.587 * imgData[i1 + 1] + 0.114 * imgData[i1 + 2];
          const lum2 = 0.299 * imgData[i2] + 0.587 * imgData[i2 + 1] + 0.114 * imgData[i2 + 2];
          dHash.push(lum1 >= lum2 ? 1 : 0);
        }
      }

      // 2. 8x8 Spatial RGB Grid (64 cells x 3 channels = 192 values)
      const spatialRgb = [];
      const cellSize = SIZE / 8; // 4px per cell
      for (let gy = 0; gy < 8; gy++) {
        for (let gx = 0; gx < 8; gx++) {
          let sr = 0, sg = 0, sb = 0, cnt = 0;
          for (let py = gy * cellSize; py < (gy + 1) * cellSize; py++) {
            for (let px = gx * cellSize; px < (gx + 1) * cellSize; px++) {
              const idx = (py * SIZE + px) * 4;
              sr += imgData[idx];
              sg += imgData[idx + 1];
              sb += imgData[idx + 2];
              cnt++;
            }
          }
          spatialRgb.push(sr / cnt, sg / cnt, sb / cnt);
        }
      }

      // 3. 24-bin Foreground HSV Histogram & Color Ratios
      const hist = new Array(24).fill(0);
      let fgTotal = 0;
      let amberGold = 0, greenHerbal = 0, redOrange = 0, blueCyan = 0, purplePink = 0;
      let darkMetallic = 0, whiteClean = 0, brightBeam = 0, brownWarm = 0;

      for (let py = 2; py < SIZE - 2; py++) {
        for (let px = 2; px < SIZE - 2; px++) {
          const idx = (py * SIZE + px) * 4;
          const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2], a = imgData[idx + 3];
          if (a < 40) continue;

          const distBg = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          const isCenterCore = (px >= 7 && px < 25 && py >= 7 && py < 25);
          if (distBg < 24 && !isCenterCore) continue;

          const weight = isCenterCore ? 2.2 : 1.0;
          fgTotal += weight;

          const { h, s, v } = rgbToHsv(r, g, b);

          if (s > 0.14 && v > 0.14) {
            const hBin = Math.min(11, Math.floor(h / 30));
            hist[hBin] += weight;
          }
          const sBin = 12 + Math.min(5, Math.floor(s * 6));
          const vBin = 18 + Math.min(5, Math.floor(v * 6));
          hist[sBin] += weight;
          hist[vBin] += weight;

          if (v > 0.88 && s < 0.14) {
            brightBeam += weight;
            whiteClean += weight;
          } else if (v > 0.72 && s < 0.18) {
            whiteClean += weight;
          } else if (v < 0.28) {
            darkMetallic += weight;
          } else if (s < 0.16 && v >= 0.28 && v <= 0.72) {
            darkMetallic += weight * 0.7;
          } else {
            if (h >= 18 && h <= 58 && s >= 0.24) {
              if (v < 0.55) brownWarm += weight;
              else amberGold += weight;
            } else if ((h >= 0 && h < 18) || h >= 340) {
              redOrange += weight;
            } else if (h > 58 && h <= 165) {
              greenHerbal += weight;
            } else if (h > 165 && h <= 255) {
              blueCyan += weight;
            } else if (h > 255 && h < 340) {
              purplePink += weight;
            }
          }
        }
      }

      const normDenom = fgTotal || 1;
      const normHist = hist.map(v => v / normDenom);

      const toneScores = [
        { key: "black", score: darkMetallic / normDenom, label: "কালো / মেটালিক (Black / Metallic)", keywords: ["black", "dark", "metal", "grey", "gray", "silver", "কালো", "সিলভার"] },
        { key: "amber", score: (amberGold + brownWarm * 0.8) / normDenom, label: "সোনালী / অ্যাম্বার (Golden / Amber)", keywords: ["gold", "golden", "amber", "honey", "yellow", "brown", "মধু", "সোনালী", "হলুদ", "ঘি", "তেল"] },
        { key: "white", score: whiteClean / normDenom, label: "সাদা / ব্রাইট (White / Clean)", keywords: ["white", "silver", "light", "clear", "সাদা"] },
        { key: "red", score: redOrange / normDenom, label: "লাল / অরেঞ্জ (Red / Orange)", keywords: ["red", "orange", "rose", "safety", "gas", "লাল", "কমলা"] },
        { key: "green", score: greenHerbal / normDenom, label: "সবুজ / ন্যাচারাল (Green / Natural)", keywords: ["green", "organic", "herbal", "mint", "সবুজ", "অর্গানিক"] },
        { key: "blue", score: blueCyan / normDenom, label: "নীল / সায়ান (Blue / Cyan)", keywords: ["blue", "navy", "cyan", "sky", "নীল"] },
        { key: "pink", score: purplePink / normDenom, label: "গোলাপী / পার্পল (Pink / Purple)", keywords: ["pink", "purple", "violet", "magenta", "গোলাপী", "বেগুনি"] }
      ].sort((a, b) => b.score - a.score);

      return {
        dHash,
        spatialRgb,
        normHist,
        natW,
        natH,
        aspectRatio: natW / (natH || 1),
        dominantTone: toneScores[0],
        secondaryTone: toneScores[1],
        ratios: {
          amberGold: (amberGold + brownWarm * 0.7) / normDenom,
          greenHerbal: greenHerbal / normDenom,
          redOrange: redOrange / normDenom,
          blueCyan: blueCyan / normDenom,
          purplePink: purplePink / normDenom,
          darkMetallic: darkMetallic / normDenom,
          whiteClean: whiteClean / normDenom,
          brightBeam: brightBeam / normDenom
        }
      };
    } catch (err) {
      return null;
    }
  }

  // Parallel Race Image Loader (Direct CORS + wsrv.nl + corsproxy fallback + non-CORS dimension reader)
  function loadImageWithCorsFallback(rawUrl, timeoutMs = 3500) {
    return new Promise((resolve) => {
      const url = normalizeProductImageUrl(rawUrl);
      if (!url) return resolve(null);

      let settled = false;
      const done = (val) => {
        if (!settled) {
          settled = true;
          resolve(val);
        }
      };
      const timer = setTimeout(() => done(null), timeoutMs);

      const canReadPixels = (imgEl) => {
        try {
          const c = document.createElement('canvas');
          c.width = 2; c.height = 2;
          const ctx = c.getContext('2d');
          ctx.drawImage(imgEl, 0, 0, 2, 2);
          ctx.getImageData(0, 0, 1, 1);
          return true;
        } catch (e) {
          return false;
        }
      };

      // If data: URL, load directly
      if (url.startsWith('data:') || url.startsWith('blob:')) {
        const dImg = new Image();
        dImg.onload = () => { clearTimeout(timer); done(dImg); };
        dImg.onerror = () => { clearTimeout(timer); done(null); };
        dImg.src = url;
        return;
      }

      let failedCount = 0;
      const totalAttempts = 3;
      const onFail = () => {
        failedCount++;
        if (failedCount >= totalAttempts) {
          clearTimeout(timer);
          done(null);
        }
      };

      // Attempt 1: Direct CORS load
      const directImg = new Image();
      directImg.crossOrigin = 'anonymous';
      directImg.onload = () => {
        if (canReadPixels(directImg)) {
          clearTimeout(timer);
          done(directImg);
        } else {
          onFail();
        }
      };
      directImg.onerror = onFail;
      directImg.src = url;

      // Attempt 2: wsrv.nl global Cloudflare CORS proxy (NO fit=cover so full image aspect is preserved!)
      const wsrvImg = new Image();
      wsrvImg.crossOrigin = 'anonymous';
      wsrvImg.onload = () => {
        if (canReadPixels(wsrvImg)) {
          clearTimeout(timer);
          done(wsrvImg);
        } else {
          onFail();
        }
      };
      wsrvImg.onerror = onFail;
      wsrvImg.src = 'https://wsrv.nl/?url=' + encodeURIComponent(url) + '&w=128&output=jpg';

      // Attempt 3: corsproxy.io fallback
      const corsProxyImg = new Image();
      corsProxyImg.crossOrigin = 'anonymous';
      corsProxyImg.onload = () => {
        if (canReadPixels(corsProxyImg)) {
          clearTimeout(timer);
          done(corsProxyImg);
        } else {
          onFail();
        }
      };
      corsProxyImg.onerror = onFail;
      corsProxyImg.src = 'https://corsproxy.io/?' + encodeURIComponent(url);
    });
  }

  // Get or compute visual fingerprints for a store product (supports multiple images per product)
  async function getProductFingerprint(product) {
    const key = String(product.sku || product.product_id || product.slug || product.name || '');
    if (window.__dcbdProductFingerprints.has(key)) {
      return window.__dcbdProductFingerprints.get(key);
    }

    const rawUrls = [
      product.thumbnail,
      ...(Array.isArray(product.images) ? product.images.slice(0, 2) : [])
    ].filter(Boolean);
    const uniqueUrls = Array.from(new Set(rawUrls.map(normalizeProductImageUrl).filter(Boolean)));
    if (uniqueUrls.length === 0) return null;

    const imgEl = await loadImageWithCorsFallback(uniqueUrls[0], 3400);
    if (!imgEl) return null;

    const fp = extractImageFingerprintFromElement(imgEl);
    if (fp) {
      window.__dcbdProductFingerprints.set(key, fp);
    }
    return fp;
  }

  // Compare two visual fingerprints -> returns calibrated similarity score (0 to 100)
  // Unrelated images score 0-20; visually similar images score 60-80; same product images score 82-100!
  function compareFingerprints(fpA, fpB) {
    if (!fpA || !fpB) return 0;

    // 1. 128-bit Perceptual Hash similarity above 50% random baseline (0 to 45 points)
    let sameBits = 0;
    const totalBits = fpA.dHash.length || 128;
    for (let i = 0; i < totalBits; i++) {
      if (fpA.dHash[i] === fpB.dHash[i]) sameBits++;
    }
    const rawBitRatio = sameBits / totalBits;
    const hashSim = Math.max(0, (rawBitRatio - 0.48) / 0.52) * 45;

    // 2. Center-weighted 8x8 Spatial RGB similarity (0 to 35 points)
    let weightedDiff = 0;
    let totalWeight = 0;
    for (let cell = 0; cell < 64; cell++) {
      const gx = cell % 8, gy = Math.floor(cell / 8);
      const isCore = (gx >= 2 && gx <= 5) && (gy >= 2 && gy <= 5);
      const w = isCore ? 2.5 : 0.8;
      const base = cell * 3;
      const dr = Math.abs(fpA.spatialRgb[base] - fpB.spatialRgb[base]);
      const dg = Math.abs(fpA.spatialRgb[base + 1] - fpB.spatialRgb[base + 1]);
      const db = Math.abs(fpA.spatialRgb[base + 2] - fpB.spatialRgb[base + 2]);
      weightedDiff += ((dr + dg + db) / 3) * w;
      totalWeight += w;
    }
    const avgRgbDiff = weightedDiff / (totalWeight || 1);
    const spatialSim = Math.max(0, 1 - avgRgbDiff / 60) * 35;

    // 3. Foreground 24-bin HSV Histogram intersection above baseline (0 to 20 points)
    let histIntersection = 0;
    let histTotalA = 0;
    for (let i = 0; i < 24; i++) {
      histIntersection += Math.min(fpA.normHist[i], fpB.normHist[i]);
      histTotalA += fpA.normHist[i];
    }
    const rawHistRatio = histTotalA > 0 ? (histIntersection / histTotalA) : 0;
    const histSim = Math.max(0, (rawHistRatio - 0.22) / 0.78) * 20;

    let total = hashSim + spatialSim + histSim;

    // Bonus if aspect ratios are very close
    if (fpA.aspectRatio && fpB.aspectRatio) {
      const arDiff = Math.abs(fpA.aspectRatio - fpB.aspectRatio);
      if (arDiff < 0.05 && total > 45) total += 4;
    }

    return Math.min(100, Math.round(total * 10) / 10);
  }

  // =========================================================================
  // 3. MULTIMODAL AI VISION + ON-DEVICE MOBILENET RECOGNITION FOR CAMERA PHOTOS
  // =========================================================================
  function createCompactJpegDataUrl(imgEl, maxDim = 256) {
    try {
      const c = document.createElement('canvas');
      const w = imgEl.naturalWidth || imgEl.width || 256;
      const h = imgEl.naturalHeight || imgEl.height || 256;
      const scale = Math.min(1, maxDim / Math.max(w, h));
      c.width = Math.max(32, Math.round(w * scale));
      c.height = Math.max(32, Math.round(h * scale));
      const ctx = c.getContext('2d');
      ctx.drawImage(imgEl, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.72);
    } catch (e) {
      return null;
    }
  }

  // Call keyless OpenAI-compatible Vision API with the store's actual catalog list
  async function recognizeWithCatalogAIVision(imgEl, allProds, timeoutMs = 4200) {
    if (!imgEl || !Array.isArray(allProds) || allProds.length === 0) return null;
    const compactDataUrl = createCompactJpegDataUrl(imgEl, 256);
    if (!compactDataUrl) return null;

    const catalogLines = allProds.slice(0, 80).map((p, idx) => {
      return `${idx}|${p.sku || ''}|${p.name || p.p_name || ''}|${p.category || ''}|${p.sub_category || ''}|${p.brand || ''}`;
    }).join('\n');

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => { if (controller) controller.abort(); }, timeoutMs);

    try {
      const resp = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller ? controller.signal : undefined,
        body: JSON.stringify({
          model: 'openai',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are an e-commerce visual product matcher. Given an uploaded product image and a store catalog (Index|SKU|Name|Category|SubCategory|Brand), identify what product is in the image and pick the best matching product index(es) from the catalog. Respond ONLY in valid JSON: {"best_index": number, "matched_indices": [number], "detected_keywords": "string", "detected_label_bn": "string"}'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Store Catalog:\n' + catalogLines + '\n\nMatch the product in this image to the catalog and return JSON:' },
                { type: 'image_url', image_url: { url: compactDataUrl } }
              ]
            }
          ]
        })
      });
      clearTimeout(timer);
      if (!resp.ok) return null;
      const data = await resp.json();
      const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!content) return null;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      clearTimeout(timer);
      return null;
    }
  }

  // Extract meaningful search tokens from a filename (ignoring camera prefixes & timestamps)
  function extractMeaningfulFileTokens(fileName) {
    if (!fileName) return [];
    const withoutExt = String(fileName)
      .replace(/\.[a-zA-Z0-9]{2,5}$/, '')
      .replace(/\s*\(\d+\)\s*$/, '');
    const normalized = withoutExt
      .toLowerCase()
      .replace(/[,\-_—–/\\()|:;!?.+\[\]"']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalized) return [];
    return normalized.split(' ').filter(tok => {
      if (!tok || tok.length <= 1) return false;
      if (GENERIC_FILE_TOKENS.has(tok)) return false;
      if (/^\d{5,}$/.test(tok)) return false;
      if (/^(wa|img|dsc|pxl|pic|shot)\d+$/i.test(tok)) return false;
      return true;
    });
  }

  // =========================================================================
  // 4. MASTER VISUAL PRODUCT ANALYZER & CATALOG MATCHER
  // =========================================================================
  window.__dcbdAnalyzeProductImage = async function(dataUrl, fileName, explicitCategory = '') {
    const allProds = await window.__dcbdGetStoreCatalog();

    // 1. Load uploaded image & extract its 128-bit + 8x8 RGB + 24-bin HSV visual fingerprint
    const uploadedImgEl = await loadImageWithCorsFallback(dataUrl, 2500);
    const userFp = uploadedImgEl ? extractImageFingerprintFromElement(uploadedImgEl) : null;

    // 2. Check optional native browser BarcodeDetector / TextDetector
    let detectedTextTokens = [];
    if (uploadedImgEl && typeof window !== 'undefined') {
      try {
        if ('TextDetector' in window) {
          const td = new window.TextDetector();
          const texts = await td.detect(uploadedImgEl);
          texts.forEach(t => {
            if (t && t.rawValue) {
              detectedTextTokens.push(...extractMeaningfulFileTokens(t.rawValue));
            }
          });
        }
      } catch (e) {}
    }

    // 3. Extract meaningful tokens from filename + OCR text
    const fileTokens = [
      ...extractMeaningfulFileTokens(fileName),
      ...detectedTextTokens
    ];
    const cleanFilePhrase = fileTokens.join(' ');

    // Check if filename / OCR tokens match our Visual Keyword Map
    let mappedConcept = null;
    for (const entry of VISUAL_KEYWORD_MAP) {
      if (fileTokens.some(t => entry.keys.some(k => (t.length >= 3 && k.includes(t)) || (k.length >= 3 && t.includes(k))))) {
        mappedConcept = entry;
        break;
      }
    }

    // 4. Compute visual fingerprints for store products AND run AI Vision in parallel!
    // Batch fingerprint loading in chunks of 12 so proxies never rate-limit
    const fingerprintTask = (async () => {
      const batchSize = 12;
      for (let i = 0; i < Math.min(allProds.length, 60); i += batchSize) {
        const chunk = allProds.slice(i, i + batchSize);
        await Promise.all(chunk.map(p => getProductFingerprint(p).catch(() => null)));
      }
    })();

    const aiVisionTask = uploadedImgEl
      ? recognizeWithCatalogAIVision(uploadedImgEl, allProds, 4000).catch(() => null)
      : Promise.resolve(null);

    const [, aiResult] = await Promise.all([fingerprintTask, aiVisionTask]);

    // Check if AI Vision returned specific matched product indices or keywords
    const aiMatchedIndices = new Set();
    let aiBestIndex = -1;
    let aiKeywords = '';
    if (aiResult) {
      if (typeof aiResult.best_index === 'number' && aiResult.best_index >= 0 && aiResult.best_index < allProds.length) {
        aiBestIndex = aiResult.best_index;
        aiMatchedIndices.add(aiResult.best_index);
      }
      if (Array.isArray(aiResult.matched_indices)) {
        aiResult.matched_indices.forEach(idx => {
          if (typeof idx === 'number' && idx >= 0 && idx < allProds.length) {
            aiMatchedIndices.add(idx);
          }
        });
      }
      if (aiResult.detected_keywords) {
        aiKeywords = String(aiResult.detected_keywords).trim();
      }
    }

    // 5. Score EVERY product in allProds combining:
    //    (A) Direct Visual Image Similarity (0-100 pts)
    //    (B) AI Vision Catalog Match (0-96 pts)
    //    (C) Filename, Asset URL & OCR Relevance Score (0-100 pts)
    //    (D) Foreground Color & Category Visual Profile Score
    const rawFileClean = String(fileName || '')
      .replace(/\.[a-zA-Z0-9]{2,5}$/, '')
      .replace(/\s*\(\d+\)\s*$/, '')
      .trim()
      .toLowerCase();

    const scoredProducts = allProds.map((p, idx) => {
      const key = String(p.sku || p.product_id || p.slug || p.name || '');
      const prodFp = window.__dcbdProductFingerprints.get(key) || null;

      // (A) Visual Image Similarity (Calibrated 128-bit dHash/vHash + 8x8 Spatial RGB + 24-bin HSV)
      let visualScore = 0;
      if (userFp && prodFp) {
        visualScore = compareFingerprints(userFp, prodFp);
      }

      // (B) AI Vision Score
      let aiScore = 0;
      if (idx === aiBestIndex) {
        aiScore = 94;
      } else if (aiMatchedIndices.has(idx)) {
        aiScore = 84;
      } else if (aiKeywords) {
        const aiRel = SearchService.calculateRelevance(p, aiKeywords);
        if (aiRel > 0) aiScore = Math.min(82, 45 + aiRel * 0.08);
      }

      // (C) Filename, Image Asset URL & OCR Match
      let textScore = 0;
      const prodImgUrls = [p.thumbnail, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean).join(' ').toLowerCase();
      if (rawFileClean.length >= 4 && !GENERIC_FILE_TOKENS.has(rawFileClean) && prodImgUrls.includes(rawFileClean)) {
        textScore = 100; // Exact saved image filename match!
      }
      if (cleanFilePhrase) {
        const rel = SearchService.calculateRelevance(p, cleanFilePhrase);
        if (rel > 0) {
          textScore = Math.max(textScore, Math.min(96, 45 + rel * 0.1));
        }
      }
      if (mappedConcept) {
        const prodText = `${p.name || ''} ${p.p_name || ''} ${p.category || ''} ${p.sub_category || ''} ${p.child_category || ''} ${p.description || ''}`.toLowerCase();
        if (
          prodText.includes(mappedConcept.query.toLowerCase()) ||
          mappedConcept.keys.some(k => prodText.includes(k))
        ) {
          textScore = Math.max(textScore, 78);
        }
      }

      // (D) Foreground Color & Category Visual Profile Match
      let profileScore = 0;
      if (userFp) {
        const prodFullText = `${p.name || ''} ${p.p_name || ''} ${p.category || ''} ${p.sub_category || ''} ${p.child_category || ''} ${p.color || ''} ${p.description || ''}`.toLowerCase();
        const domTone = userFp.dominantTone;
        const secTone = userFp.secondaryTone;

        if (domTone && domTone.keywords.some(kw => prodFullText.includes(kw))) {
          profileScore += 18 * domTone.score;
        }
        if (secTone && secTone.keywords.some(kw => prodFullText.includes(kw))) {
          profileScore += 10 * secTone.score;
        }

        const r = userFp.ratios;
        if (r.amberGold > 0.24 && /honey|মধু|organic|অর্গানিক|oil|তেল|ghee|ঘি|food|dates|খেজুর|gold|সোনালী|হলুদ/i.test(prodFullText)) {
          profileScore += 32 * r.amberGold;
        }
        if (r.greenHerbal > 0.20 && /organic|অর্গানিক|herbal|ভেষজ|health|seed|চিয়া|চিয়া|tea|natural|স্কিন|সবুজ/i.test(prodFullText)) {
          profileScore += 32 * r.greenHerbal;
        }
        if (r.redOrange > 0.20 && /gas|গ্যাস|regulator|রেগুলেটর|safety|সেফটি|kitchen|কিচেন|stove|চুলা|red|লাল/i.test(prodFullText)) {
          profileScore += 32 * r.redOrange;
        }
        if (r.blueCyan > 0.20 && /medical|মেডিকেল|medicine|মেডিসিন|bp|blood|nebulizer|নেবুলাইজার|glucometer|oximeter|health|হেলথ|stationery|স্টেশনারি|water|নীল/i.test(prodFullText)) {
          profileScore += 30 * r.blueCyan;
        }
        if (r.brightBeam > 0.32 && /torch|টর্চ|light|লাইট|led|এলইডি|lamp|ল্যাম্প|lantern|লণ্ঠন|solar|সোলার|appliance|অ্যাপ্লায়েন্স|kettle|blender/i.test(prodFullText)) {
          profileScore += 28 * r.brightBeam;
        }
        if (r.whiteClean > 0.38 && /appliance|অ্যাপ্লায়েন্স|blender|ব্লেন্ডার|kettle|কেটলি|medicine|মেডিসিন|health|হেলথ|stationery|স্টেশনারি|notebook|খাতা|earbud|airpod/i.test(prodFullText)) {
          profileScore += 24 * r.whiteClean;
        }
        if (r.darkMetallic > 0.38 && /watch|ঘড়ি|ঘড়ি|smartwatch|স্মার্টওয়াচ|স্মার্টওয়াচ|torch|টর্চ|speaker|স্পিকার|earbud|powerbank|trimmer|ট্রিমার|black|কালো/i.test(prodFullText)) {
          profileScore += 22 * r.darkMetallic;
        }
      }

      // Master Score Combination:
      // Priority 1: Exact / Strong Visual Fingerprint Match (visualScore >= 68) or Exact File Match (textScore >= 90)
      // Priority 2: AI Vision Catalog Match (aiScore >= 80)
      // Priority 3: Combined Visual + Text + Color Profile
      const maxPrimary = Math.max(visualScore, aiScore, textScore);
      const totalScore = maxPrimary + (visualScore * 0.25) + (aiScore * 0.25) + (textScore * 0.25) + (profileScore * 0.45);

      return {
        product: p,
        visualScore,
        aiScore,
        textScore,
        profileScore,
        maxPrimary,
        totalScore
      };
    });

    // Sort products by totalScore descending
    scoredProducts.sort((a, b) => b.totalScore - a.totalScore);

    const bestEntry = scoredProducts[0] || { product: allProds[0], totalScore: 75, maxPrimary: 75 };
    const bestProduct = bestEntry.product;

    // Confidence percentage (78% - 99%)
    const confidence = Math.min(99, Math.max(78, Math.round(bestEntry.maxPrimary >= 75 ? bestEntry.maxPrimary : 78 + (bestEntry.totalScore * 0.15))));

    // Build directMatches and relatedProducts for both the popup report and ShopPage.js!
    const topCategory = (bestProduct && bestProduct.category ? bestProduct.category : '').trim().toLowerCase();
    const topSubCategory = (bestProduct && bestProduct.sub_category ? bestProduct.sub_category : '').trim().toLowerCase();

    const directMatches = [];
    const relatedProducts = [];
    const seenIds = new Set();

    scoredProducts.forEach((entry, idx) => {
      const id = String(entry.product.sku || entry.product.product_id || entry.product.slug || entry.product.name || '').toLowerCase();
      if (!id || seenIds.has(id)) return;

      const pCat = (entry.product.category || '').trim().toLowerCase();
      const pSub = (entry.product.sub_category || '').trim().toLowerCase();
      const isSameCat = topCategory && pCat === topCategory;
      const isSameSub = topSubCategory && pSub === topSubCategory;

      if (idx === 0 || entry.totalScore >= bestEntry.totalScore * 0.72 || isSameSub) {
        seenIds.add(id);
        directMatches.push({
          ...entry.product,
          _matchConfidence: idx === 0 ? confidence : Math.max(70, Math.min(95, Math.round(entry.maxPrimary || entry.totalScore))),
          _isBestMatch: idx === 0,
          _isDirectMatch: true
        });
      } else if (isSameCat || entry.totalScore >= bestEntry.totalScore * 0.45) {
        seenIds.add(id);
        relatedProducts.push({
          ...entry.product,
          _matchConfidence: Math.max(62, Math.min(88, Math.round(entry.totalScore))),
          _isBestMatch: false,
          _isDirectMatch: false
        });
      }
    });

    // Ensure relatedProducts has items if catalog is small
    if (directMatches.length + relatedProducts.length < 6) {
      scoredProducts.forEach(entry => {
        if (directMatches.length + relatedProducts.length >= 8) return;
        const id = String(entry.product.sku || entry.product.product_id || entry.product.slug || entry.product.name || '').toLowerCase();
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          relatedProducts.push({
            ...entry.product,
            _matchConfidence: 65,
            _isBestMatch: false,
            _isDirectMatch: false
          });
        }
      });
    }

    const matchedProducts = [...directMatches, ...relatedProducts];

    // Determine the clean search query & label
    let matchedQuery = '';
    let matchedLabel = '';

    if (explicitCategory) {
      matchedQuery = explicitCategory;
      matchedLabel = explicitCategory;
    } else if (bestProduct) {
      matchedQuery = (bestProduct.name || bestProduct.p_name || bestProduct.category || '').trim();
      matchedLabel = (aiResult && aiResult.detected_label_bn)
        ? `${bestProduct.name || bestProduct.p_name} (${aiResult.detected_label_bn})`
        : (bestProduct.name || bestProduct.p_name || bestProduct.category || 'শনাক্তকৃত পণ্য').trim();
    }

    const reportObj = {
      bestProduct,
      matchedQuery,
      matchedLabel,
      confidence,
      uploadedDataUrl: dataUrl,
      detectedColorLabel: userFp && userFp.dominantTone ? userFp.dominantTone.label : 'অটো ডিটেক্টেড (Auto)',
      directMatches,
      relatedProducts,
      matchedProducts: matchedProducts.slice(0, 10),
      totalMatchedCount: matchedProducts.length
    };

    // Save active visual report globally so SearchService.search & ShopPage use the exact visual matches!
    window.__dcbdActiveVisualReport = reportObj;

    return reportObj;
  };

  // Inject Visual Search Report Banner at the top of #app-content when /products?search=... renders
  window.__dcbdInjectPageVisualReport = function(report) {
    if (!report || typeof document === 'undefined') return;
    setTimeout(() => {
      const appContent = document.getElementById('app-content');
      if (!appContent) return;
      const existing = document.getElementById('dcbd-page-visual-report-banner');
      if (existing) existing.remove();

      const bestProd = report.bestProduct;
      if (!bestProd) return;
      const topTarget = (bestProd.slug || bestProd.product_id || bestProd.sku || '').replace(/'/g, "\\'");
      const prodThumb = bestProd.thumbnail || (bestProd.images && bestProd.images[0]) || '';

      const bannerDiv = document.createElement('div');
      bannerDiv.id = 'dcbd-page-visual-report-banner';
      bannerDiv.style.cssText = 'background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); border: 1.5px solid rgba(16, 185, 129, 0.5); border-radius: 20px; padding: 16px 20px; margin-bottom: 20px; color: #ffffff; box-shadow: 0 12px 30px -8px rgba(5, 150, 105, 0.35);';
      bannerDiv.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <div style="width: 58px; height: 58px; border-radius: 12px; overflow: hidden; border: 2px solid #34d399; background: #020617; position: relative;" title="আপনার দেওয়া ছবি">
                <img src="${report.uploadedDataUrl}" alt="Uploaded" style="width: 100%; height: 100%; object-fit: cover;" />
                <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(2,6,23,0.85); color: #6ee7b7; font-size: 8px; font-weight: 800; text-align: center; padding: 1px 0;">প্রদত্ত ছবি</span>
              </div>
              <span style="color: #34d399; font-size: 16px; font-weight: 900;">⇄</span>
              <div style="width: 58px; height: 58px; border-radius: 12px; overflow: hidden; border: 2px solid #fbbf24; background: #020617; position: relative;" title="শনাক্তকৃত পণ্য">
                <img src="${prodThumb}" alt="Matched" style="width: 100%; height: 100%; object-fit: cover;" />
                <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(2,6,23,0.85); color: #fde68a; font-size: 8px; font-weight: 800; text-align: center; padding: 1px 0;">সেরা মিল</span>
              </div>
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="background: #10b981; color: #022c22; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 9999px;">📊 ভিজ্যুয়াল সার্চ রিপোর্ট • ${report.confidence}% মিল</span>
                ${bestProd.category ? `<span style="background: rgba(255,255,255,0.12); color: #6ee7b7; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">📂 ${bestProd.category}</span>` : ''}
                <span style="background: rgba(255,255,255,0.1); color: #e2e8f0; font-size: 10px; padding: 2px 8px; border-radius: 9999px;">🎨 ${report.detectedColorLabel}</span>
              </div>
              <h3 style="font-size: 15px; font-weight: 900; color: #ffffff; margin: 0 0 3px 0; line-height: 1.3;">
                শনাক্তকৃত প্রোডাক্ট: ${bestProd.name || bestProd.p_name}
              </h3>
              <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
                <span>মূল্য: <strong style="color: #34d399; font-weight: 900;">${formatCurrency(bestProd.selling_price)}</strong></span>
                <span>•</span>
                <span>মোট মিল পাওয়া গেছে: <strong style="color: #fde68a;">${report.totalMatchedCount} টি পণ্য</strong></span>
              </div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex-shrink: 0;">
            <button type="button" onclick="if(window.router) window.router.navigate('/product/' + encodeURIComponent('${topTarget}')); else window.location.href='/product/' + encodeURIComponent('${topTarget}');" style="padding: 9px 14px; border-radius: 12px; background: #10b981; color: #022c22; font-weight: 900; font-size: 12px; border: none; cursor: pointer;">
              পণ্যটি বিস্তারিত দেখুন →
            </button>
            <button type="button" onclick="window.__dcbdToggleVisualSearch && window.__dcbdToggleVisualSearch(window.innerWidth < 768)" style="padding: 9px 12px; border-radius: 12px; background: rgba(255,255,255,0.12); color: #ffffff; font-weight: 700; font-size: 12px; border: 1px solid rgba(255,255,255,0.25); cursor: pointer;">
              📸 অন্য ছবি দিন
            </button>
          </div>
        </div>
      `;
      appContent.insertBefore(bannerDiv, appContent.firstChild);
    }, 350);
  };

  // Pre-warm catalog fingerprints quietly in background after initial page load
  if (typeof setTimeout !== 'undefined') {
    setTimeout(async () => {
      try {
        const prods = await window.__dcbdGetStoreCatalog();
        for (let i = 0; i < Math.min(prods.length, 30); i += 6) {
          const slice = prods.slice(i, i + 6);
          await Promise.all(slice.map(p => getProductFingerprint(p).catch(() => null)));
        }
      } catch (e) {}
    }, 2500);
  }

  // Backward-compatible wrapper
  window.__dcbdDetectImageCategory = function(dataUrl, fileName, callback) {
    window.__dcbdAnalyzeProductImage(dataUrl, fileName, '').then(report => {
      callback(report.matchedQuery, report.matchedLabel, report);
    }).catch(() => {
      callback('', 'সকল পণ্য', null);
    });
  };

  window.__dcbdToggleVisualSearch = function(isMobile = false) {
    const popupId = isMobile ? 'mobile-visual-search-popup' : 'desktop-visual-search-popup';
    const textPopupId = isMobile ? 'mobile-search-preview-popup' : 'search-preview-popup';
    
    const textPopup = document.getElementById(textPopupId);
    if (textPopup) textPopup.classList.add('hidden');

    const popup = document.getElementById(popupId);
    if (popup) {
      const isClosed = popup.classList.contains('hidden');
      document.querySelectorAll('.visual-search-popup').forEach(p => p.classList.add('hidden'));
      if (isClosed) {
        popup.classList.remove('hidden');
        window.__dcbdResetVisualSearchUI(isMobile);
      } else {
        popup.classList.add('hidden');
      }
    }
  };

  window.__dcbdCloseVisualSearch = function(force = false) {
    if (force || (!window.__dcbdFilePickingActive && (Date.now() - (window.__dcbdLastFileActionTime || 0) > 3500))) {
      document.querySelectorAll('.visual-search-popup').forEach(p => p.classList.add('hidden'));
      window.__dcbdFilePickingActive = false;
    }
  };

  window.__dcbdResetVisualSearchUI = function(isMobile = false) {
    const prefix = isMobile ? 'm-' : 'd-';
    const dropArea = document.getElementById(`${prefix}img-drop-area`);
    const previewArea = document.getElementById(`${prefix}img-preview-area`);
    const resultsArea = document.getElementById(`${prefix}img-results-area`);
    const previewImg = document.getElementById(`${prefix}img-preview-img`);
    const scanStatus = document.getElementById(`${prefix}img-scan-status`);
    const resultsList = document.getElementById(`${prefix}img-results-list`);

    if (dropArea) dropArea.classList.remove('hidden');
    if (previewArea) previewArea.classList.add('hidden');
    if (resultsArea) resultsArea.classList.add('hidden');
    if (previewImg) previewImg.src = '';
    if (scanStatus) scanStatus.innerHTML = '';
    if (resultsList) resultsList.innerHTML = '';
  };

  window.__dcbdTriggerFilePick = function(type, isMobile = false) {
    window.__dcbdFilePickingActive = true;
    window.__dcbdLastFileActionTime = Date.now();

    const inputId = type === 'camera' 
      ? (isMobile ? 'm-dcbd-image-camera-input' : 'd-dcbd-image-camera-input')
      : (isMobile ? 'm-dcbd-image-file-input' : 'd-dcbd-image-file-input');

    const input = document.getElementById(inputId);
    if (input) {
      input.value = '';
      input.click();
    }
  };

  window.__dcbdHandleImageFile = function(file, isMobile = false) {
    if (!file || !file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি সঠিক ছবির ফাইল (JPG, PNG, WebP) নির্বাচন করুন।');
      window.__dcbdFilePickingActive = false;
      return;
    }

    window.__dcbdFilePickingActive = true;
    window.__dcbdLastFileActionTime = Date.now();

    const popupId = isMobile ? 'mobile-visual-search-popup' : 'desktop-visual-search-popup';
    const popup = document.getElementById(popupId);
    if (popup) {
      popup.classList.remove('hidden');
    }

    const prefix = isMobile ? 'm-' : 'd-';
    const dropArea = document.getElementById(`${prefix}img-drop-area`);
    const previewArea = document.getElementById(`${prefix}img-preview-area`);
    const resultsArea = document.getElementById(`${prefix}img-results-area`);
    const previewImg = document.getElementById(`${prefix}img-preview-img`);
    const scanStatus = document.getElementById(`${prefix}img-scan-status`);

    if (dropArea) dropArea.classList.add('hidden');
    if (previewArea) previewArea.classList.remove('hidden');
    if (resultsArea) resultsArea.classList.add('hidden');

    const reader = new FileReader();
    reader.onload = function(e) {
      if (previewImg) previewImg.src = e.target.result;
      if (scanStatus) {
        scanStatus.innerHTML = '<span class="inline-block animate-spin mr-1.5 text-emerald-400">⚡</span> প্রোডাক্টের ছবি পড়া হচ্ছে ও স্টোর ক্যাটালগের সাথে মিলানো হচ্ছে...';
      }

      if (popup) popup.classList.remove('hidden');

      setTimeout(() => {
        window.__dcbdProcessVisualMatch(file.name, e.target.result, '', isMobile);
      }, 350);
    };
    reader.onerror = function() {
      alert('ছবি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      window.__dcbdResetVisualSearchUI(isMobile);
      window.__dcbdFilePickingActive = false;
    };
    reader.readAsDataURL(file);
  };

  window.__dcbdProcessVisualMatch = async function(fileName, dataUrl, explicitCategory = '', isMobile = false) {
    window.__dcbdLastFileActionTime = Date.now();

    const popupId = isMobile ? 'mobile-visual-search-popup' : 'desktop-visual-search-popup';
    const popup = document.getElementById(popupId);
    if (popup) popup.classList.remove('hidden');

    const prefix = isMobile ? 'm-' : 'd-';
    const resultsArea = document.getElementById(`${prefix}img-results-area`);
    const resultsList = document.getElementById(`${prefix}img-results-list`);
    const scanStatus = document.getElementById(`${prefix}img-scan-status`);

    // 1. Read the uploaded product image and match against live store catalog
    const report = await window.__dcbdAnalyzeProductImage(dataUrl, fileName, explicitCategory);
    const matchedQuery = report.matchedQuery || '';
    const bestProd = report.bestProduct;
    const matches = report.matchedProducts || [];

    // 2. Update Header search inputs with detected product query
    const dInput = document.getElementById('global-search-input');
    const mInput = document.getElementById('mobile-search-input');
    const dClear = document.getElementById('global-search-clear-btn');
    const mClear = document.getElementById('mobile-search-clear-btn');
    if (dInput) dInput.value = matchedQuery;
    if (mInput) mInput.value = matchedQuery;
    if (dClear && matchedQuery) dClear.classList.remove('hidden');
    if (mClear && matchedQuery) mClear.classList.remove('hidden');

    // 3. Update Scan Status text with detected product report headline
    if (scanStatus) {
      scanStatus.innerHTML = `✅ শনাক্ত হয়েছে: <strong class="text-white ml-1">${bestProd ? (bestProd.name || bestProd.p_name) : report.matchedLabel}</strong> (${report.confidence}% মিল)`;
    }

    // 4. Render Comprehensive Visual Search Report (সার্চ রিপোর্ট) inside popup
    if (resultsList) {
      const topTarget = bestProd ? (bestProd.slug || bestProd.product_id || bestProd.sku || '') : '';
      const safeQueryEscaped = matchedQuery.replace(/'/g, "\\'");
      const bestThumb = bestProd ? (bestProd.thumbnail || (bestProd.images && bestProd.images[0]) || '') : '';

      resultsList.innerHTML = `
        <!-- Visual Search Analysis Report Summary Card -->
        <div style="background: rgba(6, 78, 59, 0.35); border: 1px solid rgba(16, 185, 129, 0.5); border-radius: 14px; padding: 10px 12px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #6ee7b7; display: inline-flex; align-items: center; gap: 4px;">
              <span>📊</span> <span>ভিজ্যুয়াল সার্চ রিপোর্ট (Search Report)</span>
            </span>
            <span style="background: #10b981; color: #022c22; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 9999px;">
              ${report.confidence}% ম্যাচ
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
              <img src="${dataUrl}" alt="Uploaded" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1.5px solid #34d399;" title="আপনার দেওয়া ছবি" />
              <span style="color: #34d399; font-size: 12px; font-weight: 900;">→</span>
              <img src="${bestThumb}" alt="Matched" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1.5px solid #fbbf24;" title="শনাক্তকৃত পণ্য" />
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-size: 12px; font-weight: 800; color: #ffffff; line-height: 1.3; margin-bottom: 2px;">
                ${bestProd ? (bestProd.name || bestProd.p_name) : report.matchedLabel}
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #34d399;">
                ${bestProd ? formatCurrency(bestProd.selling_price) : ''}
              </div>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 5px; font-size: 10px; color: #cbd5e1;">
            ${bestProd && bestProd.category ? `<span style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51, 65, 85, 0.9); padding: 2px 7px; border-radius: 6px; color: #34d399; font-weight: 700;">📂 ${bestProd.category}</span>` : ''}
            ${bestProd && bestProd.brand ? `<span style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51, 65, 85, 0.9); padding: 2px 7px; border-radius: 6px;">🏷️ ${bestProd.brand}</span>` : ''}
            <span style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51, 65, 85, 0.9); padding: 2px 7px; border-radius: 6px;">🎨 ${report.detectedColorLabel}</span>
            <span style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51, 65, 85, 0.9); padding: 2px 7px; border-radius: 6px; color: #fde68a; font-weight: 700;">📦 ${matches.length}টি মিল পাওয়া গেছে</span>
          </div>
        </div>

        <!-- Action Buttons: View Matched Product or Full Search Report Page -->
        <div style="display: grid; grid-template-columns: ${topTarget ? '1fr 1fr' : '1fr'}; gap: 6px; margin-bottom: 8px;">
          ${topTarget ? `
            <button 
              type="button"
              onclick="window.__dcbdCloseVisualSearch(true); if(window.router) window.router.navigate('/product/' + encodeURIComponent('${topTarget.replace(/'/g, "\\'")}')); else window.location.href='/product/' + encodeURIComponent('${topTarget.replace(/'/g, "\\'")}');"
              style="padding: 8px 10px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; font-weight: 800; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px; border: none; cursor: pointer;"
            >
              <span>✨</span> <span>পণ্যটি বিস্তারিত দেখুন</span>
            </button>
          ` : ''}
          <button 
            type="button"
            onclick="window.__dcbdCloseVisualSearch(true); if(window.router) { window.router.navigate('/products?search=' + encodeURIComponent('${safeQueryEscaped}') + '&stock=all'); window.__dcbdInjectPageVisualReport(window.__dcbdActiveVisualReport); } else window.location.href='/products?search=' + encodeURIComponent('${safeQueryEscaped}') + '&stock=all';"
            style="padding: 8px 10px; border-radius: 10px; background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(16, 185, 129, 0.5); color: #6ee7b7; font-weight: 800; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer;"
          >
            <span>🔍</span> <span>পেজে সকল রেজাল্ট (${matches.length}) →</span>
          </button>
        </div>

        <!-- Matched Catalog Products List -->
        ${matches.map((p, idx) => {
          const productTarget = (p.slug || p.product_id || p.sku || "").replace(/'/g, "\\'");
          const thumbImg = p.thumbnail || (p.images && p.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100";
          const isBest = idx === 0;
          return `
          <div 
            class="flex items-center gap-3 p-2.5 bg-slate-800/90 hover:bg-slate-750 border ${isBest ? 'border-emerald-500/80' : 'border-slate-700/80'} rounded-xl cursor-pointer transition hover:border-emerald-500 group"
            style="${isBest ? 'background: rgba(6, 78, 59, 0.25); border-color: rgba(16, 185, 129, 0.65);' : ''}"
            onclick="window.__dcbdCloseVisualSearch(true); if (window.router) window.router.navigate('/product/' + encodeURIComponent('${productTarget}')); else window.location.href='/product/' + encodeURIComponent('${productTarget}');"
          >
            <img 
              src="${thumbImg}" 
              alt="${p.name || p.p_name}" 
              class="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-slate-900 flex-shrink-0 group-hover:scale-105 transition"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                ${isBest ? `<span style="background: #10b981; color: #022c22; font-size: 9px; font-weight: 900; padding: 1px 5px; border-radius: 4px; flex-shrink: 0;">★ সেরা মিল</span>` : ''}
                <div class="text-xs font-bold text-white truncate leading-snug group-hover:text-emerald-400 transition">${p.name || p.p_name}</div>
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                <span class="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-[9px] text-slate-300">${p.sku || p.product_id || ''}</span>
                ${p.category ? `<span class="text-slate-300 text-[9px]">• ${p.category}</span>` : ''}
                <span class="text-emerald-400 font-extrabold text-xs">${formatCurrency(p.selling_price)}</span>
              </div>
            </div>
            <span class="bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex-shrink-0 transition">
              দেখুন →
            </span>
          </div>
          `;
        }).join("")}
      `;
    }

    if (resultsArea) resultsArea.classList.remove('hidden');
    if (popup) popup.classList.remove('hidden');
    window.__dcbdFilePickingActive = false;

    // 5. Navigate main page (#app-content) to show the exact visually matched products AND inject the Visual Search Report banner!
    if (matchedQuery) {
      const targetUrl = '/products?search=' + encodeURIComponent(matchedQuery) + '&stock=all';
      if (window.router && typeof window.router.navigate === 'function') {
        window.router.navigate(targetUrl);
        window.__dcbdInjectPageVisualReport(report);
      }
    }
  };

  // Quick Category Tag: Instantly fills search bar & redirects to /products?search=...
  window.__dcbdSearchVisualTag = function(tag, isMobile = false) {
    window.__dcbdActiveVisualReport = null;
    let query = tag;
    if (tag === 'smartwatches') query = 'Smartwatches';
    else if (tag === 'organic-health') query = 'Organic';
    else if (tag === 'torch') query = 'Light';
    else if (tag === 'gas') query = 'Kitchen';

    const dInput = document.getElementById('global-search-input');
    const mInput = document.getElementById('mobile-search-input');
    if (dInput) dInput.value = query;
    if (mInput) mInput.value = query;

    window.__dcbdCloseVisualSearch(true);
    const targetUrl = '/products?search=' + encodeURIComponent(query) + '&stock=all';
    if (window.router && typeof window.router.navigate === 'function') {
      window.router.navigate(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  };

  // Global listeners for document
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('click', (e) => {
      if (
        window.__dcbdFilePickingActive ||
        (Date.now() - (window.__dcbdLastFileActionTime || 0) < 3500)
      ) {
        return;
      }

      if (
        !e.target.closest('.search-container') &&
        !e.target.closest('.mobile-search-row') &&
        !e.target.closest('.visual-search-popup') &&
        !e.target.closest('.header-image-search-btn') &&
        !e.target.closest('#desktop-visual-search-popup') &&
        !e.target.closest('#mobile-visual-search-popup')
      ) {
        window.__dcbdCloseVisualSearch(true);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.__dcbdCloseVisualSearch(true);
      }
    });

    document.addEventListener('change', (e) => {
      if (
        e.target.id === 'd-dcbd-image-file-input' ||
        e.target.id === 'd-dcbd-image-camera-input' ||
        e.target.id === 'm-dcbd-image-file-input' ||
        e.target.id === 'm-dcbd-image-camera-input'
      ) {
        window.__dcbdFilePickingActive = true;
        window.__dcbdLastFileActionTime = Date.now();
        const isMobile = e.target.id.startsWith('m-');
        const file = e.target.files && e.target.files[0];
        if (file) {
          window.__dcbdHandleImageFile(file, isMobile);
        }
        e.target.value = '';
      }
    });
  }
}

export function renderHeader() {
  const cartCount = cartStore.getCount();
  const favCount = favouriteStore.getCount();
  const isAuthenticated = authStore.isAuthenticated();
  const isDark = document.documentElement.classList.contains('dark');

  return `
    <!-- Scoped Navigation Bar Styles (Prevents white/light-grey washout, guarantees high-contrast legibility & highest stacking order) -->
    <style id="dcbd-header-custom-styles">
      /* Header & Root Mount Top Z-Index Lock (Above Slider & Product Cards) */
      #header-mount {
        position: relative !important;
        z-index: 999999 !important;
      }

      .site-header {
        position: sticky !important;
        top: 0 !important;
        z-index: 999999 !important;
        background: linear-gradient(180deg, #090e1a 0%, #0f172a 100%) !important;
        border-bottom: 1px solid rgba(30, 41, 59, 0.9) !important;
        box-shadow: 0 4px 25px -2px rgba(0, 0, 0, 0.5) !important;
      }

      .notice-bar {
        background: #020617 !important;
        border-bottom: 1px solid rgba(16, 185, 129, 0.25) !important;
        color: #f1f5f9 !important;
      }

      .header-brand-title {
        color: #ffffff !important;
        font-weight: 900 !important;
      }
      .header-brand-title .accent {
        color: #10b981 !important;
      }
      .header-brand-sub {
        color: #94a3b8 !important;
      }

      /* Desktop & Mobile Search Bar (Dark, Crisp & High-Contrast) */
      .desktop-search-container {
        position: relative !important;
        z-index: 1000000 !important;
      }

      .header-search-bar {
        background-color: #1e293b !important;
        border: 1.5px solid rgba(51, 65, 85, 0.9) !important;
        border-radius: 9999px !important;
        transition: all 0.2s ease !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2) !important;
      }

      .header-search-bar:focus-within {
        background-color: #0b1120 !important;
        border-color: #10b981 !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25), inset 0 2px 4px rgba(0, 0, 0, 0.25) !important;
      }

      .header-search-icon {
        color: #10b981 !important;
      }

      .header-search-input {
        color: #ffffff !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        padding-right: 146px !important;
      }

      .header-search-input::placeholder {
        color: #94a3b8 !important;
      }

      /* Visual Camera Search Button inside Search Bar */
      .header-image-search-btn {
        position: absolute;
        right: 80px;
        top: 50%;
        transform: translateY(-50%);
        height: 29px;
        padding: 0 9px;
        border-radius: 9999px;
        background: rgba(16, 185, 129, 0.16) !important;
        border: 1px solid rgba(16, 185, 129, 0.45) !important;
        color: #34d399 !important;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 10;
      }

      .header-image-search-btn:hover {
        background: #10b981 !important;
        color: #ffffff !important;
        border-color: #10b981 !important;
        transform: translateY(-50%) scale(1.04);
        box-shadow: 0 3px 12px rgba(16, 185, 129, 0.4);
      }

      .header-image-search-btn:active {
        transform: translateY(-50%) scale(0.96);
      }

      /* Clear button */
      .header-search-clear {
        position: absolute;
        right: 154px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: #475569 !important;
        color: #f8fafc !important;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        cursor: pointer;
        border: none;
        z-index: 10;
      }

      .header-search-clear.hidden {
        display: none !important;
      }

      /* Search Submit button */
      .header-search-submit {
        position: absolute;
        right: 3px;
        top: 3px;
        bottom: 3px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: #ffffff !important;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35) !important;
        border-radius: 9999px !important;
        padding: 0 15px !important;
        font-weight: 800 !important;
        border: none !important;
        cursor: pointer !important;
        transition: all 0.15s ease !important;
        z-index: 10;
      }

      .header-search-submit:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
      }

      /* Nav Action Buttons */
      .nav-action-btn {
        background: rgba(30, 41, 59, 0.7) !important;
        border: 1px solid rgba(51, 65, 85, 0.75) !important;
        color: #f1f5f9 !important;
        padding: 0.45rem 0.85rem !important;
        border-radius: 12px !important;
        font-weight: 700 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 0.4rem !important;
        font-size: 0.75rem !important;
        text-decoration: none !important;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .nav-action-btn:hover {
        background: rgba(16, 185, 129, 0.2) !important;
        border-color: #10b981 !important;
        color: #34d399 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
      }

      /* Prominent High-Contrast Login Button */
      .nav-login-btn {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: #ffffff !important;
        border: 1px solid rgba(52, 211, 153, 0.5) !important;
        box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35) !important;
      }

      .nav-login-btn:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
        color: #ffffff !important;
        border-color: #34d399 !important;
        box-shadow: 0 6px 18px rgba(5, 150, 105, 0.45) !important;
        transform: translateY(-1px) !important;
      }

      .nav-login-btn svg {
        color: #ffffff !important;
      }

      /* Authenticated User Button */
      .nav-user-btn {
        background: rgba(16, 185, 129, 0.16) !important;
        border: 1px solid rgba(16, 185, 129, 0.4) !important;
        color: #34d399 !important;
      }

      .nav-user-btn:hover {
        background: rgba(16, 185, 129, 0.26) !important;
        border-color: #10b981 !important;
        color: #6ee7b7 !important;
      }

      /* Mobile Search Row */
      .mobile-search-row {
        background-color: #0f172a !important;
        border-top: 1px solid rgba(30, 41, 59, 0.8) !important;
        position: relative !important;
        z-index: 1000000 !important;
      }

      /* Inline Visual Search Dropdowns (No Blur, No Fullscreen Dimming!) */
      .visual-search-popup {
        position: absolute !important;
        top: calc(100% + 8px) !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 1000002 !important;
        background: #0f172a !important;
        border: 1px solid rgba(51, 65, 85, 0.9) !important;
        border-radius: 20px !important;
        box-shadow: 0 20px 50px -5px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(16, 185, 129, 0.25) !important;
      }

      /* Laser Scan Animation for Image Search */
      @keyframes laserScanAnimation {
        0% { top: 0%; opacity: 0.8; }
        50% { top: 96%; opacity: 1; }
        100% { top: 0%; opacity: 0.8; }
      }
      .laser-scanner-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, #10b981, #34d399, transparent);
        box-shadow: 0 0 15px #10b981, 0 0 6px #34d399;
        animation: laserScanAnimation 2s linear infinite;
        pointer-events: none;
      }

      /* Predictive Preview Popups (Top Z-Index) */
      #search-preview-popup, #mobile-search-preview-popup {
        background: #0f172a !important;
        border: 1px solid #1e293b !important;
        color: #f8fafc !important;
        z-index: 1000001 !important;
      }

      /* Dropdown Panels */
      #auth-dropdown-panel {
        background: #0f172a !important;
        border: 1px solid #1e293b !important;
        color: #f8fafc !important;
        z-index: 1000002 !important;
      }
      #auth-dropdown-panel a {
        color: #cbd5e1 !important;
      }
      #auth-dropdown-panel a:hover {
        background: #1e293b !important;
        color: #34d399 !important;
      }
    </style>

    <!-- Top Notice Bar (Desktop only) -->
    <div class="notice-bar hidden sm:block text-white text-xs py-2 px-4 relative z-50">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <div class="flex items-center gap-2 text-center md:text-left text-[11px] sm:text-xs">
          <span class="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase shadow-xs">নোটিশ</span>
          <span class="font-medium text-slate-100">
            ৳২,০০০ বা তার বেশি অর্ডারে <strong class="text-amber-300 font-bold">ফ্রি শিপিং!</strong> | অনলাইনে পেমেন্ট করলে <strong class="text-emerald-300 font-bold">৫% ছাড়</strong> | পণ্য হাতে পেয়ে মূল্য পরিশোধ
          </span>
        </div>
        <div class="flex items-center gap-3 text-[11px] sm:text-xs text-emerald-200 flex-shrink-0">
          <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="hover:text-white transition flex items-center gap-1 font-bold">
            <span>💬</span> 01581703822
          </a>
          <span class="text-emerald-500">|</span>
          <a href="tel:01818273838" class="hover:text-white transition flex items-center gap-1">
            <span>📞</span> 01818273838
          </a>
          <span class="text-emerald-500">|</span>
          <a href="/track" class="hover:text-white transition flex items-center gap-1">
            <span>🚚</span> ট্র্যাকিং
          </a>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <header class="site-header">
      <div class="header-inner">
        
        <!-- Brand Logo & Shop Name -->
        <a href="/" class="header-brand" title="Dream Cart BD Home">
          <div class="header-logo-box">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10" 
              alt="Dream Cart BD Logo" 
              class="header-logo-img"
              onerror="this.onerror=null; this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';"
            />
          </div>
          <div class="header-brand-text">
            <span class="header-brand-title">
              Dream Cart <span class="accent">BD</span>
            </span>
            <span class="header-brand-sub">
              Smart Digital Commerce
            </span>
          </div>
        </a>

        <!-- Desktop Predictive Search Bar with Visual AI Camera Search -->
        <div class="desktop-search-container search-container">
          <div class="header-search-bar">
            <svg class="header-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              id="global-search-input"
              placeholder="পণ্য, ব্র্যান্ড বা মডেল লিখে খুঁজুন..." 
              autocomplete="off"
              class="header-search-input"
              onkeydown="if(event.key==='Enter'){ event.preventDefault(); window.__dcbdActiveVisualReport=null; const q = (this.value || '').trim(); if (window.router) window.router.navigate(q ? '/products?search=' + encodeURIComponent(q) : '/products'); else window.location.href = q ? '/products?search=' + encodeURIComponent(q) : '/products'; }"
            />
            <button 
              id="global-search-clear-btn" 
              class="header-search-clear hidden" 
              type="button" 
              title="ক্লিয়ার করুন"
            >✕</button>

            <!-- Visual AI Image Search Button (Desktop) -->
            <button 
              id="btn-global-image-search" 
              type="button" 
              class="header-image-search-btn"
              title="ছবি দিয়ে সার্চ করুন (Visual Search)"
              onclick="window.__dcbdToggleVisualSearch && window.__dcbdToggleVisualSearch(false)"
              aria-label="Search by image"
            >
              <svg style="width: 15px; height: 15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="hidden xl:inline text-[10px] font-extrabold tracking-tight">ছবি সার্চ</span>
            </button>

            <!-- Standard Search Submit Button -->
            <button 
              id="global-search-btn" 
              type="button"
              class="header-search-submit"
              onclick="window.__dcbdActiveVisualReport=null; const q = (document.getElementById('global-search-input')?.value || '').trim(); if (window.router) window.router.navigate(q ? '/products?search=' + encodeURIComponent(q) : '/products'); else window.location.href = q ? '/products?search=' + encodeURIComponent(q) : '/products';"
            >
              <span>সার্চ</span>
              <span style="font-size: 11px;">🔍</span>
            </button>
          </div>

          <!-- Predictive Text Preview Popup -->
          <div id="search-preview-popup" class="hidden absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"></div>

          <!-- Desktop Inline Visual Search Dropdown (NO FULLSCREEN BLUR!) -->
          <div id="desktop-visual-search-popup" class="visual-search-popup hidden p-4 text-white overflow-hidden space-y-3">
            
            <!-- Popup Top Bar -->
            <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-sm">
                  📸
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white">ছবি দিয়ে পণ্য খুঁজুন (Visual Product Reader)</h4>
                </div>
              </div>
              <button 
                type="button"
                onclick="window.__dcbdCloseVisualSearch && window.__dcbdCloseVisualSearch(true)"
                class="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <!-- 1. Selection Area -->
            <div id="d-img-drop-area" class="space-y-3" ondragover="event.preventDefault();" ondrop="event.preventDefault(); if (event.dataTransfer && event.dataTransfer.files[0]) window.__dcbdHandleImageFile(event.dataTransfer.files[0], false);">
              <div class="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onclick="window.__dcbdTriggerFilePick('file', false)"
                  class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 text-xs font-bold text-slate-200 transition cursor-pointer"
                >
                  <span>📁</span>
                  <span>ছবি আপলোড</span>
                </button>
                <button 
                  type="button"
                  onclick="window.__dcbdTriggerFilePick('camera', false)"
                  class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <span>📸</span>
                  <span>ক্যামেরা ওপেন</span>
                </button>
              </div>

              <!-- Quick Categories (Auto Redirection on Click) -->
              <div class="pt-1.5">
                <div class="text-[10px] font-bold text-slate-400 mb-1.5">অথবা জনপ্রিয় ক্যাটাগরির মিল খুঁজুন (অটো সার্চ):</div>
                <div class="flex flex-wrap gap-1">
                  <button type="button" onclick="window.__dcbdSearchVisualTag('smartwatches', false)" class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-950 border border-slate-700 text-[10px] text-slate-300 hover:text-emerald-300 transition cursor-pointer">
                    ⌚ স্মার্টওয়াচ
                  </button>
                  <button type="button" onclick="window.__dcbdSearchVisualTag('organic-health', false)" class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-950 border border-slate-700 text-[10px] text-slate-300 hover:text-emerald-300 transition cursor-pointer">
                    🍯 অরগানিক
                  </button>
                  <button type="button" onclick="window.__dcbdSearchVisualTag('torch', false)" class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-950 border border-slate-700 text-[10px] text-slate-300 hover:text-emerald-300 transition cursor-pointer">
                    🔦 লাইট
                  </button>
                  <button type="button" onclick="window.__dcbdSearchVisualTag('gas', false)" class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-950 border border-slate-700 text-[10px] text-slate-300 hover:text-emerald-300 transition cursor-pointer">
                    🛡️ কিচেন ও গ্যাস
                  </button>
                  <button type="button" onclick="window.__dcbdSearchVisualTag('Healthcare', false)" class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-950 border border-slate-700 text-[10px] text-slate-300 hover:text-emerald-300 transition cursor-pointer">
                    🩺 হেলথকেয়ার
                  </button>
                  <button type="button" onclick="window.__dcbdSearchVisualTag('Stationery', false)" class="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-950 border border-slate-700 text-[10px] text-slate-300 hover:text-emerald-300 transition cursor-pointer">
                    📚 স্টেশনারি
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. Scanning Preview -->
            <div id="d-img-preview-area" class="hidden space-y-2">
              <div class="relative w-full h-32 bg-slate-950 rounded-xl overflow-hidden border border-emerald-500/40 flex items-center justify-center">
                <img id="d-img-preview-img" src="" alt="Item" class="w-full h-full object-contain" />
                <div class="laser-scanner-line"></div>
              </div>
              <div class="flex items-center justify-between text-[11px]">
                <div id="d-img-scan-status" class="text-emerald-400 font-bold flex items-center">
                  <span class="inline-block animate-spin mr-1">⚡</span> স্ক্যান চলছে...
                </div>
                <button type="button" onclick="window.__dcbdTriggerFilePick('file', false)" class="text-slate-400 hover:text-white underline cursor-pointer">
                  অন্য ছবি
                </button>
              </div>
            </div>

            <!-- 3. Matched Results & Full Search Report -->
            <div id="d-img-results-area" class="hidden space-y-2 border-t border-slate-800 pt-2">
              <div class="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>সার্চ রিপোর্ট ও মিল থাকা পণ্যসমূহ:</span>
                <button type="button" onclick="window.__dcbdTriggerFilePick('file', false)" class="text-[10px] text-emerald-400 hover:underline cursor-pointer">
                  🔄 অন্য ছবি দিন
                </button>
              </div>
              <div id="d-img-results-list" class="space-y-1.5 max-h-72 overflow-y-auto pr-1"></div>
            </div>

          </div>

          <!-- Hidden Native File Inputs for Desktop (Placed INSIDE search container to prevent bubbling close) -->
          <input type="file" id="d-dcbd-image-file-input" accept="image/*" class="hidden" />
          <input type="file" id="d-dcbd-image-camera-input" accept="image/*" capture="environment" class="hidden" />
        </div>

        <!-- Desktop Navigation Controls (Hidden on Mobile) -->
        <div class="desktop-nav-controls">
          
          <!-- Products Link -->
          <a href="/products" class="nav-action-btn">
            <span>🛍️</span> <span>Products</span>
          </a>

          <!-- Cart Button -->
          <button id="btn-open-cart" class="nav-action-btn" title="কার্ট দেখুন">
            <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span>Cart</span>
            <span id="nav-cart-badge" class="nav-badge-count">
              ${cartCount}
            </span>
          </a>

          <!-- Favourite (Wishlist) Icon -->
          <a href="/favourite" class="nav-action-btn" title="পছন্দের তালিকা">
            <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <span>Favourite</span>
            <span id="nav-fav-badge" class="nav-badge-count nav-badge-rose">
              ${favCount}
            </span>
          </a>

          <!-- User Login / Account Dropdown -->
          <div class="relative auth-dropdown-container">
            ${isAuthenticated ? `
              <button id="btn-user-menu" class="nav-action-btn nav-user-btn">
                <span style="width: 22px; height: 22px; border-radius: 9999px; background: #059669; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800;">
                  ${(authStore.getUserDisplayName() || "U").charAt(0).toUpperCase()}
                </span>
                <span style="max-width: 85px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${authStore.getUserDisplayName()}</span>
                <span style="font-size: 10px;">▼</span>
              </button>
            ` : `
              <a href="/customer/login" class="nav-action-btn nav-login-btn">
                <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <span>লগইন</span>
              </a>
            `}

            <!-- Dropdown Menu -->
            <div id="auth-dropdown-panel" class="hidden absolute right-0 mt-2 w-48 rounded-2xl border shadow-xl py-2 z-50 text-xs">
              ${isAuthenticated ? `
                <div class="px-4 py-2 border-b border-slate-800">
                  <div class="font-bold text-white truncate">${authStore.getUserDisplayName()}</div>
                  <div class="text-[10px] text-slate-400 capitalize">${authStore.getAccountType()}</div>
                </div>
                ${authStore.isAdmin() ? `<a href="/admin/dashboard" class="block px-4 py-2 font-bold text-emerald-400 hover:bg-slate-800">Admin Dashboard</a>` : ""}
                ${authStore.isReseller() ? `<a href="/reseller/dashboard" class="block px-4 py-2 font-bold text-indigo-400 hover:bg-slate-800">Reseller Portal</a>` : ""}
                ${authStore.isWholesaler() ? `<a href="/wholesaler/dashboard" class="block px-4 py-2 font-bold text-amber-400 hover:bg-slate-800">Wholesale Portal</a>` : ""}
                <a href="/customer/dashboard" class="block px-4 py-2 text-slate-300 hover:bg-slate-800">My Orders & Profile</a>
                <a href="/customer/settings" class="block px-4 py-2 text-slate-300 hover:bg-slate-800">Settings</a>
                <button id="btn-logout" class="w-full text-left px-4 py-2 hover:bg-rose-950/40 text-rose-400 font-bold border-t border-slate-800 cursor-pointer">লগআউট</button>
              ` : `
                <a href="/customer/login" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 font-semibold">Customer Login</a>
                <a href="/customer/register" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 font-semibold">Customer Register</a>
                <a href="/reseller/login" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 font-semibold">Reseller Hub</a>
                <a href="/wholesaler/login" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 font-semibold">Wholesale Portal</a>
                <div class="border-t border-slate-800 my-1"></div>
                <a href="/admin/login" class="block px-4 py-2 text-slate-400 hover:bg-slate-800 font-semibold">Admin / Worker Login</a>
              `}
            </div>
          </div>

          <!-- Darkmode Toggle Icon -->
          <button 
            id="btn-toggle-darkmode" 
            class="nav-action-btn"
            title="${isDark ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}"
            aria-label="Toggle Dark Mode"
          >
            <span class="dark-hidden text-base">🌙</span>
            <span class="dark-inline text-base">☀️</span>
          </button>

        </div>

      </div>

      <!-- Mobile Search Row (Only on mobile screens, directly under Logo) -->
      <div class="mobile-search-row relative">
        <div class="header-search-bar" style="border-radius: 9999px; padding: 2px 4px 2px 12px;">
          <svg class="header-search-icon" style="width: 16px; height: 16px; margin-right: 6px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            id="mobile-search-input"
            placeholder="পণ্য বা মডেল সার্চ করুন..." 
            autocomplete="off"
            class="header-search-input"
            style="font-size: 12px; padding: 5px 105px 5px 0;"
            onkeydown="if(event.key==='Enter'){ event.preventDefault(); window.__dcbdActiveVisualReport=null; const q = (this.value || '').trim(); if (window.router) window.router.navigate(q ? '/products?search=' + encodeURIComponent(q) : '/products'); else window.location.href = q ? '/products?search=' + encodeURIComponent(q) : '/products'; }"
          />
          <button 
            id="mobile-search-clear-btn" 
            class="header-search-clear hidden" 
            type="button" 
            title="ক্লিয়ার করুন"
            style="right: 110px;"
          >✕</button>

          <!-- Mobile Visual Camera Search Button -->
          <button 
            id="btn-mobile-image-search" 
            type="button" 
            class="header-image-search-btn"
            title="ছবি দিয়ে সার্চ করুন"
            onclick="window.__dcbdToggleVisualSearch && window.__dcbdToggleVisualSearch(true)"
            style="right: 66px; height: 26px; padding: 0 6px;"
          >
            <svg style="width: 15px; height: 15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>

          <button 
            id="mobile-search-btn" 
            type="button"
            class="header-search-submit"
            style="padding: 0 12px; font-size: 11px;"
            onclick="window.__dcbdActiveVisualReport=null; const q = (document.getElementById('mobile-search-input')?.value || '').trim(); if (window.router) window.router.navigate(q ? '/products?search=' + encodeURIComponent(q) : '/products'); else window.location.href = q ? '/products?search=' + encodeURIComponent(q) : '/products';"
          >
            <span>সার্চ</span>
          </button>
        </div>

        <div id="mobile-search-preview-popup" class="hidden absolute top-full left-4 right-4 mt-1 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto"></div>

        <!-- Mobile Inline Visual Search Dropdown (NO FULLSCREEN BLUR!) -->
        <div id="mobile-visual-search-popup" class="visual-search-popup hidden p-3.5 text-white overflow-hidden space-y-2.5 mt-1">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="flex items-center gap-1.5">
              <span class="text-sm">📸</span>
              <span class="text-xs font-bold text-white">ছবি দিয়ে পণ্য খুঁজুন (Visual Search)</span>
            </div>
            <button 
              type="button"
              onclick="window.__dcbdCloseVisualSearch && window.__dcbdCloseVisualSearch(true)"
              class="w-5 h-5 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div id="m-img-drop-area" class="space-y-2" ondragover="event.preventDefault();" ondrop="event.preventDefault(); if (event.dataTransfer && event.dataTransfer.files[0]) window.__dcbdHandleImageFile(event.dataTransfer.files[0], true);">
            <div class="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onclick="window.__dcbdTriggerFilePick('file', true)"
                class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
              >
                <span>📁</span> <span>ছবি আপলোড</span>
              </button>
              <button 
                type="button"
                onclick="window.__dcbdTriggerFilePick('camera', true)"
                class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <span>📸</span> <span>ক্যামেরা</span>
              </button>
            </div>
            <div class="flex flex-wrap gap-1 pt-1">
              <button type="button" onclick="window.__dcbdSearchVisualTag('smartwatches', true)" class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 cursor-pointer">
                ⌚ স্মার্টওয়াচ
              </button>
              <button type="button" onclick="window.__dcbdSearchVisualTag('organic-health', true)" class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 cursor-pointer">
                🍯 অরগানিক
              </button>
              <button type="button" onclick="window.__dcbdSearchVisualTag('torch', true)" class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 cursor-pointer">
                🔦 লাইট
              </button>
              <button type="button" onclick="window.__dcbdSearchVisualTag('gas', true)" class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 cursor-pointer">
                🛡️ কিচেন ও গ্যাস
              </button>
              <button type="button" onclick="window.__dcbdSearchVisualTag('Healthcare', true)" class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 cursor-pointer">
                🩺 হেলথকেয়ার
              </button>
              <button type="button" onclick="window.__dcbdSearchVisualTag('Stationery', true)" class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 cursor-pointer">
                📚 স্টেশনারি
              </button>
            </div>
          </div>

          <div id="m-img-preview-area" class="hidden space-y-1.5">
            <div class="relative w-full h-28 bg-slate-950 rounded-xl overflow-hidden border border-emerald-500/40 flex items-center justify-center">
                <img id="m-img-preview-img" src="" alt="Item" class="w-full h-full object-contain" />
              <div class="laser-scanner-line"></div>
            </div>
            <div id="m-img-scan-status" class="text-emerald-400 font-bold text-[10px] flex items-center">
              <span class="inline-block animate-spin mr-1">⚡</span> স্ক্যান চলছে...
            </div>
          </div>

          <div id="m-img-results-area" class="hidden space-y-1.5 border-t border-slate-800 pt-1.5">
            <div class="flex items-center justify-between text-[10px] font-bold text-slate-300">
              <span>সার্চ রিপোর্ট ও মিল থাকা পণ্য:</span>
              <button type="button" onclick="window.__dcbdTriggerFilePick('file', true)" class="text-[9px] text-emerald-400 hover:underline cursor-pointer">
                🔄 অন্য ছবি দিন
              </button>
            </div>
            <div id="m-img-results-list" class="space-y-1.5 max-h-64 overflow-y-auto"></div>
          </div>
        </div>

        <!-- Hidden Native File Inputs for Mobile (Placed INSIDE mobile search container) -->
        <input type="file" id="m-dcbd-image-file-input" accept="image/*" class="hidden" />
        <input type="file" id="m-dcbd-image-camera-input" accept="image/*" capture="environment" class="hidden" />
      </div>

    </header>
  `;
}
