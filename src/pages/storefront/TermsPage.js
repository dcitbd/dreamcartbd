/**
 * DREAM CART BD — TERMS & PRIVACY PAGES (TermsPage.js)
 * Implements user requirements:
 * - 100% Pure Bengali (বাংলা)
 * - Concise, beautifully structured card layout with all 34 clauses
 * - High-contrast palette for Light & Dark modes
 * - Smooth entrance and interactive hover animations
 * - Live keyword search filter and quick-jump navigation
 * - Preserves both router exports: renderTermsPage & renderPrivacyPage
 */

export function renderTermsPage() {
  return `
    <!-- Scoped Styles for Modern Concise Terms Page -->
    <style id="terms-page-custom-styles">
      .tc-wrapper {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      }
      
      @keyframes tcSlideUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .tc-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 20px 22px;
        box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.04);
        transition: all 0.22s ease;
        animation: tcSlideUp 0.3s ease-out forwards;
      }
      .dark .tc-card {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.4);
      }
      .tc-card:hover {
        border-color: #10b981;
        box-shadow: 0 8px 22px -4px rgba(16, 185, 129, 0.14);
        transform: translateY(-2px);
      }

      /* Hero Header */
      .tc-hero {
        background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
        border: 1px solid #1e293b;
        border-radius: 20px;
        padding: 28px 24px;
        color: #ffffff;
        position: relative;
        overflow: hidden;
      }
      .tc-hero-glow {
        position: absolute;
        top: -40px;
        right: -40px;
        width: 180px;
        height: 180px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
        border-radius: 50%;
        filter: blur(35px);
        pointer-events: none;
      }

      /* Meta Chips */
      .tc-meta-chip {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 9px;
        padding: 5px 11px;
        font-size: 11px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #e2e8f0;
      }

      /* Quick Navigation Pills */
      .tc-nav-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
        background: #f1f5f9;
        color: #334155;
        border: 1px solid #e2e8f0;
        text-decoration: none;
        transition: all 0.16s ease;
        cursor: pointer;
        white-space: nowrap;
      }
      .dark .tc-nav-pill {
        background: #1e293b;
        color: #cbd5e1;
        border-color: #334155;
      }
      .tc-nav-pill:hover {
        background: #10b981;
        color: #ffffff;
        border-color: #10b981;
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
      }

      /* Card Group Header */
      .tc-group-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
        padding-bottom: 10px;
        border-bottom: 1px solid #f1f5f9;
      }
      .dark .tc-group-header {
        border-bottom-color: #1e293b;
      }
      .tc-group-icon {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.25);
        color: #059669;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }
      .dark .tc-group-icon {
        color: #34d399;
        background: rgba(16, 185, 129, 0.18);
        border-color: rgba(16, 185, 129, 0.35);
      }
      .tc-group-title {
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
      }
      .dark .tc-group-title {
        color: #ffffff;
      }

      /* Section Item & Badges */
      .tc-clause-item {
        margin-bottom: 16px;
        padding-bottom: 14px;
        border-bottom: 1px dashed #f1f5f9;
      }
      .dark .tc-clause-item {
        border-bottom-color: #1e293b;
      }
      .tc-clause-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      .tc-clause-title {
        font-size: 13.5px;
        font-weight: 800;
        color: #059669;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .dark .tc-clause-title {
        color: #34d399;
      }
      .tc-clause-num {
        display: inline-block;
        background: rgba(16, 185, 129, 0.15);
        color: #059669;
        font-size: 11px;
        font-weight: 900;
        padding: 1px 7px;
        border-radius: 6px;
      }
      .dark .tc-clause-num {
        background: rgba(16, 185, 129, 0.22);
        color: #34d399;
      }

      /* Typography */
      .tc-text {
        font-size: 12.5px;
        line-height: 1.65;
        color: #334155;
        margin-bottom: 6px;
      }
      .dark .tc-text {
        color: #cbd5e1;
      }
      .tc-text:last-child {
        margin-bottom: 0;
      }

      /* Custom Lists */
      .tc-list {
        list-style: none;
        padding-left: 0;
        margin: 6px 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .tc-list li {
        position: relative;
        padding-left: 18px;
        font-size: 12px;
        line-height: 1.55;
        color: #334155;
      }
      .dark .tc-list li {
        color: #cbd5e1;
      }
      .tc-list li::before {
        content: '✓';
        position: absolute;
        left: 0;
        top: 1px;
        color: #10b981;
        font-weight: 900;
        font-size: 11px;
      }

      /* Compact Definition Grid */
      .tc-def-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 8px;
        margin: 8px 0;
      }
      @media (min-width: 640px) {
        .tc-def-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      .tc-def-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 9px;
        padding: 9px 12px;
      }
      .dark .tc-def-box {
        background: rgba(15, 23, 42, 0.6);
        border-color: #1e293b;
      }
      .tc-def-term {
        font-size: 11.5px;
        font-weight: 800;
        color: #059669;
        margin-bottom: 2px;
      }
      .dark .tc-def-term {
        color: #34d399;
      }
      .tc-def-desc {
        font-size: 11px;
        line-height: 1.45;
        color: #475569;
      }
      .dark .tc-def-desc {
        color: #94a3b8;
      }

      /* Alert Box */
      .tc-alert {
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: 10px;
        padding: 10px 14px;
        margin: 8px 0;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 11.5px;
        line-height: 1.5;
        color: #047857;
      }
      .dark .tc-alert {
        background: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.35);
        color: #6ee7b7;
      }

      /* Links */
      .tc-link {
        color: #059669;
        font-weight: 700;
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: color 0.15s ease;
      }
      .dark .tc-link {
        color: #34d399;
      }
      .tc-link:hover {
        color: #10b981;
      }
    </style>

    <div class="tc-wrapper max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-4">

      <!-- 1. Hero Header Card -->
      <div class="tc-hero">
        <div class="tc-hero-glow"></div>
        <div class="relative z-10">
          
          <div class="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-2.5">
            <span>🛡️</span>
            <span>অফিসিয়াল নীতিমালা ও চুক্তিপত্র</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
            শর্তাবলী ও নিয়মনীতি (Terms & Conditions)
          </h1>
          
          <p class="text-slate-300 text-xs sm:text-sm font-medium mb-3.5 max-w-2xl leading-relaxed">
            ড্রিম কার্ট বিডি — স্মার্ট ডিজিটাল কমার্স ও মাল্টি-ভেন্ডার প্ল্যাটফর্মের সকল সেবা ব্যবহারের সাধারণ নিয়মাবলী ও আইনি নীতিমালা।
          </p>

          <!-- Metadata Chips Grid -->
          <div class="flex flex-wrap gap-2">
            <div class="tc-meta-chip">
              <span>🌐</span>
              <span><strong>ওয়েবসাইট:</strong> https://dreamcartbd.com/</span>
            </div>
            <div class="tc-meta-chip">
              <span>🏢</span>
              <span><strong>প্রতিষ্ঠান:</strong> ড্রিম কার্ট বিডি</span>
            </div>
            <div class="tc-meta-chip">
              <span>📅</span>
              <span><strong>কার্যকর তারিখ:</strong> ১১ অক্টোবর ২০২৬</span>
            </div>
            <div class="tc-meta-chip">
              <span>🔄</span>
              <span><strong>সর্বশেষ আপডেট:</strong> ১১ অক্টোবর ২০২৬</span>
            </div>
            <div class="tc-meta-chip">
              <span>⚖️</span>
              <span><strong>আইন:</strong> বাংলাদেশ ভোক্তা অধিকার ও ডিজিটাল কমার্স আইন</span>
            </div>
          </div>

        </div>
      </div>

      <!-- 2. Interactive Search & Quick Jump Navigator -->
      <div class="tc-card p-3.5 sm:p-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-2.5">
          <div class="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 w-full sm:w-auto">
            <span>🧭</span>
            <span>দ্রুত খুঁজে নিন (সার্চ ও নেভিগেশন):</span>
          </div>
          <div class="w-full sm:w-64">
            <input 
              type="text" 
              id="tc-search-input" 
              placeholder="🔍 ধারা বা বিষয় খুঁজুন (যেমন: রিফান্ড, ডেলিভারি)..." 
              class="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              oninput="(function(e){
                var term = e.target.value.toLowerCase().trim();
                var cards = document.querySelectorAll('.tc-section-group');
                cards.forEach(function(card){
                  if(!term || card.innerText.toLowerCase().includes(term)) {
                    card.style.display = 'block';
                  } else {
                    card.style.display = 'none';
                  }
                });
              })(event)"
            />
          </div>
        </div>

        <!-- Quick Jump Pills -->
        <div class="flex flex-wrap gap-1.5 overflow-x-auto pb-0.5">
          <a onclick="document.getElementById('grp-1')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">১-৪. ভূমিকা ও একাউন্ট</a>
          <a onclick="document.getElementById('grp-2')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">৫-৭. পণ্য, স্টক ও মূল্য</a>
          <a onclick="document.getElementById('grp-3')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">৮-৯. অর্ডার ও বাতিল</a>
          <a onclick="document.getElementById('grp-4')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">১০. পেমেন্ট ব্যবস্থা</a>
          <a onclick="document.getElementById('grp-5')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">১১. শিপিং ও ডেলিভারি</a>
          <a onclick="document.getElementById('grp-6')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">১২-১৩. রিটার্ন ও রিফান্ড</a>
          <a onclick="document.getElementById('grp-7')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">১৪-১৫. ওয়ারেন্টি ও প্রি-অর্ডার</a>
          <a onclick="document.getElementById('grp-8')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">১৬-১৭. ভেন্ডর ও পাইকারি</a>
          <a onclick="document.getElementById('grp-9')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">১৮-২২. ডেটা সুরক্ষা ও নিয়ম</a>
          <a onclick="document.getElementById('grp-10')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">২৩-৩৩. আইন ও বিরোধ নিষ্পত্তি</a>
          <a onclick="document.getElementById('grp-11')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">৩৪. যোগাযোগ</a>
        </div>
      </div>

      <!-- 3. Thematic Card Groups -->

      <!-- Group 1: ভূমিকা, সংজ্ঞা, যোগ্যতা ও অ্যাকাউন্ট (১-৪) -->
      <div class="tc-card tc-section-group" id="grp-1">
        <div class="tc-group-header">
          <div class="tc-group-icon">🏛️</div>
          <h2 class="tc-group-title">১ - ৪. সাধারণ পরিচিতি, সংজ্ঞা ও যোগ্যতা</h2>
        </div>

        <!-- ১. ভূমিকা -->
        <div class="tc-clause-item" id="sec-1">
          <div class="tc-clause-title"><span class="tc-clause-num">১</span> ভূমিকা (Introduction)</div>
          <p class="tc-text">
            ড্রিম কার্ট বিডি-তে স্বাগতম। এই শর্তাবলী আমাদের ওয়েবসাইট, অনলাইন কেনাকাটা, পেমেন্ট ও ডেলিভারি সেবা ব্যবহারের ক্ষেত্রে প্রযোজ্য। সাইট ব্যবহার বা অর্ডার করার মাধ্যমে আপনি এই নীতিমালা এবং প্রযোজ্য ভোক্তা অধিকার ও ডিজিটাল কমার্স নির্দেশিকা মেনে নিতে সম্মত হচ্ছেন।
          </p>
        </div>

        <!-- ২. সংজ্ঞা -->
        <div class="tc-clause-item" id="sec-2">
          <div class="tc-clause-title"><span class="tc-clause-num">২</span> সংজ্ঞা ও পরিভাষা (Definitions)</div>
          <div class="tc-def-grid">
            <div class="tc-def-box">
              <div class="tc-def-term">🏢 ড্রিম কার্ট বিডি:</div>
              <div class="tc-def-desc">প্ল্যাটফর্ম পরিচালনাকারী ব্যবসায়িক প্রতিষ্ঠান।</div>
            </div>
            <div class="tc-def-box">
              <div class="tc-def-term">🛍️ পণ্য ও অর্ডার:</div>
              <div class="tc-def-desc">বিক্রয়ের জন্য তালিকাভুক্ত দ্রব্য এবং ক্রয়ের অনুরোধ।</div>
            </div>
            <div class="tc-def-box">
              <div class="tc-def-term">🏪 ভেন্ডর ও বিক্রেতা:</div>
              <div class="tc-def-desc">পণ্য বিক্রির জন্য অনুমোদিত অংশীদার।</div>
            </div>
            <div class="tc-def-box">
              <div class="tc-def-term">💼 পাইকারি ও রিসেলার:</div>
              <div class="tc-def-desc">বাল্ক বা বিশেষ মার্জিনে পণ্য ক্রয়ে অনুমোদিত ব্যক্তি/প্রতিষ্ঠান।</div>
            </div>
          </div>
        </div>

        <!-- ৩. যোগ্যতা -->
        <div class="tc-clause-item" id="sec-3">
          <div class="tc-clause-title"><span class="tc-clause-num">৩</span> ব্যবহারের যোগ্যতা (Eligibility)</div>
          <ul class="tc-list">
            <li>আইন অনুযায়ী চুক্তি সম্পাদনে সক্ষম হতে হবে (নাবালকদের ক্ষেত্রে অভিভাবকের সম্মতি প্রযোজ্য)।</li>
            <li>শুধুমাত্র সঠিক, হালনাগাদ ও আইনসম্মত তথ্য প্রদান করে কেনাকাটা করতে হবে।</li>
            <li>ভুয়া তথ্য, অন্যের পরিচয় কিংবা প্রতারণামূলক পেমেন্ট ব্যবহার সম্পূর্ণ নিষিদ্ধ।</li>
          </ul>
        </div>

        <!-- ৪. একাউন্ট -->
        <div class="tc-clause-item" id="sec-4">
          <div class="tc-clause-title"><span class="tc-clause-num">৪</span> অ্যাকাউন্ট ও নিরাপত্তা (Account Security)</div>
          <p class="tc-text">
            গ্রাহক নিজ লগইন তথ্য ও পাসওয়ার্ডের গোপনীয়তার জন্য দায়ী। সন্দেহজনক কার্যকলাপ দেখলে অবিলম্বে আমাদের অবহিত করুন। প্রতারণা বা নিরাপত্তা ঝুঁকির ক্ষেত্রে অ্যাকাউন্ট সাময়িক স্থগিত হতে পারে।
          </p>
        </div>
      </div>

      <!-- Group 2: পণ্য বিবরণ, প্রাপ্যতা, মূল্য ও অফার (৫-৭) -->
      <div class="tc-card tc-section-group" id="grp-2">
        <div class="tc-group-header">
          <div class="tc-group-icon">🛍️</div>
          <h2 class="tc-group-title">৫ - ৭. পণ্যের বিবরণ, স্টক ও মূল্য নির্ধারণ</h2>
        </div>

        <!-- ৫. পণ্য বিবরণ -->
        <div class="tc-clause-item" id="sec-5">
          <div class="tc-clause-title"><span class="tc-clause-num">৫</span> পণ্যের বিবরণ ও প্রদর্শিত তথ্য (Product Listings)</div>
          <p class="tc-text">
            আমরা পণ্যের সঠিক স্পেসিফিকেশন, ছবি, সাইজ, রঙ ও দাম প্রদর্শনের সর্বোচ্চ চেষ্টা করি। ফটোগ্রাফির আলো বা ডিসপ্লে পার্থক্যের কারণে আসল পণ্যের রঙে সামান্য তারতম্য হতে পারে।
          </p>
        </div>

        <!-- ৬. স্টক -->
        <div class="tc-clause-item" id="sec-6">
          <div class="tc-clause-title"><span class="tc-clause-num">৬</span> পণ্যের প্রাপ্যতা ও স্টক (Product Availability)</div>
          <p class="tc-text">
            সকল পণ্য স্টক থাকা সাপেক্ষে বিক্রয়যোগ্য। অপ্রত্যাশিত কারণে পণ্য স্টক-আউট হলে গ্রাহককে জানিয়ে বিকল্প পণ্য নেওয়া বা ১০০% অর্থ ফেরতের ব্যবস্থা করা হবে।
          </p>
        </div>

        <!-- ৭. মূল্য ও অফার -->
        <div class="tc-clause-item" id="sec-7">
          <div class="tc-clause-title"><span class="tc-clause-num">৭</span> মূল্য, ছাড় ও বিশেষ অফার (Prices & Discounts)</div>
          <ul class="tc-list">
            <li>সকল মূল্য বাংলাদেশি টাকায় (BDT) প্রদর্শিত হয়, যাতে পণ্যের দাম ও ডেলিভারি ফি অন্তর্ভুক্ত।</li>
            <li><strong>৭.১ অনলাইন পেমেন্ট ছাড়:</strong> বিকাশ, নগদ বা ব্যাংকে ৫% ছাড় কেবল যোগ্য অর্ডারে স্বয়ংক্রিয়ভাবে কার্যকর হবে।</li>
            <li><strong>৭.২ অনিচ্ছাকৃত ভুল:</strong> কারিগরি ত্রুটিতে ভুল মূল্য দেখালে আলোচনা সাপেক্ষে ন্যায্য সমাধান করা হবে।</li>
          </ul>
        </div>
      </div>

      <!-- Group 3: অর্ডার প্রক্রিয়া ও বাতিলকরণ (৮-৯) -->
      <div class="tc-card tc-section-group" id="grp-3">
        <div class="tc-group-header">
          <div class="tc-group-icon">📦</div>
          <h2 class="tc-group-title">৮ - ৯. অর্ডার প্রদান ও বাতিলকরণ নীতিমালা</h2>
        </div>

        <!-- ৮. অর্ডার প্রক্রিয়া -->
        <div class="tc-clause-item" id="sec-8">
          <div class="tc-clause-title"><span class="tc-clause-num">৮</span> অর্ডার প্রদান ও নিশ্চিতকরণ (Order Placement)</div>
          <ul class="tc-list">
            <li>পণ্য ও ভ্যারিয়েন্ট বেছে নিয়ে কার্টে যোগ করুন।</li>
            <li>সঠিক ডেলিভারি ঠিকানা, সচল ফোন নম্বর ও পেমেন্ট মাধ্যম নির্বাচন করে অর্ডার সাবমিট করুন।</li>
            <li>ডেলিভারির পূর্বে ড্রিম কার্ট বিডি টিম কল বা হোয়াটসঅ্যাপে অর্ডার কনফার্ম করতে পারে।</li>
          </ul>
        </div>

        <!-- ৯. বাতিলকরণ -->
        <div class="tc-clause-item" id="sec-9">
          <div class="tc-clause-title"><span class="tc-clause-num">৯</span> অর্ডার বাতিলকরণ (Order Cancellation)</div>
          <p class="tc-text">
            কুরিয়ারে হস্তান্তরের পূর্বে কাস্টমার সাপোর্টে যোগাযোগ করে বিনামূল্যে অর্ডার বাতিল করা সম্ভব। কুরিয়ারে বুকিং সম্পন্ন হলে সাধারণ ডেলিভারি নীতিমালার আওতাভুক্ত হবে। স্টক সংকট বা ভুয়া ঠিকানার ক্ষেত্রে কোম্পানি অর্ডার বাতিলের অধিকার রাখে।
          </p>
        </div>
      </div>

      <!-- Group 4: পেমেন্ট ও লেনদেন নিরাপত্তা (১০) -->
      <div class="tc-card tc-section-group" id="grp-4">
        <div class="tc-group-header">
          <div class="tc-group-icon">💳</div>
          <h2 class="tc-group-title">১০. পেমেন্ট ব্যবস্থা ও লেনদেন নিরাপত্তা</h2>
        </div>

        <div class="tc-clause-item" id="sec-10">
          <div class="tc-clause-title"><span class="tc-clause-num">১০</span> অনুমোদিত পেমেন্ট পদ্ধতি (Payment Methods)</div>
          <ul class="tc-list">
            <li><strong>ক্যাশ অন ডেলিভারি (COD):</strong> পণ্য হাতে পেয়ে ডেলিভারিম্যানের কাছে নগদ মূল্য পরিশোধ।</li>
            <li><strong>মোবাইল ব্যাংকিং (MFS):</strong> বিকাশ, নগদ ও রকেট অফিশিয়াল চ্যানেল।</li>
            <li><strong>কার্ড ও ব্যাংক:</strong> ভিসা/মাস্টারকার্ড ও নির্ধারিত ব্যাংক ট্রান্সফার (যেমন: IBBL)।</li>
          </ul>
          
          <div class="tc-alert">
            <span class="text-rose-500 font-black text-sm">⚠️</span>
            <div>
              <strong>কঠোর নিরাপত্তা সতর্কতা:</strong> ড্রিম কার্ট বিডি কখনো কোনো রিফান্ড বা সেবার জন্য আপনার পিন (PIN), পাসওয়ার্ড বা ওটিপি (OTP) চাইবে না। এগুলো কাউকে প্রদান করবেন না।
            </div>
          </div>
        </div>
      </div>

      <!-- Group 5: শিপিং ও ডেলিভারি পলিসি (১১) -->
      <div class="tc-card tc-section-group" id="grp-5">
        <div class="tc-group-header">
          <div class="tc-group-icon">🚚</div>
          <h2 class="tc-group-title">১১. শিপিং ও ডেলিভারি নীতিমালা</h2>
        </div>

        <div class="tc-clause-item" id="sec-11">
          <div class="tc-clause-title"><span class="tc-clause-num">১১</span> শিপিং চার্জ ও সময়সীমা (Shipping Policy)</div>
          <ul class="tc-list">
            <li><strong>ডেলিভারি চার্জ:</strong> সারাদেশে স্ট্যান্ডার্ড চার্জ ১৩০ টাকা (১ কেজির বেশি হলে প্রতি কেজিতে +২০ টাকা)।</li>
            <li><strong>ফ্রি ডেলিভারি অফার:</strong> ২০০০ টাকার বেশি অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</li>
            <li><strong>সময়সীমা:</strong> সাধারণত ১ থেকে ৩ কার্যদিবসের মধ্যে নির্ভরযোগ্য কুরিয়ারে সরবরাহ করা হয়।</li>
            <li><strong>পণ্য গ্রহণ ও যাচাই:</strong> পার্সেল গ্রহণের সময় বাইরে থেকে অক্ষত আছে কিনা দেখে নিন। সমস্যা থাকলে তৎক্ষণাৎ ছবি/ভিডিও তুলে সাপোর্ট টিমে জানান।</li>
          </ul>
        </div>
      </div>

      <!-- Group 6: রিটার্ন, এক্সচেঞ্জ ও রিফান্ড পলিসি (১২-১৩) -->
      <div class="tc-card tc-section-group" id="grp-6">
        <div class="tc-group-header">
          <div class="tc-group-icon">🔄</div>
          <h2 class="tc-group-title">১২ - ১৩. পণ্য ফেরত ও রিফান্ড পলিসি</h2>
        </div>

        <!-- ১২. রিটার্ন -->
        <div class="tc-clause-item" id="sec-12">
          <div class="tc-clause-title"><span class="tc-clause-num">১২</span> রিটার্ন ও এক্সচেঞ্জ (Return & Exchange)</div>
          <p class="tc-text">ভুল পণ্য, ভাঙা বা ত্রুটিপূর্ণ পণ্য অথবা বিবরণের সাথে গুরুতর অমিল থাকলে মূল মোড়ক ও আনুষঙ্গিক যন্ত্রাংশ সহ রিটার্ন গ্রহণযোগ্য। হাইজিন বা ব্যবহৃত সিল খোলা পণ্যে রিটার্ন সীমাবদ্ধ হতে পারে।</p>
        </div>

        <!-- ১৩. রিফান্ড -->
        <div class="tc-clause-item" id="sec-13">
          <div class="tc-clause-title"><span class="tc-clause-num">১৩</span> রিফান্ড পলিসি (Refund Policy)</div>
          <p class="tc-text">
            অনুমোদিত রিটার্ন বা অর্ডার বাতিলের ক্ষেত্রে ৩ থেকে ৭ কার্যদিবসের মধ্যে যে মাধ্যমে অর্থ পরিশোধ করা হয়েছিল (বিকাশ/নগদ/কার্ড/ব্যাংক), সেখানেই রিফান্ড করা হবে। প্ল্যাটফর্মের ত্রুটির কারণে রিটার্ন হলে ডেলিভারি চার্জসহ সম্পূর্ণ টাকা ফেরত দেওয়া হবে।
          </p>
        </div>
      </div>

      <!-- Group 7: ওয়ারেন্টি ও প্রি-অর্ডার (১৪-১৫) -->
      <div class="tc-card tc-section-group" id="grp-7">
        <div class="tc-group-header">
          <div class="tc-group-icon">🛡️</div>
          <h2 class="tc-group-title">১৪ - ১৫. পণ্যের ওয়ারেন্টি ও প্রি-অর্ডার ব্যবস্থা</h2>
        </div>

        <!-- ১৪. ওয়ারেন্টি -->
        <div class="tc-clause-item" id="sec-14">
          <div class="tc-clause-title"><span class="tc-clause-num">১৪</span> ওয়ারেন্টি ও সার্ভিস (Warranty Service)</div>
          <p class="tc-text">
            প্রস্তুতকারক বা প্ল্যাটফর্ম ঘোষিত নির্দিষ্ট মেয়াদে ওয়ারেন্টি প্রযোজ্য। পানির ক্ষতি, পুড়িয়ে ফেলা বা অসতর্কতায় ভাঙার ক্ষেত্রে ওয়ারেন্টি বাতিল হবে। গ্রাহককে ইনভয়েস সংরক্ষণ করতে হবে।
          </p>
        </div>

        <!-- ১৫. প্রি-অর্ডার -->
        <div class="tc-clause-item" id="sec-15">
          <div class="tc-clause-title"><span class="tc-clause-num">১৫</span> প্রি-অর্ডার পণ্য (Pre-Order Policy)</div>
          <p class="tc-text">
            প্রি-অর্ডার পণ্যের সম্ভাব্য সরবরাহ তারিখ পেজে দেওয়া থাকে। কোনো কারণে সংগ্রহে ব্যর্থ হলে গ্রাহকের অগ্রিম অর্থ অবিলম্বে ১০০% ফেরত দেওয়া হবে।
          </p>
        </div>
      </div>

      <!-- Group 8: ভেন্ডর ও পাইকারি/রিসেলার (১৬-১৭) -->
      <div class="tc-card tc-section-group" id="grp-8">
        <div class="tc-group-header">
          <div class="tc-group-icon">🏪</div>
          <h2 class="tc-group-title">১৬ - ১৭. ভেন্ডর, পাইকারি ও রিসেলার নীতিমালা</h2>
        </div>

        <!-- ১৬. ভেন্ডর -->
        <div class="tc-clause-item" id="sec-16">
          <div class="tc-clause-title"><span class="tc-clause-num">১৬</span> মার্কেটপ্লেস ও ভেন্ডর শর্ত (Vendor Terms)</div>
          <p class="tc-text">
            প্ল্যাটফর্মের সকল বিক্রেতাকে ১০০% আসল পণ্য সরবরাহ ও সঠিক স্টক তথ্য দিতে হবে। নকল পণ্য বিক্রি বা প্রতারণা করলে ভেন্ডর অ্যাকাউন্ট অবিলম্বে বাতিল করা হবে।
          </p>
        </div>

        <!-- ১৭. পাইকারি ও রিসেলার -->
        <div class="tc-clause-item" id="sec-17">
          <div class="tc-clause-title"><span class="tc-clause-num">১৭</span> পাইকারি ও রিসেলার শর্ত (Wholesale & Reseller)</div>
          <p class="tc-text">
            রিসেলার ও পাইকারি ক্রেতাদের জন্য বিশেষ রেট ও ন্যূনতম অর্ডারের পরিমাণ (MOQ) প্রযোজ্য। গ্রাহকের কাছে সঠিক পণ্যের বিবরণ ও মূল্য প্রদানে রিসেলারগণ দায়বদ্ধ থাকবেন।
          </p>
        </div>
      </div>

      <!-- Group 9: আচরণ, ডেটা ও মেধাস্বত্ব (১৮-২২) -->
      <div class="tc-card tc-section-group" id="grp-9">
        <div class="tc-group-header">
          <div class="tc-group-icon">⚖️</div>
          <h2 class="tc-group-title">১৮ - ২২. নিষিদ্ধ কার্যক্রম, গোপনীয়তা ও মেধাস্বত্ব</h2>
        </div>

        <div class="tc-clause-item" id="sec-18">
          <div class="tc-clause-title"><span class="tc-clause-num">১৮-১৯</span> নিষিদ্ধ আচরণ ও রিভিউ (Prohibitions & Reviews)</div>
          <p class="tc-text">প্রতারণা, নকল পণ্য বিক্রয়, ম্যালওয়্যার ছড়ানো, সিস্টেমে অননুমোদিত প্রবেশ ও ভুয়া রিভিউ দেওয়া সম্পূর্ণ নিষিদ্ধ ও আইনত দণ্ডনীয়।</p>
        </div>

        <div class="tc-clause-item" id="sec-20">
          <div class="tc-clause-title"><span class="tc-clause-num">২০-২২</span> গোপনীয়তা, কুকিজ ও কপিরাইট (Privacy & IP)</div>
          <p class="tc-text">
            গ্রাহকের ব্যক্তিগত তথ্য সুরক্ষিত রাখা হয় এবং বাণিজ্যিক উদ্দেশ্যে তৃতীয় পক্ষের কাছে বিক্রয় করা হয় না। ড্রিম কার্ট বিডির লোগো, কনটেন্ট ও ওয়েবসাইট ডিজাইন কপিরাইট আইন দ্বারা সংরক্ষিত।
          </p>
        </div>
      </div>

      <!-- Group 10: আইনি দায়বদ্ধতা, ফোর্স মেজার ও বিরোধ নিষ্পত্তি (২৩-৩৩) -->
      <div class="tc-card tc-section-group" id="grp-10">
        <div class="tc-group-header">
          <div class="tc-group-icon">📜</div>
          <h2 class="tc-group-title">২৩ - ৩৩. আইনি দায়বদ্ধতা ও বিরোধ নিষ্পত্তি</h2>
        </div>

        <div class="tc-clause-item" id="sec-23">
          <div class="tc-clause-title"><span class="tc-clause-num">২৩-২৮</span> সাইট প্রাপ্যতা, ক্ষতিপূরণ ও পরিবর্তন (Liability & Changes)</div>
          <p class="tc-text">সার্ভার রক্ষণাবেক্ষণ বা নেটওয়ার্ক সমস্যায় সাময়িক বিভ্রাট ঘটতে পারে। অনিচ্ছাকৃত প্রাকৃতিক দুর্যোগ বা অনিবার্য পরিস্থিতিতে (Force Majeure) বিলম্ব ঘটলে গ্রাহককে অবহিত করা হবে।</p>
        </div>

        <div class="tc-clause-item" id="sec-29">
          <div class="tc-clause-title"><span class="tc-clause-num">২৯-৩৩</span> অভিযোগ নিষ্পত্তি ও প্রচলিত আইন (Governing Law)</div>
          <p class="tc-text">
            যেকোনো অভিযোগের ক্ষেত্রে আপনার <strong>অর্ডার নম্বর</strong> ও প্রমাণ সহ কাস্টমার কেয়ারে যোগাযোগ করুন। এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের আইন অনুযায়ী পরিচালিত ও ব্যাখ্যা করা হবে।
          </p>
        </div>
      </div>

      <!-- Group 11: অফিসিয়াল যোগাযোগ ও চূড়ান্ত ঘোষণা (৩৪) -->
      <div class="tc-card tc-section-group" id="grp-11">
        <div class="tc-group-header">
          <div class="tc-group-icon">📞</div>
          <h2 class="tc-group-title">৩৪. যোগাযোগের মাধ্যম ও কাস্টমার কেয়ার</h2>
        </div>

        <div class="tc-clause-item" id="sec-34">
          <p class="tc-text mb-3">যেকোনো তথ্য, অর্ডার সংক্রান্ত সহায়তা বা প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:</p>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div class="tc-def-box">
              <div class="tc-def-term">📞 হটলাইন ও হোয়াটসঅ্যাপ:</div>
              <div class="tc-def-desc">
                <a href="tel:01581703822" class="tc-link font-bold">01581703822</a>, 
                <a href="tel:01818273838" class="tc-link font-bold">01818273838</a>
              </div>
            </div>

            <div class="tc-def-box">
              <div class="tc-def-term">✉️ অফিসিয়াল ইমেইল:</div>
              <div class="tc-def-desc">
                <a href="mailto:dreamcartbd.store@gmail.com" class="tc-link">dreamcartbd.store@gmail.com</a>
              </div>
            </div>

            <div class="tc-def-box sm:col-span-2">
              <div class="tc-def-term">📍 অফিসের ঠিকানা:</div>
              <div class="tc-def-desc">
                চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।
              </div>
            </div>
          </div>
        </div>

        <!-- চূড়ান্ত ঘোষণা -->
        <div class="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <div class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            ড্রিম কার্ট বিডি ব্যবহার করে অর্ডার সম্পন্ন করার মাধ্যমে আপনি এই শর্তাবলীতে পূর্ণ সম্মতি প্রকাশ করছেন।
          </div>
          <div class="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">
            ✨ ড্রিম কার্ট বিডি — আপনার বিশ্বস্ত ডিজিটাল কমার্স পার্টনার
          </div>
        </div>
      </div>

    </div>
  `;
}

