/**
 * DREAM CART BD — ALL CATEGORIES & TREE HIERARCHY PAGE (src/pages/storefront/CategoryPage.js)
 * Upgraded 3D Professional Design System:
 * - Dedicated 3D Sticky Category Sidebar (image, product count, ID, slug, shop button & live filter)
 * - Strict 100% deduplication: No category name appears twice!
 * - 3D Featured Main Category Card: Name, framed image, slug, ID, product count & 3D shopping button
 * - Interactive Subcategory Accordion & Visual Tree View with glowing emerald stem & branch connectors
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

// Default enriched hierarchies to guarantee rich sub/child trees even before sheet syncs
const DEFAULT_CAT_HIERARCHIES = {
  "smartwatches": {
    name: "Smartwatches",
    id: "CAT-001",
    slug: "smartwatches",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
    subCats: {
      "AMOLED Watch": ["Fitness & GPS", "Metal Body", "Always-on Display", "Health Monitoring"],
      "Calling Watch": ["Bluetooth Calling", "HD Mic & Speaker", "Round Dial", "Square Curved"]
    }
  },
  "organic-health": {
    name: "Organic & Health",
    id: "CAT-002",
    slug: "organic-health",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    subCats: {
      "Herbal Honey": ["Sundarban Wild Honey", "Raw Natural Mustard", "Black Cumin Flower Honey"],
      "Supplements": ["Premium Grade Nutrition", "Organic Chia & Seeds", "Herbal Energy Tonics"]
    }
  },
  "tactical-lighting": {
    name: "Tactical Lighting",
    id: "CAT-003",
    slug: "tactical-lighting",
    image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&auto=format&fit=crop&q=80",
    subCats: {
      "LED Flashlight": ["High-Power Rechargeable", "Tactical Zoom Focus", "Waterproof Military Grade"],
      "Emergency Light": ["Solar Rechargeable", "Camping Lantern", "Portable Magnetic Worklight"]
    }
  },
  "kitchen-safety": {
    name: "Kitchen Safety",
    id: "CAT-004",
    slug: "kitchen-safety",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
    subCats: {
      "Gas Regulator": ["Automatic Safety Device", "LPG Pressure Meter Gauge", "Anti-Explosion Valve"],
      "Gas Accessories": ["Heavy Duty Safety Hose Pipe", "Gas Leak Detector", "Steel Clamp Fasteners"]
    }
  }
};

// Global interactive handlers for the Category Tree Page
if (typeof window !== 'undefined') {
  // Toggle individual sub-category tree branch
  window.toggleSubCategoryTree = function(treeId) {
    const branch = document.getElementById(treeId);
    const chevron = document.getElementById('chev-' + treeId);
    const card = branch ? branch.closest('.ct-subcat-card') : null;
    if (!branch) return;

    const isHidden = branch.classList.contains('hidden');
    if (isHidden) {
      branch.classList.remove('hidden');
      if (card) card.classList.add('ct-subcat-open');
      if (chevron) {
        chevron.style.transform = 'rotate(90deg)';
        chevron.classList.add('ct-chev-active');
      }
    } else {
      branch.classList.add('hidden');
      if (card) card.classList.remove('ct-subcat-open');
      if (chevron) {
        chevron.style.transform = 'rotate(0deg)';
        chevron.classList.remove('ct-chev-active');
      }
    }
  };

  // Expand all sub-category trees
  window.expandAllCategoryTrees = function() {
    document.querySelectorAll('.ct-page-root .subcat-tree-branch').forEach(function(b) {
      b.classList.remove('hidden');
    });
    document.querySelectorAll('.ct-page-root .ct-subcat-card').forEach(function(card) {
      card.classList.add('ct-subcat-open');
    });
    document.querySelectorAll('.ct-page-root .subcat-tree-chevron').forEach(function(c) {
      c.style.transform = 'rotate(90deg)';
      c.classList.add('ct-chev-active');
    });
  };

  // Collapse all sub-category trees
  window.collapseAllCategoryTrees = function() {
    document.querySelectorAll('.ct-page-root .subcat-tree-branch').forEach(function(b) {
      b.classList.add('hidden');
    });
    document.querySelectorAll('.ct-page-root .ct-subcat-card').forEach(function(card) {
      card.classList.remove('ct-subcat-open');
    });
    document.querySelectorAll('.ct-page-root .subcat-tree-chevron').forEach(function(c) {
      c.style.transform = 'rotate(0deg)';
      c.classList.remove('ct-chev-active');
    });
  };

  // Switch selected category in the main view
  window.selectCategoryTab = function(safeKey) {
    document.querySelectorAll('.ct-page-root .category-detail-pane').forEach(function(p) {
      p.classList.add('hidden');
    });
    document.querySelectorAll('.ct-page-root .cat-sidebar-card').forEach(function(s) {
      s.classList.remove('active-cat');
    });

    const targetPane = document.getElementById('pane-' + safeKey);
    if (targetPane) {
      targetPane.classList.remove('hidden');
    }

    const targetCard = document.getElementById('side-card-' + safeKey);
    if (targetCard) {
      targetCard.classList.add('active-cat');
    }

    if (window.innerWidth < 1024 && targetPane) {
      targetPane.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Live search filter in category sidebar
  window.filterSidebarCategories = function(query) {
    const q = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('.ct-page-root .cat-sidebar-card');
    const clearBtn = document.getElementById('ct-sidebar-search-clear');
    const countEl = document.getElementById('ct-sidebar-count');
    const emptyEl = document.getElementById('ct-sidebar-empty');

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
      countEl.textContent = visibleCount + ' টি';
    }
    if (emptyEl) {
      emptyEl.style.display = visibleCount === 0 ? 'flex' : 'none';
    }
  };

  // Reset sidebar filter search
  window.clearCategorySidebarSearch = function() {
    const input = document.getElementById('ct-sidebar-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    window.filterSidebarCategories('');
  };
}

// Helper to render child tree nodes
function renderChildNodes(children, catName, subName) {
  if (!children || children.length === 0) {
    return '<div class="ct-leaf-empty">🌿 এই সাব-ক্যাটাগরির সকল পণ্য সরাসরি অন্তর্ভুক্ত।</div>';
  }

  const itemsHtml = children.map(function(ch) {
    const countText = ch.count > 0 ? ' • ' + ch.count + ' টি পণ্য' : '';
    const linkUrl = '/products?cat=' + encodeURIComponent(catName) + '&sub=' + encodeURIComponent(subName) + '&child=' + encodeURIComponent(ch.name);

    return `
      <div class="tree-branch-node">
        <div class="tree-leaf-card">
          <div class="ct-leaf-left">
            <div class="ct-leaf-icon">🌿</div>
            <div class="ct-leaf-info">
              <div class="ct-leaf-name">${escapeHtml(ch.name)}</div>
              <div class="ct-leaf-meta">চাইল্ড ক্যাটাগরি${countText}</div>
            </div>
          </div>
          <a href="${linkUrl}" class="ct-btn-leaf">
            <span>পণ্য দেখুন</span>
            <span>→</span>
          </a>
        </div>
      </div>
    `;
  }).join('');

  return '<div class="tree-stem-container">' + itemsHtml + '</div>';
}

// Helper to render subcategories list
function renderSubCategories(subCategories, catName, catIdx) {
  if (!subCategories || subCategories.length === 0) {
    return `
      <div class="ct-empty-subcats">
        <div class="ct-empty-subcats-icon">📦</div>
        <div class="ct-empty-subcats-text">এই ক্যাটাগরিতে সরাসরি পণ্যসমূহ সাজানো রয়েছে।</div>
        <a href="/products?cat=${encodeURIComponent(catName)}" class="ct-btn-3d-primary">
          <span>🛍️</span>
          <span>পণ্যগুলো ব্রাউজ করুন →</span>
        </a>
      </div>
    `;
  }

  return subCategories.map(function(sub, sIdx) {
    const treeId = 'tree-item-' + catIdx + '-' + sIdx;
    const isDefaultOpen = (sIdx === 0);
    const chevRotation = isDefaultOpen ? 'rotate(90deg)' : 'rotate(0deg)';
    const chevActiveClass = isDefaultOpen ? ' ct-chev-active' : '';
    const openCardClass = isDefaultOpen ? ' ct-subcat-open' : '';
    const branchClass = isDefaultOpen ? '' : 'hidden';
    const subShopUrl = '/products?cat=' + encodeURIComponent(catName) + '&sub=' + encodeURIComponent(sub.name);
    const childHtml = renderChildNodes(sub.children, catName, sub.name);

    return `
      <div class="ct-subcat-card${openCardClass}">
        <div
          class="tree-subcat-header"
          onclick="window.toggleSubCategoryTree('${treeId}')"
        >
          <div class="ct-subcat-left">
            <span
              id="chev-${treeId}"
              class="subcat-tree-chevron${chevActiveClass}"
              style="transform: ${chevRotation};"
            >
              ▶
            </span>
            <div class="ct-subcat-folder">📁</div>
            <div class="ct-subcat-text">
              <h4 class="ct-subcat-title">${escapeHtml(sub.name)}</h4>
              <div class="ct-subcat-meta">
                <span class="ct-subcat-pill">${sub.count} টি পণ্য</span>
                <span class="ct-subcat-dot">•</span>
                <span class="ct-subcat-branch-pill">${sub.children.length} টি চাইল্ড শাখা</span>
              </div>
            </div>
          </div>

          <div class="ct-subcat-actions" onclick="event.stopPropagation();">
            <a href="${subShopUrl}" class="ct-btn-soft">
              <span>সাব-ক্যাটাগরিতে শপ</span>
              <span>→</span>
            </a>
          </div>
        </div>

        <div id="${treeId}" class="subcat-tree-branch ${branchClass}">
          ${childHtml}
        </div>
      </div>
    `;
  }).join('');
}

export async function renderCategoryPage(params = {}) {
  const safeParams = params || {};

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

  // Strict deduplication Map
  const catMap = new Map();

  // 1. Seed base default hierarchies
  Object.values(DEFAULT_CAT_HIERARCHIES).forEach(function(dh) {
    const key = dh.name.toLowerCase().trim();
    const subMap = new Map();
    Object.entries(dh.subCats).forEach(function([sName, childList]) {
      subMap.set(sName.toLowerCase().trim(), {
        name: sName,
        childCats: new Set(childList)
      });
    });

    catMap.set(key, {
      category: dh.name,
      catagory_id: dh.id,
      catagory_slug: dh.slug,
      category_image: dh.image,
      subCatsMap: subMap
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
        category_image: c.category_image,
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
      const subList = rawSub.replace(/\r/g, '').split(/[\n,]/).map(function(s) { return s.trim(); }).filter(Boolean);
      const childList = rawChild.replace(/\r/g, '').split(/[\n,]/).map(function(s) { return s.trim(); }).filter(Boolean);

      subList.forEach(function(sName) {
        const sKey = sName.toLowerCase();
        if (!catObj.subCatsMap.has(sKey)) {
          catObj.subCatsMap.set(sKey, {
            name: sName,
            childCats: new Set()
          });
        }
        const subObj = catObj.subCatsMap.get(sKey);
        childList.forEach(function(ch) { subObj.childCats.add(ch); });
      });
    }
  });

  // 3. Ingest Products data for exact matching sub and child associations
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
        category_image: p.thumbnail,
        subCatsMap: new Map()
      });
    }

    const catObj = catMap.get(key);
    const pSub = p.sub_category != null ? String(p.sub_category).trim() : '';
    const pChild = p.child_category != null ? String(p.child_category).trim() : '';

    if (pSub) {
      const sKey = pSub.toLowerCase();
      if (!catObj.subCatsMap.has(sKey)) {
        catObj.subCatsMap.set(sKey, {
          name: pSub,
          childCats: new Set()
        });
      }
      if (pChild) {
        catObj.subCatsMap.get(sKey).childCats.add(pChild);
      }
    }
  });

  // 4. Calculate counts and build final structure
  const categories = Array.from(catMap.values()).map(function(catObj, catIdx) {
    const matchingProds = products.filter(function(p) {
      return p && p.category && String(p.category).trim().toLowerCase() === catObj.category.toLowerCase();
    });

    let img = catObj.category_image;
    if ((!img || img.includes('photo-1579586337278-3befd40fd17a') || img.includes('jijistatic')) && matchingProds.length > 0 && matchingProds[0].thumbnail) {
      img = matchingProds[0].thumbnail;
    }

    const subCategoriesList = Array.from(catObj.subCatsMap.values()).map(function(subObj) {
      const subProds = matchingProds.filter(function(p) {
        return p && p.sub_category && String(p.sub_category).trim().toLowerCase() === subObj.name.toLowerCase();
      });

      const children = Array.from(subObj.childCats).map(function(chName) {
        const childProds = subProds.filter(function(p) {
          return p && p.child_category && String(p.child_category).trim().toLowerCase() === chName.toLowerCase();
        });
        return {
          name: chName,
          count: childProds.length
        };
      }).sort(function(a, b) { return b.count - a.count || a.name.localeCompare(b.name); });

      return {
        name: subObj.name,
        count: subProds.length,
        children: children
      };
    }).sort(function(a, b) { return b.count - a.count || a.name.localeCompare(b.name); });

    return {
      category: catObj.category,
      catagory_id: catObj.catagory_id || ('CAT-00' + (catIdx + 1)),
      catagory_slug: catObj.catagory_slug || catObj.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_image: img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      matchingCount: matchingProds.length,
      subCategories: subCategoriesList
    };
  }).sort(function(a, b) { return b.matchingCount - a.matchingCount || a.category.localeCompare(b.category); });

  // Aggregate summary statistics for Hero 3D cards
  const totalSubCategories = categories.reduce(function(sum, c) {
    return sum + c.subCategories.length;
  }, 0);
  const totalListedProducts = categories.reduce(function(sum, c) {
    return sum + c.matchingCount;
  }, 0);

  // Determine active category index safely
  const queryCat = String(safeParams.cat || safeParams.category || '').toLowerCase().trim();
  let activeIndex = 0;
  if (queryCat) {
    const foundIdx = categories.findIndex(function(c) {
      return c.category.toLowerCase() === queryCat || c.catagory_slug.toLowerCase() === queryCat;
    });
    if (foundIdx !== -1) activeIndex = foundIdx;
  }

  // Pre-generate sidebar items HTML
  const sidebarItemsHtml = categories.map(function(c, idx) {
    const safeKey = 'cat-node-' + idx;
    const isActive = (idx === activeIndex);
    const activeClass = isActive ? ' active-cat' : '';
    const shopUrl = '/products?cat=' + encodeURIComponent(c.category);

    return `
      <div
        id="side-card-${safeKey}"
        class="cat-sidebar-card${activeClass}"
        data-cat-name="${escapeHtml(c.category)}"
        data-cat-id="${escapeHtml(c.catagory_id)}"
        data-cat-slug="${escapeHtml(c.catagory_slug)}"
        onclick="window.selectCategoryTab('${safeKey}')"
      >
        <div class="ct-side-top">
          <div class="ct-side-thumb">
            <img
              src="${escapeHtml(c.category_image)}"
              alt="${escapeHtml(c.category)}"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';"
            />
          </div>
          <div class="ct-side-info">
            <div class="ct-side-badges">
              <span class="ct-id-chip ct-mono">${escapeHtml(c.catagory_id)}</span>
              <span class="ct-count-chip">${c.matchingCount} টি পণ্য</span>
            </div>
            <h3 class="ct-side-name">${escapeHtml(c.category)}</h3>
            <div class="ct-side-slug ct-mono">/${escapeHtml(c.catagory_slug)}</div>
          </div>
        </div>

        <div class="ct-side-footer">
          <span class="ct-side-subcount">
            সাব-ক্যাটাগরি: <strong>${c.subCategories.length}</strong>
          </span>
          <a
            href="${shopUrl}"
            class="ct-side-shop-btn"
            onclick="event.stopPropagation();"
          >
            <span>সকল পণ্য দেখুন</span>
            <span>→</span>
          </a>
        </div>
      </div>
    `;
  }).join('');

  // Pre-generate main content panes HTML
  const mainPanesHtml = categories.map(function(c, idx) {
    const safeKey = 'cat-node-' + idx;
    const isHidden = (idx !== activeIndex);
    const hiddenClass = isHidden ? ' hidden' : '';
    const shopUrl = '/products?cat=' + encodeURIComponent(c.category);
    const subCatsContent = renderSubCategories(c.subCategories, c.category, idx);
    const childTotal = c.subCategories.reduce(function(acc, s) { return acc + s.children.length; }, 0);

    return `
      <div id="pane-${safeKey}" class="category-detail-pane${hiddenClass}">
        <!-- Main 3D Category Display Card -->
        <section class="ct-card ct-featured-card">
          <div class="ct-featured-layout">
            <div class="ct-featured-thumb">
              <img
                src="${escapeHtml(c.category_image)}"
                alt="${escapeHtml(c.category)}"
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';"
              />
            </div>

            <div class="ct-featured-body">
              <div class="ct-featured-chips">
                <span class="ct-chip-emerald ct-mono">আইডি: ${escapeHtml(c.catagory_id)}</span>
                <span class="ct-chip-slate ct-mono">স্লাগ: /${escapeHtml(c.catagory_slug)}</span>
              </div>

              <h2 class="ct-featured-title">${escapeHtml(c.category)}</h2>

              <p class="ct-featured-count">
                <span>📦</span>
                <span>উক্ত ক্যাটাগরিতে মোট <strong>${c.matchingCount} টি পণ্য</strong> তালিকাভুক্ত আছে</span>
              </p>

              <div class="ct-featured-mini-stats">
                <span class="ct-mini-stat">📁 ${c.subCategories.length} টি সাব-ক্যাটাগরি</span>
                <span class="ct-mini-stat">🌿 ${childTotal} টি চাইল্ড শাখা</span>
              </div>

              <div class="ct-featured-cta-row">
                <a href="${shopUrl}" class="ct-btn-3d-primary">
                  <span>🛍️</span>
                  <span>${escapeHtml(c.category)} ক্যাটাগরিতে শপ করুন →</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Sub-category & Child-category Interactive 3D Tree Section -->
        <section class="ct-card ct-tree-card">
          <div class="ct-tree-header">
            <div class="ct-tree-head-left">
              <div class="ct-tree-head-icon">🌳</div>
              <div>
                <h3 class="ct-tree-title">সাব-ক্যাটাগরি ও চাইল্ড ক্যাটাগরি ট্রি ভিউ</h3>
                <p class="ct-tree-subtitle">
                  যেকোনো সাব-ক্যাটাগরির নামের উপর ক্লিক করুন — অসাধারণ ট্রি শাখায় চাইল্ড ক্যাটাগরিগুলো বিস্তার লাভ করবে
                </p>
              </div>
            </div>

            <div class="ct-tree-controls">
              <button
                type="button"
                class="ct-btn-soft"
                onclick="window.expandAllCategoryTrees()"
              >
                <span>➕</span>
                <span>সবগুলো খুলুন</span>
              </button>
              <button
                type="button"
                class="ct-btn-soft ct-btn-soft-rose"
                onclick="window.collapseAllCategoryTrees()"
              >
                <span>➖</span>
                <span>বন্ধ করুন</span>
              </button>
            </div>
          </div>

          <div class="ct-subcat-list">
            ${subCatsContent}
          </div>
        </section>
      </div>
    `;
  }).join('');

  return `
    <!-- Scoped 3D Professional Styles for Category Hub Page -->
    <style id="category-page-custom-styles">
      @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

      .ct-page-root {
        --ct-font: 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        --ct-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        --ct-emerald: #10b981;
        --ct-emerald-dark: #059669;
        --ct-emerald-deep: #047857;
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
        perspective: 1200px;
      }

      .ct-page-root *,
      .ct-page-root *::before,
      .ct-page-root *::after {
        font-family: var(--ct-font);
        box-sizing: border-box;
      }

      .ct-page-root .ct-mono {
        font-family: var(--ct-mono) !important;
      }

      .ct-page-root .hidden {
        display: none !important;
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

      @media (min-width: 640px) {
        .ct-page-root {
          padding: 24px 20px 110px;
        }
      }

      /* Keyframe Animations */
      @keyframes ctReveal {
        0% {
          opacity: 0;
          transform: translateY(18px) scale(0.985);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes ctBranchDrop {
        0% {
          opacity: 0;
          transform: translateY(-6px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes ctFloatOrb {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(-16px, 14px, 0) scale(1.08); }
      }

      @keyframes ctPulseDot {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.65);
        }
        50% {
          transform: scale(1.15);
          box-shadow: 0 0 0 7px rgba(52, 211, 153, 0);
        }
      }

      @keyframes ctShimmer {
        0% { transform: translateX(-120%) skewX(-20deg); }
        100% { transform: translateX(260%) skewX(-20deg); }
      }

      .ct-stack {
        display: flex;
        flex-direction: column;
        gap: 26px;
      }

      /* ==================== 1. 3D HERO BANNER ==================== */
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
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.14) inset,
          0 10px 0 -3px rgba(6, 78, 59, 0.55),
          0 26px 52px -14px rgba(2, 6, 23, 0.52);
        animation: ctReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @media (min-width: 768px) {
        .ct-hero {
          padding: 36px 36px;
        }
      }

      .ct-hero-orb-1 {
        position: absolute;
        top: -65px;
        right: -45px;
        width: 240px;
        height: 240px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.36) 0%, transparent 70%);
        filter: blur(32px);
        pointer-events: none;
        animation: ctFloatOrb 7s ease-in-out infinite;
      }

      .ct-hero-orb-2 {
        position: absolute;
        bottom: -75px;
        left: -40px;
        width: 220px;
        height: 220px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.24) 0%, transparent 70%);
        filter: blur(34px);
        pointer-events: none;
        animation: ctFloatOrb 9s ease-in-out infinite reverse;
      }

      .ct-hero-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
        background-size: 32px 32px;
        pointer-events: none;
        opacity: 0.65;
      }

      .ct-hero-inner {
        position: relative;
        z-index: 2;
      }

      .ct-hero-top {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }

      .ct-breadcrumb {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.14);
        font-size: 13px;
        color: #cbd5e1;
      }

      .ct-breadcrumb a {
        color: #6ee7b7;
        font-weight: 600;
        text-decoration: none;
        transition: color 0.16s ease;
      }

      .ct-breadcrumb a:hover {
        color: #ffffff;
        text-decoration: underline;
      }

      .ct-hero-badge {
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 16px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.16);
        border: 1px solid rgba(52, 211, 153, 0.44);
        color: #6ee7b7;
        font-size: 13px;
        font-weight: 700;
      }

      .ct-hero-badge::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 45%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
        animation: ctShimmer 4.5s ease-in-out infinite;
      }

      .ct-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #34d399;
        animation: ctPulseDot 2s infinite;
      }

      .ct-hero-title {
        font-size: 25px;
        line-height: 1.28;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 10px;
        letter-spacing: -0.015em;
        text-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
      }

      @media (min-width: 640px) {
        .ct-hero-title {
          font-size: 34px;
        }
      }

      .ct-hero-subtitle {
        font-size: 15px;
        line-height: 1.75;
        color: #cbd5e1;
        max-width: 740px;
        margin: 0 0 22px;
      }

      .ct-hero-stats {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 12px;
      }

      @media (min-width: 640px) {
        .ct-hero-stats {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .ct-stat-card {
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 13px 16px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.13);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.12) inset,
          0 8px 20px rgba(0, 0, 0, 0.22);
        backdrop-filter: blur(10px);
        transition: transform 0.22s ease, border-color 0.22s ease;
      }

      .ct-stat-card:hover {
        transform: translateY(-3px);
        border-color: rgba(52, 211, 153, 0.45);
      }

      .ct-stat-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.28), rgba(6, 78, 59, 0.45));
        border: 1px solid rgba(52, 211, 153, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }

      .ct-stat-val {
        font-size: 17px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.25;
      }

      .ct-stat-lbl {
        font-size: 12.5px;
        color: #94a3b8;
        line-height: 1.35;
      }

      /* ==================== 2. TWO-COLUMN LAYOUT ==================== */
      .ct-layout-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 24px;
        align-items: start;
      }

      @media (min-width: 1024px) {
        .ct-layout-grid {
          grid-template-columns: 365px minmax(0, 1fr);
          gap: 28px;
        }
      }

      /* Base 3D Card */
      .ct-card {
        background: var(--ct-surface);
        border: 1px solid var(--ct-border);
        border-radius: 24px;
        padding: 22px 20px;
        box-shadow: var(--ct-shadow-card);
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
      }

      @media (min-width: 640px) {
        .ct-card {
          padding: 26px 28px;
        }
      }

      /* ==================== 3. LEFT 3D SIDEBAR ==================== */
      .ct-sidebar {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px 18px;
      }

      @media (min-width: 1024px) {
        .ct-sidebar {
          position: sticky;
          top: 24px;
        }
      }

      .ct-sidebar-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 14px;
        border-bottom: 1.5px solid var(--ct-border);
      }

      .ct-sidebar-title {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 17px;
        font-weight: 700;
        color: var(--ct-text-main);
        margin: 0;
      }

      .ct-sidebar-count {
        padding: 4px 11px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: var(--ct-emerald-dark);
        font-size: 12.5px;
        font-weight: 700;
      }

      .dark .ct-sidebar-count {
        color: #34d399;
      }

      .ct-search-wrap {
        position: relative;
        width: 100%;
      }

      .ct-search-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        pointer-events: none;
        opacity: 0.75;
      }

      .ct-search-input {
        width: 100%;
        padding: 11px 36px 11px 38px;
        border-radius: 14px;
        border: 1.5px solid var(--ct-border);
        background: var(--ct-surface-soft);
        color: var(--ct-text-main);
        font-size: 14px;
        font-weight: 500;
        outline: none;
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04) inset;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .ct-search-input::placeholder {
        color: var(--ct-text-muted);
      }

      .ct-search-input:focus {
        border-color: #10b981;
        background: var(--ct-surface);
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.16);
      }

      .ct-search-clear {
        position: absolute;
        right: 9px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: none;
        background: rgba(148, 163, 184, 0.24);
        color: var(--ct-text-main);
        font-size: 14px;
        font-weight: 700;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.16s ease, color 0.16s ease;
      }

      .ct-search-clear:hover {
        background: #ef4444;
        color: #ffffff;
      }

      .ct-sidebar-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 640px;
        overflow-y: auto;
        padding: 2px 4px 6px 2px;
        scrollbar-width: thin;
        scrollbar-color: rgba(16, 185, 129, 0.35) transparent;
      }

      .ct-sidebar-list::-webkit-scrollbar {
        width: 6px;
      }
      .ct-sidebar-list::-webkit-scrollbar-thumb {
        background: rgba(16, 185, 129, 0.35);
        border-radius: 999px;
      }

      /* 3D Sidebar Category Card */
      .cat-sidebar-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 14px;
        border-radius: 18px;
        background: var(--ct-surface-soft);
        border: 1.5px solid var(--ct-border);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 4px 0 -1px var(--ct-border-3d);
        cursor: pointer;
        user-select: none;
        transition:
          transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          background 0.2s ease;
      }

      .dark .cat-sidebar-card {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.05) inset,
          0 4px 0 -1px #020617;
      }

      .cat-sidebar-card:hover {
        transform: translateY(-2px);
        border-color: rgba(16, 185, 129, 0.6);
        box-shadow:
          0 5px 0 -1px rgba(16, 185, 129, 0.26),
          0 12px 20px -8px rgba(16, 185, 129, 0.18);
      }

      .cat-sidebar-card.active-cat {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, var(--ct-surface) 100%);
        border-color: #10b981;
        border-left: 5px solid #10b981;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.85) inset,
          0 5px 0 -1px rgba(16, 185, 129, 0.36),
          0 14px 26px -8px rgba(16, 185, 129, 0.24);
      }

      .dark .cat-sidebar-card.active-cat {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, #0f172a 100%);
      }

      .ct-side-top {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .ct-side-thumb {
        width: 58px;
        height: 58px;
        border-radius: 14px;
        overflow: hidden;
        background: var(--ct-surface);
        border: 1.5px solid var(--ct-border);
        flex-shrink: 0;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      }

      .ct-side-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
      }

      .cat-sidebar-card:hover .ct-side-thumb img {
        transform: scale(1.08);
      }

      .ct-side-info {
        flex: 1;
        min-width: 0;
      }

      .ct-side-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
      }

      .ct-id-chip {
        padding: 2px 7px;
        border-radius: 6px;
        background: var(--ct-surface);
        border: 1px solid var(--ct-border);
        color: var(--ct-text-muted);
        font-size: 10.5px;
        font-weight: 700;
      }

      .ct-count-chip {
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.14);
        color: var(--ct-emerald-dark);
        font-size: 11px;
        font-weight: 700;
      }

      .dark .ct-count-chip {
        color: #6ee7b7;
      }

      .ct-side-name {
        font-size: 15px;
        font-weight: 700;
        color: var(--ct-text-main);
        margin: 0 0 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ct-side-slug {
        font-size: 11.5px;
        color: var(--ct-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .ct-side-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-top: 10px;
        border-top: 1px dashed var(--ct-border);
      }

      .ct-side-subcount {
        font-size: 12.5px;
        color: var(--ct-text-muted);
      }

      .ct-side-subcount strong {
        color: var(--ct-text-main);
      }

      .ct-side-shop-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 10px;
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff !important;
        font-size: 12px;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
        box-shadow: 0 3px 0 #047857;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }

      .ct-side-shop-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 0 #047857, 0 6px 14px rgba(16, 185, 129, 0.32);
      }

      .ct-side-shop-btn:active {
        transform: translateY(1px);
        box-shadow: 0 1px 0 #047857;
      }

      .ct-sidebar-empty {
        display: none;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 8px;
        padding: 26px 14px;
        border-radius: 16px;
        background: var(--ct-surface-soft);
        border: 1.5px dashed rgba(16, 185, 129, 0.4);
        font-size: 13.5px;
        color: var(--ct-text-muted);
      }

      /* ==================== 4. RIGHT DETAIL PANE ==================== */
      .ct-main-pane {
        min-width: 0;
      }

      .category-detail-pane {
        display: flex;
        flex-direction: column;
        gap: 24px;
        animation: ctReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      /* Featured 3D Main Category Card */
      .ct-featured-card {
        background: linear-gradient(135deg, var(--ct-surface) 0%, var(--ct-surface-soft) 100%);
        border: 1.5px solid rgba(16, 185, 129, 0.28);
      }

      .ct-featured-layout {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 22px;
      }

      @media (min-width: 640px) {
        .ct-featured-layout {
          flex-direction: row;
          align-items: center;
          gap: 26px;
        }
      }

      .ct-featured-thumb {
        width: 148px;
        height: 148px;
        border-radius: 22px;
        overflow: hidden;
        background: var(--ct-surface);
        border: 3px solid rgba(16, 185, 129, 0.32);
        box-shadow:
          0 8px 0 -2px rgba(16, 185, 129, 0.2),
          0 18px 32px -10px rgba(15, 23, 42, 0.2);
        flex-shrink: 0;
      }

      .ct-featured-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .ct-featured-card:hover .ct-featured-thumb img {
        transform: scale(1.07);
      }

      .ct-featured-body {
        flex: 1;
        min-width: 0;
        text-align: center;
      }

      @media (min-width: 640px) {
        .ct-featured-body {
          text-align: left;
        }
      }

      .ct-featured-chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin-bottom: 10px;
      }

      @media (min-width: 640px) {
        .ct-featured-chips {
          justify-content: flex-start;
        }
      }

      .ct-chip-emerald {
        padding: 4px 11px;
        border-radius: 8px;
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.35);
        color: var(--ct-emerald-dark);
        font-size: 12px;
        font-weight: 700;
      }

      .dark .ct-chip-emerald {
        color: #6ee7b7;
      }

      .ct-chip-slate {
        padding: 4px 11px;
        border-radius: 8px;
        background: var(--ct-surface);
        border: 1px solid var(--ct-border);
        color: var(--ct-text-muted);
        font-size: 12px;
        font-weight: 600;
      }

      .ct-featured-title {
        font-size: 26px;
        line-height: 1.25;
        font-weight: 700;
        color: var(--ct-text-main);
        margin: 0 0 8px;
      }

      @media (min-width: 640px) {
        .ct-featured-title {
          font-size: 31px;
        }
      }

      .ct-featured-count {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 14.5px;
        color: var(--ct-emerald-dark);
        font-weight: 600;
        margin: 0 0 12px;
      }

      .dark .ct-featured-count {
        color: #34d399;
      }

      .ct-featured-mini-stats {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin-bottom: 16px;
      }

      @media (min-width: 640px) {
        .ct-featured-mini-stats {
          justify-content: flex-start;
        }
      }

      .ct-mini-stat {
        padding: 4px 12px;
        border-radius: 999px;
        background: var(--ct-surface);
        border: 1px solid var(--ct-border);
        font-size: 12.5px;
        font-weight: 600;
        color: var(--ct-text-body);
      }

      .ct-featured-cta-row {
        display: flex;
        justify-content: center;
      }

      @media (min-width: 640px) {
        .ct-featured-cta-row {
          justify-content: flex-start;
        }
      }

      /* 3D Buttons */
      .ct-btn-3d-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 11px 22px;
        border-radius: 14px;
        border: 1px solid #34d399;
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff !important;
        font-size: 14.5px;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.35) inset,
          0 5px 0 #047857,
          0 12px 22px rgba(16, 185, 129, 0.32);
        transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
      }

      .ct-btn-3d-primary:hover {
        transform: translateY(-2px);
        background: linear-gradient(180deg, #34d399 0%, #059669 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.4) inset,
          0 6px 0 #047857,
          0 16px 28px rgba(16, 185, 129, 0.38);
      }

      .ct-btn-3d-primary:active {
        transform: translateY(2px);
        box-shadow: 0 2px 0 #047857;
      }

      .ct-btn-soft {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 11px;
        font-size: 12.5px;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        background: var(--ct-surface);
        color: var(--ct-text-body) !important;
        border: 1px solid var(--ct-border);
        box-shadow: 0 3px 0 var(--ct-border-3d);
        transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
      }

      .ct-btn-soft:hover {
        transform: translateY(-1px);
        border-color: #10b981;
        color: var(--ct-emerald-dark) !important;
        box-shadow: 0 4px 0 rgba(16, 185, 129, 0.3);
      }

      .dark .ct-btn-soft:hover {
        color: #34d399 !important;
      }

      .ct-btn-soft:active {
        transform: translateY(1px);
        box-shadow: 0 1px 0 var(--ct-border-3d);
      }

      .ct-btn-soft-rose:hover {
        border-color: #f43f5e;
        color: #e11d48 !important;
        box-shadow: 0 4px 0 rgba(244, 63, 94, 0.25);
      }

      .dark .ct-btn-soft-rose:hover {
        color: #fda4af !important;
      }

      /* ==================== 5. INTERACTIVE 3D TREE VIEW ==================== */
      .ct-tree-header {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding-bottom: 18px;
        margin-bottom: 20px;
        border-bottom: 1.5px solid var(--ct-border);
      }

      @media (min-width: 640px) {
        .ct-tree-header {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .ct-tree-head-left {
        display: flex;
        align-items: flex-start;
        gap: 13px;
      }

      .ct-tree-head-icon {
        width: 46px;
        height: 46px;
        border-radius: 14px;
        background: linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%);
        border: 1px solid rgba(16, 185, 129, 0.35);
        box-shadow: 0 4px 0 rgba(16, 185, 129, 0.22);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
      }

      .dark .ct-tree-head-icon {
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.24), rgba(6, 78, 59, 0.5));
      }

      .ct-tree-title {
        font-size: 19px;
        font-weight: 700;
        color: var(--ct-text-main);
        margin: 0 0 4px;
      }

      .ct-tree-subtitle {
        font-size: 13.5px;
        line-height: 1.65;
        color: var(--ct-text-muted);
        margin: 0;
      }

      .ct-tree-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        flex-shrink: 0;
      }

      .ct-subcat-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* 3D Sub-Category Accordion Card */
      .ct-subcat-card {
        border-radius: 18px;
        border: 1.5px solid var(--ct-border);
        background: var(--ct-surface-soft);
        overflow: hidden;
        box-shadow: 0 4px 0 -1px var(--ct-border-3d);
        transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
      }

      .dark .ct-subcat-card {
        box-shadow: 0 4px 0 -1px #020617;
      }

      .ct-subcat-card:hover {
        border-color: rgba(16, 185, 129, 0.55);
      }

      .ct-subcat-card.ct-subcat-open {
        border-color: rgba(16, 185, 129, 0.65);
        box-shadow:
          0 5px 0 -1px rgba(16, 185, 129, 0.22),
          0 12px 24px -10px rgba(16, 185, 129, 0.16);
      }

      .tree-subcat-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 18px;
        background: var(--ct-surface);
        cursor: pointer;
        user-select: none;
        transition: background 0.18s ease;
      }

      .tree-subcat-header:hover {
        background: rgba(16, 185, 129, 0.04);
      }

      .ct-subcat-left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        flex: 1 1 220px;
      }

      .subcat-tree-chevron {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: var(--ct-surface-soft);
        border: 1px solid var(--ct-border);
        color: var(--ct-text-muted);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
        transition: transform 0.22s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      }

      .subcat-tree-chevron.ct-chev-active {
        background: rgba(16, 185, 129, 0.16);
        border-color: rgba(16, 185, 129, 0.45);
        color: #059669;
      }

      .dark .subcat-tree-chevron.ct-chev-active {
        color: #34d399;
      }

      .ct-subcat-folder {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        background: linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%);
        border: 1px solid rgba(16, 185, 129, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 17px;
        flex-shrink: 0;
      }

      .dark .ct-subcat-folder {
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.22), rgba(6, 78, 59, 0.45));
      }

      .ct-subcat-text {
        min-width: 0;
        flex: 1;
      }

      .ct-subcat-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--ct-text-main);
        margin: 0 0 4px;
        line-height: 1.35;
      }

      .ct-subcat-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 7px;
        font-size: 12.5px;
      }

      .ct-subcat-pill {
        color: var(--ct-text-muted);
        font-weight: 600;
      }

      .ct-subcat-dot {
        color: var(--ct-border-3d);
      }

      .ct-subcat-branch-pill {
        color: var(--ct-emerald-dark);
        font-weight: 700;
      }

      .dark .ct-subcat-branch-pill {
        color: #34d399;
      }

      .ct-subcat-actions {
        flex-shrink: 0;
      }

      /* Tree Branch Container with Glowing Stem & Curved Branch Connectors */
      .subcat-tree-branch {
        padding: 18px 18px 20px 22px;
        border-top: 1.5px solid var(--ct-border);
        background: var(--ct-surface-soft);
        animation: ctBranchDrop 0.24s ease-out both;
      }

      .tree-stem-container {
        position: relative;
        padding-left: 26px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .tree-stem-container::before {
        content: '';
        position: absolute;
        left: 6px;
        top: 0;
        bottom: 26px;
        width: 3px;
        border-radius: 999px;
        background: linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.35) 100%);
      }

      .tree-branch-node {
        position: relative;
      }

      .tree-branch-node::before {
        content: '';
        position: absolute;
        left: -20px;
        top: 50%;
        width: 20px;
        height: 14px;
        transform: translateY(-100%);
        border-left: 3px solid rgba(16, 185, 129, 0.65);
        border-bottom: 3px solid rgba(16, 185, 129, 0.65);
        border-bottom-left-radius: 10px;
      }

      .tree-leaf-card {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 13px 16px;
        border-radius: 14px;
        background: var(--ct-surface);
        border: 1px solid var(--ct-border);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 3px 0 -1px var(--ct-border-3d);
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .dark .tree-leaf-card {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.04) inset,
          0 3px 0 -1px #020617;
      }

      .tree-leaf-card:hover {
        transform: translateX(4px);
        border-color: #10b981;
        box-shadow:
          0 4px 0 -1px rgba(16, 185, 129, 0.26),
          0 10px 20px -8px rgba(16, 185, 129, 0.18);
      }

      .ct-leaf-left {
        display: flex;
        align-items: center;
        gap: 11px;
        min-width: 0;
        flex: 1 1 180px;
      }

      .ct-leaf-icon {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }

      .ct-leaf-info {
        min-width: 0;
      }

      .ct-leaf-name {
        font-size: 14.5px;
        font-weight: 700;
        color: var(--ct-text-main);
        line-height: 1.35;
      }

      .ct-leaf-meta {
        font-size: 12px;
        color: var(--ct-text-muted);
      }

      .ct-btn-leaf {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        border-radius: 10px;
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff !important;
        font-size: 12.5px;
        font-weight: 700;
        text-decoration: none;
        white-space: nowrap;
        box-shadow: 0 3px 0 #047857;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }

      .ct-btn-leaf:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 0 #047857, 0 8px 16px rgba(16, 185, 129, 0.3);
      }

      .ct-btn-leaf:active {
        transform: translateY(1px);
        box-shadow: 0 1px 0 #047857;
      }

      .ct-leaf-empty {
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--ct-surface);
        border: 1px dashed var(--ct-border);
        font-size: 13.5px;
        color: var(--ct-text-muted);
      }

      .ct-empty-subcats {
        padding: 34px 20px;
        border-radius: 18px;
        text-align: center;
        background: var(--ct-surface-soft);
        border: 1.5px dashed rgba(16, 185, 129, 0.35);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .ct-empty-subcats-icon {
        font-size: 36px;
        line-height: 1;
      }

      .ct-empty-subcats-text {
        font-size: 14.5px;
        color: var(--ct-text-body);
        font-weight: 500;
      }
    </style>

    <div class="ct-page-root">
      <div class="ct-stack">

        <!-- 1. 3D Luxury Category Hub Hero -->
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
                <span>🏷️ মোট ${categories.length}টি ইউনিক ক্যাটাগরি</span>
              </div>
            </div>

            <h1 class="ct-hero-title">
              📂 সকল পণ্য ক্যাটাগরি ও ট্রি ভিউ (Category Hub)
            </h1>

            <p class="ct-hero-subtitle">
              সাইডবার থেকে ক্যাটাগরি নির্বাচন করুন এবং সাব-ক্যাটাগরির উপর ক্লিক করে চাইল্ড ক্যাটাগরি ট্রি এক্সপ্লোর করুন।
            </p>

            <!-- 3D Summary Stat Cards -->
            <div class="ct-hero-stats">
              <div class="ct-stat-card">
                <div class="ct-stat-icon">🏷️</div>
                <div>
                  <div class="ct-stat-val">${categories.length}টি মূল ক্যাটাগরি</div>
                  <div class="ct-stat-lbl">১০০% ইউনিক ও গোছানো তালিকা</div>
                </div>
              </div>
              <div class="ct-stat-card">
                <div class="ct-stat-icon">🌳</div>
                <div>
                  <div class="ct-stat-val">${totalSubCategories}টি সাব-ক্যাটাগরি</div>
                  <div class="ct-stat-lbl">ইন্টারেক্টিভ চাইল্ড ট্রি নেভিগেশন</div>
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

        <!-- 2. Main Layout: Left 3D Sidebar + Right 3D Detail & Tree Pane -->
        <div class="ct-layout-grid">

          <!-- LEFT SIDEBAR -->
          <aside class="ct-card ct-sidebar">
            <div class="ct-sidebar-head">
              <h2 class="ct-sidebar-title">
                <span>📁</span>
                <span>ক্যাটাগরি সাইডবার</span>
              </h2>
              <span class="ct-sidebar-count" id="ct-sidebar-count">
                ${categories.length} টি
              </span>
            </div>

            <div class="ct-search-wrap">
              <span class="ct-search-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                id="ct-sidebar-search-input"
                placeholder="ক্যাটাগরি ফিল্টার করুন..."
                class="ct-search-input"
                oninput="window.filterSidebarCategories(this.value)"
              />
              <button
                type="button"
                id="ct-sidebar-search-clear"
                class="ct-search-clear"
                aria-label="ফিল্টার মুছুন"
                onclick="window.clearCategorySidebarSearch()"
              >×</button>
            </div>

            <div id="sidebar-categories-list" class="ct-sidebar-list">
              ${sidebarItemsHtml}

              <div id="ct-sidebar-empty" class="ct-sidebar-empty">
                <span style="font-size:28px;">🔎</span>
                <span>কোনো ক্যাটাগরি পাওয়া যায়নি</span>
                <button type="button" class="ct-btn-soft" onclick="window.clearCategorySidebarSearch()">
                  ↺ সব দেখুন
                </button>
              </div>
            </div>
          </aside>

          <!-- RIGHT CONTENT PANE -->
          <main class="ct-main-pane">
            ${mainPanesHtml}
          </main>

        </div>

      </div>
    </div>
  `;
}
