/**
 * DREAM CART BD — OFFERS & CUSTOMER BENEFITS HUB (OffersPage.js)
 * Implements user requirements:
 * - Free delivery on orders >= ৳2,000 across Bangladesh
 * - 5% instant discount on online prepayment (bKash/Nagad/Bank)
 * - Reseller partner program (up to 10% commission, dropshipping)
 * - Wholesaler & bulk buying privileges at lowest importer rates
 * - Comprehensive list cards for all platform benefits (100% Genuine, 1-Year Warranty, 7-Day Replacement, Fast Delivery, 24/7 Support)
 * - STRICT REQUIREMENT: NO COUPONS! (All benefits are automatic and transparent)
 * - Dedicated clean CSS with elegant margins, comfortable padding, balanced typography, and soft dark mode contrast.
 */

export function renderOffersPage() {
  return `
    <style id="dc-offers-styles">
      .of-wrapper {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        max-width: 1140px;
        margin: 0 auto;
        padding: 16px 16px 64px;
      }
      
      /* Top Header */
      .of-header {
        margin-bottom: 32px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e2e8f0;
      }
      .dark .of-header {
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }
      .of-breadcrumbs {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 8px;
      }
      .of-breadcrumbs a {
        color: #64748b;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .of-breadcrumbs a:hover {
        color: #10b981;
      }
      .dark .of-breadcrumbs a {
        color: #94a3b8;
      }
      .dark .of-breadcrumbs a:hover {
        color: #34d399;
      }
      .of-title-row {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      @media (min-width: 640px) {
        .of-title-row {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }
      .of-main-title {
        font-size: 24px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.3;
        margin: 0;
      }
      .dark .of-main-title {
        color: #f8fafc;
      }
      @media (min-width: 640px) {
        .of-main-title {
          font-size: 28px;
        }
      }
      .of-subtitle {
        font-size: 13.5px;
        color: #64748b;
        margin: 6px 0 0;
        line-height: 1.5;
      }
      .dark .of-subtitle {
        color: #94a3b8;
      }
      .of-auto-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
        padding: 8px 16px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        align-self: flex-start;
      }
      .dark .of-auto-badge {
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.25);
      }

      /* Hero Highlights: 2-Column High-Impact Cards */
      .of-hero-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
        margin-bottom: 36px;
      }
      @media (min-width: 768px) {
        .of-hero-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      .of-hero-card {
        border-radius: 20px;
        padding: 28px 26px;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .of-hero-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 16px 32px -6px rgba(0, 0, 0, 0.22);
      }
      .of-hero-green {
        background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #047857 100%);
      }
      .of-hero-blue {
        background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #2563eb 100%);
      }
      
      .of-hero-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
      }
      .of-hero-pill {
        background: #fbbf24;
        color: #78350f;
        font-size: 11px;
        font-weight: 800;
        padding: 5px 12px;
        border-radius: 9999px;
        letter-spacing: 0.3px;
      }
      .of-hero-icon {
        font-size: 32px;
        line-height: 1;
      }
      .of-hero-title {
        font-size: 22px;
        font-weight: 800;
        line-height: 1.35;
        margin: 0 0 12px;
        color: #ffffff;
      }
      @media (min-width: 640px) {
        .of-hero-title {
          font-size: 24px;
        }
      }
      .of-hero-desc {
        font-size: 13.5px;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.92);
        margin: 0 0 20px;
      }
      .of-hero-bullets {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 16px;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .of-bullet-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12.5px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.95);
      }
      .of-bullet-check {
        color: #a7f3d0;
        font-weight: 800;
        flex-shrink: 0;
      }
      .of-hero-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #ffffff;
        color: #0f172a;
        font-size: 13px;
        font-weight: 800;
        padding: 12px 22px;
        border-radius: 12px;
        text-decoration: none;
        align-self: flex-start;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        transition: all 0.2s ease;
      }
      .of-hero-btn:hover {
        background: #f8fafc;
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
      }
      .of-hero-green .of-hero-btn {
        color: #065f46;
      }
      .of-hero-blue .of-hero-btn {
        color: #3730a3;
      }

      /* Sections & Headers */
      .of-section {
        margin-bottom: 36px;
      }
      .of-section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
      }
      .of-section-icon {
        font-size: 20px;
      }
      .of-section-title {
        font-size: 19px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
      }
      .dark .of-section-title {
        color: #f8fafc;
      }

      /* Partner Cards */
      .of-partner-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
      }
      @media (min-width: 768px) {
        .of-partner-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      .of-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 20px;
        padding: 26px 24px;
        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: all 0.2s ease;
      }
      .dark .of-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
      }
      .of-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.08);
      }
      .dark .of-card:hover {
        box-shadow: 0 10px 28px -4px rgba(0, 0, 0, 0.55);
        border-color: rgba(255, 255, 255, 0.14);
      }

      .of-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .of-card-badge {
        font-size: 11px;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 9999px;
      }
      .of-badge-emerald {
        background: #ecfdf5;
        color: #047857;
      }
      .dark .of-badge-emerald {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }
      .of-badge-indigo {
        background: #eef2ff;
        color: #4338ca;
      }
      .dark .of-badge-indigo {
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
      }
      .of-card-title {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.4;
        margin: 0 0 10px;
      }
      .dark .of-card-title {
        color: #f8fafc;
      }
      .of-card-desc {
        font-size: 13px;
        line-height: 1.6;
        color: #64748b;
        margin: 0 0 18px;
      }
      .dark .of-card-desc {
        color: #94a3b8;
      }
      .of-card-bullets {
        border-top: 1px solid #f1f5f9;
        padding-top: 14px;
        margin-bottom: 22px;
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .dark .of-card-bullets {
        border-top-color: rgba(255, 255, 255, 0.06);
      }
      .of-card-bullet {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12.5px;
        line-height: 1.5;
        color: #334155;
      }
      .dark .of-card-bullet {
        color: #cbd5e1;
      }
      .of-btn-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .of-btn-main {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #10b981;
        color: #ffffff;
        font-size: 13px;
        font-weight: 700;
        padding: 10px 18px;
        border-radius: 12px;
        text-decoration: none;
        transition: background 0.15s ease, transform 0.15s ease;
      }
      .of-btn-main:hover {
        background: #059669;
        transform: translateY(-1px);
      }
      .of-btn-indigo {
        background: #4f46e5;
      }
      .of-btn-indigo:hover {
        background: #4338ca;
      }
      .of-btn-alt {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        color: #334155;
        border: 1px solid #e2e8f0;
        font-size: 13px;
        font-weight: 700;
        padding: 10px 18px;
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .dark .of-btn-alt {
        background: rgba(255, 255, 255, 0.06);
        color: #e2e8f0;
        border-color: rgba(255, 255, 255, 0.12);
      }
      .of-btn-alt:hover {
        background: #f1f5f9;
        color: #0f172a;
        border-color: #cbd5e1;
      }
      .dark .of-btn-alt:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.25);
      }

      /* 6 Platform Guarantee Cards */
      .of-benefits-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 18px;
      }
      @media (min-width: 640px) {
        .of-benefits-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (min-width: 1024px) {
        .of-benefits-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      .of-benefit-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.8);
        border-radius: 18px;
        padding: 22px 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.03);
        transition: all 0.2s ease;
      }
      .dark .of-benefit-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.07);
        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.35);
      }
      .of-benefit-card:hover {
        border-color: #10b981;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -3px rgba(16, 185, 129, 0.12);
      }
      .of-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        margin-bottom: 14px;
      }
      .of-icon-green { background: #ecfdf5; }
      .dark .of-icon-green { background: rgba(16, 185, 129, 0.15); }
      .of-icon-amber { background: #fef3c7; }
      .dark .of-icon-amber { background: rgba(245, 158, 11, 0.15); }
      .of-icon-teal { background: #ccfbf1; }
      .dark .of-icon-teal { background: rgba(20, 184, 166, 0.15); }
      .of-icon-blue { background: #dbeafe; }
      .dark .of-icon-blue { background: rgba(59, 130, 246, 0.15); }
      .of-icon-rose { background: #ffe4e6; }
      .dark .of-icon-rose { background: rgba(244, 63, 94, 0.15); }
      .of-icon-purple { background: #f3e8ff; }
      .dark .of-icon-purple { background: rgba(168, 85, 247, 0.15); }

      .of-benefit-title {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 8px;
        line-height: 1.4;
      }
      .dark .of-benefit-title {
        color: #f8fafc;
      }
      .of-benefit-desc {
        font-size: 12.5px;
        line-height: 1.6;
        color: #64748b;
        margin: 0 0 14px;
      }
      .dark .of-benefit-desc {
        color: #94a3b8;
      }
      .of-benefit-tag {
        font-size: 11.5px;
        font-weight: 700;
        color: #059669;
        padding-top: 10px;
        border-top: 1px solid #f1f5f9;
      }
      .dark .of-benefit-tag {
        color: #34d399;
        border-top-color: rgba(255, 255, 255, 0.06);
      }

      /* Bottom CTA Banner */
      .of-cta-banner {
        background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #047857 100%);
        border-radius: 20px;
        padding: 32px 28px;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 20px;
        box-shadow: 0 10px 25px -4px rgba(5, 150, 105, 0.25);
      }
      @media (min-width: 640px) {
        .of-cta-banner {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }
      .of-cta-title {
        font-size: 20px;
        font-weight: 800;
        line-height: 1.35;
        margin: 0 0 8px;
        color: #ffffff;
      }
      @media (min-width: 640px) {
        .of-cta-title {
          font-size: 22px;
        }
      }
      .of-cta-desc {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        line-height: 1.55;
        max-width: 580px;
      }
      .of-cta-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
      }
      .of-cta-btn-white {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ffffff;
        color: #065f46;
        font-size: 13px;
        font-weight: 800;
        padding: 11px 20px;
        border-radius: 12px;
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        transition: all 0.15s ease;
      }
      .of-cta-btn-white:hover {
        background: #f8fafc;
        transform: translateY(-1px);
      }
      .of-cta-btn-glass {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(0, 0, 0, 0.2);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-size: 13px;
        font-weight: 700;
        padding: 11px 18px;
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .of-cta-btn-glass:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    </style>

    <div class="of-wrapper">
      
      <!-- Top Page Header -->
      <div class="of-header">
        <div class="of-breadcrumbs">
          <a href="/">হোম</a>
          <span>/</span>
          <span>অফার ও সুবিধাসমূহ</span>
        </div>
        <div class="of-title-row">
          <div>
            <h1 class="of-main-title">
              🎁 ড্রিম কার্ট বিডি বিশেষ অফার ও গ্রাহক সুবিধাসমূহ
            </h1>
            <p class="of-subtitle">
              কোনো কুপন কোডের ঝামেলা ছাড়া স্বয়ংক্রিয় সুবিধা, ফ্রি ডেলিভারি, অনলাইন ক্যাশব্যাক ও এক্সক্লুসিভ পার্টনার বেনিফিট
            </p>
          </div>

          <!-- Zero Coupon Notice Badge -->
          <div class="of-auto-badge">
            <span>✨</span>
            <span>১০০% স্বয়ংক্রিয় সুবিধা • <strong>কোনো কুপন লাগবে না</strong></span>
          </div>
        </div>
      </div>

      <!-- Prime Hero Benefits: 2-Column High-Impact Cards -->
      <div class="of-hero-grid">
        
        <!-- Benefit 1: Free Delivery on Orders >= ৳2,000 -->
        <div class="of-hero-card of-hero-green">
          <div>
            <div class="of-hero-top">
              <span class="of-hero-pill">
                🔥 সবার প্রিয় অফার
              </span>
              <span class="of-hero-icon">🚚</span>
            </div>

            <h2 class="of-hero-title">
              ৳২,০০০+ কেনাকাটায় সম্পূর্ণ ফ্রি ডেলিভারি!
            </h2>

            <p class="of-hero-desc">
              যেকোনো পণ্য মিলিয়ে মোট ২,০০০ টাকা বা তার বেশি অর্ডার করলেই সারা বাংলাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি (৳০)!
            </p>

            <div class="of-hero-bullets">
              <div class="of-bullet-item">
                <span class="of-bullet-check">✓</span>
                <span>ঢাকার ভেতরে ৭০ টাকা এবং ঢাকার বাইরে ১৩০ টাকা সম্পূর্ণ সাশ্রয়</span>
              </div>
              <div class="of-bullet-item">
                <span class="of-bullet-check">✓</span>
                <span>কোনো কুপন কোড ছাড়াই কার্ট ও চেকআউটে স্বয়ংক্রিয়ভাবে কার্যকর</span>
              </div>
              <div class="of-bullet-item">
                <span class="of-bullet-check">✓</span>
                <span>একাধিক ক্যাটাগরির পণ্য একসাথে কার্টে যোগ করলেও অফার প্রযোজ্য</span>
              </div>
            </div>
          </div>

          <div>
            <a href="/products" class="of-hero-btn">
              <span>🛍️</span> এখনই শপিং শুরু করুন →
            </a>
          </div>
        </div>

        <!-- Benefit 2: 5% Instant Online Prepayment Discount -->
        <div class="of-hero-card of-hero-blue">
          <div>
            <div class="of-hero-top">
              <span class="of-hero-pill">
                ⚡ ডিজিটাল পেমেন্ট অফার
              </span>
              <span class="of-hero-icon">💳</span>
            </div>

            <h2 class="of-hero-title">
              অনলাইন পেমেন্টে ইনস্ট্যান্ট ৫% সরাসরি ছাড়!
            </h2>

            <p class="of-hero-desc">
              বিকাশ (মার্চেন্ট/পার্সোনাল), নগদ বা ব্যাংক পেমেন্টে অগ্রিম মূল্য পরিশোধ করলেই সাথে সাথে মোট মূল্যের ওপর অতিরিক্ত ৫% ডিসকাউন্ট।
            </p>

            <div class="of-hero-bullets">
              <div class="of-bullet-item">
                <span class="of-bullet-check">✓</span>
                <span>বিকাশ মার্চেন্ট: <strong style="font-family: monospace;">01581703822</strong> (পেমেন্ট গেটওয়ে)</span>
              </div>
              <div class="of-bullet-item">
                <span class="of-bullet-check">✓</span>
                <span>বিকাশ পার্সোনাল: <strong style="font-family: monospace;">01879653143</strong> (সেন্ড মানি)</span>
              </div>
              <div class="of-bullet-item">
                <span class="of-bullet-check">✓</span>
                <span>চেকআউটে "Online Payment" সিলেক্ট করলেই স্বয়ংক্রিয় ৫% কমে যাবে</span>
              </div>
            </div>
          </div>

          <div>
            <a href="/checkout" class="of-hero-btn">
              <span>💳</span> পেমেন্ট ও চেকআউট দেখুন →
            </a>
          </div>
        </div>

      </div>

      <!-- Section: Partner Programs Grid (Reseller & Wholesaler Benefits) -->
      <div class="of-section">
        <div class="of-section-header">
          <span class="of-section-icon">🤝</span>
          <h2 class="of-section-title">
            বিজনেস পার্টনার ও পাইকারি বিশেষ সুবিধা
          </h2>
        </div>

        <div class="of-partner-grid">
          
          <!-- Benefit 3: Reseller Partner Benefits -->
          <div class="of-card">
            <div>
              <div class="of-card-top">
                <span class="of-card-badge of-badge-emerald">
                  জিরো ইনভেস্টমেন্টে ড্রপশিপিং
                </span>
                <span style="font-size: 24px;">💼</span>
              </div>

              <h3 class="of-card-title">
                রিসেলার পার্টনার প্রোগ্রাম (১০% পর্যন্ত কমিশন)
              </h3>

              <p class="of-card-desc">
                কোনো নিজস্ব স্টক বা ইনভেস্টমেন্ট ছাড়াই ঘরে বসে নিজের ফেসবুক পেজ বা শপের মাধ্যমে ড্রিম কার্ট বিডি-র পণ্য রিসেলিং করুন।
              </p>

              <div class="of-card-bullets">
                <div class="of-card-bullet">
                  <span style="color: #10b981; font-weight: 800;">✓</span>
                  <span>প্রতিটি সফল ডেলিভারিতে ১০% পর্যন্ত নিশ্চিত প্রফিট মার্জিন</span>
                </div>
                <div class="of-card-bullet">
                  <span style="color: #10b981; font-weight: 800;">✓</span>
                  <span>কুরিয়ার প্যাকিং, ইনভয়েস ও কাস্টমার ডেলিভারি সরাসরি আমরা সামলাব</span>
                </div>
                <div class="of-card-bullet">
                  <span style="color: #10b981; font-weight: 800;">✓</span>
                  <span>ডেডিকেটেড রিসেলার ড্যাশবোর্ড ও নিয়মিত বিকাশ উইথড্র সুবিধা</span>
                </div>
              </div>
            </div>

            <div class="of-btn-row">
              <a href="/reseller/register" class="of-btn-main">
                রিসেলার অ্যাকাউন্ট খুলুন →
              </a>
              <a href="/reseller/login" class="of-btn-alt">
                লগইন
              </a>
            </div>
          </div>

          <!-- Benefit 4: Wholesaler & Bulk Buying Benefits -->
          <div class="of-card">
            <div>
              <div class="of-card-top">
                <span class="of-card-badge of-badge-indigo">
                  পাইকারি ক্রেতাদের জন্য
                </span>
                <span style="font-size: 24px;">🏬</span>
              </div>

              <h3 class="of-card-title">
                হোলসেলার ও পাইকারি রেট সুবিধা
              </h3>

              <p class="of-card-desc">
                দোকানদার, পাইকারি ব্যবসায়ী ও করপোরেট ক্লায়েন্টদের জন্য সরাসরি ইমপোর্টার রেটে সর্বনিম্ন পাইকারি মূল্যে পণ্য ক্রয়ের বিশেষ সুবিধা।
              </p>

              <div class="of-card-bullets">
                <div class="of-card-bullet">
                  <span style="color: #6366f1; font-weight: 800;">✓</span>
                  <span>রিটেইল দামের চেয়ে অনেক কম আকর্ষণীয় পাইকারি রেট</span>
                </div>
                <div class="of-card-bullet">
                  <span style="color: #6366f1; font-weight: 800;">✓</span>
                  <span>স্বল্প মিনিমাম অর্ডার কোয়ান্টিটি (MOQ) দিয়ে শুরু করার সুযোগ</span>
                </div>
                <div class="of-card-bullet">
                  <span style="color: #6366f1; font-weight: 800;">✓</span>
                  <span>অফিশিয়াল ভেন্ডর ক্যাশ মেমো ও ফাস্ট ট্র্যাক কুরিয়ার ডেলিভারি</span>
                </div>
              </div>
            </div>

            <div class="of-btn-row">
              <a href="/wholesaler/register" class="of-btn-main of-btn-indigo">
                হোলসেলার অ্যাকাউন্ট খুলুন →
              </a>
              <a href="/wholesaler/login" class="of-btn-alt">
                লগইন
              </a>
            </div>
          </div>

        </div>
      </div>

      <!-- Section: Platform Core Advantages & Guarantee Grid -->
      <div class="of-section">
        <div class="of-section-header">
          <span class="of-section-icon">🛡️</span>
          <h2 class="of-section-title">
            ড্রিম কার্ট বিডি-র সার্বক্ষণিক গ্রাহক সুবিধাসমূহ
          </h2>
        </div>

        <div class="of-benefits-grid">
          
          <!-- Benefit 5: 100% Genuine & 1-Year Warranty -->
          <div class="of-benefit-card">
            <div>
              <div class="of-icon-box of-icon-green">
                🛡️
              </div>
              <h3 class="of-benefit-title">১০০% জেনুইন ও ১ বছরের অফিশিয়াল ওয়ারেন্টি</h3>
              <p class="of-benefit-desc">
                আমাদের প্রতিটি ব্র্যান্ডেড গ্যাজেট ও স্মার্টওয়াচ সম্পূর্ণ আসল ও অথেনটিক। পাচ্ছেন ১ বছরের ব্র্যান্ড ওয়ারেন্টি।
              </p>
            </div>
            <div class="of-benefit-tag">
              ✓ অরিজিনাল সিকিউরিটি সিল নিশ্চিত
            </div>
          </div>

          <!-- Benefit 6: 7 Days Easy Replacement -->
          <div class="of-benefit-card">
            <div>
              <div class="of-icon-box of-icon-amber">
                🔄
              </div>
              <h3 class="of-benefit-title">৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি</h3>
              <p class="of-benefit-desc">
                পণ্য হাতে পাওয়ার পর কোনো ত্রুটি বা সমস্যা পরিলক্ষিত হলে ৭ দিনের মধ্যে দ্রুততম সময়ে ফ্রি রিপ্লেসমেন্ট সুবিধা।
              </p>
            </div>
            <div class="of-benefit-tag" style="color: #d97706;">
              ✓ কোনো লুকায়িত শর্ত বা অতিরিক্ত ফি নেই
            </div>
          </div>

          <!-- Benefit 7: Cash on Delivery Nationwide -->
          <div class="of-benefit-card">
            <div>
              <div class="of-icon-box of-icon-teal">
                💵
              </div>
              <h3 class="of-benefit-title">সারা দেশে ক্যাশ অন ডেলিভারি (COD)</h3>
              <p class="of-benefit-desc">
                কোনো অগ্রিম জামানত ছাড়াই পণ্য হাতে পেয়ে যাচাই করে সম্পূর্ণ মূল্য পরিশোধের ১০০% নিরাপদ ও নির্ভরযোগ্য ব্যবস্থা।
              </p>
            </div>
            <div class="of-benefit-tag" style="color: #0d9488;">
              ✓ ৬৪ জেলার সকল উপজেলা ও থানায় প্রযোজ্য
            </div>
          </div>

          <!-- Benefit 8: Cumilla Hub Express Dispatch -->
          <div class="of-benefit-card">
            <div>
              <div class="of-icon-box of-icon-blue">
                🚀
              </div>
              <h3 class="of-benefit-title">পদুয়ার বাজার হাব থেকে এক্সপ্রেস ডিসপ্যাচ</h3>
              <p class="of-benefit-desc">
                নিজস্ব ওয়্যারহাউস থেকে অর্ডার গ্রহণের সাথে সাথে মান পরীক্ষা ও প্যাকিং করে দ্রুততম কুরিয়ার নেটওয়ার্কে হস্তান্তর।
              </p>
            </div>
            <div class="of-benefit-tag" style="color: #2563eb;">
              ✓ Steadfast / Pathao লাইভ ট্র্যাকিং সহ
            </div>
          </div>

          <!-- Benefit 9: 24/7 Dedicated Customer Care & WhatsApp -->
          <div class="of-benefit-card">
            <div>
              <div class="of-icon-box of-icon-rose">
                💬
              </div>
              <h3 class="of-benefit-title">হোয়াটসঅ্যাপ ও সরাসরি হটলাইন সাপোর্ট</h3>
              <p class="of-benefit-desc">
                যেকোনো পণ্য বা অর্ডার সংক্রান্ত তথ্যে প্রতিদিন সকাল ৮:০০ থেকে রাত ১০:০০ টা পর্যন্ত লাইভ কাস্টমার কেয়ার সাপোর্ট।
              </p>
            </div>
            <div class="of-benefit-tag" style="color: #e11d48;">
              ✓ হটলাইন: 01581703822, 01818273838
            </div>
          </div>

          <!-- Benefit 10: Physical Outlet & Showroom Visit -->
          <div class="of-benefit-card">
            <div>
              <div class="of-icon-box of-icon-purple">
                🏢
              </div>
              <h3 class="of-benefit-title">সরাসরি শোরুম ভিজিট করে কেনার সুযোগ</h3>
              <p class="of-benefit-desc">
                অনলাইনের পাশাপাশি আমাদের অফিশিয়াল শোরুমে এসে নিজে দেখে পণ্য পরীক্ষা করে সরাসরি ক্রয়ের সুবর্ণ সুযোগ।
              </p>
            </div>
            <div class="of-benefit-tag" style="color: #9333ea;">
              ✓ চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড, কুমিল্লা
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom Interactive Call to Action Banner -->
      <div class="of-cta-banner">
        <div>
          <h3 class="of-cta-title">
            পছন্দের পণ্যটি আজই অর্ডার করুন এবং সকল সুবিধা উপভোগ করুন!
          </h3>
          <p class="of-cta-desc">
            স্মার্টওয়াচ, অর্গানিক হেলথ ফুড, ট্যাকটিক্যাল লাইট কিংবা কিচেন সেফটি এক্সেসরিজ — সেরা মূল্যে ১০০% জেনুইন পণ্য পেতে ড্রিম কার্ট বিডি-র সাথেই থাকুন।
          </p>
        </div>

        <div class="of-cta-actions">
          <a href="/products" class="of-cta-btn-white">
            <span>🛍️</span> শপ ব্রাউজ করুন →
          </a>
          <a href="/chat" class="of-cta-btn-glass">
            <span>💬</span> লাইভ চ্যাট
          </a>
        </div>
      </div>

    </div>
  `;
}
