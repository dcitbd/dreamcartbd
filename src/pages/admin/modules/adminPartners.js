/**
 * DREAM CART BD — Partner & Admin Management Module (adminPartners.js)
 * Implements:
 * - Reseller management with live commission % control, balances & tracking
 * - Wholesaler tier management
 * - Merchant seller management & marketplace sync (Daraz, Facebook, Bikroy)
 * - Master Admin & Staff Worker directory
 */

export function renderPartnersModule({ resellers, wholesalers, sellers, markets, admins, workers }) {
  return `
    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: PARTNERS & ADMINS (6 Distinct Standalone Views)  -->
    <!-- ================================================================= -->

    <!-- 1. Resellers Page -->
    <div id="page-partner-resellers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🤝</span> রিসেলার পার্টনার তালিকা (${resellers.length})
            </h3>
            <p class="text-[11px] text-slate-400">রিসেলিং কমিশন, ওয়ালেট ব্যালেন্স ও ড্রপশিপিং হিসাব</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-reseller')?.classList.remove('hidden')">+ নতুন রিসেলার</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Resellers', ['ID', 'Name', 'Shop', 'Phone', 'City', 'Balance', 'Total Earned', 'Status'], resellers.map(r=>[r.id, r.name, r.shop, r.phone, r.city, r.balance, r.total_earned, r.status]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <!-- Reseller Commission Control Panel -->
        <div class="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 dark:border-emerald-800 pb-2">
            <div>
              <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚙️</span> রিসেল প্রাইজ ও কমিশন কন্ট্রোল (Reseller Commission & Price Control)
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">এডমিন প্যানেল থেকে রিসেলারদের মুনাফা/কমিশন শতকরা হার (%) নির্ধারণ ও নিয়ন্ত্রণ করুন</p>
            </div>
            <span class="badge badge-success text-xs font-bold">লাইভ সক্রিয় কন্ট্রোল</span>
          </div>

          <form onsubmit="window.handleSaveResellerSettings(event)" class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
            <div>
              <label class="block font-bold mb-1 text-slate-700 dark:text-slate-300">গ্লোবাল রিসেলিং কমিশন (%) *</label>
              <div class="flex items-center gap-2">
                <input type="number" id="adm-reseller-global-pct" value="15" min="1" max="60" required class="form-control text-xs w-24 py-1.5 px-2.5 rounded-xl border font-black font-mono text-emerald-600" />
                <span class="text-xs font-bold text-slate-500">% ছাড়/মার্জিন</span>
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
              <button type="submit" class="btn-primary py-2 px-5 font-bold w-full">কমিশন রেট সংরক্ষণ করুন</button>
            </div>
          </form>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b text-slate-400 uppercase text-[10px]">
                <th class="py-2.5 px-3">রিসেলার ID</th>
                <th class="py-2.5 px-3">নাম ও শপ</th>
                <th class="py-2.5 px-3">ফোন নম্বর</th>
                <th class="py-2.5 px-3">জেলা</th>
                <th class="py-2.5 px-3">চলতি ব্যালেন্স</th>
                <th class="py-2.5 px-3">মোট আয়</th>
                <th class="py-2.5 px-3">স্ট্যাটাস</th>
                <th class="py-2.5 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              ${resellers.map(r => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td class="py-2.5 px-3 font-mono font-bold text-emerald-600">${r.id}</td>
                  <td class="py-2.5 px-3">
                    <div class="font-bold">${r.name}</div>
                    <div class="text-[10px] text-slate-400">${r.shop}</div>
                  </td>
                  <td class="py-2.5 px-3 font-mono">${r.phone}</td>
                  <td class="py-2.5 px-3">${r.city}</td>
                  <td class="py-2.5 px-3 font-black text-emerald-600 font-mono">৳${r.balance}</td>
                  <td class="py-2.5 px-3 font-bold font-mono">৳${r.total_earned}</td>
                  <td class="py-2.5 px-3"><span class="badge badge-success text-[10px]">${r.status}</span></td>
                  <td class="py-2.5 px-3 text-right space-x-1">
                    <button class="btn-secondary py-0.5 px-2 text-[10px]" onclick="window.copyToClipboard('${r.phone}', 'ফোন কপি হয়েছে!')">যোগাযোগ</button>
                    <button class="btn-secondary py-0.5 px-2 text-[10px] text-rose-600 border-rose-200" onclick="if(confirm('রিসেলারটি মুছে ফেলতে চান?')) this.closest('tr').remove()">মুছুন</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 2. Wholesalers Page -->
    <div id="page-partner-wholesalers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏢</span> পাইকারি ক্রেতা (Wholesalers - ${wholesalers.length})
            </h3>
            <p class="text-[11px] text-slate-400">হোলসেল ডিসকাউন্ট টিয়ার ও বিশেষ পাইকারি দর</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-wholesaler')?.classList.remove('hidden')">+ নতুন হোলসেলার</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Wholesalers', ['ID', 'Name', 'Company', 'Phone', 'Tier', 'Orders', 'Status'], wholesalers.map(w=>[w.id, w.name, w.company, w.phone, w.tier, w.total_orders, w.status]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div class="space-y-2.5 text-xs">
          ${wholesalers.map(w => `
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${w.company} (${w.name})</div>
                <div class="text-[10px] text-slate-400 font-mono">ID: ${w.id} • ফোন: ${w.phone} • ডিসকাউন্ট: ${w.tier} • সম্পন্ন অর্ডার: ${w.total_orders} টি</div>
              </div>
              <div class="flex items-center gap-2">
                <span class="badge badge-success text-[10px]">${w.status}</span>
                <button class="btn-secondary py-1 px-2.5 text-[10px]" onclick="window.copyToClipboard('${w.phone}', 'ফোন কপি হয়েছে!')">কল / WhatsApp</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 3. Sellers Page -->
    <div id="page-partner-sellers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏪</span> মার্চেন্ট সেলার / ভেন্ডর (${sellers.length})
            </h3>
            <p class="text-[11px] text-slate-400">তৃতীয় পক্ষ বিক্রেতা ও স্টোর কমিশন</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-seller')?.classList.remove('hidden')">+ নতুন সেলার</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Sellers', ['ID', 'Store', 'Name', 'Phone', 'Commission', 'Products'], sellers.map(s=>[s.id, s.store, s.name, s.phone, s.commission, s.products_count]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div class="space-y-2.5 text-xs">
          ${sellers.map(s => `
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${s.store} • ${s.name}</div>
                <div class="text-[10px] text-slate-400 font-mono">কমিশন: ${s.commission} • পণ্য সংখ্যা: ${s.products_count} টি • ফোন: ${s.phone}</div>
              </div>
              <span class="badge badge-success text-[10px]">${s.status}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 4. Others Market Page -->
    <div id="page-partner-markets" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🌐</span> অন্যান্য মার্কেটপ্লেস চ্যানেল (Multi-Channel Sync)
            </h3>
            <p class="text-[11px] text-slate-400">দারাজ, ফেসবুক শপ ও বিক্রয় ডট কম</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-market')?.classList.remove('hidden')">+ চ্যানেল যুক্ত</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          ${markets.map(m => `
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
              <div class="flex items-center justify-between">
                <div class="font-bold text-slate-900 dark:text-white">${m.name}</div>
                <span class="badge badge-success text-[9px]">${m.status}</span>
              </div>
              <div class="text-[10px] text-slate-400">সিঙ্ক মোড: ${m.sync_mode} • ${m.last_sync}</div>
              <button class="btn-secondary py-1 px-3 w-full text-[10px] font-bold" onclick="if(toast&&toast.show) toast.show({type:'success', title:'চ্যানেল সিঙ্ক', message:'${m.name} এর ক্যাটালগ সফলভাবে রিফ্রেশ হয়েছে!'})">এখনই সিঙ্ক করুন 🔄</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 5. Admin Users Page -->
    <div id="page-admin-users" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>👑</span> মাস্টার অ্যাডমিন একাউন্টস (${admins.length})
            </h3>
            <p class="text-[11px] text-slate-400">সুপার অ্যাডমিন পারমিশন ও একাউন্ট ম্যানেজমেন্ট</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-admin')?.classList.remove('hidden')">+ অ্যাডমিন একাউন্ট</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div class="space-y-2.5 text-xs">
          ${admins.map(a => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex items-center justify-between">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${a.name} (${a.role})</div>
                <div class="text-[10px] text-slate-400 font-mono">${a.email}</div>
              </div>
              <span class="badge badge-success text-[10px]">Super Admin Access</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 6. Staff & Workers Directory Page -->
    <div id="page-admin-workers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>👷</span> কর্মী ও স্টাফ টিম ডিরেক্টরি (${workers.length})
            </h3>
            <p class="text-[11px] text-slate-400">অর্ডার ডেস্ক, ডেলিভারি, সাপোর্ট ও হিসাবরক্ষক কর্মী</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="document.getElementById('modal-add-worker')?.classList.remove('hidden')">+ নতুন কর্মী যুক্ত</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Workers', ['ID', 'Name', 'Role', 'Phone', 'Email'], workers.map(w=>[w.id, w.name, w.role, w.phone, w.email]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          ${workers.map(w => `
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 font-black flex items-center justify-center text-sm border">👤</div>
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">${w.name}</div>
                  <div class="text-[10px] text-emerald-600 font-bold">${w.role}</div>
                  <div class="text-[10px] text-slate-400 font-mono">${w.phone} • ${w.email}</div>
                </div>
              </div>
              <span class="badge badge-success text-[10px]">${w.status}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div id="modal-add-reseller" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন রিসেলার নিবন্ধন</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-reseller')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddReseller(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">রিসেলারের নাম *</label>
            <input type="text" id="adm-new-reseller-name" required placeholder="মোঃ আরিফ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">ফেসবুক পেজ / শপ নাম</label>
            <input type="text" id="adm-new-reseller-shop" placeholder="স্মার্ট কালেকশন" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1">ফোন নম্বর *</label>
              <input type="text" id="adm-new-reseller-phone" required placeholder="017xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">জেলা / শহর</label>
              <input type="text" id="adm-new-reseller-city" placeholder="ঢাকা" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-reseller')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">নিবন্ধন করুন</button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-add-wholesaler" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন হোলসেলার নিবন্ধন</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-wholesaler')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddWholesaler(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">স্বত্বাধিকারীর নাম *</label>
            <input type="text" id="adm-new-ws-name" required placeholder="হাজী মোঃ ইউসুফ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">প্রতিষ্ঠানের নাম</label>
            <input type="text" id="adm-new-ws-company" placeholder="ইউসুফ এন্টারপ্রাইজ" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-bold mb-1">ফোন নম্বর *</label>
              <input type="text" id="adm-new-ws-phone" required placeholder="018xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">ডিসকাউন্ট টিয়ার</label>
              <select id="adm-new-ws-tier" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-bold">
                <option value="Tier 1 (20% Off)">Tier 1 (20% Off)</option>
                <option value="Tier 2 (15% Off)">Tier 2 (15% Off)</option>
              </select>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-wholesaler')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-add-seller" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন মার্চেন্ট সেলার যুক্ত</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-seller')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddSeller(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">সিলারের পুরো নাম *</label>
            <input type="text" id="adm-new-seller-name" required placeholder="কামরুল হাসান" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">স্টোরের নাম</label>
            <input type="text" id="adm-new-seller-store" placeholder="অরগ্যানিক ভ্যালি" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
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
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-seller')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">যুক্ত করুন</button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-add-market" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন মার্কেট চ্যানেল যুক্ত</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-market')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddMarket(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">মার্কেটপ্লেসের নাম *</label>
            <input type="text" id="adm-new-market-name" required placeholder="TikTok Shop / Evaly" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">সিঙ্ক মোড</label>
            <select id="adm-new-market-sync" class="form-control text-xs w-full py-1.5 px-2 rounded-xl border font-bold">
              <option value="API Auto">API Auto</option>
              <option value="Catalog XML Feed">Catalog XML Feed</option>
              <option value="Manual Webhook">Manual Webhook</option>
            </select>
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-market')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংযুক্ত করুন</button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-add-worker" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন কর্মী / স্টাফ টিম যুক্ত করুন</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-worker')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddWorker(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">কর্মীর পুরো নাম *</label>
            <input type="text" id="adm-new-worker-name" required placeholder="রাকিবুল হাসান" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">দায়িত্ব / পদবী *</label>
            <select id="adm-new-worker-role" class="form-control text-xs w-full py-1.5 px-2.5 rounded-xl border font-bold">
              <option value="Order Management">Order Management (অর্ডার ডেস্ক)</option>
              <option value="Customer Support">Customer Support (গ্রাহক সেবা)</option>
              <option value="Delivery">Delivery (ডেলিভারি)</option>
              <option value="Accountant">Accountant (হিসাবরক্ষক)</option>
              <option value="Inventory/Warehouse">Inventory (গুদাম)</option>
              <option value="Sales">Sales (বিক্রয়)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold mb-1">ফোন নম্বর *</label>
            <input type="text" id="adm-new-worker-phone" required placeholder="018xxxxxxxx" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-worker')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংরক্ষণ করুন</button>
          </div>
        </form>
      </div>
    </div>

    <div id="modal-add-admin" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন অ্যাডমিন একাউন্ট তৈরি</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-admin')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddAdmin(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">অ্যাডমিনের পুরো নাম *</label>
            <input type="text" id="adm-new-admin-name" required placeholder="MD. Saiful Islam" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">ইমেইল অ্যাড্রেস *</label>
            <input type="email" id="adm-new-admin-email" required placeholder="admin@dreamcart.bd" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-admin')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">অ্যাকাউন্ট তৈরি করুন</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
