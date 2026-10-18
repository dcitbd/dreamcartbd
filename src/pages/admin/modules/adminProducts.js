/**
 * DREAM CART BD — Product Management Module (adminProducts.js)
 * Implements:
 * - 120 items/page pagination & checkbox bulk actions
 * - Add product with live AI auto-categorization & 16-tier slab pricing
 * - Deduplicated Category Management (same category name never appears multiple times)
 * - Sample CSV download & upload parsers for products, prices, images
 * - Brands responsive visual cards
 * - Multi-landing page CMS with live product picker
 */

import { formatCurrency } from '../../../utils/format.js';

export function renderProductsModule({ products, categories, brands, variants, banners, kpi }) {
  // Deduplicate categories so identical names never show repeatedly
  const uniqueCatMap = new Map();
  categories.forEach(c => {
    const raw = (c.category || '').trim();
    if (raw && !uniqueCatMap.has(raw.toLowerCase())) {
      uniqueCatMap.set(raw.toLowerCase(), c);
    }
  });
  // Also include any categories found on products that might be missing
  products.forEach(p => {
    const raw = (p.category || '').trim();
    if (raw && !uniqueCatMap.has(raw.toLowerCase())) {
      uniqueCatMap.set(raw.toLowerCase(), {
        catagory_id: 'CAT-' + Math.floor(100 + Math.random() * 900),
        category: raw,
        sub_category: p.sub_category || 'General',
        chail_category: p.child_category || 'General Item',
        category_image: p.thumbnail || ''
      });
    }
  });
  const dedupedCategories = Array.from(uniqueCatMap.values());

  return `
    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: PRODUCT MANAGEMENT (15 Distinct Standalone Views)-->
    <!-- ================================================================= -->

    <!-- 1. All Products List (120/page Pagination, Select All Checkboxes, Bulk Actions) -->
    <div id="page-prod-all" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3.5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-2.5">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>📦</span> সকল পণ্য ক্যাটালগ ও ইনভেন্টরি (${products.length} টি পণ্য)
            </h3>
            <p class="text-[11px] text-slate-400">প্রতি পেজে ১২০টি পণ্য, চেকবক্স নির্বাচন করে বাল্ক প্রাইজ/স্টক/স্ট্যাটাস এডিট ও ডিলিট</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs flex-wrap">
            <button class="btn-primary py-1 px-3 font-bold" onclick="switchAdminPage('page-prod-add', 'group-products')">+ নতুন পণ্য যোগ</button>
            <button class="btn-secondary py-1 px-2.5 font-bold" onclick="switchAdminPage('page-prod-categories', 'group-products')">🗂️ ক্যাটাগরি তালিকা</button>
            <button class="btn-secondary py-1 px-2.5 font-bold" onclick="switchAdminPage('page-prod-bulk-add', 'group-products')">📥 বাল্ক যোগ</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.downloadSampleProductCsv()">নমুনা শিট 📥</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Products_All', ['SKU', 'Name', 'Category', 'Price', 'Stock'], products.map(p => [p.sku, p.name, p.category, p.selling_price, p.stock]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Search & Status Filter Buttons -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div class="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder="পণ্যের নাম, SKU, ক্যাটাগরি বা ব্র্যান্ড সার্চ..." 
              class="form-control text-xs py-1.5 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full" 
              oninput="window.filterAdminProducts(this.value)" 
            />
            <span class="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            <button class="prod-status-filter-btn active" onclick="window.filterAdminProductStatus('all', this)">সকল (${products.length})</button>
            <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('low', this)">লো স্টক (&lt;৫)</button>
            <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('out', this)">আউট অব স্টক (০)</button>
            <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('active', this)">সক্রিয়</button>
            <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('inactive', this)">নিষ্ক্রিয়</button>
            <button class="prod-status-filter-btn" onclick="window.filterAdminProductStatus('error', this)">ত্রুটিযুক্ত</button>
          </div>
        </div>

        <!-- Sticky Bulk Operations Action Bar for Products -->
        <div id="bulk-products-actions-bar" class="hidden p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs dc-bulk-bar">
          <div class="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <span>✓ <span id="bulk-prod-selected-count">0</span> টি পণ্য নির্বাচিত:</span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button class="btn-primary py-1 px-3 text-[10px] font-bold" onclick="window.handleBulkProductsAction('price')">🏷️ প্রাইজ পরিবর্তন</button>
            <button class="btn-secondary py-1 px-2.5 text-[10px] font-bold" onclick="window.handleBulkProductsAction('stock')">📦 স্টক পরিবর্তন</button>
            <button class="btn-secondary py-1 px-2.5 text-[10px] font-bold" onclick="window.handleBulkProductsAction('status')">🔄 স্ট্যাটাস পরিবর্তন</button>
            <button class="btn-secondary py-1 px-2 text-[10px] font-bold text-rose-600 border-rose-300 hover:bg-rose-50" onclick="window.handleBulkProductsAction('delete')">🗑️ ডিলিট</button>
          </div>
        </div>

        <!-- Products Table with Checkboxes -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[10px]">
                <th class="py-2.5 px-2 text-center w-8">
                  <input type="checkbox" id="prod-select-all-master" onchange="window.toggleSelectAllProducts(this)" title="বর্তমান পেজের সব নির্বাচন করুন" />
                </th>
                <th class="py-2.5 px-3">ছবি</th>
                <th class="py-2.5 px-3">SKU ও নাম</th>
                <th class="py-2.5 px-3">ক্যাটাগরি</th>
                <th class="py-2.5 px-3">খুচরা দর (ক্লিক এডিট)</th>
                <th class="py-2.5 px-3">হোলসেল দর</th>
                <th class="py-2.5 px-3">স্টক (ক্লিক এডিট)</th>
                <th class="py-2.5 px-3">স্ট্যাটাস</th>
                <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800" id="admin-products-tbody">
              ${products.slice(0, 120).map(p => {
                const isLow = Number(p.stock) > 0 && Number(p.stock) <= 5;
                const isOut = Number(p.stock) === 0;
                const pId = p.product_id || p.sku;
                return `
                  <tr class="admin-prod-row hover:bg-slate-50 dark:hover:bg-slate-800/40 transition" data-id="${pId}">
                    <td class="py-2.5 px-2 text-center">
                      <input type="checkbox" value="${pId}" class="prod-select-cb" onchange="window.updateBulkProductsBar()" />
                    </td>
                    <td class="py-2.5 px-3">
                      <img src="${p.thumbnail || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                    </td>
                    <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white max-w-xs">
                      <div class="line-clamp-1">${p.name}</div>
                      <div class="font-mono text-[10px] text-slate-400">${p.sku || 'SKU-NA'} | ${p.brand || 'No Brand'}</div>
                    </td>
                    <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400">${p.category || 'General'}</td>
                    <td class="py-2.5 px-3 font-bold text-emerald-600 font-mono cursor-pointer hover:underline" onclick="window.inlineEditProduct('${pId}', 'selling_price', ${p.selling_price || 0}, this)" title="ক্লিক করে বিক্রয় দর এডিট করুন">
                      ৳${p.selling_price || 0} ✎
                    </td>
                    <td class="py-2.5 px-3 font-mono">${formatCurrency(p.wholesale_price || (p.selling_price * 0.85))}</td>
                    <td class="py-2.5 px-3">
                      <span class="font-bold px-2 py-0.5 rounded text-[11px] cursor-pointer hover:underline ${isOut ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400' : (isLow ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400')}" onclick="window.inlineEditProduct('${pId}', 'stock', ${p.stock || 0}, this)" title="ক্লিক করে স্টক এডিট করুন">
                        ${p.stock || 0} পিস ✎
                      </span>
                    </td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${p.status === 'নিষ্ক্রিয়' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'}" onclick="window.toggleProductActive('${pId}', this)">
                        ${p.status || 'সক্রিয়'}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <a href="/product/${p.slug || pId}" target="_blank" class="btn-secondary py-1 px-2 text-[10px]">দেখুন ↗</a>
                      <button class="btn-secondary py-1 px-2 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50" onclick="window.handleAdminDeleteProduct('${pId}', this)">মুছুন</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer (120 per page) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t text-xs">
          <div id="admin-prod-pagination-info" class="text-slate-500">
            মোট ${products.length} টির মধ্যে ১ - ${Math.min(120, products.length)} টি প্রদর্শিত (প্রতি পেজে ১২০টি পণ্য)
          </div>
          <div id="admin-prod-pagination-controls">
            <div class="flex items-center gap-1.5">
              <button class="btn-secondary py-1 px-2.5 text-xs font-bold opacity-40 cursor-not-allowed" disabled>← পূর্ববর্তী</button>
              <button class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white border border-emerald-600">১</button>
              ${products.length > 120 ? `<button class="px-2.5 py-1 rounded-lg text-xs font-bold border bg-white dark:bg-slate-800" onclick="window.renderProductsTablePage(2)">২</button>` : ''}
              <button class="btn-secondary py-1 px-2.5 text-xs font-bold ${products.length <= 120 ? 'opacity-40 cursor-not-allowed' : ''}" onclick="window.renderProductsTablePage(2)" ${products.length <= 120 ? 'disabled' : ''}>পরবর্তী →</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Add Product Page (With AI Auto-Categorization, 16-Tier Slabs & Full Specified Columns) -->
    <div id="page-prod-add" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-4xl">
        <div class="border-b pb-2.5 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>➕</span> নতুন পণ্য যোগ করুন (AI Auto-Categorization & 16-Tier Slab Pricing)
            </h3>
            <p class="text-[11px] text-slate-400">পণ্যের নাম লেখার সাথে সাথে AI ক্যাটাগরি, ব্র্যান্ড ও ডাইমেনশন নির্ধারণ করবে। ক্রয় মূল্য দিলে খুচরা, পাইকারি ও মূল দর স্বয়ংক্রিয় হিসাব হবে।</p>
          </div>
          <button class="btn-secondary py-1 px-2.5 text-xs" onclick="switchAdminPage('page-prod-all', 'group-products')">← সকল পণ্য তালিকায় ফিরে যান</button>
        </div>

        <!-- AI Status Match Banner -->
        <div id="adm-ai-match-badge" class="hidden p-3 rounded-2xl dc-ai-badge text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          ✨ <b>AI ম্যাচিং সফল:</b> ক্যাটাগরি ও সাব-ক্যাটাগরি স্বয়ংক্রিয় সংযুক্ত হয়েছে!
        </div>

        <form id="form-add-product-dedicated" class="space-y-4 text-xs" onsubmit="window.handleAdminAddProduct(event)">
          
          <!-- 1. SKU & 2. P_Name -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">১. SKU কোড (Manual Type) *</label>
              <div class="flex gap-1.5">
                <input type="text" id="adm-add-sku" required placeholder="DCBD-WT-09" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
                <button type="button" class="btn-secondary py-1 px-2 text-[10px]" onclick="document.getElementById('adm-add-sku').value='DCBD-'+Math.floor(1000+Math.random()*9000)" title="স্বয়ংক্রিয় SKU তৈরি">🎲</button>
              </div>
            </div>
            <div class="sm:col-span-2">
              <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">২. পণ্যের পূর্ণ নাম (P_Name - টাইপ করলেই AI সক্রিয় হবে) *</label>
              <input 
                type="text" 
                id="adm-add-name" 
                required 
                placeholder="যেমন: Amazfit GTS 4 Smartwatch / অটো গ্যাস সেফটি ডিভাইস / খাঁটি চাকের মধু" 
                class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold text-slate-900 dark:text-white"
                oninput="window.handleAiProductAnalyze(this.value)"
              />
            </div>
          </div>

          <!-- 3. Category, 4. Sub_Category, 5. Child_Category & 6. Brand -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>🤖</span> AI ট্যাক্সোনমি ও ব্র্যান্ড ডিটেকশন (Auto Calculate + Manual Override)
              </span>
              <span class="text-[10px] text-emerald-600 font-bold">নাম থেকে স্বয়ংক্রিয় সিলেক্ট হবে</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">৩. Category (Deduplicated) *</label>
                <select id="adm-add-cat" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
                  ${dedupedCategories.map(c => `<option value="${c.category}">${c.category}</option>`).join("")}
                </select>
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">৪. Sub_Category *</label>
                <input type="text" id="adm-add-subcat" placeholder="Smart Calling Watch" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">৫. Child_Category</label>
                <input type="text" id="adm-add-childcat" placeholder="Men & Women Fitness" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">৬. Brand *</label>
                  <button type="button" class="text-[10px] text-emerald-600 font-bold hover:underline" onclick="const nb=prompt('নতুন ব্র্যান্ডের নাম লিখুন:'); if(nb){ const be=document.getElementById('adm-add-brand'); if(be){ be.value=nb; } }">+ নতুন</button>
                </div>
                <input type="text" id="adm-add-brand" placeholder="Amazfit / Dream Organic" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
              </div>
            </div>
          </div>

          <!-- 7. Buying_Price, 8. Selling_Price, 9. Stock, 10. Original_Price, 11. WholeSale_price, 12. Min_order_Q -->
          <div class="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>💰</span> ১৬-টিয়ার স্বয়ংক্রিয় প্রাইসিং স্ল্যাব ও স্টক নির্ধারণ
              </span>
              <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">ক্রয় মূল্য দিলে বাকি ৩টি দর অটো হিসাব হবে</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">৭. Buying_price (৳) *</label>
                <input 
                  type="number" 
                  id="adm-add-buyprice" 
                  required 
                  placeholder="1000" 
                  class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-bold font-mono"
                  oninput="window.handlePricingAutoCalc()"
                />
              </div>

              <div>
                <label class="block font-bold mb-1 text-emerald-700 dark:text-emerald-400">৮. Selling_Price (Auto + Manual)</label>
                <input 
                  type="number" 
                  id="adm-add-sellprice" 
                  required 
                  placeholder="1400" 
                  class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-black font-mono text-emerald-600"
                  oninput="window.handleSellingPriceManualChange()"
                />
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">৯. Stock (পিস) *</label>
                <input 
                  type="number" 
                  id="adm-add-stock" 
                  required 
                  value="50" 
                  class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-bold font-mono"
                />
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-500">১০. Original_Price (MRP)</label>
                <input 
                  type="number" 
                  id="adm-add-origprice" 
                  placeholder="2030" 
                  class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-mono line-through text-slate-400"
                />
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">১১. WholeSale_price (৳)</label>
                <input 
                  type="number" 
                  id="adm-add-wholesaleprice" 
                  placeholder="1280" 
                  class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-bold font-mono"
                />
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">১২. Min_order_Q</label>
                <input 
                  type="number" 
                  id="adm-add-minorder" 
                  value="5" 
                  class="form-control text-xs w-full py-2 px-2.5 rounded-xl border font-bold font-mono"
                />
              </div>
            </div>
          </div>

          <!-- 13. Images & 14. Slug -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2 space-y-2">
              <label class="block font-bold text-slate-700 dark:text-slate-300">১৩. Images (ছবির লিঙ্ক অথবা ফাইল আপলোড - প্রিভিউসহ) *</label>
              <div class="flex gap-2">
                <input 
                  type="url" 
                  id="adm-add-imageurl" 
                  required 
                  placeholder="https://images.unsplash.com/... অথবা নিচে ফাইল সিলেক্ট করুন" 
                  class="form-control text-xs flex-1 py-2 px-3 rounded-xl border"
                  oninput="const p=document.getElementById('adm-image-preview'); if(p){ p.src=this.value; document.getElementById('adm-image-preview-wrap')?.classList.remove('hidden'); }"
                />
                <label class="btn-secondary py-2 px-3 text-xs font-bold cursor-pointer whitespace-nowrap">
                  📁 ফাইল আপলোড
                  <input type="file" accept="image/*" class="hidden" onchange="window.handleProductImageFilePreview(event)" />
                </label>
              </div>

              <div id="adm-image-preview-wrap" class="hidden flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border">
                <img id="adm-image-preview" src="" class="w-16 h-16 rounded-lg object-cover border" alt="Preview" />
                <span class="text-[11px] text-emerald-600 font-bold">✓ ছবির প্রিভিউ সফলভাবে লোড হয়েছে</span>
              </div>
            </div>

            <div>
              <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">১৪. Slug (Auto / Article)</label>
              <input type="text" id="adm-add-slug" placeholder="amazfit-gts-4" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
            </div>
          </div>

          <!-- 15. Description, 16. Specification & 17. Others -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">১৫. Description (পণ্য বিবরণ)</label>
              <textarea id="adm-add-desc" rows="3" placeholder="পণ্যের মূল ব্যবহার ও বিশেষত্ব..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
            </div>
            <div>
              <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">১৬. Specification (স্পেসিফিকেশন)</label>
              <textarea id="adm-add-spec" rows="3" placeholder="রং, সাইজ, ব্যাটারি ব্যাকআপ, মেটেরিয়াল..." class="form-control text-xs w-full p-2.5 rounded-xl border font-mono"></textarea>
            </div>
            <div>
              <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">১৭. Others (অন্যান্য তথ্য)</label>
              <textarea id="adm-add-others" rows="3" placeholder="ওয়ারেন্টি পলিসি, রিটার্ন ইত্যাদি..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
            </div>
          </div>

          <!-- 18. Color, 19. Size, 20. WEIGHT_KG, 21. WIDTH_CM, 22. LENGTH_CM, 23. HEIGHT_CM -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 dark:text-white">ভ্যারিয়েন্ট ও পরিমাপ (Color, Size & Dimensions)</span>
              <span class="text-[10px] text-slate-400">কুরিয়ার ও ওজনের হিসাবের জন্য স্বয়ংক্রিয় গণনা</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">১৮. Color</label>
                  <button type="button" class="text-[9px] text-emerald-600 font-bold hover:underline" onclick="window.handleInlineAddVariant('color')">+ যোগ</button>
                </div>
                <select id="adm-add-color" class="form-control text-xs w-full py-2 px-2 rounded-xl border font-bold">
                  <option value="Jet Black">Jet Black</option>
                  <option value="Space Silver">Space Silver</option>
                  <option value="Midnight Blue">Midnight Blue</option>
                  <option value="Red">Red</option>
                  <option value="Natural Amber">Natural Amber</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">১৯. Size</label>
                  <button type="button" class="text-[9px] text-emerald-600 font-bold hover:underline" onclick="window.handleInlineAddVariant('size')">+ যোগ</button>
                </div>
                <select id="adm-add-size" class="form-control text-xs w-full py-2 px-2 rounded-xl border font-bold">
                  <option value="Free Size">Free Size</option>
                  <option value="Regular">Regular</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="XL">XL</option>
                  <option value="১ কেজি">১ কেজি</option>
                  <option value="৫০০ গ্রাম">৫০০ গ্রাম</option>
                </select>
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">২০. WEIGHT_KG</label>
                <input type="number" step="0.01" id="adm-add-weight" placeholder="0.25" class="form-control text-xs w-full py-2 px-2 rounded-xl border font-mono font-bold" />
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">২১. WIDTH_CM</label>
                <input type="number" step="0.1" id="adm-add-width" placeholder="8.0" class="form-control text-xs w-full py-2 px-2 rounded-xl border font-mono font-bold" />
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">২২. LENGTH_CM</label>
                <input type="number" step="0.1" id="adm-add-length" placeholder="12.0" class="form-control text-xs w-full py-2 px-2 rounded-xl border font-mono font-bold" />
              </div>

              <div>
                <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">২৩. HEIGHT_CM</label>
                <input type="number" step="0.1" id="adm-add-height" placeholder="4.0" class="form-control text-xs w-full py-2 px-2 rounded-xl border font-mono font-bold" />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button type="submit" class="btn-primary py-2.5 px-8 font-bold text-xs shadow-lg">পণ্য ক্যাটালগে সংরক্ষণ করুন →</button>
            <button type="button" class="btn-secondary py-2.5 px-5 text-xs font-bold" onclick="document.getElementById('form-add-product-dedicated')?.reset()">রিসেট</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 3. Deduplicated Category Management Page (ক্যাটাগরি তালিকা) -->
    <div id="page-prod-categories" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-2.5">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🗂️</span> ডুপ্লিকেট-মুক্ত ক্যাটাগরি তালিকা (${dedupedCategories.length} টি ক্যাটাগরি)
            </h3>
            <p class="text-[11px] text-slate-400">একই নামের ক্যাটাগরি বারবার আসবে না। এখান থেকে সাব-ক্যাটাগরি ও নতুন ক্যাটাগরি পরিচালনা করুন।</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('form-add-category-box')?.scrollIntoView({ behavior: 'smooth' })">+ নতুন ক্যাটাগরি</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Categories', ['ID', 'Category', 'Sub Category'], dedupedCategories.map(c=>[c.catagory_id, c.category, c.sub_category]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Categories Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[10px]">
                <th class="py-2.5 px-3">ছবি</th>
                <th class="py-2.5 px-3">ক্যাটাগরি নাম</th>
                <th class="py-2.5 px-3">আইডি</th>
                <th class="py-2.5 px-3">সাব-ক্যাটাগরি সমূহ</th>
                <th class="py-2.5 px-3">সংযুক্ত পণ্য</th>
                <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${dedupedCategories.map(c => {
                const count = products.filter(p => (p.category || '').toLowerCase() === (c.category || '').toLowerCase()).length;
                return `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td class="py-2.5 px-3">
                      <img src="${c.category_image || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" class="w-10 h-10 rounded-xl object-cover border" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                    </td>
                    <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white text-sm">
                      ${c.category}
                    </td>
                    <td class="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                      ${c.catagory_id || 'CAT-NA'}
                    </td>
                    <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      ${c.sub_category || 'General'}
                    </td>
                    <td class="py-2.5 px-3 font-bold font-mono text-emerald-600">
                      ${count} টি পণ্য
                    </td>
                    <td class="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <a href="/products?cat=${encodeURIComponent(c.category)}" target="_blank" class="btn-secondary py-1 px-2.5 text-[10px]">পণ্য দেখুন ↗</a>
                      <button class="btn-secondary py-1 px-2 text-[10px] text-rose-600 border-rose-200" onclick="window.handleDeleteCategory('${c.category.replace(/'/g, "\\'")}')">মুছুন</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <!-- Add Category Form -->
        <div id="form-add-category-box" class="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border space-y-3 max-w-xl text-xs">
          <h4 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন ক্যাটাগরি তৈরি করুন (ডুপ্লিকেট সুরক্ষা সহ)</h4>
          <form id="form-add-category-dedicated" onsubmit="window.handleAdminAddCategory(event)" class="space-y-3">
            <div>
              <label class="block font-bold mb-1">ক্যাটাগরি নাম *</label>
              <input type="text" id="adm-new-cat-name" required placeholder="Smartwatches / Kitchen / Organic" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">সাব-ক্যাটাগরি সমূহ (কমা দিয়ে লিখুন)</label>
              <input type="text" id="adm-new-cat-sub" placeholder="Smart Calling Watch, AMOLED Watch, Fitness Watch" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">চাইল্ড ক্যাটাগরি (কমা দিয়ে লিখুন)</label>
              <input type="text" id="adm-new-cat-child" placeholder="Men, Women, Kids" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">ক্যাটাগরি ছবি URL</label>
              <input type="url" id="adm-new-cat-image" placeholder="https://images.unsplash.com/..." class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
            </div>
            <button type="submit" class="btn-primary py-2 px-6 font-bold">ক্যাটাগরি সংরক্ষণ করুন →</button>
          </form>
        </div>
      </div>
    </div>

    <!-- 4. Add Bulk Product Page -->
    <div id="page-prod-bulk-add" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-2xl">
        <div class="border-b pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>📥</span> বাল্ক পণ্য আপলোড (Bulk Product Import via CSV)
            </h3>
            <p class="text-[11px] text-slate-400">নমুনা শিট ডাউনলোড করুন এবং পূরণ করে আপলোড করলেই পণ্যসমূহ ডাটাবেজে যুক্ত হবে</p>
          </div>
          <button class="btn-primary py-1.5 px-3 text-xs font-bold" onclick="window.downloadSampleProductCsv()">
            📥 নমুনা শিট ডাউনলোড
          </button>
        </div>

        <div class="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 font-black text-2xl mx-auto flex items-center justify-center">📄</div>
          <div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">সিএসভি (CSV) ফাইল সিলেক্ট করুন</h4>
            <p class="text-[11px] text-slate-400">ডাউনলোডকৃত নমুনা শিটটির ফরম্যাটে ফাইলটি পূরণ করে এখানে আপলোড করুন</p>
          </div>
          <input type="file" accept=".csv" id="adm-bulk-product-file-input" class="hidden" onchange="window.handleUploadBulkProductsCsv(event)" />
          <button type="button" class="btn-primary py-2.5 px-6 font-bold text-xs" onclick="document.getElementById('adm-bulk-product-file-input').click()">
            📁 ফাইল নির্বাচন ও আপলোড করুন
          </button>
        </div>
      </div>
    </div>

    <!-- 5. Bulk Price Update Page -->
    <div id="page-prod-bulk-price" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-xl">
        <div class="border-b pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏷️</span> বাল্ক মূল্য পরিবর্তন (Bulk Price Update)
            </h3>
            <p class="text-[11px] text-slate-400">নমুনা শিট ডাউনলোড করে প্রাইজ পরিবর্তন করুন অথবা পার্সেন্টেজ আকারে বাড়ান/কমান</p>
          </div>
          <button class="btn-primary py-1.5 px-3 text-xs font-bold" onclick="window.downloadSamplePriceCsv()">
            📥 প্রাইজ নমুনা শিট
          </button>
        </div>

        <div class="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-center space-y-2.5 text-xs">
          <div class="font-bold text-slate-900 dark:text-white">১. শিট আপলোড করে প্রাইজ পরিবর্তন:</div>
          <input type="file" accept=".csv" id="adm-bulk-price-file-input" class="hidden" onchange="window.handleUploadBulkPriceCsv(event)" />
          <button type="button" class="btn-primary py-2 px-5 font-bold" onclick="document.getElementById('adm-bulk-price-file-input').click()">
            📤 প্রাইজ শিট আপলোড করুন
          </button>
        </div>

        <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-3 text-xs">
          <div class="font-bold text-slate-900 dark:text-white">২. অথবা শতকরা (%) হারে সকল বা নির্দিষ্ট ক্যাটাগরির মূল্য পরিবর্তন:</div>
          <form onsubmit="window.handleBulkPriceUpdate(event)" class="space-y-3">
            <div>
              <label class="block font-bold mb-1">ক্যাটাগরি নির্ধারণ করুন</label>
              <select id="adm-bulk-cat-target" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
                <option value="all">সকল ক্যাটাগরি</option>
                ${dedupedCategories.map(c => `<option value="${c.category}">${c.category}</option>`).join("")}
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">পরিবর্তনের ধরন</label>
                <select id="adm-bulk-price-type" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
                  <option value="increase">মূল্য বৃদ্ধি (%)</option>
                  <option value="decrease">মূল্য হ্রাস (%)</option>
                </select>
              </div>
              <div>
                <label class="block font-bold mb-1">শতাংশ (%)</label>
                <input type="number" id="adm-bulk-pct" required value="5" min="1" max="100" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold font-mono" />
              </div>
            </div>
            <button type="submit" class="btn-primary py-2 px-6 font-bold">শতকরা মূল্য কার্যকর করুন</button>
          </form>
        </div>
      </div>
    </div>

    <!-- 6. Bulk Image Update Page -->
    <div id="page-prod-bulk-image" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-xl">
        <div class="border-b pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🖼️</span> বাল্ক ইমেজ আপডেট (Bulk Image Update)
            </h3>
            <p class="text-[11px] text-slate-400">নমুনা শিট ডাউনলোড করে ছবির লিঙ্ক পরিবর্তন করুন এবং আপলোড করুন</p>
          </div>
          <button class="btn-primary py-1.5 px-3 text-xs font-bold" onclick="window.downloadSampleImageCsv()">
            📥 ইমেজ নমুনা শিট
          </button>
        </div>

        <div class="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-center space-y-2.5 text-xs">
          <div class="font-bold text-slate-900 dark:text-white">১. শিট আপলোড করে ছবি পরিবর্তন:</div>
          <input type="file" accept=".csv" id="adm-bulk-image-file-input" class="hidden" onchange="window.handleUploadBulkImageCsv(event)" />
          <button type="button" class="btn-primary py-2 px-5 font-bold" onclick="document.getElementById('adm-bulk-image-file-input').click()" >
            📤 ইমেজ শিট আপলোড করুন
          </button>
        </div>
      </div>
    </div>

    <!-- 7. Low Stock Products (<5 Pcs) -->
    <div id="page-prod-low-stock" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-amber-500">⚠️</span> লো-স্টক পণ্য তালিকা (Stock &lt; 5 Pcs)
          </h3>
          <span class="badge badge-warning text-xs font-bold">মোট ${kpi.low_stock_count} টি পণ্য</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          ${products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).map(p => `
            <div class="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-3">
              <img src="${p.thumbnail || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" class="w-12 h-12 rounded-xl object-cover border border-amber-200 flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="font-bold text-slate-900 dark:text-white truncate">${p.name}</div>
                <div class="text-[10px] text-slate-400 font-mono">${p.sku} | ৳${p.selling_price}</div>
                <div class="text-[11px] font-bold text-amber-600 mt-0.5">মজুদ: ${p.stock} পিস মাত্র</div>
              </div>
              <button class="btn-primary py-1 px-2.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950" onclick="window.inlineEditProduct('${p.product_id || p.sku}', 'stock', ${p.stock}, this)">+ স্টক যোগ</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 8. Out of Stock Products (0 Pcs) -->
    <div id="page-prod-out-stock" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-rose-500">🚫</span> স্টক শূন্য পণ্য তালিকা (Out of Stock - 0 Pcs)
          </h3>
          <span class="badge badge-danger text-xs font-bold">মোট ${kpi.out_of_stock_count} টি পণ্য</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          ${products.filter(p => Number(p.stock) === 0).map(p => `
            <div class="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3">
              <img src="${p.thumbnail || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" class="w-12 h-12 rounded-xl object-cover border border-rose-200 flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="font-bold text-slate-900 dark:text-white truncate">${p.name}</div>
                <div class="text-[10px] text-slate-400 font-mono">${p.sku}</div>
                <div class="text-[11px] font-bold text-rose-600 mt-0.5">স্টক শেষ (০ পিস)</div>
              </div>
              <button class="btn-primary py-1 px-2.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white" onclick="window.inlineEditProduct('${p.product_id || p.sku}', 'stock', 0, this)">স্টক দিন</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 9. Error Products Page -->
    <div id="page-prod-error" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-indigo-500">⚙️</span> ত্রুটিযুক্ত পণ্য যাচাই (Error Products)
          </h3>
        </div>
        <div class="space-y-2 text-xs">
          ${products.filter(p => !p.sku || !p.thumbnail || !p.selling_price).map(p => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between gap-3">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${p.name}</div>
                <div class="text-[10px] text-rose-500 font-mono">ত্রুটি: ${!p.sku ? 'SKU অনুপস্থিত • ' : ''}${!p.thumbnail ? 'ছবি অনুপস্থিত • ' : ''}${!p.selling_price ? 'মূল্য অনুপস্থিত' : ''}</div>
              </div>
              <button class="btn-secondary py-1 px-3 text-[10px]" onclick="window.inlineEditProduct('${p.product_id || p.sku}', 'selling_price', ${p.selling_price || 0}, this)">সংশোধন করুন</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 10. Brands Showcase (Visual Cards) -->
    <div id="page-prod-brands" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3.5">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏷️</span> অফিসিয়াল ব্র্যান্ড পার্টনার তালিকা (${brands.length} টি ব্র্যান্ড)
            </h3>
            <p class="text-[11px] text-slate-400">কার্ড আকারে ব্র্যান্ড লোগো, বিবরণ ও সংযুক্ত পণ্যের সংখ্যা</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="switchAdminPage('page-prod-brand-add', 'group-products')">+ নতুন ব্র্যান্ড</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Brands', ['Brand ID', 'Name', 'Description'], brands.map(b => [b.brand_id, b.brand_name, b.brand_description]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          ${brands.map(b => {
            const bCount = products.filter(p => p.brand && p.brand.toLowerCase() === b.brand_name.toLowerCase()).length;
            return `
              <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dc-brand-admin-card flex items-start gap-3.5">
                <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img src="${b.brand_image}" class="w-full h-full object-contain" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                </div>
                <div class="min-w-0 flex-1 space-y-1">
                  <div class="flex items-center justify-between">
                    <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">${b.brand_name}</h4>
                    <span class="badge badge-success text-[9px] font-mono">${bCount} টি পণ্য</span>
                  </div>
                  <div class="font-mono text-[10px] text-slate-400">${b.brand_id || 'BRD-01'}</div>
                  <p class="text-[11px] text-slate-500 line-clamp-2">${b.brand_description || 'অথেন্টিক ব্র্যান্ড পার্টনার।'}</p>
                  <div class="pt-2 flex items-center gap-2">
                    <a href="/products?brand=${encodeURIComponent(b.brand_name)}" target="_blank" class="text-[10px] text-emerald-600 font-bold hover:underline">পণ্যসমূহ দেখুন ↗</a>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>

    <!-- 11. Add Brand Page -->
    <div id="page-prod-brand-add" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-md">
        <div class="border-b pb-2 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন ব্র্যান্ড যুক্ত করুন</h3>
            <p class="text-[11px] text-slate-400">লোগো ইমেজ লিঙ্ক ও বিবরণসহ ব্র্যান্ড সংযোজন</p>
          </div>
          <button class="btn-secondary py-1 px-2 text-xs" onclick="switchAdminPage('page-prod-brands', 'group-products')">← ব্র্যান্ড কার্ডে ফিরুন</button>
        </div>

        <form id="form-add-brand-dedicated" class="space-y-3.5 text-xs" onsubmit="window.handleAdminAddBrand(event)">
          <div>
            <label class="block font-bold mb-1">ব্র্যান্ডের নাম *</label>
            <input type="text" id="adm-new-brand-name" required placeholder="Amazfit / HK / Kiam" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">লোগো ছবি (Image URL) *</label>
            <input type="url" id="adm-new-brand-image" required placeholder="https://..." class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">সংক্ষিপ্ত বিবরণ</label>
            <textarea id="adm-new-brand-desc" rows="2" placeholder="অফিসিয়াল ব্র্যান্ড পরিচিতি..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
          </div>
          <button type="submit" class="btn-primary py-2.5 px-6 font-bold">ব্র্যান্ড সংরক্ষণ করুন →</button>
        </form>
      </div>
    </div>

    <!-- 12. Variants Page -->
    <div id="page-prod-variants" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🎨 কালার ও সাইজ ভ্যারিয়েন্ট কনফিগারেশন</h3>
          <button class="btn-primary py-1 px-3 text-xs font-bold" onclick="switchAdminPage('page-prod-variant-add', 'group-products')">+ নতুন ভ্যারিয়েন্ট</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
            <h5 class="font-bold text-slate-900 dark:text-white">উপলব্ধ কালার শেডস:</h5>
            <div class="flex flex-wrap gap-1.5">
              ${variants.colors.map(c => `
                <span class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border text-slate-700 dark:text-slate-200 font-bold text-[11px] shadow-sm">${c}</span>
              `).join("")}
            </div>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
            <h5 class="font-bold text-slate-900 dark:text-white">উপলব্ধ সাইজ ও ওজন স্কেল:</h5>
            <div class="flex flex-wrap gap-1.5">
              ${variants.sizes.map(s => `
                <span class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border text-slate-700 dark:text-slate-200 font-bold text-[11px] shadow-sm">${s}</span>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 13. Add Variant Page -->
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

    <!-- 14. Banners CMS Page -->
    <div id="page-prod-banners" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🖼️ ব্যানার ও স্লাইডার CMS (${banners.length} টি স্লাইড)</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-banner')?.classList.remove('hidden')">+ ব্যানার স্লাইড</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Banners', ['ID', 'Title', 'Link', 'Status'], banners.map(b => [b.banner_id, b.title, b.link_url, b.status]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div class="space-y-2.5 text-xs">
          ${banners.map(bn => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <img src="${bn.image_url}" class="w-20 h-12 rounded-xl object-cover border" onerror="this.src='https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400';" />
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">${bn.title}</div>
                  <div class="text-[10px] text-slate-400">${bn.subtitle}</div>
                </div>
              </div>
              <span class="badge badge-success text-[10px]">Active</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 15. Multi-Landing Page Builder CMS -->
    <div id="page-prod-landing" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🚀</span> মাল্টি-ল্যান্ডিং পেজ কনটেন্ট CMS (Multi-Landing Page Funnel Builder)
            </h3>
            <p class="text-[11px] text-slate-400">একের অধিক ল্যান্ডিং পেজ তৈরি করুন, পণ্য সার্চ করে যুক্ত করুন, ব্যানার ও ভিডিও কনফিগ করুন</p>
          </div>
          <div class="flex items-center gap-2">
            <a href="/landing" target="_blank" class="btn-secondary py-1 px-3 text-xs font-bold">লাইভ ভিউ ↗</a>
          </div>
        </div>

        <div class="space-y-2.5">
          <h4 class="font-bold text-xs text-slate-900 dark:text-white">তৈরিকৃত ল্যান্ডিং পেজসমূহ:</h4>
          <div id="admin-landing-pages-list" class="space-y-2">
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200" class="w-16 h-12 rounded-xl object-cover border flex-shrink-0" />
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">গ্যাস সেফটি ডিভাইস মেগা ফানেল</div>
                  <div class="text-[10px] text-slate-400 font-mono">URL: /landing/gas-safety-deal • পণ্য: ১টি</div>
                  <div class="text-[10px] text-emerald-600 font-bold">বিশেষ ৪০% ছাড় + ফ্রি হোম ডেলিভারি</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <a href="/landing" target="_blank" class="btn-primary py-1 px-3 text-[10px] font-bold">লাইভ দেখুন ↗</a>
                <button class="btn-secondary py-1 px-2.5 text-[10px] text-rose-600 border-rose-200" onclick="alert('ল্যান্ডিং পেজ ডিলিট হবে না (ডিফল্ট)')">মুছুন</button>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border space-y-3.5">
          <div class="border-b pb-2">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন ল্যান্ডিং পেজ তৈরি করুন (Add New Landing Funnel)</h4>
          </div>

          <form id="form-add-landing-page" class="space-y-3.5 text-xs" onsubmit="window.handleAdminSaveLandingPage(event)">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">ল্যান্ডিং পেজ শিরোনাম (Title) *</label>
                <input type="text" id="adm-lp-title" required placeholder="স্মার্টওয়াচ সেলস মেগা অফার" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">URL স্ল্যাগ (Slug - যেমন: smartwatch-deal) *</label>
                <input type="text" id="adm-lp-slug" required placeholder="smartwatch-offer" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">মূল ব্যানার ইমেজ URL *</label>
                <input type="url" id="adm-lp-banner" required placeholder="https://images.unsplash.com/..." class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
              </div>
              <div>
                <label class="block font-bold mb-1">ভিডিও এম্বেড URL (YouTube Embed / MP4)</label>
                <input type="url" id="adm-lp-video" placeholder="https://www.youtube.com/embed/..." class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">আকর্ষণীয় বাংলা স্লোগান / হেডলাইন *</label>
                <input type="text" id="adm-lp-headline" required placeholder="প্রিমিয়াম গ্যাজেট এখন সরাসরি আপনার দোরগোড়ায় ক্যাশ অন ডেলিভারিতে!" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">অফার ব্যাজ টেক্সট</label>
                <input type="text" id="adm-lp-badge" value="সীমিত সময়ের অফার: ৩০% ছাড় + ফ্রি ডেলিভারি" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold text-emerald-600" />
              </div>
            </div>

            <div class="p-3 bg-white dark:bg-slate-900 rounded-xl border space-y-2">
              <label class="block font-bold text-slate-900 dark:text-white">
                🎯 ল্যান্ডিং পেজে যেসকল পণ্য প্রদর্শন করতে চান (পণ্য সার্চ করে যোগ করুন):
              </label>
              <div class="relative">
                <input 
                  type="text" 
                  id="adm-landing-prod-search" 
                  placeholder="পণ্যের নাম বা SKU লিখে সার্চ করুন..." 
                  class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold"
                  oninput="window.searchAndAddProductToLanding(this.value)"
                />
                <div id="adm-landing-search-results" class="hidden absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border rounded-xl shadow-xl max-h-48 overflow-y-auto"></div>
              </div>

              <div id="adm-landing-selected-chips" class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-slate-400 text-xs">কোনো পণ্য নির্বাচন করা হয়নি (উপরে সার্চ করে যোগ করুন)</span>
              </div>
            </div>

            <div>
              <label class="block font-bold mb-1">অতিরিক্ত গ্যালারি ছবিসমূহ (প্রতি লাইনে একটি করে Image URL)</label>
              <textarea id="adm-lp-gallery" rows="2" placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..." class="form-control text-xs w-full p-2.5 rounded-xl border font-mono"></textarea>
            </div>

            <button type="submit" class="btn-primary py-2.5 px-6 font-bold text-xs">ল্যান্ডিং পেজ সংরক্ষণ ও পাবলিশ করুন →</button>
          </form>
        </div>
      </div>
    </div>
  `;
}
