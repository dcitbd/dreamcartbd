/**
 * ============================================================================
 * DREAM CART BD — ORDER & FRAUD SDK (orders.js)
 * ============================================================================
 */

import { api } from "./client.js";

export const OrderAPI = {
  // সমস্ত অর্ডারের তালিকা
  getAll: async (params = {}) => {
    return await api.get("orders.list", params);
  },

  // নির্দিষ্ট অর্ডারের বিস্তারিত
  getById: async (orderId) => {
    return await api.get("orders.get", { orderId });
  },

  // নতুন অর্ডার তৈরি (১-পেজ চেকআউট থেকে)
  create: async (orderData) => {
    return await api.post("orders.create", orderData);
  },

  // অর্ডারের স্ট্যাটাস পরিবর্তন
  updateStatus: async (orderId, status) => {
    return await api.post("orders.updateStatus", { orderId, status });
  },

  // 🛡️ কুরিয়ার ফ্রড চেক ইঞ্জিন (কাস্টমারের ফোন নম্বর দিয়ে চেক)
  checkFraud: async (phone, orderId = "") => {
    return await api.post("fraud.check", { phone, orderId });
  }
};
