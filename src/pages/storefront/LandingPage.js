/**
 * DREAM CART BD — DYNAMIC MODERN CAMPAIGN LANDING PAGE (LandingPage.js)
 * Implements user requirements:
 * - Zero hardcoded/default texts from other pages (100% driven by Admin Panel Landing Page Builder & Selected Products).
 * - Only renders sections that the Admin has actually filled in or selected.
 * - Prominent "🛍️ মূল ওয়েবসাইটে যান" (Visit Main Website) button linking directly to Customer View `/products`.
 * - Ultra-aesthetic modern design: smooth animations, glassmorphism badges, elevated cards, balanced margins & padding, theme color accents.
 * - Interactive Multi-Product / Package selection, dynamic Color & Size pills, live Order Summary, and 0ms instant Checkout.
 */

import { apiClient, getGlobalDeliveryMethods, getGlobalSiteSettings } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { toast } from '../../components/Toast.js';

if (typeof window !== 'undefined') {
  window.__lpSelectedPackage = 0;
  window.__lpSelectedColor = '';
  window.__lpSelectedSize = '';
  window.__lpQuantity = 1;
  window.__lpProductsList = [];
  window.__lpDeliveryConfs = [];

  window.selectLpProduct = function(idx) {
    const list = window.__lpProductsList || [];
    const prod = list[idx];
    if (!prod) return;

    window.__lpSelectedPackage = idx;
    window.__lpPackagePrice = Number(prod.offer_price || prod.selling_price || prod.price || 0);
    window.__lpPackageRegularPrice = Number(prod.regular_price || prod.original_price || 0);
    window.__lpPackageTitle = prod.name || prod.p_name || '';
    window.__lpPackageSku = prod.sku || prod.product_id || 'LP-ITEM';
    window.__lpPackageThumb = prod.thumbnail || (Array.isArray(prod.images) && prod.images[0]) || '';

    const colors = Array.isArray(prod.colorsList) ? prod.colorsList : [];
    const sizes = Array.isArray(prod.sizesList) ? prod.sizesList : [];
    window.__lpSelectedColor = colors[0] || '';
    window.__lpSelectedSize = sizes[0] || '';

    document.querySelectorAll('.lp-pkg-card').forEach(el => {
      const pIdx = Number(el.getAttribute('data-pkg-idx'));
      const radio = el.querySelector('input[type="radio"]');
      if (pIdx === idx) {
        el.classList.add('lp-pkg-active');
        if (radio) radio.checked = true;
      } else {
        el.classList.remove('lp-pkg-active');
        if (radio) radio.checked = false;
      }
    });

    window.renderLpDynamicVariantPills(prod);
    window.updateLpOrderSummary();
  };

  window.renderLpDynamicVariantPills = function(prod) {
    const colorWrap = document.getElementById('lp-dynamic-colors-wrap');
    const sizeWrap = document.getElementById('lp-dynamic-sizes-wrap');
    if (!prod) return;

    const colors = Array.isArray(prod.colorsList) ? prod.colorsList : [];
    const sizes = Array.isArray(prod.sizesList) ? prod.sizesList : [];

    if (colorWrap) {
      if (colors.length > 0) {
        colorWrap.classList.remove('hidden');
        colorWrap.innerHTML = `
          <div class="text-xs font-extrabold text-slate-700 mb-2">
            কালার নির্বাচন করুন: <span id="lp-summary-color-label" class="text-emerald-600 font-black">${window.__lpSelectedColor}</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            ${colors.map((c, i) => {
              const safeC = String(c).replace(/'/g, "\\'");
              return `<button type="button" onclick="window.selectLpColor('${safeC}', this)" class="lp-pill-btn ${i === 0 ? 'active' : ''} lp-color-pill">${c}</button>`;
            }).join('')}
          </div>
        `;
      } else {
        colorWrap.classList.add('hidden');
        colorWrap.innerHTML = '';
      }
    }

    if (sizeWrap) {
      if (sizes.length > 0) {
        sizeWrap.classList.remove('hidden');
        sizeWrap.innerHTML = `
          <div class="text-xs font-extrabold text-slate-700 mb-2">
            সাইজ নির্বাচন করুন: <span id="lp-summary-size-label" class="text-emerald-600 font-black">${window.__lpSelectedSize}</span>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            ${sizes.map((s, i) => {
              const safeS = String(s).replace(/'/g, "\\'");
              return `<button type="button" onclick="window.selectLpSize('${safeS}', this)" class="lp-pill-btn ${i === 0 ? 'active' : ''} lp-size-pill">${s}</button>`;
            }).join('')}
          </div>
        `;
      } else {
        sizeWrap.classList.add('hidden');
        sizeWrap.innerHTML = '';
      }
    }
  };

  window.selectLpColor = function(colorName, btn) {
    window.__lpSelectedColor = colorName;
    document.querySelectorAll('.lp-color-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const lbl = document.getElementById('lp-summary-color-label');
    if (lbl) lbl.textContent = colorName;
    window.updateLpOrderSummary();
  };

  window.selectLpSize = function(sizeVal, btn) {
    window.__lpSelectedSize = sizeVal;
    document.querySelectorAll('.lp-size-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const lbl = document.getElementById('lp-summary-size-label');
    if (lbl) lbl.textContent = sizeVal;
    window.updateLpOrderSummary();
  };

  window.stepLpQty = function(delta) {
    window.__lpQuantity = Math.max(1, (window.__lpQuantity || 1) + delta);
    const qtyEl = document.getElementById('lp-qty-val');
    if (qtyEl) qtyEl.textContent = window.__lpQuantity;
    window.updateLpOrderSummary();
  };

  window.updateLpOrderSummary = function() {
    const pkgPrice = Number(window.__lpPackagePrice || 0);
    const qty = Number(window.__lpQuantity || 1);
    const areaSel = document.getElementById('lp-cust-area');
    const selectedOpt = areaSel?.selectedOptions?.[0];
    const deliveryCharge = selectedOpt ? Number(selectedOpt.getAttribute('data-charge') || 0) : 0;

    const subtotal = pkgPrice * qty;
    const grandTotal = subtotal + deliveryCharge;

    const subEl = document.getElementById('lp-calc-subtotal');
    const delEl = document.getElementById('lp-calc-delivery');
    const grandEl = document.getElementById('lp-calc-grand');
    const btnGrandEl = document.getElementById('lp-submit-btn-price');
    const titleEl = document.getElementById('lp-summary-prod-title');
    const metaEl = document.getElementById('lp-summary-prod-meta');
    const thumbEl = document.getElementById('lp-summary-prod-thumb');
    const itemTotalEl = document.getElementById('lp-summary-item-total');

    if (subEl) subEl.textContent = formatCurrency(subtotal);
    if (delEl) {
      delEl.innerHTML = deliveryCharge <= 0
        ? `<span class="text-emerald-600 font-black">ফ্রি ডেলিভারি (৳০)</span>`
        : `<span class="font-bold text-slate-800">${formatCurrency(deliveryCharge)}</span>`;
    }
    if (grandEl) grandEl.textContent = formatCurrency(grandTotal);
    if (btnGrandEl) btnGrandEl.textContent = formatCurrency(grandTotal);
    if (titleEl) titleEl.textContent = window.__lpPackageTitle || 'নির্বাচিত পণ্য';
    if (metaEl) {
      const parts = [
        window.__lpSelectedColor ? `কালার: ${window.__lpSelectedColor}` : '',
        window.__lpSelectedSize ? `সাইজ: ${window.__lpSelectedSize}` : ''
      ].filter(Boolean);
      metaEl.textContent = parts.join(' • ');
    }
    if (thumbEl && window.__lpPackageThumb) {
      thumbEl.src = window.__lpPackageThumb;
    }
    if (itemTotalEl) itemTotalEl.textContent = formatCurrency(subtotal);
  };

  window.scrollToLpOrder = function(prodIdx = null) {
    if (prodIdx !== null && prodIdx !== undefined) {
      window.selectLpProduct(Number(prodIdx));
    }
    const el = document.getElementById('lp-checkout-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  window.submitLpOrderForm = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = (document.getElementById('lp-cust-name')?.value || '').trim();
    const phone = (document.getElementById('lp-cust-phone')?.value || '').trim();
    const areaSel = document.getElementById('lp-cust-area');
    const areaText = areaSel?.selectedOptions?.[0]?.getAttribute('data-zone-label') || areaSel?.selectedOptions?.[0]?.textContent?.trim() || '';
    const deliveryFee = Number(areaSel?.selectedOptions?.[0]?.getAttribute('data-charge') || 0);
    const address = (document.getElementById('lp-cust-address')?.value || '').trim();
    const note = (document.getElementById('lp-cust-note')?.value || '').trim();

    if (!name) {
      toast.error('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      document.getElementById('lp-cust-name')?.focus();
      return;
    }
    if (!phone || phone.replace(/[^0-9]/g, '').length < 11) {
      toast.error('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।');
      document.getElementById('lp-cust-phone')?.focus();
      return;
    }
    if (!address) {
      toast.error('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      document.getElementById('lp-cust-address')?.focus();
      return;
    }

    const pkgPrice = Number(window.__lpPackagePrice || 0);
    const qty = Number(window.__lpQuantity || 1);
    const color = window.__lpSelectedColor || '';
    const size = window.__lpSelectedSize || '';
    const title = window.__lpPackageTitle || 'ক্যাম্পেইন পণ্য';
    const sku = window.__lpPackageSku || 'LP-ITEM';

    const subtotal = pkgPrice * qty;
    const grandTotal = subtotal + deliveryFee;
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const submitBtn = document.getElementById('lp-submit-btn');
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ অর্ডার প্রসেস হচ্ছে...</span>';
    }

    const variantLabel = [color ? `রং: ${color}` : '', size ? `সাইজ: ${size}` : ''].filter(Boolean).join(', ');
    const fullAddress = areaText ? `${address} (${areaText})` : address;

    const orderPayload = {
      order_id: orderId,
      orderId: orderId,
      customer_name: name,
      phone: phone,
      address: fullAddress,
      customer_note: note,
      products: `${title}${variantLabel ? ` (${variantLabel})` : ''} x${qty}`,
      product_name: title,
      color: color || 'Standard',
      size: size || 'Free Size',
      quantity: qty,
      unit_price: pkgPrice,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total_amount: grandTotal,
      payment_method: 'Cash On Delivery (COD)',
      payment_status: 'COD',
      order_status: 'Order Placed',
      account_type: 'Landing Page',
      items: [
        {
          sku: sku,
          product_id: sku,
          name: title,
          color: color,
          size: size,
          quantity: qty,
          price: pkgPrice,
          thumbnail: window.__lpPackageThumb || ''
        }
      ]
    };

    try {
      await apiClient.request('orders/create', orderPayload);
      toast.success(`ধন্যবাদ ${name}! আপনার অর্ডার (#${orderId}) সফলভাবে সম্পন্ন হয়েছে।`, 'অর্ডার কনফার্ম হয়েছে');

      if (window.router && window.router.navigate) {
        window.router.navigate(`/order-success?orderId=${encodeURIComponent(orderId)}`);
      } else {
        window.location.href = `/order-success?orderId=${encodeURIComponent(orderId)}`;
      }
    } catch (err) {
      toast.error('অর্ডার সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    }
  };

  window.initLpCountdown = function(hoursCount = 24) {
    const hrs = Number(hoursCount);
    if (!hrs || hrs <= 0) return;

    function updateTimer() {
      const now = new Date().getTime();
      let target = window.__lpCountdownTarget;
      if (!target) {
        target = now + (hrs * 60 * 60 * 1000);
        window.__lpCountdownTarget = target;
      }

      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = document.getElementById('lp-cd-days');
      const hEl = document.getElementById('lp-cd-hours');
      const mEl = document.getElementById('lp-cd-mins');
      const sEl = document.getElementById('lp-cd-secs');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    }

    updateTimer();
    if (window.__lpCdInterval) clearInterval(window.__lpCdInterval);
    window.__lpCdInterval = setInterval(updateTimer, 1000);
  };
}

function getThemePalette(theme = 'emerald') {
  const palettes = {
    emerald: {
      primary: '#059669',
      primaryDark: '#064e3b',
      primaryLight: '#ecfdf5',
      accent: '#10b981',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
      btnGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      glow: 'rgba(16, 185, 129, 0.28)'
    },
    amber: {
      primary: '#d97706',
      primaryDark: '#78350f',
      primaryLight: '#fffbeb',
      accent: '#f59e0b',
      gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)',
      btnGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      glow: 'rgba(245, 158, 11, 0.28)'
    },
    indigo: {
      primary: '#4f46e5',
      primaryDark: '#1e1b4b',
      primaryLight: '#eef2ff',
      accent: '#6366f1',
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)',
      btnGradient: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
      glow: 'rgba(99, 102, 241, 0.28)'
    },
    rose: {
      primary: '#e11d48',
      primaryDark: '#881337',
      primaryLight: '#fff1f2',
      accent: '#f43f5e',
      gradient: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%)',
      btnGradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
      glow: 'rgba(244, 63, 94, 0.28)'
    }
  };
  return palettes[theme] || palettes.emerald;
}

export async function renderLandingPage(params = {}) {
  if (typeof document !== 'undefined') {
    const headerMount = document.getElementById('header-mount');
    const footerMount = document.getElementById('footer-mount');
    const mobileNavMount = document.getElementById('mobilenav-mount');
    const floatingActionsMount = document.getElementById('floatingactions-mount');
    const appContainer = document.getElementById('app-content');

    if (headerMount) headerMount.style.display = 'none';
    if (footerMount) footerMount.style.display = 'none';
    if (mobileNavMount) mobileNavMount.style.display = 'none';
    if (floatingActionsMount) floatingActionsMount.style.display = 'none';
    if (appContainer) appContainer.className = 'w-full min-h-screen p-0 m-0';
  }

  const [prodRes, lpRes] = await Promise.all([
    apiClient.request('products/list'),
    apiClient.request('landing_pages/list')
  ]);

  const allProducts = (prodRes?.data?.items) || apiClient.products || [];
  const allLps = (lpRes?.data?.items) || apiClient.loadLocal('dcbd_landing_pages', []) || [];

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const reqSlug = String(
    params.slug ||
    params.page ||
    searchParams.get('page') ||
    searchParams.get('slug') ||
    searchParams.get('id') ||
    ''
  ).trim().toLowerCase();

  let customPage = null;
  if (reqSlug) {
    customPage = allLps.find(p => {
      const s = String(p.slug || '').trim().toLowerCase();
      const id = String(p.id || p.page_id || '').trim().toLowerCase();
      return s === reqSlug || id === reqSlug;
    });
  }
  if (!customPage && allLps.length > 0) {
    customPage = allLps.find(p => (p.status || 'Active') === 'Active') || allLps[0];
  }

  const siteSettings = getGlobalSiteSettings();
  const shopName = siteSettings.shopName || 'Dream Cart BD';
  const shopLogo = siteSettings.shopLogo || 'https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg';

  // If no Landing Page has been created in Admin Panel yet, show a clean empty state with "মূল ওয়েবসাইটে যান" button
  if (!customPage) {
    return `
      <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div class="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 space-y-5">
          <img src="${shopLogo}" alt="${shopName}" class="w-16 h-16 rounded-2xl mx-auto object-contain border p-1.5 shadow-sm" />
          <h1 class="text-xl sm:text-2xl font-black text-slate-900">এখনো কোনো ল্যান্ডিং পেজ তৈরি করা হয়নি</h1>
          <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
            অ্যাডমিন প্যানেলের <strong>মাল্টি-ল্যান্ডিং পেজ CMS</strong> থেকে নতুন ক্যাম্পেইন ল্যান্ডিং পেজ তৈরি করলে সেটি এখানে প্রদর্শিত হবে।
          </p>
          <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a href="/products" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-lg transition">
              <span>🛍️ মূল ওয়েবসাইটে যান</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Strictly use ONLY what Admin provided — ZERO hardcoded burqa/foreign text!
  const palette = getThemePalette(customPage.theme || 'emerald');
  const title = String(customPage.title || '').trim();
  const subtitle = String(customPage.subtitle || '').trim();
  const badge = String(customPage.badge || '').trim();
  const promo = String(customPage.promo || '').trim();
  const ctaText = String(customPage.cta_text || 'এখনই অর্ডার করুন').trim();
  const heroBanner = String(customPage.hero_banner || customPage.banner || '').trim();
  const description = String(customPage.description || '').trim();
  const giftNote = String(customPage.gift_note || customPage.free_gift || '').trim();
  const countdownHours = Number(customPage.countdown_hours || 0);
  const freeShipping = customPage.free_shipping === true || String(customPage.free_shipping) === 'true';

  const contactPhone = String(customPage.hotline || siteSettings.hotline1 || '').trim();
  const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
  const intlPhone = cleanPhone ? (cleanPhone.startsWith('88') ? cleanPhone : ('88' + cleanPhone)) : '';

  // Selected products from Admin Builder
  const selectedIds = Array.isArray(customPage.selected_products)
    ? customPage.selected_products
    : (Array.isArray(customPage.selected_skus) ? customPage.selected_skus : []);

  const matchedProducts = selectedIds
    .map(id => allProducts.find(p => String(p.sku || p.product_id || '').toLowerCase() === String(id).toLowerCase()))
    .filter(Boolean);

  // Build normalized campaign product packages
  const customColors = String(customPage.colors || '')
    .split(/[,|\n]/)
    .map(s => s.trim())
    .filter(Boolean);
  const customSizes = String(customPage.sizes || '')
    .split(/[,|\n]/)
    .map(s => s.trim())
    .filter(Boolean);

  const customOfferPrice = Number(customPage.offer_price || 0);
  const customRegularPrice = Number(customPage.regular_price || 0);

  let lpProducts = matchedProducts.map((p, idx) => {
    const pColors = customColors.length > 0
      ? customColors
      : String(p.color || '')
          .split(/[,|/]/)
          .map(s => s.trim())
          .filter(c => c && c.toLowerCase() !== 'standard');
    const pSizes = customSizes.length > 0
      ? customSizes
      : String(p.size || '')
          .split(/[,|/]/)
          .map(s => s.trim())
          .filter(s => s && s.toLowerCase() !== 'free size' && s.toLowerCase() !== 'std');

    const sellPrice = (idx === 0 && customOfferPrice > 0) ? customOfferPrice : Number(p.selling_price || p.price || 0);
    const regPrice = (idx === 0 && customRegularPrice > 0) ? customRegularPrice : Number(p.original_price || 0);

    return {
      ...p,
      offer_price: sellPrice,
      regular_price: regPrice,
      colorsList: pColors,
      sizesList: pSizes
    };
  });

  // If Admin did not select a catalog product but entered title & price directly on the Landing Page form
  if (lpProducts.length === 0 && (title || customOfferPrice > 0)) {
    lpProducts = [
      {
        sku: customPage.id || 'LP-CUSTOM',
        product_id: customPage.id || 'LP-CUSTOM',
        name: title || shopName,
        offer_price: customOfferPrice,
        regular_price: customRegularPrice,
        thumbnail: heroBanner || shopLogo,
        description: description,
        specification: customPage.specifications || '',
        colorsList: customColors,
        sizesList: customSizes
      }
    ];
  }

  const primaryProduct = lpProducts[0] || null;
  const displayOfferPrice = customOfferPrice > 0 ? customOfferPrice : Number(primaryProduct?.offer_price || 0);
  const displayRegularPrice = customRegularPrice > 0 ? customRegularPrice : Number(primaryProduct?.regular_price || 0);

  // Features list (Strictly what Admin entered)
  const features = (Array.isArray(customPage.features) ? customPage.features : (Array.isArray(customPage.bullets) ? customPage.bullets : []))
    .map(f => String(f || '').trim())
    .filter(Boolean);

  // Specifications list (From Admin specifications field or selected product's specification)
  const rawSpecsText = String(customPage.specifications || primaryProduct?.specification || '').trim();
  const specRows = rawSpecsText
    ? rawSpecsText.split(/\r?\n|\|/).map(line => line.trim()).filter(Boolean).map(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          return { label: line.slice(0, colonIdx).trim(), value: line.slice(colonIdx + 1).trim() };
        }
        return { label: '', value: line };
      })
    : [];

  // Detailed description (From Admin description field or selected product's description if Admin left it empty)
  const finalDescription = description || String(primaryProduct?.description || '').trim();

  // Gallery banners (Strictly what Admin added)
  const galleryBanners = (Array.isArray(customPage.banners) ? customPage.banners : [])
    .map(b => (typeof b === 'string' ? { url: b, caption: '' } : { url: b?.url || '', caption: b?.caption || '' }))
    .filter(b => b.url);

  // Videos (Strictly what Admin added)
  const videos = (Array.isArray(customPage.videos) ? customPage.videos : [])
    .map(v => (typeof v === 'string' ? { url: v, title: '' } : { url: v?.url || '', title: v?.title || '' }))
    .filter(v => v.url);

  // Delivery areas
  const activeDeliveryMethods = getGlobalDeliveryMethods(true);

  if (typeof window !== 'undefined') {
    window.__lpProductsList = lpProducts;
    window.__lpQuantity = 1;
    setTimeout(() => {
      if (lpProducts.length > 0 && window.selectLpProduct) {
        window.selectLpProduct(0);
      }
      if (countdownHours > 0 && window.initLpCountdown) {
        window.initLpCountdown(countdownHours);
      }
    }, 60);
  }

  return `
    <style id="dcbd-lp-modern-styles">
      @keyframes lpFadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes lpPulseGlow {
        0%, 100% { box-shadow: 0 10px 25px -4px ${palette.glow}; transform: scale(1); }
        50% { box-shadow: 0 16px 35px -2px ${palette.glow}; transform: scale(1.015); }
      }
      @keyframes lpFloatSlow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }

      .lp-modern-root {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: radial-gradient(circle at top right, ${palette.primaryLight}, #f8fafc 45%, #f1f5f9 100%);
        color: #0f172a;
        min-height: 100vh;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }

      .lp-wrap {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0 16px;
      }

      .lp-animate-card {
        animation: lpFadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      /* Sticky Glass Header Bar */
      .lp-sticky-nav {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(255, 255, 255, 0.88);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid rgba(226, 232, 240, 0.85);
        box-shadow: 0 4px 20px -6px rgba(15, 23, 42, 0.06);
      }

      .lp-main-site-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 18px;
        border-radius: 9999px;
        font-size: 12.5px;
        font-weight: 800;
        color: #0f172a;
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
        transition: all 0.2s ease;
        text-decoration: none;
      }
      .lp-main-site-btn:hover {
        border-color: ${palette.primary};
        color: ${palette.primary};
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
      }

      /* Top Promo Banner */
      .lp-promo-topbar {
        background: ${palette.gradient};
        color: #ffffff;
        padding: 10px 16px;
      }

      /* Hero Showcase Card */
      .lp-hero-card {
        background: #ffffff;
        border-radius: 28px;
        border: 1px solid rgba(226, 232, 240, 0.9);
        box-shadow: 0 20px 50px -15px rgba(15, 23, 42, 0.08);
        overflow: hidden;
        margin-top: 24px;
        margin-bottom: 28px;
      }

      .lp-cta-button {
        background: ${palette.btnGradient};
        color: #ffffff !important;
        font-weight: 800;
        font-size: 15px;
        padding: 14px 34px;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border: none;
        cursor: pointer;
        text-decoration: none;
        animation: lpPulseGlow 3s infinite ease-in-out;
        transition: all 0.25s ease;
      }
      .lp-cta-button:hover {
        transform: translateY(-2px) scale(1.02);
        filter: brightness(1.06);
      }

      /* Elevated Section Card */
      .lp-surface-card {
        background: #ffffff;
        border-radius: 24px;
        padding: 28px 24px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 12px 32px -12px rgba(15, 23, 42, 0.06);
        margin-bottom: 28px;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }
      @media (min-width: 640px) {
        .lp-surface-card {
          padding: 36px 34px;
        }
      }

      .lp-section-title {
        font-size: 20px;
        font-weight: 900;
        color: #0f172a;
        text-align: center;
        margin-bottom: 24px;
        position: relative;
        padding-bottom: 12px;
      }
      .lp-section-title::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 64px;
        height: 4px;
        background: ${palette.primary};
        border-radius: 9999px;
      }

      /* Feature Cards */
      .lp-feature-item {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 16px 18px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        transition: all 0.2s ease;
      }
      .lp-feature-item:hover {
        background: #ffffff;
        border-color: ${palette.accent};
        transform: translateY(-2px);
        box-shadow: 0 10px 24px -10px rgba(15, 23, 42, 0.08);
      }

      /* Product / Package Selection Card */
      .lp-pkg-card {
        background: #ffffff;
        border: 2px solid #e2e8f0;
        border-radius: 18px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .lp-pkg-card:hover {
        border-color: #94a3b8;
      }
      .lp-pkg-card.lp-pkg-active {
        border-color: ${palette.primary};
        background: ${palette.primaryLight};
        box-shadow: 0 8px 20px -6px ${palette.glow};
      }

      /* Color & Size Pills */
      .lp-pill-btn {
        padding: 6px 14px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 800;
        border: 1.5px solid #cbd5e1;
        background: #ffffff;
        color: #334155;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .lp-pill-btn:hover {
        border-color: ${palette.primary};
      }
      .lp-pill-btn.active {
        background: ${palette.primary};
        color: #ffffff;
        border-color: ${palette.primary};
        box-shadow: 0 4px 10px ${palette.glow};
      }

      .lp-input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1.5px solid #cbd5e1;
        background: #f8fafc;
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        outline: none;
        transition: all 0.2s ease;
      }
      .lp-input:focus {
        background: #ffffff;
        border-color: ${palette.primary};
        box-shadow: 0 0 0 3px ${palette.glow};
      }
    </style>

    <div class="lp-modern-root pb-20">

      <!-- 1. OPTIONAL TOP PROMO & COUNTDOWN BAR (Renders ONLY if promo or countdown_hours is set by Admin) -->
      ${(promo || countdownHours > 0) ? `
        <div class="lp-promo-topbar">
          <div class="lp-wrap flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
            ${promo ? `
              <div class="text-xs sm:text-sm font-extrabold tracking-wide flex items-center justify-center sm:justify-start gap-2">
                <span>⚡</span>
                <span>${promo}</span>
              </div>
            ` : '<div></div>'}

            ${countdownHours > 0 ? `
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <div class="bg-black/25 border border-white/20 rounded-lg px-2.5 py-1 text-center min-w-[44px]">
                  <div id="lp-cd-days" class="text-sm font-black font-mono leading-none">00</div>
                  <div class="text-[9px] uppercase opacity-80 mt-0.5">Days</div>
                </div>
                <div class="bg-black/25 border border-white/20 rounded-lg px-2.5 py-1 text-center min-w-[44px]">
                  <div id="lp-cd-hours" class="text-sm font-black font-mono leading-none">00</div>
                  <div class="text-[9px] uppercase opacity-80 mt-0.5">Hrs</div>
                </div>
                <div class="bg-black/25 border border-white/20 rounded-lg px-2.5 py-1 text-center min-w-[44px]">
                  <div id="lp-cd-mins" class="text-sm font-black font-mono leading-none">00</div>
                  <div class="text-[9px] uppercase opacity-80 mt-0.5">Min</div>
                </div>
                <div class="bg-black/25 border border-white/20 rounded-lg px-2.5 py-1 text-center min-w-[44px]">
                  <div id="lp-cd-secs" class="text-sm font-black font-mono leading-none">00</div>
                  <div class="text-[9px] uppercase opacity-80 mt-0.5">Sec</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- 2. STICKY BRAND HEADER WITH "মূল ওয়েবসাইটে যান" BUTTON -->
      <nav class="lp-sticky-nav">
        <div class="lp-wrap py-3 flex items-center justify-between gap-3">
          <a href="/products" class="flex items-center gap-2.5 text-decoration-none group">
            <img 
              src="${shopLogo}" 
              alt="${shopName}" 
              class="w-10 h-10 rounded-xl object-contain border border-slate-200 bg-white p-1 shadow-xs group-hover:scale-105 transition" 
            />
            <div>
              <div class="text-sm sm:text-base font-black text-slate-900 leading-tight">${shopName}</div>
              <div class="text-[10px] font-bold text-emerald-600">অফিশিয়াল স্টোর</div>
            </div>
          </a>

          <div class="flex items-center gap-2.5">
            ${contactPhone ? `
              <a href="tel:${cleanPhone}" class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition">
                <span>📞</span>
                <span class="font-mono">${contactPhone}</span>
              </a>
            ` : ''}

            <a href="/products" class="lp-main-site-btn">
              <span>🛍️ মূল ওয়েবসাইটে যান</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </nav>

      <main class="lp-wrap pt-2">

        <!-- 3. HERO SHOWCASE CARD (Renders strictly from Admin inputs) -->
        ${(title || subtitle || badge || heroBanner || displayOfferPrice > 0) ? `
          <div class="lp-hero-card lp-animate-card">
            <div class="grid grid-cols-1 ${heroBanner ? 'lg:grid-cols-12' : ''} items-center">
              
              <!-- Left Content Column -->
              <div class="${heroBanner ? 'lg:col-span-7' : 'col-span-full text-center max-w-3xl mx-auto'} p-6 sm:p-10 lg:p-12 space-y-5">
                
                ${badge ? `
                  <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-xs" style="background-color: ${palette.primaryLight}; color: ${palette.primary}; border: 1px solid ${palette.glow};">
                    <span>${badge}</span>
                  </div>
                ` : ''}

                ${title ? `
                  <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                    ${title}
                  </h1>
                ` : ''}

                ${subtitle ? `
                  <p class="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                    ${subtitle}
                  </p>
                ` : ''}

                ${(displayOfferPrice > 0 || displayRegularPrice > 0) ? `
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 inline-flex flex-wrap items-baseline gap-3">
                    ${displayRegularPrice > displayOfferPrice ? `
                      <div class="text-xs sm:text-sm text-slate-500 font-bold">
                        রেগুলার মূল্য: <span class="line-through text-rose-500 font-mono font-extrabold">${formatCurrency(displayRegularPrice)}</span>
                      </div>
                    ` : ''}
                    ${displayOfferPrice > 0 ? `
                      <div class="text-base sm:text-xl font-black" style="color: ${palette.primary};">
                        অফার মূল্য: <span class="font-mono text-xl sm:text-2xl">${formatCurrency(displayOfferPrice)}</span>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

                ${giftNote ? `
                  <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm font-bold flex items-center gap-2">
                    <span>🎁</span>
                    <span>${giftNote}</span>
                  </div>
                ` : ''}

                <div class="pt-2 flex flex-wrap items-center ${heroBanner ? '' : 'justify-center'} gap-3">
                  <button type="button" onclick="window.scrollToLpOrder()" class="lp-cta-button">
                    <span>🛒 ${ctaText}</span>
                  </button>
                  <a href="/products" class="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm transition">
                    🛍️ মূল ওয়েবসাইটে যান →
                  </a>
                </div>

              </div>

              <!-- Right Hero Banner Image -->
              ${heroBanner ? `
                <div class="lg:col-span-5 bg-slate-100/70 p-4 sm:p-6 flex items-center justify-center h-full">
                  <div class="relative w-full rounded-2xl overflow-hidden shadow-lg border border-white bg-white">
                    <img 
                      src="${heroBanner}" 
                      alt="${title || shopName}" 
                      class="w-full h-auto max-h-[460px] object-contain mx-auto transition duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              ` : ''}

            </div>
          </div>
        ` : ''}

        <!-- 4. BULLET FEATURES / WHY CHOOSE US (Renders ONLY if Admin added features) -->
        ${features.length > 0 ? `
          <div class="lp-surface-card lp-animate-card">
            <h2 class="lp-section-title">বিশেষ সুবিধাসমূহ</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${features.map(ft => `
                <div class="lp-feature-item">
                  <span class="w-7 h-7 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-xs" style="background: ${palette.btnGradient};">
                    ✓
                  </span>
                  <span class="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed pt-0.5">${ft}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 5. DETAILED DESCRIPTION & SPECIFICATIONS (Renders ONLY if description or specifications exist) -->
        ${(finalDescription || specRows.length > 0) ? `
          <div class="grid grid-cols-1 ${finalDescription && specRows.length > 0 ? 'lg:grid-cols-12' : ''} gap-6 mb-7">
            
            ${finalDescription ? `
              <div class="${specRows.length > 0 ? 'lg:col-span-7' : 'col-span-full'} lp-surface-card !mb-0">
                <h2 class="lp-section-title !text-left after:!left-0 after:!translate-x-0">বিস্তারিত বিবরণ</h2>
                <div class="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line font-medium">
                  ${finalDescription}
                </div>
              </div>
            ` : ''}

            ${specRows.length > 0 ? `
              <div class="${finalDescription ? 'lg:col-span-5' : 'col-span-full'} lp-surface-card !mb-0">
                <h2 class="lp-section-title !text-left after:!left-0 after:!translate-x-0">পণ্যের স্পেসিফিকেশন</h2>
                <div class="divide-y divide-slate-100 text-xs sm:text-sm">
                  ${specRows.map(r => `
                    <div class="py-2.5 flex items-start justify-between gap-3">
                      ${r.label ? `
                        <span class="font-extrabold text-slate-800 w-36 flex-shrink-0">${r.label}:</span>
                        <span class="text-slate-600 font-semibold text-right flex-1">${r.value}</span>
                      ` : `
                        <span class="text-slate-700 font-semibold">${r.value}</span>
                      `}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

          </div>
        ` : ''}

        <!-- 6. SELECTED PRODUCTS SHOWCASE GRID (Renders when Admin selected products for this landing page) -->
        ${matchedProducts.length > 0 ? `
          <div class="lp-surface-card lp-animate-card">
            <h2 class="lp-section-title">ক্যাম্পেইনের পণ্যসমূহ</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(3, matchedProducts.length)} gap-5">
              ${lpProducts.map((p, idx) => {
                const thumb = p.thumbnail || (Array.isArray(p.images) && p.images[0]) || shopLogo;
                const price = Number(p.offer_price || p.selling_price || 0);
                const orig = Number(p.regular_price || p.original_price || 0);
                const discPct = (orig > price && orig > 0) ? Math.round(((orig - price) / orig) * 100) : 0;
                return `
                  <div class="rounded-3xl border border-slate-200/90 bg-slate-50/60 hover:bg-white p-4 flex flex-col justify-between transition duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div>
                      <div class="relative h-56 rounded-2xl overflow-hidden bg-white border border-slate-100 mb-3.5">
                        <img src="${thumb}" alt="${p.name}" class="w-full h-full object-contain p-2 transition duration-500 hover:scale-105" />
                        ${discPct > 0 ? `
                          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[11px] shadow">
                            -${discPct}% ছাড়
                          </span>
                        ` : ''}
                      </div>
                      <h3 class="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug mb-2">
                        ${p.name || p.p_name}
                      </h3>
                    </div>

                    <div class="pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2 mt-2">
                      <div>
                        <div class="text-base sm:text-lg font-black font-mono" style="color: ${palette.primary};">
                          ${formatCurrency(price)}
                        </div>
                        ${orig > price ? `
                          <div class="text-[11px] text-slate-400 line-through font-mono">${formatCurrency(orig)}</div>
                        ` : ''}
                      </div>
                      <button 
                        type="button" 
                        onclick="window.scrollToLpOrder(${idx})" 
                        class="px-4 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition hover:opacity-95 cursor-pointer"
                        style="background: ${palette.btnGradient};"
                      >
                        🛒 অর্ডার করুন
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 7. GALLERY BANNERS / IMAGES (Renders ONLY if Admin uploaded gallery images) -->
        ${galleryBanners.length > 0 ? `
          <div class="lp-surface-card lp-animate-card">
            <h2 class="lp-section-title">ফটো গ্যালারি</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              ${galleryBanners.map(b => `
                <div class="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-lg transition group">
                  <div class="overflow-hidden bg-slate-100">
                    <img src="${b.url}" alt="${b.caption || title}" class="w-full h-72 object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  ${b.caption ? `
                    <div class="p-3.5 text-center font-bold text-xs sm:text-sm text-slate-800">${b.caption}</div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 8. VIDEOS SECTION (Renders ONLY if Admin added videos) -->
        ${videos.length > 0 ? `
          <div class="lp-surface-card lp-animate-card">
            <h2 class="lp-section-title">ভিডিও ও রিভিউ</h2>
            <div class="grid grid-cols-1 ${videos.length > 1 ? 'md:grid-cols-2' : 'max-w-3xl mx-auto'} gap-5">
              ${videos.map(v => `
                <div class="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 p-3 shadow-md space-y-2.5">
                  <div class="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe src="${v.url}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
                  </div>
                  ${v.title ? `
                    <div class="text-xs sm:text-sm font-bold text-white text-center py-1">${v.title}</div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 9. TWO-COLUMN ORDER CHECKOUT SECTION -->
        <section id="lp-checkout-section" class="scroll-mt-20">
          <div class="lp-surface-card !border-2" style="border-color: ${palette.primary};">
            <div class="text-center max-w-xl mx-auto mb-8">
              <span class="inline-block px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2" style="background: ${palette.primaryLight}; color: ${palette.primary};">
                সহজ অর্ডার ফর্ম
              </span>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900">
                অর্ডার কনফার্ম করতে নিচের ফর্মটি পূরণ করুন
              </h2>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <!-- LEFT COLUMN: Product / Package Selection & Live Summary (6 cols) -->
              <div class="lg:col-span-6 space-y-5">
                <div class="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b pb-2.5">
                  <span class="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center" style="background: ${palette.primary};">১</span>
                  <span>পণ্য নির্বাচন ও অর্ডারের বিবরণ</span>
                </div>

                <!-- Product Radio Cards -->
                <div class="space-y-3">
                  ${lpProducts.map((p, idx) => {
                    const thumb = p.thumbnail || (Array.isArray(p.images) && p.images[0]) || shopLogo;
                    const price = Number(p.offer_price || p.selling_price || 0);
                    const orig = Number(p.regular_price || p.original_price || 0);
                    return `
                      <div 
                        class="lp-pkg-card ${idx === 0 ? 'lp-pkg-active' : ''}" 
                        data-pkg-idx="${idx}"
                        onclick="window.selectLpProduct(${idx})"
                      >
                        <div class="flex items-center gap-3.5">
                          <input type="radio" name="lp_product_choice" ${idx === 0 ? 'checked' : ''} class="w-4 h-4 accent-emerald-600" />
                          <img src="${thumb}" alt="${p.name}" class="w-14 h-14 rounded-xl object-cover border bg-white flex-shrink-0" />
                          <div class="flex-1 min-w-0">
                            <div class="font-extrabold text-xs sm:text-sm text-slate-900 truncate">${p.name || p.p_name}</div>
                            <div class="flex items-baseline gap-2 mt-1">
                              <span class="font-black text-sm font-mono" style="color: ${palette.primary};">${formatCurrency(price)}</span>
                              ${orig > price ? `<span class="text-xs text-slate-400 line-through font-mono">${formatCurrency(orig)}</span>` : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- Dynamic Color & Size Selector Containers (Only visible if product/campaign has colors or sizes) -->
                <div id="lp-dynamic-colors-wrap" class="hidden p-4 rounded-2xl bg-slate-50 border border-slate-200/80"></div>
                <div id="lp-dynamic-sizes-wrap" class="hidden p-4 rounded-2xl bg-slate-50 border border-slate-200/80"></div>

                <!-- Order Summary Box -->
                <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 space-y-3.5 text-xs">
                  <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <img id="lp-summary-prod-thumb" src="${primaryProduct?.thumbnail || heroBanner || shopLogo}" class="w-12 h-12 rounded-xl object-cover border bg-white flex-shrink-0" />
                      <div class="min-w-0">
                        <div id="lp-summary-prod-title" class="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                          ${primaryProduct?.name || title || shopName}
                        </div>
                        <div id="lp-summary-prod-meta" class="text-[11px] text-emerald-700 font-bold mt-0.5"></div>
                      </div>
                    </div>

                    <div class="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden flex-shrink-0">
                      <button type="button" onclick="window.stepLpQty(-1)" class="px-3 py-1.5 font-black text-slate-700 hover:bg-slate-100 cursor-pointer">−</button>
                      <span id="lp-qty-val" class="px-3 py-1.5 font-black text-slate-900 font-mono">1</span>
                      <button type="button" onclick="window.stepLpQty(1)" class="px-3 py-1.5 font-black text-slate-700 hover:bg-slate-100 cursor-pointer">+</button>
                    </div>
                  </div>

                  <div class="space-y-2 text-slate-600">
                    <div class="flex justify-between items-center">
                      <span>পণ্যের মূল্য:</span>
                      <span id="lp-calc-subtotal" class="font-bold text-slate-900 font-mono">${formatCurrency(displayOfferPrice)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span>ডেলিভারি চার্জ:</span>
                      <span id="lp-calc-delivery" class="font-bold font-mono">
                        ${freeShipping ? '<span class="text-emerald-600 font-black">ফ্রি ডেলিভারি (৳০)</span>' : formatCurrency(activeDeliveryMethods[0]?.charge || 70)}
                      </span>
                    </div>
                    <div class="flex justify-between items-center pt-2.5 border-t border-slate-200 text-sm sm:text-base font-black text-slate-900">
                      <span>সর্বমোট প্রদেয়:</span>
                      <span id="lp-calc-grand" class="font-mono text-lg" style="color: ${palette.primary};">
                        ${formatCurrency(displayOfferPrice + (freeShipping ? 0 : Number(activeDeliveryMethods[0]?.charge || 70)))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- RIGHT COLUMN: Customer Shipping Form (6 cols) -->
              <div class="lg:col-span-6 space-y-4">
                <div class="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b pb-2.5">
                  <span class="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center" style="background: ${palette.primary};">২</span>
                  <span>আপনার নাম ও ডেলিভারি ঠিকানা দিন</span>
                </div>

                <form onsubmit="window.submitLpOrderForm(event)" class="space-y-4 text-xs">
                  <div>
                    <label class="block font-extrabold text-slate-700 mb-1.5">
                      আপনার নাম <span class="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="lp-cust-name" 
                      required 
                      placeholder="আপনার পূর্ণ নাম লিখুন" 
                      class="lp-input"
                    />
                  </div>

                  <div>
                    <label class="block font-extrabold text-slate-700 mb-1.5">
                      মোবাইল নম্বর (১১ ডিজিট) <span class="text-rose-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      id="lp-cust-phone" 
                      required 
                      placeholder="01XXXXXXXXX" 
                      class="lp-input font-mono"
                    />
                  </div>

                  <div>
                    <label class="block font-extrabold text-slate-700 mb-1.5">
                      ডেলিভারি এরিয়া <span class="text-rose-500">*</span>
                    </label>
                    <select 
                      id="lp-cust-area" 
                      onchange="window.updateLpOrderSummary()" 
                      class="lp-input cursor-pointer"
                    >
                      ${freeShipping ? `
                        <option value="free" data-charge="0" data-zone-label="ফ্রি হোম ডেলিভারি">সারা বাংলাদেশ — ফ্রি হোম ডেলিভারি (৳০)</option>
                      ` : activeDeliveryMethods.map(dm => {
                        const c = Number(dm.charge || 0);
                        return `<option value="${dm.code || dm.id}" data-charge="${c}" data-zone-label="${dm.zone}">${dm.zone} — ${c === 0 ? 'ফ্রি (৳০)' : `৳${c}`}</option>`;
                      }).join('')}
                    </select>
                  </div>

                  <div>
                    <label class="block font-extrabold text-slate-700 mb-1.5">
                      সম্পূর্ণ ডেলিভারি ঠিকানা <span class="text-rose-500">*</span>
                    </label>
                    <textarea 
                      id="lp-cust-address" 
                      rows="3" 
                      required 
                      placeholder="বাসা/হোল্ডিং নং, রোড নং, গ্রাম/এলাকা, থানা ও জেলা লিখুন..." 
                      class="lp-input"
                    ></textarea>
                  </div>

                  <div>
                    <label class="block font-extrabold text-slate-700 mb-1.5">
                      অতিরিক্ত নোট (যদি থাকে)
                    </label>
                    <input 
                      type="text" 
                      id="lp-cust-note" 
                      placeholder="কালার, সাইজ বা ডেলিভারি সংক্রান্ত কোনো নির্দেশনা থাকলে লিখুন..." 
                      class="lp-input"
                    />
                  </div>

                  <div class="pt-2">
                    <button 
                      type="submit" 
                      id="lp-submit-btn" 
                      class="lp-cta-button w-full py-4 text-sm sm:text-base rounded-2xl shadow-xl"
                    >
                      <span>✓ অর্ডার কনফার্ম করুন</span>
                      <span>(<span id="lp-submit-btn-price" class="font-mono">${formatCurrency(displayOfferPrice)}</span>)</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </section>

        <!-- 10. BOTTOM SUPPORT & MAIN WEBSITE NAVIGATION BAR -->
        <div class="lp-surface-card text-center space-y-4 !mb-6">
          ${intlPhone ? `
            <div class="space-y-1">
              <div class="text-xs font-bold text-slate-500">যেকোনো প্রয়োজনে সরাসরি কথা বলুন</div>
              <div class="text-lg sm:text-xl font-black text-slate-900 font-mono">${contactPhone}</div>
            </div>
          ` : ''}

          <div class="flex flex-wrap items-center justify-center gap-3">
            ${intlPhone ? `
              <a href="tel:+${intlPhone}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition">
                <span>📞 সরাসরি কল করুন</span>
              </a>
              <a href="https://wa.me/${intlPhone}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition">
                <span>💬 হোয়াটসঅ্যাপে মেসেজ দিন</span>
              </a>
            ` : ''}

            <a href="/products" class="lp-main-site-btn">
              <span>🛍️ মূল ওয়েবসাইটে যান (সকল পণ্য দেখুন)</span>
              <span>→</span>
            </a>
          </div>
        </div>

      </main>
    </div>
  `;
}
