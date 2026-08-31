/**
 * ============================================================================
 * DREAM CART BD — MULTI-VENDOR SELLER PORTAL (SellerPortal.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { ProductAPI } from "../../api/products.js";
import { store } from "../../js/store.js";
import { api } from "../../api/client.js";

export const SellerPortal = async () => {
  const user = store.state.user || { name: "ভেন্ডর পার্টনার", email: "seller@dreamcartbd.com" };
  let products = [];

  try {
    const res = await ProductAPI.getAll();
    products = res.items || res || [];
  } catch (e) {
    console.error("Seller products load failed:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/partner/seller")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">সেলার কন্ট্রোল সেন্টার</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">সেলার পোর্টাল ড্যাশবোর্ড</h1>
            <p class="text-xs text-slate-500 mt-1">প্রোডাক্ট লিস্টিং ম্যানেজ করুন এবং বিক্রয়লব্ধ অর্থের পে-আউট রিকোয়েস্ট পাঠান</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="window.openPayoutModal()" class="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/20">
              <i data-lucide="wallet" class="w-4 h-4"></i> পে-আউট উইথড্র রিকোয়েস্ট
            </button>
          </div>
        </div>

        <!-- KPI Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-slate-400 font-bold uppercase">লিস্টেড প্রোডাক্ট</span>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-1">${products.length} টি</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-emerald-500 font-bold uppercase">মোট বিক্রয়</span>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">৳৮৪,৫০০</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-brand-500 font-bold uppercase">উইথড্রয়াল ব্যালেন্স</span>
            <h3 class="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">৳১২,৪০০</h3>
          </div>
          <div class="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-xs text-amber-500 font-bold uppercase">পেন্ডিং পে-আউট</span>
            <h3 class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">৳৩,০০০</h3>
          </div>
        </div>

        <!-- Products Table -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">আমার লিস্টেড প্রোডাক্টসমূহ</h3>
          
          <div class="overflow-x-auto">
            <table class="table-modern text-xs">
              <thead>
                <tr>
                  <th>প্রোডাক্ট তথ্য</th>
                  <th>SKU</th>
                  <th>সেলার প্রাইস</th>
                  <th>স্টক</th>
                  <th>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                ${products.slice(0, 8).map(p => `
                  <tr>
                    <td>
                      <div class="flex items-center gap-3">
                        <img src="${p.thumbnail || 'https://placehold.co/40x40'}" class="w-10 h-10 rounded-xl object-cover bg-white shrink-0" />
                        <h4 class="font-bold text-slate-900 dark:text-white line-clamp-1">${p.product_name}</h4>
                      </div>
                    </td>
                    <td class="font-mono">${p.sku || 'N/A'}</td>
                    <td class="font-bold text-brand-600">৳${p.seller_price || p.selling_price}</td>
                    <td class="font-bold">${p.stock || 0}</td>
                    <td><span class="badge-success text-[10px]">Active</span></td>
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

window.openPayoutModal = () => {
  const amount = prompt("কত টাকা উইথড্র করতে চান? (ন্যূনতম ৳১,০০০):", "5000");
  if (amount && Number(amount) >= 1000) {
    store.showToast(`৳${amount} পে-আউট রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে!`, "success");
  }
};
