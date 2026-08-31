/**
 * ============================================================================
 * DREAM CART BD — REAL-TIME TWO-WAY SYNC ENGINE (sync.js)
 * Monitors Google Sheet timestamps and triggers instant frontend updates
 * ============================================================================
 */

import { api } from "./client.js";
import { store } from "../js/store.js";

class TwoWaySyncEngine {
  constructor() {
    this.lastKnownSheetUpdate = localStorage.getItem("dcbd_last_sheet_sync") || null;
    this.pollInterval = null;
    this.isChecking = false;
  }

  // পোলিং শুরু করা (প্রতি ১০ সেকেন্ডে একবার শীট আপডেট চেক করবে)
  startPolling(intervalMs = 10000) {
    if (this.pollInterval) return;

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
      const status = await api.get("sync.getStatus", {}, false); // ক্যাশ বাইপাস করে সরাসরি চেক
      const latestSheetUpdate = status.lastSheetUpdate;

      if (this.lastKnownSheetUpdate && latestSheetUpdate !== this.lastKnownSheetUpdate) {
        console.log(`[Two-Way Sync] New change detected in Google Sheet at ${latestSheetUpdate}. Refreshing Cache...`);
        api.clearCache();
        this.lastKnownSheetUpdate = latestSheetUpdate;
        localStorage.setItem("dcbd_last_sheet_sync", latestSheetUpdate);

        // গ্লোবাল ইভেন্ট ফায়ার যাতে ওপেন পেজের ডাটা স্বয়ংক্রিয়ভাবে রিফ্রেশ হয়
        store.emit("data_synced", { timestamp: latestSheetUpdate });
      } else if (!this.lastKnownSheetUpdate) {
        this.lastKnownSheetUpdate = latestSheetUpdate;
        localStorage.setItem("dcbd_last_sheet_sync", latestSheetUpdate);
      }
    } catch (err) {
      console.warn("[Sync Checker] Background sync check failed:", err.message);
    } finally {
      this.isChecking = false;
    }
  }

  // ম্যানুয়াল ফোর্স সিঙ্ক
  async forceSync() {
    api.clearCache();
    await this.checkSyncStatus();
    store.showToast("গুগল শীটের সাথে ডাটা সিঙ্ক সম্পন্ন হয়েছে!", "success");
  }
}

export const SyncEngine = new TwoWaySyncEngine();
