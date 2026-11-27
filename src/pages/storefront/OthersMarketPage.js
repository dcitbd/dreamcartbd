/**
 * DREAM CART BD — ULTRA-FAST 3D OTHERS MARKETPLACE PAGE (OthersMarketPage.js)
 * Performance & Design Upgrades:
 * - Instant 0ms render from localStorage ('dcbd_markets') / SSR cache / defaults (no blocking await)
 * - Background non-blocking sync with `others_market/list` that silently updates the grid if new data arrives
 * - Zero-network inline SVG fallback for logos + `loading="lazy" decoding="async"` + `content-visibility: auto`
 * - Modern 3D Bento Marketplace Cards with live search, verified badges, and Light/Dark mode support
 */

import { apiClient } from '../../api/client.js';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const FALLBACK_MKT_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='16' fill='%23ecfdf5'/%3E%3Cpath d='M16 26l4-10h24l4 10v4a6 6 0 01-12 0 6 6 0 01-12 0 6 6 0 01-12 0v-4z' stroke='%23059669' stroke-width='2.8' fill='%23d1fae5'/%3E%3Cpath d='M20 36v14h24V36' stroke='%23059669' stroke-width='2.8' stroke-linecap='round'/%3E%3C/svg%3E";

const DEFAULT_MARKETPLACES = [
  {
    shop_id: "MKT-DARAZ-01",
    market_name: "Daraz Bangladesh",
    market_logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Daraz_Logo.png",
    shop_name: "Dream Cart BD Official Store",
    shop_link: "https://www.daraz.com.bd/shop/dreamcartbd",
    status: "Active",
    badge: "DarazMall / Top Rated"
  },
  {
    shop_id: "MKT-BIKROY-02",
    market_name: "Bikroy.com",
    market_logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Bikroy.com_logo.png/220px-Bikroy.com_logo.png",
    shop_name: "Dream Cart BD (Cumilla Hub)",
    shop_link: "https://bikroy.com/bn/shops/dreamcartbd",
    status: "Active",
    badge: "Verified Member"
  },
  {
    shop_id: "MKT-FB-03",
    market_name: "Facebook Marketplace & Shop",
    market_logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    shop_name: "Dream Cart BD Official Page",
    shop_link: "https://www.facebook.com/dreamcartbd",
    status: "Active",
    badge: "50,000+ Followers"
  },
  {
    shop_id: "MKT-BKASH-04",
    market_name: "bKash Merchant Direct Checkout",
    market_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/BKash_Logo.svg/200px-BKash_Logo.svg.png",
    shop_name: "J A SAGOR COMPUTER",
    shop_link: "https://shop.bkash.com/j-a-sagor-computer01581703822/paymentlink",
    status: "Active",
    badge: "Instant 5% Cashback"
  }
];

function normalizeMarketplaces(rawList) {
  return (Array.isArray(rawList) && rawList.length > 0 ? rawList : DEFAULT_MARKETPLACES)
    .map(function (m) {
      const rawSt = m.status !== undefined ? m.status : m.Status;
      const stStr = (rawSt === false || rawSt === 'false' || rawSt === 'FALSE' || !rawSt) ? 'Active' : String(rawSt).trim();
      return {
        shop_id: m.shop_id || m.Shop_ID || 'MKT-01',
        market_name: m.market_name || m.Market_Name || m.name || 'Marketplace',
        market_logo: m.market_logo || m.Market_Logo || FALLBACK_MKT_SVG,
        shop_name: m.shop_name || m.Shop_Name || 'Dream Cart BD',
        shop_link: m.shop_link || m.Shop_Link || '#',
        status: stStr,
        badge: m.badge || 'Official Verified Store'
      };
    })
    .filter(m => m.market_name && String(m.status).toLowerCase() !== 'inactive');
}

