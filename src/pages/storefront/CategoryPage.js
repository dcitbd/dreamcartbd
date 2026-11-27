/**
 * DREAM CART BD — ULTRA-FAST 3D CATEGORY GRID & TREE MODAL (CategoryPage.js)
 * Performance & Design Upgrades:
 * - Instant 0ms data read from apiClient.sheetCategories / apiClient.sheetProducts / SSR cache
 * - O(N) Single-Pass Aggregation (zero nested .filter() loops)
 * - CSS `content-visibility: auto` + `loading="lazy" decoding="async"` for instant paint & zero scroll lag
 * - Clean 3D Bento Grid of all unique categories (2 cols mobile, 3 tablet, 4 desktop)
 * - On-demand Tree Explorer Modal for Sub-Categories & Child-Categories (zero hidden DOM bloat)
 * - Strict 100% deduplication & full Dark/Light mode support
 */

import { apiClient, INITIAL_CATEGORIES } from '../../api/client.js';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const FALLBACK_CAT_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=75';

const DEFAULT_CAT_HIERARCHIES = {
  "smartwatches": {
    name: "Smartwatches",
    id: "CAT-001",
    slug: "smartwatches",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&auto=format&fit=crop&q=75",
    subCats: {
      "AMOLED Watch": ["Fitness & GPS", "Metal Body", "Always-on Display", "Health Monitoring"],
      "Calling Watch": ["Bluetooth Calling", "HD Mic & Speaker", "Round Dial", "Square Curved"]
    }
  },
  "organic-health": {
    name: "Organic & Health",
    id: "CAT-002",
    slug: "organic-health",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=75",
    subCats: {
      "Herbal Honey": ["Sundarban Wild Honey", "Raw Natural Mustard", "Black Cumin Flower Honey"],
      "Supplements": ["Premium Grade Nutrition", "Organic Chia & Seeds", "Herbal Energy Tonics"]
    }
  },
  "tactical-lighting": {
    name: "Tactical Lighting",
    id: "CAT-003",
    slug: "tactical-lighting",
    image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=400&auto=format&fit=crop&q=75",
    subCats: {
      "LED Flashlight": ["High-Power Rechargeable", "Tactical Zoom Focus", "Waterproof Military Grade"],
      "Emergency Light": ["Solar Rechargeable", "Camping Lantern", "Portable Magnetic Worklight"]
    }
  },
  "kitchen-safety": {
    name: "Kitchen Safety",
    id: "CAT-004",
    slug: "kitchen-safety",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=75",
    subCats: {
      "Gas Regulator": ["Automatic Safety Device", "LPG Pressure Meter Gauge", "Anti-Explosion Valve"],
      "Gas Accessories": ["Heavy Duty Safety Hose Pipe", "Gas Leak Detector", "Steel Clamp Fasteners"]
    }
  }
};

