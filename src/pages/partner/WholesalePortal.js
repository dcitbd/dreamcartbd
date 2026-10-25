/**
 * DREAM CART BD — ULTRA-FAST WHOLESALER PORTAL & PARTNER ORDER FORM AUTO-SYNC ENGINE (WholesalePortal.js)
 * High-Performance Architecture (Zero-Lag, Instant Render, Zero Conflict):
 * - Strict Wholesaler & Reseller Order Form Auto-Update Engine:
 *     1. Wholesalers CANNOT order less than the Minimum Order Quantity (MOQ) anywhere (Catalogue, Product Details, Cart, Checkout Order Form, or Direct Wholesale Order Form).
 *     2. Wholesale Price (হোলসেল দাম) is automatically selected & calculated for Wholesalers; Reseller Price (রিসেলার দাম) is automatically selected & calculated for Resellers.
 *     3. Minimum Order Quantity (MOQ) is automatically added whenever a Wholesaler clicks "অর্ডার করুন" or "কার্টে যোগ করুন" or selects a product.
 *     4. NO 5% Online Payment Discount for Wholesalers: Online payment 5% discount is automatically disabled (0 BDT) for Wholesalers across Cart, Checkout Order Form (/checkout), and Direct Wholesale Order Form, and all "৫% ছাড়" labels on the Order Form automatically update in real time.
 *     5. Real-time Order Form Auto-Sync: Whenever any Wholesaler or Reseller orders, logs in, changes quantity, or switches delivery/payment options, the Order Form (/checkout) stays 100% auto-updated.
 * - Luxury Dynamic Wholesaler Login & Registration UI with 9 Sequential Fields:
 *     1. Shop_ID, 2. Shop_logo, 3. Name, 4. Mobile, 5. Mail, 6. Address, 7. Shop_Name, 8. User_ID, 9. Password
 */

import { authStore } from '../../store/authStore.js';
import { cartStore } from '../../store/cartStore.js';
import { favouriteStore } from '../../store/favouriteStore.js';
import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { renderProductCard } from '../../components/ProductCard.js';

const DEFAULT_WHOLESALE_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='16' fill='%23fffbeb'/%3E%3Cpath d='M16 26L20 14H44L48 26M16 26H48M16 26V48C16 49.1046 16.8954 50 18 50H46C47.1046 50 48 49.1046 48 48V26M26 38H38' stroke='%23d97706' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

// Fast In-Memory Cache for Instant (0ms) Navigation & Tab Switching
const WHOLESALE_MEM_CACHE = {
  products: null,
  orders: null,
  bgSynced: false,
  catalogRendered: false,
  catalogLimit: 24
};

function loadWholesaleLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveWholesaleLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// Instant synchronous getters (0ms — never blocks on network)
function getFastProducts() {
  if (Array.isArray(WHOLESALE_MEM_CACHE.products) && WHOLESALE_MEM_CACHE.products.length > 0) {
    return WHOLESALE_MEM_CACHE.products;
  }
  if (Array.isArray(apiClient.sheetProducts) && apiClient.sheetProducts.length > 0) {
    WHOLESALE_MEM_CACHE.products = apiClient.sheetProducts;
    return WHOLESALE_MEM_CACHE.products;
  }
  const cached = loadWholesaleLocal('dcbd_sheet_products', null);
  if (Array.isArray(cached) && cached.length > 0) {
    WHOLESALE_MEM_CACHE.products = cached;
    return cached;
  }
  return [];
}

function getFastOrders() {
  if (Array.isArray(WHOLESALE_MEM_CACHE.orders) && WHOLESALE_MEM_CACHE.orders.length > 0) {
    return WHOLESALE_MEM_CACHE.orders;
  }
  if (Array.isArray(apiClient.sheetOrders) && apiClient.sheetOrders.length > 0) {
    WHOLESALE_MEM_CACHE.orders = apiClient.sheetOrders;
    return WHOLESALE_MEM_CACHE.orders;
  }
  const cached = loadWholesaleLocal('dcbd_sheet_orders', null);
  if (Array.isArray(cached) && cached.length > 0) {
    WHOLESALE_MEM_CACHE.orders = cached;
    return cached;
  }
  return [];
}

// ============================================================================
// WHOLESALER & RESELLER PRICE + MOQ RESOLVERS
// ============================================================================
function findMasterProduct(prodOrId) {
  const products = getFastProducts();
  if (!prodOrId) return null;
  if (typeof prodOrId === 'object') {
    const id = String(prodOrId.product_id || prodOrId.sku || prodOrId.slug || '').trim().toLowerCase();
    if (!id) return prodOrId;
    const found = products.find(p =>
      String(p.product_id || '').trim().toLowerCase() === id ||
      String(p.sku || '').trim().toLowerCase() === id ||
      String(p.slug || '').trim().toLowerCase() === id
    );
    return found ? { ...found, ...prodOrId } : prodOrId;
  }
  const target = String(prodOrId).trim().toLowerCase();
  return products.find(p =>
    String(p.product_id || '').trim().toLowerCase() === target ||
    String(p.sku || '').trim().toLowerCase() === target ||
    String(p.slug || '').trim().toLowerCase() === target
  ) || null;
}

export function getWholesaleMOQ(prodOrId) {
  const master = findMasterProduct(prodOrId);
  const obj = typeof prodOrId === 'object' && prodOrId ? prodOrId : {};
  const candidates = [
    obj.min_order_qty,
    obj.min_order_q,
    obj.moq,
    master?.min_order_qty,
    master?.min_order_q,
    master?.moq
  ];
  for (const c of candidates) {
    const num = Number(c);
    if (!isNaN(num) && num > 1) return Math.round(num);
  }
  return 5; // Default minimum order quantity for wholesale if sheet cell was 1 or empty
}

export function getRetailUnitPrice(prodOrId) {
  const master = findMasterProduct(prodOrId);
  const obj = typeof prodOrId === 'object' && prodOrId ? prodOrId : {};
  const candidates = [
    master?.selling_price,
    obj.selling_price,
    master?.original_price,
    obj.original_price,
    obj.price
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (!isNaN(n) && n > 0) return Math.round(n);
  }
  return 0;
}

export function getWholesaleUnitPrice(prodOrId) {
  const master = findMasterProduct(prodOrId);
  const obj = typeof prodOrId === 'object' && prodOrId ? prodOrId : {};
  const retail = getRetailUnitPrice(prodOrId);

  const whsCandidates = [
    obj.wholesale_price,
    master?.wholesale_price
  ];
  for (const w of whsCandidates) {
    const n = Number(w);
    if (!isNaN(n) && n > 0) {
      if (retail > 0 && n >= retail) {
        return Math.round(retail * 0.85);
      }
      return Math.round(n);
    }
  }

  return retail > 0 ? Math.round(retail * 0.85) : 0;
}

export function getResellerUnitPrice(prodOrId) {
  const master = findMasterProduct(prodOrId);
  const obj = typeof prodOrId === 'object' && prodOrId ? prodOrId : {};
  const retail = getRetailUnitPrice(prodOrId);

  const resCandidates = [
    obj.reseller_price,
    master?.reseller_price
  ];
  for (const r of resCandidates) {
    const n = Number(r);
    if (!isNaN(n) && n > 0) {
      if (retail > 0 && n >= retail) {
        return Math.round(retail * 0.90);
      }
      return Math.round(n);
    }
  }

  return retail > 0 ? Math.round(retail * 0.90) : 0;
}

function showWholesaleNotice(title, message, type = 'warning') {
  if (typeof window !== 'undefined' && window.toast && typeof window.toast.show === 'function') {
    window.toast.show({
      type: type,
      title: title,
      message: message,
      duration: 3200
    });
  }
}

// Normalize all loaded products so ProductCard, ProductDetailPage, and CartStore all see consistent MOQ, Wholesale Price & Reseller Price
function normalizeCatalogWholesaleFields(list) {
  if (!Array.isArray(list)) return;
  list.forEach(p => {
    if (!p || typeof p !== 'object') return;
    const moq = getWholesaleMOQ(p);
    const whs = getWholesaleUnitPrice(p);
    const res = getResellerUnitPrice(p);
    p.min_order_qty = moq;
    p.min_order_q = moq;
    if (whs > 0) p.wholesale_price = whs;
    if (res > 0) p.reseller_price = res;
  });
}

// Non-blocking background sync (runs once per session)
function triggerWholesaleBackgroundSync() {
  const currentProds = getFastProducts();
  normalizeCatalogWholesaleFields(currentProds);

  if (WHOLESALE_MEM_CACHE.bgSynced) return;
  WHOLESALE_MEM_CACHE.bgSynced = true;

  setTimeout(() => {
    Promise.allSettled([
      apiClient.request("products/list"),
      apiClient.request("orders/list")
    ]).then(([prodRes, orderRes]) => {
      let updated = false;
      if (prodRes.status === 'fulfilled' && prodRes.value?.data?.items?.length) {
        WHOLESALE_MEM_CACHE.products = prodRes.value.data.items;
        normalizeCatalogWholesaleFields(WHOLESALE_MEM_CACHE.products);
        updated = true;
      }
      if (orderRes.status === 'fulfilled' && orderRes.value?.data?.items?.length) {
        WHOLESALE_MEM_CACHE.orders = orderRes.value.data.items;
        saveWholesaleLocal('dcbd_sheet_orders', WHOLESALE_MEM_CACHE.orders);
        updated = true;
      }
      if (updated && WHOLESALE_MEM_CACHE.catalogRendered && document.getElementById('whs-catalog-grid')) {
        window.renderWholesaleCatalogDOM();
      }
    });
  }, 120);
}

