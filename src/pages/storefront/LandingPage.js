/**
 * DREAM CART BD — DYNAMIC HIGH-CONVERSION CAMPAIGN LANDING PAGE (LandingPage.js)
 * Supports opening any Landing Page created in Admin CMS in a separate tab via:
 *   - /landing?page=<slug>
 *   - /landing/<slug>
 *   - /landing?id=<page_id>
 * Features:
 *   - Custom Hero Banner, Campaign Badge, Title, Subtitle, Top Promo Bar
 *   - Multi-Banner Gallery & Embedded Campaign Videos
 *   - Dynamic Bullet Features & Benefits
 *   - Campaign Products Grid + Interactive Direct Order Form with Size/Color/Quantity & Live Price Calculation
 *   - Saves submitted orders directly to the Order List (dcbd_sheet_orders) and Google Sheet (Orders)
 */

import { apiClient, getGlobalDeliveryMethods } from '../../api/client.js';
import { renderProductCard } from '../../components/ProductCard.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../components/Toast.js';

if (typeof window !== 'undefined' && !window.__dcbdLandingHelpersBound) {
  window.__dcbdLandingHelpersBound = true;

  window.recalcLandingDirectOrder = function() {
    const checkboxes = Array.from(document.querySelectorAll('.lp-order-prod-check:checked'));
    const zoneSel = document.getElementById('lp-order-zone');
    const delCharge = Number(zoneSel?.selectedOptions?.[0]?.getAttribute('data-charge') || 90);

    let subtotal = 0;
    checkboxes.forEach(cb => {
      const idx = cb.getAttribute('data-idx');
      const price = Number(cb.getAttribute('data-price') || 0);
      const qtyInput = document.getElementById(`lp-prod-qty-${idx}`);
      const qty = Math.max(1, Number(qtyInput?.value || 1));
      subtotal += price * qty;
    });

    const isFree = subtotal >= 2000;
    const finalDel = checkboxes.length === 0 ? 0 : (isFree ? 0 : delCharge);
    const grand = subtotal + finalDel;

    const subEl = document.getElementById('lp-summary-subtotal');
    const delEl = document.getElementById('lp-summary-delivery');
    const grandEl = document.getElementById('lp-summary-grand');
    const btnEl = document.getElementById('lp-submit-order-btn');

    if (subEl) subEl.textContent = formatCurrency(subtotal);
    if (delEl) delEl.innerHTML = isFree && subtotal > 0 ? '<span class="text-emerald-600 font-bold">ফ্রি (৳০)</span>' : formatCurrency(finalDel);
    if (grandEl) grandEl.textContent = formatCurrency(grand);
    if (btnEl) btnEl.innerHTML = `<span>🛒 অর্ডার কনফার্ম করুন (${formatCurrency(grand)}) →</span>`;
  };

  window.stepLandingProdQty = function(idx, delta) {
    const inp = document.getElementById(`lp-prod-qty-${idx}`);
    if (!inp) return;
    const next = Math.max(1, (Number(inp.value) || 1) + Number(delta));
    inp.value = String(next);
    const cb = document.querySelector(`.lp-order-prod-check[data-idx="${idx}"]`);
    if (cb && !cb.checked) cb.checked = true;
    window.recalcLandingDirectOrder();
  };

  window.submitLandingDirectOrder = async function(e) {
    if (e) e.preventDefault();
    const name = (document.getElementById('lp-cust-name')?.value || '').trim();
    const phone = (document.getElementById('lp-cust-phone')?.value || '').trim();
    const address = (document.getElementById('lp-cust-address')?.value || '').trim();
    const note = (document.getElementById('lp-cust-note')?.value || '').trim();
    const zoneSel = document.getElementById('lp-order-zone');
    const zoneName = zoneSel?.selectedOptions?.[0]?.textContent?.trim() || 'Inside Dhaka';
    const delCharge = Number(zoneSel?.selectedOptions?.[0]?.getAttribute('data-charge') || 90);

    if (!name || !phone || !address) {
      toast.error('অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা লিখুন।');
      return;
    }

    const checkboxes = Array.from(document.querySelectorAll('.lp-order-prod-check:checked'));
    if (checkboxes.length === 0) {
      toast.error('অর্ডার করার জন্য অন্তত একটি পণ্য সিলেক্ট করুন।');
      return;
    }

    const items = [];
    let subtotal = 0;
    checkboxes.forEach(cb => {
      const idx = cb.getAttribute('data-idx');
      const sku = cb.getAttribute('data-sku') || '';
      const pName = cb.getAttribute('data-name') || 'পণ্য';
      const price = Number(cb.getAttribute('data-price') || 0);
      const qty = Math.max(1, Number(document.getElementById(`lp-prod-qty-${idx}`)?.value || 1));
      const size = (document.getElementById(`lp-prod-size-${idx}`)?.value || '').trim();
      const color = (document.getElementById(`lp-prod-color-${idx}`)?.value || '').trim();
      subtotal += price * qty;
      items.push({
        product_id: sku,
        sku,
        name: pName,
        price,
        quantity: qty,
        size,
        color
      });
    });

    const isFree = subtotal >= 2000;
    const finalDel = isFree ? 0 : delCharge;
    const grandTotal = subtotal + finalDel;

    const btnEl = document.getElementById('lp-submit-order-btn');
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.innerHTML = '<span>⏳ অর্ডার সাবমিট হচ্ছে...</span>';
    }

    const orderPayload = {
      order_id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      customer_name: name,
      phone,
      address: `${address} (${zoneName})`,
      note,
      items,
      products: items.map(it => `${it.name}${it.color ? ` [Color: ${it.color}]` : ''}${it.size ? ` [Size: ${it.size}]` : ''} (x${it.quantity})`).join(', '),
      subtotal,
      delivery_charge: finalDel,
      discount_amount: 0,
      total_amount: grandTotal,
      payment_method: 'COD',
      payment_status: 'Unpaid (COD)',
      order_status: 'Order Placed',
      account_type: 'Landing Page',
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await apiClient.request('orders/create', 'POST', orderPayload);
      const createdId = res?.data?.order_id || orderPayload.order_id;
      toast.success(`অভিনন্দন! আপনার অর্ডার (#${createdId}) সফলভাবে সম্পন্ন হয়েছে।`);
      if (window.router) {
        window.router.navigate(`/order-success?orderId=${encodeURIComponent(createdId)}`);
      } else {
        window.location.href = `/order-success?orderId=${encodeURIComponent(createdId)}`;
      }
    } catch (err) {
      toast.error('অর্ডার সাবমিট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
      if (btnEl) {
        btnEl.disabled = false;
        window.recalcLandingDirectOrder();
      }
    }
  };
}

