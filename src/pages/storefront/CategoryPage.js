/**
 * ============================================================================
 * DREAM CART BD — CATEGORY EXPLORER PAGE (CategoryPage.js)
 * ============================================================================
 */

import { Header } from "../../components/Header.js";
import { Footer } from "../../components/Footer.js";
import { CartDrawer } from "../../components/CartDrawer.js";
import { ProductAPI } from "../../api/products.js";

export const CategoryPage = async () => {
  let categoryTree = [];
  try {
    categoryTree = await ProductAPI.getCategoryTree();
  } catch (e) {
    console.error("Category tree fetch failed:", e);
  }

  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header.render()}

      <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <!-- Breadcrumb & Header -->
        <div class="mb-8">
          <span class="text-xs text-slate-400 font-semibold"><a href="/" class="hover:text-brand-500">হোম</a> / ক্যাটাগরি</span>
          <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">সমস্ত প্রোডাক্ট ক্যাটাগরি</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">আপনার প্রয়োজনীয় পণ্য সহজে খুঁজে নিতে ক্যাটাগরি ও সাব-ক্যাটাগরি ব্রাউজ করুন</p>
        </div>

        <!-- Hierarchical Category Cards -->
        <div class="space-y-8">
          ${categoryTree.map(main => `
            <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                    <i data-lucide="${main.icon || 'folder'}" class="w-6 h-6"></i>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">${main.category_name}</h2>
                    <p class="text-xs text-slate-400">${main.description || 'ক্যাটাগরির আওতায় সমস্ত পণ্য'}</p>
                  </div>
                </div>
                <a href="/products?category=${main.category_id}" class="btn-secondary text-xs px-4 py-2">
                  সবগুলো দেখুন
                </a>
              </div>

              <!-- Sub Categories & Child Categories Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${(main.subCategories || []).map(sub => `
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:border-brand-300 transition-colors">
                    <a href="/products?subCategory=${sub.sub_category_id}" class="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-500 flex items-center justify-between">
                      <span>${sub.name}</span>
                      <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400"></i>
                    </a>

                    <!-- Child Categories Pills -->
                    ${(sub.children && sub.children.length > 0) ? `
                      <div class="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                        ${sub.children.map(ch => `
                          <a href="/products?childCategory=${ch.child_category_id}" class="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors">
                            ${ch.name}
                          </a>
                        `).join("")}
                      </div>
                    ` : ''}
                  </div>
                `).join("")}
              </div>

            </div>
          `).join("")}
        </div>

      </main>

      <div id="cart-drawer-root">${CartDrawer.render()}</div>
      ${Footer.render()}
    </div>
  `;
};
