/**
 * DREAM CART BD — CART STORE
 * Manages cart items, role-based pricing (Customer, Reseller, Wholesaler),
 * wholesale minimum order quantity enforcement, dynamic delivery fees
 * synced with Admin System Settings, free shipping threshold, online prepayment discount,
 * Pre-Order (+15% price, online payment only, zero discount/coupon) rules when stock <= 0,
 * and dynamic Promo Coupon discounts.
 */

import { authStore } from './authStore.js';
import {
  getGlobalDeliveryMethods,
  getGlobalPaymentMethods,
  getGlobalSiteSettings,
  getGlobalOffers
} from '../api/client.js';

export const PREORDER_MARKUP_MULTIPLIER = 1.15;

export function isProductOutOfStock(product) {
  if (!product) return false;
  if (product.is_preorder === true) return true;
  if (product.stock === undefined || product.stock === null || product.stock === '') return false;
  return Number(product.stock) <= 0;
}

export function applyPreOrderMarkup(basePrice) {
  const num = Number(basePrice || 0);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.round(num * PREORDER_MARKUP_MULTIPLIER);
}

class CartStore {
  constructor() {
    this.items = [];
    this.coupon = null;
    this.couponCode = "";
    this.deliveryZone = "dhaka"; // 'cumilla', 'dhaka', 'outside', 'pickup' or custom zone code
    this.paymentMethod = "COD"; // 'COD', 'BKASH_PERSONAL', 'BKASH_PAYMENT', 'NAGAD_PERSONAL', 'ROCKET_PERSONAL', 'BANK', or custom code
    this.listeners = [];
    this.loadFromStorage();
  }

  getFirstOnlinePaymentMethod() {
    try {
      const activeMethods = getGlobalPaymentMethods(true) || [];
      for (const pm of activeMethods) {
        const code = String(pm.code || '').toUpperCase().trim();
        const name = String(pm.name || '').toLowerCase();
        const type = String(pm.type || '').toLowerCase();
        const isCod = code === 'COD' || type === 'cod' || name.includes('cash') || name.includes('cod') || name.includes('ক্যাশ');
        if (!isCod) {
          if (code) return code;
          if (name.includes('bkash') || name.includes('বিকাশ')) {
            return (type.includes('merchant') || type.includes('link') || name.includes('link')) ? 'BKASH_PAYMENT' : 'BKASH_PERSONAL';
          }
          if (name.includes('nagad') || name.includes('নগদ')) return 'NAGAD_PERSONAL';
          if (name.includes('rocket') || name.includes('রকেট')) return 'ROCKET_PERSONAL';
          if (name.includes('bank') || name.includes('ব্যাংক')) return 'BANK';
          if (pm.id) return String(pm.id).toUpperCase();
        }
      }
    } catch (e) {}
    return "BKASH_PERSONAL";
  }

  hasPreOrderItems() {
    return this.items.some(it => isProductOutOfStock(it));
  }

  enforcePreOrderRules() {
    if (!this.hasPreOrderItems()) return;
    // Pre-order items cannot use coupons or COD
    if (this.coupon || this.couponCode) {
      this.coupon = null;
      this.couponCode = "";
    }
    if (!this.paymentMethod || this.paymentMethod === "COD" || !this.isOnlinePayment()) {
      this.paymentMethod = this.getFirstOnlinePaymentMethod();
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem("dcbd_cart");
      if (stored) {
        this.items = JSON.parse(stored);
      }
      const savedZone = localStorage.getItem("dcbd_delivery_zone");
      if (savedZone) {
        this.deliveryZone = savedZone;
      }
      const savedMethod = localStorage.getItem("dcbd_payment_method");
      if (savedMethod) {
        this.paymentMethod = savedMethod;
      }
      const savedCoupon = localStorage.getItem("dcbd_applied_coupon");
      if (savedCoupon) {
        this.coupon = JSON.parse(savedCoupon);
        this.couponCode = this.coupon?.code || "";
      }
      this.enforcePreOrderRules();
    } catch (e) {
      this.items = [];
    }
  }

