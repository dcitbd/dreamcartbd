/**
 * DREAM CART BD — MAIN CATEGORIES HUB PAGE (src/pages/storefront/CategoryPage.js)
 * Upgraded 3D Professional Design System:
 * - Displays ONLY Main Categories in a gorgeous 3D Grid Layout with framed images and product counts
 * - Strict 100% deduplication: No category name appears twice!
 * - 100% Self-Contained Scoped CSS (.ct-page-root) with Hind Siliguri + Plus Jakarta Sans typography
 * - Zero dependency on missing Tailwind utilities | High-contrast Light & Dark mode support
 * - Preserves all exports, global window handlers, URL routes & data deduplication logic
 */

import { apiClient, INITIAL_CATEGORIES } from '../../api/client.js';

// Safe HTML escaper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Default enriched hierarchies to guarantee rich categories even before sheet syncs
const DEFAULT_CAT_HIERARCHIES = {
  "smartwatches": {
    name: "Smartwatches",
    id: "CAT-001",
    slug: "smartwatches",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80"
  },
  "organic-health": {
    name: "Organic & Health",
    id: "CAT-002",
    slug: "organic-health",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"
  },
  "tactical-lighting": {
    name: "Tactical Lighting",
    id: "CAT-003",
    slug: "tactical-lighting",
    image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&auto=format&fit=crop&q=80"
  },
  "kitchen-safety": {
    name: "Kitchen Safety",
    id: "CAT-004",
    slug: "kitchen-safety",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80"
  }
};

