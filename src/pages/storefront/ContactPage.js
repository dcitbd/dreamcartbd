/**
 * DREAM CART BD — CONTACT & STORE LOCATION PAGE
 * Full official contact directory, office address, customer support, shop owners,
 * payment accounts, and lead developer credentials.
 */

export function renderContactPage() {
  return `
    <div class="max-w-5xl mx-auto space-y-10 pb-20">
      
      <!-- Page Hero Header -->
      <div class="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 md:p-12 rounded-3xl border border-emerald-700/50 shadow-xl relative overflow-hidden">
        <div class="relative z-10 max-w-2xl space-y-3">
          <span class="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            আমাদের সাথে যোগাযোগ
          </span>
          <h1 class="text-3xl md:text-4xl font-black tracking-tight">Contact & Store Information</h1>
          <p class="text-sm text-slate-200 leading-relaxed">
            যেকোনো তথ্য, অর্ডার অনুসন্ধান, পাইকারি কেনাকাটা বা কাস্টমার সাপোর্টের জন্য আমাদের সাথে নির্দ্বিধায় যোগাযোগ করুন।
          </p>
        </div>
      </div>

      <!-- Main Info Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Store Address & Hours Card -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
            📍
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">আমাদের আউটলেট ও অফিস</h3>
            <p class="text-xs text-slate-500 mt-1">সরাসরি পরিদর্শন ও প্রোডাক্ট সংগ্রহের ঠিকানা</p>
          </div>
          <div class="text-xs text-slate-700 space-y-2 border-t border-slate-100 pt-3 leading-relaxed">
            <p><strong>Shop Name:</strong> Dream Cart BD</p>
            <p><strong>Address:</strong> Chawdhury Plaza, ground floor, room#03, Paduar Bazar, Bishwa Road, Sadar Dakshin, Cumilla-3500.</p>
            <p><strong>Office Time:</strong> Every Day 8:00 AM to 10:00 PM</p>
            <p><strong>Delivery Area:</strong> Whole Bangladesh (সারা বাংলাদেশ)</p>
          </div>
        </div>

        <!-- Phone & WhatsApp Hotline Card -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
            📞
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">ফোন ও হোয়াটসঅ্যাপ হটলাইন</h3>
            <p class="text-xs text-slate-500 mt-1">তাৎক্ষণিক সহায়তার জন্য কল বা মেসেজ দিন</p>
          </div>
          <div class="text-xs text-slate-700 space-y-3 border-t border-slate-100 pt-3">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <div class="text-[11px] text-slate-500">হটলাইন ১ (WhatsApp):</div>
                <a href="tel:01581703822" class="font-mono font-bold text-sm text-slate-900 hover:text-emerald-600">01581703822</a>
              </div>
              <a href="https://wa.me/8801581703822" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition">
                WhatsApp Chat
              </a>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <div class="text-[11px] text-slate-500">হটলাইন ২ (WhatsApp):</div>
                <a href="tel:01818273838" class="font-mono font-bold text-sm text-slate-900 hover:text-emerald-600">01818273838</a>
              </div>
              <a href="https://wa.me/8801818273838" target="_blank" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition">
                WhatsApp Chat
              </a>
            </div>
          </div>
        </div>

        <!-- Shop Ownership Card -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
            👑
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">মালিকানা ও ব্যবস্থাপনা</h3>
            <p class="text-xs text-slate-500 mt-1">Dream Cart BD অফিশিয়াল স্বত্বাধিকারী</p>
          </div>
          <div class="text-xs text-slate-700 space-y-3 border-t border-slate-100 pt-3">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div class="text-[11px] text-slate-500">Shop Owner 1:</div>
              <div class="font-bold text-slate-900 text-sm">Jainal Abedin</div>
              <div class="text-[11px] text-emerald-700 font-semibold">Founder & Partner</div>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div class="text-[11px] text-slate-500">Shop Owner 2:</div>
              <div class="font-bold text-slate-900 text-sm">MD. Saiful Islam</div>
              <div class="text-[11px] text-emerald-700 font-semibold">Partner & Operations Lead</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Payment & Banking Directory Section -->
      <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 class="text-xl font-black text-slate-900">অফিসিয়াল পেমেন্ট মেথড ও অ্যাকাউন্ট তথ্য</h2>
          <p class="text-xs text-slate-500 mt-1">অনলাইনে পেমেন্ট করলে পাবেন ৫% ক্যাশব্যাক/ডিসকাউন্ট সুবিধা</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <!-- bKash Merchant -->
          <div class="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-xs space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-black text-pink-700 text-sm">bKash Merchant Payment</span>
              <span class="badge badge-warning text-[10px]">৫% ছাড়</span>
            </div>
            <p class="text-slate-600">মার্চেন্ট পেমেন্ট নম্বর:</p>
            <div class="font-mono font-black text-base text-pink-800 bg-white p-2 rounded-lg border border-pink-300">
              01581703822
            </div>
            <a href="https://shop.bkash.com/j-a-sagor-computer01581703822/paymentlink" target="_blank" class="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition mt-1">
              অনলাইন পেমেন্ট গেটওয়ে লিংক →
            </a>
          </div>

          <!-- bKash Personal -->
          <div class="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-xs space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-black text-pink-700 text-sm">bKash Personal</span>
              <span class="badge badge-warning text-[10px]">৫% ছাড়</span>
            </div>
            <p class="text-slate-600">বিকাশ পার্সোনাল (Send Money):</p>
            <div class="font-mono font-black text-base text-pink-800 bg-white p-2 rounded-lg border border-pink-300">
              01879653143
            </div>
          </div>

          <!-- Nagad Personal -->
          <div class="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-black text-orange-700 text-sm">Nagad Personal</span>
              <span class="badge badge-warning text-[10px]">৫% ছাড়</span>
            </div>
            <p class="text-slate-600">নগদ পার্সোনাল (Send Money):</p>
            <div class="font-mono font-black text-base text-orange-800 bg-white p-2 rounded-lg border border-orange-300">
              01879653143
            </div>
          </div>

          <!-- Rocket Personal -->
          <div class="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-black text-purple-700 text-sm">Rocket Personal</span>
              <span class="badge badge-warning text-[10px]">৫% ছাড়</span>
            </div>
            <p class="text-slate-600">রকেট পার্সোনাল (Send Money):</p>
            <div class="font-mono font-black text-base text-purple-800 bg-white p-2 rounded-lg border border-purple-300">
              01581703822
            </div>
          </div>

          <!-- Bank Account -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 md:col-span-2">
            <div class="flex justify-between items-center">
              <span class="font-black text-slate-900 text-sm">Bank Account (Islami Bank Bangladesh PLC)</span>
              <span class="badge badge-success text-[10px]">৫% ছাড়</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div><strong>Account Name:</strong> Jainal Abedin</div>
              <div><strong>Account Number:</strong> <span class="font-mono font-bold text-emerald-800 text-xs">20508070200030208</span></div>
              <div><strong>Branch:</strong> Maheshkhali Sub branch</div>
              <div><strong>Routing Number:</strong> 125260525</div>
              <div><strong>Swift/Code:</strong> IBBLBDDH</div>
              <div><strong>Bank:</strong> Islami Bank Bangladesh PLC</div>
            </div>
          </div>

        </div>
      </div>

      <!-- Developer Credentials & Technology Provider Card -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img 
            src="https://scontent.fdac24-5.fna.fbcdn.net/v/t39.99422-6/748763443_1355179329312781_3762544494183960829_n.png?stp=dst-jpg_tt6&cstp=mx876x1414&ctp=s876x1414&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEgpskzgAVWN3ZiohXZA-RhiddumrjTx6WJ126auNPHpRbk_pIDiYLXfo5UR9FYrkKKGwNHxgicb8fdqAfCdAzm&_nc_ohc=ulolVsVxolUQ7kNvwFbbn_s&_nc_oc=Adqwy7DrnjEKjOAfZPttbAGnlBGmXslovULfm4dCZditFerwrSiULyvnQBwCwT-ctOY&_nc_zt=14&_nc_ht=scontent.fdac24-5.fna&_nc_gid=QjQg-WZiaHQGDcl9YGAVCA&_nc_ss=7b2a8&oh=00_AQOthzROIPmAhM-IMyLs5b5IxRzmoCsj5_Ucs02h26YSdw&oe=6AC34270" 
            alt="Jainal Abedin" 
            class="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-400 shadow-xl"
            onerror="this.style.display='none'"
          />
          <div class="space-y-2 text-center sm:text-left flex-1">
            <span class="badge badge-success text-[10px] uppercase font-bold tracking-wider">Developer Profile</span>
            <h3 class="text-2xl font-black text-white">Jainal Abedin</h3>
            <p class="text-emerald-400 text-xs font-bold">CEO, Dream Career IT BD</p>
            <p class="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Lead Software Engineer & Solution Architect for the Dream Cart BD platform. Specializing in high-performance digital commerce engines, Google Workspace cloud integrations, and secure payment workflows.
            </p>
            <div class="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
              <a href="https://dcitbd.github.io/Jainal-Abedin/" target="_blank" class="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-md">
                <span>🌐</span> Developer Website
              </a>
              <a href="https://dcitbd.github.io/dcitbd/" target="_blank" class="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs py-2 px-4 inline-flex items-center gap-1.5">
                <span>🏢</span> Dream Career IT BD
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}
