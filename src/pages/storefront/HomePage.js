/**
 * DREAM CART BD — HOME PAGE (HomePage.js)
 * Implements user requirements:
 * - 5 Default Pre-loaded Banners: Kitchen, Health, Home Appliance, Medicine, Stationery
 * - Dynamic Auto-sliding Hero Banners (directly integrated with Banners Sheet & Admin Portal management)
 * - Guaranteed banner display with explicit responsive heights, high contrast, and smooth auto-slide
 * - Extra Notice / Trust badges (spacious card system with high contrast)
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

// Setup banner auto-slider & touch-swipe safely in browser
if (typeof window !== 'undefined' && !window.__dcbdSliderInitialized) {
  window.__dcbdSliderInitialized = true;
  let currentSlide = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  window.__dcbdGoSlide = function(index) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.slider-dot');
    if (!slides.length) return;
    
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((s, idx) => {
      if (idx === currentSlide) {
        s.classList.add('active-slide');
        s.style.opacity = '1';
        s.style.zIndex = '10';
        s.style.visibility = 'visible';
        s.style.pointerEvents = 'auto';
      } else {
        s.classList.remove('active-slide');
        s.style.opacity = '0';
        s.style.zIndex = '0';
        s.style.visibility = 'hidden';
        s.style.pointerEvents = 'none';
      }
    });

    dots.forEach((d, idx) => {
      if (idx === currentSlide) {
        d.classList.add('active-dot', 'bg-emerald-500', 'w-10');
        d.classList.remove('bg-white/40', 'w-8');
      } else {
        d.classList.remove('active-dot', 'bg-emerald-500', 'w-10');
        d.classList.add('bg-white/40', 'w-8');
      }
    });
  };

  window.__dcbdNextSlide = function() {
    window.__dcbdGoSlide(currentSlide + 1);
  };

  window.__dcbdPrevSlide = function() {
    window.__dcbdGoSlide(currentSlide - 1);
  };

  // Touch swipe support for mobile & tablet devices
  document.addEventListener('touchstart', function(e) {
    const slider = e.target && e.target.closest ? e.target.closest('#hero-slider') : null;
    if (!slider) return;
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    const slider = e.target && e.target.closest ? e.target.closest('#hero-slider') : null;
    if (!slider) return;
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        window.__dcbdNextSlide();
      } else {
        window.__dcbdPrevSlide();
      }
    }
  }, { passive: true });

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

  // Filter active banners dynamically from Google Sheets & Admin Portal
  const activeBanners = rawBanners.filter(b => {
    const st = String(b.status || b.Status || 'Active').trim().toLowerCase();
    return st !== 'inactive' && st !== 'disabled' && st !== 'false';
  });

  // 5 Core Default Banners (Kitchen, Health, Home Appliance, Medicine, Stationery)
  const defaultBanners = [
    {
      banner_id: "BAN-01",
      title: "স্মার্ট কিচেন ও নিরাপদ কুকিং গ্যাজেট কালেকশন",
      subtitle: "আপনার রান্নাঘরকে করুন আরও আধুনিক, সহজ ও নিরাপদ — অটো গ্যাস সেফটি ডিভাইস, মাল্টি-ফাংশন ব্লেন্ডার ও প্রিমিয়াম কিচেন এক্সেসরিজ এখন বিশেষ মূল্যে।",
      tag: "🔥 কিচেন স্পেশাল",
      highlight: "সর্বোচ্চ ৩০% ছাড়",
      features: ["✓ ১০০% অরিজিনাল গ্যাজেট", "✓ ক্যাশ অন ডেলিভারি"],
      image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80",
      link_url: "/products?cat=Kitchen",
      button_text: "কিচেন আইটেম দেখুন",
      status: "Active"
    },
    {
      banner_id: "BAN-02",
      title: "১০০% খাঁটি অর্গানিক ফুড ও ন্যাচারাল হেলথ সাপ্লিমেন্ট",
      subtitle: "সুন্দরবনের প্রাকৃতিক চাকের মধু, অর্গানিক চিয়া সিড, কোল্ড-প্রেসড কালোজিরা তেল ও পুষ্টিকর ভেষজ সুপারফুডে পরিবারের সবাইকে রাখুন সুস্থ ও প্রাণবন্ত।",
      tag: "🌿 অর্গানিক ও ন্যাচারাল",
      highlight: "ল্যাব টেস্টেড বিশুদ্ধতা",
      features: ["✓ কেমিক্যাল মুক্ত খাঁটি পণ্য", "✓ সরাসরি উৎস থেকে সংগৃহীত"],
      image_url: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=1600&auto=format&fit=crop&q=80",
      link_url: "/products?cat=Organic%20%26%20Health",
      button_text: "অর্গানিক ফুড দেখুন",
      status: "Active"
    },
    {
      banner_id: "BAN-03",
      title: "স্মার্ট হোম অ্যাপ্লায়েন্স ও আধুনিক ইলেকট্রনিক্স গ্যাজেট",
      subtitle: "দৈনন্দিন জীবনকে আরও আরামদায়ক ও গতিশীল করতে বিদ্যুৎ সাশ্রয়ী হোম অ্যাপ্লায়েন্স, কলিং স্মার্টওয়াচ ও হাই-পাওয়ার রিচার্জেবল এলইডি লাইটিং সমাধান।",
      tag: "⚡ স্মার্ট লাইফস্টাইল",
      highlight: "অফিসিয়াল ওয়ারেন্টি",
      features: ["✓ প্রিমিয়াম বিল্ড কোয়ালিটি", "✓ দ্রুত হোম ডেলিভারি"],
      image_url: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80",
      link_url: "/products?cat=Home%20Appliances",
      button_text: "অ্যাপ্লায়েন্স কালেকশন",
      status: "Active"
    },
    {
      banner_id: "BAN-04",
      title: "মেডিসিন ও নির্ভরযোগ্য হোম হেলথকেয়ার ডিভাইস",
      subtitle: "ঘরে বসেই পরিবারের স্বাস্থ্য পরীক্ষা করুন — ডিজিটাল ব্লাড প্রেসার মেশিন, ডায়াবেটিস গ্লুকোমিটার, নেবুলাইজার ও জরুরি ফার্স্ট-এইড সামগ্রী।",
      tag: "🩺 স্বাস্থ্য সুরক্ষা",
      highlight: "নির্ভুল মেডিকেল ডিভাইস",
      features: ["✓ ক্লিনিক্যালি পরীক্ষিত", "✓ ২৪/৭ কাস্টমার সহায়তা"],
      image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1600&auto=format&fit=crop&q=80",
      link_url: "/products?cat=Medicine%20%26%20Healthcare",
      button_text: "মেডিকেয়ার পণ্য দেখুন",
      status: "Active"
    },
    {
      banner_id: "BAN-05",
      title: "প্রিমিয়াম স্টেশনারি, স্টাডি ও অফিস ডেস্ক এক্সেসরিজ",
      subtitle: "ছাত্র-ছাত্রী ও কর্পোরেট প্রফেশনালদের কাজের গতি বাড়াতে আকর্ষণীয় নোটবুক, স্মার্ট ডেস্ক অর্গানাইজার, রিচার্জেবল টেবিল ল্যাম্প ও আধুনিক স্টেশনারি।",
      tag: "📚 স্টাডি ও স্মার্ট অফিস",
      highlight: "নতুন কালেকশন ২০২৬",
      features: ["✓ আকর্ষণীয় ডিজাইন", "✓ সাশ্রয়ী কম্বো অফার"],
      image_url: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=1600&auto=format&fit=crop&q=80",
      link_url: "/products?cat=Stationery",
      button_text: "স্টেশনারি দেখুন",
      status: "Active"
    }
  ];

  // If custom banners uploaded in admin/sheet, prioritize them; otherwise ensure all 5 core categories are displayed
  const banners = activeBanners.length >= 4 ? activeBanners : defaultBanners;

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
        padding-top: 0.75rem;
        padding-bottom: 3.5rem;
        width: 100%;
        box-sizing: border-box;
      }

      @media (max-width: 640px) {
        .dc-home-container {
          gap: 1.5rem;
          padding-top: 0.5rem;
          padding-bottom: 2.5rem;
        }
      }

      /* ==========================================================================
         HERO BANNER SLIDER (Responsive across Mobile, Tablet, Laptop & Desktop)
         ========================================================================== */
      .dc-hero-section {
        position: relative;
        width: 100%;
        min-height: 460px;
        border-radius: 26px;
        overflow: hidden;
        background: #020617;
        border: 1px solid rgba(30, 41, 59, 0.85);
        box-shadow: 0 20px 45px -15px rgba(2, 6, 23, 0.45);
        box-sizing: border-box;
      }

      #hero-slider {
        position: relative;
        width: 100%;
        min-height: 460px;
        display: flex;
        align-items: stretch;
        overflow: hidden;
      }

      .banner-slide {
        width: 100%;
        min-height: 460px;
        display: flex;
        align-items: center;
        transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
      }

      .banner-slide.active-slide {
        position: relative !important;
        opacity: 1 !important;
        z-index: 10 !important;
        pointer-events: auto !important;
        visibility: visible !important;
      }

      .banner-slide:not(.active-slide) {
        position: absolute !important;
        inset: 0 !important;
        opacity: 0 !important;
        z-index: 0 !important;
        pointer-events: none !important;
        visibility: hidden !important;
      }

      /* Crisp Full-Bleed Banner Background Image */
      .dc-banner-bg-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        user-select: none;
        -webkit-user-drag: none;
        transform: scale(1.03);
        transition: transform 6s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 1;
      }

      .banner-slide.active-slide .dc-banner-bg-img {
        transform: scale(1);
      }

      /* Multi-layer High-Contrast Readability Overlay */
      .dc-banner-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          rgba(2, 6, 23, 0.96) 0%,
          rgba(2, 6, 23, 0.88) 42%,
          rgba(15, 23, 42, 0.62) 72%,
          rgba(15, 23, 42, 0.30) 100%
        );
        z-index: 2;
      }

      .dc-banner-glow {
        position: absolute;
        top: -25%;
        left: -10%;
        width: 420px;
        height: 420px;
        border-radius: 9999px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0) 70%);
        pointer-events: none;
        z-index: 3;
      }

      /* Inner Content Wrapper with Explicit Padding & Margin for All Screens */
      .dc-banner-inner {
        position: relative;
        z-index: 10;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 2.5rem;
        padding: 3.5rem 5.25rem 4.5rem 5.25rem;
        box-sizing: border-box;
      }

      /* Left Text Column */
      .dc-banner-content {
        max-width: 650px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        margin: 0;
        padding: 0.25rem 0;
        box-sizing: border-box;
      }

      /* Top Badge & Highlight Row */
      .dc-banner-meta-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.625rem;
        margin-top: 0;
        margin-bottom: 1.125rem;
      }

      .dc-banner-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.425rem 1rem;
        border-radius: 9999px;
        background: rgba(16, 185, 129, 0.22);
        border: 1px solid rgba(52, 211, 153, 0.55);
        color: #6ee7b7;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.03em;
        line-height: 1.2;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.18);
      }

      .dc-banner-tag-dot {
        width: 8px;
        height: 8px;
        border-radius: 9999px;
        background-color: #34d399;
        box-shadow: 0 0 8px #34d399;
        flex-shrink: 0;
      }

      .dc-banner-highlight-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.9rem;
        border-radius: 9999px;
        background: rgba(251, 191, 36, 0.16);
        border: 1px solid rgba(251, 191, 36, 0.45);
        color: #fde68a;
        font-size: 0.72rem;
        font-weight: 800;
        line-height: 1.2;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }

      /* Main Banner Heading */
      .dc-banner-title {
        font-size: 2.5rem;
        font-weight: 900;
        color: #ffffff;
        line-height: 1.28;
        letter-spacing: -0.02em;
        margin: 0 0 1rem 0;
        padding: 0;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      }

      /* Banner Subtitle / Description */
      .dc-banner-subtitle {
        font-size: 1rem;
        font-weight: 500;
        color: #e2e8f0;
        line-height: 1.7;
        margin: 0 0 1.25rem 0;
        padding: 0;
        max-width: 580px;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
      }

      /* Feature Check Pills inside Banner */
      .dc-banner-feature-list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.625rem;
        margin: 0 0 1.625rem 0;
        padding: 0;
      }

      .dc-banner-feature-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: #f1f5f9;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.18);
        padding: 0.35rem 0.85rem;
        border-radius: 10px;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }

      /* Banner CTA Buttons Row */
      .dc-banner-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.875rem;
        margin-top: 0.25rem;
        margin-bottom: 0;
      }

      .dc-banner-btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.85rem 1.75rem;
        font-size: 0.875rem;
        font-weight: 800;
        color: #ffffff !important;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: 1px solid rgba(110, 231, 183, 0.4);
        border-radius: 14px;
        box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.5);
        text-decoration: none;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .dc-banner-btn-primary:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        transform: translateY(-2px);
        box-shadow: 0 14px 30px -5px rgba(16, 185, 129, 0.65);
      }

      .dc-banner-btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        padding: 0.85rem 1.5rem;
        font-size: 0.875rem;
        font-weight: 700;
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 14px;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        text-decoration: none;
        transition: all 0.25s ease;
      }

      .dc-banner-btn-secondary:hover {
        background: rgba(255, 255, 255, 0.24);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
      }

      /* Right-Side Glassmorphic Visual Card (Laptop & Desktop Only) */
      .dc-banner-visual-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 280px;
        flex-shrink: 0;
        padding: 0.875rem;
        border-radius: 22px;
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
      }

      .dc-banner-visual-thumb-wrap {
        width: 100%;
        height: 175px;
        border-radius: 16px;
        overflow: hidden;
        position: relative;
        margin-bottom: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .dc-banner-visual-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }

      .dc-banner-visual-caption {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.25rem 0.35rem 0.15rem;
      }

      .dc-banner-visual-caption-text {
        font-size: 0.75rem;
        font-weight: 800;
        color: #f8fafc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dc-banner-visual-caption-badge {
        font-size: 0.6875rem;
        font-weight: 800;
        color: #10b981;
        background: rgba(16, 185, 129, 0.18);
        border: 1px solid rgba(16, 185, 129, 0.35);
        padding: 0.2rem 0.55rem;
        border-radius: 9999px;
        flex-shrink: 0;
      }

      /* Slider Pagination Dots */
      .dc-slider-dots {
        position: absolute;
        bottom: 1.35rem;
        left: 5.25rem;
        z-index: 25;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .slider-dot {
        height: 8px;
        width: 26px;
        border-radius: 9999px;
        background-color: rgba(255, 255, 255, 0.38);
        border: none;
        padding: 0;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .slider-dot:hover {
        background-color: rgba(255, 255, 255, 0.65);
      }

      .slider-dot.active-dot,
      .slider-dot.bg-emerald-500 {
        width: 42px;
        background-color: #10b981 !important;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.7);
      }

      /* Slider Prev / Next Navigation Buttons */
      .dc-slider-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 25;
        width: 44px;
        height: 44px;
        border-radius: 9999px;
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.24);
        color: #ffffff;
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        transition: all 0.2s ease;
        user-select: none;
      }

      .dc-slider-arrow:hover {
        background: #10b981;
        border-color: #34d399;
        transform: translateY(-50%) scale(1.06);
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
      }

      .dc-slider-arrow-prev {
        left: 1.15rem;
      }

      .dc-slider-arrow-next {
        right: 1.15rem;
      }

      /* ==========================================================================
         RESPONSIVE BREAKPOINTS FOR HERO BANNER (Laptop, Tablet, Mobile)
         ========================================================================== */

      /* Laptop Screens (1024px to 1279px) */
      @media (min-width: 1024px) and (max-width: 1279px) {
        .dc-hero-section,
        #hero-slider,
        .banner-slide {
          min-height: 430px;
        }

        .dc-banner-inner {
          padding: 3rem 4.5rem 4rem 4.5rem;
          gap: 1.75rem;
        }

        .dc-banner-title {
          font-size: 2.15rem;
        }

        .dc-banner-subtitle {
          font-size: 0.9375rem;
        }

        .dc-banner-visual-card {
          width: 240px;
        }

        .dc-banner-visual-thumb-wrap {
          height: 150px;
        }

        .dc-slider-dots {
          left: 4.5rem;
        }
      }

      /* Tablet Screens (640px to 1023px) */
      @media (min-width: 640px) and (max-width: 1023px) {
        .dc-hero-section,
        #hero-slider,
        .banner-slide {
          min-height: 400px;
          border-radius: 22px;
        }

        .dc-banner-inner {
          padding: 2.5rem 4.25rem 3.75rem 4.25rem;
        }

        .dc-banner-visual-card {
          display: none;
        }

        .dc-banner-title {
          font-size: 1.85rem;
          margin-bottom: 0.875rem;
        }

        .dc-banner-subtitle {
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1.15rem;
        }

        .dc-slider-dots {
          left: 4.25rem;
          bottom: 1.2rem;
        }

        .dc-slider-arrow {
          width: 38px;
          height: 38px;
          font-size: 1.3rem;
        }

        .dc-slider-arrow-prev {
          left: 0.75rem;
        }

        .dc-slider-arrow-next {
          right: 0.75rem;
        }
      }

      /* Mobile Screens (<= 639px) */
      @media (max-width: 639px) {
        .dc-hero-section {
          min-height: 370px;
          border-radius: 20px;
        }

        #hero-slider,
        .banner-slide {
          min-height: 370px;
        }

        .dc-banner-overlay {
          background: linear-gradient(
            180deg,
            rgba(2, 6, 23, 0.82) 0%,
            rgba(2, 6, 23, 0.90) 55%,
            rgba(2, 6, 23, 0.96) 100%
          );
        }

        .dc-banner-inner {
          padding: 1.75rem 1.35rem 3.5rem 1.35rem;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 1rem;
        }

        .dc-banner-visual-card {
          display: none;
        }

        .dc-banner-content {
          max-width: 100%;
          padding: 0.15rem 0;
        }

        .dc-banner-meta-row {
          gap: 0.45rem;
          margin-bottom: 0.85rem;
        }

        .dc-banner-tag {
          font-size: 0.6875rem;
          padding: 0.35rem 0.8rem;
        }

        .dc-banner-highlight-badge {
          font-size: 0.65rem;
          padding: 0.32rem 0.7rem;
        }

        .dc-banner-title {
          font-size: 1.425rem;
          line-height: 1.34;
          margin-bottom: 0.75rem;
        }

        .dc-banner-subtitle {
          font-size: 0.8125rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          color: #cbd5e1;
        }

        .dc-banner-feature-list {
          gap: 0.45rem;
          margin-bottom: 1.25rem;
        }

        .dc-banner-feature-pill {
          font-size: 0.6875rem;
          padding: 0.28rem 0.65rem;
          border-radius: 8px;
        }

        .dc-banner-actions {
          width: 100%;
          gap: 0.625rem;
        }

        .dc-banner-btn-primary {
          padding: 0.72rem 1.25rem;
          font-size: 0.78rem;
          border-radius: 12px;
        }

        .dc-banner-btn-secondary {
          padding: 0.72rem 1.1rem;
          font-size: 0.78rem;
          border-radius: 12px;
        }

        .dc-slider-dots {
          left: 1.35rem;
          bottom: 1.1rem;
          gap: 0.4rem;
        }

        .slider-dot {
          width: 20px;
          height: 6px;
        }

        .slider-dot.active-dot,
        .slider-dot.bg-emerald-500 {
          width: 32px;
        }

        .dc-slider-arrow {
          display: none;
        }
      }

      /* Small Mobile Screens (<= 380px) */
      @media (max-width: 380px) {
        .dc-banner-inner {
          padding: 1.5rem 1.1rem 3.25rem 1.1rem;
        }

        .dc-banner-title {
          font-size: 1.275rem;
        }

        .dc-banner-subtitle {
          font-size: 0.775rem;
        }

        .dc-banner-btn-primary,
        .dc-banner-btn-secondary {
          width: 100%;
          justify-content: center;
        }

        .dc-slider-dots {
          left: 50%;
          transform: translateX(-50%);
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

      .dc-brands-view-all-wrap {
        display: flex;
        justify-content: center;
        margin-top: 1.5rem;
      }

      /* Partner Opportunity Banner */
      .dc-partner-banner {
        background: linear-gradient(135deg, #064e3b 0%, #0f766e 50%, #0f172a 100%);
        border: 1px solid rgba(16, 185, 129, 0.35);
        border-radius: 24px;
        padding: 2.5rem 2.75rem;
        color: #ffffff;
        box-shadow: 0 14px 34px -8px rgba(5, 150, 105, 0.32);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        box-sizing: border-box;
      }

      .dc-partner-content {
        max-width: 620px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }

      .dc-partner-badge {
        display: inline-block;
        background-color: #fbbf24;
        color: #020617;
        font-weight: 900;
        font-size: 0.6875rem;
        padding: 0.35rem 0.9rem;
        border-radius: 9999px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.85rem;
      }

      .dc-partner-title {
        font-size: 1.5rem;
        font-weight: 900;
        color: #ffffff;
        line-height: 1.32;
        margin: 0 0 0.65rem 0;
      }

      .dc-partner-desc {
        font-size: 0.875rem;
        color: rgba(209, 250, 229, 0.92);
        line-height: 1.65;
        margin: 0;
      }

      .dc-partner-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 0.875rem;
        flex-shrink: 0;
      }

      .dc-partner-btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: #fbbf24;
        color: #020617 !important;
        font-weight: 900;
        font-size: 0.8125rem;
        padding: 0.85rem 1.6rem;
        border-radius: 13px;
        box-shadow: 0 6px 18px rgba(251, 191, 36, 0.3);
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .dc-partner-btn-primary:hover {
        background-color: #fcd34d;
        transform: translateY(-2px);
      }

      .dc-partner-btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.12);
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.28);
        font-weight: 700;
        font-size: 0.8125rem;
        padding: 0.85rem 1.5rem;
        border-radius: 13px;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .dc-partner-btn-secondary:hover {
        background-color: rgba(255, 255, 255, 0.22);
        transform: translateY(-2px);
      }

      @media (max-width: 768px) {
        .dc-partner-banner {
          flex-direction: column;
          padding: 1.75rem 1.35rem;
          border-radius: 20px;
          text-align: center;
          gap: 1.35rem;
        }

        .dc-partner-content {
          align-items: center;
          text-align: center;
        }

        .dc-partner-title {
          font-size: 1.25rem;
        }

        .dc-partner-desc {
          font-size: 0.8125rem;
        }
      }
    </style>

    <div class="dc-home-container">
      
      <!-- 1. Auto-sliding Banners Hero Section (Kitchen, Health, Home Appliance, Medicine, Stationery) -->
      <section class="dc-hero-section">
        <div id="hero-slider">
          
          ${banners.map((b, idx) => {
            const fallback = defaultBanners[idx % defaultBanners.length] || defaultBanners[0];
            const imgUrl = b.image_url || b.Image_URL || b.image || b.Image || fallback.image_url;
            const title = (b.title || b.Title || fallback.title).trim();
            const subtitle = (b.subtitle || b.Subtitle || fallback.subtitle).trim();
            const tag = (b.tag || b.Tag || fallback.tag || 'বিশেষ অফার').trim();
            const highlight = (b.highlight || b.Highlight || fallback.highlight || '১০০% অথেন্টিক পণ্য').trim();
            const features = Array.isArray(b.features) && b.features.length > 0 ? b.features : (fallback.features || ["✓ ১০০% অরিজিনাল পণ্য", "✓ ক্যাশ অন ডেলিভারি"]);
            const btnText = (b.button_text || b.Button_Text || fallback.button_text || 'এখনই দেখুন').trim();
            const linkUrl = b.link_url || b.link || b.Link || b.Link_URL || fallback.link_url || '/products';
            const isActive = idx === 0;

            return `
              <div 
                class="banner-slide ${isActive ? 'active-slide' : ''}" 
                data-index="${idx}"
                style="opacity: ${isActive ? '1' : '0'}; z-index: ${isActive ? '10' : '0'}; visibility: ${isActive ? 'visible' : 'hidden'}; pointer-events: ${isActive ? 'auto' : 'none'};"
              >
                <!-- Background Image (Vibrant & Crisp) -->
                <img 
                  src="${imgUrl}" 
                  alt="${title || 'Dream Cart BD Banner'}" 
                  class="dc-banner-bg-img"
                  onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80';"
                />
                
                <!-- High-Contrast Readable Gradient Overlay -->
                <div class="dc-banner-overlay"></div>
                <div class="dc-banner-glow"></div>
                
                <!-- Responsive Inner Wrapper with Generous Padding & Margins -->
                <div class="dc-banner-inner">
                  
                  <!-- Left Text Content Overlay -->
                  <div class="dc-banner-content">
                    <div class="dc-banner-meta-row">
                      ${tag ? `
                        <span class="dc-banner-tag">
                          <span class="dc-banner-tag-dot animate-pulse"></span>
                          <span>${tag}</span>
                        </span>
                      ` : ''}
                      ${highlight ? `
                        <span class="dc-banner-highlight-badge">
                          ✨ ${highlight}
                        </span>
                      ` : ''}
                    </div>

                    ${title ? `
                      <h1 class="dc-banner-title">
                        ${title}
                      </h1>
                    ` : ''}

                    ${subtitle ? `
                      <p class="dc-banner-subtitle">
                        ${subtitle}
                      </p>
                    ` : ''}

                    ${features && features.length > 0 ? `
                      <div class="dc-banner-feature-list">
                        ${features.map(ft => `
                          <span class="dc-banner-feature-pill">${ft}</span>
                        `).join("")}
                      </div>
                    ` : ''}

                    <div class="dc-banner-actions">
                      <a href="${linkUrl}" class="dc-banner-btn-primary">
                        <span>${btnText}</span>
                        <span>→</span>
                      </a>
                      <a href="/offers" class="dc-banner-btn-secondary">
                        <span>🎁 সব অফার দেখুন</span>
                      </a>
                    </div>
                  </div>

                  <!-- Right Visual Preview Card (Laptop & Desktop) -->
                  <div class="dc-banner-visual-card">
                    <div class="dc-banner-visual-thumb-wrap">
                      <img 
                        src="${imgUrl}" 
                        alt="${title || 'Dream Cart BD'}" 
                        class="dc-banner-visual-thumb"
                        onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80';"
                      />
                    </div>
                    <div class="dc-banner-visual-caption">
                      <span class="dc-banner-visual-caption-text">${tag}</span>
                      <span class="dc-banner-visual-caption-badge">Verified ✓</span>
                    </div>
                  </div>

                </div>

              </div>
            `;
          }).join("")}

          <!-- Slider Dot Controls -->
          <div class="dc-slider-dots">
            ${banners.map((_, i) => `
              <button 
                class="slider-dot ${i === 0 ? 'active-dot bg-emerald-500 w-10' : 'bg-white/40 w-8'}"
                data-slide-target="${i}"
                aria-label="Go to slide ${i + 1}"
                onclick="window.__dcbdGoSlide && window.__dcbdGoSlide(${i})"
              ></button>
            `).join("")}
          </div>

          <!-- Prev/Next Navigation Arrows -->
          <button id="slider-btn-prev" class="dc-slider-arrow dc-slider-arrow-prev" aria-label="Previous Slide" onclick="window.__dcbdPrevSlide && window.__dcbdPrevSlide()">
            ‹
          </button>
          <button id="slider-btn-next" class="dc-slider-arrow dc-slider-arrow-next" aria-label="Next Slide" onclick="window.__dcbdNextSlide && window.__dcbdNextSlide()">
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
            <p class="dc-trust-desc">অথেন্টিক পণ্যের শতভাগ নিশ্চয়তা</p>
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
                <p class="dc-section-subtitle">আমাদের অফিসিয়াল ব্র্যান্ড পার্টনারগণ</p>
              </div>
            </div>
            <a href="/brands" class="dc-section-link-btn">
              সকল ব্র্যান্ড দেখুন (${brands.length}) <span>→</span>
            </a>
          </div>

          <div class="dc-brands-grid">
            ${brands.slice(0, 12).map(b => `
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

          ${brands.length > 12 ? `
            <div class="dc-brands-view-all-wrap">
              <a href="/brands" class="dc-section-link-btn" style="padding: 0.625rem 1.5rem; font-size: 0.875rem;">
                সকল ব্র্যান্ড দেখুন (${brands.length}টি) <span>→</span>
              </a>
            </div>
          ` : ''}
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
                সকল জনপ্রিয় পণ্য (Trending Collection)
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
        <div class="dc-partner-content">
          <span class="dc-partner-badge">
            ব্যবসার সুবর্ণ সুযোগ
          </span>
          <h3 class="dc-partner-title">
            আমাদের সাথে রিসেলার বা পাইকারি ব্যবসা শুরু করুন!
          </h3>
          <p class="dc-partner-desc">
            কোনো ধরনের ইনভেস্টমেন্ট ছাড়া নিজের ফেসবুক পেজ থেকে ড্রপশিপিং রিসেলিং করুন অথবা পাইকারি দামে বেশি মুনাফায় ব্যবসা বাড়ান।
          </p>
        </div>
        <div class="dc-partner-actions">
          <a href="/reseller/register" class="dc-partner-btn-primary">
            রিসেলার হোন →
          </a>
          <a href="/wholesaler/register" class="dc-partner-btn-secondary">
            পাইকারি ক্রেতা নিবন্ধন
          </a>
        </div>
      </section>

    </div>
  `;
}

export const HomePage = renderHomePage;
export default renderHomePage;