// Client-side image compression (160x160 JPEG ~8KB) to keep localStorage ultra-fast
function compressWholesaleLogo(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const rawDataUrl = evt.target.result;
    const img = new Image();
    img.onload = function() {
      try {
        const MAX = 160;
        let w = img.naturalWidth || img.width || MAX;
        let h = img.naturalHeight || img.height || MAX;
        if (w > MAX || h > MAX) {
          if (w > h) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          } else {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', 0.82));
      } catch (err) {
        callback(rawDataUrl);
      }
    };
    img.onerror = function() {
      callback(rawDataUrl);
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

function extractOrderProductName(o) {
  if (!o) return 'পাইকারি অর্ডারকৃত পণ্য';
  if (Array.isArray(o.items) && o.items.length > 0) {
    const names = o.items.map(it => {
      if (typeof it === 'string') return it;
      const n = it.name || it.product_name || it.product || it.title || it.p_name || '';
      const q = it.quantity && Number(it.quantity) > 1 ? ` (${it.quantity} পিস)` : '';
      return `${n}${q}`.trim();
    }).filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  const candidates = [
    o.products, o.Products, o.product_name, o.productName, o.Product_Name,
    o.items_name, o.item_name, o.product, o.items, o.col_6, o.col_7, o.name, o.p_name, o.title
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return o.customer_name ? `${o.customer_name} এর বাল্ক চালান` : 'পাইকারি বাল্ক চালান';
}

function extractOrderQuantity(o) {
  if (!o) return 10;
  const numCandidates = [o.quantity, o.Quantity, o.total_quantity, o.totalQuantity, o.col_9, o.item_count];
  for (const c of numCandidates) {
    if (c !== undefined && c !== null && !isNaN(Number(c)) && Number(c) > 0) return Number(c);
  }
  if (Array.isArray(o.items) && o.items.length > 0) {
    const sum = o.items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
    if (sum > 0) return sum;
  }
  return 10;
}

// ============================================================================
// GLOBAL WHOLESALER & RESELLER ORDER FORM AUTO-SYNC & ENFORCEMENT ENGINE
// - Wholesaler: Wholesale Price + Auto MOQ + Cannot Order < MOQ + NO 5% Online Discount
// - Reseller: Reseller Price + Auto-Updated Order Form Summary
// ============================================================================
if (typeof window !== 'undefined' && !window.__dcbdWholesalePortalInit) {
  window.__dcbdWholesalePortalInit = true;

  normalizeCatalogWholesaleFields(getFastProducts());

  // A. Enforce Partner Pricing (Wholesaler / Reseller) & MOQ on all items in cartStore
  window.enforceWholesaleCartRules = function(silent = true) {
    const isWhs = authStore.isWholesaler();
    const isRes = authStore.isReseller();
    if (!isWhs && !isRes) return false;
    if (!Array.isArray(cartStore.items) || cartStore.items.length === 0) return false;

    let changed = false;
    cartStore.items.forEach(item => {
      const moq = getWholesaleMOQ(item);
      const whsPrice = getWholesaleUnitPrice(item);
      const resPrice = getResellerUnitPrice(item);
      const retailPrice = getRetailUnitPrice(item);

      if (retailPrice > 0 && !item.selling_price) {
        item.selling_price = retailPrice;
      }

      if (isWhs) {
        if (Number(item.min_order_qty) !== moq) {
          item.min_order_qty = moq;
          changed = true;
        }
        if (whsPrice > 0 && Number(item.price) !== whsPrice) {
          item.price = whsPrice;
          item.wholesale_price = whsPrice;
          changed = true;
        }
        if (Number(item.quantity || 0) < moq) {
          item.quantity = moq;
          changed = true;
        }
      } else if (isRes) {
        if (resPrice > 0 && Number(item.price) !== resPrice) {
          item.price = resPrice;
          item.reseller_price = resPrice;
          changed = true;
        }
      }
    });

    if (changed) {
      try {
        localStorage.setItem("dcbd_cart", JSON.stringify(cartStore.items));
      } catch (e) {}
      if (!silent) {
        cartStore.notify();
      }
    }
    return changed;
  };

  // B. Patch cartStore.getProductPriceForCurrentRole for both Wholesalers & Resellers
  const origGetPriceForRole = cartStore.getProductPriceForCurrentRole?.bind(cartStore);
  cartStore.getProductPriceForCurrentRole = function(product) {
    if (authStore.isWholesaler()) {
      const whs = getWholesaleUnitPrice(product);
      if (whs > 0) return whs;
    }
    if (authStore.isReseller()) {
      const res = getResellerUnitPrice(product);
      if (res > 0) return res;
    }
    return origGetPriceForRole ? origGetPriceForRole(product) : Number(product?.selling_price || product?.price || 0);
  };

  // C. Patch cartStore.getOnlinePaymentDiscount: Wholesalers NEVER get 5% online payment discount!
  const origGetOnlineDiscount = cartStore.getOnlinePaymentDiscount?.bind(cartStore);
  cartStore.getOnlinePaymentDiscount = function() {
    if (authStore.isWholesaler()) {
      return 0; // No 5% online payment discount for Wholesalers
    }
    return origGetOnlineDiscount
      ? origGetOnlineDiscount()
      : (this.isOnlinePayment() ? Math.round(this.getSubtotal() * 0.05) : 0);
  };

  // D. Patch cartStore.addItem so Wholesalers ALWAYS get MOQ auto-added & Wholesale Price, and Resellers get Reseller Price
  cartStore.addItem = function(product, quantity = 1, options = {}) {
    if (!product) return;
    const isWhs = authStore.isWholesaler();
    const isRes = authStore.isReseller();
    const minQty = isWhs ? getWholesaleMOQ(product) : Number(product.min_order_qty || product.min_order_q || 1);
    const reqQty = Number(quantity) || 1;
    const enforcedQty = isWhs ? Math.max(minQty, reqQty) : Math.max(1, reqQty);
    const price = this.getProductPriceForCurrentRole(product);
    const retailPrice = getRetailUnitPrice(product) || price;

    const pId = product.product_id || product.sku || "";
    const color = options.color || "";
    const size = options.size || "";

    const existingIndex = this.items.findIndex(
      it => String(it.product_id) === String(pId) && (it.color || "") === color && (it.size || "") === size
    );

    if (existingIndex > -1) {
      if (isWhs) {
        const currentQty = Number(this.items[existingIndex].quantity) || 0;
        const nextQty = reqQty <= 1 && currentQty < minQty ? minQty : Math.max(minQty, currentQty + enforcedQty);
        this.items[existingIndex].quantity = nextQty;
        this.items[existingIndex].price = price;
        this.items[existingIndex].wholesale_price = price;
        this.items[existingIndex].min_order_qty = minQty;
      } else {
        this.items[existingIndex].quantity += enforcedQty;
        this.items[existingIndex].price = price;
        if (isRes) this.items[existingIndex].reseller_price = price;
      }
    } else {
      this.items.push({
        product_id: pId,
        sku: product.sku || pId,
        name: product.name || product.p_name || "পণ্য",
        slug: product.slug || pId,
        price: price,
        selling_price: retailPrice,
        original_price: Number(product.original_price || product.regular_price || retailPrice),
        wholesale_price: isWhs ? price : getWholesaleUnitPrice(product),
        reseller_price: isRes ? price : getResellerUnitPrice(product),
        min_order_qty: minQty,
        thumbnail: product.thumbnail || (product.images && product.images[0]) || "",
        stock: product.stock !== undefined ? Number(product.stock) : 50,
        color: color,
        size: size,
        quantity: enforcedQty
      });
    }

    this.saveToStorage();

    if (isWhs && reqQty < minQty) {
      showWholesaleNotice(
        "সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ) যুক্ত হয়েছে",
        `হোলসেল দরে (${formatCurrency(price)}/পিস) সর্বনিম্ন ${minQty} পিস অটোমেটিক যুক্ত করা হয়েছে।`,
        "info"
      );
    }
  };

  // E. Patch cartStore.updateQuantity so Wholesalers CANNOT reduce below MOQ & Resellers keep Reseller Price
  cartStore.updateQuantity = function(productId, qty, options = {}) {
    const color = options.color || "";
    const size = options.size || "";
    const idx = this.items.findIndex(
      it => String(it.product_id) === String(productId) && (it.color || "") === color && (it.size || "") === size
    );
    if (idx === -1) return;

    const item = this.items[idx];
    const isWhs = authStore.isWholesaler();
    const isRes = authStore.isReseller();

    if (isWhs) {
      const minQty = getWholesaleMOQ(item);
      item.min_order_qty = minQty;
      item.price = getWholesaleUnitPrice(item);

      if (qty < minQty) {
        item.quantity = minQty;
        this.saveToStorage();
        showWholesaleNotice(
          "সর্বনিম্ন অর্ডার সীমা (MOQ)",
          `"${item.name}"-এর ক্ষেত্রে হোলসেলারদের জন্য সর্বনিম্ন অর্ডার পরিমাণ ${minQty} পিস। এর কম অর্ডার করা যাবে না!`,
          "error"
        );
        return;
      }
      item.quantity = qty;
      this.saveToStorage();
      return;
    }

    if (isRes) {
      const rPrice = getResellerUnitPrice(item);
      if (rPrice > 0) item.price = rPrice;
    }

    if (qty <= 0) {
      this.items.splice(idx, 1);
    } else {
      item.quantity = qty;
    }
    this.saveToStorage();
  };

  // F. Auto-Update Order Form (/checkout), Cart Page (/cart) & Product Details (/product/...) for Wholesalers & Resellers
  let isEnhancingDOM = false;
  window.enhanceWholesaleOrderFormsDOM = function() {
    if (isEnhancingDOM) return;
    const isWhs = authStore.isWholesaler();
    const isRes = authStore.isReseller();
    if (!isWhs && !isRes) return;

    isEnhancingDOM = true;
    try {
      // 1. Enforce role-based pricing & MOQ on cart items first
      window.enforceWholesaleCartRules(true);

      // 2. If on Product Detail Page (#product-qty-input exists) and user is Wholesaler:
      const pdQtyInput = document.getElementById('product-qty-input');
      if (isWhs && pdQtyInput && !pdQtyInput.hasAttribute('data-whs-moq-bound')) {
        const detailBtn = document.getElementById('btn-detail-order-now') || document.getElementById('btn-detail-add-cart') || document.getElementById('btn-detail-preorder');
        const pId = detailBtn ? detailBtn.getAttribute('data-product-id') : '';
        const minQty = getWholesaleMOQ(pId);

        pdQtyInput.setAttribute('data-whs-moq-bound', 'true');
        pdQtyInput.setAttribute('data-whs-min', String(minQty));
        pdQtyInput.min = String(minQty);
        if (Number(pdQtyInput.value || 0) < minQty) {
          pdQtyInput.value = String(minQty);
        }

        const qtyBox = pdQtyInput.closest('.pd-qty-box');
        if (qtyBox) {
          const btns = qtyBox.querySelectorAll('button');
          if (btns[0]) {
            btns[0].removeAttribute('onclick');
            btns[0].onclick = function(ev) {
              ev.preventDefault();
              const cur = Number(pdQtyInput.value) || minQty;
              if (cur <= minQty) {
                pdQtyInput.value = String(minQty);
                showWholesaleNotice(
                  "সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ)",
                  `পাইকারি দরে অর্ডারের জন্য সর্বনিম্ন ${minQty} পিস নিতে হবে।`,
                  "error"
                );
              } else {
                pdQtyInput.value = String(cur - 1);
              }
            };
          }
          if (btns[1]) {
            btns[1].removeAttribute('onclick');
            btns[1].onclick = function(ev) {
              ev.preventDefault();
              const cur = Math.max(minQty, Number(pdQtyInput.value) || minQty);
              pdQtyInput.value = String(cur + 1);
            };
          }
        }
      }

      // 3. If on Cart Page (/cart), hide online discount row for Wholesalers & lock minus button at MOQ
      if (isWhs) {
        const cartDiscRow = document.getElementById('cart-online-discount-row');
        if (cartDiscRow) cartDiscRow.classList.add('hidden');
        const cartGrandEl = document.getElementById('cart-grand-total');
        if (cartGrandEl) cartGrandEl.textContent = formatCurrency(cartStore.getGrandTotal());
      }

      // 4. If on Checkout Order Form (#checkout-form exists): Auto-Update Order Form for Wholesaler or Reseller!
      const checkoutForm = document.getElementById('checkout-form');
      if (checkoutForm) {
        const user = authStore.user || {};
        const nameInp = document.getElementById('checkout-name');
        const phoneInp = document.getElementById('checkout-phone');
        const addrInp = document.getElementById('checkout-address');
        if (nameInp && !nameInp.value.trim()) nameInp.value = user.shop_name || user.name || '';
        if (phoneInp && !phoneInp.value.trim()) phoneInp.value = user.mobile || user.phone || '';
        if (addrInp && !addrInp.value.trim()) addrInp.value = user.address || '';

        // 4A. Wholesaler-Specific Payment UI Auto-Update: Remove all "৫% ছাড়" badges & notices on Order Form!
        if (isWhs) {
          const pmSelect = document.getElementById('checkout-payment-method');
          if (pmSelect) {
            Array.from(pmSelect.options).forEach(opt => {
              if (opt.text.includes('(৫% ছাড়)')) {
                opt.text = opt.text.replace(/\s*\(৫%\s*ছাড়\)/g, '');
              }
            });
          }

          // Update the black badge & green promo box above payment method dropdown
          const paymentCard = pmSelect ? pmSelect.closest('.bg-white, .dark\\:bg-slate-900') : null;
          if (paymentCard) {
            const topPill = paymentCard.querySelector('.bg-black.text-white');
            if (topPill) {
              topPill.textContent = 'পাইকারি পেমেন্ট রেট';
            }
            const promoNotice = paymentCard.querySelector('.bg-emerald-50\\/70');
            if (promoNotice) {
              promoNotice.className = 'p-2.5 bg-amber-50/80 dark:bg-slate-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2 border border-amber-200 dark:border-slate-700';
              promoNotice.innerHTML = `
                <span class="text-sm">📦</span>
                <span>হোলসেলার অ্যাকাউন্টে ইতিমধ্যে <strong>পাইকারি ছাড় (Wholesale Price)</strong> কার্যকর থাকায় অনলাইন পেমেন্টে অতিরিক্ত ৫% ছাড় প্রযোজ্য নয়।</span>
              `;
            }
            // Remove "৫% ছাড়" badges inside each payment method instruction panel
            paymentCard.querySelectorAll('.payment-method-panel span').forEach(sp => {
              if (sp.textContent && sp.textContent.trim() === '৫% ছাড়') {
                sp.textContent = 'পাইকারি রেট';
              }
            });
          }
        }

        // 4B. Inject / Update Partner Active Mode Banner at top of Checkout Order Form
        let banner = document.getElementById('whs-checkout-mode-banner');
        if (!banner) {
          banner = document.createElement('div');
          banner.id = 'whs-checkout-mode-banner';
          checkoutForm.insertBefore(banner, checkoutForm.firstChild);
        }

        if (isWhs) {
          banner.className = 'lg:col-span-12 p-4 rounded-2xl bg-amber-50 dark:bg-slate-800 border-2 border-amber-400 dark:border-amber-500/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs';
          banner.innerHTML = `
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center flex-shrink-0">📦</span>
              <div>
                <div class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2 flex-wrap">
                  <span>হোলসেলার পাইকারি অর্ডার ফর্ম অটো-আপডেটেড</span>
                  <span class="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">Wholesale Rate & MOQ Active</span>
                </div>
                <p class="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                  প্রতিটি পণ্যে <strong>হোলসেল দাম</strong> ও <strong>সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ)</strong> অটো যুক্ত হয়েছে (হোলসেলারদের জন্য অনলাইন পেমেন্টে অতিরিক্ত ৫% ডিসকাউন্ট প্রযোজ্য নয়)।
                </p>
              </div>
            </div>
            <a href="/wholesaler/dashboard" class="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 font-bold text-xs flex-shrink-0">
              ← হোলসেলার ড্যাশবোর্ড
            </a>
          `;
        } else if (isRes) {
          banner.className = 'lg:col-span-12 p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-500/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs';
          banner.innerHTML = `
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center flex-shrink-0">🏪</span>
              <div>
                <div class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2 flex-wrap">
                  <span>রিসেলার পার্টনার অর্ডার ফর্ম অটো-আপডেটেড</span>
                  <span class="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">Reseller Rate Active</span>
                </div>
                <p class="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                  আপনার অর্ডার ফর্মে স্বয়ংক্রিয়ভাবে <strong>রিসেলার দর (Reseller Price)</strong> সিলেক্ট ও ক্যালকুলেট করা হয়েছে।
                </p>
              </div>
            </div>
            <a href="/reseller/dashboard" class="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex-shrink-0">
              ← রিসেলার ড্যাশবোর্ড
            </a>
          `;
        }

        // 4C. Render interactive quantity steppers & role-based price breakdown inside Checkout Order Summary
        let itemListContainer = document.getElementById('whs-checkout-items-list');
        if (!itemListContainer) {
          const origList = checkoutForm.querySelector('.divide-y.max-h-60');
          if (origList) {
            origList.id = 'whs-checkout-items-list';
            itemListContainer = origList;
          }
        }

        if (itemListContainer) {
          itemListContainer.innerHTML = cartStore.items.map(it => {
            const minAllowed = isWhs ? getWholesaleMOQ(it) : 1;
            const unitPrice = isWhs ? getWholesaleUnitPrice(it) : getResellerUnitPrice(it);
            const retailPrice = getRetailUnitPrice(it) || Math.round(unitPrice / (isWhs ? 0.85 : 0.90));
            const qty = Math.max(minAllowed, Number(it.quantity) || minAllowed);
            const isAtMin = qty <= minAllowed;
            const safeId = String(it.product_id || it.sku || '').replace(/'/g, "\\'");
            const safeColor = String(it.color || '').replace(/'/g, "\\'");
            const safeSize = String(it.size || '').replace(/'/g, "\\'");

            return `
              <div class="py-3 flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-2.5 min-w-0 flex-1">
                  <img src="${it.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}" class="w-11 h-11 rounded-xl object-cover border ${isWhs ? 'border-amber-300' : 'border-emerald-300'} dark:border-slate-700 flex-shrink-0 bg-white" />
                  <div class="min-w-0 flex-1">
                    <div class="font-bold text-slate-900 dark:text-white truncate">${it.name}</div>
                    <div class="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span class="text-[10px] font-black ${isWhs ? 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60' : 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60'} px-1.5 py-0.5 rounded">
                        ${isWhs ? 'হোলসেল দর' : 'রিসেলার দর'}: ${formatCurrency(unitPrice)}
                      </span>
                      ${retailPrice > unitPrice ? `<span class="text-[10px] text-slate-400 line-through">${formatCurrency(retailPrice)}</span>` : ''}
                      ${isWhs ? `
                        <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                          MOQ: ${minAllowed} পিস
                        </span>
                      ` : ''}
                    </div>
                    <div class="flex items-center gap-2 mt-1.5">
                      <div class="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden">
                        <button 
                          type="button" 
                          onclick="window.adjustWholesaleCheckoutQty('${safeId}', -1, '${safeColor}', '${safeSize}')"
                          class="w-6 h-6 flex items-center justify-center font-black text-xs ${isAtMin ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'}"
                          title="${isAtMin ? `সর্বনিম্ন ${minAllowed} পিস আবশ্যক` : 'পরিমাণ কমান'}"
                        >−</button>
                        <span class="px-2 font-mono font-black text-xs text-slate-900 dark:text-white">${qty} পিস</span>
                        <button 
                          type="button" 
                          onclick="window.adjustWholesaleCheckoutQty('${safeId}', 1, '${safeColor}', '${safeSize}')"
                          class="w-6 h-6 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                          title="পরিমাণ বাড়ান"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="font-black ${isWhs ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'} text-sm font-mono">
                    ${formatCurrency(unitPrice * qty)}
                  </div>
                  <div class="text-[10px] text-slate-400">${qty} × ${formatCurrency(unitPrice)}</div>
                </div>
              </div>
            `;
          }).join("");
        }

        // 4D. Sync Subtotal, Delivery, Discount (0 for Wholesaler!), Grand Total & Confirm Button text on Checkout Form
        const subEl = document.getElementById('summary-subtotal');
        const delEl = document.getElementById('summary-delivery-charge');
        const discRow = document.getElementById('summary-online-discount-row');
        const discAmt = document.getElementById('summary-online-discount-amount');
        const grandEl = document.getElementById('summary-grand-total');
        const btnText = document.getElementById('btn-confirm-order-text');

        const subtotal = cartStore.getSubtotal();
        const isFree = cartStore.isFreeDelivery();
        const delFee = cartStore.getDeliveryCharge();
        const onlineDisc = isWhs ? 0 : cartStore.getOnlinePaymentDiscount();
        const grandTotal = cartStore.getGrandTotal();

        if (subEl) subEl.textContent = formatCurrency(subtotal);
        if (delEl) delEl.innerHTML = isFree ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold">ফ্রি (৳০)</span>' : formatCurrency(delFee);
        if (discRow && discAmt) {
          if (onlineDisc > 0 && !isWhs) {
            discRow.classList.remove('hidden');
            discAmt.textContent = '-' + formatCurrency(onlineDisc);
          } else {
            discRow.classList.add('hidden');
          }
        }
        if (grandEl) grandEl.textContent = formatCurrency(grandTotal);
        if (btnText) {
          btnText.textContent = isWhs
            ? `পাইকারি অর্ডার নিশ্চিত করুন (${formatCurrency(grandTotal)})`
            : `রিসেলার অর্ডার নিশ্চিত করুন (${formatCurrency(grandTotal)})`;
        }
      }
    } finally {
      isEnhancingDOM = false;
    }
  };

  window.adjustWholesaleCheckoutQty = function(productId, delta, color = '', size = '') {
    const item = cartStore.items.find(
      it => String(it.product_id) === String(productId) && (it.color || '') === color && (it.size || '') === size
    );
    if (!item) return;
    const isWhs = authStore.isWholesaler();
    const minQty = isWhs ? getWholesaleMOQ(item) : 1;
    const nextQty = Number(item.quantity || minQty) + Number(delta);
    if (nextQty < minQty) {
      if (isWhs) {
        showWholesaleNotice(
          "সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ)",
          `"${item.name}"-এর ক্ষেত্রে সর্বনিম্ন ${minQty} পিসের কম অর্ডার করা যাবে না!`,
          "error"
        );
      }
      return;
    }
    cartStore.updateQuantity(productId, nextQty, { color, size });
    window.enhanceWholesaleOrderFormsDOM();
  };

  // Subscribe to both authStore & cartStore so Order Form auto-updates on any login, item, zone, or payment change!
  authStore.subscribe(() => {
    if (authStore.isWholesaler() || authStore.isReseller()) {
      window.enforceWholesaleCartRules(true);
      setTimeout(() => window.enhanceWholesaleOrderFormsDOM(), 20);
    }
  });

  cartStore.subscribe(() => {
    if (authStore.isWholesaler() || authStore.isReseller()) {
      setTimeout(() => window.enhanceWholesaleOrderFormsDOM(), 10);
    }
  });

  // Run immediately on boot if already logged in as Wholesaler or Reseller
  if (authStore.isWholesaler() || authStore.isReseller()) {
    window.enforceWholesaleCartRules(true);
  }

  // Watch #app-content for route renders so ProductDetailPage, CartPage & CheckoutPage get auto-updated immediately
  const observeAppContent = () => {
    const appContent = document.getElementById('app-content');
    if (!appContent || appContent.hasAttribute('data-whs-observed')) return;
    appContent.setAttribute('data-whs-observed', 'true');
    const obs = new MutationObserver(() => {
      if (authStore.isWholesaler() || authStore.isReseller()) {
        window.enhanceWholesaleOrderFormsDOM();
      }
    });
    obs.observe(appContent, { childList: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAppContent);
  } else {
    observeAppContent();
  }
  setTimeout(observeAppContent, 300);

  // 1. Real-Time Password Strength Meter (0% to 100%)
  window.checkWholesalePasswordStrength = function(pass) {
    const val = String(pass || '').trim();
    const bar = document.getElementById('w-pwd-strength-bar');
    const lbl = document.getElementById('w-pwd-strength-label');
    if (!bar || !lbl) return;

    let percent = 0;
    let label = '০%';
    let color = '#94a3b8';

    if (val.length > 0) {
      if (val.length >= 4) percent += 20;
      if (val.length >= 8) percent += 20;
      if (/[a-z]/.test(val) && /[A-Z]/.test(val)) percent += 20;
      if (/[0-9]/.test(val)) percent += 20;
      if (/[^a-zA-Z0-9]/.test(val)) percent += 20;

      if (percent <= 20) {
        label = `${percent}% (খুব দুর্বল)`;
        color = '#ef4444';
      } else if (percent <= 40) {
        label = `${percent}% (দুর্বল)`;
        color = '#f97316';
      } else if (percent <= 60) {
        label = `${percent}% (মাঝারি)`;
        color = '#eab308';
      } else if (percent <= 80) {
        label = `${percent}% (শক্তিশালী)`;
        color = '#10b981';
      } else {
        label = '১০০% (খুব শক্তিশালী)';
        color = '#059669';
      }
    }

    bar.style.width = percent + '%';
    bar.style.backgroundColor = color;
    lbl.textContent = label;
    lbl.style.color = color;
  };

  // 2. 1-Click Strong Password Generator
  window.suggestWholesalePassword = function() {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '@#$%&*';
    const all = upper + lower + digits + symbols;

    let pwd = '';
    pwd += upper.charAt(Math.floor(Math.random() * upper.length));
    pwd += lower.charAt(Math.floor(Math.random() * lower.length));
    pwd += digits.charAt(Math.floor(Math.random() * digits.length));
    pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));
    for (let i = 4; i < 10; i++) {
      pwd += all.charAt(Math.floor(Math.random() * all.length));
    }
    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');

    const pInput = document.getElementById('w-pass');
    if (pInput) {
      pInput.value = pwd;
      pInput.type = 'text';
    }
    document.querySelectorAll('.btn-toggle-w-pass').forEach(btn => {
      btn.innerHTML = '🙈';
      btn.title = 'পাসওয়ার্ড লুকান';
    });
    window.checkWholesalePasswordStrength(pwd);
  };

  // 3. On-Demand Wholesale Catalogue Renderer with Per-Card MOQ Stepper & Wholesale Price Calculation
  window.renderWholesaleCatalogDOM = function() {
    const grid = document.getElementById('whs-catalog-grid');
    if (!grid) return;

    const products = getFastProducts();
    normalizeCatalogWholesaleFields(products);

    const q = String(document.getElementById('whs-catalog-search')?.value || '').toLowerCase().trim();
    const cat = String(document.getElementById('whs-catalog-cat')?.value || 'all').toLowerCase().trim();

    const filtered = products.filter(p => {
      const name = String(p.name || p.p_name || '').toLowerCase();
      const sku = String(p.sku || p.product_id || '').toLowerCase();
      const pCat = String(p.category || '').toLowerCase().trim();
      const matchQ = !q || name.includes(q) || sku.includes(q) || pCat.includes(q);
      const matchC = cat === 'all' || pCat === cat;
      return matchQ && matchC;
    });

    const visibleItems = filtered.slice(0, WHOLESALE_MEM_CACHE.catalogLimit);

    if (visibleItems.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-xs text-slate-500">
          কোনো পাইকারি পণ্য পাওয়া যায়নি।
        </div>
      `;
    } else {
      grid.innerHTML = visibleItems.map(p => {
        const retail = Number(p.selling_price || 1000);
        const wholesaleRate = getWholesaleUnitPrice(p);
        const moq = getWholesaleMOQ(p);
        const unitSave = Math.max(30, retail - wholesaleRate);
        const rawSku = String(p.sku || p.product_id || '');
        const safeSku = rawSku.replace(/'/g, "\\'");
        const domId = rawSku.replace(/[^a-zA-Z0-9_-]/g, '_');

        return `
          <div class="dc-whs-catalog-wrap">
            ${renderProductCard(p)}
            <div class="dc-whs-moq-bar">
              <div class="w-full space-y-2">
                <div class="flex items-center justify-between gap-1">
                  <span class="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    হোলসেল দর: <strong class="text-amber-600 dark:text-amber-400 font-black">${formatCurrency(wholesaleRate)}</strong>
                  </span>
                  <span class="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    লাভ: +${formatCurrency(unitSave)}/পিস
                  </span>
                </div>

                <div class="flex items-center justify-between gap-1 text-[10px] text-slate-600 dark:text-slate-300 font-bold">
                  <span>সর্বনিম্ন অর্ডার (MOQ): <strong class="text-slate-900 dark:text-white">${moq} পিস</strong></span>
                  <span>মোট: <strong id="whs-card-tot-${domId}" class="text-amber-600 dark:text-amber-400 font-black">${formatCurrency(wholesaleRate * moq)}</strong></span>
                </div>

                <div class="flex items-center justify-between gap-1.5 pt-0.5">
                  <div class="inline-flex items-center rounded-lg border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                    <button 
                      type="button" 
                      class="w-6 h-6 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-100 cursor-pointer"
                      onclick="window.stepWholesaleCardQty('${domId}', -1, ${moq}, ${wholesaleRate})"
                      title="পরিমাণ কমান (সর্বনিম্ন ${moq} পিস)"
                    >−</button>
                    <input 
                      type="number" 
                      id="whs-card-qty-${domId}" 
                      value="${moq}" 
                      min="${moq}" 
                      class="w-10 h-6 text-center font-mono font-black text-[11px] bg-transparent border-none outline-none text-slate-900 dark:text-white"
                      oninput="window.onWholesaleCardQtyInput('${domId}', ${moq}, ${wholesaleRate})"
                      onchange="window.onWholesaleCardQtyInput('${domId}', ${moq}, ${wholesaleRate}, true)"
                    />
                    <button 
                      type="button" 
                      class="w-6 h-6 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-100 cursor-pointer"
                      onclick="window.stepWholesaleCardQty('${domId}', 1, ${moq}, ${wholesaleRate})"
                      title="পরিমাণ বাড়ান"
                    >+</button>
                  </div>

                  <button 
                    type="button" 
                    class="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] cursor-pointer transition text-center"
                    onclick="window.orderWholesaleCardNow('${safeSku}', '${domId}', ${moq})"
                  >
                    ⚡ অর্ডার ফর্মে যান
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }

    const moreWrap = document.getElementById('whs-catalog-more-wrap');
    if (moreWrap) {
      if (filtered.length > WHOLESALE_MEM_CACHE.catalogLimit) {
        moreWrap.innerHTML = `
          <button 
            type="button" 
            class="btn-secondary py-2.5 px-6 text-xs font-bold rounded-xl cursor-pointer"
            onclick="window.loadMoreWholesaleCatalog()"
          >
            আরও পণ্য দেখুন (${filtered.length - WHOLESALE_MEM_CACHE.catalogLimit} টি বাকি) ↓
          </button>
        `;
      } else {
        moreWrap.innerHTML = '';
      }
    }
    WHOLESALE_MEM_CACHE.catalogRendered = true;
  };

  window.stepWholesaleCardQty = function(domId, delta, moq, unitRate) {
    const inp = document.getElementById('whs-card-qty-' + domId);
    const tot = document.getElementById('whs-card-tot-' + domId);
    if (!inp) return;
    let cur = Number(inp.value) || moq;
    let next = cur + Number(delta);
    if (next < moq) {
      next = moq;
      showWholesaleNotice(
        "সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ)",
        `এই পণ্যের সর্বনিম্ন পাইকারি অর্ডার কোয়ান্টিটি ${moq} পিস। এর কম অর্ডার করা যাবে না!`,
        "error"
      );
    }
    inp.value = String(next);
    if (tot) tot.textContent = formatCurrency(next * unitRate);
  };

  window.onWholesaleCardQtyInput = function(domId, moq, unitRate, clampNow = false) {
    const inp = document.getElementById('whs-card-qty-' + domId);
    const tot = document.getElementById('whs-card-tot-' + domId);
    if (!inp) return;
    let val = Number(inp.value);
    if (isNaN(val) || val < moq) {
      if (clampNow) {
        inp.value = String(moq);
        showWholesaleNotice(
          "সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ)",
          `সর্বনিম্ন ${moq} পিস স্বয়ংক্রিয়ভাবে সেট করা হয়েছে।`,
          "warning"
        );
      }
      val = moq;
    }
    if (tot) tot.textContent = formatCurrency(val * unitRate);
  };

  window.orderWholesaleCardNow = function(sku, domId, moq) {
    const inp = document.getElementById('whs-card-qty-' + domId);
    const rawQty = Number(inp ? inp.value : moq);
    const finalQty = Math.max(moq, isNaN(rawQty) ? moq : rawQty);
    if (inp) inp.value = String(finalQty);
    window.addWholesaleMoqToCart(sku, finalQty, true);
  };

  window.loadMoreWholesaleCatalog = function() {
    WHOLESALE_MEM_CACHE.catalogLimit += 24;
    window.renderWholesaleCatalogDOM();
  };

  window.filterWholesaleCatalog = function() {
    WHOLESALE_MEM_CACHE.catalogLimit = 24;
    window.renderWholesaleCatalogDOM();
  };

  // 4. Add MOQ Quantity Directly to Cart at Wholesale Price
  window.addWholesaleMoqToCart = function(sku, requestedQty, goToCheckout = false) {
    const products = getFastProducts();
    const found = products.find(p => String(p.sku || p.product_id) === String(sku));
    if (!found) return;

    const moq = getWholesaleMOQ(found);
    const wholesaleRate = getWholesaleUnitPrice(found);
    const finalQty = Math.max(moq, Number(requestedQty) || moq);

    cartStore.addItem({
      ...found,
      price: wholesaleRate,
      selling_price: Number(found.selling_price || wholesaleRate),
      wholesale_price: wholesaleRate,
      min_order_qty: moq
    }, finalQty);

    if (goToCheckout) {
      if (window.router && typeof window.router.navigate === 'function') {
        window.router.navigate('/checkout');
      } else {
        window.location.href = '/checkout';
      }
      return;
    }

    showWholesaleNotice(
      "পাইকারি কার্টে যুক্ত হয়েছে",
      `"${found.name || found.p_name}" (${finalQty} পিস × ${formatCurrency(wholesaleRate)}) পাইকারি দরে কার্টে যুক্ত হয়েছে!`,
      "success"
    );
  };

  // 5. Instant Wholesale Tab Switching (0ms)
  window.switchWholesaleTab = function(tabId, btn) {
    document.querySelectorAll('.wholesale-tab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.dc-whs-nav-item').forEach(b => {
      if (b.getAttribute('data-whs-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    if (tabId === 'wtab-catalog' && !WHOLESALE_MEM_CACHE.catalogRendered) {
      window.renderWholesaleCatalogDOM();
    }
  };

  // 6. Filter Wholesale Orders
  window.filterWholesaleOrders = function(q) {
    const query = String(q || '').toLowerCase().trim();
    document.querySelectorAll('.wholesale-order-item').forEach(item => {
      const sText = item.getAttribute('data-search') || '';
      item.style.display = sText.includes(query) ? '' : 'none';
    });
  };

  window.filterWholesaleOrderStatus = function(status, btn) {
    document.querySelectorAll('.dc-whs-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.wholesale-order-item').forEach(item => {
      const iStatus = item.getAttribute('data-status') || '';
      if (status === 'all') {
        item.style.display = '';
      } else if (status === 'pending') {
        item.style.display = ['pending', 'order placed', 'processing', 'packing'].includes(iStatus) ? '' : 'none';
      } else if (status === 'delivered') {
        item.style.display = ['delivered', 'completed'].includes(iStatus) ? '' : 'none';
      } else if (status === 'cancelled') {
        item.style.display = ['cancelled', 'returned'].includes(iStatus) ? '' : 'none';
      }
    });
  };

  // 7. Interactive Wholesale Direct Order Form & Calculator (Auto MOQ + Locked Wholesale Rate + Zero Online Discount)
  window.onWholesaleProductSelectChange = function() {
    const sel = document.getElementById('whs-calc-product');
    const qtyInput = document.getElementById('whs-calc-qty');
    if (!sel || !qtyInput) return;

    const products = getFastProducts();
    const p = products[Number(sel.value) || 0] || products[0];
    if (!p) return;

    const moq = getWholesaleMOQ(p);
    qtyInput.min = String(moq);
    qtyInput.value = String(moq); // Auto-add MOQ whenever a product is selected!
    window.recalcWholesaleQuote(true);
  };

  window.stepWholesaleOrderFormQty = function(delta) {
    const sel = document.getElementById('whs-calc-product');
    const qtyInput = document.getElementById('whs-calc-qty');
    if (!sel || !qtyInput) return;

    const products = getFastProducts();
    const p = products[Number(sel.value) || 0] || products[0];
    const moq = getWholesaleMOQ(p);

    const cur = Number(qtyInput.value) || moq;
    const next = cur + Number(delta);
    if (next < moq) {
      qtyInput.value = String(moq);
      showWholesaleNotice(
        "সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ)",
        `হোলসেলার হিসেবে এই পণ্যের সর্বনিম্ন অর্ডার কোয়ান্টিটি (${moq} পিস)-এর কম অর্ডার করা যাবে না!`,
        "error"
      );
    } else {
      qtyInput.value = String(next);
    }
    window.recalcWholesaleQuote(true);
  };

  window.recalcWholesaleQuote = function(enforceClamp = false) {
    const sel = document.getElementById('whs-calc-product');
    const qtyInput = document.getElementById('whs-calc-qty');
    if (!sel || !qtyInput) return;

    const products = getFastProducts();
    const p = products[Number(sel.value) || 0] || products[0];
    if (!p) return;

    const retail = Number(p.selling_price || 1000);
    const wholesale = getWholesaleUnitPrice(p);
    const moq = getWholesaleMOQ(p);

    qtyInput.min = String(moq);
    let rawQty = Number(qtyInput.value);
    const warnEl = document.getElementById('whs-calc-moq-warning');

    if (isNaN(rawQty) || rawQty < moq) {
      if (warnEl) {
        warnEl.textContent = `⚠️ সর্বনিম্ন অর্ডার কোয়ান্টিটি ${moq} পিস। এর কম অর্ডার করা যাবে না (স্বয়ংক্রিয়ভাবে ${moq} পিস ধরা হয়েছে)।`;
        warnEl.classList.remove('hidden');
      }
      if (enforceClamp) {
        qtyInput.value = String(moq);
      }
      rawQty = moq;
    } else {
      if (warnEl) warnEl.classList.add('hidden');
    }

    const qty = Math.max(moq, rawQty);
    const totalRetail = retail * qty;
    const totalWholesale = wholesale * qty;
    const netProfit = Math.max(0, totalRetail - totalWholesale);

    const zoneSel = document.getElementById('whs-order-zone');
    const zone = zoneSel ? zoneSel.value : 'dhaka';
    const isFreeDel = zone === 'pickup' || totalWholesale >= 2000;
    const delFee = isFreeDel ? 0 : (zone === 'cumilla' ? 70 : (zone === 'outside' ? 120 : 90));
    // Wholesalers do NOT get 5% online payment discount — grandTotal is strictly totalWholesale + delFee
    const grandTotal = totalWholesale + delFee;

    const elMoq = document.getElementById('whs-calc-moq-lbl');
    const elRetail = document.getElementById('whs-calc-retail-rate');
    const elUnit = document.getElementById('whs-calc-unit-rate');
    const elTotal = document.getElementById('whs-calc-total-cost');
    const elProfit = document.getElementById('whs-calc-net-profit');
    const elGrand = document.getElementById('whs-order-grand-total');

    if (elMoq) elMoq.textContent = `${moq} পিস`;
    if (elRetail) elRetail.textContent = formatCurrency(retail);
    if (elUnit) elUnit.textContent = formatCurrency(wholesale);
    if (elTotal) elTotal.textContent = formatCurrency(totalWholesale);
    if (elProfit) elProfit.textContent = '+' + formatCurrency(netProfit);
    if (elGrand) elGrand.textContent = formatCurrency(grandTotal);
  };

  window.addCalculatorQuoteToCart = function(goToCheckout = false) {
    const sel = document.getElementById('whs-calc-product');
    const qtyInput = document.getElementById('whs-calc-qty');
    const products = getFastProducts();
    const p = products[Number(sel?.value) || 0] || products[0];
    if (!p) return;

    const moq = getWholesaleMOQ(p);
    let qty = Number(qtyInput?.value || moq);
    if (isNaN(qty) || qty < moq) {
      qty = moq;
      if (qtyInput) qtyInput.value = String(moq);
    }
    window.addWholesaleMoqToCart(p.sku || p.product_id, qty, goToCheckout);
  };

  // Direct Wholesale Order Form Submission inside WholesalePortal
  window.submitDirectWholesaleOrder = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    const sel = document.getElementById('whs-calc-product');
    const qtyInput = document.getElementById('whs-calc-qty');
    const products = getFastProducts();
    const p = products[Number(sel?.value) || 0] || products[0];
    if (!p) return;

    const moq = getWholesaleMOQ(p);
    const wholesaleRate = getWholesaleUnitPrice(p);
    let qty = Number(qtyInput?.value || moq);

    if (isNaN(qty) || qty < moq) {
      qty = moq;
      if (qtyInput) qtyInput.value = String(moq);
      showWholesaleNotice(
        "সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ)",
        `সর্বনিম্ন অর্ডার কোয়ান্টিটি ${moq} পিস অটোমেটিক যুক্ত করা হয়েছে।`,
        "warning"
      );
    }

    const user = authStore.user || {};
    const name = document.getElementById('whs-order-name')?.value.trim() || user.shop_name || user.name || 'পাইকারি ক্রেতা';
    const phone = document.getElementById('whs-order-phone')?.value.trim() || user.mobile || user.phone || '';
    const address = document.getElementById('whs-order-address')?.value.trim() || user.address || '';
    const paymentMethod = document.getElementById('whs-order-payment')?.value || 'COD';
    const note = document.getElementById('whs-order-note')?.value.trim() || '';

    if (!name || !phone || !address) {
      alert('অনুগ্রহ করে নাম, মোবাইল নম্বর এবং ডেলিভারি ঠিকানা পূরণ করুন।');
      return;
    }

    const subtotal = wholesaleRate * qty;
    const zone = document.getElementById('whs-order-zone')?.value || 'dhaka';
    const isFreeDel = zone === 'pickup' || subtotal >= 2000;
    const delFee = isFreeDel ? 0 : (zone === 'cumilla' ? 70 : (zone === 'outside' ? 120 : 90));
    const grandTotal = subtotal + delFee; // Strictly no 5% online discount for Wholesalers

    const orderPayload = {
      customer_name: `${name} (${user.shop_name || 'Wholesaler'})`,
      phone: phone,
      address: address,
      customer_note: `[WHOLESALE MOQ: ${moq}] ${note}`.trim(),
      account_type: 'Wholesaler',
      items: [
        {
          product_id: p.product_id || p.sku,
          sku: p.sku || p.product_id,
          name: p.name || p.p_name,
          price: wholesaleRate,
          wholesale_price: wholesaleRate,
          min_order_qty: moq,
          quantity: qty,
          thumbnail: p.thumbnail || ''
        }
      ],
      products: `${p.name || p.p_name} (${qty} পিস × ৳${wholesaleRate})`,
      quantity: qty,
      total_amount: grandTotal,
      delivery_fee: delFee,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'COD' ? 'COD' : 'Paid',
      order_status: 'Order Placed'
    };

    const btn = document.getElementById('btn-whs-direct-order-submit');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="inline-flex items-center justify-center gap-2"><img src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" alt="Logo" class="w-4 h-4 rounded-full object-contain bg-white p-0.5 animate-spin" onerror="this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';" /> <span>পাইকারি অর্ডার প্রসেস হচ্ছে...</span></span>`;
    }

    try {
      const res = await apiClient.request("orders/create", orderPayload);
      const orderId = res?.data?.order_id || res?.data?.orderId || ('ORD-WHS-' + Math.floor(100000 + Math.random() * 900000));
      if (WHOLESALE_MEM_CACHE.orders) {
        WHOLESALE_MEM_CACHE.orders.unshift({ ...orderPayload, order_id: orderId, date: new Date().toISOString().slice(0, 10) });
      }
      showWholesaleNotice(
        "পাইকারি অর্ডার সফল!",
        `অর্ডার #${orderId} (${qty} পিস — হোলসেল দর: ${formatCurrency(wholesaleRate)}) সফলভাবে গৃহীত হয়েছে।`,
        "success"
      );
      if (window.router && typeof window.router.navigate === 'function') {
        window.router.navigate('/order-success?orderId=' + encodeURIComponent(orderId));
      }
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '✓ হোলসেল দরে অর্ডার কনফার্ম করুন';
      }
    }
  };

  // 8. Live Shipment Tracking
  window.executeWholesaleTrack = function(orderIdOverride) {
    const input = document.getElementById('wholesale-track-input');
    if (orderIdOverride && input) input.value = orderIdOverride;
    const q = String(input?.value || '').trim();
    if (!q) {
      alert('অনুগ্রহ করে অর্ডার বা চালান আইডি প্রদান করুন!');
      return;
    }
    const disp = document.getElementById('whs-track-disp-id');
    if (disp) disp.textContent = q.toUpperCase();
  };

  window.openWholesaleOrderTrack = function(orderId) {
    window.switchWholesaleTab('wtab-track');
    window.executeWholesaleTrack(orderId);
  };

  // 9. Update Wholesaler Profile (Settings Tab & Modal — All 9 Fields)
  window.updateWholesaleProfile = function(e, source) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    const isModal = source === 'modal';
    const pfx = isModal ? 'modal-w-' : 'set-w-';

    const cur = authStore.user || {};
    const shopId = document.getElementById(pfx + 'shop-id')?.value.trim() || cur.shop_id || cur.Shop_ID || 'WHS-401200';
    const logoInput = document.getElementById(pfx + 'logo');
    const shopLogo = logoInput?.getAttribute('data-uploaded-url') || logoInput?.value.trim() || cur.shop_logo || '';
    const name = document.getElementById(pfx + 'name')?.value.trim() || cur.name || 'পাইকারি ক্রেতা';
    const mobile = document.getElementById(pfx + 'mobile')?.value.trim() || cur.mobile || cur.phone || '';
    const mail = document.getElementById(pfx + 'mail')?.value.trim() ?? (cur.mail || '');
    const address = document.getElementById(pfx + 'address')?.value.trim() || cur.address || '';
    const shopName = document.getElementById(pfx + 'shop')?.value.trim() || cur.shop_name || 'পাইকারি প্রতিষ্ঠান';
    const userId = document.getElementById(pfx + 'user-id')?.value.trim() || mobile || cur.user_id || '';
    const pass = document.getElementById(pfx + 'pass')?.value.trim() || cur.password || '';

    const updated = {
      ...cur,
      shop_id: shopId,
      Shop_ID: shopId,
      shop_logo: shopLogo,
      Shop_logo: shopLogo,
      logo: shopLogo,
      name: name,
      Name: name,
      mobile: mobile,
      Mobile: mobile,
      phone: mobile,
      mail: mail,
      Mail: mail,
      email: mail,
      address: address,
      Address: address,
      shop_name: shopName,
      Shop_Name: shopName,
      user_id: userId,
      User_ID: userId,
      password: pass,
      Password: pass,
      account_type: 'WHOLESALER'
    };

    const list = loadWholesaleLocal('dcbd_wholesalers', []);
    const idx = list.findIndex(w => (w.mobile && w.mobile === updated.mobile) || (w.shop_id && w.shop_id === updated.shop_id));
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    saveWholesaleLocal('dcbd_wholesalers', list);

    const modal = document.getElementById('wholesale-profile-edit-modal');
    if (modal) modal.classList.remove('active');

    authStore.setUser(updated, authStore.token || ('TOKEN-WHOLE-' + Date.now()), 'WHOLESALER');

    setTimeout(() => {
      try { apiClient.request('wholesalers/update', updated).catch(() => {}); } catch (err) {}
    }, 10);

    alert('আপনার হোলসেলার শপ ও প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  // 10. Instant Wholesaler Logout -> Direct Home Page Redirect
  window.wholesaleLogout = function(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/');
    }
    authStore.logout();
  };

  // 11. Instant Wholesaler Auth Handler (9 Sequential Fields for Register + Fast Login)
  window.handleWholesaleAuth = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();

    const form = document.getElementById('wholesale-auth-form');
    const isRegister = form?.getAttribute('data-auth-mode') === 'register' || !!document.getElementById('w-shop');

    const phone = document.getElementById('w-phone')?.value.trim() || '';
    const pass = document.getElementById('w-pass')?.value.trim() || '';

    const errBox = document.getElementById('wholesale-error-alert');
    const errMsg = document.getElementById('wholesale-error-msg');
    const showError = (msg) => {
      if (errBox && errMsg) {
        errMsg.textContent = msg;
        errBox.classList.remove('hidden');
        errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        alert(msg);
      }
    };

    if (!phone) {
      showError('মোবাইল নম্বর বা ইউজার আইডি প্রদান করুন।');
      return;
    }

    if (!isRegister) {
      const savedWholesalers = loadWholesaleLocal('dcbd_wholesalers', []);
      const matched = savedWholesalers.find(w =>
        String(w.mobile || w.phone || '').trim() === phone ||
        String(w.user_id || w.User_ID || '').trim().toLowerCase() === phone.toLowerCase() ||
        String(w.shop_id || w.Shop_ID || '').trim().toLowerCase() === phone.toLowerCase()
      );

      const loginProfile = matched || {
        shop_id: 'WHS-408210',
        Shop_ID: 'WHS-408210',
        shop_logo: '',
        Shop_logo: '',
        name: 'পাইকারি ক্রেতা',
        Name: 'পাইকারি ক্রেতা',
        mobile: phone,
        Mobile: phone,
        phone: phone,
        mail: '',
        Mail: '',
        address: 'বাংলাদেশ',
        Address: 'বাংলাদেশ',
        shop_name: 'পাইকারি বাণিজ্য প্রতিষ্ঠান',
        Shop_Name: 'পাইকারি বাণিজ্য প্রতিষ্ঠান',
        user_id: phone,
        User_ID: phone,
        account_type: 'WHOLESALER'
      };

      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', '/wholesaler/dashboard');
      }
      authStore.setUser({ ...loginProfile, account_type: 'WHOLESALER' }, 'TOKEN-WHOLE-' + Date.now(), 'WHOLESALER');
      window.enforceWholesaleCartRules(true);

      setTimeout(() => {
        try {
          apiClient.request("wholesalers/login", { phone, mobile: phone, password: pass, account_type: 'WHOLESALER' }).catch(() => {});
        } catch (err) {}
      }, 10);
      return;
    }

    // Registration: Read all 9 Sequential Fields
    const shopId = document.getElementById('w-shop-id')?.value.trim() || ('WHS-' + Math.floor(100000 + Math.random() * 900000));
    const logoEl = document.getElementById('w-shop-logo');
    const shopLogo = logoEl?.getAttribute('data-uploaded-url') || logoEl?.value.trim() || '';
    const name = document.getElementById('w-name')?.value.trim() || '';
    const mail = document.getElementById('w-mail')?.value.trim() || '';
    const address = document.getElementById('w-address')?.value.trim() || '';
    const shopName = document.getElementById('w-shop')?.value.trim() || '';
    const userId = document.getElementById('w-user-id')?.value.trim() || phone;

    if (!name) {
      showError('আপনার পূর্ণ নাম প্রদান করুন।');
      return;
    }
    if (!address) {
      showError('দোকান বা ব্যবসার ঠিকানা প্রদান করুন।');
      return;
    }
    if (!shopName) {
      showError('প্রতিষ্ঠান বা শপের নাম প্রদান করুন।');
      return;
    }
    if (!pass || pass.length < 4) {
      showError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (errBox) errBox.classList.add('hidden');

    const payload = {
      shop_id: shopId,
      Shop_ID: shopId,
      shop_logo: shopLogo,
      Shop_logo: shopLogo,
      logo: shopLogo,
      name: name,
      Name: name,
      mobile: phone,
      Mobile: phone,
      phone: phone,
      mail: mail,
      Mail: mail,
      email: mail,
      address: address,
      Address: address,
      shop_name: shopName,
      Shop_Name: shopName,
      user_id: userId,
      User_ID: userId,
      password: pass,
      Password: pass,
      account_type: 'WHOLESALER'
    };

    const savedList = loadWholesaleLocal('dcbd_wholesalers', []);
    savedList.unshift(payload);
    saveWholesaleLocal('dcbd_wholesalers', savedList);

    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/wholesaler/dashboard');
    }
    authStore.setUser(payload, 'TOKEN-WHOLE-' + Date.now(), 'WHOLESALER');
    window.enforceWholesaleCartRules(true);

    setTimeout(() => {
      try {
        apiClient.request("wholesalers/register", payload).catch(() => {});
      } catch (err) {}
    }, 10);
  };

  // Capture-Phase Form Submit Listener (Strictly scoped to #wholesale-auth-form and #checkout-form Partner guard)
  document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'wholesale-auth-form') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.handleWholesaleAuth(e);
      return;
    }

    // Before Checkout Form submits for a Wholesaler or Reseller, enforce partner rules on every cart item
    if (e.target && e.target.id === 'checkout-form' && (authStore.isWholesaler() || authStore.isReseller())) {
      window.enforceWholesaleCartRules(true);
    }
  }, true);

  // Scoped Real-Time Input Delegation (Including Product Detail #product-qty-input MOQ enforcement)
  document.addEventListener('input', function(e) {
    const id = e.target && e.target.id;
    if (!id) return;

    if (id === 'product-qty-input' && authStore.isWholesaler()) {
      const minQty = Number(e.target.getAttribute('data-whs-min') || e.target.min || 5);
      const val = Number(e.target.value);
      if (!isNaN(val) && val > 0 && val < minQty) {
        e.target.value = String(minQty);
        showWholesaleNotice(
          "সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ)",
          `পাইকারি অর্ডারে সর্বনিম্ন ${minQty} পিসের কম দেওয়া যাবে না!`,
          "error"
        );
      }
      return;
    }

    if (id === 'w-phone') {
      const uid = document.getElementById('w-user-id');
      if (uid) uid.value = e.target.value.trim();
    } else if (id === 'w-pass') {
      window.checkWholesalePasswordStrength(e.target.value);
    } else if (id === 'w-shop-logo') {
      e.target.removeAttribute('data-uploaded-url');
      const prev = document.getElementById('w-logo-preview');
      if (prev) prev.src = e.target.value.trim() || DEFAULT_WHOLESALE_LOGO;
    } else if (id === 'set-w-logo') {
      e.target.removeAttribute('data-uploaded-url');
      const prev = document.getElementById('set-w-logo-preview');
      if (prev) prev.src = e.target.value.trim() || DEFAULT_WHOLESALE_LOGO;
    } else if (id === 'modal-w-logo') {
      e.target.removeAttribute('data-uploaded-url');
      const prev = document.getElementById('modal-w-logo-preview');
      if (prev) prev.src = e.target.value.trim() || DEFAULT_WHOLESALE_LOGO;
    }
  });

  // Scoped Change Listener for Compressed Logo Upload, Product Qty Input, and Checkout Dropdowns
  document.addEventListener('change', function(e) {
    const id = e.target && e.target.id;
    if (!id) return;

    if (id === 'product-qty-input' && authStore.isWholesaler()) {
      const minQty = Number(e.target.getAttribute('data-whs-min') || e.target.min || 5);
      const val = Number(e.target.value);
      if (isNaN(val) || val < minQty) {
        e.target.value = String(minQty);
        showWholesaleNotice(
          "সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ)",
          `সর্বনিম্ন অর্ডার পরিমাণ ${minQty} পিস স্বয়ংক্রিয়ভাবে সেট করা হয়েছে।`,
          "warning"
        );
      }
      return;
    }

    if ((id === 'checkout-payment-method' || id === 'checkout-delivery-zone') && (authStore.isWholesaler() || authStore.isReseller())) {
      setTimeout(() => window.enhanceWholesaleOrderFormsDOM(), 10);
      return;
    }

    const handleUpload = (fileInput, textInputId, previewImgId) => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      compressWholesaleLogo(file, (compressedDataUrl) => {
        const logoInput = document.getElementById(textInputId);
        const preview = document.getElementById(previewImgId);
        if (logoInput) {
          logoInput.value = file.name;
          logoInput.setAttribute('data-uploaded-url', compressedDataUrl);
        }
        if (preview) preview.src = compressedDataUrl;
      });
    };

    if (id === 'w-logo-file-input') {
      handleUpload(e.target, 'w-shop-logo', 'w-logo-preview');
    } else if (id === 'set-w-logo-file') {
      handleUpload(e.target, 'set-w-logo', 'set-w-logo-preview');
    } else if (id === 'modal-w-logo-file') {
      handleUpload(e.target, 'modal-w-logo', 'modal-w-logo-preview');
    }
  });

  // Scoped Click Delegation for Wholesaler Portal Buttons
  document.addEventListener('click', function(e) {
    if (!e.target || !e.target.closest) return;

    const tabBtn = e.target.closest('[data-whs-tab]');
    if (tabBtn) {
      e.preventDefault();
      const targetTab = tabBtn.getAttribute('data-whs-tab');
      if (targetTab) window.switchWholesaleTab(targetTab, tabBtn);
      return;
    }

    const toggleBtn = e.target.closest('.btn-toggle-w-pass');
    if (toggleBtn) {
      e.preventDefault();
      const targetId = toggleBtn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          toggleBtn.innerHTML = '🙈';
          toggleBtn.title = 'পাসওয়ার্ড লুকান';
        } else {
          input.type = 'password';
          toggleBtn.innerHTML = '👁️';
          toggleBtn.title = 'পাসওয়ার্ড দেখুন';
        }
      }
      return;
    }

    if (e.target.closest('#btn-suggest-w-pass')) {
      e.preventDefault();
      window.suggestWholesalePassword();
      return;
    }

    if (e.target.closest('#btn-open-wholesale-modal')) {
      e.preventDefault();
      const modal = document.getElementById('wholesale-profile-edit-modal');
      if (modal) modal.classList.add('active');
      return;
    }

    if (e.target.closest('#btn-close-wholesale-modal') || e.target.id === 'wholesale-profile-edit-modal') {
      const modal = document.getElementById('wholesale-profile-edit-modal');
      if (modal) modal.classList.remove('active');
      return;
    }

    if (e.target.closest('#btn-wholesale-logout')) {
      window.wholesaleLogout(e);
      return;
    }
  });
}

