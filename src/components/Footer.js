/**
 * DREAM CART BD — FOOTER COMPONENT
 * Complete official shop profile, address, owners, contact details, payment options, bank account, and developer credits.
 */

export function renderFooter() {
  return `
    <footer class="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-12 mt-20 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        <!-- Col 1: Brand & Contact Info -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white p-1 border border-slate-700 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
                alt="Dream Cart BD" 
                class="w-full h-full object-contain rounded-lg"
                onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
              />
            </div>
            <div>
              <span class="text-xl font-black text-white tracking-tight">Dream Cart <span class="text-emerald-400">BD</span></span>
              <p class="text-[11px] text-emerald-400 font-semibold">Trusted Smart Commerce Platform</p>
            </div>
          </div>

          <div class="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
            <p class="flex items-start gap-2">
              <span class="text-emerald-400 flex-shrink-0">👑</span>
              <span><strong>Shop Owners:</strong> Jainal Abedin & MD. Saiful Islam</span>
            </p>
            <p class="flex items-start gap-2">
              <span class="text-emerald-400 flex-shrink-0">📍</span>
              <span><strong>Address:</strong> Chawdhury Plaza, ground floor, room#03, Paduar Bazar, Bishwa Road, Sadar Dakshin, Cumilla-3500.</span>
            </p>
            <p class="flex items-center gap-2">
              <span class="text-emerald-400 flex-shrink-0">📞</span>
              <span><strong>Phone 1:</strong> <a href="tel:01581703822" class="hover:text-emerald-400 transition">01581703822</a> (<a href="https://wa.me/8801581703822" target="_blank" class="text-emerald-400 underline">WhatsApp</a>)</span>
            </p>
            <p class="flex items-center gap-2">
              <span class="text-emerald-400 flex-shrink-0">📞</span>
              <span><strong>Phone 2:</strong> <a href="tel:01818273838" class="hover:text-emerald-400 transition">01818273838</a> (<a href="https://wa.me/8801818273838" target="_blank" class="text-emerald-400 underline">WhatsApp</a>)</span>
            </p>
            <p class="flex items-center gap-2">
              <span class="text-emerald-400 flex-shrink-0">⏰</span>
              <span><strong>Office Time:</strong> Every Day 8:00 AM to 10:00 PM</span>
            </p>
            <p class="flex items-center gap-2">
              <span class="text-emerald-400 flex-shrink-0">🚚</span>
              <span><strong>Delivery Area:</strong> Whole Bangladesh (সারা বাংলাদেশ)</span>
            </p>
          </div>
        </div>

        <!-- Col 2: Customer Care & Quick Links -->
        <div>
          <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">Customer Care</h4>
          <ul class="space-y-2.5 text-xs sm:text-sm text-slate-400">
            <li><a href="#/track" class="hover:text-emerald-400 transition flex items-center gap-1.5"><span>📦</span> Track Your Order</a></li>
            <li><a href="#/shop" class="hover:text-emerald-400 transition flex items-center gap-1.5"><span>🛍️</span> Browse All Products</a></li>
            <li><a href="#/offers" class="hover:text-emerald-400 text-amber-300 transition flex items-center gap-1.5"><span>🔥</span> Exclusive Offers & Discounts</a></li>
            <li><a href="#/contact" class="hover:text-emerald-400 transition flex items-center gap-1.5"><span>📞</span> Contact & Store Location</a></li>
            <li><a href="#/partner" class="hover:text-emerald-400 transition flex items-center gap-1.5"><span>💼</span> Become a Seller / Reseller</a></li>
            <li>
              <a href="https://shop.bkash.com/j-a-sagor-computer01581703822/paymentlink" target="_blank" class="hover:text-pink-400 text-pink-300 font-semibold transition flex items-center gap-1.5 mt-2">
                <span>💳</span> bKash Direct Payment Link →
              </a>
            </li>
          </ul>
        </div>

        <!-- Col 3: Delivery Zones & Offers -->
        <div>
          <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">Delivery & Charges</h4>
          <div class="space-y-2 text-xs text-slate-300 mb-4">
            <div class="flex justify-between items-center py-1 border-b border-slate-800">
              <span>In Cumilla (কুমিল্লা সদর):</span>
              <span class="font-bold text-emerald-400">৳70</span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-slate-800">
              <span>In Dhaka (ঢাকার ভেতরে):</span>
              <span class="font-bold text-emerald-400">৳90</span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-slate-800">
              <span>Out of Dhaka (ঢাকার বাইরে):</span>
              <span class="font-bold text-emerald-400">৳120</span>
            </div>
            <div class="flex justify-between items-center py-1 border-b border-slate-800">
              <span>Office Pickup (অফিস পিকআপ):</span>
              <span class="font-bold text-emerald-400">৳0 (Free)</span>
            </div>
          </div>

          <div class="p-3 bg-emerald-950/60 rounded-xl border border-emerald-700/60 text-xs text-emerald-300 space-y-1">
            <p class="font-bold">🎉 বিশেষ ডেলিভারি অফার:</p>
            <p>২০০০ টাকার বেশি শপিং করলে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</p>
          </div>
          <div class="mt-2 p-2.5 bg-amber-950/40 rounded-xl border border-amber-700/50 text-[11px] text-amber-200">
            ⚡ অনলাইনে পেমেন্ট করলে তাৎক্ষণিক ৫% ডিসকাউন্ট!
          </div>
        </div>

        <!-- Col 4: Payment Accounts & Developer Info -->
        <div>
          <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">Payment & Accounts</h4>
          
          <div class="space-y-2 text-xs text-slate-300 mb-4">
            <div class="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
              <div class="text-pink-400 font-bold flex justify-between">
                <span>bKash Merchant</span>
                <span class="font-mono">01581703822</span>
              </div>
              <div class="text-[11px] text-slate-400">Make Payment / Merchant Pay</div>
            </div>

            <div class="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
              <div class="text-pink-300 font-bold flex justify-between">
                <span>bKash Personal</span>
                <span class="font-mono">01879653143</span>
              </div>
              <div class="text-[11px] text-slate-400">Send Money</div>
            </div>

            <div class="grid grid-cols-2 gap-1.5">
              <div class="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <div class="text-orange-400 font-bold text-[11px]">Nagad Personal</div>
                <div class="font-mono text-[11px] text-slate-300">01879653143</div>
              </div>
              <div class="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                <div class="text-purple-400 font-bold text-[11px]">Rocket Personal</div>
                <div class="font-mono text-[11px] text-slate-300">01581703822</div>
              </div>
            </div>

            <div class="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 text-[11px] space-y-0.5">
              <div class="text-emerald-400 font-bold">Bank Account (Islami Bank PLC):</div>
              <div class="text-slate-300">A/C Name: <strong>Jainal Abedin</strong></div>
              <div class="text-slate-300 font-mono">A/C No: <strong>20508070200030208</strong></div>
              <div class="text-slate-400 text-[10px]">Maheshkhali Sub branch | Routing: 125260525 | IBBLBDDH</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Developer Info Card & Bottom Bar -->
      <div class="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 space-y-6">
        
        <!-- Developer Profile Badge -->
        <div class="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <img 
              src="https://scontent.fdac24-5.fna.fbcdn.net/v/t39.99422-6/748763443_1355179329312781_3762544494183960829_n.png?stp=dst-jpg_tt6&cstp=mx876x1414&ctp=s876x1414&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEgpskzgAVWN3ZiohXZA-RhiddumrjTx6WJ126auNPHpRbk_pIDiYLXfo5UR9FYrkKKGwNHxgicb8fdqAfCdAzm&_nc_ohc=ulolVsVxolUQ7kNvwFbbn_s&_nc_oc=Adqwy7DrnjEKjOAfZPttbAGnlBGmXslovULfm4dCZditFerwrSiULyvnQBwCwT-ctOY&_nc_zt=14&_nc_ht=scontent.fdac24-5.fna&_nc_gid=QjQg-WZiaHQGDcl9YGAVCA&_nc_ss=7b2a8&oh=00_AQOthzROIPmAhM-IMyLs5b5IxRzmoCsj5_Ucs02h26YSdw&oe=6AC34270" 
              alt="Developer Jainal Abedin" 
              class="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-md flex-shrink-0"
              onerror="this.style.display='none'"
            />
            <div>
              <div class="text-xs text-slate-400 uppercase tracking-wider">System Architect & Lead Developer</div>
              <div class="text-sm font-bold text-white flex items-center gap-2">
                <span>Jainal Abedin</span>
                <span class="text-xs text-emerald-400 font-normal">— CEO, Dream Career IT BD</span>
              </div>
              <div class="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-3">
                <a href="https://dcitbd.github.io/Jainal-Abedin/" target="_blank" class="text-emerald-400 hover:underline flex items-center gap-1">
                  <span>🌐</span> Developer Portfolio
                </a>
                <span>•</span>
                <a href="https://dcitbd.github.io/dcitbd/" target="_blank" class="text-emerald-400 hover:underline flex items-center gap-1">
                  <span>🏢</span> Dream Career IT BD Official
                </a>
              </div>
            </div>
          </div>

          <div class="text-xs text-slate-400 text-center sm:text-right">
            <div>Platform Version: <span class="font-mono text-emerald-400 font-bold">2.5.0 Production</span></div>
            <div class="text-[11px] text-slate-500">Built with High-Reliability Architecture</div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4 pt-2">
          <p>© 2026 Dream Cart BD. All rights reserved. Chawdhury Plaza, Sadar Dakshin, Cumilla-3500.</p>
          <div class="flex gap-4">
            <a href="#/" class="hover:text-slate-400">Privacy Policy</a>
            <a href="#/" class="hover:text-slate-400">Terms of Service</a>
            <a href="#/contact" class="hover:text-slate-400">Contact Us</a>
          </div>
        </div>

      </div>
    </footer>
  `;
}
