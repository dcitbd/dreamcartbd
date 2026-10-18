/**
 * DREAM CART BD — Inventory & Finance Module (adminInventory.js)
 * Implements:
 * - Reseller Payout Requests with automatic -3% fee deduction
 * - Business Costs & Expense Ledger
 * - Wholesale Stock Buying Invoices
 * - Equity Capital Investment Tracker
 */

import { formatCurrency } from '../../../utils/format.js';

export function renderInventoryModule({ costs, buying, invest }) {
  return `
    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: INVENTORY & FINANCE (4 Distinct Standalone Views)-->
    <!-- ================================================================= -->

    <!-- 1. Reseller Payment Request Page -->
    <div id="page-inv-payout" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">💳 রিসেলার কমিশন পে-আউট রিকোয়েস্ট (স্বয়ংক্রিয় -৩% ফি কর্তন)</h3>
          <p class="text-[11px] text-slate-400">রিসেলার ড্যাশবোর্ড থেকে পাঠানো উত্তোলনের আবেদনসমূহ</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2.5 px-3">রিকোয়েস্ট ID</th>
                <th class="py-2.5 px-3">রিসেলার ও শপ</th>
                <th class="py-2.5 px-3">পেমেন্ট মেথড</th>
                <th class="py-2.5 px-3">আবেদনের পরিমাণ</th>
                <th class="py-2.5 px-3">প্রদেয় (-৩% ফি)</th>
                <th class="py-2.5 px-3">স্ট্যাটাস</th>
                <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3 px-3 font-mono font-bold text-indigo-600">REQ-8472</td>
                <td class="py-3 px-3">
                  <div class="font-bold text-slate-900 dark:text-white">ফ্যাশন পয়েন্ট (মোঃ মাহমুদ)</div>
                  <div class="text-[10px] text-slate-400 font-mono">RSL-9082</div>
                </td>
                <td class="py-3 px-3 font-mono">bKash (01819876543)</td>
                <td class="py-3 px-3 font-bold font-mono">৳১,২০০</td>
                <td class="py-3 px-3 font-black text-emerald-600 font-mono">৳১,১৬৪</td>
                <td class="py-3 px-3"><span class="badge badge-warning text-[9px]">Pending</span></td>
                <td class="py-3 px-3 text-right">
                  <button class="btn-primary py-1 px-3 text-[10px] font-bold" onclick="window.handleApprovePayout('REQ-8472', '১,১৬৪', this)">
                    অনুমোদন ও পে করুন ✓
                  </button>
                </td>
              </tr>
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                <td class="py-3 px-3 font-mono font-bold text-indigo-600">REQ-8469</td>
                <td class="py-3 px-3">
                  <div class="font-bold text-slate-900 dark:text-white">গ্যাজেট ওয়ার্ল্ড (আরিফুল)</div>
                  <div class="text-[10px] text-slate-400 font-mono">RSL-9085</div>
                </td>
                <td class="py-3 px-3 font-mono">Nagad (01712345678)</td>
                <td class="py-3 px-3 font-bold font-mono">৳৩,০০০</td>
                <td class="py-3 px-3 font-black text-emerald-600 font-mono">৳২,৯১০</td>
                <td class="py-3 px-3"><span class="badge badge-success text-[9px]">Paid ✓</span></td>
                <td class="py-3 px-3 text-right">
                  <span class="text-[10px] text-emerald-600 font-bold">পরিশোধিত</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 2. Costs Ledger Page -->
    <div id="page-inv-costs" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">💸 ব্যবসায়িক খরচ ও ব্যয় লেজার (${costs.length})</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-cost')?.classList.remove('hidden')">+ নতুন খরচ</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Costs', ['ID', 'Title', 'Amount', 'Date'], costs.map(c=>[c.id, c.title, c.amount, c.date]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2 px-3">আইডি</th>
                <th class="py-2 px-3">খাত / বিবরণ</th>
                <th class="py-2 px-3">ক্যাটাগরি</th>
                <th class="py-2 px-3">পরিমাণ</th>
                <th class="py-2 px-3">তারিখ</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${costs.map(c => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td class="py-2.5 px-3 font-mono text-slate-400">${c.id}</td>
                  <td class="py-2.5 px-3 font-bold text-slate-900 dark:text-white">${c.title}</td>
                  <td class="py-2.5 px-3 text-slate-500">${c.category}</td>
                  <td class="py-2.5 px-3 font-black text-rose-500 font-mono">${formatCurrency(c.amount)}</td>
                  <td class="py-2.5 px-3 text-slate-400">${c.date}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 3. Buying Page -->
    <div id="page-inv-buying" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🛒 পাইকারি স্টক ক্রয় হিসাব (${buying.length})</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-buying')?.classList.remove('hidden')">+ স্টক ক্রয় ভাউচার</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Buying', ['ID', 'Supplier', 'Product', 'Qty', 'Amount'], buying.map(b=>[b.id, b.supplier, b.product, b.quantity, b.total_amount]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2 px-3">ক্রয় ID</th>
                <th class="py-2 px-3">সাপ্লায়ার</th>
                <th class="py-2 px-3">পণ্য</th>
                <th class="py-2 px-3">পরিমাণ</th>
                <th class="py-2 px-3">মোট বিল</th>
                <th class="py-2 px-3">তারিখ</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${buying.map(b => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td class="py-2.5 px-3 font-mono text-slate-400">${b.id}</td>
                  <td class="py-2.5 px-3 font-bold">${b.supplier}</td>
                  <td class="py-2.5 px-3">${b.product}</td>
                  <td class="py-2.5 px-3 font-mono">${b.quantity} পিস</td>
                  <td class="py-2.5 px-3 font-bold font-mono text-emerald-600">${formatCurrency(b.total_amount)}</td>
                  <td class="py-2.5 px-3 text-slate-400">${b.date}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 4. Invest Page -->
    <div id="page-inv-invest" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">💼 মূলধন ও বিনিয়োগ ট্র্যাকার (${invest.length})</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-invest')?.classList.remove('hidden')">+ নতুন বিনিয়োগ</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Invest', ['ID', 'Investor', 'Amount', 'Date'], invest.map(i=>[i.id, i.investor, i.amount, i.date]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>
        <div class="space-y-2.5 text-xs">
          ${invest.map(i => `
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${i.investor}</div>
                <div class="text-[10px] text-slate-400">${i.note} • ${i.date}</div>
              </div>
              <div class="text-base font-black text-emerald-600 font-mono">${formatCurrency(i.amount)}</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div id="modal-add-cost" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন খরচ ভাউচার এন্ট্রি</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-cost')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddCost(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">খরচের বিবরণ *</label>
            <input type="text" id="adm-cost-title" required placeholder="বিজ্ঞাপন / অফিস খরচ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">খরচের পরিমাণ (৳) *</label>
            <input type="number" id="adm-cost-amount" required placeholder="5000" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
          </div>
          <div>
            <label class="block font-bold mb-1">ক্যাটাগরি</label>
            <select id="adm-cost-cat" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
              <option value="মার্কেটিং ও বিজ্ঞাপন">মার্কেটিং ও বিজ্ঞাপন</option>
              <option value="অফিস ও শোরুম ভাড়া">অফিস ও শোরুম ভাড়া</option>
              <option value="প্যাকেজিং ও বক্স">প্যাকেজিং ও বক্স</option>
              <option value="আইটি ও সার্ভার">আইটি ও সার্ভার</option>
              <option value="অন্যান্য ব্যয়">অন্যান্য ব্যয়</option>
            </select>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-cost')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-add-buying" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন পাইকারি স্টক ক্রয় এন্ট্রি</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-buying')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddBuying(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">সাপ্লায়ার / মহাজনের নাম</label>
            <input type="text" id="adm-buying-supplier" placeholder="ঢাকা হোলসেল মার্কেট" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">পণ্যের বিবরণ *</label>
            <input type="text" id="adm-buying-product" required placeholder="স্মার্টওয়াচ ও ব্যাটারি" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1">পরিমাণ (পিস) *</label>
              <input type="number" id="adm-buying-qty" required value="50" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">মোট বিল (৳) *</label>
              <input type="number" id="adm-buying-total" required placeholder="45000" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-buying')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-add-invest" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন মূলধন বিনিয়োগ যুক্ত করুন</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-invest')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddInvest(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">বিনিয়োগকারীর নাম *</label>
            <input type="text" id="adm-invest-investor" required placeholder="জয়নাল আবেদীন" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">বিনিয়োগের পরিমাণ (৳) *</label>
            <input type="number" id="adm-invest-amount" required placeholder="500000" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
          </div>
          <div>
            <label class="block font-bold mb-1">নোট / শেয়ার অংশীদারিত্ব</label>
            <input type="text" id="adm-invest-note" placeholder="কার্যকরী মূলধন সম্প্রসারণ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-invest')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
