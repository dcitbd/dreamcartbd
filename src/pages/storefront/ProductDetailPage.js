/**
 * ============================================================================
 * DREAM CART BD — PRODUCT DETAILS PAGE (ProductDetailPage.js)
 * ============================================================================
 */

import { Header } from "../../components/Header.js";
import { Footer } from "../../components/Footer.js";
import { CartDrawer } from "../../components/CartDrawer.js";
import { ProductAPI } from "../../api/products.js";
import { store } from "../../js/store.js";
import { router } from "../../js/router.js";

export const ProductDetailPage = async (params = {}) => {
  const productId = params.id;
  let product = null;

  try {
    product = await ProductAPI.getById(productId);
  } catch (e) {
    console.error("Product load failed:", e);
  }

  if (!product) {
    return `<div class="min-h-screen flex items-center justify-center"><h2 class="text-xl font-bold">প্রোডাক্ট পাওয়া যায়নি।</h2></div>`;
  }

  const images = product.images && product.images.length > 0 ? product.images : [{ image_url: product.thumbnail || 'https://placehold.co/500x500' }];
  const variants = product.variants || [];

  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header.render()}

      <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        <!-- Breadcrumb -->
        <nav class="text-xs text-slate-400 font-semibold mb-6">
          <a href="/" class="hover:text-brand-500">হোম</a> / <a href="/products" class="hover:text-brand-500">প্রোডাক্ট</a> / <span class="text-slate-600 dark:text-slate-200">${product.product_name}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <!-- Left: 10-Image Gallery System -->
          <div class="lg:col-span-6 space-y-4">
            <div class="glass-panel p-6 rounded-3xl overflow-hidden bg-white flex items-center justify-center h-[420px] shadow-sm">
              <img id="main-product-image" src="${images[0]?.image_url}" class="max-h-full object-contain transition-all duration-300" />
            </div>

            <!-- Thumbnail Carousel -->
            <div class="flex gap-3 overflow-x-auto pb-2">
              ${images.map((img, idx) => `
                <button onclick="document.getElementById('main-product-image').src='${img.image_url}'" class="w-16 h-16 rounded-xl border-2 border-slate-200 hover:border-brand-500 p-1 bg-white shrink-0 overflow-hidden transition-all">
                  <img src="${img.image_url}" class="w-full h-full object-cover rounded-lg" />
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Right: Product Information & Purchase Panel -->
          <div class="lg:col-span-6 space-y-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="badge-success text-xs">ইন স্টক</span>
                <span class="text-xs text-slate-400 font-bold uppercase">SKU: ${product.sku || 'N/A'}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                ${product.product_name}
              </h1>
            </div>

            <!-- Price & Savings -->
            <div class="p-4 rounded-2xl bg-brand-50/60 dark:bg-slate-800/60 border border-brand-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-500 dark:text-slate-400">অফার মূল্য:</span>
                <div class="flex items-baseline gap-3">
                  <h3 class="text-3xl font-black text-brand-600 dark:text-brand-400">৳${product.selling_price || product.regular_price}</h3>
                  ${product.regular_price > product.selling_price ? `
                    <span class="text-sm text-slate-400 line-through">৳${product.regular_price}</span>
                  ` : ''}
                </div>
              </div>
              ${product.regular_price > product.selling_price ? `
                <span class="badge-danger px-3 py-1 text-xs font-bold">
                  ৳${product.regular_price - product.selling_price} সাশ্রয়
                </span>
              ` : ''}
            </div>

            <!-- Variants Selection (if exists) -->
            ${variants.length > 0 ? `
              <div class="space-y-3">
                <label class="text-xs font-bold uppercase text-slate-500">ভ্যারিয়েন্ট বাছাই করুন:</label>
                <div class="flex flex-wrap gap-2">
                  ${variants.map((v, i) => `
                    <button class="variant-option-btn px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-900 transition-all ${i === 0 ? 'ring-2 ring-brand-500 border-transparent' : ''}">
                      ${v.variant_name} (৳${v.selling_price})
                    </button>
                  `).join("")}
                </div>
              </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 pt-4">
              <button onclick="window.store.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" class="flex-1 btn-secondary py-3.5 text-base flex items-center justify-center gap-2">
                <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                <span>কার্টে যোগ করুন</span>
              </button>
              <button id="direct-buy-now-btn" class="flex-1 btn-primary py-3.5 text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25">
                <i data-lucide="zap" class="w-5 h-5"></i>
                <span>এখনই অর্ডার করুন</span>
              </button>
            </div>

            <!-- Delivery Trust Box -->
            <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p class="flex items-center gap-2"><i data-lucide="truck" class="w-4 h-4 text-emerald-500"></i> সারা বাংলাদেশে ২-৩ দিনে ক্যাশ অন হোম ডেলিভারি</p>
              <p class="flex items-center gap-2"><i data-lucide="shield-check" class="w-4 h-4 text-brand-500"></i> ১০০% অরিজিনাল প্রোডাক্ট গ্যারান্টি</p>
            </div>

          </div>

        </div>
      </main>

      <div id="cart-drawer-root">${CartDrawer.render()}</div>
      ${Footer.render()}
    </div>
  `;
};
