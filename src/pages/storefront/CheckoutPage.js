/**
 * DREAM CART BD — ORDER CHECKOUT PAGE (CheckoutPage.js)
 * Implements user requirements:
 * - Dynamic Payment Method Panels:
 *   - Clicking bKash Personal displays ONLY bKash Personal numbers with 1-click copy & steps.
 *   - Clicking bKash Payment Link displays ONLY bKash Payment gateway link with 1-click button.
 *   - Clicking Nagad Personal displays ONLY Nagad Personal numbers with 1-click copy & steps.
 *   - Clicking Rocket Personal displays ONLY Rocket Personal number with 1-click copy & steps.
 *   - Clicking Bank Transfer displays ONLY Bank Account details with high-contrast text (zero white-on-white bug).
 *   - Clicking Cash on Delivery displays ONLY COD instructions (TrxID hidden).
 * - High-contrast text & background harmony for both Light and Dark mode.
 * - Delivery area selector with dynamic fees (Cumilla ৳70, Dhaka ৳90, Outside ৳120, Office Pickup ৳0).
 * - Auto-calculate 2,000 BDT free shipping discount.
 * - Auto-calculate 5% online prepayment discount.
 * - Full Order submission & validation.
 */

import { cartStore } from '../../store/cartStore.js';
import { authStore } from '../../store/authStore.js';
import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../components/Toast.js';
import { router } from '../../router.js';

