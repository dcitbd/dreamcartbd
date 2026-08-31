/**
 * ============================================================================
 * DREAM CART BD — CUSTOMER DASHBOARD & PORTAL (CustomerPortal.js)
 * ============================================================================
 */

import { Header } from "../../components/Header.js";
import { Footer } from "../../components/Footer.js";
import { store } from "../../js/store.js";
import { OrderAPI } from "../../api/orders.js";

export const CustomerPortal = async () => {
  const user = store.state.user || { name: "সম্মানিত গ্রাহক", phone: "01700000000" };
  let orders = [];

  try {
    const allOrders = await OrderAPI.getAll();
    orders = (allOrders || []).filter(o => String(o.phone).includes(user.phone || ''));
  } catch (e) {
    console.error("Failed to load customer orders:", e);
  }

  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header.render()}

      <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        <div class="glass-panel p-6 sm:p-8 rounded-3xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center text-2xl font-bold">
              ${user.name.charAt(0)}
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">${user.name}</h2>
              <p class="text-xs text-slate-400">ফোন: ${user.phone}</p>
            </div>
          </div>
          <button onclick="window.store.logout(); window.router.navigate('/login');" class="btn-secondary text-xs px-4 py-2 text-rose-500">
            লগআউট
          </button>
        </div>

        <!-- Orders Table -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">আমার পূর্বের অর্ডারসমূহ</h3>
          
          <div class="overflow-x-auto">
            <table class="table-modern">
              <thead>
                <tr>
                  <th>অর্ডার নম্বর</th>
                  <th>তারিখ</th>
                  <th>টাকা</th>
                  <th>পেমেন্ট</th>
                  <th>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                ${orders.length === 0 ? `
                  <tr><td colspan="5" class="text-center py-8 text-slate-400">আপনার কোনো সক্রিয় অর্ডার নেই।</td></tr>
                ` : orders.map(o => `
                  <tr>
                    <td class="font-bold">${o.order_number || o.order_id}</td>
                    <td>${new Date(o.created_at).toLocaleDateString()}</td>
                    <td class="font-extrabold text-brand-600">৳${o.total}</td>
                    <td><span class="badge-info">${o.payment_method}</span></td>
                    <td><span class="badge-success">${o.order_status}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      ${Footer.render()}
    </div>
  `;
};
