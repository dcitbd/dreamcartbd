import { escapeHtml } from '../../utils/security.js';
/**
 * DREAM CART BD — PRODUCT DETAIL PAGE (ProductDetailPage.js)
 * Implements user requirements:
 * - Full product details from Products sheet (omitting confidential buying price)
 * - Multiple interactive Favourite / Wishlist touchpoints (Floating Image Heart, Meta Pill, Action Bar Button)
 * - Real-time synced Wishlist toggle with instant toast notification & store persistence
 * - Interactive Color & Size selection chips with live preview
 * - Selling Price showing according to account type (Customer, Reseller, Wholesaler)
 * - Wholesaler minimum order quantity validation (cannot order under MOQ)
 * - Out of Stock state: shows Pre Order button and hides Order Now button
 * - Direct Send WhatsApp 1 & 2 buttons
 * - Image gallery with prev/next arrow buttons, counter & scrollable thumbnails, specifications, warranty, reviews, and related products
 * - Scoped CSS with elegant padding, clean typography, soft contrast, and seamless dark mode support.
 */

import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { authStore } from '../../store/authStore.js';
import { cartStore } from '../../store/cartStore.js';
import { favouriteStore } from '../../store/favouriteStore.js';
import { renderProductCard } from '../../components/ProductCard.js';

// Color name to Hex mapper
function getColorHex(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('black') || n.includes('কালো') || n.includes('ব্ল্যাক')) return '#18181b';
  if (n.includes('silver') || n.includes('সিলভার') || n.includes('গ্রে') || n.includes('gray') || n.includes('grey')) return '#94a3b8';
  if (n.includes('blue') || n.includes('ব্লু') || n.includes('নীল') || n.includes('navy')) return '#2563eb';
  if (n.includes('red') || n.includes('লাল') || n.includes('রেড')) return '#dc2626';
  if (n.includes('green') || n.includes('সবুজ') || n.includes('গ্রিন') || n.includes('emerald')) return '#10b981';
  if (n.includes('white') || n.includes('সাদা') || n.includes('হোয়াইট')) return '#ffffff';
  if (n.includes('gold') || n.includes('গোল্ড') || n.includes('golden') || n.includes('হলুদ') || n.includes('yellow')) return '#f59e0b';
  if (n.includes('pink') || n.includes('গোলাপি') || n.includes('রোজ') || n.includes('rose')) return '#f43f5e';
  if (n.includes('purple') || n.includes('বেগুনী')) return '#9333ea';
  if (n.includes('orange') || n.includes('কমলা')) return '#ea580c';
  if (n.includes('brown') || n.includes('বাদামী')) return '#78350f';
  return '#10b981';
}

// Global helpers for Gallery Navigation & Thumbnail Scroll
if (typeof window !== 'undefined' && !window.__pdGalleryHelpersAttached) {
  window.__pdGalleryHelpersAttached = true;

  window.__pdSelectImageByIndex = function(index) {
    var gallery = document.getElementById('pd-gallery-root');
    var mainImg = document.getElementById('detail-main-img');
    var counter = document.getElementById('pd-img-counter');
    var thumbs = document.querySelectorAll('#pd-thumb-row .thumb-btn');
    if (!mainImg || !thumbs.length) return;

    var total = thumbs.length;
    var targetIdx = ((index % total) + total) % total;
    var targetBtn = thumbs[targetIdx];
    if (!targetBtn) return;

    var imgUrl = targetBtn.getAttribute('data-img');
    if (imgUrl) {
      mainImg.src = imgUrl;
    }

    thumbs.forEach(function(b) {
      b.classList.remove('border-emerald-500');
    });
    targetBtn.classList.add('border-emerald-500');

    if (gallery) {
      gallery.setAttribute('data-active-index', String(targetIdx));
    }

    if (counter) {
      counter.textContent = (targetIdx + 1) + ' / ' + total;
    }

    if (targetBtn.scrollIntoView) {
      targetBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  window.__pdStepImage = function(step) {
    var gallery = document.getElementById('pd-gallery-root');
    var currentIdx = gallery ? Number(gallery.getAttribute('data-active-index') || 0) : 0;
    window.__pdSelectImageByIndex(currentIdx + step);
  };

  window.__pdScrollThumbs = function(direction) {
    var row = document.getElementById('pd-thumb-row');
    if (!row) return;
    var amount = Math.max(160, Math.round(row.clientWidth * 0.75));
    row.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };
}

// Global helper for instant, reliable Favourite toggle on Product Details Page
if (typeof window !== 'undefined' && !window.__toggleProductDetailFavouriteAttached) {
  window.__toggleProductDetailFavouriteAttached = true;
  window.toggleProductDetailFavourite = function(e, btn) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!btn) return;

    var pId = btn.getAttribute('data-product-id');
    if (!pId) return;

    var productObj = null;
    var jsonAttr = btn.getAttribute('data-product-json');
    if (jsonAttr) {
      try {
        productObj = JSON.parse(decodeURIComponent(jsonAttr));
      } catch (err) {}
    }

    if (!productObj) {
      productObj = {
        product_id: pId,
        sku: pId,
        name: btn.getAttribute('data-product-name') || 'পণ্য',
        selling_price: Number(btn.getAttribute('data-product-price') || 0),
        thumbnail: btn.getAttribute('data-product-thumb') || '',
        stock: 25
      };
    }

    // Toggle in favouriteStore
    var isAdded = favouriteStore.toggle(productObj);

    // Sync all favourite buttons on this product detail page
    var allDetailBtns = document.querySelectorAll('.btn-toggle-favourite[data-product-id="' + pId + '"]');
    allDetailBtns.forEach(function(el) {
      if (isAdded) {
        el.classList.add('is-favourite');
        el.setAttribute('title', 'পছন্দের তালিকা থেকে সরান');
      } else {
        el.classList.remove('is-favourite');
        el.setAttribute('title', 'পছন্দের তালিকায় রাখুন');
      }
    });

    // Update main action button label
    var mainBtnLabel = document.getElementById('detail-fav-btn-label');
    if (mainBtnLabel) {
      mainBtnLabel.textContent = isAdded ? 'পছন্দের তালিকায় আছে' : 'পছন্দের তালিকায় রাখুন';
    }

    // Update header pill label
    var badgeLabel = document.getElementById('detail-fav-badge-label');
    if (badgeLabel) {
      badgeLabel.textContent = isAdded ? 'ফেভারিটে আছে' : 'ফেভারিট';
    }

    // Toast notification
    if (window.toast && window.toast.show) {
      window.toast.show({
        type: isAdded ? 'success' : 'info',
        title: isAdded ? 'পছন্দের তালিকায় যুক্ত হয়েছে' : 'পছন্দের তালিকা থেকে সরানো হয়েছে',
        message: productObj.name || 'পণ্য',
        duration: 2500
      });
    }
  };
}

