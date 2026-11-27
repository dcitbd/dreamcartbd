/**
 * DREAM CART BD — PRODUCTS CATALOG PAGE (ShopPage.js / ProductsPage.js)
 * Implements user requirements:
 * - 60 pcs show per page (with pagination)
 * - Mobile 2-grid product layout: balanced typography, compact padding, uniform card heights
 * - Strict 2-line title clamping and character limit so cards never break across rows
 * - Modern Tree-Style Filter Sidebar:
 *   1. Category > Sub Category > Child Category expandable tree
 *   2. Price Ratio / Range (presets + custom min/max auto-filter)
 *   3. Rating filter (4.5+, 4.0+, 3.0+, All)
 *   4. Brand tree/list with instant brand search
 *   5. Stock status filter: All (selected by default), In-Stock, Out of Stock
 * - All filters auto-apply immediately on click/change without breaking SPA routing
 * - Fully responsive on mobile with toggleable filter drawer
 * - Search keyword support with Exact Match & Related Products separation
 * - Role-based pricing in cards
 * - 10-Minute Cyclic Product Rotation: Automatically shifts/rotates products so every item gets featured on the 1st page
 */

import { apiClient } from '../../api/client.js';
import { renderProductCard } from '../../components/ProductCard.js';
import { SearchService } from '../../services/SearchService.js';

/**
 * 10-Minute Cyclic Rotation Engine:
 * Deterministically rotates products every 10 minutes so that all products
 * take turns appearing on the first page and rotate positions seamlessly.
 */
export function rotateProductsByTime(products = [], intervalMinutes = 10, pageSize = 60, customTimestamp = null) {
  if (!Array.isArray(products) || products.length <= 1) return products;

  const N = products.length;
  const now = customTimestamp !== null ? customTimestamp : Date.now();
  const intervalMs = intervalMinutes * 60 * 1000;
  const timeBlock = Math.floor(now / intervalMs);

  const shiftStep = N > pageSize ? Math.max(1, Math.floor(pageSize / 3)) : 1;
  const offset = (timeBlock * shiftStep) % N;

  if (offset === 0) return [...products];
  return [...products.slice(offset), ...products.slice(0, offset)];
}

