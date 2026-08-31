/**
 * ============================================================================
 * DREAM CART BD — REAL-TIME TWO-WAY SYNC ENGINE (sync.js)
 * Monitors Google Sheet timestamps and triggers instant frontend updates
 * ============================================================================
 */

import { api } from "./client.js";
import { store } from "../js/store.js";

// নিরাপদ লোকাল স্টোরেজ হেল্পার
const getStorageItem = (key, fallback = null) => {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
};

const setStorageItem = (key, value) => {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }
};

class TwoWaySyncEngine {
  constructor() {
    this.lastKnownSheetUpdate = getStorageItem("dcbd_last_sheet_sync", null);
    this.pollInterval = null;
    this.isChecking = false;
  }

  // পোলিং শুরু করা (প্রতি ১০ সেকেন্ডে একবার শীট আপডেট চেক করবে)
  startPolling(intervalMs = 10000) {
    if (typeof window === "undefined" || this.pollInterval) return;

    this.checkSyncStatus(); // ইনস্ট্যান্ট প্রথমবার চেক
    this.pollInterval = setInterval(() => {
      this.checkSyncStatus();
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // শীটের সাথে টাইমস্ট্যাম্প চেক করা
  async checkSyncStatus() {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      if (api && typeof api.get === "function") {
        const status = await api.get("sync.getStatus", {}, false); // ক্যাশ বাইপাস করে সরাসরি চেক
        const latestSheetUpdate = status?.lastSheetUpdate;

        if (latestSheetUpdate && this.lastKnownSheetUpdate && latestSheetUpdate !== this.lastKnownSheetUpdate) {
          console.log(`[Two-Way Sync] New change detected in Google Sheet at ${latestSheetUpdate}. Refreshing Cache...`);
          if (typeof api.clearCache === "function") api.clearCache();
          
          this.lastKnownSheetUpdate = latestSheetUpdate;
          setStorageItem("dcbd_last_sheet_sync", latestSheetUpdate);

          // গ্লোবাল ইভেন্ট ফায়ার যাতে ওপেন পেজের ডাটা স্বয়ংক্রিয়ভাবে রিফ্রেশ হয়
          if (store && typeof store.emit === "function") {
            store.emit("data_synced", { timestamp: latestSheetUpdate });
          }
        } else if (latestSheetUpdate && !this.lastKnownSheetUpdate) {
          this.lastKnownSheetUpdate = latestSheetUpdate;
          setStorageItem("dcbd_last_sheet_sync", latestSheetUpdate);
        }
      }
    } catch (err) {
      console.warn("[Sync Checker] Background sync check failed:", err.message);
    } finally {
      this.isChecking = false;
    }
  }

  // ম্যানুয়াল ফোর্স সিঙ্ক
  async forceSync() {
    try {
      if (api && typeof api.clearCache === "function") api.clearCache();
      await this.checkSyncStatus();
      if (store && typeof store.showToast === "function") {
        store.showToast("গুগল শীটের সাথে ডাটা সিঙ্ক সম্পন্ন হয়েছে!", "success");
      }
    } catch (e) {
      if (store && typeof store.showToast === "function") {
        store.showToast("সিঙ্ক সম্পন্ন করা যায়নি!", "danger");
      }
    }
  }
}

export const SyncEngine = new TwoWaySyncEngine();

// গ্লোবাল উইন্ডোতে বাইন্ড করা (ব্রাউজার পরিবেশের জন্য)
if (typeof window !== "undefined") {
  window.SyncEngine = SyncEngine;
}

// Default export যুক্ত করা হয়েছে
export default SyncEngine;