// Global helpers for Product Review Form (Login-Tracked Auto-Fill & Submission)
if (typeof window !== 'undefined' && !window.__pdReviewHelpersAttached) {
  window.__pdReviewHelpersAttached = true;

  window.__pdGetTrackedReviewerProfile = function() {
    if (!authStore || !authStore.isAuthenticated()) return null;
    const u = authStore.user || {};
    const uid = String(u.customer_id || u.id || u.user_id || u.mobile || u.phone || u.email || u.mail || u.user_name || authStore.getUserDisplayName() || 'member').trim().toLowerCase();
    const accountType = authStore.getAccountType ? authStore.getAccountType() : 'CUSTOMER';
    const baseName = authStore.getUserDisplayName ? authStore.getUserDisplayName() : (u.name || u.shop_name || 'সদস্য');
    const basePhoto = u.profile_photo || u.photo || u.avatar || u.shop_logo || u.image || '';
    const baseLocation = u.address || u.city || '';

    let remembered = {};
    try {
      const map = JSON.parse(localStorage.getItem('dcbd_reviewer_profiles') || '{}');
      if (map && map[uid]) remembered = map[uid];
    } catch (e) {}

    const profile = {
      uid,
      accountType,
      name: (remembered.name || baseName || 'সম্মানিত গ্রাহক').trim(),
      photo: (remembered.photo || basePhoto || '').trim(),
      location: (remembered.location || baseLocation || '').trim()
    };

    try {
      const map = JSON.parse(localStorage.getItem('dcbd_reviewer_profiles') || '{}');
      map[uid] = { ...profile, updatedAt: Date.now() };
      localStorage.setItem('dcbd_reviewer_profiles', JSON.stringify(map));
    } catch (e) {}

    return profile;
  };

  window.__pdSetReviewRating = function(val) {
    const rating = Math.max(1, Math.min(5, Number(val) || 5));
    const inp = document.getElementById('pd-review-rating-val');
    if (inp) inp.value = String(rating);
    const label = document.getElementById('pd-review-rating-label');
    const labels = { 1: '১/৫ — খারাপ', 2: '২/৫ — মোটামুটি', 3: '৩/৫ — ভালো', 4: '৪/৫ — খুব ভালো', 5: '৫/৫ — চমৎকার!' };
    if (label) label.textContent = labels[rating] || '৫/৫';
    document.querySelectorAll('.pd-star-pick-btn').forEach(btn => {
      const starVal = Number(btn.getAttribute('data-star') || 0);
      if (starVal <= rating) {
        btn.classList.add('active');
        btn.style.color = '#f59e0b';
      } else {
        btn.classList.remove('active');
        btn.style.color = '#cbd5e1';
      }
    });
  };

  window.__pdHandleReviewPhotoFile = function(input) {
    const file = input && input.files && input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      if (window.toast && window.toast.show) {
        window.toast.show({ type: 'error', title: 'ছবি বড়', message: 'অনুগ্রহ করে ২ এমবি-এর কম সাইজের ছবি নির্বাচন করুন।' });
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
      const dataUrl = String(ev.target && ev.target.result || '');
      const photoInput = document.getElementById('pd-review-photo-input');
      const avatarPreview = document.getElementById('pd-reviewer-avatar-preview');
      if (photoInput) photoInput.value = dataUrl;
      if (avatarPreview && dataUrl) {
        avatarPreview.innerHTML = `<img src="${dataUrl}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
      }
    };
    reader.readAsDataURL(file);
  };

  window.__pdSubmitProductReview = async function(e) {
    if (e) e.preventDefault();
    if (!authStore || !authStore.isAuthenticated()) {
      if (window.toast && window.toast.show) {
        window.toast.show({ type: 'error', title: 'লগইন প্রয়োজন', message: 'রিভিউ লিখতে অনুগ্রহ করে আগে আপনার অ্যাকাউন্টে লগইন করুন।' });
      }
      return;
    }

    const form = e ? e.target : document.getElementById('pd-write-review-form');
    if (!form) return;
    const productSku = form.getAttribute('data-product-sku') || '';
    const productName = form.getAttribute('data-product-name') || 'পণ্য';
    const nameEl = document.getElementById('pd-review-name-input');
    const photoEl = document.getElementById('pd-review-photo-input');
    const ratingEl = document.getElementById('pd-review-rating-val');
    const commentEl = document.getElementById('pd-review-comment-input');
    const submitBtn = document.getElementById('pd-review-submit-btn');

    const reviewerName = (nameEl?.value || authStore.getUserDisplayName() || 'গ্রাহক').trim();
    const reviewerPhoto = (photoEl?.value || '').trim();
    const rating = Math.max(1, Math.min(5, Number(ratingEl?.value || 5)));
    const comment = (commentEl?.value || '').trim();

    if (!comment || comment.length < 3) {
      if (window.toast && window.toast.show) {
        window.toast.show({ type: 'error', title: 'মতামত লিখুন', message: 'অনুগ্রহ করে পণ্যটি সম্পর্কে আপনার মতামত লিখুন।' });
      }
      if (commentEl) commentEl.focus();
      return;
    }

    const profile = window.__pdGetTrackedReviewerProfile();
    if (profile && profile.uid) {
      try {
        const map = JSON.parse(localStorage.getItem('dcbd_reviewer_profiles') || '{}');
        map[profile.uid] = { ...profile, name: reviewerName, photo: reviewerPhoto, updatedAt: Date.now() };
        localStorage.setItem('dcbd_reviewer_profiles', JSON.stringify(map));
      } catch (err) {}
    }

    const nowDate = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
    const newReview = {
      id: 'REV-' + Date.now(),
      review_id: 'REV-' + Date.now(),
      product_sku: productSku,
      product: productName,
      customer_name: reviewerName,
      customer: reviewerName,
      account_type: authStore.getAccountType ? authStore.getAccountType() : 'CUSTOMER',
      rating: rating,
      comment: comment,
      image: reviewerPhoto,
      avatar: reviewerPhoto,
      status: 'Approved',
      date: nowDate
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'সাবমিট হচ্ছে...';
    }

    try {
      await apiClient.request('reviews/create', newReview);
    } catch (err) {}

    // Persist immediately in local review cache so it appears right away and stays across reloads
    try {
      const existing = JSON.parse(localStorage.getItem('dcbd_sheet_reviews') || '[]');
      const updated = [newReview, ...(Array.isArray(existing) ? existing : [])];
      localStorage.setItem('dcbd_sheet_reviews', JSON.stringify(updated));
    } catch (err) {}

    // Insert into DOM immediately
    const grid = document.getElementById('pd-review-list-grid');
    if (grid) {
      const starsStr = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      const initial = (reviewerName.charAt(0) || 'U').toUpperCase();
      const avatarHtml = reviewerPhoto
        ? `<img src="${escapeHtml(reviewerPhoto)}" alt="${escapeHtml(reviewerName)}" class="pd-reviewer-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><span class="pd-reviewer-avatar-fallback" style="display:none;">${escapeHtml(initial)}</span>`
        : `<span class="pd-reviewer-avatar-fallback">${escapeHtml(initial)}</span>`;
      const cardHtml = `
        <div class="pd-review-card" style="border-color: rgba(16, 185, 129, 0.45);">
          <div class="pd-review-user-row">
            <div style="display:flex; align-items:center; gap:10px; min-width:0;">
              <div class="pd-reviewer-avatar">${avatarHtml}</div>
              <div style="min-width:0;">
                <div class="pd-review-name">${escapeHtml(reviewerName)}</div>
                <div style="font-size:10.5px; color:#94a3b8;">${escapeHtml(newReview.account_type)} • ${escapeHtml(nowDate)}</div>
              </div>
            </div>
            <span class="pd-review-stars">${starsStr}</span>
          </div>
          <p class="pd-review-text">${escapeHtml(comment)}</p>
        </div>
      `;
      grid.insertAdjacentHTML('afterbegin', cardHtml);
    }

    const countEl = document.getElementById('pd-review-count-label');
    if (countEl) {
      const cur = parseInt(countEl.getAttribute('data-count') || '2', 10) + 1;
      countEl.setAttribute('data-count', String(cur));
      countEl.textContent = `(${cur} টি রিভিউ)`;
    }

    if (commentEl) commentEl.value = '';
    window.__pdSetReviewRating(5);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'রিভিউ সাবমিট করুন';
    }

    if (window.toast && window.toast.show) {
      window.toast.show({
        type: 'success',
        title: 'রিভিউ যুক্ত হয়েছে!',
        message: 'আপনার মূল্যবান মতামতের জন্য ধন্যবাদ।',
        duration: 3500
      });
    }
  };
}

