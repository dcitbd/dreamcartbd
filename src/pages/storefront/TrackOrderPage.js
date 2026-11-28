/**
 * DREAM CART BD — ORDER TRACKING PAGE (src/pages/storefront/TrackOrderPage.js)
 * Ultra-Fast Live Tracking Architecture:
 * - Instant 0ms Render: Zero blocking network waits or render-blocking CSS @import
 * - GPU-Optimized 3D Scoped Styles (.tr-page-root): Preserves exact 3D luxury design without blur/box-shadow repaint lag
 * - 100% Live Parcel Progress Tracker: Direct fresh server lookup (/api/index.php -> orders/get & orders/list force sync)
 *   + automatic background live polling (12s when tab visible) + instant cross-tab sync + manual refresh
 * - Complete Monotonic 5-Stage Status Engine (20% -> 40% -> 60% -> 80% -> 100%) supporting all Admin/Sheet statuses
 * - Customer Privacy First: Zero default/demo orders or sample text
 * - 100% Compatible with main.js, router.js & Voucher.js (including printVoucherOnly & @media print)
 */

import { apiClient } from '../../api/client.js';
import { formatCurrency } from '../../utils/format.js';
import { escapeHtml } from '../../utils/security.js';
import { renderVoucher } from '../../components/Voucher.js';

const TRACK_STYLE_ID = 'track-page-custom-styles';
const TRACK_FONT_ID = 'dcbd-track-hind-siliguri-font';
const LIVE_POLL_INTERVAL_MS = 12000;

let _livePollTimer = null;
let _activeQuery = '';
let _activeOrderFingerprint = '';
let _syncInFlight = null;
let _listenersBound = false;

/**
 * Inject non-blocking Google Font & scoped CSS once into <head>
 * Eliminates repeated 1500+ line <style> re-parsing and render-blocking @import on every navigation/search.
 */
function ensureTrackStylesAndFont() {
  if (typeof document === 'undefined' || !document.head) return;

  if (!document.getElementById(TRACK_FONT_ID)) {
    const link = document.createElement('link');
    link.id = TRACK_FONT_ID;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap';
    link.media = 'print';
    link.onload = function () { this.media = 'all'; };
    document.head.appendChild(link);
  }

  if (!document.getElementById(TRACK_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = TRACK_STYLE_ID;
    style.textContent = TRACK_PAGE_CSS;
    document.head.appendChild(style);
  }
}

/**
 * Standardize and normalize raw order rows from PHP API, Google Sheets 'Orders' tab,
 * or localStorage into a consistent Dream Cart BD order object.
 */
function normalizeSheetOrder(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const orderId = String(
    raw.order_id || raw.orderId || raw.orderid || raw.OrderID || raw.Order_ID || raw['Order ID'] || raw.col_1 || ''
  ).trim();
  const phone = String(
    raw.phone || raw.Phone || raw.customer_phone || raw.Customer_Phone || raw.col_4 || ''
  ).trim();
  const customerName = String(
    raw.customer_name || raw.customerName || raw.name || raw.CustomerName || raw.Customer_Name || raw.col_3 || ''
  ).trim();

  if (!orderId && !phone && !customerName) return null;

  const address = String(
    raw.address || raw.Address || raw.delivery_address || raw.Delivery_Address || raw.col_5 || ''
  ).trim();

  const productsText = String(
    raw.products || raw.Products || raw.product_name || raw.items_name || raw.col_6 || ''
  ).trim();

  const color = String(raw.color || raw.Color || raw.col_7 || '').trim();
  const size = String(raw.size || raw.Size || raw.col_8 || '').trim();
  const quantity = Math.max(1, parseInt(raw.quantity || raw.Quantity || raw.col_9 || 1, 10) || 1);

  const totalAmount = parseFloat(
    raw.total_amount !== undefined ? raw.total_amount :
    (raw.Total_Amount !== undefined ? raw.Total_Amount :
    (raw.totalAmount !== undefined ? raw.totalAmount :
    (raw.total !== undefined ? raw.total :
    (raw.col_10 !== undefined ? raw.col_10 : 0))))
  ) || 0;

  const deliveryCharge = parseFloat(
    raw.delivery_charge !== undefined ? raw.delivery_charge :
    (raw.Delivery_Charge !== undefined ? raw.Delivery_Charge :
    (raw.deliveryCharge !== undefined ? raw.deliveryCharge :
    (raw.delivery_fee !== undefined ? raw.delivery_fee :
    (raw.deliveryFee !== undefined ? raw.deliveryFee : 0))))
  ) || 0;

  const paymentMethod = String(
    raw.payment_method || raw.Payment_Method || raw.paymentMethod || raw.PaymentMethod || raw.method || raw.col_11 || 'Cash On Delivery (COD)'
  ).trim();

  const transactionId = String(
    raw.transaction_id || raw.Transaction_ID || raw.transactionId || raw.trx_id || raw.col_12 || 'N/A'
  ).trim();

  const paymentStatus = String(
    raw.payment_status || raw.Payment_Status || raw.paymentStatus || raw.PaymentStatus || raw.col_13 ||
    (paymentMethod.toLowerCase().includes('cod') || paymentMethod.toLowerCase().includes('cash') ? 'COD' : 'Paid')
  ).trim();

  // Support every possible casing/column name from PHP API, Admin Panel & Google Sheets
  const orderStatus = String(
    raw.order_status || raw.Order_Status || raw['Order Status'] || raw.orderStatus ||
    raw.OrderStatus || raw.status || raw.Status || raw.col_14 || 'Order Placed'
  ).trim();

  const dateStr = String(
    raw.date || raw.Date || raw.created_at || raw.createdAt || raw.timestamp || raw.col_0 || ''
  ).trim();

  const courier = String(
    raw.courier || raw.Courier || raw.courier_name || raw.courierName || raw.consignment_id || raw.col_17 || 'Steadfast / Pathao Express'
  ).trim();

  let items = [];
  if (Array.isArray(raw.items) && raw.items.length > 0) {
    items = raw.items.map(it => ({
      name: it.name || it.title || 'পণ্য',
      quantity: Math.max(1, parseInt(it.quantity || 1, 10) || 1),
      price: parseFloat(it.price || it.unit_price || 0) || 0,
      color: it.color || '',
      size: it.size || '',
      thumbnail: it.thumbnail || it.image || ''
    }));
  } else if (productsText) {
    const unitPrice = quantity > 0 && totalAmount > 0
      ? Math.round(Math.max(0, totalAmount - deliveryCharge) / quantity)
      : totalAmount;
    items = [{
      name: productsText,
      quantity: quantity,
      price: unitPrice,
      color: color,
      size: size
    }];
  }

  return {
    order_id: orderId,
    customer_name: customerName || 'সম্মানিত গ্রাহক',
    phone: phone,
    address: address || 'বাংলাদেশ',
    products: productsText,
    color: color,
    size: size,
    quantity: quantity,
    total_amount: totalAmount,
    delivery_charge: deliveryCharge,
    payment_method: paymentMethod,
    transaction_id: transactionId,
    payment_status: paymentStatus,
    order_status: orderStatus,
    courier: courier,
    date: dateStr,
    items: items,
    account_type: raw.account_type || raw.Account_Type || raw.col_2 || 'Customer',
    reseller_commission: raw.reseller_commission || raw.col_15 || 0,
    commission_status: raw.commission_status || raw.col_16 || 'Pending',
    _updated_ts: Number(raw._updated_ts || 0) || 0
  };
}

/**
 * Clean 10-digit BD phone normalization for accurate matching
 */
function cleanPhoneDigits(val) {
  const digits = String(val || '').replace(/[^0-9]/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

/**
 * Match an order record against a user's Order ID or phone query
 */
function doesOrderMatchQuery(rawOrder, queryStr) {
  if (!rawOrder || !queryStr) return false;
  const qLower = queryStr.trim().toLowerCase();
  const qCleanDigits = cleanPhoneDigits(qLower);

  const oId = String(
    rawOrder.order_id || rawOrder.orderId || rawOrder.orderid || rawOrder.OrderID || rawOrder.col_1 || ''
  ).trim().toLowerCase();
  const oPhoneRaw = String(
    rawOrder.phone || rawOrder.Phone || rawOrder.customer_phone || rawOrder.col_4 || ''
  ).replace(/[^0-9]/g, '');
  const oPhone10 = cleanPhoneDigits(oPhoneRaw);

  if (oId && (oId === qLower || oId.includes(qLower))) return true;
  if (qCleanDigits.length >= 6 && oPhoneRaw) {
    if (oPhone10 && qCleanDigits.length === 10 && oPhone10 === qCleanDigits) return true;
    if (oPhoneRaw.includes(qLower.replace(/[^0-9]/g, ''))) return true;
  }
  return false;
}

/**
 * Monotonic 5-stage progress calculator.
 * Guarantees accurate live step progression & percentage (20% / 40% / 60% / 80% / 100%)
 * for every status used by Dream Cart BD Admin Panel, PHP API & Google Sheets.
 */
function computeOrderTrackingState(statusRaw) {
  const status = String(statusRaw || 'Order Placed').trim() || 'Order Placed';
  const s = status.toLowerCase();

  const isCancelled = ['cancel', 'বাতিল', 'reject', 'declined', 'void'].some(k => s.includes(k));
  const isReturned = !isCancelled && ['return', 'রিটার্ন', 'refund'].some(k => s.includes(k));
  const isTerminated = isCancelled || isReturned;

  let stage = 1;
  if (isTerminated) {
    stage = 0;
  } else if (
    !s.includes('out for delivery') &&
    ['delivered', 'completed', 'complete', 'success', 'ডেলিভারি সম্পন্ন', 'সফল ডেলিভারি', 'ডেলিভার্ড', 'সম্পন্ন'].some(k => s.includes(k))
  ) {
    stage = 5;
  } else if (
    ['out for delivery', 'out_for_delivery', 'rider', 'on the way', 'on_the_way', 'delivery man', 'রাইডার', 'ডেলিভারি পথে', 'পথে আছে', 'পথে রয়েছে'].some(k => s.includes(k))
  ) {
    stage = 4;
  } else if (
    ['shipped', 'shipping', 'in courier', 'in courior', 'courier', 'courior', 'in transit', 'in_transit', 'transit', 'dispatched', 'dispatch', 'picked', 'arrived at hub', 'hub', 'কুরিয়ার', 'কুরিয়ার', 'ট্রানজিট', 'শিপড'].some(k => s.includes(k))
  ) {
    stage = 3;
  } else if (
    ['confirmed', 'confirm', 'processing', 'process', 'packing', 'packed', 'packaging', 'ready to ship', 'ready_to_ship', 'approved', 'verified', 'কনফার্ম', 'নিশ্চিত', 'প্রসেসিং', 'প্যাকিং'].some(k => s.includes(k))
  ) {
    stage = 2;
  } else {
    stage = 1;
  }

  const steps = [
    {
      stepNum: 1,
      title: 'Order Placed & Recorded',
      titleBn: 'অর্ডার গ্রহণ ও সিস্টেম এন্ট্রি',
      desc: 'অর্ডারটি সফলভাবে ড্রিম কার্ট বিডি সিস্টেমে গ্রহণ ও লিপিবদ্ধ করা হয়েছে',
      active: stage >= 1
    },
    {
      stepNum: 2,
      title: 'Confirmed & Quality Packaged',
      titleBn: 'অর্ডার নিশ্চিত ও মান যাচাই সম্পন্ন',
      desc: 'পদুয়ার বাজার কুমিল্লা হাব থেকে প্রোডাক্ট কোয়ালিটি চেক ও সিকিউর প্যাকিং সম্পন্ন',
      active: stage >= 2
    },
    {
      stepNum: 3,
      title: 'Handed over to Courier (In Transit)',
      titleBn: 'কুরিয়ার পার্টনারে হস্তান্তর ও ট্রানজিট',
      desc: 'পার্সেলটি বিশ্বস্ত কুরিয়ার নেটওয়ার্কে (Steadfast / Pathao) হস্তান্তরিত ও ট্রানজিটে রয়েছে',
      active: stage >= 3
    },
    {
      stepNum: 4,
      title: 'Out for Delivery (Rider en route)',
      titleBn: 'ডেলিভারি রাইডারের নিকট হস্তান্তর',
      desc: 'কুরিয়ার ডেলিভারি রাইডার গ্রাহকের গন্তব্যে পৌঁছানোর জন্য পথে রয়েছে',
      active: stage >= 4
    },
    {
      stepNum: 5,
      title: 'Delivered & Payment Verified',
      titleBn: 'সফল ডেলিভারি ও মূল্য পরিশোধ সম্পন্ন',
      desc: 'গ্রাহকের নিকট পার্সেল সফলভাবে হস্তান্তর এবং পেমেন্ট সম্পন্ন হয়েছে',
      active: stage >= 5
    }
  ];

  // Clear live percentage: 20% -> 40% -> 60% -> 80% -> 100%
  const progressPercent = isTerminated ? 0 : Math.min(100, Math.round((stage / steps.length) * 100));
  // Vertical line spans from bullet 1 center to bullet 5 center
  const timelineLinePercent = stage <= 1 ? 0 : Math.min(100, Math.round(((stage - 1) / (steps.length - 1)) * 100));

  const isDelivered = stage === 5;
  const isOutForDelivery = stage === 4;
  const isInTransit = stage === 3 || stage === 4;
  const isConfirmed = stage === 2;

  const statusToneClass = isTerminated
    ? 'tr-status-cancelled'
    : isDelivered
      ? 'tr-status-delivered'
      : isInTransit
        ? 'tr-status-transit'
        : isConfirmed
          ? 'tr-status-confirmed'
          : 'tr-status-pending';

  return {
    status,
    stage,
    steps,
    progressPercent,
    timelineLinePercent,
    isCancelled,
    isReturned,
    isTerminated,
    isDelivered,
    isOutForDelivery,
    isInTransit,
    isConfirmed,
    statusToneClass
  };
}

/**
 * Fingerprint to avoid redundant DOM re-renders during background live polling
 */
function buildOrderFingerprint(order) {
  if (!order) return '';
  return [
    order.order_id,
    order.order_status,
    order.payment_status,
    order.courier,
    order.total_amount,
    order.delivery_charge,
    order.address,
    order.products,
    order.date,
    order.transaction_id
  ].join('|');
}

/**
 * Synchronous local cache lookup for instant 0ms initial paint while live server check runs
 */
function findOrderInLocalCache(queryStr) {
  if (!queryStr) return null;
  const pool = [];

  if (apiClient && Array.isArray(apiClient.sheetOrders) && apiClient.sheetOrders.length > 0) {
    for (let i = 0; i < apiClient.sheetOrders.length; i++) {
      pool.push(apiClient.sheetOrders[i]);
    }
  }

  try {
    const rawLocal = localStorage.getItem('dcbd_sheet_orders');
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed)) {
        for (let i = 0; i < parsed.length; i++) pool.push(parsed[i]);
      }
    }
  } catch (e) {}

  try {
    const lastOrder = JSON.parse(localStorage.getItem('dcbd_last_order') || 'null');
    if (lastOrder) pool.push(lastOrder);
  } catch (e) {}

  for (let i = 0; i < pool.length; i++) {
    if (doesOrderMatchQuery(pool[i], queryStr)) {
      return normalizeSheetOrder(pool[i]);
    }
  }
  return null;
}

