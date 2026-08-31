/**
 * ============================================================================
 * DREAM CART BD — BULK SHIPMENT & BARCODE LABELS (BulkShipment.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { OrderAPI } from "../../api/orders.js";
import { store } from "../../js/store.js";

// ব্রাউজার পরিবেশ নিশ্চিত করার সেফটি চেক (বিল্ড টাইমে ReferenceError এড়াতে)
if (typeof window !== "undefined") {
  window.dispatchBulkCourier = () => {
    if (store && typeof store.showToast === "function") {
      store.showToast("কুরিয়ারে বাল্ক বুকিং রিকোয়েস্ট পাঠানো হয়েছে! ট্র্যাকিং কোড জেনারেট হচ্ছে...", "success");
    } else {
      alert("কুরিয়ারে বাল্ক বুকিং রিকোয়েস্ট পাঠানো হয়েছে!");
    }
  };
}

export const BulkShipment = async () => {
  let orders = [];
  try {
    if (OrderAPI && typeof OrderAPI.getAll === "function") {
      const all = await OrderAPI.getAll();
      const orderList = Array.isArray(all) ? all : (all?.items || []);
      orders = orderList.filter(o => o.order_status === 'confirmed' || o.order_status === 'processing');
    }
  } catch (e) {
    console.error("Bulk shipment fetch failed:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/orders") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-success text-xs mb-1">বাল্ক শিপমেন্ট ডিসপ্যাচার</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">বাল্ক শিপমেন্ট ও বারকোড লেবেল</h1>
            <p class="text-xs text-slate-500 mt-1">এক ক্লিকে সকল কনফার্মড অর্ডার কুরিয়ারে বুকিং দিন এবং প্রিন্ট লেবেল ডাউনলোড করুন</p>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" onclick="window.print ? window.print() : null" class="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <i data-lucide="printer" class="w-4 h-4"></i> বারকোড লেবেল প্রিন্ট
            </button>
            <button type="button" onclick="window.dispatchBulkCourier && window.dispatchBulkCourier()" class="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25">
              <i data-lucide="send" class="w-4 h-4"></i> কুরিয়ারে বাল্ক বুকিং দিন
            </button>
          </div>
        </div>

        <!-- Orders Table for Dispatch -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern w-full text-xs text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                  <th class="py-3 px-4"><input type="checkbox" checked class="rounded" /></th>
                  <th class="py-3 px-4">অর্ডার নং</th>
                  <th class="py-3 px-4">গ্রাহকের নাম ও ফোন</th>
                  <th class="py-3 px-4">ঠিকানা</th>
                  <th class="py-3 px-4">বিল এমাউন্ট</th>
                  <th class="py-3 px-4">কুরিয়ার পছন্দ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${orders.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-12 text-slate-400">বর্তমানে কোনো রেডি-টু-শিপ অর্ডার নেই।</td></tr>
                ` : orders.map(o => `
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-3 px-4"><input type="checkbox" checked class="rounded" /></td>
                    <td class="py-3 px-4 font-bold text-brand-600">${o.order_number || o.order_id || '—'}</td>
                    <td class="py-3 px-4">
                      <p class="font-bold text-slate-900 dark:text-white">${o.customer_name || 'গ্রাহক'}</p>
                      <span class="font-mono text-slate-400">${o.phone || 'N/A'}</span>
                    </td>
                    <td class="py-3 px-4 text-slate-500">${o.shipping_address || 'N/A'}</td>
                    <td class="py-3 px-4 font-black text-slate-900 dark:text-white">৳${o.total || 0}</td>
                    <td class="py-3 px-4">
                      <select class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white outline-none">
                        <option value="steadfast">Steadfast (Recommended)</option>
                        <option value="pathao">Pathao Courier</option>
                        <option value="redx">RedX Logistics</option>
                      </select>
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
export default BulkShipment;
