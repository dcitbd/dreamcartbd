/**
 * DREAM CART BD — SECURE AUTH STORE (src/store/authStore.js)
 * Manages authenticated user session across Customer, Reseller, Wholesaler, and Admin/Worker accounts.
 * Features:
 * - Signed session tokens with tamper detection & automatic expiration (12h TTL)
 * - Automatic stripping of sensitive password fields before localStorage persistence
 * - Idle session timeout protection for Admin Portal (2 hours inactivity auto-logout)
 */

import {
  createSignedSessionToken,
  verifySignedSessionToken,
  stripSensitiveUserFields
} from '../utils/security.js';

const ADMIN_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

class AuthStore {
  constructor() {
    this.user = null;
    this.token = null;
    this.accountType = "GUEST"; // 'GUEST', 'CUSTOMER', 'RESELLER', 'WHOLESALER', 'ADMIN'
    this.lastActiveAt = Date.now();
    this.listeners = [];
    this.load();
    this._bindActivityTracker();
  }

  _bindActivityTracker() {
    if (typeof window === 'undefined') return;
    const touch = () => {
      this.lastActiveAt = Date.now();
      if (this.accountType === 'ADMIN') {
        try {
          sessionStorage.setItem('dcbd_admin_last_active', String(this.lastActiveAt));
        } catch (e) {}
      }
    };
    ['mousedown', 'keydown', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, touch, { passive: true });
    });
  }

  load() {
    try {
      const stored = localStorage.getItem("dcbd_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        const cleanUser = stripSensitiveUserFields(parsed.user || null);
        const accType = parsed.accountType || (cleanUser ? cleanUser.account_type || "CUSTOMER" : "GUEST");
        const tok = parsed.token || null;

        // For ADMIN sessions, enforce cryptographic signature & expiration check
        if (accType === "ADMIN") {
          if (!verifySignedSessionToken(tok, cleanUser, "ADMIN")) {
            this._resetState();
            localStorage.removeItem("dcbd_auth");
            return;
          }
          const lastAct = Number(sessionStorage.getItem('dcbd_admin_last_active') || parsed.lastActiveAt || Date.now());
          if (Date.now() - lastAct > ADMIN_IDLE_TIMEOUT_MS) {
            this._resetState();
            localStorage.removeItem("dcbd_auth");
            return;
          }
        }

        this.user = cleanUser;
        this.token = tok;
        this.accountType = accType;
        this.lastActiveAt = Date.now();
      }
    } catch (e) {
      this._resetState();
    }
  }

  _resetState() {
    this.user = null;
    this.token = null;
    this.accountType = "GUEST";
  }

  save(silent = false) {
    try {
      if (this.user && this.token) {
        const cleanUser = stripSensitiveUserFields(this.user);
        this.user = cleanUser;
        localStorage.setItem(
          "dcbd_auth",
          JSON.stringify({
            user: cleanUser,
            token: this.token,
            accountType: this.accountType,
            lastActiveAt: Date.now()
          })
        );
      } else {
        localStorage.removeItem("dcbd_auth");
      }
    } catch (e) {}
    if (!silent) {
      this.notify();
    }
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

  setUser(user, token, accountType, silent = false) {
    const cleanUser = stripSensitiveUserFields(user);
    const accType = accountType || (cleanUser ? cleanUser.account_type || "CUSTOMER" : "GUEST");
    this.user = cleanUser;
    this.accountType = accType;
    // Always generate a cryptographically signed session token if none or legacy unsigned token is passed
    if (!token || !String(token).startsWith('DCBD_SESS.')) {
      this.token = createSignedSessionToken(cleanUser, accType);
    } else {
      this.token = token;
    }
    this.lastActiveAt = Date.now();
    if (typeof window !== 'undefined' && accType === 'ADMIN') {
      try {
        sessionStorage.setItem('dcbd_admin_last_active', String(this.lastActiveAt));
      } catch (e) {}
    }
    this.save(silent);
  }

  logout(silent = false) {
    this._resetState();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('dcbd_admin_last_active');
      } catch (e) {}
    }
    this.save(silent);
  }

  clearUser(silent = false) {
    this.logout(silent);
  }

  isAuthenticated() {
    if (!this.token || !this.user) return false;
    if (this.accountType === "ADMIN") {
      if (!verifySignedSessionToken(this.token, this.user, "ADMIN")) {
        this.logout(true);
        return false;
      }
      if (Date.now() - (this.lastActiveAt || Date.now()) > ADMIN_IDLE_TIMEOUT_MS) {
        this.logout(true);
        return false;
      }
    }
    return true;
  }

  isCustomer() {
    return this.isAuthenticated() && (this.accountType === "CUSTOMER" || this.user?.account_type === "CUSTOMER");
  }

  isReseller() {
    return this.isAuthenticated() && (this.accountType === "RESELLER" || this.user?.account_type === "RESELLER");
  }

  isWholesaler() {
    return this.isAuthenticated() && (this.accountType === "WHOLESALER" || this.user?.account_type === "WHOLESALER");
  }

  isAdmin() {
    if (!this.isAuthenticated()) return false;
    if (this.accountType !== "ADMIN") return false;
    return verifySignedSessionToken(this.token, this.user, "ADMIN");
  }

  getAccountType() {
    return this.accountType || "GUEST";
  }

  getUserDisplayName() {
    if (!this.user) return "";
    return this.user.name || this.user.Name || this.user.shop_name || this.user.user_name || "সম্মানিত সদস্য";
  }
}

export const authStore = new AuthStore();
