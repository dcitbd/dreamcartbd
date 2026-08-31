/**
 * ============================================================================
 * DREAM CART BD — DYNAMIC LAZY-LOADING ROUTER (router.js)
 * ============================================================================
 */

import { store } from "./store.js";

class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;

    // ব্রাউজার পরিবেশে popstate এবং custom pushstate লিসেনার যুক্ত করা
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", () => this.handleRoute());
      
      // ইন্টারনাল নেভিগেশন ইভেন্ট হ্যান্ডেল করার জন্য
      window.addEventListener("pushstate", () => this.handleRoute());
    }
  }

  // ডাইনামিক ইমপোর্ট কম্পোনেন্ট রেজিস্টার
  addRoute(path, loaderFn, options = {}) {
    this.routes.push({
      path,
      loader: loaderFn,
      requiresAuth: options.requiresAuth || false,
      allowedRoles: options.allowedRoles || []
    });
  }

  navigate(url) {
    if (typeof window !== "undefined" && window.history) {
      window.history.pushState(null, null, url);
      this.handleRoute();
    }
  }

  async handleRoute() {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const currentPath = window.location.pathname || "/";
    let matchedRoute = null;
    let params = {};

    for (const route of this.routes) {
      const paramNames = [];
      const regexPath = route.path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
        paramNames.push(key);
        return "([^/]+)";
      });

      const regex = new RegExp(`^${regexPath}$`);
      const match = currentPath.match(regex);

      if (match) {
        matchedRoute = route;
        paramNames.forEach((name, idx) => {
          params[name] = match[idx + 1];
        });
        break;
      }
    }

    if (!matchedRoute) {
      matchedRoute = this.routes.find(r => r.path === "/") || this.routes[0];
    }

    if (!matchedRoute) return;

    // 🛡️ রোল ও সিকিউরিটি চেক
    if (matchedRoute.requiresAuth && store && !store.isAuthenticated()) {
      if (store.showToast) store.showToast("এই পেজটি দেখতে লগইন করুন।", "warning");
      this.navigate("/"); // লগইন পেজ না থাকলে হোমে রিডাইরেক্ট করা নিরাপদ
      return;
    }

    if (matchedRoute.allowedRoles && matchedRoute.allowedRoles.length > 0 && store && !store.hasRole(matchedRoute.allowedRoles)) {
      if (store.showToast) store.showToast("আপনার এই পেজে প্রবেশের অনুমতি নেই।", "danger");
      this.navigate("/");
      return;
    }

    this.currentRoute = matchedRoute;

    if (typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const appRoot = document.getElementById("app");
    if (!appRoot) return;

    try {
      // ⚡ ডাইনামিক Lazy Load (default বা named export উভয়ের জন্য নিরাপদ)
      let module = typeof matchedRoute.loader === "function" ? await matchedRoute.loader() : matchedRoute.loader;
      let renderFn = null;

      if (typeof module === "function") {
        renderFn = module;
      } else if (module && typeof module.default === "function") {
        renderFn = module.default;
      } else if (module && typeof module === "object") {
        const firstKey = Object.keys(module)[0];
        if (firstKey && typeof module[firstKey] === "function") {
          renderFn = module[firstKey];
        }
      }

      if (typeof renderFn === "function") {
        const renderedContent = await renderFn(params);
        appRoot.innerHTML = typeof renderedContent === "string" ? renderedContent : "";
      } else {
        throw new Error("Page render function not found in module");
      }

      // Lucide Icons Re-Init
      if (typeof window !== "undefined" && window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    } catch (err) {
      console.warn(`[Route Loader] Page load failed for ${currentPath}:`, err);
      appRoot.innerHTML = `
        <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center font-bengali">
          <div class="glass-panel p-8 rounded-3xl max-w-md border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
            <div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i data-lucide="clock" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">পেজটি প্রস্তুত হচ্ছে</h3>
            <p class="text-xs text-slate-500 mt-2">এই মডিউলটির ফাইল লোড হতে সমস্যা হয়েছে বা প্রস্তুত হচ্ছে।</p>
            <a href="/" class="btn-primary mt-6 inline-flex text-xs px-5 py-2.5">হোম পেজে ফিরে যান</a>
          </div>
        </div>
      `;
      if (typeof window !== "undefined" && window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    }
  }
}

export const router = new Router();

// ব্রাউজারে window.router সেট করা
if (typeof window !== "undefined") {
  window.router = router;
}

export default router;
