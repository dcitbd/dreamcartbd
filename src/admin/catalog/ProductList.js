/**
 * ============================================================================
 * DREAM CART BD — ADMIN PRODUCT LIST & INLINE EDITOR (ProductList.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { ProductAPI } from "../../../api/products.js";
import { InlineEditor } from "../../../components/InlineEditor.js";

export const ProductList = async () => {
  let products = [];
  try {
    const res = await ProductAPI.getAll();
    products = res.items || res || [];
  } catch (e) {
    console.error("Failed to fetch admin products:", e);
  }

  const html = `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/products")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Action Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-success text-xs mb-1">ক্যাটালগ হাব</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">প্রোডাক্ট ও ইনভেন্টরি তালিকা</h1>
            <p class="text-xs text-slate-500 mt-1">টেবিলের প্রাইস ও স্টক সরাসরি এডিট করুন (গুগল শীটে অটো-সিঙ্ক হবে)</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="window.SyncEngine.forceSync()" class="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> শীট সিঙ্ক
            </button>
            <a href="/admin/products/create" class="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2">
              <i data-lucide="plus-circle" class="w-4 h-4"></i> নতুন প্রোডাক্ট
            </a>
          </div>
        </div>

        <!-- Master Products Table -->
        <div id="product-table-wrapper" class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern">
              <thead>
                <tr>
                  <th>প্রোডাক্ট তথ্য</th>
                  <th>SKU / কোড</th>
                  <th>ক্রয় মূল্য</th>
                  <th>বিক্রয় মূল্য (ইনলাইন)</th>
                  <th>স্টক (ইনলাইন)</th>
                  <th>স্ট্যাটাস</th>
                  <th class="text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                ${products.length === 0 ? `
                  <tr><td colspan="7" class="text-center py-12 text-slate-400">কোনো প্রোডাক্ট পাওয়া যায়নি।</td></tr>
                ` : products.map(p => `
                  <tr>
                    <td>
                      <div class="flex items-center gap-3">
                        <img src="${p.thumbnail || 'https://placehold.co/60x60'}" class="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-slate-100 dark:border-slate-800" />
                        <div>
                          <a href="/product/${p.product_id}" target="_blank" class="font-bold text-slate-900 dark:text-white hover:text-brand-500 line-clamp-1">
                            ${p.product_name}
                          </a>
                          <span class="text-[11px] text-slate-400">${p.product_type || 'Simple Product'}</span>
                        </div>
                      </div>
                    </td>
                    <td class="font-mono text-xs font-bold text-slate-500">${p.sku || 'N/A'}</td>
                    <td class="font-semibold text-slate-400">৳${p.purchase_price || 0}</td>
                    
                    <!-- ⚡ Live Inline Price Editor Cell -->
                    <td>
                      ${InlineEditor.renderPriceCell(p.product_id, p.selling_price || p.regular_price, "selling_price")}
                    </td>

                    <!-- ⚡ Live Inline Stock Editor Cell -->
                    <td>
                      ${InlineEditor.renderStockCell(p.product_id, p.stock || 0)}
                    </td>

                    <td>
                      <span class="${p.status === 'active' ? 'badge-success' : 'badge-warning'} text-[11px]">
                        ${p.status || 'Active'}
                      </span>
                    </td>

                    <td class="text-right space-x-2">
                      <a href="/admin/products/edit/${p.product_id}" class="p-2 inline-block rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                      </a>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  `;

  // Attach Inline Listeners after DOM Mount
  setTimeout(() => {
    const wrapper = document.getElementById("product-table-wrapper");
    if (wrapper) InlineEditor.attachListeners(wrapper);
  }, 100);

  return html;
};