/**
 * Keep local cache synchronized with fresh server order so future loads are also up-to-date
 */
function upsertOrderIntoLocalCache(freshOrder) {
  if (!freshOrder || !freshOrder.order_id) return;
  const targetId = freshOrder.order_id.toLowerCase();

  try {
    if (apiClient && Array.isArray(apiClient.sheetOrders)) {
      const idx = apiClient.sheetOrders.findIndex(
        o => String(o.order_id || o.orderId || '').trim().toLowerCase() === targetId
      );
      if (idx >= 0) {
        apiClient.sheetOrders[idx] = { ...apiClient.sheetOrders[idx], ...freshOrder };
      } else {
        apiClient.sheetOrders.unshift(freshOrder);
      }
    }
  } catch (e) {}

  try {
    const rawLocal = localStorage.getItem('dcbd_sheet_orders');
    const arr = rawLocal ? JSON.parse(rawLocal) : [];
    if (Array.isArray(arr)) {
      const idx = arr.findIndex(
        o => String(o.order_id || o.orderId || '').trim().toLowerCase() === targetId
      );
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...freshOrder };
      } else {
        arr.unshift(freshOrder);
      }
      localStorage.setItem('dcbd_sheet_orders', JSON.stringify(arr));
    }
  } catch (e) {}

  try {
    const lastOrder = JSON.parse(localStorage.getItem('dcbd_last_order') || 'null');
    if (lastOrder && String(lastOrder.order_id || lastOrder.orderId || '').trim().toLowerCase() === targetId) {
      localStorage.setItem('dcbd_last_order', JSON.stringify({ ...lastOrder, ...freshOrder }));
    }
  } catch (e) {}
}

/**
 * Direct ultra-fast PHP Gateway lookup (< 50ms) with cache-busting
 */
async function fetchOrderDirectFromPhp(queryStr) {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return null;
  if (window.__DCBD_PHP_UNAVAILABLE__ || (window.location && window.location.hostname.includes('github.io'))) {
    return null;
  }

  const baseApi = window.__DCBD_PHP_API_URL__ || ((window.__APP_BASE__ || '') + '/api/index.php');
  const url = `${baseApi}?action=${encodeURIComponent('orders/get')}&orderId=${encodeURIComponent(queryStr)}&phone=${encodeURIComponent(queryStr)}&_t=${Date.now()}`;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 2500) : null;

  try {
    const resp = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
      signal: controller ? controller.signal : undefined
    });
    if (timer) clearTimeout(timer);
    if (!resp.ok) return null;

    const json = await resp.json();
    if (json && json.success && json.data) {
      return normalizeSheetOrder(json.data);
    }
    return null;
  } catch (e) {
    if (timer) clearTimeout(timer);
    return null;
  }
}

/**
 * Live order fetcher:
 * 1) Tries direct high-speed PHP API (/api/index.php?action=orders/get) first (< 50ms)
 * 2) Falls back to apiClient.request('orders/list', { force: true }) for partial IDs or GitHub Pages
 * Always deduplicated so rapid refreshes never stack requests.
 */
async function fetchLiveOrderRecord(queryStr, forceFullList = false) {
  if (!queryStr) return null;

  if (_syncInFlight && _syncInFlight.query === queryStr) {
    return _syncInFlight.promise;
  }

  const promise = (async () => {
    // Channel 1: Direct PHP live endpoint (fastest, bypasses slow Google Sheet fetch when cached in PHP/SQLite)
    if (!forceFullList) {
      const phpOrder = await fetchOrderDirectFromPhp(queryStr);
      if (phpOrder) {
        upsertOrderIntoLocalCache(phpOrder);
        return phpOrder;
      }
    }

    // Channel 2: Live orders/list force sync (handles partial Order IDs, Sheet updates & GitHub Pages)
    try {
      const listPromise = apiClient.request('orders/list', { force: true });
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 4500));
      const listRes = await Promise.race([listPromise, timeoutPromise]);

      const items = listRes && listRes.data && Array.isArray(listRes.data.items) ? listRes.data.items : [];
      if (items.length > 0) {
        const found = items.find(r => doesOrderMatchQuery(r, queryStr));
        if (found) {
          const normalized = normalizeSheetOrder(found);
          upsertOrderIntoLocalCache(normalized);
          return normalized;
        }
      }
    } catch (e) {}

    // Channel 3: Retry direct PHP if forceFullList was true and list timed out
    if (forceFullList) {
      const phpOrder = await fetchOrderDirectFromPhp(queryStr);
      if (phpOrder) {
        upsertOrderIntoLocalCache(phpOrder);
        return phpOrder;
      }
    }

    return null;
  })();

  _syncInFlight = { query: queryStr, promise };
  try {
    return await promise;
  } finally {
    if (_syncInFlight && _syncInFlight.promise === promise) {
      _syncInFlight = null;
    }
  }
}

/**
 * Render the Welcome / Guide state (when no search has been performed)
 */
