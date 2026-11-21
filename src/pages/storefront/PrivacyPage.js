/**
 * DREAM CART BD — PRIVACY POLICY PAGE (src/pages/storefront/PrivacyPage.js)
 * Upgraded Design System:
 * - 100% Pure Bengali (বাংলা) with Hind Siliguri + Plus Jakarta Sans typography
 * - Zero dependency on missing Tailwind utilities (100% self-contained scoped CSS)
 * - 3D elevated cards, tactile 3D buttons, smooth entrance & hover animations
 * - Crisp sub-clause cards, generous padding/margins & Light/Dark mode support
 * - Live keyword search with match counter, clear & empty-state reset
 * - Expand/Collapse sections, smooth jump-to-section spotlight & Print support
 * - Direct Call, WhatsApp, Email & One-click Copy actions
 * - Preserves all 12 groups, all 16 clauses & sub-clauses, all IDs & export: renderPrivacyPage
 */

if (typeof window !== 'undefined' && !window.__dcbdPrivacyUI) {
  window.__dcbdPrivacyUI = {
    filter(rawValue) {
      const term = String(rawValue || '').toLowerCase().trim();
      const cards = document.querySelectorAll('.pp-page-root .pp-section-group');
      const clearBtn = document.getElementById('pp-search-clear');
      const countBadge = document.getElementById('pp-search-count');
      const emptyBox = document.getElementById('pp-empty-state');

      if (clearBtn) {
        clearBtn.style.display = term ? 'inline-flex' : 'none';
      }

      let visibleCount = 0;
      cards.forEach((card) => {
        const text = (card.innerText || card.textContent || '').toLowerCase();
        const isMatch = !term || text.includes(term);
        card.style.display = isMatch ? 'block' : 'none';
        if (isMatch) {
          visibleCount += 1;
          if (term) {
            card.classList.remove('pp-collapsed');
          }
        }
      });

      if (countBadge) {
        countBadge.textContent = term
          ? `মিল পাওয়া গেছে: ${visibleCount}টি বিভাগ`
          : `মোট ১২টি বিভাগ • ১৬টি ধারা`;
      }

      if (emptyBox) {
        emptyBox.style.display = visibleCount === 0 ? 'flex' : 'none';
      }
    },

    clearSearch() {
      const input = document.getElementById('pp-search-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      this.filter('');
    },

    jumpTo(groupId, pillEl) {
      const target = document.getElementById(groupId);
      if (!target) return;

      if (target.style.display === 'none') {
        this.clearSearch();
      }
      target.classList.remove('pp-collapsed');

      document.querySelectorAll('.pp-page-root .pp-nav-pill').forEach((p) => {
        p.classList.remove('pp-pill-active');
      });
      if (pillEl) {
        pillEl.classList.add('pp-pill-active');
      }

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      target.classList.remove('pp-card-spotlight');
      void target.offsetWidth;
      target.classList.add('pp-card-spotlight');
      setTimeout(() => {
        target.classList.remove('pp-card-spotlight');
      }, 1800);
    },

    toggleGroup(groupId) {
      const target = document.getElementById(groupId);
      if (!target) return;
      target.classList.toggle('pp-collapsed');
    },

    toggleAll(expand) {
      const cards = document.querySelectorAll('.pp-page-root .pp-section-group');
      cards.forEach((card) => {
        if (expand) {
          card.classList.remove('pp-collapsed');
        } else {
          card.classList.add('pp-collapsed');
        }
      });
    },

    copyText(text, btnEl) {
      const done = () => {
        if (!btnEl) return;
        const original = btnEl.getAttribute('data-label') || btnEl.innerHTML;
        if (!btnEl.getAttribute('data-label')) {
          btnEl.setAttribute('data-label', original);
        }
        btnEl.innerHTML = '✓ কপি হয়েছে';
        btnEl.classList.add('pp-btn-copied');
        setTimeout(() => {
          btnEl.innerHTML = btnEl.getAttribute('data-label') || original;
          btnEl.classList.remove('pp-btn-copied');
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta);
          done();
        });
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    },

    scrollToTop() {
      const root = document.getElementById('pp-top-anchor');
      if (root) {
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };
}

export function renderPrivacyPage() {
  return `
    <!-- Scoped 3D Professional Styles for Privacy Policy Page -->
    <style id="privacy-page-custom-styles">
      @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

      .pp-page-root {
        --pp-font: 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        --pp-emerald: #10b981;
        --pp-emerald-dark: #059669;
        --pp-emerald-deep: #047857;
        --pp-surface: #ffffff;
        --pp-surface-soft: #f8fafc;
        --pp-border: #e2e8f0;
        --pp-border-3d: #cbd5e1;
        --pp-text-main: #0f172a;
        --pp-text-body: #334155;
        --pp-text-muted: #64748b;
        --pp-shadow-card:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 6px 0 -2px rgba(226, 232, 240, 0.9),
          0 14px 32px -10px rgba(15, 23, 42, 0.09);
        --pp-shadow-card-hover:
          0 1px 0 rgba(255, 255, 255, 1) inset,
          0 8px 0 -2px rgba(16, 185, 129, 0.28),
          0 22px 42px -12px rgba(16, 185, 129, 0.22);

        font-family: var(--pp-font);
        max-width: 1080px;
        margin: 0 auto;
        padding: 18px 14px 96px;
        color: var(--pp-text-body);
        box-sizing: border-box;
        perspective: 1200px;
      }

      .pp-page-root *,
      .pp-page-root *::before,
      .pp-page-root *::after {
        font-family: var(--pp-font);
        box-sizing: border-box;
      }

      .dark .pp-page-root {
        --pp-surface: #0f172a;
        --pp-surface-soft: #131f37;
        --pp-border: #1e293b;
        --pp-border-3d: #0b1222;
        --pp-text-main: #f8fafc;
        --pp-text-body: #cbd5e1;
        --pp-text-muted: #94a3b8;
        --pp-shadow-card:
          0 1px 0 rgba(255, 255, 255, 0.06) inset,
          0 6px 0 -2px rgba(2, 6, 23, 0.85),
          0 18px 38px -10px rgba(0, 0, 0, 0.55);
        --pp-shadow-card-hover:
          0 1px 0 rgba(52, 211, 153, 0.16) inset,
          0 8px 0 -2px rgba(16, 185, 129, 0.25),
          0 24px 46px -12px rgba(16, 185, 129, 0.25);
      }

      @media (min-width: 640px) {
        .pp-page-root {
          padding: 26px 24px 110px;
        }
      }

      /* Keyframe Animations */
      @keyframes ppCardReveal {
        0% {
          opacity: 0;
          transform: translateY(22px) scale(0.985);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes ppFloatOrb {
        0%, 100% {
          transform: translate3d(0, 0, 0) scale(1);
        }
        50% {
          transform: translate3d(-16px, 14px, 0) scale(1.08);
        }
      }

      @keyframes ppPulseDot {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.65);
        }
        50% {
          transform: scale(1.15);
          box-shadow: 0 0 0 7px rgba(52, 211, 153, 0);
        }
      }

      @keyframes ppSpotlight {
        0% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55), var(--pp-shadow-card-hover);
        }
        50% {
          box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.28), var(--pp-shadow-card-hover);
        }
        100% {
          box-shadow: var(--pp-shadow-card);
        }
      }

      @keyframes ppShimmer {
        0% { transform: translateX(-120%) skewX(-20deg); }
        100% { transform: translateX(260%) skewX(-20deg); }
      }

      .pp-stack {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* ==================== 1. 3D HERO BANNER ==================== */
      .pp-hero {
        position: relative;
        overflow: hidden;
        border-radius: 26px;
        padding: 28px 22px;
        color: #ffffff;
        background:
          radial-gradient(circle at 14% 16%, rgba(16, 185, 129, 0.26) 0%, transparent 45%),
          radial-gradient(circle at 88% 82%, rgba(56, 189, 248, 0.22) 0%, transparent 48%),
          linear-gradient(135deg, #0b132b 0%, #0f172a 52%, #042f2e 100%);
        border: 1px solid rgba(52, 211, 153, 0.28);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.14) inset,
          0 10px 0 -3px rgba(6, 78, 59, 0.55),
          0 26px 52px -14px rgba(2, 6, 23, 0.55);
        animation: ppCardReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @media (min-width: 768px) {
        .pp-hero {
          padding: 40px 38px;
        }
      }

      .pp-hero-orb-1 {
        position: absolute;
        top: -65px;
        right: -45px;
        width: 240px;
        height: 240px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.38) 0%, transparent 70%);
        filter: blur(30px);
        pointer-events: none;
        animation: ppFloatOrb 7s ease-in-out infinite;
      }

      .pp-hero-orb-2 {
        position: absolute;
        bottom: -75px;
        left: -40px;
        width: 220px;
        height: 220px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.26) 0%, transparent 70%);
        filter: blur(34px);
        pointer-events: none;
        animation: ppFloatOrb 9s ease-in-out infinite reverse;
      }

      .pp-hero-grid-pattern {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
        background-size: 32px 32px;
        pointer-events: none;
        opacity: 0.6;
      }

      .pp-hero-inner {
        position: relative;
        z-index: 2;
      }

      .pp-hero-top-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 18px;
      }

      .pp-hero-badge {
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 7px 16px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.16);
        border: 1px solid rgba(52, 211, 153, 0.42);
        color: #6ee7b7;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.01em;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2);
      }

      .pp-hero-badge::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 45%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        animation: ppShimmer 4.5s ease-in-out infinite;
      }

      .pp-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #34d399;
        animation: ppPulseDot 2s infinite;
      }

      .pp-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .pp-btn-3d {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 9px 16px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
        cursor: pointer;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.1);
        color: #f8fafc;
        backdrop-filter: blur(8px);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.18) inset,
          0 4px 0 rgba(2, 6, 23, 0.45),
          0 8px 18px rgba(0, 0, 0, 0.22);
        transition:
          transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.18s ease,
          background 0.18s ease,
          border-color 0.18s ease;
        text-decoration: none;
      }

      .pp-btn-3d:hover {
        transform: translateY(-2px);
        background: rgba(16, 185, 129, 0.24);
        border-color: rgba(52, 211, 153, 0.55);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.25) inset,
          0 6px 0 rgba(4, 120, 87, 0.6),
          0 12px 24px rgba(16, 185, 129, 0.3);
      }

      .pp-btn-3d:active {
        transform: translateY(2px);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.12) inset,
          0 1px 0 rgba(2, 6, 23, 0.55);
      }

      .pp-btn-3d-primary {
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        border-color: #34d399;
        color: #ffffff;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.35) inset,
          0 4px 0 #047857,
          0 10px 22px rgba(16, 185, 129, 0.35);
      }

      .pp-btn-3d-primary:hover {
        background: linear-gradient(180deg, #34d399 0%, #059669 100%);
        border-color: #6ee7b7;
      }

      .pp-hero-title {
        font-size: 26px;
        line-height: 1.28;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 12px;
        letter-spacing: -0.015em;
        text-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
      }

      @media (min-width: 640px) {
        .pp-hero-title {
          font-size: 34px;
        }
      }

      .pp-hero-subtitle {
        font-size: 15px;
        line-height: 1.75;
        color: #cbd5e1;
        max-width: 780px;
        margin: 0 0 24px;
        font-weight: 400;
      }

      /* 3D Hero Stats Bar */
      .pp-hero-stats {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 22px;
      }

      @media (min-width: 640px) {
        .pp-hero-stats {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .pp-stat-card {
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 13px 16px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.12) inset,
          0 8px 20px rgba(0, 0, 0, 0.22);
        backdrop-filter: blur(10px);
        transition: transform 0.22s ease, border-color 0.22s ease;
      }

      .pp-stat-card:hover {
        transform: translateY(-3px);
        border-color: rgba(52, 211, 153, 0.45);
      }

      .pp-stat-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.28), rgba(6, 78, 59, 0.45));
        border: 1px solid rgba(52, 211, 153, 0.35);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.22);
        flex-shrink: 0;
      }

      .pp-stat-val {
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.25;
      }

      .pp-stat-lbl {
        font-size: 12.5px;
        color: #94a3b8;
        line-height: 1.35;
      }

      /* Meta Chips */
      .pp-meta-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .pp-meta-chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 7px 14px;
        border-radius: 11px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.14);
        font-size: 13px;
        line-height: 1.4;
        color: #e2e8f0;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      }

      .pp-meta-chip strong {
        color: #6ee7b7;
        font-weight: 600;
      }

      /* ==================== 2. 3D NAVIGATION & SEARCH DECK ==================== */
      .pp-card {
        position: relative;
        background: var(--pp-surface);
        border: 1px solid var(--pp-border);
        border-radius: 22px;
        padding: 24px 20px;
        box-shadow: var(--pp-shadow-card);
        transition:
          transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.28s ease,
          border-color 0.25s ease;
        animation: ppCardReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        scroll-margin-top: 96px;
      }

      @media (min-width: 640px) {
        .pp-card {
          padding: 28px 30px;
        }
      }

      .pp-card:hover {
        border-color: rgba(16, 185, 129, 0.5);
        box-shadow: var(--pp-shadow-card-hover);
        transform: translateY(-3px);
      }

      .pp-card-spotlight {
        animation: ppSpotlight 1.7s ease-out;
        border-color: #10b981 !important;
      }

      .pp-nav-deck {
        padding: 22px 20px;
        background: linear-gradient(180deg, var(--pp-surface) 0%, var(--pp-surface-soft) 100%);
      }

      @media (min-width: 640px) {
        .pp-nav-deck {
          padding: 24px 28px;
        }
      }

      .pp-nav-header {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-bottom: 18px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--pp-border);
      }

      @media (min-width: 768px) {
        .pp-nav-header {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .pp-nav-heading-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .pp-nav-heading {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 16px;
        font-weight: 700;
        color: var(--pp-text-main);
        margin: 0;
      }

      .pp-search-count {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--pp-emerald-dark);
      }

      .dark .pp-search-count {
        color: #34d399;
      }

      .pp-search-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        width: 100%;
      }

      @media (min-width: 768px) {
        .pp-search-controls {
          width: auto;
          justify-content: flex-end;
        }
      }

      .pp-search-box {
        position: relative;
        flex: 1 1 260px;
        min-width: 220px;
        max-width: 100%;
      }

      @media (min-width: 768px) {
        .pp-search-box {
          width: 320px;
          flex: 0 0 320px;
        }
      }

      .pp-search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        pointer-events: none;
        opacity: 0.75;
      }

      .pp-search-input {
        width: 100%;
        padding: 11px 38px 11px 40px;
        border-radius: 14px;
        border: 1.5px solid var(--pp-border);
        background: var(--pp-surface);
        color: var(--pp-text-main);
        font-size: 14px;
        font-weight: 500;
        outline: none;
        box-shadow: 0 3px 8px rgba(15, 23, 42, 0.04) inset;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .pp-search-input::placeholder {
        color: var(--pp-text-muted);
      }

      .pp-search-input:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
      }

      .pp-search-clear {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: none;
        background: rgba(148, 163, 184, 0.22);
        color: var(--pp-text-main);
        font-size: 14px;
        font-weight: 700;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.16s ease;
      }

      .pp-search-clear:hover {
        background: #ef4444;
        color: #ffffff;
      }

      .pp-mini-controls {
        display: inline-flex;
        gap: 8px;
      }

      .pp-btn-soft {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 13px;
        border-radius: 12px;
        font-size: 12.5px;
        font-weight: 700;
        color: var(--pp-text-body);
        background: var(--pp-surface);
        border: 1px solid var(--pp-border);
        box-shadow: 0 3px 0 var(--pp-border-3d);
        cursor: pointer;
        text-decoration: none;
        transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, color 0.15s ease;
      }

      .pp-btn-soft:hover {
        transform: translateY(-1px);
        border-color: #10b981;
        color: var(--pp-emerald-dark);
        box-shadow: 0 4px 0 rgba(16, 185, 129, 0.35);
      }

      .dark .pp-btn-soft:hover {
        color: #34d399;
      }

      .pp-btn-soft:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 var(--pp-border-3d);
      }

      /* Quick Navigation 3D Pills */
      .pp-nav-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
      }

      .pp-nav-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.3;
        background: var(--pp-surface);
        color: var(--pp-text-body);
        border: 1px solid var(--pp-border);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.7) inset,
          0 3px 0 var(--pp-border-3d);
        text-decoration: none;
        cursor: pointer;
        transition:
          transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
          background 0.18s ease,
          color 0.18s ease,
          border-color 0.18s ease,
          box-shadow 0.18s ease;
      }

      .dark .pp-nav-pill {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.05) inset,
          0 3px 0 #020617;
      }

      .pp-nav-pill:hover,
      .pp-nav-pill.pp-pill-active {
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        border-color: #10b981;
        transform: translateY(-2px);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.3) inset,
          0 4px 0 #047857,
          0 8px 18px rgba(16, 185, 129, 0.3);
      }

      .pp-nav-pill:active {
        transform: translateY(1px);
        box-shadow: 0 1px 0 #047857;
      }

      /* Empty Search State */
      .pp-empty-state {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 44px 24px;
        border-radius: 22px;
        background: var(--pp-surface);
        border: 1.5px dashed rgba(16, 185, 129, 0.45);
        box-shadow: var(--pp-shadow-card);
        gap: 10px;
      }

      .pp-empty-icon {
        font-size: 40px;
        line-height: 1;
      }

      .pp-empty-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--pp-text-main);
      }

      .pp-empty-desc {
        font-size: 14px;
        color: var(--pp-text-muted);
        margin-bottom: 6px;
      }

      /* ==================== 3. SECTION GROUP CARD HEADER ==================== */
      .pp-group-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding-bottom: 18px;
        margin-bottom: 20px;
        border-bottom: 1.5px solid var(--pp-border);
        cursor: pointer;
        user-select: none;
      }

      .pp-section-group.pp-collapsed .pp-group-header {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom-color: transparent;
      }

      .pp-group-head-left {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
      }

      .pp-group-icon {
        width: 48px;
        height: 48px;
        border-radius: 15px;
        background: linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%);
        border: 1px solid rgba(16, 185, 129, 0.35);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 4px 0 rgba(16, 185, 129, 0.22),
          0 8px 16px rgba(16, 185, 129, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .dark .pp-group-icon {
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.24) 0%, rgba(6, 78, 59, 0.5) 100%);
        border-color: rgba(52, 211, 153, 0.4);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.14) inset,
          0 4px 0 rgba(2, 6, 23, 0.65),
          0 8px 18px rgba(16, 185, 129, 0.2);
      }

      .pp-card:hover .pp-group-icon {
        transform: scale(1.06) rotate(-4deg);
      }

      .pp-group-meta {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .pp-group-tag {
        font-size: 11.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pp-emerald-dark);
      }

      .dark .pp-group-tag {
        color: #34d399;
      }

      .pp-group-title {
        font-size: 19px;
        line-height: 1.35;
        font-weight: 700;
        color: var(--pp-text-main);
        margin: 0;
      }

      @media (min-width: 640px) {
        .pp-group-title {
          font-size: 21px;
        }
      }

      .pp-toggle-btn {
        width: 36px;
        height: 36px;
        border-radius: 11px;
        border: 1px solid var(--pp-border);
        background: var(--pp-surface-soft);
        color: var(--pp-text-muted);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        flex-shrink: 0;
        box-shadow: 0 2px 0 var(--pp-border-3d);
        transition: transform 0.25s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      }

      .pp-group-header:hover .pp-toggle-btn {
        border-color: #10b981;
        color: #10b981;
      }

      .pp-section-group.pp-collapsed .pp-toggle-btn {
        transform: rotate(-90deg);
      }

      .pp-group-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .pp-section-group.pp-collapsed .pp-group-body {
        display: none;
      }

      .pp-group-intro {
        font-size: 15px;
        line-height: 1.8;
        color: var(--pp-text-body);
        margin: 0;
      }

      /* ==================== 4. INDIVIDUAL CLAUSE SUB-CARDS ==================== */
      .pp-clause-item {
        background: var(--pp-surface-soft);
        border: 1px solid var(--pp-border);
        border-left: 4px solid #10b981;
        border-radius: 16px;
        padding: 18px 20px;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 4px 14px -6px rgba(15, 23, 42, 0.06);
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .dark .pp-clause-item {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.04) inset,
          0 6px 16px -6px rgba(0, 0, 0, 0.38);
      }

      .pp-clause-item:hover {
        transform: translateX(3px);
        border-color: rgba(16, 185, 129, 0.45);
        border-left-color: #059669;
      }

      .pp-clause-title {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        font-size: 16.5px;
        line-height: 1.4;
        font-weight: 700;
        color: var(--pp-text-main);
        margin: 0 0 11px;
      }

      .pp-clause-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 3px 11px;
        border-radius: 8px;
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 700;
        letter-spacing: 0.02em;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.3) inset,
          0 3px 0 #047857;
        flex-shrink: 0;
      }

      .pp-clause-en {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--pp-text-muted);
      }

      /* Readable Bengali Body Typography */
      .pp-text {
        font-size: 15px;
        line-height: 1.85;
        color: var(--pp-text-body);
        margin: 0;
        font-weight: 400;
      }

      .pp-text + .pp-text {
        margin-top: 10px;
      }

      .pp-text-note {
        font-size: 13.5px;
        line-height: 1.75;
        color: var(--pp-text-muted);
        margin-top: 12px;
      }

      .pp-text-strong-note {
        font-size: 14.5px;
        line-height: 1.8;
        font-weight: 600;
        color: var(--pp-text-main);
        margin-top: 12px;
      }

      .pp-website-pill {
        margin-top: 14px;
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 11px;
        background: var(--pp-surface);
        border: 1px solid var(--pp-border);
        font-size: 13.5px;
        color: var(--pp-text-muted);
      }

      /* Custom Styled Check Lists */
      .pp-list {
        list-style: none;
        padding: 0;
        margin: 12px 0 0;
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 10px;
      }

      .pp-list-2col {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }

      @media (min-width: 640px) {
        .pp-list-2col {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .pp-list li {
        position: relative;
        padding: 10px 14px 10px 40px;
        border-radius: 12px;
        background: var(--pp-surface);
        border: 1px solid var(--pp-border);
        font-size: 14.5px;
        line-height: 1.7;
        color: var(--pp-text-body);
        transition: border-color 0.18s ease, transform 0.18s ease;
      }

      .pp-list li:hover {
        border-color: rgba(16, 185, 129, 0.45);
        transform: translateX(2px);
      }

      .pp-list li::before {
        content: '✓';
        position: absolute;
        left: 12px;
        top: 12px;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: rgba(16, 185, 129, 0.14);
        color: #059669;
        font-size: 12px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dark .pp-list li::before {
        background: rgba(16, 185, 129, 0.22);
        color: #34d399;
      }

      /* 3D Numbered Lists (Clause 3) */
      .pp-num-list {
        list-style: none;
        padding: 0;
        margin: 12px 0 0;
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 10px;
      }

      @media (min-width: 640px) {
        .pp-num-list {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .pp-num-list li {
        position: relative;
        padding: 12px 14px 12px 48px;
        border-radius: 13px;
        background: var(--pp-surface);
        border: 1px solid var(--pp-border);
        box-shadow: 0 3px 0 -1px var(--pp-border-3d);
        font-size: 14.5px;
        line-height: 1.7;
        color: var(--pp-text-body);
        transition: transform 0.18s ease, border-color 0.18s ease;
      }

      .dark .pp-num-list li {
        box-shadow: 0 3px 0 -1px #020617;
      }

      .pp-num-list li:hover {
        transform: translateY(-2px);
        border-color: rgba(16, 185, 129, 0.5);
      }

      .pp-num-badge {
        position: absolute;
        left: 12px;
        top: 12px;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 0 #047857;
      }

      /* 3D Sub-Cards Grid */
      .pp-sub-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 13px;
        margin-top: 12px;
      }

      @media (min-width: 640px) {
        .pp-sub-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .pp-sub-box {
        background: var(--pp-surface);
        border: 1px solid var(--pp-border);
        border-radius: 15px;
        padding: 16px 18px;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 4px 0 -1px var(--pp-border-3d);
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .dark .pp-sub-box {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.05) inset,
          0 4px 0 -1px #020617;
      }

      .pp-sub-box:hover {
        transform: translateY(-3px);
        border-color: rgba(16, 185, 129, 0.55);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.85) inset,
          0 5px 0 -1px rgba(16, 185, 129, 0.28),
          0 12px 22px -8px rgba(16, 185, 129, 0.18);
      }

      .pp-sub-term {
        font-size: 15px;
        font-weight: 700;
        color: var(--pp-emerald-dark);
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .dark .pp-sub-term {
        color: #34d399;
      }

      .pp-sub-desc {
        font-size: 14px;
        line-height: 1.75;
        color: var(--pp-text-body);
      }

      /* ==================== 5. 3D HIGH-CONTRAST ALERT CARDS ==================== */
      .pp-alert {
        margin-top: 14px;
        padding: 15px 18px;
        border-radius: 15px;
        display: flex;
        align-items: flex-start;
        gap: 13px;
        font-size: 14px;
        line-height: 1.78;
      }

      .pp-alert-icon {
        width: 36px;
        height: 36px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }

      .pp-alert-amber {
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        border: 1.5px solid #fcd34d;
        color: #78350f;
        box-shadow: 0 5px 16px -6px rgba(245, 158, 11, 0.22);
      }

      .pp-alert-amber .pp-alert-icon {
        background: rgba(245, 158, 11, 0.18);
      }

      .dark .pp-alert-amber {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(120, 53, 15, 0.22) 100%);
        border-color: rgba(251, 191, 36, 0.42);
        color: #fde68a;
      }

      .pp-alert-emerald {
        margin-top: 0;
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        border: 1.5px solid #6ee7b7;
        color: #065f46;
        box-shadow: 0 5px 16px -6px rgba(16, 185, 129, 0.22);
      }

      .pp-alert-emerald .pp-alert-icon {
        background: rgba(16, 185, 129, 0.18);
      }

      .dark .pp-alert-emerald {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 78, 59, 0.28) 100%);
        border-color: rgba(52, 211, 153, 0.42);
        color: #a7f3d0;
      }

      .pp-alert-blue {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border: 1.5px solid #93c5fd;
        color: #1e3a8a;
        box-shadow: 0 5px 16px -6px rgba(59, 130, 246, 0.2);
      }

      .pp-alert-blue .pp-alert-icon {
        background: rgba(59, 130, 246, 0.16);
      }

      .dark .pp-alert-blue {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.16) 0%, rgba(30, 58, 138, 0.26) 100%);
        border-color: rgba(96, 165, 250, 0.42);
        color: #bfdbfe;
      }

      /* Links */
      .pp-link {
        color: var(--pp-emerald-dark);
        font-weight: 700;
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.15s ease;
      }

      .dark .pp-link {
        color: #34d399;
      }

      .pp-link:hover {
        color: #10b981;
      }

      /* ==================== 6. 3D CONTACT CARDS & ACTION BUTTONS ==================== */
      .pp-contact-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 14px;
        margin-top: 14px;
      }

      @media (min-width: 640px) {
        .pp-contact-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .pp-contact-span-2 {
          grid-column: span 2 / span 2;
        }
      }

      .pp-contact-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 13px;
        background: var(--pp-surface);
        border: 1px solid var(--pp-border);
        border-radius: 16px;
        padding: 16px 18px;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 5px 0 -1px var(--pp-border-3d);
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .dark .pp-contact-card {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.05) inset,
          0 5px 0 -1px #020617;
      }

      .pp-contact-card:hover {
        transform: translateY(-3px);
        border-color: #10b981;
        box-shadow:
          0 6px 0 -1px rgba(16, 185, 129, 0.28),
          0 14px 26px -8px rgba(16, 185, 129, 0.2);
      }

      .pp-contact-top {
        display: flex;
        align-items: center;
        gap: 13px;
        min-width: 0;
      }

      .pp-contact-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.16), rgba(5, 150, 105, 0.08));
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #059669;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }

      .dark .pp-contact-icon {
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.4));
        color: #34d399;
      }

      .pp-contact-info {
        min-width: 0;
        flex: 1;
      }

      .pp-contact-label {
        font-size: 12.5px;
        font-weight: 700;
        color: var(--pp-text-muted);
        margin-bottom: 2px;
      }

      .pp-contact-value {
        font-size: 15px;
        font-weight: 700;
        color: var(--pp-text-main);
        word-break: break-all;
        text-decoration: none;
      }

      .pp-contact-value-accent {
        color: var(--pp-emerald-dark);
      }

      .dark .pp-contact-value-accent {
        color: #34d399;
      }

      .pp-contact-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .pp-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 13px;
        border-radius: 10px;
        font-size: 12.5px;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        border: 1px solid rgba(16, 185, 129, 0.35);
        background: rgba(16, 185, 129, 0.1);
        color: var(--pp-emerald-dark);
        box-shadow: 0 3px 0 rgba(16, 185, 129, 0.22);
        transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
      }

      .dark .pp-action-btn {
        background: rgba(16, 185, 129, 0.16);
        color: #6ee7b7;
      }

      .pp-action-btn:hover {
        transform: translateY(-2px);
        background: #10b981;
        color: #ffffff;
        border-color: #10b981;
        box-shadow: 0 4px 0 #047857;
      }

      .pp-action-btn:active {
        transform: translateY(1px);
        box-shadow: 0 1px 0 #047857;
      }

      .pp-action-btn.pp-btn-copied {
        background: #059669 !important;
        color: #ffffff !important;
        border-color: #059669 !important;
      }

      /* Closing Banner Card */
      .pp-closing-banner {
        margin-top: 20px;
        padding: 24px 20px;
        border-radius: 18px;
        text-align: center;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 165, 233, 0.08) 100%);
        border: 1.5px solid rgba(16, 185, 129, 0.32);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 9px;
      }

      .pp-closing-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--pp-text-main);
      }

      .pp-closing-desc {
        font-size: 14px;
        line-height: 1.75;
        color: var(--pp-text-body);
        max-width: 640px;
        margin: 0;
      }

      .pp-footer-nav-row {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }

      /* Staggered Entrance Delays */
      .pp-section-group:nth-of-type(1) { animation-delay: 0.04s; }
      .pp-section-group:nth-of-type(2) { animation-delay: 0.08s; }
      .pp-section-group:nth-of-type(3) { animation-delay: 0.12s; }
      .pp-section-group:nth-of-type(4) { animation-delay: 0.16s; }
      .pp-section-group:nth-of-type(5) { animation-delay: 0.20s; }

      /* Print Support */
      @media print {
        .pp-nav-deck,
        .pp-hero-actions,
        .pp-toggle-btn,
        .pp-contact-actions,
        .pp-footer-nav-row {
          display: none !important;
        }
        .pp-card,
        .pp-hero {
          box-shadow: none !important;
          break-inside: avoid;
        }
        .pp-section-group.pp-collapsed .pp-group-body {
          display: flex !important;
        }
      }
    </style>

    <div class="pp-page-root" id="pp-top-anchor">
      <div class="pp-stack">

        <!-- 1. 3D Hero Header Card -->
        <section class="pp-hero">
          <div class="pp-hero-orb-1"></div>
          <div class="pp-hero-orb-2"></div>
          <div class="pp-hero-grid-pattern"></div>

          <div class="pp-hero-inner">
            <div class="pp-hero-top-row">
              <div class="pp-hero-badge">
                <span class="pp-status-dot"></span>
                <span>🛡️ ডেটা নিরাপত্তা ও ব্যবহারকারীর গোপনীয়তার অধিকার</span>
              </div>

              <div class="pp-hero-actions">
                <button type="button" class="pp-btn-3d" onclick="window.print()">
                  <span>🖨️</span>
                  <span>প্রিন্ট করুন</span>
                </button>
                <a href="#pp-grp-11" onclick="event.preventDefault(); window.__dcbdPrivacyUI.jumpTo('pp-grp-11')" class="pp-btn-3d pp-btn-3d-primary">
                  <span>📞</span>
                  <span>প্রাইভেসি সাপোর্ট</span>
                </a>
              </div>
            </div>

            <h1 class="pp-hero-title">
              গোপনীয়তা নীতি (Privacy Policy)
            </h1>

            <p class="pp-hero-subtitle">
              Dream Cart BD — Smart Digital Commerce &amp; Multi-Vendor Platform-এ আপনার তথ্যের সর্বোচ্চ নিরাপত্তা, স্বচ্ছতা ও সুরক্ষা নিশ্চিত করার বিশদ রূপরেখা।
            </p>

            <!-- 3D Privacy Trust Highlights -->
            <div class="pp-hero-stats">
              <div class="pp-stat-card">
                <div class="pp-stat-icon">🔒</div>
                <div>
                  <div class="pp-stat-val">১৬টি বিশদ নীতিমালা</div>
                  <div class="pp-stat-lbl">১২টি সুসংগঠিত বিভাগে সাজানো</div>
                </div>
              </div>
              <div class="pp-stat-card">
                <div class="pp-stat-icon">🚫</div>
                <div>
                  <div class="pp-stat-val">ব্যক্তিগত তথ্য বিক্রয় নিষিদ্ধ</div>
                  <div class="pp-stat-lbl">তৃতীয় পক্ষের কাছে কোনো ডেটা বিক্রি নয়</div>
                </div>
              </div>
              <div class="pp-stat-card">
                <div class="pp-stat-icon">🛡️</div>
                <div>
                  <div class="pp-stat-val">কখনো PIN / OTP নয়</div>
                  <div class="pp-stat-lbl">সর্বোচ্চ লেনদেন ও অ্যাকাউন্ট সুরক্ষা</div>
                </div>
              </div>
            </div>

            <!-- Metadata Chips -->
            <div class="pp-meta-grid">
              <div class="pp-meta-chip">
                <span>🌐</span>
                <span><strong>ওয়েবসাইট:</strong> https://dreamcartbd.com/</span>
              </div>
              <div class="pp-meta-chip">
                <span>🏢</span>
                <span><strong>প্রতিষ্ঠানের নাম:</strong> Dream Cart BD</span>
              </div>
              <div class="pp-meta-chip">
                <span>📅</span>
                <span><strong>কার্যকর হওয়ার তারিখ:</strong> ১১ অক্টোবর ২০২৬</span>
              </div>
              <div class="pp-meta-chip">
                <span>🔄</span>
                <span><strong>সর্বশেষ আপডেট:</strong> ১১ অক্টোবর ২০২৬</span>
              </div>
              <div class="pp-meta-chip">
                <span>⚖️</span>
                <span><strong>আইন:</strong> বাংলাদেশ ভোক্তা অধিকার ও ডিজিটাল কমার্স আইন</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Interactive Search & 3D Quick Jump Navigation Deck -->
        <section class="pp-card pp-nav-deck">
          <div class="pp-nav-header">
            <div class="pp-nav-heading-wrap">
              <div class="pp-nav-heading">
                <span>🧭</span>
                <span>দ্রুত খুঁজে নিন (সার্চ ও নেভিগেশন)</span>
              </div>
              <div class="pp-search-count" id="pp-search-count">মোট ১২টি বিভাগ • ১৬টি ধারা</div>
            </div>

            <div class="pp-search-controls">
              <div class="pp-search-box">
                <span class="pp-search-icon">🔍</span>
                <input
                  type="text"
                  id="pp-search-input"
                  class="pp-search-input"
                  placeholder="ধারা বা বিষয় খুঁজুন (যেমন: কুকিজ, পেমেন্ট, অধিকার)..."
                  oninput="window.__dcbdPrivacyUI.filter(this.value)"
                />
                <button
                  type="button"
                  id="pp-search-clear"
                  class="pp-search-clear"
                  aria-label="সার্চ মুছুন"
                  onclick="window.__dcbdPrivacyUI.clearSearch()"
                >×</button>
              </div>

              <div class="pp-mini-controls">
                <button type="button" class="pp-btn-soft" onclick="window.__dcbdPrivacyUI.toggleAll(true)">
                  <span>📂</span>
                  <span>সব খুলুন</span>
                </button>
                <button type="button" class="pp-btn-soft" onclick="window.__dcbdPrivacyUI.toggleAll(false)">
                  <span>📁</span>
                  <span>সংক্ষিপ্ত</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Jump 3D Pills -->
          <div class="pp-nav-pills">
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-1', this)" class="pp-nav-pill">🏛️ ১. ভূমিকা</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-2', this)" class="pp-nav-pill">📋 ২. তথ্য সংগ্রহ</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-3', this)" class="pp-nav-pill">🎯 ৩. তথ্যের ব্যবহার</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-4', this)" class="pp-nav-pill">🤝 ৪. তথ্য শেয়ারিং</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-5', this)" class="pp-nav-pill">📢 ৫. প্রচারণা ও অফার</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-6', this)" class="pp-nav-pill">🛡️ ৬. ডেটা নিরাপত্তা</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-7', this)" class="pp-nav-pill">⏳ ৭. সংরক্ষণের মেয়াদ</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-8', this)" class="pp-nav-pill">⚖️ ৮. আপনার অধিকার</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-9', this)" class="pp-nav-pill">🌐 ৯-১২. বিশেষ নির্দেশিকা</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-10', this)" class="pp-nav-pill">📜 ১৩-১৪. ব্রিচ ও পরিবর্তন</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-11', this)" class="pp-nav-pill">📞 ১৫. যোগাযোগ</button>
            <button type="button" onclick="window.__dcbdPrivacyUI.jumpTo('pp-grp-12', this)" class="pp-nav-pill">⚖️ ১৬. প্রযোজ্য আইন</button>
          </div>
        </section>

        <!-- Empty Search State -->
        <div class="pp-empty-state" id="pp-empty-state">
          <div class="pp-empty-icon">🔎</div>
          <div class="pp-empty-title">কোনো ধারা খুঁজে পাওয়া যায়নি</div>
          <div class="pp-empty-desc">অনুগ্রহ করে অন্য কোনো শব্দ দিয়ে চেষ্টা করুন অথবা সার্চ রিসেট করুন।</div>
          <button type="button" class="pp-btn-3d pp-btn-3d-primary" onclick="window.__dcbdPrivacyUI.clearSearch()">
            <span>↺</span>
            <span>সব গোপনীয়তা নীতি দেখুন</span>
          </button>
        </div>

        <!-- 3. Thematic 3D Card Groups -->

        <!-- Group 1: ১. ভূমিকা -->
        <article class="pp-card pp-section-group" id="pp-grp-1">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-1')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">🏛️</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ০১ • ধারা ১</span>
                <h2 class="pp-group-title">১. ভূমিকা (Introduction)</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <div class="pp-clause-item" id="pp-sec-1">
              <p class="pp-text">
                Dream Cart BD-তে আপনাকে স্বাগতম। আমাদের ওয়েবসাইট ব্যবহারকারী, গ্রাহক, বিক্রেতা, ভেন্ডর, রিসেলার এবং হোলসেলারদের ব্যক্তিগত তথ্যের গোপনীয়তা ও নিরাপত্তা রক্ষা করা আমাদের গুরুত্বপূর্ণ দায়িত্ব।
              </p>
              <p class="pp-text">
                এই গোপনীয়তা নীতিতে ব্যাখ্যা করা হয়েছে, আপনি আমাদের ওয়েবসাইট ব্যবহার করলে বা অর্ডার করলে আমরা কী ধরনের তথ্য সংগ্রহ করতে পারি, কেন সেই তথ্য ব্যবহার করি, কার সঙ্গে প্রয়োজন অনুযায়ী শেয়ার করতে পারি এবং কীভাবে তথ্যের নিরাপত্তা রক্ষার চেষ্টা করি।
              </p>
              <p class="pp-text">
                Dream Cart BD-এর ওয়েবসাইট ব্যবহার, অ্যাকাউন্ট তৈরি, অর্ডার প্রদান অথবা আমাদের সেবা গ্রহণের আগে অনুগ্রহ করে এই নীতিটি মনোযোগ দিয়ে পড়ুন।
              </p>
              <div class="pp-website-pill">
                <span>🌐 অফিসিয়াল ওয়েবসাইট:</span>
                <a href="https://dreamcartbd.com/" target="_blank" rel="noopener noreferrer" class="pp-link">https://dreamcartbd.com/</a>
              </div>
            </div>
          </div>
        </article>

        <!-- Group 2: ২. আমরা কী ধরনের তথ্য সংগ্রহ করি -->
        <article class="pp-card pp-section-group" id="pp-grp-2">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-2')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">📋</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ০২ • ধারা ২ (২.১ – ২.৫)</span>
                <h2 class="pp-group-title">২. আমরা কী ধরনের তথ্য সংগ্রহ করি</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <p class="pp-group-intro">
              আমাদের সেবা পরিচালনা, অর্ডার সম্পন্ন করা, পেমেন্ট যাচাই এবং গ্রাহকসেবা প্রদানের জন্য প্রয়োজন অনুযায়ী বিভিন্ন ধরনের তথ্য সংগ্রহ করা হতে পারে।
            </p>

            <!-- ২.১ ব্যক্তিগত তথ্য -->
            <div class="pp-clause-item" id="pp-sec-2-1">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ২.১</span>
                <span>ব্যক্তিগত তথ্য</span>
                <span class="pp-clause-en">(Personal Information)</span>
              </div>
              <p class="pp-text">আপনি অ্যাকাউন্ট তৈরি বা অর্ডার করার সময় নিচের তথ্য দিতে পারেন:</p>
              <ul class="pp-list pp-list-2col">
                <li>সম্পূর্ণ নাম।</li>
                <li>মোবাইল নম্বর।</li>
                <li>ইমেইল ঠিকানা।</li>
                <li>ডেলিভারির ঠিকানা।</li>
                <li>জেলা, উপজেলা, থানা এবং এলাকার তথ্য।</li>
                <li>বাড়ি, রাস্তা বা পরিচিত স্থানের বিবরণ।</li>
                <li>বিলিং-সংক্রান্ত তথ্য, যেখানে প্রযোজ্য।</li>
                <li>গ্রাহকসেবার সঙ্গে যোগাযোগের তথ্য।</li>
              </ul>
            </div>

            <!-- ২.২ অ্যাকাউন্ট-সংক্রান্ত তথ্য -->
            <div class="pp-clause-item" id="pp-sec-2-2">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ২.২</span>
                <span>অ্যাকাউন্ট-সংক্রান্ত তথ্য</span>
                <span class="pp-clause-en">(Account Data)</span>
              </div>
              <p class="pp-text">আপনি ওয়েবসাইটে অ্যাকাউন্ট তৈরি করলে আপনার অ্যাকাউন্ট পরিচালনার জন্য প্রয়োজনীয় তথ্য সংরক্ষণ করা হতে পারে, যেমন:</p>
              <ul class="pp-list pp-list-2col">
                <li>ইউজার আইডি।</li>
                <li>অ্যাকাউন্টের নাম ও যোগাযোগের তথ্য।</li>
                <li>অর্ডারের ইতিহাস।</li>
                <li>অ্যাকাউন্টের পছন্দ ও সেটিংস।</li>
                <li>অ্যাকাউন্টের নিরাপত্তা-সংক্রান্ত রেকর্ড।</li>
              </ul>

              <div class="pp-alert pp-alert-amber">
                <div class="pp-alert-icon">⚠️</div>
                <div>
                  <strong>সংবেদনশীল তথ্যের নিরাপত্তা সতর্কতা:</strong>
                  পাসওয়ার্ডের মতো সংবেদনশীল তথ্য সুরক্ষিত পদ্ধতিতে পরিচালনা করা উচিত। আমরা কখনো গ্রাহকের কাছে তার পাসওয়ার্ড, পেমেন্ট PIN বা OTP চেয়ে অর্ডার নিশ্চিত করার চেষ্টা করব না।
                </div>
              </div>
            </div>

            <!-- ২.৩ অর্ডার ও লেনদেনের তথ্য -->
            <div class="pp-clause-item" id="pp-sec-2-3">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ২.৩</span>
                <span>অর্ডার ও লেনদেনের তথ্য</span>
                <span class="pp-clause-en">(Order &amp; Transaction Details)</span>
              </div>
              <p class="pp-text">অর্ডার সম্পন্ন করার জন্য আমরা প্রয়োজন অনুযায়ী সংগ্রহ বা সংরক্ষণ করতে পারি:</p>
              <ul class="pp-list pp-list-2col">
                <li>অর্ডার নম্বর।</li>
                <li>পণ্যের নাম, পরিমাণ ও মূল্য।</li>
                <li>প্রযোজ্য ডিসকাউন্ট ও ডেলিভারি চার্জ।</li>
                <li>অর্ডারের তারিখ ও সময়।</li>
                <li>অর্ডারের বর্তমান অবস্থা।</li>
                <li>পেমেন্ট পদ্ধতি ও লেনদেনের রেফারেন্স।</li>
                <li>ডেলিভারি ও ট্র্যাকিং-সংক্রান্ত তথ্য।</li>
                <li>রিটার্ন, রিফান্ড ও অভিযোগের বিবরণ।</li>
              </ul>
              <p class="pp-text-note">
                কার্ড বা মোবাইল ফাইন্যান্সিয়াল সার্ভিসের সম্পূর্ণ গোপন পেমেন্ট তথ্য আমরা অপ্রয়োজনে সংগ্রহ করার উদ্দেশ্যে ব্যবহার করি না। পেমেন্ট প্রসেসরের মাধ্যমে লেনদেন সম্পন্ন হলে সেই সেবাদাতার নিজস্ব গোপনীয়তা নীতিও প্রযোজ্য হতে পারে।
              </p>
            </div>

            <!-- ২.৪ প্রযুক্তিগত তথ্য -->
            <div class="pp-clause-item" id="pp-sec-2-4">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ২.৪</span>
                <span>প্রযুক্তিগত তথ্য</span>
                <span class="pp-clause-en">(Technical Information)</span>
              </div>
              <p class="pp-text">
                ওয়েবসাইটের নিরাপত্তা, কার্যকারিতা ও ব্যবহারকারীর অভিজ্ঞতা উন্নত করার জন্য প্রযুক্তিগত তথ্য সংগ্রহ করা হতে পারে, যেমন:
              </p>
              <div class="pp-sub-grid">
                <div class="pp-sub-box">
                  <div class="pp-sub-term">🌐 আইপি ও নেটওয়ার্ক</div>
                  <div class="pp-sub-desc">IP address ও নেটওয়ার্ক কানেক্টিভিটি তথ্য।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">💻 ব্রাউজার ও সিস্টেম</div>
                  <div class="pp-sub-desc">ব্রাউজারের ধরন ও সংস্করণ, ডিভাইসের ধরন ও অপারেটিং সিস্টেম।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">⏱️ ব্রাউজিং টাইমলাইন</div>
                  <div class="pp-sub-desc">ওয়েবসাইটে প্রবেশের সময়কাল ও সেশন স্থায়িত্ব।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">🔍 ভিজিট লগ ও ত্রুটি</div>
                  <div class="pp-sub-desc">ভিজিট করা পেজ ও সংশ্লিষ্ট কার্যক্রম, ত্রুটি ও নিরাপত্তা-সংক্রান্ত লগ।</div>
                </div>
              </div>
              <p class="pp-text-note">
                কোন তথ্য বাস্তবে সংগ্রহ করা হবে, তা ওয়েবসাইটের প্রযুক্তিগত ব্যবস্থা, হোস্টিং এবং ব্যবহৃত সেবার ওপর নির্ভর করবে।
              </p>
            </div>

            <!-- ২.৫ কুকিজ ও অনুরূপ প্রযুক্তি -->
            <div class="pp-clause-item" id="pp-sec-2-5">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ২.৫</span>
                <span>কুকিজ ও অনুরূপ প্রযুক্তি</span>
                <span class="pp-clause-en">(Cookies Policy)</span>
              </div>
              <p class="pp-text">আমাদের ওয়েবসাইটে কুকিজ বা অনুরূপ প্রযুক্তি ব্যবহার করা হতে পারে, যাতে:</p>
              <ul class="pp-list">
                <li>শপিং কার্টের তথ্য ধরে রাখা যায়।</li>
                <li>ব্যবহারকারীর লগইন সেশন পরিচালনা করা যায়।</li>
                <li>ওয়েবসাইটের পছন্দ ও সেটিংস সংরক্ষণ করা যায়।</li>
                <li>নিরাপত্তা উন্নত করা যায়।</li>
                <li>ওয়েবসাইটের কার্যকারিতা বিশ্লেষণ করা যায়, যেখানে প্রযোজ্য।</li>
              </ul>
              <div class="pp-alert pp-alert-blue">
                <div class="pp-alert-icon">💡</div>
                <div>
                  <strong>কুকিজ নিয়ন্ত্রণ:</strong> আপনি ব্রাউজারের সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে পারেন। তবে কিছু কুকিজ বন্ধ করলে ওয়েবসাইটের নির্দিষ্ট ফিচার সঠিকভাবে কাজ নাও করতে পারে।
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Group 3: ৩. আমরা কেন আপনার তথ্য ব্যবহার করি -->
        <article class="pp-card pp-section-group" id="pp-grp-3">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-3')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">🎯</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ০৩ • ধারা ৩</span>
                <h2 class="pp-group-title">৩. আমরা কেন আপনার তথ্য ব্যবহার করি</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <div class="pp-clause-item" id="pp-sec-3">
              <p class="pp-text">
                Dream Cart BD আপনার তথ্য প্রয়োজনীয় ও বৈধ ব্যবসায়িক উদ্দেশ্যে ব্যবহার করতে পারে, যেমন:
              </p>
              <ul class="pp-num-list">
                <li><span class="pp-num-badge">১</span> গ্রাহকের অ্যাকাউন্ট তৈরি ও পরিচালনা করা।</li>
                <li><span class="pp-num-badge">২</span> অর্ডার গ্রহণ, নিশ্চিতকরণ, প্রস্তুত ও সম্পন্ন করা।</li>
                <li><span class="pp-num-badge">৩</span> পেমেন্ট যাচাই এবং প্রযোজ্য রিফান্ড পরিচালনা করা।</li>
                <li><span class="pp-num-badge">৪</span> পণ্য ডেলিভারি এবং কুরিয়ার সেবার সঙ্গে সমন্বয় করা।</li>
                <li><span class="pp-num-badge">৫</span> অর্ডারের অবস্থা, ডেলিভারি বা গুরুত্বপূর্ণ পরিবর্তন সম্পর্কে জানানো।</li>
                <li><span class="pp-num-badge">৬</span> গ্রাহকের প্রশ্ন, অভিযোগ, রিটার্ন ও ওয়ারেন্টি-সংক্রান্ত অনুরোধ সমাধান করা।</li>
                <li><span class="pp-num-badge">৭</span> জালিয়াতি, অননুমোদিত কার্যক্রম এবং নিরাপত্তা ঝুঁকি প্রতিরোধ করা।</li>
                <li><span class="pp-num-badge">৮</span> ওয়েবসাইটের কার্যকারিতা ও ব্যবহারকারীর অভিজ্ঞতা উন্নত করা।</li>
                <li><span class="pp-num-badge">৯</span> প্রযোজ্য আইন, হিসাবরক্ষণ ও বৈধ ব্যবসায়িক দায়িত্ব পালন করা।</li>
                <li><span class="pp-num-badge">১০</span> আপনার সম্মতি বা প্রযোজ্য আইনি ভিত্তি থাকলে নতুন পণ্য, অফার বা প্রচারণার তথ্য জানানো।</li>
              </ul>
              <p class="pp-text-strong-note">
                আমরা সংগৃহীত তথ্যকে সংশ্লিষ্ট উদ্দেশ্যের সঙ্গে সামঞ্জস্য রেখে ব্যবহার করার চেষ্টা করি।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 4: ৪. আপনার তথ্য কার সঙ্গে শেয়ার করা হতে পারে -->
        <article class="pp-card pp-section-group" id="pp-grp-4">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-4')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">🤝</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ০৪ • ধারা ৪ (৪.১ – ৪.৬)</span>
                <h2 class="pp-group-title">৪. আপনার তথ্য কার সঙ্গে শেয়ার করা হতে পারে</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <!-- Strict Zero Data Sale Policy -->
            <div class="pp-alert pp-alert-emerald">
              <div class="pp-alert-icon">🛡️</div>
              <div>
                <strong>গোপনীয়তার নিশ্চয়তা:</strong>
                Dream Cart BD আপনার ব্যক্তিগত তথ্য বিক্রি করার উদ্দেশ্যে ব্যবহার করে না। তবে সেবা প্রদানের জন্য প্রয়োজন হলে এবং আইনসম্মত ভিত্তি থাকলে সীমিত তথ্য সংশ্লিষ্ট পক্ষের সঙ্গে শেয়ার করা হতে পারে।
              </div>
            </div>

            <div class="pp-clause-item" id="pp-sec-4">
              <div class="pp-sub-grid" style="margin-top:0;">
                <div class="pp-sub-box">
                  <div class="pp-sub-term">🚚 ৪.১ ডেলিভারি ও কুরিয়ার প্রতিষ্ঠান</div>
                  <div class="pp-sub-desc">পণ্য পৌঁছে দেওয়ার জন্য প্রয়োজনীয় নাম, মোবাইল নম্বর, ঠিকানা, অর্ডারের বিবরণ এবং ডেলিভারি-সংক্রান্ত তথ্য কুরিয়ার বা ডেলিভারি পার্টনারকে দেওয়া হতে পারে।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">💳 ৪.২ পেমেন্ট সেবাদাতা</div>
                  <div class="pp-sub-desc">পেমেন্ট গ্রহণ, লেনদেন যাচাই, প্রতারণা প্রতিরোধ বা রিফান্ডের জন্য প্রয়োজনীয় তথ্য সংশ্লিষ্ট ব্যাংক, পেমেন্ট গেটওয়ে বা মোবাইল ফাইন্যান্সিয়াল সার্ভিসের সঙ্গে শেয়ার করা হতে পারে।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">🏪 ৪.৩ ভেন্ডর ও সরবরাহকারী</div>
                  <div class="pp-sub-desc">কোনো পণ্য তৃতীয় পক্ষের বিক্রেতা বা সরবরাহকারীর মাধ্যমে সরবরাহ করা হলে অর্ডার পূরণ এবং প্রয়োজনীয় বিক্রয়োত্তর সেবার জন্য প্রাসঙ্গিক তথ্য শেয়ার করা হতে পারে।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">🖥️ ৪.৪ প্রযুক্তি ও হোস্টিং সেবাদাতা</div>
                  <div class="pp-sub-desc">ওয়েবসাইট পরিচালনা, ডেটাবেস সংরক্ষণ, নিরাপত্তা, ব্যাকআপ, ইমেইল বা অন্যান্য প্রযুক্তিগত সেবা প্রদানের জন্য অনুমোদিত সেবাদাতারা প্রয়োজন অনুযায়ী তথ্য প্রক্রিয়া করতে পারেন।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">⚖️ ৪.৫ আইন প্রয়োগকারী ও সরকারি কর্তৃপক্ষ</div>
                  <div class="pp-sub-desc">প্রযোজ্য আইন, বৈধ আদালতের আদেশ, সরকারি নির্দেশনা বা জালিয়াতি তদন্তের জন্য প্রয়োজন হলে সংশ্লিষ্ট কর্তৃপক্ষকে তথ্য দেওয়া হতে পারে।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">🏢 ৪.৬ ব্যবসায়িক পুনর্গঠন</div>
                  <div class="pp-sub-desc">ব্যবসার মালিকানা পরিবর্তন, একীভূতকরণ বা সম্পদ হস্তান্তরের মতো পরিস্থিতিতে প্রযোজ্য আইন ও গোপনীয়তার শর্ত মেনে তথ্য স্থানান্তর হতে পারে।</div>
                </div>
              </div>
              <p class="pp-text-note">
                আমরা প্রয়োজনের অতিরিক্ত ব্যক্তিগত তথ্য শেয়ার না করার চেষ্টা করি।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 5: ৫. বিজ্ঞাপন, মার্কেটিং ও প্রচারণা -->
        <article class="pp-card pp-section-group" id="pp-grp-5">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-5')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">📢</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ০৫ • ধারা ৫</span>
                <h2 class="pp-group-title">৫. বিজ্ঞাপন, মার্কেটিং ও প্রচারণা</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <div class="pp-clause-item" id="pp-sec-5">
              <p class="pp-text">
                Dream Cart BD নতুন পণ্য, বিশেষ ছাড়, অফার এবং অন্যান্য প্রাসঙ্গিক আপডেট জানাতে আপনার যোগাযোগের তথ্য ব্যবহার করতে পারে, যেখানে প্রযোজ্য সম্মতি বা অন্য বৈধ ভিত্তি রয়েছে।
              </p>
              <ul class="pp-list">
                <li>আপনি প্রচারণামূলক ইমেইল বা বার্তা পেতে না চাইলে উপলব্ধ আনসাবস্ক্রাইব ব্যবস্থা ব্যবহার করতে পারেন অথবা আমাদের সঙ্গে যোগাযোগ করতে পারেন।</li>
                <li>অর্ডার নিশ্চিতকরণ, পেমেন্ট, নিরাপত্তা বা ডেলিভারি-সংক্রান্ত গুরুত্বপূর্ণ বার্তা প্রচারণামূলক বার্তা থেকে আলাদা এবং প্রয়োজন অনুযায়ী পাঠানো হতে পারে।</li>
                <li>আমরা যদি ভবিষ্যতে বিজ্ঞাপন বা অ্যানালিটিক্স সেবা ব্যবহার করি, তাহলে সংশ্লিষ্ট প্রযুক্তি কীভাবে তথ্য সংগ্রহ করে, তা প্রযোজ্য নীতি ও সম্মতির শর্ত অনুযায়ী পরিচালিত হবে।</li>
              </ul>
            </div>
          </div>
        </article>

        <!-- Group 6: ৬. তথ্য সংরক্ষণ ও নিরাপত্তা -->
        <article class="pp-card pp-section-group" id="pp-grp-6">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-6')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">🛡️</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ০৬ • ধারা ৬</span>
                <h2 class="pp-group-title">৬. তথ্য সংরক্ষণ ও নিরাপত্তা</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <div class="pp-clause-item" id="pp-sec-6">
              <p class="pp-text">
                আপনার তথ্য অননুমোদিত প্রবেশ, ব্যবহার, পরিবর্তন, প্রকাশ বা ধ্বংস থেকে সুরক্ষিত রাখার জন্য আমরা যুক্তিসংগত প্রযুক্তিগত ও সাংগঠনিক ব্যবস্থা গ্রহণের লক্ষ্য রাখি। এসব ব্যবস্থার মধ্যে প্রযোজ্য ক্ষেত্রে থাকতে পারে:
              </p>
              <ul class="pp-list pp-list-2col">
                <li>অ্যাকাউন্টে প্রবেশাধিকার নিয়ন্ত্রণ।</li>
                <li>অনুমোদিত ব্যক্তিদের সীমিত ডেটা অ্যাক্সেস।</li>
                <li>নিরাপদ পাসওয়ার্ড ব্যবস্থাপনা।</li>
                <li>সার্ভার ও ওয়েবসাইটের নিরাপত্তা ব্যবস্থা।</li>
                <li>ব্যাকআপ এবং পুনরুদ্ধারের ব্যবস্থা।</li>
                <li>সন্দেহজনক কার্যক্রম পর্যবেক্ষণ।</li>
                <li>প্রয়োজন অনুযায়ী সফটওয়্যার ও নিরাপত্তা আপডেট।</li>
              </ul>
              <p class="pp-text-note">
                তবে ইন্টারনেটের মাধ্যমে তথ্য আদান-প্রদান বা ইলেকট্রনিক সংরক্ষণের কোনো পদ্ধতিই শতভাগ নিরাপদ বলে নিশ্চয়তা দেওয়া যায় না।
              </p>
              <p class="pp-text-note" style="margin-top:6px;">
                কোনো নিরাপত্তা ঘটনা ঘটলে আমরা পরিস্থিতি অনুযায়ী প্রয়োজনীয় ব্যবস্থা গ্রহণ এবং প্রযোজ্য আইন অনুযায়ী সংশ্লিষ্ট ব্যক্তিদের বা কর্তৃপক্ষকে অবহিত করার ব্যবস্থা নেব।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 7: ৭. আপনার তথ্য কতদিন সংরক্ষণ করা হবে -->
        <article class="pp-card pp-section-group" id="pp-grp-7">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-7')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">⏳</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ০৭ • ধারা ৭</span>
                <h2 class="pp-group-title">৭. আপনার তথ্য কতদিন সংরক্ষণ করা হবে</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <div class="pp-clause-item" id="pp-sec-7">
              <p class="pp-text">ব্যক্তিগত তথ্য প্রয়োজনীয় সময় পর্যন্ত সংরক্ষণ করা হতে পারে, যেমন:</p>
              <ul class="pp-list pp-list-2col">
                <li>অ্যাকাউন্ট সচল থাকা অবস্থায়।</li>
                <li>অর্ডার ও ডেলিভারি সম্পন্ন করার জন্য।</li>
                <li>রিটার্ন, রিফান্ড বা অভিযোগ নিষ্পত্তির জন্য।</li>
                <li>হিসাবরক্ষণ ও কর-সংক্রান্ত বাধ্যবাধকতা পালনের জন্য।</li>
                <li>জালিয়াতি প্রতিরোধ ও নিরাপত্তা রক্ষার জন্য।</li>
                <li>আইনগত দাবি প্রতিষ্ঠা, প্রতিরক্ষা বা নিষ্পত্তির জন্য।</li>
              </ul>
              <p class="pp-text-note">
                তথ্য আর প্রয়োজন না হলে, প্রযোজ্য আইন ও বৈধ সংরক্ষণ-সংক্রান্ত বাধ্যবাধকতা সাপেক্ষে সেটি মুছে ফেলা, পরিচয়বিহীন করা বা নিরাপদভাবে নিষ্পত্তি করার ব্যবস্থা নেওয়া হতে পারে।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 8: ৮. আপনার গোপনীয়তার অধিকার -->
        <article class="pp-card pp-section-group" id="pp-grp-8">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-8')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">⚖️</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ০৮ • ধারা ৮ (৮.১ – ৮.৬)</span>
                <h2 class="pp-group-title">৮. আপনার গোপনীয়তার অধিকার</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <div class="pp-clause-item" id="pp-sec-8">
              <p class="pp-text">
                প্রযোজ্য আইন ও প্রযুক্তিগত ব্যবস্থার সীমার মধ্যে আপনি আপনার ব্যক্তিগত তথ্য সম্পর্কে বিভিন্ন অনুরোধ করতে পারেন:
              </p>
              <div class="pp-sub-grid">
                <div class="pp-sub-box">
                  <div class="pp-sub-term">🔍 ৮.১ তথ্য জানার অনুরোধ</div>
                  <div class="pp-sub-desc">আপনার সম্পর্কে কী ধরনের ব্যক্তিগত তথ্য সংরক্ষিত রয়েছে এবং কী উদ্দেশ্যে ব্যবহার করা হচ্ছে, তা জানতে চাইতে পারেন।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">✏️ ৮.২ তথ্য সংশোধন</div>
                  <div class="pp-sub-desc">আপনার নাম, ফোন নম্বর, ইমেইল বা ঠিকানায় ভুল থাকলে সংশোধনের অনুরোধ করতে পারেন।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">🗑️ ৮.৩ তথ্য মুছে ফেলার অনুরোধ</div>
                  <div class="pp-sub-desc">আপনি আপনার ব্যক্তিগত তথ্য মুছে ফেলার অনুরোধ করতে পারেন। তবে আইনগতভাবে সংরক্ষণ করা প্রয়োজন এমন অর্ডার, লেনদেন বা হিসাবরক্ষণ-সংক্রান্ত তথ্য সব ক্ষেত্রে সঙ্গে সঙ্গে মুছে ফেলা সম্ভব নাও হতে পারে।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">🚫 ৮.৪ প্রচারণা বন্ধ করা</div>
                  <div class="pp-sub-desc">আপনি প্রচারণামূলক ইমেইল বা বার্তা বন্ধ করার অনুরোধ করতে পারেন। তবে প্রয়োজনীয় লেনদেন বা নিরাপত্তা-সংক্রান্ত বার্তা পাঠানো অব্যাহত থাকতে পারে।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">🔄 ৮.৫ সম্মতি প্রত্যাহার</div>
                  <div class="pp-sub-desc">কোনো নির্দিষ্ট তথ্য ব্যবহারের ভিত্তি আপনার সম্মতি হলে, প্রযোজ্য আইন অনুযায়ী সেই সম্মতি প্রত্যাহারের অনুরোধ করতে পারেন। প্রত্যাহারের আগের বৈধ প্রক্রিয়াকরণের বৈধতা এতে স্বয়ংক্রিয়ভাবে বাতিল হয় না।</div>
                </div>
                <div class="pp-sub-box">
                  <div class="pp-sub-term">📩 ৮.৬ অভিযোগ জানানো</div>
                  <div class="pp-sub-desc">আপনার ব্যক্তিগত তথ্যের ব্যবহার নিয়ে কোনো উদ্বেগ থাকলে আমাদের সঙ্গে যোগাযোগ করে অভিযোগ জানাতে পারেন।</div>
                </div>
              </div>
              <p class="pp-text-note">
                আপনার অনুরোধ যাচাই করার জন্য যুক্তিসংগত পরিচয় নিশ্চিতকরণ প্রয়োজন হতে পারে। আমরা প্রযোজ্য আইন অনুযায়ী অনুরোধ পর্যালোচনা করব।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 9: ৯ - ১২. বিশেষ নির্দেশিকা ও গ্রাহকের দায়িত্ব -->
        <article class="pp-card pp-section-group" id="pp-grp-9">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-9')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">🌐</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ০৯ • ধারা ৯ থেকে ১২</span>
                <h2 class="pp-group-title">৯ - ১২. বিশেষ বিধান ও গ্রাহকের দায়িত্ব</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <!-- ৯. শিশু ও অপ্রাপ্তবয়স্ক ব্যবহারকারীর তথ্য -->
            <div class="pp-clause-item" id="pp-sec-9">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ৯</span>
                <span>শিশু ও অপ্রাপ্তবয়স্ক ব্যবহারকারীর তথ্য</span>
              </div>
              <p class="pp-text">
                Dream Cart BD-এর সেবা ব্যবহার করার ক্ষেত্রে অপ্রাপ্তবয়স্কদের জন্য প্রযোজ্য আইন ও অভিভাবকের অনুমতির প্রয়োজনীয়তা অনুসরণ করতে হবে। যেখানে প্রয়োজন, শিশু বা অপ্রাপ্তবয়স্ক ব্যক্তির তথ্য সংগ্রহ ও ব্যবহারের ক্ষেত্রে আইনসম্মত অভিভাবকীয় সম্মতি নেওয়া হবে।
              </p>
              <p class="pp-text">
                আমরা জেনেশুনে প্রযোজ্য আইন লঙ্ঘন করে শিশুদের ব্যক্তিগত তথ্য সংগ্রহ করার উদ্দেশ্যে কাজ করি না। আপনি যদি মনে করেন কোনো শিশুর তথ্য যথাযথ অনুমতি ছাড়া আমাদের কাছে জমা হয়েছে, তাহলে আমাদের সঙ্গে যোগাযোগ করুন।
              </p>
            </div>

            <!-- ১০. তৃতীয় পক্ষের ওয়েবসাইট ও সেবা -->
            <div class="pp-clause-item" id="pp-sec-10">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ১০</span>
                <span>তৃতীয় পক্ষের ওয়েবসাইট ও সেবা</span>
              </div>
              <p class="pp-text">
                আমাদের ওয়েবসাইটে কুরিয়ার, পেমেন্ট সেবা, সামাজিক যোগাযোগমাধ্যম, বিক্রেতা বা অন্যান্য তৃতীয় পক্ষের ওয়েবসাইটের লিংক থাকতে পারে। আপনি এসব লিংকে প্রবেশ করলে সংশ্লিষ্ট তৃতীয় পক্ষের নিজস্ব গোপনীয়তা নীতি ও ব্যবহারের শর্ত প্রযোজ্য হতে পারে।
              </p>
              <p class="pp-text">
                Dream Cart BD সব তৃতীয় পক্ষের ওয়েবসাইটের তথ্য সংগ্রহ, নিরাপত্তা বা নীতিমালা সরাসরি নিয়ন্ত্রণ করে না। তাই কোনো তৃতীয় পক্ষের সেবা ব্যবহারের আগে তাদের গোপনীয়তা নীতি পর্যালোচনা করার পরামর্শ দেওয়া হচ্ছে।
              </p>
            </div>

            <!-- ১১. আন্তর্জাতিকভাবে তথ্য প্রক্রিয়াকরণ -->
            <div class="pp-clause-item" id="pp-sec-11">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ১১</span>
                <span>আন্তর্জাতিকভাবে তথ্য প্রক্রিয়াকরণ</span>
              </div>
              <p class="pp-text">
                ওয়েবসাইট হোস্টিং, ক্লাউড স্টোরেজ, ইমেইল, পেমেন্ট বা অন্যান্য প্রযুক্তিগত সেবাদাতা বাংলাদেশের বাইরে অবস্থিত সার্ভার ব্যবহার করতে পারে।
              </p>
              <p class="pp-text">
                যদি আপনার তথ্য বাংলাদেশের বাইরে সংরক্ষণ বা প্রক্রিয়াকরণ করা হয়, তাহলে প্রযোজ্য আইন ও সংশ্লিষ্ট সেবার শর্ত অনুযায়ী উপযুক্ত সুরক্ষার ব্যবস্থা গ্রহণ করা হবে। এ ধরনের সেবা বাস্তবে ব্যবহার করা হলে তার প্রকৃতি ও প্রাসঙ্গিক শর্ত অনুযায়ী প্রয়োজনীয় তথ্য এই নীতিতে হালনাগাদ করা হবে।
              </p>
            </div>

            <!-- ১২. তথ্যের যথার্থতা ও গ্রাহকের দায়িত্ব -->
            <div class="pp-clause-item" id="pp-sec-12">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ১২</span>
                <span>তথ্যের যথার্থতা ও গ্রাহকের দায়িত্ব</span>
              </div>
              <p class="pp-text">
                আমাদের সেবা সঠিকভাবে পরিচালনার জন্য গ্রাহকদের সঠিক ও হালনাগাদ তথ্য প্রদান করা প্রয়োজন। অর্ডার করার সময় ভুল ফোন নম্বর, অসম্পূর্ণ ঠিকানা বা ভুল প্রাপকের তথ্য দিলে ডেলিভারি বিলম্বিত হতে পারে।
              </p>
              <p class="pp-text">
                আপনার অ্যাকাউন্টের তথ্য পরিবর্তিত হলে, যেখানে সম্ভব, তা হালনাগাদ করুন। অন্য কোনো ব্যক্তির ব্যক্তিগত তথ্য প্রদান করার আগে নিশ্চিত করুন যে তা দেওয়ার যথাযথ অনুমতি বা আইনগত ভিত্তি আপনার রয়েছে।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 10: ১৩ & ১৪. নিরাপত্তা লঙ্ঘন ও নীতি পরিবর্তন -->
        <article class="pp-card pp-section-group" id="pp-grp-10">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-10')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">📜</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ১০ • ধারা ১৩ থেকে ১৪</span>
                <h2 class="pp-group-title">১৩ &amp; ১৪. নিরাপত্তা লঙ্ঘন ও নীতি পরিবর্তন</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <!-- ১৩. তথ্য ফাঁস বা নিরাপত্তা লঙ্ঘনের ক্ষেত্রে -->
            <div class="pp-clause-item" id="pp-sec-13">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ১৩</span>
                <span>তথ্য ফাঁস বা নিরাপত্তা লঙ্ঘনের ক্ষেত্রে</span>
              </div>
              <p class="pp-text">
                আমরা যদি জানতে পারি যে ব্যক্তিগত তথ্য অননুমোদিতভাবে প্রকাশিত হয়েছে, হারিয়ে গেছে বা ক্ষতিগ্রস্ত হয়েছে, তাহলে ঘটনার প্রকৃতি ও ঝুঁকি মূল্যায়ন করে প্রয়োজনীয় ব্যবস্থা গ্রহণের চেষ্টা করব।
              </p>
              <p class="pp-text">
                প্রযোজ্য আইন অনুযায়ী যেখানে কর্তৃপক্ষ বা সংশ্লিষ্ট ব্যক্তিকে অবহিত করা বাধ্যতামূলক, সেখানে সেই বাধ্যবাধকতা অনুসরণ করা হবে।
              </p>
              <div class="pp-alert pp-alert-amber">
                <div class="pp-alert-icon">🔔</div>
                <div>
                  <strong>সতর্কতা:</strong> গ্রাহক হিসেবে আপনার অ্যাকাউন্টে অস্বাভাবিক কার্যক্রম, সন্দেহজনক বার্তা বা তথ্যের অপব্যবহার দেখতে পেলে দ্রুত আমাদের জানান।
                </div>
              </div>
            </div>

            <!-- ১৪. গোপনীয়তা নীতির পরিবর্তন -->
            <div class="pp-clause-item" id="pp-sec-14">
              <div class="pp-clause-title">
                <span class="pp-clause-num">ধারা ১৪</span>
                <span>গোপনীয়তা নীতির পরিবর্তন</span>
              </div>
              <p class="pp-text">
                Dream Cart BD প্রয়োজন অনুযায়ী এই Privacy Policy সংশোধন বা হালনাগাদ করতে পারে। ওয়েবসাইটের কার্যক্রম, নতুন ফিচার, তথ্য ব্যবহারের পদ্ধতি বা প্রযোজ্য আইন পরিবর্তিত হলে নীতিতে সংশোধন আনা হতে পারে।
              </p>
              <p class="pp-text">
                সংশোধিত নীতি এই পেজে প্রকাশ করা হবে এবং প্রয়োজন অনুযায়ী কার্যকর হওয়ার তারিখ হালনাগাদ করা হবে। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে প্রযোজ্য আইন অনুযায়ী যথাযথভাবে অবহিত করা বা নতুন সম্মতি নেওয়ার ব্যবস্থা করা হবে। গ্রাহকদের সময় সময় এই পেজটি পর্যালোচনা করার পরামর্শ দেওয়া হচ্ছে।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 11: ১৫. আমাদের সঙ্গে যোগাযোগ -->
        <article class="pp-card pp-section-group" id="pp-grp-11">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-11')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">📞</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ১১ • ধারা ১৫</span>
                <h2 class="pp-group-title">১৫. আমাদের সঙ্গে যোগাযোগ</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <div class="pp-clause-item" id="pp-sec-15">
              <p class="pp-text">
                আপনার ব্যক্তিগত তথ্য, অ্যাকাউন্ট, গোপনীয়তা, তথ্য সংশোধন, তথ্য মুছে ফেলা বা এই নীতি সম্পর্কে কোনো প্রশ্ন থাকলে নিচের যোগাযোগের মাধ্যম ব্যবহার করুন:
              </p>

              <div class="pp-contact-grid">
                <!-- WhatsApp / Mobile -->
                <div class="pp-contact-card">
                  <div class="pp-contact-top">
                    <div class="pp-contact-icon">📱</div>
                    <div class="pp-contact-info">
                      <div class="pp-contact-label">WhatsApp / মোবাইল</div>
                      <a href="tel:01581703822" class="pp-contact-value pp-contact-value-accent">01581703822</a>
                    </div>
                  </div>
                  <div class="pp-contact-actions">
                    <a href="tel:01581703822" class="pp-action-btn">📱 কল করুন</a>
                    <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="pp-action-btn">💬 হোয়াটসঅ্যাপ</a>
                    <button type="button" class="pp-action-btn" onclick="window.__dcbdPrivacyUI.copyText('01581703822', this)">📋 কপি</button>
                  </div>
                </div>

                <!-- Alt Mobile -->
                <div class="pp-contact-card">
                  <div class="pp-contact-top">
                    <div class="pp-contact-icon">📞</div>
                    <div class="pp-contact-info">
                      <div class="pp-contact-label">বিকল্প মোবাইল</div>
                      <a href="tel:01818273838" class="pp-contact-value">01818273838</a>
                    </div>
                  </div>
                  <div class="pp-contact-actions">
                    <a href="tel:01818273838" class="pp-action-btn">📱 কল করুন</a>
                    <a href="https://wa.me/8801818273838" target="_blank" rel="noopener noreferrer" class="pp-action-btn">💬 হোয়াটসঅ্যাপ</a>
                    <button type="button" class="pp-action-btn" onclick="window.__dcbdPrivacyUI.copyText('01818273838', this)">📋 কপি</button>
                  </div>
                </div>

                <!-- Main Email -->
                <div class="pp-contact-card">
                  <div class="pp-contact-top">
                    <div class="pp-contact-icon">✉️</div>
                    <div class="pp-contact-info">
                      <div class="pp-contact-label">ইমেইল ঠিকানা</div>
                      <a href="mailto:dreamcartbd.store@gmail.com" class="pp-contact-value pp-contact-value-accent">dreamcartbd.store@gmail.com</a>
                    </div>
                  </div>
                  <div class="pp-contact-actions">
                    <a href="mailto:dreamcartbd.store@gmail.com" class="pp-action-btn">✉️ ইমেইল পাঠান</a>
                    <button type="button" class="pp-action-btn" onclick="window.__dcbdPrivacyUI.copyText('dreamcartbd.store@gmail.com', this)">📋 কপি</button>
                  </div>
                </div>

                <!-- Technical Email -->
                <div class="pp-contact-card">
                  <div class="pp-contact-top">
                    <div class="pp-contact-icon">📧</div>
                    <div class="pp-contact-info">
                      <div class="pp-contact-label">অতিরিক্ত ইমেইল</div>
                      <a href="mailto:jainal.dcitbd@gmail.com" class="pp-contact-value">jainal.dcitbd@gmail.com</a>
                    </div>
                  </div>
                  <div class="pp-contact-actions">
                    <a href="mailto:jainal.dcitbd@gmail.com" class="pp-action-btn">✉️ ইমেইল পাঠান</a>
                    <button type="button" class="pp-action-btn" onclick="window.__dcbdPrivacyUI.copyText('jainal.dcitbd@gmail.com', this)">📋 কপি</button>
                  </div>
                </div>

                <!-- Extra Support Email -->
                <div class="pp-contact-card pp-contact-span-2">
                  <div class="pp-contact-top">
                    <div class="pp-contact-icon">📩</div>
                    <div class="pp-contact-info">
                      <div class="pp-contact-label">অতিরিক্ত ইমেইল</div>
                      <a href="mailto:saiful05333@gmail.com" class="pp-contact-value">saiful05333@gmail.com</a>
                    </div>
                  </div>
                  <div class="pp-contact-actions">
                    <a href="mailto:saiful05333@gmail.com" class="pp-action-btn">✉️ ইমেইল পাঠান</a>
                    <button type="button" class="pp-action-btn" onclick="window.__dcbdPrivacyUI.copyText('saiful05333@gmail.com', this)">📋 কপি</button>
                  </div>
                </div>
              </div>

              <div class="pp-alert pp-alert-amber">
                <div class="pp-alert-icon">💡</div>
                <div>
                  <strong>গুরুত্বপূর্ণ নির্দেশিকা:</strong> অর্ডার-সংক্রান্ত কোনো বিষয়ে যোগাযোগ করলে অর্ডার নম্বর এবং অর্ডারের সঙ্গে ব্যবহৃত মোবাইল নম্বর উল্লেখ করুন। পরিচয় যাচাইয়ের প্রয়োজনে অতিরিক্ত তথ্য চাওয়া হতে পারে; তবে <strong>পাসওয়ার্ড, PIN বা OTP শেয়ার করবেন না।</strong>
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Group 12: ১৬. প্রযোজ্য আইন -->
        <article class="pp-card pp-section-group" id="pp-grp-12">
          <div class="pp-group-header" onclick="window.__dcbdPrivacyUI.toggleGroup('pp-grp-12')">
            <div class="pp-group-head-left">
              <div class="pp-group-icon">⚖️</div>
              <div class="pp-group-meta">
                <span class="pp-group-tag">বিভাগ ১২ • ধারা ১৬</span>
                <h2 class="pp-group-title">১৬. প্রযোজ্য আইন (Governing Law)</h2>
              </div>
            </div>
            <span class="pp-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="pp-group-body">
            <div class="pp-clause-item" id="pp-sec-16">
              <p class="pp-text">
                এই গোপনীয়তা নীতি বাংলাদেশের প্রযোজ্য আইন ও বিধিবিধানের সঙ্গে সামঞ্জস্য রেখে পরিচালিত হবে।
              </p>
              <p class="pp-text">
                ব্যক্তিগত তথ্যের সুরক্ষা, ডিজিটাল বাণিজ্য, ভোক্তা অধিকার এবং সংশ্লিষ্ট অন্যান্য বিষয়ে যে আইনগত বাধ্যবাধকতা প্রযোজ্য হবে, তা অনুসরণ করা হবে।
              </p>
              <p class="pp-text">
                এই নীতির কোনো বিধান প্রযোজ্য আইনে স্বীকৃত আপনার অধিকারকে বাতিল বা সীমিত করার উদ্দেশ্যে প্রণীত নয়।
              </p>
            </div>

            <!-- Closing Footer Banner -->
            <div class="pp-closing-banner">
              <div class="pp-closing-title">
                ✨ Dream Cart BD — আপনার বিশ্বস্ত অনলাইন শপিং গন্তব্য।
              </div>
              <p class="pp-closing-desc">
                আমাদের ওয়েবসাইট ব্যবহার করার আগে এই গোপনীয়তা নীতি এবং প্রযোজ্য অন্যান্য নীতিমালা পড়ে নেওয়ার জন্য ধন্যবাদ। আপনার ব্যক্তিগত তথ্যের গোপনীয়তা ও নিরাপত্তাকে আমরা গুরুত্ব দিই।
              </p>
              <div class="pp-footer-nav-row">
                <button type="button" class="pp-btn-soft" onclick="window.__dcbdPrivacyUI.scrollToTop()">
                  <span>⬆️</span>
                  <span>উপরে ফিরে যান</span>
                </button>
                <a href="/terms" class="pp-btn-soft">
                  <span>📑</span>
                  <span>শর্তাবলী (Terms) দেখুন</span>
                </a>
                <a href="/shop" class="pp-btn-3d pp-btn-3d-primary">
                  <span>🛒</span>
                  <span>শপিং শুরু করুন</span>
                </a>
              </div>
            </div>
          </div>
        </article>

      </div>
    </div>
  `;
}
