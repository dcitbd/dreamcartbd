/**
 * ============================================================================
 * DREAM CART BD — ORDER SUCCESS & DIGITAL INVOICE (OrderSuccessPage.js)
 * ============================================================================
 */

import { Header } from "../../components/Header.js";
import { Footer } from "../../components/Footer.js";

export const OrderSuccessPage = async (params = {}) => {
  const orderId = params.id || "DCBD-" + Math.floor(100000 + Math.random() * 900000);

  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header.render()}

      <main class="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div class="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-6 border border-emerald-500/20 shadow-2xl">
          
          <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <i data-lucide="check" class="w-10 h-10"></i>
          </div>

          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-white">ধন্যবাদ! আপনার অর্ডার সফল হয়েছে</h1>
            <p class="text-slate-500 text-sm mt-2">অর্ডার আইডি: <span class="font-bold text-brand-600 font-sans">${orderId}</span></p>
          </div>

          <p class="text-slate-600 dark:text-slate-300 max-w-md mx-auto text-sm leading-relaxed">
            আমাদের কাস্টমার কেয়ার প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করে অর্ডারটি কনফার্ম করবেন।
          </p>

          <div class="flex flex-wrap justify-center gap-4 pt-4">
            <button onclick="window.print()" class="btn-secondary px-6 py-3 text-sm flex items-center gap-2">
              <i data-lucide="printer" class="w-4 h-4"></i> ইনভয়েস প্রিন্ট করুন
            </button>
            <a href="/track-order?id=${orderId}" class="btn-primary px-6 py-3 text-sm flex items-center gap-2">
              <i data-lucide="truck" class="w-4 h-4"></i> অর্ডার ট্র্যাক করুন
            </a>
          </div>

        </div>
      </main>

      ${Footer.render()}
    </div>
  `;
};
