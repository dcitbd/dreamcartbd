/**
 * ============================================================================
 * DREAM CART BD — REACTIVE GLOBAL STORE & STATE MANAGER (store.js)
 * ============================================================================
 */

class GlobalStore {
  constructor() {
    this.listeners = new Map();
    this.state = {
      user: JSON.parse(localStorage.getItem("dcbd_user") || "null"),
      token: localStorage.getItem("dcbd_token") || null,
      cart: JSON.parse(localStorage.getItem("dcbd_cart") || '{"items":[],"subtotal":0,"discount":0,"shipping":0,"total":0}'),
      theme: localStorage.getItem("dcbd_theme") || "light",
      currency: "৳",
      isCartDrawerOpen: false,
      isSidebarOpen: false
    };

    // থিম অ্যাপ্লাই
    this.applyTheme(this.state.theme);
  }

  // ==================== EVENT BUS / SUBSCRIBERS ====================
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data = {}) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  // ==================== CART ACTIONS ====================
  addToCart(product, quantity = 1, selectedVariant = null) {
    const cart = this.state.cart;
    const cartItemId = selectedVariant ? `${product.product_id}_${selectedVariant.variant_id}` : product.product_id;
    const existingIndex = cart.items.findIndex(item => item.cartItemId === cartItemId);

    const unitPrice = selectedVariant ? Number(selectedVariant.selling_price) : Number(product.selling_price || product.regular_price || 0);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        cartItemId: cartItemId,
        productId: product.product_id,
        variantId: selectedVariant ? selectedVariant.variant_id : null,
        name: product.product_name,
        variantName: selectedVariant ? selectedVariant.variant_name : null,
        image: product.thumbnail || (product.images && product.images[0]?.image_url) || "",
        unitPrice: unitPrice,
        quantity: Number(quantity)
      });
    }

    this.recalculateCart();
    this.showToast(`${product.product_name} কার্টে যুক্ত হয়েছে!`, "success");
    this.emit("cart_updated", this.state.cart);
  }

  removeFromCart(cartItemId) {
    this.state.cart.items = this.state.cart.items.filter(item => item.cartItemId !== cartItemId);
    this.recalculateCart();
    this.emit("cart_updated", this.state.cart);
  }

  updateCartQty(cartItemId, newQty) {
    const item = this.state.cart.items.find(i => i.cartItemId === cartItemId);
    if (item) {
      item.quantity = Math.max(1, Number(newQty));
      this.recalculateCart();
      this.emit("cart_updated", this.state.cart);
    }
  }

  clearCart() {
    this.state.cart = { items: [], subtotal: 0, discount: 0, shipping: 0, total: 0 };
    this.saveCart();
    this.emit("cart_updated", this.state.cart);
  }

  recalculateCart() {
    let subtotal = 0;
    this.state.cart.items.forEach(item => {
      subtotal += (item.unitPrice * item.quantity);
    });

    this.state.cart.subtotal = subtotal;
    this.state.cart.total = Math.max(0, subtotal - (this.state.cart.discount || 0) + (this.state.cart.shipping || 0));
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem("dcbd_cart", JSON.stringify(this.state.cart));
  }

  // ==================== AUTH ACTIONS ====================
  setAuth(user, token) {
    this.state.user = user;
    this.state.token = token;
    localStorage.setItem("dcbd_user", JSON.stringify(user));
    localStorage.setItem("dcbd_token", token);
    this.emit("auth_changed", this.state.user);
  }

  logout() {
    this.state.user = null;
    this.state.token = null;
    localStorage.removeItem("dcbd_user");
    localStorage.removeItem("dcbd_token");
    this.emit("auth_changed", null);
    this.showToast("সফলভাবে লগআউট হয়েছেন।", "info");
  }

  isAuthenticated() {
    return !!this.state.token && !!this.state.user;
  }

  hasRole(allowedRoles = []) {
    if (!this.isAuthenticated()) return false;
    return allowedRoles.includes(this.state.user.role);
  }

  // ==================== THEME CONTROLLER ====================
  toggleTheme() {
    const nextTheme = this.state.theme === "dark" ? "light" : "dark";
    this.setTheme(nextTheme);
  }

  setTheme(theme) {
    this.state.theme = theme;
    localStorage.setItem("dcbd_theme", theme);
    this.applyTheme(theme);
    this.emit("theme_changed", theme);
  }

  applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  // ==================== TOAST NOTIFICATIONS ====================
  showToast(message, type = "success", duration = 3500) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const colors = {
      success: "bg-emerald-600 text-white shadow-emerald-500/20",
      danger: "bg-rose-600 text-white shadow-rose-500/20",
      warning: "bg-amber-500 text-slate-900 shadow-amber-500/20",
      info: "bg-brand-600 text-white shadow-brand-500/20"
    };

    toast.className = `pointer-events-auto flex items-center px-4 py-3 rounded-xl shadow-lg font-medium text-sm transition-all duration-300 transform translate-y-2 opacity-0 ${colors[type] || colors.info}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    // Fade In
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    });

    // Auto Dismiss
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

export const store = new GlobalStore();