function buildTreeModalBodyHtml(c) {
  if (!c) return '';
  const shopUrl = '/products?cat=' + encodeURIComponent(c.category);
  const subCategories = c.subCategories || [];

  if (subCategories.length === 0) {
    return `
      <div class="p-6 text-center space-y-3">
        <p class="text-xs text-slate-500 dark:text-slate-400">এই ক্যাটাগরিতে মোট <strong>${c.matchingCount}টি</strong> পণ্য রয়েছে।</p>
        <a href="${shopUrl}" class="btn-primary py-2 px-5 text-xs font-bold inline-flex rounded-xl" onclick="window.closeCategoryTreeModal();">
          সকল পণ্য দেখুন →
        </a>
      </div>
    `;
  }

  return subCategories.map(function (sub, sIdx) {
    const subUrl = '/products?cat=' + encodeURIComponent(c.category) + '&sub=' + encodeURIComponent(sub.name);
    const childrenHtml = (sub.children && sub.children.length > 0)
      ? sub.children.map(function (ch) {
          const chUrl = subUrl + '&child=' + encodeURIComponent(ch.name);
          return `
            <a href="${chUrl}" class="cat-leaf-chip" onclick="window.closeCategoryTreeModal();">
              <span class="cat-leaf-dot"></span>
              <span>${escapeHtml(ch.name)}</span>
              ${ch.count > 0 ? `<span class="cat-leaf-count">${ch.count}</span>` : ''}
            </a>
          `;
        }).join('')
      : '<span class="text-[11px] text-slate-400 italic">সরাসরি সাব-ক্যাটাগরি পণ্য</span>';

    return `
      <div class="cat-sub-node ${sIdx < 3 ? 'is-open' : ''}">
        <div class="cat-sub-head" onclick="this.parentElement.classList.toggle('is-open');">
          <div class="flex items-center gap-2 min-w-0">
            <span class="cat-sub-caret">▸</span>
            <span class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(sub.name)}</span>
            <span class="cat-leaf-count">${sub.count}</span>
          </div>
          <a href="${subUrl}" class="cat-sub-shop-btn" onclick="event.stopPropagation(); window.closeCategoryTreeModal();">
            শপ →
          </a>
        </div>
        <div class="cat-sub-body">
          <div class="cat-tree-children">${childrenHtml}</div>
        </div>
      </div>
    `;
  }).join('');
}

