/**
 * DREAM CART BD — EXTRAORDINARY NOTIFICATION & TOAST MANAGER (Toast.js)
 * Implements high-impact positive (vibrant emerald green background) and
 * negative (rich crimson red background) notifications with white typography,
 * crisp icons, action buttons, auto-dismiss, and multiple invocation patterns.
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;
    let el = document.getElementById("toast-container");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast-container";
      document.body.appendChild(el);
    }
    this.container = el;
  }

  normalizeOptions(firstArg, secondArg, defaultType = "info") {
    if (typeof firstArg === "string") {
      return {
        type: defaultType,
        message: firstArg,
        title: typeof secondArg === "string" ? secondArg : "",
        duration: typeof secondArg === "number" ? secondArg : 4500
      };
    }
    if (firstArg && typeof firstArg === "object") {
      return {
        type: firstArg.type || defaultType,
        title: firstArg.title || "",
        message: firstArg.message || firstArg.text || "",
        duration: firstArg.duration !== undefined ? firstArg.duration : 4500,
        actionText: firstArg.actionText || null,
        onAction: firstArg.onAction || null
      };
    }
    return {
      type: defaultType,
      title: "",
      message: String(firstArg || ""),
      duration: 4500
    };
  }

  success(msg, title = "সফল হয়েছে") {
    return this.show(this.normalizeOptions(msg, title, "success"));
  }

  error(msg, title = "ত্রুটি / সমস্যা") {
    return this.show(this.normalizeOptions(msg, title, "error"));
  }

  warning(msg, title = "সতর্কতা") {
    return this.show(this.normalizeOptions(msg, title, "warning"));
  }

  info(msg, title = "বিজ্ঞপ্তি") {
    return this.show(this.normalizeOptions(msg, title, "info"));
  }

  show(options) {
    if (typeof document === 'undefined') return;
    this.init();

    const opts = typeof options === "string" ? { message: options, type: "success" } : (options || {});
    const type = opts.type || "success";
    const title = opts.title || "";
    const message = opts.message || "";
    const duration = opts.duration !== undefined ? opts.duration : 4500;
    const actionText = opts.actionText || null;
    const onAction = opts.onAction || null;

    const item = document.createElement("div");
    item.className = `toast-item toast-${type}`;
    item.setAttribute("role", "alert");
    item.setAttribute("aria-live", "assertive");

    // Icon depending on type
    let iconSvg = "";
    if (type === "success") {
      // White checkmark circle
      iconSvg = `
        <div class="toast-icon-wrap toast-icon-success">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      `;
    } else if (type === "error") {
      // White error exclamation / cross circle
      iconSvg = `
        <div class="toast-icon-wrap toast-icon-error">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
      `;
    } else if (type === "warning") {
      // White warning triangle
      iconSvg = `
        <div class="toast-icon-wrap toast-icon-warning">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
      `;
    } else {
      // Info icon
      iconSvg = `
        <div class="toast-icon-wrap toast-icon-info">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      `;
    }

    item.innerHTML = `
      <div class="toast-inner flex items-start gap-3 w-full">
        ${iconSvg}
        <div class="flex-1 min-w-0 pt-0.5">
          ${title ? `<div class="toast-title font-black text-sm text-white tracking-wide leading-tight mb-1">${title}</div>` : ""}
          <div class="toast-message text-xs text-white/95 font-medium leading-relaxed break-words">${message}</div>
          ${actionText ? `<button class="mt-2.5 px-3 py-1 rounded-lg text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition toast-action-btn">${actionText}</button>` : ""}
        </div>
        <button class="toast-close-btn p-1 text-white/70 hover:text-white transition flex-shrink-0 -mr-1 -mt-1 cursor-pointer" title="বন্ধ করুন">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    const closeBtn = item.querySelector(".toast-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.dismiss(item));
    }

    if (actionText && onAction) {
      const actBtn = item.querySelector(".toast-action-btn");
      if (actBtn) {
        actBtn.addEventListener("click", () => {
          onAction();
          this.dismiss(item);
        });
      }
    }

    this.container.appendChild(item);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(item);
      }, duration);
    }

    return item;
  }

  dismiss(item) {
    if (!item) return;
    item.classList.add("toast-hide");
    setTimeout(() => {
      if (item && item.parentNode) {
        item.parentNode.removeChild(item);
      }
    }, 280);
  }
}

export const toast = new ToastManager();

if (typeof window !== "undefined") {
  window.toast = toast;
}
