/**
 * DREAM CART BD — MAIN NAVIGATION BAR WITH SHEET PRODUCT IMAGE MATCHER & SEARCH REPORT (Header.js)
 * High-performance, pixel-perfect header component:
 * - Desktop: Notice bar, compact crisp logo (42px), wide predictive search bar with inline Visual AI Camera Search, nav actions, auth menu, dark mode.
 * - Mobile: Sleek native app bar with compact logo (36px) & dedicated search bar with Camera Search button.
 * - Sheet Product Image Matcher:
 *     1. Syncs 100% of products loaded from Google Sheets (apiClient.loadProductsFromSheet).
 *     2. Extracts Dual-Resolution Visual Fingerprints (64x64 Foreground-Masked 16x16 RGB Grid + Auto-Cropped 12x12 Foreground Object RGB Grid + 144-Cell Normalized Luminance Structure Vector + 32-Bin Foreground HSV Histogram) for every product image in the store.
 *     3. Accurately matches the uploaded product image against store product images, calculates the exact Match Percentage (%), searches that exact product's name below on /products, and displays the match percentage both in the search bar report and on the search results page.
 * - Ultra-high Stacking Context (z-index: 999999): Never goes under sliders, product cards, or sticky sidebars.
 * - ZERO Full-Screen Blur: No annoying screen blur overlays.
 */

import { cartStore } from '../store/cartStore.js';
import { favouriteStore } from '../store/favouriteStore.js';
import { authStore } from '../store/authStore.js';
import { apiClient } from '../api/client.js';
import { formatCurrency } from '../utils/format.js';
import { SearchService } from '../services/SearchService.js';

// Core Platform Fallback Products (Used ONLY if Google Sheet is completely unreachable/empty)
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

