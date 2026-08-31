/**
 * ============================================================================
 * DREAM CART BD — 360° ORDER DETAIL VIEW (OrderDetail.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { OrderAPI } from "../../../api/orders.js";
import { FraudModal } from "../../../components/FraudModal.js";
import { store } from "../../../js/store.js";

export const OrderDetail = async (params = {}) => {
  const orderId = params.id;
  let order = null;

  try {
    order = await OrderAPI.getById(orderId);
  } catch (e) {
    console.error("Order load error:", e);
  }

  if (!order) {
    return `<div class="min-h-screen flex items-center justify-center font-bengali"><h2 class="text-xl font-bold">অর্ডার পাওয়া যায়নি।</h2></div>`;
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/orders")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <a href="/admin/orders" class="text-slate-400 hover:text-brand-500 text-xs font-bold">← অর্ডার তালিকা</a>
              <span class="badge-success text-xs uppercase">${order.order_status}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              অর্ডার #${order.order_number || order.order_id}
            </h1>
            <p class="text-xs text-slate-500">অর্ডার তারিখ: ${new Date(order.created_at).toLocaleString()}</p>
          </div>
          
          <div class="flex items-center gap-3">
            <button onclick="window.print()" class="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5">
              <i data-lucide="printer" class="w-4 h-4"></i> ইনভয়েস প্রিন্ট
            </button>
            <button onclick="window.FraudModal.open('${order.phone}', '${order.order_id}')" class="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700">
              <i data-lucide="shield-alert" class="w-4 h-4"></i> কুরিয়ার ফ্রড চেক
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Left: Order Items & Payment Summary -->
          <div class="lg:col-span-8 space-y-6">
            
            <!-- Items Table -->
            <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
              <h3 class="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                অর্ডারকৃত প্রোডাক্ট তালিকা
              </h3>

              <div class="divide-y divide-slate-100 dark:divide-slate-800">
                ${(order.items || [{ product_name: "ডেমো প্রোডাক্ট", quantity: 1, unit_price: order.subtotal || order.total, total_price: order.total }]).map(item => `
                  <div class="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <h4 class="text-sm font-bold text-slate-900 dark:text-white">${item.product_name}</h4>
                      <span class="text-xs text-slate-400">SKU: ${item.sku || 'N/A'} | মূল্য: ৳${item.unit_price}</span>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-bold text-slate-500">${item.quantity}x</span>
                      <h5 class="text-sm font-black text-slate-900 dark:text-white">৳${item.total_price}</h5>
                    </div>
                  </div>
                `).join("")}
              </div>

              <!-- Bill Breakdown -->
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div class="flex justify-between">
                  <span>সাব-টোটাল:</span>
                  <span class="font-bold text-slate-900 dark:text-white">৳${order.subtotal || order.total}</span>
                </div>
                <div class="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span class="font-bold text-slate-900 dark:text-white">৳${order.shipping_charge || 0}</span>
                </div>
                <div class="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>সর্বমোট বিল:</span>
                  <span class="text-brand-600 dark:text-brand-400">৳${order.total}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Right: Customer & Delivery Info -->
          <div class="lg:col-span-4 space-y-6">
            
            <!-- Customer Card -->
            <div class="glass-panel p-6 rounded-3xl space-y-3">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">কাস্টমার তথ্য</h3>
              <div class="space-y-1 text-xs">
                <p class="text-base font-bold text-slate-900 dark:text-white">${order.customer_name}</p>
                <p class="font-mono text-brand-600 dark:text-brand-400 font-bold">${order.phone}</p>
                <p class="text-slate-500 leading-relaxed">${order.shipping_address}</p>
              </div>
            </div>

            <!-- Courier Tracking Card -->
            <div class="glass-panel p-6 rounded-3xl space-y-3">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">কুরিয়ার ডেলিভারি স্ট্যাটাস</h3>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-slate-400">কুরিয়ার:</span>
                  <span class="font-bold text-slate-900 dark:text-white">${order.courier_id || 'Steadfast'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">ট্র্যাকিং কোড:</span>
                  <span class="font-mono font-bold text-emerald-600">${order.tracking_code || 'অ্যাসাইন হয়নি'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  `;
};
