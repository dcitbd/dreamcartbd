/**
 * DREAM CART BD — PRODUCT CARD COMPONENT (ProductCard.js)
 * Implements user requirements:
 * - High-end modern responsive design with 2-grid mobile optimization
 * - All required elements: Image, Product Name, Original Price (Crossed), Selling Price,
 *   Stock, Discount Percentage, Order Now, Cart, Favourite, WhatsApp 1, WhatsApp 2, Reviews
 * - Perfectly sized Cart, Wishlist, and WhatsApp icons (strictly controlled dimensions, zero overflow)
 * - Uniform 2-line title clamping and 40-character safe truncation to prevent uneven cards
 * - Dual WhatsApp hotline direct chat links (01581703822 & 01818273838) with WhatsApp branding
 * - Fully functional Wishlist/Favourite toggle synced between image and store
 * - Dedicated rich scoped CSS for luxury e-commerce styling, micro-animations, and dark mode
 * - 100% backward/forward compatible with main.js event listeners and store state
 */

import { formatCurrency } from '../utils/format.js';
import { authStore } from '../store/authStore.js';
import { favouriteStore } from '../store/favouriteStore.js';

// Comprehensive CSS for Product Card Component
export const PRODUCT_CARD_STYLES = `
/* ==========================================================================
   DREAM CART BD — LUXURY RESPONSIVE PRODUCT CARD STYLING
   ========================================================================== */
.dc-product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.04);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
              box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
              border-color 0.25s ease;
  min-width: 0;
  box-sizing: border-box;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
}

.dark .dc-product-card {
  background-color: #0f172a;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.3);
}

.dc-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.4);
  border-color: rgba(16, 185, 129, 0.5);
}

.dark .dc-product-card:hover {
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(16, 185, 129, 0.4);
  border-color: rgba(16, 185, 129, 0.5);
}

/* Image Wrapper with 1:1 Aspect Ratio */
.dc-card-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background-color: #f8fafc;
}

.dark .dc-card-img-wrap {
  background-color: #1e293b;
}

.dc-card-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: block;
}

.dc-product-card:hover .dc-card-img-wrap img {
  transform: scale(1.06);
}

/* Floating Discount Badge (Top-Left) */
.dc-discount-pill {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 9999px;
  box-shadow: 0 3px 10px rgba(220, 38, 38, 0.35);
  letter-spacing: 0.3px;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* Floating Favourite / Wishlist Heart Button (Top-Right) */
.dc-fav-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0;
  outline: none;
}

.dark .dc-fav-btn {
  background: rgba(15, 23, 42, 0.88);
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}

.dc-fav-btn:hover {
  transform: scale(1.15);
  color: #f43f5e;
  border-color: #fecdd3;
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25);
}

.dc-fav-btn:active {
  transform: scale(0.95);
}

.dc-fav-btn.is-favourite {
  color: #f43f5e !important;
  background: #fff1f2 !important;
  border-color: #fecdd3 !important;
  box-shadow: 0 3px 10px rgba(244, 63, 94, 0.25);
}

.dark .dc-fav-btn.is-favourite {
  background: rgba(244, 63, 94, 0.2) !important;
  border-color: rgba(244, 63, 94, 0.4) !important;
}

.dc-fav-btn svg {
  width: 15px !important;
  height: 15px !important;
  max-width: 15px !important;
  max-height: 15px !important;
  display: block !important;
  transition: transform 0.2s ease;
}

/* Floating Stock Status Badge (Bottom-Left on image) */
.dc-stock-pill {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 10;
  font-size: 9.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: none;
}

.dc-stock-in {
  background: rgba(6, 95, 70, 0.9);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(6, 95, 70, 0.3);
}

.dc-stock-out {
  background: rgba(225, 29, 72, 0.92);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(225, 29, 72, 0.3);
}

.dc-pulse-dot {
  width: 5.5px;
  height: 5.5px;
  border-radius: 50%;
  background: #ffffff;
  animation: dcPulse 1.6s infinite ease-in-out;
}

@keyframes dcPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.75); }
}

/* Card Body Content */
.dc-card-body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
}

/* Brand & Reviews Header Row */
.dc-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 2px;
}

.dc-brand-text {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #059669;
  letter-spacing: 0.5px;
  max-width: 58%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .dc-brand-text {
  color: #34d399;
}

.dc-reviews-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 800;
  color: #b45309;
  background: #fef3c7;
  padding: 2px 7px;
  border-radius: 9999px;
  border: 1px solid #fde68a;
  white-space: nowrap;
}

.dark .dc-reviews-badge {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.25);
  color: #fbbf24;
}

.dc-reviews-star {
  color: #f59e0b;
  font-size: 11px;
}

/* Product Title with Strict 2-Line Clamp & Fixed Uniform Height */
.dc-card-title,
.product-card-title {
  font-size: 12.5px !important;
  font-weight: 700 !important;
  color: #0f172a !important;
  line-height: 1.35 !important;
  margin: 0 !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  min-height: 2.7em !important;
  max-height: 2.7em !important;
}

.dark .dc-card-title,
.dark .product-card-title {
  color: #f8fafc !important;
}

.dc-card-title a,
.product-card-title a {
  color: inherit !important;
  text-decoration: none !important;
  transition: color 0.15s ease !important;
}

.dc-card-title a:hover,
.product-card-title a:hover {
  color: #10b981 !important;
}

.dark .dc-card-title a:hover,
.dark .product-card-title a:hover {
  color: #34d399 !important;
}

/* Price Box */
.dc-price-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dc-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.dc-price-current {
  font-size: 16px;
  font-weight: 900;
  color: #065f46;
  font-family: 'Plus Jakarta Sans', monospace;
  line-height: 1.1;
}

.dark .dc-price-current {
  color: #34d399;
}

.dc-price-regular {
  font-size: 11px;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 600;
}

.dc-savings-tag {
  font-size: 9.5px;
  font-weight: 800;
  color: #e11d48;
  background: #ffe4e6;
  padding: 1.5px 6px;
  border-radius: 4px;
}

.dark .dc-savings-tag {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
}

.dc-role-badge {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  color: #047857;
  letter-spacing: 0.3px;
}

.dark .dc-role-badge {
  color: #34d399;
}

.dc-moq-alert {
  font-size: 9.5px;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
}

.dark .dc-moq-alert {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

/* Actions Section */
.dc-actions-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 4px;
}

/* Primary Action Row: Order Now (flex-1) + Quick Cart Button */
.dc-cta-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dc-btn-order {
  flex: 1;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 3px 10px -2px rgba(16, 185, 129, 0.4);
  white-space: nowrap;
  outline: none;
}

.dc-btn-order:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 16px -2px rgba(16, 185, 129, 0.5);
}

.dc-btn-order:active {
  transform: translateY(0);
}

.dc-btn-preorder {
  flex: 1;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 3px 10px -2px rgba(245, 158, 11, 0.4);
  white-space: nowrap;
  outline: none;
}

.dc-btn-preorder:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 16px -2px rgba(245, 158, 11, 0.5);
}

.dc-btn-preorder:active {
  transform: translateY(0);
}

.dc-btn-cart {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;
  flex-shrink: 0;
  outline: none;
}

.dark .dc-btn-cart {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.dc-btn-cart:hover {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
  transform: translateY(-1.5px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.dark .dc-btn-cart:hover {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.4);
}

.dc-btn-cart:active {
  transform: translateY(0);
}

.dc-btn-cart svg {
  width: 16px !important;
  height: 16px !important;
  max-width: 16px !important;
  max-height: 16px !important;
  display: block !important;
}

/* Secondary Action Row: Dual WhatsApp Hotlines (50% / 50% split) */
.dc-wa-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.dc-wa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6.5px 8px;
  border-radius: 9px;
  font-size: 9.5px;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

.dc-wa-btn-1 {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.dark .dc-wa-btn-1 {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.25);
}

.dc-wa-btn-1:hover {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.dc-wa-btn-2 {
  background: #ccfbf1;
  color: #0f766e;
  border: 1px solid #99f6e4;
}

.dark .dc-wa-btn-2 {
  background: rgba(20, 184, 166, 0.12);
  color: #2dd4bf;
  border-color: rgba(20, 184, 166, 0.25);
}

.dc-wa-btn-2:hover {
  background: #0d9488;
  color: #ffffff;
  border-color: #0d9488;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(13, 148, 136, 0.3);
}

.dc-wa-btn svg {
  width: 12px !important;
  height: 12px !important;
  max-width: 12px !important;
  max-height: 12px !important;
  display: block !important;
}

/* Mobile 2-Grid Responsive Optimization (Screen <= 640px) */
@media (max-width: 640px) {
  .dc-product-card {
    border-radius: 14px;
  }

  .dc-card-body {
    padding: 9px 10px 11px;
    gap: 6px;
  }

  .dc-discount-pill {
    top: 6px;
    left: 6px;
    font-size: 9px;
    padding: 2px 6px;
  }

  .dc-fav-btn {
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
  }

  .dc-fav-btn svg {
    width: 13px !important;
    height: 13px !important;
  }

  .dc-stock-pill {
    bottom: 6px;
    left: 6px;
    font-size: 8.5px;
    padding: 2px 5px;
  }

  .dc-brand-text {
    font-size: 9px;
  }

  .dc-reviews-badge {
    font-size: 9px;
    padding: 1.5px 5px;
  }

  .dc-card-title,
  .product-card-title {
    font-size: 11.5px !important;
    min-height: 2.6em !important;
    max-height: 2.6em !important;
    line-height: 1.3 !important;
  }

  .dc-price-current {
    font-size: 14px;
  }

  .dc-price-regular {
    font-size: 10px;
  }

  .dc-savings-tag {
    font-size: 8.5px;
  }

  .dc-cta-row {
    gap: 4px;
  }

  .dc-btn-order,
  .dc-btn-preorder {
    padding: 6.5px 8px;
    font-size: 11px;
    border-radius: 8px;
  }

  .dc-btn-cart {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .dc-btn-cart svg {
    width: 14px !important;
    height: 14px !important;
  }

  .dc-wa-row {
    gap: 4px;
  }

  .dc-wa-btn {
    padding: 5px 6px;
    font-size: 8.5px;
    border-radius: 7px;
    gap: 3px;
  }

  .dc-wa-btn svg {
    width: 10.5px !important;
    height: 10.5px !important;
  }
}
`;

