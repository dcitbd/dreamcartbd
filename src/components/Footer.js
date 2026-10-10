/**
 * DREAM CART BD — COMPACT MODERN FOOTER COMPONENT (Footer.js)
 * Refined per user requirements:
 * - Compact height with optimized padding & margins (zero bulkiness)
 * - Beautiful animated social media icons with smooth bounce, hover glow & scale effects
 * - Perfect color contrast: Deep obsidian slate background (#0a0f1d), pure white headings (#ffffff), soft slate text (#94a3b8 / #cbd5e1), emerald accents (#10b981 / #34d399)
 * - Compact 4-feature Trust Strip (Home delivery, Authentic products, Secure payments, 24/7 support)
 * - Structured 4-column layout with tidy typography and compact link spacing
 * - Branded micro-badges for accepted payment methods (COD, bKash, Nagad, Rocket, Bank, Visa)
 * - Clean bottom legal & developer bar with balanced mobile nav clearance
 */

export function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <!-- Scoped Styles for Compact High-Contrast Footer -->
    <style id="footer-compact-styles">
      .site-footer {
        background: linear-gradient(180deg, #0b1120 0%, #030712 100%) !important;
        color: #cbd5e1 !important;
        border-top: 1px solid #1e293b !important;
        position: relative !important;
        overflow: hidden !important;
        padding-top: 28px !important;
        padding-bottom: 74px !important; /* Balanced mobile nav clearance */
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
      }
      @media (min-width: 640px) {
        .site-footer {
          padding-top: 36px !important;
          padding-bottom: 24px !important;
        }
      }

      /* Glowing Neon Accent Top Line */
      .ft-top-glow {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #6366f1 85%, #10b981 100%);
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
      }

      /* Compact Trust Highlights Strip */
      .ft-trust-wrap {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        padding-bottom: 20px;
        margin-bottom: 22px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      }
      @media (min-width: 1024px) {
        .ft-trust-wrap {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
      }
      .ft-trust-card {
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        padding: 9px 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.2s ease;
      }
      .ft-trust-card:hover {
        background: rgba(30, 41, 59, 0.6);
        border-color: rgba(16, 185, 129, 0.4);
        transform: translateY(-1px);
      }
      .ft-trust-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        flex-shrink: 0;
      }
      .ft-trust-title {
        color: #ffffff;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.25;
        margin-bottom: 1px;
      }
      .ft-trust-sub {
        color: #94a3b8;
        font-size: 10px;
        line-height: 1.25;
      }

      /* Column Headings */
      .ft-col-title {
        color: #ffffff;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.02em;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        position: relative;
      }
      .ft-col-title::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 22px;
        height: 2px;
        background: #10b981;
        border-radius: 2px;
      }

      /* Compact Link Items */
      .ft-links {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ft-link {
        color: #94a3b8;
        font-size: 12px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s ease;
        line-height: 1.35;
      }
      .ft-link:hover {
        color: #34d399;
        transform: translateX(3px);
      }
      .ft-link span.emoji {
        font-size: 11px;
      }

      /* Brand Column */
      .ft-logo-wrap {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        margin-bottom: 8px;
      }
      .ft-logo-box {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: #ffffff;
        padding: 3px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      }
      .ft-brand-title {
        font-size: 18px;
        font-weight: 900;
        color: #ffffff;
        letter-spacing: -0.02em;
        line-height: 1.1;
      }
      .ft-brand-accent {
        color: #34d399;
      }
      .ft-brand-tagline {
        font-size: 8.5px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #34d399;
      }
      .ft-brand-desc {
        color: #94a3b8;
        font-size: 11.5px;
        line-height: 1.5;
        margin-bottom: 10px;
      }
      .ft-brand-slogan {
        display: inline-block;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.25);
        color: #6ee7b7;
        font-size: 10px;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 9999px;
        margin-bottom: 12px;
      }

      /* Animated Social Icons */
      @keyframes ftSocialFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
      .ft-social-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ft-social-btn {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        position: relative;
        overflow: hidden;
        transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        animation: ftSocialFloat 4s ease-in-out infinite;
      }
      .ft-social-btn:nth-child(1) { animation-delay: 0s; }
      .ft-social-btn:nth-child(2) { animation-delay: 0.6s; }
      .ft-social-btn:nth-child(3) { animation-delay: 1.2s; }
      .ft-social-btn:nth-child(4) { animation-delay: 1.8s; }

      .ft-social-svg {
        width: 15px;
        height: 15px;
        transition: transform 0.25s ease;
      }

      /* Brand Specific Social Hover & Glow Animation */
      .ft-social-btn.fb:hover {
        background: #1877f2 !important;
        border-color: #3b82f6 !important;
        color: #ffffff !important;
        transform: translateY(-3px) scale(1.14) rotate(-3deg) !important;
        box-shadow: 0 5px 16px rgba(24, 119, 242, 0.5) !important;
      }
      .ft-social-btn.wa:hover {
        background: #25d366 !important;
        border-color: #4ade80 !important;
        color: #ffffff !important;
        transform: translateY(-3px) scale(1.14) rotate(3deg) !important;
        box-shadow: 0 5px 16px rgba(37, 211, 102, 0.5) !important;
      }
      .ft-social-btn.yt:hover {
        background: #ff0000 !important;
        border-color: #f87171 !important;
        color: #ffffff !important;
        transform: translateY(-3px) scale(1.14) rotate(-3deg) !important;
        box-shadow: 0 5px 16px rgba(255, 0, 0, 0.5) !important;
      }
      .ft-social-btn.dc:hover {
        background: #059669 !important;
        border-color: #34d399 !important;
        color: #ffffff !important;
        transform: translateY(-3px) scale(1.14) rotate(3deg) !important;
        box-shadow: 0 5px 16px rgba(16, 185, 129, 0.5) !important;
      }
      .ft-social-btn:hover .ft-social-svg {
        transform: scale(1.1);
      }

      /* Compact Office & Contact Info */
      .ft-contact-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 9px;
        font-size: 11.5px;
        color: #cbd5e1;
        line-height: 1.4;
      }
      .ft-contact-icon {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        flex-shrink: 0;
        border: 1px solid rgba(16, 185, 129, 0.25);
        margin-top: 1px;
      }
      .ft-contact-link {
        color: #ffffff;
        font-weight: 700;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .ft-contact-link:hover {
        color: #34d399;
      }

      /* Payment Methods Strip */
      .ft-payment-strip {
        padding: 12px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.07);
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      @media (min-width: 768px) {
        .ft-payment-strip {
          flex-direction: row;
        }
      }
      .ft-payment-title {
        font-size: 11.5px;
        font-weight: 700;
        color: #e2e8f0;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .ft-pay-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }
      .ft-pay-badge {
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 10.5px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border: 1px solid;
        transition: transform 0.15s ease;
      }
      .ft-pay-badge:hover {
        transform: translateY(-1px);
      }
      .ft-pay-cod {
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.35);
      }
      .ft-pay-bkash {
        background: rgba(226, 19, 110, 0.12);
        color: #f472b6;
        border-color: rgba(226, 19, 110, 0.35);
      }
      .ft-pay-nagad {
        background: rgba(247, 148, 29, 0.12);
        color: #fb923c;
        border-color: rgba(247, 148, 29, 0.35);
      }
      .ft-pay-rocket {
        background: rgba(140, 52, 148, 0.15);
        color: #c084fc;
        border-color: rgba(140, 52, 148, 0.35);
      }
      .ft-pay-bank {
        background: rgba(2, 132, 199, 0.12);
        color: #38bdf8;
        border-color: rgba(2, 132, 199, 0.35);
      }
      .ft-pay-card {
        background: rgba(245, 158, 11, 0.12);
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.35);
      }

      /* Compact Bottom Bar */
      .ft-bottom-bar {
        padding-top: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 11px;
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
        gap: 10px;
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
        gap: 5px;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 3px 10px;
        border-radius: 9999px;
        font-size: 10.5px;
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
        
        <!-- 1. Compact Trust Highlights Strip -->
        <div class="ft-trust-wrap">
          
          <div class="ft-trust-card">
            <div class="ft-trust-icon">🚚</div>
            <div>
              <div class="ft-trust-title">দ্রুততম হোম ডেলিভারি</div>
              <div class="ft-trust-sub">সারা দেশে নির্ভরযোগ্য COD</div>
            </div>
          </div>

          <div class="ft-trust-card">
            <div class="ft-trust-icon">🛡️</div>
            <div>
              <div class="ft-trust-title">১০০% আসল প্রোডাক্ট</div>
              <div class="ft-trust-sub">আমদানিকারকদের থেকে সরাসরি</div>
            </div>
          </div>

          <div class="ft-trust-card">
            <div class="ft-trust-icon">💳</div>
            <div>
              <div class="ft-trust-title">নিরাপদ পেমেন্ট</div>
              <div class="ft-trust-sub">বিকাশ/নগদ/কার্ডে ৫% ক্যাশব্যাক</div>
            </div>
          </div>

          <div class="ft-trust-card">
            <div class="ft-trust-icon">💬</div>
            <div>
              <div class="ft-trust-title">সার্বক্ষণিক কাস্টমার কেয়ার</div>
              <div class="ft-trust-sub">সরাসরি কল ও চ্যাট সাপোর্ট</div>
            </div>
          </div>

        </div>

        <!-- 2. Main 4-Column Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pb-4">
          
          <!-- Column 1: Brand Info & Animated Social Channels -->
          <div>
            <a href="/" class="ft-logo-wrap group">
              <div class="ft-logo-box">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10" 
                  alt="Dream Cart BD Logo" 
                  class="w-full h-full object-contain rounded-md"
                  onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
                />
              </div>
              <div>
                <div class="ft-brand-title">Dream Cart <span class="ft-brand-accent">BD</span></div>
                <div class="ft-brand-tagline">Smart Digital Commerce</div>
              </div>
            </a>

            <p class="ft-brand-desc">
              আমদানিকারকদের থেকে সরাসরি সংগৃহীত প্রিমিয়াম গ্যাজেট ও ডিজিটাল লাইফস্টাইল পণ্য।
            </p>

            <div class="ft-brand-slogan">
              ✨ Smart Commerce for Modern Living
            </div>

            <!-- Animated Social Connect Icons -->
            <div class="ft-social-row">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="ft-social-btn fb" title="Facebook">
                <svg class="ft-social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="ft-social-btn wa" title="WhatsApp">
                <svg class="ft-social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.979-.276-.1-.477-.15-.678.15-.201.3-.778.979-.954 1.179-.176.2-.351.226-.652.075-.301-.151-1.27-.468-2.42-1.494-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.502.101-.201.05-.376-.025-.526-.075-.151-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.175-.008-.376-.01-.577-.01s-.527.075-.803.376c-.276.301-1.054 1.029-1.054 2.509 0 1.48 1.079 2.908 1.229 3.109.151.2 2.124 3.243 5.146 4.549.719.311 1.28.497 1.718.636.723.23 1.381.197 1.901.12.579-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.076-.126-.277-.201-.578-.352zM12 2.163c-5.466 0-9.91 4.444-9.91 9.91 0 1.748.456 3.454 1.321 4.957l-1.403 5.125 5.244-1.376c1.448.79 3.078 1.205 4.748 1.205 5.466 0 9.91-4.444 9.91-9.91s-4.444-9.911-9.91-9.911zm0 18.064c-1.528 0-3.024-.41-4.329-1.187l-.311-.185-3.218.844.859-3.138-.203-.323c-.854-1.36-1.305-2.94-1.305-4.56 0-4.664 3.794-8.458 8.458-8.458 4.664 0 8.458 3.794 8.458 8.458 0 4.665-3.794 8.459-8.458 8.459z"/>
                </svg>
              </a>

              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="ft-social-btn yt" title="YouTube">
                <svg class="ft-social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <a href="https://dcitbd.github.io/dcitbd/" target="_blank" rel="noopener noreferrer" class="ft-social-btn dc" title="Dream Career IT BD">
                <svg class="ft-social-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <path d="M2 12h20"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Column 2: Quick Links (প্রয়োজনীয় লিংকসমূহ) -->
          <div>
            <div class="ft-col-title">
              <span>🔗</span> প্রয়োজনীয় পেজ
            </div>
            <div class="ft-links">
              <a href="/" class="ft-link"><span class="emoji">🏠</span> হোম পেজ (Home)</a>
              <a href="/products" class="ft-link"><span class="emoji">🛍️</span> সকল পণ্য (Products)</a>
              <a href="/categories" class="ft-link"><span class="emoji">📂</span> ক্যাটাগরি (Categories)</a>
              <a href="/brands" class="ft-link"><span class="emoji">🏷️</span> ব্র্যান্ড সমূহ (Brands)</a>
              <a href="/cart" class="ft-link"><span class="emoji">🛒</span> শপিং কার্ট (Cart)</a>
              <a href="/favourite" class="ft-link"><span class="emoji">❤️</span> পছন্দের তালিকা (Wishlist)</a>
              <a href="/checkout" class="ft-link"><span class="emoji">📝</span> চেকআউট (Checkout)</a>
              <a href="/track" class="ft-link"><span class="emoji">🚚</span> অর্ডার ট্র্যাকিং (Tracking)</a>
            </div>
          </div>

          <!-- Column 3: Portals & Hubs (পোর্টাল ও সার্ভিস) -->
          <div>
            <div class="ft-col-title">
              <span>💼</span> পোর্টাল ও সার্ভিস
            </div>
            <div class="ft-links">
              <a href="/offers" class="ft-link"><span class="emoji">🎁</span> বিশেষ অফার (Offers)</a>
              <a href="/chat" class="ft-link"><span class="emoji">💬</span> লাইভ চ্যাট সাপোর্ট</a>
              <a href="/others-market" class="ft-link"><span class="emoji">🌐</span> অন্যান্য মার্কেটপ্লেস</a>
              <a href="/landing" class="ft-link"><span class="emoji">🚀</span> ক্যাম্পেইন ল্যান্ডিং</a>
              <a href="/customer/login" class="ft-link"><span class="emoji">👤</span> কাস্টমার লগইন</a>
              <a href="/reseller/login" class="ft-link"><span class="emoji">💼</span> রিসেলার হাব</a>
              <a href="/wholesaler/login" class="ft-link"><span class="emoji">📦</span> হোলসেলার হাব</a>
              <a href="/admin/login" class="ft-link"><span class="emoji">⚙️</span> অ্যাডমিন প্যানেল</a>
            </div>
          </div>

          <!-- Column 4: Contact & Office (যোগাযোগ ও অফিস) -->
          <div>
            <div class="ft-col-title">
              <span>📍</span> যোগাযোগ ও অফিস
            </div>

            <div>
              <div class="ft-contact-item">
                <div class="ft-contact-icon">📍</div>
                <div>
                  <span class="text-white font-bold block">অফিস:</span>
                  <span class="text-slate-300">চৌধুরী প্লাজা, নিচতলা, পদুয়ার বাজার বিশ্বরোড, কুমিল্লা-৩৫০০।</span>
                </div>
              </div>

              <div class="ft-contact-item">
                <div class="ft-contact-icon">📞</div>
                <div>
                  <span class="text-white font-bold block">হটলাইন:</span>
                  <a href="tel:01581703822" class="ft-contact-link">01581703822</a>, 
                  <a href="tel:01818273838" class="ft-contact-link">01818273838</a>
                </div>
              </div>

              <div class="ft-contact-item">
                <div class="ft-contact-icon">✉️</div>
                <div>
                  <span class="text-white font-bold block">ইমেইল:</span>
                  <a href="mailto:jainal.dcitbd@gmail.com" class="ft-contact-link">jainal.dcitbd@gmail.com</a>
                </div>
              </div>

              <div class="ft-contact-item">
                <div class="ft-contact-icon">⏰</div>
                <div>
                  <span class="text-white font-bold">সময়সূচি:</span>
                  <span class="text-slate-300">সকাল ৮:০০ - রাত ১০:০০</span>
                  <span class="inline-block bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[9px] font-bold px-1.5 py-0.2 rounded ml-1">
                    ওপেন
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- 3. Payment Methods Micro-Strip -->
        <div class="ft-payment-strip">
          <div class="ft-payment-title">
            <span>🛡️</span>
            <span>নিরাপদ পেমেন্ট পার্টনার:</span>
          </div>

          <div class="ft-pay-badges">
            <span class="ft-pay-badge ft-pay-cod">💵 ক্যাশ অন ডেলিভারি</span>
            <span class="ft-pay-badge ft-pay-bkash">📱 bKash</span>
            <span class="ft-pay-badge ft-pay-nagad">🟠 Nagad</span>
            <span class="ft-pay-badge ft-pay-rocket">🟣 Rocket</span>
            <span class="ft-pay-badge ft-pay-bank">🏦 Bank Transfer</span>
            <span class="ft-pay-badge ft-pay-card">💳 Cards</span>
          </div>
        </div>

        <!-- 4. Bottom Copyright & Developer Bar -->
        <div class="ft-bottom-bar">
          
          <div>
            &copy; ${currentYear} <strong class="text-white font-bold">Dream Cart BD</strong>. সর্বস্বত্ব সংরক্ষিত।
          </div>

          <div class="ft-bottom-legal">
            <a href="/terms">Terms & Conditions</a>
            <span>•</span>
            <a href="/privacy">Privacy Policy</a>
          </div>

          <div class="ft-dev-credit">
            <span>Dev:</span>
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
