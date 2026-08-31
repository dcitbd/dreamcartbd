/**
 * ============================================================================
 * DREAM CART BD — PURCHASE ORDER & STOCK RECEIVING (PurchaseOrders.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { api } from "../../../api/client.js";
import { store } from "../../../js/store.js";

export const PurchaseOrders = async () => {
  let purchases = [];
  try {
    purchases = await api.get("purchases.list") || [];
  } catch (e) {
    console.error("Failed to load POs:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/suppliers")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">পারচেজিং ইঞ্জিন</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">পারচেজ অর্ডার (PO) ও স্টক রিসিভিং</h1>
            <p class="text-xs text-slate-500 mt-1">নতুন স্টক ক্রয়ের অর্ডার তৈরি এবং সরাসরি ইনভেন্টরিতে স্টক রিসিভ করুন</p>
          </div>
          <button id="create-new-po-btn" class="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-4 h-4"></i> নতুন পারচেজ অর্ডার
          </button>
        </div>

        <!-- PO List Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern">
              <thead>
                <tr>
                  <th>PO নম্বর</th>
                  <th>সাপ্লায়ার ID</th>
                  <th>মোট বিল</th>
                  <th>পরিশোধিত</th>
                  <th>বকেয়া</th>
                  <th>স্ট্যাটাস</th>
                  <th class="text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                ${purchases.length === 0 ? `
                  <tr><td colspan="7" class="text-center py-12 text-slate-400">কোনো পারচেজ অর্ডার পাওয়া যায়নি।</td></tr>
                ` : purchases.map(po => `
                  <tr>
                    <td class="font-mono font-bold text-slate-900 dark:text-white">${po.po_number || po.purchase_id}</td>
                    <td class="font-semibold text-slate-500">${po.supplier_id}</td>
                    <td class="font-bold text-slate-900 dark:text-white">৳${po.total_amount}</td>
                    <td class="font-semibold text-emerald-600">৳${po.paid_amount || 0}</td>
                    <td class="font-semibold text-rose-600">৳${po.due_amount || 0}</td>
                    <td>
                      <span class="${po.status === 'received' ? 'badge-success' : 'badge-warning'} text-[11px] uppercase">
                        ${po.status || 'Pending'}
                      </span>
                    </td>
                    <td class="text-right">
                      ${po.status !== 'received' ? `
                        <button onclick="window.receiveStock('${po.purchase_id}')" class="btn-primary py-1 px-3 text-xs">
                          স্টক রিসিভ করুন
                        </button>
                      ` : `
                        <span class="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <i data-lucide="check" class="w-3.5 h-3.5"></i> স্টক যুক্ত হয়েছে
                        </span>
                      `}
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

// Stock Receive Handler (Automatically increments inventory in Google Sheets)
window.receiveStock = async (purchaseId) => {
  if (confirm("আপনি কি এই পারচেজ অর্ডারের সমস্ত মালামাল গুদামে রিসিভ করতে চান? এটি ইনভেন্টরি স্টকে স্বয়ংক্রিয়ভাবে যোগ হবে।")) {
    try {
      await api.post("purchases.receive", { purchaseId });
      store.showToast("স্টক সফলভাবে ইনভেন্টরিতে যুক্ত হয়েছে!", "success");
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      store.showToast(`স্টক রিসিভ ব্যর্থ: ${err.message}`, "danger");
    }
  }
};
