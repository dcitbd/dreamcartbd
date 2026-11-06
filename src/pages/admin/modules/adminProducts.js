/**
 * DREAM CART BD — Admin Products & Catalog Module (adminProducts.js)
 * Implements:
 * - Product Catalog (120 products/page, inline editing, stock control, multi-filters, bulk delete)
 * - Add New Product (SKU, images, prices, stock, category tags)
 * - Category & Brand Management (Interactive tree, duplicate-free tags, official brands)
 * - Bulk Tools (CSV Sheet download/upload, bulk price updater, bulk image updater)
 * - Multi-Landing Page CMS (List, add/edit landing pages, live preview)
 * - Others Module Hub
 */

import { apiClient, parseImageUrlsList } from '../../../api/client.js';
import { formatCurrency } from '../../../utils/format.js';
import { toast } from '../../../components/Toast.js';

// MODULE: adminProducts.js
// ============================================================================
/**
 * DREAM CART BD — Complete Modular Product, Category, Brand, Bulk, Landing & Others Views (adminProducts.js)
 * Self-contained module with zero external missing file dependencies for Vite/Rollup.
 */

/**
 * DREAM CART BD — Product Catalog & Stock Alerts Module (adminProductCatalog.js)
 * Routes: /admin/products, /admin/low-stock, /admin/out-stock, /admin/error-products
 */

