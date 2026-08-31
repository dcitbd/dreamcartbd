/**
 * ============================================================================
 * DREAM CART BD — LOW STOCK ALERTS & REORDER ADVISOR (LowStockAlerts.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { ProductAPI } from "../../../api/products.js";

export const LowStockAlerts = async () => {
  let products = [];
  try {
    const res = await ProductAPI.getAll();
    products = res.items || res || [];
  } catch (e) {
    console.error("Failed to load low stock items:", e);
  }

  // Filter items where stock <= reorder_level
  const lowStockItems = products.filter(p => Number(p.stock || 0) <= Number(p.reorder_level || 5));

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/inventory")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-warning text-xs mb-1">স্মার্ট রি-অর্ডার সাজেশন</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">লো-স্টক ও রি-অর্ডার অ্যালার্ট</h1>
            <p class="text-xs text-slate-500 mt-1">যেসব পণ্যের স্টক ফুরিয়ে আসছে তাদের তালিকা ও রি-অর্ডার সাজেশন</p>
          </div>
          <a href="/admin/inventory/purchase-orders/create" class="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2">
            <i data-lucide="file-plus" class="w-4 h-4"></i> বাল্ক PO তৈরি করুন
          </a>
        </div>

        <!-- Low Stock Items Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${lowStockItems.length === 0 ? `
            <div class="col-span-full glass-panel p-12 text-center rounded-3xl text-emerald-600">
              <i data-lucide="check-circle" class="w-12 h-12 mx-auto mb-3"></i>
              <h3 class="text-lg font-bold">সমস্ত স্টক পর্যাপ্ত রয়েছে!</h3>
              <p class="text-xs text-slate-500 mt-1">বর্তমানে কোনো পণ্যে লো-স্টক সতর্কতা নেই।</p>
            </div>
          ` : lowStockItems.map(item => {
            const stock = Number(item.stock || 0);
            const reorderLevel = Number(item.reorder_level || 5);
            const suggestedOrder = Math.max(20, (reorderLevel * 4) - stock);

            return `
              <div class="glass-panel p-6 rounded-3xl border border-amber-200/60 dark:border-amber-900/40 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="${stock <= 0 ? 'badge-danger' : 'badge-warning'} text-xs font-bold">
                      ${stock <= 0 ? 'স্টক আউট (০ টি)' : `অবশিষ্ট: ${stock} টি`}
                    </span>
                    <span class="text-xs font-mono text-slate-400">SKU: ${item.sku}</span>
                  </div>

                  <div class="flex items-center gap-3 mb-3">
                    <img src="${item.thumbnail || 'https://placehold.co/60x60'}" class="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-slate-100" />
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">${item.product_name}</h3>
                  </div>

                  <div class="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div class="flex justify-between">
                      <span>রি-অর্ডার থ্রেশহোল্ড:</span>
                      <span class="font-bold text-slate-900 dark:text-white">${reorderLevel} টি</span>
                    </div>
                    <div class="flex justify-between">
                      <span>সাজেস্টেড রি-অর্ডার:</span>
                      <span class="font-bold text-brand-600 dark:text-brand-400">${suggestedOrder} টি</span>
                    </div>
                  </div>
                </div>

                <a href="/admin/inventory/purchase-orders/create?sku=${item.sku}&qty=${suggestedOrder}" class="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5">
                  <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i> পারচেজ অর্ডার তৈরি করুন
                </a>
              </div>
            `;
          }).join("")}
        </div>

      </main>
    </div>
  `;
};
