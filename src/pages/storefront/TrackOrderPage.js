/**
 * DREAM CART BD — ORDER TRACKING PAGE (src/pages/storefront/TrackOrderPage.js)
 * Upgraded Design System:
 * - Customer Privacy First: NO default order or other customer's info is ever displayed by default!
 * - Secure On-Demand Lookup: Orders are shown ONLY when a customer searches their specific Order ID or Phone number
 * - Google Sheets Orders Sheet Integration: Real-time lookup from the live 'Orders' sheet & local storage cache
 * - 100% Self-Contained Scoped 3D CSS (.tr-page-root) with Hind Siliguri + Plus Jakarta Sans typography
 * - Zero dependency on missing Tailwind utilities (fixes spacing, overlapping icons & cramped text)
 * - 3D elevated cards, tactile 3D buttons, glowing live progress stepper & Light/Dark high-contrast modes
 * - Authentic White Paper Invoice Voucher & isolated @media print support preserved
 * - 100% Backward & Forward Compatibility with main.js, router.js & Voucher.js
 */

import { apiClient } from '../../api/client.js';
import { formatCurrency, formatDate, formatPhone } from '../../utils/format.js';
import { escapeHtml } from '../../utils/security.js';
import { renderVoucher } from '../../components/Voucher.js';

// Global helpers for clipboard copy and voucher toggle
if (typeof window !== 'undefined') {

  // 1. Copy Order ID helper with visual feedback
  window.copyOrderIdToClipboard = function(orderId, btnEl) {
    if (!orderId) return;
    const showCopied = () => {
      if (!btnEl) return;
      const original = btnEl.getAttribute('data-orig-label') || btnEl.innerHTML;
      if (!btnEl.getAttribute('data-orig-label')) {
        btnEl.setAttribute('data-orig-label', original);
      }
      btnEl.innerHTML = '<span>✓</span><span>কপি হয়েছে</span>';
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

  // 2. Toggle Voucher Section with smooth scroll
  window.toggleTrackVoucherSection = function() {
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
}

/**
 * Standardize and normalize raw order rows from Google Sheets 'Orders' tab
 * or localStorage into a consistent Dream Cart BD order object.
 */
function normalizeSheetOrder(raw) {
  if (!raw || typeof raw !== 'object') return null;

  // 1. Order ID
  const orderId = String(
    raw.order_id || raw.orderId || raw.orderid || raw.OrderID || raw.col_1 || ''
  ).trim();
  if (!orderId && !raw.phone && !raw.col_4 && !raw.customer_name) return null;

  // 2. Customer Name
  const customerName = String(
    raw.customer_name || raw.customerName || raw.name || raw.CustomerName || raw.col_3 || 'সম্মানিত গ্রাহক'
  ).trim();

  // 3. Phone
  const phone = String(
    raw.phone || raw.Phone || raw.customer_phone || raw.col_4 || ''
  ).trim();

  // 4. Address
  const address = String(
    raw.address || raw.Address || raw.delivery_address || raw.col_5 || 'বাংলাদেশ'
  ).trim();

  // 5. Products text
  const productsText = String(
    raw.products || raw.Products || raw.product_name || raw.items_name || raw.col_6 || ''
  ).trim();

  // 6. Color & Size
  const color = String(raw.color || raw.Color || raw.col_7 || '').trim();
  const size = String(raw.size || raw.Size || raw.col_8 || '').trim();

  // 7. Quantity
  const quantity = Math.max(1, parseInt(raw.quantity || raw.Quantity || raw.col_9 || 1, 10) || 1);

  // 8. Total Amount
  const totalAmount = parseFloat(
    raw.total_amount !== undefined ? raw.total_amount :
    (raw.totalAmount !== undefined ? raw.totalAmount :
    (raw.total !== undefined ? raw.total :
    (raw.col_10 !== undefined ? raw.col_10 : 0)))
  ) || 0;

  // 9. Delivery Charge
  const deliveryCharge = parseFloat(
    raw.delivery_charge !== undefined ? raw.delivery_charge :
    (raw.deliveryCharge !== undefined ? raw.deliveryCharge :
    (raw.delivery_fee !== undefined ? raw.delivery_fee :
    (raw.deliveryFee !== undefined ? raw.deliveryFee : 0)))
  ) || 0;

  // 10. Payment Method
  const paymentMethod = String(
    raw.payment_method || raw.paymentMethod || raw.PaymentMethod || raw.method || raw.col_11 || 'Cash On Delivery (COD)'
  ).trim();

  // 11. Transaction ID
  const transactionId = String(
    raw.transaction_id || raw.transactionId || raw.trx_id || raw.col_12 || 'N/A'
  ).trim();

  // 12. Payment Status
  const paymentStatus = String(
    raw.payment_status || raw.paymentStatus || raw.PaymentStatus || raw.col_13 ||
    (paymentMethod.toLowerCase().includes('cod') || paymentMethod.toLowerCase().includes('cash') ? 'COD' : 'Paid')
  ).trim();

  // 13. Order Status
  const orderStatus = String(
    raw.order_status || raw.orderStatus || raw.OrderStatus || raw.status || raw.col_14 || 'Order Placed'
  ).trim();

  // 14. Date
  let dateStr = raw.date || raw.created_at || raw.createdAt || raw.timestamp || raw.col_0 || '';
  if (!dateStr) {
    dateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
  }

  // 15. Courier & Tracking details
  const courier = String(
    raw.courier || raw.courier_name || raw.courierName || raw.consignment_id || raw.col_17 || 'Steadfast / Pathao Express'
  ).trim();

  // 16. Items array
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
    order_id: orderId || ("ORD-" + Math.floor(100000 + Math.random() * 900000)),
    customer_name: customerName,
    phone: phone,
    address: address,
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
    account_type: raw.account_type || raw.col_2 || 'Customer',
    reseller_commission: raw.reseller_commission || raw.col_15 || 0,
    commission_status: raw.commission_status || raw.col_16 || 'Pending'
  };
}

/**
 * Main render function for Order Tracking Page
 */
export async function renderTrackOrderPage(orderIdOrPhone = "") {
  // 1. Resolve search parameter from argument or URL
  let searchVal = "";
  if (typeof orderIdOrPhone === 'object' && orderIdOrPhone !== null) {
    searchVal = orderIdOrPhone.orderId || orderIdOrPhone.order_id || orderIdOrPhone.phone || orderIdOrPhone.query || "";
  } else {
    searchVal = (orderIdOrPhone || "").toString();
  }

  if (!searchVal && typeof window !== 'undefined' && window.location) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      searchVal = urlParams.get('orderId') || urlParams.get('order_id') || urlParams.get('phone') || urlParams.get('q') || '';
    } catch (e) {}
  }

  const queryStr = searchVal.trim();
  const queryStrLower = queryStr.toLowerCase();
  const isSearched = !!queryStr;

  let matchedOrder = null;
  let isNotFound = false;

  // 2. Perform search ONLY IF user explicitly requested a search
  // Privacy Enforcement: No default order, no recent orders of others displayed!
  if (isSearched) {
    // A. Check local cache first for instant response
    let localOrders = [];
    try {
      const rawLocal = localStorage.getItem('dcbd_sheet_orders');
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed)) localOrders = parsed;
      }
    } catch (e) {}

    if (apiClient && Array.isArray(apiClient.sheetOrders) && apiClient.sheetOrders.length > 0) {
      apiClient.sheetOrders.forEach(so => {
        const soId = String(so.order_id || so.orderId || '').trim().toLowerCase();
        if (soId && !localOrders.some(lo => String(lo.order_id || lo.orderId || '').trim().toLowerCase() === soId)) {
          localOrders.push(so);
        }
      });
    }

    try {
      const lastOrder = JSON.parse(localStorage.getItem('dcbd_last_order') || 'null');
      if (lastOrder) {
        const loId = String(lastOrder.order_id || lastOrder.orderId || '').trim().toLowerCase();
        if (loId && !localOrders.some(o => String(o.order_id || o.orderId || '').trim().toLowerCase() === loId)) {
          localOrders.unshift(lastOrder);
        }
      }
    } catch (e) {}

    if (localOrders.length > 0) {
      const cleanQuery = queryStrLower.replace(/[^0-9]/g, '');
      const localMatch = localOrders.find(o => {
        const oId = String(o.order_id || o.orderId || o.orderid || o.col_1 || '').trim().toLowerCase();
        const oPhone = String(o.phone || o.customer_phone || o.col_4 || '').replace(/[^0-9]/g, '');
        return (oId && (oId === queryStrLower || oId.includes(queryStrLower))) ||
               (cleanQuery.length >= 6 && oPhone && (oPhone === cleanQuery || oPhone.includes(cleanQuery)));
      });
      if (localMatch) {
        matchedOrder = normalizeSheetOrder(localMatch);
      }
    }

    // B. Query Google Sheets live Orders sheet
    if (!matchedOrder) {
      try {
        // Targeted single order lookup
        try {
          const getPromise = apiClient.request("orders/get", { orderId: queryStr, phone: queryStr });
          const timeoutPromise = new Promise(r => setTimeout(() => r(null), 3500));
          const res = await Promise.race([getPromise, timeoutPromise]);
          if (res && res.data) {
            matchedOrder = normalizeSheetOrder(res.data);
          }
        } catch (e) {}

        // Fallback to searching through full sheet orders list
        if (!matchedOrder) {
          const listPromise = apiClient.request("orders/list");
          const timeoutPromise = new Promise(r => setTimeout(() => r(null), 3800));
          const listRes = await Promise.race([listPromise, timeoutPromise]);

          if (listRes && listRes.data && Array.isArray(listRes.data.items) && listRes.data.items.length > 0) {
            const sheetOrdersList = listRes.data.items;
            const cleanQuery = queryStrLower.replace(/[^0-9]/g, '');
            const sheetMatch = sheetOrdersList.find(r => {
              const rId = String(r.orderid || r.order_id || r.col_1 || '').trim().toLowerCase();
              const rPhone = String(r.phone || r.col_4 || '').replace(/[^0-9]/g, '');
              return (rId && (rId === queryStrLower || rId.includes(queryStrLower))) ||
                     (cleanQuery.length >= 6 && rPhone && (rPhone === cleanQuery || rPhone.includes(cleanQuery)));
            });
            if (sheetMatch) {
              matchedOrder = normalizeSheetOrder(sheetMatch);
            }
          }
        }
      } catch (e) {}
    }

    if (!matchedOrder) {
      isNotFound = true;
    }
  }

  // Pre-calculate properties only if an order was matched
  let status = "";
  let isCancelled = false;
  let items = [];
  let subtotal = 0;
  let totalAmount = 0;
  let deliveryFee = 0;
  let displayOrderId = "";
  let dateStr = "";
  let productSummary = "";
  let steps = [];
  let activeCount = 0;
  let progressPercent = 0;
  let isDelivered = false;
  let isInTransit = false;
  let isConfirmed = false;

  if (matchedOrder) {
    status = matchedOrder.order_status || "Order Placed";
    isCancelled = ["cancelled", "বাতিল", "rejected"].some(c => status.toLowerCase().includes(c));

    items = Array.isArray(matchedOrder.items) && matchedOrder.items.length > 0 ? matchedOrder.items : (
      matchedOrder.products ? [{
        name: matchedOrder.products,
        sku: matchedOrder.color ? `${matchedOrder.color} / ${matchedOrder.size || 'Std'}` : "DCBD-ITEM",
        quantity: matchedOrder.quantity || 1,
        price: matchedOrder.total_amount || 0
      }] : []
    );

    subtotal = items.reduce((s, it) => s + (Number(it.price) * Number(it.quantity || 1)), 0);
    totalAmount = Number(matchedOrder.total_amount !== undefined ? matchedOrder.total_amount : subtotal);
    deliveryFee = matchedOrder.delivery_charge !== undefined
      ? Number(matchedOrder.delivery_charge)
      : (matchedOrder.delivery_fee !== undefined
          ? Number(matchedOrder.delivery_fee)
          : (subtotal >= 2000 ? 0 : Math.max(0, totalAmount - subtotal)));

    displayOrderId = matchedOrder.order_id;
    dateStr = matchedOrder.date || new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    productSummary = items.length > 0
      ? items.map(it => `${it.name}${it.quantity > 1 ? ` (${it.quantity} টি)` : ''}`).join(', ')
      : (matchedOrder.products || "পণ্য সমাহার");

    steps = [
      {
        stepNum: 1,
        title: "Order Placed & Recorded",
        titleBn: "অর্ডার গ্রহণ ও সিস্টেম এন্ট্রি",
        desc: "অর্ডারটি সফলভাবে ড্রিম কার্ট বিডি সিস্টেমে গ্রহণ ও লিপিবদ্ধ করা হয়েছে",
        active: !isCancelled
      },
      {
        stepNum: 2,
        title: "Confirmed & Quality Packaged",
        titleBn: "অর্ডার নিশ্চিত ও মান যাচাই সম্পন্ন",
        desc: "পদুয়ার বাজার কুমিল্লা হাব থেকে প্রোডাক্ট কোয়ালিটি চেক ও সিকিউর প্যাকিং সম্পন্ন",
        active: !isCancelled && ["Confirmed", "Processing", "Packing", "Packed", "Ready to Ship", "Shipped", "In Transit", "Arrived at Hub", "Out for Delivery", "Delivered", "Completed", "কনফার্মড", "প্রসেসিং"].some(s => status.toLowerCase().includes(s.toLowerCase()))
      },
      {
        stepNum: 3,
        title: "Handed over to Courier (In Transit)",
        titleBn: "কুরিয়ার পার্টনারে হস্তান্তর ও ট্রানজিট",
        desc: "পার্সেলটি বিশ্বস্ত কুরিয়ার নেটওয়ার্কে (Steadfast / Pathao) হস্তান্তরিত ও ট্রানজিটে রয়েছে",
        active: !isCancelled && ["Shipped", "In Transit", "Arrived at Hub", "Out for Delivery", "Delivered", "Completed", "অন ট্রানজিট"].some(s => status.toLowerCase().includes(s.toLowerCase()))
      },
      {
        stepNum: 4,
        title: "Out for Delivery (Rider en route)",
        titleBn: "ডেলিভারি রাইডারের নিকট হস্তান্তর",
        desc: "কুরিয়ার ডেলিভারি রাইডার গ্রাহকের গন্তব্যে পৌঁছানোর জন্য পথে রয়েছে",
        active: !isCancelled && ["Out for Delivery", "Delivered", "Completed", "রাইডার পথে"].some(s => status.toLowerCase().includes(s.toLowerCase()))
      },
      {
        stepNum: 5,
        title: "Delivered & Payment Verified",
        titleBn: "সফল ডেলিভারি ও মূল্য পরিশোধ সম্পন্ন",
        desc: "গ্রাহকের নিকট পার্সেল সফলভাবে হস্তান্তর এবং পেমেন্ট সম্পন্ন হয়েছে",
        active: !isCancelled && ["Delivered", "Completed", "ডেলিভারি সম্পন্ন"].some(s => status.toLowerCase().includes(s.toLowerCase()))
      }
    ];

    activeCount = steps.filter(s => s.active).length;
    progressPercent = activeCount > 1 ? Math.min(100, Math.round(((activeCount - 1) / (steps.length - 1)) * 100)) : 0;

    isDelivered = status.toLowerCase().includes("deliver") || status.toLowerCase().includes("completed");
    isInTransit = status.toLowerCase().includes("transit") || status.toLowerCase().includes("shipped");
    isConfirmed = status.toLowerCase().includes("confirm") || status.toLowerCase().includes("pack") || status.toLowerCase().includes("process");
  }

  const statusToneClass = isCancelled
    ? 'tr-status-cancelled'
    : isDelivered
      ? 'tr-status-delivered'
      : isInTransit
        ? 'tr-status-transit'
        : isConfirmed
          ? 'tr-status-confirmed'
          : 'tr-status-pending';

  return `
    <style id="track-page-custom-styles">
      @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

      /* ============================================================
         DREAM CART BD — 3D PROFESSIONAL ORDER TRACKING DESIGN SYSTEM
         100% Self-Contained Scoped Styles | Light & Dark Mode Ready
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
          0 16px 34px -10px rgba(15, 23, 42, 0.1);
        --tr-shadow-card-hover:
          0 1px 0 rgba(255, 255, 255, 1) inset,
          0 8px 0 -2px rgba(16, 185, 129, 0.28),
          0 24px 44px -12px rgba(16, 185, 129, 0.22);

        font-family: var(--tr-font);
        max-width: 1020px;
        margin: 0 auto;
        padding: 18px 14px 96px;
        color: var(--tr-text-body);
        box-sizing: border-box;
        perspective: 1200px;
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
          0 18px 40px -10px rgba(0, 0, 0, 0.58);
        --tr-shadow-card-hover:
          0 1px 0 rgba(52, 211, 153, 0.16) inset,
          0 8px 0 -2px rgba(16, 185, 129, 0.26),
          0 24px 48px -12px rgba(16, 185, 129, 0.25);
      }

      @media (min-width: 640px) {
        .tr-page-root {
          padding: 28px 24px 110px;
        }
      }

      /* Keyframe Animations */
      @keyframes trCardReveal {
        0% {
          opacity: 0;
          transform: translateY(22px) scale(0.985);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes trFloatOrb {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(-16px, 14px, 0) scale(1.08); }
      }

      @keyframes trPulseDot {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
        }
        50% {
          transform: scale(1.15);
          box-shadow: 0 0 0 7px rgba(52, 211, 153, 0);
        }
      }

      @keyframes trBeaconWave {
        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.65); }
        70% { box-shadow: 0 0 0 13px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
      }

      @keyframes trShimmer {
        0% { transform: translateX(-120%) skewX(-20deg); }
        100% { transform: translateX(260%) skewX(-20deg); }
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
          0 26px 52px -14px rgba(2, 6, 23, 0.55);
        animation: trCardReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
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
        background: radial-gradient(circle, rgba(16, 185, 129, 0.38) 0%, transparent 70%);
        filter: blur(32px);
        pointer-events: none;
        animation: trFloatOrb 7s ease-in-out infinite;
      }

      .tr-hero-orb-2 {
        position: absolute;
        bottom: -75px;
        left: -40px;
        width: 220px;
        height: 220px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(56, 189, 248, 0.26) 0%, transparent 70%);
        filter: blur(34px);
        pointer-events: none;
        animation: trFloatOrb 9s ease-in-out infinite reverse;
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
        overflow: hidden;
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
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.22);
      }

      .tr-live-pill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 45%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
        animation: trShimmer 4.5s ease-in-out infinite;
      }

      .tr-live-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #34d399;
        animation: trPulseDot 1.9s infinite;
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
        background: rgba(15, 23, 42, 0.55);
        border: 1px solid rgba(52, 211, 153, 0.35);
        color: #a7f3d0;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(8px);
      }

      /* ==================== 2. 3D BASE CARDS ==================== */
      .tr-card {
        position: relative;
        background: var(--tr-surface);
        border: 1px solid var(--tr-border);
        border-radius: 24px;
        padding: 24px 20px;
        box-shadow: var(--tr-shadow-card);
        transition:
          transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.28s ease,
          border-color 0.25s ease;
        animation: trCardReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
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
        transition: border-color 0.22s ease, box-shadow 0.22s ease;
      }

      .tr-search-input::placeholder {
        color: var(--tr-text-muted);
        font-weight: 400;
        font-family: var(--tr-font);
      }

      .tr-search-input:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.18);
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
          0 12px 24px rgba(16, 185, 129, 0.35);
        transition:
          transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.18s ease,
          background 0.18s ease;
      }

      .tr-btn-3d-primary:hover {
        transform: translateY(-2px);
        background: linear-gradient(180deg, #34d399 0%, #059669 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.4) inset,
          0 7px 0 #047857,
          0 16px 30px rgba(16, 185, 129, 0.42);
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
        transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s ease, box-shadow 0.25s ease;
        animation: trCardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .tr-feature-card:hover {
        transform: translateY(-5px);
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
        transition: transform 0.25s ease;
      }

      .tr-feature-card:hover .tr-feature-icon {
        transform: scale(1.08) rotate(-5deg);
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

      /* Guide Section */
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
        transition: transform 0.2s ease, border-color 0.2s ease;
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

      /* Hotline Footer Strip */
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
        transition:
          transform 0.16s cubic-bezier(0.22, 1, 0.36, 1),
          box-shadow 0.16s ease,
          border-color 0.16s ease,
          background 0.16s ease,
          color 0.16s ease;
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
        box-shadow: 0 4px 14px -4px rgba(0, 0, 0, 0.12);
      }

      .tr-status-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        animation: trPulseDot 1.8s infinite;
      }

      .tr-status-delivered {
        background: #ecfdf5;
        color: #065f46;
        border-color: #6ee7b7;
      }
      .tr-status-delivered .tr-status-dot { background: #10b981; }
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
      .tr-status-cancelled .tr-status-dot { background: #e11d48; }
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

      /* Courier Hub 3D Banner */
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
        box-shadow: 0 4px 0 #047857, 0 8px 18px rgba(16, 185, 129, 0.28);
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

      /* Cancelled Warning Box */
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
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .tr-progress-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--tr-text-main);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tr-progress-pct {
        padding: 4px 12px;
        border-radius: 999px;
        background: rgba(16, 185, 129, 0.14);
        border: 1px solid rgba(16, 185, 129, 0.32);
        color: var(--tr-emerald-dark);
        font-size: 13px;
        font-weight: 700;
      }

      .dark .tr-progress-pct {
        color: #34d399;
      }

      .tr-progress-bar-bg {
        width: 100%;
        height: 10px;
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
        transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
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
        transition: height 0.6s ease;
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
        transition: transform 0.25s ease;
      }

      .tr-step-bullet.active {
        background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        border: 2px solid #a7f3d0;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.38);
      }

      .tr-step-bullet.current-pulse {
        animation: trBeaconWave 2s infinite;
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
        transition: transform 0.2s ease, border-color 0.2s ease;
      }

      .dark .tr-step-card {
        box-shadow: 0 3px 0 -1px #020617;
      }

      .tr-step-card.is-active {
        border-left: 4px solid #10b981;
      }

      .tr-step-card.is-current {
        border-color: #10b981;
        box-shadow: 0 4px 0 -1px rgba(16, 185, 129, 0.28), 0 10px 24px -8px rgba(16, 185, 129, 0.2);
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
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
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

      /* Voucher Section Container */
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

      /* White Paper Voucher Card (always white paper across both themes) */
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

      /* Print isolation via @media print */
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
    </style>

    <div id="track-main-container" class="tr-page-root">
      <div class="tr-stack">

        <!-- 1. 3D Luxury Hero Banner -->
        <section class="tr-hero print-hide">
          <div class="tr-hero-orb-1"></div>
          <div class="tr-hero-orb-2"></div>
          <div class="tr-hero-grid"></div>

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

            <!-- Privacy & Security Guarantee Badge -->
            <div class="tr-privacy-pill">
              <span>🔒</span>
              <span>গ্রাহক গোপনীয়তা সুরক্ষিত • আপনার তথ্য অন্য কারো কাছে দৃশ্যমান নয়</span>
            </div>
          </div>
        </section>

        <!-- 2. Main 3D Search Bar Card -->
        <section class="tr-card tr-search-card print-hide">
          <form
            id="tracking-search-form"
            class="tr-search-form"
            onsubmit="event.preventDefault(); const val = document.getElementById('track-input').value.trim(); if(val) { if(window.router && window.router.navigate) { window.router.navigate('/track?orderId=' + encodeURIComponent(val)); } else { window.location.href='/track?orderId=' + encodeURIComponent(val); } }"
          >
            <div class="tr-input-wrap">
              <span class="tr-input-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                id="track-input"
                placeholder="অর্ডার আইডি (যেমন: ORD-XXXXXX) বা মোবাইল নম্বর (যেমন: 01XXXXXXXXX)"
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
            <span>টিপস: অর্ডার কনফার্মেশনের সময় প্রাপ্ত ৬ ডিজিটের আইডি অথবা আপনার ফোন নম্বর দিয়ে সার্চ করুন।</span>
          </div>
        </section>

        ${!isSearched ? `
          <!-- INITIAL WELCOME / INSTRUCTIONS STATE (No Default Order Displayed for Privacy) -->

          <!-- 3D Feature Highlight Boxes -->
          <section class="tr-features-grid print-hide">
            <article class="tr-feature-card">
              <div class="tr-feature-icon tr-icon-emerald">⚡</div>
              <h3 class="tr-feature-title">রিয়েল-টাইম স্ট্যাটাস</h3>
              <p class="tr-feature-desc">
                পদুয়ার বাজার কুমিল্লা হাব থেকে পার্সেল প্যাকিং ও কুরিয়ার ট্রানজিটের প্রতিটি ধাপ সরাসরি লাইভ দেখুন।
              </p>
            </article>

            <article class="tr-feature-card">
              <div class="tr-feature-icon tr-icon-blue">🚚</div>
              <h3 class="tr-feature-title">দ্রুততম হোম ডেলিভারি</h3>
              <p class="tr-feature-desc">
                Steadfast ও Pathao Express-এর মাধ্যমে ঢাকা ও কুমিল্লায় ২৪-৪৮ ঘণ্টা এবং সারাদেশে ৭২ ঘণ্টায় ডেলিভারি।
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
                <div class="tr-guide-desc">যেকোনো জটিলতায় আমাদের হোয়াটসঅ্যাপ হটলাইনে যোগাযোগ করে আইডি জেনে নিন।</div>
              </div>
            </div>

            <!-- Hotline Support Footer in Welcome View -->
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

        ` : (isNotFound ? `
          <!-- NOT FOUND 3D CARD -->
          <section class="tr-card tr-notfound-card print-hide">
            <div class="tr-notfound-icon">⚠️</div>

            <h3 class="tr-notfound-title">কোনো অর্ডার পাওয়া যায়নি</h3>

            <p class="tr-notfound-desc">
              আপনার প্রদত্ত <span class="tr-query-chip tr-mono">"${escapeHtml(queryStr)}"</span> তথ্য অনুযায়ী আমাদের Orders শিটে কোনো অর্ডার রেকর্ড মেলেনি।
            </p>

            <div class="tr-notfound-tips">
              <div class="tr-notfound-tips-title">কীভাবে নিশ্চিত হবেন:</div>
              <ul class="tr-notfound-list">
                <li>অর্ডার আইডি (যেমন: <strong class="tr-mono">ORD-XXXXXX</strong>) সঠিকভাবে টাইপ করেছেন কিনা দেখে নিন।</li>
                <li>অথবা চেকআউটে ব্যবহৃত <strong>১১ ডিজিটের মোবাইল নম্বর</strong> দিয়ে পুনরায় সার্চ করুন।</li>
                <li>সম্প্রতি মাত্র অর্ডার করে থাকলে ২-৩ মিনিট পর আবার সার্চ করুন।</li>
              </ul>
            </div>

            <div class="tr-action-row">
              <a
                href="https://wa.me/8801581703822?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি আমার অর্ডার #' + queryStr + ' ট্র্যাক করতে পারছি না। দয়া করে সাহায্য করবেন?')}"
                target="_blank"
                rel="noopener noreferrer"
                class="tr-btn-3d tr-btn-emerald"
              >
                <span>💬</span>
                <span>হোয়াটসঅ্যাপ হটলাইনে সহায়তা নিন (01581703822)</span>
              </a>
              <a href="/track" class="tr-btn-3d">
                <span>🔄</span>
                <span>নতুন সার্চ করুন</span>
              </a>
            </div>
          </section>

        ` : `
          <!-- LIVE ORDER TRACKING DETAILS 3D CARD (SHOWN ONLY TO MATCHED CUSTOMER) -->
          <section class="tr-card print-hide">

            <!-- Top Order Header & Status Banner -->
            <div class="tr-order-top">
              <div>
                <div class="tr-order-id-row">
                  <span class="tr-order-id-label">অর্ডার আইডি:</span>
                  <span class="tr-order-id-val tr-mono">#${escapeHtml(displayOrderId)}</span>
                  <button
                    type="button"
                    class="tr-btn-copy"
                    onclick="window.copyOrderIdToClipboard('${escapeHtml(displayOrderId)}', this)"
                    title="অর্ডার আইডি কপি করুন"
                  >
                    <span>📋</span>
                    <span>কপি</span>
                  </button>
                </div>

                <div class="tr-order-date">
                  <span>📅</span>
                  <span>তারিখ: <strong>${escapeHtml(dateStr)}</strong></span>
                </div>
              </div>

              <!-- Status Badge Pill -->
              <div class="tr-status-wrap">
                <span class="tr-status-badge ${statusToneClass}">
                  <span class="tr-status-dot"></span>
                  <span>${escapeHtml(status)}</span>
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
                    ডেলিভারি নেটওয়ার্ক:
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
                  <span>লাইভ আপডেট</span>
                </a>
              </div>
            </div>

            ${isCancelled ? `
              <!-- CANCELLED WARNING -->
              <div class="tr-cancelled-box">
                <span style="font-size:26px; line-height:1;">⚠️</span>
                <div>
                  <strong>এই অর্ডারটি বাতিল (Cancelled) করা হয়েছে।</strong><br/>
                  বিস্তারিত জানতে বা অর্ডারটি পুনরায় সক্রিয় করতে আমাদের হটলাইনে যোগাযোগ করুন: <strong>01581703822</strong> বা <strong>01818273838</strong>।
                </div>
              </div>
            ` : `
              <!-- 3D VISUAL TIMELINE STEPPER -->
              <div class="tr-timeline-card">
                <div class="tr-progress-head">
                  <div class="tr-progress-title">
                    <span>📍</span>
                    <span>পার্সেল অগ্রগতি ট্র্যাকার</span>
                  </div>
                  <span class="tr-progress-pct tr-mono">${progressPercent}% সম্পন্ন</span>
                </div>

                <div class="tr-progress-bar-bg">
                  <div class="tr-progress-bar-fill" style="width: ${progressPercent}%;"></div>
                </div>

                <div class="tr-timeline">
                  <div class="tr-timeline-track">
                    <div class="tr-timeline-progress" style="height: ${progressPercent}%;"></div>
                  </div>

                  ${steps.map((st, idx) => {
                    const isCurrent = st.active && (!steps[idx + 1] || !steps[idx + 1].active);
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
                            <span class="tr-step-badge ${
                              st.active
                                ? (isCurrent ? 'tr-step-badge-current' : 'tr-step-badge-done')
                                : 'tr-step-badge-wait'
                            }">
                              ${st.active ? (isCurrent ? 'চলমান ⏳' : 'সম্পন্ন ✓') : 'অপেক্ষমাণ'}
                            </span>
                          </div>
                          <div class="tr-step-desc ${st.active ? '' : 'muted'}">
                            ${st.desc}
                          </div>
                        </div>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            `}

            <!-- Customer & Order Information Grid (Two-column) -->
            <div class="tr-info-grid">
              <!-- Left: Delivery & Customer Info -->
              <div class="tr-info-box">
                <div class="tr-info-head">
                  <span>📍</span>
                  <span>ডেলিভারি ও গ্রাহক তথ্য</span>
                </div>
                <div class="tr-kv-list">
                  <div class="tr-kv-row">
                    <span class="tr-kv-key">গ্রাহকের নাম:</span>
                    <span class="tr-kv-val">${escapeHtml(matchedOrder.customer_name || "সম্মানিত গ্রাহক")}</span>
                  </div>
                  <div class="tr-kv-row">
                    <span class="tr-kv-key">মোবাইল নম্বর:</span>
                    <a href="tel:${escapeHtml(matchedOrder.phone)}" class="tr-kv-val tr-kv-link tr-mono">${escapeHtml(matchedOrder.phone || "01700000000")}</a>
                  </div>
                  <div class="tr-kv-row">
                    <span class="tr-kv-key">ডেলিভারি ঠিকানা:</span>
                    <span class="tr-kv-val">${escapeHtml(matchedOrder.address || "বাংলাদেশ")}</span>
                  </div>
                  <div class="tr-kv-row divider">
                    <span class="tr-kv-key">অ্যাকাউন্ট টাইপ:</span>
                    <span class="tr-kv-val">${escapeHtml(matchedOrder.account_type || "Customer")}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Payment & Finance Summary -->
              <div class="tr-info-box">
                <div class="tr-info-head">
                  <span>💳</span>
                  <span>পেমেন্ট ও আর্থিক বিবরণী</span>
                </div>
                <div class="tr-kv-list">
                  <div class="tr-kv-row">
                    <span class="tr-kv-key">পেমেন্ট মেথড:</span>
                    <span class="tr-kv-val">${escapeHtml(matchedOrder.payment_method || "Cash On Delivery (COD)")}</span>
                  </div>
                  <div class="tr-kv-row">
                    <span class="tr-kv-key">পেমেন্ট স্ট্যাটাস:</span>
                    <span class="tr-pay-pill ${matchedOrder.payment_status === 'Paid' ? 'tr-pay-paid' : 'tr-pay-cod'}">
                      ${escapeHtml(matchedOrder.payment_status || "COD")}
                    </span>
                  </div>
                  <div class="tr-kv-row">
                    <span class="tr-kv-key">ট্রানজেকশন আইডি:</span>
                    <span class="tr-kv-val tr-mono">${escapeHtml(matchedOrder.transaction_id || "N/A")}</span>
                  </div>
                  <div class="tr-kv-row divider">
                    <span class="tr-kv-key" style="font-weight:700;">সর্বমোট প্রদেয়:</span>
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
                              ভ্যারিয়েন্ট: ${[it.color, it.size].filter(Boolean).map(escapeHtml).join(' / ')}
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
                    `).join("")}
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
                <span>অফিশিয়াল ইনভয়েস ভাউচার দেখুন / লুকান</span>
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
                <span>পার্সেল বা ডেলিভারি সহায়তায় আমাদের হটলাইন:</span>
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
          <div id="track-voucher-section" class="hidden">
            <div class="tr-voucher-heading print-hide">
              অফিশিয়াল ডিজিটাল ইনভয়েস ভাউচার (A4 প্রিন্ট ফরম্যাট)
            </div>

            ${renderVoucher(matchedOrder, { items, subtotal, deliveryFee, totalAmount, displayOrderId, dateStr })}
          </div>
        `)}

      </div>
    </div>
  `;
}
