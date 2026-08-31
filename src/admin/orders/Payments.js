/**
 * ============================================================================
 * DREAM CART BD — PAYMENT RECONCILIATION HUB (Payments.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { api } from "../../../api/client.js";

export const Payments = async () => {
  let payments = [];
  try {
    payments = await api.get("orders.list") || [];
  } catch (e) {
    console.error("Payment load error:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/orders")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <span class="badge-success text-xs mb-1">ফাইন্যান্স ও সেটেলমেন্ট</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">পেমেন্ট ও ক্যাশ রিকনসিলিয়েশন</h1>
          <p class="text-xs text-slate-500 mt-1">বিকাশ, নগদ এবং কুরিয়ার ক্যাশ-অন-ডেলিভারি (COD) পেমেন্ট ম্যাচিং</p>
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
            <span class="text-xs text-emerald-500 font-bold uppercase">কুরিয়ার বকেয়া ক্যাশ-আউট</span>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">৳৩২,৮০০</h3>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern text-xs">
              <thead>
                <tr>
                  <th>অর্ডার নং</th>
                  <th>পেমেন্ট গেটওয়ে</th>
                  <th>টাকা (৳)</th>
                  <th>পেমেন্ট স্ট্যাটাস</th>
                  <th>ভেরিফিকেশন</th>
                </tr>
              </thead>
              <tbody>
                ${payments.slice(0, 10).map(p => `
                  <tr>
                    <td class="font-bold">${p.order_number || p.order_id}</td>
                    <td><span class="badge-info text-[10px] uppercase font-bold">${p.payment_method || 'COD'}</span></td>
                    <td class="font-black text-sm text-slate-900 dark:text-white">৳${p.total}</td>
                    <td><span class="badge-success text-[10px] uppercase">${p.payment_status || 'paid'}</span></td>
                    <td>
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
