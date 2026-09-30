/**
 * DREAM CART BD — SHOP / PRODUCT LISTING PAGE
 */

import { apiClient } from '../../api/client.js';
import { renderProductCard } from '../../components/ProductCard.js';

export async function renderShopPage(params = {}) {
  const cat = params.cat || "";
  const search = params.search || "";
  const res = await apiClient.request("products/list", { category: cat, search: search });
  const products = (res.data && res.data.items) || [];

  return `
    <div class="space-y-6 pb-16">
      
      <!-- Breadcrumb & Header -->
      <div class="border-b border-slate-200 pb-4">
        <div class="text-xs text-slate-400 mb-1">
          <a href="#/" class="hover:text-emerald-600">Home</a> / <span class="text-slate-700 font-semibold">Catalog</span>
        </div>
        <h1 class="text-2xl font-black text-slate-900">
          ${cat ? `Category: ${cat.replace("CAT-", "")}` : (search ? `Search results for "${search}"` : "All Products")}
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">Showing ${products.length} available items with immediate dispatch</p>
      </div>

      <!-- Filter & Controls Toolbar -->
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <a href="#/shop" class="px-3 py-1.5 rounded-full ${!cat ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">All</a>
          <a href="#/shop?cat=CAT-SMARTWATCH" class="px-3 py-1.5 rounded-full ${cat === 'CAT-SMARTWATCH' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">Smartwatches</a>
          <a href="#/shop?cat=CAT-ORGANIC" class="px-3 py-1.5 rounded-full ${cat === 'CAT-ORGANIC' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">Organic Health</a>
          <a href="#/shop?cat=CAT-ELECTRONICS" class="px-3 py-1.5 rounded-full ${cat === 'CAT-ELECTRONICS' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">Tools & Lights</a>
          <a href="#/shop?cat=CAT-HOME" class="px-3 py-1.5 rounded-full ${cat === 'CAT-HOME' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">Gas Accessories</a>
        </div>
        <div class="text-xs text-slate-500">
          Sorted by: <span class="font-bold text-slate-800">Featured</span>
        </div>
      </div>

      <!-- Products Grid -->
      ${products.length === 0 ? `
        <div class="bg-white rounded-3xl p-16 text-center border border-slate-200">
          <div class="text-4xl mb-3">🔍</div>
          <h3 class="text-base font-bold text-slate-800">No matching products found</h3>
          <p class="text-xs text-slate-500 mt-1">Try clearing your filters or searching for something else.</p>
          <a href="#/shop" class="btn-primary mt-4 text-xs py-2 px-4">View All Products</a>
        </div>
      ` : `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${products.map(p => renderProductCard(p)).join("")}
        </div>
      `}

    </div>
  `;
}

export const renderProductListPage = renderShopPage;