function renderWelcomeSection() {
  return `
    <!-- 3D Feature Highlight Boxes -->
    <section class="tr-features-grid print-hide">
      <article class="tr-feature-card">
        <div class="tr-feature-icon tr-icon-emerald">⚡</div>
        <h3 class="tr-feature-title">রিয়েল-টাইম স্ট্যাটাস</h3>
        <p class="tr-feature-desc">
          পদুয়ার বাজার কুমিল্লা হাব থেকে পার্সেল প্যাকিং ও কুরিয়ার ট্রানজিটের প্রতিটি ধাপ সরাসরি লাইভ দেখুন।
        </p>
      </article>

      <article class="tr-feature-card">
        <div class="tr-feature-icon tr-icon-blue">🚚</div>
        <h3 class="tr-feature-title">দ্রুততম হোম ডেলিভারি</h3>
        <p class="tr-feature-desc">
          Steadfast ও Pathao Express-এর মাধ্যমে ঢাকা ও কুমিল্লায় ২৪-৪৮ ঘণ্টা এবং সারাদেশে ৭২ ঘণ্টায় ডেলিভারি।
        </p>
      </article>

      <article class="tr-feature-card">
        <div class="tr-feature-icon tr-icon-purple">🔒</div>
        <h3 class="tr-feature-title">ব্যক্তিগত তথ্য সুরক্ষা</h3>
        <p class="tr-feature-desc">
          আপনার অর্ডারের তথ্য সম্পূর্ণ গোপন ও সুরক্ষিত। শুধুমাত্র আপনার আইডি বা ফোন নম্বর দ্বারাই তা উন্মোচিত হবে।
        </p>
      </article>
    </section>

    <!-- How to Find Order ID Guide Card -->
    <section class="tr-card print-hide">
      <div class="tr-section-heading">
        <div class="tr-section-heading-icon">📋</div>
        <h3>কীভাবে আপনার অর্ডার আইডি খুঁজে পাবেন?</h3>
      </div>

      <div class="tr-guide-grid">
        <div class="tr-guide-box">
          <span class="tr-guide-num">১</span>
          <div class="tr-guide-title">এসএমএস বা ইমেইল</div>
          <div class="tr-guide-desc">অর্ডার কনফার্মেশনের পর আপনার নম্বরে প্রেরিত SMS-এ অর্ডার আইডি উল্লেখ থাকে।</div>
        </div>

        <div class="tr-guide-box">
          <span class="tr-guide-num">২</span>
          <div class="tr-guide-title">মোবাইল নম্বর ব্যবহার</div>
          <div class="tr-guide-desc">অর্ডার আইডি মনে না থাকলে চেকআউটে ব্যবহৃত ১১ ডিজিটের মোবাইল নম্বর লিখুন।</div>
        </div>

        <div class="tr-guide-box">
          <span class="tr-guide-num">৩</span>
          <div class="tr-guide-title">হটলাইন সাপোর্ট</div>
          <div class="tr-guide-desc">যেকোনো জটিলতায় আমাদের হোয়াটসঅ্যাপ হটলাইনে যোগাযোগ করে আইডি জেনে নিন।</div>
        </div>
      </div>

      <div class="tr-hotline-bar">
        <div class="tr-hotline-label">
          <span>🎧</span>
          <span>সরাসরি কাস্টমার কেয়ার প্রতিনিধির সাথে কথা বলতে:</span>
        </div>
        <div class="tr-hotline-btns">
          <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="tr-btn-3d tr-btn-emerald">
            <span>💬</span>
            <span>01581703822 (WhatsApp)</span>
          </a>
          <a href="tel:01818273838" class="tr-btn-3d">
            <span>📞</span>
            <span>01818273838 (হটলাইন)</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

/**
 * Render instant lightweight loading card (only when order is not in local cache yet)
 */
function renderSearchingSection(queryStr) {
  return `
    <section class="tr-card tr-loading-card print-hide" aria-live="polite">
      <div class="tr-spinner-ring" aria-hidden="true"></div>
      <h3 class="tr-loading-title">লাইভ অর্ডার তথ্য যাচাই করা হচ্ছে...</h3>
      <p class="tr-loading-desc">
        <span class="tr-query-chip-live tr-mono">${escapeHtml(queryStr)}</span> এর সর্বশেষ ডেলিভারি স্ট্যাটাস সার্ভার থেকে সংগ্রহ করা হচ্ছে।
      </p>
    </section>
  `;
}

/**
 * Render Not Found card
 */
function renderNotFoundSection(queryStr) {
  return `
    <section class="tr-card tr-notfound-card print-hide">
      <div class="tr-notfound-icon">⚠️</div>

      <h3 class="tr-notfound-title">কোনো অর্ডার পাওয়া যায়নি</h3>

      <p class="tr-notfound-desc">
        আপনার প্রদত্ত <span class="tr-query-chip tr-mono">"${escapeHtml(queryStr)}"</span> তথ্য অনুযায়ী আমাদের সিস্টেমে কোনো অর্ডার রেকর্ড মেলেনি।
      </p>

      <div class="tr-notfound-tips">
        <div class="tr-notfound-tips-title">কীভাবে নিশ্চিত হবেন:</div>
        <ul class="tr-notfound-list">
          <li>আপনার অর্ডার আইডি সঠিকভাবে টাইপ করেছেন কিনা দেখে নিন।</li>
          <li>অথবা চেকআউটে ব্যবহৃত <strong>১১ ডিজিটের মোবাইল নম্বর</strong> দিয়ে পুনরায় সার্চ করুন।</li>
          <li>সম্প্রতি মাত্র অর্ডার করে থাকলে কিছুক্ষণ পর পুনরায় সার্চ করুন।</li>
        </ul>
      </div>

      <div class="tr-action-row">
        <a
          href="https://wa.me/8801581703822?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি আমার অর্ডার #' + queryStr + ' ট্র্যাক করতে পারছি না। দয়া করে সাহায্য করবেন?')}"
          target="_blank"
          rel="noopener noreferrer"
          class="tr-btn-3d tr-btn-emerald"
        >
          <span>💬</span>
          <span>হোয়াটসঅ্যাপ হটলাইনে সহায়তা নিন (01581703822)</span>
        </a>
        <a href="/track" class="tr-btn-3d">
          <span>🔄</span>
          <span>নতুন সার্চ করুন</span>
        </a>
      </div>
    </section>
  `;
}

/**
 * Render Live Matched Order Details & Progress Tracker
 */
function renderMatchedOrderSection(matchedOrder, opts = {}) {
  const isSyncing = !!opts.isSyncing;
  const keepVoucherOpen = !!opts.keepVoucherOpen;

  const track = computeOrderTrackingState(matchedOrder.order_status);

  const items = Array.isArray(matchedOrder.items) && matchedOrder.items.length > 0 ? matchedOrder.items : (
    matchedOrder.products ? [{
      name: matchedOrder.products,
      sku: matchedOrder.color ? `${matchedOrder.color} / ${matchedOrder.size || 'Std'}` : 'DCBD-ITEM',
      quantity: matchedOrder.quantity || 1,
      price: matchedOrder.total_amount || 0
    }] : []
  );

  const subtotal = items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity || 1)), 0);
  const totalAmount = Number(matchedOrder.total_amount !== undefined ? matchedOrder.total_amount : subtotal);
  const deliveryFee = matchedOrder.delivery_charge !== undefined
    ? Number(matchedOrder.delivery_charge)
    : (subtotal >= 2000 ? 0 : Math.max(0, totalAmount - subtotal));

  const displayOrderId = matchedOrder.order_id || '';
  const dateStr = matchedOrder.date || '—';
  const isPaid = String(matchedOrder.payment_status || '').toLowerCase().includes('paid');

  return `
    <!-- LIVE ORDER TRACKING DETAILS 3D CARD -->
    <section class="tr-card print-hide">

      <!-- Top Order Header & Status Banner -->
      <div class="tr-order-top">
        <div>
          <div class="tr-order-id-row">
            <span class="tr-order-id-label">অর্ডার আইডি:</span>
            <span class="tr-order-id-val tr-mono">#${escapeHtml(displayOrderId)}</span>
            ${displayOrderId ? `
              <button
                type="button"
                class="tr-btn-copy"
                onclick="window.copyOrderIdToClipboard('${escapeHtml(displayOrderId)}', this)"
                title="অর্ডার আইডি কপি করুন"
              >
                <span>📋</span>
                <span>কপি</span>
              </button>
            ` : ''}
          </div>

          <div class="tr-order-date">
            <span>📅</span>
            <span>তারিখ: <strong>${escapeHtml(dateStr)}</strong></span>
          </div>
        </div>

        <!-- Live Status Badge Pill -->
        <div class="tr-status-wrap">
          <span class="tr-status-badge ${track.statusToneClass}">
            <span class="tr-status-dot"></span>
            <span>${escapeHtml(track.status)}</span>
          </span>
          <span class="tr-courier-mini">
            কুরিয়ার: <strong>${escapeHtml(matchedOrder.courier || 'Steadfast / Pathao Express')}</strong>
          </span>
        </div>
      </div>

      <!-- Courier Logistics & Hub Banner -->
      <div class="tr-courier-banner">
        <div class="tr-courier-left">
          <div class="tr-courier-icon">🚚</div>
          <div>
            <div class="tr-courier-title">
              ডেলিভারি নেটওয়ার্ক:
              <span class="tr-courier-accent">${escapeHtml(matchedOrder.courier || 'Steadfast / Pathao Express')}</span>
            </div>
            <div class="tr-courier-sub">
              পদুয়ার বাজার বিশ্বরোড হাব থেকে সারা বাংলাদেশে ৪৮-৭২ ঘণ্টার মধ্যে নিরাপদ হোম ডেলিভারি।
            </div>
          </div>
        </div>

        <div>
          <a
            href="https://wa.me/8801581703822?text=${encodeURIComponent('আসসালামু আলাইকুম, আমার অর্ডার #' + displayOrderId + '-এর ডেলিভারি আপডেট জানতে চাই।')}"
            target="_blank"
            rel="noopener noreferrer"
            class="tr-btn-3d tr-btn-emerald"
          >
            <span>💬</span>
            <span>হোয়াটসঅ্যাপ সহায়তা</span>
          </a>
        </div>
      </div>

      ${track.isTerminated ? `
        <!-- CANCELLED / RETURNED WARNING -->
        <div class="tr-cancelled-box">
          <span style="font-size:26px; line-height:1;">⚠️</span>
          <div>
            <strong>${track.isReturned ? 'এই অর্ডারটি রিটার্ন (Returned) হিসেবে চিহ্নিত হয়েছে।' : 'এই অর্ডারটি বাতিল (Cancelled) করা হয়েছে।'}</strong><br/>
            বিস্তারিত জানতে বা অর্ডারটি পুনরায় সক্রিয় করতে আমাদের হটলাইনে যোগাযোগ করুন: <strong>01581703822</strong> বা <strong>01818273838</strong>।
          </div>
        </div>
      ` : `
        <!-- 3D LIVE VISUAL TIMELINE STEPPER -->
        <div class="tr-timeline-card">
          <div class="tr-progress-head">
            <div class="tr-progress-title">
              <span>📍</span>
              <span>পার্সেল অগ্রগতি ট্র্যাকার</span>
              <span id="tr-live-sync-tag" class="tr-live-sync-tag ${isSyncing ? 'is-syncing' : ''}">
                <span class="tr-live-sync-dot"></span>
                <span>${isSyncing ? 'আপডেট হচ্ছে...' : 'লাইভ'}</span>
              </span>
            </div>

            <div class="tr-progress-actions">
              <span class="tr-progress-pct tr-mono">${track.progressPercent}% সম্পন্ন</span>
              <button
                type="button"
                id="tr-manual-refresh-btn"
                class="tr-btn-refresh"
                onclick="window.refreshLiveTrackOrder && window.refreshLiveTrackOrder(this)"
                title="লাইভ স্ট্যাটাস রিফ্রেশ করুন"
              >
                <span class="tr-refresh-icon">🔄</span>
                <span>রিফ্রেশ</span>
              </button>
            </div>
          </div>

          <div class="tr-progress-bar-bg" role="progressbar" aria-valuenow="${track.progressPercent}" aria-valuemin="0" aria-valuemax="100">
            <div class="tr-progress-bar-fill" style="width: ${track.progressPercent}%;"></div>
          </div>

          <div class="tr-timeline">
            <div class="tr-timeline-track">
              <div class="tr-timeline-progress" style="height: ${track.timelineLinePercent}%;"></div>
            </div>

            ${track.steps.map((st, idx) => {
              const isCurrent = st.active && !track.isDelivered && (!track.steps[idx + 1] || !track.steps[idx + 1].active);
              const badgeClass = st.active
                ? (isCurrent ? 'tr-step-badge-current' : 'tr-step-badge-done')
                : 'tr-step-badge-wait';
              const badgeText = st.active
                ? (isCurrent ? 'চলমান ⏳' : 'সম্পন্ন ✓')
                : 'অপেক্ষমাণ';

              return `
                <div class="tr-step-node">
                  <div class="tr-step-bullet ${st.active ? 'active' : 'inactive'} ${isCurrent ? 'current-pulse' : ''}">
                    ${st.active ? '✓' : st.stepNum}
                  </div>
                  <div class="tr-step-card ${st.active ? 'is-active' : ''} ${isCurrent ? 'is-current' : ''}">
                    <div class="tr-step-top">
                      <div class="tr-step-title ${st.active ? '' : 'muted'}">
                        ${st.titleBn}
                        <span class="tr-step-en">(${st.title})</span>
                      </div>
                      <span class="tr-step-badge ${badgeClass}">
                        ${badgeText}
                      </span>
                    </div>
                    <div class="tr-step-desc ${st.active ? '' : 'muted'}">
                      ${st.desc}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `}

      <!-- Customer & Order Information Grid (Two-column) -->
      <div class="tr-info-grid">
        <div class="tr-info-box">
          <div class="tr-info-head">
            <span>📍</span>
            <span>ডেলিভারি ও গ্রাহক তথ্য</span>
          </div>
          <div class="tr-kv-list">
            <div class="tr-kv-row">
              <span class="tr-kv-key">গ্রাহকের নাম:</span>
              <span class="tr-kv-val">${escapeHtml(matchedOrder.customer_name || 'সম্মানিত গ্রাহক')}</span>
            </div>
            <div class="tr-kv-row">
              <span class="tr-kv-key">মোবাইল নম্বর:</span>
              ${matchedOrder.phone
                ? `<a href="tel:${escapeHtml(matchedOrder.phone)}" class="tr-kv-val tr-kv-link tr-mono">${escapeHtml(matchedOrder.phone)}</a>`
                : `<span class="tr-kv-val">উল্লেখ নেই</span>`
              }
            </div>
            <div class="tr-kv-row">
              <span class="tr-kv-key">ডেলিভারি ঠিকানা:</span>
              <span class="tr-kv-val">${escapeHtml(matchedOrder.address || 'বাংলাদেশ')}</span>
            </div>
            <div class="tr-kv-row divider">
              <span class="tr-kv-key">অ্যাকাউন্ট টাইপ:</span>
              <span class="tr-kv-val">${escapeHtml(matchedOrder.account_type || 'Customer')}</span>
            </div>
          </div>
        </div>

        <div class="tr-info-box">
          <div class="tr-info-head">
            <span>💳</span>
            <span>পেমেন্ট ও আর্থিক বিবরণী</span>
          </div>
          <div class="tr-kv-list">
            <div class="tr-kv-row">
              <span class="tr-kv-key">পেমেন্ট মেথড:</span>
              <span class="tr-kv-val">${escapeHtml(matchedOrder.payment_method || 'Cash On Delivery (COD)')}</span>
            </div>
            <div class="tr-kv-row">
              <span class="tr-kv-key">পেমেন্ট স্ট্যাটাস:</span>
              <span class="tr-pay-pill ${isPaid ? 'tr-pay-paid' : 'tr-pay-cod'}">
                ${escapeHtml(matchedOrder.payment_status || 'COD')}
              </span>
            </div>
            <div class="tr-kv-row">
              <span class="tr-kv-key">ট্রানজেকশন আইডি:</span>
              <span class="tr-kv-val tr-mono">${escapeHtml(matchedOrder.transaction_id || 'N/A')}</span>
            </div>
            <div class="tr-kv-row divider">
              <span class="tr-kv-key" style="font-weight:700;">সর্বমোট প্রদেয়:</span>
              <span class="tr-total-highlight tr-mono">${formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Itemized Order Products Table Card -->
      <div class="tr-items-box">
        <div class="tr-items-head">
          <div class="tr-items-title">
            <span>📦</span>
            <span>অর্ডারের পণ্যের তালিকা</span>
          </div>
          <span class="tr-items-count">(${items.length} টি আইটেম)</span>
        </div>

        <div class="tr-table-scroll">
          <table class="tr-table">
            <thead>
              <tr>
                <th>পণ্য</th>
                <th class="tr-td-center">পরিমাণ</th>
                <th class="tr-td-right">দর</th>
                <th class="tr-td-right">মোট</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((it) => `
                <tr>
                  <td>
                    <div class="tr-item-name">${escapeHtml(it.name)}</div>
                    ${(it.color || it.size) ? `
                      <div class="tr-item-variant">
                        ভ্যারিয়েন্ট: ${[it.color, it.size].filter(Boolean).map(escapeHtml).join(' / ')}
                      </div>
                    ` : ''}
                  </td>
                  <td class="tr-td-center tr-mono" style="font-weight:700;">
                    ${it.quantity}
                  </td>
                  <td class="tr-td-right tr-mono">
                    ${formatCurrency(it.price)}
                  </td>
                  <td class="tr-td-right tr-mono" style="font-weight:700; color:var(--tr-text-main);">
                    ${formatCurrency(Number(it.price) * Number(it.quantity || 1))}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Price Breakdown Summary -->
        <div class="tr-price-summary">
          <div class="tr-price-row">
            <span>সাবটোটাল (পণ্য মূল্য):</span>
            <span class="tr-mono" style="font-weight:700; color:var(--tr-text-main);">${formatCurrency(subtotal)}</span>
          </div>
          <div class="tr-price-row">
            <span>ডেলিভারি চার্জ:</span>
            <span class="tr-mono" style="font-weight:700; color:var(--tr-emerald-dark);">
              ${deliveryFee === 0 ? 'ফ্রি (৳০)' : formatCurrency(deliveryFee)}
            </span>
          </div>
          <div class="tr-price-row grand">
            <span>সর্বমোট পরিশোধযোগ্য:</span>
            <span class="tr-total-highlight tr-mono">${formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      <!-- Action Toolbar: View Voucher & Print -->
      <div class="tr-toolbar">
        <button
          type="button"
          class="tr-btn-3d"
          onclick="window.toggleTrackVoucherSection()"
        >
          <span>📄</span>
          <span>অফিশিয়াল ইনভয়েস ভাউচার দেখুন / লুকান</span>
        </button>
        <button
          type="button"
          class="tr-btn-3d-primary"
          onclick="window.printVoucherOnly ? window.printVoucherOnly() : window.print()"
        >
          <span>🖨️</span>
          <span>ভাউচার প্রিন্ট / ডাউনলোড</span>
        </button>
      </div>

      <!-- Hotline Support Footer in Matched Order View -->
      <div class="tr-hotline-bar">
        <div class="tr-hotline-label">
          <span>🎧</span>
          <span>পার্সেল বা ডেলিভারি সহায়তায় আমাদের হটলাইন:</span>
        </div>
        <div class="tr-hotline-btns">
          <a href="https://wa.me/8801581703822" target="_blank" rel="noopener noreferrer" class="tr-btn-3d tr-btn-emerald">
            <span>💬</span>
            <span>01581703822 (WhatsApp)</span>
          </a>
          <a href="tel:01818273838" class="tr-btn-3d">
            <span>📞</span>
            <span>01818273838 (হটলাইন)</span>
          </a>
        </div>
      </div>

    </section>

    <!-- Collapsible Official Invoice Voucher Section -->
    <div id="track-voucher-section" class="${keepVoucherOpen ? '' : 'hidden'}">
      <div class="tr-voucher-heading print-hide">
        অফিশিয়াল ডিজিটাল ইনভয়েস ভাউচার (A4 প্রিন্ট ফরম্যাট)
      </div>

      ${renderVoucher(matchedOrder, { items, subtotal, deliveryFee, totalAmount, displayOrderId, dateStr })}
    </div>
  `;
}

/**
 * Stop active background polling cleanly
 */
function stopLivePolling() {
  if (_livePollTimer) {
    clearInterval(_livePollTimer);
    _livePollTimer = null;
  }
}

/**
 * Update the live sync indicator badge without re-rendering the entire card
 */
function setLiveSyncTagState(syncing) {
  if (typeof document === 'undefined') return;
  const tag = document.getElementById('tr-live-sync-tag');
  if (!tag) return;
  if (syncing) {
    tag.classList.add('is-syncing');
    tag.innerHTML = '<span class="tr-live-sync-dot"></span><span>আপডেট হচ্ছে...</span>';
  } else {
    tag.classList.remove('is-syncing');
    tag.innerHTML = '<span class="tr-live-sync-dot"></span><span>লাইভ</span>';
  }
}

/**
 * Perform live background synchronization and patch #tr-result-mount seamlessly
 */
async function syncTrackedOrderLive(queryStr, options = {}) {
  const q = String(queryStr || _activeQuery || '').trim();
  if (!q || typeof document === 'undefined') return;

  const mount = document.getElementById('tr-result-mount');
  if (!mount || mount.getAttribute('data-track-query') !== q) return;

  const hadInitialOrder = !!options.hadInitialOrder;
  const forceFullList = !!options.forceFullList;

  setLiveSyncTagState(true);

  const freshOrder = await fetchLiveOrderRecord(q, forceFullList);

  // Ensure user hasn't navigated away or started a different search while fetching
  const currentMount = document.getElementById('tr-result-mount');
  if (!currentMount || currentMount.getAttribute('data-track-query') !== q) return;

  if (freshOrder) {
    const nextFp = buildOrderFingerprint(freshOrder);
    if (nextFp !== _activeOrderFingerprint || !hadInitialOrder) {
      const voucherEl = document.getElementById('track-voucher-section');
      const keepVoucherOpen = voucherEl ? !voucherEl.classList.contains('hidden') : false;
      _activeOrderFingerprint = nextFp;
      currentMount.innerHTML = renderMatchedOrderSection(freshOrder, {
        isSyncing: false,
        keepVoucherOpen
      });
    } else {
      setLiveSyncTagState(false);
    }
    startLivePolling(q);
  } else if (!hadInitialOrder) {
    // Check local cache one final time in case a parallel sync populated it
    const fallbackLocal = findOrderInLocalCache(q);
    if (fallbackLocal) {
      _activeOrderFingerprint = buildOrderFingerprint(fallbackLocal);
      currentMount.innerHTML = renderMatchedOrderSection(fallbackLocal, { isSyncing: false });
      startLivePolling(q);
    } else {
      _activeOrderFingerprint = '';
      currentMount.innerHTML = renderNotFoundSection(q);
      stopLivePolling();
    }
  } else {
    setLiveSyncTagState(false);
    startLivePolling(q);
  }
}

/**
 * Start lightweight 12-second live polling (pauses when tab is hidden, auto-stops on route exit)
 */
function startLivePolling(queryStr) {
  stopLivePolling();
  if (!queryStr || typeof window === 'undefined') return;

  _livePollTimer = setInterval(() => {
    if (typeof document === 'undefined') return;
    const mount = document.getElementById('tr-result-mount');
    if (!mount || !document.body.contains(mount)) {
      stopLivePolling();
      return;
    }
    if (document.hidden) return;
    if (mount.getAttribute('data-track-query') !== queryStr) {
      stopLivePolling();
      return;
    }
    syncTrackedOrderLive(queryStr, { hadInitialOrder: true, forceFullList: false });
  }, LIVE_POLL_INTERVAL_MS);
}

/**
 * Bind cross-tab & visibility live-sync listeners once (zero duplicate handlers)
 */
function bindGlobalTrackListeners() {
  if (_listenersBound || typeof window === 'undefined') return;
  _listenersBound = true;

  // Instant update if apiClient syncs orders in background
  window.addEventListener('dcbd:orders-synced', (ev) => {
    if (!_activeQuery) return;
    const mount = document.getElementById('tr-result-mount');
    if (!mount || mount.getAttribute('data-track-query') !== _activeQuery) return;

    const orders = ev && ev.detail && Array.isArray(ev.detail.orders) ? ev.detail.orders : [];
    const found = orders.find(o => doesOrderMatchQuery(o, _activeQuery));
    if (found) {
      const normalized = normalizeSheetOrder(found);
      const nextFp = buildOrderFingerprint(normalized);
      if (nextFp && nextFp !== _activeOrderFingerprint) {
        const voucherEl = document.getElementById('track-voucher-section');
        const keepVoucherOpen = voucherEl ? !voucherEl.classList.contains('hidden') : false;
        _activeOrderFingerprint = nextFp;
        mount.innerHTML = renderMatchedOrderSection(normalized, {
          isSyncing: false,
          keepVoucherOpen
        });
      }
    }
  });

  // Instant cross-tab update when Admin Panel updates status in another tab
  window.addEventListener('storage', (ev) => {
    if (!_activeQuery) return;
    if (ev.key !== 'dcbd_sheet_orders' && ev.key !== 'dcbd_live_order_patches' && ev.key !== 'dcbd_last_order') return;
    const mount = document.getElementById('tr-result-mount');
    if (!mount || mount.getAttribute('data-track-query') !== _activeQuery) return;

    const updated = findOrderInLocalCache(_activeQuery);
    if (updated) {
      const nextFp = buildOrderFingerprint(updated);
      if (nextFp && nextFp !== _activeOrderFingerprint) {
        const voucherEl = document.getElementById('track-voucher-section');
        const keepVoucherOpen = voucherEl ? !voucherEl.classList.contains('hidden') : false;
        _activeOrderFingerprint = nextFp;
        mount.innerHTML = renderMatchedOrderSection(updated, {
          isSyncing: false,
          keepVoucherOpen
        });
      }
    }
  });

  // Immediate refresh when user switches back to the tracking tab
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !_activeQuery) return;
    const mount = document.getElementById('tr-result-mount');
    if (!mount || mount.getAttribute('data-track-query') !== _activeQuery) return;
    syncTrackedOrderLive(_activeQuery, { hadInitialOrder: !!_activeOrderFingerprint, forceFullList: false });
  });
}

// Global helpers for clipboard copy, voucher toggle, instant form search & manual live refresh
if (typeof window !== 'undefined') {
  window.copyOrderIdToClipboard = function (orderId, btnEl) {
    if (!orderId) return;
    const showCopied = () => {
      if (!btnEl) return;
      const original = btnEl.getAttribute('data-orig-label') || btnEl.innerHTML;
      if (!btnEl.getAttribute('data-orig-label')) {
        btnEl.setAttribute('data-orig-label', original);
      }
      btnEl.innerHTML = '<span>✓</span><span>কপি হয়েছে</span>';
      btnEl.classList.add('tr-copied');
      setTimeout(() => {
        btnEl.innerHTML = btnEl.getAttribute('data-orig-label') || original;
        btnEl.classList.remove('tr-copied');
      }, 2000);
    };

    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(orderId).then(showCopied).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = orderId;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        showCopied();
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = orderId;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showCopied();
      } catch (e) {}
      document.body.removeChild(ta);
    }
  };

  window.toggleTrackVoucherSection = function () {
    const sec = document.getElementById('track-voucher-section');
    if (!sec) return;
    const isHidden = sec.classList.contains('hidden');
    if (isHidden) {
      sec.classList.remove('hidden');
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      sec.classList.add('hidden');
    }
  };

  window.handleTrackOrderSubmit = function (event) {
    if (event && event.preventDefault) event.preventDefault();
    const input = document.getElementById('track-input');
    const val = input ? input.value.trim() : '';
    if (!val) return false;

    const mount = document.getElementById('tr-result-mount');
    if (mount) {
      // Instant in-page search (0ms DOM swap, no full page re-render)
      _activeQuery = val;
      mount.setAttribute('data-track-query', val);

      try {
        const base = window.__APP_BASE__ || '';
        const nextUrl = `${base}/track?orderId=${encodeURIComponent(val)}`;
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, '', nextUrl);
        }
      } catch (e) {}

      const cached = findOrderInLocalCache(val);
      if (cached) {
        _activeOrderFingerprint = buildOrderFingerprint(cached);
        mount.innerHTML = renderMatchedOrderSection(cached, { isSyncing: true });
        syncTrackedOrderLive(val, { hadInitialOrder: true, forceFullList: false });
      } else {
        _activeOrderFingerprint = '';
        mount.innerHTML = renderSearchingSection(val);
        syncTrackedOrderLive(val, { hadInitialOrder: false, forceFullList: false });
      }
      return false;
    }

    if (window.router && window.router.navigate) {
      window.router.navigate('/track?orderId=' + encodeURIComponent(val));
    } else {
      window.location.href = '/track?orderId=' + encodeURIComponent(val);
    }
    return false;
  };

  window.refreshLiveTrackOrder = async function (btnEl) {
    if (!_activeQuery) return;
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.classList.add('is-spinning');
    }
    try {
      await syncTrackedOrderLive(_activeQuery, {
        hadInitialOrder: !!_activeOrderFingerprint,
        forceFullList: true
      });
    } finally {
      if (btnEl && document.body.contains(btnEl)) {
        btnEl.disabled = false;
        btnEl.classList.remove('is-spinning');
      }
    }
  };
}

/**
 * Main render function for Order Tracking Page
 * Returns HTML instantaneously (0ms blocking) and streams live server status into #tr-result-mount
 */
export async function renderTrackOrderPage(orderIdOrPhone = '') {
  ensureTrackStylesAndFont();
  bindGlobalTrackListeners();

  // 1. Resolve search parameter from argument or URL
  let searchVal = '';
  if (typeof orderIdOrPhone === 'object' && orderIdOrPhone !== null) {
    searchVal = orderIdOrPhone.orderId || orderIdOrPhone.order_id || orderIdOrPhone.phone || orderIdOrPhone.query || '';
  } else {
    searchVal = (orderIdOrPhone || '').toString();
  }

  if (!searchVal && typeof window !== 'undefined' && window.location) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      searchVal = urlParams.get('orderId') || urlParams.get('order_id') || urlParams.get('phone') || urlParams.get('q') || '';
    } catch (e) {}
  }

  const queryStr = searchVal.trim();
  const isSearched = !!queryStr;

  _activeQuery = queryStr;
  stopLivePolling();

  let initialMountHtml = '';

  if (!isSearched) {
    _activeOrderFingerprint = '';
    initialMountHtml = renderWelcomeSection();
  } else {
    // Instant 0ms local cache check + immediate background live server verification
    const cachedOrder = findOrderInLocalCache(queryStr);
    if (cachedOrder) {
      _activeOrderFingerprint = buildOrderFingerprint(cachedOrder);
      initialMountHtml = renderMatchedOrderSection(cachedOrder, { isSyncing: true });
    } else {
      _activeOrderFingerprint = '';
      initialMountHtml = renderSearchingSection(queryStr);
    }

    // Schedule non-blocking live sync immediately after router mounts innerHTML
    if (typeof window !== 'undefined') {
      const scheduleSync = () => {
        syncTrackedOrderLive(queryStr, {
          hadInitialOrder: !!cachedOrder,
          forceFullList: false
        });
      };
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => setTimeout(scheduleSync, 0));
      } else {
        setTimeout(scheduleSync, 0);
      }
    }
  }

  return `
    <div id="track-main-container" class="tr-page-root">
      <div class="tr-stack">

        <!-- 1. 3D Luxury Hero Banner -->
        <section class="tr-hero print-hide">
          <div class="tr-hero-orb-1" aria-hidden="true"></div>
          <div class="tr-hero-orb-2" aria-hidden="true"></div>
          <div class="tr-hero-grid" aria-hidden="true"></div>

          <div class="tr-hero-inner">
            <div class="tr-live-pill">
              <span class="tr-live-dot"></span>
              <span>লাইভ পার্সেল ট্র্যাকিং • LIVE ORDER TRACKING</span>
            </div>

            <h1 class="tr-hero-title">
              আপনার পার্সেল ট্র্যাক করুন
            </h1>

            <p class="tr-hero-subtitle">
              আপনার ব্যক্তিগত অর্ডার সুরক্ষিতভাবে ট্র্যাক করতে নিচে আপনার অর্ডার আইডি বা মোবাইল নম্বর প্রবেশ করান।
            </p>

            <div class="tr-privacy-pill">
              <span>🔒</span>
              <span>গ্রাহক গোপনীয়তা সুরক্ষিত • আপনার তথ্য অন্য কারো কাছে দৃশ্যমান নয়</span>
            </div>
          </div>
        </section>

        <!-- 2. Main 3D Search Bar Card -->
        <section class="tr-card tr-search-card print-hide">
          <form
            id="tracking-search-form"
            class="tr-search-form"
            onsubmit="return window.handleTrackOrderSubmit(event)"
          >
            <div class="tr-input-wrap">
              <span class="tr-input-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                id="track-input"
                placeholder="আপনার অর্ডার আইডি বা মোবাইল নম্বর লিখুন"
                value="${escapeHtml(queryStr)}"
                required
                autocomplete="off"
                class="tr-search-input tr-mono"
              />
            </div>

            <button type="submit" class="tr-btn-3d-primary">
              <span>ট্র্যাক করুন</span>
              <span>⚡</span>
            </button>
          </form>

          <div class="tr-search-tip">
            <span>💡</span>
            <span>টিপস: অর্ডার কনফার্মেশনের সময় প্রাপ্ত অর্ডার আইডি অথবা আপনার মোবাইল নম্বর দিয়ে সার্চ করুন।</span>
          </div>
        </section>

        <!-- 3. Dynamic Live Result Mount -->
        <div id="tr-result-mount" class="tr-stack" data-track-query="${escapeHtml(queryStr)}">
          ${initialMountHtml}
        </div>

      </div>
    </div>
  `;
}

/**
 * Self-contained Scoped 3D CSS — GPU-optimized for instant paint & smooth 60fps scrolling
 * (No render-blocking @import, no animated filter:blur, no box-shadow keyframe repaints)
 */
const TRACK_PAGE_CSS = `
/* ============================================================
   DREAM CART BD — 3D PROFESSIONAL ORDER TRACKING DESIGN SYSTEM
   100% Self-Contained Scoped Styles | Super-Speed GPU Optimized
   ============================================================ */
.tr-page-root {
  --tr-font: 'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --tr-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --tr-emerald: #10b981;
  --tr-emerald-dark: #059669;
  --tr-emerald-deep: #047857;
  --tr-surface: #ffffff;
  --tr-surface-soft: #f8fafc;
  --tr-border: #e2e8f0;
  --tr-border-3d: #cbd5e1;
  --tr-text-main: #0f172a;
  --tr-text-body: #334155;
  --tr-text-muted: #64748b;
  --tr-shadow-card:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 6px 0 -2px rgba(226, 232, 240, 0.92),
    0 14px 28px -10px rgba(15, 23, 42, 0.09);
  --tr-shadow-card-hover:
    0 1px 0 rgba(255, 255, 255, 1) inset,
    0 8px 0 -2px rgba(16, 185, 129, 0.28),
    0 20px 36px -12px rgba(16, 185, 129, 0.2);

  font-family: var(--tr-font);
  max-width: 1020px;
  margin: 0 auto;
  padding: 18px 14px 96px;
  color: var(--tr-text-body);
  box-sizing: border-box;
}

.tr-page-root *:not(#official-invoice-voucher):not(#official-invoice-voucher *),
.tr-page-root *:not(#official-invoice-voucher):not(#official-invoice-voucher *)::before,
.tr-page-root *:not(#official-invoice-voucher):not(#official-invoice-voucher *)::after {
  font-family: var(--tr-font);
  box-sizing: border-box;
}

.tr-page-root .tr-mono {
  font-family: var(--tr-mono) !important;
}

.dark .tr-page-root {
  --tr-surface: #0f172a;
  --tr-surface-soft: #131f37;
  --tr-border: #1e293b;
  --tr-border-3d: #020617;
  --tr-text-main: #f8fafc;
  --tr-text-body: #cbd5e1;
  --tr-text-muted: #94a3b8;
  --tr-shadow-card:
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 6px 0 -2px rgba(2, 6, 23, 0.88),
    0 16px 34px -10px rgba(0, 0, 0, 0.52);
  --tr-shadow-card-hover:
    0 1px 0 rgba(52, 211, 153, 0.16) inset,
    0 8px 0 -2px rgba(16, 185, 129, 0.26),
    0 20px 40px -12px rgba(16, 185, 129, 0.24);
}

@media (min-width: 640px) {
  .tr-page-root {
    padding: 28px 24px 110px;
  }
}

/* Lightweight GPU-Composited Animations (transform & opacity only) */
@keyframes trCardReveal {
  0% {
    opacity: 0;
    transform: translate3d(0, 12px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes trPulseScale {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.22);
    opacity: 0.65;
  }
}

@keyframes trSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .tr-page-root *,
  .tr-page-root *::before,
  .tr-page-root *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.tr-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ==================== 1. 3D HERO BANNER ==================== */
.tr-hero {
  position: relative;
  overflow: hidden;
  border-radius: 26px;
  padding: 30px 22px;
  text-align: center;
  color: #ffffff;
  background:
    radial-gradient(circle at 15% 18%, rgba(16, 185, 129, 0.28) 0%, transparent 45%),
    radial-gradient(circle at 86% 84%, rgba(56, 189, 248, 0.22) 0%, transparent 48%),
    linear-gradient(135deg, #0b132b 0%, #0f172a 52%, #052e2b 100%);
  border: 1px solid rgba(52, 211, 153, 0.28);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.14) inset,
    0 10px 0 -3px rgba(6, 78, 59, 0.55),
    0 24px 48px -14px rgba(2, 6, 23, 0.52);
  contain: layout style paint;
}

@media (min-width: 768px) {
  .tr-hero {
    padding: 42px 38px;
  }
}

.tr-hero-orb-1 {
  position: absolute;
  top: -70px;
  right: -40px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.34) 0%, rgba(16, 185, 129, 0) 70%);
  pointer-events: none;
}

.tr-hero-orb-2 {
  position: absolute;
  bottom: -75px;
  left: -40px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.24) 0%, rgba(56, 189, 248, 0) 70%);
  pointer-events: none;
}

.tr-hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
  opacity: 0.65;
}

.tr-hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tr-live-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 7px 18px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(52, 211, 153, 0.45);
  color: #6ee7b7;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.03em;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}

.tr-live-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #34d399;
  animation: trPulseScale 2s ease-in-out infinite;
  flex-shrink: 0;
}

