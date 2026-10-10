/**
 * DREAM CART BD — PRIVACY POLICY PAGE (PrivacyPage.js)
 * Implements:
 * - 100% Pure Bengali (বাংলা) Privacy Policy
 * - Complete 16 clauses & sub-clauses from official guidelines
 * - Card-based modern layout with entrance and hover animations
 * - High-contrast palette for Light & Dark modes
 * - Interactive live search filter & quick-jump navigation
 * - Direct contact triggers (Click-to-call, WhatsApp, Click-to-email)
 */

export function renderPrivacyPage() {
  return `
    <!-- Scoped Styles for Modern High-Contrast Privacy Policy Page -->
    <style id="privacy-page-custom-styles">
      .pp-wrapper {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      }
      
      @keyframes ppSlideUp {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes ppPulseGlow {
        0%, 100% { opacity: 0.25; transform: scale(1); }
        50% { opacity: 0.45; transform: scale(1.05); }
      }

      .pp-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 22px 24px;
        box-shadow: 0 4px 14px -2px rgba(0, 0, 0, 0.04);
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        animation: ppSlideUp 0.35s ease-out forwards;
      }
      .dark .pp-card {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.45);
      }
      .pp-card:hover {
        border-color: #10b981;
        box-shadow: 0 10px 25px -4px rgba(16, 185, 129, 0.14);
        transform: translateY(-2px);
      }

      /* Hero Header */
      .pp-hero {
        background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
        border: 1px solid #1e293b;
        border-radius: 24px;
        padding: 30px 26px;
        color: #ffffff;
        position: relative;
        overflow: hidden;
      }
      .pp-hero-glow {
        position: absolute;
        top: -50px;
        right: -50px;
        width: 220px;
        height: 220px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        filter: blur(40px);
        pointer-events: none;
        animation: ppPulseGlow 6s ease-in-out infinite;
      }

      /* Meta Chips */
      .pp-meta-chip {
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 10px;
        padding: 6px 12px;
        font-size: 11.5px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #f1f5f9;
        font-weight: 500;
      }

      /* Quick Navigation Pills */
      .pp-nav-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 13px;
        border-radius: 9999px;
        font-size: 11.5px;
        font-weight: 700;
        background: #f1f5f9;
        color: #334155;
        border: 1px solid #e2e8f0;
        text-decoration: none;
        transition: all 0.18s ease;
        cursor: pointer;
        white-space: nowrap;
      }
      .dark .pp-nav-pill {
        background: #1e293b;
        color: #cbd5e1;
        border-color: #334155;
      }
      .pp-nav-pill:hover {
        background: #10b981;
        color: #ffffff;
        border-color: #10b981;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.28);
      }

      /* Card Group Header */
      .pp-group-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f1f5f9;
      }
      .dark .pp-group-header {
        border-bottom-color: #1e293b;
      }
      .pp-group-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.25);
        color: #059669;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }
      .dark .pp-group-icon {
        color: #34d399;
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(16, 185, 129, 0.35);
      }
      .pp-card:hover .pp-group-icon {
        transform: scale(1.08);
      }
      .pp-group-title {
        font-size: 16.5px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
      }
      .dark .pp-group-title {
        color: #ffffff;
      }

      /* Clause Item & Section Hierarchy */
      .pp-clause-item {
        margin-bottom: 18px;
        padding-bottom: 16px;
        border-bottom: 1px dashed #f1f5f9;
      }
      .dark .pp-clause-item {
        border-bottom-color: #1e293b;
      }
      .pp-clause-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      .pp-clause-title {
        font-size: 14px;
        font-weight: 800;
        color: #059669;
        margin-bottom: 7px;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .dark .pp-clause-title {
        color: #34d399;
      }
      .pp-clause-num {
        display: inline-block;
        background: rgba(16, 185, 129, 0.15);
        color: #059669;
        font-size: 11px;
        font-weight: 900;
        padding: 2px 8px;
        border-radius: 6px;
      }
      .dark .pp-clause-num {
        background: rgba(16, 185, 129, 0.24);
        color: #34d399;
      }

      /* Typography & High-Contrast Colors */
      .pp-text {
        font-size: 13px;
        line-height: 1.7;
        color: #334155;
        margin-bottom: 8px;
      }
      .dark .pp-text {
        color: #cbd5e1;
      }
      .pp-text:last-child {
        margin-bottom: 0;
      }

      /* Custom Lists */
      .pp-list {
        list-style: none;
        padding-left: 0;
        margin: 8px 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .pp-list li {
        position: relative;
        padding-left: 20px;
        font-size: 12.5px;
        line-height: 1.6;
        color: #334155;
      }
      .dark .pp-list li {
        color: #cbd5e1;
      }
      .pp-list li::before {
        content: '✓';
        position: absolute;
        left: 0;
        top: 1px;
        color: #10b981;
        font-weight: 900;
        font-size: 12px;
      }

      /* Numbered Custom Lists */
      .pp-num-list {
        list-style: none;
        padding-left: 0;
        margin: 8px 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .pp-num-list li {
        position: relative;
        padding-left: 30px;
        font-size: 12.5px;
        line-height: 1.6;
        color: #334155;
      }
      .dark .pp-num-list li {
        color: #cbd5e1;
      }
      .pp-num-badge {
        position: absolute;
        left: 0;
        top: 2px;
        width: 22px;
        height: 22px;
        border-radius: 6px;
        background: rgba(16, 185, 129, 0.15);
        color: #059669;
        font-size: 11px;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .dark .pp-num-badge {
        background: rgba(16, 185, 129, 0.25);
        color: #34d399;
      }

      /* Sub-cards and Grid Boxes */
      .pp-sub-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 10px;
        margin: 10px 0;
      }
      @media (min-width: 640px) {
        .pp-sub-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      
      .pp-sub-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 14px;
        transition: all 0.2s ease;
      }
      .dark .pp-sub-box {
        background: rgba(15, 23, 42, 0.65);
        border-color: #1e293b;
      }
      .pp-sub-box:hover {
        border-color: #cbd5e1;
        transform: translateY(-1px);
      }
      .dark .pp-sub-box:hover {
        border-color: #334155;
      }
      .pp-sub-term {
        font-size: 12.5px;
        font-weight: 800;
        color: #059669;
        margin-bottom: 3px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .dark .pp-sub-term {
        color: #34d399;
      }
      .pp-sub-desc {
        font-size: 11.5px;
        line-height: 1.55;
        color: #475569;
      }
      .dark .pp-sub-desc {
        color: #94a3b8;
      }

      /* High-Contrast Alert Boxes */
      /* 1. Amber Warning Box (Sensitive Security, PIN, OTP) */
      .pp-alert-amber {
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 12px;
        padding: 12px 15px;
        margin: 10px 0;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 12px;
        line-height: 1.6;
        color: #92400e;
      }
      .dark .pp-alert-amber {
        background: rgba(245, 158, 11, 0.12);
        border-color: rgba(245, 158, 11, 0.35);
        color: #fde68a;
      }

      /* 2. Emerald Trust Box (No Sale, Strict Privacy) */
      .pp-alert-emerald {
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 12px;
        padding: 12px 15px;
        margin: 10px 0;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 12px;
        line-height: 1.6;
        color: #065f46;
      }
      .dark .pp-alert-emerald {
        background: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.35);
        color: #a7f3d0;
      }

      /* 3. Blue Tech Box (Cookies, Security Logs) */
      .pp-alert-blue {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 12px;
        padding: 12px 15px;
        margin: 10px 0;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 12px;
        line-height: 1.6;
        color: #1e40af;
      }
      .dark .pp-alert-blue {
        background: rgba(59, 130, 246, 0.12);
        border-color: rgba(59, 130, 246, 0.35);
        color: #bfdbfe;
      }

      /* Links */
      .pp-link {
        color: #059669;
        font-weight: 700;
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: color 0.15s ease;
      }
      .dark .pp-link {
        color: #34d399;
      }
      .pp-link:hover {
        color: #10b981;
      }

      /* Contact Action Card */
      .pp-contact-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.2s ease;
        text-decoration: none;
      }
      .dark .pp-contact-card {
        background: #1e293b;
        border-color: #334155;
      }
      .pp-contact-card:hover {
        border-color: #10b981;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px -2px rgba(16, 185, 129, 0.15);
      }
      .pp-contact-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 17px;
        flex-shrink: 0;
      }
      .dark .pp-contact-icon {
        color: #34d399;
        background: rgba(16, 185, 129, 0.22);
      }
    </style>

    <div class="pp-wrapper max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-4">

      <!-- 1. Hero Header Card -->
      <div class="pp-hero">
        <div class="pp-hero-glow"></div>
        <div class="relative z-10">
          
          <div class="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-2.5">
            <span>🛡️</span>
            <span>ডেটা নিরাপত্তা ও ব্যবহারকারীর গোপনীয়তার অধিকার</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1.5">
            গোপনীয়তা নীতি (Privacy Policy)
          </h1>
          
          <p class="text-slate-300 text-xs sm:text-sm font-medium mb-3.5 max-w-2xl leading-relaxed">
            Dream Cart BD — Smart Digital Commerce & Multi-Vendor Platform-এ আপনার তথ্যের সর্বোচ্চ নিরাপত্তা, স্বচ্ছতা ও সুরক্ষা নিশ্চিত করার বিশদ রূপরেখা।
          </p>

          <!-- Metadata Chips Grid -->
          <div class="flex flex-wrap gap-2">
            <div class="pp-meta-chip">
              <span>🌐</span>
              <span><strong>ওয়েবসাইট:</strong> https://dreamcartbd.com/</span>
            </div>
            <div class="pp-meta-chip">
              <span>🏢</span>
              <span><strong>প্রতিষ্ঠানের নাম:</strong> Dream Cart BD</span>
            </div>
            <div class="pp-meta-chip">
              <span>📅</span>
              <span><strong>কার্যকর হওয়ার তারিখ:</strong> ১১ অক্টোবর ২০২৬</span>
            </div>
            <div class="pp-meta-chip">
              <span>🔄</span>
              <span><strong>সর্বশেষ আপডেট:</strong> ১১ অক্টোবর ২০২৬</span>
            </div>
            <div class="pp-meta-chip">
              <span>⚖️</span>
              <span><strong>আইন:</strong> বাংলাদেশ ভোক্তা অধিকার ও ডিজিটাল কমার্স আইন</span>
            </div>
          </div>

        </div>
      </div>

      <!-- 2. Interactive Search & Quick Jump Navigator -->
      <div class="pp-card p-3.5 sm:p-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-2.5">
          <div class="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 w-full sm:w-auto">
            <span>🧭</span>
            <span>দ্রুত খুঁজে নিন (সার্চ ও নেভিগেশন):</span>
          </div>
          <div class="w-full sm:w-72">
            <input 
              type="text" 
              id="pp-search-input" 
              placeholder="🔍 ধারা বা বিষয় খুঁজুন (যেমন: কুকিজ, পেমেন্ট, অধিকার)..." 
              class="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition shadow-inner"
              oninput="(function(e){
                var term = e.target.value.toLowerCase().trim();
                var cards = document.querySelectorAll('.pp-section-group');
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
          <a onclick="document.getElementById('pp-grp-1')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">১. ভূমিকা</a>
          <a onclick="document.getElementById('pp-grp-2')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">২. তথ্য সংগ্রহ</a>
          <a onclick="document.getElementById('pp-grp-3')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">৩. তথ্যের ব্যবহার</a>
          <a onclick="document.getElementById('pp-grp-4')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">৪. তথ্য শেয়ারিং</a>
          <a onclick="document.getElementById('pp-grp-5')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">৫. প্রচারণা ও অফার</a>
          <a onclick="document.getElementById('pp-grp-6')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">৬. ডেটা নিরাপত্তা</a>
          <a onclick="document.getElementById('pp-grp-7')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">৭. সংরক্ষণের মেয়াদ</a>
          <a onclick="document.getElementById('pp-grp-8')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">৮. আপনার অধিকার</a>
          <a onclick="document.getElementById('pp-grp-9')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">৯-১২. বিশেষ নির্দেশিকা</a>
          <a onclick="document.getElementById('pp-grp-10')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">১৩-১৪. ব্রিচ ও পরিবর্তন</a>
          <a onclick="document.getElementById('pp-grp-11')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">১৫. যোগাযোগ</a>
          <a onclick="document.getElementById('pp-grp-12')?.scrollIntoView({behavior:'smooth'})" class="pp-nav-pill">১৬. প্রযোজ্য আইন</a>
        </div>
      </div>

      <!-- 3. Thematic Card Groups -->

      <!-- Group 1: ১. ভূমিকা -->
      <div class="pp-card pp-section-group" id="pp-grp-1">
        <div class="pp-group-header">
          <div class="pp-group-icon">🏛️</div>
          <h2 class="pp-group-title">১. ভূমিকা (Introduction)</h2>
        </div>

        <div class="pp-clause-item" id="pp-sec-1">
          <p class="pp-text">
            Dream Cart BD-তে আপনাকে স্বাগতম। আমাদের ওয়েবসাইট ব্যবহারকারী, গ্রাহক, বিক্রেতা, ভেন্ডর, রিসেলার এবং হোলসেলারদের ব্যক্তিগত তথ্যের গোপনীয়তা ও নিরাপত্তা রক্ষা করা আমাদের গুরুত্বপূর্ণ দায়িত্ব।
          </p>
          <p class="pp-text">
            এই গোপনীয়তা নীতিতে ব্যাখ্যা করা হয়েছে, আপনি আমাদের ওয়েবসাইট ব্যবহার করলে বা অর্ডার করলে আমরা কী ধরনের তথ্য সংগ্রহ করতে পারি, কেন সেই তথ্য ব্যবহার করি, কার সঙ্গে প্রয়োজন অনুযায়ী শেয়ার করতে পারি এবং কীভাবে তথ্যের নিরাপত্তা রক্ষার চেষ্টা করি।
          </p>
          <p class="pp-text">
            Dream Cart BD-এর ওয়েবসাইট ব্যবহার, অ্যাকাউন্ট তৈরি, অর্ডার প্রদান অথবা আমাদের সেবা গ্রহণের আগে অনুগ্রহ করে এই নীতিটি মনোযোগ দিয়ে পড়ুন।
          </p>
          <div class="pt-1">
            <span class="text-xs text-slate-500 dark:text-slate-400">অফিসিয়াল ওয়েবসাইট:</span> 
            <a href="https://dreamcartbd.com/" target="_blank" class="pp-link text-xs">https://dreamcartbd.com/</a>
          </div>
        </div>
      </div>

      <!-- Group 2: ২. আমরা কী ধরনের তথ্য সংগ্রহ করি -->
      <div class="pp-card pp-section-group" id="pp-grp-2">
        <div class="pp-group-header">
          <div class="pp-group-icon">📋</div>
          <h2 class="pp-group-title">২. আমরা কী ধরনের তথ্য সংগ্রহ করি</h2>
        </div>

        <p class="pp-text mb-3">
          আমাদের সেবা পরিচালনা, অর্ডার সম্পন্ন করা, পেমেন্ট যাচাই এবং গ্রাহকসেবা প্রদানের জন্য প্রয়োজন অনুযায়ী বিভিন্ন ধরনের তথ্য সংগ্রহ করা হতে পারে।
        </p>

        <!-- ২.১ ব্যক্তিগত তথ্য -->
        <div class="pp-clause-item" id="pp-sec-2-1">
          <div class="pp-clause-title"><span class="pp-clause-num">২.১</span> ব্যক্তিগত তথ্য (Personal Information)</div>
          <p class="pp-text">আপনি অ্যাকাউন্ট তৈরি বা অর্ডার করার সময় নিচের তথ্য দিতে পারেন:</p>
          <ul class="pp-list">
            <li>সম্পূর্ণ নাম।</li>
            <li>মোবাইল নম্বর।</li>
            <li>ইমেইল ঠিকানা।</li>
            <li>ডেলিভারির ঠিকানা।</li>
            <li>জেলা, উপজেলা, থানা এবং এলাকার তথ্য।</li>
            <li>বাড়ি, রাস্তা বা পরিচিত স্থানের বিবরণ।</li>
            <li>বিলিং-সংক্রান্ত তথ্য, যেখানে প্রযোজ্য।</li>
            <li>গ্রাহকসেবার সঙ্গে যোগাযোগের তথ্য।</li>
          </ul>
        </div>

        <!-- ২.২ অ্যাকাউন্ট-সংক্রান্ত তথ্য -->
        <div class="pp-clause-item" id="pp-sec-2-2">
          <div class="pp-clause-title"><span class="pp-clause-num">২.২</span> অ্যাকাউন্ট-সংক্রান্ত তথ্য (Account Data)</div>
          <p class="pp-text">আপনি ওয়েবসাইটে অ্যাকাউন্ট তৈরি করলে আপনার অ্যাকাউন্ট পরিচালনার জন্য প্রয়োজনীয় তথ্য সংরক্ষণ করা হতে পারে, যেমন:</p>
          <ul class="pp-list">
            <li>ইউজার আইডি।</li>
            <li>অ্যাকাউন্টের নাম ও যোগাযোগের তথ্য।</li>
            <li>অর্ডারের ইতিহাস।</li>
            <li>অ্যাকাউন্টের পছন্দ ও সেটিংস।</li>
            <li>অ্যাকাউন্টের নিরাপত্তা-সংক্রান্ত রেকর্ড।</li>
          </ul>

          <!-- Security Alert Box -->
          <div class="pp-alert-amber">
            <span class="text-base sm:text-lg flex-shrink-0">⚠️</span>
            <div>
              <strong class="font-extrabold text-amber-900 dark:text-amber-300">সংবেদনশীল তথ্যের নিরাপত্তা সতর্কতা:</strong> 
              পাসওয়ার্ডের মতো সংবেদনশীল তথ্য সুরক্ষিত পদ্ধতিতে পরিচালনা করা উচিত। আমরা কখনো গ্রাহকের কাছে তার পাসওয়ার্ড, পেমেন্ট PIN বা OTP চেয়ে অর্ডার নিশ্চিত করার চেষ্টা করব না।
            </div>
          </div>
        </div>

        <!-- ২.৩ অর্ডার ও লেনদেনের তথ্য -->
        <div class="pp-clause-item" id="pp-sec-2-3">
          <div class="pp-clause-title"><span class="pp-clause-num">২.৩</span> অর্ডার ও লেনদেনের তথ্য (Order & Transaction Details)</div>
          <p class="pp-text">অর্ডার সম্পন্ন করার জন্য আমরা প্রয়োজন অনুযায়ী সংগ্রহ বা সংরক্ষণ করতে পারি:</p>
          <ul class="pp-list">
            <li>অর্ডার নম্বর।</li>
            <li>পণ্যের নাম, পরিমাণ ও মূল্য।</li>
            <li>প্রযোজ্য ডিসকাউন্ট ও ডেলিভারি চার্জ।</li>
            <li>অর্ডারের তারিখ ও সময়।</li>
            <li>অর্ডারের বর্তমান অবস্থা।</li>
            <li>পেমেন্ট পদ্ধতি ও লেনদেনের রেফারেন্স।</li>
            <li>ডেলিভারি ও ট্র্যাকিং-সংক্রান্ত তথ্য।</li>
            <li>রিটার্ন, রিফান্ড ও অভিযোগের বিবরণ।</li>
          </ul>
          <p class="pp-text mt-2 text-xs text-slate-500 dark:text-slate-400">
            কার্ড বা মোবাইল ফাইন্যান্সিয়াল সার্ভিসের সম্পূর্ণ গোপন পেমেন্ট তথ্য আমরা অপ্রয়োজনে সংগ্রহ করার উদ্দেশ্যে ব্যবহার করি না। পেমেন্ট প্রসেসরের মাধ্যমে লেনদেন সম্পন্ন হলে সেই সেবাদাতার নিজস্ব গোপনীয়তা নীতিও প্রযোজ্য হতে পারে।
          </p>
        </div>

        <!-- ২.৪ প্রযুক্তিগত তথ্য -->
        <div class="pp-clause-item" id="pp-sec-2-4">
          <div class="pp-clause-title"><span class="pp-clause-num">২.৪</span> প্রযুক্তিগত তথ্য (Technical Information)</div>
          <p class="pp-text">
            ওয়েবসাইটের নিরাপত্তা, কার্যকারিতা ও ব্যবহারকারীর অভিজ্ঞতা উন্নত করার জন্য প্রযুক্তিগত তথ্য সংগ্রহ করা হতে পারে, যেমন:
          </p>
          <div class="pp-sub-grid">
            <div class="pp-sub-box">
              <div class="pp-sub-term">🌐 আইপি ও নেটওয়ার্ক</div>
              <div class="pp-sub-desc">IP address ও নেটওয়ার্ক কানেক্টিভিটি তথ্য।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">💻 ব্রাউজার ও সিস্টেম</div>
              <div class="pp-sub-desc">ব্রাউজারের ধরন ও সংস্করণ, ডিভাইসের ধরন ও অপারেটিং সিস্টেম।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">⏱️ ব্রাউজিং টাইমলাইন</div>
              <div class="pp-sub-desc">ওয়েবসাইটে প্রবেশের সময়কাল ও সেশন স্থায়িত্ব।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">🔍 ভিজিট লগ ও ত্রুটি</div>
              <div class="pp-sub-desc">ভিজিট করা পেজ ও সংশ্লিষ্ট কার্যক্রম, ত্রুটি ও নিরাপত্তা-সংক্রান্ত লগ।</div>
            </div>
          </div>
          <p class="pp-text text-xs text-slate-500 dark:text-slate-400 mt-2">
            কোন তথ্য বাস্তবে সংগ্রহ করা হবে, তা ওয়েবসাইটের প্রযুক্তিগত ব্যবস্থা, হোস্টিং এবং ব্যবহৃত সেবার ওপর নির্ভর করবে।
          </p>
        </div>

        <!-- ২.৫ কুকিজ ও অনুরূপ প্রযুক্তি -->
        <div class="pp-clause-item" id="pp-sec-2-5">
          <div class="pp-clause-title"><span class="pp-clause-num">২.৫</span> কুকিজ ও অনুরূপ প্রযুক্তি (Cookies Policy)</div>
          <p class="pp-text">আমাদের ওয়েবসাইটে কুকিজ বা অনুরূপ প্রযুক্তি ব্যবহার করা হতে পারে, যাতে:</p>
          <ul class="pp-list">
            <li>শপিং কার্টের তথ্য ধরে রাখা যায়।</li>
            <li>ব্যবহারকারীর লগইন সেশন পরিচালনা করা যায়।</li>
            <li>ওয়েবসাইটের পছন্দ ও সেটিংস সংরক্ষণ করা যায়।</li>
            <li>নিরাপত্তা উন্নত করা যায়।</li>
            <li>ওয়েবসাইটের কার্যকারিতা বিশ্লেষণ করা যায়, যেখানে প্রযোজ্য।</li>
          </ul>
          <div class="pp-alert-blue">
            <span class="text-base flex-shrink-0">💡</span>
            <div>
              <strong>কুকিজ নিয়ন্ত্রণ:</strong> আপনি ব্রাউজারের সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে পারেন। তবে কিছু কুকিজ বন্ধ করলে ওয়েবসাইটের নির্দিষ্ট ফিচার সঠিকভাবে কাজ নাও করতে পারে।
            </div>
          </div>
        </div>
      </div>

      <!-- Group 3: ৩. আমরা কেন আপনার তথ্য ব্যবহার করি -->
      <div class="pp-card pp-section-group" id="pp-grp-3">
        <div class="pp-group-header">
          <div class="pp-group-icon">🎯</div>
          <h2 class="pp-group-title">৩. আমরা কেন আপনার তথ্য ব্যবহার করি</h2>
        </div>

        <div class="pp-clause-item" id="pp-sec-3">
          <p class="pp-text mb-3">
            Dream Cart BD আপনার তথ্য প্রয়োজনীয় ও বৈধ ব্যবসায়িক উদ্দেশ্যে ব্যবহার করতে পারে, যেমন:
          </p>
          <ul class="pp-num-list">
            <li><span class="pp-num-badge">১</span> গ্রাহকের অ্যাকাউন্ট তৈরি ও পরিচালনা করা।</li>
            <li><span class="pp-num-badge">২</span> অর্ডার গ্রহণ, নিশ্চিতকরণ, প্রস্তুত ও সম্পন্ন করা।</li>
            <li><span class="pp-num-badge">৩</span> পেমেন্ট যাচাই এবং প্রযোজ্য রিফান্ড পরিচালনা করা।</li>
            <li><span class="pp-num-badge">৪</span> পণ্য ডেলিভারি এবং কুরিয়ার সেবার সঙ্গে সমন্বয় করা।</li>
            <li><span class="pp-num-badge">৫</span> অর্ডারের অবস্থা, ডেলিভারি বা গুরুত্বপূর্ণ পরিবর্তন সম্পর্কে জানানো।</li>
            <li><span class="pp-num-badge">৬</span> গ্রাহকের প্রশ্ন, অভিযোগ, রিটার্ন ও ওয়ারেন্টি-সংক্রান্ত অনুরোধ সমাধান করা।</li>
            <li><span class="pp-num-badge">৭</span> জালিয়াতি, অননুমোদিত কার্যক্রম এবং নিরাপত্তা ঝুঁকি প্রতিরোধ করা।</li>
            <li><span class="pp-num-badge">৮</span> ওয়েবসাইটের কার্যকারিতা ও ব্যবহারকারীর অভিজ্ঞতা উন্নত করা।</li>
            <li><span class="pp-num-badge">৯</span> প্রযোজ্য আইন, হিসাবরক্ষণ ও বৈধ ব্যবসায়িক দায়িত্ব পালন করা।</li>
            <li><span class="pp-num-badge">১০</span> আপনার সম্মতি বা প্রযোজ্য আইনি ভিত্তি থাকলে নতুন পণ্য, অফার বা প্রচারণার তথ্য জানানো।</li>
          </ul>
          <p class="pp-text mt-2 font-medium text-slate-600 dark:text-slate-300">
            আমরা সংগৃহীত তথ্যকে সংশ্লিষ্ট উদ্দেশ্যের সঙ্গে সামঞ্জস্য রেখে ব্যবহার করার চেষ্টা করি।
          </p>
        </div>
      </div>

      <!-- Group 4: ৪. আপনার তথ্য কার সঙ্গে শেয়ার করা হতে পারে -->
      <div class="pp-card pp-section-group" id="pp-grp-4">
        <div class="pp-group-header">
          <div class="pp-group-icon">🤝</div>
          <h2 class="pp-group-title">৪. আপনার তথ্য কার সঙ্গে শেয়ার করা হতে পারে</h2>
        </div>

        <!-- Strict Zero Data Sale Policy -->
        <div class="pp-alert-emerald mb-3">
          <span class="text-base sm:text-lg flex-shrink-0">🛡️</span>
          <div>
            <strong class="font-extrabold text-emerald-900 dark:text-emerald-300">গোপনীয়তার নিশ্চয়তা:</strong> 
            Dream Cart BD আপনার ব্যক্তিগত তথ্য বিক্রি করার উদ্দেশ্যে ব্যবহার করে না। তবে সেবা প্রদানের জন্য প্রয়োজন হলে এবং আইনসম্মত ভিত্তি থাকলে সীমিত তথ্য সংশ্লিষ্ট পক্ষের সঙ্গে শেয়ার করা হতে পারে।
          </div>
        </div>

        <div class="pp-clause-item" id="pp-sec-4">
          <div class="pp-sub-grid">
            <div class="pp-sub-box">
              <div class="pp-sub-term">🚚 ৪.১ ডেলিভারি ও কুরিয়ার প্রতিষ্ঠান</div>
              <div class="pp-sub-desc">পণ্য পৌঁছে দেওয়ার জন্য প্রয়োজনীয় নাম, মোবাইল নম্বর, ঠিকানা, অর্ডারের বিবরণ এবং ডেলিভারি-সংক্রান্ত তথ্য কুরিয়ার বা ডেলিভারি পার্টনারকে দেওয়া হতে পারে।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">💳 ৪.২ পেমেন্ট সেবাদাতা</div>
              <div class="pp-sub-desc">পেমেন্ট গ্রহণ, লেনদেন যাচাই, প্রতারণা প্রতিরোধ বা রিফান্ডের জন্য প্রয়োজনীয় তথ্য সংশ্লিষ্ট ব্যাংক, পেমেন্ট গেটওয়ে বা মোবাইল ফাইন্যান্সিয়াল সার্ভিসের সঙ্গে শেয়ার করা হতে পারে।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">🏪 ৪.৩ ভেন্ডর ও সরবরাহকারী</div>
              <div class="pp-sub-desc">কোনো পণ্য তৃতীয় পক্ষের বিক্রেতা বা সরবরাহকারীর মাধ্যমে সরবরাহ করা হলে অর্ডার পূরণ এবং প্রয়োজনীয় বিক্রয়োত্তর সেবার জন্য প্রাসঙ্গিক তথ্য শেয়ার করা হতে পারে।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">🖥️ ৪.৪ প্রযুক্তি ও হোস্টিং সেবাদাতা</div>
              <div class="pp-sub-desc">ওয়েবসাইট পরিচালনা, ডেটাবেস সংরক্ষণ, নিরাপত্তা, ব্যাকআপ, ইমেইল বা অন্যান্য প্রযুক্তিগত সেবা প্রদানের জন্য অনুমোদিত সেবাদাতারা প্রয়োজন অনুযায়ী তথ্য প্রক্রিয়া করতে পারেন।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">⚖️ ৪.৫ আইন প্রয়োগকারী ও সরকারি কর্তৃপক্ষ</div>
              <div class="pp-sub-desc">প্রযোজ্য আইন, বৈধ আদালতের আদেশ, সরকারি নির্দেশনা বা জালিয়াতি তদন্তের জন্য প্রয়োজন হলে সংশ্লিষ্ট কর্তৃপক্ষকে তথ্য দেওয়া হতে পারে।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">🏢 ৪.৬ ব্যবসায়িক পুনর্গঠন</div>
              <div class="pp-sub-desc">ব্যবসার মালিকানা পরিবর্তন, একীভূতকরণ বা সম্পদ হস্তান্তরের মতো পরিস্থিতিতে প্রযোজ্য আইন ও গোপনীয়তার শর্ত মেনে তথ্য স্থানান্তর হতে পারে।</div>
            </div>
          </div>
          <p class="pp-text text-xs text-slate-500 dark:text-slate-400 mt-2">
            আমরা প্রয়োজনের অতিরিক্ত ব্যক্তিগত তথ্য শেয়ার না করার চেষ্টা করি।
          </p>
        </div>
      </div>

      <!-- Group 5: ৫. বিজ্ঞাপন, মার্কেটিং ও প্রচারণা -->
      <div class="pp-card pp-section-group" id="pp-grp-5">
        <div class="pp-group-header">
          <div class="pp-group-icon">📢</div>
          <h2 class="pp-group-title">৫. বিজ্ঞাপন, মার্কেটিং ও প্রচারণা</h2>
        </div>

        <div class="pp-clause-item" id="pp-sec-5">
          <p class="pp-text">
            Dream Cart BD নতুন পণ্য, বিশেষ ছাড়, অফার এবং অন্যান্য প্রাসঙ্গিক আপডেট জানাতে আপনার যোগাযোগের তথ্য ব্যবহার করতে পারে, যেখানে প্রযোজ্য সম্মতি বা অন্য বৈধ ভিত্তি রয়েছে।
          </p>
          <ul class="pp-list">
            <li>আপনি প্রচারণামূলক ইমেইল বা বার্তা পেতে না চাইলে উপলব্ধ আনসাবস্ক্রাইব ব্যবস্থা ব্যবহার করতে পারেন অথবা আমাদের সঙ্গে যোগাযোগ করতে পারেন।</li>
            <li>অর্ডার নিশ্চিতকরণ, পেমেন্ট, নিরাপত্তা বা ডেলিভারি-সংক্রান্ত গুরুত্বপূর্ণ বার্তা প্রচারণামূলক বার্তা থেকে আলাদা এবং প্রয়োজন অনুযায়ী পাঠানো হতে পারে।</li>
            <li>আমরা যদি ভবিষ্যতে বিজ্ঞাপন বা অ্যানালিটিক্স সেবা ব্যবহার করি, তাহলে সংশ্লিষ্ট প্রযুক্তি কীভাবে তথ্য সংগ্রহ করে, তা প্রযোজ্য নীতি ও সম্মতির শর্ত অনুযায়ী পরিচালিত হবে।</li>
          </ul>
        </div>
      </div>

      <!-- Group 6: ৬. তথ্য সংরক্ষণ ও নিরাপত্তা -->
      <div class="pp-card pp-section-group" id="pp-grp-6">
        <div class="pp-group-header">
          <div class="pp-group-icon">🛡️</div>
          <h2 class="pp-group-title">৬. তথ্য সংরক্ষণ ও নিরাপত্তা</h2>
        </div>

        <div class="pp-clause-item" id="pp-sec-6">
          <p class="pp-text">
            আপনার তথ্য অননুমোদিত প্রবেশ, ব্যবহার, পরিবর্তন, প্রকাশ বা ধ্বংস থেকে সুরক্ষিত রাখার জন্য আমরা যুক্তিসংগত প্রযুক্তিগত ও সাংগঠনিক ব্যবস্থা গ্রহণের লক্ষ্য রাখি। এসব ব্যবস্থার মধ্যে প্রযোজ্য ক্ষেত্রে থাকতে পারে:
          </p>
          <ul class="pp-list">
            <li>অ্যাকাউন্টে প্রবেশাধিকার নিয়ন্ত্রণ।</li>
            <li>অনুমোদিত ব্যক্তিদের সীমিত ডেটা অ্যাক্সেস।</li>
            <li>নিরাপদ পাসওয়ার্ড ব্যবস্থাপনা।</li>
            <li>সার্ভার ও ওয়েবসাইটের নিরাপত্তা ব্যবস্থা।</li>
            <li>ব্যাকআপ এবং পুনরুদ্ধারের ব্যবস্থা।</li>
            <li>সন্দেহজনক কার্যক্রম পর্যবেক্ষণ।</li>
            <li>প্রয়োজন অনুযায়ী সফটওয়্যার ও নিরাপত্তা আপডেট।</li>
          </ul>
          <p class="pp-text text-xs text-slate-500 dark:text-slate-400 mt-2">
            তবে ইন্টারনেটের মাধ্যমে তথ্য আদান-প্রদান বা ইলেকট্রনিক সংরক্ষণের কোনো পদ্ধতিই শতভাগ নিরাপদ বলে নিশ্চয়তা দেওয়া যায় না।
          </p>
          <p class="pp-text text-xs text-slate-500 dark:text-slate-400">
            কোনো নিরাপত্তা ঘটনা ঘটলে আমরা পরিস্থিতি অনুযায়ী প্রয়োজনীয় ব্যবস্থা গ্রহণ এবং প্রযোজ্য আইন অনুযায়ী সংশ্লিষ্ট ব্যক্তিদের বা কর্তৃপক্ষকে অবহিত করার ব্যবস্থা নেব।
          </p>
        </div>
      </div>

      <!-- Group 7: ৭. আপনার তথ্য কতদিন সংরক্ষণ করা হবে -->
      <div class="pp-card pp-section-group" id="pp-grp-7">
        <div class="pp-group-header">
          <div class="pp-group-icon">⏳</div>
          <h2 class="pp-group-title">৭. আপনার তথ্য কতদিন সংরক্ষণ করা হবে</h2>
        </div>

        <div class="pp-clause-item" id="pp-sec-7">
          <p class="pp-text mb-3">ব্যক্তিগত তথ্য প্রয়োজনীয় সময় পর্যন্ত সংরক্ষণ করা হতে পারে, যেমন:</p>
          <ul class="pp-list">
            <li>অ্যাকাউন্ট সচল থাকা অবস্থায়।</li>
            <li>অর্ডার ও ডেলিভারি সম্পন্ন করার জন্য।</li>
            <li>রিটার্ন, রিফান্ড বা অভিযোগ নিষ্পত্তির জন্য।</li>
            <li>হিসাবরক্ষণ ও কর-সংক্রান্ত বাধ্যবাধকতা পালনের জন্য।</li>
            <li>জালিয়াতি প্রতিরোধ ও নিরাপত্তা রক্ষার জন্য।</li>
            <li>আইনগত দাবি প্রতিষ্ঠা, প্রতিরক্ষা বা নিষ্পত্তির জন্য।</li>
          </ul>
          <p class="pp-text mt-3 text-xs text-slate-500 dark:text-slate-400">
            তথ্য আর প্রয়োজন না হলে, প্রযোজ্য আইন ও বৈধ সংরক্ষণ-সংক্রান্ত বাধ্যবাধকতা সাপেক্ষে সেটি মুছে ফেলা, পরিচয়বিহীন করা বা নিরাপদভাবে নিষ্পত্তি করার ব্যবস্থা নেওয়া হতে পারে।
          </p>
        </div>
      </div>

      <!-- Group 8: ৮. আপনার গোপনীয়তার অধিকার -->
      <div class="pp-card pp-section-group" id="pp-grp-8">
        <div class="pp-group-header">
          <div class="pp-group-icon">⚖️</div>
          <h2 class="pp-group-title">৮. আপনার গোপনীয়তার অধিকার</h2>
        </div>

        <div class="pp-clause-item" id="pp-sec-8">
          <p class="pp-text mb-3">
            প্রযোজ্য আইন ও প্রযুক্তিগত ব্যবস্থার সীমার মধ্যে আপনি আপনার ব্যক্তিগত তথ্য সম্পর্কে বিভিন্ন অনুরোধ করতে পারেন:
          </p>
          <div class="pp-sub-grid">
            <div class="pp-sub-box">
              <div class="pp-sub-term">🔍 ৮.১ তথ্য জানার অনুরোধ</div>
              <div class="pp-sub-desc">আপনার সম্পর্কে কী ধরনের ব্যক্তিগত তথ্য সংরক্ষিত রয়েছে এবং কী উদ্দেশ্যে ব্যবহার করা হচ্ছে, তা জানতে চাইতে পারেন।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">✏️ ৮.২ তথ্য সংশোধন</div>
              <div class="pp-sub-desc">আপনার নাম, ফোন নম্বর, ইমেইল বা ঠিকানায় ভুল থাকলে সংশোধনের অনুরোধ করতে পারেন।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">🗑️ ৮.৩ তথ্য মুছে ফেলার অনুরোধ</div>
              <div class="pp-sub-desc">আপনি আপনার ব্যক্তিগত তথ্য মুছে ফেলার অনুরোধ করতে পারেন। তবে আইনগতভাবে সংরক্ষণ করা প্রয়োজন এমন অর্ডার, লেনদেন বা হিসাবরক্ষণ-সংক্রান্ত তথ্য সব ক্ষেত্রে সঙ্গে সঙ্গে মুছে ফেলা সম্ভব নাও হতে পারে।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">🚫 ৮.৪ প্রচারণা বন্ধ করা</div>
              <div class="pp-sub-desc">আপনি প্রচারণামূলক ইমেইল বা বার্তা বন্ধ করার অনুরোধ করতে পারেন। তবে প্রয়োজনীয় লেনদেন বা নিরাপত্তা-সংক্রান্ত বার্তা পাঠানো অব্যাহত থাকতে পারে।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">🔄 ৮.৫ সম্মতি প্রত্যাহার</div>
              <div class="pp-sub-desc">কোনো নির্দিষ্ট তথ্য ব্যবহারের ভিত্তি আপনার সম্মতি হলে, প্রযোজ্য আইন অনুযায়ী সেই সম্মতি প্রত্যাহারের অনুরোধ করতে পারেন। প্রত্যাহারের আগের বৈধ প্রক্রিয়াকরণের বৈধতা এতে স্বয়ংক্রিয়ভাবে বাতিল হয় না।</div>
            </div>
            <div class="pp-sub-box">
              <div class="pp-sub-term">📩 ৮.৬ অভিযোগ জানানো</div>
              <div class="pp-sub-desc">আপনার ব্যক্তিগত তথ্যের ব্যবহার নিয়ে কোনো উদ্বেগ থাকলে আমাদের সঙ্গে যোগাযোগ করে অভিযোগ জানাতে পারেন।</div>
            </div>
          </div>
          <p class="pp-text text-xs text-slate-500 dark:text-slate-400 mt-2">
            আপনার অনুরোধ যাচাই করার জন্য যুক্তিসংগত পরিচয় নিশ্চিতকরণ প্রয়োজন হতে পারে। আমরা প্রযোজ্য আইন অনুযায়ী অনুরোধ পর্যালোচনা করব।
          </p>
        </div>
      </div>

      <!-- Group 9: ৯ - ১২. বিশেষ নির্দেশিকা ও গ্রাহকের দায়িত্ব -->
      <div class="pp-card pp-section-group" id="pp-grp-9">
        <div class="pp-group-header">
          <div class="pp-group-icon">🌐</div>
          <h2 class="pp-group-title">৯ - ১২. বিশেষ বিধান ও গ্রাহকের দায়িত্ব</h2>
        </div>

        <!-- ৯. শিশু ও অপ্রাপ্তবয়স্ক ব্যবহারকারীর তথ্য -->
        <div class="pp-clause-item" id="pp-sec-9">
          <div class="pp-clause-title"><span class="pp-clause-num">৯</span> শিশু ও অপ্রাপ্তবয়স্ক ব্যবহারকারীর তথ্য</div>
          <p class="pp-text">
            Dream Cart BD-এর সেবা ব্যবহার করার ক্ষেত্রে অপ্রাপ্তবয়স্কদের জন্য প্রযোজ্য আইন ও অভিভাবকের অনুমতির প্রয়োজনীয়তা অনুসরণ করতে হবে। যেখানে প্রয়োজন, শিশু বা অপ্রাপ্তবয়স্ক ব্যক্তির তথ্য সংগ্রহ ও ব্যবহারের ক্ষেত্রে আইনসম্মত অভিভাবকীয় সম্মতি নেওয়া হবে।
          </p>
          <p class="pp-text">
            আমরা জেনেশুনে প্রযোজ্য আইন লঙ্ঘন করে শিশুদের ব্যক্তিগত তথ্য সংগ্রহ করার উদ্দেশ্যে কাজ করি না। আপনি যদি মনে করেন কোনো শিশুর তথ্য যথাযথ অনুমতি ছাড়া আমাদের কাছে জমা হয়েছে, তাহলে আমাদের সঙ্গে যোগাযোগ করুন।
          </p>
        </div>

        <!-- ১০. তৃতীয় পক্ষের ওয়েবসাইট ও সেবা -->
        <div class="pp-clause-item" id="pp-sec-10">
          <div class="pp-clause-title"><span class="pp-clause-num">১০</span> তৃতীয় পক্ষের ওয়েবসাইট ও সেবা</div>
          <p class="pp-text">
            আমাদের ওয়েবসাইটে কুরিয়ার, পেমেন্ট সেবা, সামাজিক যোগাযোগমাধ্যম, বিক্রেতা বা অন্যান্য তৃতীয় পক্ষের ওয়েবসাইটের লিংক থাকতে পারে। আপনি এসব লিংকে প্রবেশ করলে সংশ্লিষ্ট তৃতীয় পক্ষের নিজস্ব গোপনীয়তা নীতি ও ব্যবহারের শর্ত প্রযোজ্য হতে পারে।
          </p>
          <p class="pp-text">
            Dream Cart BD সব তৃতীয় পক্ষের ওয়েবসাইটের তথ্য সংগ্রহ, নিরাপত্তা বা নীতিমালা সরাসরি নিয়ন্ত্রণ করে না। তাই কোনো তৃতীয় পক্ষের সেবা ব্যবহারের আগে তাদের গোপনীয়তা নীতি পর্যালোচনা করার পরামর্শ দেওয়া হচ্ছে।
          </p>
        </div>

        <!-- ১১. আন্তর্জাতিকভাবে তথ্য প্রক্রিয়াকরণ -->
        <div class="pp-clause-item" id="pp-sec-11">
          <div class="pp-clause-title"><span class="pp-clause-num">১১</span> আন্তর্জাতিকভাবে তথ্য প্রক্রিয়াকরণ</div>
          <p class="pp-text">
            ওয়েবসাইট হোস্টিং, ক্লাউড স্টোরেজ, ইমেইল, পেমেন্ট বা অন্যান্য প্রযুক্তিগত সেবাদাতা বাংলাদেশের বাইরে অবস্থিত সার্ভার ব্যবহার করতে পারে।
          </p>
          <p class="pp-text">
            যদি আপনার তথ্য বাংলাদেশের বাইরে সংরক্ষণ বা প্রক্রিয়াকরণ করা হয়, তাহলে প্রযোজ্য আইন ও সংশ্লিষ্ট সেবার শর্ত অনুযায়ী উপযুক্ত সুরক্ষার ব্যবস্থা গ্রহণ করা হবে। এ ধরনের সেবা বাস্তবে ব্যবহার করা হলে তার প্রকৃতি ও প্রাসঙ্গিক শর্ত অনুযায়ী প্রয়োজনীয় তথ্য এই নীতিতে হালনাগাদ করা হবে।
          </p>
        </div>

        <!-- ১২. তথ্যের যথার্থতা ও গ্রাহকের দায়িত্ব -->
        <div class="pp-clause-item" id="pp-sec-12">
          <div class="pp-clause-title"><span class="pp-clause-num">১২</span> তথ্যের যথার্থতা ও গ্রাহকের দায়িত্ব</div>
          <p class="pp-text">
            আমাদের সেবা সঠিকভাবে পরিচালনার জন্য গ্রাহকদের সঠিক ও হালনাগাদ তথ্য প্রদান করা প্রয়োজন। অর্ডার করার সময় ভুল ফোন নম্বর, অসম্পূর্ণ ঠিকানা বা ভুল প্রাপকের তথ্য দিলে ডেলিভারি বিলম্বিত হতে পারে।
          </p>
          <p class="pp-text">
            আপনার অ্যাকাউন্টের তথ্য পরিবর্তিত হলে, যেখানে সম্ভব, তা হালনাগাদ করুন। অন্য কোনো ব্যক্তির ব্যক্তিগত তথ্য প্রদান করার আগে নিশ্চিত করুন যে তা দেওয়ার যথাযথ অনুমতি বা আইনগত ভিত্তি আপনার রয়েছে।
          </p>
        </div>
      </div>

      <!-- Group 10: ১৩ & ১৪. নিরাপত্তা লঙ্ঘন ও নীতি পরিবর্তন -->
      <div class="pp-card pp-section-group" id="pp-grp-10">
        <div class="pp-group-header">
          <div class="pp-group-icon">📜</div>
          <h2 class="pp-group-title">১৩ & ১৪. নিরাপত্তা লঙ্ঘন ও নীতি পরিবর্তন</h2>
        </div>

        <!-- ১৩. তথ্য ফাঁস বা নিরাপত্তা লঙ্ঘনের ক্ষেত্রে -->
        <div class="pp-clause-item" id="pp-sec-13">
          <div class="pp-clause-title"><span class="pp-clause-num">১৩</span> তথ্য ফাঁস বা নিরাপত্তা লঙ্ঘনের ক্ষেত্রে</div>
          <p class="pp-text">
            আমরা যদি জানতে পারি যে ব্যক্তিগত তথ্য অননুমোদিতভাবে প্রকাশিত হয়েছে, হারিয়ে গেছে বা ক্ষতিগ্রস্ত হয়েছে, তাহলে ঘটনার প্রকৃতি ও ঝুঁকি মূল্যায়ন করে প্রয়োজনীয় ব্যবস্থা গ্রহণের চেষ্টা করব।
          </p>
          <p class="pp-text">
            প্রযোজ্য আইন অনুযায়ী যেখানে কর্তৃপক্ষ বা সংশ্লিষ্ট ব্যক্তিকে অবহিত করা বাধ্যতামূলক, সেখানে সেই বাধ্যবাধকতা অনুসরণ করা হবে।
          </p>
          <div class="pp-alert-amber">
            <span class="text-base flex-shrink-0">🔔</span>
            <div>
              <strong>সতর্কতা:</strong> গ্রাহক হিসেবে আপনার অ্যাকাউন্টে অস্বাভাবিক কার্যক্রম, সন্দেহজনক বার্তা বা তথ্যের অপব্যবহার দেখতে পেলে দ্রুত আমাদের জানান।
            </div>
          </div>
        </div>

        <!-- ১৪. গোপনীয়তা নীতির পরিবর্তন -->
        <div class="pp-clause-item" id="pp-sec-14">
          <div class="pp-clause-title"><span class="pp-clause-num">১৪</span> গোপনীয়তা নীতির পরিবর্তন</div>
          <p class="pp-text">
            Dream Cart BD প্রয়োজন অনুযায়ী এই Privacy Policy সংশোধন বা হালনাগাদ করতে পারে। ওয়েবসাইটের কার্যক্রম, নতুন ফিচার, তথ্য ব্যবহারের পদ্ধতি বা প্রযোজ্য আইন পরিবর্তিত হলে নীতিতে সংশোধন আনা হতে পারে।
          </p>
          <p class="pp-text">
            সংশোধিত নীতি এই পেজে প্রকাশ করা হবে এবং প্রয়োজন অনুযায়ী কার্যকর হওয়ার তারিখ হালনাগাদ করা হবে। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে প্রযোজ্য আইন অনুযায়ী যথাযথভাবে অবহিত করা বা নতুন সম্মতি নেওয়ার ব্যবস্থা করা হবে। গ্রাহকদের সময় সময় এই পেজটি পর্যালোচনা করার পরামর্শ দেওয়া হচ্ছে।
          </p>
        </div>
      </div>

      <!-- Group 11: ১৫. আমাদের সঙ্গে যোগাযোগ -->
      <div class="pp-card pp-section-group" id="pp-grp-11">
        <div class="pp-group-header">
          <div class="pp-group-icon">📞</div>
          <h2 class="pp-group-title">১৫. আমাদের সঙ্গে যোগাযোগ</h2>
        </div>

        <div class="pp-clause-item" id="pp-sec-15">
          <p class="pp-text mb-3">
            আপনার ব্যক্তিগত তথ্য, অ্যাকাউন্ট, গোপনীয়তা, তথ্য সংশোধন, তথ্য মুছে ফেলা বা এই নীতি সম্পর্কে কোনো প্রশ্ন থাকলে নিচের যোগাযোগের মাধ্যম ব্যবহার করুন:
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <!-- WhatsApp / Mobile -->
            <a href="tel:01581703822" class="pp-contact-card">
              <div class="pp-contact-icon">📱</div>
              <div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 font-bold">WhatsApp / মোবাইল</div>
                <div class="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">01581703822</div>
              </div>
            </a>

            <!-- Alt Mobile -->
            <a href="tel:01818273838" class="pp-contact-card">
              <div class="pp-contact-icon">📞</div>
              <div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 font-bold">বিকল্প মোবাইল</div>
                <div class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">01818273838</div>
              </div>
            </a>

            <!-- Main Email -->
            <a href="mailto:dreamcartbd.store@gmail.com" class="pp-contact-card">
              <div class="pp-contact-icon">✉️</div>
              <div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 font-bold">ইমেইল ঠিকানা</div>
                <div class="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 truncate">dreamcartbd.store@gmail.com</div>
              </div>
            </a>

            <!-- Technical Email -->
            <a href="mailto:jainal.dcitbd@gmail.com" class="pp-contact-card">
              <div class="pp-contact-icon">📧</div>
              <div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 font-bold">অতিরিক্ত ইমেইল</div>
                <div class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate">jainal.dcitbd@gmail.com</div>
              </div>
            </a>

            <!-- Extra Support Email -->
            <a href="mailto:saiful05333@gmail.com" class="pp-contact-card sm:col-span-2">
              <div class="pp-contact-icon">📩</div>
              <div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 font-bold">অতিরিক্ত ইমেইল</div>
                <div class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate">saiful05333@gmail.com</div>
              </div>
            </a>
          </div>

          <div class="pp-alert-amber text-xs">
            <span class="text-base flex-shrink-0">💡</span>
            <div>
              <strong>গুরুত্বপূর্ণ নির্দেশিকা:</strong> অর্ডার-সংক্রান্ত কোনো বিষয়ে যোগাযোগ করলে অর্ডার নম্বর এবং অর্ডারের সঙ্গে ব্যবহৃত মোবাইল নম্বর উল্লেখ করুন। পরিচয় যাচাইয়ের প্রয়োজনে অতিরিক্ত তথ্য চাওয়া হতে পারে; তবে <strong>পাসওয়ার্ড, PIN বা OTP শেয়ার করবেন না।</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Group 12: ১৬. প্রযোজ্য আইন -->
      <div class="pp-card pp-section-group" id="pp-grp-12">
        <div class="pp-group-header">
          <div class="pp-group-icon">⚖️</div>
          <h2 class="pp-group-title">১৬. প্রযোজ্য আইন (Governing Law)</h2>
        </div>

        <div class="pp-clause-item" id="pp-sec-16">
          <p class="pp-text">
            এই গোপনীয়তা নীতি বাংলাদেশের প্রযোজ্য আইন ও বিধিবিধানের সঙ্গে সামঞ্জস্য রেখে পরিচালিত হবে।
          </p>
          <p class="pp-text">
            ব্যক্তিগত তথ্যের সুরক্ষা, ডিজিটাল বাণিজ্য, ভোক্তা অধিকার এবং সংশ্লিষ্ট অন্যান্য বিষয়ে যে আইনগত বাধ্যবাধকতা প্রযোজ্য হবে, তা অনুসরণ করা হবে।
          </p>
          <p class="pp-text">
            এই নীতির কোনো বিধান প্রযোজ্য আইনে স্বীকৃত আপনার অধিকারকে বাতিল বা সীমিত করার উদ্দেশ্যে প্রণীত নয়।
          </p>
        </div>

        <!-- Closing Footer Card -->
        <div class="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <div class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Dream Cart BD — আপনার বিশ্বস্ত অনলাইন শপিং গন্তব্য।
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            আমাদের ওয়েবসাইট ব্যবহার করার আগে এই গোপনীয়তা নীতি এবং প্রযোজ্য অন্যান্য নীতিমালা পড়ে নেওয়ার জন্য ধন্যবাদ। আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও নিরাপত্তাকে আমরা গুরুত্ব দিই।
          </p>
        </div>

      </div>

    </div>
  `;
}