// Attach global switcher so radio selection updates instantaneously on any device
if (typeof window !== 'undefined') {
  window.switchCheckoutPayment = function(method) {
    if (!method) return;
    
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

    // 3. Highlight selected payment option card
    document.querySelectorAll('.payment-option').forEach(opt => {
      const radio = opt.querySelector('input[name="payment_method"]');
      if (radio && radio.value === method) {
        opt.classList.add('border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-950/40');
        opt.classList.remove('border-slate-200', 'dark:border-slate-700');
      } else {
        opt.classList.remove('border-emerald-500', 'bg-emerald-50/50', 'dark:bg-emerald-950/40');
        opt.classList.add('border-slate-200', 'dark:border-slate-700');
      }
    });
  };

  // Safe clipboard helper
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
      b.innerHTML = '✓ কপি হয়েছে!';
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
  const currentZone = cartStore.deliveryZone;
  const currentPayment = cartStore.paymentMethod || 'COD';
  const subtotal = cartStore.getSubtotal();
  const deliveryFee = cartStore.getDeliveryCharge();
  const isFreeDelivery = cartStore.isFreeDelivery();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const grandTotal = cartStore.getGrandTotal();

  return `
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
        <div class="lg:col-span-7 space-y-6">
          
          <!-- 1. Customer Personal & Delivery Information Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs">১</span>
              গ্রাহকের তথ্য ও ডেলিভারি ঠিকানা (Customer Info)
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
                placeholder="যেমন: মোঃ কামরুল ইসলাম" 
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
                placeholder="যেমন: 01700000000" 
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

          <!-- 2. Delivery Zone Selection Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs">২</span>
              ডেলিভারি এরিয়া ও চার্জ (Delivery Area)
            </h3>

            <div class="space-y-2 text-xs">
              <label class="delivery-option flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${currentZone === 'cumilla' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-3">
                  <input type="radio" name="delivery_zone" value="cumilla" ${currentZone === 'cumilla' ? 'checked' : ''} class="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white">কুমিল্লা সদর (In Cumilla)</div>
                    <div class="text-[11px] text-slate-500">হোম ডেলিভারি (১-২ দিন)</div>
                  </div>
                </div>
                <span class="font-black text-emerald-700 dark:text-emerald-400">৳৭০</span>
              </label>

              <label class="delivery-option flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${currentZone === 'dhaka' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-3">
                  <input type="radio" name="delivery_zone" value="dhaka" ${currentZone === 'dhaka' ? 'checked' : ''} class="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white">ঢাকা সিটি (In Dhaka)</div>
                    <div class="text-[11px] text-slate-500">হোম ডেলিভারি (২-৩ দিন)</div>
                  </div>
                </div>
                <span class="font-black text-emerald-700 dark:text-emerald-400">৳৯০</span>
              </label>

              <label class="delivery-option flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${currentZone === 'outside' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-3">
                  <input type="radio" name="delivery_zone" value="outside" ${currentZone === 'outside' ? 'checked' : ''} class="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white">ঢাকার বাইরে সমগ্র বাংলাদেশ (Outside Dhaka)</div>
                    <div class="text-[11px] text-slate-500">হোম ডেলিভারি (৩-৫ দিন)</div>
                  </div>
                </div>
                <span class="font-black text-emerald-700 dark:text-emerald-400">৳১২০</span>
              </label>

              <label class="delivery-option flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${currentZone === 'pickup' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-3">
                  <input type="radio" name="delivery_zone" value="pickup" ${currentZone === 'pickup' ? 'checked' : ''} class="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white">অফিস থেকে পিকআপ (Office Pickup)</div>
                    <div class="text-[11px] text-slate-500">পদুয়ার বাজার বিশ্বরোড, কুমিল্লা</div>
                  </div>
                </div>
                <span class="font-black text-emerald-600">ফ্রি (৳০)</span>
              </label>
            </div>
          </div>

          <!-- 3. Payment Method Selection Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs">৩</span>
              পেমেন্ট পদ্ধতি নির্বাচন করুন (Payment Method)
            </h3>

            <!-- Notice for 5% prepayment discount -->
            <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <span class="text-base">🎁</span>
              <span>বিকাশ, নগদ বা রকেটে অগ্রিম পেমেন্ট করলে পাবেন <strong class="underline font-bold">৫% তাৎক্ষণিক ছাড়!</strong></span>
            </div>

            <!-- Radio Options Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs" id="payment-options-grid">
              
              <!-- 1. COD -->
              <label onclick="window.switchCheckoutPayment && window.switchCheckoutPayment('COD')" class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'COD' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="COD" onchange="window.switchCheckoutPayment && window.switchCheckoutPayment('COD')" ${currentPayment === 'COD' ? 'checked' : ''} class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                  <span class="font-bold text-slate-800 dark:text-slate-200">ক্যাশ অন ডেলিভারি (COD)</span>
                </div>
                <span class="text-xs">💵</span>
              </label>

              <!-- 2. bKash Personal -->
              <label onclick="window.switchCheckoutPayment && window.switchCheckoutPayment('BKASH_PERSONAL')" class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'BKASH_PERSONAL' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="BKASH_PERSONAL" onchange="window.switchCheckoutPayment && window.switchCheckoutPayment('BKASH_PERSONAL')" ${currentPayment === 'BKASH_PERSONAL' ? 'checked' : ''} class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                  <span class="font-bold text-pink-600 dark:text-pink-400">বিকাশ পার্সোনাল (৫% ছাড়)</span>
                </div>
                <span class="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">bKash</span>
              </label>

              <!-- 3. bKash Payment (Merchant) -->
              <label onclick="window.switchCheckoutPayment && window.switchCheckoutPayment('BKASH_PAYMENT')" class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'BKASH_PAYMENT' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="BKASH_PAYMENT" onchange="window.switchCheckoutPayment && window.switchCheckoutPayment('BKASH_PAYMENT')" ${currentPayment === 'BKASH_PAYMENT' ? 'checked' : ''} class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                  <span class="font-bold text-pink-700 dark:text-pink-400">বিকাশ পেমেন্ট লিংক (৫% ছাড়)</span>
                </div>
                <span class="badge badge-info text-[9px]">লিংক</span>
              </label>

              <!-- 4. Nagad Personal -->
              <label onclick="window.switchCheckoutPayment && window.switchCheckoutPayment('NAGAD_PERSONAL')" class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'NAGAD_PERSONAL' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="NAGAD_PERSONAL" onchange="window.switchCheckoutPayment && window.switchCheckoutPayment('NAGAD_PERSONAL')" ${currentPayment === 'NAGAD_PERSONAL' ? 'checked' : ''} class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                  <span class="font-bold text-orange-600 dark:text-orange-400">নগদ পার্সোনাল (৫% ছাড়)</span>
                </div>
                <span class="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">Nagad</span>
              </label>

              <!-- 5. Rocket Personal -->
              <label onclick="window.switchCheckoutPayment && window.switchCheckoutPayment('ROCKET_PERSONAL')" class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'ROCKET_PERSONAL' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="ROCKET_PERSONAL" onchange="window.switchCheckoutPayment && window.switchCheckoutPayment('ROCKET_PERSONAL')" ${currentPayment === 'ROCKET_PERSONAL' ? 'checked' : ''} class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                  <span class="font-bold text-purple-600 dark:text-purple-400">রকেট পার্সোনাল (৫% ছাড়)</span>
                </div>
                <span class="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">Rocket</span>
              </label>

              <!-- 6. Bank Account -->
              <label onclick="window.switchCheckoutPayment && window.switchCheckoutPayment('BANK')" class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'BANK' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="BANK" onchange="window.switchCheckoutPayment && window.switchCheckoutPayment('BANK')" ${currentPayment === 'BANK' ? 'checked' : ''} class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                  <span class="font-bold text-blue-600 dark:text-blue-400">ব্যাংক ট্রান্সফার (৫% ছাড়)</span>
                </div>
                <span class="text-xs">🏦</span>
              </label>

            </div>

            <!-- ==========================================================================
                 DYNAMIC METHOD-SPECIFIC PAYMENT DETAILS PANELS
                 Only the selected method's details are shown! High-contrast, zero white-on-white.
                 ========================================================================== -->
            <div id="payment-instruction-container" class="space-y-3 pt-1">
              
              <!-- PANEL 1: Cash on Delivery (COD) -->
              <div id="payment-panel-COD" class="payment-method-panel ${currentPayment === 'COD' ? '' : 'hidden'} p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-xs space-y-2.5">
                <div class="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  <span>🚚</span>
                  <span>ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                </div>
                <p class="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন। কোনো প্রকার অগ্রিম পেমেন্টের প্রয়োজন নেই।
                </p>
                <div class="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-100/80 dark:bg-emerald-950/70 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-2">
                  <span>✓</span>
                  <span>ক্যাশ অন ডেলিভারির জন্য কোনো ট্রানজেকশন আইডি (TrxID) প্রয়োজন নেই।</span>
                </div>
              </div>

              <!-- PANEL 2: bKash Personal -->
              <div id="payment-panel-BKASH_PERSONAL" class="payment-method-panel ${currentPayment === 'BKASH_PERSONAL' ? '' : 'hidden'} p-4 rounded-2xl border border-pink-300 dark:border-pink-800/80 bg-pink-50/80 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-xs space-y-3">
                <div class="flex items-center justify-between border-b border-pink-200 dark:border-slate-800 pb-2 flex-wrap gap-1.5">
                  <div class="flex items-center gap-2 font-bold text-pink-700 dark:text-pink-400 text-sm">
                    <span>🌸</span>
                    <span>বিকাশ পার্সোনাল পেমেন্ট নম্বর (Send Money)</span>
                  </div>
                  <span class="text-[10px] font-bold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-800">৫% ক্যাশলেস ছাড় প্রযোজ্য</span>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 shadow-xs">
                    <div class="flex flex-col">
                      <span class="text-[11px] text-slate-500 dark:text-slate-400">বিকাশ পার্সোনাল নম্বর ১ (মাস্টার):</span>
                      <span class="text-sm font-black font-mono text-pink-600 dark:text-pink-400">01581703822</span>
                    </div>
                    <button type="button" onclick="window.copyCheckoutText('01581703822', this)" class="px-3 py-1.5 rounded-lg bg-pink-100 hover:bg-pink-200 dark:bg-pink-950 dark:hover:bg-pink-900 text-pink-700 dark:text-pink-300 font-bold text-xs border border-pink-200 dark:border-pink-800 transition active:scale-95 cursor-pointer">
                      📋 কপি করুন
                    </button>
                  </div>

                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 shadow-xs">
                    <div class="flex flex-col">
                      <span class="text-[11px] text-slate-500 dark:text-slate-400">বিকাশ পার্সোনাল নম্বর ২ (অর্ডার ডেস্ক):</span>
                      <span class="text-sm font-black font-mono text-pink-600 dark:text-pink-400">01818273838</span>
                    </div>
                    <button type="button" onclick="window.copyCheckoutText('01818273838', this)" class="px-3 py-1.5 rounded-lg bg-pink-100 hover:bg-pink-200 dark:bg-pink-950 dark:hover:bg-pink-900 text-pink-700 dark:text-pink-300 font-bold text-xs border border-pink-200 dark:border-pink-800 transition active:scale-95 cursor-pointer">
                      📋 কপি করুন
                    </button>
                  </div>
                </div>

                <div class="bg-pink-100/60 dark:bg-slate-800/80 p-3 rounded-xl border border-pink-200/60 dark:border-slate-700 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-1">
                  <div>১. বিকাশ অ্যাপ ওপেন করে বা *247# ডায়াল করে <strong>Send Money</strong> অপশনে যান।</div>
                  <div>২. উপরের যেকোনো একটি নম্বরে মোট প্রদেয় মূল্য পাঠান।</div>
                  <div>৩. টাকা পাঠানো সম্পন্ন হলে মেসেজ থেকে পাওয়া <strong>TrxID (ট্রানজেকশন আইডি)</strong> নিচের বক্সে লিখুন।</div>
                </div>
              </div>

              <!-- PANEL 3: bKash Payment Link -->
              <div id="payment-panel-BKASH_PAYMENT" class="payment-method-panel ${currentPayment === 'BKASH_PAYMENT' ? '' : 'hidden'} p-4 rounded-2xl border border-pink-300 dark:border-pink-800/80 bg-pink-50/80 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-xs space-y-3">
                <div class="flex items-center justify-between border-b border-pink-200 dark:border-slate-800 pb-2 flex-wrap gap-1.5">
                  <div class="flex items-center gap-2 font-bold text-pink-700 dark:text-pink-400 text-sm">
                    <span>💳</span>
                    <span>বিকাশ অনলাইন পেমেন্ট লিংক (Payment Gateway)</span>
                  </div>
                  <span class="text-[10px] font-bold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-800">৫% ক্যাশলেস ছাড় প্রযোজ্য</span>
                </div>

                <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-pink-100 dark:border-slate-700 text-center space-y-2.5">
                  <p class="text-xs text-slate-600 dark:text-slate-300">নিচের বাটনে ক্লিক করে সরাসরি বিকাশ অনলাইন গেটওয়েতে কার্ড বা বিকাশ দিয়ে পেমেন্ট করুন:</p>
                  <a 
                    href="https://shop.bkash.com/j-a-sagor-computer01581703822/paymentlink" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs shadow-md transition active:scale-98"
                  >
                    <span>👉 বিকাশ অনলাইন গেটওয়ে ওপেন করুন (Pay via bKash)</span>
                    <span>↗</span>
                  </a>
                </div>

                <div class="bg-pink-100/60 dark:bg-slate-800/80 p-2.5 rounded-xl border border-pink-200/60 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300">
                  পেমেন্ট সম্পন্ন হওয়ার পর পাওয়া <strong>TrxID (ট্রানজেকশন আইডি)</strong> নিচের বক্সে লিখে অর্ডার নিশ্চিত করুন।
                </div>
              </div>

              <!-- PANEL 4: Nagad Personal -->
              <div id="payment-panel-NAGAD_PERSONAL" class="payment-method-panel ${currentPayment === 'NAGAD_PERSONAL' ? '' : 'hidden'} p-4 rounded-2xl border border-orange-300 dark:border-orange-800/80 bg-orange-50/80 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-xs space-y-3">
                <div class="flex items-center justify-between border-b border-orange-200 dark:border-slate-800 pb-2 flex-wrap gap-1.5">
                  <div class="flex items-center gap-2 font-bold text-orange-700 dark:text-orange-400 text-sm">
                    <span>🔥</span>
                    <span>নগদ পার্সোনাল পেমেন্ট নম্বর (Send Money)</span>
                  </div>
                  <span class="text-[10px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">৫% ক্যাশলেস ছাড় প্রযোজ্য</span>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 shadow-xs">
                    <div class="flex flex-col">
                      <span class="text-[11px] text-slate-500 dark:text-slate-400">নগদ পার্সোনাল নম্বর ১ (মাস্টার):</span>
                      <span class="text-sm font-black font-mono text-orange-600 dark:text-orange-400">01581703822</span>
                    </div>
                    <button type="button" onclick="window.copyCheckoutText('01581703822', this)" class="px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-orange-950 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800 transition active:scale-95 cursor-pointer">
                      📋 কপি করুন
                    </button>
                  </div>

                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 shadow-xs">
                    <div class="flex flex-col">
                      <span class="text-[11px] text-slate-500 dark:text-slate-400">নগদ পার্সোনাল নম্বর ২ (অর্ডার ডেস্ক):</span>
                      <span class="text-sm font-black font-mono text-orange-600 dark:text-orange-400">01818273838</span>
                    </div>
                    <button type="button" onclick="window.copyCheckoutText('01818273838', this)" class="px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-orange-950 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 font-bold text-xs border border-orange-200 dark:border-orange-800 transition active:scale-95 cursor-pointer">
                      📋 কপি করুন
                    </button>
                  </div>
                </div>

                <div class="bg-orange-100/60 dark:bg-slate-800/80 p-3 rounded-xl border border-orange-200/60 dark:border-slate-700 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-1">
                  <div>১. নগদ অ্যাপ ওপেন করে বা *167# ডায়াল করে <strong>Send Money</strong> অপশনে যান।</div>
                  <div>২. উপরের নম্বরে টাকা পাঠান এবং প্রাপ্ত <strong>TrxID (ট্রানজেকশন আইডি)</strong> নিচের বক্সে লিখুন।</div>
                </div>
              </div>

              <!-- PANEL 5: Rocket Personal -->
              <div id="payment-panel-ROCKET_PERSONAL" class="payment-method-panel ${currentPayment === 'ROCKET_PERSONAL' ? '' : 'hidden'} p-4 rounded-2xl border border-purple-300 dark:border-purple-800/80 bg-purple-50/80 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-xs space-y-3">
                <div class="flex items-center justify-between border-b border-purple-200 dark:border-slate-800 pb-2 flex-wrap gap-1.5">
                  <div class="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-400 text-sm">
                    <span>🚀</span>
                    <span>রকেট পার্সোনাল পেমেন্ট নম্বর (Send Money)</span>
                  </div>
                  <span class="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">৫% ক্যাশলেস ছাড় প্রযোজ্য</span>
                </div>

                <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 shadow-xs">
                  <div class="flex flex-col">
                    <span class="text-[11px] text-slate-500 dark:text-slate-400">রকেট নম্বর (১২ ডিজিট):</span>
                    <span class="text-sm font-black font-mono text-purple-600 dark:text-purple-400">01581703822-7</span>
                  </div>
                  <button type="button" onclick="window.copyCheckoutText('015817038227', this)" class="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 transition active:scale-95 cursor-pointer">
                    📋 কপি করুন
                  </button>
                </div>

                <div class="bg-purple-100/60 dark:bg-slate-800/80 p-3 rounded-xl border border-purple-200/60 dark:border-slate-700 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-1">
                  <div>১. রকেট অ্যাপ বা *322# ডায়াল করে <strong>Send Money</strong> অপশনে যান।</div>
                  <div>২. ১২ ডিজিটের নম্বরে টাকা পাঠান এবং প্রাপ্ত <strong>TrxID (ট্রানজেকশন আইডি)</strong> নিচের বক্সে দিন।</div>
                </div>
              </div>

              <!-- PANEL 6: Bank Account (Fixed High-Contrast Color Scheme) -->
              <div id="payment-panel-BANK" class="payment-method-panel ${currentPayment === 'BANK' ? '' : 'hidden'} p-4 rounded-2xl border border-blue-300 dark:border-blue-800/80 bg-blue-50/80 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-xs space-y-3">
                <div class="flex items-center justify-between border-b border-blue-200 dark:border-slate-800 pb-2 flex-wrap gap-1.5">
                  <div class="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 text-sm">
                    <span>🏦</span>
                    <span>ইসলামী ব্যাংক বাংলাদেশ পিএলসি (IBBL) একাউন্ট বিবরণী</span>
                  </div>
                  <span class="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">৫% ক্যাশলেস ছাড় প্রযোজ্য</span>
                </div>

                <!-- High-Contrast Bank Details Box (Strictly: Dark text on light background in light mode; pure white on slate-800 in dark mode) -->
                <div class="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 shadow-xs space-y-2 text-xs">
                  <div class="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/60">
                    <span class="text-slate-600 dark:text-slate-400 font-medium">ব্যাংকের নাম:</span>
                    <span class="font-bold text-slate-900 dark:text-white">Islami Bank Bangladesh PLC (IBBLBDDH)</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/60">
                    <span class="text-slate-600 dark:text-slate-400 font-medium">একাউন্ট নাম:</span>
                    <span class="font-bold text-slate-900 dark:text-white">Jainal Abedin</span>
                  </div>
                  <div class="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/60 bg-blue-50/70 dark:bg-slate-900/70 px-2.5 rounded-lg">
                    <span class="text-slate-700 dark:text-slate-300 font-bold">একাউন্ট নম্বর:</span>
                    <div class="flex items-center gap-2">
                      <span class="font-black font-mono text-blue-700 dark:text-blue-400 text-sm">20508070200030208</span>
                      <button type="button" onclick="window.copyCheckoutText('20508070200030208', this)" class="px-2.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-[10px] font-bold border border-blue-200 dark:border-blue-800 cursor-pointer">কপি</button>
                    </div>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700/60">
                    <span class="text-slate-600 dark:text-slate-400 font-medium">শাখা:</span>
                    <span class="font-bold text-slate-900 dark:text-white">Maheshkhali Sub branch</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-slate-600 dark:text-slate-400 font-medium">রাউটিং নম্বর:</span>
                    <span class="font-bold font-mono text-slate-900 dark:text-white">125260525</span>
                  </div>
                </div>

                <div class="bg-blue-100/60 dark:bg-slate-800/80 p-3 rounded-xl border border-blue-200/60 dark:border-slate-700 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                  ইসলামী ব্যাংকের সেলফিন (CellFin), ইন্টারনেট ব্যাংকিং (i-Banking) বা যেকোনো ব্যাংক থেকে NPSB/BEFTN মাধ্যমে টাকা পাঠিয়ে ডিপোজিট স্লিপ নম্বর বা <strong>TrxID</strong> নিচের বক্সে লিখুন।
                </div>
              </div>

              <!-- Transaction ID Input (Hidden for COD, visible for online payments) -->
              <div id="checkout-trxid-container" class="${currentPayment === 'COD' ? 'hidden' : ''} pt-2 space-y-1">
                <label class="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                  পেমেন্ট ট্রানজেকশন আইডি (TrxID) <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="checkout-trxid" 
                  placeholder="যেমন: 9K2840FJA2" 
                  class="form-control text-xs w-full py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 font-mono uppercase text-slate-900 dark:text-white outline-none"
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