function buildMarketCardsHtml(marketplaces) {
  return marketplaces.map(function (m, idx) {
    return `
      <article
        class="mkt-3d-card"
        data-mkt-name="${escapeHtml(m.market_name)}"
        data-mkt-shop="${escapeHtml(m.shop_name)}"
      >
        <div class="mkt-3d-top">
          <div class="mkt-3d-logo-box">
            <img
              src="${escapeHtml(m.market_logo)}"
              alt="${escapeHtml(m.market_name)}"
              loading="${idx < 6 ? 'eager' : 'lazy'}"
              decoding="async"
              class="mkt-3d-logo"
              onerror="this.onerror=null; this.src='${FALLBACK_MKT_SVG}';"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="mkt-id-pill">${escapeHtml(m.shop_id)}</span>
              <span class="mkt-status-pill">● ${escapeHtml(m.status)}</span>
            </div>
            <h3 class="mkt-3d-title" title="${escapeHtml(m.market_name)}">
              ${escapeHtml(m.market_name)}
            </h3>
            <div class="mkt-3d-shop" title="${escapeHtml(m.shop_name)}">
              দোকান: ${escapeHtml(m.shop_name)}
            </div>
          </div>
        </div>

        <div class="mkt-3d-meta">
          <span class="mkt-badge-pill">✓ ${escapeHtml(m.badge)}</span>
        </div>

        <a
          href="${escapeHtml(m.shop_link)}"
          target="_blank"
          rel="noopener noreferrer"
          class="mkt-3d-cta"
        >
          মার্কেট শপ ভিজিট করুন ↗
        </a>
      </article>
    `;
  }).join('');
}

if (typeof window !== 'undefined' && !window.__dcbdFastMarketHandlersAttached) {
  window.__dcbdFastMarketHandlersAttached = true;

  window.filterMarketGrid = function (query) {
    const q = (query || '').toLowerCase().trim();
    let visible = 0;
    document.querySelectorAll('#others-market-grid .mkt-3d-card').forEach(function (card) {
      const name = (card.getAttribute('data-mkt-name') || '').toLowerCase();
      const shop = (card.getAttribute('data-mkt-shop') || '').toLowerCase();
      if (!q || name.includes(q) || shop.includes(q)) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });
    const emptyEl = document.getElementById('mkt-grid-empty');
    if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
  };
}

