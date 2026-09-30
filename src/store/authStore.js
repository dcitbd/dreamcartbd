/**
 * DREAM CART BD — AUTH STORE
 * User session, role validation, login state.
 */

class AuthStore {
  constructor() {
    this.user = null;
    this.token = null;
    this.listeners = [];
    this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem("dcbd_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.user = parsed.user;
        this.token = parsed.token;
      }
    } catch (e) {}
  }

  save() {
    try {
      if (this.user && this.token) {
        localStorage.setItem("dcbd_auth", JSON.stringify({ user: this.user, token: this.token }));
      } else {
        localStorage.removeItem("dcbd_auth");
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

  setUser(user, token) {
    this.user = user;
    this.token = token;
    this.save();
  }

  logout() {
    this.user = null;
    this.token = null;
    this.save();
  }

  isAuthenticated() {
    return !!this.token;
  }

  isAdmin() {
    return this.user && (this.user.role === "SUPER_ADMIN" || this.user.role === "ADMIN");
  }

  isSeller() {
    return this.user && (this.user.role === "SELLER" || this.isAdmin());
  }

  isReseller() {
    return this.user && (this.user.role === "RESELLER" || this.isAdmin());
  }

  isWholesale() {
    return this.user && (this.user.role === "WHOLESALE_CUSTOMER" || this.isAdmin());
  }
}

export const authStore = new AuthStore();
