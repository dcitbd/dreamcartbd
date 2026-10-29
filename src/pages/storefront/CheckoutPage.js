/**
 * DREAM CART BD — ORDER CHECKOUT PAGE (CheckoutPage.js)
 * Implements user requirements:
 * - Dynamically synced with Admin System Settings:
 *   1. পেমেন্ট মেথড আপডেট (getGlobalPaymentMethods)
 *   2. ডেলিভারি মেথড কনফিগ (getGlobalDeliveryMethods)
 *   3. অফার ও কুপন ডিসকাউন্ট (getGlobalOffers & cartStore.validateAndApplyCoupon)
 * - Auto-calculates Free Shipping threshold, 5% Online Prepayment Discount, and Coupon Discount.
 * - Full Order submission & validation syncing with Orders & Incomplete_Orders sheets.
 */

import { cartStore } from '../../store/cartStore.js';
import { authStore } from '../../store/authStore.js';
import { apiClient, getGlobalPaymentMethods, getGlobalDeliveryMethods, getGlobalOffers, getGlobalSiteSettings } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../components/Toast.js';
import { router } from '../../router.js';

function mapDeliveryKey(dm) {
  const id = String(dm.id || '').toLowerCase();
  const z = String(dm.zone || '').toLowerCase();
  if (id === 'dhaka' || z.includes('dhaka') && !z.includes('outside')) return 'dhaka';
  if (id === 'cumilla' || z.includes('cumilla') || z.includes('কুমিল্লা')) return 'cumilla';
  if (id === 'outside' || z.includes('outside') || z.includes('বাইরে')) return 'outside';
  if (id === 'pickup' || z.includes('pickup') || z.includes('পিকআপ')) return 'pickup';
  return dm.id || 'dhaka';
}

function mapPaymentCode(pm) {
  const code = String(pm.code || '').toUpperCase().trim();
  if (code) return code;
  const n = String(pm.name || '').toLowerCase();
  const t = String(pm.type || '').toLowerCase();
  if (n.includes('cash') || n.includes('cod') || n.includes('ক্যাশ')) return 'COD';
  if (n.includes('bkash') || n.includes('বিকাশ')) {
    return (t.includes('merchant') || t.includes('link') || n.includes('link') || n.includes('মার্চেন্ট')) ? 'BKASH_PAYMENT' : 'BKASH_PERSONAL';
  }
  if (n.includes('nagad') || n.includes('নগদ')) return 'NAGAD_PERSONAL';
  if (n.includes('rocket') || n.includes('রকেট')) return 'ROCKET_PERSONAL';
  if (n.includes('bank') || n.includes('ব্যাংক') || n.includes('islami')) return 'BANK';
  return String(pm.id || 'CUSTOM_PAY').toUpperCase();
}

function refreshCheckoutTotalsDOM() {
  const subtotal = cartStore.getSubtotal();
  const isFree = cartStore.isFreeDelivery();
  const delFee = cartStore.getDeliveryCharge();
  const onlineDisc = cartStore.getOnlinePaymentDiscount();
  const couponDisc = cartStore.getCouponDiscount ? cartStore.getCouponDiscount() : 0;
  const grandTotal = cartStore.getGrandTotal();

  const subEl = document.getElementById('summary-subtotal');
  const delEl = document.getElementById('summary-delivery-charge');
  const discRow = document.getElementById('summary-online-discount-row');
  const discAmt = document.getElementById('summary-online-discount-amount');
  const coupRow = document.getElementById('summary-coupon-discount-row');
  const coupAmt = document.getElementById('summary-coupon-discount-amount');
  const grandEl = document.getElementById('summary-grand-total');
  const btnText = document.getElementById('btn-confirm-order-text');

  if (subEl) subEl.textContent = formatCurrency(subtotal);
  if (delEl) delEl.innerHTML = isFree ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold">ফ্রি (৳০)</span>' : formatCurrency(delFee);

  if (discRow && discAmt) {
    if (onlineDisc > 0) {
      discRow.classList.remove('hidden');
      discAmt.textContent = '-' + formatCurrency(onlineDisc);
    } else {
      discRow.classList.add('hidden');
    }
  }

  if (coupRow && coupAmt) {
    if (couponDisc > 0) {
      coupRow.classList.remove('hidden');
      coupAmt.textContent = '-' + formatCurrency(couponDisc);
    } else {
      coupRow.classList.add('hidden');
    }
  }

  if (grandEl) grandEl.textContent = formatCurrency(grandTotal);
  if (btnText) btnText.textContent = `অর্ডার নিশ্চিত করুন (${formatCurrency(grandTotal)})`;
}