.tr-hero-title {
  font-size: 27px;
  line-height: 1.25;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px;
  letter-spacing: -0.015em;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
}

@media (min-width: 640px) {
  .tr-hero-title {
    font-size: 38px;
  }
}

.tr-hero-subtitle {
  font-size: 15px;
  line-height: 1.75;
  color: #cbd5e1;
  max-width: 620px;
  margin: 0 0 20px;
  font-weight: 400;
}

.tr-privacy-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #a7f3d0;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

/* ==================== 2. 3D BASE CARDS ==================== */
.tr-card {
  position: relative;
  background: var(--tr-surface);
  border: 1px solid var(--tr-border);
  border-radius: 24px;
  padding: 24px 20px;
  box-shadow: var(--tr-shadow-card);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  animation: trCardReveal 0.25s ease-out both;
}

@media (min-width: 640px) {
  .tr-card {
    padding: 30px 32px;
  }
}

.tr-card:hover {
  border-color: rgba(16, 185, 129, 0.48);
  box-shadow: var(--tr-shadow-card-hover);
}

/* ==================== 3. 3D SEARCH BAR CARD ==================== */
.tr-search-card {
  background: linear-gradient(180deg, var(--tr-surface) 0%, var(--tr-surface-soft) 100%);
}

.tr-search-form {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

@media (min-width: 640px) {
  .tr-search-form {
    flex-direction: row;
    align-items: stretch;
  }
}

.tr-input-wrap {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
}

.tr-input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
  line-height: 1;
  opacity: 0.85;
}

