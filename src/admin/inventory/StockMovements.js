/**
 * ============================================================================
 * DREAM CART BD — STOCK MOVEMENTS AUDIT TRAIL (StockMovements.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { api } from "../../../api/client.js";

export const StockMovements = async () => {
  let movements = [];
  try {
    movements = await api.get("inventory.movements") || [];
  } catch (e) {
    console.error("Failed to load stock movements:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/inventory")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">অডিট লেজার</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">স্টক মুভমেন্ট অডিট ট্রেইল</h1>
            <p class="text-xs text-slate-500 mt-1">ইনভেন্টরির প্রতিটি ইন, আউট, রিটার্ন ও ড্যামেজের স্বয়ংক্রিয় লগ</p>
          </div>
          <a href="/admin/inventory" class="btn-secondary text-xs px-4 py-2.5 flex items-center gap-1.5">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> স্টক লেজারে ফিরুন
          </a>
        </div>

        <!-- Movements Log Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern text-xs">
              <thead>
                <tr>
                  <th>তারিখ ও সময়</th>
                  <th>মুভমেন্ট টাইপ</th>
                  <th>SKU / কোড</th>
                  <th>পরিমাণ (Qty)</th>
                  <th>রেফারেন্স ID</th>
                  <th>কারণ / নোট</th>
                  <th>ইউজার</th>
                </tr>
              </thead>
              <tbody>
                ${movements.length === 0 ? `
                  <tr><td colspan="7" class="text-center py-12 text-slate-400">কোনো স্টক মুভমেন্ট লগ পাওয়া যায়নি।</td></tr>
                ` : movements.map(m => {
                  const isPositive = m.movement_type.includes('add') || m.movement_type.includes('received') || m.movement_type.includes('return');
                  return `
                    <tr>
                      <td class="font-mono text-slate-400">${new Date(m.timestamp).toLocaleString()}</td>
                      <td>
                        <span class="${isPositive ? 'badge-success' : 'badge-danger'} text-[10px] uppercase font-bold">
                          ${m.movement_type}
                        </span>
                      </td>
                      <td class="font-mono font-bold text-slate-900 dark:text-white">${m.sku || m.product_id}</td>
                      <td class="font-black text-sm ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
                        ${isPositive ? '+' : '-'}${m.quantity}
                      </td>
                      <td class="font-mono text-slate-500">${m.reference_id || 'MANUAL'}</td>
                      <td class="text-slate-600 dark:text-slate-300">${m.reason || 'N/A'}</td>
                      <td><span class="badge-info text-[10px]">${m.user_id || 'ADMIN'}</span></td>
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
