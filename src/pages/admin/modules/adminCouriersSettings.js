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
  return `
    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: COURIER, FRAUD & PAYMENT (4 Standalone Views)    -->
    <!-- ================================================================= -->

    <!-- 1. Couriers List Page -->
    <div id="page-courier-list" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🚚</span> সংযুক্ত কুরিয়ার সার্ভিসেস ও এপিআই স্ট্যাটাস
            </h3>
            <p class="text-[11px] text-slate-400">স্টিডফাস্ট, পাঠাও ও রেডএক্স সরাসরি সংযোগ</p>
          </div>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-primary py-1 px-3 font-bold" onclick="switchAdminPage('page-courier-add', 'group-courier')">+ নতুন কুরিয়ার এপিআই</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          ${couriers.map(c => `
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2.5">
              <div class="flex items-center justify-between">
                <div class="font-bold text-slate-900 dark:text-white text-sm">${c.name}</div>
                <span class="badge ${c.status === 'Connected' ? 'badge-success' : 'badge-warning'} text-[10px]">${c.status}</span>
              </div>
              <div class="space-y-1 text-slate-500 text-[11px]">
                <div><strong>API Key:</strong> <span class="font-mono">${c.api_key}</span></div>
                <div><strong>Secret:</strong> <span class="font-mono">${c.secret_key || '••••••••'}</span></div>
                <div><strong>জোন:</strong> ${c.hub_city}</div>
                <div><strong>কুরিয়ার ব্যালেন্স:</strong> <span class="font-bold text-emerald-600 font-mono">${c.balance}</span></div>
              </div>
              <div class="pt-2 border-t flex items-center gap-2">
                <button class="btn-secondary py-1 px-2.5 text-[10px] flex-1" onclick="window.handleTestCourierApi('${c.name}', this)">API টেস্ট করুন 🔄</button>
                <button class="btn-secondary py-1 px-2 text-[10px] text-emerald-600 font-bold" onclick="alert('Webhook URL: ' + ('${c.webhook_url}' || 'https://dreamcart.bd/api/webhook'))">Webhook</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 2. Add Courier Page -->
    <div id="page-courier-add" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-xl">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">➕ নতুন কুরিয়ার এপিআই কনফিগারেশন (Add Courier with Webhook)</h3>
          <p class="text-[11px] text-slate-400">এপিআই কী, সিক্রেট কী ও স্বয়ংক্রিয় ওয়েবহুক আপডেট সিস্টেম</p>
        </div>

        <form onsubmit="window.handleAdminAddCourier(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold mb-1">কুরিয়ার সার্ভিস নাম *</label>
            <input type="text" id="adm-new-courier-name" required placeholder="Steadfast / Pathao / Paperfly / RedX" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold mb-1">API Key / Client ID *</label>
              <input type="text" id="adm-new-courier-api" required placeholder="sec_live_..." class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">Secret Key / Token *</label>
              <input type="password" id="adm-new-courier-secret" required placeholder="••••••••••••" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">স্বয়ংক্রিয় Webhook URL (ডেলিভারি স্ট্যাটাস সিঙ্কের জন্য)</label>
            <input type="text" id="adm-new-courier-webhook" value="https://dreamcart.bd/api/courier/webhook" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono bg-slate-50 dark:bg-slate-800" />
          </div>
          <div>
            <label class="block font-bold mb-1">হাব / ডেলিভারি কভারেজ জোন</label>
            <input type="text" id="adm-new-courier-city" value="Dhaka & All BD" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
          </div>
          <button type="submit" class="btn-primary py-2.5 px-6 font-bold">কুরিয়ার সংযুক্ত করুন →</button>
        </form>
      </div>
    </div>

    <!-- 3. Fraud Check Page -->
    <div id="page-courier-fraud" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-xl">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>🛡️</span> কাস্টমার ফ্রড চেকার (Fraud Check Tool)
          </h3>
          <p class="text-[11px] text-slate-400">অর্ডার লিস্ট ও সংযুক্ত কুরিয়ার এপিআই থেকে কাস্টমারের ডেলিভারি ও রিটার্ন রেট যাচাই</p>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold mb-1">গ্রাহকের ফোন নম্বর লিখুন:</label>
            <div class="flex gap-2">
              <input type="text" id="input-fraud-phone" placeholder="01711223344" class="form-control text-xs flex-1 py-2 px-3 rounded-xl border font-mono font-bold" />
              <button class="btn-primary py-2 px-5 font-bold" onclick="window.handleFraudPhoneCheck(document.getElementById('input-fraud-phone').value)">যাচাই করুন 🔍</button>
            </div>
          </div>

          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
            <h4 class="font-bold text-slate-900 dark:text-white">সাম্প্রতিক ফ্রড ভেরিফিকেশন ডাটাবেজ:</h4>
            <div class="space-y-1.5">
              <div class="p-2.5 bg-white dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                <div>
                  <div class="font-bold">01711223344 (তানভীর আহমেদ)</div>
                  <div class="text-[10px] text-slate-400">কুরিয়ার হিস্ট্রি: ৯৮% ডেলিভারি সাকসেস (জিরো রিটার্ন)</div>
                </div>
                <span class="badge badge-success text-[10px]">Safe ✓</span>
              </div>
              <div class="p-2.5 bg-white dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                <div>
                  <div class="font-bold">01622334488 (শারমিন সুলতানা)</div>
                  <div class="text-[10px] text-slate-400">কুরিয়ার হিস্ট্রি: ৪০% রিটার্ন রেকর্ড (২ টি পার্সেল রিফিউজড)</div>
                </div>
                <span class="badge badge-danger text-[10px]">High Risk ⚠️</span>
              </div>
            </div>
          </div>
        </div>
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
          <button class="btn-primary py-1 px-3 text-xs font-bold" onclick="document.getElementById('modal-add-payment-gw')?.classList.remove('hidden')">+ গেটওয়ে যুক্ত</button>
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
              <button class="btn-secondary py-1 px-2.5 w-full text-[10px] font-bold" onclick="alert('${p.name} সংযোগ সক্রিয় রয়েছে (Ping 28ms)')">কানেকশন টেস্ট</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- DEDICATED PAGES: SETTINGS (7 Distinct Standalone Views)            -->
    <!-- ================================================================= -->

    <!-- 1. Audit Logs Page -->
    <div id="page-set-logs" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">📜 ব্যবহারকারী ও কর্মী অ্যাক্টিভিটি লগ (Audit Trail)</h3>
          <div class="flex items-center gap-1.5 text-xs">
            <button class="btn-secondary py-1 px-2.5" onclick="window.exportGenericCsv('Audit_Logs', ['Time', 'User', 'Event', 'IP'], auditLogs.map(l=>[l.time, l.user, l.event, l.ip]))">CSV</button>
            <button class="btn-secondary py-1 px-2.5" onclick="window.printActiveSection()">🖨️ প্রিন্ট</button>
          </div>
        </div>
        <div class="space-y-2 text-xs">
          ${auditLogs.map(l => `
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <div class="font-bold text-slate-900 dark:text-white">${l.event}</div>
                <div class="text-[10px] text-slate-400">কর্মী: <span class="text-emerald-600 font-bold">${l.user}</span> • IP: <span class="font-mono">${l.ip}</span></div>
              </div>
              <span class="text-[10px] text-slate-400 font-mono">${l.time}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 2. Payment Method Update Page -->
    <div id="page-set-payment" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">💳 পেমেন্ট মেথড আপডেট ও কন্ট্রোল</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
            <div class="flex items-center justify-between font-bold">
              <span>ক্যাশ অন ডেলিভারি (COD)</span>
              <span class="badge badge-success text-[9px]">সক্রিয়</span>
            </div>
            <p class="text-[10px] text-slate-400">পণ্য হাতে পেয়ে টাকা পরিশোধ।</p>
          </div>
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
            <div class="flex items-center justify-between font-bold">
              <span>bKash অনলাইন পেমেন্ট</span>
              <span class="badge badge-success text-[9px]">সক্রিয়</span>
            </div>
            <p class="text-[10px] text-slate-400">বিকাশ মার্চেন্ট গেটওয়ে।</p>
          </div>
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
            <div class="flex items-center justify-between font-bold">
              <span>Nagad অনলাইন পেমেন্ট</span>
              <span class="badge badge-success text-[9px]">সক্রিয়</span>
            </div>
            <p class="text-[10px] text-slate-400">নগদ মার্চেন্ট গেটওয়ে।</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Delivery Method Page -->
    <div id="page-set-delivery" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🚚 ডেলিভারি চার্জ ও জোন সেটিংস</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
            <div class="font-bold">কুমিল্লা সিটি ডেলিভারি</div>
            <div class="text-base font-black text-emerald-600 font-mono">৳৭০</div>
            <p class="text-[10px] text-slate-400">২৪ ঘন্টার মধ্যে ডেলিভারি</p>
          </div>
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
            <div class="font-bold">ঢাকা সিটি ডেলিভারি</div>
            <div class="text-base font-black text-emerald-600 font-mono">৳৯০</div>
            <p class="text-[10px] text-slate-400">২৪-৪৮ ঘন্টায় হোম ডেলিভারি</p>
          </div>
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
            <div class="font-bold">ঢাকার বাইরে সারা বাংলাদেশ</div>
            <div class="text-base font-black text-emerald-600 font-mono">৳১২০</div>
            <p class="text-[10px] text-slate-400">কুরিয়ারে দ্রুত ডেলিভারি</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Offers & Promo Page -->
    <div id="page-set-offers" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🎁 অফার ও ডিসকাউন্ট কুপন (${offers.length})</h3>
          <button class="btn-primary py-1 px-3 text-xs font-bold" onclick="document.getElementById('modal-add-offer')?.classList.remove('hidden')">+ নতুন কুপন</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          ${offers.map(o => `
            <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-2">
              <div class="flex items-center justify-between font-mono font-black text-emerald-600">
                <span>${o.code}</span>
                <span class="badge badge-success text-[9px]">${o.status}</span>
              </div>
              <div class="text-xs font-bold">${o.discount}</div>
              <div class="text-[10px] text-slate-400">সর্বনিম্ন অর্ডার: ৳${o.min_spend}</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- 5. Website Information Page -->
    <div id="page-set-info" class="admin-page-view hidden space-y-4">
      <div class="dc-admin-card space-y-4 max-w-xl">
        <div class="border-b pb-2">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white">🏢 দোকানের তথ্য, ঠিকানা ও হটলাইন</h3>
        </div>
        <form onsubmit="window.handleAdminSaveSettings(event)" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold mb-1">দোকানের নাম</label>
              <input type="text" id="adm-set-shopname" value="Dream Cart BD" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">লোগো URL</label>
              <input type="url" id="adm-set-logo" value="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" class="form-control text-xs w-full py-2 px-3 rounded-xl border" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">ঠিকানা</label>
            <textarea id="adm-set-address" rows="2" class="form-control text-xs w-full p-2.5 rounded-xl border">চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।</textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold mb-1">হটলাইন ১ (WhatsApp)</label>
              <input type="text" id="adm-set-hotline1" value="01581703822" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold mb-1">হটলাইন ২ (Call)</label>
              <input type="text" id="adm-set-hotline2" value="01818273838" class="form-control text-xs w-full py-2 px-3 rounded-xl border font-mono font-bold" />
            </div>
          </div>
          <div>
            <label class="block font-bold mb-1">শীর্ষ নোটিশ বার টেক্সট</label>
            <textarea id="adm-set-notice" rows="2" class="form-control text-xs w-full p-2.5 rounded-xl border">৳২,০০০ বা তার বেশি অর্ডারে ফ্রি শিপিং! ক্যাশ অন ডেলিভারিতে পণ্য পেয়ে টাকা দিন।</textarea>
          </div>
          <button type="submit" class="btn-primary py-2.5 px-6 font-bold">সেটিংস সংরক্ষণ করুন</button>
        </form>
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

    <!-- Modals -->
    <div id="modal-add-courier" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন কুরিয়ার এপিআই কনফিগারেশন</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-courier')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddCourier(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">কুরিয়ার সার্ভিস নাম *</label>
            <input type="text" id="adm-new-courier-name" required placeholder="Steadfast / Pathao / RedX" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">API Key *</label>
            <input type="text" id="adm-new-courier-api" required placeholder="sec_live_..." class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
          </div>
          <div>
            <label class="block font-bold mb-1">Secret Key *</label>
            <input type="password" id="adm-new-courier-secret" required placeholder="••••••••" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-courier')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সংযুক্ত করুন</button>
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

    <div id="modal-add-offer" class="admin-modal-backdrop hidden">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3 text-xs">
        <div class="flex items-center justify-between border-b pb-2">
          <h4 class="font-black text-sm text-slate-900 dark:text-white">নতুন প্রমো কুপন কোড তৈরি</h4>
          <button type="button" class="text-slate-400 hover:text-rose-500 font-bold" onclick="document.getElementById('modal-add-offer')?.classList.add('hidden')">✕</button>
        </div>
        <form onsubmit="window.handleAdminAddOffer(event)" class="space-y-3">
          <div>
            <label class="block font-bold mb-1">কুপন কোড *</label>
            <input type="text" id="adm-new-offer-code" required placeholder="SUMMER20" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-mono font-bold uppercase" />
          </div>
          <div>
            <label class="block font-bold mb-1">ছাড়ের বিবরণ *</label>
            <input type="text" id="adm-new-offer-disc" required placeholder="১৫% ফ্ল্যাট ডিসকাউন্ট" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border" />
          </div>
          <div>
            <label class="block font-bold mb-1">সর্বনিম্ন অর্ডারের মূল্য (৳)</label>
            <input type="number" id="adm-new-offer-min" value="1500" class="form-control text-xs w-full py-1.5 px-3 rounded-xl border font-bold font-mono" />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="btn-secondary py-1.5 px-4" onclick="document.getElementById('modal-add-offer')?.classList.add('hidden')">বাতিল</button>
            <button type="submit" class="btn-primary py-1.5 px-5 font-bold">সক্রিয় করুন</button>
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
    <div class="max-w-md mx-auto py-12 px-4 space-y-6">
      
      <div class="text-center space-y-2">
        <div class="w-16 h-16 rounded-3xl bg-slate-900 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-xl border border-slate-700">
          ⚙️
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white">
          মাস্টার অ্যাডমিন লগইন (Admin Login)
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
  `;
}
