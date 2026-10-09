/**
 * DREAM CART BD — ORDER CHECKOUT PAGE (CheckoutPage.js)
 * Implements user requirements:
 * - Customer info: Name, Phone, Delivery Address, Account Type
 * - Option for Color, Size or Special Delivery Note
 * - Itemized list showing selected Color & Size badges
 * - Payment methods (Cash On Delivery, Bkash Personal, Bkash Payment, Nagad Personal, Rocket Personal, Bank Account, Cash Payment)
 * - Display authentic payment account details & Bkash payment link
 * - Delivery area selector with dynamic fees (Cumilla ৳70, Dhaka ৳90, Outside ৳120, Office Pickup ৳0)
 * - Auto-calculate 2,000 BDT free shipping discount
 * - Auto-calculate 5% online prepayment discount
 * - Order submission -> saves to Orders sheet & redirects to Order Success with Voucher
 */

import { cartStore } from '../../store/cartStore.js';
import { authStore } from '../../store/authStore.js';
import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../components/Toast.js';
import { router } from '../../router.js';

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
  const currentPayment = cartStore.paymentMethod;
  const subtotal = cartStore.getSubtotal();
  const deliveryFee = cartStore.getDeliveryCharge();
  const isFreeDelivery = cartStore.isFreeDelivery();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const grandTotal = cartStore.getGrandTotal();
  const accountType = authStore.getAccountType();

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
              <span>বিকাশ, নগদ বা রকেটে অগ্রিম পেমেন্ট করলে পাবেন <strong class="underline">৫% তাৎক্ষণিক ছাড়!</strong></span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              
              <!-- COD -->
              <label class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'COD' ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="COD" ${currentPayment === 'COD' ? 'checked' : ''} class="w-4 h-4 text-emerald-600" />
                  <span class="font-bold text-slate-800 dark:text-slate-200">ক্যাশ অন ডেলিভারি (COD)</span>
                </div>
                <span class="text-xs">💵</span>
              </label>

              <!-- bKash Personal -->
              <label class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'BKASH_PERSONAL' ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="BKASH_PERSONAL" ${currentPayment === 'BKASH_PERSONAL' ? 'checked' : ''} class="w-4 h-4 text-emerald-600" />
                  <span class="font-bold text-pink-600">বিকাশ পার্সোনাল (৫% ছাড়)</span>
                </div>
                <span class="text-xs font-mono font-bold text-pink-600">bKash</span>
              </label>

              <!-- bKash Payment (Merchant) -->
              <label class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'BKASH_PAYMENT' ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="BKASH_PAYMENT" ${currentPayment === 'BKASH_PAYMENT' ? 'checked' : ''} class="w-4 h-4 text-emerald-600" />
                  <span class="font-bold text-pink-700">বিকাশ পেমেন্ট লিংক (৫% ছাড়)</span>
                </div>
                <span class="badge badge-info text-[9px]">লিংক</span>
              </label>

              <!-- Nagad Personal -->
              <label class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'NAGAD_PERSONAL' ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="NAGAD_PERSONAL" ${currentPayment === 'NAGAD_PERSONAL' ? 'checked' : ''} class="w-4 h-4 text-emerald-600" />
                  <span class="font-bold text-orange-600">নগদ পার্সোনাল (৫% ছাড়)</span>
                </div>
                <span class="text-xs font-mono font-bold text-orange-600">Nagad</span>
              </label>

              <!-- Rocket Personal -->
              <label class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'ROCKET_PERSONAL' ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="ROCKET_PERSONAL" ${currentPayment === 'ROCKET_PERSONAL' ? 'checked' : ''} class="w-4 h-4 text-emerald-600" />
                  <span class="font-bold text-purple-600">রকেট পার্সোনাল (৫% ছাড়)</span>
                </div>
                <span class="text-xs font-mono font-bold text-purple-600">Rocket</span>
              </label>

              <!-- Bank Account -->
              <label class="payment-option p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${currentPayment === 'BANK' ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="payment_method" value="BANK" ${currentPayment === 'BANK' ? 'checked' : ''} class="w-4 h-4 text-emerald-600" />
                  <span class="font-bold text-blue-600">ব্যাংক ট্রান্সফার (৫% ছাড়)</span>
                </div>
                <span class="text-xs">🏦</span>
              </label>

            </div>

            <!-- Dynamic Online Payment Details Panel -->
            <div id="online-payment-details" class="${cartStore.isOnlinePayment() ? '' : 'hidden'} p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
              <div class="font-bold text-emerald-900 dark:text-emerald-200">
                পেমেন্ট সম্পন্ন করার তথ্য:
              </div>
              
              <div class="space-y-1.5 text-slate-700 dark:text-slate-300">
                <div><strong>বিকাশ পার্সোনাল নম্বর:</strong> <span class="font-mono text-emerald-700 dark:text-emerald-400 font-bold">01581703822</span> / <span class="font-mono text-emerald-700 dark:text-emerald-400 font-bold">01818273838</span> (Send Money)</div>
                <div><strong>নগদ পার্সোনাল নম্বর:</strong> <span class="font-mono text-orange-600 font-bold">01581703822</span> / <span class="font-mono text-orange-600 font-bold">01818273838</span> (Send Money)</div>
                <div><strong>রকেট পার্সোনাল নম্বর:</strong> <span class="font-mono text-purple-600 font-bold">01581703822-7</span> (Send Money)</div>
                <div>
                  <strong>বিকাশ অনলাইন পেমেন্ট লিংক:</strong> 
                  <a href="https://shop.bkash.com/dream-cart-bd01818273838/payment/link/default" target="_blank" rel="noopener noreferrer" class="text-pink-600 underline font-bold ml-1">
                    https://shop.bkash.com/dream-cart-bd... ↗
                  </a>
                </div>
                <div class="pt-1 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-200/60 text-[10px] leading-relaxed">
                  <strong>ব্যাংক অ্যাকাউন্ট তথ্য:</strong><br/>
                  ব্যাংক: Islami Bank Bangladesh PLC (IBBLBDDH)<br/>
                  অ্যাকাউন্ট নাম: Jainal Abedin<br/>
                  অ্যাকাউন্ট নম্বর: 20508070200030208<br/>
                  শাখা: Maheshkhali Sub branch (রাউটিং: 125260525)
                </div>
              </div>

              <!-- Transaction ID Input -->
              <div class="pt-2">
                <label class="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  পেমেন্ট ট্রানজেকশন আইডি (TrxID) <span class="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="checkout-trxid" 
                  placeholder="যেমন: 9K2840FJA2" 
                  class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-900 font-mono uppercase"
                />
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
                        <span>পরিমাণ: <strong>${it.quantity}</strong> টি × ${formatCurrency(it.price)}</span>
                        ${it.color ? `<span class="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">🎨 ${it.color}</span>` : ''}
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