// Safely mount styles to document head in browser once
if (typeof window !== 'undefined' && !window.__dcbdCardStylesMounted && typeof document !== 'undefined') {
  window.__dcbdCardStylesMounted = true;
  if (!document.getElementById('dc-product-card-styles')) {
    try {
      const s = document.createElement('style');
      s.id = 'dc-product-card-styles';
      s.textContent = PRODUCT_CARD_STYLES;
      document.head.appendChild(s);
    } catch(e) {}
  }
}

// Safe HTML escaper helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Global helper for instant, reliable Favourite toggle across all product cards
if (typeof window !== 'undefined' && !window.__toggleProductCardFavouriteAttached) {
  window.__toggleProductCardFavouriteAttached = true;
  window.toggleProductCardFavourite = function(e, btn) {
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

    if (!productObj && window.apiClient && window.apiClient.sheetProducts) {
      productObj = window.apiClient.sheetProducts.find(function(p) {
        return String(p.product_id || p.sku) === String(pId);
      });
    }

    if (!productObj) {
      try {
        var cached = localStorage.getItem('dcbd_sheet_products');
        if (cached) {
          var list = JSON.parse(cached);
          productObj = list.find(function(p) {
            return String(p.product_id || p.sku) === String(pId);
          });
        }
      } catch (err) {}
    }

    // Fallback minimal object if not found in sheets
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

    // Sync all favourite buttons on the page with this product ID
    var allCardBtns = document.querySelectorAll('.btn-toggle-favourite[data-product-id="' + pId + '"]');
    allCardBtns.forEach(function(el) {
      if (isAdded) {
        el.classList.add('is-favourite', 'text-rose-500', '!bg-rose-50');
        el.setAttribute('title', 'ফেভারিট থেকে সরান');
      } else {
        el.classList.remove('is-favourite', 'text-rose-500', '!bg-rose-50');
        el.setAttribute('title', 'ফেভারিট তালিকায় যোগ করুন');
      }
    });

    // Show toast message
    if (window.toast && window.toast.show) {
      window.toast.show({
        type: isAdded ? 'success' : 'info',
        title: isAdded ? 'পছন্দের তালিকায় যুক্ত হয়েছে' : 'পছন্দের তালিকা থেকে সরানো হয়েছে',
        message: productObj.name || productObj.p_name || 'পণ্য',
        duration: 2500
      });
    }

    // If currently on Favourite/Wishlist page, refresh to reflect changes immediately
    if (window.location.pathname.includes('/favourite') || window.location.pathname.includes('/wishlist')) {
      if (window.router) {
        window.router.resolve();
      }
    }
  };
}

