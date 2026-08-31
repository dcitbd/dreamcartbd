/**
 * ============================================================================
 * DREAM CART BD — APPLICATION BOOTSTRAPPER (main.js)
 * ============================================================================
 */

import { store } from "./js/store.js";
import { router } from "./js/router.js";
import { SyncEngine } from "./api/sync.js";

// হোমপেজ মডিউল ইমপোর্ট
import { HomePage } from "./pages/storefront/HomePage.js";

// সেফ র‍্যাপার ফাংশন
const wrap = (fn) => async (params) => {
  if (typeof fn === "function") return await fn(params);
  return `
    <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center font-bengali">
      <div class="glass-panel p-8 rounded-3xl max-w-md border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">পেজটি প্রস্তুত হচ্ছে</h3>
        <p class="text-xs text-slate-500 mt-2">এই মডিউলটির ফাইল গিটহাবে আপলোড সম্পন্ন হলে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।</p>
        <a href="/" class="btn-primary mt-6 inline-flex text-xs px-5 py-2.5">হোম পেজে ফিরে যান</a>
      </div>
    </div>
  `;
};

// ==================== REGISTER ESSENTIAL ROUTES ====================
router.addRoute("/", wrap(HomePage));

// বাকি পেজগুলোর জন্য ডাইনামিক ফলব্যাক রাউট
router.addRoute("/products", wrap(async () => `<div class="p-8 text-center"><h1 class="text-xl font-bold">পণ্য তালিকা পেজটি তৈরি হচ্ছে...</h1><a href="/" class="text-blue-600 underline mt-4 inline-block">হোমে ফিরে যান</a></div>`));
router.addRoute("/track-order", wrap(async () => `<div class="p-8 text-center"><h1 class="text-xl font-bold">অর্ডার ট্র্যাকিং পেজটি তৈরি হচ্ছে...</h1><a href="/" class="text-blue-600 underline mt-4 inline-block">হোমে ফিরে যান</a></div>`));

// ==================== GLOBAL APP INITIALIZER ====================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (typeof SyncEngine !== "undefined" && SyncEngine.startPolling) {
      SyncEngine.startPolling(10000);
    }
    window.SyncEngine = SyncEngine;
    window.store = store;
    window.router = router;

    document.body.addEventListener("click", (e) => {
      const anchor = e.target.closest("a");
      if (anchor && anchor.getAttribute("href") && anchor.getAttribute("href").startsWith("/")) {
        e.preventDefault();
        router.navigate(anchor.getAttribute("href"));
      }
    });

    if (router && typeof router.handleRoute === "function") {
      await router.handleRoute();
    }
  } catch (err) {
    console.error("[App Init Error]:", err);
  } finally {
    const loader = document.getElementById("global-loader");
    if (loader) {
      loader.classList.add("opacity-0");
      setTimeout(() => loader.remove(), 300);
    } else {
      document.querySelectorAll(".global-loading, #loading-screen").forEach(el => el.remove());
    }
  }
});