if (typeof window !== 'undefined' && !window.__dcbdFastCatHandlersAttached) {
  window.__dcbdFastCatHandlersAttached = true;

  window.filterCategoryGrid = function (query) {
    const q = (query || '').toLowerCase().trim();
    let visible = 0;
    document.querySelectorAll('#cat-bento-grid .cat-3d-card').forEach(function (card) {
      const name = (card.getAttribute('data-cat-name') || '').toLowerCase();
      const subs = (card.getAttribute('data-cat-subs') || '').toLowerCase();
      if (!q || name.includes(q) || subs.includes(q)) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });
    const emptyEl = document.getElementById('cat-grid-empty');
    if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
  };

  window.openCategoryTreeModal = function (idx, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const list = window.__dcbdCategoryHubData || [];
    const c = list[idx];
    const modal = document.getElementById('cat-tree-modal');
    if (!c || !modal) return;

    const titleEl = document.getElementById('cat-modal-title');
    const metaEl = document.getElementById('cat-modal-meta');
    const shopEl = document.getElementById('cat-modal-shop-link');
    const bodyEl = document.getElementById('cat-modal-body');

    if (titleEl) titleEl.textContent = c.category;
    if (metaEl) metaEl.textContent = `${c.matchingCount} টি পণ্য • ${c.subCategories.length} টি সাব-ক্যাটাগরি`;
    if (shopEl) shopEl.href = '/products?cat=' + encodeURIComponent(c.category);
    if (bodyEl) bodyEl.innerHTML = buildTreeModalBodyHtml(c);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeCategoryTreeModal = function () {
    const modal = document.getElementById('cat-tree-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
}

export async function renderCategoryPage(params = {}) {
  const safeParams = params || {};

  let rawCategories = [];
  let products = [];

  try {
    const ssrCache = (typeof window !== 'undefined' && window.__DCBD_SSR_CACHE__) ? window.__DCBD_SSR_CACHE__ : null;
    const memCats = (Array.isArray(apiClient.sheetCategories) && apiClient.sheetCategories.length > 0)
      ? apiClient.sheetCategories
      : (ssrCache && Array.isArray(ssrCache.categories) && ssrCache.categories.length > 0 ? ssrCache.categories : null);
    const memProds = (Array.isArray(apiClient.sheetProducts) && apiClient.sheetProducts.length > 0)
      ? apiClient.sheetProducts
      : (ssrCache && Array.isArray(ssrCache.products) && ssrCache.products.length > 0 ? ssrCache.products : null);

    if (memCats && memProds) {
      rawCategories = memCats;
      products = memProds;
    } else {
      const [catRes, prodRes] = await Promise.all([
        memCats ? Promise.resolve({ data: { items: memCats } }) : apiClient.request("categories/list"),
        memProds ? Promise.resolve({ data: { items: memProds } }) : apiClient.request("products/list")
      ]);
      rawCategories = (catRes && catRes.data && catRes.data.items) || [];
      products = (prodRes && prodRes.data && prodRes.data.items) || [];
    }
  } catch (e) {
    rawCategories = INITIAL_CATEGORIES || [];
    products = apiClient.sheetProducts || [];
  }

  // O(N) Single-Pass Deduplicated Aggregation
  const catMap = new Map();

  Object.values(DEFAULT_CAT_HIERARCHIES).forEach(function (dh) {
    const key = dh.name.toLowerCase().trim();
    const subMap = new Map();
    Object.entries(dh.subCats).forEach(function ([sName, childList]) {
      const childMap = new Map();
      childList.forEach(function (ch) {
        childMap.set(ch.toLowerCase().trim(), { name: ch, count: 0 });
      });
      subMap.set(sName.toLowerCase().trim(), { name: sName, count: 0, childMap: childMap });
    });

    catMap.set(key, {
      category: dh.name,
      catagory_id: dh.id,
      catagory_slug: dh.slug,
      category_image: dh.image,
      count: 0,
      firstThumb: '',
      subCatsMap: subMap
    });
  });

  for (let i = 0; i < rawCategories.length; i++) {
    const c = rawCategories[i];
    if (!c) continue;
    const rawName = String(c.category || '').trim();
    if (!rawName || rawName.toLowerCase() === 'test id' || rawName.toLowerCase() === 'category') continue;

    const key = rawName.toLowerCase();
    if (!catMap.has(key)) {
      catMap.set(key, {
        category: rawName,
        catagory_id: c.catagory_id || ('CAT-' + String(catMap.size + 1).padStart(3, '0')),
        catagory_slug: c.catagory_slug || rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category_image: c.category_image || '',
        count: 0,
        firstThumb: '',
        subCatsMap: new Map()
      });
    }

    const catObj = catMap.get(key);
    if (c.category_image && !catObj.category_image) {
      catObj.category_image = c.category_image;
    }

    const rawSub = c.sub_category != null ? String(c.sub_category) : '';
    const rawChild = (c.chail_category || c.child_category) != null ? String(c.chail_category || c.child_category) : '';

    if (rawSub) {
      const subList = rawSub.replace(/\r/g, '').split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      const childList = rawChild.replace(/\r/g, '').split(/[\n,]/).map(s => s.trim()).filter(Boolean);

      for (let s = 0; s < subList.length; s++) {
        const sName = subList[s];
        const sKey = sName.toLowerCase();
        if (!catObj.subCatsMap.has(sKey)) {
          catObj.subCatsMap.set(sKey, { name: sName, count: 0, childMap: new Map() });
        }
        const subObj = catObj.subCatsMap.get(sKey);
        for (let k = 0; k < childList.length; k++) {
          const ch = childList[k];
          const chKey = ch.toLowerCase();
          if (!subObj.childMap.has(chKey)) {
            subObj.childMap.set(chKey, { name: ch, count: 0 });
          }
        }
      }
    }
  }

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p) continue;
    const pCat = String(p.category || '').trim();
    if (!pCat || pCat.toLowerCase() === 'test id') continue;

    const key = pCat.toLowerCase();
    if (!catMap.has(key)) {
      catMap.set(key, {
        category: pCat,
        catagory_id: ('CAT-' + String(catMap.size + 1).padStart(3, '0')),
        catagory_slug: pCat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category_image: p.thumbnail || '',
        count: 0,
        firstThumb: '',
        subCatsMap: new Map()
      });
    }

    const catObj = catMap.get(key);
    catObj.count += 1;
    if (!catObj.firstThumb && p.thumbnail) {
      catObj.firstThumb = p.thumbnail;
    }

    const pSub = p.sub_category != null ? String(p.sub_category).trim() : '';
    if (pSub) {
      const sKey = pSub.toLowerCase();
      if (!catObj.subCatsMap.has(sKey)) {
        catObj.subCatsMap.set(sKey, { name: pSub, count: 0, childMap: new Map() });
      }
      const subObj = catObj.subCatsMap.get(sKey);
      subObj.count += 1;

      const pChild = p.child_category != null ? String(p.child_category).trim() : '';
      if (pChild) {
        const chKey = pChild.toLowerCase();
        if (!subObj.childMap.has(chKey)) {
          subObj.childMap.set(chKey, { name: pChild, count: 0 });
        }
        subObj.childMap.get(chKey).count += 1;
      }
    }
  }

  const categories = Array.from(catMap.values()).map(function (catObj, catIdx) {
    let img = catObj.category_image;
    if ((!img || img.includes('photo-1579586337278-3befd40fd17a') || img.includes('jijistatic')) && catObj.firstThumb) {
      img = catObj.firstThumb;
    }

    const subCategories = Array.from(catObj.subCatsMap.values()).map(function (subObj) {
      const children = Array.from(subObj.childMap.values())
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
      return {
        name: subObj.name,
        count: subObj.count,
        children: children
      };
    }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return {
      category: catObj.category,
      catagory_id: catObj.catagory_id || ('CAT-' + String(catIdx + 1).padStart(3, '0')),
      catagory_slug: catObj.catagory_slug || catObj.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_image: img || FALLBACK_CAT_IMG,
      matchingCount: catObj.count,
      subCategories: subCategories
    };
  }).sort((a, b) => b.matchingCount - a.matchingCount || a.category.localeCompare(b.category));

  if (typeof window !== 'undefined') {
    window.__dcbdCategoryHubData = categories;
  }

  // If URL has ?cat=..., auto-open that category's tree modal after render
  const queryCat = String(safeParams.cat || safeParams.category || '').toLowerCase().trim();
  if (queryCat && typeof window !== 'undefined') {
    const foundIdx = categories.findIndex(c =>
      c.category.toLowerCase() === queryCat || c.catagory_slug.toLowerCase() === queryCat
    );
    if (foundIdx !== -1) {
      setTimeout(() => {
        if (window.openCategoryTreeModal) window.openCategoryTreeModal(foundIdx);
      }, 60);
    }
  }

  const cardsHtml = categories.map(function (c, idx) {
    const shopUrl = '/products?cat=' + encodeURIComponent(c.category);
    const subPreview = c.subCategories.slice(0, 3).map(s => s.name).join(', ');
    return `
      <article
        class="cat-3d-card"
        data-cat-name="${escapeHtml(c.category)}"
        data-cat-subs="${escapeHtml(subPreview)}"
      >
        <a href="${shopUrl}" class="cat-3d-thumb-link" aria-label="${escapeHtml(c.category)}">
          <img
            src="${escapeHtml(c.category_image)}"
            alt="${escapeHtml(c.category)}"
            loading="${idx < 8 ? 'eager' : 'lazy'}"
            decoding="async"
            class="cat-3d-thumb"
            onerror="this.onerror=null; this.src='${FALLBACK_CAT_IMG}';"
          />
          <span class="cat-3d-count-pill">${c.matchingCount} পণ্য</span>
        </a>

        <div class="cat-3d-body">
          <a href="${shopUrl}" class="cat-3d-title" title="${escapeHtml(c.category)}">
            ${escapeHtml(c.category)}
          </a>
          <div class="cat-3d-submeta">
            ${c.subCategories.length > 0
              ? `${c.subCategories.length} টি সাব-ক্যাটাগরি`
              : 'ডাইরেক্ট কালেকশন'}
          </div>

          <div class="cat-3d-actions">
            <a href="${shopUrl}" class="cat-3d-shop-btn">
              শপ করুন →
            </a>
            ${c.subCategories.length > 0 ? `
              <button
                type="button"
                class="cat-3d-tree-btn"
                onclick="window.openCategoryTreeModal(${idx}, event);"
                title="সাব-ক্যাটাগরি ও চাইল্ড ট্রি দেখুন"
              >
                🌳 ট্রি
              </button>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');

  return `
    <style id="dc-category-fast-styles">
      .cat-fast-page {
        font-family: 'Plus Jakarta Sans', 'Hind Siliguri', system-ui, -apple-system, sans-serif;
        max-width: 1240px;
        margin: 0 auto;
        padding-bottom: 64px;
      }
      .cat-fast-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
      }
      .dark .cat-fast-header {
        border-bottom-color: #1e293b;
      }
      .cat-fast-search {
        position: relative;
        width: 100%;
        max-width: 300px;
      }
      .cat-fast-search input {
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
      .cat-fast-search input:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
      }
      .dark .cat-fast-search input {
        background: #0f172a;
        border-color: #334155;
        color: #f8fafc;
      }

      /* Ultra-Fast 3D Bento Grid */
      .cat-bento-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      @media (min-width: 640px) {
        .cat-bento-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
      }
      @media (min-width: 1024px) {
        .cat-bento-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
      }

      .cat-3d-card {
        content-visibility: auto;
        contain-intrinsic-size: 230px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 6px 18px -10px rgba(15, 23, 42, 0.1);
        transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      }
      .cat-3d-card:hover {
        transform: translateY(-3px);
        border-color: #10b981;
        box-shadow: 0 14px 28px -14px rgba(16, 185, 129, 0.28);
      }
      .dark .cat-3d-card {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.5);
      }
      .dark .cat-3d-card:hover {
        border-color: #10b981;
      }

      .cat-3d-thumb-link {
        position: relative;
        display: block;
        width: 100%;
        aspect-ratio: 16 / 10;
        background: #f1f5f9;
        overflow: hidden;
      }
      .dark .cat-3d-thumb-link {
        background: #1e293b;
      }
      .cat-3d-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .cat-3d-count-pill {
        position: absolute;
        bottom: 8px;
        right: 8px;
        font-size: 10.5px;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 9999px;
        background: rgba(15, 23, 42, 0.82);
        color: #ffffff;
      }

      .cat-3d-body {
        padding: 12px 13px 13px;
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 6px;
      }
      .cat-3d-title {
        font-size: 13.5px;
        font-weight: 800;
        color: #0f172a;
        text-decoration: none;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .cat-3d-title:hover {
        color: #059669;
      }
      .dark .cat-3d-title {
        color: #f8fafc;
      }
      .cat-3d-submeta {
        font-size: 11px;
        color: #64748b;
        font-weight: 600;
      }
      .dark .cat-3d-submeta {
        color: #94a3b8;
      }

      .cat-3d-actions {
        margin-top: auto;
        padding-top: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .cat-3d-shop-btn {
        flex: 1;
        text-align: center;
        padding: 7px 10px;
        border-radius: 10px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #ffffff;
        font-size: 11.5px;
        font-weight: 800;
        text-decoration: none;
      }
      .cat-3d-tree-btn {
        padding: 7px 10px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        color: #334155;
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
      }
      .cat-3d-tree-btn:hover {
        border-color: #10b981;
        color: #059669;
      }
      .dark .cat-3d-tree-btn {
        background: #1e293b;
        border-color: #334155;
        color: #cbd5e1;
      }

      /* Tree Modal */
      .cat-tree-modal {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(15, 23, 42, 0.65);
      }
      .cat-tree-modal.is-open {
        display: flex;
      }
      .cat-tree-dialog {
        width: 100%;
        max-width: 560px;
        max-height: 82vh;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 22px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 24px 60px -15px rgba(0, 0, 0, 0.35);
      }
      .dark .cat-tree-dialog {
        background: #0f172a;
        border-color: #334155;
      }
      .cat-tree-dialog-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 15px 18px;
        border-bottom: 1px solid #f1f5f9;
      }
      .dark .cat-tree-dialog-head {
        border-bottom-color: #1e293b;
      }
      .cat-tree-dialog-body {
        padding: 14px 18px 18px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .cat-sub-node {
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        overflow: hidden;
        background: #f8fafc;
      }
      .dark .cat-sub-node {
        border-color: #1e293b;
        background: #131c31;
      }
      .cat-sub-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 12px;
        background: #ffffff;
        cursor: pointer;
      }
      .dark .cat-sub-head {
        background: #0f172a;
      }
      .cat-sub-caret {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: #f1f5f9;
        color: #475569;
        font-size: 10px;
        transition: transform 0.15s ease;
      }
      .cat-sub-node.is-open .cat-sub-caret {
        transform: rotate(90deg);
        background: #ecfdf5;
        color: #059669;
      }
      .cat-sub-shop-btn {
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 8px;
        background: #ecfdf5;
        color: #059669;
        text-decoration: none;
        flex-shrink: 0;
      }
      .cat-sub-body {
        display: none;
        padding: 10px 12px;
        border-top: 1px solid #f1f5f9;
      }
      .dark .cat-sub-body {
        border-top-color: #1e293b;
      }
      .cat-sub-node.is-open .cat-sub-body {
        display: block;
      }
      .cat-tree-children {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding-left: 10px;
        border-left: 2px dashed #cbd5e1;
      }
      .dark .cat-tree-children {
        border-left-color: #334155;
      }
      .cat-leaf-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 10px;
        border-radius: 9px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        color: #334155;
        font-size: 11.5px;
        font-weight: 600;
        text-decoration: none;
      }
      .cat-leaf-chip:hover {
        border-color: #10b981;
        color: #059669;
      }
      .dark .cat-leaf-chip {
        background: #0f172a;
        border-color: #334155;
        color: #e2e8f0;
      }
      .cat-leaf-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #10b981;
      }
      .cat-leaf-count {
        font-size: 10px;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 9999px;
        background: #f1f5f9;
        color: #64748b;
      }
      .dark .cat-leaf-count {
        background: #1e293b;
        color: #94a3b8;
      }
    </style>

    <div class="cat-fast-page space-y-6">
      <div class="cat-fast-header">
        <div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <a href="/" class="hover:text-emerald-600 transition">হোম</a>
            <span>/</span>
            <span class="text-slate-700 dark:text-slate-300 font-bold">ক্যাটাগরি সমূহ</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>📂</span> সকল পণ্য ক্যাটাগরি
            <span class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ${categories.length}টি
            </span>
          </h1>
        </div>

        <div class="cat-fast-search">
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="ক্যাটাগরি খুঁজুন..."
            oninput="window.filterCategoryGrid(this.value);"
          />
        </div>
      </div>

      <div id="cat-bento-grid" class="cat-bento-grid">
        ${cardsHtml}
      </div>

      <div id="cat-grid-empty" style="display:none;" class="p-12 text-center text-sm text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        কোনো ক্যাটাগরি পাওয়া যায়নি।
      </div>

      <!-- On-Demand Sub/Child Category Tree Modal -->
      <div id="cat-tree-modal" class="cat-tree-modal" aria-hidden="true" onclick="if(event.target === this) window.closeCategoryTreeModal();">
        <div class="cat-tree-dialog" role="dialog" aria-modal="true">
          <div class="cat-tree-dialog-head">
            <div>
              <h3 id="cat-modal-title" class="text-base font-black text-slate-900 dark:text-white">ক্যাটাগরি</h3>
              <p id="cat-modal-meta" class="text-[11px] text-slate-400"></p>
            </div>
            <div class="flex items-center gap-2">
              <a id="cat-modal-shop-link" href="/products" class="btn-primary py-1.5 px-3 text-xs font-bold rounded-lg" onclick="window.closeCategoryTreeModal();">
                সব দেখুন →
              </a>
              <button type="button" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold" onclick="window.closeCategoryTreeModal();">✕</button>
            </div>
          </div>
          <div id="cat-modal-body" class="cat-tree-dialog-body"></div>
        </div>
      </div>
    </div>
  `;
}

export default renderCategoryPage;
