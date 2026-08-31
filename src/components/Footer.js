/**
 * ============================================================================
 * DREAM CART BD — GLOBAL LUXURY FOOTER (Footer.js)
 * ============================================================================
 */

export const Footer = {
  render: () => {
    const currentYear = new Date().getFullYear();

    return `
    <footer class="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-800 font-bengali">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Trust Badges Bar -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-slate-800 text-center sm:text-left">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">১০০% অরিজিনাল পণ্য</h4>
              <p class="text-xs text-slate-500">গ্যারান্টিযুক্ত সেরা কোয়ালিটি</p>
            </div>
          </div>

          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <i data-lucide="truck" class="w-6 h-6"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">দ্রুত ডেলিভারি</h4>
              <p class="text-xs text-slate-500">সারা বাংলাদেশে হোম ডেলিভারি</p>
            </div>
          </div>

          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <i data-lucide="refresh-cw" class="w-6 h-6"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">সহজ রিটার্ন পলিসি</h4>
              <p class="text-xs text-slate-500">৭ দিনের মধ্যে রিটার্ন সুবিধা</p>
            </div>
          </div>

          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <i data-lucide="headphones" class="w-6 h-6"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">২৪/৭ কাস্টমার সাপোর্ট</h4>
              <p class="text-xs text-slate-500">যেকোনো প্রয়োজনে পাশে আছি</p>
            </div>
          </div>
        </div>

        <!-- 4-Column Main Footer Links -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          
          <!-- Brand Info -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
                <i data-lucide="shopping-bag" class="w-5 h-5"></i>
              </div>
              <span class="text-2xl font-extrabold text-white tracking-tight">Dream Cart BD</span>
            </div>
            <p class="text-sm text-slate-400 leading-relaxed pr-6">
              Dream Cart BD বাংলাদেশের অন্যতম স্মার্ট ও নির্ভরযোগ্য ডিজিটাল কমার্স প্ল্যাটফর্ম। কোয়ালিটি পণ্য ও দ্রুততম ডেলিভারি নিশ্চিত করাই আমাদের প্রধান লক্ষ্য।
            </p>
            <div class="pt-2 text-sm space-y-2">
              <p class="flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-brand-400"></i> ঢাকা, বাংলাদেশ</p>
              <p class="flex items-center gap-2"><i data-lucide="phone" class="w-4 h-4 text-brand-400"></i> +880 1700-000000</p>
              <p class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4 text-brand-400"></i> support@dreamcartbd.com</p>
            </div>
          </div>

          <!-- Quick Navigation -->
          <div>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4">কুইক লিঙ্কস</h4>
            <ul class="space-y-2.5 text-sm">
              <li><a href="/" class="hover:text-brand-400 transition-colors">হোম পেজ</a></li>
              <li><a href="/products" class="hover:text-brand-400 transition-colors">সমস্ত প্রোডাক্ট</a></li>
              <li><a href="/track-order" class="hover:text-brand-400 transition-colors">অর্ডার ট্র্যাকিং</a></li>
              <li><a href="/login" class="hover:text-brand-400 transition-colors">কাস্টমার অ্যাকাউন্ট</a></li>
              <li><a href="/admin/products" class="hover:text-brand-400 transition-colors">এডমিন প্যানেল</a></li>
            </ul>
          </div>

          <!-- Customer Service -->
          <div>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4">গ্রাহক সেবা</h4>
            <ul class="space-y-2.5 text-sm">
              <li><a href="/privacy-policy" class="hover:text-brand-400 transition-colors">প্রাইভেসি পলিসি</a></li>
              <li><a href="/terms" class="hover:text-brand-400 transition-colors">শর্তাবলী</a></li>
              <li><a href="/refund-policy" class="hover:text-brand-400 transition-colors">রিটার্ন ও রিফান্ড</a></li>
              <li><a href="/shipping-policy" class="hover:text-brand-400 transition-colors">ডেলিভারি তথ্য</a></li>
              <li><a href="/faq" class="hover:text-brand-400 transition-colors">সাধারণ জিজ্ঞাসা (FAQ)</a></li>
            </ul>
          </div>

          <!-- Partner Portals -->
          <div>
            <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4">পার্টনার হাব</h4>
            <ul class="space-y-2.5 text-sm">
              <li><a href="/partner/seller" class="hover:text-brand-400 transition-colors">সেলার পোর্টাল</a></li>
              <li><a href="/partner/reseller" class="hover:text-brand-400 transition-colors">রিসেলার হাব</a></li>
              <li><a href="/partner/wholesale" class="hover:text-brand-400 transition-colors">হোলসেল অর্ডার</a></li>
            </ul>
          </div>

        </div>

        <!-- Bottom Copyright & Payment Methods -->
        <div class="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© ${currentYear} Dream Cart BD. সর্বস্বত্ব সংরক্ষিত।</p>
          <div class="flex items-center gap-3 text-slate-400">
            <span class="bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">bKash</span>
            <span class="bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">Nagad</span>
            <span class="bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">Rocket</span>
            <span class="bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">Cash On Delivery</span>
          </div>
        </div>

      </div>
    </footer>
    `;
  }
};

// গ্লোবাল উইন্ডোতে সেট করা
if (typeof window !== "undefined") {
  window.Footer = Footer;
}

// Default export যুক্ত করা হয়েছে
export default Footer;
