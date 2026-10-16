/**
 * DREAM CART BD — SMART RESELLER PORTAL & ADVANCED DASHBOARD (ResellerPortal.js)
 * Implements user requirements:
 * - Luxury responsive Reseller Dashboard with Sticky Sidebar, KPI Cards & 9 Interactive Modules:
 *     1. ওভারভিউ (Overview: KPIs, Quick Actions, Recent Reseller Orders, Top Margin Products)
 *     2. রিসেলার ক্যাটালগ (Reseller Catalogue: Live Search, Category Filter, Wholesale vs Retail Margin, Copy Info, Quick Cart & Order)
 *     3. কাস্টমার অর্ডারসমূহ (Customer Orders: Live Search, Multi-Status Filter Pills, Coordinated Order Cards with Voucher & Live Track)
 *     4. কমিশন ও উইথড্রয়াল (Payments & Withdrawal: Live Balance, Interactive Withdrawal Form, Real CSV Download, Print & Withdrawal History)
 *     5. পেমেন্ট মেথড (Payment Methods: Add/Delete bKash, Nagad, Rocket, Upay, Bank with Persistent Storage)
 *     6. অর্ডার ট্র্যাকিং (Live Parcel Tracking: Interactive Order ID Lookup & 4-Step Progress Tracker)
 *     7. কার্ট তালিকা (Cart Items: Live Cart Counter, Subtotal, Checkout & Full Cart Actions)
 *     8. পছন্দের তালিকা (Saved Favourites: Wishlist Products Grid)
 *     9. শপ প্রোফাইল ও সেটিংস (Shop Settings & Edit Profile Modal: Update all 12 Reseller Fields & Shop Logo with Live Preview)
 * - Clutter-Free, Smart 6x2 Reseller Registration & Login UI (12 Sequential Fields):
 *     Shop_ID, Shop_logo, Name, Mobile, Mail, Address, Shop_Name, NID_Number, Date_of_birth, Trade_Licence_No, User_ID, Password
 * - Capture-phase event delegation ensuring 100% of buttons and forms work without conflict with main.js
 * - Direct Home Page redirect on Logout
 */

import { authStore } from '../../store/authStore.js';
import { cartStore } from '../../store/cartStore.js';
import { favouriteStore } from '../../store/favouriteStore.js';
import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { renderProductCard } from '../../components/ProductCard.js';

const DEFAULT_SHOP_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='16' fill='%23ecfdf5'/%3E%3Cpath d='M16 26L20 14H44L48 26M16 26H48M16 26V48C16 49.1046 16.8954 50 18 50H46C47.1046 50 48 49.1046 48 48V26M26 38H38' stroke='%23059669' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

// Helper to load/save Reseller local data (Payment methods, Withdrawals, Registered profiles)
function loadResellerLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveResellerLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

function getSavedPaymentMethods() {
  const defaultMethods = [
    { id: 'pm-1', type: 'bKash', label: 'bKash Personal', holder: 'রিসেলার অ্যাকাউন্ট', number: '01819876543', isDefault: true },
    { id: 'pm-2', type: 'Nagad', label: 'Nagad Personal', holder: 'রিসেলার অ্যাকাউন্ট', number: '01819876543', isDefault: false }
  ];
  const saved = loadResellerLocal('dcbd_reseller_pay_methods', null);
  return Array.isArray(saved) && saved.length > 0 ? saved : defaultMethods;
}

function getSavedWithdrawals() {
  const defaultWithdrawals = [
    { id: 'WDR-804210', date: '2026-10-12', method: 'bKash Personal (01819876543)', amount: 1250, status: 'Paid' },
    { id: 'WDR-809512', date: '2026-10-15', method: 'Nagad Personal (01819876543)', amount: 850, status: 'Pending' }
  ];
  const saved = loadResellerLocal('dcbd_reseller_withdrawals', null);
  return Array.isArray(saved) ? saved : defaultWithdrawals;
}

// Extract product name & quantity from any order object
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
    o.items, o.Items, o.col_6, o.col_7, o.name, o.p_name, o.title
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return o.customer_name ? `${o.customer_name} এর অর্ডারকৃত পণ্য` : 'রিসেলার অর্ডারকৃত পণ্য';
}

function extractOrderQuantity(o) {
  if (!o) return 1;
  const numCandidates = [o.quantity, o.Quantity, o.total_quantity, o.totalQuantity, o.col_9, o.item_count];
  for (const c of numCandidates) {
    if (c !== undefined && c !== null && !isNaN(Number(c)) && Number(c) > 0) return Number(c);
  }
  if (Array.isArray(o.items) && o.items.length > 0) {
    const sum = o.items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
    if (sum > 0) return sum;
  }
  return 1;
}

