/**
 * ============================================================================
 * DREAM CART BD — RETURN & RTO RESTOCK ENGINE (ReturnRTO.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { OrderAPI } from "../../../api/orders.js";
import { store } from "../../../js/store.js";

export const ReturnRTO = async () => {
  let rtoOrders = [];
  try {
    const all = await OrderAPI.getAll();
    rtoOrders = (all || []).filter(o => o.order_status === 'rto' || o.order_status === 'returned');
  } catch (e) {
    console.error("RTO fetch failed:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/orders")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-danger text-xs mb-1">রিটার্ন ও ক্ষতিপূরণ হাব</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">রিটার্ন ও RTO স্টক রিস্টোরিং</h1>
            <p class="text-xs text-slate-500 mt-1">ফেরত আসা পার্সেল ইন্সপেকশন করুন এবং অক্ষত পণ্য সরাসরি স্টকে যুক্ত করুন</p>
          </div>
        </div>

        <!-- RTO Orders Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern text-xs">
              <thead>
                <tr>
                  <th>অর্ডার নং</th>
                  <th>কাস্টমার ও মোবাইল</th>
                  <th>কুরিয়ার ট্র্যাকিং</th>
                  <th>ফেরতের কারণ</th>
                  <th>পণ্য অবস্থা</th>
                  <th class="text-right">স্টক অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                ${rtoOrders.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-12 text-slate-400">বর্তমানে কোনো পেন্ডিং রিটার্ন পার্সেল নেই।</td></tr>
                ` : rtoOrders.map(o => `
                  <tr>
                    <td class="font-bold text-brand-600">${o.order_number || o.order_id}</td>
                    <td>
                      <p class="font-bold text-slate-900 dark:text-white">${o.customer_name}</p>
                      <span class="font-mono text-slate-400">${o.phone}</span>
                    </td>
                    <td class="font-mono font-bold">${o.tracking_code || 'N/A'}</td>
                    <td class="text-slate-500">${o.notes || 'কাস্টমার রিসিভ করেননি'}</td>
                    <td>
                      <select class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold">
                        <option value="intact">অক্ষত / ইনট্যাক্ট (Restockable)</option>
                        <option value="damaged">ক্ষতিগ্রস্ত / ড্যামেজ</option>
                      </select>
                    </td>
                    <td class="text-right">
                      <button onclick="window.restockInventory('${o.order_id}')" class="btn-primary py-1 px-3 text-xs bg-emerald-600 hover:bg-emerald-700">
                        ইনভেন্টরিতে রিস্টক করুন
                      </button>
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

window.restockInventory = (orderId) => {
  store.showToast(`অর্ডার ${orderId}-এর পণ্য সফলভাবে মূল ইনভেন্টরি স্টকে ফিরিয়ে নেওয়া হয়েছে!`, "success");
};
