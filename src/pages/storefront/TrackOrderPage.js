/**
 * ============================================================================
 * DREAM CART BD — REAL-TIME ORDER TRACKING PAGE (TrackOrderPage.js)
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
        
        <!-- Header -->
        <div class="text-center mb-8">
          <span class="badge-info text-xs mb-2">লাইভ কুরিয়ার স্ট্যাটাস</span>
          <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white">অর্ডার ট্র্যাকিং সিস্টেম</h1>
          <p class="text-sm text-slate-500 mt-1">আপনার ১১ ডিজিটের মোবাইল নম্বর অথবা অর্ডার নম্বর দিয়ে স্ট্যাটাস জানুন</p>
        </div>

        <!-- Search Input Box -->
        <div class="glass-panel p-4 sm:p-6 rounded-3xl mb-8 flex flex-col sm:flex-row gap-3 shadow-sm border border-slate-200 dark:border-slate-800">
          <input 
            type="text" 
            id="track-order-input" 
            placeholder="যেমন: 017XXXXXXXX অথবা DCBD-123456" 
            class="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500" 
          />
          <button onclick="window.performOrderTracking()" id="track-submit-btn" class="btn-primary px-8 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25">
            <i data-lucide="search" class="w-4 h-4"></i>
            <span>ট্র্যাক করুন</span>
          </button>
        </div>

        <!-- Dynamic Order Timeline Container -->
        <div id="tracking-result-box" class="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">লাইভ ডেলিভারি অগ্রগতি</h3>
              <p class="text-xs text-slate-400">অর্ডার নম্বর দেওয়ার পর লাইভ আপডেট দেখতে পাবেন</p>
            </div>
            <span class="badge-success text-xs">সক্রিয় ট্র্যাকিং</span>
          </div>

          <!-- Step Progress Timeline -->
          <div class="space-y-6 pt-2">
            
            <!-- Step 1 -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-emerald-600/20">
                <i data-lucide="check" class="w-5 h-5"></i>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">১. অর্ডার গ্রহণ করা হয়েছে</h4>
                <p class="text-xs text-slate-400 mt-0.5">আপনার অর্ডারটি আমাদের সিস্টেমে সফলভাবে জমা পড়েছে।</p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-brand-600/20">
                <i data-lucide="package-check" class="w-5 h-5"></i>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">২. প্যাকেজিং সম্পন্ন ও কুরিয়ারে হস্তান্তর</h4>
                <p class="text-xs text-slate-400 mt-0.5">পার্সেলটি হাব থেকে কুরিয়ার এজেন্টের কাছে পাঠানো হয়েছে।</p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0">
                <i data-lucide="truck" class="w-5 h-5"></i>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-slate-500">৩. ডেলিভারির জন্য বের হয়েছে</h4>
                <p class="text-xs text-slate-400 mt-0.5">রাইডার আপনার ঠিকানায় পার্সেল পৌঁছে দেওয়ার পথে রয়েছে।</p>
              </div>
            </div>

            <!-- Step 4 -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0">
                <i data-lucide="home" class="w-5 h-5"></i>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-slate-500">৪. সফল ডেলিভারি ও রিসিভ</h4>
                <p class="text-xs text-slate-400 mt-0.5">গ্রাহক পার্সেল বুঝে পেয়েছেন।</p>
              </div>
            </div>

          </div>

        </div>

      </main>

      ${Footer.render()}
    </div>
  `;
};

// Live Order Tracker Action
window.performOrderTracking = async () => {
  const query = document.getElementById("track-order-input")?.value.trim();
  if (!query) {
    alert("অনুগ্রহ করে আপনার ফোন নম্বর অথবা অর্ডার নম্বর লিখুন।");
    return;
  }

  const resultBox = document.getElementById("tracking-result-box");
  if (resultBox) {
    resultBox.innerHTML = `
      <div class="text-center py-8">
        <div class="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs font-bold text-slate-500">কুরিয়ার সার্ভার থেকে তথ্য লোড হচ্ছে...</p>
      </div>
    `;
  }

  try {
    const orders = await OrderAPI.getAll() || [];
    const matched = orders.find(o => String(o.phone).includes(query) || String(o.order_number).includes(query) || String(o.order_id).includes(query));

    if (matched && resultBox) {
      resultBox.innerHTML = `
        <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 mb-4">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="text-sm font-bold text-emerald-800 dark:text-emerald-300">অর্ডার নম্বর: ${matched.order_number || matched.order_id}</h4>
              <p class="text-xs text-slate-500">গ্রাহক: ${matched.customer_name} | ফোন: ${matched.phone}</p>
            </div>
            <span class="badge-success uppercase font-bold text-xs">${matched.order_status}</span>
          </div>
        </div>
        <div class="text-xs space-y-2 text-slate-600 dark:text-slate-300">
          <p><strong>ডেলিভারি ঠিকানা:</strong> ${matched.shipping_address}</p>
          <p><strong>মোট বিল:</strong> ৳${matched.total} (${matched.payment_method})</p>
          <p><strong>কুরিয়ার ট্র্যাকিং কোড:</strong> ${matched.tracking_code || 'প্রসেসিং হচ্ছে'}</p>
        </div>
      `;
    } else if (resultBox) {
      resultBox.innerHTML = `
        <div class="text-center py-6 text-slate-500 text-xs">
          "${query}" নম্বরে কোনো সক্রিয় অর্ডার পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।
        </div>
      `;
    }
  } catch (err) {
    if (resultBox) {
      resultBox.innerHTML = `<div class="text-rose-500 text-xs text-center py-4">ট্র্যাকিং ব্যর্থ হয়েছে: ${err.message}</div>`;
    }
  }
};

export default TrackOrderPage;
