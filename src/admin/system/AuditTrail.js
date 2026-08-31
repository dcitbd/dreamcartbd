/**
 * ============================================================================
 * DREAM CART BD — SYSTEM AUDIT TRAIL (AuditTrail.js)
 * ============================================================================
 */

import { Sidebar } from "../../components/Sidebar.js";
import { api } from "../../api/client.js";

export const AuditTrail = async () => {
  let logs = [];
  try {
    if (api && typeof api.get === "function") {
      const res = await api.get("audit.list");
      logs = Array.isArray(res) ? res : (res?.items || []);
    }
  } catch (e) {
    console.error("Audit load failed:", e);
  }

  const logsList = Array.isArray(logs) ? logs : [];

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar?.render ? Sidebar.render("/admin/audit") : ""}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <span class="badge-info text-xs mb-1">সিকিউরিটি ও ট্র্যাকিং</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">সিস্টেম অডিট ট্রেইল ও অ্যাক্টিভিটি লগ</h1>
          <p class="text-xs text-slate-500 mt-1">প্রাইস পরিবর্তন, স্টক অ্যাডজাস্টমেন্ট ও স্ট্যাটাস আপডেটের অপরিবর্তনীয় প্রমাণপত্র</p>
        </div>

        <!-- Audit Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern w-full text-xs text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                  <th class="py-3 px-4">তারিখ ও সময়</th>
                  <th class="py-3 px-4">অপারেটর</th>
                  <th class="py-3 px-4">অ্যাকশন টাইপ</th>
                  <th class="py-3 px-4">টার্গেট এনটিটি</th>
                  <th class="py-3 px-4">পূর্বের মান ➔ নতুন মান</th>
                  <th class="py-3 px-4">রিকোয়েস্ট UUID</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${logsList.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-12 text-slate-400">কোনো অডিট রেকর্ড পাওয়া যায়নি।</td></tr>
                ` : logsList.map(l => {
                  const formattedDate = l.timestamp ? new Date(l.timestamp).toLocaleString('bn-BD') : 'N/A';
                  return `
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td class="py-3 px-4 font-mono text-slate-400">${formattedDate}</td>
                      <td class="py-3 px-4"><span class="badge-info text-[10px] font-bold px-2 py-0.5 rounded-md">${l.user_id || 'ADMIN'}</span></td>
                      <td class="py-3 px-4 font-bold uppercase text-slate-900 dark:text-white">${l.action || 'UPDATE'}</td>
                      <td class="py-3 px-4 font-mono">${l.entity || 'Entity'} (#${l.entity_id || '—'})</td>
                      <td class="py-3 px-4">
                        <span class="text-rose-500 line-through">${l.old_value || 'None'}</span>
                        <span class="mx-1 text-slate-400">➔</span>
                        <span class="text-emerald-600 font-bold">${l.new_value || 'Done'}</span>
                      </td>
                      <td class="py-3 px-4 font-mono text-[10px] text-slate-400">${l.request_id || '-'}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  `;
};

// Default export যুক্ত করা হয়েছে
export default AuditTrail;
