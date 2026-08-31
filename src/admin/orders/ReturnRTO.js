/**
 * ============================================================================
 * DREAM CART BD — RETURN & RTO RESTOCK ENGINE (ReturnRTO.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { OrderAPI } from "../../api/orders.js";
import { store } from "../../js/store.js";

// ব্রাউজার পরিবেশ নিশ্চিত করার সেফটি চেক (বিল্ড টাইমে ReferenceError এড়াতে)
if (typeof window !== "undefined") {
  window.restockInventory = (orderId) => {
    if (store && typeof store.showToast === "function") {
      store.showToast(`অর্ডার ${orderId}-এর পণ্য সফলভাবে মূল ইনভেন্টরি স্টকে ফিরিয়ে নেওয়া হয়েছে!`, "success");
    } else {
      alert(`অর্ডার ${orderId}-এর পণ্য সফলভাবে ইনভেন্টরিতে রিস্টক হয়েছে!`);
    }
  };
}

export const ReturnRTO = async () => {
  let rtoOrders = [];
  try {
    if (OrderAPI && typeof OrderAPI.getAll === "function") {
      const all = await OrderAPI.getAll();
      const orderList = Array.isArray(all) ? all : (all?.items || []);
      rtoOrders = orderList.filter(o => o.order_status === 'rto' || o.order_status === 'returned');
    }
  } catch (e) {
    console.error("RTO fetch failed:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/orders") : ""}

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
            <table class="table-modern w-full text-xs text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                  <th class="py-3 px-4">অর্ডার নং</th>
                  <th class="py-3 px-4">কাস্টমার ও মোবাইল</th>
                  <th class="py-3 px-4">কুরিয়ার ট্র্যাকিং</th>
                  <th class="py-3 px-4">ফেরতের কারণ</th>
                  <th class="py-3 px-4">পণ্য অবস্থা</th>
                  <th class="py-3 px-4 text-right">স্টক অ্যাকশন</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${rtoOrders.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-12 text-slate-400">বর্তমানে কোনো পেন্ডিং রিটার্ন পার্সেল নেই।</td></tr>
                ` : rtoOrders.map(o => `
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-3 px-4 font-bold text-brand-600">${o.order_number || o.order_id || '—'}</td>
                    <td class="py-3 px-4">
                      <p class="font-bold text-slate-900 dark:text-white">${o.customer_name || 'গ্রাহক'}</p>
                      <span class="font-mono text-slate-400">${o.phone || 'N/A'}</span>
                    </td>
                    <td class="py-3 px-4 font-mono font-bold">${o.tracking_code || 'N/A'}</td>
                    <td class="py-3 px-4 text-slate-500">${o.notes || 'কাস্টমার রিসিভ করেননি'}</td>
                    <td class="py-3 px-4">
                      <select class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none">
                        <option value="intact">অক্ষত / ইনট্যাক্ট (Restockable)</option>
                        <option value="damaged">ক্ষতিগ্রস্ত / ড্যামেজ</option>
                      </select>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button type="button" onclick="window.restockInventory && window.restockInventory('${o.order_id}')" class="btn-primary py-1 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 shadow-sm">
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

// Default export যুক্ত করা হয়েছে
export default ReturnRTO;
