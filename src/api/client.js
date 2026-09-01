/**
 * ============================================================================
 * DREAM CART BD — UNIFIED API CLIENT (client.js)
 * High-Performance Fetch Gateway with Fail-Safe Fallback & SWR Caching
 * ============================================================================
 */

const API_ENDPOINT = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_ENDPOINT)
  || (typeof window !== "undefined" && window.VITE_API_ENDPOINT)
  || "https://script.google.com/macros/s/AKfycbzzKAe_RBusYF1ZUThorAHSzkzjxD9bPqETyotFdOtaU8ZD9Lx2mB1sNUdiodGlmIRj/exec";

class ApiClient {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 30000;
    this.maxRetries = 2;
  }

  async request(action, payload = {}, method = "POST", retryCount = 0) {
    if (!API_ENDPOINT) {
      throw new Error("Google Apps Script API Endpoint is missing.");
    }

    const url = new URL(API_ENDPOINT);
    const options = {
      method: method,
      mode: 'cors',
      redirect: 'follow', // গুগল স্ক্রিপ্টের রিডাইরেক্ট বাফার সঠিকভাবে হ্যান্ডেল করতে
      headers: { "Content-Type": "text/plain;charset=utf-8" }
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

      const textData = await response.text();
      let result;
      try {
        result = JSON.parse(textData);
      } catch (err) {
        console.error("Non-JSON raw response received:", textData);
        throw new Error("Invalid server response format from Apps Script.");
      }

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

  async post(action, body = {}) {
    this.cache.clear();
    return await this.request(action, body, "POST");
  }

  clearCache() {
    this.cache.clear();
  }
}

export const api = new ApiClient();
export default api;