.tr-search-input {
  width: 100%;
  padding: 15px 18px 15px 48px;
  border-radius: 16px;
  border: 2px solid var(--tr-border);
  background: var(--tr-surface);
  color: var(--tr-text-main);
  font-size: 15px;
  font-weight: 600;
  outline: none;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.05) inset;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.tr-search-input::placeholder {
  color: var(--tr-text-muted);
  font-weight: 400;
  font-family: var(--tr-font);
}

.tr-search-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.18);
}

.tr-btn-3d-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 14px 28px;
  border-radius: 16px;
  border: 1px solid #34d399;
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  color: #ffffff !important;
  font-size: 15.5px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.35) inset,
    0 5px 0 #047857,
    0 12px 24px rgba(16, 185, 129, 0.32);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.tr-btn-3d-primary:hover {
  transform: translateY(-2px);
  background: linear-gradient(180deg, #34d399 0%, #059669 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.4) inset,
    0 7px 0 #047857,
    0 16px 28px rgba(16, 185, 129, 0.38);
}

.tr-btn-3d-primary:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #047857;
}

.tr-search-tip {
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--tr-text-body);
}

.dark .tr-search-tip {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(52, 211, 153, 0.25);
}

/* ==================== LOADING CARD ==================== */
.tr-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 14px;
  padding: 40px 24px;
}

