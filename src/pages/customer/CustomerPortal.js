/**
 * DREAM CART BD — CUSTOMER PORTAL & ADVANCED DASHBOARD (CustomerPortal.js)
 * Implements user requirements:
 * - Luxury responsive Dashboard with Sidebar & Metric Cards
 * - Seamless access for both Logged-In and Guest / Pre-login users
 * - Live Counters & lists for Favourites, Cart, Orders, Tracking, Settings
 * - Prominent "🛍️ শপ ভিজিট করুন" (Visit Shop) button in header & sidebar
 * - Full-detail Order History with live search & multi-status filtering
 * - Interactive Order Tracking system with step-by-step progress
 * - Dynamic Profile Edit modal & Auth views (100% compatible with main.js event listeners)
 * - Strict Sequential Registration Form:
 *     Column A = Customer_ID (auto fillup, unique)
 *     Column B = Profile_photo (File upload / URL link with live preview, Required)
 *     Column C = Name (Required)
 *     Column D = Mobile (Required, 11 digits)
 *     Column E = Mail (Email)
 *     Column F = Address (Delivery address, Required)
 *     Column G = User_ID (Autofill in real-time from mobile number)
 *     Column H = Password (Suggest-strong password + live percentage strength meter)
 * - Zero divide/conflict with existing stores and routing
 */

import { authStore } from '../../store/authStore.js';
import { cartStore } from '../../store/cartStore.js';
import { favouriteStore } from '../../store/favouriteStore.js';
import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { renderProductCard } from '../../components/ProductCard.js';

// Global Event Listeners & Logic (Registered once at module scope to guarantee SPA execution)
if (typeof window !== 'undefined' && !window.__dcbdCustomerPortalInit) {
  window.__dcbdCustomerPortalInit = true;

  // Real-time Password Strength Calculator (0% to 100%)
  window.checkPasswordStrength = function(pass) {
    const val = String(pass || '').trim();
    const bar = document.getElementById('pwd-strength-bar');
    const lbl = document.getElementById('pwd-strength-label');
    if (!bar || !lbl) return;

    let percent = 0;
    let label = '০%';
    let color = '#94a3b8';

    if (val.length === 0) {
      percent = 0;
      label = '০%';
      color = '#94a3b8';
    } else {
      if (val.length >= 4) percent += 20;
      if (val.length >= 8) percent += 20;
      if (/[a-z]/.test(val) && /[A-Z]/.test(val)) percent += 20;
      if (/[0-9]/.test(val)) percent += 20;
      if (/[^a-zA-Z0-9]/.test(val)) percent += 20;

      if (percent <= 20) {
        label = `${percent}% (খুব দুর্বল)`;
        color = '#ef4444';
      } else if (percent <= 40) {
        label = `${percent}% (দুর্বল)`;
        color = '#f97316';
      } else if (percent <= 60) {
        label = `${percent}% (মাঝারি)`;
        color = '#eab308';
      } else if (percent <= 80) {
        label = `${percent}% (শক্তিশালী)`;
        color = '#10b981';
      } else {
        label = '১০০% (খুব শক্তিশালী)';
        color = '#059669';
      }
    }

    bar.style.width = percent + '%';
    bar.style.backgroundColor = color;
    lbl.textContent = label;
    lbl.style.color = color;
  };

  // Suggest Strong Password Generator (10 Characters with upper, lower, digits, symbols)
  window.suggestStrongPassword = function() {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '@#$%&*';
    const all = upper + lower + digits + symbols;

    let pwd = '';
    pwd += upper.charAt(Math.floor(Math.random() * upper.length));
    pwd += lower.charAt(Math.floor(Math.random() * lower.length));
    pwd += digits.charAt(Math.floor(Math.random() * digits.length));
    pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));
    for (let i = 4; i < 10; i++) {
      pwd += all.charAt(Math.floor(Math.random() * all.length));
    }
    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');

    const pInput = document.getElementById('auth-pass');
    const cInput = document.getElementById('auth-confirm-pass');
    if (pInput) {
      pInput.value = pwd;
      pInput.type = 'text';
    }
    if (cInput) {
      cInput.value = pwd;
      cInput.type = 'text';
    }
    document.querySelectorAll('.btn-toggle-auth-pass').forEach(btn => {
      btn.innerHTML = '🙈';
      btn.title = 'পাসওয়ার্ড লুকান';
    });
    window.checkPasswordStrength(pwd);
  };

  // Dashboard tab switching
  window.switchCustomerTab = function(tabId, btn) {
    document.querySelectorAll('.customer-tab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.dc-nav-item').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.filterCustomerOrders = function(q) {
    const query = (q || '').toLowerCase().trim();
    document.querySelectorAll('.customer-order-item').forEach(item => {
      const sText = item.getAttribute('data-search') || '';
      item.style.display = sText.includes(query) ? '' : 'none';
    });
  };

  window.filterCustomerOrderStatus = function(status, btn) {
    document.querySelectorAll('.dc-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.customer-order-item').forEach(item => {
      const iStatus = item.getAttribute('data-status') || '';
      if (status === 'all') {
        item.style.display = '';
      } else if (status === 'pending') {
        item.style.display = ['pending', 'order placed', 'processing', 'packing'].includes(iStatus) ? '' : 'none';
      } else if (status === 'delivered') {
        item.style.display = ['delivered', 'completed'].includes(iStatus) ? '' : 'none';
      } else if (status === 'cancelled') {
        item.style.display = ['cancelled', 'returned'].includes(iStatus) ? '' : 'none';
      }
    });
  };

  window.executeDashboardTrack = function() {
    const q = (document.getElementById('dashboard-track-input')?.value || '').trim();
    if (!q) {
      alert('অনুগ্রহ করে অর্ডার আইডি প্রদান করুন!');
      return;
    }
    const trackDisp = document.getElementById('track-disp-id');
    if (trackDisp) trackDisp.textContent = q.toUpperCase();
    const resultBox = document.getElementById('dashboard-track-result');
    if (resultBox) resultBox.scrollIntoView({ behavior: 'smooth' });
  };

  // Customer Profile Update Function (Name, Photo, Mail, Address)
  window.updateCustomerProfile = function(e, source) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();

    const isModal = source === 'modal';
    const nameEl = document.getElementById(isModal ? 'edit-c-name' : 'settings-c-name') || document.getElementById('edit-c-name');
    const photoEl = document.getElementById(isModal ? 'edit-c-photo' : 'settings-c-photo') || document.getElementById('edit-c-photo');
    const mailEl = document.getElementById(isModal ? 'edit-c-mail' : 'settings-c-mail') || document.getElementById('edit-c-mail');
    const addrEl = document.getElementById(isModal ? 'edit-c-addr' : 'settings-c-addr') || document.getElementById('edit-c-addr');

    const name = (nameEl?.value || '').trim() || authStore.user?.name || '';
    const photo = (photoEl?.value || '').trim() || authStore.user?.profile_photo || authStore.user?.photo || '';
    const mail = (mailEl?.value || '').trim();
    const addr = (addrEl?.value || '').trim();

    const updated = {
      ...(authStore.user || {}),
      name: name,
      profile_photo: photo,
      photo: photo,
      Profile_photo: photo,
      mail: mail,
      email: mail,
      address: addr
    };

    authStore.setUser(updated, authStore.token, 'CUSTOMER');

    // Sync to Apps Script / backend in background
    try {
      apiClient.request('customers/update', {
        user_id: updated.user_id,
        phone: updated.phone || updated.mobile,
        name: updated.name,
        profile_photo: photo,
        mail: updated.mail,
        address: updated.address
      });
    } catch (err) {}

    const modal = document.getElementById('customer-profile-edit-modal');
    if (modal) modal.classList.remove('active');

    alert('আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষিত ও আপডেট হয়েছে!');
    if (window.router && typeof window.router.resolve === 'function') {
      window.router.resolve();
    } else {
      window.location.reload();
    }
  };

  // Document-level event delegation (guarantees real-time response in SPA)
  document.addEventListener('input', function(e) {
    if (!e.target) return;
    if (e.target.id === 'auth-pass') {
      window.checkPasswordStrength(e.target.value);
    }
    if (e.target.id === 'auth-phone') {
      const uid = document.getElementById('auth-user-id');
      if (uid) uid.value = e.target.value.trim();
    }
    if (e.target.id === 'auth-photo') {
      const prev = document.getElementById('auth-photo-preview');
      if (prev) {
        prev.src = e.target.value.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160';
      }
    }
    if (e.target.id === 'edit-c-photo') {
      const prev = document.getElementById('edit-c-photo-preview');
      if (prev) {
        prev.src = e.target.value.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160';
      }
    }
    if (e.target.id === 'settings-c-photo') {
      const prev = document.getElementById('settings-c-photo-preview');
      if (prev) {
        prev.src = e.target.value.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160';
      }
    }
  });

  document.addEventListener('change', function(e) {
    if (!e.target) return;
    if (e.target.id === 'auth-photo-file-input') {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const dataUrl = evt.target.result;
          const photoInput = document.getElementById('auth-photo');
          const preview = document.getElementById('auth-photo-preview');
          if (photoInput) photoInput.value = dataUrl;
          if (preview) preview.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    }
    if (e.target.id === 'edit-c-photo-file-input') {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const dataUrl = evt.target.result;
          const photoInput = document.getElementById('edit-c-photo');
          const preview = document.getElementById('edit-c-photo-preview');
          if (photoInput) photoInput.value = dataUrl;
          if (preview) preview.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    }
    if (e.target.id === 'settings-c-photo-file-input') {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const dataUrl = evt.target.result;
          const photoInput = document.getElementById('settings-c-photo');
          const preview = document.getElementById('settings-c-photo-preview');
          if (photoInput) photoInput.value = dataUrl;
          if (preview) preview.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    }
  });

  document.addEventListener('click', function(e) {
    // Strong password suggest button
    if (e.target && (e.target.id === 'btn-suggest-strong-pass' || e.target.closest('#btn-suggest-strong-pass'))) {
      window.suggestStrongPassword();
    }
  });
}

