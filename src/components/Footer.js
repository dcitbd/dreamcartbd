/**
 * DREAM CART BD — MODERN E-COMMERCE FOOTER COMPONENT (Footer.js)
 * Implements user requirements:
 * - Ultra-modern, high-contrast aesthetics with luxurious dark atmosphere
 * - High readability: Crisp pure white headings, soft slate text, glowing emerald accents
 * - Top Trust Highlights banner (Fast delivery, 100% authentic, secure gateway, 24/7 support)
 * - Organized 4-column layout (Brand info, Main pages, Portal links, Office & Contacts)
 * - Signature branded payment method badges (COD, bKash, Nagad, Rocket, Bank, Card)
 * - Bottom legal & developer credit bar with proper mobile bottom nav clearance (pb-28 sm:pb-12)
 * - Scoped CSS styles for flawless cross-device presentation (Mobile, Tablet, Laptop, Desktop, TV)
 */

export function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <!-- Scoped Styles for High-Contrast, Premium Footer -->
    <style id="footer-custom-styles">
      .site-footer {
        background: radial-gradient(circle at 50% 0%, #0f172a 0%, #020617 100%) !important;
        color: #cbd5e1 !important;
        border-top: 1px solid #1e293b !important;
        position: relative !important;
        overflow: hidden !important;
        padding-top: 48px !important;
        padding-bottom: 96px !important; /* Space for mobile nav bar */
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
      }
      @media (min-width: 640px) {
        .site-footer {
          padding-top: 56px !important;
          padding-bottom: 48px !important;
        }
      }

      /* Glowing Top Border Accent */
      .ft-top-glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #10b981 0%, #14b8a6 40%, #6366f1 80%, #10b981 100%);
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
      }

      /* Trust Highlights Grid */
      .ft-trust-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 16px;
        padding-bottom: 40px;
        margin-bottom: 40px;
        border-bottom: 1px solid #1e293b;
      }
      @media (min-width: 640px) {
        .ft-trust-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 1024px) {
        .ft-trust-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }
      .ft-trust-card {
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid #1e293b;
        border-radius: 16px;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        gap: 14px;
        transition: all 0.25s ease;
      }
      .ft-trust-card:hover {
        background: rgba(30, 41, 59, 0.6);
        border-color: #059669;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      }
      .ft-trust-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #34d399;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }
      .ft-trust-title {
        color: #ffffff;
        font-size: 13.5px;
        font-weight: 800;
        margin-bottom: 2px;
        line-height: 1.3;
      }
      .ft-trust-desc {
        color: #94a3b8;
        font-size: 11px;
        line-height: 1.4;
      }

      /* Column Headings */
      .ft-col-title {
        color: #ffffff;
        font-size: 14.5px;
        font-weight: 800;
        letter-spacing: 0.02em;
        margin-bottom: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
      }
      .ft-col-title::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 0;
        width: 28px;
        height: 2px;
        background: #10b981;
        border-radius: 2px;
      }

      /* Column Links */
      .ft-link-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .ft-link-item {
        color: #94a3b8;
        font-size: 12.5px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }
      .ft-link-item:hover {
        color: #34d399;
        transform: translateX(4px);
      }

      /* Brand Column */
      .ft-logo-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        margin-bottom: 14px;
      }
      .ft-logo-img-box {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: #ffffff;
        padding: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
      .ft-brand-title {
        font-size: 20px;
        font-weight: 900;
        color: #ffffff;
        letter-spacing: -0.02em;
        line-height: 1.1;
      }
      .ft-brand-accent {
        color: #34d399;
      }
      .ft-brand-tagline {
        font-size: 9.5px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #34d399;
      }
      .ft-brand-desc {
        color: #94a3b8;
        font-size: 12px;
        line-height: 1.6;
        margin-bottom: 14px;
      }
      .ft-brand-slogan-pill {
        display: inline-block;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #6ee7b7;
        font-size: 11px;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 9999px;
        margin-bottom: 16px;
      }

      /* Social Buttons */
      .ft-social-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ft-social-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: #0f172a;
        border: 1px solid #1e293b;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        transition: all 0.2s ease;
      }
      .ft-social-btn:hover {
        transform: translateY(-2px);
        color: #ffffff;
      }
      .ft-social-btn.fb:hover { background: #1877f2; border-color: #1877f2; }
      .ft-social-btn.wa:hover { background: #25d366; border-color: #25d366; }
      .ft-social-btn.yt:hover { background: #ff0000; border-color: #ff0000; }
      .ft-social-btn.dc:hover { background: #059669; border-color: #059669; }

      /* Contact Column Cards */
      .ft-contact-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 14px;
        font-size: 12px;
        color: #cbd5e1;
        line-height: 1.5;
      }
      .ft-contact-icon {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
        border: 1px solid rgba(16, 185, 129, 0.25);
      }
      .ft-contact-val-link {
        color: #ffffff;
        font-weight: 700;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .ft-contact-val-link:hover {
        color: #34d399;
      }

      /* Payment Methods Strip */
      .ft-payment-strip {
        padding: 24px 0;
        border-top: 1px solid #1e293b;
        border-bottom: 1px solid #1e293b;
        margin-top: 36px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      @media (min-width: 768px) {
        .ft-payment-strip {
          flex-direction: row;
        }
      }
      .ft-payment-title {
        font-size: 12.5px;
        font-weight: 700;
        color: #e2e8f0;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ft-payment-badges-wrap {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .ft-pay-badge {
        padding: 5px 12px;
        border-radius: 8px;
        font-size: 11.5px;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid;
        transition: transform 0.15s ease;
      }
      .ft-pay-badge:hover {
        transform: translateY(-1px);
      }
      .ft-pay-cod {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.4);
      }
      .ft-pay-bkash {
        background: rgba(226, 19, 110, 0.15);
        color: #f472b6;
        border-color: rgba(226, 19, 110, 0.4);
      }
      .ft-pay-nagad {
        background: rgba(247, 148, 29, 0.15);
        color: #fb923c;
        border-color: rgba(247, 148, 29, 0.4);
      }
      .ft-pay-rocket {
        background: rgba(140, 52, 148, 0.18);
        color: #c084fc;
        border-color: rgba(140, 52, 148, 0.4);
      }
      .ft-pay-bank {
        background: rgba(2, 132, 199, 0.15);
        color: #38bdf8;
        border-color: rgba(2, 132, 199, 0.4);
      }
      .ft-pay-card {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.4);
      }

      /* Bottom Bar */
      .ft-bottom-bar {
        padding-top: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        font-size: 12px;
        color: #94a3b8;
      }
      @media (min-width: 768px) {
        .ft-bottom-bar {
          flex-direction: row;
        }
      }
      .ft-bottom-legal {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .ft-bottom-legal a {
        color: #94a3b8;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .ft-bottom-legal a:hover {
        color: #34d399;
      }
      .ft-dev-credit {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid #1e293b;
        padding: 5px 14px;
        border-radius: 9999px;
        font-size: 11.5px;
      }
      .ft-dev-credit a {
        color: #34d399;
        font-weight: 700;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .ft-dev-credit a:hover {
        color: #6ee7b7;
        text-decoration: underline;
      }
    </style>

    <footer class="site-footer">
      
      <!-- Top Glowing Shimmer Line -->
      <div class="ft-top-glow"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- 1. Top Trust Highlights Banner -->
        <div class="ft-trust-grid">
          
          <div class="ft-trust-card">
            <div class="ft-trust-icon-box">🚚</div>
            <div>
              <h5 class="ft-trust-title">দ্রুততম হোম ডেলিভারি</h5>
              <p class="ft-trust-desc">সমগ্র বাংলাদেশে নির্ভরযোগ্য ক্যাশ অন ডেলিভারি</p>
            </div>
          </div>

          <div class="ft-trust-card">
            <div class="ft-trust-icon-box">🛡️</div>
            <div>
              <h5 class="ft-trust-title">১০০% অথেন্টিক প্রোডাক্ট</h5>
              <p class="ft-trust-desc">সরাসরি আমদানিকারকদের থেকে পরীক্ষিত পণ্য</p>
            </div>
          </div>

          <div class="ft-trust-card">
            <div class="ft-trust-icon-box">💳</div>
            <div>
              <h5 class="ft-trust-title">নিরাপদ পেমেন্ট মাধ্যম</h5>
              <p class="ft-trust-desc">বিকাশ, নগদ, রকেট ও ব্যাংক ট্রান্সফারে ৫% ছাড়</p>
            </div>
          </div>

          <div class="ft-trust-card">
            <div class="ft-trust-icon-box">💬</div>
            <div>
              <h5 class="ft-trust-title">সার্বক্ষণিক কাস্টমার সেবা</h5>
              <p class="ft-trust-desc">যেকোনো তথ্যে কল ও হোয়াটসঅ্যাপে সার্বক্ষণিক সাপোর্ট</p>
            </div>
          </div>

        </div>

        <!-- 2. Main 4-Column Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-10">
          
          <!-- Column 1: Brand Logo, Slogan, About & Social Channels -->
          <div>
            <a href="/" class="ft-logo-wrap group">
              <div class="ft-logo-img-box">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10" 
                  alt="Dream Cart BD Logo" 
                  class="w-full h-full object-contain rounded-lg"
                  onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
                />
              </div>
              <div>
                <h3 class="ft-brand-title">Dream Cart <span class="ft-brand-accent">BD</span></h3>
                <p class="ft-brand-tagline">Smart Digital Commerce</p>
              </div>
            </a>

            <p class="ft-brand-desc">
              সরাসরি অথেন্টিক ইম্পোর্টারদের কাছ থেকে সংগৃহীত প্রিমিয়াম স্মার্টওয়াচ, গ্যাজেট ও নিত্যপ্রয়োজনীয় ডিজিটাল লাইফস্টাইল পণ্য।
            </p>

            <div class="ft-brand-slogan-pill">
              ✨ Smart Digital Commerce for Modern Living
            </div>

            <!-- Social Connect -->
            <div class="ft-social-row">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="ft-social-btn fb" title="Facebook">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="ft-social-btn wa" title="WhatsApp 1">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.636-.363-.984-.407-1.89-1.282-2.39-2.029-.499-.747-.58-1.468-.58-1.865 0-.417.208-.667.348-.823.14-.156.312-.195.416-.195.104 0 .208.001.299.006.104.005.234-.04.364.271.144.348.49 1.196.532 1.281.042.085.069.185.014.296-.055.111-.083.18-.166.277-.083.097-.175.217-.25.291-.083.084-.17.175-.073.342.097.167.433.714.929 1.155.639.569 1.177.745 1.344.828.167.084.263.07.361-.042.097-.111.416-.486.527-.652.111-.167.222-.139.375-.083.153.055.97.458 1.137.541.167.083.277.125.319.194.042.07.042.404-.102.809z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="ft-social-btn yt" title="YouTube">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://dcitbd.github.io/dcitbd/" target="_blank" rel="noopener noreferrer" class="ft-social-btn dc" title="Dream Career IT BD">
                <span class="text-[11px] font-black text-emerald-400">DC</span>
              </a>
            </div>
          </div>

          <!-- Column 2: Quick Links (প্রয়োজনীয় লিংকসমূহ) -->
          <div>
            <h4 class="ft-col-title">
              <span>🔗</span> প্রয়োজনীয় পেজসমূহ
            </h4>
            <div class="ft-link-list">
              <a href="/" class="ft-link-item"><span>🏠</span> হোম পেজ (Home)</a>
              <a href="/products" class="ft-link-item"><span>🛍️</span> সকল পণ্য (Products)</a>
              <a href="/categories" class="ft-link-item"><span>📂</span> ক্যাটাগরি সমূহ (Categories)</a>
              <a href="/brands" class="ft-link-item"><span>🏷️</span> ব্র্যান্ড সমূহ (Brands)</a>
              <a href="/cart" class="ft-link-item"><span>🛒</span> শপিং কার্ট (Cart)</a>
              <a href="/favourite" class="ft-link-item"><span>❤️</span> পছন্দের তালিকা (Wishlist)</a>
              <a href="/checkout" class="ft-link-item"><span>📝</span> অর্ডার ফর্ম (Checkout)</a>
              <a href="/track" class="ft-link-item"><span>🚚</span> অর্ডার ট্র্যাকিং (Tracking)</a>
            </div>
          </div>

          <!-- Column 3: Portals & Hubs (পোর্টাল ও গ্রাহক সেবা) -->
          <div>
            <h4 class="ft-col-title">
              <span>💼</span> পোর্টাল ও বিশেষ সেবা
            </h4>
            <div class="ft-link-list">
              <a href="/offers" class="ft-link-item"><span>🎁</span> স্পেশাল অফার (Offers)</a>
              <a href="/chat" class="ft-link-item"><span>💬</span> লাইভ চ্যাট সাপোর্ট (Live Chat)</a>
              <a href="/others-market" class="ft-link-item"><span>🌐</span> অন্যান্য মার্কেট (Marketplace)</a>
              <a href="/landing" class="ft-link-item"><span>🚀</span> ক্যাম্পেইন ল্যান্ডিং পেজ</a>
              <a href="/customer/login" class="ft-link-item"><span>👤</span> কাস্টমার পোর্টাল (Login)</a>
              <a href="/reseller/login" class="ft-link-item"><span>💼</span> রিসেলার হাব (Reseller)</a>
              <a href="/wholesaler/login" class="ft-link-item"><span>📦</span> হোলসেলার হাব (Wholesale)</a>
              <a href="/admin/login" class="ft-link-item"><span>⚙️</span> অ্যাডমিন পোর্টাল (Admin)</a>
            </div>
          </div>

          <!-- Column 4: Contact & Office (যোগাযোগ ও অফিস) -->
          <div>
            <h4 class="ft-col-title">
              <span>📍</span> যোগাযোগ ও অফিস
            </h4>

            <div class="space-y-3">
              
              <div class="ft-contact-item">
                <div class="ft-contact-icon">📍</div>
                <div>
                  <strong class="text-white block mb-0.5">অফিসের ঠিকানা:</strong>
                  <span>চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।</span>
                </div>
              </div>

              <div class="ft-contact-item">
                <div class="ft-contact-icon">📞</div>
                <div>
                  <strong class="text-white block mb-0.5">হটলাইন সাপোর্ট:</strong>
                  <div><a href="tel:01581703822" class="ft-contact-val-link">01581703822</a></div>
                  <div><a href="tel:01818273838" class="ft-contact-val-link">01818273838</a></div>
                </div>
              </div>

              <div class="ft-contact-item">
                <div class="ft-contact-icon">✉️</div>
                <div>
                  <strong class="text-white block mb-0.5">ইমেইল যোগাযোগ:</strong>
                  <a href="mailto:jainal.dcitbd@gmail.com" class="ft-contact-val-link">jainal.dcitbd@gmail.com</a>
                </div>
              </div>

              <div class="ft-contact-item">
                <div class="ft-contact-icon">⏰</div>
                <div>
                  <strong class="text-white block mb-0.5">অফিস সময়সূচি:</strong>
                  <span>প্রতিদিন সকাল ৮:০০ - রাত ১০:০০</span>
                  <span class="inline-block bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                    🟢 ওপেন
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- 3. Supported Payment Methods Strip -->
        <div class="ft-payment-strip">
          <div class="ft-payment-title">
            <span>🛡️</span>
            <span>নিরাপদ পেমেন্ট ব্যবস্থা (Supported Payment Methods):</span>
          </div>

          <div class="ft-payment-badges-wrap">
            <span class="ft-pay-badge ft-pay-cod">💵 ক্যাশ অন ডেলিভারি (COD)</span>
            <span class="ft-pay-badge ft-pay-bkash">📱 bKash (বিকাশ)</span>
            <span class="ft-pay-badge ft-pay-nagad">🟠 Nagad (নগদ)</span>
            <span class="ft-pay-badge ft-pay-rocket">🟣 Rocket (রকেট)</span>
            <span class="ft-pay-badge ft-pay-bank">🏦 Bank Transfer (IBBL)</span>
            <span class="ft-pay-badge ft-pay-card">💳 Visa / Mastercard</span>
          </div>
        </div>

        <!-- 4. Bottom Copyright, Legal & Developer Bar -->
        <div class="ft-bottom-bar">
          
          <div>
            &copy; ${currentYear} <strong class="text-white">Dream Cart BD</strong>. সর্বস্বত্ব সংরক্ষিত।
          </div>

          <div class="ft-bottom-legal">
            <a href="/terms">Terms & Conditions</a>
            <span>•</span>
            <a href="/privacy">Privacy Policy</a>
          </div>

          <div class="ft-dev-credit">
            <span>Developer:</span>
            <a href="https://dcitbd.github.io/Jainal-Abedin/" target="_blank" rel="noopener noreferrer">
              Jainal Abedin
            </a>
            <span>(CEO,</span>
            <a href="https://dcitbd.github.io/dcitbd/" target="_blank" rel="noopener noreferrer">
              Dream Career IT BD
            </a>
            <span>)</span>
          </div>

        </div>

      </div>
    </footer>
  `;
}
