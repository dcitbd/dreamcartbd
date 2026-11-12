/**
 * DREAM CART BD — Order Management Module (adminOrders.js)
 * Implements:
 * - Full 9-column order management with checkboxes & bulk actions
 * - Abandoned checkout recovery with direct WhatsApp reminders
 * - Successful deliveries, courier shipping, unpaid orders & returns
 * - Manual order entry with instant cash voucher popup and printing
 * - Customer CRM database & Reviews moderation
 */

import { formatCurrency } from '../../../utils/format.js';
import { toast } from '../../../components/Toast.js';

// MODULE: adminOrders.js
// ============================================================================
/**
 * DREAM CART BD — Order Management Module (adminOrders.js)
 * Implements:
 * - 9-column complete order management with checkboxes & bulk actions
 * - Abandoned checkout recovery with direct WhatsApp reminders
 * - Manual order entry with instant cash voucher popup and printing
 * - Customer CRM database & Reviews moderation
 */


function renderOrderStatusFilteredPage({ pageId, iconHtml, title, headerBadgeHtml = '', items = [], cardClass, titleFn, subFn, subClass, badgeClass, badgeTextFn }) {
  return `
    <div id="${pageId}" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="border-b pb-2 flex items-center justify-between">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            ${iconHtml} ${title}
          </h3>
          ${headerBadgeHtml}
        </div>
        <div class="space-y-2 text-xs">
          ${items.map(o => `
            <div class="${cardClass}">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${titleFn(o)}</div>
                <div class="text-[10px] ${subClass}">${subFn(o)}</div>
              </div>
              <span class="badge ${badgeClass} text-[10px]">${badgeTextFn(o)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function renderOrdersModule({ orders, incompleteOrders, customers, reviews }) {
  return `
    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: ORDER MANAGEMENT (10 Distinct Standalone Views)  -->
    <!-- ================================================================= -->

    <!-- 1. All Orders List with Digital Counter Cards, Pro Columns, Responsive View & Bulk Actions -->
    <div id="page-orders-all" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3.5">
        <!-- Top Header & Quick Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>📋</span> সকল অর্ডার তালিকা (মোট <span id="admin-orders-total-badge" class="font-mono text-emerald-600">${orders.length}</span> টি | প্রদর্শিত: <span id="admin-orders-showing-count" class="font-mono text-indigo-600">${orders.length}</span> টি)
              </h3>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">Sheet: Orders</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">ডিজিটাল কার্ড কাউন্টার ফিল্টার, বাল্ক সিলেকশন, ফ্রড চেক, কুরিয়ার বুকিং ও ইনভয়েস ভাউচার প্রিন্ট</p>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <button type="button" class="btn-secondary py-1.5 px-3 font-bold" onclick="window.syncAdminOrdersFromSheet()">🔄 শিট সিঙ্ক</button>
            <button type="button" class="btn-primary py-1.5 px-3.5 font-bold" onclick="switchAdminPage('page-orders-add', 'group-orders')">+ নতুন অর্ডার</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.exportAdminOrdersCsv()">📥 এক্সেল CSV</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Interactive Digital Card Counter Filters (6 Cards) -->
        <div id="admin-orders-kpi-cards" class="dc-orders-kpi-grid">
          ${window.renderOrdersKpiCountersHtml ? window.renderOrdersKpiCountersHtml(orders) : ''}
        </div>

        <!-- Search Bar, Payment Filter, Status Pills & Responsive Table/Card Switcher -->
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 text-xs">
          <div class="flex flex-wrap items-center gap-2 flex-1">
            <input
              type="text"
              id="admin-orders-search-input"
              placeholder="🔍 অর্ডার আইডি, নাম, ফোন নম্বর, পণ্য বা ঠিকানা দিয়ে সার্চ..."
              class="form-control text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 flex-1 min-w-[210px]"
              oninput="window.handleOrdersListFilterChange()"
            />
            <select
              id="admin-orders-paymethod-filter"
              onchange="window.handleOrdersListFilterChange()"
              class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold"
              style="width:auto;min-width:145px;"
            >
              <option value="ALL">💳 সকল পেমেন্ট মেথড</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="bkash">বিকাশ (bKash)</option>
              <option value="nagad">নগদ (Nagad)</option>
              <option value="rocket">রকেট (Rocket)</option>
              <option value="bank">ব্যাংক (Bank)</option>
            </select>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-1 overflow-x-auto pb-0.5">
              <button type="button" data-pill-status="" class="order-status-pill active" onclick="window.filterOrderStatus('', this, 'ALL')">সকল</button>
              <button type="button" data-pill-status="Processing" class="order-status-pill" onclick="window.filterOrderStatus('Processing', this, 'PROCESSING')">প্রসেসিং</button>
              <button type="button" data-pill-status="Shipped" class="order-status-pill" onclick="window.filterOrderStatus('Shipped', this, 'SHIPPED')">কুরিয়ারে</button>
              <button type="button" data-pill-status="Delivered" class="order-status-pill" onclick="window.filterOrderStatus('Delivered', this, 'DELIVERED')">সফল ডেলিভারি</button>
              <button type="button" data-pill-status="UNPAID_COD" class="order-status-pill" onclick="window.filterOrderStatus('UNPAID_COD', this, 'UNPAID_COD')">বকেয়া/COD</button>
              <button type="button" data-pill-status="Cancelled" class="order-status-pill" onclick="window.filterOrderStatus('Cancelled', this, 'CANCELLED')">বাতিল</button>
            </div>
            <div class="flex items-center gap-1 border-l pl-2">
              <button type="button" id="btn-orders-view-table" class="order-status-pill active" onclick="window.setOrdersListViewMode('table')" title="টেবিল ভিউ">📋 টেবিল</button>
              <button type="button" id="btn-orders-view-cards" class="order-status-pill" onclick="window.setOrdersListViewMode('cards')" title="রেস্পন্সিভ কার্ড ভিউ">🗂️ কার্ড</button>
            </div>
          </div>
        </div>

        <!-- Sticky Bulk Operations Action Bar -->
        <div id="bulk-orders-actions-bar" class="hidden p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <span>✓ <span id="bulk-selected-count">0</span> টি অর্ডার নির্বাচিত হয়েছে:</span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" class="btn-primary py-1 px-3 text-[10px] font-bold" onclick="window.handleBulkOrdersAction('courier')">📦 বাল্ক কুরিয়ার পাঠান</button>
            <button type="button" class="btn-secondary py-1 px-2.5 text-[10px] font-bold" onclick="window.handleBulkOrdersAction('status')">🔄 স্ট্যাটাস পরিবর্তন</button>
            <button type="button" class="btn-secondary py-1 px-2.5 text-[10px] font-bold" onclick="window.handleBulkOrdersAction('fraud')">🛡️ বাল্ক ফ্রড চেক</button>
            <button type="button" class="btn-secondary py-1 px-2 text-[10px] font-bold text-rose-600 border-rose-300" onclick="window.handleBulkOrdersAction('delete')">🗑️ মুছুন</button>
          </div>
        </div>

        <!-- Pro Balanced 9-Column Order Management Table -->
        <div id="admin-orders-table-view-wrap" class="dc-orders-pro-table-wrap">
          <table class="dc-orders-pro-table text-left text-xs">
            <thead>
              <tr>
                <th class="text-center" style="width:38px;">
                  <input type="checkbox" onchange="window.toggleSelectAllOrders(this)" title="সবগুলো নির্বাচন করুন" />
                </th>
                <th style="width:130px;">Order ID ও তারিখ</th>
                <th style="width:195px;">গ্রাহক, ফোন ও ঠিকানা</th>
                <th style="width:235px;">পণ্য, সাইজ ও কালার</th>
                <th style="width:125px;">মূল্য, পরিমাণ ও পেমেন্ট</th>
                <th style="width:130px;">TrxID ও ফ্রড চেক</th>
                <th style="width:138px;">অর্ডার স্ট্যাটাস</th>
                <th style="width:128px;">কুরিয়ার বুকিং</th>
                <th class="text-right" style="width:142px;">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="admin-orders-full-tbody">
              ${orders.map(o => window.renderOrderRowHtml ? window.renderOrderRowHtml(o) : '').join("")}
            </tbody>
          </table>
        </div>

        <!-- Responsive Order Cards Grid View (Toggled via Card View button) -->
        <div id="admin-orders-cards-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          ${orders.map(o => window.renderOrderCardHtml ? window.renderOrderCardHtml(o) : '').join("")}
        </div>
      </div>
    </div>

    <!-- 2. Incomplete Orders Page -->
    <div id="page-orders-incomplete" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span class="text-rose-500">⚠️</span> অসম্পূর্ণ অর্ডারসমূহ (${incompleteOrders.length} টি)
            </h3>
            <p class="text-[11px] text-slate-400">যেসব গ্রাহক ফর্ম পূরণ করেও অর্ডার কনফার্ম করেননি (স্বয়ংক্রিয়ভাবে লিস্ট ও Incomplete_Orders শিটে জমা হয়)</p>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <button type="button" class="btn-primary py-1.5 px-3 font-bold" onclick="document.getElementById('modal-add-incomplete-order')?.classList.remove('hidden')">
              + অসম্পূর্ণ অর্ডার এন্ট্রি
            </button>
            <button type="button" class="btn-primary text-xs py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold" onclick="window.sendIncompleteOrderReminders()">
              শিট সিঙ্ক ও রিমাইন্ডার 📤
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2.5 px-3">ড্রাফট ID</th>
                <th class="py-2.5 px-3">তারিখ</th>
                <th class="py-2.5 px-3">গ্রাহক ও ফোন</th>
                <th class="py-2.5 px-3">ঠিকানা ও পণ্য</th>
                <th class="py-2.5 px-3">মূল্য</th>
                <th class="py-2.5 px-3 text-right">ফলোআপ ও কনফার্ম</th>
              </tr>
            </thead>
            <tbody id="admin-incomplete-orders-tbody" class="divide-y">
              ${incompleteOrders.map(io => {
                const safeId = String(io.order_id || '').replace(/'/g, "\\'");
                return `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td class="py-2.5 px-3 font-mono font-bold text-rose-500">${io.order_id}</td>
                    <td class="py-2.5 px-3 text-slate-400">${io.date || 'আজকে'}</td>
                    <td class="py-2.5 px-3">
                      <div class="font-bold">${io.customer_name}</div>
                      <div class="font-mono text-slate-400 text-[10px]">${io.phone}</div>
                    </td>
                    <td class="py-2.5 px-3 text-slate-500">${io.address || ''} ${io.products ? `<div class="text-[10px] text-emerald-600 font-bold">পণ্য: ${io.products}</div>` : ''}</td>
                    <td class="py-2.5 px-3 font-bold font-mono">৳${io.total_amount}</td>
                    <td class="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                      <button type="button" onclick="window.convertIncompleteToOrder('${safeId}')" class="btn-primary py-1 px-2.5 text-[10px] font-bold">✓ কনফার্ম অর্ডার</button>
                      <a href="https://wa.me/88${String(io.phone || '').replace(/[^0-9]/g, '')}?text=Hello,%20we%20noticed%20you%20started%20an%20order%20on%20Dream%20Cart%20BD.%20Can%20we%20assist%20you?" target="_blank" class="btn-secondary py-1 px-2.5 text-[10px] text-emerald-600 font-bold">
                        WhatsApp 💬
                      </a>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 3-6. Filtered Order Status Pages (Rendered via Reusable Component) -->
    ${renderOrderStatusFilteredPage({
      pageId: 'page-orders-success',
      iconHtml: '<span class="text-emerald-600">✓</span>',
      title: 'সফল ডেলিভারি',
      headerBadgeHtml: '<span class="badge badge-success text-xs font-bold">৯৫.২% সাকসেসফুল</span>',
      items: orders.filter(o => o.order_status === 'Delivered' || o.order_status === 'Success'),
      cardClass: 'p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between gap-2',
      titleFn: o => `${o.order_id} • ${o.customer_name} (${o.phone})`,
      subFn: o => `পরিশোধিত মূল্য: ৳${o.total_amount} • মেথড: ${o.payment_method}`,
      subClass: 'text-emerald-700 dark:text-emerald-400',
      badgeClass: 'badge-success',
      badgeTextFn: () => 'Delivered & Paid ✓'
    })}
    ${renderOrderStatusFilteredPage({
      pageId: 'page-orders-shipping',
      iconHtml: '<span>🚚</span>',
      title: 'কুরিয়ার ও শিপিং অর্ডার',
      items: orders.filter(o => o.order_status === 'Shipped' || o.order_status === 'Packing' || o.order_status === 'In Transit'),
      cardClass: 'p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2',
      titleFn: o => `${o.order_id} • ${o.customer_name} (${o.phone})`,
      subFn: o => `${o.products} • ৳${o.total_amount}`,
      subClass: 'text-slate-400',
      badgeClass: 'badge-warning',
      badgeTextFn: o => `In Courier (${o.order_status})`
    })}
    ${renderOrderStatusFilteredPage({
      pageId: 'page-orders-unpaid',
      iconHtml: '<span>💳</span>',
      title: 'পেমেন্ট অসম্পূর্ণ অর্ডার',
      items: orders.filter(o => o.payment_status === 'Pending'),
      cardClass: 'p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between gap-2',
      titleFn: o => `${o.order_id} • ${o.customer_name}`,
      subFn: o => `বকেয়া প্রদেয়: ৳${o.total_amount} (${o.payment_method})`,
      subClass: 'text-slate-400',
      badgeClass: 'badge-warning',
      badgeTextFn: () => 'Pending Payment'
    })}
    ${renderOrderStatusFilteredPage({
      pageId: 'page-orders-cancelled',
      iconHtml: '<span class="text-rose-500">✕</span>',
      title: 'বাতিল ও রিটার্নকৃত অর্ডার',
      items: orders.filter(o => o.order_status === 'Cancelled' || o.order_status === 'Returned'),
      cardClass: 'p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-2',
      titleFn: o => `${o.order_id} • ${o.customer_name}`,
      subFn: o => `স্ট্যাটাস: ${o.order_status}`,
      subClass: 'text-rose-600',
      badgeClass: 'badge-danger',
      badgeTextFn: o => o.order_status
    })}

    <!-- 7. Add Order Page (Manual Multi-Product Entry + Per-Product Size/Color + Live Price Calc + Voucher) -->
    <div id="page-orders-add" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-2xl">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন অর্ডার এন্ট্রি</h3>
          <p class="text-[11px] text-slate-400">পণ্যের নাম/আর্টিকেল (SKU) সার্চ করে একাধিক পণ্য, প্রতিটি পণ্যের নিজস্ব সাইজ/কালার ও অটো প্রাইজ ক্যালকুলেশন</p>
        </div>

        <form id="form-manual-add-order" class="space-y-3.5 text-xs" onsubmit="window.handleManualAddOrder(event)">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold mb-1">গ্রাহকের নাম *</label>
              <input type="text" id="add-ord-name" required placeholder="মোঃ ফারুক আহমেদ" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">ফোন নম্বর *</label>
              <input type="text" id="add-ord-phone" required placeholder="017xxxxxxxx" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
            </div>
          </div>

          <div>
            <label class="block font-bold mb-1">ডেলিভারি পূর্ণ ঠিকানা *</label>
            <textarea id="add-ord-address" rows="2" required placeholder="বাড়ি #, রোড #, এলাকা, থানা, জেলা..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
          </div>

          <!-- Multi-Product Search & Per-Product Size/Color Selection Box -->
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-900 dark:text-white">📦 পণ্য নির্ধারণ (মাল্টি-প্রোডাক্ট সার্চ ও সাইজ/কালার সিলেকশন):</h4>
              <button type="button" onclick="window.searchManualOrderProducts('')" class="text-[11px] text-emerald-600 font-bold hover:underline">সকল পণ্য দেখুন ↓</button>
            </div>

            <div class="relative">
              <input
                type="text"
                id="add-ord-prod-search"
                placeholder="🔍 পণ্যের নাম বা আর্টিকেল (SKU) লিখে সার্চ করুন (যেমন: Amazfit, DCBD-WT-01)..."
                oninput="window.searchManualOrderProducts(this.value)"
                onfocus="window.searchManualOrderProducts(this.value)"
                class="form-control text-xs w-full py-2 px-3.5 rounded-xl border border-emerald-400 font-bold bg-white dark:bg-slate-900"
              />
              <div id="add-ord-prod-search-results" class="hidden mt-1.5 space-y-1.5 max-h-56 overflow-y-auto p-2 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-lg"></div>
            </div>

            <!-- Selected Multi-Products List -->
            <div id="add-ord-selected-items-list" class="space-y-2">
              <div class="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-[11px] text-slate-400">
                🛍️ উপরের সার্চ বক্সে পণ্যের নাম বা আর্টিকেল (SKU) লিখে সিলেক্ট করুন (একাধিক পণ্য যুক্ত করতে পারবেন)।
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold mb-1">ডেলিভারি চার্জ (৳)</label>
              <select id="add-ord-delivery" onchange="window.recalcManualOrderTotal()" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
                <option value="70">কুমিল্লা সিটি (৳৭০)</option>
                <option value="90">ঢাকা সিটি (৳৯০)</option>
                <option value="120">ঢাকার বাইরে সারা দেশ (৳১২০)</option>
                <option value="0">ফ্রি ডেলিভারি (৳০)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">পেমেন্ট মেথড</label>
              <select id="add-ord-payment" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
                <option value="Cash on Delivery">Cash on Delivery (ক্যাশ অন ডেলিভারি)</option>
                <option value="bKash Online">bKash Online (বিকাশ)</option>
                <option value="Nagad Online">Nagad Online (নগদ)</option>
              </select>
            </div>
          </div>

          <!-- Auto-Calculated Price Breakdown Box -->
          <div class="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-600 dark:text-slate-300">নির্বাচিত পণ্যের মোট মূল্য (Subtotal):</span>
              <span id="add-ord-calc-subtotal" class="font-bold font-mono text-slate-900 dark:text-white">৳0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600 dark:text-slate-300">ডেলিভারি চার্জ:</span>
              <span id="add-ord-calc-delivery" class="font-bold font-mono text-slate-900 dark:text-white">৳0</span>
            </div>
            <div class="flex justify-between text-sm font-black text-emerald-700 dark:text-emerald-400 border-t border-emerald-200 dark:border-emerald-800 pt-1.5">
              <span>সর্বমোট প্রদেয় বিল (Grand Total):</span>
              <span id="add-ord-calc-grandtotal" class="font-mono text-base">৳0</span>
            </div>
          </div>

          <button type="submit" class="btn-primary py-2.5 px-6 font-bold w-full">অর্ডার সাবমিট ও ক্যাশ ভাউচার দেখুন →</button>
        </form>
      </div>
    </div>

    <!-- 8. Live Visitors Page -->
    <div id="page-orders-visitors" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> লাইভ সক্রিয় ভিজিটর ট্র্যাকিং
          </h3>
          <span class="badge badge-success text-xs font-bold">মোট ৩৮ জন ব্রাউজিং</span>
        </div>
        <div class="space-y-2 text-xs">
          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
            <div>
              <div class="font-bold">IP: 103.114.98.15 • ঢাকা (ধানমন্ডি)</div>
              <div class="text-[10px] text-slate-400">পেজ: /product/amazfit-gts-4 (স্মার্টফোন) • ২ মিনিট ধরে ব্রাউজিং</div>
            </div>
            <span class="badge badge-success text-[10px]">Active</span>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
            <div>
              <div class="font-bold">IP: 103.205.71.20 • কুমিল্লা (কান্দিরপাড়)</div>
              <div class="text-[10px] text-slate-400">পেজ: /checkout (অর্ডার ফর্ম পূরণ করছে) • ১ মিনিট আগে</div>
            </div>
            <span class="badge badge-success text-[10px]">Active</span>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
            <div>
              <div class="font-bold">IP: 118.179.44.82 • চট্টগ্রাম (জিইসি)</div>
              <div class="text-[10px] text-slate-400">পেজ: /products?cat=Kitchen • ৪ মিনিট আগে</div>
            </div>
            <span class="badge badge-success text-[10px]">Active</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 9. Customer CRM Page -->
    <div id="page-orders-customers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">👥 কাস্টমার ডাটাবেজ (${customers.length} জন)</h3>
            <p class="text-[11px] text-slate-400">সকল গ্রাহকের তালিকা ও ম্যানুয়াল কাস্টমার এন্ট্রি (Customers শিটে সিঙ্ককৃত)</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button type="button" class="btn-primary py-1.5 px-3 font-bold" onclick="document.getElementById('modal-add-customer')?.classList.remove('hidden')">+ নতুন কাস্টমার যুক্ত করুন</button>
            <button type="button" class="btn-secondary py-1 px-3 text-xs" onclick="window.exportGenericCsv('Customers', ['Name', 'Phone', 'Address', 'Total Spent'], customers.map(c=>[c.name, c.phone, c.address, c.total_spent]))">CSV</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2 px-3">আইডি</th>
                <th class="py-2 px-3">নাম</th>
                <th class="py-2 px-3">ফোন নম্বর</th>
                <th class="py-2 px-3">ইমেইল</th>
                <th class="py-2 px-3">ঠিকানা</th>
                <th class="py-2 px-3">মোট খরচ</th>
                <th class="py-2 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="admin-customers-tbody" class="divide-y">
              ${customers.map((c, idx) => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td class="py-2.5 px-3 font-mono text-[11px] text-emerald-600 font-bold">${c.customer_id || ('CUST-' + (101 + idx))}</td>
                  <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white">${c.name}</td>
                  <td class="py-2.5 px-3 font-mono">${c.phone}</td>
                  <td class="py-2.5 px-3 text-slate-500">${c.email || '—'}</td>
                  <td class="py-2.5 px-3 text-slate-500">${c.address}</td>
                  <td class="py-2.5 px-3 font-bold font-mono text-emerald-600">৳${c.total_spent}</td>
                  <td class="py-2.5 px-3 text-right">
                    <button type="button" class="btn-secondary py-1 px-2 text-[10px]" onclick="window.copyToClipboard('${c.phone}', 'ফোন কপি হয়েছে!')">ফোন কপি</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 10. Reviews Page -->
    <div id="page-orders-reviews" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">⭐ গ্রাহক রিভিউ ও রেটিং (${reviews.length})</h3>
            <p class="text-[11px] text-slate-400">গ্রাহক রিভিউ মডারেশন ও ম্যানুয়াল রিভিউ সংযোজন (Reviews শিটে সিঙ্ককৃত)</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button type="button" class="btn-primary py-1.5 px-3 font-bold" onclick="document.getElementById('modal-add-review')?.classList.remove('hidden')">+ নতুন রিভিউ যুক্ত করুন</button>
            <button type="button" class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>
        <div id="admin-reviews-list-container" class="space-y-2.5 text-xs">
          ${reviews.map(r => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                  <span>${r.customer || r.customer_name}</span>
                  <span class="text-amber-500">${'★'.repeat(Math.min(5, Math.max(1, Number(r.rating) || 5)))}</span>
                  <span class="text-[10px] text-emerald-600 font-bold">(${r.product || r.product_name})</span>
                  <span class="text-[10px] text-slate-400 font-normal">• ${r.date || 'আজকে'}</span>
                </div>
                <p class="text-slate-600 dark:text-slate-300 mt-1">"${r.comment || r.review_text}"</p>
              </div>
              <span class="badge badge-success text-[10px]">Approved ✓</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- Modal for Editing an Order -->
    <div id="modal-edit-order" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-lg w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">✏️ অর্ডার তথ্য এডিট ও আপডেট করুন</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-edit-order')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleSaveEditOrder(event)" class="space-y-3">
          <input type="hidden" id="edit-ord-id" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">গ্রাহকের নাম *</label>
              <input type="text" id="edit-ord-name" required class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">ফোন নম্বর *</label>
              <input type="text" id="edit-ord-phone" required class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">ডেলিভারি ঠিকানা *</label>
            <input type="text" id="edit-ord-address" required class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">পণ্যের নাম ও বিবরণ *</label>
            <input type="text" id="edit-ord-products" required class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label class="block font-bold mb-1">সাইজ</label>
              <input type="text" id="edit-ord-size" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">কালার</label>
              <input type="text" id="edit-ord-color" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">পরিমাণ</label>
              <input type="number" id="edit-ord-qty" min="1" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">মোট বিল (৳)</label>
              <input type="number" id="edit-ord-total" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-mono font-bold text-emerald-600" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label class="block font-bold mb-1">পেমেন্ট মেথড</label>
              <input type="text" id="edit-ord-paymethod" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">পেমেন্ট স্ট্যাটাস</label>
              <select id="edit-ord-paystatus" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-bold">
                <option value="Pending">Pending</option>
                <option value="Paid">Paid ✓</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">অর্ডার স্ট্যাটাস</label>
              <select id="edit-ord-status" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-bold">
                <option value="Order Placed">Order Placed</option>
                <option value="Processing">Processing</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered ✓</option>
                <option value="Returned">Returned</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-edit-order')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">💾 আপডেট ও শিটে সেভ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal for Adding Incomplete Order -->
    <div id="modal-add-incomplete-order" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">⚠️ নতুন অসম্পূর্ণ অর্ডার এন্ট্রি</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-incomplete-order')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAddIncompleteOrder(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">গ্রাহকের নাম *</label>
            <input type="text" id="inc-ord-name" required placeholder="রফিকুল ইসলাম" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">মোবাইল নম্বর *</label>
            <input type="text" id="inc-ord-phone" required placeholder="017xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">ঠিকানা</label>
            <input type="text" id="inc-ord-address" placeholder="মিরপুর-১০, ঢাকা" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1">পণ্যের নাম</label>
              <input type="text" id="inc-ord-products" placeholder="Amazfit Smartwatch" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">সম্ভাব্য মূল্য (৳)</label>
              <input type="number" id="inc-ord-amount" placeholder="2450" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-incomplete-order')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ ও শিটে জমা করুন</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal for Adding Manual Customer -->
    <div id="modal-add-customer" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">👥 নতুন কাস্টমার যুক্ত করুন</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-customer')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddCustomer(event)" class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1">কাস্টমার আইডি (অটো)</label>
              <input type="text" id="adm-cust-id" placeholder="CUST-Auto" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">মোবাইল নম্বর *</label>
              <input type="text" id="adm-cust-phone" required placeholder="017xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">গ্রাহকের পূর্ণ নাম *</label>
            <input type="text" id="adm-cust-name" required placeholder="মোঃ তানভীর আহমেদ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">ইমেইল অ্যাড্রেস</label>
            <input type="email" id="adm-cust-email" placeholder="customer@example.com" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">সম্পূর্ণ ঠিকানা *</label>
            <input type="text" id="adm-cust-address" required placeholder="ধানমন্ডি, ঢাকা" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">মোট ক্রয় পরিমাণ (৳)</label>
            <input type="number" id="adm-cust-spent" value="0" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-customer')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">কাস্টমার সংরক্ষণ করুন →</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal for Adding Manual Review -->
    <div id="modal-add-review" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">⭐ নতুন কাস্টমার রিভিউ যুক্ত করুন</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-review')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddReview(event)" class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1">গ্রাহকের নাম *</label>
              <input type="text" id="adm-rev-customer" required placeholder="সুলতানা জাহান" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">মোবাইল নম্বর</label>
              <input type="text" id="adm-rev-phone" placeholder="018xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-2">
              <label class="block font-bold mb-1">পণ্যের নাম *</label>
              <input type="text" id="adm-rev-product" required placeholder="Amazfit GTS 4 Smartwatch" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">রেটিং (১-৫) *</label>
              <select id="adm-rev-rating" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-bold text-amber-500">
                <option value="5">★★★★★ (5)</option>
                <option value="4">★★★★☆ (4)</option>
                <option value="3">★★★☆☆ (3)</option>
                <option value="2">★★☆☆☆ (2)</option>
                <option value="1">★☆☆☆☆ (1)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">রিভিউ মন্তব্য (Comment) *</label>
            <textarea id="adm-rev-comment" rows="3" required placeholder="পণ্যটি অত্যন্ত চমৎকার এবং দ্রুত ডেলিভারি পেয়েছি..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-review')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">রিভিউ সংরক্ষণ করুন →</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal for Fraud Result -->
    <div id="modal-fraud-result" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-sm w-full space-y-3 text-xs text-center">
        <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 text-xl font-black mx-auto flex items-center justify-center">🛡️</div>
        <h4 class="font-black text-sm text-slate-900 dark:text-white">কুরিয়ার ফ্রড ডাটা যাচাই রিপোর্ট</h4>
        <div id="fraud-result-badge" class="badge badge-success text-xs font-bold mx-auto">Safe Customer</div>
        <div id="fraud-result-text" class="text-slate-500 text-[11px] p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border"></div>
        <button class="btn-primary py-2 px-5 font-bold w-full" onclick="document.getElementById('modal-fraud-result')?.classList.add('hidden')">বন্ধ করুন</button>
      </div>
    </div>

    <!-- Modal for Order Voucher -->
    <div id="modal-order-voucher" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">ক্যাশ ইনভয়েস ও ভাউচার</h4>
          <button class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-order-voucher')?.classList.add('hidden')">✕</button>
        </div>
        <div id="voucher-content-display"></div>
        <div class="flex items-center gap-2 pt-2 border-t">
          <button class="btn-primary py-2 px-4 font-bold flex-1" onclick="window.print()">ভাউচার প্রিন্ট 🖨️</button>
          <button class="btn-secondary py-2 px-4" onclick="document.getElementById('modal-order-voucher')?.classList.add('hidden')">বন্ধ</button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
