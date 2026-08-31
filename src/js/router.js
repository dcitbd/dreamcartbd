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

    window.addEventListener("popstate", () => this.handleRoute());
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
    window.history.pushState(null, null, url);
    this.handleRoute();
  }

  async handleRoute() {
    const currentPath = window.location.pathname;
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

    // 🛡️ রোল ও সিকিউরিটি চেক
    if (matchedRoute.requiresAuth && !store.isAuthenticated()) {
      store.showToast("এই পেজটি দেখতে লগইন করুন।", "warning");
      this.navigate("/login");
      return;
    }

    if (matchedRoute.allowedRoles.length > 0 && !store.hasRole(matchedRoute.allowedRoles)) {
      store.showToast("আপনার এই পেজে প্রবেশের অনুমতি নেই।", "danger");
      this.navigate("/");
      return;
    }

    this.currentRoute = matchedRoute;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const appRoot = document.getElementById("app");
    if (!appRoot) return;

    try {
      // ⚡ ডাইনামিক Lazy Load
      const componentRenderer = await matchedRoute.loader();
      appRoot.innerHTML = await componentRenderer(params);

      // Lucide Icons Re-Init
      if (window.lucide) {
        window.lucide.createIcons();
      }
    } catch (err) {
      console.warn(`[Route Loader] Page load failed for ${currentPath}:`, err);
      appRoot.innerHTML = `
        <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center font-bengali">
          <div class="glass-panel p-8 rounded-3xl max-w-md border border-slate-200 dark:border-slate-800 shadow-xl">
            <div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i data-lucide="clock" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">পেজটি প্রস্তুত হচ্ছে</h3>
            <p class="text-xs text-slate-500 mt-2">এই মডিউলটির ফাইল গিটহাবে আপলোড সম্পন্ন হলে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।</p>
            <a href="/" class="btn-primary mt-6 inline-flex text-xs px-5 py-2.5">হোম পেজে ফিরে যান</a>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

export const router = new Router();
