/**
 * DREAM CART BD — HOME PAGE (HomePage.js)
 * Implements user requirements:
 * - Luxury, spacious responsive layout with generous padding and margins (ZERO clutter)
 * - Auto-sliding banners (interactive slider with dots and prev/next controls)
 * - Extra Notice / Trust badges (spacious small card system with high contrast)
 * - Featured Brands showcase (enclosed in clean modular card)
 * - Category product showcase: Unique categories only (each category appears once, clean section card)
 * - Interactive subcategory pill filters under each category header
 * - Trending collection highlights
 * - Mobile 2-grid product layout: balanced typography, comfortable padding, uniform card heights
 * - Strict 2-line title clamping and character limit so cards never break across rows
 * - Dedicated clean scoped CSS with high contrast in Light & Dark modes
 */

import { renderProductCard } from '../../components/ProductCard.js';
import { apiClient } from '../../api/client.js';

// Setup banner auto-slider safely in browser
if (typeof window !== 'undefined' && !window.__dcbdSliderInitialized) {
  window.__dcbdSliderInitialized = true;
  let currentSlide = 0;

  window.__dcbdGoSlide = function(index) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.slider-dot');
    if (!slides.length) return;
    
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((s, idx) => {
      if (idx === currentSlide) {
        s.classList.remove('opacity-0', 'pointer-events-none', 'z-0');
        s.classList.add('opacity-100', 'z-10');
      } else {
        s.classList.remove('opacity-100', 'z-10');
        s.classList.add('opacity-0', 'pointer-events-none', 'z-0');
      }
    });

    dots.forEach((d, idx) => {
      if (idx === currentSlide) {
        d.classList.add('bg-emerald-500', 'w-10');
        d.classList.remove('bg-white/30', 'w-8');
      } else {
        d.classList.remove('bg-emerald-500', 'w-10');
        d.classList.add('bg-white/30', 'w-8');
      }
    });
  };

  window.__dcbdNextSlide = function() {
    window.__dcbdGoSlide(currentSlide + 1);
  };

  window.__dcbdPrevSlide = function() {
    window.__dcbdGoSlide(currentSlide - 1);
  };

  // Auto slide every 5 seconds
  if (typeof setInterval !== 'undefined') {
    setInterval(function() {
      const slider = document.getElementById('hero-slider');
      if (slider && document.body.contains(slider)) {
        window.__dcbdNextSlide();
      }
    }, 5000);
  }
}

