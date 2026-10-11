/**
 * DREAM CART BD — OFFERS & CUSTOMER BENEFITS HUB (OffersPage.js)
 * Implements user requirements:
 * - Free delivery on orders >= ৳2,000 across Bangladesh
 * - 5% instant discount on online prepayment (bKash/Nagad/Bank)
 * - Reseller partner program (up to 10% commission, dropshipping)
 * - Wholesaler & bulk buying privileges at lowest importer rates
 * - Comprehensive list cards for all platform benefits (100% Genuine, 1-Year Warranty, 7-Day Replacement, Fast Delivery, 24/7 Support)
 * - STRICT REQUIREMENT: NO COUPONS! (All benefits are automatic and transparent)
 * - Rich CSS card animations, glowing borders, and responsive grid layout.
 */

export function renderOffersPage() {
  return `
    <div class="space-y-10 pb-24 max-w-6xl mx-auto">
      
      <!-- Top Page Header -->
      <div class="border-b border-slate-200/80 dark:border-slate-800 pb-5 text-center sm:text-left">
        <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 justify-center sm:justify-start">
          <a href="/" class="hover:text-emerald-600 transition">হোম</a>
          <span>/</span>
          <span class="text-slate-700 dark:text-slate-300 font-bold">অফার ও সুবিধাসমূহ</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2.5">
              <span>🎁</span> ড্রিম কার্ট বিডি বিশেষ অফার ও গ্রাহক সুবিধাসমূহ
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              কোনো কুপন কোডের ঝামেলা ছাড়া স্বয়ংক্রিয় সুবিধা, ফ্রি ডেলিভারি, অনলাইন ক্যাশব্যাক ও এক্সক্লুসিভ পার্টনার বেনিফিট
            </p>
          </div>

          <!-- Zero Coupon Notice Badge -->
          <div class="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-3.5 py-2 shadow-xs self-center sm:self-auto">
            <span class="text-emerald-600 dark:text-emerald-400 text-sm">✨</span>
            <div class="text-xs font-bold text-emerald-800 dark:text-emerald-300 text-left">
              ১০০% স্বয়ংক্রিয় সুবিধা • <strong>কোনো কুপন লাগবে না</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Prime Hero Benefits: 2-Column High-Impact Cards (Free Delivery & 5% Online Discount) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Benefit 1: Free Delivery on Orders >= ৳2,000 -->
        <div class="card-animated card-stagger-1 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between space-y-6">
          <div class="space-y-3 relative z-10">
            <div class="flex items-center justify-between">
              <span class="bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                🔥 সবার প্রিয় অফার
              </span>
              <span class="text-3xl">🚚</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black leading-tight">
              ৳২,০০০+ কেনাকাটায় সম্পূর্ণ ফ্রি ডেলিভারি!
            </h2>

            <p class="text-xs sm:text-sm text-emerald-50 leading-relaxed font-normal">
              যেকোনো পণ্য মিলিয়ে মোট ২,০০০ টাকা বা তার বেশি অর্ডার করলেই সারা বাংলাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি (৳০)!
            </p>

            <!-- Key Points -->
            <div class="pt-2 space-y-1.5 text-xs text-emerald-100 font-medium border-t border-emerald-500/40">
              <div class="flex items-center gap-2">
                <span>✓</span> ঢাকার ভেতরে ৭০ টাকা এবং ঢাকার বাইরে ১৩০ টাকা সম্পূর্ণ সাশ্রয়
              </div>
              <div class="flex items-center gap-2">
                <span>✓</span> কোনো কুপন কোড ছাড়াই কার্ট ও চেকআউটে স্বয়ংক্রিয়ভাবে কার্যকর
              </div>
              <div class="flex items-center gap-2">
                <span>✓</span> একাধিক ক্যাটাগরির পণ্য একসাথে কার্টে যোগ করলেও অফার প্রযোজ্য
              </div>
            </div>
          </div>

          <div class="pt-2 relative z-10">
            <a 
              href="/products" 
              class="btn-secondary bg-white text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold py-2.5 px-6 shadow-md inline-flex items-center gap-2 rounded-xl transition"
            >
              <span>🛍️</span> এখনই শপিং শুরু করুন →
            </a>
          </div>

          <!-- Decorative Background Shapes -->
          <div class="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        <!-- Benefit 2: 5% Instant Online Prepayment Discount -->
        <div class="card-animated card-stagger-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between space-y-6">
          <div class="space-y-3 relative z-10">
            <div class="flex items-center justify-between">
              <span class="bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                ⚡ ডিজিটাল পেমেন্ট অফার
              </span>
              <span class="text-3xl">💳</span>
            </div>

            <h2 class="text-2xl sm:text-3xl font-black leading-tight">
              অনলাইন পেমেন্টে ইনস্ট্যান্ট ৫% সরাসরি ছাড়!
            </h2>

            <p class="text-xs sm:text-sm text-indigo-50 leading-relaxed font-normal">
              বিকাশ (মার্চেন্ট/পার্সোনাল), নগদ বা ব্যাংক পেমেন্টে অগ্রিম মূল্য পরিশোধ করলেই সাথে সাথে মোট মূল্যের ওপর অতিরিক্ত ৫% ডিসকাউন্ট।
            </p>

            <!-- Key Points -->
            <div class="pt-2 space-y-1.5 text-xs text-indigo-100 font-medium border-t border-indigo-500/40">
              <div class="flex items-center gap-2">
                <span>✓</span> বিকাশ মার্চেন্ট: <strong class="font-mono text-white">01581703822</strong> (পেমেন্ট গেটওয়ে)
              </div>
              <div class="flex items-center gap-2">
                <span>✓</span> বিকাশ পার্সোনাল: <strong class="font-mono text-white">01879653143</strong> (সেন্ড মানি)
              </div>
              <div class="flex items-center gap-2">
                <span>✓</span> চেকআউটে "Online Payment" সিলেক্ট করলেই স্বয়ংক্রিয় ৫% কমে যাবে
              </div>
            </div>
          </div>

          <div class="pt-2 relative z-10">
            <a 
              href="/checkout" 
              class="btn-secondary bg-white text-indigo-800 hover:bg-indigo-50 text-xs sm:text-sm font-bold py-2.5 px-6 shadow-md inline-flex items-center gap-2 rounded-xl transition"
            >
              <span>💳</span> পেমেন্ট ও চেকআউট দেখুন →
            </a>
          </div>

          <!-- Decorative Background Shapes -->
          <div class="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>

      </div>

      <!-- Section: Partner Programs Grid (Reseller & Wholesaler Benefits) -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-lg">🤝</span>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            বিজনেস পার্টনার ও পাইকারি বিশেষ সুবিধা
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Benefit 3: Reseller Partner Benefits -->
          <div class="card-animated card-stagger-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  জিরো ইনভেস্টমেন্টে ড্রপশিপিং
                </span>
                <span class="text-2xl">💼</span>
              </div>

              <h3 class="text-xl font-black text-slate-900 dark:text-white">
                রিসেলার পার্টনার প্রোগ্রাম (১০% পর্যন্ত কমিশন)
              </h3>

              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                কোনো নিজস্ব স্টক বা ইনভেস্টমেন্ট ছাড়াই ঘরে বসে নিজের ফেসবুক পেজ বা শপের মাধ্যমে ড্রিম কার্ট বিডি-র পণ্য রিসেলিং করুন।
              </p>

              <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <div class="flex items-start gap-2">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span>প্রতিটি সফল ডেলিভারিতে ১০% পর্যন্ত নিশ্চিত প্রফিট মার্জিন</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span>কুরিয়ার প্যাকিং, ইনভয়েস ও কাস্টমার ডেলিভারি সরাসরি আমরা সামলাব</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-emerald-600 font-bold">✓</span>
                  <span>ডেডিকেটেড রিসেলার ড্যাশবোর্ড ও নিয়মিত বিকাশ উইথড্র সুবিধা</span>
                </div>
              </div>
            </div>

            <div class="pt-2 flex items-center gap-3">
              <a 
                href="/reseller/register" 
                class="btn-primary text-xs font-bold py-2.5 px-5 text-center flex-1 rounded-xl shadow-xs"
              >
                রিসেলার অ্যাকাউন্ট খুলুন →
              </a>
              <a 
                href="/reseller/login" 
                class="btn-secondary text-xs font-bold py-2.5 px-4 text-center rounded-xl border border-slate-200 dark:border-slate-700"
              >
                লগইন
              </a>
            </div>
          </div>

          <!-- Benefit 4: Wholesaler & Bulk Buying Benefits -->
          <div class="card-animated card-stagger-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  পাইকারি ক্রেতাদের জন্য
                </span>
                <span class="text-2xl">🏬</span>
              </div>

              <h3 class="text-xl font-black text-slate-900 dark:text-white">
                হোলসেলার ও পাইকারি রেট সুবিধা
              </h3>

              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                দোকানদার, পাইকারি ব্যবসায়ী ও করপোরেট ক্লায়েন্টদের জন্য সরাসরি ইমপোর্টার রেটে সর্বনিম্ন পাইকারি মূল্যে পণ্য ক্রয়ের বিশেষ সুবিধা।
              </p>

              <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <div class="flex items-start gap-2">
                  <span class="text-indigo-600 font-bold">✓</span>
                  <span>রিটেইল দামের চেয়ে অনেক কম আকর্ষণীয় পাইকারি রেট</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-indigo-600 font-bold">✓</span>
                  <span>স্বল্প মিনিমাম অর্ডার কোয়ান্টিটি (MOQ) দিয়ে শুরু করার সুযোগ</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-indigo-600 font-bold">✓</span>
                  <span>অফিশিয়াল ভেন্ডর ক্যাশ মেমো ও ফাস্ট ট্র্যাক কুরিয়ার ডেলিভারি</span>
                </div>
              </div>
            </div>

            <div class="pt-2 flex items-center gap-3">
              <a 
                href="/wholesaler/register" 
                class="btn-primary bg-indigo-600 hover:bg-indigo-700 text-xs font-bold py-2.5 px-5 text-center flex-1 rounded-xl shadow-xs"
              >
                হোলসেলার অ্যাকাউন্ট খুলুন →
              </a>
              <a 
                href="/wholesaler/login" 
                class="btn-secondary text-xs font-bold py-2.5 px-4 text-center rounded-xl border border-slate-200 dark:border-slate-700"
              >
                লগইন
              </a>
            </div>
          </div>

        </div>
      </div>

      <!-- Section: Platform Core Advantages & Guarantee Grid (অতিরিক্ত সুবিধার লিষ্ট কার্ড) -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-lg">🛡️</span>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            ড্রিম কার্ট বিডি-র সার্বক্ষণিক গ্রাহক সুবিধাসমূহ
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <!-- Benefit 5: 100% Genuine & 1-Year Warranty -->
          <div class="card-animated card-stagger-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div class="space-y-2.5">
              <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-lg flex-shrink-0">
                🛡️
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">১০০% জেনুইন ও ১ বছরের অফিশিয়াল ওয়ারেন্টি</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                আমাদের প্রতিটি ব্র্যান্ডেড গ্যাজেট ও স্মার্টওয়াচ সম্পূর্ণ আসল ও অথেনটিক। পাচ্ছেন ১ বছরের ব্র্যান্ড ওয়ারেন্টি।
              </p>
            </div>
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-emerald-600">
              ✓ অরিজিনাল সিকিউরিটি সিল নিশ্চিত
            </div>
          </div>

          <!-- Benefit 6: 7 Days Easy Replacement -->
          <div class="card-animated card-stagger-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div class="space-y-2.5">
              <div class="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-lg flex-shrink-0">
                🔄
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                পণ্য হাতে পাওয়ার পর কোনো ত্রুটি বা সমস্যা পরিলক্ষিত হলে ৭ দিনের মধ্যে দ্রুততম সময়ে ফ্রি রিপ্লেসমেন্ট সুবিধা।
              </p>
            </div>
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-amber-600">
              ✓ কোনো লুকায়িত শর্ত বা অতিরিক্ত ফি নেই
            </div>
          </div>

          <!-- Benefit 7: Cash on Delivery Nationwide -->
          <div class="card-animated card-stagger-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div class="space-y-2.5">
              <div class="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center text-lg flex-shrink-0">
                💵
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">সারা দেশে ক্যাশ অন ডেলিভারি (COD)</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                কোনো অগ্রিম জামানত ছাড়াই পণ্য হাতে পেয়ে যাচাই করে সম্পূর্ণ মূল্য পরিশোধের ১০০% নিরাপদ ও নির্ভরযোগ্য ব্যবস্থা।
              </p>
            </div>
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-teal-600">
              ✓ ৬৪ জেলার সকল উপজেলা ও থানায় প্রযোজ্য
            </div>
          </div>

          <!-- Benefit 8: Cumilla Hub Express Dispatch -->
          <div class="card-animated card-stagger-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div class="space-y-2.5">
              <div class="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-lg flex-shrink-0">
                🚀
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">পদুয়ার বাজার হাব থেকে এক্সপ্রেস ডিসপ্যাচ</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                নিজস্ব ওয়্যারহাউস থেকে অর্ডার গ্রহণের সাথে সাথে মান পরীক্ষা ও প্যাকিং করে দ্রুততম কুরিয়ার নেটওয়ার্কে হস্তান্তর।
              </p>
            </div>
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-blue-600">
              ✓ Steadfast / Pathao লাইভ ট্র্যাকিং সহ
            </div>
          </div>

          <!-- Benefit 9: 24/7 Dedicated Customer Care & WhatsApp -->
          <div class="card-animated card-stagger-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div class="space-y-2.5">
              <div class="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center text-lg flex-shrink-0">
                💬
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">হোয়াটসঅ্যাপ ও সরাসরি হটলাইন সাপোর্ট</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                যেকোনো পণ্য বা অর্ডার সংক্রান্ত তথ্যে প্রতিদিন সকাল ৮:০০ থেকে রাত ১০:০০ টা পর্যন্ত লাইভ কাস্টমার কেয়ার সাপোর্ট।
              </p>
            </div>
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-rose-600">
              ✓ হটলাইন: 01581703822, 01818273838
            </div>
          </div>

          <!-- Benefit 10: Physical Outlet & Showroom Visit -->
          <div class="card-animated card-stagger-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div class="space-y-2.5">
              <div class="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-lg flex-shrink-0">
                🏢
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">সরাসরি শোরুম ভিজিট করে কেনার সুযোগ</h3>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                অনলাইনের পাশাপাশি আমাদের অফিশিয়াল শোরুমে এসে নিজে দেখে পণ্য পরীক্ষা করে সরাসরি ক্রয়ের সুবর্ণ সুযোগ।
              </p>
            </div>
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-purple-600">
              ✓ চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড, কুমিল্লা
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom Interactive Call to Action Banner -->
      <div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-7 sm:p-9 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="space-y-2 text-center sm:text-left">
          <h3 class="text-xl sm:text-2xl font-black">
            পছন্দের পণ্যটি আজই অর্ডার করুন এবং সকল সুবিধা উপভোগ করুন!
          </h3>
          <p class="text-xs sm:text-sm text-emerald-100 max-w-xl">
            স্মার্টওয়াচ, অর্গানিক হেলথ ফুড, ট্যাকটিক্যাল লাইট কিংবা কিচেন সেফটি এক্সেসরিজ — সেরা মূল্যে ১০০% জেনুইন পণ্য পেতে ড্রিম কার্ট বিডি-র সাথেই থাকুন।
          </p>
        </div>

        <div class="flex items-center gap-3 flex-shrink-0">
          <a 
            href="/products" 
            class="btn-secondary bg-white text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold py-3 px-6 shadow-md rounded-xl transition"
          >
            <span>🛍️</span> শপ ব্রাউজ করুন →
          </a>
          <a 
            href="/chat" 
            class="btn-secondary bg-emerald-800/80 text-white hover:bg-emerald-800 text-xs sm:text-sm font-bold py-3 px-5 border border-emerald-400/40 rounded-xl transition"
          >
            <span>💬</span> লাইভ চ্যাট
          </a>
        </div>
      </div>

    </div>
  `;
}
