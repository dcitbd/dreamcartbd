/**
 * DREAM CART BD — ORDER CHECKOUT PAGE (CheckoutPage.js)
 * Implements user requirements:
 * - Compact & Fast Checkout with Dropdown Selectors:
 *   - Delivery Area Dropdown (৳70, ৳90, ৳120, Free Pickup)
 *   - Payment Method Dropdown (COD, bKash Personal, bKash Link, Nagad, Rocket, Bank)
 * - Dynamic Payment Method Panels:
 *   - Selecting bKash Personal displays ONLY bKash Personal numbers with 1-click copy & steps.
 *   - Selecting bKash Payment Link displays ONLY bKash Payment gateway button & steps.
 *   - Selecting Nagad Personal displays ONLY Nagad Personal numbers with 1-click copy & steps.
 *   - Selecting Rocket Personal displays ONLY Rocket Personal number with 1-click copy & steps.
 *   - Selecting Bank Transfer displays ONLY Bank Account details with high-contrast text.
 *   - Selecting Cash on Delivery displays ONLY COD instructions (TrxID hidden).
 * - Clean minimal UI: Eliminated nested repetitive borders for a sleek, modern look.
 * - High-contrast text & background harmony for both Light and Dark mode.
 * - Auto-calculate 2,000 BDT free shipping & 5% online prepayment discount.
 * - Full Order submission & validation.
 */

import { cartStore } from '../../store/cartStore.js';
import { authStore } from '../../store/authStore.js';
import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../components/Toast.js';
import { router } from '../../router.js';

// Attach global switcher so dropdown selection updates instantaneously
if (typeof window !== 'undefined') {
  window.switchCheckoutPayment = function(method) {
    if (!method) return;

    if (cartStore && cartStore.setPaymentMethod) {
      cartStore.setPaymentMethod(method);
    }

    // 1. Toggle method-specific panels
    const panels = document.querySelectorAll('.payment-method-panel');
    panels.forEach(p => {
      if (p.id === 'payment-panel-' + method) {
        p.classList.remove('hidden');
        p.style.display = 'block';
      } else {
        p.classList.add('hidden');
        p.style.display = 'none';
      }
    });

    // 2. Toggle TrxID input container (Hidden for COD, visible for online payments)
    const trxContainer = document.getElementById('checkout-trxid-container');
    if (trxContainer) {
      if (method === 'COD') {
        trxContainer.classList.add('hidden');
        trxContainer.style.display = 'none';
      } else {
        trxContainer.classList.remove('hidden');
        trxContainer.style.display = 'block';
      }
    }

    // 3. Keep online-payment-details in sync if referenced
    const onlineBox = document.getElementById('online-payment-details');
    if (onlineBox) {
      if (method === 'COD') {
        onlineBox.classList.add('hidden');
        onlineBox.style.display = 'none';
      } else {
        onlineBox.classList.remove('hidden');
        onlineBox.style.display = 'block';
      }
    }
  };

  window.switchDeliveryZone = function(zone) {
    if (!zone) return;
    if (cartStore && cartStore.setDeliveryZone) {
      cartStore.setDeliveryZone(zone);
    }
    const zoneBadge = document.getElementById('delivery-zone-summary-text');
    if (zoneBadge) {
      const zoneNames = {
        'dhaka': 'ঢাকা সিটি (২-৩ দিন)',
        'cumilla': 'কুমিল্লা সদর (১-২ দিন)',
        'outside': 'ঢাকার বাইরে (৩-৫ দিন)',
        'pickup': 'অফিস থেকে পিকআপ (কুমিল্লা)'
      };
      const fee = cartStore.getDeliveryCharge();
      const isFree = cartStore.isFreeDelivery();
      const feeText = isFree ? 'ফ্রি (৳০)' : formatCurrency(fee);
      zoneBadge.textContent = `${zoneNames[zone] || ''} — চার্জ: ${feeText}`;
    }
  };

  // Safe clipboard helper with inline button feedback
  window.copyCheckoutText = function(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showSuccess(btn);
      }).catch(() => fallbackCopy(text, btn));
    } else {
      fallbackCopy(text, btn);
    }
    function fallbackCopy(str, b) {
      const ta = document.createElement('textarea');
      ta.value = str;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showSuccess(b);
    }
    function showSuccess(b) {
      if (!b) return;
      const originalText = b.innerHTML;
      b.innerHTML = '✓ কপি হয়েছে!';
      b.style.backgroundColor = '#059669';
      b.style.color = '#ffffff';
      setTimeout(() => {
        b.innerHTML = originalText;
        b.style.backgroundColor = '';
        b.style.color = '';
      }, 2000);
    }
  };
}

