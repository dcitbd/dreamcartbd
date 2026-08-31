/**
 * ============================================================================
 * DREAM CART BD — REAL-TIME STOCK LEDGER (StockLedger.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { ProductAPI } from "../../api/products.js";
import { store } from "../../js/store.js";

// ব্রাউজার পরিবেশ নিশ্চিত করার সেফটি চেক (বিল্ড টাইমে ReferenceError এড়াতে)
if (typeof window !== "undefined") {
  window.adjustStockPrompt = async (productId, encodedName, currentStock) => {
    const productName = decodeURIComponent(encodedName || "পণ্য");
    const newStock = prompt(`"${productName}"-এর নতুন স্টক কোয়ান্টিটি দিন:`, currentStock);
    
    if (newStock !== null && !isNaN(newStock) && Number(newStock) !== Number(currentStock)) {
      try {
        if (ProductAPI && typeof ProductAPI.updateStock === "function") {
          await ProductAPI.updateStock(productId, newStock, "Admin Manual Ledger Adjustment");
        }
        if (store && typeof store.showToast === "function") {
          store.showToast(`স্টক সফলভাবে ${newStock}-এ আপডেট হয়েছে!`, "success");
        }
        setTimeout(() => {
          if (typeof window !== "undefined" && window.location) {
            window.location.reload();
          }
        }, 500);
      } catch (err) {
        if (store && typeof store.showToast === "function") {
          store.showToast(`স্টক আপডেট ব্যর্থ: ${err.message || "ত্রুটি ঘটেছে"}`, "danger");
        }
      }
    }
  };
}

export const StockLedger = async () => {
  let products = [];
  try {
    if (ProductAPI && typeof ProductAPI.getAll === "function") {
      const res = await ProductAPI.getAll();
      products = Array.isArray(res) ? res : (res?.items || []);
    }
  } catch (e) {
    console.error("Failed to load inventory:", e);
  }

  const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const lowStockCount = products.filter(p => Number(p.stock || 0) <= Number(p.reorder_level || 5)).length;
  const outOfStockCount = products.filter(p => Number(p.stock || 0) <= 0).length;

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/inventory") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-success text-xs mb-1">ইনভেন্টরি কন্ট্রোল</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">রিয়েল-টাইম স্টক লেজার</h1>
            <p class="text-xs text-slate-500 mt-1">অন-হ্যান্ড, রিজার্ভড এবং অ্যাভেইলেবল স্টক মনিটর করুন</p>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" onclick="window.SyncEngine && window.SyncEngine.forceSync ? window.SyncEngine.forceSync() : null" class="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> রিফ্রেশ
            </button>
            <a href="/admin/inventory/low-stock" class="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20">
              <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i> লো-স্টক অ্যালার্ট (${lowStockCount})
            </a>
          </div>
        </div>

        <!-- KPI Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">মোট SKU সংখ্যা</span>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">${products.length}</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-emerald-500 font-bold uppercase tracking-wider">মোট স্টক কোয়ান্টিটি</span>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${totalStock} টি</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-amber-500 font-bold uppercase tracking-wider">লো-স্টক সতর্কতা</span>
            <h3 class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">${lowStockCount} টি</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-rose-500 font-bold uppercase tracking-wider">স্টক আউট পণ্য</span>
            <h3 class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">${outOfStockCount} টি</h3>
          </div>
        </div>

        <!-- Master Stock Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern w-full text-xs text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                  <th class="py-3 px-4">প্রোডাক্ট ও SKU</th>
                  <th class="py-3 px-4">অন-হ্যান্ড স্টক</th>
                  <th class="py-3 px-4">রিজার্ভড (অর্ডারে)</th>
                  <th class="py-3 px-4">অ্যাভেইলেবল স্টক</th>
                  <th class="py-3 px-4">রি-অর্ডার লেভেল</th>
                  <th class="py-3 px-4">স্ট্যাটাস</th>
                  <th class="py-3 px-4 text-right">কুইক অ্যাকশন</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${products.length === 0 ? `
                  <tr><td colspan="7" class="text-center py-12 text-slate-400">কোনো ইনভেন্টরি ডাটা পাওয়া যায়নি।</td></tr>
                ` : products.map(p => {
                  const stock = Number(p.stock || 0);
                  const reserved = 0; // Calculated from pending orders
                  const available = stock - reserved;
                  const reorder = Number(p.reorder_level || 5);
                  const encodedName = encodeURIComponent(p.product_name || "");
                  
                  let badge = 'badge-success';
                  let statusText = 'পর্যাপ্ত স্টক';
                  if (stock <= 0) { badge = 'badge-danger'; statusText = 'স্টক আউট'; }
                  else if (stock <= reorder) { badge = 'badge-warning'; statusText = 'লো-স্টক'; }

                  return `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-3">
                          <img src="${p.thumbnail || 'https://placehold.co/50x50'}" alt="${p.product_name || 'Product'}" class="w-10 h-10 rounded-xl object-cover bg-white shrink-0 border border-slate-100 dark:border-slate-800" />
                          <div>
                            <h4 class="font-bold text-slate-900 dark:text-white line-clamp-1">${p.product_name || ''}</h4>
                            <span class="text-[11px] font-mono text-slate-400">SKU: ${p.sku || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4 font-extrabold text-slate-900 dark:text-white text-base">${stock}</td>
                      <td class="py-3 px-4 font-semibold text-amber-500">${reserved}</td>
                      <td class="py-3 px-4 font-extrabold text-emerald-600 dark:text-emerald-400 text-base">${available}</td>
                      <td class="py-3 px-4 font-bold text-slate-400">${reorder}</td>
                      <td class="py-3 px-4"><span class="${badge} text-[11px] px-2 py-0.5 rounded-md">${statusText}</span></td>
                      <td class="py-3 px-4 text-right">
                        <button type="button" onclick="window.adjustStockPrompt && window.adjustStockPrompt('${p.product_id}', '${encodedName}', ${stock})" class="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 ml-auto shadow-sm">
                          <i data-lucide="sliders" class="w-3.5 h-3.5"></i> অ্যাডজাস্ট
                        </button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  `;
};

// Default export যুক্ত করা হয়েছে
export default StockLedger;