export async function renderOthersMarketPage() {
  // 1. Instant 0ms read from localStorage / SSR cache / defaults (NO blocking await)
  const ssrCache = (typeof window !== 'undefined' && window.__DCBD_SSR_CACHE__) ? window.__DCBD_SSR_CACHE__ : null;
  let savedMarkets = null;
  try {
    savedMarkets = apiClient.loadLocal ? apiClient.loadLocal('dcbd_markets', null) : null;
  } catch (e) {}

  if ((!Array.isArray(savedMarkets) || savedMarkets.length === 0) && ssrCache && Array.isArray(ssrCache.others_market)) {
    savedMarkets = ssrCache.others_market;
  }

  const marketplaces = normalizeMarketplaces(savedMarkets);

  // 2. Non-blocking background sync with server; silently refreshes grid if updated
  try {
    apiClient.request('others_market/list').then(function (res) {
      const items = res && res.data && res.data.items;
      if (Array.isArray(items) && items.length > 0) {
        try {
          if (apiClient.saveLocal) apiClient.saveLocal('dcbd_markets', items);
        } catch (e) {}
        const freshList = normalizeMarketplaces(items);
        const gridEl = document.getElementById('others-market-grid');
        const countEl = document.getElementById('mkt-total-count');
        if (gridEl) gridEl.innerHTML = buildMarketCardsHtml(freshList);
        if (countEl) countEl.textContent = `${freshList.length}টি আউটলেট`;
      }
    }).catch(() => {});
  } catch (e) {}

  return `
    <style id="dc-others-market-fast-styles">
      .mkt-fast-page {
        font-family: 'Plus Jakarta Sans', 'Hind Siliguri', system-ui, -apple-system, sans-serif;
        max-width: 1240px;
        margin: 0 auto;
        padding-bottom: 64px;
      }
      .mkt-fast-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
      }
      .dark .mkt-fast-header {
        border-bottom-color: #1e293b;
      }
      .mkt-fast-search {
        position: relative;
        width: 100%;
        max-width: 280px;
      }
      .mkt-fast-search input {
        width: 100%;
        padding: 9px 12px 9px 34px;
        font-size: 12.5px;
        font-weight: 600;
        border-radius: 12px;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #0f172a;
        outline: none;
      }
      .mkt-fast-search input:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
      }
      .dark .mkt-fast-search input {
        background: #0f172a;
        border-color: #334155;
        color: #f8fafc;
      }

      .mkt-bento-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 16px;
      }
      @media (min-width: 640px) {
        .mkt-bento-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 1024px) {
        .mkt-bento-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
      }

      .mkt-3d-card {
        content-visibility: auto;
        contain-intrinsic-size: 200px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 8px 22px -12px rgba(15, 23, 42, 0.1);
        transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      }
      .mkt-3d-card:hover {
        transform: translateY(-3px);
        border-color: #10b981;
        box-shadow: 0 14px 28px -14px rgba(16, 185, 129, 0.28);
      }
      .dark .mkt-3d-card {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 10px 24px -12px rgba(0, 0, 0, 0.5);
      }
      .dark .mkt-3d-card:hover {
        border-color: #10b981;
      }

      .mkt-3d-top {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .mkt-3d-logo-box {
        width: 60px;
        height: 60px;
        border-radius: 15px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
      }
      .dark .mkt-3d-logo-box {
        background: #ffffff;
        border-color: #334155;
      }
      .mkt-3d-logo {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        display: block;
      }
      .mkt-id-pill {
        font-size: 9.5px;
        font-family: ui-monospace, monospace;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 5px;
        background: #f1f5f9;
        color: #64748b;
      }
      .dark .mkt-id-pill {
        background: #1e293b;
        color: #94a3b8;
      }
      .mkt-status-pill {
        font-size: 10px;
        font-weight: 800;
        padding: 1px 7px;
        border-radius: 9999px;
        background: #ecfdf5;
        color: #059669;
      }
      .dark .mkt-status-pill {
        background: rgba(16, 185, 129, 0.16);
        color: #34d399;
      }
      .mkt-3d-title {
        font-size: 15.5px;
        font-weight: 800;
        color: #0f172a;
        margin-top: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dark .mkt-3d-title {
        color: #f8fafc;
      }
      .mkt-3d-shop {
        font-size: 11.5px;
        font-weight: 600;
        color: #64748b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dark .mkt-3d-shop {
        color: #94a3b8;
      }
      .mkt-3d-meta {
        padding-top: 8px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .dark .mkt-3d-meta {
        border-top-color: #1e293b;
      }
      .mkt-badge-pill {
        font-size: 11px;
        font-weight: 700;
        color: #059669;
      }
      .dark .mkt-badge-pill {
        color: #34d399;
      }
      .mkt-3d-cta {
        margin-top: auto;
        display: block;
        text-align: center;
        padding: 9px 14px;
        border-radius: 12px;
        background: linear-gradient(135deg, #059669, #10b981);
        color: #ffffff;
        font-size: 12px;
        font-weight: 800;
        text-decoration: none;
        transition: opacity 0.15s ease;
      }
      .mkt-3d-cta:hover {
        opacity: 0.92;
      }
    </style>

    <div class="mkt-fast-page space-y-6">
      <div class="mkt-fast-header">
        <div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <a href="/" class="hover:text-emerald-600 transition">হোম</a>
            <span>/</span>
            <span class="text-slate-700 dark:text-slate-300 font-bold">অন্যান্য মার্কেটপ্লেস</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
            <span>🌐</span> অন্যান্য মার্কেটপ্লেস আউটলেট
            <span id="mkt-total-count" class="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ${marketplaces.length}টি আউটলেট
            </span>
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            দারাজ, বিক্রয়, ফেসবুক শপ ও বিকাশ মার্চেন্টে আমাদের ভেরিফায়েড অফিশিয়াল স্টোরসমূহ
          </p>
        </div>

        <div class="mkt-fast-search">
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="মার্কেটপ্লেস খুঁজুন..."
            oninput="window.filterMarketGrid(this.value);"
          />
        </div>
      </div>

      <div id="others-market-grid" class="mkt-bento-grid">
        ${buildMarketCardsHtml(marketplaces)}
      </div>

      <div id="mkt-grid-empty" style="display:none;" class="p-12 text-center text-sm text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        সার্চের সাথে কোনো মার্কেটপ্লেস মেলেনি।
      </div>
    </div>
  `;
}

export default renderOthersMarketPage;