// Helper to extract product name from any order structure (Google Sheet / Local Store / Checkout)
function extractOrderProductName(o) {
  if (!o) return 'অর্ডারকৃত পণ্য';
  if (Array.isArray(o.items) && o.items.length > 0) {
    const names = o.items.map(it => {
      if (typeof it === 'string') return it;
      const n = it.name || it.product_name || it.product || it.title || it.p_name || '';
      const v = (it.color || it.size) ? ` [${[(it.color || ''), (it.size || '')].filter(Boolean).join(' ')}]` : '';
      const q = it.quantity && Number(it.quantity) > 1 ? ` (${it.quantity} টি)` : '';
      return `${n}${v}${q}`.trim();
    }).filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  const candidates = [
    o.products, o.Products, o.product_name, o.productName, o.Product_Name,
    o.items_name, o.itemsName, o.item_name, o.itemName, o.product, o.Product,
    o.items, o.Items, o.col_6, o.col_7, o.name, o.p_name, o.title, o.description
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) {
      const trimmed = c.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const list = parsed.map(it => {
              if (typeof it === 'string') return it;
              const n = it.name || it.product_name || it.product || it.title || it.p_name || '';
              const q = it.quantity && Number(it.quantity) > 1 ? ` (${it.quantity} টি)` : '';
              return `${n}${q}`.trim();
            }).filter(Boolean);
            if (list.length > 0) return list.join(', ');
          } else if (parsed && typeof parsed === 'object') {
            const n = parsed.name || parsed.product_name || parsed.title;
            if (n) return n;
          }
        } catch (e) {}
      }
      return trimmed;
    }
  }
  for (const [k, v] of Object.entries(o)) {
    const lk = k.toLowerCase();
    if ((lk.includes('product') || lk.includes('item')) && !lk.includes('id') && !lk.includes('status') && !lk.includes('price')) {
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
  }
  return o.customer_name ? `${o.customer_name} এর অর্ডারকৃত পণ্য` : 'অর্ডারকৃত পণ্য';
}

function extractOrderQuantity(o) {
  if (!o) return 1;
  const numCandidates = [o.quantity, o.Quantity, o.total_quantity, o.totalQuantity, o.col_9, o.item_count, o.itemCount];
  for (const c of numCandidates) {
    if (c !== undefined && c !== null && !isNaN(Number(c)) && Number(c) > 0) return Number(c);
  }
  if (Array.isArray(o.items) && o.items.length > 0) {
    const sum = o.items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
    if (sum > 0) return sum;
  }
  const jsonCandidates = [o.items, o.products, o.col_6];
  for (const cand of jsonCandidates) {
    if (typeof cand === 'string' && cand.startsWith('[')) {
      try {
        const parsed = JSON.parse(cand);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sum = parsed.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
          if (sum > 0) return sum;
        }
      } catch (e) {}
    }
  }
  const textToScan = String(o.products || o.col_6 || '');
  const qtyMatches = textToScan.match(/\((\d+)\)/g) || textToScan.match(/x\s*(\d+)/gi);
  if (qtyMatches) {
    const sum = qtyMatches.reduce((acc, m) => acc + Number(m.replace(/\D/g, '') || 1), 0);
    if (sum > 0) return sum;
  }
  return 1;
}

