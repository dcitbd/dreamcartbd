/**
 * ============================================================================
 * DREAM CART BD — SUPPLIER & PAYABLES MANAGER (SupplierManager.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { api } from "../../../api/client.js";

export const SupplierManager = async () => {
  let suppliers = [];
  try {
    suppliers = await api.get("suppliers.list") || [];
  } catch (e) {
    console.error("Failed to load suppliers:", e);
  }

  const totalPayable = suppliers.reduce((sum, s) => sum + Number(s.balance || 0), 0);

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/suppliers")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">ভেন্ডর হাব</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">সাপ্লায়ার ও ভেন্ডর ম্যানেজমেন্ট</h1>
            <p class="text-xs text-slate-500 mt-1">সাপ্লায়ার প্রোফাইল, কন্টাক্ট এবং মোট বকেয়া ট্র্যাকিং</p>
          </div>
          <button id="add-supplier-btn" class="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2">
            <i data-lucide="user-plus" class="w-4 h-4"></i> নতুন সাপ্লায়ার যোগ করুন
          </button>
        </div>

        <!-- Supplier KPI Summary -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-slate-400 font-bold uppercase">মোট সাপ্লায়ার</span>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">${suppliers.length} জন</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-rose-500 font-bold uppercase">মোট প্রদেয় বকেয়া (Due)</span>
            <h3 class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">৳${totalPayable}</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-emerald-500 font-bold uppercase">সক্রিয় ভেন্ডর</span>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${suppliers.filter(s => s.status === 'active').length} জন</h3>
          </div>
        </div>

        <!-- Supplier Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern">
              <thead>
                <tr>
                  <th>সাপ্লায়ার নাম ও কোম্পানি</th>
                  <th>মোবাইল নম্বর</th>
                  <th>ইমেইল / ঠিকানা</th>
                  <th>বর্তমান বকেয়া (Due)</th>
                  <th>স্ট্যাটাস</th>
                  <th class="text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                ${suppliers.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-12 text-slate-400">কোনো সাপ্লায়ার তথ্য পাওয়া যায়নি।</td></tr>
                ` : suppliers.map(s => `
                  <tr>
                    <td>
                      <h4 class="font-bold text-slate-900 dark:text-white">${s.name}</h4>
                      <span class="text-xs text-brand-600 dark:text-brand-400 font-semibold">${s.company_name || 'Individual'}</span>
                    </td>
                    <td class="font-mono text-sm">${s.phone}</td>
                    <td class="text-xs text-slate-400">${s.address || s.email || 'N/A'}</td>
                    <td class="font-black text-sm ${Number(s.balance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}">
                      ৳${s.balance || 0}
                    </td>
                    <td><span class="badge-success text-[11px]">${s.status || 'Active'}</span></td>
                    <td class="text-right space-x-2">
                      <a href="/admin/inventory/purchase-orders/create?supplier=${s.supplier_id}" class="btn-secondary text-xs px-3 py-1 inline-block">
                        PO তৈরি
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
