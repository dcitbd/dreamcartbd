/**
 * DREAM CART BD — DYNAMIC MODERN CAMPAIGN LANDING PAGE (LandingPage.js)
 * Implements user requirements:
 * - Zero hardcoded/default texts from other pages (100% driven by Admin Panel Landing Page Builder & Selected Products).
 * - Only renders sections that the Admin has actually filled in or selected.
 * - Prominent "🛍️ মূল ওয়েবসাইটে যান" (Visit Main Website) button linking directly to Customer View `/products`.
 * - 100% Self-Contained Responsive Scoped CSS (zero dependency on missing Tailwind classes).
 * - Luxury Product Showcase Cards & Responsive Checkout Product Selector Cards (no text overflow, crisp images).
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

  window.selectLpProduct = function(idx, scrollToCheckout) {
    const list = window.__lpProductsList || [];
    const prod = list[idx];
    if (!prod) return;

    window.__lpSelectedPackage = idx;
    window.__lpPackagePrice = Number(prod.offer_price || prod.selling_price || prod.price || 0);
    window.__lpPackageRegularPrice = Number(prod.regular_price || prod.original_price || 0);
    window.__lpPackageTitle = prod.name || prod.p_name || '';
    window.__lpPackageSku = prod.sku || prod.product_id || prod.id || '';
    window.__lpPackageImage = prod.image_url || prod.image || '';

    // Highlight selected card inside checkout form
    document.querySelectorAll('.lp-pkg-card').forEach((card, i) => {
      const radioDot = card.querySelector('.lp-pkg-radio-dot');
      const statusBadge = card.querySelector('.lp-pkg-active-pill');
      if (i === idx) {
        card.classList.add('is-selected');
        if (radioDot) radioDot.style.transform = 'scale(1)';
        if (statusBadge) statusBadge.style.display = 'inline-flex';
      } else {
        card.classList.remove('is-selected');
        if (radioDot) radioDot.style.transform = 'scale(0)';
        if (statusBadge) statusBadge.style.display = 'none';
      }
    });

    // Highlight selected card in the top Showcase Grid
    document.querySelectorAll('.lp-showcase-card').forEach((card, i) => {
      const badge = card.querySelector('.lp-showcase-selected-pill');
      const btn = card.querySelector('.lp-showcase-select-btn');
      if (i === idx) {
        card.classList.add('is-selected');
        if (badge) badge.style.display = 'inline-flex';
        if (btn) btn.innerHTML = '✓ নির্বাচিত পণ্য — অর্ডার ফর্মে যান';
      } else {
        card.classList.remove('is-selected');
        if (badge) badge.style.display = 'none';
        if (btn) btn.innerHTML = '🛒 এটি সিলেক্ট করে অর্ডার করুন';
      }
    });

    // Dynamically refresh Color & Size pills if product has specific colors/sizes
    const colors = Array.isArray(prod.colors) && prod.colors.length > 0 ? prod.colors : (window.__lpDefaultColors || []);
    const sizes = Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes : (window.__lpDefaultSizes || []);

    const colorWrap = document.getElementById('lp-color-selector-wrap');
    const colorContainer = document.getElementById('lp-color-pills');
    if (colorWrap && colorContainer) {
      if (colors.length > 0) {
        colorWrap.style.display = 'block';
        window.__lpSelectedColor = colors[0];
        colorContainer.innerHTML = colors.map((c, ci) => `
          <button type="button" onclick="window.selectLpColor('${String(c).replace(/'/g, "\\'")}', this)"
            class="lp-color-btn ${ci === 0 ? 'is-active' : ''}">
            ${c}
          </button>
        `).join('');
      } else {
        colorWrap.style.display = 'none';
        window.__lpSelectedColor = '';
      }
    }

    const sizeWrap = document.getElementById('lp-size-selector-wrap');
    const sizeContainer = document.getElementById('lp-size-pills');
    if (sizeWrap && sizeContainer) {
      if (sizes.length > 0) {
        sizeWrap.style.display = 'block';
        window.__lpSelectedSize = sizes[0];
        sizeContainer.innerHTML = sizes.map((s, si) => `
          <button type="button" onclick="window.selectLpSize('${String(s).replace(/'/g, "\\'")}', this)"
            class="lp-size-btn ${si === 0 ? 'is-active' : ''}">
            ${s}
          </button>
        `).join('');
      } else {
        sizeWrap.style.display = 'none';
        window.__lpSelectedSize = '';
      }
    }

    if (typeof window.updateLpOrderCalculation === 'function') {
      window.updateLpOrderCalculation();
    }

    if (scrollToCheckout) {
      const checkoutEl = document.getElementById('lp-checkout-section');
      if (checkoutEl) {
        checkoutEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  window.selectLpColor = function(color, btnEl) {
    window.__lpSelectedColor = color;
    document.querySelectorAll('.lp-color-btn').forEach(btn => btn.classList.remove('is-active'));
    if (btnEl) btnEl.classList.add('is-active');
    if (typeof window.updateLpOrderCalculation === 'function') {
      window.updateLpOrderCalculation();
    }
  };

  window.selectLpSize = function(size, btnEl) {
    window.__lpSelectedSize = size;
    document.querySelectorAll('.lp-size-btn').forEach(btn => btn.classList.remove('is-active'));
    if (btnEl) btnEl.classList.add('is-active');
    if (typeof window.updateLpOrderCalculation === 'function') {
      window.updateLpOrderCalculation();
    }
  };

  window.changeLpQty = function(delta) {
    const next = Math.max(1, Math.min(20, (window.__lpQuantity || 1) + delta));
    window.__lpQuantity = next;
    const qtyEl = document.getElementById('lp-qty-display');
    const sumQtyEl = document.getElementById('lp-summary-qty');
    if (qtyEl) qtyEl.textContent = String(next);
    if (sumQtyEl) sumQtyEl.textContent = `× ${next} টি`;
    if (typeof window.updateLpOrderCalculation === 'function') {
      window.updateLpOrderCalculation();
    }
  };

  window.updateLpOrderCalculation = function() {
    const unitPrice = Number(window.__lpPackagePrice || 0);
    const qty = Number(window.__lpQuantity || 1);
    const subtotal = unitPrice * qty;

    const areaSelect = document.getElementById('lp-delivery-area');
    const selectedArea = areaSelect ? areaSelect.value : 'dhaka';
    const isFreeShipping = Boolean(window.__lpFreeShipping);

    let shippingCost = 0;
    if (!isFreeShipping) {
      const confs = window.__lpDeliveryConfs || [];
      if (selectedArea === 'dhaka') {
        const found = confs.find(c => String(c.id || c.area || '').toLowerCase().includes('dhaka') && !String(c.id || c.area || '').toLowerCase().includes('outside') && !String(c.id || c.area || '').toLowerCase().includes('sub'));
        shippingCost = found ? Number(found.charge ?? found.cost ?? 60) : 60;
      } else if (selectedArea === 'sub_dhaka') {
        const found = confs.find(c => String(c.id || c.area || '').toLowerCase().includes('sub'));
        shippingCost = found ? Number(found.charge ?? found.cost ?? 100) : 100;
      } else {
        const found = confs.find(c => String(c.id || c.area || '').toLowerCase().includes('outside'));
        shippingCost = found ? Number(found.charge ?? found.cost ?? 120) : 120;
      }
    }

    const total = subtotal + shippingCost;

    const subEl = document.getElementById('lp-summary-subtotal');
    const shipEl = document.getElementById('lp-summary-shipping');
    const totalEl = document.getElementById('lp-summary-total');
    const titleEl = document.getElementById('lp-summary-title');
    const metaEl = document.getElementById('lp-summary-meta');
    const btnTotalEl = document.getElementById('lp-submit-btn-price');
    const thumbEl = document.getElementById('lp-summary-thumb');

    if (subEl) subEl.textContent = formatCurrency(subtotal);
    if (shipEl) {
      shipEl.textContent = isFreeShipping ? 'ফ্রি ডেলিভারি' : formatCurrency(shippingCost);
      shipEl.style.color = isFreeShipping ? '#34d399' : '#f8fafc';
    }
    if (totalEl) totalEl.textContent = formatCurrency(total);
    if (btnTotalEl) btnTotalEl.textContent = formatCurrency(total);
    if (titleEl && window.__lpPackageTitle) {
      titleEl.textContent = window.__lpPackageTitle;
    }
    if (thumbEl && window.__lpPackageImage) {
      thumbEl.src = window.__lpPackageImage;
      thumbEl.style.display = 'block';
    }
    if (metaEl) {
      const parts = [];
      if (window.__lpSelectedColor) parts.push(`কালার: ${window.__lpSelectedColor}`);
      if (window.__lpSelectedSize) parts.push(`সাইজ: ${window.__lpSelectedSize}`);
      metaEl.textContent = parts.join(' | ');
      metaEl.style.display = parts.length > 0 ? 'block' : 'none';
    }
  };

  window.submitLpDirectOrder = async function(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = document.getElementById('lp-submit-btn');

    const name = form.customer_name?.value?.trim();
    const phone = form.customer_phone?.value?.trim();
    const address = form.customer_address?.value?.trim();
    const area = form.delivery_area?.value || 'dhaka';
    const note = form.order_note?.value?.trim() || '';

    if (!name || !phone || !address) {
      toast.error('অনগ্রহ করে আপনার নাম, মোবাইল নাম্বার এবং সম্পূর্ণ ঠিকানা লিখুন।');
      return;
    }

    const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!bdPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      toast.error('অনগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 017XXXXXXXX)');
      return;
    }

    const unitPrice = Number(window.__lpPackagePrice || 0);
    const qty = Number(window.__lpQuantity || 1);
    const subtotal = unitPrice * qty;
    const isFreeShipping = Boolean(window.__lpFreeShipping);

    let shippingCost = 0;
    let deliveryAreaLabel = 'ঢাকার ভেতরে';
    if (area === 'dhaka') {
      shippingCost = isFreeShipping ? 0 : 60;
      deliveryAreaLabel = 'ঢাকার ভেতরে (Inside Dhaka)';
    } else if (area === 'sub_dhaka') {
      shippingCost = isFreeShipping ? 0 : 100;
      deliveryAreaLabel = 'ঢাকা সাব-এরিয়া (Sub Dhaka)';
    } else {
      shippingCost = isFreeShipping ? 0 : 120;
      deliveryAreaLabel = 'ঢাকার বাইরে (Outside Dhaka)';
    }

    const totalAmount = subtotal + shippingCost;
    const variantDetails = [
      window.__lpSelectedColor ? `কালার: ${window.__lpSelectedColor}` : '',
      window.__lpSelectedSize ? `সাইজ: ${window.__lpSelectedSize}` : ''
    ].filter(Boolean).join(', ');

    const itemTitle = `${window.__lpPackageTitle || 'ক্যাম্পেইন পণ্য'}${variantDetails ? ` (${variantDetails})` : ''}`;

    const generatedOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderPayload = {
      order_id: generatedOrderId,
      orderId: generatedOrderId,
      customer_name: name,
      customer_phone: phone,
      phone: phone,
      customer_email: '',
      customer_address: address,
      shipping_address: address,
      city: deliveryAreaLabel,
      delivery_area: deliveryAreaLabel,
      payment_method: 'Cash on Delivery (ক্যাশ অন ডেলিভারি)',
      notes: `[Landing Page Order] ${variantDetails ? variantDetails + ' | ' : ''}${note}`.trim(),
      subtotal: subtotal,
      delivery_charge: shippingCost,
      shipping_cost: shippingCost,
      discount_amount: 0,
      total_amount: totalAmount,
      payable_amount: totalAmount,
      status: 'Pending',
      created_at: new Date().toISOString(),
      items: [
        {
          product_id: window.__lpPackageSku || 'LP-ITEM',
          sku: window.__lpPackageSku || 'LP-ITEM',
          name: itemTitle,
          product_name: itemTitle,
          price: unitPrice,
          quantity: qty,
          color: window.__lpSelectedColor || '',
          size: window.__lpSelectedSize || '',
          image_url: window.__lpPackageImage || '',
          subtotal: subtotal
        }
      ]
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span style="display:inline-block;animation:lpSpin 0.8s linear infinite;margin-right:8px;">⏳</span> অর্ডার কনফার্ম হচ্ছে...`;
    }

    try {
      const res = await apiClient.post('orders/create', orderPayload);
      const finalOrder = (res && res.data) ? { ...orderPayload, ...res.data } : orderPayload;
      try {
        localStorage.setItem('dcbd_last_order', JSON.stringify(finalOrder));
      } catch (e) {}

      toast.success('অভিনন্দন! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।');
      const targetId = finalOrder.order_id || finalOrder.orderId || generatedOrderId;
      window.history.pushState({}, '', `/order-success?order_id=${encodeURIComponent(targetId)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err) {
      console.error('Landing page order error:', err);
      toast.error(err.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `✅ অর্ডার কনফার্ম করুন (${formatCurrency(totalAmount)})`;
      }
    }
  };
}

function parseJsonSafe(raw, fallback) {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function normalizeSpecs(rawSpecs) {
  if (!rawSpecs) return [];
  if (Array.isArray(rawSpecs)) {
    return rawSpecs.filter(r => r && (r.label || r.key || r.value));
  }
  if (typeof rawSpecs === 'string') {
    const trimmed = rawSpecs.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      const parsed = parseJsonSafe(trimmed, null);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed).map(([k, v]) => ({ label: k, value: String(v) }));
      }
    }
    return trimmed
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const idx = line.indexOf(':');
        if (idx > -1) {
          return {
            label: line.slice(0, idx).trim(),
            value: line.slice(idx + 1).trim()
          };
        }
        return { label: '', value: line };
      });
  }
  return [];
}

function normalizeFeatures(rawFeatures) {
  if (!rawFeatures) return [];
  if (Array.isArray(rawFeatures)) {
    return rawFeatures.map(f => String(f || '').trim()).filter(Boolean);
  }
  if (typeof rawFeatures === 'string') {
    const trimmed = rawFeatures.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      const parsed = parseJsonSafe(trimmed, []);
      if (Array.isArray(parsed)) return parsed.map(f => String(f || '').trim()).filter(Boolean);
    }
    return trimmed.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeStringList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(x => String(x || '').trim()).filter(Boolean);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      const parsed = parseJsonSafe(trimmed, []);
      if (Array.isArray(parsed)) return parsed.map(x => String(x || '').trim()).filter(Boolean);
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export async function LandingPage() {
  const container = document.createElement('div');
  container.className = 'lp-page-root';

  container.innerHTML = `
    <div style="min-height:65vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;">
      <div style="width:48px;height:48px;border:4px solid #10b981;border-top-color:transparent;border-radius:999px;animation:lpSpin 0.8s linear infinite;margin-bottom:14px;"></div>
      <p style="font-size:14px;font-weight:700;color:#475569;">ক্যাম্পেইন পেজ লোড হচ্ছে...</p>
    </div>
  `;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedSlug = urlParams.get('slug') || urlParams.get('campaign') || urlParams.get('id') || '';

    const [lpRes, productsRes, settingsRes] = await Promise.all([
      apiClient.get('landing-pages').catch(() => ({ data: [] })),
      apiClient.get('products', { limit: 500 }).catch(() => ({ data: [] })),
      apiClient.get('settings').catch(() => ({ data: {} }))
    ]);

    const allPages = Array.isArray(lpRes?.data)
      ? lpRes.data
      : (Array.isArray(lpRes?.landing_pages) ? lpRes.landing_pages : []);

    const allProducts = Array.isArray(productsRes?.data)
      ? productsRes.data
      : (Array.isArray(productsRes?.products) ? productsRes.products : []);

    const siteSettings = {
      ...(typeof getGlobalSiteSettings === 'function' ? getGlobalSiteSettings() : {}),
      ...(settingsRes?.data || {})
    };

    const deliveryConfs = typeof getGlobalDeliveryMethods === 'function' ? getGlobalDeliveryMethods() : [];
    window.__lpDeliveryConfs = deliveryConfs;

    // Pick matching landing page by slug/id, or latest active landing page
    let activePage = null;
    if (requestedSlug && allPages.length > 0) {
      activePage = allPages.find(p =>
        String(p.slug || '').toLowerCase() === requestedSlug.toLowerCase() ||
        String(p.id || '') === requestedSlug
      );
    }
    if (!activePage && allPages.length > 0) {
      const activeList = allPages.filter(p => String(p.status || 'active').toLowerCase() === 'active');
      activePage = activeList.length > 0 ? activeList[activeList.length - 1] : allPages[allPages.length - 1];
    }

    // Also check localStorage fallback if admin just created one locally
    if (!activePage) {
      try {
        const localPages = JSON.parse(localStorage.getItem('dcbd_landing_pages_cache') || '[]');
        if (Array.isArray(localPages) && localPages.length > 0) {
          activePage = localPages[localPages.length - 1];
        }
      } catch (e) {}
    }

    // If no landing page exists at all, show a clean empty state with "মূল ওয়েবসাইটে যান"
    if (!activePage) {
      container.innerHTML = `
        <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#f8fafc;">
          <div style="max-width:480px;width:100%;background:#ffffff;border-radius:24px;padding:36px 28px;box-shadow:0 20px 45px -15px rgba(15,23,42,0.08);border:1px solid #e2e8f0;text-align:center;">
            <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:18px;background:#ecfdf5;color:#059669;display:flex;align-items:center;justify-content:center;font-size:30px;">🚀</div>
            <h1 style="font-size:22px;font-weight:900;color:#0f172a;margin:0 0 10px;">এখনো কোনো ল্যান্ডিং পেজ তৈরি করা হয়নি</h1>
            <p style="font-size:14px;color:#64748b;line-height:1.6;margin:0 0 24px;">
              অ্যাডমিন প্যানেল থেকে নতুন ল্যান্ডিং পেজ তৈরি করলে সেটি এখানে সাথে সাথে প্রদর্শিত হবে।
            </p>
            <a href="/products" style="display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border-radius:14px;background:#059669;color:#ffffff;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 10px 20px -5px rgba(5,150,105,0.4);">
              🛍️ মূল ওয়েবসাইটে যান
            </a>
          </div>
        </div>
      `;
      return container;
    }

    // Extract fields strictly from activePage (ZERO unrelated demo text!)
    const pageTitle = String(activePage.title || '').trim();
    const heroHeadline = String(activePage.headline || activePage.title || '').trim();
    const heroSubheadline = String(activePage.subheadline || '').trim();
    const badgeText = String(activePage.badge_text || '').trim();
    const ctaText = String(activePage.cta_text || 'অর্ডার কনফার্ম করুন').trim();
    const heroBanner = String(activePage.hero_banner || '').trim();
    const giftNote = String(activePage.gift_note || '').trim();
    const pageDescription = String(activePage.description || '').trim();
    const freeShipping = Boolean(activePage.free_shipping === true || activePage.free_shipping === 'true');
    const countdownHours = Number(activePage.countdown_hours ?? 0);
    const themeColor = String(activePage.theme_color || 'emerald').toLowerCase();

    window.__lpFreeShipping = freeShipping;

    // Resolve theme palette
    const palettes = {
      emerald: { primary: '#059669', primaryDark: '#047857', light: '#ecfdf5', border: '#6ee7b7', glow: 'rgba(5, 150, 105, 0.22)' },
      rose:    { primary: '#e11d48', primaryDark: '#be123c', light: '#fff1f2', border: '#fda4af', glow: 'rgba(225, 29, 72, 0.22)' },
      indigo:  { primary: '#4f46e5', primaryDark: '#4338ca', light: '#eef2ff', border: '#a5b4fc', glow: 'rgba(79, 70, 229, 0.22)' },
      amber:   { primary: '#d97706', primaryDark: '#b45309', light: '#fffbeb', border: '#fcd34d', glow: 'rgba(217, 119, 6, 0.22)' }
    };
    const palette = palettes[themeColor] || palettes.emerald;

    // Resolve products linked to this landing page
    const rawProds = parseJsonSafe(activePage.products, []);
    const resolvedProducts = [];

    if (Array.isArray(rawProds)) {
      rawProds.forEach(item => {
        if (!item) return;
        const itemId = typeof item === 'object' ? (item.id || item.product_id || item.sku) : item;
        const matched = allProducts.find(p =>
          String(p.id || p.product_id || p.sku || '') === String(itemId)
        );
        if (matched) {
          resolvedProducts.push({
            ...matched,
            offer_price: Number(item.offer_price || activePage.offer_price || matched.selling_price || matched.offer_price || matched.price || 0),
            regular_price: Number(item.regular_price || activePage.regular_price || matched.regular_price || matched.original_price || 0)
          });
        } else if (typeof item === 'object' && (item.name || item.p_name)) {
          resolvedProducts.push({
            ...item,
            offer_price: Number(item.offer_price || activePage.offer_price || item.selling_price || item.price || 0),
            regular_price: Number(item.regular_price || activePage.regular_price || item.original_price || 0)
          });
        }
      });
    }

    // Fallback virtual product if only page-level title/price was entered
    if (resolvedProducts.length === 0 && (pageTitle || heroHeadline || Number(activePage.offer_price) > 0)) {
      resolvedProducts.push({
        id: activePage.id || 'LP-MAIN',
        sku: activePage.slug || 'LP-MAIN',
        name: pageTitle || heroHeadline,
        image_url: heroBanner || '',
        offer_price: Number(activePage.offer_price || 0),
        regular_price: Number(activePage.regular_price || 0),
        description: pageDescription
      });
    }

    window.__lpProductsList = resolvedProducts;

    const firstProd = resolvedProducts[0] || {};
    window.__lpSelectedPackage = 0;
    window.__lpPackagePrice = Number(firstProd.offer_price || firstProd.selling_price || firstProd.price || activePage.offer_price || 0);
    window.__lpPackageRegularPrice = Number(firstProd.regular_price || firstProd.original_price || activePage.regular_price || 0);
    window.__lpPackageTitle = firstProd.name || firstProd.p_name || pageTitle || heroHeadline || '';
    window.__lpPackageSku = firstProd.sku || firstProd.product_id || firstProd.id || 'LP-ITEM';
    window.__lpPackageImage = firstProd.image_url || firstProd.image || heroBanner || '';
    window.__lpQuantity = 1;

    // Features, Specs, Colors, Sizes, Banners, Videos
    const featuresList = normalizeFeatures(activePage.features);
    const specRows = normalizeSpecs(activePage.specifications || firstProd.specifications);
    const defaultColors = normalizeStringList(activePage.colors || firstProd.colors);
    const defaultSizes = normalizeStringList(activePage.sizes || firstProd.sizes);

    window.__lpDefaultColors = defaultColors;
    window.__lpDefaultSizes = defaultSizes;
    window.__lpSelectedColor = defaultColors[0] || '';
    window.__lpSelectedSize = defaultSizes[0] || '';

    const banners = parseJsonSafe(activePage.banners, []).filter(b => b && b.image_url);
    const videos = parseJsonSafe(activePage.videos, []).filter(v => v && v.video_url);

    const finalDescription = pageDescription || String(firstProd.description || firstProd.short_description || '').trim();

    const contactPhone = siteSettings.contact_phone || siteSettings.helpline || siteSettings.phone || '01581703822';
    const cleanPhone = String(contactPhone).replace(/[^0-9+]/g, '');
    const shopName = siteSettings.site_name || siteSettings.shop_name || 'Dream Cart BD';
    const shopLogo = siteSettings.logo_url || siteSettings.site_logo || '';

    const displayRegularPrice = Number(activePage.regular_price || firstProd.regular_price || firstProd.original_price || 0);
    const displayOfferPrice = Number(activePage.offer_price || firstProd.offer_price || firstProd.selling_price || firstProd.price || 0);
    const discountPct = (displayRegularPrice > displayOfferPrice && displayOfferPrice > 0)
      ? Math.round(((displayRegularPrice - displayOfferPrice) / displayRegularPrice) * 100)
      : 0;

    const prodGridClass = resolvedProducts.length === 1
      ? 'lp-products-grid is-single'
      : (resolvedProducts.length === 2 ? 'lp-products-grid is-double' : 'lp-products-grid');

    container.innerHTML = `
      <style id="dcbd-lp-modern-styles">
        @keyframes lpSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes lpPulseGlow {
          0%, 100% { box-shadow: 0 10px 25px -5px ${palette.glow}; transform: translateY(0); }
          50% { box-shadow: 0 16px 32px -4px ${palette.glow}; transform: translateY(-2px); }
        }
        @keyframes lpFloatSlow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }

        .lp-page-root, .lp-page-root * { box-sizing: border-box; font-family: 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
        .lp-page-root { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); color: #0f172a; padding-bottom: 56px; overflow-x: hidden; }
        .lp-wrap { max-width: 1160px; margin: 0 auto; padding: 0 16px; width: 100%; }

        /* Top Announcement Bar */
        .lp-top-bar { background: linear-gradient(90deg, ${palette.primaryDark}, ${palette.primary}); color: #ffffff; padding: 10px 0; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08); }
        .lp-top-bar-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
        .lp-top-badge { font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
        .lp-countdown-wrap { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; }
        .lp-timer-group { display: flex; align-items: center; gap: 5px; }
        .lp-timer-box { background: rgba(15, 23, 42, 0.45); border: 1px solid rgba(255, 255, 255, 0.25); color: #ffffff; border-radius: 8px; padding: 3px 8px; min-width: 42px; text-align: center; font-weight: 900; font-size: 12px; }

        /* Sticky Header Navigation */
        .lp-navbar { position: sticky; top: 0; z-index: 45; background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(226, 232, 240, 0.9); box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05); }
        .lp-navbar-inner { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; }
        .lp-brand-link { display: flex; align-items: center; gap: 10px; text-decoration: none; min-width: 0; }
        .lp-brand-logo { height: 38px; width: auto; object-fit: contain; border-radius: 8px; flex-shrink: 0; }
        .lp-brand-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 18px; background: ${palette.primary}; flex-shrink: 0; }
        .lp-brand-name { font-size: 16px; font-weight: 900; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lp-brand-sub { font-size: 11px; color: #64748b; font-weight: 600; }
        .lp-nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .lp-nav-phone { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; background: #f1f5f9; color: #1e293b; font-weight: 800; font-size: 12px; text-decoration: none; transition: background 0.2s; }
        .lp-nav-phone:hover { background: #e2e8f0; }
        .lp-nav-store-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1; font-weight: 800; font-size: 12px; text-decoration: none; transition: all 0.2s; }
        .lp-nav-store-btn:hover { border-color: #0f172a; background: #f8fafc; }
        .lp-nav-order-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 999px; background: ${palette.primary}; color: #ffffff; font-weight: 800; font-size: 12px; text-decoration: none; box-shadow: 0 4px 12px ${palette.glow}; }

        /* Surface Cards */
        .lp-surface-card { background: #ffffff; border-radius: 24px; border: 1px solid rgba(226, 232, 240, 0.9); box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.05); padding: 28px; margin-bottom: 26px; overflow: hidden; }
        .lp-section-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; }
        .lp-section-title { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
        .lp-section-sub { font-size: 12px; font-weight: 700; color: #64748b; }

        /* Hero Showcase Card */
        .lp-hero-card { background: #ffffff; border-radius: 26px; border: 1px solid rgba(226, 232, 240, 0.95); box-shadow: 0 16px 40px -12px rgba(15, 23, 42, 0.07); margin-top: 20px; margin-bottom: 26px; overflow: hidden; }
        .lp-hero-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); align-items: center; }
        .lp-hero-grid.is-single { grid-template-columns: minmax(0, 1fr); text-align: center; max-width: 780px; margin: 0 auto; }
        .lp-hero-content { padding: 36px 34px; min-width: 0; }
        .lp-hero-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 800; background: ${palette.light}; color: ${palette.primary}; border: 1px solid ${palette.border}; margin-bottom: 14px; }
        .lp-hero-title { font-size: 30px; font-weight: 900; color: #0f172a; line-height: 1.3; margin: 0 0 12px; word-break: break-word; }
        .lp-hero-subtitle { font-size: 15px; color: #475569; line-height: 1.65; font-weight: 500; margin: 0 0 20px; word-break: break-word; }
        .lp-hero-price-box { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 14px 20px; border-radius: 18px; background: #f8fafc; border: 1.5px solid #e2e8f0; margin-bottom: 18px; }
        .lp-hero-reg-price { font-size: 13px; color: #64748b; font-weight: 700; }
        .lp-hero-reg-price del { color: #ef4444; font-weight: 800; margin-left: 4px; }
        .lp-hero-offer-price { font-size: 20px; font-weight: 900; color: ${palette.primary}; }
        .lp-hero-save-badge { padding: 4px 10px; border-radius: 999px; background: #e11d48; color: #ffffff; font-size: 11px; font-weight: 900; }
        .lp-gift-banner { padding: 12px 16px; border-radius: 14px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .lp-hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
        .lp-btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; border-radius: 16px; font-weight: 900; font-size: 15px; color: #ffffff; background: linear-gradient(135deg, ${palette.primary}, ${palette.primaryDark}); text-decoration: none; border: none; cursor: pointer; animation: lpPulseGlow 2.6s infinite; transition: transform 0.2s ease; }
        .lp-btn-primary:hover { transform: scale(1.02); }
        .lp-btn-secondary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 22px; border-radius: 16px; font-weight: 800; font-size: 14px; color: #1e293b; background: #f1f5f9; border: 1px solid #cbd5e1; text-decoration: none; transition: all 0.2s ease; }
        .lp-btn-secondary:hover { background: #e2e8f0; }
        .lp-hero-media { background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); padding: 28px; display: flex; align-items: center; justify-content: center; height: 100%; min-height: 320px; border-left: 1px solid #f1f5f9; }
        .lp-hero-img-box { width: 100%; max-width: 420px; height: 340px; background: #ffffff; border-radius: 20px; padding: 14px; border: 1px solid #e2e8f0; box-shadow: 0 14px 30px -10px rgba(15, 23, 42, 0.08); display: flex; align-items: center; justify-content: center; overflow: hidden; animation: lpFloatSlow 5s ease-in-out infinite; }
        .lp-hero-img-box img { width: 100%; height: 100%; object-fit: contain; border-radius: 12px; }

        /* Campaign Products Showcase Grid (Luxury Product View) */
        .lp-products-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; align-items: stretch; }
        .lp-products-grid.is-single { grid-template-columns: minmax(0, 400px); justify-content: center; }
        .lp-products-grid.is-double { grid-template-columns: repeat(2, minmax(0, 380px)); justify-content: center; }
        .lp-showcase-card { position: relative; display: flex; flex-direction: column; background: #ffffff; border: 2px solid #e2e8f0; border-radius: 20px; padding: 14px; transition: all 0.25s ease; cursor: pointer; min-width: 0; overflow: hidden; box-shadow: 0 4px 14px -4px rgba(15, 23, 42, 0.04); }
        .lp-showcase-card:hover { transform: translateY(-4px); border-color: ${palette.border}; box-shadow: 0 16px 32px -10px rgba(15, 23, 42, 0.1); }
        .lp-showcase-card.is-selected { border-color: ${palette.primary}; background: linear-gradient(180deg, #ffffff 0%, ${palette.light} 100%); box-shadow: 0 12px 28px -8px ${palette.glow}; }
        .lp-showcase-img-wrap { position: relative; width: 100%; height: 215px; border-radius: 14px; background: #f8fafc; border: 1px solid #f1f5f9; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; padding: 10px; }
        .lp-showcase-img-wrap img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.35s ease; }
        .lp-showcase-card:hover .lp-showcase-img-wrap img { transform: scale(1.06); }
        .lp-showcase-discount-pill { position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 999px; background: #e11d48; color: #ffffff; font-size: 11px; font-weight: 900; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.25); z-index: 2; }
        .lp-showcase-selected-pill { position: absolute; top: 10px; right: 10px; padding: 4px 10px; border-radius: 999px; background: ${palette.primary}; color: #ffffff; font-size: 11px; font-weight: 900; box-shadow: 0 4px 10px ${palette.glow}; z-index: 2; }
        .lp-showcase-stock-tag { position: absolute; bottom: 8px; left: 10px; padding: 3px 9px; border-radius: 6px; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); color: #34d399; font-size: 10px; font-weight: 800; z-index: 2; }
        .lp-showcase-body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .lp-showcase-title { font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.4; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; min-height: 42px; }
        .lp-showcase-price-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 6px; margin-bottom: 12px; }
        .lp-showcase-offer { font-size: 19px; font-weight: 900; color: ${palette.primary}; }
        .lp-showcase-reg { font-size: 13px; color: #94a3b8; text-decoration: line-through; font-weight: 700; }
        .lp-showcase-select-btn { width: 100%; padding: 11px 14px; border-radius: 12px; font-size: 13px; font-weight: 800; border: 1.5px solid ${palette.primary}; background: #ffffff; color: ${palette.primary}; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .lp-showcase-card.is-selected .lp-showcase-select-btn, .lp-showcase-select-btn:hover { background: ${palette.primary}; color: #ffffff; }

        /* Features, Specs & Media Grids */
        .lp-features-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .lp-feature-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; }
        .lp-feature-icon { width: 26px; height: 26px; border-radius: 999px; background: ${palette.primary}; color: #ffffff; font-size: 12px; font-weight: 900; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .lp-feature-text { font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.5; word-break: break-word; }
        .lp-info-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: 22px; margin-bottom: 26px; }
        .lp-info-grid.is-single { grid-template-columns: minmax(0, 1fr); }
        .lp-spec-table { width: 100%; border-collapse: collapse; }
        .lp-spec-row { display: grid; grid-template-columns: 42% 58%; gap: 10px; padding: 11px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .lp-spec-row:last-child { border-bottom: none; }
        .lp-spec-label { font-weight: 700; color: #64748b; word-break: break-word; }
        .lp-spec-val { font-weight: 800; color: #0f172a; word-break: break-word; }
        .lp-gallery-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .lp-gallery-card { border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc; }
        .lp-gallery-card img { width: 100%; height: 240px; object-fit: cover; display: block; }
        .lp-video-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
        .lp-video-grid.is-single { grid-template-columns: minmax(0, 720px); justify-content: center; }

        /* Checkout Form Section — 100% Responsive & Zero Overflow */
        .lp-checkout-shell { background: #ffffff; border-radius: 26px; border: 2px solid ${palette.border}; box-shadow: 0 22px 48px -12px rgba(15, 23, 42, 0.09); overflow: hidden; margin-top: 12px; }
        .lp-checkout-banner { background: linear-gradient(135deg, ${palette.primary}, ${palette.primaryDark}); padding: 24px 20px; text-align: center; color: #ffffff; }
        .lp-checkout-banner h2 { font-size: 22px; font-weight: 900; margin: 0 0 6px; line-height: 1.35; }
        .lp-checkout-banner p { font-size: 13px; margin: 0; opacity: 0.92; font-weight: 600; }
        .lp-checkout-body { padding: 26px; }
        .lp-checkout-grid { display: grid; grid-template-columns: minmax(0, 1.04fr) minmax(0, 0.96fr); gap: 26px; align-items: start; }
        .lp-checkout-col { min-width: 0; width: 100%; }
        .lp-step-heading { font-size: 15px; font-weight: 900; color: #0f172a; margin: 0 0 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .lp-step-count-badge { font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px; background: ${palette.light}; color: ${palette.primary}; }

        /* Product Selector List inside Checkout */
        .lp-pkg-list-scroll { display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto; padding: 2px 4px 4px 2px; margin-bottom: 16px; }
        .lp-pkg-list-scroll::-webkit-scrollbar { width: 5px; }
        .lp-pkg-list-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
        .lp-pkg-card { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 16px; border: 2px solid #e2e8f0; background: #ffffff; cursor: pointer; transition: all 0.2s ease; width: 100%; min-width: 0; overflow: hidden; }
        .lp-pkg-card:hover { border-color: #94a3b8; background: #f8fafc; }
        .lp-pkg-card.is-selected { border-color: ${palette.primary}; background: ${palette.light}; box-shadow: 0 6px 18px -6px ${palette.glow}; }
        .lp-pkg-radio { width: 20px; height: 20px; border-radius: 999px; border: 2px solid #94a3b8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #ffffff; }
        .lp-pkg-card.is-selected .lp-pkg-radio { border-color: ${palette.primary}; }
        .lp-pkg-radio-dot { width: 10px; height: 10px; border-radius: 999px; background: ${palette.primary}; transition: transform 0.2s ease; }
        .lp-pkg-thumb { width: 60px; height: 60px; border-radius: 12px; object-fit: contain; background: #ffffff; border: 1px solid #e2e8f0; padding: 3px; flex-shrink: 0; }
        .lp-pkg-info { flex: 1 1 0%; min-width: 0; overflow: hidden; }
        .lp-pkg-title { font-size: 13.5px; font-weight: 800; color: #0f172a; line-height: 1.35; margin: 0 0 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: normal !important; word-break: break-word; overflow-wrap: anywhere; }
        .lp-pkg-price-wrap { display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
        .lp-pkg-price-left { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
        .lp-pkg-offer { font-size: 15px; font-weight: 900; color: ${palette.primary}; }
        .lp-pkg-reg { font-size: 11.5px; color: #94a3b8; text-decoration: line-through; font-weight: 700; }
        .lp-pkg-disc-badge { font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 999px; background: #ffe4e6; color: #e11d48; }
        .lp-pkg-active-pill { font-size: 10.5px; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: ${palette.primary}; color: #ffffff; align-items: center; gap: 3px; }

        /* Variant, Quantity & Summary Controls */
        .lp-variant-box { padding: 14px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 12px; }
        .lp-variant-label { display: block; font-size: 12.5px; font-weight: 800; color: #334155; margin-bottom: 8px; }
        .lp-pill-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .lp-color-btn, .lp-size-btn { padding: 7px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 800; border: 1.5px solid #cbd5e1; background: #ffffff; color: #334155; cursor: pointer; transition: all 0.15s ease; }
        .lp-color-btn.is-active, .lp-size-btn.is-active { border-color: #0f172a; background: #0f172a; color: #ffffff; }
        .lp-qty-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 14px; }
        .lp-qty-controls { display: flex; align-items: center; gap: 10px; }
        .lp-qty-btn { width: 34px; height: 34px; border-radius: 10px; background: #ffffff; border: 1px solid #cbd5e1; font-weight: 900; font-size: 16px; color: #0f172a; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .lp-qty-btn:hover { background: #f1f5f9; }
        .lp-qty-num { min-width: 28px; text-align: center; font-size: 16px; font-weight: 900; color: #0f172a; }
        .lp-summary-box { padding: 18px; border-radius: 18px; background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%); color: #ffffff; box-shadow: 0 12px 26px -8px rgba(15, 23, 42, 0.25); }
        .lp-summary-head { font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
        .lp-summary-prod-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .lp-summary-thumb { width: 44px; height: 44px; border-radius: 10px; object-fit: contain; background: #ffffff; padding: 2px; flex-shrink: 0; }
        .lp-summary-prod-title { font-size: 13px; font-weight: 700; color: #f1f5f9; line-height: 1.35; flex: 1; min-width: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
        .lp-summary-qty-badge { font-size: 12px; font-weight: 900; color: #34d399; background: rgba(52, 211, 153, 0.14); padding: 4px 9px; border-radius: 8px; white-space: nowrap; flex-shrink: 0; }
        .lp-summary-line { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #cbd5e1; padding: 4px 0; }
        .lp-summary-total-line { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; margin-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.12); font-size: 16px; font-weight: 900; }

        /* Right Column Shipping Card & Trust Grid */
        .lp-shipping-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; }
        .lp-field-group { margin-bottom: 14px; }
        .lp-field-label { display: block; font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 6px; }
        .lp-input { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid #cbd5e1; background: #ffffff; font-size: 14px; font-weight: 600; color: #0f172a; transition: all 0.2s ease; }
        .lp-input:focus { outline: none; border-color: ${palette.primary}; box-shadow: 0 0 0 3px ${palette.glow}; }
        .lp-cod-box { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 14px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 12.5px; font-weight: 800; margin-bottom: 16px; }
        .lp-submit-btn { width: 100%; padding: 15px 20px; border-radius: 14px; border: none; background: linear-gradient(135deg, ${palette.primary}, ${palette.primaryDark}); color: #ffffff; font-size: 16px; font-weight: 900; cursor: pointer; box-shadow: 0 10px 25px -5px ${palette.glow}; transition: transform 0.2s ease; }
        .lp-submit-btn:hover { transform: translateY(-1px); }
        .lp-trust-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 24px 0; }
        .lp-trust-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03); }
        .lp-trust-icon { width: 44px; height: 44px; border-radius: 12px; background: ${palette.light}; color: ${palette.primary}; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .lp-hero-grid, .lp-info-grid, .lp-checkout-grid, .lp-trust-grid { grid-template-columns: minmax(0, 1fr); }
          .lp-hero-media { border-left: none; border-top: 1px solid #f1f5f9; padding: 20px; }
          .lp-checkout-grid { gap: 20px; }
          .lp-products-grid, .lp-gallery-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .lp-wrap { padding: 0 12px; }
          .lp-top-bar-inner { justify-content: center; text-align: center; }
          .lp-nav-phone { display: none; }
          .lp-surface-card { padding: 18px 14px; border-radius: 20px; }
          .lp-hero-content { padding: 22px 16px; }
          .lp-hero-title { font-size: 22px; }
          .lp-hero-img-box { height: 250px; }
          .lp-products-grid, .lp-products-grid.is-double { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .lp-showcase-card { padding: 10px; border-radius: 16px; }
          .lp-showcase-img-wrap { height: 145px; padding: 6px; margin-bottom: 8px; }
          .lp-showcase-title { font-size: 13px; min-height: 36px; }
          .lp-showcase-offer { font-size: 15px; }
          .lp-showcase-reg { font-size: 11px; }
          .lp-showcase-select-btn { padding: 8px 10px; font-size: 11.5px; border-radius: 10px; }
          .lp-features-grid, .lp-gallery-grid, .lp-video-grid { grid-template-columns: minmax(0, 1fr); }
          .lp-checkout-body, .lp-shipping-card { padding: 16px 12px; }
          .lp-pkg-thumb { width: 52px; height: 52px; }
          .lp-pkg-title { font-size: 12.5px; }
        }
      </style>

      <!-- Top Urgency / Campaign Bar -->
      ${(badgeText || countdownHours > 0) ? `
        <div class="lp-top-bar">
          <div class="lp-wrap lp-top-bar-inner">
            ${badgeText ? `
              <div class="lp-top-badge">
                <span>🔥</span>
                <span>${badgeText}</span>
              </div>
            ` : '<div></div>'}
            ${countdownHours > 0 ? `
              <div class="lp-countdown-wrap">
                <span>⏰ অফার শেষ হতে বাকি:</span>
                <div class="lp-timer-group">
                  <div class="lp-timer-box"><span id="lp-cd-h">${String(countdownHours).padStart(2, '0')}</span>ঘঃ</div>
                  <div class="lp-timer-box"><span id="lp-cd-m">45</span>মিঃ</div>
                  <div class="lp-timer-box"><span id="lp-cd-s">19</span>সেঃ</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Sticky Header with "মূল ওয়েবসাইটে যান" Button -->
      <header class="lp-navbar">
        <div class="lp-wrap lp-navbar-inner">
          <a href="/products" class="lp-brand-link" title="মূল ওয়েবসাইটে ফিরে যান">
            ${shopLogo ? `
              <img src="${shopLogo}" alt="${shopName}" class="lp-brand-logo" onerror="this.style.display='none'">
            ` : `
              <div class="lp-brand-icon">🛍️</div>
            `}
            <div style="min-width:0;">
              <div class="lp-brand-name">${shopName}</div>
              <div class="lp-brand-sub">অফিসিয়াল ক্যাম্পেইন স্টোর</div>
            </div>
          </a>

          <div class="lp-nav-actions">
            <a href="tel:${cleanPhone}" class="lp-nav-phone">
              📞 ${contactPhone}
            </a>
            <a href="/products" class="lp-nav-store-btn">
              🛍️ মূল ওয়েবসাইটে যান
            </a>
            <a href="#lp-checkout-section" class="lp-nav-order-btn">
              🛒 অর্ডার করুন
            </a>
          </div>
        </div>
      </header>

      <main class="lp-wrap">
        <!-- Hero Section -->
        ${(heroHeadline || heroSubheadline || heroBanner || displayOfferPrice > 0) ? `
          <section class="lp-hero-card">
            <div class="lp-hero-grid ${heroBanner ? '' : 'is-single'}">
              <div class="lp-hero-content">
                ${badgeText ? `
                  <div class="lp-hero-pill">
                    ✨ ${badgeText}
                  </div>
                ` : ''}

                ${heroHeadline ? `
                  <h1 class="lp-hero-title">${heroHeadline}</h1>
                ` : ''}

                ${heroSubheadline ? `
                  <p class="lp-hero-subtitle">${heroSubheadline}</p>
                ` : ''}

                ${displayOfferPrice > 0 ? `
                  <div class="lp-hero-price-box">
                    ${displayRegularPrice > displayOfferPrice ? `
                      <div class="lp-hero-reg-price">
                        রেগুলার মূল্য: <del>${formatCurrency(displayRegularPrice)}</del>
                      </div>
                    ` : ''}
                    <div class="lp-hero-offer-price">
                      অফার মূল্য: ${formatCurrency(displayOfferPrice)}
                    </div>
                    ${discountPct > 0 ? `
                      <span class="lp-hero-save-badge">${discountPct}% ছাড়</span>
                    ` : ''}
                  </div>
                ` : ''}

                ${giftNote ? `
                  <div class="lp-gift-banner">
                    <span>🎁</span>
                    <span>${giftNote}</span>
                  </div>
                ` : ''}

                <div class="lp-hero-actions" style="${heroBanner ? '' : 'justify-content:center;'}">
                  <a href="#lp-checkout-section" class="lp-btn-primary">
                    🛒 ${ctaText}
                  </a>
                  <a href="/products" class="lp-btn-secondary">
                    🛍️ মূল ওয়েবসাইটে যান
                  </a>
                </div>
              </div>

              ${heroBanner ? `
                <div class="lp-hero-media">
                  <div class="lp-hero-img-box">
                    <img src="${heroBanner}" alt="${heroHeadline || pageTitle}">
                  </div>
                </div>
              ` : ''}
            </div>
          </section>
        ` : ''}

        <!-- Campaign Products Showcase Section -->
        ${resolvedProducts.length > 0 ? `
          <section class="lp-surface-card">
            <div class="lp-section-header">
              <h2 class="lp-section-title">
                <span>🛍️</span>
                <span>ক্যাম্পেইনের পণ্যসমূহ (${resolvedProducts.length}টি)</span>
              </h2>
              <span class="lp-section-sub">পছন্দের পণ্যটিতে ক্লিক করে সরাসরি অর্ডার করুন</span>
            </div>

            <div class="${prodGridClass}">
              ${resolvedProducts.map((p, idx) => {
                const pPrice = Number(p.offer_price || p.selling_price || p.price || 0);
                const pReg = Number(p.regular_price || p.original_price || 0);
                const pDisc = (pReg > pPrice && pPrice > 0) ? Math.round(((pReg - pPrice) / pReg) * 100) : 0;
                const pImg = p.image_url || p.image || heroBanner || '';
                const pTitle = p.name || p.p_name || 'পণ্য';
                return `
                  <div onclick="window.selectLpProduct(${idx}, true)"
                    class="lp-showcase-card ${idx === 0 ? 'is-selected' : ''}">
                    <div class="lp-showcase-img-wrap">
                      ${pImg ? `
                        <img src="${pImg}" alt="${pTitle}" loading="lazy">
                      ` : `
                        <div style="font-size:36px;">🛍️</div>
                      `}
                      ${pDisc > 0 ? `
                        <span class="lp-showcase-discount-pill">-${pDisc}% ছাড়</span>
                      ` : ''}
                      <span class="lp-showcase-selected-pill" style="display:${idx === 0 ? 'inline-flex' : 'none'};">✓ নির্বাচিত</span>
                      <span class="lp-showcase-stock-tag">● স্টকে আছে</span>
                    </div>

                    <div class="lp-showcase-body">
                      <h3 class="lp-showcase-title">${pTitle}</h3>
                      <div class="lp-showcase-price-row">
                        <span class="lp-showcase-offer">${formatCurrency(pPrice)}</span>
                        ${pReg > pPrice ? `
                          <span class="lp-showcase-reg">${formatCurrency(pReg)}</span>
                        ` : ''}
                      </div>
                      <button type="button" class="lp-showcase-select-btn">
                        ${idx === 0 ? '✓ নির্বাচিত পণ্য — অর্ডার ফর্মে যান' : '🛒 এটি সিলেক্ট করে অর্ডার করুন'}
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Features / Highlights Section -->
        ${featuresList.length > 0 ? `
          <section class="lp-surface-card">
            <div class="lp-section-header">
              <h2 class="lp-section-title">
                <span>🌟</span>
                <span>কেন এই পণ্যটি আপনার জন্য সেরা?</span>
              </h2>
            </div>
            <div class="lp-features-grid">
              ${featuresList.map(ft => `
                <div class="lp-feature-item">
                  <span class="lp-feature-icon">✓</span>
                  <span class="lp-feature-text">${ft}</span>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Description & Specifications Grid -->
        ${(finalDescription || specRows.length > 0) ? `
          <div class="lp-info-grid ${(finalDescription && specRows.length > 0) ? '' : 'is-single'}">
            ${finalDescription ? `
              <div class="lp-surface-card" style="margin-bottom:0;">
                <div class="lp-section-header">
                  <h2 class="lp-section-title">📝 বিস্তারিত বিবরণ</h2>
                </div>
                <div style="font-size:14px;color:#334155;line-height:1.75;white-space:pre-line;word-break:break-word;">${finalDescription}</div>
              </div>
            ` : ''}

            ${specRows.length > 0 ? `
              <div class="lp-surface-card" style="margin-bottom:0;">
                <div class="lp-section-header">
                  <h2 class="lp-section-title">📋 পণ্যের স্পেসিফিকেশন</h2>
                </div>
                <div class="lp-spec-table">
                  ${specRows.map(r => `
                    <div class="lp-spec-row">
                      <span class="lp-spec-label">${r.label || r.key || 'বৈশিষ্ট্য'}</span>
                      <span class="lp-spec-val">${r.value || ''}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Additional Promotional Banners -->
        ${banners.length > 0 ? `
          <section class="lp-surface-card">
            <div class="lp-section-header">
              <h2 class="lp-section-title">📸 পণ্যের গ্যালারি ও অফার ব্যানার</h2>
            </div>
            <div class="lp-gallery-grid">
              ${banners.map(b => `
                <div class="lp-gallery-card">
                  <img src="${b.image_url}" alt="${b.caption || pageTitle}" loading="lazy">
                  ${b.caption ? `<div style="padding:12px;text-align:center;font-weight:800;font-size:13px;color:#1e293b;">${b.caption}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Campaign Videos -->
        ${videos.length > 0 ? `
          <section class="lp-surface-card">
            <div class="lp-section-header">
              <h2 class="lp-section-title">🎬 পণ্যের ভিডিও রিভিউ</h2>
            </div>
            <div class="lp-video-grid ${videos.length === 1 ? 'is-single' : ''}">
              ${videos.map(v => {
                const rawUrl = String(v.video_url || '').trim();
                let embedHtml = '';
                if (rawUrl.includes('youtube.com/watch?v=')) {
                  const vid = rawUrl.split('v=')[1]?.split('&')[0];
                  embedHtml = `<iframe style="width:100%;aspect-ratio:16/9;border:none;border-radius:14px;" src="https://www.youtube.com/embed/${vid}" allowfullscreen></iframe>`;
                } else if (rawUrl.includes('youtu.be/')) {
                  const vid = rawUrl.split('youtu.be/')[1]?.split('?')[0];
                  embedHtml = `<iframe style="width:100%;aspect-ratio:16/9;border:none;border-radius:14px;" src="https://www.youtube.com/embed/${vid}" allowfullscreen></iframe>`;
                } else {
                  embedHtml = `<video controls style="width:100%;aspect-ratio:16/9;border-radius:14px;background:#000;" src="${rawUrl}"></video>`;
                }
                return `
                  <div style="background:#0f172a;padding:10px;border-radius:18px;">
                    ${embedHtml}
                    ${v.title ? `<div style="font-size:13px;font-weight:700;color:#ffffff;text-align:center;padding-top:8px;">${v.title}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Trust Badges -->
        <div class="lp-trust-grid">
          <div class="lp-trust-card">
            <div class="lp-trust-icon">🚚</div>
            <div>
              <div style="font-size:14px;font-weight:900;color:#0f172a;">সারাদেশে দ্রুত ডেলিভারি</div>
              <div style="font-size:12px;color:#64748b;font-weight:600;">পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা</div>
            </div>
          </div>
          <div class="lp-trust-card">
            <div class="lp-trust-icon">🛡️</div>
            <div>
              <div style="font-size:14px;font-weight:900;color:#0f172a;">১০০% অরিজিনাল পণ্য</div>
              <div style="font-size:12px;color:#64748b;font-weight:600;">কোয়ালিটি চেক করে ডেলিভারি করা হয়</div>
            </div>
          </div>
          <div class="lp-trust-card">
            <div class="lp-trust-icon">🔄</div>
            <div>
              <div style="font-size:14px;font-weight:900;color:#0f172a;">সহজ রিটার্ন সুবিধা</div>
              <div style="font-size:12px;color:#64748b;font-weight:600;">ডেলিভারি ম্যানের সামনেই চেক করে নিন</div>
            </div>
          </div>
        </div>

        <!-- =========================================================
             CHECKOUT SECTION (100% RESPONSIVE & ZERO OVERFLOW)
             ========================================================= -->
        <section id="lp-checkout-section" class="lp-checkout-shell">
          <div class="lp-checkout-banner">
            <h2>অর্ডার কনফার্ম করতে নিচের ফর্মটি পূরণ করুন</h2>
            <p>কোনো অগ্রিম পেমেন্ট ছাড়াই অর্ডার করুন — পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</p>
          </div>

          <form onsubmit="window.submitLpDirectOrder(event)" class="lp-checkout-body">
            <div class="lp-checkout-grid">

              <!-- Left Column: Product Selection, Variants, Quantity & Live Order Summary -->
              <div class="lp-checkout-col">
                ${resolvedProducts.length > 0 ? `
                  <div>
                    <div class="lp-step-heading">
                      <span>১. আপনার পছন্দের পণ্যটি সিলেক্ট করুন:</span>
                      <span class="lp-step-count-badge">${resolvedProducts.length}টি পণ্য</span>
                    </div>
                    <div class="lp-pkg-list-scroll">
                      ${resolvedProducts.map((p, idx) => {
                        const pPrice = Number(p.offer_price || p.selling_price || p.price || 0);
                        const pReg = Number(p.regular_price || p.original_price || 0);
                        const pDisc = (pReg > pPrice && pPrice > 0) ? Math.round(((pReg - pPrice) / pReg) * 100) : 0;
                        const pImg = p.image_url || p.image || heroBanner || '';
                        const pTitle = p.name || p.p_name || 'পণ্য';
                        return `
                          <div onclick="window.selectLpProduct(${idx}, false)"
                            class="lp-pkg-card ${idx === 0 ? 'is-selected' : ''}">
                            <div class="lp-pkg-radio">
                              <div class="lp-pkg-radio-dot" style="transform:scale(${idx === 0 ? '1' : '0'});"></div>
                            </div>
                            ${pImg ? `<img src="${pImg}" class="lp-pkg-thumb" alt="${pTitle}">` : ''}
                            <div class="lp-pkg-info">
                              <div class="lp-pkg-title">${pTitle}</div>
                              <div class="lp-pkg-price-wrap">
                                <div class="lp-pkg-price-left">
                                  <span class="lp-pkg-offer">${formatCurrency(pPrice)}</span>
                                  ${pReg > pPrice ? `<span class="lp-pkg-reg">${formatCurrency(pReg)}</span>` : ''}
                                  ${pDisc > 0 ? `<span class="lp-pkg-disc-badge">${pDisc}% ছাড়</span>` : ''}
                                </div>
                                <span class="lp-pkg-active-pill" style="display:${idx === 0 ? 'inline-flex' : 'none'};">✓ নির্বাচিত</span>
                              </div>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                ` : ''}

                <!-- Color Selector -->
                <div id="lp-color-selector-wrap" class="lp-variant-box" style="display:${defaultColors.length > 0 ? 'block' : 'none'};">
                  <label class="lp-variant-label">🎨 কালার সিলেক্ট করুন:</label>
                  <div id="lp-color-pills" class="lp-pill-list">
                    ${defaultColors.map((c, ci) => `
                      <button type="button" onclick="window.selectLpColor('${String(c).replace(/'/g, "\\'")}', this)"
                        class="lp-color-btn ${ci === 0 ? 'is-active' : ''}">
                        ${c}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Size Selector -->
                <div id="lp-size-selector-wrap" class="lp-variant-box" style="display:${defaultSizes.length > 0 ? 'block' : 'none'};">
                  <label class="lp-variant-label">📏 সাইজ সিলেক্ট করুন:</label>
                  <div id="lp-size-pills" class="lp-pill-list">
                    ${defaultSizes.map((s, si) => `
                      <button type="button" onclick="window.selectLpSize('${String(s).replace(/'/g, "\\'")}', this)"
                        class="lp-size-btn ${si === 0 ? 'is-active' : ''}">
                        ${s}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Quantity Stepper -->
                <div class="lp-qty-bar">
                  <span style="font-size:13.5px;font-weight:800;color:#1e293b;">📦 পণ্যের পরিমাণ (Quantity):</span>
                  <div class="lp-qty-controls">
                    <button type="button" onclick="window.changeLpQty(-1)" class="lp-qty-btn">−</button>
                    <span id="lp-qty-display" class="lp-qty-num">1</span>
                    <button type="button" onclick="window.changeLpQty(1)" class="lp-qty-btn">+</button>
                  </div>
                </div>

                <!-- Live Order Summary Box -->
                <div class="lp-summary-box">
                  <div class="lp-summary-head">
                    <span>অর্ডার সামারি (Order Summary)</span>
                    <span style="color:#34d399;">● লাইভ হিসাব</span>
                  </div>
                  <div class="lp-summary-prod-row">
                    <img id="lp-summary-thumb" src="${window.__lpPackageImage || ''}" alt="" class="lp-summary-thumb" style="display:${window.__lpPackageImage ? 'block' : 'none'};">
                    <span id="lp-summary-title" class="lp-summary-prod-title">${window.__lpPackageTitle}</span>
                    <span id="lp-summary-qty" class="lp-summary-qty-badge">× 1 টি</span>
                  </div>
                  <div id="lp-summary-meta" style="font-size:12px;color:#34d399;font-weight:700;margin-bottom:8px;display:none;"></div>
                  <div class="lp-summary-line">
                    <span>পণ্যের মূল্য:</span>
                    <span id="lp-summary-subtotal" style="font-weight:800;color:#ffffff;">${formatCurrency(window.__lpPackagePrice)}</span>
                  </div>
                  <div class="lp-summary-line">
                    <span>ডেলিভারি চার্জ:</span>
                    <span id="lp-summary-shipping" style="font-weight:800;">${freeShipping ? 'ফ্রি ডেলিভারি' : formatCurrency(60)}</span>
                  </div>
                  <div class="lp-summary-total-line">
                    <span>সর্বমোট প্রদেয় বিল:</span>
                    <span id="lp-summary-total" style="font-size:20px;color:#34d399;">${formatCurrency(window.__lpPackagePrice + (freeShipping ? 0 : 60))}</span>
                  </div>
                </div>
              </div>

              <!-- Right Column: Customer Delivery Details -->
              <div class="lp-checkout-col">
                <div class="lp-shipping-card">
                  <div class="lp-step-heading" style="margin-bottom:16px;">
                    <span>২. ডেলিভারির তথ্য দিন:</span>
                  </div>

                  <div class="lp-field-group">
                    <label class="lp-field-label">আপনার সম্পূর্ণ নাম <span style="color:#e11d48;">*</span></label>
                    <input type="text" name="customer_name" required placeholder="আপনার নাম লিখুন" class="lp-input">
                  </div>

                  <div class="lp-field-group">
                    <label class="lp-field-label">মোবাইল নাম্বার (১১ ডিজিট) <span style="color:#e11d48;">*</span></label>
                    <input type="tel" name="customer_phone" required placeholder="017XXXXXXXX" class="lp-input">
                  </div>

                  <div class="lp-field-group">
                    <label class="lp-field-label">ডেলিভারি এরিয়া সিলেক্ট করুন <span style="color:#e11d48;">*</span></label>
                    <select id="lp-delivery-area" name="delivery_area" onchange="window.updateLpOrderCalculation()" class="lp-input">
                      <option value="dhaka">ঢাকার ভেতরে (Inside Dhaka) — ${freeShipping ? 'ফ্রি' : '৳60'}</option>
                      <option value="sub_dhaka">ঢাকা সাব-এরিয়া ( গাজীপুর, নারায়ণগঞ্জ, সাভার ) — ${freeShipping ? 'ফ্রি' : '৳100'}</option>
                      <option value="outside_dhaka">ঢাকার বাইরে (Outside Dhaka) — ${freeShipping ? 'ফ্রি' : '৳120'}</option>
                    </select>
                  </div>

                  <div class="lp-field-group">
                    <label class="lp-field-label">সম্পূর্ণ ঠিকানা (বাসা নং, রোড, থানা, জেলা) <span style="color:#e11d48;">*</span></label>
                    <textarea name="customer_address" rows="3" required placeholder="আপনার সম্পূর্ণ ঠিকানা বিস্তারিত লিখুন..." class="lp-input" style="resize:vertical;"></textarea>
                  </div>

                  <div class="lp-field-group">
                    <label class="lp-field-label">অর্ডার নোট (ঐচ্ছিক)</label>
                    <input type="text" name="order_note" placeholder="স্পেশাল কোনো নির্দেশনা থাকলে লিখুন..." class="lp-input">
                  </div>

                  <div class="lp-cod-box">
                    <span style="font-size:20px;">🤝</span>
                    <span>ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করবেন।</span>
                  </div>

                  <button id="lp-submit-btn" type="submit" class="lp-submit-btn">
                    ✅ ${ctaText} (<span id="lp-submit-btn-price">${formatCurrency(window.__lpPackagePrice + (freeShipping ? 0 : 60))}</span>)
                  </button>
                </div>
              </div>

            </div>
          </form>
        </section>

        <!-- Bottom Support & Main Website Navigation Footer -->
        <div style="margin-top:32px;text-align:center;">
          <div style="display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px;padding:18px 24px;border-radius:20px;background:#ffffff;border:1px solid #e2e8f0;box-shadow:0 8px 20px -6px rgba(15,23,42,0.05);">
            <div style="text-align:left;">
              <div style="font-size:12px;color:#64748b;font-weight:700;">যেকোনো প্রয়োজনে সরাসরি কল করুন:</div>
              <div style="font-size:18px;font-weight:900;color:#0f172a;">${contactPhone}</div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              <a href="tel:${cleanPhone}" style="padding:10px 18px;border-radius:12px;background:#0f172a;color:#ffffff;font-weight:800;font-size:13px;text-decoration:none;">
                📞 কল করুন
              </a>
              <a href="/products" style="padding:10px 18px;border-radius:12px;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-weight:800;font-size:13px;text-decoration:none;">
                🛍️ মূল ওয়েবসাইটে যান
              </a>
            </div>
          </div>
        </div>
      </main>
    `;

    // Initialize live calculation & countdown timer
    setTimeout(() => {
      if (typeof window.updateLpOrderCalculation === 'function') {
        window.updateLpOrderCalculation();
      }

      if (countdownHours > 0) {
        let remainingSeconds = Math.floor(countdownHours * 3600) + (45 * 60) + 19;
        const timerInterval = setInterval(() => {
          const hEl = document.getElementById('lp-cd-h');
          const mEl = document.getElementById('lp-cd-m');
          const sEl = document.getElementById('lp-cd-s');
          if (!hEl || !mEl || !sEl) {
            clearInterval(timerInterval);
            return;
          }
          if (remainingSeconds <= 0) {
            remainingSeconds = 3600;
          } else {
            remainingSeconds--;
          }
          const hrs = Math.floor(remainingSeconds / 3600);
          const mins = Math.floor((remainingSeconds % 3600) / 60);
          const secs = remainingSeconds % 60;
          hEl.textContent = String(hrs).padStart(2, '0');
          mEl.textContent = String(mins).padStart(2, '0');
          sEl.textContent = String(secs).padStart(2, '0');
        }, 1000);
      }
    }, 80);

  } catch (error) {
    console.error('LandingPage render error:', error);
    container.innerHTML = `
      <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;">
        <p style="color:#e11d48;font-weight:800;margin-bottom:14px;">ল্যান্ডিং পেজ লোড করতে সমস্যা হয়েছে।</p>
        <a href="/products" style="padding:12px 22px;border-radius:12px;background:#059669;color:#ffffff;font-weight:800;font-size:14px;text-decoration:none;">
          🛍️ মূল ওয়েবসাইটে যান
        </a>
      </div>
    `;
  }

  return container;
}
