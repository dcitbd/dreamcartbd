/**
 * DREAM CART BD — CART STORE
 * Manages cart state, localStorage persistence, quantity updates, coupon calculation,
 * dynamic delivery zones (Cumilla ৳70, Dhaka ৳90, Outside ৳120, Pickup ৳0),
 * free delivery rule (Orders > ৳2,000 free delivery),
 * and online prepayment discount (5% discount on online payments).
 */

class CartStore {
  constructor() {
    this.items = [];
    this.coupon = null;
    this.deliveryZone = "dhaka"; // 'cumilla', 'dhaka', 'outside', 'pickup'
    this.paymentMethod = "COD"; // 'COD', 'BKASH_PERSONAL', 'BKASH_PAYMENT', 'NAGAD_PERSONAL', 'ROCKET_PERSONAL', 'BANK', 'CASH_PICKUP'
    this.listeners = [];
    this.loadFromStorage();
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
    } catch (e) {}
  }

  saveToStorage() {
    try {
      localStorage.setItem("dcbd_cart", JSON.stringify(this.items));
      localStorage.setItem("dcbd_delivery_zone", this.deliveryZone);
      localStorage.setItem("dcbd_payment_method", this.paymentMethod);
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

  addItem(product, quantity = 1, variant = null) {
    const existingIndex = this.items.findIndex(
      it => it.product_id === product.product_id && it.variant_id === (variant ? variant.variant_id : "")
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        product_id: product.product_id,
        variant_id: variant ? variant.variant_id : "",
        name: product.name,
        price: product.selling_price,
        regular_price: product.regular_price,
        thumbnail: product.thumbnail,
        seller_id: product.seller_id,
        seller_name: product.seller_name,
        quantity: quantity
      });
    }

    this.saveToStorage();
  }

  updateQuantity(productId, variantId, qty) {
    const idx = this.items.findIndex(it => it.product_id === productId && it.variant_id === (variantId || ""));
    if (idx > -1) {
      if (qty <= 0) {
        this.items.splice(idx, 1);
      } else {
        this.items[idx].quantity = qty;
      }
      this.saveToStorage();
    }
  }

  removeItem(productId, variantId) {
    this.items = this.items.filter(it => !(it.product_id === productId && it.variant_id === (variantId || "")));
    this.saveToStorage();
  }

  clear() {
    this.items = [];
    this.coupon = null;
    this.saveToStorage();
  }

  setDeliveryZone(zone) {
    this.deliveryZone = zone;
    this.saveToStorage();
  }

  setPaymentMethod(method) {
    this.paymentMethod = method;
    this.saveToStorage();
  }

  applyCoupon(couponData) {
    this.coupon = couponData;
    this.notify();
  }

  removeCoupon() {
    this.coupon = null;
    this.notify();
  }

  getSubtotal() {
    return this.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  }

  getCouponDiscount() {
    if (!this.coupon) return 0;
    return this.coupon.discount_amount || 0;
  }

  // Alias for backward compatibility
  getDiscount() {
    return this.getCouponDiscount();
  }

  // Check if eligible for Free Shipping (Orders > ৳2000 or Office Pickup)
  isFreeDelivery() {
    if (this.deliveryZone === "pickup") return true;
    return this.getSubtotal() >= 2000;
  }

  // Delivery fee based on zone and free shipping rule
  getDeliveryCharge() {
    if (this.isFreeDelivery()) {
      return 0;
    }
    switch (this.deliveryZone) {
      case "cumilla":
        return 70;
      case "dhaka":
        return 90;
      case "outside":
        return 120;
      case "pickup":
        return 0;
      default:
        return 90;
    }
  }

  // Property getter for backward compatibility
  get deliveryCharge() {
    return this.getDeliveryCharge();
  }

  // 5% discount for online prepayment (bKash, Nagad, Rocket, Bank)
  isOnlinePayment() {
    const onlineMethods = ["BKASH_PERSONAL", "BKASH_PAYMENT", "NAGAD_PERSONAL", "ROCKET_PERSONAL", "BANK"];
    return onlineMethods.includes(this.paymentMethod);
  }

  getOnlinePaymentDiscount() {
    if (this.isOnlinePayment()) {
      const subtotal = this.getSubtotal();
      return Math.round(subtotal * 0.05);
    }
    return 0;
  }

  getGrandTotal() {
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
