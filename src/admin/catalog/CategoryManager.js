/**
 * ============================================================================
 * DREAM CART BD — CATEGORY MASTER MANAGER (CategoryManager.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { ProductAPI } from "../../../api/products.js";
import { api } from "../../../api/client.js";
import { store } from "../../../js/store.js";

export const CategoryManager = async () => {
  let categories = [];
  try {
    categories = await ProductAPI.getCategoryTree() || [];
  } catch (e) {
    console.error("Failed to load categories:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/categories")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">ক্যাটালগ কন্ট্রোল</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">ক্যাটাগরি ও সাব-ক্যাটাগরি মাস্টার</h1>
            <p class="text-xs text-slate-500 mt-1">ক্যাটাগরি, সাব-ক্যাটাগরি ও চাইল্ড ক্যাটাগরি তৈরি ও সাজান (গুগল শীটে সরাসরি সংরক্ষিত)</p>
          </div>
          <button id="add-main-cat-btn" class="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i> নতুন ক্যাটাগরি যোগ করুন
          </button>
        </div>

        <!-- Hierarchical Tree View -->
        <div class="space-y-6">
          ${categories.length === 0 ? `
            <div class="glass-panel p-12 text-center rounded-3xl text-slate-400">
              <i data-lucide="folder-x" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
              <p>কোনো ক্যাটাগরি পাওয়া যায়নি। নতুন ক্যাটাগরি তৈরি করুন।</p>
            </div>
          ` : categories.map(main => `
            <div class="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                    <i data-lucide="${main.icon || 'folder'}" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-slate-900 dark:text-white">${main.category_name}</h3>
                    <span class="text-xs text-slate-400">ID: ${main.category_id} | Slug: ${main.slug || 'n/a'}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button class="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i> সাব-ক্যাটাগরি
                  </button>
                  <button class="p-1.5 text-slate-400 hover:text-brand-500 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <!-- Subcategories Accordion / Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                ${(main.subCategories || []).map(sub => `
                  <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-bold text-slate-800 dark:text-slate-200">${sub.name}</span>
                      <span class="badge-info text-[10px]">${(sub.children || []).length} চাইল্ড</span>
                    </div>
                    <div class="flex flex-wrap gap-1">
                      ${(sub.children || []).map(ch => `
                        <span class="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          ${ch.name}
                        </span>
                      `).join("")}
                    </div>
                  </div>
                `).join("")}
              </div>

            </div>
          `).join("")}
        </div>

      </main>
    </div>
  `;
};
