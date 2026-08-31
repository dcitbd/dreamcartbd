/**
 * ============================================================================
 * DREAM CART BD — 1-PAGE EXPRESS CHECKOUT (CheckoutPage.js)
 * ============================================================================
 */

import { Header } from "../../components/Header.js";
import { Footer } from "../../components/Footer.js";
import { store } from "../../js/store.js";
import { OrderAPI } from "../../api/orders.js";
import { router } from "../../js/router.js";

export const CheckoutPage = async () => {
  const cart = store.state.cart;

  if (!cart.items || cart.items.length === 0) {
    return `
      <div class="min-h-screen flex flex-col font-bengali bg-slate-50 dark:bg-luxury-dark">
        ${Header.render()}
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <i data-lucide="shopping-cart" class="w-8 h-8"></i>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">আপনার কার্ট খালি!</h2>
          <p class="text-slate-500 text-xs mb-6">চেকআউট করতে প্রথমে কিছু প্রোডাক্ট কার্টে যোগ করুন।</p>
          <a href="/products" class="btn-primary text-xs px-6 py-3 font-bold">কেনাকাটা করুন</a>
        </div>
        ${Footer.render()}
      </div>
    `;
  }

  const initialShipping = 60;
  const initialTotal = (cart.subtotal || 0) + initialShipping;

  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header.render()}

      <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        
        <div class="mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          <span class="badge-success text-xs font-bold mb-1">নিরাপদ ১-পেজ চেকআউট</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            অর্ডার সম্পন্ন করুন
          </h1>
        </div>

        <form id="checkout-form" onsubmit="window.handleCheckoutSubmit(event)" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Left: Customer & Address Information -->
          <div class="lg:col-span-7 space-y-6">
            <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <i data-lucide="map-pin" class="w-5 h-5 text-brand-500"></i> ডেলিভারি ঠিকানা দিন
              </h3>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">আপনার নাম *</label>
                <input type="text" id="cust-name" required placeholder="সম্পূর্ণ নাম লিখুন" class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">মোবাইল নম্বর (১১ ডিজিট) *</label>
                <input type="tel" id="cust-phone" required pattern="[0-9]{11}" placeholder="017XXXXXXXX" class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">ডেলিভারি লোকেশন *</label>
                <select id="cust-district" onchange="window.updateShippingCharge(this.value)" class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                  <option value="Dhaka">ঢাকার ভেতরে (৳৬০ ডেলিভারি চার্জ)</option>
                  <option value="Outside">ঢাকার বাইরে (৳১২০ ডেলিভারি চার্জ)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">সম্পূর্ণ ডেলিভারি ঠিকানা *</label>
                <textarea id="cust-address" required rows="3" placeholder="বাড়ি নং, রোড নং, এলাকা ও থানার নাম লিখুন..." class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"></textarea>
              </div>
            </div>
          </div>

          <!-- Right: Order Summary & Instant Submit -->
          <div class="lg:col-span-5 space-y-6">
            <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 class="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                অর্ডার বিবরণী
              </h3>

              <!-- Cart Items List -->
              <div class="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-custom">
                ${cart.items.map(i => `
                  <div class="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div class="flex items-center gap-2.5">
                      <span class="px-2 py-0.5 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold">${i.quantity}x</span>
                      <span class="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">${i.name}</span>
                    </div>
                    <span class="font-extrabold text-slate-900 dark:text-white">৳${i.unitPrice * i.quantity}</span>
                  </div>
                `).join("")}
              </div>

              <!-- Bill Breakdown -->
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div class="flex justify-between">
                  <span>সাব-টোটাল:</span>
                  <span class="font-bold text-slate-900 dark:text-white">৳${cart.subtotal}</span>
                </div>
                <div class="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span id="shipping-display" class="font-bold text-slate-900 dark:text-white">৳${initialShipping}</span>
                </div>
                <div class="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span id="grand-total-display" class="text-brand-600 dark:text-brand-400">৳${initialTotal}</span>
                </div>
              </div>

              <div class="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                <span>ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ)</span>
              </div>

              <!-- Submit Button with Double-Click Protection -->
              <button type="submit" id="confirm-order-btn" class="w-full btn-primary py-4 text-base font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25">
                <span>অর্ডার কনফার্ম করুন</span>
                <i data-lucide="arrow-right" class="w-5 h-5"></i>
              </button>
            </div>
          </div>

        </form>
      </main>

      ${Footer.render()}
    </div>
  `;
};

// Live Shipping Charge Updater
window.updateShippingCharge = (district) => {
  const cart = store.state.cart;
  const shipping = district === "Dhaka" ? 60 : 120;
  const total = (cart.subtotal || 0) + shipping;

  const shipEl = document.getElementById("shipping-display");
  const totalEl = document.getElementById("grand-total-display");

  if (shipEl) shipEl.innerText = `৳${shipping}`;
  if (totalEl) totalEl.innerText = `৳${total}`;
};

// Form Submission & Order Engine (Site ➔ Google Sheets Direct Write)
window.handleCheckoutSubmit = async (e) => {
  e.preventDefault();
  const btn = document.getElementById("confirm-order-btn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>অর্ডার প্রসেস হচ্ছে...</span>
    `;
  }

  const name = document.getElementById("cust-name")?.value.trim();
  const phone = document.getElementById("cust-phone")?.value.trim();
  const district = document.getElementById("cust-district")?.value;
  const address = document.getElementById("cust-address")?.value.trim();

  const cart = store.state.cart;
  const shipping = district === "Dhaka" ? 60 : 120;
  const grandTotal = (cart.subtotal || 0) + shipping;

  const orderPayload = {
    customer_name: name,
    phone: phone,
    district: district,
    shipping_address: address,
    payment_method: "COD",
    subtotal: cart.subtotal,
    shipping_charge: shipping,
    total: grandTotal,
    items: cart.items.map(i => ({
      product_id: i.productId || "",
      product_name: i.name,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      total_price: i.unitPrice * i.quantity
    }))
  };

  try {
    const createdOrder = await OrderAPI.create(orderPayload);
    store.clearCart();
    store.showToast("আপনার অর্ডার সফলভাবে গৃহীত হয়েছে!", "success");
    router.navigate(`/order-success/${createdOrder.order_number || createdOrder.order_id}`);
  } catch (err) {
    alert(`অর্ডার সম্পন্ন করা যায়নি: ${err.message}`);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>অর্ডার কনফার্ম করুন</span><i data-lucide="arrow-right" class="w-5 h-5"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
};

export default CheckoutPage;
