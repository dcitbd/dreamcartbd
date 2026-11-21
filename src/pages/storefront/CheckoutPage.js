/**
 * DREAM CART BD — ORDER CHECKOUT PAGE (CheckoutPage.js)
 * Clean, modern card-based checkout synced with Admin System Settings:
 * - Dynamic Payment Methods & Delivery Zones
 * - Automatic Pre-Order enforcement when any cart item has stock <= 0:
 *   (+15% price, Online Payment ONLY, COD disabled, no online discount, no coupons)
 * - Full Order submission & validation syncing with Orders & Incomplete_Orders sheets.
 */

import { cartStore, isProductOutOfStock } from '../../store/cartStore.js';
import { authStore } from '../../store/authStore.js';
import { getGlobalPaymentMethods, getGlobalDeliveryMethods, getGlobalOffers, getGlobalSiteSettings } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../components/Toast.js';

function mapDeliveryKey(dm) {
  const id = String(dm.id || '').toLowerCase();
  const z = String(dm.zone || '').toLowerCase();
  if (id === 'dhaka' || (z.includes('dhaka') && !z.includes('outside'))) return 'dhaka';
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
    if (cartStore.hasPreOrderItems && cartStore.hasPreOrderItems() && String(method).toUpperCase() === 'COD') {
      method = cartStore.getFirstOnlinePaymentMethod();
    }
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
      zoneBadge.textContent = `${selectedLabel} • ${feeText}`;
    }
    refreshCheckoutTotalsDOM();
  };

  window.applyCheckoutCouponCode = function() {
    const inp = document.getElementById('checkout-coupon-input');
    const msgEl = document.getElementById('checkout-coupon-msg');
    const code = (inp?.value || '').trim();
    if (cartStore.hasPreOrderItems && cartStore.hasPreOrderItems()) {
      cartStore.clearCoupon();
      refreshCheckoutTotalsDOM();
      return;
    }
    if (!code) {
      cartStore.clearCoupon();
      if (msgEl) {
        msgEl.className = 'text-[11px] font-bold text-slate-500 mt-1.5';
        msgEl.textContent = 'কুপন সরানো হয়েছে।';
      }
      refreshCheckoutTotalsDOM();
      return;
    }

    const res = cartStore.validateAndApplyCoupon(code);
    const isOk = Boolean(res.valid || res.success);
    if (msgEl) {
      msgEl.className = `text-[11px] font-bold mt-1.5 ${isOk ? 'text-emerald-600' : 'text-rose-600'}`;
      msgEl.textContent = res.message;
    }
    if (toast && toast.show) {
      toast.show({ type: isOk ? 'success' : 'error', title: isOk ? 'কুপন যুক্ত হয়েছে' : 'কুপন ত্রুটি', message: res.message });
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
      b.innerHTML = '✓ কপি হয়েছে';
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
  try {
    if (typeof window !== 'undefined' && window.__dcbdTrackAdEvent && cartStore.items && cartStore.items.length > 0) {
      window.__dcbdTrackAdEvent('InitiateCheckout', {
        value: cartStore.getGrandTotal(),
        items: cartStore.items
      });
    }
  } catch (e) {}

  const items = cartStore.items;
  if (items.length === 0) {
    return `
      <div class="py-24 text-center max-w-md mx-auto space-y-4">
        <div class="text-5xl">🛒</div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">আপনার কার্ট খালি</h2>
        <p class="text-xs text-slate-500">অর্ডার করতে প্রথমে কার্টে পণ্য যোগ করুন।</p>
        <a href="/products" class="btn-primary text-xs py-3 px-6 inline-flex">পণ্য দেখুন →</a>
      </div>
    `;
  }

  const hasPreOrder = cartStore.hasPreOrderItems ? cartStore.hasPreOrderItems() : items.some(it => isProductOutOfStock(it));
  if (hasPreOrder) {
    cartStore.enforcePreOrderRules();
  }

  const user = authStore.user || {};
  const activeDeliveryMethods = getGlobalDeliveryMethods(true);
  const allActivePaymentMethods = getGlobalPaymentMethods(true);
  // For Pre-Order (stock === 0), Cash on Delivery is strictly disabled
  const activePaymentMethods = hasPreOrder
    ? allActivePaymentMethods.filter(pm => mapPaymentCode(pm) !== 'COD')
    : allActivePaymentMethods;
  const effectivePaymentMethods = activePaymentMethods.length > 0
    ? activePaymentMethods
    : [{ code: 'BKASH_PERSONAL', name: 'বিকাশ পার্সোনাল', type: 'Personal', number: '01879653143', instruction: 'Send Money করে TrxID দিন।' }];

  const activeOffers = hasPreOrder ? [] : getGlobalOffers(true);
  const siteSettings = getGlobalSiteSettings();
  const onlineDiscPct = hasPreOrder ? 0 : Number(siteSettings.online_payment_discount_percent || siteSettings.onlineDiscountPct || 5);

  const currentZone = cartStore.deliveryZone || mapDeliveryKey(activeDeliveryMethods[0] || { id: 'dhaka' });
  let currentPayment = cartStore.paymentMethod || mapPaymentCode(effectivePaymentMethods[0] || { code: 'COD' });
  if (hasPreOrder && (currentPayment === 'COD' || !effectivePaymentMethods.some(pm => mapPaymentCode(pm) === currentPayment))) {
    currentPayment = mapPaymentCode(effectivePaymentMethods[0]);
    cartStore.paymentMethod = currentPayment;
  }

  const subtotal = cartStore.getSubtotal();
  const deliveryFee = cartStore.getDeliveryCharge();
  const isFreeDelivery = cartStore.isFreeDelivery();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const couponDiscount = cartStore.getCouponDiscount ? cartStore.getCouponDiscount() : 0;
  const grandTotal = cartStore.getGrandTotal();

  return `
    <style id="dcbd-checkout-clean-styles">
      @keyframes ckFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .ck-page-wrap {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0.5rem 0 5.5rem;
      }
      .ck-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding-bottom: 1rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid rgba(226, 232, 240, 0.85);
        animation: ckFadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .dark .ck-header {
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }
      .ck-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 22px;
        padding: 1.35rem 1.5rem;
        box-shadow: 0 4px 20px -6px rgba(15, 23, 42, 0.06);
        transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        animation: ckFadeUp 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .ck-card:nth-child(2) { animation-delay: 0.06s; }
      .ck-card:nth-child(3) { animation-delay: 0.12s; }
      .ck-card:hover {
        border-color: rgba(16, 185, 129, 0.35);
        box-shadow: 0 10px 28px -8px rgba(16, 185, 129, 0.12);
      }
      .dark .ck-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 6px 24px -6px rgba(0, 0, 0, 0.4);
      }
      .dark .ck-card:hover {
        border-color: rgba(16, 185, 129, 0.35);
      }
      .ck-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding-bottom: 0.85rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid rgba(241, 245, 249, 1);
      }
      .dark .ck-card-head {
        border-bottom-color: rgba(255, 255, 255, 0.06);
      }
      .ck-step-badge {
        width: 26px;
        height: 26px;
        border-radius: 9px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #ffffff;
        font-size: 0.75rem;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3);
        flex-shrink: 0;
      }
      .ck-card-title {
        font-size: 0.95rem;
        font-weight: 800;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin: 0;
      }
      .dark .ck-card-title {
        color: #f8fafc;
      }
      .ck-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: #334155;
        margin-bottom: 0.38rem;
      }
      .dark .ck-label {
        color: #cbd5e1;
      }
      .ck-input, .checkout-select {
        width: 100%;
        padding: 0.7rem 0.95rem;
        border-radius: 13px;
        font-size: 0.84rem;
        font-weight: 600;
        outline: none;
        transition: all 0.2s ease;
        background-color: #f8fafc;
        color: #0f172a;
        border: 1.5px solid #e2e8f0;
      }
      .ck-input:focus, .checkout-select:focus {
        background-color: #ffffff;
        border-color: #10b981;
        box-shadow: 0 0 0 3.5px rgba(16, 185, 129, 0.14);
      }
      .dark .ck-input, .dark .checkout-select {
        background-color: #1e293b !important;
        color: #f8fafc !important;
        border-color: #334155 !important;
      }
      .dark .ck-input:focus, .dark .checkout-select:focus {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 3.5px rgba(16, 185, 129, 0.2) !important;
      }
      .dark .checkout-select option {
        background-color: #1e293b;
        color: #f8fafc;
      }
      .ck-preorder-banner {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.8rem 1rem;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08));
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #b45309;
        font-size: 0.76rem;
        font-weight: 700;
      }
      .dark .ck-preorder-banner {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(245, 158, 11, 0.35);
        color: #fbbf24;
      }
      .pm-detail-surface {
        background-color: #f8fafc;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        border-radius: 15px;
        padding: 0.95rem 1.05rem;
        animation: ckFadeUp 0.25s ease both;
      }
      .dark .pm-detail-surface {
        background-color: #1e293b !important;
        border-color: #334155 !important;
        color: #f8fafc !important;
      }
      .pm-num-chip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.6rem 0.85rem;
        border-radius: 11px;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        color: #0f172a;
      }
      .dark .pm-num-chip {
        background-color: #0f172a !important;
        border-color: #334155 !important;
        color: #f8fafc !important;
      }
      .ck-confirm-btn {
        width: 100%;
        padding: 0.95rem 1.25rem;
        border-radius: 15px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-size: 0.92rem;
        font-weight: 800;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        box-shadow: 0 10px 24px -6px rgba(16, 185, 129, 0.5);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }
      .ck-confirm-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px -6px rgba(16, 185, 129, 0.6);
      }
      .ck-confirm-btn:active {
        transform: scale(0.98);
      }
      @media (max-width: 640px) {
        .ck-card {
          padding: 1.1rem 1.15rem;
          border-radius: 18px;
        }
      }
    </style>

    <div class="ck-page-wrap">
      
      <!-- Clean Compact Header -->
      <div class="ck-header">
        <div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            <a href="/cart" class="hover:text-emerald-600 transition">কার্ট</a>
            <span>/</span>
            <span class="text-slate-700 dark:text-slate-300 font-bold">চেকআউট</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            অর্ডার সম্পন্ন করুন
          </h1>
        </div>

      </div>

      <form id="checkout-form" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column (7 cols) -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- 1. Customer & Delivery Info -->
          <div class="ck-card space-y-4">
            <div class="ck-card-head">
              <h3 class="ck-card-title">
                <span class="ck-step-badge">১</span>
                <span>ডেলিভারি তথ্য</span>
              </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="checkout-name" class="ck-label">নাম <span class="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  id="checkout-name" 
                  required 
                  value="${user.name || user.shop_name || ''}"
                  placeholder="আপনার পূর্ণ নাম" 
                  class="ck-input"
                />
              </div>

              <div>
                <label for="checkout-phone" class="ck-label">মোবাইল নম্বর <span class="text-rose-500">*</span></label>
                <input 
                  type="tel" 
                  id="checkout-phone" 
                  required 
                  pattern="[0-9]{11}" 
                  value="${user.mobile || user.phone || ''}"
                  placeholder="01XXXXXXXXX" 
                  class="ck-input font-mono"
                />
              </div>
            </div>

            <div>
              <label for="checkout-address" class="ck-label">সম্পূর্ণ ঠিকানা <span class="text-rose-500">*</span></label>
              <textarea 
                id="checkout-address" 
                required 
                rows="2" 
                placeholder="বাসা/রোড, এলাকা, থানা ও জেলা" 
                class="ck-input leading-relaxed"
              >${user.address || ''}</textarea>
            </div>

            <div>
              <label for="checkout-note" class="ck-label">নোট (ঐচ্ছিক)</label>
              <input 
                type="text"
                id="checkout-note" 
                placeholder="কালার, সাইজ বা বিশেষ নির্দেশনা" 
                class="ck-input"
              />
            </div>
          </div>

          <!-- 2. Delivery Area -->
          <div class="ck-card space-y-3">
            <div class="ck-card-head">
              <h3 class="ck-card-title">
                <span class="ck-step-badge">২</span>
                <span>ডেলিভারি এরিয়া</span>
              </h3>
              ${isFreeDelivery ? `<span class="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">ফ্রি ডেলিভারি</span>` : ''}
            </div>

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
                  <option value="${key}" data-zone-name="${dm.zone}" ${currentZone === key ? 'selected' : ''}>
                    ${dm.zone} — ${chargeTxt} (${dm.time || '২-৩ দিন'})
                  </option>
                `;
              }).join('')}
            </select>
            <span id="delivery-zone-summary-text" class="hidden"></span>
          </div>

          <!-- 3. Payment Method -->
          <div class="ck-card space-y-4">
            <div class="ck-card-head">
              <h3 class="ck-card-title">
                <span class="ck-step-badge">৩</span>
                <span>পেমেন্ট পদ্ধতি</span>
              </h3>
              ${!hasPreOrder && onlineDiscPct > 0 ? `
                <span class="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                  অনলাইন পেমেন্টে ${onlineDiscPct}% ছাড়
                </span>
              ` : ''}
            </div>

            <select 
              id="checkout-payment-method" 
              name="payment_method" 
              onchange="window.switchCheckoutPayment && window.switchCheckoutPayment(this.value)"
              class="checkout-select font-bold"
            >
              ${effectivePaymentMethods.map(pm => {
                const code = mapPaymentCode(pm);
                const isCod = code === 'COD';
                const discTag = (!hasPreOrder && !isCod && Number(pm.discount || onlineDiscPct) > 0) ? ` (${pm.discount || onlineDiscPct}% ছাড়)` : '';
                const icon = isCod ? '💵' : (code.includes('BKASH') ? '🌸' : (code.includes('NAGAD') ? '🔥' : (code.includes('ROCKET') ? '🚀' : '🏦')));
                return `<option value="${code}" ${currentPayment === code ? 'selected' : ''}>${icon} ${pm.name}${discTag}</option>`;
              }).join('')}
            </select>

            <!-- Payment Details Panels -->
            <div id="payment-instruction-container" class="space-y-3">
              ${effectivePaymentMethods.map(pm => {
                const code = mapPaymentCode(pm);
                const isSelected = currentPayment === code;

                if (code === 'COD') {
                  return `
                    <div id="payment-panel-COD" class="payment-method-panel ${isSelected ? '' : 'hidden'} pm-detail-surface text-xs">
                      <div class="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                        <span>🚚</span>
                        <span>পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।</span>
                      </div>
                    </div>
                  `;
                }

                if (code === 'BKASH_PAYMENT' || String(pm.number || '').startsWith('http')) {
                  const payUrl = String(pm.number || 'https://shop.bkash.com/j-a-sagor-computer01581703822/paymentlink').trim();
                  return `
                    <div id="payment-panel-${code}" class="payment-method-panel ${isSelected ? '' : 'hidden'} pm-detail-surface text-xs space-y-2.5">
                      <a href="${payUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-sm transition">
                        <span>💳 ${pm.name} ওপেন করুন</span>
                        <span>↗</span>
                      </a>
                    </div>
                  `;
                }

                if (code === 'BANK') {
                  const accNum = String(pm.number || '20508070200030208').trim();
                  return `
                    <div id="payment-panel-BANK" class="payment-method-panel ${isSelected ? '' : 'hidden'} pm-detail-surface text-xs space-y-2">
                      <div class="pm-num-chip">
                        <div>
                          <div class="text-[10px] text-slate-500 dark:text-slate-400">${pm.name}</div>
                          <div class="font-black font-mono text-blue-600 dark:text-blue-400 text-sm">${accNum}</div>
                        </div>
                        <button type="button" onclick="window.copyCheckoutText('${accNum}', this)" class="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-bold cursor-pointer">
                          কপি
                        </button>
                      </div>
                    </div>
                  `;
                }

                const numbers = String(pm.number || '01879653143').split(/[,|/]/).map(s => s.trim()).filter(Boolean);
                return `
                  <div id="payment-panel-${code}" class="payment-method-panel ${isSelected ? '' : 'hidden'} pm-detail-surface text-xs space-y-2">
                    ${numbers.map((num, nIdx) => `
                      <div class="pm-num-chip">
                        <div>
                          <div class="text-[10px] text-slate-500 dark:text-slate-400">${pm.name} (${pm.type || 'Personal'})${numbers.length > 1 ? ` #${nIdx + 1}` : ''}</div>
                          <div class="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">${num}</div>
                        </div>
                        <button type="button" onclick="window.copyCheckoutText('${num.replace(/[^0-9]/g, '')}', this)" class="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition cursor-pointer">
                          কপি
                        </button>
                      </div>
                    `).join('')}
                  </div>
                `;
              }).join('')}

              <!-- Transaction ID Input -->
              <div id="checkout-trxid-container" class="${currentPayment === 'COD' ? 'hidden' : ''} pt-1" style="${currentPayment === 'COD' ? 'display: none;' : 'display: block;'}">
                <label for="checkout-trxid" class="ck-label">ট্রানজেকশন আইডি (TrxID) <span class="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  id="checkout-trxid" 
                  placeholder="যেমন: 9K2840FJA2" 
                  class="ck-input font-mono uppercase"
                />
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Order Summary (5 cols) -->
        <div class="lg:col-span-5 sticky top-20">
          <div class="ck-card space-y-4">
            
            <div class="ck-card-head">
              <h3 class="ck-card-title">
                <span>🛒</span>
                <span>অর্ডার সামারি (${items.length})</span>
              </h3>
              <a href="/cart" class="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">সম্পাদনা</a>
            </div>

            <!-- Itemized List -->
            <div class="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto pr-1">
              ${items.map(it => {
                const isPre = isProductOutOfStock(it);
                return `
                  <div class="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <img src="${it.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}" class="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white" />
                      <div class="min-w-0">
                        <div class="font-bold text-slate-800 dark:text-slate-100 truncate">${it.name}</div>
                        <div class="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span>${it.quantity} × ${formatCurrency(it.price)}</span>
                          ${isPre ? `<span class="bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded text-[9.5px] font-bold">প্রি-অর্ডার</span>` : ''}
                          ${it.color ? `<span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9.5px] font-semibold">${it.color}</span>` : ''}
                          ${it.size ? `<span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9.5px] font-semibold">${it.size}</span>` : ''}
                        </div>
                      </div>
                    </div>
                    <div class="font-extrabold text-slate-900 dark:text-white flex-shrink-0 text-xs font-mono">
                      ${formatCurrency(Number(it.price) * Number(it.quantity))}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>

            <!-- Coupon Box (Silently Hidden for Pre-Order) -->
            ${hasPreOrder ? '' : `
              <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    id="checkout-coupon-input" 
                    value="${cartStore.couponCode || ''}" 
                    placeholder="কুপন কোড" 
                    class="ck-input text-xs font-mono uppercase flex-1 !py-2"
                  />
                  <button 
                    type="button" 
                    onclick="window.applyCheckoutCouponCode()" 
                    class="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer flex-shrink-0"
                  >
                    এপ্লাই
                  </button>
                </div>
                <div id="checkout-coupon-msg" class="text-[11px] font-bold mt-1.5 ${couponDiscount > 0 ? 'text-emerald-600' : 'text-slate-400'}">
                  ${couponDiscount > 0 ? `✓ কুপন ছাড়: ৳${couponDiscount}` : (activeOffers.length > 0 ? `কুপন: ${activeOffers.slice(0, 2).map(o => o.code).join(', ')}` : '')}
                </div>
              </div>
            `}

            <!-- Totals -->
            <div class="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div class="flex justify-between">
                <span>সাবটোটাল</span>
                <span id="summary-subtotal" class="font-bold text-slate-900 dark:text-white">${formatCurrency(subtotal)}</span>
              </div>

              <div class="flex justify-between">
                <span>ডেলিভারি চার্জ</span>
                <span id="summary-delivery-charge" class="font-bold text-slate-900 dark:text-white">
                  ${isFreeDelivery ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold">ফ্রি (৳০)</span>' : formatCurrency(deliveryFee)}
                </span>
              </div>

              <div id="summary-online-discount-row" class="flex justify-between text-emerald-600 font-bold ${onlineDiscount > 0 ? '' : 'hidden'}">
                <span>অনলাইন পেমেন্ট ছাড় (${onlineDiscPct}%)</span>
                <span id="summary-online-discount-amount">-${formatCurrency(onlineDiscount)}</span>
              </div>

              <div id="summary-coupon-discount-row" class="flex justify-between text-amber-600 font-bold ${couponDiscount > 0 ? '' : 'hidden'}">
                <span>কুপন ছাড়</span>
                <span id="summary-coupon-discount-amount">-${formatCurrency(couponDiscount)}</span>
              </div>

              <div class="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline text-base font-black text-slate-900 dark:text-white">
                <span>সর্বমোট</span>
                <span id="summary-grand-total" class="text-emerald-600 dark:text-emerald-400 font-extrabold text-xl font-mono">${formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <!-- Confirm Button -->
            <button type="submit" id="btn-confirm-order" class="ck-confirm-btn">
              <span>✓</span>
              <span id="btn-confirm-order-text">অর্ডার নিশ্চিত করুন (${formatCurrency(grandTotal)})</span>
            </button>

          </div>
        </div>

      </form>

    </div>
  `;
}
