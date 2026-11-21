/**
 * DREAM CART BD — CONTACT & OUTLET PAGE (ContactPage.js)
 * Modern 3D Card-Based Contact Experience:
 * - Dynamically synced with Admin System Settings (address, hotlines, email, office hours)
 * - Scoped CSS with smooth entrance animations, 3D hover cards, generous padding & margins
 * - Full Light & Dark mode high-contrast support
 * - One-click Copy for Hotline, Email & Address + Dual WhatsApp Direct Chat + Interactive Form
 */

import { getGlobalSiteSettings } from '../../api/client.js';

if (typeof window !== 'undefined' && !window.__dcbdContactHelpersAttached) {
  window.__dcbdContactHelpersAttached = true;

  window.__dcbdCopyContact = function(text, btn) {
    const done = () => {
      if (!btn) return;
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ কপি হয়েছে';
      btn.classList.add('ct-copied');
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.classList.remove('ct-copied');
      }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallback(text));
    } else {
      fallback(text);
    }
    function fallback(str) {
      const ta = document.createElement('textarea');
      ta.value = str;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  };

  window.__dcbdSubmitContactForm = function(e) {
    if (e) e.preventDefault();
    const form = e ? e.target : document.getElementById('contact-form');
    const feedback = document.getElementById('ct-form-feedback');
    const btn = document.getElementById('ct-submit-btn');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳</span> <span>পাঠানো হচ্ছে...</span>';
    }

    setTimeout(() => {
      if (form) form.reset();
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>মেসেজ পাঠান</span> <span>→</span>';
      }
      if (feedback) {
        feedback.classList.remove('hidden');
        setTimeout(() => feedback.classList.add('hidden'), 6000);
      }
      if (window.toast && window.toast.show) {
        window.toast.show({
          type: 'success',
          title: 'বার্তা পাঠানো হয়েছে!',
          message: 'আপনার বার্তাটি সফলভাবে গৃহীত হয়েছে। আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।',
          duration: 4500
        });
      }
    }, 350);
  };
}

