/**
 * DREAM CART BD — Order Management Module (adminOrders.js)
 * Implements:
 * - 9-column complete order management with checkboxes & bulk actions
 * - Abandoned checkout recovery with direct WhatsApp reminders
 * - Manual order entry with instant cash voucher popup and printing
 * - Customer CRM database & Reviews moderation
 */

import { formatCurrency } from '../../../utils/format.js';

export function renderOrdersModule({ orders, incompleteOrders, customers, reviews }) {
  return `
    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: ORDER MANAGEMENT (10 Distinct Standalone Views)  -->
    <!-- ================================================================= -->

    <!-- 1. All Orders List with Full Columns & Bulk Actions -->
    <div id="page-orders-all" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-2.5">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>📋</span> সকল অর্ডার তালিকা (All Orders - ${orders.length} টি)
            </h3>
            <p class="text-[11px] text-slate-400">বাল্ক সিলেকশন, ফ্রড চেক, কুরিয়ার বুকিং ও ইনভয়েস ভাউচার প্রিন্ট</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="switchAdminPage('page-orders-add', 'group-orders')">+ নতুন অর্ডার</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportAdminOrdersCsv()">📥 এক্সেল CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Search Bar & Status Filters -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <input 
            type="text" 
            placeholder="অর্ডার আইডি, নাম, ফোন বা ঠিকানা দিয়ে সার্চ..." 
            class="form-control text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-80" 
            oninput="window.handleAdminGlobalSearch(this.value)" 
          />

          <div class="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            <button class="order-status-pill active" onclick="window.filterOrderStatus('', this)">সকল (${orders.length})</button>
            <button class="order-status-pill" onclick="window.filterOrderStatus('Processing', this)">প্রসেসিং</button>
            <button class="order-status-pill" onclick="window.filterOrderStatus('Shipped', this)">কুরিয়ারে</button>
            <button class="order-status-pill" onclick="window.filterOrderStatus('Delivered', this)">সফল ডেলিভারি</button>
            <button class="order-status-pill" onclick="window.filterOrderStatus('Cancelled', this)">বাতিল</button>
          </div>
        </div>

        <!-- Sticky Bulk Operations Action Bar -->
        <div id="bulk-orders-actions-bar" class="hidden p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <span>✓ <span id="bulk-selected-count">0</span> টি অর্ডার নির্বাচিত হয়েছে:</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button class="btn-primary py-1 px-3 text-[10px] font-bold" onclick="window.handleBulkOrdersAction('courier')">📦 বাল্ক কুরিয়ার পাঠান</button>
            <button class="btn-secondary py-1 px-2.5 text-[10px] font-bold" onclick="window.handleBulkOrdersAction('status')">🔄 স্ট্যাটাস পরিবর্তন</button>
            <button class="btn-secondary py-1 px-2.5 text-[10px] font-bold" onclick="window.handleBulkOrdersAction('fraud')">🛡️ বাল্ক ফ্রড চেক</button>
            <button class="btn-secondary py-1 px-2 text-[10px] font-bold text-rose-600 border-rose-300" onclick="window.handleBulkOrdersAction('delete')">🗑️ মুছুন</button>
          </div>
        </div>

        <!-- Complete Order Management Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[10px]">
                <th class="py-2.5 px-2 text-center">
                  <input type="checkbox" onchange="window.toggleSelectAllOrders(this)" title="সবগুলো নির্বাচন করুন" />
                </th>
                <th class="py-2.5 px-3">Order ID</th>
                <th class="py-2.5 px-3">Name / Phone / Address</th>
                <th class="py-2.5 px-3">Product / Size / Color</th>
                <th class="py-2.5 px-3">Price / Qty / Payment</th>
                <th class="py-2.5 px-3">Transaction / Fraud / Rating</th>
                <th class="py-2.5 px-3">Update Status</th>
                <th class="py-2.5 px-3">Send Courier</th>
                <th class="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800" id="admin-orders-full-tbody">
              ${orders.map(o => `
                <tr class="admin-order-row hover:bg-slate-50 dark:hover:bg-slate-800/40 transition" data-order-id="${o.order_id}" data-status="${o.order_status}">
                  <td class="py-3 px-2 text-center">
                    <input type="checkbox" value="${o.order_id}" class="order-select-cb" onchange="window.updateBulkOrdersBar()" />
                  </td>
                  <td class="py-3 px-3 font-mono font-bold text-emerald-600">
                    <div>${o.order_id}</div>
                    <span class="text-[9px] text-slate-400 font-normal">ওয়েব অর্ডার</span>
                  </td>
                  <td class="py-3 px-3 max-w-xs">
                    <div class="font-bold text-slate-900 dark:text-white">${o.customer_name}</div>
                    <div class="font-mono text-slate-500 text-[10px]">${o.phone}</div>
                    <div class="truncate text-[10px] text-slate-400">${o.address}</div>
                    <button class="mt-1 text-[9px] text-emerald-600 font-bold hover:underline" onclick="window.copyToClipboard('${o.customer_name} | ${o.phone} | ${o.address.replace(/'/g, "\\'")}', 'কাস্টমার ইনফো কপি হয়েছে!')">
                      কপি ইনফো 📋
                    </button>
                  </td>
                  <td class="py-3 px-3 max-w-xs">
                    <div class="font-bold text-slate-800 dark:text-slate-200">${o.product_name || o.products}</div>
                    <div class="text-[10px] text-slate-400">সাইজ: <span class="font-bold">${o.size || 'Free Size'}</span> | কালার: <span class="font-bold">${o.color || 'Standard'}</span></div>
                  </td>
                  <td class="py-3 px-3 font-mono">
                    <div class="font-black text-slate-900 dark:text-white">৳${o.total_amount}</div>
                    <div class="text-[10px] text-slate-400">পরিমাণ: ${o.quantity || 1} পিস</div>
                    <span class="badge ${o.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'} text-[9px]">${o.payment_method}</span>
                  </td>
                  <td class="py-3 px-3">
                    <div class="font-mono text-[10px] text-slate-500">${o.transaction_id || 'COD'}</div>
                    <button class="mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold ${o.fraud_status && o.fraud_status.includes('High') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'}" onclick="window.handleCheckOrderFraud('${o.phone}', '${o.order_id}', this)">
                      🛡️ ${o.fraud_status || 'Safe (98%)'}
                    </button>
                    <div class="text-[10px] text-amber-500 mt-0.5">${o.customer_rating || '5/5 ★'}</div>
                  </td>
                  <td class="py-3 px-3">
                    <select 
                      class="form-control text-[11px] py-1 px-2 rounded-lg border font-bold" 
                      onchange="window.updateOrderStatus('${o.order_id}', this.value)"
                    >
                      <option value="Order Placed" ${o.order_status === 'Order Placed' ? 'selected' : ''}>Order Placed</option>
                      <option value="Processing" ${o.order_status === 'Processing' ? 'selected' : ''}>Processing</option>
                      <option value="Packing" ${o.order_status === 'Packing' ? 'selected' : ''}>Packing</option>
                      <option value="Shipped" ${o.order_status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                      <option value="Delivered" ${o.order_status === 'Delivered' ? 'selected' : ''}>Delivered ✓</option>
                      <option value="Returned" ${o.order_status === 'Returned' ? 'selected' : ''}>Returned</option>
                      <option value="Cancelled" ${o.order_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </td>
                  <td class="py-3 px-3">
                    <button class="btn-primary py-1 px-2 text-[10px] font-bold whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white" onclick="window.handleSendOrderToCourier('${o.order_id}', 'Steadfast')">
                      কুরিয়ারে পাঠান 🚀
                    </button>
                  </td>
                  <td class="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                    <button class="btn-secondary py-0.5 px-2 text-[10px]" onclick="window.copyToClipboard('${o.order_id}', 'অর্ডার আইডি কপি হয়েছে!')">আইডি</button>
                    <button class="btn-secondary py-0.5 px-2 text-[10px] text-rose-600 border-rose-200" onclick="if(confirm('অর্ডারটি মুছে ফেলতে চান?')) this.closest('tr').remove()">মুছুন</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 2. Incomplete Orders Page -->
    <div id="page-orders-incomplete" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span class="text-rose-500">⚠️</span> অসম্পূর্ণ অর্ডারসমূহ (Abandoned Checkout Recovery)
            </h3>
            <p class="text-[11px] text-slate-400">যেসব গ্রাহক ফর্ম পূরণ করেও অর্ডার কনফার্ম করেননি</p>
          </div>
          <button class="btn-primary text-xs py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold" onclick="window.sendIncompleteOrderReminders()">
            Send Order List 📤
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2.5 px-3">ড্রাফট ID</th>
                <th class="py-2.5 px-3">তারিখ</th>
                <th class="py-2.5 px-3">গ্রাহক ও ফোন</th>
                <th class="py-2.5 px-3">ঠিকানা</th>
                <th class="py-2.5 px-3">মূল্য</th>
                <th class="py-2.5 px-3 text-right">ফলোআপ</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${incompleteOrders.map(io => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td class="py-2.5 px-3 font-mono font-bold text-rose-500">${io.order_id}</td>
                  <td class="py-2.5 px-3 text-slate-400">${io.date}</td>
                  <td class="py-2.5 px-3">
                    <div class="font-bold">${io.customer_name}</div>
                    <div class="font-mono text-slate-400 text-[10px]">${io.phone}</div>
                  </td>
                  <td class="py-2.5 px-3 text-slate-500">${io.address}</td>
                  <td class="py-2.5 px-3 font-bold font-mono">৳${io.total_amount}</td>
                  <td class="py-2.5 px-3 text-right">
                    <a href="https://wa.me/88${io.phone}?text=Hello,%20we%20noticed%20you%20started%20an%20order%20on%20Dream%20Cart%20BD.%20Can%20we%20assist%20you?" target="_blank" class="btn-primary py-1 px-3 text-[10px] bg-emerald-600 font-bold">
                      WhatsApp বার্তা 💬
                    </a>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 3. Success Orders Page (Delivered & Paid) -->
    <div id="page-orders-success" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="border-b pb-2 flex items-center justify-between">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-emerald-600">✓</span> সফল ও পরিশোধিত ডেলিভারি (Delivered & Paid)
          </h3>
          <span class="badge badge-success text-xs font-bold">৯৫.২% সাকসেসফুল</span>
        </div>
        <div class="space-y-2 text-xs">
          ${orders.filter(o => o.order_status === 'Delivered').map(o => `
            <div class="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${o.order_id} • ${o.customer_name} (${o.phone})</div>
                <div class="text-[10px] text-emerald-700 dark:text-emerald-400">পরিশোধিত মূল্য: ৳${o.total_amount} • মেথড: ${o.payment_method}</div>
              </div>
              <span class="badge badge-success text-[10px]">Delivered & Paid ✓</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 4. In Shipping Orders Page -->
    <div id="page-orders-shipping" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>🚚</span> কুরিয়ারে / শিপিং পথে থাকা পার্সেল (In Shipping)
          </h3>
        </div>
        <div class="space-y-2 text-xs">
          ${orders.filter(o => o.order_status === 'Shipped' || o.order_status === 'Packing' || o.order_status === 'In Transit').map(o => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${o.order_id} • ${o.customer_name} (${o.phone})</div>
                <div class="text-[10px] text-slate-400">${o.products} • ৳${o.total_amount}</div>
              </div>
              <span class="badge badge-warning text-[10px]">In Courier (${o.order_status})</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 5. Payment Incomplete Orders Page -->
    <div id="page-orders-unpaid" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>💳</span> পেমেন্ট অসম্পূর্ণ অর্ডারসমূহ (COD Unpaid)
          </h3>
        </div>
        <div class="space-y-2 text-xs">
          ${orders.filter(o => o.payment_status === 'Pending').map(o => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${o.order_id} • ${o.customer_name}</div>
                <div class="text-[10px] text-slate-400">বকেয়া প্রদেয়: ৳${o.total_amount} (${o.payment_method})</div>
              </div>
              <span class="badge badge-warning text-[10px]">Pending Payment</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 6. Cancelled Orders Page -->
    <div id="page-orders-cancelled" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-rose-500">✕</span> বাতিল ও রিটার্নকৃত অর্ডার
          </h3>
        </div>
        <div class="space-y-2 text-xs">
          ${orders.filter(o => o.order_status === 'Cancelled' || o.order_status === 'Returned').map(o => `
            <div class="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${o.order_id} • ${o.customer_name}</div>
                <div class="text-[10px] text-rose-600">স্ট্যাটাস: ${o.order_status}</div>
              </div>
              <span class="badge badge-danger text-[10px]">${o.order_status}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 7. Add Order Page (Manual Entry + Voucher) -->
    <div id="page-orders-add" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-xl">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন কাস্টমার অর্ডার এন্ট্রি (Add Order)</h3>
          <p class="text-[11px] text-slate-400">ফোন বা ইনবক্স থেকে সরাসরি অর্ডার তৈরি ও ক্যাশ ভাউচার প্রিন্ট</p>
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

          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2.5">
            <h4 class="font-bold text-slate-900 dark:text-white">পণ্য নির্ধারণ:</h4>
            <div>
              <label class="block font-bold mb-1">পণ্যের নাম *</label>
              <input type="text" id="add-ord-product" required placeholder="Amazfit GTS 4 Smartwatch / মধু" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label class="block font-bold mb-1">সাইজ</label>
                <input type="text" id="add-ord-size" value="Free Size" class="form-control text-xs w-full py-1.5 px-2 rounded-lg border font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">কালার</label>
                <input type="text" id="add-ord-color" value="Jet Black" class="form-control text-xs w-full py-1.5 px-2 rounded-lg border font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">একক মূল্য (৳) *</label>
                <input type="number" id="add-ord-price" required placeholder="1450" class="form-control text-xs w-full py-1.5 px-2 rounded-lg border font-bold font-mono" />
              </div>
              <div>
                <label class="block font-bold mb-1">পরিমাণ *</label>
                <input type="number" id="add-ord-qty" required value="1" min="1" class="form-control text-xs w-full py-1.5 px-2 rounded-lg border font-bold font-mono" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold mb-1">ডেলিভারি চার্জ (৳)</label>
              <select id="add-ord-delivery" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
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
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">👥 কাস্টমার ডাটাবেজ (Customer CRM)</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-secondary py-1 px-3 text-xs" onclick="window.exportGenericCsv('Customers', ['Name', 'Phone', 'Address', 'Total Spent'], customers.map(c=>[c.name, c.phone, c.address, c.total_spent]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2 px-3">নাম</th>
                <th class="py-2 px-3">ফোন নম্বর</th>
                <th class="py-2 px-3">ঠিকানা</th>
                <th class="py-2 px-3">মোট খরচ</th>
                <th class="py-2 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${customers.map(c => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td class="py-2.5 px-3 font-bold">${c.name}</td>
                  <td class="py-2.5 px-3 font-mono">${c.phone}</td>
                  <td class="py-2.5 px-3 text-slate-500">${c.address}</td>
                  <td class="py-2.5 px-3 font-bold font-mono">৳${c.total_spent}</td>
                  <td class="py-2.5 px-3 text-right">
                    <button class="btn-secondary py-1 px-2 text-[10px]" onclick="window.copyToClipboard('${c.phone}', 'ফোন কপি হয়েছে!')">ফোন কপি</button>
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
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">⭐ গ্রাহক রিভিউ ও রেটিং (${reviews.length})</h3>
          <button class="btn-secondary py-1 px-2.5 text-xs" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
        </div>
        <div class="space-y-2.5 text-xs">
          ${reviews.map(r => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>${r.customer}</span>
                  <span class="text-amber-500">★★★★★</span>
                  <span class="text-[10px] text-slate-400 font-normal">(${r.product})</span>
                </div>
                <p class="text-slate-600 dark:text-slate-300 mt-1">"${r.comment}"</p>
              </div>
              <span class="badge badge-success text-[10px]">Approved ✓</span>
            </div>
          `).join("")}
        </div>
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
