/**
 * ============================================================================
 * DREAM CART BD — STOCK MOVEMENTS AUDIT TRAIL (StockMovements.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { api } from "../../api/client.js";

export const StockMovements = async () => {
  let movements = [];
  try {
    if (api && typeof api.get === "function") {
      const res = await api.get("inventory.movements");
      movements = Array.isArray(res) ? res : (res?.items || []);
    }
  } catch (e) {
    console.error("Failed to load stock movements:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/inventory") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">অডিট লেজার</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">স্টক মুভমেন্ট অডিট ট্রেইল</h1>
            <p class="text-xs text-slate-500 mt-1">ইনভেন্টরির প্রতিটি ইন, আউট, রিটার্ন ও ড্যামেজের স্বয়ংক্রিয় লগ</p>
          </div>
          <a href="/admin/inventory" class="btn-secondary text-xs px-4 py-2.5 flex items-center gap-1.5 shadow-sm">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> স্টক লেজারে ফিরুন
          </a>
        </div>

        <!-- Movements Log Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern w-full text-xs text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                  <th class="py-3 px-4">তারিখ ও সময়</th>
                  <th class="py-3 px-4">মুভমেন্ট টাইপ</th>
                  <th class="py-3 px-4">SKU / কোড</th>
                  <th class="py-3 px-4">পরিমাণ (Qty)</th>
                  <th class="py-3 px-4">রেফারেন্স ID</th>
                  <th class="py-3 px-4">কারণ / নোট</th>
                  <th class="py-3 px-4">ইউজার</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${movements.length === 0 ? `
                  <tr><td colspan="7" class="text-center py-12 text-slate-400">কোনো স্টক মুভমেন্ট লগ পাওয়া যায়নি।</td></tr>
                ` : movements.map(m => {
                  const movType = String(m.movement_type || "").toLowerCase();
                  const isPositive = movType.includes('add') || movType.includes('received') || movType.includes('return') || movType.includes('in');
                  const formattedDate = m.timestamp ? new Date(m.timestamp).toLocaleString('bn-BD') : 'N/A';
                  const qty = Number(m.quantity) || 0;

                  return `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td class="py-3 px-4 font-mono text-slate-400">${formattedDate}</td>
                      <td class="py-3 px-4">
                        <span class="${isPositive ? 'badge-success' : 'badge-danger'} text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                          ${m.movement_type || 'ADJUSTMENT'}
                        </span>
                      </td>
                      <td class="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">${m.sku || m.product_id || '—'}</td>
                      <td class="py-3 px-4 font-black text-sm ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
                        ${isPositive ? '+' : '-'}${qty}
                      </td>
                      <td class="py-3 px-4 font-mono text-slate-500">${m.reference_id || 'MANUAL'}</td>
                      <td class="py-3 px-4 text-slate-600 dark:text-slate-300">${m.reason || 'N/A'}</td>
                      <td class="py-3 px-4"><span class="badge-info text-[10px] px-2 py-0.5 rounded-md">${m.user_id || 'ADMIN'}</span></td>
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
export default StockMovements;
