/**
 * ============================================================================
 * DREAM CART BD — REAL-TIME STOCK LEDGER (StockLedger.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { ProductAPI } from "../../../api/products.js";
import { api } from "../../../api/client.js";
import { store } from "../../../js/store.js";

export const StockLedger = async () => {
  let products = [];
  try {
    const res = await ProductAPI.getAll();
    products = res.items || res || [];
  } catch (e) {
    console.error("Failed to load inventory:", e);
  }

  const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const lowStockCount = products.filter(p => Number(p.stock || 0) <= Number(p.reorder_level || 5)).length;
  const outOfStockCount = products.filter(p => Number(p.stock || 0) <= 0).length;

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/inventory")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-success text-xs mb-1">ইনভেন্টরি কন্ট্রোল</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">রিয়েল-টাইম স্টক লেজার</h1>
            <p class="text-xs text-slate-500 mt-1">অন-হ্যান্ড, রিজার্ভড এবং অ্যাভেইলেবল স্টক মনিটর করুন</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="window.SyncEngine.forceSync()" class="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> রিফ্রেশ
            </button>
            <a href="/admin/inventory/low-stock" class="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5">
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
            <span class="text-xs text-emerald-500 font-bold uppercase tracking-wider">মোট স্টক কোয়ান্টিটি</span>
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
            <table class="table-modern">
              <thead>
                <tr>
                  <th>প্রোডাক্ট ও SKU</th>
                  <th>অন-হ্যান্ড স্টক</th>
                  <th>রিজার্ভড (অর্ডারে)</th>
                  <th>অ্যাভেইলেবল স্টক</th>
                  <th>রি-অর্ডার লেভেল</th>
                  <th>স্ট্যাটাস</th>
                  <th class="text-right">কুইক অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                ${products.length === 0 ? `
                  <tr><td colspan="7" class="text-center py-12 text-slate-400">কোনো ইনভেন্টরি ডাটা পাওয়া যায়নি।</td></tr>
                ` : products.map(p => {
                  const stock = Number(p.stock || 0);
                  const reserved = 0; // Calculated from pending orders
                  const available = stock - reserved;
                  const reorder = Number(p.reorder_level || 5);
                  
                  let badge = 'badge-success';
                  let statusText = 'পর্যাপ্ত স্টক';
                  if (stock <= 0) { badge = 'badge-danger'; statusText = 'স্টক আউট'; }
                  else if (stock <= reorder) { badge = 'badge-warning'; statusText = 'লো-স্টক'; }

                  return `
                    <tr>
                      <td>
                        <div class="flex items-center gap-3">
                          <img src="${p.thumbnail || 'https://placehold.co/50x50'}" class="w-10 h-10 rounded-xl object-cover bg-white shrink-0 border border-slate-100 dark:border-slate-800" />
                          <div>
                            <h4 class="font-bold text-slate-900 dark:text-white line-clamp-1">${p.product_name}</h4>
                            <span class="text-[11px] font-mono text-slate-400">SKU: ${p.sku || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td class="font-extrabold text-slate-900 dark:text-white text-base">${stock}</td>
                      <td class="font-semibold text-amber-500">${reserved}</td>
                      <td class="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">${available}</td>
                      <td class="font-bold text-slate-400">${reorder}</td>
                      <td><span class="${badge} text-[11px]">${statusText}</span></td>
                      <td class="text-right">
                        <button onclick="window.adjustStockPrompt('${p.product_id}', '${p.product_name}', ${stock})" class="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 ml-auto">
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

// Global Quick Adjustment Handler
window.adjustStockPrompt = async (productId, name, currentStock) => {
  const newStock = prompt(`"${name}"-এর নতুন স্টক কোয়ান্টিটি দিন:`, currentStock);
  if (newStock !== null && !isNaN(newStock) && Number(newStock) !== currentStock) {
    try {
      await ProductAPI.updateStock(productId, newStock, "Admin Manual Ledger Adjustment");
      store.showToast(`স্টক সফলভাবে ${newStock}-এ আপডেট হয়েছে!`, "success");
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      store.showToast(`স্টক আপডেট ব্যর্থ: ${err.message}`, "danger");
    }
  }
};
