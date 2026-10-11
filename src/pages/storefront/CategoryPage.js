/**
 * DREAM CART BD — ALL CATEGORIES & TREE HIERARCHY PAGE (CategoryPage.js)
 * Implements user requirements:
 * - Dedicated Category Sidebar listing all categories vertically (image, product count, ID, slug, shop button)
 * - Strict 100% deduplication: No category name appears twice!
 * - Main Category display card: Name, image, slug, ID, product count, and shopping button.
 * - Subcategory list stacked vertically; clicking on a subcategory expands an extraordinary Tree View of child categories.
 * - Rich CSS card animations, glowing borders, tree stem connectors, and responsive design.
 */

import { apiClient, INITIAL_CATEGORIES } from '../../api/client.js';

// Safe HTML escaper (prevents XSS & syntax breaks)
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
    if (!branch) return;

    const isHidden = branch.classList.contains('hidden');
    if (isHidden) {
      branch.classList.remove('hidden');
      if (chevron) {
        chevron.style.transform = 'rotate(90deg)';
        chevron.classList.add('text-emerald-600');
      }
    } else {
      branch.classList.add('hidden');
      if (chevron) {
        chevron.style.transform = 'rotate(0deg)';
        chevron.classList.remove('text-emerald-600');
      }
    }
  };

  // Expand all sub-category trees for active category
  window.expandAllCategoryTrees = function() {
    document.querySelectorAll('.subcat-tree-branch').forEach(b => {
      b.classList.remove('hidden');
    });
    document.querySelectorAll('.subcat-tree-chevron').forEach(c => {
      c.style.transform = 'rotate(90deg)';
      c.classList.add('text-emerald-600');
    });
  };

  // Collapse all sub-category trees for active category
  window.collapseAllCategoryTrees = function() {
    document.querySelectorAll('.subcat-tree-branch').forEach(b => {
      b.classList.add('hidden');
    });
    document.querySelectorAll('.subcat-tree-chevron').forEach(c => {
      c.style.transform = 'rotate(0deg)';
      c.classList.remove('text-emerald-600');
    });
  };

  // Switch selected category in the main view
  window.selectCategoryTab = function(safeKey) {
    // Hide all category panes
    document.querySelectorAll('.category-detail-pane').forEach(p => {
      p.classList.add('hidden');
    });

    // Unhighlight all sidebar items
    document.querySelectorAll('.cat-sidebar-card').forEach(s => {
      s.classList.remove('active-cat');
    });

    // Show target pane
    const targetPane = document.getElementById('pane-' + safeKey);
    if (targetPane) {
      targetPane.classList.remove('hidden');
    }

    // Highlight target sidebar card
    const targetCard = document.getElementById('side-card-' + safeKey);
    if (targetCard) {
      targetCard.classList.add('active-cat');
    }

    // On mobile, scroll smoothly to the main pane
    if (window.innerWidth < 1024 && targetPane) {
      targetPane.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Live search filter in category sidebar
  window.filterSidebarCategories = function(query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('.cat-sidebar-card').forEach(card => {
      const name = (card.getAttribute('data-cat-name') || '').toLowerCase();
      const id = (card.getAttribute('data-cat-id') || '').toLowerCase();
      const slug = (card.getAttribute('data-cat-slug') || '').toLowerCase();

      if (!q || name.includes(q) || id.includes(q) || slug.includes(q)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };
}

export async function renderCategoryPage(params = {}) {
  const safeParams = params || {};

  // Fetch fresh categories and products in parallel
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

  // Map for strict deduplication: Key = normalized category name (lower-cased)
  const catMap = new Map();

  // 1. Seed base default hierarchies
  Object.values(DEFAULT_CAT_HIERARCHIES).forEach(dh => {
    const key = dh.name.toLowerCase().trim();
    const subMap = new Map();
    Object.entries(dh.subCats).forEach(([sName, childList]) => {
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
  rawCategories.forEach((c) => {
    if (!c) return;
    const rawName = String(c.category || '').trim();
    if (!rawName || rawName.toLowerCase() === 'test id' || rawName.toLowerCase() === 'category') return;

    const key = rawName.toLowerCase();
    if (!catMap.has(key)) {
      catMap.set(key, {
        category: rawName,
        catagory_id: c.catagory_id || `CAT-00${catMap.size + 1}`,
        catagory_slug: c.catagory_slug || rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category_image: c.category_image,
        subCatsMap: new Map()
      });
    }

    const catObj = catMap.get(key);
    if (c.category_image && !catObj.category_image) {
      catObj.category_image = c.category_image;
    }

    // Safely parse subcategories and child categories (protect against non-string values)
    const rawSub = c.sub_category != null ? String(c.sub_category) : '';
    const rawChild = (c.chail_category || c.child_category) != null ? String(c.chail_category || c.child_category) : '';

    if (rawSub) {
      const subList = rawSub.split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
      const childList = rawChild.split(/[,|\n]/).map(s => s.trim()).filter(Boolean);

      subList.forEach(sName => {
        const sKey = sName.toLowerCase();
        if (!catObj.subCatsMap.has(sKey)) {
          catObj.subCatsMap.set(sKey, {
            name: sName,
            childCats: new Set()
          });
        }
        const subObj = catObj.subCatsMap.get(sKey);
        childList.forEach(ch => subObj.childCats.add(ch));
      });
    }
  });

  // 3. Ingest Products data for exact matching sub and child associations
  products.forEach(p => {
    if (!p) return;
    const pCat = String(p.category || '').trim();
    if (!pCat || pCat.toLowerCase() === 'test id') return;

    const key = pCat.toLowerCase();
    if (!catMap.has(key)) {
      catMap.set(key, {
        category: pCat,
        catagory_id: `CAT-00${catMap.size + 1}`,
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
  const categories = Array.from(catMap.values()).map((catObj, catIdx) => {
    const matchingProds = products.filter(p => 
      p && p.category && String(p.category).trim().toLowerCase() === catObj.category.toLowerCase()
    );

    // Prefer product image if category image missing
    let img = catObj.category_image;
    if ((!img || img.includes('photo-1579586337278-3befd40fd17a') || img.includes('jijistatic')) && matchingProds.length > 0 && matchingProds[0].thumbnail) {
      img = matchingProds[0].thumbnail;
    }

    // Build structured subcategories list
    const subCategoriesList = Array.from(catObj.subCatsMap.values()).map(subObj => {
      const subProds = matchingProds.filter(p => 
        p && p.sub_category && String(p.sub_category).trim().toLowerCase() === subObj.name.toLowerCase()
      );

      const children = Array.from(subObj.childCats).map(chName => {
        const childProds = subProds.filter(p => 
          p && p.child_category && String(p.child_category).trim().toLowerCase() === chName.toLowerCase()
        );
        return {
          name: chName,
          count: childProds.length
        };
      }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

      return {
        name: subObj.name,
        count: subProds.length,
        children: children
      };
    }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return {
      category: catObj.category,
      catagory_id: catObj.catagory_id || `CAT-00${catIdx + 1}`,
      catagory_slug: catObj.catagory_slug || catObj.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_image: img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      matchingCount: matchingProds.length,
      subCategories: subCategoriesList
    };
  }).sort((a, b) => b.matchingCount - a.matchingCount || a.category.localeCompare(b.category));

  // Determine which category is active by default
  const queryCat = String(safeParams.cat || safeParams.category || '').toLowerCase().trim();
  let activeIndex = 0;
  if (queryCat) {
    const foundIdx = categories.findIndex(c => 
      c.category.toLowerCase() === queryCat || c.catagory_slug.toLowerCase() === queryCat
    );
    if (foundIdx !== -1) activeIndex = foundIdx;
  }

  return `
    <div class="space-y-8 pb-24 max-w-7xl mx-auto">
      
      <!-- Top Page Header -->
      <div class="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <a href="/" class="hover:text-emerald-600 transition">হোম</a>
              <span>/</span>
              <span class="text-slate-700 dark:text-slate-300 font-bold">ক্যাটাগরি সমূহ</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>📂</span> সকল পণ্য ক্যাটাগরি ও ট্রি ভিউ (Category Hub)
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              সাইডবার থেকে ক্যাটাগরি নির্বাচন করুন এবং সাব-ক্যাটাগরির উপর ক্লিক করে চাইল্ড ক্যাটাগরি ট্রি এক্সপ্লোর করুন
            </p>
          </div>

          <!-- Total Categories Badge -->
          <div class="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-3.5 py-2 shadow-xs self-start sm:self-center">
            <span class="text-base">🏷️</span>
            <div class="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              মোট <strong>${categories.length}টি</strong> ইউনিক ক্যাটাগরি
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout: Left Sidebar + Right Content Pane -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- ========================================================================= -->
        <!-- LEFT SIDEBAR: All Categories Listed Vertically (একটার নিচে একটা)         -->
        <!-- ========================================================================= -->
        <aside class="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4 lg:sticky lg:top-6">
          
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>📁</span> ক্যাটাগরি সাইডবার
            </h2>
            <span class="text-[11px] font-bold text-slate-400">
              ${categories.length} টি
            </span>
          </div>

          <!-- Quick Live Filter in Sidebar -->
          <div class="relative">
            <input 
              type="text" 
              placeholder="ক্যাটাগরি ফিল্টার করুন..." 
              class="form-control text-xs w-full py-2 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none text-slate-900 dark:text-white"
              oninput="window.filterSidebarCategories(this.value)"
            />
            <span class="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
          </div>

          <!-- Vertical Stack of Category Cards (একটার নিচে একটা) -->
          <div id="sidebar-categories-list" class="space-y-3 max-h-[640px] overflow-y-auto pr-1 no-scrollbar">
            ${categories.map((c, idx) => {
              const safeKey = 'cat-node-' + idx;
              const isActive = (idx === activeIndex);

              return `
                <div 
                  id="side-card-${safeKey}"
                  class="cat-sidebar-card card-stagger-${(idx \% 6) + 1}${isActive ? 'active-cat' : ''} bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-3.5 flex flex-col justify-between space-y-3 select-none"
                  data-cat-name="${escapeHtml(c.category)}"
                  data-cat-id="${c.catagory_id}"
                  data-cat-slug="${c.catagory_slug}"
                  onclick="window.selectCategoryTab('${safeKey}')"
                >
                  <div class="flex items-center gap-3">
                    <!-- Category Image -->
                    <div class="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-shrink-0 relative shadow-2xs">
                      <img 
                        src="${c.category_image}" 
                        alt="${escapeHtml(c.category)}" 
                        class="w-full h-full object-cover"
                        onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';"
                      />
                    </div>

                    <!-- Category Details -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap mb-0.5">
                        <span class="text-[9px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.2 rounded">
                          ${c.catagory_id}
                        </span>
                        <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          ${c.matchingCount} টি পণ্য
                        </span>
                      </div>
                      <h3 class="text-xs font-black text-slate-900 dark:text-white truncate">
                        ${escapeHtml(c.category)}
                      </h3>
                      <div class="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                        /${c.catagory_slug}
                      </div>
                    </div>
                  </div>

                  <!-- Direct Shopping / View All Products Button -->
                  <div class="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      সাব-ক্যাটাগরি: <strong>${c.subCategories.length}</strong>
                    </span>
                    <a 
                      href="/products?cat=${encodeURIComponent(c.category)}"
                      class="btn-primary py-1 px-3 text-[10px] font-bold rounded-lg shadow-xs inline-flex items-center gap-1"
                      onclick="event.stopPropagation();"
                    >
                      <span>সকল পণ্য দেখুন</span> →
                    </a>
                  </div>
                </div>
              `;
            }).join("")}
          </div>

        </aside>

        <!-- ========================================================================= -->
        <!-- RIGHT CONTENT PANE: Main Category Info + Tree View                        -->
        <!-- ========================================================================= -->
        <main class="lg:col-span-8 space-y-6">
          
          ${categories.map((c, idx) => {
            const safeKey = 'cat-node-' + idx;
            const isHidden = (idx !== activeIndex);

            return `
              <div 
                id="pane-${safeKey}" 
                class="category-detail-pane ${isHidden ? 'hidden' : ''} space-y-6 animate-fadeIn"
              >
                
                <!-- 1. Main Category Display Card (নাম, ছবি, স্লাগ, আইডি, পণ্যসংখ্যা, শপিং বাটন) -->
                <div class="card-animated bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
                  <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    
                    <!-- Main Category Image -->
                    <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/20 shadow-sm flex-shrink-0">
                      <img 
                        src="${c.category_image}" 
                        alt="${escapeHtml(c.category)}" 
                        class="w-full h-full object-cover"
                        onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';"
                      />
                    </div>

                    <!-- Details: Name, Slug, ID, Product Count -->
                    <div class="flex-1 min-w-0 text-center sm:text-left space-y-2">
                      <div class="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <span class="text-xs font-mono font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          আইডি: ${c.catagory_id}
                        </span>
                        <span class="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                          স্লাগ: /${c.catagory_slug}
                        </span>
                      </div>

                      <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        ${escapeHtml(c.category)}
                      </h2>

                      <p class="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5">
                        <span>📦</span> উক্ত ক্যাটাগরিতে মোট <strong>${c.matchingCount} টি পণ্য</strong> তালিকাভুক্ত আছে
                      </p>

                      <!-- Shopping Button (উক্ত ক্যাটাগরিতে শপিং করার জন্য বাটন) -->
                      <div class="pt-2">
                        <a 
                          href="/products?cat=${encodeURIComponent(c.category)}" 
                          class="btn-primary py-2.5 px-6 text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-md rounded-xl"
                        >
                          <span>🛍️</span> ${escapeHtml(c.category)} ক্যাটাগরিতে শপ করুন →
                        </a>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- 2. Sub-category & Child-category Interactive Tree Section -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
                  
                  <!-- Tree Header Toolbar -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                    <div>
                      <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>🌳</span> সাব-ক্যাটাগরি ও চাইল্ড ক্যাটাগরি ট্রি ভিউ
                      </h3>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        যেকোনো সাব-ক্যাটাগরির নামের উপর ক্লিক করুন — অসাধারণ ট্রি শাখায় চাইল্ড ক্যাটাগরিগুলো বিস্তার লাভ করবে
                      </p>
                    </div>

                    <!-- Expand / Collapse All Buttons -->
                    <div class="flex items-center gap-2 self-start sm:self-center">
                      <button 
                        type="button" 
                        class="btn-secondary text-[11px] py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:text-emerald-600 cursor-pointer"
                        onclick="window.expandAllCategoryTrees()"
                      >
                        সবগুলো খুলুন ➕
                      </button>
                      <button 
                        type="button" 
                        class="btn-secondary text-[11px] py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:text-rose-600 cursor-pointer"
                        onclick="window.collapseAllCategoryTrees()"
                      >
                        বন্ধ করুন ➖
                      </button>
                    </div>
                  </div>

                  <!-- Subcategory List (Stacked Vertically একটার নিচে একটা করে) -->
                  <div class="space-y-4">
                    ${c.subCategories.length > 0 ? c.subCategories.map((sub, sIdx) => {
                      const treeId = `tree-item-${idx}-${sIdx}`;
                      const hasChildren = sub.children && sub.children.length > 0;
                      const isDefaultOpen = (sIdx === 0);

                      return `
                        <div class="card-animated rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
                          
                          <!-- Sub-category Header Bar (Clickable to toggle tree) -->
                          <div 
                            class="tree-subcat-header p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 border-b border-transparent"
                            onclick="window.toggleSubCategoryTree('${treeId}')"
                          >
                            <div class="flex items-center gap-3 min-w-0">
                              <span 
                                id="chev-${treeId}" 
                                class="subcat-tree-chevron text-slate-400 text-xs transition-transform duration-200 font-bold flex-shrink-0"
                                style="transform: ${isDefaultOpen ? 'rotate(90deg)' : 'rotate(0deg)'};"
                              >
                                ▶
                              </span>
                              <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                📁
                              </div>
                              <div class="min-w-0">
                                <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                  ${escapeHtml(sub.name)}
                                </h4>
                                <div class="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>${sub.count} টি পণ্য</span>
                                  <span>•</span>
                                  <span class="text-emerald-600 font-bold">${sub.children.length} টি চাইল্ড শাখা</span>
                                </div>
                              </div>
                            </div>

                            <!-- Action button: Shop this subcategory directly -->
                            <div class="flex items-center gap-2 flex-shrink-0" onclick="event.stopPropagation();">
                              <a 
                                href="/products?cat=${encodeURIComponent(c.category)}&sub=${encodeURIComponent(sub.name)}" 
                                class="btn-secondary text-[10px] font-bold py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600"
                              >
                                সাব-ক্যাটাগরিতে শপ →
                              </a>
                            </div>
                          </div>

                          <!-- Tree Branch: Expandable Child Categories Tree (ট্রি ভিউ) -->
                          <div 
                            id="${treeId}" 
                            class="subcat-tree-branch ${isDefaultOpen ? '' : 'hidden'} p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80"
                          >
                            ${hasChildren ? `
                              <div class="tree-stem-container space-y-2.5">
                                ${sub.children.map((ch) => `
                                  <div class="tree-branch-node">
                                    <div class="tree-leaf-card bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-700/80 p-3 flex items-center justify-between gap-3 shadow-2xs">
                                      <div class="flex items-center gap-2.5 min-w-0">
                                        <span class="text-emerald-500 text-sm flex-shrink-0">🌿</span>
                                        <div class="min-w-0">
                                          <div class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                            ${escapeHtml(ch.name)}
                                          </div>
                                          <div class="text-[10px] text-slate-400">
                                            চাইল্ড ক্যাটাগরি ${ch.count > 0 ? `(${ch.count} টি পণ্য)` : ''}
                                          </div>
                                        </div>
                                      </div>

                                      <!-- Direct Shop link for child category -->
                                      <a 
                                        href="/products?cat=${encodeURIComponent(c.category)}&sub=${encodeURIComponent(sub.name)}" 
                                        class="btn-primary text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-2xs whitespace-nowrap"
                                      >
                                        পণ্য দেখুন →
                                      </a>
                                    </div>
                                  </div>
                                `).join("")}
                              </div>
                            ` : `
                              <div class="text-xs text-slate-400 py-2 pl-4 italic">
                                এই সাব-ক্যাটাগরির সকল পণ্য সরাসরি অন্তর্ভুক্ত।
                              </div>
                            `}
                          </div>

                        </div>
                      `;
                    }).join("") : `
                      <div class="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                        এই ক্যাটাগরিতে সরাসরি পণ্যসমূহ সাজানো রয়েছে।
                        <div class="mt-3">
                          <a href="/products?cat=${encodeURIComponent(c.category)}" class="btn-primary py-2 px-5 text-xs font-bold inline-flex">
                            পণ্যগুলো ব্রাউজ করুন →
                          </a>
                        </div>
                      </div>
                    `}
                  </div>

                </div>

              </div>
            `;
          }).join("")}

        </main>

      </div>

    </div>
  `;
}
