/**
 * DREAM CART BD — OFFERS & NOTICES PAGE
 * Dedicated deals showcase, free delivery qualifications, online payment 5% discounts,
 * voucher vouchers, and nationwide COD notice.
 */

export function renderOffersPage() {
  return `
    <div class="max-w-5xl mx-auto space-y-10 pb-20">
      
      <!-- Page Hero Header -->
      <div class="bg-gradient-to-r from-amber-600 via-emerald-700 to-teal-800 text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
        <div class="relative z-10 max-w-2xl space-y-3">
          <span class="bg-white/20 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider backdrop-blur">
            স্পেশাল অফার ও নোটিশ
          </span>
          <h1 class="text-3xl md:text-5xl font-black tracking-tight">Dream Cart BD Offers</h1>
          <p class="text-sm text-emerald-100 leading-relaxed">
            অরিজিনাল গ্যাজেট ও কোয়ালিটি পণ্যের সেরা ডিল এবং আকর্ষণীয় ডিসকাউন্ট উপভোগ করুন।
          </p>
        </div>
      </div>

      <!-- Core 3 Noticed Offers -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Offer 1: Free Delivery -->
        <div class="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div class="space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">
              🚚
            </div>
            <span class="badge badge-success text-[10px] uppercase font-bold">ফ্রি শিপিং অফার</span>
            <h3 class="text-lg font-black text-slate-900 leading-snug">
              ২০০০ টাকার বেশি শপিং করলে ডেলিভারি চার্জ ফ্রি!
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              যেকোনো পণ্য বা একাধিক আইটেম মিলিয়ে আপনার কার্ট ভ্যালু ৳২,০০০ বা তার বেশি হলেই ঢাকা, কুমিল্লা সহ সারা বাংলাদেশে ডেলিভারি ফি সম্পূর্ণ ফ্রি (৳০)।
            </p>
          </div>
          <div class="pt-4 border-t border-slate-100">
            <a href="#/shop" class="btn-primary w-full text-center text-xs py-2.5 font-bold">
              শপিং শুরু করুন →
            </a>
          </div>
        </div>

        <!-- Offer 2: 5% Online Payment Discount -->
        <div class="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div class="space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl">
              🔥
            </div>
            <span class="badge badge-warning text-[10px] uppercase font-bold">ইনস্ট্যান্ট ক্যাশব্যাক</span>
            <h3 class="text-lg font-black text-slate-900 leading-snug">
              অনলাইনে পেমেন্ট করলে ৫% ডিসকাউন্ট!
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              বিকাশ (মার্চেন্ট বা পার্সোনাল), নগদ, রকেট কিংবা ব্যাংক ট্রান্সফারে অগ্রিম মূল্য পরিশোধ করলেই সাথে সাথে মোট বিলের ওপর ৫% ছাড় উপভোগ করুন।
            </p>
          </div>
          <div class="pt-4 border-t border-slate-100">
            <a href="#/checkout" class="btn-secondary w-full text-center text-xs py-2.5 font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 border-none">
              চেকআউটে যান →
            </a>
          </div>
        </div>

        <!-- Offer 3: Cash On Delivery -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div class="space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-2xl">
              🛡️
            </div>
            <span class="badge badge-info text-[10px] uppercase font-bold">নিরাপদ কেনাকাটা</span>
            <h3 class="text-lg font-black text-slate-900 leading-snug">
              অনলাইনে অর্ডার করুন, পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              ১০০% ক্যাশ অন ডেলিভারি (COD) সুবিধা। কুরিয়ার ম্যানের সামনে পার্সেল যাচাই করার নিশ্চয়তা এবং ৭ দিনের সহজ রিপ্লেসমেন্ট সুবিধা।
            </p>
          </div>
          <div class="pt-4 border-t border-slate-100">
            <a href="#/track" class="btn-secondary w-full text-center text-xs py-2.5 font-bold text-slate-700">
              অর্ডার ট্র্যাক করুন →
            </a>
          </div>
        </div>

      </div>

      <!-- Delivery Fee Breakdown Card -->
      <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 class="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          রেগুলার ডেলিভারি রেট চার্ট (Delivery Fee Matrix)
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div class="text-slate-500 font-semibold">In Cumilla</div>
            <div class="text-2xl font-black text-emerald-600">৳70</div>
            <div class="text-[11px] text-slate-400">কুমিল্লা সদর হোম ডেলিভারি</div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div class="text-slate-500 font-semibold">In Dhaka</div>
            <div class="text-2xl font-black text-emerald-600">৳90</div>
            <div class="text-[11px] text-slate-400">ঢাকা সিটির ভেতরে হোম ডেলিভারি</div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div class="text-slate-500 font-semibold">Out of Dhaka</div>
            <div class="text-2xl font-black text-emerald-600">৳120</div>
            <div class="text-[11px] text-slate-400">সারা বাংলাদেশ হোম ডেলিভারি</div>
          </div>
          <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <div class="text-emerald-800 font-bold">Office Pickup</div>
            <div class="text-2xl font-black text-emerald-700">৳0</div>
            <div class="text-[11px] text-emerald-600">চৌধুরী প্লাজা, পদুয়ার বাজার</div>
          </div>
        </div>
        <p class="text-xs text-emerald-700 font-bold text-center pt-2">
          * মনে রাখবেন: যেকোনো জোনে কার্ট ভ্যালু ৳২,০০০ অতিক্রম করলেই ডেলিভারি সম্পূর্ণ ফ্রি!
        </p>
      </div>

    </div>
  `;
}
