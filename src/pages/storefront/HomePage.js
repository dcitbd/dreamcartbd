/**
 * ============================================================================
 * DREAM CART BD — STOREFRONT HOME PAGE (HomePage.js)
 * ============================================================================
 */

import { Header } from "../../components/Header.js";
import { Footer } from "../../components/Footer.js";
import { CartDrawer } from "../../components/CartDrawer.js";
import { ProductAPI } from "../../api/products.js";
import { store } from "../../js/store.js";

export const HomePage = async () => {
  let products = [];
  let categories = [];

  try {
    const prodRes = await ProductAPI.getAll();
    products = prodRes.items || prodRes || [];
    const catRes = await ProductAPI.getCategoryTree();
    categories = catRes || [];
  } catch (e) {
    console.error("Home data fetch error:", e);
  }

  // Window Cache for Safe Cart Lookup
  window._homeProducts = products;

  const flashDeals = products.slice(0, 4);
  const bestSellers = products.slice(0, 8);
  const featuredDeal = flashDeals[0] || {
    product_id: "PRD-FEATURED",
    product_name: "স্মার্ট গ্যাজেট ও ইলেকট্রনিক্স কালেকশন",
    regular_price: 2500,
    selling_price: 1950,
    thumbnail: "https://placehold.co/500x400"
  };

  return `
    <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-luxury-dark font-bengali">
      ${Header.render()}

      <main class="flex-1">
        
        <!-- Hero Banner Section -->
        <section class="relative overflow-hidden py-12 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white">
          <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold tracking-wide uppercase">
                  <i data-lucide="zap" class="w-4 h-4 text-amber-400"></i> প্রিমিয়াম ডিজিটাল কমার্স
                </div>
                <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                  সেরা পণ্য, সেরা দাম <br />
                  <span class="bg-gradient-to-r from-brand-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                    সরাসরি আপনার দরজায়
                  </span>
                </h1>
                <p class="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                  Dream Cart BD-তে পাচ্ছেন ১০০% খাঁটি পণ্য, দ্রুততম হোম ডেলিভারি এবং সহজ ৭ দিনের রিটার্ন সুবিধা।
                </p>
                <div class="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                  <a href="/products" class="btn-primary px-8 py-3.5 text-base flex items-center gap-2 shadow-lg shadow-brand-500/30">
                    <span>শপ এক্সপ্লোর করুন</span>
                    <i data-lucide="arrow-right" class="w-5 h-5"></i>
                  </a>
                  <a href="/track-order" class="btn-secondary px-8 py-3.5 text-base text-white border-slate-700 bg-slate-800/80 hover:bg-slate-700">
                    অর্ডার ট্র্যাকিং
                  </a>
                </div>
              </div>

              <!-- Hero Floating Deal Card -->
              <div class="lg:col-span-5 flex justify-center">
                <div class="relative w-full max-w-sm">
                  <div class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500 to-amber-500 opacity-30 blur-xl animate-pulse"></div>
                  <div class="relative glass-panel p-6 rounded-3xl border border-white/10 text-slate-900 dark:text-white shadow-2xl bg-white/95 dark:bg-slate-900/90">
                    <span class="badge-danger text-xs font-bold mb-3 inline-block">ফ্ল্যাশ সেল চলছে!</span>
                    <img src="${featuredDeal.thumbnail || 'https://placehold.co/400x300'}" class="w-full h-52 object-contain rounded-2xl mb-4 bg-slate-100 dark:bg-slate-800 p-2" />
                    <h3 class="text-base font-bold truncate">${featuredDeal.product_name}</h3>
                    <div class="flex items-center justify-between mt-3">
                      <div>
                        <span class="text-xs text-slate-400 line-through">৳${featuredDeal.regular_price || 2500}</span>
                        <h4 class="text-2xl font-extrabold text-brand-600 dark:text-brand-400">৳${featuredDeal.selling_price || 1950}</h4>
                      </div>
                      <button onclick="window.quickAddToCart('${featuredDeal.product_id}')" class="btn-primary py-2 px-4 text-xs font-bold shadow-md">
                        কার্টে নিন
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- Featured Categories Section -->
        <section class="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">ফিচার্ড ক্যাটাগরি</h2>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">আপনার প্রয়োজনীয় ক্যাটাগরি বাছাই করুন</p>
            </div>
            <a href="/categories" class="text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              সব দেখুন <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </a>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            ${(categories.length > 0 ? categories.slice(0, 6) : [
              { category_name: "ইলেকট্রনিক্স", icon: "laptop" },
              { category_name: "ফ্যাশন ও লাইফস্টাইল", icon: "shirt" },
              { category_name: "ক্যামেরা ও লেন্স", icon: "camera" },
              { category_name: "স্মার্ট ওয়াচ", icon: "watch" },
              { category_name: "হোম অ্যাপ্লায়েন্স", icon: "home" },
              { category_name: "অডিও ও হেডফোন", icon: "headphones" }
            ]).map(cat => `
              <a href="/products?category=${cat.category_id || ''}" class="glass-panel p-5 rounded-2xl text-center flex flex-col items-center justify-center gap-3 hover:border-brand-500 hover:shadow-lg transition-all group border border-slate-200 dark:border-slate-800">
                <div class="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <i data-lucide="${cat.icon || 'tag'}" class="w-7 h-7"></i>
                </div>
                <span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full">${cat.category_name}</span>
              </a>
            `).join("")}
          </div>
        </section>

        <!-- Best Selling Products Grid -->
        <section class="py-12 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between mb-8">
              <div>
                <span class="badge-success mb-2 text-xs font-bold">টপ ট্রেন্ডিং</span>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">জনপ্রিয় প্রোডাক্টসমূহ</h2>
              </div>
              <a href="/products" class="btn-secondary text-xs px-4 py-2 flex items-center gap-1 font-bold">
                সকল প্রোডাক্ট <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              ${(bestSellers.length > 0 ? bestSellers : products.slice(0, 4)).map(product => `
                <div class="glass-panel rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group border border-slate-200 dark:border-slate-800">
                  <div>
                    <div class="relative bg-white p-4 flex items-center justify-center overflow-hidden h-48">
                      <img src="${product.thumbnail || 'https://placehold.co/300x300'}" class="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      ${product.regular_price > product.selling_price ? `
                        <span class="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                          -${Math.round(((product.regular_price - product.selling_price) / product.regular_price) * 100)}% ছাড়
                        </span>
                      ` : ''}
                    </div>

                    <div class="p-4 space-y-1">
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${product.sku || 'DCBD'}</span>
                      <a href="/product/${product.product_id}">
                        <h3 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-brand-500 transition-colors">
                          ${product.product_name}
                        </h3>
                      </a>
                    </div>
                  </div>

                  <div class="p-4 pt-0">
                    <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        ${product.regular_price > product.selling_price ? `
                          <span class="text-[11px] text-slate-400 line-through">৳${product.regular_price}</span>
                        ` : ''}
                        <h4 class="text-base font-extrabold text-slate-900 dark:text-white">৳${product.selling_price || product.regular_price}</h4>
                      </div>
                      <button onclick="window.quickAddToCart('${product.product_id}')" class="p-2.5 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white transition-all shadow-sm">
                        <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </section>

      </main>

      <div id="cart-drawer-root">${CartDrawer.render()}</div>
      ${Footer.render()}
    </div>
  `;
};

// Safe Quick Add To Cart Handler by Product ID
window.quickAddToCart = (productId) => {
  const items = window._homeProducts || [];
  const prod = items.find(p => p.product_id === productId);
  if (prod) {
    store.addToCart(prod, 1);
  } else {
    store.addToCart({ product_id: productId, product_name: "পণ্য", selling_price: 1000 }, 1);
  }
};

export default HomePage;
