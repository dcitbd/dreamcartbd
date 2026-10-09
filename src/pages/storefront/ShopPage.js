/**
 * DREAM CART BD — PRODUCTS CATALOG PAGE (ShopPage.js)
 * Implements user requirements:
 * - 60 pcs show per page (with pagination)
 * - Filter by Category > Sub Category > Child Category tree (derived directly from products in Products sheet)
 * - Brand filter as dropdown
 * - Stock status filter: (In-Stock (selected by default), Out of Stock, All)
 * - Fully responsive on mobile with toggleable filter drawer
 * - Filter by price / sort
 * - Search keyword support
 * - Role-based pricing in cards
 */

import { apiClient } from '../../api/client.js';
import { renderProductCard } from '../../components/ProductCard.js';

export async function renderShopPage(params = {}) {
  const cat = (params.cat || "").trim();
  const subCat = (params.sub || "").trim();
  const childCat = (params.child || "").trim();
  const brand = (params.brand || "").trim();
  
  // Stock filter: In-Stock (selected by default), Out of Stock, All
  const stockFilter = params.stock || (params.in_stock === '0' || params.in_stock === false ? 'all' : (params.in_stock === '1' || params.in_stock === true ? 'in_stock' : 'in_stock'));
  
  const sort = params.sort || "featured";
  const search = (params.search || "").trim();
  const page = parseInt(params.page || "1", 10);
  const pageSize = 60; // 60 pcs per page

  // Fetch all products from Products sheet
  const [prodRes, brandRes] = await Promise.all([
    apiClient.request("products/list"),
    apiClient.request("brands/list")
  ]);

  const allProducts = (prodRes.data && prodRes.data.items) || [];

  // 1. Build Category Tree (Category > Sub Category > Child Category)
  // Derived ONLY from products present in Products sheet, deduplicating names
  const categoryTree = {};
  allProducts.forEach(p => {
    const rawCat = (p.category || 'General').trim();
    if (!rawCat || rawCat.toLowerCase() === 'test id') return;

    if (!categoryTree[rawCat]) {
      categoryTree[rawCat] = {
        name: rawCat,
        count: 0,
        subCategories: {}
      };
    }
    categoryTree[rawCat].count += 1;

    const rawSub = (p.sub_category || '').trim();
    if (rawSub) {
      if (!categoryTree[rawCat].subCategories[rawSub]) {
        categoryTree[rawCat].subCategories[rawSub] = {
          name: rawSub,
          count: 0,
          childCategories: {}
        };
      }
      categoryTree[rawCat].subCategories[rawSub].count += 1;

      const rawChild = (p.child_category || '').trim();
      if (rawChild) {
        if (!categoryTree[rawCat].subCategories[rawSub].childCategories[rawChild]) {
          categoryTree[rawCat].subCategories[rawSub].childCategories[rawChild] = {
            name: rawChild,
            count: 0
          };
        }
        categoryTree[rawCat].subCategories[rawSub].childCategories[rawChild].count += 1;
      }
    }
  });

  const categoriesList = Object.values(categoryTree).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  // 2. Extract Unique Brands from Products sheet
  const uniqueBrands = Array.from(new Set(
    allProducts.map(p => (p.brand || '').trim()).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b));

  // 3. Filter Products
  let filteredProducts = [...allProducts];

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.sub_category && p.sub_category.toLowerCase().includes(q)) ||
      (p.child_category && p.child_category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Category hierarchy filter
  if (cat) {
    const cLower = cat.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.category && p.category.trim().toLowerCase() === cLower);
  }
  if (subCat) {
    const subLower = subCat.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.sub_category && p.sub_category.trim().toLowerCase() === subLower);
  }
  if (childCat) {
    const childLower = childCat.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.child_category && p.child_category.trim().toLowerCase() === childLower);
  }

  // Brand dropdown filter
  if (brand) {
    const bLower = brand.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.brand && p.brand.trim().toLowerCase() === bLower);
  }

  // Stock status filter: (In-Stock (selected), Out of Stock, All)
  if (stockFilter === 'in_stock') {
    filteredProducts = filteredProducts.filter(p => Number(p.stock !== undefined ? p.stock : 25) > 0);
  } else if (stockFilter === 'out_of_stock') {
    filteredProducts = filteredProducts.filter(p => Number(p.stock !== undefined ? p.stock : 25) <= 0);
  }
  // if 'all', no stock filtering

  // Sorting
  if (sort === "low_high") {
    filteredProducts.sort((a, b) => Number(a.selling_price) - Number(b.selling_price));
  } else if (sort === "high_low") {
    filteredProducts.sort((a, b) => Number(b.selling_price) - Number(a.selling_price));
  } else if (sort === "name_asc") {
    filteredProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }

  // Pagination (60 pcs per page)
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  const hasActiveFilters = Boolean(cat || subCat || childCat || brand || stockFilter !== 'in_stock' || search);

  // Helper function to build URL with query params
  function buildFilterUrl(newParams) {
    const combined = {
      cat,
      sub: subCat,
      child: childCat,
      brand,
      stock: stockFilter,
      sort,
      search,
      ...newParams
    };
    const searchParams = new URLSearchParams();
    if (combined.cat) searchParams.set('cat', combined.cat);
    if (combined.sub) searchParams.set('sub', combined.sub);
    if (combined.child) searchParams.set('child', combined.child);
    if (combined.brand) searchParams.set('brand', combined.brand);
    if (combined.stock && combined.stock !== 'in_stock') searchParams.set('stock', combined.stock);
    if (combined.sort && combined.sort !== 'featured') searchParams.set('sort', combined.sort);
    if (combined.search) searchParams.set('search', combined.search);
    if (combined.page && combined.page > 1) searchParams.set('page', combined.page);
    const qs = searchParams.toString();
    return '/products' + (qs ? '?' + qs : '');
  }

  return `
    <div class="space-y-6 pb-20">
      
      <!-- Breadcrumb & Page Header -->
      <div class="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div class="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-400 mb-2 flex-wrap">
          <a href="/" class="hover:text-emerald-600 transition">হোম</a>
          <span>/</span>
          <a href="/products" class="${!cat ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600 transition'}">সকল পণ্য</a>
          ${cat ? `<span>/</span> <span class="text-slate-700 dark:text-slate-200 font-bold">${cat}</span>` : ""}
          ${subCat ? `<span>/</span> <span class="text-emerald-600 font-semibold">${subCat}</span>` : ""}
          ${childCat ? `<span>/</span> <span class="text-emerald-600 font-semibold">${childCat}</span>` : ""}
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ${search ? `সার্চ রেজাল্ট: "${search}"` : (cat ? `${cat}` : "আমাদের সকল পণ্যসমূহ")}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              মোট ${totalProducts} টি পণ্য পাওয়া গেছে • পেজ প্রতি ৬০ টি পণ্য প্রদর্শন
            </p>
          </div>

          <!-- Quick Filters Reset -->
          ${hasActiveFilters ? `
            <a href="/products" class="btn-secondary text-xs py-1.5 px-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 self-start sm:self-auto flex items-center gap-1">
              <span>✕</span> ফিল্টার মুছুন
            </a>
          ` : ""}
        </div>
      </div>

      <!-- Mobile Filter Toggle Bar (Visible on mobile/tablet screens) -->
      <div class="lg:hidden flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button 
          id="btn-mobile-filter-toggle"
          class="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl text-xs font-bold transition hover:bg-emerald-100"
          onclick="const panel = document.getElementById('catalog-sidebar-filter'); if(panel) panel.classList.toggle('hidden');"
        >
          <span>⚙️ ফিল্টার ও ক্যাটাগরি</span>
          ${hasActiveFilters ? '<span class="w-2 h-2 rounded-full bg-emerald-500"></span>' : ''}
        </button>

        <div class="text-xs text-slate-500 dark:text-slate-400">
          <strong>${totalProducts}</strong> টি পণ্য
        </div>
      </div>

      <!-- Main Layout: Sidebar Filter + Product Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        <!-- Filter Panel (Collapsible on mobile, sticky sidebar on desktop) -->
        <aside id="catalog-sidebar-filter" class="hidden lg:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-6 shadow-xs sticky top-20">
          
          <div class="flex items-center justify-between lg:hidden pb-3 border-b border-slate-100 dark:border-slate-800">
            <span class="text-sm font-bold text-slate-900 dark:text-white">ফিল্টার অপশনসমূহ</span>
            <button 
              class="text-xs text-slate-400 hover:text-slate-600 p-1"
              onclick="document.getElementById('catalog-sidebar-filter').classList.add('hidden')"
            >
              বন্ধ করুন ✕
            </button>
          </div>

          <!-- Stock Status Filter: (In-Stock (selected), Out of Stock, All) -->
          <div>
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span>📦 স্টক স্ট্যাটাস</span>
            </h3>
            <select 
              id="filter-stock-select"
              class="form-control w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-white outline-none"
              onchange="(window.router ? window.router.navigate : function(u){ window.location.href=u; })('${buildFilterUrl({ stock: '__VAL__' })}'.replace('__VAL__', encodeURIComponent(this.value)))"
            >
              <option value="in_stock" ${stockFilter === 'in_stock' ? 'selected' : ''}>ইন-স্টক পণ্য (In-Stock)</option>
              <option value="out_of_stock" ${stockFilter === 'out_of_stock' ? 'selected' : ''}>স্টক শেষ পণ্য (Out of Stock)</option>
              <option value="all" ${stockFilter === 'all' ? 'selected' : ''}>সকল পণ্য (All)</option>
            </select>
          </div>

          <!-- Brand Dropdown Filter -->
          <div class="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span>🏷️ ব্র্যান্ড ফিল্টার</span>
              ${brand ? `<a href="${buildFilterUrl({ brand: '' })}" class="text-[10px] text-emerald-600 lowercase font-normal">ক্লিয়ার</a>` : ""}
            </h3>
            <select 
              id="filter-brand-select"
              class="form-control w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-white outline-none"
              onchange="(window.router ? window.router.navigate : function(u){ window.location.href=u; })('${buildFilterUrl({ brand: '__VAL__' })}'.replace('__VAL__', encodeURIComponent(this.value)))"
            >
              <option value="">সকল ব্র্যান্ড (All Brands)</option>
              ${uniqueBrands.map(b => `
                <option value="${b}" ${brand.toLowerCase() === b.toLowerCase() ? 'selected' : ''}>
                  ${b} (${allProducts.filter(p => (p.brand || '').trim().toLowerCase() === b.toLowerCase()).length})
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Category Tree Filter (Category > Sub > Child from Products sheet) -->
          <div class="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center justify-between">
              <span>📂 ক্যাটাগরি ফিল্টার</span>
              ${cat ? `<a href="${buildFilterUrl({ cat: '', sub: '', child: '' })}" class="text-[10px] text-emerald-600 lowercase font-normal">ক্লিয়ার</a>` : ""}
            </h3>
            
            <div class="space-y-1 text-xs max-h-[420px] overflow-y-auto pr-1">
              <a 
                href="${buildFilterUrl({ cat: '', sub: '', child: '' })}" 
                class="block px-3 py-2 rounded-xl transition ${!cat ? 'bg-emerald-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}"
              >
                সকল ক্যাটাগরি (${allProducts.length})
              </a>

              ${categoriesList.map(c => {
                const isActiveCat = cat.toLowerCase() === c.name.toLowerCase();
                const subCats = Object.values(c.subCategories).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
                return `
                  <div>
                    <a 
                      href="${buildFilterUrl({ cat: c.name, sub: '', child: '' })}" 
                      class="flex items-center justify-between px-3 py-2 rounded-xl transition ${isActiveCat ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}"
                    >
                      <span class="truncate">${c.name}</span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isActiveCat ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">
                        ${c.count}
                      </span>
                    </a>

                    <!-- Sub Categories Tree -->
                    ${isActiveCat && subCats.length > 0 ? `
                      <div class="pl-3 pr-1 py-1.5 space-y-1 my-1 border-l-2 border-emerald-500/40 ml-3">
                        <div class="text-[10px] uppercase font-bold text-slate-400">সাব-ক্যাটাগরি:</div>
                        ${subCats.map(sc => {
                          const isActiveSub = subCat.toLowerCase() === sc.name.toLowerCase();
                          const childCats = Object.values(sc.childCategories).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
                          return `
                            <div>
                              <a 
                                href="${buildFilterUrl({ cat: c.name, sub: sc.name, child: '' })}" 
                                class="flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] ${isActiveSub ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'}"
                              >
                                <span class="truncate">• ${sc.name}</span>
                                <span class="text-[9px] opacity-75">(${sc.count})</span>
                              </a>

                              <!-- Child Categories Tree -->
                              ${isActiveSub && childCats.length > 0 ? `
                                <div class="pl-2.5 py-1 space-y-1 my-0.5 border-l border-emerald-400/30 ml-2">
                                  <div class="text-[9px] uppercase font-bold text-slate-400">চাইল্ড ক্যাটাগরি:</div>
                                  ${childCats.map(cc => {
                                    const isActiveChild = childCat.toLowerCase() === cc.name.toLowerCase();
                                    return `
                                      <a 
                                        href="${buildFilterUrl({ cat: c.name, sub: sc.name, child: cc.name })}" 
                                        class="flex items-center justify-between px-2 py-0.5 rounded text-[10px] ${isActiveChild ? 'bg-emerald-700 text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'}"
                                      >
                                        <span class="truncate">↳ ${cc.name}</span>
                                        <span class="text-[8px] opacity-75">(${cc.count})</span>
                                      </a>
                                    `;
                                  }).join("")}
                                </div>
                              ` : ""}
                            </div>
                          `;
                        }).join("")}
                      </div>
                    ` : ""}
                  </div>
                `;
              }).join("")}
            </div>
          </div>

        </aside>

        <!-- Right Products Column -->
        <div class="lg:col-span-3 space-y-6">
          
          <!-- Controls Toolbar: Sort by price & Layout info -->
          <div class="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="text-slate-500 dark:text-slate-400">
              দেখাচ্ছে <strong class="text-slate-900 dark:text-white">${totalProducts === 0 ? 0 : startIndex + 1} - ${Math.min(startIndex + pageSize, totalProducts)}</strong> (সর্বমোট ${totalProducts} টির মধ্যে)
            </div>

            <!-- Sort By Dropdown -->
            <div class="flex items-center gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium">সর্ট করুন:</span>
              <select 
                id="catalog-sort-select"
                class="form-control py-1.5 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white outline-none"
                onchange="(window.router ? window.router.navigate : function(u){ window.location.href=u; })('${buildFilterUrl({ sort: '__VAL__' })}'.replace('__VAL__', encodeURIComponent(this.value)))"
              >
                <option value="featured" ${sort === 'featured' ? 'selected' : ''}>জনপ্রিয় পণ্য (Featured)</option>
                <option value="low_high" ${sort === 'low_high' ? 'selected' : ''}>দাম: কম থেকে বেশি (Low to High)</option>
                <option value="high_low" ${sort === 'high_low' ? 'selected' : ''}>দাম: বেশি থেকে কম (High to Low)</option>
                <option value="name_asc" ${sort === 'name_asc' ? 'selected' : ''}>নাম: A থেকে Z</option>
              </select>
            </div>
          </div>

          <!-- Product Grid -->
          ${paginatedProducts.length === 0 ? `
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div class="text-5xl">🔍</div>
              <h3 class="text-base font-bold text-slate-800 dark:text-white">কোনো পণ্য পাওয়া যায়নি</h3>
              <p class="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার দেওয়া ফিল্টারের সাথে মিলে এমন কোনো পণ্য মেলেনি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।
              </p>
              <a href="/products" class="btn-primary mt-2 text-xs py-2 px-5 inline-flex">
                সকল পণ্য দেখুন
              </a>
            </div>
          ` : `
            <div class="product-grid">
              ${paginatedProducts.map(p => renderProductCard(p)).join("")}
            </div>
          `}

          <!-- Pagination Controls (60 pcs per page) -->
          ${totalPages > 1 ? `
            <div class="flex items-center justify-center gap-2 pt-6 flex-wrap">
              <a 
                href="${buildFilterUrl({ page: Math.max(1, page - 1) })}" 
                class="btn-secondary py-2 px-4 text-xs font-bold ${page <= 1 ? 'pointer-events-none opacity-40' : ''}"
              >
                ← পূর্ববর্তী
              </a>

              <div class="flex items-center gap-1 text-xs font-bold flex-wrap">
                ${Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  // Only display relevant pagination range
                  if (totalPages > 10 && Math.abs(pNum - page) > 3 && pNum !== 1 && pNum !== totalPages) {
                    if (Math.abs(pNum - page) === 4) return '<span class="px-1 text-slate-400">...</span>';
                    return '';
                  }
                  return `
                    <a 
                      href="${buildFilterUrl({ page: pNum })}" 
                      class="w-8 h-8 rounded-xl flex items-center justify-center transition ${pNum === page ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'}"
                    >
                      ${pNum}
                    </a>
                  `;
                }).join("")}
              </div>

              <a 
                href="${buildFilterUrl({ page: Math.min(totalPages, page + 1) })}" 
                class="btn-secondary py-2 px-4 text-xs font-bold ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}"
              >
                পরবর্তী →
              </a>
            </div>
          ` : ""}

        </div>

      </div>

    </div>
  `;
}

export const renderProductListPage = renderShopPage;
