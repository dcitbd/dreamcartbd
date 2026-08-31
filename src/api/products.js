/**
 * ============================================================================
 * DREAM CART BD — PRODUCT SDK (products.js)
 * ============================================================================
 */

import { api } from "./client.js";

export const ProductAPI = {
  // সমস্ত প্রোডাক্ট লিস্ট পাওয়া
  getAll: async (params = {}) => {
    return await api.get("products.list", params);
  },

  // নির্দিষ্ট প্রোডাক্ট বিস্তারিত তথ্য পাওয়া
  getById: async (productId) => {
    return await api.get("products.get", { productId });
  },

  // নতুন প্রোডাক্ট তৈরি করা
  create: async (productData) => {
    return await api.post("products.create", productData);
  },

  // সম্পূর্ণ প্রোডাক্ট আপডেট করা
  update: async (productData) => {
    return await api.post("products.update", productData);
  },

  // ⚡ ইনলাইন প্রাইস এডিটর (টেবিল থেকে সরাসরি প্রাইস চেঞ্জ)
  updatePrice: async (productId, newPrice, priceType = "selling_price", reason = "Admin Inline Quick Edit") => {
    return await api.post("products.inlineUpdatePrice", {
      productId,
      newPrice: Number(newPrice),
      priceType,
      reason,
      userId: "ADMIN"
    });
  },

  // ⚡ ইনলাইন স্টক এডিটর (টেবিল থেকে সরাসরি স্টক বৃদ্ধি/হ্রাস)
  updateStock: async (productId, newStock, reason = "Admin Stock Adjustment") => {
    return await api.post("products.inlineUpdateStock", {
      productId,
      newStock: Number(newStock),
      reason,
      userId: "ADMIN"
    });
  },

  // ক্যাটাগরি ট্রি পাওয়া
  getCategoryTree: async () => {
    return await api.get("categories.getTree");
  }
};
