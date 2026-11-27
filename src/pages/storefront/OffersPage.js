/**
 * DREAM CART BD — ULTRA-FAST 3D OFFERS & BENEFITS HUB (OffersPage.js)
 * Performance & Design Upgrades:
 * - Instant 0ms synchronous render (zero blocking network calls)
 * - Live Discounted Deal Products preview read directly from apiClient.sheetProducts / SSR cache
 * - Clean 3D Bento Grid with interactive section filter tabs (All / Deals / Delivery & Pay / Partner / Guarantee)
 * - Lightweight scoped CSS with `content-visibility: auto`, compact spacing, and full Light/Dark mode support
 * - Preserves all automatic offers (Free Delivery >= ৳2,000, 5% Online Prepayment, Active Coupons, Partner Programs)
 */

import { apiClient, getGlobalOffers } from "../../api/client.js";
import { cartStore } from "../../store/cartStore.js";
import { toast } from "../../components/Toast.js";
import { renderProductCard } from "../../components/ProductCard.js";

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

if (typeof window !== "undefined" && !window.__dcbdOfferPageHandlersAttached) {
  window.__dcbdOfferPageHandlersAttached = true;

  window.copyAndApplyOfferCode = function (code) {
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    if (cartStore.validateAndApplyCoupon) {
      cartStore.validateAndApplyCoupon(code);
    }
    if (toast && toast.success) {
      toast.success(`কুপন কোড "${code}" কপি হয়েছে! চেকআউট পেজে এটি ব্যবহার করুন।`);
    }
  };

  window.switchOfferTab = function (tabKey, btnEl) {
    document.querySelectorAll('.of-tab-btn').forEach(function (b) {
      b.classList.remove('is-active');
    });
    if (btnEl) btnEl.classList.add('is-active');

    document.querySelectorAll('.of-tab-section').forEach(function (sec) {
      const secKey = sec.getAttribute('data-of-sec') || '';
      if (tabKey === 'all' || secKey === tabKey) {
        sec.style.display = '';
      } else {
        sec.style.display = 'none';
      }
    });
  };
}

