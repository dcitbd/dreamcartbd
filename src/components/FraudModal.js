/**
 * ============================================================================
 * DREAM CART BD — COURIER FRAUD DETECTION MODAL (FraudModal.js)
 * ============================================================================
 */

import { OrderAPI } from "../api/orders.js";

export const FraudModal = {
  open: async (phone, orderId = "") => {
    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div id="fraud-modal-backdrop" class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-bengali">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
          
          <div class="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <i data-lucide="shield-alert" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">কুরিয়ার ফ্রড চেক রিপোর্ট</h3>
                <p class="text-xs text-slate-500">ফোন: ${phone}</p>
              </div>
            </div>
            <button onclick="document.getElementById('fraud-modal-backdrop').remove()" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <div id="fraud-modal-content" class="py-6 space-y-4">
            <div class="flex flex-col items-center justify-center py-8">
              <div class="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p class="mt-4 text-xs font-semibold text-slate-500">কুরিয়ার হিস্ট্রি লোড হচ্ছে...</p>
            </div>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    try {
      const data = await OrderAPI.checkFraud(phone, orderId);
      const content = document.getElementById("fraud-modal-content");
      if (!content) return;

      const badgeColor = data.risk_level === 'HIGH_RISK' ? 'badge-danger' : (data.risk_level === 'MEDIUM_RISK' ? 'badge-warning' : 'badge-success');

      content.innerHTML = `
        <!-- Risk Score Gauge -->
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div>
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">রিস্ক লেভেল</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="${badgeColor} text-sm px-3 py-1 font-bold">${data.risk_level}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">ডেলিভারি সাকসেস রেট</span>
            <h3 class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">${data.success_rate}</h3>
          </div>
        </div>

        <!-- Past Order Analytics Grid -->
        <div class="grid grid-cols-4 gap-2 text-center">
          <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <span class="text-[11px] text-slate-400 font-medium">মোট অর্ডার</span>
            <h4 class="text-base font-bold text-slate-900 dark:text-white mt-0.5">${data.total_orders}</h4>
          </div>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">ডেলিভারড</span>
            <h4 class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">${data.delivered_orders}</h4>
          </div>
          <div class="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40">
            <span class="text-[11px] text-amber-600 dark:text-amber-400 font-medium">ক্যান্সেলড</span>
            <h4 class="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">${data.cancelled_orders}</h4>
          </div>
          <div class="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/40">
            <span class="text-[11px] text-rose-600 dark:text-rose-400 font-medium">রিটার্ন/RTO</span>
            <h4 class="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">${data.rto_orders}</h4>
          </div>
        </div>

        <!-- Risk Reasons -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <h4 class="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">সিস্টেম মন্তব্য ও বিশ্লেষণ:</h4>
          <ul class="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
            ${data.reasons.map(r => `<li class="flex items-center gap-2"><i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-brand-500"></i> ${r}</li>`).join("")}
          </ul>
        </div>

        <!-- Action Button -->
        <button onclick="document.getElementById('fraud-modal-backdrop').remove()" class="w-full btn-secondary py-3 text-sm">
          বন্ধ করুন
        </button>
      `;

      if (window.lucide) window.lucide.createIcons();

    } catch (err) {
      const content = document.getElementById("fraud-modal-content");
      if (content) {
        content.innerHTML = `<div class="p-4 bg-rose-50 text-rose-600 text-sm rounded-xl text-center">ফ্রড চেক সম্পন্ন করা যায়নি: ${err.message}</div>`;
      }
    }
  }
};
