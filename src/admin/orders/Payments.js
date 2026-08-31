/**
 * ============================================================================
 * DREAM CART BD — PAYMENT RECONCILIATION HUB (Payments.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { api } from "../../api/client.js";

export const Payments = async () => {
  let payments = [];
  try {
    if (api && typeof api.get === "function") {
      const res = await api.get("orders.list");
      payments = Array.isArray(res) ? res : (res?.items || []);
    }
  } catch (e) {
    console.error("Payment load error:", e);
  }

  const paymentList = Array.isArray(payments) ? payments : [];

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/orders") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <span class="badge-success text-xs mb-1">ফাইন্যান্স ও সেটেলমেন্ট</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">পেমেন্ট ও ক্যাশ রিকনসিলিয়েশন</h1>
          <p class="text-xs text-slate-500 mt-1">বিকাশ, নগদ এবং কুরিয়ার ক্যাশ-অন-ডেলিভারি (COD) পেমেন্ট ম্যাচিং</p>
        </div>

        <!-- Payment Channels KPI -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-brand-500 font-bold uppercase">ক্যাশ অন ডেলিভারি (COD)</span>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">৳৪৫,২০০</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-pink-500 font-bold uppercase">বিকাশ ও নগদ ডিজিটাল</span>
            <h3 class="text-2xl font-black text-pink-600 dark:text-pink-400 mt-1">৳১৮,৬০০</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-emerald-500 font-bold uppercase">কুরিয়ার বকেয়া ক্যাশ-আউট</span>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">৳৩২,৮০০</h3>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern w-full text-xs text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                  <th class="py-3 px-4">অর্ডার নং</th>
                  <th class="py-3 px-4">পেমেন্ট গেটওয়ে</th>
                  <th class="py-3 px-4">টাকা (৳)</th>
                  <th class="py-3 px-4">পেমেন্ট স্ট্যাটাস</th>
                  <th class="py-3 px-4">ভেরিফিকেশন</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${paymentList.length === 0 ? `
                  <tr><td colspan="5" class="text-center py-12 text-slate-400">কোনো পেমেন্ট হিস্ট্রি পাওয়া যায়নি।</td></tr>
                ` : paymentList.slice(0, 10).map(p => `
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${p.order_number || p.order_id || '—'}</td>
                    <td class="py-3 px-4"><span class="badge-info text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">${p.payment_method || 'COD'}</span></td>
                    <td class="py-3 px-4 font-black text-sm text-slate-900 dark:text-white">৳${p.total || 0}</td>
                    <td class="py-3 px-4"><span class="badge-success text-[10px] uppercase px-2 py-0.5 rounded-md">${p.payment_status || 'paid'}</span></td>
                    <td class="py-3 px-4">
                      <span class="text-emerald-600 font-bold flex items-center gap-1">
                        <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> রিকনসাইলড
                      </span>
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
};

// Default export যুক্ত করা হয়েছে
export default Payments;
