/**
 * DREAM CART BD — BRANDED LOADING SKELETON WITH LOGO (LoadingSkeleton.js)
 */

export function renderLoadingSkeleton(props = {}) {
  return `
    <div class="py-16 sm:py-24 flex flex-col items-center justify-center max-w-7xl mx-auto space-y-6 px-4">
      <!-- Center Logo Loader with Glow & Pulse -->
      <div class="relative flex items-center justify-center">
        <div class="absolute w-24 h-24 rounded-3xl bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping"></div>
        <div class="relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/60 p-2 shadow-2xl shadow-emerald-500/20 flex items-center justify-center overflow-hidden">
          <img 
            src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
            alt="Dream Cart BD Logo" 
            class="w-full h-full object-contain rounded-xl"
            onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
          />
        </div>
      </div>

      <!-- Animated Progress / Loading Text -->
      <div class="text-center space-y-1.5">
        <div class="text-sm font-extrabold text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>পণ্য লোড হচ্ছে...</span>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Dream Cart BD • লাইভ ক্যাটালগ সিঙ্ক হচ্ছে</p>
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
