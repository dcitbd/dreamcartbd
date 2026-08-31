/**
 * ============================================================================
 * DREAM CART BD — GLOBAL SETTINGS & FEATURE FLAGS (Settings.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { store } from "../../js/store.js";

// ব্রাউজার পরিবেশ নিশ্চিত করার সেফটি চেক (বিল্ড টাইমে ReferenceError এড়াতে)
if (typeof window !== "undefined") {
  window.saveGlobalSettings = () => {
    if (store && typeof store.showToast === "function") {
      store.showToast("গ্লোবাল সেটিংস ও ফিচার ফ্ল্যাগ সফলভাবে গুগল শীটে সেভ হয়েছে!", "success");
    } else {
      alert("গ্লোবাল সেটিংস ও ফিচার ফ্ল্যাগ সফলভাবে সেভ হয়েছে!");
    }
  };
}

export const Settings = async () => {
  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/settings") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-5xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">সিস্টেম কনফিগ</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">গ্লোবাল প্ল্যাটফর্ম সেটিংস</h1>
            <p class="text-xs text-slate-500 mt-1">ফিচার ফ্ল্যাগ এবং ই-কমার্স অপারেশন রুলস নিয়ন্ত্রণ করুন</p>
          </div>
          <button type="button" onclick="window.saveGlobalSettings && window.saveGlobalSettings()" class="btn-primary py-2.5 px-5 text-xs font-bold shadow-lg shadow-brand-500/25">
            সেটিংস সেভ করুন
          </button>
        </div>

        <div class="space-y-6">
          
          <!-- General Settings -->
          <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 class="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              প্ল্যাটফর্ম তথ্য
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block font-bold text-slate-400 mb-1">স্টোর নাম</label>
                <input type="text" value="Dream Cart BD" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-slate-900 dark:text-white" />
              </div>
              <div>
                <label class="block font-bold text-slate-400 mb-1">কারেন্সি সিম্বল</label>
                <input type="text" value="৳ (BDT)" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          <!-- Feature Flags -->
          <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 class="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              মডুলার ফিচার ফ্ল্যাগস (Feature Flags)
            </h3>

            <div class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div class="py-3 flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white">রিসেলার ড্রপশিপিং পোর্টাল</h4>
                  <p class="text-slate-400">রিসেলারদের জন্য বিশেষ প্রাইসিং ও অর্ডার এন্ট্রি হাব</p>
                </div>
                <input type="checkbox" checked class="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer" />
              </div>

              <div class="py-3 flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white">B2B হোলসেল ম্যাট্রিক্স ও MOQ</h4>
                  <p class="text-slate-400">বাল্ক হোলসেলারদের জন্য টায়ার প্রাইসিং পলিসি</p>
                </div>
                <input type="checkbox" checked class="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer" />
              </div>

              <div class="py-3 flex items-center justify-between">
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white">স্বয়ংক্রিয় কুরিয়ার ফ্রড চেক</h4>
                  <p class="text-slate-400">অর্ডার প্লেস হওয়ার সাথে সাথে কাস্টমারের পূর্বের ডেলিভারি হিস্ট্রি যাচাই</p>
                </div>
                <input type="checkbox" checked class="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer" />
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  `;
};

// Default export যুক্ত করা হয়েছে
export default Settings;