if (typeof window !== 'undefined') {
  window.switchCheckoutPayment = function(method) {
    if (!method) return;
    if (cartStore && cartStore.setPaymentMethod) {
      cartStore.setPaymentMethod(method);
    }

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

    refreshCheckoutTotalsDOM();
  };

  window.switchDeliveryZone = function(zone) {
    if (!zone) return;
    if (cartStore && cartStore.setDeliveryZone) {
      cartStore.setDeliveryZone(zone);
    }
    const zoneBadge = document.getElementById('delivery-zone-summary-text');
    if (zoneBadge) {
      const selectEl = document.getElementById('checkout-delivery-zone');
      const selectedLabel = selectEl?.selectedOptions?.[0]?.getAttribute('data-zone-name') || zone;
      const fee = cartStore.getDeliveryCharge();
      const isFree = cartStore.isFreeDelivery();
      const feeText = isFree ? 'ফ্রি (৳০)' : formatCurrency(fee);
      zoneBadge.textContent = `${selectedLabel} — চার্জ: ${feeText}`;
    }
    refreshCheckoutTotalsDOM();
  };

  window.applyCheckoutCouponCode = function() {
    const inp = document.getElementById('checkout-coupon-input');
    const msgEl = document.getElementById('checkout-coupon-msg');
    const code = (inp?.value || '').trim();
    if (!code) {
      cartStore.clearCoupon();
      if (msgEl) {
        msgEl.className = 'text-[11px] font-bold text-slate-500 mt-1';
        msgEl.textContent = 'কুপন কোড মুছে ফেলা হয়েছে।';
      }
      refreshCheckoutTotalsDOM();
      return;
    }

    const res = cartStore.validateAndApplyCoupon(code);
    if (msgEl) {
      msgEl.className = `text-[11px] font-bold mt-1 ${res.valid ? 'text-emerald-600' : 'text-rose-600'}`;
      msgEl.textContent = res.message;
    }
    if (res.valid) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    refreshCheckoutTotalsDOM();
  };

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
  const activeDeliveryMethods = getGlobalDeliveryMethods(true);
  const activePaymentMethods = getGlobalPaymentMethods(true);
  const activeOffers = getGlobalOffers(true);
  const siteSettings = getGlobalSiteSettings();
  const onlineDiscPct = Number(siteSettings.online_payment_discount_percent || 5);

  const currentZone = cartStore.deliveryZone || mapDeliveryKey(activeDeliveryMethods[0] || { id: 'dhaka' });
  const currentPayment = cartStore.paymentMethod || mapPaymentCode(activePaymentMethods[0] || { code: 'COD' });
  const subtotal = cartStore.getSubtotal();
  const deliveryFee = cartStore.getDeliveryCharge();
  const isFreeDelivery = cartStore.isFreeDelivery();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const couponDiscount = cartStore.getCouponDiscount ? cartStore.getCouponDiscount() : 0;
  const grandTotal = cartStore.getGrandTotal();

  const currentZoneObj = activeDeliveryMethods.find(dm => mapDeliveryKey(dm) === currentZone) || activeDeliveryMethods[0] || { zone: 'ঢাকা সিটি', time: '২-৩ দিন' };
  const currentZoneSummary = `${currentZoneObj.zone} (${currentZoneObj.time || '২-৩ দিন'}) — চার্জ: ${isFreeDelivery ? 'ফ্রি (৳০)' : formatCurrency(deliveryFee)}`;

  return `
    <style>
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
          নিচের তথ্যগুলো দিয়ে "অর্ডার নিশ্চিত করুন" বাটনে ক্লিক করুন। আমাদের প্রতিনিধি আপনার সাথে দ্রুত যোগাযোগ করবেন।
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

          <!-- 2. Delivery Zone Selection (Synced with Admin Delivery Methods Config) -->
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
                ${activeDeliveryMethods.map(dm => {
                  const key = mapDeliveryKey(dm);
                  const chargeTxt = Number(dm.charge) === 0 ? 'ফ্রি ৳০' : `৳${dm.charge}`;
                  return `
                    <option value="${key}" data-zone-name="${dm.zone} (${dm.time || '২-৩ দিন'})" ${currentZone === key ? 'selected' : ''}>
                      ${dm.zone} — ${chargeTxt} (${dm.time || '২-৩ দিন'})
                    </option>
                  `;
                }).join('')}
              </select>
            </div>

            <div class="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
              <span>📍</span>
              <span id="delivery-zone-summary-text" class="font-medium">${currentZoneSummary}</span>
            </div>
          </div>

          <!-- 3. Payment Method Selection (Synced with Admin Payment Methods Config) -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs">৩</span>
                পেমেন্ট পদ্ধতি নির্বাচন করুন (Payment Method)
              </h3>
              <span class="text-[11px] font-bold text-white bg-black px-2.5 py-0.5 rounded-full">
                অনলাইন পেমেন্টে ${onlineDiscPct}% ছাড়
              </span>
            </div>

            <div class="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <span class="text-sm">🎁</span>
              <span>বিকাশ, নগদ, রকেট বা ব্যাংকে অগ্রিম পেমেন্ট করলে পাবেন <strong class="underline font-bold">${onlineDiscPct}% তাৎক্ষণিক ছাড়!</strong></span>
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
                ${activePaymentMethods.map(pm => {
                  const code = mapPaymentCode(pm);
                  const isCod = code === 'COD';
                  const discTag = !isCod && Number(pm.discount || onlineDiscPct) > 0 ? ` (${pm.discount || onlineDiscPct}% ছাড়)` : '';
                  const icon = isCod ? '💵' : (code.includes('BKASH') ? '🌸' : (code.includes('NAGAD') ? '🔥' : (code.includes('ROCKET') ? '🚀' : '🏦')));
                  return `<option value="${code}" ${currentPayment === code ? 'selected' : ''}>${icon} ${pm.name}${discTag}</option>`;
                }).join('')}
              </select>
            </div>

            <!-- Dynamic Method-Specific Payment Details Panels -->
            <div id="payment-instruction-container" class="space-y-3 pt-1">
              ${activePaymentMethods.map(pm => {
                const code = mapPaymentCode(pm);
                const isSelected = currentPayment === code;
                if (code === 'COD') {
                  return `
                    <div id="payment-panel-COD" class="payment-method-panel ${isSelected ? '' : 'hidden'} pm-detail-surface text-xs space-y-2">
                      <div class="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                        <span>🚚</span>
                        <span>${pm.name}</span>
                      </div>
                      <p class="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        ${pm.instruction || 'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন। কোনো প্রকার অগ্রিম পেমেন্ট বা TrxID-এর প্রয়োজন নেই।'}
                      </p>
                    </div>
                  `;
                }

                if (code === 'BKASH_PAYMENT' || String(pm.number || '').startsWith('http')) {
                  const payUrl = String(pm.number || 'https://shop.bkash.com/j-a-sagor-computer01581703822/paymentlink').trim();
                  return `
                    <div id="payment-panel-${code}" class="payment-method-panel ${isSelected ? '' : 'hidden'} pm-detail-surface text-xs space-y-3">
                      <div class="flex items-center justify-between pb-1.5 flex-wrap gap-1.5">
                        <div class="flex items-center gap-2 font-bold text-pink-600 dark:text-pink-400 text-sm">
                          <span>💳</span>
                          <span>${pm.name}</span>
                        </div>
                        <span class="text-[10px] font-bold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-md">${pm.discount || onlineDiscPct}% ছাড়</span>
                      </div>
                      <div class="space-y-2 text-center">
                        <a href="${payUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-xs shadow-sm transition">
                          <span>👉 অনলাইন পেমেন্ট গেটওয়ে ওপেন করুন (${pm.name})</span>
                          <span>↗</span>
                        </a>
                      </div>
                      <div class="text-[11px] text-slate-600 dark:text-slate-300">
                        ${pm.instruction || 'পেমেন্ট সফল হওয়ার পর পাওয়া TrxID নিচের বক্সে লিখে অর্ডার কনফার্ম করুন।'}
                      </div>
                    </div>
                  `;
                }

                if (code === 'BANK') {
                  const accNum = String(pm.number || '20508070200030208').trim();
                  return `
                    <div id="payment-panel-BANK" class="payment-method-panel ${isSelected ? '' : 'hidden'} pm-detail-surface text-xs space-y-3">
                      <div class="flex items-center justify-between pb-1.5 flex-wrap gap-1.5">
                        <div class="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 text-sm">
                          <span>🏦</span>
                          <span>${pm.name}</span>
                        </div>
                        <span class="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">${pm.discount || onlineDiscPct}% ছাড়</span>
                      </div>
                      <div class="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 space-y-1.5">
                        <div class="checkout-bank-grid">
                          <div class="checkout-bank-item">
                            <span class="checkout-bank-lbl">ব্যাংক / মেথড:</span>
                            <span class="checkout-bank-val">${pm.name}</span>
                          </div>
                          <div class="checkout-bank-item bg-blue-50/60 dark:bg-slate-900/60 px-2 rounded-lg">
                            <span class="checkout-bank-lbl font-bold">একাউন্ট নম্বর:</span>
                            <div class="flex items-center gap-2">
                              <span class="font-black font-mono text-blue-700 dark:text-blue-400 text-sm">${accNum}</span>
                              <button type="button" onclick="window.copyCheckoutText('${accNum}', this)" class="px-2.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 text-blue-800 dark:text-blue-200 text-[10px] font-bold cursor-pointer">
                                কপি
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 pt-0.5">
                        ${pm.instruction || 'টাকা পাঠিয়ে ডিপোজিট স্লিপ নম্বর বা TrxID নিচের বক্সে লিখুন।'}
                      </div>
                    </div>
                  `;
                }

                // Mobile Banking (bKash, Nagad, Rocket, or custom)
                const numbers = String(pm.number || '01879653143').split(/[,|/]/).map(s => s.trim()).filter(Boolean);
                return `
                  <div id="payment-panel-${code}" class="payment-method-panel ${isSelected ? '' : 'hidden'} pm-detail-surface text-xs space-y-3">
                    <div class="flex items-center justify-between pb-1.5 flex-wrap gap-1.5">
                      <div class="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                        <span>📱</span>
                        <span>${pm.name} (${pm.type || 'Personal'})</span>
                      </div>
                      <span class="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">${pm.discount || onlineDiscPct}% ছাড়</span>
                    </div>
                    <div class="space-y-2">
                      ${numbers.map((num, nIdx) => `
                        <div class="pm-num-chip">
                          <div class="flex flex-col">
                            <span class="text-[10px] text-slate-500 dark:text-slate-400">${pm.name} নম্বর ${numbers.length > 1 ? (nIdx + 1) : ''}:</span>
                            <span class="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">${num}</span>
                          </div>
                          <button type="button" onclick="window.copyCheckoutText('${num.replace(/[^0-9]/g, '')}', this)" class="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition cursor-pointer">
                            📋 কপি
                          </button>
                        </div>
                      `).join('')}
                    </div>
                    <div class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 pt-0.5">
                      ${pm.instruction || 'টাকা পাঠানো শেষে পাওয়া TrxID নিচের বক্সে লিখুন।'}
                    </div>
                  </div>
                `;
              }).join('')}

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

        <!-- Right: Order Summary, Coupon Code & Confirm Button (5 cols) -->
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

            <!-- Coupon / Promo Code Box (Synced with Admin অফার ও কুপন ডিসকাউন্ট) -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                🎟️ প্রোমো বা কুপন কোড (যদি থাকে):
              </label>
              <div class="flex gap-2">
                <input 
                  type="text" 
                  id="checkout-coupon-input" 
                  value="${cartStore.couponCode || ''}" 
                  placeholder="যেমন: DREAM10" 
                  class="form-control text-xs font-mono uppercase flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none"
                />
                <button 
                  type="button" 
                  onclick="window.applyCheckoutCouponCode()" 
                  class="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer"
                >
                  এপ্লাই
                </button>
              </div>
              <div id="checkout-coupon-msg" class="text-[11px] font-bold mt-1 ${couponDiscount > 0 ? 'text-emerald-600' : 'text-slate-400'}">
                ${couponDiscount > 0 ? `✓ "${cartStore.couponCode}" কুপনে ৳${couponDiscount} ছাড় যুক্ত হয়েছে!` : (activeOffers.length > 0 ? `উপলব্ধ কুপন: ${activeOffers.slice(0, 2).map(o => o.code).join(', ')}` : '')}
              </div>
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
                <span>অনলাইন পেমেন্ট ${onlineDiscPct}% ছাড়:</span>
                <span id="summary-online-discount-amount">-${formatCurrency(onlineDiscount)}</span>
              </div>

              <div id="summary-coupon-discount-row" class="flex justify-between text-amber-600 font-bold ${couponDiscount > 0 ? '' : 'hidden'}">
                <span>কুপন ডিসকাউন্ট:</span>
                <span id="summary-coupon-discount-amount">-${formatCurrency(couponDiscount)}</span>
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
