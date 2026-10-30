/**
 * DREAM CART BD — DEDICATED HIGH-CONVERSION CAMPAIGN LANDING PAGE (LandingPage.js)
 * Implements a 100% standalone landing page completely faithful to the user's uploaded PDF demo:
 *   - Completely independent layout: ZERO navigation bar, ZERO footer, ZERO mobile nav dock.
 *   - Top Forest Green announcement bar with live real-time countdown timer (Days, Hours, Mins, Secs).
 *   - High-impact offer & gift highlight banner with prices, emojis and free gifts.
 *   - High-res product showcase hero image + prominent "🛒 এখনই অর্ডার করুন" scroll CTA button.
 *   - Feature badge pills with green checkmarks.
 *   - Structured "বিস্তারিত বিবরণ" (Detailed Description) and "পণ্যের বৈশিষ্ট্য" (Specifications) boxes.
 *   - Multi-angle model photo showcase gallery.
 *   - WhatsApp customer review chat cards with rating and pagination.
 *   - Secondary CTA button & limited-time offer strip.
 *   - Two-Column Order Checkout Form (Page 3 of PDF):
 *       * Left: "আপনার অফার চেক করুন" with package radio/checkboxes, interactive color & size selector pills, live order summary table with quantity stepper, free delivery, and Cash on Delivery guarantee.
 *       * Right: "ডেলিভারির জন্য ঠিকানা দিন" with Name, Phone (+88), Area selection, and Complete Address.
 *   - Direct contact bar at the bottom with Phone number, "সরাসরি কল করুন" and "হোয়াটসঅ্যাপে মেসেজ দিন" buttons.
 *   - Fully dynamic: Supports custom Landing Pages created via Admin CMS (+ নতুন ল্যান্ডিং পেজ তৈরি করুন).
 */

import { apiClient, getGlobalDeliveryMethods, getGlobalSiteSettings, formatCurrency } from '../../api/client.js';
import { toast } from '../../components/Toast.js';