export async function renderCustomerPortal(params = {}) {
  const isAuth = authStore.isAuthenticated();
  const user = authStore.user || {};
  
  const pathname = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
  const currentView = params.subview || (pathname.includes('/register') ? 'register' : (pathname.includes('/login') ? 'login' : 'dashboard'));

  // If user is already authenticated and visits login/register, redirect immediately to dashboard
  if (isAuth && (currentView === 'login' || currentView === 'register')) {
    if (typeof window !== 'undefined' && window.router) {
      setTimeout(() => window.router.navigate('/customer/dashboard'), 50);
    }
  }

  // If user explicitly navigated to /customer/login or /customer/register and is not logged in:
  if (!isAuth && (currentView === 'login' || currentView === 'register')) {
    return renderAuthView(currentView);
  }

  // Fetch orders from Sheets / local client
  let allOrders = [];
  try {
    const orderRes = await apiClient.request("orders/list");
    allOrders = (orderRes.data && orderRes.data.items) || [];
  } catch (e) {
    allOrders = apiClient.sheetOrders || [];
  }

  // Filter orders for logged in user (matching phone or email) or show all local placed orders
  const userPhone = String(user.mobile || user.phone || "").trim();
  const userMail = String(user.mail || user.email || "").trim().toLowerCase();

  let orders = [];
  if (isAuth && (userPhone || userMail)) {
    orders = allOrders.filter(o => {
      const oPhone = String(o.phone || o.customer_phone || "").trim();
      const oMail = String(o.mail || o.email || o.customer_mail || "").trim().toLowerCase();
      return (userPhone && oPhone.includes(userPhone)) || (userMail && oMail === userMail);
    });
    if (orders.length === 0 && apiClient.sheetOrders) {
      orders = (apiClient.sheetOrders || []).filter(o => {
        const oPhone = String(o.phone || "").trim();
        return userPhone && oPhone.includes(userPhone);
      });
    }
  } else if (!isAuth) {
    try {
      const localSaved = JSON.parse(localStorage.getItem('dcbd_sheet_orders') || '[]');
      if (Array.isArray(localSaved) && localSaved.length > 0) {
        orders = localSaved.slice(0, 5);
      }
    } catch (e) {}
  }

  // Order Metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => {
    const st = String(o.order_status || o.status || 'Pending').toLowerCase();
    return ['pending', 'order placed', 'processing', 'packing'].includes(st);
  }).length;
  const deliveredOrders = orders.filter(o => {
    const st = String(o.order_status || o.status || '').toLowerCase();
    return ['delivered', 'completed'].includes(st);
  }).length;
  const cancelledOrders = orders.filter(o => {
    const st = String(o.order_status || o.status || '').toLowerCase();
    return ['cancelled', 'returned'].includes(st);
  }).length;
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // Store data
  const cartItems = cartStore.items || [];
  const favItems = favouriteStore.getItems() || [];
  const cartSubtotal = cartStore.getSubtotal ? cartStore.getSubtotal() : cartItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);

  const initial = (user.name || (isAuth ? "U" : "G")).charAt(0).toUpperCase();
  const userPhoto = user.profile_photo || user.photo || user.Profile_photo || '';

  return `
    <style id="dc-customer-portal-styles">
      .dc-cust-dashboard {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        box-sizing: border-box;
      }

      .dc-cust-grid {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
        align-items: start;
        width: 100%;
      }

      @media (max-width: 1024px) {
        .dc-cust-grid {
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
      }

      .dc-cust-sidebar {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 20px;
        padding: 1.25rem;
        box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        position: sticky;
        top: 5rem;
        z-index: 20;
      }

      .dark .dc-cust-sidebar {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.35);
      }

      @media (max-width: 1024px) {
        .dc-cust-sidebar {
          position: static;
        }
      }

      .dc-sidebar-profile {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      }

      .dark .dc-sidebar-profile {
        border-bottom-color: rgba(255, 255, 255, 0.08);
      }

      .dc-avatar {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        font-weight: 900;
        box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
        flex-shrink: 0;
      }

      .dc-nav-list {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      @media (max-width: 1024px) {
        .dc-nav-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
          gap: 0.5rem;
        }
      }

      .dc-nav-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.625rem 0.875rem;
        border-radius: 12px;
        font-size: 0.8125rem;
        font-weight: 700;
        color: #475569;
        text-decoration: none;
        transition: all 0.18s ease;
        border: 1px solid transparent;
        cursor: pointer;
        background: transparent;
      }

      .dark .dc-nav-item {
        color: #cbd5e1;
      }

      .dc-nav-item:hover {
        background: #f1f5f9;
        color: #059669;
      }

      .dark .dc-nav-item:hover {
        background: #1e293b;
        color: #34d399;
      }

      .dc-nav-item.active {
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        color: #047857 !important;
        border-color: #a7f3d0;
        font-weight: 800;
      }

      .dark .dc-nav-item.active {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399 !important;
        border-color: rgba(16, 185, 129, 0.3);
      }

      .dc-badge-count {
        font-size: 0.6875rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 9999px;
        background: #e2e8f0;
        color: #334155;
      }

      .dark .dc-badge-count {
        background: #334155;
        color: #f1f5f9;
      }

      .dc-nav-item.active .dc-badge-count {
        background: #10b981;
        color: #ffffff;
      }

      .dc-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 0.875rem;
      }

      @media (max-width: 640px) {
        .dc-kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.625rem;
        }
      }

      .dc-kpi-card {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 18px;
        padding: 1.125rem 1.25rem;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .dark .dc-kpi-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.3);
      }

      .dc-kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.08);
      }

      .dc-panel {
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.04);
        box-sizing: border-box;
      }

      .dark .dc-panel {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.35);
      }

      @media (max-width: 640px) {
        .dc-panel {
          padding: 1rem;
          border-radius: 16px;
        }
      }

      .dc-filter-btn {
        padding: 0.4rem 0.95rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
        background: #ffffff;
        color: #475569;
        border: 1.5px solid #e2e8f0;
        transition: all 0.18s ease;
        cursor: pointer;
      }

      .dark .dc-filter-btn {
        background: #1e293b;
        color: #cbd5e1;
        border-color: rgba(255, 255, 255, 0.1);
      }

      .dc-filter-btn:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #0f172a;
      }

      .dark .dc-filter-btn:hover {
        background: #334155;
        color: #ffffff;
      }

      .dc-filter-btn.active {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: #ffffff !important;
        border-color: #059669 !important;
        font-weight: 800 !important;
        box-shadow: 0 3px 10px rgba(16, 185, 129, 0.3) !important;
      }

      /* Coordinated Luxury Order Cards & Buttons */
      .dc-order-card {
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 18px;
        padding: 1.15rem 1.25rem;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.04);
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .dark .dc-order-card {
        background: rgba(30, 41, 59, 0.6);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.35);
      }

      .dc-order-card:hover {
        border-color: #10b981;
        box-shadow: 0 8px 24px -4px rgba(16, 185, 129, 0.16);
        transform: translateY(-1.5px);
      }

      .dc-btn-invoice {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.55rem 1rem;
        font-size: 0.75rem;
        font-weight: 800;
        color: #065f46;
        background: #ffffff;
        border: 1.5px solid #10b981;
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }

      .dark .dc-btn-invoice {
        background: #0f172a;
        color: #34d399;
        border-color: #10b981;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      }

      .dc-btn-invoice:hover {
        background: #ecfdf5;
        color: #047857;
        border-color: #059669;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
      }

      .dark .dc-btn-invoice:hover {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
      }

      .dc-btn-track {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.55rem 1.05rem;
        font-size: 0.75rem;
        font-weight: 800;
        color: #ffffff !important;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: 1.5px solid #059669;
        border-radius: 12px;
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.28);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
      }

      .dark .dc-btn-track {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-color: rgba(52, 211, 153, 0.5);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
      }

      .dc-btn-track:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(5, 150, 105, 0.4);
      }
    </style>

    <div class="dc-cust-dashboard">
      
      <!-- TOP HEADER CARD: Profile & Quick Actions -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/95 dark:border-slate-800 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        <div class="flex items-center gap-4 min-w-0">
          <div class="dc-avatar flex-shrink-0 overflow-hidden relative border border-emerald-500/40">
            ${userPhoto ? `
              <img src="${userPhoto}" alt="${user.name || 'User'}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='${initial}';" />
            ` : initial}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                ${isAuth ? (user.name || 'সম্মানিত গ্রাহক') : 'সম্মানিত ভিজিটর / গেস্ট'}
              </h1>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${isAuth ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'}">
                <span class="w-1.5 h-1.5 rounded-full ${isAuth ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
                ${isAuth ? 'ভেরিফায়েড কাস্টমার' : 'গেস্ট মোড'}
              </span>
            </div>
            
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>📞 ${user.mobile || user.phone || 'ফোন যুক্ত করুন'}</span>
              <span>•</span>
              <span>✉️ ${user.mail || user.email || 'ইমেইল যুক্ত করুন'}</span>
              <span>•</span>
              <span class="truncate">📍 ${user.address || 'বাংলাদেশ'}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 self-stretch sm:self-end md:self-center justify-end">
          <a 
            href="/products" 
            class="btn-primary py-2.5 px-4 sm:px-5 text-xs font-bold rounded-xl shadow-glow flex items-center gap-2 transition"
          >
            <span>🛍️</span>
            <span>শপ ভিজিট করুন</span>
          </a>

          ${isAuth ? `
            <button 
              id="btn-edit-customer-profile"
              class="btn-secondary py-2.5 px-3.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition"
              onclick="document.getElementById('customer-profile-edit-modal').classList.add('active');"
            >
              প্রোফাইল এডিট ✎
            </button>
            <button 
              id="btn-customer-logout" 
              class="btn-secondary btn-logout py-2.5 px-3.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            >
              লগআউট ✕
            </button>
          ` : `
            <a 
              href="/customer/login"
              class="btn-secondary py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition inline-flex items-center gap-1.5"
            >
              <span>🔐</span>
              <span>লগইন / সাইন-আপ</span>
            </a>
          `}

        </div>

      </div>

      <!-- GUEST ALERT CARD (If not logged in) -->
      ${!isAuth ? `
        <div class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <span class="text-2xl flex-shrink-0">💡</span>
            <div>
              <h4 class="font-bold text-amber-900 dark:text-amber-200 text-sm">
                আপনি গেস্ট মোডে ড্যাশবোর্ড দেখছেন!
              </h4>
              <p class="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                আপনার কার্ট ও পছন্দের তালিকা নিচে ব্রাউজারে সক্রিয় আছে। অর্ডার হিস্ট্রি ক্লাউডে সেভ রাখতে অনুগ্রহ করে লগইন বা একাউন্ট তৈরি করুন।
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <a 
              href="/customer/login"
              class="btn-primary py-1.5 px-3.5 text-xs font-bold rounded-lg shadow-xs inline-flex items-center gap-1"
            >
              লগইন করুন →
            </a>
          </div>
        </div>
      ` : ''}

      <!-- MAIN LAYOUT: SIDEBAR + CONTENT TABS -->
      <div class="dc-cust-grid">
        
        <aside class="dc-cust-sidebar">
          
          <div class="dc-sidebar-profile">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-base overflow-hidden flex-shrink-0 border border-emerald-300/40">
              ${userPhoto ? `
                <img src="${userPhoto}" alt="${user.name || 'User'}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='👤';" />
              ` : `👤`}
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                ${user.name || (isAuth ? 'আমার অ্যাকাউন্ট' : 'গেস্ট ইউজার')}
              </div>
              <div class="text-[10px] text-slate-400 font-mono">
                ${user.mobile || user.phone || '01XXXXXXXXX'}
              </div>
            </div>
          </div>

          <nav class="dc-nav-list" aria-label="Customer Navigation">
            <button class="dc-nav-item active" onclick="switchCustomerTab('tab-overview', this)">
              <span class="flex items-center gap-2"><span>📊</span> ওভারভিউ</span>
              <span class="text-[10px] text-emerald-600">●</span>
            </button>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-orders', this)">
              <span class="flex items-center gap-2"><span>📦</span> আমার অর্ডারসমূহ</span>
              <span class="dc-badge-count" id="badge-orders-count">${totalOrders}</span>
            </button>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-track', this)">
              <span class="flex items-center gap-2"><span>🚚</span> অর্ডার ট্র্যাকিং</span>
              <span class="text-[11px] text-blue-500 font-bold">লাইভ</span>
            </button>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-cart', this)">
              <span class="flex items-center gap-2"><span>🛒</span> কার্ট তালিকা</span>
              <span class="dc-badge-count" id="badge-cart-count">${cartItems.length}</span>
            </button>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-fav', this)">
              <span class="flex items-center gap-2"><span>❤️</span> পছন্দের তালিকা</span>
              <span class="dc-badge-count" id="badge-fav-count">${favItems.length}</span>
            </button>

            <a href="/products" class="dc-nav-item text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-extrabold">
              <span class="flex items-center gap-2"><span>🛍️</span> শপ ভিজিট করুন</span>
              <span class="text-xs">→</span>
            </a>

            <button class="dc-nav-item" onclick="switchCustomerTab('tab-settings', this)">
              <span class="flex items-center gap-2"><span>⚙️</span> সেটিংস ও প্রোফাইল</span>
            </button>
          </nav>

          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-[11px] space-y-1.5">
            <div class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>💬</span> কাস্টমার সাপোর্ট
            </div>
            <a href="https://wa.me/8801581703822" target="_blank" class="block text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              হোয়াটসঅ্যাপ: 01581703822
            </a>
            <div class="text-slate-500 dark:text-slate-400 text-[10px]">
              সরাসরি কল: 01818273838
            </div>
          </div>

        </aside>

        <main class="space-y-6 min-w-0">
          
          <!-- TAB 1: OVERVIEW -->
          <div id="tab-overview" class="customer-tab-content space-y-6">
            
            <div class="dc-kpi-grid">
              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>মোট অর্ডার</span>
                  <span class="text-base">📦</span>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-white mt-2">${totalOrders} টি</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">সর্বমোট অর্ডারের হিসাব</div>
              </div>

              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>চলমান অর্ডার</span>
                  <span class="text-base">⏳</span>
                </div>
                <div class="text-2xl font-black text-amber-500 mt-2">${pendingOrders} টি</div>
                <div class="text-[10px] text-amber-600 font-bold mt-1">প্রসেসিং ও শিপমেন্টে</div>
              </div>

              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>সফল ডেলিভারি</span>
                  <span class="text-base">🚚</span>
                </div>
                <div class="text-2xl font-black text-emerald-600 mt-2">${deliveredOrders} টি</div>
                <div class="text-[10px] text-emerald-600 font-bold mt-1">গৃহীত পণ্য</div>
              </div>

              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>কার্ট আইটেম</span>
                  <span class="text-base">🛒</span>
                </div>
                <div class="text-2xl font-black text-blue-600 mt-2">${cartItems.length} টি</div>
                <div class="text-[10px] text-slate-500 mt-1">মূল্য: ${formatCurrency(cartSubtotal)}</div>
              </div>

              <div class="dc-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>পছন্দের তালিকা</span>
                  <span class="text-base">❤️</span>
                </div>
                <div class="text-2xl font-black text-rose-500 mt-2">${favItems.length} টি</div>
                <div class="text-[10px] text-rose-500 font-bold mt-1">উইশলিস্টে সংরক্ষিত</div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div class="space-y-1">
                <h3 class="text-base sm:text-lg font-black">আমাদের বিশাল কালেকশন থেকে এখনই অর্ডার করুন!</h3>
                <p class="text-xs text-emerald-100/80">স্মার্টওয়াচ, হেলথ ফুড, লাইটিং ও কিচেন গ্যাজেটে ক্যাশ অন ডেলিভারি অফার।</p>
              </div>
              <a href="/products" class="btn-primary py-2.5 px-6 font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl flex-shrink-0 transition">
                শপ ব্রাউজ করুন →
              </a>
            </div>

            <div class="dc-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📦</span> সাম্প্রতিক অর্ডারসমূহ (Recent Orders)
                </h3>
                <button class="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline" onclick="switchCustomerTab('tab-orders')">
                  সবগুলো দেখুন (${orders.length}) →
                </button>
              </div>

              ${orders.length === 0 ? `
                <div class="py-10 text-center space-y-3">
                  <div class="text-3xl">🛍️</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">
                    আপনার কোনো পূর্ববর্তী অর্ডার রেকর্ড পাওয়া যায়নি।
                  </div>
                  <a href="/products" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl inline-block">
                    কেনাকাটা শুরু করুন
                  </a>
                </div>
              ` : `
                <div class="space-y-3">
                  ${orders.slice(0, 3).map(o => {
                    const st = String(o.order_status || 'Pending').toLowerCase();
                    let stBadge = 'badge-warning';
                    if (['delivered', 'completed'].includes(st)) stBadge = 'badge-success';
                    if (['cancelled', 'returned'].includes(st)) stBadge = 'badge-danger';
                    if (['processing', 'in transit', 'shipping'].includes(st)) stBadge = 'badge-info';

                    const productName = extractOrderProductName(o);
                    const orderQty = extractOrderQuantity(o);

                    return `
                    <div class="dc-order-card customer-order-item" data-status="${st}">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                        <div class="flex items-center gap-2.5 flex-wrap">
                          <span class="font-mono font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            #${o.order_id}
                          </span>
                          <span class="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <span>📅</span> ${o.date || 'আজকের অর্ডার'}
                          </span>
                        </div>
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="badge ${o.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'} text-[10px] font-bold">
                            ${o.payment_status === 'Paid' ? '✓ পরিশোধিত (Paid)' : (o.payment_method || 'ক্যাশ অন ডেলিভারি')}
                          </span>
                          <span class="badge ${stBadge} text-[10px] font-extrabold uppercase">
                            ${o.order_status || 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center text-xs">
                        <div class="sm:col-span-5 min-w-0 space-y-1">
                          <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <span>🛍️</span> <span>প্রোডাক্ট এর নাম</span>
                          </div>
                          <div class="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug" title="${productName}">
                            ${productName}
                          </div>
                          <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-0.5">
                            <span>📍</span> <span class="truncate">${o.address || 'বাংলাদেশ'}</span>
                          </div>
                        </div>

                        <div class="sm:col-span-2 sm:text-center space-y-1">
                          <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center sm:justify-center gap-1">
                            <span>🔢</span> <span>অর্ডার কোয়ান্টিটি</span>
                          </div>
                          <div class="inline-flex sm:flex items-center justify-start sm:justify-center">
                            <span class="font-mono font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                              ${orderQty} টি
                            </span>
                          </div>
                        </div>

                        <div class="sm:col-span-2 space-y-1">
                          <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <span>💰</span> <span>মোট দাম</span>
                          </div>
                          <div class="text-base font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                            ${formatCurrency(o.total_amount || 0)}
                          </div>
                          <div class="text-[10px] text-slate-400 font-medium">
                            ${o.delivery_fee ? `ডেলিভারি: ${formatCurrency(o.delivery_fee)}` : 'ডেলিভারি অন্তর্ভুক্ত'}
                          </div>
                        </div>

                        <div class="sm:col-span-3 flex sm:flex-col gap-2 justify-end sm:items-end pt-1 sm:pt-0">
                          <a href="/order-success?orderId=${o.order_id}" class="dc-btn-invoice w-full sm:w-auto text-center" title="ইনভয়েস বা ভাউচার প্রিন্ট করুন">
                            <span>🖨️</span> <span>ভাউচার / ইনভয়েস</span>
                          </a>
                          <a href="/track?orderId=${o.order_id}" class="dc-btn-track w-full sm:w-auto text-center" title="অর্ডার লাইভ ট্র্যাক করুন">
                            <span>🚚</span> <span>লাইভ ট্র্যাক</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  `;
                  }).join("")}
                </div>
              `}
            </div>

            ${favItems.length > 0 ? `
              <div class="dc-panel space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>❤️</span> আপনার পছন্দের পণ্য (Saved Favourites)
                  </h3>
                  <button class="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline" onclick="switchCustomerTab('tab-fav')">
                    সকল ফেভারিট (${favItems.length}) →
                  </button>
                </div>

                <div class="product-grid">
                  ${favItems.slice(0, 4).map(p => renderProductCard(p)).join("")}
                </div>
              </div>
            ` : ''}

          </div>

          <!-- TAB 2: FULL DETAILS ORDER LIST -->
          <div id="tab-orders" class="customer-tab-content hidden space-y-4">
            
            <div class="dc-panel space-y-4">
              
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📦</span> আমার অর্ডারসমূহ (Order History & Invoices)
                  </h3>
                  <p class="text-xs text-slate-500">আপনার সমস্ত অতীত ও চলমান অর্ডারের বিস্তারিত তথ্য ও ক্যাশ অন ডেলিভারি স্ট্যাটাস।</p>
                </div>

                <div class="relative w-full md:w-72">
                  <input 
                    type="text" 
                    id="order-search-input"
                    placeholder="অর্ডার আইডি বা পণ্য খুঁজুন..." 
                    class="form-control text-xs py-2 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full dark:bg-slate-800"
                    oninput="window.filterCustomerOrders(this.value)"
                  />
                  <span class="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
                </div>
              </div>

              <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button class="dc-filter-btn active" data-status="all" onclick="window.filterCustomerOrderStatus('all', this)">সবগুলো (${orders.length})</button>
                <button class="dc-filter-btn" data-status="pending" onclick="window.filterCustomerOrderStatus('pending', this)">পেন্ডিং (${pendingOrders})</button>
                <button class="dc-filter-btn" data-status="delivered" onclick="window.filterCustomerOrderStatus('delivered', this)">ডেলিভার্ড (${deliveredOrders})</button>
                <button class="dc-filter-btn" data-status="cancelled" onclick="window.filterCustomerOrderStatus('cancelled', this)">বাতিল (${cancelledOrders})</button>
              </div>

              ${orders.length === 0 ? `
                <div class="py-14 text-center space-y-3">
                  <div class="text-4xl">📦</div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো অর্ডার রেকর্ড পাওয়া যায়নি</div>
                  <p class="text-xs text-slate-400 max-w-sm mx-auto">
                    গেস্ট হিসেবে অর্ডার করে থাকলে আপনার ফোন নম্বর দিয়ে ট্র্যাকিং ট্যাবে গিয়ে দ্রুত চেক করুন অথবা নতুন অর্ডার করুন।
                  </p>
                  
                  <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <a href="/products" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl shadow-xs">
                      🛍️ শপ ভিজিট করুন
                    </a>
                  </div>
                </div>
              ` : `
                <div class="space-y-3.5" id="customer-orders-container">
                  ${orders.map(o => {
                    const st = String(o.order_status || 'Pending').toLowerCase();
                    let stBadge = 'badge-warning';
                    if (['delivered', 'completed'].includes(st)) stBadge = 'badge-success';
                    if (['cancelled', 'returned'].includes(st)) stBadge = 'badge-danger';
                    if (['processing', 'in transit', 'shipping'].includes(st)) stBadge = 'badge-info';

                    const productName = extractOrderProductName(o);
                    const orderQty = extractOrderQuantity(o);

                    return `
                      <div class="dc-order-card customer-order-item" data-status="${st}" data-search="${(o.order_id + ' ' + productName + ' ' + (o.phone || '')).toLowerCase()}">
                        
                        <!-- Order Card Header -->
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                          <div class="flex items-center gap-2.5 flex-wrap">
                            <span class="font-mono font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              #${o.order_id}
                            </span>
                            <span class="text-xs text-slate-500 font-medium flex items-center gap-1">
                              <span>📅</span> ${o.date || 'আজকের অর্ডার'}
                            </span>
                          </div>
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="badge ${o.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'} text-[10px] font-bold">
                              ${o.payment_status === 'Paid' ? '✓ পরিশোধিত (Paid)' : (o.payment_method || 'ক্যাশ অন ডেলিভারি')}
                            </span>
                            <span class="badge ${stBadge} text-[10px] font-extrabold uppercase">
                              ${o.order_status || 'Pending'}
                            </span>
                          </div>
                        </div>

                        <!-- Order Card Body Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center text-xs">
                          
                          <!-- Product Name & Address -->
                          <div class="sm:col-span-5 min-w-0 space-y-1">
                            <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <span>🛍️</span> <span>প্রোডাক্ট এর নাম</span>
                            </div>
                            <div class="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug" title="${productName}">
                              ${productName}
                            </div>
                            <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-0.5">
                              <span>📍</span> <span class="truncate">${o.address || 'বাংলাদেশ'}</span>
                            </div>
                          </div>

                          <!-- Order Quantity -->
                          <div class="sm:col-span-2 sm:text-center space-y-1">
                            <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center sm:justify-center gap-1">
                              <span>🔢</span> <span>অর্ডার কোয়ান্টিটি</span>
                            </div>
                            <div class="inline-flex sm:flex items-center justify-start sm:justify-center">
                              <span class="font-mono font-black text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                                ${orderQty} টি
                              </span>
                            </div>
                          </div>

                          <!-- Total Price -->
                          <div class="sm:col-span-2 space-y-1">
                            <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <span>💰</span> <span>মোট দাম</span>
                            </div>
                            <div class="text-base font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                              ${formatCurrency(o.total_amount || 0)}
                            </div>
                            <div class="text-[10px] text-slate-400 font-medium">
                              ${o.delivery_fee ? `ডেলিভারি: ${formatCurrency(o.delivery_fee)}` : 'ডেলিভারি অন্তর্ভুক্ত'}
                            </div>
                          </div>

                          <!-- Coordinated Action Buttons -->
                          <div class="sm:col-span-3 flex sm:flex-col gap-2 justify-end sm:items-end pt-1 sm:pt-0">
                            <a href="/order-success?orderId=${o.order_id}" class="dc-btn-invoice w-full sm:w-auto text-center" title="ইনভয়েস বা ভাউচার প্রিন্ট করুন">
                              <span>🖨️</span> <span>ভাউচার / ইনভয়েস</span>
                            </a>
                            <a href="/track?orderId=${o.order_id}" class="dc-btn-track w-full sm:w-auto text-center" title="অর্ডার লাইভ ট্র্যাক করুন">
                              <span>🚚</span> <span>লাইভ ট্র্যাক</span>
                            </a>
                          </div>

                        </div>

                      </div>
                    `;
                  }).join("")}
                </div>
              `}

            </div>

          </div>

          <!-- TAB 3: LIVE ORDER TRACKING -->
          <div id="tab-track" class="customer-tab-content hidden space-y-4">
            
            <div class="dc-panel space-y-5">
              
              <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚚</span> লাইভ অর্ডার ট্র্যাকিং (Track Your Parcel)
                </h3>
                <p class="text-xs text-slate-500">আপনার অর্ডার আইডি প্রদান করে পার্সেলের তাৎক্ষণিক লাইভ অবস্থান দেখুন।</p>
              </div>

              <div class="flex flex-col sm:flex-row gap-2 max-w-lg">
                <input 
                  type="text" 
                  id="dashboard-track-input"
                  placeholder="যেমন: ORD-102938" 
                  value="${orders[0] ? orders[0].order_id : ''}"
                  class="form-control text-xs py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 flex-1 dark:bg-slate-800 font-mono font-bold"
                />
                <button 
                  type="button" 
                  class="btn-primary py-2.5 px-6 font-bold text-xs rounded-xl shadow-xs"
                  onclick="window.executeDashboardTrack()"
                >
                  ট্র্যাক করুন 🔍
                </button>
              </div>

              <div id="dashboard-track-result" class="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
                  <div>
                    <span class="text-[10px] text-slate-400 font-bold uppercase">অর্ডার আইডি</span>
                    <h4 class="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base" id="track-disp-id">
                      ${orders[0] ? orders[0].order_id : 'ORD-SAMPLE'}
                    </h4>
                  </div>
                  <span class="badge badge-success text-xs font-bold" id="track-disp-status">
                    ${orders[0] ? (orders[0].order_status || 'Processing') : 'Order Placed'}
                  </span>
                </div>

                <div class="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold mx-auto flex items-center justify-center shadow-xs">✓</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">অর্ডার কনফার্মড</div>
                    <div class="text-[9px] text-slate-400">গৃহীত হয়েছে</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold mx-auto flex items-center justify-center shadow-xs">✓</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">প্যাকেজিং</div>
                    <div class="text-[9px] text-slate-400">ওয়্যারহাউজ প্রস্তুত</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-amber-500 text-white font-bold mx-auto flex items-center justify-center shadow-xs animate-pulse">🚚</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">কুরিয়ারে হস্তান্তর</div>
                    <div class="text-[9px] text-amber-600">পথে রয়েছে</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 font-bold mx-auto flex items-center justify-center">4</div>
                    <div class="font-bold text-slate-400 text-[11px]">ডেলিভারি সম্পন্ন</div>
                    <div class="text-[9px] text-slate-400">প্রত্যাশিত ২-৩ দিন</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- TAB 4: MY CART ITEMS -->
          <div id="tab-cart" class="customer-tab-content hidden space-y-4">
            
            <div class="dc-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🛒</span> আপনার কার্টের পণ্যসমূহ (${cartItems.length} টি)
                </h3>
                <a href="/products" class="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  + আরও পণ্য যোগ করুন
                </a>
              </div>

              ${cartItems.length === 0 ? `
                <div class="py-12 text-center space-y-3">
                  <div class="text-4xl">🛒</div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-300">আপনার কার্ট বর্তমানে খালি আছে!</div>
                  <p class="text-xs text-slate-400">আমাদের শপ থেকে আকর্ষণীয় গ্যাজেট ও পণ্য পছন্দ করুন।</p>
                  <a href="/products" class="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl inline-block shadow-glow">
                    🛍️ শপ ভিজিট করুন
                  </a>
                </div>
              ` : `
                <div class="space-y-3">
                  ${cartItems.map(it => {
                    const variantText = (it.color || it.size) ? (String(it.color || '') + ' ' + String(it.size || '')).trim() : '';
                    return `
                    <div class="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs gap-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <img src="${it.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}" class="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                        <div class="min-w-0">
                          <h4 class="font-bold text-slate-900 dark:text-white truncate">${it.name}</h4>
                          <div class="text-[11px] text-slate-500 mt-0.5">
                            মূল্য: ${formatCurrency(it.price || 0)} | পরিমাণ: ${it.quantity} টি
                          </div>
                          ${variantText ? `<span class="badge badge-info text-[9px] mt-1">${variantText}</span>` : ''}
                        </div>
                      </div>
                      <div class="text-right flex-shrink-0">
                        <div class="font-black text-slate-900 dark:text-white text-sm">
                          ${formatCurrency(Number(it.price || 0) * Number(it.quantity || 1))}
                        </div>
                        <a href="/checkout" class="btn-primary text-xs py-1.5 px-3 rounded-lg inline-block mt-1 font-bold">
                          অর্ডার করুন →
                        </a>
                      </div>
                    </div>
                  `;
                  }).join("")}

                  <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">সাবটোটাল</div>
                      <div class="text-lg font-black text-emerald-700 dark:text-emerald-300">${formatCurrency(cartSubtotal)}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <a href="/cart" class="btn-secondary py-2 px-4 text-xs font-bold rounded-xl">সম্পূর্ণ কার্ট ভিউ</a>
                      <a href="/checkout" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl shadow-glow">চেকআউট করুন →</a>
                    </div>
                  </div>
                </div>
              `}

            </div>

          </div>

          <!-- TAB 5: FAVOURITES -->
          <div id="tab-fav" class="customer-tab-content hidden space-y-4">
            
            <div class="dc-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>❤️</span> আপনার পছন্দের তালিকাভুক্ত পণ্য (${favItems.length} টি)
                </h3>
                <a href="/products" class="btn-primary py-1.5 px-3.5 text-xs font-bold rounded-xl">
                  🛍️ শপ ভিজিট করুন
                </a>
              </div>

              ${favItems.length === 0 ? `
                <div class="py-12 text-center space-y-3">
                  <div class="text-4xl">❤️</div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো পছন্দের পণ্য যোগ করা হয়নি!</div>
                  <p class="text-xs text-slate-400">পছন্দের গ্যাজেটে হার্ট (❤️) আইকনে ক্লিক করে তালিকায় যুক্ত করুন।</p>
                  <a href="/products" class="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl inline-block shadow-glow">
                    শপ থেকে পণ্য দেখুন →
                  </a>
                </div>
              ` : `
                <div class="product-grid">
                  ${favItems.map(p => renderProductCard(p)).join("")}
                </div>
              `}
            </div>

          </div>

          <!-- TAB 6: SETTINGS -->
          <div id="tab-settings" class="customer-tab-content hidden space-y-4">
            
            <div class="dc-panel max-w-xl mx-auto space-y-4 text-xs">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚙️</span> অ্যাকাউন্ট সেটিংস ও প্রোফাইল তথ্য
                </h3>
                <p class="text-xs text-slate-500">আপনার নাম, প্রোফাইল ছবি, ইমেইল এবং ডিফল্ট ডেলিভারি ঠিকানা হালনাগাদ করুন।</p>
              </div>

              <form id="settings-profile-form" onsubmit="window.updateCustomerProfile(event, 'settings');" class="space-y-4">
                <!-- Profile Photo with Live Preview & Upload -->
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">প্রোফাইল ছবি</label>
                  <div class="flex items-center gap-3">
                    <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <img 
                        id="settings-c-photo-preview" 
                        src="${userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160'}" 
                        alt="Profile Preview" 
                        class="w-full h-full object-cover"
                        onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160';"
                      />
                    </div>
                    <div class="flex-1 min-w-0">
                      <input 
                        type="url" 
                        id="settings-c-photo" 
                        value="${userPhoto}" 
                        placeholder="ছবির লিংক দিন বা আপলোড করুন" 
                        class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" 
                      />
                    </div>
                    <button 
                      type="button" 
                      class="btn-secondary py-2 px-3 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer flex-shrink-0"
                      onclick="document.getElementById('settings-c-photo-file-input').click();"
                      title="ডিভাইস থেকে ছবি নির্বাচন করুন"
                    >
                      <span>📁</span> <span>আপলোড</span>
                    </button>
                    <input type="file" id="settings-c-photo-file-input" accept="image/*" class="hidden" />
                  </div>
                </div>

                <!-- Name -->
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম *</label>
                  <input type="text" id="settings-c-name" value="${user.name || ''}" class="form-control text-xs w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800" required placeholder="আপনার নাম" />
                </div>

                <!-- Email -->
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল ঠিকানা</label>
                  <input type="email" id="settings-c-mail" value="${user.mail || user.email || ''}" class="form-control text-xs w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800" placeholder="name@example.com" />
                </div>

                <!-- Phone (readonly info) -->
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">মোবাইল নম্বর (প্রধান)</label>
                  <input type="tel" value="${user.mobile || user.phone || ''}" readonly class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-mono text-slate-500 cursor-not-allowed select-none" />
                </div>

                <!-- Address -->
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ডিফল্ট ডেলিভারি ঠিকানা</label>
                  <textarea id="settings-c-addr" rows="3" class="form-control text-xs w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800" placeholder="বাসা/হোল্ডিং নং, রোড, থানা, জেলা...">${user.address || ''}</textarea>
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn-primary py-2.5 px-6 font-bold text-xs rounded-xl shadow-xs">
                    তথ্য সংরক্ষণ করুন ✓
                  </button>
                </div>
              </form>
            </div>

          </div>

        </main>

      </div>

    </div>

    <!-- EDIT PROFILE MODAL -->
    <div id="customer-profile-edit-modal" class="modal-backdrop">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>👤</span> প্রোফাইল সম্পাদনা করুন
          </h3>
          <button type="button" class="text-slate-400 hover:text-slate-600 font-bold" onclick="document.getElementById('customer-profile-edit-modal').classList.remove('active');">✕</button>
        </div>
        
        <form id="customer-profile-edit-form" onsubmit="window.updateCustomerProfile(event, 'modal');" class="space-y-3.5">
          <!-- Profile Photo with Live Preview & Upload -->
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">প্রোফাইল ছবি</label>
            <div class="flex items-center gap-3">
              <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm flex-shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <img 
                  id="edit-c-photo-preview" 
                  src="${userPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160'}" 
                  alt="Profile" 
                  class="w-full h-full object-cover"
                  onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160';"
                />
              </div>
              <div class="flex-1 min-w-0">
                <input 
                  type="url" 
                  id="edit-c-photo" 
                  value="${userPhoto}" 
                  placeholder="ছবির লিংক দিন বা আপলোড করুন" 
                  class="form-control text-xs w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" 
                />
              </div>
              <button 
                type="button" 
                class="btn-secondary py-2 px-3 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer flex-shrink-0"
                onclick="document.getElementById('edit-c-photo-file-input').click();"
                title="ডিভাইস থেকে ছবি আপলোড করুন"
              >
                <span>📁</span> <span>আপলোড</span>
              </button>
              <input type="file" id="edit-c-photo-file-input" accept="image/*" class="hidden" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম *</label>
            <input type="text" id="edit-c-name" value="${user.name || ''}" class="form-control text-xs w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" required placeholder="আপনার নাম" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল</label>
            <input type="email" id="edit-c-mail" value="${user.mail || user.email || ''}" class="form-control text-xs w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" placeholder="name@example.com" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ঠিকানা</label>
            <textarea id="edit-c-addr" rows="2" class="form-control text-xs w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800" placeholder="বাসা/হোল্ডিং নং, রোড, থানা, জেলা...">${user.address || ''}</textarea>
          </div>
          <button type="submit" class="btn-primary w-full py-2.5 font-bold rounded-xl mt-2 shadow-md">তথ্য আপডেট সম্পন্ন করুন ✓</button>
        </form>
      </div>
    </div>
  `;
}