.tr-spinner-ring {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 4px solid rgba(16, 185, 129, 0.18);
  border-top-color: #10b981;
  animation: trSpin 0.7s linear infinite;
}

.tr-loading-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--tr-text-main);
  margin: 0;
}

.tr-loading-desc {
  font-size: 14px;
  color: var(--tr-text-muted);
  margin: 0;
}

.tr-query-chip-live {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--tr-emerald-dark);
  font-weight: 700;
}

.dark .tr-query-chip-live {
  color: #34d399;
}

/* ==================== 4. WELCOME FEATURES & GUIDE ==================== */
.tr-features-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 18px;
}

@media (min-width: 768px) {
  .tr-features-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.tr-feature-card {
  background: var(--tr-surface);
  border: 1px solid var(--tr-border);
  border-radius: 22px;
  padding: 24px 22px;
  box-shadow: var(--tr-shadow-card);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.tr-feature-card:hover {
  transform: translateY(-4px);
  border-color: #10b981;
  box-shadow: var(--tr-shadow-card-hover);
}

.tr-feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
  transition: transform 0.2s ease;
}

.tr-feature-card:hover .tr-feature-icon {
  transform: scale(1.06);
}

.tr-icon-emerald {
  background: linear-gradient(145deg, #ecfdf5 0%, #a7f3d0 100%);
  border: 1px solid rgba(16, 185, 129, 0.35);
  box-shadow: 0 4px 0 rgba(16, 185, 129, 0.22);
}

.dark .tr-icon-emerald {
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.55));
  box-shadow: 0 4px 0 rgba(2, 6, 23, 0.65);
}