export function renderProductCatalogModule({ products = [], categories = [], brands = [], kpi = {} }) {
  return `
          <!-- 1. All Products List (Filters + 120 Per Page + Checkboxes + Bulk Price/Stock/Status Edit & Delete) -->
          <div id="page-prod-all" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-2.5">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📦</span> সকল পণ্য ক্যাটালগ ও ইনভেন্টরি (<span id="admin-prod-total-count-label">${products.length} টি পণ্য | প্রতি পেজে ১২০ পিস</span>)
                  </h3>
                  <p class="text-[11px] text-slate-400">চেকবক্সে সিলেক্ট করে একসাথে প্রাইজ/স্টক/স্ট্যাটাস এডিট ও ডিলিট করুন অথবা সরাসরি ক্লিক করে এডিট করুন</p>
                </div>
                <div class="flex flex-wrap items-center gap-1.5 text-xs">
                  <button class="btn-primary py-1.5 px-3 font-bold" onclick="switchAdminPage('page-prod-add', 'group-products')">+ নতুন পণ্য যোগ</button>
                  <button class="btn-secondary py-1.5 px-2.5 font-bold" onclick="switchAdminPage('page-prod-bulk-add', 'group-products')">📥 বাল্ক পণ্য আপলোড</button>
                  <button class="btn-secondary py-1.5 px-2.5 font-bold" onclick="switchAdminPage('page-prod-bulk-price', 'group-products')">🏷️ বাল্ক প্রাইজ</button>
                  <button class="btn-secondary py-1.5 px-2.5 font-bold" onclick="switchAdminPage('page-prod-bulk-image', 'group-products')">🖼️ বাল্ক ইমেজ</button>
                  <button class="btn-secondary py-1.5 px-2.5" onclick="window.exportAdminProductsCsv()">📥 ২৩-কলাম CSV</button>
                  <button class="btn-secondary py-1.5 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <!-- Advanced Multi-Filter Bar -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div class="lg:col-span-2">
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">🔍 নাম, SKU, ক্যাটাগরি বা ব্র্যান্ড সার্চ</label>
                  <input
                    type="text"
                    id="adm-prod-search-input"
                    placeholder="পণ্যের নাম, SKU, ব্র্যান্ড বা ক্যাটাগরি লিখুন..."
                    class="form-control text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full bg-white dark:bg-slate-900"
                    oninput="window.filterAdminProducts(this.value)"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">📂 ক্যাটাগরি ফিল্টার</label>
                  <select id="adm-prod-filter-cat" class="form-control text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full bg-white dark:bg-slate-900 font-bold" onchange="window.filterAdminProductCategory(this.value)">
                    <option value="all">সকল ক্যাটাগরি</option>
                    ${Array.from(new Set([...categories.map(c => c.category), ...products.map(p => p.category)].filter(Boolean))).map(catName => `<option value="${catName}">${catName}</option>`).join("")}
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">🏷️ ব্র্যান্ড ফিল্টার</label>
                  <select id="adm-prod-filter-brand" class="form-control text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full bg-white dark:bg-slate-900 font-bold" onchange="window.filterAdminProductBrand(this.value)">
                    <option value="all">সকল ব্র্যান্ড</option>
                    ${Array.from(new Set([...brands.map(b => b.brand_name), ...products.map(p => p.brand)].filter(Boolean))).map(brName => `<option value="${brName}">${brName}</option>`).join("")}
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">📊 স্টক ও স্ট্যাটাস ফিল্টার</label>
                  <select id="adm-prod-filter-status-select" class="form-control text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full bg-white dark:bg-slate-900 font-bold" onchange="window.filterAdminProductStatus(this.value)">
                    <option value="all">সকল পণ্য (${products.length})</option>
                    <option value="active">সক্রিয় পণ্য</option>
                    <option value="inactive">নিষ্ক্রিয় পণ্য</option>
                    <option value="in_stock">ইন-স্টক (>০ পিস)</option>
                    <option value="low">লো স্টক (≤৫ পিস)</option>
                    <option value="out">আউট অব স্টক (০ পিস)</option>
                    <option value="error">ত্রুটিযুক্ত পণ্য</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 mb-1">↕️ সাজানোর ক্রম (Sort)</label>
                  <div class="flex items-center gap-1">
                    <select id="adm-prod-filter-sort" class="form-control text-xs py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 bg-white dark:bg-slate-900 font-bold" onchange="window.filterAdminProductSort(this.value)">
                      <option value="default">ডিফল্ট</option>
                      <option value="price_asc">মূল্য: কম → বেশি</option>
                      <option value="price_desc">মূল্য: বেশি → কম</option>
                      <option value="stock_asc">স্টক: কম → বেশি</option>
                      <option value="stock_desc">স্টক: বেশি → কম</option>
                      <option value="name_asc">নাম: A → Z</option>
                    </select>
                    <button type="button" onclick="window.resetAdminProductFilters()" class="btn-secondary py-1.5 px-2 text-[10px] font-bold" title="ফিল্টার রিসেট করুন">↺</button>
                  </div>
                </div>
              </div>

              <!-- Quick Status Pill Filters -->
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                  <button class="prod-status-filter-btn active" onclick="window.filterAdminProductStatus('all', this)">সকল (${products.length})</button>
                  <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('in_stock', this)">ইন-স্টক (${products.filter(p => Number(p.stock) > 0).length})</button>
                  <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('low', this)">লো স্টক (${kpi.low_stock_count})</button>
                  <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('out', this)">আউট অব স্টক (${kpi.out_of_stock_count})</button>
                  <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('error', this)">ত্রুটিযুক্ত</button>
                </div>
                <span class="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  📄 প্রতি পেজে সর্বোচ্চ ১২০ পিস প্রোডাক্ট প্রদর্শিত
                </span>
              </div>

              <!-- Checkbox Multi-Select Bulk Action Bar (প্রাইজ / স্টক / স্ট্যাটাস এডিট ও ডিলিট) -->
              <div id="bulk-products-actions-bar" class="hidden p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm">
                <div class="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <span>☑️ নির্বাচিত পণ্য: <span id="bulk-prod-selected-count" class="font-mono text-sm">0</span> টি</span>
                  <button type="button" onclick="window.clearProductCheckboxSelection()" class="text-[10px] underline text-slate-500 hover:text-rose-600 ml-1">সিলেকশন মুছুন</button>
                </div>
                <div class="flex flex-wrap items-center gap-1.5">
                  <button type="button" class="btn-primary py-1.5 px-3 text-[11px] font-bold" onclick="window.openBulkSelectedProductsModal('price')">💰 প্রাইজ এডিট</button>
                  <button type="button" class="btn-secondary py-1.5 px-3 text-[11px] font-bold text-indigo-600 border-indigo-200 bg-white dark:bg-slate-900" onclick="window.openBulkSelectedProductsModal('stock')">📦 স্টক এডিট</button>
                  <button type="button" class="btn-secondary py-1.5 px-3 text-[11px] font-bold text-amber-600 border-amber-200 bg-white dark:bg-slate-900" onclick="window.openBulkSelectedProductsModal('status')">🔄 স্ট্যাটাস এডিট</button>
                  <button type="button" class="btn-secondary py-1.5 px-3 text-[11px] font-bold text-rose-600 border-rose-300 bg-white dark:bg-slate-900 hover:bg-rose-50" onclick="window.handleBulkSelectedProductsDelete()">🗑️ বাল্ক ডিলিট</button>
                </div>
              </div>

              <!-- Products Table (120 Products Per Page) -->
              <div class="overflow-x-auto border rounded-2xl">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase text-[10px]">
                      <th class="py-2.5 px-3 text-center w-9">
                        <input type="checkbox" id="prod-select-all-cb" class="w-4 h-4 rounded accent-emerald-600 cursor-pointer" onchange="window.toggleSelectAllProducts(this)" title="এই পেজের সকল পণ্য সিলেক্ট করুন" />
                      </th>
                      <th class="py-2.5 px-2.5">ছবি</th>
                      <th class="py-2.5 px-3">SKU, নাম ও ব্র্যান্ড</th>
                      <th class="py-2.5 px-3">ক্যাটাগরি ট্রি</th>
                      <th class="py-2.5 px-3">ক্রয় মূল্য</th>
                      <th class="py-2.5 px-3">বিক্রয় ও মূল দর</th>
                      <th class="py-2.5 px-3">হোলসেল দর</th>
                      <th class="py-2.5 px-3">স্টক</th>
                      <th class="py-2.5 px-3">স্ট্যাটাস</th>
                      <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-800" id="admin-products-tbody">
                    ${(typeof window !== 'undefined' && window.__adminState && window.__adminState.activePage === 'page-prod-all') ? products.slice(0, 120).map(p => window.renderAdminProductRowHtml ? window.renderAdminProductRowHtml(p) : '').join("") : ''}
                  </tbody>
                </table>
              </div>

              <!-- Pagination Footer (120 Products Per Page) -->
              <div id="admin-products-pagination" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div class="text-[11px] text-slate-500 font-medium">
                  দেখানো হচ্ছে <b>${products.length > 0 ? 1 : 0} - ${Math.min(120, products.length)}</b> (মোট <b>${products.length}</b> টি পণ্যের মধ্যে | প্রতি পেজে সর্বোচ্চ <b>১২০</b> পিস প্রোডাক্ট)
                </div>
                <div class="flex items-center gap-1.5">
                  <button type="button" disabled class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-white dark:bg-slate-900 opacity-40">« পূর্ববর্তী</button>
                  <button type="button" class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-emerald-600 text-white border-emerald-600">1</button>
                  ${products.length > 120 ? `<button type="button" onclick="window.goToAdminProductPage(2)" class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-white dark:bg-slate-900">2</button>` : ''}
                  <button type="button" ${products.length <= 120 ? 'disabled' : 'onclick="window.goToAdminProductPage(2)"'} class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-white dark:bg-slate-900 disabled:opacity-40">পরবর্তী »</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal for Bulk Edit Selected Products (Price / Stock / Status) -->
          <div id="modal-bulk-selected-products" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-4 text-xs">
              <div class="flex items-center justify-between border-b pb-2.5">
                <h4 id="bulk-sel-prod-modal-title" class="font-black text-sm text-slate-900 dark:text-white">নির্বাচিত পণ্য বাল্ক এডিট</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-bulk-selected-products')?.classList.add('hidden')">✕</button>
              </div>
              <form onsubmit="window.handleApplyBulkSelectedProductsEdit(event)" class="space-y-4">
                <input type="hidden" id="bulk-sel-prod-mode" value="price" />
                <div id="bulk-sel-prod-modal-fields"></div>
                <div class="flex items-center justify-end gap-2 pt-2 border-t">
                  <button type="button" class="btn-secondary py-2 px-4" onclick="document.getElementById('modal-bulk-selected-products')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-2 px-5 font-bold">আপডেট কার্যকর করুন ✓</button>
                </div>
              </form>
            </div>
          </div>

          <!-- 6. Low Stock Products Page -->
          <div id="page-prod-low-stock" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="text-amber-500">⚠️</span> লো-স্টক পণ্য তালিকা
                </h3>
                <span class="badge badge-warning text-xs font-bold">মোট ${kpi.low_stock_count} টি পণ্য</span>
              </div>
              <div id="admin-low-stock-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs"></div>
            </div>
          </div>

          <!-- 7. Out of Stock Products Page -->
          <div id="page-prod-out-stock" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="text-rose-500">🚫</span> আউট অব স্টক পণ্য তালিকা
                </h3>
                <span class="badge badge-danger text-xs font-bold">মোট ${kpi.out_of_stock_count} টি পণ্য</span>
              </div>
              <div id="admin-out-stock-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs"></div>
            </div>
          </div>

          <!-- 8. Error Products Page -->
          <div id="page-prod-error" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-3">
              <div class="flex items-center justify-between border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span class="text-indigo-500">⚙️</span> ত্রুটিযুক্ত পণ্য যাচাই
                </h3>
              </div>
              <div id="admin-error-prod-list" class="space-y-2 text-xs"></div>
            </div>
          </div>

  `;
}

/**
 * DREAM CART BD — 23-Column AI Smart Add Product Module (adminAddProduct.js)
 * Route: /admin/addproduct
 */

export function renderAddProductModule({ products = [], categories = [], brands = [], variants = { colors: [], sizes: [] } }) {
  return `
          <!-- 2. Add Product Page (All 23 Sequential Columns + AI Search Auto-Fill + Tiered Pricing Engine + Image Upload Preview) -->
          <div id="page-prod-add" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-5xl">
              <div class="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-bold text-base text-slate-900 dark:text-white">➕ নতুন পণ্য যোগ করুন</h3>
                  <p class="text-[11px] text-slate-400">পণ্যের নাম দিলেই AI সার্চের মাধ্যমে ক্যাটাগরি &rsaquo; সাব-ক্যাটাগরি &rsaquo; চাইল্ড ক্যাটাগরি, ব্র্যান্ড, স্লাগ ও ওজন অটো বসে যাবে এবং ক্রয় মূল্য দিলে টিয়ার ফর্মুলায় সকল মূল্য হিসাব হবে</p>
                </div>
                <button class="btn-secondary py-1.5 px-3 text-xs font-bold self-start" onclick="switchAdminPage('page-prod-all', 'group-products')">← সকল পণ্য তালিকায় ফিরে যান</button>
              </div>

              <!-- AI Auto-Detection Live Banner -->
              <div class="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/40 dark:to-indigo-950/40 border border-emerald-200 dark:border-emerald-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-[10px]">🤖 AI AUTO</span>
                  <span id="adm-ai-status-badge" class="text-slate-700 dark:text-slate-200 font-medium">
                    পণ্যের নাম (P_Name) টাইপ করার সাথে সাথে ক্যাটাগরি ট্রি, ব্র্যান্ড, স্লাগ ও ডাইমেনশন স্বয়ংক্রিয়ভাবে বসে যাবে।
                  </span>
                </div>
                <button type="button" onclick="window.handleProductNameAiAutoFill(document.getElementById('adm-name')?.value)" class="btn-secondary py-1 px-2.5 text-[10px] font-bold bg-white dark:bg-slate-900">
                  ✨ পুনরায় AI ক্যালকুলেট করুন
                </button>
              </div>

              <form id="form-add-product-dedicated" class="space-y-5 text-xs" onsubmit="window.handleAdminAddProduct(event)">

                <!-- SECTION 1: Columns 1 & 2 -> SKU (manual type) & P_Name (manual type) -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b pb-1.5">
                    ১. পণ্যের কোড ও নাম
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label class="block font-bold mb-1">পণ্যের কোড (SKU) *</label>
                      <div class="flex gap-1.5">
                        <input type="text" id="adm-sku" required placeholder="যেমন: DCBD-WT-09" oninput="window.updateAddProductLiveSummary()" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
                        <button type="button" onclick="const el=document.getElementById('adm-sku'); if(el){el.value='DCBD-'+Math.floor(1000+Math.random()*9000); window.updateAddProductLiveSummary();}" class="btn-secondary px-2.5 text-[10px] font-bold" title="অটো জেনারেট">অটো</button>
                      </div>
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block font-bold mb-1">পণ্যের নাম *</label>
                      <input
                        type="text"
                        id="adm-name"
                        required
                        placeholder="যেমন: Amazfit GTS 4 Calling Smartwatch / সুন্দরবনের খাঁটি চাকের মধু ১ কেজি"
                        oninput="window.handleProductNameAiAutoFill(this.value, 'adm')"
                        class="form-control text-xs w-full py-2 px-3 rounded-xl border border-emerald-400 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <!-- SECTION 2: Columns 3, 4, 5, 6 -> Category, Sub_Category, Child_Category (AI Dropdowns) & Brand (Auto + Manual Add) -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b pb-1.5">
                    ২. ক্যাটাগরি ও ব্র্যান্ড
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <!-- 3. Category Dropdown -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">ক্যাটাগরি *</label>
                      <select id="adm-cat" required onchange="window.handleAdminCategoryChange(this.value, 'adm')" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                        ${Array.from(new Set(['Smartwatches', 'Kitchen', 'Organic & Health', 'Home Appliances', 'Audio & Earbuds', 'Mobile & Computer Accessories', 'Fashion & Lifestyle', ...categories.map(c => c.category), ...products.map(p => p.category)].filter(Boolean))).map(c => `<option value="${c}">${c}</option>`).join("")}
                      </select>
                      <div class="flex gap-1">
                        <input type="text" id="adm-new-cat-input" placeholder="+ নতুন ক্যাটাগরি যোগ..." class="form-control text-[11px] py-1 px-2 rounded-lg border flex-1 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleQuickAddCategoryOption('cat', 'adm')" class="btn-secondary py-1 px-2 text-[10px] font-bold">+ যোগ</button>
                      </div>
                    </div>

                    <!-- 4. Sub_Category Dropdown -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">সাব-ক্যাটাগরি *</label>
                      <select id="adm-subcat" onchange="window.updateAddProductLiveSummary()" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                        ${Array.from(new Set(['AMOLED Watch', 'Calling Watch', 'Safety Device', 'Blender', 'Cookware', 'Honey', 'Seeds', 'Oils', 'Lighting', 'Gadgets', 'TWS Earbuds', 'Smart Accessories', ...products.map(p => p.sub_category)].filter(Boolean))).map(s => `<option value="${s}">${s}</option>`).join("")}
                      </select>
                      <div class="flex gap-1">
                        <input type="text" id="adm-new-subcat-input" placeholder="+ নতুন সাব-ক্যাটাগরি..." class="form-control text-[11px] py-1 px-2 rounded-lg border flex-1 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleQuickAddCategoryOption('subcat', 'adm')" class="btn-secondary py-1 px-2 text-[10px] font-bold">+ যোগ</button>
                      </div>
                    </div>

                    <!-- 5. Child_Category Dropdown -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">চাইল্ড ক্যাটাগরি *</label>
                      <select id="adm-childcat" onchange="window.updateAddProductLiveSummary()" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                        ${Array.from(new Set(['Men', 'Women', 'Fitness & GPS', 'Appliances', 'Pure Natural', 'Rechargeable', 'Standard', 'Premium Grade', ...products.map(p => p.child_category)].filter(Boolean))).map(ch => `<option value="${ch}">${ch}</option>`).join("")}
                      </select>
                      <div class="flex gap-1">
                        <input type="text" id="adm-new-childcat-input" placeholder="+ নতুন চাইল্ড ক্যাটাগরি..." class="form-control text-[11px] py-1 px-2 rounded-lg border flex-1 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleQuickAddCategoryOption('childcat', 'adm')" class="btn-secondary py-1 px-2 text-[10px] font-bold">+ যোগ</button>
                      </div>
                    </div>

                    <!-- 6. Brand (Auto Calculate from Name + Manual Add System) -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">ব্র্যান্ড *</label>
                      <select id="adm-brand" onchange="window.updateAddProductLiveSummary()" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                        ${Array.from(new Set(['Amazfit', 'Dream Organic', 'HK', 'Kieslect', 'Haylou', 'Xiaomi', 'Samsung', 'Baseus', 'Dream Cart BD', ...brands.map(b => b.brand_name), ...products.map(p => p.brand)].filter(Boolean))).map(b => `<option value="${b}">${b}</option>`).join("")}
                      </select>
                      <div class="flex gap-1">
                        <input type="text" id="adm-inline-new-brand" placeholder="+ নতুন ব্র্যান্ডের নাম..." class="form-control text-[11px] py-1 px-2 rounded-lg border flex-1 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleQuickAddBrandInline('adm')" class="btn-primary py-1 px-2.5 text-[10px] font-bold">+ ব্র্যান্ড যোগ</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- SECTION 3: Columns 7, 8, 9, 10, 11, 12 -> Tiered Auto Pricing & Stock -->
                <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-200 dark:border-slate-700 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/70 dark:border-slate-700 pb-1.5">
                    <div class="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                      ৩. মূল্য ও স্টক নির্ধারণ
                    </div>
                    <button type="button" onclick="window.handleBuyingPriceAutoCalc(document.getElementById('adm-buyprice')?.value, 'adm', true)" class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 underline">
                      🔄 ক্রয় মূল্য থেকে পুনরায় অটো-ক্যালকুলেট করুন
                    </button>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <!-- 7. Buying_price -->
                    <div>
                      <label class="block font-bold mb-1 text-slate-800 dark:text-slate-200">ক্রয় মূল্য (৳) *</label>
                      <input
                        type="number"
                        id="adm-buyprice"
                        required
                        min="0"
                        step="any"
                        placeholder="1000"
                        oninput="window.handleBuyingPriceAutoCalc(this.value, 'adm')"
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border border-emerald-400 font-bold font-mono bg-white dark:bg-slate-900"
                      />
                      <span class="text-[9px] text-slate-400">টাইপ করলেই সব প্রাইজ অটো বসবে</span>
                    </div>

                    <!-- 8. Selling_Price (auto + manual) -->
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="font-bold text-emerald-700 dark:text-emerald-400">বিক্রয় মূল্য (৳) *</label>
                        <span id="adm-sell-rate-badge" class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold">অটো %</span>
                      </div>
                      <input
                        type="number"
                        id="adm-sellprice"
                        required
                        min="0"
                        step="any"
                        placeholder="1450"
                        oninput="window.handleSellingPriceManualChange(this.value, 'adm')"
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-bold font-mono text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900"
                      />
                      <span class="text-[9px] text-slate-400">অটো ফর্মুলা + ম্যানুয়াল এডিটযোগ্য</span>
                    </div>

                    <!-- 9. Stock -->
                    <div>
                      <label class="block font-bold mb-1">স্টক (পিস) *</label>
                      <input
                        type="number"
                        id="adm-stock"
                        required
                        min="0"
                        value="50"
                        oninput="window.updateAddProductLiveSummary()"
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-bold font-mono bg-white dark:bg-slate-900"
                      />
                      <span class="text-[9px] text-slate-400">মজুদ পণ্যের সংখ্যা</span>
                    </div>

                    <!-- রেগুলার মূল্য (৳) -->
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="font-bold">রেগুলার মূল্য (৳)</label>
                        <span id="adm-orig-rate-badge" class="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">অটো %</span>
                      </div>
                      <input
                        type="number"
                        id="adm-origprice"
                        min="0"
                        step="any"
                        placeholder="2103"
                        oninput="window.updateAddProductLiveSummary()"
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono bg-white dark:bg-slate-900"
                      />
                      <span class="text-[9px] text-slate-400">রেগুলার দর</span>
                    </div>

                    <!-- পাইকারি মূল্য (৳) -->
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <label class="font-bold text-indigo-600 dark:text-indigo-400">পাইকারি মূল্য (৳)</label>
                        <span id="adm-ws-rate-badge" class="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 font-bold">অটো %</span>
                      </div>
                      <input
                        type="number"
                        id="adm-wholesaleprice"
                        min="0"
                        step="any"
                        placeholder="1280"
                        oninput="window.updateAddProductLiveSummary()"
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono text-indigo-600 bg-white dark:bg-slate-900"
                      />
                      <span class="text-[9px] text-slate-400">হোলসেল দর</span>
                    </div>

                    <!-- সর্বনিম্ন পাইকারি অর্ডার -->
                    <div>
                      <label class="block font-bold mb-1">সর্বনিম্ন পাইকারি অর্ডার</label>
                      <input
                        type="number"
                        id="adm-minorderq"
                        min="1"
                        value="5"
                        oninput="window.updateAddProductLiveSummary()"
                        class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-bold font-mono bg-white dark:bg-slate-900"
                      />
                      <span class="text-[9px] text-slate-400">পাইকারি ন্যূনতম সংখ্যা</span>
                    </div>
                  </div>
                </div>

                <!-- SECTION 4: Columns 13 & 14 -> Images (Link + Manual Upload + Preview) & Slug (Auto) -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b pb-1.5">
                    ৪. পণ্যের ছবি ও লিংক
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div class="lg:col-span-2 space-y-2.5">
                      <label class="block font-bold">পণ্যের ছবি *</label>
                      <input
                        type="text"
                        id="adm-imageurl"
                        placeholder="https://images.unsplash.com/... (একাধিক লিঙ্ক কমা দিয়ে লিখুন অথবা নিচে যোগ করুন)"
                        oninput="window.renderAdminProductImagePreviews('adm'); window.updateAddProductLiveSummary();"
                        class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900 font-mono"
                      />
                      <div class="flex flex-col sm:flex-row gap-2">
                        <div class="flex gap-1.5 flex-1">
                          <input type="text" id="adm-imageurl-add" placeholder="নতুন ছবির লিঙ্ক পেস্ট করে '+ লিঙ্ক যোগ' চাপুন..." oninput="window.renderAdminProductImagePreviews('adm')" onkeydown="if(event.key==='Enter'){event.preventDefault(); window.handleAddProductImageUrlInline('adm');}" class="form-control text-xs py-1.5 px-3 rounded-xl border flex-1 bg-white dark:bg-slate-900" />
                          <button type="button" onclick="window.handleAddProductImageUrlInline('adm')" class="btn-secondary py-1.5 px-3 text-xs font-bold whitespace-nowrap">+ লিঙ্ক যোগ</button>
                        </div>
                        <label class="btn-primary py-1.5 px-3.5 text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <span>📤 ফাইল আপলোড করুন</span>
                          <input type="file" id="adm-image-files" multiple accept="image/*" class="hidden" onchange="window.handleAdminProductImageUpload(this, 'adm')" />
                        </label>
                      </div>
                      <!-- Live Image Preview Grid -->
                      <div id="adm-images-preview-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        <div class="col-span-full p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-[11px] text-slate-400">
                          🖼️ এখনো কোনো ছবি যুক্ত করা হয়নি। উপরে ছবির লিঙ্ক দিন অথবা ফাইল আপলোড করুন।
                        </div>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <label class="block font-bold">পণ্য লিংক স্লাগ (Slug)</label>
                      <input
                        type="text"
                        id="adm-slug"
                        placeholder="auto-generated-product-slug"
                        oninput="this.dataset.manualEdit='true'; window.updateAddProductLiveSummary();"
                        class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono bg-white dark:bg-slate-900"
                      />
                      <button type="button" onclick="const el=document.getElementById('adm-slug'); if(el){delete el.dataset.manualEdit; window.handleProductNameAiAutoFill(document.getElementById('adm-name')?.value, 'adm');}" class="btn-secondary py-1 px-2.5 text-[10px] font-bold">
                        🔄 নাম থেকে অটো স্লাগ তৈরি করুন
                      </button>
                      <p class="text-[10px] text-slate-400 leading-relaxed">
                        পণ্যের নাম লিখলে স্বয়ংক্রিয়ভাবে SEO-বান্ধব URL Slug তৈরি হবে।
                      </p>
                    </div>
                  </div>
                </div>

                <!-- SECTION 5: Columns 15, 16, 17 -> Description, Specification, Others -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b pb-1.5">
                    ৫. বিবরণ ও স্পেসিফিকেশন
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label class="block font-bold mb-1">বিস্তারিত বিবরণ</label>
                      <textarea id="adm-desc" rows="3" placeholder="পণ্যের বিস্তারিত বিবরণ ও বৈশিষ্ট্য..." oninput="window.updateAddProductLiveSummary()" class="form-control text-xs w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900"></textarea>
                    </div>
                    <div>
                      <label class="block font-bold mb-1">স্পেসিফিকেশন</label>
                      <textarea id="adm-spec" rows="3" placeholder="যেমন: Display: 1.75 AMOLED | Battery: 300mAh | Warranty: 1 Year" oninput="window.updateAddProductLiveSummary()" class="form-control text-xs w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900"></textarea>
                    </div>
                    <div>
                      <label class="block font-bold mb-1">ওয়ারেন্টি ও অন্যান্য তথ্য</label>
                      <textarea id="adm-others" rows="3" placeholder="যেমন: 1 Year Official Warranty, Fast Dispatch from Cumilla Hub." oninput="window.updateAddProductLiveSummary()" class="form-control text-xs w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900"></textarea>
                    </div>
                  </div>
                </div>

                <!-- SECTION 6: Columns 18, 19, 20, 21, 22, 23 -> Color, Size & Auto Dimensions (WEIGHT_KG, WIDTH_CM, LENGTH_CM, HEIGHT_CM) -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3">
                  <div class="font-black text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b pb-1.5">
                    ৬. কালার, সাইজ ও পরিমাপ
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- 18. Color (Dropdown + Add New) -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">কালার ভ্যারিয়েন্ট</label>
                      <div class="flex gap-1.5">
                        <select id="adm-color-select" onchange="window.handleSelectColorOrSizeTag('color', this, 'adm')" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold bg-white dark:bg-slate-900 flex-1">
                          <option value="">-- কালার সিলেক্ট করুন --</option>
                          ${variants.colors.map(c => `<option value="${c}">${c}</option>`).join("")}
                        </select>
                        <input type="text" id="adm-new-color-input" placeholder="+ নতুন কালার..." class="form-control text-xs py-1.5 px-2.5 rounded-xl border w-32 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleAddNewColorOrSizeInline('color', 'adm')" class="btn-primary py-1.5 px-2.5 text-[10px] font-bold">+ যোগ</button>
                      </div>
                      <input type="text" id="adm-color" placeholder="নির্বাচিত কালারসমূহ (কমা দিয়ে)..." oninput="window.renderColorSizeChips('adm'); window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border bg-white dark:bg-slate-900" />
                      <div id="adm-color-chips" class="flex flex-wrap gap-1 pt-0.5"></div>
                    </div>

                    <!-- 19. Size (Dropdown + Add New) -->
                    <div class="space-y-1.5">
                      <label class="block font-bold">সাইজ ভ্যারিয়েন্ট</label>
                      <div class="flex gap-1.5">
                        <select id="adm-size-select" onchange="window.handleSelectColorOrSizeTag('size', this, 'adm')" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold bg-white dark:bg-slate-900 flex-1">
                          <option value="">-- সাইজ সিলেক্ট করুন --</option>
                          ${variants.sizes.map(s => `<option value="${s}">${s}</option>`).join("")}
                        </select>
                        <input type="text" id="adm-new-size-input" placeholder="+ নতুন সাইজ..." class="form-control text-xs py-1.5 px-2.5 rounded-xl border w-32 bg-white dark:bg-slate-900" />
                        <button type="button" onclick="window.handleAddNewColorOrSizeInline('size', 'adm')" class="btn-primary py-1.5 px-2.5 text-[10px] font-bold">+ যোগ</button>
                      </div>
                      <input type="text" id="adm-size" placeholder="নির্বাচিত সাইজসমূহ (কমা দিয়ে)..." oninput="window.renderColorSizeChips('adm'); window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border bg-white dark:bg-slate-900" />
                      <div id="adm-size-chips" class="flex flex-wrap gap-1 pt-0.5"></div>
                    </div>
                  </div>

                  <!-- 20-23: WEIGHT_KG, WIDTH_CM, LENGTH_CM, HEIGHT_CM -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label class="block font-bold mb-1">ওজন (কেজি)</label>
                      <input type="number" id="adm-weight" step="0.01" value="0.25" oninput="this.dataset.manualEdit='true'; window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">প্রস্থ (সেমি)</label>
                      <input type="number" id="adm-width" step="0.1" value="10" oninput="this.dataset.manualEdit='true'; window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">দৈর্ঘ্য (সেমি)</label>
                      <input type="number" id="adm-length" step="0.1" value="12" oninput="this.dataset.manualEdit='true'; window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">উচ্চতা (সেমি)</label>
                      <input type="number" id="adm-height" step="0.1" value="6" oninput="this.dataset.manualEdit='true'; window.updateAddProductLiveSummary();" class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
                    </div>
                  </div>
                </div>

                

                <div class="flex flex-wrap items-center gap-2.5 pt-2">
                  <button type="submit" class="btn-primary py-3 px-8 font-black text-xs shadow-lg">💾 পণ্য ক্যাটালগ ও শিটে সংরক্ষণ করুন →</button>
                  <button type="button" class="btn-secondary py-3 px-5 font-bold text-xs" onclick="document.getElementById('form-add-product-dedicated')?.reset(); window.renderAdminProductImagePreviews('adm'); window.renderColorSizeChips('adm'); window.updateAddProductLiveSummary();">রিসেট করুন</button>
                </div>
              </form>
            </div>
          </div>

  `;
}

/**
 * DREAM CART BD — Categories, Brands Card Grid, Variants & Banners Module (adminCategoryBrand.js)
 * Routes: /admin/categroy, /admin/category, /admin/brands, /admin/addbrand, /admin/variants, /admin/banners
 */

export function renderCategoryBrandModule({ products = [], categories = [], brands = [], variants = { colors: [], sizes: [] }, banners = [] }) {
  const uniqueCatMap = new Map();
  categories.forEach(c => {
    const raw = (c.category || '').trim();
    if (raw && !uniqueCatMap.has(raw.toLowerCase())) {
      uniqueCatMap.set(raw.toLowerCase(), c);
    }
  });
  products.forEach(p => {
    const raw = (p.category || '').trim();
    if (raw && !uniqueCatMap.has(raw.toLowerCase())) {
      uniqueCatMap.set(raw.toLowerCase(), {
        catagory_id: 'CAT-' + Math.floor(100 + Math.random() * 900),
        category: raw,
        sub_category: p.sub_category || 'General',
        chail_category: p.child_category || 'Standard',
        category_image: p.thumbnail || ''
      });
    }
  });
  const dedupedCategories = Array.from(uniqueCatMap.values());

  return `
    <!-- 3. Interactive 3-Level Category Tree Page (ক্যাটাগরি ট্রি — Category > Sub Category > Chaild Category) -->
    <div id="page-prod-categories" class="admin-page-view hidden space-y-5">

      <!-- 4 Counter Cards for Category Tree -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="admin-kpi-card p-3.5">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-[10px] font-bold uppercase">মোট Category</span>
            <span>🗂️</span>
          </div>
          <div id="cattree-kpi-cats" class="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">${dedupedCategories.length} টি</div>
          <div class="text-[10px] text-emerald-600 font-bold">Level 1 মূল ক্যাটাগরি</div>
        </div>
        <div class="admin-kpi-card p-3.5">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-[10px] font-bold uppercase">মোট Sub Category</span>
            <span>📂</span>
          </div>
          <div id="cattree-kpi-subs" class="text-lg font-black text-indigo-600 mt-1 font-mono">
            ${dedupedCategories.reduce((acc, c) => acc + String(c.sub_category || 'General').split(',').filter(Boolean).length, 0)} টি
          </div>
          <div class="text-[10px] text-slate-400">Level 2 সাব-ক্যাটাগরি</div>
        </div>
        <div class="admin-kpi-card p-3.5">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-[10px] font-bold uppercase">মোট Chaild Category</span>
            <span>🏷️</span>
          </div>
          <div id="cattree-kpi-childs" class="text-lg font-black text-amber-600 mt-1 font-mono">
            ${dedupedCategories.reduce((acc, c) => acc + String(c.chail_category || c.child_category || 'Standard').split(',').filter(Boolean).length, 0)} টি
          </div>
          <div class="text-[10px] text-slate-400">Level 3 চাইল্ড ক্যাটাগরি</div>
        </div>
        <div class="admin-kpi-card p-3.5">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-[10px] font-bold uppercase">সংযুক্ত মোট পণ্য</span>
            <span>📦</span>
          </div>
          <div id="cattree-kpi-prods" class="text-lg font-black text-emerald-600 mt-1 font-mono">${products.length} টি</div>
          <div class="text-[10px] text-slate-400">ক্যাটালগভুক্ত আইটেম</div>
        </div>
      </div>

      <!-- Visual Blueprint Diagram Banner (Matching User's Uploaded Image) -->
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3">
          <div>
            <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>🌳</span> ক্যাটাগরি ও সাব-ক্যাটাগরি ট্রি
            </h3>
            <p class="text-[11px] text-slate-400">
              Category-তে ক্লিক করলে Sub Category খুলবে এবং Sub Category-তে ক্লিক করলে Chaild Category খুলবে — ডানপাশের বাটনে ক্লিক করে নতুন স্তর যুক্ত করুন
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <button type="button" class="btn-primary py-1.5 px-3.5 font-bold" onclick="window.openCategoryTreeActionModal('add_cat')">
              + নতুন ক্যাটাগরি
            </button>
            <button type="button" class="btn-secondary py-1.5 px-2.5 font-bold" onclick="window.expandOrCollapseAllCategoryTree(true)">
              ➕ সবগুলো খুলুন
            </button>
            <button type="button" class="btn-secondary py-1.5 px-2.5 font-bold" onclick="window.expandOrCollapseAllCategoryTree(false)">
              ➖ সবগুলো বন্ধ করুন
            </button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.exportGenericCsv('Categories_Tree', ['ID', 'Category', 'Sub Category', 'Chaild Category'], (window.buildNormalizedCategoryTree ? window.buildNormalizedCategoryTree() : []).map(c=>[c.catagory_id, c.category, c.sub_category, c.chail_category]))">
              📥 CSV
            </button>
          </div>
        </div>

        <!-- Search Filter for Tree -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <input
            type="text"
            placeholder="🔍 ক্যাটাগরি, সাব-ক্যাটাগরি বা চাইল্ড ক্যাটাগরি খুঁজুন..."
            oninput="window.searchCategoryTree(this.value)"
            class="form-control text-xs py-2 px-3.5 rounded-xl w-full sm:w-96"
          />
          <span class="text-[11px] text-slate-400">💡 যেকোনো Category বা Sub Category নামের ওপর ক্লিক করে ভেতরের শাখা খুলুন</span>
        </div>

        <!-- Dynamic Interactive Tree Mount -->
        <div id="admin-interactive-cat-tree-mount" class="dc-tree-container pt-1"></div>

        <!-- Quick Full Tree Add Form -->
        <div id="form-add-category-box" class="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl space-y-3 max-w-2xl text-xs mt-4">
          <h4 class="font-bold text-sm text-slate-900 dark:text-white">➕ একসাথে নতুন Category, Sub Category ও Chaild Category তৈরি করুন</h4>
          <form id="form-add-category-dedicated" onsubmit="window.handleAdminAddCategory(event)" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-bold mb-1">1. Category নাম *</label>
                <input type="text" id="adm-new-cat-name" required placeholder="Smartwatches / Kitchen" class="form-control text-xs w-full py-2 px-3 rounded-xl font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">2. Sub Category (কমা দিয়ে)</label>
                <input type="text" id="adm-new-cat-sub" placeholder="Calling Watch, AMOLED Watch" class="form-control text-xs w-full py-2 px-3 rounded-xl" />
              </div>
              <div>
                <label class="block font-bold mb-1">3. Chaild Category (কমা দিয়ে)</label>
                <input type="text" id="adm-new-cat-child" placeholder="Men, Women, Kids" class="form-control text-xs w-full py-2 px-3 rounded-xl" />
              </div>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <input type="url" id="adm-new-cat-image" placeholder="ক্যাটাগরি থাম্বনেইল ছবি URL (ঐচ্ছিক): https://..." class="form-control text-xs flex-1 py-2 px-3 rounded-xl" />
              <button type="submit" class="btn-primary py-2 px-6 font-bold whitespace-nowrap">ক্যাটাগরি ট্রিতে সংরক্ষণ করুন →</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal for Interactive Category / Sub Category / Chaild Category Add & Edit -->
      <div id="modal-category-tree-action" class="admin-modal-backdrop hidden">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-md w-full space-y-4 text-xs">
          <div class="flex items-center justify-between pb-2">
            <h4 id="cat-tree-modal-title" class="font-black text-sm text-slate-900 dark:text-white">ক্যাটাগরি ট্রি অ্যাকশন</h4>
            <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-category-tree-action')?.classList.add('hidden')">✕</button>
          </div>
          <form onsubmit="window.handleSaveCategoryTreeModal(event)" class="space-y-3">
            <input type="hidden" id="cat-tree-modal-mode" value="add_cat" />
            <input type="hidden" id="cat-tree-modal-parent-cat" value="" />
            <input type="hidden" id="cat-tree-modal-parent-sub" value="" />
            <input type="hidden" id="cat-tree-modal-old-val" value="" />

            <div>
              <label id="cat-tree-modal-label" class="block font-bold mb-1">নাম লিখুন *</label>
              <input type="text" id="cat-tree-modal-input" required class="form-control text-xs w-full py-2 px-3 rounded-xl font-bold" />
            </div>

            <div id="cat-tree-modal-extra-fields" class="hidden space-y-2.5 pt-1">
              <div>
                <label class="block font-bold mb-1">প্রাথমিক Sub Category (কমা দিয়ে)</label>
                <input type="text" id="cat-tree-modal-init-sub" placeholder="যেমন: Calling Watch, AMOLED Watch" class="form-control text-xs w-full py-2 px-3 rounded-xl" />
              </div>
              <div>
                <label class="block font-bold mb-1">প্রাথমিক Chaild Category (কমা দিয়ে)</label>
                <input type="text" id="cat-tree-modal-init-child" placeholder="যেমন: Men, Women, Standard" class="form-control text-xs w-full py-2 px-3 rounded-xl" />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" class="btn-secondary py-2 px-4" onclick="document.getElementById('modal-category-tree-action')?.classList.add('hidden')">বাতিল</button>
              <button type="submit" class="btn-primary py-2 px-5 font-bold">সংরক্ষণ করুন ✓</button>
            </div>
          </form>
        </div>
      </div>
    </div>

          <!-- 9. Brands Page (ব্রান্ড সমূহ কার্ড আকারে দেখা যাবে) -->
          <div id="page-prod-brands" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏷️ অফিসিয়াল ব্র্যান্ড পার্টনারসমূহ (${brands.length} টি ব্র্যান্ড কার্ড)</h3>
                  <p class="text-[11px] text-slate-400">ব্র্যান্ড কার্ড থেকে সরাসরি ওই ব্র্যান্ডের পণ্য ফিল্টার করুন অথবা নতুন ব্র্যান্ড যুক্ত করুন</p>
                </div>
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="ব্র্যান্ড কার্ড খুঁজুন..."
                    oninput="window.renderAdminBrandCards(this.value)"
                    class="form-control text-xs py-1.5 px-3 rounded-xl border w-44"
                  />
                  <button class="btn-primary py-1.5 px-3.5 font-bold" onclick="switchAdminPage('page-prod-brand-add', 'group-products')">+ নতুন ব্র্যান্ড যুক্ত করুন</button>
                  <button class="btn-secondary py-1.5 px-2.5" onclick="window.exportGenericCsv('Brands', ['Brand ID', 'Name', 'Description'], brands.map(b => [b.brand_id, b.brand_name, b.brand_description]))">CSV</button>
                  <button class="btn-secondary py-1.5 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
                </div>
              </div>

              <!-- Brand Cards Grid -->
              <div id="admin-brands-cards-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                ${(() => {
                  const bStats = window.buildBrandStatsMap ? window.buildBrandStatsMap(products) : new Map();
                  return brands.map(b => {
                    const st = bStats.get(String(b.brand_name || '').trim().toLowerCase()) || { count: 0, stock: 0 };
                    const bProds = { length: st.count };
                    const totalStock = st.stock;
                  const safeName = String(b.brand_name || '').replace(/'/g, "\\'");
                  const safeId = String(b.brand_id || b.brand_name || '').replace(/'/g, "\\'");
                  return `
                    <div class="admin-searchable-card bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition flex flex-col justify-between space-y-4">
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-3.5">
                          <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <img loading="lazy" decoding="async" src="${b.brand_image || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" alt="${b.brand_name}" class="w-full h-full object-contain rounded-xl" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                          </div>
                          <div>
                            <div class="flex items-center gap-1.5">
                              <span class="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">${b.brand_id || 'BRD-01'}</span>
                              <span class="badge badge-success text-[9px]">Verified</span>
                            </div>
                            <h4 class="text-base font-black text-slate-900 dark:text-white mt-1">${b.brand_name}</h4>
                            <div class="text-[10px] text-slate-400 font-mono">/${b.brand_slug || b.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</div>
                          </div>
                        </div>
                        <button type="button" onclick="window.handleDeleteBrand('${safeId}')" class="text-slate-400 hover:text-rose-600 text-xs font-bold p-1" title="ব্র্যান্ড মুছুন">🗑️</button>
                      </div>

                      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                        ${b.brand_description || 'অফিশিয়াল অথেন্টিক ব্র্যান্ড পার্টনার।'}
                      </p>

                      <div class="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-center">
                        <div>
                          <div class="text-[10px] text-slate-400">মোট পণ্য</div>
                          <div class="text-sm font-black text-emerald-600 font-mono">${bProds.length} টি</div>
                        </div>
                        <div class="border-l border-slate-200 dark:border-slate-700">
                          <div class="text-[10px] text-slate-400">মোট স্টক</div>
                          <div class="text-sm font-black text-indigo-600 font-mono">${totalStock} পিস</div>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 pt-1">
                        <button type="button" onclick="window.filterProductsByBrandFromCard('${safeName}')" class="btn-primary py-2 px-3 text-[11px] font-bold flex-1 text-center">
                          📦 পণ্যসমূহ (${bProds.length})
                        </button>
                        <a href="/products?brand=${encodeURIComponent(b.brand_name)}" target="_blank" class="btn-secondary py-2 px-3 text-[11px] font-bold">
                          স্টোর ↗
                        </a>
                      </div>
                    </div>
                  `;
                  }).join("");
                })()}
              </div>
            </div>
          </div>

          <!-- 10. Add Brands Page -->
          <div id="page-prod-brand-add" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-md">
              <div class="border-b pb-2 flex items-center justify-between">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন ব্র্যান্ড যুক্ত করুন</h3>
                  <p class="text-[11px] text-slate-400">লোগো ইমেজ লিঙ্ক বা ফাইল আপলোড ও বিবরণসহ ব্র্যান্ড সংযোজন</p>
                </div>
                <button type="button" class="btn-secondary py-1 px-2.5 text-xs" onclick="switchAdminPage('page-prod-brands', 'group-products')">← ব্র্যান্ড কার্ডসমূহ</button>
              </div>

              <form id="form-add-brand-dedicated" class="space-y-3.5 text-xs" onsubmit="window.handleAdminAddBrand(event)">
                <div>
                  <label class="block font-bold mb-1">ব্র্যান্ডের নাম *</label>
                  <input type="text" id="adm-new-brand-name" required placeholder="Amazfit / Kieslect / Dream Organic" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
                </div>
                <div class="space-y-2">
                  <label class="block font-bold">লোগো ছবি (Image URL অথবা ফাইল আপলোড) *</label>
                  <input type="text" id="adm-new-brand-image" required placeholder="https://..." class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
                  <label class="btn-secondary py-1.5 px-3 text-xs font-bold cursor-pointer inline-block">
                    <span>📤 লোগো ফাইল আপলোড করুন</span>
                    <input type="file" accept="image/*" class="hidden" onchange="window.handleBrandLogoUpload(this)" />
                  </label>
                  <img id="adm-new-brand-logo-preview" src="" class="hidden w-16 h-16 rounded-2xl object-contain border p-1 bg-white" />
                </div>
                <div>
                  <label class="block font-bold mb-1">সংক্ষিপ্ত বিবরণ</label>
                  <textarea id="adm-new-brand-desc" rows="2" placeholder="অফিসিয়াল ব্র্যান্ড পার্টনার..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
                </div>
                <button type="submit" class="btn-primary py-2.5 px-6 font-bold">ব্র্যান্ড কার্ড সংরক্ষণ করুন →</button>
              </form>
            </div>
          </div>

          <!-- 11. Color/Size Variants List Page -->
          <div id="page-prod-variants" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <div>
                  <h3 class="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🎨</span> কালার ও সাইজ ভ্যারিয়েন্ট ম্যানেজমেন্ট (Add / Edit / Delete)
                  </h3>
                  <p class="text-[11px] text-slate-400">পণ্য যুক্ত করার সময় ব্যবহৃত রঙের নাম ও সাইজ স্কেল পরিবর্তন ও পরিচালনা</p>
                </div>
                <button class="btn-primary py-1.5 px-3.5 text-xs font-bold" onclick="switchAdminPage('page-prod-variant-add', 'group-products')">+ নতুন ভ্যারিয়েন্ট ফর্ম</button>
              </div>

              <!-- Dynamic Interactive Variants Container -->
              <div id="admin-variants-container">
                <!-- Populated dynamically by window.renderAdminVariantsList() -->
              </div>
            </div>
          </div>

          <!-- 12. Add Color/Size Page -->
          <div id="page-prod-variant-add" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-md">
              <div class="border-b pb-2">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন কালার বা সাইজ ভ্যারিয়েন্ট যুক্ত করুন</h3>
              </div>

              <form id="form-add-variant-dedicated" class="space-y-3.5 text-xs" onsubmit="window.handleAdminAddVariant(event)">
                <div>
                  <label class="block font-bold mb-1">ভ্যারিয়েন্ট ধরন</label>
                  <select id="adm-variant-type" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
                    <option value="color">রং (Color)</option>
                    <option value="size">সাইজ / ওজন (Size/Weight)</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold mb-1">ভ্যারিয়েন্টের নাম / মান *</label>
                  <input type="text" id="adm-variant-val" required placeholder="Ocean Blue / 2kg" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
                </div>
                <button type="submit" class="btn-primary py-2.5 px-6 font-bold">ভ্যারিয়েন্ট যোগ করুন →</button>
              </form>
            </div>
          </div>

          <!-- 13. Complete Banners & Slider CMS Page (Add, Edit, Delete, Status Toggle & Live Counters) -->
          <div id="page-prod-banners" class="admin-page-view hidden space-y-5">

            <!-- 4 Live Banner KPI Counter Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div class="admin-kpi-card p-3.5">
                <div class="flex items-center justify-between text-slate-400">
                  <span class="text-[10px] font-bold uppercase">মোট ব্যানার স্লাইড</span>
                  <span>🖼️</span>
                </div>
                <div id="banner-kpi-total" class="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">${banners.length} টি</div>
                <div class="text-[10px] text-emerald-600 font-bold">হোমপেজ ও ক্যাম্পেইন স্লাইডার</div>
              </div>

              <div class="admin-kpi-card p-3.5">
                <div class="flex items-center justify-between text-emerald-600">
                  <span class="text-[10px] font-bold uppercase">সক্রিয় ব্যানার (Active)</span>
                  <span>🟢</span>
                </div>
                <div id="banner-kpi-active" class="text-lg font-black text-emerald-600 mt-1 font-mono">
                  ${banners.filter(b => (b.status || 'Active') === 'Active').length} টি
                </div>
                <div class="text-[10px] text-emerald-600 font-bold">লাইভ প্রদর্শিত হচ্ছে</div>
              </div>

              <div class="admin-kpi-card p-3.5">
                <div class="flex items-center justify-between text-amber-500">
                  <span class="text-[10px] font-bold uppercase">নিষ্ক্রিয় / ড্রাফট</span>
                  <span>⏸️</span>
                </div>
                <div id="banner-kpi-inactive" class="text-lg font-black text-amber-500 mt-1 font-mono">
                  ${banners.filter(b => (b.status || 'Active') !== 'Active').length} টি
                </div>
                <div class="text-[10px] text-slate-400">সাময়িক বিরতিতে থাকা স্লাইড</div>
              </div>

              <div class="admin-kpi-card p-3.5">
                <div class="flex items-center justify-between text-indigo-500">
                  <span class="text-[10px] font-bold uppercase">টার্গেট লিংকযুক্ত</span>
                  <span>🔗</span>
                </div>
                <div id="banner-kpi-linked" class="text-lg font-black text-indigo-600 mt-1 font-mono">
                  ${banners.filter(b => Boolean((b.link_url || '').trim())).length} টি
                </div>
                <div class="text-[10px] text-slate-400">ক্লিকযোগ্য অফার লিংক</div>
              </div>
            </div>

            <!-- Main Banner Management Card -->
            <div class="dc-admin-card space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
                <div>
                  <h3 class="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🖼️</span> ব্যানার ও স্লাইডার CMS (<span id="banner-header-count-badge">${banners.length} টি স্লাইড</span>)
                  </h3>
                  <p class="text-[11px] text-slate-400">নতুন ব্যানার যোগ, এডিট, ডিলিট, পজিশন সাজানো এবং সক্রিয়/নিষ্ক্রিয় স্ট্যাটাস নিয়ন্ত্রণ</p>
                </div>
                <div class="flex flex-wrap items-center gap-1.5 text-xs">
                  <button type="button" class="btn-primary py-2 px-4 font-bold shadow" onclick="window.openAdminBannerModal('')">
                    + নতুন ব্যানার যুক্ত করুন
                  </button>
                  <button type="button" class="btn-secondary py-2 px-3" onclick="window.exportGenericCsv('Banners_Export', ['ID', 'Title', 'Subtitle', 'Image', 'Link', 'Status'], (window.getAdminBannersList ? window.getAdminBannersList() : []).map(b => [b.banner_id, b.title, b.subtitle, b.image_url, b.link_url, b.status]))">
                    📥 CSV
                  </button>
                  <button type="button" class="btn-secondary py-2 px-3" onclick="window.printActiveSection()">
                    🖨️ প্রিন্ট
                  </button>
                </div>
              </div>

              <!-- Filter Pills & Search Bar -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div class="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <button type="button" class="prod-status-filter-btn banner-filter-pill active" onclick="window.filterAdminBannersByStatus('all', this)">
                    সকল ব্যানার (<span id="banner-pill-count-all">${banners.length}</span>)
                  </button>
                  <button type="button" class="prod-status-filter-btn banner-filter-pill" onclick="window.filterAdminBannersByStatus('Active', this)">
                    সক্রিয় (<span id="banner-pill-count-active">${banners.filter(b => (b.status || 'Active') === 'Active').length}</span>)
                  </button>
                  <button type="button" class="prod-status-filter-btn banner-filter-pill" onclick="window.filterAdminBannersByStatus('Inactive', this)">
                    নিষ্ক্রিয় (<span id="banner-pill-count-inactive">${banners.filter(b => (b.status || 'Active') !== 'Active').length}</span>)
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="🔍 ব্যানার শিরোনাম বা লিংক দিয়ে খুঁজুন..."
                  oninput="window.searchAdminBanners(this.value)"
                  class="form-control text-xs py-1.5 px-3 rounded-xl w-full sm:w-72"
                />
              </div>

              <!-- Banners Grid Container -->
              <div id="admin-banners-grid-container" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"></div>
            </div>
          </div>

          <!-- Modal for Add / Edit Banner Slide -->
          <div id="modal-add-banner" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-lg w-full space-y-3.5 text-xs">
              <div class="flex items-center justify-between pb-2">
                <h4 id="modal-banner-header-title" class="font-black text-sm text-slate-900 dark:text-white">➕ নতুন ব্যানার স্লাইড তৈরি করুন</h4>
                <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-banner')?.classList.add('hidden')">✕</button>
              </div>
              <form id="form-add-banner-dedicated" class="space-y-3" onsubmit="window.handleAdminAddBanner(event)">
                <input type="hidden" id="adm-edit-banner-id" value="" />

                <div>
                  <label class="block font-bold mb-1">ব্যানার শিরোনাম (Title) *</label>
                  <input type="text" id="adm-new-banner-title" required placeholder="যেমন: স্মার্ট কিচেন ও নিরাপদ কুকিং গ্যাজেট" class="form-control text-xs w-full py-2 px-3 rounded-xl font-bold" />
                </div>

                <div>
                  <label class="block font-bold mb-1">সাবটাইটেল / অফার বিবরণ (Subtitle)</label>
                  <input type="text" id="adm-new-banner-subtitle" placeholder="যেমন: সর্বোচ্চ ৩০% বিশেষ ছাড় চলছে!" class="form-control text-xs w-full py-2 px-3 rounded-xl" />
                </div>

                <div class="space-y-2">
                  <label class="block font-bold">ব্যানার ছবি (Image URL অথবা ফাইল আপলোড) *</label>
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      id="adm-new-banner-image"
                      required
                      placeholder="https://images.unsplash.com/..."
                      oninput="const p=document.getElementById('adm-banner-modal-preview'); if(p){p.src=this.value; p.classList.remove('hidden');}"
                      class="form-control text-xs flex-1 py-2 px-3 rounded-xl font-mono"
                    />
                    <label class="btn-secondary py-2 px-3 text-xs font-bold cursor-pointer inline-flex items-center justify-center whitespace-nowrap">
                      <span>📤 ছবি ফাইল আপলোড</span>
                      <input type="file" accept="image/*" class="hidden" onchange="window.handleBannerFileUpload(this)" />
                    </label>
                  </div>
                  <img id="adm-banner-modal-preview" src="" class="hidden w-full h-32 object-cover rounded-2xl shadow-sm" onerror="this.classList.add('hidden')" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold mb-1">টার্গেট লিংক (Target URL)</label>
                    <input type="text" id="adm-new-banner-link" placeholder="/products?cat=Kitchen" value="/products" class="form-control text-xs w-full py-2 px-3 rounded-xl font-mono" />
                  </div>
                  <div>
                    <label class="block font-bold mb-1">বাটন টেক্সট (CTA Text)</label>
                    <input type="text" id="adm-new-banner-cta" placeholder="এখনই কিনুন →" value="এখনই কিনুন →" class="form-control text-xs w-full py-2 px-3 rounded-xl font-bold" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold mb-1">স্লাইড পজিশন / ক্রম</label>
                    <input type="number" id="adm-new-banner-pos" min="1" value="1" class="form-control text-xs w-full py-2 px-3 rounded-xl font-mono font-bold" />
                  </div>
                  <div>
                    <label class="block font-bold mb-1">স্ট্যাটাস (Status)</label>
                    <select id="adm-new-banner-status" class="form-control text-xs w-full py-2 px-3 rounded-xl font-bold">
                      <option value="Active">Active (সক্রিয়)</option>
                      <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
                    </select>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-2 pt-3">
                  <button type="button" class="btn-secondary py-2 px-4" onclick="document.getElementById('modal-add-banner')?.classList.add('hidden')">বাতিল</button>
                  <button type="submit" class="btn-primary py-2 px-6 font-bold">💾 ব্যানার সংরক্ষণ করুন ✓</button>
                </div>
              </form>
            </div>
          </div>

  `;
}

/**
 * DREAM CART BD — Bulk Product, Price & Image CSV Upload/Download Module (adminBulkTools.js)
 * Routes: /admin/bulk-upload, /admin/bulk-price, /admin/bulk-image
 */

export function renderBulkToolsModule({ categories = [] }) {
  return `
          <!-- 3. Bulk Product Upload Page (নমুনা সীট ডাউনলোড এবং সীট আপলোড করেই পণ্য আপডেট) -->
          <div id="page-prod-bulk-add" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-4xl">
              <div class="border-b pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white">📥 বাল্ক পণ্য আপলোড</h3>
                  <p class="text-[11px] text-slate-400">নমুনা সীট ডাউনলোড করুন এবং সীট ফাইল আপলোড করেই এক ক্লিকে সকল পণ্য যুক্ত বা আপডেট করুন</p>
                </div>
                <div class="flex flex-wrap gap-1.5 text-xs">
                  <button type="button" onclick="window.downloadBulkProductSampleSheet()" class="btn-primary py-1.5 px-3 font-bold">📥 নমুনা সীট ডাউনলোড (Sample CSV)</button>
                  <button type="button" onclick="window.exportAdminProductsCsv()" class="btn-secondary py-1.5 px-3 font-bold">📥 সকল পণ্যের সীট ডাউনলোড</button>
                </div>
              </div>

              <!-- Step 1 & Step 2 Upload Card -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2.5">
                  <div class="font-black text-slate-800 dark:text-white">ধাপ ১: নমুনা সীট ডাউনলোড ও প্রস্তুত করুন</div>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    ২৩-কলামের নমুনা সীট ডাউনলোড করে পণ্যের নাম ও ক্রয় মূল্য লিখুন। ক্যাটাগরি, ব্র্যান্ড বা বিক্রয় মূল্য খালি থাকলেও সীট আপলোড করার সাথে সাথে AI এবং টিয়ার ফর্মুলায় অটো হিসাব হয়ে যাবে!
                  </p>
                  <button type="button" onclick="window.downloadBulkProductSampleSheet()" class="btn-secondary py-2 px-4 font-bold w-full text-emerald-700 border-emerald-300">
                    📄 ২৩-কলাম নমুনা সীট ডাউনলোড করুন
                  </button>
                </div>

                <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-dashed border-emerald-400 dark:border-emerald-700 flex flex-col items-center justify-center text-center space-y-2.5">
                  <div class="text-2xl">📤</div>
                  <div class="font-black text-slate-900 dark:text-white">ধাপ ২: সীট আপলোড করেই পণ্য আপডেট করুন</div>
                  <p class="text-[10px] text-slate-500">আপনার পূরণকৃত CSV সীট ফাইল সিলেক্ট করলেই সাথে সাথে পণ্য আপলোড ও আপডেট হয়ে যাবে</p>
                  <label class="btn-primary py-2 px-5 font-bold cursor-pointer inline-block shadow">
                    <span>📂 সীট ফাইল নির্বাচন ও আপলোড করুন (.CSV)</span>
                    <input type="file" id="bulk-product-file-input" accept=".csv,.tsv,.txt" class="hidden" onchange="window.handleBulkProductSheetUpload(this)" />
                  </label>
                </div>
              </div>

              <!-- Uploaded Sheet Live Preview -->
              <div id="bulk-product-sheet-preview"></div>

              <!-- Manual CSV Textarea Paste Option -->
              <form onsubmit="window.handleBulkAddProducts(event)" class="space-y-3 text-xs pt-2 border-t">
                <label class="block font-bold text-slate-600 dark:text-slate-300">অথবা সরাসরি টেক্সট বক্সে CSV সারি পেস্ট করে আপলোড করুন:</label>
                <textarea id="adm-bulk-products-input" rows="5" class="form-control text-xs w-full p-3 rounded-xl border font-mono" placeholder="DC-10,স্মার্ট গ্যাজেট,Smartwatches,2450,1950,50,https://...&#10;DC-11,খাঁটি মধু ১ কেজি,Organic & Health,1200,950,30,https://..."></textarea>
                <button type="submit" class="btn-primary py-2 px-5 font-bold">একসাথে বাল্ক আপলোড করুন →</button>
              </form>
            </div>
          </div>

          <!-- 4. Bulk Price Update Page (নমুনা সীট ডাউনলোড এবং সীট আপলোড করেই প্রাইজ আপডেট) -->
          <div id="page-prod-bulk-price" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-4xl">
              <div class="border-b pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏷️ বাল্ক মূল্য পরিবর্তন</h3>
                  <p class="text-[11px] text-slate-400">নমুনা প্রাইজ সীট ডাউনলোড করুন এবং সীট আপলোড করেই সকল পণ্যের মূল্য আপডেট করুন</p>
                </div>
                <div class="flex flex-wrap gap-1.5 text-xs">
                  <button type="button" onclick="window.downloadBulkPriceSampleSheet(false)" class="btn-primary py-1.5 px-3 font-bold">📥 নমুনা প্রাইজ সীট ডাউনলোড</button>
                  <button type="button" onclick="window.downloadBulkPriceSampleSheet(true)" class="btn-secondary py-1.5 px-3 font-bold">📥 সকল পণ্যের বর্তমান প্রাইজ সীট</button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2.5">
                  <div class="font-black text-slate-800 dark:text-white">ধাপ ১: প্রাইজ নমুনা সীট ডাউনলোড করুন</div>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    কলামসমূহ: <code>SKU, P_Name, Buying_price, Selling_Price, Original_Price, WholeSale_price, Min_order_Q, Stock</code>।
                  </p>
                  <label class="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer pt-1">
                    <input type="checkbox" id="bulk-price-auto-tier-cb" checked class="w-4 h-4 rounded accent-emerald-600" />
                    <span>Buying_price থেকে টিয়ার ফর্মুলায় অটো Selling/Original/Wholesale হিসাব করুন</span>
                  </label>
                  <div class="flex gap-2 pt-1">
                    <button type="button" onclick="window.downloadBulkPriceSampleSheet(false)" class="btn-secondary py-2 px-3 font-bold flex-1">📄 নমুনা সীট</button>
                    <button type="button" onclick="window.downloadBulkPriceSampleSheet(true)" class="btn-secondary py-2 px-3 font-bold flex-1 text-emerald-700 border-emerald-300">📊 সকল পণ্যের সীট</button>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-dashed border-emerald-400 dark:border-emerald-700 flex flex-col items-center justify-center text-center space-y-2.5">
                  <div class="text-2xl">🏷️</div>
                  <div class="font-black text-slate-900 dark:text-white">ধাপ ২: সীট আপলোড করেই প্রাইজ আপডেট করুন</div>
                  <p class="text-[10px] text-slate-500">প্রাইজ সীট (.CSV) আপলোড করার সাথে সাথে স্বয়ংক্রিয়ভাবে প্রাইজ আপডেট হয়ে যাবে</p>
                  <label class="btn-primary py-2 px-5 font-bold cursor-pointer inline-block shadow">
                    <span>📤 প্রাইজ সীট আপলোড করুন (.CSV)</span>
                    <input type="file" id="bulk-price-file-input" accept=".csv,.tsv,.txt" class="hidden" onchange="window.handleBulkPriceSheetUpload(this)" />
                  </label>
                </div>
              </div>

              <!-- Live Preview of Uploaded Price Sheet -->
              <div id="bulk-price-sheet-preview"></div>

              <!-- Secondary Category Percentage Tool (Preserved) -->
              <form onsubmit="window.handleBulkPriceUpdate(event)" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-3 text-xs">
                <div class="font-bold text-slate-700 dark:text-slate-300">অথবা ক্যাটাগরি অনুযায়ী শতকরা (%) মূল্য বৃদ্ধি/হ্রাস করুন:</div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block font-bold mb-1">ক্যাটাগরি নির্ধারণ করুন</label>
                    <select id="adm-bulk-cat-target" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                      <option value="all">সকল ক্যাটাগরি</option>
                      ${categories.map(c => `<option value="${c.category}">${c.category}</option>`).join("")}
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold mb-1">পরিবর্তনের ধরন</label>
                    <select id="adm-bulk-price-type" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                      <option value="increase">মূল্য বৃদ্ধি (%)</option>
                      <option value="decrease">মূল্য হ্রাস (%)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold mb-1">শতাংশ (%)</label>
                    <div class="flex gap-2">
                      <input type="number" id="adm-bulk-pct" required value="5" min="1" max="100" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold font-mono bg-white dark:bg-slate-900" />
                      <button type="submit" class="btn-primary py-2 px-4 font-bold whitespace-nowrap">কার্যকর →</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- 5. Bulk Image Update Page (নমুনা সীট ডাউনলোড এবং সীট আপলোড করেই ছবি আপডেট) -->
          <div id="page-prod-bulk-image" class="admin-page-view hidden space-y-4">
            <div class="dc-admin-card space-y-4 max-w-4xl">
              <div class="border-b pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white">🖼️ বাল্ক ইমেজ আপডেট</h3>
                  <p class="text-[11px] text-slate-400">ইমেজ নমুনা সীট ডাউনলোড করুন এবং সীট আপলোড করেই এক ক্লিকে সকল পণ্যের ছবি আপডেট করুন</p>
                </div>
                <div class="flex flex-wrap gap-1.5 text-xs">
                  <button type="button" onclick="window.downloadBulkImageSampleSheet(false)" class="btn-primary py-1.5 px-3 font-bold">📥 নমুনা ইমেজ সীট ডাউনলোড</button>
                  <button type="button" onclick="window.downloadBulkImageSampleSheet(true)" class="btn-secondary py-1.5 px-3 font-bold">📥 সকল পণ্যের বর্তমান ইমেজ সীট</button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2.5">
                  <div class="font-black text-slate-800 dark:text-white">ধাপ ১: ইমেজ নমুনা সীট ডাউনলোড করুন</div>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    কলামসমূহ: <code>SKU, P_Name, Images</code>। প্রতিটি পণ্যের বিপরীতে এক বা একাধিক ছবির লিঙ্ক বসিয়ে সেভ করুন।
                  </p>
                  <div class="flex gap-2 pt-1">
                    <button type="button" onclick="window.downloadBulkImageSampleSheet(false)" class="btn-secondary py-2 px-3 font-bold flex-1">📄 নমুনা ইমেজ সীট</button>
                    <button type="button" onclick="window.downloadBulkImageSampleSheet(true)" class="btn-secondary py-2 px-3 font-bold flex-1 text-emerald-700 border-emerald-300">🖼️ সকল পণ্যের ইমেজ সীট</button>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-dashed border-emerald-400 dark:border-emerald-700 flex flex-col items-center justify-center text-center space-y-2.5">
                  <div class="text-2xl">🖼️</div>
                  <div class="font-black text-slate-900 dark:text-white">ধাপ ২: সীট আপলোড করেই ছবি আপডেট করুন</div>
                  <p class="text-[10px] text-slate-500">ইমেজ সীট (.CSV) আপলোড করলেই প্রিভিউসহ সকল পণ্যের ছবি আপডেট হয়ে যাবে</p>
                  <label class="btn-primary py-2 px-5 font-bold cursor-pointer inline-block shadow">
                    <span>📤 ইমেজ সীট আপলোড করুন (.CSV)</span>
                    <input type="file" id="bulk-image-file-input" accept=".csv,.tsv,.txt" class="hidden" onchange="window.handleBulkImageSheetUpload(this)" />
                  </label>
                </div>
              </div>

              <!-- Live Preview of Uploaded Image Sheet -->
              <div id="bulk-image-sheet-preview"></div>

              <!-- Secondary Category Image Replacement Tool (Preserved) -->
              <form onsubmit="window.handleBulkImageUpdate(event)" class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-3 text-xs">
                <div class="font-bold text-slate-700 dark:text-slate-300">অথবা নির্দিষ্ট ক্যাটাগরির সকল পণ্যে একই ছবি সেট করুন:</div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block font-bold mb-1">টার্গেট ক্যাটাগরি</label>
                    <select id="adm-bulk-image-cat" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900">
                      <option value="all">সকল পণ্য</option>
                      ${categories.map(c => `<option value="${c.category}">${c.category}</option>`).join("")}
                    </select>
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block font-bold mb-1">নতুন ছবির লিঙ্ক (Image URL) *</label>
                    <div class="flex gap-2">
                      <input type="url" id="adm-bulk-new-image" required placeholder="https://images.unsplash.com/..." class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                      <button type="submit" class="btn-primary py-2 px-4 font-bold whitespace-nowrap">ইমেজ আপডেট →</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

  `;
}

/**
 * DREAM CART BD — Multi-Landing Page Builder & Media CMS Module (adminLandingCms.js)
 * Route: /admin/landing
 */

export function renderLandingCmsModule({ products = [] }) {
  return `
          <!-- 14. Multi-Landing Pages CMS & Builder Page (একের অধিক ল্যান্ডিং পেজ, প্রোডাক্ট সার্চ করে অ্যাড, ব্যানার/ছবি/ভিডিও গ্যালারি) -->
          <div id="page-prod-landing" class="admin-page-view hidden space-y-5">

            <!-- Saved Landing Pages List Card -->
            <div class="dc-admin-card space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3">
                <div>
                  <h3 class="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🚀</span> মাল্টি-ল্যান্ডিং পেজ বিল্ডার ও ক্যাম্পেইন CMS
                  </h3>
                  <p class="text-[11px] text-slate-400">একের অধিক ল্যান্ডিং পেজ তৈরি করুন, প্রোডাক্ট সার্চ করে যুক্ত করুন এবং আকর্ষণীয় ব্যানার, ফটো গ্যালারি ও ভিডিও যুক্ত করুন</p>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <button type="button" onclick="window.startNewLandingPage()" class="btn-primary py-2 px-4 font-bold shadow">
                    + নতুন ল্যান্ডিং পেজ তৈরি করুন
                  </button>
                  <a href="/landing" target="_blank" class="btn-secondary py-2 px-3 font-bold">স্টোর ল্যান্ডিং ভিউ ↗</a>
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-xs font-bold text-slate-600 dark:text-slate-300">📑 আপনার তৈরি করা ল্যান্ডিং পেজসমূহ (একের অধিক ক্যাম্পেইন পেজ):</div>
                <div id="adm-saved-landing-pages-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  ${(window.getAdminLandingPages ? window.getAdminLandingPages() : []).map(lp => {
                    const safeId = String(lp.id).replace(/'/g, "\\'");
                    return `
                      <div class="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-emerald-500/60 transition flex flex-col justify-between space-y-3">
                        <div class="space-y-2.5">
                          <div class="relative h-32 rounded-2xl overflow-hidden border">
                            <img loading="lazy" decoding="async" src="${lp.hero_banner || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-3">
                              <div class="flex items-center justify-between">
                                <span class="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px]">${lp.id} • /landing?page=${lp.slug}</span>
                                <span class="badge ${lp.status === 'Active' ? 'badge-success' : 'badge-warning'} text-[9px]">${lp.status || 'Active'}</span>
                              </div>
                              <h4 class="text-white font-black text-xs mt-1 line-clamp-1">${lp.title}</h4>
                            </div>
                          </div>
                          <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">${lp.subtitle || ''}</p>
                          <div class="flex flex-wrap gap-1.5 text-[10px]">
                            <span class="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">📦 ${(lp.selected_products || []).length} টি পণ্য</span>
                            <span class="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">🖼️ ${(lp.banners || []).length + 1} টি ব্যানার</span>
                            <span class="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">🎬 ${(lp.videos || []).length} টি ভিডিও</span>
                          </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button type="button" onclick="window.openLandingPageLivePreview('${safeId}')" class="btn-primary py-1.5 px-3 text-[10px] font-bold flex-1">👁️ লাইভ প্রিভিউ</button>
                          <button type="button" onclick="window.editExistingLandingPage('${safeId}')" class="btn-secondary py-1.5 px-2.5 text-[10px] font-bold">✏️ এডিট</button>
                          <button type="button" onclick="window.duplicateLandingPage('${safeId}')" class="btn-secondary py-1.5 px-2 text-[10px]" title="ডুপ্লিকেট করুন">📑</button>
                          <button type="button" onclick="window.deleteLandingPage('${safeId}')" class="btn-secondary py-1.5 px-2 text-[10px] text-rose-600 border-rose-200" title="মুছুন">🗑️</button>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            </div>

          </div>

          <!-- 14B. Separate Standalone Add / Edit Landing Page Form View (Zero pre-filled default text; 100% Admin Controlled) -->
          <div id="page-prod-landing-add" class="admin-page-view hidden space-y-5">
            <div id="landing-builder-form-card" class="dc-admin-card space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <span id="adm-lp-editor-mode-badge" class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] mb-1">
                    নতুন ল্যান্ডিং পেজ তৈরি
                  </span>
                  <h4 class="font-black text-sm text-slate-900 dark:text-white">🛠️ ল্যান্ডিং পেজের সকল ডিটেইলস কনফিগারেশন (শিরোনাম, মূল্য, বিবরণ, স্পেসিফিকেশন, পণ্য, ব্যানার ও ভিডিও)</h4>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button type="button" onclick="window.switchAdminPage('page-prod-landing', 'group-products')" class="btn-secondary py-1.5 px-3.5 text-xs font-bold">
                    ← ল্যান্ডিং পেজ তালিকায় ফিরে যান
                  </button>
                  <button type="button" onclick="window.openLandingPageLivePreview(document.getElementById('adm-lp-id')?.value)" class="btn-primary py-1.5 px-3.5 text-xs font-bold">
                    👁️ আলাদা ট্যাবে লাইভ প্রিভিউ ↗
                  </button>
                </div>
              </div>

              <form class="space-y-5 text-xs" onsubmit="window.handleAdminSaveLandingConfig(event)">
                <input type="hidden" id="adm-lp-id" value="" />

                <!-- ১. ক্যাম্পেইন শিরোনাম, স্লাগ, মূল্য ও অফার তথ্য -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-3.5">
                  <div class="font-black text-xs text-slate-800 dark:text-white uppercase border-b pb-1.5">১. ক্যাম্পেইন শিরোনাম, স্লাগ, মূল্য ও অফার তথ্য</div>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="sm:col-span-2">
                      <label class="block font-bold mb-1">ল্যান্ডিং পেজের মূল শিরোনাম / হেডলাইন (Title) *</label>
                      <input type="text" id="adm-lp-title" required value="" placeholder="এখানে আপনার ল্যান্ডিং পেজের মূল শিরোনাম লিখুন..." oninput="const s=document.getElementById('adm-lp-slug'); if(s && !s.dataset.manual){ s.value = (this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ('campaign-' + Math.floor(100+Math.random()*900))); }" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">ল্যান্ডিং পেজ স্লাগ (URL Slug) *</label>
                      <input type="text" id="adm-lp-slug" required value="" oninput="this.dataset.manual='1'" placeholder="যেমন: eid-special-offer" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono bg-white dark:bg-slate-900" />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-bold mb-1">সাব-হেডলাইন / সংক্ষিপ্ত বিবরণ (Subtitle)</label>
                      <input type="text" id="adm-lp-subtitle" value="" placeholder="শিরোনামের নিচে দেখানোর জন্য সাব-হেডলাইন লিখুন (ঐচ্ছিক)..." class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">অফার ব্যাজ টেক্সট (Offer Badge)</label>
                      <input type="text" id="adm-lp-badge" value="" placeholder="যেমন: 🔥 স্পেশাল ডিসকাউন্ট অফার (ঐচ্ছিক)..." class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900" />
                    </div>
                  </div>

                  <!-- Pricing, Free Gift & Countdown -->
                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label class="block font-bold mb-1">রেগুলার মূল্য (Regular Price ৳)</label>
                      <input type="number" id="adm-lp-regular-price" value="" placeholder="যেমন: 3200 (ঐচ্ছিক)" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">অফার মূল্য (Offer Price ৳)</label>
                      <input type="number" id="adm-lp-offer-price" value="" placeholder="যেমন: 2599 (ঐচ্ছিক)" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold text-emerald-600 bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">কাউন্টডাউন টাইমার (ঘণ্টা)</label>
                      <input type="number" id="adm-lp-countdown-hours" value="" placeholder="যেমন: 24 (০ বা খালি রাখলে হাইড থাকবে)" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">অর্ডার বাটন টেক্সট (CTA Button)</label>
                      <input type="text" id="adm-lp-cta" value="" placeholder="যেমন: এখনই অর্ডার করুন" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold bg-white dark:bg-slate-900" />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block font-bold mb-1">উপরের প্রমো নোটিশ বার (Top Promo Bar Text)</label>
                      <input type="text" id="adm-lp-promo" value="" placeholder="পেজের একদম উপরে নোটিশ দেখাতে চাইলে লিখুন (খালি রাখলে দেখাবে না)..." class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">ফ্রি গিফট বা বিশেষ অফার নোট (Gift / Special Note)</label>
                      <input type="text" id="adm-lp-gift-note" value="" placeholder="বিশেষ উপহার বা অফার নোট থাকলে লিখুন (খালি রাখলে দেখাবে না)..." class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center pt-1">
                    <div>
                      <label class="block font-bold mb-1">কাস্টম কালার অপশন (কমা দিয়ে)</label>
                      <input type="text" id="adm-lp-colors" value="" placeholder="যেমন: Black, Maroon, Navy" class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">কাস্টম সাইজ অপশন (কমা দিয়ে)</label>
                      <input type="text" id="adm-lp-sizes" value="" placeholder="যেমন: M, L, XL বা 50, 52, 54" class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">ডিরেক্ট হটলাইন নম্বর</label>
                      <input type="text" id="adm-lp-hotline" value="" placeholder="যেমন: 01581703822" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
                    </div>
                    <div>
                      <label class="block font-bold mb-1">কালার থিম ও স্ট্যাটাস</label>
                      <div class="flex gap-1.5">
                        <select id="adm-lp-theme" class="form-control text-xs py-2 px-2 rounded-xl border font-bold bg-white dark:bg-slate-900 flex-1">
                          <option value="emerald">Emerald Green</option>
                          <option value="amber">Amber Gold</option>
                          <option value="indigo">Royal Indigo</option>
                          <option value="rose">Crimson Rose</option>
                        </select>
                        <select id="adm-lp-status" class="form-control text-xs py-2 px-2 rounded-xl border font-bold bg-white dark:bg-slate-900">
                          <option value="Active">Active</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="pt-1">
                    <label class="inline-flex items-center gap-2 cursor-pointer font-bold text-emerald-700 dark:text-emerald-300">
                      <input type="checkbox" id="adm-lp-free-shipping" class="w-4 h-4 accent-emerald-600 rounded" />
                      <span>🚚 এই ল্যান্ডিং পেজের অর্ডারে সম্পূর্ণ ফ্রি ডেলিভারি (৳০ ডেলিভারি চার্জ) প্রযোজ্য</span>
                    </label>
                  </div>
                </div>

                <!-- ২. ল্যান্ডিং পেজের জন্য প্রোডাক্ট সার্চ ও নির্বাচন -->
                <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/50 border border-emerald-200 dark:border-slate-700 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/70 dark:border-slate-700 pb-2">
                    <div>
                      <div class="font-black text-xs text-slate-900 dark:text-white uppercase">২. ল্যান্ডিং পেজের জন্য প্রোডাক্ট সার্চ ও নির্বাচন করুন</div>
                      <p class="text-[10px] text-slate-500">পণ্য সার্চ করে এই ল্যান্ডিং পেজে কোন কোন প্রোডাক্ট দেখাবে তা যুক্ত করুন</p>
                    </div>
                    <span id="adm-lp-selected-prod-count" class="badge badge-success text-xs font-bold">০ টি পণ্য নির্বাচিত</span>
                  </div>

                  <div class="flex gap-2">
                    <input
                      type="text"
                      id="adm-lp-prod-search"
                      placeholder="🔍 পণ্যের নাম, SKU, ব্র্যান্ড বা ক্যাটাগরি লিখে সার্চ করুন..."
                      oninput="window.searchProductsForLandingBuilder(this.value)"
                      onfocus="window.searchProductsForLandingBuilder(this.value)"
                      class="form-control text-xs py-2 px-3.5 rounded-xl border border-emerald-400 flex-1 bg-white dark:bg-slate-900 font-bold"
                    />
                    <button type="button" onclick="window.searchProductsForLandingBuilder('')" class="btn-secondary py-2 px-3 text-xs font-bold bg-white dark:bg-slate-900">সকল পণ্য দেখুন</button>
                  </div>

                  <div class="space-y-1.5">
                    <div class="text-[10px] font-bold text-slate-500">সার্চ ফলাফল (ক্লিক করে ল্যান্ডিং পেজে যুক্ত করুন):</div>
                    <div id="adm-lp-product-search-results" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1"></div>
                  </div>

                  <div class="space-y-1.5 pt-2 border-t border-emerald-200/60 dark:border-slate-700">
                    <div class="text-[11px] font-black text-emerald-800 dark:text-emerald-300">✅ এই ল্যান্ডিং পেজে প্রদর্শিত নির্বাচিত পণ্যসমূহ:</div>
                    <div id="adm-lp-selected-products-box" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"></div>
                  </div>
                </div>

                <!-- ৩. হিরো ব্যানার, ফটো গ্যালারি ও ভিডিও -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-4">
                  <div class="font-black text-xs text-slate-800 dark:text-white uppercase border-b pb-1.5">
                    ৩. মেইন হিরো ছবি/ব্যানার, অতিরিক্ত ফটো গ্যালারি ও ভিডিও
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <div class="md:col-span-2 space-y-2">
                      <label class="block font-bold">মেইন হিরো ব্যানার ছবি (Image URL অথবা ফাইল আপলোড)</label>
                      <div class="flex flex-col sm:flex-row gap-2">
                        <input type="text" id="adm-lp-hero-banner" value="" placeholder="ছবির ডিরেক্ট লিংক দিন অথবা পাশের বাটনে আপলোড করুন..." oninput="const p=document.getElementById('adm-lp-hero-preview-img'); if(p){ if(this.value){p.src=this.value; p.classList.remove('hidden');} else {p.classList.add('hidden');} }" class="form-control text-xs py-2 px-3 rounded-xl border flex-1 bg-white dark:bg-slate-900 font-mono" />
                        <label class="btn-secondary py-2 px-3.5 text-xs font-bold cursor-pointer inline-flex items-center justify-center whitespace-nowrap bg-white dark:bg-slate-900">
                          <span>📤 হিরো ছবি আপলোড</span>
                          <input type="file" accept="image/*" class="hidden" onchange="window.handleLandingHeroUpload(this)" />
                        </label>
                      </div>
                    </div>
                    <div>
                      <img id="adm-lp-hero-preview-img" src="" class="hidden w-full h-24 object-cover rounded-2xl border shadow-sm" onerror="this.classList.add('hidden')" />
                    </div>
                  </div>

                  <div class="space-y-2.5 pt-2 border-t">
                    <label class="block font-bold">🖼️ অতিরিক্ত ফটো গ্যালারি / ব্যানার সমূহ (একাধিক ছবি যুক্ত করতে পারেন)</label>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input type="text" id="adm-lp-add-banner-url" placeholder="ছবির লিঙ্ক (Image URL)..." class="form-control text-xs py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                      <input type="text" id="adm-lp-add-banner-caption" placeholder="ছবির ক্যাপশন (ঐচ্ছিক)..." class="form-control text-xs py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                      <div class="flex gap-1.5">
                        <button type="button" onclick="window.addBannerToLandingDraft()" class="btn-primary py-2 px-3 text-xs font-bold flex-1">+ ছবি যোগ</button>
                        <label class="btn-secondary py-2 px-3 text-xs font-bold cursor-pointer inline-flex items-center justify-center bg-white dark:bg-slate-900">
                          <span>📤 ফাইল আপলোড</span>
                          <input type="file" multiple accept="image/*" class="hidden" onchange="window.handleLandingGalleryFilesUpload(this)" />
                        </label>
                      </div>
                    </div>
                    <div id="adm-lp-banners-list" class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1"></div>
                  </div>

                  <div class="space-y-2.5 pt-2 border-t">
                    <label class="block font-bold">🎬 প্রোডাক্ট ভিডিও / রিভিউ ভিডিও (YouTube বা ভিডিও লিঙ্ক)</label>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input type="text" id="adm-lp-add-video-url" placeholder="YouTube ভিডিও লিঙ্ক (যেমন: https://youtu.be/...)..." class="form-control text-xs py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                      <input type="text" id="adm-lp-add-video-title" placeholder="ভিডিও শিরোনাম (ঐচ্ছিক)..." class="form-control text-xs py-2 px-3 rounded-xl border bg-white dark:bg-slate-900" />
                      <button type="button" onclick="window.addVideoToLandingDraft()" class="btn-primary py-2 px-4 text-xs font-bold">+ ভিডিও যুক্ত করুন</button>
                    </div>
                    <div id="adm-lp-videos-list" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1"></div>
                  </div>
                </div>

                <!-- ৪. বিস্তারিত বিবরণ, স্পেসিফিকেশন ও বিশেষ সুবিধাসমূহ -->
                <div class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border space-y-4">
                  <div class="font-black text-xs text-slate-800 dark:text-white uppercase border-b pb-1.5">
                    ৪. বিস্তারিত বিবরণ, পণ্যের স্পেসিফিকেশন ও বিশেষ সুবিধাসমূহ (যা লিখবেন শুধুমাত্র তাই পেজে দেখাবে)
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block font-bold mb-1">বিস্তারিত বিবরণ (Detailed Description)</label>
                      <textarea id="adm-lp-description" rows="4" placeholder="পণ্য বা অফার সম্পর্কে বিস্তারিত বিবরণ লিখুন (খালি রাখলে এই সেকশন হাইড থাকবে)..." class="form-control text-xs w-full p-3 rounded-xl border bg-white dark:bg-slate-900"></textarea>
                    </div>
                    <div>
                      <label class="block font-bold mb-1">পণ্যের স্পেসিফিকেশন (প্রতি লাইনে বৈশিষ্ট্য: বিবরণ লিখুন)</label>
                      <textarea id="adm-lp-specifications" rows="4" placeholder="যেমন:&#10;মডেল: প্রিমিয়াম এডিশন&#10;মেটেরিয়াল: ১০০% অরিজিনাল&#10;ওয়ারেন্টি: ১ বছর" class="form-control text-xs w-full p-3 rounded-xl border bg-white dark:bg-slate-900"></textarea>
                    </div>
                  </div>

                  <div>
                    <label class="block font-bold mb-1">বিশেষ সুবিধাসমূহ / কেন আমাদের থেকে কিনবেন (প্রতি লাইনে একটি করে পয়েন্ট লিখুন)</label>
                    <textarea id="adm-lp-features" rows="3" placeholder="প্রতি লাইনে একটি করে সুবিধা লিখুন (খালি রাখলে কোনো ডিফল্ট লেখা দেখাবে না)..." class="form-control text-xs w-full p-3 rounded-xl border bg-white dark:bg-slate-900"></textarea>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-3 pt-1">
                  <button type="submit" class="btn-primary py-3 px-8 font-black text-xs shadow-lg">💾 ল্যান্ডিং পেজ সংরক্ষণ ও পাবলিশ করুন →</button>
                  <button type="button" onclick="window.openLandingPageLivePreview(document.getElementById('adm-lp-id')?.value)" class="btn-secondary py-3 px-5 font-bold text-xs">👁️ লাইভ প্রিভিউ দেখুন</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Modal for Full Interactive Landing Page Live Preview -->
          <div id="modal-landing-live-preview" class="admin-modal-backdrop hidden">
            <div class="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto space-y-4 text-xs">
              <div class="flex items-center justify-between border-b pb-3 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div>
                  <span class="badge badge-success text-[10px]">LIVE LANDING PREVIEW</span>
                  <h4 class="font-black text-sm text-slate-900 dark:text-white mt-0.5">🚀 ল্যান্ডিং পেজ লাইভ প্রিভিউ</h4>
                </div>
                <button type="button" class="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100" onclick="document.getElementById('modal-landing-live-preview')?.classList.add('hidden')">✕ বন্ধ করুন</button>
              </div>
              <div id="landing-live-preview-content"></div>
            </div>
          </div>

          <!-- Modal for Add Banner -->

  `;
}

/**
 * DREAM CART BD — Dedicated Others & Operations Hub Module (adminOthers.js)
 * Route: /admin/others
 */

export function renderOthersModule({
  resellers = [],
  wholesalers = [],
  sellers = [],
  markets = [],
  couriers = [],
  onlinePayments = [],
  costs = [],
  buying = [],
  invest = [],
  offers = [],
  kpi = {}
}) {
  const sections = [
    {
      groupTitle: '📦 ক্যাটালগ ও বাল্ক টুলস (Catalog & Bulk Pages)',
      items: [
        { title: 'সকল পণ্য ক্যাটালগ', url: '/admin/products', pageId: 'page-prod-all', icon: '📦', desc: '১২০/পেজ, মাল্টি-ফিল্টার ও বাল্ক এডিট' },
        { title: 'নতুন পণ্য যোগ (AI)', url: '/admin/addproduct', pageId: 'page-prod-add', icon: '➕', desc: '২৩-কলাম AI অটো-ক্যাটাগরি ও স্ল্যাব প্রাইসিং' },
        { title: 'ক্যাটাগরি ম্যানেজমেন্ট', url: '/admin/categroy', pageId: 'page-prod-categories', icon: '🗂️', desc: 'ডুপ্লিকেট-মুক্ত ক্যাটাগরি ও সাব-ক্যাটাগরি' },
        { title: 'ব্র্যান্ড কার্ডসমূহ', url: '/admin/brands', pageId: 'page-prod-brands', icon: '🏷️', desc: 'অফিসিয়াল ব্র্যান্ড কার্ড শোকেস ও ফিল্টার' },
        { title: 'বাল্ক পণ্য আপলোড', url: '/admin/bulk-upload', pageId: 'page-prod-bulk-add', icon: '📥', desc: 'নমুনা শিট ডাউনলোড ও CSV আপলোড' },
        { title: 'বাল্ক মূল্য পরিবর্তন', url: '/admin/bulk-price', pageId: 'page-prod-bulk-price', icon: '💰', desc: 'শিট আপলোড করেই প্রাইজ আপডেট' },
        { title: 'বাল্ক ইমেজ আপডেট', url: '/admin/bulk-image', pageId: 'page-prod-bulk-image', icon: '🖼️', desc: 'শিট আপলোড করেই ছবি আপডেট' },
        { title: 'মাল্টি-ল্যান্ডিং পেজ CMS', url: '/admin/landing', pageId: 'page-prod-landing', icon: '🚀', desc: 'একাধিক ল্যান্ডিং পেজ ও প্রোডাক্ট সার্চ অ্যাড' }
      ]
    },
    {
      groupTitle: '🤝 পার্টনার, মার্কেটপ্লেস ও টিম নেটওয়ার্ক (Partners & Team)',
      items: [
        { title: `রিসেলার পার্টনার (${resellers.length})`, url: '/admin/resellers', pageId: 'page-partner-resellers', icon: '🤝', desc: 'রিসেলার ব্যালেন্স ও কমিশন ট্র্যাকিং' },
        { title: `পাইকারি ক্রেতা (${wholesalers.length})`, url: '/admin/wholesalers', pageId: 'page-partner-wholesalers', icon: '🏢', desc: 'হোলসেলার ডিসকাউন্ট টিয়ার ও অর্ডার' },
        { title: `মার্চেন্ট সেলার (${sellers.length})`, url: '/admin/sellers', pageId: 'page-partner-sellers', icon: '🏪', desc: 'ভেন্ডর স্টোর ও কমিশন মার্জিন' },
        { title: `অন্যান্য মার্কেটপ্লেস (${markets.length})`, url: '/admin/markets', pageId: 'page-partner-markets', icon: '🌐', desc: 'দারাজ, ফেসবুক শপ ও ক্যাটালগ সিঙ্ক' },
        { title: 'মাস্টার অ্যাডমিন', url: '/admin/admins', pageId: 'page-admin-users', icon: '👑', desc: 'সুপার অ্যাডমিন একাউন্টস' },
        { title: 'কর্মী ও স্টাফ টিম', url: '/admin/workers', pageId: 'page-admin-workers', icon: '👷', desc: 'অর্ডার, ডেলিভারি ও সাপোর্ট টিম' }
      ]
    },
    {
      groupTitle: '💰 ফাইন্যান্স, ইনভেন্টরি ও রিপোর্ট সেন্টার (Finance & Reports)',
      items: [
        { title: 'রিসেলার পে-আউট (-৩%)', url: '/admin/payouts', pageId: 'page-inv-payout', icon: '💳', desc: 'কমিশন উত্তোলন অনুমোদন' },
        { title: `ব্যবসায়িক খরচ (${formatCurrency(kpi.total_costs || 0)})`, url: '/admin/costs', pageId: 'page-inv-costs', icon: '💸', desc: 'মার্কেটিং, অফিস ভাড়া ও প্যাকিং ব্যয়' },
        { title: `পাইকারি ক্রয় (${formatCurrency(kpi.total_buying || 0)})`, url: '/admin/buying', pageId: 'page-inv-buying', icon: '🛒', desc: 'সাপ্লায়ার স্টক ক্রয় ইনভয়েস' },
        { title: `মূলধন বিনিয়োগ (${formatCurrency(kpi.total_invest || 0)})`, url: '/admin/invest', pageId: 'page-inv-invest', icon: '💼', desc: 'ইকুইটি ফান্ড ও বিনিয়োগ ট্র্যাকার' },
        { title: 'সার্বিক সেলস রিপোর্ট', url: '/admin/reports', pageId: 'page-report-sales', icon: '📊', desc: 'দৈনিক, মাসিক ও বাৎসরিক রাজস্ব হিসাব' },
        { title: 'সেলার ও রিসেলার রিপোর্ট', url: '/admin/report-reseller', pageId: 'page-report-reseller', icon: '📈', desc: 'পার্টনার পারফরম্যান্স অ্যানালিটিক্স' }
      ]
    },
    {
      groupTitle: '🚚 কুরিয়ার, ফ্রড চেকার ও সিস্টেম সেটিংস (Logistics & Settings)',
      items: [
        { title: `সংযুক্ত কুরিয়ার (${couriers.length})`, url: '/admin/couriers', pageId: 'page-courier-list', icon: '🚚', desc: 'Steadfast, Pathao ও RedX লাইভ ব্যালেন্স' },
        { title: 'নতুন কুরিয়ার API যুক্ত', url: '/admin/addcourier', pageId: 'page-courier-add', icon: '➕', desc: 'API Key, Secret ও Webhook কনফিগ' },
        { title: 'কাস্টমার ফ্রড চেকার', url: '/admin/fraud', pageId: 'page-courier-fraud', icon: '🛡️', desc: 'ফোন নম্বর দিয়ে ডেলিভারি ও রিটার্ন রেট যাচাই' },
        { title: `অনলাইন পেমেন্ট গেটওয়ে (${onlinePayments.length})`, url: '/admin/payments', pageId: 'page-courier-payments', icon: '💳', desc: 'bKash, SSLCommerz, Shurjopay ও Nagad' },
        { title: `অফার ও প্রমো কুপন (${offers.length})`, url: '/admin/offers', pageId: 'page-set-offers', icon: '🎁', desc: 'ডিসকাউন্ট কুপন কোড পরিচালনা' },
        { title: 'দোকানের তথ্য ও সেটিংস', url: '/admin/settings', pageId: 'page-set-info', icon: '⚙️', desc: 'নাম, লোগো, হটলাইন, ডেলিভারি চার্জ ও পাসওয়ার্ড' }
      ]
    }
  ];

  return `
    <div id="page-others-hub" class="admin-page-view space-y-5">
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🧩</span> অ্যাডমিন অল-ইন-ওয়ান পেজ ডিরেক্টরি ও কুইক হাব
            </h3>
            <p class="text-xs text-slate-500">প্রতিটি মডিউল আলাদা পেজ আকারে সাজানো হয়েছে — যেকোনো কার্ডে ক্লিক করে সরাসরি নির্ধারিত পেজে যান</p>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <a href="/admin/dashboard" class="btn-secondary py-1.5 px-3 font-bold">📊 ড্যাশবোর্ড</a>
            <a href="/admin/products" class="btn-primary py-1.5 px-3.5 font-bold">📦 সকল পণ্য</a>
          </div>
        </div>

        <div class="space-y-5">
          ${sections.map(sec => `
            <div class="space-y-2.5">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-500 px-1">${sec.groupTitle}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                ${sec.items.map(item => `
                  <a
                    href="${item.url}"
                    onclick="event.preventDefault(); window.switchAdminPage('${item.pageId}');"
                    class="admin-searchable-card p-4 flex flex-col justify-between gap-2.5 cursor-pointer group"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-lg shadow-sm">
                        ${item.icon}
                      </div>
                      <span class="font-mono text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        ${item.url}
                      </span>
                    </div>
                    <div>
                      <div class="font-black text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition">${item.title}</div>
                      <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${item.desc}</p>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function renderProductsModule(props = {}) {
  return [
    renderProductCatalogModule(props),
    renderAddProductModule(props),
    renderCategoryBrandModule(props),
    renderBulkToolsModule(props),
    renderLandingCmsModule(props),
    renderOthersModule(props)
  ].join('\n');
}

// ============================================================================
