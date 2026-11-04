/**
 * DREAM CART BD — Couriers, Gateways, System Settings & Admin Login (adminCouriersSettings.js)
 * Implements:
 * - Courier service integrations (Steadfast, Pathao, RedX API keys, secrets, webhooks)
 * - Online payment gateways (bKash, SSLCommerz, Shurjopay, Nagad)
 * - Customer fraud verification checker
 * - System settings: audit logs, payment methods, delivery areas, offers & coupons
 * - Store profile & password change
 * - Admin secure login view with mathematical captcha
 */

import { apiClient, getGlobalSiteSettings, getGlobalPaymentMethods, getGlobalDeliveryMethods, getGlobalOffers } from '../../../api/client.js';
import { formatCurrency } from '../../../utils/format.js';
import { toast } from '../../../components/Toast.js';

// MODULE: adminCouriersSettings.js
// ============================================================================
/**
 * DREAM CART BD — Courier, Payments, Settings & Login Module (adminCouriersSettings.js)
 * Implements:
 * - Steadfast, Pathao & RedX courier API + secret + webhook config
 * - Customer Fraud Checker tool with delivery success score
 * - Online payment gateway integration (bKash, SSLCommerz, Shurjopay, Nagad)
 * - System settings, logs, offers, hotlines
 * - Dedicated Admin Login View with captcha
 */

