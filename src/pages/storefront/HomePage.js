/**
 * DREAM CART BD — HOME PAGE
 * Hero banner with authentic offers & notices, verified product catalog,
 * trust badges, and partner gateway.
 */

import { renderProductCard } from '../../components/ProductCard.js';
import { apiClient } from '../../api/client.js';

export async function renderHomePage() {
  const res = await apiClient.request("products/list");
  const products = (res.data && res.data.items) || [];

  return `
    <div class="space-y-12 pb-16">
      
      <!-- Top Notice Announcement Bar in Page -->
      <div class="p-3.5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-2xl text-white text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-emerald-600/50">
        <div class="flex items-center gap-2">
          <span class="text-lg">📢</span>
          <span><strong>নোটিশ:</strong> ৳২,০০০ বা তার বেশি অর্ডারে সারা দেশে ফ্রি শিপিং! অনলাইনে অর্ডার করুন, পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।</span>
        </div>
        <a href="#/offers" class="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded-full text-xs transition whitespace-nowrap shadow-xs">
          ৫% ছাড় অফার দেখুন →
        </a>
      </div>

      <!-- Hero Banner Section -->
      <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-8 md:p-14 shadow-2xl border border-emerald-900/40">
        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            অফিশিয়াল ড্রিম কার্ট বিডি
          </div>
          <h1 class="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            Smart Digital Commerce for <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Modern Living.</span>
          </h1>
          <p class="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">
            সরাসরি অথেন্টিক ইম্পোর্টারদের কাছ থেকে সেরা মানের গ্যাজেট, প্রিমিয়াম স্মার্টওয়াচ, অর্গানিক হেলথ ফুড ও নিত্যপ্রয়োজনীয় ইলেকট্রনিক্স সামগ্রী।
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <a href="#/shop" class="btn-primary py-3 px-6 text-sm font-bold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50">
              পণ্যসমূহ দেখুন →
            </a>
            <a href="#/offers" class="btn-secondary bg-white/10 hover:bg-white/20 text-white border-white/20 py-3 px-6 text-sm font-semibold backdrop-blur">
              🔥 স্পেশাল অফার
            </a>
            <a href="https://wa.me/8801581703822" target="_blank" class="btn-secondary bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border-emerald-500/40 py-3 px-5 text-sm font-semibold backdrop-blur flex items-center gap-1.5">
              <span>💬</span> WhatsApp Order
            </a>
          </div>
        </div>

        <!-- Decorative Background Elements -->
        <div class="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block opacity-95">
          <div class="w-80 rounded-3xl bg-slate-900/80 p-6 border border-emerald-500/30 backdrop-blur-md shadow-2xl space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden">
                <img src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" alt="Dream Cart BD" class="w-full h-full object-contain" />
              </div>
              <div>
                <h4 class="font-black text-white text-base">Dream Cart BD</h4>
                <p class="text-[11px] text-emerald-400">Paduar Bazar, Cumilla</p>
              </div>
            </div>
            <div class="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <div class="flex justify-between">
                <span class="text-slate-400">In Cumilla:</span>
                <span class="font-bold text-emerald-400">৳70</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">In Dhaka:</span>
                <span class="font-bold text-emerald-400">৳90</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Out of Dhaka:</span>
                <span class="font-bold text-emerald-400">৳120</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Office Pickup:</span>
                <span class="font-bold text-emerald-400">৳0 Free</span>
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-[11px] text-emerald-300 font-bold text-center">
              🎉 ২০০০+ টাকার অর্ডারে সারা দেশে ফ্রি শিপিং!
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Badges Section -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div class="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
            🚚
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800">Whole Bangladesh</h4>
            <p class="text-[11px] text-slate-500">৳২,০০০+ অর্ডারে ফ্রি ডেলিভারি</p>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
            💵
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800">ক্যাশ অন ডেলিভারি</h4>
            <p class="text-[11px] text-slate-500">পণ্য দেখে মূল্য পরিশোধ</p>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
            💳
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800">৫% অনলাইন ছাড়</h4>
            <p class="text-[11px] text-slate-500">bKash / Nagad / Rocket / Bank</p>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
            📍
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800">কুমিল্লা আউটলেট</h4>
            <p class="text-[11px] text-slate-500">পদুয়ার বাজার বিশ্বরোড</p>
          </div>
        </div>

      </section>

      <!-- Featured Products Grid -->
      <section>
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-widest">হ্যান্ডপিকড কালেকশন</span>
            <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Trending Products & Hot Deals</h2>
          </div>
          <div class="flex items-center gap-2">
            <a href="#/shop" class="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              সকল প্রোডাক্ট দেখুন →
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${products.map(p => renderProductCard(p)).join("")}
        </div>
      </section>

      <!-- Multi-Vendor Value Proposition Banner -->
      <section class="rounded-3xl bg-slate-900 text-white p-8 md:p-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="max-w-xl">
          <span class="bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">বিজনেস পার্টনারশিপ</span>
          <h3 class="text-2xl md:text-3xl font-black mt-2 mb-3">Earn with Dream Cart BD</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            সেল করুন সারা বাংলাদেশের গ্রাহকদের কাছে অথবা সেলার/রিসেলার/পাইকারি পার্টনার হিসেবে জয়েন করুন। জিরো ইনভেস্টমেন্ট রিসেলিং ও কারখানা মূল্যে হোলসেল সুবিধা।
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <a href="#/partner" class="btn-primary text-center whitespace-nowrap">Join Partner Network</a>
          <a href="#/contact" class="btn-secondary bg-slate-800 border-slate-700 text-white hover:bg-slate-700 text-center whitespace-nowrap">Contact Store</a>
        </div>
      </section>

    </div>
  `;
}
