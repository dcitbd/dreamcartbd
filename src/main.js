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
 * - Incomplete order tracking
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

function initApp() {
  try {
    const root = document.getElementById('app-root');
    if (!root) {
      console.error("Could not find #app-root element");
      return;
    }

    // Expose globals for debugging & compatibility
    window.router = router;
    window.authStore = authStore;
    window.cartStore = cartStore;
    window.apiClient = apiClient;

    // Apply saved theme (Dark / Light)
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

    // Mount persistent components
    updateHeader();
    const footerMount = document.getElementById('footer-mount');
    if (footerMount) footerMount.innerHTML = renderFooter();
    updateMobileNav();
    updateCartDrawer();
    updateFloatingActions();
    const fraudMount = document.getElementById('fraudmodal-mount');
    if (fraudMount) fraudMount.innerHTML = renderFraudModal();

    // Subscribe to store updates
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
      router.resolve();
    });

    // Attach global click, input & form submit event delegates
    attachEventListeners();
    attachLiveSearchHandlers();

    // Pre-warm product catalogue cache in background
    apiClient.loadProductsFromSheet().catch(() => {});

    // Handle History navigation
    window.addEventListener('popstate', () => router.resolve());
    
    // Resolve initial URL
    router.resolve();

    // Log viewer activity for analytics (Viewers Sheet)
    apiClient.request("viewers/log", {
      time: new Date().toISOString(),
      device: window.innerWidth < 768 ? "Mobile" : "Desktop/Laptop",
      activity: "Site Visit"
    });

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
  const btnTextEl = document.getElementById('btn-confirm-order-text');
  const btnEl = document.getElementById('btn-confirm-order');

  const subtotal = cartStore.getSubtotal();
  const fee = cartStore.getDeliveryCharge();
  const isFree = cartStore.isFreeDelivery();
  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
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
    freeNoticeEl.textContent = subtotal >= 2000 ? '✓ অর্জিত!' : `আরও ৳${2000 - subtotal}`;
  }
  if (progressBarEl) {
    progressBarEl.style.width = `${Math.min(100, (subtotal / 2000) * 100)}%`;
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
    
    // Toggle Dark Mode
    if (e.target.closest('#btn-toggle-darkmode')) {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('dcbd_theme', isDark ? 'dark' : 'light');
      updateHeader();
      return;
    }

    // Mobile Hamburger Menu Toggle (Shows clean list on click)
    if (e.target.closest('#btn-mobile-menu-toggle')) {
      const menu = document.getElementById('mobile-dropdown-menu');
      if (menu) menu.classList.toggle('hidden');
      return;
    }

    // Mobile Menu Close Button
    if (e.target.closest('#btn-mobile-menu-close')) {
      const menu = document.getElementById('mobile-dropdown-menu');
      if (menu) menu.classList.add('hidden');
      return;
    }

    // Close mobile menu list on link click
    if (e.target.closest('.mobile-menu-link')) {
      const menu = document.getElementById('mobile-dropdown-menu');
      if (menu) menu.classList.add('hidden');
    }

    // Close mobile menu when clicked outside
    if (!e.target.closest('#mobile-dropdown-menu') && !e.target.closest('#btn-mobile-menu-toggle')) {
      const menu = document.getElementById('mobile-dropdown-menu');
      if (menu) menu.classList.add('hidden');
    }

    // Mobile Floating Launcher Toggle Button (Hides/Shows fixed buttons on mobile)
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

    // Auth dropdown menu
    if (e.target.closest('#btn-user-menu')) {
      const panel = document.getElementById('auth-dropdown-panel');
      if (panel) panel.classList.toggle('hidden');
      return;
    }

    // Global Logout handlers
    if (e.target.closest('#btn-logout') || e.target.closest('.btn-logout') || e.target.closest('#btn-customer-logout')) {
      authStore.logout();
      toast.show({ type: "info", title: "লগআউট সম্পন্ন", message: "আপনি আপনার অ্যাকাউন্ট থেকে সফলভাবে লগআউট হয়েছেন।" });
      router.navigate('/');
      return;
    }

    // Open/Close Cart Drawer
    if (e.target.closest('#btn-open-cart') || e.target.closest('#mobile-cart-btn') || e.target.closest('#btn-floating-cart')) {
      openCartDrawer();
      return;
    }
    if (e.target.closest('#btn-close-cart') || e.target.id === 'cart-drawer-overlay') {
      closeCartDrawer();
      return;
    }

    // Floating Call Sub-menu Toggle
    if (e.target.closest('#btn-floating-call')) {
      const menu = document.getElementById('call-sub-menu');
      if (menu) menu.classList.toggle('hidden');
      return;
    }

    // Floating WhatsApp Sub-menu Toggle
    if (e.target.closest('#btn-floating-wa')) {
      const menu = document.getElementById('wa-sub-menu');
      if (menu) menu.classList.toggle('hidden');
      return;
    }

    // Close floating submenus & auth dropdown & mobile launcher when clicked outside
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

    // Product card click to open details
    const cardClick = e.target.closest('.card-img-click');
    if (cardClick && !e.target.closest('.btn-toggle-favourite') && !e.target.closest('.btn-quick-add') && !e.target.closest('a')) {
      const slug = cardClick.getAttribute('data-slug') || cardClick.getAttribute('data-product-id');
      if (slug) {
        router.navigate('/product/' + encodeURIComponent(slug));
        return;
      }
    }

    // Toggle Favourite / Wishlist
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
          title: added ? "পছন্দের তালিকায় যুক্ত হয়েছে" : "পছন্দের তালিকা থেকে সরানো হয়েছে",
          message: res.data.name,
          duration: 3000
        });
      }
      return;
    }

    // Clear Wishlist
    if (e.target.closest('#btn-clear-wishlist') || e.target.closest('#btn-clear-wishlist-action')) {
      favouriteStore.clear();
      toast.show({
        type: 'info',
        title: 'পছন্দের তালিকা খালি করা হয়েছে',
        message: 'সব পণ্য তালিকা থেকে মুছে ফেলা হয়েছে।'
      });
      router.resolve();
      return;
    }

    // Interactive Color Chip Selection on Product Details
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

    // Interactive Size Chip Selection on Product Details
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

    // Quick Add to Cart Button (Card)
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
          title: "কার্টে যুক্ত হয়েছে",
          message: `${res.data.name} কার্টে যোগ করা হয়েছে।`,
          duration: 3500
        });
        openCartDrawer();
      }
      return;
    }

    // Detail Add to Cart Button (With Color & Size)
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
          title: "কার্টে যুক্ত হয়েছে",
          message: `${res.data.name} (${qty} টি)${variantDesc ? ` [${variantDesc}]` : ''} কার্টে যোগ করা হয়েছে।`,
          duration: 3500
        });
        openCartDrawer();
      }
      return;
    }

    // Order Now Button (Direct checkout with Color & Size)
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

    // Pre-Order Button
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
          message: `${res.data.name} প্রি-অর্ডার কার্টে যুক্ত হয়েছে। চেকআউটে কনফার্ম করুন।`,
          duration: 4000
        });
        router.navigate('/checkout');
      }
      return;
    }

    // Cart Quantity Plus / Minus / Remove
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

    // Clear entire cart
    if (e.target.closest('#btn-clear-cart')) {
      cartStore.clear();
      router.resolve();
      return;
    }

    // Delivery Zone Radio change
    const zoneRadio = e.target.closest('input[name="delivery_zone"]');
    if (zoneRadio) {
      cartStore.setDeliveryZone(zoneRadio.value);
      updateCheckoutSummary();
    }

    // Payment Method Radio change
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

  // 4. Incomplete Order Real-time Tracker
  let incTimeout = null;
  document.addEventListener('input', (e) => {
    if (e.target.id === 'checkout-phone' || e.target.id === 'checkout-name' || e.target.id === 'checkout-address') {
      clearTimeout(incTimeout);
      incTimeout = setTimeout(() => {
        const phone = document.getElementById('checkout-phone')?.value;
        const name = document.getElementById('checkout-name')?.value;
        const addr = document.getElementById('checkout-address')?.value;
        if (phone && phone.length >= 7) {
          apiClient.request("incomplete_orders/create", {
            phone,
            customer_name: name,
            address: addr,
            total_amount: cartStore.getGrandTotal(),
            products: cartStore.items.map(i => `${i.name} [${i.color || ''} ${i.size || ''}] (${i.quantity})`).join(", ")
          });
        }
      }, 1500);
    }
  });

  // 5. Global Delegated Form Submissions (Handles Checkout, Auth & Profile Forms)
  document.addEventListener('submit', async (e) => {
    
    // Tracking Search Form Submission
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
        alert('অনলাইন পেমেন্ট নির্বাচিত হয়েছে। অনুগ্রহ করে পেমেন্ট ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
        return;
      }

      const orderPayload = {
        customer_name: name,
        phone: phone,
        address: address,
        customer_note: note,
        account_type: authStore.getAccountType(),
        items: cartStore.items,
        total_amount: cartStore.getGrandTotal(),
        payment_method: cartStore.paymentMethod,
        transaction_id: trxId,
        payment_status: cartStore.paymentMethod === 'COD' ? 'COD' : 'Paid',
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
          message: `আপনার অর্ডার #${orderId} সফলভাবে গৃহীত হয়েছে।`,
          duration: 5000
        });
        router.navigate('/order-success?orderId=' + orderId);
      } else {
        alert('অর্ডার সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
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
      const phone = document.getElementById('auth-phone')?.value.trim();
      const pass = document.getElementById('auth-pass')?.value.trim();
      const name = document.getElementById('auth-name')?.value.trim() || 'সম্মানিত গ্রাহক';
      const mail = document.getElementById('auth-mail')?.value.trim() || '';
      const addr = document.getElementById('auth-addr')?.value.trim() || '';

      if (!phone || phone.length < 11) {
        toast.show({ type: "error", title: "সতর্কতা", message: "সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।" });
        return;
      }
      if (!pass || pass.length < 4) {
        toast.show({ type: "error", title: "সতর্কতা", message: "পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।" });
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳</span> <span>${isRegister ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'প্রবেশ করা হচ্ছে...'}</span>`;
      }

      try {
        const payload = {
          name: name,
          mobile: phone,
          phone: phone,
          mail: mail,
          email: mail,
          address: addr,
          password: pass,
          account_type: 'CUSTOMER'
        };

        await apiClient.request(isRegister ? "customers/register" : "customers/login", payload);
        authStore.setUser(payload, "TOKEN-CUST-" + Date.now(), "CUSTOMER");

        toast.show({
          type: "success",
          title: isRegister ? "নিবন্ধন সম্পন্ন!" : "লগইন সফল!",
          message: `স্বাগতম, ${name}! আপনার ড্যাশবোর্ডে প্রবেশ করা হয়েছে।`,
          duration: 4000
        });

        router.navigate('/customer/dashboard');

      } catch (err) {
        console.error("Auth error:", err);
        const fallback = { name, mobile: phone, phone, mail, address: addr, account_type: 'CUSTOMER' };
        authStore.setUser(fallback, "TOKEN-CUST-OFFLINE", "CUSTOMER");
        router.navigate('/customer/dashboard');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = isRegister ? 'নিবন্ধন সম্পন্ন করুন →' : 'লগইন করুন →';
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
        message: `স্বাগতম, ${name}! পাইকারি রেট সক্রিয় হয়েছে।`,
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
        message: `${userName} (${workerType}) হিসেবে লগইন হয়েছে।`,
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
        title: 'প্রোফাইল আপডেট হয়েছে!',
        message: 'আপনার তথ্য সফলভাবে সংরক্ষিত হয়েছে।'
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
      const productSku = document.getElementById('landing-product-sku')?.value;
      const productName = document.getElementById('landing-product-name')?.value;
      const price = Number(document.getElementById('landing-price')?.value || 0);
      const delivery = Number(document.querySelector('input[name="landing_delivery"]:checked')?.value || 70);
      const payment = document.querySelector('input[name="landing_payment"]:checked')?.value || 'COD';

      if (!name || !phone || !address) {
        alert('অনুগ্রহ করে নাম, মোবাইল নম্বর ও ঠিকানা পূরণ করুন।');
        return;
      }

      const orderPayload = {
        customer_name: name,
        phone: phone,
        address: address,
        items: [{
          product_id: productSku,
          sku: productSku,
          name: productName,
          price: price,
          quantity: 1
        }],
        total_amount: price + delivery,
        payment_method: payment,
        payment_status: payment === 'Cash On Delivery (COD)' ? 'COD' : 'Paid',
        order_status: 'Order Placed'
      };

      const res = await apiClient.request("orders/create", orderPayload);
      if (res && res.data) {
        const orderId = res.data.order_id || res.data.orderId;
        toast.show({
          type: "success",
          title: "ক্যাম্পেইন অর্ডার সফল!",
          message: `আপনার অর্ডার #${orderId} কনফার্ম করা হয়েছে।`,
          duration: 5000
        });
        router.navigate('/order-success?orderId=' + orderId);
      }
      return;
    }

  });
}

