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
  const currentUser = store?.state?.user || { name: "সম্মানিত গ্রাহক", phone: "01700000000" };
  const userName = currentUser.name || "গ্রাহক";
  const userPhone = currentUser.phone || "";
  
  let orders = [];

  try {
    if (OrderAPI && typeof OrderAPI.getAll === "function") {
      const allOrders = await OrderAPI.getAll();
      const orderList = Array.isArray(allOrders) ? allOrders : (allOrders?.items || []);
      orders = orderList.filter(o => userPhone ? String(o.phone || "").includes(userPhone) : true);
    }
  } catch (e) {
    console.error("Failed to load customer orders:", e);
  }

  const initialLetter = userName.trim().charAt(0) || "U";

  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header?.render ? Header.render() : ""}

      <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        <!-- User Profile Card -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center text-2xl font-bold shadow-md">
              ${initialLetter}
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">${userName}</h2>
              <p class="text-xs text-slate-400">ফোন: ${userPhone || "তথ্য নেই"}</p>
            </div>
          </div>
          <button onclick="window.store && window.store.logout ? window.store.logout() : null; window.router && window.router.navigate ? window.router.navigate('/login') : (window.location.href = '/login');" class="btn-secondary text-xs px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors">
            লগআউট
          </button>
        </div>

        <!-- Orders Table -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">আমার পূর্বের অর্ডারসমূহ</h3>
          
          <div class="overflow-x-auto">
            <table class="table-modern w-full text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 uppercase">
                  <th class="py-3 px-4">অর্ডার নম্বর</th>
                  <th class="py-3 px-4">তারিখ</th>
                  <th class="py-3 px-4">টাকা</th>
                  <th class="py-3 px-4">পেমেন্ট</th>
                  <th class="py-3 px-4">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                ${orders.length === 0 ? `
                  <tr><td colspan="5" class="text-center py-8 text-slate-400">আপনার কোনো সক্রিয় অর্ডার নেই।</td></tr>
                ` : orders.map(o => {
                  const formattedDate = o.created_at ? new Date(o.created_at).toLocaleDateString('bn-BD') : "N/A";
                  return `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${o.order_number || o.order_id || '—'}</td>
                      <td class="py-3 px-4 text-slate-500">${formattedDate}</td>
                      <td class="py-3 px-4 font-extrabold text-brand-600">৳${o.total || 0}</td>
                      <td class="py-3 px-4"><span class="badge-info px-2 py-0.5 rounded-md text-[10px]">${o.payment_method || 'COD'}</span></td>
                      <td class="py-3 px-4"><span class="badge-success px-2 py-0.5 rounded-md text-[10px]">${o.order_status || 'Pending'}</span></td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      ${Footer?.render ? Footer.render() : ""}
    </div>
  `;
};

// Default export যুক্ত করা হয়েছে যাতে রাউটার বা বান্ডলার ফাইলটি লোড করতে পারে
export default CustomerPortal;
