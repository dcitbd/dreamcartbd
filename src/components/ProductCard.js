/**
 * DREAM CART BD — PRODUCT CARD COMPONENT
 * Rich badges, price display, quick add to cart, wishlist heart.
 */

import { formatCurrency } from '../utils/format.js';

export function renderProductCard(product) {
  const isDiscounted = product.regular_price && product.regular_price > product.selling_price;
  const discountPercent = product.discount_percent || (isDiscounted ? Math.round(((product.regular_price - product.selling_price) / product.regular_price) * 100) : 0);

  return `
    <div class="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 flex flex-col relative" data-product-id="${product.product_id}">
      
      <!-- Image & Badges -->
      <div class="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer card-img-click" data-slug="${product.slug}">
        <img 
          src="${product.thumbnail}" 
          alt="${product.name}" 
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <!-- Discount Ribbon Badge -->
        ${discountPercent > 0 ? `
          <div class="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-md">
            -${discountPercent}%
          </div>
        ` : ""}

        <!-- Stock Status Badge -->
        <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[10px] font-bold text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 shadow-sm flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          In Stock
        </div>
      </div>

      <!-- Content -->
      <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
          <!-- Seller name tag -->
          <div class="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <span>By ${product.seller_name || "Dream Cart BD"}</span>
            <svg class="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          </div>

          <!-- Product Title -->
          <h3 class="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-2 mb-2 leading-snug cursor-pointer card-img-click" data-slug="${product.slug}">
            ${product.name}
          </h3>

          <!-- Rating -->
          <div class="flex items-center gap-1 mb-3">
            <div class="flex text-amber-400 text-xs">
              ★ ★ ★ ★ ★
            </div>
            <span class="text-[11px] text-slate-500 font-medium">(${product.reviews_count || 24})</span>
          </div>
        </div>

        <!-- Pricing & Action Button -->
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div class="text-base font-extrabold text-slate-900">
              ${formatCurrency(product.selling_price)}
            </div>
            ${isDiscounted ? `
              <div class="text-xs text-slate-400 line-through">
                ${formatCurrency(product.regular_price)}
              </div>
            ` : ""}
          </div>

          <!-- Quick Add Button -->
          <button 
            class="btn-quick-add bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white p-2.5 rounded-xl shadow-sm transition flex items-center justify-center"
            data-product-id="${product.product_id}"
            title="Add to Cart"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </button>
        </div>

      </div>

    </div>
  `;
}
