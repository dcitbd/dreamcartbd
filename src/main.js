import { SearchService } from './services/SearchService.js';
/**
 * DREAM CART BD — MASTER FRONTEND BOOTSTRAPPER (main.js)
 * Implements:
 * - HTML5 History API Path Router (ZERO hash '#', domain/products clean URLs)
 * - Highly responsive Live predictive search with interactive preview cards & search buttons
 * - Floating fixed actions dock (Cart with live bounce badge, WhatsApp sub-menu, Call sub-menu, Live Chat)
 * - Product variant selection (Interactive Color & Size selector on Product Details, Cart, Checkout)
 * - Robust Auth form submissions (Customer login/register, Reseller, Wholesale, Admin, Profile edit)
 * - Dark mode toggle & theme persistence
 * - Reactive stores wiring (Cart, Favourites, Auth)
 * - Incomplete order tracking synced to list & Google Sheets
 */

import { renderHeader } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderMobileNav } from './components/MobileNav.js';
import { renderCartDrawer } from './components/CartDrawer.js';
import { renderFraudModal } from './components/FraudModal.js';
import { renderFloatingActions } from './components/FloatingActions.js';
import { toast } from './components/Toast.js';
import { cartStore } from './store/cartStore.js';
import { favouriteStore } from './store/favouriteStore.js';
import { authStore } from './store/authStore.js';
import { router } from './router.js';
import { apiClient } from './api/client.js';
import { formatCurrency } from './utils/format.js';

function injectFloatingActionStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('dcbd-floating-custom-styles')) return;

  const style = document.createElement('style');
  style.id = 'dcbd-floating-custom-styles';
  style.textContent = `
    #wa-sub-menu, #call-sub-menu {
      left: calc(100% + 12px) !important;
      right: auto !important;
    }

    @media (min-width: 640px) {
      #floating-actions-dock {
        left: 1.25rem !important;
        right: auto !important;
        bottom: 1.5rem !important;
      }
    }

    @media (max-width: 639px) {
      #floating-actions-dock {
        left: 1rem !important;
        right: auto !important;
        bottom: 4.75rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function refreshGlobalSiteChrome() {
  const isLanding = typeof window !== 'undefined' && (window.location.pathname.includes('/landing'));
  const headerMount = document.getElementById('header-mount');
  const footerMount = document.getElementById('footer-mount');
  const mobileNavMount = document.getElementById('mobilenav-mount');
  const floatingActionsMount = document.getElementById('floatingactions-mount');
  const appContainer = document.getElementById('app-content');

  if (isLanding) {
    if (headerMount) headerMount.style.display = 'none';
    if (footerMount) footerMount.style.display = 'none';
    if (mobileNavMount) mobileNavMount.style.display = 'none';
    if (floatingActionsMount) floatingActionsMount.style.display = 'none';
    if (appContainer) appContainer.className = 'w-full min-h-screen p-0 m-0';
    return;
  }

  if (headerMount) headerMount.style.display = '';
  if (footerMount) footerMount.style.display = '';
  if (mobileNavMount) mobileNavMount.style.display = '';
  if (floatingActionsMount) floatingActionsMount.style.display = '';
  if (appContainer && appContainer.className.includes('p-0')) {
    appContainer.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20';
  }

  updateHeader();
  if (footerMount) footerMount.innerHTML = renderFooter();
  updateMobileNav();
  updateCartDrawer();
  updateFloatingActions();
}

function initApp() {
  injectFloatingActionStyles();
  try {
    const root = document.getElementById('app-root');
    if (!root) {
      console.error("Could not find #app-root element");
      return;
    }

    window.router = router;
    window.authStore = authStore;
    window.cartStore = cartStore;
    window.apiClient = apiClient;
    window.refreshGlobalSiteChrome = refreshGlobalSiteChrome;

    const savedTheme = localStorage.getItem("dcbd_theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    root.innerHTML = `
      <div id="header-mount"></div>
      <main id="app-content" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20"></main>
      <div id="footer-mount"></div>
      <div id="floatingactions-mount"></div>
      <div id="mobilenav-mount"></div>
      <div id="cartdrawer-mount"></div>
      <div id="fraudmodal-mount"></div>
    `;

    updateHeader();
    const footerMount = document.getElementById('footer-mount');
    if (footerMount) footerMount.innerHTML = renderFooter();
    updateMobileNav();
    updateCartDrawer();
    updateFloatingActions();
    const fraudMount = document.getElementById('fraudmodal-mount');
    if (fraudMount) fraudMount.innerHTML = renderFraudModal();

    cartStore.subscribe(() => {
      updateHeader();
      updateMobileNav();
      updateCartDrawer();
      updateFloatingActions();
      updateCheckoutSummary();
      updateCartPageSummary();
    });

    favouriteStore.subscribe(() => {
      updateHeader();
      updateMobileNav();
    });

    authStore.subscribe(() => {
      updateHeader();
      updateMobileNav();
    });

    attachEventListeners();
    attachLiveSearchHandlers();

    window.addEventListener('popstate', () => router.resolve());

    // Resolve initial URL (uses deduplicated loadProductsFromSheet internally)
    router.resolve();

    // Non-blocking analytics log
    setTimeout(() => {
      apiClient.request("viewers/log", {
        time: new Date().toISOString(),
        device: window.innerWidth < 768 ? "Mobile" : "Desktop/Laptop",
        activity: "Site Visit"
      }).catch(() => {});
    }, 800);

  } catch (err) {
    console.error("Application initialization error:", err);
  }
}

function updateHeader() {
  const mount = document.getElementById('header-mount');
  if (mount) mount.innerHTML = renderHeader();
}

function updateMobileNav() {
  const mount = document.getElementById('mobilenav-mount');
  if (mount) mount.innerHTML = renderMobileNav();
}

function updateCartDrawer() {
  const mount = document.getElementById('cartdrawer-mount');
  if (mount) mount.innerHTML = renderCartDrawer();
}

function updateFloatingActions() {
  const mount = document.getElementById('floatingactions-mount');
  if (mount) mount.innerHTML = renderFloatingActions();
}

function openCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const panel = document.getElementById('cart-drawer-panel');
  if (overlay) overlay.classList.remove('hidden');
  if (panel) panel.classList.remove('translate-x-full');
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const panel = document.getElementById('cart-drawer-panel');
  if (overlay) overlay.classList.add('hidden');
  if (panel) panel.classList.add('translate-x-full');
}

function updateCheckoutSummary() {
  const subtotalEl = document.getElementById('summary-subtotal');
  const chargeEl = document.getElementById('summary-delivery-charge');
  const grandTotalEl = document.getElementById('summary-grand-total');
  const onlineRowEl = document.getElementById('summary-online-discount-row');
  const onlineAmtEl = document.getElementById('summary-online-discount-amount');
  const couponRowEl = document.getElementById('summary-coupon-discount-row');
  const couponAmtEl = document.getElementById('summary-coupon-discount-amount');
  const btnTextEl = document.getElementById('btn-confirm-order-text');
  const btnEl = document.getElementById('btn-confirm-order');

  const subtotal = cartStore.getSubtotal();
  const fee = cartStore.getDeliveryCharge();
  const isFree = cartStore.isFreeDelivery();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const couponDiscount = cartStore.getCouponDiscount();
  const grandTotal = cartStore.getGrandTotal();

  if (subtotalEl) {
    subtotalEl.textContent = formatCurrency(subtotal);
  }

  if (chargeEl) {
    if (isFree) {
      chargeEl.innerHTML = '<span class="text-emerald-600 dark:text-emerald-400 font-bold">ফ্রি (৳০)</span>';
    } else {
      chargeEl.textContent = formatCurrency(fee);
    }
  }

  if (onlineRowEl) {
    if (onlineDiscount > 0) {
      onlineRowEl.classList.remove('hidden');
      if (onlineAmtEl) onlineAmtEl.textContent = `-${formatCurrency(onlineDiscount)}`;
    } else {
      onlineRowEl.classList.add('hidden');
    }
  }

  if (couponRowEl) {
    if (couponDiscount > 0) {
      couponRowEl.classList.remove('hidden');
      if (couponAmtEl) couponAmtEl.textContent = `-${formatCurrency(couponDiscount)}`;
    } else {
      couponRowEl.classList.add('hidden');
    }
  }

  if (grandTotalEl) {
    grandTotalEl.textContent = formatCurrency(grandTotal);
  }

  if (btnTextEl) {
    btnTextEl.textContent = `অর্ডার নিশ্চিত করুন (${formatCurrency(grandTotal)})`;
  } else if (btnEl && !btnEl.disabled) {
    btnEl.innerHTML = `<span>✓</span> <span id="btn-confirm-order-text">অর্ডার নিশ্চিত করুন (${formatCurrency(grandTotal)})</span>`;
  }
}

function updateCartPageSummary() {
  const subtotalEl = document.getElementById('cart-subtotal');
  const feeEl = document.getElementById('cart-delivery-charge');
  const onlineRowEl = document.getElementById('cart-online-discount-row');
  const onlineAmtEl = document.getElementById('cart-online-discount-amount');
  const grandTotalEl = document.getElementById('cart-grand-total');
  const freeNoticeEl = document.getElementById('cart-free-shipping-notice');
  const progressBarEl = document.getElementById('cart-progress-bar');

  const subtotal = cartStore.getSubtotal();
  const fee = cartStore.getDeliveryCharge();
  const isFree = cartStore.isFreeDelivery();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  const grandTotal = cartStore.getGrandTotal();
  const freeThreshold = Number(window.__dcbdGetSiteSettings ? window.__dcbdGetSiteSettings().freeDeliveryThreshold : 2000) || 2000;

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (feeEl) {
    feeEl.innerHTML = isFree ? '<span class="text-emerald-600 font-bold">ফ্রি (৳০)</span>' : formatCurrency(fee);
  }
  if (onlineRowEl) {
    if (onlineDiscount > 0) {
      onlineRowEl.classList.remove('hidden');
      if (onlineAmtEl) onlineAmtEl.textContent = `-${formatCurrency(onlineDiscount)}`;
    } else {
      onlineRowEl.classList.add('hidden');
    }
  }
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);
  if (freeNoticeEl) {
    freeNoticeEl.textContent = subtotal >= freeThreshold ? '✓ অর্জিত!' : `আরও ৳${freeThreshold - subtotal}`;
  }
  if (progressBarEl) {
    progressBarEl.style.width = `${Math.min(100, (subtotal / freeThreshold) * 100)}%`;
  }
}

function attachEventListeners() {
  // 1. Intercept internal anchor clicks for SPA Clean Path Routing (Zero '#' in URLs)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('tel:') ||
      href.startsWith('mailto:') ||
      href.startsWith('javascript:') ||
      link.target === '_blank' ||
      link.hasAttribute('download')
    ) {
      return;
    }

    if (href.startsWith('#') && !href.startsWith('#/')) {
      return;
    }

    e.preventDefault();
    router.navigate(href);
  });

  // 2. Global delegate for interactive triggers (clicks)
  document.addEventListener('click', async (e) => {
    if (e.target.closest('#btn-toggle-darkmode')) {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('dcbd_theme', isDark ? 'dark' : 'light');
      updateHeader();
      return;
    }

    if (e.target.closest('#btn-bottom-menu-toggle') || e.target.closest('#btn-mobile-menu-toggle')) {
      const overlay = document.getElementById('bottom-menu-overlay');
      const panel = document.getElementById('bottom-menu-panel');
      if (overlay && panel) {
        overlay.classList.toggle('hidden');
        panel.classList.toggle('hidden');
      }
      return;
    }

    if (e.target.closest('#btn-bottom-menu-close') || e.target.id === 'bottom-menu-overlay') {
      const overlay = document.getElementById('bottom-menu-overlay');
      const panel = document.getElementById('bottom-menu-panel');
      if (overlay) overlay.classList.add('hidden');
      if (panel) panel.classList.add('hidden');
      return;
    }

    if (e.target.closest('.bottom-menu-link') || e.target.closest('.mobile-menu-link')) {
      const overlay = document.getElementById('bottom-menu-overlay');
      const panel = document.getElementById('bottom-menu-panel');
      if (overlay) overlay.classList.add('hidden');
      if (panel) panel.classList.add('hidden');
    }

    if (!e.target.closest('#bottom-menu-panel') && !e.target.closest('#btn-bottom-menu-toggle') && !e.target.closest('#btn-mobile-menu-toggle')) {
      const overlay = document.getElementById('bottom-menu-overlay');
      const panel = document.getElementById('bottom-menu-panel');
      if (overlay) overlay.classList.add('hidden');
      if (panel) panel.classList.add('hidden');
    }

    if (e.target.closest('#btn-floating-launcher')) {
      const items = document.getElementById('floating-actions-items');
      const icon = document.getElementById('floating-launcher-icon');
      if (items) {
        const isOpen = items.classList.contains('active');
        if (isOpen) {
          items.classList.remove('active');
          items.classList.add('hidden');
          if (icon) icon.textContent = '💬';
        } else {
          items.classList.add('active');
          items.classList.remove('hidden');
          if (icon) icon.textContent = '✕';
        }
      }
      return;
    }

    if (e.target.closest('#btn-user-menu')) {
      const panel = document.getElementById('auth-dropdown-panel');
      if (panel) panel.classList.toggle('hidden');
      return;
    }

    if (e.target.closest('#btn-logout') || e.target.closest('.btn-logout') || e.target.closest('#btn-customer-logout')) {
      authStore.logout();
      toast.show({ type: "info", title: "লগআউট সম্পন্ন", message: "আপনি আপনার অ্যাকাউন্ট থেকে সফলভাবে লগআউট হয়েছেন।" });
      router.navigate('/');
      return;
    }

    if (e.target.closest('#btn-open-cart') || e.target.closest('#mobile-cart-btn') || e.target.closest('#btn-floating-cart')) {
      openCartDrawer();
      return;
    }
    if (e.target.closest('#btn-close-cart') || e.target.id === 'cart-drawer-overlay') {
      closeCartDrawer();
      return;
    }

    if (e.target.closest('#btn-floating-call')) {
      const menu = document.getElementById('call-sub-menu');
      const waMenu = document.getElementById('wa-sub-menu');
      if (waMenu) waMenu.classList.add('hidden');
      if (menu) menu.classList.toggle('hidden');
      return;
    }

    if (e.target.closest('#btn-floating-wa')) {
      const menu = document.getElementById('wa-sub-menu');
      const callMenu = document.getElementById('call-sub-menu');
      if (callMenu) callMenu.classList.add('hidden');
      if (menu) menu.classList.toggle('hidden');
      return;
    }

    if (!e.target.closest('#call-menu-group') && !e.target.closest('#wa-menu-group')) {
      const callMenu = document.getElementById('call-sub-menu');
      const waMenu = document.getElementById('wa-sub-menu');
      if (callMenu) callMenu.classList.add('hidden');
      if (waMenu) waMenu.classList.add('hidden');
    }
    if (!e.target.closest('#floating-actions-dock')) {
      const items = document.getElementById('floating-actions-items');
      const icon = document.getElementById('floating-launcher-icon');
      if (items && window.innerWidth < 640) {
        items.classList.remove('active');
        items.classList.add('hidden');
        if (icon) icon.textContent = '💬';
      }
    }
    if (!e.target.closest('.auth-dropdown-container')) {
      const authPanel = document.getElementById('auth-dropdown-panel');
      if (authPanel) authPanel.classList.add('hidden');
    }

    const cardClick = e.target.closest('.card-img-click');
    if (cardClick && !e.target.closest('.btn-toggle-favourite') && !e.target.closest('.btn-quick-add') && !e.target.closest('a')) {
      const slug = cardClick.getAttribute('data-slug') || cardClick.getAttribute('data-product-id');
      if (slug) {
        router.navigate('/product/' + encodeURIComponent(slug));
        return;
      }
    }

    const favBtn = e.target.closest('.btn-toggle-favourite');
    if (favBtn) {
      e.preventDefault();
      e.stopPropagation();
      const pId = favBtn.getAttribute('data-product-id');
      const res = await apiClient.request("products/details", { id: pId });
      if (res.data) {
        const added = favouriteStore.toggle(res.data);
        toast.show({
          type: added ? "success" : "info",
          title: added ? "পছন্দের তালিকায় যুক্ত হয়েছে" : "পছন্দের তালিকা থেকে সরানো হয়েছে",
          message: res.data.name,
          duration: 3000
        });
      }
      return;
    }

    if (e.target.closest('#btn-clear-wishlist') || e.target.closest('#btn-clear-wishlist-action')) {
      favouriteStore.clear();
      toast.show({
        type: 'info',
        title: 'পছন্দের তালিকা খালি করা হয়েছে',
        message: 'সব পণ্য তালিকা থেকে মুছে ফেলা হয়েছে।'
      });
      router.resolve();
      return;
    }

    const colorBtn = e.target.closest('.color-select-btn');
    if (colorBtn) {
      const selectedColor = colorBtn.getAttribute('data-color');
      document.querySelectorAll('.color-select-btn').forEach(b => {
        b.classList.remove('active');
        b.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      colorBtn.classList.add('active');
      colorBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');

      const hiddenInput = document.getElementById('selected-color');
      if (hiddenInput) hiddenInput.value = selectedColor;
      const label = document.getElementById('selected-color-label');
      if (label) label.textContent = selectedColor;
      return;
    }

    const sizeBtn = e.target.closest('.size-select-btn');
    if (sizeBtn) {
      const selectedSize = sizeBtn.getAttribute('data-size');
      document.querySelectorAll('.size-select-btn').forEach(b => {
        b.classList.remove('active');
        b.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      sizeBtn.classList.add('active');
      sizeBtn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');

      const hiddenInput = document.getElementById('selected-size');
      if (hiddenInput) hiddenInput.value = selectedSize;
      const label = document.getElementById('selected-size-label');
      if (label) label.textContent = selectedSize;
      return;
    }

    const quickAddBtn = e.target.closest('.btn-quick-add');
    if (quickAddBtn) {
      e.preventDefault();
      e.stopPropagation();
      const pId = quickAddBtn.getAttribute('data-product-id');
      const res = await apiClient.request("products/details", { id: pId });
      if (res.data) {
        cartStore.addItem(res.data, 1);
        toast.show({
          type: "success",
          title: "কার্টে যুক্ত হয়েছে",
          message: `${res.data.name} কার্টে যোগ করা হয়েছে।`,
          duration: 3500
        });
        openCartDrawer();
      }
      return;
    }

    if (e.target.closest('#btn-detail-add-cart')) {
      const btn = e.target.closest('#btn-detail-add-cart');
      const pId = btn.getAttribute('data-product-id');
      const qtyInp = document.getElementById('product-qty-input');
      const qty = parseInt(qtyInp ? qtyInp.value : '1', 10);
      const color = document.getElementById('selected-color')?.value || '';
      const size = document.getElementById('selected-size')?.value || '';

      const res = await apiClient.request("products/details", { id: pId });
      if (res.data) {
        cartStore.addItem(res.data, qty, { color, size });
        const variantDesc = [color ? `কালার: ${color}` : '', size ? `সাইজ: ${size}` : ''].filter(Boolean).join(', ');
        toast.show({
          type: "success",
          title: "কার্টে যুক্ত হয়েছে",
          message: `${res.data.name} (${qty} টি)${variantDesc ? ` [${variantDesc}]` : ''} কার্টে যোগ করা হয়েছে।`,
          duration: 3500
        });
        openCartDrawer();
      }
      return;
    }

    const orderNowBtn = e.target.closest('.btn-order-now') || e.target.closest('#btn-detail-order-now');
    if (orderNowBtn) {
      e.preventDefault();
      e.stopPropagation();
      const pId = orderNowBtn.getAttribute('data-product-id');
      const qtyInp = document.getElementById('product-qty-input');
      const qty = parseInt(qtyInp ? qtyInp.value : '1', 10);
      const color = document.getElementById('selected-color')?.value || '';
      const size = document.getElementById('selected-size')?.value || '';

      const res = await apiClient.request("products/details", { id: pId });
      if (res.data) {
        cartStore.addItem(res.data, qty, { color, size });
        router.navigate('/checkout');
      }
      return;
    }

    const preOrderBtn = e.target.closest('.btn-pre-order') || e.target.closest('#btn-detail-preorder');
    if (preOrderBtn) {
      e.preventDefault();
      e.stopPropagation();
      const pId = preOrderBtn.getAttribute('data-product-id');
      const color = document.getElementById('selected-color')?.value || '';
      const size = document.getElementById('selected-size')?.value || '';

      const res = await apiClient.request("products/details", { id: pId });
      if (res.data) {
        cartStore.addItem(res.data, 1, { color, size });
        toast.show({
          type: "info",
          title: "প্রি-অর্ডার বুকিং",
          message: `${res.data.name} প্রি-অর্ডার কার্টে যুক্ত হয়েছে। চেকআউটে কনফার্ম করুন।`,
          duration: 4000
        });
        router.navigate('/checkout');
      }
      return;
    }

    const plusBtn = e.target.closest('.btn-cart-plus');
    if (plusBtn) {
      const pId = plusBtn.getAttribute('data-product-id');
      const color = plusBtn.getAttribute('data-color') || '';
      const size = plusBtn.getAttribute('data-size') || '';
      const item = cartStore.items.find(i => i.product_id === pId && (i.color || '') === color && (i.size || '') === size);
      if (item) {
        cartStore.updateQuantity(pId, item.quantity + 1, { color, size });
        if (window.location.pathname.includes('/cart')) router.resolve();
      }
      return;
    }

    const minusBtn = e.target.closest('.btn-cart-minus');
    if (minusBtn) {
      const pId = minusBtn.getAttribute('data-product-id');
      const color = minusBtn.getAttribute('data-color') || '';
      const size = minusBtn.getAttribute('data-size') || '';
      const item = cartStore.items.find(i => i.product_id === pId && (i.color || '') === color && (i.size || '') === size);
      if (item) {
        cartStore.updateQuantity(pId, item.quantity - 1, { color, size });
        if (window.location.pathname.includes('/cart')) router.resolve();
      }
      return;
    }

    const removeBtn = e.target.closest('.btn-cart-remove');
    if (removeBtn) {
      const pId = removeBtn.getAttribute('data-product-id');
      const color = removeBtn.getAttribute('data-color') || '';
      const size = removeBtn.getAttribute('data-size') || '';
      cartStore.removeItem(pId, { color, size });
      if (window.location.pathname.includes('/cart') || window.location.pathname.includes('/checkout')) router.resolve();
      return;
    }

    const togglePassBtn = e.target.closest('.btn-toggle-auth-pass') || e.target.closest('#btn-toggle-auth-pass');
    if (togglePassBtn) {
      const targetId = togglePassBtn.getAttribute('data-target') || 'auth-pass';
      const passInp = document.getElementById(targetId);
      if (passInp) {
        if (passInp.type === 'password') {
          passInp.type = 'text';
          togglePassBtn.innerHTML = '🙈';
          togglePassBtn.title = 'পাসওয়ার্ড লুকান';
        } else {
          passInp.type = 'password';
          togglePassBtn.innerHTML = '👁️';
          togglePassBtn.title = 'পাসওয়ার্ড দেখুন';
        }
      }
      return;
    }

    const avatarBtn = e.target.closest('.avatar-preset-btn');
    if (avatarBtn) {
      const photoUrl = avatarBtn.getAttribute('data-avatar-url') || '';
      const photoInp = document.getElementById('auth-photo');
      if (photoInp) photoInp.value = photoUrl;
      document.querySelectorAll('.avatar-preset-btn').forEach(b => {
        b.classList.remove('active', 'border-emerald-600', 'bg-emerald-50', 'ring-2', 'ring-emerald-500');
      });
      avatarBtn.classList.add('active', 'border-emerald-600', 'bg-emerald-50', 'ring-2', 'ring-emerald-500');
      const previewImg = document.getElementById('avatar-preview-display');
      if (previewImg && photoUrl) previewImg.src = photoUrl;
      return;
    }

    if (e.target.closest('#btn-clear-cart')) {
      cartStore.clear();
      router.resolve();
      return;
    }

    const zoneRadio = e.target.closest('input[name="delivery_zone"]');
    if (zoneRadio) {
      cartStore.setDeliveryZone(zoneRadio.value);
      updateCheckoutSummary();
    }

    const paymentRadio = e.target.closest('input[name="payment_method"]');
    if (paymentRadio) {
      cartStore.setPaymentMethod(paymentRadio.value);
      const onlineBox = document.getElementById('online-payment-details');
      if (onlineBox) {
        if (cartStore.isOnlinePayment()) onlineBox.classList.remove('hidden');
        else onlineBox.classList.add('hidden');
      }
      updateCheckoutSummary();
    }
  });

  // 3. Form Change & Input handlers (Delivery zones on Cart page)
  document.addEventListener('change', (e) => {
    if (e.target.id === 'cart-zone-select') {
      cartStore.setDeliveryZone(e.target.value);
      updateCartPageSummary();
    }
  });

  // 4. Incomplete Order Real-time Tracker (Checkout & Landing Page)
  let incTimeout = null;
  document.addEventListener('input', (e) => {
    const id = e.target.id || '';
    if (
      id === 'checkout-phone' || id === 'checkout-name' || id === 'checkout-address' ||
      id === 'landing-phone' || id === 'landing-name' || id === 'landing-address'
    ) {
      clearTimeout(incTimeout);
      incTimeout = setTimeout(() => {
        const isLanding = id.startsWith('landing-');
        const phone = document.getElementById(isLanding ? 'landing-phone' : 'checkout-phone')?.value?.trim();
        const name = document.getElementById(isLanding ? 'landing-name' : 'checkout-name')?.value?.trim();
        const addr = document.getElementById(isLanding ? 'landing-address' : 'checkout-address')?.value?.trim();
        if (phone && phone.length >= 7) {
          const prods = isLanding
            ? (document.getElementById('landing-product-name')?.value || 'ল্যান্ডিং পেজ অর্ডার')
            : cartStore.items.map(i => `${i.name} [${i.color || ''} ${i.size || ''}] (${i.quantity})`).join(", ");
          const amt = isLanding
            ? Number(document.getElementById('landing-total-amount-val')?.value || document.getElementById('landing-price')?.value || 0)
            : cartStore.getGrandTotal();

          apiClient.request("incomplete_orders/create", {
            phone,
            customer_name: name || 'সম্ভাব্য গ্রাহক',
            address: addr || '',
            account_type: authStore.getAccountType(),
            total_amount: amt,
            products: prods || 'চেকআউট ফর্ম পূরণরত'
          });
        }
      }, 1200);
    }
  });

  // 5. Global Delegated Form Submissions
  document.addEventListener('submit', async (e) => {
    if (e.target.id === 'tracking-search-form') {
      e.preventDefault();
      const val = document.getElementById('track-input')?.value.trim();
      if (val) router.navigate('/track?orderId=' + encodeURIComponent(val));
      return;
    }

    // A. Checkout Form Submission
    if (e.target.id === 'checkout-form') {
      e.preventDefault();
      const name = document.getElementById('checkout-name')?.value.trim();
      const phone = document.getElementById('checkout-phone')?.value.trim();
      const address = document.getElementById('checkout-address')?.value.trim();
      const trxId = document.getElementById('checkout-trxid')?.value.trim() || 'N/A';
      const note = document.getElementById('checkout-note')?.value.trim() || '';

      if (!name || !phone || !address) {
        alert('অনুগ্রহ করে নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা সঠিকভাবে লিখুন।');
        return;
      }

      if (cartStore.isOnlinePayment() && trxId === 'N/A') {
        alert('অনলাইন পেমেন্ট নির্বাচিত হয়েছে। অনুগ্রহ করে পেমেন্ট ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
        return;
      }

      const itemsSummary = cartStore.items.map(i => {
        const v = [i.size ? `Size: ${i.size}` : '', i.color ? `Color: ${i.color}` : ''].filter(Boolean).join(', ');
        return `${i.name}${v ? ` (${v})` : ''} x${i.quantity}`;
      }).join(' | ');
      const colorsSummary = cartStore.items.map(i => i.color || 'Standard').join(', ');
      const sizesSummary = cartStore.items.map(i => i.size || 'Free Size').join(', ');
      const totalQty = cartStore.items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);

      const orderPayload = {
        customer_name: name,
        phone: phone,
        address: address,
        customer_note: note,
        account_type: authStore.getAccountType(),
        products: itemsSummary,
        product_name: itemsSummary,
        color: colorsSummary,
        size: sizesSummary,
        quantity: totalQty,
        items: cartStore.items,
        total_amount: cartStore.getGrandTotal(),
        payment_method: cartStore.paymentMethod,
        transaction_id: trxId,
        payment_status: cartStore.paymentMethod === 'COD' ? 'Pending' : 'Paid',
        order_status: 'Order Placed',
        reseller_commission: authStore.isReseller() ? Math.round(cartStore.getSubtotal() * 0.1) : 0
      };

      const btn = document.getElementById('btn-confirm-order');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "অর্ডার প্রসেস হচ্ছে...";
      }

      const res = await apiClient.request("orders/create", orderPayload);
      if (res && res.data) {
        const orderId = res.data.order_id || res.data.orderId;
        cartStore.clear();
        toast.show({
          type: "success",
          title: "অর্ডার কনফার্মড!",
          message: `আপনার অর্ডার #${orderId} সফলভাবে গৃহীত ও শিটে সংরক্ষিত হয়েছে।`,
          duration: 5000
        });
        router.navigate('/order-success?orderId=' + orderId);
      } else {
        alert('অর্ডার সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
        if (btn) {
          btn.disabled = false;
          btn.textContent = "অর্ডার নিশ্চিত করুন";
        }
      }
      return;
    }

    // B. Customer Login & Registration Form Submission
    if (e.target.id === 'customer-auth-form') {
      e.preventDefault();
      const form = e.target;
      const isRegister = form.getAttribute('data-auth-mode') === 'register' || !!document.getElementById('auth-name');
      const phoneInput = document.getElementById('auth-phone');
      const passInput = document.getElementById('auth-pass');
      const phone = phoneInput?.value.trim() || '';
      const pass = passInput?.value.trim() || '';

      const errAlert = document.getElementById('auth-error-alert');
      const errMsg = document.getElementById('auth-error-msg');
      const displayError = (msg) => {
        if (errAlert && errMsg) {
          errMsg.textContent = msg;
          errAlert.classList.remove('hidden');
        }
        toast.show({ type: 'error', title: isRegister ? 'নিবন্ধন ত্রুটি' : 'লগইন ব্যর্থ', message: msg, duration: 5000 });
      };

      if (errAlert) errAlert.classList.add('hidden');

      if (!phone) {
        displayError('অনুগ্রহ করে মোবাইল নম্বর বা ইমেইল প্রদান করুন।');
        phoneInput?.focus();
        return;
      }
      if (!pass || pass.length < 4) {
        displayError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
        passInput?.focus();
        return;
      }

      let name = '';
      let mail = '';
      let addr = '';
      let photo = '';

      if (isRegister) {
        name = document.getElementById('auth-name')?.value.trim() || '';
        mail = document.getElementById('auth-mail')?.value.trim() || '';
        addr = document.getElementById('auth-addr')?.value.trim() || '';
        photo = document.getElementById('auth-photo')?.value.trim() || '';
        const confirmPass = document.getElementById('auth-confirm-pass')?.value.trim() || '';

        if (!name) {
          displayError('অনুগ্রহ করে আপনার পূর্ণ নাম প্রদান করুন।');
          document.getElementById('auth-name')?.focus();
          return;
        }
        if (phone.length < 11) {
          displayError('সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)।');
          phoneInput?.focus();
          return;
        }
        if (!addr) {
          displayError('অনুগ্রহ করে ডেলিভারি ও যোগাযোগের সম্পূর্ণ ঠিকানা প্রদান করুন।');
          document.getElementById('auth-addr')?.focus();
          return;
        }
        if (confirmPass && confirmPass !== pass) {
          displayError('পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড একই নয়। দয়া করে মিলিয়ে নিন।');
          document.getElementById('auth-confirm-pass')?.focus();
          return;
        }
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳</span> <span>${isRegister ? 'গুগল শিটে সেভ হচ্ছে...' : 'Customers তালিকায় যাচাই হচ্ছে...'}</span>`;
      }

      try {
        const payload = isRegister ? {
          name: name,
          mobile: phone,
          phone: phone,
          mail: mail,
          email: mail,
          address: addr,
          profile_photo: photo,
          password: pass,
          account_type: 'CUSTOMER'
        } : {
          identifier: phone,
          mobile: phone,
          phone: phone,
          mail: phone.includes('@') ? phone : '',
          email: phone.includes('@') ? phone : '',
          password: pass,
          account_type: 'CUSTOMER'
        };

        const res = await apiClient.request(isRegister ? 'customers/register' : 'customers/login', payload);

        if (!res || !res.success) {
          displayError(res?.message || (isRegister ? 'নিবন্ধন সম্পন্ন করা যায়নি।' : 'মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। Customers তালিকায় আপনার তথ্য পাওয়া যায়নি।'));
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnHtml;
          }
          return;
        }

        const userData = res.data || payload;
        authStore.setUser(userData, 'TOKEN-CUST-' + Date.now(), 'CUSTOMER');

        toast.show({
          type: 'success',
          title: isRegister ? 'নিবন্ধন সম্পন্ন!' : 'লগইন সফল!',
          message: `স্বাগতম, ${userData.name || name || 'সম্মানিত গ্রাহক'}! আপনার ড্যাশবোর্ডে প্রবেশ করা হয়েছে।`,
          duration: 4000
        });

        router.navigate('/customer/dashboard');

      } catch (err) {
        console.error('Auth error:', err);
        displayError(err.message || 'সার্ভার বা শিটের সাথে সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।');
      } finally {
        if (submitBtn && submitBtn.disabled) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
      }
      return;
    }

    // C. Reseller Auth Form Submission
    if (e.target.id === 'reseller-auth-form') {
      e.preventDefault();
      const form = e.target;
      const isRegister = form.getAttribute('data-auth-mode') === 'register' || !!document.getElementById('r-shop');
      const phone = document.getElementById('r-phone')?.value.trim();
      const name = document.getElementById('r-name')?.value.trim() || 'রিসেলার পার্টনার';
      const shop = document.getElementById('r-shop')?.value.trim() || 'রিসেলার শপ';

      if (!phone) {
        toast.show({ type: "error", title: "সতর্কতা", message: "মোবাইল নম্বর প্রদান করুন।" });
        return;
      }

      const payload = { name, shop_name: shop, mobile: phone, phone, account_type: 'RESELLER' };
      await apiClient.request(isRegister ? "resellers/register" : "resellers/login", payload);
      authStore.setUser(payload, 'TOKEN-RES-' + Date.now(), 'RESELLER');

      toast.show({
        type: "success",
        title: isRegister ? "রিসেলার নিবন্ধন সফল!" : "রিসেলার পোর্টালে স্বাগতম!",
        message: `স্বাগতম, ${name}! আপনার রিসেলার রেট এখন কার্যকর।`,
        duration: 4000
      });

      router.navigate('/reseller/dashboard');
      return;
    }

    // D. Wholesale Auth Form Submission
    if (e.target.id === 'wholesale-auth-form') {
      e.preventDefault();
      const form = e.target;
      const isRegister = form.getAttribute('data-auth-mode') === 'register' || !!document.getElementById('w-shop');
      const phone = document.getElementById('w-phone')?.value.trim();
      const name = document.getElementById('w-name')?.value.trim() || 'পাইকারি ক্রেতা';
      const shop = document.getElementById('w-shop')?.value.trim() || 'পাইকারি প্রতিষ্ঠান';

      if (!phone) {
        toast.show({ type: "error", title: "সতর্কতা", message: "মোবাইল নম্বর প্রদান করুন।" });
        return;
      }

      const payload = { name, shop_name: shop, mobile: phone, phone, account_type: 'WHOLESALER' };
      await apiClient.request(isRegister ? "wholesalers/register" : "wholesalers/login", payload);
      authStore.setUser(payload, 'TOKEN-WHOLE-' + Date.now(), 'WHOLESALER');

      toast.show({
        type: "success",
        title: isRegister ? "হোলসেলার নিবন্ধন সফল!" : "হোলসেলার পোর্টালে স্বাগতম!",
        message: `স্বাগতম, ${name}! পাইকারি রেট সক্রিয় হয়েছে।`,
        duration: 4000
      });

      router.navigate('/wholesaler/dashboard');
      return;
    }

    // E. Admin / Worker Login Form Submission
    if (e.target.id === 'admin-login-form' || e.target.id === 'admin-auth-form') {
      e.preventDefault();
      const captchaInp = document.getElementById('adm-captcha-input');
      const captchaExp = document.getElementById('adm-captcha-expected');
      if (captchaInp && captchaExp) {
        const inpVal = parseInt(captchaInp.value, 10);
        const expVal = parseInt(captchaExp.value, 10);
        if (inpVal !== expVal) {
          toast.show({ type: "error", title: "ভুল ক্যাপচা উত্তর", message: "ক্যাপচা সমাধান সঠিকভাবে করুন।" });
          return;
        }
      }

      const workerType = document.getElementById('adm-worker-type')?.value || 'Admin';
      const userName = document.getElementById('adm-username')?.value || 'Administrator';

      const payload = {
        name: userName,
        user_name: userName,
        worker_type: workerType,
        role: 'Full Access',
        account_type: 'ADMIN'
      };

      authStore.setUser(payload, 'TOKEN-ADMIN-MASTER', 'ADMIN');
      toast.show({
        type: "success",
        title: "অ্যাডমিন প্যানেলে স্বাগতম!",
        message: `${userName} (${workerType}) হিসেবে লগইন হয়েছে।`,
        duration: 4000
      });

      router.navigate('/admin/dashboard');
      return;
    }

    // F. Customer Profile Edit Form Submission
    if (e.target.id === 'customer-profile-edit-form') {
      e.preventDefault();
      const name = document.getElementById('edit-c-name')?.value.trim();
      const mail = document.getElementById('edit-c-mail')?.value.trim();
      const addr = document.getElementById('edit-c-addr')?.value.trim();

      const updated = {
        ...authStore.user,
        name: name || authStore.user?.name,
        mail: mail,
        email: mail,
        address: addr
      };

      authStore.setUser(updated, authStore.token, 'CUSTOMER');
      const modal = document.getElementById('customer-profile-edit-modal');
      if (modal) modal.classList.remove('active');

      toast.show({
        type: 'success',
        title: 'প্রোফাইল আপডেট হয়েছে!',
        message: 'আপনার তথ্য সফলভাবে সংরক্ষিত হয়েছে।'
      });

      router.resolve();
      return;
    }

    // G. Landing Page Order Form Submission
    if (e.target.id === 'landing-order-form') {
      e.preventDefault();
      const name = document.getElementById('landing-name')?.value.trim();
      const phone = document.getElementById('landing-phone')?.value.trim();
      const address = document.getElementById('landing-address')?.value.trim();
      const productSku = document.getElementById('landing-product-sku')?.value || 'LP-ITEM';
      const productName = document.getElementById('landing-product-name')?.value || 'ক্যাম্পেইন পণ্য';
      const color = document.getElementById('landing-product-color')?.value || 'Standard';
      const size = document.getElementById('landing-product-size')?.value || 'Free Size';
      const qty = Number(document.getElementById('landing-product-qty')?.value || 1);
      const price = Number(document.getElementById('landing-price')?.value || 0);
      const delivery = Number(document.querySelector('input[name="landing_delivery"]:checked')?.value || 70);
      const payment = document.querySelector('input[name="landing_payment"]:checked')?.value || 'Cash On Delivery (COD)';

      if (!name || !phone || !address) {
        alert('অনুগ্রহ করে নাম, মোবাইল নম্বর ও ঠিকানা পূরণ করুন।');
        return;
      }

      const orderPayload = {
        customer_name: name,
        phone: phone,
        address: address,
        products: `${productName} (${size}, ${color}) x${qty}`,
        product_name: `${productName} (${size}, ${color}) x${qty}`,
        color,
        size,
        quantity: qty,
        items: [{
          product_id: productSku,
          sku: productSku,
          name: productName,
          color,
          size,
          price: price,
          quantity: qty
        }],
        total_amount: (price * qty) + delivery,
        payment_method: payment,
        payment_status: payment.includes('COD') ? 'Pending' : 'Paid',
        order_status: 'Order Placed'
      };

      const res = await apiClient.request("orders/create", orderPayload);
      if (res && res.data) {
        const orderId = res.data.order_id || res.data.orderId;
        toast.show({
          type: "success",
          title: "ক্যাম্পেইন অর্ডার সফল!",
          message: `আপনার অর্ডার #${orderId} কনফার্ম ও শিটে সংরক্ষিত হয়েছে।`,
          duration: 5000
        });
        router.navigate('/order-success?orderId=' + orderId);
      }
      return;
    }
  });
}

