/**
 * DREAM CART BD — Admin Dashboard Overview Module (adminDashboard.js)
 * Implements:
 * - 18-Point Live Business Metrics Matrix
 * - Interactive SVG Sales Curve Graph with 7D/30D/1Y timeframes
 * - Quick Action Navigation Shortcuts
 * - Recent Orders Live Preview Table
 */

import { formatCurrency } from '../../../utils/format.js';

export function renderDashboardModule({ kpi, categories, orders }) {
  return `
    <!-- ================================================================= -->
    <!-- DEDICATED PAGE: DASHBOARD OVERVIEW                                -->
    <!-- ================================================================= -->
    <div id="page-dashboard" class="admin-page-view space-y-5">
      
      <!-- 18-Point Full KPI Matrix Grid -->
      <div class="space-y-2">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-500">১৮-পয়েন্ট সামগ্রিক বিজনেস মেট্রিক্স (18 Live Metrics)</h3>
          <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">● রিয়েলটাইম শিট সিঙ্ক</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          
          <!-- 1. Total Products -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-prod-all', 'group-products')">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-[9px] font-bold uppercase">মোট পণ্য ক্যাটালগ</span>
              <span class="text-xs">📦</span>
            </div>
            <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${kpi.total_products} টি</div>
            <div class="text-[9px] text-slate-400">${categories.length} টি ক্যাটাগরি</div>
          </div>

          <!-- 2. Total Orders -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-all', 'group-orders')">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-[9px] font-bold uppercase">সর্বমোট অর্ডার</span>
              <span class="text-xs">📋</span>
            </div>
            <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${kpi.total_orders} টি</div>
            <div class="text-[9px] text-emerald-600 font-bold">+১২ আজ নতুন</div>
          </div>

          <!-- 3. Total Sellers -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-partner-sellers', 'group-partners')">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-[9px] font-bold uppercase">সেলার / ভেন্ডর</span>
              <span class="text-xs">🏪</span>
            </div>
            <div class="text-base font-black text-indigo-600 mt-0.5">${kpi.total_sellers} টি শপ</div>
            <div class="text-[9px] text-slate-400">অফিসিয়াল মার্চেন্ট</div>
          </div>

          <!-- 4. Total Resellers -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-partner-resellers', 'group-partners')">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-[9px] font-bold uppercase">রিসেলার পার্টনার</span>
              <span class="text-xs">🤝</span>
            </div>
            <div class="text-base font-black text-indigo-600 mt-0.5">${kpi.total_resellers} জন</div>
            <div class="text-[9px] text-slate-400">কমিশন ড্রপশিপার</div>
          </div>

          <!-- 5. Total Wholesalers -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-partner-wholesalers', 'group-partners')">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-[9px] font-bold uppercase">পাইকারি ক্রেতা</span>
              <span class="text-xs">🏢</span>
            </div>
            <div class="text-base font-black text-indigo-600 mt-0.5">${kpi.total_wholesalers} টি প্রতিষ্ঠান</div>
            <div class="text-[9px] text-slate-400">হোলসেল নেটওয়ার্ক</div>
          </div>

          <!-- 6. Pending Orders -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-all', 'group-orders')">
            <div class="flex items-center justify-between text-amber-500">
              <span class="text-[9px] font-bold uppercase">পেন্ডিং অর্ডার</span>
              <span class="text-xs">⏳</span>
            </div>
            <div class="text-base font-black text-amber-500 mt-0.5">${kpi.pending_orders} টি</div>
            <div class="text-[9px] text-amber-600 font-bold">শিপিং অপেক্ষায়</div>
          </div>

          <!-- 7. Incomplete Orders -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-incomplete', 'group-orders')">
            <div class="flex items-center justify-between text-rose-500">
              <span class="text-[9px] font-bold uppercase">অসম্পূর্ণ অর্ডার</span>
              <span class="text-xs">⚠️</span>
            </div>
            <div class="text-base font-black text-rose-500 mt-0.5">${kpi.incomplete_orders} টি</div>
            <div class="text-[9px] text-rose-500 font-bold">রিকভারি অফার দিন</div>
          </div>

          <!-- 8. Total Costs -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-inv-costs', 'group-inventory')">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-[9px] font-bold uppercase">সর্বমোট খরচ</span>
              <span class="text-xs">💸</span>
            </div>
            <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${formatCurrency(kpi.total_costs)}</div>
            <div class="text-[9px] text-slate-400">বিজ্ঞাপন, ভাড়া ও প্যাক</div>
          </div>

          <!-- 9. Total Buying -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-inv-buying', 'group-inventory')">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-[9px] font-bold uppercase">পাইকারি ক্রয় ব্যয়</span>
              <span class="text-xs">🛒</span>
            </div>
            <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${formatCurrency(kpi.total_buying)}</div>
            <div class="text-[9px] text-slate-400">স্টক ইনভেন্টরি ক্রয়</div>
          </div>

          <!-- 10. Total Invest -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-inv-invest', 'group-inventory')">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-[9px] font-bold uppercase">মোট বিনিয়োগ</span>
              <span class="text-xs">💼</span>
            </div>
            <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${formatCurrency(kpi.total_invest)}</div>
            <div class="text-[9px] text-emerald-600 font-bold">কার্যকরী মূলধন</div>
          </div>

          <!-- 11. Total Customers -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-customers', 'group-orders')">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-[9px] font-bold uppercase">কাস্টমার ডাটাবেজ</span>
              <span class="text-xs">👥</span>
            </div>
            <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${kpi.total_customers} জন</div>
            <div class="text-[9px] text-slate-400">যাচাইকৃত ফোন নম্বর</div>
          </div>

          <!-- 12. Live Viewers -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-visitors', 'group-orders')">
            <div class="flex items-center justify-between text-emerald-600">
              <span class="text-[9px] font-bold uppercase">লাইভ ভিজিটর</span>
              <span class="text-xs">🟢</span>
            </div>
            <div class="text-base font-black text-emerald-600 mt-0.5">${kpi.live_viewers} জন</div>
            <div class="text-[9px] text-emerald-600 font-bold">অনলাইনে ব্রাউজিং</div>
          </div>

          <!-- 13. Delivered Orders -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-orders-success', 'group-orders')">
            <div class="flex items-center justify-between text-emerald-600">
              <span class="text-[9px] font-bold uppercase">সফল ডেলিভারি</span>
              <span class="text-xs">✓</span>
            </div>
            <div class="text-base font-black text-emerald-600 mt-0.5">${kpi.delivered_orders} টি</div>
            <div class="text-[9px] text-emerald-600 font-bold">৯৫.২% সাকসেস রেট</div>
          </div>

          <!-- 14. Low Stock Products -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-prod-low-stock', 'group-products')">
            <div class="flex items-center justify-between text-amber-500">
              <span class="text-[9px] font-bold uppercase">লো স্টক পণ্য (&lt;৫)</span>
              <span class="text-xs">⚠️</span>
            </div>
            <div class="text-base font-black text-amber-500 mt-0.5">${kpi.low_stock_count} টি পণ্য</div>
            <div class="text-[9px] text-amber-600 font-bold">দ্রুত রি-অর্ডার করুন</div>
          </div>

          <!-- 15. Out of Stock -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-prod-out-stock', 'group-products')">
            <div class="flex items-center justify-between text-rose-500">
              <span class="text-[9px] font-bold uppercase">আউট অব স্টক (০)</span>
              <span class="text-xs">🚫</span>
            </div>
            <div class="text-base font-black text-rose-500 mt-0.5">${kpi.out_of_stock_count} টি পণ্য</div>
            <div class="text-[9px] text-rose-500 font-bold">স্টক শূন্য</div>
          </div>

          <!-- 16. Total Sales -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-report-sales', 'group-reports')">
            <div class="flex items-center justify-between text-emerald-600">
              <span class="text-[9px] font-bold uppercase">মোট রাজস্ব বিক্রয়</span>
              <span class="text-xs">৳</span>
            </div>
            <div class="text-base font-black text-emerald-600 mt-0.5">${formatCurrency(kpi.total_sales)}</div>
            <div class="text-[9px] text-emerald-600 font-bold">গ্রস মোট বিক্রি</div>
          </div>

          <!-- 17. Total Profit -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-report-sales', 'group-reports')">
            <div class="flex items-center justify-between text-emerald-600">
              <span class="text-[9px] font-bold uppercase">নিট মুনাফা (Profit)</span>
              <span class="text-xs">📈</span>
            </div>
            <div class="text-base font-black text-emerald-600 mt-0.5">${formatCurrency(kpi.total_profit)}</div>
            <div class="text-[9px] text-emerald-600 font-bold">২২% এস্টিমেটেড লাভ</div>
          </div>

          <!-- 18. Loss / Net Margin -->
          <div class="admin-kpi-card p-3 cursor-pointer" onclick="switchAdminPage('page-report-costs', 'group-reports')">
            <div class="flex items-center justify-between text-slate-400">
              <span class="text-[9px] font-bold uppercase">লোকসান / মার্জিন</span>
              <span class="text-xs">🛡️</span>
            </div>
            <div class="text-base font-black text-slate-900 dark:text-white mt-0.5">${formatCurrency(kpi.total_loss)}</div>
            <div class="text-[9px] text-emerald-600 font-bold">জিরো নেট লস (লাভজনক)</div>
          </div>

        </div>
      </div>

      <!-- Interactive Sales Graph Card -->
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>📈</span> সেলস গ্রাফ ও পারফরম্যান্স (Interactive Sales Analytics)
            </h3>
            <p class="text-[11px] text-slate-400">সময়কাল অনুসারে লাইভ রাজস্ব ও অর্ডার ট্রেন্ড অ্যানালাইসিস</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button id="btn-chart-7d" class="sales-chart-btn active" onclick="window.switchSalesGraphTimeframe('7d')">৭ দিন</button>
            <button id="btn-chart-30d" class="sales-chart-btn" onclick="window.switchSalesGraphTimeframe('30d')">৩০ দিন</button>
            <button id="btn-chart-1y" class="sales-chart-btn" onclick="window.switchSalesGraphTimeframe('1y')">১ বছর</button>
          </div>
        </div>

        <div class="flex items-center justify-between px-2 pt-1">
          <div>
            <div class="text-[10px] text-slate-400 font-bold uppercase">নির্বাচিত সময়ের রাজস্ব</div>
            <div id="sales-chart-revenue" class="text-lg font-black text-emerald-600 font-mono">৳১,৪৭,৫০০</div>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-slate-400 font-bold uppercase">মোট ভলিউম</div>
            <div id="sales-chart-orders" class="text-sm font-bold text-slate-800 dark:text-slate-200">৩৮ টি অর্ডার</div>
          </div>
        </div>

        <!-- SVG Responsive Visual Curve Chart -->
        <div class="w-full h-44 sm:h-52 overflow-hidden relative pt-2">
          <svg viewBox="0 0 600 200" class="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.38"/>
                <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            
            <line x1="20" y1="40" x2="580" y2="40" stroke="rgba(148, 163, 184, 0.15)" stroke-dasharray="4"/>
            <line x1="20" y1="90" x2="580" y2="90" stroke="rgba(148, 163, 184, 0.15)" stroke-dasharray="4"/>
            <line x1="20" y1="140" x2="580" y2="140" stroke="rgba(148, 163, 184, 0.15)" stroke-dasharray="4"/>

            <path id="sales-chart-area" d="M 20,130 C 80,110 140,70 200,90 C 260,110 320,40 380,50 C 440,60 500,20 580,30 L 580,180 L 20,180 Z" fill="url(#salesGrad)" />
            <path id="sales-chart-path" d="M 20,130 C 80,110 140,70 200,90 C 260,110 320,40 380,50 C 440,60 500,20 580,30" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />

            <circle cx="20" cy="130" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
            <circle cx="200" cy="90" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
            <circle cx="380" cy="50" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
            <circle cx="580" cy="30" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
          </svg>

          <div class="flex items-center justify-between text-[10px] text-slate-400 px-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>দিন ১</span>
            <span>দিন ২</span>
            <span>দিন ৩</span>
            <span>দিন ৪</span>
            <span>দিন ৫</span>
            <span>দিন ৬</span>
            <span>আজ (দিন ৭)</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Shortcuts -->
      <div class="dc-admin-card space-y-3">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">দ্রুত অ্যাকশন শর্টকাট (Quick Navigation)</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-bold">
          <button class="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center gap-2" onclick="switchAdminPage('page-orders-all', 'group-orders')">
            <span class="text-lg">📋</span>
            <div>
              <div>অর্ডার প্রসেসিং</div>
              <div class="text-[10px] text-slate-400 font-normal">সকল অর্ডার পরিচালনা</div>
            </div>
          </button>
          <button class="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center gap-2" onclick="switchAdminPage('page-prod-add', 'group-products')">
            <span class="text-lg">➕</span>
            <div>
              <div>নতুন পণ্য আপলোড</div>
              <div class="text-[10px] text-slate-400 font-normal">স্টক ও মূল্য নির্ধারণ</div>
            </div>
          </button>
          <button class="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center gap-2" onclick="switchAdminPage('page-orders-incomplete', 'group-orders')">
            <span class="text-lg">💬</span>
            <div>
              <div>অসম্পূর্ণ রিকভারি</div>
              <div class="text-[10px] text-slate-400 font-normal">WhatsApp রিমাইন্ডার</div>
            </div>
          </button>
          <button class="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-left transition flex items-center gap-2" onclick="switchAdminPage('page-inv-payout', 'group-inventory')">
            <span class="text-lg">💳</span>
            <div>
              <div>রিসেলার পে-আউট</div>
              <div class="text-[10px] text-slate-400 font-normal">কমিশন উত্তোলন পরিশোধ</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Recent Orders Preview Table -->
      <div class="dc-admin-card space-y-3.5">
        <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</h3>
            <p class="text-[11px] text-slate-400">সর্বশেষ প্রেরিত কাস্টমার অর্ডার তালিকা</p>
          </div>
          <button class="text-xs text-emerald-600 font-bold hover:underline" onclick="switchAdminPage('page-orders-all', 'group-orders')">
            সব অর্ডার দেখুন (${orders.length}) →
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[10px]">
                <th class="py-2 px-3">অর্ডার আইডি</th>
                <th class="py-2 px-3">গ্রাহক</th>
                <th class="py-2 px-3">পণ্য</th>
                <th class="py-2 px-3">মূল্য</th>
                <th class="py-2 px-3">পেমেন্ট</th>
                <th class="py-2 px-3">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${orders.slice(0, 5).map(o => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td class="py-2.5 px-3 font-mono font-bold text-emerald-600">${o.order_id}</td>
                  <td class="py-2.5 px-3">
                    <div class="font-bold text-slate-900 dark:text-white">${o.customer_name}</div>
                    <div class="font-mono text-slate-400 text-[10px]">${o.phone}</div>
                  </td>
                  <td class="py-2.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300">${o.products}</td>
                  <td class="py-2.5 px-3 font-bold font-mono">${formatCurrency(o.total_amount)}</td>
                  <td class="py-2.5 px-3">
                    <span class="badge ${o.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'} text-[9px]">${o.payment_status}</span>
                  </td>
                  <td class="py-2.5 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${o.order_status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">${o.order_status}</span>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}
