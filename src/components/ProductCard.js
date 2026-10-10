/**
 * DREAM CART BD — PRODUCT CARD COMPONENT (ProductCard.js)
 * Implements user requirements:
 * - Fully functional Favourite / Wishlist toggle that instantly saves products to Favourite page
 * - High-contrast text and background colors for both Light & Dark modes
 * - Direct clickable product link on Image and Title to open Product Details
 * - Image container with top-left Love/Wishlist button (non-conflicting sibling to product link)
 * - Discount percentage badge & stock status pill
 * - Brand Name + SKU + 2-line truncated title
 * - Role-based pricing (Customer, Reseller, Wholesaler) with minimum order quantity alert
 * - Order Now / Pre-order CTA button
 * - Quick action toolbar: Cart Icon + Favourite Icon + WhatsApp 1 + WhatsApp 2
 */

import { formatCurrency } from '../utils/format.js';
import { authStore } from '../store/authStore.js';
import { favouriteStore } from '../store/favouriteStore.js';

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

  const thumbnail = product.thumbnail || (product.images && product.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
  const brandName = product.brand || "Dream Cart BD";
  const sku = product.sku || productId;
  const productName = product.name || product.p_name || "পণ্য";
  const slug = product.slug || productId || "prod";

  // Safe minimal payload for instant offline/cache toggling
  const productPayload = {
    product_id: productId,
    sku: sku,
    name: productName,
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
  const waText = encodeURIComponent(`হ্যালো Dream Cart BD, আমি এই পণ্যটি সম্পর্কে জানতে চাই:\nপণ্য: ${productName}\nSKU: ${sku}\nমূল্য: ৳${displayedPrice}\nলিঙ্ক: ${pageUrl}`);
  const wa1Url = `https://wa.me/8801581703822?text=${waText}`;
  const wa2Url = `https://wa.me/8801818273838?text=${waText}`;

  return `
    <div class="product-card group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden" data-product-id="${productId}">
      
      <!-- Product Image Container -->
      <div class="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        
        <!-- Clickable Image Link to Product Details -->
        <a href="/product/${slug}" class="block w-full h-full cursor-pointer card-img-click" data-slug="${slug}" data-product-id="${productId}">
          <img 
            src="${thumbnail}" 
            alt="${productName}" 
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';"
          />
        </a>

        <!-- Love / Favourite Icon (Front top-left overlay) -->
        <button 
          type="button"
          class="btn-toggle-favourite absolute top-2.5 left-2.5 z-20 w-9 h-9 rounded-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60 ${isFavourite ? 'is-favourite text-rose-500 !bg-rose-50 dark:!bg-rose-950/50' : 'text-slate-400 hover:text-rose-500'}"
          data-product-id="${productId}"
          data-product-name="${productName.replace(/"/g, '&quot;')}"
          data-product-price="${displayedPrice}"
          data-product-thumb="${thumbnail}"
          data-product-json="${encodedJson}"
          title="${isFavourite ? 'ফেভারিট থেকে সরান' : 'ফেভারিট তালিকায় যোগ করুন'}"
          aria-label="Wishlist"
          onclick="window.toggleProductCardFavourite(event, this);"
        >
          <svg class="w-5 h-5 fill-current pointer-events-none" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>

        <!-- Discount Percentage Badge (Front top-right) -->
        ${discountPercent > 0 ? `
          <div class="absolute top-2.5 right-2.5 z-10 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-md">
            -${discountPercent}%
          </div>
        ` : ""}

        <!-- Stock Status Pill (Bottom Left overlay) -->
        <div class="absolute bottom-2 left-2 z-10">
          ${isOutOfStock ? `
            <span class="bg-rose-600/90 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
              স্টক শেষ (প্রি-অর্ডার)
            </span>
          ` : `
            <span class="bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              স্টক: ${stock} পিস
            </span>
          `}
        </div>

      </div>

      <!-- Card Body -->
      <div class="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        
        <!-- Brand Name + SKU -->
        <div>
          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 gap-2">
            <span class="truncate hover:text-emerald-600 transition">${brandName}</span>
            <span class="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">${sku}</span>
          </div>

          <!-- Product Name (2 line clamp with clickable link) -->
          <h3 
            class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2 leading-snug mb-2" 
            title="${productName}"
          >
            <a href="/product/${slug}" class="hover:text-emerald-600 transition card-img-click" data-slug="${slug}" data-product-id="${productId}">
              ${productName}
            </a>
          </h3>
        </div>

        <hr class="border-slate-100 dark:border-slate-800 my-2" />

        <!-- Price Section based on account type -->
        <div class="space-y-1">
          ${roleLabel ? `
            <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              ${roleLabel}
            </div>
          ` : ""}

          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              ${formatCurrency(displayedPrice)}
            </span>
            ${isDiscounted ? `
              <span class="text-xs text-slate-400 dark:text-slate-500 line-through">
                ${formatCurrency(originalPrice)}
              </span>
            ` : ""}
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              (${stock} পিস মজুদ)
            </span>
          </div>

          <!-- Wholesaler Minimum Order Quantity Warning -->
          ${isWholesale ? `
            <div class="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md mt-1">
              <span>⚠️</span> সর্বনিম্ন অর্ডার পরিমাণ: ${minOrderQty} পিস
            </div>
          ` : ""}
        </div>

        <hr class="border-slate-100 dark:border-slate-800 my-2" />

        <!-- Order Action Button (Order Now vs Pre Order) -->
        <div class="space-y-2">
          ${isOutOfStock ? `
            <button 
              type="button"
              class="btn-pre-order w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              data-product-id="${productId}"
            >
              <span>⏳</span> প্রি-অর্ডার করুন
            </button>
          ` : `
            <button 
              type="button"
              class="btn-order-now w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              data-product-id="${productId}"
            >
              <span>⚡</span> অর্ডার করুন
            </button>
          `}

          <!-- Quick Action Icon Toolbar: Cart Icon + Favourite Icon + Send WhatsApp 1 + Send WhatsApp 2 -->
          <div class="grid grid-cols-4 gap-1.5 pt-1">
            
            <!-- Cart Icon -->
            <button 
              type="button"
              class="btn-quick-add bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/50 text-slate-700 hover:text-emerald-600 dark:text-slate-300 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 transition flex items-center justify-center cursor-pointer"
              data-product-id="${productId}"
              title="কার্টে যোগ করুন"
              aria-label="Add to Cart"
            >
              <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </button>

            <!-- Favourite Icon (Bottom toolbar) -->
            <button 
              type="button"
              class="btn-toggle-favourite bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/50 text-slate-700 hover:text-rose-600 dark:text-slate-300 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 transition flex items-center justify-center cursor-pointer ${isFavourite ? 'is-favourite text-rose-500 !bg-rose-50 dark:!bg-rose-950/50' : ''}"
              data-product-id="${productId}"
              data-product-name="${productName.replace(/"/g, '&quot;')}"
              data-product-price="${displayedPrice}"
              data-product-thumb="${thumbnail}"
              data-product-json="${encodedJson}"
              title="${isFavourite ? 'ফেভারিট থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}"
              aria-label="Wishlist"
              onclick="window.toggleProductCardFavourite(event, this);"
            >
              <svg class="w-4 h-4 fill-current pointer-events-none" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>

            <!-- Send WhatsApp 1 -->
            <a 
              href="${wa1Url}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800 transition flex items-center justify-center text-[10px] font-bold"
              title="WhatsApp: 01581703822"
              aria-label="WhatsApp 1"
            >
              <span>WA 1</span>
            </a>

            <!-- Send WhatsApp 2 -->
            <a 
              href="${wa2Url}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 p-2 rounded-xl border border-teal-200 dark:border-teal-800 transition flex items-center justify-center text-[10px] font-bold"
              title="WhatsApp: 01818273838"
              aria-label="WhatsApp 2"
            >
              <span>WA 2</span>
            </a>

          </div>

        </div>

      </div>

    </div>
  `;
}
