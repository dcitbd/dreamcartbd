/**
 * DREAM CART BD — Partner & Staff Management Module (adminPartners.js)
 * Implements:
 * - Reseller partner accounts, wallet balances, sales tracking & payouts
 * - Wholesaler buyer directory with tier discounts
 * - Merchant sellers / vendors directory & commission rates
 * - Marketplace integration channels (Daraz, Facebook Shop, Bikroy)
 * - Master Admin & Worker staff directory with RBAC permissions
 */

import { formatCurrency } from '../../../utils/format.js';
import { toast } from '../../../components/Toast.js';

// MODULE: adminPartners.js
// ============================================================================
/**
 * DREAM CART BD — Partner & Admin Management Module (adminPartners.js)
 * Implements:
 * - Reseller management with live commission % control, balances & tracking
 * - Wholesaler tier management
 * - Merchant seller management & marketplace sync (Daraz, Facebook, Bikroy)
 * - Master Admin & Staff Worker directory
 */

export function renderPartnersModule({ resellers, wholesalers, sellers, markets, admins, workers }) {
  const rolesList = ['Super Admin', 'CEO & Master Admin', 'Lead Operations', 'Manager', 'Order Management', 'Customer Support', 'Delivery', 'Accountant', 'Inventory/Warehouse', 'Sales'];

  return `
    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: PARTNERS & ADMINS (6 Distinct Standalone Views)  -->
    <!-- ================================================================= -->

    <!-- 1. Resellers Page (রিসেলারসমূহ - লিষ্ট, কমিশন কন্ট্রোল ও ১২-ফিল্ড এড ফর্ম) -->
    <div id="page-partner-resellers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🤝</span> রিসেলার পার্টনার তালিকা (${resellers.length})
            </h3>
            <p class="text-[11px] text-slate-400">কমিশন ও অন্যান্য কন্ট্রোল, রিসেলার লিস্ট এবং ১২-ফিল্ড নিবন্ধন ফর্ম (Resellers শিটে সিঙ্ককৃত)</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button type="button" class="btn-primary py-1.5 px-3 font-bold" onclick="window.openResellerModal('')">+ নতুন রিসেলার যুক্ত করুন</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Resellers', ['Shop_ID', 'Name', 'Shop_Name', 'Mobile', 'Mail', 'Address', 'NID_Number', 'Date_of_birth', 'Trade_Licence_No', 'User_ID'], resellers.map(r=>[r.shop_id||r.id, r.name, r.shop_name||r.shop, r.mobile||r.phone, r.mail||'', r.address||r.city, r.nid_number||'', r.date_of_birth||'', r.trade_licence_no||'', r.user_id||r.phone]))">CSV</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Reseller Commission & Rules Control Panel -->
        <div class="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 dark:border-emerald-800 pb-2">
            <div>
              <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚙️</span> রিসেল প্রাইজ, কমিশন ও নিয়ম কন্ট্রোল প্যানেল
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">এডমিন প্যানেল থেকে রিসেলারদের কমিশন %, সর্বনিম্ন অর্ডার ও উত্তোলন ফি নিয়ন্ত্রণ করুন</p>
            </div>
            <span class="badge badge-success text-xs font-bold">লাইভ সক্রিয় কন্ট্রোল</span>
          </div>

          <form onsubmit="window.handleSaveResellerSettings(event)" class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
            <div>
              <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">গ্লোবাল রিসেলিং কমিশন (%) *</label>
              <div class="flex items-center gap-2">
                <input type="number" id="adm-reseller-global-pct" value="15" min="1" max="60" required class="form-control text-xs w-24 py-1.5 px-2.5 rounded-xl border font-black font-mono text-emerald-600" />
                <span class="text-xs font-bold text-slate-500">% কমিশন</span>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">সর্বনিম্ন রিসেল অর্ডার (পিস)</label>
              <input type="number" id="adm-reseller-min-order" value="1" min="1" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">উত্তোলন ফি (স্বয়ংক্রিয় কর্তন %)</label>
              <input type="number" id="adm-reseller-fee-pct" value="3" min="0" max="10" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold font-mono" />
            </div>
            <div>
              <button type="submit" class="btn-primary py-2 px-5 font-bold w-full">কমিশন ও সেটিংস সেভ করুন</button>
            </div>
          </form>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2.5 px-3">Shop_ID</th>
                <th class="py-2.5 px-3">লোগো, নাম ও শপ</th>
                <th class="py-2.5 px-3">মোবাইল ও মেইল</th>
                <th class="py-2.5 px-3">ঠিকানা, NID ও ট্রেড লাইসেন্স</th>
                <th class="py-2.5 px-3">ব্যালেন্স</th>
                <th class="py-2.5 px-3">কমিশন</th>
                <th class="py-2.5 px-3">স্ট্যাটাস</th>
                <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="admin-resellers-tbody" class="divide-y">
              ${resellers.map(r => {
                const id = r.shop_id || r.id || 'RSL-101';
                const safeId = String(id).replace(/'/g, "\\'");
                const logo = r.shop_logo || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
                const phone = r.mobile || r.phone || '';
                return `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td class="py-2.5 px-3 font-mono font-bold text-emerald-600">${id}</td>
                    <td class="py-2.5 px-3">
                      <div class="flex items-center gap-2">
                        <img loading="lazy" decoding="async" src="${logo}" class="w-8 h-8 rounded-lg object-cover border flex-shrink-0" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                        <div>
                          <div class="font-bold text-slate-900 dark:text-white">${r.name}</div>
                          <div class="text-[10px] text-slate-400">শপ: ${r.shop_name || r.shop} • User: ${r.user_id || phone}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-2.5 px-3 font-mono">
                      <div>${phone}</div>
                      <div class="text-[10px] text-slate-400">${r.mail || '—'}</div>
                    </td>
                    <td class="py-2.5 px-3 text-[11px]">
                      <div>${r.address || r.city || 'ঢাকা'}</div>
                      <div class="text-[10px] text-slate-400">NID: ${r.nid_number || '—'} • TL: ${r.trade_licence_no || '—'}</div>
                    </td>
                    <td class="py-2.5 px-3 font-black text-emerald-600 font-mono">৳${r.balance || 0}</td>
                    <td class="py-2.5 px-3 font-bold font-mono">${r.commission || '15%'}</td>
                    <td class="py-2.5 px-3"><span class="badge badge-success text-[10px]">${r.status || 'Active'}</span></td>
                    <td class="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                      <button type="button" class="btn-secondary py-0.5 px-2 text-[10px] text-emerald-600 font-bold" onclick="window.openResellerModal('${safeId}')">✏️ এডিট</button>
                      <button type="button" class="btn-secondary py-0.5 px-2 text-[10px]" onclick="window.copyToClipboard('${phone}', 'ফোন কপি হয়েছে!')">কপি</button>
                      <button type="button" class="btn-secondary py-0.5 px-2 text-[10px] text-rose-600 border-rose-200" onclick="window.deletePartnerItem('reseller', '${safeId}')">মুছুন</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 2. Wholesalers Page (হোলসেলার / পাইকারি - MOQ, ডিসকাউন্ট % কন্ট্রোল ও ৯-ফিল্ড এড ফর্ম) -->
    <div id="page-partner-wholesalers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏢</span> হোলসেলার / পাইকারি ক্রেতা তালিকা (${wholesalers.length})
            </h3>
            <p class="text-[11px] text-slate-400">মিনিমাম অর্ডার কোয়ান্টিটি (MOQ), ডিসকাউন্ট % কন্ট্রোল এবং ৯-ফিল্ড হোলসেলার নিবন্ধন (Wholesalers শিটে সিঙ্ককৃত)</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button type="button" class="btn-primary py-1.5 px-3 font-bold" onclick="window.openWholesalerModal('')">+ নতুন হোলসেলার যুক্ত করুন</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Wholesalers', ['Shop_ID', 'Name', 'Shop_Name', 'Mobile', 'Mail', 'Address', 'User_ID'], wholesalers.map(w=>[w.shop_id||w.id, w.name, w.shop_name||w.company, w.mobile||w.phone, w.mail||'', w.address||'', w.user_id||w.phone]))">CSV</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Wholesale MOQ & Discount % Control Panel -->
        <div class="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-800 pb-2">
            <div>
              <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚙️</span> হোলসেল মিনিমাম অর্ডার কোয়ান্টিটি (MOQ) ও ডিসকাউন্ট % কন্ট্রোল
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">পাইকারি ক্রেতাদের সর্বনিম্ন অর্ডার সংখ্যা, গ্লোবাল পাইকারি ডিসকাউন্ট % ও ক্রেডিট লিমিট নিয়ন্ত্রণ করুন</p>
            </div>
            <span class="badge badge-warning text-xs font-bold">Wholesale Control Active</span>
          </div>

          <form onsubmit="window.handleSaveWholesalerSettings(event)" class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
            <div>
              <label class="block font-bold mb-1">ডিফল্ট মিনিমাম অর্ডার কোয়ান্টিটি (MOQ) *</label>
              <input type="number" id="adm-whs-global-moq" value="5" min="1" required class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-black font-mono text-amber-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">পাইকারি গ্লোবাল ডিসকাউন্ট (%) *</label>
              <input type="number" id="adm-whs-global-disc" value="15" min="1" max="70" required class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-black font-mono text-emerald-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">অনুমোদিত ক্রেডিট লিমিট (৳)</label>
              <input type="number" id="adm-whs-global-credit" value="50000" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold font-mono" />
            </div>
            <div>
              <button type="submit" class="btn-primary py-2 px-5 font-bold w-full">হোলসেল সেটিংস সেভ করুন</button>
            </div>
          </form>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2.5 px-3">Shop_ID</th>
                <th class="py-2.5 px-3">লোগো, শপ ও মালিক</th>
                <th class="py-2.5 px-3">মোবাইল ও মেইল</th>
                <th class="py-2.5 px-3">ঠিকানা</th>
                <th class="py-2.5 px-3">MOQ ও ডিসকাউন্ট %</th>
                <th class="py-2.5 px-3">স্ট্যাটাস</th>
                <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="admin-wholesalers-tbody" class="divide-y">
              ${wholesalers.map(w => {
                const id = w.shop_id || w.id || 'WHS-101';
                const safeId = String(id).replace(/'/g, "\\'");
                const logo = w.shop_logo || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
                const phone = w.mobile || w.phone || '';
                return `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td class="py-2.5 px-3 font-mono font-bold text-amber-600">${id}</td>
                    <td class="py-2.5 px-3">
                      <div class="flex items-center gap-2">
                        <img loading="lazy" decoding="async" src="${logo}" class="w-8 h-8 rounded-lg object-cover border flex-shrink-0" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                        <div>
                          <div class="font-bold text-slate-900 dark:text-white">${w.shop_name || w.company}</div>
                          <div class="text-[10px] text-slate-400">মালিক: ${w.name} • User: ${w.user_id || phone}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-2.5 px-3 font-mono">
                      <div>${phone}</div>
                      <div class="text-[10px] text-slate-400">${w.mail || '—'}</div>
                    </td>
                    <td class="py-2.5 px-3 text-slate-500">${w.address || 'ঢাকা'}</td>
                    <td class="py-2.5 px-3 font-mono font-bold text-emerald-600">${w.moq || 5} পিস / ${w.discount_pct || w.tier || '15%'}</td>
                    <td class="py-2.5 px-3"><span class="badge badge-success text-[10px]">${w.status || 'Approved'}</span></td>
                    <td class="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                      <button type="button" class="btn-secondary py-0.5 px-2 text-[10px] text-emerald-600 font-bold" onclick="window.openWholesalerModal('${safeId}')">✏️ এডিট</button>
                      <button type="button" class="btn-secondary py-0.5 px-2 text-[10px]" onclick="window.copyToClipboard('${phone}', 'ফোন কপি হয়েছে!')">কপি</button>
                      <button type="button" class="btn-secondary py-0.5 px-2 text-[10px] text-rose-600 border-rose-200" onclick="window.deletePartnerItem('wholesaler', '${safeId}')">মুছুন</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 3. Sellers Page (মার্চেন্ট সেলার - নিয়মাবলী কন্ট্রোল ও লিস্ট) -->
    <div id="page-partner-sellers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏪</span> মার্চেন্ট সেলার / ভেন্ডর তালিকা (${sellers.length})
            </h3>
            <p class="text-[11px] text-slate-400">সকল সেলারের নিয়মাবলী, কমিশন কন্ট্রোল ও ভেন্ডর স্টোর ম্যানেজমেন্ট</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button type="button" class="btn-primary py-1.5 px-3 font-bold" onclick="window.openSellerModal('')">+ নতুন মার্চেন্ট সেলার যুক্ত করুন</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Sellers', ['ID', 'Store', 'Name', 'Phone', 'Commission', 'Products'], sellers.map(s=>[s.id, s.store, s.name, s.phone, s.commission, s.products_count]))">CSV</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Merchant Seller Rules & Commission Control -->
        <div class="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3">
          <div class="font-bold text-sm text-slate-900 dark:text-white">⚙️ মার্চেন্ট সেলার নিয়মাবলী ও কমিশন কন্ট্রোল</div>
          <form onsubmit="window.handleSaveSellerRules(event)" class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
            <div>
              <label class="block font-bold mb-1">ডিফল্ট ভেন্ডর কমিশন (%)</label>
              <input type="text" id="adm-seller-rule-comm" value="10%" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">পেমেন্ট সেটেলমেন্ট সময়</label>
              <input type="text" id="adm-seller-rule-hold" value="৭ কর্মদিবস (ডেলিভারির পর)" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">সেলার নীতিমালা ও শর্ত</label>
              <input type="text" id="adm-seller-rule-policy" value="১০০% অথেন্টিক প্রোডাক্ট ও ৭ দিনের রিপ্লেসমেন্ট আবশ্যক" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border" />
            </div>
            <div>
              <button type="submit" class="btn-primary py-2 px-5 font-bold w-full">সেলার নিয়ম সেভ করুন</button>
            </div>
          </form>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2.5 px-3">সেলার ID</th>
                <th class="py-2.5 px-3">স্টোর ও মালিক</th>
                <th class="py-2.5 px-3">ফোন নম্বর</th>
                <th class="py-2.5 px-3">ঠিকানা</th>
                <th class="py-2.5 px-3">কমিশন</th>
                <th class="py-2.5 px-3">পণ্য সংখ্যা</th>
                <th class="py-2.5 px-3">স্ট্যাটাস</th>
                <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="admin-sellers-tbody" class="divide-y">
              ${sellers.map(s => {
                const safeId = String(s.id || '').replace(/'/g, "\\'");
                return `
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td class="py-2.5 px-3 font-mono font-bold text-indigo-600">${s.id}</td>
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-slate-900 dark:text-white">${s.store}</div>
                      <div class="text-[10px] text-slate-400">মালিক: ${s.name}</div>
                    </td>
                    <td class="py-2.5 px-3 font-mono">${s.phone}</td>
                    <td class="py-2.5 px-3 text-slate-500">${s.address || 'ঢাকা'}</td>
                    <td class="py-2.5 px-3 font-bold font-mono text-emerald-600">${s.commission}</td>
                    <td class="py-2.5 px-3 font-mono">${s.products_count} টি</td>
                    <td class="py-2.5 px-3"><span class="badge badge-success text-[10px]">${s.status}</span></td>
                    <td class="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                      <button type="button" class="btn-secondary py-0.5 px-2 text-[10px] text-emerald-600 font-bold" onclick="window.openSellerModal('${safeId}')">✏️ এডিট</button>
                      <button type="button" class="btn-secondary py-0.5 px-2 text-[10px] text-rose-600 border-rose-200" onclick="window.deletePartnerItem('seller', '${safeId}')">মুছুন</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 4. Others Market Page (অন্যান্য মার্কেটপ্লেস - এডিট/ডিলিট/লাইভ ভিউ ও ৬-ফিল্ড এড ফর্ম) -->
    <div id="page-partner-markets" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🌐</span> অন্যান্য মার্কেটপ্লেস চ্যানেল (${markets.length})
            </h3>
            <p class="text-[11px] text-slate-400">Shop_ID, Market_Logo, Market_Name, Shop_Name, Shop_Link, Status (Others_Market শিটে সিঙ্ককৃত)</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button type="button" class="btn-primary py-1.5 px-3 font-bold" onclick="window.openMarketModal('')">+ নতুন মার্কেটপ্লেস যুক্ত করুন</button>
            <a href="/others-market" target="_blank" class="btn-secondary py-1.5 px-2.5 font-bold">🌐 স্টোর ভিউ ↗</a>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div id="admin-markets-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          ${markets.map(m => {
            const id = m.shop_id || m.id || 'MKT-01';
            const safeId = String(id).replace(/'/g, "\\'");
            const mName = m.market_name || m.name || 'Marketplace';
            const sName = m.shop_name || 'Dream Cart BD Official';
            const sLink = m.shop_link || 'https://www.daraz.com.bd';
            const logo = m.market_logo || 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Daraz_Logo.png';
            const st = m.status || 'Active';
            return `
              <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-3 flex flex-col justify-between">
                <div class="flex items-start justify-between gap-2.5">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-white p-1.5 border flex items-center justify-center flex-shrink-0">
                      <img loading="lazy" decoding="async" src="${logo}" class="max-w-full max-h-full object-contain" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/4/4a/Daraz_Logo.png';" />
                    </div>
                    <div>
                      <span class="text-[10px] font-mono font-bold bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded">${id}</span>
                      <div class="font-black text-slate-900 dark:text-white text-sm mt-0.5">${mName}</div>
                      <div class="text-[11px] font-bold text-emerald-600">শপ: ${sName}</div>
                    </div>
                  </div>
                  <span class="badge ${String(st).toLowerCase() === 'inactive' ? 'badge-warning' : 'badge-success'} text-[9px]">${st}</span>
                </div>
                <div class="text-[10px] font-mono text-slate-400 truncate">🔗 ${sLink}</div>
                <div class="flex items-center gap-1.5 pt-2 border-t">
                  <a href="${sLink}" target="_blank" rel="noopener noreferrer" class="btn-primary py-1.5 px-2.5 text-[10px] font-bold flex-1 text-center">👁️ লাইভ ভিউ ↗</a>
                  <button type="button" onclick="window.openMarketModal('${safeId}')" class="btn-secondary py-1.5 px-2.5 text-[10px] font-bold">✏️ এডিট</button>
                  <button type="button" onclick="window.deletePartnerItem('market', '${safeId}')" class="btn-secondary py-1.5 px-2.5 text-[10px] text-rose-600 border-rose-200">🗑️ ডিলিট</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>

    <!-- 5. Master Admin Users Page (মাস্টার অ্যাডমিন - লিস্ট/এড/ডিলিট/রোল পরিবর্তন ও ১০-ফিল্ড ফর্ম) -->
    <div id="page-admin-users" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>👑</span> মাস্টার অ্যাডমিন একাউন্টস (${admins.length})
            </h3>
            <p class="text-[11px] text-slate-400">লিস্ট, এড, ডিলিট ও রোল পরিবর্তন (Admin/Worker শিটে সিঙ্ককৃত)</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button type="button" class="btn-primary py-1.5 px-3 font-bold" onclick="window.openTeamMemberModal('admin', '')">+ নতুন মাস্টার অ্যাডমিন</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div id="admin-master-users-list" class="space-y-2.5 text-xs">
          ${admins.map(a => {
            const id = a.user_id || a.id || 'ADM-01';
            const safeId = String(id).replace(/'/g, "\\'");
            const photo = a.profile_photo || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
            return `
              <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <img loading="lazy" decoding="async" src="${photo}" class="w-11 h-11 rounded-xl object-cover border flex-shrink-0" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">${id}</span>
                      <span class="font-bold text-slate-900 dark:text-white">${a.name}</span>
                      <span class="text-[10px] text-indigo-600 font-bold">(${a.worker_type || 'Admin'})</span>
                    </div>
                    <div class="text-[11px] text-slate-500 font-mono mt-0.5">📞 ${a.mobile || a.phone || '01581703822'} • ✉️ ${a.mail || a.email || ''} • User: ${a.user_name || a.name}</div>
                    <div class="text-[10px] text-slate-400">📍 ${a.address || 'কুমিল্লা'}</div>
                  </div>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <select onchange="window.handleChangeAdminOrWorkerRole('admin', '${safeId}', this.value)" class="form-control text-[11px] py-1 px-2 rounded-lg border font-bold bg-white dark:bg-slate-900">
                    ${rolesList.map(r => `<option value="${r}" ${(a.role || '') === r ? 'selected' : ''}>রোল: ${r}</option>`).join('')}
                  </select>
                  <button type="button" onclick="window.openTeamMemberModal('admin', '${safeId}')" class="btn-secondary py-1 px-2.5 text-[10px] font-bold">✏️ এডিট</button>
                  <button type="button" onclick="window.deletePartnerItem('admin', '${safeId}')" class="btn-secondary py-1 px-2.5 text-[10px] text-rose-600 border-rose-200">🗑️ ডিলিট</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>

    <!-- 6. Staff & Workers Directory Page (কর্মী ও স্টাফ টিম - লিস্ট/এড/ডিলিট/রোল পরিবর্তন ও ১০-ফিল্ড ফর্ম) -->
    <div id="page-admin-workers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>👷</span> কর্মী ও স্টাফ টিম ডিরেক্টরি (${workers.length})
            </h3>
            <p class="text-[11px] text-slate-400">লিস্ট, এড, ডিলিট ও রোল পরিবর্তন (Admin/Worker শিটে সিঙ্ককৃত)</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button type="button" class="btn-primary py-1.5 px-3 font-bold" onclick="window.openTeamMemberModal('worker', '')">+ নতুন কর্মী যুক্ত করুন</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Workers', ['USER_ID', 'Name', 'Mobile', 'Mail', 'Address', 'Worker_Type', 'Role', 'User_Name'], workers.map(w=>[w.user_id||w.id, w.name, w.mobile||w.phone, w.mail||w.email, w.address||'', w.worker_type||w.role, w.role, w.user_name||w.name]))">CSV</button>
            <button type="button" class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div id="admin-workers-team-list" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          ${workers.map(w => {
            const id = w.user_id || w.id || 'WRK-01';
            const safeId = String(id).replace(/'/g, "\\'");
            const photo = w.profile_photo || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';
            return `
              <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex flex-col justify-between gap-3">
                <div class="flex items-start justify-between gap-2.5">
                  <div class="flex items-center gap-3">
                    <img loading="lazy" decoding="async" src="${photo}" class="w-11 h-11 rounded-xl object-cover border flex-shrink-0" onerror="this.src='https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';" />
                    <div>
                      <span class="font-mono text-[10px] font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">${id}</span>
                      <div class="font-bold text-slate-900 dark:text-white mt-0.5">${w.name}</div>
                      <div class="text-[10px] text-emerald-600 font-bold">${w.worker_type || w.role} • রোল: ${w.role}</div>
                      <div class="text-[10px] text-slate-400 font-mono">📞 ${w.mobile || w.phone} • ✉️ ${w.mail || w.email}</div>
                      <div class="text-[10px] text-slate-400">📍 ${w.address || 'কুমিল্লা'} • User: ${w.user_name || w.name}</div>
                    </div>
                  </div>
                  <span class="badge badge-success text-[10px]">${w.status || 'Active'}</span>
                </div>
                <div class="flex items-center justify-between gap-2 pt-2 border-t">
                  <select onchange="window.handleChangeAdminOrWorkerRole('worker', '${safeId}', this.value)" class="form-control text-[11px] py-1 px-2 rounded-lg border font-bold bg-white dark:bg-slate-900 flex-1">
                    ${rolesList.map(r => `<option value="${r}" ${(w.role || '') === r ? 'selected' : ''}>রোল: ${r}</option>`).join('')}
                  </select>
                  <button type="button" onclick="window.openTeamMemberModal('worker', '${safeId}')" class="btn-secondary py-1 px-2.5 text-[10px] font-bold">✏️ এডিট</button>
                  <button type="button" onclick="window.deletePartnerItem('worker', '${safeId}')" class="btn-secondary py-1 px-2.5 text-[10px] text-rose-600 border-rose-200">🗑️ ডিলিট</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>

    <!-- Modal 1: Reseller Add/Edit Form (12 Required Fields: Shop_ID, Shop_logo, Name, Mobile, Mail, Address, Shop_Name, NID_Number, Date_of_birth, Trade_Licence_No, User_ID, Password) -->
    <div id="modal-add-reseller" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">🤝 রিসেলার নিবন্ধন ও আপডেট ফর্ম (১২ ফিল্ড)</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-reseller')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddReseller(event)" class="space-y-3">
          <input type="hidden" id="adm-res-edit-flag" value="" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">1. Shop_ID *</label>
              <input type="text" id="adm-res-shop-id" required placeholder="RSL-9088" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold text-emerald-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">2. Shop_logo (লিঙ্ক বা আপলোড)</label>
              <div class="flex gap-1.5">
                <input type="text" id="adm-res-shop-logo" placeholder="https://..." class="form-control text-xs flex-1 py-1.5 px-2.5 rounded-xl border" />
                <label class="btn-secondary py-1.5 px-2.5 text-[10px] font-bold cursor-pointer">📤<input type="file" accept="image/*" class="hidden" onchange="window.handlePartnerImageUpload(this, 'adm-res-shop-logo')" /></label>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">3. Name (পূর্ণ নাম) *</label>
              <input type="text" id="adm-res-name" required placeholder="মোঃ আরিফ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">4. Mobile (মোবাইল নম্বর) *</label>
              <input type="text" id="adm-res-mobile" required placeholder="017xxxxxxxx" oninput="const u=document.getElementById('adm-res-userid'); if(u && !u.value) u.value=this.value;" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">5. Mail (ইমেইল)</label>
              <input type="email" id="adm-res-mail" placeholder="reseller@example.com" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">6. Address (ঠিকানা) *</label>
              <input type="text" id="adm-res-address" required placeholder="কুমিল্লা / ঢাকা" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">7. Shop_Name (শপের নাম) *</label>
              <input type="text" id="adm-res-shop-name" required placeholder="স্মার্ট কালেকশন বিডি" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">8. NID_Number (এনআইডি নম্বর)</label>
              <input type="text" id="adm-res-nid" placeholder="1998xxxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">9. Date_of_birth (জন্ম তারিখ)</label>
              <input type="date" id="adm-res-dob" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">10. Trade_Licence_No (ট্রেড লাইসেন্স)</label>
              <input type="text" id="adm-res-tl" placeholder="TRAD/DNCC/..." class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">11. User_ID *</label>
              <input type="text" id="adm-res-userid" required placeholder="017xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">12. Password *</label>
              <div class="relative flex items-center"><input type="password" id="adm-res-password" placeholder="নতুন পাসওয়ার্ড দিন" autocomplete="new-password" class="form-control text-xs w-full py-1.5 pl-3 pr-8 rounded-xl border font-mono font-bold" /><button type="button" onclick="window.toggleAdminPasswordVisibility && window.toggleAdminPasswordVisibility('adm-res-password', this)" class="absolute right-2 text-slate-400 hover:text-slate-700 text-xs" title="পাসওয়ার্ড দেখুন/লুকান">👁️</button></div>
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">কমিশন রেট (%)</label>
            <input type="text" id="adm-res-comm" value="15%" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-reseller')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-2 px-5 font-bold">💾 লিস্ট ও শিটে সেভ করুন →</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Wholesaler Add/Edit Form (9 Required Fields: Shop_ID, Shop_logo, Name, Mobile, Mail, Address, Shop_Name, User_ID, Password) -->
    <div id="modal-add-wholesaler" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">🏢 হোলসেলার / পাইকারি নিবন্ধন ফর্ম (৯ ফিল্ড)</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-wholesaler')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddWholesaler(event)" class="space-y-3">
          <input type="hidden" id="adm-whs-edit-flag" value="" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">1. Shop_ID *</label>
              <input type="text" id="adm-whs-shop-id" required placeholder="WHS-105" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold text-amber-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">2. Shop_logo (লিঙ্ক বা আপলোড)</label>
              <div class="flex gap-1.5">
                <input type="text" id="adm-whs-shop-logo" placeholder="https://..." class="form-control text-xs flex-1 py-1.5 px-2.5 rounded-xl border" />
                <label class="btn-secondary py-1.5 px-2.5 text-[10px] font-bold cursor-pointer">📤<input type="file" accept="image/*" class="hidden" onchange="window.handlePartnerImageUpload(this, 'adm-whs-shop-logo')" /></label>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">3. Name (পূর্ণ নাম) *</label>
              <input type="text" id="adm-whs-name" required placeholder="হাজী মোঃ ইউসুফ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">4. Mobile (মোবাইল নম্বর) *</label>
              <input type="text" id="adm-whs-mobile" required placeholder="018xxxxxxxx" oninput="const u=document.getElementById('adm-whs-userid'); if(u && !u.value) u.value=this.value;" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">5. Mail (ইমেইল)</label>
              <input type="email" id="adm-whs-mail" placeholder="wholesale@example.com" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">6. Address (ঠিকানা) *</label>
              <input type="text" id="adm-whs-address" required placeholder="চকবাজার, ঢাকা" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">7. Shop_Name (প্রতিষ্ঠানের নাম) *</label>
              <input type="text" id="adm-whs-shop-name" required placeholder="ইউসুফ এন্টারপ্রাইজ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">8. User_ID *</label>
              <input type="text" id="adm-whs-userid" required placeholder="018xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">9. Password *</label>
              <div class="relative flex items-center"><input type="password" id="adm-whs-password" placeholder="নতুন পাসওয়ার্ড দিন" autocomplete="new-password" class="form-control text-xs w-full py-1.5 pl-3 pr-8 rounded-xl border font-mono font-bold" /><button type="button" onclick="window.toggleAdminPasswordVisibility && window.toggleAdminPasswordVisibility('adm-whs-password', this)" class="absolute right-2 text-slate-400 hover:text-slate-700 text-xs" title="পাসওয়ার্ড দেখুন/লুকান">👁️</button></div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold mb-1">MOQ (পিস)</label>
                <input type="number" id="adm-whs-moq" value="5" min="1" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-mono font-bold" />
              </div>
              <div>
                <label class="block font-bold mb-1">ডিসকাউন্ট %</label>
                <input type="text" id="adm-whs-disc" value="15%" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-mono font-bold" />
              </div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-wholesaler')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-2 px-5 font-bold">💾 লিস্ট ও শিটে সেভ করুন →</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 3: Merchant Seller Add/Edit Form -->
    <div id="modal-add-seller" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">🏪 মার্চেন্ট সেলার নিবন্ধন ও আপডেট</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-seller')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddSeller(event)" class="space-y-3">
          <input type="hidden" id="adm-seller-edit-flag" value="" />
          <div>
            <label class="block font-bold mb-1">সেলারের পুরো নাম *</label>
            <input type="text" id="adm-new-seller-name" required placeholder="কামরুল হাসান" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">স্টোরের নাম *</label>
            <input type="text" id="adm-new-seller-store" required placeholder="অরগ্যানিক ভ্যালি" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1">ফোন নম্বর *</label>
              <input type="text" id="adm-new-seller-phone" required placeholder="019xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">কমিশন রেট</label>
              <input type="text" id="adm-new-seller-comm" value="10%" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-bold" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">ঠিকানা</label>
            <input type="text" id="adm-new-seller-address" placeholder="ঢাকা / কুমিল্লা" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-seller')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">💾 লিস্ট ও শিটে সেভ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 4: Marketplace Add/Edit Form (6 Required Fields: Shop_ID, Market_Logo, Market_Name, Shop_Name, Shop_Link, Status) -->
    <div id="modal-add-market" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">🌐 অন্যান্য মার্কেটপ্লেস যুক্ত ও এডিট (৬ ফিল্ড)</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-market')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddMarket(event)" class="space-y-3">
          <input type="hidden" id="adm-mkt-edit-flag" value="" />
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1">1. Shop_ID *</label>
              <input type="text" id="adm-mkt-shop-id" required placeholder="MKT-DARAZ-01" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">6. Status *</label>
              <select id="adm-mkt-status" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                <option value="Active">Active (সক্রিয়)</option>
                <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">2. Market_Logo (লোগো URL বা আপলোড)</label>
            <div class="flex gap-1.5">
              <input type="text" id="adm-mkt-logo" placeholder="https://..." class="form-control text-xs flex-1 py-1.5 px-3 rounded-xl border" />
              <label class="btn-secondary py-1.5 px-2.5 text-[10px] font-bold cursor-pointer">📤<input type="file" accept="image/*" class="hidden" onchange="window.handlePartnerImageUpload(this, 'adm-mkt-logo')" /></label>
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">3. Market_Name (মার্কেটপ্লেসের নাম) *</label>
            <input type="text" id="adm-mkt-name" required placeholder="Daraz Bangladesh / Bikroy / Facebook Shop" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">4. Shop_Name (দোকানের নাম) *</label>
            <input type="text" id="adm-mkt-shop-name" required placeholder="Dream Cart BD Official Store" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
          </div>
          <div>
            <label class="block font-bold mb-1">5. Shop_Link (লাইভ শপ লিংক) *</label>
            <input type="url" id="adm-mkt-link" required placeholder="https://www.daraz.com.bd/shop/dreamcartbd" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-market')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">💾 লিস্ট ও শিটে সেভ করুন →</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 5: Worker / Staff Add/Edit Form (10 Required Fields: USER_ID, Profile_Photo, Name, Mobile, Mail, Address, Worker_Type, Role, User_Name, Password) -->
    <div id="modal-add-worker" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">👷 কর্মী ও স্টাফ টিম নিবন্ধন ফর্ম (১০ ফিল্ড)</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-worker')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddWorker(event)" class="space-y-3">
          <input type="hidden" id="adm-wrk-edit-flag" value="" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">1. USER_ID *</label>
              <input type="text" id="adm-wrk-id" required placeholder="WRK-105" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold text-emerald-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">2. Profile_Photo (ছবি লিঙ্ক বা আপলোড)</label>
              <div class="flex gap-1.5">
                <input type="text" id="adm-wrk-photo" placeholder="https://..." class="form-control text-xs flex-1 py-1.5 px-2.5 rounded-xl border" />
                <label class="btn-secondary py-1.5 px-2.5 text-[10px] font-bold cursor-pointer">📤<input type="file" accept="image/*" class="hidden" onchange="window.handlePartnerImageUpload(this, 'adm-wrk-photo')" /></label>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">3. Name (পূর্ণ নাম) *</label>
              <input type="text" id="adm-wrk-name" required placeholder="রাকিবুল হাসান" oninput="const u=document.getElementById('adm-wrk-uname'); if(u && !u.value) u.value=this.value;" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">4. Mobile (মোবাইল নম্বর) *</label>
              <input type="text" id="adm-wrk-mobile" required placeholder="018xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">5. Mail (ইমেইল)</label>
              <input type="email" id="adm-wrk-mail" placeholder="staff@dreamcart.bd" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">6. Address (ঠিকানা) *</label>
              <input type="text" id="adm-wrk-address" required placeholder="কুমিল্লা / ঢাকা" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">7. Worker_Type (কর্মীর ধরন) *</label>
              <select id="adm-wrk-wtype" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
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
              <select id="adm-wrk-role" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                ${rolesList.map(r => `<option value="${r}">${r}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">9. User_Name (লগইন ইউজারনেম) *</label>
              <input type="text" id="adm-wrk-uname" required placeholder="rakib_staff" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">10. Password (পাসওয়ার্ড) *</label>
              <div class="relative flex items-center"><input type="password" id="adm-wrk-pass" placeholder="নতুন পাসওয়ার্ড দিন" autocomplete="new-password" class="form-control text-xs w-full py-1.5 pl-3 pr-8 rounded-xl border font-mono font-bold" /><button type="button" onclick="window.toggleAdminPasswordVisibility && window.toggleAdminPasswordVisibility('adm-wrk-pass', this)" class="absolute right-2 text-slate-400 hover:text-slate-700 text-xs" title="পাসওয়ার্ড দেখুন/লুকান">👁️</button></div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-worker')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-2 px-5 font-bold">💾 লিস্ট ও শিটে সেভ করুন →</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 6: Master Admin Add/Edit Form (10 Required Fields: USER_ID, Profile_Photo, Name, Mobile, Mail, Address, Worker_Type, Role, User_Name, Password) -->
    <div id="modal-add-admin" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">👑 মাস্টার অ্যাডমিন নিবন্ধন ফর্ম (১০ ফিল্ড)</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-admin')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddAdmin(event)" class="space-y-3">
          <input type="hidden" id="adm-user-edit-flag" value="" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold mb-1">1. USER_ID *</label>
              <input type="text" id="adm-user-id" required placeholder="ADM-05" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold text-emerald-600" />
            </div>
            <div>
              <label class="block font-bold mb-1">2. Profile_Photo (ছবি লিঙ্ক বা আপলোড)</label>
              <div class="flex gap-1.5">
                <input type="text" id="adm-user-photo" placeholder="https://..." class="form-control text-xs flex-1 py-1.5 px-2.5 rounded-xl border" />
                <label class="btn-secondary py-1.5 px-2.5 text-[10px] font-bold cursor-pointer">📤<input type="file" accept="image/*" class="hidden" onchange="window.handlePartnerImageUpload(this, 'adm-user-photo')" /></label>
              </div>
            </div>
            <div>
              <label class="block font-bold mb-1">3. Name (পূর্ণ নাম) *</label>
              <input type="text" id="adm-user-name" required placeholder="MD. Saiful Islam" oninput="const u=document.getElementById('adm-user-uname'); if(u && !u.value) u.value=this.value;" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">4. Mobile (মোবাইল নম্বর) *</label>
              <input type="text" id="adm-user-mobile" required placeholder="01818273838" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">5. Mail (ইমেইল) *</label>
              <input type="email" id="adm-user-mail" required placeholder="admin@dreamcart.bd" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">6. Address (ঠিকানা) *</label>
              <input type="text" id="adm-user-address" required placeholder="কুমিল্লা সদর দক্ষিণ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
            <div>
              <label class="block font-bold mb-1">7. Worker_Type (ধরন) *</label>
              <select id="adm-user-wtype" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                <option value="Admin">Admin (মাস্টার অ্যাডমিন)</option>
                <option value="Executive Director">Executive Director</option>
                <option value="Operations Lead">Operations Lead</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">8. Role (রোল / পারমিশন) *</label>
              <select id="adm-user-role" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
                ${rolesList.map(r => `<option value="${r}">${r}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1">9. User_Name (ইউজারনেম) *</label>
              <input type="text" id="adm-user-uname" required placeholder="Jainal Abedin" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">10. Password (পাসওয়ার্ড) *</label>
              <div class="relative flex items-center"><input type="password" id="adm-user-pass" placeholder="নতুন পাসওয়ার্ড দিন" autocomplete="new-password" class="form-control text-xs w-full py-1.5 pl-3 pr-8 rounded-xl border font-mono font-bold" /><button type="button" onclick="window.toggleAdminPasswordVisibility && window.toggleAdminPasswordVisibility('adm-user-pass', this)" class="absolute right-2 text-slate-400 hover:text-slate-700 text-xs" title="পাসওয়ার্ড দেখুন/লুকান">👁️</button></div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-admin')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-2 px-5 font-bold">💾 লিস্ট ও শিটে সেভ করুন →</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// ============================================================================
