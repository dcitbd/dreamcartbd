/**
 * DREAM CART BD — ULTRA-FAST 3D BRANDS HUB PAGE (BrandPage.js)
 * Performance & Design Upgrades:
 * - Instant 0ms data read from apiClient.sheetBrands / apiClient.sheetProducts / SSR cache
 * - O(N) Single-Pass Brand & Product Count Aggregation (zero nested .filter() loops)
 * - CSS `content-visibility: auto` + `loading="lazy" decoding="async"` + zero-network SVG fallback
 * - Clean 3D Bento Brand Grid with instant live search & Light/Dark mode support
 */

import { apiClient } from '../../api/client.js';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const FALLBACK_BRAND_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='16' fill='%23ecfdf5'/%3E%3Cpath d='M32 14l14 6v11c0 9.5-6 17.6-14 20-8-2.4-14-10.5-14-20V20l14-6z' stroke='%23059669' stroke-width='3' fill='%23d1fae5'/%3E%3Cpath d='M26 32l4 4 8-8' stroke='%23059669' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

if (typeof window !== 'undefined' && !window.__dcbdFastBrandHandlersAttached) {
  window.__dcbdFastBrandHandlersAttached = true;

  window.filterBrandGrid = function (query) {
    const q = (query || '').toLowerCase().trim();
    let visible = 0;
    document.querySelectorAll('#brand-bento-grid .brand-3d-card').forEach(function (card) {
      const name = (card.getAttribute('data-brand-name') || '').toLowerCase();
      const id = (card.getAttribute('data-brand-id') || '').toLowerCase();
      if (!q || name.includes(q) || id.includes(q)) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });
    const emptyEl = document.getElementById('brand-grid-empty');
    if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
  };
}