  saveToStorage() {
    try {
      this.enforcePreOrderRules();
      localStorage.setItem("dcbd_cart", JSON.stringify(this.items));
      localStorage.setItem("dcbd_delivery_zone", this.deliveryZone);
      localStorage.setItem("dcbd_payment_method", this.paymentMethod);
      if (this.coupon) {
        localStorage.setItem("dcbd_applied_coupon", JSON.stringify(this.coupon));
      } else {
        localStorage.removeItem("dcbd_applied_coupon");
      }
    } catch (e) {}
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this));
  }

  getProductPriceForCurrentRole(product) {
    let basePrice = Number(product.selling_price || product.price || 0);
    if (authStore.isWholesaler() && product.wholesale_price) {
      basePrice = Number(product.wholesale_price);
    } else if (authStore.isReseller() && product.reseller_price) {
      basePrice = Number(product.reseller_price);
    }
    if (isProductOutOfStock(product)) {
      return applyPreOrderMarkup(basePrice);
    }
    return basePrice;
  }

  addItem(product, quantity = 1, options = {}) {
    const minQty = Number(product.min_order_qty || product.min_order_q || 1);

    if (authStore.isWholesaler() && quantity < minQty) {
      quantity = minQty;
    }

    const isPreOrder = isProductOutOfStock(product);
    const price = this.getProductPriceForCurrentRole(product);
    const rawStock = product.stock !== undefined && product.stock !== null && product.stock !== '' ? Number(product.stock) : 50;
    const existingIndex = this.items.findIndex(
      it => it.product_id === product.product_id && it.color === (options.color || "") && it.size === (options.size || "")
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
      this.items[existingIndex].price = price;
      this.items[existingIndex].stock = rawStock;
      this.items[existingIndex].is_preorder = isPreOrder;
    } else {
      this.items.push({
        product_id: product.product_id,
        sku: product.sku || "",
        name: product.name || product.p_name || "",
        slug: product.slug || "",
        price: price,
        original_price: isPreOrder ? price : (product.original_price || product.regular_price || price),
        wholesale_price: product.wholesale_price || price,
        reseller_price: product.reseller_price || price,
        min_order_qty: minQty,
        thumbnail: product.thumbnail || (product.images && product.images[0]) || "",
        stock: rawStock,
        is_preorder: isPreOrder,
        color: options.color || "",
        size: options.size || "",
        quantity: Math.max(1, quantity)
      });
    }

    this.saveToStorage();
    try {
      if (typeof window !== 'undefined' && window.__dcbdTrackAdEvent) {
        window.__dcbdTrackAdEvent('AddToCart', {
          sku: product.sku || product.product_id || 'DCBD-ITEM',
          product_id: product.product_id || product.sku || 'DCBD-ITEM',
          name: product.name || product.p_name || 'Product',
          selling_price: price,
          price: price,
          quantity: Math.max(1, quantity)
        });
      }
    } catch (e) {}
  }

  updateQuantity(productId, qty, options = {}) {
    const idx = this.items.findIndex(
      it => it.product_id === productId && it.color === (options.color || "") && it.size === (options.size || "")
    );
    if (idx > -1) {
      const minQty = Number(this.items[idx].min_order_qty || 1);
      if (authStore.isWholesaler() && qty < minQty && qty > 0) {
        qty = minQty;
      }

      if (qty <= 0) {
        this.items.splice(idx, 1);
      } else {
        this.items[idx].quantity = qty;
      }
      this.saveToStorage();
    }
  }

  removeItem(productId, options = {}) {
    this.items = this.items.filter(
      it => !(it.product_id === productId && it.color === (options.color || "") && it.size === (options.size || ""))
    );
    this.saveToStorage();
  }

  clear() {
    this.items = [];
    this.coupon = null;
    this.couponCode = "";
    this.saveToStorage();
  }

  setDeliveryZone(zone) {
    this.deliveryZone = zone;
    this.saveToStorage();
  }

  setPaymentMethod(method) {
    if (this.hasPreOrderItems() && String(method || '').toUpperCase() === 'COD') {
      this.paymentMethod = this.getFirstOnlinePaymentMethod();
    } else {
      this.paymentMethod = method;
    }
    this.saveToStorage();
  }

  applyCoupon(couponData) {
    if (this.hasPreOrderItems()) {
      this.coupon = null;
      this.couponCode = "";
      this.saveToStorage();
      return;
    }
    this.coupon = couponData;
    this.couponCode = couponData?.code || "";
    this.saveToStorage();
  }

  removeCoupon() {
    this.coupon = null;
    this.couponCode = "";
    this.saveToStorage();
  }

  clearCoupon() {
    this.removeCoupon();
  }

  validateAndApplyCoupon(rawCode) {
    if (this.hasPreOrderItems()) {
      this.removeCoupon();
      return {
        success: false,
        valid: false,
        message: 'প্রি-অর্ডার পণ্যের জন্য কোনো কুপন বা ডিসকাউন্ট প্রযোজ্য নয়।'
      };
    }
    const code = String(rawCode || '').trim().toUpperCase();
    if (!code) return { success: false, valid: false, message: 'কুপন কোড লিখুন।' };
    const activeOffers = getGlobalOffers(true);
    const matched = activeOffers.find(o => String(o.code || '').trim().toUpperCase() === code);
    if (!matched) {
      return { success: false, valid: false, message: 'কুপন কোডটি সঠিক নয় বা বর্তমানে নিষ্ক্রিয়।' };
    }
    const subtotal = this.getSubtotal();
    const minSpend = Number(matched.min_spend || 0);
    if (subtotal < minSpend) {
      return { success: false, valid: false, message: `এই কুপনটি ব্যবহারের জন্য সর্বনিম্ন ৳${minSpend} এর অর্ডার প্রয়োজন।` };
    }
    this.applyCoupon(matched);
    return { success: true, valid: true, coupon: matched, message: `কুপন "${code}" সফলভাবে যুক্ত হয়েছে (${matched.discount})!` };
  }

  getSubtotal() {
    return this.items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity)), 0);
  }

  getCouponDiscount() {
    if (this.hasPreOrderItems()) return 0;
    if (!this.coupon) return 0;
    const subtotal = this.getSubtotal();
    const minSpend = Number(this.coupon.min_spend || 0);
    if (subtotal < minSpend) return 0;

    if (this.coupon.discount_type === 'free_shipping' || String(this.coupon.discount || '').includes('ফ্রি')) {
      return 0; // Handled in isFreeDelivery()
    }
    if (this.coupon.discount_type === 'percent' || String(this.coupon.discount || '').includes('%')) {
      const pct = Number(this.coupon.discount_value) || Number(String(this.coupon.discount).replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)).replace(/[^0-9.]/g, '')) || 10;
      return Math.round(subtotal * (pct / 100));
    }
    if (this.coupon.discount_type === 'flat' || Number(this.coupon.discount_value) > 0) {
      const flat = Number(this.coupon.discount_value) || Number(String(this.coupon.discount).replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)).replace(/[^0-9.]/g, '')) || 0;
      return Math.min(subtotal, Math.round(flat));
    }
    return Number(this.coupon.discount_amount || 0);
  }

  isFreeDelivery() {
    if (this.deliveryZone === "pickup") return true;
    const activeZones = getGlobalDeliveryMethods(false);
    const zoneObj = activeZones.find(z => z.code === this.deliveryZone || z.id === this.deliveryZone);
    if (zoneObj && Number(zoneObj.charge) === 0) return true;

    if (!this.hasPreOrderItems() && this.coupon && (this.coupon.discount_type === 'free_shipping' || String(this.coupon.discount || '').includes('ফ্রি'))) {
      if (this.getSubtotal() >= Number(this.coupon.min_spend || 0)) return true;
    }

    const siteSettings = getGlobalSiteSettings();
    const threshold = zoneObj && zoneObj.free_threshold !== undefined && Number(zoneObj.free_threshold) > 0
      ? Number(zoneObj.free_threshold)
      : Number(siteSettings.freeDeliveryThreshold || 2000);
    return threshold > 0 && this.getSubtotal() >= threshold;
  }

  getDeliveryCharge() {
    if (this.items.length === 0 || this.isFreeDelivery()) {
      return 0;
    }
    const activeZones = getGlobalDeliveryMethods(false);
    const zoneObj = activeZones.find(z => z.code === this.deliveryZone || z.id === this.deliveryZone);
    if (zoneObj && zoneObj.charge !== undefined) {
      return Number(zoneObj.charge) || 0;
    }
    const siteSettings = getGlobalSiteSettings();
    switch (this.deliveryZone) {
      case "cumilla":
        return Number(siteSettings.feeComilla || 70);
      case "dhaka":
        return Number(siteSettings.feeDhaka || 90);
      case "outside":
        return Number(siteSettings.feeOutside || 120);
      case "pickup":
        return 0;
      default:
        return Number(siteSettings.feeDhaka || 90);
    }
  }

  isOnlinePayment() {
    const methods = getGlobalPaymentMethods(false);
    const found = methods.find(m => m.code === this.paymentMethod || m.id === this.paymentMethod || m.name === this.paymentMethod);
    if (found) {
      return found.code !== 'COD' && found.type !== 'COD';
    }
    const onlineMethods = ["BKASH_PERSONAL", "BKASH_PAYMENT", "NAGAD_PERSONAL", "ROCKET_PERSONAL", "BANK"];
    return onlineMethods.includes(this.paymentMethod);
  }

  getOnlinePaymentDiscount() {
    if (this.hasPreOrderItems()) return 0;
    if (authStore.isWholesaler()) return 0;
    if (this.isOnlinePayment()) {
      const subtotal = this.getSubtotal();
      const methods = getGlobalPaymentMethods(false);
      const found = methods.find(m => m.code === this.paymentMethod || m.id === this.paymentMethod || m.name === this.paymentMethod);
      const siteSettings = getGlobalSiteSettings();
      const pct = (found && found.discount_pct !== undefined)
        ? Number(found.discount_pct)
        : Number(siteSettings.onlineDiscountPct !== undefined ? siteSettings.onlineDiscountPct : 5);
      return pct > 0 ? Math.round(subtotal * (pct / 100)) : 0;
    }
    return 0;
  }

  getGrandTotal() {
    if (this.items.length === 0) return 0;
    const subtotal = this.getSubtotal();
    const delivery = this.getDeliveryCharge();
    const couponDiscount = this.getCouponDiscount();
    const onlineDiscount = this.getOnlinePaymentDiscount();
    return Math.max(0, subtotal + delivery - couponDiscount - onlineDiscount);
  }

  getCount() {
    return this.items.reduce((sum, it) => sum + it.quantity, 0);
  }
}

export const cartStore = new CartStore();