function renderAuthView(view = 'login') {
  const isRegister = view === 'register';

  // Auto-generate Unique Customer ID (Column A)
  const generatedCustomerId = 'CUST-' + Math.floor(100000 + Math.random() * 900000);

  return `
    <style id="dc-customer-auth-styles">
      .dc-auth-wrapper {
        min-height: calc(100vh - 180px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        position: relative;
        overflow: hidden;
      }

      .dc-auth-glow-1 {
        position: absolute;
        top: -80px;
        left: 50%;
        transform: translateX(-50%);
        width: 600px;
        height: 380px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(5, 150, 105, 0.05) 50%, transparent 70%);
        filter: blur(60px);
        pointer-events: none;
        z-index: 0;
      }

      .dc-auth-glow-2 {
        position: absolute;
        bottom: -60px;
        right: 15%;
        width: 480px;
        height: 320px;
        background: radial-gradient(circle, rgba(13, 148, 136, 0.14) 0%, rgba(14, 165, 233, 0.04) 50%, transparent 70%);
        filter: blur(50px);
        pointer-events: none;
        z-index: 0;
      }

      .dc-auth-card {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 500px;
        background: #ffffff;
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 28px;
        padding: 2.25rem 2rem;
        box-shadow: 0 20px 45px -10px rgba(5, 150, 105, 0.1), 0 10px 25px -5px rgba(0, 0, 0, 0.03);
        box-sizing: border-box;
      }

      .dark .dc-auth-card {
        background: #0f172a;
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.55);
      }

      @media (max-width: 640px) {
        .dc-auth-card {
          padding: 1.5rem 1.25rem;
          border-radius: 22px;
        }
      }

      .dc-brand-ring {
        width: 60px;
        height: 60px;
        border-radius: 20px;
        background: #ffffff;
        border: 2px solid #10b981;
        padding: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
        margin: 0 auto;
        position: relative;
      }

      .dark .dc-brand-ring {
        background: #1e293b;
        border-color: #10b981;
      }

      .dc-pulse-dot {
        position: absolute;
        top: -3px;
        right: -3px;
        width: 12px;
        height: 12px;
        border-radius: 9999px;
        background: #10b981;
        border: 2px solid #ffffff;
        box-shadow: 0 0 10px #10b981;
        animation: pulse 2s infinite;
      }

      .dc-auth-tabs {
        display: flex;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        margin-bottom: 1.5rem;
        gap: 4px;
      }

      .dark .dc-auth-tabs {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.08);
      }

      .dc-auth-tab-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.625rem 1rem;
        font-size: 0.8125rem;
        font-weight: 700;
        border-radius: 12px;
        color: #64748b;
        text-decoration: none;
        transition: all 0.2s ease;
        cursor: pointer;
        border: none;
        background: transparent;
      }

      .dark .dc-auth-tab-btn {
        color: #94a3b8;
      }

      .dc-auth-tab-btn.active {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: #ffffff !important;
        box-shadow: 0 4px 14px rgba(5, 150, 105, 0.32);
        font-weight: 800;
      }

      .dc-field-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        margin-bottom: 1rem;
        text-align: left;
      }

      .dc-field-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.75rem;
        font-weight: 700;
        color: #334155;
      }

      .dark .dc-field-label {
        color: #cbd5e1;
      }

      .dc-input-container {
        position: relative;
        display: flex;
        align-items: center;
      }

      .dc-input-icon {
        position: absolute;
        left: 0.875rem;
        font-size: 1.05rem;
        color: #94a3b8;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dc-input-field {
        width: 100%;
        padding: 0.75rem 2.5rem 0.75rem 2.65rem;
        font-size: 0.875rem;
        font-family: inherit;
        color: #0f172a;
        background: #ffffff;
        border: 1.5px solid #e2e8f0;
        border-radius: 14px;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .dark .dc-input-field {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.1);
        color: #f8fafc;
      }

      .dc-country-select {
        height: 42px;
        font-size: 0.75rem;
        font-weight: 700;
        color: #0f172a;
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 14px;
        padding: 0 0.5rem;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .dark .dc-country-select {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.1);
        color: #f8fafc;
      }

      .dc-country-select:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
      }

      .dc-input-field:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
      }

      .dark .dc-input-field:focus {
        background: #0f172a;
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
      }

      .dc-textarea-field {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.65rem;
        font-size: 0.875rem;
        font-family: inherit;
        color: #0f172a;
        background: #ffffff;
        border: 1.5px solid #e2e8f0;
        border-radius: 14px;
        outline: none;
        resize: vertical;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .dark .dc-textarea-field {
        background: #1e293b;
        border-color: rgba(255, 255, 255, 0.1);
        color: #f8fafc;
      }

      .dc-textarea-field:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
      }

      .dark .dc-textarea-field:focus {
        background: #0f172a;
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
      }

      .dc-pass-toggle {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #64748b;
        font-size: 1.15rem;
        padding: 0.25rem 0.375rem;
        cursor: pointer;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dc-pass-toggle:hover {
        color: #059669;
      }

      .dc-strength-track {
        height: 5px;
        width: 100%;
        background: #e2e8f0;
        border-radius: 9999px;
        overflow: hidden;
      }

      .dark .dc-strength-track {
        background: #334155;
      }

      .dc-strength-fill {
        height: 100%;
        width: 0%;
        border-radius: 9999px;
        transition: width 0.25s ease, background-color 0.25s ease;
      }

      .dc-auth-submit-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.625rem;
        padding: 0.85rem 1.5rem;
        font-size: 0.9375rem;
        font-weight: 800;
        color: #ffffff;
        background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%);
        border: none;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3);
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 0.5rem;
      }

      .dc-auth-submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(5, 150, 105, 0.4);
      }

      .dc-auth-submit-btn:disabled {
        opacity: 0.75;
        cursor: not-allowed;
        transform: none;
      }
    </style>

    <div class="dc-auth-wrapper">
      
      <!-- Ambient Glow Overlays -->
      <div class="dc-auth-glow-1"></div>
      <div class="dc-auth-glow-2"></div>

      <!-- Main Auth Card Container -->
      <div class="dc-auth-card">
        
        <!-- Header Branding & Logo -->
        <div class="text-center space-y-2 mb-5">
          <div class="dc-brand-ring">
            <span class="dc-pulse-dot"></span>
            <img 
              src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
              alt="Dream Cart BD Logo" 
              class="w-full h-full object-contain rounded-xl"
              onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
            />
          </div>

          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ${isRegister ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'কাস্টমার লগইন'}
            </h1>
          </div>
        </div>

        <!-- Segmented Tab Switcher (Login vs Register) -->
        <div class="dc-auth-tabs">
          <a 
            href="/customer/login" 
            class="dc-auth-tab-btn ${!isRegister ? 'active' : ''}"
          >
            <span>🔐</span>
            <span>লগইন করুন</span>
          </a>
          <a 
            href="/customer/register" 
            class="dc-auth-tab-btn ${isRegister ? 'active' : ''}"
          >
            <span>📝</span>
            <span>নতুন অ্যাকাউন্ট</span>
          </a>
        </div>

        <!-- Dynamic Inline Error Alert Box -->
        <div id="auth-error-alert" class="hidden mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
          <span class="text-base flex-shrink-0">⚠️</span>
          <div id="auth-error-msg" class="flex-1 font-semibold leading-relaxed"></div>
        </div>

        <!-- The Main Submission Form -->
        <form id="customer-auth-form" data-auth-mode="${isRegister ? 'register' : 'login'}">
          
          ${isRegister ? `
            <!-- ================= REGISTER FIELDS (COLUMNS A TO H) ================= -->

            <!-- Column A = Customer_ID (auto fillup, unique) -->
            <div class="dc-field-group">
              <label class="dc-field-label">
                <span>কাস্টমার আইডি</span>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">অটো ফিলআপ</span>
              </label>
              <div class="dc-input-container">
                <span class="dc-input-icon">🏷️</span>
                <input 
                  type="text" 
                  id="auth-customer-id" 
                  name="customer_id"
                  value="${generatedCustomerId}" 
                  readonly 
                  class="dc-input-field font-mono font-bold bg-slate-50 dark:bg-slate-800/60 text-emerald-600 dark:text-emerald-400 cursor-not-allowed select-none" 
                />
              </div>
            </div>

            <!-- Column B = Profile_photo (File Upload / Link with Live Preview - REQUIRED) -->
            <div class="dc-field-group">
              <label class="dc-field-label">
                <span>প্রোফাইল ছবি</span>
                <span class="text-rose-500 font-bold">*</span>
              </label>
              <div class="flex items-center gap-2">
                <div class="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-xs">
                  <img 
                    id="auth-photo-preview" 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160" 
                    alt="Profile" 
                    class="w-full h-full object-cover"
                    onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
                  />
                </div>
                <div class="dc-input-container flex-1 min-w-0">
                  <span class="dc-input-icon">🔗</span>
                  <input 
                    type="url" 
                    id="auth-photo" 
                    required
                    value="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160"
                    placeholder="ছবির লিঙ্ক দিন বা আপলোড করুন" 
                    class="dc-input-field text-xs" 
                  />
                </div>
                <button 
                  type="button" 
                  class="py-2.5 px-3 text-xs font-bold rounded-xl flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition"
                  onclick="document.getElementById('auth-photo-file-input').click();"
                  title="ডিভাইস থেকে ছবি আপলোড করুন"
                >
                  <span>📁</span>
                  <span class="hidden sm:inline">আপলোড</span>
                </button>
                <input 
                  type="file" 
                  id="auth-photo-file-input" 
                  accept="image/*" 
                  class="hidden" 
                />
              </div>
            </div>

            <!-- Column C = Name (Required) -->
            <div class="dc-field-group">
              <label class="dc-field-label">
                <span>পূর্ণ নাম</span>
                <span class="text-rose-500 font-bold">*</span>
              </label>
              <div class="dc-input-container">
                <span class="dc-input-icon">👤</span>
                <input 
                  type="text" 
                  id="auth-name" 
                  required 
                  placeholder="যেমন: মোঃ তানভীর হাসান" 
                  class="dc-input-field" 
                />
              </div>
            </div>

            <!-- Column D = Mobile (Required, with Country Code selector, Bangladesh default) -->
            <div class="dc-field-group">
              <label class="dc-field-label">
                <span>মোবাইল নম্বর</span>
                <span class="text-rose-500 font-bold">*</span>
              </label>
              <div class="flex items-center gap-2">
                <!-- Country Code Selector (Default: Bangladesh +880) -->
                <div class="relative flex-shrink-0">
                  <select 
                    id="auth-country-code" 
                    class="dc-country-select"
                    title="কান্ট্রি কোড নির্বাচন করুন"
                  >
                    <option value="+880" selected>🇧🇩 +880 (বাংলাদেশ)</option>
                    <option value="+91">🇮🇳 +91 (ভারত)</option>
                    <option value="+966">🇸🇦 +966 (সৌদি আরব)</option>
                    <option value="+971">🇦🇪 +971 (সংযুক্ত আরব আমিরাত)</option>
                    <option value="+974">🇶🇦 +974 (কাতার)</option>
                    <option value="+965">🇰🇼 +965 (কুয়েত)</option>
                    <option value="+968">🇴🇲 +968 (ওমান)</option>
                    <option value="+60">🇲🇾 +60 (মালয়েশিয়া)</option>
                    <option value="+65">🇸🇬 +65 (সিঙ্গাপুর)</option>
                    <option value="+44">🇬🇧 +44 (যুক্তরাজ্য)</option>
                    <option value="+1">🇺🇸 +1 (যুক্তরাষ্ট্র)</option>
                  </select>
                </div>
                <!-- Mobile Number Input -->
                <div class="dc-input-container flex-1 min-w-0">
                  <span class="dc-input-icon">📞</span>
                  <input 
                    type="tel" 
                    id="auth-phone" 
                    required 
                    pattern="[0-9]{11}" 
                    placeholder="017XXXXXXXX (১১ ডিজিট)" 
                    class="dc-input-field font-mono" 
                  />
                </div>
              </div>
            </div>

            <!-- Column E = Mail (Email, Optional) -->
            <div class="dc-field-group">
              <label class="dc-field-label">
                <span>ইমেইল ঠিকানা</span>
                <span class="text-slate-400 text-[10px]">(ঐচ্ছিক)</span>
              </label>
              <div class="dc-input-container">
                <span class="dc-input-icon">✉️</span>
                <input 
                  type="email" 
                  id="auth-mail" 
                  placeholder="name@example.com" 
                  class="dc-input-field" 
                />
              </div>
            </div>

            <!-- Column F = Address (Delivery Address, Required) -->
            <div class="dc-field-group">
              <label class="dc-field-label">
                <span>ডেলিভারি ঠিকানা</span>
                <span class="text-rose-500 font-bold">*</span>
              </label>
              <div class="dc-input-container">
                <span class="dc-input-icon" style="top: 14px;">📍</span>
                <textarea 
                  id="auth-addr" 
                  required 
                  rows="2" 
                  placeholder="বাসা/হোল্ডিং নং, রোড, থানা, জেলা..." 
                  class="dc-textarea-field"
                ></textarea>
              </div>
            </div>

            <!-- Column G = User_ID (Autofill in real-time from phone number) -->
            <div class="dc-field-group">
              <label class="dc-field-label">
                <span>ইউজার আইডি</span>
                <span class="text-[10px] text-blue-600 dark:text-blue-400 font-bold">মোবাইল থেকে অটো ফিল</span>
              </label>
              <div class="dc-input-container">
                <span class="dc-input-icon">🆔</span>
                <input 
                  type="text" 
                  id="auth-user-id" 
                  name="user_id"
                  readonly 
                  placeholder="মোবাইল নম্বর লিখলে স্বয়ংক্রিয় বসবে" 
                  class="dc-input-field font-mono font-bold bg-slate-50 dark:bg-slate-800/60 text-blue-600 dark:text-blue-400 cursor-not-allowed select-none" 
                />
              </div>
            </div>

            <!-- Column H = Password (Suggest-Strong + Strength Percentage Meter) -->
            <div class="dc-field-group">
              <div class="flex items-center justify-between mb-0.5">
                <label class="dc-field-label !mb-0 font-bold">
                  <span>পাসওয়ার্ড</span>
                  <span class="text-rose-500 font-bold">*</span>
                </label>
                <button 
                  type="button" 
                  id="btn-suggest-strong-pass"
                  class="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="স্ট্রং পাসওয়ার্ড তৈরি করুন"
                >
                  <span>💡</span> <span>স্ট্রং পাসওয়ার্ড সাজেস্ট</span>
                </button>
              </div>

              <div class="dc-input-container">
                <span class="dc-input-icon">🔑</span>
                <input 
                  type="password" 
                  id="auth-pass" 
                  required 
                  minlength="4"
                  placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড" 
                  class="dc-input-field" 
                />
                <button type="button" class="btn-toggle-auth-pass dc-pass-toggle" data-target="auth-pass" title="পাসওয়ার্ড দেখুন">
                  👁️
                </button>
              </div>

              <!-- Sleek Real-Time Password Strength Meter -->
              <div class="mt-1.5 space-y-1">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-400">শক্তি:</span>
                  <span id="pwd-strength-label" class="font-extrabold text-slate-400">০%</span>
                </div>
                <div class="dc-strength-track">
                  <div id="pwd-strength-bar" class="dc-strength-fill" style="width: 0%; background-color: #94a3b8;"></div>
                </div>
              </div>
            </div>

            <!-- Password Confirmation -->
            <div class="dc-field-group">
              <label class="dc-field-label">
                <span>পাসওয়ার্ড নিশ্চিত করুন</span>
                <span class="text-rose-500 font-bold">*</span>
              </label>
              <div class="dc-input-container">
                <span class="dc-input-icon">🔐</span>
                <input 
                  type="password" 
                  id="auth-confirm-pass" 
                  required 
                  minlength="4"
                  placeholder="একই পাসওয়ার্ড পুনরায় লিখুন" 
                  class="dc-input-field" 
                />
                <button type="button" class="btn-toggle-auth-pass dc-pass-toggle" data-target="auth-confirm-pass" title="পাসওয়ার্ড দেখুন">
                  👁️
                </button>
              </div>
            </div>

            <!-- Terms agreement -->
            <div class="flex items-center gap-2 mb-3 text-xs text-slate-600 dark:text-slate-400">
              <input type="checkbox" id="auth-terms" checked required class="rounded text-emerald-600" />
              <label for="auth-terms" class="cursor-pointer">
                আমি Dream Cart BD-এর <a href="/terms" class="text-emerald-600 font-bold underline">শর্তাবলী</a> মেনে নিচ্ছি।
              </label>
            </div>

          ` : `
            <!-- ================= LOGIN FIELDS ================= -->

            <!-- Mobile / Email / Identifier with Country Code Selector -->
            <div class="dc-field-group">
              <label class="dc-field-label">
                <span>মোবাইল নম্বর অথবা ইমেইল</span>
                <span class="text-rose-500 font-bold">*</span>
              </label>
              <div class="flex items-center gap-2">
                <div class="relative flex-shrink-0">
                  <select 
                    id="login-country-code" 
                    class="dc-country-select"
                    title="কান্ট্রি কোড"
                  >
                    <option value="+880" selected>🇧🇩 +880</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                </div>
                <div class="dc-input-container flex-1 min-w-0">
                  <span class="dc-input-icon">📞</span>
                  <input 
                    type="text" 
                    id="auth-phone" 
                    required 
                    placeholder="017XXXXXXXX বা user@gmail.com" 
                    class="dc-input-field" 
                  />
                </div>
              </div>
            </div>

            <!-- Password -->
            <div class="dc-field-group">
              <label class="dc-field-label">
                <span>পাসওয়ার্ড</span>
                <span class="text-rose-500 font-bold">*</span>
              </label>
              <div class="dc-input-container">
                <span class="dc-input-icon">🔑</span>
                <input 
                  type="password" 
                  id="auth-pass" 
                  required 
                  placeholder="আপনার পাসওয়ার্ড লিখুন" 
                  class="dc-input-field" 
                />
                <button type="button" class="btn-toggle-auth-pass dc-pass-toggle" data-target="auth-pass" title="পাসওয়ার্ড দেখুন">
                  👁️
                </button>
              </div>
            </div>

            <!-- Remember me & Help Link -->
            <div class="flex items-center justify-between text-xs pt-1 pb-2">
              <label class="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input type="checkbox" id="auth-remember" checked class="rounded text-emerald-600" />
                <span>মনে রাখুন</span>
              </label>
              <a 
                href="https://wa.me/8801581703822?text=Dream%20Cart%20BD%20Customer%20Password%20Help" 
                target="_blank" 
                class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </a>
            </div>

          `}

          <!-- SUBMIT CTA BUTTON -->
          <button type="submit" class="dc-auth-submit-btn">
            <span>${isRegister ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}</span>
            <span>→</span>
          </button>

          <!-- Security note -->
          <p class="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2.5">
            🔒 আপনার সকল তথ্য সম্পূর্ণ গোপন ও নিরাপদ থাকবে।
          </p>

        </form>

        <!-- Switch between Login and Register -->
        <div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-2 text-xs">
          ${isRegister ? `
            <p class="text-slate-500 dark:text-slate-400">
              ইতিমধ্যে অ্যাকাউন্ট আছে? 
              <a href="/customer/login" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                এখানে লগইন করুন →
              </a>
            </p>
          ` : `
            <p class="text-slate-500 dark:text-slate-400">
              আপনার কোনো অ্যাকাউন্ট নেই? 
              <a href="/customer/register" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                নতুন অ্যাকাউন্ট খুলুন (ফ্রি) →
              </a>
            </p>
          `}
        </div>

        <!-- Helpful Navigation Shortcuts -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs mt-4">
          <a href="/products" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
            <span>🛍️</span>
            <span>শপ ভিজিট করুন</span>
          </a>
          <a href="/track" class="text-slate-500 hover:text-slate-700 font-semibold">
            🚚 অর্ডার ট্র্যাক
          </a>
          <a href="/contact" class="text-slate-500 hover:text-slate-700 font-semibold">
            📞 যোগাযোগ
          </a>
        </div>

      </div>

    </div>
  `;
}

export const renderCustomerDashboard = renderCustomerPortal;
export const CustomerPortal = renderCustomerPortal;
export default renderCustomerPortal;
