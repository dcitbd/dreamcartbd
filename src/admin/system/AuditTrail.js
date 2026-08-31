/**
 * ============================================================================
 * DREAM CART BD — SYSTEM AUDIT TRAIL (AuditTrail.js)
 * ============================================================================
 */

import { Sidebar } from "../../../components/Sidebar.js";
import { api } from "../../../api/client.js";

export const AuditTrail = async () => {
  let logs = [];
  try {
    logs = await api.get("audit.list") || [];
  } catch (e) {
    console.error("Audit load failed:", e);
  }

  return `
    <div class="min-h-screen flex bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Sidebar.render("/admin/audit")}

      <main class="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        
        <!-- Header -->
        <div class="pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
          <span class="badge-info text-xs mb-1">সিকিউরিটি ও ট্র্যাকিং</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">সিস্টেম অডিট ট্রেইল ও অ্যাক্টিভিটি লগ</h1>
          <p class="text-xs text-slate-500 mt-1">প্রাইস পরিবর্তন, স্টক অ্যাডজাস্টমেন্ট ও স্ট্যাটাস আপডেটের অপরিবর্তনীয় প্রমাণপত্র</p>
        </div>

        <!-- Audit Table -->
        <div class="glass-panel rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="overflow-x-auto">
            <table class="table-modern text-xs">
              <thead>
                <tr>
                  <th>তারিখ ও সময়</th>
                  <th>অপারেটর</th>
                  <th>অ্যাকশন টাইপ</th>
                  <th>টার্গেট এনটিটি</th>
                  <th>পূর্বের মান ➔ নতুন মান</th>
                  <th>রিকোয়েস্ট UUID</th>
                </tr>
              </thead>
              <tbody>
                ${logs.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-12 text-slate-400">কোনো অডিট রেকর্ড পাওয়া যায়নি।</td></tr>
                ` : logs.map(l => `
                  <tr>
                    <td class="font-mono text-slate-400">${new Date(l.timestamp).toLocaleString()}</td>
                    <td><span class="badge-info text-[10px] font-bold">${l.user_id || 'ADMIN'}</span></td>
                    <td class="font-bold uppercase text-slate-900 dark:text-white">${l.action}</td>
                    <td class="font-mono">${l.entity} (#${l.entity_id})</td>
                    <td>
                      <span class="text-rose-500 line-through">${l.old_value || 'None'}</span>
                      <span class="mx-1">➔</span>
                      <span class="text-emerald-600 font-bold">${l.new_value || 'Done'}</span>
                    </td>
                    <td class="font-mono text-[10px] text-slate-400">${l.request_id || '-'}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  `;
};