.tr-icon-blue {
  background: linear-gradient(145deg, #eff6ff 0%, #bfdbfe 100%);
  border: 1px solid rgba(59, 130, 246, 0.35);
  box-shadow: 0 4px 0 rgba(59, 130, 246, 0.22);
}

.dark .tr-icon-blue {
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.25), rgba(30, 58, 138, 0.55));
  box-shadow: 0 4px 0 rgba(2, 6, 23, 0.65);
}

.tr-icon-purple {
  background: linear-gradient(145deg, #faf5ff 0%, #e9d5ff 100%);
  border: 1px solid rgba(168, 85, 247, 0.35);
  box-shadow: 0 4px 0 rgba(168, 85, 247, 0.22);
}

.dark .tr-icon-purple {
  background: linear-gradient(145deg, rgba(168, 85, 247, 0.25), rgba(88, 28, 135, 0.55));
  box-shadow: 0 4px 0 rgba(2, 6, 23, 0.65);
}

.tr-feature-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--tr-text-main);
  margin: 0;
}

.tr-feature-desc {
  font-size: 14px;
  line-height: 1.75;
  color: var(--tr-text-muted);
  margin: 0;
}

.tr-section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px;
  padding-bottom: 16px;
  border-bottom: 1.5px solid var(--tr-border);
}

.tr-section-heading-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid rgba(16, 185, 129, 0.35);
  box-shadow: 0 3px 0 rgba(16, 185, 129, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.dark .tr-section-heading-icon {
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.24), rgba(6, 78, 59, 0.5));
}

.tr-section-heading h3 {
  font-size: 19px;
  font-weight: 700;
  color: var(--tr-text-main);
  margin: 0;
}

.tr-guide-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 15px;
}

@media (min-width: 640px) {
  .tr-guide-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.tr-guide-box {
  background: var(--tr-surface-soft);
  border: 1px solid var(--tr-border);
  border-radius: 18px;
  padding: 18px 18px;
  box-shadow: 0 4px 0 -1px var(--tr-border-3d);
  display: flex;
  flex-direction: column;
  gap: 9px;
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.dark .tr-guide-box {
  box-shadow: 0 4px 0 -1px #020617;
}

.tr-guide-box:hover {
  transform: translateY(-3px);
  border-color: #10b981;
}

.tr-guide-num {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 0 #047857;
}

.tr-guide-title {
  font-size: 15.5px;
  font-weight: 700;
  color: var(--tr-text-main);
}

.tr-guide-desc {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--tr-text-muted);
}

.tr-hotline-bar {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1.5px solid var(--tr-border);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (min-width: 640px) {
  .tr-hotline-bar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.tr-hotline-label {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--tr-text-body);
}

.tr-hotline-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* ==================== 5. 3D TACTILE ACTION BUTTONS ==================== */
.tr-btn-3d {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 13px;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.25;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid var(--tr-border);
  background: var(--tr-surface);
  color: var(--tr-text-main) !important;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.75) inset,
    0 4px 0 var(--tr-border-3d),
    0 8px 16px -6px rgba(15, 23, 42, 0.1);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.dark .tr-btn-3d {
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 4px 0 #020617,
    0 8px 16px -6px rgba(0, 0, 0, 0.45);
}

.tr-btn-3d:hover {
  transform: translateY(-2px);
  border-color: #10b981;
  color: #059669 !important;
  box-shadow:
    0 5px 0 rgba(16, 185, 129, 0.3),
    0 12px 22px -6px rgba(16, 185, 129, 0.22);
}

.dark .tr-btn-3d:hover {
  color: #34d399 !important;
}

.tr-btn-3d:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--tr-border-3d);
}

.tr-btn-emerald {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.4);
  color: #047857 !important;
  box-shadow: 0 4px 0 rgba(16, 185, 129, 0.24);
}

.dark .tr-btn-emerald {
  background: rgba(16, 185, 129, 0.18);
  color: #6ee7b7 !important;
}

.tr-btn-emerald:hover {
  background: #10b981;
  border-color: #10b981;
  color: #ffffff !important;
  box-shadow: 0 5px 0 #047857, 0 12px 24px rgba(16, 185, 129, 0.32);
}

/* ==================== 6. NOT FOUND 3D CARD ==================== */
.tr-notfound-card {
  text-align: center;
  border-color: rgba(244, 63, 94, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 36px 24px;
}

.tr-notfound-icon {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: linear-gradient(145deg, #ffe4e6 0%, #fecdd3 100%);
  border: 1.5px solid rgba(244, 63, 94, 0.35);
  box-shadow: 0 6px 0 rgba(244, 63, 94, 0.2), 0 14px 28px rgba(244, 63, 94, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
}

.dark .tr-notfound-icon {
  background: linear-gradient(145deg, rgba(244, 63, 94, 0.24), rgba(136, 19, 55, 0.5));
}

.tr-notfound-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--tr-text-main);
  margin: 0;
}

.tr-notfound-desc {
  font-size: 15px;
  line-height: 1.75;
  color: var(--tr-text-body);
  max-width: 520px;
  margin: 0;
}

.tr-query-chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 8px;
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #e11d48;
  font-weight: 700;
}

.dark .tr-query-chip {
  color: #fda4af;
}

.tr-notfound-tips {
  width: 100%;
  max-width: 540px;
  text-align: left;
  background: var(--tr-surface-soft);
  border: 1px solid var(--tr-border);
  border-radius: 18px;
  padding: 18px 22px;
}

.tr-notfound-tips-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--tr-text-main);
  margin-bottom: 10px;
}

.tr-notfound-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tr-notfound-list li {
  position: relative;
  padding-left: 24px;
  font-size: 14px;
  line-height: 1.68;
  color: var(--tr-text-body);
}

.tr-notfound-list li::before {
  content: '•';
  position: absolute;
  left: 6px;
  top: 0;
  color: #10b981;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.3;
}

.tr-action-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
}

/* ==================== 7. MATCHED ORDER DETAILS CARD ==================== */
.tr-order-top {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1.5px solid var(--tr-border);
}

@media (min-width: 640px) {
  .tr-order-top {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.tr-order-id-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.tr-order-id-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--tr-text-muted);
}

.tr-order-id-val {
  font-size: 22px;
  font-weight: 800;
  color: var(--tr-emerald-dark);
  letter-spacing: 0.01em;
}

.dark .tr-order-id-val {
  color: #34d399;
}

.tr-btn-copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 10px;
  border: 1px solid var(--tr-border);
  background: var(--tr-surface-soft);
  color: var(--tr-text-body);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 0 var(--tr-border-3d);
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.tr-btn-copy:hover {
  transform: translateY(-1px);
  border-color: #10b981;
  color: #059669;
  background: rgba(16, 185, 129, 0.1);
}

.tr-btn-copy.tr-copied {
  background: #059669 !important;
  border-color: #059669 !important;
  color: #ffffff !important;
  box-shadow: 0 3px 0 #047857 !important;
}

.tr-order-date {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  color: var(--tr-text-muted);
}

.tr-order-date strong {
  color: var(--tr-text-main);
}

.tr-status-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}

@media (min-width: 640px) {
  .tr-status-wrap {
    align-items: flex-end;
  }
}

.tr-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: 1.5px solid transparent;
  box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.12);
}

.tr-status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  animation: trPulseScale 2s ease-in-out infinite;
}

.tr-status-delivered {
  background: #ecfdf5;
  color: #065f46;
  border-color: #6ee7b7;
}
.tr-status-delivered .tr-status-dot { background: #10b981; animation: none; }
.dark .tr-status-delivered {
  background: rgba(16, 185, 129, 0.18);
  color: #6ee7b7;
  border-color: rgba(52, 211, 153, 0.45);
}

.tr-status-transit {
  background: #eff6ff;
  color: #1e40af;
  border-color: #93c5fd;
}
.tr-status-transit .tr-status-dot { background: #3b82f6; }
.dark .tr-status-transit {
  background: rgba(59, 130, 246, 0.18);
  color: #93c5fd;
  border-color: rgba(96, 165, 250, 0.45);
}

.tr-status-confirmed {
  background: #eef2ff;
  color: #3730a3;
  border-color: #a5b4fc;
}
.tr-status-confirmed .tr-status-dot { background: #6366f1; }
.dark .tr-status-confirmed {
  background: rgba(99, 102, 241, 0.18);
  color: #a5b4fc;
  border-color: rgba(129, 140, 248, 0.45);
}

.tr-status-cancelled {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fda4af;
}
.tr-status-cancelled .tr-status-dot { background: #e11d48; animation: none; }
.dark .tr-status-cancelled {
  background: rgba(244, 63, 94, 0.18);
  color: #fda4af;
  border-color: rgba(251, 113, 133, 0.45);
}

.tr-status-pending {
  background: #fffbeb;
  color: #92400e;
  border-color: #fcd34d;
}
.tr-status-pending .tr-status-dot { background: #f59e0b; }
.dark .tr-status-pending {
  background: rgba(245, 158, 11, 0.18);
  color: #fde68a;
  border-color: rgba(251, 191, 36, 0.45);
}

.tr-courier-mini {
  font-size: 13px;
  color: var(--tr-text-muted);
}

.tr-courier-mini strong {
  color: var(--tr-text-main);
}

.tr-courier-banner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 165, 233, 0.06) 100%);
  border: 1.5px solid rgba(16, 185, 129, 0.3);
  margin-bottom: 24px;
}

@media (min-width: 640px) {
  .tr-courier-banner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.tr-courier-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.tr-courier-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
  flex-shrink: 0;
  box-shadow: 0 4px 0 #047857, 0 8px 16px rgba(16, 185, 129, 0.25);
}

.tr-courier-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--tr-text-main);
  margin-bottom: 4px;
}

