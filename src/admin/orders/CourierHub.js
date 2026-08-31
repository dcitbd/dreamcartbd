/**
 * ============================================================================
 * DREAM CART BD — COURIER INTEGRATION HUB (CourierHub.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";

export const CourierHub = async () => {
  const couriers = [
    {
      id: "steadfast",
      name: "Steadfast Courier",
      logo: "truck",
      isActive: true,
      apiKey: "stdf_live_********************",
      secretKey: "sec_********************",
      successRate: "94%"
    },
    {
      id: "pathao",
      name: "Pathao Courier",
      logo: "navigation",
      isActive: true,
      apiKey: "pth_live_********************",
      secretKey: "sec_********************",
      successRate: "91%"
    },
    {
      id: "redx",
      name: "RedX Logistics",
      logo: "package",
      isActive: false,
      apiKey: "redx_live_********************",
      secretKey: "sec_********************",
      successRate: "88%"
    }
  ];

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/couriers") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <span class="badge-info text-xs mb-1">কুরিয়ার প্লাগইন হাব</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">কুরিয়ার সার্ভিস ইন্টিগ্রেশন</h1>
          <p class="text-xs text-slate-500 mt-1">API কী, সিক্রেট এবং অটোমেটেড কুরিয়ার ট্র্যাকিং রুলস কনফিগার করুন</p>
        </div>

        <!-- Couriers Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${couriers.map(c => `
            <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                      <i data-lucide="${c.logo || 'truck'}" class="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 class="text-base font-bold text-slate-900 dark:text-white">${c.name}</h3>
                      <span class="text-[10px] text-emerald-600 font-bold">সাকসেস রেট: ${c.successRate}</span>
                    </div>
                  </div>
                  <span class="${c.isActive ? 'badge-success' : 'badge-danger'} text-[10px] px-2 py-0.5 rounded-md">
                    ${c.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>

                <div class="space-y-3">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-400 mb-1">API Key</label>
                    <input type="password" value="${c.apiKey}" class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-400 mb-1">Secret Key</label>
                    <input type="password" value="${c.secretKey}" class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono outline-none text-slate-900 dark:text-white" />
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button type="button" onclick="window.store && window.store.showToast ? window.store.showToast('${c.name} টেস্ট কানেকশন সফল!', 'success') : null" class="flex-1 btn-secondary py-2 text-xs shadow-sm">
                  টেস্ট কানেকশন
                </button>
                <button type="button" onclick="window.store && window.store.showToast ? window.store.showToast('${c.name} সেটিংস সেভ হয়েছে!', 'success') : null" class="flex-1 btn-primary py-2 text-xs shadow-sm">
                  সেভ করুন
                </button>
              </div>

            </div>
          `).join("")}
        </div>

      </main>
    </div>
  `;
};

// Default export যুক্ত করা হয়েছে
export default CourierHub;
