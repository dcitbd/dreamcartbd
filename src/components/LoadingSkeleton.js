/**
 * DREAM CART BD — BRANDED LOADING SKELETON & LOGO LOADER (LoadingSkeleton.js)
 * Displays the official Dream Cart BD logo in all loading states across the site.
 */

export const SITE_LOGO_URL = "https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg";
export const SITE_LOGO_FALLBACK = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10";

export function renderInlineLogoSpinner(text = "লোড হচ্ছে...") {
  return `
    <span class="inline-flex items-center justify-center gap-2">
      <span class="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-white p-0.5 shadow-sm border border-emerald-400">
        <img src="${SITE_LOGO_URL}" alt="Dream Cart BD" class="w-full h-full object-contain rounded-full animate-pulse" onerror="this.onerror=null; this.src='${SITE_LOGO_FALLBACK}';" />
      </span>
      <span>${text}</span>
    </span>
  `;
}

export function renderLogoLoader(title = "পণ্য লোড হচ্ছে...", subtitle = "Dream Cart BD • লাইভ ক্যাটালগ সিঙ্ক হচ্ছে") {
  return `
    <div class="py-16 sm:py-24 flex flex-col items-center justify-center max-w-7xl mx-auto space-y-6 px-4">
      <!-- Center Logo Loader with Glow, Spin Ring & Pulse -->
      <div class="relative flex items-center justify-center">
        <div class="absolute w-24 h-24 rounded-3xl bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping"></div>
        <div class="absolute w-24 h-24 rounded-3xl border-2 border-emerald-500/40 border-t-emerald-500 animate-spin"></div>
        <div class="relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/60 p-2 shadow-2xl shadow-emerald-500/20 flex items-center justify-center overflow-hidden">
          <img 
            src="${SITE_LOGO_URL}" 
            alt="Dream Cart BD Logo" 
            class="w-full h-full object-contain rounded-xl"
            onerror="this.onerror=null; this.src='${SITE_LOGO_FALLBACK}';"
          />
        </div>
      </div>

      <!-- Animated Progress / Loading Text -->
      <div class="text-center space-y-1.5">
        <div class="text-sm font-extrabold text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>${title}</span>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">${subtitle}</p>
      </div>
    </div>
  `;
}

export function renderLoadingSkeleton(props = {}) {
  const title = props.title || "পণ্য লোড হচ্ছে...";
  const subtitle = props.subtitle || "Dream Cart BD • লাইভ ক্যাটালগ সিঙ্ক হচ্ছে";
  return `
    <div class="py-16 sm:py-24 flex flex-col items-center justify-center max-w-7xl mx-auto space-y-6 px-4">
      <!-- Center Logo Loader with Glow, Spin Ring & Pulse -->
      <div class="relative flex items-center justify-center">
        <div class="absolute w-24 h-24 rounded-3xl bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping"></div>
        <div class="absolute w-24 h-24 rounded-3xl border-2 border-emerald-500/40 border-t-emerald-500 animate-spin"></div>
        <div class="relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/60 p-2 shadow-2xl shadow-emerald-500/20 flex items-center justify-center overflow-hidden">
          <img 
            src="${SITE_LOGO_URL}" 
            alt="Dream Cart BD Logo" 
            class="w-full h-full object-contain rounded-xl"
            onerror="this.onerror=null; this.src='${SITE_LOGO_FALLBACK}';"
          />
        </div>
      </div>

      <!-- Animated Progress / Loading Text -->
      <div class="text-center space-y-1.5">
        <div class="text-sm font-extrabold text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>${title}</span>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">${subtitle}</p>
      </div>

      <!-- Product Grid Skeletons -->
      <div class="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
        <div class="h-64 skeleton rounded-2xl"></div>
        <div class="h-64 skeleton rounded-2xl"></div>
        <div class="h-64 skeleton rounded-2xl hidden sm:block"></div>
        <div class="h-64 skeleton rounded-2xl hidden lg:block"></div>
      </div>
    </div>
  `;
}

export default renderLoadingSkeleton;