export async function renderBrandPage() {
  let rawBrands = [];
  let products = [];

  try {
    const ssrCache = (typeof window !== 'undefined' && window.__DCBD_SSR_CACHE__) ? window.__DCBD_SSR_CACHE__ : null;
    const memBrands = (Array.isArray(apiClient.sheetBrands) && apiClient.sheetBrands.length > 0)
      ? apiClient.sheetBrands
      : (ssrCache && Array.isArray(ssrCache.brands) && ssrCache.brands.length > 0 ? ssrCache.brands : null);
    const memProds = (Array.isArray(apiClient.sheetProducts) && apiClient.sheetProducts.length > 0)
      ? apiClient.sheetProducts
      : (ssrCache && Array.isArray(ssrCache.products) && ssrCache.products.length > 0 ? ssrCache.products : null);

    if (memBrands && memProds) {
      rawBrands = memBrands;
      products = memProds;
    } else {
      const [brandRes, prodRes] = await Promise.all([
        memBrands ? Promise.resolve({ data: { items: memBrands } }) : apiClient.request("brands/list"),
        memProds ? Promise.resolve({ data: { items: memProds } }) : apiClient.request("products/list")
      ]);
      rawBrands = (brandRes && brandRes.data && brandRes.data.items) || [];
      products = (prodRes && prodRes.data && prodRes.data.items) || [];
    }
  } catch (e) {
    rawBrands = apiClient.sheetBrands || [];
    products = apiClient.sheetProducts || [];
  }

  // 1. O(N) Single-pass product count & first-thumbnail lookup per brand
  const prodCountMap = new Map();
  const prodThumbMap = new Map();
  const prodBrandDisplayMap = new Map();

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p || !p.brand) continue;
    const bName = String(p.brand).trim();
    if (!bName) continue;
    const key = bName.toLowerCase();
    prodCountMap.set(key, (prodCountMap.get(key) || 0) + 1);
    if (!prodBrandDisplayMap.has(key)) prodBrandDisplayMap.set(key, bName);
    if (!prodThumbMap.has(key) && p.thumbnail) prodThumbMap.set(key, p.thumbnail);
  }

  // 2. Deduplicated Brand Map (merges Brands sheet + Brands found in Products)
  const brandMap = new Map();

  for (let i = 0; i < rawBrands.length; i++) {
    const b = rawBrands[i];
    if (!b) continue;
    const bName = String(b.brand_name || b.name || '').trim();
    if (!bName) continue;
    const key = bName.toLowerCase();
    if (!brandMap.has(key)) {
      brandMap.set(key, {
        brand_id: b.brand_id || ('BRD-' + String(brandMap.size + 1).padStart(3, '0')),
        brand_name: bName,
        brand_image: b.brand_image || prodThumbMap.get(key) || FALLBACK_BRAND_SVG,
        brand_description: b.brand_description || 'অফিশিয়াল অথেন্টিক ব্র্যান্ড পণ্য।',
        count: prodCountMap.get(key) || 0
      });
    }
  }

  prodCountMap.forEach(function (count, key) {
    if (!brandMap.has(key)) {
      const displayName = prodBrandDisplayMap.get(key) || key;
      brandMap.set(key, {
        brand_id: 'BRD-' + String(brandMap.size + 1).padStart(3, '0'),
        brand_name: displayName,
        brand_image: prodThumbMap.get(key) || FALLBACK_BRAND_SVG,
        brand_description: 'অফিশিয়াল অথেন্টিক ব্র্যান্ড পণ্য।',
        count: count
      });
    }
  });

  const brands = Array.from(brandMap.values()).sort(function (a, b) {
    return b.count - a.count || a.brand_name.localeCompare(b.brand_name);
  });

  const cardsHtml = brands.map(function (b, idx) {
    const brandUrl = '/products?brand=' + encodeURIComponent(b.brand_name);
    return `
      <article
        class="brand-3d-card"
        data-brand-name="${escapeHtml(b.brand_name)}"
        data-brand-id="${escapeHtml(b.brand_id)}"
      >
        <div class="brand-3d-top">
          <div class="brand-3d-logo-box">
            <img
              src="${escapeHtml(b.brand_image || FALLBACK_BRAND_SVG)}"
              alt="${escapeHtml(b.brand_name)}"
              loading="${idx < 8 ? 'eager' : 'lazy'}"
              decoding="async"
              class="brand-3d-logo"
              onerror="this.onerror=null; this.src='${FALLBACK_BRAND_SVG}';"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="brand-id-pill">${escapeHtml(b.brand_id)}</span>
              <span class="brand-count-pill">${b.count} পণ্য</span>
            </div>
            <h3 class="brand-3d-title" title="${escapeHtml(b.brand_name)}">
              ${escapeHtml(b.brand_name)}
            </h3>
          </div>
        </div>

        <p class="brand-3d-desc">
          ${escapeHtml(b.brand_description)}
        </p>

        <a href="${brandUrl}" class="brand-3d-cta">
          পণ্য দেখুন (${b.count}) →
        </a>
      </article>
    `;
  }).join('');

  return `
    <style id="dc-brand-fast-styles">
      .brand-fast-page {
        font-family: 'Plus Jakarta Sans', 'Hind Siliguri', system-ui, -apple-system, sans-serif;
        max-width: 1240px;
        margin: 0 auto;
        padding-bottom: 64px;
      }
      .brand-fast-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
      }
      .dark .brand-fast-header {
        border-bottom-color: #1e293b;
      }
      .brand-fast-search {
        position: relative;
        width: 100%;
        max-width: 300px;
      }
      .brand-fast-search input {
        width: 100%;
        padding: 9px 12px 9px 34px;
        font-size: 12.5px;
        font-weight: 600;
        border-radius: 12px;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #0f172a;
        outline: none;
      }
      .brand-fast-search input:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
      }
      .dark .brand-fast-search input {
        background: #0f172a;
        border-color: #334155;
        color: #f8fafc;
      }

      /* Ultra-Fast 3D Bento Brands Grid */
      .brand-bento-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 14px;
      }
      @media (min-width: 540px) {
        .brand-bento-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 900px) {
        .brand-bento-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
      }
      @media (min-width: 1200px) {
        .brand-bento-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
      }

      .brand-3d-card {
        content-visibility: auto;
        contain-intrinsic-size: 190px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 6px 18px -10px rgba(15, 23, 42, 0.1);
        transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      }
      .brand-3d-card:hover {
        transform: translateY(-3px);
        border-color: #10b981;
        box-shadow: 0 14px 28px -14px rgba(16, 185, 129, 0.28);
      }
      .dark .brand-3d-card {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.5);
      }
      .dark .brand-3d-card:hover {
        border-color: #10b981;
      }

      .brand-3d-top {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .brand-3d-logo-box {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
      }
      .dark .brand-3d-logo-box {
        background: #1e293b;
        border-color: #334155;
      }
      .brand-3d-logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
      .brand-id-pill {
        font-size: 9.5px;
        font-family: ui-monospace, monospace;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 5px;
        background: #f1f5f9;
        color: #64748b;
      }
      .dark .brand-id-pill {
        background: #1e293b;
        color: #94a3b8;
      }
      .brand-count-pill {
        font-size: 10px;
        font-weight: 800;
        padding: 1px 7px;
        border-radius: 9999px;
        background: #ecfdf5;
        color: #059669;
      }
      .dark .brand-count-pill {
        background: rgba(16, 185, 129, 0.16);
        color: #34d399;
      }
      .brand-3d-title {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
        margin-top: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dark .brand-3d-title {
        color: #f8fafc;
      }
      .brand-3d-desc {
        font-size: 11.5px;
        color: #64748b;
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 2.9em;
      }
      .dark .brand-3d-desc {
        color: #94a3b8;
      }
      .brand-3d-cta {
        margin-top: auto;
        display: block;
        text-align: center;
        padding: 8px 12px;
        border-radius: 11px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #ffffff;
        font-size: 11.5px;
        font-weight: 800;
        text-decoration: none;
        transition: opacity 0.15s ease;
      }
      .brand-3d-cta:hover {
        opacity: 0.92;
      }
    </style>

    <div class="brand-fast-page space-y-6">
      <div class="brand-fast-header">
        <div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <a href="/" class="hover:text-emerald-600 transition">হোম</a>
            <span>/</span>
            <span class="text-slate-700 dark:text-slate-300 font-bold">ব্র্যান্ড সমূহ</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🏷️</span> আমাদের ব্র্যান্ড পার্টনারগণ
            <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ${brands.length}টি
            </span>
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            বিশ্বমানের শীর্ষস্থানীয় অথেন্টিক ব্র্যান্ডের গ্যাজেট ও পণ্য সামগ্রী
          </p>
        </div>

        <div class="brand-fast-search">
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="ব্র্যান্ড খুঁজুন..."
            oninput="window.filterBrandGrid(this.value);"
          />
        </div>
      </div>

      ${brands.length === 0 ? `
        <div class="p-12 text-center text-sm text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          কোনো ব্র্যান্ড পাওয়া যায়নি।
        </div>
      ` : `
        <div id="brand-bento-grid" class="brand-bento-grid">
          ${cardsHtml}
        </div>
        <div id="brand-grid-empty" style="display:none;" class="p-12 text-center text-sm text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          সার্চের সাথে কোনো ব্র্যান্ড মেলেনি।
        </div>
      `}
    </div>
  `;
}

export default renderBrandPage;