export async function renderHomePage() {
  const [prodRes, catRes, brandRes, bannerRes] = await Promise.all([
    apiClient.request("products/list"),
    apiClient.request("categories/list"),
    apiClient.request("brands/list"),
    apiClient.request("banners/list")
  ]);

  const products = (prodRes.data && prodRes.data.items) || [];
  const categories = (catRes.data && catRes.data.items) || [];
  const brands = (brandRes.data && brandRes.data.items) || [];
  const rawBanners = (bannerRes.data && bannerRes.data.items) || [];

  // Default fallback banners if empty
  const defaultBanners = [
    {
      title: "প্রিমিয়াম স্মার্ট গ্যাজেট ও লাইফস্টাইল কালেকশন",
      subtitle: "স্মার্টওয়াচ, অর্গানিক হেলথ ফুড, ট্যাকটিক্যাল লাইট ও হোম সেফটি এক্সেসরিজে সেরা ক্যাশ অন ডেলিভারি অফার।",
      tag: "মেগা অফার ২০২৬",
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80",
      link_url: "/products",
      button_text: "এখনই কিনুন"
    }
  ];
  const banners = rawBanners.length > 0 ? rawBanners : defaultBanners;

  // Group and deduplicate by Main Category name
  // Each unique category name appears EXACTLY ONCE on the homepage!
  const uniqueCategoryMap = new Map();

  // 1. First populate from categories sheet (preserving order, subcategories and images)
  categories.forEach(c => {
    const rawName = (c.category || '').trim();
    if (!rawName || rawName.toLowerCase() === 'test id') return;

    const key = rawName.toLowerCase();
    if (!uniqueCategoryMap.has(key)) {
      uniqueCategoryMap.set(key, {
        name: rawName,
        category_image: c.category_image || '',
        subCategories: new Set(),
        products: []
      });
    }

    const catObj = uniqueCategoryMap.get(key);
    if (c.sub_category) {
      c.sub_category.split(/[,|\n]/).map(s => s.trim()).filter(Boolean).forEach(s => catObj.subCategories.add(s));
    }
    if (c.chail_category || c.child_category) {
      (c.chail_category || c.child_category).split(/[,|\n]/).map(s => s.trim()).filter(Boolean).forEach(s => catObj.subCategories.add(s));
    }
    if (c.category_image && !catObj.category_image) {
      catObj.category_image = c.category_image;
    }
  });

  // 2. Map all products into their respective category and collect product-level subcategories
  products.forEach(p => {
    const rawCat = (p.category || '').trim();
    if (!rawCat || rawCat.toLowerCase() === 'test id') return;

    const key = rawCat.toLowerCase();
    if (!uniqueCategoryMap.has(key)) {
      uniqueCategoryMap.set(key, {
        name: rawCat,
        category_image: p.thumbnail || '',
        subCategories: new Set(),
        products: []
      });
    }

    const catObj = uniqueCategoryMap.get(key);
    // Ensure product is added only once to this category
    const pId = p.product_id || p.sku || p.name;
    const exists = catObj.products.some(it => (it.product_id && it.product_id === pId) || (it.sku && it.sku === p.sku));
    if (!exists) {
      catObj.products.push(p);
    }

    if (p.sub_category && p.sub_category.trim()) {
      catObj.subCategories.add(p.sub_category.trim());
    }
    if (p.child_category && p.child_category.trim()) {
      catObj.subCategories.add(p.child_category.trim());
    }
  });

  // 3. Filter only categories that actually have products (each category appears ONLY ONCE)
  const uniqueCategories = Array.from(uniqueCategoryMap.values()).filter(c => c.products.length > 0);

  return `
    <style id="dc-home-page-styles">
      /* ==========================================================================
         DREAM CART BD — LUXURY SPACIOUS HOME PAGE STYLING (Zero-Clutter)
         ========================================================================== */

      /* Outer Layout Container & Section Spacing */
      .dc-home-container {
        display: flex;
        flex-direction: column;
        gap: 2.25rem;
        padding-bottom: 3.5rem;
        width: 100%;
        box-sizing: border-box;
      }

      @media (max-width: 640px) {
        .dc-home-container {
          gap: 1.5rem;
          padding-bottom: 2.5rem;
        }
      }

      /* Hero Banner Section */
      .dc-hero-section {
        position: relative;
        overflow: hidden;
        border-radius: 24px;
        background: #020617;
        border: 1px solid rgba(30, 41, 59, 0.85);
        box-shadow: 0 16px 36px -12px rgba(0, 0, 0, 0.35);
      }

      @media (max-width: 640px) {
        .dc-hero-section {
          border-radius: 18px;
        }
      }

      /* Reusable Home Section Card Module */
      .dc-home-section {
        position: relative;
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 24px;
        padding: 1.5rem 1.75rem 1.75rem;
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.03);
        transition: box-shadow 0.25s ease, border-color 0.25s ease;
        box-sizing: border-box;
        width: 100%;
      }

      .dark .dc-home-section {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.35);
      }

      @media (max-width: 640px) {
        .dc-home-section {
          padding: 1rem 0.875rem 1.125rem;
          border-radius: 18px;
        }
      }

      /* Section Header Styling */
      .dc-section-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(226, 232, 240, 0.85);
        padding-bottom: 1rem;
        margin-bottom: 1.25rem;
        gap: 0.875rem;
      }

      .dark .dc-section-header {
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }

      @media (max-width: 640px) {
        .dc-section-header {
          padding-bottom: 0.75rem;
          margin-bottom: 1rem;
          gap: 0.625rem;
        }
      }

      .dc-section-header-left {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        min-width: 0;
        flex: 1;
      }

      @media (max-width: 640px) {
        .dc-section-header-left {
          gap: 0.625rem;
        }
      }

      .dc-section-icon {
        width: 44px;
        height: 44px;
        border-radius: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        font-weight: 800;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }

      @media (max-width: 640px) {
        .dc-section-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          font-size: 1rem;
        }
      }

      .dc-section-title-wrap {
        min-width: 0;
      }

      .dc-section-title {
        font-size: 1.25rem;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -0.02em;
        line-height: 1.2;
        margin: 0;
      }

      .dark .dc-section-title {
        color: #f8fafc;
      }

      @media (max-width: 640px) {
        .dc-section-title {
          font-size: 1.05rem;
        }
      }

      .dc-section-subtitle {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 3px;
        line-height: 1.3;
      }

      .dark .dc-section-subtitle {
        color: #94a3b8;
      }

      @media (max-width: 640px) {
        .dc-section-subtitle {
          font-size: 0.6875rem;
        }
      }

      .dc-section-link-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 1.125rem;
        font-size: 0.8125rem;
        font-weight: 800;
        color: #047857;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 12px;
        text-decoration: none;
        white-space: nowrap;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .dark .dc-section-link-btn {
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.3);
      }

      .dc-section-link-btn:hover {
        background: #10b981;
        color: #ffffff;
        border-color: #10b981;
        transform: translateY(-1.5px);
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
      }

      @media (max-width: 640px) {
        .dc-section-link-btn {
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          border-radius: 9px;
        }
      }

      /* Subcategory Interactive Tag Pills */
      .dc-subcat-pills {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex-wrap: wrap;
        margin-top: 0.375rem;
      }

      .dc-subcat-pill {
        font-size: 0.6875rem;
        font-weight: 700;
        color: #475569;
        background: #f1f5f9;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        text-decoration: none;
        transition: all 0.15s ease;
        border: 1px solid #e2e8f0;
      }

      .dark .dc-subcat-pill {
        color: #cbd5e1;
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.08);
      }

      .dc-subcat-pill:hover {
        color: #059669;
        background: #ecfdf5;
        border-color: #a7f3d0;
      }

      .dark .dc-subcat-pill:hover {
        color: #34d399;
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.3);
      }

      /* Products Grid Layout with Clean Spacing & Margins */
      .product-grid {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)) !important;
        gap: 1.25rem !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      @media (min-width: 641px) and (max-width: 1024px) {
        .product-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 1rem !important;
        }
      }

      /* 2-Column Mobile Grid for Products on Home Page */
      @media (max-width: 640px) {
        .product-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 0.75rem !important; /* 12px generous space to avoid card crowding */
        }

        .dc-product-card {
          border-radius: 14px !important;
        }

        .dc-card-body {
          padding: 10px 10px 12px !important;
          gap: 7px !important;
        }

        .dc-card-title,
        .product-card-title {
          font-size: 12px !important;
          line-height: 1.35 !important;
          min-height: 2.7em !important;
          max-height: 2.7em !important;
        }

        .dc-price-current {
          font-size: 15px !important;
        }

        .dc-price-regular {
          font-size: 10.5px !important;
        }

        .dc-btn-order,
        .dc-btn-preorder {
          padding: 7px 10px !important;
          font-size: 11px !important;
          border-radius: 9px !important;
        }

        .dc-btn-cart {
          width: 34px !important;
          height: 34px !important;
          border-radius: 9px !important;
        }

        .dc-wa-btn {
          padding: 5.5px 6px !important;
          font-size: 9px !important;
          border-radius: 8px !important;
        }
      }

      /* Trust Badges / Notice Cards Grid */
      .dc-trust-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
        width: 100%;
      }

      @media (max-width: 1024px) {
        .dc-trust-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
        }
      }

      .dc-trust-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 18px;
        padding: 1.125rem 1.25rem;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.04);
        display: flex;
        align-items: center;
        gap: 0.875rem;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .dark .dc-trust-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.3);
      }

      .dc-trust-card:hover {
        transform: translateY(-2px);
        border-color: rgba(16, 185, 129, 0.4);
        box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.12);
      }

      @media (max-width: 640px) {
        .dc-trust-card {
          padding: 0.875rem 0.75rem;
          gap: 0.625rem;
          border-radius: 14px;
        }
      }

      .dc-trust-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        flex-shrink: 0;
      }

      @media (max-width: 640px) {
        .dc-trust-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          font-size: 1.15rem;
        }
      }

      .dc-trust-text-wrap {
        min-width: 0;
      }

      .dc-trust-title {
        font-size: 0.8125rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.25;
        margin: 0;
      }

      .dark .dc-trust-title {
        color: #f8fafc;
      }

      @media (max-width: 640px) {
        .dc-trust-title {
          font-size: 0.75rem;
        }
      }

      .dc-trust-desc {
        font-size: 0.6875rem;
        color: #64748b;
        margin-top: 2px;
        line-height: 1.3;
      }

      .dark .dc-trust-desc {
        color: #94a3b8;
      }

      @media (max-width: 640px) {
        .dc-trust-desc {
          font-size: 0.625rem;
        }
      }

      /* Brands Grid */
      .dc-brands-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 1rem;
        width: 100%;
      }

      @media (max-width: 1024px) {
        .dc-brands-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.875rem;
        }
      }

      @media (max-width: 640px) {
        .dc-brands-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.625rem;
        }
      }

      .dc-brand-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 0.625rem;
        padding: 1rem 0.75rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        text-decoration: none;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .dark .dc-brand-card {
        background: rgba(30, 41, 59, 0.5);
        border-color: rgba(255, 255, 255, 0.08);
      }

      .dc-brand-card:hover {
        background: #ffffff;
        border-color: #10b981;
        transform: translateY(-3px);
        box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.15);
      }

      .dark .dc-brand-card:hover {
        background: #1e293b;
        border-color: #34d399;
      }

      @media (max-width: 640px) {
        .dc-brand-card {
          padding: 0.75rem 0.5rem;
          gap: 0.375rem;
          border-radius: 12px;
        }
      }

      .dc-brand-logo-box {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        padding: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }

      .dark .dc-brand-logo-box {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.1);
      }

      .dc-brand-card:hover .dc-brand-logo-box {
        transform: scale(1.08);
        border-color: #10b981;
      }

      @media (max-width: 640px) {
        .dc-brand-logo-box {
          width: 40px;
          height: 40px;
          padding: 4px;
          border-radius: 10px;
        }
      }

      .dc-brand-name {
        font-size: 0.75rem;
        font-weight: 800;
        color: #334155;
        transition: color 0.2s ease;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dark .dc-brand-name {
        color: #cbd5e1;
      }

      .dc-brand-card:hover .dc-brand-name {
        color: #059669;
      }

      .dark .dc-brand-card:hover .dc-brand-name {
        color: #34d399;
      }

      @media (max-width: 640px) {
        .dc-brand-name {
          font-size: 0.6875rem;
        }
      }

      /* Partner Opportunity Banner */
      .dc-partner-banner {
        background: linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #0f172a 100%);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 24px;
        padding: 2.25rem 2.5rem;
        color: #ffffff;
        box-shadow: 0 12px 30px -8px rgba(5, 150, 105, 0.3);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
      }

      @media (max-width: 768px) {
        .dc-partner-banner {
          flex-direction: column;
          padding: 1.5rem 1.25rem;
          border-radius: 18px;
          text-align: center;
        }
      }
    </style>

    <div class="dc-home-container">
      
      <!-- 1. Auto-sliding Banners Hero Section -->
      <section class="dc-hero-section">
        <div id="hero-slider" class="relative w-full min-h-[340px] sm:min-h-[440px] md:min-h-[480px] flex items-center">
          
          ${banners.map((b, idx) => `
            <div class="banner-slide ${idx === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'} absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center" data-index="${idx}">
              
              <!-- Background Image with Gradient Overlay -->
              <img 
                src="${b.image_url}" 
                alt="${b.title}" 
                class="absolute inset-0 w-full h-full object-cover object-center opacity-40 select-none"
              />
              <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>
              
              <!-- Content Overlay -->
              <div class="relative z-10 max-w-2xl px-6 sm:px-12 md:px-16 py-10 space-y-4">
                <span class="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-[11px] px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ${b.tag || "বিশেষ অফার"}
                </span>

                <h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  ${b.title}
                </h1>

                <p class="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-lg">
                  ${b.subtitle}
                </p>

                <div class="pt-2 flex flex-wrap items-center gap-3">
                  <a href="${b.link_url || '/products'}" class="btn-primary text-xs sm:text-sm py-2.5 sm:py-3 px-6 shadow-glow">
                    ${b.button_text || 'এখনই অর্ডার করুন'} →
                  </a>
                  <a href="/offers" class="btn-secondary text-xs sm:text-sm py-2.5 sm:py-3 px-5 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                    সব অফার দেখুন
                  </a>
                </div>
              </div>

            </div>
          `).join("")}

          <!-- Slider Controls -->
          <div class="absolute bottom-5 left-6 sm:left-16 z-20 flex items-center gap-2">
            ${banners.map((_, i) => `
              <button 
                class="slider-dot w-8 h-2 rounded-full transition-all ${i === 0 ? 'bg-emerald-500 w-10' : 'bg-white/30'}"
                data-slide-target="${i}"
                aria-label="Go to slide ${i + 1}"
                onclick="window.__dcbdGoSlide && window.__dcbdGoSlide(${i})"
              ></button>
            `).join("")}
          </div>

          <!-- Prev/Next Arrow Buttons -->
          <button id="slider-btn-prev" class="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-sm transition cursor-pointer" aria-label="Previous Slide" onclick="window.__dcbdPrevSlide && window.__dcbdPrevSlide()">
            ‹
          </button>
          <button id="slider-btn-next" class="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-sm transition cursor-pointer" aria-label="Next Slide" onclick="window.__dcbdNextSlide && window.__dcbdNextSlide()">
            ›
          </button>

        </div>
      </section>

      <!-- 2. Extra Notice / Trust Features Grid -->
      <section class="dc-trust-grid">
        
        <div class="dc-trust-card">
          <div class="dc-trust-icon-box bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            🚚
          </div>
          <div class="dc-trust-text-wrap">
            <h4 class="dc-trust-title">সারা দেশে ডেলিভারি</h4>
            <p class="dc-trust-desc">২-৩ দিনে ক্যাশ অন ডেলিভারি</p>
          </div>
        </div>

        <div class="dc-trust-card">
          <div class="dc-trust-icon-box bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            🛡️
          </div>
          <div class="dc-trust-text-wrap">
            <h4 class="dc-trust-title">১০০% আসল পণ্য</h4>
            <p class="dc-trust-desc">অথেন্টিক পণ্যের শতভাগ নিশ্চয়তা</p>
          </div>
        </div>

        <div class="dc-trust-card">
          <div class="dc-trust-icon-box bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            🎁
          </div>
          <div class="dc-trust-text-wrap">
            <h4 class="dc-trust-title">অনলাইন ডিসকাউন্ট</h4>
            <p class="dc-trust-desc">বিকাশ/নগদ পেমেন্টে অতিরিক্ত ছাড়</p>
          </div>
        </div>

        <div class="dc-trust-card">
          <div class="dc-trust-icon-box bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            💬
          </div>
          <div class="dc-trust-text-wrap">
            <h4 class="dc-trust-title">২৪/৭ সাপোর্ট</h4>
            <p class="dc-trust-desc">01581703822 হোয়াটসঅ্যাপ সহায়তা</p>
          </div>
        </div>

      </section>

      <!-- 3. Brands Showcase (Enclosed in Clean Section Card) -->
      ${brands.length > 0 ? `
        <section class="dc-home-section">
          <div class="dc-section-header">
            <div class="dc-section-header-left">
              <div class="dc-section-icon bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                🏷️
              </div>
              <div class="dc-section-title-wrap">
                <h2 class="dc-section-title">
                  টপ ব্র্যান্ড সমূহ (Featured Brands)
                </h2>
                <p class="dc-section-subtitle">আমাদের অফিসিয়াল ব্র্যান্ড পার্টনারগণ</p>
              </div>
            </div>
            <a href="/brands" class="dc-section-link-btn">
              সব ব্র্যান্ড দেখুন <span>→</span>
            </a>
          </div>

          <div class="dc-brands-grid">
            ${brands.map(b => `
              <a 
                href="/products?brand=${encodeURIComponent(b.brand_name)}" 
                class="group dc-brand-card"
                title="${b.brand_name}"
              >
                <div class="dc-brand-logo-box">
                  <img 
                    src="${b.brand_image}" 
                    alt="${b.brand_name}" 
                    class="w-full h-full object-contain"
                    onerror="this.onerror=null; this.src='https://cdn.iconscout.com/icon/free/png-256/free-shield-icon-download-in-svg-png-gif-file-formats--safety-protection-security-secure-protect-pack-crime-icons-1779836.png?f=webp&w=128';"
                  />
                </div>
                <span class="dc-brand-name">
                  ${b.brand_name}
                </span>
              </a>
            `).join("")}
          </div>
        </section>
      ` : ''}

      <!-- 4. Category Product Show: Each Unique Category Appears ONLY ONCE in its Own Dedicated Card -->
      ${uniqueCategories.map(cat => {
        const subCategoriesArr = Array.from(cat.subCategories).slice(0, 5);

        return `
          <section class="dc-home-section" id="cat-section-${encodeURIComponent(cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-'))}">
            
            <!-- Category Header -->
            <div class="dc-section-header">
              <div class="dc-section-header-left">
                <div class="dc-section-icon bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  ⚡
                </div>
                <div class="dc-section-title-wrap">
                  <h2 class="dc-section-title">
                    ${cat.name}
                  </h2>
                  
                  ${subCategoriesArr.length > 0 ? `
                    <div class="dc-subcat-pills">
                      ${subCategoriesArr.map(sub => `
                        <a href="/products?cat=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent(sub)}" class="dc-subcat-pill">
                          ${sub}
                        </a>
                      `).join("")}
                    </div>
                  ` : `
                    <p class="dc-section-subtitle">সেরা কালেকশন থেকে আপনার পছন্দেরটি বেছে নিন</p>
                  `}
                </div>
              </div>

              <div>
                <a href="/products?cat=${encodeURIComponent(cat.name)}" class="dc-section-link-btn">
                  সবগুলো দেখুন (${cat.products.length}) <span>→</span>
                </a>
              </div>
            </div>

            <!-- Product Grid (Up to 12 products per category) -->
            <div class="product-grid">
              ${cat.products.slice(0, 12).map(p => renderProductCard(p)).join("")}
            </div>

          </section>
        `;
      }).join("")}

      <!-- 5. All Products Highlights & Trending Discovery -->
      <section class="dc-home-section">
        <div class="dc-section-header">
          <div class="dc-section-header-left">
            <div class="dc-section-icon bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              🔥
            </div>
            <div class="dc-section-title-wrap">
              <h2 class="dc-section-title">
                সকল জনপ্রিয় পণ্য (Trending Collection)
              </h2>
              <p class="dc-section-subtitle">আমাদের সেরা সেলিং ও ট্রেন্ডিং আইটেমসমূহ</p>
            </div>
          </div>
          <a href="/products" class="dc-section-link-btn !bg-emerald-600 !text-white !border-emerald-600 hover:!bg-emerald-700">
            সকল পণ্য (${products.length}) <span>→</span>
          </a>
        </div>

        <div class="product-grid">
          ${products.slice(0, 12).map(p => renderProductCard(p)).join("")}
        </div>
      </section>

      <!-- 6. Partner Opportunity Banner -->
      <section class="dc-partner-banner">
        <div class="max-w-xl space-y-2.5 text-center md:text-left">
          <span class="inline-block bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
            ব্যবসার সুবর্ণ সুযোগ
          </span>
          <h3 class="text-xl sm:text-2xl font-black leading-snug">
            আমাদের সাথে রিসেলার বা পাইকারি ব্যবসা শুরু করুন!
          </h3>
          <p class="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            কোনো ধরনের ইনভেস্টমেন্ট ছাড়া নিজের ফেসবুক পেজ থেকে ড্রপশিপিং রিসেলিং করুন অথবা পাইকারি দামে বেশি মুনাফায় ব্যবসা বাড়ান।
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <a href="/reseller/register" class="btn-primary bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-3 px-6 shadow-md rounded-xl transition">
            রিসেলার হোন →
          </a>
          <a href="/wholesaler/register" class="btn-secondary bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs py-3 px-6 rounded-xl backdrop-blur-sm transition">
            পাইকারি ক্রেতা নিবন্ধন
          </a>
        </div>
      </section>

    </div>
  `;
}

export const HomePage = renderHomePage;
export default renderHomePage;