// Escape HTML safely for attributes & labels
function escShopHtml(str) {
  return String(str === null || str === undefined ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Attach global auto-filter & tree-toggle helpers once
if (typeof window !== 'undefined' && !window.__dcbdShopFilterHelpersAttached) {
  window.__dcbdShopFilterHelpersAttached = true;
  window.__dcbdPriceDebounceTimer = null;

  window.__dcbdNavigateShop = function (url) {
    if (window.router && typeof window.router.navigate === 'function') {
      window.router.navigate(url);
    } else {
      window.location.href = url;
    }
  };

  window.__dcbdApplyShopFilter = function (updates) {
    try {
      const currentParams = new URLSearchParams(window.location.search || '');
      const merged = {
        cat: currentParams.get('cat') || '',
        sub: currentParams.get('sub') || '',
        child: currentParams.get('child') || '',
        brand: currentParams.get('brand') || '',
        stock: currentParams.get('stock') || 'all',
        rating: currentParams.get('rating') || '',
        min_price: currentParams.get('min_price') || '',
        max_price: currentParams.get('max_price') || '',
        sort: currentParams.get('sort') || 'featured',
        search: currentParams.get('search') || '',
        page: '1',
        ...(updates || {})
      };

      const nextParams = new URLSearchParams();
      if (merged.cat) nextParams.set('cat', merged.cat);
      if (merged.sub) nextParams.set('sub', merged.sub);
      if (merged.child) nextParams.set('child', merged.child);
      if (merged.brand) nextParams.set('brand', merged.brand);
      if (merged.stock && merged.stock !== 'all') nextParams.set('stock', merged.stock);
      if (merged.rating) nextParams.set('rating', merged.rating);
      if (merged.min_price !== '' && merged.min_price !== null && merged.min_price !== undefined) {
        nextParams.set('min_price', String(merged.min_price));
      }
      if (merged.max_price !== '' && merged.max_price !== null && merged.max_price !== undefined) {
        nextParams.set('max_price', String(merged.max_price));
      }
      if (merged.sort && merged.sort !== 'featured') nextParams.set('sort', merged.sort);
      if (merged.search) nextParams.set('search', merged.search);
      if (merged.page && Number(merged.page) > 1) nextParams.set('page', String(merged.page));

      const qs = nextParams.toString();
      window.__dcbdNavigateShop('/products' + (qs ? '?' + qs : ''));
    } catch (e) {
      window.location.href = '/products';
    }
  };

  window.__dcbdApplyPriceRange = function (minVal, maxVal, immediate) {
    if (window.__dcbdPriceDebounceTimer) {
      clearTimeout(window.__dcbdPriceDebounceTimer);
      window.__dcbdPriceDebounceTimer = null;
    }
    const cleanMin = minVal !== '' && minVal !== null && minVal !== undefined && !isNaN(Number(minVal)) && Number(minVal) > 0
      ? String(Math.floor(Number(minVal)))
      : '';
    const cleanMax = maxVal !== '' && maxVal !== null && maxVal !== undefined && !isNaN(Number(maxVal)) && Number(maxVal) > 0
      ? String(Math.floor(Number(maxVal)))
      : '';

    const run = function () {
      window.__dcbdApplyShopFilter({ min_price: cleanMin, max_price: cleanMax, page: '1' });
    };

    if (immediate) {
      run();
    } else {
      window.__dcbdPriceDebounceTimer = setTimeout(run, 500);
    }
  };

  window.__dcbdToggleTreeSection = function (btn) {
    if (!btn) return;
    const section = btn.closest('.sf-tree-group');
    if (!section) return;
    section.classList.toggle('is-collapsed');
  };

  window.__dcbdToggleCatBranch = function (btn, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!btn) return;
    const node = btn.closest('.sf-cat-node');
    if (!node) return;
    node.classList.toggle('is-open');
  };

  window.__dcbdFilterBrandList = function (query) {
    const q = String(query || '').trim().toLowerCase();
    const items = document.querySelectorAll('#sf-brand-list .sf-brand-item');
    items.forEach(function (el) {
      const name = (el.getAttribute('data-brand-name') || '').toLowerCase();
      if (!q || name.includes(q)) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  };
}

export async function renderShopPage(params = {}) {
  const cat = (params.cat || "").trim();
  const subCat = (params.sub || "").trim();
  const childCat = (params.child || "").trim();
  const brand = (params.brand || "").trim();
  const ratingFilter = params.rating ? Number(params.rating) : 0;
  const minPriceParam = params.min_price !== undefined && params.min_price !== '' ? Number(params.min_price) : null;
  const maxPriceParam = params.max_price !== undefined && params.max_price !== '' ? Number(params.max_price) : null;

  const sort = params.sort || "featured";
  const search = (params.search || "").trim();

  // Stock filter: All products by default ('all'), unless explicitly filtered
  const stockFilter = params.stock || (params.in_stock === '1' || params.in_stock === true ? 'in_stock' : 'all');
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const pageSize = 60; // 60 pcs per page

  // Fetch all products from Products sheet
  const [prodRes] = await Promise.all([
    apiClient.request("products/list"),
    apiClient.request("brands/list")
  ]);

  const allProducts = (prodRes.data && prodRes.data.items) || [];

  // Helper to get effective customer price & rating for filtering
  const getProductPrice = (p) => {
    const stock = Number(p.stock !== undefined ? p.stock : 25);
    const base = Number(p.selling_price || p.price || 0);
    return stock <= 0 ? Math.round(base * 1.15) : base;
  };
  const getProductRating = (p) => Number(p.rating !== undefined && p.rating !== '' ? p.rating : 4.9);
  const getProductStock = (p) => Number(p.stock !== undefined ? p.stock : 25);

  // Compute global price bounds for slider
  const allPrices = allProducts.map(getProductPrice).filter(n => !isNaN(n) && n > 0);
  const globalMinPrice = allPrices.length ? Math.floor(Math.min(...allPrices)) : 0;
  const globalMaxPrice = allPrices.length ? Math.ceil(Math.max(...allPrices)) : 10000;

  // 1. Build Category Tree (Category > Sub Category > Child Category)
  const categoryTree = {};
  allProducts.forEach(p => {
    const rawCat = (p.category || 'General').trim();
    if (!rawCat || rawCat.toLowerCase() === 'test id') return;

    if (!categoryTree[rawCat]) {
      categoryTree[rawCat] = {
        name: rawCat,
        count: 0,
        subCategories: {}
      };
    }
    categoryTree[rawCat].count += 1;

    const rawSub = (p.sub_category || '').trim();
    if (rawSub) {
      if (!categoryTree[rawCat].subCategories[rawSub]) {
        categoryTree[rawCat].subCategories[rawSub] = {
          name: rawSub,
          count: 0,
          childCategories: {}
        };
      }
      categoryTree[rawCat].subCategories[rawSub].count += 1;

      const rawChild = (p.child_category || '').trim();
      if (rawChild) {
        if (!categoryTree[rawCat].subCategories[rawSub].childCategories[rawChild]) {
          categoryTree[rawCat].subCategories[rawSub].childCategories[rawChild] = {
            name: rawChild,
            count: 0
          };
        }
        categoryTree[rawCat].subCategories[rawSub].childCategories[rawChild].count += 1;
      }
    }
  });

  const categoriesList = Object.values(categoryTree).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  // 2. Extract Unique Brands with Counts
  const brandCountsMap = {};
  allProducts.forEach(p => {
    const b = (p.brand || '').trim();
    if (!b) return;
    brandCountsMap[b] = (brandCountsMap[b] || 0) + 1;
  });
  const uniqueBrands = Object.keys(brandCountsMap).sort((a, b) => a.localeCompare(b));

  // Stock counts
  const inStockCount = allProducts.filter(p => getProductStock(p) > 0).length;
  const outOfStockCount = allProducts.filter(p => getProductStock(p) <= 0).length;

  // Rating counts
  const rating45Count = allProducts.filter(p => getProductRating(p) >= 4.5).length;
  const rating40Count = allProducts.filter(p => getProductRating(p) >= 4.0).length;
  const rating30Count = allProducts.filter(p => getProductRating(p) >= 3.0).length;

  // Reusable attribute filter function (Category, Brand, Stock, Rating, Price)
  const applySidebarFilters = (list) => {
    let out = list;
    if (cat) {
      const cLower = cat.toLowerCase();
      out = out.filter(p => p.category && p.category.trim().toLowerCase() === cLower);
    }
    if (subCat) {
      const subLower = subCat.toLowerCase();
      out = out.filter(p => p.sub_category && p.sub_category.trim().toLowerCase() === subLower);
    }
    if (childCat) {
      const childLower = childCat.toLowerCase();
      out = out.filter(p => p.child_category && p.child_category.trim().toLowerCase() === childLower);
    }
    if (brand) {
      const bLower = brand.toLowerCase();
      out = out.filter(p => p.brand && p.brand.trim().toLowerCase() === bLower);
    }
    if (stockFilter === 'in_stock') {
      out = out.filter(p => getProductStock(p) > 0);
    } else if (stockFilter === 'out_of_stock') {
      out = out.filter(p => getProductStock(p) <= 0);
    }
    if (ratingFilter > 0) {
      out = out.filter(p => getProductRating(p) >= ratingFilter);
    }
    if (minPriceParam !== null && !isNaN(minPriceParam)) {
      out = out.filter(p => getProductPrice(p) >= minPriceParam);
    }
    if (maxPriceParam !== null && !isNaN(maxPriceParam)) {
      out = out.filter(p => getProductPrice(p) <= maxPriceParam);
    }
    return out;
  };

  // 3. Filter Products & Intelligent Search Ranking
  let filteredProducts = [...allProducts];
  let directMatches = [];
  let relatedProducts = [];

  if (search) {
    const searchRes = SearchService.search(allProducts, search);
    const qNorm = SearchService.normalize ? SearchService.normalize(search) : search.toLowerCase().trim();
    const qSku = SearchService.cleanSku ? SearchService.cleanSku(search) : search.toLowerCase().replace(/[^a-z0-9]/g, '');
    const qTokens = SearchService.tokenize ? SearchService.tokenize(search) : qNorm.split(' ').filter(Boolean);

    const isExactMatchProduct = (p) => {
      const pName = SearchService.normalize ? SearchService.normalize(p.name || p.p_name || '') : String(p.name || p.p_name || '').toLowerCase().trim();
      const pSku = SearchService.cleanSku ? SearchService.cleanSku(p.sku || p.product_id || '') : String(p.sku || p.product_id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pSlug = SearchService.normalize ? SearchService.normalize(p.slug || '') : String(p.slug || '').toLowerCase().trim();
      if (qSku.length >= 2 && pSku && pSku === qSku) return true;
      if (pName && qNorm && (pName === qNorm || pName.startsWith(qNorm) || (qNorm.length >= 3 && pName.includes(qNorm)))) return true;
      if (pSlug && qNorm && pSlug === qNorm) return true;
      if (qTokens.length >= 2 && pName && qTokens.every(tok => pName.includes(tok))) return true;
      if (Number(p._searchScore || 0) >= 650) return true;
      return false;
    };

    const rawDirect = [...(searchRes.directMatches || [])];
    const exactBucket = [];
    const partialBucket = [];
    const seenIds = new Set();

    rawDirect.forEach(p => {
      const uid = String(p.product_id || p.sku || p.slug || p.name || '').toLowerCase();
      if (uid) seenIds.add(uid);
      if (isExactMatchProduct(p)) {
        exactBucket.push({ ...p, _isDirectMatch: true, _isExactMatch: true });
      } else {
        partialBucket.push({ ...p, _isDirectMatch: false, _isExactMatch: false });
      }
    });

    const extraRelated = (searchRes.relatedProducts || [])
      .filter(p => {
        const uid = String(p.product_id || p.sku || p.slug || p.name || '').toLowerCase();
        if (uid && seenIds.has(uid)) return false;
        if (uid) seenIds.add(uid);
        return true;
      })
      .map(p => ({ ...p, _isDirectMatch: false, _isExactMatch: false }));

    directMatches = applySidebarFilters(exactBucket);
    relatedProducts = applySidebarFilters([...partialBucket, ...extraRelated]);

    if (sort === "low_high") {
      directMatches.sort((a, b) => getProductPrice(a) - getProductPrice(b));
      relatedProducts.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sort === "high_low") {
      directMatches.sort((a, b) => getProductPrice(b) - getProductPrice(a));
      relatedProducts.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    } else if (sort === "rating_high") {
      directMatches.sort((a, b) => getProductRating(b) - getProductRating(a));
      relatedProducts.sort((a, b) => getProductRating(b) - getProductRating(a));
    } else if (sort === "name_asc") {
      directMatches.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      relatedProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      relatedProducts = rotateProductsByTime(relatedProducts, 10, pageSize);
    }

    filteredProducts = [...directMatches, ...relatedProducts];
  } else {
    filteredProducts = applySidebarFilters(filteredProducts);

    if (sort === "low_high") {
      filteredProducts.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sort === "high_low") {
      filteredProducts.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    } else if (sort === "rating_high") {
      filteredProducts.sort((a, b) => getProductRating(b) - getProductRating(a));
    } else if (sort === "name_asc") {
      filteredProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      filteredProducts = rotateProductsByTime(filteredProducts, 10, pageSize);
    }
  }

  // Pagination (60 pcs per page)
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize) || 1;
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  const pageDirectMatches = paginatedProducts.filter(p => p._isDirectMatch !== false);
  const pageRelatedProducts = paginatedProducts.filter(p => p._isDirectMatch === false);

  // Sync header search bar with active search query
  if (typeof document !== 'undefined' && search) {
    setTimeout(() => {
      const dInp = document.getElementById('global-search-input');
      const mInp = document.getElementById('mobile-search-input');
      const dClear = document.getElementById('global-search-clear-btn');
      const mClear = document.getElementById('mobile-search-clear-btn');
      if (dInp && dInp.value !== search) dInp.value = search;
      if (mInp && mInp.value !== search) mInp.value = search;
      if (dClear) dClear.classList.remove('hidden');
      if (mClear) mClear.classList.remove('hidden');
    }, 10);
  }

  if (typeof window !== 'undefined' && window.__dcbdProductRotationTimer) {
    clearTimeout(window.__dcbdProductRotationTimer);
  }

  const hasPriceFilter = (minPriceParam !== null && !isNaN(minPriceParam)) || (maxPriceParam !== null && !isNaN(maxPriceParam));
  const hasActiveFilters = Boolean(cat || subCat || childCat || brand || stockFilter !== 'all' || ratingFilter > 0 || hasPriceFilter || search);

  // Helper function to build URL with query params
  function buildFilterUrl(newParams) {
    const combined = {
      cat,
      sub: subCat,
      child: childCat,
      brand,
      stock: stockFilter,
      rating: ratingFilter ? String(ratingFilter) : '',
      min_price: minPriceParam !== null && !isNaN(minPriceParam) ? String(minPriceParam) : '',
      max_price: maxPriceParam !== null && !isNaN(maxPriceParam) ? String(maxPriceParam) : '',
      sort,
      search,
      ...newParams
    };
    const searchParams = new URLSearchParams();
    if (combined.cat) searchParams.set('cat', combined.cat);
    if (combined.sub) searchParams.set('sub', combined.sub);
    if (combined.child) searchParams.set('child', combined.child);
    if (combined.brand) searchParams.set('brand', combined.brand);
    if (combined.stock && combined.stock !== 'all') searchParams.set('stock', combined.stock);
    if (combined.rating) searchParams.set('rating', combined.rating);
    if (combined.min_price !== '' && combined.min_price !== null && combined.min_price !== undefined) {
      searchParams.set('min_price', String(combined.min_price));
    }
    if (combined.max_price !== '' && combined.max_price !== null && combined.max_price !== undefined) {
      searchParams.set('max_price', String(combined.max_price));
    }
    if (combined.sort && combined.sort !== 'featured') searchParams.set('sort', combined.sort);
    if (combined.search) searchParams.set('search', combined.search);
    if (combined.page && combined.page > 1) searchParams.set('page', combined.page);
    const qs = searchParams.toString();
    return '/products' + (qs ? '?' + qs : '');
  }

  // Price range presets
  const pricePresets = [
    { label: 'সকল দাম (All)', min: '', max: '' },
    { label: '৳৫০০ এর নিচে', min: '', max: '500' },
    { label: '৳৫০০ - ৳১,৫০০', min: '500', max: '1500' },
    { label: '৳১,৫০০ - ৳৩,০০০', min: '1500', max: '3000' },
    { label: '৳৩,০০০ - ৳৫,০০০', min: '3000', max: '5000' },
    { label: '৳৫,০০০ এর বেশি', min: '5000', max: '' }
  ];

  const isPricePresetActive = (pMin, pMax) => {
    const curMin = minPriceParam !== null && !isNaN(minPriceParam) ? String(minPriceParam) : '';
    const curMax = maxPriceParam !== null && !isNaN(maxPriceParam) ? String(maxPriceParam) : '';
    return curMin === pMin && curMax === pMax;
  };

  // Active filter chips for quick removal
  const activeChips = [];
  if (cat) activeChips.push({ label: `ক্যাটাগরি: ${cat}`, url: buildFilterUrl({ cat: '', sub: '', child: '', page: 1 }) });
  if (subCat) activeChips.push({ label: `সাব: ${subCat}`, url: buildFilterUrl({ sub: '', child: '', page: 1 }) });
  if (childCat) activeChips.push({ label: `চাইল্ড: ${childCat}`, url: buildFilterUrl({ child: '', page: 1 }) });
  if (brand) activeChips.push({ label: `ব্র্যান্ড: ${brand}`, url: buildFilterUrl({ brand: '', page: 1 }) });
  if (stockFilter === 'in_stock') activeChips.push({ label: 'স্টক: ইন-স্টক', url: buildFilterUrl({ stock: 'all', page: 1 }) });
  if (stockFilter === 'out_of_stock') activeChips.push({ label: 'স্টক: স্টক শেষ', url: buildFilterUrl({ stock: 'all', page: 1 }) });
  if (ratingFilter > 0) activeChips.push({ label: `রেটিং: ${ratingFilter}+ ★`, url: buildFilterUrl({ rating: '', page: 1 }) });
  if (hasPriceFilter) {
    const pText = (minPriceParam ? `৳${minPriceParam}` : '৳০') + ' – ' + (maxPriceParam ? `৳${maxPriceParam}` : 'সর্বোচ্চ');
    activeChips.push({ label: `দাম: ${pText}`, url: buildFilterUrl({ min_price: '', max_price: '', page: 1 }) });
  }
  if (search) activeChips.push({ label: `সার্চ: "${search}"`, url: buildFilterUrl({ search: '', page: 1 }) });

  return `
    <style id="dc-shop-products-styles">
      /* Responsive Products Catalog Layout */
      .product-grid {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)) !important;
        gap: 1.25rem !important;
        width: 100% !important;
      }

      @media (max-width: 1023px) {
        .product-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 0.875rem !important;
        }
      }

      /* 2-Column Mobile Grid for Products Page */
      @media (max-width: 640px) {
        .product-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 0.5rem !important;
        }

        .product-card {
          border-radius: 0.875rem !important;
        }

        .product-card-title {
          font-size: 11.5px !important;
          line-height: 1.25 !important;
          min-height: 2.3em !important;
          max-height: 2.3em !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
      }

      /* Universal Title Line Clamp with fixed height */
      .product-card-title {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        min-height: 2.4em;
        max-height: 2.4em;
        line-height: 1.3;
      }

      /* Smooth elevation */
      .product-card {
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      }
      .product-card:hover {
        transform: translateY(-3px);
      }

      /* Modern Tree-Style Filter Sidebar */
      .sf-sidebar {
        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid #e2e8f0;
        border-radius: 22px;
        padding: 16px;
        box-shadow: 0 10px 30px -12px rgba(15, 23, 42, 0.08);
      }
      .dark .sf-sidebar {
        background: linear-gradient(180deg, #0f172a 0%, #0b1220 100%);
        border-color: #1e293b;
        box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.5);
      }

      .sf-tree-group {
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        background: #ffffff;
        overflow: hidden;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .dark .sf-tree-group {
        border-color: #1e293b;
        background: #0f172a;
      }
      .sf-tree-group:hover {
        border-color: #cbd5e1;
      }
      .dark .sf-tree-group:hover {
        border-color: #334155;
      }

      .sf-tree-head {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 11px 13px;
        background: rgba(248, 250, 252, 0.85);
        border: none;
        cursor: pointer;
        text-align: left;
        font-size: 12px;
        font-weight: 800;
        color: #0f172a;
        transition: background 0.15s ease;
      }
      .dark .sf-tree-head {
        background: rgba(30, 41, 59, 0.55);
        color: #f8fafc;
      }
      .sf-tree-head:hover {
        background: rgba(16, 185, 129, 0.07);
      }
      .sf-tree-caret {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: #e2e8f0;
        color: #475569;
        font-size: 10px;
        transition: transform 0.2s ease;
      }
      .dark .sf-tree-caret {
        background: #1e293b;
        color: #94a3b8;
      }
      .sf-tree-group.is-collapsed .sf-tree-caret {
        transform: rotate(-90deg);
      }
      .sf-tree-group.is-collapsed .sf-tree-body {
        display: none;
      }
      .sf-tree-body {
        padding: 10px 11px 12px;
        border-top: 1px solid #f1f5f9;
      }
      .dark .sf-tree-body {
        border-top-color: #1e293b;
      }

      /* Tree branch lines */
      .sf-branch-list {
        position: relative;
        padding-left: 12px;
        margin-left: 6px;
        border-left: 1.5px dashed #cbd5e1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .dark .sf-branch-list {
        border-left-color: #334155;
      }
      .sf-branch-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        padding: 6px 9px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;
        color: #334155;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .sf-branch-item::before {
        content: "";
        position: absolute;
        left: -12px;
        top: 50%;
        width: 10px;
        height: 1.5px;
        background: #cbd5e1;
      }
      .dark .sf-branch-item {
        color: #cbd5e1;
      }
      .dark .sf-branch-item::before {
        background: #334155;
      }
      .sf-branch-item:hover {
        background: #f1f5f9;
        color: #059669;
      }
      .dark .sf-branch-item:hover {
        background: #1e293b;
        color: #34d399;
      }
      .sf-branch-item.is-active {
        background: linear-gradient(135deg, #059669, #10b981);
        color: #ffffff !important;
        font-weight: 700;
        box-shadow: 0 4px 12px -4px rgba(16, 185, 129, 0.55);
      }
      .sf-branch-item.is-active::before {
        background: #10b981;
      }
      .sf-count-pill {
        font-size: 10px;
        font-weight: 700;
        padding: 1px 7px;
        border-radius: 9999px;
        background: #f1f5f9;
        color: #64748b;
        flex-shrink: 0;
      }
      .dark .sf-count-pill {
        background: #1e293b;
        color: #94a3b8;
      }
      .sf-branch-item.is-active .sf-count-pill {
        background: rgba(255, 255, 255, 0.22);
        color: #ffffff;
      }

      /* Expandable Category Tree Nodes */
      .sf-cat-row {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .sf-cat-toggle {
        width: 22px;
        height: 22px;
        border-radius: 7px;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        color: #475569;
        font-size: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: transform 0.18s ease, background 0.15s ease;
      }
      .dark .sf-cat-toggle {
        border-color: #334155;
        background: #1e293b;
        color: #cbd5e1;
      }
      .sf-cat-node.is-open > .sf-cat-row .sf-cat-toggle {
        transform: rotate(90deg);
        background: #ecfdf5;
        color: #059669;
        border-color: #a7f3d0;
      }
      .dark .sf-cat-node.is-open > .sf-cat-row .sf-cat-toggle {
        background: rgba(16, 185, 129, 0.16);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.4);
      }
      .sf-cat-children {
        display: none;
        margin-top: 4px;
        margin-bottom: 4px;
      }
      .sf-cat-node.is-open > .sf-cat-children {
        display: flex;
      }

      /* Price Range Slider & Inputs */
      .sf-price-inputs {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 6px;
        margin-top: 8px;
      }
      .sf-price-input {
        width: 100%;
        padding: 6px 8px;
        font-size: 11.5px;
        font-weight: 700;
        border-radius: 10px;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        color: #0f172a;
        outline: none;
        text-align: center;
      }
      .sf-price-input:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18);
      }
      .dark .sf-price-input {
        background: #1e293b;
        border-color: #334155;
        color: #f8fafc;
      }
      .sf-range-slider {
        width: 100%;
        accent-color: #10b981;
        cursor: pointer;
        margin-top: 8px;
      }
    </style>

    <div class="space-y-6 pb-20">
      
      <!-- Breadcrumb & Page Header -->
      <div class="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div class="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-400 mb-2 flex-wrap">
          <a href="/" class="hover:text-emerald-600 transition">হোম</a>
          <span>/</span>
          <a href="/products" class="${!cat ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600 transition'}">সকল পণ্য</a>
          ${cat ? `<span>/</span> <span class="text-slate-700 dark:text-slate-200 font-bold">${escShopHtml(cat)}</span>` : ""}
          ${subCat ? `<span>/</span> <span class="text-emerald-600 font-semibold">${escShopHtml(subCat)}</span>` : ""}
          ${childCat ? `<span>/</span> <span class="text-emerald-600 font-semibold">${escShopHtml(childCat)}</span>` : ""}
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ${search ? `সার্চ রেজাল্ট: "${escShopHtml(search)}"` : (cat ? `${escShopHtml(cat)}` : "আমাদের সকল পণ্যসমূহ")}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ${search 
                ? `মোট ${totalProducts} টি পণ্য পাওয়া গেছে (${directMatches.length} টি সরাসরি ম্যাচ${relatedProducts.length > 0 ? `, ${relatedProducts.length} টি সম্পর্কিত পণ্য` : ''})` 
                : `মোট ${totalProducts} টি পণ্য পাওয়া গেছে • পেজ প্রতি ৬০ টি পণ্য প্রদর্শন`}
            </p>
          </div>

          ${hasActiveFilters ? `
            <a href="/products" class="btn-secondary text-xs py-1.5 px-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 self-start sm:self-auto flex items-center gap-1">
              <span>✕</span> সব ফিল্টার মুছুন
            </a>
          ` : ""}
        </div>
      </div>

      <!-- Mobile Filter Toggle Bar (Visible on mobile/tablet screens) -->
      <div class="lg:hidden flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button 
          type="button"
          id="btn-mobile-filter-toggle"
          class="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl text-xs font-bold transition hover:bg-emerald-100"
          onclick="const panel = document.getElementById('catalog-sidebar-filter'); if(panel) panel.classList.toggle('hidden');"
        >
          <span>🌳 ট্রি ফিল্টার ও ক্যাটাগরি</span>
          ${hasActiveFilters ? '<span class="w-2 h-2 rounded-full bg-emerald-500"></span>' : ''}
        </button>

        <div class="text-xs text-slate-500 dark:text-slate-400">
          <strong>${totalProducts}</strong> টি পণ্য
        </div>
      </div>

      <!-- Main Layout: Tree Filter Sidebar + Product Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        <!-- Tree-Style Filter Panel (Collapsible on mobile, sticky sidebar on desktop) -->
        <aside id="catalog-sidebar-filter" class="hidden lg:block sf-sidebar space-y-3.5 sticky top-20">
          
          <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-600 text-white text-xs shadow-xs">🌳</span>
              <div>
                <div class="text-xs font-black text-slate-900 dark:text-white">ফিল্টার ট্রি (Filters)</div>
                <div class="text-[10px] text-slate-400">ক্লিক করলেই অটো ফিল্টার হবে</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              ${hasActiveFilters ? `
                <a href="/products" class="text-[10px] font-bold text-rose-600 hover:underline">রিসেট</a>
              ` : ''}
              <button 
                type="button"
                class="lg:hidden text-xs text-slate-500 hover:text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800"
                onclick="document.getElementById('catalog-sidebar-filter').classList.add('hidden')"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- 1. Category Tree Filter (Category > Sub > Child) -->
          <div class="sf-tree-group">
            <button type="button" class="sf-tree-head" onclick="window.__dcbdToggleTreeSection(this);">
              <span>📂 ক্যাটাগরি ট্রি (${categoriesList.length})</span>
              <span class="sf-tree-caret">▾</span>
            </button>
            <div class="sf-tree-body space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              <a 
                href="${buildFilterUrl({ cat: '', sub: '', child: '', page: 1 })}" 
                class="sf-branch-item ${!cat ? 'is-active' : ''}"
                style="margin-left: 0;"
              >
                <span class="truncate">🌐 সকল ক্যাটাগরি</span>
                <span class="sf-count-pill">${allProducts.length}</span>
              </a>

              <div class="sf-branch-list">
                ${categoriesList.map(c => {
                  const isActiveCat = cat.toLowerCase() === c.name.toLowerCase();
                  const subCats = Object.values(c.subCategories).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
                  const hasSubs = subCats.length > 0;
                  return `
                    <div class="sf-cat-node ${isActiveCat ? 'is-open' : ''}">
                      <div class="sf-cat-row">
                        <a 
                          href="${buildFilterUrl({ cat: c.name, sub: '', child: '', page: 1 })}" 
                          class="sf-branch-item flex-1 min-w-0 ${isActiveCat && !subCat ? 'is-active' : ''}"
                        >
                          <span class="truncate">${escShopHtml(c.name)}</span>
                          <span class="sf-count-pill">${c.count}</span>
                        </a>
                        ${hasSubs ? `
                          <button type="button" class="sf-cat-toggle" title="সাব-ক্যাটাগরি দেখুন" onclick="window.__dcbdToggleCatBranch(this, event);">▸</button>
                        ` : ''}
                      </div>

                      ${hasSubs ? `
                        <div class="sf-cat-children sf-branch-list" style="margin-left: 10px;">
                          ${subCats.map(sc => {
                            const isActiveSub = isActiveCat && subCat.toLowerCase() === sc.name.toLowerCase();
                            const childCats = Object.values(sc.childCategories).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
                            const hasChildren = childCats.length > 0;
                            return `
                              <div class="sf-cat-node ${isActiveSub ? 'is-open' : ''}">
                                <div class="sf-cat-row">
                                  <a 
                                    href="${buildFilterUrl({ cat: c.name, sub: sc.name, child: '', page: 1 })}" 
                                    class="sf-branch-item flex-1 min-w-0 text-[11px] ${isActiveSub && !childCat ? 'is-active' : ''}"
                                  >
                                    <span class="truncate">${escShopHtml(sc.name)}</span>
                                    <span class="sf-count-pill">${sc.count}</span>
                                  </a>
                                  ${hasChildren ? `
                                    <button type="button" class="sf-cat-toggle" title="চাইল্ড ক্যাটাগরি দেখুন" onclick="window.__dcbdToggleCatBranch(this, event);">▸</button>
                                  ` : ''}
                                </div>

                                ${hasChildren ? `
                                  <div class="sf-cat-children sf-branch-list" style="margin-left: 10px;">
                                    ${childCats.map(cc => {
                                      const isActiveChild = isActiveSub && childCat.toLowerCase() === cc.name.toLowerCase();
                                      return `
                                        <a 
                                          href="${buildFilterUrl({ cat: c.name, sub: sc.name, child: cc.name, page: 1 })}" 
                                          class="sf-branch-item text-[10.5px] ${isActiveChild ? 'is-active' : ''}"
                                        >
                                          <span class="truncate">${escShopHtml(cc.name)}</span>
                                          <span class="sf-count-pill">${cc.count}</span>
                                        </a>
                                      `;
                                    }).join("")}
                                  </div>
                                ` : ""}
                              </div>
                            `;
                          }).join("")}
                        </div>
                      ` : ""}
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>

          <!-- 2. Price Ratio / Range Tree Filter -->
          <div class="sf-tree-group">
            <button type="button" class="sf-tree-head" onclick="window.__dcbdToggleTreeSection(this);">
              <span>💰 প্রাইজ রেশিও (Price Range)</span>
              <span class="sf-tree-caret">▾</span>
            </button>
            <div class="sf-tree-body">
              <div class="sf-branch-list">
                ${pricePresets.map(pr => {
                  const active = isPricePresetActive(pr.min, pr.max);
                  return `
                    <a 
                      href="${buildFilterUrl({ min_price: pr.min, max_price: pr.max, page: 1 })}" 
                      class="sf-branch-item text-[11.5px] ${active ? 'is-active' : ''}"
                    >
                      <span>${pr.label}</span>
                      ${active ? '<span class="sf-count-pill">✓</span>' : ''}
                    </a>
                  `;
                }).join("")}
              </div>

              <!-- Custom Min/Max Auto-Filter Slider & Inputs -->
              <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <div class="flex items-center justify-between text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                  <span>কাস্টম বাজেট (৳${globalMinPrice} - ৳${globalMaxPrice})</span>
                  ${hasPriceFilter ? `<a href="${buildFilterUrl({ min_price: '', max_price: '', page: 1 })}" class="text-emerald-600 hover:underline">ক্লিয়ার</a>` : ''}
                </div>
                <input
                  type="range"
                  id="sf-price-max-slider"
                  class="sf-range-slider"
                  min="${globalMinPrice}"
                  max="${globalMaxPrice}"
                  step="50"
                  value="${maxPriceParam !== null && !isNaN(maxPriceParam) ? Math.min(globalMaxPrice, Math.max(globalMinPrice, maxPriceParam)) : globalMaxPrice}"
                  oninput="var mx=document.getElementById('sf-price-max-input'); if(mx) mx.value=this.value;"
                  onchange="window.__dcbdApplyPriceRange(document.getElementById('sf-price-min-input')?.value, this.value, true);"
                />
                <div class="sf-price-inputs">
                  <input
                    type="number"
                    id="sf-price-min-input"
                    class="sf-price-input"
                    placeholder="মিনিমাম ৳"
                    min="0"
                    value="${minPriceParam !== null && !isNaN(minPriceParam) ? minPriceParam : ''}"
                    oninput="window.__dcbdApplyPriceRange(this.value, document.getElementById('sf-price-max-input')?.value, false);"
                  />
                  <span class="text-xs font-bold text-slate-400">—</span>
                  <input
                    type="number"
                    id="sf-price-max-input"
                    class="sf-price-input"
                    placeholder="সর্বোচ্চ ৳"
                    min="0"
                    value="${maxPriceParam !== null && !isNaN(maxPriceParam) ? maxPriceParam : ''}"
                    oninput="window.__dcbdApplyPriceRange(document.getElementById('sf-price-min-input')?.value, this.value, false);"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Rating Tree Filter -->
          <div class="sf-tree-group">
            <button type="button" class="sf-tree-head" onclick="window.__dcbdToggleTreeSection(this);">
              <span>⭐ রেটিং ফিল্টার (Rating)</span>
              <span class="sf-tree-caret">▾</span>
            </button>
            <div class="sf-tree-body">
              <div class="sf-branch-list">
                <a href="${buildFilterUrl({ rating: '', page: 1 })}" class="sf-branch-item ${!ratingFilter ? 'is-active' : ''}">
                  <span>সকল রেটিং (All)</span>
                  <span class="sf-count-pill">${allProducts.length}</span>
                </a>
                <a href="${buildFilterUrl({ rating: '4.5', page: 1 })}" class="sf-branch-item ${ratingFilter === 4.5 ? 'is-active' : ''}">
                  <span><span class="text-amber-500">★★★★★</span> ৪.৫+</span>
                  <span class="sf-count-pill">${rating45Count}</span>
                </a>
                <a href="${buildFilterUrl({ rating: '4', page: 1 })}" class="sf-branch-item ${ratingFilter === 4 ? 'is-active' : ''}">
                  <span><span class="text-amber-500">★★★★☆</span> ৪.০+</span>
                  <span class="sf-count-pill">${rating40Count}</span>
                </a>
                <a href="${buildFilterUrl({ rating: '3', page: 1 })}" class="sf-branch-item ${ratingFilter === 3 ? 'is-active' : ''}">
                  <span><span class="text-amber-500">★★★☆☆</span> ৩.০+</span>
                  <span class="sf-count-pill">${rating30Count}</span>
                </a>
              </div>
            </div>
          </div>

          <!-- 4. Brand Tree Filter -->
          <div class="sf-tree-group">
            <button type="button" class="sf-tree-head" onclick="window.__dcbdToggleTreeSection(this);">
              <span>🏷️ ব্র্যান্ড ফিল্টার (${uniqueBrands.length})</span>
              <span class="sf-tree-caret">▾</span>
            </button>
            <div class="sf-tree-body space-y-2">
              ${uniqueBrands.length > 5 ? `
                <input
                  type="text"
                  class="sf-price-input text-left"
                  style="text-align: left; padding: 6px 10px;"
                  placeholder="🔍 ব্র্যান্ড খুঁজুন..."
                  oninput="window.__dcbdFilterBrandList(this.value);"
                />
              ` : ''}
              <div id="sf-brand-list" class="sf-branch-list max-h-[220px] overflow-y-auto pr-1">
                <a 
                  href="${buildFilterUrl({ brand: '', page: 1 })}" 
                  class="sf-branch-item sf-brand-item ${!brand ? 'is-active' : ''}"
                  data-brand-name="all"
                >
                  <span class="truncate">সকল ব্র্যান্ড (All)</span>
                  <span class="sf-count-pill">${allProducts.length}</span>
                </a>
                ${uniqueBrands.map(b => {
                  const isActiveBrand = brand.toLowerCase() === b.toLowerCase();
                  return `
                    <a 
                      href="${buildFilterUrl({ brand: b, page: 1 })}" 
                      class="sf-branch-item sf-brand-item ${isActiveBrand ? 'is-active' : ''}"
                      data-brand-name="${escShopHtml(b)}"
                    >
                      <span class="truncate">${escShopHtml(b)}</span>
                      <span class="sf-count-pill">${brandCountsMap[b]}</span>
                    </a>
                  `;
                }).join("")}
              </div>
            </div>
          </div>

          <!-- 5. Stock Status Tree Filter (All selected by default) -->
          <div class="sf-tree-group">
            <button type="button" class="sf-tree-head" onclick="window.__dcbdToggleTreeSection(this);">
              <span>📦 স্টক স্ট্যাটাস (Stock)</span>
              <span class="sf-tree-caret">▾</span>
            </button>
            <div class="sf-tree-body">
              <div class="sf-branch-list">
                <a href="${buildFilterUrl({ stock: 'all', page: 1 })}" class="sf-branch-item ${stockFilter === 'all' ? 'is-active' : ''}">
                  <span>সকল পণ্য (All)</span>
                  <span class="sf-count-pill">${allProducts.length}</span>
                </a>
                <a href="${buildFilterUrl({ stock: 'in_stock', page: 1 })}" class="sf-branch-item ${stockFilter === 'in_stock' ? 'is-active' : ''}">
                  <span>ইন-স্টক (In-Stock)</span>
                  <span class="sf-count-pill">${inStockCount}</span>
                </a>
                <a href="${buildFilterUrl({ stock: 'out_of_stock', page: 1 })}" class="sf-branch-item ${stockFilter === 'out_of_stock' ? 'is-active' : ''}">
                  <span>স্টক শেষ / প্রি-অর্ডার</span>
                  <span class="sf-count-pill">${outOfStockCount}</span>
                </a>
              </div>
            </div>
          </div>

        </aside>

        <!-- Right Products Column -->
        <div class="lg:col-span-3 space-y-5">
          
          <!-- Active Filter Chips (if any filter applied) -->
          ${activeChips.length > 0 ? `
            <div class="flex flex-wrap items-center gap-2">
              ${activeChips.map(ch => `
                <a href="${ch.url}" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition">
                  <span>${escShopHtml(ch.label)}</span>
                  <span class="font-black">✕</span>
                </a>
              `).join('')}
            </div>
          ` : ''}

          <!-- Controls Toolbar: Sort by price/rating & Layout info -->
          <div class="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="text-slate-500 dark:text-slate-400">
              দেখাচ্ছে <strong class="text-slate-900 dark:text-white">${totalProducts === 0 ? 0 : startIndex + 1} - ${Math.min(startIndex + pageSize, totalProducts)}</strong> (সর্বমোট ${totalProducts} টির মধ্যে)
            </div>

            <!-- Sort By Dropdown -->
            <div class="flex items-center gap-2">
              <span class="text-slate-500 dark:text-slate-400 font-medium">সর্ট করুন:</span>
              <select 
                id="catalog-sort-select"
                class="form-control py-1.5 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white outline-none"
                onchange="window.__dcbdApplyShopFilter({ sort: this.value, page: '1' });"
              >
                <option value="featured" ${sort === 'featured' ? 'selected' : ''}>জনপ্রিয় পণ্য (১০ মি. ঘূর্ণায়মান)</option>
                <option value="low_high" ${sort === 'low_high' ? 'selected' : ''}>দাম: কম থেকে বেশি (Low to High)</option>
                <option value="high_low" ${sort === 'high_low' ? 'selected' : ''}>দাম: বেশি থেকে কম (High to Low)</option>
                <option value="rating_high" ${sort === 'rating_high' ? 'selected' : ''}>সেরা রেটিং (Top Rated)</option>
                <option value="name_asc" ${sort === 'name_asc' ? 'selected' : ''}>নাম: A থেকে Z</option>
              </select>
            </div>
          </div>

          <!-- Product Grid -->
          ${paginatedProducts.length === 0 ? `
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div class="text-5xl">🔍</div>
              <h3 class="text-base font-bold text-slate-800 dark:text-white">${search ? `"${escShopHtml(search)}" এর সাথে কোনো পণ্য মেলেনি` : 'কোনো পণ্য পাওয়া যায়নি'}</h3>
              <p class="text-xs text-slate-500 max-w-sm mx-auto">
                ${search ? 'অন্য কোনো কি-ওয়ার্ড দিয়ে সার্চ করুন অথবা আমাদের সকল পণ্য ব্রাউজ করুন।' : 'আপনার দেওয়া ফিল্টারের সাথে মিলে এমন কোনো পণ্য মেলেনি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।'}
              </p>
              <a href="/products" class="btn-primary mt-2 text-xs py-2 px-5 inline-flex">
                সকল পণ্য দেখুন
              </a>
            </div>
          ` : (search ? `
            <div class="space-y-8">
              ${pageDirectMatches.length > 0 ? `
                <!-- Exact Match Section (Highlighted Separately at Top) -->
                <div class="space-y-3 p-4 sm:p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-300/80 dark:border-emerald-700/60 shadow-sm">
                  <div class="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2.5">
                    <div class="flex items-center gap-2">
                      <span class="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs">🎯</span>
                      <h2 class="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide">
                        হুবহু মিলে যাওয়া পণ্য (${directMatches.length} টি)
                      </h2>
                    </div>
                    <span class="text-[11px] font-extrabold text-white bg-emerald-600 px-2.5 py-0.5 rounded-full">Exact Match</span>
                  </div>
                  <div class="product-grid">
                    ${pageDirectMatches.map(p => renderProductCard(p)).join("")}
                  </div>
                </div>
              ` : `
                <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
                  <span class="text-lg flex-shrink-0">💡</span>
                  <div>
                    <strong>"${escShopHtml(search)}"</strong> এর সাথে সরাসরি কোনো পণ্য মেলেনি। তবে সম্পর্কিত এই পণ্যগুলো দেখতে পারেন:
                  </div>
                </div>
              `}

              ${pageRelatedProducts.length > 0 ? `
                <!-- Related Products Section (Below Exact Match) -->
                <div class="space-y-3 pt-3">
                  <div class="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                    <div class="flex items-center gap-2">
                      <span class="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-xs">✨</span>
                      <h2 class="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide">
                        রিলেটেড প্রোডাক্টসমূহ (${relatedProducts.length} টি)
                      </h2>
                    </div>
                    <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">সম্পর্কিত অন্যান্য পণ্য</span>
                  </div>
                  <div class="product-grid">
                    ${pageRelatedProducts.map(p => renderProductCard(p)).join("")}
                  </div>
                </div>
              ` : ''}
            </div>
          ` : `
            <div class="product-grid">
              ${paginatedProducts.map(p => renderProductCard(p)).join("")}
            </div>
          `)}

          <!-- Pagination Controls (60 pcs per page) -->
          ${totalPages > 1 ? `
            <div class="flex items-center justify-center gap-2 pt-6 flex-wrap">
              <a 
                href="${buildFilterUrl({ page: Math.max(1, safePage - 1) })}" 
                class="btn-secondary py-2 px-4 text-xs font-bold ${safePage <= 1 ? 'pointer-events-none opacity-40' : ''}"
              >
                ← পূর্ববর্তী
              </a>

              <div class="flex items-center gap-1 text-xs font-bold flex-wrap">
                ${Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  if (totalPages > 10 && Math.abs(pNum - safePage) > 3 && pNum !== 1 && pNum !== totalPages) {
                    if (Math.abs(pNum - safePage) === 4) return '<span class="px-1 text-slate-400">...</span>';
                    return '';
                  }
                  return `
                    <a 
                      href="${buildFilterUrl({ page: pNum })}" 
                      class="w-8 h-8 rounded-xl flex items-center justify-center transition ${pNum === safePage ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'}"
                    >
                      ${pNum}
                    </a>
                  `;
                }).join("")}
              </div>

              <a 
                href="${buildFilterUrl({ page: Math.min(totalPages, safePage + 1) })}" 
                class="btn-secondary py-2 px-4 text-xs font-bold ${safePage >= totalPages ? 'pointer-events-none opacity-40' : ''}"
              >
                পরবর্তী →
              </a>
            </div>
          ` : ""}

        </div>

      </div>

    </div>
  `;
}

// Background sync auto-reload disabled to prevent unexpected page reloads & scroll jumps

export const renderProductsPage = renderShopPage;
export const renderProductListPage = renderShopPage;
export default renderShopPage;
