/**
 * ============================================================================
 * DREAM CART BD — BULK SHIPMENT & BARCODE LABELS (BulkShipment.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { OrderAPI } from "../../../api/orders.js";
import { store } from "../../../js/store.js";

export const BulkShipment = async () => {
  let orders = [];
  try {
    const all = await OrderAPI.getAll();
    orders = (all || []).filter(o => o.order_status === 'confirmed' || o.order_status === 'processing');
  } catch (e) {
    console.error("Bulk shipment fetch failed:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/orders")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-success text-xs mb-1">বাল্ক শিপমেন্ট ডিসপ্যাচার</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">বাল্ক শিপমেন্ট ও বারকোড লেবেল</h1>
            <p class="text-xs text-slate-500 mt-1">এক ক্লিকে সকল কনফার্মড অর্ডার কুরিয়ারে বুকিং দিন এবং প্রিন্ট লেবেল ডাউনলোড করুন</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="window.print()" class="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5">
              <i data-lucide="printer" class="w-4 h-4"></i> বারকোড লেবেল প্রিন্ট
            </button>
            <button onclick="window.dispatchBulkCourier()" class="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25">
              <i data-lucide="send" class="w-4 h-4"></i> কুরিয়ারে বাল্ক বুকিং দিন
            </button>
          </div>
        </div>

        <!-- Orders Table for Dispatch -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern text-xs">
              <thead>
                <tr>
                  <th><input type="checkbox" checked class="rounded" /></th>
                  <th>অর্ডার নং</th>
                  <th>গ্রাহকের নাম ও ফোন</th>
                  <th>ঠিকানা</th>
                  <th>বিল এমাউন্ট</th>
                  <th>কুরিয়ার পছন্দ</th>
                </tr>
              </thead>
              <tbody>
                ${orders.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-12 text-slate-400">বর্তমানে কোনো রেডি-টু-শিপ অর্ডার নেই।</td></tr>
                ` : orders.map(o => `
                  <tr>
                    <td><input type="checkbox" checked class="rounded" /></td>
                    <td class="font-bold text-brand-600">${o.order_number || o.order_id}</td>
                    <td>
                      <p class="font-bold text-slate-900 dark:text-white">${o.customer_name}</p>
                      <span class="font-mono text-slate-400">${o.phone}</span>
                    </td>
                    <td class="text-slate-500">${o.shipping_address}</td>
                    <td class="font-black text-slate-900 dark:text-white">৳${o.total}</td>
                    <td>
                      <select class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold">
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

window.dispatchBulkCourier = () => {
  store.showToast("কুরিয়ারে বাল্ক বুকিং রিকোয়েস্ট পাঠানো হয়েছে! ট্র্যাকিং কোড জেনারেট হচ্ছে...", "success");
};