export function renderPrivacyPage() {
  return `
    <!-- Scoped Styles for Privacy Policy Page -->
    <style id="privacy-page-custom-styles">
      .pp-wrapper {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      }
      .pp-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 26px 30px;
        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.04);
      }
      .dark .pp-card {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
      }
    </style>

    <div class="pp-wrapper max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
      
      <!-- Privacy Hero -->
      <div class="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white">
        <div class="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
          🔒 ডেটা নিরাপত্তা ও গোপনীয়তা
        </div>
        <h1 class="text-2xl sm:text-3xl font-black mb-2">গোপনীয়তা নীতিমালা (Privacy Policy)</h1>
        <p class="text-slate-300 text-xs sm:text-sm">ড্রিম কার্ট বিডি — আপনার তথ্যের সর্বোচ্চ নিরাপত্তা বজায় রাখতে প্রতিশ্রুতিবদ্ধ।</p>
      </div>

      <!-- Privacy Body Card -->
      <div class="pp-card text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
        <p><strong>১. তথ্য সংগ্রহ ও ব্যবহার:</strong> গ্রাহকের নাম, মোবাইল নম্বর ও ডেলিভারি ঠিকানা শুধুমাত্র পণ্য সরবরাহ, অর্ডার নিশ্চিতকরণ ও কাস্টমার সার্ভিসের প্রয়োজনে সংগ্রহ করা হয়।</p>
        <p><strong>২. ডেটা নিরাপত্তা:</strong> গ্রাহকের ব্যক্তিগত ও আর্থিক তথ্য অত্যন্ত বিশ্বস্তভাবে এনক্রিপ্ট করে সংরক্ষণ করা হয়। কোনো প্রকার বাণিজ্যিক লাভের জন্য তৃতীয় পক্ষের কাছে তথ্য বিক্রয় বা বিনিময় করা হয় না।</p>
        <p><strong>৩. কুকিজ পলিসি:</strong> ওয়েবসাইটের কার্যকারিতা ও শপিং কার্ট সেশন সক্রিয় রাখার জন্য প্রয়োজনীয় ব্রাউজার কুকিজ ব্যবহৃত হয়।</p>
        <p><strong>৪. যোগাযোগ:</strong> গোপনীয়তা সংক্রান্ত যেকোনো জিজ্ঞাসায় ইমেইল করুন: <a href="mailto:dreamcartbd.store@gmail.com" class="text-emerald-500 font-bold hover:underline">dreamcartbd.store@gmail.com</a></p>
      </div>

    </div>
  `;
}
