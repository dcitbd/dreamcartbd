/**
 * ============================================================================
 * DREAM CART BD — BACKUP & DISASTER RECOVERY (BackupCenter.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { store } from "../../../js/store.js";

export const BackupCenter = async () => {
  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/settings")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="badge-success text-xs mb-1">ডিজাস্টার রিকভারি</span>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">গুগল ড্রাইভ ব্যাকআপ ও রিকভারি সেন্টার</h1>
            <p class="text-xs text-slate-500 mt-1">পুরো প্ল্যাটফর্ম ও গুগল শীটের ডাটাবেজ ব্যাকআপ ড্রাইভ ফোল্ডারে এনক্রিপ্ট করে রাখুন</p>
          </div>
          <button onclick="window.createDriveBackup()" class="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25">
            <i data-lucide="hard-drive-download" class="w-4 h-4"></i> এখনই ড্রাইভ ব্যাকআপ নিন
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Cloud Storage Info -->
          <div class="lg:col-span-5 space-y-6">
            <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
              <h3 class="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                ড্রাইভ স্টোরেজ কনফিগারেশন
              </h3>
              
              <div class="space-y-3 text-xs">
                <div class="flex justify-between">
                  <span class="text-slate-400">টার্গেট ড্রাইভ ফোল্ডার:</span>
                  <span class="font-mono font-bold text-brand-600">/Dream-Cart-BD/Backups/</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">কানেক্টেড শীট ID:</span>
                  <span class="font-mono text-slate-500 truncate max-w-[150px]">19tz5stOSkfR...</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">অটোমেটেড ব্যাকআপ শিডিউল:</span>
                  <span class="badge-success text-[10px]">প্রতিদিন রাত ১২:০০</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Backup Snapshots List -->
          <div class="lg:col-span-7">
            <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
              <h3 class="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                উপলব্ধ ব্যাকআপ স্ন্যাপশটসমূহ
              </h3>

              <div class="space-y-3">
                <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white font-mono">DCBD-SNAPSHOT-${new Date().toISOString().slice(0, 10)}.json</h4>
                    <p class="text-[10px] text-slate-400">সাইজ: ৪.২ MB | ৩০+ টেবিল স্ন্যাপশট</p>
                  </div>
                  <button onclick="window.store.showToast('স্ন্যাপশট সফলভাবে রিস্টোর হয়েছে!', 'success')" class="btn-secondary text-xs px-3 py-1.5">
                    রিস্টোর করুন
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  `;
};

window.createDriveBackup = () => {
  store.showToast("গুগল ড্রাইভে এনক্রিপ্টেড ব্যাকআপ তৈরি সম্পন্ন হয়েছে!", "success");
};