export function renderOffersPage() {
  const activeCoupons = getGlobalOffers(true) || [];

  // Instant 0ms read of discounted products from memory/SSR cache (max 8 deals)
  let dealProducts = [];
  try {
    const ssrCache = (typeof window !== 'undefined' && window.__DCBD_SSR_CACHE__) ? window.__DCBD_SSR_CACHE__ : null;
    const allProds = (Array.isArray(apiClient.sheetProducts) && apiClient.sheetProducts.length > 0)
      ? apiClient.sheetProducts
      : (ssrCache && Array.isArray(ssrCache.products) ? ssrCache.products : []);

    dealProducts = allProds
      .filter(p => {
        if (!p) return false;
        const stock = Number(p.stock !== undefined ? p.stock : 25);
        if (stock <= 0) return false;
        const sell = Number(p.selling_price || p.price || 0);
        const orig = Number(p.original_price || p.regular_price || 0);
        return orig > sell && sell > 0;
      })
      .sort((a, b) => {
        const discA = (Number(a.original_price || a.regular_price) - Number(a.selling_price || a.price)) / Number(a.original_price || a.regular_price);
        const discB = (Number(b.original_price || b.regular_price) - Number(b.selling_price || b.price)) / Number(b.original_price || b.regular_price);
        return discB - discA;
      })
      .slice(0, 8);
  } catch (e) {
    dealProducts = [];
  }

  return `
    <style id="dc-offers-fast-styles">
      .of-fast-wrap {
        font-family: 'Plus Jakarta Sans', 'Hind Siliguri', system-ui, -apple-system, sans-serif;
        max-width: 1240px;
        margin: 0 auto;
        padding-bottom: 64px;
      }
      .of-fast-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
      }
      .dark .of-fast-header {
        border-bottom-color: #1e293b;
      }
      .of-auto-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        border-radius: 9999px;
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
        font-size: 11.5px;
        font-weight: 800;
      }
      .dark .of-auto-pill {
        background: rgba(16, 185, 129, 0.14);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.3);
      }

      /* Quick Filter Tabs */
      .of-tabs-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        overflow-x: auto;
        padding: 4px 0;
        scrollbar-width: none;
      }
      .of-tabs-bar::-webkit-scrollbar {
        display: none;
      }
      .of-tab-btn {
        padding: 7px 14px;
        border-radius: 9999px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #475569;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .of-tab-btn:hover {
        border-color: #10b981;
        color: #059669;
      }
      .of-tab-btn.is-active {
        background: linear-gradient(135deg, #059669, #10b981);
        border-color: #059669;
        color: #ffffff;
        box-shadow: 0 6px 14px -6px rgba(16, 185, 129, 0.55);
      }
      .dark .of-tab-btn {
        background: #0f172a;
        border-color: #1e293b;
        color: #cbd5e1;
      }
      .dark .of-tab-btn.is-active {
        border-color: #10b981;
        color: #ffffff;
      }

      /* Bento Hero Cards */
      .of-bento-hero {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      @media (min-width: 768px) {
        .of-bento-hero {
          grid-template-columns: 1fr 1fr;
        }
      }
      .of-hero-3d {
        border-radius: 20px;
        padding: 22px;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
        box-shadow: 0 12px 28px -12px rgba(15, 23, 42, 0.25);
        transition: transform 0.18s ease;
      }
      .of-hero-3d:hover {
        transform: translateY(-2px);
      }
      .of-grad-emerald {
        background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
      }
      .of-grad-indigo {
        background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
      }
      .of-hero-tag {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 9999px;
        background: #fbbf24;
        color: #78350f;
        font-size: 10.5px;
        font-weight: 800;
      }
      .of-hero-cta {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 9px 16px;
        border-radius: 11px;
        background: #ffffff;
        color: #0f172a;
        font-size: 12px;
        font-weight: 800;
        text-decoration: none;
        align-self: flex-start;
      }

      /* 3D Benefit / Partner Cards */
      .of-3d-card {
        content-visibility: auto;
        contain-intrinsic-size: 160px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
        box-shadow: 0 6px 18px -10px rgba(15, 23, 42, 0.08);
        transition: transform 0.16s ease, border-color 0.16s ease;
      }
      .of-3d-card:hover {
        transform: translateY(-2px);
        border-color: #10b981;
      }
      .dark .of-3d-card {
        background: #0f172a;
        border-color: #1e293b;
      }

      .of-deals-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      @media (min-width: 768px) {
        .of-deals-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
      }
      @media (min-width: 1024px) {
        .of-deals-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
      }

      .of-guarantee-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 12px;
      }
      @media (min-width: 640px) {
        .of-guarantee-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (min-width: 1024px) {
        .of-guarantee-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
    </style>

    <div class="of-fast-wrap space-y-6">
      <!-- Header -->
      <div class="of-fast-header">
        <div>
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <a href="/" class="hover:text-emerald-600 transition">হোম</a>
            <span>/</span>
            <span class="text-slate-700 dark:text-slate-300 font-bold">অফার ও সুবিধাসমূহ</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🎁</span> স্পেশাল অফার ও গ্রাহক সুবিধা
          </h1>
        </div>
        <div class="of-auto-pill">
          <span>✨</span> ১০০% স্বয়ংক্রিয় সুবিধা • কোনো কুপন লাগবে না
        </div>
      </div>

      <!-- Instant Section Filter Tabs -->
      <div class="of-tabs-bar">
        <button type="button" class="of-tab-btn is-active" onclick="window.switchOfferTab('all', this);">সব অফার</button>
        <button type="button" class="of-tab-btn" onclick="window.switchOfferTab('delivery-pay', this);">🚚 ডেলিভারি ও পেমেন্ট</button>
        ${dealProducts.length > 0 ? `<button type="button" class="of-tab-btn" onclick="window.switchOfferTab('hot-deals', this);">🔥 ডিসকাউন্ট পণ্য (${dealProducts.length})</button>` : ''}
        ${activeCoupons.length > 0 ? `<button type="button" class="of-tab-btn" onclick="window.switchOfferTab('coupons', this);">🎟️ প্রোমো কোড (${activeCoupons.length})</button>` : ''}
        <button type="button" class="of-tab-btn" onclick="window.switchOfferTab('partners', this);">🤝 রিসেলার ও হোলসেল</button>
        <button type="button" class="of-tab-btn" onclick="window.switchOfferTab('guarantees', this);">🛡️ গ্যারান্টি ও সাপোর্ট</button>
      </div>

      <!-- 1. Delivery & Prepayment Hero Bento -->
      <section class="of-tab-section" data-of-sec="delivery-pay">
        <div class="of-bento-hero">
          <div class="of-hero-3d of-grad-emerald">
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="of-hero-tag">🔥 ফ্রি ডেলিভারি</span>
                <span class="text-2xl">🚚</span>
              </div>
              <h2 class="text-xl font-black">৳২,০০০+ অর্ডারে সারা দেশে ফ্রি ডেলিভারি!</h2>
              <p class="text-xs text-white/90 leading-relaxed">
                যেকোনো পণ্য মিলিয়ে ২,০০০ টাকা বা বেশি অর্ডার করলেই ঢাকার ভেতরে ৭০৳ ও বাইরে ১৩০৳ ডেলিভারি চার্জ সম্পূর্ণ ফ্রি।
              </p>
            </div>
            <a href="/products" class="of-hero-cta">🛍️ শপিং শুরু করুন →</a>
          </div>

          <div class="of-hero-3d of-grad-indigo">
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="of-hero-tag">⚡ ইনস্ট্যান্ট ৫% ছাড়</span>
                <span class="text-2xl">💳</span>
              </div>
              <h2 class="text-xl font-black">অনলাইন পেমেন্টে সরাসরি ৫% ডিসকাউন্ট!</h2>
              <p class="text-xs text-white/90 leading-relaxed">
                বিকাশ মার্চেন্ট (<strong>01581703822</strong>) বা পার্সোনাল (<strong>01879653143</strong>) / নগদে অগ্রিম পেমেন্টে চেকআউটে স্বয়ংক্রিয় ৫% ছাড়।
              </p>
            </div>
            <a href="/checkout" class="of-hero-cta">💳 চেকআউট দেখুন →</a>
          </div>
        </div>
      </section>

      <!-- 2. Live Discounted Products (0ms from cache) -->
      ${dealProducts.length > 0 ? `
        <section class="of-tab-section space-y-3" data-of-sec="hot-deals">
          <div class="flex items-center justify-between">
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🔥</span> সেরা ডিসকাউন্ট অফার পণ্যসমূহ
            </h2>
            <a href="/products" class="text-xs font-bold text-emerald-600 hover:underline">সব পণ্য দেখুন →</a>
          </div>
          <div class="of-deals-grid">
            ${dealProducts.map(p => renderProductCard(p)).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 3. Active Promo Coupons -->
      ${activeCoupons.length > 0 ? `
        <section class="of-tab-section space-y-3" data-of-sec="coupons">
          <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🎟️</span> সক্রিয় প্রোমো কোড সমূহ
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${activeCoupons.map(c => `
              <div class="of-3d-card border-dashed border-emerald-400 dark:border-emerald-600">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xs">${escapeHtml(c.code)}</span>
                  <span class="text-xs font-black text-amber-600 dark:text-amber-400">
                    ${String(c.type).includes("%") || String(c.type).toLowerCase().includes("percent") ? `${c.discount}% ছাড়` : `৳${c.discount} ছাড়`}
                  </span>
                </div>
                <div>
                  <h3 class="text-sm font-black text-slate-900 dark:text-white">${escapeHtml(c.title || c.code)}</h3>
                  <p class="text-[11px] text-slate-500 mt-0.5">সর্বনিম্ন অর্ডার: ৳${c.min_order || 0}${c.expiry ? ` • মেয়াদ: ${escapeHtml(c.expiry)}` : ""}</p>
                </div>
                <button type="button" onclick="window.copyAndApplyOfferCode('${escapeHtml(c.code)}');" class="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer">
                  📋 কোড কপি ও এপ্লাই (${escapeHtml(c.code)})
                </button>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 4. Reseller & Wholesaler Partner Programs -->
      <section class="of-tab-section space-y-3" data-of-sec="partners">
        <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>🤝</span> বিজনেস পার্টনার ও পাইকারি সুবিধা
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="of-3d-card">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">জিরো ইনভেস্টমেন্ট ড্রপশিপিং</span>
                <span class="text-xl">💼</span>
              </div>
              <h3 class="text-base font-black text-slate-900 dark:text-white">রিসেলার পার্টনার (১০% পর্যন্ত কমিশন)</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                নিজস্ব স্টক ছাড়াই বিক্রি করুন; প্যাকিং ও ডেলিভারি আমরা করব, প্রফিট সরাসরি বিকাশে উইথড্র।
              </p>
            </div>
            <div class="flex items-center gap-2 pt-1">
              <a href="/reseller/register" class="btn-primary flex-1 text-center py-2 text-xs font-bold rounded-xl">অ্যাকাউন্ট খুলুন →</a>
              <a href="/reseller/login" class="btn-secondary py-2 px-4 text-xs font-bold rounded-xl">লগইন</a>
            </div>
          </div>

          <div class="of-3d-card">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">পাইকারি ক্রেতাদের জন্য</span>
                <span class="text-xl">🏬</span>
              </div>
              <h3 class="text-base font-black text-slate-900 dark:text-white">হোলসেলার ও ইমপোর্টার রেট</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                দোকানদার ও করপোরেট বায়ারদের জন্য স্বল্প MOQ-তে সর্বনিম্ন পাইকারি রেট ও অফিশিয়াল ক্যাশ মেমো।
              </p>
            </div>
            <div class="flex items-center gap-2 pt-1">
              <a href="/wholesaler/register" class="flex-1 text-center py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition">অ্যাকাউন্ট খুলুন →</a>
              <a href="/wholesaler/login" class="btn-secondary py-2 px-4 text-xs font-bold rounded-xl">লগইন</a>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Compact 6 Platform Guarantees -->
      <section class="of-tab-section space-y-3" data-of-sec="guarantees">
        <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>🛡️</span> সার্বক্ষণিক গ্রাহক গ্যারান্টি
        </h2>
        <div class="of-guarantee-grid">
          <div class="of-3d-card">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🛡️</span>
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">১০০% জেনুইন ও ১ বছর ওয়ারেন্টি</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">প্রতিটি ব্র্যান্ডেড পণ্যে অরিজিনাল সিকিউরিটি সিল ও অফিশিয়াল ওয়ারেন্টি।</p>
          </div>
          <div class="of-3d-card">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🔄</span>
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">৭ দিনের সহজ রিপ্লেসমেন্ট</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">ত্রুটিপূর্ণ পণ্য হাতে পেলে ৭ দিনের মধ্যে কোনো অতিরিক্ত ফি ছাড়াই ফ্রি রিপ্লেসমেন্ট।</p>
          </div>
          <div class="of-3d-card">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">💵</span>
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">সারা দেশে ক্যাশ অন ডেলিভারি</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">৬৪ জেলার সকল উপজেলায় পণ্য হাতে পেয়ে যাচাই করে মূল্য পরিশোধের সুবিধা।</p>
          </div>
          <div class="of-3d-card">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🚀</span>
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">এক্সপ্রেস কুরিয়ার ডিসপ্যাচ</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">কুমিল্লা হাব থেকে Steadfast / Pathao লাইভ ট্র্যাকিংসহ দ্রুত ডেলিভারি।</p>
          </div>
          <div class="of-3d-card">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">💬</span>
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">সরাসরি হটলাইন ও হোয়াটসঅ্যাপ</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">সকাল ৮টা – রাত ১০টা লাইভ সাপোর্ট: 01581703822, 01818273838</p>
          </div>
          <div class="of-3d-card">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🏢</span>
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">সরাসরি শোরুম ভিজিট</h3>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড, কুমিল্লা-৩৫০০ — সরাসরি দেখে কেনার সুযোগ।</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

export default renderOffersPage;
