/**
 * DREAM CART BD — Comprehensive Business Reports Module (adminReports.js)
 * Refactored to use reusable report sector renderers (renderTabularReportSector & renderLedgerReportSector)
 * instead of repeating the report header, timeframe filter pills, KPI grid, and table markup 8 times.
 */

import { formatCurrency } from '../../../utils/format.js';

if (typeof window !== 'undefined' && !window.__dcbdReportFilterBound) {
  window.__dcbdReportFilterBound = true;
  window.filterReportPeriod = function(pageId, mult, btn) {
    const page = document.getElementById(pageId);
    if (!page) return;
    page.querySelectorAll('.order-status-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    page.querySelectorAll('[data-base-val]').forEach(el => {
      const base = Number(el.getAttribute('data-base-val') || 0);
      const isCurrency = el.getAttribute('data-currency') === '1';
      const scaled = Math.round(base * Number(mult || 1));
      el.textContent = isCurrency ? `৳${scaled.toLocaleString('en-IN')}` : `${scaled}`;
    });
  };
}

function renderTabularReportSector({ pageId, title, subtitle, periods = [], csvOnclick = '', kpiCols = 'sm:grid-cols-4', kpis = [], headers = [], rowsHtml = '' }) {
  return `
    <div id="${pageId}" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 class="font-black text-base text-slate-900 dark:text-white">${title}</h3>
            <p class="text-[11px] text-slate-400">${subtitle}</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            ${periods.map(p => `<button type="button" class="order-status-pill ${p.active ? 'active ' : ''}text-[10px]" onclick="window.filterReportPeriod('${pageId}', ${p.mult}, this)">${p.label}</button>`).join('\n            ')}
            ${csvOnclick ? `<button type="button" class="btn-secondary py-1 px-2.5" onclick="${csvOnclick}">CSV</button>` : ''}
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div class="grid grid-cols-2 ${kpiCols} gap-3 text-xs">
          ${kpis.map(k => `
            <div class="${k.boxClass}">
              <div class="${k.labelClass || 'text-[10px] font-bold text-slate-500 uppercase'}">${k.label}</div>
              <div class="${k.valClass}"${k.baseVal !== undefined ? ` data-base-val="${k.baseVal}" data-currency="${k.isCurrency ? '1' : '0'}"` : ''}>${k.value}</div>
            </div>
          `).join('')}
        </div>

        ${headers.length ? `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                ${headers.map(h => `<th class="py-2 px-3">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody class="divide-y">
              ${rowsHtml}
            </tbody>
          </table>
        </div>` : ''}
      </div>
    </div>
  `;
}

function renderLedgerReportSector({ pageId, title, csvOnclick, totalLabel, totalColorClass, itemsHtml }) {
  return `
    <div id="${pageId}" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">${title}</h3>
          <div class="flex gap-1.5 text-xs">
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="${csvOnclick}">CSV</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>
        <div class="text-xl font-black ${totalColorClass} font-mono mb-2">${totalLabel}</div>
        <div class="space-y-2 text-xs">
          ${itemsHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderReportsModule({ sellers = [], resellers = [], wholesalers = [], kpi = {}, costs = [], buying = [], invest = [], orders = [] }) {
  const allOrders = orders.length ? orders : ((window.__adminState && window.__adminState.orders) || []);

  const stdPeriods = [
    { label: 'দৈনিক', mult: 0.08 },
    { label: 'সপ্তাহ', mult: 0.3 },
    { label: 'মাসিক', mult: 1, active: true },
    { label: 'বাৎসরিক', mult: 11 }
  ];

  return [
    renderTabularReportSector({
      pageId: 'page-report-seller',
      title: '🏪 সেলার ও ভেন্ডর পারফরম্যান্স রিপোর্ট',
      subtitle: 'ভেন্ডর স্টোরগুলোর বিক্রয় ভলিউম, কমিশন আয় ও প্রোডাক্ট কাউন্টার',
      periods: stdPeriods,
      csvOnclick: "window.exportGenericCsv('Seller_Report', ['ID', 'Store', 'Owner', 'Products', 'Commission'], sellers.map(s=>[s.id, s.store, s.name, s.products_count, s.commission]))",
      kpiCols: 'sm:grid-cols-4',
      kpis: [
        { boxClass: 'p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800', label: 'মোট সেলার বিক্রয়', valClass: 'text-lg font-black text-emerald-600 font-mono mt-1', baseVal: 245800, isCurrency: true, value: '৳2,45,800' },
        { boxClass: 'p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800', label: 'মার্কেটপ্লেস কমিশন আয়', valClass: 'text-lg font-black text-indigo-600 font-mono mt-1', baseVal: 24580, isCurrency: true, value: '৳24,580' },
        { boxClass: 'p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border', label: 'সক্রিয় ভেন্ডর স্টোর', valClass: 'text-lg font-black text-slate-900 dark:text-white font-mono mt-1', value: `${sellers.length} টি` },
        { boxClass: 'p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800', label: 'গড় ডেলিভারি সাকসেস', valClass: 'text-lg font-black text-amber-600 font-mono mt-1', value: '৯৬.৪%' }
      ],
      headers: ['সেলার ID', 'স্টোর ও মালিক', 'পণ্য সংখ্যা', 'কমিশন রেট', 'মোট বিক্রয়', 'স্ট্যাটাস'],
      rowsHtml: sellers.map((s, idx) => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="py-2.5 px-3 font-mono font-bold text-indigo-600">${s.id}</td>
          <td class="py-2.5 px-3 font-bold">${s.store} (${s.name})</td>
          <td class="py-2.5 px-3 font-mono">${s.products_count || 15} টি</td>
          <td class="py-2.5 px-3 font-mono text-emerald-600 font-bold">${s.commission || '10%'}</td>
          <td class="py-2.5 px-3 font-mono font-black">৳${(125000 - idx * 18000).toLocaleString('en-IN')}</td>
          <td class="py-2.5 px-3"><span class="badge badge-success text-[10px]">${s.status || 'Active'}</span></td>
        </tr>
      `).join('')
    }),

    renderTabularReportSector({
      pageId: 'page-report-reseller',
      title: '🤝 রিসেলার কমিশন ও ড্রপশিপিং রিপোর্ট',
      subtitle: 'রিসেলার পার্টনারদের মাধ্যমে অর্জিত বিক্রয়, প্রদত্ত কমিশন ও বকেয়া ওয়ালেট ব্যালেন্স',
      periods: [
        { label: 'দৈনিক', mult: 0.1 },
        { label: 'সপ্তাহ', mult: 0.35 },
        { label: 'মাসিক', mult: 1, active: true },
        { label: 'বাৎসরিক', mult: 12 }
      ],
      csvOnclick: "window.exportGenericCsv('Reseller_Report', ['ID', 'Name', 'Shop', 'Phone', 'Balance'], resellers.map(r=>[r.shop_id||r.id, r.name, r.shop_name||r.shop, r.mobile||r.phone, r.balance]))",
      kpiCols: 'sm:grid-cols-4',
      kpis: [
        { boxClass: 'p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800', label: 'মোট রিসেলার নেট সেলস', valClass: 'text-lg font-black text-emerald-600 font-mono mt-1', baseVal: 350800, isCurrency: true, value: '৳3,50,800' },
        { boxClass: 'p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800', label: 'প্রদত্ত মোট কমিশন', valClass: 'text-lg font-black text-amber-600 font-mono mt-1', baseVal: 52600, isCurrency: true, value: '৳52,600' },
        { boxClass: 'p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border', label: 'সক্রিয় রিসেলার', valClass: 'text-lg font-black text-slate-900 dark:text-white font-mono mt-1', value: `${resellers.length} জন` },
        { boxClass: 'p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800', label: 'ওয়ালেট ব্যালেন্স (দেয়)', valClass: 'text-lg font-black text-indigo-600 font-mono mt-1', value: `৳${resellers.reduce((a, r) => a + (Number(r.balance) || 0), 0).toLocaleString('en-IN')}` }
      ],
      headers: ['Shop_ID', 'রিসেলার ও শপ', 'মোবাইল', 'মোট আয়', 'চলতি ব্যালেন্স', 'স্ট্যাটাস'],
      rowsHtml: resellers.map(r => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="py-2.5 px-3 font-mono font-bold text-emerald-600">${r.shop_id || r.id}</td>
          <td class="py-2.5 px-3 font-bold">${r.name} (${r.shop_name || r.shop})</td>
          <td class="py-2.5 px-3 font-mono">${r.mobile || r.phone}</td>
          <td class="py-2.5 px-3 font-mono font-bold text-emerald-600">৳${r.total_earned || 12500}</td>
          <td class="py-2.5 px-3 font-mono font-black">৳${r.balance || 0}</td>
          <td class="py-2.5 px-3"><span class="badge badge-success text-[10px]">${r.status || 'Active'}</span></td>
        </tr>
      `).join('')
    }),

    renderTabularReportSector({
      pageId: 'page-report-wholesaler',
      title: '🏢 হোলসেলার পার্টনার ক্রয় রিপোর্ট',
      subtitle: 'নিবন্ধিত পাইকারি ক্রেতাদের বাল্ক অর্ডার ভলিউম ও ডিসকাউন্ট টিয়ার রিপোর্ট',
      periods: [
        { label: 'দৈনিক', mult: 0.12 },
        { label: 'মাসিক', mult: 1, active: true },
        { label: 'বাৎসরিক', mult: 10 }
      ],
      csvOnclick: "window.exportGenericCsv('Wholesaler_Report', ['ID', 'Company', 'Tier', 'Orders'], wholesalers.map(w=>[w.shop_id||w.id, w.shop_name||w.company, w.tier, w.total_orders]))",
      kpiCols: 'sm:grid-cols-3',
      kpis: [
        { boxClass: 'p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800', label: 'পাইকারি সরবরাহ রাজস্ব', valClass: 'text-lg font-black text-amber-600 font-mono mt-1', baseVal: 385000, isCurrency: true, value: '৳3,85,000' },
        { boxClass: 'p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800', label: 'গড় বাল্ক অর্ডার ভলিউম', valClass: 'text-lg font-black text-emerald-600 font-mono mt-1', baseVal: 27500, isCurrency: true, value: '৳27,500' },
        { boxClass: 'p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border', label: 'ভেরিফায়েড হোলসেলার', valClass: 'text-lg font-black text-slate-900 dark:text-white font-mono mt-1', value: `${wholesalers.length} টি প্রতিষ্ঠান` }
      ],
      headers: ['Shop_ID', 'প্রতিষ্ঠান ও মালিক', 'মোবাইল', 'MOQ ও ডিসকাউন্ট', 'সম্পন্ন চালান', 'স্ট্যাটাস'],
      rowsHtml: wholesalers.map(w => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="py-2.5 px-3 font-mono font-bold text-amber-600">${w.shop_id || w.id}</td>
          <td class="py-2.5 px-3 font-bold">${w.shop_name || w.company} (${w.name})</td>
          <td class="py-2.5 px-3 font-mono">${w.mobile || w.phone}</td>
          <td class="py-2.5 px-3 font-mono text-emerald-600 font-bold">${w.tier || '15% Off'}</td>
          <td class="py-2.5 px-3 font-mono font-black">${w.total_orders || 10} টি</td>
          <td class="py-2.5 px-3"><span class="badge badge-success text-[10px]">${w.status || 'Approved'}</span></td>
        </tr>
      `).join('')
    }),

    renderTabularReportSector({
      pageId: 'page-report-sales',
      title: '📊 সার্বিক বিক্রয় ও মুনাফা রিপোর্ট (Sales Analytics)',
      subtitle: 'দৈনিক, সাপ্তাহিক, মাসিক ও বাৎসরিক খুচরা ও অনলাইন বিক্রয় খতিয়ান',
      periods: [
        { label: 'দৈনিক', mult: 0.05 },
        { label: 'সাপ্তাহিক', mult: 0.25 },
        { label: 'মাসিক', mult: 1, active: true },
        { label: 'বাৎসরিক', mult: 12 }
      ],
      csvOnclick: "window.exportAdminOrdersCsv()",
      kpiCols: 'sm:grid-cols-3',
      kpis: [
        { boxClass: 'p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 space-y-1', labelClass: 'text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase', label: 'মোট গ্রস বিক্রয়', valClass: 'text-xl font-black text-emerald-600 font-mono', baseVal: kpi.total_sales || 1500000, isCurrency: true, value: formatCurrency(kpi.total_sales) },
        { boxClass: 'p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-1', labelClass: 'text-[10px] text-slate-400 font-bold uppercase', label: 'সম্পন্ন অর্ডার ভলিউম', valClass: 'text-xl font-black text-slate-900 dark:text-white font-mono', baseVal: kpi.total_orders || 846, isCurrency: false, value: `${kpi.total_orders} টি` },
        { boxClass: 'p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 space-y-1', labelClass: 'text-[10px] text-indigo-800 dark:text-indigo-300 font-bold uppercase', label: 'নিট মুনাফা মার্জিন (২২%)', valClass: 'text-xl font-black text-indigo-600 font-mono', baseVal: kpi.total_profit || 330000, isCurrency: true, value: formatCurrency(kpi.total_profit) }
      ],
      headers: ['অর্ডার ID', 'গ্রাহক', 'পণ্য', 'পেমেন্ট', 'মোট বিল', 'স্ট্যাটাস'],
      rowsHtml: allOrders.slice(0, 15).map(o => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td class="py-2 px-3 font-mono font-bold text-emerald-600">${o.order_id}</td>
          <td class="py-2 px-3 font-bold">${o.customer_name} (${o.phone})</td>
          <td class="py-2 px-3 truncate max-w-xs">${o.products || o.product_name}</td>
          <td class="py-2 px-3">${o.payment_method}</td>
          <td class="py-2 px-3 font-mono font-black">৳${o.total_amount}</td>
          <td class="py-2 px-3"><span class="badge badge-success text-[10px]">${o.order_status}</span></td>
        </tr>
      `).join('')
    }),

    renderTabularReportSector({
      pageId: 'page-report-wholesale',
      title: '📦 পাইকারি সাপ্লাই ও বাল্ক ডিস্ট্রিবিউশন রিপোর্ট',
      subtitle: 'হোলসেল ডিলারদের বাল্ক শিপমেন্ট, কার্টন সরবরাহ ও রাজস্ব হিসাব',
      periods: [],
      csvOnclick: '',
      kpiCols: 'sm:grid-cols-3',
      kpis: [
        { boxClass: 'p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200', label: 'মোট পাইকারি ভলিউম', valClass: 'text-xl font-black text-amber-600 font-mono mt-1', value: '৳৩,৮৫,০০০' },
        { boxClass: 'p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200', label: 'মোট বাল্ক চালান', valClass: 'text-xl font-black text-emerald-600 font-mono mt-1', value: '২৩ টি চালান' },
        { boxClass: 'p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border', label: 'সরবরাহকৃত মোট ইউনিট', valClass: 'text-xl font-black text-slate-900 dark:text-white font-mono mt-1', value: '১,৪২০ পিস' }
      ],
      headers: []
    }),

    renderLedgerReportSector({
      pageId: 'page-report-costs',
      title: '💸 ব্যবসায়িক ব্যয় ও খরচ রিপোর্ট',
      csvOnclick: "window.exportGenericCsv('Costs_Report', ['ID', 'Title', 'Category', 'Amount', 'Date'], costs.map(c=>[c.id, c.title, c.category, c.amount, c.date]))",
      totalLabel: `মোট ব্যয়: ${formatCurrency(costs.reduce((a, c) => a + (Number(c.amount) || 0), 0))}`,
      totalColorClass: 'text-rose-500',
      itemsHtml: costs.map(c => `
        <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-900 dark:text-white">${c.title}</div>
            <div class="text-[10px] text-slate-400">${c.category} • ${c.date}</div>
          </div>
          <span class="font-mono font-bold text-rose-500">৳${c.amount}</span>
        </div>
      `).join('')
    }),

    renderLedgerReportSector({
      pageId: 'page-report-buying',
      title: '🛒 পাইকারি স্টক ক্রয় রিপোর্ট',
      csvOnclick: "window.exportGenericCsv('Buying_Report', ['ID', 'Supplier', 'Product', 'Qty', 'Total'], buying.map(b=>[b.id, b.supplier, b.product, b.quantity, b.total_amount]))",
      totalLabel: `মোট স্টক ক্রয়: ${formatCurrency(buying.reduce((a, b) => a + (Number(b.total_amount) || 0), 0))}`,
      totalColorClass: 'text-slate-900 dark:text-white',
      itemsHtml: buying.map(b => `
        <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-900 dark:text-white">${b.product}</div>
            <div class="text-[10px] text-slate-400">সাপ্লায়ার: ${b.supplier} • পরিমাণ: ${b.quantity} পিস • ${b.date || ''}</div>
          </div>
          <span class="font-mono font-bold text-emerald-600">৳${b.total_amount}</span>
        </div>
      `).join('')
    }),

    renderLedgerReportSector({
      pageId: 'page-report-invest',
      title: '💼 মূলধন ও বিনিয়োগ রিপোর্ট',
      csvOnclick: "window.exportGenericCsv('Invest_Report', ['ID', 'Investor', 'Amount', 'Note', 'Date'], invest.map(i=>[i.id, i.investor, i.amount, i.note, i.date]))",
      totalLabel: `মোট মূলধন: ${formatCurrency(invest.reduce((a, i) => a + (Number(i.amount) || 0), 0))}`,
      totalColorClass: 'text-emerald-600',
      itemsHtml: invest.map(i => `
        <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-900 dark:text-white">${i.investor}</div>
            <div class="text-[10px] text-slate-400">${i.note} • ${i.date}</div>
          </div>
          <span class="font-mono font-bold text-emerald-600">৳${i.amount}</span>
        </div>
      `).join('')
    })
  ].join('\n');
}
