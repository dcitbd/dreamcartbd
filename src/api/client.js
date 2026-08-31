/**
 * ============================================================================
 * DREAM CART BD — UNIFIED API CLIENT (client.js)
 * High-Performance Fetch Gateway with Fail-Safe Fallback & SWR Caching
 * ============================================================================
 */

// Safe API Endpoint Resolution (Works in Vite Dev, Node & Direct Static Browser)
const API_ENDPOINT = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_ENDPOINT)
  || (typeof window !== "undefined" && window.VITE_API_ENDPOINT)
  || "https://script.google.com/macros/s/AKfycbyuyANFCLHnE-GGbGnx_1yr2Z_BOPWv-qBqh-1zQg4knzmMXnL15ERsbeOCfBNBZwys/exec";

class ApiClient {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 30000; // ৩০ সেকেন্ড লোকাল মেমোরি ক্যাশ
    this.maxRetries = 2;
  }

  /**
   * সেন্ট্রাল রিকোয়েস্ট মেথড
   */
  async request(action, payload = {}, method = "POST", retryCount = 0) {
    if (!API_ENDPOINT) {
      throw new Error("Google Apps Script API Endpoint is missing.");
    }

    const url = new URL(API_ENDPOINT);
    const options = {
      method: method,
      headers: { "Content-Type": "text/plain;charset=utf-8" } // Apps Script CORS Preflight বাইপাস
    };

    if (method === "GET") {
      url.searchParams.append("action", action);
      Object.keys(payload).forEach(k => url.searchParams.append(k, payload[k]));
    } else {
      options.body = JSON.stringify({ action, ...payload });
    }

    try {
      const response = await fetch(url.toString(), options);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error?.message || "Operation failed on server");
      }

      return result.data;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(`[API Retry ${retryCount + 1}] Retrying ${action}...`);
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return this.request(action, payload, method, retryCount + 1);
      }
      console.error(`[API Client Error] Action: ${action} | Message: ${error.message}`);
      throw error;
    }
  }

  /**
   * SWR ক্যাশ সহ GET রিকোয়েস্ট
   */
  async get(action, params = {}, useCache = true) {
    const cacheKey = `${action}_${JSON.stringify(params)}`;
    const cached = this.cache.get(cacheKey);

    if (useCache && cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    const data = await this.request(action, params, "GET");
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * POST রিকোয়েস্ট (ডাটা মিউটেশন হলে স্বয়ংক্রিয়ভাবে ক্যাশ ক্লিয়ার হয়)
   */
  async post(action, body = {}) {
    this.cache.clear(); // নতুন ডাটা যুক্ত/আপডেট হলে ক্যাশ ক্লিয়ার
    return await this.request(action, body, "POST");
  }

  clearCache() {
    this.cache.clear();
  }
}

export const api = new ApiClient();