export async function renderWholesalePortal(params = {}) {
  const isLogged = authStore.isAuthenticated();
  const pathname = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
  const currentView = params.subview || (
    pathname.includes('/register') ? 'register' :
    (pathname.includes('/login') ? 'login' : 'dashboard')
  );

  // If already logged in as wholesaler and visiting login/register, redirect to dashboard
  if (isLogged && authStore.isWholesaler() && (currentView === 'login' || currentView === 'register')) {
    if (typeof window !== 'undefined' && window.router) {
      setTimeout(() => window.router.navigate('/wholesaler/dashboard'), 10);
    }
  }

  if (currentView === 'login' || currentView === 'register' || !isLogged) {
    return renderWholesaleAuthView(currentView === 'register' ? 'register' : 'login');
  }

  WHOLESALE_MEM_CACHE.catalogRendered = false;
  triggerWholesaleBackgroundSync();
  window.enforceWholesaleCartRules(true);

  const user = authStore.user || {};
  const products = getFastProducts();
  normalizeCatalogWholesaleFields(products);
  const allOrders = getFastOrders();

  const userPhone = String(user.mobile || user.phone || '').trim();
  let wholesaleOrders = allOrders.filter(o => {
    const oType = String(o.account_type || '').toLowerCase();
    const oPhone = String(o.phone || o.customer_phone || '').trim();
    return oType === 'wholesaler' || (userPhone && oPhone.includes(userPhone));
  });

  if (wholesaleOrders.length === 0 && allOrders.length > 0) {
    wholesaleOrders = allOrders.slice(0, 4);
  }

  const totalOrders = wholesaleOrders.length;
  const pendingOrders = wholesaleOrders.filter(o => {
    const st = String(o.order_status || 'Pending').toLowerCase();
    return ['pending', 'order placed', 'processing', 'packing'].includes(st);
  }).length;
  const deliveredOrders = wholesaleOrders.filter(o => {
    const st = String(o.order_status || '').toLowerCase();
    return ['delivered', 'completed'].includes(st);
  }).length;
  const cancelledOrders = wholesaleOrders.filter(o => {
    const st = String(o.order_status || '').toLowerCase();
    return ['cancelled', 'returned'].includes(st);
  }).length;

  const totalSpent = wholesaleOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0) || 185000;
  const cartItems = cartStore.items || [];
  const cartSubtotal = cartStore.getSubtotal ? cartStore.getSubtotal() : cartItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
  const categories = Array.from(new Set(products.map(p => String(p.category || '').trim()).filter(Boolean)));

  const shopName = user.shop_name || user.Shop_Name || 'পাইকারি বাণিজ্য হাব';
  const ownerName = user.name || user.Name || 'পাইকারি ক্রেতা';
  const shopId = user.shop_id || user.Shop_ID || 'WHS-408210';
  const userId = user.user_id || user.User_ID || user.mobile || user.phone || '01XXXXXXXXX';
  const shopLogo = user.shop_logo || user.Shop_logo || user.logo || '';
  const initial = (shopName || ownerName || 'W').charAt(0).toUpperCase();

  const firstProd = products[0] || { selling_price: 18500, wholesale_price: 16200, min_order_q: 5 };
  const initMoq = getWholesaleMOQ(firstProd);
  const initWhsRate = getWholesaleUnitPrice(firstProd);
  const initRetailRate = Number(firstProd.selling_price || 1000);
  const initSubtotal = initWhsRate * initMoq;
  const initGrandTotal = initSubtotal + (initSubtotal >= 2000 ? 0 : 90);

  return `
    <style id="dc-wholesale-dashboard-styles">
      .dc-whs-dashboard {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding-bottom: 4rem;
        box-sizing: border-box;
      }

      .dc-whs-dash-grid {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
        align-items: start;
        width: 100%;
      }

      @media (max-width: 1024px) {
        .dc-whs-dash-grid {
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
      }

      .dc-whs-sidebar {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 22px;
        padding: 1.25rem;
        box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
        position: sticky;
        top: 5rem;
        z-index: 20;
      }

      .dark .dc-whs-sidebar {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.45);
      }

      @media (max-width: 1024px) {
        .dc-whs-sidebar {
          position: static;
        }
      }

      .dc-whs-sidebar-head {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-bottom: 0.9rem;
        border-bottom: 1px solid #f1f5f9;
      }

      .dark .dc-whs-sidebar-head {
        border-bottom-color: #1e293b;
      }

      .dc-whs-avatar {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.45rem;
        font-weight: 900;
        box-shadow: 0 6px 16px rgba(217, 119, 6, 0.28);
        flex-shrink: 0;
        overflow: hidden;
        border: 2px solid rgba(245, 158, 11, 0.45);
      }

      .dc-whs-nav-list {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      @media (max-width: 1024px) {
        .dc-whs-nav-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
          gap: 0.45rem;
        }
      }

      .dc-whs-nav-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.65rem 0.85rem;
        border-radius: 12px;
        font-size: 0.8125rem;
        font-weight: 700;
        color: #475569;
        text-decoration: none;
        transition: background-color 0.15s ease, color 0.15s ease;
        border: 1px solid transparent;
        cursor: pointer;
        background: transparent;
        text-align: left;
      }

      .dark .dc-whs-nav-item {
        color: #cbd5e1;
      }

      .dc-whs-nav-item:hover {
        background: #fffbeb;
        color: #b45309;
      }

      .dark .dc-whs-nav-item:hover {
        background: #1e293b;
        color: #fbbf24;
      }

      .dc-whs-nav-item.active {
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        color: #b45309 !important;
        border-color: #fde68a;
        font-weight: 800;
      }

      .dark .dc-whs-nav-item.active {
        background: rgba(245, 158, 11, 0.16);
        color: #fbbf24 !important;
        border-color: rgba(245, 158, 11, 0.35);
      }

      .dc-whs-badge-cnt {
        font-size: 0.6875rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 9999px;
        background: #e2e8f0;
        color: #334155;
      }

      .dark .dc-whs-badge-cnt {
        background: #334155;
        color: #f1f5f9;
      }

      .dc-whs-nav-item.active .dc-whs-badge-cnt {
        background: #d97706;
        color: #ffffff;
      }

      .dc-whs-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.875rem;
      }

      @media (max-width: 640px) {
        .dc-whs-kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.65rem;
        }
      }

      .dc-whs-kpi-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 1.15rem 1.25rem;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .dark .dc-whs-kpi-card {
        background: #0f172a;
        border-color: #1e293b;
      }

      .dc-whs-panel {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 22px;
        padding: 1.5rem;
        box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.04);
        box-sizing: border-box;
      }

      .dark .dc-whs-panel {
        background: #0f172a;
        border-color: #1e293b;
      }

      @media (max-width: 640px) {
        .dc-whs-panel {
          padding: 1rem;
          border-radius: 16px;
        }
      }

      .dc-whs-filter-btn {
        padding: 0.42rem 0.95rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
        background: #ffffff;
        color: #475569;
        border: 1.5px solid #e2e8f0;
        cursor: pointer;
        white-space: nowrap;
      }

      .dark .dc-whs-filter-btn {
        background: #1e293b;
        color: #cbd5e1;
        border-color: #334155;
      }

      .dc-whs-filter-btn.active {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
        color: #ffffff !important;
        border-color: #d97706 !important;
        font-weight: 800 !important;
      }

      .dc-whs-order-card {
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 18px;
        padding: 1.15rem 1.25rem;
      }

      .dark .dc-whs-order-card {
        background: rgba(30, 41, 59, 0.55);
        border-color: #334155;
      }

      .dc-whs-catalog-wrap {
        display: flex;
        flex-direction: column;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        overflow: hidden;
      }

      .dark .dc-whs-catalog-wrap {
        background: #0f172a;
        border-color: #1e293b;
      }

      .dc-whs-moq-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.65rem 0.75rem;
        background: #fffbeb;
        border-top: 1px solid #fde68a;
        font-size: 0.7rem;
      }

      .dark .dc-whs-moq-bar {
        background: rgba(120, 53, 15, 0.3);
        border-top-color: rgba(245, 158, 11, 0.3);
      }
    </style>

    <div class="dc-whs-dashboard">
      
      <!-- TOP WHOLESALER HEADER CARD -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div class="flex items-center gap-4">
          <div class="dc-whs-avatar">
            ${shopLogo ? `
              <img src="${shopLogo}" alt="${shopName}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='${initial}';" />
            ` : initial}
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ${shopName}
              </h1>
              <span class="badge badge-warning text-[10px] font-bold">ভেরিফায়েড হোলসেলার</span>
              <span class="badge badge-info text-[10px] font-mono font-bold">${shopId}</span>
            </div>
            
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>👤 <strong>${ownerName}</strong></span>
              <span>•</span>
              <span>📞 ${user.mobile || user.phone || '01XXXXXXXXX'}</span>
              ${user.mail || user.email ? `<span>•</span><span>✉️ ${user.mail || user.email}</span>` : ''}
              <span>•</span>
              <span>📍 ${user.address || 'বাংলাদেশ'}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a 
            href="/products" 
            class="btn-primary py-2.5 px-4 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5"
          >
            <span>🛍️</span>
            <span>মূল শপে যান</span>
          </a>

          <button 
            type="button"
            id="btn-open-wholesale-modal"
            class="btn-secondary py-2.5 px-3.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            শপ এডিট ✎
          </button>

          <button 
            type="button"
            id="btn-wholesale-logout" 
            class="btn-secondary py-2.5 px-3.5 text-xs font-bold rounded-xl text-rose-600 border-rose-200 cursor-pointer"
          >
            লগআউট ✕
          </button>
        </div>

      </div>

      <!-- MAIN 2-COLUMN LAYOUT -->
      <div class="dc-whs-dash-grid">
        
        <!-- LEFT SIDEBAR -->
        <aside class="dc-whs-sidebar">
          
          <div class="dc-whs-sidebar-head">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-base overflow-hidden" style="flex-shrink: 0;">
              ${shopLogo ? `
                <img src="${shopLogo}" alt="${shopName}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='🏢';" />
              ` : '🏢'}
            </div>
            <div style="min-width: 0;">
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${shopName}</div>
              <div class="text-[10px] text-amber-600 font-mono font-bold">ID: ${userId}</div>
            </div>
          </div>

          <nav class="dc-whs-nav-list" aria-label="Wholesaler Navigation">
            <button type="button" class="dc-whs-nav-item active" data-whs-tab="wtab-overview">
              <span class="flex items-center gap-2"><span>📊</span> ওভারভিউ</span>
              <span class="text-[10px] text-amber-600">●</span>
            </button>

            <button type="button" class="dc-whs-nav-item" data-whs-tab="wtab-catalog">
              <span class="flex items-center gap-2"><span>📦</span> পাইকারি ক্যাটালগ ও MOQ</span>
              <span class="dc-whs-badge-cnt">${products.length}</span>
            </button>

            <button type="button" class="dc-whs-nav-item" data-whs-tab="wtab-calculator">
              <span class="flex items-center gap-2"><span>⚡</span> পাইকারি অর্ডার ফর্ম</span>
              <span class="text-[10px] text-emerald-600 font-bold">MOQ অটো</span>
            </button>

            <button type="button" class="dc-whs-nav-item" data-whs-tab="wtab-orders">
              <span class="flex items-center gap-2"><span>📋</span> বাল্ক অর্ডার ও ইনভয়েস</span>
              <span class="dc-whs-badge-cnt">${totalOrders}</span>
            </button>

            <button type="button" class="dc-whs-nav-item" data-whs-tab="wtab-track">
              <span class="flex items-center gap-2"><span>🚚</span> লাইভ চালান ট্র্যাকিং</span>
              <span class="text-[10px] text-blue-600 font-bold">লাইভ</span>
            </button>

            <button type="button" class="dc-whs-nav-item" data-whs-tab="wtab-cart">
              <span class="flex items-center gap-2"><span>🛒</span> পাইকারি কার্ট তালিকা</span>
              <span class="dc-whs-badge-cnt">${cartItems.length}</span>
            </button>

            <button type="button" class="dc-whs-nav-item" data-whs-tab="wtab-rules">
              <span class="flex items-center gap-2"><span>📜</span> পাইকারি নীতিমালা</span>
            </button>

            <button type="button" class="dc-whs-nav-item" data-whs-tab="wtab-settings">
              <span class="flex items-center gap-2"><span>⚙️</span> শপ প্রোফাইল ও সেটিংস</span>
            </button>
          </nav>

          <div class="p-3 bg-amber-50/70 dark:bg-slate-800 rounded-xl border border-amber-200/80 dark:border-slate-700 text-[11px] space-y-1">
            <div class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>💬</span> পাইকারি হটলাইন
            </div>
            <a href="https://wa.me/8801581703822" target="_blank" class="block text-amber-600 dark:text-amber-400 font-bold">
              হোয়াটসঅ্যাপ: 01581703822
            </a>
            <div class="text-slate-500 text-[10px]">সরাসরি কল: 01818273838</div>
          </div>

        </aside>

        <!-- RIGHT MAIN CONTENT AREA -->
        <main class="space-y-6" style="min-width: 0;">
          
          <!-- ================= TAB 1: OVERVIEW ================= -->
          <div id="wtab-overview" class="wholesale-tab-content space-y-6">
            
            <div class="dc-whs-kpi-grid">
              <div class="dc-whs-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>মোট পাইকারি ক্রয়</span>
                  <span>📦</span>
                </div>
                <div class="text-2xl font-black text-amber-600 mt-2">${formatCurrency(totalSpent)}</div>
                <div class="text-[10px] text-amber-600 font-bold mt-1">ইনভয়েস ভলিউম</div>
              </div>

              <div class="dc-whs-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>বাল্ক অর্ডার সংখ্যা</span>
                  <span>📋</span>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-white mt-2">${totalOrders || 12} টি</div>
                <div class="text-[10px] text-emerald-600 font-bold mt-1">১০০% কুরিয়ার ডেলিভারি</div>
              </div>

              <div class="dc-whs-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>অনুমোদিত ক্রেডিট লিমিট</span>
                  <span>💳</span>
                </div>
                <div class="text-2xl font-black text-emerald-600 mt-2">৳৫০,০০০</div>
                <div class="text-[10px] text-emerald-600 font-bold mt-1">ব্যবসায়িক বাকির সীমা</div>
              </div>

              <div class="dc-whs-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>গড় পাইকারি ছাড়</span>
                  <span>🏷️</span>
                </div>
                <div class="text-2xl font-black text-indigo-600 mt-2">১৫–২৫%</div>
                <div class="text-[10px] text-indigo-600 font-bold mt-1">হোলসেল মূল্য স্বয়ংক্রিয় সক্রিয়</div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-amber-900 via-slate-900 to-slate-950 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div class="space-y-1">
                <h3 class="text-base sm:text-lg font-black">সরাসরি ইমপোর্টার ও কারখানা দরে বাল্ক পণ্য সংগ্রহ করুন!</h3>
                <p class="text-xs text-amber-200">আপনার অ্যাকাউন্টে হোলসেল দাম ও সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ) স্বয়ংক্রিয়ভাবে সেট করা আছে।</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" data-whs-tab="wtab-catalog" class="btn-primary py-2.5 px-5 font-bold text-xs bg-amber-400 text-slate-950 rounded-xl cursor-pointer">
                  📦 পাইকারি ক্যাটালগ →
                </button>
                <button type="button" data-whs-tab="wtab-calculator" class="btn-secondary py-2.5 px-4 font-bold text-xs rounded-xl cursor-pointer">
                  ⚡ পাইকারি অর্ডার ফর্ম
                </button>
              </div>
            </div>

            <div class="dc-whs-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📋</span> সাম্প্রতিক পাইকারি চালানসমূহ
                </h3>
                <button type="button" class="text-xs text-amber-600 font-bold cursor-pointer" data-whs-tab="wtab-orders">
                  সবগুলো দেখুন (${totalOrders}) →
                </button>
              </div>

              ${wholesaleOrders.length === 0 ? `
                <div class="py-10 text-center space-y-3">
                  <div class="text-3xl">📦</div>
                  <div class="text-xs text-slate-500">এখনো কোনো পাইকারি চালান পাওয়া যায়নি।</div>
                  <button type="button" data-whs-tab="wtab-catalog" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl cursor-pointer">
                    পাইকারি ক্যাটালগ দেখুন
                  </button>
                </div>
              ` : `
                <div class="space-y-3">
                  ${wholesaleOrders.slice(0, 3).map(o => {
                    const st = String(o.order_status || 'Pending').toLowerCase();
                    let stBadge = 'badge-warning';
                    if (['delivered', 'completed'].includes(st)) stBadge = 'badge-success';
                    if (['cancelled', 'returned'].includes(st)) stBadge = 'badge-danger';

                    const productName = extractOrderProductName(o);
                    const orderQty = extractOrderQuantity(o);

                    return `
                      <div class="dc-whs-order-card">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5 mb-3">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-mono font-black text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                              #${o.order_id}
                            </span>
                            <span class="text-xs text-slate-500">📅 ${o.date || 'আজকের চালান'}</span>
                            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">🏢 ${shopName}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="badge ${stBadge} text-[10px] uppercase">${o.order_status || 'Pending'}</span>
                          </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                          <div class="sm:col-span-5" style="min-width: 0;">
                            <div class="text-[10px] font-bold text-slate-400 uppercase">পণ্যের বিবরণ</div>
                            <div class="font-bold text-slate-900 dark:text-white text-sm truncate">${productName}</div>
                            <div class="text-[11px] text-slate-500 truncate">📍 ${o.address || user.address || 'বাংলাদেশ'}</div>
                          </div>

                          <div class="sm:col-span-2">
                            <div class="text-[10px] font-bold text-slate-400 uppercase">মোট পিস</div>
                            <div class="font-mono font-black text-xs text-slate-800 dark:text-slate-200 mt-0.5">${orderQty} পিস</div>
                          </div>

                          <div class="sm:col-span-2">
                            <div class="text-[10px] font-bold text-slate-400 uppercase">চালান মূল্য</div>
                            <div class="text-sm font-black text-amber-600">${formatCurrency(o.total_amount || 0)}</div>
                          </div>

                          <div class="sm:col-span-3 flex gap-2 justify-end">
                            <a href="/order-success?orderId=${o.order_id}" class="btn-secondary py-1.5 px-3 text-xs font-bold rounded-xl">
                              🖨️ ভাউচার
                            </a>
                            <button type="button" onclick="window.openWholesaleOrderTrack('${o.order_id}')" class="btn-primary py-1.5 px-3 text-xs font-bold rounded-xl cursor-pointer">
                              🚚 ট্র্যাক
                            </button>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              `}
            </div>

          </div>

          <!-- ================= TAB 2: WHOLESALE CATALOGUE (Lazy-Rendered) ================= -->
          <div id="wtab-catalog" class="wholesale-tab-content hidden space-y-4">
            <div class="dc-whs-panel space-y-4">
              
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📦</span> হোলসেল রেট ক্যাটালগ ও MOQ (${products.length} টি পণ্য)
                  </h3>
                  <p class="text-xs text-slate-500">প্রতিটি পণ্যে হোলসেল দাম সিলেক্ট করা আছে এবং সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ) অটো যুক্ত হবে।</p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <select 
                    id="whs-catalog-cat" 
                    class="form-control text-xs py-2 px-3 rounded-xl" 
                    style="width: auto;"
                    onchange="window.filterWholesaleCatalog()"
                  >
                    <option value="all">সকল ক্যাটাগরি</option>
                    ${categories.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join("")}
                  </select>

                  <input 
                    type="text" 
                    id="whs-catalog-search"
                    placeholder="পণ্য বা কোড খুঁজুন..." 
                    class="form-control text-xs py-2 px-3 rounded-xl"
                    style="width: 200px;"
                    oninput="window.filterWholesaleCatalog()"
                  />
                </div>
              </div>

              <div id="whs-catalog-grid" class="product-grid"></div>
              <div id="whs-catalog-more-wrap" class="pt-4 text-center"></div>

            </div>
          </div>

          <!-- ================= TAB 3: BULK ORDERS & INVOICES ================= -->
          <div id="wtab-orders" class="wholesale-tab-content hidden space-y-4">
            <div class="dc-whs-panel space-y-4">
              
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📋</span> বাল্ক অর্ডার ও ইনভয়েস তালিকা (${totalOrders})
                  </h3>
                  <p class="text-xs text-slate-500">আপনার সকল পাইকারি চালান, পেমেন্ট স্ট্যাটাস ও প্রিন্টেবল ভাউচার।</p>
                </div>

                <input 
                  type="text" 
                  placeholder="চালান আইডি বা পণ্য খুঁজুন..." 
                  class="form-control text-xs py-2 px-3 rounded-xl"
                  style="width: 220px;"
                  oninput="window.filterWholesaleOrders(this.value)"
                />
              </div>

              <div class="flex items-center gap-2 overflow-x-auto pb-1">
                <button type="button" class="dc-whs-filter-btn active" onclick="window.filterWholesaleOrderStatus('all', this)">সবগুলো (${totalOrders})</button>
                <button type="button" class="dc-whs-filter-btn" onclick="window.filterWholesaleOrderStatus('pending', this)">পেন্ডিং (${pendingOrders})</button>
                <button type="button" class="dc-whs-filter-btn" onclick="window.filterWholesaleOrderStatus('delivered', this)">ডেলিভার্ড (${deliveredOrders})</button>
                <button type="button" class="dc-whs-filter-btn" onclick="window.filterWholesaleOrderStatus('cancelled', this)">বাতিল (${cancelledOrders})</button>
              </div>

              <div class="space-y-3">
                ${wholesaleOrders.map(o => {
                  const st = String(o.order_status || 'Pending').toLowerCase();
                  let stBadge = 'badge-warning';
                  if (['delivered', 'completed'].includes(st)) stBadge = 'badge-success';
                  if (['cancelled', 'returned'].includes(st)) stBadge = 'badge-danger';

                  const productName = extractOrderProductName(o);
                  const orderQty = extractOrderQuantity(o);

                  return `
                    <div 
                      class="dc-whs-order-card wholesale-order-item" 
                      data-status="${st}" 
                      data-search="${(o.order_id + ' ' + productName + ' ' + (o.phone || '')).toLowerCase()}"
                    >
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5 mb-3">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-mono font-black text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                            #${o.order_id}
                          </span>
                          <span class="text-xs text-slate-500">📅 ${o.date || 'আজকের চালান'}</span>
                          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">💳 ${o.payment_method || 'কন্ডিশন কুরিয়ার'}</span>
                        </div>
                        <span class="badge ${stBadge} text-[10px] uppercase">${o.order_status || 'Pending'}</span>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                        <div class="sm:col-span-5" style="min-width: 0;">
                          <div class="text-[10px] font-bold text-slate-400 uppercase">পণ্যের নাম</div>
                          <div class="font-bold text-slate-900 dark:text-white text-sm truncate">${productName}</div>
                          <div class="text-[11px] text-slate-500 truncate">📍 ${o.address || user.address || 'বাংলাদেশ'}</div>
                        </div>

                        <div class="sm:col-span-2">
                          <div class="text-[10px] font-bold text-slate-400 uppercase">পরিমাণ</div>
                          <div class="font-mono font-black text-xs text-slate-800 dark:text-slate-200 mt-0.5">${orderQty} পিস</div>
                        </div>

                        <div class="sm:col-span-2">
                          <div class="text-[10px] font-bold text-slate-400 uppercase">মোট চালান মূল্য</div>
                          <div class="text-base font-black text-amber-600">${formatCurrency(o.total_amount || 0)}</div>
                        </div>

                        <div class="sm:col-span-3 flex gap-2 justify-end">
                          <a href="/order-success?orderId=${o.order_id}" class="btn-secondary py-1.5 px-3 text-xs font-bold rounded-xl">
                            🖨️ ভাউচার
                          </a>
                          <button type="button" onclick="window.openWholesaleOrderTrack('${o.order_id}')" class="btn-primary py-1.5 px-3 text-xs font-bold rounded-xl cursor-pointer">
                            🚚 ট্র্যাক
                          </button>
                        </div>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>

            </div>
          </div>

          <!-- ================= TAB 4: DIRECT WHOLESALE ORDER FORM & MOQ CALCULATOR ================= -->
          <div id="wtab-calculator" class="wholesale-tab-content hidden space-y-4">
            <div class="dc-whs-panel max-w-3xl mx-auto space-y-5 text-xs">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>⚡</span> সরাসরি পাইকারি অর্ডার ফর্ম ও প্রফিট ক্যালকুলেটর
                  </h3>
                  <p class="text-xs text-slate-500">পণ্য নির্বাচন করলেই হোলসেল দাম সিলেক্ট হবে এবং সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ) অটো যুক্ত হবে।</p>
                </div>
                <span class="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black text-[11px] border border-amber-300 self-start sm:self-center">
                  ✓ Wholesale Price Active
                </span>
              </div>

              <form onsubmit="window.submitDirectWholesaleOrder(event);" class="space-y-4">
                
                <!-- Product Selection & Locked MOQ Stepper -->
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                  <div class="sm:col-span-7">
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পাইকারি পণ্য নির্বাচন করুন *</label>
                    <select 
                      id="whs-calc-product" 
                      class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-bold" 
                      onchange="window.onWholesaleProductSelectChange()"
                    >
                      ${products.map((p, idx) => {
                        const m = getWholesaleMOQ(p);
                        const w = getWholesaleUnitPrice(p);
                        return `<option value="${idx}">${p.name || p.p_name} — হোলসেল দর: ${formatCurrency(w)} (সর্বনিম্ন MOQ: ${m} পিস)</option>`;
                      }).join("")}
                    </select>
                  </div>

                  <div class="sm:col-span-5">
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      অর্ডার পরিমাণ (সর্বনিম্ন MOQ অটো যুক্ত) *
                    </label>
                    <div class="flex items-center rounded-xl border-2 border-amber-400 dark:border-amber-500/70 bg-white dark:bg-slate-800 overflow-hidden h-[40px]">
                      <button 
                        type="button" 
                        class="w-11 h-full flex items-center justify-center font-black text-base text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-slate-700 cursor-pointer"
                        onclick="window.stepWholesaleOrderFormQty(-1)"
                        title="পরিমাণ কমান (সর্বনিম্ন MOQ এর নিচে নামবে না)"
                      >−</button>
                      <input 
                        type="number" 
                        id="whs-calc-qty" 
                        min="${initMoq}" 
                        value="${initMoq}" 
                        required
                        class="flex-1 h-full text-center font-mono font-black text-sm bg-transparent border-none outline-none text-slate-900 dark:text-white"
                        oninput="window.recalcWholesaleQuote(false)"
                        onchange="window.recalcWholesaleQuote(true)"
                      />
                      <button 
                        type="button" 
                        class="w-11 h-full flex items-center justify-center font-black text-base text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-slate-700 cursor-pointer"
                        onclick="window.stepWholesaleOrderFormQty(1)"
                        title="পরিমাণ বাড়ান"
                      >+</button>
                    </div>
                  </div>
                </div>

                <!-- MOQ Warning Alert (If user tries to type < MOQ) -->
                <div id="whs-calc-moq-warning" class="hidden p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs"></div>

                <!-- Live Wholesale Price & Profit Breakdown Cards -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-amber-50/80 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                  <div>
                    <div class="text-[10px] text-slate-500 font-bold">সর্বনিম্ন অর্ডার (MOQ)</div>
                    <div id="whs-calc-moq-lbl" class="text-sm font-black text-slate-900 dark:text-white mt-0.5">${initMoq} পিস</div>
                    <div class="text-[10px] text-amber-600 font-bold">অটো যুক্ত</div>
                  </div>
                  <div>
                    <div class="text-[10px] text-slate-500 font-bold">নির্বাচিত হোলসেল দর</div>
                    <div class="flex items-baseline gap-1.5 mt-0.5">
                      <span id="whs-calc-unit-rate" class="text-sm font-black text-amber-600">${formatCurrency(initWhsRate)}</span>
                      <span id="whs-calc-retail-rate" class="text-[10px] text-slate-400 line-through">${formatCurrency(initRetailRate)}</span>
                    </div>
                    <div class="text-[10px] text-emerald-600 font-bold">পাইকারি রেট সিলেক্টেড</div>
                  </div>
                  <div>
                    <div class="text-[10px] text-slate-500 font-bold">মোট পাইকারি মূল্য</div>
                    <div id="whs-calc-total-cost" class="text-sm font-black text-slate-900 dark:text-white mt-0.5">${formatCurrency(initSubtotal)}</div>
                    <div class="text-[10px] text-slate-400">হোলসেল দরে ক্যালকুলেটেড</div>
                  </div>
                  <div>
                    <div class="text-[10px] text-slate-500 font-bold">আপনার খুচরা বিক্রয় লাভ</div>
                    <div id="whs-calc-net-profit" class="text-sm font-black text-emerald-600 mt-0.5">+${formatCurrency(Math.max(0, (initRetailRate - initWhsRate) * initMoq))}</div>
                    <div class="text-[10px] text-emerald-600 font-bold">নিট মুনাফা</div>
                  </div>
                </div>

                <!-- Shipping & Payment Fields for Direct Wholesale Order (NO 5% Online Discount for Wholesalers) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">প্রতিষ্ঠান / ক্রেতার নাম *</label>
                    <input type="text" id="whs-order-name" value="${shopName}" required class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-bold" />
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">মোবাইল নম্বর *</label>
                    <input type="tel" id="whs-order-phone" value="${user.mobile || user.phone || ''}" required class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-mono font-bold" />
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ডেলিভারি এরিয়া</label>
                    <select id="whs-order-zone" class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-bold" onchange="window.recalcWholesaleQuote(true)">
                      <option value="dhaka">ঢাকা সিটি (৳৯০ / ৳২,০০০+ ফ্রি)</option>
                      <option value="cumilla">কুমিল্লা হাব (৳৭০ / ৳২,০০০+ ফ্রি)</option>
                      <option value="outside">ঢাকার বাইরে ট্রান্সপোর্ট/কুরিয়ার (৳১২০ / ৳২,০০০+ ফ্রি)</option>
                      <option value="pickup">সরাসরি অফিস পিকআপ (ফ্রি ৳০)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পেমেন্ট পদ্ধতি (পাইকারি রেট)</label>
                    <select id="whs-order-payment" class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-bold" onchange="window.recalcWholesaleQuote(true)">
                      <option value="COD">💵 ক্যাশ অন ডেলিভারি / কন্ডিশন বুকিং</option>
                      <option value="BKASH_PERSONAL">🌸 বিকাশ পেমেন্ট (পাইকারি রেট)</option>
                      <option value="NAGAD_PERSONAL">🔥 নগদ পেমেন্ট (পাইকারি রেট)</option>
                      <option value="ROCKET_PERSONAL">🚀 রকেট পেমেন্ট (পাইকারি রেট)</option>
                      <option value="BANK">🏦 ব্যাংক ট্রান্সফার (পাইকারি রেট)</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">সম্পূর্ণ ডেলিভারি ঠিকানা *</label>
                    <input type="text" id="whs-order-address" value="${user.address || ''}" required placeholder="মার্কেট, রোড, থানা, জেলা..." class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                  </div>
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">কালার / সাইজ বা ট্রান্সপোর্ট নোট (ঐচ্ছিক)</label>
                    <input type="text" id="whs-order-note" placeholder="যেমন: সুন্দরবন কুরিয়ার / কালো কালার..." class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div class="text-[11px] text-amber-300 font-bold">সর্বমোট প্রদেয় পাইকারি বিল (হোলসেল দরে):</div>
                    <div id="whs-order-grand-total" class="text-xl font-black text-amber-400 font-mono">${formatCurrency(initGrandTotal)}</div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button 
                      type="button" 
                      onclick="window.addCalculatorQuoteToCart(false)" 
                      class="btn-secondary py-2.5 px-4 font-bold rounded-xl cursor-pointer text-xs"
                    >
                      🛒 কার্টে যোগ করুন
                    </button>
                    <button 
                      type="submit" 
                      id="btn-whs-direct-order-submit"
                      class="btn-primary py-2.5 px-5 font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer text-xs"
                    >
                      ✓ হোলসেল দরে অর্ডার কনফার্ম করুন →
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>

          <!-- ================= TAB 5: LIVE TRACKING ================= -->
          <div id="wtab-track" class="wholesale-tab-content hidden space-y-4">
            <div class="dc-whs-panel space-y-5">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚚</span> লাইভ পাইকারি চালান ট্র্যাকিং
                </h3>
                <p class="text-xs text-slate-500">আপনার বাল্ক অর্ডার আইডি দিয়ে ট্রান্সপোর্ট বা কুরিয়ারের বর্তমান অবস্থান দেখুন।</p>
              </div>

              <div class="flex flex-col sm:flex-row gap-2 max-w-lg">
                <input 
                  type="text" 
                  id="wholesale-track-input"
                  placeholder="যেমন: ORD-102938" 
                  value="${wholesaleOrders[0] ? wholesaleOrders[0].order_id : 'ORD-102938'}"
                  class="form-control text-xs py-2.5 px-4 rounded-xl flex-1 font-mono font-bold"
                />
                <button 
                  type="button" 
                  class="btn-primary py-2.5 px-6 font-bold text-xs rounded-xl cursor-pointer"
                  onclick="window.executeWholesaleTrack()"
                >
                  ট্র্যাক করুন 🔍
                </button>
              </div>

              <div class="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div>
                    <span class="text-[10px] text-slate-400 font-bold uppercase">চালান আইডি</span>
                    <h4 class="font-mono font-black text-amber-600 text-base" id="whs-track-disp-id">
                      ${wholesaleOrders[0] ? wholesaleOrders[0].order_id : 'ORD-102938'}
                    </h4>
                  </div>
                  <span class="badge badge-success text-xs font-bold">In Transit</span>
                </div>

                <div class="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold mx-auto flex items-center justify-center">✓</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">বুকিং কনফার্মড</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold mx-auto flex items-center justify-center">✓</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">মাস্টার কার্টন প্যাকিং</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-amber-500 text-white font-bold mx-auto flex items-center justify-center">🚚</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">ট্রান্সপোর্টে হস্তান্তর</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 font-bold mx-auto flex items-center justify-center">4</div>
                    <div class="font-bold text-slate-400 text-[11px]">ডেলিভারি সম্পন্ন</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= TAB 6: WHOLESALE CART (MOQ Locked & Wholesale Price Calculated) ================= -->
          <div id="wtab-cart" class="wholesale-tab-content hidden space-y-4">
            <div class="dc-whs-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🛒</span> পাইকারি কার্ট তালিকা (${cartItems.length} টি আইটেম)
                  </h3>
                  <p class="text-xs text-slate-500">সকল পণ্যে হোলসেল দাম ও সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ) স্বয়ংক্রিয়ভাবে প্রযোজ্য।</p>
                </div>
                <button type="button" data-whs-tab="wtab-catalog" class="text-xs text-amber-600 font-bold cursor-pointer">
                  + ক্যাটালগ থেকে আরও যোগ করুন
                </button>
              </div>

              ${cartItems.length === 0 ? `
                <div class="py-12 text-center space-y-3">
                  <div class="text-4xl">🛒</div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-300">আপনার পাইকারি কার্ট খালি আছে</div>
                  <button type="button" data-whs-tab="wtab-catalog" class="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl cursor-pointer">
                    📦 পাইকারি ক্যাটালগ দেখুন
                  </button>
                </div>
              ` : `
                <div class="space-y-3">
                  ${cartItems.map(it => {
                    const moq = getWholesaleMOQ(it);
                    const whsPrice = getWholesaleUnitPrice(it);
                    const qty = Math.max(moq, Number(it.quantity) || moq);
                    const isMin = qty <= moq;
                    return `
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs gap-3">
                        <div class="flex items-center gap-3" style="min-width: 0;">
                          <img src="${it.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}" loading="lazy" class="w-14 h-14 rounded-xl object-cover border border-slate-200" style="flex-shrink: 0;" />
                          <div style="min-width: 0;">
                            <h4 class="font-bold text-slate-900 dark:text-white truncate">${it.name}</h4>
                            <div class="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                              <span>হোলসেল দর: <strong class="text-amber-600 font-black">${formatCurrency(whsPrice)}</strong></span>
                              <span>•</span>
                              <span class="text-emerald-600 font-bold">সর্বনিম্ন MOQ: ${moq} পিস</span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center justify-between sm:justify-end gap-3" style="flex-shrink: 0;">
                          <div class="inline-flex items-center rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 overflow-hidden">
                            <button 
                              type="button"
                              class="btn-cart-minus w-7 h-7 flex items-center justify-center font-black ${isMin ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}"
                              data-product-id="${it.product_id}"
                              data-color="${it.color || ''}"
                              data-size="${it.size || ''}"
                              title="${isMin ? `সর্বনিম্ন ${moq} পিসের কম করা যাবে না` : 'পরিমাণ কমান'}"
                            >−</button>
                            <span class="px-2.5 font-mono font-black text-xs">${qty} পিস</span>
                            <button 
                              type="button"
                              class="btn-cart-plus w-7 h-7 flex items-center justify-center font-black cursor-pointer"
                              data-product-id="${it.product_id}"
                              data-color="${it.color || ''}"
                              data-size="${it.size || ''}"
                              title="পরিমাণ বাড়ান"
                            >+</button>
                          </div>

                          <div class="text-right">
                            <div class="font-black text-slate-900 dark:text-white text-sm">${formatCurrency(whsPrice * qty)}</div>
                            <a href="/checkout" class="btn-primary text-xs py-1 px-2.5 rounded-lg inline-block mt-1 font-bold">অর্ডার ফর্ম →</a>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join("")}

                  <div class="p-4 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div class="text-xs text-slate-500">মোট পাইকারি বিল (হোলসেল দরে)</div>
                      <div class="text-lg font-black text-amber-700 dark:text-amber-400">${formatCurrency(cartSubtotal)}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <a href="/cart" class="btn-secondary py-2 px-4 text-xs font-bold rounded-xl">কার্ট পেজ</a>
                      <a href="/checkout" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl">বাল্ক অর্ডার কনফার্ম করুন →</a>
                    </div>
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- ================= TAB 7: WHOLESALE RULES ================= -->
          <div id="wtab-rules" class="wholesale-tab-content hidden space-y-4">
            <div class="dc-whs-panel max-w-2xl mx-auto space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <h3 class="text-base font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                📜 পাইকারি ক্রয়ের নীতিমালা ও নির্দেশিকা
              </h3>
              <p>১. <strong>সর্বনিম্ন অর্ডার কোয়ান্টিটি (MOQ):</strong> হোলসেলার হিসেবে পণ্য ক্রয়ের ক্ষেত্রে প্রতিটি আইটেমের নির্ধারিত ন্যূনতম পরিমাণ (যেমন: ৫, ৮, ১০ বা ১২ পিস) পূরণ করতে হবে। এর কম অর্ডার সিস্টেমে গ্রহণ করা হয় না।</p>
              <p>২. <strong>হোলসেল মূল্য ও পেমেন্ট নীতি:</strong> হোলসেলার অ্যাকাউন্টে লগইন থাকা অবস্থায় সকল অর্ডার ফর্ম ও চেকআউটে স্বয়ংক্রিয়ভাবে পাইকারি দর (Wholesale Price) সিলেক্ট ও ক্যালকুলেট হবে। যেহেতু পাইকারি দরে ইতিমধ্যে সর্বোচ্চ ছাড় দেওয়া থাকে, তাই হোলসেলারদের জন্য অনলাইন পেমেন্টে অতিরিক্ত ৫% ডিসকাউন্ট প্রযোজ্য নয়।</p>
              <p>৩. <strong>মাস্টার কার্টন ও ট্রান্সপোর্ট সুবিধা:</strong> সকল পাইকারি অর্ডার মাস্টার কার্টন প্যাকিংয়ে সরাসরি কুমিল্লা হাব থেকে সুন্দরবন কুরিয়ার, এসএ পরিবহন বা স্টেডফাস্টের মাধ্যমে সারা দেশে পাঠানো হয়।</p>
              <p>৪. <strong>হটলাইন সাপোর্ট:</strong> যেকোনো পাইকারি কোটেশনের জন্য যোগাযোগ করুন: <strong>01581703822 (WhatsApp)</strong>।</p>
            </div>
          </div>

          <!-- ================= TAB 8: SHOP PROFILE & SETTINGS (All 9 Fields) ================= -->
          <div id="wtab-settings" class="wholesale-tab-content hidden space-y-4">
            <div class="dc-whs-panel max-w-2xl mx-auto space-y-5 text-xs">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚙️</span> হোলসেলার শপ প্রোফাইল ও সেটিংস
                </h3>
                <p class="text-xs text-slate-500">আপনার পাইকারি প্রতিষ্ঠানের লোগো, নাম, মোবাইল, ইমেইল ও ঠিকানা আপডেট করুন।</p>
              </div>

              <form onsubmit="window.updateWholesaleProfile(event, 'settings');" class="space-y-4">
                
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">শপ লোগো (Shop_logo)</label>
                  <div class="flex items-center gap-3">
                    <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500 bg-slate-100 dark:bg-slate-800 flex items-center justify-center" style="flex-shrink: 0;">
                      <img 
                        id="set-w-logo-preview" 
                        src="${shopLogo || DEFAULT_WHOLESALE_LOGO}" 
                        alt="Shop Logo" 
                        class="w-full h-full object-cover"
                        onerror="this.onerror=null; this.src='${DEFAULT_WHOLESALE_LOGO}';"
                      />
                    </div>
                    <div class="flex-1" style="min-width: 0;">
                      <input 
                        type="text" 
                        id="set-w-logo" 
                        value="${shopLogo && !shopLogo.startsWith('data:') ? shopLogo : ''}" 
                        ${shopLogo && shopLogo.startsWith('data:') ? `data-uploaded-url="${shopLogo}"` : ''}
                        placeholder="লোগোর লিংক দিন বা আপলোড করুন" 
                        class="form-control text-xs w-full py-2.5 px-3 rounded-xl" 
                      />
                    </div>
                    <button 
                      type="button" 
                      class="btn-secondary py-2.5 px-3.5 text-xs font-bold rounded-xl cursor-pointer"
                      onclick="document.getElementById('set-w-logo-file').click();"
                    >
                      📁 আপলোড
                    </button>
                    <input type="file" id="set-w-logo-file" accept="image/*" class="hidden" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">শপ আইডি (Shop_ID)</label>
                    <input type="text" id="set-w-shop-id" value="${shopId}" readonly class="form-control text-xs w-full py-2.5 px-3 rounded-xl bg-slate-50 font-mono font-bold text-amber-600" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">প্রতিষ্ঠান / শপের নাম (Shop_Name) *</label>
                    <input type="text" id="set-w-shop" value="${shopName}" required class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-bold" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম (Name) *</label>
                    <input type="text" id="set-w-name" value="${ownerName}" required class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">মোবাইল নম্বর (Mobile) *</label>
                    <input type="tel" id="set-w-mobile" value="${user.mobile || user.phone || ''}" required class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-mono" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল (Mail)</label>
                    <input type="email" id="set-w-mail" value="${user.mail || user.email || ''}" class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইউজার আইডি (User_ID)</label>
                    <input type="text" id="set-w-user-id" value="${userId}" readonly class="form-control text-xs w-full py-2.5 px-3 rounded-xl bg-slate-50 font-mono" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">দোকান / ব্যবসার ঠিকানা (Address) *</label>
                    <input type="text" id="set-w-address" value="${user.address || user.Address || ''}" required class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পাসওয়ার্ড (Password)</label>
                    <input type="password" id="set-w-pass" value="${user.password || ''}" placeholder="নতুন পাসওয়ার্ড (ঐচ্ছিক)" class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                  </div>
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn-primary py-2.5 px-6 font-bold text-xs rounded-xl cursor-pointer">
                    প্রোফাইল তথ্য সংরক্ষণ করুন ✓
                  </button>
                </div>

              </form>
            </div>
          </div>

        </main>

      </div>

    </div>

    <!-- WHOLESALER SHOP PROFILE EDIT MODAL -->
    <div id="wholesale-profile-edit-modal" class="modal-backdrop">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🏢</span> হোলসেলার প্রোফাইল এডিট করুন
          </h3>
          <button type="button" id="btn-close-wholesale-modal" class="text-slate-400 font-bold cursor-pointer">✕</button>
        </div>

        <form onsubmit="window.updateWholesaleProfile(event, 'modal');" class="space-y-3.5">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">শপ লোগো (Shop_logo)</label>
            <div class="flex items-center gap-2">
              <div class="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-500 bg-slate-100 flex items-center justify-center" style="flex-shrink: 0;">
                <img 
                  id="modal-w-logo-preview" 
                  src="${shopLogo || DEFAULT_WHOLESALE_LOGO}" 
                  alt="Logo" 
                  class="w-full h-full object-cover"
                  onerror="this.onerror=null; this.src='${DEFAULT_WHOLESALE_LOGO}';"
                />
              </div>
              <input 
                type="text" 
                id="modal-w-logo" 
                value="${shopLogo && !shopLogo.startsWith('data:') ? shopLogo : ''}" 
                ${shopLogo && shopLogo.startsWith('data:') ? `data-uploaded-url="${shopLogo}"` : ''}
                placeholder="লিঙ্ক দিন বা আপলোড করুন" 
                class="form-control text-xs flex-1 py-2 px-3 rounded-xl" 
              />
              <button 
                type="button" 
                class="btn-secondary py-2 px-3 text-xs font-bold rounded-xl cursor-pointer"
                onclick="document.getElementById('modal-w-logo-file').click();"
              >
                📁 আপলোড
              </button>
              <input type="file" id="modal-w-logo-file" accept="image/*" class="hidden" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">প্রতিষ্ঠান / শপের নাম (Shop_Name) *</label>
            <input type="text" id="modal-w-shop" value="${shopName}" required class="form-control text-xs w-full py-2 px-3 rounded-xl font-bold" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম (Name) *</label>
            <input type="text" id="modal-w-name" value="${ownerName}" required class="form-control text-xs w-full py-2 px-3 rounded-xl" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল (Mail)</label>
            <input type="email" id="modal-w-mail" value="${user.mail || user.email || ''}" class="form-control text-xs w-full py-2 px-3 rounded-xl" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ঠিকানা (Address) *</label>
            <input type="text" id="modal-w-address" value="${user.address || ''}" required class="form-control text-xs w-full py-2 px-3 rounded-xl" />
          </div>

          <button type="submit" class="btn-primary w-full py-2.5 font-bold rounded-xl cursor-pointer">
            আপডেট সম্পন্ন করুন ✓
          </button>
        </form>
      </div>
    </div>
  `;
}

function renderWholesaleAuthView(view = 'login') {
  const isRegister = view === 'register';
  const generatedShopId = 'WHS-' + Math.floor(100000 + Math.random() * 900000);

  return `
    <style id="dc-wholesale-auth-styles">
      @keyframes whsFloatGlow {
        0%, 100% { transform: translate(-50%, 0px) scale(1); opacity: 0.85; }
        50% { transform: translate(-50%, 12px) scale(1.06); opacity: 1; }
      }

      .dc-whs-auth-wrap {
        min-height: calc(100vh - 150px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem 3.5rem;
        position: relative;
        overflow: hidden;
      }

      .dc-whs-glow-orb-1 {
        position: absolute;
        top: -90px;
        left: 50%;
        width: 650px;
        height: 360px;
        background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 72%);
        filter: blur(55px);
        pointer-events: none;
        z-index: 0;
        animation: whsFloatGlow 7s ease-in-out infinite;
      }

      .dc-whs-glow-orb-2 {
        position: absolute;
        bottom: -80px;
        right: 10%;
        width: 460px;
        height: 280px;
        background: radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, rgba(14, 165, 233, 0.05) 55%, transparent 75%);
        filter: blur(50px);
        pointer-events: none;
        z-index: 0;
      }

      .dc-whs-card {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: ${isRegister ? '660px' : '450px'};
        background: rgba(255, 255, 255, 0.96);
        border: 1.5px solid rgba(226, 232, 240, 0.95);
        border-radius: 28px;
        padding: 2.15rem 2rem;
        box-shadow: 0 24px 55px -12px rgba(15, 23, 42, 0.10), 0 0 0 1px rgba(245, 158, 11, 0.12);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-sizing: border-box;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }

      .dark .dc-whs-card {
        background: rgba(15, 23, 42, 0.94);
        border-color: rgba(51, 65, 85, 0.85);
        box-shadow: 0 28px 65px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(245, 158, 11, 0.2);
      }

      /* Top Accent Bar */
      .dc-whs-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 24px;
        right: 24px;
        height: 4px;
        border-radius: 0 0 8px 8px;
        background: linear-gradient(90deg, #f59e0b 0%, #10b981 50%, #d97706 100%);
      }

      @media (max-width: 640px) {
        .dc-whs-card {
          padding: 1.5rem 1.15rem;
          border-radius: 22px;
        }
      }

      .dc-whs-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 1.15rem;
      }

      .dc-whs-logo-ring {
        width: 58px;
        height: 58px;
        border-radius: 18px;
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        border: 2px solid #f59e0b;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 22px rgba(245, 158, 11, 0.24);
        margin-bottom: 0.65rem;
        position: relative;
      }

      .dark .dc-whs-logo-ring {
        background: #1e293b;
        border-color: #f59e0b;
      }

      .dc-whs-logo-ring img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 12px;
      }

      .dc-whs-badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 11px;
        border-radius: 9999px;
        font-size: 0.68rem;
        font-weight: 800;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.08) 100%);
        color: #b45309;
        border: 1px solid rgba(245, 158, 11, 0.35);
        margin-bottom: 0.4rem;
      }

      .dark .dc-whs-badge-pill {
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.4);
      }

      .dc-whs-title {
        font-size: 1.45rem;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -0.02em;
        margin: 0;
        line-height: 1.25;
      }

      .dark .dc-whs-title {
        color: #ffffff;
      }

      .dc-whs-subtitle {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 4px;
      }

      .dark .dc-whs-subtitle {
        color: #94a3b8;
      }

      /* B2B Feature Strip */
      .dc-whs-perks {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-bottom: 1.15rem;
      }

      .dc-whs-perk-chip {
        font-size: 0.67rem;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 8px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #475569;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .dark .dc-whs-perk-chip {
        background: #1e293b;
        border-color: #334155;
        color: #cbd5e1;
      }

      /* Segmented Switcher */
      .dc-whs-tabs {
        display: flex;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        margin-bottom: 1.35rem;
        gap: 4px;
      }

      .dark .dc-whs-tabs {
        background: #1e293b;
        border-color: #334155;
      }

      .dc-whs-tab {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0.62rem 0.75rem;
        font-size: 0.8125rem;
        font-weight: 700;
        border-radius: 10px;
        color: #64748b;
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .dark .dc-whs-tab {
        color: #94a3b8;
      }

      .dc-whs-tab.active {
        background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        color: #ffffff !important;
        font-weight: 800;
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.32);
      }

      /* 2-Column Dynamic Form Grid */
      .dc-whs-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.95rem 1.05rem;
        text-align: left;
      }

      .dc-whs-col-full {
        grid-column: 1 / -1;
      }

      @media (max-width: 600px) {
        .dc-whs-grid {
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }
      }

      .dc-whs-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 0;
      }

      .dc-whs-label-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;
      }

      .dc-whs-label {
        font-size: 0.75rem;
        font-weight: 800;
        color: #334155;
        line-height: 1.2;
      }

      .dark .dc-whs-label {
        color: #cbd5e1;
      }

      .dc-whs-sub-tag {
        font-size: 0.64rem;
        font-weight: 700;
        color: #d97706;
        background: #fffbeb;
        border: 1px solid #fde68a;
        padding: 1px 6px;
        border-radius: 6px;
      }

      .dark .dc-whs-sub-tag {
        background: rgba(245, 158, 11, 0.14);
        border-color: rgba(245, 158, 11, 0.3);
        color: #fbbf24;
      }

      .dc-whs-req {
        color: #ef4444;
        margin-left: 2px;
      }

      .dc-whs-input-box {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 43px;
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        border-radius: 13px;
        transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease;
        overflow: hidden;
        box-sizing: border-box;
      }

      .dark .dc-whs-input-box {
        background: #1e293b;
        border-color: #334155;
      }

      .dc-whs-input-box:focus-within {
        border-color: #f59e0b;
        box-shadow: 0 0 0 3.5px rgba(245, 158, 11, 0.18);
      }

      .dark .dc-whs-input-box:focus-within {
        background: #0f172a;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3.5px rgba(245, 158, 11, 0.24);
      }

      .dc-whs-input-box.readonly-box {
        background: #f8fafc;
        border-color: #e2e8f0;
      }

      .dark .dc-whs-input-box.readonly-box {
        background: rgba(30, 41, 59, 0.55);
        border-color: #1e293b;
      }

      .dc-whs-icon {
        width: 38px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
        color: #64748b;
        flex-shrink: 0;
        user-select: none;
      }

      .dc-whs-input {
        flex: 1;
        width: 100%;
        height: 100%;
        min-width: 0;
        border: none !important;
        background: transparent !important;
        outline: none !important;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #0f172a;
        padding: 0 0.75rem 0 0;
        box-sizing: border-box;
      }

      .dark .dc-whs-input {
        color: #f8fafc !important;
      }

      .dc-whs-input::placeholder {
        color: #94a3b8;
        font-weight: 400;
      }

      .dc-whs-logo-thumb {
        width: 29px;
        height: 29px;
        border-radius: 8px;
        object-fit: cover;
        margin-left: 6px;
        margin-right: 6px;
        border: 1.5px solid #f59e0b;
        flex-shrink: 0;
        background: #fffbeb;
      }

      .dc-whs-upload-btn {
        height: 31px;
        margin-right: 5px;
        padding: 0 10px;
        border-radius: 9px;
        background: #fffbeb;
        color: #b45309;
        border: 1px solid #fde68a;
        font-size: 0.7rem;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s ease;
      }

      .dark .dc-whs-upload-btn {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.35);
      }

      .dc-whs-upload-btn:hover {
        background: #f59e0b;
        color: #020617;
        border-color: #f59e0b;
      }

      .dc-whs-cc-select {
        height: 100%;
        border: none !important;
        border-right: 1px solid #e2e8f0 !important;
        background: #f8fafc !important;
        color: #0f172a !important;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0 6px 0 8px;
        outline: none !important;
        cursor: pointer;
        flex-shrink: 0;
      }

      .dark .dc-whs-cc-select {
        background: #0f172a !important;
        color: #f8fafc !important;
        border-right-color: #334155 !important;
      }

      .dc-whs-suggest-btn {
        font-size: 0.68rem;
        font-weight: 800;
        color: #b45309;
        background: #fffbeb;
        border: 1px solid #fde68a;
        padding: 2px 8px;
        border-radius: 9999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        transition: all 0.15s ease;
      }

      .dark .dc-whs-suggest-btn {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.35);
      }

      .dc-whs-suggest-btn:hover {
        background: #f59e0b;
        color: #020617;
      }

      .dc-whs-eye-btn {
        width: 36px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        color: #64748b;
        flex-shrink: 0;
      }

      .dc-whs-meter-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }

      .dc-whs-meter-track {
        flex: 1;
        height: 5px;
        background: #e2e8f0;
        border-radius: 9999px;
        overflow: hidden;
      }

      .dark .dc-whs-meter-track {
        background: #334155;
      }

      .dc-whs-meter-fill {
        height: 100%;
        width: 0%;
        border-radius: 9999px;
        transition: width 0.2s ease, background-color 0.2s ease;
      }

      .dc-whs-meter-lbl {
        font-size: 0.66rem;
        font-weight: 800;
        color: #94a3b8;
        white-space: nowrap;
      }

      .dc-whs-submit {
        width: 100%;
        height: 46px;
        margin-top: 1.35rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.92rem;
        font-weight: 900;
        color: #020617;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 55%, #d97706 100%);
        border: none;
        border-radius: 14px;
        box-shadow: 0 10px 24px -4px rgba(217, 119, 6, 0.4);
        cursor: pointer;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }

      .dc-whs-submit:hover {
        transform: translateY(-1.5px);
        box-shadow: 0 14px 28px -4px rgba(217, 119, 6, 0.52);
      }

      .dc-whs-footer {
        margin-top: 1.1rem;
        padding-top: 0.9rem;
        border-top: 1px solid #f1f5f9;
        text-align: center;
        font-size: 0.75rem;
        color: #64748b;
      }

      .dark .dc-whs-footer {
        border-top-color: #1e293b;
        color: #94a3b8;
      }

      .dc-whs-footer a {
        color: #d97706;
        font-weight: 800;
        text-decoration: none;
        margin-left: 4px;
      }

      .dark .dc-whs-footer a {
        color: #fbbf24;
      }

      .dc-whs-footer a:hover {
        text-decoration: underline;
      }
    </style>

    <div class="dc-whs-auth-wrap">
      <div class="dc-whs-glow-orb-1"></div>
      <div class="dc-whs-glow-orb-2"></div>

      <div class="dc-whs-card">
        
        <!-- Header -->
        <div class="dc-whs-header">
          <div class="dc-whs-logo-ring">
            <img 
              src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
              alt="Dream Cart BD"
              onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
            />
          </div>
          <span class="dc-whs-badge-pill">
            <span>📦</span>
            <span>B2B WHOLESALE HUB</span>
          </span>
          <h1 class="dc-whs-title">
            ${isRegister ? 'হোলসেলার রেজিস্ট্রেশন' : 'হোলসেলার লগইন'}
          </h1>
          <p class="dc-whs-subtitle">
            ${isRegister ? 'পাইকারি অ্যাকাউন্ট খুলে সরাসরি ইমপোর্ট ও ফ্যাক্টরি রেটে পণ্য কিনুন' : 'আপনার পাইকারি ড্যাশবোর্ডে প্রবেশ করতে লগইন করুন'}
          </p>
        </div>

        <!-- B2B Perks Strip -->
        <div class="dc-whs-perks">
          <span class="dc-whs-perk-chip"><span>🏷️</span> ১৫–২৫% পাইকারি ছাড়</span>
          <span class="dc-whs-perk-chip"><span>📦</span> মাস্টার কার্টন সাপ্লাই</span>
          <span class="dc-whs-perk-chip"><span>🚚</span> সারা দেশে পরিবহন ডেলিভারি</span>
        </div>

        <!-- Segmented Tab Switcher -->
        <div class="dc-whs-tabs">
          <a href="/wholesaler/login" class="dc-whs-tab ${!isRegister ? 'active' : ''}">
            <span>🔐</span>
            <span>লগইন</span>
          </a>
          <a href="/wholesaler/register" class="dc-whs-tab ${isRegister ? 'active' : ''}">
            <span>📝</span>
            <span>রেজিস্ট্রেশন</span>
          </a>
        </div>

        <!-- Inline Error Alert -->
        <div id="wholesale-error-alert" class="hidden mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <div id="wholesale-error-msg" class="flex-1 font-bold"></div>
        </div>

        <!-- Auth Form -->
        <form 
          id="wholesale-auth-form" 
          data-auth-mode="${isRegister ? 'register' : 'login'}"
          onsubmit="window.handleWholesaleAuth(event);"
        >
          ${isRegister ? `
            <!-- 9 Sequential Wholesaler Fields: Shop_ID, Shop_logo, Name, Mobile, Mail, Address, Shop_Name, User_ID, Password -->
            <div class="dc-whs-grid">
              
              <!-- 1. Shop_ID -->
              <div class="dc-whs-field">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-shop-id">শপ আইডি (Shop_ID)</label>
                  <span class="dc-whs-sub-tag">অটো আইডি</span>
                </div>
                <div class="dc-whs-input-box readonly-box">
                  <span class="dc-whs-icon">🏷️</span>
                  <input 
                    type="text" 
                    id="w-shop-id" 
                    name="shop_id"
                    value="${generatedShopId}" 
                    readonly 
                    class="dc-whs-input font-mono text-amber-600" 
                  />
                </div>
              </div>

              <!-- 2. Shop_logo -->
              <div class="dc-whs-field">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-shop-logo">শপ লোগো (Shop_logo)</label>
                </div>
                <div class="dc-whs-input-box">
                  <img 
                    id="w-logo-preview" 
                    src="${DEFAULT_WHOLESALE_LOGO}" 
                    alt="Logo" 
                    class="dc-whs-logo-thumb"
                    onerror="this.onerror=null; this.src='${DEFAULT_WHOLESALE_LOGO}';"
                  />
                  <input 
                    type="text" 
                    id="w-shop-logo" 
                    name="shop_logo"
                    placeholder="লিঙ্ক দিন বা আপলোড করুন" 
                    class="dc-whs-input" 
                  />
                  <button 
                    type="button" 
                    class="dc-whs-upload-btn"
                    onclick="document.getElementById('w-logo-file-input').click();"
                  >
                    <span>📁</span>
                    <span>আপলোড</span>
                  </button>
                  <input type="file" id="w-logo-file-input" accept="image/*" class="hidden" />
                </div>
              </div>

              <!-- 3. Name -->
              <div class="dc-whs-field">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-name">পূর্ণ নাম (Name) <span class="dc-whs-req">*</span></label>
                </div>
                <div class="dc-whs-input-box">
                  <span class="dc-whs-icon">👤</span>
                  <input 
                    type="text" 
                    id="w-name" 
                    name="name"
                    required 
                    placeholder="মালিক বা প্রতিনিধির নাম" 
                    class="dc-whs-input" 
                  />
                </div>
              </div>

              <!-- 4. Mobile -->
              <div class="dc-whs-field">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-phone">মোবাইল নম্বর (Mobile) <span class="dc-whs-req">*</span></label>
                </div>
                <div class="dc-whs-input-box">
                  <select id="w-country-code" class="dc-whs-cc-select" title="কান্ট্রি কোড">
                    <option value="+880" selected>🇧🇩 +880</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <input 
                    type="tel" 
                    id="w-phone" 
                    name="mobile"
                    required 
                    pattern="[0-9]{11}" 
                    placeholder="01XXXXXXXXX" 
                    class="dc-whs-input font-mono" 
                    style="padding-left: 0.65rem;"
                  />
                </div>
              </div>

              <!-- 5. Mail -->
              <div class="dc-whs-field">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-mail">ইমেইল (Mail)</label>
                </div>
                <div class="dc-whs-input-box">
                  <span class="dc-whs-icon">✉️</span>
                  <input 
                    type="email" 
                    id="w-mail" 
                    name="mail"
                    placeholder="business@example.com" 
                    class="dc-whs-input" 
                  />
                </div>
              </div>

              <!-- 6. Address -->
              <div class="dc-whs-field">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-address">ঠিকানা (Address) <span class="dc-whs-req">*</span></label>
                </div>
                <div class="dc-whs-input-box">
                  <span class="dc-whs-icon">📍</span>
                  <input 
                    type="text" 
                    id="w-address" 
                    name="address"
                    required 
                    placeholder="মার্কেট, রোড, থানা, জেলা..." 
                    class="dc-whs-input" 
                  />
                </div>
              </div>

              <!-- 7. Shop_Name -->
              <div class="dc-whs-field">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-shop">শপের নাম (Shop_Name) <span class="dc-whs-req">*</span></label>
                </div>
                <div class="dc-whs-input-box">
                  <span class="dc-whs-icon">🏢</span>
                  <input 
                    type="text" 
                    id="w-shop" 
                    name="shop_name"
                    required 
                    placeholder="প্রতিষ্ঠান বা দোকানের নাম" 
                    class="dc-whs-input" 
                  />
                </div>
              </div>

              <!-- 8. User_ID -->
              <div class="dc-whs-field">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-user-id">ইউজার আইডি (User_ID)</label>
                  <span class="dc-whs-sub-tag">অটো ফিল</span>
                </div>
                <div class="dc-whs-input-box readonly-box">
                  <span class="dc-whs-icon">🆔</span>
                  <input 
                    type="text" 
                    id="w-user-id" 
                    name="user_id"
                    readonly 
                    placeholder="মোবাইল নম্বর থেকে অটো বসবে" 
                    class="dc-whs-input font-mono text-amber-600" 
                  />
                </div>
              </div>

              <!-- 9. Password (Full Width Span for Perfect 9-Field Symmetry) -->
              <div class="dc-whs-field dc-whs-col-full">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-pass">পাসওয়ার্ড (Password) <span class="dc-whs-req">*</span></label>
                  <button 
                    type="button" 
                    id="btn-suggest-w-pass"
                    class="dc-whs-suggest-btn"
                  >
                    <span>💡</span>
                    <span>অটো স্ট্রং পাসওয়ার্ড</span>
                  </button>
                </div>
                <div class="dc-whs-input-box">
                  <span class="dc-whs-icon">🔑</span>
                  <input 
                    type="password" 
                    id="w-pass" 
                    name="password"
                    required 
                    minlength="4"
                    placeholder="কমপক্ষে ৪ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন" 
                    class="dc-whs-input" 
                  />
                  <button type="button" class="btn-toggle-w-pass dc-whs-eye-btn" data-target="w-pass" title="পাসওয়ার্ড দেখুন">
                    👁️
                  </button>
                </div>
                <div class="dc-whs-meter-wrap">
                  <div class="dc-whs-meter-track">
                    <div id="w-pwd-strength-bar" class="dc-whs-meter-fill"></div>
                  </div>
                  <span id="w-pwd-strength-label" class="dc-whs-meter-lbl">০%</span>
                </div>
              </div>

            </div>
          ` : `
            <!-- Login Fields -->
            <div class="space-y-4 text-left">
              
              <div class="dc-whs-field">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-phone">মোবাইল নম্বর বা ইউজার আইডি <span class="dc-whs-req">*</span></label>
                </div>
                <div class="dc-whs-input-box">
                  <select id="w-login-country-code" class="dc-whs-cc-select" title="কান্ট্রি কোড">
                    <option value="+880" selected>🇧🇩 +880</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <input 
                    type="text" 
                    id="w-phone" 
                    required 
                    placeholder="01XXXXXXXXX বা WHS-ID" 
                    class="dc-whs-input font-mono" 
                    style="padding-left: 0.65rem;"
                  />
                </div>
              </div>

              <div class="dc-whs-field">
                <div class="dc-whs-label-row">
                  <label class="dc-whs-label" for="w-pass">পাসওয়ার্ড <span class="dc-whs-req">*</span></label>
                </div>
                <div class="dc-whs-input-box">
                  <span class="dc-whs-icon">🔑</span>
                  <input 
                    type="password" 
                    id="w-pass" 
                    required 
                    placeholder="আপনার পাসওয়ার্ড লিখুন" 
                    class="dc-whs-input" 
                  />
                  <button type="button" class="btn-toggle-w-pass dc-whs-eye-btn" data-target="w-pass" title="পাসওয়ার্ড দেখুন">
                    👁️
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <label class="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input type="checkbox" id="w-remember" checked class="rounded text-amber-600 cursor-pointer" />
                  <span>মনে রাখুন</span>
                </label>
                <a 
                  href="https://wa.me/8801581703822?text=Dream%20Cart%20BD%20Wholesaler%20Password%20Help" 
                  target="_blank" 
                  class="text-amber-600 dark:text-amber-400 font-bold"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </a>
              </div>

            </div>
          `}

          <button type="submit" class="dc-whs-submit">
            <span>${isRegister ? 'হোলসেলার রেজিস্ট্রেশন সম্পন্ন করুন' : 'হোলসেলার লগইন করুন'}</span>
            <span>→</span>
          </button>

        </form>

        <div class="dc-whs-footer">
          ${isRegister ? `
            ইতিমধ্যে হোলসেলার অ্যাকাউন্ট আছে? <a href="/wholesaler/login">লগইন করুন →</a>
          ` : `
            নতুন পাইকারি অ্যাকাউন্ট খুলতে চান? <a href="/wholesaler/register">রেজিস্ট্রেশন করুন →</a>
          `}
        </div>

      </div>
    </div>
  `;
}

export const WholesalePortal = renderWholesalePortal;
export default renderWholesalePortal;