export function renderProductCard(product) {
  const isWholesale = authStore.isWholesaler();
  const isReseller = authStore.isReseller();
  const productId = String(product.product_id || product.sku || '');
  const isFavourite = favouriteStore.has(productId);
  const stock = Number(product.stock !== undefined ? product.stock : 25);
  const isOutOfStock = stock <= 0;

  // Pricing calculations
  const originalPrice = Number(product.original_price || product.regular_price || product.selling_price || 0);
  const customerSellingPrice = Number(product.selling_price || product.price || 0);
  const wholesalePrice = Number(product.wholesale_price || Math.round(customerSellingPrice * 0.85));
  const resellerPrice = Number(product.reseller_price || Math.round(customerSellingPrice * 0.90));
  const minOrderQty = Number(product.min_order_qty || product.min_order_q || 5);

  let displayedPrice = customerSellingPrice;
  let roleLabel = "";
  if (isWholesale) {
    displayedPrice = wholesalePrice;
    roleLabel = "হোলসেল দর";
  } else if (isReseller) {
    displayedPrice = resellerPrice;
    roleLabel = "রিসেলার দর";
  }

  const isDiscounted = originalPrice > displayedPrice;
  const discountPercent = isDiscounted ? Math.round(((originalPrice - displayedPrice) / originalPrice) * 100) : 0;
  const discountSavings = isDiscounted ? (originalPrice - displayedPrice) : 0;

  const thumbnail = product.thumbnail || (product.images && product.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
  const brandName = product.brand || "Dream Cart BD";
  const sku = product.sku || productId;

  // Reviews & Rating
  const rating = Number(product.rating || 4.9).toFixed(1);
  const reviewCount = Number(product.reviews_count || product.review_count || product.reviews || 24);

  // Title character formatting & safe truncation (40 chars) so cards never break across grid rows
  const rawTitle = (product.name || product.p_name || "পণ্য").trim();
  const maxTitleChars = 40;
  const displayTitle = rawTitle.length > maxTitleChars 
    ? rawTitle.slice(0, maxTitleChars - 1).trim() + '…' 
    : rawTitle;

  const slug = product.slug || productId || "prod";

  // Safe minimal payload for instant offline/cache toggling
  const productPayload = {
    product_id: productId,
    sku: sku,
    name: rawTitle,
    slug: slug,
    brand: brandName,
    selling_price: customerSellingPrice,
    original_price: originalPrice,
    thumbnail: thumbnail,
    stock: stock,
    wholesale_price: wholesalePrice,
    reseller_price: resellerPrice,
    min_order_qty: minOrderQty
  };
  const encodedJson = encodeURIComponent(JSON.stringify(productPayload));

  // WhatsApp Message payloads
  const pageOrigin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'https://dreamcartbd.com';
  const pageUrl = pageOrigin + "/product/" + encodeURIComponent(slug);
  const waText = encodeURIComponent(`হ্যালো Dream Cart BD, আমি এই পণ্যটি সম্পর্কে জানতে চাই:\nপণ্য: ${rawTitle}\nSKU: ${sku}\nমূল্য: ৳${displayedPrice}\nলিঙ্ক: ${pageUrl}`);
  const wa1Url = `https://wa.me/8801581703822?text=${waText}`;
  const wa2Url = `https://wa.me/8801818273838?text=${waText}`;

  return `
    <div class="product-card dc-product-card group relative bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-card-hover transition-all duration-200 flex flex-col overflow-hidden" data-product-id="${productId}">
      
      <!-- Product Image Container -->
      <div class="dc-card-img-wrap relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        
        <!-- Clickable Image Link to Product Details -->
        <a href="/product/${slug}" class="block w-full h-full cursor-pointer card-img-click" data-slug="${slug}" data-product-id="${productId}">
          <img 
            src="${thumbnail}" 
            alt="${escapeHtml(rawTitle)}" 
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400 ease-out"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';"
          />
        </a>

        <!-- Discount Percentage Badge (Top-Left) -->
        ${discountPercent > 0 ? `
          <div class="dc-discount-pill">
            -${discountPercent}% ছাড়
          </div>
        ` : ""}

        <!-- Love / Favourite Icon (Top-Right Floating Circle) -->
        <button 
          type="button"
          class="btn-toggle-favourite dc-fav-btn ${isFavourite ? 'is-favourite' : ''}"
          data-product-id="${productId}"
          data-product-name="${escapeHtml(rawTitle)}"
          data-product-price="${displayedPrice}"
          data-product-thumb="${thumbnail}"
          data-product-json="${encodedJson}"
          title="${isFavourite ? 'ফেভারিট থেকে সরান' : 'ফেভারিট তালিকায় যোগ করুন'}"
          aria-label="Wishlist"
          onclick="window.toggleProductCardFavourite(event, this);"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" class="pointer-events-none" style="width: 15px; height: 15px; max-width: 15px; max-height: 15px;">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>

        <!-- Stock Status Pill (Bottom-Left on image) -->
        <div class="dc-stock-pill ${isOutOfStock ? 'dc-stock-out' : 'dc-stock-in'}">
          ${isOutOfStock ? `
            <span>● স্টক শেষ</span>
          ` : `
            <span class="dc-pulse-dot"></span>
            <span>স্টক: ${stock}</span>
          `}
        </div>

      </div>

      <!-- Card Body Content -->
      <div class="dc-card-body flex-1 flex flex-col justify-between">
        
        <div>
          <!-- Brand & Customer Reviews Row -->
          <div class="dc-meta-row">
            <span class="dc-brand-text truncate">${escapeHtml(brandName)}</span>
            <div class="dc-reviews-badge">
              <span class="dc-reviews-star">★</span>
              <span>${rating} (${reviewCount})</span>
            </div>
          </div>

          <!-- Product Name (Strict 2-line clamp with uniform height) -->
          <h3 
            class="dc-card-title product-card-title" 
            title="${escapeHtml(rawTitle)}"
          >
            <a href="/product/${slug}" class="hover:text-emerald-600 transition card-img-click" data-slug="${slug}" data-product-id="${productId}">
              ${escapeHtml(displayTitle)}
            </a>
          </h3>
        </div>

        <!-- Price Section based on account type -->
        <div class="dc-price-box">
          ${roleLabel ? `
            <div class="dc-role-badge">
              ${roleLabel}
            </div>
          ` : ""}

          <div class="dc-price-row">
            <span class="dc-price-current">
              ${formatCurrency(displayedPrice)}
            </span>
            ${isDiscounted ? `
              <span class="dc-price-regular">
                ${formatCurrency(originalPrice)}
              </span>
              <span class="dc-savings-tag">
                সাশ্রয়: ${formatCurrency(discountSavings)}
              </span>
            ` : ""}
          </div>

          <!-- Wholesaler Minimum Order Quantity Warning -->
          ${isWholesale ? `
            <div class="dc-moq-alert">
              <span>⚠️</span> সর্বনিম্ন: ${minOrderQty} পিস
            </div>
          ` : ""}
        </div>

        <!-- Actions Section (Order CTA + Cart + Dual WhatsApp) -->
        <div class="dc-actions-wrap">
          
          <!-- Primary CTA Row: Order Now (flex-1) + Quick Add to Cart -->
          <div class="dc-cta-row">
            ${isOutOfStock ? `
              <button 
                type="button"
                class="btn-pre-order dc-btn-order dc-btn-preorder"
                data-product-id="${productId}"
              >
                <span>⏳</span>
                <span>প্রি-অর্ডার</span>
              </button>
            ` : `
              <button 
                type="button"
                class="btn-order-now dc-btn-order"
                data-product-id="${productId}"
              >
                <span>⚡</span>
                <span>অর্ডার করুন</span>
              </button>
            `}

            <!-- Cart Icon Button -->
            <button 
              type="button"
              class="btn-quick-add dc-btn-cart"
              data-product-id="${productId}"
              title="কার্টে যোগ করুন"
              aria-label="Add to Cart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none" style="width: 16px; height: 16px; max-width: 16px; max-height: 16px;">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </button>
          </div>

          <!-- Secondary Action Row: Dual WhatsApp Hotlines (50% / 50% split) -->
          <div class="dc-wa-row">
            <a 
              href="${wa1Url}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="dc-wa-btn dc-wa-btn-1"
              title="WhatsApp: 01581703822"
              aria-label="WhatsApp 1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="pointer-events-none" style="width: 12px; height: 12px; max-width: 12px; max-height: 12px;">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.08-1.1l-.29-.17-3.12.82.83-3.04-.19-.3A8.13 8.13 0 0 1 3.8 11.91c0-4.54 3.69-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43l-.47-.01c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.42 1.01 2.59c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/>
              </svg>
              <span>WA ১</span>
            </a>

            <a 
              href="${wa2Url}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="dc-wa-btn dc-wa-btn-2"
              title="WhatsApp: 01818273838"
              aria-label="WhatsApp 2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="pointer-events-none" style="width: 12px; height: 12px; max-width: 12px; max-height: 12px;">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.08-1.1l-.29-.17-3.12.82.83-3.04-.19-.3A8.13 8.13 0 0 1 3.8 11.91c0-4.54 3.69-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43l-.47-.01c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.42 1.01 2.59c.13.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/>
              </svg>
              <span>WA ২</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  `;
}
