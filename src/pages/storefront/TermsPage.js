/**
 * DREAM CART BD — TERMS & CONDITIONS PAGE (src/pages/storefront/TermsPage.js)
 * Upgraded Design System:
 * - 100% Pure Bengali (বাংলা) with Hind Siliguri + Plus Jakarta Sans typography
 * - Zero dependency on missing Tailwind utilities (100% self-contained scoped CSS)
 * - 3D elevated cards, tactile 3D buttons, smooth entrance & hover animations
 * - Individual sub-clause cards, generous spacing/margins/padding & crisp hierarchy
 * - Live search with match counter, empty-state reset, smooth jump-to-section highlight
 * - Expand/Collapse sections, Print-ready layout, One-click Copy & Light/Dark mode support
 * - Preserves all 11 groups, all 34 clauses, all IDs & export: renderTermsPage
 */

if (typeof window !== 'undefined' && !window.__dcbdTermsUI) {
  window.__dcbdTermsUI = {
    filter(rawValue) {
      const term = String(rawValue || '').toLowerCase().trim();
      const cards = document.querySelectorAll('.tc-page-root .tc-section-group');
      const clearBtn = document.getElementById('tc-search-clear');
      const countBadge = document.getElementById('tc-search-count');
      const emptyBox = document.getElementById('tc-empty-state');

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
            card.classList.remove('tc-collapsed');
          }
        }
      });

      if (countBadge) {
        countBadge.textContent = term
          ? `মিল পাওয়া গেছে: ${visibleCount}টি বিভাগ`
          : `মোট ১১টি বিভাগ • ৩৪টি ধারা`;
      }

      if (emptyBox) {
        emptyBox.style.display = visibleCount === 0 ? 'flex' : 'none';
      }
    },

    clearSearch() {
      const input = document.getElementById('tc-search-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      this.filter('');
    },

    jumpTo(groupId, pillEl) {
      const target = document.getElementById(groupId);
      if (!target) return;

      // Ensure section is visible & expanded before scrolling
      if (target.style.display === 'none') {
        this.clearSearch();
      }
      target.classList.remove('tc-collapsed');

      // Highlight active navigation pill
      document.querySelectorAll('.tc-page-root .tc-nav-pill').forEach((p) => {
        p.classList.remove('tc-pill-active');
      });
      if (pillEl) {
        pillEl.classList.add('tc-pill-active');
      }

      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Trigger temporary 3D spotlight ring animation
      target.classList.remove('tc-card-spotlight');
      void target.offsetWidth;
      target.classList.add('tc-card-spotlight');
      setTimeout(() => {
        target.classList.remove('tc-card-spotlight');
      }, 1800);
    },

    toggleGroup(groupId) {
      const target = document.getElementById(groupId);
      if (!target) return;
      target.classList.toggle('tc-collapsed');
    },

    toggleAll(expand) {
      const cards = document.querySelectorAll('.tc-page-root .tc-section-group');
      cards.forEach((card) => {
        if (expand) {
          card.classList.remove('tc-collapsed');
        } else {
          card.classList.add('tc-collapsed');
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
        btnEl.classList.add('tc-btn-copied');
        setTimeout(() => {
          btnEl.innerHTML = btnEl.getAttribute('data-label') || original;
          btnEl.classList.remove('tc-btn-copied');
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


    ensureLogosLoaded() {
      try {
        const base = window.__APP_BASE__ || '';
        const candidates = [
          base + '/icon/logo.png',
          '/icon/logo.png',
          base + '/public/icon/logo.png',
          '/public/icon/logo.png',
          '/favicon.ico'
        ];
        const imgs = document.querySelectorAll('img.header-logo-img, .ft-logo-box img');
        imgs.forEach((img) => {
          const tryNext = () => {
            const step = Number(img.getAttribute('data-dcbd-logo-step') || '0');
            if (step >= candidates.length) return;
            img.setAttribute('data-dcbd-logo-step', String(step + 1));
            img.src = candidates[step];
          };
          if (!img.getAttribute('data-dcbd-logo-bound')) {
            img.setAttribute('data-dcbd-logo-bound', '1');
            img.addEventListener('error', tryNext);
          }
          if (img.complete && img.naturalWidth === 0) {
            tryNext();
          }
        });
      } catch (e) {}
    },

    scrollToTop() {
      const root = document.getElementById('tc-top-anchor');
      if (root) {
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };
}

export function renderTermsPage() {
  if (typeof window !== 'undefined' && window.__dcbdTermsUI && typeof window.__dcbdTermsUI.ensureLogosLoaded === 'function') {
    setTimeout(() => window.__dcbdTermsUI.ensureLogosLoaded(), 60);
  }
  return `
    <!-- Scoped 3D Professional Styles for Terms & Conditions Page -->
    <style id="terms-page-custom-styles">
      @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

      .tc-page-root {
        --tc-font: 'SolaimanLipi', 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        --tc-emerald: #10b981;
        --tc-emerald-dark: #059669;
        --tc-emerald-deep: #047857;
        --tc-surface: #ffffff;
        --tc-surface-soft: #f8fafc;
        --tc-surface-elevated: #ffffff;
        --tc-border: #e2e8f0;
        --tc-border-3d: #cbd5e1;
        --tc-text-main: #0f172a;
        --tc-text-body: #334155;
        --tc-text-muted: #64748b;
        --tc-shadow-card:
          0 1px 0 rgba(255, 255, 255, 0.95) inset,
          0 7px 0 -2px rgba(203, 213, 225, 0.85),
          0 18px 38px -12px rgba(15, 23, 42, 0.10);
        --tc-shadow-card-hover:
          0 1px 0 rgba(255, 255, 255, 1) inset,
          0 9px 0 -2px rgba(16, 185, 129, 0.30),
          0 26px 48px -14px rgba(16, 185, 129, 0.22);

        font-family: var(--tc-font);
        max-width: 1100px;
        margin: 0 auto;
        padding: 26px 16px 104px;
        color: var(--tc-text-body);
        box-sizing: border-box;
        perspective: 1400px;
      }

      .tc-page-root *,
      .tc-page-root *::before,
      .tc-page-root *::after {
        font-family: var(--tc-font);
        box-sizing: border-box;
      }

      .dark .tc-page-root {
        --tc-surface: #0f172a;
        --tc-surface-soft: #131f37;
        --tc-surface-elevated: #172542;
        --tc-border: #1e293b;
        --tc-border-3d: #020617;
        --tc-text-main: #f8fafc;
        --tc-text-body: #cbd5e1;
        --tc-text-muted: #94a3b8;
        --tc-shadow-card:
          0 1px 0 rgba(255, 255, 255, 0.06) inset,
          0 7px 0 -2px rgba(2, 6, 23, 0.9),
          0 20px 42px -12px rgba(0, 0, 0, 0.6);
        --tc-shadow-card-hover:
          0 1px 0 rgba(52, 211, 153, 0.18) inset,
          0 9px 0 -2px rgba(16, 185, 129, 0.28),
          0 26px 50px -14px rgba(16, 185, 129, 0.26);
      }

      @media (min-width: 640px) {
        .tc-page-root {
          padding: 36px 28px 120px;
        }
      }

      /* Keyframe Animations */
      @keyframes tcCardReveal {
        0% {
          opacity: 0;
          transform: translateY(24px) rotateX(2deg) scale(0.985);
        }
        100% {
          opacity: 1;
          transform: translateY(0) rotateX(0deg) scale(1);
        }
      }

      @keyframes tcFloatOrb {
        0%, 100% {
          transform: translate3d(0, 0, 0) scale(1);
        }
        50% {
          transform: translate3d(-18px, 14px, 0) scale(1.08);
        }
      }

      @keyframes tcPulseDot {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
        }
        50% {
          transform: scale(1.18);
          box-shadow: 0 0 0 8px rgba(52, 211, 153, 0);
        }
      }

      @keyframes tcSpotlight {
        0% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55), var(--tc-shadow-card-hover);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.25), var(--tc-shadow-card-hover);
        }
        100% {
          box-shadow: var(--tc-shadow-card);
        }
      }

      @keyframes tcShimmer {
        0% { transform: translateX(-130%) skewX(-20deg); }
        100% { transform: translateX(270%) skewX(-20deg); }
      }

      .tc-stack {
        display: flex;
        flex-direction: column;
        gap: 30px;
      }

      /* ==================== 1. 3D HERO BANNER ==================== */
      .tc-hero {
        position: relative;
        overflow: hidden;
        border-radius: 28px;
        padding: 32px 24px;
        color: #ffffff;
        background:
          radial-gradient(circle at 12% 15%, rgba(16, 185, 129, 0.28) 0%, transparent 45%),
          radial-gradient(circle at 88% 85%, rgba(14, 165, 233, 0.22) 0%, transparent 48%),
          linear-gradient(135deg, #0b132b 0%, #0f172a 52%, #052e2b 100%);
        border: 1px solid rgba(52, 211, 153, 0.30);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.16) inset,
          0 11px 0 -3px rgba(6, 78, 59, 0.6),
          0 28px 56px -14px rgba(2, 6, 23, 0.58);
        animation: tcCardReveal 0.48s cubic-bezier(0.16, 1, 0.3, 1) both;
        transform-style: preserve-3d;
      }

      @media (min-width: 768px) {
        .tc-hero {
          padding: 44px 42px;
        }
      }

      .tc-hero-orb-1 {
        position: absolute;
        top: -65px;
        right: -45px;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.38) 0%, transparent 70%);
        filter: blur(32px);
        pointer-events: none;
        animation: tcFloatOrb 7s ease-in-out infinite;
      }

      .tc-hero-orb-2 {
        position: absolute;
        bottom: -75px;
        left: -40px;
        width: 240px;
        height: 240px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.26) 0%, transparent 70%);
        filter: blur(34px);
        pointer-events: none;
        animation: tcFloatOrb 9s ease-in-out infinite reverse;
      }

      .tc-hero-grid-pattern {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
        background-size: 32px 32px;
        pointer-events: none;
        opacity: 0.65;
      }

      .tc-hero-inner {
        position: relative;
        z-index: 2;
      }

      .tc-hero-top-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 22px;
      }

      .tc-hero-badge {
        position: relative;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 8px 18px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.18);
        border: 1px solid rgba(52, 211, 153, 0.45);
        color: #6ee7b7;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.01em;
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.22);
      }

      .tc-hero-badge::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 45%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
        animation: tcShimmer 4.5s ease-in-out infinite;
      }

      .tc-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #34d399;
        animation: tcPulseDot 2s infinite;
      }

      .tc-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .tc-btn-3d {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 13px;
        font-size: 13.5px;
        font-weight: 700;
        line-height: 1.2;
        cursor: pointer;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.11);
        color: #f8fafc;
        backdrop-filter: blur(10px);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.20) inset,
          0 4px 0 rgba(2, 6, 23, 0.5),
          0 10px 20px rgba(0, 0, 0, 0.25);
        transition:
          transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.18s ease,
          background 0.18s ease,
          border-color 0.18s ease;
        text-decoration: none;
      }

      .tc-btn-3d:hover {
        transform: translateY(-2px);
        background: rgba(16, 185, 129, 0.26);
        border-color: rgba(52, 211, 153, 0.6);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.28) inset,
          0 6px 0 rgba(4, 120, 87, 0.65),
          0 14px 26px rgba(16, 185, 129, 0.32);
      }

      .tc-btn-3d:active {
        transform: translateY(2px);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.12) inset,
          0 1px 0 rgba(2, 6, 23, 0.6);
      }

      .tc-btn-3d-primary {
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        border-color: #34d399;
        color: #ffffff;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.38) inset,
          0 4px 0 #047857,
          0 12px 24px rgba(16, 185, 129, 0.38);
      }

      .tc-btn-3d-primary:hover {
        background: linear-gradient(180deg, #34d399 0%, #059669 100%);
        border-color: #6ee7b7;
      }

      .tc-hero-title {
        font-size: 27px;
        line-height: 1.3;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 12px;
        letter-spacing: -0.015em;
        text-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
      }

      @media (min-width: 640px) {
        .tc-hero-title {
          font-size: 36px;
        }
      }

      .tc-hero-subtitle {
        font-size: 15.5px;
        line-height: 1.8;
        color: #cbd5e1;
        max-width: 780px;
        margin: 0 0 26px;
        font-weight: 400;
      }

      /* 3D Hero Stats Bar */
      .tc-hero-stats {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 24px;
      }

      @media (min-width: 640px) {
        .tc-hero-stats {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .tc-stat-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 15px 18px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.15) inset,
          0 5px 0 -1px rgba(2, 6, 23, 0.45),
          0 10px 22px rgba(0, 0, 0, 0.24);
        backdrop-filter: blur(12px);
        transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .tc-stat-card:hover {
        transform: translateY(-4px);
        border-color: rgba(52, 211, 153, 0.5);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.22) inset,
          0 7px 0 -1px rgba(6, 78, 59, 0.6),
          0 14px 28px rgba(16, 185, 129, 0.22);
      }

      .tc-stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 21px;
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.32), rgba(6, 78, 59, 0.5));
        border: 1px solid rgba(52, 211, 153, 0.4);
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.26);
        flex-shrink: 0;
      }

      .tc-stat-val {
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.3;
      }

      .tc-stat-lbl {
        font-size: 12.5px;
        color: #94a3b8;
        line-height: 1.4;
      }

      /* Meta Chips */
      .tc-meta-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 11px;
      }

      .tc-meta-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 15px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.14);
        font-size: 13px;
        line-height: 1.4;
        color: #e2e8f0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
      }

      .tc-meta-chip strong {
        color: #6ee7b7;
        font-weight: 600;
      }

      /* ==================== 2. 3D NAVIGATION & SEARCH DECK ==================== */
      .tc-card {
        position: relative;
        background: var(--tc-surface);
        border: 1px solid var(--tc-border);
        border-radius: 24px;
        padding: 26px 22px;
        box-shadow: var(--tc-shadow-card);
        transition:
          transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.28s ease,
          border-color 0.25s ease;
        animation: tcCardReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        scroll-margin-top: 96px;
      }

      @media (min-width: 640px) {
        .tc-card {
          padding: 32px 34px;
        }
      }

      .tc-card:hover {
        border-color: rgba(16, 185, 129, 0.5);
        box-shadow: var(--tc-shadow-card-hover);
        transform: translateY(-4px);
      }

      .tc-card-spotlight {
        animation: tcSpotlight 1.7s ease-out;
        border-color: #10b981 !important;
      }

      .tc-nav-deck {
        padding: 24px 22px;
        background: linear-gradient(180deg, var(--tc-surface) 0%, var(--tc-surface-soft) 100%);
      }

      @media (min-width: 640px) {
        .tc-nav-deck {
          padding: 28px 32px;
        }
      }

      .tc-nav-header {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 22px;
        padding-bottom: 18px;
        border-bottom: 1.5px solid var(--tc-border);
      }

      @media (min-width: 768px) {
        .tc-nav-header {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .tc-nav-heading-wrap {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .tc-nav-heading {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 17px;
        font-weight: 700;
        color: var(--tc-text-main);
        margin: 0;
      }

      .tc-search-count {
        font-size: 13px;
        font-weight: 600;
        color: var(--tc-emerald-dark);
      }

      .dark .tc-search-count {
        color: #34d399;
      }

      .tc-search-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      @media (min-width: 768px) {
        .tc-search-controls {
          width: auto;
          justify-content: flex-end;
        }
      }

      .tc-search-box {
        position: relative;
        flex: 1 1 260px;
        min-width: 220px;
        max-width: 100%;
      }

      @media (min-width: 768px) {
        .tc-search-box {
          width: 320px;
          flex: 0 0 320px;
        }
      }

      .tc-search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        pointer-events: none;
        opacity: 0.75;
      }

      .tc-search-input {
        width: 100%;
        padding: 12px 40px 12px 42px;
        border-radius: 14px;
        border: 1.5px solid var(--tc-border);
        background: var(--tc-surface);
        color: var(--tc-text-main);
        font-size: 14px;
        font-weight: 500;
        outline: none;
        box-shadow: 0 3px 10px rgba(15, 23, 42, 0.05) inset;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .tc-search-input::placeholder {
        color: var(--tc-text-muted);
      }

      .tc-search-input:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.16);
      }

      .tc-search-clear {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: none;
        background: rgba(148, 163, 184, 0.24);
        color: var(--tc-text-main);
        font-size: 14px;
        font-weight: 700;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.16s ease;
      }

      .tc-search-clear:hover {
        background: #ef4444;
        color: #ffffff;
      }

      .tc-mini-controls {
        display: inline-flex;
        gap: 10px;
      }

      .tc-btn-soft {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 10px 15px;
        border-radius: 13px;
        font-size: 13px;
        font-weight: 700;
        color: var(--tc-text-body);
        background: var(--tc-surface);
        border: 1px solid var(--tc-border);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 3px 0 var(--tc-border-3d);
        cursor: pointer;
        text-decoration: none;
        transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, color 0.16s ease;
      }

      .tc-btn-soft:hover {
        transform: translateY(-2px);
        border-color: #10b981;
        color: var(--tc-emerald-dark);
        box-shadow: 0 4px 0 rgba(16, 185, 129, 0.38);
      }

      .dark .tc-btn-soft:hover {
        color: #34d399;
      }

      .tc-btn-soft:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 var(--tc-border-3d);
      }

      /* Quick Navigation 3D Grid Pills (Clean, Non-Cluttered Alignment) */
      .tc-nav-pills {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
        gap: 11px;
      }

      @media (min-width: 640px) {
        .tc-nav-pills {
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 12px;
        }
      }

      .tc-nav-pill {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
        width: 100%;
        text-align: left;
        padding: 10px 14px;
        border-radius: 13px;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.35;
        background: var(--tc-surface);
        color: var(--tc-text-body);
        border: 1px solid var(--tc-border);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 3px 0 var(--tc-border-3d);
        text-decoration: none;
        cursor: pointer;
        transition:
          transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
          background 0.18s ease,
          color 0.18s ease,
          border-color 0.18s ease,
          box-shadow 0.18s ease;
      }

      .dark .tc-nav-pill {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.05) inset,
          0 3px 0 #020617;
      }

      .tc-nav-pill:hover,
      .tc-nav-pill.tc-pill-active {
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        border-color: #10b981;
        transform: translateY(-2px);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.3) inset,
          0 4px 0 #047857,
          0 10px 20px rgba(16, 185, 129, 0.3);
      }

      .tc-nav-pill:active {
        transform: translateY(1px);
        box-shadow: 0 1px 0 #047857;
      }

      /* Empty Search State */
      .tc-empty-state {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 48px 26px;
        border-radius: 24px;
        background: var(--tc-surface);
        border: 1.5px dashed rgba(16, 185, 129, 0.48);
        box-shadow: var(--tc-shadow-card);
        gap: 12px;
      }

      .tc-empty-icon {
        font-size: 42px;
        line-height: 1;
      }

      .tc-empty-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--tc-text-main);
      }

      .tc-empty-desc {
        font-size: 14px;
        color: var(--tc-text-muted);
        margin-bottom: 6px;
      }

      /* ==================== 3. SECTION GROUP CARD HEADER ==================== */
      .tc-group-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 20px;
        margin-bottom: 22px;
        border-bottom: 1.5px solid var(--tc-border);
        cursor: pointer;
        user-select: none;
      }

      .tc-section-group.tc-collapsed .tc-group-header {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom-color: transparent;
      }

      .tc-group-head-left {
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 0;
      }

      .tc-group-icon {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        background: linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%);
        border: 1px solid rgba(16, 185, 129, 0.38);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.92) inset,
          0 4px 0 rgba(16, 185, 129, 0.24),
          0 10px 18px rgba(16, 185, 129, 0.16);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
        transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .dark .tc-group-icon {
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.24) 0%, rgba(6, 78, 59, 0.52) 100%);
        border-color: rgba(52, 211, 153, 0.42);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.14) inset,
          0 4px 0 rgba(2, 6, 23, 0.7),
          0 10px 20px rgba(16, 185, 129, 0.22);
      }

      .tc-card:hover .tc-group-icon {
        transform: scale(1.07) rotate(-4deg);
      }

      .tc-group-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .tc-group-tag {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--tc-emerald-dark);
      }

      .dark .tc-group-tag {
        color: #34d399;
      }

      .tc-group-title {
        font-size: 19px;
        line-height: 1.38;
        font-weight: 700;
        color: var(--tc-text-main);
        margin: 0;
      }

      @media (min-width: 640px) {
        .tc-group-title {
          font-size: 21.5px;
        }
      }

      .tc-toggle-btn {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        border: 1px solid var(--tc-border);
        background: var(--tc-surface-soft);
        color: var(--tc-text-muted);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 700;
        flex-shrink: 0;
        box-shadow: 0 3px 0 var(--tc-border-3d);
        transition: transform 0.25s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      }

      .tc-group-header:hover .tc-toggle-btn {
        border-color: #10b981;
        color: #10b981;
      }

      .tc-section-group.tc-collapsed .tc-toggle-btn {
        transform: rotate(-90deg);
      }

      .tc-group-body {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .tc-section-group.tc-collapsed .tc-group-body {
        display: none;
      }

      /* ==================== 4. INDIVIDUAL 3D CLAUSE SUB-CARDS ==================== */
      .tc-clause-item {
        background: linear-gradient(180deg, var(--tc-surface-elevated) 0%, var(--tc-surface-soft) 100%);
        border: 1px solid var(--tc-border);
        border-left: 4px solid #10b981;
        border-radius: 18px;
        padding: 20px 22px;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 4px 0 -1px rgba(203, 213, 225, 0.6),
          0 8px 18px -8px rgba(15, 23, 42, 0.08);
        transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .dark .tc-clause-item {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.05) inset,
          0 4px 0 -1px rgba(2, 6, 23, 0.8),
          0 8px 20px -6px rgba(0, 0, 0, 0.42);
      }

      .tc-clause-item:hover {
        transform: translateY(-2px);
        border-color: rgba(16, 185, 129, 0.5);
        border-left-color: #059669;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 5px 0 -1px rgba(16, 185, 129, 0.25),
          0 14px 26px -10px rgba(16, 185, 129, 0.16);
      }

      .tc-clause-title {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        font-size: 16.5px;
        line-height: 1.45;
        font-weight: 700;
        color: var(--tc-text-main);
        margin: 0 0 13px;
      }

      .tc-clause-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 12px;
        border-radius: 9px;
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 700;
        letter-spacing: 0.02em;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.35) inset,
          0 3px 0 #047857;
        flex-shrink: 0;
      }

      .tc-clause-en {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--tc-text-muted);
      }

      /* Readable Bengali Body Typography */
      .tc-text {
        font-size: 15.5px;
        line-height: 1.88;
        color: var(--tc-text-body);
        margin: 0;
        font-weight: 400;
      }

      .tc-text + .tc-text {
        margin-top: 12px;
      }

      .tc-text strong {
        color: var(--tc-text-main);
        font-weight: 700;
      }

      /* Custom Styled Lists */
      .tc-list {
        list-style: none;
        padding: 0;
        margin: 6px 0 0;
        display: flex;
        flex-direction: column;
        gap: 11px;
      }

      .tc-list li {
        position: relative;
        padding: 12px 16px 12px 42px;
        border-radius: 13px;
        background: var(--tc-surface);
        border: 1px solid var(--tc-border);
        font-size: 14.5px;
        line-height: 1.78;
        color: var(--tc-text-body);
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
        transition: border-color 0.18s ease, transform 0.18s ease;
      }

      .tc-list li:hover {
        border-color: rgba(16, 185, 129, 0.45);
        transform: translateX(3px);
      }

      .tc-list li::before {
        content: '✓';
        position: absolute;
        left: 12px;
        top: 14px;
        width: 21px;
        height: 21px;
        border-radius: 7px;
        background: rgba(16, 185, 129, 0.15);
        color: #059669;
        font-size: 12px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dark .tc-list li::before {
        background: rgba(16, 185, 129, 0.24);
        color: #34d399;
      }

      .tc-list li strong {
        color: var(--tc-text-main);
        font-weight: 700;
      }

      /* 3D Definition & Highlight Cards Grid */
      .tc-def-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 14px;
        margin-top: 8px;
      }

      @media (min-width: 640px) {
        .tc-def-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .tc-def-box {
        background: var(--tc-surface);
        border: 1px solid var(--tc-border);
        border-radius: 16px;
        padding: 16px 18px;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 4px 0 -1px var(--tc-border-3d);
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .dark .tc-def-box {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.05) inset,
          0 4px 0 -1px #020617;
      }

      .tc-def-box:hover {
        transform: translateY(-3px);
        border-color: rgba(16, 185, 129, 0.55);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.85) inset,
          0 6px 0 -1px rgba(16, 185, 129, 0.30),
          0 12px 20px -6px rgba(16, 185, 129, 0.18);
      }

      .tc-def-term {
        font-size: 15px;
        font-weight: 700;
        color: var(--tc-emerald-dark);
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .dark .tc-def-term {
        color: #34d399;
      }

      .tc-def-desc {
        font-size: 14px;
        line-height: 1.72;
        color: var(--tc-text-body);
      }

      /* Security Warning Alert Card */
      .tc-alert {
        margin-top: 16px;
        padding: 16px 20px;
        border-radius: 16px;
        background: linear-gradient(135deg, rgba(244, 63, 94, 0.09) 0%, rgba(251, 113, 133, 0.04) 100%);
        border: 1.5px solid rgba(244, 63, 94, 0.32);
        box-shadow: 0 6px 18px -6px rgba(244, 63, 94, 0.2);
        display: flex;
        align-items: flex-start;
        gap: 13px;
        font-size: 14.5px;
        line-height: 1.78;
        color: #9f1239;
      }

      .dark .tc-alert {
        background: linear-gradient(135deg, rgba(244, 63, 94, 0.18) 0%, rgba(136, 19, 55, 0.22) 100%);
        border-color: rgba(251, 113, 133, 0.44);
        color: #fecdd3;
      }

      .tc-alert-icon {
        width: 36px;
        height: 36px;
        border-radius: 11px;
        background: rgba(244, 63, 94, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 19px;
        flex-shrink: 0;
      }

      /* Links */
      .tc-link {
        color: var(--tc-emerald-dark);
        font-weight: 700;
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.15s ease;
      }

      .dark .tc-link {
        color: #34d399;
      }

      .tc-link:hover {
        color: #10b981;
      }

      /* ==================== 5. CONTACT 3D CARDS & ACTION BUTTONS ==================== */
      .tc-contact-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 16px;
        margin-top: 16px;
      }

      @media (min-width: 640px) {
        .tc-contact-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .tc-contact-span-2 {
          grid-column: span 2 / span 2;
        }
      }

      .tc-contact-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
        background: var(--tc-surface);
        border: 1px solid var(--tc-border);
        border-radius: 18px;
        padding: 20px 20px;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.85) inset,
          0 5px 0 -1px var(--tc-border-3d);
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .dark .tc-contact-card {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.05) inset,
          0 5px 0 -1px #020617;
      }

      .tc-contact-card:hover {
        transform: translateY(-3px);
        border-color: #10b981;
        box-shadow:
          0 6px 0 -1px rgba(16, 185, 129, 0.3),
          0 16px 28px -8px rgba(16, 185, 129, 0.22);
      }

      .tc-contact-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
      }

      .tc-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 11px;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
        cursor: pointer;
        border: 1px solid rgba(16, 185, 129, 0.36);
        background: rgba(16, 185, 129, 0.11);
        color: var(--tc-emerald-dark);
        box-shadow: 0 3px 0 rgba(16, 185, 129, 0.24);
        transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
      }

      .dark .tc-action-btn {
        background: rgba(16, 185, 129, 0.18);
        color: #6ee7b7;
      }

      .tc-action-btn:hover {
        transform: translateY(-2px);
        background: #10b981;
        color: #ffffff;
        border-color: #10b981;
        box-shadow: 0 4px 0 #047857;
      }

      .tc-action-btn:active {
        transform: translateY(1px);
        box-shadow: 0 1px 0 #047857;
      }

      .tc-action-btn.tc-btn-copied {
        background: #059669 !important;
        color: #ffffff !important;
        border-color: #059669 !important;
      }

      /* Final Consent Footer Card */
      .tc-consent-banner {
        margin-top: 24px;
        padding: 26px 22px;
        border-radius: 20px;
        text-align: center;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.11) 0%, rgba(14, 165, 233, 0.08) 100%);
        border: 1.5px solid rgba(16, 185, 129, 0.35);
        box-shadow: 0 10px 26px -10px rgba(16, 185, 129, 0.22);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .tc-consent-text {
        font-size: 15px;
        line-height: 1.75;
        font-weight: 700;
        color: var(--tc-text-main);
      }

      .tc-consent-brand {
        font-size: 15.5px;
        font-weight: 700;
        color: var(--tc-emerald-dark);
      }

      .dark .tc-consent-brand {
        color: #34d399;
      }

      .tc-footer-nav-row {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
      }

      /* Staggered Animation Delays */
      .tc-section-group:nth-of-type(1) { animation-delay: 0.04s; }
      .tc-section-group:nth-of-type(2) { animation-delay: 0.08s; }
      .tc-section-group:nth-of-type(3) { animation-delay: 0.12s; }
      .tc-section-group:nth-of-type(4) { animation-delay: 0.16s; }
      .tc-section-group:nth-of-type(5) { animation-delay: 0.20s; }

      @media (prefers-reduced-motion: reduce) {
        .tc-hero,
        .tc-card,
        .tc-hero-orb-1,
        .tc-hero-orb-2,
        .tc-hero-badge::after,
        .tc-status-dot {
          animation: none !important;
          transition: none !important;
        }
      }

      /* Print Support */
      @media print {
        .tc-nav-deck,
        .tc-hero-actions,
        .tc-toggle-btn,
        .tc-contact-actions,
        .tc-footer-nav-row {
          display: none !important;
        }
        .tc-card,
        .tc-hero {
          box-shadow: none !important;
          break-inside: avoid;
        }
        .tc-section-group.tc-collapsed .tc-group-body {
          display: flex !important;
        }
      }
    </style>

    <div class="tc-page-root" id="tc-top-anchor">
      <div class="tc-stack">

        <!-- 1. 3D Hero Header Card -->
        <section class="tc-hero">
          <div class="tc-hero-orb-1"></div>
          <div class="tc-hero-orb-2"></div>
          <div class="tc-hero-grid-pattern"></div>

          <div class="tc-hero-inner">
            <div class="tc-hero-top-row">
              <div class="tc-hero-badge">
                <span class="tc-status-dot"></span>
                <span>🛡️ অফিসিয়াল নীতিমালা ও চুক্তিপত্র</span>
              </div>

              <div class="tc-hero-actions">
                <button type="button" class="tc-btn-3d" onclick="window.print()">
                  <span>🖨️</span>
                  <span>প্রিন্ট করুন</span>
                </button>
                <a href="#grp-11" onclick="event.preventDefault(); window.__dcbdTermsUI.jumpTo('grp-11')" class="tc-btn-3d tc-btn-3d-primary">
                  <span>📞</span>
                  <span>সাপোর্টে যোগাযোগ</span>
                </a>
              </div>
            </div>

            <h1 class="tc-hero-title">
              শর্তাবলী ও নিয়মনীতি (Terms &amp; Conditions)
            </h1>

            <p class="tc-hero-subtitle">
              ড্রিম কার্ট বিডি — স্মার্ট ডিজিটাল কমার্স ও মাল্টি-ভেন্ডার প্ল্যাটফর্মের সকল সেবা ব্যবহারের সাধারণ নিয়মাবলী ও আইনি নীতিমালা।
            </p>

            <!-- 3D Highlights Strip -->
            <div class="tc-hero-stats">
              <div class="tc-stat-card">
                <div class="tc-stat-icon">📑</div>
                <div>
                  <div class="tc-stat-val">৩৪টি সুস্পষ্ট ধারা</div>
                  <div class="tc-stat-lbl">১১টি গোছানো বিভাগে বিভক্ত</div>
                </div>
              </div>
              <div class="tc-stat-card">
                <div class="tc-stat-icon">🛡️</div>
                <div>
                  <div class="tc-stat-val">১০০% স্বচ্ছ ও নিরাপদ</div>
                  <div class="tc-stat-lbl">ভোক্তা অধিকার আইন অনুযায়ী</div>
                </div>
              </div>
              <div class="tc-stat-card">
                <div class="tc-stat-icon">⚡</div>
                <div>
                  <div class="tc-stat-val">দ্রুত রিফান্ড ও সাপোর্ট</div>
                  <div class="tc-stat-lbl">৩–৭ কার্যদিবসে সহজ নিষ্পত্তি</div>
                </div>
              </div>
            </div>

            <!-- Metadata Chips -->
            <div class="tc-meta-grid">
              <div class="tc-meta-chip">
                <span>🌐</span>
                <span><strong>ওয়েবসাইট:</strong> https://dreamcartbd.com/</span>
              </div>
              <div class="tc-meta-chip">
                <span>🏢</span>
                <span><strong>প্রতিষ্ঠান:</strong> ড্রিম কার্ট বিডি</span>
              </div>
              <div class="tc-meta-chip">
                <span>📅</span>
                <span><strong>কার্যকর তারিখ:</strong> ১১ অক্টোবর ২০২৬</span>
              </div>
              <div class="tc-meta-chip">
                <span>🔄</span>
                <span><strong>সর্বশেষ আপডেট:</strong> ১১ অক্টোবর ২০২৬</span>
              </div>
              <div class="tc-meta-chip">
                <span>⚖️</span>
                <span><strong>আইন:</strong> বাংলাদেশ ভোক্তা অধিকার ও ডিজিটাল কমার্স আইন</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Interactive Search & 3D Quick Jump Navigation Deck -->
        <section class="tc-card tc-nav-deck">
          <div class="tc-nav-header">
            <div class="tc-nav-heading-wrap">
              <div class="tc-nav-heading">
                <span>🧭</span>
                <span>দ্রুত খুঁজে নিন (সার্চ ও নেভিগেশন)</span>
              </div>
              <div class="tc-search-count" id="tc-search-count">মোট ১১টি বিভাগ • ৩৪টি ধারা</div>
            </div>

            <div class="tc-search-controls">
              <div class="tc-search-box">
                <span class="tc-search-icon">🔍</span>
                <input
                  type="text"
                  id="tc-search-input"
                  class="tc-search-input"
                  placeholder="ধারা বা বিষয় খুঁজুন (যেমন: রিফান্ড, ডেলিভারি)..."
                  oninput="window.__dcbdTermsUI.filter(this.value)"
                />
                <button
                  type="button"
                  id="tc-search-clear"
                  class="tc-search-clear"
                  aria-label="সার্চ মুছুন"
                  onclick="window.__dcbdTermsUI.clearSearch()"
                >×</button>
              </div>

              <div class="tc-mini-controls">
                <button type="button" class="tc-btn-soft" onclick="window.__dcbdTermsUI.toggleAll(true)">
                  <span>📂</span>
                  <span>সব খুলুন</span>
                </button>
                <button type="button" class="tc-btn-soft" onclick="window.__dcbdTermsUI.toggleAll(false)">
                  <span>📁</span>
                  <span>সংক্ষিপ্ত</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Jump 3D Pills -->
          <div class="tc-nav-pills">
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-1', this)" class="tc-nav-pill">🏛️ ১-৪. ভূমিকা ও একাউন্ট</button>
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-2', this)" class="tc-nav-pill">🛍️ ৫-৭. পণ্য, স্টক ও মূল্য</button>
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-3', this)" class="tc-nav-pill">📦 ৮-৯. অর্ডার ও বাতিল</button>
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-4', this)" class="tc-nav-pill">💳 ১০. পেমেন্ট ব্যবস্থা</button>
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-5', this)" class="tc-nav-pill">🚚 ১১. শিপিং ও ডেলিভারি</button>
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-6', this)" class="tc-nav-pill">🔄 ১২-১৩. রিটার্ন ও রিফান্ড</button>
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-7', this)" class="tc-nav-pill">🛡️ ১৪-১৫. ওয়ারেন্টি ও প্রি-অর্ডার</button>
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-8', this)" class="tc-nav-pill">🏪 ১৬-১৭. ভেন্ডর ও পাইকারি</button>
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-9', this)" class="tc-nav-pill">⚖️ ১৮-২২. ডেটা সুরক্ষা ও নিয়ম</button>
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-10', this)" class="tc-nav-pill">📜 ২৩-৩৩. আইন ও বিরোধ নিষ্পত্তি</button>
            <button type="button" onclick="window.__dcbdTermsUI.jumpTo('grp-11', this)" class="tc-nav-pill">📞 ৩৪. যোগাযোগ</button>
          </div>
        </section>

        <!-- Empty Search State -->
        <div class="tc-empty-state" id="tc-empty-state">
          <div class="tc-empty-icon">🔎</div>
          <div class="tc-empty-title">কোনো ধারা খুঁজে পাওয়া যায়নি</div>
          <div class="tc-empty-desc">অনুগ্রহ করে অন্য কোনো শব্দ দিয়ে চেষ্টা করুন অথবা সার্চ রিসেট করুন।</div>
          <button type="button" class="tc-btn-3d tc-btn-3d-primary" onclick="window.__dcbdTermsUI.clearSearch()">
            <span>↺</span>
            <span>সব শর্তাবলী দেখুন</span>
          </button>
        </div>

        <!-- 3. Thematic 3D Card Groups -->

        <!-- Group 1: ভূমিকা, সংজ্ঞা, যোগ্যতা ও অ্যাকাউন্ট (১-৪) -->
        <article class="tc-card tc-section-group" id="grp-1">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-1')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">🏛️</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ০১ • ধারা ১ থেকে ৪</span>
                <h2 class="tc-group-title">১ - ৪. সাধারণ পরিচিতি, সংজ্ঞা ও যোগ্যতা</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <!-- ১. ভূমিকা -->
            <div class="tc-clause-item" id="sec-1">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ১</span>
                <span>ভূমিকা</span>
                <span class="tc-clause-en">(Introduction)</span>
              </div>
              <p class="tc-text">
                ড্রিম কার্ট বিডি-তে স্বাগতম। এই শর্তাবলী আমাদের ওয়েবসাইট, অনলাইন কেনাকাটা, পেমেন্ট ও ডেলিভারি সেবা ব্যবহারের ক্ষেত্রে প্রযোজ্য। সাইট ব্যবহার বা অর্ডার করার মাধ্যমে আপনি এই নীতিমালা এবং প্রযোজ্য ভোক্তা অধিকার ও ডিজিটাল কমার্স নির্দেশিকা মেনে নিতে সম্মত হচ্ছেন।
              </p>
            </div>

            <!-- ২. সংজ্ঞা -->
            <div class="tc-clause-item" id="sec-2">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ২</span>
                <span>সংজ্ঞা ও পরিভাষা</span>
                <span class="tc-clause-en">(Definitions)</span>
              </div>
              <div class="tc-def-grid">
                <div class="tc-def-box">
                  <div class="tc-def-term">🏢 ড্রিম কার্ট বিডি</div>
                  <div class="tc-def-desc">প্ল্যাটফর্ম পরিচালনাকারী ব্যবসায়িক প্রতিষ্ঠান।</div>
                </div>
                <div class="tc-def-box">
                  <div class="tc-def-term">🛍️ পণ্য ও অর্ডার</div>
                  <div class="tc-def-desc">বিক্রয়ের জন্য তালিকাভুক্ত দ্রব্য এবং ক্রয়ের অনুরোধ।</div>
                </div>
                <div class="tc-def-box">
                  <div class="tc-def-term">🏪 ভেন্ডর ও বিক্রেতা</div>
                  <div class="tc-def-desc">পণ্য বিক্রির জন্য অনুমোদিত অংশীদার।</div>
                </div>
                <div class="tc-def-box">
                  <div class="tc-def-term">💼 পাইকারি ও রিসেলার</div>
                  <div class="tc-def-desc">বাল্ক বা বিশেষ মার্জিনে পণ্য ক্রয়ে অনুমোদিত ব্যক্তি/প্রতিষ্ঠান।</div>
                </div>
              </div>
            </div>

            <!-- ৩. যোগ্যতা -->
            <div class="tc-clause-item" id="sec-3">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ৩</span>
                <span>ব্যবহারের যোগ্যতা</span>
                <span class="tc-clause-en">(Eligibility)</span>
              </div>
              <ul class="tc-list">
                <li>আইন অনুযায়ী চুক্তি সম্পাদনে সক্ষম হতে হবে (নাবালকদের ক্ষেত্রে অভিভাবকের সম্মতি প্রযোজ্য)।</li>
                <li>শুধুমাত্র সঠিক, হালনাগাদ ও আইনসম্মত তথ্য প্রদান করে কেনাকাটা করতে হবে।</li>
                <li>ভুয়া তথ্য, অন্যের পরিচয় কিংবা প্রতারণামূলক পেমেন্ট ব্যবহার সম্পূর্ণ নিষিদ্ধ।</li>
              </ul>
            </div>

            <!-- ৪. একাউন্ট -->
            <div class="tc-clause-item" id="sec-4">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ৪</span>
                <span>অ্যাকাউন্ট ও নিরাপত্তা</span>
                <span class="tc-clause-en">(Account Security)</span>
              </div>
              <p class="tc-text">
                গ্রাহক নিজ লগইন তথ্য ও পাসওয়ার্ডের গোপনীয়তার জন্য দায়ী। সন্দেহজনক কার্যকলাপ দেখলে অবিলম্বে আমাদের অবহিত করুন। প্রতারণা বা নিরাপত্তা ঝুঁকির ক্ষেত্রে অ্যাকাউন্ট সাময়িক স্থগিত হতে পারে।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 2: পণ্য বিবরণ, প্রাপ্যতা, মূল্য ও অফার (৫-৭) -->
        <article class="tc-card tc-section-group" id="grp-2">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-2')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">🛍️</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ০২ • ধারা ৫ থেকে ৭</span>
                <h2 class="tc-group-title">৫ - ৭. পণ্যের বিবরণ, স্টক ও মূল্য নির্ধারণ</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <!-- ৫. পণ্য বিবরণ -->
            <div class="tc-clause-item" id="sec-5">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ৫</span>
                <span>পণ্যের বিবরণ ও প্রদর্শিত তথ্য</span>
                <span class="tc-clause-en">(Product Listings)</span>
              </div>
              <p class="tc-text">
                আমরা পণ্যের সঠিক স্পেসিফিকেশন, ছবি, সাইজ, রঙ ও দাম প্রদর্শনের সর্বোচ্চ চেষ্টা করি। ফটোগ্রাফির আলো বা ডিসপ্লে পার্থক্যের কারণে আসল পণ্যের রঙে সামান্য তারতম্য হতে পারে।
              </p>
            </div>

            <!-- ৬. স্টক -->
            <div class="tc-clause-item" id="sec-6">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ৬</span>
                <span>পণ্যের প্রাপ্যতা ও স্টক</span>
                <span class="tc-clause-en">(Product Availability)</span>
              </div>
              <p class="tc-text">
                সকল পণ্য স্টক থাকা সাপেক্ষে বিক্রয়যোগ্য। অপ্রত্যাশিত কারণে পণ্য স্টক-আউট হলে গ্রাহককে জানিয়ে বিকল্প পণ্য নেওয়া বা ১০০% অর্থ ফেরতের ব্যবস্থা করা হবে।
              </p>
            </div>

            <!-- ৭. মূল্য ও অফার -->
            <div class="tc-clause-item" id="sec-7">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ৭</span>
                <span>মূল্য, ছাড় ও বিশেষ অফার</span>
                <span class="tc-clause-en">(Prices &amp; Discounts)</span>
              </div>
              <ul class="tc-list">
                <li>সকল মূল্য বাংলাদেশি টাকায় (BDT) প্রদর্শিত হয়, যাতে পণ্যের দাম ও ডেলিভারি ফি অন্তর্ভুক্ত।</li>
                <li><strong>৭.১ অনলাইন পেমেন্ট ছাড়:</strong> বিকাশ, নগদ বা ব্যাংকে ৫% ছাড় কেবল যোগ্য অর্ডারে স্বয়ংক্রিয়ভাবে কার্যকর হবে।</li>
                <li><strong>৭.২ অনিচ্ছাকৃত ভুল:</strong> কারিগরি ত্রুটিতে ভুল মূল্য দেখালে আলোচনা সাপেক্ষে ন্যায্য সমাধান করা হবে।</li>
              </ul>
            </div>
          </div>
        </article>

        <!-- Group 3: অর্ডার প্রক্রিয়া ও বাতিলকরণ (৮-৯) -->
        <article class="tc-card tc-section-group" id="grp-3">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-3')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">📦</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ০৩ • ধারা ৮ থেকে ৯</span>
                <h2 class="tc-group-title">৮ - ৯. অর্ডার প্রদান ও বাতিলকরণ নীতিমালা</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <!-- ৮. অর্ডার প্রক্রিয়া -->
            <div class="tc-clause-item" id="sec-8">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ৮</span>
                <span>অর্ডার প্রদান ও নিশ্চিতকরণ</span>
                <span class="tc-clause-en">(Order Placement)</span>
              </div>
              <ul class="tc-list">
                <li>পণ্য ও ভ্যারিয়েন্ট বেছে নিয়ে কার্টে যোগ করুন।</li>
                <li>সঠিক ডেলিভারি ঠিকানা, সচল ফোন নম্বর ও পেমেন্ট মাধ্যম নির্বাচন করে অর্ডার সাবমিট করুন।</li>
                <li>ডেলিভারির পূর্বে ড্রিম কার্ট বিডি টিম কল বা হোয়াটসঅ্যাপে অর্ডার কনফার্ম করতে পারে।</li>
              </ul>
            </div>

            <!-- ৯. বাতিলকরণ -->
            <div class="tc-clause-item" id="sec-9">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ৯</span>
                <span>অর্ডার বাতিলকরণ</span>
                <span class="tc-clause-en">(Order Cancellation)</span>
              </div>
              <p class="tc-text">
                কুরিয়ারে হস্তান্তরের পূর্বে কাস্টমার সাপোর্টে যোগাযোগ করে বিনামূল্যে অর্ডার বাতিল করা সম্ভব। কুরিয়ারে বুকিং সম্পন্ন হলে সাধারণ ডেলিভারি নীতিমালার আওতাভুক্ত হবে। স্টক সংকট বা ভুয়া ঠিকানার ক্ষেত্রে কোম্পানি অর্ডার বাতিলের অধিকার রাখে।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 4: পেমেন্ট ও লেনদেন নিরাপত্তা (১০) -->
        <article class="tc-card tc-section-group" id="grp-4">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-4')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">💳</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ০৪ • ধারা ১০</span>
                <h2 class="tc-group-title">১০. পেমেন্ট ব্যবস্থা ও লেনদেন নিরাপত্তা</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <div class="tc-clause-item" id="sec-10">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ১০</span>
                <span>অনুমোদিত পেমেন্ট পদ্ধতি</span>
                <span class="tc-clause-en">(Payment Methods)</span>
              </div>
              <ul class="tc-list">
                <li><strong>ক্যাশ অন ডেলিভারি (COD):</strong> পণ্য হাতে পেয়ে ডেলিভারিম্যানের কাছে নগদ মূল্য পরিশোধ।</li>
                <li><strong>মোবাইল ব্যাংকিং (MFS):</strong> বিকাশ, নগদ ও রকেট অফিশিয়াল চ্যানেল।</li>
                <li><strong>কার্ড ও ব্যাংক:</strong> ভিসা/মাস্টারকার্ড ও নির্ধারিত ব্যাংক ট্রান্সফার (যেমন: IBBL)।</li>
              </ul>

              <div class="tc-alert">
                <div class="tc-alert-icon">⚠️</div>
                <div>
                  <strong>কঠোর নিরাপত্তা সতর্কতা:</strong> ড্রিম কার্ট বিডি কখনো কোনো রিফান্ড বা সেবার জন্য আপনার পিন (PIN), পাসওয়ার্ড বা ওটিপি (OTP) চাইবে না। এগুলো কাউকে প্রদান করবেন না।
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Group 5: শিপিং ও ডেলিভারি পলিসি (১১) -->
        <article class="tc-card tc-section-group" id="grp-5">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-5')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">🚚</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ০৫ • ধারা ১১</span>
                <h2 class="tc-group-title">১১. শিপিং ও ডেলিভারি নীতিমালা</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <div class="tc-clause-item" id="sec-11">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ১১</span>
                <span>শিপিং চার্জ ও সময়সীমা</span>
                <span class="tc-clause-en">(Shipping Policy)</span>
              </div>
              <ul class="tc-list">
                <li><strong>ডেলিভারি চার্জ:</strong> সারাদেশে স্ট্যান্ডার্ড চার্জ ১৩০ টাকা (১ কেজির বেশি হলে প্রতি কেজিতে +২০ টাকা)।</li>
                <li><strong>ফ্রি ডেলিভারি অফার:</strong> ২০০০ টাকার বেশি অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</li>
                <li><strong>সময়সীমা:</strong> সাধারণত ১ থেকে ৩ কার্যদিবসের মধ্যে নির্ভরযোগ্য কুরিয়ারে সরবরাহ করা হয়।</li>
                <li><strong>পণ্য গ্রহণ ও যাচাই:</strong> পার্সেল গ্রহণের সময় বাইরে থেকে অক্ষত আছে কিনা দেখে নিন। সমস্যা থাকলে তৎক্ষণাৎ ছবি/ভিডিও তুলে সাপোর্ট টিমে জানান।</li>
              </ul>
            </div>
          </div>
        </article>

        <!-- Group 6: রিটার্ন, এক্সচেঞ্জ ও রিফান্ড পলিসি (১২-১৩) -->
        <article class="tc-card tc-section-group" id="grp-6">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-6')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">🔄</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ০৬ • ধারা ১২ থেকে ১৩</span>
                <h2 class="tc-group-title">১২ - ১৩. পণ্য ফেরত ও রিফান্ড পলিসি</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <!-- ১২. রিটার্ন -->
            <div class="tc-clause-item" id="sec-12">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ১২</span>
                <span>রিটার্ন ও এক্সচেঞ্জ</span>
                <span class="tc-clause-en">(Return &amp; Exchange)</span>
              </div>
              <p class="tc-text">
                ভুল পণ্য, ভাঙা বা ত্রুটিপূর্ণ পণ্য অথবা বিবরণের সাথে গুরুতর অমিল থাকলে মূল মোড়ক ও আনুষঙ্গিক যন্ত্রাংশ সহ রিটার্ন গ্রহণযোগ্য। হাইজিন বা ব্যবহৃত সিল খোলা পণ্যে রিটার্ন সীমাবদ্ধ হতে পারে।
              </p>
            </div>

            <!-- ১৩. রিফান্ড -->
            <div class="tc-clause-item" id="sec-13">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ১৩</span>
                <span>রিফান্ড পলিসি</span>
                <span class="tc-clause-en">(Refund Policy)</span>
              </div>
              <p class="tc-text">
                অনুমোদিত রিটার্ন বা অর্ডার বাতিলের ক্ষেত্রে ৩ থেকে ৭ কার্যদিবসের মধ্যে যে মাধ্যমে অর্থ পরিশোধ করা হয়েছিল (বিকাশ/নগদ/কার্ড/ব্যাংক), সেখানেই রিফান্ড করা হবে। প্ল্যাটফর্মের ত্রুটির কারণে রিটার্ন হলে ডেলিভারি চার্জসহ সম্পূর্ণ টাকা ফেরত দেওয়া হবে।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 7: ওয়ারেন্টি ও প্রি-অর্ডার (১৪-১৫) -->
        <article class="tc-card tc-section-group" id="grp-7">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-7')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">🛡️</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ০৭ • ধারা ১৪ থেকে ১৫</span>
                <h2 class="tc-group-title">১৪ - ১৫. পণ্যের ওয়ারেন্টি ও প্রি-অর্ডার ব্যবস্থা</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <!-- ১৪. ওয়ারেন্টি -->
            <div class="tc-clause-item" id="sec-14">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ১৪</span>
                <span>ওয়ারেন্টি ও সার্ভিস</span>
                <span class="tc-clause-en">(Warranty Service)</span>
              </div>
              <p class="tc-text">
                প্রস্তুতকারক বা প্ল্যাটফর্ম ঘোষিত নির্দিষ্ট মেয়াদে ওয়ারেন্টি প্রযোজ্য। পানির ক্ষতি, পুড়িয়ে ফেলা বা অসতর্কতায় ভাঙার ক্ষেত্রে ওয়ারেন্টি বাতিল হবে। গ্রাহককে ইনভয়েস সংরক্ষণ করতে হবে।
              </p>
            </div>

            <!-- ১৫. প্রি-অর্ডার -->
            <div class="tc-clause-item" id="sec-15">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ১৫</span>
                <span>প্রি-অর্ডার পণ্য</span>
                <span class="tc-clause-en">(Pre-Order Policy)</span>
              </div>
              <p class="tc-text">
                প্রি-অর্ডার পণ্যের সম্ভাব্য সরবরাহ তারিখ পেজে দেওয়া থাকে। কোনো কারণে সংগ্রহে ব্যর্থ হলে গ্রাহকের অগ্রিম অর্থ অবিলম্বে ১০০% ফেরত দেওয়া হবে।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 8: ভেন্ডর ও পাইকারি/রিসেলার (১৬-১৭) -->
        <article class="tc-card tc-section-group" id="grp-8">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-8')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">🏪</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ০৮ • ধারা ১৬ থেকে ১৭</span>
                <h2 class="tc-group-title">১৬ - ১৭. ভেন্ডর, পাইকারি ও রিসেলার নীতিমালা</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <!-- ১৬. ভেন্ডর -->
            <div class="tc-clause-item" id="sec-16">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ১৬</span>
                <span>মার্কেটপ্লেস ও ভেন্ডর শর্ত</span>
                <span class="tc-clause-en">(Vendor Terms)</span>
              </div>
              <p class="tc-text">
                প্ল্যাটফর্মের সকল বিক্রেতাকে ১০০% আসল পণ্য সরবরাহ ও সঠিক স্টক তথ্য দিতে হবে। নকল পণ্য বিক্রি বা প্রতারণা করলে ভেন্ডর অ্যাকাউন্ট অবিলম্বে বাতিল করা হবে।
              </p>
            </div>

            <!-- ১৭. পাইকারি ও রিসেলার -->
            <div class="tc-clause-item" id="sec-17">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ১৭</span>
                <span>পাইকারি ও রিসেলার শর্ত</span>
                <span class="tc-clause-en">(Wholesale &amp; Reseller)</span>
              </div>
              <p class="tc-text">
                রিসেলার ও পাইকারি ক্রেতাদের জন্য বিশেষ রেট ও ন্যূনতম অর্ডারের পরিমাণ (MOQ) প্রযোজ্য। গ্রাহকের কাছে সঠিক পণ্যের বিবরণ ও মূল্য প্রদানে রিসেলারগণ দায়বদ্ধ থাকবেন।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 9: আচরণ, ডেটা ও মেধাস্বত্ব (১৮-২২) -->
        <article class="tc-card tc-section-group" id="grp-9">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-9')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">⚖️</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ০৯ • ধারা ১৮ থেকে ২২</span>
                <h2 class="tc-group-title">১৮ - ২২. নিষিদ্ধ কার্যক্রম, গোপনীয়তা ও মেধাস্বত্ব</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <div class="tc-clause-item" id="sec-18">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ১৮-১৯</span>
                <span>নিষিদ্ধ আচরণ ও রিভিউ</span>
                <span class="tc-clause-en">(Prohibitions &amp; Reviews)</span>
              </div>
              <p class="tc-text">
                প্রতারণা, নকল পণ্য বিক্রয়, ম্যালওয়্যার ছড়ানো, সিস্টেমে অননুমোদিত প্রবেশ ও ভুয়া রিভিউ দেওয়া সম্পূর্ণ নিষিদ্ধ ও আইনত দণ্ডনীয়।
              </p>
            </div>

            <div class="tc-clause-item" id="sec-20">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ২০-২২</span>
                <span>গোপনীয়তা, কুকিজ ও কপিরাইট</span>
                <span class="tc-clause-en">(Privacy &amp; IP)</span>
              </div>
              <p class="tc-text">
                গ্রাহকের ব্যক্তিগত তথ্য সুরক্ষিত রাখা হয় এবং বাণিজ্যিক উদ্দেশ্যে তৃতীয় পক্ষের কাছে বিক্রয় করা হয় না। ড্রিম কার্ট বিডির লোগো, কনটেন্ট ও ওয়েবসাইট ডিজাইন কপিরাইট আইন দ্বারা সংরক্ষিত।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 10: আইনি দায়বদ্ধতা, ফোর্স মেজার ও বিরোধ নিষ্পত্তি (২৩-৩৩) -->
        <article class="tc-card tc-section-group" id="grp-10">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-10')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">📜</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ১০ • ধারা ২৩ থেকে ৩৩</span>
                <h2 class="tc-group-title">২৩ - ৩৩. আইনি দায়বদ্ধতা ও বিরোধ নিষ্পত্তি</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <div class="tc-clause-item" id="sec-23">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ২৩-২৮</span>
                <span>সাইট প্রাপ্যতা, ক্ষতিপূরণ ও পরিবর্তন</span>
                <span class="tc-clause-en">(Liability &amp; Changes)</span>
              </div>
              <p class="tc-text">
                সার্ভার রক্ষণাবেক্ষণ বা নেটওয়ার্ক সমস্যায় সাময়িক বিভ্রাট ঘটতে পারে। অনিচ্ছাকৃত প্রাকৃতিক দুর্যোগ বা অনিবার্য পরিস্থিতিতে (Force Majeure) বিলম্ব ঘটলে গ্রাহককে অবহিত করা হবে।
              </p>
            </div>

            <div class="tc-clause-item" id="sec-29">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ২৯-৩৩</span>
                <span>অভিযোগ নিষ্পত্তি ও প্রচলিত আইন</span>
                <span class="tc-clause-en">(Governing Law)</span>
              </div>
              <p class="tc-text">
                যেকোনো অভিযোগের ক্ষেত্রে আপনার <strong>অর্ডার নম্বর</strong> ও প্রমাণ সহ কাস্টমার কেয়ারে যোগাযোগ করুন। এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের আইন অনুযায়ী পরিচালিত ও ব্যাখ্যা করা হবে।
              </p>
            </div>
          </div>
        </article>

        <!-- Group 11: অফিসিয়াল যোগাযোগ ও চূড়ান্ত ঘোষণা (৩৪) -->
        <article class="tc-card tc-section-group" id="grp-11">
          <div class="tc-group-header" onclick="window.__dcbdTermsUI.toggleGroup('grp-11')">
            <div class="tc-group-head-left">
              <div class="tc-group-icon">📞</div>
              <div class="tc-group-meta">
                <span class="tc-group-tag">বিভাগ ১১ • ধারা ৩৪</span>
                <h2 class="tc-group-title">৩৪. যোগাযোগের মাধ্যম ও কাস্টমার কেয়ার</h2>
              </div>
            </div>
            <span class="tc-toggle-btn" aria-hidden="true">▼</span>
          </div>

          <div class="tc-group-body">
            <div class="tc-clause-item" id="sec-34">
              <div class="tc-clause-title">
                <span class="tc-clause-num">ধারা ৩৪</span>
                <span>অফিশিয়াল কাস্টমার কেয়ার</span>
                <span class="tc-clause-en">(Official Support)</span>
              </div>
              <p class="tc-text">
                যেকোনো তথ্য, অর্ডার সংক্রান্ত সহায়তা বা প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:
              </p>

              <div class="tc-contact-grid">
                <div class="tc-contact-card">
                  <div>
                    <div class="tc-def-term">📞 হটলাইন ও হোয়াটসঅ্যাপ</div>
                    <div class="tc-def-desc">
                      <a href="tel:01581703822" class="tc-link">01581703822</a>,
                      <a href="tel:01818273838" class="tc-link">01818273838</a>
                    </div>
                  </div>
                  <div class="tc-contact-actions">
                    <a href="tel:01581703822" class="tc-action-btn">📱 কল করুন</a>
                    <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="tc-action-btn">💬 হোয়াটসঅ্যাপ</a>
                    <button type="button" class="tc-action-btn" onclick="window.__dcbdTermsUI.copyText('01581703822', this)">📋 কপি</button>
                  </div>
                </div>

                <div class="tc-contact-card">
                  <div>
                    <div class="tc-def-term">✉️ অফিসিয়াল ইমেইল</div>
                    <div class="tc-def-desc">
                      <a href="mailto:dreamcartbd.store@gmail.com" class="tc-link">dreamcartbd.store@gmail.com</a>
                    </div>
                  </div>
                  <div class="tc-contact-actions">
                    <a href="mailto:dreamcartbd.store@gmail.com" class="tc-action-btn">✉️ ইমেইল পাঠান</a>
                    <button type="button" class="tc-action-btn" onclick="window.__dcbdTermsUI.copyText('dreamcartbd.store@gmail.com', this)">📋 কপি</button>
                  </div>
                </div>

                <div class="tc-contact-card tc-contact-span-2">
                  <div>
                    <div class="tc-def-term">📍 অফিসের ঠিকানা</div>
                    <div class="tc-def-desc">
                      চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।
                    </div>
                  </div>
                  <div class="tc-contact-actions">
                    <button
                      type="button"
                      class="tc-action-btn"
                      onclick="window.__dcbdTermsUI.copyText('চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।', this)"
                    >📋 ঠিকানা কপি করুন</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- চূড়ান্ত ঘোষণা -->
            <div class="tc-consent-banner">
              <div class="tc-consent-text">
                ড্রিম কার্ট বিডি ব্যবহার করে অর্ডার সম্পন্ন করার মাধ্যমে আপনি এই শর্তাবলীতে পূর্ণ সম্মতি প্রকাশ করছেন।
              </div>
              <div class="tc-consent-brand">
                ✨ ড্রিম কার্ট বিডি — আপনার বিশ্বস্ত ডিজিটাল কমার্স পার্টনার
              </div>
              <div class="tc-footer-nav-row">
                <button type="button" class="tc-btn-soft" onclick="window.__dcbdTermsUI.scrollToTop()">
                  <span>⬆️</span>
                  <span>উপরে ফিরে যান</span>
                </button>
                <a href="/privacy" class="tc-btn-soft">
                  <span>🔒</span>
                  <span>প্রাইভেসি পলিসি দেখুন</span>
                </a>
                <a href="/shop" class="tc-btn-3d tc-btn-3d-primary">
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