.tr-courier-accent {
  color: var(--tr-emerald-dark);
}

.dark .tr-courier-accent {
  color: #34d399;
}

.tr-courier-sub {
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--tr-text-body);
}

.tr-cancelled-box {
  padding: 18px 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(251, 113, 133, 0.05) 100%);
  border: 1.5px solid rgba(244, 63, 94, 0.35);
  color: #9f1239;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  font-size: 14.5px;
  line-height: 1.75;
  margin-bottom: 24px;
}

.dark .tr-cancelled-box {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.18), rgba(136, 19, 55, 0.25));
  color: #fecdd3;
}

/* ==================== 8. 3D TIMELINE PROGRESS TRACKER ==================== */
.tr-timeline-card {
  background: var(--tr-surface-soft);
  border: 1px solid var(--tr-border);
  border-radius: 20px;
  padding: 22px 18px;
  margin-bottom: 24px;
}

@media (min-width: 640px) {
  .tr-timeline-card {
    padding: 24px 26px;
  }
}

.tr-progress-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.tr-progress-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--tr-text-main);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tr-live-sync-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--tr-emerald-dark);
}

.dark .tr-live-sync-tag {
  color: #6ee7b7;
}

.tr-live-sync-tag.is-syncing {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.32);
  color: #2563eb;
}

.dark .tr-live-sync-tag.is-syncing {
  color: #93c5fd;
}

.tr-live-sync-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  animation: trPulseScale 1.8s ease-in-out infinite;
}

.tr-live-sync-tag.is-syncing .tr-live-sync-dot {
  background: #3b82f6;
}

.tr-progress-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tr-progress-pct {
  padding: 5px 13px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.34);
  color: var(--tr-emerald-dark);
  font-size: 13px;
  font-weight: 700;
}

.dark .tr-progress-pct {
  color: #34d399;
}

.tr-btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid var(--tr-border);
  background: var(--tr-surface);
  color: var(--tr-text-body);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.tr-btn-refresh:hover {
  border-color: #10b981;
  color: var(--tr-emerald-dark);
  background: rgba(16, 185, 129, 0.08);
}

.tr-btn-refresh:disabled {
  opacity: 0.65;
  cursor: wait;
}

.tr-btn-refresh.is-spinning .tr-refresh-icon {
  display: inline-block;
  animation: trSpin 0.7s linear infinite;
}

.tr-progress-bar-bg {
  width: 100%;
  height: 11px;
  border-radius: 999px;
  background: var(--tr-border);
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) inset;
}

.tr-progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #059669 0%, #10b981 55%, #34d399 100%);
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.tr-timeline {
  position: relative;
  padding-left: 50px;
}

.tr-timeline-track {
  position: absolute;
  left: 19px;
  top: 18px;
  bottom: 24px;
  width: 4px;
  background: var(--tr-border);
  border-radius: 999px;
}

.tr-timeline-progress {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  border-radius: 999px;
  transition: height 0.45s ease;
}

.tr-step-node {
  position: relative;
  margin-bottom: 16px;
}

.tr-step-node:last-child {
  margin-bottom: 0;
}

.tr-step-bullet {
  position: absolute;
  left: -50px;
  top: 14px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  z-index: 3;
}

.tr-step-bullet.active {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: 2px solid #a7f3d0;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}

.tr-step-bullet.current-pulse {
  animation: trPulseScale 2.2s ease-in-out infinite;
}

.tr-step-bullet.inactive {
  background: var(--tr-surface);
  color: var(--tr-text-muted);
  border: 2px solid var(--tr-border-3d);
}

.tr-step-card {
  background: var(--tr-surface);
  border: 1px solid var(--tr-border);
  border-radius: 16px;
  padding: 15px 18px;
  box-shadow: 0 3px 0 -1px var(--tr-border-3d);
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.dark .tr-step-card {
  box-shadow: 0 3px 0 -1px #020617;
}

.tr-step-card.is-active {
  border-left: 4px solid #10b981;
}

.tr-step-card.is-current {
  border-color: #10b981;
  box-shadow: 0 4px 0 -1px rgba(16, 185, 129, 0.28), 0 10px 22px -8px rgba(16, 185, 129, 0.2);
}

.tr-step-card:hover {
  transform: translateX(3px);
}

.tr-step-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.tr-step-title {
  font-size: 15.5px;
  font-weight: 700;
  color: var(--tr-text-main);
}

.tr-step-title.muted {
  color: var(--tr-text-muted);
}

.tr-step-en {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--tr-text-muted);
  margin-left: 4px;
}

.tr-step-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.tr-step-badge-current {
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.32);
}

.tr-step-badge-done {
  background: rgba(16, 185, 129, 0.14);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.32);
}

.dark .tr-step-badge-done {
  color: #6ee7b7;
}

.tr-step-badge-wait {
  background: var(--tr-surface-soft);
  color: var(--tr-text-muted);
  border: 1px solid var(--tr-border);
}

.tr-step-desc {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--tr-text-body);
}

.tr-step-desc.muted {
  color: var(--tr-text-muted);
  opacity: 0.8;
}

/* ==================== 9. TWO-COLUMN INFO CARDS ==================== */
.tr-info-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .tr-info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.tr-info-box {
  background: var(--tr-surface-soft);
  border: 1px solid var(--tr-border);
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: 0 4px 0 -1px var(--tr-border-3d);
}

.dark .tr-info-box {
  box-shadow: 0 4px 0 -1px #020617;
}

.tr-info-head {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 15px;
  font-weight: 700;
  color: var(--tr-emerald-dark);
  padding-bottom: 12px;
  margin-bottom: 14px;
  border-bottom: 1.5px solid var(--tr-border);
}

.dark .tr-info-head {
  color: #34d399;
}

.tr-kv-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tr-kv-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  font-size: 14px;
  line-height: 1.6;
}

.tr-kv-row.divider {
  padding-top: 12px;
  border-top: 1px dashed var(--tr-border);
}

.tr-kv-key {
  color: var(--tr-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.tr-kv-val {
  color: var(--tr-text-main);
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.tr-kv-link {
  color: var(--tr-emerald-dark);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.dark .tr-kv-link {
  color: #34d399;
}

.tr-pay-pill {
  display: inline-block;
  padding: 3px 11px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.tr-pay-paid {
  background: #dcfce7;
  color: #166534;
}
.dark .tr-pay-paid {
  background: rgba(16, 185, 129, 0.22);
  color: #6ee7b7;
}

.tr-pay-cod {
  background: #fef3c7;
  color: #92400e;
}
.dark .tr-pay-cod {
  background: rgba(245, 158, 11, 0.22);
  color: #fde68a;
}

.tr-total-highlight {
  font-size: 18px;
  font-weight: 800;
  color: var(--tr-emerald-dark);
}

.dark .tr-total-highlight {
  color: #34d399;
}

/* ==================== 10. ITEMIZED PRODUCTS TABLE ==================== */
.tr-items-box {
  background: var(--tr-surface-soft);
  border: 1px solid var(--tr-border);
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: 0 4px 0 -1px var(--tr-border-3d);
  margin-bottom: 24px;
}

.dark .tr-items-box {
  box-shadow: 0 4px 0 -1px #020617;
}

.tr-items-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 13px;
  margin-bottom: 14px;
  border-bottom: 1.5px solid var(--tr-border);
}

.tr-items-title {
  font-size: 15.5px;
  font-weight: 700;
  color: var(--tr-text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tr-items-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--tr-text-muted);
}

.tr-table-scroll {
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid var(--tr-border);
  background: var(--tr-surface);
}

.tr-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.tr-table th {
  padding: 12px 14px;
  background: var(--tr-surface-soft);
  color: var(--tr-text-muted);
  font-size: 13px;
  font-weight: 700;
  border-bottom: 1px solid var(--tr-border);
  white-space: nowrap;
}

.tr-table td {
  padding: 13px 14px;
  border-bottom: 1px solid var(--tr-border);
  color: var(--tr-text-body);
  vertical-align: middle;
}

.tr-table tbody tr:last-child td {
  border-bottom: none;
}

.tr-table tbody tr:hover td {
  background: rgba(16, 185, 129, 0.04);
}

.tr-td-center { text-align: center; }
.tr-td-right { text-align: right; white-space: nowrap; }

.tr-item-name {
  font-weight: 700;
  color: var(--tr-text-main);
  line-height: 1.5;
}

.tr-item-variant {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 9px;
  border-radius: 7px;
  background: rgba(16, 185, 129, 0.12);
  color: var(--tr-emerald-dark);
  font-size: 12px;
  font-weight: 600;
}

.dark .tr-item-variant {
  color: #6ee7b7;
}

.tr-price-summary {
  margin-top: 16px;
  padding: 16px 18px;
  border-radius: 15px;
  background: var(--tr-surface);
  border: 1px solid var(--tr-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tr-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--tr-text-body);
}

.tr-price-row.grand {
  padding-top: 12px;
  margin-top: 2px;
  border-top: 1.5px solid var(--tr-border);
  font-size: 16.5px;
  font-weight: 700;
  color: var(--tr-text-main);
}

.tr-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 4px;
}

#track-voucher-section.hidden {
  display: none !important;
}

.tr-voucher-heading {
  text-align: center;
  margin-bottom: 14px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--tr-text-muted);
  letter-spacing: 0.03em;
}

.voucher-paper-container {
  background-color: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 20px !important;
  box-shadow: 0 14px 35px -5px rgba(0, 0, 0, 0.08) !important;
  position: relative !important;
  overflow: hidden !important;
}

.voucher-paper-container * {
  color: inherit;
}

@media print {
  header, footer, nav, #header-mount, #footer-mount, #mobilenav-mount, #floatingactions-mount, #cartdrawer-mount, #fraudmodal-mount, .print-hide {
    display: none !important;
  }
  body, #app-content, .tr-page-root {
    background: #ffffff !important;
    color: #000000 !important;
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
  }
  #track-main-container .print-hide {
    display: none !important;
  }
  #track-voucher-section {
    display: block !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  #official-invoice-voucher {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 20px !important;
    background: #ffffff !important;
    color: #000000 !important;
    border: 1px solid #cbd5e1 !important;
    box-shadow: none !important;
  }
}
`;
