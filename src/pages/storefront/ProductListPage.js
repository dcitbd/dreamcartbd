/**
 * ============================================================================
 * DREAM CART BD — PRODUCT LISTING & FILTER PAGE (ProductListPage.js)
 * ============================================================================
 */

import { Header } from "../../components/Header.js";
import { Footer } from "../../components/Footer.js";
import { CartDrawer } from "../../components/CartDrawer.js";
import { ProductAPI } from "../../api/products.js";
import { store } from "../../js/store.js";

export const ProductListPage = async (params = {}) => {
  let products = [];
  try {
    const res = await ProductAPI.getAll();
    products = res.items || res || [];
  } catch (e) {
    console.error("Products load failed:", e);
  }

  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header.render()}

      <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div class="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">সমস্ত প্রোডাক্টসমূহ</h1>
            <p class="text-xs text-slate-500 mt-1">মোট <span id="product-count" class="font-bold text-brand-600">${products.length}</span> টি পণ্য পাওয়া গেছে</p>
          </div>
          
          <!-- Sorting Dropdown -->
          <div class="flex items-center gap-3">
            <label class="text-xs font-semibold text-slate-500 hidden sm:inline">সর্ট করুন:</label>
            <select id="sort-select" class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none">
              <option value="newest">নতুন পণ্য</option>
              <option value="price_low">মূল্য: কম থেকে বেশি</option>
              <option value="price_high">মূল্য: বেশি থেকে কম</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <!-- Left Filters Sidebar -->
          <div class="glass-panel p-6 rounded-3xl h-fit space-y-6">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">প্রাইস রেঞ্জ</h3>
              <div class="flex items-center gap-2">
                <input type="number" id="min-price" placeholder="Min" class="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" />
                <span class="text-slate-400">-</span>
                <input type="number" id="max-price" placeholder="Max" class="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none" />
              </div>
            </div>

            <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">স্টক স্ট্যাটাস</h3>
              <label class="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked class="rounded text-brand-600 focus:ring-brand-500" />
                <span>শুধুমাত্র ইন-স্টক পণ্য</span>
              </label>
            </div>

            <button id="apply-filters-btn" class="w-full btn-primary py-2.5 text-xs font-bold">
              ফিল্টার অ্যাপ্লাই করুন
            </button>
          </div>

          <!-- Right Products Grid -->
          <div class="lg:col-span-3">
            <div id="products-grid-container" class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              ${products.map(p => `
                <div class="glass-panel rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group">
                  <div class="relative bg-white p-4 flex items-center justify-center overflow-hidden h-48">
                    <img src="${p.thumbnail || 'https://placehold.co/300x300'}" class="max-h-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${p.sku || 'DCBD'}</span>
                      <a href="/product/${p.product_id}">
                        <h4 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mt-1 hover:text-brand-500">${p.product_name}</h4>
                      </a>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h5 class="text-base font-extrabold text-slate-900 dark:text-white">৳${p.selling_price || p.regular_price}</h5>
                      <button onclick="window.store.addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})" class="p-2 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white transition-all">
                        <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

        </div>
      </main>

      <div id="cart-drawer-root">${CartDrawer.render()}</div>
      ${Footer.render()}
    </div>
  `;
};
