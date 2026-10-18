/**
 * DREAM CART BD — Reports Center Module (adminReports.js)
 * Implements 8 comprehensive analytical reports:
 * 1. Seller Report
 * 2. Reseller Report
 * 3. Wholesaler Report
 * 4. Sales Report
 * 5. Wholesale Report
 * 6. Costs Report
 * 7. Buying Report
 * 8. Invest Report
 */

import { formatCurrency } from '../../../utils/format.js';

export function renderReportsModule({ sellers, resellers, wholesalers, kpi, costs, buying, invest }) {
  return `
    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: REPORTS CENTER (8 Distinct Standalone Views)     -->
    <!-- ================================================================= -->

    <!-- 1. Seller Report -->
    <div id="page-report-seller" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏪 সেলার ও ভেন্ডর পারফরম্যান্স রিপোর্ট</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Seller_Report', ['Store', 'Commission', 'Sales'], sellers.map(s=>[s.store, s.commission, '৳১,২০,৪০০']))">CSV</button>
          </div>
        </div>
        <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between text-xs">
          <div>
            <div class="font-bold text-slate-900 dark:text-white">মোট সেলার রাজস্ব বিক্রয়: ৳১,২০,৪০০</div>
            <div class="text-[10px] text-slate-400">অংশীদারী কমিশন আয়: ৳১২,০৪০ (১০% গড়)</div>
          </div>
          <div class="flex gap-1">
            <button class="order-status-pill active text-[10px]">দৈনিক</button>
            <button class="order-status-pill text-[10px]">সাপ্তাহিক</button>
            <button class="order-status-pill text-[10px]">মাসিক</button>
            <button class="order-status-pill text-[10px]">বাৎসরিক</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Reseller Report -->
    <div id="page-report-reseller" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🤝 রিসেলার কমিশন ও সেলস রিপোর্ট</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Reseller_Report', ['Name', 'Shop', 'Earned', 'Balance'], resellers.map(r=>[r.name, r.shop, r.total_earned, r.balance]))">CSV</button>
          </div>
        </div>
        <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between text-xs">
          <div>
            <div class="font-bold text-slate-900 dark:text-white">মোট রিসেলার নেট সেলস: ৳৩,৫০,৮০০</div>
            <div class="text-[10px] text-slate-400">প্রদত্ত কমিশন: ৳৫২,৬০০</div>
          </div>
          <div class="flex gap-1">
            <button class="order-status-pill text-[10px]">দৈনিক</button>
            <button class="order-status-pill text-[10px]">সাপ্তাহিক</button>
            <button class="order-status-pill active text-[10px]">মাসিক</button>
            <button class="order-status-pill text-[10px]">বাৎসরিক</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Wholesaler Report -->
    <div id="page-report-wholesaler" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏢 হোলসেলার পার্টনার ক্রয় রিপোর্ট</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Wholesaler_Report', ['Company', 'Tier', 'Orders'], wholesalers.map(w=>[w.company, w.tier, w.total_orders]))">CSV</button>
          </div>
        </div>
        <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between text-xs">
          <div>
            <div class="font-bold text-slate-900 dark:text-white">পাইকারি সরবরাহ রাজস্ব: ৳৩,৮৫,০০০</div>
            <div class="text-[10px] text-slate-400">গড় অর্ডার ভলিউম: ৳২৭,৫০০</div>
          </div>
          <div class="flex gap-1">
            <button class="order-status-pill text-[10px]">দৈনিক</button>
            <button class="order-status-pill active text-[10px]">মাসিক</button>
            <button class="order-status-pill text-[10px]">বাৎসরিক</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Sales Report -->
    <div id="page-report-sales" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">📊 সার্বিক রাজস্ব বিক্রয় রিপোর্ট (Sales Analytics)</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportAdminOrdersCsv()">CSV</button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 space-y-1">
            <div class="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase">মোট গ্রস বিক্রয়</div>
            <div class="text-xl font-black text-emerald-600 font-mono">${formatCurrency(kpi.total_sales)}</div>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-1">
            <div class="text-[10px] text-slate-400 font-bold uppercase">সম্পন্ন অর্ডার ভলিউম</div>
            <div class="text-xl font-black text-slate-900 dark:text-white font-mono">${kpi.total_orders} টি</div>
          </div>
          <div class="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 space-y-1">
            <div class="text-[10px] text-indigo-800 dark:text-indigo-300 font-bold uppercase">নিট মুনাফা মার্জিন</div>
            <div class="text-xl font-black text-indigo-600 font-mono">${formatCurrency(kpi.total_profit)}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Wholesale Report -->
    <div id="page-report-wholesale" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">📦 পাইকারি সেলস রিপোর্ট (WholeSale)</h3>
          <button class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
        </div>
        <p class="text-xs text-slate-400">হোলসেল ডিলারদের বাল্ক শিপমেন্ট এবং ডিস্ট্রিবিউশন হিসাব</p>
        <div class="text-base font-black text-emerald-600 font-mono">মোট ভলিউম: ৳৩,৮৫,০০০ (২৩ টি বাল্ক ইনভয়েস)</div>
      </div>
    </div>

    <!-- 6. Costs Report -->
    <div id="page-report-costs" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">💸 ব্যবসায়িক খরচ রিপোর্ট (Costs Report)</h3>
          <button class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
        </div>
        <div class="text-xl font-black text-rose-500 font-mono mb-2">${formatCurrency(kpi.total_costs)}</div>
        <div class="space-y-2 text-xs">
          ${costs.map(c => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${c.title}</div>
                <div class="text-[10px] text-slate-400">${c.category} • ${c.date}</div>
              </div>
              <span class="font-mono font-bold text-rose-500">৳${c.amount}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 7. Buying Report -->
    <div id="page-report-buying" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🛒 পাইকারি স্টক ক্রয় রিপোর্ট (Buying Report)</h3>
          <button class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
        </div>
        <div class="text-xl font-black text-slate-900 dark:text-white font-mono mb-2">${formatCurrency(kpi.total_buying)}</div>
        <div class="space-y-2 text-xs">
          ${buying.map(b => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${b.product}</div>
                <div class="text-[10px] text-slate-400">সাপ্লায়ার: ${b.supplier} • পরিমাণ: ${b.quantity} পিস</div>
              </div>
              <span class="font-mono font-bold text-emerald-600">৳${b.total_amount}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 8. Invest Report -->
    <div id="page-report-invest" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">💼 মূলধন ও বিনিয়োগ রিপোর্ট (Invest Report)</h3>
          <button class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
        </div>
        <div class="text-xl font-black text-emerald-600 font-mono mb-2">${formatCurrency(kpi.total_invest)}</div>
        <div class="space-y-2 text-xs">
          ${invest.map(i => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${i.investor}</div>
                <div class="text-[10px] text-slate-400">${i.note} • ${i.date}</div>
              </div>
              <span class="font-mono font-bold text-emerald-600">৳${i.amount}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}