export function renderCouriersSettingsModule({ couriers, onlinePayments, offers, auditLogs, userDisplayName, workerType }) {
  const payMethods = apiClient.getGlobalPaymentMethods ? apiClient.getGlobalPaymentMethods() : [];
  const delMethods = apiClient.getGlobalDeliveryMethods ? apiClient.getGlobalDeliveryMethods() : [];
  const globalOffers = apiClient.getGlobalOffers ? apiClient.getGlobalOffers() : (offers || []);
  const siteInfo = apiClient.getGlobalSiteSettings ? apiClient.getGlobalSiteSettings() : {};
  const infoItems = Array.isArray(siteInfo.infoItems) ? siteInfo.infoItems : [];
  let consignments = [];
  try {
    consignments = JSON.parse(localStorage.getItem('dcbd_courier_consignments') || '[]');
  } catch (e) {}

  setTimeout(() => {
    const inp = document.getElementById('input-fraud-phone');
    if (inp && !inp.value) {
      inp.value = '01711223344';
      if (window.handleFraudPhoneCheck) window.handleFraudPhoneCheck('01711223344');
    }
    if (window.renderAdminSetLogsDOM) window.renderAdminSetLogsDOM();
    if (window.renderAdminPaymentMethodsDOM) window.renderAdminPaymentMethodsDOM();
    if (window.renderAdminDeliveryMethodsDOM) window.renderAdminDeliveryMethodsDOM();
    if (window.renderAdminOffersDOM) window.renderAdminOffersDOM();
    if (window.syncSystemSettingsFromSheets) window.syncSystemSettingsFromSheets(false);
  }, 30);

  return `
    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: COURIER, FRAUD & PAYMENT (4 Standalone Views)    -->
    <!-- ================================================================= -->

    <!-- 1. Couriers List Page (সংযুক্ত কুরিয়ারসমূহ - লিস্ট, এডিট, ডিলিট ও সার্চ) -->
    <div id="page-courier-list" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🚚</span> সংযুক্ত কুরিয়ারসমূহ (${couriers.length})
            </h3>
            <p class="text-[11px] text-slate-400">লিস্ট, এডিট, ডিলিট, সার্চ ও অর্ডার লিস্ট থেকে সরাসরি কুরিয়ার এন্ট্রি লগ</p>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <input type="text" placeholder="🔍 কুরিয়ার নাম বা হাব সার্চ করুন..." oninput="window.searchAdminCouriers(this.value)" class="form-control text-xs py-1.5 px-3 rounded-xl border w-56" />
            <button type="button" class="btn-primary py-1.5 px-3 font-bold" onclick="window.openEditCourierModal('')">+ নতুন কুরিয়ার এপিআই যুক্ত</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div id="admin-couriers-grid" class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          ${couriers.map(c => {
            const safeId = String(c.id || '').replace(/'/g, "\'");
            const safeName = String(c.name || '').replace(/'/g, "\'");
            return `
              <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2.5 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-mono text-[10px] font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">${c.id}</span>
                      <div class="font-bold text-slate-900 dark:text-white text-sm mt-0.5">${c.name}</div>
                    </div>
                    <button type="button" onclick="window.toggleCourierStatus('${safeId}')" class="badge ${c.status === 'Connected' ? 'badge-success' : 'badge-warning'} text-[10px] cursor-pointer">${c.status || 'Connected'}</button>
                  </div>
                  <div class="space-y-1 text-slate-500 text-[11px]">
                    <div><strong>API Key:</strong> <span class="font-mono">${c.api_key}</span></div>
                    <div><strong>Secret Key:</strong> <span class="font-mono">${c.secret_key || '••••••••'}</span></div>
                    <div><strong>Base Endpoint:</strong> <span class="font-mono text-[10px]">${c.base_url || 'https://portal.packzy.com/api/v1'}</span></div>
                    <div><strong>জোন / হাব:</strong> ${c.hub_city}</div>
                    <div><strong>কুরিয়ার ব্যালেন্স:</strong> <span class="font-bold text-emerald-600 font-mono">${c.balance}</span></div>
                  </div>
                </div>
                <div class="pt-2 border-t flex flex-wrap items-center gap-1.5">
                  <button type="button" class="btn-secondary py-1 px-2.5 text-[10px] flex-1 font-bold" onclick="window.handleTestCourierApi('${safeName}', this)">API টেস্ট 🔄</button>
                  <button type="button" class="btn-secondary py-1 px-2.5 text-[10px] text-emerald-600 font-bold" onclick="window.openEditCourierModal('${safeId}')">✏️ এডিট</button>
                  <button type="button" class="btn-secondary py-1 px-2.5 text-[10px] text-rose-600 border-rose-200 font-bold" onclick="window.deleteCourierItem('${safeId}')">🗑️ ডিলিট</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <!-- Dispatched Courier Consignments Log -->
        <div class="pt-3 border-t space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-xs text-slate-900 dark:text-white">📦 অর্ডার লিস্ট থেকে "সেন্ড কুরিয়ার" বাটনে পাঠানো পার্সেল এন্ট্রি লিস্ট</h4>
            <span class="text-[10px] text-slate-400">API Key & Secret Key দ্বারা স্বয়ংক্রিয় বুকিংকৃত</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b text-slate-400 uppercase text-[10px]">
                  <th class="py-2 px-3">Consignment ID</th>
                  <th class="py-2 px-3">অর্ডার আইডি</th>
                  <th class="py-2 px-3">কুরিয়ার নাম</th>
                  <th class="py-2 px-3">গ্রাহক ও ফোন</th>
                  <th class="py-2 px-3">COD অ্যামাউন্ট</th>
                  <th class="py-2 px-3">স্ট্যাটাস</th>
                  <th class="py-2 px-3">সময়</th>
                </tr>
              </thead>
              <tbody id="admin-courier-consignments-tbody" class="divide-y">
                ${consignments.length > 0 ? consignments.slice(0, 20).map(l => `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td class="py-2 px-3 font-mono font-bold text-emerald-600">${l.consignment_id}</td>
                    <td class="py-2 px-3 font-mono font-bold">${l.order_id}</td>
                    <td class="py-2 px-3 font-bold">${l.courier_name}</td>
                    <td class="py-2 px-3">${l.customer_name} (${l.phone})</td>
                    <td class="py-2 px-3 font-mono font-bold">৳${l.cod_amount || 0}</td>
                    <td class="py-2 px-3"><span class="badge badge-success text-[10px]">${l.status || 'In Transit'}</span></td>
                    <td class="py-2 px-3 text-slate-400 text-[10px]">${l.dispatched_at || 'আজ'}</td>
                  </tr>
                `).join('') : `<tr><td colspan="7" class="py-4 text-center text-slate-400">অর্ডার লিস্ট থেকে "🚚 সেন্ড কুরিয়ার" বাটনে ক্লিক করলে সাথে সাথে এখানে এবং কুরিয়ারে এন্ট্রি হয়ে যাবে।</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Add Courier Page (+ কুরিয়ার এপিআই যুক্ত - আপডেট ফর্ম API Key ও Secret Key সহ) -->
    <div id="page-courier-add" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-2xl">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ কুরিয়ার এপিআই যুক্ত ও আপডেট ফর্ম (One-Click Order Entry)</h3>
            <p class="text-[11px] text-slate-400">এখানে API Key ও Secret Key সেভ করলে অর্ডার লিস্ট থেকে "🚚 সেন্ড কুরিয়ার" বাটনে ক্লিক করার সাথে সাথে কুরিয়ারে অর্ডার এন্ট্রি হয়ে যাবে</p>
          </div>
          <button type="button" class="btn-secondary py-1 px-3 text-xs font-bold" onclick="window.switchAdminPage('page-courier-list', 'group-courier')">← কুরিয়ার তালিকায় ফিরুন</button>
        </div>

        <form onsubmit="window.handleAdminAddCourier(event)" class="space-y-3.5 text-xs">
          <input type="hidden" id="adm-edit-courier-id" value="" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold mb-1">কুরিয়ার সার্ভিস নাম / প্রোভাইডার *</label>
              <input type="text" id="adm-new-courier-name" list="courier-providers-list" required placeholder="Steadfast Courier / Pathao Courier / RedX" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
              <datalist id="courier-providers-list">
                <option value="Steadfast Courier"></option>
                <option value="Pathao Courier"></option>
                <option value="RedX Delivery"></option>
                <option value="Paperfly Courier"></option>
                <option value="eCourier BD"></option>
                <option value="Sundarban Courier"></option>
              </datalist>
            </div>
            <div>
              <label class="block font-bold mb-1">API Base Endpoint URL *</label>
              <input type="text" id="adm-new-courier-base-url" value="https://portal.packzy.com/api/v1" required class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div>
              <label class="block font-bold mb-1 text-emerald-800 dark:text-emerald-300">🔑 API Key / Client ID *</label>
              <input type="text" id="adm-new-courier-api" required placeholder="sf_live_api_key_..." class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
            </div>
            <div>
              <label class="block font-bold mb-1 text-emerald-800 dark:text-emerald-300">🔒 Secret Key / Access Token *</label>
              <input type="text" id="adm-new-courier-secret" required placeholder="sf_secret_key_..." class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold bg-white dark:bg-slate-900" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold mb-1">স্বয়ংক্রিয় Webhook URL</label>
              <input type="text" id="adm-new-courier-webhook" value="https://dreamcart.bd/api/courier/webhook" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono bg-slate-50 dark:bg-slate-800" />
            </div>
            <div>
              <label class="block font-bold mb-1">হাব / ডেলিভারি কভারেজ জোন</label>
              <input type="text" id="adm-new-courier-city" value="ঢাকা, কুমিল্লা ও সারা বাংলাদেশ" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
            </div>
          </div>

          <div>
            <label class="block font-bold mb-1">কানেকশন স্ট্যাটাস</label>
            <select id="adm-new-courier-status" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold">
              <option value="Connected">Connected (সক্রিয় — অর্ডার লিস্ট থেকে সরাসরি এন্ট্রি হবে)</option>
              <option value="Paused">Paused (সাময়িক বন্ধ)</option>
            </select>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button type="submit" class="btn-primary py-2.5 px-6 font-bold">💾 কুরিয়ার API ও Secret Key সংরক্ষণ করুন →</button>
            <button type="button" class="btn-secondary py-2.5 px-4 font-bold" onclick="window.handleTestCourierApi(document.getElementById('adm-new-courier-name')?.value || 'Courier API', this)">কানেকশন টেস্ট 🔄</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 3. Fraud Check Page (🛡️ কাস্টমার ফ্রড চেকার - সার্চ বার, সামারি, কুরিয়ার ব্রেকডাউন ও সেলার কমপ্লেইন লিস্ট) -->
    <div id="page-courier-fraud" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🛡️</span> কাস্টমার ফ্রড চেকার ও কুরিয়ার ডেলিভারি রেশিও রিপোর্ট
            </h3>
            <p class="text-[11px] text-slate-400">মোবাইল নাম্বার দিয়ে সার্চ করলে কানেক্টেড কুরিয়ার ও ওয়েবসাইটের মোট অর্ডার, সাকসেস, ক্যানসেল, সাকসেস রেশিও %, কুরিয়ার ভিত্তিক রিপোর্ট ও সেলার কমপ্লেইন লিস্ট দেখাবে</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button type="button" class="btn-secondary py-1 px-2.5 font-bold" onclick="window.handleFraudPhoneCheck('01711223344')">ডেমো Safe (01711223344)</button>
            <button type="button" class="btn-secondary py-1 px-2.5 font-bold text-rose-600" onclick="window.handleFraudPhoneCheck('01622334488')">ডেমো Risk (01622334488)</button>
          </div>
        </div>

        <!-- Search Bar -->
        <form onsubmit="event.preventDefault(); window.handleFraudPhoneCheck(document.getElementById('input-fraud-phone')?.value);" class="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs">
          <div class="flex-1">
            <label class="block font-bold mb-1 text-slate-700 dark:text-slate-200">📱 কাস্টমারের মোবাইল নাম্বার দিয়ে সার্চ করুন:</label>
            <input type="text" id="input-fraud-phone" value="01711223344" placeholder="01711223344 / 01622334488" class="form-control text-sm w-full py-2.5 px-4 rounded-xl border font-mono font-black bg-white dark:bg-slate-900" />
          </div>
          <div class="sm:pt-5 flex items-center gap-2">
            <button type="submit" class="btn-primary py-2.5 px-6 font-black text-xs">🔍 ফ্রড ও কুরিয়ার হিস্ট্রি সার্চ করুন</button>
          </div>
        </form>

        <!-- Dynamic Fraud Report Container -->
        <div id="fraud-checker-dynamic-results" class="space-y-4 text-xs"></div>
      </div>
    </div>

    <!-- 4. Add Online Payments Page -->
    <div id="page-courier-payments" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>💳</span> অনলাইন পেমেন্ট গেটওয়ে কনফিগারেশন (${onlinePayments.length})
            </h3>
            <p class="text-[11px] text-slate-400">bKash Merchant, SSLCommerz, Shurjopay, Nagad API কনফিগ</p>
          </div>
          <button type="button" class="btn-primary py-1 px-3 text-xs font-bold" onclick="document.getElementById('modal-add-payment-gw')?.classList.remove('hidden')">+ গেটওয়ে যুক্ত</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          ${onlinePayments.map(p => `
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
              <div class="flex items-center justify-between">
                <div class="font-bold text-slate-900 dark:text-white">${p.name}</div>
                <span class="badge badge-success text-[9px]">${p.status}</span>
              </div>
              <div class="text-[10px] text-slate-400 font-mono">
                <div>Merchant ID: ${p.merchant_id}</div>
                <div>API Key: ${p.api_key}</div>
                <div>মোড: <span class="font-bold text-emerald-600">${p.mode}</span></div>
              </div>
              <button type="button" class="btn-secondary py-1 px-2.5 w-full text-[10px] font-bold" onclick="alert('${p.name} সংযোগ সক্রিয় রয়েছে (Ping 28ms)')">কানেকশন টেস্ট</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: SETTINGS (7 Distinct Standalone Views)            -->
    <!-- ================================================================= -->

    <!-- 1. Audit & Worker Logs Page (অডিট ও কর্মী লগ — Sheet Name: Admin/Worker) -->
    <div id="page-set-logs" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">📜 অডিট ও কর্মী লগ (<span id="admin-set-logs-total-badge">${(window.getUnifiedAdminWorkerList ? window.getUnifiedAdminWorkerList() : []).length}</span>)</h3>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">Sheet Name: Admin/Worker</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">লিষ্ট, এড, এডিট, ডিলিট, কুইকভিউ, ডিজিটাল কার্ড কাউন্টার ও ফিল্টার — নতুন এড করলেই সরাসরি Google Sheet (Admin/Worker)-এ জমা হবে</p>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <button type="button" class="btn-secondary py-1.5 px-3 font-bold btn-sys-sheet-sync" onclick="window.syncSystemSettingsFromSheets(true)">🔄 শিট সিঙ্ক</button>
            <button type="button" class="btn-secondary py-1.5 px-3 font-bold text-indigo-600" onclick="window.openAuditLogEntryModal('')">+ অডিট লগ রেকর্ড</button>
            <button type="button" class="btn-primary py-1.5 px-3.5 font-bold" onclick="window.openSetLogWorkerModal('')">+ নতুন অ্যাডমিন / কর্মী যুক্ত করুন</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.exportGenericCsv('Admin_Worker', ['USER_ID', 'Profile_Photo', 'Name', 'Mobile', 'Mail', 'Address', 'Worker_Type', 'Role', 'User_Name', 'Status'], (window.getUnifiedAdminWorkerList ? window.getUnifiedAdminWorkerList() : []).map(u=>[u.user_id, u.profile_photo, u.name, u.mobile, u.mail, u.address, u.worker_type, u.role, u.user_name, u.status]))">📥 CSV</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Digital KPI Counter Cards -->
        <div id="admin-set-logs-kpi" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"></div>

        <!-- Filter, Search & View Mode Controls -->
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            <input type="text" placeholder="🔍 নাম, USER_ID, মোবাইল, ইমেইল, রোল বা অডিট ইভেন্ট সার্চ করুন..." oninput="window.__sysSettingsUiState.logs.search = this.value; window.renderAdminSetLogsDOM();" class="form-control text-xs py-1.5 px-3 rounded-xl border flex-1 min-w-[200px]" />
            <select id="set-logs-role-filter" onchange="window.setSysLogsFilter('roleFilter', this.value)" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold">
              <option value="ALL">সকল রোল / ধরন (All)</option>
              <option value="Admin">👑 Master Admin</option>
              <option value="Staff">👷 সকল কর্মী / Staff</option>
              <option value="Manager">Manager (ম্যানেজার)</option>
              <option value="Order">Order Management</option>
              <option value="Delivery">Delivery Team</option>
              <option value="Support">Customer Support</option>
              <option value="Accountant">Accountant</option>
            </select>
            <select onchange="window.setSysLogsFilter('statusFilter', this.value)" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold">
              <option value="ALL">সকল স্ট্যাটাস (All)</option>
              <option value="Active">● সক্রিয় (Active)</option>
              <option value="Inactive">○ নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="window.setSysLogsFilter('tabMode', 'workers'); window.setSysLogsFilter('viewMode', 'cards');" class="btn-secondary py-1.5 px-2.5 text-[11px] font-bold">🗂️ কার্ড ভিউ</button>
            <button type="button" onclick="window.setSysLogsFilter('tabMode', 'workers'); window.setSysLogsFilter('viewMode', 'table');" class="btn-secondary py-1.5 px-2.5 text-[11px] font-bold">📋 টেবিল লিস্ট</button>
            <button type="button" onclick="window.setSysLogsFilter('tabMode', 'audit')" class="btn-secondary py-1.5 px-2.5 text-[11px] font-bold text-indigo-600">📜 অডিট লগ হিস্ট্রি</button>
          </div>
        </div>

        <!-- Dynamic List Container -->
        <div id="admin-set-logs-list-container" class="space-y-3"></div>
      </div>
    </div>

    <!-- 2. Payment Method Update Page (পেমেন্ট মেথড আপডেট — Sheet Name: Payment_Method) -->
    <div id="page-set-payment" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">💳 পেমেন্ট মেথড আপডেট ও কন্ট্রোল (<span id="admin-payment-methods-total-badge">${payMethods.length}</span>)</h3>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">Sheet Name: Payment_Method</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">লিষ্ট, এড, এডিট, ডিলিট, কুইকভিউ, ডিজিটাল কার্ড কাউন্টার ও ফিল্টার — নতুন এড করলেই Google Sheet (Payment_Method) ও চেকআউট পেজে জমা হবে</p>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <button type="button" class="btn-secondary py-1.5 px-3 font-bold btn-sys-sheet-sync" onclick="window.syncSystemSettingsFromSheets(true)">🔄 শিট সিঙ্ক</button>
            <button type="button" class="btn-primary py-1.5 px-3.5 font-bold" onclick="window.openPaymentMethodModal('')">+ নতুন পেমেন্ট মেথড যুক্ত করুন</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.exportGenericCsv('Payment_Method', ['Payment_ID', 'Code', 'Method_Name', 'Account_Type', 'Account_Number', 'Discount_Pct', 'Instructions', 'Status'], (window.getNormalizedPaymentMethods ? window.getNormalizedPaymentMethods() : []).map(m=>[m.id, m.code, m.name, m.type, m.number, m.discount_pct, m.instructions, m.status]))">📥 CSV</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Digital KPI Counter Cards -->
        <div id="admin-payment-methods-kpi" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"></div>

        <!-- Filter, Search & View Mode Controls -->
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            <input type="text" placeholder="🔍 মেথডের নাম, কোড, অ্যাকাউন্ট নম্বর বা নির্দেশনা সার্চ করুন..." oninput="window.__sysSettingsUiState.payment.search = this.value; window.renderAdminPaymentMethodsDOM();" class="form-control text-xs py-1.5 px-3 rounded-xl border flex-1 min-w-[200px]" />
            <select id="set-pay-type-filter" onchange="window.setSysPaymentFilter('typeFilter', this.value)" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold">
              <option value="ALL">সকল টাইপ (All Types)</option>
              <option value="COD">💵 COD (ক্যাশ অন ডেলিভারি)</option>
              <option value="Mobile Banking">📱 Mobile Banking (বিকাশ/নগদ/রকেট)</option>
              <option value="Payment Link">🔗 Payment Link (গেটওয়ে লিংক)</option>
              <option value="Bank">🏦 Bank Account (ব্যাংক একাউন্ট)</option>
            </select>
            <select id="set-pay-status-filter" onchange="window.setSysPaymentFilter('statusFilter', this.value)" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold">
              <option value="ALL">সকল স্ট্যাটাস (All)</option>
              <option value="Active">● সক্রিয় (Active)</option>
              <option value="Inactive">○ নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="window.setSysPaymentFilter('viewMode', 'cards')" class="btn-secondary py-1.5 px-2.5 text-[11px] font-bold">🗂️ কার্ড ভিউ</button>
            <button type="button" onclick="window.setSysPaymentFilter('viewMode', 'table')" class="btn-secondary py-1.5 px-2.5 text-[11px] font-bold">📋 টেবিল লিস্ট</button>
          </div>
        </div>

        <div id="admin-payment-methods-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs"></div>
      </div>
    </div>

    <!-- 3. Delivery Method Page (ডেলিভারি মেথড কনফিগ — Sheet Name: Delivery_Area) -->
    <div id="page-set-delivery" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">🚚 ডেলিভারি মেথড কনফিগ (<span id="admin-delivery-methods-total-badge">${delMethods.length}</span>)</h3>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">Sheet Name: Delivery_Area</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">লিষ্ট, এড, এডিট, ডিলিট, কুইকভিউ, ডিজিটাল কার্ড কাউন্টার ও ফিল্টার — নতুন এড করলেই Google Sheet (Delivery_Area) ও চেকআউট পেজে জমা হবে</p>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <button type="button" class="btn-secondary py-1.5 px-3 font-bold btn-sys-sheet-sync" onclick="window.syncSystemSettingsFromSheets(true)">🔄 শিট সিঙ্ক</button>
            <button type="button" class="btn-primary py-1.5 px-3.5 font-bold" onclick="window.openDeliveryMethodModal('')">+ নতুন ডেলিভারি এরিয়া যুক্ত করুন</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.exportGenericCsv('Delivery_Area', ['Delivery_ID', 'Zone_Code', 'Area_Name', 'Delivery_Charge', 'Delivery_Time', 'Free_Threshold', 'Coverage_Details', 'Status'], (window.getNormalizedDeliveryMethods ? window.getNormalizedDeliveryMethods() : []).map(d=>[d.id, d.code, d.name, d.charge, d.eta, d.free_threshold, d.coverage, d.status]))">📥 CSV</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Digital KPI Counter Cards -->
        <div id="admin-delivery-methods-kpi" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"></div>

        <!-- Filter, Search & View Mode Controls -->
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            <input type="text" placeholder="🔍 ডেলিভারি এরিয়া, জোন কোড, চার্জ বা সময়সীমা সার্চ করুন..." oninput="window.__sysSettingsUiState.delivery.search = this.value; window.renderAdminDeliveryMethodsDOM();" class="form-control text-xs py-1.5 px-3 rounded-xl border flex-1 min-w-[200px]" />
            <select id="set-del-zone-filter" onchange="window.setSysDeliveryFilter('zoneFilter', this.value)" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold">
              <option value="ALL">সকল এরিয়া জোন (All Zones)</option>
              <option value="cumilla">📍 কুমিল্লা জোন (cumilla)</option>
              <option value="dhaka">🏙️ ঢাকা সিটি (dhaka)</option>
              <option value="outside">🚚 ঢাকার বাইরে (outside)</option>
              <option value="pickup">🏢 অফিস পিকআপ (pickup)</option>
            </select>
            <select id="set-del-status-filter" onchange="window.setSysDeliveryFilter('statusFilter', this.value)" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold">
              <option value="ALL">সকল স্ট্যাটাস (All)</option>
              <option value="Active">● সক্রিয় (Active)</option>
              <option value="Inactive">○ নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="window.setSysDeliveryFilter('viewMode', 'cards')" class="btn-secondary py-1.5 px-2.5 text-[11px] font-bold">🗂️ কার্ড ভিউ</button>
            <button type="button" onclick="window.setSysDeliveryFilter('viewMode', 'table')" class="btn-secondary py-1.5 px-2.5 text-[11px] font-bold">📋 টেবিল লিস্ট</button>
          </div>
        </div>

        <div id="admin-delivery-methods-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs"></div>
      </div>
    </div>

    <!-- 4. Offers & Promo Page (অফার ও কুপন ডিসকাউন্ট — Sheet Name: Offer_or_Coupon) -->
    <div id="page-set-offers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">🎁 অফার ও কুপন ডিসকাউন্ট (<span id="admin-offers-total-badge">${globalOffers.length}</span>)</h3>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">Sheet Name: Offer_or_Coupon</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">লিষ্ট, এড, এডিট, ডিলিট, কুইকভিউ, ডিজিটাল কার্ড কাউন্টার ও ফিল্টার — নতুন এড করলেই Google Sheet (Offer_or_Coupon), অফার পেজ ও চেকআউট কুপনে জমা হবে</p>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <button type="button" class="btn-secondary py-1.5 px-3 font-bold btn-sys-sheet-sync" onclick="window.syncSystemSettingsFromSheets(true)">🔄 শিট সিঙ্ক</button>
            <button type="button" class="btn-primary py-1.5 px-3.5 font-bold" onclick="window.openOfferModal('')">+ নতুন অফার / কুপন যুক্ত করুন</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.exportGenericCsv('Offer_or_Coupon', ['Offer_ID', 'Coupon_Code', 'Title', 'Discount_Text', 'Discount_Type', 'Discount_Value', 'Min_Spend', 'Expiry_Date', 'Status'], (window.getNormalizedOffersList ? window.getNormalizedOffersList() : []).map(o=>[o.id, o.code, o.title, o.discount, o.discount_type, o.discount_value, o.min_spend, o.expiry_date, o.status]))">📥 CSV</button>
            <button type="button" class="btn-secondary py-1.5 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Digital KPI Counter Cards -->
        <div id="admin-offers-kpi" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"></div>

        <!-- Filter, Search & View Mode Controls -->
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            <input type="text" placeholder="🔍 কুপন কোড, অফার টাইটেল বা ছাড়ের বিবরণ সার্চ করুন..." oninput="window.__sysSettingsUiState.offers.search = this.value; window.renderAdminOffersDOM();" class="form-control text-xs py-1.5 px-3 rounded-xl border flex-1 min-w-[200px]" />
            <select id="set-off-type-filter" onchange="window.setSysOffersFilter('typeFilter', this.value)" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold">
              <option value="ALL">সকল ডিসকাউন্ট ধরন (All)</option>
              <option value="percent">％ শতাংশ ছাড় (Percent)</option>
              <option value="flat">৳ ফ্ল্যাট টাকা ছাড় (Flat)</option>
              <option value="free_shipping">🚚 ফ্রি ডেলিভারি (Free Shipping)</option>
            </select>
            <select id="set-off-status-filter" onchange="window.setSysOffersFilter('statusFilter', this.value)" class="form-control text-xs py-1.5 px-2.5 rounded-xl border font-bold">
              <option value="ALL">সকল স্ট্যাটাস (All)</option>
              <option value="Active">● সক্রিয় (Active)</option>
              <option value="Inactive">○ নিষ্ক্রিয় (Inactive)</option>
            </select>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="window.setSysOffersFilter('viewMode', 'cards')" class="btn-secondary py-1.5 px-2.5 text-[11px] font-bold">🗂️ কার্ড ভিউ</button>
            <button type="button" onclick="window.setSysOffersFilter('viewMode', 'table')" class="btn-secondary py-1.5 px-2.5 text-[11px] font-bold">📋 টেবিল লিস্ট</button>
          </div>
        </div>

        <div id="admin-offers-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs"></div>
      </div>
    </div>

    <!-- 5. Website Information Page (ওয়েবসাইট তথ্য আপডেট - এক্টিভ/এড/এডিট/ডিলিট/লিস্ট + সম্পূর্ণ ওয়েবসাইট ও শিটে সিঙ্ক) -->
    <div id="page-set-info" class="admin-page-view hidden space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-5 dc-admin-card space-y-4">
          <div class="border-b pb-2">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏢 দোকানের মূল তথ্য, ঠিকানা ও হটলাইন আপডেট</h3>
            <p class="text-[11px] text-slate-400">সেভ করলে হেডার, ফুটার, কন্টাক্ট পেজ ও Google Sheet (Settings)-এ সাথে সাথে আপডেট হবে</p>
          </div>
          <form onsubmit="window.handleAdminSaveSettings(event)" class="space-y-3 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">দোকানের নাম *</label>
                <input type="text" id="adm-set-shopname" value="${siteInfo.shopName || 'Dream Cart BD'}" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">ট্যাগলাইন / স্লোগান</label>
                <input type="text" id="adm-set-tagline" value="${siteInfo.shopTagline || 'বাংলাদেশের বিশ্বস্ত অনলাইন শপ'}" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">লোগো URL</label>
              <input type="text" id="adm-set-logo" value="${siteInfo.shopLogo || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg'}" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">ঠিকানা</label>
              <textarea id="adm-set-address" rows="2" class="form-control text-xs w-full p-2.5 rounded-xl border">${siteInfo.address || 'চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।'}</textarea>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">হটলাইন ১ (WhatsApp)</label>
                <input type="text" id="adm-set-hotline1" value="${siteInfo.hotline1 || '01581703822'}" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">হটলাইন ২ (Call)</label>
                <input type="text" id="adm-set-hotline2" value="${siteInfo.hotline2 || '01818273838'}" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold mb-1">অফিশিয়াল ইমেইল</label>
                <input type="email" id="adm-set-email" value="${siteInfo.email || 'support@dreamcartbd.com'}" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
              </div>
              <div>
                <label class="block font-bold mb-1">ফ্রি ডেলিভারি মিনিমাম অর্ডার (৳)</label>
                <input type="number" id="adm-set-freeship" value="${siteInfo.freeShippingMin || 2000}" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">ফেসবুক পেজ লিংক</label>
              <input type="text" id="adm-set-fb" value="${siteInfo.facebookUrl || 'https://facebook.com/dreamcartbd'}" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">শীর্ষ নোটিশ বার টেক্সট</label>
              <textarea id="adm-set-notice" rows="2" class="form-control text-xs w-full p-2.5 rounded-xl border">${siteInfo.notice || '৳২,০০০ বা তার বেশি অর্ডারে ফ্রি শিপিং! ক্যাশ অন ডেলিভারিতে পণ্য পেয়ে টাকা দিন।'}</textarea>
            </div>
            <button type="submit" class="btn-primary py-2.5 px-6 font-bold w-full">💾 মূল ওয়েবসাইট তথ্য সেভ ও সিঙ্ক করুন</button>
          </form>
        </div>

        <!-- Website Info Directory List (Active/Add/Edit/Delete/List) -->
        <div class="lg:col-span-7 dc-admin-card space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">📋 ওয়েবসাইট তথ্য ও শাখা ডিরেক্টরি লিস্ট (Active / Add / Edit / Delete)</h3>
              <p class="text-[11px] text-slate-400">যেকোনো নতুন শাখা, সাপোর্ট নাম্বার, ব্যাংক একাউন্ট বা তথ্য যুক্ত/এডিট/ডিলিট করুন</p>
            </div>
            <button type="button" class="btn-primary py-1.5 px-3 text-xs font-bold" onclick="window.openWebsiteInfoItemModal('')">+ নতুন তথ্য যুক্ত করুন</button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b text-slate-400 uppercase text-[10px]">
                  <th class="py-2.5 px-3">ID</th>
                  <th class="py-2.5 px-3">তথ্যের শিরোনাম</th>
                  <th class="py-2.5 px-3">বিস্তারিত তথ্য / ভ্যালু</th>
                  <th class="py-2.5 px-3">স্ট্যাটাস</th>
                  <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody id="admin-site-info-items-tbody" class="divide-y">
                ${infoItems.map(it => {
                  const safeId = String(it.id || '').replace(/'/g, "\'");
                  const isAct = String(it.status || 'Active').toLowerCase() !== 'inactive';
                  return `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td class="py-2.5 px-3 font-mono font-bold text-emerald-600">${it.id}</td>
                      <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white">${it.label}</td>
                      <td class="py-2.5 px-3 text-slate-600 dark:text-slate-300">${it.value}</td>
                      <td class="py-2.5 px-3">
                        <button type="button" onclick="window.toggleWebsiteInfoItemStatus('${safeId}')" class="badge ${isAct ? 'badge-success' : 'badge-warning'} text-[10px] cursor-pointer">
                          ${isAct ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td class="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                        <button type="button" onclick="window.openWebsiteInfoItemModal('${safeId}')" class="btn-secondary py-0.5 px-2 text-[10px] text-emerald-600 font-bold">✏️ এডিট</button>
                        <button type="button" onclick="window.deleteWebsiteInfoItem('${safeId}')" class="btn-secondary py-0.5 px-2 text-[10px] text-rose-600 border-rose-200 font-bold">🗑️ ডিলিট</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 6. Profile Page -->
    <div id="page-set-profile" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-md">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">👤 অ্যাডমিন প্রোফাইল আপডেট</h3>
        </div>
        <form onsubmit="event.preventDefault(); if(toast&&toast.show) toast.show({type:'success', title:'প্রোফাইল আপডেট', message:'প্রোফাইল সফলভাবে আপডেট হয়েছে!'}); else alert('আপডেট হয়েছে');" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold mb-1">পুরো নাম</label>
            <input type="text" value="${userDisplayName}" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">পদবী</label>
            <input type="text" value="${workerType}" disabled class="form-control text-xs w-full py-2 px-3 rounded-xl border bg-slate-100 dark:bg-slate-800 font-bold" />
          </div>
          <button type="submit" class="btn-primary py-2.5 px-6 font-bold">প্রোফাইল সংরক্ষণ</button>
        </form>
      </div>
    </div>

    <!-- 7. Change Password Page -->
    <div id="page-set-password" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-md">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🔒 সিকিউরিটি পাসওয়ার্ড পরিবর্তন</h3>
        </div>
        <form onsubmit="event.preventDefault(); const p1=document.getElementById('adm-new-pass')?.value; const p2=document.getElementById('adm-new-pass-conf')?.value; if(p1!==p2) { alert('পাসওয়ার্ড মিলছে না!'); return; } if(toast&&toast.show) toast.show({type:'success', title:'পাসওয়ার্ড পরিবর্তন', message:'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!'}); else alert('পাসওয়ার্ড পরিবর্তিত হয়েছে');" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold mb-1">বর্তমান পাসওয়ার্ড</label>
            <input type="password" required placeholder="••••••••" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
          </div>
          <div>
            <label class="block font-bold mb-1">নতুন পাসওয়ার্ড</label>
            <input type="password" id="adm-new-pass" required placeholder="••••••••" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
          </div>
          <div>
            <label class="block font-bold mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
            <input type="password" id="adm-new-pass-conf" required placeholder="••••••••" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
          </div>
          <button type="submit" class="btn-primary py-2.5 px-6 font-bold">পাসওয়ার্ড পরিবর্তন করুন</button>
        </form>
      </div>
    </div>

    <!-- Modals for Couriers, Fraud Complaint, Payment Methods, Delivery Methods, Offers & Site Info -->
    <div id="modal-add-fraud-complaint" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">🚨 কুরিয়ারে সেলার কমপ্লেইন / ফ্রড রিপোর্ট যুক্ত করুন</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-fraud-complaint')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddFraudComplaint(event)" class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">কাস্টমারের মোবাইল নাম্বার *</label>
              <input type="text" id="adm-cmp-phone" required placeholder="017xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">কাস্টমারের নাম</label>
              <input type="text" id="adm-cmp-name" placeholder="কাস্টমারের নাম" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">কানেক্টেড কুরিয়ার *</label>
              <select id="adm-cmp-courier" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                <option value="Steadfast Courier">Steadfast Courier</option>
                <option value="Pathao Courier">Pathao Courier</option>
                <option value="RedX Delivery">RedX Delivery</option>
                <option value="Paperfly Courier">Paperfly Courier</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">রিস্ক লেভেল</label>
              <select id="adm-cmp-severity" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                <option value="High Risk">High Risk (পার্সেল রিফিউজ/ফ্রড)</option>
                <option value="Moderate">Moderate (সতর্কতা)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">রিপোর্টকারী সেলার / শপের নাম</label>
            <input type="text" id="adm-cmp-seller" value="Dream Cart BD Official" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">বিস্তারিত অভিযোগ / রিপোর্ট *</label>
            <textarea id="adm-cmp-details" rows="3" required placeholder="কাস্টমার পার্সেল রিসিভ না করে ফোন বন্ধ করে রেখেছেন..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-fraud-complaint')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">কমপ্লেইন লিস্ট ও শিটে সেভ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Universal Settings QuickView Modal -->
    <div id="modal-settings-quickview" class="admin-modal-backdrop hidden">
      <div id="modal-settings-quickview-body" class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-xl w-full text-xs"></div>
    </div>

    <!-- Modal: Admin/Worker Add & Edit (Sheet Name: Admin/Worker) -->
    <div id="modal-set-admin-worker" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h4 class="font-black text-sm text-slate-900 dark:text-white">👥 অ্যাডমিন ও কর্মী এড / এডিট ফর্ম (Sheet: Admin/Worker)</h4>
            <p class="text-[10px] text-slate-400">সেভ করলে সরাসরি Admin/Worker শিটে এবং লিস্টে আপডেট হবে</p>
          </div>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-set-admin-worker')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleSaveSetLogWorker(event)" class="space-y-3">
          <input type="hidden" id="set-aw-edit-flag" value="" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">1. USER_ID *</label>
              <input type="text" id="set-aw-id" required placeholder="ADM-101 / WRK-105" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold text-emerald-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">2. Profile_Photo (ছবি লিঙ্ক বা আপলোড)</label>
              <div class="flex gap-1.5">
                <input type="text" id="set-aw-photo" placeholder="https://..." class="form-control text-xs flex-1 py-1.5 px-2.5 rounded-xl border" />
                <label class="btn-secondary py-1.5 px-2.5 text-[10px] font-bold cursor-pointer">📤<input type="file" accept="image/*" class="hidden" onchange="window.handlePartnerImageUpload && window.handlePartnerImageUpload(this, 'set-aw-photo')" /></label>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">3. Name (পূর্ণ নাম) *</label>
              <input type="text" id="set-aw-name" required placeholder="মোঃ সাইফুল ইসলাম" oninput="const u=document.getElementById('set-aw-uname'); if(u && !u.value) u.value=this.value;" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">4. Mobile (মোবাইল নম্বর) *</label>
              <input type="text" id="set-aw-mobile" required placeholder="018xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">5. Mail (ইমেইল)</label>
              <input type="email" id="set-aw-mail" placeholder="admin@dreamcart.bd" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">6. Address (ঠিকানা) *</label>
              <input type="text" id="set-aw-address" required placeholder="কুমিল্লা / ঢাকা" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">7. Worker_Type (কর্মীর ধরন) *</label>
              <select id="set-aw-wtype" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                <option value="Admin">Admin (মাস্টার অ্যাডমিন)</option>
                <option value="Manager">Manager (ম্যানেজার)</option>
                <option value="Full-Time Staff">Full-Time Staff</option>
                <option value="Order Desk">Order Desk</option>
                <option value="Delivery Team">Delivery Team</option>
                <option value="Customer Care">Customer Care</option>
                <option value="Accountant">Accountant</option>
                <option value="Warehouse">Warehouse</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">8. Role (রোল / পদবী) *</label>
              <select id="set-aw-role" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                <option value="CEO & Master Admin">CEO & Master Admin</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Lead Operations">Lead Operations</option>
                <option value="Manager">Manager</option>
                <option value="Order Management">Order Management</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Delivery">Delivery</option>
                <option value="Accountant">Accountant</option>
                <option value="Inventory/Warehouse">Inventory/Warehouse</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">9. User_Name (লগইন ইউজারনেম) *</label>
              <input type="text" id="set-aw-uname" required placeholder="user_admin" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">10. Password (পাসওয়ার্ড) *</label>
              <input type="text" id="set-aw-pass" required value="admin123" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">11. স্ট্যাটাস</label>
              <select id="set-aw-status" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                <option value="Active">Active (সক্রিয়)</option>
                <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">12. অডিট / দায়িত্ব নোট</label>
              <input type="text" id="set-aw-activity" placeholder="অর্ডার ও কুরিয়ার ম্যানেজমেন্ট" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-set-admin-worker')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-2 px-5 font-bold">💾 Admin/Worker শিটে সেভ করুন →</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Audit Activity Log Entry Add/Edit -->
    <div id="modal-manage-audit-log" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">📜 অডিট ও কর্মী অ্যাক্টিভিটি লগ এন্ট্রি</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-manage-audit-log')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleSaveAuditLogEntry(event)" class="space-y-3">
          <input type="hidden" id="adm-audit-edit-id" value="" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">অ্যাডমিন / কর্মীর নাম *</label>
              <input type="text" id="adm-audit-user" required placeholder="Jainal Abedin" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">রোল / পদবী</label>
              <input type="text" id="adm-audit-role" placeholder="Master Admin" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">মডিউল</label>
              <input type="text" id="adm-audit-module" value="System Settings" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">IP অ্যাড্রেস</label>
              <input type="text" id="adm-audit-ip" value="103.114.98.12" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">অ্যাক্টিভিটি / ইভেন্ট শিরোনাম *</label>
            <input type="text" id="adm-audit-event" required placeholder="পেমেন্ট ও ডেলিভারি সেটিংস আপডেট করেছেন" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">বিস্তারিত বিবরণ</label>
            <textarea id="adm-audit-details" rows="2" placeholder="বিস্তারিত অডিট নোট লিখুন..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-manage-audit-log')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">💾 অডিট লগ সেভ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Payment Method Add & Edit (Sheet Name: Payment_Method) -->
    <div id="modal-manage-payment-method" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h4 class="font-black text-sm text-slate-900 dark:text-white">💳 পেমেন্ট মেথড এড / আপডেট ফর্ম (Sheet: Payment_Method)</h4>
            <p class="text-[10px] text-slate-400">সেভ করলে চেকআউট পেজ ও Google Sheet (Payment_Method)-এ জমা হবে</p>
          </div>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-manage-payment-method')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleSavePaymentMethod(event)" class="space-y-3">
          <input type="hidden" id="adm-pay-edit-id" value="" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">Payment_ID *</label>
              <input type="text" id="adm-pay-id-input" required placeholder="PM-01" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold text-emerald-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">মেথড কোড (Code) *</label>
              <select id="adm-pay-code" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-mono font-bold">
                <option value="COD">COD (Cash on Delivery)</option>
                <option value="BKASH_PERSONAL">BKASH_PERSONAL (বিকাশ সেন্ড মানি)</option>
                <option value="BKASH_PAYMENT">BKASH_PAYMENT (বিকাশ পেমেন্ট লিংক)</option>
                <option value="NAGAD_PERSONAL">NAGAD_PERSONAL (নগদ সেন্ড মানি)</option>
                <option value="ROCKET_PERSONAL">ROCKET_PERSONAL (রকেট সেন্ড মানি)</option>
                <option value="BANK">BANK (ব্যাংক ট্রান্সফার)</option>
                <option value="UPAY_PERSONAL">UPAY_PERSONAL (উপায়)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">পেমেন্ট মেথডের নাম (Method_Name) *</label>
            <input type="text" id="adm-pay-name" required placeholder="বিকাশ পার্সোনাল (Send Money) / ক্যাশ অন ডেলিভারি" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">অ্যাকাউন্ট / মার্চেন্ট নম্বর *</label>
              <input type="text" id="adm-pay-number" required placeholder="01879653143, 01818273838 / COD" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">অ্যাকাউন্ট টাইপ (Account_Type)</label>
              <select id="adm-pay-type" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                <option value="Mobile Banking">Mobile Banking (পার্সোনাল/এজেন্ট)</option>
                <option value="Payment Link">Payment Link (মার্চেন্ট গেটওয়ে)</option>
                <option value="COD">COD (ক্যাশ অন ডেলিভারি)</option>
                <option value="Bank Account">Bank Account (ব্যাংক একাউন্ট)</option>
                <option value="Merchant">Merchant Account</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">পেমেন্ট গেটওয়ে লিংক (ঐচ্ছিক)</label>
              <input type="text" id="adm-pay-link" placeholder="https://shop.bkash.com/..." class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">অনলাইন পেমেন্ট ছাড় (%)</label>
              <input type="number" id="adm-pay-discount" value="5" min="0" max="50" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold text-emerald-600" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">পেমেন্ট নির্দেশনা (চেকআউটে দেখাবে)</label>
            <textarea id="adm-pay-inst" rows="2" placeholder="সেন্ড মানি বা পেমেন্ট করে TrxID নিচের বক্সে লিখুন..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
          </div>
          <div>
            <label class="block font-bold mb-1">স্ট্যাটাস (Status)</label>
            <select id="adm-pay-status" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold">
              <option value="Active">Active (সক্রিয়)</option>
              <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
            </select>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-manage-payment-method')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-2 px-5 font-bold">💾 Payment_Method শিটে সেভ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Delivery Area Add & Edit (Sheet Name: Delivery_Area) -->
    <div id="modal-manage-delivery-method" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h4 class="font-black text-sm text-slate-900 dark:text-white">🚚 ডেলিভারি মেথড ও এরিয়া কনফিগ (Sheet: Delivery_Area)</h4>
            <p class="text-[10px] text-slate-400">সেভ করলে চেকআউট ডেলিভারি চার্জ ও Google Sheet (Delivery_Area)-এ জমা হবে</p>
          </div>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-manage-delivery-method')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleSaveDeliveryMethod(event)" class="space-y-3">
          <input type="hidden" id="adm-del-edit-id" value="" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">Delivery_ID *</label>
              <input type="text" id="adm-del-id-input" required placeholder="DLV-01" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold text-emerald-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">জোন কোড (Zone_Code) *</label>
              <select id="adm-del-code" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-mono font-bold">
                <option value="cumilla">cumilla (কুমিল্লা সদর / ইন-সিটি)</option>
                <option value="dhaka">dhaka (ঢাকা সিটি)</option>
                <option value="outside">outside (ঢাকার বাইরে সারা দেশ)</option>
                <option value="pickup">pickup (অফিস পিকআপ - ফ্রি)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">ডেলিভারি এরিয়া / জোনের নাম (Area_Name) *</label>
            <input type="text" id="adm-del-name" required placeholder="কুমিল্লা সদর (In Cumilla) / ঢাকা সিটি / সারা বাংলাদেশ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">ডেলিভারি চার্জ (৳) *</label>
              <input type="number" id="adm-del-charge" required value="70" min="0" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-black text-emerald-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">ফ্রি ডেলিভারি মিনিমাম অর্ডার (৳)</label>
              <input type="number" id="adm-del-free-min" value="2000" min="0" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">ডেলিভারি সময়সীমা (ETA) *</label>
              <input type="text" id="adm-del-eta" required placeholder="১-২ দিন (২৪ ঘন্টায় ডেলিভারি)" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">ডিফল্ট কুরিয়ার পার্টনার</label>
              <input type="text" id="adm-del-courier" value="Steadfast / Pathao / RedX" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">কভারেজ এলাকা / বিস্তারিত নোট</label>
            <input type="text" id="adm-del-coverage" placeholder="কুমিল্লা সদর, পদুয়ার বাজার বিশ্বরোড, কান্দিরপাড়..." class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">স্ট্যাটাস (Status)</label>
            <select id="adm-del-status" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold">
              <option value="Active">Active (সক্রিয়)</option>
              <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
            </select>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-manage-delivery-method')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-2 px-5 font-bold">💾 Delivery_Area শিটে সেভ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-add-payment-gw" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন অনলাইন পেমেন্ট গেটওয়ে যুক্ত</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-payment-gw')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddOnlinePayment(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">গেটওয়ের নাম *</label>
            <input type="text" id="adm-new-gw-name" required placeholder="bKash / SSLCommerz / Shurjopay" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">মার্চেন্ট আইডি / স্টোর কোড *</label>
            <input type="text" id="adm-new-gw-merchant" required placeholder="MERCHANT-01" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">API Key / Secret Token *</label>
            <input type="password" id="adm-new-gw-key" required placeholder="••••••••••••" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-payment-gw')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Offer & Coupon Add/Edit (Sheet Name: Offer_or_Coupon) -->
    <div id="modal-add-offer" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h4 class="font-black text-sm text-slate-900 dark:text-white">🎁 অফার ও ডিসকাউন্ট কুপন তৈরি / এডিট (Sheet: Offer_or_Coupon)</h4>
            <p class="text-[10px] text-slate-400">সেভ করলে অফার পেজ, চেকআউট কুপন ও Google Sheet (Offer_or_Coupon)-এ জমা হবে</p>
          </div>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-offer')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddOffer(event)" class="space-y-3">
          <input type="hidden" id="adm-offer-edit-id" value="" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">Offer_ID *</label>
              <input type="text" id="adm-offer-id-input" required placeholder="OFF-01" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold text-emerald-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">কুপন কোড (Coupon_Code) *</label>
              <input type="text" id="adm-new-offer-code" required placeholder="DREAM10 / FESTIVE500" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-black uppercase text-emerald-600" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">অফারের শিরোনাম (Title) *</label>
            <input type="text" id="adm-new-offer-title" required placeholder="স্পেশাল ১০% ডিসকাউন্ট কুপন" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">ছাড়ের বিবরণ ব্যাজ (Discount_Text) *</label>
            <input type="text" id="adm-new-offer-disc" required placeholder="১০% ছাড় / ৳৫০০ ফ্ল্যাট ছাড় / ফ্রি ডেলিভারি" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">ডিসকাউন্ট ধরন (Discount_Type)</label>
              <select id="adm-new-offer-type" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                <option value="percent">শতাংশ ছাড় (percent - %)</option>
                <option value="flat">ফ্ল্যাট টাকা ছাড় (flat - ৳)</option>
                <option value="free_shipping">ফ্রি ডেলিভারি (free_shipping)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">ডিসকাউন্ট মান (% বা ৳)</label>
              <input type="number" id="adm-new-offer-val" value="10" min="0" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold text-emerald-600" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">সর্বনিম্ন অর্ডারের মূল্য (Min_Spend ৳)</label>
              <input type="number" id="adm-new-offer-min" value="1500" min="0" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">মেয়াদ শেষের তারিখ (Expiry_Date)</label>
              <input type="date" id="adm-new-offer-expiry" value="2026-12-31" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">ব্যবহারের সীমা / নোট</label>
              <input type="text" id="adm-new-offer-limit" value="সকল গ্রাহকের জন্য প্রযোজ্য" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">স্ট্যাটাস (Status)</label>
              <select id="adm-new-offer-status" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                <option value="Active">Active (সক্রিয়)</option>
                <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
              </select>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-offer')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-2 px-5 font-bold">💾 Offer_or_Coupon শিটে সেভ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-site-info-item" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">🏢 ওয়েবসাইট তথ্য / শাখা এড ও এডিট</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-site-info-item')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleSaveWebsiteInfoItem(event)" class="space-y-3">
          <input type="hidden" id="adm-info-item-id" value="" />
          <div>
            <label class="block font-bold mb-1">তথ্যের শিরোনাম *</label>
            <input type="text" id="adm-info-item-label" required placeholder="ঢাকা শাখা / কাস্টমার কেয়ার / বিকাশ মার্চেন্ট" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">বিস্তারিত তথ্য / ভ্যালু *</label>
            <textarea id="adm-info-item-value" rows="2" required placeholder="বিস্তারিত ঠিকানা বা নাম্বার লিখুন..." class="form-control text-xs w-full p-2.5 rounded-xl border"></textarea>
          </div>
          <div>
            <label class="block font-bold mb-1">স্ট্যাটাস</label>
            <select id="adm-info-item-status" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold">
              <option value="Active">Active (সক্রিয়)</option>
              <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
            </select>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-site-info-item')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">💾 লিস্ট, ওয়েবসাইট ও শিটে সেভ করুন</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderAdminLoginView() {
  const captchaNum1 = Math.floor(Math.random() * 8) + 1;
  const captchaNum2 = Math.floor(Math.random() * 8) + 1;
  const captchaSum = captchaNum1 + captchaNum2;

  return `
    <div class="dc-admin-wrapper">
    <div class="max-w-md mx-auto py-12 px-4 space-y-6">

      <div class="text-center space-y-2">
        <div class="w-16 h-16 rounded-3xl bg-slate-900 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-xl border border-slate-700">
          ⚙️
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white">
          অ্যাডমিন লগইন
        </h2>
        <p class="text-xs text-slate-500">
          আপনার পদবী, ইউজার নেম ও পাসওয়ার্ড দিয়ে মাস্টার প্যানেলে প্রবেশ করুন
        </p>
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-4 text-xs">

        <form id="admin-login-form" class="space-y-3.5">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Worker Type (কর্মীর পদবী) *</label>
            <select id="adm-worker-type" class="form-control text-xs w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold" required>
              <option value="Admin">Admin (মাস্টার অ্যাডমিন)</option>
              <option value="Manager">Manager (ম্যানেজার)</option>
              <option value="Staff">Staff (স্টাফ)</option>
              <option value="Sales">Sales (বিক্রয় প্রতিনিধি)</option>
              <option value="Customer Support">Customer Support (গ্রাহক সেবা)</option>
              <option value="Order Management">Order Management (অর্ডার ডেস্ক)</option>
              <option value="Inventory/Warehouse">Inventory/Warehouse (গুদাম)</option>
              <option value="Delivery">Delivery (ডেলিভারি)</option>
              <option value="Accountant">Accountant (হিসাবরক্ষক)</option>
              <option value="Marketing">Marketing (মার্কেটিং)</option>
              <option value="IT/Technical">IT/Technical (প্রযুক্তি)</option>
              <option value="Content Manager">Content Manager</option>
              <option value="Other">Other (অন্যান্য)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">User Name (ব্যবহারকারীর নাম) *</label>
            <select id="adm-username" class="form-control text-xs w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold" required>
              <option value="Jainal Abedin">Jainal Abedin (CEO & Lead)</option>
              <option value="MD. Saiful Islam">MD. Saiful Islam (Admin)</option>
              <option value="Admin Staff">Admin Staff (Operations)</option>
              <option value="Accounts Officer">Accounts Officer</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
            <input type="password" id="adm-password" required placeholder="••••••••" value="admin123" class="form-control text-xs w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-mono" />
          </div>

          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-700 dark:text-slate-300">নিরাপত্তা ক্যাপচা যাচাই:</span>
              <button type="button" class="text-[11px] text-emerald-600 font-bold hover:underline" onclick="window.regenerateAdminCaptcha && window.regenerateAdminCaptcha()">
                ক্যাপচা পরিবর্তন 🔄
              </button>
            </div>
            <div class="flex items-center gap-3">
              <div id="adm-captcha-display" class="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-sm font-black text-emerald-600">
                ${captchaNum1} + ${captchaNum2} = ?
              </div>
              <input type="hidden" id="adm-captcha-expected" value="${captchaSum}" />
              <input
                type="number"
                id="adm-captcha-input"
                required
                placeholder="যোগফল লিখুন"
                class="form-control text-xs flex-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 font-bold"
              />
            </div>
          </div>

          <button type="submit" class="btn-primary w-full py-3 text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-md">
            লগইন করুন →
          </button>
        </form>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
          ডেমো পাসওয়ার্ড: <span class="font-mono font-bold text-slate-700 dark:text-slate-300">admin123</span>
        </div>

      </div>

    </div>
    </div>
  `;
}

// ============================================================================