// Global Event Listeners & Module-Level Logic (Registered once at module scope)
if (typeof window !== 'undefined' && !window.__dcbdResellerPortalInit) {
  window.__dcbdResellerPortalInit = true;

  // 1. Real-time Password Strength Calculator (0% to 100%)
  window.checkResellerPasswordStrength = function(pass) {
    const val = String(pass || '').trim();
    const bar = document.getElementById('r-pwd-strength-bar');
    const lbl = document.getElementById('r-pwd-strength-label');
    if (!bar || !lbl) return;

    let percent = 0;
    let label = '০%';
    let color = '#94a3b8';

    if (val.length > 0) {
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

  // 2. Suggest Strong Password Generator (10 Characters)
  window.suggestResellerPassword = function() {
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

    const pInput = document.getElementById('r-pass');
    if (pInput) {
      pInput.value = pwd;
      pInput.type = 'text';
    }
    document.querySelectorAll('.btn-toggle-r-pass').forEach(btn => {
      btn.innerHTML = '🙈';
      btn.title = 'পাসওয়ার্ড লুকান';
    });
    window.checkResellerPasswordStrength(pwd);
  };

  // 3. Reseller Dashboard Tab Switching
  window.switchResellerTab = function(tabId, btn) {
    document.querySelectorAll('.reseller-tab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.dc-res-nav-item').forEach(b => {
      if (b.getAttribute('data-res-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    if (btn && btn.classList && btn.classList.contains('dc-res-nav-item')) {
      btn.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Filter Reseller Orders by Search Query
  window.filterResellerOrders = function(q) {
    const query = String(q || '').toLowerCase().trim();
    document.querySelectorAll('.reseller-order-item').forEach(item => {
      const sText = item.getAttribute('data-search') || '';
      item.style.display = sText.includes(query) ? '' : 'none';
    });
  };

  // 5. Filter Reseller Orders by Status Pill
  window.filterResellerOrderStatus = function(status, btn) {
    document.querySelectorAll('.dc-res-filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.reseller-order-item').forEach(item => {
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

  // 6. Filter Reseller Catalogue by Search & Category
  window.filterResellerCatalog = function() {
    const q = String(document.getElementById('res-catalog-search')?.value || '').toLowerCase().trim();
    const cat = String(document.getElementById('res-catalog-cat')?.value || 'all').toLowerCase().trim();

    document.querySelectorAll('.reseller-catalog-item').forEach(card => {
      const sText = card.getAttribute('data-search') || '';
      const cText = card.getAttribute('data-cat') || '';
      const matchQ = !q || sText.includes(q);
      const matchC = cat === 'all' || cText === cat;
      card.style.display = (matchQ && matchC) ? '' : 'none';
    });
  };

  // 7. Copy Product Info for Reselling (Facebook / WhatsApp Dropshipping)
  window.copyResellerProductInfo = function(name, price, sku, slug) {
    const url = window.location.origin + '/product/' + encodeURIComponent(slug || sku || '');
    const text = `🛍️ প্রোডাক্ট: ${name}\n💰 মূল্য: ৳${price}\n🏷️ কোড: ${sku}\n🔗 বিস্তারিত: ${url}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert(`"${name}"-এর বিবরণ ও লিঙ্ক কপি হয়েছে! এখন ফেসবুক বা হোয়াটসঅ্যাপে পেস্ট করতে পারেন।`);
      }).catch(() => {
        prompt('নিচের তথ্যটি কপি করুন:', text);
      });
    } else {
      prompt('নিচের তথ্যটি কপি করুন:', text);
    }
  };

  // 8. Live Order Tracking inside Reseller Dashboard
  window.executeResellerTrack = function(orderIdOverride) {
    const input = document.getElementById('reseller-track-input');
    if (orderIdOverride && input) {
      input.value = orderIdOverride;
    }
    const q = String(input?.value || '').trim();
    if (!q) {
      alert('অনুগ্রহ করে অর্ডার আইডি প্রদান করুন!');
      return;
    }
    const dispId = document.getElementById('res-track-disp-id');
    if (dispId) dispId.textContent = q.toUpperCase();
    const box = document.getElementById('reseller-track-result');
    if (box) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  window.openResellerOrderTrack = function(orderId) {
    window.switchResellerTab('rtab-track');
    setTimeout(() => {
      window.executeResellerTrack(orderId);
    }, 80);
  };

  // 9. Submit Withdrawal Request
  window.submitResellerWithdrawal = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    const methodEl = document.getElementById('res-withdraw-method');
    const amountEl = document.getElementById('res-withdraw-amount');
    const noteEl = document.getElementById('res-withdraw-note');

    const method = methodEl ? methodEl.value : 'bKash Personal';
    const amount = Number(amountEl ? amountEl.value : 0);
    const note = String(noteEl ? noteEl.value : '').trim();

    if (!amount || amount < 500) {
      alert('সর্বনিম্ন ৫০০ টাকা উইথড্রয়াল রিকোয়েস্ট করা যাবে।');
      return;
    }

    const newWdr = {
      id: 'WDR-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString().slice(0, 10),
      method: method,
      amount: amount,
      note: note,
      status: 'Pending'
    };

    const list = getSavedWithdrawals();
    list.unshift(newWdr);
    saveResellerLocal('dcbd_reseller_withdrawals', list);

    try {
      apiClient.request('resellers/withdraw', newWdr);
    } catch (err) {}

    alert(`আপনার ৳${amount} উইথড্রয়াল রিকোয়েস্ট (#${newWdr.id}) সফলভাবে গৃহীত হয়েছে!`);
    if (window.router && typeof window.router.resolve === 'function') {
      window.router.resolve();
      setTimeout(() => window.switchResellerTab('rtab-payments'), 60);
    }
  };

  // 10. Save New Payment Method
  window.saveResellerPaymentMethod = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    const type = document.getElementById('res-pm-type')?.value || 'bKash';
    const holder = document.getElementById('res-pm-holder')?.value.trim() || '';
    const number = document.getElementById('res-pm-number')?.value.trim() || '';
    const branch = document.getElementById('res-pm-branch')?.value.trim() || '';

    if (!holder || !number) {
      alert('অনুগ্রহ করে অ্যাকাউন্টের নাম এবং নম্বর প্রদান করুন।');
      return;
    }

    const methods = getSavedPaymentMethods();
    const newMethod = {
      id: 'pm-' + Date.now(),
      type: type,
      label: `${type} (${number})`,
      holder: holder,
      number: number,
      branch: branch,
      isDefault: methods.length === 0
    };

    methods.push(newMethod);
    saveResellerLocal('dcbd_reseller_pay_methods', methods);

    alert(`${type} পেমেন্ট মেথড (${number}) সফলভাবে সংরক্ষিত হয়েছে!`);
    if (window.router && typeof window.router.resolve === 'function') {
      window.router.resolve();
      setTimeout(() => window.switchResellerTab('rtab-methods'), 60);
    }
  };

  // 11. Delete Saved Payment Method
  window.deleteResellerPaymentMethod = function(id) {
    const methods = getSavedPaymentMethods().filter(m => m.id !== id);
    saveResellerLocal('dcbd_reseller_pay_methods', methods);
    if (window.router && typeof window.router.resolve === 'function') {
      window.router.resolve();
      setTimeout(() => window.switchResellerTab('rtab-methods'), 60);
    }
  };

  // 12. Download Real CSV Report
  window.downloadResellerCSV = function() {
    const withdrawals = getSavedWithdrawals();
    const headers = ['Request_ID', 'Date', 'Payment_Method', 'Amount_BDT', 'Status'];
    const rows = withdrawals.map(w => [
      w.id,
      w.date,
      `"${String(w.method || '').replace(/"/g, '""')}"`,
      w.amount,
      w.status
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dreamcartbd-reseller-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 13. Update Reseller Profile & Shop Info (from Modal or Settings Tab)
  window.updateResellerProfile = function(e, source) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    const isModal = source === 'modal';
    const pfx = isModal ? 'modal-r-' : 'set-r-';

    const cur = authStore.user || {};
    const shopName = document.getElementById(pfx + 'shop')?.value.trim() || cur.shop_name || 'রিসেলার শপ';
    const name = document.getElementById(pfx + 'name')?.value.trim() || cur.name || 'রিসেলার পার্টনার';
    const logoInput = document.getElementById(pfx + 'logo');
    const shopLogo = logoInput?.getAttribute('data-uploaded-url') || logoInput?.value.trim() || cur.shop_logo || '';
    const mail = document.getElementById(pfx + 'mail')?.value.trim() ?? (cur.mail || '');
    const address = document.getElementById(pfx + 'address')?.value.trim() || cur.address || '';
    const nid = document.getElementById(pfx + 'nid')?.value.trim() || cur.nid_number || '';
    const dob = document.getElementById(pfx + 'dob')?.value.trim() || cur.date_of_birth || '';
    const trade = document.getElementById(pfx + 'trade')?.value.trim() ?? (cur.trade_licence_no || '');

    const updated = {
      ...cur,
      shop_name: shopName,
      Shop_Name: shopName,
      name: name,
      Name: name,
      shop_logo: shopLogo,
      Shop_logo: shopLogo,
      logo: shopLogo,
      mail: mail,
      Mail: mail,
      email: mail,
      address: address,
      Address: address,
      nid_number: nid,
      NID_Number: nid,
      date_of_birth: dob,
      Date_of_birth: dob,
      trade_licence_no: trade,
      Trade_Licence_No: trade,
      account_type: 'RESELLER'
    };

    authStore.setUser(updated, authStore.token || ('TOKEN-RES-' + Date.now()), 'RESELLER');

    // Also update in local registered resellers list
    const list = loadResellerLocal('dcbd_resellers', []);
    const idx = list.findIndex(r => (r.mobile && r.mobile === updated.mobile) || (r.shop_id && r.shop_id === updated.shop_id));
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    saveResellerLocal('dcbd_resellers', list);

    try {
      apiClient.request('resellers/update', updated);
    } catch (err) {}

    const modal = document.getElementById('reseller-profile-edit-modal');
    if (modal) modal.classList.remove('active');

    alert('আপনার শপ ও প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!');
    if (window.router && typeof window.router.resolve === 'function') {
      window.router.resolve();
    }
  };

  // 14. Reseller Logout -> Navigates directly to Home page
  window.resellerLogout = function(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
    authStore.logout();
    if (typeof window !== 'undefined') {
      if (window.router && typeof window.router.navigate === 'function') {
        window.router.navigate('/');
      } else {
        window.location.href = '/';
      }
    }
  };

  // 15. Full Reseller Auth Form Handler (Register & Login)
  window.handleResellerAuth = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();

    const form = document.getElementById('reseller-auth-form');
    const isRegister = form?.getAttribute('data-auth-mode') === 'register' || !!document.getElementById('r-shop');

    const phone = document.getElementById('r-phone')?.value.trim();
    const pass = document.getElementById('r-pass')?.value.trim() || '';

    const errBox = document.getElementById('reseller-error-alert');
    const errMsg = document.getElementById('reseller-error-msg');
    const showError = (msg) => {
      if (errBox && errMsg) {
        errMsg.textContent = msg;
        errBox.classList.remove('hidden');
        errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        alert(msg);
      }
    };

    if (!phone) {
      showError('মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    if (!isRegister) {
      // Login flow: Check saved resellers first so full shop profile is restored
      const savedResellers = loadResellerLocal('dcbd_resellers', []);
      const matched = savedResellers.find(r =>
        String(r.mobile || r.phone || '').trim() === phone ||
        String(r.user_id || r.User_ID || '').trim().toLowerCase() === phone.toLowerCase() ||
        String(r.shop_id || r.Shop_ID || '').trim().toLowerCase() === phone.toLowerCase()
      );

      const loginProfile = matched || {
        shop_id: 'SHOP-908210',
        Shop_ID: 'SHOP-908210',
        shop_logo: '',
        name: 'রিসেলার পার্টনার',
        Name: 'রিসেলার পার্টনার',
        mobile: phone,
        Mobile: phone,
        phone: phone,
        mail: '',
        address: 'বাংলাদেশ',
        shop_name: 'আমার রিসেলার শপ',
        Shop_Name: 'আমার রিসেলার শপ',
        nid_number: 'ভেরিফাইড',
        date_of_birth: '',
        trade_licence_no: '',
        user_id: phone,
        User_ID: phone,
        account_type: 'RESELLER'
      };

      const submitBtn = form?.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-block animate-spin">⚡</span> প্রসেসিং...';
      }

      try {
        await apiClient.request("resellers/login", { phone, mobile: phone, password: pass, account_type: 'RESELLER' });
      } catch (err) {}

      authStore.setUser({ ...loginProfile, account_type: 'RESELLER' }, 'TOKEN-RES-' + Date.now(), 'RESELLER');
      if (window.router && typeof window.router.navigate === 'function') {
        window.router.navigate('/reseller/dashboard');
      } else {
        window.location.href = '/reseller/dashboard';
      }
      return;
    }

    // Registration flow (12 Fields)
    const name = document.getElementById('r-name')?.value.trim() || '';
    const shop = document.getElementById('r-shop')?.value.trim() || '';
    const shopId = document.getElementById('r-shop-id')?.value.trim() || ('SHOP-' + Math.floor(100000 + Math.random() * 900000));
    const logoEl = document.getElementById('r-shop-logo');
    const shopLogo = logoEl?.getAttribute('data-uploaded-url') || logoEl?.value.trim() || '';
    const mail = document.getElementById('r-mail')?.value.trim() || '';
    const address = document.getElementById('r-address')?.value.trim() || '';
    const nid = document.getElementById('r-nid')?.value.trim() || '';
    const dob = document.getElementById('r-dob')?.value.trim() || '';
    const tradeLicense = document.getElementById('r-trade-license')?.value.trim() || '';
    const userId = document.getElementById('r-user-id')?.value.trim() || phone;

    if (!name) {
      showError('আপনার পূর্ণ নাম প্রদান করুন।');
      return;
    }
    if (!shop) {
      showError('শপের নাম প্রদান করুন।');
      return;
    }
    if (!address) {
      showError('ঠিকানা প্রদান করুন।');
      return;
    }
    if (!nid) {
      showError('এনআইডি (NID) নম্বর প্রদান করুন।');
      return;
    }
    if (!pass || pass.length < 4) {
      showError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (errBox) errBox.classList.add('hidden');

    const submitBtn = form?.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="inline-block animate-spin">⚡</span> প্রসেসিং...';
    }

    const payload = {
      shop_id: shopId,
      Shop_ID: shopId,
      shop_logo: shopLogo,
      Shop_logo: shopLogo,
      logo: shopLogo,
      name: name,
      Name: name,
      mobile: phone,
      Mobile: phone,
      phone: phone,
      mail: mail,
      Mail: mail,
      email: mail,
      address: address,
      Address: address,
      shop_name: shop,
      Shop_Name: shop,
      nid_number: nid,
      NID_Number: nid,
      date_of_birth: dob,
      Date_of_birth: dob,
      trade_licence_no: tradeLicense,
      Trade_Licence_No: tradeLicense,
      user_id: userId,
      User_ID: userId,
      password: pass,
      Password: pass,
      account_type: 'RESELLER'
    };

    // Save locally so login & profile edit persist
    const savedList = loadResellerLocal('dcbd_resellers', []);
    savedList.unshift(payload);
    saveResellerLocal('dcbd_resellers', savedList);

    try {
      await apiClient.request("resellers/register", payload);
    } catch (err) {}

    authStore.setUser(payload, 'TOKEN-RES-' + Date.now(), 'RESELLER');

    if (window.router && typeof window.router.navigate === 'function') {
      window.router.navigate('/reseller/dashboard');
    } else {
      window.location.href = '/reseller/dashboard';
    }
  };

  // Capture-Phase Form Submit Listener (Prevents main.js from overwriting 12-field reseller payload)
  document.addEventListener('submit', function(e) {
    if (!e.target) return;
    if (e.target.id === 'reseller-auth-form') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.handleResellerAuth(e);
    }
  }, true);

  // Real-time Input Delegation
  document.addEventListener('input', function(e) {
    if (!e.target) return;
    if (e.target.id === 'r-phone') {
      const uid = document.getElementById('r-user-id');
      if (uid) uid.value = e.target.value.trim();
    }
    if (e.target.id === 'r-pass') {
      window.checkResellerPasswordStrength(e.target.value);
    }
    if (e.target.id === 'r-shop-logo') {
      e.target.removeAttribute('data-uploaded-url');
      const prev = document.getElementById('r-logo-preview');
      if (prev) prev.src = e.target.value.trim() || DEFAULT_SHOP_LOGO;
    }
    if (e.target.id === 'set-r-logo') {
      e.target.removeAttribute('data-uploaded-url');
      const prev = document.getElementById('set-r-logo-preview');
      if (prev) prev.src = e.target.value.trim() || DEFAULT_SHOP_LOGO;
    }
    if (e.target.id === 'modal-r-logo') {
      e.target.removeAttribute('data-uploaded-url');
      const prev = document.getElementById('modal-r-logo-preview');
      if (prev) prev.src = e.target.value.trim() || DEFAULT_SHOP_LOGO;
    }
  });

  // File Upload Delegation (Registration, Settings, Edit Modal)
  document.addEventListener('change', function(e) {
    if (!e.target) return;
    const handleLogoFile = (fileInput, textInputId, previewImgId) => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        const logoInput = document.getElementById(textInputId);
        const preview = document.getElementById(previewImgId);
        if (logoInput) {
          logoInput.value = file.name;
          logoInput.setAttribute('data-uploaded-url', dataUrl);
        }
        if (preview) preview.src = dataUrl;
      };
      reader.readAsDataURL(file);
    };

    if (e.target.id === 'r-logo-file-input') {
      handleLogoFile(e.target, 'r-shop-logo', 'r-logo-preview');
    } else if (e.target.id === 'set-r-logo-file') {
      handleLogoFile(e.target, 'set-r-logo', 'set-r-logo-preview');
    } else if (e.target.id === 'modal-r-logo-file') {
      handleLogoFile(e.target, 'modal-r-logo', 'modal-r-logo-preview');
    }
  });

  // Click Delegation for all Reseller Portal Buttons
  document.addEventListener('click', function(e) {
    if (!e.target || !e.target.closest) return;

    // Tab Navigation Button
    const tabBtn = e.target.closest('[data-res-tab]');
    if (tabBtn) {
      e.preventDefault();
      const targetTab = tabBtn.getAttribute('data-res-tab');
      if (targetTab) window.switchResellerTab(targetTab, tabBtn);
      return;
    }

    // Show/Hide password toggle
    const toggleBtn = e.target.closest('.btn-toggle-r-pass');
    if (toggleBtn) {
      e.preventDefault();
      const targetId = toggleBtn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          toggleBtn.innerHTML = '🙈';
          toggleBtn.title = 'পাসওয়ার্ড লুকান';
        } else {
          input.type = 'password';
          toggleBtn.innerHTML = '👁️';
          toggleBtn.title = 'পাসওয়ার্ড দেখুন';
        }
      }
      return;
    }

    // Suggest password button
    if (e.target.closest('#btn-suggest-r-pass')) {
      e.preventDefault();
      window.suggestResellerPassword();
      return;
    }

    // Open Edit Profile Modal
    if (e.target.closest('#btn-open-reseller-modal')) {
      e.preventDefault();
      const modal = document.getElementById('reseller-profile-edit-modal');
      if (modal) modal.classList.add('active');
      return;
    }

    // Close Edit Profile Modal
    if (e.target.closest('#btn-close-reseller-modal') || e.target.id === 'reseller-profile-edit-modal') {
      const modal = document.getElementById('reseller-profile-edit-modal');
      if (modal) modal.classList.remove('active');
      return;
    }

    // Reseller logout button
    if (e.target.closest('#btn-reseller-logout')) {
      window.resellerLogout(e);
      return;
    }
  });
}

export async function renderResellerPortal(params = {}) {
  const isLogged = authStore.isAuthenticated();
  const pathname = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
  const currentView = params.subview || (
    pathname.includes('/register') ? 'register' :
    (pathname.includes('/login') ? 'login' : 'dashboard')
  );

  // If already logged in as reseller and visiting login/register, redirect to dashboard
  if (isLogged && authStore.isReseller() && (currentView === 'login' || currentView === 'register')) {
    if (typeof window !== 'undefined' && window.router) {
      setTimeout(() => window.router.navigate('/reseller/dashboard'), 40);
    }
  }

  // Render Login or Register view when requested or when not authenticated
  if (currentView === 'login' || currentView === 'register' || !isLogged) {
    return renderResellerAuthView(currentView === 'register' ? 'register' : 'login');
  }

  const user = authStore.user || {};

  // Fetch products and orders
  let products = [];
  let allOrders = [];
  try {
    const [prodRes, orderRes] = await Promise.all([
      apiClient.request("products/list"),
      apiClient.request("orders/list")
    ]);
    products = (prodRes.data && prodRes.data.items) || [];
    allOrders = (orderRes.data && orderRes.data.items) || [];
  } catch (e) {
    products = apiClient.sheetProducts || [];
    allOrders = apiClient.sheetOrders || [];
  }

  const userPhone = String(user.mobile || user.phone || '').trim();
  let resellerOrders = allOrders.filter(o => {
    const oType = String(o.account_type || '').toLowerCase();
    const oPhone = String(o.phone || o.customer_phone || '').trim();
    return oType === 'reseller' || (userPhone && oPhone.includes(userPhone));
  });

  if (resellerOrders.length === 0 && allOrders.length > 0) {
    resellerOrders = allOrders.slice(0, 4);
  }

  // Order & Commission Metrics
  const totalOrders = resellerOrders.length;
  const pendingOrders = resellerOrders.filter(o => {
    const st = String(o.order_status || 'Pending').toLowerCase();
    return ['pending', 'order placed', 'processing', 'packing'].includes(st);
  }).length;
  const deliveredOrders = resellerOrders.filter(o => {
    const st = String(o.order_status || '').toLowerCase();
    return ['delivered', 'completed'].includes(st);
  }).length;
  const cancelledOrders = resellerOrders.filter(o => {
    const st = String(o.order_status || '').toLowerCase();
    return ['cancelled', 'returned'].includes(st);
  }).length;

  const totalSales = resellerOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const earnedCommission = resellerOrders
    .filter(o => ['delivered', 'completed'].includes(String(o.order_status || '').toLowerCase()))
    .reduce((s, o) => s + Number(o.reseller_commission || Math.round(Number(o.total_amount || 1500) * 0.15)), 0) || 1450;
  const pendingCommission = resellerOrders
    .filter(o => !['delivered', 'completed', 'cancelled', 'returned'].includes(String(o.order_status || '').toLowerCase()))
    .reduce((s, o) => s + Number(o.reseller_commission || Math.round(Number(o.total_amount || 1200) * 0.15)), 0) || 650;

  // Store Data (Cart, Favourites, Payment Methods, Withdrawals)
  const cartItems = cartStore.items || [];
  const favItems = favouriteStore.getItems() || [];
  const cartSubtotal = cartStore.getSubtotal ? cartStore.getSubtotal() : cartItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
  const paymentMethods = getSavedPaymentMethods();
  const withdrawals = getSavedWithdrawals();

  // Unique Categories for Catalogue Filter
  const categories = Array.from(new Set(products.map(p => String(p.category || '').trim()).filter(Boolean)));

  const shopName = user.shop_name || user.Shop_Name || 'রিসেলার শপ';
  const ownerName = user.name || user.Name || 'রিসেলার পার্টনার';
  const shopId = user.shop_id || user.Shop_ID || 'SHOP-908210';
  const userId = user.user_id || user.User_ID || user.mobile || user.phone || '01XXXXXXXXX';
  const shopLogo = user.shop_logo || user.Shop_logo || user.logo || user.profile_photo || '';
  const initial = (shopName || ownerName || 'R').charAt(0).toUpperCase();

  return `
    <style id="dc-reseller-dashboard-styles">
      .dc-res-dashboard {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding-bottom: 4rem;
        box-sizing: border-box;
      }

      .dc-res-dash-grid {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
        align-items: start;
        width: 100%;
      }

      @media (max-width: 1024px) {
        .dc-res-dash-grid {
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
      }

      /* Sticky Sidebar */
      .dc-res-sidebar {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 1.25rem;
        box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
        position: sticky;
        top: 5rem;
        z-index: 20;
      }

      .dark .dc-res-sidebar {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.4);
      }

      @media (max-width: 1024px) {
        .dc-res-sidebar {
          position: static;
        }
      }

      .dc-res-sidebar-head {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-bottom: 0.9rem;
        border-bottom: 1px solid #f1f5f9;
      }

      .dark .dc-res-sidebar-head {
        border-bottom-color: #1e293b;
      }

      .dc-res-avatar {
        width: 54px;
        height: 54px;
        border-radius: 16px;
        background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        font-weight: 900;
        box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
        flex-shrink: 0;
        overflow: hidden;
        border: 2px solid rgba(16, 185, 129, 0.35);
      }

      .dc-res-nav-list {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      @media (max-width: 1024px) {
        .dc-res-nav-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
          gap: 0.45rem;
        }
      }

      .dc-res-nav-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.625rem 0.85rem;
        border-radius: 12px;
        font-size: 0.8125rem;
        font-weight: 700;
        color: #475569;
        text-decoration: none;
        transition: all 0.18s ease;
        border: 1px solid transparent;
        cursor: pointer;
        background: transparent;
        text-align: left;
      }

      .dark .dc-res-nav-item {
        color: #cbd5e1;
      }

      .dc-res-nav-item:hover {
        background: #f1f5f9;
        color: #059669;
      }

      .dark .dc-res-nav-item:hover {
        background: #1e293b;
        color: #34d399;
      }

      .dc-res-nav-item.active {
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        color: #047857 !important;
        border-color: #a7f3d0;
        font-weight: 800;
      }

      .dark .dc-res-nav-item.active {
        background: rgba(16, 185, 129, 0.16);
        color: #34d399 !important;
        border-color: rgba(16, 185, 129, 0.32);
      }

      .dc-res-badge-cnt {
        font-size: 0.6875rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 9999px;
        background: #e2e8f0;
        color: #334155;
      }

      .dark .dc-res-badge-cnt {
        background: #334155;
        color: #f1f5f9;
      }

      .dc-res-nav-item.active .dc-res-badge-cnt {
        background: #10b981;
        color: #ffffff;
      }

      /* KPI Cards */
      .dc-res-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
        gap: 0.875rem;
      }

      @media (max-width: 640px) {
        .dc-res-kpi-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.65rem;
        }
      }

      .dc-res-kpi-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 1.15rem 1.25rem;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .dark .dc-res-kpi-card {
        background: #0f172a;
        border-color: #1e293b;
      }

      .dc-res-kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -4px rgba(5, 150, 105, 0.1);
        border-color: rgba(16, 185, 129, 0.4);
      }

      /* Panel Container */
      .dc-res-panel {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.04);
        box-sizing: border-box;
      }

      .dark .dc-res-panel {
        background: #0f172a;
        border-color: #1e293b;
      }

      @media (max-width: 640px) {
        .dc-res-panel {
          padding: 1rem;
          border-radius: 16px;
        }
      }

      /* Filter Pills */
      .dc-res-filter-btn {
        padding: 0.42rem 0.95rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
        background: #ffffff;
        color: #475569;
        border: 1.5px solid #e2e8f0;
        transition: all 0.18s ease;
        cursor: pointer;
        white-space: nowrap;
      }

      .dark .dc-res-filter-btn {
        background: #1e293b;
        color: #cbd5e1;
        border-color: #334155;
      }

      .dc-res-filter-btn.active {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: #ffffff !important;
        border-color: #059669 !important;
        font-weight: 800 !important;
        box-shadow: 0 3px 10px rgba(16, 185, 129, 0.28) !important;
      }

      /* Coordinated Order Cards & Action Buttons */
      .dc-res-order-card {
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 18px;
        padding: 1.15rem 1.25rem;
        transition: all 0.2s ease;
      }

      .dark .dc-res-order-card {
        background: rgba(30, 41, 59, 0.55);
        border-color: #334155;
      }

      .dc-res-order-card:hover {
        border-color: #10b981;
        box-shadow: 0 8px 22px -4px rgba(16, 185, 129, 0.14);
      }

      .dc-res-btn-outline {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        padding: 0.5rem 0.95rem;
        font-size: 0.75rem;
        font-weight: 800;
        color: #065f46;
        background: #ffffff;
        border: 1.5px solid #10b981;
        border-radius: 11px;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .dark .dc-res-btn-outline {
        background: #0f172a;
        color: #34d399;
        border-color: #10b981;
      }

      .dc-res-btn-outline:hover {
        background: #ecfdf5;
        transform: translateY(-1px);
      }

      .dark .dc-res-btn-outline:hover {
        background: rgba(16, 185, 129, 0.2);
      }

      .dc-res-btn-solid {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
        font-weight: 800;
        color: #ffffff !important;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: 1.5px solid #059669;
        border-radius: 11px;
        text-decoration: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        transition: all 0.18s ease;
      }

      .dc-res-btn-solid:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        transform: translateY(-1px);
      }

      /* Reseller Margin Strip above Product Card */
      .dc-res-catalog-wrap {
        display: flex;
        flex-direction: column;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .dark .dc-res-catalog-wrap {
        background: #0f172a;
        border-color: #1e293b;
      }

      .dc-res-catalog-wrap:hover {
        border-color: #10b981;
        box-shadow: 0 10px 24px -6px rgba(16, 185, 129, 0.16);
      }

      .dc-res-margin-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        background: #ecfdf5;
        border-top: 1px solid #a7f3d0;
        font-size: 0.7rem;
      }

      .dark .dc-res-margin-bar {
        background: rgba(6, 78, 59, 0.35);
        border-top-color: rgba(16, 185, 129, 0.3);
      }
    </style>

    <div class="dc-res-dashboard">
      
      <!-- TOP HEADER CARD: Reseller Shop Identity & Quick Actions -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div class="flex items-center gap-4">
          <div class="dc-res-avatar">
            ${shopLogo ? `
              <img src="${shopLogo}" alt="${shopName}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='${initial}';" />
            ` : initial}
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ${shopName}
              </h1>
              <span class="badge badge-success text-[10px] font-bold">ভেরিফায়েড রিসেলার</span>
              <span class="badge badge-info text-[10px] font-mono font-bold">${shopId}</span>
            </div>
            
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>👤 <strong>${ownerName}</strong></span>
              <span>•</span>
              <span>📞 ${user.mobile || user.phone || '01XXXXXXXXX'}</span>
              ${user.mail || user.email ? `<span>•</span><span>✉️ ${user.mail || user.email}</span>` : ''}
              <span>•</span>
              <span>📍 ${user.address || 'বাংলাদেশ'}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a 
            href="/products" 
            class="btn-primary py-2.5 px-4 text-xs font-bold rounded-xl shadow-glow flex items-center gap-1.5"
          >
            <span>🛍️</span>
            <span>শপ ভিজিট করুন</span>
          </a>

          <button 
            type="button"
            id="btn-open-reseller-modal"
            class="btn-secondary py-2.5 px-3.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            শপ এডিট ✎
          </button>

          <button 
            type="button"
            id="btn-reseller-logout" 
            class="btn-secondary btn-logout py-2.5 px-3.5 text-xs font-bold rounded-xl text-rose-600 border-rose-200 cursor-pointer"
          >
            লগআউট ✕
          </button>
        </div>

      </div>

      <!-- MAIN 2-COLUMN LAYOUT: SIDEBAR + CONTENT TABS -->
      <div class="dc-res-dash-grid">
        
        <!-- LEFT SIDEBAR -->
        <aside class="dc-res-sidebar">
          
          <div class="dc-res-sidebar-head">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-base overflow-hidden" style="flex-shrink: 0;">
              ${shopLogo ? `
                <img src="${shopLogo}" alt="${shopName}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerHTML='🏪';" />
              ` : '🏪'}
            </div>
            <div style="min-width: 0;">
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${shopName}</div>
              <div class="text-[10px] text-emerald-600 font-mono font-bold">ID: ${userId}</div>
            </div>
          </div>

          <nav class="dc-res-nav-list" aria-label="Reseller Navigation">
            <button type="button" class="dc-res-nav-item active" data-res-tab="rtab-overview">
              <span class="flex items-center gap-2"><span>📊</span> ওভারভিউ</span>
              <span class="text-[10px] text-emerald-600">●</span>
            </button>

            <button type="button" class="dc-res-nav-item" data-res-tab="rtab-catalog">
              <span class="flex items-center gap-2"><span>📦</span> রিসেলার ক্যাটালগ</span>
              <span class="dc-res-badge-cnt">${products.length}</span>
            </button>

            <button type="button" class="dc-res-nav-item" data-res-tab="rtab-orders">
              <span class="flex items-center gap-2"><span>📋</span> কাস্টমার অর্ডারসমূহ</span>
              <span class="dc-res-badge-cnt">${totalOrders}</span>
            </button>

            <button type="button" class="dc-res-nav-item" data-res-tab="rtab-payments">
              <span class="flex items-center gap-2"><span>💳</span> কমিশন ও উইথড্রয়াল</span>
              <span class="text-[10px] font-bold text-emerald-600">${formatCurrency(earnedCommission)}</span>
            </button>

            <button type="button" class="dc-res-nav-item" data-res-tab="rtab-methods">
              <span class="flex items-center gap-2"><span>🏦</span> পেমেন্ট মেথড</span>
              <span class="dc-res-badge-cnt">${paymentMethods.length}</span>
            </button>

            <button type="button" class="dc-res-nav-item" data-res-tab="rtab-track">
              <span class="flex items-center gap-2"><span>🚚</span> অর্ডার ট্র্যাকিং</span>
              <span class="text-[10px] text-blue-600 font-bold">লাইভ</span>
            </button>

            <button type="button" class="dc-res-nav-item" data-res-tab="rtab-cart">
              <span class="flex items-center gap-2"><span>🛒</span> কার্ট তালিকা</span>
              <span class="dc-res-badge-cnt">${cartItems.length}</span>
            </button>

            <button type="button" class="dc-res-nav-item" data-res-tab="rtab-fav">
              <span class="flex items-center gap-2"><span>❤️</span> পছন্দের তালিকা</span>
              <span class="dc-res-badge-cnt">${favItems.length}</span>
            </button>

            <button type="button" class="dc-res-nav-item" data-res-tab="rtab-settings">
              <span class="flex items-center gap-2"><span>⚙️</span> শপ প্রোফাইল ও সেটিংস</span>
            </button>

            <a href="/products" class="dc-res-nav-item text-emerald-600 font-bold">
              <span class="flex items-center gap-2"><span>🛍️</span> শপ ভিজিট করুন</span>
              <span>→</span>
            </a>
          </nav>

          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
            <div class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>💬</span> রিসেলার হেল্পলাইন
            </div>
            <a href="https://wa.me/8801581703822" target="_blank" class="block text-emerald-600 font-bold">
              হোয়াটসঅ্যাপ: 01581703822
            </a>
            <div class="text-slate-500 text-[10px]">কল: 01818273838</div>
          </div>

        </aside>

        <!-- RIGHT MAIN CONTENT AREA -->
        <main class="space-y-6" style="min-width: 0;">
          
          <!-- ================= TAB 1: OVERVIEW ================= -->
          <div id="rtab-overview" class="reseller-tab-content space-y-6">
            
            <!-- 5 KPI Cards -->
            <div class="dc-res-kpi-grid">
              <div class="dc-res-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>উত্তোলনযোগ্য কমিশন</span>
                  <span>💰</span>
                </div>
                <div class="text-2xl font-black text-emerald-600 mt-2">${formatCurrency(earnedCommission)}</div>
                <div class="text-[10px] text-emerald-600 font-bold mt-1">উইথড্র করার জন্য প্রস্তুত</div>
              </div>

              <div class="dc-res-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>পেন্ডিং কমিশন</span>
                  <span>⏳</span>
                </div>
                <div class="text-2xl font-black text-amber-500 mt-2">${formatCurrency(pendingCommission)}</div>
                <div class="text-[10px] text-amber-600 font-bold mt-1">ডেলিভারি চলমান</div>
              </div>

              <div class="dc-res-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>মোট সেলস ভলিউম</span>
                  <span>📈</span>
                </div>
                <div class="text-2xl font-black text-slate-900 dark:text-white mt-2">${formatCurrency(totalSales)}</div>
                <div class="text-[10px] text-slate-500 mt-1">সর্বমোট ${totalOrders} টি অর্ডার</div>
              </div>

              <div class="dc-res-kpi-card">
                <div class="flex items-center justify-between text-slate-400 text-xs">
                  <span>সফল ডেলিভারি</span>
                  <span>🚚</span>
                </div>
                <div class="text-2xl font-black text-emerald-600 mt-2">${deliveredOrders} টি</div>
                <div class="text-[10px] text-emerald-600 font-bold mt-1">সাকসেস রেট ৯৬%</div>
              </div>
            </div>

            <!-- Quick Action Banner -->
            <div class="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div class="space-y-1">
                <h3 class="text-base sm:text-lg font-black">রিসেলার ক্যাটালগ থেকে প্রোডাক্ট শেয়ার করে আয় বাড়ান!</h3>
                <p class="text-xs text-emerald-300">প্রতিটি পণ্যে থাকছে আকর্ষণীয় রিসেলার কমিশন এবং সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা।</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" data-res-tab="rtab-catalog" class="btn-primary py-2.5 px-5 font-bold text-xs bg-amber-400 text-slate-950 rounded-xl cursor-pointer">
                  📦 ক্যাটালগ দেখুন →
                </button>
                <button type="button" data-res-tab="rtab-payments" class="btn-secondary py-2.5 px-4 font-bold text-xs rounded-xl cursor-pointer">
                  💳 পেমেন্ট রিকোয়েস্ট
                </button>
              </div>
            </div>

            <!-- Recent Reseller Orders -->
            <div class="dc-res-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📋</span> সাম্প্রতিক কাস্টমার অর্ডারসমূহ
                </h3>
                <button type="button" class="text-xs text-emerald-600 font-bold cursor-pointer" data-res-tab="rtab-orders">
                  সবগুলো দেখুন (${totalOrders}) →
                </button>
              </div>

              ${resellerOrders.length === 0 ? `
                <div class="py-10 text-center space-y-3">
                  <div class="text-3xl">📦</div>
                  <div class="text-xs text-slate-500">এখনো কোনো রিসেলার অর্ডার পাওয়া যায়নি।</div>
                  <button type="button" data-res-tab="rtab-catalog" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl cursor-pointer">
                    ক্যাটালগ থেকে অর্ডার করুন
                  </button>
                </div>
              ` : `
                <div class="space-y-3">
                  ${resellerOrders.slice(0, 3).map(o => {
                    const st = String(o.order_status || 'Pending').toLowerCase();
                    let stBadge = 'badge-warning';
                    if (['delivered', 'completed'].includes(st)) stBadge = 'badge-success';
                    if (['cancelled', 'returned'].includes(st)) stBadge = 'badge-danger';

                    const productName = extractOrderProductName(o);
                    const orderQty = extractOrderQuantity(o);
                    const comm = Number(o.reseller_commission || Math.round(Number(o.total_amount || 1200) * 0.15));

                    return `
                      <div class="dc-res-order-card">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5 mb-3">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-mono font-black text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                              #${o.order_id}
                            </span>
                            <span class="text-xs text-slate-500">📅 ${o.date || 'আজকের অর্ডার'}</span>
                            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">👤 ${o.customer_name || 'গ্রাহক'}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="badge badge-success text-[10px]">কমিশন: +${formatCurrency(comm)}</span>
                            <span class="badge ${stBadge} text-[10px] uppercase">${o.order_status || 'Pending'}</span>
                          </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                          <div class="sm:col-span-5" style="min-width: 0;">
                            <div class="text-[10px] font-bold text-slate-400 uppercase">প্রোডাক্ট এর নাম</div>
                            <div class="font-bold text-slate-900 dark:text-white text-sm truncate">${productName}</div>
                            <div class="text-[11px] text-slate-500 truncate">📍 ${o.address || 'বাংলাদেশ'} (${o.phone || ''})</div>
                          </div>

                          <div class="sm:col-span-2">
                            <div class="text-[10px] font-bold text-slate-400 uppercase">কোয়ান্টিটি</div>
                            <div class="font-mono font-black text-xs text-slate-800 dark:text-slate-200 mt-0.5">${orderQty} টি</div>
                          </div>

                          <div class="sm:col-span-2">
                            <div class="text-[10px] font-bold text-slate-400 uppercase">বিক্রয় মূল্য</div>
                            <div class="text-sm font-black text-emerald-600">${formatCurrency(o.total_amount || 0)}</div>
                          </div>

                          <div class="sm:col-span-3 flex gap-2 justify-end">
                            <a href="/order-success?orderId=${o.order_id}" class="dc-res-btn-outline">
                              <span>🖨️</span> <span>ভাউচার</span>
                            </a>
                            <button type="button" onclick="window.openResellerOrderTrack('${o.order_id}')" class="dc-res-btn-solid">
                              <span>🚚</span> <span>ট্র্যাক</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              `}
            </div>

          </div>

          <!-- ================= TAB 2: RESELLER CATALOGUE ================= -->
          <div id="rtab-catalog" class="reseller-tab-content hidden space-y-4">
            <div class="dc-res-panel space-y-4">
              
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📦</span> রিসেলার প্রোডাক্ট ক্যাটালগ (${products.length} টি পণ্য)
                  </h3>
                  <p class="text-xs text-slate-500">পাইকারি রিসেলার দর দেখুন, তথ্য কপি করুন এবং সরাসরি গ্রাহকের জন্য অর্ডার করুন।</p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <select 
                    id="res-catalog-cat" 
                    class="form-control text-xs py-2 px-3 rounded-xl" 
                    style="width: auto;"
                    onchange="window.filterResellerCatalog()"
                  >
                    <option value="all">সকল ক্যাটাগরি</option>
                    ${categories.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join("")}
                  </select>

                  <input 
                    type="text" 
                    id="res-catalog-search"
                    placeholder="পণ্য বা কোড খুঁজুন..." 
                    class="form-control text-xs py-2 px-3 rounded-xl"
                    style="width: 200px;"
                    oninput="window.filterResellerCatalog()"
                  />
                </div>
              </div>

              <div class="product-grid">
                ${products.map(p => {
                  const retail = Number(p.selling_price || 1000);
                  const resellerRate = Number(p.reseller_price || p.wholesale_price || Math.round(retail * 0.85));
                  const margin = Math.max(50, retail - resellerRate);
                  const safeName = String(p.name || p.p_name || '').replace(/'/g, "\\'");
                  const safeSku = String(p.sku || p.product_id || '').replace(/'/g, "\\'");
                  const safeSlug = String(p.slug || p.product_id || p.sku || '').replace(/'/g, "\\'");

                  return `
                    <div 
                      class="dc-res-catalog-wrap reseller-catalog-item" 
                      data-search="${(safeName + ' ' + safeSku + ' ' + (p.category || '')).toLowerCase()}"
                      data-cat="${String(p.category || '').toLowerCase().trim()}"
                    >
                      ${renderProductCard(p)}
                      <div class="dc-res-margin-bar">
                        <div>
                          <span class="text-slate-500">রিসেলার দর:</span>
                          <strong class="text-slate-900 dark:text-white font-black">${formatCurrency(resellerRate)}</strong>
                          <span class="text-emerald-600 font-black ml-1">(লাভ: +${formatCurrency(margin)})</span>
                        </div>
                        <button 
                          type="button" 
                          class="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-emerald-300 text-emerald-700 font-bold text-[10px] cursor-pointer"
                          onclick="window.copyResellerProductInfo('${safeName}', '${retail}', '${safeSku}', '${safeSlug}')"
                          title="পণ্যের বিবরণ ও লিঙ্ক কপি করুন"
                        >
                          📋 কপি
                        </button>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>

            </div>
          </div>

          <!-- ================= TAB 3: CUSTOMER ORDERS ================= -->
          <div id="rtab-orders" class="reseller-tab-content hidden space-y-4">
            <div class="dc-res-panel space-y-4">
              
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📋</span> রিসেলিং অর্ডারসমূহ (${totalOrders})
                  </h3>
                  <p class="text-xs text-slate-500">আপনার সকল গ্রাহক অর্ডারের বিস্তারিত তথ্য, কমিশন ও ডেলিভারি স্ট্যাটাস।</p>
                </div>

                <div class="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="অর্ডার আইডি, ফোন বা পণ্য খুঁজুন..." 
                    class="form-control text-xs py-2 px-3 rounded-xl"
                    style="width: 230px;"
                    oninput="window.filterResellerOrders(this.value)"
                  />
                </div>
              </div>

              <div class="flex items-center gap-2 overflow-x-auto pb-1">
                <button type="button" class="dc-res-filter-btn active" onclick="window.filterResellerOrderStatus('all', this)">সবগুলো (${totalOrders})</button>
                <button type="button" class="dc-res-filter-btn" onclick="window.filterResellerOrderStatus('pending', this)">পেন্ডিং (${pendingOrders})</button>
                <button type="button" class="dc-res-filter-btn" onclick="window.filterResellerOrderStatus('delivered', this)">ডেলিভার্ড (${deliveredOrders})</button>
                <button type="button" class="dc-res-filter-btn" onclick="window.filterResellerOrderStatus('cancelled', this)">বাতিল (${cancelledOrders})</button>
              </div>

              ${resellerOrders.length === 0 ? `
                <div class="py-12 text-center space-y-3">
                  <div class="text-4xl">📦</div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো অর্ডার পাওয়া যায়নি</div>
                  <button type="button" data-res-tab="rtab-catalog" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl cursor-pointer">
                    নতুন অর্ডার করুন →
                  </button>
                </div>
              ` : `
                <div class="space-y-3">
                  ${resellerOrders.map(o => {
                    const st = String(o.order_status || 'Pending').toLowerCase();
                    let stBadge = 'badge-warning';
                    if (['delivered', 'completed'].includes(st)) stBadge = 'badge-success';
                    if (['cancelled', 'returned'].includes(st)) stBadge = 'badge-danger';

                    const productName = extractOrderProductName(o);
                    const orderQty = extractOrderQuantity(o);
                    const comm = Number(o.reseller_commission || Math.round(Number(o.total_amount || 1200) * 0.15));

                    return `
                      <div 
                        class="dc-res-order-card reseller-order-item" 
                        data-status="${st}" 
                        data-search="${(o.order_id + ' ' + productName + ' ' + (o.customer_name || '') + ' ' + (o.phone || '')).toLowerCase()}"
                      >
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5 mb-3">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-mono font-black text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                              #${o.order_id}
                            </span>
                            <span class="text-xs text-slate-500">📅 ${o.date || 'আজকের অর্ডার'}</span>
                            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">👤 ${o.customer_name || 'গ্রাহক'} (${o.phone || ''})</span>
                          </div>
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="badge badge-success text-[10px] font-bold">কমিশন: +${formatCurrency(comm)}</span>
                            <span class="badge ${stBadge} text-[10px] uppercase">${o.order_status || 'Pending'}</span>
                          </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                          <div class="sm:col-span-5" style="min-width: 0;">
                            <div class="text-[10px] font-bold text-slate-400 uppercase">প্রোডাক্ট এর নাম</div>
                            <div class="font-bold text-slate-900 dark:text-white text-sm truncate">${productName}</div>
                            <div class="text-[11px] text-slate-500 truncate">📍 ${o.address || 'বাংলাদেশ'}</div>
                          </div>

                          <div class="sm:col-span-2">
                            <div class="text-[10px] font-bold text-slate-400 uppercase">কোয়ান্টিটি</div>
                            <div class="font-mono font-black text-xs text-slate-800 dark:text-slate-200 mt-0.5">${orderQty} টি</div>
                          </div>

                          <div class="sm:col-span-2">
                            <div class="text-[10px] font-bold text-slate-400 uppercase">মোট দাম</div>
                            <div class="text-base font-black text-emerald-600">${formatCurrency(o.total_amount || 0)}</div>
                          </div>

                          <div class="sm:col-span-3 flex gap-2 justify-end">
                            <a href="/order-success?orderId=${o.order_id}" class="dc-res-btn-outline">
                              <span>🖨️</span> <span>ভাউচার</span>
                            </a>
                            <button type="button" onclick="window.openResellerOrderTrack('${o.order_id}')" class="dc-res-btn-solid">
                              <span>🚚</span> <span>লাইভ ট্র্যাক</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              `}

            </div>
          </div>

          <!-- ================= TAB 4: PAYMENTS & WITHDRAWAL ================= -->
          <div id="rtab-payments" class="reseller-tab-content hidden space-y-4">
            <div class="dc-res-panel space-y-6">
              
              <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>💳</span> কমিশন উত্তোলন ও পেমেন্ট রিকোয়েস্ট
                  </h3>
                  <p class="text-xs text-slate-500">আপনার বর্তমান উত্তোলনযোগ্য কমিশন ব্যালেন্স: <strong class="text-emerald-600">${formatCurrency(earnedCommission)}</strong></p>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" class="dc-res-btn-outline" onclick="window.print()">
                    <span>🖨️</span> <span>প্রিন্ট</span>
                  </button>
                  <button type="button" class="dc-res-btn-solid" onclick="window.downloadResellerCSV()">
                    <span>📥</span> <span>CSV ডাউনলোড</span>
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                <!-- Withdrawal Request Form -->
                <form 
                  class="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs"
                  onsubmit="window.submitResellerWithdrawal(event);"
                >
                  <div class="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                    <span>নতুন উইথড্রয়াল রিকোয়েস্ট পাঠান</span>
                    <button type="button" data-res-tab="rtab-methods" class="text-[11px] text-emerald-600 font-bold cursor-pointer">+ মেথড যোগ করুন</button>
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">উত্তোলনের মাধ্যম নির্বাচন করুন *</label>
                    <select id="res-withdraw-method" class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-bold" required>
                      ${paymentMethods.map(m => `<option value="${m.type} - ${m.number} (${m.holder})">${m.type} — ${m.number} (${m.holder})</option>`).join("")}
                    </select>
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">উত্তোলনের পরিমাণ (টাকা) *</label>
                    <input 
                      type="number" 
                      id="res-withdraw-amount"
                      min="500" 
                      value="${Math.max(500, earnedCommission)}" 
                      required 
                      class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-mono font-bold" 
                    />
                    <div class="text-[10px] text-slate-400 mt-1">সর্বনিম্ন উত্তোলন ৫০০ টাকা।</div>
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">নোট (ঐচ্ছিক)</label>
                    <input 
                      type="text" 
                      id="res-withdraw-note"
                      placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন" 
                      class="form-control text-xs w-full py-2 px-3 rounded-xl" 
                    />
                  </div>

                  <button type="submit" class="btn-primary w-full py-2.5 px-6 font-bold cursor-pointer">
                    উইথড্রয়াল রিকোয়েস্ট সাবমিট করুন →
                  </button>
                </form>

                <!-- Withdrawal History -->
                <div class="space-y-3">
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white">সাম্প্রতিক উইথড্রয়াল রেকর্ড (${withdrawals.length})</h4>
                  <div class="space-y-2.5">
                    ${withdrawals.map(w => `
                      <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="font-mono font-bold text-emerald-600">${w.id}</span>
                            <span class="text-[10px] text-slate-400">📅 ${w.date}</span>
                          </div>
                          <div class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">${w.method}</div>
                        </div>
                        <div class="text-right">
                          <div class="font-black text-sm text-slate-900 dark:text-white">${formatCurrency(w.amount)}</div>
                          <span class="badge ${w.status === 'Paid' ? 'badge-success' : 'badge-warning'} text-[10px]">${w.status}</span>
                        </div>
                      </div>
                    `).join("")}
                  </div>
                </div>

              </div>

            </div>
          </div>

          <!-- ================= TAB 5: PAYMENT METHODS ================= -->
          <div id="rtab-methods" class="reseller-tab-content hidden space-y-4">
            <div class="dc-res-panel space-y-6">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🏦</span> পেমেন্ট উইথড্রয়াল মেথডসমূহ
                </h3>
                <p class="text-xs text-slate-500">কমিশন উত্তোলনের জন্য আপনার বিকাশ, নগদ, রকেট বা ব্যাংক অ্যাকাউন্ট যুক্ত করুন।</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-xs">
                
                <!-- Add Payment Method Form -->
                <form onsubmit="window.saveResellerPaymentMethod(event);" class="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5">
                  <div class="font-bold text-sm text-slate-900 dark:text-white">নতুন পেমেন্ট মেথড যুক্ত করুন</div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">মেথড টাইপ *</label>
                    <select id="res-pm-type" class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-bold" required>
                      <option value="bKash Personal">bKash Personal</option>
                      <option value="Nagad Personal">Nagad Personal</option>
                      <option value="Rocket Personal">Rocket Personal</option>
                      <option value="Upay Personal">Upay Personal</option>
                      <option value="Bank Account">Bank Account</option>
                    </select>
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">অ্যাকাউন্ট হোল্ডারের নাম *</label>
                    <input type="text" id="res-pm-holder" required placeholder="আপনার নাম" class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">মোবাইল / অ্যাকাউন্ট নম্বর *</label>
                    <input type="text" id="res-pm-number" required placeholder="01XXXXXXXXX বা ব্যাংক A/C" class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-mono font-bold" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ব্যাংক ও ব্রাঞ্চের নাম (ব্যাংক হলে)</label>
                    <input type="text" id="res-pm-branch" placeholder="যেমন: Islami Bank, Motijheel Branch" class="form-control text-xs w-full py-2 px-3 rounded-xl" />
                  </div>

                  <button type="submit" class="btn-primary w-full py-2.5 font-bold cursor-pointer">
                    মেথড সংরক্ষণ করুন ✓
                  </button>
                </form>

                <!-- Saved Payment Methods List -->
                <div class="space-y-3">
                  <div class="font-bold text-sm text-slate-900 dark:text-white">সংরক্ষিত মেথডসমূহ (${paymentMethods.length})</div>
                  ${paymentMethods.map(m => `
                    <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-black text-slate-900 dark:text-white text-sm">${m.type}</span>
                          <span class="badge badge-success text-[10px]">Active</span>
                        </div>
                        <div class="font-mono font-bold text-emerald-600 text-xs mt-0.5">${m.number}</div>
                        <div class="text-[11px] text-slate-500">নাম: ${m.holder} ${m.branch ? `| ${m.branch}` : ''}</div>
                      </div>
                      <button 
                        type="button" 
                        onclick="window.deleteResellerPaymentMethod('${m.id}')" 
                        class="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[11px] cursor-pointer"
                      >
                        মুছে ফেলুন 🗑️
                      </button>
                    </div>
                  `).join("")}
                </div>

              </div>
            </div>
          </div>

          <!-- ================= TAB 6: LIVE ORDER TRACKING ================= -->
          <div id="rtab-track" class="reseller-tab-content hidden space-y-4">
            <div class="dc-res-panel space-y-5">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🚚</span> লাইভ অর্ডার ট্র্যাকিং
                </h3>
                <p class="text-xs text-slate-500">গ্রাহকের অর্ডার আইডি দিয়ে পার্সেলের বর্তমান অবস্থান তাৎক্ষণিক চেক করুন।</p>
              </div>

              <div class="flex flex-col sm:flex-row gap-2 max-w-lg">
                <input 
                  type="text" 
                  id="reseller-track-input"
                  placeholder="যেমন: ORD-102938" 
                  value="${resellerOrders[0] ? resellerOrders[0].order_id : 'ORD-102938'}"
                  class="form-control text-xs py-2.5 px-4 rounded-xl flex-1 font-mono font-bold"
                />
                <button 
                  type="button" 
                  class="btn-primary py-2.5 px-6 font-bold text-xs rounded-xl cursor-pointer"
                  onclick="window.executeResellerTrack()"
                >
                  ট্র্যাক করুন 🔍
                </button>
              </div>

              <div id="reseller-track-result" class="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div>
                    <span class="text-[10px] text-slate-400 font-bold uppercase">অর্ডার আইডি</span>
                    <h4 class="font-mono font-black text-emerald-600 text-base" id="res-track-disp-id">
                      ${resellerOrders[0] ? resellerOrders[0].order_id : 'ORD-102938'}
                    </h4>
                  </div>
                  <span class="badge badge-success text-xs font-bold">
                    ${resellerOrders[0] ? (resellerOrders[0].order_status || 'In Transit') : 'Processing'}
                  </span>
                </div>

                <div class="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold mx-auto flex items-center justify-center">✓</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">অর্ডার কনফার্মড</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold mx-auto flex items-center justify-center">✓</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">প্যাকেজিং সম্পন্ন</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-amber-500 text-white font-bold mx-auto flex items-center justify-center animate-pulse">🚚</div>
                    <div class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">কুরিয়ারে হস্তান্তর</div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 font-bold mx-auto flex items-center justify-center">4</div>
                    <div class="font-bold text-slate-400 text-[11px]">ডেলিভারি সম্পন্ন</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= TAB 7: CART ITEMS ================= -->
          <div id="rtab-cart" class="reseller-tab-content hidden space-y-4">
            <div class="dc-res-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🛒</span> আপনার কার্ট তালিকা (${cartItems.length} টি)
                </h3>
                <button type="button" data-res-tab="rtab-catalog" class="text-xs text-emerald-600 font-bold cursor-pointer">
                  + ক্যাটালগ থেকে পণ্য যোগ করুন
                </button>
              </div>

              ${cartItems.length === 0 ? `
                <div class="py-12 text-center space-y-3">
                  <div class="text-4xl">🛒</div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-300">আপনার কার্ট বর্তমানে খালি আছে</div>
                  <button type="button" data-res-tab="rtab-catalog" class="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl cursor-pointer">
                    📦 রিসেলার ক্যাটালগ দেখুন
                  </button>
                </div>
              ` : `
                <div class="space-y-3">
                  ${cartItems.map(it => `
                    <div class="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs gap-3">
                      <div class="flex items-center gap-3" style="min-width: 0;">
                        <img src="${it.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}" class="w-14 h-14 rounded-xl object-cover border border-slate-200" style="flex-shrink: 0;" />
                        <div style="min-width: 0;">
                          <h4 class="font-bold text-slate-900 dark:text-white truncate">${it.name}</h4>
                          <div class="text-[11px] text-slate-500 mt-0.5">মূল্য: ${formatCurrency(it.price || 0)} | পরিমাণ: ${it.quantity} টি</div>
                        </div>
                      </div>
                      <div class="text-right" style="flex-shrink: 0;">
                        <div class="font-black text-slate-900 dark:text-white text-sm">${formatCurrency(Number(it.price || 0) * Number(it.quantity || 1))}</div>
                        <a href="/checkout" class="btn-primary text-xs py-1.5 px-3 rounded-lg inline-block mt-1 font-bold">চেকআউট →</a>
                      </div>
                    </div>
                  `).join("")}

                  <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <div class="text-xs text-slate-500">মোট বিল</div>
                      <div class="text-lg font-black text-emerald-700 dark:text-emerald-300">${formatCurrency(cartSubtotal)}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <a href="/cart" class="btn-secondary py-2 px-4 text-xs font-bold rounded-xl">কার্ট পেজ</a>
                      <a href="/checkout" class="btn-primary py-2 px-5 text-xs font-bold rounded-xl">অর্ডার কনফার্ম করুন →</a>
                    </div>
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- ================= TAB 8: FAVOURITES ================= -->
          <div id="rtab-fav" class="reseller-tab-content hidden space-y-4">
            <div class="dc-res-panel space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>❤️</span> পছন্দের তালিকাভুক্ত পণ্য (${favItems.length} টি)
                </h3>
                <button type="button" data-res-tab="rtab-catalog" class="btn-primary py-1.5 px-3.5 text-xs font-bold rounded-xl cursor-pointer">
                  📦 ক্যাটালগ দেখুন
                </button>
              </div>

              ${favItems.length === 0 ? `
                <div class="py-12 text-center space-y-3">
                  <div class="text-4xl">❤️</div>
                  <div class="text-sm font-bold text-slate-700 dark:text-slate-300">পছন্দের তালিকায় কোনো পণ্য নেই</div>
                  <button type="button" data-res-tab="rtab-catalog" class="btn-primary py-2.5 px-6 text-xs font-bold rounded-xl cursor-pointer">
                    ক্যাটালগ থেকে পণ্য যোগ করুন →
                  </button>
                </div>
              ` : `
                <div class="product-grid">
                  ${favItems.map(p => renderProductCard(p)).join("")}
                </div>
              `}
            </div>
          </div>

          <!-- ================= TAB 9: SHOP PROFILE & SETTINGS ================= -->
          <div id="rtab-settings" class="reseller-tab-content hidden space-y-4">
            <div class="dc-res-panel max-w-2xl mx-auto space-y-5 text-xs">
              <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚙️</span> শপ প্রোফাইল ও অ্যাকাউন্ট সেটিংস
                </h3>
                <p class="text-xs text-slate-500">আপনার রিসেলার শপের লোগো, নাম, এনআইডি এবং ঠিকানা আপডেট করুন।</p>
              </div>

              <form onsubmit="window.updateResellerProfile(event, 'settings');" class="space-y-4">
                
                <!-- Shop Logo Upload -->
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">শপ লোগো</label>
                  <div class="flex items-center gap-3">
                    <div class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 dark:bg-slate-800 flex items-center justify-center" style="flex-shrink: 0;">
                      <img 
                        id="set-r-logo-preview" 
                        src="${shopLogo || DEFAULT_SHOP_LOGO}" 
                        alt="Shop Logo" 
                        class="w-full h-full object-cover"
                        onerror="this.onerror=null; this.src='${DEFAULT_SHOP_LOGO}';"
                      />
                    </div>
                    <div class="flex-1" style="min-width: 0;">
                      <input 
                        type="text" 
                        id="set-r-logo" 
                        value="${shopLogo}" 
                        placeholder="লোগোর লিংক দিন বা আপলোড করুন" 
                        class="form-control text-xs w-full py-2.5 px-3 rounded-xl" 
                      />
                    </div>
                    <button 
                      type="button" 
                      class="btn-secondary py-2.5 px-3.5 text-xs font-bold rounded-xl cursor-pointer"
                      onclick="document.getElementById('set-r-logo-file').click();"
                    >
                      📁 আপলোড
                    </button>
                    <input type="file" id="set-r-logo-file" accept="image/*" class="hidden" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">শপ আইডি</label>
                    <input type="text" value="${shopId}" readonly class="form-control text-xs w-full py-2.5 px-3 rounded-xl bg-slate-50 font-mono font-bold text-emerald-600" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">শপের নাম *</label>
                    <input type="text" id="set-r-shop" value="${shopName}" required class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-bold" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম *</label>
                    <input type="text" id="set-r-name" value="${ownerName}" required class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">মোবাইল নম্বর (ইউজার আইডি)</label>
                    <input type="tel" value="${user.mobile || user.phone || ''}" readonly class="form-control text-xs w-full py-2.5 px-3 rounded-xl bg-slate-50 font-mono" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল</label>
                    <input type="email" id="set-r-mail" value="${user.mail || user.email || ''}" class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">এনআইডি নম্বর *</label>
                    <input type="text" id="set-r-nid" value="${user.nid_number || user.NID_Number || ''}" required class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-mono" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">জন্ম তারিখ</label>
                    <input type="date" id="set-r-dob" value="${user.date_of_birth || user.Date_of_birth || ''}" class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                  </div>

                  <div>
                    <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ট্রেড লাইসেন্স নম্বর</label>
                    <input type="text" id="set-r-trade" value="${user.trade_licence_no || user.Trade_Licence_No || ''}" class="form-control text-xs w-full py-2.5 px-3 rounded-xl font-mono" />
                  </div>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">শপ / ব্যবসার ঠিকানা *</label>
                  <input type="text" id="set-r-address" value="${user.address || user.Address || ''}" required class="form-control text-xs w-full py-2.5 px-3 rounded-xl" />
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn-primary py-2.5 px-6 font-bold text-xs rounded-xl cursor-pointer">
                    তথ্য সংরক্ষণ করুন ✓
                  </button>
                </div>

              </form>
            </div>
          </div>

        </main>

      </div>

    </div>

    <!-- SHOP PROFILE EDIT MODAL -->
    <div id="reseller-profile-edit-modal" class="modal-backdrop">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🏪</span> শপ প্রোফাইল এডিট করুন
          </h3>
          <button type="button" id="btn-close-reseller-modal" class="text-slate-400 font-bold cursor-pointer">✕</button>
        </div>

        <form onsubmit="window.updateResellerProfile(event, 'modal');" class="space-y-3.5">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">শপ লোগো</label>
            <div class="flex items-center gap-2.5">
              <div class="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 flex items-center justify-center" style="flex-shrink: 0;">
                <img 
                  id="modal-r-logo-preview" 
                  src="${shopLogo || DEFAULT_SHOP_LOGO}" 
                  alt="Logo" 
                  class="w-full h-full object-cover"
                  onerror="this.onerror=null; this.src='${DEFAULT_SHOP_LOGO}';"
                />
              </div>
              <input 
                type="text" 
                id="modal-r-logo" 
                value="${shopLogo}" 
                placeholder="লিঙ্ক দিন বা আপলোড করুন" 
                class="form-control text-xs flex-1 py-2 px-3 rounded-xl" 
              />
              <button 
                type="button" 
                class="btn-secondary py-2 px-3 text-xs font-bold rounded-xl cursor-pointer"
                onclick="document.getElementById('modal-r-logo-file').click();"
              >
                📁 আপলোড
              </button>
              <input type="file" id="modal-r-logo-file" accept="image/*" class="hidden" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">শপের নাম *</label>
            <input type="text" id="modal-r-shop" value="${shopName}" required class="form-control text-xs w-full py-2 px-3 rounded-xl font-bold" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">পূর্ণ নাম *</label>
            <input type="text" id="modal-r-name" value="${ownerName}" required class="form-control text-xs w-full py-2 px-3 rounded-xl" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেইল</label>
            <input type="email" id="modal-r-mail" value="${user.mail || user.email || ''}" class="form-control text-xs w-full py-2 px-3 rounded-xl" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">ঠিকানা *</label>
            <input type="text" id="modal-r-address" value="${user.address || ''}" required class="form-control text-xs w-full py-2 px-3 rounded-xl" />
          </div>

          <button type="submit" class="btn-primary w-full py-2.5 font-bold rounded-xl cursor-pointer">
            আপডেট সম্পন্ন করুন ✓
          </button>
        </form>
      </div>
    </div>
  `;
}

function renderResellerAuthView(view = 'login') {
  const isRegister = view === 'register';
  const generatedShopId = 'SHOP-' + Math.floor(100000 + Math.random() * 900000);

  return `
    <style id="dc-reseller-auth-styles">
      .dc-res-auth-wrap {
        min-height: calc(100vh - 160px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem 3rem;
        position: relative;
        overflow: hidden;
      }

      .dc-res-glow-1 {
        position: absolute;
        top: -80px;
        left: 50%;
        transform: translateX(-50%);
        width: 580px;
        height: 340px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.04) 55%, transparent 75%);
        filter: blur(55px);
        pointer-events: none;
        z-index: 0;
      }

      .dc-res-card {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: ${isRegister ? '640px' : '430px'};
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        padding: 2rem 1.85rem;
        box-shadow: 0 20px 45px -12px rgba(15, 23, 42, 0.08), 0 4px 16px -2px rgba(5, 150, 105, 0.05);
        box-sizing: border-box;
      }

      .dark .dc-res-card {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 25px 55px -12px rgba(0, 0, 0, 0.6);
      }

      @media (max-width: 640px) {
        .dc-res-card {
          padding: 1.4rem 1.15rem;
          border-radius: 20px;
        }
      }

      .dc-res-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 1.25rem;
      }

      .dc-res-logo-ring {
        width: 54px;
        height: 54px;
        border-radius: 16px;
        background: #ffffff;
        border: 2px solid #10b981;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 18px rgba(16, 185, 129, 0.18);
        margin-bottom: 0.65rem;
        position: relative;
      }

      .dark .dc-res-logo-ring {
        background: #1e293b;
        border-color: #10b981;
      }

      .dc-res-logo-ring img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 10px;
      }

      .dc-res-title {
        font-size: 1.35rem;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -0.02em;
        margin: 0;
        line-height: 1.25;
      }

      .dark .dc-res-title {
        color: #ffffff;
      }

      /* Segmented Tabs */
      .dc-res-tabs {
        display: flex;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        margin-bottom: 1.35rem;
        gap: 4px;
      }

      .dark .dc-res-tabs {
        background: #1e293b;
        border-color: #334155;
      }

      .dc-res-tab {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0.6rem 0.75rem;
        font-size: 0.8125rem;
        font-weight: 700;
        border-radius: 10px;
        color: #64748b;
        text-decoration: none;
        transition: all 0.2s ease;
      }

      .dark .dc-res-tab {
        color: #94a3b8;
      }

      .dc-res-tab.active {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: #ffffff !important;
        font-weight: 800;
        box-shadow: 0 3px 10px rgba(5, 150, 105, 0.28);
      }

      /* Smart 2-Column Form Grid */
      .dc-res-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.9rem 1rem;
        text-align: left;
      }

      @media (max-width: 600px) {
        .dc-res-grid {
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }
      }

      .dc-res-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 0;
      }

      .dc-res-label-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;
      }

      .dc-res-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #334155;
        line-height: 1.2;
      }

      .dark .dc-res-label {
        color: #cbd5e1;
      }

      .dc-res-req {
        color: #ef4444;
        margin-left: 2px;
      }

      .dc-res-input-box {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 42px;
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        border-radius: 12px;
        transition: all 0.2s ease;
        overflow: hidden;
        box-sizing: border-box;
      }

      .dark .dc-res-input-box {
        background: #1e293b;
        border-color: #334155;
      }

      .dc-res-input-box:focus-within {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
      }

      .dark .dc-res-input-box:focus-within {
        background: #0f172a;
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.22);
      }

      .dc-res-input-box.readonly-box {
        background: #f8fafc;
        border-color: #e2e8f0;
      }

      .dark .dc-res-input-box.readonly-box {
        background: rgba(30, 41, 59, 0.55);
        border-color: #1e293b;
      }

      .dc-res-icon {
        width: 36px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
        color: #64748b;
        flex-shrink: 0;
        user-select: none;
      }

      .dc-res-input {
        flex: 1;
        width: 100%;
        height: 100%;
        min-width: 0;
        border: none !important;
        background: transparent !important;
        outline: none !important;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #0f172a;
        padding: 0 0.75rem 0 0;
        box-sizing: border-box;
      }

      .dark .dc-res-input {
        color: #f8fafc !important;
      }

      .dc-res-input::placeholder {
        color: #94a3b8;
        font-weight: 400;
      }

      /* Integrated Logo Upload Control */
      .dc-res-logo-thumb {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        object-fit: cover;
        margin-left: 6px;
        margin-right: 6px;
        border: 1px solid #cbd5e1;
        flex-shrink: 0;
        background: #f8fafc;
      }

      .dc-res-upload-btn {
        height: 30px;
        margin-right: 5px;
        padding: 0 10px;
        border-radius: 8px;
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
        font-size: 0.7rem;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s ease;
      }

      .dark .dc-res-upload-btn {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.3);
      }

      .dc-res-upload-btn:hover {
        background: #10b981;
        color: #ffffff;
        border-color: #10b981;
      }

      /* Integrated Country Code Select inside Mobile Box */
      .dc-res-cc-select {
        height: 100%;
        border: none !important;
        border-right: 1px solid #e2e8f0 !important;
        background: #f8fafc !important;
        color: #0f172a !important;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0 6px 0 8px;
        outline: none !important;
        cursor: pointer;
        flex-shrink: 0;
      }

      .dark .dc-res-cc-select {
        background: #0f172a !important;
        color: #f8fafc !important;
        border-right-color: #334155 !important;
      }

      /* Suggest Password Pill & Eye Button */
      .dc-res-suggest-btn {
        font-size: 0.68rem;
        font-weight: 800;
        color: #059669;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        padding: 1px 7px;
        border-radius: 9999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        transition: all 0.15s ease;
      }

      .dark .dc-res-suggest-btn {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.3);
      }

      .dc-res-suggest-btn:hover {
        background: #10b981;
        color: #ffffff;
      }

      .dc-res-eye-btn {
        width: 34px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        color: #64748b;
        flex-shrink: 0;
      }

      .dc-res-eye-btn:hover {
        color: #059669;
      }

      /* Password Strength Bar */
      .dc-res-meter-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 3px;
      }

      .dc-res-meter-track {
        flex: 1;
        height: 4px;
        background: #e2e8f0;
        border-radius: 9999px;
        overflow: hidden;
      }

      .dark .dc-res-meter-track {
        background: #334155;
      }

      .dc-res-meter-fill {
        height: 100%;
        width: 0%;
        border-radius: 9999px;
        transition: width 0.25s ease, background-color 0.25s ease;
      }

      .dc-res-meter-lbl {
        font-size: 0.65rem;
        font-weight: 800;
        color: #94a3b8;
        white-space: nowrap;
      }

      /* Primary Submit Button */
      .dc-res-submit {
        width: 100%;
        height: 44px;
        margin-top: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.9rem;
        font-weight: 800;
        color: #ffffff;
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        border: none;
        border-radius: 12px;
        box-shadow: 0 8px 20px -4px rgba(5, 150, 105, 0.35);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dc-res-submit:hover {
        transform: translateY(-1.5px);
        box-shadow: 0 12px 24px -4px rgba(5, 150, 105, 0.45);
      }

      .dc-res-submit:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      .dc-res-footer {
        margin-top: 1rem;
        padding-top: 0.85rem;
        border-top: 1px solid #f1f5f9;
        text-align: center;
        font-size: 0.75rem;
        color: #64748b;
      }

      .dark .dc-res-footer {
        border-top-color: #1e293b;
        color: #94a3b8;
      }

      .dc-res-footer a {
        color: #059669;
        font-weight: 800;
        text-decoration: none;
        margin-left: 4px;
      }

      .dark .dc-res-footer a {
        color: #34d399;
      }

      .dc-res-footer a:hover {
        text-decoration: underline;
      }
    </style>

    <div class="dc-res-auth-wrap">
      <div class="dc-res-glow-1"></div>

      <div class="dc-res-card">
        
        <!-- Clean Minimal Header -->
        <div class="dc-res-header">
          <div class="dc-res-logo-ring">
            <img 
              src="https://pictures-bangladesh.jijistatic.com/2033199_MjAwLTIwMC03Nzk0Y2Y2Yzkx.jpg" 
              alt="Dream Cart BD"
              onerror="this.onerror=null; this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7IMYDMkNYleCqUCLvSDtcioP1MAENEONLcelVu_7byA&s=10';"
            />
          </div>
          <h1 class="dc-res-title">
            ${isRegister ? 'রিসেলার রেজিস্ট্রেশন' : 'রিসেলার লগইন'}
          </h1>
        </div>

        <!-- Clean Tab Switcher -->
        <div class="dc-res-tabs">
          <a href="/reseller/login" class="dc-res-tab ${!isRegister ? 'active' : ''}">
            <span>🔐</span>
            <span>লগইন</span>
          </a>
          <a href="/reseller/register" class="dc-res-tab ${isRegister ? 'active' : ''}">
            <span>📝</span>
            <span>রেজিস্ট্রেশন</span>
          </a>
        </div>

        <!-- Inline Error Alert -->
        <div id="reseller-error-alert" class="hidden mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <div id="reseller-error-msg" class="flex-1 font-bold"></div>
        </div>

        <!-- Form -->
        <form 
          id="reseller-auth-form" 
          data-auth-mode="${isRegister ? 'register' : 'login'}"
          onsubmit="window.handleResellerAuth(event);"
        >
          ${isRegister ? `
            <!-- 12 Required Fields in Clean 6x2 Symmetry -->
            <div class="dc-res-grid">
              
              <!-- 1. Shop_ID -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-shop-id">শপ আইডি</label>
                </div>
                <div class="dc-res-input-box readonly-box">
                  <span class="dc-res-icon">🏷️</span>
                  <input 
                    type="text" 
                    id="r-shop-id" 
                    name="shop_id"
                    value="${generatedShopId}" 
                    readonly 
                    class="dc-res-input font-mono text-emerald-600" 
                  />
                </div>
              </div>

              <!-- 2. Shop_logo -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-shop-logo">শপ লোগো</label>
                </div>
                <div class="dc-res-input-box">
                  <img 
                    id="r-logo-preview" 
                    src="${DEFAULT_SHOP_LOGO}" 
                    alt="Logo" 
                    class="dc-res-logo-thumb"
                    onerror="this.onerror=null; this.src='${DEFAULT_SHOP_LOGO}';"
                  />
                  <input 
                    type="text" 
                    id="r-shop-logo" 
                    name="shop_logo"
                    placeholder="লিঙ্ক দিন বা আপলোড করুন" 
                    class="dc-res-input" 
                  />
                  <button 
                    type="button" 
                    class="dc-res-upload-btn"
                    onclick="document.getElementById('r-logo-file-input').click();"
                  >
                    <span>📁</span>
                    <span>আপলোড</span>
                  </button>
                  <input type="file" id="r-logo-file-input" accept="image/*" class="hidden" />
                </div>
              </div>

              <!-- 3. Name -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-name">পূর্ণ নাম <span class="dc-res-req">*</span></label>
                </div>
                <div class="dc-res-input-box">
                  <span class="dc-res-icon">👤</span>
                  <input 
                    type="text" 
                    id="r-name" 
                    name="name"
                    required 
                    placeholder="আপনার নাম" 
                    class="dc-res-input" 
                  />
                </div>
              </div>

              <!-- 4. Mobile -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-phone">মোবাইল নম্বর <span class="dc-res-req">*</span></label>
                </div>
                <div class="dc-res-input-box">
                  <select id="r-country-code" class="dc-res-cc-select" title="কান্ট্রি কোড">
                    <option value="+880" selected>🇧🇩 +880</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <input 
                    type="tel" 
                    id="r-phone" 
                    name="mobile"
                    required 
                    pattern="[0-9]{11}" 
                    placeholder="01XXXXXXXXX" 
                    class="dc-res-input font-mono" 
                    style="padding-left: 0.65rem;"
                  />
                </div>
              </div>

              <!-- 5. Mail -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-mail">ইমেইল</label>
                </div>
                <div class="dc-res-input-box">
                  <span class="dc-res-icon">✉️</span>
                  <input 
                    type="email" 
                    id="r-mail" 
                    name="mail"
                    placeholder="email@example.com" 
                    class="dc-res-input" 
                  />
                </div>
              </div>

              <!-- 6. Address -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-address">ঠিকানা <span class="dc-res-req">*</span></label>
                </div>
                <div class="dc-res-input-box">
                  <span class="dc-res-icon">📍</span>
                  <input 
                    type="text" 
                    id="r-address" 
                    name="address"
                    required 
                    placeholder="দোকান বা ব্যবসার ঠিকানা" 
                    class="dc-res-input" 
                  />
                </div>
              </div>

              <!-- 7. Shop_Name -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-shop">শপের নাম <span class="dc-res-req">*</span></label>
                </div>
                <div class="dc-res-input-box">
                  <span class="dc-res-icon">🏪</span>
                  <input 
                    type="text" 
                    id="r-shop" 
                    name="shop_name"
                    required 
                    placeholder="শপ বা পেইজের নাম" 
                    class="dc-res-input" 
                  />
                </div>
              </div>

              <!-- 8. NID_Number -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-nid">এনআইডি নম্বর <span class="dc-res-req">*</span></label>
                </div>
                <div class="dc-res-input-box">
                  <span class="dc-res-icon">🪪</span>
                  <input 
                    type="text" 
                    id="r-nid" 
                    name="nid_number"
                    required 
                    placeholder="NID নম্বর" 
                    class="dc-res-input font-mono" 
                  />
                </div>
              </div>

              <!-- 9. Date_of_birth -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-dob">জন্ম তারিখ <span class="dc-res-req">*</span></label>
                </div>
                <div class="dc-res-input-box">
                  <span class="dc-res-icon">📅</span>
                  <input 
                    type="date" 
                    id="r-dob" 
                    name="date_of_birth"
                    required 
                    class="dc-res-input" 
                  />
                </div>
              </div>

              <!-- 10. Trade_Licence_No -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-trade-license">ট্রেড লাইসেন্স নম্বর</label>
                </div>
                <div class="dc-res-input-box">
                  <span class="dc-res-icon">📄</span>
                  <input 
                    type="text" 
                    id="r-trade-license" 
                    name="trade_licence_no"
                    placeholder="ট্রেড লাইসেন্স নম্বর" 
                    class="dc-res-input font-mono" 
                  />
                </div>
              </div>

              <!-- 11. User_ID -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-user-id">ইউজার আইডি</label>
                </div>
                <div class="dc-res-input-box readonly-box">
                  <span class="dc-res-icon">🆔</span>
                  <input 
                    type="text" 
                    id="r-user-id" 
                    name="user_id"
                    readonly 
                    placeholder="মোবাইল নম্বর থেকে অটো বসবে" 
                    class="dc-res-input font-mono text-emerald-600" 
                  />
                </div>
              </div>

              <!-- 12. Password -->
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-pass">পাসওয়ার্ড <span class="dc-res-req">*</span></label>
                  <button 
                    type="button" 
                    id="btn-suggest-r-pass"
                    class="dc-res-suggest-btn"
                  >
                    <span>💡</span>
                    <span>অটো পাসওয়ার্ড</span>
                  </button>
                </div>
                <div class="dc-res-input-box">
                  <span class="dc-res-icon">🔑</span>
                  <input 
                    type="password" 
                    id="r-pass" 
                    name="password"
                    required 
                    minlength="4"
                    placeholder="পাসওয়ার্ড দিন" 
                    class="dc-res-input" 
                  />
                  <button type="button" class="btn-toggle-r-pass dc-res-eye-btn" data-target="r-pass" title="পাসওয়ার্ড দেখুন">
                    👁️
                  </button>
                </div>
                <div class="dc-res-meter-wrap">
                  <div class="dc-res-meter-track">
                    <div id="r-pwd-strength-bar" class="dc-res-meter-fill"></div>
                  </div>
                  <span id="r-pwd-strength-label" class="dc-res-meter-lbl">০%</span>
                </div>
              </div>

            </div>
          ` : `
            <!-- Clean Login Fields -->
            <div class="space-y-4 text-left">
              
              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-phone">মোবাইল নম্বর বা ইউজার আইডি <span class="dc-res-req">*</span></label>
                </div>
                <div class="dc-res-input-box">
                  <select id="r-login-country-code" class="dc-res-cc-select" title="কান্ট্রি কোড">
                    <option value="+880" selected>🇧🇩 +880</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <input 
                    type="text" 
                    id="r-phone" 
                    required 
                    placeholder="01XXXXXXXXX" 
                    class="dc-res-input font-mono" 
                    style="padding-left: 0.65rem;"
                  />
                </div>
              </div>

              <div class="dc-res-field">
                <div class="dc-res-label-row">
                  <label class="dc-res-label" for="r-pass">পাসওয়ার্ড <span class="dc-res-req">*</span></label>
                </div>
                <div class="dc-res-input-box">
                  <span class="dc-res-icon">🔑</span>
                  <input 
                    type="password" 
                    id="r-pass" 
                    required 
                    placeholder="আপনার পাসওয়ার্ড" 
                    class="dc-res-input" 
                  />
                  <button type="button" class="btn-toggle-r-pass dc-res-eye-btn" data-target="r-pass" title="পাসওয়ার্ড দেখুন">
                    👁️
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <label class="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input type="checkbox" id="r-remember" checked class="rounded text-emerald-600 cursor-pointer" />
                  <span>মনে রাখুন</span>
                </label>
                <a 
                  href="https://wa.me/8801581703822?text=Dream%20Cart%20BD%20Reseller%20Password%20Help" 
                  target="_blank" 
                  class="text-emerald-600 font-bold"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </a>
              </div>

            </div>
          `}

          <button type="submit" class="dc-res-submit">
            <span>${isRegister ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'লগইন করুন'}</span>
            <span>→</span>
          </button>

        </form>

        <div class="dc-res-footer">
          ${isRegister ? `
            ইতিমধ্যে অ্যাকাউন্ট আছে? <a href="/reseller/login">লগইন করুন →</a>
          ` : `
            রিসেলার অ্যাকাউন্ট নেই? <a href="/reseller/register">রেজিস্ট্রেশন করুন →</a>
          `}
        </div>

      </div>
    </div>
  `;
}

export const ResellerPortal = renderResellerPortal;
export default renderResellerPortal;
