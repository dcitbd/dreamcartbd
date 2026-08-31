/**
 * ============================================================================
 * DREAM CART BD — ORDER & FRAUD SDK (orders.js)
 * ============================================================================
 */

import { api } from "./client.js";

export const OrderAPI = {
  // সমস্ত অর্ডারের তালিকা
  getAll: async (params = {}) => {
    try {
      if (api && typeof api.get === "function") {
        return await api.get("orders.list", params);
      }
      return [];
    } catch (e) {
      console.error("OrderAPI.getAll failed:", e);
      return [];
    }
  },

  // নির্দিষ্ট অর্ডারের বিস্তারিত
  getById: async (orderId) => {
    try {
      if (api && typeof api.get === "function") {
        return await api.get("orders.get", { orderId });
      }
      return null;
    } catch (e) {
      console.error("OrderAPI.getById failed:", e);
      return null;
    }
  },

  // নতুন অর্ডার তৈরি (১-পেজ চেকআউট থেকে)
  create: async (orderData) => {
    if (api && typeof api.post === "function") {
      return await api.post("orders.create", orderData);
    }
    throw new Error("API Client is not available");
  },

  // অর্ডারের স্ট্যাটাস পরিবর্তন
  updateStatus: async (orderId, status) => {
    if (api && typeof api.post === "function") {
      return await api.post("orders.updateStatus", { orderId, status });
    }
    throw new Error("API Client is not available");
  },

  // 🛡️ কুরিয়ার ফ্রড চেক ইঞ্জিন (কাস্টমারের ফোন নম্বর দিয়ে চেক)
  checkFraud: async (phone, orderId = "") => {
    try {
      if (api && typeof api.post === "function") {
        return await api.post("fraud.check", { phone, orderId });
      }
      return {
        risk_level: "LOW_RISK",
        success_rate: "100%",
        total_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0,
        rto_orders: 0,
        reasons: ["কোনো পূর্ববর্তী ফ্রড রেকর্ড নেই।"]
      };
    } catch (e) {
      console.error("OrderAPI.checkFraud failed:", e);
      return {
        risk_level: "LOW_RISK",
        success_rate: "100%",
        total_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0,
        rto_orders: 0,
        reasons: ["ফ্রড ডাটা ফেচ করা সম্ভব হয়নি।"]
      };
    }
  }
};

// গ্লোবাল উইন্ডোতে বাইন্ড করা
if (typeof window !== "undefined") {
  window.OrderAPI = OrderAPI;
}

// Default export যুক্ত করা হয়েছে
export default OrderAPI;
