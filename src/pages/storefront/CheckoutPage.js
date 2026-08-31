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
      <div class="min-h-screen flex flex-col font-bengali">
        ${Header.render()}
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 class="text-2xl font-bold mb-2">আপনার কার্ট খালি!</h2>
          <p class="text-slate-500 text-sm mb-6">চেকআউট করতে প্রথমে কিছু প্রোডাক্ট কার্টে যোগ করুন।</p>
          <a href="/products" class="btn-primary">কেনাকাটা করুন</a>
        </div>
        ${Footer.render()}
      </div>
    `;
  }

  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header.render()}

      <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          এক্সপ্রেস চেকআউট (অর্ডার সম্পন্ন করুন)
        </h1>

        <form id="checkout-form" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Left: Customer Information & Delivery Address -->
          <div class="lg:col-span-7 space-y-6">
            <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i data-lucide="map-pin" class="w-5 h-5 text-brand-500"></i> ডেলিভারি তথ্য প্রদান করুন
              </h3>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">আপনার নাম *</label>
                <input type="text" id="cust-name" required placeholder="সম্পূর্ণ নাম লিখুন" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">মোবাইল নম্বর (১১ ডিজিট) *</label>
                <input type="tel" id="cust-phone" required pattern="[0-9]{11}" placeholder="017XXXXXXXX" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">ডেলিভারি লোকেশন / জেলা *</label>
                <select id="cust-district" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="Dhaka">ঢাকার ভেতরে (৳৬০ ডেলিভারি চার্জ)</option>
                  <option value="Outside">ঢাকার বাইরে (৳১২০ ডেলিভারি চার্জ)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">সম্পূর্ণ ঠিকানা *</label>
                <textarea id="cust-address" required rows="3" placeholder="বাড়ি নং, রোড নং, এলাকা ও থানার নাম লিখুন..." class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-brand-500"></textarea>
              </div>
            </div>
          </div>

          <!-- Right: Order Summary & Confirm -->
          <div class="lg:col-span-5 space-y-6">
            <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                অর্ডার বিবরণী
              </h3>

              <div class="max-h-60 overflow-y-auto space-y-3 pr-2">
                ${cart.items.map(i => `
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                      <span class="font-bold">${i.quantity}x</span>
                      <span class="truncate max-w-[180px]">${i.name}</span>
                    </div>
                    <span class="font-bold">৳${i.unitPrice * i.quantity}</span>
                  </div>
                `).join("")}
              </div>

              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div class="flex justify-between">
                  <span>সাব-টোটাল:</span>
                  <span class="font-bold text-slate-900 dark:text-white">৳${cart.subtotal}</span>
                </div>
                <div class="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span id="shipping-display" class="font-bold text-slate-900 dark:text-white">৳৬০</span>
                </div>
                <div class="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span id="grand-total-display" class="text-brand-600 dark:text-brand-400">৳${cart.subtotal + 60}</span>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <i data-lucide="check-circle" class="w-4 h-4 inline mr-1"></i> পেমেন্ট মেথড: ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ)
              </div>

              <!-- Submit Order Button with Double Click Protection -->
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