export async function renderProductDetailPage(slugOrId) {
  const cleanId = (slugOrId || '').toString().trim();
  let decodedId = cleanId;
  try { decodedId = decodeURIComponent(cleanId); } catch(e){}

  let res = await apiClient.request("products/details", { slug: cleanId, id: cleanId });
  let product = res.data;

  if (!product && decodedId !== cleanId) {
    res = await apiClient.request("products/details", { slug: decodedId, id: decodedId });
    product = res.data;
  }

  if (!product) {
    const all = await apiClient.loadProductsFromSheet();
    const target = cleanId.toLowerCase();
    const decodedTarget = decodedId.toLowerCase();
    product = all.find(p => {
      const pId = (p.product_id || '').toString().trim().toLowerCase();
      const sku = (p.sku || '').toString().trim().toLowerCase();
      const slug = (p.slug || '').toString().trim().toLowerCase();
      const name = (p.name || p.p_name || '').toString().trim().toLowerCase();
      return pId === target || pId === decodedTarget ||
             sku === target || sku === decodedTarget ||
             slug === target || slug === decodedTarget ||
             name === target || name === decodedTarget;
    });
  }

  if (!product) {
    return `
      <div class="py-24 text-center space-y-4">
        <div class="text-5xl">📦</div>
        <h2 class="text-xl font-bold text-slate-800 dark:text-white">পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <p class="text-xs text-slate-500">অনুরোধকৃত পণ্যটি সম্ভবত সরানো হয়েছে বা লিঙ্কটি ভুল।</p>
        <a href="/products" class="btn-primary text-xs py-2 px-5 inline-flex">সকল পণ্য দেখুন</a>
      </div>
    `;
  }

  if (typeof window !== 'undefined') {
    if (window.__dcbdUpdateDynamicSeo) {
      window.__dcbdUpdateDynamicSeo({
        path: window.location.pathname,
        product,
        products: apiClient.products || [],
        categories: apiClient.sheetCategories || []
      });
    }
    if (window.__dcbdTrackAdEvent) {
      window.__dcbdTrackAdEvent('ViewContent', product);
    }
  }

  const productId = String(product.product_id || product.sku || product.id || '').trim();
  const isWholesale = authStore.isWholesaler();
  const isReseller = authStore.isReseller();
  const isFavourite = favouriteStore.has(productId) || (product.sku && favouriteStore.has(product.sku));
  const stock = Number(product.stock !== undefined ? product.stock : 25);
  const isOutOfStock = stock <= 0;

  // Prices
  const originalPrice = Number(product.original_price || product.regular_price || product.selling_price);
  const customerPrice = Number(product.selling_price);
  const wholesalePrice = Number(product.wholesale_price || Math.round(customerPrice * 0.85));
  const resellerPrice = Number(product.reseller_price || Math.round(customerPrice * 0.90));
  const minOrderQty = Number(product.min_order_qty || product.min_order_q || 5);

  let activePrice = customerPrice;
  let roleTitle = "";
  if (isWholesale) {
    activePrice = wholesalePrice;
    roleTitle = "পাইকারি মূল্য (Wholesale Price)";
  } else if (isReseller) {
    activePrice = resellerPrice;
    roleTitle = "রিসেলার মূল্য (Reseller Margin Price)";
  }

  // Pre-Order rule: when stock <= 0, price increases by 15% and no discount/coupon applies
  if (isOutOfStock) {
    activePrice = Math.round(activePrice * 1.15);
  }
  const isDiscounted = !isOutOfStock && (originalPrice > activePrice);
  const discountPercent = isDiscounted ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0;
  const discountAmount = isDiscounted ? (originalPrice - activePrice) : 0;

  const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
  const rawImages = Array.isArray(product.images)
    ? product.images
    : (typeof product.images === 'string' ? product.images.split(/[\n,]+/) : []);
  const cleanImages = rawImages.map(u => String(u || '').trim()).filter(Boolean);
  const images = cleanImages.length > 0 ? cleanImages : [String(product.thumbnail || '').trim() || fallbackImg];
  const mainImage = images[0];

  // Options Parsing (Color & Size)
  const parseOptions = (val, defaults) => {
    if (!val) return defaults;
    if (Array.isArray(val)) return val.filter(Boolean);
    const s = String(val).trim();
    if (!s) return defaults;
    const parts = s.split(/[,|\/]+/).map(p => p.trim()).filter(Boolean);
    return parts.length > 0 ? parts : defaults;
  };

  const availableColors = parseOptions(product.colors || product.color, ['Black', 'Silver', 'Navy Blue']);
  const availableSizes = parseOptions(product.sizes || product.size, ['Standard (ফ্রি সাইজ)', 'Medium (M)', 'Large (L)']);
  const defaultColor = availableColors[0] || 'Black';
  const defaultSize = availableSizes[0] || 'Standard';

  // Safe minimal payload for instant offline/cache toggling
  const productPayload = {
    product_id: productId,
    sku: product.sku || productId,
    name: product.name || product.p_name || '',
    slug: product.slug || productId,
    brand: product.brand || 'Dream Cart BD',
    selling_price: activePrice || customerPrice,
    original_price: originalPrice,
    thumbnail: mainImage,
    stock: stock,
    category: product.category || '',
    wholesale_price: wholesalePrice,
    reseller_price: resellerPrice,
    min_order_qty: minOrderQty
  };
  const encodedJson = encodeURIComponent(JSON.stringify(productPayload));

  // WhatsApp link preparation
  const currentUrl = (typeof window !== 'undefined' && window.location) ? window.location.href : 'https://dreamcartbd.com/product/' + (product.slug || productId);
  const waMessage = encodeURIComponent(`হ্যালো Dream Cart BD, আমি এই পণ্যটি সম্পর্কে জানতে বা অর্ডার করতে চাই:\nপণ্য: ${product.name || product.p_name}\nSKU: ${product.sku || productId}\nমূল্য: ৳${activePrice}\nলিঙ্ক: ${currentUrl}`);
  const wa1Url = `https://wa.me/8801581703822?text=${waMessage}`;
  const wa2Url = `https://wa.me/8801818273838?text=${waMessage}`;

  // Fetch related products
  let related = [];
  try {
    const relatedRes = await apiClient.request("products/list", { category: product.category });
    related = ((relatedRes.data && relatedRes.data.items) || []).filter(p => (p.product_id || p.sku) !== productId).slice(0, 4);
  } catch(e) {}

  // Fetch reviews for this product (from live sheet / local cache)
  let productReviews = [];
  try {
    const revRes = await apiClient.request("reviews/list");
    const allRevs = (revRes && revRes.data && Array.isArray(revRes.data.items)) ? revRes.data.items : [];
    const matchTargets = [
      String(productId || '').toLowerCase(),
      String(product.sku || '').toLowerCase(),
      String(product.slug || '').toLowerCase(),
      String(product.name || product.p_name || '').toLowerCase()
    ].filter(Boolean);
    productReviews = allRevs.filter(rv => {
      const rSku = String(rv.product_sku || '').trim().toLowerCase();
      const rProd = String(rv.product || '').trim().toLowerCase();
      return matchTargets.includes(rSku) || matchTargets.includes(rProd);
    });
  } catch (e) {}

  const defaultReviews = [
    {
      customer_name: 'রাকিবুল হাসান (কুমিল্লা)',
      account_type: 'Verified Buyer',
      rating: 5,
      comment: 'খুবই চমৎকার প্যাকেজিং এবং আসল পণ্য। পদুয়ার বাজার শোরুম থেকে সরাসরি নিয়েছি। ধন্যবাদ!',
      image: '',
      date: 'ভেরিফাইড ক্রেতা'
    },
    {
      customer_name: 'শফিকুল ইসলাম (ঢাকা)',
      account_type: 'Verified Buyer',
      rating: 5,
      comment: 'অর্ডার করার ২ দিনের মধ্যে ডেলিভারি পেয়েছি। পণ্যের কোয়ালিটি ১০০% জেনুইন।',
      image: '',
      date: 'ভেরিফাইড ক্রেতা'
    }
  ];
  const displayedReviews = [...productReviews, ...defaultReviews];
  const avgRatingVal = displayedReviews.length > 0
    ? (displayedReviews.reduce((s, r) => s + (Number(r.rating) || 5), 0) / displayedReviews.length).toFixed(1)
    : '4.9';
  const isLoggedInForReview = authStore.isAuthenticated();
  const trackedReviewer = (typeof window !== 'undefined' && window.__pdGetTrackedReviewerProfile && isLoggedInForReview)
    ? window.__pdGetTrackedReviewerProfile()
    : null;

  return `
    <style id="dc-product-detail-styles">
      .pd-wrapper {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        width: 100%;
        max-width: 1180px;
        margin: 0 auto;
        padding: 8px 0 80px;
        box-sizing: border-box;
        overflow-x: hidden;
        overflow-x: clip;
      }
      @media (min-width: 640px) {
        .pd-wrapper {
          padding: 16px 16px 80px;
        }
      }

      /* Breadcrumbs */
      .pd-breadcrumb {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #94a3b8;
        margin-bottom: 18px;
        flex-wrap: wrap;
        min-width: 0;
        max-width: 100%;
      }
      .pd-breadcrumb a {
        color: #64748b;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .pd-breadcrumb a:hover {
        color: #10b981;
      }
      .dark .pd-breadcrumb a {
        color: #94a3b8;
      }
      .dark .pd-breadcrumb a:hover {
        color: #34d399;
      }
      .pd-breadcrumb-current {
        font-weight: 700;
        color: #334155;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Main 2-Column Grid (minmax(0, ...) locks column width regardless of image count) */
      .pd-main-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 24px;
        align-items: start;
        width: 100%;
        max-width: 100%;
        margin-bottom: 40px;
        box-sizing: border-box;
      }
      @media (min-width: 1024px) {
        .pd-main-grid {
          grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
          gap: 44px;
          margin-bottom: 48px;
        }
      }

      /* Left Gallery */
      .pd-gallery {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
      }
      .pd-main-img-box {
        position: relative;
        width: 100%;
        max-width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 20px;
        overflow: hidden;
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.9);
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
      }
      @media (min-width: 640px) {
        .pd-main-img-box {
          border-radius: 24px;
        }
      }
      .dark .pd-main-img-box {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.45);
      }
      .pd-main-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
      }
      .pd-main-img:hover {
        transform: scale(1.03);
      }

      /* Main Image Left/Right Arrow Buttons */
      .pd-img-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(226, 232, 240, 0.9);
        color: #0f172a;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
        transition: all 0.18s ease;
        padding: 0;
        outline: none;
      }
      .pd-img-nav.prev { left: 10px; }
      .pd-img-nav.next { right: 10px; }
      .pd-img-nav:hover {
        background: #10b981;
        border-color: #10b981;
        color: #ffffff;
        transform: translateY(-50%) scale(1.08);
      }
      .dark .pd-img-nav {
        background: rgba(15, 23, 42, 0.84);
        border-color: rgba(255, 255, 255, 0.16);
        color: #f8fafc;
      }
      .dark .pd-img-nav:hover {
        background: #10b981;
        border-color: #10b981;
        color: #ffffff;
      }
      .pd-img-nav svg {
        width: 18px;
        height: 18px;
      }

      .pd-img-counter {
        position: absolute;
        bottom: 12px;
        right: 12px;
        background: rgba(15, 23, 42, 0.72);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        color: #f8fafc;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 9999px;
        z-index: 10;
        pointer-events: none;
      }

      .pd-discount-badge {
        position: absolute;
        top: 14px;
        left: 14px;
        background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
        color: #ffffff;
        font-size: 11.5px;
        font-weight: 800;
        padding: 5px 12px;
        border-radius: 9999px;
        box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
        letter-spacing: 0.3px;
        z-index: 10;
        pointer-events: none;
      }

      /* Floating Favourite Heart on Image */
      .pd-fav-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(226, 232, 240, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        z-index: 10;
        outline: none;
        padding: 0;
      }
      @media (min-width: 640px) {
        .pd-fav-btn {
          width: 44px;
          height: 44px;
        }
      }
      .dark .pd-fav-btn {
        background: rgba(15, 23, 42, 0.88);
        border-color: rgba(255, 255, 255, 0.15);
        color: #94a3b8;
      }
      .pd-fav-btn:hover {
        color: #f43f5e;
        border-color: #fecdd3;
        transform: scale(1.12);
        box-shadow: 0 4px 14px rgba(244, 63, 94, 0.25);
      }
      .pd-fav-btn.is-favourite {
        color: #f43f5e !important;
        background: #fff1f2 !important;
        border-color: #fecdd3 !important;
        box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25);
      }
      .dark .pd-fav-btn.is-favourite {
        background: rgba(244, 63, 94, 0.25) !important;
        border-color: rgba(244, 63, 94, 0.45) !important;
        color: #fb7185 !important;
      }
      .pd-fav-btn svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
        transition: transform 0.2s ease;
      }
      .pd-fav-btn:hover svg {
        transform: scale(1.15);
      }

      /* Thumbnails Wrapper with Arrow Buttons */
      .pd-thumb-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        overflow: hidden;
        box-sizing: border-box;
      }
      .pd-thumb-arrow {
        flex: 0 0 auto;
        width: 28px;
        height: 56px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        background: #ffffff;
        color: #334155;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        padding: 0;
        outline: none;
      }
      .pd-thumb-arrow:hover {
        border-color: #10b981;
        color: #10b981;
        background: #ecfdf5;
      }
      .dark .pd-thumb-arrow {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.12);
        color: #cbd5e1;
      }
      .dark .pd-thumb-arrow:hover {
        border-color: #10b981;
        color: #34d399;
        background: rgba(16, 185, 129, 0.15);
      }
      .pd-thumb-arrow svg {
        width: 16px;
        height: 16px;
      }

      /* Thumbnails Scroll Strip (flex: 1 1 0% + width: 0 guarantees zero parent expansion) */
      .pd-thumb-row {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        gap: 8px;
        flex: 1 1 0%;
        width: 0;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: auto;
        overflow-y: hidden;
        overscroll-behavior-x: contain;
        -webkit-overflow-scrolling: touch;
        scroll-snap-type: x proximity;
        padding: 3px 2px 4px;
        scrollbar-width: none;
      }
      .pd-thumb-row::-webkit-scrollbar {
        display: none;
      }
      .pd-thumb-btn {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid #e2e8f0;
        background: #ffffff;
        cursor: pointer;
        flex: 0 0 auto;
        scroll-snap-align: start;
        padding: 0;
        transition: all 0.15s ease;
        opacity: 0.75;
      }
      @media (min-width: 640px) {
        .pd-thumb-wrap {
          gap: 8px;
        }
        .pd-thumb-row {
          gap: 10px;
        }
        .pd-thumb-arrow {
          width: 34px;
          height: 68px;
          border-radius: 14px;
        }
        .pd-thumb-btn {
          width: 68px;
          height: 68px;
          border-radius: 14px;
        }
      }
      .dark .pd-thumb-btn {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.1);
      }
      .pd-thumb-btn:hover {
        opacity: 1;
        border-color: #10b981;
      }
      .pd-thumb-btn.border-emerald-500 {
        opacity: 1;
        border-color: #10b981 !important;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.28);
      }
      .pd-thumb-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      /* Right Info Panel */
      .pd-info-panel {
        display: flex;
        flex-direction: column;
        gap: 18px;
        min-width: 0;
        width: 100%;
        max-width: 100%;
      }
      .pd-badge-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .pd-brand-badge {
        background: #ecfdf5;
        color: #047857;
        font-size: 11.5px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 8px;
        border: 1px solid #a7f3d0;
      }
      .dark .pd-brand-badge {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.25);
      }
      .pd-sku-tag {
        font-family: monospace;
        font-size: 11.5px;
        color: #64748b;
        background: #f1f5f9;
        padding: 4px 8px;
        border-radius: 6px;
      }
      .dark .pd-sku-tag {
        background: #1e293b;
        color: #94a3b8;
      }
      .pd-cat-badge {
        background: #f0fdf4;
        color: #166534;
        font-size: 11.5px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 8px;
      }
      .dark .pd-cat-badge {
        background: rgba(34, 197, 94, 0.12);
        color: #4ade80;
      }

      /* Quick Favourite Pill in Meta Row */
      .pd-badge-fav {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #64748b;
        font-size: 11px;
        font-weight: 700;
        padding: 3.5px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        outline: none;
      }
      .dark .pd-badge-fav {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.1);
        color: #94a3b8;
      }
      .pd-badge-fav:hover {
        color: #f43f5e;
        border-color: #fecdd3;
        background: #fff1f2;
      }
      .dark .pd-badge-fav:hover {
        color: #fb7185;
        background: rgba(244, 63, 94, 0.15);
      }
      .pd-badge-fav.is-favourite {
        color: #f43f5e !important;
        background: #fff1f2 !important;
        border-color: #fecdd3 !important;
      }
      .dark .pd-badge-fav.is-favourite {
        background: rgba(244, 63, 94, 0.2) !important;
        border-color: rgba(244, 63, 94, 0.4) !important;
        color: #fb7185 !important;
      }
      .pd-badge-fav svg {
        width: 14px;
        height: 14px;
        fill: currentColor;
      }

      .pd-title {
        font-size: 21px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.35;
        margin: 0;
        overflow-wrap: break-word;
        word-break: break-word;
      }
      @media (min-width: 640px) {
        .pd-title {
          font-size: 28px;
        }
      }
      .dark .pd-title {
        color: #f8fafc;
      }

      /* Price Card */
      .pd-price-box {
        background: linear-gradient(135deg, rgba(236, 253, 245, 0.9) 0%, rgba(240, 253, 250, 0.8) 100%);
        border: 1px solid rgba(167, 243, 208, 0.8);
        border-radius: 18px;
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      @media (min-width: 640px) {
        .pd-price-box {
          border-radius: 20px;
          padding: 20px 24px;
        }
      }
      .dark .pd-price-box {
        background: linear-gradient(135deg, rgba(6, 78, 59, 0.28) 0%, rgba(13, 148, 136, 0.18) 100%);
        border-color: rgba(16, 185, 129, 0.25);
      }
      .pd-role-title {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        color: #047857;
        letter-spacing: 0.5px;
      }
      .dark .pd-role-title {
        color: #34d399;
      }
      .pd-price-row {
        display: flex;
        align-items: baseline;
        gap: 10px;
        flex-wrap: wrap;
      }
      .pd-active-price {
        font-size: 30px;
        font-weight: 900;
        color: #065f46;
        font-family: 'Plus Jakarta Sans', monospace;
        line-height: 1;
      }
      @media (min-width: 640px) {
        .pd-active-price {
          font-size: 38px;
        }
      }
      .dark .pd-active-price {
        color: #34d399;
      }
      .pd-regular-price {
        font-size: 15px;
        color: #94a3b8;
        text-decoration: line-through;
        font-weight: 600;
      }
      .pd-stock-pill {
        font-size: 11.5px;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 9999px;
      }
      .pd-stock-in {
        background: #dcfce7;
        color: #15803d;
      }
      .dark .pd-stock-in {
        background: rgba(34, 197, 94, 0.2);
        color: #4ade80;
      }
      .pd-stock-out {
        background: #ffe4e6;
        color: #be123c;
      }
      .dark .pd-stock-out {
        background: rgba(244, 63, 94, 0.2);
        color: #fb7185;
      }
      .pd-moq-alert {
        font-size: 12px;
        font-weight: 700;
        color: #b45309;
        background: #fef3c7;
        border: 1px solid #fde68a;
        padding: 8px 12px;
        border-radius: 10px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .dark .pd-moq-alert {
        background: rgba(245, 158, 11, 0.15);
        border-color: rgba(245, 158, 11, 0.25);
        color: #fbbf24;
      }

      /* Color & Size Pickers */
      .pd-selector-section {
        padding: 16px 0;
        border-top: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .dark .pd-selector-section {
        border-top-color: rgba(255, 255, 255, 0.08);
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }
      .pd-selector-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12.5px;
        margin-bottom: 8px;
        gap: 8px;
        flex-wrap: wrap;
      }
      .pd-selector-title {
        font-weight: 700;
        color: #334155;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .dark .pd-selector-title {
        color: #cbd5e1;
      }
      .pd-selected-value {
        font-size: 11px;
        font-weight: 800;
        color: #047857;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        padding: 2px 10px;
        border-radius: 6px;
      }
      .dark .pd-selected-value {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.25);
      }
      .pd-chips-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .pd-color-chip {
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        color: #334155;
        font-size: 12px;
        font-weight: 700;
        padding: 7px 14px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .dark .pd-color-chip {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.15);
        color: #cbd5e1;
      }
      .pd-color-chip:hover {
        border-color: #10b981;
        color: #059669;
      }
      .pd-color-chip.active {
        border-color: #10b981 !important;
        background: #ecfdf5 !important;
        color: #047857 !important;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      }
      .dark .pd-color-chip.active {
        background: rgba(16, 185, 129, 0.15) !important;
        color: #34d399 !important;
        border-color: #10b981 !important;
      }
      .pd-color-dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 1px solid rgba(0, 0, 0, 0.15);
        flex-shrink: 0;
      }

      .pd-size-chip {
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        color: #334155;
        font-size: 12px;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .dark .pd-size-chip {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.15);
        color: #cbd5e1;
      }
      .pd-size-chip:hover {
        border-color: #10b981;
        color: #059669;
      }
      .pd-size-chip.active {
        border-color: #10b981 !important;
        background: #ecfdf5 !important;
        color: #047857 !important;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      }
      .dark .pd-size-chip.active {
        background: rgba(16, 185, 129, 0.15) !important;
        color: #34d399 !important;
        border-color: #10b981 !important;
      }

      /* Quantity Selector */
      .pd-qty-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12.5px;
        flex-wrap: wrap;
      }
      .pd-qty-label {
        font-weight: 700;
        color: #334155;
      }
      .dark .pd-qty-label {
        color: #cbd5e1;
      }
      .pd-qty-box {
        display: inline-flex;
        align-items: center;
        border: 1.5px solid #cbd5e1;
        border-radius: 12px;
        overflow: hidden;
        background: #ffffff;
      }
      .dark .pd-qty-box {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.15);
      }
      .pd-qty-btn {
        width: 36px;
        height: 36px;
        background: none;
        border: none;
        font-size: 16px;
        font-weight: 700;
        color: #334155;
        cursor: pointer;
        transition: background 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dark .pd-qty-btn {
        color: #cbd5e1;
      }
      .pd-qty-btn:hover {
        background: #f1f5f9;
        color: #10b981;
      }
      .dark .pd-qty-btn:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #34d399;
      }
      .pd-qty-input {
        width: 48px;
        height: 36px;
        border: none;
        text-align: center;
        font-size: 13px;
        font-weight: 800;
        color: #0f172a;
        outline: none;
        background: transparent;
      }
      .dark .pd-qty-input {
        color: #f8fafc;
      }

      /* CTA Actions Section */
      .pd-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 6px;
      }
      
      .pd-btn-order {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        border: none;
        border-radius: 14px;
        padding: 14px 20px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.4);
        transition: all 0.2s ease;
        width: 100%;
        outline: none;
      }
      .pd-btn-order:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -4px rgba(16, 185, 129, 0.5);
      }
      
      .pd-btn-preorder {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: #ffffff;
        border: none;
        border-radius: 14px;
        padding: 14px 20px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 8px 20px -4px rgba(245, 158, 11, 0.4);
        transition: all 0.2s ease;
        width: 100%;
        outline: none;
      }
      .pd-btn-preorder:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -4px rgba(245, 158, 11, 0.5);
      }

      /* Secondary Actions Grid (Cart + Favourite) */
      .pd-secondary-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 8px;
      }
      @media (min-width: 640px) {
        .pd-secondary-grid {
          gap: 12px;
        }
      }

      .pd-btn-cart {
        background: #ffffff;
        color: #0f172a;
        border: 1.5px solid #cbd5e1;
        border-radius: 14px;
        padding: 11px 10px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s ease;
        outline: none;
        min-width: 0;
        text-align: center;
      }
      @media (min-width: 640px) {
        .pd-btn-cart {
          padding: 13px 20px;
          font-size: 13.5px;
          gap: 8px;
        }
      }
      .dark .pd-btn-cart {
        background: rgba(255, 255, 255, 0.06);
        color: #f8fafc;
        border-color: rgba(255, 255, 255, 0.15);
      }
      .pd-btn-cart:hover {
        border-color: #10b981;
        color: #059669;
        background: #f0fdf4;
        transform: translateY(-1.5px);
      }
      .dark .pd-btn-cart:hover {
        border-color: #10b981;
        color: #34d399;
        background: rgba(16, 185, 129, 0.15);
      }

      /* Detail Page Favourite Action Button */
      .pd-btn-fav {
        background: #ffffff;
        color: #475569;
        border: 1.5px solid #cbd5e1;
        border-radius: 14px;
        padding: 11px 10px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        outline: none;
        min-width: 0;
        text-align: center;
      }
      @media (min-width: 640px) {
        .pd-btn-fav {
          padding: 13px 18px;
          font-size: 13.5px;
          gap: 8px;
        }
      }
      .dark .pd-btn-fav {
        background: rgba(255, 255, 255, 0.06);
        color: #cbd5e1;
        border-color: rgba(255, 255, 255, 0.15);
      }
      .pd-btn-fav:hover {
        border-color: #f43f5e;
        color: #f43f5e;
        background: #fff1f2;
        transform: translateY(-1.5px);
        box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2);
      }
      .dark .pd-btn-fav:hover {
        border-color: #f43f5e;
        color: #fb7185;
        background: rgba(244, 63, 94, 0.15);
      }
      .pd-btn-fav.is-favourite {
        color: #f43f5e !important;
        background: #fff1f2 !important;
        border-color: #fecdd3 !important;
        box-shadow: 0 2px 10px rgba(244, 63, 94, 0.2);
      }
      .dark .pd-btn-fav.is-favourite {
        background: rgba(244, 63, 94, 0.2) !important;
        border-color: rgba(244, 63, 94, 0.4) !important;
        color: #fb7185 !important;
      }
      .pd-btn-fav svg {
        width: 17px;
        height: 17px;
        fill: currentColor;
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }
      @media (min-width: 640px) {
        .pd-btn-fav svg {
          width: 19px;
          height: 19px;
        }
      }
      .pd-btn-fav:hover svg {
        transform: scale(1.15);
      }

      /* WhatsApp Buttons */
      .pd-wa-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;
      }
      @media (min-width: 640px) {
        .pd-wa-grid {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }
      }
      .pd-wa-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 11px 14px;
        border-radius: 12px;
        font-size: 12.5px;
        font-weight: 700;
        text-decoration: none;
        transition: all 0.15s ease;
      }
      .pd-wa-btn-1 {
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
      }
      .dark .pd-wa-btn-1 {
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.25);
      }
      .pd-wa-btn-1:hover {
        background: #10b981;
        color: #ffffff;
      }
      .pd-wa-btn-2 {
        background: #ccfbf1;
        color: #0f766e;
        border: 1px solid #99f6e4;
      }
      .dark .pd-wa-btn-2 {
        background: rgba(20, 184, 166, 0.12);
        color: #2dd4bf;
        border-color: rgba(20, 184, 166, 0.25);
      }
      .pd-wa-btn-2:hover {
        background: #0d9488;
        color: #ffffff;
      }

      /* Trust Cards */
      .pd-trust-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 8px;
        padding-top: 4px;
      }
      @media (min-width: 640px) {
        .pd-trust-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }
      }
      .pd-trust-item {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11.5px;
        font-weight: 600;
        color: #334155;
        min-width: 0;
      }
      .dark .pd-trust-item {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.08);
        color: #cbd5e1;
      }
      .pd-trust-icon {
        font-size: 16px;
        flex-shrink: 0;
      }

      /* Description & Specification Card */
      .pd-section-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 18px;
        padding: 20px 16px;
        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.03);
        margin-bottom: 24px;
      }
      @media (min-width: 640px) {
        .pd-section-card {
          border-radius: 24px;
          padding: 28px 24px;
          margin-bottom: 32px;
        }
      }
      .dark .pd-section-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.4);
      }
      .pd-section-title {
        font-size: 17px;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      @media (min-width: 640px) {
        .pd-section-title {
          font-size: 18px;
        }
      }
      .dark .pd-section-title {
        color: #f8fafc;
        border-bottom-color: rgba(255, 255, 255, 0.06);
      }
      .pd-desc-text {
        font-size: 13.5px;
        line-height: 1.7;
        color: #475569;
        white-space: pre-line;
        overflow-wrap: break-word;
        word-break: break-word;
      }
      .dark .pd-desc-text {
        color: #cbd5e1;
      }
      .pd-spec-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 14px 16px;
        margin-top: 18px;
      }
      .dark .pd-spec-box {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.08);
      }
      .pd-spec-header {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        color: #047857;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }
      .dark .pd-spec-header {
        color: #34d399;
      }
      .pd-spec-content {
        font-size: 12.5px;
        line-height: 1.6;
        color: #334155;
        font-family: monospace;
        overflow-wrap: break-word;
        word-break: break-word;
      }
      .dark .pd-spec-content {
        color: #e2e8f0;
      }

      /* Customer Reviews Section */
      .pd-reviews-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
        flex-wrap: wrap;
        gap: 10px;
      }
      .pd-rating-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #fef3c7;
        color: #92400e;
        font-size: 12.5px;
        font-weight: 800;
        padding: 6px 14px;
        border-radius: 9999px;
      }
      .dark .pd-rating-badge {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
      }
      .pd-review-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 14px;
      }
      @media (min-width: 640px) {
        .pd-review-grid {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        }
      }
      .pd-review-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px 18px;
      }
      .dark .pd-review-card {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.08);
      }
      .pd-review-user-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        gap: 8px;
        flex-wrap: wrap;
      }
      .pd-review-name {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
      }
      .dark .pd-review-name {
        color: #f8fafc;
      }
      .pd-review-stars {
        color: #f59e0b;
        font-size: 13px;
        letter-spacing: 1px;
      }
      .pd-review-text {
        font-size: 12.5px;
        color: #64748b;
        line-height: 1.55;
        margin: 0;
      }
      .dark .pd-review-text {
        color: #94a3b8;
      }

      /* Related Products */
      .pd-related-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
        gap: 10px;
      }
      .pd-related-title {
        font-size: 17px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
      }
      @media (min-width: 640px) {
        .pd-related-title {
          font-size: 18px;
        }
      }
      .dark .pd-related-title {
        color: #f8fafc;
      }
      .pd-related-link {
        font-size: 12px;
        font-weight: 700;
        color: #10b981;
        text-decoration: none;
        flex-shrink: 0;
      }
      .pd-related-link:hover {
        text-decoration: underline;
      }

      /* Reviewer Avatar & Interactive Write-a-Review Form */
      .pd-reviewer-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
        border: 2px solid rgba(16, 185, 129, 0.35);
        background: #ecfdf5;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dark .pd-reviewer-avatar {
        background: rgba(16, 185, 129, 0.16);
      }
      .pd-reviewer-avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .pd-reviewer-avatar-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 800;
        color: #059669;
      }
      .dark .pd-reviewer-avatar-fallback {
        color: #34d399;
      }
      .pd-review-form-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 18px;
        margin-bottom: 20px;
      }
      .dark .pd-review-form-box {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.08);
      }
      .pd-star-pick-btn {
        background: none;
        border: none;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        padding: 2px 3px;
        color: #f59e0b;
        transition: transform 0.15s ease;
      }
      .pd-star-pick-btn:hover {
        transform: scale(1.18);
      }
      .pd-preorder-notice {
        margin-top: 8px;
        padding: 9px 12px;
        border-radius: 11px;
        background: rgba(245, 158, 11, 0.13);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #b45309;
        font-size: 11.5px;
        font-weight: 700;
        line-height: 1.45;
      }
      .dark .pd-preorder-notice {
        background: rgba(245, 158, 11, 0.16);
        border-color: rgba(245, 158, 11, 0.35);
        color: #fbbf24;
      }
    </style>

    <div class="pd-wrapper">
      
      <!-- Breadcrumb -->
      <div class="pd-breadcrumb">
        <a href="/">হোম</a>
        <span>/</span>
        <a href="/products">পণ্যসমূহ</a>
        <span>/</span>
        <a href="/products?cat=${encodeURIComponent(product.category || '')}">${product.category || 'ক্যাটাগরি'}</a>
        <span>/</span>
        <span class="pd-breadcrumb-current dark:text-slate-200">${product.name || product.p_name}</span>
      </div>

      <!-- Main Product Display Grid -->
      <div class="pd-main-grid">
        
        <!-- Left: Image Gallery -->
        <div class="pd-gallery" id="pd-gallery-root" data-active-index="0">
          <div class="pd-main-img-box">
            <img 
              id="detail-main-img"
              src="${escapeHtml(mainImage)}" 
              alt="${escapeHtml(product.name || product.p_name)}" 
              class="pd-main-img" 
              onerror="this.onerror=null; this.src='${fallbackImg}';"
            />

            ${images.length > 1 ? `
              <button type="button" class="pd-img-nav prev" aria-label="পূর্ববর্তী ছবি" onclick="window.__pdStepImage(-1);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button type="button" class="pd-img-nav next" aria-label="পরবর্তী ছবি" onclick="window.__pdStepImage(1);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <div id="pd-img-counter" class="pd-img-counter">1 / ${images.length}</div>
            ` : ""}
            
            ${discountPercent > 0 ? `
              <div class="pd-discount-badge">
                -${discountPercent}% ছাড়
              </div>
            ` : ""}

            <!-- Floating Favourite Toggle Button on Image -->
            <button 
              type="button"
              class="btn-toggle-favourite pd-fav-btn ${isFavourite ? 'is-favourite' : ''}"
              data-product-id="${productId}"
              data-product-name="${escapeHtml(product.name || product.p_name)}"
              data-product-price="${activePrice}"
              data-product-thumb="${escapeHtml(mainImage)}"
              data-product-json="${encodedJson}"
              title="${isFavourite ? 'ফেভারিট থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}"
              aria-label="Wishlist"
              onclick="window.toggleProductDetailFavourite(event, this);"
            >
              <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
          </div>

          <!-- Thumbnail Strip with Arrow Controls -->
          ${images.length > 1 ? `
            <div class="pd-thumb-wrap">
              ${images.length > 3 ? `
                <button type="button" class="pd-thumb-arrow prev" aria-label="বামে স্ক্রল করুন" onclick="window.__pdScrollThumbs(-1);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              ` : ""}

              <div class="pd-thumb-row" id="pd-thumb-row">
                ${images.map((img, i) => `
                  <button 
                    type="button"
                    class="thumb-btn pd-thumb-btn ${i === 0 ? 'border-emerald-500' : ''}"
                    data-img="${escapeHtml(img)}"
                    data-index="${i}"
                    onclick="window.__pdSelectImageByIndex(${i});"
                  >
                    <img src="${escapeHtml(img)}" alt="Thumbnail ${i + 1}" class="pd-thumb-img" onerror="this.onerror=null; this.src='${fallbackImg}';" />
                  </button>
                `).join("")}
              </div>

              ${images.length > 3 ? `
                <button type="button" class="pd-thumb-arrow next" aria-label="ডানে স্ক্রল করুন" onclick="window.__pdScrollThumbs(1);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ` : ""}
            </div>
          ` : ""}
        </div>

        <!-- Right: Product Information & Action Panel -->
        <div class="pd-info-panel">
          
          <div>
            <div class="pd-badge-row" style="margin-bottom: 10px;">
              <span class="pd-brand-badge">${product.brand || 'Dream Cart BD'}</span>
              <span class="pd-sku-tag">SKU: ${product.sku || productId}</span>
              ${product.category ? `<span class="pd-cat-badge">${product.category}</span>` : ""}
              
              <!-- Header Quick Favourite Pill -->
              <button 
                type="button" 
                class="btn-toggle-favourite pd-badge-fav ${isFavourite ? 'is-favourite' : ''}"
                data-product-id="${productId}"
                data-product-name="${escapeHtml(product.name || product.p_name)}"
                data-product-price="${activePrice}"
                data-product-thumb="${escapeHtml(mainImage)}"
                data-product-json="${encodedJson}"
                onclick="window.toggleProductDetailFavourite(event, this);"
                title="${isFavourite ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}"
              >
                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span id="detail-fav-badge-label">${isFavourite ? 'ফেভারিটে আছে' : 'ফেভারিট'}</span>
              </button>
            </div>

            <h1 class="pd-title">
              ${product.name || product.p_name}
            </h1>
          </div>

          <!-- Price Display Section -->
          <div class="pd-price-box">
            ${roleTitle ? `
              <div class="pd-role-title">
                ${roleTitle}
              </div>
            ` : ""}

            <div class="pd-price-row">
              <span class="pd-active-price">
                ${formatCurrency(activePrice)}
              </span>
              ${isDiscounted ? `
                <span class="pd-regular-price">
                  ${formatCurrency(originalPrice)}
                </span>
                <span style="font-size: 12px; font-weight: 800; color: #e11d48; background: #ffe4e6; padding: 2px 8px; border-radius: 6px;">
                  সাশ্রয়: ${formatCurrency(discountAmount)}
                </span>
              ` : ""}
              
              <!-- Stock Indicator -->
              <span class="pd-stock-pill ${isOutOfStock ? 'pd-stock-out' : 'pd-stock-in'}">
                ${isOutOfStock ? '● স্টক শেষ (প্রি-অর্ডার)' : `● স্টকে আছে (${stock} পিস)`}
              </span>
            </div>

            <!-- Wholesaler Minimum Order Quantity Warning -->
            ${isWholesale ? `
              <div class="pd-moq-alert">
                <span>⚠️</span> পাইকারি ক্রয়ের জন্য সর্বনিম্ন অর্ডার পরিমাণ (MOQ): <strong>${minOrderQty} পিস</strong>
              </div>
            ` : ""}
          </div>

          <!-- Interactive Color & Size Selectors -->
          <div class="pd-selector-section">
            
            <!-- Color Selector -->
            <div>
              <div class="pd-selector-header">
                <span class="pd-selector-title">
                  <span>🎨</span> কালার নির্বাচন করুন:
                </span>
                <span id="selected-color-label" class="pd-selected-value">
                  ${defaultColor}
                </span>
              </div>
              <div class="pd-chips-row" id="color-chips-container">
                ${availableColors.map((c, idx) => `
                  <button 
                    type="button" 
                    class="variant-chip color-select-btn pd-color-chip ${idx === 0 ? 'active' : ''}"
                    data-color="${c}"
                  >
                    <span class="pd-color-dot" style="background-color: ${getColorHex(c)};"></span>
                    <span>${c}</span>
                  </button>
                `).join("")}
              </div>
              <input type="hidden" id="selected-color" value="${defaultColor}" />
            </div>

            <!-- Size Selector -->
            <div>
              <div class="pd-selector-header">
                <span class="pd-selector-title">
                  <span>📏</span> সাইজ নির্বাচন করুন:
                </span>
                <span id="selected-size-label" class="pd-selected-value">
                  ${defaultSize}
                </span>
              </div>
              <div class="pd-chips-row" id="size-chips-container">
                ${availableSizes.map((s, idx) => `
                  <button 
                    type="button" 
                    class="variant-chip size-select-btn pd-size-chip ${idx === 0 ? 'active' : ''}"
                    data-size="${s}"
                  >
                    <span>${s}</span>
                  </button>
                `).join("")}
              </div>
              <input type="hidden" id="selected-size" value="${defaultSize}" />
            </div>

          </div>

          <!-- Quantity Selector -->
          <div class="pd-qty-row">
            <span class="pd-qty-label">অর্ডার পরিমাণ:</span>
            <div class="pd-qty-box">
              <button 
                type="button"
                class="pd-qty-btn"
                onclick="let inp = document.getElementById('product-qty-input'); let min = ${isWholesale ? minOrderQty : 1}; if(inp.value > min) inp.value--;"
              >
                −
              </button>
              <input 
                type="number" 
                id="product-qty-input" 
                value="${isWholesale ? minOrderQty : 1}" 
                min="${isWholesale ? minOrderQty : 1}" 
                max="${stock > 0 ? stock : 100}"
                class="pd-qty-input"
              />
              <button 
                type="button"
                class="pd-qty-btn"
                onclick="let inp = document.getElementById('product-qty-input'); inp.value++;"
              >
                +
              </button>
            </div>
            ${isWholesale ? `<span style="font-size: 11.5px; color: #b45309; font-weight: 700;">ন্যূনতম ${minOrderQty} পিস</span>` : ""}
          </div>

          <!-- Primary Call to Action Buttons -->
          <div class="pd-actions">
            
            <!-- Primary Order Button (Full Width, Dominant) -->
            ${isOutOfStock ? `
              <button 
                id="btn-detail-preorder" 
                class="pd-btn-order pd-btn-preorder"
                data-product-id="${productId}"
              >
                <span>⏳</span> প্রি-অর্ডার করুন (বুকিং)
              </button>
            ` : `
              <button 
                id="btn-detail-order-now" 
                class="pd-btn-order"
                data-product-id="${productId}"
              >
                <span>⚡</span> এখনই অর্ডার করুন
              </button>
            `}

            <!-- Secondary Action Row: Add to Cart + Add to Favourite / Wishlist -->
            <div class="pd-secondary-grid">
              
              <!-- Add to Cart -->
              <button 
                id="btn-detail-add-cart" 
                class="pd-btn-cart"
                data-product-id="${productId}"
              >
                <svg style="width: 18px; height: 18px; color: #10b981; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                <span>কার্টে যোগ করুন</span>
              </button>

              <!-- Favourite / Wishlist Button -->
              <button 
                type="button" 
                id="btn-detail-favourite"
                class="btn-toggle-favourite pd-btn-fav ${isFavourite ? 'is-favourite' : ''}"
                data-product-id="${productId}"
                data-product-name="${escapeHtml(product.name || product.p_name)}"
                data-product-price="${activePrice}"
                data-product-thumb="${escapeHtml(mainImage)}"
                data-product-json="${encodedJson}"
                title="${isFavourite ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}"
                aria-label="Wishlist"
                onclick="window.toggleProductDetailFavourite(event, this);"
              >
                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span id="detail-fav-btn-label">${isFavourite ? 'পছন্দের তালিকায় আছে' : 'পছন্দের তালিকায় রাখুন'}</span>
              </button>

            </div>

            <!-- WhatsApp Direct Hotline Inquiry Buttons -->
            <div class="pd-wa-grid">
              <a 
                href="${wa1Url}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="pd-wa-btn pd-wa-btn-1"
              >
                <svg style="width: 16px; height: 16px; fill: currentColor; flex-shrink: 0;" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.08-1.1l-.29-.17-3.12.82.83-3.04-.19-.3A8.13 8.13 0 0 1 3.8 11.91c0-4.54 3.69-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43l-.47-.01c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.42 1.01 2.59c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/></svg>
                <span>WhatsApp 1: 01581703822</span>
              </a>
              <a 
                href="${wa2Url}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="pd-wa-btn pd-wa-btn-2"
              >
                <svg style="width: 16px; height: 16px; fill: currentColor; flex-shrink: 0;" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.08-1.1l-.29-.17-3.12.82.83-3.04-.19-.3A8.13 8.13 0 0 1 3.8 11.91c0-4.54 3.69-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43l-.47-.01c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.42 1.01 2.59c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/></svg>
                <span>WhatsApp 2: 01818273838</span>
              </a>
            </div>
          </div>

          <!-- Trust & Service Badges -->
          <div class="pd-trust-grid">
            <div class="pd-trust-item">
              <span class="pd-trust-icon">🚚</span>
              <span>২-৩ দিনে ডেলিভারি</span>
            </div>
            <div class="pd-trust-item">
              <span class="pd-trust-icon">🛡️</span>
              <span>১০০% আসল পণ্য</span>
            </div>
            <div class="pd-trust-item">
              <span class="pd-trust-icon">🔄</span>
              <span>৭ দিনের রিপ্লেসমেন্ট</span>
            </div>
            <div class="pd-trust-item">
              <span class="pd-trust-icon">${isOutOfStock ? '🔒' : '💵'}</span>
              <span>${isOutOfStock ? 'নিরাপদ পেমেন্ট' : 'ক্যাশ অন ডেলিভারি'}</span>
            </div>
          </div>

        </div>

      </div>

      <!-- Product Description & Specifications Card -->
      <div class="pd-section-card">
        <h2 class="pd-section-title">
          <span>📋</span> পণ্যের পূর্ণ বিবরণ ও স্পেসিফিকেশন
        </h2>

        <div class="pd-desc-text">
          ${product.description || 'পণ্যটির বিস্তারিত বিবরণ শীঘ্রই যুক্ত করা হচ্ছে। পণ্য সংক্রান্ত যেকোনো তথ্যের জন্য আমাদের হেল্পলাইনে কল করুন।'}
        </div>

        ${product.specification ? `
          <div class="pd-spec-box">
            <div class="pd-spec-header">স্পেসিফিকেশন হাইলাইটস:</div>
            <div class="pd-spec-content">${product.specification}</div>
          </div>
        ` : ""}

        ${product.others ? `
          <div style="font-size: 12.5px; color: #64748b; margin-top: 14px;" class="dark:text-slate-400">
            <strong>অন্যান্য তথ্য:</strong> ${product.others}
          </div>
        ` : ""}
      </div>

      <!-- Customer Reviews & Rating Section -->
      <div class="pd-section-card" id="pd-reviews-section">
        <div class="pd-reviews-head">
          <div>
            <h3 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0;" class="dark:text-white">গ্রাহক রিভিউ ও রেটিং (Customer Reviews)</h3>
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0;">আমাদের ভেরিফাইড ক্রেতাদের অভিজ্ঞতা ও আপনার মতামত</p>
          </div>
          <div class="pd-rating-badge">
            <span>★ ${avgRatingVal}</span>
            <span id="pd-review-count-label" data-count="${displayedReviews.length}">(${displayedReviews.length} টি রিভিউ)</span>
          </div>
        </div>

        <!-- Write a Review Box (Login Required + Tracked Auto-Fill) -->
        <div class="pd-review-form-box">
          ${isLoggedInForReview && trackedReviewer ? `
            <form id="pd-write-review-form" data-product-sku="${escapeHtml(product.sku || productId)}" data-product-name="${escapeHtml(product.name || product.p_name || 'পণ্য')}" onsubmit="window.__pdSubmitProductReview(event)" class="space-y-3.5">
              <div class="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700/80">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="pd-reviewer-avatar" id="pd-reviewer-avatar-preview">
                    ${trackedReviewer.photo
                      ? `<img src="${escapeHtml(trackedReviewer.photo)}" alt="${escapeHtml(trackedReviewer.name)}" class="pd-reviewer-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><span class="pd-reviewer-avatar-fallback" style="display:none;">${escapeHtml((trackedReviewer.name || 'U').charAt(0).toUpperCase())}</span>`
                      : `<span class="pd-reviewer-avatar-fallback">${escapeHtml((trackedReviewer.name || 'U').charAt(0).toUpperCase())}</span>`
                    }
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                      <span>${escapeHtml(trackedReviewer.name)}</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">${escapeHtml(trackedReviewer.accountType)}</span>
                    </div>
                    <div class="text-[11px] text-slate-500 dark:text-slate-400">আপনার অ্যাকাউন্ট থেকে নাম ও ছবি অটো-ফিলাপ হয়েছে</div>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  ${[1, 2, 3, 4, 5].map(st => `
                    <button type="button" class="pd-star-pick-btn active" data-star="${st}" onclick="window.__pdSetReviewRating(${st})" title="${st} স্টার">★</button>
                  `).join('')}
                  <span id="pd-review-rating-label" class="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">৫/৫ — চমৎকার!</span>
                  <input type="hidden" id="pd-review-rating-val" value="5" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="pd-review-name-input" class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">আপনার নাম</label>
                  <input
                    type="text"
                    id="pd-review-name-input"
                    required
                    value="${escapeHtml(trackedReviewer.name)}"
                    class="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label for="pd-review-photo-input" class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">প্রোফাইল ছবি (অটো-ফিল / পরিবর্তন)</label>
                  <div class="flex items-center gap-2">
                    <input
                      type="text"
                      id="pd-review-photo-input"
                      value="${escapeHtml(trackedReviewer.photo)}"
                      placeholder="ছবির লিংক বা আপলোড করুন"
                      class="flex-1 py-2 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                    <label class="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-[11px] font-bold cursor-pointer transition flex-shrink-0">
                      📷 ছবি
                      <input type="file" accept="image/*" class="hidden" onchange="window.__pdHandleReviewPhotoFile(this)" />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label for="pd-review-comment-input" class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">আপনার রিভিউ লিখুন <span class="text-rose-500">*</span></label>
                <textarea
                  id="pd-review-comment-input"
                  required
                  rows="3"
                  placeholder="পণ্যটির মান, প্যাকেজিং ও ডেলিভারি সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
                  class="w-full p-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none leading-relaxed"
                ></textarea>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  id="pd-review-submit-btn"
                  class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  রিভিউ সাবমিট করুন
                </button>
              </div>
            </form>
          ` : `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg flex-shrink-0">✍️</div>
                <div>
                  <div class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">এই পণ্যটি সম্পর্কে রিভিউ লিখুন</div>
                  <p class="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">রিভিউ দিতে অনুগ্রহ করে আপনার কাস্টমার বা অন্য যেকোনো অ্যাকাউন্টে লগইন করুন।</p>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <a href="/customer/login" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition">কাস্টমার লগইন</a>
                <a href="/customer/register" class="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:border-emerald-500 transition">রেজিস্টার</a>
                <a href="/reseller/login" class="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold hover:border-emerald-500 transition">অন্যান্য অ্যাকাউন্ট</a>
              </div>
            </div>
          `}
        </div>

        <div class="pd-review-grid" id="pd-review-list-grid">
          ${displayedReviews.map(rv => {
            const rName = rv.customer_name || rv.customer || 'গ্রাহক';
            const rRating = Math.max(1, Math.min(5, Number(rv.rating) || 5));
            const rStars = '★'.repeat(rRating) + '☆'.repeat(5 - rRating);
            const rPhoto = rv.avatar || rv.image || '';
            const rInitial = (rName.charAt(0) || 'G').toUpperCase();
            return `
              <div class="pd-review-card">
                <div class="pd-review-user-row">
                  <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                    <div class="pd-reviewer-avatar">
                      ${rPhoto
                        ? `<img src="${escapeHtml(rPhoto)}" alt="${escapeHtml(rName)}" class="pd-reviewer-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><span class="pd-reviewer-avatar-fallback" style="display:none;">${escapeHtml(rInitial)}</span>`
                        : `<span class="pd-reviewer-avatar-fallback">${escapeHtml(rInitial)}</span>`
                      }
                    </div>
                    <div style="min-width:0;">
                      <div class="pd-review-name">${escapeHtml(rName)}</div>
                      <div style="font-size:10.5px; color:#94a3b8;">${escapeHtml(rv.date || 'ভেরিফাইড ক্রেতা')}</div>
                    </div>
                  </div>
                  <span class="pd-review-stars">${rStars}</span>
                </div>
                <p class="pd-review-text">${escapeHtml(rv.comment || '')}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Related Products Carousel -->
      ${related.length > 0 ? `
        <section style="margin-top: 32px;">
          <div class="pd-related-header">
            <h3 class="pd-related-title">সম্পর্কিত অন্যান্য পণ্য (Related Products)</h3>
            <a href="/products?cat=${encodeURIComponent(product.category || '')}" class="pd-related-link">আরও দেখুন →</a>
          </div>
          <div class="product-grid">
            ${related.map(p => renderProductCard(p)).join("")}
          </div>
        </section>
      ` : ""}

    </div>
  `;
}