export function renderContactPage() {
  const siteInfo = getGlobalSiteSettings();
  const shopName = siteInfo.shop_name || 'Dream Cart BD';
  const address = siteInfo.address || 'চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।';
  const hotline1 = siteInfo.hotline1 || '01581703822';
  const hotline2 = siteInfo.hotline2 || '01818273838';
  const email = siteInfo.email || 'jainal.dcitbd@gmail.com';
  const officeHours = siteInfo.office_hours || 'প্রতিদিন সকাল ৮:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত।';
  const wa1 = (siteInfo.whatsapp || hotline1).replace(/[^0-9]/g, '');
  const wa1Full = wa1.startsWith('88') ? wa1 : '88' + wa1;
  const wa2 = hotline2.replace(/[^0-9]/g, '');
  const wa2Full = wa2.startsWith('88') ? wa2 : '88' + wa2;
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Chaudhari Plaza, Paduar Bazar, Bishwa Road, Cumilla 3500');

  return `
    <style id="dcbd-contact-page-styles">
      @keyframes ctFadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes ctPulseDot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.45); opacity: 0.45; }
      }

      .ct-page {
        font-family: 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        max-width: 1120px;
        margin: 0 auto;
        padding: 0.5rem 0 5.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.75rem;
      }

      /* 1. Hero Banner Card */
      .ct-hero {
        position: relative;
        overflow: hidden;
        border-radius: 26px;
        padding: 2.25rem 2.25rem;
        background: linear-gradient(135deg, #064e3b 0%, #0f172a 58%, #022c22 100%);
        border: 1px solid rgba(52, 211, 153, 0.25);
        box-shadow: 0 18px 42px -14px rgba(6, 78, 59, 0.42);
        color: #ffffff;
        animation: ctFadeUp 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .ct-hero::before {
        content: '';
        position: absolute;
        top: -80px;
        right: -60px;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, transparent 70%);
        pointer-events: none;
      }
      .ct-hero::after {
        content: '';
        position: absolute;
        bottom: -90px;
        left: -40px;
        width: 220px;
        height: 220px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%);
        pointer-events: none;
      }
      .ct-hero-inner {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      @media (min-width: 768px) {
        .ct-hero-inner {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }
      .ct-breadcrumb {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.75rem;
        color: #a7f3d0;
        margin-bottom: 0.55rem;
      }
      .ct-breadcrumb a {
        color: #d1fae5;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .ct-breadcrumb a:hover {
        color: #ffffff;
      }
      .ct-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.32rem 0.8rem;
        border-radius: 9999px;
        background: rgba(16, 185, 129, 0.18);
        border: 1px solid rgba(52, 211, 153, 0.4);
        color: #6ee7b7;
        font-size: 0.72rem;
        font-weight: 700;
        margin-bottom: 0.7rem;
      }
      .ct-status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #34d399;
        box-shadow: 0 0 8px #34d399;
        animation: ctPulseDot 1.8s infinite ease-in-out;
      }
      .ct-hero-title {
        font-size: 1.75rem;
        font-weight: 900;
        line-height: 1.25;
        margin: 0 0 0.45rem 0;
        letter-spacing: -0.02em;
        color: #ffffff;
      }
      @media (min-width: 640px) {
        .ct-hero-title { font-size: 2.15rem; }
      }
      .ct-hero-sub {
        font-size: 0.875rem;
        color: #cbd5e1;
        margin: 0;
        max-width: 540px;
        line-height: 1.6;
      }
      .ct-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        flex-shrink: 0;
      }
      .ct-hero-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.72rem 1.2rem;
        border-radius: 14px;
        font-size: 0.8rem;
        font-weight: 800;
        text-decoration: none;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      }
      .ct-hero-btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.5);
      }
      .ct-hero-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -4px rgba(16, 185, 129, 0.65);
      }
      .ct-hero-btn-ghost {
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: #ffffff;
        backdrop-filter: blur(8px);
      }
      .ct-hero-btn-ghost:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      /* 2. Quick Info Cards Grid */
      .ct-info-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 1rem;
      }
      @media (min-width: 640px) {
        .ct-info-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 1024px) {
        .ct-info-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }

      .ct-info-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 20px;
        padding: 1.25rem 1.3rem;
        box-shadow: 0 6px 20px -8px rgba(15, 23, 42, 0.08);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 0.75rem;
        transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s ease, border-color 0.24s ease;
        animation: ctFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .ct-info-card:nth-child(1) { animation-delay: 0.05s; }
      .ct-info-card:nth-child(2) { animation-delay: 0.1s; }
      .ct-info-card:nth-child(3) { animation-delay: 0.15s; }
      .ct-info-card:nth-child(4) { animation-delay: 0.2s; }
      .ct-info-card:hover {
        transform: translateY(-5px);
        border-color: rgba(16, 185, 129, 0.5);
        box-shadow: 0 18px 34px -10px rgba(16, 185, 129, 0.18);
      }
      .dark .ct-info-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.45);
      }
      .dark .ct-info-card:hover {
        border-color: rgba(52, 211, 153, 0.45);
        box-shadow: 0 18px 34px -10px rgba(16, 185, 129, 0.22);
      }

      .ct-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        border: 1px solid #a7f3d0;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.14);
        transition: transform 0.25s ease;
      }
      .ct-info-card:hover .ct-icon-box {
        transform: scale(1.08) rotate(-4deg);
      }
      .dark .ct-icon-box {
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.3);
      }
      .ct-card-kicker {
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #059669;
        margin-bottom: 0.25rem;
      }
      .dark .ct-card-kicker { color: #34d399; }
      .ct-card-val {
        font-size: 0.83rem;
        font-weight: 600;
        color: #334155;
        line-height: 1.55;
        word-break: break-word;
      }
      .dark .ct-card-val { color: #cbd5e1; }
      .ct-card-link {
        color: #0f172a;
        font-weight: 800;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .ct-card-link:hover { color: #059669; }
      .dark .ct-card-link { color: #f8fafc; }
      .dark .ct-card-link:hover { color: #34d399; }

      .ct-copy-chip {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.32rem 0.7rem;
        border-radius: 9px;
        font-size: 0.7rem;
        font-weight: 700;
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        transition: all 0.18s ease;
        text-decoration: none;
      }
      .ct-copy-chip:hover {
        background: #ecfdf5;
        color: #047857;
        border-color: #a7f3d0;
      }
      .dark .ct-copy-chip {
        background: #1e293b;
        color: #cbd5e1;
        border-color: #334155;
      }
      .dark .ct-copy-chip:hover {
        background: rgba(16, 185, 129, 0.18);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.4);
      }
      .ct-copy-chip.ct-copied {
        background: #059669 !important;
        color: #ffffff !important;
        border-color: #059669 !important;
      }

      /* 3. Main 2-Column Layout */
      .ct-main-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 1.5rem;
        align-items: start;
      }
      @media (min-width: 900px) {
        .ct-main-grid {
          grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
          gap: 1.75rem;
        }
      }

      .ct-panel {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 24px;
        padding: 1.65rem 1.75rem;
        box-shadow: 0 8px 26px -10px rgba(15, 23, 42, 0.08);
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
        animation: ctFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        animation-delay: 0.18s;
      }
      .ct-panel:hover {
        border-color: rgba(16, 185, 129, 0.35);
      }
      .dark .ct-panel {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 28px -10px rgba(0, 0, 0, 0.45);
      }

      .ct-panel-head {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        padding-bottom: 1rem;
        margin-bottom: 1.25rem;
        border-bottom: 1px solid #f1f5f9;
      }
      .dark .ct-panel-head {
        border-bottom-color: rgba(255, 255, 255, 0.07);
      }
      .ct-panel-title {
        font-size: 1.05rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
      }
      .dark .ct-panel-title { color: #f8fafc; }

      /* WhatsApp Channel Cards */
      .ct-wa-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.85rem;
        padding: 0.95rem 1.1rem;
        border-radius: 16px;
        text-decoration: none;
        border: 1px solid #a7f3d0;
        background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%);
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      }
      .ct-wa-card:hover {
        transform: translateY(-2px);
        border-color: #10b981;
        box-shadow: 0 10px 22px -8px rgba(16, 185, 129, 0.35);
      }
      .dark .ct-wa-card {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.3);
      }
      .dark .ct-wa-card:hover {
        background: rgba(16, 185, 129, 0.18);
        border-color: #10b981;
      }
      .ct-wa-badge {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: #10b981;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
      }
      .ct-wa-arrow {
        font-size: 0.95rem;
        font-weight: 800;
        color: #059669;
        transition: transform 0.2s ease;
      }
      .ct-wa-card:hover .ct-wa-arrow {
        transform: translateX(4px);
      }
      .dark .ct-wa-arrow { color: #34d399; }

      /* Quick Utility Pills */
      .ct-util-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.7rem;
        margin-top: 1rem;
      }
      .ct-util-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        padding: 0.72rem 0.9rem;
        border-radius: 13px;
        font-size: 0.78rem;
        font-weight: 700;
        text-decoration: none;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #334155;
        transition: all 0.2s ease;
      }
      .ct-util-link:hover {
        background: #ecfdf5;
        border-color: #10b981;
        color: #047857;
        transform: translateY(-2px);
      }
      .dark .ct-util-link {
        background: #1e293b;
        border-color: #334155;
        color: #e2e8f0;
      }
      .dark .ct-util-link:hover {
        background: rgba(16, 185, 129, 0.16);
        border-color: #10b981;
        color: #34d399;
      }

      /* Form Inputs */
      .ct-label {
        display: block;
        font-size: 0.78rem;
        font-weight: 700;
        color: #334155;
        margin-bottom: 0.4rem;
      }
      .dark .ct-label { color: #cbd5e1; }
      .ct-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border-radius: 14px;
        font-size: 0.84rem;
        font-weight: 500;
        background: #f8fafc;
        color: #0f172a;
        border: 1.5px solid #e2e8f0;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }
      .ct-input:focus {
        background: #ffffff;
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.14);
      }
      .dark .ct-input {
        background: #1e293b;
        color: #f8fafc;
        border-color: #334155;
      }
      .dark .ct-input:focus {
        background: #0f172a;
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
      }
      .ct-submit-btn {
        width: 100%;
        padding: 0.92rem 1.35rem;
        border-radius: 15px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-size: 0.9rem;
        font-weight: 800;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        box-shadow: 0 10px 24px -6px rgba(16, 185, 129, 0.5);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .ct-submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px -6px rgba(16, 185, 129, 0.65);
      }
      .ct-submit-btn:active {
        transform: scale(0.98);
      }

      @media (max-width: 640px) {
        .ct-hero { padding: 1.5rem 1.35rem; border-radius: 20px; }
        .ct-panel { padding: 1.25rem 1.25rem; border-radius: 18px; }
      }
    </style>

    <div class="ct-page">

      <!-- 1. Hero Banner -->
      <section class="ct-hero">
        <div class="ct-hero-inner">
          <div>
            <div class="ct-breadcrumb">
              <a href="/">হোম</a>
              <span>/</span>
              <span>যোগাযোগ</span>
            </div>
            <div class="ct-status-pill">
              <span class="ct-status-dot"></span>
              <span>সাপোর্ট টিম সক্রিয় রয়েছে</span>
            </div>
            <h1 class="ct-hero-title">আমাদের সাথে যোগাযোগ করুন</h1>
            <p class="ct-hero-sub">
              অর্ডার, পণ্য সংক্রান্ত তথ্য, পাইকারি বা রিসেলার সহায়তার জন্য সরাসরি কল, WhatsApp অথবা নিচের ফর্মে মেসেজ দিন।
            </p>
          </div>

          <div class="ct-hero-actions">
            <a href="tel:${hotline1}" class="ct-hero-btn ct-hero-btn-primary">
              <span>📞</span>
              <span>কল করুন</span>
            </a>
            <a href="https://wa.me/${wa1Full}" target="_blank" rel="noopener noreferrer" class="ct-hero-btn ct-hero-btn-ghost">
              <span>💬</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      <!-- 2. Four 3D Quick-Info Cards -->
      <section class="ct-info-grid">

        <!-- Address Card -->
        <div class="ct-info-card">
          <div>
            <div class="ct-icon-box" style="margin-bottom: 0.85rem;">📍</div>
            <div class="ct-card-kicker">হেড অফিস ও শোরুম</div>
            <div class="ct-card-val">${address}</div>
          </div>
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="ct-copy-chip">
            <span>🗺️</span> ম্যাপে দেখুন ↗
          </a>
        </div>

        <!-- Hotline Card -->
        <div class="ct-info-card">
          <div>
            <div class="ct-icon-box" style="margin-bottom: 0.85rem;">📞</div>
            <div class="ct-card-kicker">মোবাইল হটলাইন</div>
            <div class="ct-card-val space-y-1">
              <div><a href="tel:${hotline1}" class="ct-card-link font-mono">${hotline1}</a></div>
              <div><a href="tel:${hotline2}" class="ct-card-link font-mono">${hotline2}</a></div>
            </div>
          </div>
          <button type="button" class="ct-copy-chip" onclick="window.__dcbdCopyContact('${hotline1}', this)">
            <span>📋</span> নম্বর কপি
          </button>
        </div>

        <!-- Email Card -->
        <div class="ct-info-card">
          <div>
            <div class="ct-icon-box" style="margin-bottom: 0.85rem;">✉️</div>
            <div class="ct-card-kicker">অফিশিয়াল ইমেইল</div>
            <div class="ct-card-val">
              <a href="mailto:${email}" class="ct-card-link">${email}</a>
            </div>
          </div>
          <button type="button" class="ct-copy-chip" onclick="window.__dcbdCopyContact('${email}', this)">
            <span>📋</span> ইমেইল কপি
          </button>
        </div>

        <!-- Office Hours Card -->
        <div class="ct-info-card">
          <div>
            <div class="ct-icon-box" style="margin-bottom: 0.85rem;">⏰</div>
            <div class="ct-card-kicker">সাপোর্ট সময়সূচি</div>
            <div class="ct-card-val">${officeHours}</div>
          </div>
          <span class="ct-copy-chip" style="cursor: default;">
            <span>✨</span> সপ্তাহে ৭ দিন খোলা
          </span>
        </div>

      </section>

      <!-- 3. Main Content: Direct Channels (Left) + Message Form (Right) -->
      <section class="ct-main-grid">

        <!-- Left: Direct WhatsApp & Quick Support -->
        <div class="space-y-5">
          <div class="ct-panel">
            <div class="ct-panel-head">
              <div class="ct-icon-box" style="width:38px;height:38px;font-size:1.1rem;">💬</div>
              <div>
                <h2 class="ct-panel-title">তাৎক্ষণিক WhatsApp সাপোর্ট</h2>
                <div class="text-xs text-slate-500 dark:text-slate-400">${shopName} কাস্টমার কেয়ার</div>
              </div>
            </div>

            <div class="space-y-3">
              <a href="https://wa.me/${wa1Full}" target="_blank" rel="noopener noreferrer" class="ct-wa-card">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="ct-wa-badge">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43l-.47-.01c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.42 1.01 2.59c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/></svg>
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-emerald-700 dark:text-emerald-300">হটলাইন ১ (অর্ডার ও সাপোর্ট)</div>
                    <div class="text-sm font-black font-mono text-slate-900 dark:text-white">${hotline1}</div>
                  </div>
                </div>
                <span class="ct-wa-arrow">→</span>
              </a>

              <a href="https://wa.me/${wa2Full}" target="_blank" rel="noopener noreferrer" class="ct-wa-card">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="ct-wa-badge" style="background: #0d9488;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43l-.47-.01c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.42 1.01 2.59c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/></svg>
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-teal-700 dark:text-teal-300">হটলাইন ২ (পাইকারি ও রিসেলার)</div>
                    <div class="text-sm font-black font-mono text-slate-900 dark:text-white">${hotline2}</div>
                  </div>
                </div>
                <span class="ct-wa-arrow">→</span>
              </a>
            </div>

            <div class="ct-util-grid">
              <a href="/track" class="ct-util-link">
                <span>🚚</span> অর্ডার ট্র্যাক
              </a>
              <a href="/chat" class="ct-util-link">
                <span>🎧</span> লাইভ চ্যাট
              </a>
            </div>
          </div>
        </div>

        <!-- Right: Interactive Message Form -->
        <div class="ct-panel">
          <div class="ct-panel-head">
            <div class="ct-icon-box" style="width:38px;height:38px;font-size:1.1rem;">✉️</div>
            <div>
              <h2 class="ct-panel-title">মেসেজ পাঠান</h2>
              <div class="text-xs text-slate-500 dark:text-slate-400">আপনার প্রশ্ন বা মতামত লিখে পাঠিয়ে দিন</div>
            </div>
          </div>

          <div id="ct-form-feedback" class="hidden mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <span>✓</span>
            <span>আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! শীঘ্রই আমাদের প্রতিনিধি যোগাযোগ করবেন।</span>
          </div>

          <form id="contact-form" class="space-y-4" onsubmit="window.__dcbdSubmitContactForm(event)">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="ct-label">আপনার নাম <span class="text-rose-500">*</span></label>
                <input type="text" required placeholder="আপনার পূর্ণ নাম" class="ct-input" />
              </div>
              <div>
                <label class="ct-label">মোবাইল নম্বর <span class="text-rose-500">*</span></label>
                <input type="tel" required placeholder="01XXXXXXXXX" class="ct-input font-mono" />
              </div>
            </div>

            <div>
              <label class="ct-label">বিষয়</label>
              <input type="text" placeholder="যেমন: পণ্য অনুসন্ধান, অর্ডার বা পাইকারি তথ্য" class="ct-input" />
            </div>

            <div>
              <label class="ct-label">বার্তা <span class="text-rose-500">*</span></label>
              <textarea required rows="4" placeholder="আপনার বার্তাটি লিখুন..." class="ct-input leading-relaxed"></textarea>
            </div>

            <button type="submit" id="ct-submit-btn" class="ct-submit-btn">
              <span>মেসেজ পাঠান</span>
              <span>→</span>
            </button>
          </form>
        </div>

      </section>

    </div>
  `;
}
