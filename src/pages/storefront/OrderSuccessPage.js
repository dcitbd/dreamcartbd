/**
 * ============================================================================
 * DREAM CART BD — PRODUCT DETAILS & 10-IMAGE GALLERY (ProductDetailPage.js)
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
    console.error("Product load error:", e);
  }

  if (!product) {
    return `
      <div class="min-h-screen flex flex-col font-bengali">
        ${Header.render()}
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <i data-lucide="package-x" class="w-8 h-8"></i>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">প্রোডাক্টটি পাওয়া যায়নি!</h2>
          <p class="text-slate-500 text-xs mb-6">হয়তো প্রোডাক্টটি রিমুভ করা হয়েছে বা স্টক শেষ।</p>
          <a href="/products" class="btn-primary text-xs px-6 py-2.5">অন্যান্য প্রোডাক্ট দেখুন</a>
        </div>
        ${Footer.render()}
      </div>
    `;
  }

  const images = product.images && product.images.length > 0 ? product.images : [{ image_url: product.thumbnail || 'https://placehold.co/600x600' }];
  const variants = product.variants || [];

  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header.render()}

      <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <!-- Breadcrumb -->
        <nav class="text-xs text-slate-400 font-semibold mb-6 flex items-center gap-1.5">
          <a href="/" class="hover:text-brand-500">হোম</a>
          <span>/</span>
          <a href="/products" class="hover:text-brand-500">প্রোডাক্টস</a>
          <span>/</span>
          <span class="text-slate-700 dark:text-slate-200 truncate max-w-[200px] sm:max-w-md">${product.product_name}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <!-- Left: 10-Image Gallery System -->
          <div class="lg:col-span-6 space-y-4">
            <div class="glass-panel p-6 rounded-3xl overflow-hidden bg-white flex items-center justify-center h-[380px] sm:h-[450px] shadow-sm border border-slate-200 dark:border-slate-800">
              <img id="main-product-image" src="${images[0]?.image_url}" class="max-h-full object-contain transition-all duration-300 hover:scale-105" />
            </div>

            <!-- Thumbnail Carousel -->
            <div class="flex gap-3 overflow-x-auto pb-2">
              ${images.map((img) => `
                <button onclick="document.getElementById('main-product-image').src='${img.image_url}'" class="w-16 h-16 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-brand-500 p-1 bg-white shrink-0 overflow-hidden transition-all">
                  <img src="${img.image_url}" class="w-full h-full object-cover rounded-xl" />
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Right: Product Information & Purchase Panel -->
          <div class="lg:col-span-6 space-y-6">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="${Number(product.stock || 0) > 0 ? 'badge-success' : 'badge-danger'} text-xs font-bold">
                  ${Number(product.stock || 0) > 0 ? 'ইন স্টক' : 'স্টক আউট'}
                </span>
                <span class="text-xs text-slate-400 font-mono font-bold uppercase">SKU: ${product.sku || 'DCBD'}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                ${product.product_name}
              </h1>
            </div>

            <!-- Price & Savings -->
            <div class="p-4 sm:p-5 rounded-2xl bg-brand-50/60 dark:bg-slate-800/60 border border-brand-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-500 dark:text-slate-400">অফার মূল্য:</span>
                <div class="flex items-baseline gap-3 mt-0.5">
                  <h3 class="text-3xl font-black text-brand-600 dark:text-brand-400">৳${product.selling_price || product.regular_price}</h3>
                  ${product.regular_price > product.selling_price ? `
                    <span class="text-sm text-slate-400 line-through">৳${product.regular_price}</span>
                  ` : ''}
                </div>
              </div>
              ${product.regular_price > product.selling_price ? `
                <span class="badge-danger px-3 py-1.5 text-xs font-bold shadow-sm">
                  ৳${product.regular_price - product.selling_price} সাশ্রয়
                </span>
              ` : ''}
            </div>

            <!-- Variants Selection -->
            ${variants.length > 0 ? `
              <div class="space-y-3">
                <label class="text-xs font-bold uppercase text-slate-500">ভ্যারিয়েন্ট বাছাই করুন:</label>
                <div class="flex flex-wrap gap-2">
                  ${variants.map((v, i) => `
                    <button class="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-brand-500 bg-white dark:bg-slate-900 transition-all ${i === 0 ? 'ring-2 ring-brand-500 border-transparent text-brand-600' : 'text-slate-700 dark:text-slate-300'}">
                      ${v.variant_name} (৳${v.selling_price})
                    </button>
                  `).join("")}
                </div>
              </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button onclick="window.store.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" class="flex-1 btn-secondary py-3.5 text-sm font-bold flex items-center justify-center gap-2">
                <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                <span>কার্টে যোগ করুন</span>
              </button>
              <button onclick="window.directCheckoutOrder(${JSON.stringify(product).replace(/"/g, '&quot;')})" class="flex-1 btn-primary py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25">
                <i data-lucide="zap" class="w-4 h-4"></i>
                <span>এখনই অর্ডার করুন</span>
              </button>
            </div>

            <!-- Delivery Trust Box -->
            <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-slate-900/40">
              <p class="flex items-center gap-2.5">
                <i data-lucide="truck" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                <span>সারা বাংলাদেশে ২-৩ দিনে ক্যাশ অন হোম ডেলিভারি</span>
              </p>
              <p class="flex items-center gap-2.5">
                <i data-lucide="shield-check" class="w-4 h-4 text-brand-500 shrink-0"></i>
                <span>১০০% অরিজিনাল প্রোডাক্ট ও সহজ ৭ দিনের রিটার্ন গ্যারান্টি</span>
              </p>
            </div>

          </div>

        </div>
      </main>

      <div id="cart-drawer-root">${CartDrawer.render()}</div>
      ${Footer.render()}
    </div>
  `;
};

window.directCheckoutOrder = (product) => {
  store.addToCart(product, 1);
  router.navigate("/checkout");
};

export default ProductDetailPage;