/**
 * Enhanced Live Predictive Search Dropdown with Instant Preview Cards & Action Triggers
 * Uses document-level event delegation so that re-rendering headers NEVER breaks search!
 */
function attachLiveSearchHandlers() {
  let debounceTimer = null;

  const performSearch = (inputEl, popupEl, clearBtn) => {
    if (!inputEl || !popupEl) return;
    const query = inputEl.value.trim().toLowerCase();

    // Toggle clear button
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
      
      const matches = allProds.filter(p => {
        const name = (p.name || p.p_name || '').toLowerCase();
        const sku = (p.sku || p.product_id || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const subCat = (p.sub_category || '').toLowerCase();
        return name.includes(query) || sku.includes(query) || brand.includes(query) || cat.includes(query) || subCat.includes(query);
      }).slice(0, 8);

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
              <span>🔍 সম্ভাব্য ফলাফল (${matches.length} টি পণ্য পাওয়া গেছে)</span>
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
                  <div class="text-xs font-bold text-slate-900 dark:text-white truncate leading-snug">${p.name}</div>
                  <div class="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                    <span class="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-slate-600 dark:text-slate-300">${p.sku}</span>
                    <span class="text-emerald-600 dark:text-emerald-400 font-black">${formatCurrency(p.selling_price)}</span>
                    ${p.category ? `<span class="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[9px] font-bold">${p.category}</span>` : ''}
                  </div>
                </div>
                <span class="text-slate-400 text-xs flex-shrink-0 font-bold">→</span>
              </div>
            `).join("")}
            <div class="p-3 text-center bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800">
              <a href="/products?search=${encodeURIComponent(query)}" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5">
                <span>"${query}" এর সকল সার্চ রেজাল্ট দেখুন →</span>
              </a>
            </div>
          </div>
        `;
        popupEl.classList.remove('hidden');
      }
    }, 180);
  };

  // Delegated input listener on document
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

  // Delegated keydown listener (Enter key)
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

  // Delegated click listener for search buttons, clear buttons, and preview cards
  document.addEventListener('click', (e) => {
    // 1. Clear buttons
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

    // 2. Search Buttons
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

    // 3. Search Preview Item Click
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

    // 4. Click outside search containers closes previews
    if (!e.target.closest('.search-container') && !e.target.closest('#mobile-search-input') && !e.target.closest('#mobile-search-preview-popup')) {
      const p1 = document.getElementById('search-preview-popup');
      const p2 = document.getElementById('mobile-search-preview-popup');
      if (p1) p1.classList.add('hidden');
      if (p2) p2.classList.add('hidden');
    }
  });
}

// Auto-run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