// Global interactive handlers for Category Search Filter
if (typeof window !== 'undefined') {
  window.filterMainCategories = function(query) {
    const q = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.ct-page-root .ct-main-cat-card');
    const clearBtn = document.getElementById('ct-main-search-clear');
    const countEl = document.getElementById('ct-main-count');
    const emptyEl = document.getElementById('ct-main-empty');

    if (clearBtn) {
      clearBtn.style.display = q ? 'inline-flex' : 'none';
    }

    let visibleCount = 0;
    cards.forEach(function(card) {
      const name = (card.getAttribute('data-cat-name') || '').toLowerCase();
      const id = (card.getAttribute('data-cat-id') || '').toLowerCase();
      const slug = (card.getAttribute('data-cat-slug') || '').toLowerCase();

      if (!q || name.includes(q) || id.includes(q) || slug.includes(q)) {
        card.style.display = 'flex';
        visibleCount += 1;
      } else {
        card.style.display = 'none';
      }
    });

    if (countEl) {
      countEl.textContent = visibleCount + ' টি ক্যাটাগরি';
    }
    if (emptyEl) {
      emptyEl.style.display = visibleCount === 0 ? 'flex' : 'none';
    }
  };

  window.clearMainCategorySearch = function() {
    const input = document.getElementById('ct-main-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    window.filterMainCategories('');
  };
}

export async function renderCategoryPage(params = {}) {
  let rawCategories = [];
  let products = [];

  try {
    const [catRes, prodRes] = await Promise.all([
      apiClient.request("categories/list"),
      apiClient.request("products/list")
    ]);
    rawCategories = (catRes && catRes.data && catRes.data.items) || [];
    products = (prodRes && prodRes.data && prodRes.data.items) || [];
  } catch (e) {
    rawCategories = INITIAL_CATEGORIES || [];
    products = apiClient.products || [];
  }

  // Strict deduplication Map for Main Categories
  const catMap = new Map();

  // 1. Seed base default categories
  Object.values(DEFAULT_CAT_HIERARCHIES).forEach(function(dh) {
    const key = dh.name.toLowerCase().trim();
    catMap.set(key, {
      category: dh.name,
      catagory_id: dh.id,
      catagory_slug: dh.slug,
      category_image: dh.image
    });
  });

  // 2. Ingest API Categories (Merge & deduplicate strictly by name)
  rawCategories.forEach(function(c) {
    if (!c) return;
    const rawName = String(c.category || '').trim();
    if (!rawName || rawName.toLowerCase() === 'test id' || rawName.toLowerCase() === 'category') return;

    const key = rawName.toLowerCase();
    if (!catMap.has(key)) {
      catMap.set(key, {
        category: rawName,
        catagory_id: c.catagory_id || ('CAT-00' + (catMap.size + 1)),
        catagory_slug: c.catagory_slug || rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category_image: c.category_image
      });
    }

    const catObj = catMap.get(key);
    if (c.category_image && !catObj.category_image) {
      catObj.category_image = c.category_image;
    }
  });

  // 3. Ingest Products data for exact matching categories
  products.forEach(function(p) {
    if (!p) return;
    const pCat = String(p.category || '').trim();
    if (!pCat || pCat.toLowerCase() === 'test id') return;

    const key = pCat.toLowerCase();
    if (!catMap.has(key)) {
      catMap.set(key, {
        category: pCat,
        catagory_id: ('CAT-00' + (catMap.size + 1)),
        catagory_slug: pCat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category_image: p.thumbnail
      });
    }
  });

  // 4. Calculate counts and build final main categories list
  const categories = Array.from(catMap.values()).map(function(catObj, catIdx) {
    const matchingProds = products.filter(function(p) {
      return p && p.category && String(p.category).trim().toLowerCase() === catObj.category.toLowerCase();
    });

    let img = catObj.category_image;
    if ((!img || img.includes('photo-1579586337278-3befd40fd17a') || img.includes('jijistatic')) && matchingProds.length > 0 && matchingProds[0].thumbnail) {
      img = matchingProds[0].thumbnail;
    }

    return {
      category: catObj.category,
      catagory_id: catObj.catagory_id || ('CAT-00' + (catIdx + 1)),
      catagory_slug: catObj.catagory_slug || catObj.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_image: img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      matchingCount: matchingProds.length
    };
  }).sort(function(a, b) { return b.matchingCount - a.matchingCount || a.category.localeCompare(b.category); });

  const totalListedProducts = categories.reduce(function(sum, c) { return sum + c.matchingCount; }, 0);

  // Pre-generate main category grid cards HTML
  const mainCategoriesGridHtml = categories.map(function(c) {
    const shopUrl = '/products?cat=' + encodeURIComponent(c.category);

    return `
      <div 
        class="ct-main-cat-card"
        data-cat-name="${escapeHtml(c.category)}"
        data-cat-id="${escapeHtml(c.catagory_id)}"
        data-cat-slug="${escapeHtml(c.catagory_slug)}"
      >
        <div class="ct-main-thumb">
          <img 
            src="${escapeHtml(c.category_image)}" 
            alt="${escapeHtml(c.category)}"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';"
          />
          <div class="ct-main-badge ct-mono">${escapeHtml(c.catagory_id)}</div>
        </div>

        <div class="ct-main-body">
          <div class="ct-main-meta">
            <span class="ct-main-count-pill">📦 ${c.matchingCount} টি পণ্য</span>
            <span class="ct-main-slug ct-mono">/${escapeHtml(c.catagory_slug)}</span>
          </div>

          <h3 class="ct-main-name">${escapeHtml(c.category)}</h3>

          <div class="ct-main-footer">
            <a href="${shopUrl}" class="ct-btn-3d-primary w-full">
              <span>🛍️</span>
              <span>ক্যাটাগরি ব্রাউজ করুন</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!-- Scoped 3D Professional Styles for Main Categories Hub Page -->
    <style id="category-page-custom-styles">
      @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

      .ct-page-root {
        --ct-font: 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        --ct-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        --ct-emerald: #10b981;
        --ct-emerald-dark: #059669;
        --ct-surface: #ffffff;
        --ct-surface-soft: #f8fafc;
        --ct-border: #e2e8f0;
        --ct-border-3d: #cbd5e1;
        --ct-text-main: #0f172a;
        --ct-text-body: #334155;
        --ct-text-muted: #64748b;
        --ct-shadow-card:
          0 1px 0 rgba(255, 255, 255, 0.92) inset,
          0 6px 0 -2px rgba(226, 232, 240, 0.92),
          0 16px 34px -10px rgba(15, 23, 42, 0.09);
        --ct-shadow-card-hover:
          0 1px 0 rgba(255, 255, 255, 1) inset,
          0 8px 0 -2px rgba(16, 185, 129, 0.28),
          0 22px 42px -12px rgba(16, 185, 129, 0.2);

        font-family: var(--ct-font);
        max-width: 1240px;
        margin: 0 auto;
        padding: 16px 12px 96px;
        color: var(--ct-text-body);
        box-sizing: border-box;
      }

      .ct-page-root *, .ct-page-root *::before, .ct-page-root *::after {
        font-family: var(--ct-font);
        box-sizing: border-box;
      }

      .ct-page-root .ct-mono {
        font-family: var(--ct-mono) !important;
      }

      .ct-page-root .w-full {
        width: 100% !important;
      }

      .dark .ct-page-root {
        --ct-surface: #0f172a;
        --ct-surface-soft: #131f37;
        --ct-border: #1e293b;
        --ct-border-3d: #020617;
        --ct-text-main: #f8fafc;
        --ct-text-body: #cbd5e1;
        --ct-text-muted: #94a3b8;
        --ct-shadow-card:
          0 1px 0 rgba(255, 255, 255, 0.06) inset,
          0 6px 0 -2px rgba(2, 6, 23, 0.88),
          0 18px 40px -10px rgba(0, 0, 0, 0.56);
        --ct-shadow-card-hover:
          0 1px 0 rgba(52, 211, 153, 0.16) inset,
          0 8px 0 -2px rgba(16, 185, 129, 0.26),
          0 24px 48px -12px rgba(16, 185, 129, 0.24);
      }

      @keyframes ctReveal {
        0% { opacity: 0; transform: translateY(18px) scale(0.985); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes ctFloatOrb {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(-16px, 14px, 0) scale(1.08); }
      }

      @keyframes ctPulseDot {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.65); }
        50% { transform: scale(1.15); box-shadow: 0 0 0 7px rgba(52, 211, 153, 0); }
      }

      .ct-stack {
        display: flex;
        flex-direction: column;
        gap: 26px;
      }

      /* Hero Banner */
      .ct-hero {
        position: relative;
        overflow: hidden;
        border-radius: 26px;
        padding: 28px 22px;
        color: #ffffff;
        background:
          radial-gradient(circle at 12% 16%, rgba(16, 185, 129, 0.26) 0%, transparent 45%),
          radial-gradient(circle at 88% 82%, rgba(56, 189, 248, 0.22) 0%, transparent 48%),
          linear-gradient(135deg, #0b132b 0%, #0f172a 54%, #052e2b 100%);
        border: 1px solid rgba(52, 211, 153, 0.28);
        box-shadow: 0 10px 30px -10px rgba(2, 6, 23, 0.5);
        animation: ctReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @media (min-width: 768px) {
        .ct-hero { padding: 36px 36px; }
      }

      .ct-hero-orb-1 {
        position: absolute; top: -65px; right: -45px; width: 240px; height: 240px; border-radius: 50%;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.36) 0%, transparent 70%); filter: blur(32px); pointer-events: none; animation: ctFloatOrb 7s ease-in-out infinite;
      }
      .ct-hero-orb-2 {
        position: absolute; bottom: -75px; left: -40px; width: 220px; height: 220px; border-radius: 50%;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.24) 0%, transparent 70%); filter: blur(34px); pointer-events: none; animation: ctFloatOrb 9s ease-in-out infinite reverse;
      }

      .ct-hero-inner { position: relative; z-index: 2; }
      .ct-hero-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
      
      .ct-breadcrumb {
        display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px;
        background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.14); font-size: 13px; color: #cbd5e1;
      }
      .ct-breadcrumb a { color: #6ee7b7; font-weight: 600; text-decoration: none; }
      .ct-breadcrumb a:hover { color: #ffffff; text-decoration: underline; }

      .ct-hero-badge {
        display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px; border-radius: 999px;
        background: rgba(16, 185, 129, 0.16); border: 1px solid rgba(52, 211, 153, 0.44); color: #6ee7b7; font-size: 13px; font-weight: 700;
      }
      .ct-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #34d399; animation: ctPulseDot 2s infinite; }

      .ct-hero-title { font-size: 26px; font-weight: 700; color: #ffffff; margin: 0 0 10px; }
      @media (min-width: 640px) { .ct-hero-title { font-size: 36px; } }
      .ct-hero-subtitle { font-size: 15px; color: #cbd5e1; margin: 0 0 20px; max-width: 700px; }

      .ct-hero-stats {
        display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 12px;
      }
      @media (min-width: 640px) { .ct-hero-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

      .ct-stat-card {
        display: flex; align-items: center; gap: 13px; padding: 13px 16px; border-radius: 16px;
        background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.13); backdrop-filter: blur(10px);
      }
      .ct-stat-icon { width: 42px; height: 42px; border-radius: 12px; background: rgba(16, 185, 129, 0.28); display: flex; align-items: center; justify-content: center; font-size: 20px; }
      .ct-stat-val { font-size: 17px; font-weight: 700; color: #ffffff; }
      .ct-stat-lbl { font-size: 12.5px; color: #94a3b8; }

      /* Search & Header Bar */
      .ct-control-card {
        display: flex; flex-direction: column; gap: 14px; background: var(--ct-surface);
        border: 1px solid var(--ct-border); border-radius: 20px; padding: 18px 20px; box-shadow: var(--ct-shadow-card);
      }
      @media (min-width: 640px) {
        .ct-control-card { flex-direction: row; align-items: center; justify-content: space-between; }
      }

      .ct-search-wrap { position: relative; width: 100%; max-width: 380px; }
      .ct-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: 0.75; }
      .ct-search-input {
        width: 100%; padding: 11px 36px 11px 38px; border-radius: 14px; border: 1.5px solid var(--ct-border);
        background: var(--ct-surface-soft); color: var(--ct-text-main); font-size: 14px; font-weight: 500; outline: none;
      }
      .ct-search-input:focus { border-color: #10b981; background: var(--ct-surface); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.16); }
      .ct-search-clear {
        position: absolute; right: 9px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px; border-radius: 50%;
        border: none; background: rgba(148, 163, 184, 0.24); color: var(--ct-text-main); font-size: 14px; font-weight: 700; display: none; align-items: center; justify-content: center; cursor: pointer;
      }
      .ct-search-clear:hover { background: #ef4444; color: #ffffff; }

      /* Main Categories 3D Grid */
      .ct-main-grid {
        display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 20px;
      }
      @media (min-width: 640px) { .ct-main-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1024px) { .ct-main-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .ct-main-cat-card {
        background: var(--ct-surface); border: 1.5px solid var(--ct-border); border-radius: 22px;
        padding: 20px; box-shadow: var(--ct-shadow-card); display: flex; flex-direction: column; justify-content: space-between; gap: 16px;
        transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.22s ease, box-shadow 0.22s ease;
      }
      .ct-main-cat-card:hover {
        transform: translateY(-4px); border-color: #10b981; box-shadow: var(--ct-shadow-card-hover);
      }

      .ct-main-thumb {
        position: relative; width: 100%; height: 160px; border-radius: 16px; overflow: hidden;
        background: var(--ct-surface-soft); border: 1px solid var(--ct-border);
      }
      .ct-main-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
      .ct-main-cat-card:hover .ct-main-thumb img { transform: scale(1.07); }

      .ct-main-badge {
        position: absolute; top: 10px; right: 10px; padding: 3px 9px; border-radius: 8px;
        background: rgba(15, 23, 42, 0.75); color: #ffffff; font-size: 11px; font-weight: 700; backdrop-filter: blur(6px);
      }

      .ct-main-body { display: flex; flex-direction: column; gap: 10px; flex: 1; justify-content: space-between; }
      .ct-main-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

      .ct-main-count-pill {
        padding: 2px 10px; border-radius: 999px; background: rgba(16, 185, 129, 0.14); color: var(--ct-emerald-dark); font-size: 12px; font-weight: 700;
      }
      .dark .ct-main-count-pill { color: #6ee7b7; }

      .ct-main-slug { font-size: 11.5px; color: var(--ct-text-muted); }
      .ct-main-name { font-size: 18px; font-weight: 700; color: var(--ct-text-main); margin: 0; }

      .ct-main-footer { padding-top: 6px; border-top: 1px dashed var(--ct-border); }

      /* 3D Button */
      .ct-btn-3d-primary {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 18px;
        border-radius: 14px; border: 1px solid #34d399; background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer;
        box-shadow: 0 1px 0 rgba(255,255,255,0.35) inset, 0 4px 0 #047857, 0 10px 20px rgba(16,185,129,0.3);
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      }
      .ct-btn-3d-primary:hover {
        transform: translateY(-2px); background: linear-gradient(180deg, #34d399 0%, #059669 100%);
        box-shadow: 0 1px 0 rgba(255,255,255,0.4) inset, 0 6px 0 #047857, 0 14px 24px rgba(16,185,129,0.36);
      }
      .ct-btn-3d-primary:active { transform: translateY(2px); box-shadow: 0 1px 0 #047857; }

      .ct-main-empty {
        display: none; flex-direction: column; align-items: center; text-align: center; gap: 8px;
        padding: 40px 20px; border-radius: 20px; background: var(--ct-surface); border: 1.5px dashed rgba(16, 185, 129, 0.4);
        font-size: 14px; color: var(--ct-text-muted); grid-column: 1 / -1;
      }
    </style>

    <div class="ct-page-root">
      <div class="ct-stack">

        <!-- 1. 3D Luxury Hero Banner -->
        <section class="ct-hero">
          <div class="ct-hero-orb-1"></div>
          <div class="ct-hero-orb-2"></div>
          <div class="ct-hero-grid"></div>

          <div class="ct-hero-inner">
            <div class="ct-hero-top">
              <nav class="ct-breadcrumb" aria-label="Breadcrumb">
                <a href="/">🏠 হোম</a>
                <span>/</span>
                <span>ক্যাটাগরি সমূহ</span>
              </nav>

              <div class="ct-hero-badge">
                <span class="ct-status-dot"></span>
                <span>🏷️ মোট ${categories.length}টি মূল ক্যাটাগরি</span>
              </div>
            </div>

            <h1 class="ct-hero-title">
              📂 সকল মূল ক্যাটাগরি (Main Categories Hub)
            </h1>

            <p class="ct-hero-subtitle">
              আমাদের প্রিমিয়াম পণ্য সম্ভার থেকে আপনার পছন্দের মূল ক্যাটাগরি বেছে নিন এবং সরাসরি শপিং শুরু করুন।
            </p>

            <div class="ct-hero-stats">
              <div class="ct-stat-card">
                <div class="ct-stat-icon">🏷️</div>
                <div>
                  <div class="ct-stat-val">${categories.length}টি মূল ক্যাটাগরি</div>
                  <div class="ct-stat-lbl">১০০% ইউনিক ও গোছানো তালিকা</div>
                </div>
              </div>
              <div class="ct-stat-card">
                <div class="ct-stat-icon">🛍️</div>
                <div>
                  <div class="ct-stat-val">${totalListedProducts}টি তালিকাভুক্ত পণ্য</div>
                  <div class="ct-stat-lbl">সরাসরি ব্রাউজ ও অর্ডার করুন</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Search Filter Control Bar -->
        <section class="ct-control-card">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔍</span>
            <span class="text-sm font-bold text-slate-900 dark:text-white">ক্যাটাগরি খুঁজুন:</span>
          </div>

          <div class="ct-search-wrap">
            <span class="ct-search-icon" aria-hidden="true">🔎</span>
            <input
              type="text"
              id="ct-main-search-input"
              placeholder="ক্যাটাগরির নাম বা আইডি দিয়ে খুঁজুন..."
              class="ct-search-input"
              oninput="window.filterMainCategories(this.value)"
            />
            <button
              type="button"
              id="ct-main-search-clear"
              class="ct-search-clear"
              aria-label="ফিল্টার মুছুন"
              onclick="window.clearMainCategorySearch()"
            >×</button>
          </div>

          <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400 self-center" id="ct-main-count">
            ${categories.length} টি ক্যাটাগরি
          </div>
        </section>

        <!-- 3. Main Categories Grid -->
        <section class="ct-main-grid">
          ${mainCategoriesGridHtml}

          <div id="ct-main-empty" class="ct-main-empty">
            <span style="font-size:32px;">🔎</span>
            <span class="font-bold text-base">কোনো ক্যাটাগরি পাওয়া যায়নি</span>
            <span class="text-xs text-slate-400">অন্য কোনো নাম দিয়ে সার্চ করুন।</span>
            <button type="button" class="ct-btn-3d-primary mt-2" onclick="window.clearMainCategorySearch()">
              ↺ সব ক্যাটাগরি দেখুন
            </button>
          </div>
        </section>

      </div>
    </div>
  `;
}