function getYoutubeEmbedUrl(url) {
  const str = String(url || '').trim();
  if (!str) return '';
  const ytMatch = str.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{6,})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  return str;
}

export async function renderLandingPage(params = {}) {
  const [prodRes, lpRes] = await Promise.all([
    apiClient.request("products/list"),
    apiClient.request("landing-pages/list")
  ]);

  const allProducts = (prodRes.data && prodRes.data.items) || [];
  const localPages = apiClient.loadLocal('dcbd_landing_pages', []);
  const sheetPages = (lpRes.data && lpRes.data.items) || [];

  // Merge local + sheet landing pages
  const pageMap = new Map();
  [...sheetPages, ...(Array.isArray(localPages) ? localPages : [])].forEach(lp => {
    if (!lp || typeof lp !== 'object') return;
    const key = String(lp.slug || lp.page_id || lp.title || '').trim().toLowerCase();
    if (key) pageMap.set(key, lp);
  });
  const allLandingPages = Array.from(pageMap.values());

  // Determine requested slug or page_id from route params or URL query
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const reqSlug = String(
    params.slug ||
    searchParams.get('page') ||
    searchParams.get('slug') ||
    searchParams.get('id') ||
    ''
  ).trim().toLowerCase();

  let activePage = null;
  if (reqSlug) {
    activePage = allLandingPages.find(lp => {
      const s = String(lp.slug || '').trim().toLowerCase();
      const id = String(lp.page_id || '').trim().toLowerCase();
      return s === reqSlug || id === reqSlug || s.includes(reqSlug);
    }) || null;
  }
  if (!activePage && allLandingPages.length > 0) {
    activePage = allLandingPages[0];
  }

  // Fallback default campaign if none found
  const page = activePage || {
    page_id: "LP-DEFAULT",
    slug: "mega-gadget-sale",
    title: "সেরা মানের অথেন্টিক গ্যাজেট ও পণ্য সরাসরি আপনার দোরগোড়ায়!",
    subtitle: "কোনো অগ্রিম পেমেন্ট ছাড়াই সারা দেশে ক্যাশ অন ডেলিভারিতে অর্ডার করুন। ১০০% অরিজিনাল প্রোডাক্ট ও ১ বছরের অফিসিয়াল ওয়ারেন্টি।",
    badge: "🔥 সীমিত সময়ের মেগা অফার",
    promo: "⚡ আজ অর্ডার করলেই পাচ্ছেন বিশেষ ডিসকাউন্ট এবং সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি!",
    banner: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400",
    banners: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400"],
    videos: [],
    bullets: [
      "১০০% অরিজিনাল ও ইমপোর্টেড প্রিমিয়াম কোয়ালিটি প্রোডাক্ট",
      "পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে টাকা পরিশোধের সুবিধা",
      "৭ দিনের সহজ রিপ্লেসমেন্ট ও ১ বছরের সার্ভিস ওয়ারেন্টি",
      "ঢাকা ও কুমিল্লায় ২৪-৪৮ ঘণ্টায় সুপার-ফাস্ট হোম ডেলিভারি"
    ],
    cta_text: "এখনই অর্ডার করুন — ক্যাশ অন ডেলিভারি",
    selected_skus: []
  };

  // Resolve campaign products
  const selectedSkus = Array.isArray(page.selected_skus)
    ? page.selected_skus.map(s => String(s).trim().toLowerCase()).filter(Boolean)
    : String(page.selected_skus || page.product_sku || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  let campaignProducts = [];
  if (selectedSkus.length > 0) {
    campaignProducts = allProducts.filter(p => {
      const k1 = String(p.sku || '').trim().toLowerCase();
      const k2 = String(p.product_id || '').trim().toLowerCase();
      return selectedSkus.includes(k1) || selectedSkus.includes(k2);
    });
  }
  if (campaignProducts.length === 0) {
    campaignProducts = allProducts.slice(0, 6);
  }

  const bannersList = Array.isArray(page.banners) && page.banners.length > 0
    ? page.banners
    : (page.banner ? [page.banner] : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400"]);

  const videosList = Array.isArray(page.videos)
    ? page.videos.filter(Boolean)
    : (page.video_url ? [page.video_url] : []);

  const bulletsList = Array.isArray(page.bullets) && page.bullets.length > 0
    ? page.bullets
    : [
        "১০০% অরিজিনাল ও অথেন্টিক প্রোডাক্টের নিশ্চয়তা",
        "পণ্য হাতে পেয়ে যাচাই করে মূল্য পরিশোধ (Cash on Delivery)",
        "দ্রুততম সময়ে সারা বাংলাদেশে হোম ডেলিভারি"
      ];

  const deliveryMethods = getGlobalDeliveryMethods(true);
  const firstProd = campaignProducts[0] || { selling_price: 1250 };
  const initSub = Number(firstProd.selling_price || 1250);
  const initDel = initSub >= 2000 ? 0 : Number(deliveryMethods[0]?.charge || 90);
  const initGrand = initSub + initDel;

  return `
    <div class="space-y-10 pb-24 font-sans max-w-6xl mx-auto">
      
      <!-- Top Promo Announcement Strip -->
      ${page.promo ? `
        <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black text-xs sm:text-sm py-2.5 px-4 rounded-2xl shadow-md text-center flex items-center justify-center gap-2">
          <span>📢</span>
          <span>${page.promo}</span>
        </div>
      ` : ''}

      <!-- Campaign Switcher Pills (if multiple landing pages exist) -->
      ${allLandingPages.length > 1 ? `
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          <span class="text-[11px] font-bold text-slate-400 flex-shrink-0">🚀 সক্রিয় ক্যাম্পেইনসমূহ:</span>
          ${allLandingPages.map(lp => {
            const isCurrent = String(lp.slug || lp.page_id) === String(page.slug || page.page_id);
            const targetSlug = encodeURIComponent(lp.slug || lp.page_id || '');
            return `
              <a 
                href="/landing?page=${targetSlug}" 
                class="px-3 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${isCurrent ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'}"
              >
                ${lp.title ? lp.title.slice(0, 32) : lp.slug}
              </a>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- Hero Banner & Headline Section -->
      <section class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white border border-emerald-800/40 shadow-2xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-12 items-center">
          <div class="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full uppercase shadow-sm">
              <span>${page.badge || '🔥 স্পেশাল ক্যাম্পেইন অফার'}</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-black leading-tight text-white">
              ${page.title}
            </h1>
            <p class="text-xs sm:text-base text-slate-300 leading-relaxed">
              ${page.subtitle || ''}
            </p>
            <div class="pt-2 flex flex-wrap justify-center lg:justify-start gap-3">
              <a href="#lp-direct-order-section" onclick="document.getElementById('lp-direct-order-section')?.scrollIntoView({behavior:'smooth'}); return false;" class="btn-primary text-xs sm:text-sm font-black py-3.5 px-7 rounded-2xl shadow-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950">
                🛒 ${page.cta_text || 'এখনই অর্ডার করুন'} ↓
              </a>
              <a href="/products" class="py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition">
                🌐 মূল ওয়েবসাইটে যান →
              </a>
            </div>
          </div>

          <div class="lg:col-span-5">
            <div class="rounded-2xl overflow-hidden border-2 border-emerald-400/40 shadow-2xl bg-slate-900 aspect-[4/3]">
              <img 
                src="${bannersList[0]}" 
                alt="${page.title}" 
                class="w-full h-full object-cover"
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000';"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Extra Campaign Banners Gallery (if multiple banners added) -->
      ${bannersList.length > 1 ? `
        <section class="space-y-4">
          <h3 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🖼️</span> ক্যাম্পেইন প্রোডাক্ট গ্যালারি
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            ${bannersList.slice(1).map(img => `
              <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 aspect-[16/10]">
                <img src="${img}" alt="Gallery" class="w-full h-full object-cover hover:scale-105 transition duration-300" />
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Why Buy From Us / Key Bullet Features -->
      <section class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>✨</span> কেন আমাদের থেকে এই পণ্যটি নিবেন?
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">আমাদের প্রোডাক্টের বিশেষ বৈশিষ্ট্য ও গ্যারান্টি সমূহ</p>
          </div>
          <span class="badge badge-success text-xs font-bold self-start sm:self-center">✓ ১০০% কোয়ালিটি গ্যারান্টি</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          ${bulletsList.map(b => `
            <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/70 border border-emerald-200/70 dark:border-slate-700">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
              <span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">${b}</span>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Video Showcase (if any video URLs configured) -->
      ${videosList.length > 0 ? `
        <section class="space-y-4">
          <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>🎬</span> প্রোডাক্টের লাইভ ভিডিও রিভিউ
          </h2>
          <div class="grid grid-cols-1 ${videosList.length > 1 ? 'md:grid-cols-2' : ''} gap-6">
            ${videosList.map(v => {
              const embed = getYoutubeEmbedUrl(v);
              const isMp4 = /\.(mp4|webm|ogg)(\?|$)/i.test(v);
              return `
                <div class="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-video shadow-lg">
                  ${isMp4
                    ? `<video src="${v}" controls class="w-full h-full object-contain"></video>`
                    : `<iframe src="${embed}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                  }
                </div>
              `;
            }).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Campaign Products Showcase -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">📦 ক্যাম্পেইনের আকর্ষণীয় পণ্যসমূহ</h2>
            <p class="text-xs text-slate-500">বিশেষ অফারে এখনই সংগ্রহ করুন</p>
          </div>
          <a href="#lp-direct-order-section" onclick="document.getElementById('lp-direct-order-section')?.scrollIntoView({behavior:'smooth'}); return false;" class="text-xs font-extrabold text-emerald-600 hover:underline">
            সরাসরি অর্ডার ফর্মে যান ↓
          </a>
        </div>
        <div class="product-grid">
          ${campaignProducts.map(p => renderProductCard(p)).join("")}
        </div>
      </section>

      <!-- Direct One-Page Checkout Form on Landing Page -->
      <section id="lp-direct-order-section" class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/80 dark:border-emerald-500/60 p-6 sm:p-8 shadow-xl space-y-6">
        <div class="text-center max-w-2xl mx-auto space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-5">
          <span class="inline-block bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xs px-3 py-1 rounded-full">
            🔒 ১০০% নিরাপদ ক্যাশ অন ডেলিভারি অর্ডার ফর্ম
          </span>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            অর্ডার করতে নিচের ফর্মটি পূরণ করুন
          </h2>
          <p class="text-xs text-slate-500">
            কোনো অগ্রিম টাকা পাঠাতে হবে না — পণ্য হাতে পেয়ে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।
          </p>
        </div>

        <form onsubmit="window.submitLandingDirectOrder(event)" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left: Product Selection with Size, Color & Quantity -->
          <div class="lg:col-span-7 space-y-4">
            <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">১</span>
              <span>পছন্দের পণ্য, সাইজ ও কালার সিলেক্ট করুন:</span>
            </h3>

            <div class="space-y-3 max-h-96 overflow-y-auto pr-1">
              ${campaignProducts.map((p, idx) => {
                const sku = p.sku || p.product_id || `LP-PROD-${idx}`;
                const price = Number(p.selling_price || p.price || 1000);
                const sizes = String(p.size || '').split(/[,|\n]/).map(s => s.trim()).filter(Boolean);
                const colors = String(p.color || '').split(/[,|\n]/).map(s => s.trim()).filter(Boolean);

                return `
                  <div class="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label class="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                      <input 
                        type="checkbox" 
                        class="lp-order-prod-check mt-1 w-4 h-4 rounded text-emerald-600 cursor-pointer"
                        data-idx="${idx}"
                        data-sku="${sku}"
                        data-name="${(p.name || p.p_name || '').replace(/"/g, '&quot;')}"
                        data-price="${price}"
                        ${idx === 0 ? 'checked' : ''}
                        onchange="window.recalcLandingDirectOrder()"
                      />
                      <img src="${p.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}" class="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white flex-shrink-0" />
                      <div class="min-w-0 flex-1">
                        <div class="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">${p.name || p.p_name}</div>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-sm font-black text-emerald-600">${formatCurrency(price)}</span>
                          ${Number(p.original_price) > price ? `<span class="text-xs text-slate-400 line-through">${formatCurrency(p.original_price)}</span>` : ''}
                        </div>

                        <!-- Per-Product Size & Color Selectors -->
                        <div class="flex flex-wrap items-center gap-2 mt-2">
                          ${colors.length > 0 ? `
                            <select id="lp-prod-color-${idx}" class="text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                              ${colors.map(c => `<option value="${c}">🎨 কালার: ${c}</option>`).join('')}
                            </select>
                          ` : ''}
                          ${sizes.length > 0 ? `
                            <select id="lp-prod-size-${idx}" class="text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                              ${sizes.map(s => `<option value="${s}">📏 সাইজ: ${s}</option>`).join('')}
                            </select>
                          ` : ''}
                        </div>
                      </div>
                    </label>

                    <!-- Quantity Stepper -->
                    <div class="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden self-end sm:self-center">
                      <button type="button" onclick="window.stepLandingProdQty(${idx}, -1)" class="w-8 h-8 flex items-center justify-center font-black text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">−</button>
                      <input type="number" id="lp-prod-qty-${idx}" value="1" min="1" onchange="window.recalcLandingDirectOrder()" class="w-10 h-8 text-center font-mono font-black text-xs bg-transparent border-none outline-none" />
                      <button type="button" onclick="window.stepLandingProdQty(${idx}, 1)" class="w-8 h-8 flex items-center justify-center font-black text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">+</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right: Customer Info & Summary -->
          <div class="lg:col-span-5 space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">২</span>
              <span>আপনার নাম ও ঠিকানা দিন:</span>
            </h3>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">আপনার নাম *</label>
                <input type="text" id="lp-cust-name" required placeholder="আপনার পূর্ণ নাম লিখুন" class="form-control w-full py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
                <input type="tel" id="lp-cust-phone" required pattern="[0-9]{11}" placeholder="01XXXXXXXXX" class="form-control w-full py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ডেলিভারি এরিয়া *</label>
                <select id="lp-order-zone" onchange="window.recalcLandingDirectOrder()" class="form-control w-full py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold">
                  ${deliveryMethods.map(dm => `
                    <option value="${dm.id}" data-charge="${dm.charge}">
                      ${dm.zone} — ${Number(dm.charge) === 0 ? 'ফ্রি (৳০)' : `৳${dm.charge}`} (${dm.time || '২-৩ দিন'})
                    </option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">সম্পূর্ণ ডেলিভারি ঠিকানা *</label>
                <textarea id="lp-cust-address" required rows="2" placeholder="বাসা নং, রোড, এলাকা, থানা ও জেলা..." class="form-control w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"></textarea>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">বিশেষ নোট (ঐচ্ছিক)</label>
                <input type="text" id="lp-cust-note" placeholder="কালার/সাইজ বা অন্য কোনো নির্দেশনা..." class="form-control w-full py-2 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" />
              </div>
            </div>

            <!-- Order Summary Breakdown -->
            <div class="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1.5 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-500">পণ্যের মূল্য:</span>
                <span id="lp-summary-subtotal" class="font-bold text-slate-900 dark:text-white">${formatCurrency(initSub)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">ডেলিভারি চার্জ:</span>
                <span id="lp-summary-delivery" class="font-bold text-slate-900 dark:text-white">${initSub >= 2000 ? '<span class="text-emerald-600 font-bold">ফ্রি (৳০)</span>' : formatCurrency(initDel)}</span>
              </div>
              <div class="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>সর্বমোট প্রদেয়:</span>
                <span id="lp-summary-grand" class="text-emerald-600 font-mono text-lg">${formatCurrency(initGrand)}</span>
              </div>
            </div>

            <button type="submit" id="lp-submit-order-btn" class="btn-primary w-full py-3.5 text-sm font-black rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2">
              <span>🛒 অর্ডার কনফার্ম করুন (${formatCurrency(initGrand)}) →</span>
            </button>
          </div>

        </form>
      </section>

    </div>
  `;
}
