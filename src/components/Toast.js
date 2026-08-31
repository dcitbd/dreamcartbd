/**
 * ============================================================================
 * DREAM CART BD — GLOBAL TOAST NOTIFIER (Toast.js)
 * ============================================================================
 */

export const Toast = {
  show: (message, type = "success", duration = 3500) => {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "fixed bottom-5 right-5 z-50 flex flex-col space-y-3 pointer-events-none font-bengali";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const styles = {
      success: { bg: "bg-emerald-600", text: "text-white", icon: "check-circle-2" },
      danger: { bg: "bg-rose-600", text: "text-white", icon: "alert-circle" },
      warning: { bg: "bg-amber-500", text: "text-slate-950", icon: "alert-triangle" },
      info: { bg: "bg-brand-600", text: "text-white", icon: "info" }
    };

    const conf = styles[type] || styles.info;

    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl font-medium text-sm transition-all duration-300 transform translate-y-3 opacity-0 ${conf.bg} ${conf.text}`;
    toast.innerHTML = `
      <i data-lucide="${conf.icon}" class="w-5 h-5 shrink-0"></i>
      <span class="flex-1">${message}</span>
      <button class="toast-close p-1 hover:opacity-80"><i data-lucide="x" class="w-4 h-4"></i></button>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    // Fade In
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-3", "opacity-0");
    });

    const closeToast = () => {
      toast.classList.add("opacity-0", "translate-y-3");
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector(".toast-close").addEventListener("click", closeToast);
    setTimeout(closeToast, duration);
  }
};