function attachLiveSearchHandlers() {
  let debounceTimer = null;

  const performSearch = (inputEl, popupEl, clearBtn) => {
    if (!inputEl || !popupEl) return;
    const query = inputEl.value.trim().toLowerCase();

    if (clearBtn) {
      if (query.length > 0) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }

    if (!query || query.length < 1) {
      popupEl.innerHTML = '';
      popupEl.classList.add('hidden');
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const allProds = (apiClient.products && apiClient.products.length > 0)
        ? apiClient.products
        : (apiClient.sheetProducts || apiClient.loadLocal('dcbd_sheet_products', []) || []);

      const searchRes = SearchService.search(allProds, query);
      const directMatches = searchRes.directMatches;
      const relatedProducts = searchRes.relatedProducts;
      const matches = [...directMatches, ...relatedProducts].slice(0, 8);

      if (matches.length === 0) {
        popupEl.innerHTML = `
          <div class="p-5 text-center text-xs text-slate-500 space-y-2">
            <div>🔍 "${query}" এর সাথে কোনো পণ্য মেলেনি।</div>
            <a href="/products" class="btn-primary text-[11px] py-1.5 px-3.5 inline-flex font-bold">সকল পণ্য ব্রাউজ করুন →</a>
          </div>
        `;
        popupEl.classList.remove('hidden');
      } else {
        popupEl.innerHTML = `
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            <div class="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>🔍 ${directMatches.length > 0 ? `সেরা ফলাফল (${directMatches.length} টি সরাসরি ম্যাচ)` : `সম্ভাব্য ফলাফল (${matches.length} টি)`}</span>
              <span class="text-[9px] text-emerald-600 font-bold">ক্লিক করে বিস্তারিত দেখুন</span>
            </div>
            ${matches.map(p => `
              <div 
                class="search-preview-item flex items-center gap-3 p-3 hover:bg-emerald-50/70 dark:hover:bg-slate-800 transition cursor-pointer"
                data-slug="${p.slug || p.product_id || p.sku}"
              >
                <img 
                  src="${p.thumbnail || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}" 
                  alt="${p.name}" 
                  class="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-slate-900 dark:text-white truncate leading-snug">${p.name}</span>${p._isDirectMatch === false ? `<span class="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1 py-0.2 rounded text-[8px] font-bold flex-shrink-0">সম্পর্কিত</span>` : ''}
                  </div>
                  <div class="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                    <span class="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-slate-600 dark:text-slate-300">${p.sku}</span>
                    <span class="text-emerald-600 dark:text-emerald-400 font-black">${formatCurrency(p.selling_price)}</span>${p.category ? `<span class="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[9px] font-bold">${p.category}</span>` : ''}
                  </div>
                </div>
                <span class="text-slate-400 text-xs flex-shrink-0 font-bold">→</span>
              </div>
            `).join("")}
            <div class="p-3 text-center bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800">
              <a href="/products?search=${encodeURIComponent(query)}" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5">
                <span>"${query}" এর সকল সার্চ রেজাল্ট দেখুন (${searchRes.totalCount} টি) →</span>
              </a>
            </div>
          </div>
        `;
        popupEl.classList.remove('hidden');
      }
    }, 180);
  };

  document.addEventListener('input', (e) => {
    if (e.target.id === 'global-search-input') {
      performSearch(
        document.getElementById('global-search-input'),
        document.getElementById('search-preview-popup'),
        document.getElementById('global-search-clear-btn')
      );
    } else if (e.target.id === 'mobile-search-input') {
      performSearch(
        document.getElementById('mobile-search-input'),
        document.getElementById('mobile-search-preview-popup'),
        document.getElementById('mobile-search-clear-btn')
      );
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (e.target.id === 'global-search-input' || e.target.id === 'mobile-search-input') {
        e.preventDefault();
        const q = e.target.value.trim();
        const p1 = document.getElementById('search-preview-popup');
        const p2 = document.getElementById('mobile-search-preview-popup');
        if (p1) p1.classList.add('hidden');
        if (p2) p2.classList.add('hidden');
        if (q) router.navigate('/products?search=' + encodeURIComponent(q));
        else router.navigate('/products');
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#global-search-clear-btn')) {
      const input = document.getElementById('global-search-input');
      const popup = document.getElementById('search-preview-popup');
      const btn = document.getElementById('global-search-clear-btn');
      if (input) { input.value = ''; input.focus(); }
      if (popup) { popup.innerHTML = ''; popup.classList.add('hidden'); }
      if (btn) btn.classList.add('hidden');
      return;
    }
    if (e.target.closest('#mobile-search-clear-btn')) {
      const input = document.getElementById('mobile-search-input');
      const popup = document.getElementById('mobile-search-preview-popup');
      const btn = document.getElementById('mobile-search-clear-btn');
      if (input) { input.value = ''; input.focus(); }
      if (popup) { popup.innerHTML = ''; popup.classList.add('hidden'); }
      if (btn) btn.classList.add('hidden');
      return;
    }

    if (e.target.closest('#global-search-btn')) {
      const q = document.getElementById('global-search-input')?.value.trim();
      const popup = document.getElementById('search-preview-popup');
      if (popup) popup.classList.add('hidden');
      if (q) router.navigate('/products?search=' + encodeURIComponent(q));
      else router.navigate('/products');
      return;
    }
    if (e.target.closest('#mobile-search-btn')) {
      const q = document.getElementById('mobile-search-input')?.value.trim();
      const popup = document.getElementById('mobile-search-preview-popup');
      if (popup) popup.classList.add('hidden');
      if (q) router.navigate('/products?search=' + encodeURIComponent(q));
      else router.navigate('/products');
      return;
    }

    const previewItem = e.target.closest('.search-preview-item');
    if (previewItem) {
      const slug = previewItem.getAttribute('data-slug');
      const p1 = document.getElementById('search-preview-popup');
      const p2 = document.getElementById('mobile-search-preview-popup');
      if (p1) p1.classList.add('hidden');
      if (p2) p2.classList.add('hidden');
      if (slug) router.navigate('/product/' + encodeURIComponent(slug));
      return;
    }

    if (!e.target.closest('.search-container') && !e.target.closest('#mobile-search-input') && !e.target.closest('#mobile-search-preview-popup')) {
      const p1 = document.getElementById('search-preview-popup');
      const p2 = document.getElementById('mobile-search-preview-popup');
      if (p1) p1.classList.add('hidden');
      if (p2) p2.classList.add('hidden');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
