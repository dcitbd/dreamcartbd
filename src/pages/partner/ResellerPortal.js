/**
 * ============================================================================
 * DREAM CART BD — RESELLER & DROPSHIPPING HUB (ResellerPortal.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { ProductAPI } from "../../api/products.js";
import { store } from "../../js/store.js";

// উইন্ডো অবজেক্ট সেফটি চেক (বিল্ড টাইমে ReferenceError এড়াতে)
if (typeof window !== "undefined") {
  window.openDropshipOrderModal = (productId, name, basePrice) => {
    const cleanName = decodeURIComponent(name || "পণ্য");
    const numBasePrice = Number(basePrice) || 0;
    const sellingPrice = prompt(
      `"${cleanName}"-এর জন্য কাস্টমার থেকে কত মূল্য নেবেন? (রিসেলার বেস প্রাইস: ৳${numBasePrice}):`,
      numBasePrice + 300
    );

    if (sellingPrice && Number(sellingPrice) >= numBasePrice) {
      const profit = Number(sellingPrice) - numBasePrice;
      if (store?.showToast) {
        store.showToast(`কাস্টমার অর্ডার এন্ট্রি সম্পন্ন! ডেলিভারি শেষে আপনার ওয়ালেটে ৳${profit} যোগ হবে।`, "success");
      } else {
        alert(`অর্ডার এন্ট্রি সম্পন্ন! সম্ভাব্য প্রফিট: ৳${profit}`);
      }
    }
  };
}

export const ResellerPortal = async () => {
  let products = [];
  try {
    if (ProductAPI && typeof ProductAPI.getAll === "function") {
      const res = await ProductAPI.getAll();
      products = Array.isArray(res) ? res : (res?.items || []);
    }
  } catch (e) {
    console.error("Reseller products fetch failed:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/partner/reseller") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-success text-xs mb-1">রিসেলার ও ড্রপশিপিং</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">রিসেলার প্রাইসিং ক্যাটালগ</h1>
            <p class="text-xs text-slate-500 mt-1">পছন্দের পণ্য নিজস্ব লাভে বিক্রি করুন এবং গ্রাহকের ঠিকানায় সরাসরি অর্ডার পাঠান</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <i data-lucide="wallet" class="w-6 h-6 text-emerald-600"></i>
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase">অর্জিত প্রফিট ওয়ালেট</span>
                <h4 class="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">৳৬,৭৫০</h4>
              </div>
            </div>
          </div>
        </div>

        <!-- Dropship Catalog Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${products.length === 0 ? `
            <div class="col-span-full py-16 text-center text-slate-400">
              <p class="text-sm">কোনো রিসেলার প্রোডাক্ট পাওয়া যায়নি।</p>
            </div>
          ` : products.map(p => {
            const baseResellerPrice = Number(p.reseller_price || (Number(p.selling_price || p.regular_price || 0) * 0.85)) || 0;
            const suggestedMRP = Number(p.selling_price || p.regular_price || 0);
            const estProfit = Math.max(0, suggestedMRP - baseResellerPrice);
            const encodedName = encodeURIComponent(p.product_name || "");

            return `
              <div class="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div class="relative bg-white rounded-2xl p-3 flex items-center justify-center h-44 mb-3 overflow-hidden">
                    <img src="${p.thumbnail || 'https://placehold.co/300x300'}" alt="${p.product_name || 'Product'}" class="max-h-full object-contain" />
                    <span class="absolute top-2 left-2 badge-success text-[10px] font-bold">
                      প্রফিট মার্জিন: ৳${estProfit}
                    </span>
                  </div>

                  <h3 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">${p.product_name || ""}</h3>
                  <span class="text-[11px] font-mono text-slate-400">SKU: ${p.sku || "DCBD"} | স্টক: ${p.stock || 0}</span>

                  <div class="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1 text-xs">
                    <div class="flex justify-between">
                      <span class="text-slate-400">রিসেলার ক্রয়মূল্য:</span>
                      <span class="font-bold text-slate-900 dark:text-white">৳${baseResellerPrice}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">সাজেস্টেড কাস্টমার মূল্য:</span>
                      <span class="font-bold text-brand-600">৳${suggestedMRP}</span>
                    </div>
                  </div>
                </div>

                <button onclick="window.openDropshipOrderModal && window.openDropshipOrderModal('${p.product_id}', '${encodedName}', ${baseResellerPrice})" class="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20">
                  <i data-lucide="send" class="w-3.5 h-3.5"></i> কাস্টমারের জন্য অর্ডার করুন
                </button>
              </div>
            `;
          }).join("")}
        </div>

      </main>
    </div>
  `;
};

// Default export যুক্ত করা হয়েছে
export default ResellerPortal;
