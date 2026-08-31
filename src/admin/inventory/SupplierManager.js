/**
 * ============================================================================
 * DREAM CART BD — SUPPLIER & PAYABLES MANAGER (SupplierManager.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { api } from "../../api/client.js";

export const SupplierManager = async () => {
  let suppliers = [];
  try {
    if (api && typeof api.get === "function") {
      const res = await api.get("suppliers.list");
      suppliers = Array.isArray(res) ? res : (res?.items || []);
    }
  } catch (e) {
    console.error("Failed to load suppliers:", e);
  }

  const suppliersList = Array.isArray(suppliers) ? suppliers : [];
  const totalPayable = suppliersList.reduce((sum, s) => sum + Number(s.balance || 0), 0);
  const activeCount = suppliersList.filter(s => String(s.status || "").toLowerCase() === 'active').length;

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/suppliers") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">ভেন্ডর হাব</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">সাপ্লায়ার ও ভেন্ডর ম্যানেজমেন্ট</h1>
            <p class="text-xs text-slate-500 mt-1">সাপ্লায়ার প্রোফাইল, কন্টাক্ট এবং মোট বকেয়া ট্র্যাকিং</p>
          </div>
          <button id="add-supplier-btn" type="button" class="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/20">
            <i data-lucide="user-plus" class="w-4 h-4"></i> নতুন সাপ্লায়ার যোগ করুন
          </button>
        </div>

        <!-- Supplier KPI Summary -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-slate-400 font-bold uppercase">মোট সাপ্লায়ার</span>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">${suppliersList.length} জন</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-rose-500 font-bold uppercase">মোট প্রদেয় বকেয়া (Due)</span>
            <h3 class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">৳${totalPayable}</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-emerald-500 font-bold uppercase">সক্রিয় ভেন্ডর</span>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${activeCount} জন</h3>
          </div>
        </div>

        <!-- Supplier Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern w-full text-xs text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                  <th class="py-3 px-4">সাপ্লায়ার নাম ও কোম্পানি</th>
                  <th class="py-3 px-4">মোবাইল নম্বর</th>
                  <th class="py-3 px-4">ইমেইল / ঠিকানা</th>
                  <th class="py-3 px-4">বর্তমান বকেয়া (Due)</th>
                  <th class="py-3 px-4">স্ট্যাটাস</th>
                  <th class="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${suppliersList.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-12 text-slate-400">কোনো সাপ্লায়ার তথ্য পাওয়া যায়নি।</td></tr>
                ` : suppliersList.map(s => {
                  const balance = Number(s.balance || 0);
                  return `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td class="py-3 px-4">
                        <h4 class="font-bold text-slate-900 dark:text-white">${s.name || 'সাপ্লায়ার'}</h4>
                        <span class="text-xs text-brand-600 dark:text-brand-400 font-semibold">${s.company_name || 'Individual'}</span>
                      </td>
                      <td class="py-3 px-4 font-mono text-sm">${s.phone || 'N/A'}</td>
                      <td class="py-3 px-4 text-xs text-slate-400">${s.address || s.email || 'N/A'}</td>
                      <td class="py-3 px-4 font-black text-sm ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}">
                        ৳${balance}
                      </td>
                      <td class="py-3 px-4"><span class="badge-success text-[11px] px-2 py-0.5 rounded-md">${s.status || 'Active'}</span></td>
                      <td class="py-3 px-4 text-right space-x-2">
                        <a href="/admin/inventory/purchase-orders/create?supplier=${encodeURIComponent(s.supplier_id || '')}" class="btn-secondary text-xs px-3 py-1 inline-block shadow-sm">
                          PO তৈরি
                        </a>
                      </td>
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
export default SupplierManager;
