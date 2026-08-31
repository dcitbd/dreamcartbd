/**
 * ============================================================================
 * DREAM CART BD — WHOLESALE B2B BULK PORTAL (WholesalePortal.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { ProductAPI } from "../../api/products.js";
import { store } from "../../js/store.js";

export const WholesalePortal = async () => {
  let products = [];
  try {
    const res = await ProductAPI.getAll();
    products = res.items || res || [];
  } catch (e) {
    console.error("Wholesale products fetch error:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/partner/wholesale")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">B2B হোলসেল হাব</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">হোলসেল বাল্ক অর্ডার ও টায়ার প্রাইসিং</h1>
            <p class="text-xs text-slate-500 mt-1">ন্যূনতম অর্ডার কোয়ান্টিটি (MOQ) অনুযায়ী বিশেষ ছাড়ের হোলসেল মূল্য</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-2xl border border-brand-200 dark:border-brand-800">
              <span class="text-[10px] text-slate-400 font-bold uppercase">অনুমোদিত ক্রেডিট লিমিট</span>
              <h4 class="text-lg font-black text-brand-600 dark:text-brand-400 leading-none mt-0.5">৳১,৫০,০০০</h4>
            </div>
          </div>
        </div>

        <!-- Wholesale Products Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern text-xs">
              <thead>
                <tr>
                  <th>প্রোডাক্ট নাম ও SKU</th>
                  <th>খুচরা মূল্য</th>
                  <th>টায়ার ১ (১০-৪৯ পিস)</th>
                  <th>টায়ার ২ (৫০-৯৯ পিস)</th>
                  <th>টায়ার ৩ (১০০+ পিস)</th>
                  <th class="text-right">বাল্ক অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => {
                  const reg = Number(p.selling_price || 1000);
                  const t1 = Math.round(reg * 0.80);
                  const t2 = Math.round(reg * 0.72);
                  const t3 = Math.round(reg * 0.65);

                  return `
                    <tr>
                      <td>
                        <div class="flex items-center gap-3">
                          <img src="${p.thumbnail || 'https://placehold.co/40x40'}" class="w-10 h-10 rounded-xl object-cover bg-white shrink-0" />
                          <div>
                            <h4 class="font-bold text-slate-900 dark:text-white">${p.product_name}</h4>
                            <span class="font-mono text-[10px] text-slate-400">SKU: ${p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td class="line-through text-slate-400">৳${reg}</td>
                      <td class="font-bold text-slate-800 dark:text-slate-200">৳${t1}/পিস</td>
                      <td class="font-bold text-brand-600">৳${t2}/পিস</td>
                      <td class="font-black text-emerald-600 dark:text-emerald-400 text-sm">৳${t3}/পিস</td>
                      <td class="text-right">
                        <button onclick="window.placeWholesaleOrder('${p.product_id}', '${p.product_name}', ${t2})" class="btn-primary py-1.5 px-3 text-xs">
                          বাল্ক অর্ডার
                        </button>
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

window.placeWholesaleOrder = (productId, name, tierPrice) => {
  const qty = prompt(`"${name}"-এর জন্য কত পিস অর্ডার করতে চান? (MOQ: ১০ পিস):`, "50");
  if (qty && Number(qty) >= 10) {
    const total = Number(qty) * tierPrice;
    store.showToast(`৳${total}-এর বাল্ক হোলসেল অর্ডার সফলভাবে তৈরি হয়েছে!`, "success");
  }
};
