/**
 * ============================================================================
 * DREAM CART BD — REAL-TIME ORDER TRACKING (TrackOrderPage.js)
 * ============================================================================
 */

import { Header } from "../../components/Header.js";
import { Footer } from "../../components/Footer.js";
import { OrderAPI } from "../../api/orders.js";

export const TrackOrderPage = async () => {
  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header.render()}

      <main class="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white">লাইভ অর্ডার ট্র্যাকিং</h1>
          <p class="text-sm text-slate-500 mt-1">আপনার ফোন নম্বর অথবা অর্ডার নম্বর দিয়ে স্ট্যাটাস জানুন</p>
        </div>

        <div class="glass-panel p-6 rounded-2xl mb-8 flex gap-3">
          <input type="text" id="track-input" placeholder="ফোন নম্বর বা অর্ডার নম্বর (যেমন: DCBD-123456)" class="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none" />
          <button id="track-submit-btn" class="btn-primary px-6 py-3 text-sm font-bold">ট্র্যাক করুন</button>
        </div>

        <!-- Order Timeline Progress -->
        <div id="timeline-result" class="glass-panel p-8 rounded-3xl space-y-8">
          <h3 class="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">অর্ডার টাইমলাইন স্ট্যাটাস</h3>
          
          <div class="space-y-6">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
              <div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">অর্ডার গ্রহণ করা হয়েছে</h4>
                <p class="text-xs text-slate-400">সিস্টেমে সফলভাবে অর্ডার রিসিভ হয়েছে</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">প্যাকেজিং সম্পন্ন ও কুরিয়ারে হস্তান্তর</h4>
                <p class="text-xs text-slate-400">পার্সেল কুরিয়ার হাবে পাঠানো হয়েছে</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <div>
                <h4 class="text-sm font-bold text-slate-500">ডেলিভারির জন্য বের হয়েছে</h4>
                <p class="text-xs text-slate-400">রাইডার ডেলিভারি দেওয়ার জন্য প্রস্তুত</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      ${Footer.render()}
    </div>
  `;
};