// Global Visual Search Controller (Module singleton attached to window)
if (typeof window !== 'undefined' && !window.__dcbdVisualSearchInit) {
  window.__dcbdVisualSearchInit = true;
  window.__dcbdFilePickingActive = false;
  window.__dcbdLastFileActionTime = 0;
  window.__dcbdProductFingerprints = new Map();
  window.__dcbdActiveVisualReport = null;

  // =========================================================================
  // PATCH SearchService so multi-word product names with numbers NEVER return 0
  // and so active Visual Search reports show the exact matched product(s) below!
  // =========================================================================
  const origCalculateRelevance = SearchService.calculateRelevance;
  const origSearch = SearchService.search;

  SearchService.calculateRelevance = function(product, query) {
    if (!product || !query) return 0;
    const rawScore = origCalculateRelevance ? origCalculateRelevance(product, query) : 0;
    if (rawScore > 0) return rawScore;

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

    // When an Image Search is active, return the exact visually matched product(s) from the Sheet!
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
        const k1 = String(p.sku || '').trim().toLowerCase();
        const k2 = String(p.product_id || '').trim().toLowerCase();
        const k3 = String(p.slug || '').trim().toLowerCase();
        const k4 = String(p.name || p.p_name || '').trim().toLowerCase();
        if (k1) byKey.set(k1, p);
        if (k2) byKey.set(k2, p);
        if (k3) byKey.set(k3, p);
        if (k4) byKey.set(k4, p);
      });

      const resolveRealProduct = (vp) => {
        return (
          byKey.get(String(vp.sku || '').trim().toLowerCase()) ||
          byKey.get(String(vp.product_id || '').trim().toLowerCase()) ||
          byKey.get(String(vp.slug || '').trim().toLowerCase()) ||
          byKey.get(String(vp.name || vp.p_name || '').trim().toLowerCase()) ||
          vp
        );
      };

      const directMatches = [];
      const relatedProducts = [];
      const usedKeys = new Set();

      (activeReport.directMatches || []).forEach((vp, idx) => {
        const realProd = resolveRealProduct(vp);
        const uKey = String(realProd.sku || realProd.product_id || realProd.slug || realProd.name || idx).toLowerCase();
        if (!usedKeys.has(uKey)) {
          usedKeys.add(uKey);
          directMatches.push({
            ...realProd,
            _matchConfidence: vp._matchConfidence || activeReport.confidence,
            _searchScore: 1500 - idx * 50,
            _isDirectMatch: true
          });
        }
      });

      (activeReport.relatedProducts || []).forEach((vp, idx) => {
        const realProd = resolveRealProduct(vp);
        const uKey = String(realProd.sku || realProd.product_id || realProd.slug || realProd.name || idx).toLowerCase();
        if (!usedKeys.has(uKey)) {
          usedKeys.add(uKey);
          relatedProducts.push({
            ...realProd,
            _matchConfidence: vp._matchConfidence || 0,
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

    const res = origSearch ? origSearch(allProducts, query, options) : { directMatches: [], relatedProducts: [], allResults: [], query: qTrim, totalCount: 0 };
    if (res.totalCount > 0 || !qTrim) return res;

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
  // 1. LIVE GOOGLE SHEETS CATALOG LOADER
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

    const isOnlyPlaceholder =
      allProds.length === 0 ||
      (allProds.length === 1 && String(allProds[0].sku || '') === 'DCBD-SM-001');

    if (isOnlyPlaceholder) {
      try {
        const fetched = await apiClient.loadProductsFromSheet(true);
        if (Array.isArray(fetched) && fetched.length > 0) {
          allProds = [...fetched];
        }
      } catch (e) {}
    }

    allProds = allProds.filter(p => {
      const name = String(p.name || p.p_name || '').trim().toLowerCase();
      return name && name !== 'test id';
    });

    if (allProds.length > 1 || (allProds.length === 1 && String(allProds[0].sku) !== 'DCBD-SM-001')) {
      return allProds;
    }

    return [...CORE_VISUAL_PRODUCTS];
  };

  // Normalize image URLs (supports Google Drive share/view/thumbnail links, etc.)
  function normalizeProductImageUrl(rawUrl) {
    if (!rawUrl) return '';
    let u = String(rawUrl).trim();
    if (!u) return '';
    if (u.startsWith('//')) u = 'https:' + u;
    // Discard invalid strings, relative fragments (like h_500), or non-web protocols
    if (!/^https?:\/\//i.test(u) && !u.startsWith('data:') && !u.startsWith('blob:')) {
      return '';
    }
    const driveMatch =
      u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=|thumbnail\?id=)([a-zA-Z0-9_-]{15,})/) ||
      u.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,})/);
    if (driveMatch && driveMatch[1]) {
      return 'https://drive.google.com/thumbnail?id=' + driveMatch[1] + '&sz=w400';
    }
    return u;
  }

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
  // 2. HIGH-PRECISION DUAL-RESOLUTION VISUAL FINGERPRINT EXTRACTOR (64x64)
  //    - Foreground-Masked 16x16 Full-Frame RGB Grid (256 cells)
  //    - Auto-Cropped 12x12 Foreground Object RGB Grid (144 cells)
  //    - 144-Cell Mean/Std Normalized Luminance Structure Vector (normLums)
  //    - 32-Bin Foreground-Only HSV Color Histogram
  // =========================================================================
  function extractImageFingerprintFromElement(imgEl) {
    try {
      const SIZE = 64;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      const natW = imgEl.naturalWidth || imgEl.width || 64;
      const natH = imgEl.naturalHeight || imgEl.height || 64;

      ctx.drawImage(imgEl, 0, 0, SIZE, SIZE);
      const imgData = ctx.getImageData(0, 0, SIZE, SIZE).data;

      // 1. Estimate border background color from outer 2px perimeter
      let bgR = 0, bgG = 0, bgB = 0, bgCnt = 0;
      for (let i = 0; i < SIZE; i++) {
        for (let d = 0; d < 2; d++) {
          const t = (d * SIZE + i) * 4;
          const b = (((SIZE - 1 - d) * SIZE) + i) * 4;
          const l = (i * SIZE + d) * 4;
          const r = (i * SIZE + (SIZE - 1 - d)) * 4;
          bgR += imgData[t] + imgData[b] + imgData[l] + imgData[r];
          bgG += imgData[t + 1] + imgData[b + 1] + imgData[l + 1] + imgData[r + 1];
          bgB += imgData[t + 2] + imgData[b + 2] + imgData[l + 2] + imgData[r + 2];
          bgCnt += 4;
        }
      }
      bgR /= bgCnt; bgG /= bgCnt; bgB /= bgCnt;

      // 2. 16x16 Full-Frame Grid (256 cells x 3 RGB = 768 values) + Foreground Mask
      const fullGrid = new Float32Array(256 * 3);
      const fgMask = new Uint8Array(256);
      let fgCellCount = 0;

      for (let gy = 0; gy < 16; gy++) {
        for (let gx = 0; gx < 16; gx++) {
          let sr = 0, sg = 0, sb = 0;
          for (let py = gy * 4; py < (gy + 1) * 4; py++) {
            for (let px = gx * 4; px < (gx + 1) * 4; px++) {
              const idx = (py * SIZE + px) * 4;
              sr += imgData[idx];
              sg += imgData[idx + 1];
              sb += imgData[idx + 2];
            }
          }
          const mr = sr / 16, mg = sg / 16, mb = sb / 16;
          const cellIdx = gy * 16 + gx;
          fullGrid[cellIdx * 3] = mr;
          fullGrid[cellIdx * 3 + 1] = mg;
          fullGrid[cellIdx * 3 + 2] = mb;

          const distBg = Math.abs(mr - bgR) + Math.abs(mg - bgG) + Math.abs(mb - bgB);
          if (distBg > 26) {
            fgMask[cellIdx] = 1;
            fgCellCount++;
          }
        }
      }

      // If image has no uniform background (full-bleed photo), mark center cells as foreground
      if (fgCellCount < 16) {
        for (let gy = 2; gy < 14; gy++) {
          for (let gx = 2; gx < 14; gx++) {
            fgMask[gy * 16 + gx] = 1;
          }
        }
      }

      // 3. Find tight Foreground Bounding Box [minX, minY, maxX, maxY] on 64x64
      let minX = SIZE, minY = SIZE, maxX = 0, maxY = 0, fgPixelCount = 0;
      for (let py = 1; py < SIZE - 1; py++) {
        for (let px = 1; px < SIZE - 1; px++) {
          const idx = (py * SIZE + px) * 4;
          const dist = Math.abs(imgData[idx] - bgR) + Math.abs(imgData[idx + 1] - bgG) + Math.abs(imgData[idx + 2] - bgB);
          if (dist > 28 && imgData[idx + 3] > 40) {
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
            fgPixelCount++;
          }
        }
      }

      if (fgPixelCount < 60 || (maxX - minX) < 10 || (maxY - minY) < 10) {
        minX = 4; minY = 4; maxX = SIZE - 5; maxY = SIZE - 5;
      } else {
        minX = Math.max(0, minX - 1);
        minY = Math.max(0, minY - 1);
        maxX = Math.min(SIZE - 1, maxX + 1);
        maxY = Math.min(SIZE - 1, maxY + 1);
      }

      const cropW = Math.max(1, maxX - minX + 1);
      const cropH = Math.max(1, maxY - minY + 1);

      // 4. 12x12 Cropped Foreground Object Grid (144 cells) & Normalized Luminance Vector
      const fgGrid = new Float32Array(144 * 3);
      const rawLums = new Float32Array(144);
      let lumSum = 0;

      for (let gy = 0; gy < 12; gy++) {
        for (let gx = 0; gx < 12; gx++) {
          const y0 = minY + Math.floor((gy * cropH) / 12);
          const y1 = Math.max(y0 + 1, minY + Math.floor(((gy + 1) * cropH) / 12));
          const x0 = minX + Math.floor((gx * cropW) / 12);
          const x1 = Math.max(x0 + 1, minX + Math.floor(((gx + 1) * cropW) / 12));
          let sr = 0, sg = 0, sb = 0, cnt = 0;
          for (let py = y0; py < y1 && py < SIZE; py++) {
            for (let px = x0; px < x1 && px < SIZE; px++) {
              const idx = (py * SIZE + px) * 4;
              sr += imgData[idx];
              sg += imgData[idx + 1];
              sb += imgData[idx + 2];
              cnt++;
            }
          }
          cnt = cnt || 1;
          const mr = sr / cnt, mg = sg / cnt, mb = sb / cnt;
          const cIdx = gy * 12 + gx;
          fgGrid[cIdx * 3] = mr;
          fgGrid[cIdx * 3 + 1] = mg;
          fgGrid[cIdx * 3 + 2] = mb;

          const lum = 0.299 * mr + 0.587 * mg + 0.114 * mb;
          rawLums[cIdx] = lum;
          lumSum += lum;
        }
      }

      const meanLum = lumSum / 144;
      let lumVar = 0;
      for (let i = 0; i < 144; i++) {
        const d = rawLums[i] - meanLum;
        lumVar += d * d;
      }
      const stdLum = Math.max(1.5, Math.sqrt(lumVar / 144));
      const normLums = new Float32Array(144);
      for (let i = 0; i < 144; i++) {
        normLums[i] = (rawLums[i] - meanLum) / stdLum;
      }

      // 5. 32-Bin Foreground-Only HSV Color Histogram (16 Hue + 8 Sat + 8 Val)
      const hist = new Float32Array(32);
      let histWeight = 0;
      let amberGold = 0, greenHerbal = 0, redOrange = 0, blueCyan = 0, purplePink = 0;
      let darkMetallic = 0, whiteClean = 0, brownWarm = 0;

      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          const idx = (py * SIZE + px) * 4;
          const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2], a = imgData[idx + 3];
          if (a < 40) continue;

          const distBg = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          const isCore = (px >= minX + cropW * 0.2 && px <= maxX - cropW * 0.2 && py >= minY + cropH * 0.2 && py <= maxY - cropH * 0.2);
          if (distBg < 24 && !isCore) continue;

          const w = isCore ? 2.0 : 1.0;
          histWeight += w;

          const { h, s, v } = rgbToHsv(r, g, b);
          if (s > 0.12 && v > 0.12) {
            const hBin = Math.min(15, Math.floor((h / 360) * 16));
            hist[hBin] += w;
          }
          const sBin = 16 + Math.min(7, Math.floor(s * 8));
          const vBin = 24 + Math.min(7, Math.floor(v * 8));
          hist[sBin] += w;
          hist[vBin] += w;

          if (v > 0.78 && s < 0.16) whiteClean += w;
          else if (v < 0.28 || (s < 0.15 && v < 0.65)) darkMetallic += w;
          else if (h >= 18 && h <= 58 && s >= 0.22) {
            if (v < 0.55) brownWarm += w;
            else amberGold += w;
          } else if ((h >= 0 && h < 18) || h >= 340) redOrange += w;
          else if (h > 58 && h <= 165) greenHerbal += w;
          else if (h > 165 && h <= 255) blueCyan += w;
          else if (h > 255 && h < 340) purplePink += w;
        }
      }

      const hDenom = histWeight || 1;
      for (let i = 0; i < 32; i++) {
        hist[i] /= hDenom;
      }

      const toneScores = [
        { key: "black", score: darkMetallic / hDenom, label: "কালো / মেটালিক (Black / Metallic)" },
        { key: "amber", score: (amberGold + brownWarm * 0.8) / hDenom, label: "সোনালী / অ্যাম্বার (Golden / Amber)" },
        { key: "white", score: whiteClean / hDenom, label: "সাদা / ব্রাইট (White / Clean)" },
        { key: "red", score: redOrange / hDenom, label: "লাল / অরেঞ্জ (Red / Orange)" },
        { key: "green", score: greenHerbal / hDenom, label: "সবুজ / ন্যাচারাল (Green / Natural)" },
        { key: "blue", score: blueCyan / hDenom, label: "নীল / সায়ান (Blue / Cyan)" },
        { key: "pink", score: purplePink / hDenom, label: "গোলাপী / পার্পল (Pink / Purple)" }
      ].sort((a, b) => b.score - a.score);

      return {
        fullGrid,
        fgMask,
        fgGrid,
        normLums,
        hist,
        natW,
        natH,
        aspectRatio: natW / (natH || 1),
        dominantTone: toneScores[0]
      };
    } catch (err) {
      return null;
    }
  }

  // =========================================================================
  // 3. FAST SEQUENTIAL-FALLBACK CORS IMAGE LOADER (1.5KB 64x64 Edge Thumbnails)
  // =========================================================================
  function loadImageWithCorsFallback(rawUrl, timeoutMs = 4000) {
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

      // Local data: or blob: URL loads immediately
      if (url.startsWith('data:') || url.startsWith('blob:')) {
        const dImg = new Image();
        dImg.onload = () => { clearTimeout(timer); done(dImg); };
        dImg.onerror = () => { clearTimeout(timer); done(null); };
        dImg.src = url;
        return;
      }

      // Step 4 fallback: codetabs / allorigins
      const tryBackupProxy2 = () => {
        const pImg2 = new Image();
        pImg2.crossOrigin = 'anonymous';
        pImg2.onload = () => {
          clearTimeout(timer);
          done(canReadPixels(pImg2) ? pImg2 : null);
        };
        pImg2.onerror = () => {
          clearTimeout(timer);
          done(null);
        };
        pImg2.src = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
      };

      // Step 3 fallback: corsproxy.io
      const tryBackupProxy1 = () => {
        const pImg1 = new Image();
        pImg1.crossOrigin = 'anonymous';
        pImg1.onload = () => {
          if (canReadPixels(pImg1)) {
            clearTimeout(timer);
            done(pImg1);
          } else {
            tryBackupProxy2();
          }
        };
        pImg1.onerror = tryBackupProxy2;
        pImg1.src = 'https://corsproxy.io/?' + encodeURIComponent(url);
      };

      // Step 2 fallback: Direct image with crossOrigin="anonymous"
      const tryDirect = () => {
        const directImg = new Image();
        directImg.crossOrigin = 'anonymous';
        directImg.onload = () => {
          if (canReadPixels(directImg)) {
            clearTimeout(timer);
            done(directImg);
          } else {
            tryBackupProxy1();
          }
        };
        directImg.onerror = tryBackupProxy1;
        directImg.src = url;
      };

      // Step 1 Primary: wsrv.nl 128px edge thumbnail (preserves exact aspect ratio, ~2KB, HTTP/2 multiplexed, CORS enabled!)
      const wsrvImg = new Image();
      wsrvImg.crossOrigin = 'anonymous';
      wsrvImg.onload = () => {
        if (canReadPixels(wsrvImg)) {
          clearTimeout(timer);
          done(wsrvImg);
        } else {
          tryDirect();
        }
      };
      wsrvImg.onerror = tryDirect;
      wsrvImg.src = 'https://wsrv.nl/?url=' + encodeURIComponent(url) + '&w=128&output=jpg';
    });
  }

  // Compute and cache visual fingerprints for a product (supports up to 3 images per product)
  async function getProductFingerprintsList(product) {
    const key = String(product.sku || product.product_id || product.slug || product.name || '');
    if (window.__dcbdProductFingerprints.has(key)) {
      return window.__dcbdProductFingerprints.get(key);
    }

    const rawUrls = [
      product.thumbnail,
      ...(Array.isArray(product.images) ? product.images.slice(0, 3) : [])
    ].filter(Boolean);
    const uniqueUrls = Array.from(new Set(rawUrls.map(normalizeProductImageUrl).filter(Boolean))).slice(0, 3);
    if (uniqueUrls.length === 0) return [];

    const fps = [];
    for (const u of uniqueUrls) {
      const imgEl = await loadImageWithCorsFallback(u, 3800);
      if (imgEl) {
        const fp = extractImageFingerprintFromElement(imgEl);
        if (fp) fps.push(fp);
      }
    }

    if (fps.length > 0) {
      window.__dcbdProductFingerprints.set(key, fps);
    }
    return fps;
  }

  // =========================================================================
  // 4. FOREGROUND-MASKED & AUTO-CROPPED SIMILARITY COMPARATOR (0% to 100%)
  // =========================================================================
  function compareFingerprints(fpA, fpB) {
    if (!fpA || !fpB) return 0;

    // 1. Foreground-Masked 16x16 Full-Frame RGB Grid Similarity (Ignores shared empty background!)
    let fullDiffSum = 0;
    let unionCells = 0;
    for (let i = 0; i < 256; i++) {
      if (fpA.fgMask[i] || fpB.fgMask[i]) {
        const base = i * 3;
        const dr = Math.abs(fpA.fullGrid[base] - fpB.fullGrid[base]);
        const dg = Math.abs(fpA.fullGrid[base + 1] - fpB.fullGrid[base + 1]);
        const db = Math.abs(fpA.fullGrid[base + 2] - fpB.fullGrid[base + 2]);
        fullDiffSum += (dr + dg + db) / 3;
        unionCells++;
      }
    }
    if (unionCells < 8) {
      for (let i = 0; i < 256; i++) {
        const base = i * 3;
        fullDiffSum += (Math.abs(fpA.fullGrid[base] - fpB.fullGrid[base]) + Math.abs(fpA.fullGrid[base + 1] - fpB.fullGrid[base + 1]) + Math.abs(fpA.fullGrid[base + 2] - fpB.fullGrid[base + 2])) / 3;
      }
      unionCells = 256;
    }
    const avgFullDiff = fullDiffSum / unionCells;
    const fullGridSim = Math.max(0, (1 - avgFullDiff / 75) * 100);

    // 2. Auto-Cropped 12x12 Foreground Object RGB Grid Similarity (144 cells)
    let fgDiffSum = 0;
    for (let i = 0; i < 144; i++) {
      const base = i * 3;
      const dr = Math.abs(fpA.fgGrid[base] - fpB.fgGrid[base]);
      const dg = Math.abs(fpA.fgGrid[base + 1] - fpB.fgGrid[base + 1]);
      const db = Math.abs(fpA.fgGrid[base + 2] - fpB.fgGrid[base + 2]);
      fgDiffSum += (dr + dg + db) / 3;
    }
    const avgFgDiff = fgDiffSum / 144;
    const fgGridSim = Math.max(0, (1 - avgFgDiff / 75) * 100);

    // 3. Normalized Luminance Structure Cosine Correlation (-1 to +1 -> 0 to 100)
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < 144; i++) {
      const a = fpA.normLums[i];
      const b = fpB.normLums[i];
      dot += a * b;
      normA += a * a;
      normB += b * b;
    }
    const denom = Math.sqrt(normA * normB) + 1e-6;
    const corr = dot / denom;
    const structSim = Math.max(0, corr * 100);

    // 4. Foreground-Only 32-Bin HSV Histogram Intersection (0 to 100)
    let histInter = 0, histSumA = 0;
    for (let i = 0; i < 32; i++) {
      histInter += Math.min(fpA.hist[i], fpB.hist[i]);
      histSumA += fpA.hist[i];
    }
    const rawHistRatio = histSumA > 0 ? (histInter / histSumA) : 0;
    const histSim = Math.max(0, ((rawHistRatio - 0.20) / 0.80) * 100);

    // Combine metrics:
    const bestGridSim = Math.max(fullGridSim, fgGridSim);
    let score = bestGridSim * 0.45 + structSim * 0.35 + histSim * 0.20;

    // If pixel grids and structure both match strongly (same product image!), reflect true high match %
    if (bestGridSim >= 85 && structSim >= 80) {
      score = Math.max(score, bestGridSim * 0.75 + structSim * 0.25);
    }
    if (avgFullDiff < 10 || avgFgDiff < 10) {
      score = Math.max(score, 96 + (10 - Math.min(avgFullDiff, avgFgDiff)) * 0.35);
    }

    return Math.min(99, Math.max(0, Math.round(score)));
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
  // 5. MASTER SHEET PRODUCT IMAGE MATCHER
  // =========================================================================
  window.__dcbdAnalyzeProductImage = async function(dataUrl, fileName, explicitCategory = '', onProgress = null) {
    const allProds = await window.__dcbdGetStoreCatalog();

    // 1. Load uploaded image & extract its 64x64 Dual-Resolution Fingerprint
    const uploadedImgEl = await loadImageWithCorsFallback(dataUrl, 3000);
    const userFp = uploadedImgEl ? extractImageFingerprintFromElement(uploadedImgEl) : null;

    // 2. Fingerprint ALL products from the Sheet in fast parallel batches (No 60-product cap!)
    const totalProds = allProds.length;
    const batchSize = 10;
    for (let i = 0; i < totalProds; i += batchSize) {
      if (typeof onProgress === 'function') {
        onProgress(Math.min(totalProds, i + batchSize), totalProds);
      }
      const chunk = allProds.slice(i, i + batchSize);
      await Promise.all(chunk.map(p => getProductFingerprintsList(p).catch(() => [])));
    }

    // 3. Check if filename matches a specific product's image URL or product name
    const rawFileClean = String(fileName || '')
      .replace(/\.[a-zA-Z0-9]{2,5}$/, '')
      .replace(/\s*\(\d+\)\s*$/, '')
      .trim()
      .toLowerCase();
    const fileTokens = extractMeaningfulFileTokens(fileName);
    const cleanFilePhrase = fileTokens.join(' ');

    // 4. Score EVERY product in the Sheet against the uploaded image
    const scoredProducts = allProds.map(p => {
      const key = String(p.sku || p.product_id || p.slug || p.name || '');
      const prodFps = window.__dcbdProductFingerprints.get(key) || [];

      // (A) Pure Image-to-Image Visual Similarity across all images of this product (0-99%)
      let visualScore = 0;
      if (userFp && prodFps.length > 0) {
        for (const pfp of prodFps) {
          const sim = compareFingerprints(userFp, pfp);
          if (sim > visualScore) visualScore = sim;
        }
      }

      // (B) Exact Image Asset Filename or Product Name Match in Filename
      let fileMatchScore = 0;
      const prodImgUrls = [p.thumbnail, ...(Array.isArray(p.images) ? p.images : [])].filter(Boolean).join(' ').toLowerCase();
      if (rawFileClean.length >= 5 && !GENERIC_FILE_TOKENS.has(rawFileClean) && prodImgUrls.includes(rawFileClean)) {
        fileMatchScore = 99;
      } else if (cleanFilePhrase.length >= 3) {
        const rel = SearchService.calculateRelevance(p, cleanFilePhrase);
        if (rel >= 500) fileMatchScore = 92;
        else if (rel >= 200) fileMatchScore = 78;
      }

      const finalMatchPercent = Math.max(visualScore, fileMatchScore);

      return {
        product: p,
        visualScore,
        fileMatchScore,
        matchPercent: finalMatchPercent
      };
    });

    // Sort strictly by matchPercent descending (and visualScore as tie-breaker)
    scoredProducts.sort((a, b) => (b.matchPercent - a.matchPercent) || (b.visualScore - a.visualScore));

    const bestEntry = scoredProducts[0] || { product: allProds[0], matchPercent: 0, visualScore: 0 };
    const bestProduct = bestEntry.product;
    const confidence = bestEntry.matchPercent;

    // Build directMatches:
    // Put ONLY the matched product(s) in directMatches so a single uploaded product image
    // shows THAT exact product (and not unrelated products)!
    const directMatches = [];
    const relatedProducts = [];
    const seenIds = new Set();

    const topCategory = (bestProduct && bestProduct.category ? bestProduct.category : '').trim().toLowerCase();

    scoredProducts.forEach((entry, idx) => {
      const id = String(entry.product.sku || entry.product.product_id || entry.product.slug || entry.product.name || idx).toLowerCase();
      if (seenIds.has(id)) return;

      // Only include in directMatches if it is the #1 best match OR has a very close visual match (>= 78% and within 6% of best)
      if (idx === 0 || (entry.matchPercent >= 78 && entry.matchPercent >= confidence - 6)) {
        seenIds.add(id);
        directMatches.push({
          ...entry.product,
          _matchConfidence: entry.matchPercent,
          _isBestMatch: idx === 0,
          _isDirectMatch: true
        });
      } else {
        const pCat = (entry.product.category || '').trim().toLowerCase();
        if ((topCategory && pCat === topCategory) || relatedProducts.length < 4) {
          seenIds.add(id);
          relatedProducts.push({
            ...entry.product,
            _matchConfidence: entry.matchPercent,
            _isBestMatch: false,
            _isDirectMatch: false
          });
        }
      }
    });

    const matchedQuery = explicitCategory
      ? explicitCategory
      : (bestProduct ? (bestProduct.name || bestProduct.p_name || bestProduct.sku || '').trim() : '');

    const reportObj = {
      bestProduct,
      matchedQuery,
      matchedLabel: bestProduct ? (bestProduct.name || bestProduct.p_name || '') : '',
      confidence,
      uploadedDataUrl: dataUrl,
      detectedColorLabel: userFp && userFp.dominantTone ? userFp.dominantTone.label : 'অটো ডিটেক্টেড',
      directMatches,
      relatedProducts: relatedProducts.slice(0, 8),
      matchedProducts: [...directMatches, ...relatedProducts.slice(0, 4)],
      totalMatchedCount: directMatches.length
    };

    window.__dcbdActiveVisualReport = reportObj;
    return reportObj;
  };

  // =========================================================================
  // 6. INJECT VISUAL SEARCH REPORT BANNER & % MATCH BADGE ON /PRODUCTS PAGE
  // =========================================================================
  window.__dcbdInjectPageVisualReport = function(report) {
    if (!report || typeof document === 'undefined') return;
    let attempts = 0;

    const tryInject = () => {
      attempts++;
      const appContent = document.getElementById('app-content');
      if (!appContent) return;

      // Wait until router.resolve() has finished replacing the loading skeleton with ShopPage
      const hasProductGrid = appContent.querySelector('.product-grid') || appContent.querySelector('h1');
      if (!hasProductGrid && attempts < 30) {
        setTimeout(tryInject, 120);
        return;
      }

      const existing = document.getElementById('dcbd-page-visual-report-banner');
      if (existing) existing.remove();

      const bestProd = report.bestProduct;
      if (!bestProd) return;
      const topTarget = (bestProd.slug || bestProd.product_id || bestProd.sku || '').replace(/'/g, "\\'");
      const prodThumb = bestProd.thumbnail || (bestProd.images && bestProd.images[0]) || '';

      const bannerDiv = document.createElement('div');
      bannerDiv.id = 'dcbd-page-visual-report-banner';
      bannerDiv.style.cssText = 'background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); border: 1.5px solid rgba(16, 185, 129, 0.55); border-radius: 20px; padding: 16px 20px; margin-bottom: 20px; color: #ffffff; box-shadow: 0 12px 30px -8px rgba(5, 150, 105, 0.35);';
      bannerDiv.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              <div style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; border: 2px solid #34d399; background: #020617; position: relative;" title="আপনার দেওয়া ছবি">
                <img src="${report.uploadedDataUrl}" alt="Uploaded" style="width: 100%; height: 100%; object-fit: cover;" />
                <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(2,6,23,0.85); color: #6ee7b7; font-size: 8px; font-weight: 800; text-align: center; padding: 1px 0;">আপনার ছবি</span>
              </div>
              <span style="color: #34d399; font-size: 16px; font-weight: 900;">⇄</span>
              <div style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; border: 2px solid #fbbf24; background: #020617; position: relative;" title="শনাক্তকৃত পণ্য">
                <img src="${prodThumb}" alt="Matched" style="width: 100%; height: 100%; object-fit: cover;" />
                <span style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(2,6,23,0.85); color: #fde68a; font-size: 8px; font-weight: 800; text-align: center; padding: 1px 0;">${report.confidence}% মিল</span>
              </div>
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 5px;">
                <span style="background: #10b981; color: #022c22; font-size: 11px; font-weight: 900; padding: 2.5px 10px; border-radius: 9999px;">🎯 ছবির সাথে ${report.confidence}% মিলেছে</span>
                ${bestProd.category ? `<span style="background: rgba(255,255,255,0.12); color: #6ee7b7; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">📂 ${bestProd.category}</span>` : ''}
                ${bestProd.sku ? `<span style="background: rgba(255,255,255,0.1); color: #e2e8f0; font-size: 10px; font-family: monospace; padding: 2px 8px; border-radius: 9999px;">SKU: ${bestProd.sku}</span>` : ''}
              </div>
              <h3 style="font-size: 15px; font-weight: 900; color: #ffffff; margin: 0 0 3px 0; line-height: 1.3;">
                শনাক্তকৃত প্রোডাক্ট: ${bestProd.name || bestProd.p_name}
              </h3>
              <div style="font-size: 12px; color: #cbd5e1; display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
                <span>মূল্য: <strong style="color: #34d399; font-weight: 900;">${formatCurrency(bestProd.selling_price)}</strong></span>
                <span>•</span>
                <span>মিলের হার: <strong style="color: #fde68a; font-weight: 900;">${report.confidence}%</strong></span>
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

      // Also attach a visible "% মিল" badge onto the first matched product card in the grid
      const firstCardImgWrap = appContent.querySelector('.product-grid .dc-card-img-wrap, .product-grid .img-box');
      if (firstCardImgWrap && !firstCardImgWrap.querySelector('.dcbd-visual-match-pill')) {
        const pill = document.createElement('div');
        pill.className = 'dcbd-visual-match-pill';
        pill.style.cssText = 'position: absolute; bottom: 8px; left: 8px; z-index: 15; background: rgba(6, 78, 59, 0.92); color: #6ee7b7; border: 1px solid #34d399; font-size: 10px; font-weight: 900; padding: 3px 8px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.35); backdrop-filter: blur(4px);';
        pill.textContent = `🎯 ${report.confidence}% ছবির মিল`;
        firstCardImgWrap.appendChild(pill);
      }
    };

    setTimeout(tryInject, 100);
  };

  // Pre-warm all sheet product fingerprints in background after page load
  if (typeof setTimeout !== 'undefined') {
    setTimeout(async () => {
      try {
        const prods = await window.__dcbdGetStoreCatalog();
        for (let i = 0; i < prods.length; i += 8) {
          const slice = prods.slice(i, i + 8);
          await Promise.all(slice.map(p => getProductFingerprintsList(p).catch(() => [])));
        }
      } catch (e) {}
    }, 1500);
  }

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
        scanStatus.innerHTML = '<span class="inline-block animate-spin mr-1.5 text-emerald-400">⚡</span> ওয়েবসাইটের প্রোডাক্টগুলোর ছবির সাথে মিলানো হচ্ছে...';
      }

      if (popup) popup.classList.remove('hidden');

      setTimeout(() => {
        window.__dcbdProcessVisualMatch(file.name, e.target.result, '', isMobile);
      }, 250);
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

    // 1. Compare uploaded image against all Sheet products with live progress
    const report = await window.__dcbdAnalyzeProductImage(dataUrl, fileName, explicitCategory, (doneCount, totalCount) => {
      if (scanStatus) {
        scanStatus.innerHTML = `<span class="inline-block animate-spin mr-1.5 text-emerald-400">⚡</span> প্রোডাক্টের ছবির সাথে মিলানো হচ্ছে (${doneCount}/${totalCount})...`;
      }
    });

    const matchedQuery = report.matchedQuery || '';
    const bestProd = report.bestProduct;
    const directMatches = report.directMatches || [];

    // 2. Put the matched product's exact name into the search input
    const dInput = document.getElementById('global-search-input');
    const mInput = document.getElementById('mobile-search-input');
    const dClear = document.getElementById('global-search-clear-btn');
    const mClear = document.getElementById('mobile-search-clear-btn');
    if (dInput) dInput.value = matchedQuery;
    if (mInput) mInput.value = matchedQuery;
    if (dClear && matchedQuery) dClear.classList.remove('hidden');
    if (mClear && matchedQuery) mClear.classList.remove('hidden');

    // 3. Update Scan Status text with exact match percentage
    if (scanStatus) {
      scanStatus.innerHTML = `✅ ছবির সাথে <strong class="text-amber-300 mx-1">${report.confidence}%</strong> মিলেছে: <strong class="text-white ml-1">${bestProd ? (bestProd.name || bestProd.p_name) : ''}</strong>`;
    }

    // 4. Render Visual Search Report inside popup showing the matched product & exact % match
    if (resultsList) {
      const topTarget = bestProd ? (bestProd.slug || bestProd.product_id || bestProd.sku || '') : '';
      const safeQueryEscaped = matchedQuery.replace(/'/g, "\\'");
      const bestThumb = bestProd ? (bestProd.thumbnail || (bestProd.images && bestProd.images[0]) || '') : '';

      resultsList.innerHTML = `
        <!-- Visual Match Summary Card -->
        <div style="background: rgba(6, 78, 59, 0.4); border: 1.5px solid rgba(16, 185, 129, 0.6); border-radius: 14px; padding: 10px 12px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #6ee7b7; display: inline-flex; align-items: center; gap: 4px;">
              <span>🎯</span> <span>ছবি ম্যাচিং রিপোর্ট</span>
            </span>
            <span style="background: #10b981; color: #022c22; font-size: 11px; font-weight: 900; padding: 2px 9px; border-radius: 9999px;">
              ${report.confidence}% মিল পাওয়া গেছে
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
              <img src="${dataUrl}" alt="Uploaded" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1.5px solid #34d399;" title="আপনার দেওয়া ছবি" />
              <span style="color: #34d399; font-size: 13px; font-weight: 900;">⇄</span>
              <img src="${bestThumb}" alt="Matched" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1.5px solid #fbbf24;" title="মিলে যাওয়া প্রোডাক্ট" />
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-size: 12px; font-weight: 800; color: #ffffff; line-height: 1.3; margin-bottom: 2px;">
                ${bestProd ? (bestProd.name || bestProd.p_name) : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
                <span style="font-weight: 900; color: #34d399;">${bestProd ? formatCurrency(bestProd.selling_price) : ''}</span>
                <span style="color: #fde68a; font-weight: 800;">• ${report.confidence}% মিলেছে</span>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 5px; font-size: 10px; color: #cbd5e1;">
            ${bestProd && bestProd.category ? `<span style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51, 65, 85, 0.9); padding: 2px 7px; border-radius: 6px; color: #34d399; font-weight: 700;">📂 ${bestProd.category}</span>` : ''}
            ${bestProd && bestProd.sku ? `<span style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(51, 65, 85, 0.9); padding: 2px 7px; border-radius: 6px; font-family: monospace;">SKU: ${bestProd.sku}</span>` : ''}
          </div>
        </div>

        <!-- Matched Product Card(s) -->
        ${directMatches.map((p, idx) => {
          const productTarget = (p.slug || p.product_id || p.sku || "").replace(/'/g, "\\'");
          const thumbImg = p.thumbnail || (p.images && p.images[0]) || "";
          const pct = p._matchConfidence || report.confidence;
          return `
          <div 
            class="flex items-center gap-3 p-2.5 bg-slate-800/90 hover:bg-slate-750 border border-emerald-500/80 rounded-xl cursor-pointer transition hover:border-emerald-400 group"
            style="background: rgba(6, 78, 59, 0.28);"
            onclick="window.__dcbdCloseVisualSearch(true); if (window.router) window.router.navigate('/product/' + encodeURIComponent('${productTarget}')); else window.location.href='/product/' + encodeURIComponent('${productTarget}');"
          >
            <img 
              src="${thumbImg}" 
              alt="${p.name || p.p_name}" 
              class="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-slate-900 flex-shrink-0 group-hover:scale-105 transition"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span style="background: #10b981; color: #022c22; font-size: 9px; font-weight: 900; padding: 1px 6px; border-radius: 4px; flex-shrink: 0;">${pct}% মিল</span>
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

    // 5. Search the matched product's name below on the page (/products?search=...) and inject the % match banner!
    if (matchedQuery) {
      const targetUrl = '/products?search=' + encodeURIComponent(matchedQuery) + '&stock=all';
      if (window.router && typeof window.router.navigate === 'function') {
        window.router.navigate(targetUrl);
        window.__dcbdInjectPageVisualReport(report);
      }
    }
  };

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
                  <h4 class="text-xs font-bold text-white">ছবি দিয়ে পণ্য খুঁজুন (Sheet Product Image Matcher)</h4>
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
                <span>মিলে যাওয়া প্রোডাক্ট ও ম্যাচিং হার:</span>
                <button type="button" onclick="window.__dcbdTriggerFilePick('file', false)" class="text-[10px] text-emerald-400 hover:underline cursor-pointer">
                  🔄 অন্য ছবি দিন
                </button>
              </div>
              <div id="d-img-results-list" class="space-y-1.5 max-h-72 overflow-y-auto pr-1"></div>
            </div>

          </div>

          <!-- Hidden Native File Inputs for Desktop -->
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
          </button>

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
              <span>মিলে যাওয়া প্রোডাক্ট ও ম্যাচিং হার:</span>
              <button type="button" onclick="window.__dcbdTriggerFilePick('file', true)" class="text-[9px] text-emerald-400 hover:underline cursor-pointer">
                🔄 অন্য ছবি দিন
              </button>
            </div>
            <div id="m-img-results-list" class="space-y-1.5 max-h-64 overflow-y-auto"></div>
          </div>
        </div>

        <!-- Hidden Native File Inputs for Mobile -->
        <input type="file" id="m-dcbd-image-file-input" accept="image/*" class="hidden" />
        <input type="file" id="m-dcbd-image-camera-input" accept="image/*" capture="environment" class="hidden" />
      </div>

    </header>
  `;
}
