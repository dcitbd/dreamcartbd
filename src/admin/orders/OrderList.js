/**
 * ============================================================================
 * DREAM CART BD — MASTER ORDER WORKSPACE (OrderList.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { OrderAPI } from "../../api/orders.js";
import { FraudModal } from "../../components/FraudModal.js";
import { store } from "../../js/store.js";

// ব্রাউজার পরিবেশ নিশ্চিত করার সেফটি চেক (বিল্ড টাইমে ReferenceError এড়াতে)
if (typeof window !== "undefined") {
  window.updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (OrderAPI && typeof OrderAPI.updateStatus === "function") {
        await OrderAPI.updateStatus(orderId, newStatus);
      }
      if (store && typeof store.showToast === "function") {
        store.showToast(`অর্ডার স্ট্যাটাস সফলভাবে '${newStatus}'-এ পরিবর্তিত হয়েছে!`, "success");
      }
    } catch (err) {
      if (store && typeof store.showToast === "function") {
        store.showToast(`স্ট্যাটাস পরিবর্তন ব্যর্থ: ${err.message || "ত্রুটি ঘটেছে"}`, "danger");
      }
    }
  };

  window.FraudModal = FraudModal;
}

export const OrderList = async (params = {}) => {
  let orders = [];
  try {
    if (OrderAPI && typeof OrderAPI.getAll === "function") {
      const res = await OrderAPI.getAll();
      orders = Array.isArray(res) ? res : (res?.items || []);
    }
  } catch (e) {
    console.error("Failed to load orders:", e);
  }

  const activeTab = params?.status || "all";
  const filteredOrders = activeTab === "all" ? orders : orders.filter(o => o.order_status === activeTab);

  const statusTabs = [
    { label: "সকল অর্ডার", key: "all", count: orders.length },
    { label: "নতুন / পেন্ডিং", key: "pending", count: orders.filter(o => o.order_status === 'pending').length },
    { label: "কনফার্মড", key: "confirmed", count: orders.filter(o => o.order_status === 'confirmed').length },
    { label: "প্রসেসিং", key: "processing", count: orders.filter(o => o.order_status === 'processing').length },
    { label: "কুরিয়ারে পাঠানো", key: "shipped", count: orders.filter(o => o.order_status === 'shipped').length },
    { label: "ডেলিভারড", key: "delivered", count: orders.filter(o => o.order_status === 'delivered').length },
    { label: "রিটার্ন / RTO", key: "rto", count: orders.filter(o => o.order_status === 'rto').length }
  ];

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/orders") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">অর্ডার অপারেশনস</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">মাস্টার অর্ডার ওয়ার্কস্পেস</h1>
            <p class="text-xs text-slate-500 mt-1">অর্ডার প্রসেস করুন, কুরিয়ার ফ্রড চেক করুন এবং বাল্ক শিপমেন্ট পাঠান</p>
          </div>
          <div class="flex items-center gap-3">
            <a href="/admin/orders/bulk-shipment" class="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/20">
              <i data-lucide="truck" class="w-4 h-4"></i> বাল্ক শিপমেন্ট হাব
            </a>
          </div>
        </div>

        <!-- Status Filter Tabs -->
        <div class="flex gap-2 overflow-x-auto pb-3 mb-6">
          ${statusTabs.map(tab => `
            <a href="/admin/orders?status=${tab.key}" class="px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
              activeTab === tab.key 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }">
              <span>${tab.label}</span>
              <span class="px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}">
                ${tab.count}
              </span>
            </a>
          `).join("")}
        </div>

        <!-- Orders Master Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern w-full text-xs text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                  <th class="py-3 px-4">অর্ডার নং ও তারিখ</th>
                  <th class="py-3 px-4">কাস্টমার তথ্য</th>
                  <th class="py-3 px-4">🛡️ ফ্রড চেক</th>
                  <th class="py-3 px-4">টাকা ও পেমেন্ট</th>
                  <th class="py-3 px-4">কুরিয়ার ট্র্যাকিং</th>
                  <th class="py-3 px-4">স্ট্যাটাস চেঞ্জার</th>
                  <th class="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${filteredOrders.length === 0 ? `
                  <tr><td colspan="7" class="text-center py-12 text-slate-400">এই ক্যাটাগরিতে কোনো অর্ডার পাওয়া যায়নি।</td></tr>
                ` : filteredOrders.map(o => `
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-3 px-4">
                      <a href="/admin/orders/detail/${o.order_id}" class="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                        ${o.order_number || o.order_id || '—'}
                      </a>
                      <p class="text-[10px] text-slate-400 mt-0.5">${o.created_at ? new Date(o.created_at).toLocaleDateString('bn-BD') : 'N/A'}</p>
                    </td>

                    <td class="py-3 px-4">
                      <h4 class="font-bold text-slate-900 dark:text-white">${o.customer_name || 'সম্মানিত গ্রাহক'}</h4>
                      <p class="font-mono text-slate-500">${o.phone || 'N/A'}</p>
                      <p class="text-[10px] text-slate-400 truncate max-w-[150px]">${o.shipping_address || 'ঠিকানা নেই'}</p>
                    </td>

                    <!-- 🛡️ Dedicated Courier Fraud Check Button -->
                    <td class="py-3 px-4">
                      <button type="button" onclick="window.FraudModal && window.FraudModal.open ? window.FraudModal.open('${o.phone || ''}', '${o.order_id || ''}') : null" class="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 text-[11px] font-bold flex items-center gap-1 shadow-sm">
                        <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i> হিস্ট্রি চেক
                      </button>
                    </td>

                    <td class="py-3 px-4">
                      <h4 class="font-black text-sm text-slate-900 dark:text-white">৳${o.total || 0}</h4>
                      <span class="badge-info text-[9px] uppercase font-bold px-2 py-0.5 rounded-md">${o.payment_method || 'COD'}</span>
                    </td>

                    <td class="py-3 px-4 font-mono">
                      ${o.tracking_code ? `
                        <span class="text-emerald-600 font-bold">${o.tracking_code}</span>
                      ` : `
                        <span class="text-slate-400 text-[10px]">অ্যাসাইন হয়নি</span>
                      `}
                    </td>

                    <td class="py-3 px-4">
                      <select onchange="window.updateOrderStatus && window.updateOrderStatus('${o.order_id}', this.value)" class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none text-slate-900 dark:text-white">
                        <option value="pending" ${o.order_status === 'pending' ? 'selected' : ''}>পেন্ডিং</option>
                        <option value="confirmed" ${o.order_status === 'confirmed' ? 'selected' : ''}>কনফার্মড</option>
                        <option value="processing" ${o.order_status === 'processing' ? 'selected' : ''}>প্রসেসিং</option>
                        <option value="shipped" ${o.order_status === 'shipped' ? 'selected' : ''}>কুরিয়ারে পাঠানো</option>
                        <option value="delivered" ${o.order_status === 'delivered' ? 'selected' : ''}>ডেলিভারড</option>
                        <option value="cancelled" ${o.order_status === 'cancelled' ? 'selected' : ''}>ক্যান্সেলড</option>
                        <option value="rto" ${o.order_status === 'rto' ? 'selected' : ''}>রিটার্ন (RTO)</option>
                      </select>
                    </td>

                    <td class="py-3 px-4 text-right">
                      <a href="/admin/orders/detail/${o.order_id}" class="p-2 inline-block text-slate-400 hover:text-brand-500 transition-colors">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                      </a>
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
export default OrderList;
