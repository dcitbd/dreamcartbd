/**
 * ============================================================================
 * DREAM CART BD — APPLICATION BOOTSTRAPPER (main.js)
 * ============================================================================
 */

import "./styles/main.css";
import { store } from "./js/store.js";
import { router } from "./js/router.js";
import { SyncEngine } from "./api/sync.js";

// ==================== PLACEHOLDER VIEWS (NEXT BATCHES WILL POPULATE FULL HTML) ====================
const HomePage = () => `
  <div class="min-h-screen flex flex-col justify-center items-center p-6 text-center">
    <div class="glass-panel p-10 rounded-3xl max-w-xl shadow-glass">
      <div class="w-16 h-16 bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <i data-lucide="shopping-bag" class="w-8 h-8"></i>
      </div>
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Dream Cart BD</h1>
      <p class="text-slate-600 dark:text-slate-400 mb-6">Smart Headless Digital Commerce Platform with Real-Time Google Sheets Database.</p>
      <div class="flex gap-4 justify-center">
        <a href="/admin/products" class="btn-primary">এডমিন প্যানেল</a>
        <button onclick="window.SyncEngine.forceSync()" class="btn-secondary flex items-center gap-2">
          <i data-lucide="refresh-cw" class="w-4 h-4"></i> শীট সিঙ্ক করুন
        </button>
      </div>
    </div>
  </div>
`;

const AdminProductView = () => `
  <div class="min-h-screen p-8 max-w-7xl mx-auto">
    <div class="glass-panel p-6 rounded-2xl mb-8 flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">প্রোডাক্ট ও ইনলাইন ইনভেন্টরি ম্যানেজমেন্ট</h2>
        <p class="text-sm text-slate-500">গুগল শীটের সাথে টু-ওয়ে সিঙ্ক কানেক্টেড</p>
      </div>
      <button onclick="window.SyncEngine.forceSync()" class="btn-primary flex items-center gap-2">
        <i data-lucide="refresh-cw" class="w-4 h-4"></i> রিফ্রেশ ডাটা
      </button>
    </div>
  </div>
`;

// ==================== REGISTER SPA ROUTES ====================
router.addRoute("/", HomePage);
router.addRoute("/admin/products", AdminProductView);

// ==================== GLOBAL APP INITIALIZER ====================
document.addEventListener("DOMContentLoaded", () => {
  // ১. টু-ওয়ে সিঙ্ক পোলিং চালু করা (প্রতি ১০ সেকেন্ড পর পর গুগল শীট চেক করবে)
  SyncEngine.startPolling(10000);
  window.SyncEngine = SyncEngine; // গ্লোবাল এক্সেস

  // ২. গ্লোবাল লিঙ্ক নেভিগেশন ইন্টারসেপ্টর
  document.body.addEventListener("click", (e) => {
    const anchor = e.target.closest("a");
    if (anchor && anchor.getAttribute("href") && anchor.getAttribute("href").startsWith("/")) {
      e.preventDefault();
      router.navigate(anchor.getAttribute("href"));
    }
  });

  // ৩. ইনিশিয়াল পেজ রেন্ডার করা
  router.handleRoute();

  // ৪. গ্লোবাল লোডার সরানো
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.add("opacity-0");
    setTimeout(() => loader.remove(), 300);
  }
});
