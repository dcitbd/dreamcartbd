/**
 * DREAM CART BD — CHECKOUT PAGE
 * Streamlined mobile/desktop checkout with authentic delivery zones,
 * free shipping over ৳2,000, 5% online prepayment discount,
 * bKash/Nagad/Rocket/Bank account details, and instant order placement.
 */

import { cartStore } from '../../store/cartStore.js';
import { formatCurrency } from '../../utils/format.js';

export function renderCheckoutPage() {
  const items = cartStore.items;
  const subtotal = cartStore.getSubtotal();
  const delivery = cartStore.getDeliveryCharge();
  const couponDiscount = cartStore.getCouponDiscount();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const grandTotal = cartStore.getGrandTotal();
  const selectedZone = cartStore.deliveryZone;
  const selectedPayment = cartStore.paymentMethod;
  const isFree = cartStore.isFreeDelivery();

  if (items.length === 0) {
    return `
      <div class="max-w-md mx-auto py-20 text-center">
        <div class="text-5xl mb-4">🛒</div>
        <h2 class="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p class="text-xs text-slate-500 mt-2 mb-6">Please select products before proceeding to checkout.</p>
        <a href="#/shop" class="btn-primary text-xs py-2.5 px-6">Return to Catalog</a>
      </div>
    `;
  }

  return `
    <div class="max-w-5xl mx-auto space-y-8 pb-20">
      
      <!-- Checkout Header Banner -->
      <div class="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl border border-emerald-900/60 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <span>✓</span> অফিসিয়াল ড্রিম কার্ট বিডি চেকআউট
          </div>
          <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight">Express Checkout</h1>
          <p class="text-xs text-slate-300 mt-1">
            📍 চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।
          </p>
        </div>
        <div class="text-xs text-emerald-300 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur">
          <div>📞 হেল্পলাইন: <strong>01581703822</strong> (WhatsApp)</div>
          <div class="mt-1">⏰ অফিস সময়: প্রতিদিন সকাল ৮:০০ - রাত ১০:০০</div>
        </div>
      </div>

      <!-- Special Notice & Offer Banners -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
          <span class="text-2xl">🚚</span>
          <div>
            <div class="font-black text-emerald-800">২০০০ টাকার বেশি শপিং করলে ডেলিভারি চার্জ ফ্রি!</div>
            <div class="text-[11px] text-emerald-700">সারা বাংলাদেশে যে কোনো পণ্যের অর্ডারে প্রযোজ্য।</div>
          </div>
        </div>
        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <span class="text-2xl">🔥</span>
          <div>
            <div class="font-black text-amber-800">অনলাইনে পেমেন্ট করলে ৫% ইনস্ট্যান্ট ডিসকাউন্ট!</div>
            <div class="text-[11px] text-amber-700">bKash, Nagad, Rocket অথবা Bank Transfer এ পেমেন্ট করুন।</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column: Delivery & Payment Details Form -->
        <div class="lg:col-span-7 space-y-6">
          <form id="checkout-form" class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            
            <!-- Step 1: Customer Contact -->
            <div>
              <h3 class="font-black text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                গ্রাহকের নাম ও মোবাইল নম্বর
              </h3>

              <div class="space-y-4 mt-4">
                <div class="form-group">
                  <label class="form-label text-xs font-bold text-slate-700">আপনার পুরো নাম (Full Name) *</label>
                  <input 
                    type="text" 
                    id="checkout-name" 
                    required 
                    placeholder="যেমন: মো: জয়নাল আবেদীন" 
                    class="form-control text-sm"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label text-xs font-bold text-slate-700">সচল মোবাইল নম্বর (11 Digits Phone Number) *</label>
                  <div class="flex gap-2">
                    <div class="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-700">
                      🇧🇩 +88
                    </div>
                    <input 
                      type="tel" 
                      id="checkout-phone" 
                      required 
                      placeholder="01XXXXXXXXX" 
                      maxlength="11"
                      class="form-control text-sm font-medium"
                    />
                  </div>
                  <p class="text-[11px] text-slate-400 mt-1">অর্ডার কনফার্মেশন ও কুরিয়ার ট্র্যাকিংয়ের জন্য এই নম্বরে যোগাযোগ করা হবে।</p>
                </div>

                <div class="form-group">
                  <label class="form-label text-xs font-bold text-slate-700">ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা/উপজেলা/জেলা) *</label>
                  <textarea 
                    id="checkout-address" 
                    required 
                    rows="3" 
                    placeholder="যেমন: বাড়ি নং ১২, রোড নং ৪, পদুয়ার বাজার, কুমিল্লা অথবা আপনার বিস্তারিত ঠিকানা" 
                    class="form-control text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Step 2: Delivery Area Selection -->
            <div>
              <h3 class="font-black text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                ডেলিভারি এরিয়া ও চার্জ (Delivery Fee)
              </h3>

              ${isFree && selectedZone !== 'pickup' ? `
                <div class="my-3 p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                  <span>🎉</span>
                  <span>অভিনন্দন! আপনার অর্ডার ৳২,০০০ এর বেশি হওয়ায় সারা দেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি (৳০)!</span>
                </div>
              ` : ""}

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                
                <!-- Cumilla -->
                <label class="delivery-zone-card flex items-center justify-between p-3.5 rounded-2xl border ${selectedZone === 'cumilla' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center gap-3">
                    <input type="radio" name="delivery_zone" value="cumilla" ${selectedZone === 'cumilla' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                    <div>
                      <div class="text-xs font-bold text-slate-900">In Cumilla (কুমিল্লা সদর)</div>
                      <div class="text-[11px] text-slate-500">হোম ডেলিভারি</div>
                    </div>
                  </div>
                  <div class="text-xs font-black ${isFree ? 'text-emerald-600' : 'text-slate-900'}">
                    ${isFree ? '<span class="line-through text-slate-400 font-normal">৳70</span> ৳0' : '৳70'}
                  </div>
                </label>

                <!-- Dhaka -->
                <label class="delivery-zone-card flex items-center justify-between p-3.5 rounded-2xl border ${selectedZone === 'dhaka' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center gap-3">
                    <input type="radio" name="delivery_zone" value="dhaka" ${selectedZone === 'dhaka' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                    <div>
                      <div class="text-xs font-bold text-slate-900">In Dhaka (ঢাকার ভেতরে)</div>
                      <div class="text-[11px] text-slate-500">হোম ডেলিভারি</div>
                    </div>
                  </div>
                  <div class="text-xs font-black ${isFree ? 'text-emerald-600' : 'text-slate-900'}">
                    ${isFree ? '<span class="line-through text-slate-400 font-normal">৳90</span> ৳0' : '৳90'}
                  </div>
                </label>

                <!-- Out of Dhaka -->
                <label class="delivery-zone-card flex items-center justify-between p-3.5 rounded-2xl border ${selectedZone === 'outside' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center gap-3">
                    <input type="radio" name="delivery_zone" value="outside" ${selectedZone === 'outside' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                    <div>
                      <div class="text-xs font-bold text-slate-900">Out of Dhaka (ঢাকার বাইরে)</div>
                      <div class="text-[11px] text-slate-500">সারা বাংলাদেশ</div>
                    </div>
                  </div>
                  <div class="text-xs font-black ${isFree ? 'text-emerald-600' : 'text-slate-900'}">
                    ${isFree ? '<span class="line-through text-slate-400 font-normal">৳120</span> ৳0' : '৳120'}
                  </div>
                </label>

                <!-- Office Pickup -->
                <label class="delivery-zone-card flex items-center justify-between p-3.5 rounded-2xl border ${selectedZone === 'pickup' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center gap-3">
                    <input type="radio" name="delivery_zone" value="pickup" ${selectedZone === 'pickup' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                    <div>
                      <div class="text-xs font-bold text-slate-900">Office Pickup (অফিস পিকআপ)</div>
                      <div class="text-[11px] text-slate-500">পদুয়ার বাজার, কুমিল্লা</div>
                    </div>
                  </div>
                  <div class="text-xs font-black text-emerald-600">৳0 (Free)</div>
                </label>

              </div>
            </div>

            <!-- Step 3: Payment Method Selection -->
            <div>
              <h3 class="font-black text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                পেমেন্ট পদ্ধতি (Payment Method)
              </h3>

              <div class="space-y-3 mt-4">
                
                <!-- Cash On Delivery -->
                <label class="payment-method-card flex flex-col p-4 rounded-2xl border ${selectedPayment === 'COD' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <input type="radio" name="payment_method" value="COD" ${selectedPayment === 'COD' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                      <div>
                        <div class="text-xs font-black text-slate-900">Cash On Delivery (COD)</div>
                        <div class="text-[11px] text-slate-500">পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন</div>
                      </div>
                    </div>
                    <span class="badge badge-success text-[10px]">জনপ্রিয়</span>
                  </div>
                </label>

                <!-- bKash Payment (Merchant) -->
                <label class="payment-method-card flex flex-col p-4 rounded-2xl border ${selectedPayment === 'BKASH_PAYMENT' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <input type="radio" name="payment_method" value="BKASH_PAYMENT" ${selectedPayment === 'BKASH_PAYMENT' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                      <div>
                        <div class="text-xs font-black text-slate-900 flex items-center gap-2">
                          <span>Bkash Payment (Merchant)</span>
                          <span class="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded">৫% ছাড়</span>
                        </div>
                        <div class="text-[11px] text-slate-500">মার্চেন্ট নম্বর: <strong>01581703822</strong> অথবা ডিরেক্ট পেমেন্ট লিংক</div>
                      </div>
                    </div>
                    <span class="text-xs font-black text-pink-600 font-mono">bKash Merchant</span>
                  </div>
                  
                  <div class="payment-details ${selectedPayment === 'BKASH_PAYMENT' ? 'block' : 'hidden'} mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-700 space-y-2">
                    <div class="bg-pink-50 p-3 rounded-xl border border-pink-200">
                      <p><strong>বিকাশ পেমেন্ট নির্দেশনা:</strong> বিকাশ অ্যাপ থেকে "Make Payment" অপশন ব্যবহার করে মার্চেন্ট নম্বর <strong class="text-pink-700 font-mono text-sm">01581703822</strong> এ পেমেন্ট করুন অথবা নিচের অনলাইন লিংক ব্যবহার করুন:</p>
                      <a href="https://shop.bkash.com/j-a-sagor-computer01581703822/paymentlink" target="_blank" class="inline-flex items-center gap-1.5 mt-2 bg-pink-600 hover:bg-pink-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition">
                        <span>🔗</span> সরাসরি বিকাশ পেমেন্ট লিংকে ক্লিক করুন →
                      </a>
                    </div>
                  </div>
                </label>

                <!-- bKash Personal -->
                <label class="payment-method-card flex flex-col p-4 rounded-2xl border ${selectedPayment === 'BKASH_PERSONAL' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <input type="radio" name="payment_method" value="BKASH_PERSONAL" ${selectedPayment === 'BKASH_PERSONAL' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                      <div>
                        <div class="text-xs font-black text-slate-900 flex items-center gap-2">
                          <span>Bkash Personal (Send Money)</span>
                          <span class="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded">৫% ছাড়</span>
                        </div>
                        <div class="text-[11px] text-slate-500">পার্সোনাল নম্বর: <strong>01879653143</strong></div>
                      </div>
                    </div>
                    <span class="text-xs font-black text-pink-600 font-mono">01879653143</span>
                  </div>
                  
                  <div class="payment-details ${selectedPayment === 'BKASH_PERSONAL' ? 'block' : 'hidden'} mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-700 space-y-2">
                    <div class="bg-pink-50 p-3 rounded-xl border border-pink-200">
                      <p>আপনার বিকাশ অ্যাপ থেকে <strong class="font-mono text-sm text-pink-700">01879653143</strong> নম্বরে Send Money করুন এবং নিচে ট্রানজেকশন আইডি (TrxID) প্রদান করুন।</p>
                    </div>
                  </div>
                </label>

                <!-- Nagad Personal -->
                <label class="payment-method-card flex flex-col p-4 rounded-2xl border ${selectedPayment === 'NAGAD_PERSONAL' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <input type="radio" name="payment_method" value="NAGAD_PERSONAL" ${selectedPayment === 'NAGAD_PERSONAL' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                      <div>
                        <div class="text-xs font-black text-slate-900 flex items-center gap-2">
                          <span>Nagad Personal (Send Money)</span>
                          <span class="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded">৫% ছাড়</span>
                        </div>
                        <div class="text-[11px] text-slate-500">নগদ পার্সোনাল নম্বর: <strong>01879653143</strong></div>
                      </div>
                    </div>
                    <span class="text-xs font-black text-orange-600 font-mono">01879653143</span>
                  </div>

                  <div class="payment-details ${selectedPayment === 'NAGAD_PERSONAL' ? 'block' : 'hidden'} mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-700 space-y-2">
                    <div class="bg-orange-50 p-3 rounded-xl border border-orange-200">
                      <p>আপনার নগদ অ্যাকাউন্ট থেকে <strong class="font-mono text-sm text-orange-700">01879653143</strong> নম্বরে Send Money করুন এবং ট্রানজেকশন আইডি নিচে লিখুন।</p>
                    </div>
                  </div>
                </label>

                <!-- Rocket Personal -->
                <label class="payment-method-card flex flex-col p-4 rounded-2xl border ${selectedPayment === 'ROCKET_PERSONAL' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <input type="radio" name="payment_method" value="ROCKET_PERSONAL" ${selectedPayment === 'ROCKET_PERSONAL' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                      <div>
                        <div class="text-xs font-black text-slate-900 flex items-center gap-2">
                          <span>Rocket Personal (Send Money)</span>
                          <span class="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">৫% ছাড়</span>
                        </div>
                        <div class="text-[11px] text-slate-500">রকেট পার্সোনাল নম্বর: <strong>01581703822</strong></div>
                      </div>
                    </div>
                    <span class="text-xs font-black text-purple-600 font-mono">01581703822</span>
                  </div>

                  <div class="payment-details ${selectedPayment === 'ROCKET_PERSONAL' ? 'block' : 'hidden'} mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-700 space-y-2">
                    <div class="bg-purple-50 p-3 rounded-xl border border-purple-200">
                      <p>আপনার রকেট অ্যাকাউন্ট থেকে <strong class="font-mono text-sm text-purple-700">01581703822</strong> নম্বরে Send Money করুন।</p>
                    </div>
                  </div>
                </label>

                <!-- Bank Account -->
                <label class="payment-method-card flex flex-col p-4 rounded-2xl border ${selectedPayment === 'BANK' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <input type="radio" name="payment_method" value="BANK" ${selectedPayment === 'BANK' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                      <div>
                        <div class="text-xs font-black text-slate-900 flex items-center gap-2">
                          <span>Bank Account (Islami Bank)</span>
                          <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">৫% ছাড়</span>
                        </div>
                        <div class="text-[11px] text-slate-500">ইসলামী ব্যাংক বাংলাদেশ পিএলসি</div>
                      </div>
                    </div>
                    <span class="badge badge-info text-[10px]">ব্যাংক ট্রান্সফার</span>
                  </div>

                  <div class="payment-details ${selectedPayment === 'BANK' ? 'block' : 'hidden'} mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-700 space-y-2">
                    <div class="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                      <div>A/C Name: <strong>Jainal Abedin</strong></div>
                      <div>A/C Number: <strong class="text-emerald-800 text-sm">20508070200030208</strong></div>
                      <div>Branch: <strong>Maheshkhali Sub branch</strong></div>
                      <div>Routing No: <strong>125260525</strong></div>
                      <div>Bank Code/SWIFT: <strong>IBBLBDDH</strong> (Islami Bank Bangladesh PLC)</div>
                    </div>
                  </div>
                </label>

                <!-- Cash Payment (Office pickup) -->
                <label class="payment-method-card flex flex-col p-4 rounded-2xl border ${selectedPayment === 'CASH_PICKUP' ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'} cursor-pointer transition">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <input type="radio" name="payment_method" value="CASH_PICKUP" ${selectedPayment === 'CASH_PICKUP' ? 'checked' : ''} class="text-emerald-600 focus:ring-emerald-500" />
                      <div>
                        <div class="text-xs font-black text-slate-900">Cash Payment (অফিস কাউন্টার)</div>
                        <div class="text-[11px] text-slate-500">আমাদের কুমিল্লা অফিসে পণ্য গ্রহণের সময় ক্যাশ পরিশোধ</div>
                      </div>
                    </div>
                    <span class="badge badge-success text-[10px]">অফিস কাউন্টার</span>
                  </div>
                </label>

              </div>

              <!-- Transaction ID Input (Shown when online prepayment selected) -->
              <div id="trx-container" class="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 ${cartStore.isOnlinePayment() ? 'block' : 'hidden'} space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>📝</span> অনলাইন পেমেন্ট ভেরিফিকেশন তথ্য
                  </span>
                  <span class="text-[10px] font-bold text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-full">৫% ছাড় সক্রিয়</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="text-[11px] font-bold text-slate-700 block mb-1">যে নম্বর/অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন</label>
                    <input 
                      type="text" 
                      id="checkout-sender-phone" 
                      placeholder="যেমন: 01XXXXXXXXX" 
                      class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label class="text-[11px] font-bold text-slate-700 block mb-1">Transaction ID (TrxID) *</label>
                    <input 
                      type="text" 
                      id="checkout-trx-id" 
                      placeholder="যেমন: BL72X99AAQ" 
                      class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:border-emerald-600 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

            </div>

            <!-- Submit Order CTA -->
            <button 
              type="submit" 
              id="btn-confirm-order" 
              class="btn-primary w-full py-4 text-base font-extrabold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 mt-4 flex items-center justify-center gap-2"
            >
              <span>অর্ডার কনফার্ম করুন</span>
              <span id="btn-confirm-total-badge">(${formatCurrency(grandTotal)})</span>
            </button>
            <p class="text-[11px] text-center text-slate-400">
              🔒 সিকিউর সার্ভার-সাইড এনক্রিপ্টেড অর্ডার প্রসেসিং ও এসএমএস কনফার্মেশন।
            </p>
          </form>
        </div>

        <!-- Right Column: Order Summary -->
        <div class="lg:col-span-5">
          <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 sticky top-24">
            <div class="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 class="font-black text-slate-900 text-base">
                Order Summary (${items.length} items)
              </h3>
              <a href="#/shop" class="text-xs text-emerald-600 font-bold hover:underline">+ Add More</a>
            </div>

            <div class="divide-y divide-slate-100 max-h-72 overflow-y-auto space-y-2 pr-1">
              ${items.map(it => `
                <div class="flex items-center gap-3 py-2">
                  <img src="${it.thumbnail}" alt="${it.name}" class="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <h5 class="text-xs font-bold text-slate-800 truncate">${it.name}</h5>
                    <div class="text-[11px] text-slate-500">${it.quantity} × ${formatCurrency(it.price)}</div>
                  </div>
                  <div class="text-xs font-bold text-slate-900">
                    ${formatCurrency(it.price * it.quantity)}
                  </div>
                </div>
              `).join("")}
            </div>

            <!-- Financial Breakdown -->
            <div class="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div class="flex justify-between">
                <span>Subtotal (পণ্যের মূল্য):</span>
                <span class="font-bold text-slate-800">${formatCurrency(subtotal)}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span>Delivery Charge (ডেলিভারি ফি):</span>
                <span id="summary-delivery-charge" class="font-bold ${delivery === 0 ? 'text-emerald-600' : 'text-slate-800'}">
                  ${delivery === 0 ? '<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">ফ্রি (৳০)</span>' : formatCurrency(delivery)}
                </span>
              </div>

              ${couponDiscount > 0 ? `
                <div class="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-${formatCurrency(couponDiscount)}</span>
                </div>
              ` : ""}

              <div id="summary-online-discount-row" class="flex justify-between text-emerald-600 font-bold ${onlineDiscount > 0 ? '' : 'hidden'}">
                <span>Online Prepayment (৫% ছাড়):</span>
                <span id="summary-online-discount-amount">-${formatCurrency(onlineDiscount)}</span>
              </div>

              <div class="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>সর্বমোট (Grand Total):</span>
                <span id="summary-grand-total" class="text-emerald-700 text-lg font-black">${formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <!-- Notice Box -->
            <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
              <div class="flex items-center gap-1.5 font-bold text-slate-800">
                <span>🛡️</span>
                <span>Dream Cart BD গ্যারান্টি:</span>
              </div>
              <p class="text-[11px] leading-relaxed text-slate-500">
                ১০০% অরিজিনাল প্রোডাক্ট, ৭ দিনের রিপ্লেসমেন্ট ওয়ারেন্টি এবং কুরিয়ার থেকে পণ্য চেক করে রিসিভ করার সুযোগ।
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  `;
}