export function renderCheckoutPage() {
  const items = cartStore.items;
  if (items.length === 0) {
    return `
      <div class="py-24 text-center max-w-md mx-auto space-y-4">
        <div class="text-5xl">🛒</div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">আপনার কার্ট খালি</h2>
        <p class="text-xs text-slate-500">অর্ডার করার জন্য অনুগ্রহ করে প্রথমে কার্টে পণ্য যুক্ত করুন।</p>
        <a href="/products" class="btn-primary text-xs py-3 px-6 inline-flex">পণ্য দেখুন →</a>
      </div>
    `;
  }

  const user = authStore.user || {};
  const currentZone = cartStore.deliveryZone || 'dhaka';
  const currentPayment = cartStore.paymentMethod || 'COD';
  const subtotal = cartStore.getSubtotal();
  const deliveryFee = cartStore.getDeliveryCharge();
  const isFreeDelivery = cartStore.isFreeDelivery();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const grandTotal = cartStore.getGrandTotal();

  const zoneNames = {
    'dhaka': 'ঢাকা সিটি (২-৩ দিন)',
    'cumilla': 'কুমিল্লা সদর (১-২ দিন)',
    'outside': 'ঢাকার বাইরে (৩-৫ দিন)',
    'pickup': 'অফিস থেকে পিকআপ (কুমিল্লা)'
  };
  const currentZoneSummary = `${zoneNames[currentZone] || ''} — চার্জ: ${isFreeDelivery ? 'ফ্রি (৳০)' : formatCurrency(deliveryFee)}`;

  return `
    <style>
      /* Clean Modern Checkout Select & Panel Styles */
      .checkout-select {
        width: 100%;
        padding: 0.75rem 1rem;
        border-radius: 0.875rem;
        font-size: 0.875rem;
        font-weight: 600;
        outline: none;
        transition: all 0.2s ease;
        background-color: #ffffff;
        color: #0f172a;
        border: 1px solid #cbd5e1;
        cursor: pointer;
      }
      .checkout-select:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
      }
      .dark .checkout-select {
        background-color: #1e293b !important;
        color: #f8fafc !important;
        border-color: #334155 !important;
      }
      .dark .checkout-select:focus {
        border-color: #059669 !important;
      }
      .dark .checkout-select option {
        background-color: #1e293b;
        color: #f8fafc;
      }
      
      /* Method Details Card - Unified and Clean */
      .pm-detail-surface {
        background-color: #f8fafc;
        color: #0f172a;
        border-radius: 1rem;
        padding: 1rem;
      }
      .dark .pm-detail-surface {
        background-color: #1e293b !important;
        color: #f8fafc !important;
      }

      /* Copyable number block */
      .pm-num-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.65rem 0.85rem;
        border-radius: 0.75rem;
        background-color: #ffffff;
        color: #0f172a;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      }
      .dark .pm-num-chip {
        background-color: #0f172a !important;
        color: #f8fafc !important;
      }

      /* Bank Table */
      .checkout-bank-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.5rem;
        font-size: 0.8125rem;
      }
      .checkout-bank-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.45rem 0.25rem;
        border-bottom: 1px dashed #e2e8f0;
      }
      .dark .checkout-bank-item {
        border-bottom-color: #334155 !important;
      }
      .checkout-bank-item:last-child {
        border-bottom: none;
      }
      .checkout-bank-lbl {
        color: #64748b;
        font-weight: 500;
        font-size: 0.75rem;
      }
      .dark .checkout-bank-lbl {
        color: #94a3b8 !important;
      }
      .checkout-bank-val {
        color: #0f172a;
        font-weight: 700;
        text-align: right;
      }
      .dark .checkout-bank-val {
        color: #f8fafc !important;
      }
    </style>

    <div class="space-y-8 pb-24 max-w-6xl mx-auto">
      
      <!-- Checkout Header -->
      <div class="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <a href="/cart" class="hover:text-emerald-600 transition">কার্ট</a>
          <span>/</span>
          <span class="text-slate-700 dark:text-slate-300 font-bold">অর্ডার সম্পন্ন করুন</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          অর্ডার ও শিপিং ফর্ম (Fast Checkout)
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          নিচের তথ্যগুলো দিয়ে "অর্ডার কনফার্ম করুন" বাটনে ক্লিক করুন। আমাদের প্রতিনিধি আপনার সাথে দ্রুত যোগাযোগ করবেন।
        </p>
      </div>

      <form id="checkout-form" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left: Customer Details, Delivery Zone & Payment Methods (7 cols) -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- 1. Customer Personal & Delivery Information Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs">১</span>
              আপনার তথ্য ও ডেলিভারি ঠিকানা (Customer Info)
            </h3>

            <!-- Customer Name -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                আপনার নাম (Full Name) <span class="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                id="checkout-name" 
                required 
                value="${user.name || user.shop_name || ''}"
                placeholder="আপনার নাম লিখুন" 
                class="form-control text-xs sm:text-sm w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none"
              />
            </div>

            <!-- Mobile Number -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                মোবাইল নম্বর (১১ ডিজিট) <span class="text-rose-500">*</span>
              </label>
              <input 
                type="tel" 
                id="checkout-phone" 
                required 
                pattern="[0-9]{11}" 
                value="${user.mobile || user.phone || ''}"
                placeholder="আপনার ১১ ডিজিটের ফোন নাম্বার দিন!" 
                class="form-control text-xs sm:text-sm w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-mono outline-none"
              />
              <p class="text-[10px] text-slate-400 mt-1">অর্ডার স্ট্যাটাস ও কুরিয়ার ট্র্যাকিং এসএমএস এই নম্বরে পাঠানো হবে।</p>
            </div>

            <!-- Full Delivery Address -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                সম্পূর্ণ ডেলিভারি ঠিকানা (Detailed Address) <span class="text-rose-500">*</span>
              </label>
              <textarea 
                id="checkout-address" 
                required 
                rows="3" 
                placeholder="বাসা নং, রোড নং, এলাকা/গ্রাম, থানা ও জেলা উল্লেখ করুন..." 
                class="form-control text-xs sm:text-sm w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none leading-relaxed"
              >${user.address || ''}</textarea>
            </div>

            <!-- Special Instructions / Color & Size Note -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                কালার, সাইজ বা কোনো বিশেষ নির্দেশনা (Special Instructions / Note)
              </label>
              <textarea 
                id="checkout-note" 
                rows="2" 
                placeholder="পছন্দের কালার, সাইজ বা ডেলিভারির কোনো বিশেষ নোট থাকলে এখানে লিখুন..." 
                class="form-control text-xs sm:text-sm w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none leading-relaxed"
              ></textarea>
            </div>

          </div>

          <!-- 2. Delivery Zone Selection (Clean Modern Dropdown) -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-3.5">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs">২</span>
                ডেলিভারি এরিয়া (Delivery Area)
              </h3>
              <span class="text-[11px] font-bold text-white bg-black px-2.5 py-0.5 rounded-full">
                ${isFreeDelivery ? 'ফ্রি শিপিং প্রযোজ্য' : 'দ্রুত ডেলিভারি'}
              </span>
            </div>

            <div>
              <label for="checkout-delivery-zone" class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                আপনার এলাকা নির্বাচন করুন:
              </label>
              <select 
                id="checkout-delivery-zone" 
                name="delivery_zone" 
                onchange="window.switchDeliveryZone && window.switchDeliveryZone(this.value)"
                class="checkout-select"
              >
                <option value="dhaka" ${currentZone === 'dhaka' ? 'selected' : ''}>
                  ঢাকা সিটি (In Dhaka) — ৳৯০ (২-৩ দিন)
                </option>
                <option value="cumilla" ${currentZone === 'cumilla' ? 'selected' : ''}>
                  কুমিল্লা সদর (In Cumilla) — ৳৭০ (১-২ দিন)
                </option>
                <option value="outside" ${currentZone === 'outside' ? 'selected' : ''}>
                  ঢাকার বাইরে সমগ্র বাংলাদেশ (Outside Dhaka) — ৳১২০ (৩-৫ দিন)
                </option>
                <option value="pickup" ${currentZone === 'pickup' ? 'selected' : ''}>
                  অফিস থেকে পিকআপ (Office Pickup) — ফ্রি ৳০
                </option>
              </select>
            </div>

            <!-- Subtle zone detail pill -->
            <div class="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
              <span>📍</span>
              <span id="delivery-zone-summary-text" class="font-medium">${currentZoneSummary}</span>
            </div>
          </div>

          <!-- 3. Payment Method Selection (Clean Modern Dropdown) -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs">৩</span>
                পেমেন্ট পদ্ধতি নির্বাচন করুন (Payment Method)
              </h3>
              <span class="text-[11px] font-bold text-white bg-black px-2.5 py-0.5 rounded-full">
                অনলাইন পেমেন্টে ৫% ছাড়
              </span>
            </div>

            <!-- Notice for 5% prepayment discount -->
            <div class="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <span class="text-sm">🎁</span>
              <span>বিকাশ, নগদ বা রকেটে অগ্রিম পেমেন্ট করলে পাবেন <strong class="underline font-bold">৫% তাৎক্ষণিক ছাড়!</strong></span>
            </div>

            <!-- Payment Method Dropdown -->
            <div>
              <label for="checkout-payment-method" class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                পেমেন্টের মাধ্যম বেছে নিন:
              </label>
              <select 
                id="checkout-payment-method" 
                name="payment_method" 
                onchange="window.switchCheckoutPayment && window.switchCheckoutPayment(this.value)"
                class="checkout-select font-bold"
              >
                <option value="COD" ${currentPayment === 'COD' ? 'selected' : ''}>
                  💵 ক্যাশ অন ডেলিভারি (Cash on Delivery)
                </option>
                <option value="BKASH_PERSONAL" ${currentPayment === 'BKASH_PERSONAL' ? 'selected' : ''}>
                  🌸 বিকাশ পার্সোনাল (৫% ছাড়)
                </option>
                <option value="BKASH_PAYMENT" ${currentPayment === 'BKASH_PAYMENT' ? 'selected' : ''}>
                  💳 বিকাশ অনলাইন পেমেন্ট লিংক (৫% ছাড়)
                </option>
                <option value="NAGAD_PERSONAL" ${currentPayment === 'NAGAD_PERSONAL' ? 'selected' : ''}>
                  🔥 নগদ পার্সোনাল (৫% ছাড়)
                </option>
                <option value="ROCKET_PERSONAL" ${currentPayment === 'ROCKET_PERSONAL' ? 'selected' : ''}>
                  🚀 রকেট পার্সোনাল (৫% ছাড়)
                </option>
                <option value="BANK" ${currentPayment === 'BANK' ? 'selected' : ''}>
                  🏦 ব্যাংক ট্রান্সফার (৫% ছাড়)
                </option>
              </select>
            </div>

            <!-- ==========================================================================
                 DYNAMIC METHOD-SPECIFIC PAYMENT DETAILS PANELS
                 Only the selected method's details are shown! Clean, unified, zero nested borders.
                 ========================================================================== -->
            <div id="payment-instruction-container" class="space-y-3 pt-1">
              
              <!-- PANEL 1: Cash on Delivery (COD) -->
              <div id="payment-panel-COD" class="payment-method-panel ${currentPayment === 'COD' ? '' : 'hidden'} pm-detail-surface text-xs space-y-2">
                <div class="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  <span>🚚</span>
                  <span>ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                </div>
                <p class="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন। কোনো প্রকার অগ্রিম পেমেন্ট বা TrxID-এর প্রয়োজন নেই।
                </p>
              </div>

              <!-- PANEL 2: bKash Personal -->
              <div id="payment-panel-BKASH_PERSONAL" class="payment-method-panel ${currentPayment === 'BKASH_PERSONAL' ? '' : 'hidden'} pm-detail-surface text-xs space-y-3">
                <div class="flex items-center justify-between pb-1.5 flex-wrap gap-1.5">
                  <div class="flex items-center gap-2 font-bold text-pink-600 dark:text-pink-400 text-sm">
                    <span>🌸</span>
                    <span>বিকাশ পার্সোনাল নম্বর (Send Money)</span>
                  </div>
                  <span class="text-[10px] font-bold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-md">৫% ছাড়</span>
                </div>

                <div class="space-y-2">
                  <div class="pm-num-chip">
                    <div class="flex flex-col">
                      <span class="text-[10px] text-slate-500 dark:text-slate-400">বিকাশ পার্সোনাল নম্বর ১ (মাস্টার):</span>
                      <span class="text-sm font-black font-mono text-pink-600 dark:text-pink-400">01879653143</span>
                    </div>
                    <button type="button" onclick="window.copyCheckoutText('01879653143', this)" class="px-3 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-pink-700 dark:text-pink-300 font-bold text-xs transition cursor-pointer">
                      📋 কপি
                    </button>
                  </div>

                  <div class="pm-num-chip">
                    <div class="flex flex-col">
                      <span class="text-[10px] text-slate-500 dark:text-slate-400">বিকাশ পার্সোনাল নম্বর ২ (অর্ডার ডেস্ক):</span>
                      <span class="text-sm font-black font-mono text-pink-600 dark:text-pink-400">01818273838</span>
                    </div>
                    <button type="button" onclick="window.copyCheckoutText('01818273838', this)" class="px-3 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-pink-700 dark:text-pink-300 font-bold text-xs transition cursor-pointer">
                      📋 কপি
                    </button>
                  </div>
                </div>

                <div class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 space-y-0.5 pt-0.5">
                  <div>১. বিকাশ অ্যাপ বা *247# ডায়াল করে <strong>Send Money</strong> করুন।</div>
                  <div>২. টাকা পাঠানো শেষে পাওয়া <strong>TrxID</strong> নিচের বক্সে লিখুন।</div>
                </div>
              </div>

              <!-- PANEL 3: bKash Payment Link -->
              <div id="payment-panel-BKASH_PAYMENT" class="payment-method-panel ${currentPayment === 'BKASH_PAYMENT' ? '' : 'hidden'} pm-detail-surface text-xs space-y-3">
                <div class="flex items-center justify-between pb-1.5 flex-wrap gap-1.5">
                  <div class="flex items-center gap-2 font-bold text-pink-600 dark:text-pink-400 text-sm">
                    <span>💳</span>
                    <span>অনলাইন পেমেন্ট (Gateway)</span>
                  </div>
                  <span class="text-[10px] font-bold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-md">৫% ছাড়</span>
                </div>

                <div class="space-y-2 text-center">
                  <a 
                    href="https://shop.bkash.com/j-a-sagor-computer01581703822/paymentlink" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs shadow-sm transition active:scale-98"
                  >
                    <span>👉 বিকাশ অনলাইন গেটওয়ে ওপেন করুন (Pay via bKash)</span>
                    <span>↗</span>
                  </a>
                </div>

                <div class="text-[11px] text-slate-600 dark:text-slate-300">
                  পেমেন্ট সফল হওয়ার পর পাওয়া <strong>TrxID</strong> নিচের বক্সে লিখে অর্ডার কনফার্ম করুন।
                </div>
              </div>

              <!-- PANEL 4: Nagad Personal -->
              <div id="payment-panel-NAGAD_PERSONAL" class="payment-method-panel ${currentPayment === 'NAGAD_PERSONAL' ? '' : 'hidden'} pm-detail-surface text-xs space-y-3">
                <div class="flex items-center justify-between pb-1.5 flex-wrap gap-1.5">
                  <div class="flex items-center gap-2 font-bold text-orange-600 dark:text-orange-400 text-sm">
                    <span>🔥</span>
                    <span>নগদ পার্সোনাল নম্বর (Send Money)</span>
                  </div>
                  <span class="text-[10px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-md">৫% ছাড়</span>
                </div>

                <div class="space-y-2">
                  <div class="pm-num-chip">
                    <div class="flex flex-col">
                      <span class="text-[10px] text-slate-500 dark:text-slate-400">নগদ পার্সোনাল নম্বর ১ (মাস্টার):</span>
                      <span class="text-sm font-black font-mono text-orange-600 dark:text-orange-400">01879653143</span>
                    </div>
                    <button type="button" onclick="window.copyCheckoutText('01879653143', this)" class="px-3 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-orange-700 dark:text-orange-300 font-bold text-xs transition cursor-pointer">
                      📋 কপি
                    </button>
                  </div>

                  <div class="pm-num-chip">
                    <div class="flex flex-col">
                      <span class="text-[10px] text-slate-500 dark:text-slate-400">নগদ পার্সোনাল নম্বর ২ (অর্ডার ডেস্ক):</span>
                      <span class="text-sm font-black font-mono text-orange-600 dark:text-orange-400">01818273838</span>
                    </div>
                    <button type="button" onclick="window.copyCheckoutText('01818273838', this)" class="px-3 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-orange-700 dark:text-orange-300 font-bold text-xs transition cursor-pointer">
                      📋 কপি
                    </button>
                  </div>
                </div>

                <div class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 space-y-0.5 pt-0.5">
                  <div>১. নগদ অ্যাপ বা *167# ডায়াল করে <strong>Send Money</strong> করুন।</div>
                  <div>২. টাকা পাঠানো শেষে পাওয়া <strong>TrxID</strong> নিচের বক্সে লিখুন।</div>
                </div>
              </div>

              <!-- PANEL 5: Rocket Personal -->
              <div id="payment-panel-ROCKET_PERSONAL" class="payment-method-panel ${currentPayment === 'ROCKET_PERSONAL' ? '' : 'hidden'} pm-detail-surface text-xs space-y-3">
                <div class="flex items-center justify-between pb-1.5 flex-wrap gap-1.5">
                  <div class="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400 text-sm">
                    <span>🚀</span>
                    <span>রকেট পার্সোনাল নম্বর (Send Money)</span>
                  </div>
                  <span class="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md">৫% ছাড়</span>
                </div>

                <div class="pm-num-chip">
                  <div class="flex flex-col">
                    <span class="text-[10px] text-slate-500 dark:text-slate-400">রকেট নম্বর (১২ ডিজিট):</span>
                    <span class="text-sm font-black font-mono text-purple-600 dark:text-purple-400">01581703822-7</span>
                  </div>
                  <button type="button" onclick="window.copyCheckoutText('015817038227', this)" class="px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 font-bold text-xs transition cursor-pointer">
                    📋 কপি
                  </button>
                </div>

                <div class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 pt-0.5">
                  রকেট অ্যাপ বা *322# ডায়াল করে ১২ ডিজিটের নম্বরে Send Money করে প্রাপ্ত <strong>TrxID</strong> নিচের বক্সে লিখুন।
                </div>
              </div>

              <!-- PANEL 6: Bank Account (High-Contrast, Zero Clutter) -->
              <div id="payment-panel-BANK" class="payment-method-panel ${currentPayment === 'BANK' ? '' : 'hidden'} pm-detail-surface text-xs space-y-3">
                <div class="flex items-center justify-between pb-1.5 flex-wrap gap-1.5">
                  <div class="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 text-sm">
                    <span>🏦</span>
                    <span>ইসলামী ব্যাংক বাংলাদেশ পিএলসি (IBBL) একাউন্ট বিবরণী</span>
                  </div>
                  <span class="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">৫% ছাড়</span>
                </div>

                <!-- High-Contrast Bank Details Box -->
                <div class="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 space-y-1.5">
                  <div class="checkout-bank-grid">
                    <div class="checkout-bank-item">
                      <span class="checkout-bank-lbl">ব্যাংকের নাম:</span>
                      <span class="checkout-bank-val">Islami Bank Bangladesh PLC (IBBLBDDH)</span>
                    </div>
                    <div class="checkout-bank-item">
                      <span class="checkout-bank-lbl">একাউন্টের নাম:</span>
                      <span class="checkout-bank-val">Jainal Abedin</span>
                    </div>
                    <div class="checkout-bank-item bg-blue-50/60 dark:bg-slate-900/60 px-2 rounded-lg">
                      <span class="checkout-bank-lbl font-bold">একাউন্ট নম্বর:</span>
                      <div class="flex items-center gap-2">
                        <span class="font-black font-mono text-blue-700 dark:text-blue-400 text-sm">20508070200030208</span>
                        <button type="button" onclick="window.copyCheckoutText('20508070200030208', this)" class="px-2.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-[10px] font-bold cursor-pointer">
                          কপি
                        </button>
                      </div>
                    </div>
                    <div class="checkout-bank-item">
                      <span class="checkout-bank-lbl">শাখা:</span>
                      <span class="checkout-bank-val">Maheshkhali Sub branch</span>
                    </div>
                    <div class="checkout-bank-item">
                      <span class="checkout-bank-lbl">রাউটিং নম্বর:</span>
                      <span class="checkout-bank-val font-mono">125260525</span>
                    </div>
                  </div>
                </div>

                <div class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 pt-0.5">
                  যেকোনো ব্যাংক অ্যাপ (CellFin, i-Banking) বা শাখা থেকে টাকা পাঠিয়ে ডিপোজিট স্লিপ নম্বর বা <strong>TrxID</strong> নিচের বক্সে লিখুন।
                </div>
              </div>

              <!-- Transaction ID Input (Hidden for COD, visible for online payments) -->
              <div id="checkout-trxid-container" class="${currentPayment === 'COD' ? 'hidden' : ''} pt-2 space-y-1" style="${currentPayment === 'COD' ? 'display: none;' : 'display: block;'}">
                <label class="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                  পেমেন্ট ট্রানজেকশন আইডি (TrxID) <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="checkout-trxid" 
                  placeholder="যেমন: 9K2840FJA2" 
                  class="form-control text-xs sm:text-sm w-full py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 font-mono uppercase text-slate-900 dark:text-white outline-none"
                />
                <p class="text-[10px] text-slate-500 dark:text-slate-400">টাকা পাঠানোর পর প্রাপ্ত SMS থেকে TrxID টি এখানে লিখুন।</p>
              </div>

            </div>

          </div>

        </div>

        <!-- Right: Order Summary & Confirm Button (5 cols) -->
        <div class="lg:col-span-5 space-y-5 sticky top-20">
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            
            <h3 class="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>অর্ডারের পণ্যসমূহ</span>
              <a href="/cart" class="text-xs text-emerald-600 font-normal hover:underline">সম্পাদনা ✎</a>
            </h3>

            <!-- Itemized mini list -->
            <div class="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-1">
              ${items.map(it => `
                <div class="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <img src="${it.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}" class="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white" />
                    <div class="min-w-0">
                      <div class="font-bold text-slate-800 dark:text-slate-200 truncate">${it.name}</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span>পরিমাণ: <strong>${it.quantity}</strong> টি × ${formatCurrency(it.price)}</span>${it.color ? `<span class="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">🎨 ${it.color}</span>` : ''}
                        ${it.size ? `<span class="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-teal-200 dark:border-teal-800">📏 ${it.size}</span>` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="font-bold text-slate-900 dark:text-white flex-shrink-0 text-xs font-mono">
                    ${formatCurrency(Number(it.price) * Number(it.quantity))}
                  </div>
                </div>
              `).join("")}
            </div>

            <!-- Price Breakdown Calculation -->
            <div class="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div class="flex justify-between">
                <span>পণ্যের মোট মূল্য (Subtotal):</span>
                <span id="summary-subtotal" class="font-bold text-slate-900 dark:text-white">${formatCurrency(subtotal)}</span>
              </div>

              <div class="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <span id="summary-delivery-charge" class="font-bold text-slate-900 dark:text-white">
                  ${isFreeDelivery ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold">ফ্রি (৳০)</span>' : formatCurrency(deliveryFee)}
                </span>
              </div>

              <div id="summary-online-discount-row" class="flex justify-between text-emerald-600 font-bold ${onlineDiscount > 0 ? '' : 'hidden'}">
                <span>অনলাইন পেমেন্ট ৫% ছাড়:</span>
                <span id="summary-online-discount-amount">-${formatCurrency(onlineDiscount)}</span>
              </div>

              <div class="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline text-base font-black text-slate-900 dark:text-white">
                <span>সর্বমোট প্রদেয়:</span>
                <span id="summary-grand-total" class="text-emerald-600 dark:text-emerald-400 font-bold text-xl font-mono">${formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <!-- Order Submission Button -->
            <button 
              type="submit" 
              id="btn-confirm-order" 
              class="btn-primary w-full py-3.5 text-center text-sm font-black shadow-lg flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
            >
              <span>✓</span> <span id="btn-confirm-order-text">অর্ডার নিশ্চিত করুন (${formatCurrency(grandTotal)})</span>
            </button>

            <div class="text-center text-[10px] text-slate-400 leading-tight">
              অর্ডার করার মাধ্যমে আপনি আমাদের <a href="/terms" class="underline">শর্তাবলী</a> ও <a href="/privacy" class="underline">গোপনীয়তা নীতি</a> মেনে নিচ্ছেন।
            </div>

          </div>
        </div>

      </form>

    </div>
  `;
}
