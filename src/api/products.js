/**
 * ============================================================================
 * DREAM CART BD — PRODUCT SDK (products.js)
 * ============================================================================
 */

import { api } from "./client.js";

export const ProductAPI = {
  // সমস্ত প্রোডাক্ট লিস্ট পাওয়া
  getAll: async (params = {}) => {
    try {
      if (api && typeof api.get === "function") {
        return await api.get("products.list", params);
      }
      return { items: [] };
    } catch (e) {
      console.error("ProductAPI.getAll failed:", e);
      return { items: [] };
    }
  },

  // নির্দিষ্ট প্রোডাক্ট বিস্তারিত তথ্য পাওয়া
  getById: async (productId) => {
    try {
      if (api && typeof api.get === "function") {
        return await api.get("products.get", { productId });
      }
      return null;
    } catch (e) {
      console.error("ProductAPI.getById failed:", e);
      return null;
    }
  },

  // নতুন প্রোডাক্ট তৈরি করা
  create: async (productData) => {
    if (api && typeof api.post === "function") {
      return await api.post("products.create", productData);
    }
    throw new Error("API Client not available");
  },

  // সম্পূর্ণ প্রোডাক্ট আপডেট করা
  update: async (productData) => {
    if (api && typeof api.post === "function") {
      return await api.post("products.update", productData);
    }
    throw new Error("API Client not available");
  },

  // ⚡ ইনলাইন প্রাইস এডিটর (টেবিল থেকে সরাসরি প্রাইস চেঞ্জ)
  updatePrice: async (productId, newPrice, priceType = "selling_price", reason = "Admin Inline Quick Edit") => {
    if (api && typeof api.post === "function") {
      return await api.post("products.inlineUpdatePrice", {
        productId,
        newPrice: Number(newPrice) || 0,
        priceType,
        reason,
        userId: "ADMIN"
      });
    }
    throw new Error("API Client not available");
  },

  // ⚡ ইনলাইন স্টক এডিটর (টেবিল থেকে সরাসরি স্টক বৃদ্ধি/হ্রাস)
  updateStock: async (productId, newStock, reason = "Admin Stock Adjustment") => {
    if (api && typeof api.post === "function") {
      return await api.post("products.inlineUpdateStock", {
        productId,
        newStock: Number(newStock) || 0,
        reason,
        userId: "ADMIN"
      });
    }
    throw new Error("API Client not available");
  },

  // ক্যাটাগরি ট্রি পাওয়া
  getCategoryTree: async () => {
    try {
      if (api && typeof api.get === "function") {
        return await api.get("categories.getTree");
      }
      return [];
    } catch (e) {
      console.error("ProductAPI.getCategoryTree failed:", e);
      return [];
    }
  }
};

// গ্লোবাল উইন্ডোতে বাইন্ড করা
if (typeof window !== "undefined") {
  window.ProductAPI = ProductAPI;
}

// Default export যুক্ত করা হয়েছে
export default ProductAPI;
