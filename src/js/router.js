/**
 * ============================================================================
 * DREAM CART BD — CLIENT-SIDE SPA ROUTER (router.js)
 * ============================================================================
 */

import { store } from "./store.js";

class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;

    window.addEventListener("popstate", () => this.handleRoute());
  }

  // রুট রেজিস্টার করা
  addRoute(path, component, options = {}) {
    this.routes.push({
      path,
      component,
      requiresAuth: options.requiresAuth || false,
      allowedRoles: options.allowedRoles || []
    });
  }

  // লিঙ্কে ক্লিক হ্যান্ডলার
  navigate(url) {
    window.history.pushState(null, null, url);
    this.handleRoute();
  }

  // বর্তমান URL ম্যাচ এবং পেজ রেন্ডার করা
  async handleRoute() {
    const currentPath = window.location.pathname;
    let matchedRoute = null;
    let params = {};

    for (const route of this.routes) {
      // ডাইনামিক প্যারামিটার পার্সিং (যেমন: /product/:id)
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

    // কোনো রুট না মিললে হোমপেজে রিডাইরেক্ট
    if (!matchedRoute) {
      matchedRoute = this.routes.find(r => r.path === "/") || this.routes[0];
    }

    // 🛡️ রোল ও সিকিউরিটি গার্ড চেক
    if (matchedRoute.requiresAuth && !store.isAuthenticated()) {
      store.showToast("এই পেজটি দেখতে অনুগ্রহ করে লগইন করুন।", "warning");
      this.navigate("/login");
      return;
    }

    if (matchedRoute.allowedRoles.length > 0 && !store.hasRole(matchedRoute.allowedRoles)) {
      store.showToast("আপনার এই পেজে প্রবেশের অনুমতি নেই।", "danger");
      this.navigate("/");
      return;
    }

    this.currentRoute = matchedRoute;

    // টপ স্ক্রোল
    window.scrollTo({ top: 0, behavior: "smooth" });

    // পেজ মাউন্ট করা
    const appRoot = document.getElementById("app");
    if (appRoot && matchedRoute.component) {
      appRoot.innerHTML = await matchedRoute.component(params);
      
      // Lucide আইকন রি-ইনিশিয়ালাইজেশন
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }
}

export const router = new Router();
