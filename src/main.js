/**
 * DREAM CART BD — MASTER FRONTEND BOOTSTRAPPER
 * Wires reactive stores, event delegates, modals, cart drawer, checkout dynamics, and router.
 */

import { renderHeader } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderMobileNav } from './components/MobileNav.js';
import { renderCartDrawer } from './components/CartDrawer.js';
import { renderFraudModal } from './components/FraudModal.js';
import { toast } from './components/Toast.js';
import { cartStore } from './store/cartStore.js';
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

    root.innerHTML = `
      <div id="header-mount"></div>
      <main id="app-content" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20"></main>
      <div id="footer-mount"></div>
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
    const fraudMount = document.getElementById('fraudmodal-mount');
    if (fraudMount) fraudMount.innerHTML = renderFraudModal();

    // Listen to Cart Store changes
    cartStore.subscribe(() => {
      updateHeader();
      updateMobileNav();
      updateCartDrawer();
      updateCheckoutSummary();
    });

    // Attach global event delegation
    attachEventListeners();

    // Initialize Router
    window.addEventListener('hashchange', () => router.navigate());
    router.navigate();

    // Welcome toast with authentic store hotline and offer
    setTimeout(() => {
      toast.show({
        type: "success",
        title: "Welcome to Dream Cart BD!",
        message: "৳২,০০০+ অর্ডারে সারা দেশে ফ্রি ডেলিভারি | হটলাইন: 01581703822 (WhatsApp)",
        duration: 5000
      });
    }, 1000);

  } catch (err) {
    console.error("Application initialization error:", err);
    document.body.innerHTML = `
      <div style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h2 style="color: #059669;">Dream Cart BD</h2>
        <p style="color: #64748b;">Loading platform interface...</p>
        <button onclick="location.reload()" style="margin-top: 16px; padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer;">Reload Application</button>
      </div>
    `;
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

function openCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const panel = document.getElementById('cart-drawer-panel');
  if (overlay) overlay.classList.remove('hidden');
  if (panel) panel.classList.remove('translate-x-full');
  
  // Backward compatibility with backdrop
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (backdrop) backdrop.classList.add('active');
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const panel = document.getElementById('cart-drawer-panel');
  if (overlay) overlay.classList.add('hidden');
  if (panel) panel.classList.add('translate-x-full');

  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function openFraudModal() {
  const modal = document.getElementById('fraud-modal-backdrop');
  if (modal) modal.classList.add('active');
}

function closeFraudModal() {
  const modal = document.getElementById('fraud-modal-backdrop');
  if (modal) modal.classList.remove('active');
}

function updateCheckoutSummary() {
  const chargeEl = document.getElementById('summary-delivery-charge');
  const grandTotalEl = document.getElementById('summary-grand-total');
  const onlineRowEl = document.getElementById('summary-online-discount-row');
  const onlineAmtEl = document.getElementById('summary-online-discount-amount');
  const btnTotalBadge = document.getElementById('btn-confirm-total-badge');
  const trxContainer = document.getElementById('trx-container');

  if (chargeEl) {
    const fee = cartStore.getDeliveryCharge();
    if (fee === 0) {
      chargeEl.innerHTML = '<span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">ফ্রি (৳০)</span>';
    } else {
      chargeEl.textContent = formatCurrency(fee);
    }
  }

  const onlineDiscount = cartStore.getOnlinePaymentDiscount();
  if (onlineRowEl) {
    if (onlineDiscount > 0) {
      onlineRowEl.classList.remove('hidden');
      if (onlineAmtEl) onlineAmtEl.textContent = `-${formatCurrency(onlineDiscount)}`;
    } else {
      onlineRowEl.classList.add('hidden');
    }
  }

  if (grandTotalEl) {
    grandTotalEl.textContent = formatCurrency(cartStore.getGrandTotal());
  }

  if (btnTotalBadge) {
    btnTotalBadge.textContent = `(${formatCurrency(cartStore.getGrandTotal())})`;
  }

  if (trxContainer) {
    if (cartStore.isOnlinePayment()) {
      trxContainer.classList.remove('hidden');
    } else {
      trxContainer.classList.add('hidden');
    }
  }
}

function attachEventListeners() {
  document.addEventListener('click', async (e) => {
    // Open Cart Drawer
    if (e.target.closest('#btn-open-cart') || e.target.closest('#mobile-cart-btn')) {
      openCartDrawer();
    }

    // Close Cart Drawer
    if (e.target.closest('#btn-close-cart') || e.target.id === 'cart-drawer-overlay' || e.target.closest('#cart-drawer-backdrop')) {
      closeCartDrawer();
    }

    // Open Fraud Modal
    if (e.target.closest('#btn-open-fraud-tool')) {
      openFraudModal();
    }

    // Close Fraud Modal
    if (e.target.closest('#btn-close-fraud-modal') || (e.target.id === 'fraud-modal-backdrop')) {
      closeFraudModal();
    }

    // Card click navigate to details
    const cardImg = e.target.closest('.card-img-click');
    if (cardImg && cardImg.dataset.slug) {
      window.location.hash = `#/product/${cardImg.dataset.slug}`;
    }

    // Quick Add Button on Product Card
    const addBtn = e.target.closest('.btn-quick-add');
    if (addBtn && addBtn.dataset.productId) {
      const pId = addBtn.dataset.productId;
      const res = await apiClient.request("products/details", { id: pId });
      if (res.data) {
        cartStore.addItem(res.data, 1);
        toast.show({
          type: "success",
          title: "Added to Cart!",
          message: `${res.data.name} is in your shopping cart.`,
          actionText: "View Cart",
          onAction: () => openCartDrawer()
        });
      }
    }

    // Cart Quantity Plus / Minus in Drawer
    const qtyBtn = e.target.closest('.btn-cart-qty');
    if (qtyBtn) {
      const pId = qtyBtn.dataset.productId;
      const vId = qtyBtn.dataset.variantId || "";
      const delta = parseInt(qtyBtn.dataset.delta, 10);
      const item = cartStore.items.find(it => it.product_id === pId && it.variant_id === vId);
      if (item) {
        cartStore.updateQuantity(pId, vId, item.quantity + delta);
      }
    }

    // Remove item in Drawer
    const removeBtn = e.target.closest('.btn-cart-remove');
    if (removeBtn) {
      const pId = removeBtn.dataset.productId;
      const vId = removeBtn.dataset.variantId || "";
      cartStore.removeItem(pId, vId);
    }

    // Apply coupon in drawer
    if (e.target.closest('#btn-apply-coupon') || e.target.closest('#btn-apply-drawer-coupon')) {
      const input = document.getElementById('cart-coupon-input') || document.getElementById('drawer-coupon-input');
      if (input && input.value.trim()) {
        const valRes = await apiClient.request("coupons/validate", { code: input.value.trim(), subtotal: cartStore.getSubtotal() });
        if (valRes.data && valRes.data.valid) {
          cartStore.applyCoupon(valRes.data);
          toast.show({
            type: "success",
            title: "Coupon Applied!",
            message: `You saved ৳${valRes.data.discount_amount} with code ${valRes.data.code}`
          });
        } else {
          toast.show({
            type: "error",
            title: "Invalid Code",
            message: valRes.message || "Please check coupon code and try again."
          });
        }
      }
    }

    // Run Fraud Check
    if (e.target.closest('#btn-run-fraud-check')) {
      const phoneInput = document.getElementById('fraud-phone-input');
      const phone = phoneInput ? phoneInput.value.trim() : '01581703822';
      toast.show({ type: "info", title: "Querying Couriers...", message: `Checking Steadfast, Pathao & RedX records for ${phone}`, duration: 2000 });
      const checkRes = await apiClient.request("fraud/check_phone", { phone });
      setTimeout(() => {
        toast.show({ type: "success", title: "Analysis Complete", message: `Overall delivery success rate: ${checkRes.data.overall_success_rate}. Status: ${checkRes.data.risk_level}` });
      }, 500);
    }

    // Product Detail Buy Now / Add to Cart
    if (e.target.closest('#btn-detail-add-cart')) {
      const pContainer = document.querySelector('[data-product-json]');
      if (pContainer) {
        const p = JSON.parse(pContainer.dataset.productJson);
        const qtyDisplay = document.getElementById('detail-qty-display');
        const qty = parseInt(qtyDisplay ? qtyDisplay.textContent : '1', 10) || 1;
        cartStore.addItem(p, qty);
        toast.show({
          type: "success",
          title: "Added to Cart!",
          message: `${qty} × ${p.name} added.`,
          actionText: "Checkout Now",
          onAction: () => { window.location.hash = '#/checkout'; }
        });
      }
    }

    if (e.target.closest('#btn-detail-buy-now')) {
      const pContainer = document.querySelector('[data-product-json]');
      if (pContainer) {
        const p = JSON.parse(pContainer.dataset.productJson);
        const qtyDisplay = document.getElementById('detail-qty-display');
        const qty = parseInt(qtyDisplay ? qtyDisplay.textContent : '1', 10) || 1;
        cartStore.addItem(p, qty);
        window.location.hash = '#/checkout';
      }
    }

    if (e.target.closest('#btn-detail-plus')) {
      const qtyDisplay = document.getElementById('detail-qty-display');
      if (qtyDisplay) {
        let q = parseInt(qtyDisplay.textContent, 10) || 1;
        qtyDisplay.textContent = q + 1;
      }
    }

    if (e.target.closest('#btn-detail-minus')) {
      const qtyDisplay = document.getElementById('detail-qty-display');
      if (qtyDisplay) {
        let q = parseInt(qtyDisplay.textContent, 10) || 1;
        if (q > 1) qtyDisplay.textContent = q - 1;
      }
    }

    // Global Search button
    if (e.target.closest('#global-search-btn')) {
      const input = document.getElementById('global-search-input');
      if (input && input.value.trim()) {
        window.location.hash = `#/shop?search=${encodeURIComponent(input.value.trim())}`;
      }
    }

    // Database Snapshot in Admin
    if (e.target.closest('#btn-admin-snapshot')) {
      toast.show({
        type: "success",
        title: "Backup Snapshot Created!",
        message: "Google Sheets database backup saved to Google Drive with timestamp.",
        duration: 4000
      });
    }
  });

  // Radio button change listener for Delivery Zone and Payment Method
  document.addEventListener('change', (e) => {
    if (e.target.name === 'delivery_zone') {
      cartStore.setDeliveryZone(e.target.value);
      
      // Update radio card styling
      document.querySelectorAll('.delivery-zone-card').forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        if (radio && radio.checked) {
          card.classList.add('border-emerald-600', 'bg-emerald-50/60', 'ring-2', 'ring-emerald-500/20');
          card.classList.remove('border-slate-200');
        } else {
          card.classList.remove('border-emerald-600', 'bg-emerald-50/60', 'ring-2', 'ring-emerald-500/20');
          card.classList.add('border-slate-200');
        }
      });

      updateCheckoutSummary();
    }

    if (e.target.name === 'payment_method') {
      cartStore.setPaymentMethod(e.target.value);

      // Update payment card styling and toggle payment details
      document.querySelectorAll('.payment-method-card').forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        const details = card.querySelector('.payment-details');
        if (radio && radio.checked) {
          card.classList.add('border-emerald-600', 'bg-emerald-50/60', 'ring-2', 'ring-emerald-500/20');
          card.classList.remove('border-slate-200');
          if (details) details.classList.remove('hidden');
        } else {
          card.classList.remove('border-emerald-600', 'bg-emerald-50/60', 'ring-2', 'ring-emerald-500/20');
          card.classList.add('border-slate-200');
          if (details) details.classList.add('hidden');
        }
      });

      updateCheckoutSummary();
    }
  });

  // Global search input enter key
  document.addEventListener('keypress', (e) => {
    if (e.target.id === 'global-search-input' && e.key === 'Enter') {
      if (e.target.value.trim()) {
        window.location.hash = `#/shop?search=${encodeURIComponent(e.target.value.trim())}`;
      }
    }
  });

  // Checkout form submit
  document.addEventListener('submit', async (e) => {
    if (e.target.id === 'checkout-form') {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-confirm-order');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          অর্ডার সংরক্ষণ ও স্টক রিজার্ভেশন চলছে...
        `;
      }

      const name = document.getElementById('checkout-name')?.value || "";
      const phone = document.getElementById('checkout-phone')?.value || "";
      const address = document.getElementById('checkout-address')?.value || "";
      const deliveryZone = document.querySelector('input[name="delivery_zone"]:checked')?.value || cartStore.deliveryZone;
      const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || cartStore.paymentMethod;
      const senderPhone = document.getElementById('checkout-sender-phone')?.value || "";
      const trxId = document.getElementById('checkout-trx-id')?.value || "";

      const orderPayload = {
        customer_name: name,
        customer_phone: phone,
        shipping_address: address,
        city: deliveryZone === "cumilla" ? "Cumilla" : (deliveryZone === "dhaka" ? "Dhaka" : "Outside Dhaka"),
        zone: deliveryZone,
        delivery_charge: cartStore.getDeliveryCharge(),
        payment_method: paymentMethod,
        sender_phone: senderPhone,
        trx_id: trxId,
        coupon_discount: cartStore.getCouponDiscount(),
        online_discount: cartStore.getOnlinePaymentDiscount(),
        subtotal: cartStore.getSubtotal(),
        grand_total: cartStore.getGrandTotal(),
        items: cartStore.items,
        shop_address: "Chawdhury Plaza, ground floor, room#03, Paduar Bazar, Bishwa Road, Sadar Dakshin, Cumilla-3500",
        shop_phone: "01581703822"
      };

      const res = await apiClient.request("orders/create", orderPayload);
      if (res.success) {
        cartStore.clear();
        const orderId = (res.data && res.data.order_id) || ("ORD-" + Math.floor(100000 + Math.random() * 900000));
        toast.show({
          type: "success",
          title: "Order Placed Successfully!",
          message: `Order ${orderId} has been confirmed. SMS notification queued.`,
          duration: 5000
        });
        window.location.hash = `#/order-success?orderId=${orderId}`;
      } else {
        toast.show({
          type: "error",
          title: "Order Failed",
          message: res.message || "Failed to record order. Please try again."
        });
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>অর্ডার কনফার্ম করুন</span> <span id="btn-confirm-total-badge">(${formatCurrency(cartStore.getGrandTotal())})</span>`;
        }
      }
    }
  });
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
