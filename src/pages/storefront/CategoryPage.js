/**
 * DREAM CART BD — ALL CATEGORIES PAGE (CategoryPage.js)
 * Implements user requirements:
 * - Customer view category page shows only unique main categories (no duplicate repeating names)
 * - Group sub-categories and child-categories under each main category
 * - Accurate product counters from Products sheet
 * - Direct links to product catalog filter
 */

import { apiClient } from '../../api/client.js';

export async function renderCategoryPage() {
  const [catRes, prodRes] = await Promise.all([
    apiClient.request("categories/list"),
    apiClient.request("products/list")
  ]);

  const rawCategories = (catRes.data && catRes.data.items) || [];
  const products = (prodRes.data && prodRes.data.items) || [];

  // Group and deduplicate by Main Category name
  const catMap = new Map();

  rawCategories.forEach(c => {
    const rawName = (c.category || '').trim();
    if (!rawName || rawName.toLowerCase() === 'test id') return;

    const key = rawName.toLowerCase();
    if (!catMap.has(key)) {
      catMap.set(key, {
        category: rawName,
        catagory_id: c.catagory_id || `CAT-${catMap.size + 1}`,
        catagory_slug: c.catagory_slug || rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category_image: c.category_image,
        subCategories: new Set(),
        childCategories: new Set()
      });
    }

    const catObj = catMap.get(key);
    if (c.sub_category) {
      c.sub_category.split(/[,|\n]/).map(s => s.trim()).filter(Boolean).forEach(s => catObj.subCategories.add(s));
    }
    if (c.chail_category || c.child_category) {
      (c.chail_category || c.child_category).split(/[,|\n]/).map(s => s.trim()).filter(Boolean).forEach(s => catObj.childCategories.add(s));
    }
    if (!catObj.category_image && c.category_image) {
      catObj.category_image = c.category_image;
    }
  });

  // Also include any categories present in products that might not be in categories sheet
  products.forEach(p => {
    const pCat = (p.category || '').trim();
    if (!pCat || pCat.toLowerCase() === 'test id') return;
    const key = pCat.toLowerCase();
    if (!catMap.has(key)) {
      catMap.set(key, {
        category: pCat,
        catagory_id: `CAT-${catMap.size + 1}`,
        catagory_slug: pCat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category_image: p.thumbnail,
        subCategories: new Set(),
        childCategories: new Set()
      });
    }
    const catObj = catMap.get(key);
    if (p.sub_category && p.sub_category.trim()) catObj.subCategories.add(p.sub_category.trim());
    if (p.child_category && p.child_category.trim()) catObj.childCategories.add(p.child_category.trim());
  });

  const categories = Array.from(catMap.values()).map(catObj => {
    const matchingProds = products.filter(p => p.category && p.category.trim().toLowerCase() === catObj.category.toLowerCase());
    let img = catObj.category_image;
    if ((!img || img.includes('photo-1579586337278-3befd40fd17a')) && matchingProds.length > 0 && matchingProds[0].thumbnail) {
      img = matchingProds[0].thumbnail;
    }
    return {
      ...catObj,
      category_image: img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      matchingCount: matchingProds.length,
      subCats: Array.from(catObj.subCategories).sort((a, b) => a.localeCompare(b)),
      childCats: Array.from(catObj.childCategories).sort((a, b) => a.localeCompare(b))
    };
  }).sort((a, b) => b.matchingCount - a.matchingCount || a.category.localeCompare(b.category));

  return `
    <div class="space-y-8 pb-20">
      
      <!-- Page Header -->
      <div class="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <a href="/" class="hover:text-emerald-600 transition">হোম</a>
          <span>/</span>
          <span class="text-slate-700 dark:text-slate-300 font-bold">ক্যাটাগরি সমূহ</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>📂</span> সকল পণ্য ক্যাটাগরি (All Categories)
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          ক্যাটাগরি, সাব-ক্যাটাগরি ও চাইল্ড ক্যাটাগরি অনুসারে সহজে পণ্য খুঁজে নিন
        </p>
      </div>

      <!-- Categories Grid (Main Categories Only) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${categories.map(c => `
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:border-emerald-500/50 transition flex flex-col justify-between space-y-5">
            
            <div class="flex items-start gap-4">
              <div class="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                <img 
                  src="${c.category_image}" 
                  alt="${c.category}" 
                  class="w-full h-full object-cover"
                  onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';"
                />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">${c.catagory_id}</span>
                  <span class="text-xs font-bold text-emerald-600">${c.matchingCount} টি পণ্য</span>
                </div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white mt-1 truncate">
                  <a href="/products?cat=${encodeURIComponent(c.category)}" class="hover:text-emerald-600 transition">
                    ${c.category}
                  </a>
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">Slug: /${c.catagory_slug}</p>
              </div>
            </div>

            <!-- Hierarchy Tree Box: Sub Categories & Child Categories -->
            ${(c.subCats.length > 0 || c.childCats.length > 0) ? `
              <div class="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2.5">
                ${c.subCats.length > 0 ? `
                  <div>
                    <div class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      সাব-ক্যাটাগরি (Sub Categories):
                    </div>
                    <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      ${c.subCats.map(sc => `
                        <a 
                          href="/products?cat=${encodeURIComponent(c.category)}&sub=${encodeURIComponent(sc)}" 
                          class="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-emerald-500 hover:text-emerald-600 transition text-[11px]"
                        >
                          ${sc}
                        </a>
                      `).join("")}
                    </div>
                  </div>
                ` : ""}

                ${c.childCats.length > 0 ? `
                  <div class="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      চাইল্ড ক্যাটাগরি (Child Categories):
                    </div>
                    <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      ${c.childCats.map(cc => `
                        <a 
                          href="/products?cat=${encodeURIComponent(c.category)}&child=${encodeURIComponent(cc)}" 
                          class="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-medium hover:bg-emerald-100 transition"
                        >
                          ↳ ${cc}
                        </a>
                      `).join("")}
                    </div>
                  </div>
                ` : ""}
              </div>
            ` : ""}

            <!-- View All Button -->
            <a 
              href="/products?cat=${encodeURIComponent(c.category)}" 
              class="btn-primary py-2 px-4 text-xs font-bold text-center block w-full"
            >
              ${c.category} এর সকল পণ্য দেখুন (${c.matchingCount}) →
            </a>

          </div>
        `).join("")}
      </div>

    </div>
  `;
}