// Global state for interactive package & options selection on the landing page
if (typeof window !== 'undefined') {
  window.__lpSelectedPackage = window.__lpSelectedPackage || 1;
  window.__lpSelectedColor = window.__lpSelectedColor || 'Black';
  window.__lpSelectedSize = window.__lpSelectedSize || '52';
  window.__lpQuantity = window.__lpQuantity || 1;

  window.selectLpPackage = function(pkgNum, price, title, thumb) {
    window.__lpSelectedPackage = pkgNum;
    window.__lpPackagePrice = price;
    window.__lpPackageTitle = title;
    if (thumb) window.__lpPackageThumb = thumb;

    // Toggle active classes on package cards
    document.querySelectorAll('.lp-pkg-card').forEach(el => {
      const p = Number(el.getAttribute('data-pkg'));
      const radio = el.querySelector('input[type="radio"], input[type="checkbox"]');
      if (p === pkgNum) {
        el.classList.add('lp-pkg-active');
        if (radio) radio.checked = true;
      } else {
        el.classList.remove('lp-pkg-active');
        if (radio) radio.checked = false;
      }
    });

    window.updateLpOrderSummary();
  };

  window.selectLpColor = function(colorName, btn) {
    window.__lpSelectedColor = colorName;
    document.querySelectorAll('.lp-color-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const lbl = document.getElementById('lp-summary-color-label');
    if (lbl) lbl.textContent = colorName;
  };

  window.selectLpSize = function(sizeVal, btn) {
    window.__lpSelectedSize = sizeVal;
    document.querySelectorAll('.lp-size-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const lbl = document.getElementById('lp-summary-size-label');
    if (lbl) lbl.textContent = sizeVal;
  };

  window.stepLpQty = function(delta) {
    window.__lpQuantity = Math.max(1, (window.__lpQuantity || 1) + delta);
    const qtyEl = document.getElementById('lp-qty-val');
    if (qtyEl) qtyEl.textContent = window.__lpQuantity;
    window.updateLpOrderSummary();
  };

  window.updateLpOrderSummary = function() {
    const pkgPrice = Number(window.__lpPackagePrice || 2599);
    const qty = Number(window.__lpQuantity || 1);
    const areaSel = document.getElementById('lp-cust-area');
    const baseDelivery = Number(areaSel?.selectedOptions?.[0]?.getAttribute('data-charge') || 0);

    const subtotal = pkgPrice * qty;
    // Free delivery promotion per PDF demo
    const delivery = 0;
    const grandTotal = subtotal + delivery;

    const subEl = document.getElementById('lp-calc-subtotal');
    const delEl = document.getElementById('lp-calc-delivery');
    const grandEl = document.getElementById('lp-calc-grand');
    const titleEl = document.getElementById('lp-summary-prod-title');
    const itemTotalEl = document.getElementById('lp-summary-item-total');

    if (subEl) subEl.textContent = `৳ ${subtotal}`;
    if (delEl) delEl.innerHTML = `<span class="text-emerald-700 font-bold">+ ৳ 0 (ফ্রি)</span>`;
    if (grandEl) grandEl.textContent = `৳ ${grandTotal}`;
    if (titleEl && window.__lpPackageTitle) titleEl.textContent = window.__lpPackageTitle;
    if (itemTotalEl) itemTotalEl.textContent = `৳ ${subtotal}`;
  };

  window.scrollToLpOrder = function() {
    const el = document.getElementById('lp-checkout-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  window.submitLpOrderForm = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = (document.getElementById('lp-cust-name')?.value || '').trim();
    const phone = (document.getElementById('lp-cust-phone')?.value || '').trim();
    const areaSel = document.getElementById('lp-cust-area');
    const areaText = areaSel?.selectedOptions?.[0]?.textContent?.trim() || 'ঢাকা সিটির ভিতরে';
    const address = (document.getElementById('lp-cust-address')?.value || '').trim();

    if (!name) {
      toast.error('অনুগ্রহ করে আপনার নাম লিখুন।');
      document.getElementById('lp-cust-name')?.focus();
      return;
    }
    if (!phone || phone.replace(/[^0-9]/g, '').length < 11) {
      toast.error('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।');
      document.getElementById('lp-cust-phone')?.focus();
      return;
    }
    if (!address) {
      toast.error('অনুগ্রহ করে আপনার সম্পূর্ণ ঠিকানা লিখুন।');
      document.getElementById('lp-cust-address')?.focus();
      return;
    }

    const pkgNum = window.__lpSelectedPackage || 1;
    const pkgPrice = Number(window.__lpPackagePrice || 2599);
    const qty = Number(window.__lpQuantity || 1);
    const color = window.__lpSelectedColor || 'Black';
    const size = window.__lpSelectedSize || '52';
    const title = window.__lpPackageTitle || 'ভাইরাল জুলেখা ফুল সেট বোরকা ভার্সন ২';

    const grandTotal = pkgPrice * qty;
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const submitBtn = document.getElementById('lp-submit-btn');
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ অর্ডার প্রসেস হচ্ছে...</span>';
    }

    const orderPayload = {
      order_id: orderId,
      orderId: orderId,
      customer_name: name,
      phone: phone,
      address: `${address} [এরিয়া: ${areaText}]`,
      products: `${title} (রং: ${color}, সাইজ: ${size}) x${qty}`,
      product_name: title,
      color: color,
      size: size,
      quantity: qty,
      unit_price: pkgPrice,
      total_amount: grandTotal,
      delivery_fee: 0,
      payment_method: 'ক্যাশ অন ডেলিভারি (COD)',
      payment_status: 'Pending',
      order_status: 'Order Placed',
      account_type: 'Landing Page Campaign',
      items: [
        {
          sku: 'LP-BURQA-02',
          name: title,
          color: color,
          size: size,
          quantity: qty,
          price: pkgPrice
        }
      ]
    };

    try {
      const res = await apiClient.request('orders/create', orderPayload);
      toast.success(`ধন্যবাদ ${name}! আপনার অর্ডার (#${orderId}) সফলভাবে জমা হয়েছে।`, 'অর্ডার কনফার্ম হয়েছে');

      // Navigate to order success page
      setTimeout(() => {
        if (window.router && window.router.navigate) {
          window.router.navigate(`/order-success?orderId=${encodeURIComponent(orderId)}`);
        } else {
          window.location.href = `/order-success?orderId=${encodeURIComponent(orderId)}`;
        }
      }, 700);
    } catch (err) {
      toast.error('অর্ডার সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    }
  };

  // Live countdown timer logic
  window.initLpCountdown = function() {
    function updateTimer() {
      // Countdown based on end of current month + 46 days demo
      const now = new Date().getTime();
      let target = window.__lpCountdownTarget;
      if (!target) {
        target = now + (46 * 24 * 60 * 60 * 1000) + (6 * 60 * 60 * 1000) + (27 * 60 * 1000);
        window.__lpCountdownTarget = target;
      }

      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = document.getElementById('lp-cd-days');
      const hEl = document.getElementById('lp-cd-hours');
      const mEl = document.getElementById('lp-cd-mins');
      const sEl = document.getElementById('lp-cd-secs');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    }

    updateTimer();
    if (window.__lpCdInterval) clearInterval(window.__lpCdInterval);
    window.__lpCdInterval = setInterval(updateTimer, 1000);
  };
}

export async function renderLandingPage(params = {}) {
  // Hide global chrome elements to guarantee zero nav / zero footer
  if (typeof document !== 'undefined') {
    const headerMount = document.getElementById('header-mount');
    const footerMount = document.getElementById('footer-mount');
    const mobileNavMount = document.getElementById('mobilenav-mount');
    const floatingActionsMount = document.getElementById('floatingactions-mount');
    const appContainer = document.getElementById('app-content');

    if (headerMount) headerMount.style.display = 'none';
    if (footerMount) footerMount.style.display = 'none';
    if (mobileNavMount) mobileNavMount.style.display = 'none';
    if (floatingActionsMount) floatingActionsMount.style.display = 'none';
    if (appContainer) appContainer.className = 'w-full min-h-screen p-0 m-0';
  }

  // Load configured Landing Page if requested via slug or query params
  const [prodRes, lpRes] = await Promise.all([
    apiClient.request('products/list'),
    apiClient.request('landing_pages/list')
  ]);

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const reqSlug = String(
    params.slug ||
    params.page ||
    searchParams.get('page') ||
    searchParams.get('slug') ||
    searchParams.get('id') ||
    ''
  ).trim().toLowerCase();

  const allLps = (lpRes?.data?.items) || apiClient.loadLocal('dcbd_landing_pages', []) || [];
  let customPage = null;
  if (reqSlug) {
    customPage = allLps.find(p => {
      const s = String(p.slug || '').trim().toLowerCase();
      const id = String(p.id || p.page_id || '').trim().toLowerCase();
      return s === reqSlug || id === reqSlug || s.includes(reqSlug);
    });
  }

  // Site Settings for direct contact hotlines
  const siteSettings = getGlobalSiteSettings();
  const contactPhone = siteSettings.hotline1 || '01317371670';
  const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
  const intlPhone = cleanPhone.startsWith('88') ? cleanPhone : ('88' + cleanPhone);

  // Default flagship data matching user's PDF demo
  const mainTitle = customPage?.title || 'ভাইরাল জুলেখা ফুল সেট বোরকা ভার্সন ২ | দুবাই চেরি কাপড় | হিজাব ও নিকাবসহ';
  const regularPrice = customPage?.regular_price ? Number(customPage.regular_price) : 3200;
  const offerPrice = customPage?.offer_price ? Number(customPage.offer_price) : 2599;

  // Base path for asset resolution
  const appBase = (typeof window !== 'undefined' && window.__APP_BASE__) ? window.__APP_BASE__ : '';
  const burqaMainImg = customPage?.hero_banner || `${appBase}/landing-assets/burqa-main.png`;
  const burqaGallery1 = `${appBase}/landing-assets/burqa-gallery-1.png`;
  const burqaGallery2 = `${appBase}/landing-assets/burqa-gallery-2.png`;
  const burqaGallery3 = `${appBase}/landing-assets/burqa-gallery-3.png`;

  const review1 = `${appBase}/landing-assets/review-1.png`;
  const review2 = `${appBase}/landing-assets/review-2.png`;
  const review3 = `${appBase}/landing-assets/review-3.png`;
  const review4 = `${appBase}/landing-assets/review-4.png`;
  const review5 = `${appBase}/landing-assets/review-5.png`;

  // Initialize global order prices for calculation
  if (typeof window !== 'undefined') {
    window.__lpPackagePrice = offerPrice;
    window.__lpPackageTitle = 'ভাইরাল জুলেখা ফুল সেট বোরকা ভার্সন ২';
    window.__lpSelectedPackage = 1;
    setTimeout(() => {
      if (window.initLpCountdown) window.initLpCountdown();
      if (window.updateLpOrderSummary) window.updateLpOrderSummary();
    }, 150);
  }

  return `
    <!-- SCOPED STANDALONE LANDING PAGE STYLES -->
    <style id="dcbd-lp-standalone-styles">
      .lp-root {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background-color: #f6f5ef;
        color: #1f2937;
        margin: 0;
        padding: 0;
        width: 100%;
        overflow-x: hidden;
      }
      .lp-container {
        max-width: 940px;
        margin: 0 auto;
        padding: 0 16px;
      }

      /* Top Forest Green Bar */
      .lp-top-bar {
        background-color: #0b4d3c;
        color: #ffffff;
        padding: 10px 16px;
      }
      .lp-countdown-box {
        background-color: #06392c;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 6px;
        padding: 4px 8px;
        min-width: 44px;
        text-align: center;
      }
      .lp-countdown-val {
        font-size: 15px;
        font-weight: 800;
        line-height: 1.1;
        color: #ffffff;
        font-family: monospace;
      }
      .lp-countdown-lbl {
        font-size: 9px;
        color: #a7f3d0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Highlight Promo Card */
      .lp-promo-card {
        background: #ffffff;
        border-radius: 14px;
        padding: 16px 20px;
        text-align: center;
        margin: 18px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        border: 1px solid #ebd9c8;
      }

      /* Red Action Buttons */
      .lp-btn-cta {
        background: linear-gradient(180deg, #e11d48 0%, #be123c 100%);
        color: #ffffff !important;
        font-weight: 800;
        font-size: 15px;
        padding: 12px 32px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 14px rgba(190, 18, 60, 0.4);
        transition: all 0.2s ease;
        text-decoration: none;
        cursor: pointer;
        border: none;
      }
      .lp-btn-cta:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(190, 18, 60, 0.55);
        background: linear-gradient(180deg, #f43f5e 0%, #be123c 100%);
      }

      /* Feature Badge Pills */
      .lp-feature-pill {
        background: #ffffff;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 8px 14px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 700;
        color: #374151;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      /* Section Cards */
      .lp-card-section {
        background: #ffffff;
        border-radius: 14px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        border: 1px solid #e5e7eb;
        margin-bottom: 20px;
      }
      .lp-section-heading {
        color: #1f2937;
        font-size: 18px;
        font-weight: 800;
        text-align: center;
        margin-bottom: 16px;
        position: relative;
        padding-bottom: 8px;
      }
      .lp-section-heading::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 48px;
        height: 2px;
        background: #10b981;
        border-radius: 2px;
      }

      /* Specification Grid */
      .lp-spec-row {
        display: flex;
        padding: 8px 0;
        border-bottom: 1px dashed #e5e7eb;
        font-size: 13px;
        line-height: 1.5;
      }
      .lp-spec-label {
        font-weight: 800;
        color: #111827;
        width: 130px;
        flex-shrink: 0;
      }
      .lp-spec-val {
        color: #4b5563;
        flex: 1;
      }

      /* Package Checkbox Card */
      .lp-pkg-card {
        background: #ffffff;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 12px 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .lp-pkg-card.lp-pkg-active {
        border-color: #059669;
        background-color: #f0fdf4;
      }

      /* Option Pills (Color / Size) */
      .lp-pill-btn {
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        border: 1px solid #d1d5db;
        background: #ffffff;
        color: #374151;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .lp-pill-btn.active {
        background-color: #111827;
        color: #ffffff;
        border-color: #111827;
      }

      /* Contact Support Bar */
      .lp-contact-bar {
        background: #ffffff;
        border-radius: 14px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        border: 1px solid #e5e7eb;
        margin-top: 24px;
      }
      .lp-btn-call {
        background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
        color: #ffffff !important;
        font-weight: 700;
        font-size: 13px;
        padding: 10px 24px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        transition: transform 0.2s ease;
      }
      .lp-btn-wa {
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff !important;
        font-weight: 700;
        font-size: 13px;
        padding: 10px 24px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        transition: transform 0.2s ease;
      }
      .lp-btn-call:hover, .lp-btn-wa:hover {
        transform: translateY(-2px);
      }
    </style>

    <div class="lp-root min-h-screen pb-16">

      <!-- =================================================================== -->
      <!-- 1. TOP ANNOUNCEMENT BAR & REAL-TIME COUNTDOWN TIMER (PAGE 1)        -->
      <!-- =================================================================== -->
      <header class="lp-top-bar shadow-sm">
        <div class="lp-container flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div class="text-xs sm:text-[13px] font-bold text-center sm:text-left leading-tight text-white flex-1">
            🌸 ${mainTitle} 🌸
          </div>

          <div class="flex items-center gap-1.5 flex-shrink-0">
            <div class="lp-countdown-box">
              <div class="lp-countdown-val" id="lp-cd-days">46</div>
              <div class="lp-countdown-lbl">Days</div>
            </div>
            <div class="lp-countdown-box">
              <div class="lp-countdown-val" id="lp-cd-hours">06</div>
              <div class="lp-countdown-lbl">Hours</div>
            </div>
            <div class="lp-countdown-box">
              <div class="lp-countdown-val" id="lp-cd-mins">27</div>
              <div class="lp-countdown-lbl">Mins</div>
            </div>
            <div class="lp-countdown-box">
              <div class="lp-countdown-val" id="lp-cd-secs">43</div>
              <div class="lp-countdown-lbl">Secs</div>
            </div>
          </div>

        </div>
      </header>

      <main class="lp-container pt-4">

        <!-- =================================================================== -->
        <!-- 2. HIGH-IMPACT OFFER & GIFT HIGHLIGHT STRIP (PAGE 1)                -->
        <!-- =================================================================== -->
        <div class="lp-promo-card">
          <div class="text-emerald-700 font-extrabold text-sm sm:text-base mb-1.5 flex items-center justify-center gap-1 flex-wrap">
            <span>🌸</span>
            <span>অরিজিনাল দুবাই চেরি কাপড়ের সম্পূর্ণ সেট</span>
            <span>🌸</span>
          </div>

          <div class="text-sm sm:text-base font-black text-slate-800 my-1 leading-relaxed">
            ✨ নিয়মিত মূল্য: <span class="line-through text-slate-400 font-bold">${regularPrice.toLocaleString('bn-BD')} টাকা</span>
            <span class="mx-2 text-rose-600">🎉 অফার মূল্য: মাত্র ${offerPrice.toLocaleString('bn-BD')} টাকা!</span>
          </div>

          <div class="text-xs sm:text-sm font-bold text-slate-700 mt-2 flex items-center justify-center gap-2 flex-wrap">
            <span>🎁 সাথে থাকছে সম্পূর্ণ ফ্রি উপহার:</span>
            <span class="text-emerald-600 font-black">✅ ১ সেট হাতমোজা</span>
            <span class="text-emerald-600 font-black">✅ ১ সেট পায়ের মোজা</span>
            <span class="text-rose-600 font-black">🚚 ডেলিভারি চার্জ সম্পূর্ণ ফ্রি! 🎁❤️</span>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- 3. HERO PRODUCT SHOWCASE IMAGE (PAGE 1)                             -->
        <!-- =================================================================== -->
        <div class="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white mb-6">
          <img 
            src="${burqaMainImg}" 
            alt="${mainTitle}" 
            class="w-full h-auto object-contain max-h-[580px] mx-auto bg-slate-50"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200';"
          />
        </div>

        <!-- CTA Button 1 -->
        <div class="text-center my-6">
          <button type="button" onclick="window.scrollToLpOrder()" class="lp-btn-cta text-base py-3 px-8">
            <span>🛒 এখনই অর্ডার করুন</span>
          </button>
        </div>

        <!-- =================================================================== -->
        <!-- 4. FEATURE BADGE PILLS & BENEFIT SUMMARY (PAGE 1)                   -->
        <!-- =================================================================== -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div class="lp-feature-pill">
            <span class="text-emerald-600 font-black text-sm">✓</span>
            <span>🌸 অরিজিনাল দুবাই চেরি কাপড়ের সম্পূর্ণ সেট 🌸</span>
          </div>
          <div class="lp-feature-pill">
            <span class="text-emerald-600 font-black text-sm">✓</span>
            <span>গাউনের ঘের: ১৬০</span>
          </div>
        </div>

        <div class="text-center text-xs sm:text-sm text-slate-700 font-bold leading-relaxed mb-6 px-2">
          অরিজিনাল দুবাই চেরি কাপড়ের সম্পূর্ণ সেট সারা দেশে ফ্রি হোম ডেলিভারি। সঙ্গে থাকছে ১ সেট হাতমোজা ও পায়ের মোজা সম্পূর্ণ ফ্রি! 🎁❤️<br />
          <span class="text-slate-500 font-medium">হিজাব: ২ পার্ট</span>
        </div>

        <!-- =================================================================== -->
        <!-- 5. বিস্তারিত বিবরণ (DETAILED DESCRIPTION) (PAGE 1)                  -->
        <!-- =================================================================== -->
        <div class="lp-card-section">
          <h2 class="lp-section-heading">বিস্তারিত বিবরণ</h2>
          
          <h3 class="font-extrabold text-base text-slate-900 mb-3 text-center sm:text-left">
            ভাইরাল জুলেখা ফুল সেট বোরকা ভার্সন ২
          </h3>

          <div class="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2.5">
            <p>
              আপনার দৈনন্দিন ব্যবহার, অফিস, কলেজ, মাদ্রাসা কিংবা বিশেষ অনুষ্ঠানের জন্য উপযুক্ত একটি স্টাইলিশ ও আরামদায়ক বোরকা সেট। ভাইরাল জুলেখা ফুল সেট বোরকা ভার্সন ২ তৈরি করা হয়েছে উন্নত মানের প্রিমিয়াম দুবাই চেরি কাপড় দিয়ে।
            </p>
            <p>
              গাউন, হিজাব ও নিকাব—সেটের প্রতিটি অংশই দুবাই চেরি কাপড়ের তৈরি, যা আপনার পোশাকে এনে দেবে মার্জিত ও আকর্ষণীয় লুক।
            </p>
            <p>
              এই ফুল সেটে রয়েছে একটি প্রিমিয়াম দুবাই চেরি কাপড়ের গাউন, ২ পার্ট লং হিজাব (দৈর্ঘ্য ৫০ ইঞ্চি) এবং ৫ পার্টের নিকাব।
            </p>
            <p>
              গাউনের ঘের ১৬০ হওয়ায় এটি পরলে সুন্দর, ফ্লোয়িং ও আকর্ষণীয় লুক তৈরি করে।
            </p>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- 6. পণ্যের বৈশিষ্ট্য (SPECIFICATIONS BOX) (PAGE 2)                    -->
        <!-- =================================================================== -->
        <div class="lp-card-section">
          <h2 class="lp-section-heading">পণ্যের বৈশিষ্ট্য</h2>

          <div class="divide-y divide-slate-100">
            <div class="lp-spec-row">
              <span class="lp-spec-label">মডেল:</span>
              <span class="lp-spec-val font-bold text-slate-800">ভাইরাল জুলেখা ফুল সেট বোরকা ভার্সন ২</span>
            </div>
            <div class="lp-spec-row">
              <span class="lp-spec-label">গাউন:</span>
              <span class="lp-spec-val">প্রিমিয়াম দুবাই চেরি কাপড়</span>
            </div>
            <div class="lp-spec-row">
              <span class="lp-spec-label">হিজাব:</span>
              <span class="lp-spec-val">প্রিমিয়াম দুবাই চেরি কাপড় (২ পার্ট লং হিজাব)</span>
            </div>
            <div class="lp-spec-row">
              <span class="lp-spec-label">হিজাবের দৈর্ঘ্য:</span>
              <span class="lp-spec-val">৫০ ইঞ্চি</span>
            </div>
            <div class="lp-spec-row">
              <span class="lp-spec-label">নিকাব:</span>
              <span class="lp-spec-val">প্রিমিয়াম দুবাই চেরি কাপড়ের ৫ পার্ট নিকাব</span>
            </div>
            <div class="lp-spec-row">
              <span class="lp-spec-label">গাউনের ঘের:</span>
              <span class="lp-spec-val font-bold text-emerald-700">১৬০ ইঞ্চি ফ্লোয়িং ঘের</span>
            </div>
            <div class="lp-spec-row">
              <span class="lp-spec-label">ডিজাইন:</span>
              <span class="lp-spec-val">স্টাইলিশ, মার্জিত ও শালীন ডিজাইন</span>
            </div>
            <div class="lp-spec-row">
              <span class="lp-spec-label">ব্যবহার:</span>
              <span class="lp-spec-val">দৈনন্দিন ব্যবহার ও বিশেষ অনুষ্ঠানের জন্য উপযোগী</span>
            </div>
            <div class="lp-spec-row">
              <span class="lp-spec-label">ডেলিভারি:</span>
              <span class="lp-spec-val font-bold text-rose-600">সারা বাংলাদেশে সম্পূর্ণ ফ্রি হোম ডেলিভারি</span>
            </div>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- 7. MULTI-ANGLE MODEL GALLERY (PAGE 2)                               -->
        <!-- =================================================================== -->
        <div class="mb-8">
          <div class="text-center font-extrabold text-sm text-slate-800 mb-3">
            ভাইরাল জুলেখা ফুল সেট বোরকা ভার্সন ২ | দুবাই চেরি কাপড় | হিজাব ও নিকাবসহ
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="rounded-xl overflow-hidden shadow-sm border bg-white">
              <img src="${burqaGallery1}" alt="Model Front" class="w-full h-80 object-cover bg-slate-100" onerror="this.onerror=null; this.src='${burqaMainImg}';" />
            </div>
            <div class="rounded-xl overflow-hidden shadow-sm border bg-white">
              <img src="${burqaGallery2}" alt="Model Side" class="w-full h-80 object-cover bg-slate-100" onerror="this.onerror=null; this.src='${burqaMainImg}';" />
            </div>
            <div class="rounded-xl overflow-hidden shadow-sm border bg-white">
              <img src="${burqaGallery3}" alt="Model Back" class="w-full h-80 object-cover bg-slate-100" onerror="this.onerror=null; this.src='${burqaMainImg}';" />
            </div>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- 8. REAL CUSTOMER REVIEWS / WHATSAPP SCREENSHOT SLIDER (PAGE 2)       -->
        <!-- =================================================================== -->
        <div class="lp-card-section">
          <div class="flex items-center justify-between mb-3 border-b pb-2">
            <h2 class="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <span>💬</span> গ্রাহকদের বাস্তব মতামত ও রিভিউ
            </h2>
            <div class="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              8 / 10
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 overflow-x-auto pb-1">
            <div class="rounded-xl overflow-hidden border shadow-sm bg-slate-900">
              <img src="${review1}" alt="Customer Review 1" class="w-full h-44 object-cover" onerror="this.onerror=null; this.src='${burqaMainImg}';" />
            </div>
            <div class="rounded-xl overflow-hidden border shadow-sm bg-slate-900">
              <img src="${review2}" alt="Customer Review 2" class="w-full h-44 object-cover" onerror="this.onerror=null; this.src='${burqaMainImg}';" />
            </div>
            <div class="rounded-xl overflow-hidden border shadow-sm bg-slate-900">
              <img src="${review3}" alt="Customer Review 3" class="w-full h-44 object-cover" onerror="this.onerror=null; this.src='${burqaMainImg}';" />
            </div>
            <div class="rounded-xl overflow-hidden border shadow-sm bg-slate-900">
              <img src="${review4}" alt="Customer Review 4" class="w-full h-44 object-cover" onerror="this.onerror=null; this.src='${burqaMainImg}';" />
            </div>
            <div class="rounded-xl overflow-hidden border shadow-sm bg-slate-900">
              <img src="${review5}" alt="Customer Review 5" class="w-full h-44 object-cover" onerror="this.onerror=null; this.src='${burqaMainImg}';" />
            </div>
          </div>
        </div>

        <!-- CTA Button 2 -->
        <div class="text-center my-6">
          <button type="button" onclick="window.scrollToLpOrder()" class="lp-btn-cta text-base py-3 px-8">
            <span>অর্ডার করতে ক্লিক করুন</span>
          </button>
        </div>

        <!-- Limited Time Strip -->
        <div class="text-center mb-8">
          <div class="inline-block bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-3 py-1 rounded-md mb-2">
            অফারটি সীমিত সময়ের জন্য
          </div>
          <div class="text-xs sm:text-sm font-extrabold text-slate-800">
            Available Size : 50 , 52, 54, 56 &nbsp;&nbsp;✨ নিয়মিত মূল্য: ৩,২০০ টাকা &nbsp;&nbsp;🎉 অফার মূল্য: মাত্র ২,৫৯৯ টাকা!
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- 9. TWO-COLUMN CHECKOUT / ORDER SECTION (PAGE 3)                    -->
        <!-- =================================================================== -->
        <section id="lp-checkout-section" class="scroll-mt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <!-- LEFT COLUMN: আপনার অফার চেক করুন -->
            <div class="bg-white rounded-2xl p-5 shadow-md border border-slate-200">
              <div class="bg-emerald-800 text-white font-extrabold text-xs py-2 px-3.5 rounded-lg mb-4 flex items-center gap-1.5">
                <span>🛒</span>
                <span>আপনার অফার চেক করুন</span>
              </div>

              <div class="text-[11px] font-bold text-slate-600 mb-2.5">
                নিচের বক্সে টিক (✓) দিয়ে পণ্য নির্বাচন করুন
              </div>

              <!-- Package Option 1 (Selected) -->
              <div 
                class="lp-pkg-card lp-pkg-active mb-3" 
                data-pkg="1" 
                onclick="window.selectLpPackage(1, ${offerPrice}, 'ভাইরাল জুলেখা ফুল সেট বোরকা ভার্সন ২')"
              >
                <div class="flex items-start gap-2.5">
                  <input type="radio" name="lp_package" checked class="mt-1 text-emerald-600 focus:ring-emerald-500" />
                  <div class="flex-1">
                    <div class="font-extrabold text-xs text-slate-900 leading-tight">
                      ভাইরাল জুলেখা ফুল সেট বোরকা ভার্সন ২..
                    </div>
                    <div class="text-xs font-black text-slate-900 mt-1">
                      ৳${offerPrice} <span class="line-through text-slate-400 font-normal text-[11px]">৳2700</span>
                    </div>

                    <!-- Color Selector -->
                    <div class="mt-2.5 pt-2 border-t border-slate-100">
                      <div class="text-[10px] font-bold text-slate-600 mb-1">কালার: <span id="lp-summary-color-label" class="text-emerald-700 font-extrabold">Black</span></div>
                      <div class="flex items-center gap-1.5">
                        <button type="button" onclick="event.stopPropagation(); window.selectLpColor('Black', this)" class="lp-pill-btn active lp-color-pill">Black</button>
                        <button type="button" onclick="event.stopPropagation(); window.selectLpColor('Navy Blue', this)" class="lp-pill-btn lp-color-pill">Navy Blue</button>
                        <button type="button" onclick="event.stopPropagation(); window.selectLpColor('Maroon', this)" class="lp-pill-btn lp-color-pill">Maroon</button>
                      </div>
                    </div>

                    <!-- Size Selector -->
                    <div class="mt-2.5">
                      <div class="text-[10px] font-bold text-slate-600 mb-1">সাইজ: <span id="lp-summary-size-label" class="text-emerald-700 font-extrabold">52</span></div>
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <button type="button" onclick="event.stopPropagation(); window.selectLpSize('50', this)" class="lp-pill-btn lp-size-pill">50</button>
                        <button type="button" onclick="event.stopPropagation(); window.selectLpSize('52', this)" class="lp-pill-btn active lp-size-pill">52</button>
                        <button type="button" onclick="event.stopPropagation(); window.selectLpSize('54', this)" class="lp-pill-btn lp-size-pill">54</button>
                        <button type="button" onclick="event.stopPropagation(); window.selectLpSize('56', this)" class="lp-pill-btn lp-size-pill">56</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Package Option 2 (Optional Combo) -->
              <div 
                class="lp-pkg-card mb-4" 
                data-pkg="2" 
                onclick="window.selectLpPackage(2, 1950, 'জুলেখা শুধু হিজাব ও ৫ পার্ট নিকাব..')"
              >
                <div class="flex items-start gap-2.5">
                  <input type="radio" name="lp_package" class="mt-1 text-emerald-600 focus:ring-emerald-500" />
                  <div class="flex-1">
                    <div class="font-bold text-xs text-slate-800 leading-tight">
                      জুলেখা শুধু হিজাব ও ৫ পার্ট নিকাব..
                    </div>
                    <div class="text-xs font-black text-slate-900 mt-1">
                      ৳1950 <span class="line-through text-slate-400 font-normal text-[11px]">৳2000</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Live Order Summary Breakdown Table -->
              <div class="border rounded-xl p-3 bg-slate-50/70 text-xs">
                <div class="grid grid-cols-12 text-[10px] font-bold text-slate-400 border-b pb-1.5 mb-2 uppercase">
                  <div class="col-span-6">প্রোডাক্ট</div>
                  <div class="col-span-3 text-center">পরিমাণ</div>
                  <div class="col-span-3 text-right">মূল্য</div>
                </div>

                <div class="grid grid-cols-12 items-center py-1">
                  <div class="col-span-6 pr-1">
                    <div class="font-bold text-slate-900 text-[11px] truncate" id="lp-summary-prod-title">
                      ভাইরাল জুলেখা ফুল সেট বোর...
                    </div>
                    <div class="text-[9px] text-emerald-600 font-extrabold">ফ্রি ডেলিভারি</div>
                  </div>

                  <div class="col-span-3 flex items-center justify-center">
                    <div class="inline-flex items-center border border-slate-300 rounded-md bg-white">
                      <button type="button" onclick="window.stepLpQty(-1)" class="px-2 py-0.5 text-xs font-black text-slate-600 hover:bg-slate-100">−</button>
                      <span id="lp-qty-val" class="px-2 py-0.5 text-[11px] font-bold">1</span>
                      <button type="button" onclick="window.stepLpQty(1)" class="px-2 py-0.5 text-xs font-black text-slate-600 hover:bg-slate-100">+</button>
                    </div>
                  </div>

                  <div class="col-span-3 text-right font-black text-slate-900 text-xs" id="lp-summary-item-total">
                    ৳ ${offerPrice}
                  </div>
                </div>

                <div class="border-t border-slate-200 mt-3 pt-2 space-y-1 text-slate-600">
                  <div class="flex justify-between items-center text-[11px]">
                    <span>পণ্য মূল্য:</span>
                    <span id="lp-calc-subtotal" class="font-bold text-slate-900">৳ ${offerPrice}</span>
                  </div>
                  <div class="flex justify-between items-center text-[11px]">
                    <span>ডেলিভারি চার্জ:</span>
                    <span id="lp-calc-delivery" class="font-bold text-emerald-700">+ ৳ 0 (ফ্রি)</span>
                  </div>
                  <div class="flex justify-between items-center text-xs font-black text-slate-900 pt-1 border-t border-dashed">
                    <span>সর্বমোট মূল্য:</span>
                    <span id="lp-calc-grand" class="text-emerald-700 text-sm">৳ ${offerPrice}</span>
                  </div>
                </div>

                <div class="mt-3 p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold text-center flex items-center justify-center gap-1">
                  <span>💵</span>
                  <span>১০০% ক্যাশ অন ডেলিভারি</span>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: ডেলিভারির জন্য ঠিকানা দিন -->
            <div class="bg-white rounded-2xl p-5 shadow-md border border-slate-200">
              <div class="bg-emerald-800 text-white font-extrabold text-xs py-2 px-3.5 rounded-lg mb-4 flex items-center gap-1.5">
                <span>📍</span>
                <span>ডেলিভারির জন্য ঠিকানা দিন</span>
              </div>

              <form onsubmit="window.submitLpOrderForm(event)" class="space-y-3.5 text-xs">
                
                <div>
                  <label class="block font-bold text-slate-700 mb-1">
                    আপনার নাম <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="lp-cust-name" 
                    required 
                    placeholder="উদাঃ মোঃ রিমন" 
                    class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-medium"
                  />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 mb-1">
                    মোবাইল নাম্বার <span class="text-rose-500">*</span>
                  </label>
                  <div class="flex rounded-lg border border-slate-300 overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                    <span class="bg-slate-100 text-slate-600 px-2.5 py-2 text-xs font-bold border-r border-slate-300 flex items-center">
                      +88
                    </span>
                    <input 
                      type="tel" 
                      id="lp-cust-phone" 
                      required 
                      placeholder="01XXXXXXXXX" 
                      class="w-full py-2 px-3 text-xs font-mono font-bold border-none focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 mb-1">
                    এরিয়া নির্বাচন করুন <span class="text-rose-500">*</span>
                  </label>
                  <select 
                    id="lp-cust-area" 
                    onchange="window.updateLpOrderSummary()" 
                    class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold bg-white"
                  >
                    <option value="dhaka" data-charge="0">ঢাকা সিটির ভিতরে (ফ্রি হোম ডেলিভারি)</option>
                    <option value="outside" data-charge="0">ঢাকা সিটির বাইরে সমগ্র বাংলাদেশ (ফ্রি ডেলিভারি)</option>
                    <option value="cumilla" data-charge="0">কুমিল্লা সদর ও জেলা (ফ্রি ডেলিভারি)</option>
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 mb-1">
                    সম্পূর্ণ ঠিকানা <span class="text-rose-500">*</span>
                  </label>
                  <textarea 
                    id="lp-cust-address" 
                    rows="3" 
                    required 
                    placeholder="বাসা নং, রাস্তা নং, গ্রাম/মহল্লা, থানা, জেলা" 
                    class="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-medium"
                  ></textarea>
                </div>

                <div class="pt-2">
                  <button 
                    type="submit" 
                    id="lp-submit-btn" 
                    class="w-full lp-btn-cta py-3.5 text-sm rounded-xl font-black shadow-lg"
                  >
                    <span>✓ অর্ডার কনফার্ম করুন</span>
                  </button>
                </div>

              </form>
            </div>

          </div>
        </section>

        <!-- =================================================================== -->
        <!-- 10. DIRECT CONTACT & SUPPORT BAR (PAGE 3)                           -->
        <!-- =================================================================== -->
        <div class="lp-contact-bar">
          <div class="text-xs font-bold text-slate-500 mb-1">তথ্যের জন্য যোগাযোগ করুন</div>
          <div class="font-black text-slate-900 text-base sm:text-lg mb-3 tracking-wide">
            +${intlPhone}
          </div>

          <div class="flex items-center justify-center gap-3 flex-wrap">
            <a href="tel:+${intlPhone}" class="lp-btn-call">
              <span>📞 সরাসরি কল করুন</span>
            </a>

            <a href="https://wa.me/${intlPhone}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি ভাইরাল জুলেখা ফুল সেট বোরকা সম্পর্কে জানতে চাই।')}" target="_blank" rel="noopener noreferrer" class="lp-btn-wa">
              <span>💬 হোয়াটসঅ্যাপে মেসেজ দিন</span>
            </a>
          </div>

          <div class="mt-3 text-[11px] text-slate-400">
            নিকাব: ৫ পার্ট &bull; হিজাব: ২ পার্ট &bull; গাউনের ঘের: ১৬০
          </div>
        </div>

      </main>
    </div>
  `;
}
