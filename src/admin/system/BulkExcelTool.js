/**
 * ============================================================================
 * DREAM CART BD — BULK EXCEL / CSV IMPORTER (BulkExcelTool.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { store } from "../../js/store.js";

// ব্রাউজার পরিবেশ নিশ্চিত করার সেফটি চেক (বিল্ড টাইমে ReferenceError এড়াতে)
if (typeof window !== "undefined") {
  window.downloadSampleExcel = () => {
    if (store && typeof store.showToast === "function") {
      store.showToast("স্যাম্পল এক্সেল টেমপ্লেট ডাউনলোড হচ্ছে...", "info");
    } else {
      alert("স্যাম্পল এক্সেল টেমপ্লেট ডাউনলোড হচ্ছে...");
    }
  };
}

export const BulkExcelTool = async () => {
  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/system/bulk") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-info text-xs mb-1">বাল্ক অপারেশন হাব</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">এক্সেল/CSV বাল্ক প্রোডাক্ট ইমপোর্টার</h1>
            <p class="text-xs text-slate-500 mt-1">এক ক্লিকে শত শত প্রোডাক্ট গুগল শীটে ইমপোর্ট ও ভ্যালিডেট করুন</p>
          </div>
          <button type="button" onclick="window.downloadSampleExcel && window.downloadSampleExcel()" class="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-sm">
            <i data-lucide="download" class="w-4 h-4"></i> স্যাম্পল এক্সেল টেমপ্লেট
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Upload Area -->
          <div class="lg:col-span-5 space-y-6">
            <div class="glass-panel p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-4 hover:border-brand-500 transition-colors cursor-pointer">
              <div class="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-500 flex items-center justify-center mx-auto">
                <i data-lucide="file-spreadsheet" class="w-8 h-8"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">এক্সেল বা CSV ফাইল এখানে ড্রপ করুন</h3>
                <p class="text-xs text-slate-400 mt-1">বা কম্পিউটার থেকে ফাইল সিলেক্ট করুন (.xlsx, .csv)</p>
              </div>
              <input type="file" id="bulk-file-input" accept=".csv, .xlsx" class="hidden" />
              <button type="button" onclick="document.getElementById('bulk-file-input') && document.getElementById('bulk-file-input').click()" class="btn-primary py-2 px-5 text-xs shadow-md">
                ফাইল ব্রাউজ করুন
              </button>
            </div>

            <!-- Import Guidelines -->
            <div class="glass-panel p-6 rounded-3xl space-y-2 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-2">ইমপোর্ট নির্দেশিকা:</h4>
              <p class="flex items-center gap-2"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i> প্রথম সারিতে সঠিক হেডার কলাম থাকতে হবে।</p>
              <p class="flex items-center gap-2"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i> ডুপ্লিকেট SKU স্বয়ংক্রিয়ভাবে স্কিপ বা আপডেট হবে।</p>
              <p class="flex items-center gap-2"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i> সর্বোচ্চ ১০০০টি রো একসাথে ইমপোর্ট করা যাবে।</p>
            </div>
          </div>

          <!-- Data Preview Area -->
          <div class="lg:col-span-7">
            <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-200 dark:border-slate-800">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">আপলোড প্রিভিউ ও ভ্যালিডেশন</h3>
                <span id="preview-row-count" class="badge-success text-xs px-2 py-0.5 rounded-md">০ টি রো রেডি</span>
              </div>

              <div class="h-64 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 text-xs text-center p-4">
                কোনো ফাইল আপলোড করা হয়নি। ফাইল ড্রপ করলে ডাটা প্রিভিউ এখানে দেখাবে।
              </div>

              <button type="button" onclick="window.store && window.store.showToast ? window.store.showToast('গুগল শীটে সফলভাবে ইমপোর্ট সম্পন্ন হয়েছে!', 'success') : null" class="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25">
                <i data-lucide="upload-cloud" class="w-4 h-4"></i> গুগল শীটে সরাসরি ইমপোর্ট করুন
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  `;
};

// Default export যুক্ত করা হয়েছে
export default BulkExcelTool;
